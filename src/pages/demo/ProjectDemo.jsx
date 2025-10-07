import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ImageClassificationDemo from 'src/pages/demo/templates/ImageClassificationDemo'
import TextClassificationDemo from 'src/pages/demo/templates/TextClassificationDemo'

const ProjectDemo = () => {
	const { projectId } = useParams()
	const [metadata, setMetadata] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const loadMetadata = async () => {
			try {
				setLoading(true)
				setError(null)

				const metadataModule = await import(
					`src/pages/demo/metadata/${projectId}.json`
				)
				setMetadata(metadataModule.default || metadataModule)
			} catch (err) {
				console.error('Error loading metadata:', err)
				setError(`Failed to load project metadata for ID: ${projectId}`)
			} finally {
				setLoading(false)
			}
		}

		if (projectId) {
			loadMetadata()
		}
	}, [projectId])

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-400 text-lg">
						Loading demo...
					</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md">
					<div className="text-center">
						<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
							<svg
								className="h-8 w-8 text-red-600 dark:text-red-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
							Error
						</h3>
						<p className="text-gray-600 dark:text-gray-400">
							{error}
						</p>
					</div>
				</div>
			</div>
		)
	}

	if (!metadata) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
				<div className="text-center">
					<p className="text-gray-600 dark:text-gray-400 text-lg">
						No project data available
					</p>
				</div>
			</div>
		)
	}

	return (
		<>
			{metadata.taskType === 'Image Classification' ? (
				<ImageClassificationDemo
					metadata={metadata}
					projectId={projectId}
					s3Url={''}
				/>
			) : metadata.taskType === 'Text Classification' ? (
				<TextClassificationDemo
					metadata={metadata}
					projectId={projectId}
					s3Url={''}
				/>
			) : (
				<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-lg text-center">
						<div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
							<svg
								className="h-10 w-10 text-blue-600 dark:text-blue-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
							Coming Soon
						</h2>
						<p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
							This demo is currently under development.<br></br>
							Check back soon!
						</p>
						<a
							href="/"
							className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
						>
							<svg
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
							Back to Homepage
						</a>
					</div>
				</div>
			)}
		</>
	)
}

export default ProjectDemo
