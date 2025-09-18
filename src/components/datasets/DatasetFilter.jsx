import React from 'react'
import { Row, Col, Select, Button } from 'antd'
import { XMarkIcon } from '@heroicons/react/24/outline'

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

/* Search input styling */
.theme-search-input {
    background: var(--filter-input-bg) !important;
    border: 1px solid var(--filter-input-border) !important;
    color: var(--text) !important;
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

const datasetTypeOptions = [
    { value: 'IMAGE_CLASSIFICATION', label: 'Image Classification' },
    { value: 'TEXT_CLASSIFICATION', label: 'Text Classification' },
    { value: 'TABULAR_CLASSIFICATION', label: 'Tabular Classification' },
    { value: 'TABULAR_REGRESSION', label: 'Tabular Regression' },
    { value: 'MULTIMODAL_CLASSIFICATION', label: 'Multimodal Classification' },
    { value: 'MULTILABEL_CLASSIFICATION', label: 'Multilabel Classification' },
    { value: 'OBJECT_DETECTION', label: 'Object Detection' },
    { value: 'IMAGE_SEGMENTATION', label: 'Image Segmentation' },
    { value: 'TIME_SERIES', label: 'Time Series' },
]

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
    { value: 'none', label: 'None' },
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
    showFilter,
    // New props for search and sort
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
    filterBy,
    onFilterChange
}) => {
    return (
        <>
            <style>{themeSelectStyles}</style>
            <div 
                className={`mb-6 p-4 rounded-xl backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden ${
                    showFilter 
                        ? 'max-h-96 opacity-100 transform translate-y-0' 
                        : 'max-h-0 opacity-0 transform -translate-y-4'
                }`}
                style={{
                    background: 'var(--filter-bg)',
                    border: '1px solid var(--filter-border)'
                }}
            >
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div>
                        <span className="text-sm font-poppins font-medium block mb-2" style={{ color: 'var(--secondary-text)' }}>
                            Search:
                        </span>
                        <input
                            type="text"
                            placeholder="Search datasets..."
                            value={searchTerm || ''}
                            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 theme-search-input"
                            style={{ 
                                fontFamily: 'Poppins, sans-serif',
                                borderRadius: '6px'
                            }}
                        />
                    </div>

                    {/* Sort and Filter Controls */}
                    <Row gutter={[16, 16]} align="middle">
                        {/* Sort Control */}
                        <Col xs={24} sm={8}>
                            <div className="space-y-2">
                                <span className="text-sm font-poppins font-medium" style={{ color: 'var(--secondary-text)' }}>
                                    Sort by:
                                </span>
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
                                    placeholder={
                                        <span className="font-poppins" style={{ color: 'var(--secondary-text)' }}>
                                            Select sort order
                                        </span>
                                    }
                                    className="w-full theme-select"
                                    onChange={(value) => onSortChange && onSortChange(value)}
                                    dropdownStyle={{
                                        background: 'var(--filter-dropdown-bg)',
                                        border: '1px solid var(--filter-dropdown-border)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                    style={{
                                    }}
                                    popupClassName="theme-select-dropdown"
                                />
                            </div>
                        </Col>

                        {/* Type Filter Control */}
                        <Col xs={24} sm={8}>
                            <div className="space-y-2">
                                <span className="text-sm font-poppins font-medium" style={{ color: 'var(--secondary-text)' }}>
                                    Type:
                                </span>
                                <Select
                                    options={typeFilterOptions.map(option => ({
                                        ...option,
                                        label: (
                                            <span className="font-poppins font-medium" style={{ color: 'var(--text)' }}>
                                                {option.label}
                                            </span>
                                        )
                                    }))}
                                    value={filterBy || 'none'}
                                    placeholder={
                                        <span className="font-poppins" style={{ color: 'var(--secondary-text)' }}>
                                            Select dataset type
                                        </span>
                                    }
                                    className="w-full theme-select"
                                    onChange={(value) => onFilterChange && onFilterChange(value)}
                                    dropdownStyle={{
                                        background: 'var(--filter-dropdown-bg)',
                                        border: '1px solid var(--filter-dropdown-border)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                    style={{
                                    }}
                                    popupClassName="theme-select-dropdown"
                                />
                            </div>
                        </Col>

                        {/* Advanced Filter by Status */}
                        <Col xs={24} sm={8}>
                            <div className="space-y-2">
                                <span className="text-sm font-poppins font-medium" style={{ color: 'var(--secondary-text)' }}>
                                    Status:
                                </span>
                                <Select
                                    options={statusOptions.map(option => ({
                                        ...option,
                                        label: (
                                            <span className="font-poppins font-medium" style={{ color: 'var(--text)' }}>
                                                {option.label}
                                            </span>
                                        )
                                    }))}
                                    value={selectedStatus}
                                    placeholder={
                                        <span className="font-poppins" style={{ color: 'var(--secondary-text)' }}>
                                            Select status
                                        </span>
                                    }
                                    className="w-full theme-select"
                                    onChange={onStatusChange}
                                    allowClear
                                    dropdownStyle={{
                                        background: 'var(--filter-dropdown-bg)',
                                        border: '1px solid var(--filter-dropdown-border)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                    style={{
                                    }}
                                    popupClassName="theme-select-dropdown"
                                />
                            </div>
                        </Col>
                    </Row>

                    {/* Reset Button */}
                    {(selectedStatus || searchTerm || sortBy !== 'latest' || filterBy !== 'none') && (
                        <div className="flex justify-end pt-2">
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
            </div>
        </>
    )
}

export default DatasetFilter
