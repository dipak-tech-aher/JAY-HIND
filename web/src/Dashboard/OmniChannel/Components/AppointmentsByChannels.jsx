
import React from "react";
const AppointmentsByChannels = (props) => {
    const { totalAppointment } = props.data;
    const { filterAppointmentsByChannel, setIsAppointmentByChannelPopupOpen,TotalAppointment } = props.handlers;

    return (
        <div className="skel-omni-tot-info-by-chnl skel-top-5-perf-base-sect">
            <div className="skel-top-title-icons">
                <span className="skel-heading mb-1">
                    Total Appointment by Channel
                </span>
                <div className="skel-omni-chnl-icons">
                    <a>
                        <i
                            className="material-icons"
                            onClick={() => TotalAppointment(true)}
                        >
                            refresh
                        </i>
                    </a>

                </div>
            </div>

            <hr className="cmmn-hline" />
            <ul>
                {totalAppointment.map((x) => (
                    <li>
                        <span>{x?.appointment_channel}</span>{" "}
                        <span className={x?.appointment_channel === 'Email' ? "skel-count-chnl  skel-omni-chnl-email"
                            : x?.appointment_channel === 'Whatsapp Live Chat' ? "skel-count-chnl skel-omni-chnl-whtapp"
                            : (x?.appointment_channel === 'Walk In' || x?.appointment_channel.toUpperCase() === 'IVR') ? "skel-count-chnl skel-omni-chnl-walkin"
                                : x?.appointment_channel === 'Instagram' ? "skel-count-chnl skel-omni-chnl-ig"
                                    : x?.appointment_channel === 'Telegram' ? "skel-count-chnl skel-omni-chnl-telg"
                                        : x?.appointment_channel === 'Facebook Live Chat' ? "skel-count-chnl skel-omni-chnl-fb"
                                            : (x?.appointment_channel === 'SelfCare' || x?.appointment_channel === 'Web Selfcare' || x?.appointment_channel === 'Web Application') ? "skel-count-chnl skel-omni-chnl-sc" :
                                                "skel-count-chnl skel-omni-chnl-whtapp"}
                            onClick={e => {
                                filterAppointmentsByChannel(x?.appointment_channel);
                                setIsAppointmentByChannelPopupOpen(true);
                            }}
                        >
                            <>{x?.count}</>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default AppointmentsByChannels;