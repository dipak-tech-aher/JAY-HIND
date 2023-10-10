import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import socketClient, { } from "socket.io-client";
import { AppContext } from "../../AppContext";
import { get, put, post } from "../../common/util/restUtil";
import { properties } from "../../properties";
import { toast } from "react-toastify";
import profile from '../../assets/images/profile.png'

import _ from "lodash";

const ChatQueue = (props) => {

    const { newCustomer, isRefresh } = props.data;
    const { assignCustomer, setIsRefresh } = props.handlers;
    const [telegramChat, setTelegramChat] = useState([]);
    const [whatsappChat, setWhatsappChat] = useState([]);
    const [facebookChat, setFacebookChat] = useState([]);
    const [liveChat, setLiveChat] = useState([]);
    const [mobileChat, setMobileChat] = useState([]);

    useEffect(() => {
        setTelegramChat(newCustomer?.filter((ele) => ele.chatSource === 'TELGRAM-CHAT'))
        setWhatsappChat(newCustomer?.filter((ele) => ele.chatSource === 'WHATSAPP-CHAT'))
        setFacebookChat(newCustomer.length > 0 && newCustomer?.filter((ele) => ele.chatSource === 'FACEBOOK-CHAT'))
        setLiveChat(newCustomer?.filter((ele) => ele.chatSource === 'LIVECHAT'))
        setMobileChat(newCustomer?.filter((ele) => ele.chatSource === 'MOBILE-CHAT'))
    }, [props])
    return (
        <div className="chat-left-sect">
            <div className="cust-header">
                <span className="messages-page__title">Total Chat Queue ({newCustomer?.length})  </span>
                {/* <i className="material-icons" onClick={() =>
                    setIsRefresh(!isRefresh)}>refresh</i> */}
                <div className="tabbable">
                    <ul className="nav nav-tabs skel-chat-tabs-base" id="myTab" role="tablist">
                        <li className="nav-item chat-list-badge">
                            <a className="nav-link" id="all-tab" data-toggle="tab" href="#allchat" role="tab" aria-controls="UBC" aria-selected="false">All <span className="badge badge--info">2</span></a>
                        </li>
                        <li className="nav-item chat-list-badge">
                            <a className="nav-link" id="whatsapp-tab" data-toggle="tab" href="#whatsappChat" role="tab" aria-controls="UBC" aria-selected="false"><i className="fab fa-whatsapp"></i> <span className="badge badge--info">{newCustomer?.filter((ele) => ele?.chatSource === 'WHATSAPP-CHAT').length}</span></a>
                        </li>
                        <li className="nav-item chat-list-badge">
                            <a className="nav-link" id="livechat-tab" data-toggle="tab" href="#liveChat" role="tab" aria-controls="UBC"
                                aria-selected="false"><i className="fas fa-comment-dots"></i> <span className="badge badge--info">{newCustomer?.filter((ele) => ele?.chatSource === 'LIVECHAT').length}</span></a>
                        </li>
                        <li className="nav-item chat-list-badge">
                            <a className="nav-link" id="mobile-tab" data-toggle="tab" href="#mobileChat" role="tab" aria-controls="UBC"
                                aria-selected="false"><i className="fas fa-mobile-alt"></i> <span className="badge badge--info">{newCustomer?.filter((ele) => ele?.chatSource === 'MOBILE-CHAT').length}</span></a>
                        </li>
                        <li className="nav-item chat-list-badge">
                            <a className="nav-link" id="facebook-tab" data-toggle="tab" href="#facebookChat" role="tab" aria-controls="UBC" aria-selected="false"><i className="fab fa-facebook"></i> <span className="badge badge--info">{newCustomer?.filter((ele) => ele?.chatSource === 'FACEBOOK-CHAT').length}</span></a>
                        </li>
                        <li className="nav-item chat-list-badge">
                            <a className="nav-link active" id="telegram-tab" data-toggle="tab" href="#telegramChat" role="tab" aria-controls="BC" aria-selected="true"><i className="fab fa-telegram"></i> <span className="badge badge--info">{newCustomer?.filter((ele) => ele?.chatSource === 'TELEGRAM-CHAT').length}</span></a>
                        </li>
                    </ul>
                </div>
                <div className="tab-content">
                    <div className="tab-pane fade show active" id="telegramChat" role="tabpanel" aria-labelledby="telegram-tab">
                        <ul className="chat-list">
                            {telegramChat?.length > 0 ? telegramChat.map((ele) => {
                                return <li className="chat-list-item user-emg" onClick={(e) => assignCustomer(ele.chatId)}>
                                    <div className="avatar">
                                        <div className="avatar-img">
                                            <img src={profile} alt="" />
                                        </div>
                                        <div className="avatar-status-profile avatar-online"></div>
                                    </div>
                                    <div className="chat-list-body assign-chat">
                                        <div className="chat-cnt">
                                            <h5>{ele?.customerName || ele?.category}</h5>
                                            <p>ID: {ele?.chatId || '-'} {ele?.emailId || '-'}{ele?.contactNo}</p>
                                        </div>
                                        <div className="avatar-channel">
                                            <i className="fab fa-telegram"></i>
                                        </div>
                                    </div>
                                </li>
                            })
                                : <span className='skel-widget-warning'>No Telegram Chats Found</span>}
                        </ul>
                    </div>

                    <div className="tab-pane fade show" id="whatsappChat" role="tabpanel" aria-labelledby="whatsapp-tab">
                        <ul className="chat-list">
                            {whatsappChat?.length > 0 ? whatsappChat.map((ele) => {
                                return <li className="chat-list-item user-emg" onClick={(e) => assignCustomer(ele.chatId)}>
                                    <div className="avatar">
                                        <div className="avatar-img">
                                            <img src={profile} alt="" />
                                        </div>
                                        <div className="avatar-status-profile avatar-online"></div>
                                    </div>
                                    <div className="chat-list-body assign-chat">
                                        <div className="chat-cnt">
                                            <h5>{ele?.customerName || ele?.category}</h5>
                                            <p>ID: {ele?.chatId} {ele?.emailId}</p>
                                        </div>
                                        <div className="avatar-channel">
                                            <i className="fab fa-whatsapp"></i>
                                        </div>
                                    </div>
                                </li>
                            })
                                : <span className='skel-widget-warning'>No Whatsapp Chats Found</span>}
                        </ul>
                    </div>

                    <div className="tab-pane fade" id="facebookChat" role="tabpanel" aria-labelledby="facebook-tab">
                        <ul className="chat-list">
                            {facebookChat?.length > 0 ? facebookChat.map((ele) => {
                                return <li className="chat-list-item user-emg" onClick={(e) => assignCustomer(ele.chatId)}>
                                    <div className="avatar">
                                        <div className="avatar-img">
                                            <img src={profile} alt="" />
                                        </div>
                                        <div className="avatar-status-profile avatar-online"></div>
                                    </div>
                                    <div className="chat-list-body assign-chat">
                                        <div className="chat-cnt">
                                            <h5>{ele?.customerName || ele?.category}</h5>
                                            <p>ID: {ele?.chatId} {ele?.emailId}</p>
                                        </div>
                                        <div className="avatar-channel">
                                            <i className="fab fa-facebook"></i>
                                        </div>
                                    </div>
                                </li>
                            })
                                : <span className='skel-widget-warning'>No Facebook Chats Found</span>}
                        </ul>
                    </div>

                    <div className="tab-pane fade" id="liveChat" role="tabpanel" aria-labelledby="livechat-tab">
                        <ul className="chat-list">
                            {liveChat?.length > 0 ? liveChat.map((ele) => {
                                return <li className="chat-list-item user-emg" onClick={(e) => assignCustomer(ele.chatId)}>
                                    <div className="avatar">
                                        <div className="avatar-img">
                                            <img src={profile} alt="" />
                                        </div>
                                        <div className="avatar-status-profile avatar-online"></div>
                                    </div>
                                    <div className="chat-list-body assign-chat">
                                        <div className="chat-cnt">
                                            <h5>{ele?.customerName || ele?.category}</h5>
                                            <p>ID: {ele?.chatId} {ele?.emailId}</p>
                                        </div>
                                        {/* <div className="avatar-channel">
                                            <i className="fas fa-comment-dots"></i>
                                        </div> */}
                                    </div>
                                </li>
                            })
                                : <span className='skel-widget-warning'>No Live Chats Found</span>
                            }
                        </ul>
                    </div>

                    <div className="tab-pane fade" id="mobileChat" role="tabpanel" aria-labelledby="mobile-tab">
                        <ul className="chat-list">
                            {mobileChat?.length > 0 ? mobileChat.map((ele) => {
                                return <li className="chat-list-item user-emg" onClick={(e) => assignCustomer(ele.chatId)}>
                                    <div className="avatar">
                                        <div className="avatar-img">
                                            <img src={profile} alt="" />
                                        </div>
                                        <div className="avatar-status-profile avatar-online"></div>
                                    </div>
                                    <div className="chat-list-body assign-chat">
                                        <div className="chat-cnt">
                                            <h5>{ele?.customerName || ele?.category}</h5>
                                            <p>ID: {ele?.chatId} {ele?.emailId}</p>
                                        </div>
                                        <div className="avatar-channel">
                                            <i className="fas fa-mobile-alt"></i>
                                        </div>
                                    </div>
                                </li>
                            })
                                : <span className='skel-widget-warning'>No Mobile Chats Found</span>
                            }
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
export default ChatQueue;