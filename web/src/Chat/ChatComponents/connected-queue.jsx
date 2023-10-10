import React, { useEffect, useState } from 'react'
import Avatar1 from '../../assets/img/avatar/avatar-2.jpg'
import { properties } from '../../properties'
import { get } from '../../common/util/restUtil'
const ConnectedChat = (props) => {

    const { connectedCustomer = [], connectedAgents = [] } = props.data
    const { selectCustomer } = props.handler
    console.log('connectedCustomer==', connectedCustomer)
    return (
        <div className="right-sidebar right_sidebar_profile col-md-4" id="middle1">

            <div className="connect-customer">

                {/* <div className="card-section">
                    <div className="card-header2">
                        <h3>Connected VIP Customers</h3><span className="badge badge-light">3</span>
                    </div>


                    <div className="card-body2">
                        <div id="prof1" className="user-prof clearfix">
                            <ul>
                                <li className="vip-user trigger">
                                    <div className="tooltip">
                                        <p>Name: Aalliyah Rahman</p>
                                        <p>HID: 568521</p>
                                        <p>Email: aalliyah@comquest.com</p>
                                    </div>
                                    <span className="vusericon2"><img src="/assets/images/icons/crowns.png" alt="" /></span><a ><img src="/assets/img/avatar/avatar-7.jpg" alt="" /></a><span>Rahim</span><span className="ucount">1</span><div className="avatar avatar-online"></div>
                                </li>
                                <li className="vip-user"><span className="vusericon2"><img src="/assets/images/icons/crowns.png" alt="" /></span><a ><img src="/assets/img/avatar/avatar-2.jpg" alt="" /></a><span>Abdul</span><span className="ucount">2</span><div className="avatar avatar-online"></div></li>
                                <li className="vip-user"><span className="vusericon2"><img src="/assets/images/icons/crowns.png" alt="" /></span><a ><img src="/assets/img/avatar/avatar-4.jpg" alt="" /></a><span>Raafiya</span><span className="ucount">3</span><div className="avatar avatar-online"></div></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="card-section">
                    <div className="card-header2">
                        <h3>Connected Emergency Customers</h3><span className="badge badge-light">2</span>
                    </div>
                    <div className="card-body2">
                        <div id="prof1" className="user-prof clearfix">
                            <ul>
                                <li className="emerg-user"><span className="eusericon2"><img src="./assets/images/icons/siren.png" alt="" /></span><a ><img src="assets/img/avatar/avatar-4.jpg" alt="" /></a><span>Aalliyah</span><span className="ucount">1</span><div className="avatar avatar-online"></div></li>
                                <li className="emerg-user"><span className="eusericon2"><img src="./assets/images/icons/siren.png" alt="" /></span><a ><img src="assets/img/avatar/avatar-8.jpg" alt="" /></a><span>Ashika</span><span className="ucount">2</span><div className="avatar avatar-online"></div></li>

                            </ul>
                        </div>
                    </div>
                </div> */}

                <div className="card-section">
                    <div className="card-header2">
                        <h3>Connected Customers</h3><span className="badge badge-light">{connectedCustomer.length}</span>
                    </div>
                    <div className="card-body2">
                        <div id="prof1" className="user-prof clearfix">
                            <ul className="avatar-icons clearfix">
                                {
                                    connectedCustomer && connectedCustomer.length > 0 ? connectedCustomer.map((data) => (
                                        <li><img src={Avatar1} alt="" onClick={(e) => selectCustomer(data.chatId)} />
                                            <span>{data?.customerName}</span>
                                            <div className="avatar avatar-online">
                                            </div>
                                        </li>

                                    )) : ""
                                }
                            </ul>
                        </div>
                    </div>
                </div>


                <div className="card-section">
                    <div className="card-header2">
                        <h3>Available Agents</h3><span className="badge badge-light">{connectedAgents.length}</span>
                    </div>
                    <div className="card-body2 bg-color">
                        <div id="prof1" className="user-prof clearfix">
                            <ul className="user-list mt-2">
                                {connectedAgents && connectedAgents.length > 0 ? connectedAgents.map((data) => (

                                    <li className="user-list-item user-normal">
                                        <div className="avatar avatar-busy">
                                            <div className="letter-avatar">
                                                {data.firstName.toString().substr(0, 1).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="users-list-body">
                                            <div>
                                                <h5>{data.firstName}</h5>
                                                <p>Connected {data.connected} Customers</p>
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


    )
}

export default ConnectedChat