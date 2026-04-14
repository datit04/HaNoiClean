using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KnowledgeSpace.BackendServer.Data.Entities
{
    [Table("Teams")]
    public class Team
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [MaxLength(100)]
        [Required]
        public string Name { get; set; }

        public int? WardId { get; set; }

        [ForeignKey("WardId")]
        public Ward? Ward { get; set; }

        [MaxLength(50)]
        [Column(TypeName = "varchar(50)")]
        public string? LeaderId { get; set; }

        [ForeignKey("LeaderId")]
        public User? Leader { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
