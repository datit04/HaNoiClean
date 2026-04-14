using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
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
            var teams = await _context.Teams.Where(w => w.IsActive).OrderBy(w => w.Name).ToListAsync();
            return Ok(teams);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var team = await _context.Teams
                .Include(t => t.Ward)
                .Include(t => t.Leader)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (team == null)
                return NotFound(new ApiNotFoundResponse($"Team {id} not found"));
            return Ok(team);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Team team)
        {
            _context.Teams.Add(team);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = team.Id }, team);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Team request)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
                return NotFound(new ApiNotFoundResponse($"Team {id} not found"));

            team.Name = request.Name;
            team.WardId = request.WardId;
            team.LeaderId = request.LeaderId;
            team.IsActive = request.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
                return NotFound(new ApiNotFoundResponse($"Team {id} not found"));
            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
