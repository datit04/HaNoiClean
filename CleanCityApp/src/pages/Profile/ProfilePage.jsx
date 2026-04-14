import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getTeams } from '../../services/teamApi';
import { getWards } from '../../services/wardApi';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wards, setWards] = useState([]);
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    getWards().then(res => {
      setWards(res.data || []);
    });
    getTeams().then(res => {
      setTeams(res.data?.items || res.data || []);
    });
  }, []);

  // Map wardId/teamId sang tên, chỉ hiển thị tên, không hiển thị id nếu không tìm thấy
  const wardName = (user?.wardId && Array.isArray(wards))
    ? (wards.find(w => String(w.id) === String(user.wardId))?.name || '')
    : '';
  const teamName = (user?.teamId && Array.isArray(teams))
    ? (teams.find(t => String(t.id) === String(user.teamId))?.name || '')
    : '';

  // Hiển thị avatar và thông tin user thực tế
  // Xử lý avatar: nếu là đường dẫn tương đối thì ghép domain
  let avatar = user?.avatar || user?.avatarUrl || '';
  if (avatar && !avatar.startsWith('http')) {
    avatar = `https://localhost:5002${avatar}`;
  }
  const profile = user ? {
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    dob: user.dob,
    status: user.status || 'Active',
    memberSince: user.createDate ? new Date(user.createDate).toLocaleDateString('vi-VN') : '',
    ward: wardName,
    team: teamName,
    wardId: user.wardId,
    teamId: user.teamId,
    ecoStatus: user.ecoStatus || '',
    avatar,
    totalGreenPoints: user.totalGreenPoints || 0,
  } : {};

  const handleEdit = () => navigate('/profile/edit');

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10">
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 relative">
          <div className="aspect-square rounded-[2rem] overflow-hidden bg-surface-container-highest shadow-xl">
            <img alt="User profile photo" className="w-full h-full object-cover" src={profile.avatar || '/default-avatar.png'} />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-primary text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="text-sm font-bold uppercase tracking-wider">Đã bảo vệ</span>
          </div>
        </div>
        <div className="lg:col-span-8 space-y-6 pt-4 lg:pt-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-on-surface leading-tight tracking-tight">{profile.fullName}</h1>
            <p className="text-tertiary font-medium mt-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">location_on</span>
              Phường/Xã: {profile.ward}, Đội: {profile.team}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-primary-container text-on-primary-container p-6 rounded-[1.5rem] flex items-center justify-between group overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Tổng điểm xanh</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black headline tracking-tighter">{profile.totalGreenPoints}</span>
                  <span className="text-lg font-bold">điểm</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-6xl opacity-20 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform">potted_plant</span>
            </div>
            <div className="bg-secondary-container text-on-secondary-container p-6 rounded-[1.5rem] flex items-center justify-between group overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Trạng thái sinh thái</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black headline tracking-tight">{profile.ecoStatus}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-6xl opacity-20 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform">energy_savings_leaf</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              className="bg-primary hover:bg-primary-container text-on-primary px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
              onClick={handleEdit}
            >
              <span className="material-symbols-outlined">edit</span>
              Chỉnh sửa hồ sơ
            </button>
            <button className="border-2 border-outline-variant bg-transparent text-primary hover:bg-surface-container-low px-8 py-4 rounded-xl font-bold transition-all active:scale-95">
              Chia sẻ thành tích
            </button>
          </div>
        </div>
      </div>
      <div className="bg-surface-container-low rounded-[2.5rem] p-8 lg:p-12 space-y-8">
        <h2 className="text-2xl font-bold text-on-surface-variant flex items-center gap-3">
          <span className="w-8 h-[2px] bg-primary"></span>
          Chi tiết tài khoản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-outline">Địa chỉ Email</label>
            <p className="text-lg font-semibold text-on-surface">{profile.email}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-outline">Số điện thoại</label>
            <p className="text-lg font-semibold text-on-surface">{profile.phoneNumber}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-outline">Ngày sinh</label>
            <p className="text-lg font-semibold text-on-surface">{profile.dob}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-outline">Trạng thái hiện tại</label>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <p className="text-lg font-semibold text-on-surface">{profile.status}</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-outline">Thành viên từ</label>
            <p className="text-lg font-semibold text-on-surface">{profile.memberSince}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-outline">Phường/Xã</label>
            <p className="text-lg font-semibold text-on-surface">{profile.ward}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
