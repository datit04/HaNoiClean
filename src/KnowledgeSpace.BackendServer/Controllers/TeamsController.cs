using KnowledgeSpace.BackendServer.Authorization;
using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.ViewModels.Contents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers
{
    public class TeamsController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public TeamsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var teams = await _context.Teams.OrderBy(w => w.Name).ToListAsync();
            return Ok(teams);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var team = await _context.Teams
                .Include(t => t.Ward)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (team == null)
                return NotFound(new ApiNotFoundResponse($"Team {id} not found"));
            return Ok(team);
        }

        [HttpPost]
        [Permission("Teams.Create")]
        public async Task<IActionResult> Create([FromBody] Team team)
        {
            team.CreatedAt = DateTime.Now;
            _context.Teams.Add(team);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = team.Id }, team);
        }

        [HttpPut("{id}")]
        [Permission("Teams.Update")]
        public async Task<IActionResult> Update(int id, [FromBody] Team request)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
                return NotFound(new ApiNotFoundResponse($"Team {id} not found"));

            team.Name = request.Name;
            team.WardId = request.WardId;
            team.Members = request.Members;
            team.IsActive = request.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Permission("Teams.Delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
                return NotFound(new ApiNotFoundResponse($"Team {id} not found"));
            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("performance")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPerformance(
            int? teamId = null,
            int? wardId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null)
        {
            var teamsQuery = _context.Teams
                .Include(t => t.Ward)
                .Include(t => t.Category)
                .Where(t => t.IsActive)
                .AsQueryable();

            if (teamId.HasValue)
                teamsQuery = teamsQuery.Where(t => t.Id == teamId.Value);

            if (wardId.HasValue)
                teamsQuery = teamsQuery.Where(t => t.WardId == wardId.Value);

            var teams = await teamsQuery.ToListAsync();
            var teamIds = teams.Select(t => t.Id).ToList();

            // Batch query - lấy tất cả reports của các teams 1 lần duy nhất
            var reportsQuery = _context.Reports
                .Where(r => r.TeamId.HasValue && teamIds.Contains(r.TeamId.Value));

            if (fromDate.HasValue)
                reportsQuery = reportsQuery.Where(r => r.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                reportsQuery = reportsQuery.Where(r => r.CreatedAt <= toDate.Value);

            var allReports = await reportsQuery.ToListAsync();

            var performanceList = new List<TeamPerformanceVm>();

            foreach (var team in teams)
            {
                // Lọc reports của team này từ batch đã load
                var reports = allReports.Where(r => r.TeamId == team.Id).ToList();

                var totalAssigned = reports.Count;
                var completed = reports.Count(r => r.Status == ReportStatus.Completed);
                var inProgress = reports.Count(r => r.Status == ReportStatus.InProgress);
                var rejected = reports.Count(r => r.Status == ReportStatus.Rejected);

                var completionRate = totalAssigned > 0
                    ? Math.Round((double)completed / totalAssigned * 100, 2)
                    : 0;

                var completedReports = reports
                    .Where(r => r.Status == ReportStatus.Completed
                                && r.ProcessedAt.HasValue
                                && r.CompletedAt.HasValue)
                    .ToList();

                double? avgProcessingHours = null;
                if (completedReports.Any())
                {
                    var totalHours = completedReports
                        .Sum(r => (r.CompletedAt!.Value - r.ProcessedAt!.Value).TotalHours);
                    avgProcessingHours = Math.Round(totalHours / completedReports.Count, 2);
                }

                // Lấy số members từ thuộc tính team.Members
                var memberCount = team.Members ?? 0;

                performanceList.Add(new TeamPerformanceVm
                {
                    TeamId = team.Id,
                    TeamName = team.Name ?? "N/A",
                    MemberCount = (int)team.Members,
                    TotalAssignedReports = totalAssigned,
                    CompletedReports = completed,
                    InProgressReports = inProgress,
                    RejectedReports = rejected,
                    CompletionRate = completionRate,
                    AverageProcessingHours = avgProcessingHours,
                    WardName = team.Ward?.Name,
                    CategoryName = team.Category?.Name
                });
            }

            return Ok(performanceList.OrderByDescending(p => p.CompletionRate));
        }
    }
}
