import React, { Fragment, useReducer, useState, useEffect } from 'react'
import instance from 'src/api/axios'
import { fetchWithTimeout } from 'src/utils/timeout'
import { API_URL } from 'src/constants/api'
import 'src/assets/css/chart.css'
const TextPredict = ({
	experimentName,
	projectInfo,
	stepFourState,
	updateState,
}) => {
	const [explainTextHTML, setExplainTextHTML] = useState('')
	const [sentence, setSentence] = useState('')

	const handleTextChange = (event) => {
		setSentence(event.target.value)
	}
	const handleSelectedText = async (item) => {
		updateState({
			selectedSentence: item.sentence,
		})
	}

	const handleExplainText = async (event) => {
		event.preventDefault()

		// TODO: fix hardcorded values
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
				const html = data.explain_html
				setExplainTextHTML(html)
				console.log(html)
				const parsedHTML = new DOMParser().parseFromString(
					html,
					'text/html'
				)
				const scriptContent =
					parsedHTML.querySelector('script').textContent
				// Create a script element
				const script = document.createElement('script')

				// Set the script content to execute
				script.textContent = scriptContent

				// Append the script element to the document body or head
				// You can choose where to append it based on your needs
				document.body.appendChild(script)

				console.log('Fetch successful')
			})
			.catch((error) => {
				console.error('Fetch error:', error.message)
				// Handle timeout or other errors here
				if (error.message === 'Request timed out') {
					console.log('The request took too long and was terminated.')
				}
			})
			.finally(() => {
				updateState({ isLoading: false })
			})
	}
	return (
		<div
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
							{console.log(
								'dataaaaa',
								stepFourState.uploadSentences
							)}
							<tbody className="bg-white divide-y divide-gray-200">
								{stepFourState.uploadSentences.map(
									(item, index) => (
										<tr
											key={index}
											onClick={() =>
												handleSelectedText(item)
											}
											className={`hover:bg-gray-100 cursor-pointer ${stepFourState.selectedSentence === item.sentence ? 'border-2 border-blue-500' : ''}`}
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
					<div
						style={{
							width: '100%',
							maxWidth: '1000px',
							padding: '20px',
							backgroundColor: '#f9f9f9',
							borderRadius: '8px',
							overflow: 'auto',
						}}
						dangerouslySetInnerHTML={{
							__html: explainTextHTML,
						}}
					></div>
				</div>
			) : (
				<p>Error</p>
			)}
		</div>
	)
}
export default TextPredict
