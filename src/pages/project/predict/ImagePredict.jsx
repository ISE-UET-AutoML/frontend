import React, { useState } from 'react'
import Loading from 'src/components/Loading'
import instance from 'src/api/axios'
import { fetchWithTimeout } from 'src/utils/timeout'
import { API_URL } from 'src/constants/api'
import SolutionImage from 'src/assets/images/Solution.png'

const ImagePredict = ({
	experimentName,
	projectInfo,
	stepFourState,
	updateState,
	handleFileChange,
}) => {
	const [explainImageUrl, setExplainImageUrl] = useState('')

	const handleSelectedImage = async (item) => {
		const fileIndex = stepFourState.uploadFiles.findIndex(
			(file) => file.name === item.name
		)
		updateState({
			selectedImage: item,
			confidenceScore: stepFourState.confidences[fileIndex].confidence,
			confidenceLabel: stepFourState.confidences[fileIndex].class,
		})

		setExplainImageUrl('')
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

	const handleExplainSelectedImage = async () => {
		const item = stepFourState.selectedImage

		const formData = new FormData()

		const model = await instance.get(API_URL.get_model(experimentName))
		const jsonObject = model.data
		if (!jsonObject) {
			console.error('Failed to get model info')
		}
		console.log(jsonObject)
		console.log(jsonObject.userEmail)
		console.log(jsonObject.projectName)
		console.log(jsonObject.runID)
		updateState({
			isLoading: true,
		})

		formData.append('userEmail', jsonObject.userEmail)
		formData.append('projectName', jsonObject.projectName)
		formData.append('runName', experimentName)
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

	return (
		<div
			className={`${
				stepFourState.showUploadModal
					? 'top-0 left-0 bottom-full z-[1000] opacity-100'
					: 'left-0 top-full bottom-0 opacity-0'
			} fixed h-screen w-full px-[30px]  bg-white  transition-all duration-500 ease overflow-auto pb-12`}
		>
			<button
				onClick={() => {
					// updateState(initialState)
					console.log('close')
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
			{stepFourState.uploadFiles.length > 0 &&
			stepFourState.showImageModal ? (
				<>
					<h1 class="mb-5 text-4xl font-extrabold text-gray-900 text-left mt-10 flex">
						<span class="text-transparent bg-clip-text bg-gradient-to-r to-[#1904e5] from-[#fab2ff] mr-2">
							Prediction
						</span>{' '}
						result
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
					</h1>
					<div className="flex h-[90%]">
						<div className="h-full  w-1/6 mr-5 overflow-y-auto">
							{stepFourState.uploadFiles.map((item, index) => (
								<div
									key={item.name + index}
									class={`${
										typeof stepFourState?.userConfirm[index]
											.value === 'string'
											? stepFourState?.userConfirm[index]
													.value === 'true'
												? 'border-2 border-green-500 border-solid'
												: 'border-2 border-red-600 border-solid'
											: ''
									}
				          ${index < stepFourState.uploadFiles.length - 1 ? (stepFourState.selectedImage.name === item.name ? 'border-2 !border-[#CCCCFF] border-solid' : '') : ''}
				           rounded-[5px] h-[130px] min-w-[200px] p-2 flex bg-gray-100 justify-center my-2`}
									onClick={() => handleSelectedImage(item)}
								>
									<img
										src={URL.createObjectURL(item)}
										alt=""
										className="object-cover  rounded-[8px]"
									/>
								</div>
							))}
						</div>
						<div className=" grid grid-cols-3 grid-rows-4 gap-4 w-5/6 ">
							<div className="col-span-2 row-span-4 shadow-xl p-4 rounded-lg">
								{stepFourState.selectedImage && (
									<img
										src={URL.createObjectURL(
											stepFourState.selectedImage
										)}
										alt=""
										className="object-cover w-full h-[75%] rounded-md"
									/>
								)}
								<p className="text-left text-[#1904e5] font-semibold text-4xl text-transform: uppercase mt-4 mb-3">
									{stepFourState.confidenceLabel}
								</p>
								<article className="text-balance">
									Predicting data is susceptible to errors for
									several reasons, including{' '}
									<a class="underline decoration-indigo-500">
										incomplete or noisy datasets, biases in
										the training data, and limitations in
										the model’s algorithms.
									</a>{' '}
									These issues can cause inaccurate
									predictions, which underscores the
									importance of thorough data preprocessing,
									and continuous evaluation to reduce
									potential errors and improve prediction
									accuracy.
								</article>
							</div>
							<div className="col-span-1 row-span-3 grid grid-cols-1 grid-rows-4 gap-4">
								<div className="row-span-1 flex items-center justify-center space-x-4">
									<div className="row-span-1 flex items-center justify-center space-x-12">
										<button
											onClick={(e) =>
												handleConfirmImage('true')
											}
											className="border-2 border-green-500 bg-white p-3 shadow-xl hover:bg-gray-100 active:bg-gray-200 transition ease-in-out duration-300 rounded-lg"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="w-4 h-4 text-green-500"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</button>

										<button
											onClick={(e) =>
												handleExplainSelectedImage()
											}
											className="border-2 border-blue-500 bg-white p-3 shadow-xl hover:bg-gray-100 active:bg-gray-200 transition ease-in-out duration-300 rounded-lg"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="w-4 h-4 text-blue-500"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 8v4.5m0 2.5h.01m6 4.5H6a2 2 0 01-2-2V4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2z"
												/>
											</svg>
										</button>

										<button
											onClick={(e) =>
												handleConfirmImage('false')
											}
											className="border-2 border-red-500 bg-white p-3 shadow-xl hover:bg-gray-100 active:bg-gray-200 transition ease-in-out duration-300 rounded-lg"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="w-4 h-4 text-red-500"
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
										</button>
									</div>
								</div>

								<div className="row-span-3 rounded-lg items-center justify-center">
									<article className=" text-center h-max mb-2">
										The explanation provided is based
										specifically on the
										<a
											target="_blank"
											href="https://lime-ml.readthedocs.io/en/latest/lime.html"
											class="hover:underline hover:decoration-indigo-500 font-semibold"
										>
											{' '}
											LIME
										</a>{' '}
										explainer methodology.
									</article>
									{!stepFourState.userConfirm.some(
										(item) => item.value === null
									) && (
										<button
											type="button"
											onClick={(e) => {
												updateState({
													showResultModal: true,
												})
											}}
											className="h-max mx-auto block w-fit relative items-center justify-center p-1 px-5 py-3 overflow-hidden font-medium text-indigo-600 rounded-lg shadow-2xl group"
										>
											<span className="absolute top-0 left-0 w-40 h-40 -mt-10 -ml-3 transition-all duration-700 bg-blue-500 rounded-full blur-md ease"></span>
											<span className="absolute inset-0 w-full h-full transition duration-700 group-hover:rotate-180 ease">
												<span className="absolute bottom-0 left-0 w-24 h-24 -ml-10 bg-purple-500 rounded-full blur-md"></span>
												<span className="absolute bottom-0 right-0 w-24 h-24 -mr-10 bg-pink-500 rounded-full blur-md"></span>
											</span>
											<span className="relative text-white">
												Effectiveness
											</span>
										</button>
									)}
									<div className="mt-2">
										<img
											src={
												explainImageUrl
													? explainImageUrl
													: SolutionImage
											}
											alt="Explain"
											className="rounded-lg shadow-lg w-full object-cover"
										/>
									</div>
								</div>
							</div>
							<div className="col-span-1 row-span-1  shadow-2xl p-4 rounded-lg bg-white">
								<h1 className="text-xl font-bold mb-2">
									Confident Score
								</h1>
								<p className="px-4 py-2 text-6xl text-transparent bg-clip-text bg-gradient-to-r to-[#1904e5] from-[#fab2ff] rounded-lg text-center">
									{parseFloat(
										stepFourState.confidenceScore
									).toFixed(2)}
								</p>
							</div>
						</div>
					</div>
				</>
			) : (
				<label
					htmlFor="file"
					onClick={() => updateState({ showPredictModal: true })}
					// for="file"
					className="flex flex-col w-[95%] cursor-pointer mt-24 shadow justify-between mx-auto items-center p-[10px] gap-[5px] bg-[rgba(0,110,255,0.041)] h-[300px] rounded-[10px] "
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
			)}
		</div>
	)
}

export default ImagePredict
