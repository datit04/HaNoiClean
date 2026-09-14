namespace KnowledgeSpace.ViewModels.Contents
{
    public class TeamPerformanceVm
    {
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public int MemberCount { get; set; }
        public int TotalAssignedReports { get; set; }
        public int CompletedReports { get; set; }
        public int InProgressReports { get; set; }
        public int RejectedReports { get; set; }
        public double CompletionRate { get; set; }
        public double? AverageProcessingHours { get; set; }
        public string? WardName { get; set; }
        public string? CategoryName { get; set; }
    }
}
