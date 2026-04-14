using Duende.IdentityServer.Extensions;
using Duende.IdentityServer.Models;
using Duende.IdentityServer.Services;
using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;
using System.Security.Claims;

namespace KnowledgeSpace.BackendServer.Services
{
	public class IdentityProfileService : IProfileService
	{
		private readonly IUserClaimsPrincipalFactory<User> _claimsFactory;
		private readonly UserManager<User> _userManager;

		public IdentityProfileService(IUserClaimsPrincipalFactory<User> claimsFactory,
			UserManager<User> userManager)
		{
			_claimsFactory = claimsFactory;
			_userManager = userManager;
		}

		public async Task GetProfileDataAsync(ProfileDataRequestContext context)
		{
			var sub = context.Subject.GetSubjectId();
			var user = await _userManager.FindByIdAsync(sub);
			if (user == null)
			{
				throw new ArgumentException("");
			}

			var principal = await _claimsFactory.CreateAsync(user);
			var claims = principal.Claims.ToList();
			var roles = await _userManager.GetRolesAsync(user);

			claims.Add(new Claim(ClaimTypes.Name, user.UserName));
			claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id));
			claims.Add(new Claim("fullName", user.FullName ?? ""));
			claims.Add(new Claim(ClaimTypes.Role, string.Join(";", roles)));

			var permissions = GetPermissionsByRoles(roles);
			claims.Add(new Claim(SystemConstants.Claims.Permissions, JsonConvert.SerializeObject(permissions)));

			context.IssuedClaims = claims;
		}

		public async Task IsActiveAsync(IsActiveContext context)
		{
			var sub = context.Subject.GetSubjectId();
			var user = await _userManager.FindByIdAsync(sub);
			context.IsActive = user != null;
		}

		private List<string> GetPermissionsByRoles(IList<string> roles)
		{
			var permissions = new List<string>();

			if (roles.Contains(SystemConstants.Roles.Admin))
			{
				foreach (var function in Enum.GetValues<FunctionCode>())
				{
					foreach (var command in Enum.GetValues<CommandCode>())
					{
						permissions.Add($"{function}_{command}");
					}
				}
			}
			else
			{
				if (roles.Contains(SystemConstants.Roles.Citizen))
				{
					permissions.AddRange(new[]
					{
						$"{FunctionCode.REPORT}_{CommandCode.CREATE}",
						$"{FunctionCode.REPORT}_{CommandCode.VIEW}",
						$"{FunctionCode.REPORT}_{CommandCode.UPDATE}",
						$"{FunctionCode.GREENPOINT}_{CommandCode.VIEW}",
						$"{FunctionCode.CATEGORY}_{CommandCode.VIEW}",
						$"{FunctionCode.WARD}_{CommandCode.VIEW}",
						$"{FunctionCode.TRASHBIN}_{CommandCode.VIEW}",
					});
				}
			}

			return permissions;
		}
	}
}