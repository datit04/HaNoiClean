import React from "react";

export default function RoleList({ roles, onDelete, onEditPermissions }) {
  return (
    <div className="bg-surface rounded-3xl border border-outline-variant overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container">
            <th className="px-5 py-4 text-left font-semibold text-on-surface-variant">Tên Vai trò</th>
            <th className="px-5 py-4 text-left font-semibold text-on-surface-variant">ID Định danh</th>
            <th className="px-5 py-4 text-right font-semibold text-on-surface-variant">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {roles.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-5 py-12 text-center text-on-surface-variant">Chưa có vai trò nào</td>
            </tr>
          ) : (
            roles.map((role) => (
              <tr key={role.id} className="border-b border-outline-variant/50 hover:bg-surface-container/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                    </div>
                    <div>
                      <div className="font-semibold text-on-surface">{role.name}</div>
                      <div className="text-xs text-on-surface-variant">{role.normalizedName || role.name?.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">{role.id}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors" title="Phân quyền" onClick={() => onEditPermissions && onEditPermissions(role)}>
                      <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                    </button>
                    <button className="p-2 rounded-xl hover:bg-error/10 text-error transition-colors" title="Xóa" onClick={() => onDelete && onDelete(role.id)}>
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
