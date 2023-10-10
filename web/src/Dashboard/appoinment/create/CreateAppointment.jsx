import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import moment from 'moment'
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, CloseButton } from 'react-bootstrap';

const CreateAppointment = (props) => {
    const {
        isCreateModalOpen,
        isUpcomingRefresh, isCreateApptFormOpen
    } = props.data;
    const {
        setIsCreateModalOpen,
        setIsUpcomingRefresh, setIsCreateApptFormOpen, setApptDate
    } = props.handlers;

    const [events, setEvents] = useState([]);
    const [slots, setSlots] = useState([]);
    const initialPayload = {
        startTime: '',
        endTime: '',
        appointmentDate: '', // corrected spelling
        appointmentDtlId: '', // corrected spelling
        appointTxnId: '' // corrected spelling
    };
    const [payload, setPayload] = useState(initialPayload);
    const calendarRef = useRef();

    const [weekends, setWeekends] = useState(true); // corrected variable name
    const [initialView, setInitialView] = useState("dayGridMonth"); // corrected variable name

    useEffect(() => {
        console.log('here rendering----------', calendarRef.current);
        calendarRef.current.getApi().render();
    }, [props]);

    const memoizedEventsFn = useMemo(() => {
        if (events && events.length > 0) {
            return events.map((x) => ({ ...x, start: new Date(x.start), end: new Date(x.end) }));
        }
        return [];
    }, [events]);


    const handleDateClick = (e) => {
        console.log('e.dateStr', e.dateStr);
        setIsCreateApptFormOpen(true)
        setApptDate(moment(e.dateStr).format('YYYY-MM-DD'))
        const button = document.getElementById("createApptId");
        button.click();
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        calendarRef.current.getApi().destroy();
    };

    return (
        <Modal show={isCreateModalOpen} onHide={handleCloseModal} dialogClassName='cust-xs-modal'>
            <Modal.Header>
                <Modal.Title><span className="messages-page__title">Appointment Schedule Settings</span></Modal.Title>
                <CloseButton onClick={handleCloseModal}><span aria-hidden="true">×</span></CloseButton>
            </Modal.Header>
            <Modal.Body>
                <div className='cmmn-skeleton skel-br-tp-r0'>
                    <div className="px-0 py-0 p-1">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                            initialView={initialView}
                            headerToolbar={{
                                start: "prev,next today",
                                center: "title",
                                end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                            }}
                            dateClick={handleDateClick}
                            weekends={weekends}
                            events={memoizedEventsFn}
                        />
                        <button id="createApptId" type="button" data-target="#eventModalCreate" data-toggle="modal"></button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default CreateAppointment;


