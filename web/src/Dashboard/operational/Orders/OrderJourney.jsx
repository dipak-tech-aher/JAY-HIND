import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';

const OrderJourney = ((props) => {
	const [dataPoints, setDataPoints] = useState([]);

	const groupBy = (items, key) => items.reduce(
		(result, item) => ({
			...result,
			[item[key]]: [
				...(result[item[key]] || []),
				item,
			],
		}),
		{},
	)

	useEffect(() => {
		const { data } = props;
		if (data?.details && data?.flow && data?.source && data?.flow.length > 0) {
			setDataPoints(data?.flow)

			console.log('data?.flow  ', data?.flow)
		}
	}, [props])
	
	return (
		<div id="explanation-table">
			<ReactEcharts style={{ height: "600px" , width: "100%"}}
				className='react-echarts'
				option={{
					tooltip: {
						trigger: 'item',
						triggerOn: 'mousemove',
						formatter: function ({ data }) {
							const { name, actionBy } = data
							return [(name || '') + '-' + (actionBy || '')].join('')
						}
					},
					title: {
						show: !dataPoints,
						textStyle: {
							color: "#707070",
							fontSize: 16
						},
						text: "No order flow found",
						left: "center",
						top: "center"
					},
					series: [
						{
							type: 'tree',
							orient: 'vertical',
							data: dataPoints,
							top: '7%',
							left: 'center',
							bottom: '7%',
							right: 'auto',
							symbolSize: 7,
							label: {
								position: 'right',
								verticalAlign: 'right',
								align: 'right',
								formatter: function ({ data }) {
									const { status, role, entity } = data
								
									const bold1 = 'Entity'
									const bold2 = 'Role'
									const bold3 = 'Status'
									const formattedName = 
										[`{bold|${bold1}: } ${entity && entity.length >10 ? entity.substr(0, 25)+"..." : entity}\n`,
										`{bold|	${bold2}: } ${role && role.length >10 ? role.substr(0, 25)+"..."  : role}\n`,
										`{bold|	${bold3}: } ${status && status.length >10 ? status.substr(0, 25)+"..."  : status}\n`]

									return formattedName
								},
								fontSize: 10,
								overflow: 'break',
								padding: [8, 10],
								rich: {
									bold: {
										fontWeight: "bold",
									}
								},
							},
							leaves: {
								label: {
									position: 'right',
									verticalAlign: 'middle',
									align: 'center',
									overflow: 'break',
									padding: [8, 10],
								}
							},
							// emphasis: {
							// 	focus: 'descendant'
							// },
							expandAndCollapse: false,
							animationDuration: 550,
							animationDurationUpdate: 750
						}
					]
				}}
			/>
		</div>
	)
})
export default OrderJourney;




