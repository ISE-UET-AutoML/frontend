import ProjectCard from './card';
import { RectangleStackIcon } from '@heroicons/react/20/solid';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useReducer, useEffect } from 'react';
import instance from 'src/api/axios';
import { message } from 'antd';
import { API_URL } from 'src/constants/api';
import { PATHS } from 'src/constants/paths';

const initialState = {
    showUploader: false,
    projects: [],
};
export default function ProjectList() {
    const [dashboardState, updateState] = useReducer((state, newState) => ({ ...state, ...newState }), initialState);

    const handleCreateProject = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        try {
            const response = await instance.post(API_URL.all_projects, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log({ response });
            if (response.status === 200) {
                console.log({ response });
                window.location = PATHS.PROJECT_BUILD(response.data._id);
            }
        } catch (error) {
            message.error('Project already existed');
        }
    };

    const getProjects = async () => {
        const response = await instance.get(API_URL.all_projects);
        updateState({ projects: response.data });
        return response.data;
    };

    useEffect(() => {
        dashboardState.projects.length >= 0 && getProjects();
    }, []);

    return (
        <>
            <div className="">
                <div className="mx-auto w-full flex-grow lg:flex xl:px-2 -z-10 mt-2">
                    {/* Left sidebar & main wrapper */}
                    <div className="min-w-0 flex-1 bg-white xl:flex p-5 rounded-md">
                        {/* Projects List */}
                        <div className="bg-white lg:min-w-0 lg:flex-1">
                            <div className="flex justify-between mx-auto px-3 mb-5 ">
                                <div className="px-4 lg:px-0">
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                        Projects
                                    </h1>
                                    {/* Meta info */}
                                    <div className="flex mt-5 flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-6">
                                        <div className="flex items-center space-x-2">
                                            <RectangleStackIcon
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            <span className="text-sm font-medium text-gray-500">
                                                {dashboardState.projects.length}{' '}
                                                Projects
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Action buttons */}
                                <div className="flex flex-col sm:flex-row xl:flex-col">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer h-fit"
                                        // onClick={() => (window.location = '/app/new-project')}
                                        onClick={() =>
                                            updateState({ showUploader: true })
                                        }
                                    >
                                        <PlusIcon
                                            className="-ml-1 mr-2 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                        New Project
                                    </button>
                                </div>
                            </div>

                            {dashboardState.projects.length > 0 ? (
                                <div className="px-3  mx-auto pt-5 overflow-hidden grid sm:grid-cols-2 xl:grid-cols-3 gap-5 py-4">
                                    {dashboardState.projects.map((project) => (
                                        <ProjectCard
                                            key={project._id}
                                            project={project}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            vectorEffect="non-scaling-stroke"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No projects
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating a new project.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* modal */}
            <div
                className={`${dashboardState.showUploader
                    ? 'top-0 !z-[1000] opacity-100'
                    : 'top-full bottom-0 opacity-0'
                    } fixed flex flex-col items-center h-full w-full px-[30px] justify-center bg-white  transition-all duration-500 ease overscroll-auto overflow-auto min-h-screen`}
            >
                <button
                    onClick={() => updateState({ showUploader: false })}
                    className="absolute top-5 right-5 p-[12px] rounded-full bg-transparent hover:bg-gray-300 hover:text-white font-[600] w-[48px] h-[48px]"
                >
                    <svg
                        className="hover:scale-125 hover:fill-red-500"
                        focusable="false"
                        viewBox="0 0 24 24"
                        color="#69717A"
                        aria-hidden="true"
                        data-testid="close-upload-media-dialog-btn"
                    >
                        <path d="M18.3 5.71a.9959.9959 0 00-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                    </svg>
                </button>

                <div className="mt-10 sm:mt-0 w-full max-w-xl">
                    <form action="#" onSubmit={handleCreateProject}>
                        <div className="overflow-hidden shadow sm:rounded-md">
                            <div className="bg-white sm:rounded-md px-4 py-5 sm:p-6 w-full max-w-xl  border border-gray-100">
                                <div className="flex flex-col gap-6">
                                    <div className="">
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            minLength={10}
                                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                            placeholder="Project name goes here"
                                        />
                                    </div>

                                    <div className="">
                                        <label
                                            htmlFor="about"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Description
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows={5}
                                                required
                                                minLength={5}
                                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                                placeholder="Description of the project goes here "
                                                defaultValue={''}
                                            />
                                        </div>
                                    </div>

                                    <div className="">
                                        <label
                                            htmlFor="expectation_accuracy"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Expectation Accuracy
                                        </label>
                                        <input
                                            type="number"
                                            name="expectation_accuracy"
                                            id="expectation_accuracy"
                                            required
                                            min={0}
                                            max={100}
                                            placeholder="0-100"
                                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="">
                                        <label
                                            htmlFor="country"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Project Type
                                        </label>
                                        <select
                                            id="type"
                                            name="type"
                                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                        >
                                            <option>CLASSIFICATION</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
