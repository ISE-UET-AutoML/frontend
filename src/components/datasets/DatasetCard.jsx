import {
    CircleStackIcon,
    StarIcon,
    TrashIcon,
    PhotoIcon,
    DocumentTextIcon,
    TableCellsIcon,
    Squares2X2Icon,
    ChartBarIcon,
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Typography, Progress, message } from 'antd'
import { DATASET_TYPES } from 'src/constants/types'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

const PROCESSING_STATUS = {
    COMPLETED: {
        color: 'success',
        text: 'Completed',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-500',
    },
    CREATING_DATASET: {
        color: 'processing',
        text: 'Creating Dataset...',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    PROCESSING: {
        color: 'processing',
        text: 'Processing',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    CREATING_LABEL_PROJECT: {
        color: 'processing',
        text: 'Creating Label Project...',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    FAILED: {
        color: 'error',
        text: 'Failed',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
    },
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
    const createdAtDisplay = dataset?.createdAt
        ? dayjs(dataset.createdAt).format('MMM D, YYYY')
        : 'N/A'
    const thumbnail = dataset?.thumbnail
    const isClickable = processingStatus === 'COMPLETED'
    const statusConfig =
        PROCESSING_STATUS[processingStatus] || PROCESSING_STATUS.PROCESSING
    const lsProjectId = dataset.lsProject?.labelStudioId || null
    const tagColor = DATASET_TYPES[dataType]?.card || {
        bg: '#f0f0f0',
        text: '#000',
        border: '#d9d9d9',
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
        TIME_SERIES: ChartBarIcon,
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
        if (key.includes('OBJECT') || key.includes('DETECTION'))
            return 'OBJECT_DETECTION'
        if (key.includes('SEGMENTATION')) return 'SEMANTIC_SEGMENTATION'
        if (key.includes('IMAGE')) return 'IMAGE'
        if (key.includes('MULTIMODAL') || key.includes('MULTI_MODAL'))
            return 'MULTIMODAL'
        if (key.includes('TIME') || key.includes('SERIES')) return 'TIME_SERIES'
        if (key.includes('TABULAR') || key.includes('TABLE')) return 'TABULAR'
        if (key.includes('TEXT') || key.includes('NLP')) return 'TEXT'
        return key
    }
    const familyKey = resolveTypeFamily(normalizedTypeKey)
    const TypeIcon =
        TYPE_ICON_MAP[familyKey] ||
        TYPE_ICON_MAP[normalizedTypeKey] ||
        CircleStackIcon

    // Minimal dark gradients per task type (avoid greenish)
    const TYPE_GRADIENT_MAP = {
        IMAGE: {
            card: 'linear-gradient(135deg, #0B0B13 0%, #1A1533 50%, #261C4D 100%)',
            tag: 'linear-gradient(135deg, #1F1440 0%, #31246B 50%, #271A55 100%)',
            border: 'rgba(124, 58, 237, 0.35)',
            accent: '#7C3AED',
            progress: { from: '#A78BFA', to: '#7C3AED' },
        },
        TEXT: {
            card: 'linear-gradient(135deg, #0B0B13 0%, #141826 50%, #1B2233 100%)',
            tag: 'linear-gradient(135deg, #121827 0%, #1A2340 50%, #0F1830 100%)',
            border: 'rgba(99, 102, 241, 0.35)',
            accent: '#6366F1',
            progress: { from: '#93C5FD', to: '#6366F1' },
        },
        TABULAR: {
            card: 'linear-gradient(135deg, #0A0A12 0%, #1A1F2A 50%, #0E141F 100%)',
            tag: 'linear-gradient(135deg, #0E1420 0%, #10223B 50%, #0B1A2E 100%)',
            border: 'rgba(59, 130, 246, 0.35)',
            accent: '#3B82F6',
            progress: { from: '#BFDBFE', to: '#3B82F6' },
        },
        TIME_SERIES: {
            card: 'linear-gradient(135deg, #0A0D10 0%, #0F1B2A 50%, #112033 100%)',
            tag: 'linear-gradient(135deg, #0B1622 0%, #0F2336 50%, #0D1D2C 100%)',
            border: 'rgba(56, 189, 248, 0.35)',
            accent: '#38BDF8',
            progress: { from: '#BAE6FD', to: '#38BDF8' },
        },
        MULTIMODAL: {
            card: 'linear-gradient(135deg, #0C0B14 0%, #1D1633 50%, #12182B 100%)',
            tag: 'linear-gradient(135deg, #1A1033 0%, #2B1B52 50%, #191B3A 100%)',
            border: 'rgba(147, 51, 234, 0.35)',
            accent: '#9333EA',
            progress: { from: '#C4B5FD', to: '#9333EA' },
        },
        OBJECT_DETECTION: {
            card: 'linear-gradient(135deg, #0B0C12 0%, #1B1A2B 50%, #0F1120 100%)',
            tag: 'linear-gradient(135deg, #1A1233 0%, #2A1C50 50%, #15182C 100%)',
            border: 'rgba(168, 85, 247, 0.35)',
            accent: '#A855F7',
            progress: { from: '#E9D5FF', to: '#A855F7' },
        },
        SEMANTIC_SEGMENTATION: {
            card: 'linear-gradient(135deg, #0B0C12 0%, #141A2B 50%, #0E1422 100%)',
            tag: 'linear-gradient(135deg, #10172A 0%, #1B2544 50%, #111C33 100%)',
            border: 'rgba(99, 102, 241, 0.35)',
            accent: '#6366F1',
            progress: { from: '#A5B4FC', to: '#6366F1' },
        },
        TEXT_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0B0B12 0%, #171924 50%, #0F1420 100%)',
            tag: 'linear-gradient(135deg, #151A2A 0%, #1C2744 50%, #121B30 100%)',
            border: 'rgba(59, 130, 246, 0.35)',
            accent: '#3B82F6',
            progress: { from: '#BFDBFE', to: '#3B82F6' },
        },
        MULTILABEL_TEXT_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0B0B12 0%, #171924 50%, #0F1420 100%)',
            tag: 'linear-gradient(135deg, #161A2A 0%, #202A47 50%, #121C32 100%)',
            border: 'rgba(99, 102, 241, 0.35)',
            accent: '#6366F1',
            progress: { from: '#A5B4FC', to: '#6366F1' },
        },
        TABULAR_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0A0A12 0%, #1A1F2A 50%, #0E141F 100%)',
            tag: 'linear-gradient(135deg, #0E1420 0%, #18243D 50%, #0C1625 100%)',
            border: 'rgba(59, 130, 246, 0.35)',
            accent: '#3B82F6',
            progress: { from: '#BFDBFE', to: '#3B82F6' },
        },
        TABULAR_REGRESSION: {
            card: 'linear-gradient(135deg, #0A0A12 0%, #1A1F2A 50%, #0E141F 100%)',
            tag: 'linear-gradient(135deg, #0D131E 0%, #142036 50%, #0D1726 100%)',
            border: 'rgba(59, 130, 246, 0.35)',
            accent: '#3B82F6',
            progress: { from: '#BFDBFE', to: '#3B82F6' },
        },
        MULTILABEL_TABULAR_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0A0A12 0%, #1A1F2A 50%, #0E141F 100%)',
            tag: 'linear-gradient(135deg, #0F1522 0%, #1A243C 50%, #0D1625 100%)',
            border: 'rgba(59, 130, 246, 0.35)',
            accent: '#3B82F6',
            progress: { from: '#BFDBFE', to: '#3B82F6' },
        },
        MULTIMODAL_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0C0B14 0%, #1D1633 50%, #12182B 100%)',
            tag: 'linear-gradient(135deg, #1B1035 0%, #2C1A54 50%, #191B3B 100%)',
            border: 'rgba(147, 51, 234, 0.35)',
            accent: '#9333EA',
            progress: { from: '#C4B5FD', to: '#9333EA' },
        },
        MULTILABEL_IMAGE_CLASSIFICATION: {
            card: 'linear-gradient(135deg, #0B0B13 0%, #1A1533 50%, #261C4D 100%)',
            tag: 'linear-gradient(135deg, #211644 0%, #32246C 50%, #291E57 100%)',
            border: 'rgba(124, 58, 237, 0.35)',
            accent: '#7C3AED',
            progress: { from: '#A78BFA', to: '#7C3AED' },
        },
    }
    const gradientTheme = TYPE_GRADIENT_MAP[familyKey] ||
        TYPE_GRADIENT_MAP[normalizedTypeKey] || {
        card: 'linear-gradient(135deg, #0B0B11 0%, #141821 50%, #0E1220 100%)',
        tag: 'linear-gradient(135deg, #141821 0%, #0E1220 100%)',
        border: 'rgba(148, 163, 184, 0.25)',
    }

    const progress =
        totalAnnotations > 0
            ? Math.round((annotatedCount / totalAnnotations) * 100)
            : 0

    const isCompleted = processingStatus === 'COMPLETED'
    const isProcessing =
        processingStatus === 'PROCESSING' ||
        processingStatus === 'CREATING_DATASET' ||
        processingStatus === 'CREATING_LABEL_PROJECT'
    const isFailed = processingStatus === 'FAILED'

    const handleCardClick = () => {
        if (isCompleted && lsProjectId) {
            const url = `${process.env.REACT_APP_LABEL_STUDIO_URL}/projects/${lsProjectId}`
            window.open(url, '_blank')
        } else if (!isCompleted) {
            message.info(
                'Dataset is still processing. Please wait for completion.'
            )
        } else {
            console.error('Label Studio ID is missing!')
            message.error('Label Studio ID is missing for this project.')
        }
    }

    return (
        <div
            key={dataset.id}
            className={`group rounded-2xl shadow-lg w-full min-h-[360px] overflow-hidden font-poppins transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col relative ${isCompleted ? 'cursor-pointer' : 'cursor-default'
                } ${isProcessing ? 'opacity-75' : ''}`}
            style={{
                background: 'var(--card-gradient)',
                border: isCompleted
                    ? '2px solid #10b981'
                    : isFailed
                        ? '2px solid #ef4444'
                        : '2px solid var(--accent-text)',
                boxShadow: isCompleted
                    ? '0 10px 30px rgba(16, 185, 129, 0.15)'
                    : isFailed
                        ? '0 10px 30px rgba(239, 68, 68, 0.15)'
                        : '0 10px 30px var(--border)',
                color: 'var(--text)',
            }}
            onClick={handleCardClick}
        >
            {/* Header Section */}
            <div className="relative px-4 pt-4 pb-2">
                {/* Thumbnail background chỉ trong header */}
                {thumbnail && (
                    <div className="absolute inset-0">
                        <img
                            src={thumbnail}
                            alt="dataset thumbnail"
                            className="w-full h-full object-cover"
                        />
                        {/* overlay gradient cho dễ nhìn hơn */}
                        <div className="absolute inset-0 bg-black/10" />
                    </div>
                )}

                {/* Nội dung header */}
                <div className="relative z-10">
                    {/* Top Row: Status + Actions */}
                    <div className="flex justify-between items-center mb-4">
                        {/* Status Badge */}
                        <div
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${isCompleted
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : isFailed
                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                        >
                            {isProcessing && (
                                <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse mr-1.5" />
                            )}
                            {statusConfig.text}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1.5">
                            <button
                                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-50"
                                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                            >
                                <StarIcon className="h-3.5 w-3.5" style={{ color: 'var(--secondary-text)' }} />
                            </button>
                            <button
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-all duration-200"
                                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                                onClick={(e) => handleDelete(e, dataset.id)}
                            >
                                <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                            </button>
                        </div>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-left mb-3">
                        <div
                            className="w-14 h-14 rounded-xl shadow-md flex items-center justify-center"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            <TypeIcon
                                className="h-7 w-7 transition-transform duration-500 ease-out"
                                style={{ color: gradientTheme.accent || 'var(--accent-text)' }}
                                aria-hidden="true"
                            />
                        </div>
                    </div>

                    {/* Data Type Tag */}
                    <div className="flex justify-left">
                        <span
                            className="px-2.5 py-1 text-xs font-medium rounded-full shadow-sm"
                            style={{
                                background: 'var(--tag-gradient)',
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                            }}
                        >
                            {dataType.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-5 py-4 flex flex-col">
                {/* Title & Description */}
                <div className="flex-1">
                    <h2
                        className="text-lg font-bold mb-2 truncate leading-tight"
                        style={{ color: 'var(--text)' }}
                    >
                        {dataset.title || 'Untitled Dataset'}
                    </h2>
                </div>

                <div
                    style={{
                        width: '100%',
                        height: '1px',
                        background:
                            'linear-gradient(90deg, transparent 0%, var(--divider) 20%, var(--divider) 80%, transparent 100%)',
                        marginBottom: 12,
                    }}
                />

                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div className="flex flex-col">
                        <span
                            className="font-medium"
                            style={{
                                color: 'var(--secondary-text)',
                                fontSize: '14px',
                            }}
                        >
                            Created
                        </span>
                        <span
                            className="font-semibold truncate mt-0.5"
                            style={{ color: 'var(--text)', fontSize: '14px' }}
                        >
                            {createdAtDisplay}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span
                            className="font-medium"
                            style={{
                                color: 'var(--secondary-text)',
                                fontSize: '14px',
                            }}
                        >
                            Files
                        </span>
                        <span
                            className="font-semibold truncate mt-0.5"
                            style={{ color: 'var(--text)', fontSize: '14px' }}
                        >
                            {totalFiles.toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span
                            className="block"
                            style={{ color: 'var(--secondary-text)' }}
                        >
                            Size
                        </span>
                        <span
                            className="block mt-0.5 font-semibold"
                            style={{ color: 'var(--text)' }}
                        >
                            {totalSizeKb
                                ? (totalSizeKb / 1024).toFixed(1) + ' MB'
                                : 'N/A'}
                        </span>
                    </div>
                </div>

                {totalAnnotations > 0 && (
                    <div className="mt-2">
                        <div className="flex justify-between items-center mb-2">
                            <span
                                className="font-medium"
                                style={{
                                    color: 'var(--secondary-text)',
                                    fontSize: '14px',
                                }}
                            >
                                Progress
                            </span>
                            <span
                                className="font-bold"
                                style={{
                                    color: 'var(--text)',
                                    fontSize: '14px',
                                }}
                            >
                                {annotatedCount.toLocaleString()} /{' '}
                                {totalAnnotations.toLocaleString()}
                            </span>
                        </div>
                        <Progress
                            percent={progress}
                            size="small"
                            strokeColor={
                                isCompleted ? '#10b981' : 'var(--accent-text)'
                            }
                            trailColor="var(--divider)"
                            strokeWidth={6}
                            format={(percent) => (
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: isCompleted
                                            ? '#10b981'
                                            : 'var(--accent-text)',
                                        fontSize: '14px',
                                    }}
                                >
                                    {percent}%
                                </span>
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
