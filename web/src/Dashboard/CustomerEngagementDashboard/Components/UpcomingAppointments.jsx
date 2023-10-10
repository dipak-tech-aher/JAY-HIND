
import React from "react";
import moment from "moment";

const UpcomingAppointments = (props) => {
    const { upcomingAppointments } = props?.data

    return (
        <div className="mb-1">
            <div className="cmmn-skeleton">
                <span className="skel-header-title">Upcoming Appointments</span>
                <div className="skel-appts-sect">
                    {upcomingAppointments?.length > 0 && upcomingAppointments?.map((ele) => {
                        return (<div className="skel-up-appt">

                            {moment(ele?.appointDate).format('MMMM D, YYYY').split(',')[0]}
                            <span>
                                {moment(ele?.appointDate).format('MMMM D, YYYY').split(',')[1]}
                            </span>
                        </div>)
                    })}

                </div>
            </div>
        </div>
    )
}

export default UpcomingAppointments;