import React, { useState, useEffect } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { getPreviewDataByPage, trainModel } from 'src/api/project'
import Loading from 'src/components/Loading'
import Pagination from 'src/components/Pagination'

const MultimodalTrainPreview = ({ datas, pagination, next, updateFields }) => {
	const total_pages = Math.ceil(pagination.total / pagination.page_size)
	const location = useLocation()
	let [searchParams, setSearchParams] = useSearchParams()
	const [error, setError] = useState(null)
	const { id: projectId } = useParams()
	const [isLoading, setIsLoading] = useState(false)
	const [paginationStep2, setPaginationStep2] = useState({
		currentPage: pagination?.page ?? 1,
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
				const { data } = await getPreviewDataByPage(projectId, page, 2) // pageSize = 2
				const props = {
					files: data.tasks,
					pagination: data.meta,
				}
				setPaginationStep2((prevState) => ({
					...prevState,
					currentPage: data.meta.page,
				}))
				updateFields({
					...props,
				})
			} catch (error) {
				console.error('Error fetching page data:', error)
			} finally {
				setIsLoading(false)
			}
		}
	}

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search)
		const experimentName = searchParams.get('experiment_name')
		if (experimentName) {
			updateFields({ isDoneLabelData: true })
		}
	}, [])

	const capitalizeFirstLetter = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
	}

	return (
		<>
			<div className="flex w-full pt-2 pb-5">
				{isLoading && <Loading />}
				<div
					className="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50"
					role="alert"
				>
					<svg
						className="flex-shrink-0 inline w-4 h-4 mr-3"
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
					<div className="mb-6 rounded-lg border-2 border-slate-50">
						{datas ? (
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gradient-to-r bg-[#f0f8ff] font-bold">
									<tr>
										<td className="px-6 py-3 text-center text-sm  font-bold text-black uppercase tracking-wider w-[30%]">
											Product Image
										</td>
										<td className="px-6 py-3 text-center text-sm font-bold text-black uppercase tracking-wider">
											Product Information
										</td>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{datas.map((row) => {
										let newData = {}
										for (let key in row.data) {
											let newKey = key
												.replace('data-TXT-', '')
												.replace('data-VAL-', '')
												.replace('data-IMG-', '')
											newData[newKey] = row.data[key]
										}

										return (
											<tr
												key={row.id}
												className="hover:bg-gray-100"
											>
												<td className="p-2">
													<img
														src={
															newData[
																'url_thumbnail'
															]
														}
														alt=""
														className="h-[250px] w-full m-0 object-cover rounded-md"
													/>
												</td>
												<td className="pl-4 text-left text-sm">
													<div>
														{Object.keys(newData)
															.filter(
																(key) =>
																	key !==
																		'url_thumbnail' &&
																	key !==
																		'is_valid_report' &&
																	key !==
																		'data-IMG-url'
															)
															.map((key) => (
																<p key={key}>
																	<span className="font-bold">
																		{capitalizeFirstLetter(
																			key.replace(
																				/_/g,
																				' '
																			)
																		)}
																	</span>
																	:{' '}
																	{
																		newData[
																			key
																		]
																	}
																</p>
															))}
													</div>
												</td>
											</tr>
										)
									})}
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

export default MultimodalTrainPreview
