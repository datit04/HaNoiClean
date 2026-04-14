using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KnowledgeSpace.BackendServer.Data.Entities
{
    [Table("UserGreenPoints")]
    public class UserGreenPoint
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [MaxLength(50)]
        [Column(TypeName = "varchar(50)")]
        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public int Points { get; set; }

        [MaxLength(200)]
        public string? Reason { get; set; }

        public long? ReportId { get; set; }

        [ForeignKey("ReportId")]
        public Report? Report { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
