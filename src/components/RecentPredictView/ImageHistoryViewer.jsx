import React, { useState } from 'react';
import { Button, Card, Tag, Progress, Empty, Row, Col, Typography } from 'antd';
import { LeftOutlined, RightOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ImageHistoryViewer = ({ data }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!data || data.length === 0) {
        return <Empty description="Không có dữ liệu dự đoán." />;
    }

    const currentPrediction = data[currentIndex] || {};
    const confidence = currentPrediction.confidence || 0;
    const confidencePercent = (confidence * 100).toFixed(2);

    const getConfidenceStatus = (conf) => {
        if (conf >= 0.9) return { color: '#52c41a', status: 'Excellent', icon: <CheckCircleOutlined />, gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' };
        if (conf >= 0.75) return { color: '#1890ff', status: 'Good', icon: <CheckCircleOutlined />, gradient: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)' };
        if (conf >= 0.6) return { color: '#faad14', status: 'Medium', icon: <WarningOutlined />, gradient: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)' };
        return { color: '#ff4d4f', status: 'Low', icon: <CloseCircleOutlined />, gradient: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' };
    };

    const confidenceStatus = getConfidenceStatus(confidence);

    return (
        <div style={{ 
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            // Bỏ height cố định để component tự co giãn theo nội dung
        }}>
            {/* Navigation */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '12px',
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%)',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                flexShrink: 0
            }}>
                <Button 
                    icon={<LeftOutlined />} 
                    onClick={() => setCurrentIndex(p => p - 1)} 
                    disabled={currentIndex === 0}
                    type="primary"
                    size="small"
                    style={{ borderRadius: '6px', fontSize: '13px' }}
                >
                    Prev
                </Button>
                <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
                    <span style={{ color: '#1890ff' }}>{currentIndex + 1}</span> / {data.length}
                </Title>
                <Button 
                    type="primary"
                    size="small"
                    onClick={() => setCurrentIndex(p => p + 1)} 
                    disabled={currentIndex === data.length - 1}
                    style={{ borderRadius: '6px', fontSize: '13px' }}
                >
                    Next <RightOutlined />
                </Button>
            </div>

            {/* Main Content - Bỏ cuộn */}
            <div style={{ marginBottom: '12px' }}>
                <Row gutter={[12, 12]}>
                    {/* Image Display */}
                    <Col xs={24} md={14}>
                        <Card 
                            title={<span style={{ fontSize: '13px', fontWeight: '500' }}>Original Image</span>}
                            bordered={false}
                            bodyStyle={{ padding: '10px' }}
                            headStyle={{ minHeight: '38px', padding: '0 12px' }}
                            style={{ 
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                height: '100%'
                            }}
                        >
                            <div style={{ 
                                position: 'relative',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                background: '#f5f5f5',
                                // Thêm chiều cao cố định cho khung chứa ảnh
                                height: '280px', 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img
                                    src={currentPrediction.imageUrl}
                                    alt={`Prediction ${currentPrediction.key}`}
                                    style={{ 
                                        width: '100%', 
                                        display: 'block',
                                        // CỐ ĐỊNH CHIỀU CAO ẢNH
                                        height: '280px', 
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>

                    {/* Prediction Results */}
                    <Col xs={24} md={10}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                            {/* Predicted Class Card */}
                            <Card 
                                bordered={false}
                                bodyStyle={{ padding: '12px' }}
                                style={{ 
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                    Predicted Class
                                </Text>
                                <Title level={3} style={{ margin: '0' }}>
                                    <Tag 
                                        color="blue" 
                                        style={{ 
                                            fontSize: '18px', 
                                            padding: '6px 16px',
                                            borderRadius: '6px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {currentPrediction.class?.toUpperCase()}
                                    </Tag>
                                </Title>
                            </Card>

                            {/* Confidence Score Card */}
                            <Card 
                                bordered={false}
                                bodyStyle={{ padding: '12px' }}
                                style={{ 
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    background: 'white',
                                    flex: 1 // Giúp card này giãn ra để lấp đầy không gian
                                }}
                            >
                                <div>
                                    <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                                        Confidence Score
                                    </Text>
                                    
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '12px'
                                    }}>
                                        <Title level={2} style={{ 
                                            margin: 0, 
                                            color: confidenceStatus.color,
                                            fontSize: '36px',
                                            fontWeight: 'bold'
                                        }}>
                                            {confidencePercent}%
                                        </Title>
                                        <Tag 
                                            icon={confidenceStatus.icon}
                                            color={confidenceStatus.color}
                                            style={{ 
                                                fontSize: '14px',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {confidenceStatus.status}
                                        </Tag>
                                    </div>

                                    <Progress 
                                        percent={parseFloat(confidencePercent)} 
                                        strokeColor={{
                                            '0%': confidenceStatus.color,
                                            '100%': confidenceStatus.color,
                                        }}
                                        trailColor="#f0f0f0"
                                        strokeWidth={10}
                                        showInfo={false}
                                        style={{ marginBottom: '10px' }}
                                    />

                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        fontSize: '11px',
                                        color: '#8c8c8c',
                                        marginBottom: '10px'
                                    }}>
                                        <span>Low</span>
                                        <span>Medium</span>
                                        <span>High</span>
                                    </div>

                                    <div style={{ 
                                        padding: '8px',
                                        background: `${confidenceStatus.color}15`,
                                        borderRadius: '6px',
                                        borderLeft: `3px solid ${confidenceStatus.color}`
                                    }}>
                                        <Text style={{ fontSize: '12px', color: '#595959' }}>
                                            {confidence >= 0.9 && "Highly confident prediction"}
                                            {confidence >= 0.75 && confidence < 0.9 && "Good confidence level"}
                                            {confidence >= 0.6 && confidence < 0.75 && "Moderate confidence"}
                                            {confidence < 0.6 && "Low confidence - review recommended"}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Thumbnail Gallery - Cho phép xuống dòng */}
            <div style={{ flexShrink: 0 }}>
                <Card 
                    title={
                        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
                            Gallery ({data.length})
                        </span>
                    }
                    bordered={false}
                    bodyStyle={{ padding: '5px' }}
                    headStyle={{ minHeight: '28px', padding: '0 8px' }}
                    style={{ 
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    <div 
                        style={{ 
                            display: 'flex', 
                            gap: '5px', 
                            // CHO PHÉP XUỐNG DÒNG
                            flexWrap: 'wrap', 
                            padding: '2px 0',
                        }}
                    >
                        {data.map((pred, index) => {
                            const thumbConfidence = pred.confidence || 0;
                            const thumbStatus = getConfidenceStatus(thumbConfidence);
                            const isActive = currentIndex === index;
                            
                            return (
                                <div 
                                    key={index} 
                                    onClick={() => setCurrentIndex(index)} 
                                    style={{ 
                                        cursor: 'pointer',
                                        position: 'relative',
                                        flexShrink: 0,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{
                                        width: '55px',
                                        height: '55px',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        border: isActive ? `2px solid ${thumbStatus.color}` : '2px solid transparent',
                                        boxShadow: isActive ? `0 2px 6px ${thumbStatus.color}40` : '0 1px 3px rgba(0,0,0,0.1)',
                                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <img
                                            src={pred.imageUrl}
                                            alt={`Thumbnail ${pred.key}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-3px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: thumbStatus.gradient,
                                        color: 'white',
                                        padding: '0px 3px',
                                        borderRadius: '5px',
                                        fontSize: '7px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                        whiteSpace: 'nowrap',
                                        lineHeight: '1.3'
                                    }}>
                                        {(thumbConfidence * 100).toFixed(0)}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ImageHistoryViewer;