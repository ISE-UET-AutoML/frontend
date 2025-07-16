import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
	Card,
	Layout,
	Typography,
	Table,
	Button,
	Space,
	Alert,
	Statistic,
	Progress,
	Tooltip,
	Empty,
	Tag,
} from 'antd'
import {
	LeftOutlined,
	RightOutlined,
	QuestionCircleOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	FileTextOutlined,
	BulbOutlined,
	EyeInvisibleOutlined,
	EyeOutlined,
} from '@ant-design/icons'
import Papa from 'papaparse'
import * as experimentAPI from 'src/api/experiment'

const { Title, Text, Paragraph } = Typography
const { Content } = Layout

const TextPredict = ({ predictResult, uploadedFiles, projectInfo }) => {
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experimentName')
	const [csvData, setCsvData] = useState([])
	const [currentIndex, setCurrentIndex] = useState(0)
	const [incorrectPredictions, setIncorrectPredictions] = useState([])
	const [statistics, setStatistics] = useState({
		correct: 0,
		incorrect: 0,
		accuracy: 0,
	})
	const [isExplaining, setIsExplaining] = useState(false)
	// const [currentExplanation, setCurrentExplanation] = useState(null)
	const [explanations, setExplanations] = useState({})
	const [isTableVisible, setIsTableVisible] = useState(false)
	const textPreviewRef = useRef(null)
	const [currentPage, setCurrentPage] = useState(1)
	const pageSize = 10
	// Parse CSV and initialize data
	useEffect(() => {
		if (uploadedFiles?.[0]?.name.endsWith('.csv')) {
			const reader = new FileReader()
			reader.onload = () => {
				Papa.parse(reader.result, {
					header: true,
					skipEmptyLines: true,
					complete: ({ data }) => {
						setCsvData(data)
						// Initialize incorrect predictions based on confidence
						const initialIncorrect = predictResult
							.map((result, idx) =>
								result.confidence < 0.5 ? idx : null
							)
							.filter((idx) => idx !== null)
						setIncorrectPredictions(initialIncorrect)
					},
				})
			}
			reader.readAsText(uploadedFiles[0])
		}
	}, [uploadedFiles, predictResult])

	// Update statistics when predictions change
	useEffect(() => {
		const incorrect = incorrectPredictions.length
		const total = csvData.length
		setStatistics({
			correct: total - incorrect,
			incorrect,
			accuracy: total
				? (((total - incorrect) / total) * 100).toFixed(1)
				: 0,
		})
	}, [incorrectPredictions, csvData])
	const handlePredictionToggle = (index) => {
		setIncorrectPredictions((prev) =>
			prev.includes(index)
				? prev.filter((i) => i !== index)
				: [...prev, index]
		)
	}

	const currentPrediction = predictResult[currentIndex] || {}
	const currentData = csvData[currentIndex] || {}

	const handleExplain = async () => {
		setIsExplaining(true)

		try {
			const formData = new FormData()
			formData.append('text', currentData.sentence || '')
			formData.append('task', projectInfo.type)

			const { data } = await experimentAPI.explainData(
				experimentName,
				formData
			)

			const explanation = data.explanation[currentPrediction.class]
			const highlightWords = explanation?.words || []

			// Update CSV data with highlighted words
			const updatedCsvData = [...csvData]
			updatedCsvData[currentIndex] = {
				...currentData,
				highlight: highlightWords,
			}
			setCsvData(updatedCsvData)
			// Lưu explanation vào state
			setExplanations((prev) => ({
				...prev,
				[currentIndex]: explanation,
			}))

			// setCurrentExplanation(explanation)
		} catch (error) {
			console.error('Explanation error:', error.message)
		} finally {
			setIsExplaining(false)
		}
	}

	const currentExplanation = explanations[currentIndex]

	const renderTextWithHighlights = (text, highlights = []) => {
		if (!text) return <Empty description="No text available" />

		const words = text.split(' ')
		return (
			<div className="text-lg">
				{words.map((word, index) => {
					const isHighlighted = highlights.includes(
						word.toLowerCase().replace(/[^a-z0-9]/gi, '')
					)
					return (
						<span
							key={index}
							className={`${isHighlighted ? 'bg-yellow-200 px-1 rounded' : ''} mr-1`}
						>
							{word}
						</span>
					)
				})}
			</div>
		)
	}

	const handleViewClick = (index) => {
		setCurrentIndex(index + (currentPage - 1) * pageSize)
		// Trượt mượt mà đến phần Text Preview
		textPreviewRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
			inline: 'nearest',
		})
	}

	// Generate table columns
	const columns = [
		{
			title: 'Index',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			render: (_, __, index) => index + 1,
		},
		{
			title: 'Text',
			dataIndex: 'sentence',
			key: 'sentence',
			// width: 180,
			render: (text) => (
				<Tooltip title={text}>
					<div className="max-w-xl truncate">{text}</div>
				</Tooltip>
			),
		},
		{
			title: `Predicted ${projectInfo.target_column}`,
			dataIndex: 'index',
			key: 'predictedClass',
			render: (_, __, index) =>
				predictResult[index + (currentPage - 1) * pageSize]?.class,
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
			title: 'Status',
			dataIndex: 'index',
			key: 'status',
			width: 120,
			render: (_, __, index) => {
				const globalIndex = index + (currentPage - 1) * pageSize
				const isIncorrect = incorrectPredictions.includes(globalIndex)
				return (
					<Tag
						color={isIncorrect ? 'error' : 'success'}
						icon={
							isIncorrect ? (
								<CloseCircleOutlined />
							) : (
								<CheckCircleOutlined />
							)
						}
					>
						{isIncorrect ? 'Incorrect' : 'Correct'}
					</Tag>
				)
			},
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 180,
			render: (_, __, index) => (
				<Space>
					<Button
						size="small"
						type="primary"
						ghost
						onClick={() => handleViewClick(index)}
					>
						View
					</Button>
					<Button
						size="small"
						danger={!incorrectPredictions.includes(index)}
						type={
							incorrectPredictions.includes(index)
								? 'primary'
								: 'default'
						}
						ghost
						onClick={() => handlePredictionToggle(index)}
					>
						{incorrectPredictions.includes(index)
							? 'Mark Correct'
							: 'Mark Incorrect'}
					</Button>
				</Space>
			),
		},
	]

	return (
		<Layout className="bg-white">
			<Content className="p-4">
				{/* Header with Statistics */}
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
				<Space direction="vertical" size="large" className="w-full">
					{/* Navigation Controls */}
					<Space className="w-full justify-between">
						<Button
							type="primary"
							icon={<LeftOutlined />}
							disabled={currentIndex === 0}
							onClick={() => setCurrentIndex((prev) => prev - 1)}
						>
							Previous
						</Button>
						<Text
							strong
						>{`Row ${currentIndex + 1} of ${csvData.length}`}</Text>
						<Button
							type="primary"
							icon={<RightOutlined />}
							disabled={currentIndex === csvData.length - 1}
							onClick={() => setCurrentIndex((prev) => prev + 1)}
						>
							Next
						</Button>
					</Space>
				</Space>

				{/* Main Content */}
				<div className="mt-6">
					<div className="grid grid-cols-2 gap-6">
						<Card ref={textPreviewRef}>
							<div className="h-[400px] overflow-y-auto pr-2 break-words">
								{renderTextWithHighlights(
									currentData.sentence,
									currentData.highlight
								)}
							</div>
						</Card>
						{/* Prediction Details */}
						<Card>
							<Space direction="vertical" className="w-full">
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<Title level={4} style={{ margin: 0 }}>
										Prediction Results
									</Title>
									<Button
										type="primary"
										onClick={() =>
											setIsTableVisible(!isTableVisible)
										}
										icon={
											isTableVisible ? (
												<EyeInvisibleOutlined />
											) : (
												<EyeOutlined />
											)
										}
									>
										{isTableVisible
											? 'Hide All Predictions'
											: 'Show All Predictions'}
									</Button>
								</div>
								<Alert
									message={
										<Space>
											<Text>
												{`Predicted ${projectInfo.target_column}:`}
											</Text>
											<Text strong>
												{currentPrediction.class}
											</Text>
										</Space>
									}
									type={
										incorrectPredictions.includes(
											currentIndex
										)
											? 'error'
											: 'success'
									}
									showIcon
								/>
								<div>
									<Space className="w-full justify-between mb-2">
										<Text strong>Confidence Score</Text>
									</Space>
									<Progress
										percent={Math.round(
											currentPrediction.confidence * 100
										)}
										strokeColor={
											currentPrediction.confidence > 0.7
												? '#52c41a' // green
												: currentPrediction.confidence >
													0.4
													? '#fa8c16' // orange
													: '#ff4d4f' // red
										}
										format={(percent) => `${percent}%`}
									/>
								</div>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<Button
										type={
											incorrectPredictions.includes(
												currentIndex
											)
												? 'primary'
												: 'default'
										}
										danger={
											!incorrectPredictions.includes(
												currentIndex
											)
										}
										onClick={() =>
											handlePredictionToggle(currentIndex)
										}
										icon={
											incorrectPredictions.includes(
												currentIndex
											) ? (
												<CheckCircleOutlined />
											) : (
												<CloseCircleOutlined />
											)
										}
									>
										{incorrectPredictions.includes(
											currentIndex
										)
											? 'Mark as Correct'
											: 'Mark as Incorrect'}
									</Button>
									{!currentExplanation && (
										<Tooltip title="Explain this prediction">
											<Button
												type="primary"
												icon={<BulbOutlined />}
												onClick={handleExplain}
												loading={isExplaining}
											>
												Explain
											</Button>
										</Tooltip>
									)}
								</div>
								{currentExplanation ? (
									<Space
										direction="vertical"
										size="large"
										className="w-full mt-10"
									>
										<Alert
											message="Key Words"
											description="Highlighted words had the most influence on this prediction."
											type="info"
											showIcon
										/>
										<div>
											<Title level={5}>
												Important Words
											</Title>
											<div className="flex flex-wrap gap-1">
												{currentExplanation.words?.map(
													(word, index) => (
														<Tag
															key={index}
															color="blue"
														>
															{word}
														</Tag>
													)
												)}
											</div>
										</div>
										{/* Highlighted Paragraph */}
										{currentExplanation.explanation && (
											<div>
												<Title level={5}>
													Explanation
												</Title>
												<Paragraph>
													{
														currentExplanation.explanation
													}
												</Paragraph>
											</div>
										)}
									</Space>
								) : (
									<Empty description="No explanation available" />
								)}
							</Space>
						</Card>
					</div>
				</div>

				{/* Table of all predictions */}
				{isTableVisible && (
					<Card
						title={
							<span>
								<FileTextOutlined /> All Predictions
							</span>
						}
						className="mt-4"
					>
						<Table
							dataSource={csvData}
							columns={columns}
							rowKey={(_, index) => index}
							pagination={{
								pageSize: 10,
								current: currentPage,
								onChange: (page) => setCurrentPage(page), // Cập nhật trang hiện tại
							}}
							rowClassName={(_, index) =>
								index + (currentPage - 1) * pageSize ===
									currentIndex
									? 'bg-blue-50'
									: ''
							}
							size="middle"
						/>
					</Card>
				)}
			</Content>
		</Layout>
	)
}

export default TextPredict