import React, { useState } from 'react'
import SolutionImage from 'src/assets/images/Solution.png'
import * as experimentAPI from 'src/api/experiment'

const ImagePredict = ({
	experimentName,
	projectInfo,
	predictDataState,
	updateState,
}) => {
	const [explainImageUrl, setExplainImageUrl] = useState('')

	const handleSelectedImage = async (item) => {
		const fileIndex = predictDataState.uploadFiles.findIndex(
			(file) => file.name === item.name
		)
		updateState({
			selectedImage: item,
			confidenceScore: predictDataState.confidences[fileIndex].confidence,
			confidenceLabel: predictDataState.confidences[fileIndex].class,
		})

		setExplainImageUrl('')
	}

	const handleConfirmImage = (value) => {
		const currentImageSelectedIndex =
			predictDataState.uploadFiles.findIndex(
				(file) => file.name === predictDataState.selectedImage.name
			)

		const nextIdx =
			currentImageSelectedIndex ===
			predictDataState.uploadFiles.length - 1
				? currentImageSelectedIndex
				: currentImageSelectedIndex + 1

		setExplainImageUrl('')
		updateState({
			userConfirm: predictDataState.userConfirm.map((item, index) => {
				if (index === currentImageSelectedIndex) {
					return { ...item, value: value }
				}
				return item
			}),
			selectedImage: predictDataState.uploadFiles[nextIdx],
			confidenceScore: parseFloat(
				predictDataState.confidences[nextIdx].confidence
			),
			confidenceLabel: predictDataState.confidences[nextIdx].class,
		})
	}

	const handleExplainSelectedImage = async () => {
		const formData = new FormData()

		updateState({
			isLoading: true,
		})

		formData.append('files', predictDataState.selectedImage)
		formData.append('task', projectInfo.type)
		try {
			const { data } = await experimentAPI.explainData(
				experimentName,
				formData
			)
			const base64ImageString = data.explanation
			const fetchedImageUrl = `data:image/jpeg;base64,${base64ImageString}`

			setExplainImageUrl(fetchedImageUrl)

			console.log('Fetch successful')

			updateState({ isLoading: false })
		} catch (error) {
			console.error('Fetch error:', error.message)
			updateState({ isLoading: false })
		}
	}

	return (
		<>
			<h1 className="mb-5 text-4xl font-extrabold text-gray-900 text-left mt-10 flex">
				<span className="text-transparent bg-clip-text bg-gradient-to-r to-[#1904e5] from-[#fab2ff] mr-2">
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
					{predictDataState.uploadFiles.map((item, index) => (
						<div
							key={item.name + index}
							class={`${
								typeof predictDataState?.userConfirm[index]
									.value === 'string'
									? predictDataState?.userConfirm[index]
											.value === 'true'
										? 'border-2 border-green-500 border-solid'
										: 'border-2 border-red-600 border-solid'
									: ''
							}
				          ${index < predictDataState.uploadFiles.length - 1 ? (predictDataState.selectedImage.name === item.name ? 'border-2 !border-[#CCCCFF] border-solid' : '') : ''}
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
						{predictDataState.selectedImage && (
							<img
								src={URL.createObjectURL(
									predictDataState.selectedImage
								)}
								alt=""
								className="object-cover w-full h-[75%] rounded-md"
							/>
						)}
						<p className="text-left text-[#1904e5] font-semibold text-4xl text-transform: uppercase mt-4 mb-3">
							{predictDataState.confidenceLabel}
						</p>
						<article className="text-balance">
							Predicting data is susceptible to errors for several
							reasons, including{' '}
							<a
								href="/#"
								class="underline decoration-indigo-500"
							>
								incomplete or noisy datasets, biases in the
								training data, and limitations in the model’s
								algorithms.
							</a>{' '}
							These issues can cause inaccurate predictions, which
							underscores the importance of thorough data
							preprocessing, and continuous evaluation to reduce
							potential errors and improve prediction accuracy.
						</article>
					</div>
					<div className="col-span-1 row-span-3 grid grid-cols-1 grid-rows-4 gap-4">
						<div className="row-span-1 flex items-center justify-center space-x-4">
							<div className="row-span-1 flex items-center justify-center space-x-12">
								<button
									onClick={(e) => handleConfirmImage('true')}
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
									onClick={(e) => handleConfirmImage('false')}
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
								The explanation provided is based specifically
								on the
								<a
									target="_blank"
									href="https://lime-ml.readthedocs.io/en/latest/lime.html"
									class="hover:underline hover:decoration-indigo-500 font-semibold"
									rel="noopener noreferrer"
								>
									{' '}
									LIME
								</a>{' '}
								explainer methodology.
							</article>
							{!predictDataState.userConfirm.some(
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
								predictDataState.confidenceScore
							).toFixed(2)}
						</p>
					</div>
				</div>
			</div>
		</>
	)
}

export default ImagePredict
