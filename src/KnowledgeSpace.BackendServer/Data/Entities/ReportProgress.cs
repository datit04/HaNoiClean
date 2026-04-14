using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KnowledgeSpace.BackendServer.Data.Entities
{
    public enum ReportStatus
    {
        Submitted = 0,
        Received = 1,
        InProgress = 2,
        Completed = 3,
        Rejected = 4
    }

    public enum ReportPriority
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Urgent = 4
    }

    [Table("ReportProgress")]
    public class ReportProgress
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        public long ReportId { get; set; }

        [ForeignKey("ReportId")]
        public Report? Report { get; set; }

        public ReportStatus Status { get; set; }

        [MaxLength(1000)]
        public string? Note { get; set; }

        [MaxLength(500)]
        public string? ImageAfterUrl { get; set; }

        [MaxLength(50)]
        [Column(TypeName = "varchar(50)")]
        public string? UpdatedBy { get; set; }

        [ForeignKey("UpdatedBy")]
        public User? UpdatedByUser { get; set; }

        [MaxLength(200)]
        public string? UpdatedByName { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
