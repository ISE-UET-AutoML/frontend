import React, { useState, useEffect } from 'react'
import 'src/assets/css/chart.css'
import * as experimentAPI from 'src/api/experiment'
import Papa from 'papaparse'

const TabularPredict = ({
	experimentName,
	projectInfo,
	predictDataState,
	updateState,
}) => {
	const [csvData, setCsvData] = useState([])
	const [features, setFeatures] = useState([])
	const [error, setError] = useState(null)
	const [selectedIndexes, setSelectedIndexes] = useState([0])
	const [explanation, setExplanation] = useState(null)
	const [confirmStatus, setConfirmStatus] = useState([]) // New state for confirm status

	useEffect(() => {
		if (
			predictDataState.uploadFiles &&
			predictDataState.uploadFiles[0].name.endsWith('.csv')
		) {
			const reader = new FileReader()

			reader.onload = () => {
				Papa.parse(reader.result, {
					header: true,
					skipEmptyLines: true,
					complete: ({ data }) => {
						setCsvData(data)

						if (data.length > 0) {
							setFeatures(Object.keys(data[0]))
							// Set default confirm status to true for all rows
							setConfirmStatus(new Array(data.length).fill(true))
						}
					},
					error: (err) => setError(err.message),
				})
			}
			reader.readAsText(predictDataState.uploadFiles[0])
		}
	}, [predictDataState.uploadFiles])

	const handleCheckboxChange = (index) => {
		setSelectedIndexes((prev) => {
			if (prev.includes(index)) {
				return prev.filter((i) => i !== index) // Remove index if already selected
			} else {
				return [...prev, index] // Add index to selected
			}
		})
	}

	const handleConfirmChange = (index) => {
		setConfirmStatus(
			(prev) => prev.map((status, i) => (i === index ? !status : status)) // Toggle confirm status for the selected row
		)
	}

	const handleExplain = async (event) => {
		event.preventDefault()

		const formData = new FormData()

		updateState({
			isLoading: true,
		})

		formData.append('data_path', predictDataState.predictFile.url)
		formData.append('row_indexes', selectedIndexes)
		formData.append('task', projectInfo.type)

		console.log('Fetching explain text')

		try {
			const { data } = await experimentAPI.explainData(
				experimentName,
				formData
			)

			console.log('data Explain', data)

			setExplanation(data.explanation)

			console.log('Fetch successful')

			updateState({ isLoading: false })
		} catch (error) {
			console.error('Fetch error:', error.message)
			updateState({ isLoading: false })
		}
	}

	return (
		<div className="w-full h-full">
			{/* HEADER */}
			<div className="flex items-center mb-5">
				<h1 className="mb-5 text-4xl font-extrabold text-gray-900 text-left mt-10 flex">
					<span className="text-transparent bg-clip-text bg-gradient-to-r to-[#1904e5] from-[#fab2ff] mr-2">
						Prediction
					</span>{' '}
					result
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						width="24"
						height="24"
					>
						<path
							fillRule="evenodd"
							d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
							clipRule="evenodd"
						/>
					</svg>
				</h1>

				<button
					type="button"
					onClick={handleExplain}
					className="h-max ml-auto block w-fit relative mt-[2.25rem] p-1 px-5 py-3 overflow-hidden font-medium text-indigo-600 rounded-lg shadow-2xl group"
				>
					<span className="absolute top-0 left-0 w-40 h-40 -mt-10 -ml-3 transition-all duration-700 bg-blue-500 rounded-full blur-md ease"></span>
					<span className="absolute inset-0 w-full h-full transition duration-700 group-hover:rotate-180 ease">
						<span className="absolute bottom-0 left-0 w-24 h-24 -ml-10 bg-purple-500 rounded-full blur-md"></span>
						<span className="absolute bottom-0 right-0 w-24 h-24 -mr-10 bg-pink-500 rounded-full blur-md"></span>
					</span>
					<span className="relative text-white">Explain</span>
				</button>
			</div>

			<div className="grid grid-cols-4 grid-rows-5 gap-4 h-[85%]">
				{/* TABLE */}
				<div className="col-span-4 row-span-3 max-h-96 overflow-y-auto rounded-lg shadow-lg">
					<table className="min-w-full border-collapse table-auto rounded-lg overflow-hidden">
						<thead className="sticky top-0 bg-blue-100 z-10">
							<tr>
								{csvData.length > 0 &&
									features.map((key) => (
										<th
											key={key}
											className="px-2 py-2 text-center"
										>
											{key}
										</th>
									))}
								<th className="px-2 py-2 text-center">Label</th>
								<th className="px-2 py-2 text-center">
									Confidence
								</th>
								<th className="px-2 py-2 text-center">
									Confirm
								</th>
								<th className="px-2 py-2 text-center">
									Explain
								</th>
							</tr>
						</thead>
						<tbody>
							{csvData.map((row, index) => (
								<tr
									key={index}
									className={`hover:bg-gray-100 ${
										!confirmStatus[index]
											? 'bg-red-100' // Row turns red when "false" is selected
											: selectedIndexes.includes(index)
												? 'bg-blue-100 cursor-pointer border-2 border-solid border-blue-500'
												: ''
									}`}
									onClick={() => handleCheckboxChange(index)}
								>
									{Object.values(row).map((value, i) => (
										<td
											key={i}
											className="px-6 py-4 text-sm font-medium text-gray-900 text-center"
										>
											{value}
										</td>
									))}
									<td
										key={`label-${index}`}
										className="px-6 py-4 text-sm font-bold text-[#FF5733] text-center"
									>
										{predictDataState.predictResult[index]
											?.class || 'N/A'}
									</td>
									<td
										key={`confidence-${index}`}
										className="px-6 py-4 text-sm font-bold text-[#FF5733] text-center"
									>
										{predictDataState.predictResult[index]
											?.confidence || 'N/A'}
									</td>
									<td className="px-6 py-4 text-center">
										<select
											value={
												confirmStatus[index]
													? 'true'
													: 'false'
											}
											onChange={() =>
												handleConfirmChange(index)
											}
											className={`border-none focus:border-none ${!confirmStatus[index] ? 'bg-red-100' : selectedIndexes.includes(index) ? 'bg-blue-100' : ''}`}
										>
											<option value="true">True</option>
											<option value="false">False</option>
										</select>
									</td>
									<td className="px-6 py-4 text-center">
										<input
											type="checkbox"
											onChange={() =>
												handleCheckboxChange(index)
											}
											checked={selectedIndexes.includes(
												index
											)}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

export default TabularPredict
