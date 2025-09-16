import React from 'react'
import { Button, Typography, Tag, Tooltip, Progress, message } from 'antd'
import {
    DeleteOutlined,
    FileImageOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    TableOutlined,
    ReconciliationOutlined,
    PictureOutlined,
    DatabaseOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { DATASET_TYPES } from 'src/constants/types'
dayjs.extend(relativeTime)

const { Text, Title } = Typography
const { REACT_APP_LABEL_STUDIO_URL } = process.env
const CardType = {
    IMAGE: {
        icon: <PictureOutlined />
    },
    TEXT: {
        icon: <FileTextOutlined />
    },
    TABULAR: {
        icon: <TableOutlined />
    },
    MULTIMODAL: {       
        icon: <ReconciliationOutlined />
    }
}
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
    const createdAt = dataset.createdAt ? dayjs(dataset.createdAt).format('M/D/YYYY h:mm A') : 'N/A' || 'UNKNOWN';
    const dataType = dataset.dataType || 'UNKNOWN';
    const processingStatus = dataset.processingStatus || 'PROCESSING'
    const totalFiles = dataset.metaData?.totalFiles || 0
    const totalSizeKb = dataset.metaData?.totalSizeKb || 0

    const isClickable = processingStatus === 'COMPLETED'
    const statusConfig = PROCESSING_STATUS[processingStatus] || PROCESSING_STATUS.PROCESSING
    const lsProjectId = dataset.ls_project?.label_studio_id || dataset.lsProject?.labelStudioId || null
    const tagColor = DATASET_TYPES[dataType]?.card || {
        bg: '#f0f0f0',
        text: '#000',
        border: '#d9d9d9'
    }
    const lsProject = dataset.lsProject || {};
    const taskType = lsProject.taskType || dataset.dataType || 'UNKNOWN';
    const annotatedCount = lsProject.annotatedNums || 0;
    const totalAnnotations = lsProject.annotationNums || dataset.quantity || 0;

    const progress = totalAnnotations > 0 ? Math.round((annotatedCount / totalAnnotations) * 100) : 0;

    const handleCardClick = () => {
        //if (isClickable) {
        //	window.location.href = PATHS.DATASET_VIEW(dataset.id)
        //}
        console.log(lsProjectId);
        if (lsProjectId) {
            const url = `${REACT_APP_LABEL_STUDIO_URL}/projects/${lsProjectId}`;
            window.open(url, '_blank');
        } else {
            console.error("Label Studio ID is missing!");
            message.error("Label Studio ID is missing for this project.");
        }
        console.log(lsProjectId);
    }

    const handleDeleteClick = (e) => {
        e.stopPropagation()
        onDelete()
    }

    const CardContent = (
        <div
            className={`relative rounded-2xl bg-gradient-to-br from-white via-white to-slate-50/30 
				shadow-lg border border-slate-200/60 backdrop-blur-sm transition-all duration-500 group
				${isClickable
                    ? 'hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:border-blue-300/50 cursor-pointer'
                    : 'cursor-not-allowed opacity-75'
                }
				before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br 
				before:from-blue-500/5 before:via-transparent before:to-purple-500/5 
				before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500`}
            onClick={handleCardClick}
            role="button"
            aria-label={`Dataset card for ${dataset.title || 'Untitled Dataset'}`}
        >
            {/* Decorative gradient border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />

            {/* Header Section with Icon, Title and Delete Button */}
            <div className="relative p-4 pb-3">
                <div className="flex items-center gap-4">
                    {/* Icon Container */}
                    <div className={`
						relative rounded-xl p-3 ${statusConfig.bgColor} 
						shadow-md ring-1 ring-white/20 transition-all duration-500
						group-hover:scale-105 group-hover:shadow-lg
					`}>
                        <span className="text-3xl text-blue-600 drop-shadow-sm group-hover:text-blue-700 transition-all duration-300">
    {CardType[dataType]?.icon || <DatabaseOutlined />}
</span>
                    </div>

                    {/* Title and Status */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <Title
                                    level={5}
                                    className="!m-0 !text-slate-800 !font-bold !leading-tight truncate group-hover:text-slate-900 transition-colors duration-300"
                                    title={dataset.title}
                                >
                                    {dataset.title || 'Untitled Dataset'}
                                </Title>
                            </div>
                            <Tag
                                icon={statusConfig.icon}
                                color={statusConfig.color}
                                className="text-xs font-semibold px-2 py-1 rounded-md shadow-sm"
                            >
                                {statusConfig.text}
                            </Tag>
                        </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                        type="text"
                        icon={<DeleteOutlined className="text-base" />}
                        className="!w-10 !h-10 rounded-lg !border-0 flex-shrink-0
							hover:!bg-red-50 hover:!text-red-600 hover:!shadow-md
							transition-all duration-300 hover:scale-105 active:scale-95"
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        loading={isDeleting}
                        aria-label="Delete dataset"
                    />
                </div>
            </div>

            {/* Main Content Section */}
            <div className="px-5 pb-3 space-y-3">
                {/* Task Type */}
                <div className="flex justify-between items-center">
                    <Text type="secondary" className="text-xs font-medium uppercase tracking-wide">
                        Task Type
                    </Text>
                    <Tag className="text-xs font-semibold bg-blue-100 text-blue-700 border-blue-200 rounded-md">
                        {taskType.replace(/_/g, ' ')}
                    </Tag>
                </div>

                {/* Progress Section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Text type="secondary" className="text-xs font-medium uppercase tracking-wide">
                            Progress
                        </Text>
                        <div className="text-right">
                            <Text strong className="text-sm font-bold text-emerald-700">
                                {annotatedCount} / {totalAnnotations}
                            </Text>
                            {/*<div className="text-xs text-emerald-600 font-medium">
								{progress.toFixed(1)}%
							</div>*/}
                        </div>
                    </div>
                    <Progress
                        percent={progress}
                        size="small"
                        strokeColor={{
                            '0%': '#f97316',
                            '30%': '#2ae2a5ff',
                            '80%': '#259a75ff',
                            '100%': '#045f45ff',
                        }}
                        trailColor="#f0fdf4"
                        format={(percent) => (
                            <span className="text-emerald-600">{percent}%</span>
                        )}
                    />
                </div>
            </div>

            {/* Footer Section */}
            <div className="bg-gradient-to-br from-slate-50/80 to-slate-100/40 rounded-b-2xl border-t border-slate-200/50">
                <div className="p-4 space-y-3">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* Bucket Info */}
                        <div className="bg-white/60 rounded-lg p-2.5 border border-slate-200/40">
                            <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                                Created at
                            </div>
                            <div className="text-sm font-semibold text-slate-700 truncate" title={createdAt}>
                                {createdAt}
                            </div>
                        </div>

                        {/* Data Type */}
                        <div className="bg-white/60 rounded-lg p-2.5 border border-slate-200/40">
                            <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                                Type
                            </div>
                            <Tag
                                style={{
                                    backgroundColor: tagColor.bg,
                                    color: tagColor.text,
                                    border: `1px solid ${tagColor.border}`,
                                    borderRadius: '4px',
                                    margin: 0,
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    padding: '2px 6px'
                                }}
                            >
                                {dataType}
                            </Tag>
                        </div>

                        {/* Files and Size */}
                        <div className="bg-white/60 rounded-lg p-2.5 border border-slate-200/40">
                            <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                                Storage
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-xs font-semibold text-slate-700">
                                    {totalFiles} files
                                </div>
                                <div className="text-xs text-slate-600">
                                    {totalSizeKb ? (totalSizeKb / 1024).toFixed(1) + ' MB' : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle bottom accent */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 
				w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full
				opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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