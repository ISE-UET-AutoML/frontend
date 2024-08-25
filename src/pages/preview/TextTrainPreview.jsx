import React, { useState, useEffect } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { listImages, trainModel } from 'src/api/project'
import Loading from 'src/components/Loading'
import Pagination from 'src/components/Pagination'

const TextTrainPreview = ({ texts, pagination, next, updateFields }) => {
	const location = useLocation()
	let [searchParams, setSearchParams] = useSearchParams()
	const [error, setError] = useState(null)
	const { id: projectId } = useParams()
	const [isLoading, setIsLoading] = useState(false)
	const [paginationStep2, setPaginationStep2] = useState({
		currentPage: pagination?.page ?? 1,
		totalPages: pagination?.total_page ?? 10,
	})

	const handleTrain = async () => {
		try {
			const { data } = await trainModel(projectId)
			const searchParams = new URLSearchParams(location.search)
			searchParams.get('experiment_name') ??
				setSearchParams((pre) =>
					pre.toString().concat(`&experiment_name=${data.task_id}`)
				)
			updateFields({
				isDoneStepTwo: true,
				experiment_name: data.task_id,
			})
			// next()
		} catch (error) {
			console.error(error)
		}
	}

	const handlePageChange = async (page) => {
		const searchParams = new URLSearchParams(location.search)
		const id = searchParams.get('id')
		if (id) {
			setIsLoading(true)
			const { data } = await listImages(id, `&page=${page}&size=10`)
			setPaginationStep2({ ...paginationStep2, currentPage: page })
			updateFields({
				...data.data,
				pagination: data.meta,
			})
			setIsLoading(false)
		} else if (projectId) {
			setIsLoading(true)
			const { data } = await listImages(
				projectId,
				`&page=${page}&size=10`
			)
			setPaginationStep2({ ...paginationStep2, currentPage: page })
			updateFields({
				...data.data,
				pagination: data.meta,
			})
			setIsLoading(false)
		}
	}
	useEffect(() => {
		if (pagination) {
			setPaginationStep2({
				currentPage: pagination?.page ?? 1,
				totalPages: pagination?.total_page ?? 10,
			})
		}
	}, [pagination])

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search)
		const experimentName = searchParams.get('experiment_name')
		if (experimentName) {
			updateFields({ isDoneStepTwo: true })
		}
	}, [])

	console.log('texts', texts)

	return (
		<>
			<div className="flex w-full pt-2 pb-5">
				{isLoading && <Loading />}
				<div
					class="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50"
					role="alert"
				>
					<svg
						class="flex-shrink-0 inline w-4 h-4 mr-3"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
					</svg>
					<div>
						Ensure that all labels are meticulously verified prior
						to initiating the training process.
					</div>
				</div>
				<div className="ml-auto relative h-full pt-3">
					<button
						onClick={handleTrain}
						className=" text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
					>
						Train Model
					</button>
				</div>
			</div>
			<div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 mb-4">
				{/* <div className="flex justify-between items-center mb-2">
						<h3 className="text-lg font-semibold text-gray-800">
							{texts.name}
						</h3>
						<button
							onClick={() => handleRemoveFile(index)}
							className="bg-red-500 text-white rounded px-2 py-1 text-sm hover:bg-red-600"
						>
							Remove
						</button>
					</div> */}
				{error && <p className="text-red-500 text-sm">{error}</p>}
				<>
					<div className="overflow-x-auto mb-6 rounded-lg border-2 border-slate-50">
						{texts ? (
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gradient-to-r bg-[#f0f8ff] font-bold">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider w-[90%]">
											SENTENCES
										</th>
										<th className="px-6 py-3 text-center text-xs font-bold text-black uppercase tracking-wider">
											LABEL
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{texts.map((row) => (
										<tr
											key={row._id}
											className="hover:bg-gray-100"
										>
											<td className="px-6 py-2.5 text-sm text-gray-700 w-[90%] break-words">
												{row.url}
											</td>
											<td className="px-6 py-2.5 text-sm text-gray-700 whitespace-nowrap text-center">
												{row.label}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div className="relative">
								<Loading />
							</div>
						)}
						{texts && (
							<Pagination
								currentPage={paginationStep2.currentPage}
								totalPages={paginationStep2.totalPages}
								onChange={handlePageChange}
							/>
						)}
					</div>
				</>
			</div>
		</>
	)
}

export default TextTrainPreview
