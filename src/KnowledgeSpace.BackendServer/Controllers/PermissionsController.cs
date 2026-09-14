using KnowledgeSpace.BackendServer.Authorization;
using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace KnowledgeSpace.BackendServer.Controllers
{
    public class PermissionsController : BaseController
    {
        private readonly ApplicationDbContext _context;
        private readonly RoleManager<IdentityRole> _roleManager;

        public PermissionsController(ApplicationDbContext context, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _roleManager = roleManager;
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMyPermissions()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var roleIds = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            var permissions = await _context.RoleClaims
                .Where(rc => roleIds.Contains(rc.RoleId) && rc.ClaimType == "permission")
                .Select(rc => rc.ClaimValue)
                .Distinct()
                .ToListAsync();

            return Ok(permissions);
        }

        [HttpGet]
        [Permission("Permissions.View")]
        public IActionResult GetAll()
        {
            return Ok(Permissions.All);
        }

        [HttpGet("roles/{roleId}")]
        [Permission("Permissions.View")]
        public async Task<IActionResult> GetByRole(string roleId)
        {
            var role = await _roleManager.FindByIdAsync(roleId);
            if (role == null)
                return NotFound();

            var permissions = await _context.RoleClaims
                .Where(rc => rc.RoleId == roleId && rc.ClaimType == "permission")
                .Select(rc => rc.ClaimValue)
                .ToListAsync();

            return Ok(permissions);
        }

        [HttpPut("roles/{roleId}")]
        [Permission("Permissions.Update")]
        public async Task<IActionResult> UpdateByRole(string roleId, [FromBody] List<string> permissionIds)
        {
            var role = await _roleManager.FindByIdAsync(roleId);
            if (role == null)
                return NotFound();

            var existing = _context.RoleClaims
                .Where(rc => rc.RoleId == roleId && rc.ClaimType == "permission");
            _context.RoleClaims.RemoveRange(existing);

            foreach (var permissionId in permissionIds)
            {
                _context.RoleClaims.Add(new IdentityRoleClaim<string>
                {
                    RoleId = roleId,
                    ClaimType = "permission",
                    ClaimValue = permissionId
                });
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
