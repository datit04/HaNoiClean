import { useEffect, useRef, useState } from 'react'

const SYSTEM_PROMPT = `Bạn là trợ lý AI của hệ thống Hà Nội Xanh (HaNoi CleanCity) — nền tảng tiếp nhận và xử lý báo cáo môi trường đô thị cho thành phố Hà Nội.

Nhiệm vụ: hỗ trợ người dùng hiểu và sử dụng hệ thống, trả lời câu hỏi về nghiệp vụ báo cáo môi trường.

## Hướng dẫn tạo báo cáo (Người dân)
1. Đăng nhập vào hệ thống
2. Vào trang **Báo cáo của tôi** (/nguoi-dan)
3. Nhấn nút **"Tạo báo cáo mới"** (nút + màu xanh)
4. Chọn **Danh mục** sự cố (Rác thải, Ô nhiễm không khí, Hư hỏng hạ tầng, Ô nhiễm nguồn nước,...)
5. Chọn **Phường/Xã** nơi xảy ra sự cố
6. Chụp hoặc tải lên **ảnh** minh chứng rõ ràng
7. Nhập **mô tả** chi tiết về sự cố
8. Chọn **vị trí** trên bản đồ (kéo ghim đến đúng địa điểm)
9. Chọn **mức độ ưu tiên**: Khẩn cấp / Trung bình / Thấp
10. Nhấn **Gửi báo cáo**

## Trạng thái báo cáo
- **Mới gửi**: Báo cáo vừa được tạo, chờ cán bộ tiếp nhận
- **Đã tiếp nhận**: Cán bộ đã xác nhận, đang chuẩn bị phân công
- **Đang xử lý**: Đội ngũ hiện trường đang xử lý
- **Hoàn thành**: Sự cố đã được xử lý xong
- **Từ chối**: Báo cáo không hợp lệ hoặc ngoài phạm vi

## Trang chức năng
- **Bản đồ** (/ban-do): Xem toàn bộ báo cáo trên bản đồ Hà Nội, lọc theo danh mục/phường/xã
- **Báo cáo của tôi** (/nguoi-dan): Xem danh sách và tạo báo cáo cá nhân, theo dõi tiến độ
- **Cộng đồng** (/cong-dong): Xem báo cáo của cộng đồng, bình luận, tương tác
- **Trang cán bộ** (/can-bo): Dành riêng cho cán bộ — xem thống kê, điều phối, phân công đội xử lý

## Đăng ký / Đăng nhập
- Truy cập /dang-nhap, nhập tên tài khoản và mật khẩu
- Chưa có tài khoản: nhấn "Đăng ký ngay" → điền Họ tên, tên đăng nhập, email, mật khẩu

## Mẹo sử dụng hiệu quả
- Ảnh nên chụp rõ ràng, đúng sự cố, có thể thấy bối cảnh xung quanh
- Mô tả càng chi tiết (địa điểm cụ thể, thời gian phát hiện,...) càng giúp đội xử lý nhanh hơn
- Chọn đúng Phường/Xã để đội phụ trách khu vực đó tiếp nhận
- Theo dõi tiến độ ngay trên trang "Báo cáo của tôi"

## Quy tắc trả lời
- Luôn trả lời bằng tiếng Việt, ngắn gọn và thân thiện
- Nếu câu hỏi ngoài phạm vi hệ thống, lịch sự từ chối và hướng về chủ đề chính
- Không trả lời các chủ đề chính trị, bạo lực, nội dung không phù hợp`

const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

async function callGemini(apiKey, conversationHistory, userText) {
  // Build contents from existing history + new user message
  const contents = [
    ...conversationHistory
      .filter((m) => m.role !== 'assistant' || conversationHistory.indexOf(m) > 0)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    { role: 'user', parts: [{ text: userText }] },
  ]

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: 1024 },
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = body?.error?.message || res.statusText
    throw Object.assign(new Error(msg), { status: res.status })
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// Escape HTML rồi mới áp dụng markdown đơn giản — tránh XSS từ AI output
function renderMarkdown(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

const QUICK_QUESTIONS = [
  'Cách tạo báo cáo mới?',
  'Các trạng thái báo cáo?',
  'Làm sao theo dõi tiến độ?',
]

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Xin chào! Tôi là trợ lý AI của **Hà Nội Xanh** 🌿\n\nTôi có thể giúp bạn:\n- Hướng dẫn cách tạo báo cáo\n- Giải thích các trạng thái báo cáo\n- Trả lời câu hỏi về hệ thống\n\nBạn cần hỗ trợ gì?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const sendMessage = async (text = input.trim()) => {
    if (!text || loading) return

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    const currentMessages = messages

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      if (!apiKey) throw Object.assign(new Error('no_key'), { status: 0 })

      // Retry up to 2 times on 429 rate-limit errors
      let reply = ''
      for (let attempt = 0; attempt <= 2; attempt++) {
        try {
          reply = await callGemini(apiKey, currentMessages, text)
          break
        } catch (e) {
          if (e.status === 429 && attempt < 2) {
            await new Promise((r) => setTimeout(r, (attempt + 1) * 3000))
          } else {
            throw e
          }
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      console.error('[Chatbot] Gemini error:', err?.status, err?.message)
      let errorMsg = '❌ Không thể kết nối AI lúc này. Vui lòng thử lại sau.'
      if (err.status === 0) {
        errorMsg = '⚠️ Chưa cấu hình API key. Vui lòng thêm **VITE_GEMINI_API_KEY** vào file `.env`.'
      } else if (err.status === 400) {
        errorMsg = '⚠️ API key không hợp lệ. Vui lòng kiểm tra **VITE_GEMINI_API_KEY**.'
      } else if (err.status === 429) {
        errorMsg = '⚠️ Hệ thống đang bận, vui lòng chờ 1 phút rồi thử lại.'
      } else if (err.status === 404) {
        errorMsg = '⚠️ Model AI không khả dụng. Vui lòng thử lại sau.'
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMsg }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-[5.5rem] md:bottom-24 right-4 md:right-5 z-[200] w-[calc(100vw-2rem)] max-w-[360px] flex flex-col bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 bg-primary text-on-primary flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight">Trợ lý Hà Nội Xanh</p>
              <p className="text-xs opacity-75">Gemini AI · Hỗ trợ 24/7</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Đóng chat"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[360px] min-h-[200px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span
                      className="material-symbols-outlined text-sm text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      smart_toy
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-on-primary rounded-tr-sm'
                      : 'bg-surface-container text-on-surface rounded-tl-sm'
                  }`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span
                    className="material-symbols-outlined text-sm text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    smart_toy
                  </span>
                </div>
                <div className="bg-surface-container px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick question chips — only shown when no user message sent yet */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed hover:bg-primary/20 transition-colors border border-primary/20 font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-outline-variant flex items-end gap-2 flex-shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi... (Enter để gửi)"
              rows={1}
              className="flex-1 resize-none bg-surface-container-low rounded-2xl px-4 py-2.5 text-sm text-on-surface placeholder:text-outline-variant border-none focus:ring-2 focus:ring-primary/30 max-h-24 overflow-y-auto"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
              aria-label="Gửi"
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                send
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── FAB Toggle ──────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-5 z-[200] w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label={open ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {open ? 'close' : 'smart_toy'}
        </span>
      </button>
    </>
  )
}
