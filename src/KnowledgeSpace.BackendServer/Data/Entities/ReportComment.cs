using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KnowledgeSpace.BackendServer.Data.Entities
{
    [Table("ReportComments")]
    public class ReportComment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        public long ReportId { get; set; }

        [ForeignKey("ReportId")]
        public Report? Report { get; set; }

        [MaxLength(50)]
        [Column(TypeName = "varchar(50)")]
        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public long? ParentCommentId { get; set; }

        [ForeignKey("ParentCommentId")]
        public ReportComment? ParentComment { get; set; }

        public ICollection<ReportComment>? Replies { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
