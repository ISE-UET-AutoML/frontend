import React, { useState, useEffect, useRef } from 'react'
import {
	Typography,
	Progress,
	Button,
	Card,
	Space,
	Badge,
	Alert,
	Statistic,
	Layout,
	Tooltip,
} from 'antd'
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	QuestionCircleOutlined,
	LeftOutlined,
	RightOutlined,
	PlayCircleOutlined,
	PauseCircleOutlined,
	SoundOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Content } = Layout

const AudioClassificationPredict = ({
	predictResult,
	uploadedFiles,
	projectInfo,
}) => {
	const audioRef = useRef(null)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [incorrectPredictions, setIncorrectPredictions] = useState([])
	const [statistics, setStatistics] = useState({
		correct: 0,
		incorrect: 0,
		accuracy: 0,
	})
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)

	const handlePredictionToggle = (index) => {
		setIncorrectPredictions((prev) =>
			prev.includes(index)
				? prev.filter((i) => i !== index)
				: [...prev, index]
		)
	}

	const currentPrediction = predictResult[currentIndex] || {}

	// Audio control handlers
	const handlePlayPause = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause()
			} else {
				audioRef.current.play()
			}
			setIsPlaying(!isPlaying)
		}
	}

	const handleTimeUpdate = () => {
		if (audioRef.current) {
			setCurrentTime(audioRef.current.currentTime)
		}
	}

	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration)
		}
	}

	const handleAudioEnded = () => {
		setIsPlaying(false)
		setCurrentTime(0)
	}

	const handleSeek = (value) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value
			setCurrentTime(value)
		}
	}

	const formatTime = (time) => {
		if (isNaN(time)) return '0:00'
		const minutes = Math.floor(time / 60)
		const seconds = Math.floor(time % 60)
		return `${minutes}:${seconds.toString().padStart(2, '0')}`
	}

	// Update audio source when index changes
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.pause()
			audioRef.current.load()
			setIsPlaying(false)
			setCurrentTime(0)
		}
	}, [currentIndex])

	// Thumbnail gallery for audio files
	const renderThumbnails = () => (
		<Space className="w-full overflow-x-auto py-4" size="small">
			{uploadedFiles.map((data, index) => (
				<Badge
					key={index}
					count={
						incorrectPredictions.includes(index) ? (
							<CloseCircleOutlined style={{ color: '#f5222d' }} />
						) : null
					}
				>
					<Tooltip title={data.name}>
						<Card
							size="small"
							className={`cursor-pointer ${currentIndex === index ? 'border-4 border-blue-500 bg-blue-50' : 'opacity-60'}`}
							style={{ width: 100 }}
							onClick={() => setCurrentIndex(index)}
							hoverable
						>
							<div className="text-center">
								<SoundOutlined
									style={{
										fontSize: 32,
										color:
											currentIndex === index
												? '#1890ff'
												: '#8c8c8c',
									}}
								/>
								<Text
									ellipsis
									style={{
										display: 'block',
										fontSize: 10,
										marginTop: 4,
									}}
								>
									{data.name}
								</Text>
							</div>
						</Card>
					</Tooltip>
				</Badge>
			))}
		</Space>
	)

	// Initialize incorrect predictions based on confidence
	useEffect(() => {
		const initialIncorrect = predictResult
			.map((result, idx) => (result.confidence < 0.5 ? idx : null))
			.filter((idx) => idx !== null)
		setIncorrectPredictions(initialIncorrect)
	}, [uploadedFiles, predictResult])

	// Update statistics when predictions change
	useEffect(() => {
		const incorrect = incorrectPredictions.length
		const total = uploadedFiles.length
		setStatistics({
			correct: total - incorrect,
			incorrect,
			accuracy: total
				? (((total - incorrect) / total) * 100).toFixed(1)
				: 0,
		})
	}, [incorrectPredictions, uploadedFiles])

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
							>{`Audio ${currentIndex + 1} of ${uploadedFiles.length}`}</Text>
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
							{/* Audio Player */}
							<Card
								title={
									<Space>
										<SoundOutlined />
										<Text strong>Audio Player</Text>
									</Space>
								}
							>
								<Space
									direction="vertical"
									className="w-full"
									size="large"
								>
									{/* File Info */}
									<div>
										<Text type="secondary">File Name:</Text>
										<br />
										<Text strong>
											{uploadedFiles[currentIndex]?.name}
										</Text>
									</div>

									{/* Audio Element */}
									<audio
										ref={audioRef}
										onTimeUpdate={handleTimeUpdate}
										onLoadedMetadata={handleLoadedMetadata}
										onEnded={handleAudioEnded}
										style={{ display: 'none' }}
									>
										<source
											src={URL.createObjectURL(
												uploadedFiles[currentIndex]
											)}
											type={
												uploadedFiles[currentIndex]
													?.type
											}
										/>
										Your browser does not support the audio
										element.
									</audio>

									{/* Custom Audio Controls */}
									<div
										style={{
											padding: '20px',
											background: '#f5f5f5',
											borderRadius: '8px',
										}}
									>
										<Space
											direction="vertical"
											className="w-full"
											size="middle"
										>
											{/* Play/Pause Button */}
											<div
												style={{
													textAlign: 'center',
												}}
											>
												<Button
													type="primary"
													shape="circle"
													size="large"
													icon={
														isPlaying ? (
															<PauseCircleOutlined />
														) : (
															<PlayCircleOutlined />
														)
													}
													onClick={handlePlayPause}
													style={{
														width: 64,
														height: 64,
														fontSize: 32,
													}}
												/>
											</div>

											{/* Progress Bar */}
											<div>
												<input
													type="range"
													min="0"
													max={duration || 0}
													value={currentTime}
													onChange={(e) =>
														handleSeek(
															parseFloat(
																e.target.value
															)
														)
													}
													style={{
														width: '100%',
														cursor: 'pointer',
													}}
												/>
												<div
													style={{
														display: 'flex',
														justifyContent:
															'space-between',
														marginTop: '8px',
													}}
												>
													<Text type="secondary">
														{formatTime(
															currentTime
														)}
													</Text>
													<Text type="secondary">
														{formatTime(duration)}
													</Text>
												</div>
											</div>
										</Space>
									</div>
								</Space>
							</Card>

							{/* Prediction Details */}
							<Card>
								<Space direction="vertical" className="w-full">
									<Title level={4}>Prediction Results</Title>
									<Alert
										message={
											<Space>
												<Text>
													{`Predicted Class:`}
												</Text>
												<Text
													strong
													style={{
														textTransform:
															'uppercase',
													}}
												>
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
												currentPrediction.confidence *
													100
											)}
											strokeColor={
												currentPrediction.confidence >
												0.7
													? '#52c41a' // green
													: currentPrediction.confidence >
														  0.4
														? '#fa8c16' // orange
														: '#ff4d4f' // red
											}
											format={(percent) => `${percent}%`}
										/>
									</div>
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
									</div>
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

export default AudioClassificationPredict
