using KnowledgeSpace.BackendServer.Authorization;
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
        [Permission("Reports.Create")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateReportRequest request)
        {
            string? imageUrl = null;
            if (request.Image != null && request.Image.Length > 0)
            {
                var extension = Path.GetExtension(request.Image.FileName).ToLowerInvariant();
                var fileName = $"reports/{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid():N}{extension}";
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

            var user = await _context.Users
                            .Where(x => x.Id == userId)
                            .Select(x => new
                            {
                                x.FullName
                            })
                            .FirstOrDefaultAsync();
            var fullName = user?.FullName;
            _context.ReportProgresses.Add(new ReportProgress
            {
                ReportId = report.Id,
                Status = ReportStatus.Submitted,
                Note = "Báo cáo đã được gửi",
                UpdatedBy = userId,
                UpdatedByName = fullName,
                UpdatedAt = DateTime.Now
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
                .Include(r => r.Team)
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
                .Include(r => r.Team)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (report == null)
                return NotFound(new ApiNotFoundResponse($"Report {id} not found"));

            report.ImageUrl = ToAbsoluteUrl(report.ImageUrl, $"{Request.Scheme}://{Request.Host}");
            return Ok(report);
        }

        [HttpGet("{id}/progress")]
        public async Task<IActionResult> GetProgress(long id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null)
                return NotFound(new ApiNotFoundResponse($"Report {id} not found"));

            // Kiểm tra xem báo cáo có thuộc về user hiện tại không
            var userId = User.GetUserId();
            if (report.UserId != userId)
                return Forbid();

            var progress = await _context.ReportProgresses
                .Include(p => p.UpdatedByUser)
                .Where(p => p.ReportId == id)
                .OrderBy(p => p.UpdatedAt)
                .ToListAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var result = progress.Select(p => new ReportProgressVm
            {
                Id = p.Id,
                ReportId = p.ReportId,
                Status = (int)p.Status,
                StatusName = GetStatusName(p.Status),
                Note = p.Note,
                Description = p.Description,
                ImageAfterUrl = ToAbsoluteUrl(p.ImageAfterUrl, baseUrl),
                UpdatedBy = p.UpdatedBy,
                UpdatedByName = p.UpdatedByName,
                UpdatedAt = p.UpdatedAt
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}/current-status")]
        public async Task<IActionResult> GetCurrentStatus(long id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null)
                return NotFound(new ApiNotFoundResponse($"Report {id} not found"));

            // Kiểm tra xem báo cáo có thuộc về user hiện tại không
            var userId = User.GetUserId();
            if (report.UserId != userId)
                return Forbid();

            var latestProgress = await _context.ReportProgresses
                .Include(p => p.UpdatedByUser)
                .Where(p => p.ReportId == id)
                .OrderByDescending(p => p.UpdatedAt)
                .FirstOrDefaultAsync();

            if (latestProgress == null)
                return NotFound(new ApiNotFoundResponse($"No progress found for report {id}"));

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var result = new ReportProgressVm
            {
                Id = latestProgress.Id,
                ReportId = latestProgress.ReportId,
                Status = (int)latestProgress.Status,
                StatusName = GetStatusName(latestProgress.Status),
                Note = latestProgress.Note,
                Description = latestProgress.Description,
                ImageAfterUrl = ToAbsoluteUrl(latestProgress.ImageAfterUrl, baseUrl),
                UpdatedBy = latestProgress.UpdatedBy,
                UpdatedByName = latestProgress.UpdatedByName,
                UpdatedAt = latestProgress.UpdatedAt
            };

            return Ok(result);
        }

        [HttpGet("my-progress")]
        public async Task<IActionResult> GetMyReportsProgress()
        {
            var userId = User.GetUserId();

            // Lấy tất cả báo cáo của user
            var myReportIds = await _context.Reports
                .Where(r => r.UserId == userId)
                .Select(r => r.Id)
                .ToListAsync();

            // Lấy tất cả tiến trình của các báo cáo đó
            var allProgress = await _context.ReportProgresses
                .Include(p => p.UpdatedByUser)
                .Include(p => p.Report)
                .Where(p => myReportIds.Contains(p.ReportId))
                .OrderByDescending(p => p.UpdatedAt)
                .ToListAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var result = allProgress.Select(p => new ReportProgressVm
            {
                Id = p.Id,
                ReportId = p.ReportId,
                Status = (int)p.Status,
                StatusName = GetStatusName(p.Status),
                Note = p.Note,
                Description = p.Description,
                ImageAfterUrl = ToAbsoluteUrl(p.ImageAfterUrl, baseUrl),
                UpdatedBy = p.UpdatedBy,
                UpdatedByName = p.UpdatedByName,
                UpdatedAt = p.UpdatedAt
            }).ToList();

            return Ok(result);
        }

        [HttpGet("my-current-statuses")]
        public async Task<IActionResult> GetMyReportsCurrentStatuses()
        {
            var userId = User.GetUserId();

            // Lấy tất cả báo cáo của user
            var myReports = await _context.Reports
                .Where(r => r.UserId == userId)
                .Select(r => r.Id)
                .ToListAsync();

            // Lấy trạng thái mới nhất của từng báo cáo
            var latestProgresses = await _context.ReportProgresses
                .Include(p => p.UpdatedByUser)
                .Where(p => myReports.Contains(p.ReportId))
                .GroupBy(p => p.ReportId)
                .Select(g => g.OrderByDescending(p => p.UpdatedAt).FirstOrDefault())
                .ToListAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var result = latestProgresses
                .Where(p => p != null)
                .Select(p => new ReportProgressVm
                {
                    Id = p!.Id,
                    ReportId = p.ReportId,
                    Status = (int)p.Status,
                    StatusName = GetStatusName(p.Status),
                    Note = p.Note,
                    Description = p.Description,
                    ImageAfterUrl = ToAbsoluteUrl(p.ImageAfterUrl, baseUrl),
                    UpdatedBy = p.UpdatedBy,
                    UpdatedByName = p.UpdatedByName,
                    UpdatedAt = p.UpdatedAt
                }).ToList();

            return Ok(result);
        }

        [HttpPost("{id}/status")]
        [Permission("Reports.UpdateStatus")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateStatus(long id, [FromForm] UpdateStatusRequest request)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null)
                return NotFound($"Report {id} not found");

            var newStatus = (ReportStatus)request.Status;

            if (newStatus == ReportStatus.InProgress)
                return BadRequest("Use /assign API to set InProgress");

            if (report.Status == ReportStatus.Submitted && newStatus != ReportStatus.Received)
                return BadRequest("Phải tiếp nhận trước");

            if (report.Status == ReportStatus.Received && newStatus == ReportStatus.Completed)
                return BadRequest("Phải giao đội trước khi hoàn thành");

            string? imageAfterUrl = null;
            if (request.ImageAfter != null && request.ImageAfter.Length > 0)
            {
                var extension = Path.GetExtension(request.ImageAfter.FileName);
                var fileName = $"reports/{Guid.NewGuid()}{extension}";
                await using var stream = request.ImageAfter.OpenReadStream();
                await _storageService.SaveFileAsync(stream, fileName);
                imageAfterUrl = _storageService.GetFileUrl(fileName);
            }

            var userId = User.GetUserId();
            var userName = await _context.Users
                            .Where(x => x.Id == userId)
                            .Select(x => new
                            {
                                x.FullName
                            })
                            .FirstOrDefaultAsync();
            var fullName = userName?.FullName;
            report.Status = newStatus;
            report.UpdatedAt = DateTime.Now;

            if (newStatus == ReportStatus.Completed)
            {
                report.CompletedAt = DateTime.Now;

                _context.UserGreenPoints.Add(new UserGreenPoint
                {
                    UserId = report.UserId,
                    Points = 10,
                    Reason = "Báo cáo được xử lý hoàn thành",
                    ReportId = report.Id
                });

                var user = await _context.Users.FindAsync(report.UserId);
                if (user != null) user.TotalGreenPoints += 10;
            }

            string note = newStatus switch
            {
                ReportStatus.Received => "Báo cáo đã tiếp nhận",
                ReportStatus.Completed => "Báo cáo đã hoàn thành",
                ReportStatus.Rejected => "Báo cáo bị từ chối",
                _ => "Cập nhật trạng thái"
            };

            _context.ReportProgresses.Add(new ReportProgress
            {
                ReportId = id,
                Status = newStatus,
                Note = note,
                Description = request.Description,
                ImageAfterUrl = imageAfterUrl,
                UpdatedBy = userId,
                UpdatedAt = DateTime.Now,
                UpdatedByName = fullName
            });

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("{id}/assign")]
        [Permission("Reports.Assign")]
        public async Task<IActionResult> AssignTeam(long id, [FromBody] AssignTeamRequest request)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null)
                return NotFound($"Report {id} not found");

            if (report.Status != ReportStatus.Received)
                return BadRequest("Phải tiếp nhận trước khi giao đội");

            report.TeamId = request.TeamId;
            report.Status = ReportStatus.InProgress;
            report.UpdatedAt = DateTime.Now;
            report.ProcessedAt = DateTime.Now;

            var userId = User.GetUserId();
            var user = await _context.Users
                            .Where(x => x.Id == userId)
                            .Select(x => new
                            {
                                x.FullName
                            })
                            .FirstOrDefaultAsync();
            var fullName = user?.FullName;
            _context.ReportProgresses.Add(new ReportProgress
            {
                ReportId = id,
                Status = ReportStatus.InProgress,
                Note = $"Đã giao cho đội: {request.TeamId}",
                Description = request.Description,
                UpdatedBy = userId,
                UpdatedAt = DateTime.Now,
                UpdatedByName = fullName
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

        [HttpGet("topward")]
        [AllowAnonymous]
        public async Task<IActionResult> TopWard(int top = 10, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.Reports.AsQueryable();

            if (fromDate.HasValue)
                query = query.Where(r => r.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(r => r.CreatedAt <= toDate.Value);

            var topWards = await query
                .GroupBy(r => new { r.WardId, r.Ward!.Name })
                .Select(g => new
                {
                    WardId = g.Key.WardId,
                    WardName = g.Key.Name,
                    TotalReports = g.Count(),
                    //Submitted = g.Count(r => r.Status == ReportStatus.Submitted),
                    //Received = g.Count(r => r.Status == ReportStatus.Received),
                    //InProgress = g.Count(r => r.Status == ReportStatus.InProgress),
                    //Completed = g.Count(r => r.Status == ReportStatus.Completed),
                    //Rejected = g.Count(r => r.Status == ReportStatus.Rejected),
                    //HighPriority = g.Count(r => r.Priority == ReportPriority.High || r.Priority == ReportPriority.Urgent)
                })
                .OrderByDescending(x => x.TotalReports)
                .Take(top)
                .ToListAsync();

            return Ok(topWards);
        }

        [HttpGet("weekly-stats")]
        [AllowAnonymous]
        public async Task<IActionResult> GetWeeklyStats(int? status = null, int? wardId = null, int? categoryId = null)
        {
            // Lấy ngày hiện tại
            var today = DateTime.Now.Date;

            // Tính ngày đầu tuần (Thứ 2)
            var dayOfWeek = (int)today.DayOfWeek;
            var daysFromMonday = dayOfWeek == 0 ? 6 : dayOfWeek - 1; // Chủ nhật = 0, nên cần xử lý đặc biệt
            var startOfWeek = today.AddDays(-daysFromMonday);

            // Ngày cuối tuần (Chủ nhật)
            var endOfWeek = startOfWeek.AddDays(6).AddHours(23).AddMinutes(59).AddSeconds(59);

            var query = _context.Reports.AsQueryable();

            // Lọc theo tuần hiện tại
            query = query.Where(r => r.CreatedAt >= startOfWeek && r.CreatedAt <= endOfWeek);

            // Lọc theo status nếu có
            if (status.HasValue)
                query = query.Where(r => (int)r.Status == status.Value);

            // Lọc theo wardId nếu có
            if (wardId.HasValue)
                query = query.Where(r => r.WardId == wardId.Value);

            // Lọc theo categoryId nếu có
            if (categoryId.HasValue)
                query = query.Where(r => r.CategoryId == categoryId.Value);

            var reports = await query.ToListAsync();

            // Thống kê theo từng ngày trong tuần
            var weeklyStats = new List<object>();
            var vietnameseDays = new[] { "Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7" };

            for (int i = 0; i < 7; i++)
            {
                var currentDay = startOfWeek.AddDays(i);
                var dayReports = reports.Where(r => r.CreatedAt.Date == currentDay).ToList();

                var dayOfWeekIndex = (int)currentDay.DayOfWeek;

                weeklyStats.Add(new
                {
                    Date = currentDay.ToString("yyyy-MM-dd"),
                    DayOfWeek = vietnameseDays[dayOfWeekIndex],
                    DayNumber = i + 1, // 1-7 (Thứ 2 đến Chủ nhật)
                    Count = dayReports.Count,
                    Submitted = dayReports.Count(r => r.Status == ReportStatus.Submitted),
                    Received = dayReports.Count(r => r.Status == ReportStatus.Received),
                    InProgress = dayReports.Count(r => r.Status == ReportStatus.InProgress),
                    Completed = dayReports.Count(r => r.Status == ReportStatus.Completed),
                    Rejected = dayReports.Count(r => r.Status == ReportStatus.Rejected)
                });
            }

            return Ok(new
            {
                StartOfWeek = startOfWeek.ToString("yyyy-MM-dd"),
                EndOfWeek = endOfWeek.ToString("yyyy-MM-dd"),
                TotalReports = reports.Count,
                DailyStats = weeklyStats
            });
        }

        [HttpDelete("{id}")]
        [Permission("Reports.Delete")]
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

        private static string GetStatusName(ReportStatus status)
        {
            return status switch
            {
                ReportStatus.Submitted => "Đã gửi",
                ReportStatus.Received => "Đã tiếp nhận",
                ReportStatus.InProgress => "Đang xử lý",
                ReportStatus.Completed => "Hoàn thành",
                ReportStatus.Rejected => "Từ chối",
                _ => "Không xác định"
            };
        }
    }

    public class UpdateStatusRequest
    {
        public int Status { get; set; }
        public string? Note { get; set; }
        public string? Description { get; set; }
        public IFormFile? ImageAfter { get; set; }
    }

    public class AssignTeamRequest
    {
        public int TeamId { get; set; }
        public string? Description { get; set; }
    }
}
