using KnowledgeSpace.BackendServer.Services;
using Microsoft.AspNetCore.Mvc;

namespace KnowledgeSpace.BackendServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IStorageService _storageService;

        public UploadController(IStorageService storageService)
        {
            _storageService = storageService;
        }

        [HttpPost]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File không h?p l?" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "??nh d?ng file không ???c h? tr?" });

            var fileName = $"{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid():N}{extension}";

            await using var stream = file.OpenReadStream();
            await _storageService.SaveFileAsync(stream, fileName);

            var fileUrl = _storageService.GetFileUrl(fileName);

            return Ok(new
            {
                fileName,
                fileUrl,
                size = file.Length
            });
        }
    }
}
