using Microsoft.AspNetCore.Http;

namespace KnowledgeSpace.ViewModels.Systems
{
    public class UserUpdateRequest
    {
        public string FullName { get; set; }

        public string? Dob { get; set; }

        public string Email { get; set; }

        public string PhoneNumber { get; set; }

        public IFormFile? Avatar { get; set; }

        public int? WardId { get; set; }

        public int? TeamId { get; set; }

        public string? RoleId { get; set; }

        public string? Status { get; set; }
    }
}
