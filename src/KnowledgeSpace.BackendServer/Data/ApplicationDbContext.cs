using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Data.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace KnowledgeSpace.BackendServer.Data
{
	public class ApplicationDbContext : IdentityDbContext<User>
	{
		public ApplicationDbContext(DbContextOptions options) : base(options)
		{
		}

		public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
		{
			IEnumerable<EntityEntry> modified = ChangeTracker.Entries()
				.Where(e => e.State == EntityState.Modified || e.State == EntityState.Added);
			foreach (EntityEntry item in modified)
			{
				if (item.Entity is IDateTracking changedOrAddedItem)
				{
					if (item.State == EntityState.Added)
					{
						changedOrAddedItem.CreateDate = DateTime.Now;
					}
					else
					{
						changedOrAddedItem.LastModifiedDate = DateTime.Now;
					}
				}
			}
			return base.SaveChangesAsync(cancellationToken);
		}

		protected override void OnModelCreating(ModelBuilder builder)
		{
			base.OnModelCreating(builder);

			builder.Entity<IdentityRole>().Property(x => x.Id).HasMaxLength(50).IsUnicode(false);
			builder.Entity<User>().Property(x => x.Id).HasMaxLength(50).IsUnicode(false);
		}

		public DbSet<Category> Categories { set; get; }
		public DbSet<Report> Reports { set; get; }

		public DbSet<Ward> Wards { get; set; }
		public DbSet<Team> Teams { get; set; }
		public DbSet<TrashBin> TrashBins { get; set; }
		public DbSet<UserGreenPoint> UserGreenPoints { get; set; }
		public DbSet<ReportProgress> ReportProgresses { get; set; }
	}
}