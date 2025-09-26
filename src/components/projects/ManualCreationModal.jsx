import React from 'react'
import {
	Modal,
	Row,
	Col,
	Button,
	Card,
	Space,
	Typography,
	Input,
	Tooltip,
	Select,
	Tag,
	message,
	Form,
	Slider,
	InputNumber,
	Radio,
} from 'antd'
import {
	InfoCircleOutlined,
	CopyrightOutlined,
	GlobalOutlined,
	LockOutlined,
	CameraOutlined,
	FileTextOutlined,
	LineChartOutlined,
	TagsOutlined,
	DatabaseOutlined,
	ClusterOutlined,
	DeploymentUnitOutlined,
	RadarChartOutlined,
	FundOutlined,
	PictureOutlined,
} from '@ant-design/icons'

import { TASK_TYPES } from 'src/constants/types'
import image_classification from 'src/assets/images/image_classification.jpg'
import text_classification from 'src/assets/images/text_classification.jpg'
import multilabel_text_classification from 'src/assets/images/multilabel_text_classification.jpg'
import tabular_classification from 'src/assets/images/tabular_classification.jpg'
import tabular_regression from 'src/assets/images/tabular_regression.jpg'
import multilabel_tabular_classification from 'src/assets/images/multilabel_tabular_classification.jpg'
import multimodal_classification from 'src/assets/images/multimodal_classification.jpg'
import multilabel_image_classification from 'src/assets/images/multilabel_image_classification.jpg'
import object_detection from 'src/assets/images/object_detection.jpg'
import semantic_segmentation from 'src/assets/images/semantic_segmentation.jpg'
import time_series_forecasting from 'src/assets/images/time_series_forecasting.jpg'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

const projType = Object.keys(TASK_TYPES)

const tagIcons = {
	'Computer Vision': <CameraOutlined />,
	'Image Analysis': <PictureOutlined />,
	NLP: <FileTextOutlined />,
	'Text Processing': <FileTextOutlined />,
	'Sentiment Analysis': <FundOutlined />,
	'Text Mining': <ClusterOutlined />,
	'Machine Learning': <DeploymentUnitOutlined />,
	'Structured Data': <DatabaseOutlined />,
	Classification: <TagsOutlined />,
	Prediction: <LineChartOutlined />,
	Numerical: <LineChartOutlined />,
	'Multi-Label': <TagsOutlined />,
	'Complex Analysis': <ClusterOutlined />,
	'Multi-Modal': <DeploymentUnitOutlined />,
	Fusion: <ClusterOutlined />,
	'Advanced AI': <DeploymentUnitOutlined />,
	'Image Recognition': <CameraOutlined />,
	'Object Detection': <RadarChartOutlined />,
	Localization: <RadarChartOutlined />,
	'Pixel-Level': <PictureOutlined />,
	Segmentation: <PictureOutlined />,
	'Time Series': <LineChartOutlined />,
	Forecasting: <LineChartOutlined />,
	'Trend Analysis': <LineChartOutlined />,
}

const imgArray = [
	image_classification,
	text_classification,
	multilabel_text_classification,
	tabular_classification,
	tabular_regression,
	multilabel_tabular_classification,
	multimodal_classification,
	multilabel_image_classification,
	object_detection,
	semantic_segmentation,
	time_series_forecasting,
]

const projectTypeImages = {}
projType.forEach((type, index) => {
	projectTypeImages[type] = imgArray[index]
})

const typeDescription = [
	'Identify and categorize objects in images using advanced computer vision techniques.',
	'Categorize text data based on content, sentiment, and contextual meaning.',
	'Assign multiple relevant labels to each text input for comprehensive classification.',
	'Classify structured tabular data rows into predefined categories.',
	'Predict continuous numerical values for structured tabular datasets.',
	'Assign multiple labels to each row in tabular data for complex analysis.',
	'Combine multiple data sources (text + images + structured data) for enhanced classification.',
	'Assign multiple relevant labels to each image for detailed visual analysis.',
	'Identify and locate multiple objects in images with precise bounding boxes.',
	'Segment images at pixel level to identify specific objects or regions of interest.',
	'Predict future values based on historical time series patterns and trends.',
]

const typeTags = [
	['Computer Vision', 'Single Label', 'Image Analysis'],
	['NLP', 'Text Processing', 'Sentiment Analysis'],
	['NLP', 'Multi-Label', 'Text Mining'],
	['Machine Learning', 'Structured Data', 'Classification'],
	['Machine Learning', 'Prediction', 'Numerical'],
	['Multi-Label', 'Structured Data', 'Complex Analysis'],
	['Multi-Modal', 'Fusion', 'Advanced AI'],
	['Computer Vision', 'Multi-Label', 'Image Recognition'],
	['Computer Vision', 'Object Detection', 'Localization'],
	['Computer Vision', 'Pixel-Level', 'Segmentation'],
	['Time Series', 'Forecasting', 'Trend Analysis'],
]

const getImageByProjectType = (selectedProjectType) => {
	return projectTypeImages[selectedProjectType] || image_classification // default image
}

const ManualCreationModal = ({
	open,
	onCancel,
	onSubmit,
    onNext,
    isStep = false,
	initialProjectName = '',
	initialDescription = '',
	initialTaskType = projType[0],
	initialVisibility = 'private',
	initialLicense = 'MIT',
	initialExpectedAccuracy = 75,
	isSelected,
	onSelectType,
}) => {
	const [form] = Form.useForm()

	const selectedIndex = Array.isArray(isSelected) ? isSelected.findIndex((item) => item === true) : -1;
	const selectedProjectType =
		selectedIndex !== -1 ? projType[selectedIndex] : null

	React.useEffect(() => {
		if (open || isStep) {
			form.setFieldsValue({
				name: initialProjectName,
				description: initialDescription,
				task_type: initialTaskType,
				visibility: initialVisibility,
				license: initialLicense,
				expected_accuracy: initialExpectedAccuracy,
			})
		}
	}, [
		open,
        isStep,
		form,
		initialProjectName,
		initialDescription,
		initialTaskType,
		initialVisibility,
		initialLicense,
		initialExpectedAccuracy,
	])

	const handleSubmit = (values) => {
        if (isStep) {
            onNext(values);
        } else {
		    onSubmit(values)
        }
	}

	const handleSelectType = (e, idx) => {
		onSelectType(e, idx)
		form.setFieldValue('task_type', projType[idx])
	}
    
    const content = (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
                name: initialProjectName,
                description: initialDescription,
                task_type: initialTaskType,
                visibility: initialVisibility,
                license: initialLicense,
                expected_accuracy: initialExpectedAccuracy,
            }}
        >
            <Row gutter={[24, 24]}>
						<Col span={6}>
							<Form.Item
								label={
                                    <span
                                        style={{
                                            color: 'var(--text)',
                                            fontSize: 20,
                                            fontWeight: 500,
                                        }}
                                    >
										Project Name
									</span>
								}
								name="name"
								style={{ marginBottom: 16 }}
								rules={[
									{
										required: true,
										message: 'Please enter project name!',
									},
									{
										min: 3,
										message:
											'Name must be at least 3 characters',
									},
								]}
							>
								<Input
									placeholder="E.g., Customer Churn Predictor"
									prefix={<InfoCircleOutlined />}
								/>
							</Form.Item>
						</Col>

						<Col span={6}>
							<Form.Item
								label={
                                    <span
                                        style={{
                                            color: 'var(--text)',
                                            fontSize: 20,
                                            fontWeight: 500,
                                        }}
                                    >
										License
									</span>
								}
								name="license"
								style={{ marginBottom: 16 }}
								rules={[
									{
										required: true,
										message: 'Please select license!',
									},
								]}
							>
								<Select
									placeholder="Select license"
									suffixIcon={<CopyrightOutlined />}
								>
									<Option value="mit">MIT License</Option>
									<Option value="apache">Apache 2.0</Option>
									<Option value="gpl">GPL v3</Option>
									<Option value="proprietary">
										Proprietary
									</Option>
								</Select>
							</Form.Item>
						</Col>

						<Col span={6}>
							<Form.Item
								label={
                                    <span
                                        style={{
                                            color: 'var(--text)',
                                            fontSize: 20,
                                            fontWeight: 500,
                                        }}
                                    >
										Expected Accuracy (%)
									</span>
								}
								name="expected_accuracy"
								initialValue={75}
								style={{ marginBottom: 16 }}
								rules={[
									{
										required: true,
										message:
											'Please input expected accuracy!',
									},
									{
										type: 'number',
										min: 0,
										max: 100,
										message:
											'Accuracy must be between 0 and 100!',
									},
								]}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '16px',
									}}
								>
									<Slider
										min={0}
										max={100}
										step={1}
										style={{ flex: 1 }}
										defaultValue={75}
										onChange={(value) =>
											form.setFieldValue(
												'expected_accuracy',
												value
											)
										}
										className="dark-build-slider"
									/>
								</div>
							</Form.Item>
						</Col>

						<Col span={6}>
							<Form.Item
								label={
									<span
										style={{
											color: '#fff',
											fontSize: 20,
											fontWeight: 500,
										}}
									>
										Visibility
									</span>
								}
								name="visibility"
								style={{ marginBottom: 16 }}
								rules={[
									{
										required: true,
										message: 'Please choose visibility!',
									},
								]}
							>
								<Radio.Group>
									<Radio value="private">
                                        <span
                                            style={{
                                                color: 'var(--text)',
                                                fontSize: 13,
                                                fontWeight: 500,
                                            }}
                                        >
											Private
										</span>
									</Radio>
									<Radio value="public">
                                        <span
                                            style={{
                                                color: 'var(--text)',
                                                fontSize: 13,
                                                fontWeight: 500,
                                            }}
                                        >
											Public
										</span>
									</Radio>
								</Radio.Group>
							</Form.Item>
						</Col>
					</Row>

					{/* Description */}
					<Row gutter={[24, 24]}>
						<Col span={24}>
							<Form.Item
								label={
                                    <span
                                        style={{
                                            color: 'var(--text)',
                                            fontSize: 20,
                                            fontWeight: 500,
                                        }}
                                    >
										Description
									</span>
								}
								name="description"
							>
								<Tooltip title="Explain what your project aims to achieve">
									<TextArea
										rows={3}
										placeholder="Describe your project's goals and requirements..."
										showCount
									/>
								</Tooltip>
							</Form.Item>
						</Col>
					</Row>

					{/* Project Types + Preview */}
					<Row gutter={[24, 24]}>
						<Col span={12}>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: 16,
									maxHeight: 525,
									overflowY: 'auto',
									paddingRight: 8,
								}}
							>
								{projType.map(
									(type, idx) => (
										<Card
											key={type}
											hoverable
											onClick={(e) =>
												handleSelectType(e, idx)
											}
											className={
												isSelected && isSelected[idx]
													? 'selected'
													: ''
											}
											style={{
												borderRadius: 12,
												border: isSelected && isSelected[idx]
													? '2px solid var(--primary-color)'
													: '1px solid var(--border-color)',
												backgroundColor: isSelected && isSelected[
													idx
												]
													? 'var(--selected-bg)'
													: 'var(--card-bg)',
											}}
										>
											<Row
												justify="space-between"
												align="middle"
												style={{ marginBottom: 8 }}
											>
												<Title
													level={4}
													style={{ margin: 0 }}
												>
													{TASK_TYPES[type].type}
												</Title>
												<Space size={[4, 4]} wrap>
													{typeTags[idx].map(
														(tag) => (
															<Tag
																key={tag}
																color="blue"
																style={{
																	display:
																		'flex',
																	alignItems:
																		'center',
																	gap: 4,
																}}
															>
																{
																	tagIcons[
																		tag
																	]
																}{' '}
																{tag}
															</Tag>
														)
													)}
												</Space>
											</Row>
											<Text
												style={{
													color: 'var(--secondary-text)',
												}}
											>
												{typeDescription[idx]}
											</Text>
										</Card>
									)
								)}
							</div>
						</Col>

						<Col span={12}>
							{selectedProjectType && (
								<img
									src={getImageByProjectType(
										selectedProjectType
									)}
									alt={selectedProjectType || 'Project Type'}
									style={{
										width: '100%',
										height: 525, // Cố định chiều cao 525px
										borderRadius: 12,
										objectFit: 'contain', // Giữ tỷ lệ ảnh và cắt phần thừa nếu cần
										boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
										backgroundColor: '#f5f5f5',
									}}
								/>
							)}
						</Col>
					</Row>

					{/* Submit */}
					<Row justify="end" style={{ marginTop: 24 }}>
                        <Button onClick={onCancel} style={{ marginRight: 8 }}>
                            Cancel
                        </Button>
						<Button
							type="primary"
							htmlType="submit"
							size="large"
							disabled={selectedIndex === -1}
						>
							{isStep ? 'Next' : 'Create Project'}
						</Button>
					</Row>
        </Form>
    )

	return (
		<>
			<style>{`
                /* CSS styles from previous turn */
            `}</style>
			{!isStep ? (
                <Modal
                    open={open}
                    onCancel={onCancel}
                    footer={null}
                    width={1800}
                    centered
                    className="theme-manual-modal"
                >
                    <Title
                        level={3}
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            color: 'var(--text)',
                            textAlign: 'center',
                            marginBottom: 24,
                        }}
                    >
                        Let&apos;s Create Your Project
                    </Title>
                    {content}
                </Modal>
            ) : (
                content
            )}
		</>
	)
}

export default ManualCreationModal