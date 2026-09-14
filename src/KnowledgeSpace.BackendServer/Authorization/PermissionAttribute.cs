using Microsoft.AspNetCore.Mvc;

namespace KnowledgeSpace.BackendServer.Authorization
{
    public class PermissionAttribute : TypeFilterAttribute
    {
        public PermissionAttribute(string permission)
            : base(typeof(PermissionFilter))
        {
            Arguments = new object[] { permission };
        }
    }
}
