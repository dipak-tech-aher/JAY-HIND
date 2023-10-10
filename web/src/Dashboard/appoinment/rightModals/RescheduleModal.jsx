import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import moment from 'moment'
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, CloseButton } from 'react-bootstrap';
import { properties } from "../../../properties";
import { post, get } from "../../../common/util/restUtil";
import { toast } from 'react-toastify';

const ReScheduleModal = (props) => {
    let { selectedInteraction, isReScheduleOpen, isUpcomingRefresh, selectedOrder, statusReason } = props.data;
    let { setIsReScheduleOpen, setIsUpcomingRefresh } = props.handlers;

    // console.log('selectedOrder::::--->', selectedOrder)
    // console.log('selectedInteraction::::--->', selectedInteraction)
    selectedInteraction = selectedInteraction && selectedInteraction?.length > 0 && selectedInteraction[0]
    selectedOrder = selectedOrder && selectedOrder?.length > 0 && selectedOrder[0]

    const [isRescheduleModalRefresh, setIsRescheduleModalRefresh] = useState(true);
    const [events, setEvents] = useState([]);
    const [slots, setSlots] = useState([]);
    const calendarRef = useRef();
    const [weekends] = useState(true)
    const [initialView] = useState("dayGridMonth");
    const [isEventsFetched, setIsEventsFetched] = useState(false);
    const [displayedEvents, setDisplayedEvents] = useState([]);
    const [eventLimit, setEventLimit] = useState(3);

    const initialFormData = {
        slot: {},
        statusReason: '',
        appointTxnId: (selectedInteraction?.appoint_txn_id || selectedOrder?.appoint_txn_id)
    }
    const [formData, setFormData] = useState(initialFormData);

    const [errors, setErrors] = useState({});

    // useEffect(() => {
    //     if (isReScheduleOpen) {
    //         calendarRef.current.getApi().render(); // Render the calendar
    //     } else {
    //         calendarRef.current.getApi().destroy(); // Destroy the calendar
    //     }
    // }, [isReScheduleOpen]);

    useEffect(() => {
        post(`${properties.APPOINTMENT_API}/get-appoinment-events`, { date: new Date(), appoinmentTxnId: (selectedInteraction?.appoint_txn_id || selectedOrder?.appoint_txn_id) })
            .then((resp) => {
                if (resp.data && resp.data.length > 0) {
                    setEvents(resp.data);
                    setIsRescheduleModalRefresh(!isRescheduleModalRefresh)
                } else {
                    setEvents([]);
                }
            }).catch(error => console.log(error))
            .finally(() => {
                setIsEventsFetched(true);
            });
    }, [])

    useEffect(() => {
        if (isEventsFetched) {
            const calendarApi = calendarRef.current.getApi();
            if (calendarApi) {
                calendarApi.render(); // Render the calendar
            }
        }
    }, [isEventsFetched]);

    const memoizedEventsFn = useMemo(() => {
        return displayedEvents.map(x => ({
            ...x,
            start: new Date(x.start),
            end: new Date(x.end),
            allDay: true,
            extendedProps: {
                ...x.extendedProps,
            }
        }));
    }, [displayedEvents]);

    useEffect(() => {
        setDisplayedEvents(events);
    }, [events, eventLimit]);

    const handleDateClick = (e) => {
        // console.log('e.dateStr', e.dateStr)
        post(`${properties.APPOINTMENT_API}/available-slot`, { date: e.dateStr, startTime: (selectedInteraction?.appoint_start_time || selectedOrder?.appoint_start_time), endTime: (selectedInteraction?.appoint_end_time || selectedOrder?.appoint_end_time) })
            .then((resp) => {
                if (resp.data && resp.data.length > 0) {
                    setSlots(resp?.data);
                } else {
                    setSlots([]);
                }
            }).catch(error => console.log(error))
            .finally(() => console.log('final'));
    }

    const handleCloseModal = () => {
        setSlots([]);
        // calendarRef.current.getApi().destroy();
        setIsReScheduleOpen(!isReScheduleOpen);
    }

    const handleChange = (e) => {
        // console.log(e)
        if (e?.target) {
            // console.log(e.target.name, e.target.value)
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
        } else {
            setFormData({
                ...formData,
                appointDtlId: e.appoint_dtl_id,
                appointUserId: e.user_id,
            });
        }

        // if (e?.target?.name == 'slot') {
        //     setFormData({
        //         ...formData,
        //         slot: JSON.parse(e.target.value)
        //     });
        // } else {
        //     setFormData({
        //         ...formData,
        //         [e.target.name]: e.target.value,
        //     });
        // }

    };

    const handleSubmitForm = (e) => {
        e.preventDefault();
        // console.log('formData ', formData)
        // Validate form data
        const newErrors = {};
        if (!formData.appointDtlId) {
            newErrors.appointDtlId = 'slot is required';
        }
        if (!formData.statusReason) {
            newErrors.statusReason = 'Status Reason is required';
        }

        // If there are errors, update the state
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            // Submit the form or perform other actions
            // console.log('Form submitted:', formData);
            post(`${properties.APPOINTMENT_API}/re-schedule-appoinment`, formData)
                .then((resp) => {
                    if (resp) {
                        const button = document.getElementById("ReScheduleModal");
                        button.click();
                        toast.success(resp?.message);
                        setIsRescheduleModalRefresh(!isRescheduleModalRefresh)
                        setIsUpcomingRefresh(!isUpcomingRefresh);
                        handleCloseModal();
                    }
                }).catch(error => console.log(error))
                .finally(() => {
                    console.log('final')
                });
        }
    };

    const formatTime = (date) => {
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    return (
        <Modal show={isReScheduleOpen} onHide={handleCloseModal} dialogClassName='cust-xs-modal'>
            <Modal.Header>
                <Modal.Title><span className="messages-page__title">Appointment Re-Schedule Settings</span></Modal.Title>
                <CloseButton onClick={() => handleCloseModal()}><span aria-hidden="true">×</span></CloseButton>
            </Modal.Header>
            <Modal.Body>
                <div className='cmmn-skeleton skel-br-tp-r0'>
                    <div className="">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                            initialView={initialView}
                            dayMaxEventRows={eventLimit}
                            headerToolbar={{
                                start: "prev,next today",
                                center: "title",
                                end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                            }}
                            // initialDate={(selectedInteraction?.appoint_date || selectedOrder?.appoint_date) || moment(new Date()).format('YYYY-MM-DD')}
                            // validRange={{ start: moment(new Date()).format('YYYY-MM-DD') }}
                            // eventClick={handleDateClick}
                            weekends={weekends}
                            events={memoizedEventsFn}
                            eventContent={(eventInfo) => (
                                <>
                                    <div>{formatTime(eventInfo.event.start)} - {formatTime(eventInfo.event.end)}</div>
                                    <div>{eventInfo.event.title !== 'null' ? eventInfo.event.title : ''}</div>

                                </>
                            )}
                        // remove 'isRendering' prop since it's not a valid FullCalendar prop
                        />

                        <hr className="cmmn-hline mt-2" />
                        {slots.length > 0 ? (
                            <form onSubmit={handleSubmitForm}>
                                <div className="slots">
                                    <ul>
                                        {slots.map((x) => (
                                            <li
                                                style={{
                                                    backgroundColor:
                                                        formData?.appointDtlId === x.appoint_dtl_id
                                                            ? "grey"
                                                            : x.backgroundColor,
                                                }}
                                                onClick={() => handleChange(x)}
                                            >
                                                {x?.appoint_start_time + ' : ' + x?.appoint_end_time}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <label>Status Reason:</label>
                                    {
                                        <select className="form-control" name="statusReason" id="statusReason" onChange={handleChange}>
                                            <option value="">Select the status reason</option>
                                            {statusReason?.map((ele) => {
                                                return <option value={ele?.code}>{ele?.description}</option>
                                            })}
                                        </select>
                                    }
                                    {errors.statusReason && <span className="error">{errors.statusReason}</span>}
                                </div>
                                <button type="submit" className='btn btn-primary'>Submit</button>
                            </form>
                        ) : (
                            <>No Slots Available</>
                        )}
                        {/* {slots?.length > 0 ? <form onSubmit={handleSubmitForm}>
                                    <div>
                                        <label>Slots:</label>
                                        <div>

                                            {
                                                slots?.map((x) => (
                                                    <label key={x?.appoint_dtl_id}>
                                                        {console.log('x-------->', x)}
                                                        <input
                                                            type="radio"
                                                            name="slot"
                                                            value={JSON.stringify(x)}
                                                            checked={formData?.slot?.appoint_dtl_id
                                                                === x?.appoint_dtl_id}
                                                            onChange={handleChange}
                                                        />
                                                        {x?.appoint_start_time + ' : ' + x?.appoint_end_time}
                                                    </label>
                                                ))
                                            }

                                        </div>
                                        {errors.apptData && <span className="error">{errors.apptData}</span>}
                                    </div>
                                    <div>
                                        <label>Status Reason:</label>
                                        {
                                            <select className="form-control" name="statusReason" id="statusReason" onChange={handleChange}>
                                                <option value="">Select the status reason</option>
                                                {statusReason?.map((ele) => {
                                                    return <option value={ele?.code}>{ele?.description}</option>
                                                })}
                                            </select>
                                        }
                                        {errors.statusReason && <span className="error">{errors.statusReason}</span>}
                                    </div>
                                    <button type="submit" className='btn btn-primary'>Submit</button>
                                </form>
                                    :
                                    <>No Slots Available</>
                                } */}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default ReScheduleModal;


