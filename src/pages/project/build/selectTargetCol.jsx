import React, { useState, useEffect } from 'react'
import * as datasetAPI from 'src/api/dataset'

const SelectTargetCol = (props) => {
	const [dataset, setDataset] = useState(null)
	const [colsName, setColsName] = useState([])
	const [selectedCol, setSelectedCol] = useState(null)

	useEffect(() => {
		if (!props.selectedDataset?._id) return

		const fetchDataset = async () => {
			try {
				const { data } = await datasetAPI.getDataTen(
					props.selectedDataset._id
				)

				console.log('Dataset Response', data)
				if (!data.files || !data.files.tasks?.length) {
					console.error('Invalid dataset structure:', data)
					return
				}

				setDataset(data.files)

				const keys = Object.keys(data.files.tasks[0].data || {})
				setColsName(
					keys.map((key) =>
						key
							.replace('data-VAL-', '')
							.replace(
								'label',
								data.files.project_info
									?.original_label_column || 'label'
							)
					)
				)
			} catch (error) {
				console.error('Error fetching dataset:', error)
			}
		}

		fetchDataset()
	}, [props.selectedDataset?._id])

	const sendTargetColumn = async () => {
		window.alert('Target column selected: ' + selectedCol)
	}

	return (
		<>
			{dataset && (
				<div className="ml-2 relative">
					<div className="flex">
						<h1 className="w-full text-center text-4xl font-bold">
							Choose Target Column
						</h1>
						<div className="flex justify-end">
							{selectedCol !== null && (
								<button
									className="btn"
									onClick={sendTargetColumn}
								>
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
					</div>
					<div className="grid grid-cols-6 gap-4 mt-6 h-[45%]">
						{colsName.map((col) => (
							<div key={col}>
								<button
									onClick={() => setSelectedCol(col)}
									className={`h-[50px] w-[220px] font-bold py-2 px-4 rounded text-lg
                ${
					selectedCol === col
						? 'border-red-500 border-2 text-red-600 bg-white hover:bg-red-50'
						: 'border-blue-500 border-2 text-blue-600 hover:text-white hover:bg-blue-600'
				}`}
								>
									{col}
								</button>
							</div>
						))}
					</div>

					{/* Bảng hiển thị dữ liệu */}
					{dataset.tasks?.length > 0 && (
						<div className="fixed bottom-0 h-[58%] mt-5 mr-2 overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
							<table className="w-full table-fixed border-collapse">
								<thead className="sticky top-0 z-10 bg-blue-600 text-white">
									<tr className="border-2">
										{colsName.map((col, index) => (
											<th
												key={index}
												className="max-w-[160px] px-2 py-3 text-center truncate"
											>
												{col}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{dataset.tasks.map((row, rowIndex) => (
										<tr
											key={rowIndex}
											className="border-b hover:bg-gray-50"
										>
											{colsName.map((col, colIndex) => (
												<td
													key={colIndex}
													className="w-40 min-w-[160px] px-4 py-2 text-center truncate"
												>
													{row.data?.[
														`data-VAL-${col}`
													] ||
														row.data?.label ||
														'-'}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}
		</>
	)
}

export default SelectTargetCol
