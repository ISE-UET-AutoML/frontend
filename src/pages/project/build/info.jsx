import React, { useEffect, useState } from 'react'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { useOutletContext } from 'react-router-dom'
import { useTheme } from 'src/theme/ThemeProvider'
import { getAllExperiments } from 'src/api/experiment'
import { getAllDeployedModel } from 'src/api/deploy'
import { getModels } from 'src/api/model'

// Ant Design icons
import {
    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
    CloudServerOutlined,
    SettingOutlined,
    ExperimentOutlined,
    DatabaseOutlined,
    CloudOutlined
} from '@ant-design/icons'

const ProjectInfo = () => {
    const { theme } = useTheme()
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
                console.log(projectInfo)
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

    // Mini status card component
    const StatusCard = ({ label, value, color, Icon }) => (
        <div className="flex items-center p-4 rounded-xl shadow" style={{ 
            border: '1px solid var(--border)', 
            background: 'var(--hover-bg)' 
        }}>
            <Icon className="mr-3 text-2xl" style={{ color: 'var(--accent-text)' }} />
            <div>
                <p className="font-semibold" style={{ color: 'var(--accent-text)' }}>{label}</p>
                <p style={{ color: 'var(--text)' }}>{value}</p>
            </div>
        </div>
    )

    return (
        <>
            <style>{`
        body, html {
          background-color: var(--surface) !important;
        }
      `}</style>
            <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
                <div className="relative pt-20 px-6 pb-20">
                    {theme === 'dark' && (
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
                    )}

                    <div className="relative z-10 max-w-full mx-auto space-y-10">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ 
                                color: 'var(--title-project)'
                            }}>
                                Project Info
                            </h1>
                            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--secondary-text)' }}>
                                Detailed information about your project
                            </p>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                            <div className="lg:col-span-2">
                                {/* Metadata */}
                                <div className="p-6 rounded-2xl shadow space-y-2" style={{ 
                                    border: '1px solid var(--border)', 
                                    background: 'var(--card-gradient)' 
                                }}>
                                    <p><span style={{ color: 'var(--secondary-text)' }}>Project Id: </span><span style={{ color: 'var(--text)' }}>{projectInfo?.id}</span></p>
                                    <p><span style={{ color: 'var(--secondary-text)' }}>Project Name: </span><span style={{ color: 'var(--text)' }}>{projectInfo?.name}</span></p>
                                    <p><span style={{ color: 'var(--secondary-text)' }}>Description: </span><span style={{ color: 'var(--text)' }}>{projectInfo?.description}</span></p>
                                    <p><span style={{ color: 'var(--secondary-text)' }}>Created At: </span><span style={{ color: 'var(--text)' }}>{formattedDate}</span></p>
                                    <p><span style={{ color: 'var(--secondary-text)' }}>Task Type: </span><span style={{ color: 'var(--text)' }}>{projectInfo?.task_type}</span></p>
                                    <p><span style={{ color: 'var(--secondary-text)' }}>Expected Accuracy: </span><span style={{ color: 'var(--text)' }}>{projectInfo?.expected_accuracy}</span></p>
                                    <p><span style={{ color: 'var(--secondary-text)' }}>Visibility: </span><span style={{ color: 'var(--text)' }}>{projectInfo?.visibility}</span></p>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Experiments Card */}
                                <div className="p-6 rounded-2xl shadow-lg space-y-4" style={{ 
                                    border: '1px solid var(--border)', 
                                    background: 'var(--card-gradient)' 
                                }}>
                                    <h3 className="text-xl font-semibold flex items-center" style={{ color: 'var(--text)' }}>
                                        <ExperimentOutlined className="mr-2 text-2xl" style={{ color: 'var(--accent-text)' }} />
                                        Experiments
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <StatusCard label="Done" value={experiments.filter(e => e.status === 'DONE').length} color={{ bg: 'bg-green-500/10', border: 'border-green-400/30', text: 'text-green-300' }} Icon={CheckCircleOutlined} />
                                        <StatusCard label="Training" value={experiments.filter(e => e.status === 'TRAINING' || e.status == 'SETTING_UP').length} color={{ bg: 'bg-blue-500/10', border: 'border-blue-400/30', text: 'text-blue-300' }} Icon={SyncOutlined} />
                                        <StatusCard label="Failed" value={experiments.filter(e => e.status === 'FAILED').length} color={{ bg: 'bg-red-500/10', border: 'border-red-400/30', text: 'text-red-300' }} Icon={CloseCircleOutlined} />
                                    </div>
                                </div>

                                {/* Models Card */}
                                <div className="p-6 rounded-2xl shadow-lg space-y-4" style={{ 
                                    border: '1px solid var(--border)', 
                                    background: 'var(--card-gradient)' 
                                }}>
                                    <h3 className="text-xl font-semibold flex items-center" style={{ color: 'var(--text)' }}>
                                        <DatabaseOutlined className="mr-2 text-2xl" style={{ color: 'var(--accent-text)' }} />
                                        Models
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <StatusCard label="Ready" value={models.length} color={{ bg: 'bg-green-500/10', border: 'border-green-400/30', text: 'text-green-300' }} Icon={CheckCircleOutlined} />
                                    </div>
                                </div>

                                {/* Deployed Models Card */}
                                <div className="p-6 rounded-2xl shadow-lg space-y-4" style={{ 
                                    border: '1px solid var(--border)', 
                                    background: 'var(--card-gradient)' 
                                }}>
                                    <h3 className="text-xl font-semibold flex items-center" style={{ color: 'var(--text)' }}>
                                        <CloudOutlined className="mr-2 text-2xl" style={{ color: 'var(--accent-text)' }} />
                                        Deployed Models
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <StatusCard label="ONLINE" value={deployedModels.filter(d => d.status === 'ONLINE').length} color={{ bg: 'bg-green-500/10', border: 'border-green-400/30', text: 'text-green-300' }} Icon={CloudServerOutlined} />
                                        <StatusCard label="SETTING_UP" value={deployedModels.filter(d => d.status === 'SETTING_UP').length} color={{ bg: 'bg-blue-500/10', border: 'border-blue-400/30', text: 'text-blue-300' }} Icon={SettingOutlined} />
                                        <StatusCard label="OFFLINE" value={deployedModels.filter(d => d.status === 'OFFLINE').length} color={{ bg: 'bg-red-500/10', border: 'border-red-400/30', text: 'text-red-300' }} Icon={CloseCircleOutlined} />
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
