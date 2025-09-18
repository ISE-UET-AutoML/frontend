import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card'
import { Button } from 'src/components/ui/button'
import { Tooltip } from 'src/components/ui/tooltip'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { useTheme } from 'src/theme/ThemeProvider'
import { useEffect } from 'react'
import { getExperimentById } from 'src/api/experiment'

dayjs.extend(relativeTime)

// Simple SVG icons
const CloudIcon = ({ className, ...props }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M18 10H16.74C16.18 6.57 13.17 4 9.5 4C5.36 4 2 7.36 2 11.5C2 15.64 5.36 19 9.5 19H18C19.66 19 21 17.66 21 16V13C21 11.34 19.66 10 18 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const ThunderboltIcon = ({ className, ...props }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const CheckCircleIcon = ({ className, ...props }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const ClockIcon = ({ className, ...props }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
        />
        <polyline
            points="12,6 12,12 16,14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const DeploymentUnitIcon = ({ className, ...props }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const RocketIcon = ({ className, ...props }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M4.5 16.5C4.5 12.5 7.5 6.5 12 6.5C16.5 6.5 19.5 12.5 19.5 16.5C19.5 18.5 18.5 20.5 16.5 20.5C14.5 20.5 13.5 18.5 13.5 16.5C13.5 14.5 12.5 12.5 10.5 12.5C8.5 12.5 7.5 14.5 7.5 16.5C7.5 18.5 6.5 20.5 4.5 20.5C2.5 20.5 1.5 18.5 1.5 16.5C1.5 14.5 2.5 12.5 4.5 12.5C6.5 12.5 7.5 14.5 7.5 16.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12 6.5V2L15 5L12 6.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const StopIcon = ({ className, ...props }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <rect
            x="6"
            y="6"
            width="12"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

// Define status colors and styles
const getStatusConfig = (status) => {
    switch (status) {
        case 'ONLINE':
            return {
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/20',
                icon: <CheckCircleIcon className="h-6 w-6" />,
                badge: 'Online'
            }
        case 'OFFLINE':
            return {
                color: 'text-red-400',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/20',
                icon: <StopIcon className="h-6 w-6" />,
                badge: 'Offline'
            }
        case 'SETTING_UP':
            return {
                color: 'text-orange-400',
                bgColor: 'bg-orange-500/10',
                borderColor: 'border-orange-500/20',
                icon: <ThunderboltIcon className="h-6 w-6" />,
                badge: 'Setting Up'
            }
        case 'onCloud':
            return {
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/20',
                icon: <CloudIcon className="h-6 w-6" />,
                badge: 'Ready for Deployment'
            }
        case 'inProduction':
            return {
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/20',
                icon: <CheckCircleIcon className="h-6 w-6" />,
                badge: 'Live in Production'
            }
        default:
            return {
                color: 'text-gray-400',
                bgColor: 'bg-gray-500/10',
                borderColor: 'border-gray-500/20',
                icon: <ClockIcon className="h-6 w-6" />,
                badge: 'Processing'
            }
    }
}

export default function ModelCard({ model }) {
    const { theme } = useTheme()
    const { id, name, deployStatus, createdAt, project_id, experiment_id, experiment_name: experimentName } = model
    const navigate = useNavigate()
    const statusConfig = getStatusConfig('onCloud')

    // Handle card click to navigate to details
    const handleCardClick = () => {
        navigate(PATHS.MODEL_VIEW(project_id, id))
    }

    // Handle deploy button click
    const handleDeploy = (e) => {
        e.stopPropagation()
        navigate(
            `/app/project/${project_id}/build/deployView?experimentName=${experiment_id}`
        )
    }

    // Handle redeploy button click
    const handleRedeploy = (e) => {
        e.stopPropagation()
        console.log(`Redeploying model ${id}`)
    }

    // Handle stop button click
    const handleStop = (e) => {
        e.stopPropagation()
        console.log(`Stopping model ${id}`)
    }

    return (
        <Card
            className={`group cursor-pointer rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105`}
            style={{ background: 'var(--card-gradient)', border: '1px solid var(--border)' }}
            onClick={handleCardClick}
        >
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl`} style={{ background: 'var(--hover-bg)' }}>
                        <div className={statusConfig.color}>
                            {statusConfig.icon}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.borderColor}`} style={{ background: 'var(--hover-bg)', color: 'var(--text)' }}>
                            {statusConfig.badge}
                        </div>
                        <div className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'var(--hover-bg)', color: 'var(--secondary-text)' }}>
                            ID: {id}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <CardTitle className="text-lg font-semibold mb-3 transition-colors" style={{ color: 'var(--text)' }}>
                    {name}
                </CardTitle>

                <div className="space-y-2 text-sm mb-4" style={{ color: 'var(--secondary-text)' }}>
                    {experimentName && (
                        <p className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--secondary-text)' }}></span>
                            Experiment: {experimentName}
                        </p>
                    )}
                    {createdAt && (
                        <p className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--secondary-text)' }}></span>
                            Created {dayjs(createdAt).fromNow()}
                        </p>
                    )}
                </div>

                {/* Action Buttons based on status */}
                <div className="flex gap-2">
                    {deployStatus === 'onCloud' && (
                        <Tooltip title="Deploy this model to production">
                            <Button
                                size="sm"
                                className="text-white"
                                style={{ background: 'var(--button-gradient)', border: '1px solid var(--border)' }}
                                onClick={handleDeploy}
                            >
                                <RocketIcon className="h-4 w-4 mr-1" />
                                Deploy
                            </Button>
                        </Tooltip>
                    )}

                    {deployStatus === 'inProduction' && (
                        <>
                            <Tooltip title="Stop this model in production">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleStop}
                                >
                                    <StopIcon className="h-4 w-4 mr-1" />
                                    Stop
                                </Button>
                            </Tooltip>
                            <Tooltip title="Redeploy this model">
                                <Button
                                    size="sm"
                                    className="text-white"
                                    style={{ background: 'var(--button-gradient)', border: '1px solid var(--border)' }}
                                    onClick={handleRedeploy}
                                >
                                    <DeploymentUnitIcon className="h-4 w-4 mr-1" />
                                    Redeploy
                                </Button>
                            </Tooltip>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
