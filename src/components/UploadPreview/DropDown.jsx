import React from 'react'

const DropDown = ({
	csvData,
	dataFeature,
	toggleDropdown,
	isDropdownOpen,
	handleChange,
	targetColumn,
	type,
}) => {
	return (
		<div className="relative flex items-center">
			{type === 'radio' ? <h1 className="mr-4">Target Column</h1> : <></>}
			<div>
				<button
					onClick={() => toggleDropdown(type)}
					className={`text-white ${type === 'radio' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-green-700 hover:bg-green-800'} font-medium rounded-lg text-sm px-2 py-1 text-center inline-flex items-center `}
					type="button"
				>
					{type === 'radio' ? targetColumn : 'Activated Features'}{' '}
					<svg
						className={`w-2.5 h-2.5 ms-3 transform transition-transform duration-500 ${
							isDropdownOpen(type) ? 'rotate-180' : 'rotate-0'
						}`}
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 10 6"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="m1 1 4 4 4-4"
						/>
					</svg>
				</button>

				<div
					id={`dropdown${type}BgHover`}
					className={`z-10 ${
						isDropdownOpen(type) ? '' : 'hidden'
					} absolute z-10 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow mt-2`}
				>
					<ul
						className="p-3 space-y-1 text-sm text-blue-700 "
						aria-labelledby={`dropdown${type}BgHoverButton`}
					>
						{csvData.length > 0 &&
							dataFeature.map((el) => {
								if (el.value === 'id') return <></>
								if (type === 'radio' && !el.isActived)
									return <></>
								return (
									<li key={el.value}>
										<div className="flex items-center px-2 rounded hover:bg-gray-100">
											{type === 'radio' ? (
												<input
													id={type + el.value}
													type={type}
													value={el.value}
													name="target-column"
													onChange={(event) =>
														handleChange(
															event,
															el,
															type
														)
													}
													className="w-4 h-4 text-blue-600 bg-blue-100 border-blue-300"
												/>
											) : (
												<input
													id={type + el.value}
													type={type}
													value={el.value}
													name="target-column"
													checked={el.isActived}
													onChange={(event) =>
														handleChange(
															event,
															el,
															type
														)
													}
													className="w-4 h-4 text-blue-600 bg-blue-100 border-blue-300"
												/>
											)}

											<label
												htmlFor={type + el.value}
												className="w-full py-2 ms-2 text-sm font-medium text-gray-900 rounded"
											>
												{el.value}
											</label>
										</div>
									</li>
								)
							})}
					</ul>
				</div>
			</div>
		</div>
	)
}

export default DropDown
