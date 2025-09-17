import React from 'react'
import { Input } from 'antd'

// Custom styles cho dark input
const darkInputStyles = `
.dark-input .ant-input,
.dark-input.ant-input-affix-wrapper {
    background: rgba(15, 32, 39, 0.8) !important;
    color: white !important;
    border-radius: 0.75rem !important;
    transition: all 0.3s ease;
    padding: 0.3rem 0.5rem !important;
}

.dark-input.ant-input-affix-wrapper {
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.dark-input .ant-input::placeholder {
    color: #9CA3AF !important;
}

.dark-input.ant-input-affix-wrapper:hover,
.dark-input:hover {
    border-color: rgba(255, 255, 255, 0.4) !important;
}

.dark-input.ant-input-affix-wrapper-focused,
.dark-input:focus {
    border-color: rgba(59, 130, 246, 0.5) !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}
`

export default function ProjectSearchBar({ onSearch }) {
    const [searchValue, setSearchValue] = React.useState('')

    const handleChange = (e) => {
        const value = e.target.value
        setSearchValue(value)
        onSearch(value)
    }

    return (
        <>
            <style>{darkInputStyles}</style>
            <div style={{ marginBottom: 24 }}>
                <Input
                    placeholder="Search projects by name..."
                    value={searchValue}
                    onChange={handleChange}
                    allowClear
                    size="large"
                    className="dark-input"
                    spellCheck={false}
                />
            </div>
        </>
    )
}

