using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace KnowledgeSpace.BackendServer.Authorization
{
    public class PermissionFilter : IAsyncAuthorizationFilter
    {
        private readonly string _permission;
        private readonly ApplicationDbContext _context;

        public PermissionFilter(string permission, ApplicationDbContext context)
        {
            _permission = permission;
            _context = context;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
            {
                context.Result = new JsonResult(new { message = "Unauthorized" }) { StatusCode = 401 };
                return;
            }

            var roleNames = user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            if (!roleNames.Any())
            {
                roleNames = user.FindAll("role").Select(c => c.Value).ToList();
            }
            if (!roleNames.Any())
            {
                context.Result = new JsonResult(new { message = "Forbidden", permission = _permission }) { StatusCode = 403 };
                return;
            }

            var roleIds = await _context.Roles
                .Where(r => roleNames.Contains(r.Name))
                .Select(r => r.Id)
                .ToListAsync();

            if (!roleIds.Any())
            {
                context.Result = new JsonResult(new { message = "Forbidden", permission = _permission }) { StatusCode = 403 };
                return;
            }

            var hasPermission = await _context.RoleClaims
                .AnyAsync(rc => roleIds.Contains(rc.RoleId)
                    && rc.ClaimType == "permission"
                    && rc.ClaimValue == _permission);

            if (!hasPermission)
            {
                context.Result = new JsonResult(new { message = "Forbidden", permission = _permission }) { StatusCode = 403 };
            }
        }
    }
}
