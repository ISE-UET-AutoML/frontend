import { Dialog, Transition } from '@headlessui/react'
import { message } from 'antd'
import React, { Fragment, useReducer, useState, useEffect } from 'react'
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'
// import { UploadTypes } from 'src/constants/file'
// import Loading from 'src/components/Loading'
import { validateFiles } from 'src/utils/file'
import instance from 'src/api/axios'
import { PATHS } from 'src/constants/paths'
import { fetchWithTimeout } from 'src/utils/timeout'
import { API_URL } from 'src/constants/api'
import LineGraph from 'src/components/LineGraph'
import researchImage from 'src/assets/images/research.png'
import 'src/assets/css/chart.css'
import config from './config'
import * as experimentAPI from 'src/api/experiment'

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
	uploadSentences: [],
}

const PredictData = (props) => {
	const { projectInfo } = props
	const location = useLocation()
	const navigate = useNavigate()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experiment_name')
	const [predictDataState, updateState] = useReducer(
		(pre, next) => ({ ...pre, ...next }),
		initialState
	)
	const [GraphJSON, setGraphJSON] = useState({})
	const [trainLossGraph, setTrainLossGraph] = useState([])
	const [val_lossGraph, setValLossGraph] = useState([])
	const [val_accGraph, setValAccGraph] = useState([])

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
	useEffect(() => {
		instance
			.get(API_URL.get_training_history(experimentName))
			.then((res) => {
				const data = res.data
				console.log(data)

				setGraphJSON(data)

				if (data.fit_history.scalars.train_loss) {
					readChart(
						data.fit_history.scalars.train_loss,
						setTrainLossGraph
					)
				}

				if (data.fit_history.scalars.val_accuracy) {
					readChart(
						data.fit_history.scalars.val_accuracy,
						setValAccGraph
					)
				}
				if (data.fit_history.scalars.val_loss) {
					readChart(
						data.fit_history.scalars.val_loss,
						setValLossGraph
					)
				}
			})
	}, [])

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
		formData.append('runName', experimentName)

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
					const sentences = data.predictions.map((item) => ({
						sentence: item.sentence,
						confidence: item.confidence,
						label: item.class,
						value: null,
						id: 'ID',
					}))

					updateState({
						showTextModal: true,
						showUploadModal: false,
						uploadSentences: sentences,
						userConfirm: sentences,
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

			return
		}

		for (let i = 0; i < validFiles.length; i++) {
			formData.append('files', validFiles[i])
		}

		// const url = `${process.env.REACT_APP_EXPLAIN_URL}/image_classification/temp_predict`

		// const options = {
		// 	method: 'POST',
		// 	body: formData,
		// }

		console.log('Fetch start')
		// console.log(url)

		try {
			const { data } = await experimentAPI.predictImages(
				experimentName,
				formData
			)

			console.log('dataOK', data)
			message.success('Success Predict', 3)
		} catch (error) {
			message.error('Predict Fail', 3)
		}

		// fetchWithTimeout(url, options, 600000)
		// 	.then((data) => {
		// 		const { predictions } = data
		// 		const images = predictions.map((item) => ({
		// 			id: item.key,
		// 			value: null,
		// 			label: item.class,
		// 		}))
		// 		updateState({
		// 			uploadFiles: validFiles,
		// 			selectedImage: validFiles[0],
		// 			confidences: predictions,
		// 			confidenceScore: parseFloat(predictions[0].confidence),
		// 			confidenceLabel: predictions[0].class,
		// 			userConfirm: images,
		// 			showImageModal: true,
		// 		})
		// 		console.log('Fetch successful')
		// 	})
		// 	.catch((error) => {
		// 		console.error('Fetch error:', error.message)
		// 	})
		// 	.finally(() => {
		// 		updateState({ isLoading: false })
		// 		console.log('Fetch completed')
		// 	})
	}

	// const handleDeploy = async () => {
	// 	const formData = new FormData()

	// 	const model = await instance.get(API_URL.get_model(experimentName))
	// 	const jsonObject = model.data
	// 	if (!jsonObject) {
	// 		console.error('Failed to get model info')
	// 	}

	// 	formData.append('userEmail', jsonObject.userEmail)
	// 	formData.append('projectName', jsonObject.projectName)
	// 	formData.append('runName', experimentName)
	// 	formData.append('task', projectInfo.type)

	// 	const url = `${process.env.REACT_APP_SERVING_URL}/deploy`

	// 	const options = {
	// 		method: 'POST',
	// 		body: formData,
	// 	}

	// 	fetchWithTimeout(url, options, 60000)
	// 		.then((data) => {
	// 			console.log(data)
	// 			console.log('Fetch successful')
	// 		})
	// 		.catch((error) => {
	// 			console.error('Fetch error:', error.message)
	// 		})
	// }

	// const saveBestModel = async () => {
	//     try {
	//         await instance.get(
	//             `${process.env.REACT_APP_API_URL}/experiments/save-model?experiment_name=${experimentName}`
	//         );
	//     } catch (error) {
	//         console.error(error);
	//     }
	// };

	return (
		<>
			{/* BIỂU ĐỒ SAU KHI TRAIN XONG */}
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
							// handleDeploy()
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
											data={trainLossGraph}
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

								<div className=" h-56 col-span-full lg:col-span-5 overflow-hidden relative p-8 rounded-xl bg-white border border-gray-200 shadow-lg">
									<div className="flex flex-col justify-between relative z-10 space-y-12 lg:space-y-6">
										<div className="space-y-2">
											<p className=" text-gray-700">
												<span className="font-bold">
													Train loss (train_loss)
												</span>{' '}
												measures a model's prediction
												error during training. It
												indicates how well the model
												fits the training data, with
												lower values suggesting better
												performance.
											</p>
											<p className=" text-gray-700">
												<span className="font-bold">
													Validation loss (val_loss)
												</span>{' '}
												evaluates a model's performance
												on unseen data, providing
												insight into its generalization
												ability. A significant gap
												between train loss and val_loss
												often indicates overfitting,
												where the model performs well on
												training data but poorly on new
												data.
											</p>
											<p className=" text-gray-700">
												<span className="font-bold">
													Validation accuracy
													(val_accuracy)
												</span>{' '}
												measures a model's ability to
												correctly predict outcomes on
												unseen validation data. High
												validation accuracy indicates
												strong generalization, while a
												large gap with training accuracy
												may signal overfitting.
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

			{/* BẢNG KẾT QUẢ SAU KHI CORRECT/ INCORRECT*/}
			<Transition.Root
				show={predictDataState.showResultModal}
				as={Fragment}
			>
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

										<h3 className="text-[#666] font-[700] p-[15px] text-[24px]">
											Total Prediction:{' '}
											<strong className="text-blue-600">
												{
													// predictDataState.uploadFiles
													// 	?.length
													projectInfo.type ===
													'IMAGE_CLASSIFICATION'
														? predictDataState
																.uploadFiles
																?.length
														: projectInfo.type ===
															  'TEXT_CLASSIFICATION'
															? predictDataState
																	.uploadSentences
																	?.length
															: 'no'
												}
											</strong>
										</h3>

										<h3 className="text-[#666] font-[700] p-[15px] text-[24px]">
											Correct Prediction:{' '}
											<strong className="text-blue-600">
												{' '}
												{
													predictDataState.userConfirm.filter(
														(item) =>
															item.value ===
															'true'
													)?.length
												}
											</strong>
										</h3>

										<h3 className="text-[#666] font-[700] p-[15px] text-[24px]">
											Accuracy:{' '}
											<strong className="text-blue-600">
												{/* {parseFloat(
													predictDataState.userConfirm.filter(
														(item) =>
															item.value ===
															'true'
													)?.length /
														predictDataState
															.uploadFiles?.length
												).toFixed(2)} */}
												{projectInfo.type ===
												'IMAGE_CLASSIFICATION'
													? parseFloat(
															predictDataState.userConfirm.filter(
																(item) =>
																	item.value ===
																	'true'
															)?.length /
																predictDataState
																	.uploadFiles
																	?.length
														).toFixed(2)
													: projectInfo.type ===
														  'TEXT_CLASSIFICATION'
														? parseFloat(
																predictDataState.userConfirm.filter(
																	(item) =>
																		item.value ===
																		'true'
																)?.length /
																	predictDataState
																		.uploadSentences
																		?.length
															).toFixed(2)
														: 'no'}
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

			{projectInfo &&
				(() => {
					const object = config[projectInfo.type]
					if (object) {
						const PredictComponent = object.predictView
						return (
							<PredictComponent
								experimentName={experimentName}
								projectInfo={projectInfo}
								predictDataState={predictDataState}
								updateState={updateState}
								handleFileChange={handleFileChange}
							/>
						)
					}
					return null
				})()}
		</>
	)
}

export default PredictData
