import React, { useEffect, useRef, useState } from 'react'
import { get, post } from "../../common/util/restUtil";

import { properties } from "../../properties";
import { unstable_batchedUpdates } from 'react-dom';

const NewQueue = (props) => {
    const { newCustomer = [], chatFilter  } = props.data
    const { assignCustomer, setChatFilter } = props.handler
    const between1to2mins = useRef("");
    const between2to5mins = useRef("");
    const between5to10mins = useRef("");
    const greaterthan10mins = useRef("");
    const totalQueue = useRef("");
    console.log('newCustomer==', newCustomer)
    const [ticketChannels, setTicketChannels] = useState([])

    useEffect(() => {
        
        get(properties.CHAT_API + `/count/new?source=${chatFilter}`).then((resp) => {
            console.log('queue===>', resp.data)
            if (resp.status === 200) {
                between1to2mins.current = resp.data[0].between1to2mins || 0
                between2to5mins.current = resp.data[0].between2to5mins || 0
                between5to10mins.current = resp.data[0].between5to10mins || 0
                greaterthan10mins.current = resp.data[0].greaterthan10mins || 0
                totalQueue.current = resp.data[0].total || 0
            }
        }).catch((error) => {
            console.log(error)
        })
        .finally()
    }, [chatFilter])

    useEffect(() => {
        post(properties.BUSINESS_ENTITY_API, ['TICKET_CHANNEL'])
        .then((resp) => {
            if (resp.data) {
                unstable_batchedUpdates(() => {
                    setTicketChannels(resp.data.TICKET_CHANNEL);
                })
            }

        }).catch((error) => {
            console.log(error)
        }).finally();
    },[])

    return (
        <div className="sidebar-group left-sidebar chat_sidebar col-md-4">
            <div id="chats" className="left-sidebar-wrap sidebar active">
                <div className="">
                    <div className="left-chat-title justify-content-between align-items-center">
                        <div id="main">
                            <div className="container">
                                <div className="accordion" id="faq">
                                    <div className="card">
                                        <div className="card-header" id="faqhead1">
                                            <a  className="btn btn-header-link" data-toggle="collapse" data-target="#faq1"
                                                aria-expanded="true" aria-controls="faq1">Chat Queue by Minutes</a> <div className="filter2">
                                                <select className="form-select" aria-label="Default select example" id='chatFilter' name='chatFilter' onChange={(e) => setChatFilter(e.target.value)}>
                                                    <option selected value="">Filter</option>
                                                    {
                                                        ticketChannels.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>

                                        <div id="faq1" className="collapse show" aria-labelledby="faqhead1" data-parent="#faq">
                                            <div className="card-body">
                                                <div className="faq-chat card border mb-1" style={{ zIndex: "21" }}>
                                                    <div className="p-1">
                                                        <div className="media">
                                                            <div className="media-body overflow-hidden">
                                                                <h3 className="mb-0 font-weight-bold" style={{ float: "left" }}>{totalQueue.current}</h3>
                                                                <p className="text-truncate font-size-14 mb-1 pl-2 pt-1">Total Chat Queue</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-1 border-top">
                                                        <div className="row p-0">
                                                            <div className="col-3">
                                                                <div className="text-center">
                                                                    <p className="mb-2 text-truncate font-weight-bold"> &gt; 10 Min</p>
                                                                    <h4 className="text-dark font-weight-bold">{greaterthan10mins.current}</h4>
                                                                </div>
                                                            </div>
                                                            <div className="col-3">
                                                                <div className="text-center">
                                                                    <p className="mb-2 text-truncate font-weight-bold">5 - 10 Min</p>
                                                                    <h4 className="text-dark font-weight-bold">{between5to10mins.current}</h4>
                                                                </div>
                                                            </div>
                                                            <div className="col-3">
                                                                <div className="text-center">
                                                                    <p className="mb-2 text-truncate font-weight-bold">2 -5 Min</p>
                                                                    <h4 className="text-dark font-weight-bold">{between2to5mins.current}</h4>
                                                                </div>
                                                            </div>
                                                            <div className="col-3">
                                                                <div className="text-center">
                                                                    <p className="mb-2 text-truncate font-weight-bold">1 -2 Min</p>
                                                                    <h4 className="text-dark font-weight-bold">{between1to2mins.current}</h4>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className="card">
                                        <div className="card-header" id="faqhead2">
                                            <a  className="btn btn-header-link" data-toggle="collapse" data-target="#faq2"
                                                aria-expanded="true" aria-controls="faq2">VIP Customer</a> <span className="badge badge-light">1</span>
                                        </div>

                                        <div id="faq2" className="" aria-labelledby="faqhead2" data-parent="#faq">
                                            <div className="card-body">
                                                <ul className="user-list mt-2">
                                                    <li className="user-list-item user-vip">
                                                        <div className="avatar avatar-online">
                                                            <div className="letter-avatar">
                                                                R
                                                            </div>
                                                        </div>
                                                        <div className="users-list-body">
                                                            <div>
                                                                <h5>Riyas</h5>
                                                                <p>HID: 56258 riyas@gmail.com</p>
                                                            </div>
                                                            <div className="last-chat-time">
                                                                <small className="text-dark pr-2">15 min</small>
                                                                <div className="new-message-count bg-success"><i className="mdi mdi-whatsapp font-17"></i></div>
                                                                <a  data-bs-toggle="dropdown">
                                                                    <i className="fa fa-arrow-circle-right font-17  text-danger"></i>
                                                                </a>
                                                                <div className="dropdown-menu dropdown-menu-end assign-btn">
                                                                    <a  className="dropdown-item dream_profile_menu font-weight-bold">Assign to My Queue <i className="fa fa-share" aria-hidden="true"></i></a>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>

                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div className="card-header" id="faqhead3">
                                            <a  className="btn btn-header-link" data-toggle="collapse" data-target="#faq3"
                                                aria-expanded="true" aria-controls="faq3">#Emergency</a> <span className="badge badge-light">1</span>
                                        </div>

                                        <div id="faq3" className="" aria-labelledby="faqhead3" data-parent="#faq">
                                            <div className="card-body">
                                                <ul className="user-list mt-2">
                                                    <li className="user-list-item user-emg">
                                                        <div className="avatar avatar-online">
                                                            <div className="letter-avatar">
                                                                A
                                                            </div>
                                                        </div>
                                                        <div className="users-list-body">
                                                            <div>
                                                                <h5>Ahamed</h5>
                                                                <p>HID: 58258 ahamed@gmail.com</p>
                                                            </div>
                                                            <div className="last-chat-time">
                                                                <small className="text-dark pr-2">15 min</small>
                                                                <div className="new-message-count"><i className="mdi mdi-facebook-messenger font-17"></i></div>
                                                                <a  data-bs-toggle="dropdown">
                                                                    <i className="fa fa-arrow-circle-right font-17  text-danger"></i>
                                                                </a>
                                                                <div className="dropdown-menu dropdown-menu-end assign-btn">
                                                                    <a  className="dropdown-item dream_profile_menu font-weight-bold">Assign to My Queue</a>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>

                                                </ul>
                                            </div>
                                        </div>
                                    </div> */}


                                    <div className="card">
                                        <div className="card-header" id="faqhead4">
                                            <a  className="btn btn-header-link" data-toggle="collapse" data-target="#faq4"
                                                aria-expanded="true" aria-controls="faq4">Normal Customer</a>  <span className="badge badge-light">{newCustomer.length}</span>
                                        </div>

                                        <div id="faq4" className="" aria-labelledby="faqhead4" data-parent="#faq">
                                            <div className="card-body">
                                                <ul className="user-list mt-2">
                                                    {
                                                        newCustomer && newCustomer.length > 0 ? newCustomer.map((data) => (
                                                            <li className="user-list-item user-normal">
                                                                <div className="avatar avatar-online">
                                                                    <div className="letter-avatar">
                                                                        A
                                                                    </div>
                                                                </div>
                                                                <div className="users-list-body">
                                                                    <div>
                                                                        <h5>{data.customerName}</h5>
                                                                        <p>HID: {data.chatId} {data?.emailId}</p>
                                                                    </div>
                                                                    <div className="last-chat-time">
                                                                        <small className="text-dark pr-2">15 min</small>
                                                                        <div className="new-message-count"><i className={`mdi ${data?.source === 'WHATSAPP' ? "mdi-whatsapp" : data?.source === 'FACEBOOK' ? "mdi-facebook-messenger" : data?.source === 'TELEGRAM' ? "mdi-telegram" : "mdi-chat"} font-17`}  ></i></div>
                                                                        <i className="fa fa-arrow-circle-right font-17  text-danger" onClick={(e) => assignCustomer(data.chatId)} ></i>
                                                                        {/* <div className="dropdown-menu dropdown-menu-end assign-btn">
                                                                            <a  className="dropdown-item dream_profile_menu font-weight-bold">Assign to My Queue</a>

                                                                        </div> */}
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )) : ""
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default NewQueue