import React from "react";

export default function RoleList({ roles, onDelete, onEditPermissions }) {
  return (
    <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-high/50">
            <th className="px-8 py-5 text-on-surface-variant font-bold text-xs uppercase tracking-widest">Tên Vai trò</th>
            <th className="px-8 py-5 text-on-surface-variant font-bold text-xs uppercase tracking-widest">ID Định danh</th>
            <th className="px-8 py-5 text-on-surface-variant font-bold text-xs uppercase tracking-widest text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-variant/30">
          {roles.map((role, idx) => (
            <tr key={role.id} className="group hover:bg-surface-container-low/40 transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">{role.name}</div>
                    <div className="text-xs text-on-surface-variant">{role.normalizedName || role.name?.toUpperCase()}</div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">{role.id}</span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors" title="Phân quyền" onClick={() => onEditPermissions && onEditPermissions(role)}>
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                  </button>
                  <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors" title="Xóa" onClick={() => onDelete && onDelete(role.id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
