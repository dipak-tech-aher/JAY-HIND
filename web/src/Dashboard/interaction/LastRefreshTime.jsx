import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment';
import { InteractionDashboardContext } from "../../AppContext";

const LastRefreshTime = (props) => {
    const [lastUpdatedAt, setLastUpdatedAt] = useState(moment());
    const { data, handlers } = useContext(InteractionDashboardContext);
    const { lastDataRefreshTime } = data;
    const { setLastDataRefreshTime } = handlers;

    useEffect(() => {
        setLastDataRefreshTime({ ...lastDataRefreshTime, [props?.data?.componentName]: moment().format('DD-MM-YYYY HH:mm:ss') })
        setLastUpdatedAt(moment(lastDataRefreshTime[props?.data?.componentName], "DD-MM-YYYY HH:mm:ss"))
    }, [props?.data?.componentName, props?.data?.isRefresh])


    useEffect(() => {
        const interval = setInterval(() => setLastUpdatedAt(moment(lastDataRefreshTime[props?.data?.componentName], "DD-MM-YYYY HH:mm:ss")), 60 * 1000);
        return () => clearInterval(interval);
    }, [lastDataRefreshTime]);

    return (<span>
        <i className="material-icons">refresh</i>Updated {moment(lastUpdatedAt).fromNow()}
    </span>)
};

export default LastRefreshTime;