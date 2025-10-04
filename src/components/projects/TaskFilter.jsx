import React from 'react'
import { Row, Col, Select, Button } from 'antd'
import { TrainingTask } from 'src/constants/trainingTasks'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { SortDropdown, ProjectSearchBar } from 'src/components/projects'

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

const trainingTaskOptions = Object.values(TrainingTask).map((task) => ({
	value: task,
	label: (
		<span
			className="font-poppins font-medium"
			style={{ color: 'var(--text)' }}
		>
			{task.replace(/_/g, ' ')}
		</span>
	),
}))

const TaskFilter = ({
	selectedTrainingTask,
	onTaskChange,
	onReset,
	onSearch,
	selectedSort,
	onSortChange,
	isReset,
	searchValue,
}) => {
	return (
		<>
			<style>{themeSelectStyles}</style>
			<div
				className={`mb-6 p-4 rounded-xl backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden max-h-96 opacity-100 transform translate-y-0`}
				style={{
					background: 'var(--filter-bg)',
					border: '1px solid var(--filter-border)',
				}}
			>
				<Row align="bottom" gutter={[12, 12]} wrap>
					{/* Search */}
					<Col xs={24} md={10} lg={12}>
						<ProjectSearchBar
							onSearch={onSearch}
							isReset={isReset}
							compact
						/>
					</Col>
					{/* Task Type Filter */}
					<Col xs={12} md={7} lg={7}>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
							}}
						>
							<span
								className="text-sm font-poppins font-medium"
								style={{
									color: 'var(--title-project)',
									whiteSpace: 'nowrap',
									textShadow: '0 1px 2px rgba(0,0,0,0.3)',
								}}
							>
								Type:
							</span>
							<div style={{ flex: 1 }}>
								<Select
									key="task"
									options={trainingTaskOptions}
									value={selectedTrainingTask}
									placeholder={
										<span
											className="font-poppins"
											style={{
												color: 'var(--secondary-text)',
											}}
										>
											Select task type
										</span>
									}
									className="w-full theme-select"
									onChange={onTaskChange}
									allowClear
									dropdownStyle={{
										background: 'var(--filter-dropdown-bg)',
										border: '1px solid var(--filter-dropdown-border)',
										borderRadius: '12px',
										backdropFilter: 'blur(10px)',
									}}
									popupClassName="theme-select-dropdown"
									style={{ height: 40 }}
								/>
							</div>
						</div>
					</Col>
					{/* Sort */}
					<Col xs={12} md={7} lg={5}>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
							}}
						>
							<span
								className="text-sm font-poppins font-medium"
								style={{
									color: 'var(--title-project)',
									whiteSpace: 'nowrap',
									textShadow: '0 1px 2px rgba(0,0,0,0.3)',
								}}
							>
								Sort by:
							</span>
							<div style={{ flex: 1 }}>
								<SortDropdown
									selectedSort={selectedSort}
									onSortChange={onSortChange}
								/>
							</div>
						</div>
					</Col>
				</Row>
				{(selectedTrainingTask ||
					searchValue !== '' ||
					selectedSort !== 'created_at') && (
					<div className="flex justify-end pt-2">
						<button
							onClick={onReset}
							className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
							style={{
								fontFamily: 'Poppins, sans-serif',
								background: 'var(--hover-bg)',
								border: '1px solid var(--border)',
								color: 'var(--text)',
							}}
							onMouseEnter={(e) =>
								(e.target.style.background = 'var(--active-bg)')
							}
							onMouseLeave={(e) =>
								(e.target.style.background = 'var(--hover-bg)')
							}
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
