import HorizontalBarChart from "../components/HorizontalBarChart"

const AbandendCount = (props) => {

    const {headerName} = props.data

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
                                <div className="card-body text-center abt-chat">
                                    <div className="row">
                                        <div className="col-8">
                                            <h5 className="header-title mb-2 text-center pt-3">Total Abandoned Tickets</h5>
                                        </div>
                                        <div className="col-4">
                                            <div className="form-group">
                                                <label htmlFor="catalog" className="col-form-label">Select Week</label>
                                                <select id="catalog" className="form-control">
                                                    <option>Select All</option>
                                                    <option>Week 1</option>
                                                    <option>Week 2</option>
                                                    <option>Week 4</option>
                                                    <option>Week 4</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 text-center pt-2">
                                        <h2 className="text-center card-value">3,567</h2>
                                        {/* <embed type="text/html" src="assets/chart/abandaned2.html" width="100%"
                                            height="320"> */}
                                            <HorizontalBarChart
                                            data ={{
                                                yAxisData:{
                                                    type: 'category',	
                                                    data: ['Live Chat', 'Social Media']
                                                  },
                                                seriesData:[
                                                    {
                                                      name: 'Abadaned Ticket',
                                                      type: 'bar',
                                                      
                                                      data: [2500, 1067]
                                                    },
                                                    
                                                  ],
                                                  tooltip:{
                                                    trigger: 'axis',
                                                    axisPointer: {
                                                      type: 'shadow'
                                                    }
                                                  },
                                                  xAxisData:{
                                                    type: 'value',
                                                    boundaryGap: [0, 0.01]
                                                  },
                                                  legend:{ }
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
export default AbandendCount