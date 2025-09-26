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

// Only include the 8 non-technical task types
const projType = [
	'image_classification',
	'text_classification', 
	'multilabel_text_classification',
	'tabular_classification',
	'tabular_regression',
	'multilabel_tabular_classification',
	'multimodal_classification',
	'multilabel_image_classification'
]

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

// Beautiful task cards with natural language descriptions and examples
const taskCards = [
	{
		id: 'image_classification',
		title: 'Photo Recognition',
		subtitle: 'Sort and organize your photos automatically',
		description: 'Perfect for organizing your photo collection! Upload photos and let AI automatically sort them by what\'s in the picture.',
		icon: '📸',
		example: {
			input: 'Upload photos of cats, dogs, and birds',
			output: 'Photos automatically sorted into: Cat folder, Dog folder, Bird folder'
		},
		useCases: ['Photo organization', 'Content moderation', 'Product sorting']
	},
	{
		id: 'text_classification',
		title: 'Text Analysis',
		subtitle: 'Understand emotions and topics in text',
		description: 'Analyze customer reviews, social media posts, or any text to understand emotions and categorize content.',
		icon: '📝',
		example: {
			input: 'Customer reviews: "Love this product!" or "Terrible quality"',
			output: 'Automatically labeled as: Positive, Negative, or Neutral'
		},
		useCases: ['Customer feedback', 'Social media monitoring', 'Content filtering']
	},
	{
		id: 'multilabel_text_classification',
		title: 'Smart Text Tagging',
		subtitle: 'Add multiple labels to text automatically',
		description: 'When you need to tag text with multiple categories at once - like marking an email as both "urgent" and "work-related".',
		icon: '🏷️',
		example: {
			input: 'Email: "Meeting tomorrow about budget"',
			output: 'Tagged as: Work, Meeting, Finance, Urgent'
		},
		useCases: ['Email organization', 'Content tagging', 'Document management']
	},
	{
		id: 'tabular_classification',
		title: 'Data Sorting',
		subtitle: 'Organize spreadsheet data into groups',
		description: 'Perfect for business data! Upload your Excel or CSV files and automatically sort customers, products, or any data into categories.',
		icon: '📊',
		example: {
			input: 'Customer data: Age, Income, Purchase history',
			output: 'Customers grouped into: High-value, Medium-value, Low-value'
		},
		useCases: ['Customer segmentation', 'Sales analysis', 'Risk assessment']
	},
	{
		id: 'tabular_regression',
		title: 'Number Prediction',
		subtitle: 'Predict prices, scores, and trends',
		description: 'Predict future numbers based on your data! Great for forecasting sales, predicting prices, or estimating scores.',
		icon: '📈',
		example: {
			input: 'House data: Size, Location, Age, Rooms',
			output: 'Predicted house price: $450,000'
		},
		useCases: ['Price prediction', 'Sales forecasting', 'Performance estimation']
	},
	{
		id: 'multilabel_tabular_classification',
		title: 'Complex Data Analysis',
		subtitle: 'Multiple labels for detailed insights',
		description: 'When your data needs multiple classifications - like marking a customer as both "high-value" and "at-risk".',
		icon: '🔍',
		example: {
			input: 'Customer profile data',
			output: 'Labeled as: High-value, At-risk, Tech-savvy, Price-sensitive'
		},
		useCases: ['Customer profiling', 'Risk analysis', 'Market research']
	},
	{
		id: 'multimodal_classification',
		title: 'Smart Content Analysis',
		subtitle: 'Combine images and text for better insights',
		description: 'The most powerful option! Analyze both images and text together for social media posts, product listings, or any mixed content.',
		icon: '🎯',
		example: {
			input: 'Social media post with photo + caption',
			output: 'Analyzed as: Travel content, Positive sentiment, High engagement potential'
		},
		useCases: ['Social media analysis', 'Product listings', 'Content moderation']
	},
	{
		id: 'multilabel_image_classification',
		title: 'Detailed Photo Analysis',
		subtitle: 'Multiple tags for comprehensive photo understanding',
		description: 'Get detailed insights from your photos! Tag images with multiple labels for comprehensive photo organization.',
		icon: '🖼️',
		example: {
			input: 'Photo of a sunset over mountains',
			output: 'Tagged as: Nature, Landscape, Sunset, Mountains, Beautiful'
		},
		useCases: ['Photo libraries', 'Content creation', 'Visual search']
	}
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
	onSetCreatingProjectInfo,
}) => {
	const [form] = Form.useForm()
	
	// Check if dark mode is active
	const isDarkMode = document.documentElement.classList.contains('dark')

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
            className="theme-form"
            initialValues={{
                name: initialProjectName,
                description: initialDescription,
                task_type: initialTaskType,
            }}
        >
            <Row gutter={[24, 24]}>
						<Col span={24}>
							<Form.Item
								label="Project Name"
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
									size="large"
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* Description */}
					<Row gutter={[24, 24]}>
						<Col span={24}>
							<Form.Item
								label="Description"
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

					{/* Beautiful Task Selection Cards */}
					<div style={{ marginBottom: 24 }}>
						<Title level={4} style={{ 
							textAlign: 'center', 
							marginBottom: 24,
							color: 'var(--text)',
							fontWeight: 600,
							fontFamily: 'Poppins, sans-serif'
						}}>
							Choose What You Want to Build
						</Title>
						
						<div style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
							gap: '20px',
							maxHeight: '400px',
							overflowY: 'auto',
							padding: '0 8px'
						}}>
							{taskCards.map((task, idx) => {
								// Find the corresponding projType index
								const projTypeIndex = projType.findIndex(type => type === task.id);
								return (
								<div
									key={task.id}
									className={`task-card ${isSelected && isSelected[projTypeIndex] ? 'selected' : ''}`}
									onClick={(e) => handleSelectType(e, projTypeIndex)}
								style={{
									cursor: 'pointer',
									borderRadius: '16px',
									padding: '24px',
									transition: 'all 0.3s ease',
									position: 'relative'
								}}
								>
									{/* Card Header */}
									<div style={{
										display: 'flex',
										alignItems: 'center',
										marginBottom: '16px'
									}}>
										<div style={{
											fontSize: '32px',
											marginRight: '16px',
											lineHeight: 1
										}}>
											{task.icon}
										</div>
										<div>
											<Title level={4} style={{
												margin: 0,
												color: 'var(--text)',
												fontSize: '18px',
												fontWeight: 600,
												fontFamily: 'Poppins, sans-serif'
											}}>
												{task.title}
												</Title>
											<Text style={{
												color: 'var(--secondary-text)',
												fontSize: '14px',
												fontWeight: 500,
												fontFamily: 'Poppins, sans-serif'
											}}>
												{task.subtitle}
											</Text>
										</div>
									</div>

									{/* Description */}
									<Text style={{
										color: 'var(--text)',
										fontSize: '14px',
										lineHeight: '1.5',
										marginBottom: '16px',
										display: 'block',
										fontFamily: 'Poppins, sans-serif'
									}}>
										{task.description}
									</Text>

									{/* Use Cases */}
									<div style={{ marginBottom: '16px' }}>
										{task.useCases.map((useCase, i) => (
											<Tag
												key={i}
												style={{
													borderRadius: '12px',
													fontSize: '11px',
													padding: '4px 8px',
													margin: '2px 4px 2px 0',
													fontFamily: 'Poppins, sans-serif',
													fontWeight: 500
												}}
											>
												{useCase}
											</Tag>
										))}
									</div>

									{/* Simple Example Box - Shows on Click */}
									<div className="task-example" style={{
										marginTop: '12px',
										padding: '16px',
										borderRadius: '12px',
										display: 'none'
									}}>
										<Title level={5} style={{
											color: 'var(--text)',
											marginBottom: '12px',
											textAlign: 'center',
											fontSize: '14px',
											fontFamily: 'Poppins, sans-serif',
											fontWeight: 600
										}}>
											Example
										</Title>
										<div style={{ marginBottom: '8px' }}>
											<Text style={{
												color: 'var(--secondary-text)',
												fontSize: '11px',
												fontWeight: 600,
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												fontFamily: 'Poppins, sans-serif'
											}}>
												INPUT:
											</Text>
											<Text style={{
												color: 'var(--text)',
												fontSize: '12px',
												display: 'block',
												marginTop: '4px',
												fontStyle: 'italic',
												fontFamily: 'Poppins, sans-serif'
											}}>
												{task.example.input}
											</Text>
										</div>
										<div>
											<Text style={{
												color: 'var(--secondary-text)',
												fontSize: '11px',
												fontWeight: 600,
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												fontFamily: 'Poppins, sans-serif'
											}}>
												OUTPUT:
											</Text>
											<Text style={{
												color: 'var(--accent-text)',
												fontSize: '12px',
												display: 'block',
												marginTop: '4px',
												fontWeight: 500,
												fontFamily: 'Poppins, sans-serif'
											}}>
												{task.example.output}
											</Text>
										</div>
									</div>
								</div>
								);
							})}
						</div>
							</div>

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
                /* Beautiful Task Card Styling with Gradients */
                .task-card {
                    position: relative;
                    transition: all 0.3s ease;
                    background: var(--card-gradient) !important;
                    border: 2px solid var(--border) !important;
                    border-radius: 16px !important;
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                }

                .task-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                    pointer-events: none;
                    border-radius: 16px;
                    z-index: 0;
                }

                .task-card > * {
                    position: relative;
                    z-index: 1;
                }

                .task-card:hover {
                    border-color: var(--accent-text) !important;
                    background: var(--hover-bg) !important;
                    transform: translateY(-4px) scale(1.02) !important;
                    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.2) !important;
                }

                .task-card:hover::before {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%);
                }

                .task-card:hover .task-example {
                    display: block !important;
                }

                .task-card.selected {
                    border-color: var(--accent-text) !important;
                    background: var(--selection-bg) !important;
                    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3) !important;
                    transform: scale(1.02) !important;
                }

                .task-card.selected::before {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%);
                }

                .task-card.selected .task-example {
                    display: block !important;
                }

                /* Task example box with gradient */
                .task-example {
                    display: none;
                    margin-top: 12px;
                    padding: 16px;
                    border-radius: 12px;
                    background: var(--accent-gradient) !important;
                    border: 1px solid var(--border-hover) !important;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                /* Modern tag styling with gradients */
                .task-card .ant-tag {
                    background: var(--tag-gradient) !important;
                    border: 1px solid var(--tag-border) !important;
                    color: var(--tag-color) !important;
                    backdrop-filter: blur(10px);
                    font-weight: 500 !important;
                    transition: all 0.3s ease !important;
                }

                .task-card .ant-tag:hover {
                    background: var(--button-gradient) !important;
                    color: #ffffff !important;
                    transform: scale(1.05) !important;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
                }

                /* Grid responsive design */
                @media (max-width: 768px) {
                    .task-card {
                        min-width: 100% !important;
                    }
                }

                /* Smooth animation on load */
                @keyframes cardSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .task-card {
                    animation: cardSlideIn 0.6s ease-out forwards;
                }

                .task-card:nth-child(2) { animation-delay: 0.1s; }
                .task-card:nth-child(3) { animation-delay: 0.2s; }
                .task-card:nth-child(4) { animation-delay: 0.3s; }
                .task-card:nth-child(5) { animation-delay: 0.4s; }
                .task-card:nth-child(6) { animation-delay: 0.5s; }
                .task-card:nth-child(7) { animation-delay: 0.6s; }
                .task-card:nth-child(8) { animation-delay: 0.7s; }
            `}</style>
			{!isStep ? (
                <Modal
                    open={open}
                    onCancel={onCancel}
                    footer={null}
                    width={800} // Same as CreateDatasetForm - compact and clean
                    destroyOnClose
                    centered
                    className="theme-manual-modal"
                    styles={{
                        content: {
                            background: 'var(--modal-bg)',
                            borderRadius: '16px',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                            border: '1px solid var(--modal-border)',
                            overflow: 'hidden',
                            backdropFilter: 'blur(10px)'
                        },
                        header: {
                            background: 'var(--modal-header-bg)',
                            borderBottom: '1px solid var(--modal-header-border)',
                            padding: '24px 24px 16px 24px',
                            borderRadius: '16px 16px 0 0'
                        },
                        body: {
                            background: 'transparent',
                            padding: '24px',
                            borderRadius: '0 0 16px 16px'
                        }
                    }}
                >
                    <Title
                        level={3}
                        style={{
                            textAlign: 'center',
                            marginBottom: 24,
                            color: 'var(--modal-title-color)',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600
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