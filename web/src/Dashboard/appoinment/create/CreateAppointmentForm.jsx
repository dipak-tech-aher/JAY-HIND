import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import moment from 'moment'
import interactionPlugin from '@fullcalendar/interaction';


import { properties } from "../../../properties";
import { post, get } from "../../../common/util/restUtil";
import { toast } from 'react-toastify';

const CreateAppointmentForm = (props) => {
    let { apptDate, isCreateApptFormOpen, isUpcomingRefresh } = props.data
    const { setApptDate, setIsCreateApptFormOpen, setIsUpcomingRefresh } = props.handlers

    const initialFormData = {
        apptDate: apptDate,
        intxnType: '',
        serviceType: '',
        tktChannel: '',
        apptChannel: '',
        problemCause: '',
        priority: '',
        contactType: '',
        contactName: '',
        contactNumber: '',
        apptType: '',
    }

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmitForm = (e) => {
        e.preventDefault();
        // Validate form data
        const newErrors = {};

        if (!formData.apptDate) {
            newErrors.apptDate = 'appointment date is required';
        }
        if (!formData.intxnType) {
            newErrors.intxnType = 'interaction type is required';
        }
        if (!formData.serviceType) {
            newErrors.serviceType = 'service type is required';
        }
        if (!formData.tktChannel) {
            newErrors.tktChannel = 'ticket channel is required';
        }
        if (!formData.apptChannel) {
            newErrors.apptChannel = 'appointment channel is required';
        }
        if (!formData.problemCause) {
            newErrors.problemCause = 'problem cause is required';
        }
        if (!formData.priority) {
            newErrors.priority = 'priority is required';
        }
        if (!formData.contactType) {
            newErrors.contactType = 'contact type is required';
        }
        if (!formData.contactName) {
            newErrors.contactName = 'contact name is required';
        }
        if (!formData.contactNumber) {
            newErrors.contactNumber = 'contact number is required';
        }
        if (!formData.apptType) {
            newErrors.apptType = 'appointment type is required';
        }

        // If there are errors, update the state
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            console.log('Form submitted:', formData);
            post(`${properties.APPOINTMENT_API}/create-appoinment`, formData)
                .then((response) => {
                    if (response?.status === 200) {
                        setIsUpcomingRefresh(!isUpcomingRefresh)
                        setIsCreateApptFormOpen(!isCreateApptFormOpen)
                        toast.success(response?.message);
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally()
        }
    };


    return (
        <>
            <div className="modal fade" id="eventModalCreate" tabindex="-1">
                <div className="modal-dialog cust-md-modal">
                    <div className="modal-content">
                        <div className="modal-header py-3 px-4 border-bottom-0 d-block">
                            <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                            <h5 className="modal-title">Create Appointment</h5>
                        </div>
                        <div className="modal-body p-4">
                            <form className="needs-validation" name="event-form" id="form-event" onSubmit={handleSubmitForm}>
                                <div className="form-row px-0 py-0">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label for="Interactiontype" className="control-label">Appointment Date<span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input
                                                className="form-control"
                                                min="2023-02-19"
                                                id="fromDate"
                                                type="date"
                                                name="apptDate"
                                                value={apptDate}
                                                onChange={handleChange}
                                            />

                                            {errors.apptDate && <span className="error">{errors.apptDate}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label for="Interactiontype" className="control-label">Interaction Type <span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className="form-control disable-field" id="Interactiontype" required="" name='intxnType' onChange={handleChange}>
                                                    <option selected="">Select Interaction Type</option>
                                                    <option>Complaint</option>
                                                    <option>Inquiry</option>
                                                    <option>Service Request</option>
                                                </select>
                                                {errors.intxnType && <span className="error">{errors.intxnType}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label for="Servicetype" className="control-label">Service type <span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className="form-control disable-field" id="Servicetype" required="" name='serviceType' onChange={handleChange}>
                                                    <option selected="">Choose Service Type</option>
                                                    <option>Accessories</option>
                                                    <option>Addon</option>
                                                    <option>Asset</option>
                                                    <option>Cabling</option>
                                                    <option>Custom Services</option>
                                                    <option>Lic Windows</option>
                                                    <option>Rack</option>
                                                    <option>Service Desk</option>
                                                </select>
                                                {errors.serviceType && <span className="error">{errors.serviceType}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label for="Channel" className="control-label">Channel <span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className="form-control disable-field" id="ticketchannel" required="" name='tktChannel' onChange={handleChange}>
                                                    <option selected="">Choose Ticket Channel</option>
                                                    <option>E-MAIL</option>
                                                    <option>IVR</option>
                                                    <option>Live Chat</option>
                                                    <option>Telegram</option>
                                                    <option>WhatsApp</option>
                                                </select>
                                                {errors.tktChannel && <span className="error">{errors.tktChannel}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label for="Problemstatement" className="control-label">Problem Statement Cause <span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className="form-control disable-field" id="Problemstatement" required="" name='problemCause' onChange={handleChange}>
                                                    <option selected="">Select Problem Statement Cause</option>
                                                    <option>Policies and Procedures related</option>
                                                    <option>Dissatisfaction with Policies and Procedures</option>
                                                </select>
                                                {errors.problemCause && <span className="error">{errors.problemCause}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label for="Priority" className="control-label">Priority <span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect"><select className="form-control" id="Priority" required="" name='priority' onChange={handleChange}>
                                                <option selected="">Choose Ticket Priority</option>
                                                <option>HIGH</option>
                                                <option>LOW</option>
                                                <option>MEDIUM</option>
                                                <option>VIP</option>
                                            </select>
                                                {errors.priority && <span className="error">{errors.priority}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label for="Contactpreferenece" className="control-label">Contact Type <span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect"><select className="form-control" id="Contactpreferenece"
                                                required="" name='contactType' onChange={handleChange}>
                                                <option selected="">Choose Contact Type</option>
                                                <option>Business</option>
                                                <option>Email</option>
                                                <option>Fax</option>
                                                <option>Home</option>
                                                <option>Mobile</option>
                                            </select>
                                                {errors.contactType && <span className="error">{errors.contactType}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-row px-0 py-0">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label for="cntname" className="control-label">Contact Name<span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input className="form-control" id="cntname" placeholder="Contact Name" type="text"
                                                value="" name='contactName' onChange={handleChange} />
                                            {errors.contactName && <span className="error">{errors.contactName}</span>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label for="cntnumber" className="control-label">Contact Number<span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input className="form-control" id="cntnumber" placeholder="Contact Number" type="text"
                                                value="" name='contactNumber' onChange={handleChange} />
                                            {errors.contactNumber && <span className="error">{errors.contactNumber}</span>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label for="skill_dropdown" className="control-label">Appointment Type<span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className="form-control skill_dropdown" id="skill_dropdown" required="" name='apptType' onChange={handleChange}>
                                                    <option selected="">Choose Appointment Type</option>
                                                    <option value="direct">Direct</option>
                                                    <option value="vc">VC</option>
                                                    <option value="ac">AC</option>
                                                </select>
                                                {errors.apptType && <span className="error">{errors.apptType}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 ac skill">
                                        <div className="form-group">
                                            <label for="" className="control-label">Channel <span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className="form-control" id="" required="" name='apptChannel' onChange={handleChange}>
                                                    <option selected="">Choose Channel</option>
                                                    <option value="">WhatsApp</option>
                                                    <option value="">Skype</option>
                                                    <option value="">Teams</option>
                                                </select>
                                                {errors.apptChannel && <span className="error">{errors.apptChannel}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 vc skill">
                                        <div className="form-group">
                                            <label for="" className="control-label">Channel <span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className="form-control" id="" required="" name='apptChannel' onChange={handleChange}>
                                                    <option selected="">Choose Channel</option>
                                                    <option value="">WhatsApp</option>
                                                    <option value="">Skype</option>
                                                    <option value="">Gmeet</option>
                                                    <option value="">Teams</option>
                                                </select>
                                                {errors.apptChannel && <span className="error">{errors.apptChannel}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 direct skill">
                                        <div className="form-group">
                                            <label for="Priority" className="control-label">Location <span
                                                className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className="form-control" id="Priority" required="" name='apptLocation' onChange={handleChange}>
                                                    <option selected="">Select Location</option>
                                                    <option>Brunei</option>
                                                    <option>Bangalore</option>
                                                    <option>Chennai</option>
                                                </select>
                                                {errors.apptLocation && <span className="error">{errors.apptLocation}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-6">
                                        <button type="button" className="skel-btn-delete" id="btn-delete-event">Delete</button>
                                    </div>
                                    <div className="col-6 text-right">
                                        <button type="button" className="skel-btn-cancel" data-dismiss="modal"
                                            data-target="#createappointmentmodal" data-toggle="modal">Close</button>
                                        <button type="submit" className="skel-btn-submit" id="btn-save-event">Save</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateAppointmentForm;


