import React, { useEffect, useContext, useState, useRef } from "react";
import Greeting from "../interactive/Greeting";
import Counts from "../interactive/Counts";
import Calender from "../interactive/Calender";
import Upcoming from "../interactive/Upcoming";
import ClosedHistory from "../interactive/ClosedHistory";
import UpcomingReminder from "../interactive/UpcomingReminder";
import AvailableSlots from "../interactive/Slots";

const InteractiveDashboard = (props) => {

    const { selectedInteraction,
        statusReason,
        selectedEntityType,
        selectedOrder,
        selectedCustomer,
        isReScheduleOpen,
        interactionData,
        isUpcomingRefresh,
        isCalenderRefresh,
        cancelCount,
        completedCount,
        upcomming,
        totalCount,
        successFullCount,
        unSuccessFullCount,
        isOpen,
        searchParams } = props.data;

    const {
        setSelectedInteraction,
        setSelectedEntityType,
        setSelectedOrder,
        setSelectedCustomer,
        setIsReScheduleOpen,
        setInteractionData,
        setIsUpcomingRefresh,
        setIsCalenderRefresh,
        setCancelCount,
        setCompletedCount,
        setUpcomming,
        setTotalCount,
        setSuccessFullCount,
        setUnSuccessFullCount,
        setIsOpen
    } = props.handlers

    return (
        <>
            <div className="skel-self-data">
                <div className="row mt-3">
                    <Calender data={{
                        isCalenderRefresh,
                        searchParams
                    }} handlers={{ setIsCalenderRefresh }} />
                    <div className="col-md-4">
                        <UpcomingReminder data={{ searchParams }} />
                        <AvailableSlots data={{ searchParams }} />
                    </div>
                </div>
            </div>            
            <div className="">
                    <Upcoming
                        data={{ selectedCustomer, isUpcomingRefresh, statusReason, searchParams }}
                        handlers={{
                            setSelectedInteraction,
                            setSelectedCustomer,
                            setSelectedOrder,
                            setSelectedEntityType,
                            setIsUpcomingRefresh
                        }} />
                </div>
            <div className="">
                <ClosedHistory
                    data={{ searchParams }}
                    handlers={{
                        setSelectedInteraction,
                        setSelectedOrder,
                        setSelectedEntityType
                    }} />
            </div>
        </>
    )
}

export default InteractiveDashboard;


