using System.ComponentModel.DataAnnotations;

namespace KnowledgeSpace.ViewModels.Systems
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Tên ??ng nh?p là b?t bu?c")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Tên ??ng nh?p ph?i t? 3-50 ký t?")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "M?t kh?u là b?t bu?c")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "M?t kh?u ph?i có ít nh?t 6 ký t?")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Email là b?t bu?c")]
        [EmailAddress(ErrorMessage = "Email không h?p l?")]
        public string Email { get; set; }

        // Optional fields - FE không c?n g?i
        public string? FullName { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Dob { get; set; }
    }
}
