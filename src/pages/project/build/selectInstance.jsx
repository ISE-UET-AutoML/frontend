import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { message } from 'antd'
import * as projectAPI from 'src/api/project'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import Loading from 'src/components/Loading'

const services = ['VastAI', 'AWS EC2', 'GCP Compute']
const gpuNames = ['RTX_3060', 'RTX_4090']
const images = ['pytorch/pytorch:2.1.2-cuda12.1-cudnn8-runtime', 'image2']

const SelectInstance = (props) => {
	const [searchParams, setSearchParams] = useSearchParams()
	const { id: projectID } = useParams()
	const [selectedTab, setSelectedTab] = useState('Automatic')
	const [formData, setFormData] = useState({
		service: services[0],
		gpuNumber: '',
		gpuName: gpuNames[0],
		disk: '',
		image: images[0],
		trainingTime: '',
		budget: '',
	})
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (selectedTab === 'Automatic') {
			setFormData({
				service: '',
				gpuNumber: '',
				gpuName: '',
				disk: '',
				image: '',
				trainingTime: '',
				budget: '',
			})
		} else {
			setFormData({
				service: services[0],
				gpuNumber: '',
				gpuName: gpuNames[0],
				disk: '',
				image: images[0],
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
			setIsLoading(true)

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
				// updateProjState({ isUploading: false })
			}
		} else {
			alert('Please adjust your instance.')
		}
	}

	const findInstance = (e) => {
		e.preventDefault()

		setIsLoading(true)

		const randomGPU = Math.floor(Math.random() * 4) + 1
		const randomDisk = Math.floor(Math.random() * 31) + 10

		setTimeout(() => {
			setIsLoading(false)

			setFormData({
				service: services[Math.floor(Math.random() * services.length)],
				gpuNumber: randomGPU,
				gpuName: gpuNames[Math.floor(Math.random() * gpuNames.length)],
				disk: randomDisk,
				image: images[Math.floor(Math.random() * images.length)],
				trainingTime: formData.trainingTime,
				budget: formData.budget,
			})

			message.success('Finded Suitable Instance', 3)
		}, 5000)
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
							<div className="h-full w-[50%] mt-10">
								<form
									id="infoForm"
									onSubmit={findInstance}
									className="p-4"
								>
									<label
										className="block mb-2 text-xl font-bold"
										htmlFor="disk"
									>
										Budget ($):
									</label>
									<input
										type="number"
										id="budget"
										name="budget"
										value={formData.budget}
										onChange={handleChange}
										className="w-full p-2 border border-gray-300 rounded mb-4"
										required
									/>
									<label
										className="block mb-2 text-xl font-bold"
										htmlFor="trainingTime"
									>
										Training Time (s):
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

									<button
										type="submit"
										className="w-full p-2 bg-blue-500 text-white rounded"
									>
										Find Suitable Instance
									</button>
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
													Image:
												</strong>{' '}
												{formData.image}
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
							<div className="h-full w-[50%] mt-5">
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
										htmlFor="image"
									>
										Image:
									</label>
									<select
										id="image"
										name="image"
										value={formData.image}
										onChange={handleChange}
										className="w-full p-2 border border-gray-300 rounded mb-4"
										required
									>
										{images.map((image, index) => (
											<option key={index} value={image}>
												{image}
											</option>
										))}
									</select>

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
													Image:
												</strong>{' '}
												{formData.image}
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
		</div>
	)
}

export default SelectInstance
