import { useState, useEffect, useRef, useCallback } from 'react'
import { getMyReportsProgress } from '../services/reportService'
import { useAuth } from '../contexts/AuthContext'
import { Toast } from '../utils/swal'

const READ_KEY = 'cleancity_notif_read_ids'
const KNOWN_KEY = 'cleancity_notif_known_ids'
const POLL_INTERVAL = 45_000

const STATUS_LABELS = {
  0: 'Đã gửi',
  1: 'Đã tiếp nhận',
  2: 'Đang xử lý',
  3: 'Hoàn thành',
  4: 'Từ chối',
}

const loadSet = (key) => {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')) } catch { return new Set() }
}
const saveSet = (key, set) => localStorage.setItem(key, JSON.stringify([...set]))

const toNotif = (item, readIds) => ({
  id: item.id,
  reportId: item.reportId,
  type: item.status === 3 ? 'success' : item.status === 4 ? 'error' : 'status',
  statusName: item.statusName || STATUS_LABELS[item.status] || 'Cập nhật',
  note: item.note || item.description || '',
  updatedBy: item.updatedByName || '',
  updatedAt: item.updatedAt,
  read: readIds.has(item.id),
})

export function useNotifications() {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const readIdsRef = useRef(new Set())
  const knownIdsRef = useRef(new Set())
  const initializedRef = useRef(false)

  const recompute = useCallback((notifs) => {
    setNotifications(notifs)
    setUnreadCount(notifs.filter((n) => !n.read).length)
  }, [])

  const markRead = useCallback((id) => {
    readIdsRef.current.add(id)
    saveSet(READ_KEY, readIdsRef.current)
    setNotifications((prev) => {
      const next = prev.map((n) => n.id === id ? { ...n, read: true } : n)
      setUnreadCount(next.filter((n) => !n.read).length)
      return next
    })
  }, [])

  const poll = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await getMyReportsProgress()
      const items = (Array.isArray(res.data) ? res.data : []).filter((item) => item.status !== 0)
      const readIds = readIdsRef.current
      const knownIds = knownIdsRef.current

      const notifs = items.map((item) => toNotif(item, readIds))
      recompute(notifs)

      if (initializedRef.current) {
        // Phát hiện item mới xuất hiện sau lần load đầu
        const newItems = items.filter((item) => !knownIds.has(item.id))
        newItems.forEach((item) => {
          const icon = item.status === 3 ? 'success' : item.status === 4 ? 'error' : 'info'
          Toast.fire({
            icon,
            title: `Báo cáo #${item.reportId} — ${item.statusName || STATUS_LABELS[item.status]}`,
            text: item.note || item.description || undefined,
            timer: 4000,
          })
        })
      }

      items.forEach((item) => knownIds.add(item.id))
      saveSet(KNOWN_KEY, knownIds)
      initializedRef.current = true
    } catch {
      // bỏ qua lỗi poll
    }
  }, [isAuthenticated, recompute])

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      initializedRef.current = false
      knownIdsRef.current = new Set()
      return
    }
    readIdsRef.current = loadSet(READ_KEY)
    knownIdsRef.current = loadSet(KNOWN_KEY)

    poll()
    const id = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [isAuthenticated, poll])

  return { notifications, unreadCount, markRead }
}
