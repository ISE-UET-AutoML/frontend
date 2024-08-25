/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useCallback, useState } from 'react'
import { ImageConfig, TextConfig } from './Config'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { trainModel, autoLabel } from 'src/api/project'
import { message } from 'antd'
import { useLibrary } from 'src/utils/LibProvider'
import { createLabels } from 'src/api/dataset'
import { updateLabel } from 'src/api/images'
import Loading from 'src/components/Loading'
import * as projectAPI from 'src/api/project'
import Logo from 'src/assets/images/logoIcon.png'
import Labelling from 'src/assets/images/Labeling.png'
import 'src/assets/css/card.css'

const INTERFACES = [
	'panel',
	'update',
	'submit',
	'skip',
	'controls',
	'topbar',
	'instruction',
	'side-column',
	'ground-truth',
	'annotations:tabs',
	'annotations:menu',
	'annotations:current',
	'annotations:add-new',
	'annotations:delete',
	'annotations:view-all',
	'predictions:tabs',
	'predictions:menu',
	'edit-history',
]

const Labeling = ({
	images,
	pagination,
	labelsWithID,
	type,
	next,
	updateFields,
}) => {
	const currentLabelWithID = useRef(labelsWithID)
	const savedLabels = currentLabelWithID.current.map((v, i) => v.value)
	let [searchParams, setSearchParams] = useSearchParams()
	const [isLoading, setIsLoading] = useState(false)
	const location = useLocation()
	// get info about project id
	const { id: projectId } = useParams()
	// for create label
	const [createLabel, setcreateLabel] = useState(savedLabels.length <= 0)
	const [labelText, setLabelText] = useState('')
	const [labelsEditing, setLabelEdit] = useState([])
	// for labeling
	const LabelStudio = useLibrary('lsf')
	const rootRef = useRef()
	const lsf = useRef(null)
	const [currentIndex, setIndex] = useState(0)
	const getConfigView = (viewLabels) => {
		if (type === 'IMAGE_CLASSIFICATION') {
			return ImageConfig(viewLabels)
		}
		if (type === 'TEXT_CLASSIFICATION') {
			return TextConfig(viewLabels)
		}
	}

	const [currentConfig, setConfig] = useState(getConfigView(savedLabels))
	console.log(currentConfig)

	useEffect(() => {
		setConfig(getConfigView(savedLabels))
	}, [])

	let tempIndex = 0

	const handleAddLabel = () => {
		const text = labelText.trim()
		if (text.length <= 0) return
		const lbs = text
			.split(/\r?\n|\r|\n/g)
			.map((e) => e.toString().trim())
			.filter((e) => e.length > 0)
		if (lbs.length <= 0) return
		setLabelEdit((le) => [...le, ...lbs])
		document.getElementById('edt-label').value = ''
		setLabelText('')
	}
	const deleteLabel = (index) => {
		setLabelEdit((le) => le.filter((v, i) => i !== index))
	}

	const saveLabel = async () => {
		if (labelsEditing.length > 0) {
			const res = await createLabels(projectId, { label: labelsEditing })
			currentLabelWithID.current = res.data.map((v, i) => {
				return {
					id: v._id,
					value: v.name,
				}
			})
			console.log('assign label with id ', currentLabelWithID.current)
			if (currentLabelWithID.current.length >= 0) {
				setcreateLabel(false)
				setConfig(getConfigView(labelsEditing))
			}
		} else {
			message.error('Error: label is empty!', 2)
		}
	}

	const getTask = (index) => {
		const image = images[index]
		let annotations = []
		if (image?.label && image.label.length > 0) {
			annotations = [
				{
					result: [
						{
							value: {
								choices: [image.label],
							},
							from_name: 'choice',
							to_name: 'image',
							type: 'choices',
							origin: 'manual',
						},
					],
				},
			]
		}

		return {
			id: index,
			annotations: annotations,
			data: {
				image: image.url,
			},
		}
	}

	const updateLabelTask = async (image, newLabel) => {
		let newLabelID = ''
		for (let lb of currentLabelWithID.current) {
			if (lb.value === newLabel) {
				newLabelID = lb.id
				break
			}
		}
		console.log('id', image._id, newLabelID)
		if (image._id.length <= 0 || newLabelID.length <= 0) {
			return
		}
		return await updateLabel(image._id, newLabelID)
	}

	const HandleEndLoop = () => {
		for (let img of images) {
			if (img.label.length <= 0) {
				setIndex(0)
				return
			}
		}
		window.location.reload()
	}

	const increase = async (index) => {
		const ICR = 1
		if (index < images.length - ICR) {
			setIndex((a) => a + ICR)
		} else {
			const { data } = await projectAPI.getProjectFullDataset(projectId)
			if (!data.files) return
			images = data.files
			pagination = data.meta
			if (data.files.length && index < data.files.length - ICR)
				setIndex((a) => a + 1) //TODO: have new data
			else {
				HandleEndLoop()
			}
		}
	}

	const initLabelStudio = useCallback(
		(config, index) => {
			if (!LabelStudio) return
			const task = getTask(index)
			if (!task?.data) return
			console.info('Initializing LSF preview', { config, task })

			const onUpdate = async (ls, annotations) => {
				const at = annotations.serializeAnnotation()
				if (at.length > 0)
					console.log('value', at[0]['value']['choices'])
				else {
					message.error('Please annotating', 3)
					return
				}

				const newLabel = at[0]['value']['choices'][0]
				images[index].label = newLabel
				const resultUpdate = await updateLabelTask(
					images[index],
					newLabel
				)

				increase(index)
				message.success('Successfully Updated', 3)
			}

			const onSubmit = async (ls, annotations) => {
				const at = annotations.serializeAnnotation()
				tempIndex += 1
				if (at.length > 0)
					console.log('value', at[0]['value']['choices'])
				else {
					message.error('Please annotating', 3)
					return
				}

				const newLabel = at[0]['value']['choices'][0]
				images[index].label = newLabel
				const resultUpdate = await updateLabelTask(
					images[index],
					newLabel
				)
				increase(index)
				message.success('Successfully Submitted', 3)
			}

			const onloadAnnotation = (LS) => {
				var c = LS.annotationStore.addAnnotation({
					userGenerate: true,
				})
				LS.annotationStore.selectAnnotation(c.id)
			}

			const onSkip = (ls, annotations) => {
				increase(index)
			}

			try {
				const lsf = new window.LabelStudio(rootRef.current, {
					config,
					task,
					interfaces: INTERFACES,
					onUpdateAnnotation: onUpdate,
					onSubmitAnnotation: onSubmit,
					onSkipTask: onSkip,
					onLabelStudioLoad: onloadAnnotation,
				})
				return lsf
			} catch (err) {
				console.error(err)
				return null
			}
		},
		[LabelStudio]
	)

	useEffect(() => {
		if (!lsf.current) {
			lsf.current = initLabelStudio(currentConfig, currentIndex)
		}
		return () => {
			if (lsf.current) {
				console.info('Destroying LSF')
				try {
					lsf.current.destroy()
				} catch (e) {}
				lsf.current = null
			}
		}
	}, [initLabelStudio, currentIndex, currentConfig])

	useEffect(() => {
		if (lsf.current?.store) {
			const store = lsf.current.store
			store.resetState()
			store.assignTask(getTask(currentIndex))
			store.initializeStore(getTask(currentIndex))
			const c = store.annotationStore.addAnnotation({
				userGenerate: true,
			})
			store.annotationStore.selectAnnotation(c.id)
			console.log('LSF task updated')
		}
	}, [currentIndex])

	useEffect(() => {
		if (lsf.current?.store) {
			lsf.current.store.assignConfig(currentConfig)
			console.log('LSF config updated')
		}
	}, [currentConfig])

	const checkData = () => {
		const currentLabeled = new Set()
		if (!images) {
			return false
		}
		for (let index = 0; index < images.length; index++) {
			const element = images[index]
			const lb_tmp = element['label']
			if (lb_tmp && lb_tmp.length) currentLabeled.add(lb_tmp)
		}
		const fullLabel = new Set(savedLabels)
		if (currentLabeled.size !== fullLabel.size) {
			message.error('you must label more')
			return false
		}
		return true
	}

	const handleTrain = async () => {
		if (!checkData()) return
		try {
			const { data } = await trainModel(projectId)
			const searchParams = new URLSearchParams(location.search)
			searchParams.get('experiment_name') ??
				setSearchParams((pre) =>
					pre.toString().concat(`&experiment_name=${data.task_id}`)
				)
			updateFields({ experiment_name: data.task_id })
			next()
		} catch (error) {
			console.error(error)
		}
	}

	const handleAutoLabeling = async () => {
		if (!checkData()) return
		setIsLoading(true)
		const result = await autoLabel(projectId)
		console.log(result)
		if (result.status === 200) {
			message.success('auto label successfully')
			window.location.reload()
			return
		}
		message.error("Can't auto labeling", result)
		setIsLoading(false)
	}

	return (
		<div className="label-editor-container" id="label-editor-container">
			{isLoading && <Loading />}
			<div
				className="group-hover/item:block flex 
                top-full right-0 py-4 px-3 bg-white w-[100%] rounded-md shadow-md "
			>
				{/* <button
					className={`ml-1 bg-blue-500 hover:bg-blue-800  text-white group flex items-center rounded-md px-2 py-2 text-sm`}
					onClick={() => {
						handleAutoLabeling()
					}}
				>
					<span className="text-center w-full">Auto Labeling</span>
				</button> */}
				<div className="relative h-full pt-4">
					<button
						onClick={() => {
							handleAutoLabeling()
						}}
						className="flex text-white bg-orange-600 rounded-lg text-sm font-bold px-3 py-2.5 text-center me-2 mb-2"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="size-4 mr-2"
						>
							<path
								fill-rule="evenodd"
								d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
								clip-rule="evenodd"
							/>
						</svg>{' '}
						Auto Label
					</button>
				</div>
				{/* <button
					className={`ml-auto bg-blue-500 hover:bg-blue-800  text-white group flex items-center rounded-md px-2 py-2 text-sm`}
					onClick={() => {
						handleTrain()
					}}
				>
					<span className="text-center w-full">Train Model</span>
				</button> */}
				<div className="ml-auto relative h-full pt-3">
					<button
						onClick={() => {
							handleTrain()
						}}
						className=" text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
					>
						Train Model
					</button>
				</div>
			</div>

			<div id="label-studio" ref={rootRef} />

			{/* ADD LABELS */}
			<div
				className={`${
					createLabel
						? 'top-0 bottom-full z-[1000] opacity-100 left-0 mb-8'
						: 'top-full bottom-0 opacity-0'
				} fixed h-full w-full bg-white transition-all duration-500 ease flex`}
			>
				<section className="flex h-full w-4/12 flex-col overflow-y-auto bg-gray-50 pt-3">
					<h1 className="mt-10 mb-4 text-3xl text-center font-extrabold leading-none tracking-tight text-gray-900">
						Your{' '}
						<mark className="px-2 text-white bg-blue-600 rounded">
							Labels
						</mark>{' '}
						here!!!
					</h1>

					<ul className="mt-6 space-y-3 pl-10 pr-10">
						{labelsEditing.map((label, index) => (
							<li
								key={index}
								className="flex items-center justify-between px-4 py-4 bg-white rounded-lg shadow transition duration-200 ease-in-out hover:bg-gray-50"
							>
								<span className="text-lg font-semibold text-blue-600 hover:text-indigo-800">
									{label}
								</span>
								<button
									type="button"
									onClick={() => deleteLabel(index)}
									aria-label="delete label"
									className="p-2 text-red-600 transition-colors duration-200 ease-in-out hover:text-red-800"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="w-6 h-6"
										fill="currentColor"
										viewBox="0 0 30 30"
									>
										<path d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"></path>
									</svg>
								</button>
							</li>
						))}
					</ul>

					<div className="flex items-center justify-center px-auto w-full">
						<button
							onClick={saveLabel}
							className=" text-white bg-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
						>
							Save
						</button>
					</div>

					<div className="w-[80%] shadow-lg mt-4 ml-12 rounded-2xl">
						<img
							src={Labelling}
							loading="lazy"
							className="h-full w-full object-cover rounded-2xl"
						/>
					</div>
				</section>
				<section className="flex w-8/12 flex-col rounded-r-3xl bg-white px-4 h-max">
					<div className="mb-8 flex h-48 items-center justify-between border-b-2">
						<div className="flex items-center space-x-4">
							<div className="h-12 w-12 overflow-hidden rounded-full">
								<img
									src={Logo}
									loading="lazy"
									className="h-full w-full object-cover"
								/>
							</div>
							<div className="flex flex-col">
								<h3 className="text-lg font-semibold">
									Pixel Brain
								</h3>
								<p className="text-light text-gray-400">
									ise_uet@vnu.edu.vn
								</p>
							</div>
						</div>
					</div>
					<section className="h-max">
						<div className="flex h-max">
							<h1 className="text-3xl font-bold text-center">
								Create your labels
							</h1>
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
						</div>
						<article className=" leading-7 tracking-wider text-gray-500">
							<p>Dear Automler,</p>
							<p>
								In training a model, accurate labeling of data
								is crucial for achieving reliable outcomes.
								Labels serve as the ground truth that the model
								learns to predict, guiding the algorithm's
								adjustments during training. Poor labeling can
								lead to significant bias, reducing the model's
								ability to generalize to new data. Thus,
								ensuring high-quality, consistent labels is
								essential for developing an effective and robust
								machine learning model
							</p>
							<footer className="mt-12">
								<p>Thanks & Regards,</p>
								<p>Pixel Brain</p>
							</footer>
						</article>
					</section>
					<div className=" mt-12 rounded-xl border-2 border-dashed border-blue-500 bg-gray-50 h-full">
						<textarea
							id="edt-label"
							name="myInput"
							className="mt-4 ml-4 w-[97%] h-full border-0 bg-white rounded-xl p-2 text-lg text-gray-900 focus:ring-0 focus:border-0 focus:border-transparent focus:outline-none"
							placeholder="Adding your labels here!"
							rows="2"
							onChange={(evt) =>
								setLabelText(evt.target.value.toString())
							}
						></textarea>
						<div className="flex items-center justify-end p-2 ml-auto pt-0 ">
							<button
								onClick={handleAddLabel}
								type="submit"
								className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:outline-none font-medium rounded-lg text-sm px-5 py-2 text-center me-2"
							>
								Send
							</button>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}

export default Labeling
