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

const getColumnType = (value) => {
	if (typeof value === 'string') {
		// Kiểm tra nếu giá trị là "TRUE" hoặc "FALSE" (không phân biệt chữ hoa/chữ thường)
		if (/^(true|false)$/i.test(value.trim())) return '#bool'

		// Kiểm tra nếu giá trị là một số (có thể chuyển đổi thành số)
		if (!isNaN(value) && !isNaN(parseFloat(value))) return '#int'

		// Kiểm tra nếu giá trị là URL
		if (/^https?:\/\/.+/i.test(value)) return '#url'

		// Kiểm tra nếu giá trị chứa phần mở rộng ảnh
		if (/(\.jpg|\.jpeg|\.png|\.gif|\.webp|\.bmp|\.svg)$/i.test(value))
			return '#img'

		// Mặc định là string
		return '#str'
	}
	if (typeof value === 'number') return '#int'
	if (typeof value === 'boolean') return '#bool'
	return '#unknown'
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
	const [filterType, setFilterType] = useState(null) // State để lọc kiểu dữ liệu

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
				setSelectedImgCol(iC[0])
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

	// Hàm lọc các cột dựa trên kiểu dữ liệu
	const getFilteredColumns = () => {
		if (!dataset || dataset.length === 0) return []

		const firstRow = dataset[0]
		return colsName.filter((col) => {
			const type = getColumnType(firstRow[col])
			// Loại bỏ các cột có kiểu dữ liệu là #url hoặc #img
			if (type === '#url' || type === '#img') return false

			// Nếu có filterType, chỉ hiển thị các cột có kiểu dữ liệu phù hợp
			if (filterType) return type === filterType

			// Mặc định hiển thị tất cả các cột không phải #url hoặc #img
			return true
		})
	}

	return (
		<>
			<style>{`
				.dark-build-page {
					background: #01000A;
					min-height: 100vh;
					padding: 24px;
				}
				
				.dark-build-card {
					background: linear-gradient(135deg, rgba(15, 32, 39, 0.8) 0%, rgba(32, 58, 67, 0.6) 50%, rgba(44, 83, 100, 0.8) 100%);
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 16px;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
				}
				
				.dark-build-title {
					background: linear-gradient(90deg, #5C8DFF 0%, #65FFA0 100%);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
					font-family: 'Poppins', sans-serif;
					font-weight: 700;
				}
				
				.dark-build-text {
					color: rgba(255, 255, 255, 0.8);
					font-family: 'Poppins', sans-serif;
				}
				
				.dark-build-label {
					color: #5C8DFF;
					font-family: 'Poppins', sans-serif;
					font-weight: 600;
				}
				
				.dark-build-select .ant-select-selector {
					background: rgba(255, 255, 255, 0.1) !important;
					border: 1px solid rgba(255, 255, 255, 0.2) !important;
					color: white !important;
					border-radius: 12px !important;
				}
				
				.dark-build-select .ant-select-selector:hover {
					border-color: #5C8DFF !important;
					box-shadow: 0 0 0 2px rgba(92, 141, 255, 0.2) !important;
				}
				
				.dark-build-select .ant-select-selection-item {
					color: white !important;
				}
				
				.dark-build-select .ant-select-arrow {
					color: #5C8DFF !important;
				}
				
				.dark-build-button {
					background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
					border: 1px solid rgba(255, 255, 255, 0.2) !important;
					border-radius: 12px !important;
					font-family: 'Poppins', sans-serif !important;
					font-weight: 600 !important;
					box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
				}
				
				.dark-build-button:hover {
					background: linear-gradient(135deg, #16213e 0%, #0f3460 100%) !important;
					box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
					transform: translateY(-2px) !important;
				}
				
				.dark-build-table {
					background: rgba(255, 255, 255, 0.05) !important;
					border: 1px solid rgba(255, 255, 255, 0.1) !important;
					border-radius: 12px !important;
				}
				
				.dark-build-table thead th {
					background: linear-gradient(135deg, rgba(92, 141, 255, 0.2) 0%, rgba(101, 255, 160, 0.2) 100%) !important;
					color: white !important;
					font-family: 'Poppins', sans-serif !important;
					font-weight: 600 !important;
					border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
				}
				
				.dark-build-table tbody td {
					color: rgba(255, 255, 255, 0.9) !important;
					font-family: 'Poppins', sans-serif !important;
					border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
				}
				
				.dark-build-table tbody tr:hover {
					background: rgba(92, 141, 255, 0.1) !important;
				}
				
				.dark-build-table tbody tr:hover td {
					background: transparent !important;
				}
			`}</style>
			<div className="dark-build-page">
				<Card className="dark-build-card mx-auto w-full border-none">
					<Title level={2} className="dark-build-title text-center mb-6">
						Select Target & Image Column
					</Title>
					<Text className="dark-build-text block text-center mb-8">
						Choose the target column for analysis and the image column
						containing visual data.
					</Text>

			<Spin spinning={loading}>
				<Row gutter={[24, 24]} className="mb-8">
					<Col xs={24} md={12}>
						<div className="flex items-center mb-2">
							<label className="dark-build-label font-medium mr-3">
								Target Column{' '}
								<Tooltip title="Select the column that contains the target data for analysis.">
									<InfoCircleOutlined className="text-gray-400" />
								</Tooltip>
							</label>
							<Select
								className="dark-build-select w-36"
								placeholder="Data Type"
								value={filterType}
								onChange={setFilterType}
								size="small"
								allowClear
								bordered={true}
							>
								<Option value="#str">#str</Option>
								<Option value="#int">#int</Option>
								<Option value="#bool">#bool</Option>
							</Select>
						</div>
						<Select
							className="dark-build-select w-full"
							placeholder="Select Target Column"
							value={selectedTargetCol}
							onChange={setSelectedTargetCol}
							optionFilterProp="children"
							showSearch
						>
							{getFilteredColumns().map((col) => (
								<Option key={col} value={col}>
									{col}
								</Option>
							))}
						</Select>
					</Col>
					<Col xs={24} md={12}>
						<label className="block dark-build-label font-medium mb-2">
							Image Column{' '}
							<Tooltip title="Select the column that contains image URLs or paths.">
								<InfoCircleOutlined className="text-gray-400" />
							</Tooltip>
						</label>
						<Select
							className="dark-build-select w-full"
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
						className="dark-build-button"
						type="primary"
						size="large"
						onClick={sendColumn}
						disabled={!selectedTargetCol || !selectedImgCol}
						style={{ width: '192px' }}
					>
						Confirm Selection
					</Button>
				</div>

				{dataset && (
					<div className="mt-8 overflow-auto dark-build-table">
						<table className="w-full border-collapse text-sm">
							<thead className="sticky top-0 text-center">
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
											className="pb-2 px-4 border-b text-xs text-gray-400"
										>
											{getColumnType(dataset[0][col])}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{dataset.map((row, rowIndex) => (
									<tr
										key={rowIndex}
										className="border-b hover:bg-cyan-500/10 text-center transition-colors duration-200"
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
		</div>
		</>
	)
}

export default SelectTargetColMulti
