import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactModal from 'react-modal';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { get, post } from '../../common/util/restUtil';
import { properties } from '../../properties';
import moment from 'moment'
import CustomerAddressForm from '../Address/CustomerAddressForm';
import ReactSwitch from "react-switch";
import { toast } from 'react-toastify';
import AddressMap from '../Address/AddressMap';
import { hideSpinner, showSpinner } from '../../common/spinner';

const ServiceAppointmentModal = (props) => {

    const { isOpen, serviceTypeLookup, serviceData, selectedProductData, customerAddress, countries, selectedCustomerType, selectedAppointmentList, customerData } = props?.data
    const { setIsOpen, fetchProductList, setSelectedAppointmentList } = props?.handler

    const RegularModalCustomStyles = {
        content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
            maxHeight: '70%'
        }
    }
    const [events, setEvents] = useState([]);
    const calendarRef = useRef();

    const [weekends] = useState(true)
    const [initialView] = useState("dayGridMonth")
    const [templateData, setTemplateData] = useState([]);
    const [availableAppointments,setAvailableAppointments] = useState([])
    const [appointmentTypes, setAppointmentTypes] = useState([])
    const [locations,setLocations] = useState([])
    const [addressData,setAddressData] = useState({
        address1: '',
        address2: '',
        address3: '',
        district: '',
        state: '',
        city: '',
        country: '',
        postcode: '',
        countryCode: ''
    })
    const [addressLookUpRef, setAddressLookUpRef] = useState(null)
    const [addressError, setAddressError] = useState(null)
    const [selectedAppointmentData,setSelectedAppointmentData] = useState({
        useCustomerAddress: true
    })
    const memoizedEventsFn = useMemo(() => {
        return events.map(x => ({ ...x, start: new Date(x.start), end: new Date(x.end) }));
    }, [events]);

    const [isActiveTab, setIsActiveTab] = useState('')
    const [latitude, setLatitude] = useState()
    const [longitude, setLongitude] = useState()
    const [addressString,setAddressString] = useState('')

    const fetchCountryList = (input, data = undefined, pageIndex = undefined) => {
        
        get(properties.ADDRESS_LOOKUP_API + '?country=' + input)
            .then((resp) => {
                if (resp && resp.data) {
                    setAddressLookUpRef(resp.data)
                    if (data) {
                        const addressData = resp.data.find((x) => x.postCode === data?.postcode)
                        setAddressData({
                            ...addressData,
                            latitude: data?.latitude,
                            longitude: data?.longitude,
                            address1: data?.address1 || "",
                            address2: data?.address2 || "",
                            address3: data?.address3 || "",
                            postcode: addressData?.postCode || "",
                            state: addressData?.state || "",
                            district: addressData?.district || "",
                            city: addressData?.city || "",
                            country: addressData?.country || '',
                            countryCode: data?.countryCode || ''
                        })
                    }
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }

    useEffect(() => {
        showSpinner()
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=APPOINT_TYPE,LOCATION')
            .then((response) => {
                console.log('customerAddress------->',customerAddress?.country)
                if (response.data) {
                    const customerCountry = customerAddress?.country || null
                    setLocations(customerCountry ? response.data.LOCATION.filter((x) => x?.mapping?.country  === customerCountry ) : response.data.LOCATION)
                    setAppointmentTypes(response.data.APPOINT_TYPE || [])
                }
            })
            .catch(error => {
                console.error(error);
            }).finally(hideSpinner)
    }, [])

    useEffect(() => {

        if (selectedProductData.productSubType && selectedProductData.serviceType) {
            const reqBody = {
                mapCategory: 'TMC_ORDER',
                serviceCategory: selectedProductData.productSubType,
                serviceType: selectedProductData.serviceType,
                customerCategory: selectedCustomerType || 'REG',
                tranType: 'OT_SU',
                tranCategory: 'OC_N',
                tranPriority: 'PRTYHGH'
            }
            post(properties.MASTER_API + '/interaction-template', { ...reqBody }).then((resp) => {
                console.log(resp.data)
                if (resp.status === 200) {
                    setTemplateData(resp.data)
                    setSelectedAppointmentData({
                        ...selectedAppointmentData,
                        rosterId: resp?.data?.mappedTemplate?.appointmentHdr[0]?.rosterId || null
                    })
                }
            }).catch((error) => {
                console.log(error)
            })
        }
    }, [])

    useEffect(() => {
        if(selectedAppointmentData.appointmentType) {
            if(selectedAppointmentData.appointmentType === 'CUST_VISIT' && !selectedAppointmentData.appointmentBranch) {
                toast.error('Please Select Branch')
                return
            }
            if(selectedAppointmentData.appointmentType === 'BUS_VISIT' && !selectedAppointmentData?.useCustomerAddress ) { //&& !addressData?.postcode && !addressData?.district
                toast.error('Please Provide Address Details')
                return
            }
            const requestBody = {
                mapCategory: 'TMC_ORDER',
                serviceCategory: selectedProductData.productSubType,
                serviceType: selectedProductData.serviceType,
                customerCategory: selectedCustomerType || 'REG',
                tranType: 'OT_SU',
                tranCategory: 'OC_N',
                tranPriority: 'PRTYHGH',
                appointmentType: selectedAppointmentData.appointmentType,
                templateId: templateData?.mappedTemplate?.templateId,
                appointmentDate: selectedAppointmentData.appointmentDate || moment(new Date()).format('YYYY-MM-DD'),
                location: selectedAppointmentData.appointmentBranch,
                address: selectedAppointmentData?.useCustomerAddress ? customerAddress : addressData
            }
            post(properties.MASTER_API + '/available-appointment', { ...requestBody }).then((resp) => {
                console.log(resp.data)
                if (resp.status === 200) {
                    console.log('resp.data', resp.data)
                    setEvents(resp.data.events || [])
                    setAvailableAppointments(resp.data.currentAppointments || [])
                }
            }).catch((error) => {
                console.log(error)
            })
        }
    },[selectedAppointmentData.appointmentType, selectedAppointmentData.appointmentDate, selectedAppointmentData.appointmentBranch, addressData?.postcode, selectedAppointmentData?.useCustomerAddress, addressData?.district])


    const handleConfirmAppointment = () => {
        if(!selectedAppointmentData?.appointDtlId) {
            toast.error('Please Select Appointment Slot')
            return
        }
        const appiointData = availableAppointments.find((x) => x?.appointDtlId === selectedAppointmentData?.appointDtlId)
        const reqBody = {
            appointDtlId: selectedAppointmentData?.appointDtlId,
            appointAgentId: appiointData?.appointUserId,
            customerId: customerData?.customerId,
            productNo: selectedProductData?.productNo,
            operation: 'CREATE'
        }
        post(properties.MASTER_API + '/temp-appointment/create', { ...reqBody }).then((resp) => {
            console.log(resp.data)
            if (resp.status === 200) {
                console.log('resp.data', resp.data)
                toast.success('Appointment Created Successfully')
                setIsOpen(false)
                setSelectedAppointmentList([...selectedAppointmentList, { ...appiointData, ...reqBody, appointAddress: selectedAppointmentData?.useCustomerAddress ? customerAddress : addressData} ])
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleDateClick = (e) => {
        console.log('e.dateStr')
        setSelectedAppointmentData({
            ...selectedAppointmentData,
            appointmentDate: e.dateStr,
            appointDtlId: ""
        })
    }
    const handleSelectSlot = (e) => {
        setSelectedAppointmentData({
            ...selectedAppointmentData,
            appointDtlId: e.appointDtlId,
            appointUserId: e.appointUserId
        })
    }

    useEffect(() => {
        const success = (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            setLatitude(latitude)
            setLongitude(longitude)
            const geolocationUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            fetch(geolocationUrl)
                .then((res) => res.json())
                .then((data) => { console.log('data---------------', data); setIsActiveTab('MAP');  }).catch((error) => {
                    console.log(error)
                })
        }
        const error = () => {
            toast.error('Unable to fetch location')
        }
        navigator.geolocation.getCurrentPosition(success, error)
    }, [])

    return (
        <>
            <ReactModal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Followup Modal" >
                <div className="modal-center" id="followhistoryModal" tabIndex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                    <div className="modal-dialog " role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="followupModal">Appointment for {selectedProductData?.productName}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                            <div className={`${/*!selectedAppointmentData?.appointmentRequired*/ templateData?.mappedTemplate?.templateId ? 'skel-form-heading-bar mt-2' : 'd-none'}`}>
                                <span className="messages-page__title">Appointment Settings</span>
                            </div>
                            <div className={`${/*!selectedAppointmentData?.appointmentRequired*/ templateData?.mappedTemplate?.templateId ? 'cmmn-skeleton skel-br-tp-r0' : 'd-none'}`}>
                                <div className="form-row px-0 py-0">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="appointmentType" className="control-label">Appointment Type <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select value={selectedAppointmentData.appointmentType} id="appointmentType" className={`form-control `} 
                                                onChange={(e) => { setSelectedAppointmentData({...selectedAppointmentData, appointmentType: e.target.value, useCustomerAddress: true, appointDtlId: "" }) }}
                                            >
                                                <option key="appointmentType" value="">Select Appointment Type</option>
                                                {
                                                    appointmentTypes && appointmentTypes.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    {
                                        selectedAppointmentData.appointmentType === "BUS_VISIT" && 
                                        <div className="col-md-6 mt-3">
                                            <span className="messages-page__title">Use Same as Customer Address
                                            <ReactSwitch
                                                onColor="#4C5A81"
                                                offColor="#6c757d"
                                                activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                height={20}
                                                width={48}
                                                className="inter-toggle skel-inter-toggle ml-2" id="useCustomerAddress" checked={selectedAppointmentData?.useCustomerAddress}
                                                onChange={(e) => { setSelectedAppointmentData({...selectedAppointmentData, useCustomerAddress: e }) }}
                                            />
                                            </span>
                                        </div>
                                    }
                                    {
                                       selectedAppointmentData.appointmentType === "CUST_VISIT" && 
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="appointmentBranch" className="control-label">Branch <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <select value={selectedAppointmentData.appointmentBranch} id="appointmentBranch"  className={`form-control`} 
                                                onChange={(e) => { setSelectedAppointmentData({...selectedAppointmentData, appointmentBranch: e.target.value, appointDtlId: "" }) }}
                                                >
                                                    <option key="appointmentBranch" value="">Select Branch</option>
                                                    {
                                                        locations && locations.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    }
                                </div>
                                
                                <div className=" px-0 py-0 p-1">
                                {countries && !selectedAppointmentData?.useCustomerAddress && selectedAppointmentData.appointmentType === "BUS_VISIT"  && 
                                    <>
                                    <div className="row col-md-12 pl-0 pb-2">
                                        <div className="tabbable-responsive pl-1">
                                            <div className="tabbable">
                                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                                    <li className="nav-item">
                                                        <a className={(isActiveTab === 'MAP') ? 'nav-link active' : 'nav-link'} id="work-flow-history" data-toggle="tab" href="#cpwd" role="tab" aria-controls="work-flow-history" aria-selected="false"
                                                            onClick={() => { setIsActiveTab('MAP') }}
                                                        >Address Map</a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a className={(isActiveTab === 'FORM') ? 'nav-link active' : 'nav-link'} id="lead-details" data-toggle="tab" href="#mprofile" role="tab" aria-controls="lead-details" aria-selected="true"
                                                            onClick={() => { setIsActiveTab('FORM') }}
                                                        >Address Form</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        isActiveTab === 'FORM' && 
                                        <CustomerAddressForm
                                            data={{
                                                addressData,
                                                addressString: ""
                                            }}
                                            countries={countries}
                                            lookups={{
                                                addressElements: addressLookUpRef
                                            }}
                                            error={addressError}
                                            setError={setAddressError}
                                            handler={{
                                                setAddressData,
                                                setAddressLookUpRef
                                            }}
                                        />
                                    }
                                    {isActiveTab === 'MAP' &&
                                        <AddressMap
                                            data={{
                                                addressData: addressData,
                                                latitude,
                                                longitude,
                                                countries
                                            }}
                                            lookups={{
                                                addressElements: addressLookUpRef
                                            }}
                                            error={addressError}
                                            setError={setAddressError}
                                            handler={{
                                                setAddressData: setAddressData,
                                                setAddressLookUpRef,
                                                setAddressString,
                                                fetchCountryList
                                            }}
                                        />
                                    }
                                    </>
                                }
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                                    initialView={initialView}
                                    headerToolbar={{
                                        start: "prev,next today",
                                        center: "title",
                                        end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                                            }}
                                    dayMaxEventRows={1}                                           
                                            
                                    // nowIndicator
                                    // expandRows= {true}
                                    // allDaySlot={false}
                                    // dayMaxEvents
                                    // dayMaxEventRows
                                    initialDate={selectedAppointmentData?.appointmentDate || moment(new Date()).format('YYYY-MM-DD')}
                                    validRange={{ start: moment(new Date()).format('YYYY-MM-DD') }}
                                    dateClick={handleDateClick}
                                    //eventClick={handleDateClick}
                                    weekends={weekends}
                                    events={memoizedEventsFn}
                                    />
                                    <hr className="cmmn-hline mt-2" />
                                    {
                                        availableAppointments.length > 0 ?
                                            <div className="slots">
                                                <ul>
                                                    {
                                                        availableAppointments.map((x) => (
                                                            <li style={{ backgroundColor: selectedAppointmentData?.appointDtlId === x.appointDtlId ? 'grey' : x.backgroundColor }} onClick={() => handleSelectSlot(x)}>{x?.slotName}</li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                            :
                                            <></>

                                    }
                                </div>
                            </div>
                            </div>
                            <div className="col-md-12 pl-2">
                                <div className="form-group pb-1">
                                    <div className="text-center">
                                        <button type="button" className="skel-btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                                        <button type="button" className="skel-btn-submit" onClick={() => handleConfirmAppointment()}>Submit</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ReactModal>
        </>
    )
}

export default ServiceAppointmentModal