import { useState, useEffect, useRef, useMemo } from 'react'
import {
	Card,
	Typography,
	Table,
	Button,
	Space,
	Statistic,
	Tag,
	Tooltip,
	Drawer,
	Empty,
	Switch,
	Spin,
	Menu,
	Dropdown,
	Input,
} from 'antd'
import {
	QuestionCircleOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	FileTextOutlined,
	EyeOutlined,
	FilterOutlined,
	DownOutlined,
	CheckOutlined,
	DownloadOutlined,
	EditOutlined,
	SaveOutlined,
} from '@ant-design/icons'
import Papa from 'papaparse'
const { Title, Text } = Typography

const LiteTextClassificationPredict = ({
	predictResult,
	uploadedFiles,
	projectInfo,
	handleUploadFiles,
	model,
}) => {
	const [csvData, setCsvData] = useState([])
	const [predictionHistory, setPredictionHistory] = useState([])
	const [currentFileIndex, setCurrentFileIndex] = useState(-1) // -1 khi chưa có file
	const [currentPage, setCurrentPage] = useState(1)
	const [loading, setLoading] = useState(false)
	const [infoDrawerVisible, setInfoDrawerVisible] = useState(false)
	const [selectedRowData, setSelectedRowData] = useState(null)
	const [visibleColumns, setVisibleColumns] = useState([])
	const [uploading, setUploading] = useState(false)
	const [editingCell, setEditingCell] = useState(null)
	const [editValue, setEditValue] = useState('')
	const [editMode, setEditMode] = useState(false)
	const [editedPredictions, setEditedPredictions] = useState({}) // Store edited prediction values

	const fileInputRef = useRef(null)
	const pageSize = 9

	// Get the predicted class column name from model metadata
	const getPredictedClassColumnName = () => {
		return model?.metadata?.label_column || 'Predicted Class'
	}

	console.log('model', model)

	// Utility function to truncate text with ellipsis (always 50 chars)
	const truncateText = (text) => {
		if (!text || typeof text !== 'string') return text
		return text.length > 50 ? text.substring(0, 50) + '...' : text
	}

	// Check if text is truncated
	const isTextTruncated = (text) => {
		return text && typeof text === 'string' && text.length > 50
	}

	// Convert prediction object to display format
	const getPredictedInfo = (prediction, index) => {
		if (!prediction || typeof prediction !== 'object') {
			return { key: null, class: null, confidence: null }
		}

		// Check if this prediction has been edited
		const editedPrediction = editedPredictions[index]

		return {
			key: prediction.key ?? null,
			class:
				editedPrediction?.class !== undefined
					? editedPrediction.class
					: (prediction.class ?? null),
			confidence:
				editedPrediction?.confidence !== undefined
					? editedPrediction.confidence
					: prediction.confidence
						? parseFloat(prediction.confidence).toFixed(2)
						: null,
		}
	}

	// Download table data as CSV
	const handleDownload = () => {
		if (!csvData.length) return

		// Get all visible columns except Actions
		const visibleColumnsForDownload = visibleColumns.filter(
			(col) => col !== 'Actions'
		)

		// Prepare data for download
		const downloadData = csvData.map((row, index) => {
			const downloadRow = {}

			// Add CSV data columns
			visibleColumnsForDownload.forEach((col) => {
				if (Object.keys(csvData[0]).includes(col)) {
					downloadRow[col] = row[col]
				}
			})

			// Add prediction columns
			const predictedClassColumnName = getPredictedClassColumnName()
			if (visibleColumnsForDownload.includes(predictedClassColumnName)) {
				const prediction = predictResult[index]
				const predictedInfo = getPredictedInfo(prediction, index)
				downloadRow[predictedClassColumnName] =
					predictedInfo.class !== null ? predictedInfo.class : '-'
			}

			if (visibleColumnsForDownload.includes('Confidence')) {
				const prediction = predictResult[index]
				const predictedInfo = getPredictedInfo(prediction, index)
				downloadRow['Confidence'] =
					predictedInfo.confidence !== null
						? predictedInfo.confidence
						: '-'
			}

			return downloadRow
		})

		// Convert to CSV and download
		const csv = Papa.unparse(downloadData)
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		const url = URL.createObjectURL(blob)
		link.setAttribute('href', url)
		link.setAttribute(
			'download',
			`prediction_results_${new Date().toISOString().split('T')[0]}.csv`
		)
		link.style.visibility = 'hidden'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	// Parse CSV và cập nhật dữ liệu
	useEffect(() => {
		if (uploadedFiles?.length) {
			const latestFile = uploadedFiles[uploadedFiles.length - 1]

			if (latestFile?.name.endsWith('.csv')) {
				setLoading(true)
				const reader = new FileReader()
				reader.onload = () => {
					Papa.parse(reader.result, {
						header: true,
						skipEmptyLines: true,
						complete: ({ data, meta }) => {
							const initialVisibleColumns = [...meta.fields]

							if (predictResult.length > 0) {
								initialVisibleColumns.push(
									getPredictedClassColumnName(),
									'Confidence'
								)
							}

							setPredictionHistory((prev) => {
								const existingIndex = prev.findIndex(
									(item) => item.fileName === latestFile.name
								)
								const newHistoryItem = {
									fileName: latestFile.name,
									predictions: predictResult,
									data,
									visibleColumns: initialVisibleColumns,
								}

								let newHistory
								if (existingIndex >= 0) {
									newHistory = [...prev]
									newHistory[existingIndex] = newHistoryItem
								} else {
									newHistory = [...prev, newHistoryItem]
								}

								setCurrentFileIndex(
									existingIndex >= 0
										? existingIndex
										: newHistory.length - 1
								)

								return newHistory
							})

							setCsvData(data)
							setVisibleColumns(initialVisibleColumns)
							setCurrentPage(1)
							setLoading(false)
						},
					})
				}
				reader.readAsText(latestFile)
			}
		}
	}, [uploadedFiles, predictResult, projectInfo])

	// Chuyển đổi giữa các file trong lịch sử
	const handleFileSelect = (index) => {
		if (index >= 0 && index < predictionHistory.length) {
			const selectedItem = predictionHistory[index]
			setCurrentFileIndex(index)
			setCsvData(selectedItem.data)
			setVisibleColumns(selectedItem.visibleColumns)
			setCurrentPage(1) // Reset trang
			setLoading(false)
		}
	}

	const handleClick = () => {
		fileInputRef.current?.click()
	}

	const handleChange = (event) => {
		const files = event.target.files
		if (files && files.length > 0) {
			setUploading(true)
			handleUploadFiles(files).finally(() => {
				setUploading(false)
			})
		}
	}

	const handleColumnVisibilityToggle = (column) => {
		setVisibleColumns((prev) =>
			prev.includes(column)
				? prev.filter((col) => col !== column)
				: [...prev, column]
		)
		// Cập nhật predictionHistory
		setPredictionHistory((prev) => {
			const newHistory = [...prev]
			if (newHistory[currentFileIndex]) {
				newHistory[currentFileIndex].visibleColumns =
					visibleColumns.includes(column)
						? visibleColumns.filter((col) => col !== column)
						: [...visibleColumns, column]
			}
			return newHistory
		})
	}

	const getFilteredData = () => {
		return csvData
	}

	const getColumns = () => {
		if (!csvData.length) return []
		const allColumns = Object.keys(csvData[0])
		const targetColumn = projectInfo.target_column

		const baseColumns = allColumns
			.filter((col) => visibleColumns.includes(col))
			.map((col) => ({
				title: col,
				dataIndex: col,
				key: col,
				render: (text, record, index) => {
					const truncatedText = truncateText(text)
					const isTruncated = isTextTruncated(text)
					const isEditing =
						editingCell?.rowIndex === index &&
						editingCell?.columnKey === col

					if (col === targetColumn) {
						return (
							<div className="flex items-center justify-between">
								<Tooltip
									title={isTruncated ? text : null}
									placement="topLeft"
								>
									<Tag
										color="blue"
										className={
											isTruncated ? 'cursor-help' : ''
										}
									>
										{truncatedText}
									</Tag>
								</Tooltip>
							</div>
						)
					}

					return (
						<div className="flex items-center justify-between group">
							<Tooltip
								title={isTruncated ? text : null}
								placement="topLeft"
								overlayStyle={{ maxWidth: 450 }}
							>
								<Text
									className={isTruncated ? 'cursor-help' : ''}
								>
									{truncatedText}
								</Text>
							</Tooltip>
						</div>
					)
				},
				ellipsis: false, // We handle truncation manually
			}))

		// Create prediction columns based on new API format
		const predictionColumns = []

		// Create conditional columns based on visibility
		const conditionalColumns = []

		// Add Predicted Class column if visible
		const predictedClassColumnName = getPredictedClassColumnName()
		if (visibleColumns.includes(predictedClassColumnName)) {
			conditionalColumns.push({
				title: predictedClassColumnName,
				key: 'predictedClass',
				fixed: 'right',
				width: 120,
				render: (_, record, index) => {
					if (record.__isPlaceholder) {
						return null
					}
					const globalIndex = index + (currentPage - 1) * pageSize
					const prediction = predictResult[globalIndex]
					const predictedInfo = getPredictedInfo(
						prediction,
						globalIndex
					)
					const isEditing =
						editingCell?.rowIndex === index &&
						editingCell?.columnKey === 'predictedClass'

					const displayValue =
						predictedInfo.class === null ? '-' : predictedInfo.class

					return (
						<div className="flex items-center justify-between group">
							<Tag color="green">{displayValue}</Tag>
						</div>
					)
				},
			})
		}

		// Add Confidence column if visible
		if (visibleColumns.includes('Confidence')) {
			conditionalColumns.push({
				title: 'Confidence',
				key: 'confidence',
				fixed: 'right',
				width: 100,
				align: 'center',
				render: (_, record, index) => {
					if (record.__isPlaceholder) {
						return null
					}
					const globalIndex = index + (currentPage - 1) * pageSize
					const prediction = predictResult[globalIndex]
					const predictedInfo = getPredictedInfo(
						prediction,
						globalIndex
					)
					const isEditing =
						editingCell?.rowIndex === index &&
						editingCell?.columnKey === 'confidence'

					const displayValue =
						predictedInfo.confidence === null
							? '-'
							: predictedInfo.confidence

					return (
						<div className="flex items-center justify-between group">
							<Tag color="blue">{displayValue}</Tag>
						</div>
					)
				},
			})
		}

		return [...baseColumns, ...predictionColumns, ...conditionalColumns]
	}

	const columns = getColumns()
	const filteredData = getFilteredData()

	const displayData = useMemo(() => {
		const start = (currentPage - 1) * pageSize
		const pageItems = filteredData.slice(start, start + pageSize)
		const placeholders = []
		const missing = pageSize - pageItems.length
		for (let i = 0; i < missing; i++) {
			placeholders.push({ __isPlaceholder: true, __placeholderIndex: i })
		}
		return [...pageItems, ...placeholders]
	}, [filteredData, currentPage, pageSize])

	const totalItems = filteredData.length

	return (
		<div className="min-h-max bg-gradient-to-br from-slate-50 to-blue-50 p-6">
			<div className="mb-8">
				<div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div className="flex items-center gap-4">
							<div>
								<Title
									level={3}
									className="!mb-1 !text-slate-800"
								>
									Prediction Dashboard
								</Title>
								<Text className="text-slate-500">
									Review and validate your model predictions
								</Text>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3">
							<Dropdown
								overlay={
									<Menu className="rounded-lg shadow-lg border-0">
										{predictionHistory.map(
											(item, index) => (
												<Menu.Item
													key={index}
													onClick={() =>
														handleFileSelect(index)
													}
													className="rounded-md"
												>
													<div className="flex items-center justify-between">
														<span className="flex items-center gap-2">
															<FileTextOutlined />
															{item.fileName}
														</span>
														{index ===
															currentFileIndex && (
															<CheckOutlined className="text-blue-500" />
														)}
													</div>
												</Menu.Item>
											)
										)}
									</Menu>
								}
								trigger={['click']}
							>
								<Button
									className="h-10 px-4 bg-slate-100 border-slate-200 hover:bg-slate-200 rounded-lg"
									icon={<FileTextOutlined />}
								>
									<span className="hidden sm:inline">
										{predictionHistory[currentFileIndex]
											?.fileName || 'No file uploaded'}
									</span>
									<DownOutlined className="ml-2" />
								</Button>
							</Dropdown>

							<Tooltip title="Configure visible columns">
								<Button
									icon={<FilterOutlined />}
									onClick={() => setInfoDrawerVisible(true)}
									className="h-10 px-4 border-slate-200 hover:border-blue-300 rounded-lg"
								>
									<span className="hidden sm:inline">
										Columns
									</span>
								</Button>
							</Tooltip>

							<Tooltip title="Download prediction results as CSV">
								<Button
									icon={<DownloadOutlined />}
									onClick={handleDownload}
									disabled={!csvData.length}
									className="h-10 px-4 border-slate-200 hover:border-green-300 rounded-lg"
								>
									<span className="hidden sm:inline">
										Download
									</span>
								</Button>
							</Tooltip>

							<input
								type="file"
								ref={fileInputRef}
								onChange={handleChange}
								style={{ display: 'none' }}
								accept=".csv"
							/>
						</div>
					</div>
				</div>
			</div>

			{loading ? (
				<Card className="border-0 shadow-lg rounded-xl">
					<div className="flex flex-col items-center justify-center py-16">
						<Spin size="large" />
						<Text className="mt-4 text-slate-500 text-lg">
							Loading prediction data...
						</Text>
					</div>
				</Card>
			) : csvData.length > 0 ? (
				<Card className="border-0 shadow-lg rounded-xl overflow-hidden">
					<div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Text className="text-slate-700 font-medium">
									Prediction Results
								</Text>
							</div>
						</div>
					</div>
					<Table
						dataSource={displayData}
						columns={columns}
						rowKey={(record, idx) =>
							record.__isPlaceholder
								? `placeholder-${(currentPage - 1) * pageSize + idx}`
								: idx + (currentPage - 1) * pageSize
						}
						pagination={{
							pageSize,
							current: currentPage,
							onChange: setCurrentPage,
							total: totalItems,
							showSizeChanger: false,
							showTotal: (total) => (
								<span className="text-slate-500 font-medium">
									{total} predictions
								</span>
							),
							className:
								'px-6 py-4 bg-slate-50 border-t border-slate-200',
						}}
						size="middle"
						scroll={{ x: 'max-content' }}
						rowClassName="hover:bg-slate-50"
						className="[&_.ant-table-thead>tr>th]:bg-slate-100 [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-slate-700 [&_.ant-table-tbody>tr>td]:h-12 [&_.ant-table-tbody>tr>td]:align-middle"
					/>
				</Card>
			) : (
				<Card className="border-0 shadow-lg rounded-xl">
					<div className="py-16">
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								<div className="text-center">
									<Text className="text-slate-500 text-lg block mb-2">
										No prediction data available
									</Text>
									<Text className="text-slate-400">
										Upload a CSV file to start reviewing
										predictions
									</Text>
								</div>
							}
						>
							<Button
								type="primary"
								size="large"
								onClick={handleClick}
								loading={uploading}
								className="mt-4 h-12 px-8 bg-blue-600 hover:bg-blue-700 border-0 rounded-lg shadow-md"
							>
								Upload a file to start
							</Button>
						</Empty>
					</div>
				</Card>
			)}

			<Drawer
				title={
					<div className="flex items-center gap-3">
						<span className="text-lg font-semibold text-slate-800">
							{selectedRowData
								? 'Prediction Details'
								: 'Column Visibility'}
						</span>
					</div>
				}
				placement="right"
				onClose={() => {
					setInfoDrawerVisible(false)
					setSelectedRowData(null)
				}}
				open={infoDrawerVisible}
				width={450}
				className="[&_.ant-drawer-header]:bg-slate-50 [&_.ant-drawer-header]:border-slate-200"
			>
				{selectedRowData ? (
					<div className="space-y-6">
						<div>
							<div className="flex items-center gap-2 mb-4">
								<div className="w-1 h-6 bg-blue-500 rounded-full"></div>
								<Text className="text-lg font-semibold text-slate-800">
									Data Fields
								</Text>
							</div>
							<div className="space-y-3">
								{Object.entries(selectedRowData.record).map(
									([key, value]) => (
										<div
											key={key}
											className="p-3 bg-slate-50 rounded-lg"
										>
											<Text className="text-sm font-medium text-slate-600 block mb-1">
												{key}
											</Text>
											{key ===
											projectInfo.target_column ? (
												<Tag
													color="blue"
													className="text-sm"
												>
													{value}
												</Tag>
											) : (
												<Text className="text-slate-800">
													{value}
												</Text>
											)}
										</div>
									)
								)}
							</div>
						</div>

						<div>
							<div className="flex items-center gap-2 mb-4">
								<div className="w-1 h-6 bg-purple-500 rounded-full"></div>
								<Text className="text-lg font-semibold text-slate-800">
									Prediction
								</Text>
							</div>
							<div className="space-y-3">
								{(() => {
									const prediction =
										predictResult[selectedRowData.index]
									const predictedInfo = getPredictedInfo(
										prediction,
										selectedRowData.index
									)

									return (
										<>
											<div className="p-3 bg-purple-50 rounded-lg">
												<Text className="text-sm font-medium text-slate-600 block mb-1">
													{getPredictedClassColumnName()}
												</Text>
												<Tag
													color="purple"
													className="text-sm font-medium"
												>
													{predictedInfo.class !==
													null
														? predictedInfo.class
														: 'No prediction'}
												</Tag>
											</div>
											<div className="p-3 bg-purple-50 rounded-lg">
												<Text className="text-sm font-medium text-slate-600 block mb-1">
													Confidence
												</Text>
												<Tag
													color="purple"
													className="text-sm font-medium"
												>
													{predictedInfo.confidence !==
													null
														? predictedInfo.confidence
														: 'No prediction'}
												</Tag>
											</div>
										</>
									)
								})()}
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-6">
						<div>
							<Text className="text-slate-600 text-base">
								Select which columns to display in the table for
								better data visualization.
							</Text>
						</div>

						<div>
							<div className="flex items-center gap-2 mb-4">
								<div className="w-1 h-6 bg-green-500 rounded-full"></div>
								<Text className="text-lg font-semibold text-slate-800">
									Available Columns
								</Text>
							</div>
							<div className="space-y-3">
								{/* CSV Data Columns */}
								{csvData.length > 0 &&
									Object.keys(csvData[0]).map((column) => (
										<div
											key={column}
											className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
										>
											<div className="flex items-center gap-3">
												<Switch
													checked={visibleColumns.includes(
														column
													)}
													onChange={() =>
														handleColumnVisibilityToggle(
															column
														)
													}
													size="small"
												/>
												<div>
													<Text
														className={`${column === projectInfo.target_column ? 'font-semibold text-green-600' : 'text-slate-700'}`}
													>
														{column}
													</Text>
													{column ===
														projectInfo.target_column && (
														<Tag
															color="green"
															size="small"
															className="ml-2"
														>
															Target
														</Tag>
													)}
												</div>
											</div>
										</div>
									))}

								{/* Prediction Columns */}
								{predictResult.length > 0 && (
									<>
										<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
											<div className="flex items-center gap-3">
												<Switch
													checked={visibleColumns.includes(
														getPredictedClassColumnName()
													)}
													onChange={() =>
														handleColumnVisibilityToggle(
															getPredictedClassColumnName()
														)
													}
													size="small"
												/>
												<div>
													<Text className="font-semibold text-blue-600">
														{getPredictedClassColumnName()}
													</Text>
													<Tag
														color="blue"
														size="small"
														className="ml-2"
													>
														Prediction
													</Tag>
												</div>
											</div>
										</div>

										<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
											<div className="flex items-center gap-3">
												<Switch
													checked={visibleColumns.includes(
														'Confidence'
													)}
													onChange={() =>
														handleColumnVisibilityToggle(
															'Confidence'
														)
													}
													size="small"
												/>
												<div>
													<Text className="font-semibold text-blue-600">
														Confidence
													</Text>
													<Tag
														color="blue"
														size="small"
														className="ml-2"
													>
														Score
													</Tag>
												</div>
											</div>
										</div>
									</>
								)}
							</div>
						</div>

						<div className="pt-4 border-t border-slate-200">
							<Button
								type="primary"
								size="large"
								onClick={() => setInfoDrawerVisible(false)}
								className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-0 rounded-lg"
							>
								Close
							</Button>
						</div>
					</div>
				)}
			</Drawer>
		</div>
	)
}

export default LiteTextClassificationPredict
