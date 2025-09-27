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

// Task cards with original names and use cases
const taskCards = [
	{
		id: 'image_classification',
		title: 'Image Classification',
		subtitle: 'Identify and categorize objects in images using advanced computer vision techniques.',
		description: 'Perfect for organizing photo collections, content moderation, and product categorization. Upload images and let AI automatically sort them by content.',
		icon: '📸',
		example: {
			input: 'Photos of different fruits: apples, oranges, bananas',
			output: 'Automatically sorted into fruit categories with confidence scores'
		},
		benefits: ['Automate photo organization', 'Improve content discovery', 'Scale visual analysis'],
		useCases: ['Photo organization and management', 'Content moderation systems', 'Product categorization', 'Quality control in manufacturing', 'Medical image analysis'],
		image: image_classification,
		difficulty: 'Beginner',
		timeToTrain: '10-30 minutes'
	},
	{
		id: 'text_classification',
		title: 'Text Classification',
		subtitle: 'Categorize text data based on content, sentiment, and contextual meaning.',
		description: 'Analyze customer reviews, emails, or documents to understand sentiment and automatically categorize content for better organization.',
		icon: '📝',
		example: {
			input: 'Customer review: "Amazing product, fast delivery!"',
			output: 'Category: Positive Feedback, Sentiment: 95% positive'
		},
		benefits: ['Understand customer sentiment', 'Automate content filtering', 'Improve response times'],
		useCases: ['Customer feedback analysis', 'Email routing and prioritization', 'Social media monitoring', 'Document classification', 'Spam detection'],
		image: text_classification,
		difficulty: 'Beginner',
		timeToTrain: '5-15 minutes'
	},
	{
		id: 'multilabel_text_classification',
		title: 'Multilabel Text Classification',
		subtitle: 'Assign multiple relevant labels to each text input for comprehensive classification.',
		description: 'When text needs multiple tags - like marking an email as both "urgent" and "customer-support" for better organization and routing.',
		icon: '🏷️',
		example: {
			input: 'Email: "Urgent: Account access issue for premium user"',
			output: 'Labels: Urgent, Technical Support, Premium Customer'
		},
		benefits: ['Enhanced content organization', 'Better search capabilities', 'Improved workflow automation'],
		useCases: ['Email tagging and routing', 'Content management systems', 'Research paper categorization', 'News article classification', 'Social media content analysis'],
		image: multilabel_text_classification,
		difficulty: 'Intermediate',
		timeToTrain: '15-25 minutes'
	},
	{
		id: 'tabular_classification',
		title: 'Tabular Classification',
		subtitle: 'Classify structured tabular data rows into predefined categories.',
		description: 'Perfect for business analytics! Upload spreadsheet data and automatically categorize customers, transactions, or any structured data.',
		icon: '📊',
		example: {
			input: 'Customer data: Age: 35, Income: $75k, History: 3 years',
			output: 'Classification: High-value customer, Retention priority'
		},
		benefits: ['Automate customer segmentation', 'Improve decision making', 'Scale data analysis'],
		useCases: ['Customer segmentation', 'Credit risk assessment', 'Employee performance evaluation', 'Sales lead scoring', 'Medical diagnosis support'],
		image: tabular_classification,
		difficulty: 'Beginner',
		timeToTrain: '5-20 minutes'
	},
	{
		id: 'tabular_regression',
		title: 'Tabular Regression',
		subtitle: 'Predict numerical values from structured data.',
		description: 'Forecast future values like house prices, sales numbers, or performance scores using your historical data patterns.',
		icon: '📈',
		example: {
			input: 'House: 2000 sq ft, 3 bedrooms, downtown location',
			output: 'Predicted price: $485,000 (±$15,000)'
		},
		benefits: ['Accurate price forecasting', 'Data-driven decisions', 'Risk assessment'],
		useCases: ['Real estate price prediction', 'Sales forecasting', 'Stock price analysis', 'Energy consumption prediction', 'Insurance premium calculation'],
		image: tabular_regression,
		difficulty: 'Intermediate',
		timeToTrain: '10-30 minutes'
	},
	{
		id: 'multilabel_tabular_classification',
		title: 'Multilabel Tabular Classification',
		subtitle: 'Multiple labels for detailed insights from structured data.',
		description: 'Advanced analysis when data needs multiple classifications - essential for comprehensive customer profiling and risk assessment.',
		icon: '🔍',
		example: {
			input: 'Customer: High spending, infrequent purchases, price-sensitive',
			output: 'Labels: High-value, At-risk, Price-conscious, VIP potential'
		},
		benefits: ['Comprehensive customer insights', 'Advanced segmentation', 'Risk identification'],
		useCases: ['Customer behavior analysis', 'Multi-factor risk assessment', 'Product recommendation systems', 'Healthcare patient profiling', 'Financial portfolio analysis'],
		image: multilabel_tabular_classification,
		difficulty: 'Advanced',
		timeToTrain: '20-40 minutes'
	},
	{
		id: 'multimodal_classification',
		title: 'Multimodal Classification',
		subtitle: 'Combine images and text for better insights and understanding.',
		description: 'The most comprehensive approach! Analyze both visual and textual content together for social media, e-commerce, or content platforms.',
		icon: '🎯',
		example: {
			input: 'Product photo + description: "Elegant vintage watch"',
			output: 'Analysis: Luxury item, Fashion category, High engagement potential'
		},
		benefits: ['Complete content understanding', 'Enhanced user experience', 'Better content recommendations'],
		useCases: ['Social media content analysis', 'E-commerce product classification', 'Brand monitoring', 'Advertisement effectiveness', 'Content recommendation systems'],
		image: multimodal_classification,
		difficulty: 'Advanced',
		timeToTrain: '25-45 minutes'
	},
	{
		id: 'multilabel_image_classification',
		title: 'Multilabel Image Classification',
		subtitle: 'Multiple tags for comprehensive photo understanding and organization.',
		description: 'Advanced image analysis that identifies multiple elements in photos for comprehensive tagging and enhanced searchability.',
		icon: '🖼️',
		example: {
			input: 'Photo of a beach sunset with people',
			output: 'Tags: Nature, Beach, Sunset, People, Outdoor, Golden hour'
		},
		benefits: ['Rich photo metadata', 'Improved search capabilities', 'Content discovery'],
		useCases: ['Photo library management', 'Stock photo tagging', 'Social media content analysis', 'Scene understanding for autonomous vehicles', 'Medical imaging analysis'],
		image: multilabel_image_classification,
		difficulty: 'Intermediate',
		timeToTrain: '15-35 minutes'
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
	const selectedTask = selectedIndex !== -1 ? taskCards[selectedIndex] : null

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
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
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

					{/* Two-Column Task Selection Layout */}
					<div className="task-selection-container" style={{ 
						borderRadius: '20px',
						background: 'var(--filter-bg)',
						border: '1px solid var(--filter-border)',
						overflow: 'hidden',
						height: '400px',
						display: 'flex',
						flexDirection: 'column'
					}}>
						<Title level={3} style={{ 
							textAlign: 'center', 
							margin: '20px 0 16px 0',
							color: 'var(--title-project)',
							fontWeight: 700,
							fontFamily: 'Poppins, sans-serif',
							flexShrink: 0
						}}>
							Choose What You Want to Build
						</Title>

						<div className="two-column-layout" style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							height: 'calc(100% - 80px)',
							overflow: 'hidden'
						}}>
							{/* Left Column - Task Cards List */}
							<div className="task-list-column" style={{
								padding: '0 24px 24px 32px',
								borderRight: '1px solid var(--border)',
								overflowY: 'auto',
								height: '100%'
							}}>
								<div style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '16px'
								}}>
									{taskCards.map((task, idx) => {
										const projTypeIndex = projType.findIndex(type => type === task.id);
										const isTaskSelected = isSelected && isSelected[projTypeIndex];
										
										return (
											<div
												key={task.id}
												className={`task-list-item ${isTaskSelected ? 'selected' : ''}`}
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
												aria-pressed={isTaskSelected}
												style={{
													cursor: 'pointer',
													padding: '20px',
													borderRadius: '16px',
													border: '2px solid var(--border)',
													background: isTaskSelected ? 'var(--selection-bg)' : 'var(--card-gradient)',
													transition: 'all 0.3s ease',
													position: 'relative'
												}}
											>
												<div style={{
													display: 'flex',
													alignItems: 'flex-start',
													gap: '16px'
												}}>
													<div style={{
														fontSize: '32px',
														lineHeight: 1,
														marginTop: '4px'
													}}>
														{task.icon}
													</div>
													<div style={{ flex: 1 }}>
														<Title level={5} style={{
															margin: '0 0 8px 0',
															color: 'var(--text)',
															fontSize: '16px',
															fontWeight: 600,
															fontFamily: 'Poppins, sans-serif'
														}}>
															{task.title}
														</Title>
														<Text style={{
															color: 'var(--secondary-text)',
															fontSize: '13px',
															lineHeight: '1.4',
															fontFamily: 'Poppins, sans-serif',
															display: 'block',
															marginBottom: '12px'
														}}>
															{task.description.substring(0, 120)}...
														</Text>
														<div style={{
															display: 'flex',
															gap: '8px',
															flexWrap: 'wrap'
														}}>
															<Tag style={{
																borderRadius: '12px',
																fontSize: '10px',
																padding: '2px 8px',
																background: 'var(--tag-gradient)',
																border: '1px solid var(--tag-border)',
																color: 'var(--tag-color)',
																fontFamily: 'Poppins, sans-serif',
																fontWeight: 500
															}}>
																{task.difficulty}
															</Tag>
														</div>
													</div>
													{isTaskSelected && (
														<div style={{
															position: 'absolute',
															top: '16px',
															right: '16px',
															width: '24px',
															height: '24px',
															borderRadius: '50%',
															background: 'var(--button-gradient)',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															color: '#ffffff',
															fontSize: '14px',
															fontWeight: 'bold'
														}}>
															✓
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* Right Column - Task Details */}
							<div className="task-details-column" style={{
								padding: '0 24px 24px 24px',
								display: 'flex',
								flexDirection: 'column',
								overflowY: 'auto',
								height: '100%'
							}}>
								{selectedTask ? (
									<div className="task-details" style={{
										width: '100%',
										minWidth: '300px',
										maxWidth: '600px'
									}}>
										{/* Large Image */}
										<div style={{
											width: '100%',
											height: '200px',
											borderRadius: '20px',
											overflow: 'hidden',
											marginBottom: '24px',
											boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
											border: '2px solid var(--border-hover)'
										}}>
											<img 
												src={selectedTask.image} 
												alt={selectedTask.title}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover'
												}}
											/>
										</div>

										{/* Title and Subtitle */}
										<div style={{ textAlign: 'center', marginBottom: '24px' }}>
											<Title level={3} style={{
												margin: '0 0 8px 0',
												color: 'var(--text)',
												fontWeight: 700,
												fontFamily: 'Poppins, sans-serif'
											}}>
												{selectedTask.title}
											</Title>
											<Text style={{
												color: 'var(--secondary-text)',
												fontSize: '14px',
												lineHeight: '1.5',
												fontFamily: 'Poppins, sans-serif'
											}}>
												{selectedTask.subtitle}
											</Text>
										</div>

										{/* Example Section */}
										<div style={{
											background: 'var(--card-gradient)',
											border: '2px solid var(--border)',
											borderRadius: '16px',
											padding: '20px',
											marginBottom: '24px'
										}}>
											<Title level={5} style={{
												margin: '0 0 16px 0',
												color: 'var(--text)',
												fontFamily: 'Poppins, sans-serif',
												textAlign: 'center'
											}}>
												Example
											</Title>
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
													fontSize: '13px',
													fontWeight: 500,
													fontFamily: 'Poppins, sans-serif',
													lineHeight: '1.4'
												}}>
													{selectedTask.example.input}
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
													fontSize: '13px',
													fontWeight: 600,
													fontFamily: 'Poppins, sans-serif',
													lineHeight: '1.4'
												}}>
													{selectedTask.example.output}
												</Text>
											</div>
										</div>

										{/* Use Cases */}
										<div style={{ marginBottom: '24px' }}>
											<Title level={5} style={{
												margin: '0 0 12px 0',
												color: 'var(--text)',
												fontFamily: 'Poppins, sans-serif'
											}}>
												Common Use Cases
											</Title>
											<div style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '8px'
											}}>
												{selectedTask.useCases.map((useCase, i) => (
													<div key={i} style={{
														display: 'flex',
														alignItems: 'center',
														gap: '8px'
													}}>
														<div style={{
															width: '6px',
															height: '6px',
															borderRadius: '50%',
															background: 'var(--accent-text)'
														}} />
														<Text style={{
															color: 'var(--text)',
															fontSize: '13px',
															fontFamily: 'Poppins, sans-serif',
															lineHeight: '1.4'
														}}>
															{useCase}
														</Text>
													</div>
												))}
											</div>
										</div>

										{/* Benefits */}
										<div style={{ marginBottom: '24px' }}>
											<Title level={5} style={{
												margin: '0 0 12px 0',
												color: 'var(--text)',
												fontFamily: 'Poppins, sans-serif'
											}}>
												Key Benefits
											</Title>
											<div style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '8px'
											}}>
												{selectedTask.benefits.map((benefit, i) => (
													<div key={i} style={{
														display: 'flex',
														alignItems: 'center',
														gap: '8px'
													}}>
														<div style={{
															width: '6px',
															height: '6px',
															borderRadius: '50%',
															background: 'var(--accent-text)'
														}} />
														<Text style={{
															color: 'var(--text)',
															fontSize: '13px',
															fontFamily: 'Poppins, sans-serif',
															lineHeight: '1.4'
														}}>
															{benefit}
														</Text>
													</div>
												))}
											</div>
										</div>

										{/* Training Time */}
										<div style={{
											background: 'var(--tag-gradient)',
											border: '1px solid var(--tag-border)',
											borderRadius: '12px',
											padding: '16px',
											textAlign: 'center',
											marginBottom: '24px'
										}}>
											<Text style={{
												color: 'var(--secondary-text)',
												fontSize: '11px',
												fontWeight: 600,
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												fontFamily: 'Poppins, sans-serif',
												display: 'block',
												marginBottom: '6px'
											}}>
												Expected Training Time
											</Text>
											<Text style={{
												color: 'var(--text)',
												fontSize: '14px',
												fontWeight: 600,
												fontFamily: 'Poppins, sans-serif'
											}}>
												{selectedTask.timeToTrain}
											</Text>
										</div>
									</div>
								) : (
									<div style={{
										textAlign: 'center',
										color: 'var(--secondary-text)',
										fontFamily: 'Poppins, sans-serif'
									}}>
										<div style={{
											fontSize: '48px',
											marginBottom: '16px',
											opacity: 0.5
										}}>
											🎯
										</div>
										<Title level={4} style={{
											color: 'var(--secondary-text)',
											fontFamily: 'Poppins, sans-serif',
											fontWeight: 500
										}}>
											Select a task type to see details
										</Title>
										<Text style={{
											color: 'var(--secondary-text)',
											fontSize: '14px',
											fontFamily: 'Poppins, sans-serif'
										}}>
											Choose from the options on the left to learn more
										</Text>
									</div>
								)}
							</div>
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

                /* Fixed Size Modal */
                .fixed-size-modal .ant-modal {
                    max-width: 90vw !important;
                }

                .fixed-size-modal .ant-modal-content {
                    overflow: hidden !important;
                }

                .fixed-size-modal .ant-modal-body {
                    overflow: hidden !important;
                }

                /* Task Selection Container */
                .task-selection-container {
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }

                /* Task List Items */
                .task-list-item {
                    backdrop-filter: blur(10px);
                    position: relative;
                    overflow: hidden;
                }

                .task-list-item::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, 
                        rgba(255, 255, 255, 0.05) 0%, 
                        rgba(255, 255, 255, 0.02) 100%
                    );
                    pointer-events: none;
                    border-radius: 16px;
                    z-index: 0;
                }

                .task-list-item:hover {
                    border-color: var(--accent-text) !important;
                    background: var(--hover-bg) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2) !important;
                }

                .task-list-item.selected {
                    border-color: var(--accent-text) !important;
                    background: var(--selection-bg) !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3) !important;
                }

                /* Custom scrollbar for task list */
                .task-list-column::-webkit-scrollbar {
                    width: 6px;
                }

                .task-list-column::-webkit-scrollbar-track {
                    background: var(--border);
                    border-radius: 3px;
                }

                .task-list-column::-webkit-scrollbar-thumb {
                    background: var(--accent-text);
                    border-radius: 3px;
                }

                .task-list-column::-webkit-scrollbar-thumb:hover {
                    background: var(--accent-text);
                    opacity: 0.8;
                }

                /* Smooth animations */
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .task-list-item {
                    animation: slideInLeft 0.5s ease-out forwards;
                }

                .task-details {
                    animation: slideInRight 0.5s ease-out forwards;
                }

                .task-list-item:nth-child(1) { animation-delay: 0.1s; }
                .task-list-item:nth-child(2) { animation-delay: 0.15s; }
                .task-list-item:nth-child(3) { animation-delay: 0.2s; }
                .task-list-item:nth-child(4) { animation-delay: 0.25s; }
                .task-list-item:nth-child(5) { animation-delay: 0.3s; }
                .task-list-item:nth-child(6) { animation-delay: 0.35s; }
                .task-list-item:nth-child(7) { animation-delay: 0.4s; }
                .task-list-item:nth-child(8) { animation-delay: 0.45s; }

                /* Responsive Design for Fixed Modal */
                @media (max-width: 1200px) {
                    .fixed-size-modal .ant-modal {
                        width: 95vw !important;
                    }
                }

                @media (max-width: 768px) {
                    .fixed-size-modal .ant-modal {
                        width: 95vw !important;
                        height: 90vh !important;
                    }

                    .fixed-size-modal .ant-modal-content {
                        height: 90vh !important;
                    }

                    .fixed-size-modal .ant-modal-body {
                        padding: 16px !important;
                        height: calc(90vh - 120px) !important;
                    }

                    .task-selection-container {
                        height: calc(90vh - 260px) !important;
                    }

                    .two-column-layout {
                        grid-template-columns: 1fr !important;
                        grid-template-rows: 45% 55% !important;
                    }

                    .task-list-column {
                        border-right: none !important;
                        border-bottom: 1px solid var(--border) !important;
                        padding: 0 16px 16px 16px !important;
                    }

                    .task-details-column {
                        padding: 16px !important;
                    }

                    .task-details {
                        max-width: 100% !important;
                        margin: 0 auto !important;
                    }

                    .task-details img {
                        height: 120px !important;
                    }
                }

                @media (max-width: 480px) {
                    .fixed-size-modal .ant-modal {
                        width: 98vw !important;
                        height: 95vh !important;
                    }

                    .fixed-size-modal .ant-modal-content {
                        height: 95vh !important;
                    }

                    .fixed-size-modal .ant-modal-body {
                        padding: 12px !important;
                        height: calc(95vh - 120px) !important;
                    }

                    .task-selection-container {
                        height: calc(95vh - 240px) !important;
                        border-radius: 12px !important;
                    }

                    .task-list-column {
                        padding: 0 12px 12px 12px !important;
                    }

                    .task-details-column {
                        padding: 12px !important;
                    }

                    .task-list-item {
                        padding: 16px !important;
                    }

                    .task-details img {
                        height: 100px !important;
                    }
                }

                /* Focus states for accessibility */
                .task-list-item:focus {
                    outline: 2px solid var(--accent-text);
                    outline-offset: 2px;
                }

                /* Loading and transition states */
                .task-details-fade-enter {
                    opacity: 0;
                    transform: translateY(10px);
                }

                .task-details-fade-enter-active {
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 300ms ease, transform 300ms ease;
                }

                .task-details-fade-exit {
                    opacity: 1;
                    transform: translateY(0);
                }

                .task-details-fade-exit-active {
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: opacity 300ms ease, transform 300ms ease;
                }
            `}</style>
			{!isStep ? (
                <Modal
                    open={open}
                    onCancel={onCancel}
                    footer={null}
                    width={1200}
                    destroyOnClose
                    centered
                    className="theme-manual-modal fixed-size-modal"
                    styles={{
                        content: {
                            background: 'var(--modal-bg)',
                            borderRadius: '20px',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                            border: '1px solid var(--modal-border)',
                            overflow: 'hidden',
                            backdropFilter: 'blur(20px)',
                            height: '700px',
                            maxHeight: '90vh'
                        },
                        header: {
                            background: 'var(--modal-header-bg)',
                            borderBottom: '1px solid var(--modal-header-border)',
                            padding: '24px 32px 16px 32px',
                            borderRadius: '20px 20px 0 0'
                        },
                        body: {
                            background: 'transparent',
                            padding: '24px',
                            borderRadius: '0 0 20px 20px',
                            height: 'calc(700px - 120px)',
                            overflow: 'hidden'
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