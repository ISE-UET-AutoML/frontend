import { message } from 'antd';
import { Dialog, Transition } from '@headlessui/react';
import React, { useEffect, useState, Fragment } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TrainingChart } from 'src/components/TrainingChart';
import { getTrainingHistory } from 'src/api/experiment';

const StepThree = (props) => {
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trainingAccuracyHistory, setTrainingAccuracyHistory] = useState([]);
    const [trainingLossHistory, setTrainingLossHistory] = useState([]);
    const searchParams = new URLSearchParams(location.search);
    const experimentName = searchParams.get('experiment_name');

    const next = () => {
        props.updateFields({
            isDoneStepThree: true,
        });
    };

    const [processValue, setProcessValue] = useState(0);

    const stopTrainModel = async () => {
        fetch(
            `${process.env.REACT_APP_ML_SERVICE_ADDR}/clf/stop?experiment_name=${experimentName}`
        )
            .then((res) => res.json())
            .then((data) => {
                message.success(data.message, 3);
                next();
            })
            .catch((err) => console.error(err));
    };
    const getTrainingProgress = async (experimentName) => {
        if (!experimentName) {
            return;
        }
        const res = await fetch(
            `${process.env.REACT_APP_ML_SERVICE_ADDR}/accuracy/best?experiment_name=${experimentName}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        const data = await res.json();
        if (res.status === 422) {
        }

        if (res.status === 200) {
            setProcessValue(data.best_val_accuracy);
            document.getElementById('message').innerHTML =
                'Best accuracy so far';
            document.getElementById('description').innerHTML = '';
            // setProcessValue(data.accuracy)
        }

        return res.data;
    };

    const showTrainingGraph = async () => {
        const { data } = await getTrainingHistory(experimentName);
        setTrainingAccuracyHistory(data.val_acc_history);
        setTrainingLossHistory(data.val_loss_history);
        const timer = setTimeout(() => {
            setIsModalOpen(true);
            clearTimeout(timer);
        }, 100);
    };

    useEffect(() => {
        getTrainingProgress(experimentName);
        const interval = setInterval(() => {
            getTrainingProgress(experimentName);
        }, 10000);

        return () => clearInterval(interval);
    }, [experimentName]);

    return (
        <div className="flex items-center justify-center w-full">
            <div className="flex flex-col mt-5 items-center justify-center w-full">
                <div className="mt-20 flex justify-center items-center flex-col gap-6 w-full max-w-md">
                    <div className="w-full max-w-md">
                        <h4 className="sr-only">Status</h4>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col justify-between items-start">
                                <p
                                    id="message"
                                    className="text-[20px] font-medium text-gray-900"
                                >
                                    Provisioning TPU...
                                </p>
                                <p
                                    id="description"
                                    className="text-[14px] font-medium text-gray-500"
                                >
                                    This action may takes a few minutes
                                </p>
                            </div>
                            {processValue ? (
                                <strong className="text-[20px] animate-pulse">
                                    {processValue}%
                                </strong>
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className="mt-4" aria-hidden="true">
                            <div className="overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className=" h-2 rounded-full bg-blue-600"
                                    style={{ width: `${processValue}%` }}
                                />
                            </div>
                            <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid"></div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => showTrainingGraph()}
                    className="rounded-md bg-red-600 py-[6px] px-4 text-white"
                >
                    Stop
                </button>
            </div>
            <Transition.Root show={isModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-[999999]"
                    onClose={setIsModalOpen}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="min-h-[500px] relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                                    {/* title */}
                                    <div className="bg-white p-[10px] divide-y-2 divide-solid divide-slate-50">
                                        <div className="flex justify-between items-center mb-5">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-base font-semibold leading-6 text-gray-900"
                                                >
                                                    Training Graph
                                                </Dialog.Title>
                                            </div>
                                            <div className="text-[30px] text-gray-400 mx-auto flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-transparent hover:text-red-200 sm:mx-0 sm:h-10 sm:w-10">
                                                <button
                                                    onClick={() =>
                                                        setIsModalOpen(false)
                                                    }
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>

                                        <div className="images-container flex flex-col flex-nowrap gap-y-4 justify-center mt-auto">
                                            <div className="flex flex-col items-center justify-between h-full w-full">
                                                <p className="font-bold">
                                                    Accuracy
                                                </p>
                                                {trainingAccuracyHistory.length >
                                                    0 && (
                                                        <TrainingChart
                                                            data={
                                                                trainingAccuracyHistory
                                                            }
                                                        />
                                                    )}
                                            </div>
                                            <div className="flex flex-col items-center justify-between h-full w-full">
                                                <p className="font-bold">
                                                    Loss
                                                </p>
                                                {trainingLossHistory.length >
                                                    0 && (
                                                        <TrainingChart
                                                            data={
                                                                trainingLossHistory
                                                            }
                                                            color="orange"
                                                        />
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* button */}
                                    <div className="bg-white px-4 py-3 sm:flex sm:px-6 justify-start mt-auto">
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() =>
                                                setIsModalOpen(false)
                                            }
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="ml-auto w-fit inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                stopTrainModel();
                                            }}
                                        >
                                            Stop Training
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
};

export default StepThree;
