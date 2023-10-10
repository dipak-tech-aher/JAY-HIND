import React, { useEffect, useContext, useState, useRef } from "react";
import BasedOnGroupAppoinment from "./BasedOnGroupAppoinment";
import AppoinmentPerformance from "./AppoinmentPerformance";
import CustomerSatisfaction from "./CustomerSatisfaction";
import History from "./History";
import MapChart from "./MapChart";
import GmapChart from "./GmapChart";
import EChartsComponent from "./EChartsComponent";
import ByType from "./ByType";

const InformativeDashboard = (props) => {

    const { cancelCount, completedCount, upcomming, totalCount, successFullCount, unSuccessFullCount,searchParams } = props.data

    return (
        <>
            <div className="skel-informative-data">
                <div className="">
                    <AppoinmentPerformance data={{searchParams}}/>
                    {/* <BasedOnGroupAppoinment data={{ cancelCount, completedCount, upcomming, totalCount, successFullCount, unSuccessFullCount,searchParams }} /> */}
                </div>
                <div className="skel-op-dashboard-rht-base mt-3">
                    <ByType data={{searchParams}} />
                    <GmapChart
                        containerElement={<div style={{ height: '400px', width: '100%' }} />}
                        mapElement={<div style={{ height: '100%' }} />}
                    />
                </div>
            </div>
        </>
    )
}

export default InformativeDashboard;


