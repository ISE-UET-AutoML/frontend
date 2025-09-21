import React from 'react'
import { Input } from 'antd'
import SortDropdown from './SortDropdown'

// Theme-aware styles for input
const themeInputStyles = `
.theme-input .ant-input,
.theme-input.ant-input-affix-wrapper {
    background: var(--filter-input-bg) !important;
    color: var(--text) !important;
    border-radius: 0.75rem !important;
    transition: all 0.3s ease;
    padding: 0.3rem 0.5rem !important;
}

.theme-input.ant-input-affix-wrapper {
    border: 1px solid var(--filter-input-border) !important;
}

.theme-input .ant-input::placeholder {
    color: var(--secondary-text) !important;
}

.theme-input.ant-input-affix-wrapper:hover,
.theme-input:hover {
    border-color: var(--filter-input-hover) !important;
}

.theme-input.ant-input-affix-wrapper-focused,
.theme-input:focus {
    border-color: var(--filter-input-focus) !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}
`

export default function ProjectSearchBar({ onSearch, isReset }) {
    const [searchValue, setSearchValue] = React.useState('')

    const handleChange = (e) => {
        const value = e.target.value
        setSearchValue(value)
        onSearch(value)
    }

    React.useEffect(() => {
        setSearchValue('')
    }, [isReset])

    return (
        <>
            <style>{themeInputStyles}</style>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* <Input
                    placeholder="Search projects..."
                    value={searchValue}
                    onChange={handleChange}
                    allowClear
                    size="large"
                    className="theme-input"
                    spellCheck={false}
                    style={{ flex: 1 }}
                /> */}
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchValue || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 theme-search-input"
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        borderRadius: '6px',
                        background: 'var(--filter-bg)',
                        border: '1px solid var(--filter-border)',
                        color: 'var(--text)',
                    }}
                />
            </div>
        </>
    )
}

