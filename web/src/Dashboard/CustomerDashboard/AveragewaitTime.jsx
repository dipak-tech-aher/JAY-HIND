import React from "react"
import VerticalBarChart from "../components/VerticalBarChart"

const AveragewaitTime = (props) => {
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
                        <div className="row d-flex justify-content-center">
                            <div className="col-9">
                                <div className="card autoheight wow fadeInUp">
                                    <div className="card-body text-center">
                                        <div className="col-12 text-center pt-2 px-2">
                                            <VerticalBarChart
                                                data={{
                                                    height: "340px",
                                                    xAxisData: [
                                                        {
                                                            type: 'category',
                                                            data: ['Email', 'Live Chat', 'Social Media']
                                                        }
                                                    ],
                                                    yAxisData: [
                                                        {
                                                            type: 'value'
                                                        }
                                                    ],
                                                    seriesData: [
                                                        {
                                                            name: 'Average Wait Time',
                                                            type: 'bar',
                                                            barWidth: 30,
                                                            emphasis: {
                                                                focus: 'series'
                                                            },
                                                            data: [10, 15, 15, 20, 25]
                                                        },
                                                        {
                                                            name: 'Longest Wait Time',
                                                            type: 'bar',
                                                            barWidth: 30,
                                                            emphasis: {
                                                                focus: 'series'
                                                            },
                                                            data: [5, 20, 10, 10, 25]
                                                        }
                                                    ],
                                                    toolbox: {}
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
export default AveragewaitTime