'use client'

import { useState, useEffect } from 'react'
import {
	CheckCircleIcon,
	XCircleIcon,
	TrashIcon,
	PaperAirplaneIcon,
	ArrowPathIcon,
	DocumentTextIcon,
	SparklesIcon,
	ClockIcon,
} from '@heroicons/react/24/outline'
import * as modelServiceAPI from 'src/api/model'

const MultilabelTextClassificationDemo = ({ metadata }) => {
	const [currentIndex, setCurrentIndex] = useState(null)
	const [incorrectPredictions, setIncorrectPredictions] = useState([])
	const [textInputs, setTextInputs] = useState([])
	const [predictResult, setPredictResult] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)
	const [currentText, setCurrentText] = useState('')

	const currentPrediction =
		currentIndex !== null && predictResult[currentIndex]
			? predictResult[currentIndex]
			: null

	// Helper function to convert text to CSV file
	const textToCSV = (text) => {
		// Escape quotes in the text and wrap in quotes if needed
		const escapedText = text.replace(/"/g, '""')
		const csvContent = `text\n"${escapedText}"`
		return csvContent
	}

	// API call to predict text
	const predictText = async (text) => {
		setIsLoading(true)
		setError(null)

		try {
			console.log('Sending request to API with text:', text)

			// Create CSV content
			const csvContent = textToCSV(text)

			// Create a Blob from the CSV content
			const blob = new Blob([csvContent], { type: 'text/csv' })

			// Create FormData and append the file
			const formData = new FormData()
			formData.append('file', blob, 'input.csv')
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

			// Extract predictions from response
			let predictions
			if (data.predictions && Array.isArray(data.predictions)) {
				predictions = data.predictions
			} else if (data.class && data.confidence !== undefined) {
				// Single prediction format
				predictions = [
					{ class: data.class, confidence: data.confidence },
				]
			} else {
				console.warn('Unexpected response format:', data)
				predictions = [{ class: 'Unknown', confidence: 0 }]
			}

			setTextInputs((prev) => [...prev, text])
			setPredictResult((prev) =>
				prev ? [...prev, ...predictions] : predictions
			)
			setCurrentText('')
			setCurrentIndex(textInputs.length)
		} catch (err) {
			const errorMsg =
				err instanceof Error ? err.message : 'Failed to predict text'
			setError(errorMsg)
			console.error('Prediction error:', err)
		} finally {
			setIsLoading(false)
		}
	}

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault()
		if (currentText.trim()) {
			predictText(currentText.trim())
		}
	}

	// Clear all inputs and predictions
	const handleClearAll = () => {
		setTextInputs([])
		setPredictResult([])
		setIncorrectPredictions([])
		setCurrentIndex(null)
		setCurrentText('')
		setError(null)
	}

	useEffect(() => {
		const initialIncorrect = predictResult
			.map((result, idx) => (result.confidence < 0.5 ? idx : null))
			.filter((idx) => idx !== null)
		setIncorrectPredictions(initialIncorrect)
	}, [predictResult])

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 py-6 sm:py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6">
				{/* Header */}
				<div className="text-center space-y-3 mb-8">
					<h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
						{metadata.projectName}
					</h1>
					<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						{metadata.projectDescription || metadata.description}
					</p>
				</div>

				{/* Two Column Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* LEFT COLUMN: Input + Examples */}
					<div className="space-y-6">
						{/* Text Input Section */}
						<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-blue-900/30">
								<h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
									<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
										<DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
									</div>
									Text Input
								</h2>
							</div>
							<div className="p-6 space-y-4">
								<form
									onSubmit={handleSubmit}
									className="space-y-4"
								>
									<div className="space-y-2">
										<label
											htmlFor="text-input"
											className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
										>
											Enter your text
										</label>
										<textarea
											id="text-input"
											value={currentText}
											onChange={(e) =>
												setCurrentText(e.target.value)
											}
											placeholder="Type or paste your text here..."
											rows={8}
											className="w-full h-[100px] px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 resize-none"
											disabled={isLoading}
										/>
									</div>
									<div className="flex gap-3">
										<button
											type="submit"
											disabled={
												isLoading || !currentText.trim()
											}
											className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
										>
											{isLoading ? (
												<>
													<ArrowPathIcon className="h-5 w-5 animate-spin" />
													Classifying...
												</>
											) : (
												<>
													<PaperAirplaneIcon className="h-5 w-5" />
													Classify
												</>
											)}
										</button>
										{textInputs.length > 0 && (
											<button
												type="button"
												onClick={handleClearAll}
												className="px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
											>
												<TrashIcon className="h-5 w-5" />
											</button>
										)}
									</div>
								</form>

								{error && (
									<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-md">
										<XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
										<p className="text-sm font-medium text-red-900 dark:text-red-100">
											{error}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Examples Section */}
						<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-gray-800/50 dark:to-green-900/30">
								<h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
									<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
										<SparklesIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
									</div>
									Examples
								</h2>
							</div>
							<div className="p-6 space-y-4">
								{metadata.samples.map((sample, idx) => (
									<div
										key={idx}
										className="flex flex-col gap-3 p-5 bg-gradient-to-br from-gray-50 to-green-50/30 dark:from-gray-900/30 dark:to-green-900/20 rounded-xl border border-gray-200 dark:border-gray-700"
									>
										<div>
											<p className="text-lg text-gray-800 dark:text-gray-200 italic">
												"{sample.sampleData}"
											</p>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-xxl font-semibold text-gray-500 dark:text-gray-400">
												→
											</span>
											<span className="text-base font-bold px-4 py-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-400 dark:border-green-600 text-green-600 dark:text-green-400 rounded-xl shadow-sm">
												{sample.sampleLabel}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* RIGHT COLUMN: Predictions + History */}
					<div className="space-y-6">
						{/* Prediction Results Section */}
						<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-gray-800/50 dark:to-purple-900/30">
								<h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
									<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
										<CheckCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
									</div>
									Prediction
								</h2>
							</div>
							<div className="p-6">
								{currentPrediction && currentIndex !== null ? (
									<div className="space-y-6">
										{/* Prediction Result */}
										<div
											className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-300 ${
												incorrectPredictions.includes(
													currentIndex
												)
													? 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-300 dark:border-red-700'
													: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-400 dark:border-green-600'
											}`}
										>
											<div
												className={`p-2 rounded-xl ${
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
													Label:
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

										{/* Confidence Score */}
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<h4 className="text-lg font-bold text-gray-900 dark:text-white">
													Confidence
												</h4>
												<span className="text-2xl font-bold px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-700">
													{Math.round(
														currentPrediction.confidence *
															100
													)}
													%
												</span>
											</div>

											<div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
												<div
													className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700 ease-out"
													style={{
														width: `${Math.round(currentPrediction.confidence * 100)}%`,
													}}
												/>
											</div>

											<div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
												<span>Low</span>
												<span>Medium</span>
												<span>High</span>
											</div>
										</div>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-12 text-center">
										<div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
											<DocumentTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
										</div>
										<p className="text-gray-500 dark:text-gray-400 font-medium">
											No predictions yet
										</p>
										<p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
											Enter text and click Classify to see
											results
										</p>
									</div>
								)}
							</div>
						</div>

						{/* History Section */}
						<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-gray-800/50 dark:to-orange-900/30">
								<h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
									<div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
										<ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
									</div>
									History
									{textInputs.length > 0 && (
										<span className="ml-auto text-sm font-normal px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
											{textInputs.length}
										</span>
									)}
								</h2>
							</div>
							<div className="p-6">
								{textInputs.length > 0 ? (
									<div className="flex flex-col h-full">
										<div className="space-y-3 p-1 max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 will-change-transform">
											{textInputs.map((text, index) => (
												<div
													key={index}
													onClick={() =>
														setCurrentIndex(index)
													}
													className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
														currentIndex === index
															? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
															: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
													}`}
												>
													<div className="flex items-start gap-3">
														<span className="text-xs font-bold text-gray-400 dark:text-gray-600 mt-0.5">
															{index + 1}.
														</span>
														<div className="flex-1 min-w-0">
															<p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
																{text}
															</p>

															{predictResult[
																index
															] && (
																<div className="flex items-center gap-2">
																	<span className="text-xs font-semibold px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
																		{
																			predictResult[
																				index
																			]
																				.class
																		}
																	</span>
																	<span className="text-xs text-gray-500 dark:text-gray-400">
																		{Math.round(
																			predictResult[
																				index
																			]
																				.confidence *
																				100
																		)}
																		%
																	</span>
																</div>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-12 text-center">
										<div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
											<ClockIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
										</div>
										<p className="text-gray-500 dark:text-gray-400 font-medium">
											No history yet
										</p>
										<p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
											Your classified texts will appear
											here
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MultilabelTextClassificationDemo
