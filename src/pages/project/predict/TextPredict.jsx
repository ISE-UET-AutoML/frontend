import React, { Fragment, useReducer, useState, useEffect } from 'react'
import instance from 'src/api/axios'
import { fetchWithTimeout } from 'src/utils/timeout'
import { API_URL } from 'src/constants/api'
import 'src/assets/css/chart.css'
import SolutionImage from 'src/assets/images/Solution.png'
import Loading from 'src/components/Loading'

const TextPredict = ({
	experimentName,
	projectInfo,
	stepFourState,
	updateState,
}) => {
	const [sentence, setSentence] = useState('')
	const [explanation, setExplanation] = useState(null)
	const [selectedClass, setHighlightedClass] = useState(0)

	const handleTextChange = (event) => {
		setSentence(event.target.value)
	}
	const handleSelectedText = async (item) => {
		updateState({
			selectedSentence: item.sentence,
		})
	}

	const handleHighlight = (selectedClass) => {
		setHighlightedClass(selectedClass)
	}

	const shouldHighlight = (word) => {
		const currrentClassWords = explanation.find(
			(item) => item.class === selectedClass
		).words
		return currrentClassWords.includes(word)
	}

	const handleExplainText = async (event) => {
		event.preventDefault()

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
		formData.append('runName', experimentName)
		formData.append('text', stepFourState.selectedSentence)

		console.log('Fetching explain text')

		const url = `${process.env.REACT_APP_EXPLAIN_URL}/text_prediction/explain`

		const options = {
			method: 'POST',
			body: formData,
		}

		fetchWithTimeout(url, options, 60000)
			.then((data) => {
				setExplanation(data.explanations)
				console.log(data.explanations)
			})
			.catch((error) => {
				console.error('Fetch error:', error.message)
			})
			.finally(() => {
				updateState({ isLoading: false })
			})
	}

	return (
		<>
			{/* <div
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
												className={`hover:bg-gray-100 cursor-pointer ${stepFourState.selectedSentence === item.sentence ? 'border-2 border-blue-500 bg-blue-100 font-bold' : ''}`}
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
						{explanation ? (
							<div>
								<div>
									<p>
										{stepFourState.selectedSentence
											.split(/[\s,]+/)
											.map((word, index) => (
												<>
													<span
														key={index}
														className={
															shouldHighlight(
																word
																	.replace(
																		/[()]/g,
																		''
																	)
																	.trim()
															)
																? 'highlight'
																: ''
														}
														style={
															shouldHighlight(
																word
																	.replace(
																		/[()]/g,
																		''
																	)
																	.trim()
															)
																? {
																		backgroundColor:
																			'yellow',
																	}
																: {}
														}
													>
														{word}
													</span>
													<span> </span>
												</>
											))}
									</p>
								</div>
								<div>
									{explanation.map((item, index) => (
										<button
											className={`px-4 py-2 m-2 border rounded ${
												selectedClass === item.class
													? 'bg-blue-500 text-white'
													: 'bg-gray-200'
											}`}
											key={index}
											onClick={() =>
												handleHighlight(item.class)
											}
										>
											Highlight Class {item.class}
										</button>
									))}
								</div>
							</div>
						) : (
							<p>No explanation</p>
						)}
					</div>
				) : (
					<p>Error</p>
				)}
			</div> */}

			<div
				className={`${
					stepFourState.showTextModal
						? 'top-0 left-0 bottom-full z-[1000] opacity-100'
						: 'left-0 top-full bottom-0 opacity-0'
				} fixed h-full w-full px-[30px]  bg-white  transition-all duration-500 ease overflow-auto pb-[30px]`}
			>
				<button
					onClick={() => {
						// updateState(initialState)
						console.log('close')
					}}
					className="absolute top-[0.25rem] right-5 p-[6px] rounded-lg bg-white hover:bg-gray-300 hover:text-white font-[600] w-[40px] h-[40px]"
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

				{stepFourState.showTextModal ? (
					<div className="w-full h-full">
						{/* HEADER */}
						<div className="flex items-center mb-5">
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

							<button
								type="button"
								onClick={(e) => {
									updateState({
										showResultModal: true,
									})
								}}
								className="h-max ml-auto block w-fit relative mt-[2.25rem]  p-1 px-5 py-3 overflow-hidden font-medium text-indigo-600 rounded-lg shadow-2xl group"
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
						</div>
						<div className="grid grid-cols-4 grid-rows-5 gap-4 h-[85%]">
							{/* TABLE */}
							<div className="col-span-4 row-span-3 max-h-96 overflow-y-auto rounded-lg shadow-lg">
								<div className="sticky top-0 bg-blue-100">
									<table className="min-w-full table-auto border-collapse rounded-lg overflow-hidden">
										<thead>
											<tr>
												<th className="px-4 py-2 text-left w-[60%]">
													Sentence
												</th>
												<th className="px-4 py-2 text-center">
													Accuracy Rate
												</th>
												<th className="px-4 py-2 text-center">
													Predict
												</th>
											</tr>
										</thead>
									</table>
								</div>
								<table className="min-w-full table-auto border-collapse rounded-lg overflow-hidden">
									<tbody>
										{stepFourState.uploadSentences.map(
											(item, index) => (
												<tr
													key={index}
													onClick={() =>
														handleSelectedText(item)
													}
													className={`hover:bg-gray-100 cursor-pointer ${
														stepFourState.selectedSentence ===
														item.sentence
															? ' border-blue-500 bg-blue-100 font-bold'
															: ''
													}`}
												>
													<td className="px-6 py-4 text-sm font-medium text-gray-900 break-words w-[60%] text-left">
														{item.sentence}
													</td>
													<td className="px-6 py-4 text-sm text-gray-900 text-center">
														{item.confidence}
													</td>
													<td className="px-6 py-4 text-sm text-gray-900 text-center">
														{item.label}
													</td>
												</tr>
											)
										)}
									</tbody>
								</table>
							</div>

							{/* BUTTONS + DESCRIPTION */}
							<div className="col-span-3 row-span-2 rounded-lg shadow-xl">
								<div className="flex items-center justify-center space-x-20 mt-2">
									<button className="border-2 border-green-500 bg-white p-3 shadow-xl hover:bg-gray-100 active:bg-gray-200 transition ease-in-out duration-300 rounded-lg">
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
										onClick={handleExplainText}
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

									<button className="border-2 border-red-500 bg-white p-3 shadow-xl hover:bg-gray-100 active:bg-gray-200 transition ease-in-out duration-300 rounded-lg">
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
								<div className="items-center mx-auto justify-center p-8 text-2xl text-center">
									{explanation ? (
										<div>
											<div>
												<p className="leading-loose">
													{stepFourState.selectedSentence
														.split(/[\s,]+/)
														.map((word, index) => (
															<>
																<span
																	key={index}
																	className={
																		shouldHighlight(
																			word
																				.replace(
																					/[()]/g,
																					''
																				)
																				.trim()
																		)
																			? 'highlight'
																			: ''
																	}
																	style={
																		shouldHighlight(
																			word
																				.replace(
																					/[()]/g,
																					''
																				)
																				.trim()
																		)
																			? {
																					backgroundColor:
																						'#4f46e5',
																					color: 'white',
																					paddingLeft:
																						'0.5rem',
																					paddingRight:
																						'0.5rem',
																					paddingTop:
																						'0.25rem',
																					paddingBottom:
																						'0.25rem',
																					borderRadius:
																						'0.5rem',
																				}
																			: {}
																	}
																>
																	{word}
																</span>
																<span> </span>
															</>
														))}
												</p>
											</div>
											<div>
												{explanation.map(
													(item, index) => (
														<button
															className={`px-4 py-2 m-2 border rounded ${
																selectedClass ===
																item.class
																	? 'bg-blue-500 text-white'
																	: 'bg-gray-200'
															}`}
															key={index}
															onClick={() =>
																handleHighlight(
																	item.class
																)
															}
														>
															Class {item.class}
														</button>
													)
												)}
											</div>
										</div>
									) : (
										<p>No explanation</p>
									)}
								</div>
							</div>

							{/* IMAGE */}
							<div className="col-span-1 row-span-2 rounded-lg shadow-xl">
								<img
									src={SolutionImage}
									alt="Explain"
									className="rounded-lg w-full h-full object-cover"
								/>
							</div>
						</div>
					</div>
				) : (
					<div>Error</div>
				)}
			</div>
		</>
	)
}
export default TextPredict
