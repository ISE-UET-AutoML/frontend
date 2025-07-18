import React, { useState } from 'react'
import { Typography, Tag, Button, Dropdown, Menu, Tooltip, Progress } from 'antd'
import {
    DeleteOutlined,
    IdcardOutlined
} from '@ant-design/icons'
import { PATHS } from 'src/constants/paths'
import dayjs from 'dayjs'
import { message } from 'antd';
import { uploadToS3 } from 'src/api/labelProject'


const { Title, Text } = Typography
const { REACT_APP_LABEL_STUDIO_URL } = process.env
export default function LabelProjectCard({ project, onDelete, isDeleting }) {
    const [isUploading, setIsUploading] = useState(false);
    const {
        id,
        labelStudioId, 
        name,
        taskType,
        createdAt,
        expectedLabels,
        annotationNums,
        annotatedNums
    } = project

    const handleViewProject = () => {
        if (labelStudioId) {
            const url = `${REACT_APP_LABEL_STUDIO_URL}/projects/${labelStudioId}`;
            window.open(url, '_blank');
        } else {
            console.error("Label Studio ID is missing!");
            message.error("Label Studio ID is missing for this project.");
        }
    }

    const handleDeleteClick = (e) => {
        e.stopPropagation()
        onDelete()
    }

    const handleUploadToS3 = async (e) => {
        e.stopPropagation();
        try {
            setIsUploading(true);
            await uploadToS3(labelStudioId);
            message.success('Upload to S3 successfully');
        } catch (error) {
            console.error('Error uploading to S3:', error);
            message.error('Failed to upload to S3: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div
            className="relative rounded-2xl bg-white shadow-sm border border-gray-200 
            transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md
            cursor-pointer"
            onClick={handleViewProject}
        >
            <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <IdcardOutlined className="text-2xl text-blue-600" />
                    <Title level={4} className="!m-0 !text-gray-900" title={name}>
                        {name}
                    </Title>
                </div>
                <Button
                    type="text"
                    icon={<DeleteOutlined className="text-red-500 text-lg" />}
                    className="ml-auto rounded-lg hover:bg-red-500 hover:!text-white transition-all duration-200"
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    loading={isDeleting}
                    aria-label="Delete project"
                />

            </div>

            <div className="p-5 bg-gray-50 rounded-b-2xl space-y-2">
                <div className="flex justify-between items-center">
                    <Text className="text-sm text-gray-600">Task:</Text>
                    <Tag color="blue">{taskType}</Tag>
                </div>

                <div className="flex justify-between items-center">
                    <Text className="text-sm text-gray-600">Expected Labels:</Text>
                    <Text className="text-sm text-gray-800">{expectedLabels?.length || 0}</Text>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <Text className="text-sm text-gray-600">Annotations:</Text>
                        <Text className="text-sm text-gray-800">{annotatedNums}/{annotationNums}</Text>
                    </div>
                    <Progress
                        percent={annotationNums > 0 ? Math.round((annotatedNums / annotationNums) * 100) : 0}
                        size="small"
                        status={annotatedNums === annotationNums && annotationNums > 0 ? 'success' : 'active'}
                        showInfo={false}
                    />
                </div>


                <div className="flex justify-between items-center">
                    <Text className="text-sm text-gray-600">Created:</Text>
                    <Text className="text-sm text-gray-800">
                        {createdAt ? dayjs(createdAt).fromNow() : 'N/A'}
                    </Text>
                    <Button 
                        type="primary" 
                        disabled={annotationNums === 0 || annotatedNums < annotationNums} 
                        onClick={handleUploadToS3}
                        loading={isUploading}
                    >
                        Up to S3
                    </Button>
                </div>
            </div>
        </div>
    )
}
