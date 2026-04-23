import React, { useState } from "react";

function generateUUID() {
  // Simple UUID generator for demo
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function AddRoleModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [id, setId] = useState(generateUUID());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name, normalizedName: name.toUpperCase().replace(/ /g, '_'), id });
  };

  return (
    <div className="modal-overlay">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/20">
        <div className="relative h-32 w-full">
          <img className="w-full h-full object-cover" alt="city" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD5HWVQ6QRsJS2qDS1mtYsFS3HaCJIeC15w4gqAR1R2RCiLNf8xtJIW_SO5jIE8eIeKIEolRbYl9-oWQ0_H1s2NuYocHpzAXjgGtBw9PeFD_osNn8XEgAHK-tOt7FPiBKy13FuGa43C3QmjpgS_BdkY8UqMo8MPi7LChCWkrmvMjkLxp7-T_oFv0gtwxUY2G12CgZUzXhmblZBsxhI-AMVT4Oz9gtwyxN8JvNlvvxHmzV3zRra-6eborVlnSD1Ui0mX4LixNnFvlz3" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
          <div className="absolute bottom-4 left-8">
            <h3 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">Thêm Vai trò Mới</h3>
            <p className="text-sm text-on-surface-variant font-medium">Cung cấp chi tiết quyền hạn hệ thống</p>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 bg-surface-container-lowest/80 backdrop-blur-md p-2 rounded-full text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form className="px-8 py-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block section-label text-tertiary" htmlFor="role_name">Tên Vai trò</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">badge</span>
              <input className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface font-medium placeholder:text-outline-variant" id="role_name" placeholder="Ví dụ: Quản trị viên cấp cao" type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block section-label text-tertiary" htmlFor="stamp">Concurrency Stamp</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">fingerprint</span>
              <input className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface-variant font-mono text-sm" id="stamp" type="text" value={id} readOnly />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary-container p-1" title="Tạo mới" onClick={() => setId(generateUUID())}>
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>
            <p className="text-[10px] text-tertiary/60 italic px-1">Mã định danh duy nhất để tránh xung đột dữ liệu đồng thời.</p>
          </div>
          <div className="bg-secondary-container/10 p-4 rounded-xl flex gap-3 items-start border border-secondary-container/20">
            <span className="material-symbols-outlined text-secondary text-sm mt-0.5">info</span>
            <p className="text-xs text-on-secondary-container leading-relaxed">
              Vai trò mới sẽ được khởi tạo với các quyền mặc định. Bạn có thể tùy chỉnh chi tiết phân quyền trong phần <strong>Cài đặt Nâng cao</strong> sau khi lưu.
            </p>
          </div>
          <div className="flex items-center justify-end gap-4 pt-2">
            <button type="button" className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-variant transition-colors" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary px-8 py-3 hover:shadow-primary/20">
              Lưu Vai trò
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
