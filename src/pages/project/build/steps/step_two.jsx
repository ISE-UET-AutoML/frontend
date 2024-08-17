import React, { memo, useEffect } from 'react'
import Preview from 'src/pages/preview'
import Labeling from 'src/pages/labeling'
import TextPreview from 'src/pages/dashboard/previews/text'
import { listImages } from 'src/api/project'
import { trainModel } from 'src/api/project'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'

// import fs from 'fs'

const StepTwo = ({
	files,
	labels,
	pagination,
	csv_data_source,
	updateFields,
	projectInfo,
}) => {
	let [searchParams, setSearchParams] = useSearchParams()

	const location = useLocation()

	//if (!files) return
	console.log('projectInfo', projectInfo)
	if (projectInfo.type === 'IMAGE_CLASSIFICATION') {
		let isUnlabelData = false

		for (let i = 0; i < files.length; i++) {
			// not have filed label or filed label is empty
			if (!files[i]?.label || files[i].label.length <= 0) {
				isUnlabelData = true
				break
			}
		}
		if (isUnlabelData) {
			// const labels_value = labels.map((v, i) => v.value)
			// console.log('label values', labels_value);
			return (
				<div>
					<Labeling
						images={files}
						labelsWithID={labels}
						updateFields={updateFields}
						next={() => {
							updateFields({
								isDoneStepTwo: true,
							})
						}}
						pagination={pagination}
					/>
				</div>
			)
		}

		return (
			<div>
				<Preview
					images={files}
					savedLabels={labels}
					updateFields={updateFields}
					next={() => {
						updateFields({
							isDoneStepTwo: true,
						})
					}}
					pagination={pagination}
				/>
			</div>
		)
	}
	const { id: projectId } = useParams()

	const handleTrain = async () => {
		try {
			const { data } = await trainModel(projectId)
			const searchParams = new URLSearchParams(location.search)
			searchParams.get('experiment_name') ??
				setSearchParams((pre) =>
					pre.toString().concat(`&experiment_name=${data.task_id}`)
				)
			updateFields({
				isDoneStepTwo: true,
				experiment_name: data.task_id,
			})
			// next()
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<>
			<div className="flex w-full pt-2 pb-5">
				<div
					class="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50"
					role="alert"
				>
					<svg
						class="flex-shrink-0 inline w-4 h-4 mr-3"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
					</svg>
					<div>
						Ensure that all labels are meticulously verified prior
						to initiating the training process.
					</div>
				</div>
				<div className="ml-auto relative h-full pt-3">
					<button
						onClick={handleTrain}
						className=" text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
					>
						Train Model
					</button>
				</div>
			</div>

			<TextPreview file={csv_data_source}></TextPreview>
		</>
	)
}

export default memo(StepTwo)
