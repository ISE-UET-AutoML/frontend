import LineGraph from 'src/components/LineGraph'
import researchImage from 'src/assets/images/research.png'

const MultimodalTrainingGraph = (props) => {
	const { trainLossGraph, val_lossGraph, val_accGraph, updateState } = props
	return (
		<>
			<div className=" max-w-full text-gray-500 py-2.5">
				<div className="relative z-10 grid gap-3 grid-cols-4 grid-rows-1">
					<div className="relative  col-span-2 overflow-hidden  p-2 m-auto w-full h-full">
						<h1 class="mb-2 text-[7.5rem] font-extrabold leading-none tracking-tight text-gray-900">
							Training{' '}
						</h1>
						<h1 class="ml-5 mb-4 text-6xl font-extrabold leading-none tracking-tight text-gray-900 underline-draw">
							outcomes
						</h1>

						<div className=" absolute mt-4 bottom-3 right-0">
							<a
								onClick={() => {
									updateState({ showUploadPanel: true })
								}}
								href="#_"
								class="relative px-6 py-3 font-bold text-black group"
							>
								<span class="absolute inset-0 w-full h-full transition  rounded-md duration-300 ease-out transform -translate-x-2 -translate-y-2 bg-blue-200 group-hover:translate-x-0 group-hover:translate-y-0"></span>
								<span class="absolute inset-0 w-full h-full border-4  rounded-md  border-black"></span>
								<span class="relative">Predict New Data</span>
							</a>
						</div>
					</div>
					<div className="col-span-2 overflow-hidden flex relative rounded-md bg-white border border-gray-200 shadow-lg">
						<div className=" m-auto relative flex justify-center">
							<LineGraph
								data={trainLossGraph}
								label="Train Loss"
							/>
						</div>
					</div>
					<div className="col-span-2 overflow-hidden flex relative p-2 rounded-md bg-white border border-gray-200 shadow-lg">
						<div className="size-fit m-auto relative flex justify-center">
							<LineGraph
								data={val_lossGraph}
								label="Validation loss"
							/>
						</div>
					</div>
					<div className="col-span-2 overflow-hidden flex relative p-2 rounded-md bg-white border border-gray-200 shadow-lg">
						<div className="size-fit m-auto relative flex justify-center">
							<LineGraph
								data={val_accGraph}
								label="Validation accuracy"
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default MultimodalTrainingGraph
