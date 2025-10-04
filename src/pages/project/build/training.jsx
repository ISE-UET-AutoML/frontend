import React, { useEffect, useState } from 'react'
import { useLocation, useOutletContext, useNavigate } from 'react-router-dom'
import { useTheme } from 'src/theme/ThemeProvider'
import { Card, Space, Steps, Button, Typography } from 'antd'
import {
	DatabaseOutlined,
	SettingOutlined,
	CloudDownloadOutlined,
	LineChartOutlined,
	DashboardOutlined,
	CheckCircleTwoTone,
	LoadingOutlined,
} from '@ant-design/icons'
import { useSpring, animated } from '@react-spring/web'
import { PATHS } from 'src/constants/paths'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { getExperimentById } from 'src/api/experiment'
import Loading from 'src/pages/project/build/Loading'

const { Title, Paragraph } = Typography

const Training = () => {
	const { theme } = useTheme()
	const { projectInfo } = useOutletContext()
	const navigate = useNavigate()
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentId = searchParams.get('experimentId')
	const [experimentName, setExperimentName] = useState(
		searchParams.get('experimentName') || 'loading'
	)
	const [status, setStatus] = useState('PENDING')
	const [currentStep, setCurrentStep] = useState(0)
	const [loading, setLoading] = useState(true)

	const getCurrentStep = (status) => {
		switch (status) {
			case 'SELECTING_INSTANCE':
				return 0
			case 'SETTING_UP':
				return 1
			case 'DOWNLOADING_DATA':
				return 2
			case 'TRAINING':
				return 3
			case 'DONE':
				return 4
			default:
				return 0
		}
	}

	useEffect(() => {
		let timeoutId

		const fetchExperiment = async () => {
			if (!experimentId || experimentId === 'loading') {
				setStatus('SELECTING_INSTANCE')
				setCurrentStep(0)
				setLoading(false)
				return
			}

			try {
				const response = await getExperimentById(experimentId)
				if (
					response.data.name &&
					response.data.name !== experimentName
				) {
					setExperimentName(response.data.name)
				}
				setStatus(response.data.status)
				setCurrentStep(getCurrentStep(response.data.status))

				if (response.data.status === 'DONE') {
					navigate(`/app/project/${projectInfo.id}/build/info`, {
						replace: true,
					})
				} else {
					timeoutId = setTimeout(fetchExperiment, 30000)
				}
			} catch (err) {
				console.error('Failed to fetch experiment:', err)
				timeoutId = setTimeout(fetchExperiment, 30000)
			}
		}

		fetchExperiment()

		return () => {
			if (timeoutId) clearTimeout(timeoutId)
		}
	}, [experimentId])

	const stepItems = [
		{
			key: 'creating',
			title: 'Creating Instance',
			icon: <DatabaseOutlined style={{ fontSize: 28 }} />,
		},
		{
			key: 'setup',
			title: 'Setup Env',
			icon: <SettingOutlined style={{ fontSize: 28 }} />,
		},
		{
			key: 'data',
			title: 'Downloading Data',
			icon: <CloudDownloadOutlined style={{ fontSize: 28 }} />,
		},
		{
			key: 'training',
			title: 'Training',
			icon: <LineChartOutlined style={{ fontSize: 28 }} />,
		},
		{
			key: 'done',
			title: 'Done',
			icon: <DashboardOutlined style={{ fontSize: 28 }} />,
		},
	]

	// Apply dynamic icon states
	const renderedSteps = stepItems.map((step, index) => {
		let iconEl
		if (index < currentStep) {
			iconEl = (
				<CheckCircleTwoTone
					twoToneColor="#22d3ee"
					style={{ fontSize: 28 }}
				/>
			)
		} else if (index === currentStep) {
			iconEl = (
				<LoadingOutlined
					style={{ fontSize: 28, color: '#3b82f6' }}
					spin
				/>
			)
		} else {
			iconEl = (
				<div
					style={{
						width: 32,
						height: 32,
						borderRadius: '50%',
						background: 'rgba(148,163,184,0.15)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontWeight: 600,
						color: '#94a3b8',
						fontSize: 14,
					}}
				>
					{index + 1}
				</div>
			)
		}

		return {
			title: (
				<div className="flex items-center">
					{step.icon}
					<span style={{ marginLeft: 8, fontWeight: 600 }}>
						{step.title}
					</span>
				</div>
			),
			icon: iconEl,
			description:
				index === currentStep
					? {
							0: 'Setting up...',
							1: 'Installing packages...',
							2: 'Fetching dataset...',
							3: 'Model training in progress...',
							4: 'Completed!',
						}[index]
					: '',
		}
	})

	return (
		<div
			className="min-h-screen relative overflow-hidden font-poppins"
			style={{ background: 'var(--surface)' }}
		>
			{theme === 'dark' && (
				<BackgroundShapes
					width="90vw"
					height="1200px"
					shapes={[
						{
							id: 'trainingBlue',
							shape: 'circle',
							size: '600px',
							gradient: {
								type: 'radial',
								shape: 'ellipse',
								colors: [
									'#5C8DFF 0%',
									'#5C8DFF 35%',
									'transparent 75%',
								],
							},
							opacity: 0.35,
							blur: '240px',
							position: { top: '120px', right: '-200px' },
						},
					]}
				/>
			)}

			<div className="relative z-10 px-8 py-6 max-w-7xl mx-auto">
				<animated.div
					style={useSpring({
						from: { opacity: 0, transform: 'translateY(20px)' },
						to: { opacity: 1, transform: 'translateY(0)' },
						config: { tension: 280, friction: 20 },
					})}
				>
					<Space
						direction="vertical"
						size="small"
						style={{ width: '100%' }}
					>
						<div style={{ padding: '20px 0px', margin: '10vh 0' }}>
							<div
								style={{
									width: '100%',
									display: 'flex',
									justifyContent: 'center',
								}}
							>
								<div
									style={{
										width: '100%',
										maxWidth: '1600px', // cho phép kéo rộng hơn
										margin: '0 auto',
									}}
								>
									<Steps
										current={currentStep}
										items={renderedSteps}
										style={{ width: '100%' }}
										className="wide-steps"
									/>
								</div>
							</div>
						</div>

						{status === 'DONE' ? (
							<div className="text-center py-12">
								<Title
									level={2}
									style={{
										color: 'var(--text)',
										marginBottom: '12px',
									}}
								>
									Training Completed Successfully!
								</Title>
								<Paragraph
									style={{
										color: 'var(--secondary-text)',
										marginBottom: '32px',
										fontSize: '16px',
										maxWidth: '600px',
										margin: '0 auto 32px',
									}}
								>
									Your model has been trained and is ready for
									use. Click below to view the results and
									performance metrics.
								</Paragraph>
								<Button
									type="primary"
									size="large"
									onClick={() =>
										navigate(
											PATHS.PROJECT_TRAININGRESULT(
												projectInfo.id,
												experimentId,
												experimentName
											)
										)
									}
									className="hover:shadow-2xl hover:scale-105 transition-all duration-300"
									style={{
										background:
											'linear-gradient(135deg, #3b82f6, #22d3ee)',
										border: 'none',
										borderRadius: '12px',
										padding: '14px 40px',
										height: 'auto',
										fontSize: '16px',
										fontWeight: '600',
										boxShadow:
											'0 8px 32px rgba(59, 130, 246, 0.3)',
									}}
								>
									View Training Results
								</Button>
							</div>
						) : (
							<Loading currentStep={currentStep} />
						)}
					</Space>
				</animated.div>
			</div>
		</div>
	)
}

export default Training
