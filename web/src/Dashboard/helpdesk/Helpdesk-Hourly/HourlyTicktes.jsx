import React, { useEffect, useState, useRef } from 'react';
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import Chart from './Chart';

const HourlyTickets = (props) => {
    const { searchParams, isParentRefresh,modalStyle } = props?.data;
    const [hourlyData, setHourlyData] = useState([])
    const [isRefresh, setIsRefresh] = useState(false);

    useEffect(() => {
        post(properties.HELPDESK_API + '/hourly-tkts', { ...searchParams })
            .then((response) => {
                setHourlyData(response?.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, [isRefresh, searchParams, isParentRefresh])

    return (
        <div className="col-md-4">
            <div className="cmmn-skeleton mh-480">
                <div className="card-body">
                    <div className="skel-dashboard-title-base">
                        <span className="skel-header-title"> Today Tickets (Hourly) </span>
                        <div className="skel-dashboards-icons">
                            <span>
                                <i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i>
                            </span>
                            {/* <span>
                                <i className="material-icons"> filter_alt </i>
                            </span> */}
                        </div>
                    </div>
                    <hr className="cmmn-hline" />
                    <div id="cardCollpase5" className="collapse pt-3 show" dir="ltr">
                        <div className="skel-graph-sect mt-2">
                            <Chart data={{ chartData: hourlyData }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HourlyTickets;