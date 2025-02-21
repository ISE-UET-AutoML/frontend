import ExperimentCard from './card'
import { RectangleStackIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import { getAllExperiments } from 'src/api/experiment'
import { useParams } from 'react-router-dom'

export default function ProjectExperiments() {
	const { id: projectId } = useParams()
	const [experiments, setExperiments] = useState([])

	const getListExperiments = async () => {
		const { data } = await getAllExperiments(projectId)
		setExperiments(data.data)

		return
	}

	useEffect(() => {
		getListExperiments()
	}, [])

	console.log('ExperimentsList', experiments)

	return (
		<>
			<div className="flex justify-between mx-auto px-3 mb-5 ">
				<div className=" max-w-2xl px-4 lg:max-w-4xl lg:px-0">
					<h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
						Experiments
					</h1>
					{/* Meta info */}
					<div className="flex mt-5 flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-6">
						<div className="flex items-center space-x-2">
							<RectangleStackIcon
								className="h-5 w-5 text-gray-400"
								aria-hidden="true"
							/>
							<span className="text-sm font-medium text-gray-500">
								{experiments.length} Experiments
							</span>
						</div>
					</div>
				</div>
			</div>

			{experiments.length > 0 ? (
				<ul className="px-3  mx-auto pt-5 overflow-hidden sm:grid sm:grid-cols-2 gap-3 py-4">
					{experiments.map((experiment) => (
						<ExperimentCard
							key={experiment._id}
							experiment={experiment}
						/>
					))}
				</ul>
			) : (
				<div className="text-center">
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
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						No Experiments
					</h3>
				</div>
			)}
		</>
	)
}
