import React from 'react'
import { Modal, Row, Col, Card, Typography } from 'antd'
import { RobotOutlined, UserOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import ChatbotImage from 'src/assets/images/chatbot.png'
import NormalImage from 'src/assets/images/normal.png'

const { Title, Text } = Typography

const CreationMethodModal = ({ open, onCancel, onSelectChatbot, onSelectManual }) => {
    const options = [
        {
            id: 'chatbot',
            title: 'AI Assistant',
            description: 'Let our AI guide you through project creation step by step',
            image: ChatbotImage,
            icon: <RobotOutlined />,
            action: onSelectChatbot,
        },
        {
            id: 'normal',
            title: 'Manual Creation',
            description: 'Create your project with full control over all settings',
            image: NormalImage,
            icon: <UserOutlined />,
            action: onSelectManual,
        },
    ]

    return (
        <>
            <style>{`
                .dark-creation-modal .ant-modal-content {
                    background: linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 16px !important;
                }
                
                .dark-creation-modal .ant-modal-header {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                
                .dark-creation-modal .ant-modal-title {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-creation-modal .ant-modal-close {
                    color: white !important;
                }
                
                .dark-creation-modal .ant-modal-close:hover {
                    color: #65FFA0 !important;
                }
                
                .dark-creation-modal .ant-card {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                    transition: all 0.3s ease !important;
                }
                
                .dark-creation-modal .ant-card:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #65FFA0 !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 32px rgba(101, 255, 160, 0.2) !important;
                }
                
                .dark-creation-modal .ant-card-meta-title {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .dark-creation-modal .ant-card-meta-description {
                    color: rgba(255, 255, 255, 0.7) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-creation-modal .ant-card-meta-avatar .anticon {
                    color: #65FFA0 !important;
                    font-size: 24px !important;
                }
                
                .dark-creation-modal .ant-card-cover img {
                    border-radius: 8px !important;
                    filter: brightness(0.9) !important;
                }
                
                .dark-creation-modal .ant-card-cover {
                    border-radius: 8px 8px 0 0 !important;
                    overflow: hidden !important;
                }
                
                .dark-creation-modal .ant-typography {
                    color: white !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .dark-creation-modal .ant-typography.ant-typography-secondary {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
            `}</style>
            <Modal
                open={open}
                onCancel={onCancel}
                footer={null}
                width={1000}
                centered
                className="dark-creation-modal"
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
                <div className="text-center mb-8">
                    <Title level={2} style={{ color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                        How would you like to create your project?
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Poppins, sans-serif' }}>
                        Choose the method that works best for you
                    </Text>
                </div>

                <Row gutter={32} justify="center">
                    {options.map((option) => (
                        <Col span={12} key={option.id}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card
                                    hoverable
                                    onClick={option.action}
                                    cover={
                                        <img
                                            alt={option.title}
                                            src={option.image}
                                            className="p-4"
                                        />
                                    }
                                >
                                    <Card.Meta
                                        avatar={option.icon}
                                        title={option.title}
                                        description={option.description}
                                    />
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </Modal>
        </>
    )
}

export default CreationMethodModal
