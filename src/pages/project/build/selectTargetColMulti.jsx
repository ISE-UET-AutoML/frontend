import React, { useState, useEffect } from 'react'
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
import { useNavigate, useOutletContext } from 'react-router-dom'
import { InfoCircleOutlined } from '@ant-design/icons'

const { Option } = Select
const { Title, Text } = Typography

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
	const urlPattern = /^https?:\/\/.+/i // Kiểm tra URL hợp lệ

	return Object.keys(row).filter((col) => {
		const value = row[col]
		if (typeof value !== 'string') return false

		// Kiểm tra nếu giá trị có chứa phần mở rộng ảnh hoặc là một URL hợp lệ
		return (
			imageExtensions.some((ext) => value.toLowerCase().includes(ext)) ||
			urlPattern.test(value)
		)
	})
}

const SelectTargetColMulti = () => {
	const { projectInfo, selectedDataset } = useOutletContext()
	const navigate = useNavigate()
	const [dataset, setDataset] = useState(null)
	const [colsName, setColsName] = useState([])
	const [selectedTargetCol, setSelectedTargetCol] = useState(null)
	const [selectedImgCol, setSelectedImgCol] = useState(null)
	const [imgCols, setImgCols] = useState([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!selectedDataset?._id) return

		const fetchDataset = async () => {
			setLoading(true)
			try {
				const { data } = await datasetAPI.getDatasetPreview(
					selectedDataset._id,
					10
				)
				const iC = detectImageColumns(data.files[0])
				setImgCols(iC)
				setDataset(data.files)
				setColsName(Object.keys(data.files[0] || {}))
			} catch (error) {
				console.error('Error fetching dataset:', error)
				message.error('Failed to load dataset. Please try again.')
			} finally {
				setLoading(false)
			}
		}

		fetchDataset()
	}, [selectedDataset?._id])

	const sendColumn = async () => {
		try {
			const formData = new FormData()
			formData.append('targetCol', selectedTargetCol)
			formData.append('imgCol', selectedImgCol)
			formData.append('datasetID', selectedDataset?._id)
			projectInfo.target_column = selectedTargetCol
			projectInfo.img_column = selectedImgCol

			const res = await projectAPI.sendTargetColumn(
				projectInfo._id,
				formData
			)
			if (res.status === 200) {
				message.success('Target Column Set Successfully', 3)
				navigate(`/app/project/${projectInfo._id}/build/selectInstance`)
			}
		} catch (error) {
			console.error('Error sending target column:', error)
			message.error('Failed to set target column. Please try again.')
		}
	}

	return (
		<Card className="mx-auto w-full border-none">
			<Title level={2} className="text-center mb-6">
				Select Target & Image Column
			</Title>
			<Text type="secondary" className="block text-center mb-8">
				Choose the target column for analysis and the image column
				containing visual data.
			</Text>

			<Spin spinning={loading}>
				<Row gutter={[24, 24]} className="mb-8">
					<Col xs={24} md={12}>
						<label className="block text-gray-700 font-medium mb-2">
							Target Column{' '}
							<Tooltip title="Select the column that contains the target data for analysis.">
								<InfoCircleOutlined className="text-gray-500" />
							</Tooltip>
						</label>
						<Select
							className="w-full"
							placeholder="Select Target Column"
							value={selectedTargetCol}
							onChange={setSelectedTargetCol}
							optionFilterProp="children"
							showSearch
						>
							{colsName
								.filter((col) => !imgCols.includes(col))
								.map((col) => (
									<Option key={col} value={col}>
										{col}
									</Option>
								))}
						</Select>
					</Col>
					<Col xs={24} md={12}>
						<label className="block text-gray-700 font-medium mb-2">
							Image Column{' '}
							<Tooltip title="Select the column that contains image URLs or paths.">
								<InfoCircleOutlined className="text-gray-500" />
							</Tooltip>
						</label>
						<Select
							className="w-full"
							placeholder="Select Image Column"
							value={selectedImgCol}
							onChange={setSelectedImgCol}
							optionFilterProp="children"
							showSearch
						>
							{imgCols.map((col) => (
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
						onClick={sendColumn}
						disabled={!selectedTargetCol || !selectedImgCol}
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
										<th
											key={col}
											className="py-3 px-4 border-b"
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
			</Spin>
		</Card>
	)
}

export default SelectTargetColMulti
