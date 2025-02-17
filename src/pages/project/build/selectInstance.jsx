import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { message, Card, InputNumber, Slider } from 'antd'
import * as projectAPI from 'src/api/project'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import Loading from 'src/components/Loading'

const services = ['VastAI', 'AWS EC2', 'GCP Compute']
const gpuNames = ['RTX_3060', 'RTX_4090']

const SelectInstance = (props) => {
	const [searchParams, setSearchParams] = useSearchParams()
	const { id: projectID } = useParams()
	const [selectedTab, setSelectedTab] = useState('Automatic')
	const [formData, setFormData] = useState({
		service: services[0],
		gpuNumber: '',
		gpuName: gpuNames[0],
		disk: '',
		trainingTime: '',
		budget: '',
	})
	const [trainingTime, setTrainingTime] = useState(0)

	const handleChangeTime = (value) => {
		setTrainingTime(value)
	}
	const [isLoading, setIsLoading] = useState(false)
	const [isHasInstance, setIsHasInstance] = useState(false)
	const [isCreateInstance, setIsCreateInstance] = useState(false)

	const gpuLevels = [
		{ name: 'RTX 3060', gpuNumber: 1, disk: 10, cost: 0.2 },
		{ name: 'RTX 3070', gpuNumber: 2, disk: 20, cost: 0.4 },
		{ name: 'RTX 3080', gpuNumber: 3, disk: 30, cost: 0.6 },
		{ name: 'RTX 3090', gpuNumber: 4, disk: 40, cost: 0.8 },
		{ name: 'RTX 4090', gpuNumber: 5, disk: 50, cost: 1.0 },
	]

	useEffect(() => {
		if (selectedTab === 'Automatic') {
			setFormData({
				service: '',
				gpuNumber: '',
				gpuName: '',
				disk: '',
				trainingTime: '',
				budget: '',
			})
		} else {
			setFormData({
				service: services[0],
				gpuNumber: '',
				gpuName: gpuNames[0],
				disk: '',
				trainingTime: '',
				budget: '',
			})
		}
	}, [selectedTab])

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prevData) => ({ ...prevData, [name]: value }))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		const confirmation = window.confirm(
			'Please check your instance information before training?'
		)
		if (confirmation) {
			setIsCreateInstance(true)

			try {
				const res = await projectAPI.trainModel(
					projectID,
					props.selectedDataset,
					formData
				)

				searchParams.set('experiment_name', res.data.data.task_id)
				setSearchParams(searchParams)

				props.updateFields({
					isDoneSelectInstance: true,
					instanceInfor: res.data.instance_info,
				})

				message.success('Strating Training Process', 3)
			} catch (error) {
				console.error('Error training model:', error)
				message.error('Error training model', 3)
			} finally {
				setIsCreateInstance(false)
			}
		} else {
			alert('Please adjust your instance.')
		}
	}

	const findInstance = (e) => {
		if (trainingTime === 0) {
			message.error('Training Time must be greater than 0', 3)
			return
		}

		setIsLoading(true)

		const levelIndex = Math.floor(Math.random() * gpuLevels.length)
		const selectedGPU = gpuLevels[levelIndex]

		setTimeout(() => {
			setIsLoading(false)
			setIsHasInstance(true)

			setFormData({
				service: services[Math.floor(Math.random() * services.length)],
				gpuNumber: selectedGPU.gpuNumber,
				gpuName: selectedGPU.name,
				disk: selectedGPU.disk,
				trainingTime: trainingTime,
				budget: selectedGPU.cost * trainingTime, // Tính chi phí theo thời gian
			})

			message.success('Found Suitable Instance', 3)
		}, 2000)
	}

	return (
		<div className="w-full h-[105%] mt-6">
			{isLoading ? <Loading /> : ''}
			<TabGroup
				className="w-full h-[90%]"
				onChange={(index) =>
					setSelectedTab(index === 0 ? 'Automatic' : 'Manual')
				}
			>
				<TabList className="w-full items-center justify-center ">
					<Tab
						className={({ selected }) =>
							`w-1/2 py-2.5 text-xl leading-5 font-medium transition duration-200 ease-in-out
            ${selected ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-blue-700'}`
						}
					>
						Automatic
					</Tab>
					<Tab
						className={({ selected }) =>
							`w-1/2 py-2.5 text-xl leading-5 font-medium transition duration-200 ease-in-out border-l-2
            ${selected ? 'text-blue-700 border-b-2 border-b-blue-700' : 'text-gray-500 hover:text-blue-700'}`
						}
					>
						Manual
					</Tab>
				</TabList>
				<TabPanels className="mt-2">
					<TabPanel>
						<div className="flex h-full w-full">
							<div className="w-[50%] mt-10 flex justify-center">
								<div className="w-[90%] h-full space-y-4">
									<Card className="w-full h-[40%] shadow-lg border border-gray-200 bg-gradient-to-b from-gray-50 to-white rounded-lg">
										<label
											className="block mb-2 text-xl font-bold"
											htmlFor="trainingTime"
										>
											Training Time (h):
										</label>
										<InputNumber
											prefix="🕒"
											className="w-full"
											min={0} // Đảm bảo giá trị >= 0
											value={trainingTime}
											onChange={handleChangeTime}
										></InputNumber>
									</Card>
									<Card className="w-full h-[40%] shadow-lg border border-gray-200 bg-gradient-to-b from-gray-50 to-white rounded-lg">
										<label
											className="block mb-2 text-xl font-bold"
											htmlFor="trainingTime"
										>
											<strong className="text-xl">
												Cost ($):
											</strong>{' '}
											{formData.budget}
										</label>
									</Card>

									{trainingTime > 0 && (
										<button
											className="w-full p-2 bg-blue-500 text-white rounded"
											onClick={findInstance}
										>
											Find Suitable Instance
										</button>
									)}
								</div>
								<div className="w-[5%] h-[87%]">
									<Slider
										vertical
										defaultValue={40}
										min={0}
										max={100}
										marks={{
											0: 'Small',
											25: 'Medium',
											50: 'Large',
											75: 'X-Large',
											100: 'XX-Large',
										}}
										step={1}
										className="h-full"
										tooltip={{
											formatter: (value) => {
												if (value <= 25) return 'Small'
												if (value <= 50) return 'Medium'
												if (value <= 75) return 'Large'
												if (value <= 100)
													return 'X-Large'
												return 'XX-Large'
											},
										}}
									/>
								</div>
							</div>

							<div className="h-full w-[50%] p-8">
								<div className="w-full h-full p-2 rounded-2xl bg-blue-50">
									<div className="w-full h-full rounded-2xl border-2 border-blue-800 border-dashed">
										<h1 className="w-full h-max text-2xl text-center mt-5 font-bold text-black">
											Instance Information
										</h1>
										<div className="p-4 mt-9 ml-5 space-y-12 text-lg">
											<p>
												<strong className="text-xl">
													Service:
												</strong>{' '}
												{formData.service}
											</p>
											<p>
												<strong className="text-xl">
													GPU Number:
												</strong>{' '}
												{formData.gpuNumber}
											</p>
											<p>
												<strong className="text-xl">
													GPU Name:
												</strong>{' '}
												{formData.gpuName}
											</p>
											<p>
												<strong className="text-xl">
													Disk:
												</strong>{' '}
												{formData.disk}
											</p>

											<p>
												<strong className="text-xl">
													Training Time(s):
												</strong>{' '}
												{formData.trainingTime}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</TabPanel>
					<TabPanel>
						<div className="flex h-[90%] w-full">
							<div className="h-full w-[50%] mt-8">
								<form
									id="infoForm"
									onSubmit={handleSubmit}
									className="p-4"
								>
									<label
										className="block mb-2 text-xl font-bold"
										htmlFor="service"
									>
										Service:
									</label>
									<select
										id="service"
										name="service"
										value={formData.service}
										onChange={handleChange}
										className="w-full p-2 border border-gray-300 rounded mb-4"
										required
									>
										{services.map((service, index) => (
											<option key={index} value={service}>
												{service}
											</option>
										))}
									</select>

									<label
										className="block mb-2 text-xl font-bold"
										htmlFor="gpuNumber"
									>
										GPU Number:
									</label>
									<input
										type="number"
										id="gpuNumber"
										name="gpuNumber"
										value={formData.gpuNumber}
										onChange={handleChange}
										className="w-full p-2 border border-gray-300 rounded mb-4"
										required
									/>

									<label
										className="block mb-2 text-xl font-bold"
										htmlFor="gpuName"
									>
										GPU Name:
									</label>
									<select
										id="gpuName"
										name="gpuName"
										value={formData.gpuName}
										onChange={handleChange}
										className="w-full p-2 border border-gray-300 rounded mb-4"
										required
									>
										{gpuNames.map((gpuName, index) => (
											<option key={index} value={gpuName}>
												{gpuName}
											</option>
										))}
									</select>

									<label
										className="block mb-2 text-xl font-bold"
										htmlFor="disk"
									>
										Disk:
									</label>
									<input
										type="text"
										id="disk"
										name="disk"
										value={formData.disk}
										onChange={handleChange}
										className="w-full p-2 border border-gray-300 rounded mb-4"
										required
									/>

									<label
										className="block mb-2 text-xl font-bold"
										htmlFor="trainingTime"
									>
										Training Time(s):
									</label>
									<input
										type="number"
										id="trainingTime"
										name="trainingTime"
										value={formData.trainingTime}
										onChange={handleChange}
										className="w-full p-2 border border-gray-300 rounded mb-4"
										required
									/>
								</form>
							</div>
							<div className="h-full w-[50%] p-8">
								<div className="w-full h-full p-2 rounded-2xl bg-blue-50">
									<div className="w-full h-full rounded-2xl border-2 border-blue-800 border-dashed">
										<h1 className="w-full h-max text-2xl text-center mt-5 font-bold text-black">
											Instance Information
										</h1>
										<div className="p-4 mt-9 ml-5 space-y-12 text-lg">
											<p>
												<strong className="text-xl">
													Service:
												</strong>{' '}
												{formData.service}
											</p>
											<p>
												<strong className="text-xl">
													GPU Number:
												</strong>{' '}
												{formData.gpuNumber}
											</p>
											<p>
												<strong className="text-xl">
													GPU Name:
												</strong>{' '}
												{formData.gpuName}
											</p>
											<p>
												<strong className="text-xl">
													Disk:
												</strong>{' '}
												{formData.disk}
											</p>

											<p>
												<strong className="text-xl">
													Training Time(s):
												</strong>{' '}
												{formData.trainingTime}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</TabPanel>
				</TabPanels>
			</TabGroup>

			{isCreateInstance ? (
				<>
					<div
						className="w-full p-2 text-2xl text-center text-yellow-500 rounded"
						style={{ animation: 'blink 5s infinite' }}
					>
						⚡ Initializing instance... This process usually takes
						about 45 seconds to 1 minute.
					</div>

					<style>
						{`
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `}
					</style>
				</>
			) : (
				<>
					{isHasInstance && (
						<div className="w-full flex justify-center items-center">
							<button
								className="btn"
								onClick={(e) => {
									e.preventDefault()
									handleSubmit(e)
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
								<span className="text">Train Model</span>
							</button>
						</div>
					)}
				</>
			)}
		</div>
	)
}

export default SelectInstance
