import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	BarChart,
	Bar,
} from 'recharts'

const LineGraph = ({ data, label }) => (
	<>
		{data.length > 0 && (
			<div className="charts-container">
				<h3>{label}</h3>
				<div className="chart">
					<LineChart
						width={500}
						height={300}
						data={data}
						margin={{
							top: 5,
							right: 30,
							left: 0,
							bottom: 5,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="step" />
						<YAxis />
						<Tooltip />
						<Legend />
						<Line
							type="monotone"
							dataKey="value"
							stroke="#CA4F8E"
							strokeWidth="3"
						/>
					</LineChart>
				</div>
			</div>
		)}
	</>
)

export default LineGraph
