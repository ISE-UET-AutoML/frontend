import DeployedModelCard from './card'
import { useEffect, useState } from 'react'
import { getAllDeployedModel } from 'src/api/deploy'
import { useParams } from 'react-router-dom'
import { Button } from 'src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card'
import { CustomSelect, Option } from 'src/components/ui/custom-select'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'

// Simple SVG icons
const DeploymentIcon = ({ className, ...props }) => (
	<svg
		className={className}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			d="M12 2L2 7L12 12L22 7L12 2Z"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M2 17L12 22L22 17"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M2 12L12 17L22 12"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const EmptyIcon = ({ className, ...props }) => (
	<svg
		className={className}
		width="48"
		height="48"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

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
        <div className="relative min-h-screen bg-[#01000A]">
            <BackgroundShapes />
            <div className="relative z-10 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                            <DeploymentIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Deployments
                            </h1>
                            <p className="text-gray-400 mt-1">
                                {deployedModels.length} Deployed Models
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Filter Section */}
                    <Card className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl relative z-50">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Filter Deployments
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Filter your deployed models by model ID
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px] relative z-[60]">
                                    <CustomSelect
                                        value={selectedModelId}
                                        onChange={handleSelectModelId}
                                        placeholder="Filter by Model ID"
                                    >
                                        <Option value="">All Models</Option>
                                        {uniqueModels.map((modelId) => (
                                            <Option key={modelId} value={modelId}>
                                                Model ID: {modelId}
                                            </Option>
                                        ))}
                                    </CustomSelect>
                                </div>
                                {selectedModelId && (
                                    <Button
                                        variant="outline"
                                        onClick={handleReset}
                                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                    >
                                        Reset Filter
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Deployed Model List */}
                    {filteredDeployedModels.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredDeployedModels.map((deployedModel) => (
                                <DeployedModelCard key={deployedModel.id} deployedModel={deployedModel} />
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="p-4 bg-gray-800/50 rounded-full mb-4">
                                    <EmptyIcon className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No Deployed Models</h3>
                                <p className="text-gray-400 text-center max-w-md">
                                    You haven't deployed any models yet. Start by training a model and then deploy it to production.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProjectDeploy
