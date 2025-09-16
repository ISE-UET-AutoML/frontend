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
    Tooltip
} from 'antd'
import { InfoCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import { TASK_TYPES } from 'src/constants/types'

// Import images
import class_img from 'src/assets/images/classification_img.jpg'
import object_detection from 'src/assets/images/object-detection.png'
import segmentaion_img from 'src/assets/images/segmentation_img.jpg'
import tabular_img from 'src/assets/images/tabular_img.jpg'
import tabular_regression_img from 'src/assets/images/tabular_regression.png'
import text_classification from 'src/assets/images/text_classification.jpg'
import multimodal_classification from 'src/assets/images/multimodal_classification.png'
import multilabel_classification from 'src/assets/images/multilabel_classification.png'
import time_series from 'src/assets/images/timeseries.png'

const { Title, Text } = Typography
const { TextArea } = Input

const projType = Object.keys(TASK_TYPES)

const imgArray = [
    class_img,
    text_classification,
    tabular_img,
    tabular_regression_img,
    multimodal_classification,
    multilabel_classification,
    object_detection,
    segmentaion_img,
    time_series
]

const typeDescription = [
    'Identify and categorize objects in images.',
    'Categorize text data based on content.',
    'Classify tabular data rows.',
    'Predict continuous values for structured data in tables',
    'Combine data sources for accurate classification.',
    'Assign multiple labels to each data item.',
    'Identify objects with bounding boxes.',
    'Segment images to locate objects or regions.',
    'Predicting future values of a variable based on its historical behavior over time.'
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
    onSelectType
}) => {
    return (
        <>
            <style>{`
                .dark-manual-modal .ant-modal-content {
                    background: linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 16px !important;
                }
                
                .dark-manual-modal .ant-modal-header {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                
                .dark-manual-modal .ant-modal-title {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-manual-modal .ant-modal-close {
                    color: white !important;
                }
                
                .dark-manual-modal .ant-modal-close:hover {
                    color: #65FFA0 !important;
                }
                
                .dark-manual-modal .ant-typography {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-manual-modal .ant-typography.ant-typography-secondary {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                
                .dark-manual-modal .ant-input {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    border-radius: 8px !important;
                }
                
                .dark-manual-modal .ant-input:focus,
                .dark-manual-modal .ant-input-focused {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                    color: white !important;
                }
                
                .dark-manual-modal .ant-input:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                
                .dark-manual-modal .ant-input::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                
                .dark-manual-modal .ant-input:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                
                .dark-manual-modal .ant-input:focus {
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                }
                
                .dark-manual-modal .ant-input-prefix .anticon {
                    color: #65FFA0 !important;
                }
                
                .dark-manual-modal .ant-input-suffix .anticon {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                
                /* More aggressive targeting for Input component */
                .dark-manual-modal .ant-input-affix-wrapper {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border-radius: 8px !important;
                }
                
                .dark-manual-modal .ant-input-affix-wrapper:focus,
                .dark-manual-modal .ant-input-affix-wrapper-focused {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                }
                
                .dark-manual-modal .ant-input-affix-wrapper:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                
                .dark-manual-modal .ant-input-affix-wrapper .ant-input {
                    background: transparent !important;
                    color: white !important;
                }
                
                .dark-manual-modal .ant-input-affix-wrapper .ant-input:focus {
                    background: transparent !important;
                    color: white !important;
                }
                
                /* Force override for all input elements */
                .dark-manual-modal input {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border-radius: 8px !important;
                }
                
                .dark-manual-modal input:focus {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                    color: white !important;
                }
                
                .dark-manual-modal input:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                
                .dark-manual-modal .ant-card {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                    transition: all 0.3s ease !important;
                }
                
                .dark-manual-modal .ant-card:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    transform: translateY(-2px) !important;
                }
                
                .dark-manual-modal .ant-card.selected {
                    background: rgba(101, 255, 160, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 4px 16px rgba(101, 255, 160, 0.2) !important;
                }
                
                .dark-manual-modal .ant-card img {
                    border-radius: 8px !important;
                    filter: brightness(0.9) !important;
                }
                
                .dark-manual-modal .ant-btn-primary {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 500 !important;
                    border-radius: 8px !important;
                }
                
                .dark-manual-modal .ant-btn-primary:hover {
                    background: linear-gradient(135deg, #2a2a3e 0%, #26314e 50%, #1f4460 100%) !important;
                    border-color: #65FFA0 !important;
                    transform: translateY(-1px) !important;
                }
                
                .dark-manual-modal .ant-tooltip .ant-tooltip-inner {
                    background: rgba(0, 0, 0, 0.8) !important;
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-manual-modal .ant-tooltip .ant-tooltip-arrow::before {
                    background: rgba(0, 0, 0, 0.8) !important;
                }
                
                /* TextArea styling */
                .dark-manual-modal .ant-input-textarea .ant-input {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border-radius: 8px !important;
                }
                
                .dark-manual-modal .ant-input-textarea .ant-input:focus {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    box-shadow: 0 0 0 2px rgba(101, 255, 160, 0.2) !important;
                }
                
                /* Scrollbar styling */
                .dark-manual-modal .overflow-auto::-webkit-scrollbar {
                    width: 6px !important;
                }
                
                .dark-manual-modal .overflow-auto::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-radius: 3px !important;
                }
                
                .dark-manual-modal .overflow-auto::-webkit-scrollbar-thumb {
                    background: rgba(101, 255, 160, 0.5) !important;
                    border-radius: 3px !important;
                }
                
                .dark-manual-modal .overflow-auto::-webkit-scrollbar-thumb:hover {
                    background: rgba(101, 255, 160, 0.7) !important;
                }
            `}</style>
            <Modal
                open={open}
                onCancel={onCancel}
                footer={null}
                width={1000}
                centered
                className="dark-manual-modal"
                styles={{
                    content: {
                        background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '16px',
                    },
                    header: {
                        background: 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    title: {
                        color: 'white',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                    },
                    close: {
                        color: 'white',
                    }
                }}
            >
                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <Title level={3} style={{ color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                            Project Details
                        </Title>
                        <form onSubmit={onSubmit}>
                            <Space
                                direction="vertical"
                                size="large"
                                className="w-full"
                            >
                                <div>
                                    <Text strong style={{ color: 'white', fontFamily: 'Poppins, sans-serif' }}>
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
                                                            color: 'rgba(255, 255, 255, 0.5)',
                                                        }}
                                                    />
                                                </Tooltip>
                                            }
                                        />
                                    </Tooltip>
                                </div>

                                <div>
                                    <Text strong style={{ color: 'white', fontFamily: 'Poppins, sans-serif' }}>
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
                                    <Text strong style={{ color: 'white', fontFamily: 'Poppins, sans-serif' }}>
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

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                >
                                    Create Project
                                </Button>
                            </Space>
                        </form>
                    </Col>

                    <Col span={12}>
                        <Title level={3} style={{ color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                            Project Type
                        </Title>

                        <div className="overflow-auto max-h-[550px] p-2">
                            <Row gutter={[16, 16]}>
                                {projType.map((type, idx) => (
                                    <Col span={24} key={type}>
                                        <Card
                                            hoverable
                                            className={`${isSelected[idx] ? 'selected' : ''}`}
                                            onClick={(e) => onSelectType(e, idx)}
                                        >
                                            <Row gutter={16} align="middle">
                                                <Col span={8}>
                                                    <img
                                                        src={imgArray[idx]}
                                                        alt={type}
                                                        className="w-full rounded"
                                                    />
                                                </Col>
                                                <Col span={16}>
                                                    <Title level={4} style={{ color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                                                        {TASK_TYPES[type].type}
                                                    </Title>
                                                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Poppins, sans-serif' }}>
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
