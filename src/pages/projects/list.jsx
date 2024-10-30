import { useReducer, useEffect, useState } from 'react'
import { RectangleStackIcon } from '@heroicons/react/20/solid'
import { PlusIcon } from '@heroicons/react/24/solid'
import instance from 'src/api/axios'
import { message } from 'antd'
import { API_URL } from 'src/constants/api'
import { PATHS } from 'src/constants/paths'
import { TYPES } from 'src/constants/types'
import ProjectCard from './card'
import class_img from 'src/assets/images/classification_img.jpg'
import object_detection from 'src/assets/images/object-detection.png'
import segmentaion_img from 'src/assets/images/segmentation_img.jpg'
import tabular_img from 'src/assets/images/tabular_img.jpg'
import text_classification from 'src/assets/images/text_classification.jpg'
import multimodal_classification from 'src/assets/images/multimodal_classification.png'

const projType = Object.keys(TYPES)

const imgArray = [
	class_img,
	text_classification,
	tabular_img,
	multimodal_classification,
	object_detection,
	segmentaion_img,
]

const typeDescription = [
	'Identify and categorize objects in images.',
	'Categorize text data based on content.',
	'Classify tabular data rows.',
	'Combine data sources for accurate classification.',
	'Identify objects with bounding boxes.',
	'Segment images to locate objects or regions.',
]

const initialState = {
	showUploader: false,
	projects: [],
}

export default function ProjectList() {
	const [projectState, updateProjState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		initialState
	)
	const [isSelected, setIsSelected] = useState(projType.map((el) => false))

	const selectType = (e, idx) => {
		const tmpArr = isSelected.map((el, index) => {
			if (index === idx) el = true
			else el = false
			return el
		})
		setIsSelected(tmpArr)
	}

	const handleCreateProject = async (event) => {
		event.preventDefault()

		const formData = new FormData(event.target)
		const data = Object.fromEntries(formData)
		isSelected.forEach((el, idx) => {
			if (el) data.type = projType[idx]
		})

		try {
			const response = await instance.post(API_URL.all_projects, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})

			console.log('create Project responese', { response })

			if (response.status === 200) {
				window.location = PATHS.PROJECT_BUILD(response.data._id)
			}
		} catch (error) {
			message.error('Project already existed')
		}
	}

	const getProjects = async () => {
		const response = await instance.get(API_URL.all_projects)
		updateProjState({ projects: response.data })
		console.log('Project List', response.data)
		return response.data
	}

	useEffect(() => {
		projectState.projects.length >= 0 && getProjects()
	}, [])

	return (
		<>
			<div className="mx-auto w-full flex-grow lg:flex xl:px-2 -z-10 mt-2">
				{/* Left sidebar & main wrapper */}
				<div className="min-w-0 flex-1 bg-white xl:flex p-5 rounded-md">
					{/* Projects List */}
					<div className="bg-white lg:min-w-0 lg:flex-1">
						<div className="flex justify-between mx-auto px-3 mb-5 ">
							<div className="px-4 lg:px-0">
								<h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
									Projects
								</h1>
								{/* Meta info */}
								<div className="flex mt-5 flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-6">
									<div className="flex items-center space-x-2">
										<RectangleStackIcon
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
										<span className="text-sm font-medium text-gray-500">
											{projectState.projects.length}{' '}
											Projects
										</span>
									</div>
								</div>
							</div>
							{/* Action buttons */}
							<div className="flex flex-col sm:flex-row xl:flex-col">
								<button
									type="button"
									className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer h-fit"
									onClick={() =>
										updateProjState({ showUploader: true })
									}
								>
									<PlusIcon
										className="-ml-1 mr-2 h-5 w-5"
										aria-hidden="true"
									/>
									New Project
								</button>
							</div>
						</div>

						{projectState.projects.length > 0 ? (
							<div className="px-3  mx-auto pt-5 overflow-hidden grid sm:grid-cols-2 xl:grid-cols-3 gap-5 py-4">
								{projectState.projects.map((project) => (
									<ProjectCard
										key={project._id}
										project={project}
										getProjects={getProjects}
									/>
								))}
							</div>
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
									No projects
								</h3>
								<p className="mt-1 text-sm text-gray-500">
									Get started by creating a new project.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* modal */}
			<div
				className={`${
					projectState.showUploader
						? 'top-0 !z-[1000] opacity-100'
						: 'top-full bottom-0 opacity-0'
				} fixed flex flex-col items-center h-full w-full px-[30px] justify-center bg-white  transition-all duration-500 ease overscroll-auto overflow-auto min-h-screen`}
			>
				<button
					onClick={() => updateProjState({ showUploader: false })}
					className="absolute top-5 right-5 p-[12px] rounded-full bg-transparent hover:bg-gray-300 hover:text-white font-[600] w-[48px] h-[48px]"
				>
					<svg
						className=""
						focusable="false"
						viewBox="0 0 24 24"
						color="#69717A"
						aria-hidden="true"
						data-testid="close-upload-media-dialog-btn"
					>
						<path d="M18.3 5.71a.9959.9959 0 00-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
					</svg>
				</button>

				<div className="mt-10 sm:mt-0 w-full max-w-6xl">
					{/* need attention */}
					<form action="#" onSubmit={handleCreateProject}>
						<div className="overflow-hidden shadow sm:rounded-md">
							<div className="flex sm:rounded-md px-4 py-5 sm:p-6 w-full max-w-6xl border border-gray-200">
								<div className="flex flex-1 flex-col gap-6">
									<div className="">
										<label
											htmlFor="name"
											className="ml-1 block font-medium text-xl text-gray-700"
										>
											Name
										</label>
										<input
											type="text"
											name="name"
											id="name"
											required
											minLength={10}
											className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
											placeholder="Project Name"
										/>
									</div>

									<div className="">
										<label
											htmlFor="description"
											className="ml-1 block font-medium text-xl text-gray-700"
										>
											Description
										</label>
										<div className="mt-1">
											<textarea
												id="description"
												name="description"
												rows={5}
												required
												minLength={5}
												className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
												placeholder="Description of the Project"
											/>
										</div>
									</div>

									<div className="">
										<label
											htmlFor="expectation_accuracy"
											className="ml-1 block font-medium text-xl text-gray-700"
										>
											Expectation Accuracy
										</label>
										<input
											type="number"
											name="expectation_accuracy"
											id="expectation_accuracy"
											defaultValue={100}
											required
											min={0}
											max={100}
											placeholder="0-100"
											className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
										/>
									</div>
								</div>
								<div className="flex-1 text-center">
									<h2 className="font-bold text-xl">
										Project Type
									</h2>
									<div
										className="inline-grid grid-cols-2 ml-10 overflow-scroll overflow-x-hidden gap-6 rounded-lg border-2 px-3 py-4"
										style={{ height: 600 }}
									>
										{projType.map((type, idx) => (
											<div
												onClick={(e) =>
													selectType(e, idx)
												}
												className={`${isSelected[idx] ? 'border-purple-500 shadow-purple-500 shadow-md' : 'border-gray-300 hover:border-gray-400 hover:shadow-xl '} w-full h-full rounded-lg text-center border-2 cursor-pointer`}
											>
												<img
													className="aspect-[5/3] rounded border border-gray-300"
													alt={imgArray[idx]}
													src={imgArray[idx]}
												/>
												<div className="m-2">
													<h3 className="font-semibold text-xl mb-2 leading-6">
														{TYPES[type].type}
													</h3>
													<p className="text-sm">
														{typeDescription[idx]}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							<div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
								<button
									type="submit"
									className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-5 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								>
									Save
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</>
	)
}
