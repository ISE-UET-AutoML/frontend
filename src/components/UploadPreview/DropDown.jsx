import React from 'react'
import { Select } from 'antd'

const DropDown = ({
	csvData,
	dataFeature,
	toggleDropdown,
	isDropdownOpen,
	handleChange,
	targetColumn,
	type,
	featureTypes,
}) => {
	return (
		<div className="relative flex items-center">
			{/*{type === 'radio' ? 'Label Column' : ''} */}
			<div>
				<button
					onClick={() => toggleDropdown(type)}
					className={`text-white ${
						type === 'radio'
							? 'bg-blue-600 hover:bg-blue-700'
							: 'bg-emerald-600 hover:bg-emerald-700'
					} font-medium rounded-lg text-sm px-2 py-2 text-center inline-flex items-center `}
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
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="m1 1 4 4 4-4"
						/>
					</svg>
				</button>
				<div
					id={`dropdown${type}BgHover`}
					className={`z-10 ${
						isDropdownOpen(type) ? '' : 'hidden'
					} absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow mt-2`}
				>
					{type === 'radio' ? (
						<ul
							className="p-3 space-y-1 text-sm text-blue-700 "
							aria-labelledby={`dropdown${type}BgHoverButton`}
						>
							{csvData.length > 0 &&
								dataFeature.map((el) => {
									if (el.value === 'id') return <></>
									// if (!el.isActivated)
									// 	return <></>
									return (
										<li key={el.value}>
											<div className="flex items-center px-2 rounded hover:bg-gray-100">
												<>
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
													<label
														htmlFor={
															type + el.value
														}
														className="w-full py-2 ms-2 text-sm font-medium text-gray-900 rounded"
													>
														{el.value}
													</label>
												</>
											</div>
										</li>
									)
								})}
						</ul>
					) : (
						<table>
							<tr className="border-b-2">
								<th>Feature</th>
								<th>Type</th>
								<th className="px-2">Activate</th>
							</tr>
							{csvData.length > 0 &&
								dataFeature.map((el) => {
									if (el.value === 'id' || el.isLabel)
										return <></>
									return (
										<tr className="text-center">
											<td className="pr-4">
												<label
													htmlFor={type + el.value}
													className="p-2 ms-2 text-sm font-medium text-gray-900 rounded"
												>
													{el.value}
												</label>
											</td>
											<td>
												<Select
													defaultValue={el.type}
													style={{ width: 110 }}
													onChange={(event) =>
														handleChange(
															event,
															el,
															type
														)
													}
													options={featureTypes?.map(
														(item) => ({
															value: item,
															label: item,
														})
													)}
												/>
											</td>
											<td className="p-2">
												<input
													id={type + el.value}
													type="checkbox"
													value={el.value}
													name="target-column"
													checked={el.isActivated}
													onChange={(event) =>
														handleChange(
															event,
															el,
															type
														)
													}
													className="w-4 h-4 text-blue-600 bg-blue-100 border-blue-300"
												/>
											</td>
										</tr>
									)
								})}
						</table>
					)}
				</div>
			</div>
		</div>
	)
}

export default DropDown
