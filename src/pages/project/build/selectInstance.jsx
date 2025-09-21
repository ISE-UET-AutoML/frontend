import React, { useState, useEffect } from 'react'
import {
	useSearchParams,
	useOutletContext,
	useNavigate,
} from 'react-router-dom'
import { trainCloudModel } from 'src/api/mlService'
import { createDownZipPU } from 'src/api/dataset'
import {
	Card,
	Tabs,
	Slider,
	InputNumber,
	Button,
	Space,
	Typography,
	message,
	Steps,
	Row,
	Col,
	Collapse,
	Select,
	Input,
	Spin,
	Modal,
} from 'antd'
import {
	ThunderboltOutlined,
	CloudDownloadOutlined,
	SettingOutlined,
	RocketOutlined,
} from '@ant-design/icons'
import { createInstance, deleteInstance } from 'src/api/resource'
import {
	SERVICES,
	GPU_NAMES,
	GPU_LEVELS,
	INSTANCE_SIZE_DETAILS,
	InstanceSizeCard,
	generateRandomKey,
	CostEstimator,
	InstanceInfo,
} from 'src/constants/clouldInstance'

const { Text } = Typography
const { Option } = Select

const SelectInstance = () => {
	const { projectInfo, updateFields, selectedProject } = useOutletContext()
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState('automatic')
	const [isLoading, setIsLoading] = useState(false)
	const [isCreatingInstance, setIsCreatingInstance] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)
	const [formData, setFormData] = useState({
		service: SERVICES[0].name,
		gpuNumber: GPU_LEVELS[0].gpuNumber,
		gpuName: GPU_LEVELS[0].name,
		disk: GPU_LEVELS[0].disk,
		trainingTime: 2,
		budget: (GPU_LEVELS[0].cost * 2).toFixed(2),
		cost: GPU_LEVELS[0].cost,
		instanceSize: 'Weak',
	})
	const [instanceInfo, setInstanceInfo] = useState(null)
	const [sshKey, setSshKey] = useState('')
	const [infrastructureData, setInfrastructureData] = useState({
		id: '',
		sshPort: '',
		publicIP: '',
		presets: 'medium_quality',
		deployPort: '',
		username: '',
		datasetPath: './datasets/tabular',
	})

	// Generate SSH key when switching to userInfras tab
	useEffect(() => {
		if (activeTab === 'userInfras' && !sshKey) {
			const generatedKey = generateRandomKey()
			setSshKey(generatedKey)
		}
	}, [activeTab])

	const handleCopyToClipboard = () => {
		navigator.clipboard.writeText(sshKey)
		message.success('SSH Key copied to clipboard')
	}

	const handleInfrastructureChange = (field) => (value) => {
		setInfrastructureData((prev) => ({
			...prev,
			[field]: value,
		}))
	}

	const handleTrainingTimeChange = (value) => {
		if (value >= 0 && value <= 24) {
			setFormData((prev) => ({
				...prev,
				trainingTime: value,
			}))
		}
	}

	const handleGpuNumberChange = (value) => {
		if (value >= 1 && value <= 8) {
			setFormData((prev) => ({
				...prev,
				gpuNumber: value,
			}))
		}
	}

	const handleDiskChange = (value) => {
		if (value >= 10 && value <= 1000) {
			setFormData((prev) => ({
				...prev,
				disk: value,
			}))
		}
	}

	const handleManualConfigChange = (field) => (value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}))
		// Update budget automatically when relevant fields change
		if (field === 'gpuName' || field === 'trainingTime') {
			const selectedGPU = GPU_LEVELS.find(
				(gpu) =>
					gpu.name ===
					(field === 'gpuName' ? value : formData.gpuName)
			)
			const trainingTime =
				field === 'trainingTime' ? value : formData.trainingTime
			if (selectedGPU && trainingTime) {
				setFormData((prev) => ({
					...prev,
					budget: (selectedGPU.cost * trainingTime).toFixed(2),
				}))
			}
		}
	}

	// Train model 
	const trainModel = async () => {
		// For instance
		let instanceSize = formData.instanceSize
		let selectedGPU
		switch (instanceSize) {
			case 'Weak':
				selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 1)
				break
			case 'Medium':
				selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 2)
				break
			case 'Strong':
				selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 4)
				break
			case 'Super Strong':
				selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 6)
				break
			case 'Rocket':
				selectedGPU = GPU_LEVELS.find((gpu) => gpu.gpuNumber === 8)
				break
			default:
				selectedGPU = GPU_LEVELS[0]
				break
		}
		await new Promise((resolve) => setTimeout(resolve, 1500))
		setFormData((prev) => ({
			...prev,
			service: SERVICES[0].name,
			gpuNumber: selectedGPU.gpuNumber,
			gpuName: selectedGPU.name,
			disk: selectedGPU.disk,
			budget: (selectedGPU.cost * formData.trainingTime).toFixed(2),
			cost: selectedGPU.cost,
		}))
		const time = formData.trainingTime
		const cost = formData.cost * formData.trainingTime
		console.log('Cost: ', cost)

		const presignUrl = await createDownZipPU(selectedProject.dataset_title)
		// const creating_instance_time = instanceInfoData.creating_time || 60
		const payload = {
			cost: cost,
			trainingTime: time * 3600,
			presets: 'medium_quality',
			datasetUrl: presignUrl.data,
			datasetLabelUrl: 'hello',
			problemType: selectedProject.meta_data?.is_binary_class
				? 'BINARY'
				: 'MULTICLASS',
			framework: 'autogluon',
			datasetMetadata: selectedProject.meta_data,
		}
		console.log('Train payload: ', payload)
		const res1 = await trainCloudModel(projectInfo.id, payload)
		const experimentName = res1.data.experimentName
		return res1.data
	}

	// Find instance and train model sequentially
	const handleStartTraining = async () => {
		if (!formData.trainingTime) {
			message.error('Please input training time')
			return
		}
		setIsProcessing(true)

		navigate(
			`/app/project/${projectInfo.id}/build/training?experimentName=loading&experimentId=loading`,
			{ replace: true }
		)

		try {
			const trainResult = await trainModel()

			if (
				trainResult &&
				trainResult.experimentName &&
				trainResult.experimentId
			) {
				navigate(
					`/app/project/${projectInfo.id}/build/training?experimentName=${trainResult.experimentName}&experimentId=${trainResult.experimentId}`,
					{ replace: true }
				)
			} else {
				message.error('Training result is invalid!')
				navigate(
					`/app/project/${projectInfo.id}/build/selectInstance`,
					{ replace: true }
				)
			}
		} catch (error) {
			console.error('Error', error)
			message.error('Failed to find instance or train model.')
			navigate(`/app/project/${projectInfo.id}/build/selectInstance`, {
				replace: true,
			})
		} finally {
			setIsProcessing(false)
		}
	}

	const items = [
		{
			key: 'automatic',
			label: <span>⚡Automatic Configuration</span>,
			children: (
				<Space
					direction="vertical"
					size="large"
					className="w-full rounded-lg shadow-sm"
				>
					<Row gutter={[24, 24]}>
						<Col span={16}>
							<Card className="dark-build-card rounded-lg shadow-sm">
								<Space
									direction="vertical"
									size="large"
									style={{ width: '100%' }}
								>
									<div>
										<Text className="dark-build-text-gradient ">
											Training Duration
										</Text>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '16px',
												marginTop: 8,
											}}
										>
											<Slider
												className="dark-build-slider"
												style={{ flex: 1 }}
												min={0}
												max={24}
												step={0.5}
												value={
													formData.trainingTime || 0
												}
												onChange={
													handleTrainingTimeChange
												}
												tooltip={{ open: false }}
											/>
											<div
												style={{
													background:
														'var(--hover-bg)',
													border: '1px solid var(--border)',
													borderRadius: '12px',
													padding: '12px 16px',
													minWidth: '125px',
													textAlign: 'center',
												}}
											>
												<Text
													style={{
														color: 'var(--text)',
														fontSize: '16px',
														fontWeight: '600',
														display: 'flex',
														alignItems: 'center',
														justifyContent:
															'center',
														gap: '4px',
													}}
												>
													<span>
														{formData.trainingTime ||
															0}
													</span>
													<span>hours</span>
												</Text>
											</div>
										</div>
										<Text className="dark-build-text">
											Recommended: 1-24 hours for most
											models
										</Text>
									</div>

									<div>
										<Text className="dark-build-text-gradient">
											Performance Level
										</Text>
										<div
											style={{
												display: 'grid',
												gap: '16px',
												marginTop: '16px',
											}}
										>
											{Object.entries(
												INSTANCE_SIZE_DETAILS
											).map(([size, details]) => (
												<InstanceSizeCard
													key={size}
													size={size}
													details={details}
													selected={
														formData.instanceSize ===
														size
													}
													onClick={() => {
														// Set default training times based on performance level
														const defaultTrainingTimes =
															{
																Weak: 2,
																Medium: 4,
																Strong: 6,
																'Super Strong': 8,
																Rocket: 12,
															}

														setFormData((prev) => ({
															...prev,
															gpuNumber:
																details
																	.instanceDetails
																	.gpuNumber,
															gpuName:
																details
																	.instanceDetails
																	.name,
															disk: details
																.instanceDetails
																.disk,
															cost: details
																.instanceDetails
																.cost,
															instanceSize: size,
															trainingTime:
																defaultTrainingTimes[
																	size
																] ||
																prev.trainingTime,
															budget: (
																details
																	.instanceDetails
																	.cost *
																(defaultTrainingTimes[
																	size
																] ||
																	prev.trainingTime)
															).toFixed(2),
														}))
													}}
												/>
											))}
										</div>
									</div>
								</Space>
							</Card>
						</Col>

						<Col span={8}>
							<Space
								direction="vertical"
								size="large"
								style={{ width: '100%' }}
							>
								<InstanceInfo formData={formData} />
								<CostEstimator
									hours={formData.trainingTime}
									gpuLevel={GPU_LEVELS.find(
										(gpu) => gpu.name === formData.gpuName
									)}
								/>
							</Space>
							<div className="action-container mt-4 w-full justify-between items-center">
								<Button
									type="primary"
									size="large"
									icon={<ThunderboltOutlined />}
									onClick={handleStartTraining}
									loading={isProcessing}
									disabled={
										!formData.trainingTime || isProcessing
									}
									className="dark-build-button"
								>
									{isProcessing
										? 'Finding instance...'
										: 'Start Training'}
								</Button>
							</div>
						</Col>
					</Row>
				</Space>
			),
		},
		{
			key: 'manual',
			label: <span>🛠️Manual Configuration</span>,
			children: (
				<Space
					direction="vertical"
					size="large"
					className="w-full rounded-lg shadow-sm"
				>
					<Row gutter={[24, 24]}>
						<Col span={16}>
							<Card className="dark-build-card rounded-lg shadow-sm">
								<Space
									direction="vertical"
									size="large"
									style={{ width: '100%' }}
								>
									<div>
										<Text className="dark-build-text-gradient">
											Training Duration
										</Text>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '16px',
												marginTop: 8,
											}}
										>
											<Slider
												className="dark-build-slider"
												style={{ flex: 1 }}
												min={0}
												max={24}
												step={0.5}
												value={
													formData.trainingTime || 0
												}
												onChange={
													handleTrainingTimeChange
												}
												tooltip={{ open: false }}
											/>
											<div
												style={{
													background:
														'var(--hover-bg)',
													border: '1px solid var(--border)',
													borderRadius: '12px',
													padding: '12px 16px',
													minWidth: '125px',
													textAlign: 'center',
												}}
											>
												<Text
													style={{
														color: 'var(--text)',
														fontSize: '16px',
														fontWeight: '600',
														display: 'flex',
														alignItems: 'center',
														justifyContent:
															'center',
														gap: '4px',
													}}
												>
													<span>
														{formData.trainingTime ||
															0}
													</span>
													<span>hours</span>
												</Text>
											</div>
										</div>
										<Text className="dark-build-text">
											Recommended: 1-24 hours for most
											models
										</Text>
									</div>

									<div>
										<Text className="dark-build-text-gradient">
											Manual Configuration
										</Text>
										<Space
											direction="vertical"
											size="middle"
											style={{
												width: '100%',
												marginTop: 16,
											}}
										>
											<div>
												<Text className="dark-build-text">
													Service Provider
												</Text>
												<Select
													className="dark-build-select"
													style={{
														width: '100%',
														marginTop: 8,
													}}
													value={formData.service}
													onChange={handleManualConfigChange(
														'service'
													)}
												>
													{SERVICES.map((service) => (
														<Option
															key={service.name}
															value={service.name}
														>
															{service.name} -{' '}
															{
																service.description
															}
														</Option>
													))}
												</Select>
											</div>

											<div>
												<Text className="dark-build-text">
													GPU Type
												</Text>
												<Select
													className="dark-build-select"
													style={{
														width: '100%',
														marginTop: 8,
													}}
													value={formData.gpuName}
													onChange={handleManualConfigChange(
														'gpuName'
													)}
												>
													{GPU_LEVELS.map((gpu) => (
														<Option
															key={gpu.name}
															value={gpu.name}
														>
															{gpu.name} (
															{gpu.memory})
														</Option>
													))}
												</Select>
											</div>

											<div>
												<Text className="dark-build-text">
													Number of GPUs
												</Text>
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '16px',
														marginTop: 8,
													}}
												>
													<Slider
														className="dark-build-slider"
														style={{ flex: 1 }}
														min={1}
														max={8}
														step={1}
														value={
															formData.gpuNumber
														}
														onChange={
															handleGpuNumberChange
														}
														tooltip={{
															open: false,
														}}
													/>
													<div
														style={{
															background:
																'var(--hover-bg)',
															border: '1px solid var(--border)',
															borderRadius:
																'12px',
															padding:
																'12px 16px',
															minWidth: '125px',
															textAlign: 'center',
														}}
													>
														<Text
															style={{
																color: 'var(--text)',
																fontSize:
																	'16px',
																fontWeight:
																	'600',
																display: 'flex',
																alignItems:
																	'center',
																justifyContent:
																	'center',
																gap: '4px',
															}}
														>
															<span>
																{
																	formData.gpuNumber
																}
															</span>
															<span>GPUs</span>
														</Text>
													</div>
												</div>
											</div>

											<div>
												<Text className="dark-build-text">
													Disk Space
												</Text>
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '16px',
														marginTop: 8,
													}}
												>
													<Slider
														className="dark-build-slider"
														style={{ flex: 1 }}
														min={10}
														max={1000}
														step={10}
														value={formData.disk}
														onChange={
															handleDiskChange
														}
														tooltip={{
															open: false,
														}}
													/>
													<div
														style={{
															background:
																'var(--hover-bg)',
															border: '1px solid var(--border)',
															borderRadius:
																'12px',
															padding:
																'12px 16px',
															minWidth: '125px',
															textAlign: 'center',
														}}
													>
														<Text
															style={{
																color: 'var(--text)',
																fontSize:
																	'16px',
																fontWeight:
																	'600',
																display: 'flex',
																alignItems:
																	'center',
																justifyContent:
																	'center',
																gap: '4px',
															}}
														>
															<span>
																{formData.disk}
															</span>
															<span>GB</span>
														</Text>
													</div>
												</div>
											</div>
										</Space>
									</div>
								</Space>
							</Card>
						</Col>

						<Col span={8}>
							<Space
								direction="vertical"
								size="large"
								style={{ width: '100%' }}
							>
								<InstanceInfo formData={formData} />
								<CostEstimator
									hours={formData.trainingTime}
									gpuLevel={GPU_LEVELS.find(
										(gpu) => gpu.name === formData.gpuName
									)}
								/>
							</Space>
							<div className="action-container mt-4 w-full justify-between items-center">
								<Button
									type="primary"
									size="large"
									icon={<ThunderboltOutlined />}
									onClick={handleStartTraining}
									loading={isProcessing}
									disabled={
										!formData.trainingTime || isProcessing
									}
									className="dark-build-button"
								>
									{isProcessing
										? 'Finding instance...'
										: 'Start Training'}
								</Button>
							</div>
						</Col>
					</Row>
				</Space>
			),
		},
		{
			key: 'userInfras',
			label: <span>🏗️Your Infrastructure</span>,
			children: (
				<Space
					direction="vertical"
					size="large"
					className="w-full rounded-lg shadow-sm"
				>
					<Row gutter={[24, 24]}>
						<Col span={16}>
							<Card className="dark-build-card rounded-lg shadow-sm">
								<Space
									direction="vertical"
									size="large"
									style={{ width: '100%' }}
								>
									<div>
										<Text className="dark-build-text-gradient">
											Training Duration
										</Text>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '16px',
												marginTop: 8,
											}}
										>
											<Slider
												className="dark-build-slider"
												style={{ flex: 1 }}
												min={0}
												max={24}
												step={0.5}
												value={
													formData.trainingTime || 0
												}
												onChange={
													handleTrainingTimeChange
												}
												tooltip={{ open: false }}
											/>
											<div
												style={{
													background:
														'var(--hover-bg)',
													border: '1px solid var(--border)',
													borderRadius: '12px',
													padding: '12px 16px',
													minWidth: '125px',
													textAlign: 'center',
												}}
											>
												<Text
													style={{
														color: 'var(--text)',
														fontSize: '16px',
														fontWeight: '600',
														display: 'flex',
														alignItems: 'center',
														justifyContent:
															'center',
														gap: '4px',
													}}
												>
													<span>
														{formData.trainingTime ||
															0}
													</span>
													<span>hours</span>
												</Text>
											</div>
										</div>
										<Text className="dark-build-text">
											Recommended: 1-24 hours for most
											models
										</Text>
									</div>

									<div>
										<Space
											direction="vertical"
											size="middle"
											style={{
												width: '100%',
											}}
										>
											<div>
												<Text className="dark-build-text">
													SSH Public Key
												</Text>
												<Input.TextArea
													className="dark-build-input"
													value={sshKey}
													rows={2}
													readOnly
													// style={{ marginTop: 8 }}
												/>
												<Button
													onClick={
														handleCopyToClipboard
													}
													type="primary"
													style={{ marginTop: 8 }}
												>
													Copy
												</Button>
											</div>
											<div>
												<Text className="dark-build-text">
													Instance ID
												</Text>
												<Input
													className="dark-build-input"
													value={
														infrastructureData.id
													}
													onChange={(e) =>
														handleInfrastructureChange(
															'id'
														)(e.target.value)
													}
													style={{ marginTop: 8 }}
													placeholder="Enter instance ID"
												/>
											</div>
											<div>
												<Text className="dark-build-text">
													SSH Port
												</Text>
												<InputNumber
													className="dark-build-input"
													value={
														infrastructureData.sshPort
													}
													onChange={handleInfrastructureChange(
														'sshPort'
													)}
													style={{
														width: '100%',
														marginTop: 8,
													}}
													min={1}
													max={65535}
													placeholder="Enter SSH port"
												/>
											</div>
											<div>
												<Text className="dark-build-text">
													Public IP
												</Text>
												<Input
													className="dark-build-input"
													value={
														infrastructureData.publicIP
													}
													onChange={(e) =>
														handleInfrastructureChange(
															'publicIP'
														)(e.target.value)
													}
													style={{ marginTop: 8 }}
													placeholder="Enter public IP"
												/>
											</div>
											<div>
												<Text className="dark-build-text">
													Quality Presets
												</Text>
												<Select
													className="dark-build-select"
													value={
														infrastructureData.presets
													}
													onChange={handleInfrastructureChange(
														'presets'
													)}
													style={{
														width: '100%',
														marginTop: 8,
													}}
												>
													<Option value="low_quality">
														Low Quality
													</Option>
													<Option value="medium_quality">
														Medium Quality
													</Option>
													<Option value="high_quality">
														High Quality
													</Option>
												</Select>
											</div>
											<div>
												<Text className="dark-build-text">
													Deploy Port
												</Text>
												<InputNumber
													className="dark-build-input"
													value={
														infrastructureData.deployPort
													}
													onChange={handleInfrastructureChange(
														'deployPort'
													)}
													style={{
														width: '100%',
														marginTop: 8,
													}}
													min={1}
													max={65535}
													placeholder="Enter deploy port"
												/>
											</div>
											<div>
												<Text className="dark-build-text">
													Username
												</Text>
												<Input
													className="dark-build-input"
													value={
														infrastructureData.username
													}
													onChange={(e) =>
														handleInfrastructureChange(
															'username'
														)(e.target.value)
													}
													style={{ marginTop: 8 }}
													placeholder="Enter username"
												/>
											</div>
											<div>
												<Text className="dark-build-text">
													Dataset Path
												</Text>
												<Input
													className="dark-build-input"
													value={
														infrastructureData.datasetPath
													}
													onChange={(e) =>
														handleInfrastructureChange(
															'datasetPath'
														)(e.target.value)
													}
													style={{ marginTop: 8 }}
													placeholder="Enter dataset path"
												/>
											</div>
										</Space>
									</div>
								</Space>
							</Card>
						</Col>

						<Col span={8}>
							<Space
								direction="vertical"
								size="large"
								style={{ width: '100%' }}
							>
								<InstanceInfo formData={formData} />
								<CostEstimator
									hours={formData.trainingTime}
									gpuLevel={GPU_LEVELS.find(
										(gpu) => gpu.name === formData.gpuName
									)}
								/>
							</Space>
							<div className="action-container mt-4 w-full justify-between items-center">
								<Button
									type="primary"
									size="large"
									icon={<ThunderboltOutlined />}
									onClick={handleStartTraining}
									loading={isProcessing}
									disabled={
										!formData.trainingTime || isProcessing
									}
									className="dark-build-button"
								>
									{isProcessing
										? 'Finding instance...'
										: 'Start Training'}
								</Button>
							</div>
						</Col>
					</Row>
				</Space>
			),
		},
	]

	return (
		<>
			<style>{`
                .dark-build-page {
                    background: transparent;
                    min-height: 100vh;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-page * {
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-tabs .ant-tabs-tab {
                    color: var(--tabs-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                    font-size: 16px !important;
                }
                
                .dark-build-tabs .ant-tabs-tab:hover {
                    color: var(--accent-text) !important;
                }
                
                .dark-build-tabs .ant-tabs-tab-active {
                    color: var(--accent-text) !important;
                }
                
                .dark-build-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: var(--accent-text) !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-tabs .ant-tabs-ink-bar {
                    background: var(--tabs-ink-bar) !important;
                    height: 3px !important;
                }
                
                .dark-build-tabs .ant-tabs-content-holder {
                    background: transparent !important;
                }
                
                .dark-build-card {
                    background: var(--card-gradient) !important;
                    backdrop-filter: blur(20px) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 8px 32px var(--input-shadow) !important;
                }
                
                .dark-build-text {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 400 !important;
                }
                
                .dark-build-text-strong {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-text-gradient {
                    background: var(--title-gradient) !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
                    background-clip: text !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                    font-size: 20px !important;
                }
                
                .dark-build-slider .ant-slider-track {
                    background: var(--tabs-ink-bar) !important;
                    height: 6px !important;
                }
                
                .dark-build-slider .ant-slider-rail {
                    background: var(--border) !important;
                    height: 6px !important;
                }
                
                .dark-build-slider .ant-slider-handle {
                    border-color: var(--accent-text) !important;
                    width: 20px !important;
                    height: 20px !important;
                    margin-top: 0px !important;
                }
                
                .dark-build-slider .ant-slider-handle:hover {
                    border-color: var(--tabs-ink-bar) !important;
                }
                
                .dark-build-input .ant-input-number {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 12px !important;
                }
                
                .dark-build-input .ant-input-number:hover {
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                }
                
                .dark-build-input .ant-input-number-focused {
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                }
                
                .dark-build-input .ant-input-number-input {
                    color: var(--input-color) !important;
                    background: transparent !important;
                    font-size: 16px !important;
                    font-weight: 500 !important;
                }
                
                .dark-build-input .ant-input-number-addon {
                    color: var(--text) !important;
                    background: var(--hover-bg) !important;
                    border-color: var(--border) !important;
                    font-weight: 500 !important;
                }
                
                .dark-build-input .ant-input-number-addon .ant-input-number-addon-text {
                    color: var(--text) !important;
                }
                
                .dark-build-input .ant-input-number-addon-after {
                    color: var(--text) !important;
                    background: var(--hover-bg) !important;
                    border-color: var(--border) !important;
                }
                
                .dark-build-input .ant-input-number-addon-after span {
                    color: var(--text) !important;
                }
                
                .dark-build-input .ant-input-number-addon-after {
                    color: var(--text) !important;
                }
                
                .dark-build-input .ant-input-number-addon-after * {
                    color: var(--text) !important;
                }
                
                .dark-build-input .ant-input-number .ant-input-number-addon-after {
                    color: var(--text) !important;
                    background: var(--hover-bg) !important;
                    border-color: var(--border) !important;
                }
                
                .dark-build-input .ant-input-number .ant-input-number-addon-after span {
                    color: var(--text) !important;
                }
                
                .dark-build-input .ant-input-number .ant-input-number-addon-after .ant-input-number-addon-text {
                    color: var(--text) !important;
                }
                
                .dark-build-select .ant-select-selector {
                    background: var(--select-selector-bg) !important;
                    border: 1px solid var(--select-selector-border) !important;
                    color: var(--select-selector-color) !important;
                    border-radius: 12px !important;
                }
                
                .dark-build-select .ant-select-selector:hover {
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                }
                
                .dark-build-select .ant-select-selection-item {
                    color: var(--select-item-color) !important;
                }
                
                .dark-build-select .ant-select-arrow {
                    color: var(--select-arrow-color) !important;
                }
                
                .dark-build-button {
                    background: var(--button-primary-bg) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                    box-shadow: 0 4px 16px var(--input-shadow) !important;
                    height: 48px !important;
                }
                
                .dark-build-button:hover {
                    background: var(--button-primary-bg) !important;
                    box-shadow: 0 6px 20px var(--input-shadow) !important;
                    transform: translateY(-2px) !important;
                }
                
                .dark-build-button:disabled {
                    box-shadow: none !important;
                    transform: none !important;
                    pointer-events: none !important;
                }
                
                .dark-build-modal .ant-modal-content {
                    background: var(--modal-bg) !important;
                    backdrop-filter: blur(20px) !important;
                    border: 1px solid var(--modal-border) !important;
                    border-radius: 20px !important;
                }
                
                .dark-build-modal .ant-modal-header {
                    background: var(--modal-header-bg) !important;
                    border-bottom: 1px solid var(--modal-header-border) !important;
                }
                
                .dark-build-modal .ant-modal-title {
                    color: var(--modal-title-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-modal .ant-modal-body {
                    color: var(--text) !important;
                }
                
                .dark-build-statistic .ant-statistic-title {
                    color: var(--secondary-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-statistic .ant-statistic-content {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-build-statistic .ant-statistic-content-value {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-cost-estimator {
                    background: var(--hover-bg) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: 16px !important;
                    padding: 20px !important;
                }
                
                .dark-build-cost-estimator h4 {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-build-cost-estimator p {
                    color: var(--secondary-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .instance-size-card {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: 16px !important;
                    transition: all 0.3s ease !important;
                    backdrop-filter: blur(10px) !important;
                }
                
                .instance-size-card:hover {
                    background: var(--hover-bg) !important;
                    border-color: var(--accent-text) !important;
                    box-shadow: 0 8px 24px var(--input-shadow) !important;
                    transform: translateY(-2px) !important;
                }
                
                .instance-size-card.selected {
                    background: var(--active-bg) !important;
                    border-color: var(--accent-text) !important;
                    box-shadow: 0 8px 24px var(--input-shadow) !important;
                }
                
                .instance-size-card .ant-card-body {
                    color: var(--text) !important;
                }
                
                .instance-size-card .ant-card-body h5 {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .instance-size-card .ant-card-body .ant-typography {
                    color: var(--secondary-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .instance-size-card .ant-collapse {
                    background: transparent !important;
                    border: none !important;
                }
                
                .instance-size-card .ant-collapse .ant-collapse-item {
                    border: none !important;
                }
                
                .instance-size-card .ant-collapse .ant-collapse-header {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                    background: transparent !important;
                    border: none !important;
                }
                
                .instance-size-card .ant-collapse .ant-collapse-content {
                    background: transparent !important;
                    border: none !important;
                }
                
                .instance-size-card .ant-collapse .ant-collapse-content-box {
                    color: var(--secondary-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                /* Input and TextArea styling - More specific selectors */
                .dark-build-input .ant-input,
                .dark-build-input .ant-input-textarea,
                .dark-build-input .ant-input-affix-wrapper,
                .dark-build-input .ant-input-affix-wrapper .ant-input {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 12px !important;
                }
                
                .dark-build-input .ant-input:hover,
                .dark-build-input .ant-input-textarea:hover,
                .dark-build-input .ant-input-affix-wrapper:hover,
                .dark-build-input .ant-input-affix-wrapper:hover .ant-input {
                    border-color: var(--input-hover-border) !important;
                }
                
                .dark-build-input .ant-input:focus,
                .dark-build-input .ant-input-textarea:focus,
                .dark-build-input .ant-input-affix-wrapper:focus,
                .dark-build-input .ant-input-affix-wrapper:focus .ant-input {
                    border-color: var(--input-focus-border) !important;
                }
                
                .dark-build-input .ant-input::placeholder,
                .dark-build-input .ant-input-textarea::placeholder,
                .dark-build-input .ant-input-affix-wrapper .ant-input::placeholder {
                    color: var(--placeholder-color) !important;
                }
                
                /* Force styling on all input elements */
                .dark-build-page input[type="text"],
                .dark-build-page textarea {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 12px !important;
                }
                
                .dark-build-page input[type="text"]:hover,
                .dark-build-page textarea:hover {
                    border-color: var(--input-hover-border) !important;
                }
                
                .dark-build-page input[type="text"]:focus,
                .dark-build-page textarea:focus {
                    border-color: var(--input-focus-border) !important;
                }
                
                .dark-build-page input[type="text"]::placeholder,
                .dark-build-page textarea::placeholder {
                    color: var(--placeholder-color) !important;
                }
                
                /* InputNumber specific styling */
                .dark-build-input .ant-input-number {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 12px !important;
                }
                
                .dark-build-input .ant-input-number:hover {
                    border-color: var(--input-hover-border) !important;
                }
                
                .dark-build-input .ant-input-number:focus,
                .dark-build-input .ant-input-number-focused {
                    border-color: var(--input-focus-border) !important;
                }
                
                .dark-build-input .ant-input-number-input {
                    background: transparent !important;
                    color: var(--input-color) !important;
                }
                
                .dark-build-input .ant-input-number-input::placeholder {
                    color: var(--placeholder-color) !important;
                }
            `}</style>
			<div className="dark-build-page font-poppins">
				<div className="select-instance-container p-6">
					<Tabs
						items={items}
						onChange={(key) => setActiveTab(key)}
						className="dark-build-tabs"
					/>
				</div>
			</div>
		</>
	)
}

export default SelectInstance
