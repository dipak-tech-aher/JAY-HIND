import React, { useState, useRef, useMemo, useContext } from 'react';
import { Modal } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { useEffect } from 'react';
import { statusConstantCode } from '../AppConstants';
import { AppContext } from '../AppContext';
import moment from 'moment';

const CalendarComponent = ({ data, handlers }) => {
    const { appConfig } = useContext(AppContext);
    const { show, events } = data;
    const { setShow } = handlers;
    const calendarRef = useRef();

    const [weekends] = useState(true)
    const [initialView] = useState("dayGridMonth")
    const [displayedEvents, setDisplayedEvents] = useState([]);
    const [eventLimit, setEventLimit] = useState(3);
    const [chosenEvent, setChosenEvent] = useState({});
    const [popUp, setPopUp] = useState(false);
    // console.log(displayedEvents)
    const memoizedEventsFn = useMemo(() => {
        return displayedEvents.map(x => ({
            ...x,
            start: new Date(moment.utc(x.start).format('YYYY-MM-DD HH:mm:ss')),
            end: new Date(moment.utc(x.end).format('YYYY-MM-DD HH:mm:ss')),
            allDay: true,
            extendedProps: {
                ...x.extendedProps,
                joinable: true, // Add a joinable property to each event
            }
        }));
    }, [displayedEvents]);

    useEffect(() => {
        setDisplayedEvents(events);
    }, [events, eventLimit]);

    const handleLoadMore = () => {
        setEventLimit(eventLimit + 3);
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

    const handleJoinMeeting = (eventClickInfo) => {
        const event = eventClickInfo.event;
        console.log(event);
        setChosenEvent(event)
        setPopUp(true)
    };

    useEffect(() => {
        if (!show) {
            handleClose();
        }
    }, [show])

    return (
        <>
            <Modal show={show} backdrop="static" onHide={() => { setShow(false); }} dialogClassName="wsc-cust-mdl-temp-prev">
                <Modal.Header>
                    <Modal.Title>{appConfig?.clientFacingName?.customer ?? 'Customer'} events</Modal.Title>
                    <button type="button" className="close mr-2 mt" variant="secondary" onClick={() => handlers.setShow(false)}><span aria-hidden="true">×</span></button>
                </Modal.Header>
                <Modal.Body>
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
                        eventClick={handleJoinMeeting}
                        weekends={weekends}
                        events={memoizedEventsFn}
                        eventContent={(eventInfo) => (
                            <>
                                {(eventInfo.event.start && eventInfo.event.end) && (
                                    <div>{formatTime(eventInfo.event.start)} - {formatTime(eventInfo.event.end)}</div>
                                )}
                                <div>{eventInfo.event.title !== 'null' ? eventInfo.event.title : ''}</div>

                            </>
                        )}
                    />
                </Modal.Body>
            </Modal>

            
            <Modal show={popUp} backdrop="static" keyboard={false} onHide={handleClose} dialogClassName="wsc-cust-mdl-temp-prev cust-sm-modal skel-cal-popup-details">
                <Modal.Header closeButton>
                    <button type="button" className="close mr-2" keyboard={false} onClick={handleClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <div className='fc-event-time fc-event-title' style={{ width: '400px', alignContent: 'center' }}>
                        <ul>
                            {chosenEvent?.title && <li><b>{chosenEvent?.title ? chosenEvent?.title : ''}&nbsp;-&nbsp;{chosenEvent?.extendedProps?.customerName ? chosenEvent?.extendedProps?.customerName : ''}</b></li>}
                            {chosenEvent?.start && chosenEvent?.end && <li><strong>Duration: </strong>{formatTime(chosenEvent?.start)} - {formatTime(chosenEvent?.end)}</li>}
                            {chosenEvent?.extendedProps?.appointCategory && <li><strong>Appointment category: </strong>{chosenEvent?.extendedProps?.appointCategory ? chosenEvent?.extendedProps?.appointCategory : ''}</li>}
                            {chosenEvent?.extendedProps?.appoinmentMode && <li><strong>Appointment mode: </strong>{chosenEvent?.extendedProps?.appoinmentMode ? chosenEvent?.extendedProps?.appoinmentMode : ''}</li>}

                            {chosenEvent.extendedProps?.serviceName && <li><strong>Service name: </strong>{chosenEvent.extendedProps?.serviceName ? chosenEvent.extendedProps?.serviceName : ''}</li>}
                            {chosenEvent.extendedProps?.contractName && <li><strong>Contract name: </strong>{chosenEvent.extendedProps?.contractName ? chosenEvent.extendedProps?.contractName : ''}</li>}

                            {chosenEvent.extendedProps?.intxnCategory?.description && <li><strong>Interaction category: </strong>{chosenEvent.extendedProps?.intxnCategory?.description ? chosenEvent.extendedProps?.intxnCategory?.description : ''}</li>}
                            {chosenEvent.extendedProps?.intxnType?.description && <li><strong>Interaction type: </strong>{chosenEvent.extendedProps?.intxnType?.description ? chosenEvent.extendedProps?.intxnType?.description : ''}</li>}
                            {chosenEvent.extendedProps?.intxnStatus?.description && <li><strong>Interaction status: </strong>{chosenEvent.extendedProps?.intxnStatus?.description ? chosenEvent.extendedProps?.intxnStatus?.description : ''}</li>}

                            {chosenEvent.extendedProps?.orderCategory?.description && <li><strong>Order category: </strong>{chosenEvent.extendedProps?.orderCategory?.description ? chosenEvent.extendedProps?.orderCategory?.description : ''}</li>}
                            {chosenEvent.extendedProps?.orderType?.description && <li><strong>Order type: </strong>{chosenEvent.extendedProps?.orderType?.description ? chosenEvent.extendedProps?.orderType?.description : ''}</li>}
                            {chosenEvent.extendedProps?.orderStatus?.description && <li><strong>Order status: </strong>{chosenEvent.extendedProps?.orderStatus?.description ? chosenEvent.extendedProps?.orderStatus?.description : ''}</li>}

                            {chosenEvent.extendedProps?.status?.description && <li><strong>status: </strong>{chosenEvent.extendedProps?.status?.description ? chosenEvent.extendedProps?.status?.description : ''}</li>}


                            {chosenEvent.extendedProps?.serviceCategory?.description && <li><strong>Service category: </strong>{chosenEvent.extendedProps?.serviceCategory?.description ? chosenEvent.extendedProps?.serviceCategory?.description : ''}</li>}
                            {chosenEvent.extendedProps?.serviceType?.description && <li><strong>Service type: </strong>{chosenEvent.extendedProps?.serviceType?.description ? chosenEvent.extendedProps?.serviceType?.description : ''}</li>}

                            {chosenEvent.extendedProps?.serviceClass?.description && <li><strong>Service class: </strong>{chosenEvent.extendedProps?.serviceClass?.description ? chosenEvent.extendedProps?.serviceClass?.description : ''}</li>}

                            {chosenEvent.extendedProps?.rcAmount && <li><strong>RC amount: </strong>{chosenEvent.extendedProps?.rcAmount ? chosenEvent.extendedProps?.rcAmount : ''}</li>}
                            {chosenEvent.extendedProps?.otcAmount && <li>{chosenEvent.extendedProps?.otcAmount ? chosenEvent.extendedProps?.otcAmount : ''}</li>}
                            {chosenEvent.extendedProps?.requestStatement && <li><strong>Request statement: </strong>{chosenEvent.extendedProps?.requestStatement ? chosenEvent.extendedProps?.requestStatement : ''}</li>}

                            {chosenEvent.extendedProps?.intxnPriority?.description && <li><strong>Interaction priority: </strong>{chosenEvent.extendedProps?.intxnPriority?.description ? chosenEvent.extendedProps?.intxnPriority?.description : ''}</li>}
                            {chosenEvent.extendedProps?.orderPriority?.description && <li><strong>Order priority: </strong>{chosenEvent.extendedProps?.orderPriority?.description ? chosenEvent.extendedProps?.orderPriority?.description : ''}</li>}

                            {chosenEvent.extendedProps?.intxnChannel?.description && <li><strong>Interaction channel: </strong>{chosenEvent.extendedProps?.intxnChannel?.description ? chosenEvent.extendedProps?.intxnChannel?.description : ''}</li>}
                            {chosenEvent.extendedProps?.orderChannel?.description && <li><strong>Order channel: </strong>{chosenEvent.extendedProps?.orderChannel?.description ? chosenEvent.extendedProps?.orderChannel?.description : ''}</li>}
                            {chosenEvent.extendedProps?.appointMode && <li><strong>Appointment mode: </strong>{(chosenEvent.extendedProps?.appointMode === statusConstantCode.businessEntity.AUDIOCONF
                                || chosenEvent.extendedProps?.appointMode === statusConstantCode.businessEntity.VIDEOCONF)
                                ? <a target='_new' className='btn btn-primary' style={{ color: 'white' }} onClick={onClickUrl(chosenEvent.extendedProps?.url)}>Join</a> : ''}</li>}

                        </ul>
                        
                    </div>

                    <div class="skel-cal-box arrow-left">
                        {chosenEvent?.title && <div><b>{chosenEvent?.title ? chosenEvent?.title : ''}&nbsp;-&nbsp;{chosenEvent?.extendedProps?.customerName ? chosenEvent?.extendedProps?.customerName : ''}</b></div>}
                        {chosenEvent?.start && chosenEvent?.end && <div><strong>Duration: </strong>{formatTime(chosenEvent?.start)} - {formatTime(chosenEvent?.end)}</div>}
                        {chosenEvent?.extendedProps?.appointCategory && <div><strong>Appointment category: </strong>{chosenEvent?.extendedProps?.appointCategory ? chosenEvent?.extendedProps?.appointCategory : ''}</div>}
                        {chosenEvent?.extendedProps?.appoinmentMode && <div><strong>Appointment mode: </strong>{chosenEvent?.extendedProps?.appoinmentMode ? chosenEvent?.extendedProps?.appoinmentMode : ''}</div>}

                        {chosenEvent.extendedProps?.serviceName && <div><strong>Service name: </strong>{chosenEvent.extendedProps?.serviceName ? chosenEvent.extendedProps?.serviceName : ''}</div>}
                        {chosenEvent.extendedProps?.contractName && <div><strong>Contract name: </strong>{chosenEvent.extendedProps?.contractName ? chosenEvent.extendedProps?.contractName : ''}</div>}

                        {chosenEvent.extendedProps?.intxnCategory?.description && <div><strong>Interaction category: </strong>{chosenEvent.extendedProps?.intxnCategory?.description ? chosenEvent.extendedProps?.intxnCategory?.description : ''}</div>}
                        {chosenEvent.extendedProps?.intxnType?.description && <div><strong>Interaction type: </strong>{chosenEvent.extendedProps?.intxnType?.description ? chosenEvent.extendedProps?.intxnType?.description : ''}</div>}
                        {chosenEvent.extendedProps?.intxnStatus?.description && <div><strong>Interaction status: </strong>{chosenEvent.extendedProps?.intxnStatus?.description ? chosenEvent.extendedProps?.intxnStatus?.description : ''}</div>}

                        {chosenEvent.extendedProps?.orderCategory?.description && <div><strong>Order category: </strong>{chosenEvent.extendedProps?.orderCategory?.description ? chosenEvent.extendedProps?.orderCategory?.description : ''}</div>}
                        {chosenEvent.extendedProps?.orderType?.description && <div><strong>Order type: </strong>{chosenEvent.extendedProps?.orderType?.description ? chosenEvent.extendedProps?.orderType?.description : ''}</div>}
                        {chosenEvent.extendedProps?.orderStatus?.description && <div><strong>Order status: </strong>{chosenEvent.extendedProps?.orderStatus?.description ? chosenEvent.extendedProps?.orderStatus?.description : ''}</div>}

                        {chosenEvent.extendedProps?.status?.description && <div><strong>status: </strong>{chosenEvent.extendedProps?.status?.description ? chosenEvent.extendedProps?.status?.description : ''}</div>}


                        {chosenEvent.extendedProps?.serviceCategory?.description && <div><strong>Service category: </strong>{chosenEvent.extendedProps?.serviceCategory?.description ? chosenEvent.extendedProps?.serviceCategory?.description : ''}</div>}
                        {chosenEvent.extendedProps?.serviceType?.description && <div><strong>Service type: </strong>{chosenEvent.extendedProps?.serviceType?.description ? chosenEvent.extendedProps?.serviceType?.description : ''}</div>}

                        {chosenEvent.extendedProps?.serviceClass?.description && <div><strong>Service class: </strong>{chosenEvent.extendedProps?.serviceClass?.description ? chosenEvent.extendedProps?.serviceClass?.description : ''}</div>}

                        {chosenEvent.extendedProps?.rcAmount && <div><strong>RC amount: </strong>{chosenEvent.extendedProps?.rcAmount ? chosenEvent.extendedProps?.rcAmount : ''}</div>}
                        {chosenEvent.extendedProps?.otcAmount && <div>{chosenEvent.extendedProps?.otcAmount ? chosenEvent.extendedProps?.otcAmount : ''}</div>}
                        {chosenEvent.extendedProps?.requestStatement && <div><strong>Request statement: </strong>{chosenEvent.extendedProps?.requestStatement ? chosenEvent.extendedProps?.requestStatement : ''}</div>}

                        {chosenEvent.extendedProps?.intxnPriority?.description && <div><strong>Interaction priority: </strong>{chosenEvent.extendedProps?.intxnPriority?.description ? chosenEvent.extendedProps?.intxnPriority?.description : ''}</div>}
                        {chosenEvent.extendedProps?.orderPriority?.description && <div><strong>Order priority: </strong>{chosenEvent.extendedProps?.orderPriority?.description ? chosenEvent.extendedProps?.orderPriority?.description : ''}</div>}

                        {chosenEvent.extendedProps?.intxnChannel?.description && <div><strong>Interaction channel: </strong>{chosenEvent.extendedProps?.intxnChannel?.description ? chosenEvent.extendedProps?.intxnChannel?.description : ''}</div>}
                        {chosenEvent.extendedProps?.orderChannel?.description && <div><strong>Order channel: </strong>{chosenEvent.extendedProps?.orderChannel?.description ? chosenEvent.extendedProps?.orderChannel?.description : ''}</div>}
                        {chosenEvent.extendedProps?.appointMode && <div><strong>Appointment mode: </strong>{(chosenEvent.extendedProps?.appointMode === statusConstantCode.businessEntity.AUDIOCONF
                            || chosenEvent.extendedProps?.appointMode === statusConstantCode.businessEntity.VIDEOCONF)
                            ? <a target='_new' className='btn btn-primary' style={{ color: 'white' }} onClick={onClickUrl(chosenEvent.extendedProps?.url)}>Join</a> : ''}</div>}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );

}

export default CalendarComponent;