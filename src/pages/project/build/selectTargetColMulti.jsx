import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import * as datasetAPI from 'src/api/dataset'
import * as projectAPI from 'src/api/project'
import { Select, message } from 'antd'
const { Option } = Select

const detectImageColumns = (row) => {
	if (!row || typeof row !== 'object') return []

	const imageExtensions = [
		'.jpg',
		'.jpeg',
		'.png',
		'.gif',
		'.webp',
		'.bmp',
		'.svg',
	]
	const urlPattern =
		/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i

	return Object.keys(row).filter((col) => {
		const value = row[col]
		if (typeof value !== 'string') return false
		return (
			imageExtensions.some((ext) => value.toLowerCase().includes(ext)) ||
			urlPattern.test(value)
		)
	})
}

const SelectTargetColMulti = (props) => {
	const [dataset, setDataset] = useState(null)
	const [colsName, setColsName] = useState([])
	const [selectedTargetCol, setSelectedTargetCol] = useState(null)
	const [selectedImgCol, setSelectedImgCol] = useState(null)
	const [imgCols, setImgCols] = useState([])
	const { id: projectID } = useParams()

	useEffect(() => {
		if (!props.selectedDataset?._id) return

		const fetchDataset = async () => {
			try {
				const { data } = await datasetAPI.getDatasetPreview(
					props.selectedDataset._id,
					10
				)
				const iC = detectImageColumns(data.files[0])
				setImgCols(iC)
				setDataset(data.files)
				setColsName(Object.keys(data.files[0] || {}))
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
			props.projectInfo.target_column = selectedTargetCol
			props.projectInfo.img_column = selectedImgCol

			const res = await projectAPI.sendTargetColumn(projectID, formData)
			if (res.status === 200) {
				message.success('Target Column Set Successfully', 3)
				props.updateFields({ isDoneSelectTargetCol: true })
			}
		} catch (error) {
			console.error('Error sending target column:', error)
		}
	}

	return (
		<div className="mx-auto bg-white rounded-lg w-full p-6">
			<h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
				Select Target & Image Column
			</h2>
			<div className="grid grid-cols-2 gap-6">
				<div>
					<label className="block text-gray-700 font-medium mb-2">
						Target Column
					</label>
					<Select
						className="w-full"
						placeholder="Select Target Column"
						value={selectedTargetCol}
						onChange={setSelectedTargetCol}
					>
						{colsName
							.filter((col) => !imgCols.includes(col))
							.map((col) => (
								<Option key={col} value={col}>
									{col}
								</Option>
							))}
					</Select>
				</div>
				<div>
					<label className="block text-gray-700 font-medium mb-2">
						Image Column
					</label>
					<Select
						className="w-full"
						placeholder="Select Image Column"
						value={selectedImgCol}
						onChange={setSelectedImgCol}
					>
						{imgCols.map((col) => (
							<Option key={col} value={col}>
								{col}
							</Option>
						))}
					</Select>
				</div>
			</div>
			<div className="mt-6 flex justify-center">
				<button
					className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 disabled:opacity-50"
					onClick={sendColumn}
					disabled={!selectedTargetCol || !selectedImgCol}
				>
					Confirm Selection
				</button>
			</div>

			{dataset && (
				<div className="mt-8 overflow-auto h-max border rounded-lg shadow-md">
					<table className="w-full border-collapse text-sm text-gray-700">
						<thead className="bg-gray-200 text-gray-800 sticky top-0 text-center">
							<tr>
								{colsName.map((col) => (
									<th
										key={col}
										className="py-2 px-4 border-b"
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
									className="border-b hover:bg-gray-50 text-center"
								>
									{colsName.map((col) => (
										<td
											key={col}
											className="px-4 py-2 truncate max-w-[150px]"
											title={row[col]}
										>
											{row[col]}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

export default SelectTargetColMulti
