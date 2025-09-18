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
} from 'antd'
import { InfoCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import { TASK_TYPES } from 'src/constants/types'

// Import images
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

const { Title, Text } = Typography
const { TextArea } = Input

const projType = Object.keys(TASK_TYPES)

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

const typeDescription = [
	'Identify and categorize objects in images.',
	'Categorize text data based on content.',
	'Assign multiple labels to each text input.',
	'Classify tabular data rows into categories.',
	'Predict continuous values for structured tabular data.',
	'Assign multiple labels to each row in tabular data.',
	'Combine multiple data sources (e.g., text + images) for classification.',
	'Assign multiple labels to each image.',
	'Identify objects in images with bounding boxes.',
	'Segment images at the pixel level to locate objects or regions.',
	'Predict future values of variables based on historical time series data.',
]

const ManualCreationModal = ({
	open,
	onCancel,
	onSubmit,
	projectName,
	setProjectName,
	description,
	setDescription,
	isSelected,
	onSelectType,
}) => {
	return (
		<>
			<style>{`
                .theme-manual-modal .ant-modal-content {
                    background: var(--modal-bg) !important;
                    border: 1px solid var(--modal-border) !important;
                    border-radius: 16px !important;
                }
                
                .theme-manual-modal .ant-modal-header {
                    background: var(--modal-header-bg) !important;
                    border-bottom: 1px solid var(--modal-header-border) !important;
                }
                
                .theme-manual-modal .ant-modal-title {
                    color: var(--modal-title-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .theme-manual-modal .ant-modal-close {
                    color: var(--modal-close-color) !important;
                }
                
                .theme-manual-modal .ant-modal-close:hover {
                    color: var(--modal-close-hover) !important;
                }
                
                .theme-manual-modal .ant-typography {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-manual-modal .ant-typography.ant-typography-secondary {
                    color: var(--secondary-text) !important;
                }
                
                .theme-manual-modal .ant-input {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    border-radius: 8px !important;
                }
                
                .theme-manual-modal .ant-input:focus,
                .theme-manual-modal .ant-input-focused {
                    background: var(--input-bg) !important;
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                    color: var(--input-color) !important;
                }
                
                .theme-manual-modal .ant-input:hover {
                    border-color: var(--input-hover-border) !important;
                }
                
                .theme-manual-modal .ant-input::placeholder {
                    color: var(--placeholder-color) !important;
                }
                
                .theme-manual-modal .ant-input-prefix .anticon {
                    color: var(--accent-text) !important;
                }
                
                .theme-manual-modal .ant-input-suffix .anticon {
                    color: var(--secondary-text) !important;
                }
                
                /* Input wrapper styling */
                .theme-manual-modal .ant-input-affix-wrapper {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 8px !important;
                }
                
                .theme-manual-modal .ant-input-affix-wrapper:focus,
                .theme-manual-modal .ant-input-affix-wrapper-focused {
                    background: var(--input-bg) !important;
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                }
                
                .theme-manual-modal .ant-input-affix-wrapper:hover {
                    border-color: var(--input-hover-border) !important;
                }
                
                .theme-manual-modal .ant-input-affix-wrapper .ant-input {
                    background: transparent !important;
                    color: var(--input-color) !important;
                }
                
                .theme-manual-modal .ant-input-affix-wrapper .ant-input:focus {
                    background: transparent !important;
                    color: var(--input-color) !important;
                }
                
                /* Force override for all input elements */
                .theme-manual-modal input {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 8px !important;
                }
                
                .theme-manual-modal input:focus {
                    background: var(--input-bg) !important;
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                    color: var(--input-color) !important;
                }
                
                .theme-manual-modal input:hover {
                    border-color: var(--input-hover-border) !important;
                }
                
                .theme-manual-modal .ant-card {
                    background: var(--card-gradient) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: 12px !important;
                    transition: all 0.3s ease !important;
                }
                
                .theme-manual-modal .ant-card:hover {
                    background: var(--hover-bg) !important;
                    border-color: var(--border-hover) !important;
                    transform: translateY(-2px) !important;
                }
                
                .theme-manual-modal .ant-card.selected {
                    background: var(--selection-bg) !important;
                    border-color: var(--accent-text) !important;
                    box-shadow: 0 4px 16px var(--selection-bg) !important;
                }
                
                .theme-manual-modal .ant-card img {
                    border-radius: 8px !important;
                    filter: brightness(0.9) !important;
                }
                
                .theme-manual-modal .ant-btn-primary {
                    background: var(--button-primary-bg) !important;
                    border: 1px solid var(--button-primary-border) !important;
                    color: var(--button-primary-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                    border-radius: 8px !important;
                }
                
                .theme-manual-modal .ant-btn-primary:hover {
                    background: var(--button-primary-bg) !important;
                    border-color: var(--modal-close-hover) !important;
                    transform: translateY(-1px) !important;
                }
                
                .theme-manual-modal .ant-tooltip .ant-tooltip-inner {
                    background: var(--surface) !important;
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                    border: 1px solid var(--border) !important;
                }
                
                .theme-manual-modal .ant-tooltip .ant-tooltip-arrow::before {
                    background: var(--surface) !important;
                    border: 1px solid var(--border) !important;
                }
                
                /* TextArea styling */
                .theme-manual-modal .ant-input-textarea .ant-input {
                    background: var(--input-bg) !important;
                    border: 1px solid var(--input-border) !important;
                    color: var(--input-color) !important;
                    border-radius: 8px !important;
                }
                
                .theme-manual-modal .ant-input-textarea .ant-input:focus {
                    background: var(--input-bg) !important;
                    border-color: var(--input-focus-border) !important;
                    box-shadow: var(--input-shadow) !important;
                }
                
                /* Scrollbar styling */
                .theme-manual-modal .overflow-auto::-webkit-scrollbar {
                    width: 6px !important;
                }
                
                .theme-manual-modal .overflow-auto::-webkit-scrollbar-track {
                    background: var(--border) !important;
                    border-radius: 3px !important;
                }
                
                .theme-manual-modal .overflow-auto::-webkit-scrollbar-thumb {
                    background: var(--accent-text) !important;
                    border-radius: 3px !important;
                    opacity: 0.5 !important;
                }
                
                .theme-manual-modal .overflow-auto::-webkit-scrollbar-thumb:hover {
                    opacity: 0.7 !important;
                }
            `}</style>
			<Modal
				open={open}
				onCancel={onCancel}
				footer={null}
				width={1200}
				centered
				className="theme-manual-modal"
				styles={{
					content: {
						background: 'var(--modal-bg)',
						border: '1px solid var(--modal-border)',
						borderRadius: '16px',
					},
					header: {
						background: 'var(--modal-header-bg)',
						borderBottom: '1px solid var(--modal-header-border)',
					},
					title: {
						color: 'var(--modal-title-color)',
						fontFamily: 'Poppins, sans-serif',
						fontWeight: 600,
					},
					close: {
						color: 'var(--modal-close-color)',
					},
				}}
			>
				<Row gutter={[24, 24]}>
					<Col span={9}>
						<Title
							level={3}
							style={{
								color: 'var(--text)',
								fontFamily: 'Poppins, sans-serif',
								fontWeight: 600,
							}}
						>
							Project Details
						</Title>
						<form onSubmit={onSubmit}>
							<Space
								direction="vertical"
								size="large"
								className="w-full"
							>
								<div>
									<Text
										strong
										style={{
											color: 'var(--text)',
											fontFamily: 'Poppins, sans-serif',
										}}
									>
										Project Name
									</Text>
									<Tooltip title="Choose a descriptive name for your project">
										<Input
											name="name"
											value={projectName}
											onChange={(e) =>
												setProjectName(e.target.value)
											}
											placeholder="E.g., Customer Churn Predictor"
											required
											prefix={<FileTextOutlined />}
											suffix={
												<Tooltip title="Minimum 10 characters">
													<InfoCircleOutlined
														style={{
															color: 'var(--secondary-text)',
														}}
													/>
												</Tooltip>
											}
										/>
									</Tooltip>
								</div>

								<div>
									<Text
										strong
										style={{
											color: 'var(--text)',
											fontFamily: 'Poppins, sans-serif',
										}}
									>
										Description
									</Text>
									<Tooltip title="Explain what your project aims to achieve">
										<TextArea
											value={description}
											onChange={(e) =>
												setDescription(e.target.value)
											}
											name="description"
											rows={4}
											placeholder="Describe your project's goals and requirements..."
											required
										/>
									</Tooltip>
								</div>

								<div>
									<Text
										strong
										style={{
											color: 'var(--text)',
											fontFamily: 'Poppins, sans-serif',
										}}
									>
										Expected Accuracy (%)
									</Text>
									<Tooltip title="Set your desired model accuracy target">
										<Input
											type="number"
											name="expected_accuracy"
											min={0}
											max={100}
											defaultValue={100}
											required
										/>
									</Tooltip>
								</div>

								<Button type="primary" htmlType="submit" block>
									Create Project
								</Button>
							</Space>
						</form>
					</Col>

					<Col span={15}>
						<Title
							level={3}
							style={{
								color: 'var(--text)',
								fontFamily: 'Poppins, sans-serif',
								fontWeight: 600,
							}}
						>
							Project Type
						</Title>

						<div className="overflow-auto max-h-[650px] p-2">
							<Row gutter={[16, 16]}>
								{projType.map((type, idx) => (
									<Col span={24} key={type}>
										<Card
											hoverable
											className={`${isSelected[idx] ? 'selected' : ''}`}
											onClick={(e) =>
												onSelectType(e, idx)
											}
											styles={{ body: { padding: 0 } }}
										>
											<Row
												gutter={16}
												align="middle"
												style={{ minHeight: 200 }}
											>
												<Col
													span={10}
													style={{ paddingRight: 0 }}
												>
													<img
														src={imgArray[idx]}
														alt={type}
														className="w-full rounded"
														style={{
															width: '100%',
															height: 200,
															objectFit: 'cover',
														}}
													/>
												</Col>
												<Col
													span={14}
													style={{ padding: 16 }}
												>
													<Title
														level={4}
														style={{
															color: 'var(--text)',
															fontFamily:
																'Poppins, sans-serif',
															fontWeight: 600,
														}}
													>
														{TASK_TYPES[type].type}
													</Title>
													<Text
														style={{
															color: 'var(--secondary-text)',
															fontFamily:
																'Poppins, sans-serif',
														}}
													>
														{typeDescription[idx]}
													</Text>
												</Col>
											</Row>
										</Card>
									</Col>
								))}
							</Row>
						</div>
					</Col>
				</Row>
			</Modal>
		</>
	)
}

export default ManualCreationModal
