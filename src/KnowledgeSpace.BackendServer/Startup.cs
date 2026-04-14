using FluentValidation.AspNetCore;
using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Extensions;
using KnowledgeSpace.BackendServer.IdentityServer;
using KnowledgeSpace.BackendServer.Services;
using KnowledgeSpace.ViewModels.Systems;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

namespace KnowledgeSpace.BackendServer
{
	public class Startup
	{
		private readonly string CarpoolSpecificOrigins = "CarpoolSpecificOrigins";
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		public void ConfigureServices(IServiceCollection services)
		{
			//1. Setup entity framework
			services.AddDbContext<ApplicationDbContext>(options =>
				options.UseSqlServer(
					Configuration.GetConnectionString("DefaultConnection")));
			//2. Setup identity
			services.AddIdentity<User, IdentityRole>()
				.AddEntityFrameworkStores<ApplicationDbContext>()
				.AddDefaultTokenProviders();

			var builder = services.AddIdentityServer(options =>
			{
				options.Events.RaiseErrorEvents = true;
				options.Events.RaiseInformationEvents = true;
				options.Events.RaiseFailureEvents = true;
				options.Events.RaiseSuccessEvents = true;
			})
			.AddInMemoryIdentityResources(Config.Ids)
			.AddInMemoryApiResources(Config.Apis)
			.AddInMemoryApiScopes(Config.ApiScopes)
			.AddInMemoryClients(Config.Clients)
			.AddAspNetIdentity<User>()
			.AddProfileService<IdentityProfileService>()
			.AddDeveloperSigningCredential();

			services.AddCors(options =>
			{
				options.AddPolicy(CarpoolSpecificOrigins,
				builder =>
				{
					builder.WithOrigins("http://localhost:5173", "http://localhost:3000")
					   .AllowAnyHeader()
					   .AllowAnyMethod();
				});
			});
			services.Configure<IdentityOptions>(options =>
			{
				options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
				options.Lockout.MaxFailedAccessAttempts = 5;
				options.Lockout.AllowedForNewUsers = true;
				options.SignIn.RequireConfirmedPhoneNumber = false;
				options.SignIn.RequireConfirmedAccount = false;
				options.SignIn.RequireConfirmedEmail = false;
				options.Password.RequiredLength = 8;
				options.Password.RequireDigit = true;
				options.Password.RequireUppercase = true;
				options.User.RequireUniqueEmail = true;
			});

			services.Configure<ApiBehaviorOptions>(options =>
			{
				options.SuppressModelStateInvalidFilter = true;
			});

			services.AddControllersWithViews()
				.AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<RoleCreateRequestValidator>());

			services.AddAuthentication()
			   .AddLocalApi("Bearer", option =>
			   {
				   option.ExpectedScope = "api.cleancity";
			   });

			services.AddAuthorization(options =>
			{
				options.AddPolicy("Bearer", policy =>
				{
					policy.AddAuthenticationSchemes("Bearer");
					policy.RequireAuthenticatedUser();
				});
			});

			services.AddRazorPages(options =>
			{
				options.Conventions.AddAreaFolderRouteModelConvention("Identity", "/Account/", model =>
				{
					foreach (var selector in model.Selectors)
					{
						var attributeRouteModel = selector.AttributeRouteModel;
						attributeRouteModel.Order = -1;
						attributeRouteModel.Template = attributeRouteModel.Template.Remove(0, "Identity".Length);
					}
				});
			});
			services.AddTransient<DbInitializer>();
			services.AddTransient<IEmailSender, EmailSenderService>();
			services.AddTransient<IStorageService, FileStorageService>();

			services.AddSwaggerGen(c =>
			{
				c.SwaggerDoc("v1", new OpenApiInfo { Title = "Hanoi CleanCity API", Version = "v1" });

				c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
				{
					Type = SecuritySchemeType.OAuth2,
					Flows = new OpenApiOAuthFlows
					{
						Implicit = new OpenApiOAuthFlow
						{
							AuthorizationUrl = new Uri("https://localhost:5001/connect/authorize"),
							Scopes = new Dictionary<string, string> { { "api.cleancity", "CleanCity API" } }
						},
					},
				});
				c.AddSecurityRequirement(new OpenApiSecurityRequirement
				{
					{
						new OpenApiSecurityScheme
						{
							Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
						},
						new List<string>{ "api.cleancity" }
					}
				});
			});
		}

		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}

			app.UseErrorWrapping();
			app.UseStaticFiles();

			app.UseIdentityServer();

			app.UseAuthentication();

			app.UseHttpsRedirection();

			app.UseRouting();

			app.UseCors(CarpoolSpecificOrigins);
			app.UseAuthorization();
			app.UseEndpoints(endpoints =>
			{
				endpoints.MapDefaultControllerRoute();
				endpoints.MapRazorPages();
			});

			app.UseSwagger();

			app.UseSwaggerUI(c =>
			{
				c.OAuthClientId("swagger");
				c.SwaggerEndpoint("/swagger/v1/swagger.json", "Carpool API V1");
			});
		}
	}
}