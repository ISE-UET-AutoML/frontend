import React from 'react'
import { Button, Typography, Tag, Tooltip } from 'antd'
import {
	DeleteOutlined,
	DatabaseOutlined,
	SyncOutlined,
	CheckCircleOutlined,
	ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { DATASET_TYPES } from 'src/constants/types'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

const PROCESSING_STATUS = {
	COMPLETED: {
		color: 'success',
		icon: <CheckCircleOutlined />,
		text: 'Completed'
	},
	PROCESSING: {
		color: 'processing',
		icon: <SyncOutlined spin />,
		text: 'Processing'
	},
	FAILED: {
		color: 'error',
		icon: <ExclamationCircleOutlined />,
		text: 'Failed'
	}
}

export default function DatasetCard({ dataset }) {
	// Sửa thành camelCase theo response BE
	const createdAt = dataset.createdAt
	const bucketName = dataset.metaData?.bucketName || 'N/A' // Sửa meta_data -> metaData và bucket_name -> bucketName
	const dataType = dataset.dataType || 'UNKNOWN' // Sửa data_type -> dataType
	const processingStatus = dataset.processingStatus || 'PROCESSING' // Sửa processing_status -> processingStatus

	const isClickable = processingStatus === 'COMPLETED'
	const statusConfig = PROCESSING_STATUS[processingStatus] || PROCESSING_STATUS.PROCESSING

	const tagColor = DATASET_TYPES[dataType]?.card || {
		bg: '#f0f0f0',
		text: '#000',
		border: '#d9d9d9'
	}

	const handleCardClick = () => {
		window.location.href = PATHS.DATASET_VIEW(dataset.id)
	}

	// Sửa các reference meta_data -> metaData
	const totalFiles = dataset.metaData?.totalFiles || 0
	const totalSizeKb = dataset.metaData?.totalSizeKb || 0

	const CardContent = (
		<div
			className={`group relative rounded-xl bg-white shadow-md transition duration-300 ${isClickable ? 'hover:shadow-lg cursor-pointer' : 'cursor-not-allowed'
				}`}
			style={{
				border: `1px solid ${statusConfig.color === 'success' ? '#e8e8e8' : '#faad14'}`,
				overflow: 'hidden'
			}}
			onClick={isClickable ? handleCardClick : undefined}
			onMouseEnter={(e) => {
				if (isClickable) {
					e.currentTarget.style.transform = 'translateY(-5px)'
					e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
				}
			}}
			onMouseLeave={(e) => {
				if (isClickable) {
					e.currentTarget.style.transform = 'translateY(0)'
					e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
				}
			}}
		>
			<div className="p-6 flex items-center">
				<div
					className="group rounded-[12px] p-3 ring-4 ring-white transition duration-450"
					style={{
						color: statusConfig.color === 'success' ? '#1677ff' : '#faad14',
						backgroundColor: statusConfig.color === 'success' ? '#e6f7ff' : '#fffbe6'
					}}
				>
					<DatabaseOutlined
						style={{ fontSize: 48, transition: 'transform 0.3s ease' }}
						className="transition-transform"
					/>
				</div>

				<Button
					type="text"
					icon={<DeleteOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />}
					className="ml-auto hover:bg-red-100"
					style={{
						width: 48,
						height: 48,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						borderRadius: 12,
						backgroundColor: '#fff1f0',
						transition: 'transform 0.2s ease, background-color 0.3s ease',
						zIndex: 1
					}}
				/>
			</div>

			<div className="mt-5 p-6 rounded-xl transition duration-300" style={{ backgroundColor: '#fafafa' }}>
				<div className="flex w-full justify-between items-center">
					<Title level={4} style={{ margin: 0, color: '#000000' }}>
						{dataset.title || 'Untitled Dataset'}
					</Title>
					{createdAt ? (
						<Text style={{ fontSize: 12, color: '#666666' }}>
							Created {dayjs(createdAt).fromNow()}
						</Text>
					) : null}
				</div>

				<div className="flex w-full justify-between items-center mt-2">
					<Text style={{ fontSize: 14, color: '#444444' }}>{bucketName}</Text>
					<div className="flex items-center gap-2">
						<Tag
							style={{
								fontSize: 12,
								backgroundColor: tagColor.bg,
								color: tagColor.text,
								border: `1px solid ${tagColor.border}`
							}}
						>
							{dataType}
						</Tag>
					</div>
				</div>

				<div className="mt-3 flex justify-between items-center">
					<Tag icon={statusConfig.icon} color={statusConfig.color} className="flex items-center">
						{statusConfig.text}
					</Tag>

					<div className="text-right">
						<div className="text-xs text-gray-500">Files: {totalFiles}</div>
						<div className="text-xs text-gray-500">
							Size: {totalSizeKb ? (totalSizeKb / 1024).toFixed(2) + ' MB' : 'N/A'}
						</div>
					</div>
				</div>
			</div>
		</div>
	)

	return isClickable ? (
		CardContent
	) : (
		<Tooltip title="Dataset is not ready for viewing details">{CardContent}</Tooltip>
	)
}