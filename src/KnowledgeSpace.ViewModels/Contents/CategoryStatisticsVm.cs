namespace KnowledgeSpace.ViewModels.Contents
{
    public class CategoryStatisticsVm
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public int TotalCount { get; set; }
        public decimal Percentage { get; set; }
        public int Total { get; set; }
    }
}
