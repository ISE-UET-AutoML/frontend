import { listData } from 'src/api/project'
import { useLocation } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import React, { memo, useEffect } from 'react'
import Labeling from 'src/pages/project/build/labelData/labeling'
import TextTrainPreview from 'src/components/TrainPreview/TextTrainPreview'
import ImageTrainPreview from 'src/components/TrainPreview/ImageTrainPreview'

const LabelData = ({
	files,
	labels,
	pagination,
	updateFields,
	projectInfo,
}) => {
	let [searchParams, setSearchParams] = useSearchParams()
	const location = useLocation()
	useEffect(() => {
		const searchParams = new URLSearchParams(location.search)
		searchParams.get('step') ??
			setSearchParams((pre) => pre.toString().concat('&step=1'))

		if (files?.length || labels?.length) {
			return
		}

		const id = searchParams.get('id')
		async function fetchListLabelingImages(id) {
			const { data } = await listData(id)
			console.log(data)

			updateFields({
				...data.data,
				pagination: data.meta,
			})
		}

		if (id) {
			fetchListLabelingImages(id)
		}
	}, [])

	if (!files) return

	if (files && projectInfo && projectInfo.type === 'IMAGE_CLASSIFICATION') {
		let isUnlabelledData = false
		for (let i = 0; i < files.length; i++) {
			// not have filed label or filed label is empty
			if (!files[i]?.label || files[i].label.length <= 0) {
				isUnlabelledData = true
				break
			}
			if (
				files[i].hasOwnProperty('label_by') &&
				files[i].label_by !== 'human'
			) {
				isUnlabelledData = true
				break
			}
		}
		if (isUnlabelledData) {
			files.sort((a, b) => {
				if (!a?.label_by || a.label_by !== 'human') return -1
				if (!b?.label_by || b.label_by !== 'human') return 1
				return 0
			})
			return (
				<div>
					<Labeling
						images={files}
						labelsWithID={labels}
						updateFields={updateFields}
						type={projectInfo.type}
						next={() => {
							updateFields({
								isDoneLabelData: true,
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
							isDoneLabelData: true,
						})
					}}
					pagination={pagination}
				/>
			</div>
		)
	}

	if (files && projectInfo && projectInfo.type === 'TEXT_CLASSIFICATION') {
		let isUnlabelledData = false

		for (let i = 0; i < files.length; i++) {
			// not have filed label or filed label is empty
			if (!files[i]?.label || files[i].label.length <= 0) {
				isUnlabelledData = true
				break
			}
			if (
				files[i].hasOwnProperty('label_by') &&
				files[i].label_by !== 'human'
			) {
				isUnlabelledData = true
				break
			}
		}
		if (isUnlabelledData) {
			files.sort((a, b) => {
				if (!a?.label_by || a.label_by !== 'human') return -1
				if (!b?.label_by || b.label_by !== 'human') return 1
				return 0
			})
			return (
				<div>
					<Labeling
						images={files}
						labelsWithID={labels}
						updateFields={updateFields}
						type={projectInfo.type}
						next={() => {
							updateFields({
								isDoneLabelData: true,
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
						isDoneLabelData: true,
					})
				}}
				pagination={pagination}
			></TextTrainPreview>
		)
	}

	return <>Error</>
}

export default memo(LabelData)
