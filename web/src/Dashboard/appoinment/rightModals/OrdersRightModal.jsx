import React, { useEffect, useContext, useState } from "react";
import { toast } from 'react-toastify';
import { properties } from "../../../properties";
import { get, put, post } from "../../../common/util/restUtil";
import { history } from '../../../common/util/history';
import profile from '../../../assets/images/profile.png';
import { AppContext } from "../../../AppContext";
import OrderJourney from '../../operational/Orders/OrderJourney';
import Swal from 'sweetalert2';


const OrdersRightModal = (props) => {
    let { selectedStatus, selectedOrder, statuses } = props.data;
    const { setSelectedStatus, setSelectedOrder, setSelectedEntityType, setIsReScheduleOpen, setIsCancelOpen } = props.handlers;

    selectedOrder = selectedOrder[0];
    // console.log('selectedOrder---------->', selectedOrder);

    const { auth } = useContext(AppContext);

    const [orderWorkflow, setOrderWorkflow] = useState({})
    const [orderData, setOrderData] = useState([])

    useEffect(() => {
        get(`${properties.ORDER_API}/search?q=${selectedOrder?.tran_category_no.trim()}`)
            .then((resp) => {
                if (resp?.status === 200) {
                    if (resp?.data && resp?.data?.length > 0) {
                        setOrderData(resp.data[0])
                    }
                }
            }).catch(error => {
                console.log(error)
            }).finally();

        if (selectedOrder?.tran_category_no.trim()) {
            post(`${properties.ORDER_API}/flow/${selectedOrder?.tran_category_no.trim()}`)
                .then((resp) => {
                    if (resp.data) {
                        setOrderWorkflow({ ...resp.data, source: 'ORDER' });
                    }
                })
                .catch(error => console.error(error))
                .finally(() => console.log())
        }

    }, [])

    const getCustomerData = (customerNo) => {
        get(`${properties.CUSTOMER_API}/search?q=${customerNo.trim()}`)
            .then((resp) => {
                if (resp.status === 200) {
                    const button = document.getElementById("modalButton");
                    button.click();
                    setSelectedEntityType('')
                    setSelectedOrder([])
                    const data = {
                        ...resp?.data[0],
                        sourceName: 'customer360'
                    }
                    if (resp?.data[0]?.customerUuid) {
                        sessionStorage.setItem("customerUuid", resp.data[0].customerUuid)
                    }
                    history.push(`${process.env.REACT_APP_BASE}/view-customer`, { data })
                }
            }).catch(error => {
                console.log(error)
            }).finally();
    }


    const handleOpenRescheduleModal = () => {
        const button = document.getElementById("modalButton");
        button.click();
        setIsReScheduleOpen(true)
    }

    const handleCancelAppoinment = (e) => {
        // console.log('selectedOrder---->', selectedOrder);
        const button = document.getElementById("modalButton");
        button.click();
        setIsCancelOpen(true)
    }

    // const handleCancelAppoinment = (e) => {
    //     console.log('selectedOrder---->', selectedOrder);
    //     const button = document.getElementById("modalButton");
    //     button.click();
    //     Swal.fire({
    //         title: 'Are you sure to cancel the appointment?',
    //         text: ``,
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: '#3085d6',
    //         cancelButtonColor: '#d33',
    //         confirmButtonText: `Yes,cancel it!`
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    //             post(`${properties.APPOINTMENT_API}/update-appoinment-status`, { status: 'AS_CANCEL', appointTxnId: selectedOrder?.appoint_txn_id })
    //                 .then((response) => {
    //                     if (response?.status === 200) {

    //                         toast.success(response?.message);
    //                     }
    //                 })
    //                 .catch((error) => {
    //                     console.error(error)
    //                 })
    //                 .finally()
    //         }
    //     })

    // }



    return (
        <div className="modal right fade skel-view-rh-modal" id="view-right-modal" tabIndex="-1" role="dialog" aria-labelledby="viewrightmodal">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <button id="modalButton" type="button" className="close" data-dismiss="modal" aria-label="Close" /*onClick={() => {
                            setSelectedEntityType('')
                        }}*/><span aria-hidden="true">&times;</span></button>
                    </div>
                    <div className="modal-body">
                        <div className="skel-profile-base">
                            <img src={profile} alt="" className="img-fluid" width="50" height="50" />
                            <div className="skel-profile-info">
                                <span className="skel-profile-name">{orderData?.customerDetails?.customerNo}</span>
                                <span>{orderData?.customerDetails?.firstName + ' ' + orderData?.customerDetails?.lastName}</span>
                                <a onClick={() => getCustomerData(orderData?.customerDetails?.customerNo)} className="skel-txt-dec-underline">View full profile</a>
                            </div>
                        </div>
                        <hr className="cmmn-hline mt-2" />
                        <div className="skel-inter-statement">

                            <div className="skel-inter-st-types">
                                <table className="w-100">
                                    <tr><td className="p-1"><span className="font-weight-bold">Order No:</span> {orderData?.orderNo}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Order Category:</span> {orderData?.orderCategory?.description}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Order Type:</span> {orderData?.orderType?.description}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Service Type:</span> {orderData?.serviceType?.description}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Channel:</span> {orderData?.orderChannel?.description}</td></tr>
                                </table>
                            </div>

                            {["AS_SCHED", "AS_TEMP"].includes(selectedOrder?.status) ? (
                                <React.Fragment>
                                    {statuses?.length > 0 && (
                                        <div className="form-group">
                                            <label className="control-label">Appointment Status<span className="text-danger font-20 fld-imp">*</span></label>
                                            <select className="form-control" value={selectedOrder?.status}
                                                onChange={(e) => {
                                                    let description = statuses.find(x => x.code == e.target.value)?.description;
                                                    setSelectedStatus({ code: e.target.value, description })
                                                    if (e.target.value == 'AS_RESCH') {
                                                        handleOpenRescheduleModal();
                                                    } else {
                                                        handleCancelAppoinment();
                                                    }
                                                }}
                                            >
                                                <option value={null}>Select status</option>
                                                {statuses.filter(x => !["AS_SCHED", "AS_TEMP"].includes(x.code)).map((e, k) => (
                                                    <option key={k} value={e.code}>{e.description}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {["AUDIO_CONF", "VIDEO_CONF"].includes(selectedOrder?.appoint_mode) ? (
                                        <a href={selectedOrder?.appoint_mode_value} target="_blank">
                                            Click here
                                            <button className={`skel-btn-submit ${selectedOrder?.appoint_mode == "AUDIO_CONF" ? "btn-mic" : "btn-video"}`}>
                                                <i className="material-icons ml-0">videocam</i>Join
                                            </button>
                                        </a>
                                    ) : (
                                        <a>{selectedOrder?.appoint_mode_value}</a>
                                    )}
                                </React.Fragment>
                            ) : (
                                <div className="form-group">
                                    <label className="control-label">Appointment Status: <span className="font-20">{statuses.find(x => x.code == selectedOrder?.status)?.description}</span></label>
                                </div>
                            )}
                        </div>

                        <hr className="cmmn-hline mt-2 mb-2" />
                        <span className="skel-lbl-flds mb-3">Workflow</span>
                        <div className="col-md-12">
                            <div className="skel-view-base-card">
                                <span className="skel-profile-heading">Order workflow</span>
                                <div className="skel-ai-sect">
                                    <OrderJourney data={orderWorkflow} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
}

export default OrdersRightModal;


