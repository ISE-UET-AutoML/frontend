import React, { memo, useEffect } from 'react'
import Labeling from 'src/pages/labeling'
import TextTrainPreview from 'src/pages/preview/TextTrainPreview'
import ImageTrainPreview from 'src/pages/preview/ImageTrainPreview'

const StepTwo = ({ files, labels, pagination, updateFields, projectInfo }) => {
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
