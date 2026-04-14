using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers
{
    public class WardsController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public WardsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var wards = await _context.Wards.Where(w => w.IsActive).OrderBy(w => w.Name).ToListAsync();
            return Ok(wards);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var ward = await _context.Wards.FindAsync(id);
            if (ward == null)
                return NotFound(new ApiNotFoundResponse($"Ward {id} not found"));
            return Ok(ward);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Ward ward)
        {
            _context.Wards.Add(ward);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = ward.Id }, ward);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Ward request)
        {
            var ward = await _context.Wards.FindAsync(id);
            if (ward == null)
                return NotFound(new ApiNotFoundResponse($"Ward {id} not found"));

            ward.Name = request.Name;
            ward.Type = request.Type;
            ward.Code = request.Code;
            ward.Latitude = request.Latitude;
            ward.Longitude = request.Longitude;
            ward.IsActive = request.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ward = await _context.Wards.FindAsync(id);
            if (ward == null)
                return NotFound(new ApiNotFoundResponse($"Ward {id} not found"));
            _context.Wards.Remove(ward);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
