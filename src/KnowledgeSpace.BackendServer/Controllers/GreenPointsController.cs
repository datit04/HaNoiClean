using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Extensions;
using KnowledgeSpace.BackendServer.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers
{
    public class GreenPointsController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public GreenPointsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyPoints()
        {
            var userId = User.GetUserId();
            var points = await _context.UserGreenPoints
                .Include(g => g.Report)
                .Where(g => g.UserId == userId)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();

            var total = points.Sum(p => p.Points);
            return Ok(new { total, history = points });
        }

        [HttpGet("leaderboard")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLeaderboard(int top = 20)
        {
            var leaderboard = await _context.Users
                .Where(u => u.TotalGreenPoints > 0)
                .OrderByDescending(u => u.TotalGreenPoints)
                .Take(top)
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.FullName,
                    u.AvatarUrl,
                    u.TotalGreenPoints
                })
                .ToListAsync();
            return Ok(leaderboard);
        }

        [HttpPost]
        public async Task<IActionResult> AddPoints([FromBody] UserGreenPoint greenPoint)
        {
            _context.UserGreenPoints.Add(greenPoint);

            var user = await _context.Users.FindAsync(greenPoint.UserId);
            if (user != null) user.TotalGreenPoints += greenPoint.Points;

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
