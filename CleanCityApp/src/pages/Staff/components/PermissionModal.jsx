import React, { useState, useEffect } from "react";
import permissionApi from "../../../services/permissionApi";
import { swalSuccess, swalError } from "../../../utils/swal";
import { useAuth } from "../../../contexts/AuthContext";

const GROUP_ICONS = {
  Users: "person",
  Roles: "security",
  Permissions: "admin_panel_settings",
  Reports: "description",
  Categories: "category",
  Wards: "location_city",
  Teams: "groups",
  TrashBins: "delete",
  GreenPoints: "eco",
};

const GROUP_LABELS = {
  Users: "Người dùng",
  Roles: "Vai trò",
  Permissions: "Quyền hạn",
  Reports: "Báo cáo",
  Categories: "Danh mục",
  Wards: "Phường/Xã",
  Teams: "Đội nhóm",
  TrashBins: "Thùng rác",
  GreenPoints: "Điểm xanh",
};

export default function PermissionModal({ role, onClose, onUpdated }) {
  const [allPermissions, setAllPermissions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { refreshPermissions } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [allRes, roleRes] = await Promise.all([
          permissionApi.getAll(),
          permissionApi.getByRole(role.id),
        ]);
        setAllPermissions(allRes.data); // [{ id, description, group }, ...]
        setSelected(roleRes.data);      // ["Users.View", "Roles.Create", ...]
      } catch {
        swalError("Không thể tải danh sách quyền");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role.id]);

  // Group permissions by their `group` field from BE
  const grouped = {};
  for (const perm of allPermissions) {
    const g = perm.group || "Other";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(perm);
  }

  const toggle = (permId) => {
    setSelected((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const toggleGroup = (perms) => {
    const ids = perms.map((p) => p.id);
    const allSelected = ids.every((id) => selected.includes(id));
    if (allSelected) {
      setSelected((prev) => prev.filter((p) => !ids.includes(p)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await permissionApi.updateByRole(role.id, selected);
      swalSuccess("Đã cập nhật quyền hạn!");
      await refreshPermissions();
      onUpdated?.();
      onClose();
    } catch (err) {
      if (err.response?.status !== 403) swalError("Cập nhật quyền thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/20 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">
              Phân quyền
            </h3>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              Vai trò:{" "}
              <span className="font-bold text-primary">{role.name}</span>
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
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-on-surface-variant">
              Đang tải quyền hạn...
            </div>
          ) : (
            Object.entries(grouped).map(([group, perms]) => {
              const ids = perms.map((p) => p.id);
              const allChecked = ids.every((id) => selected.includes(id));
              const someChecked =
                !allChecked && ids.some((id) => selected.includes(id));
              return (
                <div
                  key={group}
                  className="bg-surface-container-low rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="accent-primary w-4 h-4 cursor-pointer"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someChecked;
                      }}
                      onChange={() => toggleGroup(perms)}
                    />
                    <span className="material-symbols-outlined text-primary">
                      {GROUP_ICONS[group] || "lock"}
                    </span>
                    <span className="font-bold text-on-surface text-sm">
                      {GROUP_LABELS[group] || group}
                    </span>
                    <span className="text-xs text-on-surface-variant ml-auto">
                      {ids.filter((id) => selected.includes(id)).length}/
                      {perms.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-7">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm ${
                          selected.includes(perm.id)
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-surface-container text-on-surface-variant"
                        }`}
                        title={perm.id}
                      >
                        <input
                          type="checkbox"
                          className="accent-primary w-3.5 h-3.5"
                          checked={selected.includes(perm.id)}
                          onChange={() => toggle(perm.id)}
                        />
                        {perm.description || perm.id}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-outline-variant/10 flex items-center justify-between shrink-0">
          <p className="text-xs text-on-surface-variant">
            <span className="font-bold text-primary">{selected.length}</span>/
            {allPermissions.length} quyền đang chọn
          </p>
          <div className="flex items-center gap-3">
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
              {saving ? "Đang lưu..." : "Lưu quyền hạn"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
