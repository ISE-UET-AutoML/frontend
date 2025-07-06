import React from 'react'
import { Tag, Typography } from 'antd'
import { ExperimentOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { useNavigate } from 'react-router-dom'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

// Define status colors
const statusColors = {
    DONE: 'green',
    TRAINING: 'orange'
}

export default function ExperimentCard({ experiment }) {
    const { id, project_id, name, start_time, end_time, status, framework } = experiment
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
                    <ExperimentOutlined
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
                    {start_time && `Created ${dayjs(start_time).fromNow()}\n`}
                    {framework && `Framework: ${framework.toLowerCase()}`}
                </Text>
            </div>
        </div>
    )
}
