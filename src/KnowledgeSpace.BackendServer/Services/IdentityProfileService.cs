using Duende.IdentityServer.Extensions;
using Duende.IdentityServer.Models;
using Duende.IdentityServer.Services;
using KnowledgeSpace.BackendServer.Data.Entities;
using Microsoft.AspNetCore.Identity;
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

			foreach (var role in roles)
			{
				claims.Add(new Claim(ClaimTypes.Role, role));
			}

			context.IssuedClaims = claims;
		}

		public async Task IsActiveAsync(IsActiveContext context)
		{
			var sub = context.Subject.GetSubjectId();
			var user = await _userManager.FindByIdAsync(sub);
			context.IsActive = user != null;
		}
	}
}