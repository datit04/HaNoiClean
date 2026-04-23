import React, { useState, useEffect } from "react";
import userApi from '../../services/userApi';
import roleApi from '../../services/roleApi';
import AssignRoleModal from './components/AssignRoleModal';
import SelectionBar from '../../components/common/SelectionBar';
import Pagination from '../../components/common/Pagination';
import { swalSuccess, swalError, swalConfirm, swalConfirmDelete, swalLoading, swalClose } from '../../utils/swal';

const STATUS_OPTIONS = ["Tất cả", "Hoạt động", "Bị khóa"];

export default function AccountsPage() {
	const [accounts, setAccounts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [search, setSearch] = useState("");
	const [role, setRole] = useState("Tất cả");
	const [roleOptions, setRoleOptions] = useState(["Tất cả"]);
	const [status, setStatus] = useState("Tất cả");
	const [page, setPage] = useState(1);
	const pageSize = 10;
	const [selectedIds, setSelectedIds] = useState([]);
	const [assignUser, setAssignUser] = useState(null);

	useEffect(() => {
		setLoading(true);
		Promise.all([userApi.getAll(), roleApi.getAll()])
			.then(([usersRes, rolesRes]) => {
				setAccounts(usersRes.data);
				setRoleOptions(["Tất cả", ...rolesRes.data.map(r => r.name)]);
			})
			.catch(() => setError("Không thể tải danh sách tài khoản"))
			.finally(() => setLoading(false));
	}, []);

	// Filter logic
	const filtered = accounts.filter(acc => {
		const matchSearch =
			acc.fullName?.toLowerCase().includes(search.toLowerCase()) ||
			acc.userName?.toLowerCase().includes(search.toLowerCase()) ||
			acc.email?.toLowerCase().includes(search.toLowerCase());
		const matchRole = role === "Tất cả" || acc.roleName === role;
		const matchStatus =
			status === "Tất cả" ||
			(status === "Hoạt động" && acc.status === "Active") ||
			(status === "Bị khóa" && acc.status !== "Active");
		return matchSearch && matchRole && matchStatus;
	});
	const total = filtered.length;
	const totalPages = Math.ceil(total / pageSize);
	const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

	// Thống kê
	const totalActive = accounts.filter(acc => acc.status === "Active").length;
	const totalLocked = accounts.filter(acc => acc.status !== "Active").length;

	// Actions
	const handleDelete = async (id) => {
		try {
			await userApi.delete(id);
			setAccounts(prev => prev.filter(acc => acc.id !== id));
			setSelectedIds(prev => prev.filter(x => x !== id));
			swalSuccess('Đã xoá tài khoản!');
		} catch (err) {
			if (err.response?.status !== 403) swalError('Xoá tài khoản thất bại.');
		}
	};

	const handleToggleLock = async (acc) => {
		const isLocking = acc.status === 'Active';
		const confirmed = await swalConfirm(
			isLocking ? `Khóa tài khoản "${acc.fullName || acc.userName}"?` : `Mở khóa tài khoản "${acc.fullName || acc.userName}"?`,
			isLocking ? 'Tài khoản sẽ không thể đăng nhập.' : 'Tài khoản sẽ được phép đăng nhập lại.'
		);
		if (!confirmed) return;
		try {
			await userApi.toggleLock(acc.id);
			setAccounts(prev =>
				prev.map(a => a.id === acc.id ? { ...a, status: isLocking ? 'Locked' : 'Active' } : a)
			);
			swalSuccess(isLocking ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!');
		} catch (err) {
			if (err.response?.status !== 403) swalError('Thao tác thất bại.');
		}
	};

	const toggleSelect = (id) =>
		setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

	const toggleSelectAll = () => {
		if (selectedIds.length === paged.length) setSelectedIds([]);
		else setSelectedIds(paged.map(a => a.id));
	};

	const handleBulkDelete = async () => {
		if (!(await swalConfirm(`Xoá ${selectedIds.length} tài khoản đã chọn?`, 'Hành động này không thể hoàn tác.'))) return;
		swalLoading('Đang xoá...');
		let ok = 0, fail = 0;
		for (const id of selectedIds) {
			try { await userApi.delete(id); ok++; } catch { fail++; }
		}
		swalClose();
		setAccounts(prev => prev.filter(a => !selectedIds.includes(a.id) || fail));
		setSelectedIds([]);
		if (fail) swalError(`Xoá thất bại ${fail}/${ok + fail} tài khoản`);
		else swalSuccess(`Đã xoá ${ok} tài khoản!`);
		// Reload
		userApi.getAll().then(res => setAccounts(res.data)).catch(() => {});
	};

	return (
		<div className="px-8 py-6 space-y-8 max-w-[1600px] mx-auto">
			{/* Page Header & Summary Section */}
			<section className="space-y-6">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
					<div>
						<h2 className="text-4xl font-extrabold text-on-surface leading-tight tracking-tight">Quản lý Tài khoản</h2>
						<p className="text-on-surface-variant mt-1 font-body">Kiểm soát truy cập và phân quyền người dùng trong hệ thống CleanCity.</p>
					</div>
					<button className="bg-primary-fixed text-on-primary-fixed-variant px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95">
						<span className="material-symbols-outlined">person_add</span>
						Thêm Người dùng
					</button>
				</div>
				{/* Bento Grid Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-surface-container-highest p-6 rounded-[1.5rem] flex items-center space-x-5 shadow-sm border border-outline-variant/5">
						<div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
							<span className="material-symbols-outlined text-3xl">groups</span>
						</div>
						<div>
							<p className="section-label text-tertiary opacity-80">Tổng người dùng</p>
							<h3 className="text-3xl font-black text-on-surface">{accounts.length}</h3>
							<p className="text-[10px] text-primary mt-1 font-semibold flex items-center">
								<span className="material-symbols-outlined text-xs mr-1">trending_up</span>
								{/* Tăng trưởng giả lập */}
								+{Math.floor(accounts.length * 0.12)}% tháng này
							</p>
						</div>
					</div>
					<div className="bg-surface-container-highest p-6 rounded-[1.5rem] flex items-center space-x-5 shadow-sm border border-outline-variant/5">
						<div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
							<span className="material-symbols-outlined text-3xl">verified_user</span>
						</div>
						<div>
							<p className="section-label text-tertiary opacity-80">Hoạt động</p>
							<h3 className="text-3xl font-black text-on-surface">{totalActive}</h3>
							<p className="text-[10px] text-secondary mt-1 font-semibold flex items-center">
								<span className="material-symbols-outlined text-xs mr-1">check_circle</span>
								{accounts.length > 0 ? Math.round((totalActive / accounts.length) * 100) : 0}% tỉ lệ trực tuyến
							</p>
						</div>
					</div>
					<div className="bg-surface-container-highest p-6 rounded-[1.5rem] flex items-center space-x-5 shadow-sm border border-outline-variant/5">
						<div className="w-14 h-14 rounded-2xl bg-error-container/40 flex items-center justify-center text-error">
							<span className="material-symbols-outlined text-3xl">lock_person</span>
						</div>
						<div>
							<p className="section-label text-tertiary opacity-80">Bị khóa</p>
							<h3 className="text-3xl font-black text-on-surface">{totalLocked}</h3>
							<p className="text-[10px] text-error mt-1 font-semibold flex items-center">
								<span className="material-symbols-outlined text-xs mr-1">warning</span>
								Yêu cầu xem xét: {Math.floor(totalLocked / 5)}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Table Controls & Data Table */}
			<section className="bg-surface-container-low rounded-[2rem] p-6 space-y-6">
				<div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
					<div className="relative w-full lg:w-96 group">
						<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
						<input
							className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-full pl-12 pr-6 py-3 text-sm transition-all shadow-sm"
							placeholder="Tìm kiếm người dùng..."
							type="text"
							value={search}
							onChange={e => { setSearch(e.target.value); setPage(1); }}
						/>
					</div>
					<div className="flex items-center gap-3 w-full lg:w-auto">
						<div className="flex items-center space-x-2 bg-surface-container-lowest px-4 py-2 rounded-xl ring-1 ring-outline-variant/20 shadow-sm">
							<span className="text-xs font-bold text-tertiary">Vai trò:</span>
							<select
								className="bg-transparent border-none text-sm font-semibold text-on-surface focus:ring-0 p-0 cursor-pointer"
								value={role}
								onChange={e => { setRole(e.target.value); setPage(1); }}
							>
								{roleOptions.map(opt => <option key={opt}>{opt}</option>)}
							</select>
						</div>
						<div className="flex items-center space-x-2 bg-surface-container-lowest px-4 py-2 rounded-xl ring-1 ring-outline-variant/20 shadow-sm">
							<span className="text-xs font-bold text-tertiary">Trạng thái:</span>
							<select
								className="bg-transparent border-none text-sm font-semibold text-on-surface focus:ring-0 p-0 cursor-pointer"
								value={status}
								onChange={e => { setStatus(e.target.value); setPage(1); }}
							>
								{STATUS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
							</select>
						</div>
				<button className="bg-surface-container-highest p-2.5 rounded-xl hover:bg-outline-variant/30 transition-colors">
						<span className="material-symbols-outlined">filter_list</span>
					</button>
				</div>
			</div>
			<SelectionBar count={selectedIds.length} onClear={() => setSelectedIds([])}>
				<button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-error text-on-error text-sm font-bold hover:bg-error/90 transition-colors">
					<span className="material-symbols-outlined text-lg">delete</span>
					Xoá ({selectedIds.length})
				</button>
			</SelectionBar>
			<div className="overflow-x-auto rounded-2xl border border-outline-variant/10 shadow-sm">
				{error && <div className="text-error font-bold p-4">{error}</div>}
				{loading ? (
					<div className="p-4">Đang tải...</div>
				) : (
					<table className="w-full text-left border-collapse bg-surface-container-lowest">
						<thead className="bg-surface-container-high/50 border-b border-outline-variant/20">
							<tr>
								<th className="px-4 py-4 w-10">
									<input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer" checked={paged.length > 0 && selectedIds.length === paged.length} onChange={toggleSelectAll} />
								</th>
									<th className="px-6 py-4 font-headline text-xs font-black uppercase tracking-widest text-tertiary">ID</th>
									<th className="px-6 py-4 font-headline text-xs font-black uppercase tracking-widest text-tertiary">Họ và Tên</th>
									<th className="px-6 py-4 font-headline text-xs font-black uppercase tracking-widest text-tertiary">Email</th>
									<th className="px-6 py-4 font-headline text-xs font-black uppercase tracking-widest text-tertiary">Số điện thoại</th>
									<th className="px-6 py-4 font-headline text-xs font-black uppercase tracking-widest text-tertiary">Phường</th>
									<th className="px-6 py-4 font-headline text-xs font-black uppercase tracking-widest text-tertiary">Trạng thái</th>
									<th className="px-6 py-4 font-headline text-xs font-black uppercase tracking-widest text-tertiary text-right">Thao tác</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-outline-variant/10">
								{paged.map(acc => (
								<tr key={acc.id} className={`hover:bg-surface-container-low transition-colors group ${selectedIds.includes(acc.id) ? 'bg-primary-fixed/30' : ''}`}>
									<td className="px-4 py-5 w-10">
										<input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer" checked={selectedIds.includes(acc.id)} onChange={() => toggleSelect(acc.id)} />
									</td>
										<td className="px-6 py-5 font-headline font-bold text-sm text-primary">{acc.id?.slice(0, 6) || acc.id}</td>
										<td className="px-6 py-5">
											<div className="flex items-center gap-3">
																								{(() => {
																									let avatar = acc.avatar || acc.avatarUrl || "";
																									if (avatar.startsWith("/user-attachments/")) {
																										avatar = `https://localhost:5002${avatar}`;
																									}
																									// Nếu là http(s) thì giữ nguyên, nếu rỗng thì default
																									return avatar ? (
																										<img
																											src={avatar}
																											alt={acc.fullName || acc.userName}
																											className="w-8 h-8 rounded-full object-cover border-2 border-primary-container"
																											onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
																										/>
																									) : (
																										<div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold flex items-center justify-center">
																											{acc.fullName ? acc.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?'}
																										</div>
																									);
																								})()}
												<span className="font-bold text-on-surface text-sm">{acc.fullName}</span>
											</div>
										</td>
										<td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{acc.email}</td>
										<td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{acc.phoneNumber}</td>
										<td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{acc.wardName || "-"}</td>
										<td className="px-6 py-5">
											<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${acc.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-error-container/50 text-error'}`}>
												{acc.status === 'Active' ? 'Hoạt động' : 'Bị khóa'}
											</span>
										</td>
										<td className="px-6 py-5 text-right">
											<div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
												<button className="p-1.5 hover:text-primary transition-colors" title="Gán vai trò" onClick={() => setAssignUser(acc)}>
													<span className="material-symbols-outlined text-lg">admin_panel_settings</span>
												</button>
												<button className="p-1.5 hover:text-primary transition-colors" title="Sửa"><span className="material-symbols-outlined text-lg">edit</span></button>
												<button className={`p-1.5 ${acc.status === 'Active' ? 'hover:text-error' : 'hover:text-primary'} transition-colors`} title="Khoá/Mở" onClick={() => handleToggleLock(acc)}>
													<span className="material-symbols-outlined text-lg">{acc.status === 'Active' ? 'lock' : 'lock_open'}</span>
												</button>
																			<button
																				className="p-1.5 hover:text-error transition-colors"
																				title="Xóa tài khoản"
																				onClick={async () => {
																					if (await swalConfirm('Bạn có chắc muốn xoá tài khoản này?')) {
																						handleDelete(acc.id);
																					}
																				}}
																			>
																				<span className="material-symbols-outlined text-lg">delete</span>
																			</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
				<Pagination currentPage={page} totalPages={totalPages} totalRecords={total} label="người dùng" onPageChange={setPage} />
			</section>
			{assignUser && (
				<AssignRoleModal
					user={assignUser}
					onClose={() => setAssignUser(null)}
					onUpdated={() => {
						userApi.getAll().then(res => setAccounts(res.data)).catch(() => {});
					}}
				/>
			)}
		</div>
	);
}
