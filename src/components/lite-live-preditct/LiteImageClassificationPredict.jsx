'use client'

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Typography, Modal, Layout } from 'antd'
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	LeftOutlined,
	RightOutlined,
	DeleteOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { Content } = Layout

const LiteImageClassificationPredict = ({
	predictResult,
	uploadedFiles,
	projectInfo,
	onClearAll,
}) => {
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experimentName')
	const [currentIndex, setCurrentIndex] = useState(0)
	const [incorrectPredictions, setIncorrectPredictions] = useState([])

	const currentPrediction = predictResult[currentIndex] || {}

	// Thumbnail gallery with enhanced Tailwind styling
	const renderThumbnails = () => (
		<div className="w-full overflow-x-auto py-6">
			<div className="flex gap-3 min-w-max px-2">
				{uploadedFiles.map((data, index) => (
					<div key={index} className="relative group">
						{incorrectPredictions.includes(index) && (
							<div className="absolute -top-2 -right-2 z-10 bg-red-500 rounded-full p-1">
								<CloseCircleOutlined className="text-white text-xs" />
							</div>
						)}
						<div
							className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg ${
								currentIndex === index
									? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
									: 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300'
							}`}
							onClick={() => setCurrentIndex(index)}
						>
							<img
								src={
									URL.createObjectURL(data) ||
									'/placeholder.svg'
								}
								alt={`Thumbnail ${index + 1}`}
								className="w-20 h-20 object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
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
	}, [uploadedFiles?.length])

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<div className="max-w-7xl mx-auto p-6">
				{/* Main Content */}
				<div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
					<div className="p-8 space-y-8">
						{/* Navigation Controls */}
						<div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
							<button
								disabled={currentIndex === 0}
								onClick={() =>
									setCurrentIndex((prev) => prev - 1)
								}
								className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
									currentIndex === 0
										? 'bg-gray-200 text-gray-400 cursor-not-allowed'
										: 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
								}`}
							>
								<LeftOutlined className="text-sm" />
								Previous
							</button>

							<div className="text-center space-y-2">
								<div className="text-2xl font-bold text-gray-800">
									Image {currentIndex + 1} of{' '}
									{uploadedFiles.length}
								</div>
								{onClearAll && (
									<button
										onClick={onClearAll}
										className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
									>
										<DeleteOutlined className="text-sm" />
										Clear All
									</button>
								)}
							</div>

							<button
								disabled={
									currentIndex === uploadedFiles.length - 1
								}
								onClick={() =>
									setCurrentIndex((prev) => prev + 1)
								}
								className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
									currentIndex === uploadedFiles.length - 1
										? 'bg-gray-200 text-gray-400 cursor-not-allowed'
										: 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
								}`}
							>
								Next
								<RightOutlined className="text-sm" />
							</button>
						</div>

						{/* Main Content Area */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{/* Image Display */}
							<div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
								<div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 bg-green-500 rounded-full"></div>
											<h3 className="text-lg font-semibold text-gray-800">
												Original Image
											</h3>
										</div>
									</div>
								</div>

								<div className="p-6 min-w-[400px] min-h-[400px] max-h-[400px]">
									<div className="rounded-lg overflow-hidden bg-gray-50">
										<img
											src={
												URL.createObjectURL(
													uploadedFiles[currentIndex]
												) || '/placeholder.svg'
											}
											alt="Original Image"
											className="w-full h-auto object-cover max-h-96"
										/>
									</div>
								</div>
							</div>

							{/* Prediction Details */}
							<div className="space-y-6">
								<div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
									<div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
										<h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
											<div className="w-3 h-3 bg-purple-500 rounded-full"></div>
											Prediction Results
										</h3>
									</div>

									<div className="p-6 space-y-6">
										{/* Prediction Alert */}
										<div
											className={`rounded-lg p-4 border-l-4 ${
												incorrectPredictions.includes(
													currentIndex
												)
													? 'bg-red-50 border-red-400'
													: 'bg-green-50 border-green-400'
											}`}
										>
											<div className="flex items-center gap-3">
												{incorrectPredictions.includes(
													currentIndex
												) ? (
													<CloseCircleOutlined className="text-red-500 text-xl" />
												) : (
													<CheckCircleOutlined className="text-green-500 text-xl" />
												)}
												<div>
													<p className="text-sm font-medium text-gray-600">
														Predicted Class:
													</p>
													<p
														className={`text-xl font-bold uppercase ${
															incorrectPredictions.includes(
																currentIndex
															)
																? 'text-red-700'
																: 'text-green-700'
														}`}
													>
														{
															currentPrediction.class
														}
													</p>
												</div>
											</div>
										</div>

										{/* Confidence Score */}
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<h4 className="text-lg font-semibold text-gray-800">
													Confidence Score
												</h4>
												<span className="text-2xl font-bold text-gray-800">
													{Math.round(
														currentPrediction.confidence *
															100
													)}
													%
												</span>
											</div>

											<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
												<div
													className={`h-full rounded-full transition-all duration-500 ${
														currentPrediction.confidence >
														0.7
															? 'bg-gradient-to-r from-green-400 to-green-500'
															: currentPrediction.confidence >
																  0.4
																? 'bg-gradient-to-r from-yellow-400 to-orange-500'
																: 'bg-gradient-to-r from-red-400 to-red-500'
													}`}
													style={{
														width: `${Math.round(currentPrediction.confidence * 100)}%`,
													}}
												></div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Thumbnail Gallery */}
						<div className="bg-gray-50 rounded-xl p-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
								<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
								Image Gallery
							</h3>
							{renderThumbnails()}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LiteImageClassificationPredict
