import React, { memo, useEffect } from 'react'
import Labeling from 'src/pages/labeling'
import TextTrainPreview from 'src/pages/preview/TextTrainPreview'
import ImageTrainPreview from 'src/pages/preview/ImageTrainPreview'

const StepTwo = ({ files, labels, pagination, updateFields, projectInfo }) => {
	if (projectInfo.type === 'IMAGE_CLASSIFICATION') {
		let isUnlabelledData = false

		for (let i = 0; i < files.length; i++) {
			// not have filed label or filed label is empty
			if (!files[i]?.label || files[i].label.length <= 0) {
				isUnlabelledData = true
				break
			}
		}
		if (isUnlabelledData) {
			return (
				<div>
					<Labeling
						images={files}
						labelsWithID={labels}
						updateFields={updateFields}
						type={projectInfo.type}
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
				<ImageTrainPreview
					images={files}
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

	let isUnlabelledData = false

	for (let i = 0; i < files.length; i++) {
		// not have filed label or filed label is empty
		if (!files[i]?.label || files[i].label.length <= 0) {
			isUnlabelledData = true
			break
		}
	}
	if (isUnlabelledData) {
		return (
			<div>
				<Labeling
					images={files}
					labelsWithID={labels}
					updateFields={updateFields}
					type={projectInfo.type}
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
		<TextTrainPreview
			texts={files}
			updateFields={updateFields}
			next={() => {
				updateFields({
					isDoneStepTwo: true,
				})
			}}
			pagination={pagination}
		></TextTrainPreview>
	)
}

export default memo(StepTwo)
