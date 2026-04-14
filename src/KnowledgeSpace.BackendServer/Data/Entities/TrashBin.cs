using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KnowledgeSpace.BackendServer.Data.Entities
{
    [Table("TrashBins")]
    public class TrashBin
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [MaxLength(50)]
        public string? Code { get; set; }

        [MaxLength(500)]
        public string? QrCode { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        public int WardId { get; set; }

        [ForeignKey("WardId")]
        public Ward? Ward { get; set; }

        [MaxLength(200)]
        public string? Schedule { get; set; }

        public DateTime? LastCollected { get; set; }

        public bool IsActive { get; set; }
    }
}
