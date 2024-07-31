import React, { useEffect, useRef, useState } from 'react';
import Dashboard from 'src/pages/dashboard';
import * as projectAPI from 'src/api/project';
import { useParams } from 'react-router-dom';


const StepOne = ({ name, email, updateFields }) => {
	// updateState({ isUploading: false });
	// updateFields({
	//     isDoneStepOne: true,
	//     ...data,
	// });
	const { id: projectID } = useParams()
	console.log(projectID)
	projectAPI.getProjectDataset(projectID).then((data) => {
		if (data?.data && data.data.files.length) {
			console.log(data)
			updateFields({
				isDoneStepOne: true,
				...data.data,
			});
		} else {
			console.log('no dataset');
		}

	})
	return <Dashboard updateFields={updateFields} />;
};

export default StepOne;
