import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';

const VipCustomer = (props) => {
    return (
        <div className="card">
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
    );
}
export default VipCustomer;