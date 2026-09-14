namespace KnowledgeSpace.ViewModels.Contents
{
    public class ReportProgressVm
    {
        public long Id { get; set; }
        public long ReportId { get; set; }
        public int Status { get; set; }
        public string? StatusName { get; set; }
        public string? Note { get; set; }
        public string? Description { get; set; }
        public string? ImageAfterUrl { get; set; }
        public string? UpdatedBy { get; set; }
        public string? UpdatedByName { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
