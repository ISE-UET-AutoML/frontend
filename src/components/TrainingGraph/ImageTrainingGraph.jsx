import LineGraph from 'src/components/LineGraph'
import researchImage from 'src/assets/images/research.png'

const ImageTrainingGraph = (props) => {
	const { trainLossGraph, val_lossGraph, val_accGraph, updateState } = props
	return (
		<div className="py-2.5">
			<div className="flex m-auto w-full h-full mb-6 relative">
				<h1 class=" text-6xl font-extrabold leading-none tracking-tight text-gray-900">
					Training{' '}
				</h1>
				<h1 class=" ml-5 mb-4 text-6xl font-extrabold leading-none tracking-tight text-gray-900 underline-draw">
					outcomes
				</h1>
				<button
					className="btn absolute right-0 mt-[20px]"
					onClick={() => {
						updateState({ showUploadPanel: true })
					}}
				>
					<svg
						height="24"
						width="24"
						fill="#FFFFFF"
						viewBox="0 0 24 24"
						data-name="Layer 1"
						id="Layer_1"
						className="sparkle"
					>
						<path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
					</svg>

					<span className="text">Predict New Data</span>
				</button>
			</div>
			<div className=" max-w-full text-gray-500">
				<div className="relative z-10 grid gap-3 grid-cols-6">
					<div className="col-span-full lg:col-span-2 overflow-hidden flex relative p-2 rounded-xl bg-white border border-gray-200 shadow-lg">
						<div className="size-fit m-auto relative flex justify-center">
							<LineGraph
								data={trainLossGraph}
								label="train_loss"
							/>
						</div>
					</div>
					<div className="col-span-full lg:col-span-2 overflow-hidden flex relative p-2 rounded-xl bg-white border border-gray-200 shadow-lg">
						<div className="size-fit m-auto relative flex justify-center">
							<LineGraph data={val_lossGraph} label="val_loss" />
						</div>
					</div>
					<div className="col-span-full lg:col-span-2 overflow-hidden flex relative p-2 rounded-xl bg-white border border-gray-200 shadow-lg">
						<div className="size-fit m-auto relative flex justify-center">
							<LineGraph
								data={val_accGraph}
								label="val_accuracy"
							/>
						</div>
					</div>

					<div className=" h-56 col-span-full lg:col-span-5 overflow-hidden relative p-8 rounded-xl bg-white border border-gray-200 shadow-lg">
						<div className="flex flex-col justify-between relative z-10 space-y-12 lg:space-y-6">
							<div className="space-y-2">
								<p className=" text-gray-700">
									<span className="font-bold">
										Train loss (train_loss)
									</span>{' '}
									measures a model's prediction error during
									training. It indicates how well the model
									fits the training data, with lower values
									suggesting better performance.
								</p>
								<p className=" text-gray-700">
									<span className="font-bold">
										Validation loss (val_loss)
									</span>{' '}
									evaluates a model's performance on unseen
									data, providing insight into its
									generalization ability. A significant gap
									between train loss and val_loss often
									indicates overfitting, where the model
									performs well on training data but poorly on
									new data.
								</p>
								<p className=" text-gray-700">
									<span className="font-bold">
										Validation accuracy (val_accuracy)
									</span>{' '}
									measures a model's ability to correctly
									predict outcomes on unseen validation data.
									High validation accuracy indicates strong
									generalization, while a large gap with
									training accuracy may signal overfitting.
								</p>
							</div>
						</div>
					</div>
					<div className="h-56 col-span-full lg:col-span-1 overflow-hidden flex relative p-2 rounded-xl bg-white border border-gray-200 shadow-lg">
						<div className="size-fit m-auto relative flex justify-center">
							<img src={researchImage} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ImageTrainingGraph
