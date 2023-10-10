import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import socketClient, { } from "socket.io-client";
import { AppContext } from "../../AppContext";
import { get, put, post } from "../../common/util/restUtil";
import { properties } from "../../properties";
import { toast } from "react-toastify";

import _ from "lodash";

const AvailableAgents = (props) => {

    const { availableAgents } = props?.data

    return (
        <div className="cust-header">
            <span className="messages-page__title">Available Agent ({availableAgents?.length})</span>
            <ul className="chat-list chat-height-fx">
                {availableAgents?.map((ele) => {
                    return <li className="chat-list-item user-emg">
                        <div className="avatar">
                            <div className="letter-avatar user-normal">
                                {ele?.first_name?.charAt(0)}
                            </div>
                            <div className="avatar-status-profile avatar-online"></div>
                        </div>
                        <div className="chat-list-body">
                            <div className="chat-cnt">
                                <h5>{ele?.first_name} {ele?.last_name}</h5>
                                <p>{ele?.connected} Users Connected</p>
                            </div>
                        </div>
                    </li>
                })}
                {/* <li className="chat-list-item user-emg">
                    <div className="avatar">
                        <div className="letter-avatar user-normal">
                            F
                        </div>
                        <div className="avatar-status-profile avatar-idle"></div>
                    </div>
                    <div className="chat-list-body">
                        <div className="chat-cnt">
                            <h5>Feroz</h5>
                            <p>0 Users Connected</p>
                        </div>
                    </div>
                </li>
                <li className="chat-list-item user-emg">
                    <div className="avatar">
                        <div className="letter-avatar user-normal">
                            M
                        </div>
                        <div className="avatar-status-profile avatar-offline"></div>
                    </div>
                    <div className="chat-list-body">
                        <div className="chat-cnt">
                            <h5>Mohamed</h5>
                            <p>0 Users Connected</p>
                        </div>
                    </div>
                </li>
                <li className="chat-list-item user-emg">
                    <div className="avatar">
                        <div className="letter-avatar user-normal">
                            A
                        </div>
                        <div className="avatar-status-profile avatar-busy"></div>
                    </div>
                    <div className="chat-list-body">
                        <div className="chat-cnt">
                            <h5>Ahamed</h5>
                            <p>0 Users Connected</p>
                        </div>
                    </div>
                </li>
                <li className="chat-list-item user-emg">
                    <div className="avatar">
                        <div className="letter-avatar user-normal">
                            F
                        </div>
                        <div className="avatar-status-profile avatar-busy"></div>
                    </div>
                    <div className="chat-list-body">
                        <div className="chat-cnt">
                            <h5>Feroz</h5>
                            <p>0 Users Connected</p>
                        </div>
                    </div>
                </li> */}
            </ul>
        </div>
    );
}
export default AvailableAgents;