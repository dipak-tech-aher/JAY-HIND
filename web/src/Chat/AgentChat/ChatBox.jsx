import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import socketClient, { } from "socket.io-client";
import { AppContext } from "../../AppContext";
import { get, put, post } from "../../common/util/restUtil";
import { properties } from "../../properties";
import { toast } from "react-toastify";

import _ from "lodash";

const ChatBox = (props) => {

    const { chatRef, connectedCustomer, selectedCustomer, message, showCustomer} = props.data
    const { handleSendMessage, setMessage, endChat, setShowCustomer } = props.handlers
    // console.log('connectedCustomer-------->', connectedCustomer)
    // console.log('selectedCustomer-------->', selectedCustomer)
    return (
        <div className="chat__container" ref={chatRef}>
            <div className="chat__wrapper mb-2 pb-4">
                <div className="chat__messaging messaging-member--online pb-2 pb-md-2 pl-1 pt-1 pr-1">
                    <div className="chat__previous d-flex d-md-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="svg-icon svg-icon--previous" viewBox="0 0 45.5 30.4">
                            <path d="M43.5,13.1H7l9.7-9.6A2.1,2.1,0,1,0,13.8.6L.9,13.5h0L.3,14v.6c0,.1-.1.1-.1.2v.4a2,2,0,0,0,.6,1.5l.3.3L13.8,29.8a2.1,2.1,0,1,0,2.9-2.9L7,17.2H43.5a2,2,0,0,0,2-2A2.1,2.1,0,0,0,43.5,13.1Z" fill="#f68b3c" />
                        </svg>
                    </div>
                    <div className="chat__notification d-flex d-md-none chat__notification--new">
                        <span>1</span>
                    </div>
                    <div className="chat__infos pl-2 pl-md-0">
                        <div className="chat-member__wrapper" data-online="true">
                            <div className="chat-member__avatar">
                                <img src="./assets/images/profile.png" alt="" loading="lazy" />
                                <div className="user-status user-status--large"></div>
                            </div>
                            <div className="chat-member__details">
                                <span className="chat-member__name">{selectedCustomer?.customerName || selectedCustomer?.contactNo}</span>
                                <span className="chat-member__status">Online</span>
                            </div>
                        </div>
                    </div>
                    {connectedCustomer && connectedCustomer?.map((ele) => selectedCustomer?.chatId === ele?.chatId ?
                        <button className="styl-btn-history btn-delete ml-1 mr-1" type="button"
                            onClick={(e) => endChat(ele.chatId, ele.message, ele.messageColorAlign)}>End Chat</button> : '')}
                    <div className="chat__actions mr-2" onClick={()=>{setShowCustomer(!showCustomer)}}>
                        <ul className="m-0">
                            <li className="chat__details d-flex d-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="svg-icon" viewBox="0 0 42.2 11.1">
                                    <g>
                                        <circle cx="5.6" cy="5.6" r="5.6" fill="#d87232" />
                                        <circle cx="21.1" cy="5.6" r="5.6" fill="#d87232" />
                                        <circle cx="36.6" cy="5.6" r="5.6" fill="#d87232" />
                                    </g>
                                </svg>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="chat__content pt-3 px-3">
                    <ul className="chat__list-messages" style={{ whiteSpace: "pre-line", width: "100%" }}>
                        {
                            connectedCustomer?.length > 0 ? connectedCustomer?.map((element, index) => (
                                selectedCustomer?.chatId === element?.chatId ?
                                    <>
                                        {
                                            element?.message?.map((value, index) => {
                                                console.log('value------>', value)
                                                return <div style={{ width: "100%", display: "inline-block" }}> <div style={{ float: element.messageColorAlign[index].textAlign }}>
                                                    {value.split('@@@')[0] === 'text' ?
                                                        <p style={{
                                                            listStyleType: "none", backgroundColor: element.messageColorAlign[index].bgColor, textAlign: "left",
                                                            borderRadius: "50px", padding: "12px 38px"
                                                        }} key={index} className="chat-box">{value.split('@@@')[1]}
                                                        </p>
                                                        :
                                                        value.split(',')[0] === 'media' ?
                                                            <></>
                                                            :
                                                            <p />
                                                    }
                                                </div>
                                                </div>
                                            })
                                        }
                                        <div ref={chatRef} />
                                    </>
                                    :
                                    ""
                            )) : ""
                        }
                        {/* {messageArr?.map((ele) => {
                            return <li>
                                <div className="chat__time">Yesterday at 16:43</div>
                                <div className="chat__bubble chat__bubble--you">
                                    Looking for booking an appointment.
                                    <div className="chat-tick">
                                        <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                    </div>
                                </div>
                            </li>
                        })} */}
                        {/*<li>
                            <div className="chat__bubble chat__bubble--me">
                                Hi! Follow the below steps to complete your booking!
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-tick.svg" alt="" className="" />
                                </div>
                            </div>

                        </li>
                        <li>
                            <div className="chat__bubble chat__bubble--me">
                                Select Event Type
                                <ul>
                                    <li>Interaction</li>
                                    <li>Order</li>
                                    <li>Payment</li>
                                </ul>
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                </div>
                            </div>
                            <div className="chat__bubble chat__bubble--you">
                                Event 1
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-tick.svg" alt="" className="" />
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="chat__bubble chat__bubble--me">
                                Select Appointment Type
                                <ul>
                                    <li>Direct</li>
                                    <li>VC</li>
                                    <li>AC</li>
                                </ul>
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                </div>
                            </div>
                            <div className="chat__bubble chat__bubble--you">
                                Direct
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="chat__bubble chat__bubble--me">
                                Select Locationn
                                <ul>
                                    <li>Brunei</li>
                                    <li>Chennai</li>
                                    <li>Bangalore</li>
                                </ul>
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                </div>
                            </div>
                            <div className="chat__bubble chat__bubble--you">
                                Brunei
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="chat__bubble chat__bubble--me">
                                Select date to book an appointment
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="chat__time">07:14</div>
                            <div className="chat__bubble chat__bubble--me">
                                <div className="mcalendar">

                                    <header>

                                        <h2>February</h2>

                                        <a className="mbtn-prev fontawesome-angle-left" href="#"></a>
                                        <a className="mbtn-next fontawesome-angle-right" href="#"></a>

                                    </header>

                                    <table>

                                        <thead>

                                            <tr>

                                                <td>Mo</td>
                                                <td>Tu</td>
                                                <td>We</td>
                                                <td>Th</td>
                                                <td>Fr</td>
                                                <td>Sa</td>
                                                <td>Su</td>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            <tr>
                                                <td className="prev-month">26</td>
                                                <td className="prev-month">27</td>
                                                <td className="prev-month">28</td>
                                                <td className="prev-month">29</td>
                                                <td className="prev-month">30</td>
                                                <td className="prev-month">31</td>
                                                <td>1</td>
                                            </tr>
                                            <tr>
                                                <td>2</td>
                                                <td>3</td>
                                                <td>4</td>
                                                <td>5</td>
                                                <td>6</td>
                                                <td>7</td>
                                                <td>8</td>
                                            </tr>
                                            <tr>
                                                <td>9</td>
                                                <td className="mevent">10</td>
                                                <td>11</td>
                                                <td>12</td>
                                                <td>13</td>
                                                <td>14</td>
                                                <td>15</td>
                                            </tr>
                                            <tr>
                                                <td>16</td>
                                                <td>17</td>
                                                <td>18</td>
                                                <td>19</td>
                                                <td>20</td>
                                                <td className="mevent">21</td>
                                                <td>22</td>
                                            </tr>

                                            <tr>
                                                <td className="mcurrent-day event">23</td>
                                                <td>24</td>
                                                <td>25</td>
                                                <td>26</td>
                                                <td>27</td>
                                                <td>28</td>
                                                <td>29</td>
                                            </tr>
                                            <tr>
                                                <td>30</td>
                                                <td className="next-month">1</td>
                                                <td className="next-month">2</td>
                                                <td className="next-month">3</td>
                                                <td className="next-month">4</td>
                                                <td className="next-month">5</td>
                                                <td className="next-month">6</td>
                                            </tr>

                                        </tbody>

                                    </table>

                                </div>
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                </div>
                            </div>
                            <div className="chat__bubble chat__bubble--me">
                                <ul>
                                    <li>08:00 AM to 10:00 AM</li>
                                    <li>04:00 PM to 06:00 PM</li>
                                </ul>
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                </div>
                            </div>

                        </li>
                        <li>
                            <div className="chat__bubble chat__bubble--me">
                                Your Booking Details:
                                Event Type: Interaction
                                Appointment Type: Direct
                                Location: Brunei
                                Appointment Date: Feb 17, 2023
                                Booked slots: 08:00 AM to 10:00 AM
                                <hr className="cmmn-line" />
                                <p>Type "YES" to Confirm</p>
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                </div>
                            </div>

                        </li>
                        <li>
                            <div className="chat__time">09:26</div>
                            <div className="chat__bubble chat__bubble--you">
                                YES
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="chat__bubble chat__bubble--me">
                                Your Appointment has been successfully booked.
                                <div className="chat-tick">
                                    <img src="./assets/images/chat-d-tick.svg" alt="" className="" />
                                </div>
                            </div>
                        </li> */}
                    </ul>
                </div>
                <div className="chat__send-container px-2 px-md-3 pt-1 pt-md-3">
                    <div className="custom-form__send-wrapper">
                        <input
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            type="text" className="form-control custom-form" id="message" placeholder="Type Here..." autocomplete="off"
                            value={message || ''}
                            onChange={(e) => {
                                setMessage(e.target.value);
                            }} />
                        {/* <div className="custom-form__send-img">
                            <svg xmlns="http://www.w3.org/2000/svg" className="svg-icon svg-icon--send-img" viewBox="0 0 45.7 45.7">
                                <path d="M6.6,45.7A6.7,6.7,0,0,1,0,39.1V6.6A6.7,6.7,0,0,1,6.6,0H39.1a6.7,6.7,0,0,1,6.6,6.6V39.1h0a6.7,6.7,0,0,1-6.6,6.6ZM39,4H6.6A2.6,2.6,0,0,0,4,6.6V39.1a2.6,2.6,0,0,0,2.6,2.6H39.1a2.6,2.6,0,0,0,2.6-2.6V6.6A2.7,2.7,0,0,0,39,4Zm4.7,35.1Zm-4.6-.4H6.6a2.1,2.1,0,0,1-1.8-1.1,2,2,0,0,1,.3-2.1l8.1-10.4a1.8,1.8,0,0,1,1.5-.8,2.4,2.4,0,0,1,1.6.7l4.2,5.1,6.6-8.5a1.8,1.8,0,0,1,1.6-.8,1.8,1.8,0,0,1,1.5.8L40.7,35.5a2,2,0,0,1,.1,2.1A1.8,1.8,0,0,1,39.1,38.7Zm-17.2-4H35.1l-6.5-8.6-6.5,8.4C22,34.6,22,34.7,21.9,34.7Zm-11.2,0H19l-4.2-5.1Z" fill="#f68b3c" />
                            </svg>
                        </div> */}
                        <div className="custom-form__send-emoji">
                            <svg xmlns="http://www.w3.org/2000/svg" className="svg-icon svg-icon--send-emoji" viewBox="0 0 46.2 46.2">
                                <path d="M23.1,0A23.1,23.1,0,1,0,46.2,23.1,23.1,23.1,0,0,0,23.1,0Zm0,41.6A18.5,18.5,0,1,1,41.6,23.1,18.5,18.5,0,0,1,23.1,41.6Zm8.1-20.8a3.5,3.5,0,0,0,3.5-3.5,3.5,3.5,0,0,0-7,0,3.5,3.5,0,0,0,3.5,3.5ZM15,20.8a3.5,3.5,0,0,0,3.5-3.5A3.5,3.5,0,0,0,15,13.9a3.4,3.4,0,0,0-3.4,3.4A3.5,3.5,0,0,0,15,20.8Zm8.1,15a12.6,12.6,0,0,0,10.5-5.5,1.7,1.7,0,0,0-1.3-2.6H14a1.7,1.7,0,0,0-1.4,2.6A12.9,12.9,0,0,0,23.1,35.8Z" fill="#f68b3c" />
                            </svg>
                        </div>
                        <button type="button" className="custom-form__send-submit"

                            onClick={handleSendMessage}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="svg-icon svg-icon--send" viewBox="0 0 45.6 45.6">
                                <g>
                                    <path d="M20.7,26.7a1.4,1.4,0,0,1-1.2-.6,1.6,1.6,0,0,1,0-2.4L42.6.5a1.8,1.8,0,0,1,2.5,0,1.8,1.8,0,0,1,0,2.5L21.9,26.1A1.6,1.6,0,0,1,20.7,26.7Z" fill="#d87232" />
                                    <path d="M29.1,45.6a1.8,1.8,0,0,1-1.6-1L19.4,26.2,1,18.1a1.9,1.9,0,0,1-1-1.7,1.8,1.8,0,0,1,1.2-1.6L43.3.1a1.7,1.7,0,0,1,1.8.4,1.7,1.7,0,0,1,.4,1.8L30.8,44.4a1.8,1.8,0,0,1-1.6,1.2ZM6.5,16.7l14.9,6.6a2,2,0,0,1,.9.9l6.6,14.9L41,4.6Z" fill="#d87232" />
                                </g>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ChatBox;