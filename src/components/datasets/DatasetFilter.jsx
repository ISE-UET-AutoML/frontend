import React from 'react'
import { Row, Col, Select } from 'antd'
import { XMarkIcon } from '@heroicons/react/24/outline'

// Theme-aware styles for select components
const themeSelectStyles = `
.theme-select .ant-select-selector {
    background: var(--filter-input-bg) !important;
    border: 1px solid var(--filter-input-border) !important;
    color: var(--text) !important;
    height: 40px !important;
    display: flex;
    align-items: center;
    border-radius: 8px !important;
    padding: 0 10px !important;
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

.theme-search-input {
    background: var(--filter-input-bg) !important;
    border: 1px solid var(--filter-input-border) !important;
    color: var(--text) !important;
    height: 40px;
    display: inline-flex;
    align-items: center;
    padding: 0 12px;
    border-radius: 8px !important;
}

.theme-search-input:hover {
    border-color: var(--filter-input-hover) !important;
}

.theme-search-input:focus {
    border-color: var(--filter-input-focus) !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

.theme-search-input::placeholder {
    color: var(--secondary-text) !important;
}
`

const statusOptions = [
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'CREATING_DATASET', label: 'Creating Dataset' },
  { value: 'CREATING_LABEL_PROJECT', label: 'Creating Label Project' },
  { value: 'FAILED', label: 'Failed' },
]

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
]

const typeFilterOptions = [
  { value: 'None', label: 'None' },
  { value: 'TEXT', label: 'Text' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'TABULAR', label: 'Tabular' },
  { value: 'MULTIMODAL', label: 'Multimodal' },
]

const DatasetFilter = ({
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  onReset,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  console.log('selectedStatus', selectedStatus)
  console.log('sortBy', sortBy)
  console.log('selectedType', selectedType)
  console.log('searchTerm', searchTerm)
  return (
    <>
      <style>{themeSelectStyles}</style>
      <div
        className="mb-6 p-4 rounded-xl backdrop-blur-sm"
        style={{
          background: 'var(--filter-bg)',
          border: '1px solid var(--filter-border)',
          borderRadius: 12,
        }}
      >
        {/* Row chứa tất cả filter */}
        <Row gutter={[12, 12]} align="middle">
          {/* Search */}
          <Col xs={24} md={10} lg={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                className="text-sm font-poppins font-medium"
                style={{ color: 'var(--secondary-text)', whiteSpace: 'nowrap' }}
              >
                Search:
              </span>
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchTerm || ''}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full theme-search-input"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  borderRadius: '8px',
                }}
              />
            </div>
          </Col>

          {/* Type */}
          <Col xs={12} md={7} lg={7}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '40px' }}>
              <span
                className="text-sm font-poppins font-medium"
                style={{ color: 'var(--secondary-text)', whiteSpace: 'nowrap' }}
              >
                Type:
              </span>
              <div style={{ flex: 1, height: '40px' }}>
                <Select
                  options={typeFilterOptions.map(option => ({
                    ...option,
                    label: (
                      <span className="font-poppins font-medium" style={{ color: 'var(--text)' }}>
                        {option.label}
                      </span>
                    )
                  }))}
                  value={selectedType || 'none'}
                  className="w-full theme-select"
                  onChange={(value) => onTypeChange && onTypeChange(value)}
                  dropdownStyle={{
                    background: 'var(--filter-dropdown-bg)',
                    border: '1px solid var(--filter-dropdown-border)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                  }}
                  popupClassName="theme-select-dropdown"
                />
              </div>
            </div>
          </Col>

          {/* Sort */}
          <Col xs={12} md={7} lg={5}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', height: '40px' }}>
              <span
                className="text-sm font-poppins font-medium"
                style={{ color: 'var(--secondary-text)', whiteSpace: 'nowrap' }}
              >
                Sort by:
              </span>
              <div style={{ width: 140, height: '40px' }}>
                <Select
                  options={sortOptions.map(option => ({
                    ...option,
                    label: (
                      <span className="font-poppins font-medium" style={{ color: 'var(--text)' }}>
                        {option.label}
                      </span>
                    )
                  }))}
                  value={sortBy || 'latest'}
                  className="w-full theme-select"
                  onChange={(value) => onSortChange && onSortChange(value)}
                  dropdownStyle={{
                    background: 'var(--filter-dropdown-bg)',
                    border: '1px solid var(--filter-dropdown-border)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                  }}
                  popupClassName="theme-select-dropdown"
                />
              </div>
            </div>
          </Col>
        </Row>

        {/* Reset Button */}
        {(selectedStatus || searchTerm !== '' || sortBy !== 'latest' || selectedType !== null) && (
          <div className="flex justify-end pt-4">
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
              style={{
                fontFamily: 'Poppins, sans-serif',
                background: 'var(--hover-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--active-bg)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--hover-bg)'}
            >
              <XMarkIcon className="h-4 w-4" />
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default DatasetFilter