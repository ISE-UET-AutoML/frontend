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
	const [confidenceFilter, setConfidenceFilter] = useState('all')

	const pageSize = 9

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
							// `Predicted ${projectInfo.target_column}`,
							'Predicted Class',
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
				// title: `Predicted ${targetColumn}`,
				title: `Predicted Class`,
				key: 'predictedClass',
				width: 160,
				render: (_, __, index) => {
					const predicted = predictResult[index + (currentPage - 1) * pageSize]?.class || 'N/A'
					const actual = csvData[index][targetColumn]
					const isCorrect = !incorrectPredictions.includes(index)

					return (
						<Tag color={isCorrect ? 'green' : 'red'}>
							{predicted}

						</Tag>
					)
				},
			},
			{
				title: 'Confidence',
				dataIndex: 'index',
				key: 'confidence',
				width: 160,

				render: (_, record, index) => {
					// Tính index toàn cục
					const globalIndex = index + (currentPage - 1) * pageSize
					const confidence = predictResult[globalIndex]?.confidence || 0
					const color =
						confidence >= 0.7
							? 'green'
							: confidence >= 0.5
								? 'orange'
								: 'red'
					return (
						<Progress
							percent={Math.round(confidence * 100)}
							size="small"
							status={confidence >= 0.4 ? 'normal' : 'exception'}
							strokeColor={color}
						/>
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
			<Content className="">
				{/* Statistics Cards */}
				<Card
					size="small"
					className="mb-4 border-green-500 bg-green-50 border-dashed"
				>
					<Space
						size="large"
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Statistic
							title="Total Predictions"
							value={csvData.length}
							prefix={<QuestionCircleOutlined />}
						/>
						<Statistic
							title="Correct Predictions"
							value={statistics.correct}
							prefix={
								<CheckCircleOutlined
									style={{ color: '#52c41a' }}
								/>
							}
						/>
						<Statistic
							title="Incorrect Predictions"
							value={statistics.incorrect}
							prefix={
								<CloseCircleOutlined
									style={{ color: '#f5222d' }}
								/>
							}
						/>
						<Statistic
							title="Accuracy"
							value={statistics.accuracy}
							suffix="%"
							precision={1}
						/>
					</Space>
				</Card>

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
					<Card className="shadow-sm [&_.ant-card-body]:p-0">
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
							size={'small'}
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
						<div className="mb-2">
							<Statistic
								title="Confidence Score"
								value={(
									predictResult[selectedRowData.index]
										?.confidence * 100
								).toFixed(1)}
								suffix="%"
							// prefix={<ThunderboltOutlined />}
							/>

						</div>

						<Divider orientation="left" orientationMargin="0">Data Fields</Divider>
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

						<Divider orientation="left" orientationMargin="0">Prediction</Divider>
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
