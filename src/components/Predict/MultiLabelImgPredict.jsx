import React, { useState, useEffect } from 'react'
import {
	Typography,
	Image,
	Button,
	Card,
	Space,
	Modal,
	Badge,
	Alert,
	Divider,
	Spin,
	Statistic,
	Layout,
	Tag,
	Row,
	Col,
	Progress,
} from 'antd'
import {
	LeftOutlined,
	RightOutlined,
	QuestionCircleOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	UndoOutlined,
	BulbOutlined,
	TagsOutlined,
} from '@ant-design/icons'
import SolutionImage from 'src/assets/images/Solution.png'
import * as experimentAPI from 'src/api/experiment'

const { Title, Text, Paragraph } = Typography
const { Content } = Layout

const MultiLabelImgPredict = ({
	predictResult,
	uploadedFiles,
	projectInfo,
}) => {
	const [explainImageUrl, setExplainImageUrl] = useState(
		Array(uploadedFiles.length).fill(SolutionImage)
	)
	const [explanationModalVisible, setExplanationModalVisible] =
		useState(false)
	const [loadingExplanation, setLoadingExplanation] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [incorrectPredictions, setIncorrectPredictions] = useState([])
	const [showExplanation, setShowExplanation] = useState(
		Array(uploadedFiles.length).fill(false)
	)

	const currentPrediction = predictResult[currentIndex] || {}

	// Toggle explanation view
	const toggleExplanationView = (index) => {
		setShowExplanation((prev) => {
			const updatedArray = [...prev]
			updatedArray[index] = !updatedArray[index]
			return updatedArray
		})
	}

	// Handle toggling prediction correctness
	const handlePredictionToggle = (index) => {
		setIncorrectPredictions((prev) => {
			if (prev.includes(index)) {
				return prev.filter((i) => i !== index)
			} else {
				return [...prev, index]
			}
		})
	}

	// Thumbnail gallery
	const renderThumbnails = () => (
		<Space className="w-full overflow-x-auto" size="small">
			{uploadedFiles.map((data, index) => (
				<Badge
					key={index}
					count={
						incorrectPredictions.includes(index) ? (
							<CloseCircleOutlined style={{ color: '#f5222d' }} />
						) : null
					}
				>
					<Image
						src={URL.createObjectURL(data)}
						alt={`Thumbnail ${index + 1}`}
						width={50}
						height={50}
						className={`object-cover cursor-pointer rounded-lg ${currentIndex === index ? 'border-4 border-blue-500' : 'opacity-60'}`}
						preview={false}
						onClick={() => setCurrentIndex(index)}
					/>
				</Badge>
			))}
		</Space>
	)

	// Render prediction tag grid
	const renderPredictionTags = () => {
		if (!currentPrediction || currentPrediction.class.length === 0) {
			return (
				<Alert message="No prediction data available" type="warning" />
			)
		}

		return (
			<div className="mb-4">
				<Row gutter={[8, 8]}>
					{currentPrediction.class.map((label, idx) => {
						// Giả sử mỗi label có confidence
						const confidence =
							label.confidence ||
							currentPrediction.confidence ||
							0.75
						const confidencePercent = Math.round(confidence * 100)

						// Quyết định màu dựa vào độ tin cậy
						let color = 'green'
						if (confidencePercent < 50) {
							color = 'red'
						} else if (confidencePercent < 75) {
							color = 'orange'
						}

						return (
							<Col key={idx} span={12}>
								<Card size="small" className="h-full">
									<Space
										direction="vertical"
										className="w-full"
									>
										<Tag
											color={color}
											className="mb-1 text-base"
										>
											{label.name || label}
										</Tag>
										<Progress
											percent={confidencePercent}
											size="small"
											status={
												confidencePercent < 50
													? 'exception'
													: 'active'
											}
											strokeColor={color}
										/>
									</Space>
								</Card>
							</Col>
						)
					})}
				</Row>
			</div>
		)
	}

	// Initialize explanation images
	useEffect(() => {
		if (uploadedFiles.length > 0 && explainImageUrl.length === 0) {
			setExplainImageUrl(Array(uploadedFiles.length).fill(SolutionImage))
		}

		// Initialize incorrect predictions based on confidence
		const initialIncorrect = predictResult
			.map((result, idx) => (result.confidence < 0.5 ? idx : null))
			.filter((idx) => idx !== null)
		setIncorrectPredictions(initialIncorrect)
	}, [uploadedFiles, predictResult])

	const handleExplainSelectedImage = async (index) => {
		console.log('Explain image')
		setLoadingExplanation(true)

		// Giả lập tạo giải thích
		setTimeout(() => {
			// Giả lập có dữ liệu giải thích trả về
			// Trong thực tế, bạn sẽ cần uncomment và sử dụng phần API bình luận bên dưới
			setExplainImageUrl((prev) => {
				const updatedArray = [...prev]
				// Giả sử có một URL hình ảnh giải thích
				updatedArray[index] = URL.createObjectURL(uploadedFiles[index])
				return updatedArray
			})

			// Set this image to show explanation
			setShowExplanation((prev) => {
				const updatedArray = [...prev]
				updatedArray[index] = true
				return updatedArray
			})

			setLoadingExplanation(false)
		}, 1500)

		// Uncomment đoạn code dưới đây khi bạn có API thực tế
		/*
		const formData = new FormData()
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

			// Set this image to show explanation
			setShowExplanation((prev) => {
				const updatedArray = [...prev]
				updatedArray[index] = true
				return updatedArray
			})

			console.log('Fetch successful')
			setLoadingExplanation(false)
		} catch (error) {
			console.error('Fetch error:', error.message)
			setLoadingExplanation(false)
		}
		*/
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
						src={explainImageUrl[currentIndex]}
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
							<Text strong>Yellow/bright areas:</Text> These
							regions strongly support the predicted class
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
		<Layout className="bg-white">
			<Content className="p-2">
				{/* Main Content */}
				<Card>
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
							<Card
								title={
									<Space>
										<Text strong>
											{showExplanation[currentIndex]
												? 'Explanation View'
												: 'Original Image'}
										</Text>
										{explainImageUrl[currentIndex] !==
											SolutionImage && (
											<Button
												type="text"
												icon={<UndoOutlined />}
												onClick={() =>
													toggleExplanationView(
														currentIndex
													)
												}
												style={{
													backgroundColor: '#E6F7FF',
													color: '#0050B3',
												}}
											>
												{showExplanation[currentIndex]
													? 'Show Original'
													: 'Show Explanation'}
											</Button>
										)}
									</Space>
								}
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
											showExplanation[currentIndex] &&
											explainImageUrl[currentIndex] !==
												SolutionImage
												? explainImageUrl[currentIndex]
												: URL.createObjectURL(
														uploadedFiles[
															currentIndex
														]
													)
										}
										alt={
											showExplanation[currentIndex]
												? 'Explanation Image'
												: 'Original Image'
										}
										className="w-full object-contain"
									/>
								)}
							</Card>

							{/* Prediction Details */}
							<Card>
								<Space direction="vertical" className="w-full">
									<Title level={4}>
										{' '}
										<TagsOutlined className="mr-2" />
										Prediction Results
									</Title>

									{/* Grid of predicted Tags */}
									{renderPredictionTags()}

									<div className="flex items-center">
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
												handlePredictionToggle(
													currentIndex
												)
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
										{/* Generate Explanation Button */}
										<Button
											type="primary"
											icon={<BulbOutlined />}
											onClick={() =>
												handleExplainSelectedImage(
													currentIndex
												)
											}
											loading={loadingExplanation}
											style={{ marginLeft: 'auto' }}
											disabled={
												explainImageUrl[
													currentIndex
												] !== SolutionImage
											}
										>
											{explainImageUrl[currentIndex] !==
											SolutionImage
												? 'Explanation Generated'
												: 'Generate Explanation'}
										</Button>
									</div>

									{/* AI Explanation Info */}
									<Card
										title="How to Interpret Explanations"
										size="small"
										style={{ marginTop: '16px' }}
									>
										<Space
											direction="vertical"
											size="small"
										>
											<Text>
												<Text strong>
													Yellow/bright areas:
												</Text>{' '}
												Regions that strongly support
												the predicted class
											</Text>
											<Text type="secondary">
												Based on LIME (Local
												Interpretable Model-agnostic
												Explanations) which identifies
												what features the model focused
												on.
											</Text>
											<Button
												type="link"
												onClick={() =>
													setExplanationModalVisible(
														true
													)
												}
											>
												Learn more
											</Button>
										</Space>
									</Card>

									{renderExplanationHelpModal()}
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
export default MultiLabelImgPredict
