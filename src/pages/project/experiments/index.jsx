import ExperimentCard from './card'
import { useEffect, useState } from 'react'
import { getAllExperiments } from 'src/api/experiment'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { message } from 'antd'
import useTrainingStore from 'src/stores/trainingStore'

// Simple SVG icons
const ExperimentIcon = ({ className, ...props }) => (
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
			d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
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

export default function ProjectExperiments() {
    const { id: projectId } = useParams()
    const setOnExperimentDone = useTrainingStore(s => s.setOnExperimentDone);
    const [experiments, setExperiments] = useState([])

    const getListExperiments = async () => {
        const { data } = await getAllExperiments(projectId)
        const sortedData = data.sort((a, b) => b.id - a.id)
        setExperiments(sortedData)
    }

    useEffect(() => {
        getListExperiments()
        // Add experiment Listener (Automatically update when an experiment is done)
        setOnExperimentDone((experimentId) => {
            message.success(`Finished training for experiment ${experimentId}`)
            getListExperiments();
        })
    }, [projectId])

    return (
        <div className="relative min-h-screen bg-[#01000A]">
            <BackgroundShapes />
            <div className="relative z-10 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                            <ExperimentIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Experiments
                            </h1>
                            <p className="text-gray-400 mt-1">
                                {experiments.length} Experiments
                            </p>
                        </div>
                    </div>
                </div>

                {/* Experiments List */}
                {experiments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {experiments.map((experiment) => (
                            <ExperimentCard key={experiment.id} experiment={experiment} />
                        ))}
                    </div>
                ) : (
                    <Card className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 bg-gray-800/50 rounded-full mb-4">
                                <EmptyIcon className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Experiments</h3>
                            <p className="text-gray-400 text-center max-w-md">
                                You haven't run any experiments yet. Start by training a model to create your first experiment.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
