using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace KnowledgeSpace.ViewModels.Contents
{
    public class CreateReportRequest
    {
        [MaxLength(1000)]
        public string? Description { get; set; }

        public IFormFile? Image { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public int? WardId { get; set; }

        [Required(ErrorMessage = "CategoryId is required")]
        public int CategoryId { get; set; }

        public int Priority { get; set; } = 2;
    }
}
