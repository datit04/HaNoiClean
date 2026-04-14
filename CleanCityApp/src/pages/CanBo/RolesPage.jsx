import React, { useState, useEffect } from "react";
import RoleList from "./components/RoleList";
import AddRoleModal from "./components/AddRoleModal";
import roleApi from '../../services/roleApi';
import { swalError, swalConfirm } from '../../utils/swal';

export default function RolesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await roleApi.getAll();
      setRoles(res.data);
    } catch (err) {
      setError('Không thể tải danh sách vai trò');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async (role) => {
    try {
      await roleApi.create({ id: role.id, name: role.name });
      fetchRoles();
      setShowAddModal(false);
    } catch (err) {
      swalError('Không thể thêm vai trò mới');
    }
  };

  const handleDeleteRole = async (id) => {
    if (!(await swalConfirm('Bạn có chắc muốn xóa vai trò này?'))) return;
    try {
      await roleApi.delete(id);
      setRoles(roles.filter(r => r.id !== id));
    } catch (err) {
      swalError('Không thể xóa vai trò');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight leading-tight">Quản lý Vai trò</h1>
          <p className="text-on-surface-variant text-lg font-medium leading-relaxed">
            Thiết lập và phân quyền truy cập cho các tài khoản trong hệ thống quản lý đô thị. Đảm bảo đúng người, đúng việc.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2 px-6 py-4"
          onClick={() => setShowAddModal(true)}
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span>Thêm Vai trò Mới</span>
        </button>
      </div>
      {error && <div className="text-error font-bold">{error}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <RoleList roles={roles} onDelete={handleDeleteRole} />
      )}
      {showAddModal && (
        <AddRoleModal onClose={() => setShowAddModal(false)} onAdd={handleAddRole} />
      )}
    </div>
  );
}
