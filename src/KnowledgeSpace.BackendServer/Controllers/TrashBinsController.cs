using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers
{
    public class TrashBinsController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public TrashBinsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int? wardId)
        {
            var query = _context.TrashBins
                .Include(t => t.Ward)
                .Where(t => t.IsActive)
                .AsQueryable();

            if (wardId.HasValue) query = query.Where(t => t.WardId == wardId.Value);

            var bins = await query.OrderBy(t => t.Code).ToListAsync();
            return Ok(bins);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var bin = await _context.TrashBins
                .Include(t => t.Ward)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (bin == null)
                return NotFound(new ApiNotFoundResponse($"TrashBin {id} not found"));
            return Ok(bin);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TrashBin bin)
        {
            _context.TrashBins.Add(bin);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = bin.Id }, bin);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TrashBin request)
        {
            var bin = await _context.TrashBins.FindAsync(id);
            if (bin == null)
                return NotFound(new ApiNotFoundResponse($"TrashBin {id} not found"));

            bin.Code = request.Code;
            bin.QrCode = request.QrCode;
            bin.Latitude = request.Latitude;
            bin.Longitude = request.Longitude;
            bin.Address = request.Address;
            bin.WardId = request.WardId;
            bin.Schedule = request.Schedule;
            bin.IsActive = request.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id}/collected")]
        public async Task<IActionResult> MarkCollected(int id)
        {
            var bin = await _context.TrashBins.FindAsync(id);
            if (bin == null)
                return NotFound(new ApiNotFoundResponse($"TrashBin {id} not found"));
            bin.LastCollected = DateTime.Now;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var bin = await _context.TrashBins.FindAsync(id);
            if (bin == null)
                return NotFound(new ApiNotFoundResponse($"TrashBin {id} not found"));
            _context.TrashBins.Remove(bin);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
