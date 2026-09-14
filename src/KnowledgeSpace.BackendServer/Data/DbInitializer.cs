using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Data.Entities;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace KnowledgeSpace.BackendServer.Data
{
	public class DbInitializer
	{
		private readonly ApplicationDbContext _context;
		private readonly UserManager<User> _userManager;
		private readonly RoleManager<IdentityRole> _roleManager;

		public DbInitializer(ApplicationDbContext context,
		  UserManager<User> userManager,
		  RoleManager<IdentityRole> roleManager)
		{
			_context = context;
			_userManager = userManager;
			_roleManager = roleManager;
		}

		public async Task Seed()
		{
			#region Roles

			if (!_roleManager.Roles.Any())
			{
				await _roleManager.CreateAsync(new IdentityRole
				{
					Id = SystemConstants.Roles.Admin,
					Name = SystemConstants.Roles.Admin,
					NormalizedName = SystemConstants.Roles.Admin.ToUpper(),
				});
				await _roleManager.CreateAsync(new IdentityRole
				{
					Id = SystemConstants.Roles.Citizen,
					Name = SystemConstants.Roles.Citizen,
					NormalizedName = SystemConstants.Roles.Citizen.ToUpper(),
				});
			}

			#endregion Roles

			#region Permissions (Claims)

			// Seed permissions cho Admin role
			if (!_context.RoleClaims.Any())
			{
				var adminRole = await _roleManager.FindByNameAsync(SystemConstants.Roles.Admin);
				if (adminRole != null)
				{
					foreach (var permission in Permissions.All)
					{
						await _roleManager.AddClaimAsync(adminRole, new Claim("Permission", permission.Id));
					}
				}
			}

			#endregion Permissions

			#region Users

			if (!_userManager.Users.Any())
			{
				var result = await _userManager.CreateAsync(new User
					{
						Id = Guid.NewGuid().ToString(),
						UserName = "admin",
						FullName = "Qu?n tr? website",
						Email = "datcds04@gmail.com",
						LockoutEnabled = false
					}, "Admin@123");
				if (result.Succeeded)
				{
					var user = await _userManager.FindByNameAsync("admin");
					await _userManager.AddToRoleAsync(user, SystemConstants.Roles.Admin);
				}
			}

			#endregion Users

			await _context.SaveChangesAsync();
		}
	}
}