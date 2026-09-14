using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.ViewModels.Systems;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace KnowledgeSpace.BackendServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;

        public AuthController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        /// <summary>
        /// Đăng ký tài khoản mới
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Validate model state
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiBadRequestResponse(ModelState));
            }

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                UserName = request.UserName,
                Email = request.Email,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Dob = string.IsNullOrEmpty(request.Dob) ? null : DateTime.Parse(request.Dob),
                CreateDate = DateTime.Now,
                Status = UserStatus.Active
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                // Log chi tiết lỗi
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                Console.WriteLine($"[REGISTER ERROR] {errors}");

                return BadRequest(new ApiBadRequestResponse(result));
            }

            // Tự động assign role Citizen cho user mới
            await _userManager.AddToRoleAsync(user, SystemConstants.Roles.Citizen);

            return Ok(new
            {
                message = "Đăng ký thành công",
                userId = user.Id,
                userName = user.UserName,
                email = user.Email,
                fullName = user.FullName
            });
        }

        /// <summary>
        /// ??ng nh?p - l?y token t? IdentityServer
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var serverUrl = $"{Request.Scheme}://{Request.Host}";

            using var httpClient = new HttpClient();
            var tokenRequest = new Dictionary<string, string>
            {
                { "grant_type", "password" },
                { "client_id", "cleancity_app" },
                { "username", request.UserName },
                { "password", request.Password },
                { "scope", "openid profile api.cleancity offline_access" }
            };

            var response = await httpClient.PostAsync(
                $"{serverUrl}/connect/token",
                new FormUrlEncodedContent(tokenRequest));

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return Unauthorized(new { message = "Đăng nhập thất bại", error = errorContent });
            }

            var tokenResponse = await response.Content.ReadAsStringAsync();

            // Tr? v? token response t? IdentityServer (access_token, refresh_token, expires_in, ...)
            return Content(tokenResponse, "application/json");
        }

        /// <summary>
        /// Refresh token
        /// </summary>
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var serverUrl = $"{Request.Scheme}://{Request.Host}";

            using var httpClient = new HttpClient();
            var tokenRequest = new Dictionary<string, string>
            {
                { "grant_type", "refresh_token" },
                { "client_id", "cleancity_app" },
                { "refresh_token", request.RefreshToken }
            };

            var response = await httpClient.PostAsync(
                $"{serverUrl}/connect/token",
                new FormUrlEncodedContent(tokenRequest));

            if (!response.IsSuccessStatusCode)
            {
                return Unauthorized(new { message = "Refresh token không hợp lệ hoặc đã hết hạn" });
            }

            var tokenResponse = await response.Content.ReadAsStringAsync();
            return Content(tokenResponse, "application/json");
        }

        /// <summary>
        /// L?y thông tin user hi?n t?i (c?n g?i kèm Bearer token)
        /// </summary>
        [HttpGet("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize("Bearer")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                fullName = user.FullName,
                phoneNumber = user.PhoneNumber,
                dob = user.Dob,
                avatarUrl = user.AvatarUrl,
                totalGreenPoints = user.TotalGreenPoints,
                status = user.Status.ToString(),
                wardId = user.WardId,
                teamId = user.TeamId,
                roles = roles
            });
        }
    }

    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; }
    }
}
