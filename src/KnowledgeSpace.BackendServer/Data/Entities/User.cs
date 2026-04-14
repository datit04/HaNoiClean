using KnowledgeSpace.BackendServer.Data.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KnowledgeSpace.BackendServer.Data.Entities
{
	public enum UserStatus
	{
		Active = 0,
		Inactive = 1,
		Banned = 2
	}

	public class User : IdentityUser, IDateTracking
	{
		public User()
		{
		}

		public User(string id, string userName, string fullName,
			string email, string phoneNumber, DateTime dob)
		{
			Id = id;
			UserName = userName;
			FullName = fullName;
			Email = email;
			PhoneNumber = phoneNumber;
			Dob = dob;
		}

		[MaxLength(100)]
		[Required]
		public string FullName { get; set; }

		public DateTime? Dob { get; set; }

		[MaxLength(500)]
		public string? AvatarUrl { get; set; }

		public int TotalGreenPoints { get; set; } = 0;

		public UserStatus Status { get; set; } = UserStatus.Active;

		public int? WardId { get; set; }

		[ForeignKey("WardId")]
		public Ward? Ward { get; set; }

		public int? TeamId { get; set; }

		[ForeignKey("TeamId")]
		public Team? Team { get; set; }

		public DateTime CreateDate { get; set; }
		public DateTime? LastModifiedDate { get; set; }
	}
}