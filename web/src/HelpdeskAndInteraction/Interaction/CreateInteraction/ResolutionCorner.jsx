import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import CursorSVG from './CursorSVG';
import { toast } from "react-toastify";
import { unstable_batchedUpdates } from 'react-dom';
import DynamicForm from './DynamicForm'
/* meeting calendar start */
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { properties } from '../../../properties';
import { post } from '../../../common/util/restUtil';
import { Badge } from 'react-bootstrap';
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useReactToPrint } from 'react-to-print';
import { pageStyle } from '../../../common/util/util';

/* meeting calendar stop */

const ResolutionCorner = (props) => {
  const [isRfresh, setIsrefresh] = useState(false)

  const {
    val,
    idx,
    resolutionPayload,
    selectedService,
    resolutionData,
    formRef,
    formDetails,
    sigPad,
    isFormDisabled,
    customerData,
    values,
    lookupData
  } = props.data

  const {
    setResolutionData,
    workflowApiCall,
    handleAddProducts,
    setProductArr,
    clickToProceed,
    handleSetOrderId,
    setOrderId,
    setFormDetails,
    setIsFormDisabled,
    setValues
  } = props.handler

  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const [completedTyping, setCompletedTyping] = useState(false)
  const [checkedItems, setCheckedItems] = useState({});
  const [displayResponse, setDisplayResponse] = useState()

  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleCheckboxChange = (e, productName) => {
    const productId = e.target.value;
    const qty = 1;

    if (e.target.checked) {
      setSelectedProducts((prevSelected) => [
        ...prevSelected,
        { productId, qty, productName }
      ]);
    } else {
      setSelectedProducts((prevSelected) =>
        prevSelected.filter((product) => product.productId !== productId)
      );
    }
  };


  const handleClickSubmitSelectedProducts = (type, selectedService, resolutionPayload, idx, selectedProducts) => {
    if (selectedProducts?.length > 0) {
      clickToProceed(type, selectedService, resolutionPayload, idx, selectedProducts);
    } else {
      toast.error("Please select at least one product")
      return;
    }
  }

  const [remarks, setRemarks] = useState(null);

  const handleSubmitRemarks = (type, selectedService, resolutionPayload, idx, remarks) => {
    if (!remarks || remarks === null || remarks == "") {
      toast.error("Remarks is mandatory feild");
      return;
    }
    clickToProceed(type, selectedService, resolutionPayload, idx, remarks);
  }

  useEffect(() => {
    if (val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'PRODUCT PURCHASE') {
      val?.msg?.conversation?.message.map((x) => {
        let Rc = 0
        let Nrc = 0
        let totalRc = 0
        let totalNrc = 0
        if (x?.productChargesList && x?.productChargesList.length > 0) {
          x?.productChargesList.forEach((y) => {
            if (y?.chargeDetails?.chargeCat === 'CC_RC') {
              Rc = Number(y?.chargeAmount || 0)
              totalRc = totalRc + Number(y?.chargeAmount || 0)
            } else if (y?.chargeDetails?.chargeCat === 'CC_NRC') {
              totalNrc = totalNrc + Number(y?.chargeAmount || 0)
              Nrc = Number(y?.chargeAmount || 0)
            }
          })
        }
        x.Rc = Rc
        x.Nrc = Nrc
        x.totalRc = totalRc
        x.totalNrc = totalNrc
        x.serviceTypeDescription = x?.productTypeDescription?.description
        x.quantity = 0
        x.isSelected = 'N'
      })
      setProductArr(val?.msg?.conversation?.message);
    }

    if (val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'Below is your order details') {
      setOrderId(val?.msg?.conversation?.message);
    }

    if (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'ORDER_MORE_DETAILS') {
      setOrderId(val?.msg?.conversation?.message?.exactOrderId);
    }

    if (!val?.msg?.callAgain) {
      setIsrefresh(!isRfresh)
    }
    // if (val?.msg?.callAgain) {
    //   workflowApiCall(resolutionPayload)
    // }
  }, [])

  useEffect(() => {
    if (val?.msg?.callAgain && completedTyping) {
      workflowApiCall(resolutionPayload)
    }
  }, [completedTyping])

  const cardBoxStyles = {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px',
  };

  const labelStyles = {
    display: 'flex',
    alignItems: 'center',
  };

  const radioStyles = {
    marginRight: '10px',
  };

  useEffect(() => {
    if (!(val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'string')) {
      setCompletedTyping(true)
      return;
    }
    setCompletedTyping(false);

    let i = 0;
    // const stringResponse = serviceMsg[serviceMsg.length - 1].content;
    const intervalId = setInterval(() => {
      setDisplayResponse(val?.msg?.conversation?.message.slice(0, i));
      i++;
      if (i > val?.msg?.conversation?.message.length) {
        clearInterval(intervalId);
        setCompletedTyping(true);
      }
    }, 30);

    return () => clearInterval(intervalId);
  }, [val?.msg?.conversation?.message]);

  // const handleFormOnChange = (e, idType, formAttributes, i) => {
  //   e.preventDefault();
  //   console.log('i------>', i)
  //   console.log('idType------>', idType)
  //   const { value, id, checked } = e.target;
  //   console.log('value------>', value)
  //   console.log('checked------>', checked)
  //   console.log('e.target.dataset.rawData------>', JSON.parse(e.target.dataset.rawData))
  //   if (idType && e?.target?.dataset?.rawData) {
  //     const data = JSON.parse(e.target.dataset.rawData);
  //     if (formDetails?.[idType]?.[i]?.code !== data?.code && checked) {
  //       console.log('----im here----')
  //       setFormDetails(prevDetails => ({
  //         ...prevDetails,
  //         [idType + '_formAttributes']: [...(prevDetails[idType + '_formAttributes'] || []), formAttributes],
  //         [idType]: (idType === 'choice' || idType === 'radio') ? [data] : [...(prevDetails[idType] || []), data]
  //       }));
  //     } else if (!checked) {
  //       setFormDetails(prevDetails => ({
  //         ...prevDetails,
  //         [idType + '_formAttributes']: [...(prevDetails[idType + '_formAttributes'] || []), formAttributes],
  //         [idType]: (idType === 'choice' || idType === 'radio') ? [data] : [...(prevDetails[idType] || []), data]
  //       }));
  //     }

  //   } else {
  //     setFormDetails({
  //       ...formDetails,
  //       [id + '_formAttributes']: [formAttributes],
  //       [id]: value
  //     })
  //   }
  // }

  const handleFormOnChange = (e, idType, formAttributes, i, fieldType) => {
    const { value, id, checked } = e.target;

    if (idType && e?.target?.dataset?.rawData) {
      const data = JSON.parse(e.target.dataset.rawData);
      setFormDetails(prevDetails => {
        const updatedDetails = {
          ...prevDetails,
          [idType + '_formAttributes']: [...(prevDetails[idType + '_formAttributes'] || []), formAttributes],
        };
        if (checked && prevDetails?.[idType]?.[i]?.code !== data?.code) {
          console.log('----im here----');
          updatedDetails[idType] = (fieldType === 'choice' || fieldType === 'radio') ? [data] : [...(prevDetails[idType] || []), data];
        } else if (!checked) {
          updatedDetails[idType] = (fieldType === 'choice' || fieldType === 'radio') ? [] : (prevDetails[idType] || []).filter(item => item.code !== data?.code);
        }
        return updatedDetails;
      });
    } else {
      setFormDetails(prevDetails => ({
        ...prevDetails,
        [id + '_formAttributes']: [formAttributes],
        [id]: value
      }));
    }
  };

  const handleFormSubmit = (e, idx) => {
    e?.preventDefault()
    // const formData = new FormData(formRef.current)
    if (e?.target?.id === "signature") {
      if (sigPad?.current?.getTrimmedCanvas()?.toDataURL('image/png') === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC') {
        toast.error('Please Provide Signature')
        return
      }
      unstable_batchedUpdates(() => {
        clickToProceed('FORM_SUBMIT', null, resolutionPayload, idx, { ...formDetails, grid: [...values], signature: sigPad?.current?.toDataURL('base64') || '' });
        sigPad?.current?.off()
        setFormDetails({
          ...formDetails,
          signature: sigPad?.current?.toDataURL('base64') || ''
        })
      })
      return
    } else {
      unstable_batchedUpdates(() => {
        clickToProceed('FORM_SUBMIT', e?.nativeEvent?.submitter?.id || null, resolutionPayload, idx, { grid: [...values], ...formDetails });
        setFormDetails({
          ...formDetails
        })
      })
    }
  }

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => document.title = 'dtWorks',
    pageStyle: pageStyle
  });

  /* meeting calendar start */
  const calendarRef = useRef(null);
  const [initialView] = useState("dayGridMonth");
  const [halls, setHalls] = useState([]);
  const [totalMeetingHours, setTotalMeetingHours] = useState(0);
  const [selectedHall, setSelectedHall] = useState(null);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const formatTime = (date) => {
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  useEffect(() => {
    if (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' &&
      val?.msg?.conversation?.description?.toLowerCase() === 'meeting_hall_calendar'
    ) {
      // const calendarEventPath = val?.msg?.conversation?.message?.element;
      fetchHalls();
      // fetchEvents(calendarEventPath, { location: hallId })
    }
  }, [val])

  useEffect(() => {
    if (selectedHall) {
      const calendarEventPath = "";
      fetchEvents(calendarEventPath, { customerId: customerData?.customerId, workType: selectedHall });
      setDisplayedEvents([]);
      setSelectedSlots([]);
      setTotalMeetingHours(0);
    }
  }, [selectedHall])

  const fetchHalls = () => {
    // console.log("val?.msg?.conversation?.message?.customerDetails ==> ", val?.msg?.conversation?.message?.customerDetails);
    post(`${'/api/appointment/get-halls'}`, { customerId: customerData?.customerId }).then((response) => {
      // console.log(response)
      setHalls(response?.data ?? [])
    }).catch((error) => {
      console.error(error);
      setHalls([]);
    }).finally();
  }

  const fetchEvents = (calendarEventPath, payload) => {
    post(`${'/api/appointment/get-hall-slots-availability'}`, payload).then((response) => {
      // console.log(response)
      setDisplayedEvents(response?.data ?? [])
    }).catch((error) => {
      console.error(error);
      setDisplayedEvents([]);
      toast.error("Slots not available in the hall");
    }).finally();
  }

  const handleJoinMeeting = (eventClickInfo) => {
    const event = eventClickInfo.event;
    const selectedDate = moment(event.start).format("DD-MM-YYYY");
    let selectedDateNotInSelectedSlots = false;
    for (let index = 0; index < selectedSlots.length; index++) {
      const element = selectedSlots[index];
      const incomingDate = moment(element.start).format("DD-MM-YYYY");
      // console.log(selectedDate, '!=', incomingDate)
      if (selectedDate != incomingDate || event.startStr == element.startStr) {
        selectedDateNotInSelectedSlots = true;
        break;
      }
    }

    if (!selectedDateNotInSelectedSlots) {
      selectedSlots.push(event);
      setTotalMeetingHours(totalMeetingHours + Number(event?.extendedProps?.interval) ?? 0)
      setSelectedSlots([...selectedSlots]);
    } else {
      toast.error("Same slot selected or slot from different date selected");
    }
  };

  const removeSelectedSlot = (slotId) => {
    let interval = selectedSlots.find(x => x.extendedProps.slotId == slotId)?.extendedProps?.interval ?? 0;
    setTotalMeetingHours(totalMeetingHours - Number(interval));
    setSelectedSlots([...selectedSlots.filter(x => x.extendedProps.slotId !== slotId)]);
  }

  const createAppoinmentAndInteraction = (buttonFlag, selectedService, resolutionPayload, index, remarks) => {
    // 'SUBMIT_REMARKS', selectedService, resolutionPayload, 0, ""
    if (!selectedSlots?.length) {
      toast.error("Please select the slots and proceed");
    } else {
      remarks = "Total selected hours: " + totalMeetingHours;
      // console.log("resolutionPayload", resolutionPayload);
      resolutionPayload['data']['selectedSlotIds'] = selectedSlots.map(x => x.extendedProps.slotId);
      resolutionPayload['data']['bookingStatus'] = "PROCEED";
      clickToProceed({ name: "PROCEED", popup: "Are you sure want proceed?" }, selectedService, resolutionPayload, index, remarks);
    }
  }

  const cancelAppointmentInteraction = (buttonFlag, selectedService, resolutionPayload, index, remarks) => {
    resolutionPayload['data']['bookingStatus'] = "CANCEL";

    clickToProceed({ name: "CANCEL", popup: "Are you sure want to cancel?" }, selectedService, resolutionPayload, index, remarks);
  }

  if (calendarRef.current) {
    const calendarApi = calendarRef.current.getApi();
    const currentDate = moment(); // Get the current date using moment.js
    const currentDateString = currentDate.format('YYYY-MM-DD'); // Format the date

    calendarApi.setOption('validRange', {
      start: currentDateString
    });
  }

  /* meeting calendar stop */

  return (
    <>{
      <div className="chat-box clearfix">

        {
          (val?.from === 'user') && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'string' ? <span>{val?.msg?.conversation?.message}</span>
            : (val?.from === 'bot') && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'string' ? <React.Fragment><span dangerouslySetInnerHTML={{ __html: displayResponse }} /><span>{!completedTyping && <CursorSVG />}</span></React.Fragment>
              : (val?.from === 'user') ?
                <div className="mt-2" id={'hide' + idx}>
                  {
                    Array.isArray(val?.msg?.description) && 'productId' in val?.msg?.description[0] && 'qty' in val?.msg?.description[0] && 'productName' in val?.msg?.description[0] ?
                      val?.msg?.description?.map((ele) => <span>{ele?.productName}</span>)
                      : <span>{val?.msg?.description}</span>
                  }
                </div>

                : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.message?.element === 'COLLECT_REMARKS') ?
                  <div className="mt-2" id={'hide' + idx}>
                    <textarea name="" id="remarks" cols="70" rows="4" placeholder='Type remarks here..'></textarea>
                    <br />
                    <button className="skel-btn-submit" type='button' onClick={(e) => {
                      clickToProceed('SUBMIT_REMARKS', selectedService, resolutionPayload, idx, document.getElementById('remarks').value)
                    }}>Submit</button>
                  </div>

                  : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.description?.toLowerCase() === 'meeting_hall_calendar') ?
                    /* meeting calendar start */
                    <div className="mt-2">
                      {halls?.map((hall) => (
                        <div className="form-group" key={hall.code}>
                          <div className="radio radio-primary mb-2 skel-res-radio">
                            <input type="radio" id={hall.code} className="form-check-input" name="meetingHall" value={hall.code} onChange={e => setSelectedHall(e.target.value)} />
                            <label htmlFor={hall.code} className='font-400'>{hall.description}</label>
                          </div>
                        </div>
                      ))}
                      {halls?.length > 0 && (
                        <div className='skel-res-fc-cal'>
                          {/* <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                            initialView={initialView}
                            dayMaxEventRows={2}
                            headerToolbar={{
                              start: "prev,next today",
                              center: "title",
                              end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                            }}
                            eventClick={handleJoinMeeting}
                            events={displayedEvents}
                            eventContent={(eventInfo) => (
                              <div className='skel-res-fc-event'>
                                <ul style={{ display: 'block', padding: '1px' }}>
                                  <li style={{ whiteSpace: 'pre-wrap' }}>{formatTime(eventInfo.event.start)} - {formatTime(eventInfo.event.end)}</li>
                                </ul>
                              </div>
                            )}
                          /> */}
                          <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                            initialView="dayGridMonth"
                            dayMaxEventRows={2}
                            headerToolbar={{
                              start: "prev,next today",
                              center: "title",
                              end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                            }}
                            // Add your eventClick, events, and eventContent handlers here
                            eventClick={handleJoinMeeting}
                            events={displayedEvents}
                            eventContent={(eventInfo) => (
                              <div className='skel-res-fc-event'>
                                <ul style={{ display: 'block', padding: '1px' }}>
                                  <li style={{ whiteSpace: 'pre-wrap' }}>
                                    {formatTime(eventInfo.event.start)} - {formatTime(eventInfo.event.end)}
                                  </li>
                                </ul>
                              </div>
                            )}
                          />
                        </div>
                      )}
                      {selectedSlots?.length > 0 && (
                        <div className='skel-res-sel-slot'>
                          {selectedSlots?.map((selectedSlot, index) => (
                            <div className='skel-res-sel-slot-rec' key={index}>
                              <p>{moment(selectedSlot.start).format("HH:mm")} - {moment(selectedSlot.end).format("HH:mm")}</p>
                              <p onClick={() => removeSelectedSlot(selectedSlot?.extendedProps?.slotId)} className="skel-res-close-icon">x</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className='mt-2'>
                        <span>Total meeting hours: {(totalMeetingHours ?? 0) / 60} hrs</span>
                      </div>
                      <div className="text-center mt-2" id="hide0">
                        <button className="skel-btn-cancel" type='button' onClick={(e) => {
                          cancelAppointmentInteraction('', selectedService, resolutionPayload, 0, "");
                        }}>Cancel</button>
                        <button className="skel-btn-submit" type='button' onClick={(e) => {
                          createAppoinmentAndInteraction('', selectedService, resolutionPayload, 0, "");
                        }}>Proceed</button>
                      </div>

                    </div>
                    /* meeting calendar stop */

                    : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.message?.element === 'DROPDOWN') ?
                      <div className="text-center mt-2" id={'hide' + idx}>
                        <select name="" id="" className='form-control'>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </div>

                      : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.message?.element === 'RADIO') ?
                        <div className="text-center mt-2" id={'hide' + idx}>
                          <input type="radio" /> lable name here
                        </div>

                        : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.message?.element === 'INPUTBOX') ?
                          <div className="text-center mt-2" id={'hide' + idx}>
                            <input type="text" id="inputBoxData" className='form-control' placeholder='type here..' />
                            <br />
                            <button className="skel-btn-submit" type='button' onClick={(e) => {
                              clickToProceed('SUBMIT_REMARKS', selectedService, resolutionPayload, idx, document.getElementById('inputBoxData').value)
                            }}>Submit</button>
                          </div>

                          : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.message?.element === 'TEXTAREA') ?
                            <div className="text-center mt-2" id={'hide' + idx}>
                              <textarea name="" id="textAreaData" cols="70" rows="4" placeholder='Type here..'></textarea>
                              <br />
                              <button className="skel-btn-submit" type='button' onClick={(e) => {
                                clickToProceed('SUBMIT_REMARKS', selectedService, resolutionPayload, idx, document.getElementById('textAreaData').value)
                              }}>Submit</button>
                            </div>


                            : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'RADIO_BUTTON') ?
                              <div className="text-center mt-2" id={'hide' + idx}>
                                {
                                  val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                    return <div className='skel-res-radio-list' key={i}>
                                      <label>
                                        <input
                                          type="radio"
                                          name={value}
                                          value={value}
                                          onClick={(e) => {
                                            clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value)
                                          }}
                                        />
                                        <span className='skel-res-value-stat'>{value}</span>
                                      </label>
                                    </div>
                                  })
                                }
                              </div>

                              : val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'DROPDOWN_BUTTON' ? (
                                <div className="text-center mt-2" id={'hide' + idx}>
                                  <select name="" id="" className='form-control'>
                                    {val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => (
                                      <option key={i} value={value}>{value}</option>
                                    ))}
                                  </select>
                                </div>
                              )

                                : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.message?.element === 'MANUAL_STATEMENTS') ?
                                  <div className="text-center mt-2" id={'hide' + idx}>
                                    <textarea name="" id="remarks" cols="70" rows="4" placeholder='Type statement here..'></textarea>
                                    <br />
                                    <button className="skel-btn-submit" type='button' onClick={(e) => {
                                      clickToProceed('SUBMIT_REMARKS', selectedService, resolutionPayload, idx, document.getElementById('remarks').value)
                                    }}>Submit</button>
                                  </div>

                                  : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_INTERACTIONS') ?
                                    <div className="text-center mt-2" id={'hide' + idx}>
                                      {
                                        val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                          return <div className='skel-res-radio-list' key={i}>
                                            <label>
                                              <input
                                                type="radio"
                                                name={value.intxnNo}
                                                value={value}
                                                onClick={(e) => {
                                                  clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value.intxnNo)
                                                }}
                                              />
                                              <table>
                                                <tr>
                                                  <td><span>{value?.intxnNo}</span></td>
                                                  <td><span>{value?.intxnStatus}</span></td>
                                                  <td><span>{value?.intxnDescription}</span></td>
                                                  <td><span>{moment(value?.createdAt).format('DD MMM YYYY')}</span>
                                                  </td>
                                                </tr>
                                              </table>
                                            </label>
                                          </div>
                                        })
                                      }
                                    </div>

                                    : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_ADDONS') ?
                                      <div className="text-center mt-2" id={'hide' + idx}>
                                        {
                                          val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                            return <div style={cardBoxStyles}>
                                              <label style={labelStyles}>
                                                <input style={radioStyles} type="radio" name={value.productNo} value={value} onClick={(e) => { clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value.productNo) }} />
                                                <div>
                                                  <span>{value?.productName}</span>
                                                  <span>{value?.productNo}</span>
                                                  <span>{value?.productTypeDescription?.description}</span>
                                                  {value?.productChargesList?.map((ele, i) => {
                                                    return (
                                                      <>
                                                        <span>{ele?.chargeDetails?.currencyDesc?.description} {ele?.chargeAmount}</span>
                                                        <span>{ele?.chargeDetails?.chargeName}</span>
                                                        <span>{ele?.chargeDetails?.glcode}</span>
                                                      </>
                                                    )
                                                  })}
                                                </div>
                                              </label>
                                            </div>
                                          })
                                        }
                                      </div>

                                      : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_BILLS') ?
                                        <div className="text-center mt-2" id={'hide' + idx}>
                                          {
                                            val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                              return <div className='skel-res-radio-list' key={i}>
                                                <label>
                                                  <input
                                                    type="radio"
                                                    name={value.invNo}
                                                    value={value}
                                                    onClick={(e) => {
                                                      clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value.invNo)
                                                    }}
                                                  />
                                                  {value?.invNo + ' ' + value?.invAmt + ' ' + value?.invOsAmt + ' ' + value?.billingStatus + ' ' + months[Number(value?.billMonth) - 1] + ' ' + value?.billYear + ' ' + moment(value?.createdAt).format('DD MMM YYYY')}
                                                </label>
                                              </div>
                                            })
                                          }
                                        </div>

                                        : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_INVOICES') ?
                                          <div className="text-center mt-2" id={'hide' + idx}>
                                            {
                                              val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                                return <div className='skel-res-radio-list' key={i}>
                                                  <label>
                                                    <input
                                                      type="radio"
                                                      name={value.invNo}
                                                      value={value}
                                                      onClick={(e) => {
                                                        clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value.invNo)
                                                      }}
                                                    />
                                                    {value?.invNo + ' ' + value?.invAmt + ' ' + value?.invOsAmt + ' ' + value?.invoiceStatus + ' ' + months[Number(value?.billMonth) - 1] + ' ' + value?.billYear + ' ' + moment(value?.createdAt).format('DD MMM YYYY')}
                                                  </label>
                                                </div>
                                              })
                                            }
                                          </div>

                                          : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'COLLECT_CHANNELS') ?
                                            <div className="text-center mt-2" id={'hide' + idx}>
                                              {
                                                val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                                  return <div className='skel-res-radio-list' key={i}>
                                                    <label>
                                                      <input
                                                        type="radio"
                                                        name={value.o_channel_code}
                                                        value={value}
                                                        onClick={(e) => {
                                                          clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value.o_channel_code)
                                                        }}
                                                      />
                                                      {value?.o_channel_desc}
                                                    </label>
                                                  </div>
                                                })
                                              }
                                            </div>

                                            : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'COLLECT_CHANNEL_ACTIVITY') ?
                                              <div className="text-center mt-2" id={'hide' + idx}>
                                                {
                                                  val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                                    return <div className='custom-control custom-checkbox' key={i}>
                                                      <label>
                                                        <input
                                                          type="radio"
                                                          name={value?.o_channel_code}
                                                          value={value}
                                                          onClick={(e) => {
                                                            clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value?.o_channel_code)
                                                          }}
                                                        />
                                                        {value?.o_entity_no + ' ' + value?.o_entity_channel_desc + ' ' + value?.o_entity_status_desc + ' ' + moment(value?.o_created_at).format('DD MMM YYYY')}
                                                      </label>
                                                    </div>
                                                  })
                                                }
                                              </div>

                                              : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_SUBSCRIPTIONS') ?
                                                <div className="text-center mt-2" id={'hide' + idx}>
                                                  {
                                                    val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                                      return <div className='skel-res-radio-list' key={i}>
                                                        <label>
                                                          <input
                                                            type="radio"
                                                            name={value.serviceNo}
                                                            value={value}
                                                            onClick={(e) => {
                                                              clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value.serviceNo)
                                                            }}
                                                          />
                                                          <span>{value?.serviceNo + ' | ' + value?.serviceName}</span>
                                                        </label>
                                                      </div>
                                                    })
                                                  }
                                                </div>

                                                : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_STATEMENTS') ?
                                                  <div className="text-center mt-2" id={'hide' + idx}>
                                                    {
                                                      val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                                        return <div className='skel-res-radio-list' key={i}>
                                                          <label>
                                                            <input
                                                              type="radio"
                                                              name={value}
                                                              value={value}
                                                              onClick={(e) => {
                                                                clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value)
                                                              }}
                                                            />
                                                            <span className='skel-res-value-stat'>{value}</span>
                                                          </label>
                                                        </div>
                                                      })
                                                    }
                                                  </div>

                                                  : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_TEXTAREA') ?
                                                    <div className="text-center mt-2" id={'hide' + idx}>
                                                      {
                                                        <div className='skel-res-list'>
                                                          <label>
                                                            <textarea name="" id="" cols="30" rows="5" placeholder='Enter reason for your request/Replacement' onKeyUp={(e) => setRemarks(e?.target?.value)}></textarea>
                                                          </label>
                                                          <button className='btn btn-primary' type='button' onClick={(e) => {
                                                            handleSubmitRemarks('SELECTED_INTXN', selectedService, resolutionPayload, idx, remarks);
                                                          }}>Sumbit</button>
                                                        </div>
                                                      }
                                                    </div>

                                                    : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_RECENT_ACTIVITY') ?
                                                      <div id={'hide' + idx}>

                                                        <div className="text-center mt-2" >
                                                          {val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.recentIntxns?.rows?.length > 0 ? (
                                                            <div>
                                                              <span>Recent interactions</span>
                                                              {val?.msg?.conversation?.message?.element?.recentIntxns?.rows?.map((value, i) => (
                                                                <div className="skel-res-radio-list" key={i}>
                                                                  <label>
                                                                    <input
                                                                      type="radio"
                                                                      name={value.intxnNo}
                                                                      value={value}
                                                                      onClick={(e) => {
                                                                        clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, 'INTERACTION');
                                                                      }}
                                                                    />
                                                                    <table>
                                                                      <tbody>
                                                                        <tr>
                                                                          <td>
                                                                            <span>{value?.intxnNo}</span>
                                                                          </td>
                                                                          <td>
                                                                            <span>{value?.intxnStatus}</span>
                                                                          </td>
                                                                          <td>
                                                                            <span>{value?.intxnDescription}</span>
                                                                          </td>
                                                                          <td>
                                                                            <span>{moment(value?.createdAt).format('DD MMM YYYY')}</span>
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </label>
                                                                </div>
                                                              ))}
                                                            </div>
                                                          ) : (
                                                            <span>No recent interactions found</span>
                                                          )}
                                                        </div>

                                                        <div className="text-center mt-2">
                                                          {
                                                            val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.recentChannels?.length > 0 ? (
                                                              <div>
                                                                <span>Recent channels</span>
                                                                {val?.msg?.conversation?.message?.element?.recentChannels?.map((value, i) => {
                                                                  return <div className='skel-res-radio-list' key={i}>
                                                                    <label>
                                                                      <input
                                                                        type="radio"
                                                                        name={value.o_channel_code}
                                                                        value={value}
                                                                        onClick={(e) => {
                                                                          clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value.o_channel_code)
                                                                        }}
                                                                      />
                                                                      {value?.o_channel_desc}
                                                                    </label>
                                                                  </div>
                                                                })}
                                                              </div>) : <span>No recent channels found</span>
                                                          }
                                                        </div>

                                                        <div className="text-center mt-2">
                                                          {
                                                            val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.recentSubscriptions?.rows?.length > 0 ?

                                                              (
                                                                <div>
                                                                  <span>Recent Subscriptions</span>
                                                                  {val?.msg?.conversation?.message?.element?.recentSubscriptions?.rows?.map((value, i) => {
                                                                    return <div className='skel-res-radio-list' key={i}>
                                                                      <label>
                                                                        <input
                                                                          type="radio"
                                                                          name={value.serviceNo}
                                                                          value={value}
                                                                          onClick={(e) => {
                                                                            clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, 'SUBSCRIPTION')
                                                                          }}
                                                                        // onClick={(e) => {
                                                                        //   clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value.serviceNo)
                                                                        // }}
                                                                        />
                                                                        <span>{value?.serviceNo + ' | ' + value?.serviceName}</span>
                                                                      </label>
                                                                    </div>
                                                                  })}
                                                                </div>) : <span>No recent subscriptions found</span>
                                                          }
                                                        </div>

                                                        <div className="text-center mt-2">
                                                          {
                                                            val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.recentBills?.rows?.length > 0 ?

                                                              (<div>
                                                                <span>Recent Bills</span>
                                                                {val?.msg?.conversation?.message?.element?.recentBills?.rows?.map((value, i) => {
                                                                  return <div className='skel-res-radio-list' key={i}>
                                                                    <label>
                                                                      <input
                                                                        type="radio"
                                                                        name={value.invNo}
                                                                        value={value}
                                                                        onClick={(e) => {
                                                                          clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, 'BILLS')
                                                                        }}
                                                                      // onClick={(e) => {
                                                                      //   clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value.invNo)
                                                                      // }}
                                                                      />
                                                                      {value?.invNo + ' ' + value?.invAmt + ' ' + value?.invOsAmt + ' ' + value?.billingStatus + ' ' + months[Number(value?.billMonth) - 1] + ' ' + value?.billYear + ' ' + moment(value?.createdAt).format('DD MMM YYYY')}
                                                                    </label>
                                                                  </div>
                                                                })}
                                                              </div>
                                                              ) : <span>No recent bills found</span>
                                                          }
                                                        </div>

                                                        <div className="text-center mt-2">
                                                          {
                                                            val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.recentPayment?.rows?.length > 0 ?

                                                              (<div>
                                                                <span>Recent Bills</span>
                                                                {val?.msg?.conversation?.message?.element?.recentPayment?.rows?.map((value, i) => {
                                                                  return <div className='skel-res-radio-list' key={i}>
                                                                    <label>
                                                                      <input
                                                                        type="radio"
                                                                        name={value.invNo}
                                                                        value={value}
                                                                        onClick={(e) => {
                                                                          clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, 'PAYMENTS')
                                                                        }}
                                                                      // onClick={(e) => {
                                                                      //   clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value.invNo)
                                                                      // }}
                                                                      />
                                                                      {value?.invNo + ' ' + value?.invAmt + ' ' + value?.invOsAmt + ' ' + value?.invoiceStatus + ' ' + months[Number(value?.billMonth) - 1] + ' ' + value?.billYear + ' ' + moment(value?.createdAt).format('DD MMM YYYY')}
                                                                    </label>
                                                                  </div>
                                                                })}
                                                              </div>
                                                              ) : <span>No recent payments found</span>
                                                          }
                                                        </div>

                                                        <div className="text-center mt-2">
                                                          {
                                                            val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.recentOrders?.rows?.length > 0 ?
                                                              (<div>
                                                                <span>Recent Orders</span>
                                                                {val?.msg?.conversation?.message?.element?.recentOrders?.rows?.map((value, i) => {
                                                                  return <div className='skel-res-radio-list' key={i}>
                                                                    <label>
                                                                      <input
                                                                        type="radio"
                                                                        name={value}
                                                                        value={value}
                                                                        onClick={(e) => {
                                                                          setOrderId(value?.orderNo);
                                                                          clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, 'ORDERS')
                                                                        }}
                                                                      // onClick={(e) => {
                                                                      //   setOrderId(value?.orderNo);
                                                                      //   clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value?.orderNo)
                                                                      // }}
                                                                      />
                                                                      <table>
                                                                        <tr>
                                                                          <td><span>{value?.serviceDesc?.service_name}</span></td>
                                                                          <td><span>{value?.billAmount}</span></td>
                                                                          <td><span>{value?.orderChannelDesc?.description}</span></td>
                                                                          <td><span>{value?.orderStatusDesc?.description}</span></td>
                                                                          <td><span>{value?.orderCategoryDesc?.description}</span></td>
                                                                          <td><span>{value?.orderCategoryDesc?.description}</span></td>
                                                                          <td><span>{value?.orderPriorityDesc?.description}</span></td>
                                                                          <td><span>{value?.orderDescription}</span></td>
                                                                          <td><span>{moment(value?.createdAt).format('DD MMM YYYY')}</span>
                                                                          </td>
                                                                        </tr>
                                                                      </table>

                                                                    </label>
                                                                  </div>
                                                                })}
                                                              </div>) : <span>No recent orders found</span>
                                                          }
                                                        </div>
                                                      </div>


                                                      : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_ORDERS') ?
                                                        <div className="text-center mt-2" id={'hide' + idx}>
                                                          {
                                                            val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                                              return <div className='skel-res-radio-list' key={i}>
                                                                <label>
                                                                  <input
                                                                    type="radio"
                                                                    name={value}
                                                                    value={value}
                                                                    onClick={(e) => {
                                                                      setOrderId(value?.orderNo);
                                                                      clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value?.orderNo)
                                                                    }}
                                                                  />
                                                                  <table>
                                                                    <tr>
                                                                      <td><span>{value?.serviceDesc?.service_name}</span></td>
                                                                      <td><span>{value?.billAmount}</span></td>
                                                                      <td><span>{value?.orderChannelDesc?.description}</span></td>
                                                                      <td><span>{value?.orderStatusDesc?.description}</span></td>
                                                                      <td><span>{value?.orderCategoryDesc?.description}</span></td>
                                                                      <td><span>{value?.orderCategoryDesc?.description}</span></td>
                                                                      <td><span>{value?.orderPriorityDesc?.description}</span></td>
                                                                      <td><span>{value?.orderDescription}</span></td>
                                                                      <td><span>{moment(value?.createdAt).format('DD MMM YYYY')}</span>
                                                                      </td>
                                                                    </tr>
                                                                  </table>

                                                                </label>
                                                              </div>
                                                            })
                                                          }
                                                        </div>

                                                        : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_REPEATED_REQ') ?
                                                          <div className="text-center mt-2" id={'hide' + idx}>
                                                            {
                                                              val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                                                return <div className='skel-res-radio-list' key={i}>
                                                                  <label>
                                                                    <input
                                                                      type="radio"
                                                                      name={value}
                                                                      value={value}
                                                                      onClick={(e) => {
                                                                        clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value?.request_no)
                                                                      }}
                                                                    />
                                                                    <table>
                                                                      <tr>
                                                                        <td><span>{value?.request_no}</span></td>
                                                                        <td><span>{value?.request_status_desc}</span></td>
                                                                        <td><span>{moment(value?.request_date).format('DD MMM YYYY')}</span></td>
                                                                        <td><span>{value?.request_description}</span></td>
                                                                      </tr>
                                                                    </table>

                                                                  </label>
                                                                </div>
                                                              })
                                                            }
                                                          </div>

                                                          : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'COLLECT_PRODUCT_FAMILY') ?
                                                            <div className="text-center mt-2" id={'hide' + idx}>
                                                              {
                                                                val?.msg?.conversation?.message?.element?.rows && val?.msg?.conversation?.message?.element?.rows?.length > 0 && val?.msg?.conversation?.message?.element?.rows?.map((value, i) => {
                                                                  return <div className='skel-res-radio-list' key={i}>
                                                                    <label>
                                                                      <input
                                                                        type="radio"
                                                                        name={value}
                                                                        value={value}
                                                                        onClick={(e) => {
                                                                          clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value?.code)
                                                                        }}
                                                                      />
                                                                      {value?.description}
                                                                    </label>
                                                                  </div>
                                                                })
                                                              }
                                                            </div>

                                                            : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_PRODUCTS') ?
                                                              <div className="text-center mt-2" id={'hide' + idx}>
                                                                {
                                                                  val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                                                    return <div className='skel-res-radio-list' key={i}>
                                                                      <label>
                                                                        <input
                                                                          type="checkbox"
                                                                          name={value}
                                                                          value={value.productId} // Assuming value.productName is the value you want
                                                                          checked={!selectedProducts.find((ele) => ele?.productId == value.productId) ? false : true}
                                                                          onChange={(e) => handleCheckboxChange(e, value?.productName)}
                                                                        />
                                                                        {value?.productName}
                                                                      </label>
                                                                    </div>
                                                                  })
                                                                }
                                                                <button type="button" className='btn btn-primary' onClick={(e) => {
                                                                  handleClickSubmitSelectedProducts('SELECTED_INTXN', selectedService, resolutionPayload, idx, selectedProducts)
                                                                }}>Submit</button>
                                                              </div>

                                                              : (val?.from === 'user' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.message?.element === 'YES_NO_BUTTON') ?
                                                                <div className="text-center mt-2" id={'hide' + idx}>
                                                                  {
                                                                    val?.msg?.conversation?.message?.attributes && val?.msg?.conversation?.message?.attributes?.length > 0 && val?.msg?.conversation?.message?.attributes.map((ele, i) => {
                                                                      return <button key={i} className="skel-btn-submit" type='button' onClick={(e) => {
                                                                        clickToProceed(ele, selectedService, resolutionPayload, idx, val?.msg?.conversation?.description)
                                                                      }}>{ele?.value}</button>
                                                                    })
                                                                  }
                                                                </div>

                                                                : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.message?.element === 'REQUEST_REPLACE_CHECKBOX') ?
                                                                  <div className="text-center mt-2" id={'hide' + idx}>
                                                                    {
                                                                      val?.msg?.conversation?.message?.attributes && val?.msg?.conversation?.message?.attributes?.length > 0 && val?.msg?.conversation?.message?.attributes.map((ele, i) => {
                                                                        return <button key={i} className="skel-btn-submit" type='button' onClick={(e) => {
                                                                          clickToProceed(ele, selectedService, resolutionPayload, idx, val?.msg?.conversation?.description)
                                                                        }}>{ele?.value}</button>
                                                                      })
                                                                    }
                                                                  </div>

                                                                  : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.message?.element === 'YES_NO_BUTTON') ?
                                                                    <div className="text-center mt-2" id={'hide' + idx}>
                                                                      {
                                                                        val?.msg?.conversation?.message?.attributes && val?.msg?.conversation?.message?.attributes?.length > 0 && val?.msg?.conversation?.message?.attributes.map((ele, i) => {
                                                                          return <button key={i} className="skel-btn-submit" type='button' onClick={(e) => {
                                                                            clickToProceed(ele, selectedService, resolutionPayload, idx, val?.msg?.conversation?.description)
                                                                          }}>{ele?.value}</button>
                                                                        })
                                                                      }
                                                                    </div>

                                                                    : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'PRODUCT PURCHASE') ?
                                                                      <div>
                                                                        {val?.msg?.conversation?.message && val?.msg?.conversation?.message?.length > 0 && val?.msg?.conversation?.message?.map((value, i) => {
                                                                          return <div className='custom-control custom-checkbox' key={i}>
                                                                            <input type="checkbox" id={`mandatory${i}`}
                                                                              onChange={(e) => { handleAddProducts(e.target.checked, value) }}
                                                                              value={value?.productId}
                                                                            />
                                                                            {value?.productName}
                                                                          </div>
                                                                        })
                                                                        }
                                                                      </div>

                                                                      : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_NOT_CLOSED_ORDERS') ?
                                                                        <div>
                                                                          {val?.msg?.conversation?.message &&
                                                                            <div className='custom-control custom-checkbox'>
                                                                              <table>
                                                                                <tr>
                                                                                  <td><span>{val?.msg?.conversation?.message?.orderNo?.split('_')[0]}</span></td>
                                                                                  <td><span>{val?.msg?.conversation?.message?.serviceDesc?.service_name}</span></td>
                                                                                  <td><span>{val?.msg?.conversation?.message?.orderStatusDesc?.description}</span></td>
                                                                                  <td><span>{val?.msg?.conversation?.message?.orderPriorityDesc?.description}</span></td>
                                                                                  <td><span>{val?.msg?.conversation?.message?.orderChannelDesc?.description}</span></td>
                                                                                  <td><span>{val?.msg?.conversation?.message?.orderMode}</span></td>
                                                                                  <td><span>{moment(val?.msg?.conversation?.message?.createdAt).format('DD MMM YYYY')}</span>
                                                                                  </td>
                                                                                </tr>
                                                                              </table>
                                                                            </div>
                                                                          }
                                                                        </div>

                                                                        : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_SERVICE_USAGE') ?
                                                                          <div>
                                                                            {val?.msg?.conversation?.message && val?.msg?.conversation?.message?.length > 0 && val?.msg?.conversation?.message?.map((value, i) => {
                                                                              return <div className='custom-control custom-checkbox' key={i}>
                                                                                <table>
                                                                                  <tr>
                                                                                    <td><span>{value?.serviceNo}</span></td>
                                                                                    <td><span>{value?.serviceName}</span></td>
                                                                                    <td><span>{value?.serviceTypeDesc?.description}</span></td>
                                                                                    <td><span>{value?.serviceStatusDesc?.description}</span></td>
                                                                                    <td><span>{moment(value?.createdAt).format('DD MMM YYYY')}</span>
                                                                                    </td>
                                                                                  </tr>
                                                                                </table>
                                                                              </div>
                                                                            })
                                                                            }
                                                                          </div>

                                                                          : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_SERVICE_USAGE') ?
                                                                            <div className="text-center mt-2" id={'hide' + idx}>
                                                                              {
                                                                                val?.msg?.conversation?.message?.element && val?.msg?.conversation?.message?.element?.length > 0 && val?.msg?.conversation?.message?.element?.map((value, i) => {
                                                                                  return <div className='skel-res-radio-list' key={i}>
                                                                                    <label>
                                                                                      <input
                                                                                        type="radio"
                                                                                        name={value.serviceNo}
                                                                                        value={value}
                                                                                        onClick={(e) => {
                                                                                          clickToProceed('SELECTED_INTXN', selectedService, resolutionPayload, idx, value.serviceNo)
                                                                                        }}
                                                                                      />
                                                                                      <table>
                                                                                        <tr>
                                                                                          <td><span>{value?.serviceNo}</span></td>
                                                                                          <td><span>{value?.serviceName}</span></td>
                                                                                          <td><span>{value?.serviceTypeDesc?.description}</span></td>
                                                                                          <td><span>{value?.serviceStatusDesc?.description}</span></td>
                                                                                          <td><span>{moment(value?.createdAt).format('DD MMM YYYY')}</span>
                                                                                          </td>
                                                                                        </tr>
                                                                                      </table>
                                                                                    </label>
                                                                                  </div>
                                                                                })
                                                                              }
                                                                            </div>

                                                                            : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'Below is your billing details') ? val?.msg?.conversation?.message?.rows?.map((ele, i) => {
                                                                              return <div className="text-center imessage mt-2">
                                                                                <div className='custom-control custom-checkbox container-five-row'>
                                                                                  <div><strong>Total Invoice Amount</strong><br />{ele?.invAmtTotal || '-'}</div>
                                                                                  <div><strong>Total Advance Amount</strong><br />{ele?.advanceTotal || '-'}</div>
                                                                                  <div><strong>Total Previous Amount</strong><br />{ele?.PreviousBalance || '-'}</div>
                                                                                  <div><strong>total Outstanding Amount</strong><br />{ele?.totalOutstanding || '-'}</div>
                                                                                </div>
                                                                              </div>
                                                                            })

                                                                              : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'Below is your order details') ?
                                                                                <div className="skel-plans">
                                                                                  {val?.msg?.conversation?.message && val?.msg?.conversation?.message?.length > 0 && val?.msg?.conversation?.message?.map((value, i) => {
                                                                                    return <div className='skel-plans-product skel-plan skel-inter-chkbox' key={i}>
                                                                                      <label className="premium-plan">
                                                                                        <input type="checkbox" id={`mandatory${i}`}
                                                                                          onChange={(e) => { handleSetOrderId(e.target.checked, value) }}
                                                                                          value={value?.orderId}
                                                                                        />
                                                                                        <div className="plan-content">
                                                                                          <p><strong>Bill Amount- </strong>{value?.billAmount}</p>
                                                                                          <p><strong>Order Number-</strong> {value?.orderNo}</p>
                                                                                          <p><strong>Order Description - </strong>{value?.orderDescription}</p>
                                                                                          <div className="skel-chk-base"></div>
                                                                                        </div>
                                                                                      </label>
                                                                                    </div>
                                                                                  })
                                                                                  }
                                                                                </div>

                                                                                : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'CANCEL_ORDER_API_RESPONSE') ?
                                                                                  <div>
                                                                                    <span>MESSAGE</span>
                                                                                    {val?.msg?.conversation?.message && val?.msg?.conversation?.message?.length > 0 && val?.msg?.conversation?.message?.map((value, i) => {
                                                                                      return <div className='custom-control custom-checkbox pl-0' key={i}>
                                                                                        <div className={value?.status === 200 ? 'skel-inter-success-msg' : 'skel-inter-err-msg'}>
                                                                                          <span>{value?.orderNo}</span>
                                                                                          <span>{value?.status}</span>
                                                                                          <span>{value?.message}</span>
                                                                                        </div>
                                                                                      </div>
                                                                                    })
                                                                                    }
                                                                                  </div>

                                                                                  : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'Send Balance to customer') ?
                                                                                    <div className='custom-control custom-checkbox container-three-row'>
                                                                                      <div><strong>Limit</strong><br />  {val?.msg?.conversation?.message?.serviceLimit}</div>
                                                                                      <div><strong>Usage</strong><br />  {val?.msg?.conversation?.message?.serviceUsage}</div>
                                                                                      <div><strong>Balance</strong><br />  {val?.msg?.conversation?.message?.serviceBalance}</div>
                                                                                    </div>

                                                                                    : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'BILL_DATES') ?
                                                                                      <div className="text-center mt-2" id={'hide' + idx}>
                                                                                        {
                                                                                          [...new Map(val?.msg?.conversation?.message?.element.map(item =>
                                                                                            [item['bill_month'], item])).values()].map((ele, i) => {
                                                                                              return <button className="skel-btn-submit" type='button' onClick={() => {
                                                                                                clickToProceed(ele, selectedService, resolutionPayload, idx, val?.msg?.conversation?.description);
                                                                                              }} >{months[Number(ele.bill_month) - 1]} {ele.bill_year}</button>
                                                                                            })
                                                                                        }
                                                                                      </div>

                                                                                      : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'BILL_INFO') ?
                                                                                        <div className="text-center imessage mt-2">
                                                                                          {
                                                                                            val?.msg?.conversation?.message?.rows?.map((ele, i) => {
                                                                                              return <div>
                                                                                                <div className='custom-control custom-checkbox container-five-row'>
                                                                                                  <div><strong>Total Invoice Amount</strong><br />{ele?.invAmtTotal || '-'}</div>
                                                                                                  <div><strong>Total Advance Amount</strong><br />{ele?.advanceTotal || '-'}</div>
                                                                                                  <div><strong>Total Previous Amount</strong><br />{ele?.PreviousBalance || '-'}</div>
                                                                                                  <div><strong>total Outstanding Amount</strong><br />{ele?.totalOutstanding || '-'}</div>
                                                                                                </div>
                                                                                              </div>
                                                                                            })
                                                                                          }
                                                                                        </div>

                                                                                        : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'ORDER_DETAILS') ?
                                                                                          <div className="imessage mt-2">
                                                                                            <div className='skel-rc-order-data container-two-row'>
                                                                                              <div className='div-brd'><strong>Order No</strong><br />{val?.msg?.conversation?.message?.orderNo || '-'}</div>
                                                                                              <div className='div-brd'><strong>Bill Amount</strong><br />{val?.msg?.conversation?.message?.billAmount || '-'}</div>
                                                                                              <div className='div-brd'><strong>Order Channel</strong><br />{val?.msg?.conversation?.message?.orderChannelDesc?.description || '-'}</div>
                                                                                              <div className='div-brd'><strong>Order Status</strong><br />{val?.msg?.conversation?.message?.orderStatusDesc?.description || '-'}</div>

                                                                                            </div>
                                                                                          </div>

                                                                                          : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'ORDER_MORE_DETAILS') ?
                                                                                            <div className="imessage mt-2">
                                                                                              <div>
                                                                                                <div className='skel-rc-order-data container-two-row'>
                                                                                                  <div className='div-brd'><strong>Order No</strong><br />{val?.msg?.conversation?.message?.orderNo || '-'}</div>
                                                                                                  <div className='div-brd'><strong>Bill Amount</strong><br />{val?.msg?.conversation?.message?.billAmount || '-'}</div>
                                                                                                  <div className='div-brd'><strong>Customer Name</strong><br />{val?.msg?.conversation?.message?.customerDetails?.firstName + ' ' + val?.msg?.conversation?.message?.customerDetails?.lastName || '-'}</div>
                                                                                                  <div className='div-brd'><strong>Customer Contact No</strong><br />{val?.msg?.conversation?.message?.customerDetails?.customerContact[0]?.contactNo || '-'}</div>
                                                                                                </div>
                                                                                                <span>Order Products</span>
                                                                                                {val?.msg?.conversation?.message?.childOrder?.map((ele) => {
                                                                                                  return (
                                                                                                    <>
                                                                                                      {ele?.orderProductDtls?.map((e) => {
                                                                                                        return (
                                                                                                          <>
                                                                                                            <div className='skel-rc-table'>
                                                                                                              <table>
                                                                                                                <tr>
                                                                                                                  <td><strong>Product Name</strong></td>
                                                                                                                  <td>{e?.productDetails?.productName || '-'}</td>
                                                                                                                </tr>
                                                                                                                <tr>
                                                                                                                  <td><strong>Product Amount</strong></td>
                                                                                                                  <td>{e?.billAmount || '-'}</td>
                                                                                                                </tr>
                                                                                                                <tr>
                                                                                                                  <td><strong>Product No</strong></td>
                                                                                                                  <td>{e?.productDetails?.productNo || '-'}</td>
                                                                                                                </tr>
                                                                                                                <tr>
                                                                                                                  <td><strong>Product Type</strong></td>
                                                                                                                  <td>{e?.productDetails?.productTypeDesc?.description || '-'}</td>
                                                                                                                </tr>
                                                                                                                <tr>
                                                                                                                  <td><strong>Product Charge Type</strong></td>
                                                                                                                  <td>{e?.productDetails?.chargeTypeDesc?.description || '-'}</td>
                                                                                                                </tr>
                                                                                                                <tr>
                                                                                                                  <td><strong>Service Type</strong></td>
                                                                                                                  <td>{e?.productDetails?.serviceTypeDesc?.description || '-'}</td>
                                                                                                                </tr>
                                                                                                                <tr>
                                                                                                                  <td><strong>Product Category Type</strong></td>
                                                                                                                  <td>{e?.productDetails?.productCategoryDesc?.description || '-'}</td>
                                                                                                                </tr>
                                                                                                              </table>
                                                                                                            </div>
                                                                                                          </>
                                                                                                        )
                                                                                                      })}
                                                                                                    </>
                                                                                                  )
                                                                                                })}
                                                                                              </div>
                                                                                            </div>

                                                                                            : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'OPEN_INVOICES') ?
                                                                                              <div className="text-center imessage mt-2">
                                                                                                {
                                                                                                  val?.msg?.conversation?.message?.map((ele, i) => {
                                                                                                    return <div>
                                                                                                      <div className='custom-control custom-checkbox container-five-row'>
                                                                                                        <div><strong>Invoice Number</strong><br />{ele?.invNo || '-'}</div>
                                                                                                        <div><strong>Invoice Status</strong><br />{ele?.invoiceStatus || '-'}</div>
                                                                                                        <div><strong>Bill Status</strong><br />{ele?.billingStatus || '-'}</div>
                                                                                                        <div><strong>Bill Month</strong><br />{months[Number(ele.billMonth) - 1]} {ele.billYear}
                                                                                                        </div>
                                                                                                      </div>
                                                                                                    </div>
                                                                                                  })
                                                                                                }
                                                                                              </div>
                                                                                              : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_ORDERS') ?
                                                                                                <div className="text-center imessage mt-2">
                                                                                                  {
                                                                                                    val?.msg?.conversation?.message?.childOrder?.map((ele, i) => {
                                                                                                      return <div>
                                                                                                        <div className='skel-rc-order-data container-two-row'>
                                                                                                          <div><strong>Order no</strong><br />{ele?.orderNo ? ele?.orderNo.split('_')?.[0] : '-'}</div>
                                                                                                          <div><strong>Order Category</strong><br />{ele?.orderCategoryDesc?.description || '-'}</div>
                                                                                                          <div><strong>Order Type</strong><br />{ele?.orderTypeDesc?.description || '-'}</div>
                                                                                                          <div><strong>Service Category</strong><br />{'-'}</div>
                                                                                                          <div><strong>Service Type</strong><br />{ele?.serviceTypeDesc?.description || '-'}</div>
                                                                                                          <div><strong>Order created on</strong><br />{ele?.createdAt ? moment(ele?.createdAt).format('DD-MM-YYYY') : '-'}</div>
                                                                                                          <div><strong>Provisioning Type </strong><br />{ele?.orderFamilyDesc?.description || '-'}</div>
                                                                                                          <div><strong>Current Order Status</strong><br />{ele?.orderStatusDesc?.description || '-'}</div>
                                                                                                        </div>
                                                                                                      </div>
                                                                                                    })
                                                                                                  }
                                                                                                </div>
                                                                                                : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'SHOW_INVOICES') ?
                                                                                                  <div className="text-center imessage mt-2">
                                                                                                    {
                                                                                                      val?.msg?.conversation?.message?.rows?.map((ele, i) => {
                                                                                                        return <div>
                                                                                                          <div className='skel-rc-order-data container-two-row'>
                                                                                                            <div><strong>Invoice ID</strong><br />{ele?.invNo || '-'}</div>
                                                                                                            <div><strong>Invoice Value</strong><br />${ele?.invAmt || '-'}</div>
                                                                                                            <div><strong>Invoice Period </strong><br />{ele?.invStartDate ? moment(ele?.invStartDate).format('DD-MM-YYYY') : '-'} - {ele?.invEndDate ? moment(ele?.invEndDate).format('DD-MM-YYYY') : '-'}</div>
                                                                                                            <div><strong>Invoice aging</strong><br />{ele?.invDate ? moment().diff(ele?.invDate, 'days') : '0'} days</div>
                                                                                                            <div><strong>Invoice date</strong><br />{ele?.invDate ? moment(ele?.invDate).format('DD-MM-YYYY') : '-'}</div>
                                                                                                            {/* <div><strong>Service Category</strong><br />{ele?.createdAt ? moment(ele?.createdAt).format('DD-MM-YYYY') : '-'}</div>
                                                                                                <div><strong>Service Type </strong><br />{ele?.orderFamilyDesc?.description || '-'}</div> */}
                                                                                                            {/* <div><strong>Current Order Status</strong><br />{ele?.orderStatusDesc?.description || '-'}</div> */}

                                                                                                          </div>
                                                                                                        </div>
                                                                                                      })
                                                                                                    }
                                                                                                  </div>
                                                                                                  : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'LIST') ?
                                                                                                    <>
                                                                                                      <div className='d-flex mt-2 mb-2 skel-res-link' style={{ cursor: "pointer" }} onClick={() => {
                                                                                                        handlePrint();
                                                                                                      }}>Click here to download PDF <PictureAsPdfIcon color="primary" />
                                                                                                        <hr />
                                                                                                      </div>
                                                                                                      <table className="skel-req-details" ref={componentRef}>
                                                                                                        <thead>
                                                                                                          <tr>
                                                                                                            <th key="Date">Date</th>
                                                                                                            <th key="Day">Day</th>
                                                                                                            <th key="Holiday">Holiday</th>
                                                                                                          </tr>
                                                                                                        </thead>
                                                                                                        <tbody>
                                                                                                          {val?.msg?.conversation?.message?.map((rows, rowsIndex) => (
                                                                                                            <tr key={rowsIndex} id={'r' + rowsIndex}>
                                                                                                              <td key={rowsIndex}>
                                                                                                                <input id={'d' + rowsIndex + '1'} type="text" value={rows?.holidayDate ? moment(rows?.holidayDate).format('DD-MM-YYYY') : '-'} disabled={true} />
                                                                                                              </td>
                                                                                                              <td key={rowsIndex}>
                                                                                                                <input id={'d' + rowsIndex + '2'} type="text" value={rows?.holidayDayNameDesc?.description} disabled={true} />
                                                                                                              </td>
                                                                                                              <td key={rowsIndex}>
                                                                                                                <input id={'d' + rowsIndex + '3'} type="text" value={rows?.holidayDescription} disabled={true} />
                                                                                                              </td>
                                                                                                            </tr>
                                                                                                          ))}
                                                                                                        </tbody>
                                                                                                      </table>
                                                                                                    </>

                                                                                                    : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'SENDMESSAGE' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'FORM')
                                                                                                      ?
                                                                                                      <DynamicForm
                                                                                                        data={{
                                                                                                          formAttributes: val?.msg?.conversation?.message || [],
                                                                                                          formRef,
                                                                                                          isFormDisabled,
                                                                                                          sigPad,
                                                                                                          values,
                                                                                                          idx,
                                                                                                          formDetails,
                                                                                                          lookupData
                                                                                                        }}

                                                                                                        handlers={{
                                                                                                          handleFormSubmit,
                                                                                                          handleFormOnChange,
                                                                                                          setValues
                                                                                                        }}
                                                                                                      />
                                                                                                      : (val?.from === 'bot' && val?.msg?.conversation?.actionType === 'COLLECTINPUT' && val?.msg?.conversation?.type === 'object' && val?.msg?.conversation?.description === 'FORM')
                                                                                                        ?
                                                                                                        <DynamicForm
                                                                                                          data={{
                                                                                                            formAttributes: val?.msg?.conversation?.message?.formMetaAttributes || [],
                                                                                                            tagDefaultValues: val?.msg?.conversation?.message?.element || [],
                                                                                                            formRef,
                                                                                                            isFormDisabled,
                                                                                                            sigPad,
                                                                                                            values,
                                                                                                            idx,
                                                                                                            formDetails,
                                                                                                            lookupData
                                                                                                          }}

                                                                                                          handlers={{
                                                                                                            handleFormSubmit,
                                                                                                            handleFormOnChange,
                                                                                                            setValues,
                                                                                                            setIsFormDisabled
                                                                                                          }}
                                                                                                        />
                                                                                                        : ''
        }
      </div>
    }
    </>
  )
}

export default ResolutionCorner;
