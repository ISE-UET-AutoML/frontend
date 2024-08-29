import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import useMultiStepForm from 'src/hooks/useMultiStepForm'
import * as projectAPI from 'src/api/project'
import PredictData from './predictData/predictData'
import UploadData from './uploadData/uploadData'
import TrainModel from './trainModel/trainModel'
import LabelData from './labelData/labelData'

export default function ProjectBuild(props) {
	function updateFields(fields) {
		if (fields.isDoneUploadData) {
			goTo(1)
		}
		if (fields.isDoneLabelData) {
			goTo(2)
		}
		if (fields.isDoneTrainModel) {
			goTo(3)
		}
		if (fields.isDonePredictData) {
			goTo(4)
		}
		setData((prev) => {
			return { ...prev, ...fields }
		})
	}

	const { id: projectID } = useParams()

	const [projectInfo, setProjectInfo] = useState(null)

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
	const location = useLocation()

	const [data, setData] = useState({})
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
		<LabelData
			{...data}
			updateFields={updateFields}
			projectInfo={projectInfo}
		/>,
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
	])
	return steps[currentStepIndex]
}
