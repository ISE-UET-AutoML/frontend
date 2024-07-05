import { CubeTransparentIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PATHS } from 'src/constants/paths';
dayjs.extend(relativeTime);

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

export default function ModelCard({ model }) {
	return (
		<>
			<div
				key={model._id}
				className={classNames(
					'relative group p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg bg-white shadow '
				)}
			>
				<div>
					<span
						className={classNames(
							'text-blue-700',
							'bg-blue-50',
							'rounded-lg inline-flex p-3 ring-4 ring-white'
						)}
					>
						<CubeTransparentIcon
							className="h-6 w-6"
							aria-hidden="true"
						/>
					</span>
				</div>
				<div className="mt-8">
					<div className="flex w-full justify-between items-center">
						<h3 className="text-lg font-medium">
							<a
								href={PATHS.PREDICT}
								className="focus:outline-none"
							>
								{/* Extend touch target to entire panel */}
								<span
									className="absolute inset-0"
									aria-hidden="true"
								/>
								{model?.name}
							</a>
						</h3>
						{model.createdAt && (
							<span>{dayjs(model.createdAt).fromNow()}</span>
						)}
					</div>
				</div>
				<span
					className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
					aria-hidden="true"
				>
					<svg
						className="h-6 w-6"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
					</svg>
				</span>
			</div>
		</>
	);
}
