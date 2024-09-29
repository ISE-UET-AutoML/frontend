import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { Button } from 'antd'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import TextArea from 'antd/es/input/TextArea'
import DropDown from './DropDown'

const MultimodalUploadPreview = ({
	file,
	index,
	handleRemoveFile,
	setPreviewData,
}) => {
	const [csvData, setCsvData] = useState([])
	const [error, setError] = useState(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [inputPage, setInputPage] = useState('')
	const [isDropdownRadioOpen, setIsDropdownRadioOpen] = useState(false)
	const [isDropdownCheckboxOpen, setIsDropdownCheckboxOpen] = useState(false)
	const [selectedRadio, setSelectedRadio] = useState('Target Column')
	const itemsPerPage = 5

	const [dataFeature, setDataFeature] = useState([])
	const [isLocked, setIsLocked] = useState(false)

	useEffect(() => {
		if (file && file.name.endsWith('.csv')) {
			const reader = new FileReader()

			reader.onload = () => {
				Papa.parse(reader.result, {
					header: true,
					skipEmptyLines: true,
					complete: (result) => {
						const resultData = result.data.map((el, index) => {
							return { id: index, ...el }
						})
						setCsvData(resultData)

						setDataFeature(
							Object.keys(resultData[0]).map((el) => {
								return { value: el, isActived: true }
							})
						)
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

	const toggleDropdown = (type) => {
		if (type === 'radio') {
			setIsDropdownRadioOpen(!isDropdownRadioOpen)
		} else if (type === 'checkbox') {
			setIsDropdownCheckboxOpen(!isDropdownCheckboxOpen)
		}
	}

	const isDropdownOpen = (type) => {
		if (type === 'radio') return isDropdownRadioOpen
		if (type === 'checkbox') return isDropdownCheckboxOpen
		return false
	}

	const handleRadioChange = (event) => {
		const value = event.target.value
		setSelectedRadio(value)
		setPreviewData((prevData) => ({
			...prevData,
			label_column: value,
		}))
		setIsDropdownRadioOpen(false)
	}

	const handleCheckboxChange = (el) => {
		setDataFeature(
			dataFeature.map((feature) => {
				if (feature.value === el.value)
					feature.isActived = !el.isActived
				return feature
			})
		)
		console.log(el)
		console.log(dataFeature)
	}

	const handleChange = (event, el, type) => {
		if (type === 'radio') handleRadioChange(event)
		if (type === 'checkbox') handleCheckboxChange(el)
	}

	const handleEdit = (id, field, value) => {
		console.log(id + ' ' + field + ' ' + value)
		const newCsvData = csvData.map((item) =>
			item.id === id ? { ...item, [field]: value } : item
		)
		console.log(newCsvData)
		setCsvData(newCsvData)
	}

	const handleLockToggle = () => {
		setIsLocked(!isLocked)

		if (!isLocked) {
			console.log('Data is locked')
		} else {
			console.log('Data is unlocked')
		}
	}

	return (
		<div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 mb-4">
			<div className="flex justify-between items-center mb-2">
				<h3 className="text-lg font-semibold text-gray-800">
					{file.name}
				</h3>
				{/* <div className="relative flex items-center">
					<h1 className="mr-4">Target Column</h1>
					<div>
						<button
							onClick={() => toggleDropdown('radio')}
							className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-2 py-1 text-center inline-flex items-center "
							type="button"
						>
							{selectedRadio}{' '}
							<svg
								className={`w-2.5 h-2.5 ms-3 transform transition-transform duration-500 ${
									isDropdownOpen('radio')
										? 'rotate-180'
										: 'rotate-0'
								}`}
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 10 6"
							>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="m1 1 4 4 4-4"
								/>
							</svg>
						</button>

						<div
							id="dropdownRadioBgHover"
							className={`z-10 ${
								isDropdownOpen('radio') ? '' : 'hidden'
							} absolute z-10 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow mt-2`}
						>
							<ul
								className="p-3 space-y-1 text-sm text-blue-700 "
								aria-labelledby="dropdownRadioBgHoverButton"
							>
								{csvData.length > 0 &&
									dataFeature.map((el) => {
										if (el.isActived)
											return (
												<li key={el.value}>
													<div className="flex items-center p-2 rounded hover:bg-gray-100">
														<input
															id={
																'radio' +
																el.value
															}
															type="radio"
															value={el.value}
															name="target-column"
															onChange={(event) =>
																handleChange(
																	event,
																	el,
																	'radio'
																)
															}
															className="w-4 h-4 text-blue-600 bg-blue-100 border-blue-300"
														/>
														<label
															htmlFor={
																'radio' +
																el.value
															}
															className="w-full ms-2 text-sm font-medium text-gray-900 rounded"
														>
															{el.value}
														</label>
													</div>
												</li>
											)
										return <></>
									})}
							</ul>
						</div>
					</div>
				</div>  */}

				<DropDown
					csvData={csvData}
					dataFeature={dataFeature}
					toggleDropdown={toggleDropdown}
					isDropdownOpen={isDropdownOpen}
					handleChange={handleChange}
					selectedRadio={selectedRadio}
					type="radio"
				/>

				<DropDown
					csvData={csvData}
					dataFeature={dataFeature}
					toggleDropdown={toggleDropdown}
					isDropdownOpen={isDropdownOpen}
					handleChange={handleChange}
					selectedRadio={selectedRadio}
					type={'checkbox'}
				/>

				<Button
					type="primary"
					icon={isLocked ? <LockOutlined /> : <UnlockOutlined />}
					onClick={handleLockToggle}
				>
					{isLocked ? 'Unlock' : 'Lock'}
				</Button>

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
									{dataFeature.map((el) => {
										if (!el.isActived) return <></>
										return (
											<th
												key={el.value}
												className="px-7 py-3 text-center text-xs font-bold text-black uppercase tracking-wider"
											>
												{el.value}
											</th>
										)
									})}
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{currentItems.map((row, rowIndex) => (
									<tr
										key={rowIndex}
										className="hover:bg-gray-100"
									>
										{Object.values(row).map(
											(value, colIndex) => {
												if (
													!dataFeature[colIndex]
														.isActived
												)
													return <></>
												return (
													<td
														key={colIndex}
														className="text-sm text-gray-700 break-words text-center align-middle"
													>
														{isLocked ? (
															<div className="px-3 py-2.5">
																{value}
															</div>
														) : (
															<TextArea
																autoSize={{
																	minRows: 1,
																	maxRows: 10,
																}}
																className="m-0 py-2 w-full text-center border-none"
																type={
																	dataFeature[
																		colIndex
																	].value
																}
																value={value}
																onChange={(e) =>
																	handleEdit(
																		rowIndex,
																		dataFeature[
																			colIndex
																		].value,
																		e.target
																			.value
																	)
																}
															/>
														)}
													</td>
												)
											}
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

export default MultimodalUploadPreview
