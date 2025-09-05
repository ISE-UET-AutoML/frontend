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

const DatasetFilter = ({ 
    selectedType, 
    onTypeChange, 
    selectedStatus, 
    onStatusChange, 
    onReset, 
    showFilter 
}) => {
    return (
        <>
            <style>{darkSelectStyles}</style>
            <div 
                className={`mb-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden ${
                    showFilter 
                        ? 'max-h-32 opacity-100 transform translate-y-0' 
                        : 'max-h-0 opacity-0 transform -translate-y-4'
                }`}
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12}>
                        <div className="space-y-2">
                            <span className="text-sm font-poppins font-medium text-gray-300">
                                Filter by Type:
                            </span>
                            <Select
                                options={datasetTypeOptions.map(option => ({
                                    ...option,
                                    label: (
                                        <span className="font-poppins font-medium text-white">
                                            {option.label}
                                        </span>
                                    )
                                }))}
                                value={selectedType}
                                placeholder={
                                    <span className="font-poppins text-gray-400">
                                        Select dataset type
                                    </span>
                                }
                                className="w-full dark-select"
                                onChange={onTypeChange}
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
                    <Col xs={24} sm={12}>
                        <div className="space-y-2">
                            <span className="text-sm font-poppins font-medium text-gray-300">
                                Filter by Status:
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
                    {(selectedType || selectedStatus) && (
                        <Col xs={24}>
                            <div className="flex justify-end">
                                <button
                                    onClick={onReset}
                                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-200"
                                >
                                    <XMarkIcon className="h-4 w-4 text-white" />
                                </button>
                            </div>
                        </Col>
                    )}
                </Row>
            </div>
        </>
    )
}

export default DatasetFilter
