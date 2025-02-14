import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import useMultiStepForm from 'src/hooks/useMultiStepForm'
import * as projectAPI from 'src/api/project'
import PredictData from './predictData'
import UploadData from './uploadData.jsx'
import TrainModel from './trainModel'
import LabelData from './labelData/labelData'
import SelectInstance from './selectInstance'
import SelectTargetCol from './selectTargetCol'
import SelectTargetColMulti from './selectTargetColMulti'

export default function ProjectBuild(props) {
	const location = useLocation()
	const [data, setData] = useState({})
	const { id: projectID } = useParams()
	const [projectInfo, setProjectInfo] = useState(null)

	function updateFields(fields) {
		//TODO: Route to LabelData
		if (fields.isDoneUploadData) {
			goTo(1)
		}
		// if (fields.isDoneLabelData) {
		// 	goTo(2)
		// }
		if (fields.isDoneSelectInstance) {
			goTo(2)
		}
		if (fields.isDoneTrainModel) {
			goTo(3)
		}
		if (fields.isDonePredictData) {
			goTo(4) // Chua co -> Sua cho dung
		}
		if (fields.isSelectTargetCol) {
			goTo(4)
		}
		if (fields.isDoneSelectTargetCol) {
			goTo(1)
		}
		if (fields.isSelectTargetColMulti) {
			goTo(5)
		}
		if (fields.isLabeling) {
			goTo(6)
		}
		setData((prev) => {
			return { ...prev, ...fields }
		})
	}

	useEffect(() => {
		const fetchProjectInfo = async () => {
			try {
				const response = await projectAPI.getProjectById(projectID)
				setProjectInfo(response.data)
			} catch (error) {
				console.error('Error fetching project:', error)
			}
		}

		fetchProjectInfo()
	}, [projectID])

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search)
		const step = searchParams.get('step')
		if (step) {
			goTo(parseInt(step))
		}
	}, [])

	const {
		steps,
		currentStepIndex,
		step,
		isFirstStep,
		isLastStep,
		back,
		next,
		goTo,
	} = useMultiStepForm([
		<UploadData
			{...data}
			updateFields={updateFields}
			projectInfo={projectInfo}
		/>,
		<SelectInstance
			{...data}
			updateFields={updateFields}
			projectInfo={projectInfo}
		/>,
		//--------------------OLD-------------------
		// <LabelData
		// 	{...data}
		// 	updateFields={updateFields}
		// 	projectInfo={projectInfo}
		// />,
		//--------------------OLD-------------------
		<TrainModel
			{...data}
			updateFields={updateFields}
			projectInfo={projectInfo}
		/>,
		<PredictData
			{...data}
			updateFields={updateFields}
			projectInfo={projectInfo}
		/>,
		<SelectTargetCol
			{...data}
			updateFields={updateFields}
			projectInfo={projectInfo}
		/>,
		<SelectTargetColMulti
			{...data}
			updateFields={updateFields}
			projectInfo={projectInfo}
		/>,
		// <Labeling
		// 	{...data}
		// 	updateFields={updateFields}
		// 	projectInfo={projectInfo}
		// />,
	])
	return steps[currentStepIndex]
}
