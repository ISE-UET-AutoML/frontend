/**
 * BuildPager (icon-only)
 *
 * Minimal, theme-aware pager used in Project Build pages.
 * - Icon buttons for First/Prev/Next/Last
 * - Centered page indicator: "current / total"
 * - Circular buttons with hover/active styles using CSS variables
 * - Works in light/dark via --hover-bg, --active-bg, --border, --text
 *
 * Props
 * - currentPage: number (1-based)
 * - totalItems: number (total items across pages)
 * - pageSize: number (items per page)
 * - onPageChange: (page: number) => void
 *
 * Example
 * <BuildPager
 *   currentPage={currentPage}
 *   totalItems={items.length}
 *   pageSize={10}
 *   onPageChange={setCurrentPage}
 * />
 */
import React from 'react'

export default function BuildPager({ currentPage = 1, totalItems = 0, pageSize = 10, onPageChange }) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const canPrev = currentPage > 1
    const canNext = currentPage < totalPages

    const goTo = (page) => {
        if (!onPageChange) return
        const next = Math.min(Math.max(1, page), totalPages)
        if (next !== currentPage) onPageChange(next)
    }

    const Button = ({ children, onClick, disabled, ariaLabel }) => (
        <button
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={onClick}
            className="h-9 w-9 rounded-full text-sm font-medium transition-colors duration-200 grid place-items-center"
            style={{
                background: 'var(--hover-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                opacity: disabled ? 0.5 : 1,
                fontFamily: 'Poppins, sans-serif'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--active-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
        >
            {children}
        </button>
    )

    return (
        <div className="w-full flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
                <Button ariaLabel="First page" disabled={!canPrev} onClick={() => goTo(1)}>
                    <span aria-hidden style={{ fontSize: 14 }}>«</span>
                </Button>
                <Button ariaLabel="Previous page" disabled={!canPrev} onClick={() => goTo(currentPage - 1)}>
                    <span aria-hidden style={{ fontSize: 16 }}>‹</span>
                </Button>
            </div>
            <div
                className="px-3 h-9 rounded-full grid place-items-center text-xs font-semibold"
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
            <div className="flex items-center gap-2">
                <Button ariaLabel="Next page" disabled={!canNext} onClick={() => goTo(currentPage + 1)}>
                    <span aria-hidden style={{ fontSize: 16 }}>›</span>
                </Button>
                <Button ariaLabel="Last page" disabled={!canNext} onClick={() => goTo(totalPages)}>
                    <span aria-hidden style={{ fontSize: 14 }}>»</span>
                </Button>
            </div>
        </div>
    )
}


