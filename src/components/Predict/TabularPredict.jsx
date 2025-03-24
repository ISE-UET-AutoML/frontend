import React, { useState, useEffect } from 'react'
import {
	Card,
	Layout,
	Typography,
	Table,
	Button,
	Space,
	Badge,
	Statistic,
	Progress,
	Tag,
	Tooltip,
	Drawer,
	Empty,
	Pagination,
	Alert,
	Divider,
	Switch,
	Select,
	Spin,
} from 'antd'
import {
	LeftOutlined,
	RightOutlined,
	QuestionCircleOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	FileTextOutlined,
	EyeOutlined,
	EyeInvisibleOutlined,
	InfoCircleOutlined,
	ThunderboltOutlined,
	BarChartOutlined,
	TableOutlined,
	ExclamationCircleOutlined,
	FilterOutlined,
} from '@ant-design/icons'
import Papa from 'papaparse'
const { Title, Text, Paragraph } = Typography
const { Content, Header } = Layout
const { Option } = Select

const TabularPredict = ({ predictResult, uploadedFiles, projectInfo }) => {
	const [csvData, setCsvData] = useState([])
	const [currentPage, setCurrentPage] = useState(1)
	const [incorrectPredictions, setIncorrectPredictions] = useState([])
	const [statistics, setStatistics] = useState({
		correct: 0,
		incorrect: 0,
		accuracy: 0,
		totalReviewed: 0,
	})
	const [loading, setLoading] = useState(true)
	const [infoDrawerVisible, setInfoDrawerVisible] = useState(false)
	const [selectedRowData, setSelectedRowData] = useState(null)
	const [visibleColumns, setVisibleColumns] = useState([])
	const [isCompactView, setIsCompactView] = useState(false)
	const [confidenceFilter, setConfidenceFilter] = useState('all')

	const pageSize = 10

	// Parse CSV and initialize data
	useEffect(() => {
		if (uploadedFiles?.length && uploadedFiles[0]?.name.endsWith('.csv')) {
			setLoading(true)
			const reader = new FileReader()
			reader.onload = () => {
				Papa.parse(reader.result, {
					header: true,
					skipEmptyLines: true,
					complete: ({ data, meta }) => {
						setCsvData(data)
						// Initialize visible columns (including the target column and prediction)
						const importantColumns = [
							projectInfo.target_column,
							`Predicted ${projectInfo.target_column}`,
							'Confidence',
							'Actions',
						]

						// Start with most important columns
						const initialVisibleColumns = meta.fields.filter(
							(field) =>
								importantColumns.includes(field) ||
								meta.fields.indexOf(field) < 3
						)

						setVisibleColumns(initialVisibleColumns)

						// Initialize incorrect predictions based on confidence
						const initialIncorrect = predictResult
							.map((result, idx) =>
								result.confidence < 0.7 ? idx : null
							)
							.filter((idx) => idx !== null)

						setIncorrectPredictions(initialIncorrect)
						setLoading(false)
					},
				})
			}
			reader.readAsText(uploadedFiles[0])
		}
	}, [uploadedFiles, predictResult, projectInfo])

	// Update statistics when predictions change
	useEffect(() => {
		const incorrect = incorrectPredictions.length
		const total = csvData.length
		const reviewed = Math.min(currentPage * pageSize, total)

		setStatistics({
			correct: total - incorrect,
			incorrect,
			accuracy: total
				? (((total - incorrect) / total) * 100).toFixed(1)
				: 0,
			totalReviewed: reviewed,
		})
	}, [incorrectPredictions, csvData, currentPage])

	const handlePredictionToggle = (index) => {
		setIncorrectPredictions((prev) =>
			prev.includes(index)
				? prev.filter((i) => i !== index)
				: [...prev, index]
		)
	}

	const showRowDetails = (record, index) => {
		setSelectedRowData({ record, index })
		setInfoDrawerVisible(true)
	}

	const handleColumnVisibilityToggle = (column) => {
		setVisibleColumns((prev) =>
			prev.includes(column)
				? prev.filter((col) => col !== column)
				: [...prev, column]
		)
	}

	// Filter data based on confidence level
	const getFilteredData = () => {
		if (confidenceFilter === 'all') return csvData

		return csvData.filter((_, index) => {
			const confidence = predictResult[index]?.confidence || 0
			if (confidenceFilter === 'high') return confidence >= 0.8
			if (confidenceFilter === 'medium')
				return confidence >= 0.5 && confidence < 0.8
			if (confidenceFilter === 'low') return confidence < 0.5
			return true
		})
	}

	const getConfidenceStatus = (confidence) => {
		if (confidence >= 0.8)
			return {
				color: 'green',
				status: 'High',
				icon: <CheckCircleOutlined />,
			}
		if (confidence >= 0.5)
			return {
				color: 'orange',
				status: 'Medium',
				icon: <ExclamationCircleOutlined />,
			}
		return { color: 'red', status: 'Low', icon: <CloseCircleOutlined /> }
	}

	// Generate table columns based on CSV data
	const getColumns = () => {
		if (!csvData.length) return []

		const allColumns = Object.keys(csvData[0])
		const targetColumn = projectInfo.target_column

		// Start with basic columns (first 2-3 columns for identification)
		const baseColumns = allColumns
			.filter((col) => visibleColumns.includes(col))
			.map((col) => ({
				title: col,
				dataIndex: col,
				key: col,
				render: (text) => {
					if (col === targetColumn) {
						return <Tag color="blue">{text}</Tag>
					}
					return <Text>{text}</Text>
				},
				ellipsis: true,
			}))

		// Add prediction and confidence columns
		return [
			...baseColumns,
			{
				title: `Predicted ${targetColumn}`,
				key: 'predictedClass',
				render: (_, __, index) => {
					const predicted = predictResult[index]?.class || 'N/A'
					const actual = csvData[index][targetColumn]
					const isCorrect = !incorrectPredictions.includes(index)

					return (
						<Tag color={isCorrect ? 'green' : 'red'}>
							{predicted}
							{predicted !== actual && isCorrect && (
								<Tooltip title="Actual value is different, but marked as correct prediction">
									<InfoCircleOutlined
										style={{ marginLeft: 5 }}
									/>
								</Tooltip>
							)}
						</Tag>
					)
				},
			},
			{
				title: 'Confidence',
				key: 'confidence',
				width: 160,
				render: (_, __, index) => {
					const confidence = predictResult[index]?.confidence || 0
					const { color, status, icon } =
						getConfidenceStatus(confidence)

					return (
						<Space
							direction="vertical"
							size="small"
							style={{ width: '100%' }}
						>
							<Progress
								percent={Math.round(confidence * 100)}
								size="small"
								status={
									confidence >= 0.5 ? 'normal' : 'exception'
								}
								strokeColor={color}
							/>
							<Text
								type={confidence < 0.5 ? 'danger' : undefined}
								style={{ fontSize: '12px' }}
							>
								{icon} {status}: {(confidence * 100).toFixed(0)}
								%
							</Text>
						</Space>
					)
				},
			},
			{
				title: 'Actions',
				key: 'actions',
				fixed: 'right',
				width: 150,
				render: (_, record, index) => (
					<Space>
						<Tooltip
							title={
								incorrectPredictions.includes(index)
									? 'Mark as correct'
									: 'Mark as incorrect'
							}
						>
							<Button
								type={
									incorrectPredictions.includes(index)
										? 'default'
										: 'primary'
								}
								size="small"
								icon={
									incorrectPredictions.includes(index) ? (
										<CheckCircleOutlined />
									) : (
										<CloseCircleOutlined />
									)
								}
								onClick={() => handlePredictionToggle(index)}
								danger={!incorrectPredictions.includes(index)}
							>
								{incorrectPredictions.includes(index)
									? 'Correct'
									: 'Incorrect'}
							</Button>
						</Tooltip>
						<Tooltip title="View details">
							<Button
								type="text"
								size="small"
								icon={<EyeOutlined />}
								onClick={() => showRowDetails(record, index)}
							/>
						</Tooltip>
					</Space>
				),
			},
		]
	}

	const columns = getColumns()
	const filteredData = getFilteredData()

	// Helper for getting color based on accuracy value
	const getAccuracyColor = (accuracy) => {
		if (accuracy >= 80) return '#52c41a'
		if (accuracy >= 60) return '#faad14'
		return '#f5222d'
	}

	return (
		<Layout className="bg-white">
			<Header className="bg-white p-0 mb-4">
				<Card bordered={false} className="shadow-sm">
					<div className="flex justify-between items-center">
						<Space>
							<Title level={4} style={{ margin: 0 }}>
								<TableOutlined /> Prediction Review Dashboard
							</Title>
							<Tag color="blue" icon={<FileTextOutlined />}>
								{uploadedFiles?.[0]?.name || 'No file uploaded'}
							</Tag>
						</Space>
						<Space>
							<Tooltip title="Toggle compact view">
								<Switch
									checked={isCompactView}
									onChange={setIsCompactView}
									checkedChildren={<EyeInvisibleOutlined />}
									unCheckedChildren={<EyeOutlined />}
								/>
							</Tooltip>
							<Tooltip title="Filter by confidence">
								<Select
									defaultValue="all"
									style={{ width: 120 }}
									onChange={setConfidenceFilter}
									dropdownMatchSelectWidth={false}
								>
									<Option value="all">All predictions</Option>
									<Option value="high">
										High confidence
									</Option>
									<Option value="medium">
										Medium confidence
									</Option>
									<Option value="low">Low confidence</Option>
								</Select>
							</Tooltip>
							<Tooltip title="Configure visible columns">
								<Button
									icon={<FilterOutlined />}
									onClick={() => setInfoDrawerVisible(true)}
								>
									Columns
								</Button>
							</Tooltip>
						</Space>
					</div>
				</Card>
			</Header>
			<Content className="p-4">
				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
					<Card size="small" className="border-blue-400 bg-blue-50">
						<Statistic
							title={
								<span className="text-blue-600 font-medium">
									Total Predictions
								</span>
							}
							value={csvData.length}
							prefix={
								<QuestionCircleOutlined className="text-blue-600" />
							}
							valueStyle={{ color: '#1890ff' }}
						/>
						<Progress
							percent={
								Math.round(
									(statistics.totalReviewed /
										csvData.length) *
										100
								) || 0
							}
							showInfo={false}
							strokeColor="#1890ff"
							size="small"
							className="mt-2"
						/>
						<Text className="text-xs text-blue-600">
							{statistics.totalReviewed} of {csvData.length}{' '}
							reviewed
						</Text>
					</Card>

					<Card size="small" className="border-green-400 bg-green-50">
						<Statistic
							title={
								<span className="text-green-600 font-medium">
									Correct Predictions
								</span>
							}
							value={statistics.correct}
							prefix={
								<CheckCircleOutlined className="text-green-600" />
							}
							valueStyle={{ color: '#52c41a' }}
						/>
						<Progress
							percent={
								Math.round(
									(statistics.correct / csvData.length) * 100
								) || 0
							}
							showInfo={false}
							strokeColor="#52c41a"
							size="small"
							className="mt-2"
						/>
					</Card>

					<Card size="small" className="border-red-400 bg-red-50">
						<Statistic
							title={
								<span className="text-red-600 font-medium">
									Incorrect Predictions
								</span>
							}
							value={statistics.incorrect}
							prefix={
								<CloseCircleOutlined className="text-red-600" />
							}
							valueStyle={{ color: '#f5222d' }}
						/>
						<Progress
							percent={
								Math.round(
									(statistics.incorrect / csvData.length) *
										100
								) || 0
							}
							showInfo={false}
							strokeColor="#f5222d"
							size="small"
							className="mt-2"
						/>
					</Card>

					<Card
						size="small"
						className="border-purple-400 bg-purple-50"
					>
						<Statistic
							title={
								<span className="text-purple-600 font-medium">
									Accuracy
								</span>
							}
							value={statistics.accuracy}
							suffix="%"
							precision={1}
							prefix={
								<BarChartOutlined className="text-purple-600" />
							}
							valueStyle={{
								color: getAccuracyColor(
									parseFloat(statistics.accuracy)
								),
							}}
						/>
						<Progress
							percent={parseFloat(statistics.accuracy)}
							showInfo={false}
							strokeColor={getAccuracyColor(
								parseFloat(statistics.accuracy)
							)}
							size="small"
							className="mt-2"
						/>
					</Card>
				</div>

				{/* Alert for low accuracy */}
				{parseFloat(statistics.accuracy) < 70 && csvData.length > 0 && (
					<Alert
						message="Low Prediction Accuracy Detected"
						description="The current model accuracy is below 70%. You may want to review more predictions or consider retraining your model with additional data."
						type="warning"
						showIcon
						className="mb-4"
						icon={<ExclamationCircleOutlined />}
						action={
							<Button size="small" type="primary">
								View Suggestions
							</Button>
						}
					/>
				)}

				{/* Main Table */}
				{loading ? (
					<Card>
						<div className="flex items-center justify-center p-12">
							<Spin
								size="large"
								tip="Loading prediction data..."
							/>
						</div>
					</Card>
				) : csvData.length > 0 ? (
					<Card className="shadow-sm">
						<Table
							dataSource={filteredData}
							columns={columns}
							rowKey={(_, index) => index}
							pagination={{
								pageSize,
								current: currentPage,
								onChange: setCurrentPage,
								showSizeChanger: false,
								showTotal: (total) => `${total} predictions`,
							}}
							size={isCompactView ? 'small' : 'middle'}
							scroll={{ x: 'max-content' }}
							rowClassName={(_, index) =>
								incorrectPredictions.includes(index)
									? 'bg-red-50'
									: ''
							}
						/>
					</Card>
				) : (
					<Card>
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description="No prediction data available"
						>
							<Button type="primary">
								Upload a file to start
							</Button>
						</Empty>
					</Card>
				)}
			</Content>

			{/* Drawer for showing row details and column visibility */}
			<Drawer
				title={
					selectedRowData ? 'Prediction Details' : 'Column Visibility'
				}
				placement="right"
				onClose={() => {
					setInfoDrawerVisible(false)
					setSelectedRowData(null)
				}}
				open={infoDrawerVisible}
				width={400}
			>
				{selectedRowData ? (
					<div>
						<Alert
							message={
								incorrectPredictions.includes(
									selectedRowData.index
								)
									? 'Marked as Incorrect Prediction'
									: 'Marked as Correct Prediction'
							}
							type={
								incorrectPredictions.includes(
									selectedRowData.index
								)
									? 'error'
									: 'success'
							}
							showIcon
							className="mb-4"
						/>

						<div className="mb-4">
							<Statistic
								title="Confidence Score"
								value={(
									predictResult[selectedRowData.index]
										?.confidence * 100
								).toFixed(1)}
								suffix="%"
								prefix={<ThunderboltOutlined />}
							/>
							<Progress
								percent={
									predictResult[selectedRowData.index]
										?.confidence * 100
								}
								status={
									predictResult[selectedRowData.index]
										?.confidence >= 0.5
										? 'normal'
										: 'exception'
								}
								strokeColor={
									getConfidenceStatus(
										predictResult[selectedRowData.index]
											?.confidence
									).color
								}
							/>
						</div>

						<Divider orientation="left">Data Fields</Divider>
						{Object.entries(selectedRowData.record).map(
							([key, value]) => (
								<div key={key} className="mb-2">
									<Text strong>{key}: </Text>
									<Text>
										{key === projectInfo.target_column ? (
											<Tag color="blue">{value}</Tag>
										) : (
											value
										)}
									</Text>
								</div>
							)
						)}

						<Divider orientation="left">Prediction</Divider>
						<div className="mb-2">
							<Text strong>
								Predicted {projectInfo.target_column}:{' '}
							</Text>
							<Tag color="purple">
								{predictResult[selectedRowData.index]?.class ||
									'N/A'}
							</Tag>
						</div>

						<div className="mt-4">
							<Space>
								<Button
									type={
										incorrectPredictions.includes(
											selectedRowData.index
										)
											? 'default'
											: 'primary'
									}
									danger={
										!incorrectPredictions.includes(
											selectedRowData.index
										)
									}
									icon={
										incorrectPredictions.includes(
											selectedRowData.index
										) ? (
											<CheckCircleOutlined />
										) : (
											<CloseCircleOutlined />
										)
									}
									onClick={() =>
										handlePredictionToggle(
											selectedRowData.index
										)
									}
								>
									Mark as{' '}
									{incorrectPredictions.includes(
										selectedRowData.index
									)
										? 'Correct'
										: 'Incorrect'}
								</Button>
							</Space>
						</div>
					</div>
				) : (
					<div>
						<Paragraph>
							Select which columns to display in the table. Hiding
							unnecessary columns can make reviewing predictions
							easier.
						</Paragraph>

						<Divider orientation="left">Available Columns</Divider>

						{csvData.length > 0 &&
							Object.keys(csvData[0]).map((column) => (
								<div key={column} className="mb-2">
									<Switch
										checked={visibleColumns.includes(
											column
										)}
										onChange={() =>
											handleColumnVisibilityToggle(column)
										}
										size="small"
										className="mr-2"
									/>
									<Text
										strong={
											column === projectInfo.target_column
										}
										type={
											column === projectInfo.target_column
												? 'success'
												: undefined
										}
									>
										{column}
									</Text>
									{column === projectInfo.target_column && (
										<Tag color="blue" className="ml-2">
											Target
										</Tag>
									)}
								</div>
							))}

						<Divider />
						<Space direction="vertical" style={{ width: '100%' }}>
							<Button
								type="primary"
								block
								onClick={() => setInfoDrawerVisible(false)}
							>
								Apply Changes
							</Button>
						</Space>
					</div>
				)}
			</Drawer>
		</Layout>
	)
}

export default TabularPredict
