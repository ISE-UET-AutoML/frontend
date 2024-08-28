import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'

const TextUploadPreview = ({ file, index, handleRemoveFile }) => {
	const [csvData, setCsvData] = useState([])
	const [error, setError] = useState(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [inputPage, setInputPage] = useState('')
	const itemsPerPage = 5

	useEffect(() => {
		if (file && file.name.endsWith('.csv')) {
			console.log('oke2')
			const reader = new FileReader()

			reader.onload = () => {
				Papa.parse(reader.result, {
					header: true,
					skipEmptyLines: true,
					complete: (result) => {
						setCsvData(result.data)
					},
					error: (err) => {
						setError(err.message)
					},
				})
			}

			reader.readAsText(file)
		}
		return
	}, [file])

	// Calculate the number of rows in a page
	const indexOfLastItem = currentPage * itemsPerPage
	const indexOfFirstItem = indexOfLastItem - itemsPerPage
	const currentItems = csvData.slice(indexOfFirstItem, indexOfLastItem)

	// Calculate the number of pages
	const totalPages = Math.ceil(csvData.length / itemsPerPage)

	const handlePageChange = (pageNumber) => {
		if (pageNumber >= 1 && pageNumber <= totalPages) {
			setCurrentPage(pageNumber)
			setInputPage('')
		}
	}

	const handleInputChange = (event) => {
		const value = event.target.value
		const numericValue = parseInt(value, 10)
		if (
			!isNaN(numericValue) &&
			numericValue >= 1 &&
			numericValue <= totalPages
		) {
			setInputPage(value)
		}
	}

	const handleInputSubmit = (event) => {
		event.preventDefault()
		const pageNumber = parseInt(inputPage, 10)
		if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
			handlePageChange(pageNumber)
		}
	}

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			handleInputSubmit(event)
		}
	}

	return (
		<div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 mb-4">
			<div className="flex justify-between items-center mb-2">
				<h3 className="text-lg font-semibold text-gray-800">
					{file.name}
				</h3>
				<button
					onClick={() => handleRemoveFile(index)}
					className="bg-red-500 text-white rounded px-2 py-1 text-sm hover:bg-red-600"
				>
					Remove
				</button>
			</div>
			{error && <p className="text-red-500 text-sm">{error}</p>}
			{csvData.length > 0 ? (
				<>
					<div className="overflow-x-auto mb-6 rounded-lg border-2 border-slate-50">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gradient-to-r bg-[#f0f8ff] font-bold">
								<tr>
									{Object.keys(csvData[0]).map((key) => (
										<th
											key={key}
											className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider"
										>
											{key}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{currentItems.map((row, rowIndex) => (
									<tr
										key={rowIndex}
										className="hover:bg-gray-100"
									>
										{Object.values(row).map(
											(value, colIndex) => (
												<td
													key={colIndex}
													className="px-6 py-2.5 text-sm text-gray-700 break-words w-[90%] text-left"
												>
													{value}
												</td>
											)
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="flex justify-between items-center mt-4">
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							className="bg-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={currentPage === 1}
						>
							Previous
						</button>
						<span className="text-sm text-gray-700 flex items-center space-x-2">
							<span>Page</span>
							<form className="flex items-center space-x-2">
								<input
									type="number"
									value={inputPage}
									onChange={handleInputChange}
									onKeyDown={handleKeyDown}
									className="border border-gray-300 rounded-md px-3 py-1 text-sm w-16"
									placeholder={currentPage}
									min="1"
									max={totalPages}
								/>
								<span>of {totalPages}</span>
							</form>
						</span>
						<button
							onClick={() => handlePageChange(currentPage + 1)}
							className="bg-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={currentPage === totalPages}
						>
							Next
						</button>
					</div>
				</>
			) : (
				<p className="text-gray-600 text-sm">No data available</p>
			)}
		</div>
	)
}

export default TextUploadPreview
