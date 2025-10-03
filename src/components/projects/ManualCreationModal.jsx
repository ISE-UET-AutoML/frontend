import React from 'react'
import { Modal, Row, Col, Button, Typography, Input, Tag, Form } from 'antd'
import MarkdownRenderer from 'src/components/MarkdownRenderer.jsx'
// Removed Info icon for cleaner inputs

// import { TASK_TYPES } from 'src/constants/types'
import image_classification from 'src/assets/images/image_classification.png'
import text_classification from 'src/assets/images/text_classification.png'
import multilabel_text_classification from 'src/assets/images/multilabel_text_classification.png'
import tabular_classification from 'src/assets/images/tabular_classification.png'
import tabular_regression from 'src/assets/images/tabular_regression.png'
import multilabel_tabular_classification from 'src/assets/images/multilabel_tabular_classification.png'
import multimodal_classification from 'src/assets/images/multimodal_classification.png'
import multilabel_image_classification from 'src/assets/images/multilabel_image_classification.jpg'
import object_detection from 'src/assets/images/object_detection.jpg'
import semantic_segmentation from 'src/assets/images/semantic_segmentation.jpg'
import time_series_forecasting from 'src/assets/images/time_series_forecasting.jpg'

const { Title, Text } = Typography
// const { TextArea } = Input

// Only include the 8 non-technical task types
const projType = [
	'image_classification',
	'text_classification',
	'multilabel_text_classification',
	'tabular_classification',
	'tabular_regression',
	'multilabel_tabular_classification',
	'multimodal_classification',
	'multilabel_image_classification',
]

// const tagIcons = { ...unused icon map removed }

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
		subtitle:
			'Identify and categorize objects in images using advanced computer vision techniques.',
		description:
			'Perfect for organizing photo collections, content moderation, and product categorization. Upload images and let AI automatically sort them by content.',
		icon: '📸',
		example: {
			input: 'Photos of different fruits: apples, oranges, bananas',
			output: 'Automatically sorted into fruit categories with confidence scores',
		},
		example_explain:
			'Classifies an input image into one of several categories.',

		image: image_classification,
		difficulty: 'Beginner',
		timeToTrain: '10-30 minutes',
	},
	{
		id: 'text_classification',
		title: 'Text Classification',
		subtitle:
			'Categorize text data based on content, sentiment, and contextual meaning.',
		description:
			'Analyze customer reviews, emails, or documents to understand sentiment and automatically categorize content for better organization.',
		icon: '📝',
		example: {
			input: 'Customer review: "Amazing product, fast delivery!"',
			output: 'Category: Positive Feedback, Sentiment: 95% positive',
		},
		example_explain: 'Predicts sentiment or topic for the given text.',

		image: text_classification,
		difficulty: 'Beginner',
		timeToTrain: '5-15 minutes',
	},
	{
		id: 'multilabel_text_classification',
		title: 'Multilabel Text Classification',
		subtitle:
			'Assign multiple relevant labels to each text input for comprehensive classification.',
		description:
			'When text needs multiple tags - like marking an email as both "urgent" and "customer-support" for better organization and routing.',
		icon: '🏷️',
		example: {
			input: 'Email: "Urgent: Account access issue for premium user"',
			output: 'Labels: Urgent, Technical Support, Premium Customer',
		},

		image: multilabel_text_classification,
		difficulty: 'Intermediate',
		timeToTrain: '15-25 minutes',
	},
	{
		id: 'tabular_classification',
		title: 'Tabular Classification',
		subtitle:
			'Classify structured tabular data rows into predefined categories.',
		description:
			'Perfect for business analytics! Upload spreadsheet data and automatically categorize customers, transactions, or any structured data.',
		icon: '📊',
		example_explain: 'Predicts a class for each row in a structured table.',
		image: tabular_classification,
		difficulty: 'Beginner',
		timeToTrain: '5-20 minutes',
	},
	{
		id: 'tabular_regression',
		title: 'Tabular Regression',
		subtitle: 'Predict numerical values from structured data.',
		description:
			'Forecast future values like house prices, sales numbers, or performance scores using your historical data patterns.',
		icon: '📈',
		example_explain: `📌 **This example shows how a system can predict house prices based on simple features.**

In this table:
- Each row represents one house.
- The first 3 columns (Square Footage, Bedrooms, Location) are the **input information** — things we already know about the house.
- The last column (“Predicted Price”) is the **output** — what the system calculates or guesses based on those inputs.

🏡 For example:
→ House #1: 80 sq ft, 2 bedrooms, in Suburban → Predicted price: **$1.2M**  
→ House #2: 120 sq ft, 3 bedrooms, also in Suburban → Predicted price: **$1.8M**  
→ House #3: 100 sq ft, 3 bedrooms, but in Downtown → Predicted price: **$3.0M**  
→ House #4: 150 sq ft, 4 bedrooms, in Downtown → Predicted price: **$4.5M**

💡 In short:  
This is like a smart calculator that looks at the house’s details and gives you an estimated price — not just guessing randomly, but using real patterns from past data.`,
		explain: `📌 **This example shows how a system can predict house prices based on simple features.**\n\nIn this table:\n- Each row represents one house.\n- The first 3 columns (Square Footage, Bedrooms, Location) are the **input information** — things we already know about the house.\n- The last column (“Predicted Price”) is the **output** — what the system calculates or guesses based on those inputs.\n\n🏡 For example:\n- House #1: 80 sq ft, 2 bedrooms — Predicted price: **$1.2M**\n- House #2: 120 sq ft, 3 bedrooms — Predicted price: **$1.8M**\n- House #3: 100 sq ft, 3 bedrooms  — Predicted price: **$3.0M**\n- House #4: 150 sq ft, 4 bedrooms  — Predicted price: **$4.5M**\n\n💡 In short:\nThis is like a smart calculator that looks at the house’s details and gives you an estimated price — not just guessing randomly, but using real patterns from past data.`,
		image: tabular_regression,
		difficulty: 'Intermediate',
		timeToTrain: '10-30 minutes',
	},
	{
		id: 'multilabel_tabular_classification',
		title: 'Multilabel Tabular Classification',
		subtitle: 'Multiple labels for detailed insights from structured data.',
		description:
			'Advanced analysis when data needs multiple classifications - essential for comprehensive customer profiling and risk assessment.',
		icon: '🔍',
		explain: `📌 **This example shows how Multilabel Classification works using movies.**\n\nIn this table:\n- Each row is a movie (like "Avengers: Endgame" or "Titanic").\n- The last column — “Genres” — shows **all the categories that apply to that movie**.\n\n🎬 For example:\n\n- Movie #1: "Avengers: Endgame" — has 3 genres: **Action, Adventure, Sci-Fi**\n- Movie #2: "Titanic" — has 3 genres: **Romance, Disaster, Historical**\n- Movie #3: "Parasite" — has 4 genres: **Thriller, Comedy, Drama, Social Commentary**\n- Movie #4: "The Hangover" — has 2 genres: **Comedy, Adventure**\n\n✅ This is different from “single-label” classification, where each movie could only belong to ONE genre (e.g., just “Action” or just “Comedy”). Here, we allow **multiple labels per item** — because real life is rarely black-and-white!\n\n💡 In short:\nThis table shows how one movie can be many things at once — and that’s exactly what multilabel classification does: it lets you assign **multiple correct answers** to one piece of data.`,
		example_explain:
			'Multilabel Tabular Classification\nMultiple labels for detailed insights from structured data.',
		image: multilabel_tabular_classification,
		difficulty: 'Advanced',
		timeToTrain: '20-40 minutes',
	},
	{
		id: 'multimodal_classification',
		title: 'Multimodal Classification',
		subtitle:
			'Combine images and text for better insights and understanding.',
		description:
			'The most comprehensive approach! Analyze both visual and textual content together for social media, e-commerce, or content platforms.',
		icon: '🎯',
		example_explain: 'Combines image and text signals for classification.',
		image: multimodal_classification,
		difficulty: 'Advanced',
		timeToTrain: '25-45 minutes',
	},
]

// const getImageByProjectType = (selectedProjectType) => projectTypeImages[selectedProjectType] || image_classification

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
	const [hoverTaskIndex, setHoverTaskIndex] = React.useState(null)

	// Dark mode flag not used here

	const selectedIndex = Array.isArray(isSelected)
		? isSelected.findIndex((item) => item === true)
		: -1
	// const selectedProjectType = selectedIndex !== -1 ? projType[selectedIndex] : null
	const selectedTask = selectedIndex !== -1 ? taskCards[selectedIndex] : null
	const displayTask =
		hoverTaskIndex !== null ? taskCards[hoverTaskIndex] : selectedTask

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
			onNext(values)
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
				flexDirection: 'column',
			}}
			initialValues={{
				name: initialProjectName,
				description: initialDescription,
				task_type: initialTaskType,
			}}
		>
			{/* Two-column overall layout: left = fields + task list, right = task details */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1.1fr 0.9fr',
					gap: 24,
				}}
			>
				{/* Left column */}
				<div
					style={{
						borderRight: '2px solid #0ea5e9',
						paddingRight: '12px',
					}}
				>
					<Row gutter={[24, 24]}>
						<Col span={24}>
							<Form.Item
								label="Project Name"
								name="name"
								style={{ marginBottom: 16 }}
								validateTrigger={['onChange', 'onBlur']}
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
									{
										pattern: /^[\p{L}0-9 _-]+$/u,
										message:
											'Only letters, numbers, spaces, _ and - are allowed.',
									},
								]}
							>
								<Input
									placeholder="E.g., Customer Churn Predictor"
									size="large"
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* Description */}
					<Row gutter={[24, 24]}>
						<Col span={24}>
							<Form.Item label="Description" name="description">
								<Input
									placeholder="Describe your project's goals and requirements..."
									size="large"
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* Task list box */}
					<div
						className="task-selection-container"
						style={{
							borderRadius: '20px',
							background: 'var(--filter-bg)',
							border: '1px solid var(--filter-border)',
							overflow: 'hidden',
							marginTop: 8,
						}}
					>
						<Title
							level={3}
							style={{
								textAlign: 'center',
								margin: '16px 0',
								color: 'var(--title-project)',
								fontWeight: 700,
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							Choose Your Task
						</Title>
						<div
							className="task-list-column"
							style={{
								padding: '0 20px 20px 28px',
								borderTop: '1px solid var(--border)',
								maxHeight: 520,
								overflowY: 'auto',
							}}
						>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns:
										'repeat(3, minmax(0, 1fr))',
									gap: '12px',
									paddingTop: '12px',
								}}
							>
								{taskCards.map((task, idx) => {
									const projTypeIndex = projType.findIndex(
										(type) => type === task.id
									)
									const isTaskSelected =
										isSelected && isSelected[projTypeIndex]

									return (
										<div
											key={task.id}
											className={`task-list-item ${isTaskSelected ? 'selected' : ''}`}
											onClick={(e) =>
												handleSelectType(
													e,
													projTypeIndex
												)
											}
											onKeyDown={(e) => {
												if (
													e.key === 'Enter' ||
													e.key === ' '
												) {
													e.preventDefault()
													handleSelectType(
														e,
														projTypeIndex
													)
												}
											}}
											onMouseEnter={() =>
												setHoverTaskIndex(projTypeIndex)
											}
											onMouseLeave={() =>
												setHoverTaskIndex(null)
											}
											tabIndex={0}
											role="button"
											aria-label={`Select ${task.title} task type`}
											aria-pressed={isTaskSelected}
											style={{
												cursor: 'pointer',
												padding: '14px',
												borderRadius: '16px',
												border: '2px solid var(--border)',
												background: isTaskSelected
													? 'var(--selection-bg)'
													: 'var(--card-gradient)',
												transition: 'all 0.3s ease',
												position: 'relative',
												minHeight: '120px',
												overflow: 'hidden',
											}}
										>
											<div
												style={{
													display: 'flex',
													alignItems: 'flex-start',
													gap: '12px',
												}}
											>
												<div
													style={{
														fontSize: '24px',
														lineHeight: 1,
														marginTop: '2px',
													}}
												>
													{task.icon}
												</div>
												<div style={{ flex: 1 }}>
													<Title
														level={5}
														style={{
															margin: '0 0 4px 0',
															color: 'var(--text)',
															fontSize: '14px',
															fontWeight: 600,
															fontFamily:
																'Poppins, sans-serif',
														}}
														className="task-title"
													>
														{task.title}
													</Title>
													<div
														style={{
															display: 'flex',
															gap: '8px',
															flexWrap: 'wrap',
														}}
													>
														<Tag
															style={{
																borderRadius:
																	'12px',
																fontSize:
																	'10px',
																padding:
																	'2px 8px',
																background:
																	'var(--tag-gradient)',
																border: '1px solid var(--tag-border)',
																color: 'var(--tag-color)',
																fontFamily:
																	'Poppins, sans-serif',
																fontWeight: 500,
															}}
														>
															{task.difficulty}
														</Tag>
													</div>
												</div>

												{isTaskSelected && (
													<div
														style={{
															position:
																'absolute',
															top: '16px',
															right: '16px',
															width: '24px',
															height: '24px',
															borderRadius: '50%',
															background:
																'var(--button-gradient)',
															display: 'flex',
															alignItems:
																'center',
															justifyContent:
																'center',
															color: '#ffffff',
															fontSize: '14px',
															fontWeight: 'bold',
														}}
													>
														✓
													</div>
												)}
											</div>
										</div>
									)
								})}
							</div>
						</div>
					</div>
				</div>

				{/* Right column - task details */}
				<div
					className="task-details-column"
					style={{
						padding: '0 24px 24px 24px',
						overflowY: 'auto',
						maxHeight: 700,
					}}
				>
					{displayTask ? (
						<div
							className="task-details"
							style={{
								width: '100%',
								minWidth: '300px',
								maxWidth: '100%',
							}}
						>
							<div
								style={{
									textAlign: 'center',
									marginBottom: '24px',
								}}
							>
								<Title
									level={3}
									style={{
										margin: '0 0 8px 0',
										color: 'var(--text)',
										fontWeight: 700,
										fontFamily: 'Poppins, sans-serif',
									}}
								>
									{displayTask.title}
								</Title>
								<Text
									style={{
										color: 'var(--secondary-text)',
										fontSize: '14px',
										lineHeight: '1.5',
										fontFamily: 'Poppins, sans-serif',
									}}
								>
									{displayTask.subtitle}
								</Text>
							</div>

							<div
								style={{
									width: '100%',
									height: '340px',
									borderRadius: '20px',
									overflow: 'hidden',
									marginBottom: '24px',
									boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
									border: '2px solid var(--border-hover)',
								}}
							>
								<img
									src={displayTask.image}
									alt={displayTask.title}
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'contain',
									}}
								/>
							</div>

							{/* Long explanation block (if provided) */}
							{displayTask.explain && (
								<div
									style={{
										background: 'var(--card-gradient)',
										border: '2px solid var(--border)',
										borderRadius: '16px',
										padding: '20px',
										marginBottom: '24px',
									}}
								>
									<Title
										level={5}
										style={{
											margin: '0 0 12px 0',
											color: 'var(--text, #ffffff)',
											fontFamily: 'Poppins, sans-serif',
											textAlign: 'center',
										}}
									>
										Explanation
									</Title>
									<MarkdownRenderer
										markdownText={displayTask.explain}
									/>
								</div>
							)}

							{displayTask.example && (
								<div
									style={{
										background: 'var(--card-gradient)',
										border: '2px solid var(--border)',
										borderRadius: '16px',
										padding: '20px',
										marginBottom: '24px',
									}}
								>
									<Title
										level={5}
										style={{
											margin: '0 0 16px 0',
											color: 'var(--text)',
											fontFamily: 'Poppins, sans-serif',
											textAlign: 'center',
										}}
									>
										Example
									</Title>
									<div style={{ marginBottom: '12px' }}>
										<Text
											style={{
												color: 'var(--secondary-text)',
												fontSize: '11px',
												fontWeight: 700,
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												fontFamily:
													'Poppins, sans-serif',
												display: 'block',
												marginBottom: '6px',
											}}
										>
											INPUT:
										</Text>
										<Text
											style={{
												color: 'var(--text)',
												fontSize: '13px',
												fontWeight: 500,
												fontFamily:
													'Poppins, sans-serif',
												lineHeight: '1.4',
											}}
										>
											{displayTask.example.input}
										</Text>
									</div>
									<div>
										<Text
											style={{
												color: 'var(--secondary-text)',
												fontSize: '11px',
												fontWeight: 700,
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												fontFamily:
													'Poppins, sans-serif',
												display: 'block',
												marginBottom: '6px',
											}}
										>
											OUTPUT:
										</Text>
										<Text
											style={{
												color: 'var(--accent-text)',
												fontSize: '13px',
												fontWeight: 600,
												fontFamily:
													'Poppins, sans-serif',
												lineHeight: '1.4',
											}}
										>
											{displayTask.example.output}
										</Text>
									</div>
									{displayTask.example_explain && (
										<div style={{ marginTop: '12px' }}>
											<Text
												style={{
													color: 'var(--secondary-text)',
													fontSize: '12px',
													fontFamily:
														'Poppins, sans-serif',
													whiteSpace: 'pre-wrap',
												}}
											>
												{displayTask.example_explain}
											</Text>
										</div>
									)}
								</div>
							)}

							{displayTask.useCases && (
								<div style={{ marginBottom: '24px' }}>
									<Title
										level={5}
										style={{
											margin: '0 0 12px 0',
											color: 'var(--text)',
											fontFamily: 'Poppins, sans-serif',
										}}
									>
										Common Use Cases
									</Title>
									<div
										style={{
											display: 'flex',
											flexDirection: 'column',
											gap: '8px',
										}}
									>
										{displayTask.useCases.map(
											(useCase, i) => (
												<div
													key={i}
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '8px',
													}}
												>
													<div
														style={{
															width: '6px',
															height: '6px',
															borderRadius: '50%',
															background:
																'var(--accent-text)',
														}}
													/>
													<Text
														style={{
															color: 'var(--text)',
															fontSize: '13px',
															fontFamily:
																'Poppins, sans-serif',
															lineHeight: '1.4',
														}}
													>
														{useCase}
													</Text>
												</div>
											)
										)}
									</div>
								</div>
							)}

							{displayTask.benefits && (
								<div style={{ marginBottom: '24px' }}>
									<Title
										level={5}
										style={{
											margin: '0 0 12px 0',
											color: 'var(--text)',
											fontFamily: 'Poppins, sans-serif',
										}}
									>
										Key Benefits
									</Title>
									<div
										style={{
											display: 'flex',
											flexDirection: 'column',
											gap: '8px',
										}}
									>
										{displayTask.benefits.map(
											(benefit, i) => (
												<div
													key={i}
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '8px',
													}}
												>
													<div
														style={{
															width: '6px',
															height: '6px',
															borderRadius: '50%',
															background:
																'var(--accent-text)',
														}}
													/>
													<Text
														style={{
															color: 'var(--text)',
															fontSize: '13px',
															fontFamily:
																'Poppins, sans-serif',
															lineHeight: '1.4',
														}}
													>
														{benefit}
													</Text>
												</div>
											)
										)}
									</div>
								</div>
							)}

							<div
								style={{
									background: 'var(--tag-gradient)',
									border: '1px solid var(--tag-border)',
									borderRadius: '12px',
									padding: '16px',
									textAlign: 'center',
									marginBottom: '24px',
								}}
							>
								<Text
									style={{
										color: 'var(--secondary-text)',
										fontSize: '11px',
										fontWeight: 600,
										textTransform: 'uppercase',
										letterSpacing: '0.5px',
										fontFamily: 'Poppins, sans-serif',
										display: 'block',
										marginBottom: '6px',
									}}
								>
									Expected Training Time
								</Text>
								<Text
									style={{
										color: 'var(--text)',
										fontSize: '14px',
										fontWeight: 600,
										fontFamily: 'Poppins, sans-serif',
									}}
								>
									{displayTask.timeToTrain}
								</Text>
							</div>
						</div>
					) : (
						<div
							style={{
								textAlign: 'center',
								color: 'var(--secondary-text)',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							<div
								style={{
									fontSize: '48px',
									marginBottom: '16px',
									opacity: 0.5,
								}}
							>
								🎯
							</div>
							<Title
								level={4}
								style={{
									color: 'var(--secondary-text)',
									fontFamily: 'Poppins, sans-serif',
									fontWeight: 500,
								}}
							>
								Select a task type to see details
							</Title>
							<Text
								style={{
									color: 'var(--secondary-text)',
									fontSize: '14px',
									fontFamily: 'Poppins, sans-serif',
								}}
							>
								Choose from the options on the left to learn
								more
							</Text>
						</div>
					)}
				</div>
			</div>

			{/* Submit */}
			<Row justify="end" style={{ marginTop: 24 }}>
				<Button
					onClick={onCancel}
					style={{ marginRight: 8 }}
					size="large"
				>
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
                    background: transparent !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--text) !important;
                    border-radius: 8px !important;
                }

                .theme-manual-form .ant-input:hover {
                    border-color: var(--input-hover-border) !important;
                }

                .theme-manual-form .ant-input:focus,
                .theme-manual-form .ant-input-focused {
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                    background: transparent !important;
                    color: var(--text) !important;
                    caret-color: var(--text) !important;
                }

                .theme-manual-form textarea.ant-input {
                    background: transparent !important;
                    color: var(--text) !important;
                    caret-color: var(--text) !important;
                }
                .theme-manual-form textarea.ant-input:focus,
                .theme-manual-form textarea.ant-input:hover {
                    background: transparent !important;
                }

                /* Stronger override for AntD textarea wrapper */
                .theme-manual-form .ant-input-textarea,
                .theme-manual-form .ant-input-textarea textarea,
                .theme-manual-form .ant-input {
                    background: transparent !important;
                    color: var(--text) !important;
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

                /* Overlay no longer used for description; keep disabled */
                .task-list-item .task-overlay { display: none; }

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

                /* Hover overlay to show description */
                .task-list-item .task-overlay { pointer-events: none; }
                .task-list-item:hover .task-overlay { opacity: 1; }
                .task-list-item:hover { transform: translateY(-2px) !important; }

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
							maxHeight: '90vh',
						},
						header: {
							background: 'var(--modal-header-bg)',
							borderBottom:
								'1px solid var(--modal-header-border)',
							padding: '24px 32px 16px 32px',
							borderRadius: '20px 20px 0 0',
						},
						body: {
							background: 'transparent',
							padding: '24px',
							borderRadius: '0 0 20px 20px',
							height: 'calc(700px - 120px)',
							overflow: 'hidden',
						},
					}}
				>
					<Title
						level={3}
						style={{
							textAlign: 'center',
							marginBottom: 24,
							color: 'var(--modal-title-color)',
							fontFamily: 'Poppins, sans-serif',
							fontWeight: 600,
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
