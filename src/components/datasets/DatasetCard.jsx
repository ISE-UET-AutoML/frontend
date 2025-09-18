import React from 'react'
import { CircleStackIcon, StarIcon, TrashIcon, PhotoIcon, DocumentTextIcon, TableCellsIcon, Squares2X2Icon, ChartBarIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { Button, Typography, Tag, Progress, message } from 'antd'
import { DATASET_TYPES } from 'src/constants/types'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

const PROCESSING_STATUS = {
    COMPLETED: {
        color: 'success',
        text: 'Completed',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-500'
    },
    CREATING_DATASET: {
        color: 'processing',
        text: 'Creating Dataset...',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    PROCESSING: {
        color: 'processing',
        text: 'Processing',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    CREATING_LABEL_PROJECT: {
        color: 'processing',
        text: 'Creating Label Project...',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    FAILED: {
        color: 'error',
        text: 'Failed',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
    }
}

export default function DatasetCard({ dataset, onDelete, isDeleting }) {
    const handleDelete = (e, datasetID) => {
        e.preventDefault() // Prevent card navigation
        e.stopPropagation() // Prevent event bubbling

        if (window.confirm('Are you sure you want to delete this dataset?')) {
            onDelete(datasetID)
        }
    }

    const bucketName = dataset?.bucketName || 'N/A'
    const dataType = dataset.dataType || 'UNKNOWN'
    const processingStatus = dataset.processingStatus || 'PROCESSING'
    const totalFiles = dataset.metaData?.totalFiles || 0
    const totalSizeKb = dataset.metaData?.totalSizeKb || 0
    const createdAtDisplay = dataset?.createdAt ? dayjs(dataset.createdAt).format('M/D/YYYY h:mm A') : 'N/A'

    const isClickable = processingStatus === 'COMPLETED'
    const statusConfig = PROCESSING_STATUS[processingStatus] || PROCESSING_STATUS.PROCESSING
    const lsProjectId = dataset.lsProject?.labelStudioId || null
    const tagColor = DATASET_TYPES[dataType]?.card || {
        bg: '#f0f0f0',
        text: '#000',
        border: '#d9d9d9'
    }
    const lsProject = dataset.lsProject || {}
    const taskType = dataset.dataType || 'UNKNOWN'
    const annotatedCount = lsProject.annotatedNums || 0
    const totalAnnotations = lsProject.annotationNums || dataset.quantity || 0

    // Choose icon by dataset type
    const TYPE_ICON_MAP = {
        IMAGE: PhotoIcon,
        TEXT: DocumentTextIcon,
        TABULAR: TableCellsIcon,
        TEXT_CLASSIFICATION: DocumentTextIcon,
        MULTILABEL_TEXT_CLASSIFICATION: DocumentTextIcon,
        TABULAR_CLASSIFICATION: TableCellsIcon,
        TABULAR_REGRESSION: TableCellsIcon,
        MULTILABEL_TABULAR_CLASSIFICATION: TableCellsIcon,
        MULTIMODAL_CLASSIFICATION: Squares2X2Icon,
        MULTILABEL_IMAGE_CLASSIFICATION: PhotoIcon,
        OBJECT_DETECTION: PhotoIcon,
        SEMANTIC_SEGMENTATION: PhotoIcon,
        MULTIMODAL: Squares2X2Icon,
        TIME_SERIES: ChartBarIcon
    }
    const normalizedTypeKey = (dataType || 'UNKNOWN')
        .toString()
        .toUpperCase()
        .replace(/\s+/g, '_')
    const TypeIcon = TYPE_ICON_MAP[normalizedTypeKey] || CircleStackIcon

    const progress = totalAnnotations > 0 ? Math.round((annotatedCount / totalAnnotations) * 100) : 0

    const handleCardClick = () => {
        if (lsProjectId) {
            const url = `${process.env.REACT_APP_LABEL_STUDIO_URL}/projects/${lsProjectId}`
            window.open(url, '_blank')
        } else {
            console.error("Label Studio ID is missing!")
            message.error("Label Studio ID is missing for this project.")
        }
    }

    return (
        <div
            key={dataset.id}
            className="group bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364] rounded-2xl p-6 shadow-lg w-[380px] text-white font-poppins cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            onClick={isClickable ? handleCardClick : undefined}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="w-20 h-20 rounded-xl bg-white/10 shadow-md flex items-center justify-center group">
                    <TypeIcon
                        className="h-10 w-10 text-white transition-transform duration-500 ease-out"
                        aria-hidden="true"
                    />
                </div>
                <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
                        <StarIcon className="h-5 w-5 text-white" />
                    </button>
                    <button 
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-red-400 transition"
                        onClick={(e) => handleDelete(e, dataset.id)}
                    >
                        <TrashIcon className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Title & Description */}
            <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="text-xl font-semibold">{dataset.title || 'Untitled Dataset'}</h2>
                <span 
                    className="px-4 py-1 text-sm font-semibold rounded-full text-white shadow-md shrink-0"
                    style={{
                        background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
                        border: `1px solid rgba(255, 255, 255, 0.2)`,
                    }}
                >
                    {dataType.replace(/_/g, ' ')}
                </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
                {dataset.description || 'No description available'}
            </p>

            {/* Status and Progress */}
            <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusConfig.color === 'success' ? 'bg-green-500/20 text-green-300' :
                        statusConfig.color === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-red-500/20 text-red-300'
                    }`}>
                        {statusConfig.text}
                    </span>
                </div>
                
                {totalAnnotations > 0 && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">Progress</span>
                            <span className="text-sm font-semibold text-white">
                                {annotatedCount} / {totalAnnotations}
                            </span>
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
                            trailColor="rgba(255, 255, 255, 0.1)"
                            format={(percent) => (
                                <span className="text-emerald-300 text-xs">{percent}%</span>
                            )}
                        />
                    </div>
                )}
            </div>

            {/* Tag */}
            

            {/* Footer Info */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-gray-300">
                    <div>
                        <span className="block text-gray-400">Created at</span>
                        <span className="block mt-0.5 font-semibold text-white whitespace-nowrap">{createdAtDisplay}</span>
                    </div>
                    <div>
                        <span className="block text-gray-400">Total files:</span>
                        <span className="block mt-0.5 font-semibold text-white whitespace-nowrap">{totalFiles}</span>
                    </div>
                    <div>
                        <span className="block text-gray-400">Size</span>
                        <span className="block mt-0.5 font-semibold text-white">
                            {totalSizeKb ? (totalSizeKb / 1024).toFixed(1) + ' MB' : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
