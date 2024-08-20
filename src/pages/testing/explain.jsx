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
		formData.append('runName', experimentName)
		//formData.append('runName', 'ISE')
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

	const handleHighlight = (selectedClass) => {
		setHighlightedClass(selectedClass)
	}

	const shouldHighlight = (word) => {
		const currrentClassWords = explanation.find(
			(item) => item.class === selectedClass
		).words
		return currrentClassWords.includes(word)
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
		formData.append('userEmail', 'darklord1611')
		formData.append('projectName', '66bdc72c8197a434278f525d')
		formData.append('runName', experimentName)
		//formData.append('runName', 'ISE')
		formData.append('text', sentence)

		const temp = sentence.split(/[\s,]+/)

		console.log(temp.map((word) => word.replace(/[()]/g, '')))

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
				fakeData()
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
						name="sentence"
						value={sentence}
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

// Intelligent Movie. This movie is obviously allegorical, a fascinating tale about AI, but it is mainly about manipulation and power. It isn't for those wanting action or spectacular CGI, the movie is aimed at people who like to think, rather than passively wait to be entertained. There are themes here not only about AI, but also about surveillance, with excellent points about how data about us is collected by phone companies, search engine companies, commercial operating systems makers and so on. The plot seems simple but isn't, it's extremely clever, with the protagonist playing games, trying to stay one step ahead of one another. This is a movie with perfectly consistent internal logic that plays out perfectly. Don't go in expecting too much, however, as I can see most people will not be satisfied by this movie, but for me, it does what it sets out to do brilliantly. Therefore I give at least 9/10. And most recent movies have been getting 5/10 from me. This movie succeeds where another recent movie about AI, Transcendence, I think it is called, failed (but it was an interesting failure). A third movie about AI, a Spanish movie called Eva, was also brilliant. Eva was more moving and this movie more philosophical. But both movies were perfect in their different ways. The AI's name in this movie, Ava, seems to be a nod to the title of the Spanish movie. As an aside, it's nice that no "stars" appeared in "Ex Machina" and "Eva", the casting was great. Of course there are several aspects of this movie that are unrealistic and often absurd. But because this is an allegorical movie, these are acceptable, because the movie is making points, rather than striving for realism. It's more of a fairytale than accurate portrayal.

// Poor story, only reasonable otherwise. If I had realised this was by Alex Garland I would not have bothered watching. I remember reading his book the Beach years ago and thinking 'there's something not very nice about this'. At the time I wasn't sure what it was. But now having seen Ex Machina, I have the same feeling. That the story has been chosen simply to appeal to a large audience, in a rather manipulative, unthinking and unfeeling way. I don't normally write bad reviews - of anything. Preferring to focus on the positive. But I so dislike this I felt I had to write something to put people off wasting their time, or assimilating some of this 'nastiness'. In the case of Ex Machina I can just imagine Garland wondering what he would do for his next project, googling AI and quickly finding the AI Box Experiment. And rather than do the heart- and soul-searching work that would be necessary to produce anything original I imagine him quickly turning somebody else's idea into his next big proposal to present to the film studio. So an unoriginal idea, presented in a fairly pedestrian way. Lots of images derived from a young person's view of 'sexuality', made me also wonder if this film is rather prejudiced against women? It is reasonably paced but I found myself yawning a lot - not quite what I would expect from a good thriller. Domhnall Gleeson is OK, does a pretty good job.
export default Explain
