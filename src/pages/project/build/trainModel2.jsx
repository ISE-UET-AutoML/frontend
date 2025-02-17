import React, { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { getExperiment } from 'src/api/experiment'
import { message } from 'antd'
import { CheckIcon } from '@heroicons/react/24/outline'
import launching from 'src/assets/gif/software.gif'
import dependencies from 'src/assets/gif/file.gif'
import training from 'src/assets/gif/artificial-intelligence.gif'
import clouding from 'src/assets/gif/cloud.gif'

const TrainModel2 = (props) => {
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experiment_name')
	const [trainingInfo, setTrainingInfo] = useState({
		latestEpoch: 0,
		accuracy: 0,
	})
	const [processValue, setProcessValue] = useState(5)
	const [currentStep, setCurrentStep] = useState(0)

	const steps = [
		{
			title: 'Launching Instance',
			description: 'Initiating cloud instance to start the experiment.',
			gif: launching,
			info: props.instanceInfor,
		},
		{
			title: 'Downloading Dependencies',
			description: 'Downloading necessary dependencies and libraries.',
			gif: dependencies,
		},
		{
			title: 'Training',
			description: 'Training the model with provided datasets.',
			gif: training,
			info: trainingInfo,
		},
		{
			title: 'Uploading Script',
			description: 'Uploading the final trained model script.',
			gif: clouding,
			info: trainingInfo,
		},
	]

	const SIZE = steps.length

	const getTrainingProgress = async (experimentName) => {
		let res
		try {
			res = await getExperiment(experimentName)
		} catch (err) {
			message.error(
				'Training failed due to an unstable instance. Please create a new instance and try again. We appreciate your understanding.',
				10
			)
		}

		console.log('Response', res)

		if (res.status === 422 || res.status === 500) {
			message.error(
				'Training failed due to an unstable instance. Please create a new instance and try again. We appreciate your understanding.',
				10
			)
			props.updateFields({
				isDoneUploadData: true,
			})
		}

		console.log('Current processValue', processValue)

		if (res.status === 200) {
			if (processValue === 100 || processValue > 100) {
				console.log('DONE')
				message.success('Successfully Training', 3)
				props.updateFields({
					isDoneTrainModel: true,
				})
			} else if (res.data.experiment.status === 'DONE') {
				setProcessValue((prev) => {
					const newValue = prev + 10
					console.log(
						'Updated processValue in CLOUD UPLOAD',
						newValue
					)
					return newValue
				})
				setTrainingInfo({
					latestEpoch: res.data.trainInfo.latest_epoch,
					accuracy: res.data.trainInfo.metrics.val_accuracy,
				})
			} else if (res.data.trainInfo.status === 'SETTING_UP') {
				if (processValue < 50) {
					setProcessValue((prev) => {
						const newValue = prev + 1

						if (newValue >= 50) return 50
						return newValue
					})
				} else {
					setProcessValue(50)
				}
			} else if (res.data.trainInfo.status === 'TRAINING') {
				if (
					50 <= processValue &&
					processValue < 75 &&
					res.data.trainInfo.latest_epoch
				) {
					setProcessValue((prev) => {
						const newValue = prev + 1

						if (newValue >= 75) return 75
						return newValue
					})
					setTrainingInfo({
						latestEpoch: res.data.trainInfo.latest_epoch,
						accuracy: res.data.trainInfo.metrics.val_accuracy,
					})
				} else if (processValue < 50) {
					setProcessValue(50)
				} else {
					setTrainingInfo({
						latestEpoch: res.data.trainInfo.latest_epoch,
						accuracy: res.data.trainInfo.metrics.val_accuracy,
					})
				}
			}
		}

		return res.data
	}

	useEffect(() => {
		getTrainingProgress(experimentName)
		const interval = setInterval(() => {
			getTrainingProgress(experimentName)
		}, 50000)

		return () => clearInterval(interval)
	}, [experimentName, processValue])

	useEffect(() => {
		if (processValue >= 0 && processValue < 15) {
			setCurrentStep(0)
		} else if (processValue >= 15 && processValue <= 50) {
			setCurrentStep(1)
		} else if (processValue > 50 && processValue <= 75) {
			setCurrentStep(2)
		} else if (processValue > 75 && processValue <= 100) {
			setCurrentStep(3)
		}
	}, [processValue])

	const renderStepIcon = (index) => {
		if (index < currentStep) {
			return (
				<div className="rounded-full h-14 w-14 border-4 border-blue-600 my-auto ml-10 flex items-center justify-center text-2xl bg-blue-600">
					<CheckIcon className="inline-block text-white h-6 w-6" />
				</div>
			)
		} else if (index === currentStep) {
			return (
				<div className="rounded-full h-14 w-14 border-4 border-blue-600 my-auto ml-10 flex items-center justify-center text-2xl text-black">
					{index + 1}
				</div>
			)
		} else {
			return (
				<div className="rounded-full h-14 w-14 border-4 text-gray-400 my-auto ml-10 flex items-center justify-center text-2xl">
					{index + 1}
				</div>
			)
		}
	}

	const renderStepDescription = (step) => {
		if (step.title === 'Launching Instance' && step.info) {
			return (
				<div className="text-center mt-5 text-xl">
					{step.description}
					<div className="mt-2 text-left w-full ml-[140px]">
						<p>
							<span className="font-bold">ID:</span>{' '}
							{step.info.id}
						</p>
						<p>
							<span className="font-bold">Public IP:</span>{' '}
							{step.info.public_ip}
						</p>
						<p>
							<span className="font-bold">Deploy Port:</span>{' '}
							{step.info.deploy_port}
						</p>
					</div>
				</div>
			)
		} else if (
			(step.title === 'Training' || step.title === 'Uploading Script') &&
			step.info
		) {
			return (
				<div className="text-center mt-5 text-xl">
					{step.description}
					<div className="mt-2 text-left w-full ml-[140px]">
						<p className="text-blue-600 font-bold">
							<span className="text-black">Latest Epoch:</span>{' '}
							{step.info.latestEpoch}
						</p>
						<p className="text-blue-600 font-bold">
							<span className="text-black">Accuracy:</span>{' '}
							{step.info.accuracy}
						</p>
					</div>
				</div>
			)
		}
		return (
			<div className="text-center mt-5 text-xl">{step.description}</div>
		)
	}

	return (
		<div className="ml-5 h-full w-[99%] relative">
			<h1 className="font-bold text-6xl mt-5 w-[50%] text-left">
				Training Process
			</h1>
			<div className="flex w-full h-[90%] mt-7">
				{/* PROGRESS BAR */}
				<div className=" w-[10%] h-full">
					<div className="h-[85%] border-2 w-[50%] mx-auto rounded-xl mt-[50px] relative">
						<div
							className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-xl"
							style={{ height: `${processValue}%` }}
						></div>
						<p className="absolute bottom-3 left-0 w-full text-center text-white font-bold">
							{processValue}%
						</p>
					</div>
				</div>
				{/* PROCESS */}
				<div className="w-[30%] h-full grid grid-rows-4">
					{steps
						.slice()
						.reverse()
						.map((step, index) => (
							<div
								key={index}
								className="row-span-1 flex font-bold relative"
							>
								{renderStepIcon(SIZE - 1 - index)}
								<p
									className={`my-auto ml-5 text-xl ${SIZE - 1 - index === currentStep ? 'text-black' : 'text-gray-400'}`}
								>
									{step.title}
								</p>
							</div>
						))}
				</div>
				{/* 3 LINES */}
				<div
					className={`absolute top-[207px] left-[207px] w-2 h-20 z-20 rounded-lg ${processValue > 75 ? 'bg-blue-600' : 'bg-gray-200'}`}
				></div>
				<div
					className={`absolute top-[365px] left-[207px] w-2 h-20 z-20 rounded-lg ${processValue > 50 ? 'bg-blue-600' : 'bg-gray-200'}`}
				></div>
				<div
					className={`absolute top-[525px] left-[207px] w-2 h-20 z-20 rounded-lg ${processValue > 25 ? 'bg-blue-600' : 'bg-gray-200'}`}
				></div>
				{/* DESCRIPTION */}
				<div className="w-[50%] h-full">
					<img
						src={steps[currentStep].gif}
						alt={`${steps[currentStep].title} gif`}
						className="w-[450px] h-[450px] mx-auto"
					/>
					{renderStepDescription(steps[currentStep])}
				</div>
			</div>
		</div>
	)
}

export default TrainModel2
