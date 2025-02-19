import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import * as experimentAPI from 'src/api/experiment'
import config from './config'
const RenderGraph = (props) => {
	const { projectInfo } = props
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const experimentName = searchParams.get('experiment_name')
	const [GraphJSON, setGraphJSON] = useState({})
	const [trainLossGraph, setTrainLossGraph] = useState([])
	const [val_lossGraph, setValLossGraph] = useState([])
	const [val_accGraph, setValAccGraph] = useState([])
	const [val_roc_aucGraph, setRocAucGraph] = useState([])
	const [isHasGraph, setIsHasGraph] = useState(false)

	const readChart = (contents, setGraph) => {
		const lines = contents.split('\n')
		const header = lines[0].split(',')
		let parsedData = []
		for (let i = 1; i < lines.length - 1; i++) {
			const line = lines[i].split(',')
			const item = {}

			for (let j = 1; j < header.length; j++) {
				const key = header[j]?.trim() || ''
				const value = line[j]?.trim() || ''
				item[key] = value
			}

			parsedData.push(item)
		}

		setGraph(parsedData)
	}
	// TODO: Render training graph for Tabular/Text
	useEffect(() => {
		experimentAPI.getTrainingHistory(experimentName).then((res) => {
			const data = res.data

			console.log('history', data)
			setGraphJSON(data)

			if (data.fit_history.scalars.train_loss) {
				readChart(
					data.fit_history.scalars.train_loss,
					setTrainLossGraph
				)
				setIsHasGraph(true)
			}

			if (data.fit_history.scalars.val_accuracy) {
				readChart(data.fit_history.scalars.val_accuracy, setValAccGraph)
				setIsHasGraph(true)
			}

			if (data.fit_history.scalars.val_loss) {
				readChart(data.fit_history.scalars.val_loss, setValLossGraph)
				setIsHasGraph(true)
			}

			if (data.fit_history.scalars.val_roc_auc) {
				readChart(data.fit_history.scalars.val_roc_auc, setRocAucGraph)
				setIsHasGraph(true)
			}
		})
	}, [])

	return (
		<div className="h-full">
			{isHasGraph &&
				(() => {
					const object = config[projectInfo.type]
					if (object) {
						const GraphComponent = object.trainingGraph
						return (
							<GraphComponent
								trainLossGraph={trainLossGraph}
								val_lossGraph={val_lossGraph}
								val_accGraph={val_accGraph}
								val_roc_aucGraph={val_roc_aucGraph}
								updateProjState={props}
							/>
						)
					}
					return null
				})()}
		</div>
	)
}

export default RenderGraph
