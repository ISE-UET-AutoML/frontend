import { useState, useEffect } from 'react'
import { message } from 'antd'
import { CheckCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import * as experimentAPI from 'src/api/experiment'

const DeployView = (props) => {
	const { experimentName, updateProjState } = props
	const steps = [
		'Launching Instances',
		'Install necessary dependencies',
		'Configuring Environment',
		'Deploying Application',
	]
	const [deployOpt, setDeployOpt] = useState('REALTIME')
	const [isDeploying, setIsDeploying] = useState(false)
	const [progress, setProgress] = useState(0)
	const [isDone, setIsDone] = useState(false)

	useEffect(() => {
		const interval = setInterval(() => {
			if (!isDone) {
				setProgress((prev) => {
					const newProgress = Math.min(prev + 2, 100)
					if (newProgress === 100) {
						setIsDone(true)
						console.log('Done')
						// updateProjState({ showUploadPanel: true })
					}
					return newProgress
				})
			}
		}, 6000)

		return () => clearInterval(interval)
	}, [isDone])

	const getStepClassName = (index) => {
		const stepCompletionThreshold = 100 / steps.length
		return progress >= stepCompletionThreshold * index
			? 'text-lg italic text-blue-600 font-bold'
			: 'text-lg italic text-gray-400'
	}

	const getStepIcon = (index) => {
		const stepCompletionThreshold = 100 / steps.length
		if (progress >= stepCompletionThreshold * (index + 1)) {
			return (
				<CheckCircleIcon className="inline-block ml-2 text-green-500 h-5 w-5" />
			)
		} else if (progress >= stepCompletionThreshold * index) {
			return (
				<Cog6ToothIcon className="inline-block ml-2 animate-spin-slow text-blue-600 h-5 w-5" />
			)
		} else {
			return null
		}
	}

	const deployModel = async () => {
		if (experimentName && deployOpt) {
			setIsDeploying(true)

			try {
				const { data } = await experimentAPI.deployModel(
					experimentName,
					deployOpt
				)

				console.log('deploy Model data', data)
			} catch (error) {
				console.error('Error training model:', error)
				message.error('Deploy Model Failed', 5)
			} finally {
				// setIsDeploying(false)
				console.log('Deploying')
			}
		}
	}

	return (
		<>
			{isDeploying ? (
				// DEPLOYMENT PROCESS
				<div>
					<h1 className="font-bold text-4xl w-full text-center mt-10">
						Deployment Process
					</h1>
					<div className="space-y-4 w-full text-center mt-5">
						{steps.map((step, index) => (
							<h2 key={index} className={getStepClassName(index)}>
								{index + 1}. {step}
								{getStepIcon(index)}
							</h2>
						))}
					</div>
					{/* PROGRESS BAR */}
					<div className="w-1/2 bg-gray-200 rounded-full h-4 mt-10 relative ml-[350px]">
						<div
							className="bg-blue-600 h-4 rounded-full"
							style={{ width: `${progress}%` }}
						></div>
						<span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black text-sm">
							{progress}%
						</span>
					</div>

					{/* UPLOAD BUTTON */}
					{isDone && (
						<div className="w-full h-10 pt-10 flex justify-center items-center">
							<button
								className="btn"
								onClick={() => {
									updateProjState({ showUploadPanel: true })
								}}
							>
								<svg
									height="24"
									width="24"
									fill="#FFFFFF"
									viewBox="0 0 24 24"
									data-name="Layer 1"
									id="Layer_1"
									className="sparkle"
								>
									<path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
								</svg>
								<span className="text">
									Upload File to Predict
								</span>
							</button>
						</div>
					)}
					{/* DEPLOY AGAIN */}
					{/* <div className="w-full h-10 pt-10 flex justify-center items-center">
						<button
							className="btn"
							onClick={() => {
								setIsDeploying(false)
							}}
						>
							<svg
								height="24"
								width="24"
								fill="#FFFFFF"
								viewBox="0 0 24 24"
								data-name="Layer 1"
								id="Layer_1"
								className="sparkle"
							>
								<path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
							</svg>
							<span className="text">Deploy Again</span>
						</button>
					</div> */}
					{/* EXIT BUTTON */}
					<button
						onClick={() => {
							updateProjState({ showDeployView: false })
						}}
						className="absolute top-5 right-5  p-[6px] rounded-lg bg-white hover:bg-gray-300 hover:text-white font-[600] w-[40px] h-[40px]"
					>
						<svg
							className="hover:scale-125 hover:fill-red-500"
							focusable="false"
							viewBox="0 0 24 24"
							color="#69717A"
							aria-hidden="true"
							data-testid="close-upload-media-dialog-btn"
						>
							<path d="M18.3 5.71a.9959.9959 0 00-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
						</svg>
					</button>
				</div>
			) : (
				// CHOOSE OPTION TO DEPLOY
				<div>
					<h1 className="font-bold text-4xl w-full text-center mt-10">
						Deploy Option
					</h1>
					<div className="w-full grid grid-cols-2 grid-rows-2 h-[230px] p-4 gap-5 mt-4 text-xl">
						<button
							className={`col-span-1 row-span-1 border-2 border-dashed rounded-lg ${deployOpt === 'REALTIME' ? 'bg-blue-100 border-blue-500' : 'border-black hover:border-blue-700 hover:bg-blue-100'}`}
							onClick={() => setDeployOpt('REALTIME')}
						>
							Real Time
						</button>
						<button
							className={`col-span-1 row-span-1 border-2 border-dashed rounded-lg ${deployOpt === 'ASYNC' ? 'bg-blue-100 border-blue-500' : 'border-black hover:border-blue-700 hover:bg-blue-100'}`}
							onClick={() => setDeployOpt('ASYNC')}
						>
							Asynchronous
						</button>
						<button
							className={`col-span-1 row-span-1 border-2 border-dashed rounded-lg ${deployOpt === 'BATCHTRANSFORM' ? 'bg-blue-100 border-blue-500' : 'border-black hover:border-blue-700 hover:bg-blue-100'}`}
							onClick={() => setDeployOpt('BATCHTRANSFORM')}
						>
							Batch Transform
						</button>
						<button
							className={`col-span-1 row-span-1 border-2 border-dashed rounded-lg ${deployOpt === 'SERVERLESS' ? 'bg-blue-100 border-blue-500' : 'border-green-600 bg-green-100 hover:border-blue-700 hover:bg-blue-100'}`}
							onClick={() => setDeployOpt('SERVERLESS')}
						>
							Serverless
							<span className="text-sm italic">
								{' (recommended)'}
							</span>
						</button>
					</div>
					<div className="w-full pt-5 flex justify-center items-center">
						<button className="btn" onClick={deployModel}>
							<span className="text">Deploy</span>
							<svg
								height="24"
								width="24"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="#FFFFFF"
								className="sparkle"
							>
								<path
									fillRule="evenodd"
									d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"
									clipRule="evenodd"
								/>
								<path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
							</svg>
						</button>
					</div>
				</div>
			)}
		</>
	)
}

export default DeployView
