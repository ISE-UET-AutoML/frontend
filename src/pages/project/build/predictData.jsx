import { Dialog, Transition } from '@headlessui/react'
import { message } from 'antd'
import React, { Fragment, useReducer, useState, useEffect } from 'react'
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { validateFiles } from 'src/utils/file'
import instance from 'src/api/axios'
import { API_URL } from 'src/constants/api'
import 'src/assets/css/chart.css'
import config from './config'
import * as experimentAPI from 'src/api/experiment'
import Loading from 'src/components/Loading'

const initialState = {
	showUploadPanel: false,
	showPredictLayout: false,
	showResultModal: false,
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
	predictResult: {},
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
	const [val_roc_aucGraph, setRocAucGraph] = useState([])
	const [isHasGraph, setIsHasGraph] = useState(false)

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
	// TODO: Render training graph for Tabular/Text
	useEffect(() => {
		instance
			.get(API_URL.get_training_history(experimentName))
			.then((res) => {
				const data = res.data

				console.log('history', data)
				setGraphJSON(data)

				if (data.fit_history.scalars.train_loss) {
					readChart(
						data.fit_history.scalars.train_loss,
						setTrainLossGraph
					)
					setIsHasGraph(true)
				}

				if (data.fit_history.scalars.val_accuracy) {
					readChart(
						data.fit_history.scalars.val_accuracy,
						setValAccGraph
					)
					setIsHasGraph(true)
				}
				if (data.fit_history.scalars.val_loss) {
					readChart(
						data.fit_history.scalars.val_loss,
						setValLossGraph
					)
					setIsHasGraph(true)
				}
				if (data.fit_history.scalars.val_roc_auc) {
					readChart(
						data.fit_history.scalars.val_roc_auc,
						setRocAucGraph
					)
					setIsHasGraph(true)
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

		formData.append('task', projectInfo.type)

		for (let i = 0; i < validFiles.length; i++) {
			formData.append('files', validFiles[i])
		}
		console.log(validFiles, 'vaFile')
		console.log('Fetch start')

		try {
			const { data } = await experimentAPI.predictData(
				experimentName,
				formData
			)
			console.log('data', data)
			const { predictions } = data

			const tmp = predictions.map((item) => ({
				id: item.key,
				value: null,
				label: item.class,
				confidence: item.confidence,
				sentence: item.sentence,
			}))

			//TODO: tách bạch userConfirm và predictResult
			updateState({
				userConfirm: tmp,
				showUploadPanel: false,
				showPredictLayout: true,
				uploadFiles: validFiles,
				predictResult: predictions,
			})

			switch (projectInfo.type) {
				case 'IMAGE_CLASSIFICATION': {
					updateState({
						uploadFiles: validFiles,
						selectedImage: validFiles[0],
						confidences: predictions,
						confidenceScore: parseFloat(predictions[0].confidence),
						confidenceLabel: predictions[0].class,
					})
					break
				}
				case 'TEXT_CLASSIFICATION': {
					updateState({
						uploadSentences: tmp,
					})
					break
				}
				// save path cua file csv o BE
				case 'TABULAR_CLASSIFICATION': {
					updateState({
						predictFile: {
							url: data.data_path,
							label: '',
						},
					})
					break
				}
				default:
					// Handle other cases or throw an error if necessary
					console.log('Unsupported project type')
					break
			}

			console.log('Fetch successful')

			updateState({ isLoading: false })
			message.success('Success Predict', 3)
		} catch (error) {
			message.error('Predict Fail', 3)
			updateState({ isLoading: false })
		}
	}

	return (
		<div div className="max-h-full">
			{/* TRAINING GRAPH */}
			{isHasGraph &&
				(() => {
					const object = config[projectInfo.type]
					if (object) {
						const GraphComponent = object.trainingGraph
						return (
							<GraphComponent
								trainLossGraph={trainLossGraph}
								val_lossGraph={val_lossGraph}
								val_accGraph={val_accGraph}
								val_roc_aucGraph={val_roc_aucGraph}
								updateState={updateState}
							/>
						)
					}
					return null
				})()}

			{predictDataState.isLoading && <Loading />}

			{/* UPLOAD VIEW */}
			<div
				className={`${
					predictDataState.showUploadPanel
						? 'top-[375px] left-0 bottom-full z-[1000] opacity-100'
						: 'left-0 top-full bottom-0 opacity-0'
				} fixed h-full w-full bg-white transition-all duration-500 ease overflow-auto pb-[30px]`}
			>
				<label
					htmlFor="file"
					className="flex flex-col w-[85%] cursor-pointer mt-4 shadow justify-between mx-auto items-center p-[10px] gap-[5px] bg-[rgba(0,110,255,0.041)] h-[300px] rounded-[10px]"
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
								style={{
									maskType: 'alpha',
								}}
								width="100"
								height="100"
								x="0"
								y="0"
								maskUnits="userSpaceOnUse"
							>
								<path fill="#D9D9D9" d="M0 0H100V100H0z"></path>
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
				<button
					onClick={() => {
						updateState({ showUploadPanel: false })
					}}
					className="absolute ml-[700px] mt-5 p-[6px] rounded-lg bg-white hover:bg-gray-300 hover:text-white font-[600] w-[40px] h-[40px]"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className="size-6"
					>
						<path
							fillRule="evenodd"
							d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
			</div>

			{/* PREDICT VIEW */}
			{predictDataState.uploadFiles.length > 0 &&
			predictDataState.showPredictLayout ? (
				projectInfo &&
				(() => {
					const object = config[projectInfo.type]
					if (object) {
						const PredictComponent = object.predictView
						return (
							<div className=" top-0 left-0 bottom-full z-[1000] opacity-100 fixed h-full w-full px-[30px] bg-white transition-all duration-500 ease overflow-auto pb-[30px]">
								<button
									onClick={() => {
										updateState({
											showPredictLayout: false,
										})
									}}
									className="absolute top-[0.6rem] right-5 p-[6px] text-white rounded-full hover:bg-gray-300 hover:text-white font-[600] w-[40px] h-[40px]"
								>
									<svg
										className=""
										focusable="false"
										viewBox="0 0 24 24"
										color="#FFFFFF"
										aria-hidden="true"
										data-testId="close-upload-media-dialog-btn"
									>
										<path d="M18.3 5.71a.9959.9959 0 00-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
									</svg>
								</button>
								<PredictComponent
									experimentName={experimentName}
									projectInfo={projectInfo}
									predictDataState={predictDataState}
									updateState={updateState}
								/>
							</div>
						)
					}
					return null
				})()
			) : (
				<></>
			)}

			{/* BẢNG KẾT QUẢ SAU KHI CORRECT/ INCORRECT*/}
			{/* <Transition.Root
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
												{projectInfo.type ===
												'IMAGE_CLASSIFICATION'
													? predictDataState
															.uploadFiles?.length
													: projectInfo.type ===
														  'TEXT_CLASSIFICATION'
														? predictDataState
																.uploadSentences
																?.length
														: 'no'}
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
			</Transition.Root> */}
		</div>
	)
}

export default PredictData
