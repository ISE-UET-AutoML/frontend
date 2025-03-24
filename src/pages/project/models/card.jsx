import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Badge, Button, Tooltip, Space } from 'antd'
import {
	CloudOutlined,
	ThunderboltOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	DeploymentUnitOutlined,
	RocketOutlined,
	StopOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

export default function ModelCard({ model }) {
	const { _id, name, deployStatus, createdAt, project_id, experimentID } =
		model
	const navigate = useNavigate()

	// Get status icon based on deployStatus
	const getStatusIcon = (status) => {
		switch (status) {
			case 'onCloud':
				return <CloudOutlined />
			case 'deploying':
				return <ThunderboltOutlined />
			case 'inProduction':
				return <CheckCircleOutlined />
			default:
				return <ClockCircleOutlined />
		}
	}

	// Define status color based on deployStatus
	const getStatusColor = (status) => {
		switch (status) {
			case 'onCloud':
				return 'blue'
			case 'deploying':
				return 'orange'
			case 'inProduction':
				return 'green'
			default:
				return 'gray'
		}
	}

	// Friendly readable status text
	const getStatusText = (status) => {
		switch (status) {
			case 'onCloud':
				return 'Ready for Deployment'
			case 'deploying':
				return 'Deploying to Production'
			case 'inProduction':
				return 'Live in Production'
			default:
				return 'Processing'
		}
	}

	// Handle card click to navigate to details
	const handleCardClick = () => {
		navigate(PATHS.PROJECT_TRAININGRESULT(project_id, experimentID))
	}

	// Handle deploy button click
	const handleDeploy = (e) => {
		e.stopPropagation()
		navigate(
			`/app/project/${project_id}/build/deployView?experimentName=${experimentID}`
		)
	}

	// Handle redeploy button click
	const handleRedeploy = (e) => {
		e.stopPropagation()
		console.log(`Redeploying model ${_id}`)
	}

	// Handle stop button click
	const handleStop = (e) => {
		e.stopPropagation()
		console.log(`Stopping model ${_id}`)
	}

	return (
		<div
			className="relative bg-white pt-2 pl-6 pb-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200"
			onClick={handleCardClick}
		>
			{/* Status Badge */}
			<Badge.Ribbon
				text={getStatusText(deployStatus)}
				color={getStatusColor(deployStatus)}
				className="right-0"
			>
				<div className="flex flex-col h-full">
					{/* Header with icon */}
					<div className="flex justify-between items-center mb-4">
						<div
							className="text-3xl"
							style={{
								color: getStatusColor(deployStatus),
							}}
						>
							{getStatusIcon(deployStatus)}
						</div>
					</div>

					{/* Model Name */}
					<Title
						level={4}
						className="my-2 pr-2"
						ellipsis={{ tooltip: name }}
					>
						{name}
					</Title>

					{/* Creation Time */}
					<Text type="secondary" className="text-xs">
						Created {dayjs(createdAt).fromNow()}
					</Text>

					{/* Action Buttons based on status */}
					<div className="mt-6 pt-4 border-t border-gray-100">
						<Space>
							{deployStatus === 'onCloud' && (
								<Tooltip title="Deploy this model to production">
									<Button
										type="primary"
										icon={<RocketOutlined />}
										onClick={handleDeploy}
									>
										Deploy
									</Button>
								</Tooltip>
							)}

							{deployStatus === 'inProduction' && (
								<>
									<Tooltip title="Stop this model in production">
										<Button
											type="danger"
											icon={<StopOutlined />}
											onClick={handleStop}
											className="bg-red-100 text-red-800"
										>
											Shut down
										</Button>
									</Tooltip>
									<Tooltip title="Redeploy this model">
										<Button
											type="primary"
											icon={<DeploymentUnitOutlined />}
											onClick={handleRedeploy}
										>
											Redeploy
										</Button>
									</Tooltip>
								</>
							)}
						</Space>
					</div>
				</div>
			</Badge.Ribbon>
		</div>
	)
}
