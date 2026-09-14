using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace KnowledgeSpace.ViewModels.Contents
{
    public class CreateCommentRequest
    {
        [Required(ErrorMessage = "Content is required")]
        [MaxLength(2000, ErrorMessage = "Content cannot exceed 2000 characters")]
        public string Content { get; set; }

        public IFormFile? Image { get; set; }

        public long? ParentCommentId { get; set; }
    }

    public class UpdateCommentRequest
    {
        [Required(ErrorMessage = "Content is required")]
        [MaxLength(2000, ErrorMessage = "Content cannot exceed 2000 characters")]
        public string Content { get; set; }

        public IFormFile? Image { get; set; }
    }
}
