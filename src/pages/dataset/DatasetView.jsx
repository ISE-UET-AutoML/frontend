import React, { useEffect, useState } from 'react'
import config from './config'
import { useParams } from 'react-router-dom'
import * as datasetAPI from 'src/api/dataset'
import { Spin, Image, Table, Tabs, Tag, Pagination } from 'antd'

const DatasetView = () => {
	const { id } = useParams()
	const [dataset, setDataset] = useState(null)
	const [files, setFiles] = useState(null)
	const [previewUrls, setPreviewUrls] = useState([])
	const [csvPreview, setCsvPreview] = useState([])
	const [currentImagePage, setCurrentImagePage] = useState(1)
	const [imagePageLoading, setImagePageLoading] = useState(false)

	const [loading, setLoading] = useState({
		dataset: false,
		imagePreview: false,
		csvPreview: false
	})

	const imagesPerPage = 10

	useEffect(() => {
		const fetchData = async () => {
			if (!id) return

			try {
				setLoading(prev => ({ ...prev, dataset: true }))
				const { data: datasetData } = await datasetAPI.getDataset(id)
				setDataset(datasetData.dataset)
				setFiles(datasetData.files)
			} catch (error) {
				console.error('Failed to fetch dataset:', error)
			} finally {
				setLoading(prev => ({ ...prev, dataset: false }))
			}

			try {
				setLoading(prev => ({ ...prev, imagePreview: true }))
				const { data: imageData } = await datasetAPI.getDatasetPreviewDataImage(id)
				setPreviewUrls(imageData.preview_data)
			} catch (error) {
				console.error('Failed to fetch image previews:', error)
			} finally {
				setLoading(prev => ({ ...prev, imagePreview: false }))
			}

			try {
				setLoading(prev => ({ ...prev, csvPreview: true }))
				const { data: csvData } = await datasetAPI.getDatasetPreviewDataCSV(id)
				setCsvPreview(csvData.preview_data)
			} catch (error) {
				console.error('Failed to fetch CSV preview:', error)
			} finally {
				setLoading(prev => ({ ...prev, csvPreview: false }))
			}
		}

		fetchData()
	}, [id])

	// Loading ảnh khi chuyển page
	useEffect(() => {
		if (previewUrls.length > imagesPerPage) {
			setImagePageLoading(true)
			const timer = setTimeout(() => setImagePageLoading(false), 300)
			return () => clearTimeout(timer)
		}
	}, [currentImagePage, previewUrls])

	const sentimentColumns = [
		{
			title: 'Text',
			dataIndex: 'text',
			key: 'text',
			width: '80%',
			render: (text) => (
				<div className="max-w-2xl break-words px-4 py-2">{text}</div>
			)
		},
		{
			title: 'Sentiment',
			dataIndex: 'sentiment',
			key: 'sentiment',
			width: '20%',
			align: 'center',
			render: (value) => {
				let color = value === '1' ? 'green' : 'red'
				let text = value === '1' ? 'Positive' : 'Negative'
				return <Tag color={color}>{text}</Tag>
			}
		}
	]

	const sentimentData = csvPreview.slice(1).map((row, index) => ({
		key: index,
		text: row[0],
		sentiment: row[1]
	}))

	const isLoading = loading.dataset || loading.imagePreview || loading.csvPreview

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Spin size="large" tip="Loading dataset..." />
			</div>
		)
	}

	const items = [
		previewUrls.length > 0 && {
			key: 'images',
			label: 'Image Preview',
			children: (
				<div className="p-6 flex flex-col items-center">
					{imagePageLoading ? (
						<div className="w-full flex justify-center py-12">
							<Spin size="large" tip="Đang tải ảnh..." />
						</div>
					) : (
						<>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl w-full transition-all duration-500 ease-in-out">
								{previewUrls
									.slice((currentImagePage - 1) * imagesPerPage, currentImagePage * imagesPerPage)
									.map((url, index) => (
										<div
											key={index}
											className="aspect-square w-full h-48 rounded-xl overflow-hidden transition duration-300 hover:scale-105 hover:shadow-xl border border-gray-300"
										>
											<Image
												src={url}
												alt={`Preview ${index + 1}`}
												className="w-full h-full object-cover"
												preview={{ mask: 'Xem chi tiết' }}
												placeholder={
													<div className="flex items-center justify-center h-full bg-gray-100 text-gray-400 text-sm">Loading...</div>
												}
											/>
										</div>
								))}
							</div>
							{previewUrls.length > imagesPerPage && (
								<div className="mt-6">
									<Pagination
										current={currentImagePage}
										onChange={setCurrentImagePage}
										total={previewUrls.length}
										pageSize={imagesPerPage}
										showSizeChanger={false}
									/>
								</div>
							)}
						</>
					)}
				</div>
			)
		},
		csvPreview.length > 0 && {
			key: 'csv',
			label: 'Text Analysis Preview',
			children: (
				<div className="p-6 flex justify-center">
					<div className="w-full max-w-5xl">
						<Table 
							columns={sentimentColumns}
							dataSource={sentimentData}
							pagination={{
								pageSize: 5,
								showSizeChanger: true,
								showQuickJumper: true,
								className: "p-4"
							}}
							className="border border-gray-900 rounded-lg overflow-hidden"
							bordered={true}
							style={{height: '600px', width: '1500px'}}
						/>
					</div>
				</div>
			)
		}
	].filter(Boolean)

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="container mx-auto px-4 py-8 max-w-7xl w-full">
				<Tabs 
					items={items}
					type="card"
					className="bg-white rounded-lg shadow-sm"
					centered={true}
				/>
			</div>
		</div>
	)
}

export default DatasetView
