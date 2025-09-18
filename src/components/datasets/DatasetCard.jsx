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
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')

    // Map many backend task names to a smaller set of visual families
    const resolveTypeFamily = (key) => {
        if (!key) return 'TEXT'
        if (key.includes('OBJECT') || key.includes('DETECTION')) return 'OBJECT_DETECTION'
        if (key.includes('SEGMENTATION')) return 'SEMANTIC_SEGMENTATION'
        if (key.includes('IMAGE')) return 'IMAGE'
        if (key.includes('MULTIMODAL') || key.includes('MULTI_MODAL')) return 'MULTIMODAL'
        if (key.includes('TIME') || key.includes('SERIES')) return 'TIME_SERIES'
        if (key.includes('TABULAR') || key.includes('TABLE')) return 'TABULAR'
        if (key.includes('TEXT') || key.includes('NLP')) return 'TEXT'
        return key
    }
    const familyKey = resolveTypeFamily(normalizedTypeKey)
    const TypeIcon = TYPE_ICON_MAP[familyKey] || TYPE_ICON_MAP[normalizedTypeKey] || CircleStackIcon

    // Minimal dark gradients per task type (avoid greenish)
    const TYPE_GRADIENT_MAP = {
        IMAGE: {
            card: 'linear-gradient(135deg, #0B0B13 0%, #1A1533 50%, #261C4D 100%)',
            tag: 'linear-gradient(135deg, #1F1440 0%, #31246B 50%, #271A55 100%)',
            border: 'rgba(124, 58, 237, 0.35)',
            accent: '#7C3AED',
            progress: { from: '#A78BFA', to: '#7C3AED' }
        },
        TEXT: {
            card: 'linear-gradient(135deg, #0B0B13 0%, #141826 50%, #1B2233 100%)',
            tag: 'linear-gradient(135deg, #121827 0%, #1A2340 50%, #0F1830 100%)',
            border: 'rgba(99, 102, 241, 0.35)',
            accent: '#6366F1',
            progress: { from: '#93C5FD', to: '#6366F1' }
        },
        TABULAR: {
            card: 'linear-gradient(135deg, #0A0A12 0%, #1A1F2A 50%, #0E141F 100%)',
            tag: 'linear-gradient(135deg, #0E1420 0%, #10223B 50%, #0B1A2E 100%)',
            border: 'rgba(59, 130, 246, 0.35)',
            accent: '#3B82F6',
            progress: { from: '#BFDBFE', to: '#3B82F6' }
        },
        TIME_SERIES: {
            card: 'linear-gradient(135deg, #0A0D10 0%, #0F1B2A 50%, #112033 100%)',
            tag: 'linear-gradient(135deg, #0B1622 0%, #0F2336 50%, #0D1D2C 100%)',
            border: 'rgba(56, 189, 248, 0.35)',
            accent: '#38BDF8',
            progress: { from: '#BAE6FD', to: '#38BDF8' }
        },
        MULTIMODAL: {
            card: 'linear-gradient(135deg, #0C0B14 0%, #1D1633 50%, #12182B 100%)',
            tag: 'linear-gradient(135deg, #1A1033 0%, #2B1B52 50%, #191B3A 100%)',
            border: 'rgba(147, 51, 234, 0.35)',
            accent: '#9333EA',
            progress: { from: '#C4B5FD', to: '#9333EA' }
        },
        OBJECT_DETECTION: {
            card: 'linear-gradient(135deg, #0B0C12 0%, #1B1A2B 50%, #0F1120 100%)',
            tag: 'linear-gradient(135deg, #1A1233 0%, #2A1C50 50%, #15182C 100%)',
            border: 'rgba(168, 85, 247, 0.35)',
            accent: '#A855F7',
            progress: { from: '#E9D5FF', to: '#A855F7' }
        },
        SEMANTIC_SEGMENTATION: {
            card: 'linear-gradient(135deg, #0B0C12 0%, #141A2B 50%, #0E1422 100%)',
            tag: 'linear-gradient(135deg, #10172A 0%, #1B2544 50%, #111C33 100%)',
            border: 'rgba(99, 102, 241, 0.35)',
            accent: '#6366F1',
            progress: { from: '#A5B4FC', to: '#6366F1' }
        },
        TEXT_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0B0B12 0%, #171924 50%, #0F1420 100%)',
            tag: 'linear-gradient(135deg, #151A2A 0%, #1C2744 50%, #121B30 100%)',
            border: 'rgba(59, 130, 246, 0.35)',
            accent: '#3B82F6',
            progress: { from: '#BFDBFE', to: '#3B82F6' }
        },
        MULTILABEL_TEXT_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0B0B12 0%, #171924 50%, #0F1420 100%)',
            tag: 'linear-gradient(135deg, #161A2A 0%, #202A47 50%, #121C32 100%)',
            border: 'rgba(99, 102, 241, 0.35)',
            accent: '#6366F1',
            progress: { from: '#A5B4FC', to: '#6366F1' }
        },
        TABULAR_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0A0A12 0%, #1A1F2A 50%, #0E141F 100%)',
            tag: 'linear-gradient(135deg, #0E1420 0%, #18243D 50%, #0C1625 100%)',
            border: 'rgba(59, 130, 246, 0.35)',
            accent: '#3B82F6',
            progress: { from: '#BFDBFE', to: '#3B82F6' }
        },
        TABULAR_REGRESSION: {
            card: 'linear-gradient(135deg, #0A0A12 0%, #1A1F2A 50%, #0E141F 100%)',
            tag: 'linear-gradient(135deg, #0D131E 0%, #142036 50%, #0D1726 100%)',
            border: 'rgba(59, 130, 246, 0.35)',
            accent: '#3B82F6',
            progress: { from: '#BFDBFE', to: '#3B82F6' }
        },
        MULTILABEL_TABULAR_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0A0A12 0%, #1A1F2A 50%, #0E141F 100%)',
            tag: 'linear-gradient(135deg, #0F1522 0%, #1A243C 50%, #0D1625 100%)',
            border: 'rgba(59, 130, 246, 0.35)',
            accent: '#3B82F6',
            progress: { from: '#BFDBFE', to: '#3B82F6' }
        },
        MULTIMODAL_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0C0B14 0%, #1D1633 50%, #12182B 100%)',
            tag: 'linear-gradient(135deg, #1B1035 0%, #2C1A54 50%, #191B3B 100%)',
            border: 'rgba(147, 51, 234, 0.35)',
            accent: '#9333EA',
            progress: { from: '#C4B5FD', to: '#9333EA' }
        },
        MULTILABEL_IMAGE_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0B0B13 0%, #1A1533 50%, #261C4D 100%)',
            tag: 'linear-gradient(135deg, #211644 0%, #32246C 50%, #291E57 100%)',
            border: 'rgba(124, 58, 237, 0.35)',
            accent: '#7C3AED',
            progress: { from: '#A78BFA', to: '#7C3AED' }
        }
    }
    const gradientTheme = TYPE_GRADIENT_MAP[familyKey] || TYPE_GRADIENT_MAP[normalizedTypeKey] || {
        card: 'linear-gradient(135deg, #0B0B11 0%, #141821 50%, #0E1220 100%)',
        tag: 'linear-gradient(135deg, #141821 0%, #0E1220 100%)',
        border: 'rgba(148, 163, 184, 0.25)'
    }

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
            className="group rounded-2xl p-6 shadow-lg w-[380px] text-white font-poppins cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{
                background: gradientTheme.card,
                border: `1px solid ${gradientTheme.border}`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
            }}
            onClick={isClickable ? handleCardClick : undefined}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div
                    className="w-20 h-20 rounded-xl shadow-md flex items-center justify-center group"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.04) 100%)',
                        border: `1px solid ${gradientTheme.border}`,
                        boxShadow: `0 6px 18px ${gradientTheme.border}`
                    }}
                >
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
            <span 
                className="px-4 py-1 text-sm font-semibold rounded-full text-white shadow-md"
                style={{
                    background: gradientTheme.tag,
                    border: `1px solid ${gradientTheme.border}`,
                }}
            >
                {taskType.replace(/_/g, ' ')}
            </span>

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
