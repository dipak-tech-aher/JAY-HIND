import React, { useEffect, useState, useRef, useMemo, useContext } from "react";
import FileUpload from "../../../common/uploadAttachment/fileUpload";
import Swal from "sweetalert2";
import ResolutionCorner from "./ResolutionCorner";
import CalendarComponent from "../../../common/CalendarComponent";
import { get, post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import Select from "react-select";
import moment from "moment";
import ReactSwitch from "react-switch";
import CustomerAddressForm from "../../../CRM/Address/CustomerAddressForm";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import AddressMap from "../../../CRM/Address/AddressMap";
import CursorSVG from './CursorSVG'
import { unstable_batchedUpdates } from "react-dom";
import { statusConstantCode } from "../../../AppConstants";
import { AppContext } from "../../../AppContext";
import Resolutionimg from "../../../assets/images/resolution-img.svg";

const CreateInteractionForm = (props) => {
  const { appConfig } = useContext(AppContext);
  const {
    selectedService,
    openCreateInteraction,
    switchStatus,
    interactionData: interactionDataProp,
    createdIntxnData,
    firstTimeResolved,
    error,
    intxnTypeLookup,
    channelLookup,
    priorityLookup,
    preferenceLookup,
    serviceTypeLookup,
    problemCaseLookup,
    buttonDisable,
    serviceCategoryLookup,
    intxnCategoryLookup,
    currentFiles,
    index,
    value,
    payload,
    resolutionResponse,
    resolutionPayload,
    customerData,
    multipleServiceData,
    serviceMsg,
    appointmentTypes,
    resolutionData,
    locations,
    countries,
    addressData,
    addressLookUpRef,
    addressError,
    selectedContactPreference,
    interactionData,
    isFormDisabled,
    formDetails,
    values,
    lookupData
  } = props.data;
  const preferenceOptions = preferenceLookup.map((preference) => {
    return {
      value: preference.code,
      label: preference.description,
    };
  });

  const {
    handleInputChange,
    setAutoCreateInteraction,
    setInteractionData,
    setCurrentFiles,
    handleClear,
    handleSubmit,
    handleYes,
    handleNo,
    handleBtnSelected,
    handleOnChangeOrg,
    handleSubmitName,
    workflowApiCall,
    handleAddProducts,
    setProductArr,
    clickToProceed,
    setOrderId,
    handleSetOrderId,
    setWorkflowResponse,
    handleFrequentInteractionChange,
    setSelectedService,
    setResolutionData,
    setAddressData,
    setAddressLookUpRef,
    setAddressError,
    setSelectedContactPreference,
    setFormDetails,
    setIsFormDisabled,
    setValues
  } = props.handler;

  const [events, setEvents] = useState([]);
  const calendarRef = useRef();

  const [weekends] = useState(true);
  const [initialView] = useState("dayGridMonth");
  const [templateData, setTemplateData] = useState([]);
  // const [interactionData, setInteractionData] = useState([]);
  const [availableAppointments, setAvailableAppointments] = useState([]);

  const intelligenceResponse = interactionData?.intelligenceResponse;

  const formRef = useRef(null);
  const sigPad = useRef({});

  useEffect(() => {
    // console.log("settings intxn data");
    setInteractionData(interactionDataProp);
  }, [interactionDataProp]);

  useEffect(() => {
    // console.log("from create int form");
  }, [interactionData]);

  const memoizedEventsFn = useMemo(() => {
    return events.map((x) => ({
      ...x,
      start: new Date(x.start),
      end: new Date(x.end),
    }));
  }, [events]);
  const [isActiveTab, setIsActiveTab] = useState("");
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [addressString, setAddressString] = useState("");
  // console.log(
  //   "interactionData.contactPreference------>",
  //   selectedContactPreference
  // );
  const fetchCountryList = (input, data = undefined, pageIndex = undefined) => {
    get(properties.ADDRESS_LOOKUP_API + "?country=" + input)
      .then((resp) => {
        if (resp && resp.data) {
          setAddressLookUpRef(resp.data);
          if (data) {
            const addressData = resp.data.find(
              (x) => x.postCode === data?.postcode
            );
            setAddressData({
              ...addressData,
              latitude: data?.latitude,
              longitude: data?.longitude,
              address1: data?.address1 || "",
              address2: data?.address2 || "",
              address3: data?.address3 || "",
              postcode: addressData?.postCode || "",
              state: addressData?.state || "",
              district: addressData?.district || "",
              city: addressData?.city || "",
              country: addressData?.country || "",
              countryCode: data?.countryCode || "",
            });
          }
        }
      })
      .catch(error => console.log(error)).finally();
  };

  useEffect(() => {
    if (Array.isArray(intelligenceResponse?.data)) {
      setAutoCreateInteraction(false);
    } else if (intelligenceResponse?.data) {
      setAutoCreateInteraction(true);
    }
  }, [intelligenceResponse?.data]);

  useEffect(() => {
    if (typeof customerData === "object" && customerData !== null) {
      if (
        interactionData.priorityCode &&
        interactionData.serviceCategory &&
        interactionData.serviceType &&
        interactionData.interactionType &&
        interactionData.interactionCategory &&
        interactionData.priorityCode
      ) {
        const reqBody = {
          mapCategory: statusConstantCode.common.INTERACTION,
          serviceCategory: interactionData?.serviceCategory,
          serviceType: interactionData?.serviceType,
          customerCategory: customerData?.customerCategory,
          tranType: interactionData?.interactionType,
          tranCategory: interactionData?.interactionCategory,
          tranPriority: interactionData?.priorityCode,
        };
        post(properties.MASTER_API + "/interaction-template", {
          ...reqBody,
        }).then((resp) => {
          // console.log("I'm going the set interaction data");
          if (resp?.status === 200) {
            setTemplateData(resp.data);
            // console.log("setInteractionData called from form 500");
            setInteractionData({
              ...interactionData,
              rosterId:
                resp?.data?.mappedTemplate?.appointmentHdr?.[0]?.rosterId || null,
            });
          }
        }).catch(error => console.log(error));
      }
    }
  }, [
    customerData,
    interactionData.priorityCode,
    interactionData.serviceCategory,
    interactionData.serviceType,
    interactionData.interactionType,
    interactionData.interactionCategory,
    interactionData.priorityCode,
  ]);

  useEffect(() => {
    if (firstTimeResolved) {
      Swal.fire({
        text: "Glad your query has been resolved.!",
        icon: "success",
        width: 600,
        showCancelButton: false,
        confirmButtonColor: "#4C5A81",
        confirmButtonText: "Okay",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // console.log("setInteractionData called from form 501");
          setInteractionData(null);
        }
      }).catch(error => console.log(error));
    }
  }, [firstTimeResolved]);

  const handleDateClick = (e) => {
    // console.log("setInteractionData called from form 502");
    setInteractionData({
      ...interactionData,
      appointmentDate: e.dateStr,
      appointDtlId: "",
    });
  };

  useEffect(() => {
    if (interactionData.appointmentType) {
      if (
        interactionData.appointmentType === "CUST_VISIT" &&
        !interactionData.appointmentBranch
      ) {
        toast.error("Please Select Branch");
        return;
      }
      if (
        interactionData.appointmentType === "BUS_VISIT" &&
        !interactionData?.useCustomerAddress &&
        !addressData?.postcode &&
        !addressData?.district
      ) {
        toast.error("Please Provide Address Details");
        return;
      }
      const requestBody = {
        mapCategory: statusConstantCode.common.INTERACTION,
        serviceCategory: interactionData.serviceCategory,
        serviceType: interactionData.serviceType,
        customerCategory: customerData?.customerCategory,
        tranType: interactionData.interactionType,
        tranCategory: interactionData.interactionCategory,
        tranPriority: interactionData.priorityCode,
        appointmentType: interactionData.appointmentType,
        templateId: templateData?.mappedTemplate?.templateId,
        appointmentDate:
          interactionData.appointmentDate ||
          moment(new Date()).format("YYYY-MM-DD"),
        location: interactionData.appointmentBranch,
        address: interactionData?.useCustomerAddress
          ? customerData?.customerAddress[0]
          : addressData,
      };
      post(properties.MASTER_API + "/available-appointment", {
        ...requestBody,
      }).then((resp) => {
        // console.log(resp.data);
        if (resp.status === 200) {
          setEvents(resp.data.events || []);
          setAvailableAppointments(resp.data.currentAppointments || []);
        }
      }).catch(error => console.log(error));
    }
  }, [
    interactionData.appointmentType,
    interactionData.appointmentDate,
    interactionData.appointmentBranch,
    addressData?.postcode,
    interactionData?.useCustomerAddress,
    addressData?.district,
  ]);

  useEffect(() => {
    const success = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setLatitude(latitude);
      setLongitude(longitude);
      const geolocationUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      fetch(geolocationUrl)
        .then((res) => res.json())
        .then((data) => {
          setIsActiveTab("MAP");
        }).catch(error => console.log(error));
    };
    const error = () => {
      toast.error("Unable to fetch location");
    };
    navigator.geolocation.getCurrentPosition(success, error);
  }, []);

  const handleSelectSlot = (e) => {
    // console.log("setInteractionData called from form 503");
    setInteractionData({
      ...interactionData,
      appointDtlId: e.appointDtlId,
      appointUserId: e.appointUserId,
    });
  };
  // console.log('interactionData ---------->', interactionData)
  const [completedTyping, setCompletedTyping] = useState(false)
  const [displayResponse, setDisplayResponse] = useState()
  const [displayMultipleResponse, setDisplayMultipleResponse] = useState()

  useEffect(() => {
    if (!serviceMsg) {
      return;
    }
    setCompletedTyping(false);
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayResponse(serviceMsg.slice(0, i));
      i++;
      if (i > serviceMsg.length) {
        clearInterval(intervalId);
        setCompletedTyping(true);
      }
    }, 20);
    return () => clearInterval(intervalId);
  }, [serviceMsg]);

  useEffect(() => {
    if (!multipleServiceData?.message) {
      return;
    }
    setCompletedTyping(false);
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayMultipleResponse(multipleServiceData?.message.slice(0, i));
      i++;
      if (i > multipleServiceData?.message.length) {
        clearInterval(intervalId);
        setCompletedTyping(true);
      }
    }, 20);
    return () => clearInterval(intervalId);
  }, [multipleServiceData?.message]);


  return (
    <>
      <div className="">
        {!switchStatus ? (
          <>
            <div className="cmmn-skeleton skel-br-tp-r0">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label
                      htmlFor="interactionCategory"
                      className="control-label"
                    >
                      Interaction Category{" "}
                      <span className="text-danger font-20 pl-1 fld-imp">
                        *
                      </span>
                    </label>
                    <div className="custselect">
                      <select
                        value={interactionData.interactionCategory}
                        disabled={switchStatus}
                        id="interactionCategory"
                        className={`form-control ${error.interactionCategory && "error-border"
                          }`}
                        onChange={handleInputChange}
                      >
                        <option key="interactionCategory" value="">
                          Select Interaction Category
                        </option>
                        {intxnCategoryLookup &&
                          intxnCategoryLookup.map((e) => (
                            <option key={e.code} value={e.code}>
                              {e.description}
                            </option>
                          ))}
                      </select>
                    </div>
                    <span className="errormsg">
                      {error.interactionCategory
                        ? error.interactionCategory
                        : ""}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="interactionType" className="control-label">
                      Interaction Type{" "}
                      <span className="text-danger font-20 pl-1 fld-imp">
                        *
                      </span>
                    </label>
                    <div className="custselect">
                      <select
                        value={interactionData.interactionType}
                        disabled={switchStatus}
                        id="interactionType"
                        className={`form-control ${error.interactionType && "error-border"
                          }`}
                        onChange={handleInputChange}
                      >
                        <option key="interactionType" value="">
                          Select Interaction Type
                        </option>
                        {intxnTypeLookup &&
                          intxnTypeLookup.map((e) => (
                            <option key={e.code} value={e.code}>
                              {e.description}
                            </option>
                          ))}
                      </select>
                    </div>
                    <span className="errormsg">
                      {error.interactionType ? error.interactionType : ""}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="serviceType" className="control-label">
                      Service Type{" "}
                      <span className="text-danger font-20 pl-1 fld-imp">
                        *
                      </span>
                    </label>
                    <select
                      value={interactionData.serviceType}
                      id="serviceType"
                      disabled={switchStatus}
                      className={`form-control ${error.serviceType && "error-border"
                        }`}
                      onChange={handleInputChange}
                    >
                      <option key="serviceType" value="">
                        Select Service Type
                      </option>
                      {serviceTypeLookup && serviceTypeLookup.length > 0 &&
                        serviceTypeLookup.map((e) => (
                          <option key={e.code} value={e.code}>
                            {e.description}
                          </option>
                        ))}
                    </select>
                    <span className="errormsg">
                      {error.serviceType ? error.serviceType : ""}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="serviceCategory" className="control-label">
                      Service Category{" "}
                      <span className="text-danger font-20 pl-1 fld-imp">
                        *
                      </span>
                    </label>
                    <select disabled
                      value={interactionData.serviceCategory}
                      id="serviceCategory"
                      // disabled={switchStatus}
                      className={`form-control ${error.serviceCategory && "error-border"
                        }`}
                      onChange={handleInputChange}
                    >
                      <option key="serviceCategory" value="">
                        Select Service Category
                      </option>
                      {serviceCategoryLookup &&
                        serviceCategoryLookup.map((e) => (
                          <option key={e.code} value={e.code}>
                            {e.description}
                          </option>
                        ))}
                    </select>
                    <span className="errormsg">
                      {error.serviceCategory ? error.serviceCategory : ""}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="channel" className="control-label">
                      Channel{" "}
                      <span className="text-danger font-20 pl-1 fld-imp">
                        *
                      </span>
                    </label>
                    <select
                      value={interactionData.channel}
                      id="channel"
                      className={`form-control ${error.channel && "error-border"
                        }`}
                      onChange={handleInputChange}
                    >
                      <option key="channel" value="">
                        Select Channel
                      </option>
                      {channelLookup &&
                        channelLookup.map((e) => (
                          <option key={e.code} value={e.code}>
                            {e.description}
                          </option>
                        ))}
                    </select>
                    <span className="errormsg">
                      {error.channel ? error.channel : ""}
                    </span>
                  </div>
                </div>
                {/* <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="problemCause" className="control-label">Problem Statement Cause <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select value={interactionData.problemCause} id="problemCause" disabled={switchStatus} className={`form-control ${error.problemCause && "error-border"}`} onChange={handleInputChange}>
                                                <option key="problemCause" value="">Select Problem Statement Cause</option>
                                                {
                                                    problemCaseLookup && problemCaseLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.problemCause ? error.problemCause : ""}</span>
                                        </div>
                                    </div> */}
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="priorityCode" className="control-label">
                      Priority{" "}
                      <span className="text-danger font-20 pl-1 fld-imp">
                        *
                      </span>
                    </label>
                    <select
                      value={interactionData.priorityCode}
                      id="priorityCode"
                      className={`form-control ${error.priorityCode && "error-border"
                        }`}
                      onChange={handleInputChange}
                    >
                      <option key="priorityCode" value="">
                        Select Priority
                      </option>
                      {priorityLookup &&
                        priorityLookup.map((e) => (
                          <option key={e.code} value={e.code}>
                            {e.description}
                          </option>
                        ))}
                    </select>
                    <span className="errormsg">
                      {error.priorityCode ? error.priorityCode : ""}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label
                      htmlFor="contactPreference"
                      className="control-label"
                    >
                      Contact Preference{" "}
                      <span className="text-danger font-20 pl-1 fld-imp">
                        *
                      </span>
                    </label>
                    {/* {console.log(
                      "interactionData.contactPreference------>",
                      selectedContactPreference
                    )}
                    {console.log("preferenceOptions------>", preferenceOptions)} */}
                    <Select
                      value={selectedContactPreference}
                      options={preferenceOptions}
                      isMulti
                      onChange={(selectedOption) => {
                        handleInputChange({
                          target: {
                            id: "contactPreference",
                            value: selectedOption,
                          },
                        });
                        setSelectedContactPreference(selectedOption);
                      }}
                      menuPortalTarget={document.body}
                    // styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                    {/* <select multiple value={interactionData.contactPreference} id="contactPreference" className={`form-control ${error.contactPreference && "error-border"}`} onChange={handleInputChange}>
                                                <option key="contactPreference" value="">Choose...</option>
                                                {
                                                    preferenceLookup && preferenceLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select> */}
                    <span className="errormsg">
                      {error.contactPreference ? error.contactPreference : ""}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="priorityCode" className="control-label">
                      Expected Completion Date{" "}
                    </label>
                    <input type="date" min={moment().format('YYYY-MM-DD')} value={interactionData.edoc} id="edoc"
                      className={`form-control ${error.edoc && "error-border"
                        }`} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label htmlFor="remarks" className="control-label">
                      Interaction Solution
                    </label>
                    <span>{interactionData?.interactionResolution}</span>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label htmlFor="remarks" className="control-label">
                      Remarks{" "}
                      <span className="text-danger font-20 pl-1 fld-imp">
                        *
                      </span>
                    </label>
                    <textarea
                      value={interactionData.remarks}
                      className={`form-control ${error.remarks && "error-border"
                        }`}
                      id="remarks"
                      name="remarks"
                      rows="4"
                      maxLength="2500"
                      onChange={handleInputChange}
                    />
                    <span>Maximum 2500 characters</span>
                    <span className="errormsg">
                      {error.remarks && error.remarks}
                    </span>
                  </div>
                </div>
                <div className="col-md-12">
                  <FileUpload
                    data={{
                      currentFiles,
                      entityType: "INTERACTION",
                      shouldGetExistingFiles: false,
                      permission: false,
                    }}
                    handlers={{
                      setCurrentFiles,
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              className={`${interactionData?.appointmentRequired && templateData
                ?.mappedTemplate?.templateId
                ? "skel-form-heading-bar mt-2"
                : "d-none"
                }`}
            >
              <span className="messages-page__title">Appointment Settings</span>
            </div>
            <div
              className={`${interactionData?.appointmentRequired && templateData
                ?.mappedTemplate?.templateId
                ? "cmmn-skeleton skel-br-tp-r0"
                : "d-none"
                }`}
            >
              <div className="form-row px-0 py-0">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="appointmentType" className="control-label">
                      Appointment Type{" "}
                      <span className="text-danger font-20 pl-1 fld-imp">
                        *
                      </span>
                    </label>
                    <select
                      value={interactionData.appointmentType}
                      id="appointmentType"
                      disabled={switchStatus}
                      className={`form-control ${error.appointmentType && "error-border"
                        }`}
                      onChange={handleInputChange}
                    >
                      <option key="appointmentType" value="">
                        Select Appointment Type
                      </option>
                      {appointmentTypes &&
                        appointmentTypes.map((e) => (
                          <option key={e.code} value={e.code}>
                            {e.description}
                          </option>
                        ))}
                    </select>
                    <span className="errormsg">
                      {error.appointmentType ? error.appointmentType : ""}
                    </span>
                  </div>
                </div>
                {interactionData.appointmentType === "BUS_VISIT" && (
                  <div className="col-md-6 mt-3">
                    <span className="messages-page__title">
                      Use Same as {appConfig?.clientFacingName?.customer ?? 'Customer'} Address
                      <ReactSwitch
                        onColor="#4C5A81"
                        offColor="#6c757d"
                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                        height={20}
                        width={48}
                        className="inter-toggle skel-inter-toggle ml-2"
                        id="useCustomerAddress"
                        checked={interactionData?.useCustomerAddress}
                        onChange={(e) => {
                          // console.log("setInteractionData called from form 504");
                          setInteractionData({
                            ...interactionData,
                            useCustomerAddress: e,
                          });
                        }}
                      />
                    </span>
                  </div>
                )}
                {interactionData.appointmentType === "CUST_VISIT" && (
                  <div className="col-md-6">
                    <div className="form-group">
                      <label
                        htmlFor="appointmentBranch"
                        className="control-label"
                      >
                        Branch{" "}
                        <span className="text-danger font-20 pl-1 fld-imp">
                          *
                        </span>
                      </label>
                      <select
                        value={interactionData.appointmentBranch}
                        id="appointmentBranch"
                        disabled={switchStatus}
                        className={`form-control ${error.appointmentBranch && "error-border"
                          }`}
                        onChange={handleInputChange}
                      >
                        <option key="appointmentBranch" value="">
                          Select Branch
                        </option>
                        {locations &&
                          locations.map((e) => (
                            <option key={e.code} value={e.code}>
                              {e.description}
                            </option>
                          ))}
                      </select>
                      <span className="errormsg">
                        {error.appointmentBranch ? error.appointmentBranch : ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-0 py-0 p-1">
                {countries &&
                  !interactionData?.useCustomerAddress &&
                  interactionData.appointmentType === "BUS_VISIT" && (
                    <>
                      <div className="row col-md-12 pl-0 pb-2">
                        <div className="tabbable-responsive pl-1">
                          <div className="tabbable">
                            <ul
                              className="nav nav-tabs"
                              id="myTab"
                              role="tablist"
                            >
                              <li className="nav-item">
                                <a
                                  className={
                                    isActiveTab === "MAP"
                                      ? "nav-link active"
                                      : "nav-link"
                                  }
                                  id="work-flow-history"
                                  data-toggle="tab"
                                  href="#cpwd"
                                  role="tab"
                                  aria-controls="work-flow-history"
                                  aria-selected="false"
                                  onClick={() => {
                                    setIsActiveTab("MAP");
                                  }}
                                >
                                  Address Map
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  className={
                                    isActiveTab === "FORM"
                                      ? "nav-link active"
                                      : "nav-link"
                                  }
                                  id="lead-details"
                                  data-toggle="tab"
                                  href="#mprofile"
                                  role="tab"
                                  aria-controls="lead-details"
                                  aria-selected="true"
                                  onClick={() => {
                                    setIsActiveTab("FORM");
                                  }}
                                >
                                  Address Form
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      {isActiveTab === "FORM" && (
                        <CustomerAddressForm
                          data={{
                            addressData,
                            addressString: "",
                          }}
                          countries={countries}
                          lookups={{
                            addressElements: addressLookUpRef,
                          }}
                          error={addressError}
                          setError={setAddressError}
                          handler={{
                            setAddressData,
                            setAddressLookUpRef,
                          }}
                        />
                      )}
                      {isActiveTab === "MAP" && (
                        <AddressMap
                          data={{
                            addressData: addressData,
                            latitude,
                            longitude,
                            countries,
                          }}
                          lookups={{
                            addressElements: addressLookUpRef,
                          }}
                          error={addressError}
                          setError={setAddressError}
                          handler={{
                            setAddressData: setAddressData,
                            setAddressLookUpRef,
                            setAddressString,
                            fetchCountryList,
                          }}
                        />
                      )}
                    </>
                  )}
                <FullCalendar
                  ref={calendarRef}
                  plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    listPlugin,
                    interactionPlugin,
                  ]}
                  initialView={initialView}
                  headerToolbar={{
                    start: "prev,next today",
                    center: "title",
                    end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                  }}
                  // nowIndicator
                  // expandRows= {true}
                  // allDaySlot={false}
                  // dayMaxEvents
                  // dayMaxEventRows
                  initialDate={
                    interactionData?.appointmentDate ||
                    moment(new Date()).format("YYYY-MM-DD")
                  }
                  validRange={{
                    start: moment(new Date()).format("YYYY-MM-DD"),
                  }}
                  dateClick={handleDateClick}
                  //eventClick={handleDateClick}
                  weekends={weekends}
                  events={memoizedEventsFn}
                // eventMouseEnter={
                //     (arg) => {
                //         alert(arg.event.title);
                //     }
                // }
                />
                <hr className="cmmn-hline mt-2" />
                {availableAppointments.length > 0 ? (
                  <div className="slots">
                    <ul>
                      {availableAppointments.map((x) => (
                        <li
                          style={{
                            backgroundColor:
                              interactionData?.appointDtlId === x.appointDtlId
                                ? "grey"
                                : x.backgroundColor,
                          }}
                          onClick={() => handleSelectSlot(x)}
                        >
                          {x?.slotName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="skel-pg-bot-sect-btn">
              {/* <button type="button" className="skel-btn-cancel" onClick={() => props.history.goBack()}>Clear</button> */}
              <button
                type="button"
                className="skel-btn-cancel"
                onClick={handleClear}
              >
                Clear
              </button>
              <button
                type="button"
                className="skel-btn-submit"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="st-solutions">
              {resolutionData?.length !== 0 && <span className="skel-res-corner-title">Resolution Corner</span>}
              {resolutionData?.length === 0 && <div className="skel-no-resolution-corner">
                <h4 className="skel-no-resolution">
                  Your Smart Assistance is ready to solve your solutions.
                  <span>Try searching one of your problem statement to see the resolutions!</span>
                </h4>
                <img src={Resolutionimg} className="img-fluid" />
              </div>}
              {serviceMsg && <span> {displayResponse}</span>}
              {multipleServiceData &&
                multipleServiceData?.data?.resolutionAction?.data?.length >
                1 && (
                  <div>
                    <span>{displayMultipleResponse} </span>
                    {multipleServiceData && completedTyping && multipleServiceData?.data?.resolutionAction?.data?.length > 1 &&
                      multipleServiceData?.data?.resolutionAction?.data?.map(
                        (value, i) => {
                          return (
                            <div className="skel-res-radio-list" key={i}>
                              <label>
                                <input
                                  type="radio"
                                  name={value.serviceUuid}
                                  value={value}
                                  onChange={(e) => {
                                    handleFrequentInteractionChange(
                                      value,
                                      "frequent"
                                    );
                                  }}
                                />
                                <span>{value?.serviceNo} - {value?.serviceName}</span>
                              </label>
                            </div>
                          );
                        }
                      )}
                  </div>
                )}
              {resolutionData &&
                resolutionData.length > 0 &&
                resolutionData.map((val, idx) => (
                  <div key={idx}>
                    <ResolutionCorner
                      data={{
                        val,
                        idx,
                        customerData,
                        resolutionPayload,
                        selectedService,
                        buttonDisable,
                        resolutionData,
                        formRef,
                        formDetails,
                        sigPad,
                        isFormDisabled,
                        values,
                        lookupData
                      }}
                      handler={{
                        setResolutionData,
                        handleAddProducts,
                        setProductArr,
                        clickToProceed,
                        workflowApiCall,
                        handleSetOrderId,
                        setOrderId,
                        setWorkflowResponse,
                        setFormDetails,
                        setIsFormDisabled,
                        setValues
                      }}
                    />
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CreateInteractionForm;
