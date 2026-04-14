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
    public class ReportsController : BaseController
    {
        private readonly ApplicationDbContext _context;
        private readonly IStorageService _storageService;

        public ReportsController(ApplicationDbContext context, IStorageService storageService)
        {
            _context = context;
            _storageService = storageService;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateReportRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiBadRequestResponse(ModelState));
            }

            string? imageUrl = null;
            if (request.Image != null && request.Image.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(request.Image.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new { message = "Định dạng ảnh không được hỗ trợ" });

                var fileName = $"{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid():N}{extension}";
                await using var stream = request.Image.OpenReadStream();
                await _storageService.SaveFileAsync(stream, fileName);
                imageUrl = _storageService.GetFileUrl(fileName);
            }

            var userId = User.GetUserId();
            var report = new Report
            {
                UserId = userId,
                Description = request.Description,
                ImageUrl = imageUrl,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                WardId = request.WardId,
                CategoryId = request.CategoryId,
                Priority = (ReportPriority)request.Priority,
                Status = ReportStatus.Submitted,
                CreatedAt = DateTime.Now
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            _context.ReportProgresses.Add(new ReportProgress
            {
                ReportId = report.Id,
                Status = ReportStatus.Submitted,
                Note = "Báo cáo đã được gửi",
                UpdatedBy = userId
            });
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = report.Id }, report);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll(int? wardId, int? categoryId, int? status, int? priority, int pageIndex = 1, int pageSize = 20)
        {
            var query = _context.Reports
                .Include(r => r.User)
                .Include(r => r.Category)
                .Include(r => r.Ward)
                .Include(r => r.AssignedTeam)
                .AsQueryable();

            if (wardId.HasValue) query = query.Where(r => r.WardId == wardId.Value);
            if (categoryId.HasValue) query = query.Where(r => r.CategoryId == categoryId.Value);
            if (status.HasValue) query = query.Where(r => (int)r.Status == status.Value);
            if (priority.HasValue) query = query.Where(r => (int)r.Priority == priority.Value);

            var totalRecords = await query.CountAsync();
            var items = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            foreach (var item in items)
            {
                item.ImageUrl = ToAbsoluteUrl(item.ImageUrl, baseUrl);
            }

            return Ok(new Pagination<Report> { Items = items, TotalRecords = totalRecords });
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyReports()
        {
            var userId = User.GetUserId();
            var reports = await _context.Reports
                .Include(r => r.Category)
                .Include(r => r.Ward)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            foreach (var item in reports)
            {
                item.ImageUrl = ToAbsoluteUrl(item.ImageUrl, baseUrl);
            }

            return Ok(reports);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(long id)
        {
            var report = await _context.Reports
                .Include(r => r.User)
                .Include(r => r.Category)
                .Include(r => r.Ward)
                .Include(r => r.AssignedTeam)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (report == null)
                return NotFound(new ApiNotFoundResponse($"Report {id} not found"));

            report.ImageUrl = ToAbsoluteUrl(report.ImageUrl, $"{Request.Scheme}://{Request.Host}");
            return Ok(report);
        }

        [HttpGet("{id}/progress")]
        public async Task<IActionResult> GetProgress(long id)
        {
            var progress = await _context.ReportProgresses
                .Include(p => p.UpdatedByUser)
                .Where(p => p.ReportId == id)
                .OrderBy(p => p.UpdatedAt)
                .ToListAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            foreach (var item in progress)
            {
                item.ImageAfterUrl = ToAbsoluteUrl(item.ImageAfterUrl, baseUrl);
            }

            return Ok(progress);
        }

        [HttpPost("{id}/status")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateStatus(long id, [FromForm] UpdateStatusRequest request)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null)
                return NotFound(new ApiNotFoundResponse($"Report {id} not found"));

            string? imageAfterUrl = null;
            if (request.ImageAfter != null && request.ImageAfter.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(request.ImageAfter.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new { message = "Định dạng ảnh không được hỗ trợ" });

                var fileName = $"{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid():N}{extension}";
                await using var stream = request.ImageAfter.OpenReadStream();
                await _storageService.SaveFileAsync(stream, fileName);
                imageAfterUrl = _storageService.GetFileUrl(fileName);
            }

            var userId = User.GetUserId();
            report.Status = (ReportStatus)request.Status;
            report.UpdatedAt = DateTime.Now;

            if ((ReportStatus)request.Status == ReportStatus.InProgress)
                report.ProcessedAt = DateTime.Now;
            if ((ReportStatus)request.Status == ReportStatus.Completed)
            {
                report.CompletedAt = DateTime.Now;

                var greenPoint = new UserGreenPoint
                {
                    UserId = report.UserId,
                    Points = 10,
                    Reason = "Báo cáo được xử lý hoàn thành",
                    ReportId = report.Id
                };
                _context.UserGreenPoints.Add(greenPoint);

                var user = await _context.Users.FindAsync(report.UserId);
                if (user != null) user.TotalGreenPoints += 10;
            }

            _context.ReportProgresses.Add(new ReportProgress
            {
                ReportId = id,
                Status = (ReportStatus)request.Status,
                Note = request.Note,
                ImageAfterUrl = imageAfterUrl,
                UpdatedBy = userId
            });

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("{id}/assign")]
        public async Task<IActionResult> AssignTeam(long id, [FromBody] AssignTeamRequest request)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null)
                return NotFound(new ApiNotFoundResponse($"Report {id} not found"));

            report.AssignedTeamId = request.TeamId;
            if (report.Status == ReportStatus.Submitted)
                report.Status = ReportStatus.Received;
            report.UpdatedAt = DateTime.Now;

            _context.ReportProgresses.Add(new ReportProgress
            {
                ReportId = id,
                Status = ReportStatus.Received,
                Note = $"Đã giao cho đội: {request.TeamId}",
                UpdatedBy = User.GetUserId()
            });

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats(int? wardId, int? categoryId, int? priority)
        {
            var query = _context.Reports.AsQueryable();
            if (wardId.HasValue) query = query.Where(r => r.WardId == wardId.Value);
            if (categoryId.HasValue) query = query.Where(r => r.CategoryId == categoryId.Value);
            if (priority.HasValue) query = query.Where(r => (int)r.Priority == priority.Value);

            var total = await query.CountAsync();
            var inProgress = await query.CountAsync(r => r.Status == ReportStatus.InProgress);
            var completed = await query.CountAsync(r => r.Status == ReportStatus.Completed);
            var rejected = await query.CountAsync(r => r.Status == ReportStatus.Rejected);

            return Ok(new
            {
                total,
                inProgress,
                completed,
                rejected
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null)
                return NotFound(new ApiNotFoundResponse($"Report {id} not found"));
            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();
            return Ok();
        }

        private static string? ToAbsoluteUrl(string? relativeUrl, string baseUrl)
        {
            if (string.IsNullOrEmpty(relativeUrl))
                return relativeUrl;
            if (relativeUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                return relativeUrl;
            return $"{baseUrl}{relativeUrl}";
        }
    }

    public class UpdateStatusRequest
    {
        public int Status { get; set; }
        public string? Note { get; set; }
        public IFormFile? ImageAfter { get; set; }
    }

    public class AssignTeamRequest
    {
        public int TeamId { get; set; }
    }
}
