import {
	ArrowLongLeftIcon,
	ArrowLongRightIcon,
} from '@heroicons/react/24/outline';
import { memo } from 'react';

const Pagination = (props) => {
	const { currentPage, totalPages, totalItems, onChange } = props;
	return (
		<>
			<nav className="flex mx-auto mt-10 max-w-2xl items-center justify-between border-t border-gray-200 px-4 sm:px-0 w-full">
				<div className="flex w-0 flex-1 !select-none">
					<a
						onClick={() => {
							if (currentPage > 1) {
								onChange(currentPage - 1);
							}
						}}
						className={` ${
							currentPage === 1 && 'hidden'
						} inline-flex cursor-pointer items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-blue-700 hover:scale-110  !select-none`}
					>
						<ArrowLongLeftIcon
							className="mr-3 h-5 w-5 text-gray-400"
							aria-hidden="true"
						/>
						Previous
					</a>
				</div>
				<div className="hidden md:-mt-px md:flex select-none">
					{Array.from({ length: totalPages }).map((item, index) => {
						if (
							index < 3 ||
							index > totalPages - 4 ||
							currentPage === index + 1
						) {
							return (
								<a
									onClick={() => onChange(index + 1)}
									key={`index${'-' + index}'}`}
									className={`${
										index + 1 === currentPage
											? 'border-blue-500 text-blue-700 font-bold !text-[20px]'
											: 'border-transparent text-gray-500'
									} cursor-pointer hover:font-bold inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium transition-all !duration-500 hover:text-blue-600  select-none ease`}
								>
									{index + 1}
								</a>
							);
						}

						if (
							index + 1 === currentPage - 1 ||
							index + 1 === currentPage + 1 ||
							(currentPage < 4 && index + 1 === 4) ||
							(currentPage > totalPages - 3 &&
								index + 1 === totalPages - 3)
						) {
							return (
								<span
									key={`index${index + '-  index}'}`}
									className="text-gray-500 inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium transition-all hover:text-blue-600  select-none"
								>
									...
								</span>
							);
						}

						return null;
					})}
				</div>
				<div className="-mt-px flex w-0 flex-1 justify-end">
					<a
						onClick={() => {
							if (currentPage < totalPages) {
								onChange(currentPage + 1);
							}
						}}
						className={` ${
							currentPage === totalPages && 'hidden'
						} cursor-pointer inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-blue-700 hover:scale-110  select-none`}
					>
						Next
						<ArrowLongRightIcon
							className="ml-3 h-5 w-5 text-gray-400"
							aria-hidden="true"
						/>
					</a>
				</div>
			</nav>
		</>
	);
};
export default memo(Pagination);
