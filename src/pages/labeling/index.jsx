import React, {
	useEffect,
	useRef,
	useMemo,
	useContext,
	useCallback,
	useState,
} from 'react'
import 'src/assets/css/card.css'

import { ImageConfig, TextConfig } from './Config'
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { listImages, trainModel, autoLabel } from 'src/api/project';
import { message } from 'antd';
import { useLibrary } from 'src/utils/LibProvider';
import { createLabels } from 'src/api/dataset'
import { updateLabel } from 'src/api/images'
import Loading from 'src/components/Loading';
import * as projectAPI from 'src/api/project'


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
	let [searchParams, setSearchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const location = useLocation();
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
	const [currentConfig, setConfig] = useState(ImageConfig(savedLabels))

	useEffect(() => {
		if (type === 'IMAGE_CLASSIFICATION') {
			setConfig(ImageConfig(savedLabels))
		}
		if (type === 'TEXT_CLASSIFICATION') {
			setConfig(TextConfig(savedLabels))
		}
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
		setLabelEdit((le) => le.filter((v, i) => i != index))
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
				setConfig(ImageConfig(labelsEditing))
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
			if (lb.value == newLabel) {
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
				} catch (e) { }
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
			const element = images[index];
			const lb_tmp = element['label']
			if (lb_tmp && lb_tmp.length)
				currentLabeled.add(lb_tmp)
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
			const { data } = await trainModel(projectId);
			const searchParams = new URLSearchParams(location.search);
			searchParams.get('experiment_name') ??
				setSearchParams((pre) =>
					pre
						.toString()
						.concat(`&experiment_name=${data.task_id}`)
				);
			updateFields({ experiment_name: data.task_id });
			next();
		} catch (error) {
			console.error(error);
		}
	}

	const handleAutoLabeling = async () => {
		if (!checkData()) return
		setIsLoading(true)
		const result = await autoLabel(projectId)
		console.log(result);
		if (result.status === 200) {
			message.success('auto label sucessfully')
			window.location.reload()
		}
		message.error("Can't auto labeling", result)
		setIsLoading(false)
	}



	return (
		<div className="label-editor-container" id="label-editor-container">

			{isLoading && <Loading />}
			<div
				className="group-hover/item:block flex 
                top-full right-0 py-4 px-3 bg-white w-[120%] rounded-md shadow-md "
			>
				<button
					className={`bg-blue-500 hover:bg-blue-800  text-white group flex items-center rounded-md px-2 py-2 text-sm`}
					onClick={() => {
						handleTrain()
					}}
				>
					<span className="text-center w-full">Train Model</span>

				</button>
				<button
					className={`ml-1 bg-blue-500 hover:bg-blue-800  text-white group flex items-center rounded-md px-2 py-2 text-sm`}
					onClick={() => {
						handleAutoLabeling()
					}}
				>
					<span className="text-center w-full">Auto Labeling</span>
				</button>
			</div>
			<div id="label-studio" ref={rootRef} />
			<div
				className={`${createLabel
					? 'top-0 bottom-full z-[1000] opacity-100 left-0 mb-8'
					: 'top-full bottom-0 opacity-0'
					} fixed flex flex-col items-center h-full w-full px-[30px] justify-center bg-white  transition-all duration-500 ease`}
			>
				<h3 className="label-text text-center w-full mt-4 text-[28px] font-[500] leading-[1.16] mb-8 ">
					Create label for your dataset
				</h3>
				<div className="container flex justify-around items-center mx-auto gap-2">
					<div className="align-top">
						<h4 className="label-text">Add label names</h4>
						<h5 className="label-text">
							Use new line as a separator to add multiple labels
						</h5>
						<textarea
							id="edt-label"
							name="myInput"
							onChange={(evt) =>
								setLabelText(evt.target.value.toString())
							}
						/>

						<button onClick={handleAddLabel} className="add-label">
							Add
						</button>
					</div>
					<div className="align-top">
						<h4 className="label-text">
							Labels ({labelsEditing.length})
						</h4>
						<ul>
							{labelsEditing.map((label, index) => {
								return (
									<li className="label-li">
										<span>{label}</span>
										<button
											type="button"
											onClick={() => deleteLabel(index)}
											aria-label="delete label"
										>
											<svg
												width="14"
												height="14"
												viewBox="0 0 14 14"
												fill="none"
												stroke="red"
												strokeWidth="2"
												strokeLinecap="square"
												xmlns="http://www.w3.org/2000/svg"
											>
												<title>Delete label</title>
												<path d="M2 12L12 2" />
												<path d="M12 12L2 2" />
											</svg>
										</button>
									</li>
								)
							})}
						</ul>
					</div>
				</div>
				<div className="mb-16 relative flex rounded-md bg-blue-600 justify-between items-center text-white">
					<button
						className="hover:bg-blue-800 py-[6px] px-4 rounded-md w-fit"
						onClick={saveLabel}
					>
						Save
					</button>
				</div>
			</div>

		</div>
	)
}

export default Labeling
