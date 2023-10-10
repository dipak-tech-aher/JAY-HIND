import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';

const Emergency = (props) => {
    return (
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
        </div>
    );
}
export default Emergency;