import { saveAs } from 'file-saver';
import React, { useEffect, useState, useRef } from "react";
import UrlImageDownloader from 'react-url-image-downloader'
import AgentAvatar from '../../assets/img/avatar/avatar-2.jpg'
import StopIcon from '../../assets/img/end-chat-icon.png'
import SpamIcon from '../../assets/img/spam-icon.png'
import ImageDownlodIcon from '../../assets/img/chat-download.jpg'
import { properties } from "../../properties";
import { get } from "../../common/util/restUtil";
import CannedMessageModal from "../../HelpdeskAndInteraction/Helpdesk/CannedMessageModal";
import CreateInteraction from "../../HelpdeskAndInteraction/Helpdesk/interactionModal";
const ChatSection = (props) => {
    const { selectedCustomer, connectedCustomer = [], message, connectedAgents = [], chatRef } = props.data
    const { setMessage, handleChangeStatus, handleSendMessage, endChat, reAssignCustomer } = props.handler
    const totalInteraction = useRef("");
    const openInteraction = useRef("");
    const closedInteraction = useRef("");
    const [isOpen, setIsOpen] = useState(false);
    const [agentId, setAgentId] = useState(false);

    console.log('chat id===>', selectedCustomer?.chatId)
    const togglePopup = () => {
        console.log('isOpen ', isOpen)
        setIsOpen(!isOpen);
    }

    const [isCannedOpen,setIsCannedOpen] = useState(false)
    const handleCannedMessage = () => {
        setIsCannedOpen(true)
    }
    
    const [createInteraction, setCreateInteraction] = useState(false);
    const handleCreateInteraction = () => {
        setCreateInteraction(true)
    }

    const [isSearchMessageOpen,setIsSearchMessageOpen] = useState(false)
    const handleSearchMessage = () => {
        setIsSearchMessageOpen(!isSearchMessageOpen)
    }
    const popupRef = useRef(null);
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [popupRef]);

    useEffect(() => {
        console.log('customer Id is ', selectedCustomer.customerId)
        get(properties.CHAT_API + '/interactionHistory?customerId=' + selectedCustomer?.customerId).then((resp) => {
            console.log(resp.data)
            if (resp.status === 200) {
                totalInteraction.current = resp.data[0]?.total || 0
                openInteraction.current = resp.data[0]?.openinteractions || 0
                closedInteraction.current = resp.data[0]?.closedinteractions || 0
            }
        }).catch((error) => {
            console.log(error)
        })
    }, []);


    const convertBase64ToFile = (base64String, fileName) => {
        let arr = base64String.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let uint8Array = new Uint8Array(n);
        while (n--) {
            uint8Array[n] = bstr.charCodeAt(n);
        }
        let file = new File([uint8Array], fileName, { type: mime });
        return file;
    }

    const downloadBase64Data = (base64String, fileName) => {
        let file = convertBase64ToFile(base64String, fileName);
        saveAs(file, fileName);
    }



    // console.log('connectedCustomer==', connectedCustomer)
    return (
        <div className="chat chat-section col-md-4" id="middle">

            <div className="customer-details">
                <h3>Customer Details</h3>
                <button type="button" className="close" onClick="$('.customer-details').hide();" data-dismiss="modal" aria-hidden="true">×</button>

                <div className="row">
                    <div className="col-md-12 bg-color">
                        <div className="form-group">
                            <label htmlFor="customerNumber" className="col-form-label">Full Name :</label>
                            <p>{selectedCustomer?.customerInfo && selectedCustomer?.customerInfo?.customerName ? selectedCustomer?.customerInfo?.customerName : selectedCustomer?.customerName}</p>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="customerNumber" className="col-form-label">Email :</label>
                            <p>{selectedCustomer?.emailId ? selectedCustomer?.emailId : '-'}</p>
                        </div>
                    </div>
                    <div className="col-md-6 bg-color">
                        <div className="form-group">
                            <label htmlFor="customerNumber" className="col-form-label">Profile Number :</label>
                            <p>{selectedCustomer?.customerId ? selectedCustomer?.customerId : '-'}</p>
                        </div>
                    </div>
                    <div className="col-md-6 bg-color">
                        <div className="form-group">
                            <label htmlFor="customerNumber" className="col-form-label">Customer Type :</label>
                            <p>{selectedCustomer?.customerInfo && selectedCustomer?.customerInfo?.customerType ? selectedCustomer?.customerInfo?.customerType === "RES" ? 'Residential' : selectedCustomer?.customerInfo?.customerType : '-'}</p>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="customerNumber" className="col-form-label">Contact Number :</label>
                            <p>{selectedCustomer?.contactNo ? selectedCustomer?.contactNo : '-'}</p>
                        </div>
                    </div>


                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="customerNumber" className="col-form-label">Contact Preference :</label>
                            <p>Email</p>
                        </div>
                    </div>

                    <div className="col-md-6 bg-color">
                        <div className="form-group">
                            <label htmlFor="customerNumber" className="col-form-label">ID Type :</label>
                            <p>Passport</p>
                        </div>
                    </div>
                    <div className="col-md-6 bg-color">
                        <div className="form-group">
                            <label htmlFor="customerNumber" className="col-form-label">ID Value :</label>
                            <p>{selectedCustomer?.idValue ? selectedCustomer?.idValue : '-'}</p>
                        </div>
                    </div>

                </div>

                <h3>Interaction History</h3>
                <div className="inter-section clearfix">
                    <div className="total-inter clearfix">
                        <div className="total-his">
                            <p data-toggle="modal" data-target="#profile-detail">{totalInteraction.current}</p>
                            <span>Total</span>
                        </div>
                        <div className="total-his">
                            <p data-toggle="modal" data-target="#profile-detail">{openInteraction.current}</p>
                            <span>Open</span>
                        </div>
                        <div className="total-his">
                            <p data-toggle="modal" data-target="#profile-detail">{closedInteraction.current}</p>
                            <span>Closed</span>
                        </div>
                    </div>

                    <div className="inter-action"><button type="button" className="skel-btn-submit float-right"  style={{ borderBottom: "1px solid #ccc" }} data-toggle="modal" data-target="#createprofile" onClick={handleCreateInteraction}>Create Interaction</button></div>
                </div>

            </div>


            <div className="slimScrollDiv" style={{ position: "relative", overflow: "hidden", width: "100%", height: "444px" }}>
                <div className="slimscroll" style={{ overflow: "hidden", width: "100%", height: "514px" }}>
                    <div className="chat-header">
                        <div className="user-details">
                            <div className="d-lg-none ms-2">
                                <ul className="list-inline mt-2 me-2">
                                    <li className="list-inline-item">
                                        <a className="text-muted px-0 left_side"  data-chat="open">
                                            <i className="fas fa-arrow-left"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="avatar2 avatar-online2">
                                <span className="eusericon2"><img src="./assets/images/icons/siren.png" alt="" /></span>
                                <a ><img src="assets/img/avatar/avatar-4.jpg" alt="" /></a>
                            </div>
                            {
                                selectedCustomer && selectedCustomer.message ? (
                                    <div className="mt-1 pl-1 user-name">
                                        <h5>{selectedCustomer.customerInfo && selectedCustomer.customerInfo.customerName ? selectedCustomer.customerInfo.customerName : selectedCustomer.customerName}</h5>
                                        <small className="online">
                                            Connected
                                        </small>
                                        <p>Critical Hashtag -<span>#Urgent, #Emergency Help</span></p>
                                    </div>
                                ) : ""
                            }
                        </div>
                        <div className="chat-options">
                            <ul className="list-inline">
                                <li className="list-inline-item" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Search">
                                    <a href="javascript:void(0)" className="btn btn-outline-light chat-search-btn"
                                        onClick={handleSearchMessage}>
                                        <i className="fas fa-search"></i>
                                    </a>
                                </li>

                                <li className="list-inline-item dream_profile_menu" title="Profile" >
                                    <a className="btn btn-outline-light" onClick="$('.customer-details').show();">
                                        <i className="fas fa-user"></i>
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a className="btn btn-outline-light no-bg" data-bs-toggle="dropdown">
                                        <i className="fas fa-ellipsis-h" onClick={togglePopup}></i>
                                    </a>
                                    {isOpen && selectedCustomer &&
                                        <div ref={popupRef} className="dropdown-menu-end chat-options dropdown-menu.show" style={{ backgroundColor: "white", position: "absolute", inset: "0px 0px auto auto", margin: "0px", transform: "translate3d(-15px, 78px, 0px)", border: "1px solid" }}>
                                            <p className="rspam">Report a Spam <img src={SpamIcon} /></p>
                                            <div className="agent-sec">
                                                <p>Transfer to Agent</p>
                                                <select className="form-control sel-opt" onChange={(e) => { setAgentId(e.target.value) }}>
                                                    <option value="">Select</option>
                                                    {connectedAgents ? connectedAgents.map((data) => (
                                                        <option value={data.userId}>{data.firstName}</option>
                                                    )) : ""

                                                    }

                                                </select>
                                                <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={() => reAssignCustomer(selectedCustomer?.chatId, agentId)}>Submit</button>
                                            </div>
                                            <div className="end-chart clearfix">
                                                <a className="rspam"  onClick={() => endChat(selectedCustomer?.chatId, selectedCustomer?.message, selectedCustomer?.messageColorAlign)}>End Chat <img src={StopIcon} alt="" /></a>
                                            </div>

                                        </div>
                                    }
                                </li>
                            </ul>
                        </div>
                        {
                            isSearchMessageOpen && selectedCustomer &&
                            <>
                            <div className="chat-search visible-chat">
                                <form>
                                    <span className="fas fa-search form-control-feedback"></span>
                                    <input type="text" name="chat-search" placeholder="Search Chats" className="form-control" />
                                    <div className="close-btn-chat"><span className="material-icons" onClick={handleSearchMessage}>close</span></div>
                                </form>
                            </div>
                            </>
                        } 
                    </div>
                    <div className="chat-body">
                        <div className="messages">
                            {
                                (connectedCustomer && connectedCustomer.length > 0 && connectedCustomer !== null) ? connectedCustomer.map((element) => (
                                    selectedCustomer && selectedCustomer?.chatId === element?.chatId ?
                                        <>
                                            {
                                                element && element?.message && element?.message.map((value, index) => {
                                                    // console.log('content is ', value.split(',')[0])
                                                    return <div className={element?.messageColorAlign[index]?.cssClass}>
                                                        <div className="chat-content">
                                                            {value && value.split('@@@')[0] === 'text' ?
                                                                <p key={index} className="message-content">{value && value.split('@@@')[1]}</p>
                                                                :
                                                                value && value.split('@@@')[0] === 'media' && value.split('@@@')[1].split(';')[0]!="data:application/pdf" ?

                                                                    <div className="download-col">
                                                                        <ul>
                                                                            <li>
                                                                                <div className="image-download-col">

                                                                                <img src={value.split('@@@')[1]} style={{ height: "100%",width:"100%" }} onClick={() => { downloadBase64Data(value.split('@@@')[1], 'download') }} />
                                                                                </div>
                                                                            </li>
                                                                        </ul>
                                                                    </div> :
                                                                    <div className="download-col">
                                                                    <ul>
                                                                        <li>
                                                                            <div className="image-download-col">
                                                                            <a href="javascript: void(0)" onClick={() => { downloadBase64Data(value.split('@@@')[1], 'download') }}>Download</a>
                                                                            </div>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            }

                                                        </div>
                                                        {
                                                            element?.messageColorAlign[index].from === 'Agent' ?
                                                                <div className="chat-avatar">
                                                                    <img src={AgentAvatar} className="rounded-circle dreams_chat" />
                                                                </div>
                                                                : <></>
                                                        }
                                                    </div>
                                                })
                                            }
                                            <div ref={chatRef} />
                                        </>
                                        :
                                        ""
                                )) : ""
                            }
                        </div>
                        {/* <div className="messages">
                        <div className="chats">

                            <div className="avatar">
                                <div className="letter-avatar">
                                    A
                                </div>
                            </div>

                            <div className="chat-content">
                                <div className="message-content">
                                    Hi My Account Number is 2233455, I paid last bill last week but status shows still Due.
                                    <div className="chat-time">
                                        <div>
                                            <div className="time"><i className="fas fa-clock"></i> 10:00</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="chat-profile-name">
                                    <h6>Aalliyah</h6>
                                </div>
                            </div>

                        </div>
                        <div className="chats chats-right">
                            <div className="chat-content">
                                <div className="message-content text-dark">
                                    Hi Aalliyah, Thank you for your input, let me check your detail. Please wait
                                    <div className="chat-time">
                                        <div>
                                            <div className="time"><i className="fas fa-clock"></i> 10:00</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="chat-profile-name text-end">
                                    <h6>Ainul - L1 Support</h6>
                                </div>
                            </div>
                            <div className="chat-avatar">
                                <img src="assets/img/avatar/avatar-2.jpg" className="rounded-circle dreams_chat" alt="image" />
                            </div>

                        </div>
                        <div className="chats">
                            <div className="avatar">
                                <div className="letter-avatar">
                                    A
                                </div>
                            </div>
                            <div className="chat-content">
                                <div className="message-content">
                                    Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit
                                    <div className="chat-time">
                                        <div>
                                            <div className="time"><i className="fas fa-clock"></i> 10:06</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="chat-profile-name">
                                    <h6>Aalliyah</h6>
                                </div>
                            </div>

                        </div>

                        <div className="chats chats-right">
                            <div className="chat-content">
                                <div className="message-content">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                                    <div className="chat-time">
                                        <div>
                                            <div className="time"><i className="fas fa-clock"></i> 10:02</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="chat-profile-name text-end">
                                    <h6>Ainul - L1 Support</h6>
                                </div>
                            </div>
                            <div className="chat-avatar">
                                <img src="assets/img/avatar/avatar-2.jpg" className="rounded-circle dreams_chat" alt="image" />
                            </div>

                        </div>
                        <div className="chats">
                            <div className="avatar">
                                <div className="letter-avatar">
                                    A
                                </div>
                            </div>
                            <div className="chat-content">
                                <div className="message-content">
                                    <div className="download-col">
                                        <ul>
                                            <li>
                                                <div className="image-download-col">
                                                    <a href="assets/img/chat-download.jpg" data-fancybox="gallery" className="fancybox">
                                                        <img src="assets/img/chat-download.jpg" alt="" />
                                                    </a>
                                                    <div className="download-action d-flex align-items-center">
                                                        <div><a ><i className="fas fa-cloud-download-alt"></i></a></div>
                                                        <div><a ><i className="fas fa-ellipsis-h"></i></a></div>
                                                    </div>
                                                </div>
                                            </li>


                                        </ul>
                                    </div>
                                    <div className="chat-time">
                                        <div>
                                            <div className="time"><i className="fas fa-clock"></i> 10:00</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="chat-profile-name">
                                    <h6>Aalliyah</h6>
                                </div>
                            </div>

                        </div>
                        <br /><br />
                    </div> */}
                    </div>
                </div>
            </div>

            <div className="chat-footer">
                <form>
                    <div className="attach-col">
                        <div className="file-upload2">
                            <div className="file-select">
                                <div className="file-select-button" id="fileName"><i className="fas fa-paperclip"></i></div>

                                <input type="file" name="chooseFile" id="chooseFile" accept=".jpeg, .jpg, .png, .pdf"
                                    onChange={(e) => {
                                        handleChangeStatus(e.target.files[0])
                                    }}></input>
                            </div>
                        </div>
                    </div>
                    <div className="smile-col">
                        <i className="far fa-smile"></i>
                    </div>

                    <textarea cols="50" rows="1" className="form-control chat_form" placeholder="Type a Message....."
                        value={message || ''}
                        onChange={(e) => {
                            setMessage(e.target.value);
                        }}
                    />

                    <div className="form-buttons">
                        <div className="can-msg" data-toggle="modal" data-target="#cannedmessage"><span className="tooltip3" data-tip="Reply From canned Message."
                            tabIndex="2" onClick={handleCannedMessage} ><i className="fas fa-tasks"></i></span></div>
                        <button className="btn send-btn" type="button" disabled={message === '' ? true : false} onClick={handleSendMessage}>
                            <span className="material-btn">send</span>
                        </button>
                    </div>
                </form>
                {
                    <CannedMessageModal
                        data= {{
                            isCannedOpen
                        }}
                        handlers= {{
                            setIsCannedOpen,
                            setText: setMessage
                        }}
                    />
                }
                {
                    createInteraction &&
                    <CreateInteraction
                        data={{
                            isOpen: createInteraction,
                            customerDetails: selectedCustomer,
                            helpdeskId: selectedCustomer?.helpdeskId,
                            detailedViewItem : selectedCustomer && selectedCustomer?.helpdeskDetails  && selectedCustomer?.helpdeskDetails?.source ? { source: selectedCustomer?.helpdeskDetails?.source, chatDetails: { chatId: selectedCustomer &&  selectedCustomer?.chatId}  } : {}, 
                            forChatInteractions: selectedCustomer && selectedCustomer?.helpdeskDetails  && selectedCustomer?.helpdeskDetails?.source === 'E-MAIL' ? false : selectedCustomer && selectedCustomer?.helpdeskDetails  && selectedCustomer?.helpdeskDetails?.source === 'LIVECHAT' ? true : false,
                            fromInteractions: false
                        }}
                        handler={{
                            setIsOpen: setCreateInteraction,
                            doSoftRefresh: () => {}
                        }}
                    />
                }
            </div>
        </div >
    )
}

export default ChatSection