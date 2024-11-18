import { useState } from 'react'
import Loading from 'src/components/Loading'
import PaginationNew from 'src/components/PaginationNew'

const ImageClassDataView = ({ dataset, files }) => {
	const [currentPage, setCurrentPage] = useState(1)
	const imagesPerPage = 16

	// Calculate the indices for the current page
	const indexOfLastImage = currentPage * imagesPerPage
	const indexOfFirstImage = indexOfLastImage - imagesPerPage
	const currentImages = files.slice(indexOfFirstImage, indexOfLastImage)

	const totalPages = Math.ceil(files.length / imagesPerPage)

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	return (
		<div className="bg-white h-full w-full p-2">
			<div className="grid grid-cols-4 gap-3 grid-rows-4 h-[90%]">
				{currentImages.length > 0 ? (
					currentImages.map((file) => (
						<div
							key={file.fileName}
							className="rounded-md overflow-hidden relative group hover:opacity-100"
						>
							<img
								src={file.content}
								alt=""
								className="h-full w-full m-0 object-cover rounded-md"
							/>
							{/* <h1 className="text-xs font-bold text-white absolute bottom-2 left-2 bg-black bg-opacity-50 p-2 rounded-md">
                					{image.data.label}
              					</h1> */}
						</div>
					))
				) : (
					<div className="relative">
						<Loading />
					</div>
				)}
			</div>
			<PaginationNew
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
			/>
		</div>
	)
}

export default ImageClassDataView
