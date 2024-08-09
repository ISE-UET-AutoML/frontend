import React, { memo, useEffect } from 'react'
import Preview from 'src/pages/preview'
import Labeling from 'src/pages/labeling'

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
		useEffect(() => {
			const searchParams = new URLSearchParams(location.search)
			searchParams.get('step') ??
				setSearchParams((pre) => pre.toString().concat('&step=1'))

			if (files?.length || labels?.length) {
				return
			}

			const id = searchParams.get('id')
			async function fetchListLabelingImages(id) {
				const { data } = await listImages(id)
				updateFields({
					...data.data,
					pagination: data.meta,
				})
			}

			if (id) {
				fetchListLabelingImages(id)
			}
		}, [])
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
	// const file = csv_data_source

	// const file = fs.readFile(csv_data_source, (err, data) => {
	// 	if (err) {
	// 		throw err
	// 	}
	// 	console.log(data)
	// })
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
	console.log(typeof csv_data_source)
	return (
		<>
			<div>
				<button
					onClick={handleTrain}
					className="hover:bg-blue-800 py-[6px] px-4 rounded-md w-fit"
				>
					Train Model
				</button>
			</div>
		</>
	)
}

export default memo(StepTwo)
