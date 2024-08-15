import React, { Fragment, useReducer, useState } from 'react'
import { fetchWithTimeout } from 'src/utils/timeout'
import { explainInstance } from 'src/api/project'
import parse from 'html-react-parser'

const TestPredict = (props) => {
	const [explainImageUrl, setExplainImageUrl] = useState('')
	const [selectedImageFile, setSelectedImageFile] = useState(null)
	const [selectedTextFile, setSelectedTextFile] = useState(null)

	const handlePredictSelectedImage = async (event) => {
		event.preventDefault()
		console.log('Executing')
		const item = event.target.elements.file.files[0]

		// TODO: fix hardcorded values
		const formData = new FormData()
		formData.append('userEmail', 'darklord1611')
		formData.append('projectName', '66bdc72c8197a434278f525d')
		formData.append('runName', 'ISE')
		formData.append('image', item)

		const url = `${process.env.REACT_APP_EXPLAIN_URL}/image_classification/temp_predict`

		const options = {
			method: 'POST',
			body: formData,
		}

		fetchWithTimeout(url, options, 60000)
			.then((data) => {
				const base64_image_str = data.explain_image
				const explain_image_str = `data:image/jpeg;base64,${base64_image_str}`
				setExplainImageUrl(explain_image_str)
				console.log('Fetch successful')
			})
			.catch((error) => {
				console.error('Fetch error:', error.message)
				// Handle timeout or other errors here
				if (error.message === 'Request timed out') {
					console.log('The request took too long and was terminated.')
				}
			})
	}

	const handleImageFileChange = (event) => {
		const file = event.target.files[0]
		setSelectedImageFile(file)
		setExplainImageUrl('')
	}

	const handleTextFileChange = (event) => {
		const file = event.target.files[0]
		setSelectedTextFile(file)
	}

	const handlePredictText = async (event) => {
		event.preventDefault()

		// TODO: fix hardcorded values
		const formData = new FormData()
		formData.append('userEmail', 'darklord1611')
		formData.append('projectName', '66bdc72c8197a434278f525d')
		formData.append('runName', 'ISE')
		formData.append('csv_file', selectedTextFile)

		const url = `${process.env.REACT_APP_EXPLAIN_URL}/text_prediction/temp_predict`

		const options = {
			method: 'POST',
			body: formData,
		}

		fetchWithTimeout(url, options, 60000)
			.then((data) => {
				console.log(data)

				console.log('Fetch successful')
			})
			.catch((error) => {
				console.error('Fetch error:', error.message)
				// Handle timeout or other errors here
				if (error.message === 'Request timed out') {
					console.log('The request took too long and was terminated.')
				}
			})
	}

	return (
		<>
			<div>
				<h1>Image</h1>
				<form onSubmit={handlePredictSelectedImage}>
					<input
						type="file"
						name="file"
						onChange={handleImageFileChange}
					/>
					<button type="submit">Submit</button>
				</form>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-around',
						marginTop: '20px',
					}}
				>
					{selectedImageFile && (
						<img
							src={URL.createObjectURL(selectedImageFile)}
							alt="Selected"
							className="rounded-md"
							style={{ width: '30%' }}
						/>
					)}
					{explainImageUrl && (
						<img
							src={explainImageUrl}
							alt="Explain"
							className="rounded-md"
							style={{ width: '30%' }}
						/>
					)}
				</div>
			</div>

			<div>
				<h1>Text</h1>
				<form onSubmit={handlePredictText}>
					<input
						type="file"
						name="text_file"
						onChange={handleTextFileChange}
					/>
					<button type="submit">Submit</button>
				</form>
			</div>
		</>
	)
}

export default TestPredict
