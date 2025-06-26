import React from 'react'
import { Card, Typography, Tag, Button, Dropdown, Progress, Tooltip } from 'antd'
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    TagOutlined,
    FileTextOutlined,
    CalendarOutlined,
    UserOutlined
} from '@ant-design/icons'
import { PATHS } from 'src/constants/paths'

const { Title, Text } = Typography
const { Meta } = Card

export default function LabelProjectCard({ project, onDelete }) {
    const handleView = () => {
        // Navigate to label annotation interface
        window.location = PATHS.LABEL_PROJECT_VIEW(project._id)
    }

    const handleEdit = () => {
        window.location = PATHS.LABEL_PROJECT_EDIT(project._id)
    }

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
            onDelete(project._id)
        }
    }

    const getProjectTypeTag = (type) => {
        const typeConfig = {
            'text_classification': { color: 'blue', text: 'Text Classification' },
            'named_entity_recognition': { color: 'green', text: 'NER' },
            'text_summarization': { color: 'purple', text: 'Summarization' },
            'image_classification': { color: 'orange', text: 'Image Classification' },
            'object_detection': { color: 'red', text: 'Object Detection' },
            'sentiment_analysis': { color: 'cyan', text: 'Sentiment Analysis' }
        }

        const config = typeConfig[type] || { color: 'default', text: type }
        return <Tag color={config.color}>{config.text}</Tag>
    }

    const getStatusTag = (status) => {
        const statusConfig = {
            'active': { color: 'success', text: 'Active' },
            'completed': { color: 'default', text: 'Completed' },
            'paused': { color: 'warning', text: 'Paused' },
            'draft': { color: 'processing', text: 'Draft' }
        }

        const config = statusConfig[status] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
    }

    const calculateProgress = () => {
        if (!project.totalItems || project.totalItems === 0) return 0
        return Math.round((project.labeledItems / project.totalItems) * 100)
    }

    const menuItems = [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Details',
            onClick: handleView
        },
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit Project',
            onClick: handleEdit
        },
        {
            type: 'divider'
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete',
            danger: true,
            onClick: handleDelete
        }
    ]

    return (
        <Card
            hoverable
            className="h-full shadow-sm"
            actions={[
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={handleView}
                >
                    View
                </Button>,
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                >
                    Edit
                </Button>,
                <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            ]}
        >
            <Meta
                title={
                    <div className="flex justify-between items-start">
                        <Title level={5} className="m-0 truncate flex-1 mr-2">
                            {project.name}
                        </Title>
                        {getStatusTag(project.status)}
                    </div>
                }
                description={
                    <div className="space-y-3">
                        {/* Project Type */}
                        <div className="flex items-center gap-2">
                            <TagOutlined className="text-gray-400" />
                            {getProjectTypeTag(project.type)}
                        </div>

                        {/* Description */}
                        {project.description && (
                            <Text type="secondary" className="text-sm line-clamp-2">
                                {project.description}
                            </Text>
                        )}

                        {/* Progress */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Text className="text-sm font-medium">Progress</Text>
                                <Text className="text-sm">{calculateProgress()}%</Text>
                            </div>
                            <Progress
                                percent={calculateProgress()}
                                size="small"
                                showInfo={false}
                                strokeColor={calculateProgress() === 100 ? '#52c41a' : '#1890ff'}
                            />
                            <div className="flex justify-between">
                                <Text type="secondary" className="text-xs">
                                    {project.labeledItems || 0} labeled
                                </Text>
                                <Text type="secondary" className="text-xs">
                                    {project.totalItems || 0} total
                                </Text>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <UserOutlined />
                                <span>Created by {project.createdBy?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarOutlined />
                                <span>
                                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            {project.dataset && (
                                <div className="flex items-center gap-2">
                                    <FileTextOutlined />
                                    <Tooltip title={project.dataset.name}>
                                        <span className="truncate">
                                            Dataset: {project.dataset.name}
                                        </span>
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                    </div>
                }
            />
        </Card>
    )
}