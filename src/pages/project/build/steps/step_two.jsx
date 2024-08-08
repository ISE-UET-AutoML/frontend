import React, { memo, useEffect } from 'react';
import Preview from 'src/pages/preview';
import Labeling from 'src/pages/labeling';

import { listImages } from 'src/api/project';
import { useLocation } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

const StepTwo = ({ files, labels, pagination, updateFields }) => {
	let [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		searchParams.get('step') ??
			setSearchParams((pre) => pre.toString().concat('&step=1'));

		if (files?.length || labels?.length) {
			return;
		}

		const id = searchParams.get('id');
		async function fetchListLabelingImages(id) {
			const { data } = await listImages(id);
			updateFields({
				...data.data,
				pagination: data.meta,
			});
		}

		if (id) {
			fetchListLabelingImages(id);
		}
	}, []);

	if (!files) return
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
						});
					}}
					pagination={pagination}
				/>
			</div>
		);

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
					});
				}}
				pagination={pagination}
			/>
		</div>
	);
};

export default memo(StepTwo);
