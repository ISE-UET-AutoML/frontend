import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
import instance from 'src/api/axios'

const TextPreview = ({ file, index, handleRemoveFile }) => {
	const [csvData, setCsvData] = useState([])
	const [error, setError] = useState(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [inputPage, setInputPage] = useState('')
	const itemsPerPage = 10

	useEffect(async () => {
		if (file && typeof file === 'string') {
			// Fetch the CSV file from the URL
			const { data } = await instance.get(file, {
				method: 'GET',
				headers: {
					'Access-Control-Allow-Origin': 'localhost:3000',
					'Access-Control-Allow-Credentials': true,
					'Content-Type': 'text/csv',
				},
			})
			console.log(data)
			// .then((response) => {
			// 	if (!response.ok) {
			// 		throw new Error('Network response was not ok')
			// 	}
			// 	console.log(response.text)
			// 	return response.text()
			// })
			// .then((text) => {
			// 	console.log(text)
			// 	Papa.parse(text, {
			// 		header: true,
			// 		skipEmptyLines: true,
			// 		complete: (result) => {
			// 			setCsvData(result.data)
			// 		},
			// 		error: (err) => {
			// 			setError(err.message)
			// 		},
			// 	})
			// })
			// .catch((err) => {
			// 	setError(err.message)
			// })
		} else if (file && file.name.endsWith('.csv')) {
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
	}, [file])

	// Tính toán các hàng cần hiển thị cho trang hiện tại
	const indexOfLastItem = currentPage * itemsPerPage
	const indexOfFirstItem = indexOfLastItem - itemsPerPage
	const currentItems = csvData.slice(indexOfFirstItem, indexOfLastItem)

	// Tính toán số trang
	const totalPages = Math.ceil(csvData.length / itemsPerPage)

	const handlePageChange = (pageNumber) => {
		if (pageNumber >= 1 && pageNumber <= totalPages) {
			setCurrentPage(pageNumber)
			setInputPage('') // Clear input when page is changed
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
				{/* <h3 className="text-lg font-semibold text-gray-800">
					{file.name}
				</h3> */}
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
					<div className="overflow-x-auto mb-4">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									{Object.keys(csvData[0]).map((key) => (
										<th
											key={key}
											className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											{key}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{currentItems.map((row, rowIndex) => (
									<tr key={rowIndex}>
										{Object.values(row).map(
											(value, colIndex) => (
												<td
													key={colIndex}
													className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap"
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
					<div className="flex justify-between items-center">
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							className="bg-gray-300 text-gray-700 rounded px-3 py-1 text-sm hover:bg-gray-400 disabled:opacity-50"
							disabled={currentPage === 1}
						>
							Previous
						</button>
						<span className="text-sm text-gray-700">
							<form className="flex items-center space-x-2">
								<span>Page</span>
								<input
									type="number"
									value={inputPage}
									onChange={handleInputChange}
									onKeyDown={handleKeyDown}
									className="border border-gray-300 rounded px-3 py-1 text-sm w-14 mr-2"
									placeholder={currentPage}
									min="1"
									max={totalPages}
									place
								/>
								<span>of {totalPages}</span>
							</form>
						</span>
						<button
							onClick={() => handlePageChange(currentPage + 1)}
							className="bg-gray-300 text-gray-700 rounded px-3 py-1 text-sm hover:bg-gray-400 disabled:opacity-50"
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

export default TextPreview
