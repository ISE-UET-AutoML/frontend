import React, { useEffect, useRef, useState } from 'react'
import Dashboard from 'src/pages/project/build/uploadData/Dashboard'
import * as projectAPI from 'src/api/project'
import { useParams } from 'react-router-dom'

const UploadData = ({ updateFields, projectInfo }) => {
	const { id: projectID } = useParams()

	projectAPI.getProjectFullDataset(projectID).then((data) => {
		if (data?.data && data.data.files.length) {
			updateFields({
				isDoneUploadData: true,
				...data.data,
			})
		} else {
			console.log('no dataset')
		}
	})
	return (
		<>
			<div className="flex mt-5 pl-5 ">
				<h1 className="text-3xl font-bold text-center mb-2">
					Upload dataset
				</h1>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					width="24"
					height="24"
				>
					<path
						fillRule="evenodd"
						d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
						clipRule="evenodd"
					/>
				</svg>
			</div>

			<div
				aria-label="Progress"
				className="w-full p-5 bg-white overflow-hidden"
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
