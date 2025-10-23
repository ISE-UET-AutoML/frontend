import React from 'react'
import { Select } from 'antd'

// Theme-aware styles for select components
const themeSelectStyles = `
.theme-select .ant-select-selector {
    background: var(--filter-input-bg) !important;
    border: 1px solid var(--filter-input-border) !important;
    color: var(--text) !important;
}

.theme-select .ant-select-selection-item {
    color: var(--text) !important;
}

.theme-select .ant-select-selection-placeholder {
    color: var(--secondary-text) !important;
}

.theme-select .ant-select-arrow {
    color: var(--text) !important;
}

.theme-select:hover .ant-select-selector {
    border-color: var(--filter-input-hover) !important;
}

.theme-select.ant-select-focused .ant-select-selector {
    border-color: var(--filter-input-focus) !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

/* Dropdown options styling */
.theme-select-dropdown .ant-select-item {
    color: var(--text) !important;
    background: transparent !important;
}

.theme-select-dropdown .ant-select-item:hover {
    background: var(--filter-item-hover) !important;
    color: var(--text) !important;
}

.theme-select-dropdown .ant-select-item-option-selected {
    background: rgba(59, 130, 246, 0.2) !important;
    color: var(--text) !important;
}

.theme-select-dropdown .ant-select-item-option-active {
    background: var(--filter-item-hover) !important;
    color: var(--text) !important;
}
`

const SORT_OPTIONS = [
	{ value: 'latest', label: 'Latest' },
	{ value: 'oldest', label: 'Oldest' },
	{ value: 'name_asc', label: 'Name (A-Z)' },
	{ value: 'name_desc', label: 'Name (Z-A)' }
]

export default function SortDropdown({ selectedSort, onSortChange }) {
	return (
		<>
			<style>{themeSelectStyles}</style>
			<Select
				options={SORT_OPTIONS.map((opt) => ({
					...opt,
					label: (
						<span
							className="font-poppins font-medium"
							style={{ color: 'var(--text)' }}
						>
							{opt.label}
						</span>
					),
				}))}
				value={selectedSort || 'latest'}
				placeholder={
					<span
						className="font-poppins"
						style={{ color: 'var(--secondary-text)' }}
					>
						Sort by
					</span>
				}
				className="w-full theme-select"
				onChange={onSortChange}
				dropdownStyle={{
					background: 'var(--filter-dropdown-bg)',
					border: '1px solid var(--filter-dropdown-border)',
					borderRadius: '12px',
					backdropFilter: 'blur(10px)',
				}}
				style={{
					minWidth: 140,
					height: 40,
				}}
				popupClassName="theme-select-dropdown"
			/>
		</>
	)
}