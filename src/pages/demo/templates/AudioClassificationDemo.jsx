'use client'

import { useState, useEffect, useRef } from 'react'
import {
	CheckCircleIcon,
	XCircleIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	TrashIcon,
	ArrowUpTrayIcon,
	ArrowPathIcon,
	MicrophoneIcon,
	MusicalNoteIcon,
	StopIcon,
} from '@heroicons/react/24/outline'
import * as modelServiceAPI from 'src/api/model'

const AudioClassificationDemo = ({ metadata }) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [incorrectPredictions, setIncorrectPredictions] = useState([])
	const [uploadedFiles, setUploadedFiles] = useState([])
	const [predictResult, setPredictResult] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)
	const [activeTab, setActiveTab] = useState('upload')
	const [isRecording, setIsRecording] = useState(false)
	const [recordingTime, setRecordingTime] = useState(0)

	const mediaRecorderRef = useRef(null)
	const audioChunksRef = useRef([])
	const recordingIntervalRef = useRef(null)

	const currentPrediction = predictResult[currentIndex] || {
		class: 'Unknown',
		confidence: 0,
	}

	// Handle file upload
	const handleFileUpload = async (event) => {
		const files = event.target.files
		if (!files || files.length === 0) return

		const fileArray = Array.from(files)
		setUploadedFiles((prev) => [...prev, ...fileArray])

		await predictAudio(fileArray)
	}

	// Start recording audio
	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			})

			const mediaRecorder = new MediaRecorder(stream)
			mediaRecorderRef.current = mediaRecorder
			audioChunksRef.current = []

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data)
				}
			}

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunksRef.current, {
					type: 'audio/wav',
				})
				const audioFile = new File(
					[audioBlob],
					`recording-${Date.now()}.wav`,
					{ type: 'audio/wav' }
				)

				setUploadedFiles((prev) => [...prev, audioFile])
				await predictAudio([audioFile])

				// Stop all tracks
				stream.getTracks().forEach((track) => track.stop())
			}

			mediaRecorder.start()
			setIsRecording(true)
			setRecordingTime(0)

			// Start timer
			recordingIntervalRef.current = setInterval(() => {
				setRecordingTime((prev) => prev + 1)
			}, 1000)

			setError(null)
		} catch (err) {
			console.error('Microphone error:', err)
			setError('Unable to access microphone. Please check permissions.')
		}
	}

	// Stop recording audio
	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop()
			setIsRecording(false)

			if (recordingIntervalRef.current) {
				clearInterval(recordingIntervalRef.current)
				recordingIntervalRef.current = null
			}
		}
	}

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (mediaRecorderRef.current && isRecording) {
				stopRecording()
			}
			if (recordingIntervalRef.current) {
				clearInterval(recordingIntervalRef.current)
			}
		}
	}, [])

	// API call to predict audio
	const predictAudio = async (files) => {
		setIsLoading(true)
		setError(null)

		try {
			const formData = new FormData()
			files.forEach((file) => {
				formData.append('audios', file)
			})

			console.log(
				'Sending request to API with',
				files.length,
				'audio file(s)'
			)

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
			} else if (data.class && data.confidence !== undefined) {
				predictions = [data]
			} else {
				console.warn('Unexpected response format:', data)
				predictions = files.map(() => ({
					class: 'Unknown',
					confidence: 0,
				}))
			}

			setPredictResult((prev) => [...prev, ...predictions])
		} catch (err) {
			const errorMsg =
				err instanceof Error ? err.message : 'Failed to predict audio'
			setError(errorMsg)
			console.error('Prediction error:', err)
		} finally {
			setIsLoading(false)
		}
	}

	// Clear all uploaded files and predictions
	const handleClearAll = () => {
		setUploadedFiles([])
		setPredictResult([])
		setIncorrectPredictions([])
		setCurrentIndex(0)
		setError(null)
	}

	// Format time for display (mm:ss)
	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
	}

	const renderThumbnails = () => (
		<div className="w-full overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
			<div className="flex gap-4 min-w-max px-1">
				{uploadedFiles.map((data, index) => (
					<div key={index} className="relative group">
						{incorrectPredictions.includes(index) && (
							<span className="absolute -top-2 -right-2 z-10 h-7 w-7 rounded-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg animate-pulse">
								<XCircleIcon className="h-4 w-4" />
							</span>
						)}
						<div
							className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
								currentIndex === index
									? 'border-blue-500 shadow-xl ring-4 ring-blue-500/30 scale-105'
									: 'border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100 hover:border-blue-400 hover:shadow-lg hover:scale-105'
							}`}
							onClick={() => setCurrentIndex(index)}
						>
							<div className="w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30">
								<MusicalNoteIcon className="h-10 w-10 text-purple-600 dark:text-purple-400" />
								<span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
									Audio {index + 1}
								</span>
							</div>
							<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							{currentIndex === index && (
								<div className="absolute inset-0 bg-blue-500/10" />
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)

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
										<span>Upload Audio</span>
									</button>
									<button
										onClick={() => {
											setActiveTab('record')
											setError(null)
										}}
										className={`flex items-center justify-center gap-2 px-5 py-3 rounded-[0.75rem] font-semibold transition-all duration-300 ${
											activeTab === 'record'
												? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-lg'
												: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'
										}`}
									>
										<MicrophoneIcon className="h-5 w-5" />
										<span>Record Audio</span>
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
													MP3, WAV, OGG, M4A (Multiple
													files supported)
												</p>
											</div>
											<input
												id="file-upload"
												type="file"
												className="hidden"
												multiple
												accept="audio/*"
												onChange={handleFileUpload}
												disabled={isLoading}
											/>
										</label>
									</div>
								)}

								{/* Tab Content - Record */}
								{activeTab === 'record' && (
									<div className="space-y-4 mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
										<div className="relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-gray-200 dark:ring-gray-700 p-8">
											<div className="flex flex-col items-center justify-center space-y-6">
												<div
													className={`p-8 rounded-full ${isRecording ? 'bg-red-100 dark:bg-red-900/30 animate-pulse' : 'bg-purple-100 dark:bg-purple-900/30'}`}
												>
													<MicrophoneIcon
														className={`h-20 w-20 ${isRecording ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'}`}
													/>
												</div>

												{isRecording && (
													<div className="text-center space-y-2">
														<div className="text-4xl font-bold text-red-600 dark:text-red-400">
															{formatTime(
																recordingTime
															)}
														</div>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															Recording in
															progress...
														</p>
													</div>
												)}

												{!isRecording && (
													<p className="text-center text-gray-600 dark:text-gray-400">
														Click the button below
														to start recording
													</p>
												)}
											</div>
										</div>
										<button
											onClick={
												isRecording
													? stopRecording
													: startRecording
											}
											className={`w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
												isRecording
													? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
													: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
											}`}
											disabled={isLoading}
										>
											{isRecording ? (
												<>
													<StopIcon className="h-6 w-6" />
													Stop Recording
												</>
											) : (
												<>
													<MicrophoneIcon className="h-6 w-6" />
													Start Recording
												</>
											)}
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
											MP3, WAV, OGG, M4A (Multiple files
											supported)
										</p>
									</div>
									<input
										id="file-upload-mobile"
										type="file"
										className="hidden"
										multiple
										accept="audio/*"
										onChange={handleFileUpload}
										disabled={isLoading}
									/>
								</label>
							</div>

							{isLoading && (
								<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
									<ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
									<p className="text-sm font-medium text-blue-900 dark:text-blue-100">
										Processing audio...
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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 py-6 sm:py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6">
				<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
					<div className="p-6 sm:p-8 lg:p-10 space-y-8">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-900/50 dark:to-blue-900/30 rounded-2xl p-6 shadow-lg">
							<button
								disabled={currentIndex === 0}
								onClick={() =>
									setCurrentIndex((prev) => prev - 1)
								}
								className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 w-full sm:w-auto shadow-md ${
									currentIndex === 0
										? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
										: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-xl hover:scale-105 active:scale-95'
								}`}
							>
								<ChevronLeftIcon className="h-5 w-5" />
								Previous
							</button>

							<div className="text-center space-y-4 flex-1">
								<div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
									Audio {currentIndex + 1} of{' '}
									{uploadedFiles.length}
								</div>
								<div className="flex flex-wrap gap-3 justify-center">
									<label htmlFor="add-more-files">
										<span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
											<ArrowUpTrayIcon className="h-5 w-5" />
											<span className="hidden sm:inline">
												Upload More
											</span>
											<span className="sm:hidden">
												Upload
											</span>
										</span>
									</label>
									<input
										id="add-more-files"
										type="file"
										className="hidden"
										multiple
										accept="audio/*"
										onChange={handleFileUpload}
										disabled={isLoading}
									/>
									<button
										onClick={handleClearAll}
										className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
									>
										<TrashIcon className="h-5 w-5" />
										<span className="hidden sm:inline">
											Clear All
										</span>
										<span className="sm:hidden">Clear</span>
									</button>
								</div>
								{isLoading && (
									<div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
										<ArrowPathIcon className="h-5 w-5 animate-spin" />
										<span>Processing...</span>
									</div>
								)}
								{error && (
									<p className="text-sm text-red-600 dark:text-red-400 font-medium">
										{error}
									</p>
								)}
							</div>

							<button
								disabled={
									currentIndex === uploadedFiles.length - 1
								}
								onClick={() =>
									setCurrentIndex((prev) => prev + 1)
								}
								className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 w-full sm:w-auto shadow-md ${
									currentIndex === uploadedFiles.length - 1
										? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
										: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-xl hover:scale-105 active:scale-95'
								}`}
							>
								Next
								<ChevronRightIcon className="h-5 w-5" />
							</button>
						</div>

						{/* Main Content Area */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
								<div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20">
									<h3 className="text-lg sm:text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
										<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
											<MusicalNoteIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
										</div>
										Audio File
									</h3>
								</div>
								<div className="p-6">
									<div className="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/30 shadow-inner ring-2 ring-gray-200 dark:ring-gray-700 p-8">
										<div className="flex flex-col items-center justify-center space-y-6">
											<div className="p-8 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full">
												<MusicalNoteIcon className="h-24 w-24 text-purple-600 dark:text-purple-400" />
											</div>
											<div className="w-full">
												<audio
													controls
													className="w-full"
													src={
														uploadedFiles[
															currentIndex
														]
															? URL.createObjectURL(
																	uploadedFiles[
																		currentIndex
																	]
																)
															: ''
													}
												>
													Your browser does not
													support the audio element.
												</audio>
											</div>
											<div className="text-center">
												<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
													{uploadedFiles[currentIndex]
														?.name || 'Audio file'}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
								<div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
									<h3 className="text-lg sm:text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
										<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
											<CheckCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
										</div>
										Prediction Results
									</h3>
								</div>
								<div className="p-6 space-y-6">
									<div
										className={`flex items-start gap-4 p-5 rounded-xl border-2 shadow-lg transition-all duration-300 ${
											incorrectPredictions.includes(
												currentIndex
											)
												? 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-300 dark:border-red-700'
												: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-400 dark:border-green-600'
										}`}
									>
										<div
											className={`p-2 rounded-lg ${
												incorrectPredictions.includes(
													currentIndex
												)
													? 'bg-red-100 dark:bg-red-900/30'
													: 'bg-green-100 dark:bg-green-900/30'
											}`}
										>
											{incorrectPredictions.includes(
												currentIndex
											) ? (
												<XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
											) : (
												<CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
											)}
										</div>
										<div className="flex-1">
											<p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
												Predicted Class:
											</p>
											<p
												className={`text-2xl sm:text-3xl font-bold uppercase ${
													incorrectPredictions.includes(
														currentIndex
													)
														? 'text-red-600 dark:text-red-400'
														: 'text-green-600 dark:text-green-400'
												}`}
											>
												{currentPrediction.class}
											</p>
										</div>
									</div>

									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
												Confidence Score
											</h4>
											<span className="text-xl sm:text-3xl font-bold px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 rounded-xl shadow-md border border-blue-200 dark:border-blue-700">
												{Math.round(
													currentPrediction.confidence *
														100
												)}
												%
											</span>
										</div>

										<div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
											<div
												className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700 ease-out relative overflow-hidden"
												style={{
													width: `${Math.round(currentPrediction.confidence * 100)}%`,
												}}
											>
												<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
											</div>
										</div>

										<div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
											<span>Low</span>
											<span>Medium</span>
											<span>High</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
							<div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
								<h3 className="text-lg sm:text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
									<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
										<MusicalNoteIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
									</div>
									Audio Gallery
								</h3>
							</div>
							<div className="p-6">{renderThumbnails()}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AudioClassificationDemo
