import React, { useState, useRef, useEffect } from 'react'
import {
	Button,
	Card,
	Select,
	Tag,
	Typography,
	Space,
	Progress,
	Tooltip,
	Divider,
	List,
	Modal,
	Input,
	message
} from 'antd'
import {
	ArrowLeftOutlined,
	ArrowRightOutlined,
	ZoomInOutlined,
	ZoomOutOutlined,
	UndoOutlined,
	RedoOutlined,
	DeleteOutlined,
	SaveOutlined,
	CheckOutlined,
	EditOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

// Sample project data (would come from route params in real app)
const sampleProject = {
	_id: "674a8e2f123456789abcdef1",
	name: "Vehicle Detection System",
	labels: ["car", "truck", "motorcycle", "bus", "bicycle", "pedestrian"],
	currentItem: 0,
	totalItems: 100
}

// Sample image items for annotation
const sampleImages = [
	{
		id: 1,
		url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
		annotations: [
			{ id: 1, label: "car", x: 100, y: 150, width: 200, height: 120, confidence: 0.95 }
		]
	},
	{
		id: 2,
		url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop",
		annotations: []
	},
	{
		id: 3,
		url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
		annotations: []
	}
]

export default function LabelView() {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [selectedLabel, setSelectedLabel] = useState(sampleProject.labels[0])
	const [annotations, setAnnotations] = useState(sampleImages[0].annotations || [])
	const [isDrawing, setIsDrawing] = useState(false)
	const [currentBox, setCurrentBox] = useState(null)
	const [zoom, setZoom] = useState(1)
	const [selectedAnnotation, setSelectedAnnotation] = useState(null)
	const [editingAnnotation, setEditingAnnotation] = useState(null)

	const canvasRef = useRef(null)
	const imageRef = useRef(null)
	const containerRef = useRef(null)

	const currentImage = sampleImages[currentImageIndex]

	// Handle mouse events for drawing bounding boxes
	const handleMouseDown = (e) => {
		if (!canvasRef.current) return

		const rect = canvasRef.current.getBoundingClientRect()
		const x = (e.clientX - rect.left) / zoom
		const y = (e.clientY - rect.top) / zoom

		setIsDrawing(true)
		setCurrentBox({ x, y, width: 0, height: 0 })
	}

	const handleMouseMove = (e) => {
		if (!isDrawing || !canvasRef.current || !currentBox) return

		const rect = canvasRef.current.getBoundingClientRect()
		const x = (e.clientX - rect.left) / zoom
		const y = (e.clientY - rect.top) / zoom

		setCurrentBox({
			...currentBox,
			width: x - currentBox.x,
			height: y - currentBox.y
		})
	}

	const handleMouseUp = () => {
		if (!isDrawing || !currentBox) return

		// Only create annotation if box has minimum size
		if (Math.abs(currentBox.width) > 10 && Math.abs(currentBox.height) > 10) {
			const newAnnotation = {
				id: Date.now(),
				label: selectedLabel,
				x: Math.min(currentBox.x, currentBox.x + currentBox.width),
				y: Math.min(currentBox.y, currentBox.y + currentBox.height),
				width: Math.abs(currentBox.width),
				height: Math.abs(currentBox.height),
				confidence: 1.0
			}

			setAnnotations([...annotations, newAnnotation])
			message.success(`Added ${selectedLabel} annotation`)
		}

		setIsDrawing(false)
		setCurrentBox(null)
	}

	// Draw annotations on canvas
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		// Draw existing annotations
		annotations.forEach((annotation, index) => {
			const color = getLabelColor(annotation.label)
			ctx.strokeStyle = selectedAnnotation === annotation.id ? '#ff4d4f' : color
			ctx.lineWidth = selectedAnnotation === annotation.id ? 3 : 2
			ctx.fillStyle = color + '20'

			// Draw bounding box
			ctx.fillRect(annotation.x * zoom, annotation.y * zoom, annotation.width * zoom, annotation.height * zoom)
			ctx.strokeRect(annotation.x * zoom, annotation.y * zoom, annotation.width * zoom, annotation.height * zoom)

			// Draw label
			ctx.fillStyle = color
			ctx.font = '14px Arial'
			ctx.fillText(
				`${annotation.label} (${(annotation.confidence * 100).toFixed(0)}%)`,
				annotation.x * zoom,
				annotation.y * zoom - 5
			)
		})

		// Draw current drawing box
		if (currentBox && isDrawing) {
			ctx.strokeStyle = getLabelColor(selectedLabel)
			ctx.lineWidth = 2
			ctx.strokeRect(
				currentBox.x * zoom,
				currentBox.y * zoom,
				currentBox.width * zoom,
				currentBox.height * zoom
			)
		}
	}, [annotations, currentBox, isDrawing, selectedLabel, zoom, selectedAnnotation])

	const getLabelColor = (label) => {
		const colors = {
			car: '#1890ff',
			truck: '#52c41a',
			motorcycle: '#fa8c16',
			bus: '#eb2f96',
			bicycle: '#722ed1',
			pedestrian: '#13c2c2'
		}
		return colors[label] || '#666666'
	}

	const handleImageLoad = () => {
		const canvas = canvasRef.current
		const image = imageRef.current
		if (canvas && image) {
			canvas.width = image.width
			canvas.height = image.height
		}
	}

	const navigateImage = (direction) => {
		const newIndex = direction === 'next'
			? Math.min(currentImageIndex + 1, sampleImages.length - 1)
			: Math.max(currentImageIndex - 1, 0)

		if (newIndex !== currentImageIndex) {
			setCurrentImageIndex(newIndex)
			setAnnotations(sampleImages[newIndex].annotations || [])
			setSelectedAnnotation(null)
		}
	}

	const deleteAnnotation = (annotationId) => {
		setAnnotations(annotations.filter(ann => ann.id !== annotationId))
		setSelectedAnnotation(null)
		message.success('Annotation deleted')
	}

	const saveAnnotations = () => {
		// In real app, this would save to backend
		console.log('Saving annotations:', annotations)
		message.success('Annotations saved successfully')
	}

	return (
		<div className="h-screen flex flex-col bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b px-6 py-4">
				<div className="flex justify-between items-center">
					<div className="flex items-center space-x-4">
						<Button
							icon={<ArrowLeftOutlined />}
							onClick={() => window.history.back()}
						>
							Back to Projects
						</Button>
						<Title level={4} className="m-0">{sampleProject.name}</Title>
					</div>

					<div className="flex items-center space-x-4">
						<Progress
							percent={Math.round(((currentImageIndex + 1) / sampleImages.length) * 100)}
							size="small"
							style={{ width: 200 }}
						/>
						<Text>{currentImageIndex + 1} / {sampleImages.length}</Text>
						<Button type="primary" icon={<SaveOutlined />} onClick={saveAnnotations}>
							Save
						</Button>
					</div>
				</div>
			</div>

			<div className="flex-1 flex">
				{/* Sidebar */}
				<div className="w-80 bg-white border-r flex flex-col">
					{/* Tools */}
					<div className="p-4 border-b">
						<Title level={5}>Annotation Tools</Title>

						<div className="space-y-3">
							<div>
								<Text className="text-sm font-medium">Selected Label:</Text>
								<Select
									value={selectedLabel}
									onChange={setSelectedLabel}
									className="w-full mt-1"
								>
									{sampleProject.labels.map(label => (
										<Option key={label} value={label}>
											<div className="flex items-center space-x-2">
												<div
													className="w-3 h-3 rounded"
													style={{ backgroundColor: getLabelColor(label) }}
												/>
												<span>{label}</span>
											</div>
										</Option>
									))}
								</Select>
							</div>

							<div className="flex space-x-2">
								<Tooltip title="Zoom In">
									<Button
										icon={<ZoomInOutlined />}
										onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
									/>
								</Tooltip>
								<Tooltip title="Zoom Out">
									<Button
										icon={<ZoomOutOutlined />}
										onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
									/>
								</Tooltip>
								<Tooltip title="Reset Zoom">
									<Button onClick={() => setZoom(1)}>
										{Math.round(zoom * 100)}%
									</Button>
								</Tooltip>
							</div>
						</div>
					</div>

					{/* Annotations List */}
					<div className="flex-1 p-4">
						<div className="flex justify-between items-center mb-3">
							<Title level={5}>Annotations ({annotations.length})</Title>
						</div>

						<List
							dataSource={annotations}
							renderItem={(annotation) => (
								<List.Item
									className={`cursor-pointer p-2 rounded mb-2 ${selectedAnnotation === annotation.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
										}`}
									onClick={() => setSelectedAnnotation(
										selectedAnnotation === annotation.id ? null : annotation.id
									)}
									actions={[
										<Button
											size="small"
											icon={<EditOutlined />}
											onClick={(e) => {
												e.stopPropagation()
												setEditingAnnotation(annotation)
											}}
										/>,
										<Button
											size="small"
											danger
											icon={<DeleteOutlined />}
											onClick={(e) => {
												e.stopPropagation()
												deleteAnnotation(annotation.id)
											}}
										/>
									]}
								>
									<div className="flex items-center space-x-2">
										<div
											className="w-3 h-3 rounded"
											style={{ backgroundColor: getLabelColor(annotation.label) }}
										/>
										<div>
											<div className="font-medium">{annotation.label}</div>
											<div className="text-xs text-gray-500">
												{Math.round(annotation.confidence * 100)}% confidence
											</div>
										</div>
									</div>
								</List.Item>
							)}
						/>
					</div>
				</div>

				{/* Main Canvas Area */}
				<div className="flex-1 flex flex-col">
					{/* Navigation */}
					<div className="bg-white border-b px-4 py-2 flex justify-between items-center">
						<Button
							icon={<ArrowLeftOutlined />}
							disabled={currentImageIndex === 0}
							onClick={() => navigateImage('prev')}
						>
							Previous
						</Button>

						<Text className="font-medium">
							Image {currentImageIndex + 1}: {currentImage.url.split('/').pop()}
						</Text>

						<Button
							type="primary"
							icon={<ArrowRightOutlined />}
							disabled={currentImageIndex === sampleImages.length - 1}
							onClick={() => navigateImage('next')}
						>
							Next
						</Button>
					</div>

					{/* Canvas Container */}
					<div
						ref={containerRef}
						className="flex-1 overflow-auto bg-gray-100 p-4"
					>
						<div className="relative inline-block">
							<img
								ref={imageRef}
								src={currentImage.url}
								alt="Annotation target"
								className="max-w-none"
								style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
								onLoad={handleImageLoad}
								draggable={false}
							/>
							<canvas
								ref={canvasRef}
								className="absolute top-0 left-0 cursor-crosshair"
								style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
								onMouseDown={handleMouseDown}
								onMouseMove={handleMouseMove}
								onMouseUp={handleMouseUp}
								onMouseLeave={() => {
									setIsDrawing(false)
									setCurrentBox(null)
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Instructions */}
			<div className="bg-blue-50 border-t px-6 py-2">
				<Text className="text-sm text-blue-700">
					💡 <strong>Instructions:</strong> Select a label, then click and drag on the image to create bounding boxes.
					Click on annotations in the sidebar to highlight them.
				</Text>
			</div>
		</div>
		// <div>Hello</div>
	)
}