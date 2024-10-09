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
			<h1 className=" mt-6 mb-6 text-5xl font-extrabold leading-none tracking-tight text-gray-900">
				Model{' '}
				<mark className="px-2 text-white bg-blue-600 rounded ">
					Prediction
				</mark>{' '}
				results
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
								className="object-cover rounded-[8px]"
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
						<p className="text-center font-semibold text-6xl uppercase mt-10 mb-2">
							{predictDataState.confidenceLabel}
						</p>
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
