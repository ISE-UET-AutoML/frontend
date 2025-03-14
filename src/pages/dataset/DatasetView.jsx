import React, { useEffect, useState } from 'react'
import config from './config'
import { useParams } from 'react-router-dom'
import * as datasetAPI from 'src/api/dataset'
import { Spin } from 'antd' // Import Spin từ antd

const DatasetView = () => {
	const { id } = useParams()
	const [dataset, setDataset] = useState(null)
	const [files, setFiles] = useState(null)
	const [loading, setLoading] = useState(false) // Thêm state cho loading

	useEffect(() => {
		const fetchDataset = async () => {
			try {
				setLoading(true) // Bật loading trước khi fetch dữ liệu
				const { data } = await datasetAPI.getDataset(id)

				console.log('Dataset Response', data)
				setDataset(data.dataset)
				setFiles(data.files)
			} catch (error) {
				console.error('Failed to fetch dataset:', error)
			} finally {
				setLoading(false) // Tắt loading sau khi fetch xong (dù thành công hay thất bại)
			}
		}

		if (id) {
			fetchDataset()
		}
	}, [id]) // Thêm id vào dependency array để đảm bảo useEffect chạy lại nếu id thay đổi

	// Hiển thị Spin khi đang loading
	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
				}}
			>
				<Spin size="large" tip="Loading dataset..." />
			</div>
		)
	}

	// Khi dữ liệu đã sẵn sàng
	if (dataset && files) {
		const ViewComponent = config[dataset.type].datasetView
		return <ViewComponent dataset={dataset} files={files} />
	}

	// Trả về rỗng nếu chưa có dữ liệu và không loading
	return <></>
}

export default DatasetView
