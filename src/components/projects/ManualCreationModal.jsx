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
		useCases: ['Photo organization', 'Content moderation', 'Product sorting'],
		image: image_classification,
		inputType: 'Images (JPG, PNG)',
		outputType: 'Categories'
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
		useCases: ['Customer feedback', 'Social media monitoring', 'Content filtering'],
		image: text_classification,
		inputType: 'Text (CSV)',
		outputType: 'Sentiment Labels'
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
		useCases: ['Email organization', 'Content tagging', 'Document management'],
		image: multilabel_text_classification,
		inputType: 'Text (CSV)',
		outputType: 'Multiple Labels'
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
		useCases: ['Customer segmentation', 'Sales analysis', 'Risk assessment'],
		image: tabular_classification,
		inputType: 'Spreadsheet (CSV)',
		outputType: 'Categories'
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
		useCases: ['Price prediction', 'Sales forecasting', 'Performance estimation'],
		image: tabular_regression,
		inputType: 'Spreadsheet (CSV)',
		outputType: 'Numbers'
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
		useCases: ['Customer profiling', 'Risk analysis', 'Market research'],
		image: multilabel_tabular_classification,
		inputType: 'Spreadsheet (CSV)',
		outputType: 'Multiple Labels'
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
		useCases: ['Social media analysis', 'Product listings', 'Content moderation'],
		image: multimodal_classification,
		inputType: 'Images + Text (CSV)',
		outputType: 'Combined Analysis'
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
		useCases: ['Photo libraries', 'Content creation', 'Visual search'],
		image: multilabel_image_classification,
		inputType: 'Images (JPG, PNG)',
		outputType: 'Multiple Tags'
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
            className="theme-form theme-manual-form"
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
					<div className="task-cards-container" style={{ 
						marginBottom: 40,
						padding: '40px 32px 12px 32px',
						borderRadius: '16px',
						background: 'var(--filter-bg)',
						border: '1px solid var(--filter-border)'
					}}>
						<Title level={3} style={{ 
							textAlign: 'center', 
							marginBottom: 40,
							color: 'var(--title-project)',
							fontWeight: 700,
							fontFamily: 'Poppins, sans-serif'
						}}>
							Choose What You Want to Build
						</Title>
						
						<div className="task-grid" style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
							gap: '32px',
							maxHeight: '700px',
							overflowY: 'auto',
							padding: '40px 24px'
						}}>
							{taskCards.map((task, idx) => {
								// Find the corresponding projType index
								const projTypeIndex = projType.findIndex(type => type === task.id);
								return (
								<div
									key={task.id}
									className={`task-card ${isSelected && isSelected[projTypeIndex] ? 'selected' : ''}`}
									onClick={(e) => handleSelectType(e, projTypeIndex)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											handleSelectType(e, projTypeIndex);
										}
									}}
									tabIndex={0}
									role="button"
									aria-label={`Select ${task.title} task type`}
									aria-pressed={isSelected && isSelected[projTypeIndex]}
									style={{
										cursor: 'pointer',
										borderRadius: '20px',
										padding: '20px',
										transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
										position: 'relative',
										overflow: 'hidden',
										height: '320px',
										display: 'flex',
										flexDirection: 'column'
									}}
								>
									{/* Main Card Content */}
									<div className="task-main-content" style={{
										position: 'relative',
										zIndex: 2,
										flex: 1,
										display: 'flex',
										flexDirection: 'column',
										transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
									}}>
										{/* Card Header */}
										<div style={{
											display: 'flex',
											alignItems: 'center',
											marginBottom: '16px'
										}}>
											<div style={{
												fontSize: '36px',
												marginRight: '16px',
												lineHeight: 1,
												filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
											}}>
												{task.icon}
											</div>
											<div style={{ flex: 1 }}>
												<Title level={4} style={{
													margin: 0,
													color: 'var(--text)',
													fontSize: '18px',
													fontWeight: 700,
													fontFamily: 'Poppins, sans-serif',
													letterSpacing: '-0.02em'
												}}>
													{task.title}
												</Title>
												<Text style={{
													color: 'var(--secondary-text)',
													fontSize: '13px',
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
											fontSize: '13px',
											lineHeight: '1.5',
											marginBottom: '16px',
											display: 'block',
											fontFamily: 'Poppins, sans-serif',
											flex: 1
										}}>
											{task.description}
										</Text>

										{/* Use Cases */}
										<div style={{ 
											marginBottom: '16px'
										}}>
											{task.useCases.slice(0, 2).map((useCase, i) => (
												<Tag
													key={i}
													style={{
														borderRadius: '16px',
														fontSize: '10px',
														padding: '4px 10px',
														margin: '2px 4px 2px 0',
														fontFamily: 'Poppins, sans-serif',
														fontWeight: 600
													}}
												>
													{useCase}
												</Tag>
											))}
										</div>

										{/* Input/Output Type Indicators */}
										<div style={{
											display: 'flex',
											justifyContent: 'space-between',
											marginTop: 'auto'
										}}>
											<div style={{
												background: 'var(--tag-gradient)',
												border: '1px solid var(--tag-border)',
												borderRadius: '12px',
												padding: '6px 12px',
												fontSize: '10px',
												fontWeight: 600,
												color: 'var(--tag-color)',
												fontFamily: 'Poppins, sans-serif'
											}}>
												📥 {task.inputType}
											</div>
											<div style={{
												background: 'var(--accent-gradient)',
												border: '1px solid var(--border-hover)',
												borderRadius: '12px',
												padding: '6px 12px',
												fontSize: '10px',
												fontWeight: 600,
												color: 'var(--accent-text)',
												fontFamily: 'Poppins, sans-serif'
											}}>
												📤 {task.outputType}
											</div>
										</div>
									</div>

									{/* Hover Expansion Content */}
									<div className="task-hover-content" style={{
										position: 'absolute',
										top: '-10px',
										left: '-10px',
										right: '-10px',
										bottom: '-10px',
										background: 'var(--card-gradient)',
										borderRadius: '24px',
										padding: '24px',
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
										alignItems: 'center',
										opacity: 0,
										transform: 'scale(0.9)',
										transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
										zIndex: 3,
										border: '2px solid var(--accent-text)',
										boxShadow: '0 25px 50px rgba(59, 130, 246, 0.4)'
									}}>
										{/* Title in hover state */}
										<Title level={4} style={{
											margin: '0 0 16px 0',
											color: 'var(--text)',
											fontSize: '20px',
											fontWeight: 700,
											fontFamily: 'Poppins, sans-serif',
											textAlign: 'center'
										}}>
											{task.title}
										</Title>

										{/* Example Image - Bigger */}
										<div style={{
											width: '180px',
											height: '120px',
											borderRadius: '16px',
											overflow: 'hidden',
											marginBottom: '20px',
											boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
											border: '2px solid var(--border-hover)'
										}}>
											<img 
												src={task.image} 
												alt={task.title}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover'
												}}
											/>
										</div>

										{/* Example Input/Output */}
										<div style={{
											width: '100%',
											background: 'var(--accent-gradient)',
											border: '2px solid var(--border-hover)',
											borderRadius: '16px',
											padding: '16px',
											marginBottom: '16px'
										}}>
											<div style={{ marginBottom: '12px' }}>
												<Text style={{
													color: 'var(--secondary-text)',
													fontSize: '11px',
													fontWeight: 700,
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													fontFamily: 'Poppins, sans-serif',
													display: 'block',
													marginBottom: '6px'
												}}>
													INPUT:
												</Text>
												<Text style={{
													color: 'var(--text)',
													fontSize: '12px',
													fontWeight: 500,
													fontFamily: 'Poppins, sans-serif',
													lineHeight: '1.4'
												}}>
													{task.example.input}
												</Text>
											</div>
											<div>
												<Text style={{
													color: 'var(--secondary-text)',
													fontSize: '11px',
													fontWeight: 700,
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													fontFamily: 'Poppins, sans-serif',
													display: 'block',
													marginBottom: '6px'
												}}>
													OUTPUT:
												</Text>
												<Text style={{
													color: 'var(--accent-text)',
													fontSize: '12px',
													fontWeight: 600,
													fontFamily: 'Poppins, sans-serif',
													lineHeight: '1.4'
												}}>
													{task.example.output}
												</Text>
											</div>
										</div>

										{/* Selection Indicator */}
										<div style={{
											background: 'var(--button-gradient)',
											color: '#ffffff',
											padding: '10px 20px',
											borderRadius: '24px',
											fontSize: '13px',
											fontWeight: 600,
											fontFamily: 'Poppins, sans-serif',
											boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
											transform: 'scale(1)',
											transition: 'transform 0.2s ease'
										}}>
											Click to Select
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
                /* Form styling for proper theme support */
                .theme-manual-form .ant-form-item-label > label {
                    color: var(--form-label-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }

                .theme-manual-form .ant-input {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 8px !important;
                }

                .theme-manual-form .ant-input:hover {
                    border-color: var(--input-hover-border) !important;
                }

                .theme-manual-form .ant-input:focus,
                .theme-manual-form .ant-input-focused {
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                }

                .theme-manual-form .ant-input::placeholder {
                    color: var(--placeholder-color) !important;
                }

                /* Beautiful Task Card Styling with Enhanced Gradients */
                .task-card {
                    position: relative;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    background: var(--card-gradient) !important;
                    border: 2px solid var(--border) !important;
                    border-radius: 20px !important;
                    overflow: visible;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    height: 320px !important;
                }

                .task-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, 
                        rgba(255, 255, 255, 0.1) 0%, 
                        rgba(255, 255, 255, 0.05) 50%,
                        rgba(59, 130, 246, 0.05) 100%
                    );
                    pointer-events: none;
                    border-radius: 20px;
                    z-index: 0;
                }

                .task-card > * {
                    position: relative;
                    z-index: 2;
                }

                /* Main content visibility */
                .task-main-content {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Hover Animation - Card Expansion */
                .task-card:hover {
                    border-color: var(--accent-text) !important;
                    background: var(--hover-bg) !important;
                    transform: translateY(-12px) scale(1.08) !important;
                    box-shadow: 0 25px 50px rgba(59, 130, 246, 0.3) !important;
                    z-index: 10 !important;
                }

                .task-card:hover::before {
                    background: linear-gradient(135deg, 
                        rgba(59, 130, 246, 0.15) 0%, 
                        rgba(37, 99, 235, 0.1) 50%,
                        rgba(96, 165, 250, 0.1) 100%
                    );
                }

                /* Hide main content on hover */
                .task-card:hover .task-main-content {
                    opacity: 0 !important;
                    transform: scale(0.9) !important;
                }

                /* Show hover content on hover */
                .task-card:hover .task-hover-content {
                    opacity: 1 !important;
                    transform: scale(1) !important;
                }

                /* Selected State */
                .task-card.selected {
                    border-color: var(--accent-text) !important;
                    background: var(--selection-bg) !important;
                    box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4) !important;
                    transform: translateY(-8px) scale(1.05) !important;
                    z-index: 5 !important;
                }

                .task-card.selected::before {
                    background: linear-gradient(135deg, 
                        rgba(59, 130, 246, 0.2) 0%, 
                        rgba(37, 99, 235, 0.15) 50%,
                        rgba(96, 165, 250, 0.1) 100%
                    );
                }

                .task-card.selected .task-main-content {
                    opacity: 0 !important;
                    transform: scale(0.9) !important;
                }

                .task-card.selected .task-hover-content {
                    opacity: 1 !important;
                    transform: scale(1) !important;
                }

                /* Modern tag styling with enhanced gradients */
                .task-card .ant-tag {
                    background: var(--tag-gradient) !important;
                    border: 1px solid var(--tag-border) !important;
                    color: var(--tag-color) !important;
                    backdrop-filter: blur(10px);
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                }

                .task-card .ant-tag:hover {
                    background: var(--button-gradient) !important;
                    color: #ffffff !important;
                    transform: scale(1.1) !important;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
                }

                /* Input/Output Type Indicators */
                .task-card .input-output-indicator {
                    transition: all 0.3s ease;
                }

                .task-card:hover .input-output-indicator {
                    transform: scale(1.05);
                }

                /* Grid responsive design */
                @media (max-width: 1400px) {
                    .task-card {
                        min-width: 320px !important;
                    }
                }

                @media (max-width: 1200px) {
                    .task-card {
                        min-width: 300px !important;
                    }
                }

                @media (max-width: 768px) {
                    .task-card {
                        min-width: 100% !important;
                        height: 280px !important;
                    }
                    
                    .task-card:hover {
                        transform: translateY(-6px) scale(1.03) !important;
                    }

                    .task-hover-content .task-hover-content > div:first-child {
                        width: 150px !important;
                        height: 100px !important;
                    }

                    /* Reduce container padding on mobile */
                    .task-cards-container {
                        padding: 16px 20px !important;
                    }

                    .task-grid {
                        padding: 12px 16px !important;
                    }
                }

                @media (max-width: 480px) {
                    .task-card {
                        padding: 16px !important;
                        height: 260px !important;
                    }

                    .task-hover-content {
                        padding: 16px !important;
                    }

                    .task-hover-content .task-hover-content > div:first-child {
                        width: 120px !important;
                        height: 80px !important;
                    }

                    /* Further reduce padding on small mobile */
                    .task-cards-container {
                        padding: 12px 16px !important;
                    }

                    .task-grid {
                        padding: 8px 12px !important;
                    }
                }

                /* Smooth animation on load */
                @keyframes cardSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .task-card {
                    animation: cardSlideIn 0.6s ease-out forwards;
                }

                .task-card:nth-child(1) { animation-delay: 0.1s; }
                .task-card:nth-child(2) { animation-delay: 0.2s; }
                .task-card:nth-child(3) { animation-delay: 0.3s; }
                .task-card:nth-child(4) { animation-delay: 0.4s; }
                .task-card:nth-child(5) { animation-delay: 0.5s; }
                .task-card:nth-child(6) { animation-delay: 0.6s; }
                .task-card:nth-child(7) { animation-delay: 0.7s; }
                .task-card:nth-child(8) { animation-delay: 0.8s; }

                /* Focus states for accessibility */
                .task-card:focus {
                    outline: 2px solid var(--accent-text);
                    outline-offset: 2px;
                }

                .task-card:focus .task-hover-content {
                    opacity: 1 !important;
                    transform: scale(1) !important;
                }
            `}</style>
			{!isStep ? (
                <Modal
                    open={open}
                    onCancel={onCancel}
                    footer={null}
                    width={1400} // Further increased width for better card spacing
                    destroyOnClose
                    centered
                    className="theme-manual-modal"
                    styles={{
                        content: {
                            background: 'var(--modal-bg)',
                            borderRadius: '20px',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                            border: '1px solid var(--modal-border)',
                            overflow: 'hidden',
                            backdropFilter: 'blur(20px)'
                        },
                        header: {
                            background: 'var(--modal-header-bg)',
                            borderBottom: '1px solid var(--modal-header-border)',
                            padding: '32px 32px 20px 32px',
                            borderRadius: '20px 20px 0 0'
                        },
                        body: {
                            background: 'transparent',
                            padding: '32px',
                            borderRadius: '0 0 20px 20px'
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