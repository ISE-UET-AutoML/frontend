import React from 'react'
import { Tag, Typography } from 'antd'
import { DeploymentUnitOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { useNavigate } from 'react-router-dom'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

// Define status colors
const statusColors = {
    ONLINE: 'green',
    OFFLINE: 'red',
    SETTING_UP: 'grey'
}

export default function DeployedModelCard({ deployedModel }) {
    const { id, model_id, name, create_time, status, instance_info, api_base_url } = deployedModel
    const navigate = useNavigate()

    // Handle card click
    const handleCardClick = () => {
        navigate(
            status === 'DONE'
                ? PATHS.PROJECT_TRAININGRESULT(project_id, id, name)
                : PATHS.PROJECT_TRAINING(project_id, id, name)
        )
    }

    return (
        <div
            key={id}
            className="relative group p-6 rounded-lg shadow cursor-pointer"
            style={{
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onClick={handleCardClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
        >
            <div className="flex justify-between">
                <span
                    style={{
                        color: statusColors[status],
                        backgroundColor:
                            status === 'DONE' ? '#f6ffed' : '#e6f7ff',
                        borderRadius: '12px',
                        padding: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <DeploymentUnitOutlined
                        style={{ fontSize: 24, color: statusColors[status] }}
                    />
                </span>
                <Tag
                    color={statusColors[status]}
                    style={{ fontSize: 14, padding: '8px' }}
                >
                    {status}
                </Tag>
            </div>
            <div className="mt-8">
                <div className="flex w-full justify-between items-center">
                    <Title level={4} style={{ margin: 0, marginRight: 8 }}>
                        {name}
                    </Title>
                </div>
                <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'pre-line' }}>
                    {create_time && `Created ${dayjs(create_time).fromNow()}\n`}
                    {api_base_url && (
                        <a
                            href={api_base_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: '#1890ff', textDecoration: 'underline' }}
                        >
                            {api_base_url}
                        </a>
                    )}
                </Text>
            </div>
        </div>
    )
}
