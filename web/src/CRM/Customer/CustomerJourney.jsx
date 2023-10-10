import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import moment from 'moment'


const CustomerJourney = ((props) => {
	const { height } = props?.data
	const [dataPoints, setDataPoints] = useState([]);
	const [customerEmotions, setCustomerEmotions] = useState([]);
	const [markPointData, setMarkPointData] = useState([]);

	// function getRandomInt(max) {
	// 	return Math.floor(Math.random() * max);
	// }

	useEffect(() => {
		let { customerEmotions } = props?.data;
		customerEmotions?.sort((a, b) => {
			return new Date(a.date) - new Date(b.date);
		});
		customerEmotions = customerEmotions.slice(-5)
		
		setDataPoints([...customerEmotions]);
	}, [props])

	useEffect(() => {
		const reader = new FileReader();
		let tempArray = [];
		dataPoints.map(({ percentage, ...res }) => {
			tempArray.push({
				//value: parseInt(getRandomInt(5)), ...res
				 value: parseInt(percentage), ...res
			})
		});
		setCustomerEmotions([...tempArray])
		const markPoint = []
		
		tempArray.map((e, idx) => {
			const obj = {
				name: 'one data',
				label: true,
				coord: [idx, e.value],
				symbol: 'image://data:image/jpeg;base64,'+e.emotionURI,
				symbolSize: 20,
				symbolRotate: 0,
			}
			markPoint.push(obj)
		})

		setMarkPointData(markPoint)
	}, [dataPoints])

	return (
		<div id="explanation-table">
			<ReactEcharts style={{ height: height || '100vh' }}
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
							max: 8
						}
					],
					grid: { bottom: 0, top: 40 },
					series: [{
						type: 'line',
						smooth: true,
						
						labelLayout: { hideOverlap: true },
						markLine: {
                        silent: true,
                        lineStyle: {
                        type:'solid'
                        }
                        },
						markPoint: {
							data: markPointData
						},
						label: {
							show: true,
							width: 180,
							overflow: 'break',
							position: 'top',
							align: 'center',
							distance: 10,
							// height: 100,
							lineHeight: 20,
							backgroundColor: '#fff',
							borderColor: '#4c5a816b',
							borderWidth: 1,
							borderRadius: 5,						
							formatter: function ({ data }) {
								let { emotion, statement, event, separator, date, id, status } = data;
								let statements = (statement.split(separator).join(''))?.trim();
								//statements = 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly';
								return `{emoji| ${emotion} }\n {statement| ${statements && statements != '' ? statements : event} \n ${id} \n ${status} \n ${date}}`
								
							//	return emotion+'\n'+statement
							},
							rich: {
								emoji: {
									height: 20,
									fontSize: 25,	
									lineHeight: 20,
									// verticalAlign: 'top'
								},
								statement: {
									height: 15,
									fontSize: 12,									
									verticalAlign: 'bottom',
									color: '#000',
									lineHeight: 20,
									padding: 5,
									align: 'left',								
									// backgroundColor: '#fff',
									// borderColor: '#4c5a816b',
									// borderWidth: 1,
									// borderRadius: 5,
									// padding: 5
								}
							}
						},
						data: customerEmotions
					}]
				}}
			/>
		</div>
	)
})
export default CustomerJourney;




