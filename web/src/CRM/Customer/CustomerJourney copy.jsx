import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import moment from 'moment'

const CustomerJourney = ((props) => {
	const { height } = props?.data
	const [dataPoints, setDataPoints] = useState([]);
	const [customerEmotions, setCustomerEmotions] = useState([]);

	useEffect(() => {
		let { customerEmotions } = props?.data;
		customerEmotions?.sort((a, b) => {
			return new Date(a.date) - new Date(b.date);
		});
		customerEmotions = customerEmotions.slice(-5)
		setDataPoints([...customerEmotions]);
	}, [props])

	useEffect(() => {
		let tempArray = [];
		dataPoints.map(({ percentage, ...res }) => {
			tempArray.push({
				value: parseInt(percentage), ...res
			})
		});
		setCustomerEmotions([...tempArray])
	}, [dataPoints])

	return (
		<div id="explanation-table">
			<ReactEcharts style={{ height: height || '400%' }}
				option={{
					tooltip: {
						trigger: '',
						renderMode: 'html',
						formatter: function (params) {
							let { statement, separator } = params;
							return `<strong>${statement.split(separator).join("<br/>")}</strong>`
						}
					},
					xAxis: [
						{
							type: 'category',
							show: false
						}
					],
					yAxis: [
						{
							type: 'value',
							show: false,
							min: 0,
							max: 8,
							axisLabel: {
								margin: 20,
								width: "90",
								overflow: "truncate",
							},
						}
					],
					series: [{
						type: 'line',
						smooth: true,
						
// 						label: {
// 							show: true,
// 							//width: 200,
// 							grid: { containLabel: true },
// //							confine: true,
// 							overflow: 'truncate',
// 							position: 'top',
// 							align: 'center',
// 							distance: 10,
// 							lineHeight: 30,
// 							formatter: function ({ data }) {
// 								let { emotion, statement, event, separator, date } = data;
// 								console.log('statement==>', statement)
// 								let statements = (statement.split(separator).join(' '))?.trim();
// 								// return [
// 								// 	'{emoji|' + emotion + '\n\n}',
// 								// 	'{statement|' + `${statement && statement != '' ? statement : event}`,
// 								// 	`{statement|Created Date: ${moment(date).format("DD-MM-YYYY")}}`
// 								// ].join('');
// 								return <div style="width:auto; white-space:pre-wrap;">hello world</div>
// 							},
// 							// rich: {
// 							// 	emoji: {
// 							// 		height: 30,
// 							// 		fontSize: 14,
// 							// 		verticalAlign: 'top'
// 							// 	},
// 							// 	statement: {
// 							// 		height: 15,
// 							// 		fontSize: 9,
// 							// 		//confine: true,
// 							// 		//overflow: 'breakAll',
// 							// 		//extraCssText: 'width:auto; white-space:pre-wrap;',
// 							// 		verticalAlign: 'bottom',
// 							// 		color: '#000',
// 							// 		lineHeight: 25,
// 							// 		backgroundColor: '#fff',
// 							// 		borderColor: '#4c5a816b',
// 							// 		borderWidth: 1,
// 							// 		borderRadius: 5,
// 							// 		padding: 5
// 							// 	}
// 							// }
// 						},
						data: customerEmotions
					}]
				}}
			/>
		</div>
	)
})
export default CustomerJourney;




