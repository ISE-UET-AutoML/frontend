import ModelCard from './card'
import { useEffect, useState } from 'react'
import { getModels } from 'src/api/model'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { useTheme } from 'src/theme/ThemeProvider'

// Simple SVG icons
const ModelIcon = ({ className, ...props }) => (
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

export default function ProjectModels() {
    const { id: projectId } = useParams()
    const { theme } = useTheme()
    const [models, setModels] = useState([])

    const getListModels = async () => {
        const { data } = await getModels(projectId)
        const sortedData = data.sort((a, b) => b.id - a.id)
        setModels(sortedData)
    }

    useEffect(() => {
        getListModels()
    }, [])

    return (
        <div className="relative min-h-screen" style={{ background: 'var(--surface)' }}>
            {theme === 'dark' && <BackgroundShapes />}
            <div className="relative z-10 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl" style={{ background: 'var(--accent-gradient)' }}>
                            <ModelIcon className="h-6 w-6" style={{ color: '#ffffff' }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                                Models
                            </h1>
                            <p className="mt-1" style={{ color: 'var(--secondary-text)' }}>
                                {models.length} Models
                            </p>
                        </div>
                    </div>
                </div>

                {/* Models List */}
                {models.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {models.map((model) => (
                            <ModelCard key={model.id} model={{ ...model, project_id: projectId }} />
                        ))}
                    </div>
                ) : (
                    <Card className="rounded-2xl shadow-2xl" style={{ background: 'var(--card-gradient)', border: '1px solid var(--border)' }}>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 rounded-full mb-4" style={{ background: 'var(--hover-bg)' }}>
                                <EmptyIcon className="h-12 w-12" style={{ color: 'var(--secondary-text)' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>No Models</h3>
                            <p className="text-center max-w-md" style={{ color: 'var(--secondary-text)' }}>
                                You haven't created any models yet. Start by training a model to create your first model.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
