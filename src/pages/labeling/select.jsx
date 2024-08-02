/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
export default function Example() {
	return (
		<div>
			<label
				htmlFor="location"
				className="block text-sm font-medium text-gray-700"
			>
				Location
			</label>
			<select
				id="location"
				name="location"
				className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
				defaultValue="Canada"
			>
				<option>United States</option>
				<option>Canada</option>
				<option>Mexico</option>
			</select>
		</div>
	);
}
