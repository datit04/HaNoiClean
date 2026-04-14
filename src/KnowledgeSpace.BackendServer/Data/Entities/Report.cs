using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KnowledgeSpace.BackendServer.Data.Entities
{
	[Table("Reports")]
	public class Report
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

		public double Latitude { get; set; }

		public double Longitude { get; set; }

		[MaxLength(500)]
		public string? ImageUrl { get; set; }

		[MaxLength(1000)]
		public string? Description { get; set; }

		public int CategoryId { get; set; }

		[ForeignKey("CategoryId")]
		public Category? Category { get; set; }

		public int? AiSuggestedCategoryId { get; set; }

		public double? AiConfidence { get; set; }

		public ReportPriority Priority { get; set; }

		public ReportStatus Status { get; set; }

		public int? WardId { get; set; }

		[ForeignKey("WardId")]
		public Ward? Ward { get; set; }

		public int? AssignedTeamId { get; set; }

		[ForeignKey("AssignedTeamId")]
		public Team? AssignedTeam { get; set; }

		public DateTime? ProcessedAt { get; set; }

		public DateTime? CompletedAt { get; set; }

		public DateTime CreatedAt { get; set; }

		public DateTime? UpdatedAt { get; set; }
	}
}