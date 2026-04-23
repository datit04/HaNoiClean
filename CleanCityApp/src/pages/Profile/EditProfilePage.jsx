import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import userApi from '../../services/userApi';
import { getWards } from '../../services/wardApi';
import { swalSuccess, swalError } from '../../utils/swal';
import { getTeams } from '../../services/reportService';

export default function EditProfilePage() {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  // Lưu ý: wardId và teamId là ID, không phải tên
  // Helper: convert ISO date to yyyy-MM-dd
  const toDateInput = (d) => {
    if (!d) return '';
    if (typeof d === 'string' && d.length >= 10) return d.slice(0, 10);
    return '';
  };
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    dob: toDateInput(user?.dob),
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    wardId: user?.wardId ? String(user.wardId) : '',
    teamId: user?.teamId ? String(user.teamId) : '',
    avatar: user?.avatar || '',
    twoFA: true,
  });
  const [teams, setTeams] = useState([]);
    // Lấy danh sách phường qua API
    const [wards, setWards] = useState([]);
    const [wardsLoading, setWardsLoading] = useState(true);
    useEffect(() => {
      setWardsLoading(true);
      getWards().then(res => {
        setWards(res.data || []);
      }).finally(() => setWardsLoading(false));
    }, []);

    // Lấy danh sách đội
    useEffect(() => {
      getTeams().then(res => {
        setTeams(res.data?.items || res.data || []);
      });
    }, []);
  // Xử lý avatar preview: nếu là đường dẫn tương đối thì ghép domain
  // Luôn chuẩn hóa avatar preview thành URL đầy đủ
  const getAvatarUrl = (avatar) => {
    if (!avatar) return '';
    if (avatar.startsWith('http')) return avatar;
    return `https://localhost:5002${avatar}`;
  };
  const [avatarPreview, setAvatarPreview] = useState(getAvatarUrl(form.avatar));

  // Luôn đồng bộ avatarPreview với user.avatar/avatarUrl khi user thay đổi
  useEffect(() => {
    const url = getAvatarUrl(user?.avatar || user?.avatarUrl || '');
    setAvatarPreview(url);
    setForm((prev) => ({
      ...prev,
      fullName: user?.fullName || '',
      dob: toDateInput(user?.dob),
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      wardId: user?.wardId ? String(user.wardId) : '',
      teamId: user?.teamId ? String(user.teamId) : '',
      avatar: user?.avatar || user?.avatarUrl || '',
    }));
  }, [user?.avatar, user?.avatarUrl, user?.fullName, user?.dob, user?.email, user?.phoneNumber, user?.wardId, user?.teamId]);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('dob', form.dob);
      formData.append('email', form.email);
      formData.append('phoneNumber', form.phoneNumber);
      // Gửi đúng tên trường wardId và teamId (chữ thường) giống logic thêm báo cáo
      if (form.wardId !== '' && !isNaN(Number(form.wardId))) {
        formData.append('wardId', Number(form.wardId));
      }
      if (form.teamId !== '' && !isNaN(Number(form.teamId))) {
        formData.append('teamId', Number(form.teamId));
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      // Có thể bổ sung các trường khác nếu cần
      await userApi.updateProfile(user.id, formData);
      // Debug: log lại formData gửi đi
      // for (let pair of formData.entries()) {
      //   console.log(pair[0]+ ': ' + pair[1]);
      // }
      // Lấy lại thông tin user mới nhất bằng id để đảm bảo đồng bộ
      const res = await userApi.getById(user.id);
      if (setUser) setUser(res.data);
      swalSuccess('Lưu thay đổi thành công!');
      navigate('/profile');
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      let msg = 'Cập nhật thất bại!';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') msg += '\n' + err.response.data;
        else if (err.response.data.message) msg += '\n' + err.response.data.message;
        else if (err.response.data.error) msg += '\n' + err.response.data.error;
        else msg += '\n' + JSON.stringify(err.response.data);
      } else if (err.message) {
        msg += '\n' + err.message;
      }
      swalError('Cập nhật thất bại', msg);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Side Navigation - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <nav className="flex flex-col space-y-2">
            <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-[#206223] hover:bg-[#dee5d6]/50 rounded-lg transition-transform translate-x-1" href="#">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-medium">Dashboard</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-[#206223] hover:bg-[#dee5d6]/50 rounded-lg" href="#">
              <span className="material-symbols-outlined">potted_plant</span>
              <span className="font-medium">Reports</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-[#206223] hover:bg-[#dee5d6]/50 rounded-lg" href="#">
              <span className="material-symbols-outlined">leaderboard</span>
              <span className="font-medium">Impact</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 bg-[#dee5d6] text-[#206223] font-bold rounded-lg" href="#">
              <span className="material-symbols-outlined">person</span>
              <span className="font-medium">Profile</span>
            </a>
          </nav>
        </aside>
        {/* Main Content Area */}
        <div className="flex-1 max-w-3xl">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Thay đổi thông tin cá nhân</h1>
          </header>
          {/* Avatar Upload Section */}
          <section className="bg-surface-container-low p-8 rounded-3xl mb-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-highest ring-4 ring-primary-fixed/30">
                  <img alt="Profile Preview" src={avatarPreview || '/default-avatar.png'} className="w-full h-full object-cover" />
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer">
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold mb-1">Ảnh của bạn</h3>
                <p className="text-sm text-on-surface-variant mb-4">Tải lên một bức ảnh rõ ràng để giúp đội nhận diện bạn trong các sự kiện dọn dẹp.</p>
                <div className="flex gap-3 justify-center sm:justify-start">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">Tải lên mới</button>
                  <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(''); setForm(prev => ({ ...prev, avatar: '' })); }} className="text-primary font-semibold text-sm px-4 py-2 hover:bg-surface-container-highest rounded-xl transition-colors">Xóa</button>
                </div>
              </div>
            </div>
          </section>
          {/* Personal Information Form */}
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="bg-surface-container-low p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">badge</span>
                Thông tin cá nhân
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface-variant px-1">Họ và tên</label>
                  <input name="fullName" className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface font-medium" type="text" value={form.fullName} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface-variant px-1">Ngày sinh</label>
                  <input name="dob" className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface font-medium" type="date" value={form.dob} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface-variant px-1">Địa chỉ Email</label>
                  <div className="relative">
                    <input name="email" className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-on-surface-variant font-medium cursor-not-allowed opacity-75" readOnly type="email" value={form.email} />
                    <span className="absolute right-3 top-3 flex items-center gap-1 text-primary text-xs font-bold bg-primary-fixed/30 px-2 py-1 rounded-full">
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      Verified
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface-variant px-1">Số điện thoại</label>
                  <input name="phoneNumber" className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface font-medium" type="tel" value={form.phoneNumber} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface-variant px-1">Phường/xã hiện tại</label>
                  <select
                    name="wardId"
                    className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface font-medium appearance-none"
                    value={form.wardId}
                    onChange={handleChange}
                    disabled={wardsLoading}
                  >
                    <option value="">Chọn phường</option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.name} {ward.districtName ? `- ${ward.districtName}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface-variant px-1">Đội hiện tại</label>
                  <select
                    name="teamId"
                    className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface font-medium appearance-none"
                    value={form.teamId}
                    onChange={handleChange}
                  >
                    <option value="">Chọn đội</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* Security Settings */}
            <div className="bg-surface-container-low p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">security</span>
                Cài đặt bảo mật
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">vibration</span>
                    </div>
                    <div>
                      <h4 className="font-bold">Xác thực hai yếu tố</h4>
                      <p className="text-sm text-on-surface-variant">Bảo vệ tài khoản của bạn với một lớp bảo mật bổ sung.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input name="twoFA" type="checkbox" className="sr-only peer" checked={form.twoFA} onChange={handleChange} />
                    <div className="w-11 h-6 bg-outline-variant/30 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <a href="#" className="flex items-center justify-between p-4 bg-surface-container-highest rounded-2xl group hover:bg-surface-variant transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined">key</span>
                    </div>
                    <div>
                      <h4 className="font-bold">Đổi mật khẩu</h4>
                      <p className="text-sm text-on-surface-variant">Cập nhật thông tin đăng nhập của bạn định kỳ.</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
                </a>
              </div>
            </div>
            {/* Action Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              <button type="submit" className="btn-primary w-full sm:w-auto px-10 py-4 rounded-2xl text-lg shadow-xl hover:scale-[1.02] transition-transform">
                Lưu thay đổi
              </button>
              <button type="button" className="w-full sm:w-auto px-10 py-4 bg-transparent text-primary font-bold text-lg border border-outline-variant/15 hover:bg-surface-container-highest transition-colors rounded-2xl" onClick={() => navigate('/profile')}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
