import React, { useEffect, useContext, useState, useRef } from "react";
import img from '../../../assets/images/appt-img.png'
import { AppContext } from "../../../AppContext";
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";

const Greeting = (props) => {
    const { auth } = useContext(AppContext);
    const [successPercentage, setSuccessPercentage] = useState(0)
    const date = new Date();
    const hours = date.getHours();

    useEffect(() => {
        post(properties.APPOINTMENT_API + `/agent-success-percentage`, { date: new Date() }).then((percentageResp) => {
            if (percentageResp.status === 200) {
                setSuccessPercentage(percentageResp?.data)
            }
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    let greeting;

    if (hours < 12) {
        greeting = 'Good morning';
    } else if (hours < 18) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }

    return (

        <div className="skel-dashboard-wel-info">
            <div className="skel-wel-lft-info">
                <p className="skel-dashboard-info-msg"><span>Manage all your</span>Appointments in single view</p>
                <hr className="cmmn-hline" />
                <p className="skel-wel-title">Welcome {auth?.user?.firstName + ' ' + auth?.user?.lastName}!<br /> {greeting}</p>
                {successPercentage && <p className="skel-feedback"><span className="skel-per-info">{successPercentage}%</span> Liked
                    your support in solving their Queries/Issues.</p>}
            </div>
            <div className="skel-wel-rht-info">
                <img src={img} alt="" className="img-fluid" />
            </div>
        </div>

    )
}

export default Greeting;


