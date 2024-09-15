import React, { useState, useEffect } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { getPreviewDataByPage, trainModel } from 'src/api/project'
import Loading from 'src/components/Loading'
import Pagination from 'src/components/Pagination'

const TextTrainPreview = ({ texts, pagination, next, updateFields, meta }) => {
	const total_pages = Math.ceil(meta.total / meta.page_size)
	const location = useLocation()
	let [searchParams, setSearchParams] = useSearchParams()
	const [error, setError] = useState(null)
	const { id: projectId } = useParams()
	const [isLoading, setIsLoading] = useState(false)
	const [paginationStep2, setPaginationStep2] = useState({
		currentPage: meta?.page ?? 1,
		totalPages: total_pages ?? 10,
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
				isDoneLabelData: true,
				experiment_name: data.task_id,
			})
			// next()
		} catch (error) {
			console.error(error)
		}
	}

	const handlePageChange = async (page) => {
		if (projectId) {
			setIsLoading(true)
			try {
				const { data } = await getPreviewDataByPage(projectId, page, 10) // pageSize = 10
				setPaginationStep2((prevState) => ({
					...prevState,
					currentPage: data.meta.page,
				}))
				updateFields({
					...data,
					meta: data.meta,
				})
			} catch (error) {
				console.error('Error fetching page data:', error)
			} finally {
				setIsLoading(false)
			}
		}
	}

	// useEffect(() => {
	// 	if (pagination) {
	// 		setPaginationStep2({
	// 			currentPage: pagination?.page ?? 1,
	// 			totalPages: pagination?.total_page ?? 10,
	// 		})
	// 	}
	// }, [pagination])

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search)
		const experimentName = searchParams.get('experiment_name')
		if (experimentName) {
			updateFields({ isDoneLabelData: true })
		}
	}, [])

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
				{error && <p className="text-red-500 text-sm">{error}</p>}
				<>
					<div className="overflow-x-auto mb-6 rounded-lg border-2 border-slate-50">
						{datas ? (
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
									{datas.map((row) => (
										<tr
											key={row.id}
											className="hover:bg-gray-100"
										>
											<td className="px-6 py-2.5 text-sm text-gray-700 w-[90%] break-words">
												{row.data['data-TXT-text']}
											</td>
											<td className="px-6 py-2.5 text-sm text-gray-700 whitespace-nowrap text-center">
												{row.data.label}
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
						{datas && (
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
