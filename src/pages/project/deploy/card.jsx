import React from 'react'
import { Tag, Typography } from 'antd'
import { DeploymentUnitOutlined, SettingOutlined, StopOutlined, CloudServerOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { useNavigate, useParams } from 'react-router-dom'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

// Define status colors
const statusColors = {
    ONLINE: 'green',
    OFFLINE: 'red',
    SETTING_UP: '',
    DOWNLOADING_MODEL: 'blue'
}

const getStatusIcon = (status) => {
    const style = { fontSize: 24, color: statusColors[status] }
    switch (status) {
        case 'OFFLINE':
            return <StopOutlined style={style} />
        case 'SETTING_UP':
            return <SettingOutlined style={style} />
        case 'ONLINE':
            return <CloudServerOutlined style={style} />
        default:
            return <DeploymentUnitOutlined style={style} />
    }
}


export default function DeployedModelCard({ deployedModel }) {
    const { id: projectId } = useParams()
    const { id: deploy_id, model_id, name, create_time, status, instance_info, api_base_url } = deployedModel
    const navigate = useNavigate()

    // Handle card click
    const handleCardClick = () => {
        navigate(
            (status === 'ONLINE' || status === 'OFFLINE')
                ? PATHS.MODEL_DEPLOY_VIEW(projectId, deploy_id)
                : PATHS.SETTING_UP_DEPLOY(projectId, deploy_id, model_id)
        )
    }

    return (
        <div
            key={deploy_id}
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
                        borderRadius: '12px',
                        padding: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {getStatusIcon(status)}
                </span>
                <Tag
                    color={statusColors[status]}
                    style={{ fontSize: 14, padding: '8px' }}
                >
                    {status.replace("_", " ")}
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
