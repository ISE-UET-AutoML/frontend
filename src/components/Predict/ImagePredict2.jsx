import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
	Row,
	Col,
	Typography,
	Image,
	Progress,
	Button,
	Card,
	Tooltip,
	Space,
	Modal,
	Badge,
	Alert,
	Divider,
	Empty,
	Spin,
	Tag,
	Statistic,
	Layout,
	Table,
} from 'antd'
import {
	InfoCircleOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	BarChartOutlined,
	CloudDownloadOutlined,
	QuestionCircleOutlined,
	PieChartOutlined,
	RightCircleOutlined,
	LeftOutlined,
	RightOutlined,
} from '@ant-design/icons'
import PieGraph from 'src/components/PieGraph'
import SolutionImage from 'src/assets/images/Solution.png'
import * as experimentAPI from 'src/api/experiment'

const { Title, Text, Paragraph } = Typography

const ImagePredict2 = ({ predictResult, uploadedFiles, projectInfo }) => {
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experimentName')
	const [falsePredict, setFalsePredict] = useState([])
	const [explainImageUrl, setExplainImageUrl] = useState(
		Array(uploadedFiles.length).fill(SolutionImage)
	)
	const [pieData, setPieData] = useState([])
	const [accuracyModalVisible, setAccuracyModalVisible] = useState(false)
	const [explanationModalVisible, setExplanationModalVisible] =
		useState(false)
	const [loadingExplanation, setLoadingExplanation] = useState(false)

	const [currentIndex, setCurrentIndex] = useState(0)
	const [statistics, setStatistics] = useState({
		correct: 0,
		incorrect: 0,
		accuracy: 0,
	})

	// Initialize explanation images
	useEffect(() => {
		if (uploadedFiles.length > 0 && explainImageUrl.length === 0) {
			setExplainImageUrl(Array(uploadedFiles.length).fill(SolutionImage))
		}
	}, [uploadedFiles])

	// If confidence score < 50% => false
	useEffect(() => {
		if (predictResult) {
			predictResult.forEach((row, index) => {
				if (row.confidence < 0.5 && !falsePredict.includes(index)) {
					setFalsePredict((prev) => [...prev, index])
				}
			})
		}
	}, [predictResult])

	// Handling Pie Data
	useEffect(() => {
		const falseValue =
			uploadedFiles.length > 0
				? ((falsePredict.length / uploadedFiles.length) * 100).toFixed(
						2
					)
				: 0
		const trueValue = (100 - parseFloat(falseValue)).toFixed(2)

		setPieData([
			{ name: 'Correct', value: parseFloat(trueValue) },
			{ name: 'Incorrect', value: parseFloat(falseValue) },
		])
	}, [falsePredict, uploadedFiles])

	const handleExplainSelectedImage = async (index) => {
		const formData = new FormData()
		setLoadingExplanation(true)

		formData.append('files', uploadedFiles[index])
		formData.append('task', projectInfo.type)

		try {
			const { data } = await experimentAPI.explainData(
				experimentName,
				formData
			)
			const base64ImageString = data.explanation
			const fetchedImageUrl = `data:image/jpeg;base64,${base64ImageString}`

			setExplainImageUrl((prev) => {
				const updatedArray = [...prev]
				updatedArray[index] = fetchedImageUrl
				return updatedArray
			})

			console.log('Fetch successful')
			setLoadingExplanation(false)
		} catch (error) {
			console.error('Fetch error:', error.message)
			setLoadingExplanation(false)
		}
	}

	const getConfidenceColor = (confidence) => {
		if (confidence >= 0.7) return '#52c41a' // high confidence - green
		if (confidence >= 0.5) return '#faad14' // medium confidence - yellow
		return '#f5222d' // low confidence - red
	}

	const renderImageGallery = () => {
		return (
			<div className="image-gallery-container h-full pr-2 overflow-y-auto">
				<Space
					direction="vertical"
					size="small"
					style={{ width: '100%' }}
				>
					{uploadedFiles.map((data, index) => (
						<Badge.Ribbon
							key={index}
							text={
								falsePredict.includes(index)
									? 'Incorrect'
									: 'Correct'
							}
							color={
								falsePredict.includes(index) ? 'red' : 'green'
							}
						>
							<Card
								hoverable
								styles={{ padding: 0 }}
								style={{
									width: '100%',
									borderColor:
										selectedData.index === index
											? '#1890ff'
											: 'transparent',
									borderWidth:
										selectedData.index === index
											? '2px'
											: '1px',
									opacity:
										selectedData.index === index ? 1 : 0.8,
								}}
								cover={
									<Image
										src={URL.createObjectURL(data)}
										preview={false}
										style={{
											height: 130,
											objectFit: 'cover',
										}}
										onClick={() =>
											setSelectedData({
												index: index,
												...data,
											})
										}
									/>
								}
							/>
						</Badge.Ribbon>
					))}
				</Space>
			</div>
		)
	}

	const renderMainContent = () => {
		if (!uploadedFiles || !predictResult) {
			return <Empty description="No prediction data available" />
		}

		const currentPrediction = predictResult[selectedData.index]
		const confidence = currentPrediction.confidence
		const confidencePercentage = Math.round(confidence * 100)
		const confidenceColor = getConfidenceColor(confidence)

		return (
			<Row gutter={[24, 24]}>
				{/* Main image and prediction section */}
				<Col span={16}>
					<Card
						className="main-image-card"
						bordered={false}
						style={{
							height: '100%',
							boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
						}}
					>
						<div
							className="image-container"
							style={{ height: '70%', textAlign: 'center' }}
						>
							<Image
								src={URL.createObjectURL(
									uploadedFiles[selectedData.index]
								)}
								style={{
									maxHeight: '100%',
									maxWidth: '100%',
									objectFit: 'contain',
									borderRadius: '8px',
								}}
								preview={{
									mask: (
										<div>
											<RightCircleOutlined /> View
											Fullscreen
										</div>
									),
								}}
							/>
						</div>

						<Divider />

						<div className="prediction-details">
							<Row justify="center" align="middle">
								<Col span={24} style={{ textAlign: 'center' }}>
									<Title
										level={2}
										style={{
											margin: '16px 0',
											textTransform: 'uppercase',
										}}
									>
										{currentPrediction.class}
									</Title>
								</Col>
							</Row>

							<Row align="middle" gutter={[8, 0]}>
								<Col span={6}>
									<Text strong>Confidence:</Text>
								</Col>
								<Col span={16}>
									<Progress
										percent={confidencePercentage}
										status={
											confidence < 0.5
												? 'exception'
												: 'active'
										}
										strokeColor={confidenceColor}
									/>
								</Col>
								<Col span={2}>
									<Text strong>{confidencePercentage}%</Text>
								</Col>
							</Row>
						</div>
					</Card>
				</Col>

				{/* Right panel with explanation and controls */}
				<Col span={8}>
					<Space
						direction="vertical"
						size="large"
						style={{ width: '100%' }}
					>
						{/* Accuracy button */}
						<Button
							type="primary"
							icon={<PieChartOutlined />}
							size="large"
							block
							onClick={() => setAccuracyModalVisible(true)}
						>
							View Model Accuracy
						</Button>

						{/* Explanation section */}
						<Card
							title="AI Explanation"
							bordered={false}
							className="explanation-card"
							style={{
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
							}}
							extra={
								<Tooltip title="The explanation shows which parts of the image influenced the AI's decision">
									<QuestionCircleOutlined />
								</Tooltip>
							}
						>
							<Alert
								message="How the AI Made This Decision"
								description={
									<Paragraph>
										This explanation highlights the areas of
										the image that influenced the AI's
										prediction the most. The highlighted
										regions show what features the model
										focused on when making its decision.
									</Paragraph>
								}
								type="info"
								showIcon
								style={{ marginBottom: '16px' }}
							/>

							<div style={{ textAlign: 'center' }}>
								<Button
									type="primary"
									icon={<CloudDownloadOutlined />}
									onClick={() =>
										handleExplainSelectedImage(
											selectedData.index
										)
									}
									loading={loadingExplanation}
									style={{ marginBottom: '16px' }}
								>
									Generate Explanation
								</Button>

								<div style={{ marginTop: '8px' }}>
									<Text type="secondary">
										Using{' '}
										<a
											href="https://lime-ml.readthedocs.io/en/latest/lime.html"
											target="_blank"
											rel="noopener noreferrer"
										>
											LIME
										</a>{' '}
										explanation method
									</Text>
								</div>

								<div
									className="explanation-image"
									style={{ marginTop: '16px' }}
								>
									{loadingExplanation ? (
										<div
											style={{
												padding: '40px 0',
												textAlign: 'center',
											}}
										>
											<Spin tip="Generating explanation..." />
										</div>
									) : (
										<Image
											src={
												explainImageUrl[
													selectedData.index
												]
											}
											alt="AI Explanation"
											style={{
												maxWidth: '100%',
												borderRadius: '8px',
											}}
											preview={{
												mask: (
													<div>
														<RightCircleOutlined />{' '}
														View Explanation
													</div>
												),
												onVisibleChange: (visible) => {
													if (visible) {
														setExplanationModalVisible(
															true
														)
													}
												},
											}}
										/>
									)}
								</div>
							</div>
						</Card>

						{/* Feedback section */}
						<Card
							title="Provide Feedback"
							bordered={false}
							style={{
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
							}}
						>
							<div style={{ textAlign: 'center' }}>
								<Title level={5}>
									Is this prediction accurate?
								</Title>
								<Space>
									<Button
										type={
											!falsePredict.includes(
												selectedData.index
											)
												? 'primary'
												: 'default'
										}
										icon={<CheckCircleOutlined />}
										onClick={() => {
											if (
												falsePredict.includes(
													selectedData.index
												)
											) {
												setFalsePredict((prev) =>
													prev.filter(
														(item) =>
															item !==
															selectedData.index
													)
												)
											}
										}}
									>
										Correct
									</Button>
									<Button
										danger
										type={
											falsePredict.includes(
												selectedData.index
											)
												? 'primary'
												: 'default'
										}
										icon={<CloseCircleOutlined />}
										onClick={() => {
											if (
												!falsePredict.includes(
													selectedData.index
												)
											) {
												setFalsePredict((prev) => [
													...prev,
													selectedData.index,
												])
											}
										}}
									>
										Incorrect
									</Button>
								</Space>
							</div>
						</Card>
					</Space>
				</Col>
			</Row>
		)
	}

	const renderAccuracyModal = () => {
		const correctPercentage = pieData[0]?.value || 0
		const incorrectPercentage = pieData[1]?.value || 0

		return (
			<Modal
				title={
					<>
						<BarChartOutlined /> Model Accuracy Statistics
					</>
				}
				open={accuracyModalVisible}
				onCancel={() => setAccuracyModalVisible(false)}
				footer={[
					<Button
						key="close"
						onClick={() => setAccuracyModalVisible(false)}
					>
						Close
					</Button>,
				]}
				width={800}
			>
				<Row gutter={[24, 24]}>
					<Col span={12}>
						<Card bordered={false}>
							<PieGraph data={pieData} />
						</Card>
					</Col>
					<Col span={12}>
						<Card bordered={false}>
							<Space
								direction="vertical"
								size="middle"
								style={{ width: '100%' }}
							>
								<div>
									<Title level={4}>Summary</Title>
									<Text>
										Based on your feedback, the model
										accuracy is:
									</Text>
								</div>

								<Card size="small">
									<Statistic
										title="Correct Predictions"
										value={correctPercentage}
										suffix="%"
										valueStyle={{ color: '#3f8600' }}
										prefix={<CheckCircleOutlined />}
									/>
								</Card>

								<Card size="small">
									<Statistic
										title="Incorrect Predictions"
										value={incorrectPercentage}
										suffix="%"
										valueStyle={{ color: '#cf1322' }}
										prefix={<CloseCircleOutlined />}
									/>
								</Card>

								<Alert
									message="What does this mean?"
									description={
										<Paragraph>
											This chart shows how often the AI
											model correctly predicted the images
											based on your feedback. A higher
											percentage of correct predictions
											indicates better model performance.
										</Paragraph>
									}
									type="info"
									showIcon
								/>
							</Space>
						</Card>
					</Col>
				</Row>
			</Modal>
		)
	}

	const renderExplanationHelpModal = () => {
		return (
			<Modal
				title="Understanding AI Explanations"
				open={explanationModalVisible}
				onCancel={() => setExplanationModalVisible(false)}
				footer={[
					<Button
						key="close"
						onClick={() => setExplanationModalVisible(false)}
					>
						Close
					</Button>,
				]}
			>
				<Space
					direction="vertical"
					size="middle"
					style={{ width: '100%' }}
				>
					<Image
						src={explainImageUrl[selectedData.index]}
						alt="AI Explanation"
						style={{ width: '100%' }}
					/>

					<Divider>How to Interpret</Divider>

					<Paragraph>
						The highlighted areas show the regions of the image that
						most influenced the AI's decision:
					</Paragraph>

					<ul>
						<li>
							<Text strong>Green/bright areas:</Text> These
							regions strongly support the predicted class
						</li>
						<li>
							<Text strong>Red/dark areas:</Text> These regions
							contradict the predicted class
						</li>
					</ul>

					<Alert
						message="This is based on LIME (Local Interpretable Model-agnostic Explanations)"
						description="LIME works by modifying small parts of the image and observing how the prediction changes, helping identify which features the model relies on."
						type="info"
						showIcon
					/>
				</Space>
			</Modal>
		)
	}

	return (
		<Layout className=" bg-white">
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
							value={uploadedFiles.length}
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

				{/* Main Content */}
				<Card className="mb-6">
					<Space direction="vertical" size="large" className="w-full">
						{/* Navigation Controls */}
						<Space className="w-full justify-between">
							<Button
								type="primary"
								icon={<LeftOutlined />}
								disabled={currentIndex === 0}
								onClick={() =>
									setCurrentIndex((prev) => prev - 1)
								}
							>
								Previous
							</Button>
							<Text
								strong
							>{`Image ${currentIndex + 1} of ${uploadedFiles.length}`}</Text>
							<Button
								type="primary"
								icon={<RightOutlined />}
								disabled={
									currentIndex === uploadedFiles.length - 1
								}
								onClick={() =>
									setCurrentIndex((prev) => prev + 1)
								}
							>
								Next
							</Button>
						</Space>

						{/* Main Content Area */}
						<div className="grid grid-cols-2 gap-6">
							{/* Image Display */}
							<Card>
								<Image
									src={URL.createObjectURL(
										uploadedFiles[currentIndex]
									)}
									alt="Prediction Image"
									className="w-full object-contain"
								/>
							</Card>

							{/* Prediction Details */}
							<Card>
								<Space direction="vertical" className="w-full">
									<Title level={4}>
										Prediction Results
										<Tooltip title="This shows the model's prediction and confidence level">
											<QuestionCircleOutlined className="ml-2" />
										</Tooltip>
									</Title>

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
											<Text>
												{formatConfidence(
													currentPrediction.confidence
												)}
											</Text>
										</Space>
										<Progress
											percent={Math.round(
												currentPrediction.confidence *
													100
											)}
											status={
												currentPrediction.confidence >=
												0.5
													? 'success'
													: 'exception'
											}
											format={(percent) => `${percent}%`}
										/>
									</div>

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

									<Table
										columns={getTableColumns()}
										dataSource={getTableData()}
										size="small"
										pagination={false}
										scroll={{ y: 300 }}
									/>
								</Space>
							</Card>
						</div>

						{/* Thumbnail Gallery */}
						{renderThumbnails()}
					</Space>
				</Card>
			</Content>
		</Layout>
	)
}

export default ImagePredict2
