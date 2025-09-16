import React from 'react'
import { Row, Col, Select, Button } from 'antd'
import { XMarkIcon } from '@heroicons/react/24/outline'

// Custom styles for dark select
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
            <style>{darkSelectStyles}</style>
            <div 
                className={`mb-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden ${
                    showFilter 
                        ? 'max-h-96 opacity-100 transform translate-y-0' 
                        : 'max-h-0 opacity-0 transform -translate-y-4'
                }`}
            >
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div>
                        <span className="text-sm font-poppins font-medium text-gray-300 block mb-2">
                            Search:
                        </span>
                        <input
                            type="text"
                            placeholder="Search datasets..."
                            value={searchTerm || ''}
                            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                            style={{ 
                                fontFamily: 'Poppins, sans-serif',
                                background: 'rgba(15, 32, 39, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px'
                            }}
                        />
                    </div>

                    {/* Sort and Filter Controls */}
                    <Row gutter={[16, 16]} align="middle">
                        {/* Sort Control */}
                        <Col xs={24} sm={8}>
                            <div className="space-y-2">
                                <span className="text-sm font-poppins font-medium text-gray-300">
                                    Sort by:
                                </span>
                                <Select
                                    options={sortOptions.map(option => ({
                                        ...option,
                                        label: (
                                            <span className="font-poppins font-medium text-white">
                                                {option.label}
                                            </span>
                                        )
                                    }))}
                                    value={sortBy || 'latest'}
                                    placeholder={
                                        <span className="font-poppins text-gray-400">
                                            Select sort order
                                        </span>
                                    }
                                    className="w-full dark-select"
                                    onChange={(value) => onSortChange && onSortChange(value)}
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
                                    }}
                                    popupClassName="dark-select-dropdown"
                                />
                            </div>
                        </Col>

                        {/* Type Filter Control */}
                        <Col xs={24} sm={8}>
                            <div className="space-y-2">
                                <span className="text-sm font-poppins font-medium text-gray-300">
                                    Type:
                                </span>
                                <Select
                                    options={typeFilterOptions.map(option => ({
                                        ...option,
                                        label: (
                                            <span className="font-poppins font-medium text-white">
                                                {option.label}
                                            </span>
                                        )
                                    }))}
                                    value={filterBy || 'none'}
                                    placeholder={
                                        <span className="font-poppins text-gray-400">
                                            Select dataset type
                                        </span>
                                    }
                                    className="w-full dark-select"
                                    onChange={(value) => onFilterChange && onFilterChange(value)}
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
                                    }}
                                    popupClassName="dark-select-dropdown"
                                />
                            </div>
                        </Col>

                        {/* Advanced Filter by Status */}
                        <Col xs={24} sm={8}>
                            <div className="space-y-2">
                                <span className="text-sm font-poppins font-medium text-gray-300">
                                    Status:
                                </span>
                                <Select
                                    options={statusOptions.map(option => ({
                                        ...option,
                                        label: (
                                            <span className="font-poppins font-medium text-white">
                                                {option.label}
                                            </span>
                                        )
                                    }))}
                                    value={selectedStatus}
                                    placeholder={
                                        <span className="font-poppins text-gray-400">
                                            Select status
                                        </span>
                                    }
                                    className="w-full dark-select"
                                    onChange={onStatusChange}
                                    allowClear
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
                                    }}
                                    popupClassName="dark-select-dropdown"
                                />
                            </div>
                        </Col>
                    </Row>

                    {/* Reset Button */}
                    {(selectedStatus || searchTerm || sortBy !== 'latest' || filterBy !== 'none') && (
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={onReset}
                                className="px-4 py-2 rounded-lg bg-white/10 flex items-center gap-2 hover:bg-white/20 transition-all duration-200 text-white"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
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
