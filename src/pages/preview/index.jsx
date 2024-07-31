import { Dialog, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Slider } from 'antd';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { listImages, trainModel } from 'src/api/project';
import Loading from 'src/components/Loading';
import Pagination from 'src/components/Pagination';
import useIntervalFetch from 'src/hooks/useIntervalFetch';

const types = [
    {
        id: 0,
        type: 'FLIP',
        title: 'Flip',

        description:
            'Add variability to perspective to help your model be more resilient to camera and subject pitch and yaw.',
        originImg: 'https://app.roboflow.com/images/augmentation/flip.jpg',
        generatedImgs: [
            'https://app.roboflow.com/images/augmentation/flip.jpg',
        ],
        question: 'How Flip Augmentation Improves Model Performance',
        questionDes:
            'Flipping an image can improve model performance in substantial ways.',
        option: {
            flipHorizontal: false,
            flipVertical: false,
        },
    },

    {
        id: 1,
        type: 'ROTATE',
        title: 'Rotate',

        description:
            'Add variability to perspective to help your model be more resilient to camera and subject pitch and yaw.',
        originImg: 'https://app.roboflow.com/images/augmentation/rotate.jpg',
        generatedImgs: [
            'https://app.roboflow.com/images/augmentation/flip.jpg',
            'https://app.roboflow.com/images/augmentation/flip.jpg',
        ],

        question: 'When should I rotate my images? ',
        questionDes: `If orientation doesn'teg they may be taken in portrait/landscape mode or from above`,

        option: {
            clockwise: false,
            counterClockwise: false,
            upsideDown: false,
        },
    },
    {
        id: 2,

        type: 'SHEAR',
        title: 'Shear',

        description:
            'Add variability to perspective to help your model be more resilient to camera and subject pitch and yaw.',
        originImg: 'https://app.roboflow.com/images/augmentation/shear.jpg',
        generatedImgs: [
            'https://app.roboflow.com/images/augmentation/flip.jpg',
            'https://app.roboflow.com/images/augmentation/flip.jpg',
            'https://app.roboflow.com/images/augmentation/flip.jpg',
            'https://app.roboflow.com/images/augmentation/flip.jpg',
        ],
        option: {
            shearHorizontal: 10,
            shearVertical: 20,
        },
    },
    {
        id: 3,

        type: 'GRAYSCALE',
        title: 'Grayscale',

        description:
            'Add variability to perspective to help your model be more resilient to camera and subject pitch and yaw.',
        originImg:
            'https://app.roboflow.com/images/augmentation/rgrayscale.jpg',
        generatedImgs: [
            'https://app.roboflow.com/images/augmentation/flip.jpg',
            'https://app.roboflow.com/images/augmentation/flip.jpg',
            'https://app.roboflow.com/images/augmentation/flip.jpg',
            'https://app.roboflow.com/images/augmentation/flip.jpg',
        ],
        option: {
            grayscalePercent: 25,
        },
    },
    {
        id: 4,

        type: 'HUE',
        title: 'Hue',

        description: 'Randomly adjust the colors in the image.',
        originImg: 'https://app.roboflow.com/images/augmentation/hue.jpg',
        generatedImgs: [
            'https://app.roboflow.com/images/augmentation/flip.jpg',
            'https://app.roboflow.com/images/augmentation/flip.jpg',
        ],
        option: { huePercent: 30 },
    },
    {
        id: 5,

        type: 'EXPOSURE',
        title: 'Exposure',

        description:
            'Add variability to image brightness to help your model be more resilient to lighting and camera setting changes.',
        originImg: 'https://app.roboflow.com/images/augmentation/exposure.jpg',
        generatedImgs: [
            'https://app.roboflow.com/images/augmentation/flip.jpg',
            'https://app.roboflow.com/images/augmentation/flip.jpg',
        ],
        option: { exposurePercent: 30 },
    },
    {
        id: 6,

        type: 'CUTOUT',
        title: 'Cutout',

        description:
            'Add variability to perspective to help your model be more resilient to camera and subject pitch and yaw.',
        originImg: 'https://app.roboflow.com/images/augmentation/cutout.jpg',
        generatedImgs: [
            'https://app.roboflow.com/images/augmentation/flip.jpg',
        ],
        option: {
            cutoutCount: 0,
            cutoutPercent: 0,
        },
    },
];

const LabelSelector = ({ current, labels, setLabels }) => {
    const [currentLabel, setCurrentLabel] = useState(current);
    const [open, setOpen] = useState(false);
    const cancelButtonRef = useRef(null);
    const newLabelRef = useRef(null);

    const handleOnChange = (e) => {
        if (e.target.value === 'new') {
            setOpen(true);
        } else {
            setCurrentLabel(e.target.value);
        }
    };

    return (
        <div>
            <select
                className="absolute mt-1 block rounded-md border-white py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bottom-0 left-0 w-fit border bg-[#1e2a37e6] text-white"
                onChange={handleOnChange}
                defaultValue={
                    labels && labels.length === 0 ? 'unknown' : currentLabel
                }
                value={currentLabel}
            >
                {!labels && <option value="unknown">unknown</option>}
                {labels &&
                    labels.map((label) => (
                        <option key={label.id} value={label.value}>
                            {label.value}
                        </option>
                    ))}
                <option value="new">Create label</option>
            </select>
            <Transition.Root show={open} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-10"
                    initialFocus={cancelButtonRef}
                    onClose={setOpen}
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
                                <Dialog.Panel className="custom_scrollbar relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                                <ExclamationTriangleIcon
                                                    className="h-6 w-6 text-red-600"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-base font-semibold leading-6 text-gray-900"
                                                >
                                                    Create a label
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        name="label"
                                                        className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                        placeholder="New label"
                                                        ref={newLabelRef}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                            onClick={() => {
                                                setOpen(false);
                                                const label =
                                                    newLabelRef.current.value;
                                                setLabels([label, ...labels]);
                                                // setCurrentLabel(label)
                                            }}
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => setOpen(false)}
                                            ref={cancelButtonRef}
                                        >
                                            Cancel
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

const Preview = ({ images, pagination, savedLabels, next, updateFields }) => {
    const location = useLocation();
    const [openOptions, setOpenOptions] = useState(false);
    const [openAugmentation, setOpenAugmentation] = useState(false);
    const [selectedType, setSelectedType] = useState(types[0]);
    const cancelButtonRef = useRef(null);
    const handleOpentTrainModel = () => {
        setOpenOptions(true);
    };

    let [searchParams, setSearchParams] = useSearchParams();
    const { id: projectId } = useParams();
    const [labels, setLabels] = useState(savedLabels);
    const [triggerFetch, setTriggerFetch] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationStep2, setPaginationStep2] = useState({
        currentPage: pagination?.page ?? 1,
        totalPages: pagination?.total_page ?? 10,
    });
    const handleTrain = async () => {
        try {
            const { data } = await trainModel(projectId);
            const searchParams = new URLSearchParams(location.search);
            searchParams.get('experiment_name') ??
                setSearchParams((pre) =>
                    pre
                        .toString()
                        .concat(`&experiment_name=${data.experiment_name}`)
                );
            updateFields({ experiment_name: data.experiment_name });
            next();
        } catch (error) {
            console.error(error);
        }
    };

    const handlePageChange = async (page) => {
        const searchParams = new URLSearchParams(location.search);
        const id = searchParams.get('id');
        if (id) {
            setIsLoading(true);
            const { data } = await listImages(id, `&page=${page}&size=24`);
            setPaginationStep2({ ...paginationStep2, currentPage: page });
            updateFields({
                ...data.data,
                pagination: data.meta,
            });
            setIsLoading(false);
        } else if (projectId) {
            setIsLoading(true);
            const { data } = await listImages(projectId, `&page=${page}&size=24`);
            setPaginationStep2({ ...paginationStep2, currentPage: page });
            updateFields({
                ...data.data,
                pagination: data.meta,
            });
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (pagination) {
            setPaginationStep2({
                currentPage: pagination?.page ?? 1,
                totalPages: pagination?.total_page ?? 10,
            });
        }
    }, [pagination]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const experimentName = searchParams.get('experiment_name');
        if (experimentName) {
            updateFields({ isDoneStepTwo: true });
        }
    }, []);

    return (
        <div className="container w-full mx-auto">
            {isLoading && <Loading />}
            <div className="flex flex-col bg-white shadow-xl rounded-md h-full p-10">
                <div className="flex justify-between items-center w-full my-5">
                    <label>
                        Label all your images to start training process
                    </label>
                    <div className="relative flex rounded-md bg-blue-600 justify-between items-center text-white">
                        <button
                            onClick={handleTrain}
                            className="hover:bg-blue-800 py-[6px] px-4 rounded-md w-fit"
                        >
                            Train Model
                        </button>
                        {/* <div className="group/item h-9 w-fit z-20">
                <ChevronDownIcon
                  className="h-10 w-6 text-violet-200 hover:text-violet-100 "
                  aria-hidden="true"
                />
                <div
                  className="absolute hidden  group-hover/item:block 
                top-full right-0 py-4 px-3 bg-white w-[120%] rounded-md shadow-md"
                >
                  <button
                    className={`bg-blue-600 hover:bg-blue-800  text-white group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    onClick={() => {
                      handleOpentTrainModel()
                    }}
                  >
                    <span className="text-center w-full">Train with options</span>
                  </button>
                </div>
              </div> */}
                    </div>
                </div>
                <div>
                    <div className="grid grid-cols-4 gap-4">
                        {images ? (
                            images.map((image) => (
                                <div className="relative flex justify-center hover:border hover:border-red-500 rounded-md overflow-hidden">
                                    <img src={image.url} alt="" />
                                    <LabelSelector
                                        current={image.label ?? 'unlabeled'}
                                        labels={savedLabels}
                                        setLabels={setLabels}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="relative">
                                <Loading />
                            </div>
                        )}
                    </div>
                </div>
                {images && (
                    <Pagination
                        currentPage={paginationStep2.currentPage}
                        totalPages={paginationStep2.totalPages}
                        onChange={handlePageChange}
                    />
                )}
            </div>
            <Transition.Root show={openOptions} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-10"
                    initialFocus={cancelButtonRef}
                    onClose={setOpenOptions}
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                    {/* title */}
                                    <div className="bg-white p-[10px">
                                        <div className="flex justify-between items-center">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-base font-semibold leading-6 text-gray-900"
                                                >
                                                    Augmentation Options
                                                </Dialog.Title>
                                            </div>
                                            <div className="text-[30px] text-gray-400 mx-auto flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-transparent hover:text-red-200 sm:mx-0 sm:h-10 sm:w-10">
                                                <button
                                                    onClick={() =>
                                                        setOpenOptions(false)
                                                    }
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>

                                        <div className="description border text-[14px] p-[15px]">
                                            Augmentations create new training
                                            examples for your model to learn
                                            from.
                                        </div>

                                        <h3 className="text-[#666] text-[14px] font-[700] p-[15px]">
                                            IMAGE LEVEL AUGMENTATIONS
                                        </h3>

                                        <div className="images-container flex flex-wrap gap-y-4 justify-center">
                                            {types.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col justify-between w-[90px] items-center gap-1 item rounded-md hover:shadow overflow-hidden border-transparent hover:border-[#f0f] border-[2px] hover:font-[600] hover:text-[16px] focus:font-[600] focus:text-[16px] px-[3px] pt-[2px] hover:bg-gray-200"
                                                    onClick={() => {
                                                        setSelectedType(
                                                            types[item.id]
                                                        );

                                                        setOpenAugmentation(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    <img
                                                        src={item.originImg}
                                                        alt=""
                                                        srcset=""
                                                        className="rounded-md"
                                                    />
                                                    <span className="text-gray-600 text-center text-[14px] w-full ">
                                                        {item.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* button */}
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:px-6 justify-start">
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() =>
                                                setOpenOptions(false)
                                            }
                                            ref={cancelButtonRef}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <Transition.Root show={openAugmentation} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-10"
                    initialFocus={cancelButtonRef}
                    onClose={setOpenAugmentation}
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
                                <Dialog.Panel className="relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-fit max-w-[650px] max-h-[650px] overflow-scroll ">
                                    {/* title */}
                                    <div className="bg-white px-[15px] py-[5px] shadow">
                                        <div className="flex justify-between items-center">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-[24px] font-semibold leading-6 text-gray-900"
                                                >
                                                    {selectedType.title}
                                                </Dialog.Title>
                                            </div>
                                            <div className="text-[30px] text-gray-400 mx-auto flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-transparent hover:text-red-200 sm:mx-0 sm:h-10 sm:w-10">
                                                <button
                                                    onClick={() =>
                                                        setOpenAugmentation(
                                                            false
                                                        )
                                                    }
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex min-h-fit h-fit">
                                        <div className="flex flex-row justify-center items-center flex-wrap bg-gray-300 w-1/2 min-w-[]">
                                            <div className="w-full my-5">
                                                <img
                                                    src="https://app.roboflow.com/images/augmentation/flip.jpg"
                                                    alt=""
                                                    className="item-img w-[150px] h-[150px] m-auto object-fill"
                                                />
                                            </div>

                                            {selectedType.generatedImgs.map(
                                                (url, index) => (
                                                    <div
                                                        key={index}
                                                        className={`w-1/2 m-auto overflow-hidden`}
                                                    >
                                                        <div className="p-2  w-full overflow-hidden">
                                                            <img
                                                                src="https://app.roboflow.com/images/augmentation/flip.jpg"
                                                                alt=""
                                                                className="item-img w-[150px] h-[150px] m-auto  object-fill"
                                                            />
                                                            <div></div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        <div className="w-1/2">
                                            <div className="info p-[15px] h-full flex flex-col bg-[#f0f0f0]">
                                                <h3 className="text-[15px] font-[700]">
                                                    {selectedType.title}
                                                </h3>
                                                <p className="whitespace-normal text-[12px]">
                                                    {selectedType.description}
                                                </p>
                                                {selectedType.type ===
                                                    'FLIP' && (
                                                        <>
                                                            <div className="flex flex-col">
                                                                <label className="inline-flex items-center mt-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            selectedType
                                                                                ?.option
                                                                                ?.flipHorizontal ??
                                                                            false
                                                                        }
                                                                        className="form-checkbox h-4 w-4 text-gray-600"
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            setSelectedType(
                                                                                (
                                                                                    pre
                                                                                ) => {
                                                                                    const newPre =
                                                                                    {
                                                                                        ...pre,
                                                                                    };

                                                                                    newPre.option.flipHorizontal =
                                                                                        event.target.checked;
                                                                                    return newPre;
                                                                                }
                                                                            );
                                                                        }}
                                                                    />
                                                                    <span className="ml-2 text-gray-700 text-[12px]">
                                                                        Horizontal
                                                                    </span>
                                                                </label>
                                                                <label className="inline-flex items-center mt-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-checkbox h-4 w-4 text-gray-600"
                                                                        value={
                                                                            selectedType
                                                                                ?.option
                                                                                ?.flipVertical ??
                                                                            false
                                                                        }
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            setSelectedType(
                                                                                (
                                                                                    pre
                                                                                ) => {
                                                                                    const newPre =
                                                                                    {
                                                                                        ...pre,
                                                                                    };

                                                                                    newPre.option.flipVertical =
                                                                                        event.target.checked;
                                                                                    return newPre;
                                                                                }
                                                                            );
                                                                        }}
                                                                    />
                                                                    <span className="ml-2 text-gray-700 text-[12px]">
                                                                        Vertical
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        </>
                                                    )}
                                                {selectedType.type ===
                                                    'ROTATE' && (
                                                        <>
                                                            <div className="flex flex-col">
                                                                <label className="inline-flex items-center mt-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-checkbox h-4 w-4 text-gray-600"
                                                                        value={
                                                                            selectedType
                                                                                ?.option
                                                                                ?.clockwise ??
                                                                            false
                                                                        }
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            setSelectedType(
                                                                                (
                                                                                    pre
                                                                                ) => {
                                                                                    const newPre =
                                                                                    {
                                                                                        ...pre,
                                                                                    };

                                                                                    newPre.option.clockwise =
                                                                                        event.target.checked;
                                                                                    return newPre;
                                                                                }
                                                                            );
                                                                        }}
                                                                    />
                                                                    <span className="ml-2 text-gray-700 text-[12px]">
                                                                        Clockwise
                                                                    </span>
                                                                </label>
                                                                <label className="inline-flex items-center mt-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-checkbox h-4 w-4 text-gray-600"
                                                                        value={
                                                                            selectedType
                                                                                ?.option
                                                                                ?.counterClockwise ??
                                                                            false
                                                                        }
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            setSelectedType(
                                                                                (
                                                                                    pre
                                                                                ) => {
                                                                                    const newPre =
                                                                                    {
                                                                                        ...pre,
                                                                                    };

                                                                                    newPre.option.counterClockwise =
                                                                                        event.target.checked;
                                                                                    return newPre;
                                                                                }
                                                                            );
                                                                        }}
                                                                    />
                                                                    <span className="ml-2 text-gray-700 text-[12px]">
                                                                        Counter-Clockwise
                                                                    </span>
                                                                </label>
                                                                <label className="inline-flex items-center mt-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-checkbox h-4 w-4 text-gray-600"
                                                                        value={
                                                                            selectedType
                                                                                ?.option
                                                                                ?.upsideDown ??
                                                                            false
                                                                        }
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            setSelectedType(
                                                                                (
                                                                                    pre
                                                                                ) => {
                                                                                    const newPre =
                                                                                    {
                                                                                        ...pre,
                                                                                    };

                                                                                    newPre.option.upsideDown =
                                                                                        event.target.checked;
                                                                                    return newPre;
                                                                                }
                                                                            );
                                                                        }}
                                                                    />
                                                                    <span className="ml-2 text-gray-700 text-[12px]">
                                                                        Upside Down
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        </>
                                                    )}
                                                {selectedType.type ===
                                                    'SHEAR' && (
                                                        <>
                                                            <p className="text-center mb-[7px] font-[700] text-[12px] mt-5">
                                                                Horizontal
                                                            </p>
                                                            <Slider
                                                                className="mt-0"
                                                                marks={{
                                                                    0: '0°',
                                                                    100: '45°',
                                                                }}
                                                                defaultValue={
                                                                    selectedType
                                                                        .option
                                                                        .shearHorizontal
                                                                }
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setSelectedType(
                                                                        (pre) => {
                                                                            const newPre =
                                                                            {
                                                                                ...pre,
                                                                            };
                                                                            newPre.option.shearHorizontal =
                                                                                Math.round(
                                                                                    (value *
                                                                                        45) /
                                                                                    100.0
                                                                                );
                                                                            return newPre;
                                                                        }
                                                                    );
                                                                }}
                                                                disabled={false}
                                                                tooltip={{
                                                                    open: true,
                                                                    formatter: (
                                                                        value
                                                                    ) =>
                                                                        Math.round(
                                                                            (value *
                                                                                45) /
                                                                            100.0
                                                                        ),
                                                                }}
                                                            />
                                                            <p className="text-center mb-[7px] font-[700] text-[12px]">
                                                                Vertical
                                                            </p>
                                                            <Slider
                                                                className="mt-0"
                                                                marks={{
                                                                    0: '0°',
                                                                    100: '45°',
                                                                }}
                                                                defaultValue={
                                                                    selectedType
                                                                        .option
                                                                        .shearVertical
                                                                }
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setSelectedType(
                                                                        (pre) => {
                                                                            const newPre =
                                                                            {
                                                                                ...pre,
                                                                            };
                                                                            newPre.option.shearVertical =
                                                                                Math.round(
                                                                                    (value *
                                                                                        45) /
                                                                                    100.0
                                                                                );
                                                                            return newPre;
                                                                        }
                                                                    );
                                                                }}
                                                                disabled={false}
                                                                tooltip={{
                                                                    open: true,
                                                                    formatter: (
                                                                        value
                                                                    ) =>
                                                                        Math.round(
                                                                            (value *
                                                                                45) /
                                                                            100.0
                                                                        ),
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                {selectedType.type ===
                                                    'GRAYSCALE' && (
                                                        <>
                                                            <p className="text-center mb-[7px] font-[700] text-[12px] mt-5">
                                                                Percent of Outputted
                                                                Images to Grayscale
                                                            </p>
                                                            <Slider
                                                                className="mt-0"
                                                                marks={{
                                                                    0: '0%',
                                                                    100: '100%',
                                                                }}
                                                                defaultValue={
                                                                    selectedType
                                                                        .option
                                                                        .grayscalePercent
                                                                }
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setSelectedType(
                                                                        (pre) => {
                                                                            const newPre =
                                                                            {
                                                                                ...pre,
                                                                            };
                                                                            newPre.option.grayscalePercent =
                                                                                value;
                                                                            return newPre;
                                                                        }
                                                                    );
                                                                }}
                                                                disabled={false}
                                                                tooltip={{
                                                                    open: true,
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                {selectedType.type ===
                                                    'HUE' && (
                                                        <>
                                                            <Slider
                                                                className="mt-5"
                                                                marks={{
                                                                    0: '0%',
                                                                    100: '100%',
                                                                }}
                                                                defaultValue={
                                                                    selectedType
                                                                        .option
                                                                        .huePercent
                                                                }
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setSelectedType(
                                                                        (pre) => {
                                                                            const newPre =
                                                                            {
                                                                                ...pre,
                                                                            };
                                                                            newPre.option.huePercent =
                                                                                value;
                                                                            return newPre;
                                                                        }
                                                                    );
                                                                }}
                                                                disabled={false}
                                                                tooltip={{
                                                                    open: true,
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                {selectedType.type ===
                                                    'EXPOSURE' && (
                                                        <>
                                                            <Slider
                                                                className="mt-5"
                                                                marks={{
                                                                    0: '0%',
                                                                    100: '100%',
                                                                }}
                                                                defaultValue={
                                                                    selectedType
                                                                        .option
                                                                        .exposurePercent
                                                                }
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setSelectedType(
                                                                        (pre) => {
                                                                            const newPre =
                                                                            {
                                                                                ...pre,
                                                                            };
                                                                            newPre.option.exposurePercent =
                                                                                value;
                                                                            return newPre;
                                                                        }
                                                                    );
                                                                }}
                                                                disabled={false}
                                                                tooltip={{
                                                                    open: true,
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                {selectedType.type ===
                                                    'CUTOUT' && (
                                                        <>
                                                            <p className="text-center mb-[7px] font-[700] text-[12px] mt-5">
                                                                Percent
                                                            </p>
                                                            <Slider
                                                                className="mt-0"
                                                                marks={{
                                                                    0: '0%',
                                                                    100: '100%',
                                                                }}
                                                                defaultValue={
                                                                    selectedType
                                                                        .option
                                                                        .cutoutPercent
                                                                }
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setSelectedType(
                                                                        (pre) => {
                                                                            const newPre =
                                                                            {
                                                                                ...pre,
                                                                            };
                                                                            newPre.option.cutoutPercent =
                                                                                value;
                                                                            return newPre;
                                                                        }
                                                                    );
                                                                }}
                                                                disabled={false}
                                                                tooltip={{
                                                                    open: true,
                                                                }}
                                                            />
                                                            <p className="text-center mb-[7px] font-[700] text-[12px]">
                                                                Count
                                                            </p>
                                                            <Slider
                                                                className="mt-0"
                                                                marks={{
                                                                    0: '1',
                                                                    100: '25',
                                                                }}
                                                                defaultValue={
                                                                    selectedType
                                                                        .option
                                                                        .cutoutCount
                                                                }
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setSelectedType(
                                                                        (pre) => {
                                                                            const newPre =
                                                                            {
                                                                                ...pre,
                                                                            };
                                                                            newPre.option.cutoutCount =
                                                                                Math.round(
                                                                                    (value *
                                                                                        25) /
                                                                                    100.0
                                                                                );
                                                                            return newPre;
                                                                        }
                                                                    );
                                                                }}
                                                                disabled={false}
                                                                tooltip={{
                                                                    open: true,
                                                                    formatter: (
                                                                        value
                                                                    ) =>
                                                                        Math.round(
                                                                            (value *
                                                                                25) /
                                                                            100.0
                                                                        ),
                                                                }}
                                                            />
                                                        </>
                                                    )}

                                                <div className="mt-auto rounded-md bg-[#d5edf3]  p-4">
                                                    <h2 className="font-[700] text-[16px]">
                                                        How Flip Augmentation
                                                        Improves Model
                                                        Performance
                                                    </h2>
                                                    <p>
                                                        Flipping an image can
                                                        improve model
                                                        performance in
                                                        substantial ways.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* button */}
                                    <div className="bg-gray-50 py-3 flex px-6 justify-between">
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() =>
                                                setOpenAugmentation(false)
                                            }
                                            ref={cancelButtonRef}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-[#5e6dc6] px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                                            onClick={() => {
                                                setSelectedType((pre) => {
                                                    return pre.id ===
                                                        types.length - 1
                                                        ? types[0]
                                                        : types[pre.id + 1];
                                                });
                                            }}
                                            ref={cancelButtonRef}
                                        >
                                            Apply
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

export default Preview;