namespace KnowledgeSpace.ViewModels.Systems
{
	public class UserVm
	{
		public string Id { get; set; }

		public string UserName { get; set; }

		public string Email { get; set; }

		public string PhoneNumber { get; set; }

		public string FullName { get; set; }

		public DateTime? Dob { get; set; }

		public string? AvatarUrl { get; set; }

		public int TotalGreenPoints { get; set; }

		public string Status { get; set; }

		public int? WardId { get; set; }

		public int? TeamId { get; set; }

		public DateTime CreateDate { get; set; }
	}
}