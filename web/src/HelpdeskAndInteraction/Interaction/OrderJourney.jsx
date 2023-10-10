import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import moment from 'moment';

const OrderJourney = ((props) => {
	const [dataPoints, setDataPoints] = useState([]);
	const { provision } = props
	// if(provision){
	// 	provisioningType = provision
	// }


	const { type = 'small' } = props

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

	// useEffect(() => {
	// 	const { data } = props;

	// 	let flows = [
	// 		{
	// 			"flowSeq": 0,
	// 			"orderflow": "Order Created",
	// 			"from": "Comquest",
	// 			"to": "Comquest",
	// 			"subSeq": [],
	// 			"status": "In progress",
	// 			"actionBy": "Admin ",
	// 			"flowDate": "2023-03-29T23:24:57.948Z",
	// 			"isActionDone": true
	// 		},
	// 		{
	// 			"flowSeq": 1,
	// 			"orderflow": "",
	// 			"from": "Comquest",
	// 			"to": "",
	// 			"subSeq": [
	// 				{
	// 					"unitId": "DEPT.OU.ORG",
	// 					"unitName": "DEPT",
	// 					"unitDesc": "Admin Dept"
	// 				}
	// 			],
	// 			"status": "ASSIGNED",
	// 			"actionBy": "",
	// 			"flowDate": "2023-04-05T09:15:00.418Z",
	// 			"isActionDone": false
	// 		},
	// 		{
	// 			"flowSeq": 1,
	// 			"orderflow": "",
	// 			"from": "Comquest",
	// 			"to": "",
	// 			"subSeq": [
	// 				{
	// 					"unitId": "DEPT.OU.ORG",
	// 					"unitName": "DEPT",
	// 					"unitDesc": "Admin Dept"
	// 				},
	// 				{
	// 					"unitId": "COMQUEST.IMG-OU.IMAGINE",
	// 					"unitName": "DPT0001",
	// 					"unitDesc": "Comquest"
	// 				}
	// 			],
	// 			"status": "CLOSED",
	// 			"actionBy": "",
	// 			"flowDate": "2023-04-05T09:15:00.418Z",
	// 			"isActionDone": false
	// 		},
	// 		{
	// 			"flowSeq": 1,
	// 			"orderflow": "",
	// 			"from": "Comquest",
	// 			"to": "",
	// 			"subSeq": [
	// 				{
	// 					"unitId": "COMQUEST.IMG-OU.IMAGINE",
	// 					"unitName": "DPT0001",
	// 					"unitDesc": "Comquest"
	// 				}
	// 			],
	// 			"status": "CANCELLED",
	// 			"actionBy": "",
	// 			"flowDate": "2023-04-05T09:15:00.418Z",
	// 			"isActionDone": false
	// 		}
	// 	]

	// 	if (data?.details && data?.flow && data?.source && data?.flow.length > 0) {
	// 		let dataObj = {
	// 			name : data?.source ==='INTERACTION' ? 'Interaction Created' : 'Order Created',
	// 			status: data?.source ==='INTERACTION' ? 'Interaction Created' : 'Order Created',
	// 			children: []
	// 		}
	// 		let groupedFlows = groupBy(data.flow, 'flowSeq');

	// 		for (const [key, value] of Object.entries(groupedFlows)) {
	// 			let tempChild = {
	// 				name: "", children: []
	// 			};
	// 			value.forEach(x => {
	// 				if (x.to !== "") {
	// 					tempChild.to = x.to;
	// 					tempChild.status= x.status
	// 					tempChild.lineStyle.color = x.isActionDone === 'DONE' ? "rgba(33, 181, 65)" : "rgba(182, 242, 218)"

	// 				} else {
	// 					x.subSeq.forEach(seq => {
	// 						tempChild.children.push({
	// 							name: data?.source ==='INTERACTION' ? x.interactionflow : x.orderflow,
	// 							to: seq.unitDesc,
	// 							status: x.status,
	// 							lineStyle:{
	// 								color:  x.isActionDone === 'DONE' ? "rgba(33, 181, 65)": "rgba(182, 242, 218)"
	// 							}
	// 						})
	// 					})
	// 				}
	// 			})
	// 			dataObj.children.push(tempChild);
	// 		}

	// 		setDataPoints([dataObj]);
	// 	} else {
	// 		setDataPoints(false);
	// 	}
	// }, [props])

	const [height, setHeight]= useState()
	const [width, setWidth]= useState()
	useEffect(() => {
		const { data, height="600%", width="100%" } = props;
		// console.log('data in props===>', data)
		if (data?.details && data?.flow && data?.source && data?.flow.length > 0) {
			setDataPoints(data?.flow)
		}
		setWidth(width)
		setHeight(height)
	}, [props])
	
	const onChartClick = (params) => {
		console.log('Chart clicked', params);
	  };

	const onEvents  = {
		'click':onChartClick
	}

	console.log(height, width)
	return (
		<div id="explanation-table">
			<ReactEcharts style={{ height, width }} 
				option={{
					// tooltip: {
					// 	trigger: 'item',
					// 	triggerOn: 'mousemove',
					// 	formatter: function ({ data }) {
					// 		const { orderflow, actionBy } = data
					// 		return [(orderflow || '') + '-' + (actionBy || '')].join('')
					// 	}
					// },
					maintainAspectRatio: false,
					title: {
						show: !dataPoints,
						textStyle: {
							color: "#707070",
							fontSize: 15
						},
						text: "No order flow found",
						left: "center",
						top: "center"
					},
					series: [
						{
							type: 'tree',
							data: dataPoints,
							top: '0%',
							left: '5%',
							bottom: '0%',
							right: '20%',
							// symbolSize: 1,
							label: {
							//	show : type === 'small' ?  false : true,
								position: 'outside',
								fontSize: 11,
								align: 'left',
								formatter: function ({ data }) {
									// console.log('data==>', data)
									const { status, role, entity, flowDate, provisioning } = data
									const flwDate = flowDate ? moment(flowDate).format('DD-MM-YY') : 'Yet to start'
									//const tasksName = [], provisioning = new Set()
									//let count = 1
									// tasks && tasks.forEach(e => {
									// 		tasksName.push(count + '. ' + e.taskName + '\n')
									// 		count+=1
									// 	})
									// tasks && tasks.forEach(e => {
									// 	provisioning.add(e.taskOptions.provisioning)
									// })
									if(type === 'small'){
										return ['Status: '+ status]
									}
									return ['Dept/Role: '+ (entity+'-'+(role || '')) + '\nStatus: ' + (status ||'') + '\nFlow Created Date: ' + (flwDate||'')+ '\nProvision Type: '+(provisioning|| provision ||'')].join('') /*+'\nTasks:\n' + (tasksName.length > 0 ? tasksName : 'No tasks found')*/
								}
							},
							leaves: {
								label: {
									position: 'outside',
									fontSize: 11,
									align: 'left',
									formatter: function ({ data }) {
										// console.log('data==>', data)
										const { status, role, entity, flowDate, provisioning } = data
										const flwDate = flowDate ? moment(flowDate).format('DD-MM-YY') : 'Yet to start'
										//const tasksName = [], provisioning = new Set()
										//let count=1
										// tasks && tasks.forEach(e => {
										// 	tasksName.push(count + '. ' + e.taskName + '\n')
										// 	count+=1
										// })
										// tasks && tasks.forEach(e => {
										// 	provisioning.add(e.taskOptions.provisioning)
										// })
										if(type === 'small'){
											return ['Status: '+ status]
										}
										return ['Dept/Role: '+ ((entity || '')+'-'+(role|| '')) + '\nStatus: ' + (status|| '') + '\nFlow Created Date: ' + (flwDate|| '')+ '\nProvision Type: '+ (provisioning ? provisioning : provision ? provision : '')].join('')  /*+'\nTasks:\n' + (tasksName.length > 0 ? tasksName : 'No tasks found')*/
									}
								}
							},
							emphasis: {
								focus: 'descendant'
							},
							expandAndCollapse: false,
							animationDuration: 550,
							animationDurationUpdate: 750
						}
					]
				}}
				onEvents={onEvents}
			/>
		</div>
	)
})
export default OrderJourney;




