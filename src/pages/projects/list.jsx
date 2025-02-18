import { useReducer, useEffect, useState, useRef } from 'react'
import { RectangleStackIcon } from '@heroicons/react/20/solid'
import { PlusIcon, PaperClipIcon } from '@heroicons/react/24/solid'
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
import { motion } from 'framer-motion'
import ChatbotImage from 'src/assets/images/chatbot.png'
import NormalImage from 'src/assets/images/normal.png'
import * as datasetAPI from 'src/api/dataset'
import { chat, clearHistory } from 'src/api/chatbot'
import MarkdownRenderer from 'src/components/MarkdownRenderer'
import chatLoading from 'src/assets/gif/chat_loading.svg'
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
	showUploaderManual: false,
	showUploaderChatbot: false,
	showSelectData: false,
	projects: [],
}

export default function ProjectList() {
	const [projectState, updateProjState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		initialState
	)
	const [isSelected, setIsSelected] = useState(projType.map((el) => false))
	const [input, setInput] = useState('')
	const [selectedDataset, setSelectedDataset] = useState(null)
	const [datasets, setDatasets] = useState([])
	const [showTitle, setShowTitle] = useState(true)
	const [messages, setMessages] = useState([])
	const [chatbotGreetings, setMessage] = useState("What can i help with?")
	const [loading, setLoading] = useState(false);

	const options = [
		{
			id: 'chatbot',
			title: 'Chatbot',
			image: ChatbotImage,
			action: () => updateProjState({ showUploaderChatbot: true }),
		},
		{
			id: 'normal',
			title: 'Create Now',
			image: NormalImage,
			action: () => updateProjState({ showUploaderManual: true }),
		},
	]

	const textareaRef = useRef(null)
	useEffect(() => {
		const textarea = textareaRef.current
		if (!textarea) return

		// Reset height to auto to get the correct scrollHeight
		textarea.style.height = 'auto'

		// Set new height based on scrollHeight
		const newHeight = Math.max(
			textarea.scrollHeight, // actual content height
			40 // minimum height in pixels for one line
		)

		textarea.style.height = `${newHeight}px`
	}, [input]) // Re-run when input changes

	const chatContainerRef = useRef(null)
	useEffect(() => {
		setTimeout(() => {
			if (chatContainerRef.current) {
				const lastMessage = chatContainerRef.current.lastElementChild?.children[chatContainerRef.current.lastElementChild.children.length - 1]
				const secondLastMessage = chatContainerRef.current.lastElementChild?.children[chatContainerRef.current.lastElementChild.children.length - 2]
				let height = 0
				if (secondLastMessage) {
					height = secondLastMessage.offsetHeight + lastMessage.offsetHeight + chatContainerRef.current.nextElementSibling.offsetHeight + 64
				}
				chatContainerRef.current.scrollTo({
					top: chatContainerRef.current.scrollHeight - height,
					behavior: "smooth",
				})
			}
			console.log()
		}, 500)
	},[messages])

	const handleKeyPress = async (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (input.trim()) {
				if (messages.length === 0) {
					setMessages(previousMessages => [...previousMessages, { type: 'assistant', content: chatbotGreetings }])
				}
				setShowTitle(false)
				setMessages(previousMessages => [...previousMessages, { type: 'user', content: input}])
				setInput('')
				setMessages(previousMessages => [...previousMessages, { type: "assistant", content: "loading..." }]);
				setLoading(true)
				try {
					const response = await chat(input)
					setTimeout(() => {
						setMessages((previousMessages) => [...previousMessages.slice(0, -1), { type: "assistant", content: response.data.reply }]);
					}, 500)
					
				} catch (error) {
					console.error("Error receiving message:", error);
				} finally {
					setLoading(false)
				}
			}
		}
	}

	const newChat = async () => {
		setShowTitle(true)
		setMessages([]);
		const response = await clearHistory()
	}

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

	const getDatasets = async () => {
		if (datasets.length > 0) {
			updateProjState({ showSelectData: true })
			return datasets
		}
		try {
			const response = await datasetAPI.getDatasets()
			updateProjState({ showSelectData: true })
			setDatasets(response.data)

			console.log('Dataset List:', response.data)

			return response.data
		} catch (error) {
			console.error('Error fetching datasets:', error)
			return []
		}
	}

	useEffect(() => {
		projectState.projects.length >= 0 && getProjects()
	}, [])

	console.log('selectedDataset', selectedDataset)

	return (
		<>
			{/* List UI */}
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
										updateProjState({
											showUploader: true,
										})
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

			{/* Create new project */}
			<div
				className={`${
					projectState.showUploader
						? 'top-0 !z-[1000] opacity-100'
						: 'top-full bottom-0 opacity-0'
				} fixed flex flex-col items-center h-max w-full px-2 bg-white transition-all duration-500 ease-in-out min-h-screen`}
			>
				<button
					onClick={() => updateProjState({ showUploader: false })}
					className="absolute top-5 right-5 p-3 rounded-full bg-gray-200 hover:bg-gray-400 transition-colors w-12 h-12 flex items-center justify-center"
				>
					<svg
						viewBox="0 0 24 24"
						color="#69717A"
						className="w-6 h-6"
						aria-hidden="true"
					>
						<path d="M18.3 5.71a.9959.9959 0 00-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
					</svg>
				</button>
				<h2 className="text-4xl font-bold mb-14 mt-14">
					Do you need
					<span className="text-blue-500 text-5xl"> AI</span> help to
					create project?
				</h2>

				<div className="flex flex-col md:flex-row gap-[100px] items-center justify-center w-full">
					{options.map((option) => (
						<motion.div
							key={option.id}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="flex flex-col items-center bg-gray-100 p-6 rounded-2xl shadow-lg cursor-pointer transition-all hover:shadow-xl w-[500px]"
							onClick={option.action}
						>
							<img
								src={option.image}
								alt={option.title}
								className="w-[500px] h-[500px] mb-4"
							/>
							<span className="text-xl font-semibold">
								{option.title}
							</span>
						</motion.div>
					))}
				</div>
			</div>

			{/* Create new project UI manual */}
			<div
				className={`${
					projectState.showUploaderManual
						? 'top-0 !z-[1000] opacity-100'
						: 'top-full bottom-0 opacity-0'
				} fixed flex flex-col items-center h-full w-full px-[30px] justify-center bg-white  transition-all duration-500 ease overscroll-auto overflow-auto min-h-screen`}
			>
				<button
					onClick={() =>
						updateProjState({ showUploaderManual: false })
					}
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
									Create
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>

			{/* Create new project UI using Chatbot */}
			<div
				className={`${
					projectState.showUploaderChatbot
						? 'top-0 !z-[1000] opacity-100'
						: 'top-full bottom-0 opacity-0'
				} fixed flex flex-col h-full w-full bg-white transition-all duration-500 ease`}
			>
				{/* Close Button */}
				<button
					onClick={() =>
						updateProjState({ showUploaderChatbot: false })
					}
					className="absolute top-5 right-5 p-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
				>
					<svg
						className="w-6 h-6 text-gray-500"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path d="M18.3 5.71a.9959.9959 0 00-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
					</svg>
				</button>

				<div className="flex flex-col items-center h-full">
					{/* Main Container with Fixed Width */}
					<div className="w-full max-w-2xl h-full px-4 flex flex-col">			
						{/* Chat Messages Section */}
						<div ref={chatContainerRef} className="flex-1 w-full overflow-y-auto pt-16 pb-4">
							{showTitle ? (
								<div className="flex items-center justify-center h-full">
									<h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
										{chatbotGreetings}
									</h1>
								</div>
							) : (										
								<div className="space-y-4">
									{messages.map((message, index) => (
										<div
											key={index}
											className={`flex ${
												message.type === 'user'
													? 'justify-end'
													: 'justify-start'
											}`}
										>
											<div
												className={`px-3 py-1 rounded-xl ${
													message.type === 'user'
														? 'bg-gray-200 text-black max-w-[70%]'
														: 'bg-gray-300 text-black max-w-[95%]'
												}`}
											>
												{message.content === "loading..." ? (
													<img src={chatLoading} className="w-16 h-12 mx-auto" />
													) : (
													<MarkdownRenderer markdownText={message.content}></MarkdownRenderer>
												)}
											</div>
										</div>
									))}
									<button
										onClick={() => newChat()}
										className="px-6 py-3 rounded-md bg-gray-300 hover:bg-gray-200 transition-colors duration-200"
									>
										New chat ?
									</button>
								</div>
							)}
						</div>

						{/* Input Section */}
						<div className="w-full mb-8">
							{/* Selected Data Display */}
							{selectedDataset && (
								<div className="w-max flex items-center gap-2 mb-1 p-2 bg-gray-50 rounded-lg">
									<svg
										className="w-5 h-5 text-gray-600"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
										/>
									</svg>
									<span className="text-sm font-medium text-gray-700">
										{datasets[selectedDataset].title}
									</span>
								</div>
							)}

							<div className="relative flex items-center gap-2">
								{/* File Upload Button */}
								<button
									onClick={() => getDatasets()}
									className="absolute bottom-4 left-4 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
								>
									<PaperClipIcon className="w-5 h-5 text-gray-600" />
								</button>

								{/* Text Input */}
								<textarea
									ref={textareaRef}
									className="w-full p-4 pl-14 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-500 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 break-words whitespace-pre-wrap overflow-hidden resize-none"
									placeholder="Please provide a detailed description of your problem 🤔"
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyPress={handleKeyPress}
									rows={1}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Select Data UI */}
			<div
				className={`${
					projectState.showSelectData
						? 'top-0 !z-[1000] opacity-100'
						: 'top-full bottom-0 opacity-0'
				} fixed flex flex-col items-center h-full w-full px-[30px] bg-white transition-all duration-500 ease`}
			>
				{/* Close Button */}
				<button
					onClick={() => updateProjState({ showSelectData: false })}
					className="absolute top-5 right-5 p-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
				>
					<svg
						className="w-6 h-6 text-gray-500"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path d="M18.3 5.71a.9959.9959 0 00-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
					</svg>
				</button>

				<h2 className="text-4xl font-bold mb-14 mt-14">
					Choose
					<span className="text-blue-500 text-5xl"> DATASET</span>
				</h2>

				<div className="h-[50%] overflow-y-auto w-[70%] ml-4 mb-14 bg-gray-100 shadow-lg [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
					<table className="w-full divide-y divide-gray-200 rounded-[10px] break-words">
						<thead className="bg-gradient-to-r bg-blue-500 font-bold rounded-[10px] border-2 border-blue-500">
							<tr>
								<td className="px-6 py-1 text-center font-bold text-white uppercase tracking-wider w-1/3">
									Title
								</td>
								<td className="px-6 py-1 text-center font-bold text-white uppercase tracking-wider w-1/3">
									Service
								</td>
								<td className="px-6 py-1 text-center font-bold text-white uppercase tracking-wider w-1/3">
									Bucket
								</td>
							</tr>
						</thead>
						<tbody className="bg-gray-100 font-bold">
							{datasets.map((data, index) => (
								<tr
									key={index}
									className={`hover:bg-gray-300 cursor-pointer ${selectedDataset === index ? 'border-2 border-blue-700 bg-[rgba(0,110,255,0.041)]' : ''}`}
									onClick={() => {
										setSelectedDataset(index)
									}}
								>
									<td className="px-6 py-1 text-center">
										{data.title}
									</td>
									<td className="px-6 py-1 text-center">
										{data.service}
									</td>
									<td className="px-6 py-1 text-center">
										{data.bucketName}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{selectedDataset && (
					<button
						className="btn"
						onClick={() =>
							updateProjState({ showSelectData: false })
						}
					>
						<svg
							height="24"
							width="24"
							fill="#FFFFFF"
							viewBox="0 0 24 24"
							data-name="Layer 1"
							id="Layer_1"
							className="sparkle"
						>
							<path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
						</svg>
						<span className="text">Next</span>
					</button>
				)}
			</div>
		</>
	)
}
