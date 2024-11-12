import React, { useState, useEffect } from 'react'
import PieGraph from 'src/components/PieGraph'
import SolutionImage from 'src/assets/images/Solution.png'
import * as experimentAPI from 'src/api/experiment'

const ImagePredict = (props) => {
	const { experimentName, projectInfo, predictDataState, updateProjState } =
		props
	const [selectedData, setSelectedData] = useState({ index: 0 })
	const [falsePredict, setFalsePredict] = useState([])
	const [explainImageUrl, setExplainImageUrl] = useState(
		Array(predictDataState.uploadedFiles.length).fill(SolutionImage)
	)
	const [pieData, setPieData] = useState([])
	const [isShowEff, setIsShowEff] = useState(false)

	useEffect(() => {
		if (
			predictDataState.uploadedFiles.length > 0 &&
			explainImageUrl.length === 0
		) {
			setExplainImageUrl(
				Array(predictDataState.uploadedFiles.length).fill(SolutionImage)
			)
		}
	}, [predictDataState.uploadedFiles])

	// If confidence score < 50% => false
	useEffect(() => {
		if (predictDataState.predictResult) {
			predictDataState.predictResult.map((row, index) => {
				if (row.confidence < 0.5 && !falsePredict.includes(index)) {
					setFalsePredict((prev) => [...prev, index])
				}
			})
		}
	}, [])

	// Handling Pie Data
	useEffect(() => {
		const falseValue =
			predictDataState.uploadedFiles.length > 0
				? (
						(falsePredict.length /
							predictDataState.uploadedFiles.length) *
						100
					).toFixed(2)
				: 0
		const trueValue = (100 - parseFloat(falseValue)).toFixed(2)

		setPieData([
			{ name: 'Correct', value: parseFloat(trueValue) },
			{ name: 'Incorrect', value: parseFloat(falseValue) },
		])
	}, [falsePredict, predictDataState.uploadedFiles])

	const handleExplainSelectedImage = async (index) => {
		const formData = new FormData()

		updateProjState({
			isLoading: true,
		})

		formData.append('files', predictDataState.uploadedFiles[index])
		formData.append('task', projectInfo.type)
		try {
			const { data } = await experimentAPI.explainData(
				experimentName,
				formData
			)
			const base64ImageString = data.explanation
			const fetchedImageUrl = `data:image/jpeg;base64,${base64ImageString}`

			// Update the explainImageUrl array for the clicked image
			setExplainImageUrl((prev) => {
				const updatedArray = [...prev]
				updatedArray[index] = fetchedImageUrl
				return updatedArray
			})

			console.log('Fetch successful')

			updateProjState({ isLoading: false })
		} catch (error) {
			console.error('Fetch error:', error.message)
			updateProjState({ isLoading: false })
		}
	}

	return (
		<>
			{/* HEADER */}
			<h1 className=" mt-6 mb-6 text-5xl font-extrabold leading-none tracking-tight text-gray-900">
				Model{' '}
				<mark className="px-2 text-white bg-blue-600 rounded ">
					Prediction
				</mark>{' '}
				results
			</h1>
			{predictDataState.uploadedFiles && (
				<div className="flex h-[87%]">
					{/* LIST IMAGES */}
					<div className="h-full w-1/6 mr-5 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 space-y-4">
						{predictDataState.uploadedFiles.map((data, index) => (
							<img
								key={index}
								src={URL.createObjectURL(data)}
								alt=""
								className={`h-[130px] object-cover rounded-lg cursor-pointer
						 ${selectedData.index === index ? 'border-2 border-blue-500 opacity-100' : 'opacity-50 hover:opacity-100'}
						 ${falsePredict.includes(index) ? 'border-2 border-red-500' : ''}
						`}
								onClick={() =>
									setSelectedData({
										index: index,
										...data,
									})
								}
							/>
						))}
					</div>
					<div className=" grid grid-cols-3 grid-rows-4 gap-4 w-5/6 ">
						<div className="col-span-2 row-span-4 shadow-xl p-4 rounded-lg">
							{/* MAIN IMAGE */}

							<img
								src={URL.createObjectURL(
									predictDataState.uploadedFiles[
										selectedData.index
									]
								)}
								alt=""
								className="object-cover w-full h-[75%] rounded-md"
							/>

							{/* LABEL */}
							<p className="text-center font-semibold text-6xl uppercase mt-10 mb-2">
								{
									predictDataState.predictResult[
										selectedData.index
									].class
								}
							</p>
							{/* PROGRESS BAR */}
							<div className="w-full mb-14">
								<div className="flex justify-between mb-1">
									<span className="text-base font-medium text-blue-700">
										Confidence Score
									</span>
									<span className="text-sm font-medium text-blue-700 ">
										{Math.round(
											predictDataState.predictResult[
												selectedData.index
											].confidence * 100
										)}
										%
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2.5 ">
									<div
										className="bg-blue-600 h-2.5 rounded-full"
										style={{
											width: `${
												predictDataState.predictResult[
													selectedData.index
												].confidence * 100
											}%`,
										}}
									></div>
								</div>
							</div>
						</div>
						{/* EXPLAIN */}
						<div className="col-span-1 row-span-3 grid grid-cols-1 grid-rows-4 gap-4">
							{/* ACCURACY BUTTON */}
							<div className="rows-span-1">
								<button
									type="button"
									onClick={() => {
										setIsShowEff(true)
									}}
									className="w-full h-full bg-blue-600 rounded-md text-2xl px-2 py-1 font-medium  text-white transition-all hover:text-blue-600 hover:bg-white hover:border-2 hover:border-blue-600"
								>
									Accuracy
								</button>
							</div>
							<div className="row-span-3 rounded-lg items-center justify-center">
								<article className=" text-center h-max mb-2">
									The explanation provided is based
									specifically on the
									<a
										target="_blank"
										href="https://lime-ml.readthedocs.io/en/latest/lime.html"
										className="hover:underline hover:decoration-indigo-500 font-semibold"
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
										onClick={() =>
											handleExplainSelectedImage(
												selectedData.index
											)
										}
										className="h-max mx-auto block w-fit relative items-center justify-center p-1 px-5 py-3 overflow-hidden font-medium text-indigo-600 rounded-lg shadow-2xl group"
									>
										<span className="absolute top-0 left-0 w-40 h-40 -mt-10 -ml-3 transition-all duration-700 bg-blue-500 rounded-full blur-md ease"></span>
										<span className="absolute inset-0 w-full h-full transition duration-700 group-hover:rotate-180 ease">
											<span className="absolute bottom-0 left-0 w-24 h-24 -ml-10 bg-purple-500 rounded-full blur-md"></span>
											<span className="absolute bottom-0 right-0 w-24 h-24 -mr-10 bg-pink-500 rounded-full blur-md"></span>
										</span>
										<span className="relative text-white">
											Explain AI
										</span>
									</button>
								)}
								<div className="mt-2">
									<img
										src={
											explainImageUrl[selectedData.index]
										}
										alt="Explain"
										className="rounded-lg shadow-lg w-full object-cover"
									/>
								</div>
							</div>
						</div>
						{/* BUTTON CONFIRM */}
						<div className="col-span-1 row-span-1  shadow-2xl p-4 rounded-lg bg-white">
							<div className="justify-center items-center text-center pt-[20px] h-max">
								<h1 className="text-xl font-bold mb-4">
									Is the prediction accurate?
								</h1>
								<button
									className={` rounded-md px-6 py-2 font-medium  text-white w-fit transition-all 			
									${falsePredict.includes(selectedData.index) ? 'bg-emerald-400 hover:text-emerald-400 hover:bg-white hover:border-2 hover:border-emerald-400' : 'bg-red-500 hover:text-red-400 hover:bg-white hover:border-2 hover:border-red-400'}`}
									onClick={() => {
										if (
											falsePredict.includes(
												selectedData.index
											)
										) {
											setFalsePredict((prev) =>
												prev.filter(
													(item) =>
														item !==
														selectedData.index
												)
											)
										} else {
											setFalsePredict((prev) => [
												...prev,
												selectedData.index,
											])
										}
									}}
								>
									{falsePredict.includes(selectedData.index)
										? 'Correct'
										: 'Incorrect'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{isShowEff && (
				<div className="overlay">
					<div className="modal w-[50%] h-[75%] rounded-xl relative">
						<h1 className=" mt-6 text-4xl font-extrabold leading-none tracking-tight text-gray-900">
							Accuracy
						</h1>
						<button
							onClick={() => {
								setIsShowEff(false)
							}}
							className="absolute top-[0.55rem] right-5 p-[6px] rounded-full bg-red-400 hover:bg-gray-300 hover:text-white font-[600] w-[40px] h-[40px]"
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
						<PieGraph data={pieData} />
					</div>
				</div>
			)}
		</>
	)
}

export default ImagePredict
