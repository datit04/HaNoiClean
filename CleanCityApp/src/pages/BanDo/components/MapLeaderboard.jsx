import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { getMyGreenPoints, getGreenPointLeaderboard } from '../../../services/greenPointApi'

export default function MapLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const { user } = useAuth()
  const [myGreenPoints, setMyGreenPoints] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    getGreenPointLeaderboard(5).then((res) => setLeaderboard(res.data || []))
    getMyGreenPoints().then((res) => setMyGreenPoints(res.data?.total || 0))
  }, [])

  return (
    <div className="absolute bottom-8 left-8 z-10 pointer-events-auto w-72">
      <div className="bg-white/90 dark:bg-emerald-900/30 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        {/* Header – always visible, click to toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-green-50/60 transition-colors"
        >
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-800">
            <span className="material-symbols-outlined text-green-700 text-base">eco</span>
            Bảng xếp hạng điểm xanh
          </span>
          <span className="material-symbols-outlined text-green-700 text-lg transition-transform" style={{ transform: collapsed ? 'rotate(180deg)' : '' }}>
            expand_more
          </span>
        </button>

        {/* Collapsible body */}
        {!collapsed && (
          <div className="px-4 pb-4">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-green-900/60">
                  <th className="py-1.5 text-left w-7">#</th>
                  <th className="py-1.5 text-left">Họ và tên</th>
                  <th className="py-1.5 text-right w-14">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u, idx) => {
                  const id = u.id || u.Id
                  const name = u.fullName || u.FullName || u.userName || u.UserName || 'Ẩn danh'
                  const isCurrentUser =
                    user &&
                    (user.id === u.id ||
                      user.id === u.Id ||
                      user.userName === u.userName ||
                      user.userName === u.UserName)
                  const points = isCurrentUser
                    ? myGreenPoints
                    : u.TotalGreenPoints || u.totalGreenPoints || 0

                  const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null

                  return (
                    <tr
                      key={id}
                      className={`border-t border-green-100/60 ${isCurrentUser ? 'bg-green-50/80 font-semibold' : ''}`}
                    >
                      <td className="py-1.5 text-sm font-bold text-green-700">
                        {medal || idx + 1}
                      </td>
                      <td className="py-1.5 text-sm truncate max-w-[10rem]">{name}</td>
                      <td className="py-1.5 text-sm font-bold text-green-700 text-right">
                        {points}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
