import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
import PieGraph from 'src/components/PieGraph'

const MultimodalPredict = (props) => {
	const { experimentName, projectInfo, predictDataState, updateProjState } =
		props

	const [csvData, setCsvData] = useState([])
	const [selectedData, setSelectedData] = useState({ index: 0 })
	const [showAllRows, setShowAllRows] = useState(false)
	const [falsePredict, setFalsePredict] = useState([])
	const [pieData, setPieData] = useState([])
	const [isShowEff, setIsShowEff] = useState(false)

	useEffect(() => {
		const falseValue =
			csvData.length > 0
				? ((falsePredict.length / csvData.length) * 100).toFixed(2)
				: 0
		const trueValue = (100 - parseFloat(falseValue)).toFixed(2)

		setPieData([
			{ name: 'Correct', value: parseFloat(trueValue) },
			{ name: 'Incorrect', value: parseFloat(falseValue) },
		])
	}, [falsePredict, csvData])

	useEffect(() => {
		if (
			predictDataState.uploadedFiles &&
			predictDataState.uploadedFiles[0].name.endsWith('.csv')
		) {
			const reader = new FileReader()

			reader.onload = () => {
				Papa.parse(reader.result, {
					header: true,
					skipEmptyLines: true,
					complete: ({ data }) => {
						setCsvData(data)
						setSelectedData((prev) => ({
							...prev,
							...data[0],
						}))
						predictDataState.predictResult.map((row, index) => {
							if (
								row.confidence < 0.5 &&
								!falsePredict.includes(index)
							) {
								setFalsePredict((prev) => [...prev, index])
							}
						})
					},
				})
			}

			reader.readAsText(predictDataState.uploadedFiles[0])
		}
	}, [predictDataState.uploadedFiles])

	const capitalizeFirstLetter = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
	}

	const backCard = (index) => {
		if (index > 0) {
			setSelectedData(() => ({
				index: index - 1,
				...csvData[index - 1],
			}))
		}
	}

	const nextCard = (index) => {
		setSelectedData(() => ({
			index: index + 1,
			...csvData[index + 1],
		}))
	}

	const getTranslateValue = () => {
		return `translateX(-${selectedData.index * 100}%)`
	}

	return (
		<>
			{/* TITLE */}
			<h1 className=" mt-6 mb-6 text-5xl font-extrabold leading-none tracking-tight text-gray-900">
				Model{' '}
				<mark className="px-2 text-white bg-blue-600 rounded ">
					Prediction
				</mark>{' '}
				results
			</h1>
			{/* CARD */}
			{selectedData && (
				<div className="flex w-full h-[78%] space-x-3">
					{/* LEFT BUTTON */}
					<div
						className="flex justify-between items-center"
						hidden={selectedData.index === 0}
					>
						{selectedData.index > 0 && (
							<button
								onClick={() => backCard(selectedData.index)}
								className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="w-6 h-6"
								>
									<path
										fillRule="evenodd"
										d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						)}
					</div>
					{/* CONTAINER */}
					<div className="overflow-hidden w-full h-[570px] shadow-xl border-2 rounded-lg">
						<div
							className="flex transition-transform duration-500 ease-in-out"
							style={{ transform: getTranslateValue() }}
						>
							{csvData.map((data, index) => (
								<div
									key={index}
									className="flex-none w-full h-[570px] rounded-lg"
								>
									<div className="flex h-full w-full relative">
										{/* MAIN IMAGE */}
										<div className="h-[500px] w-[420px] ml-[70px] mt-[30px] shadow-xl rounded-md">
											<img
												src={data.url_thumbnail}
												alt=""
												className="object-cover w-full h-full rounded-md"
											/>
										</div>
										<div className="w-[50%] space-y-4 mt-[30px] ml-10">
											{/* LABEL */}
											<p className="text-center font-semibold text-6xl uppercase mt-4 mb-2">
												{
													predictDataState
														.predictResult[index]
														.class
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
															predictDataState
																.predictResult[
																index
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
																predictDataState
																	.predictResult[
																	index
																].confidence *
																100
															}%`,
														}}
													></div>
												</div>
											</div>
											{/* TABLE */}
											<div className="mb-6 rounded-lg border-2 border-slate-50 overflow-hidden">
												<div
													className={
														showAllRows
															? 'max-h-[200px] overflow-y-auto  [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300'
															: ''
													}
												>
													<table className="min-w-full divide-y divide-gray-200 rounded-lg break-words">
														<thead className="bg-gradient-to-r bg-blue-600 font-bold rounded-lg">
															<tr>
																<td className="px-6 py-1 text-center text-sm font-bold text-white uppercase tracking-wider w-[15%]">
																	Fields
																</td>
																<td className="px-6 py-1 text-center text-sm font-bold text-white uppercase tracking-wider w-[50%]">
																	Information
																</td>
															</tr>
														</thead>
														<tbody className="bg-white divide-y divide-gray-200">
															<tr className="hover:bg-gray-100 break-words">
																<td className="pl-4 text-left text-sm font-bold">
																	{capitalizeFirstLetter(
																		'name'
																	)}
																</td>
																<td>
																	{
																		data[
																			'name'
																		]
																	}
																</td>
															</tr>
															<tr className="hover:bg-gray-100 break-words">
																<td className="pl-4 text-left text-sm font-bold">
																	{capitalizeFirstLetter(
																		'product base id'
																	)}
																</td>
																<td>
																	{
																		data[
																			'product_base_id'
																		]
																	}
																</td>
															</tr>
															{!showAllRows ? (
																<></>
															) : (
																<>
																	{Object.keys(
																		data
																	)
																		.filter(
																			(
																				key
																			) =>
																				key !==
																					'name' &&
																				key !==
																					'product_base_id'
																		)
																		.map(
																			(
																				key
																			) => (
																				<tr
																					className="hover:bg-gray-100 break-words"
																					key={
																						key
																					}
																				>
																					<td className="pl-4 text-left text-sm font-bold break-words">
																						{capitalizeFirstLetter(
																							key
																						)}
																					</td>
																					<td className="text-left text-sm break-words">
																						{
																							data[
																								key
																							]
																						}
																					</td>
																				</tr>
																			)
																		)}
																</>
															)}
														</tbody>
													</table>
												</div>
												<div className="justify-center items-center text-center mt-4">
													<button
														className=" font-semibold"
														onClick={() =>
															setShowAllRows(
																!showAllRows
															)
														}
													>
														<svg
															data-accordion-icon
															className={`w-3 h-3 shrink-0 ml-2 transition-transform duration-300 ${showAllRows ? 'rotate-0' : 'rotate-180'}`}
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 10 6"
														>
															<path
																stroke="currentColor"
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2"
																d="M9 5 5 1 1 5"
															/>
														</svg>
													</button>
												</div>
											</div>

											{/* BUTTON CONFIRM */}
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
															setFalsePredict(
																(prev) =>
																	prev.filter(
																		(
																			item
																		) =>
																			item !==
																			selectedData.index
																	)
															)
														} else {
															setFalsePredict(
																(prev) => [
																	...prev,
																	selectedData.index,
																]
															)
														}
													}}
												>
													{falsePredict.includes(
														selectedData.index
													)
														? 'Correct'
														: 'Incorrect'}
												</button>
											</div>
										</div>
										<div className="absolute w-[50px] h-[50px] right-10 bottom-0">
											<button
												type="button"
												onClick={() => {
													setIsShowEff(true)
												}}
												className=" bg-blue-600 rounded-md px-2 py-1 font-medium  text-white w-fit transition-all hover:text-blue-600 hover:bg-white hover:border-2 hover:border-blue-600"
											>
												Accuracy
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
					{/* RIGHT BUTTON */}
					<div className="flex justify-between items-center">
						{selectedData.index < csvData.length - 1 && (
							<button
								onClick={() => nextCard(selectedData.index)}
								className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="w-6 h-6"
								>
									<path
										fillRule="evenodd"
										d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						)}
					</div>
				</div>
			)}

			{/* LIST IMAGE */}
			<div className="w-[75%] h-[8%] ml-[180px] mt-2 flex overflow-y-auto space-x-4">
				{csvData.map((data, index) => (
					<img
						key={index}
						src={data.url_thumbnail}
						alt=""
						className={`h-full object-cover rounded-lg cursor-pointer
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

export default MultimodalPredict
