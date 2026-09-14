using KnowledgeSpace.BackendServer.Authorization;
using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.BackendServer.Services;
using KnowledgeSpace.ViewModels;
using KnowledgeSpace.ViewModels.Systems;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers
{
    public class UsersController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _context;
        private readonly IStorageService _storageService;

        public UsersController(UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext context,
            IStorageService storageService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
            _storageService = storageService;
        }

        [HttpPost]
        [Permission("Users.Create")]
        [ApiValidationFilter]
        public async Task<IActionResult> PostUser(UserCreateRequest request)
        {
            var roleName = !string.IsNullOrEmpty(request.RoleId)
                ? request.RoleId
                : "User";

            var role = await _roleManager.FindByIdAsync(roleName);
            if (role == null)
                return BadRequest(new ApiBadRequestResponse($"Role '{roleName}' does not exist."));

            var user = new User()
            {
                Id = Guid.NewGuid().ToString(),
                Email = request.Email,
                Dob = string.IsNullOrEmpty(request.Dob) ? null : DateTime.Parse(request.Dob),
                UserName = request.UserName,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                CreateDate = DateTime.Now,
            };
            var result = await _userManager.CreateAsync(user, request.Password);
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, role.Name);
                return CreatedAtAction(nameof(GetById), new { id = user.Id }, request);
            }
            else
            {
                return BadRequest(new ApiBadRequestResponse(result));
            }
        }

        [HttpGet]
        [Permission("Users.View")]
        public async Task<IActionResult> GetUsers()
        {
            var users = _userManager.Users;

            var uservms = await users.Select(u => new UserVm()
            {
                Id = u.Id,
                UserName = u.UserName,
                Dob = u.Dob,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl,
                TotalGreenPoints = u.TotalGreenPoints,
                Status = u.Status.ToString(),
                WardId = u.WardId,
                TeamId = u.TeamId,
                CreateDate = u.CreateDate
            }).ToListAsync();

            return Ok(uservms);
        }

        [HttpGet("filter")]
        [Permission("Users.View")]
        public async Task<IActionResult> GetUsersPaging(string filter, int pageIndex, int pageSize)
        {
            var query = _userManager.Users;
            if (!string.IsNullOrEmpty(filter))
            {
                query = query.Where(x => x.Email.Contains(filter)
                || x.UserName.Contains(filter)
                || x.PhoneNumber.Contains(filter)
                || x.FullName.Contains(filter));
            }
            var totalRecords = await query.CountAsync();
            var items = await query.Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserVm()
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    Dob = u.Dob,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    FullName = u.FullName,
                    AvatarUrl = u.AvatarUrl,
                    TotalGreenPoints = u.TotalGreenPoints,
                    Status = u.Status.ToString(),
                    WardId = u.WardId,
                    TeamId = u.TeamId,
                    CreateDate = u.CreateDate
                })
                .ToListAsync();

            var pagination = new Pagination<UserVm>
            {
                Items = items,
                TotalRecords = totalRecords,
            };
            return Ok(pagination);
        }

        [HttpGet("{id}")]
        [Permission("Users.View")]
        public async Task<IActionResult> GetById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new ApiNotFoundResponse($"Cannot found user with id: {id}"));

            var userVm = new UserVm()
            {
                Id = user.Id,
                UserName = user.UserName,
                Dob = user.Dob,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                TotalGreenPoints = user.TotalGreenPoints,
                Status = user.Status.ToString(),
                WardId = user.WardId,
                TeamId = user.TeamId,
                CreateDate = user.CreateDate
            };
            return Ok(userVm);
        }

        [HttpPut("{id}")]
        [Permission("Users.Update")]
        public async Task<IActionResult> PutUser(string id, [FromForm] UserUpdateRequest request)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new ApiNotFoundResponse($"Cannot found user with id: {id}"));

            user.FullName = request.FullName;
            user.Dob = string.IsNullOrEmpty(request.Dob) ? null : DateTime.Parse(request.Dob);
            user.Email = request.Email;
            user.PhoneNumber = request.PhoneNumber;
            user.WardId = request.WardId;
            user.TeamId = request.TeamId;

            if (request.Avatar != null && request.Avatar.Length > 0)
            {
                var extension = Path.GetExtension(request.Avatar.FileName).ToLowerInvariant();

                if (!string.IsNullOrEmpty(user.AvatarUrl))
                {
                    var oldObjectName = ExtractObjectName(user.AvatarUrl);
                    await _storageService.DeleteFileAsync(oldObjectName);
                }

                var fileName = $"avatars/avatar_{user.Id}_{DateTime.Now:yyyyMMddHHmmss}{extension}";
                await using var stream = request.Avatar.OpenReadStream();
                await _storageService.SaveFileAsync(stream, fileName);
                user.AvatarUrl = _storageService.GetFileUrl(fileName);
            }

            if (!string.IsNullOrEmpty(request.Status)
                && Enum.TryParse<UserStatus>(request.Status, out var status))
            {
                user.Status = status;
            }

            if (!string.IsNullOrEmpty(request.RoleId))
            {
                var role = await _roleManager.FindByIdAsync(request.RoleId);
                if (role == null)
                    return BadRequest(new ApiBadRequestResponse($"Role '{request.RoleId}' does not exist."));

                var currentRoles = await _userManager.GetRolesAsync(user);
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                await _userManager.AddToRoleAsync(user, role.Name);
            }

            user.LastModifiedDate = DateTime.Now;

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return NoContent();
            }
            return BadRequest(new ApiBadRequestResponse(result));
        }

        [HttpPut("{id}/change-password")]
        [Permission("Users.Update")]
        public async Task<IActionResult> PutUserPassword(string id, [FromBody] UserPasswordChangeRequest request)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new ApiNotFoundResponse($"Cannot found user with id: {id}"));

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

            if (result.Succeeded)
            {
                return NoContent();
            }
            return BadRequest(new ApiBadRequestResponse(result));
        }

        [HttpDelete("{id}")]
        [Permission("Users.Delete")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            var userReports = _context.Reports.Where(r => r.UserId == id).Select(r => r.Id).ToList();

            _context.ReportProgresses.RemoveRange(
                _context.ReportProgresses.Where(rp => userReports.Contains(rp.ReportId) || rp.UpdatedBy == id));
            _context.UserGreenPoints.RemoveRange(
                _context.UserGreenPoints.Where(g => g.UserId == id));
            _context.Reports.RemoveRange(
                _context.Reports.Where(r => r.UserId == id));
            await _context.SaveChangesAsync();

            var result = await _userManager.DeleteAsync(user);

            if (result.Succeeded)
            {
                var uservm = new UserVm()
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Dob = user.Dob,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    FullName = user.FullName,
                    CreateDate = user.CreateDate
                };
                return Ok(uservm);
            }
            return BadRequest(new ApiBadRequestResponse(result));
        }

        private static string ExtractObjectName(string fileUrl)
        {
            // MinIO URL: http://host:port/bucket/folder/file.jpg -> folder/file.jpg
            // Local URL: /user-attachments/file.jpg -> file.jpg
            if (fileUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(fileUrl);
                // Remove leading '/' and bucket name segment
                var segments = uri.AbsolutePath.TrimStart('/').Split('/', 2);
                return segments.Length > 1 ? segments[1] : segments[0];
            }
            return Path.GetFileName(fileUrl);
        }

        [HttpGet("{userId}/roles")]
        [Permission("Users.View")]
        public async Task<IActionResult> GetUserRoles(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new ApiNotFoundResponse($"Cannot found user with id: {userId}"));
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(roles);
        }

        [HttpPost("{userId}/roles")]
        [Permission("Users.Update")]
        public async Task<IActionResult> PostRolesToUser(string userId, [FromBody] RoleAssignRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new ApiNotFoundResponse($"Cannot found user with id: {userId}"));
            var result = await _userManager.AddToRolesAsync(user, request.RoleNames);
            if (result.Succeeded)
                return Ok();

            return BadRequest(new ApiBadRequestResponse(result));
        }

        [HttpDelete("{userId}/roles")]
        [Permission("Users.Update")]
        public async Task<IActionResult> RemoveRolesFromUser(string userId, [FromQuery] RoleAssignRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new ApiNotFoundResponse($"Cannot found user with id: {userId}"));
            var result = await _userManager.RemoveFromRolesAsync(user, request.RoleNames);
            if (result.Succeeded)
                return Ok();

            return BadRequest(new ApiBadRequestResponse(result));
        }
    }
}