import { listData } from 'src/api/project'
import { useLocation } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import React, { memo, useEffect } from 'react'
import config from '../config'

const LabelData = ({
	tasks,
	meta,
	files, // is replaced by tasks
	labels,
	pagination, // is replaced by meta
	updateFields,
	projectInfo,
}) => {
	// let [searchParams, setSearchParams] = useSearchParams()
	// const location = useLocation()
	// useEffect(() => {
	// 	const searchParams = new URLSearchParams(location.search)
	// 	searchParams.get('step') ??
	// 		setSearchParams((pre) => pre.toString().concat('&step=1'))

	// 	if (files?.length || labels?.length) {
	// 		return
	// 	}

	// 	const id = searchParams.get('id')
	// 	async function fetchListLabelingImages(id) {
	// 		const { data } = await listData(id)
	// 		console.log(data)

	// 		updateFields({
	// 			...data.data,
	// 			pagination: data.meta,
	// 		})
	// 	}

	// 	if (id) {
	// 		fetchListLabelingImages(id)
	// 	}
	// }, [])

	if (files && projectInfo) {
		let isUnlabelledData = false
		for (let i = 0; i < files.length; i++) {
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
				let result = 0
				if (!a?.label_by || a.label_by !== 'human') result = 1
				if (!b?.label_by || b.label_by !== 'human') result = -1
				if (a?.label && a.label.length > 0) result = 1
				if (b?.label && b.label.length > 0) result = -1
				return result
			})
			const LabelComponent = config[projectInfo.type].labelingView
			return (
				<div>
					<LabelComponent
						datas={files}
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

		const PreviewComponent = config[projectInfo.type].trainPreview

		return (
			<div>
				<PreviewComponent
					datas={files}
					updateFields={updateFields}
					next={() => {
						updateFields({
							isDoneLabelData: true,
						})
					}}
					meta={meta}
				/>
			</div>
		)
	}
	return <>Error</>
}

export default memo(LabelData)
