using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KnowledgeSpace.BackendServer.Data.Entities
{
	[Table("Categories")]
	public class Category
	{
		[Key]
		[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int Id { get; set; }

		[MaxLength(100)]
		[Required]
		public string Name { get; set; }

		[MaxLength(50)]
		public string? Icon { get; set; }

		[MaxLength(20)]
		public string? Color { get; set; }

		public bool IsActive { get; set; }
	}
}