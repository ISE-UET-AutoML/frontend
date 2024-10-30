import { useReducer, useEffect, useState } from 'react'
import {
	TableCellsIcon,
	EyeIcon,
	EyeSlashIcon,
} from '@heroicons/react/20/solid'
import { PlusIcon } from '@heroicons/react/24/solid'
import DatasetCard from './card'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { DATATYPES } from 'src/constants/types'
import database from 'src/assets/images/background.png'
import databaseList from 'src/assets/images/listData.png'

const dataType = Object.keys(DATATYPES)
const initialState = {
	showUploader: false,
	datasets: [],
}

export default function DatasetList() {
	const [datasetState, updateDataState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		initialState
	)
	const [selectedOption, setSelectedOption] = useState('remote-url')

	const handleCreateDataset = async (event) => {
		event.preventDefault()

		console.log('OK')
	}

	const handleFileChange = (event) => {
		// if (projectInfo) {
		// 	const files = Array.from(event.target.files)

		// 	const validatedFiles = validateFiles(files, projectInfo.type)
		// 	updateProjState({ uploadFiles: validatedFiles })
		// }
		console.log('Ok')
	}

	return (
		<>
			<div
				className={` ${
					datasetState.showUploader ? 'blur-[2px]' : ''
				} mx-auto w-full flex-grow lg:flex xl:px-2 -z-10 mt-2`}
			>
				{/* Left sidebar & main wrapper */}
				<div className="min-w-0 flex-1 bg-white xl:flex p-5 rounded-md">
					{/* Projects List */}
					<div className="bg-white lg:min-w-0 lg:flex-1">
						<div className="flex justify-between mx-auto px-3 mb-5 ">
							<div className="px-4 lg:px-0">
								<h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
									Datasets
								</h1>
								{/* Meta info */}
								<div className="flex mt-5 flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-6">
									<div className="flex items-center space-x-2">
										<TableCellsIcon
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
										<span className="text-sm font-medium text-gray-500">
											{datasetState.datasets.length}{' '}
											Datasets
										</span>
									</div>
								</div>
							</div>
							{/* Action buttons */}
							<div className="flex flex-col sm:flex-row xl:flex-col">
								<button
									type="button"
									className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer h-fit"
									onClick={() =>
										updateDataState({ showUploader: true })
									}
								>
									<PlusIcon
										className="-ml-1 mr-2 h-5 w-5"
										aria-hidden="true"
									/>
									New Dataset
								</button>
							</div>
						</div>

						{datasetState.datasets.length > 0 ? (
							<div className="px-3  mx-auto pt-5 overflow-hidden grid sm:grid-cols-2 xl:grid-cols-3 gap-5 py-4">
								{datasetState.datasets.map((project) => (
									<DatasetCard
										key={dataset._id}
										dataset={dataset}
										getDatasets={getDatasets}
									/>
								))}
							</div>
						) : (
							<div className="text-center">
								<svg
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
									className="mx-auto h-12 w-12 text-gray-400"
								>
									<path
										vectorEffect="non-scaling-stroke"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
									/>
								</svg>

								<h3 className="mt-2 text-sm font-medium text-gray-900">
									No datasets
								</h3>
								<p className="mt-1 text-sm text-gray-500">
									Get started by creating a new dataset.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Crete new dataset UI */}
			<div
				className={`${
					datasetState.showUploader
						? 'right-0 !z-[1000] opacity-100'
						: 'right-[-100%] opacity-0'
				} fixed h-full w-1/2 px-[30px] bg-white transition-all duration-500 ease-in-out overflow-auto min-h-screen top-0`}
			>
				<div className="flex items-center mt-3">
					<button
						onClick={() => updateDataState({ showUploader: false })}
						className="p-[12px] rounded-full bg-transparent hover:bg-gray-300 hover:text-white font-[600] w-[48px] h-[48px]"
					>
						<svg
							className=""
							focusable="false"
							viewBox="0 0 24 24"
							color="#69717A"
							aria-hidden="true"
							data-testid="close-upload-media-dialog-btn"
						>
							<path d="M18.3 5.71a.9959.9959 0 00-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
						</svg>
					</button>
					<h1 className="font-bold ml-3 text-xl">Upload Data</h1>
				</div>
				<form
					className=" space-y-3"
					action="#"
					onSubmit={handleCreateDataset}
				>
					<div className="">
						<label
							htmlFor="name"
							className="block font-medium text-xl text-gray-700"
						>
							Title
						</label>
						<input
							type="text"
							name="name"
							id="name"
							required
							minLength={6}
							className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
							placeholder="Dataset Title"
						/>
					</div>
					<div className="">
						<label
							htmlFor="type"
							className="block font-medium text-xl text-gray-700"
						>
							Type
						</label>
						<select
							id="type"
							name="type"
							className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
						>
							{dataType.map((type) => (
								<option key={type} value={type}>
									{DATATYPES[type].type}
								</option>
							))}
						</select>
					</div>
					<div className="">
						<label
							htmlFor="visibility"
							className="block font-medium text-xl text-gray-700"
						>
							Visibility
						</label>
						<div className="flex w-full mt-1  border-gray-300 bg-white ">
							<button className="flex items-center space-x-2 px-2 py-2 w-1/2 border-gray-300 border rounded-md">
								<EyeSlashIcon
									className="h-5 w-5 text-gray-400"
									aria-hidden="true"
								/>
								<span className="ml-2">Private</span>
							</button>
							<button className="flex items-center space-x-2 ml-3 px-2 py-2 w-1/2 border-gray-300 border rounded-md">
								<EyeIcon
									className="h-5 w-5 text-gray-400"
									aria-hidden="true"
								/>
								<span className="ml-2">Public</span>
							</button>
						</div>
					</div>
					<TabGroup className="w-full">
						<TabList className="flex space-x-10 rounded-lg">
							<Tab
								className={({ selected }) =>
									`w-max py-2.5 text-xl leading-5 font-medium transition duration-200 ease-in-out 
            ${selected ? 'text-black border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`
								}
							>
								File
							</Tab>
							<Tab
								className={({ selected }) =>
									`w-max py-2.5 text-xl leading-5 font-medium transition duration-200 ease-in-out 
            ${selected ? 'text-black border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`
								}
							>
								Link
							</Tab>
						</TabList>

						<div className="border-b border-gray-300" />

						<TabPanels className="mt-2 bg-white rounded-lg">
							<TabPanel>
								<label
									htmlFor="classification"
									className="mt-4 h-[180px] flex justify-around items-center mx-auto border-[2px] border-dashed border-gray-500 rounded-[15px] hover:border-[#3498db]"
								>
									<div className="w-full h-full bg-white p-5  cursor-pointer rounded-[15px]">
										<div className="flex flex-col">
											<img
												src={database}
												alt=""
												className="mt-5 w-[200px] h-full mx-auto"
											/>

											{/* <p className="text-center text-[15px] font-[300]">
												{(projectInfo &&
													TYPES[projectInfo.type]
														?.description) ||
													'No description available'}
											</p> */}
										</div>
									</div>
									<div className="w-full h-full bg-white p-5 cursor-pointer rounded-[15px]">
										<div className="flex flex-col">
											<img
												src={databaseList}
												alt=""
												className="mt-5 w-[200px] h-full mx-auto"
											/>

											<p className="text-center text-[15px] font-[300]">
												Folder information will be
												automatically tagged as metadata
												to each media{' '}
											</p>
										</div>
									</div>
									<input
										type="file"
										name="files"
										webkitdirectory="true"
										id="classification"
										className="hidden"
										onChange={handleFileChange}
									/>
								</label>
								<div className="h-max-[110px] border-b border-gray-300 mt-2">
									<div className="text-gray-500">Files</div>
								</div>
							</TabPanel>
							<TabPanel>
								<div className="mb-2 flex space-x-4 border-gray-300 border rounded-lg px-5 py-3">
									<input
										type="radio"
										name="import-option"
										value="remote-url"
										checked={
											selectedOption === 'remote-url'
										}
										onChange={() =>
											setSelectedOption('remote-url')
										}
									/>
									<img
										src="https://www.kaggle.com/static/images/datasets/uploader/remote_url_light.svg"
										alt=""
										width="64"
										height="64"
									/>
									<div>
										<h1 className="text-xl font-bold">
											Remote URL
										</h1>
										<p className="text-sm">
											Create a dataset from remote URLs.
											URLs must point to a file.
										</p>
									</div>
								</div>
								<div className="mb-2 flex space-x-4 border-gray-300 border rounded-lg px-5 py-3">
									<input
										type="radio"
										name="import-option"
										value="github-url"
										checked={
											selectedOption === 'github-url'
										}
										onChange={() =>
											setSelectedOption('github-url')
										}
									/>
									<img
										src="https://www.kaggle.com/static/images/datasets/uploader/import_github_repository_light.svg"
										alt=""
										width="64"
										height="64"
									/>
									<div>
										<h1 className="text-xl font-bold">
											Import GitHub repository
										</h1>
										<p className="text-sm">
											Create from a GitHub repository
											archive. Use the repo URL or any
											deep link.
										</p>
									</div>
								</div>
								<div className=" flex space-x-4 border-gray-300 border rounded-lg px-5 py-3">
									<input
										type="radio"
										name="import-option"
										value="cloud-url"
										checked={selectedOption === 'cloud-url'}
										onChange={() =>
											setSelectedOption('cloud-url')
										}
									/>
									<img
										src="https://www.kaggle.com/static/images/datasets/uploader/google_cloud_storage_light.svg"
										alt=""
										width="64"
										height="64"
									/>
									<div>
										<h1 className="text-xl font-bold">
											Import Cloud Storage
										</h1>
										<p className="text-sm">
											Create a dataset from a public Cloud
											Storage bucket. URLs must point to a
											bucket or path. Ex: gs://bucket/path
										</p>
									</div>
								</div>

								<input
									type="text"
									name="url"
									id="name"
									required
									minLength={6}
									className="mt-2 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
									placeholder="URL"
								/>
							</TabPanel>
						</TabPanels>
					</TabGroup>

					<div className="text-right">
						<button
							type="submit"
							className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-5 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							Create
						</button>
					</div>
				</form>
			</div>
		</>
	)
}
