using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.BackendServer.Services;
using KnowledgeSpace.ViewModels;
using KnowledgeSpace.ViewModels.Systems;
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
        //[ClaimRequirement(FunctionCode.ADMIN_USER, CommandCode.CREATE)]
        [ApiValidationFilter]
        public async Task<IActionResult> PostUser(UserCreateRequest request)
        {
            var roleName = !string.IsNullOrEmpty(request.RoleId)
                ? request.RoleId
                : SystemConstants.Roles.Citizen;

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
        //[ClaimRequirement(FunctionCode.ADMIN_USER, CommandCode.VIEW)]
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
        //[ClaimRequirement(FunctionCode.ADMIN_USER, CommandCode.VIEW)]
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
        //[ClaimRequirement(FunctionCode.ADMIN_USER, CommandCode.VIEW)]
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
        //[ClaimRequirement(FunctionCode.ADMIN_USER, CommandCode.UPDATE)]
        [Consumes("multipart/form-data")]
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
                var allowedExtensions = new string[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(request.Avatar.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new ApiBadRequestResponse("Định dạng ảnh không được hỗ trợ"));

                if (!string.IsNullOrEmpty(user.AvatarUrl))
                {
                    var oldFileName = Path.GetFileName(user.AvatarUrl);
                    await _storageService.DeleteFileAsync(oldFileName);
                }

                var fileName = $"avatar_{user.Id}_{DateTime.Now:yyyyMMddHHmmss}{extension}";
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
        //[ClaimRequirement(FunctionCode.ADMIN_USER, CommandCode.UPDATE)]
        [ApiValidationFilter]
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
        //[ClaimRequirement(FunctionCode.ADMIN_USER, CommandCode.DELETE)]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

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

        [HttpGet("{userId}/roles")]
        //[ClaimRequirement(FunctionCode.ADMIN_USER, CommandCode.VIEW)]
        public async Task<IActionResult> GetUserRoles(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new ApiNotFoundResponse($"Cannot found user with id: {userId}"));
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(roles);
        }

        [HttpPost("{userId}/roles")]
        //[ClaimRequirement(FunctionCode.ADMIN_USER, CommandCode.UPDATE)]
        public async Task<IActionResult> PostRolesToUser(string userId, [FromBody] RoleAssignRequest request)
        {
            if (request.RoleNames?.Length == 0)
            {
                return BadRequest(new ApiBadRequestResponse("Role names cannot empty"));
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new ApiNotFoundResponse($"Cannot found user with id: {userId}"));
            var result = await _userManager.AddToRolesAsync(user, request.RoleNames);
            if (result.Succeeded)
                return Ok();

            return BadRequest(new ApiBadRequestResponse(result));
        }

        [HttpDelete("{userId}/roles")]
        //[ClaimRequirement(FunctionCode.ADMIN_USER, CommandCode.VIEW)]
        public async Task<IActionResult> RemoveRolesFromUser(string userId, [FromQuery] RoleAssignRequest request)
        {
            if (request.RoleNames?.Length == 0)
            {
                return BadRequest(new ApiBadRequestResponse("Role names cannot empty"));
            }
            if (request.RoleNames.Length == 1 && request.RoleNames[0] == SystemConstants.Roles.Admin)
            {
                return BadRequest(new ApiBadRequestResponse($"Cannot remove {SystemConstants.Roles.Admin} role"));
            }
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