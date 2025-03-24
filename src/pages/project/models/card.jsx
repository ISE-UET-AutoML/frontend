import { CubeTransparentIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { useNavigate } from 'react-router-dom'
import { Tag, Typography } from 'antd'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

export default function ModelCard({ model }) {
	const { _id, name, deployStatus, createdAt, project_id, experimentID } =
		model
	const navigate = useNavigate()

	// Handle card click based on deployStatus
	const handleCardClick = () => {
		const deployedStates = ['onCloud', 'inProduction']
		navigate(
			deployedStates.includes(deployStatus)
				? PATHS.PREDICT(experimentID)
				: PATHS.PROJECT_TRAININGRESULT(project_id, experimentID)
		)
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
			case 'shuttingDown':
				return 'red'
			default:
				return 'gray'
		}
	}

	// Capitalize first letter of status for display
	const formatStatus = (status) => {
		return status
			? status.charAt(0).toUpperCase() + status.slice(1)
			: 'Unknown'
	}

	return (
		<div
			key={_id}
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
						color: getStatusColor(deployStatus),
						backgroundColor: `${getStatusColor(deployStatus)}10`, // Adding transparency
						borderRadius: '12px',
						padding: '8px',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<CubeTransparentIcon
						className="h-6 w-6"
						aria-hidden="true"
					/>
				</span>
				<Tag
					color={getStatusColor(deployStatus)}
					style={{ fontSize: 14, padding: '8px' }}
				>
					{formatStatus(deployStatus)}
				</Tag>
			</div>
			<div className="mt-8">
				<div className="flex w-full justify-between items-center">
					<Title level={4} style={{ margin: 0, marginRight: 8 }}>
						{name}
					</Title>
				</div>
				{createdAt && (
					<Text type="secondary" style={{ fontSize: 12 }}>
						Created {dayjs(createdAt).fromNow()}
					</Text>
				)}
			</div>
		</div>
	)
}
