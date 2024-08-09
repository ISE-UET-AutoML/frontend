import React, { Fragment, useReducer, useState } from 'react'
import { fetchWithTimeout } from 'src/utils/timeout'
import { explainInstance } from 'src/api/project'
import parse from 'html-react-parser'

const Explain = (props) => {
	const [explainImageUrl, setExplainImageUrl] = useState('')
	const [explainTextHTML, setExplainTextHTML] = useState('')
	const [selectedImageFile, setSelectedImageFile] = useState(null)
	const [sentence, setSentence] = useState('')

	const handleExplainSelectedImage = async (event) => {
		event.preventDefault()
		console.log('Executing')
		const item = event.target.elements.file.files[0]

		// TODO: fix hardcorded values
		const formData = new FormData()
		formData.append('userEmail', 'test-automl')
		formData.append('projectName', '4-animal')
		formData.append('runName', 'ISE')
		formData.append('image', item)

		const url = `${process.env.REACT_APP_EXPLAIN_URL}/image_classification/explain`

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

	const handleFileChange = (event) => {
		const file = event.target.files[0]
		setSelectedImageFile(file)
		setExplainImageUrl('')
	}

	const handleTextChange = (event) => {
		setSentence(event.target.value)
	}

	const handleExplainText = async (event) => {
		event.preventDefault()

		// TODO: fix hardcorded values
		const formData = new FormData()

		formData.append('userEmail', 'test-automl')
		formData.append('projectName', '66aa68b3015d0ebc8b61cc76')
		formData.append('runName', 'ISE')
		formData.append('text', sentence)

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
	}

	return (
		<>
			<div>
				<h1>Image</h1>
				<form onSubmit={handleExplainSelectedImage}>
					<input
						type="file"
						name="file"
						onChange={handleFileChange}
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
				<form onSubmit={handleExplainText}>
					<input
						style={{
							border: '2px solid #ccc',
							borderRadius: '4px',
							padding: '10px',
							width: '100%',
							boxSizing: 'border-box',
						}}
						type="text"
						value={sentence}
						name="sentence"
						onChange={handleTextChange}
					/>
					<button type="submit">Submit</button>
				</form>
				<div
					style={{
						width: '100%',
						maxWidth: '1000px',
						padding: '20px',
						backgroundColor: '#f9f9f9',
						borderRadius: '8px',
						overflow: 'auto',
					}}
					dangerouslySetInnerHTML={{ __html: explainTextHTML }}
				></div>
			</div>
		</>
	)
}

// TEXT EXAMPLES

// No one expects the Star Trek movies to be high art, but the fans do expect a movie that is as good as some of the best episodes. Unfortunately, this movie had a muddled, implausible plot that just left me cringing - this is by far the worst of the nine (so far) movies. Even the chance to watch the well known characters interact in another movie can't save this movie - including the goofy scenes with Kirk, Spock and McCoy at Yosemite. I would say this movie is not worth a rental, and hardly worth watching, however for the True Fan who needs to see all the movies, renting this movie is about the only way you'll see it - even the cable channels avoid this movie.

// Les Visiteurs, the first movie about the medieval time travelers was actually funny. I like Jean Reno as an actor, but there was more. There were unexpected twists, funny situations and of course plain absurdness, that would remind you a little bit of Louis de Funes. Now this sequel has the same characters, the same actors in great part and the same time traveling. The plot changes a little, since the characters now are supposed to be experienced time travelers. So they jump up and down in history, without paying any attention to the fact that it keeps getting absurder as you advance in the movie. The duke, Jean Reno, tries to keep the whole thing together with his playing, but his character has been emptied, so there's not a lot he can do to save the film.

export default Explain
