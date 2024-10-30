import { useReducer, useEffect, useState } from 'react'
import { TableCellsIcon } from '@heroicons/react/20/solid'
import { PlusIcon } from '@heroicons/react/24/solid'
import DatasetCard from './card'

const initialState = {
	showUploader: false,
	datasets: [],
}

export default function DatasetList() {
	const [datasetState, updateDataState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		initialState
	)
	return (
		<>
			<div className="mx-auto w-full flex-grow lg:flex xl:px-2 -z-10 mt-2">
				{/* Left sidebar & main wrapper */}
				<div className="min-w-0 flex-1 bg-white xl:flex p-5 rounded-md">
					{/* Projects List */}
					<div className="bg-white lg:min-w-0 lg:flex-1">
						<div className="flex justify-between mx-auto px-3 mb-5 ">
							<div className="px-4 lg:px-0">
								<h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
									Datasets
								</h1>
								{/* Meta info */}
								<div className="flex mt-5 flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-6">
									<div className="flex items-center space-x-2">
										<TableCellsIcon
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
										<span className="text-sm font-medium text-gray-500">
											{datasetState.datasets.length}{' '}
											Datasets
										</span>
									</div>
								</div>
							</div>
							{/* Action buttons */}
							<div className="flex flex-col sm:flex-row xl:flex-col">
								<button
									type="button"
									className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer h-fit"
									onClick={() =>
										updateDataState({ showUploader: true })
									}
								>
									<PlusIcon
										className="-ml-1 mr-2 h-5 w-5"
										aria-hidden="true"
									/>
									New Dataset
								</button>
							</div>
						</div>

						{datasetState.datasets.length > 0 ? (
							<div className="px-3  mx-auto pt-5 overflow-hidden grid sm:grid-cols-2 xl:grid-cols-3 gap-5 py-4">
								{datasetState.datasets.map((project) => (
									<DatasetCard
										key={dataset._id}
										dataset={dataset}
										getDatasets={getDatasets}
									/>
								))}
							</div>
						) : (
							<div className="text-center">
								<svg
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
									className="mx-auto h-12 w-12 text-gray-400"
								>
									<path
										vectorEffect="non-scaling-stroke"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
									/>
								</svg>

								<h3 className="mt-2 text-sm font-medium text-gray-900">
									No datasets
								</h3>
								<p className="mt-1 text-sm text-gray-500">
									Get started by creating a new dataset.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
