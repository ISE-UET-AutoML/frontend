import React, { useEffect, useState } from 'react'
import { useLocation, useOutletContext, useNavigate } from 'react-router-dom'
import { useTheme } from 'src/theme/ThemeProvider'
import {
    Card,
    Row,
    Col,
    Alert,
    Typography,
    Space,
    Statistic,
    Table,
    Tag,
    Button,
    Tooltip,
    message,
} from 'antd'
import {
    HistoryOutlined,
    CloudDownloadOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    RocketOutlined,
    BarChartOutlined,
    InfoCircleOutlined,
    ExperimentOutlined,
} from '@ant-design/icons'
import { ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import LineGraph from 'src/components/LineGraph'

import * as experimentAPI from 'src/api/experiment'
import * as mlServiceAPI from 'src/api/mlService'
import * as modelServiceAPI from 'src/api/model'
import * as experimentConfigAPI from 'src/api/experiment_config'
import { PATHS } from 'src/constants/paths'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
const { Title, Text } = Typography

// Performance Metrics Configuration
const getAccuracyStatus = (score) => {
    if (score >= 0.9) {
        return (
            <Tag
                style={{
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    border: 'none',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                Excellent
            </Tag>
        )
    } else if (score >= 0.7) {
        return (
            <Tag
                style={{
                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                    border: 'none',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                Good
            </Tag>
        )
    } else if (score >= 0.6) {
        return (
            <Tag
                style={{
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    border: 'none',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                Medium
            </Tag>
        )
    } else {
        return (
            <Tag
                style={{
                    background: 'linear-gradient(135deg, #ef4444, #f87171)',
                    border: 'none',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                Bad
            </Tag>
        )
    }
}

// Enhanced Table Columns with Tooltips
const columns = [
    {
        title: 'Metric',
        dataIndex: 'metric',
        key: 'metric',
        render: (text, record) => (
            <Tooltip title={record.description}>
                <span
                    style={{
                        color: '#e2e8f0',
                        fontFamily: 'Poppins, sans-serif',
                    }}
                >
                    {text}
                </span>{' '}
                <InfoCircleOutlined
                    style={{ color: '#60a5fa', marginLeft: 5 }}
                />
            </Tooltip>
        ),
    },
    {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
        render: (text) => (
            <span
                style={{ color: '#e2e8f0', fontFamily: 'Poppins, sans-serif' }}
            >
                {typeof text === 'number'
                    ? text.toFixed(2)
                    : isFinite(Number(text))
                        ? Number(text).toFixed(2)
                        : text}
            </span>
        ),
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
    },
]

const TrainResult = () => {
    const { theme } = useTheme()
    const { projectInfo, trainingInfo, elapsedTime } = useOutletContext()
    console.log(projectInfo)
    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const experimentName = searchParams.get('experimentName')
    const experimentId = searchParams.get('experimentId')
    const [experiment, setExperiment] = useState({})
    const [metrics, setMetrics] = useState([])
    const [valGraphs, setValGraphs] = useState({})
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(true)
    const [epoch, setEpoch] = useState(0)

    console.log('Experiment', experiment)

    useEffect(() => {
        const fetchExperiment = async () => {
            try {
                const experimentRes =
                    await experimentAPI.getExperimentById(experimentId)
                if (experimentRes.status !== 200) {
                    throw new Error('Cannot get experiment')
                }
                setExperiment((prev) => experimentRes.data)
            } catch (error) {
                console.log('Error while getting experiment', error)
            }
        }

        const fetchExperimentConfig = async () => {
            try {
                const experimentConfigRes = await experimentConfigAPI.getExperimentConfig(experimentId)
                if (experimentConfigRes.status !== 200) {
                    throw new Error('Cannot get experiment config')
                }
                setEpoch(experimentConfigRes.data[0].metrics.training_history ? experimentConfigRes.data[0].metrics.training_history.length : 0)
            }
            catch (error) {
                console.log('Error while getting experiment', error)
            }
        }

        const fetchExperimentMetrics = async () => {
            setMetrics((prev) => [])
            try {
                const metricsRes =
                    await mlServiceAPI.getFinalMetrics(experimentId)
                if (metricsRes.status !== 200) {
                    throw new Error('Cannot get metrics')
                }
                console.log(metricsRes)
                for (const key in metricsRes.data) {
                    const metricData = {
                        key: key,
                        metric: metricsRes.data[key].name,
                        value: metricsRes.data[key].score,
                        description: metricsRes.data[key].description,
                        status: getAccuracyStatus(metricsRes.data[key].score),
                    }
                    setMetrics((prev) => [...prev, metricData])
                }
            } catch (error) {
                console.log('Error while getting metrics', error)
            }
        }

        const fetchTrainingHistory = async () => {
            try {
                const res =
                    // await experimentAPI.getTrainingHistory(experimentName)
                    await mlServiceAPI.getFitHistory(
                        projectInfo.id,
                        experimentName
                    )
                console.log(res)
                const data = res.data

                console.log('history', data)
                if (data.error) {
                    message.error(
                        'An error occurred while fetching the training history.'
                    )
                    return
                }

                for (const key of Object.keys(data)) {
                    if (key === 'epoch') {
                        continue
                    }
                    setValGraphs((prev) => ({
                        ...prev,
                        [key]: data[key],
                    }))
                }
            } catch (error) {
                console.error('Error fetching training history:', error)
                message.error(
                    'Failed to load training history. Please try again later.'
                )
            }
        }

        fetchExperiment()
        fetchExperimentMetrics()
        fetchTrainingHistory()
        fetchExperimentConfig()
    }, [])

    return (
		<>
			<style>{`
                body, html {
                    background-color: var(--surface) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                .theme-table .ant-table {
                    background: transparent !important;
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                .theme-table .ant-table-thead > tr > th {
                    background: var(--table-header-bg) !important;
                    color: var(--table-header-color) !important;
                    border-bottom: 1px solid var(--table-header-border) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                .theme-table .ant-table-tbody > tr > td {
                    background: var(--table-cell-bg) !important;
                    color: var(--table-cell-color) !important;
                    border-bottom: 1px solid var(--table-cell-border) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                .theme-table .ant-table-tbody > tr:hover > td {
                    background: var(--table-row-hover) !important;
                }
                .theme-table .ant-empty-description {
                    color: var(--secondary-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
            `}</style>
			<div
				className="min-h-screen relative"
				style={{ background: 'var(--surface)' }}
			>
				{theme === 'dark' && (
					<BackgroundShapes
						width="1280px"
						height="1200px"
						shapes={[
							{
								id: 'resultBlue',
								shape: 'circle',
								size: '580px',
								gradient: {
									type: 'radial',
									shape: 'ellipse',
									colors: [
										'#5C8DFF 0%',
										'#5C8DFF 38%',
										'transparent 78%',
									],
								},
								opacity: 0.32,
								blur: '230px',
								position: { top: '160px', right: '-170px' },
								transform: 'none',
							},
							{
								id: 'resultCyan',
								shape: 'rounded',
								size: '500px',
								gradient: {
									type: 'radial',
									shape: 'circle',
									colors: [
										'#40FFFF 0%',
										'#40FFFF 48%',
										'transparent 82%',
									],
								},
								opacity: 0.28,
								blur: '200px',
								position: { top: '380px', left: '-180px' },
								transform: 'none',
							},
							{
								id: 'resultWarm',
								shape: 'rounded',
								size: '460px',
								gradient: {
									type: 'radial',
									shape: 'circle',
									colors: [
										'#FFAF40 0%',
										'#FFAF40 58%',
										'transparent 88%',
									],
								},
								opacity: 0.22,
								blur: '180px',
								position: { bottom: '120px', right: '22%' },
								transform: 'none',
							},
						]}
					/>
				)}
				<div className="relative z-10 p-6">
					<Space direction="vertical" size="large" className="w-full">
						{/* Key Metrics Cards */}
						<Row gutter={[16, 16]}>
							<Col xs={24} sm={12} md={8}>
								<Card
									className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
									style={{
										background: 'var(--card-gradient)',
										backdropFilter: 'blur(10px)',
										border: '1px solid var(--border)',
										borderRadius: '12px',
										fontFamily: 'Poppins, sans-serif',
									}}
								>
									<Statistic
										title={
											<span
												style={{
													color: 'var(--secondary-text)',
													fontFamily:
														'Poppins, sans-serif',
												}}
											>{`Final ${metrics[0]?.metric} score`}</span>
										}
										value={metrics[0]?.value * 100 || 0}
										precision={2}
										prefix={
											<TrophyOutlined
												style={{
													color: 'var(--accent-text)',
												}}
											/>
										}
										suffix="%"
										valueStyle={{
											color: 'var(--accent-text)',
											fontFamily: 'Poppins, sans-serif',
											fontWeight: 'bold',
										}}
									/>
								</Card>
							</Col>
							<Col xs={24} sm={12} md={8}>
								<Card
									className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
									style={{
										background: 'var(--card-gradient)',
										backdropFilter: 'blur(10px)',
										border: '1px solid var(--border)',
										borderRadius: '12px',
										fontFamily: 'Poppins, sans-serif',
									}}
								>
									<Statistic
										title={
											<span
												style={{
													color: '#94a3b8',
													fontFamily:
														'Poppins, sans-serif',
												}}
											>
												Training Duration
											</span>
										}
										valueRender={() => {
											const totalMinutes =
												experiment.actual_training_time ||
												0
											const mins =
												Math.floor(totalMinutes)
											const secs = Math.round(
												(totalMinutes - mins) * 60
											)

											return (
												<span
													style={{
														background:
															'linear-gradient(135deg, #f59e0b, #fbbf24)',
														WebkitBackgroundClip:
															'text',
														WebkitTextFillColor:
															'transparent',
														fontFamily:
															'Poppins, sans-serif',
														fontWeight: 'bold',
													}}
												>
													{mins}m {secs}s
												</span>
											)
										}}
										prefix={
											<ClockCircleOutlined
												style={{ color: '#f59e0b' }}
											/>
										}
									/>
								</Card>
							</Col>
							<Col xs={24} sm={12} md={8}>
								<Card
									className="border-0 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
									style={{
										background: 'var(--card-gradient)',
										backdropFilter: 'blur(10px)',
										border: '1px solid var(--border)',
										borderRadius: '12px',
										fontFamily: 'Poppins, sans-serif',
									}}
								>
									<Statistic
										title={
											<span
												style={{
													color: '#94a3b8',
													fontFamily:
														'Poppins, sans-serif',
												}}
											>
												Total Epochs
											</span>
										}
										value={epoch || 0}
										prefix={
											<ExperimentOutlined
												style={{ color: '#3b82f6' }}
											/>
										}
										valueStyle={{
											background:
												'linear-gradient(135deg, #3b82f6, #60a5fa)',
											WebkitBackgroundClip: 'text',
											WebkitTextFillColor: 'transparent',
											fontFamily: 'Poppins, sans-serif',
											fontWeight: 'bold',
										}}
									/>
								</Card>
							</Col>
						</Row>

						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Button
								type="primary"
								icon={<RocketOutlined />}
								onClick={async () => {
									const modelRes =
										await modelServiceAPI.getModelByExperimentId(
											experimentId
										)
									navigate(
										PATHS.MODEL_VIEW(
											projectInfo.id,
											modelRes.data.id
										)
									)
								}}
								size="large"
								style={{
									height: '50px',
									width: '25%',
									fontWeight: 'bold',
									marginTop: 15,
									fontSize: '18px',
									background:
										'linear-gradient(135deg, #10b981, #34d399)',
									border: 'none',
									fontFamily: 'Poppins, sans-serif',
								}}
								className="hover:shadow-lg transition-all duration-300"
							>
								View Model
							</Button>
						</div>

						{/* Expandable Details Section */}
						<Card
							className="border-0 backdrop-blur-sm shadow-lg"
							style={{
								background: 'var(--card-gradient)',
								backdropFilter: 'blur(10px)',
								border: '1px solid var(--border)',
								borderRadius: '12px',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							<Button
								type="link"
								icon={
									<BarChartOutlined
										style={{ color: '#60a5fa' }}
									/>
								}
								onClick={() =>
									setIsDetailsExpanded(!isDetailsExpanded)
								}
								className="text-xl"
								style={{
									color: '#e2e8f0',
									fontFamily: 'Poppins, sans-serif',
								}}
							>
								{isDetailsExpanded
									? 'Hide Details'
									: 'Show Detailed Results'}
							</Button>

							{isDetailsExpanded && (
								<Space
									direction="vertical"
									size="large"
									className="w-full mt-4"
								>
									{/* Performance Charts */}
									<Card
										title={
											<span
												style={{
													color: '#e2e8f0',
													fontFamily:
														'Poppins, sans-serif',
												}}
											>
												Training Performance
											</span>
										}
										className="border-0 backdrop-blur-sm"
										style={{
											background:
												'linear-gradient(135deg, rgba(51, 65, 85, 0.3) 0%, rgba(15, 23, 42, 0.3) 100%)',
											backdropFilter: 'blur(10px)',
											border: '1px solid var(--border)',
											borderRadius: '12px',
											fontFamily: 'Poppins, sans-serif',
										}}
									>
										<Row gutter={[16, 16]}>
											{Object.entries(valGraphs).map(
												([metricName, metricData]) => (
													<Col
														xs={24}
														md={12}
														key={metricName}
													>
														<ResponsiveContainer
															width="100%"
															height={300}
														>
															<LineGraph
																data={
																	metricData
																}
																label={
																	<span className="text-white">
																		{metricName.replace(
																			'_',
																			' '
																		)}{' '}
																		graph
																	</span>
																}
															/>
														</ResponsiveContainer>
													</Col>
												)
											)}
										</Row>
									</Card>

									{/* Detailed Metrics Table */}
									<Card
										title={
											<span
												style={{
													color: '#e2e8f0',
													fontFamily:
														'Poppins, sans-serif',
												}}
											>
												Comprehensive Metrics
											</span>
										}
										className="border-0 backdrop-blur-sm"
										style={{
											background:
												'linear-gradient(135deg, rgba(51, 65, 85, 0.3) 0%, rgba(15, 23, 42, 0.3) 100%)',
											backdropFilter: 'blur(10px)',
											border: '1px solid var(--border)',
											borderRadius: '12px',
											fontFamily: 'Poppins, sans-serif',
										}}
									>
										<Table
											columns={columns}
											dataSource={metrics}
											pagination={false}
											style={{
												background: 'transparent',
												fontFamily:
													'Poppins, sans-serif',
											}}
											className="theme-table"
										/>
									</Card>
								</Space>
							)}
						</Card>
					</Space>
				</div>
			</div>
		</>
	)
}

export default TrainResult
