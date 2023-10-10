import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import socketClient from "socket.io-client";
import { AppContext } from "../../AppContext";
import { get, put, post } from "../../common/util/restUtil";
import { properties } from "../../properties";
import { toast } from "react-toastify";
import moment from 'moment'

import _ from "lodash";
import { formatISODateDDMMMYY } from "../../common/util/dateUtil"
import { unstable_batchedUpdates } from 'react-dom';
import ChatQueue from './ChatQueue';
import ConnectedCustomers from './ConnectedCustomers';
import AvailableAgents from './AvailableAgents';
import ChatBox from './ChatBox';
import InteractionHistory from './InteractionHistory';

const AgentChatBox = (props) => {
   const [isRefresh, setIsRefresh] = useState(false);
   const [newChatPageCount, setNewChatPageCount] = useState(0)
   const history = useHistory();
   const { auth, setAuth } = useContext(AppContext);
   const [newCustomer, setNewCustomer] = useState([]);
   const [connectedCustomer, setConnectedCustomer] = useState([]);
   const [file, setFile] = useState({});
   const [selectedCustomer, setSelectedCustomer] = useState({});
   const [connectedAgents, setConnectedAgents] = useState([])
   const [availableAgents, setAvailableAgents] = useState([])
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
   const [error, setError] = useState(false)
   const [socketId, setSocketId] = useState()
   const [chatFilter, setChatFilter] = useState('')
   const [interactionCustomerHistory, setInteractionCustomerHistory] = useState({});
   const [customerDetails, setCustomerDetails] = useState({});
   const [showCustomer, setShowCustomer] = useState(false)

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
      // demo.play()
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
      if (chatFilter !== '') {
         customerQueue()
         //connectedCustomerByAgent()
      }
   }, [chatFilter])

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
   }, [countRefresh, isRefresh])


   useEffect(() => {
      get(properties.CHAT_API + '/availableAgents').then((resp) => {
         if (resp.status === 200) {
            // console.log('Connected agents ==', resp.data)
            setConnectedAgents(resp.data)
            setAvailableAgents(resp.data)
         }
      }).catch((error) => {
         console.log(error)
     })
   }, [])

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
      get(`${properties.CHAT_API}/get-new-chats?limit=10&page=${newChatPageCount}&source=${chatFilter}`)
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
      get(`${properties.CHAT_API}/assigned?source=${chatFilter}`)
         .then((resp) => {
            if (resp.data) {
               if (resp.status === 200) {
                  resp.data.forEach(element => {
                     let messages = []
                     get(`${properties.CHAT_API}/message?email=${element?.emailId}&id=${element?.chatId}`)
                        .then((response) => {
                           // console.log('response  ', response)
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
      console.log('chatId-------->', chatId)
      let count = assignedCustomerCount + 1
      setAssignedCustomerCount(count)
      console.log('maxChatCount --------------------------->', count, maxChatCount)
      if (count <= maxChatCount) {
         console.log('inside --------------------------->', count, maxChatCount)

         if (socket.connected) {
            console.log('connected --------------------------->', count, maxChatCount)

            put(`${properties.CHAT_API}/assign/${chatId}`, { "socketId": socket.id })
               .then((resp) => {
                  if (resp.status === 200) {
                     setNewCustomer([])
                     setNewChatPageCount(0)
                     customerQueue()
                     connectedCustomerByAgent()
                  } else {
                     toast.error("Failed to update - " + resp.status);
                  }
               }).catch((error) => {
                  console.log(error)
              }).finally()
         } else {
            let socketIO = null
            socketIO = socketClient('', {
               path: properties.SOCKET_PATH, // enable this line for for UAT & PROD only
               port: properties.API_SERVICE_PORT, // enable this line for for UAT & PROD only
               closeOnBeforeunload: false
            });
            // console.log('socketIO-------->', socketIO)
            console.log('socketIO----id---->', socketIO)
            console.log('socket --------------------------->', socket)

            socket && socket.on('connect', () => {
               console.log('update --------------------------->', count, maxChatCount)

               put(`${properties.CHAT_API}/assign/${chatId}`, { "socketId": socketIO.id })
                  .then((resp) => {
                     if (resp.status === 200) {
                        setNewCustomer([])
                        setNewChatPageCount(0)
                        customerQueue()
                        connectedCustomerByAgent()
                     } else {
                        toast.error("Failed to update - " + resp.status);
                     }
                  }).catch((error) => {
                     console.log(error)
                 }).finally()
            });
            setSocket(socketIO)
         }
      }
   }

   const reAssignCustomer = (chatId, agentId) => {
      // console.log(' chat id inside method ', chatId, '::', agentId)
      let count = assignedCustomerCount + 1
      setAssignedCustomerCount(count)
      if (count <= maxChatCount) {

         put(`${properties.CHAT_API}/reassign` + `/${chatId}`, { "agentId": agentId })
            .then((resp) => {
               //if (resp.data) {
               if (resp.status === 200) {
                  setNewCustomer([])
                  setNewChatPageCount(0)
                  //setNewCustomer(resp.data)    
                  customerQueue()
                  connectedCustomerByAgent()
                  window.location.reload(false);
               } else {
                  toast.error("Failed to update - " + resp.status);
               }
               // } else {
               //    toast.error("Uexpected error ocurred " + resp.statusCode);             
               // }
            }).catch((error) => {
               console.log(error)
           }).finally()

      }
   }

   const selectCustomer = (chatId) => {
      // console.log('chatId--------->', chatId)
      // console.log('connectedCustomer--------->', connectedCustomer)
      // console.log('socket--------->', socket)
      connectedCustomer.forEach(element => {
         if (element.chatId === chatId) {
            if (!socket) {
               var socketIO = socketClient('', { //removed properties.API_ENDPOINT and add '' for UAT & PROD
                  path: properties.SOCKET_PATH, //Enable it for UAT & PROD
                  port: properties.API_SERVICE_PORT, //Enable it for UAT & PROD
                  //withCredentials: true,
                  transportOptions: {
                     polling: {
                        extraHeaders: {
                           "my-custom-header": "chat"
                        },
                     },
                  },
               });
               // console.log('socketIO------->', socketIO)
               socketIO && socketIO.on('connect', () => {
                  put(`${properties.CHAT_API}/update-socket/${chatId}`, { "socketId": socketIO.id })
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
         cssClass: 'chats'
      };
      socket && socket.on(element.socketId + "-CLIENT-2", (msg) => {
         // console.log('inside receive livechat message ', msg)
         // console.log('element---------> ', element)
         // console.log('selectedCustomer---------> ', selectedCustomer)
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
                     // playSound()
                     scrollToBottom()
                     // console.log("Response :", resp?.message)
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
         // console.log('inside receive whatsapp message ', msg)
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
                     // playSound()
                     scrollToBottom()
                     // console.log("Response :", resp?.message)
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
      const time = moment(new Date()).format('hh:mm:ss A')
      // console.log('selectedCustomer in method ', selectedCustomer)
      colorAlign = {
         from: 'Agent',
         textAlign: 'right',
         bgColor: '#afcfeb',
         cssClass: 'chats chats-right'
      }
      const msg = msgObject.type === 'media' ? msgObject.message : message + '\n' + time
      const msgType = msgObject.type === 'media' ? 'media' : 'text';
      connectedCustomer.forEach(element => {
         // console.log('msg-----xx--->', msg)
         // console.log('msgType---xx----->', msgType)
         if (element.chatId === selectedCustomer.chatId) {
            element.messageColorAlign.push(colorAlign)
            element.message.push(msgType + '@@@' + msg)
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
                  // console.log("Response :", resp?.message)
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
         // console.log('here in socket connetion-------->', msg)
         socket.emit("CLIENT-2", msgType + '@@@' + msg + '^^' + selectedCustomer.socketId);
      }
      setMessage('');//Do not remove it  
      // document.getElementById('chooseFile').value = null; //Do not remove it
      setMsgObject({})
   }

   const endChat = (chatId, message) => {
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
      props.history.push(
         `${process.env.REACT_APP_BASE}/create-inquiry-new-customer`,
         { data }
      );
   };

   const handleChangeStatus = (file) => {
      // console.log('file.name', file.name);
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
         return false;
      }
      if (!error) {
         var fileInput = document.querySelector('input[type=file]').files[0];
         // console.log('fileInput.type', fileInput.type);
         // if (fileInput.type === "application/pdf") {
         //    setFileType("pdf")
         // } else {
         //    setFileType("img")
         // }
         var reader = new FileReader();
         reader.readAsDataURL(fileInput);
         reader.onload = function () {
            setMsgObject({
               'type': 'media',
               'message': reader.result
               // /*** enable this for dev ***/ 'http://localhost:3000/bcae/downloads/' + res.data.filename
            })
            setMessage('media')
            //   setMediaAsBase64(reader.result)
         };
         reader.onerror = function (error) {
            console.log('Error: ', error);
         };
      }
   }

   //Default selected customer while loading the page
   useEffect(() => {
      let socketIO
      // console.log('socket in useeffect', socket)
      if (!socket) {
         socketIO = socketClient('', { //removed properties.API_ENDPOINT and add '' for UAT & PROD
            path: properties.SOCKET_PATH, //Enable it for UAT & PROD
            port: properties.API_SERVICE_PORT, //Enable it for UAT & PROD
            closeOnBeforeunload: false
         });
         setSocket(socketIO)
         setSocketId(socketIO.id)
      }

   }, []);


   useEffect(() => {
      console.log('selectedCustomer --------------------------->', selectedCustomer)
      if (selectedCustomer && selectedCustomer?.customerInfo?.customerUuid) {
         get(`${properties.INTERACTION_API}/get-customer-history-count/${selectedCustomer?.customerInfo?.customerUuid}`).then((response) => {
            if (response?.data) {
               setInteractionCustomerHistory(response?.data);
            }
         }).catch((error) => {
               console.error(error);
            }).finally();
         
            post(`${properties.CUSTOMER_API}/get-customer?limit=1&page=0`, {customerUuid: selectedCustomer?.customerInfo?.customerUuid }).then((resp)=>{
               if(resp?.data){
                  setCustomerDetails(resp?.data?.rows?.[0])
               }
            }).catch((error) => {
               console.error(error);
            }).finally();
      } else {
         setInteractionCustomerHistory([])
         setCustomerDetails([])
      }

   }, [selectedCustomer])

   return (
      <div className="pr-0">{/** content-page */}
         <div className="content">
            <div className="">
               <div className="cnt-wrapper">
                  <div className="card adv-srh-sect">
                     <div className="adv-search pl-2">
                        <h4>Live Chat</h4>
                     </div>
                     <div className="live-chat-view">
                        <ChatQueue data={{ newCustomer, isRefresh }} handlers={{ assignCustomer, setIsRefresh }} />
                        <div className="chat-rht-sect">
                           <div className="home-page__content messages-page">
                              <div className="container-fluid h-100">
                                 <div className="row col-md-12 px-0 h-100">
                                    <div className="col-12 col-md-4 col-lg-5">{/** col-xl-3 messages-page__list-scroll  */}
                                       <ConnectedCustomers data={{ connectedCustomer }} handlers={{ selectCustomer }} />
                                       <AvailableAgents data={{ availableAgents }} />
                                    </div>
                                    <div className="chat col-12 col-md-8 col-lg-7 col-xl-7 px-0 pl-md-1">
                                       <ChatBox data={{ chatRef, message, selectedCustomer, connectedCustomer, showCustomer }} handlers={{ handleSendMessage, setMessage, endChat, setShowCustomer }} />
                                    </div>
                                   {showCustomer && <InteractionHistory data={{ selectedCustomer, interactionCustomerHistory, customerDetails, showCustomer }} handler = {{setShowCustomer}} />}
                                 </div>
                              </div>
                           </div>
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