import React, { useEffect, useContext, useState, useRef } from "react";
import { startOfWeek, addDays, format, subWeeks, addWeeks, isToday, startOfToday } from 'date-fns';
import { properties } from "../../../properties";
import { post, get } from "../../../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../../../AppContext';
import moment from "moment";

const AvailableSlots = (props) => {
    const { auth } = useContext(AppContext)
    const [weekDates, setWeekDates] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [prevSelectedDay, setPrevSelectedDay] = useState(null);
    const [slots, setSlots] = useState([]);
    const [appointmentTypes, setAppointmentTypes] = useState([])
    const [locations, setLocations] = useState([])
    const [countries, setCountries] = useState([]);
    const [interactionData, setInteractionData] = useState({
        appointmentType: "",
        appointmentBranch: ""
    })


    useEffect(() => {
        const weekStart = startOfWeek(startOfToday(), { weekStartsOn: 1 });
        const weekDatesArray = [];
        for (let i = 0; i < 5; i++) {
            weekDatesArray.push(addDays(weekStart, i));
        }
        setWeekDates(weekDatesArray);
    }, []);

    function handleClick(date) {
        console.log('date----->', date)
        setPrevSelectedDay(selectedDay);
        setSelectedDay(date);
        fetchData(date)
    }

    useEffect(() => {
        fetchData(selectedDay ? selectedDay : new Date());
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=APPOINT_TYPE,LOCATION,COUNTRY').then((resp) => {
            if (resp.data) {
                setAppointmentTypes(resp.data.APPOINT_TYPE || [])
                setLocations(resp.data.LOCATION)
                setCountries(resp.data.COUNTRY)
            }
            else {
                toast.error("Error while fetching lookup details")
            }
        }).catch((error) => {
            console.log(error)
        })
            .finally()
    }, [interactionData]);

    const fetchData = (dateData) => {
        console.log('date---xxx------>', dateData)
        const selectedDate = moment(dateData).format('YYYY-MM-DD');
        console.log('selectedDate------>', selectedDate)

        if (interactionData?.appointmentType === "") {
            // toast.error("Please select appointment type!")
            return;
        }

        const payloadData = {
            "mode": interactionData?.appointmentType,
            "date": selectedDate,
            "location": auth?.user?.loc
        }
        console.log('payloadData--->', payloadData)
        post(properties.APPOINTMENT_API + `/get-slots`, payloadData).then((resp) => {
            if (resp.data) {
                console.log('resp.data  ', resp.data)
                unstable_batchedUpdates(() => {
                    setSlots(resp.data.filter(f=> f.user_id === auth?.user.userId))
                })
            }
        }).catch((error) => {
            console.log(error)
        })
    };

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const id = target.id;
        setInteractionData({ ...interactionData, [id]: value });
    };

    return (
        <div className="cmmn-skeleton">
            {weekDates && weekDates.length > 0 && <div className="skel-wk-cal">
                <div className="skel-dashboard-title-base">
                    <span className="skel-header-title">
                        {format(weekDates[0], "MMMM yyyy")}
                    </span>
                    <div className="skel-dashboards-icons">
                        <button
                            onClick={() =>
                                setWeekDates((prevDates) =>
                                    prevDates.map((date) => subWeeks(date, 1))
                                )
                            }
                        >
                            <i className="material-icons">chevron_left</i>
                        </button>
                        <button
                            onClick={() =>
                                setWeekDates((prevDates) =>
                                    prevDates.map((date) => addWeeks(date, 1))
                                )
                            }
                        >
                            <i className="material-icons">chevron_right</i>
                        </button>
                    </div>
                </div>
                <ul className="skel-week-view">
                    {weekDates.map((date, index) => (
                        <li key={index}>
                            {/* {console.log('selectedDay date ',selectedDay)} */}
                            <div
                                className={
                                    isToday(date) && !selectedDay
                                        ? "skel-day-date skel-day-date-active"
                                        : selectedDay &&
                                            date.getTime() === selectedDay.getTime()
                                            ? "skel-day-date skel-day-date-active"
                                            : "skel-day-date"
                                }
                                
                                onClick={() => handleClick(new Date(date))}
                            >
                                <span>{format(date, "EEE")}</span>
                                {format(date, "d")}
                            </div>
                        </li>
                    ))}
                </ul>
                <hr className="cmmn-hline" />
                <div className="skel-avl-slots mt-2">
                    <div className="form-group">
                        <label htmlFor="appointmentType" className="control-label">Appointment Type <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                        <select value={interactionData.appointmentType} id="appointmentType" className={`form-control`} onChange={handleInputChange}>
                            <option key="appointmentType" value="">Select Appointment Type</option>
                            {
                                appointmentTypes && appointmentTypes.map((e) => (
                                    <option key={e.code} value={e.code}>{e.description}</option>
                                ))
                            }
                        </select>
                    </div>

                    <p>Available Slots</p>
                    <ul className="mon-slots">
                        {
                            slots && slots.length > 0 ? slots.map((ele) => {
                                return <li className={ele?.flag === 'Y' ? "skel-slots-avl" : "skel-slots-bkd"}>{ele?.appoint_start_time} - {ele?.appoint_end_time}</li>
                            })
                                : <>No slots available</>
                        }
                    </ul>
                </div>
            </div>}
        </div>
    )
}

export default AvailableSlots;


