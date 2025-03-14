import React, { useState, useEffect } from 'react'
import {
	Card,
	Pagination,
	Select,
	Space,
	Row,
	Col,
	Tag,
	Typography,
	Input,
	Button,
	Empty,
	Tooltip,
	Radio,
	Modal,
} from 'antd'
import {
	FileImageOutlined,
	FilterOutlined,
	ReloadOutlined,
	AppstoreOutlined,
	BarsOutlined,
	ZoomInOutlined,
	TagsOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input

const MultilabelImgClassDataView = ({ dataset, files }) => {
	const imagesPerPage = 16
	const [currentPage, setCurrentPage] = useState(1)
	const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
	const [selectedLabels, setSelectedLabels] = useState([])
	const [searchText, setSearchText] = useState('')
	const [filteredFiles, setFilteredFiles] = useState(files)
	const [availableLabels, setAvailableLabels] = useState([])
	const [labelCountFilter, setLabelCountFilter] = useState('all') // 'all', '2', '3', '4+'
	const [isModalVisible, setIsModalVisible] = useState(false) // Added modal state
	const [selectedImage, setSelectedImage] = useState(null) // Added selected image state

	// Extract all unique labels from files
	useEffect(() => {
		if (!files || files.length === 0) return

		const allLabels = new Set()
		files.forEach((file) => {
			const pathParts = file.fileName.split('/')
			// Extract all labels except the last part (id)
			const labels = pathParts.slice(0, pathParts.length - 1)
			labels.forEach((label) => allLabels.add(label))
		})

		setAvailableLabels(Array.from(allLabels))
	}, [files])

	// Filter files based on selected labels, search text, and label count
	useEffect(() => {
		if (!files) return

		let filtered = [...files]

		// Filter by selected labels
		if (selectedLabels.length > 0) {
			filtered = filtered.filter((file) => {
				const fileLabelPath = file.fileName.split('/')
				return selectedLabels.every((label) =>
					fileLabelPath.includes(label)
				)
			})
		}

		// Filter by search text
		if (searchText) {
			filtered = filtered.filter((file) =>
				file.fileName.toLowerCase().includes(searchText.toLowerCase())
			)
		}

		// Filter by number of labels
		if (labelCountFilter !== 'all') {
			filtered = filtered.filter((file) => {
				const labelCount = file.fileName.split('/').length - 1 // Subtract 1 for the ID part

				if (labelCountFilter === '2') {
					return labelCount === 2
				} else if (labelCountFilter === '3') {
					return labelCount === 3
				} else if (labelCountFilter === '4+') {
					return labelCount >= 4
				}
				return true
			})
		}

		setFilteredFiles(filtered)
		setCurrentPage(1) // Reset to first page when filters change
	}, [files, selectedLabels, searchText, labelCountFilter])

	// Calculate pagination
	const totalFiles = filteredFiles ? filteredFiles.length : 0
	const startIndex = (currentPage - 1) * imagesPerPage
	const endIndex = Math.min(startIndex + imagesPerPage, totalFiles)
	const currentFiles = filteredFiles
		? filteredFiles.slice(startIndex, endIndex)
		: []

	// Handle page change
	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	// Extract labels from file name
	const getLabelsFromFileName = (fileName) => {
		const parts = fileName.split('/')
		return parts.slice(0, parts.length - 1)
	}

	// Get ID from file name
	const getIdFromFileName = (fileName) => {
		const parts = fileName.split('/')
		return parts[parts.length - 1]
	}

	// Reset all filters
	const handleReset = () => {
		setSelectedLabels([])
		setSearchText('')
		setLabelCountFilter('all')
	}

	// Handle image click to show modal
	const handleImageClick = (file) => {
		setSelectedImage(file)
		setIsModalVisible(true)
	}

	// Handle modal close
	const handleModalClose = () => {
		setIsModalVisible(false)
		setSelectedImage(null)
	}

	// Render image card in grid view
	const renderGridItem = (file, index) => {
		const labels = getLabelsFromFileName(file.fileName)
		const id = getIdFromFileName(file.fileName)

		return (
			<Col
				xs={24}
				sm={12}
				md={8}
				lg={6}
				key={index}
				style={{ marginBottom: 16 }}
			>
				<Card
					hoverable
					cover={
						<div
							style={{
								height: 200,
								overflow: 'hidden',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: '#f0f0f0',
								cursor: 'pointer', // Added cursor pointer
							}}
							onClick={() => handleImageClick(file)} // Added click handler
						>
							{file.content ? (
								<img
									alt={`${id}`}
									src={file.content}
									style={{
										maxHeight: '100%',
										maxWidth: '100%',
										objectFit: 'contain',
									}}
								/>
							) : (
								<FileImageOutlined
									style={{ fontSize: 64, color: '#d9d9d9' }}
								/>
							)}
						</div>
					}
				>
					<Card.Meta
						title={
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<Text ellipsis style={{ maxWidth: '80%' }}>
									{id}
								</Text>
								<Tooltip title={`${labels.length} labels`}>
									<Tag color="purple">
										<TagsOutlined /> {labels.length}
									</Tag>
								</Tooltip>
							</div>
						}
						description={
							<Space
								direction="vertical"
								size={4}
								style={{ width: '100%' }}
							>
								<div
									style={{
										maxHeight: 60,
										overflow: 'hidden',
									}}
								>
									{labels.map((label, i) => (
										<Tag
											color="blue"
											key={i}
											style={{ margin: '2px' }}
										>
											{label}
										</Tag>
									))}
								</div>
							</Space>
						}
					/>
				</Card>
			</Col>
		)
	}

	// Render image in list view
	const renderListItem = (file, index) => {
		const labels = getLabelsFromFileName(file.fileName)
		const id = getIdFromFileName(file.fileName)

		return (
			<div
				key={index}
				style={{
					marginBottom: 16,
					padding: 16,
					borderRadius: 8,
					border: '1px solid #f0f0f0',
				}}
			>
				<Row gutter={16} align="middle">
					<Col xs={24} sm={8} md={6} lg={4}>
						<div
							style={{
								height: 100,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: '#f0f0f0',
								borderRadius: 4,
								cursor: 'pointer', // Added cursor pointer
							}}
							onClick={() => handleImageClick(file)} // Added click handler
						>
							{file.content ? (
								<img
									alt={`${id}`}
									src={file.content}
									style={{
										maxHeight: '100%',
										maxWidth: '100%',
										objectFit: 'contain',
									}}
								/>
							) : (
								<FileImageOutlined
									style={{ fontSize: 32, color: '#d9d9d9' }}
								/>
							)}
						</div>
					</Col>
					<Col xs={24} sm={16} md={18} lg={20}>
						<Space
							direction="vertical"
							size={8}
							style={{ width: '100%' }}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<Text strong>{id}</Text>
								<Tooltip title={`${labels.length} labels`}>
									<Tag color="purple">
										<TagsOutlined /> {labels.length}
									</Tag>
								</Tooltip>
							</div>
							<div>
								{labels.map((label, i) => (
									<Tag
										color="blue"
										key={i}
										style={{ margin: '2px' }}
									>
										{label}
									</Tag>
								))}
							</div>
						</Space>
					</Col>
				</Row>
			</div>
		)
	}

	console.log('Dataset:', dataset)

	return (
		<div style={{ padding: 12 }}>
			<Space direction="vertical" size={16} style={{ width: '100%' }}>
				{/* Header */}
				<Row justify="space-between" align="middle">
					<Col>
						<Title level={2}>
							{dataset ? dataset.title : 'Multilabel Dataset'}
						</Title>
					</Col>
					<Col>
						<Space>
							{/* Reset button */}

							<Col>
								<Button
									icon={<ReloadOutlined />}
									onClick={handleReset}
								>
									Reset All Filters
								</Button>
							</Col>

							<Button
								icon={
									viewMode === 'grid' ? (
										<BarsOutlined />
									) : (
										<AppstoreOutlined />
									)
								}
								onClick={() =>
									setViewMode(
										viewMode === 'grid' ? 'list' : 'grid'
									)
								}
							>
								{viewMode === 'grid'
									? 'List View'
									: 'Grid View'}
							</Button>
						</Space>
					</Col>
				</Row>

				{/* Filter tools */}
				<Card>
					<Space
						direction="vertical"
						size={16}
						style={{ width: '100%' }}
					>
						{/* Label filter */}
						<Row gutter={[16, 16]} align="middle">
							<Col xs={24} sm={6} md={4} lg={3}>
								<Space>
									<FilterOutlined />
									<Text strong>Label Filters:</Text>
								</Space>
							</Col>
							<Col xs={24} sm={16} md={18} lg={19}>
								<Select
									mode="multiple"
									style={{ width: '100%' }}
									placeholder="Select labels to filter"
									value={selectedLabels}
									onChange={setSelectedLabels}
									allowClear
								>
									{availableLabels.map((label) => (
										<Option key={label} value={label}>
											{label}
										</Option>
									))}
								</Select>
							</Col>
						</Row>

						{/* Label count filter */}
						<Row gutter={[16, 16]} align="middle">
							<Col xs={24} sm={6} md={4} lg={3}>
								<Space>
									<TagsOutlined />
									<Text strong>Label Count:</Text>
								</Space>
							</Col>
							<Col xs={24} sm={16} md={18} lg={19}>
								<Radio.Group
									value={labelCountFilter}
									onChange={(e) =>
										setLabelCountFilter(e.target.value)
									}
									buttonStyle="solid"
								>
									<Radio.Button value="all">All</Radio.Button>
									<Radio.Button value="2">
										2 Labels
									</Radio.Button>
									<Radio.Button value="3">
										3 Labels
									</Radio.Button>
									<Radio.Button value="4+">
										4+ Labels
									</Radio.Button>
								</Radio.Group>
							</Col>
						</Row>

						{/* Search */}
						<Row gutter={[16, 16]} align="middle">
							<Col xs={24} sm={6} md={4} lg={3}>
								<Space>
									<FilterOutlined />
									<Text strong>Search:</Text>
								</Space>
							</Col>
							<Col xs={24} sm={16} md={18} lg={19}>
								<Search
									placeholder="Search by filename"
									allowClear
									enterButton
									value={searchText}
									onChange={(e) =>
										setSearchText(e.target.value)
									}
								/>
							</Col>
						</Row>
					</Space>
				</Card>

				{/* Results count */}
				<div>
					<Text>
						Showing {startIndex + 1}-{endIndex} of {totalFiles}{' '}
						results
					</Text>
				</div>

				{/* Images display */}
				{currentFiles.length > 0 ? (
					viewMode === 'grid' ? (
						<Row gutter={[16, 16]}>
							{currentFiles.map((file, index) =>
								renderGridItem(file, index)
							)}
						</Row>
					) : (
						<div>
							{currentFiles.map((file, index) =>
								renderListItem(file, index)
							)}
						</div>
					)
				) : (
					<Empty description="No matching data found" />
				)}

				{/* Pagination */}
				{totalFiles > 0 && (
					<Row justify="center" style={{ marginTop: 16 }}>
						<Pagination
							current={currentPage}
							total={totalFiles}
							pageSize={imagesPerPage}
							onChange={handlePageChange}
							showSizeChanger={false}
							showQuickJumper
						/>
					</Row>
				)}
			</Space>
			{/* Added Modal component */}
			<Modal
				visible={isModalVisible}
				onCancel={handleModalClose}
				footer={null}
				width={800}
				centered
				style={{ padding: 0 }}
			>
				{selectedImage && (
					<img
						src={selectedImage.content}
						alt={getIdFromFileName(selectedImage.fileName)}
						style={{
							width: '100%',
							maxHeight: '80vh',
							objectFit: 'contain',
						}}
					/>
				)}
			</Modal>
		</div>
	)
}

export default MultilabelImgClassDataView
