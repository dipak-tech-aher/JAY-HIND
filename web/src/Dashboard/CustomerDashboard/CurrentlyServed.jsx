import React from "react"
import PieChart from "../components/PieChart"
const CurrentlyServed = (props) => {

    const { headerName } = props.data

    return (
        <>
            <div className="col-lg-12">
                <div>
                    <div className="card-body">
                        <div className="modal-header">
                            <h5>{headerName}</h5>
                        </div>
                    </div>
                    <div className="modal-body">
                        <div className="col-12 text-center pt-2">
                            {/* <embed type="text/html" src="assets/chart/pie-doughnut.html" width="100%" height="320">	 */}
                            <PieChart
                            data={{
                                legend:{
                                    orient: 'horizontal',
                                    data: ['Email', 'Live Chat', 'Social Media']
                                },
                                seriesData: [
                                    {
                                        name: 'Points',
                                        type: 'pie',
                                        radius: ['50%', '70%'],
                                        avoidLabelOverlap: false,
                                        label: {
                                            show: false,
                                            position: 'center'
                                        },
                                        emphasis: {
                                            label: {
                                                show: true,
                                                fontSize: '30',
                                                fontWeight: 'bold'
                                            }
                                        },
                                        labelLine: {
                                            show: true
                                        },
                                        data: [
                                            {value: 15, name: 'Email'},
                                            {value: 8, name: 'Live Chat'},
                                            {value: 11, name: 'Social Media'},
                                           
                                        ]
                                    }
                                ]
                            }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}
export default CurrentlyServed