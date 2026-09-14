namespace KnowledgeSpace.ViewModels.Contents
{
    public class CommentAuthorVm
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; } // "Citizen", "Staff", "Admin"
    }

    public class ReportCommentVm
    {
        public long Id { get; set; }
        public long ReportId { get; set; }
        public string Content { get; set; }
        public string? ImageUrl { get; set; }
        public long? ParentCommentId { get; set; }
        public int RepliesCount { get; set; }
        public List<ReportCommentVm>? Replies { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public CommentAuthorVm Author { get; set; }
    }
}
