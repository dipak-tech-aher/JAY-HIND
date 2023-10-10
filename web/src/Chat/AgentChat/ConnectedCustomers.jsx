import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import socketClient, { } from "socket.io-client";
import { AppContext } from "../../AppContext";
import { get, put, post } from "../../common/util/restUtil";
import { properties } from "../../properties";
import { toast } from "react-toastify";
import profileLogo from '../../assets/images/profile.png'
import crownLogo from '../../assets/images/icons/crowns.png'
import sirenLogo from '../../assets/images/icons/siren.png'


import _ from "lodash";

const ConnectedCustomers = (props) => {
    const { connectedCustomer } = props.data;
    const { selectCustomer } = props.handlers;
    // console.log('connectedCustomer--------->', connectedCustomer);
    const [telegramChat, setTelegramChat] = useState([]);
    const [whatsappChat, setWhatsappChat] = useState([]);
    const [facebookChat, setFacebookChat] = useState([]);
    const [liveChat, setLiveChat] = useState([]);
    const [mobileChat, setMobileChat] = useState([]);

    useEffect(() => {
        setTelegramChat(connectedCustomer?.filter((ele) => ele.chatSource === 'TELGRAM-CHAT'))
        setWhatsappChat(connectedCustomer?.filter((ele) => ele.chatSource === 'WHATSAPP-CHAT'))
        setFacebookChat(connectedCustomer?.filter((ele) => ele.chatSource === 'FACEBOOK-CHAT'))
        setLiveChat(connectedCustomer?.filter((ele) => ele.chatSource === 'LIVECHAT'))
        setMobileChat(connectedCustomer?.filter((ele) => ele.chatSource === 'MOBILE-CHAT'))
    }, [props])

    return (
        <div className="cust-header">
            <span className="messages-page__title">Connected Customers ({connectedCustomer?.length})</span>
            <div className="tabbable">
                <ul className="nav nav-tabs skel-chat-tabs-base" id="myTab" role="tablist">
                    <li className="nav-item chat-list-badge">
                        <a className="nav-link" id="whatsapp-tab" data-toggle="tab" href="#whatsappTab" role="tab" aria-controls="UBC" aria-selected="false"><i className="fab fa-whatsapp"></i> <span className="badge badge--info">{whatsappChat?.length}</span></a>
                    </li>
                    <li className="nav-item chat-list-badge">
                        <a className="nav-link" id="livechat-tab" data-toggle="tab" href="#livechatTab" role="tab"
                            aria-controls="UBC" aria-selected="false"><i className="fas fa-comment-dots"></i> <span
                                className="badge badge--info">{liveChat?.length}</span></a>
                    </li>
                    <li className="nav-item chat-list-badge">
                        <a className="nav-link" id="mobile-Tab" data-toggle="tab" href="#mobileTab" role="tab"
                            aria-controls="UBC" aria-selected="false"><i className="fas fa-mobile-alt"></i> <span
                                className="badge badge--info">{mobileChat?.length}</span></a>
                    </li>
                    <li className="nav-item chat-list-badge">
                        <a className="nav-link" id="facebook-Tab" data-toggle="tab" href="#facebookTab" role="tab" aria-controls="UBC" aria-selected="false"><i className="fab fa-facebook"></i> <span className="badge badge--info">{facebookChat?.length}</span></a>
                    </li>
                    <li className="nav-item chat-list-badge">
                        <a className="nav-link active" id="telegram-tab" data-toggle="tab" href="#telegramTab" role="tab" aria-controls="BC" aria-selected="true"><i className="fab fa-telegram"></i> <span className="badge badge--info">{telegramChat?.length}</span></a>
                    </li>
                </ul>
            </div>
            <div className="tab-content">
                <div className="tab-pane fade show active" id="telegramTab" role="tabpanel" aria-labelledby="telegram-tab">
                    <ul className="chat-list chat-avatar">
                        {telegramChat?.map((ele) => {
                            return <li className="chat-list-item avatar-only">
                                <div className="avatar">
                                    <div className="avatar-img">
                                        <img src={profileLogo} alt="" />
                                    </div>
                                    <span className="vusericon2"><img src={crownLogo} alt="" /></span>
                                    <div className="avatar-status-profile avatar-online"></div>
                                </div>
                                <div className="chat-cnt">
                                    <h5>{ele?.customerName || ele?.contactNo || ele?.chatId}</h5>
                                </div>
                            </li>
                        })}
                        {/* <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={crownLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Mohamed Ahamed</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={crownLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Johnson</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={crownLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Mohamed</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={crownLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Prakash</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={crownLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Ahamed</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={crownLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Ahamed</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={crownLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Ahamed</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={crownLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Ahamed</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={crownLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li> */}
                    </ul>
                </div>
                <div className="tab-pane fade" id="whatsappTab" role="tabpanel" aria-labelledby="whatsapp-tab">
                    <ul className="chat-list chat-avatar">
                        {whatsappChat?.map((ele) => {
                            return <li className="chat-list-item avatar-only">
                                <div className="avatar">
                                    <div className="avatar-img">
                                        <img src={profileLogo} alt="" />
                                    </div>
                                    <span className="vusericon2"><img src={sirenLogo} alt="" /></span>
                                    <div className="avatar-status-profile avatar-online"></div>
                                </div>
                                <div className="chat-cnt">
                                    <h5>{ele?.customerName || ele?.contactNo || ele?.chatId}</h5>
                                </div>
                            </li>
                        })}
                        {/* <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={sirenLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li> */}
                    </ul>
                </div>
                <div className="tab-pane fade" id="facebookTab" role="tabpanel" aria-labelledby="facebook-Tab">
                    <ul className="chat-list chat-avatar">
                        {facebookChat?.map((ele) => {
                            return <li className="chat-list-item avatar-only">
                                <div className="avatar">
                                    <div className="avatar-img">
                                        <img src={profileLogo} alt="" />
                                    </div>
                                    <div className="avatar-status-profile avatar-online"></div>
                                </div>
                                <div className="chat-cnt">
                                    <h5>{ele?.customerName || ele?.contactNo || ele?.chatId}</h5>
                                </div>
                            </li>
                        })}
                        {/* <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li>

                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li>
                        <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li> */}
                    </ul>
                </div>
                <div className="tab-pane fade" id="livechatTab" role="tabpanel" aria-labelledby="livechat-tab">
                    <ul className="chat-list chat-avatar">
                        {liveChat?.map((ele) => {
                            return <li className="chat-list-item avatar-only" onClick={(e) => selectCustomer(ele?.chatId)} >
                                <div className="avatar">
                                    <div className="avatar-img">
                                        <img src={profileLogo} alt="" />
                                    </div>
                                    <div className="avatar-status-profile avatar-online"></div>
                                </div>
                                <div className="chat-cnt">
                                    <h5>{ele?.customerName || ele?.contactNo || ele?.chatId}</h5>
                                </div>
                            </li>
                        })}
                        {/* <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={sirenLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li> */}
                    </ul>
                </div>
                <div className="tab-pane fade" id="mobileTab" role="tabpanel" aria-labelledby="mobile-tab">
                    <ul className="chat-list chat-avatar">
                        {mobileChat?.map((ele) => {
                            // console.log('ele----->', ele?.chatId)
                            return <li className="chat-list-item avatar-only" onClick={(e) => selectCustomer(ele?.chatId)} >
                                <div className="avatar">
                                    <div className="avatar-img">
                                        <img src={profileLogo} alt="" />
                                    </div>
                                    <div className="avatar-status-profile avatar-online"></div>
                                </div>
                                <div className="chat-cnt">
                                    <h5>{ele?.customerName || ele?.contactNo || ele?.chatId}</h5>
                                </div>
                            </li>
                        })}
                        {/* <li className="chat-list-item avatar-only">
                            <div className="avatar">
                                <div className="avatar-img">
                                    <img src={profileLogo} alt="" />
                                </div>
                                <span className="vusericon2"><img src={sirenLogo} alt="" /></span>
                                <div className="avatar-status-profile avatar-online"></div>
                            </div>
                            <div className="chat-cnt">
                                <h5>Abdul Rahman</h5>
                            </div>
                        </li> */}
                    </ul>
                </div>
            </div>
        </div>
    );
}
export default ConnectedCustomers;