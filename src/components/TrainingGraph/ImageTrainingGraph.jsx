import LineGraph from 'src/components/LineGraph'
import researchImage from 'src/assets/images/research.png'

const ImageTrainingGraph = (trainLossGraph, val_lossGraph, val_accGraph) => {
	return (
		<div className="py-2.5">
			{console.log('trainLossGraph', trainLossGraph)}
			{console.log('val_lossGraph', val_lossGraph)}
			{console.log('val_accGraph', val_accGraph)}
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
