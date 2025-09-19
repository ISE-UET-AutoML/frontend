import ExperimentCard from './card'
import { useEffect, useState } from 'react'
import { getAllExperiments } from 'src/api/experiment'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { useTheme } from 'src/theme/ThemeProvider'
import { message } from 'antd'

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
    const { theme } = useTheme()
    const [experiments, setExperiments] = useState([])

    const getListExperiments = async () => {
        const { data } = await getAllExperiments(projectId)
        const sortedData = data.sort((a, b) => b.id - a.id)
        setExperiments(sortedData)
    }

    useEffect(() => {
        getListExperiments()
    }, [projectId])

    return (
        <div className="relative min-h-screen" style={{ background: 'var(--surface)' }}>
            {theme === 'dark' && <BackgroundShapes />}
            <div className="relative z-10 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl" style={{ background: 'var(--accent-gradient)' }}>
                            <ExperimentIcon className="h-6 w-6" style={{ color: '#ffffff' }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                                Experiments
                            </h1>
                            <p className="mt-1" style={{ color: 'var(--secondary-text)' }}>
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
                    <Card className="rounded-2xl shadow-2xl" style={{ background: 'var(--card-gradient)', border: '1px solid var(--border)' }}>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 rounded-full mb-4" style={{ background: 'var(--hover-bg)' }}>
                                <EmptyIcon className="h-12 w-12" style={{ color: 'var(--secondary-text)' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>No Experiments</h3>
                            <p className="text-center max-w-md" style={{ color: 'var(--secondary-text)' }}>
                                You haven't run any experiments yet. Start by training a model to create your first experiment.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
