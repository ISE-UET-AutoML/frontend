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
	uploadedFiles: [],
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
		console.log('Fetch start')

		try {
			const { data } = await experimentAPI.predictData(
				experimentName,
				formData
			)
			const { predictions } = data

			console.log('Prediction response', data)

			//TODO: xóa userConfirm và predictResult
			updateState({
				showUploadPanel: false,
				showPredictLayout: true,
				uploadedFiles: validFiles,
				predictResult: predictions,
			})

			switch (projectInfo.type) {
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
			{/* {isHasGraph &&
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
				})()} */}

			<div className="justify-center flex w-full items-center mt-5">
				<button
					className="btn"
					onClick={() => {
						updateState({ showUploadPanel: true })
					}}
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

					<span className="text">Predict New Data</span>
				</button>
			</div>

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
			{predictDataState.uploadedFiles.length > 0 &&
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
		</div>
	)
}

export default PredictData
