import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import * as datasetAPI from 'src/api/dataset'
import * as projectAPI from 'src/api/project'
import { Select, Card, message } from 'antd'
const { Option } = Select

const SelectTargetColMulti = (props) => {
	const [dataset, setDataset] = useState(null)
	const [colsName, setColsName] = useState([])
	const [selectedTargetCol, setSelectedTargetCol] = useState(null)
	const [selectedImgCol, setSelectedImgCol] = useState(null)
	const { id: projectID } = useParams()

	useEffect(() => {
		if (!props.selectedDataset?._id) return

		const fetchDataset = async () => {
			try {
				const { data } = await datasetAPI.getDatasetPreview(
					props.selectedDataset._id,
					12
				)

				setDataset(data.files)
				const keys = Object.keys(data.files[0] || {})
				setColsName(keys)

				console.log('Dataset Response', data)
				console.log('colsName', colsName)
			} catch (error) {
				console.error('Error fetching dataset:', error)
			}
		}

		fetchDataset()
	}, [props.selectedDataset?._id])

	const sendColumn = async () => {
		try {
			const formData = new FormData()
			formData.append('targetCol', selectedTargetCol)
			formData.append('imgCol', selectedImgCol)
			formData.append('datasetID', props.selectedDataset?._id)

			const res = await projectAPI.sendTargetColumn(projectID, formData)

			if (res.status === 200) {
				message.success('Set Target Column Finished', 3)
				props.updateFields({
					isDoneSelectTargetCol: true,
				})
			}
		} catch (error) {
			console.error('Error sending target column:', error)
		}
	}

	console.log('colsName', colsName)
	return (
		<>
			{dataset && (
				<div className="relative h-full">
					<div className="w-full h-14 flex justify-end items-center px-4">
						{selectedTargetCol !== null &&
							selectedImgCol !== null && (
								<button className="btn" onClick={sendColumn}>
									<svg
										height="24"
										width="24"
										fill="#FFFFFF"
										viewBox="0 0 24 24"
										data-name="Layer 1"
										id="Layer_1"
										className="sparkle"
									>
										<path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
									</svg>
									<span className="text">Next</span>
								</button>
							)}
					</div>

					<div className="w-full flex h-[40%] gap-24 justify-center items-center">
						<Card className="w-1/3 h-[55%] shadow-lg border border-gray-200 bg-gradient-to-b from-gray-50 to-white rounded-lg">
							<h2 className="text-xl font-semibold mb-4 text-center">
								Choose Target Column
							</h2>
							<Select
								className="w-full"
								placeholder="Select Target Column"
								value={selectedTargetCol}
								onChange={(value) => {
									if (value === selectedImgCol) {
										setSelectedImgCol(null)
									}
									setSelectedTargetCol(value)
								}}
							>
								{colsName.map((col) => (
									<Option key={col} value={col}>
										{col}
									</Option>
								))}
							</Select>
						</Card>

						<Card className="w-1/3 h-[55%] shadow-lg border border-gray-200 bg-gradient-to-b from-gray-50 to-white rounded-lg">
							<h2 className="text-xl font-semibold mb-4 text-center">
								Choose Image Column
							</h2>
							<Select
								className="w-full"
								placeholder="Select Image Column"
								value={selectedImgCol}
								onChange={(value) => {
									if (value === selectedTargetCol) {
										setSelectedTargetCol(null)
									}
									setSelectedImgCol(value)
								}}
							>
								{colsName.map((col) => (
									<Option key={col} value={col}>
										{col}
									</Option>
								))}
							</Select>
						</Card>
					</div>

					{/* DEVIDER */}
					<div className="w-full flex items-center justify-center my-3  ">
						<div className="flex-grow border-t border-gray-300"></div>
						<span className="mx-3 text-gray-500">PREVIEW</span>
						<div className="flex-grow border-t border-gray-300"></div>
					</div>

					{/* Bảng hiển thị dữ liệu */}
					<div className="fixed bottom-0 h-max max-w-full mt-5 overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
						<table className="w-max table-fixed border-collapse">
							<thead className="sticky top-0 z-10 bg-blue-600 text-white">
								<tr className="w-max">
									{colsName.map((col, index) => (
										<th
											key={index}
											className="px-2 py-3 text-center"
										>
											{col}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{dataset.map((row, rowIndex) => (
									<tr
										key={rowIndex}
										className="border-b hover:bg-gray-50"
									>
										{Object.entries(row).map(
											([key, value], colIndex) => (
												<td
													key={colIndex}
													className="min-w-[100px] px-2 text-center max-w-[200px] truncate"
													title={value}
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
				</div>
			)}
		</>
	)
}

export default SelectTargetColMulti
