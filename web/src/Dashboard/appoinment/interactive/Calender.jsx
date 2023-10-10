import React, { useState, useRef, useMemo, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import { statusConstantCode } from '../../../AppConstants';
import { Button, Modal, Dropdown } from 'react-bootstrap';

const Calender = (props) => {
    const { isCalenderRefresh, searchParams } = props.data
    const { setIsCalenderRefresh } = props.handlers
    const calendarRef = useRef();

    const [weekends] = useState(true)
    const [popUp, setPopUp] = useState(false)
    const [initialView] = useState("dayGridMonth")
    const [frequency, setFrequency] = useState("Week");

    const [events, setEvents] = useState([]);
    const [chosenEvent, setChosenEvent] = useState({});
    const [displayedEvents, setDisplayedEvents] = useState([]);
    const [eventLimit, setEventLimit] = useState(2);

    const memoizedEventsFn = useMemo(() => {
        return displayedEvents.map((x) => ({
            ...x,
            start: new Date(x.start),
            end: new Date(x.end),
            extendedProps: {
                ...x.extendedProps,
                // joinable: true, // Add a joinable property to each event
            },
        }));
    }, [displayedEvents]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await post(`${properties.APPOINTMENT_API}/get-appoinment-events`, { date: new Date(), searchParams });
                if (response.data && response.data.length > 0) {
                    setEvents([...response.data]);
                } else {
                    setEvents([]);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchEvents();
    }, [isCalenderRefresh, searchParams]);

    const handleLoadMore = () => {
        setEventLimit(eventLimit + 3);
    };

    useEffect(() => {
        // console.log('events.slice(0, eventLimit) ', events.slice(0, eventLimit))
        setDisplayedEvents(events);
    }, [events, eventLimit]);

    const handleJoinMeeting = (eventClickInfo) => {
        const event = eventClickInfo.event;
        setChosenEvent(event)
        setPopUp(true)       
    };

    const formatTime = (date) => {
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    const handleClose = () => {
        setPopUp(false);
        setChosenEvent({});
    };

    const openInNewTab = (url) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) newWindow.opener = null
    }

    const onClickUrl = (url) => {
        return () => openInNewTab(url)
    }

    return (
        <>
            <div className="col-md-8">
                <div className="skel-appt-dashboard-lft-base">
                    <div className="cmmn-skeleton">
                        <div className="skel-dashboard-title-base">
                            <span className="skel-header-title">Calendar</span>
                            <div className="skel-dashboards-icons">
                                <a><i className="material-icons" onClick={() => setIsCalenderRefresh(!isCalenderRefresh)}>refresh</i></a>
                            </div>
                        </div>
                        <FullCalendar
                            events={memoizedEventsFn}
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                            initialView={"dayGridMonth"}
                            dayMaxEventRows={eventLimit}
                            headerToolbar={{
                                start: "prev,next today",
                                center: "title",
                                end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                            }}
                            eventClick={handleJoinMeeting} // Add eventClick handler
                            eventContent={(eventInfo) => (
                                <>
                                    <div className='fc-event-time fc-event-title'>
                                        <ul>
                                            <li>{eventInfo.event.title ? eventInfo.event.title : ''}-{eventInfo.event.extendedProps.customerName ? eventInfo.event.extendedProps.customerName : ''}</li>
                                            <li>{formatTime(eventInfo.event.start)} - {formatTime(eventInfo.event.end)}</li>
                                            <li>{eventInfo.event.extendedProps.appointCategory ? eventInfo.event.extendedProps.appointCategory : ''}</li>                                            
                                            <li>{eventInfo.event.extendedProps.appoinmentMode ? eventInfo.event.extendedProps.appoinmentMode : ''}</li>
                                   
                                        </ul>
                                    </div>                                    
                                </>
                            )}
                        />
                        {/* {eventLimit < events.length && (
                            <button onClick={handleLoadMore}>Load More</button>
                        )} */}
                    </div>
                </div>
            </div>
            <Modal show={popUp} backdrop="static" keyboard={false} onHide={handleClose} style={{width: '400px', top: '35%', left: '40%'}}>
                <Modal.Header>
                    <button type="button" className="close mr-2" keyboard={false} onClick={handleClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                <div className='fc-event-time fc-event-title' style={{width: '400px', alignContent:'center'}}>
                    <ul>
                        <li><b>{chosenEvent?.title ? chosenEvent?.title : ''}&nbsp;-&nbsp;{chosenEvent?.extendedProps?.customerName ? chosenEvent?.extendedProps?.customerName : ''}</b></li>
                        <li>{formatTime(chosenEvent?.start)} - {formatTime(chosenEvent?.end)}</li>
                        <li>{chosenEvent?.extendedProps?.appointCategory ? chosenEvent?.extendedProps?.appointCategory : ''}</li>
                        <li></li>
                        <li>{chosenEvent?.extendedProps?.appoinmentMode ? chosenEvent?.extendedProps?.appoinmentMode : ''}</li>
                        <li>{chosenEvent.extendedProps?.status ? chosenEvent.extendedProps?.status : ''}</li>
                        <li>{(chosenEvent.extendedProps?.appointMode === statusConstantCode.businessEntity.AUDIOCONF 
                            || chosenEvent.extendedProps?.appointMode === statusConstantCode.businessEntity.VIDEOCONF) 
                        ? <a target='_new' className='btn btn-primary' style={{color: 'white'}} onClick={onClickUrl(chosenEvent.extendedProps?.url)}>Join</a> : ''}</li>                        
                    </ul>
                </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default Calender;
