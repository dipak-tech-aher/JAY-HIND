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
import ConnectedChat from './ChatComponents/connected-queue';
import NewQueue from './ChatComponents/new-queue';
import axios from 'axios'
import ChatSection from './ChatComponents/chat-section';
import SideBarMenu from './ChatComponents/sidebar-menu';

const AgentChatBox = (props) => {

   const [newChatPageCount, setNewChatPageCount] = useState(0)
   const history = useHistory();
   const { auth, setAuth } = useContext(AppContext);
   const [newCustomer, setNewCustomer] = useState([]);
   const [connectedCustomer, setConnectedCustomer] = useState([]);
   const [file, setFile] = useState({});
   const [selectedCustomer, setSelectedCustomer] = useState({});
   const [connectedAgents, setConnectedAgents] = useState([])
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

   const [chatFilter, setChatFilter] = useState('')

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
   }, [countRefresh])


   useEffect(() => {
      get(properties.CHAT_API + '/availableAgents').then((resp) => {
         if (resp.status === 200) {
            console.log('Connected agents ==', resp.data)
            setConnectedAgents(resp.data)
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
      
      get(`${properties.CHAT_API}?limit=10&page=${newChatPageCount}&source=${chatFilter}`)
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
            // path: properties.SOCKET_PATH, //Enable it for UAT & PROD
            // port: properties.API_SERVICE_PORT, //Enable it for UAT & PROD
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

   const reAssignCustomer = (chatId, agentId) => {
      console.log(' chat id inside method ', chatId, '::', agentId)
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
      console.log(chatId)
      connectedCustomer.forEach(element => {
         if (element.chatId === chatId) {
            if (!socket) {
               var socketIO = socketClient(properties.API_ENDPOINT, { //removed properties.API_ENDPOINT and add '' for UAT & PROD
                  // path: properties.SOCKET_PATH, //Enable it for UAT & PROD
                  // port: properties.API_SERVICE_PORT, //Enable it for UAT & PROD
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
         cssClass: 'chats'
      };
      socket && socket.on(element.socketId + "-CLIENT-2", (msg) => {
         console.log('inside receive livechat message ', msg)
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
                     // playSound()
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
         cssClass: 'chats chats-right'
      }
      const msg = msgObject.type === 'media' ? msgObject.message : message
      const msgType = msgObject.type === 'media' ? 'media' : 'text'
      connectedCustomer.forEach(element => {
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
         socket.emit("CLIENT-2", msgType + '@@@' + msg + '^^' + selectedCustomer.socketId);
      }
      setMessage('');//Do not remove it  
      document.getElementById('chooseFile').value = null; //Do not remove it
      setMsgObject({})
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

   // const handleChangeStatus = (file) => {
   //    // let fi = document.getElementById('file');
   //    var extension = file.name.substr(file.name.lastIndexOf('.'));
   //    if ((extension.toLowerCase() === ".jpg") ||
   //       (extension.toLowerCase() === ".jpeg") ||
   //       (extension.toLowerCase() === ".png") ||
   //       (extension.toLowerCase() === ".pdf")
   //    ) {
   //       setError(false)
   //    }
   //    else {
   //       setError(true)
   //       toast.error(file.name + ' is invalid file format, Please try again');
   //       return false;
   //    }


   //    if (file.size > 1000000) {
   //       setError(true)
   //       toast.error("File too Big, please select a file less than 1mb");
   //       history.push(`${process.env.REACT_APP_BASE}/agent-chat`)
   //    }

   //    //setFileUpload({ myFile: file })
   //    if (!error) {
   //       
   //       const formData = new FormData();
   //       formData.append("file", file);

   //       axios.post(properties.API_ENDPOINT + properties.CHAT_API + "/uploadfile", formData).then((res) => {
   //          //console.log('Response from server ', properties.API_ENDPOINT + process.env.REACT_APP_BASE + '/downloads/' + res.data.filename)
   //          setMsgObject({
   //             'type': 'media',
   //             'message': /*** enable this for uat/prod ***/ properties.API_ENDPOINT + '/downloads/' + res.data.filename
   //             // /*** enable this for dev ***/ 'http://localhost:3000/bcae/downloads/' + res.data.filename
   //          })
   //          setMessage('media')
   //       }).catch((e) => {
   //          console.log(e)

   //       }).finally();

   //    }
   // }

   const handleChangeStatus = (file) => {
      console.log('file.name', file.name);
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
         console.log('fileInput.type', fileInput.type);
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

   return (
      <div className="content-page agent-chat">
         <div className="content">

            <div className="main-wrapper mt-0">
               <SideBarMenu />
               <div className="content main_content chat-container">
                  <div className="live-chat-sec">
                     <div className="row">
                        <div className="col-md-8">
                           <h2>Live Chat</h2>
                        </div>
                     </div>
                  </div>
                  <div className="chat-container clearfix">
                     <NewQueue data={
                        {
                           newCustomer, socket, maxChatCount, assignedCustomerCount, chatFilter
                        }
                     }
                        handler={
                           {
                              assignCustomer, setNewCustomer, setSocket, setAssignedCustomerCount, setNewChatPageCount,
                              customerQueue, connectedCustomerByAgent, setChatFilter
                           }
                        }
                     />
                     <ConnectedChat data={
                        {
                           connectedCustomer, socket, maxChatCount, assignedCustomerCount, connectedAgents
                        }
                     }
                        handler={
                           {
                              setConnectedCustomer, setSocket, setAssignedCustomerCount, setNewChatPageCount,
                              customerQueue, connectedCustomerByAgent, selectCustomer
                           }
                        }
                     />
                     <ChatSection data={
                        {
                           connectedCustomer, socket, maxChatCount, assignedCustomerCount, selectedCustomer, message, connectedAgents, chatRef
                        }
                     }
                        handler={
                           {
                              reAssignCustomer, setConnectedCustomer, setSocket, setAssignedCustomerCount, setNewChatPageCount,
                              customerQueue, connectedCustomerByAgent, setMessage, handleChangeStatus, handleSendMessage
                              , endChat
                           }
                        }
                     />
                  </div>

               </div>
            </div>
         </div>
      </div>
   );
}
export default AgentChatBox;