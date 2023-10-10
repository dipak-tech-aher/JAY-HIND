import React, { useEffect, useContext, useState, useRef } from "react";
import l1 from "../../../assets/images/l1.png"
import l2 from "../../../assets/images/l2.png"
import l3 from "../../../assets/images/l3.png"
import l4 from "../../../assets/images/l4.png"
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';

const UpcomingReminder = (props) => {
    const { searchParams } = props.data
    const [reminders, setReminders] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);

    useEffect(() => {
        fetchData();
    }, [isRefresh]);

    const fetchData = () => {

        post(properties.APPOINTMENT_API + `/get-appoinments-reminder`, { date: new Date(), searchParams }).then((resp) => {
            if (resp) {
                unstable_batchedUpdates(() => {
                    setReminders(resp);
                })
            }
        }).catch((error) => {
            console.log(error)
        })
    };

    const getTime = (time) => {
        const t = time.split(':')
        let targetTime = new Date();
        targetTime.setHours(t[0]);
        targetTime.setMinutes(t[1]);
        targetTime.setSeconds(t[2]);
        const currentTime = new Date();
        const diffInMilliseconds = targetTime - currentTime
        const diffInSeconds = Math.floor(diffInMilliseconds / 1000)
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes} mins`
    }


    return (
        <div className="cmmn-skeleton mb-3">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Todays Appointment
                    ({reminders?.data?.length || 0})</span>
                <div className="skel-dashboards-icons">
                    <a ><i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i></a>
                </div>
            </div>
            {reminders?.data && reminders?.data?.length > 0 ? reminders?.data?.map((ele) => {
                return <div className="skel-up-appt-remd">
                    <div className="skel-app-remd-info">
                        <span><b>{ele?.first_name + ' ' + ele?.last_name}</b></span><br />
                        <span className="skel-type-source">{ele?.tran_category_no?.includes('_') ? ele?.tran_category_no?.split('_')[0] : ele?.tran_category_no}</span>
                    </div>
                    <p className="skel-time"><i className="material-icons">schedule</i>
                        {
                            getTime(ele?.appoint_start_time)
                        }
                    </p>
                    <div className="skel-avl-slots">
                        <ul className="mon-slots">
                            <li className="skel-slots-avl">{ele?.appoint_start_time} - {ele?.appoint_end_time}</li>
                        </ul>
                    </div>
                </div>
            })
                : <>{reminders?.message}</>}
        </div>
    )
}

export default UpcomingReminder;


