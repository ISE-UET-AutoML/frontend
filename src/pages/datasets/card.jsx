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
		text: 'Completed',
		bgColor: 'bg-green-100',
		borderColor: 'border-green-500'
	},
	CREATING_DATASET: {
		color: 'processing',
		icon: <SyncOutlined spin />,
		text: 'Creating Dataset...',
		bgColor: 'bg-blue-50',
		borderColor: 'border-blue-200'
	},
	PROCESSING: {
		color: 'processing',
		icon: <SyncOutlined spin />,
		text: 'Processing',
		bgColor: 'bg-blue-50',
		borderColor: 'border-blue-200'
	},
	CREATING_LABEL_PROJECT: {
		color: 'processing',
		icon: <SyncOutlined spin />,
		text: 'Creating Label Project...',
		bgColor: 'bg-blue-50',
		borderColor: 'border-blue-200'
	},
	FAILED: {
		color: 'error',
		icon: <ExclamationCircleOutlined />,
		text: 'Failed',
		bgColor: 'bg-red-50',
		borderColor: 'border-red-200'
	}
}

export default function DatasetCard({ dataset, onDelete, isDeleting }) {
	const createdAt = dataset.createdAt
	const bucketName = dataset?.bucketName || 'N/A'
	const dataType = dataset.dataType || 'UNKNOWN'
	const processingStatus = dataset.processingStatus || 'PROCESSING'
	const totalFiles = dataset.metaData?.totalFiles || 0
	const totalSizeKb = dataset.metaData?.totalSizeKb || 0

	const isClickable = processingStatus === 'COMPLETED'
	const statusConfig = PROCESSING_STATUS[processingStatus] || PROCESSING_STATUS.PROCESSING

	const tagColor = DATASET_TYPES[dataType]?.card || {
		bg: '#f0f0f0',
		text: '#000',
		border: '#d9d9d9'
	}

	const handleCardClick = () => {
		if (isClickable) {
			window.location.href = PATHS.DATASET_VIEW(dataset.id)
		}
	}

	const handleDeleteClick = (e) => {
		e.stopPropagation()
		onDelete()
	}

	const CardContent = (
		<div
			className={`relative rounded-2xl bg-white shadow-sm border ${statusConfig.borderColor} 
        transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md
        ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
			onClick={handleCardClick}
			role="button"
			aria-label={`Dataset card for ${dataset.title || 'Untitled Dataset'}`}
		>
			<div className="p-5 flex items-center gap-4">
				<div className={`rounded-xl p-3 ${statusConfig.bgColor} ring-4 ring-white transition-all duration-300`}>
					<DatabaseOutlined className="text-4xl text-blue-600 transform transition-transform group-hover:scale-110" />
				</div>

				<Button
					type="text"
					icon={<DeleteOutlined className="text-red-500 text-lg" />}
					className="ml-auto rounded-lg hover:bg-red-500 hover:!text-white transition-all duration-200"
					onClick={handleDeleteClick}
					disabled={isDeleting}
					loading={isDeleting}
					aria-label="Delete dataset"
				/>
			</div>

			<div className="p-5 bg-gray-50 rounded-b-2xl">
				<div className="flex items-center justify-between mb-3">
					<Title level={4} className="!m-0 !text-gray-900 truncate max-w-[70%]" title={dataset.title}>
						{dataset.title || 'Untitled Dataset'}
					</Title>
					{createdAt && (
						<Text className="text-xs text-gray-500">
							Created {dayjs(dataset.createdAt).fromNow()}
						</Text>
					)}
				</div>

				<div className="flex items-center justify-between mb-3">
					<Text className="text-sm text-gray-600 truncate max-w-[60%]" title={bucketName}>
						{bucketName}
					</Text>
					<Tag
						className="text-xs font-medium"
						style={{
							backgroundColor: tagColor.bg,
							color: tagColor.text,
							border: `1px solid ${tagColor.border}`,
							borderRadius: '6px'
						}}
					>
						{dataType}
					</Tag>
				</div>

				<div className="flex items-center justify-between">
					<Tag
						icon={statusConfig.icon}
						color={statusConfig.color}
						className="flex items-center text-[16px] font-medium px-2 py-1"
					>
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
		<Tooltip title="Dataset is not ready for viewing details">
			{CardContent}
		</Tooltip>
	)
}