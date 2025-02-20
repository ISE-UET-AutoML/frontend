import { CubeTransparentIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
dayjs.extend(relativeTime)

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export default function ModelCard({ experiment }) {
	return (
		<>
			<div
				key={experiment._id}
				className={classNames(
					'relative group p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg bg-white shadow '
				)}
			>
				<div>
					<span
						className={classNames(
							'text-blue-700',
							'bg-blue-50',
							'rounded-lg inline-flex p-3 ring-4 ring-white'
						)}
					>
						<CubeTransparentIcon
							className="h-6 w-6"
							aria-hidden="true"
						/>
					</span>
				</div>
				<div className="mt-8">
					<div className="flex w-full justify-between items-center">
						<h3 className="text-lg font-medium">
							<a
								// href={PATHS.PREDICT(
								// 	experiment.project_id,
								// 	experiment.experimentID
								// )}
								href={
									experiment.status === 'DONE'
										? PATHS.PREDICT(
												experiment.project_id,
												experiment.experimentID
											)
										: PATHS.PREDICT(
												// Tmp route
												experiment.project_id,
												experiment.experimentID
											)
								}
								className="focus:outline-none"
							>
								{/* Extend touch target to entire panel */}
								<span
									className="absolute inset-0"
									aria-hidden="true"
								/>
								{experiment?.name}
							</a>
						</h3>
						{experiment.createdAt && (
							<span>{dayjs(experiment.createdAt).fromNow()}</span>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
