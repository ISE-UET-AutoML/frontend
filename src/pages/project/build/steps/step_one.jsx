import React, { useEffect, useRef, useState } from 'react';
import Dashboard from 'src/pages/dashboard';
import * as projectAPI from 'src/api/project';
import { useParams } from 'react-router-dom';

const stepData = [
	{
		id: '01',
		name: 'Upload',
		href: '/app/new-project/step1',
		status: 'complete',
	},
	{
		id: '02',
		name: 'Label',
		href: '/app/new-project/step2',
		status: 'current',
	},
	{ id: '03', name: 'Train', href: '#', status: 'upcoming' },
	{ id: '04', name: 'Predict', href: '#', status: 'upcoming' },
];

const currentStepIndex = 1

const StepOne = ({ name, email, updateFields }) => {
	const { id: projectID } = useParams()

	const [projectInfo, setProjectInfo] = useState(null);

    useEffect(() => {
        const fetchProjectInfo = async () => {
            try {
                const response = await projectAPI.getProjectById(projectID);
                setProjectInfo(response.data);
            } catch (error) {
                console.error('Error fetching project:', error);
            }
        };

        fetchProjectInfo();
    }, [projectID]);

	projectAPI.getProjectDataset(projectID).then((data) => {
		if (data?.data && data.data.files.length) {
			console.log(data)
			updateFields({
				// change to isDoneStepThree: true to bypass to predict
				isDoneStepOne: true,
				...data.data,
			});
		} else {
			console.log('no dataset');
		}

	})
	
	return (
		<>
			<div className="flex justify-between mx-auto px-3 mb-5 ">
				<div className=" max-w-2xl px-4 lg:max-w-4xl lg:px-0">
					<h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
						Build
					</h1>
				</div>
			</div>

			<div
				aria-label="Progress"
				className="w-full p-5 bg-white overflow-hidden"
			>
				<div className="max-w-2xl mx-auto px-4 md:px-0">
					<ul
						aria-label="Steps"
						className="items-center text-gray-600 font-medium md:flex"
					>
						{stepData.map((item, idx) => (
							<li
								aria-current={
									currentStepIndex === idx + 1
										? 'step'
										: false
								}
								key={idx}
								className="flex-1 last:flex-none flex gap-x-2 md:items-center"
							>
								<div className="flex items-center flex-col gap-x-2">
									<div
										className={`w-8 h-8 rounded-full border-2 flex-none flex items-center justify-center ${currentStepIndex > idx
											? 'bg-blue-600 border-blue-600'
											: '' || currentStepIndex === idx
												? 'border-blue-600'
												: ''
											}`}
									>
										<span
											id={`step-${idx + 1}`}
											className={`next-step ${currentStepIndex > idx
												? 'hidden'
												: '' ||
													currentStepIndex ===
													idx
													? 'text-blue-600'
													: ''
												}`}
										>
											{idx + 1}
										</span>
										{currentStepIndex > idx ? (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth={1.5}
												stroke="currentColor"
												className="w-5 h-5 text-white"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M4.5 12.75l6 6 9-13.5"
												/>
											</svg>
										) : (
											''
										)}
									</div>
									<hr
										className={`h-12 border md:hidden ${idx === 4
											? 'hidden'
											: '' || currentStepIndex > idx
												? 'border-blue-600'
												: ''
											}`}
									/>
								</div>
								<div className="h-8 flex items-center md:h-auto">
									<h3
										className={`text-sm ${currentStepIndex === idx ? 'text-blue-600' : ''}`}
									>
										{item.name}
									</h3>
								</div>
								<hr
									className={`hidden mr-2 w-full border md:block ${idx === 4
										? 'hidden'
										: '' || currentStepIndex > idx
											? 'border-blue-600'
											: ''
										}`}
								/>
							</li>
						))}
					</ul>
				</div>
				{<Dashboard updateFields={updateFields} projectInfo={projectInfo} />}
				{/*steps content  */}
				<div className="content mt-5">{/* <h1>{step}</h1> */}</div>

			</div>
		</>
	)
	
};

export default StepOne;
