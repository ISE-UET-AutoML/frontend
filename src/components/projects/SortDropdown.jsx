import React from 'react'
import { Select } from 'antd'

// Custom styles cho dark select (copy từ TaskFilter để đồng bộ)
const darkSelectStyles = `
.dark-select .ant-select-selector {
    background: rgba(15, 32, 39, 0.8) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: white !important;
}

.dark-select .ant-select-selection-item {
    color: white !important;
}

.dark-select .ant-select-selection-placeholder {
    color: #9CA3AF !important;
}

.dark-select .ant-select-arrow {
    color: white !important;
}

.dark-select:hover .ant-select-selector {
    border-color: rgba(255, 255, 255, 0.4) !important;
}

.dark-select.ant-select-focused .ant-select-selector {
    border-color: rgba(59, 130, 246, 0.5) !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

/* Dropdown options styling */
.dark-select-dropdown .ant-select-item {
    color: white !important;
    background: transparent !important;
}

.dark-select-dropdown .ant-select-item:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
}

.dark-select-dropdown .ant-select-item-option-selected {
    background: rgba(59, 130, 246, 0.2) !important;
    color: white !important;
}

.dark-select-dropdown .ant-select-item-option-active {
    background: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
}
`

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Latest' },
  { value: 'name', label: 'Name' },
]

export default function SortDropdown({ selectedSort, onSortChange }) {
  return (
    <>
      <style>{darkSelectStyles}</style>
      <Select
        options={SORT_OPTIONS.map(opt => ({
          ...opt,
          label: (
            <span className="font-poppins font-medium text-white">
              {opt.label}
            </span>
          )
        }))}
        value={selectedSort || 'created_at'}
        placeholder={
          <span className="font-poppins text-gray-400">
            Sort by
          </span>
        }
        className="w-full dark-select"
        onChange={onSortChange}
        dropdownStyle={{
          background: 'rgba(15, 32, 39, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        }}
        style={{
          background: 'rgba(15, 32, 39, 0.8) !important',
          border: '1px solid rgba(255, 255, 255, 0.2) !important',
          color: 'white !important',
          minWidth: 140,
        }}
        popupClassName="dark-select-dropdown"
      />
    </>
  )
}
