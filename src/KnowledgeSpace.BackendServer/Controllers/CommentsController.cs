using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Extensions;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.BackendServer.Services;
using KnowledgeSpace.ViewModels;
using KnowledgeSpace.ViewModels.Contents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers
{
    public class CommentsController : BaseController
    {
        private readonly ApplicationDbContext _context;
        private readonly IStorageService _storageService;

        public CommentsController(ApplicationDbContext context, IStorageService storageService)
        {
            _context = context;
            _storageService = storageService;
        }

        /// <summary>
        /// L?y t?t c? comments c?a m?t báo cáo (h? tr? nested structure)
        /// </summary>
        [HttpGet("/api/reports/{reportId}/comments")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCommentsByReport(long reportId, [FromQuery] bool includeReplies = true)
        {
            var report = await _context.Reports.FindAsync(reportId);
            if (report == null)
                return NotFound(new ApiNotFoundResponse($"Report {reportId} not found"));

            var allComments = await _context.ReportComments
                .Include(c => c.User)
                .Where(c => c.ReportId == reportId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            // L?y roles cho t?t c? users trong m?t l?n query
            var userIds = allComments.Select(c => c.UserId).Distinct().ToList();
            var userRoles = await GetUserRolesAsync(userIds);

            // Build nested structure
            if (includeReplies)
            {
                // Ch? l?y top-level comments (không có parent)
                var topLevelComments = allComments.Where(c => c.ParentCommentId == null).ToList();

                var result = topLevelComments.Select(c => BuildCommentVm(c, allComments, userRoles, baseUrl)).ToList();
                return Ok(result);
            }
            else
            {
                // Flat structure - t?t c? comments
                var result = allComments.Select(c => new ReportCommentVm
                {
                    Id = c.Id,
                    ReportId = c.ReportId,
                    Content = c.Content,
                    ImageUrl = ToAbsoluteUrl(c.ImageUrl, baseUrl),
                    ParentCommentId = c.ParentCommentId,
                    RepliesCount = allComments.Count(r => r.ParentCommentId == c.Id),
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    Author = new CommentAuthorVm
                    {
                        Id = c.UserId,
                        FullName = c.User?.FullName ?? "Unknown",
                        Role = userRoles.ContainsKey(c.UserId) ? userRoles[c.UserId] : "Citizen"
                    }
                }).ToList();

                return Ok(result);
            }
        }

        /// <summary>
        /// T?o comment m?i cho báo cáo (có th? là reply)
        /// </summary>
        [HttpPost("/api/reports/{reportId}/comments")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateComment(long reportId, [FromForm] CreateCommentRequest request)
        {
            var report = await _context.Reports.FindAsync(reportId);
            if (report == null)
                return NotFound(new ApiNotFoundResponse($"Report {reportId} not found"));

            // N?u là reply, ki?m tra parent comment t?n t?i
            if (request.ParentCommentId.HasValue)
            {
                var parentComment = await _context.ReportComments.FindAsync(request.ParentCommentId.Value);
                if (parentComment == null)
                    return NotFound(new ApiNotFoundResponse($"Parent comment {request.ParentCommentId} not found"));

                // ??m b?o parent comment thu?c cùng report
                if (parentComment.ReportId != reportId)
                    return BadRequest(new ApiBadRequestResponse("Parent comment does not belong to this report"));
            }

            var userId = User.GetUserId();

            // Upload image n?u có
            string? imageUrl = null;
            if (request.Image != null && request.Image.Length > 0)
            {
                var extension = Path.GetExtension(request.Image.FileName).ToLowerInvariant();
                var fileName = $"comments/{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid():N}{extension}";
                await using var stream = request.Image.OpenReadStream();
                await _storageService.SaveFileAsync(stream, fileName);
                imageUrl = _storageService.GetFileUrl(fileName);
            }

            var comment = new ReportComment
            {
                ReportId = reportId,
                UserId = userId,
                Content = request.Content,
                ImageUrl = imageUrl,
                ParentCommentId = request.ParentCommentId,
                CreatedAt = DateTime.Now
            };

            _context.ReportComments.Add(comment);
            await _context.SaveChangesAsync();

            // Load l?i ?? có thông tin User
            var createdComment = await _context.ReportComments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == comment.Id);

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var userRole = await GetUserRoleAsync(createdComment!.UserId);

            var result = new ReportCommentVm
            {
                Id = createdComment!.Id,
                ReportId = createdComment.ReportId,
                Content = createdComment.Content,
                ImageUrl = ToAbsoluteUrl(createdComment.ImageUrl, baseUrl),
                ParentCommentId = createdComment.ParentCommentId,
                RepliesCount = 0,
                CreatedAt = createdComment.CreatedAt,
                UpdatedAt = createdComment.UpdatedAt,
                Author = new CommentAuthorVm
                {
                    Id = createdComment.UserId,
                    FullName = createdComment.User?.FullName ?? "Unknown",
                    Role = userRole
                }
            };

            return CreatedAtAction(nameof(GetCommentById), new { commentId = comment.Id }, result);
        }

        /// <summary>
        /// L?y thông tin m?t comment
        /// </summary>
        [HttpGet("/api/comments/{commentId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCommentById(long commentId)
        {
            var comment = await _context.ReportComments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
                return NotFound(new ApiNotFoundResponse($"Comment {commentId} not found"));

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var userRole = await GetUserRoleAsync(comment.UserId);
            var repliesCount = await _context.ReportComments.CountAsync(c => c.ParentCommentId == commentId);

            var result = new ReportCommentVm
            {
                Id = comment.Id,
                ReportId = comment.ReportId,
                Content = comment.Content,
                ImageUrl = ToAbsoluteUrl(comment.ImageUrl, baseUrl),
                ParentCommentId = comment.ParentCommentId,
                RepliesCount = repliesCount,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                Author = new CommentAuthorVm
                {
                    Id = comment.UserId,
                    FullName = comment.User?.FullName ?? "Unknown",
                    Role = userRole
                }
            };

            return Ok(result);
        }

        /// <summary>
        /// C?p nh?t comment (ch? ng??i t?o m?i ???c s?a)
        /// </summary>
        [HttpPut("/api/comments/{commentId}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateComment(long commentId, [FromForm] UpdateCommentRequest request)
        {
            var comment = await _context.ReportComments.FindAsync(commentId);
            if (comment == null)
                return NotFound(new ApiNotFoundResponse($"Comment {commentId} not found"));

            var userId = User.GetUserId();
            if (comment.UserId != userId)
                return Forbid();

            // Upload image m?i n?u có
            if (request.Image != null && request.Image.Length > 0)
            {
                var extension = Path.GetExtension(request.Image.FileName).ToLowerInvariant();
                var fileName = $"comments/{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid():N}{extension}";
                await using var stream = request.Image.OpenReadStream();
                await _storageService.SaveFileAsync(stream, fileName);
                comment.ImageUrl = _storageService.GetFileUrl(fileName);
            }

            comment.Content = request.Content;
            comment.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            // Load l?i ?? có thông tin User
            var updatedComment = await _context.ReportComments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == commentId);

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var userRole = await GetUserRoleAsync(updatedComment!.UserId);
            var repliesCount = await _context.ReportComments.CountAsync(c => c.ParentCommentId == commentId);

            var result = new ReportCommentVm
            {
                Id = updatedComment!.Id,
                ReportId = updatedComment.ReportId,
                Content = updatedComment.Content,
                ImageUrl = ToAbsoluteUrl(updatedComment.ImageUrl, baseUrl),
                ParentCommentId = updatedComment.ParentCommentId,
                RepliesCount = repliesCount,
                CreatedAt = updatedComment.CreatedAt,
                UpdatedAt = updatedComment.UpdatedAt,
                Author = new CommentAuthorVm
                {
                    Id = updatedComment.UserId,
                    FullName = updatedComment.User?.FullName ?? "Unknown",
                    Role = userRole
                }
            };

            return Ok(result);
        }

        /// <summary>
        /// Xóa comment (ch? ng??i t?o ho?c admin m?i ???c xóa)
        /// </summary>
        [HttpDelete("/api/comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(long commentId)
        {
            var comment = await _context.ReportComments.FindAsync(commentId);
            if (comment == null)
                return NotFound(new ApiNotFoundResponse($"Comment {commentId} not found"));

            var userId = User.GetUserId();
            var isAdmin = User.IsInRole("Admin");

            // Ch? ng??i t?o ho?c admin m?i ???c xóa
            if (comment.UserId != userId && !isAdmin)
                return Forbid();

            _context.ReportComments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok();
        }

        /// <summary>
        /// L?y s? l??ng comments c?a m?t báo cáo
        /// </summary>
        [HttpGet("/api/reports/{reportId}/comments/count")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCommentsCount(long reportId)
        {
            var count = await _context.ReportComments
                .Where(c => c.ReportId == reportId)
                .CountAsync();

            return Ok(new { reportId, count });
        }

        // Helper methods
        private static string? ToAbsoluteUrl(string? relativeUrl, string baseUrl)
        {
            if (string.IsNullOrEmpty(relativeUrl))
                return relativeUrl;
            if (relativeUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                return relativeUrl;
            return $"{baseUrl}{relativeUrl}";
        }

        private async Task<string> GetUserRoleAsync(string userId)
        {
            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Join(_context.Roles,
                    ur => ur.RoleId,
                    r => r.Id,
                    (ur, r) => r.Name)
                .ToListAsync();

            if (userRoles.Contains("Admin")) return "Admin";
            if (userRoles.Contains("Staff")) return "Staff";
            if (userRoles.Contains("Team")) return "Team";

            return "Citizen";
        }

        private async Task<Dictionary<string, string>> GetUserRolesAsync(List<string> userIds)
        {
            var userRolesList = await _context.UserRoles
                .Where(ur => userIds.Contains(ur.UserId))
                .Join(_context.Roles,
                    ur => ur.RoleId,
                    r => r.Id,
                    (ur, r) => new { ur.UserId, r.Name })
                .ToListAsync();

            var result = new Dictionary<string, string>();

            foreach (var userId in userIds)
            {
                var roles = userRolesList.Where(ur => ur.UserId == userId).Select(ur => ur.Name).ToList();

                if (roles.Contains("Admin"))
                    result[userId] = "Admin";
                else if (roles.Contains("Staff"))
                    result[userId] = "Staff";
                else if (roles.Contains("Team"))
                    result[userId] = "Team";
                else
                    result[userId] = "Citizen";
            }

            return result;
        }

        private ReportCommentVm BuildCommentVm(
            ReportComment comment,
            List<ReportComment> allComments,
            Dictionary<string, string> userRoles,
            string baseUrl)
        {
            var replies = allComments
                .Where(c => c.ParentCommentId == comment.Id)
                .Select(c => BuildCommentVm(c, allComments, userRoles, baseUrl))
                .ToList();

            return new ReportCommentVm
            {
                Id = comment.Id,
                ReportId = comment.ReportId,
                Content = comment.Content,
                ImageUrl = ToAbsoluteUrl(comment.ImageUrl, baseUrl),
                ParentCommentId = comment.ParentCommentId,
                RepliesCount = replies.Count,
                Replies = replies.Any() ? replies : null,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                Author = new CommentAuthorVm
                {
                    Id = comment.UserId,
                    FullName = comment.User?.FullName ?? "Unknown",
                    Role = userRoles.ContainsKey(comment.UserId) ? userRoles[comment.UserId] : "Citizen"
                }
            };
        }
    }
}
