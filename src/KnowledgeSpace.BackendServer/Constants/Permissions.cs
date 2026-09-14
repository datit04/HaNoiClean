namespace KnowledgeSpace.BackendServer.Constants
{
    public class PermissionItem
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public string Group { get; set; }
    }

    public static class Permissions
    {
        public static readonly List<PermissionItem> All = new()
        {
            // Users
            new() { Id = "Users.View",           Description = "Xem danh sách người dùng",       Group = "Users" },
            new() { Id = "Users.Create",         Description = "Tạo người dùng mới",             Group = "Users" },
            new() { Id = "Users.Update",         Description = "Cập nhật người dùng",            Group = "Users" },
            new() { Id = "Users.Delete",         Description = "Xóa người dùng",                 Group = "Users" },

            // Roles
            new() { Id = "Roles.View",           Description = "Xem danh sách vai trò",          Group = "Roles" },
            new() { Id = "Roles.Create",         Description = "Tạo vai trò mới",                Group = "Roles" },
            new() { Id = "Roles.Update",         Description = "Cập nhật vai trò",               Group = "Roles" },
            new() { Id = "Roles.Delete",         Description = "Xóa vai trò",                    Group = "Roles" },

            // Reports
            new() { Id = "Reports.Create",       Description = "Tạo báo cáo",                    Group = "Reports" },
            new() { Id = "Reports.View",         Description = "Xem báo cáo",                    Group = "Reports" },
            new() { Id = "Reports.UpdateStatus", Description = "Cập nhật trạng thái báo cáo",    Group = "Reports" },
            new() { Id = "Reports.Assign",       Description = "Giao báo cáo cho đội",           Group = "Reports" },
            new() { Id = "Reports.Delete",       Description = "Xóa báo cáo",                    Group = "Reports" },

            // Categories
            new() { Id = "Categories.Create",    Description = "Tạo danh mục",                   Group = "Categories" },
            new() { Id = "Categories.Update",    Description = "Cập nhật danh mục",              Group = "Categories" },
            new() { Id = "Categories.Delete",    Description = "Xóa danh mục",                   Group = "Categories" },

            // Wards
            new() { Id = "Wards.Create",         Description = "Tạo phường/xã",                  Group = "Wards" },
            new() { Id = "Wards.Update",         Description = "Cập nhật phường/xã",             Group = "Wards" },
            new() { Id = "Wards.Delete",         Description = "Xóa phường/xã",                  Group = "Wards" },

            // Categories
            new() { Id = "Categories.View",     Description = "Xem danh mục",                   Group = "Categories" },
            new() { Id = "Categories.Create",   Description = "Tạo danh mục",                   Group = "Categories" },

            // Wards  
            new() { Id = "Wards.View",          Description = "Xem phường/xã",                  Group = "Wards" },

            // Teams
            new() { Id = "Teams.View",          Description = "Xem đội",                        Group = "Teams" },

            // TrashBins
            new() { Id = "TrashBins.View",      Description = "Xem thùng rác",                  Group = "TrashBins" },

            // GreenPoints
            new() { Id = "GreenPoints.View",    Description = "Xem điểm xanh",                 Group = "GreenPoints" },
            // Teams
            new() { Id = "Teams.Create",         Description = "Tạo đội",                        Group = "Teams" },
            new() { Id = "Teams.Update",         Description = "Cập nhật đội",                   Group = "Teams" },
            new() { Id = "Teams.Delete",         Description = "Xóa đội",                        Group = "Teams" },

            // TrashBins
            new() { Id = "TrashBins.Create",     Description = "Tạo thùng rác",                  Group = "TrashBins" },
            new() { Id = "TrashBins.Update",     Description = "Cập nhật thùng rác",             Group = "TrashBins" },
            new() { Id = "TrashBins.Delete",     Description = "Xóa thùng rác",                  Group = "TrashBins" },

            // GreenPoints
            new() { Id = "GreenPoints.Add",      Description = "Thêm điểm xanh",                Group = "GreenPoints" },

            // Permissions
            new() { Id = "Permissions.View",     Description = "Xem danh sách quyền",            Group = "Permissions" },
            new() { Id = "Permissions.Update",   Description = "Cập nhật/gán quyền",             Group = "Permissions" },
        };
    }
}