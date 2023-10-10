import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import socketClient, { } from "socket.io-client";
import { AppContext } from "../../AppContext";
import { get, put, post } from "../../common/util/restUtil";
import { properties } from "../../properties";
import { toast } from "react-toastify";
import profile from '../../assets/images/profile.png'

import _ from "lodash";

const InteractionHistory = (props) => {

    const { selectedCustomer, interactionCustomerHistory, customerDetails, showCustomer } = props.data
    const {setShowCustomer}  = props?.handler

    return (
        <div className={ showCustomer ? "col-12 col-md-7 col-lg-7 col-xl-7 px-3 user-profile user-profile--large user-profile--show" : '"col-12 col-md-5 col-lg-4 col-xl-3 px-3 user-profile user-profile--large"'}>
            <div className="user-profile__close d-flex" onClick={()=>setShowCustomer(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="svg-icon" viewBox="0 0 38.8 38.9">
                    <g>
                        <path d="M2,38.9a1.9,1.9,0,0,1-1.4-.5,2.1,2.1,0,0,1,0-2.9L35.4.6a1.9,1.9,0,0,1,2.8,0,1.9,1.9,0,0,1,0,2.8L3.4,38.4A1.9,1.9,0,0,1,2,38.9Z" fill="#d87232" />
                        <path d="M36.8,38.9a1.9,1.9,0,0,1-1.4-.5L.6,3.4A1.9,1.9,0,0,1,.6.6,1.9,1.9,0,0,1,3.4.6L38.2,35.5a2.1,2.1,0,0,1,0,2.9A1.9,1.9,0,0,1,36.8,38.9Z" fill="#d87232" />
                    </g>
                </svg>
            </div>
            <div className="user-profile__wrapper">
                <div className="user-profile__avatar">
                    <img src={profile} alt="" loading="lazy" />
                </div>
                <div className="user-profile__details mt-1">
                    <span className="user-profile__name">{(customerDetails?.firstName || selectedCustomer?.customerName) || selectedCustomer?.contactNo}</span>
                    <span className="user-profile__phone">{selectedCustomer?.contactNo}</span>
                    {/* <span className="user-profile__location">Bangalore, India</span> */}
                </div>
                <hr className="cmmn-hline" />
                <div className="user-profile__description">
                    <div className="container-label">
                        <span className="label-container-style">Profile Number</span>
                        <span>{customerDetails?.customerNo || '-'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">Customer Type</span>
                        <span>{customerDetails?.customerCatDesc?.description || '-'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">ID Type</span>
                        <span>{customerDetails?.idTypeDesc?.description || '-'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">ID Value</span>
                        <span>{customerDetails?.idValue || '-'}</span>
                    </div>
                </div>
                <hr className="cmmn-hline" />
                <div className="inter-section clearfix">
                    <h4>Interaction History</h4>
                    <div className="total-inter clearfix">
                        <div className="total-his">
                            <p data-toggle="modal" data-target="#profile-detail">{interactionCustomerHistory?.totalInteractionCount || 0}</p>
                            <span>Total</span>
                        </div>
                        <div className="total-his">
                            <p data-toggle="modal" data-target="#profile-detail">{interactionCustomerHistory?.openInteraction || 0}</p>
                            <span>Open</span>
                        </div>
                        <div className="total-his">
                            <p data-toggle="modal" data-target="#profile-detail">{interactionCustomerHistory?.closedInteraction || 0}</p>
                            <span>Closed</span></div>
                    </div>
                    <div className="inter-action">
                        <button type="button" className="skel-btn-submit float-right"
                            href="#" style={{ "borderBottom": "1px solid rgb(204, 204, 204)" }} data-toggle="modal" data-target="#createprofile">
                            Create Interaction
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default InteractionHistory;