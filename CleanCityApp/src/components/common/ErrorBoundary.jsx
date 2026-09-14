import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center p-8">
          <span className="material-symbols-outlined text-5xl text-error">error</span>
          <h2 className="text-xl font-bold text-on-surface">Đã xảy ra lỗi</h2>
          <p className="text-on-surface-variant text-sm max-w-md">
            Có lỗi không mong muốn xảy ra. Vui lòng thử tải lại trang.
          </p>
          <button
            className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-colors"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
