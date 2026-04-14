using KnowledgeSpace.BackendServer.Data.Entities;
using Microsoft.AspNetCore.Identity;

namespace KnowledgeSpace.BackendServer.Data
{
	public class DbInitializer
	{
		private readonly ApplicationDbContext _context;
		private readonly UserManager<User> _userManager;
		private readonly RoleManager<IdentityRole> _roleManager;
		private readonly string AdminRoleName = "Admin";
		private readonly string UserRoleName = "Member";

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
			#region Quy?n

			if (!_roleManager.Roles.Any())
			{
				await _roleManager.CreateAsync(new IdentityRole
				{
					Id = AdminRoleName,
					Name = AdminRoleName,
					NormalizedName = AdminRoleName.ToUpper(),
				});
				await _roleManager.CreateAsync(new IdentityRole
				{
					Id = UserRoleName,
					Name = UserRoleName,
					NormalizedName = UserRoleName.ToUpper(),
				});
			}

			#endregion Quy?n

			#region Ngu?i dùng

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
					await _userManager.AddToRoleAsync(user, AdminRoleName);
				}
			}

			#endregion Ngu?i dùng

			await _context.SaveChangesAsync();
		}
	}
}