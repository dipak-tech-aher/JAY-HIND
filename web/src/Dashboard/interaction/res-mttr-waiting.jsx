import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { post } from "../../common/util/restUtil";
import { properties } from '../../properties';
import ResolutionTimeImg from "../../assets/images/res-time.svg";
import MttrImg from "../../assets/images/mttr.svg";
import WaitingTimeImg from "../../assets/images/w-time.svg";

const ResMttrWaiting = (props) => {
    const { searchParams,isParentRefresh } = props?.data;
    const [isRefresh, setIsRefresh] = useState(false);
    const [resolutionData, setResolutionData] = useState([]);
    const [mttrData, setMttrData] = useState([]);
    const [waitingData, setWaitingData] = useState([]);

    useEffect(() => {
        post(properties.INTERACTION_API + "/res-mttr-waiting", { searchParams }).then((resp) => {
            if (resp?.status == 200) {
                setResolutionData(resp?.data?.rows?.avgResolutionTimeData ?? [])
                setMttrData(resp?.data?.rows?.mttrData ?? [])
                setWaitingData(resp?.data?.rows?.avgWaitingData ?? [])
            }
        }).catch((error) => console.log(error));
    }, [isRefresh, searchParams,isParentRefresh])
    return (
        <div className="cmmn-skeleton mt-2">
            <div className="skel-avg-sect-int">
                <div className="skel-avg-sect-active-info">
                    <div className="skel-customer-active-info-lft">
                        <img src={ResolutionTimeImg} className="img-fluid int-kpi-icons" />
                        <span className="skel-sm-heading"> Avg. Resolution Time </span>
                        <span className="skel-fnt-md-bold">
                            <span className="timer skel-fnt-md-bold" data-to={5} data-speed={4000}> {resolutionData?.length ? (resolutionData[0]?.oAvgResolutionTimeInterval).replace(/:/g, '') : ''} </span>
                        </span>
                        <span className="skel-small-info"> per last month </span>
                    </div>
                </div>
                {/* <div className="skel-avg-sect-active-info">
                    <div className="skel-customer-active-info-lft">
                        <img src={MttrImg} className="img-fluid int-kpi-icons" />
                        <span className="skel-sm-heading"> Avg. MTTR </span>
                        <span className="skel-fnt-md-bold">
                            <span className="timer skel-fnt-md-bold" data-to={3} data-speed={4000}> {mttrData?.length ? (mttrData[0]?.oMttr).replace(/:/g, '') : ''} </span>
                        </span>
                        <span className="skel-small-info"> per last month </span>
                    </div>
                </div> */}
                <div className="skel-avg-sect-active-info">
                    <div className="skel-customer-active-info-lft">
                        <img src={WaitingTimeImg} className="img-fluid int-kpi-icons" />
                        <span className="skel-sm-heading"> Avg. Wait Time </span>
                        <span className="skel-fnt-md-bold">
                            <span className="timer skel-fnt-md-bold" data-to={2} data-speed={4000}> {waitingData?.length ? (waitingData[0]?.oAvgChatQueueWaitTimeInterval).replace(/:/g, '') : ''} </span>
                        </span>
                        <span className="skel-small-info"> per last month </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResMttrWaiting;