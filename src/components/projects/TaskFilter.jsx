import React from 'react'
import { Row, Col, Select, Button } from 'antd'
import { TrainingTask } from 'src/constants/trainingTasks'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { SortDropdown, ProjectSearchBar } from 'src/components/projects'

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

const trainingTaskOptions = Object.values(TrainingTask).map((task) => ({
    value: task,
    label: (
        <span className="font-poppins font-medium text-white">
            {task.replace(/_/g, " ")}
        </span>
    ),
}))

const TaskFilter = ({ selectedTrainingTask, onTaskChange, onReset, showFilter, onSearch, selectedSort, onSortChange, isReset, searchValue }) => {
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
            <div>
                <span className="text-sm font-poppins font-medium text-gray-300 block mb-2">Search:</span>
                <ProjectSearchBar
                    onSearch={onSearch}
                    isReset={isReset}
                />
            </div>
            <Row align="middle" gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <span className="text-sm font-poppins font-medium text-gray-300 block mb-2">Sort by:</span>
                    <SortDropdown
                    selectedSort={selectedSort}
                    onSortChange={onSortChange}
                    />
                </Col>
                {/* Task Type Filter */}
                <Col flex="auto">
                    <span className="text-sm font-poppins font-medium text-gray-300 block mb-2">Type:</span>
                    <Select
                        key="task"
                        options={trainingTaskOptions}
                        value={selectedTrainingTask}
                        placeholder={
                            <span stylel={{color: 'white'}} className="font-poppins text-gray-400">
                                Select task type
                            </span>
                        }
                        className="w-full dark-select"
                        onChange={onTaskChange}
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
                </Col>
            </Row>
            {(selectedTrainingTask || searchValue !== '' || selectedSort !== 'created_at') && (
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
        </>
    )
}

export default TaskFilter
