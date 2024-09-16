import { useEffect, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { getPreviewDataByPage, trainModel } from 'src/api/project'
import Loading from 'src/components/Loading'
import Pagination from 'src/components/Pagination'

const ImageTrainPreview = ({ datas, pagination, next, updateFields }) => {
	const total_pages = Math.ceil(pagination.total / pagination.page_size)
	console.log('pagination', pagination)
	const location = useLocation()
	let [searchParams, setSearchParams] = useSearchParams()
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
			updateFields({ experiment_name: data.task_id })
			next()
		} catch (error) {
			console.error(error)
		}
	}

	const handlePageChange = async (page) => {
		if (projectId) {
			setIsLoading(true)
			try {
				const { data } = await getPreviewDataByPage(projectId, page, 12) // pageSize = 12
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

	return (
		<div className="container w-full mx-auto h-full">
			{isLoading && <Loading />}
			<div className="flex flex-col bg-white shadow-xl rounded-md h-max pl-10 pr-10 pb-8 ml-10">
				<div className="flex w-full pt-2 pb-5">
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
							Ensure that all labels are meticulously verified
							prior to initiating the training process.
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
				<div className="grid grid-cols-4 gap-3">
					{datas ? (
						datas.map((image) => (
							<div
								key={image.id}
								className="rounded-md overflow-hidden relative group hover:opacity-100"
							>
								<img
									src={image.data['data-IMG-image']}
									alt=""
									className="h-[149px] w-full m-0 object-cover rounded-md"
								/>
								<h1 className="text-xs font-bold text-white absolute bottom-2 left-2 bg-black bg-opacity-50 p-2 rounded-md">
									{image.data.label}
								</h1>
							</div>
						))
					) : (
						<div className="relative">
							<Loading />
						</div>
					)}
				</div>

				{datas && (
					<Pagination
						currentPage={paginationStep2.currentPage}
						totalPages={paginationStep2.totalPages}
						onChange={handlePageChange}
					/>
				)}
			</div>
		</div>
	)
}

export default ImageTrainPreview
