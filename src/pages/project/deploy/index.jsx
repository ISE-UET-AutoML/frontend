import DeployedModelCard from './card'
import { RectangleStackIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { getAllDeployedModel } from 'src/api/deploy'
import { useParams } from 'react-router-dom'
import { Row, Col, Empty, Typography, Button } from 'antd' // Use Ant Design components
import { Select } from "antd";

const { Title, Text } = Typography

const ProjectDeploy = () => {
    const { id: projectId } = useParams()
    const [deployedModels, setDeployedModels] = useState([])
    const [uniqueModels, setUniqueModels] = useState([])
    const [selectedModelId, setSelectedModelId] = useState(null)
    const [filteredDeployedModels, setFilteredDeployedModels] = useState([])

    const getListDeployedModels = async () => {
        const { data } = await getAllDeployedModel(projectId)
        const sortedData = data.sort((a, b) => b.id - a.id)
        setDeployedModels(prev => sortedData)
        setFilteredDeployedModels(prev => sortedData)
        setUniqueModels(prev => Array.from(
            new Set(data.map((item) => item.model_id))
        ))
    }

    const filterListDeployedModels = async () => {
        if (!selectedModelId) {
            setFilteredDeployedModels(prev => deployedModels)
            return
        }
        const filteredList = deployedModels.filter((item) => item.model_id === selectedModelId)
        console.log("new list:", filteredList)
        setFilteredDeployedModels(prev => filteredList)
    }

    const handleSelectModelId = (option) => {
        setSelectedModelId(option)
    }

    const handleReset = () => {
        setSelectedModelId(null)
    }

    useEffect(() => {
        getListDeployedModels()
    }, [])

    useEffect(() => {
        filterListDeployedModels()
    }, [selectedModelId])

    return (
        <div className="mx-auto px-4">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <Title level={2} style={{ marginBottom: 0 }}>
                        Deployments
                    </Title>
                    {/* Meta Info */}
                    <div className="mt-2 flex items-center space-x-2">
                        <RectangleStackIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                        <Text type="secondary">
                            {deployedModels.length} Deployed Models
                        </Text>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Select Dropdowns */}
                <div className="flex flex-wrap gap-4">
                    <Select
                        key={1}
                        options={uniqueModels.map((modelId) => ({
                            value: modelId,
                            label: <span className="font-semibold">{`Model Id: ${modelId}`}</span>,
                        }))}
                        value={selectedModelId}
                        placeholder={
                            <span className="font-semibold text-gray-500">
                                Filtered by model Id
                            </span>
                        }
                        className="min-w-[200px]"
                        onChange={handleSelectModelId}
                        allowClear
                    />
                    {selectedModelId && <Button type="primary" onClick={handleReset}>Reset</Button>}
                </div>

                {/* Deployed Model List */}
                {filteredDeployedModels.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {filteredDeployedModels.map((deployedModel) => (
                            <Col key={deployedModel.id} xs={24} sm={12} md={8} lg={6}>
                                <DeployedModelCard deployedModel={deployedModel} />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty
                        image={
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    vectorEffect="non-scaling-stroke"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                />
                            </svg>
                        }
                        description={
                            <Text type="secondary" className="text-sm font-medium">
                                No deployed model
                            </Text>
                        }
                    />
                )}
            </div>
        </div>
    )
}

export default ProjectDeploy
