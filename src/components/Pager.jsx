/**
 * Pager (icon-only)
 *
 * Minimal, theme-aware pagination control used under the Datasets grid.
 * - Icon buttons for First/Prev/Next/Last
 * - Centered page indicator: "current / total"
 * - Circular buttons with hover/active styles using CSS variables
 * - Works in light/dark via --hover-bg, --active-bg, --border, --text
 *
 * Props
 * - currentPage: number (1-based)
 * - totalItems: number (total dataset count after filters/search)
 * - pageSize: number (items per page)
 * - onPageChange: (page: number) => void (invoked when user clicks a control)
 *
 * Accessibility
 * - Each control has an aria-label
 * - The page indicator uses aria-live="polite" to announce page changes
 *
 * Example
 * <Pager
 *   currentPage={currentPage}
 *   totalItems={processedData.length}
 *   pageSize={6}
 *   onPageChange={(p) => setCurrentPage(p)}
 * />
 */
import React from 'react'

export default function Pager({ currentPage = 1, totalItems = 0, pageSize = 10, onPageChange }) {
    // Derived values
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const canPrev = currentPage > 1
    const canNext = currentPage < totalPages

    // Safe navigation with clamping
    const goTo = (page) => {
        if (!onPageChange) return
        const next = Math.min(Math.max(1, page), totalPages)
        if (next !== currentPage) onPageChange(next)
    }

    // (Reserved) if we later re-introduce numeric page chips
    const getPageWindow = () => {
        const windowSize = 5
        let start = Math.max(1, currentPage - 2)
        let end = Math.min(totalPages, start + windowSize - 1)
        start = Math.max(1, end - windowSize + 1)
        const pages = []
        for (let p = start; p <= end; p++) pages.push(p)
        return pages
    }

    // Themed circular button
    const Button = ({ children, onClick, disabled, active = false, ariaLabel }) => (
        <button
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={onClick}
            className={`h-10 w-10 rounded-full text-sm font-medium transition-colors duration-200 grid place-items-center ${
                active ? 'cursor-default' : 'cursor-pointer'
            }`}
            style={{
                background: active ? 'var(--active-bg)' : 'var(--hover-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                opacity: disabled ? 0.5 : 1,
                fontFamily: 'Poppins, sans-serif'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--active-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = active ? 'var(--active-bg)' : 'var(--hover-bg)'}
        >
            {children}
        </button>
    )

    const pages = getPageWindow()

    return (
        <div className="w-full flex items-center justify-center gap-4">
            <div className="flex items-center gap-3">
                <Button ariaLabel="First page" disabled={!canPrev} onClick={() => goTo(1)}>
                    <span aria-hidden style={{ fontSize: 16 }}>«</span>
                </Button>
                <Button ariaLabel="Previous page" disabled={!canPrev} onClick={() => goTo(currentPage - 1)}>
                    <span aria-hidden style={{ fontSize: 18 }}>‹</span>
                </Button>
            </div>
            <div
                className="px-4 h-10 rounded-full grid place-items-center text-sm font-semibold"
                style={{
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontFamily: 'Poppins, sans-serif'
                }}
                aria-live="polite"
            >
                {currentPage} / {totalPages}
            </div>
            <div className="flex items-center gap-3">
                <Button ariaLabel="Next page" disabled={!canNext} onClick={() => goTo(currentPage + 1)}>
                    <span aria-hidden style={{ fontSize: 18 }}>›</span>
                </Button>
                <Button ariaLabel="Last page" disabled={!canNext} onClick={() => goTo(totalPages)}>
                    <span aria-hidden style={{ fontSize: 16 }}>»</span>
                </Button>
            </div>
        </div>
    )
}


