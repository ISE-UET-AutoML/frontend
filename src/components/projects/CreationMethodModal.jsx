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
                .theme-creation-modal .ant-modal-content {
                    background: var(--modal-bg) !important;
                    border: 1px solid var(--modal-border) !important;
                    border-radius: 16px !important;
                }
                
                .theme-creation-modal .ant-modal-header {
                    background: var(--modal-header-bg) !important;
                    border-bottom: 1px solid var(--modal-header-border) !important;
                }
                
                .theme-creation-modal .ant-modal-title {
                    color: var(--modal-title-color) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .theme-creation-modal .ant-modal-close {
                    color: var(--modal-close-color) !important;
                }
                
                .theme-creation-modal .ant-modal-close:hover {
                    color: var(--modal-close-hover) !important;
                }
                
                .theme-creation-modal .ant-card {
                    background: var(--card-gradient) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: 12px !important;
                    transition: all 0.3s ease !important;
                }
                
                .theme-creation-modal .ant-card:hover {
                    background: var(--hover-bg) !important;
                    border-color: var(--modal-close-hover) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 32px var(--selection-bg) !important;
                }
                
                .theme-creation-modal .ant-card-meta-title {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                    font-weight: 600 !important;
                }
                
                .theme-creation-modal .ant-card-meta-description {
                    color: var(--secondary-text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-creation-modal .ant-card-meta-avatar .anticon {
                    color: var(--accent-text) !important;
                    font-size: 24px !important;
                }
                
                .theme-creation-modal .ant-card-cover img {
                    border-radius: 8px !important;
                    filter: brightness(0.9) !important;
                }
                
                .theme-creation-modal .ant-card-cover {
                    border-radius: 8px 8px 0 0 !important;
                    overflow: hidden !important;
                }
                
                .theme-creation-modal .ant-typography {
                    color: var(--text) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                
                .theme-creation-modal .ant-typography.ant-typography-secondary {
                    color: var(--secondary-text) !important;
                }
            `}</style>
            <Modal
                open={open}
                onCancel={onCancel}
                footer={null}
                width={1000}
                centered
                className="theme-creation-modal"
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
                    }
                }}
            >
                <div className="text-center mb-8">
                    <Title level={2} style={{ color: 'var(--text)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                        How would you like to create your project?
                    </Title>
                    <Text style={{ color: 'var(--secondary-text)', fontFamily: 'Poppins, sans-serif' }}>
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
