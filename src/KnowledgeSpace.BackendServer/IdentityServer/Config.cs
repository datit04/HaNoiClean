using Duende.IdentityServer;
using Duende.IdentityServer.Models;

namespace KnowledgeSpace.BackendServer.IdentityServer
{
	public class Config
	{
		public static IEnumerable<IdentityResource> Ids =>
		  new IdentityResource[]
		  {
				new IdentityResources.OpenId(),
				new IdentityResources.Profile()
		  };

		public static IEnumerable<ApiResource> Apis =>
			new ApiResource[]
			{
				new ApiResource("api.cleancity", "CleanCity API")
				{
					Scopes = { "api.cleancity" }
				}
			};

		public static IEnumerable<ApiScope> ApiScopes =>
			new List<ApiScope>
			{
				new ApiScope("api.cleancity", "Hanoi CleanCity API")
			};

		public static IEnumerable<Client> Clients =>
			new Client[]
			{
				new Client
				{
					ClientId = "swagger",
					ClientName = "Swagger Client",

					AllowedGrantTypes = GrantTypes.Implicit,
					AllowAccessTokensViaBrowser = true,
					RequireConsent = false,

					RedirectUris =           { "https://localhost:5001/swagger/oauth2-redirect.html" },
					PostLogoutRedirectUris = { "https://localhost:5001/swagger/oauth2-redirect.html" },
					AllowedCorsOrigins =     { "https://localhost:5001" },

					AllowedScopes = new List<string>
					{
						IdentityServerConstants.StandardScopes.OpenId,
						IdentityServerConstants.StandardScopes.Profile,
						"api.cleancity"
					}
				},
				new Client
				{
					ClientName = "CleanCity Mobile/Web",
					ClientId = "cleancity_app",
					RequireConsent = false,
					RequireClientSecret = false,
					AllowedGrantTypes = GrantTypes.ResourceOwnerPasswordAndClientCredentials,
					AllowAccessTokensViaBrowser = true,
					AllowOfflineAccess = true,
					RedirectUris = new List<string>
					{
						"http://localhost:5173",
						"http://localhost:5173/auth-callback"
					},
					PostLogoutRedirectUris = new List<string>
					{
						"http://localhost:5173"
					},
					AllowedCorsOrigins = new List<string>
					{
						"http://localhost:5173",
						"http://localhost:3000"
					},
					AllowedScopes = new List<string>
					{
						IdentityServerConstants.StandardScopes.OpenId,
						IdentityServerConstants.StandardScopes.Profile,
						IdentityServerConstants.StandardScopes.OfflineAccess,
						"api.cleancity"
					}
				}
			};
	}
}