import React, { useEffect, useRef, useState } from 'react'
import Dashboard from 'src/pages/project/build/Dashboard'
import * as projectAPI from 'src/api/project'
import { useParams } from 'react-router-dom'

const UploadData = ({ updateFields, projectInfo }) => {
	const { id: projectID } = useParams()

	// projectAPI.getProjectPreviewDataset(projectID).then((data) => {
	// 	console.log(data)

	// 	if (data?.data && data.data?.project_info) {
	// 		// get data success
	// 		const project_info = data.data?.project_info
	// 		if (project_info.uploaded) {
	// 			// TODO: code error in data service, has_unannotated_tasks always true =)
	// 			if (project_info.has_unannotated_tasks) {
	// 				// labeling
	// 				console.log('labeling')
	// 				projectAPI
	// 					.getProjectLabelingDataset(projectID)
	// 					.then((unlabeled_data) => {
	// 						const label_config =
	// 							unlabeled_data.data.project_info.label_config
	// 						let labels = []
	// 						if (label_config?.label_choices) {
	// 							labels = label_config.label_choices.map(
	// 								(v, i) => {
	// 									return {
	// 										id: i,
	// 										value: v,
	// 									}
	// 								}
	// 							)
	// 						}

	// 						const props = {
	// 							files: unlabeled_data.data.tasks,
	// 							labels: labels,
	// 							pagination: unlabeled_data.data.meta,
	// 							updateFields: updateFields,
	// 							projectInfo: unlabeled_data.data.project_info,
	// 						}
	// 						console.log(props)
	// 						updateFields({
	// 							isDoneUploadData: true,
	// 							...props,
	// 						})
	// 					})
	// 			} else {
	// 				const props = {
	// 					files: data.data.tasks,
	// 					labels: data.data.project_info.label_config,
	// 					pagination: data.data.meta,
	// 					updateFields: updateFields,
	// 					projectInfo: data.data.project_info,
	// 				}
	// 				updateFields({
	// 					isDoneUploadData: true,
	// 					...props,
	// 				})
	// 			}
	// 		}
	// 	}
	// })
	return (
		<>
			<div className="flex mb-2 pl-2">
				<h1 className="text-4xl font-bold text-center">
					CHOOSE DATASET
				</h1>
			</div>

			<div
				aria-label="Progress"
				className="w-full h-full p-2 bg-white overflow-hidden"
			>
				{
					<Dashboard
						updateFields={updateFields}
						projectInfo={projectInfo}
					/>
				}
			</div>
		</>
	)
}

export default UploadData
