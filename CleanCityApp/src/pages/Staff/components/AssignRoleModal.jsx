import React, { useState, useEffect } from "react";
import roleApi from "../../../services/roleApi";
import userApi from "../../../services/userApi";
import { swalSuccess, swalError } from "../../../utils/swal";

export default function AssignRoleModal({ user, onClose, onUpdated }) {
  const [allRoles, setAllRoles] = useState([]);
  const [currentRoles, setCurrentRoles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rolesRes, userRolesRes] = await Promise.all([
          roleApi.getAll(),
          userApi.getRoles(user.id),
        ]);
        setAllRoles(rolesRes.data);
        setCurrentRoles(userRolesRes.data);
        setSelected(userRolesRes.data);
      } catch {
        swalError("Không thể tải thông tin vai trò");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const toggle = (roleName) => {
    setSelected((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toAdd = selected.filter((r) => !currentRoles.includes(r));
      const toRemove = currentRoles.filter((r) => !selected.includes(r));

      if (toRemove.length > 0) {
        await userApi.removeRoles(user.id, toRemove);
      }
      if (toAdd.length > 0) {
        await userApi.assignRoles(user.id, toAdd);
      }

      swalSuccess("Đã cập nhật vai trò!");
      onUpdated?.();
      onClose();
    } catch (err) {
      if (err.response?.status !== 403) swalError("Cập nhật vai trò thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/20">
        {/* Header */}
        <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
          <div>
            <h3 className="font-headline font-extrabold text-xl text-on-surface tracking-tight">
              Gán vai trò
            </h3>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              <span className="font-bold text-primary">
                {user.fullName || user.userName}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-on-surface-variant">
              Đang tải...
            </div>
          ) : allRoles.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">
              Chưa có vai trò nào trong hệ thống
            </div>
          ) : (
            allRoles.map((role) => (
              <label
                key={role.id}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-colors ${
                  selected.includes(role.name)
                    ? "bg-primary/10 ring-2 ring-primary/30"
                    : "bg-surface-container-low hover:bg-surface-container"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-primary w-4 h-4"
                  checked={selected.includes(role.name)}
                  onChange={() => toggle(role.name)}
                />
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    security
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-on-surface text-sm">
                    {role.name}
                  </div>
                  <div className="text-xs text-on-surface-variant font-mono truncate">
                    {role.id}
                  </div>
                </div>
              </label>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-outline-variant/10 flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="btn-primary px-8 py-3 hover:shadow-primary/20 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Đang lưu..." : "Lưu vai trò"}
          </button>
        </div>
      </div>
    </div>
  );
}
