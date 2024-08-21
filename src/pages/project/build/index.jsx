import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useMultistepForm } from 'src/hooks/useMultiStepForm'
import * as projectAPI from 'src/api/project'
import StepFour from './steps/step_four'
import StepOne from './steps/step_one'
import StepThree from './steps/step_three'
import StepTwo from './steps/step_two'

export default function ProjectBuild(props) {
	function updateFields(fields) {
		if (fields.isDoneStepOne) {
			goTo(1)
		}
		if (fields.isDoneStepTwo) {
			goTo(2)
		}
		if (fields.isDoneStepThree) {
			goTo(3)
		}
		if (fields.isDoneStepFour) {
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
	} = useMultistepForm([
		<StepOne
			{...data}
			updateFields={updateFields}
			projectInfo={projectInfo}
		/>,
		<StepTwo
			{...data}
			updateFields={updateFields}
			projectInfo={projectInfo}
		/>,
		<StepThree
			{...data}
			updateFields={updateFields}
			projectInfo={projectInfo}
		/>,
		<StepFour
			{...data}
			updateFields={updateFields}
			projectInfo={projectInfo}
		/>,
	])
	return steps[currentStepIndex]
}
