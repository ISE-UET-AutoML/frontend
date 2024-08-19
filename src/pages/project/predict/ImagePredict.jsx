import React, { useState } from 'react'
import Loading from 'src/components/Loading'
import instance from 'src/api/axios'
import { fetchWithTimeout } from 'src/utils/timeout'
import { API_URL } from 'src/constants/api'

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
	// EXPLAIN FOR TEXT
	return (
		<>
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
				{stepFourState.uploadFiles.length > 0 &&
				stepFourState.showImageModal ? (
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
														key={item.name + index}
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

export default ImagePredict
