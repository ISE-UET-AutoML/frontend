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
	setEditedData,
	setIsLockedFlag,
	dataFeature,
	setDataFeature,
}) => {
	const [csvData, setCsvData] = useState([])
	const [error, setError] = useState(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [inputPage, setInputPage] = useState('')
	const [isDropdownRadioOpen, setIsDropdownRadioOpen] = useState(false)
	const [isDropdownCheckboxOpen, setIsDropdownCheckboxOpen] = useState(false)

	const [targetColumn, setTargetColumn] = useState('Label Feature')
	const [imgColumn, setImgColumn] = useState('Image Column')
	const itemsPerPage = 5

	// const [dataFeature, setDataFeature] = useState([])

	const [featureTypes, setFeatureTypes] = useState(['string', 'image url'])

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

						setEditedData(resultData.map(({ id, ...rest }) => rest))

						setDataFeature(
							Object.keys(resultData[0]).map((el) => {
								let featureType = 'string'
								if (
									typeof resultData[0][el] === 'string' &&
									(resultData[0][el].match('https://') ||
										resultData[0][el].match('http://'))
								)
									featureType = 'image url'
								return {
									value: el,
									isActivated: true,
									isLabel: false,
									type: featureType,
								}
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

	const updatePreviewData = () => {
		const imageFeatures = dataFeature
			.filter(
				(feature) =>
					feature.isActivated &&
					feature.value !== 'id' &&
					feature.type === 'image url'
			)
			.map((feature) => feature.value)
		const textFeatures = dataFeature
			.filter(
				(feature) =>
					feature.isActivated &&
					feature.value !== 'id' &&
					feature.type === 'string'
			)
			.map((feature) => feature.value)

		const labelColumn = dataFeature
			.filter((feature) => feature.isLabel)
			.map((feature) => feature.value)[0]

		setPreviewData((prevData) => ({
			...prevData,
			image_columns: imageFeatures,
			text_columns: textFeatures,
			label_column: labelColumn,
		}))
	}

	const handleRadioChange = (event) => {
		const value = event.target.value
		setTargetColumn(value)

		dataFeature.forEach((item) => {
			if (item.value === value) {
				item.isLabel = true
				item.isActivated = false
			} else {
				item.isLabel = false
				item.isActivated = true
			}
		})

		updatePreviewData()

		// //! FAKE DATA UPLOAD
		// image_columns: ['url'],
		// text_columns: [
		// 	'product_name',
		// 	'original_brand',
		// 	'cleaned_brand',
		// 	'report_name',
		// ],

		setIsDropdownRadioOpen(false)
	}

	const handleCheckboxChange = (el, type) => {
		setDataFeature(
			dataFeature.map((feature) => {
				if (feature.value === el.value)
					feature.isActivated = !el.isActivated
				return feature
			})
		)
		updatePreviewData()
	}

	const handleChange = (event, el, type) => {
		if (type === 'radio') handleRadioChange(event)
		if (type === 'checkbox') {
			if (typeof event === 'string') {
				const type = event
				dataFeature.forEach((item) => {
					if (item.value === el.value) {
						item.type = type
					}
				})
				updatePreviewData()
			} else handleCheckboxChange(el, type)
		}
	}

	const handleEdit = (id, field, value) => {
		console.log(id + ' ' + field + ' ' + value)
		const newCsvData = csvData.map((item) =>
			item.id === id ? { ...item, [field]: value } : item
		)
		setCsvData(newCsvData)
	}

	const handleLockToggle = () => {
		const lockFlag = isLocked
		setIsLocked(!lockFlag)
		setIsLockedFlag(!lockFlag)
		if (!isLocked) {
			console.log('Data is locked')
			setEditedData(csvData.map(({ id, ...rest }) => rest))
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
				<div></div>
				<div></div>
				<div></div>

				{/* TARGET COLUMN */}
				<DropDown
					csvData={csvData}
					dataFeature={dataFeature}
					toggleDropdown={toggleDropdown}
					isDropdownOpen={isDropdownOpen}
					handleChange={handleChange}
					targetColumn={targetColumn}
					type="radio"
				/>

				{/* ACTIVATE FEATURES */}
				<DropDown
					csvData={csvData}
					dataFeature={dataFeature}
					toggleDropdown={toggleDropdown}
					isDropdownOpen={isDropdownOpen}
					handleChange={handleChange}
					targetColumn={targetColumn}
					type="checkbox"
					featureTypes={featureTypes}
				/>
				<div></div>
				<div></div>
				<div className="flex gap-3">
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
			</div>
			{error && <p className="text-red-500 text-sm">{error}</p>}
			{csvData.length > 0 ? (
				<>
					<div className="overflow-x-auto mb-6 rounded-lg border-2 border-slate-50">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gradient-to-r bg-[#f0f8ff] font-bold">
								<tr>
									{dataFeature.map((el) => {
										if (!el.isActivated) return <></>
										return (
											<th
												key={el.value}
												className="px-7 py-3 text-center text-xs font-bold text-black uppercase tracking-wider"
											>
												<div>{el.value}</div>
												<div className="font-normal lowercase">
													{el.value === 'id'
														? ''
														: el.type}
												</div>
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
														.isActivated
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
																		row.id,
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
