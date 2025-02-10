/* eslint-disable no-unused-vars */
import { message } from 'antd'
import React, { useReducer, useState, useEffect } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import * as projectAPI from 'src/api/project'
import { UploadTypes } from 'src/constants/file'
import { validateFiles } from 'src/utils/file'
import Loading from 'src/components/Loading'
import { TYPES } from 'src/constants/types'
import database from 'src/assets/images/background.png'
import databaseList from 'src/assets/images/listData.png'
import * as datasetAPI from 'src/api/dataset'
import config from './config'
import Papa from 'papaparse'

const LOAD_CHUNK = 12

const initialState = {
	show: false,
	showUploader: false,
	selectedBuild: null,
	uploadFiles: [],
	loadedChunk: LOAD_CHUNK,
	isUploading: false,
}

const Dashboard = ({ updateFields, projectInfo }) => {
	//state
	const [projectState, updateProjState] = useReducer((pre, next) => {
		return { ...pre, ...next }
	}, initialState)

	const [searchParams, setSearchParams] = useSearchParams()
	const location = useLocation()
	const { id: projectID } = useParams()
	const [previewData, setPreviewData] = useState({})
	const [editedData, setEditedData] = useState([])
	const [dataFeature, setDataFeature] = useState([])
	const [isLocked, setIsLocked] = useState(false)
	const [datasets, setDatasets] = useState([])
	const [serviceFilter, setServiceFilter] = useState('')
	const [bucketFilter, setBucketFilter] = useState('')
	const [selectedDataset, setSelectedDataset] = useState(null)

	const getDatasets = async () => {
		try {
			const response = await datasetAPI.getDatasets()
			if (Array.isArray(response.data)) {
				setDatasets(response.data)
			} else {
				console.error('Dataset is not an array:', response.data)
			}
			console.log('Dataset List:', response.data)
		} catch (error) {
			console.error('Error fetching datasets:', error)
		}
	}

	useEffect(() => {
		getDatasets()
	}, [])

	const handleServiceChange = (e) => {
		setServiceFilter(e.target.value)
	}
	const handleBucketChange = (e) => {
		setBucketFilter(e.target.value)
	}
	// if (dataset && projectInfo) {}
	const filteredDatasets = projectInfo
		? datasets.filter(
				(item) =>
					(serviceFilter === '' || item.service === serviceFilter) &&
					(bucketFilter === '' || item.bucketName === bucketFilter) &&
					item.type === projectInfo.type
			)
		: datasets

	// handler
	const handleFileChange = (event) => {
		if (projectInfo) {
			const files = Array.from(event.target.files)

			const validatedFiles = validateFiles(files, projectInfo.type)
			updateProjState({ uploadFiles: validatedFiles })
		}
	}

	const handleRemoveFile = (index) => {
		const newState = [...projectState.uploadFiles]
		newState.splice(index, 1)
		updateProjState({ uploadFiles: newState })
	}

	const convertToCSV = (jsonData) => {
		const csvRows = []
		const headers = Object.keys(jsonData[0])
		csvRows.push(headers.join(','))

		jsonData.forEach((row) => {
			const values = headers.map((header) => {
				const escaped = ('' + row[header]).replace(/"/g, '\\"')
				return `"${escaped}"`
			})
			csvRows.push(values.join(','))
		})

		return csvRows.join('\n')
	}

	const convertPreviewToFile = (data) => {
		const csvData = convertToCSV(data)
		let fileName = 'train.csv'
		if (projectState.uploadFiles.length >= 0) {
			fileName = projectState.uploadFiles[0].name
		}
		const blob = new Blob([csvData], { type: 'text/csv' })
		const file = new File([blob], 'train.csv', { type: 'text/csv' })

		console.log(file)

		if (projectState.uploadFiles.length >= 0) {
			projectState.uploadFiles[0] = file
		} else {
			console.log('Failed: Upload files failed')
		}
	}

	// function upload 1 files here
	const uploadFiles = async (e) => {
		e.preventDefault()

		if (projectState.uploadFiles.length === 0) return

		if (
			projectState.uploadFiles !== undefined &&
			projectState.uploadFiles.length > 0
		) {
			if (
				projectInfo.type === 'TABULAR_CLASSIFICATION' ||
				projectInfo.type === 'MULTIMODAL_CLASSIFICATION'
			) {
				if (previewData.label_column == null && !isLocked) {
					window.alert('Please select target column and lock table')
					return
				} else if (previewData.label_column == null) {
					window.alert('Please select target column')
					return
				} else if (!isLocked) {
					window.alert('Please lock table')
					return
				}
			}
			const formData = new FormData()
			const object = config[projectInfo.type]

			// convert tabular preview to file to upload to backend
			if (
				projectInfo.type === 'TABULAR_CLASSIFICATION' ||
				projectInfo.type === 'MULTIMODAL_CLASSIFICATION'
			) {
				const result = editedData.map((obj) => {
					dataFeature.forEach((el) => {
						if (!el.isLabel && !el.isActivated) delete obj[el.value]
					})
					return obj
				})

				convertPreviewToFile(result)
			}

			if (object) {
				formData.append('type', object.folder)
			}

			if (previewData.label_column) {
				formData.append('import_args', JSON.stringify(previewData))
			}

			for (let i = 0; i < projectState.uploadFiles.length; i++) {
				// Convert file name with relative path to base64 string
				let fileNameBase64 = window.btoa(
					projectState.uploadFiles[i].webkitRelativePath
				)

				if (
					projectInfo.type === 'TABULAR_CLASSIFICATION' ||
					projectInfo.type === 'MULTIMODAL_CLASSIFICATION'
				) {
					fileNameBase64 = window.btoa(projectState.uploadFiles.name)
					console.log(projectState.uploadFiles.name)
					console.log(fileNameBase64)
					// fileNameBase64 = window.btoa('')
				}

				formData.append(
					'files',
					projectState.uploadFiles[i],
					fileNameBase64
				)
			}

			// console.log('formData', formData)

			try {
				updateProjState({ isUploading: true })
				projectAPI.uploadFiles(projectID, formData).then((data) => {
					const props = {
						files: data.data.tasks,
						labels: data.data.project_info.label_config,
						pagination: data.data.meta,
						updateFields: updateFields,
						projectInfo: data.data.project_info,
					}

					console.log(props)

					message.success('Successfully uploaded', 3)
					updateProjState({ isUploading: false })
					updateFields({
						isDoneUploadData: true,
						...props,
					})
				})
			} catch (error) {
				updateProjState({ isUploading: false })
				message.error('Upload Failed', 3)

				console.error(error)
			}
		}

		// TODO: validate folder structure
		// Nêú folder chỉ có toàn ảnh không có folder con thì hiển thị lỗi
	}

	const handleLoadChunk = () => {
		if (projectState.loadedChunk < projectState.uploadFiles.length) {
			updateProjState({
				loadedChunk: projectState.loadedChunk + LOAD_CHUNK,
			})
		}
	}

	const selectInstance = () => {
		if (projectInfo.type === 'TABULAR_CLASSIFICATION') {
			updateFields({
				isSelectTargetCol: true,
				selectedDataset: filteredDatasets[selectedDataset],
			})
		} else {
			updateFields({
				isDoneUploadData: true,
				selectedDataset: filteredDatasets[selectedDataset],
			})
		}
	}

	const bucketList = ['user-private-dataset', 'bucket-1']

	return (
		<div className="h-full">
			{projectState.isUploading ? <Loading /> : ''}
			{/* ----------------------------------------- CHOOSE DATABASE ------------------------------------  */}

			<div className="h-[44%] w-full flex">
				{/* FILTER AND BUTTON */}
				<div className="h-full w-[28%] space-y-2 bg-[rgba(0,110,255,0.041)] rounded-[10px] p-5">
					<p className="w-full text-xl font-bold">Service</p>
					<select
						value={serviceFilter}
						onChange={handleServiceChange}
						className="border-2 border-gray-300 w-full h-[15%] text-center text-lg rounded-[10px]"
					>
						<option value="">All Services</option>
						<option value="AWS_S3">AWS</option>
						<option value="GCP_STORAGE">
							GOOGLE CLOUD STORAGES
						</option>
					</select>

					<p className="w-full text-xl font-bold">Bucket</p>
					<select
						value={bucketFilter}
						onChange={handleBucketChange}
						className="border-2 border-gray-300 w-full h-[15%] text-center text-lg rounded-[10px]"
					>
						<option value="">All Buckets</option>
						{bucketList.map((bucket) => (
							<option key={bucket} value={bucket}>
								{bucket}
							</option>
						))}
					</select>
					{/* BUTTON */}
					<div className="w-full pt-10 flex justify-center items-center">
						{selectedDataset !== null && (
							<button className="btn" onClick={selectInstance}>
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
								<span className="text">Next</span>
							</button>
						)}
					</div>
				</div>
				{/* DATASETS TABLE */}
				<div className="h-full overflow-y-auto w-[70%] ml-4 bg-white [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
					<table className="w-full divide-y divide-gray-200 rounded-[10px] break-words">
						<thead className="bg-gradient-to-r bg-blue-500 font-bold rounded-[10px] border-2 border-blue-500">
							<tr>
								<td className="px-6 py-1 text-center font-bold text-white uppercase tracking-wider w-1/3">
									Title
								</td>
								<td className="px-6 py-1 text-center font-bold text-white uppercase tracking-wider w-1/3">
									Service
								</td>
								<td className="px-6 py-1 text-center font-bold text-white uppercase tracking-wider w-1/3">
									Bucket
								</td>
							</tr>
						</thead>
						<tbody className="bg-white font-bold">
							{filteredDatasets.map((data, index) => (
								<tr
									key={index}
									className={`hover:bg-gray-100 cursor-pointer ${selectedDataset === index ? 'border-2 border-blue-700 bg-[rgba(0,110,255,0.041)]' : ''}`}
									onClick={() => {
										setSelectedDataset(index)
									}}
								>
									<td className="px-6 py-1 text-center">
										{data.title}
									</td>
									<td className="px-6 py-1 text-center">
										{data.service}
									</td>
									<td className="px-6 py-1 text-center">
										{data.bucketName}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			{/* ----------------------------------------- DIVIDER -----------------------------------------  */}
			<div className="w-full flex items-center justify-center my-3">
				<div className="flex-grow border-t border-gray-300"></div>
				<span className="mx-3 text-gray-500">OR</span>
				<div className="flex-grow border-t border-gray-300"></div>
			</div>
			{/* ----------------------------------------- UPLOAD FILES ------------------------------------  */}
			{/* uploaded */}
			<div
				onClick={() => updateProjState({ show: true })}
				className="flex flex-col cursor-pointer shadow justify-between mx-auto items-center p-[10px] gap-[5px] bg-[rgba(0,110,255,0.041)] rounded-[10px] h-[50%]"
			>
				<div className="header flex flex-1 w-full border-[2px] justify-center items-center flex-col border-dashed border-[#4169e1] rounded-[10px]">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="100"
						height="100"
						fill="none"
						viewBox="0 0 100 100"
						className="scale-150"
					>
						<mask
							id="mask0_908_734"
							style={{ maskType: 'alpha' }}
							width="100"
							height="100"
							x="0"
							y="0"
							maskUnits="userSpaceOnUse"
						>
							<path fill="#D9D9D9" d="M0 0H100V100H0z"></path>
						</mask>
						<g mask="url(#mask0_908_734)">
							<path
								fill="#65A4FE"
								d="M45.833 83.333h-18.75c-6.319 0-11.718-2.187-16.195-6.562-4.481-4.375-6.721-9.722-6.721-16.042 0-5.416 1.632-10.243 4.896-14.479 3.263-4.236 7.534-6.944 12.812-8.125 1.736-6.389 5.208-11.562 10.417-15.52 5.208-3.96 11.11-5.938 17.708-5.938 8.125 0 15.017 2.829 20.675 8.487 5.661 5.661 8.492 12.554 8.492 20.68 4.791.555 8.768 2.62 11.929 6.195 3.158 3.578 4.737 7.763 4.737 12.554 0 5.209-1.822 9.636-5.466 13.284-3.648 3.644-8.075 5.466-13.284 5.466H54.167V53.542L60.833 60l5.834-5.833L50 37.5 33.333 54.167 39.167 60l6.666-6.458v29.791z"
							></path>
						</g>
					</svg>
					<p className="text-center text-black mt-5">
						Browse File to upload!
					</p>
				</div>
			</div>
			{/* bottom up modal of image classify */}
			<div
				className={`${
					projectState.show
						? 'top-0 bottom-full z-[1000] opacity-100 left-0'
						: 'top-full bottom-0 opacity-0'
				} fixed flex flex-col items-center h-full w-full px-[30px] justify-center bg-white  transition-all duration-500 ease`}
			>
				<button
					onClick={() => updateProjState({ show: false })}
					className="absolute top-5 right-5 p-[12px] rounded-full bg-white hover:bg-gray-300 hover:text-white font-[600] w-[48px] h-[48px]"
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
				<h3 className="text-center w-full text-[30px] font-[500] leading-[1.16] mb-8 mt-4">
					Select how you want to upload
				</h3>
				<div className="container flex justify-around items-center mx-auto gap-4">
					<div
						onClick={() => updateProjState({ showUploader: true })}
						className="w-full h-full bg-white p-10 rounded-md hover:scale-[1.02] transition-all ease-linear duration-100   cursor-pointer shadow-[0px_8px_24px_rgba(0,53,133,0.1)]"
					>
						<div className="flex flex-col">
							<p className="text-center text-[24px] ">
								Unlabelled dataset upload
							</p>
							<p className="text-center text-[16px] font-[300]">
								uploaded dataset will be raw status, you can
								classify them using the platform labeling tool
							</p>
							<img
								src="https://dr23pab8nlq87.cloudfront.net/images/classification_upload_unclassified-3KDZ.png"
								alt=""
								className="mt-5"
							/>
						</div>
					</div>
					<div
						onClick={() => updateProjState({ showUploader: true })}
						className="w-full h-full bg-white p-10 rounded-md hover:scale-[1.02] transition-all ease-linear duration-100   cursor-pointer shadow-[0px_8px_24px_rgba(0,53,133,0.1)]"
					>
						<div className="flex flex-col">
							<p className="text-center text-[24px] ">
								Labelled dataset upload{' '}
							</p>
							<p className="text-center text-[16px] font-[300]">
								uploaded dataset will be classified based on
								your folder structure
							</p>
							<img
								src="https://dr23pab8nlq87.cloudfront.net/images/classification_upload_classified-vOZv.png"
								alt=""
								className="mt-5"
							/>
						</div>
					</div>
				</div>
			</div>
			{/* bottom up modal of classify image uploader */}
			<div
				className={`${
					projectState.showUploader
						? 'top-0 z-[1000] opacity-100'
						: 'top-full bottom-0 opacity-0'
				} fixed flex flex-col items-center h-full w-full justify-center bg-white  transition-all duration-500 ease overscroll-auto min-h-screen left-0  overflow-hidden`}
			>
				<button
					onClick={() =>
						updateProjState({
							showUploader: false,
							uploadFiles: [],
						})
					}
					className="absolute top-5 right-5 p-[12px] rounded-full bg-transparent hover:bg-gray-300 hover:text-white font-[600] w-[48px] h-[48px]"
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
				<div className="h-max overflow-auto w-full px-10">
					<h1 className="mb-5 text-3xl font-extrabold text-gray-900 text-center">
						<span className="text-transparent bg-clip-text bg-gradient-to-r to-[#2c67f2] from-[#62cff4]">
							Upload the data
						</span>{' '}
						to initiate the process
					</h1>
					<label
						htmlFor="classification"
						className="h-[180px] flex justify-around items-center mx-auto border-[2px] border-dashed border-gray-500 rounded-[15px] hover:border-[#3498db]"
					>
						<div className="w-full h-full bg-white p-5  cursor-pointer rounded-[15px]">
							<div className="flex flex-col">
								<img
									src={database}
									alt=""
									className="mt-5 w-[200px] h-full mx-auto"
								/>

								<p className="text-center text-[15px] font-[300]">
									{(projectInfo &&
										TYPES[projectInfo.type]?.description) ||
										'No description available'}
								</p>
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
									Folder information will be automatically
									tagged as metadata to each media{' '}
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
					<div className="flex justify-between items-center mt-5">
						<span className=" text-start  text-[23px] font-bold">
							Preview
						</span>
						<div className="text-center">
							{projectState.uploadFiles.length} File(s) Ready for
							Upload
						</div>
						<button
							className="bg-blue-700 rounded-[10px] text-[14px] text-white font-[400] py-[8px] px-[15px]"
							onClick={uploadFiles}
						>
							Upload {projectState.uploadFiles.length} File(s)
						</button>
					</div>
					{/* preview uploaded files */}
					<div className="h-[2px] bg-gray-100 w-full my-5"></div>
					{projectInfo &&
						projectState.uploadFiles &&
						(() => {
							const object = config[projectInfo.type]
							if (object) {
								const PreviewComponent = object.uploadPreview
								return (
									<div
										className={`grid ${object.gridClasses}`}
									>
										{projectState.uploadFiles
											.slice(0, projectState.loadedChunk)
											.map((file, index) => (
												<PreviewComponent
													key={index}
													file={file}
													index={index}
													handleRemoveFile={
														handleRemoveFile
													}
													setPreviewData={
														setPreviewData
													}
													setEditedData={
														setEditedData
													}
													isLockedFlag={isLocked}
													setIsLockedFlag={
														setIsLocked
													}
													dataFeature={dataFeature}
													setDataFeature={
														setDataFeature
													}
												/>
											))}
									</div>
								)
							}

							return null
						})()}

					{projectState.loadedChunk <
						projectState.uploadFiles.length && (
						<button
							className="mx-auto flex mt-5 bg-blue-700 rounded-[10px] text-[14px] text-white font-[400] py-[8px] px-[15px]"
							onClick={handleLoadChunk}
						>
							Load more
						</button>
					)}
				</div>
			</div>
		</div>
	)
}

export default Dashboard
