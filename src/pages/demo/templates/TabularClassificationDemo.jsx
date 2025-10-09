'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
	CheckCircleIcon,
	XCircleIcon,
	TrashIcon,
	ArrowPathIcon,
	DocumentTextIcon,
	AdjustmentsHorizontalIcon,
	ArrowDownTrayIcon,
	ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'
import * as modelServiceAPI from 'src/api/model'

const TabularClassificationDemo = ({ metadata }) => {
	const [csvData, setCsvData] = useState([])
	const [uploadedFile, setUploadedFile] = useState(null)
	const fileInputRef = useRef(null)

	const [finalTable, setFinalTable] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [visibleColumns, setVisibleColumns] = useState([])
	const [showColumnDrawer, setShowColumnDrawer] = useState(false)

	const pageSize = 10

	const predictedColumnName =
		metadata?.modelInfo?.metadata?.label_column || 'Predicted Class'

	useEffect(() => {
		if (showColumnDrawer) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [showColumnDrawer])

	const getReadableLabels = (prediction) => {
		const classResult = prediction.class
		const labelNames = prediction.label
		let readableLabels = []

		if (Array.isArray(classResult) && Array.isArray(labelNames)) {
			readableLabels = classResult
				.map((value, idx) => {
					if (!labelNames[idx]) return null

					if (typeof value === 'number') {
						return value > 0 ? labelNames[idx] : null
					}

					if (typeof value === 'boolean') {
						return value ? labelNames[idx] : null
					}

					if (typeof value === 'string') {
						return value !== '0' ? labelNames[idx] : null
					}

					return null
				})
				.filter(Boolean)
		} else if (
			typeof classResult === 'string' &&
			classResult.trim().length > 0
		) {
			readableLabels = [classResult]
		} else if (
			classResult &&
			typeof classResult === 'object' &&
			!Array.isArray(classResult)
		) {
			readableLabels = Object.entries(classResult)
				.filter(([, value]) => Boolean(value))
				.map(([label]) => label)
		}

		return readableLabels
	}

	const buildDisplayLabel = (prediction) => {
		const readableLabels = getReadableLabels(prediction)

		if (readableLabels.length > 0) {
			return {
				...prediction,
				readableLabels,
				displayLabel: readableLabels.join(', '),
			}
		}

		// Handle numeric class values
		if (typeof prediction.class === 'number') {
			return {
				...prediction,
				readableLabels,
				displayLabel: String(prediction.class),
			}
		}

		// Handle string class values
		if (typeof prediction.class === 'string') {
			return {
				...prediction,
				readableLabels,
				displayLabel: prediction.class,
			}
		}

		if (Array.isArray(prediction.label) && prediction.label.length > 0) {
			return {
				...prediction,
				readableLabels,
				displayLabel: 'No labels predicted',
			}
		}

		return {
			...prediction,
			readableLabels,
			displayLabel: 'Unknown',
		}
	}

	const parseCSV = (text) => {
		// Normalize line endings and trim
		const normalizedText = text
			.replace(/\r\n/g, '\n')
			.replace(/\r/g, '\n')
			.trim()
		if (!normalizedText) return []

		// Split CSV properly handling quoted fields
		const parseCSVLine = (line) => {
			const result = []
			let current = ''
			let inQuotes = false

			for (let i = 0; i < line.length; i++) {
				const char = line[i]
				const nextChar = line[i + 1]

				if (char === '"') {
					if (inQuotes && nextChar === '"') {
						// Escaped quote
						current += '"'
						i++
					} else {
						// Toggle quote state
						inQuotes = !inQuotes
					}
				} else if (char === ',' && !inQuotes) {
					// Field separator
					result.push(current.trim())
					current = ''
				} else {
					current += char
				}
			}
			result.push(current.trim())
			return result
		}

		const lines = normalizedText.split('\n').filter((line) => line.trim())
		if (lines.length === 0) return []

		const headers = parseCSVLine(lines[0])
		const rows = []

		for (let i = 1; i < lines.length; i++) {
			const values = parseCSVLine(lines[i])
			if (values.length === headers.length) {
				const row = {}
				headers.forEach((header, idx) => {
					row[header] = values[idx]
				})
				rows.push(row)
			}
		}

		return rows
	}

	const handleFileUpload = async (event) => {
		const file = event.target.files?.[0]
		if (!file) return

		if (!file.name.endsWith('.csv')) {
			setError('Please upload a CSV file')
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			// Step 1: Read and parse the CSV file (upload)
			const fileText = await file.text()
			const parsedData = parseCSV(fileText)

			if (parsedData.length === 0) {
				throw new Error('CSV file is empty or invalid')
			}

			// Set CSV data and uploaded file state
			setCsvData(parsedData)
			setUploadedFile(file)

			// Step 2: Fetch prediction results
			const formData = new FormData()
			formData.append('file', file)
			formData.append('api_base_url', metadata.apiUrl)

			const response = await modelServiceAPI.predictGenUI(formData)

			console.log('File upload response:', response)

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
			} else {
				console.warn('Unexpected response format:', data)
				predictions = []
			}

			const enhancedPredictions = predictions.map((prediction) =>
				buildDisplayLabel(prediction)
			)

			// Step 3: Merge original CSV data with prediction results
			const mergedTable = parsedData.map((row, index) => {
				const prediction = enhancedPredictions[index] || {}
				return {
					...row, // Original CSV columns
					[predictedColumnName]: prediction.displayLabel || '-',
					Confidence:
						prediction.confidence !== undefined
							? prediction.confidence
							: null,
					_predictionData: prediction, // Store full prediction for rendering
				}
			})

			// Step 4: Set final table
			setFinalTable(mergedTable)

			// Initialize visible columns with all columns from merged table
			const csvColumns = Object.keys(parsedData[0])
			setVisibleColumns([
				...csvColumns,
				predictedColumnName,
				'Confidence',
			])

			setCurrentPage(1)
		} catch (err) {
			const errorMsg =
				err instanceof Error ? err.message : 'Failed to process file'
			setError(errorMsg)
			console.error('File upload error:', err)
		} finally {
			setIsLoading(false)
		}
	}

	// Clear all inputs and predictions
	const handleClearAll = () => {
		setCsvData([])
		setFinalTable([])
		setUploadedFile(null)
		setError(null)
		setCurrentPage(1)
		setVisibleColumns([])
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	// Handle download functionality
	const handleDownload = () => {
		if (!finalTable.length) return

		const headers = []
		// Get original CSV columns (exclude internal fields)
		const csvColumns = Object.keys(finalTable[0]).filter(
			(col) =>
				col !== '_predictionData' &&
				col !== predictedColumnName &&
				col !== 'Confidence'
		)

		csvColumns.forEach((col) => {
			if (visibleColumns.includes(col)) headers.push(col)
		})
		if (visibleColumns.includes(predictedColumnName))
			headers.push(predictedColumnName)
		if (visibleColumns.includes('Confidence')) headers.push('Confidence')

		const csvContent = [
			headers.join(','),
			...finalTable.map((row) => {
				const values = []
				csvColumns.forEach((col) => {
					if (visibleColumns.includes(col)) {
						values.push(
							`"${String(row[col] || '').replace(/"/g, '""')}"`
						)
					}
				})

				if (visibleColumns.includes(predictedColumnName)) {
					values.push(`"${row[predictedColumnName] || '-'}"`)
				}
				if (visibleColumns.includes('Confidence')) {
					values.push(
						row.Confidence !== null
							? (row.Confidence * 100).toFixed(2)
							: '-'
					)
				}

				return values.join(',')
			}),
		].join('\n')

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		const url = URL.createObjectURL(blob)
		link.setAttribute('href', url)
		link.setAttribute(
			'download',
			`predictions_${new Date().toISOString().split('T')[0]}.csv`
		)
		link.style.visibility = 'hidden'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	const handleColumnToggle = (column) => {
		setVisibleColumns((prev) =>
			prev.includes(column)
				? prev.filter((col) => col !== column)
				: [...prev, column]
		)
	}

	const truncateText = (text, maxLength = 50) => {
		if (!text || typeof text !== 'string') return text
		return text.length > maxLength
			? text.substring(0, maxLength) + '...'
			: text
	}

	const displayData = useMemo(() => {
		const start = (currentPage - 1) * pageSize
		const pageItems = finalTable.slice(start, start + pageSize)
		return pageItems
	}, [finalTable, currentPage])

	const totalPages = Math.ceil(finalTable.length / pageSize)

	const allColumns = useMemo(() => {
		if (finalTable.length === 0) return []
		const allKeys = Object.keys(finalTable[0]).filter(
			(col) => col !== '_predictionData' // Exclude internal fields
		)
		return allKeys
	}, [finalTable])

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 py-6 sm:py-8">
			<div className="mx-auto px-4 sm:px-6">
				{/* Header */}
				<div className="text-center space-y-3 mb-8">
					<h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
						{metadata.projectName}
					</h1>
					<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						{metadata.projectDescription || metadata.description}
					</p>
				</div>

				<div className="">
					<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden mb-8">
						<div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-blue-900/30">
							<h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
									<DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
								</div>
								Upload File
							</h2>
						</div>
						<div className="p-6 space-y-4">
							<div className="space-y-4">
								<input
									ref={fileInputRef}
									type="file"
									accept=".csv"
									onChange={handleFileUpload}
									className="hidden"
									disabled={isLoading}
								/>

								<div
									onClick={() =>
										fileInputRef.current?.click()
									}
									className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300"
								>
									<ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
									<p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
										{uploadedFile
											? uploadedFile.name
											: 'Click to upload CSV file'}
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Upload a CSV file to classify multiple
										rows at once
									</p>
								</div>

								<div className="flex gap-3">
									<button
										onClick={() =>
											fileInputRef.current?.click()
										}
										disabled={isLoading}
										className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
									>
										{isLoading ? (
											<>
												<ArrowPathIcon className="h-5 w-5 animate-spin" />
												Processing...
											</>
										) : (
											<>
												<ArrowUpTrayIcon className="h-5 w-5" />
												{uploadedFile
													? 'Upload New File'
													: 'Upload File'}
											</>
										)}
									</button>
									{csvData.length > 0 && (
										<button
											type="button"
											onClick={handleClearAll}
											className="px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
										>
											<TrashIcon className="h-5 w-5" />
										</button>
									)}
								</div>
							</div>

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

					{finalTable.length > 0 ? (
						<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-gray-800/50 dark:to-purple-900/30">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
										<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
											<CheckCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
										</div>
										Prediction Results
										<span className="text-sm font-normal px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
											{finalTable.length} rows
										</span>
									</h2>
									<div className="flex gap-2">
										<button
											onClick={() =>
												setShowColumnDrawer(
													!showColumnDrawer
												)
											}
											className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 flex items-center gap-2"
										>
											<AdjustmentsHorizontalIcon className="h-5 w-5" />
											<span className="hidden sm:inline">
												Columns
											</span>
										</button>
										<button
											onClick={handleDownload}
											className="px-4 py-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg transition-all duration-300 flex items-center gap-2"
										>
											<ArrowDownTrayIcon className="h-5 w-5" />
											<span className="hidden sm:inline">
												Download
											</span>
										</button>
									</div>
								</div>
							</div>

							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
										<tr>
											<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wider w-20 sticky left-0 bg-gray-50 dark:bg-gray-900 z-[110]">
												#
											</th>
											{finalTable.length > 0 &&
												Object.keys(finalTable[0])
													.filter(
														(col) =>
															col !==
															'_predictionData'
													)
													.map((column) => {
														// Skip predicted column and Confidence - they'll be added separately
														if (
															column ===
																predictedColumnName ||
															column ===
																'Confidence'
														) {
															return null
														}

														return visibleColumns.includes(
															column
														) ? (
															<th
																key={column}
																className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wider"
																style={{
																	minWidth:
																		'250px',
																}}
															>
																{column}
															</th>
														) : null
													})}
											{visibleColumns.includes(
												predictedColumnName
											) && (
												<th
													className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wider min-w-[144px] max-w-[144px] sticky bg-gray-50 dark:bg-gray-900 z-[110] border-gray-300 dark:border-gray-600"
													style={{
														right: visibleColumns.includes(
															'Confidence'
														)
															? '144px'
															: '0',
													}}
												>
													{predictedColumnName}
												</th>
											)}
											{visibleColumns.includes(
												'Confidence'
											) && (
												<th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wider min-w-[144px] max-w-[144px] sticky right-0 bg-gray-50 dark:bg-gray-900 z-[110] border-gray-300 dark:border-gray-600">
													Confidence
												</th>
											)}
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
										{displayData.map((row, idx) => {
											const globalIndex =
												(currentPage - 1) * pageSize +
												idx
											const prediction =
												row._predictionData

											return (
												<tr
													key={globalIndex}
													className="group/row hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
												>
													<td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 group-hover/row:bg-gray-50 dark:group-hover/row:bg-gray-800 z-[110] transition-colors">
														{globalIndex + 1}
													</td>
													{Object.entries(row)
														.filter(
															([column]) =>
																column !==
																	'_predictionData' &&
																column !==
																	predictedColumnName &&
																column !==
																	'Confidence'
														)
														.map(
															([
																column,
																value,
															]) => {
																const stringValue =
																	String(
																		value
																	)
																const isTruncated =
																	stringValue.length >
																	50

																return visibleColumns.includes(
																	column
																) ? (
																	<td
																		key={
																			column
																		}
																		className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap group/cell relative"
																		style={{
																			maxWidth:
																				'250px',
																		}}
																	>
																		<span
																			className="block overflow-hidden text-ellipsis"
																			title={
																				isTruncated
																					? stringValue
																					: undefined
																			}
																		>
																			{truncateText(
																				stringValue
																			)}
																		</span>
																		{isTruncated && (
																			<div className="hidden group-hover/cell:block absolute left-0 top-full mt-1 z-[100] bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-md whitespace-normal break-words pointer-events-none">
																				{
																					stringValue
																				}
																				<div className="absolute bottom-full left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
																			</div>
																		)}
																	</td>
																) : null
															}
														)}
													{visibleColumns.includes(
														predictedColumnName
													) && (
														<td
															className="px-6 py-4 sticky bg-white dark:bg-gray-800 group-hover/row:bg-gray-50 dark:group-hover/row:bg-gray-800 z-[110] border-gray-300 dark:border-gray-600 min-w-[144px] max-w-[144px] transition-colors"
															style={{
																right: visibleColumns.includes(
																	'Confidence'
																)
																	? '144px'
																	: '0',
															}}
														>
															<div className="flex items-center justify-center group/predicted relative">
																{prediction
																	?.readableLabels
																	?.length >
																0 ? (
																	<div className="flex flex-wrap gap-2 justify-center">
																		{prediction.readableLabels.map(
																			(
																				label
																			) => {
																				const isLabelLong =
																					label.length >
																					15
																				return (
																					<div
																						key={
																							label
																						}
																						className="relative inline-block group/label"
																					>
																						<span
																							className="text-xs font-semibold px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 inline-block overflow-hidden text-ellipsis max-w-[140px] whitespace-nowrap"
																							title={
																								label
																							}
																						>
																							{
																								label
																							}
																						</span>
																						{isLabelLong && (
																							<div className="invisible group-hover/label:visible absolute left-0 top-full mt-1 z-[100] bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-max max-w-md whitespace-normal break-words">
																								{
																									label
																								}
																								<div className="absolute bottom-full left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
																							</div>
																						)}
																					</div>
																				)
																			}
																		)}
																	</div>
																) : (
																	<div className="relative inline-block">
																		<span className="text-sm font-semibold px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 inline-block overflow-hidden text-ellipsis max-w-[160px] whitespace-nowrap">
																			{row[
																				predictedColumnName
																			] ||
																				'-'}
																		</span>
																		{row[
																			predictedColumnName
																		] &&
																			row[
																				predictedColumnName
																			]
																				.length >
																				20 && (
																				<div className="invisible group-hover/predicted:visible absolute left-0 top-full mt-1 z-[100] bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-md whitespace-normal break-words">
																					{
																						row[
																							predictedColumnName
																						]
																					}
																					<div className="absolute bottom-full left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
																				</div>
																			)}
																	</div>
																)}
															</div>
														</td>
													)}
													{visibleColumns.includes(
														'Confidence'
													) && (
														<td className="px-6 py-4 sticky right-0 bg-white dark:bg-gray-800 group-hover/row:bg-gray-50 dark:group-hover/row:bg-gray-800 z-[110] border-gray-300 dark:border-gray-600 min-w-[144px] max-w-[144px] transition-colors">
															<div className="flex items-center justify-center whitespace-nowrap">
																<span className="text-sm font-bold text-blue-600 dark:text-blue-400">
																	{row.Confidence !==
																	null
																		? Math.round(
																				row.Confidence *
																					100
																			)
																		: '-'}
																	%
																</span>
															</div>
														</td>
													)}
												</tr>
											)
										})}
									</tbody>
								</table>
							</div>

							{totalPages > 1 && (
								<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
									<div className="text-sm text-gray-600 dark:text-gray-400">
										Showing{' '}
										{(currentPage - 1) * pageSize + 1} to{' '}
										{Math.min(
											currentPage * pageSize,
											finalTable.length
										)}{' '}
										of {finalTable.length} rows
									</div>
									<div className="flex gap-2">
										<button
											onClick={() =>
												setCurrentPage((prev) =>
													Math.max(1, prev - 1)
												)
											}
											disabled={currentPage === 1}
											className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
										>
											Previous
										</button>
										<div className="flex items-center gap-1">
											{Array.from(
												{
													length: Math.min(
														totalPages,
														5
													),
												},
												(_, i) => {
													let page
													if (totalPages <= 5) {
														page = i + 1
													} else if (
														currentPage <= 3
													) {
														page = i + 1
													} else if (
														currentPage >=
														totalPages - 2
													) {
														page =
															totalPages - 4 + i
													} else {
														page =
															currentPage - 2 + i
													}
													return (
														<button
															key={page}
															onClick={() =>
																setCurrentPage(
																	page
																)
															}
															className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
																currentPage ===
																page
																	? 'bg-blue-600 text-white'
																	: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
															}`}
														>
															{page}
														</button>
													)
												}
											)}
										</div>
										<button
											onClick={() =>
												setCurrentPage((prev) =>
													Math.min(
														totalPages,
														prev + 1
													)
												)
											}
											disabled={
												currentPage === totalPages
											}
											className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
										>
											Next
										</button>
									</div>
								</div>
							)}
						</div>
					) : null}

					{showColumnDrawer && (
						<div className="fixed inset-0 z-50 overflow-hidden">
							<div
								className="absolute inset-0 bg-black/50"
								onClick={() => setShowColumnDrawer(false)}
							/>
							<div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
								<div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
									<h3 className="text-lg font-bold text-gray-900 dark:text-white">
										Column Visibility
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
										Select which columns to display
									</p>
								</div>
								<div className="flex-1 overflow-y-auto p-6 space-y-4">
									{allColumns.map((column) => (
										<div
											key={column}
											className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
										>
											<div className="flex items-center gap-3">
												<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
													{column}
												</span>
												{(column ===
													predictedColumnName ||
													column ===
														'Confidence') && (
													<span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
														Prediction
													</span>
												)}
											</div>
											<button
												onClick={() =>
													handleColumnToggle(column)
												}
												className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
													visibleColumns.includes(
														column
													)
														? 'bg-blue-600'
														: 'bg-gray-300 dark:bg-gray-600'
												}`}
											>
												<span
													className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
														visibleColumns.includes(
															column
														)
															? 'translate-x-6'
															: 'translate-x-1'
													}`}
												/>
											</button>
										</div>
									))}
								</div>
								<div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
									<button
										onClick={() =>
											setShowColumnDrawer(false)
										}
										className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300"
									>
										Close
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default TabularClassificationDemo
