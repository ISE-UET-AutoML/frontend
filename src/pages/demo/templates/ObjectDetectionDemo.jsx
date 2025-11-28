'use client'

import { useState, useEffect, useRef } from 'react'
import {
	XCircleIcon,
	ArrowUpTrayIcon,
	ArrowPathIcon,
	CameraIcon,
} from '@heroicons/react/24/outline'
import * as modelServiceAPI from 'src/api/model'

const ObjectDetectionDemo = ({ metadata }) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [incorrectPredictions, setIncorrectPredictions] = useState([])
	const [uploadedFiles, setUploadedFiles] = useState([])
	const [predictResult, setPredictResult] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)
	const [activeTab, setActiveTab] = useState('upload')
	const [stream, setStream] = useState(null)
	const [labelThresholds, setLabelThresholds] = useState({})

	const videoRef = useRef(null)
	const canvasRef = useRef(null)
	const predictionCanvasRef = useRef(null)

	// Color palette for consistent label coloring
	const colorPalette = [
		'#FF6B6B',
		'#4ECDC4',
		'#45B7D1',
		'#FFA07A',
		'#98D8C8',
		'#F7DC6F',
		'#AA96DA',
		'#FCBAD3',
		'#FFFDC7',
		'#A8D8EA',
	]

	// Generate consistent color for each label
	const getLabelColor = (label) => {
		const labels = Array.from(
			new Set(
				predictResult.flatMap((r) => r.detections.map((d) => d.class))
			)
		).sort()
		const index = labels.indexOf(label)
		return colorPalette[index % colorPalette.length]
	}

	const currentPrediction = predictResult[currentIndex] || {
		detections: [],
	}
	const allDetections = currentPrediction.detections || []

	// Get unique labels and initialize thresholds
	const uniqueLabels = Array.from(
		new Set(allDetections.map((det) => det.class))
	).sort()

	// Initialize missing label thresholds
	uniqueLabels.forEach((label) => {
		if (!(label in labelThresholds)) {
			setLabelThresholds((prev) => ({ ...prev, [label]: 0 }))
		}
	})

	// Filter detections based on per-label thresholds
	const detections = allDetections.filter((det) => {
		const threshold = labelThresholds[det.class] ?? 0
		return det.confidence >= threshold
	})

	// Get current filename
	const currentFileName = uploadedFiles[currentIndex]?.name || 'Unknown'

	// Handle file upload
	const handleFileUpload = async (event) => {
		const files = event.target.files
		if (!files || files.length === 0) return

		const fileArray = Array.from(files)
		setUploadedFiles((prev) => [...prev, ...fileArray])

		await predictImages(fileArray)
	}

	// Start camera
	const startCamera = async () => {
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
			})
			setStream(mediaStream)
			if (videoRef.current) {
				videoRef.current.srcObject = mediaStream
			}
			setError(null)
		} catch (err) {
			console.error('Camera error:', err)
			setError('Unable to access camera. Please check permissions.')
		}
	}

	// Stop camera
	const stopCamera = () => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop())
			setStream(null)
		}
	}

	// Switch to camera tab and start camera
	const switchToCameraTab = () => {
		setActiveTab('camera')
		if (!stream) {
			startCamera()
		}
	}

	// Capture photo from camera
	const capturePhoto = async () => {
		if (!videoRef.current || !canvasRef.current) return

		const video = videoRef.current
		const canvas = canvasRef.current

		canvas.width = video.videoWidth
		canvas.height = video.videoHeight

		const context = canvas.getContext('2d')
		if (!context) return
		context.drawImage(video, 0, 0, canvas.width, canvas.height)

		canvas.toBlob(
			async (blob) => {
				if (!blob) return

				const file = new File([blob], `camera-${Date.now()}.jpg`, {
					type: 'image/jpeg',
				})
				setUploadedFiles((prev) => [...prev, file])

				await predictImages([file])
			},
			'image/jpeg',
			0.95
		)
	}

	// Cleanup camera on unmount or tab switch
	useEffect(() => {
		if (activeTab === 'camera' && !stream) {
			startCamera()
		} else if (activeTab === 'upload' && stream) {
			stopCamera()
		}
	}, [activeTab])

	useEffect(() => {
		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop())
			}
		}
	}, [stream])

	// API call to predict images
	const predictImages = async (files) => {
		setIsLoading(true)
		setError(null)

		try {
			const formData = new FormData()
			files.forEach((file) => {
				formData.append('images', file)
			})

			console.log('Sending request to API with', files.length, 'file(s)')

			formData.append('api_base_url', metadata.apiUrl)

			const response = await modelServiceAPI.predictGenUI(formData)

			if (response.status !== 200) {
				let errorMessage = 'Prediction failed'
				if (response.data?.detail || response.data?.message) {
					errorMessage = response.data.detail || response.data.message
				}
				throw new Error(errorMessage)
			}

			const data = response.data
			console.log('Fetch prediction successful', data)

			let predictions = []
			if (data.predictions && Array.isArray(data.predictions)) {
				predictions = data.predictions
			} else if (Array.isArray(data)) {
				predictions = data
			} else {
				console.warn('Unexpected response format:', data)
				predictions = files.map(() => ({
					detections: [],
				}))
			}

			setPredictResult((prev) => [...prev, ...predictions])
		} catch (err) {
			const errorMsg =
				err instanceof Error ? err.message : 'Failed to predict images'
			setError(errorMsg)
			console.error('Prediction error:', err)
		} finally {
			setIsLoading(false)
		}
	}

	// Draw detections on canvas
	useEffect(() => {
		if (!predictionCanvasRef.current || !uploadedFiles[currentIndex]) return

		const canvas = predictionCanvasRef.current
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

				if (detections && detections.length > 0) {
					detections.forEach((det) => {
						const [x1, y1, x2, y2] = det.bbox
						const color = getLabelColor(det.class)

						// Draw box only
						ctx.strokeStyle = color
						ctx.lineWidth = 2
						ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
					})
				}
			}
			img.src = e.target.result
		}

		reader.readAsDataURL(file)
	}, [currentIndex, uploadedFiles, detections, labelThresholds])

	useEffect(() => {
		const initialIncorrect = predictResult
			.map((result, idx) => (result.confidence < 0.5 ? idx : null))
			.filter((idx) => idx !== null)
		setIncorrectPredictions(initialIncorrect)
	}, [predictResult])

	useEffect(() => {
		if (uploadedFiles && uploadedFiles.length > 0) {
			setCurrentIndex(uploadedFiles.length - 1)
		}
	}, [uploadedFiles])

	if (uploadedFiles.length === 0) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4 sm:p-6">
				<div className="max-w-4xl w-full space-y-8 animate-in fade-in duration-700">
					<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
						<div className="text-center space-y-3 p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-blue-900/30">
							<h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
								{metadata.projectName}
							</h1>
							<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
								{metadata.projectDescription ||
									metadata.description}
							</p>
						</div>

						{/* Content */}
						<div className="p-8 space-y-8">
							{/* Tabs - Hidden on mobile, visible on md+ screens */}
							<div className="hidden md:block">
								<div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur rounded-xl">
									<button
										onClick={() => {
											setActiveTab('upload')
											setError(null)
										}}
										className={`flex items-center justify-center gap-2 px-5 py-3 rounded-[0.75rem] font-semibold transition-all duration-300 ${
											activeTab === 'upload'
												? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-lg'
												: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'
										}`}
									>
										<ArrowUpTrayIcon className="h-5 w-5" />
										<span>Upload Files</span>
									</button>
									<button
										onClick={switchToCameraTab}
										className={`flex items-center justify-center gap-2 px-5 py-3 rounded-[0.75rem] font-semibold transition-all duration-300 ${
											activeTab === 'camera'
												? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-lg'
												: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'
										}`}
									>
										<CameraIcon className="h-5 w-5" />
										<span>Take Photo</span>
									</button>
								</div>

								{/* Tab Content - Upload */}
								{activeTab === 'upload' && (
									<div className="space-y-4 mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
										<label
											htmlFor="file-upload"
											className="group relative flex flex-col items-center justify-center w-full h-56 sm:h-72 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900/30 dark:to-blue-900/20 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-900/50 dark:hover:to-blue-900/30 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl"
										>
											<div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
												<div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
													<ArrowUpTrayIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
												</div>
												<p className="mb-2 text-base text-center font-semibold text-gray-700 dark:text-gray-300">
													<span className="text-blue-600 dark:text-blue-400">
														Click to upload
													</span>{' '}
													or drag and drop
												</p>
												<p className="text-sm text-center text-gray-500 dark:text-gray-400">
													PNG, JPG, JPEG (Multiple
													files supported)
												</p>
											</div>
											<input
												id="file-upload"
												type="file"
												className="hidden"
												multiple
												accept="image/*"
												onChange={handleFileUpload}
												disabled={isLoading}
											/>
										</label>
									</div>
								)}

								{/* Tab Content - Camera */}
								{activeTab === 'camera' && (
									<div className="space-y-4 mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
										<div
											className="relative bg-black rounded-2xl overflow-hidden shadow-2xl ring-2 ring-gray-200 dark:ring-gray-700"
											style={{ aspectRatio: '16/9' }}
										>
											<video
												ref={videoRef}
												autoPlay
												playsInline
												className="w-full h-full object-cover"
											/>
											<canvas
												ref={canvasRef}
												className="hidden"
											/>
										</div>
										<button
											onClick={capturePhoto}
											className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
											disabled={isLoading || !stream}
										>
											<CameraIcon className="h-6 w-6" />
											Capture Photo
										</button>
									</div>
								)}
							</div>

							{/* Mobile - Upload only (no tabs) */}
							<div className="md:hidden space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
								<label
									htmlFor="file-upload-mobile"
									className="group relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900/30 dark:to-blue-900/20 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-900/50 dark:hover:to-blue-900/30 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl"
								>
									<div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
										<div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
											<ArrowUpTrayIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
										</div>
										<p className="mb-2 text-base text-center font-semibold text-gray-700 dark:text-gray-300">
											<span className="text-blue-600 dark:text-blue-400">
												Click to upload
											</span>{' '}
											or drag and drop
										</p>
										<p className="text-sm text-center text-gray-500 dark:text-gray-400">
											PNG, JPG, JPEG (Multiple files
											supported)
										</p>
									</div>
									<input
										id="file-upload-mobile"
										type="file"
										className="hidden"
										multiple
										accept="image/*"
										onChange={handleFileUpload}
										disabled={isLoading}
									/>
								</label>
							</div>

							{isLoading && (
								<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
									<ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
									<p className="text-sm font-medium text-blue-900 dark:text-blue-100">
										Processing images...
									</p>
								</div>
							)}

							{error && (
								<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
									<XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
									<p className="text-sm font-medium text-red-900 dark:text-red-100">
										{error}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 p-4 lg:p-6 overflow-hidden">
			<div className="h-full flex gap-4 lg:gap-6">
				{/* Left Sidebar - Thumbnails Card */}
				<div className="hidden lg:flex flex-col w-28 bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden backdrop-blur-xl">
					<div className="p-3 space-y-3 overflow-y-auto flex-1">
						<label
							htmlFor="add-more-files"
							className="flex items-center justify-center w-full aspect-square border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
						>
							<span className="text-2xl">+</span>
							<input
								id="add-more-files"
								type="file"
								className="hidden"
								multiple
								accept="image/*"
								onChange={handleFileUpload}
								disabled={isLoading}
							/>
						</label>
						{uploadedFiles.map((file, index) => (
							<button
								key={index}
								onClick={() => setCurrentIndex(index)}
								className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
									currentIndex === index
										? 'border-blue-500 shadow-lg'
										: 'border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100'
								}`}
							>
								<img
									src={URL.createObjectURL(file)}
									alt={`Thumb ${index + 1}`}
									className="w-full h-full object-cover"
								/>
							</button>
						))}
					</div>
				</div>

				{/* Main Content Area - Center Canvas */}
				<div className="flex-1 flex flex-col">
					{/* Center - Canvas with Detections */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col h-full">
						<div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 space-y-2">
							<h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 truncate">
								{currentFileName}
							</h3>
						</div>
						<div className="p-6 flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/30 overflow-auto">
							<div className="overflow-hidden shadow-inner ring-2 ring-gray-200 dark:ring-gray-700">
								<canvas
									ref={predictionCanvasRef}
									className="max-w-full h-auto bg-white dark:bg-gray-800"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Right Sidebar - Detection List Card */}
				<div className="hidden xl:flex flex-col w-80 bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden backdrop-blur-xl">
					<div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
						<h3 className="text-lg font-bold text-gray-900 dark:text-white">
							Objects Detected
						</h3>
					</div>
					<div className="p-6 flex-1 overflow-y-auto space-y-4">
						{uniqueLabels.length > 0 ? (
							uniqueLabels.map((label) => {
								const labelDetections = allDetections.filter(
									(d) => d.class === label
								)
								const maxConf = Math.max(
									...labelDetections.map((d) => d.confidence)
								)
								const currentThreshold =
									labelThresholds[label] ?? 0
								const filteredCount = labelDetections.filter(
									(d) => d.confidence >= currentThreshold
								).length

								return (
									<div
										key={label}
										className="p-4 border-2 transition-all"
										style={{
											backgroundColor:
												getLabelColor(label) + '15',
											borderColor: getLabelColor(label),
											borderRadius: '0.75rem',
										}}
									>
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-2">
												<div
													className="w-4 h-4 rounded"
													style={{
														backgroundColor:
															getLabelColor(
																label
															),
													}}
												/>
												<span className="font-bold text-gray-900 dark:text-white">
													{label}
												</span>
											</div>
											<span className="text-xs font-bold px-2 py-1 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded">
												{filteredCount}/
												{labelDetections.length}
											</span>
										</div>
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
													Threshold
												</label>
												<span
													className="text-xs font-bold px-2 py-1 rounded-full text-white"
													style={{
														backgroundColor:
															getLabelColor(
																label
															),
													}}
												>
													{(
														currentThreshold * 100
													).toFixed(0)}
													%
												</span>
											</div>
											<input
												type="range"
												min="0"
												max="100"
												value={currentThreshold * 100}
												onChange={(e) => {
													setLabelThresholds(
														(prev) => ({
															...prev,
															[label]:
																parseFloat(
																	e.target
																		.value
																) / 100,
														})
													)
												}}
												className="w-full h-1 rounded-lg appearance-none cursor-pointer"
												style={{
													background: `linear-gradient(to right, ${getLabelColor(label)}, ${getLabelColor(label)})`,
												}}
											/>
										</div>
									</div>
								)
							})
						) : (
							<div className="h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
								<p className="text-sm">No objects detected</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default ObjectDetectionDemo
