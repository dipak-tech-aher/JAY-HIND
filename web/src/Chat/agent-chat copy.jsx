import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import socketClient, { } from "socket.io-client";
import { AppContext } from "../AppContext";
import { get, put, post } from "../common/util/restUtil";
import { properties } from "../properties";
import { toast } from "react-toastify";

import _ from "lodash";
import { formatISODateDDMMMYY } from "../common/util/dateUtil"
import { unstable_batchedUpdates } from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import boopSfx from '../assets/audio/AiosMsgSound.mp3';
import Avatar1 from '../assets/images/Avatar1.jpg'
import Avatar2 from '../assets/images/Avatar2.jpg'
import UrlImageDownloader from 'react-url-image-downloader'
import axios from 'axios'

const AgentChatBox = (props) => {

   const [newChatPageCount, setNewChatPageCount] = useState(0)
   const history = useHistory();
   const { auth, setAuth } = useContext(AppContext);
   const [newCustomer, setNewCustomer] = useState([]);
   const [connectedCustomer, setConnectedCustomer] = useState([]);
   const [selectedCustomer, setSelectedCustomer] = useState({});
   let [assignedCustomerCount, setAssignedCustomerCount] = useState(0);
   const [refresh, setRefresh] = useState(true)
   const [socket, setSocket] = useState();
   const [message, setMessage] = useState('');
   const [msgObject, setMsgObject] = useState({});
   const [messageArr, setMessageArr] = useState([]);
   let colorAlign;
   const autoRefreshIntervalRef = useRef();
   const [autoRefresh, setAutoRefresh] = useState(true)
   const hasMoreTodo = useRef(true);
   const mergeTodoPrevList = useRef(false);
   const chatRef = useRef(null)
   const [newChatCount, setNewChatCount] = useState(0)
   const [countRefresh, setCountRefresh] = useState(false)
   const maxChatCount = auth?.chatCount ? auth?.chatCount : 10
   const [fileUpload, setFileUpload] = useState({})
   const [error, setError] = useState(false)
   // For message Time-start
   const dayjs = require('dayjs');
   var utc = require('dayjs/plugin/utc');
   var timezone = require('dayjs/plugin/timezone');
   dayjs.extend(utc);
   dayjs.extend(timezone);
   let date = dayjs();
   let time = date.hour() + ':' + date.minute();
   let AMPM = date.hour() > 12 ? ' PM' : ' AM';
   //For message Time-End

   const playSound = () => {
      const demo = document.getElementsByClassName('message-notification')[0]
      demo.play()
   }

   useEffect(() => {

      // if (socket !== undefined) {
      customerQueue()

   }, [socket, refresh, newChatPageCount]); // Pass in empty array to run useEffect only on mount.

   useEffect(() => {

      // if (socket !== undefined) {    
      connectedCustomerByAgent();

   }, [socket]);

   useEffect(() => {
      
      get(properties.CHAT_API + "/count/new")
         .then((response) => {
            if (response) {
               if (Number(response.data) !== Number(newChatCount)) {
                  unstable_batchedUpdates(() => {
                     setNewCustomer([])
                     setNewChatPageCount(0)
                     setRefresh(!refresh)
                  })
               }
               setNewChatCount(response?.data)
            }
         }).catch((error) => {
            console.log(error)
        })
         .finally()
   }, [countRefresh])

   const setAutoRefreshInterval = useCallback(() => {
      autoRefreshIntervalRef.current = setInterval(() => {
         unstable_batchedUpdates(() => {
            setCountRefresh(!countRefresh);
         })
      }, 30000)
   }, [countRefresh])

   useEffect(() => {
      if (autoRefresh)
         setAutoRefreshInterval();
      return () => clearInterval(autoRefreshIntervalRef.current)
   }, [setAutoRefreshInterval, autoRefresh]);

   //Default selected customer while loading the page
   useEffect(() => {
      if (connectedCustomer.length > 0) {
         const chatID = connectedCustomer[0].chatId;
         selectCustomer(chatID);
      }
   }, [connectedCustomer]);

   const handleOnScroll = (e) => {
      const { scrollHeight, scrollTop, clientHeight } = e.target;
      const defaultIndex = Number(e.target.attributes.defaultindex.value);
      if (Math.ceil(scrollHeight - scrollTop) === clientHeight && hasMoreTodo.current) {
         if (defaultIndex === 2) {
            mergeTodoPrevList.current = true;
            setNewChatPageCount(newChatPageCount + 1);
         }
      }
   }

   const customerQueue = () => {
      //load the new user's in queue-If status is "New"
      
      get(`${properties.CHAT_API}?limit=10&page=${newChatPageCount}`)
         .then((resp) => {
            if (resp.data) {
               if (resp.status === 200) {
                  const { count, rows } = resp.data;
                  setNewCustomer((newCustomer) => {
                     let updatedLength = mergeTodoPrevList.current ? newCustomer.length + rows.length : rows.length
                     hasMoreTodo.current = updatedLength < Number(count) ? true : false;
                     return mergeTodoPrevList.current ? [...newCustomer, ...rows] : rows;
                  })
                  mergeTodoPrevList.current = false;
               } else {
                  toast.error("Failed to create - " + resp.status);
               }
            } else {
               toast.error("Uexpected error ocurred " + resp.statusCode);
            }
         }).catch((error) => {
            console.log(error)
        }).finally();
   }

   const scrollToBottom = () => {
      chatRef.current.scrollIntoView({ behavior: 'smooth' })
   }

   const connectedCustomerByAgent = () => {
      
      //customerQueue();
      get(`${properties.CHAT_API}/assigned`)
         .then((resp) => {
            if (resp.data) {
               if (resp.status === 200) {
                  resp.data.forEach(element => {
                     let messages = []
                     get(`${properties.CHAT_API}/message?email=${element?.emailId}&id=${element?.chatId}`)
                        .then((response) => {
                           console.log('response  ', response)
                           if (response?.data) {
                              messages = response?.data
                              element["message"] = _.map(response?.data, 'msg');
                              element["messageColorAlign"] = messages.map((agentMsg) => { delete agentMsg?.msg; return agentMsg })
                           }
                           else {
                              element["message"] = [];
                              element["messageColorAlign"] = [];
                           }
                           let result = _.unionBy(connectedCustomer, resp.data, 'chatId');
                           //result = _.filter(result, { 'status': 'Assigned' });
                           setConnectedCustomer(result);
                           setAssignedCustomerCount(result.length)
                        }).catch((error) => {
                           console.log(error)
                       })
                     // console.log('socket inside connected ', socket)
                     // element.socketId.on('connect', () => { })
                     //  put(`${properties.HELPDESK_API}/update-socket/${element?.chatId}`, { "socketId": socket.id })
                  }
                  );
               }
               else {
                  toast.error("Failed to create - " + resp.status);
               }
            }
            else {
               toast.error("Uexpected error ocurred " + resp.statusCode);
            }
         }).catch((error) => {
            console.log(error)
        }).finally();
   }

   const assignCustomer = (chatId) => {

      let count = assignedCustomerCount + 1
      setAssignedCustomerCount(count)
      if (count <= maxChatCount) {
         

         var socketIO = socketClient(properties.API_ENDPOINT, { //removed properties.API_ENDPOINT and add '' for UAT & PROD
            //path: properties.SOCKET_PATH, //Enable it for UAT & PROD
            //port: properties.API_SERVICE_PORT, //Enable it for UAT & PROD
            //withCredentials: true,
            transportOptions: {
               polling: {
                  extraHeaders: {
                     "my-custom-header": "chat"
                  },
               },
            },
         });
         socketIO && socketIO.on('connect', () => {

            put(`${properties.CHAT_API}/assign` + `/${chatId}`, { "socketId": socketIO.id })
               .then((resp) => {
                  //if (resp.data) {
                  if (resp.status === 200) {
                     setNewCustomer([])
                     setNewChatPageCount(0)
                     //setNewCustomer(resp.data)    
                     customerQueue()
                     connectedCustomerByAgent()
                  } else {
                     toast.error("Failed to update - " + resp.status);
                  }
                  // } else {
                  //    toast.error("Uexpected error ocurred " + resp.statusCode);             
                  // }
               }).catch((error) => {
                  console.log(error)
              }).finally()

         })
         setSocket(socketIO)
      }
   }

   const selectCustomer = (chatId) => {
      connectedCustomer.forEach(element => {
         if (element.chatId === chatId) {
            if (!socket) {
               var socketIO = socketClient(properties.API_ENDPOINT, { //removed properties.API_ENDPOINT and add '' for UAT & PROD
                  //path: properties.SOCKET_PATH, //Enable it for UAT & PROD
                  //port: properties.API_SERVICE_PORT, //Enable it for UAT & PROD
                  //withCredentials: true,
                  transportOptions: {
                     polling: {
                        extraHeaders: {
                           "my-custom-header": "chat"
                        },
                     },
                  },
               });
               socketIO && socketIO.on('connect', () => {
                  put(`${properties.HELPDESK_API}/update-socket/${chatId}`, { "socketId": socketIO.id })
               })
               setSocket(socketIO)
            }
            setSelectedCustomer(element)
         }
      });
   }

   //Receive Message from Agent
   selectedCustomer && connectedCustomer.forEach((element) => {
      colorAlign = {
         from: "User",
         textAlign: "left",
         bgColor: "#a8acf7",
      };
      socket && socket.on(element.socketId + "-CLIENT-2", (msg) => {
         console.log('inside receive livechat message ')
         if (element.chatId === selectedCustomer.chatId) {
            if (!element.message.includes(msg)) {
               element.messageColorAlign.push(colorAlign);
               element.message.push(msg);
               let array = []
               element.message.map((userMsg, index) => {
                  array.push({ ...element.messageColorAlign[index], msg: userMsg, socketId: element.socketId })
               })
               let body = {
                  chatId: element?.chatId,
                  email: element?.emailId,
                  message: array
               }
               
               post(properties.CHAT_API + "/message", body)
                  .then((resp) => {
                     playSound()
                     scrollToBottom()
                     console.log("Response :", resp?.message)
                  })
                  .catch((error) => {
                     console.log("error : ", error)
                  })
                  .finally()
               setMessageArr([...messageArr, message]);
            }
         }
      });

      socket && socket.on('receiveFromWhatsApp', (msg) => {
         console.log('inside receive whatsapp message ', msg)
         if (element.chatId === selectedCustomer.chatId) {
            if (!element.message.includes(msg)) {
               element.messageColorAlign.push(colorAlign);
               element.message.push(msg);
               let array = []
               element.message.map((userMsg, index) => {
                  array.push({ ...element.messageColorAlign[index], msg: userMsg, socketId: element.socketId })
               })
               let body = {
                  chatId: element?.chatId,
                  email: element?.emailId,
                  message: array
               }
               
               post(properties.CHAT_API + "/message", body)
                  .then((resp) => {
                     playSound()
                     scrollToBottom()
                     console.log("Response :", resp?.message)
                  })
                  .catch((error) => {
                     console.log("error : ", error)
                  })
                  .finally()
               setMessageArr([...messageArr, message]);
            }
         }
      });
   });

   const handleSendMessage = () => {
      console.log('selectedCustomer in method ', selectedCustomer)
      colorAlign = {
         from: 'Agent',
         textAlign: 'right',
         bgColor: '#afcfeb',
      }
      const msg = msgObject.type === 'media' ? msgObject.message : message
      const msgType = msgObject.type === 'media' ? 'media' : 'text'
      connectedCustomer.forEach(element => {
         if (element.chatId === selectedCustomer.chatId) {
            element.messageColorAlign.push(colorAlign)
            element.message.push(msgType + ',' + msg)
            let array = []
            element.message.map((agentMsg, index) => {
               array.push({ ...element.messageColorAlign[index], msg: agentMsg, socketId: element.socketId })
            })
            let body = {
               chatId: element?.chatId,
               email: element?.emailId,
               message: array
            }
            
            post(properties.CHAT_API + "/message", body)
               .then((resp) => {
                  scrollToBottom()
                  console.log("Response :", resp?.message)
               })
               .catch((error) => {
                  console.log("error : ", error)
               })
               .finally()
            setMessageArr([...messageArr, message]);
            selectCustomer(element.chatId);
         }
      });
      //Send Message to Server 

      if (selectedCustomer.source === 'WHATSAPP') {
         const body = {
            message: msg,
            msgType,
            from: selectedCustomer.contactNo
         }
         // console.log(properties.INTEGRATION_API + "/whatsapp/send-message")
         post(properties.INTEGRATION_API + "/whatsapp/send-message", body)
      } else {
         socket.emit("CLIENT-2", msgType + ',' + msg + '^^' + selectedCustomer.socketId);
      }
      setMessage('');//Do not remove it    
   }

   const endChat = (chatId, message, colorAlignFrom) => {
      
      put(`${properties.CHAT_API}/end`, { chatId: chatId, message: message.toString(), messageFrom: "Chat" })
         .then((resp) => {
            if (resp.status === 200) {
               setNewCustomer([])
               setNewChatPageCount(0)
               //setNewCustomer(resp.data)    
               customerQueue()
               _.remove(connectedCustomer, { 'chatId': chatId })
               //socket.disconnect();          
               connectedCustomerByAgent();
               //Select first customer as default 
               if (connectedCustomer && connectedCustomer.length > 0) {
                  setSelectedCustomer(connectedCustomer[0])
               } else {
                  setSelectedCustomer(null)
               }
               setAssignedCustomerCount(assignedCustomerCount - 1)

            } else {
               toast.error("Failed to endChat - " + resp.status);
            }
         }).catch((error) => {
            console.log(error)
        }).finally();
   }

   const sendtoCreateComplaint = () => {

      const customerInput = { "searchType": "QUICK_SEARCH", "customerQuickSearchInput": selectedCustomer.contactNo, "filters": [], "source": "COMPLAINT" }
      post(`${properties.CUSTOMER_API}/search?limit=10&page=0`, customerInput)
         .then((resp) => {
            if (resp.data) {
               if (resp.status === 200) {

                  let data = {
                     serviceNo: resp.data.rows[0].accessNbr,
                     accessNumber: resp.data.rows[0].accessNbr,
                     //sourceName: "customer360",      
                     accountId: resp.data.rows[0].accountId,
                     customerId: resp.data.rows[0].customerId,
                     serviceId: resp.data.rows[0].serviceId,
                     accountNo: resp.data.rows[0].accountNo,
                     accountName: resp.data.rows[0].accountName,
                     accountContactNo: resp.data.rows[0].accountContactNo,
                     accountEmail: resp.data.rows[0].accountEmail,
                     serviceType: resp.data.rows[0].prodType,
                     accessNumber: resp.data.rows[0].accessNbr,
                     type: 'Complaint',
                  };

                  props.history.push(
                     `${process.env.REACT_APP_BASE}/create-complaint`, { data }
                  );
               }
               else {
                  toast.error("Failed to get the customer search - " + resp.status);
               }
            }
            else {
               toast.error("Uexpected error ocurred " + resp.statusCode);
            }
         }).catch((error) => {
            console.log(error)
        })




   };

   const sendtoCreateInquiry = () => {
      let data = {}
      if (selectedCustomer.customerInfo && selectedCustomer.customerInfo.customerName) {
         const customerInput = { "searchType": "QUICK_SEARCH", "customerQuickSearchInput": selectedCustomer.contactNo, "filters": [], "source": "COMPLAINT" }
         post(`${properties.CUSTOMER_API}/search?limit=10&page=0`, customerInput)
            .then((resp) => {
               if (resp.data) {
                  if (resp.status === 200) {
                     data = {
                        serviceNo: resp.data.rows[0].accessNbr,
                        accessNumber: resp.data.rows[0].accessNbr,
                        sourceName: "customer360",
                     };
                  }
               }
            }).catch((error) => {
               console.log(error)
           })
      }
      else {
         data = {
            serviceNo: selectedCustomer.contactNo,
            accessNumber: selectedCustomer.contactNo,
            sourceName: "fromDashboard",
         };
      }
      // const data = {
      //    serviceNo: selectedCustomer.contactNo,
      //    accessNumber: selectedCustomer.contactNo,
      //    sourceName: selectedCustomer.customerInfo && selectedCustomer.customerInfo.customerName ? "customer360" : 'fromDashboard',
      // };
      props.history.push(
         `${process.env.REACT_APP_BASE}/create-inquiry-new-customer`,
         { data }
      );
   };

   const handleChangeStatus = (file) => {
      let fi = document.getElementById('file');
      var extension = file.name.substr(file.name.lastIndexOf('.'));
      if ((extension.toLowerCase() === ".jpg") ||
         (extension.toLowerCase() === ".jpeg") ||
         (extension.toLowerCase() === ".png") ||
         (extension.toLowerCase() === ".pdf")
      ) {
         setError(false)
      }
      else {
         setError(true)
         toast.error(fileUpload.name + ' is invalid file format, Please try again');
         return false;
      }

      if (fi.files.length > 0) {
         for (let i = 0; i <= fi.files.length - 1; i++) {

            let fsize = fi.files.item(i).size;

            if (fsize > 5242880) {
               setError(true)
               toast.error("File too Big, please select a file less than 1mb");
               history.push(`${process.env.REACT_APP_BASE}/agent-chat`)
            }

         }
      }
      //setFileUpload({ myFile: file })
      if (!error) {
         
         const formData = new FormData();
         console.log(file)
         formData.append("file", file);

         axios.post(properties.API_ENDPOINT + properties.CHAT_API + "/uploadfile", formData).then((res) => {
            console.log('Response from server ', properties.API_ENDPOINT + process.env.REACT_APP_BASE + '/downloads/' + res.data.filename)
            setMsgObject({
               'type': 'media',
               'message': 'http://localhost:3000/bcae/downloads/' + res.data.filename
            })
            setMessage('media')
         }).catch((e) => {
            console.log(e)

         }).finally();

      }
   }

   return (
      <div className="content-page">
         <div className="content">
            <div className="container-fluid">
               <div className="row">
                  <div className="col-12">
                     <div className="page-title-box">
                        <h4 className="page-title">New Users</h4>
                     </div>
                  </div>
               </div>
               <audio className="message-notification">
                  <source src={boopSfx} type="audio/mpeg" >
                  </source>
               </audio>
               <div className="card-box p-0 border">
                  <div className="card-body chat-page">
                     <div className="row">
                        <div className="col-3">
                           <div className="col-letf section1">
                              <h2>
                                 Chat Queue
                                 {/* <button type="button" onClick={(e) => customerQueue()}  style={{marginTop:"-4px"}} className="user-right btn btn-primary btn-sm waves-effect waves-light">Refresh</button> */}
                              </h2>
                              <Tabs>
                                 <TabList style={{ display: "none" }}>
                                    <Tab style={{ display: "none" }}></Tab>
                                 </TabList>
                                 <TabPanel defaultIndex={2} onScroll={handleOnScroll} style={{ maxHeight: "515px" }} className="border-grey">
                                    <div className="list-user chat-queue">
                                       {
                                          newCustomer ? newCustomer.map((data) => (
                                             <div className="user-section clearfix" key={data.chatId}>
                                                <div className="user-left">
                                                   <div className="avatar-area">
                                                      <img className="avatar-icon" src={Avatar1} alt="..." />
                                                   </div>
                                                   <div className="user-data">

                                                      <p style={{ wordWrap: "break-word" }}>CT-00{data?.chatId} - {data?.category}</p>

                                                      <p style={{ wordWrap: "break-word" }}>{data?.customerName}</p>
                                                      <p style={{ wordWrap: "break-word" }}>{data?.emailId}</p>
                                                      <p>{data?.contactNo}</p>
                                                      <p className="channel"><span>Channel:</span>{data?.source}</p>
                                                      <div className="user-right">
                                                         <button type="button" onClick={(e) => assignCustomer(data.chatId)} className="btn btn-primary btn-sm waves-effect waves-light">Assign</button>
                                                      </div>
                                                   </div>
                                                </div>

                                             </div>
                                          ))
                                             : ""
                                       }
                                    </div>
                                 </TabPanel>
                              </Tabs>
                           </div>
                        </div>

                        <div className="col-3 cursor-pointer">
                           <div className="col-letf section2">
                              <h2>Connected Users</h2>
                              <div className="list-user bg-white" style={{ maxHeight: "515px", border: "1px solid #ccc", overflowY: "auto" }}>
                                 <span className="errormsg"><b>{assignedCustomerCount > maxChatCount ? `Agent cannot assign more than ${maxChatCount} users` : ""}</b></span>
                                 {
                                    connectedCustomer ? connectedCustomer.map((data) => (
                                       <div className={`user-section clearfix ${Number(data?.chatId) === Number(selectedCustomer?.chatId) ? "bg-secondary" : "bg-white"}`} key={data?.chatId} onClick={(e) => selectCustomer(data.chatId)} >
                                          <div className="user-left">
                                             <div className="avatar-area"><img className="avatar-icon" src={Avatar2} alt="..." /></div>
                                             <div className="user-data">
                                                <p style={{ wordWrap: "break-word" }}>CT-00{data?.chatId} - {data?.category}</p>
                                                <p style={{ wordWrap: "break-word" }}>{data?.customerName}</p>
                                                <p style={{ wordWrap: "break-word" }}>{data?.emailId}</p>
                                                <p>{data?.contactNo}</p>
                                                <p className="channel"><span>Channel:</span>{data?.helpdeskDetails?.source}</p>
                                                <div className="user-right">
                                                   <button type="button" onClick={(e) => endChat(data.chatId, data.message, data.messageColorAlign)} className="btn btn-primary btn-sm waves-effect waves-light">End Chat</button>
                                                </div>
                                             </div>
                                          </div>

                                       </div>
                                    ))
                                       : ""
                                 }
                              </div>
                           </div>
                        </div>

                        <div className="col-6">
                           {

                              selectedCustomer && selectedCustomer.message ? (
                                 <div id={selectedCustomer.chatId} style={{ visibility: "visible" }}>
                                    <div className="col-letf section3 clearfix" >
                                       <h2>CT-00{selectedCustomer.chatId} - {selectedCustomer?.category}</h2>
                                       <div className="fname">
                                          <div className="user-stat-left pr-1">Customer Name: </div>
                                          <div className="user-value" style={{ wordWrap: "break-word" }}>{selectedCustomer.customerInfo && selectedCustomer.customerInfo.customerName ? selectedCustomer.customerInfo.customerName : selectedCustomer.customerName} </div>
                                       </div>
                                       <div className="cus-type user-status clearfix">
                                          <div className="user-stat-left">Customer Type:</div>
                                          <div className="user-stat-right">{selectedCustomer.customerInfo && selectedCustomer.customerInfo.customerType ? selectedCustomer.customerInfo.customerType === "RES" ? 'Residential' : selectedCustomer.customerInfo.customerType : '-'}</div>
                                       </div>

                                       <div className="user-status clearfix">
                                          <div className="row">
                                             <div className="col-5">
                                                <div className="user-stat-left pr-1">Email:</div>
                                                <div className="user-value2" style={{ wordWrap: "break-word" }}>{selectedCustomer?.emailId ? selectedCustomer?.emailId : '-'}</div>
                                             </div>
                                             <div className="col-3">
                                                <div className="user-stat-left pr-1">Contact:</div>
                                                <div style={{ wordWrap: "break-word" }}>{selectedCustomer?.contactNo ? selectedCustomer?.contactNo : '-'}</div>
                                             </div>
                                             <div className="col-3">
                                                <div className="user-stat-left pr-1">ID Value:</div>
                                                <div style={{ wordWrap: "break-word" }}>{selectedCustomer?.idValue ? selectedCustomer?.idValue : '-'}</div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="ps-container ps-theme-default ps-active-y pb-4" id="chat-content" style={{ height: "400px !important" }}>
                                       <div className="media media-chat">
                                          <div className="media-body" style={{ whiteSpace: "pre-line", width: "100%" }}>
                                             {
                                                connectedCustomer ? connectedCustomer.map((element, index) => (
                                                   selectedCustomer.chatId === element.chatId ?
                                                      <>
                                                         {
                                                            element.message.map((value, index) => {
                                                               // console.log('content is ', value.split(',')[0])
                                                               return <div style={{ width: "100%", display: "inline-block" }}> <div style={{ float: element.messageColorAlign[index].textAlign }}>
                                                                  {value.split(',')[0] === 'text' ?
                                                                     <p style={{
                                                                        listStyleType: "none", backgroundColor: element.messageColorAlign[index].bgColor, textAlign: "left"/*element.messageColorAlign[index].textAlign*/,
                                                                        borderRadius: "50px", padding: "12px 38px"
                                                                     }} key={index} className="chat-box">{value.split(',')[1]}
                                                                     </p>
                                                                     :
                                                                     value.split(',')[0] === 'media' ?
                                                                        <UrlImageDownloader imageUrl={value.split(',')[1]} />
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
                                          </div>
                                       </div>
                                       <div className="ps-scrollbar-x-rail" style={{ left: "0px", bottom: "0px" }}>
                                          <div className="ps-scrollbar-x" tabIndex="0" style={{ left: "0px", bottom: "0px" }}></div>
                                       </div>
                                       <div className="ps-scrollbar-y-rail" style={{ top: "0px", height: "0px", right: "2px" }}>
                                          <div className="ps-scrollbar-y" tabIndex="0" style={{ top: "0px", height: "0px", right: "2px" }}></div>
                                       </div>
                                    </div>
                                    <div className="publisher bt-1 border-grey">
                                       <img className="avatar-icon avatar-icon-icon-xs" src="https://img.icons8.com/color/36/000000/administrator-male.png" alt="..." />
                                       <textarea cols="50" rows="1" className="publisher-input" placeholder="Write something"
                                          value={message || ''}
                                          onChange={(e) => {
                                             setMessage(e.target.value);
                                          }}
                                       />

                                       <div className="chat-buttons clearfix">

                                          <button type="button" className="btn btn-primary btn-sm waves-effect waves-light" disabled={message !== '' ? false : true} onClick={handleSendMessage}>
                                             <i className="fa fa-paper-plane"></i>
                                          </button>
                                          {
                                             selectedCustomer.customerInfo && selectedCustomer.customerInfo.customerName ? (
                                                <button type="button" className="btn btn-primary btn-sm waves-effect waves-light" onClick={(e) => sendtoCreateComplaint()}>Create Complaint</button>
                                             ) : ""
                                          }
                                          <input type="file" accept=".jpeg, .jpg, .png, .pdf"
                                             id="file"
                                             onChange={(e) => {
                                                handleChangeStatus(e.target.files[0])
                                             }}>

                                          </input>
                                          <button type="button" className="btn btn-primary btn-sm waves-effect waves-light" onClick={(e) => sendtoCreateInquiry()}>Create Inquiry</button>

                                       </div>
                                    </div>
                                 </div>
                              ) : ""
                           }
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
export default AgentChatBox;