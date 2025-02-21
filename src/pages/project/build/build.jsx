// import { useEffect, useState } from 'react'
// import { useLocation, useParams } from 'react-router-dom'
// import useMultiStepForm from 'src/hooks/useMultiStepForm'
// import * as projectAPI from 'src/api/project'
// import PredictData from './predictData'
// import UploadData from './uploadData.jsx'
// import TrainModel from './trainModel'
// import LabelData from './labelData/labelData'
// import SelectInstance from './selectInstance'
// import SelectTargetCol from './selectTargetCol'
// import SelectTargetColMulti from './selectTargetColMulti'
// import RenderGraph from './renderGraph'
// import DeployView from './deployView'

// export default function ProjectBuild(props) {
// 	const location = useLocation()
// 	const [data, setData] = useState({})
// 	const { id: projectID } = useParams()
// 	const [projectInfo, setProjectInfo] = useState(null)

// 	function updateFields(fields) {
// 		//TODO: Route to LabelData

// 		// Main Pipeline
// 		if (fields.isDoneUploadData) {
// 			goTo(1) // SelectInstance
// 		}

// 		if (fields.isDoneSelectInstance) {
// 			goTo(2) // TrainModel
// 		}
// 		if (fields.isDoneTrainModel) {
// 			goTo(3) // DeployView
// 		}

// 		if (fields.isDonePredictData) {
// 			// Chua co
// 		}

// 		//Additional

// 		if (fields.isSelectTargetCol) {
// 			goTo(4)
// 		}

// 		if (fields.isSelectTargetColMulti) {
// 			goTo(5)
// 		}

// 		if (fields.isLabeling) {
// 			goTo(6)
// 		}

// 		if (fields.isDoneSelectTargetCol) {
// 			goTo(1) // SelectInstance
// 		}

// 		// if (fields.isDoneLabelData) {
// 		// 	goTo(2)
// 		// }

// 		setData((prev) => {
// 			return { ...prev, ...fields }
// 		})
// 	}

// 	useEffect(() => {
// 		const fetchProjectInfo = async () => {
// 			try {
// 				const response = await projectAPI.getProjectById(projectID)
// 				setProjectInfo(response.data)
// 			} catch (error) {
// 				console.error('Error fetching project:', error)
// 			}
// 		}

// 		fetchProjectInfo()
// 	}, [projectID])

// 	useEffect(() => {
// 		const searchParams = new URLSearchParams(location.search)
// 		const step = searchParams.get('step')
// 		if (step) {
// 			goTo(parseInt(step))
// 		}
// 	}, [])

// 	const {
// 		steps,
// 		currentStepIndex,
// 		step,
// 		isFirstStep,
// 		isLastStep,
// 		back,
// 		next,
// 		goTo,
// 	} = useMultiStepForm([
// 		//0
// 		<UploadData
// 			{...data}
// 			updateFields={updateFields}
// 			projectInfo={projectInfo}
// 		/>,
// 		//1
// 		<SelectInstance
// 			{...data}
// 			updateFields={updateFields}
// 			projectInfo={projectInfo}
// 		/>,

// 		//2
// 		<TrainModel
// 			{...data}
// 			updateFields={updateFields}
// 			projectInfo={projectInfo}
// 		/>,

// 		//3
// 		<DeployView
// 			{...data}
// 			updateFields={updateFields}
// 			projectInfo={projectInfo}
// 		/>,

// 		//4
// 		<SelectTargetCol
// 			{...data}
// 			updateFields={updateFields}
// 			projectInfo={projectInfo}
// 		/>,

// 		//5
// 		<SelectTargetColMulti
// 			{...data}
// 			updateFields={updateFields}
// 			projectInfo={projectInfo}
// 		/>,

// 		//--------------------OLD-------------------
// 		// <LabelData
// 		// 	{...data}
// 		// 	updateFields={updateFields}
// 		// 	projectInfo={projectInfo}
// 		// />,
// 		//--------------------OLD-------------------

// 		//6
// 		// <Labeling
// 		// 	{...data}
// 		// 	updateFields={updateFields}
// 		// 	projectInfo={projectInfo}
// 		// />,
// 	])
// 	return steps[currentStepIndex]
// }

import { useEffect, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import * as projectAPI from 'src/api/project'

export default function ProjectBuild() {
	const { id: projectID } = useParams()
	const [projectInfo, setProjectInfo] = useState(null)
	const [data, setData] = useState({})

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

	// Function to update data state
	function updateFields(fields) {
		setData((prev) => ({ ...prev, ...fields }))
	}

	return (
		<div>
			{/* Pass data and update function via Outlet context */}
			{projectInfo && (
				<Outlet context={{ ...data, updateFields, projectInfo }} />
			)}
		</div>
	)
}
