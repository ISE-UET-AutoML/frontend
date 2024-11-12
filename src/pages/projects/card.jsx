import { CubeTransparentIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { PATHS } from 'src/constants/paths'
import { deleteProject } from 'src/api/project'
dayjs.extend(relativeTime)

function clsx(...classes) {
	return classes.filter(Boolean).join(' ')
}

export default function ProjectCard({ project, getProjects }) {
	const handleDelete = (projectID) => {
		if (window.confirm('Are you sure you want to delete this project?')) {
			deleteProject(projectID)
				.then(() => {
					alert('Project deleted successfully!')
					getProjects()
				})
				.catch((error) => {
					alert('Failed to delete project. Please try again.')
					console.error(error)
				})
		}
	}
	return (
		<>
			<div
				key={project._id}
				className={clsx(
					'group relative rounded-xl bg-gray-50 shadow-md transition duration-300'
				)}
			>
				<div className="p-6 flex">
					<span
						className={clsx(
							'text-blue-700',
							'bg-blue-50',
							'rounded-full inline-flex p-3 ring-4 ring-white',
							'transition duration-450',
							'group-hover:rotate-45'
						)}
					>
						<CubeTransparentIcon
							className="h-20 w-20"
							aria-hidden="true"
						/>
					</span>

					{/* Wrap button and SVGs in a hover-group div */}
					<div className="group-hover:block flex flex-col items-center ml-auto">
						<button
							onClick={() => handleDelete(project._id)}
							className="w-12 h-12 rounded-xl bg-[#f0f6fe] border-white border-2 font-semibold flex flex-col items-center justify-center cursor-pointer duration-300 overflow-hidden relative gap-[2px] hover:bg-[#B3E5FC] hover:gap-0 hover:duration-300 hover:items-center hover:shadow-[0px_0px_20px_rgba(0,0,0,0.164)] active:scale-95"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 69 14"
								className="w-3 duration-300 origin-bottom-right group-hover:rotate-[160deg] group-hover:duration-500"
							>
								<g clipPath="url(#clip0_35_24)">
									<path
										fill="#2a4dd0"
										d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
									></path>
								</g>
								<defs>
									<clipPath id="clip0_35_24">
										<rect
											fill="white"
											height="14"
											width="69"
										></rect>
									</clipPath>
								</defs>
							</svg>

							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 69 57"
								className="w-3 duration-300 bin-bottom"
							>
								<g clipPath="url(#clip0_35_22)">
									<path
										fill="#2a4dd0"
										d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
									></path>
								</g>
								<defs>
									<clipPath id="clip0_35_22">
										<rect
											fill="white"
											height="57"
											width="69"
										></rect>
									</clipPath>
								</defs>
							</svg>
						</button>
					</div>
				</div>

				<div className="mt-5 bg-gray-100 group-hover:bg-blue-100 p-6 rounded-xl transition duration-300 relative">
					<div className="flex w-full justify-between items-center">
						<h3 className="text-xl font-medium">
							<a
								href={PATHS.PROJECT_BUILD(project?._id)}
								className="focus:outline-none"
							>
								<span
									className="absolute inset-0"
									aria-hidden="true"
								/>
								{project?.name}
							</a>
						</h3>
						{project.createdAt && (
							<span>{dayjs(project.createdAt).fromNow()}</span>
						)}
					</div>
					<div className="flex w-full justify-between items-center">
						<p className="text-sm text-gray-500">
							{project?.description}
						</p>
						<p className="text-sm text-gray-500">{project?.type}</p>
					</div>
				</div>
			</div>
		</>
	)
}
