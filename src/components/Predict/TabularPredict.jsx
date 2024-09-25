import React, { Fragment, useReducer, useState, useEffect } from 'react'
import instance from 'src/api/axios'
import { fetchWithTimeout } from 'src/utils/timeout'
import { API_URL } from 'src/constants/api'
import Loading from 'src/components/Loading'
import 'src/assets/css/chart.css'
import SolutionImage from 'src/assets/images/Solution.png'
import * as experimentAPI from 'src/api/experiment'
import Papa from 'papaparse'

const TabularPredict = ({
	experimentName,
	projectInfo,
	predictDataState,
	updateState,
}) => {
	const [csvData, setCsvData] = useState([])
	const [error, setError] = useState(null)

	useEffect(() => {
		if (
			predictDataState.uploadFiles &&
			predictDataState.uploadFiles[0].name.endsWith('.csv')
		) {
			const reader = new FileReader()

			reader.onload = () => {
				Papa.parse(reader.result, {
					header: true,
					skipEmptyLines: true,
					complete: (result) => {
						setCsvData(result.data)
					},
					error: (err) => {
						setError(err.message)
					},
				})
			}
			reader.readAsText(predictDataState.uploadFiles[0])
		}
		return
	}, [predictDataState.uploadFiles])
	return (
		<div className="w-full h-full">
			{console.log('toi da xuat hien')}
			{console.log('csvData', csvData)}
			<p>Hello WWord</p>
		</div>
	)
}
export default TabularPredict
