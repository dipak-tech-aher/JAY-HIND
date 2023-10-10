import React from "react";
import VerticalBarChart from "../components/VerticalBarChart";

const TicketCount = (props) => {

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
                        <div className="col-4">
                            <div className="form-group">
                                <label htmlFor="catalog" className="col-form-label">Select Parameter</label>
                                <select id="catalog" className="form-control">
                                    <option value="DEPARTMENT">Department</option>
                                    <option value="PROBLEMCODE">Problem Code</option>
                                    <option value="AGENT">Agent</option>
                                    <option value="SLA">SLA</option>
                                    <option value="LOCATION">Location</option>
                                    <option value="CHANNEL">Channel</option>
                                </select>
                            </div>
                        </div>
                        <br />
                        <div className="row d-flex justify-content-center">
                            <div className="col-9">
                                <div className="card autoheight wow fadeInUp">
                                    <div className="card-body text-center">

                                        <h5 className="header-title mb-2 text-center">Department</h5>

                                        <div className="col-12 text-center pt-2">
                                            <h2 className="text-center card-value">254</h2>
                                            <VerticalBarChart
                                            data={{
                                                height:"340px",
                                                xAxisData: [
                                                    {
                                                      type: 'category',
                                                      data: ['Department1', 'Department2', 'Department3', 'Department4', 'Department5']
                                                    }
                                                  ],
                                                yAxisData:[
                                                    {
                                                      type: 'value'
                                                    }                                                                                  
                                                  ],
                                                seriesData: [
                                                    {
                                                      name: 'Revenue',
                                                      type: 'bar',
                                                      label: {
                                                        show: true
                                                      },
                                                      data: [
                                                        70, 50, 40, 44, 50
                                                      ]
                                                    }
                                                  ],
                                                toolbox: { show: false,
                                                    feature: {
                                                      dataView: { show: true, readOnly: false },
                                                      magicType: { show: true, type: ['line', 'bar'] },
                                                      restore: { show: true },
                                                      saveAsImage: { show: true }
                                                    } }

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
export default TicketCount;