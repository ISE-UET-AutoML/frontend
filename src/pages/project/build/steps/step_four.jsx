import { Dialog, Transition } from '@headlessui/react'
import { message } from 'antd'
import React, { Fragment, useReducer, useState, useEffect } from 'react'
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { UploadTypes } from 'src/constants/file'
import Loading from 'src/components/Loading'
import { validateFiles } from 'src/utils/file'
import instance from 'src/api/axios'
import { PATHS } from 'src/constants/paths'
import { fetchWithTimeout } from 'src/utils/timeout'
import { API_URL } from 'src/constants/api'
import LineGraph from 'src/components/LineGraph'
import researchImage from 'src/assets/images/research.png'

import 'src/assets/css/chart.css'

const initialState = {
	showUploadModal: false,
	showPredictModal: false,
	showResultModal: false,
	showImageModal: false,
	showTextModal: false,
	predictFile: { url: '', label: '' },
	uploadFiles: [],
	selectedImage: null,
	isDeploying: false,
	isLoading: false,
	confidences: [],
	confidenceLabel: '',
	confidenceScore: 0,
	userConfirm: [],
	selectedSentence: null,
	uploadSentences: null,
}

const StepFour = (props) => {
	const { projectInfo } = props
	const location = useLocation()
	const navigate = useNavigate()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experiment_name')
	const [stepFourState, updateState] = useReducer(
		(pre, next) => ({ ...pre, ...next }),
		initialState
	)
	const [explainImageUrl, setExplainImageUrl] = useState('')
	const [sentence, setSentence] = useState('')
	const [explainTextHTML, setExplainTextHTML] = useState('')

	const [predictTextLabel, setPredictTextLabel] = useState('')
	const [GraphJSON, setGraphJSON] = useState({})
	const [trainlossGraph, setTrainlossGraph] = useState([])
	const [val_lossGraph, setVallossGraph] = useState([])
	const [val_accGraph, setValaccGraph] = useState([])

	useEffect(() => {
		instance
			.get(API_URL.get_training_history(experimentName))
			.then((res) => {
				const data = res.data
				console.log(data)
				console.log(data.fit_history.scalars.train_loss)

				setGraphJSON(data)
				readChart(
					data.fit_history.scalars.train_loss,
					setTrainlossGraph
				)
				readChart(data.fit_history.scalars.val_loss, setVallossGraph)
				readChart(data.fit_history.scalars.val_accuracy, setValaccGraph)
			})
	}, [])

	const handleTextChange = (event) => {
		setSentence(event.target.value)
	}
	const readChart = (contents, setGraph) => {
		const lines = contents.split('\n')
		const header = lines[0].split(',')
		let parsedData = []
		for (let i = 1; i < lines.length - 1; i++) {
			const line = lines[i].split(',')
			const item = {}

			for (let j = 1; j < header.length; j++) {
				const key = header[j]?.trim() || ''
				const value = line[j]?.trim() || ''
				item[key] = value
			}

			parsedData.push(item)
		}

		setGraph(parsedData)
	}
	const handleFileChange = async (event) => {
		const files = Array.from(event.target.files)
		const validFiles = validateFiles(files, projectInfo.type)

		updateState({
			isLoading: true,
		})

		const formData = new FormData()

		const model = await instance.get(API_URL.get_model(experimentName))
		const jsonObject = model.data
		if (!jsonObject) {
			console.error('Failed to get model info')
		}

		formData.append('userEmail', jsonObject.userEmail)
		formData.append('projectName', jsonObject.projectName)
		formData.append('runName', 'ISE')

		// handle text prediction (temporary)
		if (files[0].name.endsWith('.csv') && files.length === 1) {
			formData.append('csv_file', validFiles[0])
			const url = `${process.env.REACT_APP_EXPLAIN_URL}/text_prediction/temp_predict`

			const options = {
				method: 'POST',
				body: formData,
			}

			fetchWithTimeout(url, options, 120000)
				.then((data) => {
					// setPredictTextLabel(data.predictions)
					console.log(data)
					const sentences = data.predictions.map((item) => ({
						sentence: item.sentence,
						confidence: item.confidence,
						label: item.class,
					}))
					console.log('Fetch successful')

					updateState({
						showTextModal: true,
						showUploadModal: false,
						uploadSentences: sentences,
					})

					console.log(stepFourState.showUploadModal)
				})
				.catch((error) => {
					console.error('Fetch error:', error.message)
				})
				.finally(() => {
					updateState({ isLoading: false })
				})

			return
		}

		for (let i = 0; i < validFiles.length; i++) {
			formData.append('files', validFiles[i])
		}

		const url = `${process.env.REACT_APP_EXPLAIN_URL}/image_classification/temp_predict`

		const options = {
			method: 'POST',
			body: formData,
		}

		console.log('Fetch start')
		console.log(url)
		fetchWithTimeout(url, options, 60000)
			.then((data) => {
				const { predictions } = data
				const images = predictions.map((item) => ({
					id: item.key,
					value: null,
					label: item.class,
				}))
				updateState({
					uploadFiles: validFiles,
					selectedImage: validFiles[0],
					confidences: predictions,
					confidenceScore: parseFloat(predictions[0].confidence),
					confidenceLabel: predictions[0].class,
					userConfirm: images,
					showImageModal: true,
				})
				console.log('Fetch successful')
			})
			.catch((error) => {
				console.error('Fetch error:', error.message)
			})
			.finally(() => {
				updateState({ isLoading: false })
				console.log('Fetch completed')
			})
	}

	// const handleDeploy = async () => {
	//     fetch(
	//         `${process.env.REACT_APP_API_URL}/experiments/deploy?experiment_name=${experimentName}`
	//     )
	//         .then((res) => res.json())
	//         .then((data) => console.log(data))
	//         .catch((err) => console.log(err));
	// };
	// const saveBestModel = async () => {
	//     try {
	//         await instance.get(
	//             `${process.env.REACT_APP_API_URL}/experiments/save-model?experiment_name=${experimentName}`
	//         );
	//     } catch (error) {
	//         console.error(error);
	//     }
	// };

	const handleSelectedText = async (item) => {
		updateState({
			selectedSentence: item.sentence,
		})
	}

	const handleExplainText = async (event) => {
		event.preventDefault()

		// TODO: fix hardcorded values
		const formData = new FormData()

		updateState({
			isLoading: true,
		})

		const model = await instance.get(API_URL.get_model(experimentName))
		const jsonObject = model.data
		if (!jsonObject) {
			console.error('Failed to get model info')
		}
		console.log(jsonObject)

		formData.append('userEmail', jsonObject.userEmail)
		formData.append('projectName', jsonObject.projectName)
		formData.append('runName', 'ISE')
		formData.append('text', stepFourState.selectedSentence)

		console.log('Fetching explain text')

		const url = `${process.env.REACT_APP_EXPLAIN_URL}/text_prediction/explain`

		const options = {
			method: 'POST',
			body: formData,
		}

		fetchWithTimeout(url, options, 60000)
			.then((data) => {
				const html = data.explain_html
				setExplainTextHTML(html)
				console.log(html)
				const parsedHTML = new DOMParser().parseFromString(
					html,
					'text/html'
				)
				const scriptContent =
					parsedHTML.querySelector('script').textContent
				// Create a script element
				const script = document.createElement('script')

				// Set the script content to execute
				script.textContent = scriptContent

				// Append the script element to the document body or head
				// You can choose where to append it based on your needs
				document.body.appendChild(script)

				console.log('Fetch successful')
			})
			.catch((error) => {
				console.error('Fetch error:', error.message)
				// Handle timeout or other errors here
				if (error.message === 'Request timed out') {
					console.log('The request took too long and was terminated.')
				}
			})
			.finally(() => {
				updateState({ isLoading: false })
			})
	}

	const handleExplainSelectedImage = async () => {
		const item = stepFourState.selectedImage

		const formData = new FormData()

		const model = await instance.get(API_URL.get_model(experimentName))
		const jsonObject = model.data
		if (!jsonObject) {
			console.error('Failed to get model info')
		}
		console.log(jsonObject)
		// // TODO: fix hardcorded values
		// const jsonObject = {
		//     userEmail: "test-automl",
		//     projectName: "4-animal",
		//     runName: "ISE",
		// };

		console.log(jsonObject.userEmail)
		console.log(jsonObject.projectName)
		console.log(jsonObject.runID)
		updateState({
			isLoading: true,
		})

		formData.append('userEmail', jsonObject.userEmail)
		formData.append('projectName', jsonObject.projectName)
		formData.append('runName', 'ISE')
		formData.append('image', item)

		const url = `${process.env.REACT_APP_EXPLAIN_URL}/image_classification/explain`

		const options = {
			method: 'POST',
			body: formData,
		}

		fetchWithTimeout(url, options, 60000)
			.then((data) => {
				const base64ImageString = data.explain_image
				const fetchedImageUrl = `data:image/jpeg;base64,${base64ImageString}`

				setExplainImageUrl(fetchedImageUrl)

				updateState({
					isLoading: false,
				})
				console.log('Fetch successful')
			})
			.catch((error) => {
				console.error('Fetch error:', error.message)
				updateState({ isLoading: false })
			})
	}

	const handleSelectedImage = async (item) => {
		const fileIndex = stepFourState.uploadFiles.findIndex(
			(file) => file.name === item.name
		)
		updateState({
			selectedImage: item,
			confidenceScore: stepFourState.confidences[fileIndex].confidence,
			confidenceLabel: stepFourState.confidences[fileIndex].class,
		})
	}
	const handleConfirmImage = (value) => {
		const currentImageSeletedIndex = stepFourState.uploadFiles.findIndex(
			(file) => file.name === stepFourState.selectedImage.name
		)

		const nextIdx =
			currentImageSeletedIndex === stepFourState.uploadFiles.length - 1
				? currentImageSeletedIndex
				: currentImageSeletedIndex + 1

		setExplainImageUrl('')
		updateState({
			userConfirm: stepFourState.userConfirm.map((item, index) => {
				if (index === currentImageSeletedIndex) {
					return { ...item, value: value }
				}
				return item
			}),
			selectedImage: stepFourState.uploadFiles[nextIdx],
			confidenceScore: parseFloat(
				stepFourState.confidences[nextIdx].confidence
			),
			confidenceLabel: stepFourState.confidences[nextIdx].class,
		})
	}
	return (
		<>
			<section>
				<div className="flex">
					<h1 className="text-3xl font-bold text-center mb-6">
						Outcomes of the training procedure
					</h1>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						width="24"
						height="24"
					>
						<path
							fillRule="evenodd"
							d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
							clipRule="evenodd"
						/>
					</svg>

					<button
						onClick={() => {
							updateState({ showUploadModal: true })
							// handleDeploy();
						}}
						className="items-center ml-auto text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
						// hidden
					>
						Predict
					</button>
				</div>
				<div className="py-2.5">
					<div className=" max-w-full text-gray-500">
						<div className="relative">
							<div className="relative z-10 grid gap-3 grid-cols-6">
								<div className="col-span-full lg:col-span-2 overflow-hidden flex relative p-2 rounded-xl bg-white border border-gray-200 shadow-lg">
									<div className="size-fit m-auto relative flex justify-center">
										<LineGraph
											data={trainlossGraph}
											label="train_loss"
										/>
									</div>
								</div>
								<div className="col-span-full lg:col-span-2 overflow-hidden flex relative p-2 rounded-xl bg-white border border-gray-200 shadow-lg">
									<div className="size-fit m-auto relative flex justify-center">
										<LineGraph
											data={val_lossGraph}
											label="val_loss"
										/>
									</div>
								</div>
								<div className="col-span-full lg:col-span-2 overflow-hidden flex relative p-2 rounded-xl bg-white border border-gray-200 shadow-lg">
									<div className="size-fit m-auto relative flex justify-center">
										<LineGraph
											data={val_accGraph}
											label="val_accuracy"
										/>
									</div>
								</div>

								<div className=" h-56 col-span-full lg:col-span-5 overflow-hidden relative p-8 rounded-xl bg-white border border-gray-200">
									<div className="flex flex-col justify-between relative z-10 space-y-12 lg:space-y-6">
										<div className="space-y-2">
											<p className=" text-gray-700">
												Training an AI is a
												sophisticated process that
												involves the use of complex
												algorithms designed to analyze
												vast amounts of data. The
												primary aim is to enable the AI
												to learn patterns and make
												predictions or decisions based
												on the information it processes.
												To achieve this, machine
												learning models are trained
												using various techniques,
												including supervised learning,
												unsupervised learning, and
												reinforcement learning. These
												techniques involve iteratively
												adjusting the algorithms to
												improve their accuracy and
												effectiveness.
											</p>
											<p className=" text-gray-700">
												Despite the advanced nature of
												these algorithms, the training
												process is not without its
												challenges. Errors and
												inaccuracies can still arise,
												which can impact the performance
												of the AI. These mistakes often
												stem from limitations in the
												data, such as biases or gaps,
												and the inherent complexity of
												the algorithms themselves.
												Addressing these issues requires
												continuous refinement of the
												models and the data they are
												trained on.
											</p>
										</div>
									</div>
								</div>
								<div className="h-56 col-span-full lg:col-span-1 overflow-hidden flex relative p-2 rounded-xl bg-white border border-gray-200 shadow-lg">
									<div className="size-fit m-auto relative flex justify-center">
										<img src={researchImage} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<Transition.Root show={stepFourState.showResultModal} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-[999999]"
					onClose={(value) => {
						updateState({ showResultModal: value })
					}}
				>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
					</Transition.Child>

					<div className="fixed inset-0 z-10 overflow-y-auto">
						<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
								enterTo="opacity-100 translate-y-0 sm:scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 translate-y-0 sm:scale-100"
								leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							>
								<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
									{/* title */}
									<div className="bg-white p-[10px] divide-y-2 divide-solid divide-slate-50">
										<div className="flex justify-between items-center mb-5">
											<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
												<Dialog.Title
													as="h3"
													className="text-base font-semibold leading-6 text-gray-900"
												>
													Prediction Result
												</Dialog.Title>
											</div>
											<div className="text-[30px] text-gray-400 mx-auto flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-transparent hover:text-red-200 sm:mx-0 sm:h-10 sm:w-10">
												<button
													onClick={() =>
														updateState({
															showResultModal: false,
														})
													}
												>
													×
												</button>
											</div>
										</div>

										<h3 className="text-[#666] text-[14px] font-[700] p-[15px] text-[24px]">
											Total Prediction:{' '}
											<strong className="text-blue-600">
												{
													stepFourState.uploadFiles
														?.length
												}
											</strong>
										</h3>

										<h3 className="text-[#666] text-[14px] font-[700] p-[15px] text-[24px]">
											Correct Prediction:{' '}
											<strong className="text-blue-600">
												{' '}
												{
													stepFourState.userConfirm.filter(
														(item) =>
															item.value ===
															'true'
													)?.length
												}
											</strong>
										</h3>

										<h3 className="text-[#666] text-[14px] font-[700] p-[15px] text-[24px]">
											Accuracy:{' '}
											<strong className="text-blue-600">
												{parseFloat(
													stepFourState.userConfirm.filter(
														(item) =>
															item.value ===
															'true'
													)?.length /
														stepFourState
															.uploadFiles?.length
												).toFixed(2)}
											</strong>
										</h3>

										<div className="images-container flex flex-wrap gap-y-4 justify-center"></div>
									</div>
									{/* button */}
									<div className="bg-gray-50 px-4 py-3 sm:flex sm:px-6 justify-start">
										<button
											type="button"
											className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
											onClick={() =>
												updateState({
													showResultModal: false,
												})
											}
										>
											Cancel
										</button>
										<button
											type="button"
											className="ml-auto w-fit inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
											onClick={() => {
												updateState({
													showResultModal: false,
													isLoading: true,
												})
												// saveBestModel();
												const timer = setTimeout(() => {
													updateState({
														isLoading: false,
													})
													message.success(
														'Your model is deployed',
														2
													)
													navigate(PATHS.MODELS, {
														replace: true,
													})
													clearTimeout(timer)
												}, 5000)
											}}
										>
											Deploy
										</button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition.Root>
			<div
				className={`${
					stepFourState.showTextModal
						? 'top-0 left-0 bottom-full z-[1000] opacity-100'
						: 'left-0 top-full bottom-0 opacity-0'
				} fixed flex flex-col items-center h-full w-full px-[30px] justify-center bg-white  transition-all duration-500 ease overflow-auto`}
			>
				{stepFourState.showTextModal ? (
					<div className="relative">
						<div className="max-h-96 overflow-auto">
							<table>
								<thead className="sticky top-0">
									<tr>
										<th>Sentence</th>
										<th>Confidence</th>
										<th>Label</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{stepFourState.uploadSentences.map(
										(item, index) => (
											<tr
												key={index}
												onClick={() =>
													handleSelectedText(item)
												}
												className={`hover:bg-gray-100 cursor-pointer ${stepFourState.selectedSentence === item.sentence ? 'border-2 border-blue-500' : ''}`}
											>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{item.sentence}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{item.confidence}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{item.label}
												</td>
											</tr>
										)
									)}
								</tbody>
							</table>
						</div>

						<div>
							<button
								onClick={handleExplainText}
								className=" text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
							>
								Explain
							</button>
						</div>
						<div
							style={{
								width: '100%',
								maxWidth: '1000px',
								padding: '20px',
								backgroundColor: '#f9f9f9',
								borderRadius: '8px',
								overflow: 'auto',
							}}
							dangerouslySetInnerHTML={{
								__html: explainTextHTML,
							}}
						></div>
					</div>
				) : (
					<p>Error</p>
				)}
			</div>

			<div
				className={`${
					stepFourState.showUploadModal
						? 'top-0 left-0 bottom-full z-[1000] opacity-100'
						: 'left-0 top-full bottom-0 opacity-0'
				} fixed flex flex-col items-center h-full w-full px-[30px] justify-center bg-white  transition-all duration-500 ease overflow-auto`}
			>
				<button
					onClick={() => {
						updateState(initialState)
					}}
					className="absolute top-5 right-5 p-[12px] rounded-full bg-white hover:bg-gray-300 hover:text-white font-[600] w-[48px] h-[48px]"
				>
					<svg
						className="hover:scale-125 hover:fill-red-500"
						focusable="false"
						viewBox="0 0 24 24"
						color="#69717A"
						aria-hidden="true"
						data-testid="close-upload-media-dialog-btn"
					>
						<path d="M18.3 5.71a.9959.9959 0 00-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
					</svg>
				</button>
				{stepFourState.isLoading && <Loading />}

				{/* uploaded */}
				{stepFourState.uploadFiles.length > 0 && showImageModal ? (
					<>
						<div className="mx-auto mt-8 w-full grid grid-cols-1 gap-6 sm:px-6 lg:max-w-[1600px] lg:grid-flow-col-dense justify-center items-center lg:grid-cols-6 h-full ">
							<div className="col-span-4">
								<section>
									<div className="bg-white shadow sm:rounded-lg p-5">
										<div
											class={`${
												stepFourState.selectedImage
													? ''
													: 'animate-pulse'
											} h-[400px] bg-[#e1e4e8]  p-4 w-full rounded-md mb-5 m-auto flex justify-center `}
										>
											{stepFourState.selectedImage && (
												<img
													src={URL.createObjectURL(
														stepFourState.selectedImage
													)}
													alt=""
													className="object-contain rounded-[8px]"
												/>
											)}
										</div>

										<div className="flex gap-5 overflow-x-scroll overflow-y-hidden mt-10">
											{stepFourState.uploadFiles.map(
												(item, index) => (
													<div
														class={`${
															typeof stepFourState
																?.userConfirm[
																index
															].value === 'string'
																? stepFourState
																		?.userConfirm[
																		index
																	].value ===
																	'true'
																	? 'border-4 border-green-500 border-solid'
																	: 'border-4 border-red-600 border-solid'
																: ''
														}
                          ${index < stepFourState.uploadFiles.length - 1 ? (stepFourState.selectedImage.name === item.name ? 'border-4 !border-yellow-500 border-solid' : '') : ''}
                          bg-[#F3F6F9] rounded-[8px] h-[130px] min-w-[200px] p-2 flex   justify-center `}
														onClick={() =>
															handleSelectedImage(
																item
															)
														}
													>
														<img
															src={URL.createObjectURL(
																item
															)}
															alt=""
															className="object-contain  rounded-[8px]"
														/>
													</div>
												)
											)}
										</div>
									</div>
								</section>
							</div>

							<section
								aria-labelledby="timeline-title"
								className="lg:col-span-2"
							>
								<div className="bg-white text-base font-medium px-4 py-5 shadow sm:rounded-lg sm:px-6">
									<div className="flex w-full justify-end items-center">
										{!stepFourState.userConfirm.some(
											(item) => item.value === null
										) && (
											<button
												onClick={(e) => {
													updateState({
														showResultModal: true,
													})
												}}
												type="button"
												className="ml-auto w-fit inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
											>
												View Result
											</button>
										)}
									</div>
									<div className="ml-auto my-5 flex gap-5 justify-between w-full">
										<button
											onClick={(e) =>
												handleConfirmImage('false')
											}
											type="button"
											className="w-fit inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
										>
											Incorrect
										</button>
										<button
											onClick={(e) =>
												handleExplainSelectedImage()
											}
											type="button"
											className="w-fit inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
										>
											Explain
										</button>
										<button
											onClick={(e) =>
												handleConfirmImage('true')
											}
											type="button"
											className="w-fit inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
										>
											Correct
										</button>
									</div>
									<div className="h-full min-h-[300px] bg-[#e1e4e8]  p-4 w-full rounded-md mb-5 m-auto flex">
										<div className="bg-[#49525e] rounded-2xl border-2 border-dashed border-gray-200 text-white h-fit px-4 py-1">
											<span
												style={{
													display: 'block',
													width: '100%',
												}}
											>
												{stepFourState.confidenceLabel}:{' '}
												<strong>
													{' '}
													{parseFloat(
														stepFourState.confidenceScore
													).toFixed(2)}
												</strong>
											</span>
											<div
												style={{
													display: 'block',
													marginTop: '20px',
												}}
											>
												{explainImageUrl && (
													<img
														src={explainImageUrl}
														alt="Explain"
														className="rounded-md mt-4"
													/>
												)}
											</div>
										</div>
									</div>
								</div>
							</section>
						</div>
					</>
				) : (
					<label
						htmlFor="file"
						onClick={() => updateState({ showPredictModal: true })}
						// for="file"
						className="flex flex-col w-[95%] cursor-pointer mt-10 shadow justify-between mx-auto items-center p-[10px] gap-[5px] bg-[rgba(0,110,255,0.041)] h-[300px] rounded-[10px] "
					>
						<div className="header flex flex-1 w-full border-[2px] justify-center items-center flex-col border-dashed border-[#4169e1] rounded-[10px]">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="100"
								height="100"
								fill="none"
								viewBox="0 0 100 100"
							>
								<mask
									id="mask0_908_734"
									style={{ maskType: 'alpha' }}
									width="100"
									height="100"
									x="0"
									y="0"
									maskUnits="userSpaceOnUse"
								>
									<path
										fill="#D9D9D9"
										d="M0 0H100V100H0z"
									></path>
								</mask>
								<g mask="url(#mask0_908_734)">
									<path
										fill="#65A4FE"
										d="M45.833 83.333h-18.75c-6.319 0-11.718-2.187-16.195-6.562-4.481-4.375-6.721-9.722-6.721-16.042 0-5.416 1.632-10.243 4.896-14.479 3.263-4.236 7.534-6.944 12.812-8.125 1.736-6.389 5.208-11.562 10.417-15.52 5.208-3.96 11.11-5.938 17.708-5.938 8.125 0 15.017 2.829 20.675 8.487 5.661 5.661 8.492 12.554 8.492 20.68 4.791.555 8.768 2.62 11.929 6.195 3.158 3.578 4.737 7.763 4.737 12.554 0 5.209-1.822 9.636-5.466 13.284-3.648 3.644-8.075 5.466-13.284 5.466H54.167V53.542L60.833 60l5.834-5.833L50 37.5 33.333 54.167 39.167 60l6.666-6.458v29.791z"
									></path>
								</g>
							</svg>
							<p className="text-center text-black">
								Upload files to predict
							</p>
						</div>
						<input
							id="file"
							type="file"
							multiple
							className="hidden"
							onChange={handleFileChange}
							onClick={(event) => {
								event.target.value = null
							}}
						/>
					</label>
				)}
			</div>
		</>
	)
}

export default StepFour
