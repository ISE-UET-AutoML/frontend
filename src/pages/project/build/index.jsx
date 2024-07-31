import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { listImages } from 'src/api/project';
import { useMultistepForm } from 'src/hooks/useMultiStepForm';
import StepFour from './steps/step_four';
import StepOne from './steps/step_one';
import StepThree from './steps/step_three';
import StepTwo from './steps/step_two';

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

export default function ProjectBuild(props) {
    function updateFields(fields) {
        if (fields.isDoneStepOne) {
            goTo(1);
        }
        if (fields.isDoneStepTwo) {
            goTo(2);
        }
        if (fields.isDoneStepThree) {
            goTo(3);
        }
        if (fields.isDoneStepFour) {
            goTo(4);
        }
        setData((prev) => {
            return { ...prev, ...fields };
        });
    }

    const location = useLocation();
    const params = useParams();

    const [data, setData] = useState({});
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const step = searchParams.get('step');
        if (step) {
            goTo(parseInt(step));
        }
    }, []);

    const {
        steps,
        currentStepIndex,
        step,
        isFirstStep,
        isLastStep,
        back,
        next,
        goTo,
    } = useMultistepForm([
        <StepOne {...data} updateFields={updateFields} />,
        <StepTwo {...data} updateFields={updateFields} />,
        <StepThree {...data} updateFields={updateFields} />,
        <StepFour {...data} updateFields={updateFields} />,
    ]);
    return steps[currentStepIndex]
}
