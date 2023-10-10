import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';

const InteractionJourney = ((props) => {
	const [dataPoints, setDataPoints] = useState(false);

	const groupBy = (items, key) => items.reduce(
		(result, item) => ({
			...result,
			[item[key]]: [
				...(result[item[key]] || []),
				item,
			],
		}),
		{},
	);

	useEffect(() => {
		const { data } = props;
		if (data.details && data.flow && data.flow.length > 0) {
			let dataObj = {
				name: `Interaction Created`,
				children: []
			}
			let groupedFlows = groupBy(data.flow, 'flowSeq');
			for (const [key, value] of Object.entries(groupedFlows)) {
				let tempChild = {
					name: "", children: []
				};
				value.forEach(x => {
					if (x.to !== "") {
						tempChild.name = x.to;
					} else {
						x.subSeq.forEach(seq => {
							tempChild.children.push({
								name: seq.unitDesc
							})
						})
					}
				})
				dataObj.children.push(tempChild);
			}
			setDataPoints([dataObj]);
		} else {
			setDataPoints(false);
		}
	}, [props])

	return (
		<div id="explanation-table">
			<ReactEcharts style={{ height: "200%" }}
				option={{
					tooltip: {
						trigger: 'item',
						triggerOn: 'mousemove'
					},
					title: {
						show: !dataPoints,
						textStyle: {
							color: "#707070",
							fontSize: 16
						},
						text: "No Interaction flow found",
						left: "center",
						top: "center"
					},
					series: [
						{
							type: 'tree',
							name: '',
							data: dataPoints,
							symbolSize: 10,
							roam: true,
							label: {
								position: 'top',
								verticalAlign: 'middle',
								align: 'center'
							},
							leaves: {
								label: {
									position: 'right',
									verticalAlign: 'middle',
									align: 'left'
								}
							},
							emphasis: {
								focus: 'descendant'
							},
							expandAndCollapse: true,
							animationDuration: 550,
							animationDurationUpdate: 750
						}
					]
				}}
			/>
		</div>
	)
})
export default InteractionJourney;




