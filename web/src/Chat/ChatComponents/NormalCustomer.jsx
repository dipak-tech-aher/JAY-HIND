import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';

const NormalCustomer = (props) => {
    return (
        <div className="card">
            <div className="card-header" id="faqhead4">
                <a  className="btn btn-header-link" data-toggle="collapse" data-target="#faq4"
                    aria-expanded="true" aria-controls="faq4">Normal Customer</a>  <span className="badge badge-light">8</span>
            </div>

            <div id="faq4" className="" aria-labelledby="faqhead4" data-parent="#faq">
                <div className="card-body">
                    <ul className="user-list mt-2">
                        <li className="user-list-item user-normal">
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
                        <li className="user-list-item user-normal">
                            <div className="avatar avatar-online">
                                <div className="letter-avatar">
                                    F
                                </div>
                            </div>
                            <div className="users-list-body">
                                <div>
                                    <h5>Feroz</h5>
                                    <p>HID: 85258 feroz@gmail.com</p>
                                </div>
                                <div className="last-chat-time">
                                    <small className="text-dark pr-2">15 min</small>
                                    <div className="new-message-count"><i className="mdi mdi-whatsapp font-17"></i></div>
                                    <a  data-bs-toggle="dropdown">
                                        <i className="fa fa-arrow-circle-right font-17  text-success"></i>
                                    </a>
                                    <div className="dropdown-menu dropdown-menu-end assign-btn">
                                        <a  className="dropdown-item dream_profile_menu font-weight-bold">Assign to My Queue</a>

                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="user-list-item user-normal">
                            <div className="avatar avatar-away">
                                <div className="letter-avatar">
                                    M
                                </div>
                            </div>
                            <div className="users-list-body">
                                <div>
                                    <h5>Mohamed</h5>
                                    <p>HID: 85214 mohamed@gmail.com</p>
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
                        <li className="user-list-item user-normal">
                            <div className="avatar avatar-online">
                                <div className="letter-avatar">
                                    A
                                </div>
                            </div>
                            <div className="users-list-body">
                                <div>
                                    <h5>Abdul Rahman</h5>
                                    <p>HID: 65214 abdul@gmail.com</p>
                                </div>
                                <div className="last-chat-time">
                                    <small className="text-dark pr-2">15 min</small>
                                    <div className="new-message-count"><i className="mdi mdi-whatsapp font-17"></i></div>
                                    <a  data-bs-toggle="dropdown">
                                        <i className="fa fa-arrow-circle-right font-17  text-success"></i>
                                    </a>
                                    <div className="dropdown-menu dropdown-menu-end assign-btn">
                                        <a  className="dropdown-item dream_profile_menu font-weight-bold">Assign to My Queue</a>

                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="user-list-item user-normal">
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
                        <li className="user-list-item user-normal">
                            <div className="avatar avatar-online">
                                <div className="letter-avatar">
                                    F
                                </div>
                            </div>
                            <div className="users-list-body">
                                <div>
                                    <h5>Feroz</h5>
                                    <p>HID: 85258 feroz@gmail.com</p>
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
                        <li className="user-list-item user-normal">
                            <div className="avatar avatar-away">
                                <div className="letter-avatar">
                                    M
                                </div>
                            </div>
                            <div className="users-list-body">
                                <div>
                                    <h5>Mohamed</h5>
                                    <p>HID: 85214 mohamed@gmail.com</p>
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
                        <li className="user-list-item user-normal">
                            <div className="avatar avatar-online">
                                <div className="letter-avatar">
                                    A
                                </div>
                            </div>
                            <div className="users-list-body">
                                <div>
                                    <h5>Abdul Rahman</h5>
                                    <p>HID: 65214 abdul@gmail.com</p>
                                </div>
                                <div className="last-chat-time">
                                    <small className="text-dark pr-2">15 min</small>
                                    <div className="new-message-count"><i className="mdi mdi-whatsapp font-17"></i></div>
                                    <a  data-bs-toggle="dropdown">
                                        <i className="fa fa-arrow-circle-right font-17  text-success"></i>
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
export default NormalCustomer;