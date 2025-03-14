import React, { useState, useEffect } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import * as datasetAPI from 'src/api/dataset'
import * as projectAPI from 'src/api/project'
import {
	Select,
	Card,
	Row,
	Col,
	Button,
	Typography,
	Spin,
	Tooltip,
	message,
} from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

const { Option } = Select
const { Title, Text } = Typography

const SelectTargetCol = () => {
	const { projectInfo, selectedDataset, updateFields } = useOutletContext()
	const navigate = useNavigate()
	const [dataset, setDataset] = useState(null)
	const [colsName, setColsName] = useState([])
	const [selectedCol, setSelectedCol] = useState(null)
	const [loading, setLoading] = useState(false)
	const { id: projectID } = useParams()

	useEffect(() => {
		if (!selectedDataset?._id) return

		const fetchDataset = async () => {
			setLoading(true)
			try {
				const { data } = await datasetAPI.getDatasetPreview(
					selectedDataset._id,
					10
				)

				// Xử lý dữ liệu để đảm bảo cấu trúc nhất quán
				const processedData = data.files.map((row) => {
					// Chuyển đổi các giá trị undefined/null thành chuỗi rỗng
					return Object.entries(row).reduce((acc, [key, value]) => {
						acc[key] = value ?? ''
						return acc
					}, {})
				})

				setDataset(processedData)

				// Lấy tất cả các key có thể có từ tất cả các hàng
				const allKeys = [...new Set(processedData.flatMap(Object.keys))]
				setColsName(allKeys)
			} catch (error) {
				console.error('Error fetching dataset:', error)
				message.error('Failed to load dataset preview')
			} finally {
				setLoading(false)
			}
		}

		fetchDataset()
	}, [selectedDataset?._id])

	// Xác định loại dữ liệu của cột
	const getColumnType = (value) => {
		if (value === undefined || value === null || value === '')
			return 'unknown'
		if (typeof value === 'number') return 'number'
		if (!isNaN(Number(value))) return 'number'
		return 'text'
	}

	// Hàm gửi thông tin cột mục tiêu và cột văn bản
	const sendTargetColumn = async () => {
		if (!selectedCol) {
			message.warning('Please select a target column')
			return
		}

		// Các cột còn lại sẽ được xếp vào textCols
		const textCols = colsName.filter((col) => col !== selectedCol)

		setLoading(true)
		try {
			const formData = new FormData()
			formData.append('targetCol', selectedCol)
			formData.append('textCols', textCols)
			formData.append('datasetID', selectedDataset?._id)

			const res = await projectAPI.sendTargetColumn(projectID, formData)

			if (res.status === 200) {
				message.success('Target Column Set Successfully', 3)
				navigate(`/app/project/${projectInfo._id}/build/selectInstance`)
			}
		} catch (error) {
			console.error('Error sending target column:', error)
			message.error('Failed to set target column')
		} finally {
			setLoading(false)
		}
	}

	return (
	<>
			<Card className="mx-auto w-full border-none">
				<Title level={2} className="text-center mb-6">
					Select Target Column
				</Title>
				<Text type="secondary" className="block text-center mb-8">
					Choose the target column for analysis. The remaining columns
					will be used as text columns.
				</Text>

				<Spin spinning={loading}>
					<Row gutter={[24, 24]} className="mb-8">
						<Col xs={24} md={12} className="mx-auto">
							<div className="flex items-center mb-2">
								<label className="text-blue-600 font-medium mr-3">
									Target Column{' '}
									<Tooltip title="Select the column that contains the target data for analysis.">
										<InfoCircleOutlined className="text-gray-500" />
									</Tooltip>
								</label>
							</div>
							<Select
								className="w-full"
								placeholder="Select Target Column"
								value={selectedCol}
								onChange={setSelectedCol}
								optionFilterProp="children"
								showSearch
							>
								{colsName.map((col) => (
									<Option key={col} value={col}>
										{col}
									</Option>
								))}
							</Select>
						</Col>
					</Row>

					<div className="text-center">
						<Button
							type="primary"
							size="large"
							onClick={sendTargetColumn}
							disabled={!selectedCol}
							className="w-48"
						>
							Confirm Selection
						</Button>
					</div>

					{dataset && (
						<div className="mt-8 overflow-auto border rounded-lg shadow-sm">
							<table className="w-full border-collapse text-sm text-gray-700">
								<thead className="bg-gray-100 text-gray-800 sticky top-0 text-center">
									<tr>
										{colsName.map((col) => (
											<th key={col} className="pt-2 px-4">
												{col}
											</th>
										))}
									</tr>
									<tr>
										{colsName.map((col) => (
											<th
												key={col}
												className="pb-2 px-4 border-b text-xs text-gray-500"
											>
												{dataset[0]
													? getColumnType(
															dataset[0][col]
														)
													: 'unknown'}
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
													className={`px-4 py-2 truncate max-w-[150px] ${col === selectedCol ? 'bg-blue-50' : ''}`}
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
				</Spin>
			</Card>
		</>
	)
}

export default SelectTargetCol
