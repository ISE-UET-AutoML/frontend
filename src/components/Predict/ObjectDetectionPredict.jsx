import React, { useState, useEffect, useRef } from 'react'
import {
	Typography,
	Card,
	Space,
	Badge,
	Divider,
	Button,
	Layout,
	Tag,
	Image as AntImage,
} from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'

const { Text } = Typography
const { Content } = Layout

export default function ObjectDetectionPredict({
	predictResult,
	uploadedFiles,
	projectInfo,
}) {
	const canvasRef = useRef(null)
	const [currentIndex, setCurrentIndex] = useState(0)

	// Get predictions
	const predictions = Array.isArray(predictResult)
		? predictResult
		: predictResult?.predictions || []
	const currentPrediction = predictions?.[currentIndex] || {}
	const detections = currentPrediction.detections || []

	// Draw on canvas
	useEffect(() => {
		if (!canvasRef.current || !uploadedFiles?.[currentIndex]) return

		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const file = uploadedFiles[currentIndex]
		const reader = new FileReader()

		reader.onload = (e) => {
			const img = new Image()
			img.onload = () => {
				// Set canvas size
				canvas.width = img.width
				canvas.height = img.height

				// Draw image
				ctx.drawImage(img, 0, 0)

				// Draw boxes
				const colors = [
					'#FF6B6B',
					'#4ECDC4',
					'#45B7D1',
					'#FFA07A',
					'#98D8C8',
					'#F7DC6F',
				]

				detections.forEach((det, idx) => {
					const [x1, y1, x2, y2] = det.bbox
					const color = colors[idx % colors.length]
					const conf = (det.confidence * 100).toFixed(1)

					// Draw box
					ctx.strokeStyle = color
					ctx.lineWidth = 2
					ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)

					// Draw label
					const label = `${det.class} ${conf}%`
					ctx.font = 'bold 12px Arial'
					const tw = ctx.measureText(label).width

					ctx.fillStyle = color
					ctx.fillRect(x1, y1 - 20, tw + 8, 20)
					ctx.fillStyle = 'white'
					ctx.fillText(label, x1 + 4, y1 - 6)
				})
			}
			img.src = e.target.result
		}

		reader.readAsDataURL(file)
	}, [currentIndex, uploadedFiles, detections])

	// Update stats
	useEffect(() => {
		const totalDet = predictions.reduce(
			(sum, p) => sum + (p.detections?.length || 0),
			0
		)
		const avgConf =
			totalDet > 0
				? (predictions.reduce(
						(sum, p) =>
							sum +
							(p.detections?.reduce(
								(s, d) => s + d.confidence,
								0
							) || 0),
						0
					) /
						totalDet) *
					100
				: 0

		setStatistics({
			totalImages: uploadedFiles.length,
			totalDetections: totalDet,
			avgConfidence: avgConf.toFixed(1),
		})
	}, [predictions, uploadedFiles])

	// Render thumbnails
	const renderThumbs = () => (
		<Space className="w-full overflow-x-auto py-4" size="small">
			{uploadedFiles.map((f, i) => (
				<Badge
					key={i}
					count={
						<Tag color="blue">
							{predictions[i]?.detections?.length || 0}
						</Tag>
					}
				>
					<AntImage
						src={URL.createObjectURL(f)}
						alt={`Thumb ${i + 1}`}
						width={80}
						height={80}
						className={`object-cover rounded-lg ${
							currentIndex === i
								? 'border-4 border-blue-500'
								: 'opacity-60'
						}`}
						preview={false}
						onClick={() => setCurrentIndex(i)}
						style={{ cursor: 'pointer' }}
					/>
				</Badge>
			))}
		</Space>
	)

	return (
		<Layout className="bg-white">
			<Content className="p-6">
				{/* Main */}
				<Card className="mb-6">
					<Space direction="vertical" size="large" className="w-full">
						{/* Nav */}
						<Space className="w-full justify-center">
							<Button
								type="primary"
								icon={<LeftOutlined />}
								disabled={currentIndex === 0}
								onClick={() => setCurrentIndex((p) => p - 1)}
							>
								Prev
							</Button>
							<Text strong>
								Image {currentIndex + 1} of{' '}
								{uploadedFiles.length}
								{detections.length > 0}
							</Text>
							<Button
								type="primary"
								icon={<RightOutlined />}
								disabled={
									currentIndex === uploadedFiles.length - 1
								}
								onClick={() => setCurrentIndex((p) => p + 1)}
							>
								Next
							</Button>
						</Space>

						{/* Canvas */}
						<Card size="small">
							<div
								className="flex justify-center bg-gray-100 p-4 rounded"
								style={{ maxHeight: '500px', overflow: 'auto' }}
							>
								<canvas
									ref={canvasRef}
									style={{
										border: '2px solid #ddd',
										borderRadius: '4px',
										maxWidth: '100%',
										backgroundColor: 'white',
									}}
								/>
							</div>
						</Card>

						{/* Thumbs */}
						<Divider>Images</Divider>
						{renderThumbs()}
					</Space>
				</Card>
			</Content>
		</Layout>
	)
}
