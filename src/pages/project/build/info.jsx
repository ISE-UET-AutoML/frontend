import React, { useEffect, useState } from 'react'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { useOutletContext } from 'react-router-dom'
import { getAllExperiments } from 'src/api/experiment'
import { getAllDeployedModel } from 'src/api/deploy'
import { getModels } from 'src/api/model'

const ProjectInfo = () => {
    const { projectInfo } = useOutletContext()
    const [experiments, setExperiments] = useState([])
    const [models, setModels] = useState([])
    const [deployedModels, setDeployedModels] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const experimentsData = await getAllExperiments(projectInfo.id)
                const modelsData = await getModels(projectInfo.id)
                const deployedModelsData = await getAllDeployedModel(projectInfo.id)

                setExperiments(Array.isArray(experimentsData) ? experimentsData : experimentsData.data || [])
                setModels(Array.isArray(modelsData) ? modelsData : modelsData.data || [])
                setDeployedModels(Array.isArray(deployedModelsData) ? deployedModelsData : deployedModelsData.data || [])
            } catch (error) {
                console.error('Error fetching project data:', error)
            }
        }

        if (projectInfo?.id) fetchData()
    }, [projectInfo?.id])

    // Format created_at
    const formattedDate = new Date(projectInfo?.created_at).toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    // Reusable mini status card
    const StatusCard = ({ label, value, color }) => (
        <div className={`p-3 rounded-lg border ${color.border} ${color.bg} flex flex-col items-center`}>
            <span className={`font-semibold ${color.text}`}>{label}</span>
            <span className="text-white text-lg">{value}</span>
        </div>
    )

    return (
        <>
            <style>{`
        body, html {
          background-color: #01000A !important;
        }
      `}</style>
            <div className="min-h-screen bg-[#01000A]">
                <div className="relative pt-20 px-6 pb-20">
                    <BackgroundShapes
                        width="1280px"
                        height="1200px"
                        shapes={[
                            {
                                id: 'uploadBlue',
                                shape: 'circle',
                                size: '480px',
                                gradient: { type: 'radial', shape: 'ellipse', colors: ['#5C8DFF 0%', '#5C8DFF 35%', 'transparent 75%'] },
                                opacity: 0.4,
                                blur: '200px',
                                position: { top: '200px', right: '-120px' },
                                transform: 'none'
                            },
                            {
                                id: 'uploadCyan',
                                shape: 'rounded',
                                size: '380px',
                                gradient: { type: 'radial', shape: 'circle', colors: ['#40FFFF 0%', '#40FFFF 55%', 'transparent 85%'] },
                                opacity: 0.25,
                                blur: '160px',
                                position: { top: '50px', left: '-100px' },
                                transform: 'none'
                            },
                            {
                                id: 'uploadWarm',
                                shape: 'rounded',
                                size: '450px',
                                gradient: { type: 'radial', shape: 'circle', colors: ['#FFAF40 0%', '#FFAF40 50%', 'transparent 85%'] },
                                opacity: 0.2,
                                blur: '180px',
                                position: { top: '700px', left: '50%' },
                                transform: 'translate(-50%, -50%)'
                            }
                        ]}
                    />

                    <div className="relative z-10 max-w-6xl mx-auto">
                        {/* Header Section */}
                        <div className="flex justify-center mb-12">
                            <div className="w-full max-w-4xl text-center">
                                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-6">
                                    Project Info
                                </h1>
                                <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                                    Detailed information about your project
                                </p>
                            </div>
                        </div>

                        {/* Outer Card */}
                        <div className="p-8 rounded-2xl border border-gray-600/40 bg-white/5 shadow-2xl space-y-8">
                            {/* Project Metadata */}
                            <div className="space-y-2">
                                <p><span className="text-gray-400">Project Id: </span><span className="text-white">{projectInfo?.id}</span></p>
                                <p><span className="text-gray-400">Project Name: </span><span className="text-white">{projectInfo?.name}</span></p>
                                <p><span className="text-gray-400">Created At: </span><span className="text-white">{formattedDate}</span></p>
                                <p><span className="text-gray-400">Task Type: </span><span className="text-white">{projectInfo?.task_type}</span></p>
                            </div>

                            {/* Inner Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Experiments Card */}
                                <div className="p-6 rounded-xl border border-blue-400/30 bg-blue-500/10 shadow-lg">
                                    <h3 className="text-lg font-semibold text-blue-300 mb-4">Experiments</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <StatusCard
                                            label="Total"
                                            value={experiments.length}
                                            color={{ bg: 'bg-gray-500/10', border: 'border-gray-400/30', text: 'text-gray-300' }}
                                        />
                                        <StatusCard
                                            label="Done"
                                            value={experiments.filter(e => e.status === 'done').length}
                                            color={{ bg: 'bg-green-500/10', border: 'border-green-400/30', text: 'text-green-300' }}
                                        />
                                        <StatusCard
                                            label="Training"
                                            value={experiments.filter(e => e.status === 'training').length}
                                            color={{ bg: 'bg-orange-500/10', border: 'border-orange-400/30', text: 'text-orange-300' }}
                                        />
                                    </div>
                                </div>

                                {/* Models Card */}
                                <div className="p-6 rounded-xl border border-green-400/30 bg-green-500/10 shadow-lg">
                                    <h3 className="text-lg font-semibold text-green-300 mb-4">Models</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <StatusCard
                                            label="Total"
                                            value={models.length}
                                            color={{ bg: 'bg-gray-500/10', border: 'border-gray-400/30', text: 'text-gray-300' }}
                                        />
                                        <StatusCard
                                            label="Ready"
                                            value={models.filter(m => m.status === 'ready').length}
                                            color={{ bg: 'bg-green-500/10', border: 'border-green-400/30', text: 'text-green-300' }}
                                        />
                                        <StatusCard
                                            label="Failed"
                                            value={models.filter(m => m.status === 'failed').length}
                                            color={{ bg: 'bg-red-500/10', border: 'border-red-400/30', text: 'text-red-300' }}
                                        />
                                    </div>
                                </div>

                                {/* Deployed Models Card */}
                                <div className="p-6 rounded-xl border border-purple-400/30 bg-purple-500/10 shadow-lg">
                                    <h3 className="text-lg font-semibold text-purple-300 mb-4">Deployed Models</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <StatusCard
                                            label="Total"
                                            value={deployedModels.length}
                                            color={{ bg: 'bg-gray-500/10', border: 'border-gray-400/30', text: 'text-gray-300' }}
                                        />
                                        <StatusCard
                                            label="Active"
                                            value={deployedModels.filter(d => d.status === 'active').length}
                                            color={{ bg: 'bg-green-500/10', border: 'border-green-400/30', text: 'text-green-300' }}
                                        />
                                        <StatusCard
                                            label="Inactive"
                                            value={deployedModels.filter(d => d.status === 'inactive').length}
                                            color={{ bg: 'bg-red-500/10', border: 'border-red-400/30', text: 'text-red-300' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProjectInfo
