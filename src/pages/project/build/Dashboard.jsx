/* eslint-disable no-unused-vars */
import { message } from 'antd'
import React, { useReducer, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import * as projectAPI from 'src/api/project'
import { UploadTypes } from 'src/constants/file'
import { validateFiles } from 'src/utils/file'
import Loading from 'src/components/Loading'
import { TYPES } from 'src/constants/types'
import database from 'src/assets/images/background.png'
import databaseList from 'src/assets/images/listData.png'
import config from './config'

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
	const { id: projectID } = useParams()
	const location = useLocation()
	const [previewData, setPreviewData] = useState({})

	//state
	const [dashboardState, updateState] = useReducer((pre, next) => {
		return { ...pre, ...next }
	}, initialState)

	let [searchParams, setSearchParams] = useSearchParams()

	// handler
	const handleFileChange = (event) => {
		if (projectInfo) {
			const files = Array.from(event.target.files)
			const validatedFiles = validateFiles(files, projectInfo.type)
			updateState({ uploadFiles: validatedFiles })
		}
	}
	const handleRemoveFile = (index) => {
		const newState = [...dashboardState.uploadFiles]
		newState.splice(index, 1)
		updateState({ uploadFiles: newState })
	}

	const uploadFiles = async (e) => {
		e.preventDefault()

		if (dashboardState.uploadFiles.length === 0) return
		if (
			dashboardState.uploadFiles !== undefined &&
			dashboardState.uploadFiles.length > 0
		) {
			// TODO: Change previewData -> import_args ( in Body not FormData)
			// DONE: Body = FormData thi phai
			const formData = new FormData()
			const object = config[projectInfo.type]
			if (object) {
				formData.append('type', object.folder)
			}

			if (previewData.label_column) {
				formData.append('import_args', JSON.stringify(previewData))
			}
			for (let i = 0; i < dashboardState.uploadFiles.length; i++) {
				// Convert file name with relative path to base64 string
				const fileNameBase64 = window.btoa(
					dashboardState.uploadFiles[i].webkitRelativePath
				)
				formData.append(
					'files',
					dashboardState.uploadFiles[i],
					fileNameBase64
				)
			}

			try {
				updateState({ isUploading: true })
				projectAPI.uploadFiles(projectID, formData).then((data) => {
					const props = {
						files: data.data.tasks,
						labels: data.data.project_info.label_config,
						pagination: data.data.meta,
						updateFields: updateFields,
						projectInfo: data.data.project_info,
					}
					message.success('Successfully uploaded', 3)
					updateState({ isUploading: false })
					updateFields({
						isDoneUploadData: true,
						...props,
					})
				})
			} catch (error) {
				updateState({ isUploading: false })
				message.error('Upload Failed', 3)

				console.error(error)
			}
		}

		// TODO: validate folder structure
		// Nêú folder chỉ có toàn ảnh không có folder con thì hiển thị lỗi
	}

	const handleLoadChunk = () => {
		if (dashboardState.loadedChunk < dashboardState.uploadFiles.length) {
			updateState({
				loadedChunk: dashboardState.loadedChunk + LOAD_CHUNK,
			})
		}
	}

	return (
		<>
			{dashboardState.isUploading ? <Loading /> : ''}
			{/* uploaded */}
			<div
				onClick={() => updateState({ show: true })}
				className="flex flex-col cursor-pointer my-10 shadow justify-between mx-auto items-center p-[10px] gap-[5px] bg-[rgba(0,110,255,0.041)]  rounded-[10px] h-[calc(100%-124px)] min-h-[500px]"
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
					dashboardState.show
						? 'top-0 bottom-full z-[1000] opacity-100 left-0'
						: 'top-full bottom-0 opacity-0'
				} fixed flex flex-col items-center h-full w-full px-[30px] justify-center bg-white  transition-all duration-500 ease`}
			>
				<button
					onClick={() => updateState({ show: false })}
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
						onClick={() => updateState({ showUploader: true })}
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
						onClick={() => updateState({ showUploader: true })}
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
					dashboardState.showUploader
						? 'top-0 z-[1000] opacity-100'
						: 'top-full bottom-0 opacity-0'
				} fixed flex flex-col items-center h-full w-full justify-center bg-white  transition-all duration-500 ease overscroll-auto min-h-screen left-0  overflow-hidden`}
			>
				<button
					onClick={() =>
						updateState({ showUploader: false, uploadFiles: [] })
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
					<h1 class="mb-5 text-3xl font-extrabold text-gray-900 text-center">
						<span class="text-transparent bg-clip-text bg-gradient-to-r to-[#2c67f2] from-[#62cff4]">
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
							{dashboardState.uploadFiles.length} File(s) Ready
							for Upload
						</div>
						<button
							className="bg-blue-700 rounded-[10px] text-[14px] text-white font-[400] py-[8px] px-[15px]"
							onClick={uploadFiles}
						>
							Upload {dashboardState.uploadFiles.length} File(s)
						</button>
					</div>
					{/* preview uploaded files */}
					<div className="h-[2px] bg-gray-100 w-full my-5"></div>
					{projectInfo &&
						dashboardState.uploadFiles &&
						(() => {
							const object = config[projectInfo.type]
							if (object) {
								const PreviewComponent = object.uploadPreview
								return (
									<div
										className={`grid ${object.gridClasses}`}
									>
										{dashboardState.uploadFiles
											.slice(
												0,
												dashboardState.loadedChunk
											)
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
												/>
											))}
									</div>
								)
							}

							return null
						})()}

					{dashboardState.loadedChunk <
						dashboardState.uploadFiles.length && (
						<button
							className="mx-auto flex mt-5 bg-blue-700 rounded-[10px] text-[14px] text-white font-[400] py-[8px] px-[15px]"
							onClick={handleLoadChunk}
						>
							Load more
						</button>
					)}
				</div>
			</div>
		</>
	)
}

export default Dashboard
