
/* eslint-disable array-callback-return */
import React, { useContext, useState } from "react";
// import { Link, Element } from 'react-scroll'
// import { Link as DomLink } from 'react-router-dom';
// import Slider from "react-slick";
// import BestOffer from './BestOffers'
import CustomerDetailsFormViewMin from "./CustomerDetailsFormViewMin";
// import AccountDetailsFormView from '../AccountManagement/AccountDetailsFormView';
// import BillableDetailsFormView from '../Customer/BillableDetailsFormView';
// import ServiceListFormView from '../ServiceManagement/ServiceListFormView';
// import ProgressBar from 'react-bootstrap/ProgressBar';
// import DynamicTable from '../../common/table/DynamicTable';
// import emojiIcon from '../../assets/images/emoji.png';
import vIcon from "../../assets/images/v-img.png";

// import profileIcon from "../../assets/images/profile.png";
import moment from "moment";
import arrowDown from "../../assets/images/updown.svg";
import ChannelActivityChart from "./ChannelActivityChart";
import ChannelPerformanceChart from "./ChannelPerformanceChart";
import CustomerJourney from "./CustomerJourney";
import NegativeScatterChart from "./NegativeScatterChart";
import SentimentChart from "./SentimentChart";
import SentimentGauge from "./SentimentScoreGauge";
import { AppContext } from "../../AppContext";


const CustomerViewPrint = React.forwardRef((props, ref) => {
    const { appsConfig } = useContext(AppContext);
    const { customerDetails, accountCount, servicesList, interactionList, revenueDetails, sentimentChartData,
        channelActivity, interactionData, orderList, appointmentList, customerEmotions, customerDetailsList, customerAddressList,
        selectedAccount, followUpList, modulePermission, moduleConfig} = props?.data
    const { setCustomerDetails/*, setAccountCount, setServicesList, setInteractionList, setRevenueDetails, setSentimentChartData, 
    setChannelActivity, setInteractionData, setOrderList*/} = props?.handler

    const customerUuid = sessionStorage.getItem("customerUuid") || null;
    const accountNo = sessionStorage.getItem("accountNo")
        ? Number(sessionStorage.getItem("accountNo"))
        : null;
    const [perPage, setPerPage] = useState(10);
    const [refreshPage, setRefreshPage] = useState(true);
    const [sentimentScore, setSentimentScore] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [tabType, setTabType] = useState("billed");
    const [currentPage, setCurrentPage] = useState(0);
    const [pageRefreshHandlers, setPageRefreshHandlers] = useState({
        attachmentRefresh: true,
        customerRefresh: true,
        accountEditRefresh: true,
        serviceRefresh: true,
        contractInvoicePaymentRefresh: true,
    });
    const [totalCountAddress, setTotalCountAddress] = useState(0);
    const [perPageAddress, setPerPageAddress] = useState(10);
    const [currentPageAddress, setCurrentPageAddress] = useState(0);
    const [setIssetimentPopupOpen] = useState(false)
    const [setSentimentFilter] = useState({})


    const handleContractInvoicePaymentRefresh = () => {
        setPageRefreshHandlers({
            ...pageRefreshHandlers,
            contractInvoicePaymentRefresh:
                !pageRefreshHandlers.contractInvoicePaymentRefresh,
        });
    };



    const capitalizeFirstLetter = (string) => {
        return string?.charAt(0)?.toUpperCase() + string?.slice(1);
    };

    const pageRefresh = () => {
        setRefreshPage(!refreshPage);
    };


    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo);
    };

    const handlePageSelectAddress = (pageNo) => {
        setCurrentPageAddress(pageNo)
    }


    const handleCellRender = (cell, row) => {
        return <span>{cell.value}</span>;
    };

    return (
        <div >
            <div className="addresshadow show mb-4 skel-customer-print-preview-pg" id="previewform" tabIndex="-1" role="dialog"
                style={{ paddingRight: "5px", paddingLeft: "5px" }} aria-modal="true">
                <div className="modal-content">
                    <div className='cnt-wrapper' ref={ref}>
                        <div className="card-skeleton">
                            <div className="cmmn-skeleton mt-2">
                                <div className="lft-skel">
                                    <span className="skel-profile-heading" style={{ width: '10%' }}>
                                        Overall Insights
                                    </span>
                                    <div className="" style={{ display: 'grid', justifyContent: 'space-between', gridTemplateColumns: '50% 50% 50% 50%' }}>
                                        {modulePermission?.includes(moduleConfig?.interaction) && <div className="skel-tot">
                                            Total Interaction Count
                                            <span>
                                                <a style={{ color: '#000' }}
                                                    data-toggle="modal"
                                                    data-target="#skel-view-modal-interactions"
                                                // onClick={() => {
                                                //     // setIsInteractionListOpen(true);
                                                //     setInteractionStatusType("ALL");
                                                // }}
                                                >
                                                    {interactionData?.length || 0}
                                                </a>
                                            </span>
                                        </div>}
                                        {modulePermission?.includes(moduleConfig?.order) && <div className="skel-tot">
                                            Total Order Count
                                            <span>
                                                <a style={{ color: '#000' }}
                                                    data-toggle="modal"
                                                    data-target="#skel-view-modal-interactions"
                                                // onClick={() => {
                                                //     setIsOrderListOpen(true);
                                                // }}
                                                >
                                                    {orderList?.length || 0}
                                                </a>
                                            </span>
                                        </div>}
                                        <div className="skel-tot">
                                            Total Followups
                                            <span>
                                                <a style={{ color: '#000' }}
                                                    data-toggle="modal"
                                                    data-target="#skel-view-modal-interactions"
                                                    onClick={() => {
                                                        //setIsInteractionListOpen(true);
                                                        //  setInteractionStatusType("ALL");
                                                    }}
                                                >
                                                    {followUpList?.count || 0}
                                                </a>
                                            </span>
                                        </div>
                                        <div className="skel-tot">
                                            Overall Experience
                                            <span>
                                                {Number(sentimentScore) >= 4 ? '😃' : Number(sentimentScore) < 4 && Number(sentimentScore) >= 3 ? '😐' : Number(sentimentScore) < 3 && Number(sentimentScore) >= 2 ? '😟' : Number(sentimentScore) < 2 && Number(sentimentScore) > 1 ? '😡' : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="cmmn-skeleton customer-skel"> */}
                            <div className="">
                                <div className="mt-2">
                                    <div className="form-row">
                                        <div className="col-lg-6 col-md-12 col-xs-12">
                                            <div className="skel-view-base-card skel-cust-ht-sect">
                                                <div className="skel-profile-base">
                                                    <div className="skel-profile-info">
                                                        <CustomerDetailsFormViewMin
                                                            data={{
                                                                customerData: customerDetails,
                                                                accountCount: accountCount,
                                                                serviceCount: servicesList?.length,
                                                                interactionCount: interactionList?.count,
                                                                hideAccSerInt: true,
                                                                source: "CUSTOMER",
                                                            }}
                                                            handler={{ setCustomerDetails, pageRefresh }}
                                                        />
                                                    </div>
                                                </div>
                                                {modulePermission?.includes(moduleConfig?.invoice) && <div className="skel-serv-sect-revenue">
                                                    <div>
                                                        <span>
                                                            Revenue:
                                                            <br />{" "}
                                                            {revenueDetails?.totalAmount
                                                                ? Number(revenueDetails?.totalAmount)
                                                                : 0}{" "}
                                                            {revenueDetails?.currency}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span>
                                                            Average:
                                                            <br />{" "}
                                                            {revenueDetails?.averageAmount
                                                                ? Number(revenueDetails?.averageAmount).toFixed(2)
                                                                : 0}{" "}
                                                            {revenueDetails?.currency}
                                                        </span>
                                                    </div>
                                                </div>}
                                                <hr className="cmmn-hline mt-2" />
                                                {/* <div className="skel-inter-view-history mt-2">
                    <span className="skel-header-title">Interactions</span>
                    <div className="skel-tot-inter">
                      <div className="skel-tot">
                        Total
                        <span>
                          <a
                            data-toggle="modal"
                            data-target="#skel-view-modal-interactions"
                            onClick={() => {
                              setIsInteractionListOpen(true);
                              setInteractionStatusType("ALL");
                            }}
                          >
                            {interactionList?.count || 0}
                          </a>
                        </span>
                      </div>
                      <div className="skel-tot">
                        Open
                        <span>
                          <a
                            data-toggle="modal"
                            data-target="#skel-view-modal-interactions"
                            onClick={() => {
                              setIsInteractionListOpen(true);
                              setInteractionStatusType("OPEN");
                            }}
                          >
                            {openInteractionCount.current.length || 0}
                          </a>
                        </span>
                      </div>
                      <div className="skel-tot">
                        Closed
                        <span>
                          <a
                            data-toggle="modal"
                            data-target="#skel-view-modal-interactions"
                            onClick={() => {
                              setIsInteractionListOpen(true);
                              setInteractionStatusType("CLOSED");
                            }}
                          >
                            {closedInteractionCount.current.length || 0}
                          </a>
                        </span>
                      </div>
                    </div>
                  </div> */}
                                                <img
                                                    src={vIcon}
                                                    alt=""
                                                    className="img-fluid skel-place-img"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-12 col-xs-12">
                                            <div className="skel-view-base-card skel-cust-ht-sect">
                                                <span className="skel-profile-heading">
                                                {props?.appsConfig?.clientFacingName?.customer ?? 'Customer'} Sentiments
                                                </span>
                                                <SentimentChart data={{ chartData: sentimentChartData }} handlers={{ setIssetimentPopupOpen, setSentimentFilter }} />
                                            </div>
                                            {/* <div className="skel-view-base-card skel-cust-ht-sect">
                                    <span className="skel-profile-heading">Intelligence Corner</span>
                                    <IntelligenceCorner data={{ intelligenceList, interactionData, customerData: customerDetails, servicesList }} />

                                </div> */}
                                        </div>
                                        <div className="col-lg-6 col-md-12 col-xs-12">
                                            <div className="skel-view-base-card skel-cust-ht-sect">
                                                <span className="skel-profile-heading">
                                                    Avg Sentiment Score
                                                </span>
                                                <SentimentGauge
                                                    data={{ chartData: sentimentChartData }}
                                                    handler={{
                                                        setSentimentScore
                                                    }}
                                                />
                                            </div>
                                            {/* <div className="skel-view-base-card skel-cust-ht-sect">
                                    <span className="skel-profile-heading">Intelligence Corner</span>
                                    <IntelligenceCorner data={{ intelligenceList, interactionData, customerData: customerDetails, servicesList }} />

                                </div> */}
                                        </div>
                                        <div className="col-lg-6 col-md-12 col-xs-12">
                                            <div className="skel-view-base-card skel-cust-ht-sect">
                                                <span className="skel-profile-heading">
                                                    Top 10 Interactions with Negative Sentiments(Red- Most Negative)
                                                </span>
                                                <NegativeScatterChart data={{ chartData: sentimentChartData }} />
                                            </div>
                                            {/* <div className="skel-view-base-card skel-cust-ht-sect">
                                    <span className="skel-profile-heading">Intelligence Corner</span>
                                    <IntelligenceCorner data={{ intelligenceList, interactionData, customerData: customerDetails, servicesList }} />

                                </div> */}
                                        </div>
                                        <div className="col-lg-6 col-md-12 col-xs-12">
                                            <div className="skel-view-base-card skel-cust-ht-sect">
                                                <span className="skel-profile-heading">
                                                    Channel Activity by Percentage (%)
                                                </span>
                                                <ChannelActivityChart data={{ chartData: channelActivity }} />
                                            </div>
                                            {/* <div className="skel-view-base-card skel-cust-ht-sect">
                                    <span className="skel-profile-heading">Intelligence Corner</span>
                                    <IntelligenceCorner data={{ intelligenceList, interactionData, customerData: customerDetails, servicesList }} />

                                </div> */}
                                        </div>
                                        <div className="col-lg-6 col-md-12 col-xs-12">
                                            <div className="skel-view-base-card skel-cust-ht-sect">
                                                <span className="skel-profile-heading">
                                                    Channel Performance
                                                </span>
                                                <ChannelPerformanceChart data={{ chartData: channelActivity }} />
                                            </div>
                                            {/* <div className="skel-view-base-card skel-cust-ht-sect">
                                    <span className="skel-profile-heading">Intelligence Corner</span>
                                    <IntelligenceCorner data={{ intelligenceList, interactionData, customerData: customerDetails, servicesList }} />

                                </div> */}
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="col-lg-12 col-md-12 col-xs-12">
                                            <div className="skel-view-base-card">
                                                <div className="skel-inter-statement">
                                                    <span className="skel-profile-heading">
                                                        Interaction Details({interactionList?.count || 0}){" "}
                                                        <span
                                                            className="skel-badge badge-yellow"
                                                        // onClick={() => {
                                                        //     history.push(
                                                        //         `${process.env.REACT_APP_BASE}/create-interaction`,
                                                        //         { data: customerDetails }
                                                        //     );
                                                        // }}
                                                        >
                                                            <a>+</a>
                                                        </span>
                                                    </span>
                                                    <div className="skel-cust-view-det">
                                                        {interactionData &&
                                                            interactionData.map((val, idx) => (
                                                                <>
                                                                    <div
                                                                        key={idx}
                                                                        className="skel-inter-hist"
                                                                    // onClick={() => {
                                                                    //     handleInteractionModal(val);
                                                                    // }}
                                                                    >
                                                                        <div className="skel-serv-sect-lft">
                                                                            <span
                                                                                className="skel-lbl-flds"
                                                                                data-toggle="modal"
                                                                                data-target="#skel-view-modal-accountdetails"
                                                                            >
                                                                                ID: {val.intxnNo}
                                                                            </span>
                                                                            <span className="mt-1">{val.problemCause}</span>
                                                                            <span className="skel-cr-date">
                                                                                Created On: {val.createdAt}
                                                                            </span>
                                                                            <span className="skel-h-status mt-1">
                                                                                {val.intxnPriority?.description}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {/* <div className="skel-cust-view-det mt-2">
                                                    <div className="form-row">
                                                        <div className="col-md-8">
                                                            <i className="fa fa-eye" aria-hidden="true"></i>
                                                            <span className="skel-lbl-flds">ID: {val.intxnNo}</span>                                                            
                                                        </div>
                                                    </div>
                                                    
                                                    <span className="mt-1">{val.problemCause}</span>
                                                    <span className="skel-cr-date">Created On: {val.createdAt}</span>
                                                    <span className="skel-h-status mt-1">{val.intxnPriority?.description}</span>
                                                </div> */}
                                                                </>
                                                            ))}
                                                    </div>
                                                    {/* <a className="skel-a-lnk" data-target="#skel-view-modal-inter" data-toggle="modal">View All Interactions</a> */}
                                                </div>
                                            </div>
                                        </div>
                                        {modulePermission?.includes(moduleConfig?.order) && <div className="col-lg-12 col-md-12 col-xs-12">
                                            <div className="skel-view-base-card">
                                                <span className="skel-profile-heading">
                                                    Order Details({orderList?.length}){" "}
                                                    <span className="skel-badge badge-blue">
                                                        <a
                                                            data-toggle="modal"
                                                            data-target="#skel-view-modal-interactions"
                                                        >
                                                            +
                                                        </a>
                                                    </span>
                                                </span>
                                                <div className="skel-cust-view-det">
                                                    {orderList.length > 0 ? <>

                                                        {orderList.map((val, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="skel-inter-hist"
                                                            // onClick={() => {
                                                            //     hanldeOpenOrderModal(val);
                                                            // }}
                                                            >
                                                                <div className="skel-serv-sect-lft">
                                                                    <span className="skel-lbl-flds">
                                                                        ID: {val.orderNo}
                                                                    </span>
                                                                    <span className="mt-1">{val.orderDescription}</span>
                                                                    <span className="skel-cr-date">
                                                                        Created On: {val.orderDate}
                                                                    </span>
                                                                    <span className="skel-m-status mt-1">
                                                                        {val.orderPriority?.description}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </> :
                                                        <span className="skel-widget-warning">
                                                            No Order Found!!!
                                                        </span>
                                                    }
                                                </div>
                                                {/* <a className="skel-a-lnk" data-target="#skel-view-modal-inter" data-toggle="modal">View All Orders</a> */}
                                            </div>
                                        </div>}
                                        {modulePermission?.includes(moduleConfig?.service) && <div className="col-lg-12 col-md-12 col-xs-12">
                                            <div className="skel-view-base-card">
                                                <span className="skel-profile-heading">
                                                    Service Details({servicesList?.length || 0}){" "}
                                                    <span
                                                        className="skel-badge badge-marron"
                                                    // onClick={() => {
                                                    //     //setOpenAddServiceModal(true)
                                                    //     history.push(
                                                    //         `${process.env.REACT_APP_BASE}/new-customer`,
                                                    //         {
                                                    //             data: {
                                                    //                 customerDetails,
                                                    //                 pageIndex: 2,
                                                    //                 edit: true,
                                                    //             },
                                                    //         }
                                                    //     );
                                                    // }}
                                                    >
                                                        <a>+</a>
                                                    </span>
                                                </span>
                                                <div className="skel-cust-view-det">
                                                    {servicesList &&
                                                        servicesList.map((val, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="skel-inter-hist"
                                                            // onClick={() => handleOnManageService(val)}
                                                            >
                                                                <div className="skel-serv-sect-lft">
                                                                    <span
                                                                        className="skel-lbl-flds"
                                                                        data-toggle="modal"
                                                                        data-target="#skel-view-modal-accountdetails"
                                                                    >
                                                                        {val?.accountNo}
                                                                    </span>
                                                                    <span>
                                                                        {val?.serviceNo}:-{" "}
                                                                        {val?.productDetails[0]?.productName}
                                                                    </span>
                                                                    <span className="skel-cr-date">
                                                                        Type: {val?.srvcTypeDesc?.description}
                                                                    </span>
                                                                    <span className="skel-cr-date">
                                                                        Activate From: {val?.activationDate}
                                                                    </span>
                                                                </div>
                                                                <div className="skel-updown-icon">
                                                                    <a>
                                                                        <img src={arrowDown} />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                                {/* <a className="skel-a-lnk" data-toggle="modal" data-target="#skel-view-modal-accountdetails">View All Services</a> */}
                                            </div>
                                        </div>}
                                    </div>
                                    <div className="form-row">
                                        {/* <div className="col-md-4">
                                <div className="skel-view-base-card">
                                    <div className="skel-inter-statement">
                                        <span className="skel-profile-heading">Billing Scheduled ({scheduleContract?.rows && scheduleContract?.rows?.length || 0})</span>
                                        <div className="skel-cust-view-det">
                                            {scheduleContract?.rows && scheduleContract?.rows.length > 0 ? <> {
                                                scheduleContract?.rows.map((val, idx) => (
                                                    <>
                                                        <div key={idx} className="skel-inter-hist">
                                                            <div className="skel-serv-sect-lft">
                                                                <span className="skel-lbl-flds" data-toggle="modal" data-target="#skel-view-modal-accountdetails">Contract Name: {val?.contractName || ""}</span>
                                                                <span className="mt-1"> start Date: {val?.actualStartDate ? moment(val?.actualStartDate).format('DD-MM-YYYY') : ''}</span>
                                                                <span className="skel-cr-date">End Date: {val?.actualEndDate ? moment(val?.actualEndDate).format('DD-MM-YYYY') : ''}</span>
                                                                <span className="skel-h-status mt-1">{val?.statusDesc?.description}</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                ))
                                            }</> : <span className="skel-widget-warning">No Schedule Billing</span>

                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="skel-view-base-card">
                                    <div className="skel-inter-statement">
                                        <span className="skel-profile-heading">Payment Scheduled ({scheduleContract?.rows && scheduleContract?.rows?.length || 0})</span>
                                        <div className="skel-cust-view-det">
                                            {scheduleContract?.rows && scheduleContract?.rows.length > 0 ? <> {
                                                scheduleContract?.rows.map((val, idx) => (
                                                    <>
                                                        <div key={idx} className="skel-inter-hist">
                                                            <div className="skel-serv-sect-lft">
                                                                <span className="skel-lbl-flds" data-toggle="modal" data-target="#skel-view-modal-accountdetails">Contract Name: {val?.contractName || ""}</span>
                                                                <span className="mt-1"> start Date: {val?.actualStartDate ? moment(val?.actualStartDate).format('DD-MM-YYYY') : ''}</span>
                                                                <span className="skel-cr-date">End Date: {val?.actualEndDate ? moment(val?.actualEndDate).format('DD-MM-YYYY') : ''}</span>
                                                                <span className="skel-h-status mt-1">{val?.statusDesc?.description}</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                ))
                                            }</> : <span className="skel-widget-warning">No Schedule Payment</span>

                                            }
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                                        {/* <div className="col-md-4">
                                <div className="skel-view-base-card">
                                    <div className="skel-inter-statement">
                                        <span className="skel-profile-heading">Revenue and ARPU</span>
                                        <div className="skel-cust-view-det">
                                            <div className="skel-inter-hist">
                                                <div className="skel-serv-sect-lft">
                                                    <span className="skel-cr-date" data-toggle="modal" data-target="#skel-view-modal-accountdetails">Revenue: {revenueDetails?.totalAmount ? Number(revenueDetails?.totalAmount) : 0}</span>
                                                    <span className="skel-cr-date" data-toggle="modal" data-target="#skel-view-modal-accountdetails">Average: {revenueDetails?.averageAmount ? Number(revenueDetails?.averageAmount).toFixed(2) : 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div> */}
                                    </div>
                                    <div className="form-row">
                                    {modulePermission?.includes(moduleConfig?.appointment) &&<div className="col-lg-12 col-md-12 col-xs-12">
                                            <div className="skel-view-base-card">
                                                <span className="skel-profile-heading">
                                                    Appointment Details{" "}
                                                    <span className="skel-badge badge-green">
                                                        <a
                                                            data-toggle="modal"
                                                            data-target="#skel-view-modal-appointment"
                                                        >
                                                            {appointmentList?.length}
                                                        </a>
                                                    </span>
                                                </span>
                                                <div
                                                    className={`skel-cust-view-det ${appointmentList?.length > 0 ? "" : "text-center"
                                                        }`}
                                                >
                                                    {appointmentList?.length > 0 ? (
                                                        appointmentList?.map((appointment, index) => (
                                                            <div
                                                                key={index}
                                                                className="skel-inter-hist appt-hist d-flex"
                                                            >
                                                                <div className="skel-appt-date">
                                                                    {moment(appointment.appointDate).format("DD-MMM")}{" "}
                                                                    <span>
                                                                        {moment(appointment.appointDate).format("YYYY")}
                                                                    </span>
                                                                </div>
                                                                <div className="skel-appt-bk-det appt-hist-det">
                                                                    <span>
                                                                        {appointment?.appointmentCustomer?.firstName}{" "}
                                                                        {appointment?.appointmentCustomer?.lastName}
                                                                    </span>
                                                                    <br />
                                                                    {/* <span>
                                                            {getContactDetail(
                                                                appointment?.appointmentCustomer
                                                                    ?.customerContact
                                                            )}
                                                        </span> */}
                                                                    <br />
                                                                    <span className="skel-cr-date">
                                                                        {moment(appointment.createdAt).format(
                                                                            "DD MMM, YYYY"
                                                                        )}
                                                                    </span>
                                                                    <div className="skel-appt-type-bk">
                                                                        <ul>
                                                                            <li className="skel-ty-clr">
                                                                                {capitalizeFirstLetter(
                                                                                    appointment?.appointMode?.description ?
                                                                                        appointment?.appointMode?.description
                                                                                            ?.toLowerCase()
                                                                                            ?.split("_")[0] :
                                                                                        appointment?.appointMode?.toLowerCase()
                                                                                            ?.split("_")[0]
                                                                                )}
                                                                            </li>
                                                                            <li className="skel-ch-clr">
                                                                                {appointment?.appointStartTime} - {appointment?.appointEndTime}
                                                                            </li>
                                                                            <li>
                                                                                {["AUDIO_CONF", "VIDEO_CONF"].includes(appointment.appointMode) ? (
                                                                                    <a href={appointment.appointModeValue} target="_blank" rel="noreferrer">Click here</a>
                                                                                ) : (
                                                                                    <span>{appointment?.appointModeValue?.description ? appointment?.appointModeValue?.description : appointment?.appointModeValue}</span>
                                                                                )}
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="skel-widget-warning">
                                                            No Appointments Found!!!
                                                        </span>
                                                    )}
                                                </div>
                                                {/* <a className="skel-a-lnk" data-toggle="modal" data-target="#skel-view-modal-appointment">View Appointment</a> */}
                                            </div>
                                        </div>}
                                        <div className="col-lg-12 col-md-12 col-xs-12">
                                            <div className="skel-view-base-card">
                                                <span className="skel-profile-heading">{props?.appsConfig?.clientFacingName?.customer ?? 'Customer'} Journey</span>
                                                <div className="skel-cust-view-det skel-emoj-data mt-3">
                                                    <CustomerJourney
                                                        data={{ customerEmotions, height: "400%" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="tab-scroller mt-2">
                                        <div className="container-fluid" id="list-wrapper">
                                            <div className="wrapper1">
                                                <ul
                                                    className="nav nav-tabs skel-tabs list"
                                                    id="list"
                                                    role="tablist"
                                                >
                                                    <li className="nav-item">
                                                        <a
                                                            className={`nav-link  ${tabType === "customerHistory" ? "active" : ""
                                                                }`}
                                                            id="CUSTHIST-tab"
                                                            data-toggle="tab"
                                                            href="#CUSTHIST"
                                                            role="tab"
                                                            aria-controls="CUSTHIST"
                                                            aria-selected="true"
                                                        //    onClick={(evnt) => { handleTypeSelect("customerHistory"); getCustomerHistoryData('customerHistory') }}
                                                        >
                                                            Customer History
                                                        </a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a
                                                            className={`nav-link  ${tabType === "addressHistory" ? "active" : ""
                                                                }`}
                                                            id="ADDRHIST-tab"
                                                            data-toggle="tab"
                                                            href="#ADDRHIST"
                                                            role="tab"
                                                            aria-controls="ADDRHIST"
                                                            aria-selected="true"
                                                        //    onClick={(evnt) => { handleTypeSelect("addressHistory"); getCustomerHistoryData('addressHistory') }}
                                                        >
                                                            Address History
                                                        </a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a
                                                            className={`nav-link  ${tabType === "billed" ? "active" : ""
                                                                }`}
                                                            id="BC-tab"
                                                            data-toggle="tab"
                                                            href="#BC"
                                                            role="tab"
                                                            aria-controls="BC"
                                                            aria-selected="true"
                                                        //    onClick={(evnt) => handleTypeSelect("billed")}
                                                        >
                                                            Billed Contract
                                                        </a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a
                                                            className={`nav-link  ${tabType === "unbilled" ? "active" : ""
                                                                }`}
                                                            id="UBC-tab"
                                                            data-toggle="tab"
                                                            href="#UBC"
                                                            role="tab"
                                                            aria-controls="UBC"
                                                            aria-selected="false"
                                                        //  onClick={(evnt) => handleTypeSelect("unbilled")}
                                                        >
                                                            UnBilled Contract
                                                        </a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a
                                                            className={`nav-link  ${tabType === "history" ? "active" : ""
                                                                }`}
                                                            id="CH-tab"
                                                            data-toggle="tab"
                                                            href="#CH"
                                                            role="tab"
                                                            aria-controls="CH"
                                                            aria-selected="false"
                                                        //  onClick={(evnt) => handleTypeSelect("history")}
                                                        >
                                                            Billing Scheduled
                                                        </a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a
                                                            className={`nav-link  ${tabType === "Invoice" ? "active" : ""
                                                                }`}
                                                            id="invoice-tab"
                                                            data-toggle="tab"
                                                            href="#invoice"
                                                            role="tab"
                                                            aria-controls="invoice"
                                                            aria-selected="false"
                                                        //  onClick={(evnt) => handleTypeSelect("Invoice")}
                                                        >
                                                            Invoice
                                                        </a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a
                                                            className={`nav-link  ${tabType === "interaction" ? "active" : ""
                                                                }`}
                                                            id="interaction-tab"
                                                            data-toggle="tab"
                                                            href="#interaction"
                                                            role="tab"
                                                            aria-controls="interaction"
                                                            aria-selected="false"
                                                        //   onClick={(evnt) => handleTypeSelect("interaction")}
                                                        >
                                                            Interaction
                                                        </a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a
                                                            className={`nav-link  ${tabType === "order" ? "active" : ""
                                                                }`}
                                                            id="order-tab"
                                                            data-toggle="tab"
                                                            href="#order"
                                                            role="tab"
                                                            aria-controls="order"
                                                            aria-selected="false"
                                                        //     onClick={(evnt) => handleTypeSelect("order")}
                                                        >
                                                            Order
                                                        </a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a
                                                            className={`nav-link  ${tabType === "helpdesk" ? "active" : ""
                                                                }`}
                                                            id="helpdesk-tab"
                                                            data-toggle="tab"
                                                            href="#helpdesk"
                                                            role="tab"
                                                            aria-controls="helpdesk"
                                                            aria-selected="false"
                                                        //    onClick={(evnt) => handleTypeSelect("helpdesk")}
                                                        >
                                                            Help Desk
                                                        </a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a
                                                            className={`nav-link  ${tabType === "payment" ? "active" : ""
                                                                }`}
                                                            id="payment-tab"
                                                            data-toggle="tab"
                                                            href="#paymenthistory"
                                                            role="tab"
                                                            aria-controls="payment"
                                                            aria-selected="true"
                                                        //    onClick={(evnt) => handleTypeSelect("payment")}
                                                        >
                                                            Payment Scheduled
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div> */}
                                    {/* <div className="tab-scroller mt-2">
                                        <div className="card-body">
                                            <div className="tab-content">
                                                <div
                                                    className={`tab-pane fade ${tabType === "customerHistory" ? "show active" : ""
                                                        }`}
                                                    id="CUSTHIST"
                                                    role="tabpanel"
                                                    aria-labelledby="CUSTHIST-tab"
                                                >
                                                    <div className="cmmn-container-base no-brd">
                                                        {
                                                            customerDetailsList.length > 0 ?
                                                                <DynamicTable
                                                                    listKey={"Customer Details History"}
                                                                    row={customerDetailsList}
                                                                    rowCount={totalCount}
                                                                    header={CustomerDetailsColumns}
                                                                    itemsPerPage={perPage}
                                                                    backendPaging={true}
                                                                    backendCurrentPage={currentPage}
                                                                    handler={{
                                                                        handleCellRender: handleCellRender,
                                                                        handlePageSelect: handlePageSelect,
                                                                        handleItemPerPage: setPerPage,
                                                                        handleCurrentPage: setCurrentPage
                                                                    }}
                                                                />
                                                                :
                                                                <p class="skel-widget-warning">No records found!!!</p>
                                                        }
                                                    </div>
                                                </div>
                                                <div
                                                    className={`tab-pane fade ${tabType === "addressHistory" ? "show active" : ""
                                                        }`}
                                                    id="ADDRHIST"
                                                    role="tabpanel"
                                                    aria-labelledby="ADDRHIST-tab"
                                                >
                                                    <div className="cmmn-container-base no-brd">
                                                        {
                                                            customerAddressList.length > 0 ?
                                                                <DynamicTable
                                                                    listKey={"Customer Address History"}
                                                                    row={customerAddressList}
                                                                    rowCount={totalCountAddress}
                                                                    header={CustomerAddressColumns}
                                                                    itemsPerPage={perPageAddress}
                                                                    backendPaging={true}
                                                                    backendCurrentPage={currentPageAddress}
                                                                    handler={{
                                                                        handleCellRender: handleCellRender,
                                                                        handlePageSelect: handlePageSelectAddress,
                                                                        handleItemPerPage: setPerPageAddress,
                                                                        handleCurrentPage: setCurrentPageAddress,
                                                                    }}
                                                                />
                                                                :
                                                                <p class="skel-widget-warning">No records found!!!</p>
                                                        }
                                                    </div>
                                                </div>
                                                <div
                                                    className={`tab-pane fade ${tabType === "billed" ? "show active" : ""
                                                        }`}
                                                    id="BC"
                                                    role="tabpanel"
                                                    aria-labelledby="BC-tab"
                                                >
                                                    <div className="cmmn-container-base no-brd">
                                                        {selectedAccount && selectedAccount?.accountNo ? (
                                                            <SearchContract
                                                                data={{
                                                                    data: {
                                                                        billRefNo: selectedAccount?.accountNo,
                                                                        customerUuid,
                                                                    },
                                                                    hideForm: true,
                                                                    contractType: tabType,
                                                                    // contractType: "billed",
                                                                    refresh:
                                                                        pageRefreshHandlers.contractInvoicePaymentRefresh,
                                                                    from: "Customer360",
                                                                }}
                                                                handler={{
                                                                    pageRefresh: handleContractInvoicePaymentRefresh,
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="msg-txt pt-1">
                                                                No Contracts Available
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`tab-pane fade ${tabType === "unbilled" ? "show active" : ""
                                                        }`}
                                                    id="UBC"
                                                    role="tabpanel"
                                                    aria-labelledby="UBC-tab"
                                                >
                                                    <div className="cmmn-container-base no-brd">
                                                        {selectedAccount && selectedAccount?.accountNo ? (
                                                            <SearchContract
                                                                data={{
                                                                    data: {
                                                                        billRefNo: selectedAccount?.accountNo,
                                                                        customerUuid,
                                                                    },
                                                                    hideForm: true,
                                                                    contractType: tabType,
                                                                    // contractType: "unbilled",
                                                                    refresh:
                                                                        pageRefreshHandlers.contractInvoicePaymentRefresh,
                                                                    from: "Customer360",
                                                                }}
                                                                handler={{
                                                                    pageRefresh: handleContractInvoicePaymentRefresh,
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="msg-txt pt-1">
                                                                No Contracts Available
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`tab-pane fade ${tabType === "history" ? "show active" : ""
                                                        }`}
                                                    id="CH"
                                                    role="tabpanel"
                                                    aria-labelledby="CH-tab"
                                                >
                                                    <div className="cmmn-container-base no-brd">
                                                        {selectedAccount && selectedAccount?.accountNo ? (
                                                            <SearchContract
                                                                data={{
                                                                    data: {
                                                                        billRefNo: selectedAccount?.accountNo,
                                                                        customerUuid,
                                                                    },
                                                                    hideForm: true,
                                                                    contractType: tabType,
                                                                    // contractType: "history",
                                                                    refresh:
                                                                        pageRefreshHandlers.contractInvoicePaymentRefresh,
                                                                    from: "Customer360",
                                                                }}
                                                                handler={{
                                                                    pageRefresh: handleContractInvoicePaymentRefresh,
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="msg-txt pt-1">
                                                                No Contracts Available
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`tab-pane fade ${tabType === "Invoice" ? "show active" : ""
                                                        }`}
                                                    id="invoice"
                                                    role="tabpanel"
                                                    aria-labelledby="Invoice-tab"
                                                >
                                                    <div className="cmmn-container-base no-brd">
                                                        {selectedAccount && selectedAccount?.accountNo ? (
                                                            <SearchInvoice
                                                                data={{
                                                                    data: {
                                                                        customerUuid,
                                                                        startDate: null,
                                                                        endDate: null,
                                                                    },
                                                                    hideForm: true,
                                                                    tabType,
                                                                    refresh:
                                                                        pageRefreshHandlers.contractInvoicePaymentRefresh,
                                                                    from: "Customer360",
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="msg-txt pt-1">
                                                                No Invoice Available
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`tab-pane fade ${tabType === "helpdesk" ? "show active" : ""
                                                        }`}
                                                    id="helpdesk"
                                                    role="tabpanel"
                                                    aria-labelledby="helpdesk-tab"
                                                >
                                                    <div className="cmmn-container-base no-brd">
                                                        {customerDetails && (
                                                            <Helpdesk
                                                                data={{
                                                                    customerDetails: customerDetails,
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`tab-pane fade ${tabType === "payment" ? "show active" : ""
                                                        }`}
                                                    id="paymenthistory"
                                                    role="tabpanel"
                                                    aria-labelledby="payment-tab"
                                                >
                                                    <div className="cmmn-container-base no-brd">
                                                        {
                                                            <Payment
                                                                data={{
                                                                    selectedAccount: selectedAccount,
                                                                }}
                                                            />
                                                        }
                                                    </div>
                                                </div>
                                                <div
                                                    className={`tab-pane fade ${tabType === "order" ? "show active" : ""
                                                        }`}
                                                    id="order"
                                                    role="tabpanel"
                                                    aria-labelledby="order-tab"
                                                >
                                                    <div className="cmmn-container-base no-brd">
                                                        {customerDetails && (
                                                            <WorkOrders
                                                                data={{
                                                                    customerDetails,
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`tab-pane fade ${tabType === "interaction" ? "show active" : ""
                                                        }`}
                                                    id="interaction"
                                                    role="tabpanel"
                                                    aria-labelledby="interaction-tab"
                                                >
                                                    <div className="cmmn-container-base no-brd">
                                                        {customerDetails && (
                                                            <Interactions
                                                                data={{
                                                                    customerDetails,
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                        {/* <div className='skel-print-cust-preview'>
                            <div className="skel-view-base-card skel-cust-ht-sect">
                                <div className="skel-profile-base">
                                    <div className="skel-profile-info">
                                        <div className="profile-info-rht"><div className="cust-profile-top skel-view-customer-profile-top">
                                            <div className="profile-top-head">
                                                <div className="skel-cust-profile-image">
                                                </div>
                                                <div className="skel-cust-pr-name">
                                                    <span className="profile-name">Sibi</span>
                                                    <p>Customer Number: CUST00000312</p>
                                                </div>
                                            </div>
                                            <div className="customer-buttons-top">
                                                <span className="icons-md-icon"><i className="fa fa-calendar"></i></span>
                                                <button className="styl-edti-btn" data-target="#editbusinessModal" data-toggle="modal">Edit</button>
                                                <button className="styl-edti-btn"><i className="fas fa-print mr-1"></i> Print</button>
                                            </div>
                                        </div>
                                            <div className="cust-profile-bottom">
                                                <div className="profile-qcnt"><a mailto="">sibichakravarthi.s@bahwancybertek.com</a><p>2342344234</p>
                                                    <div className="bussiness-info"><span className="bussiness-type">Regular</span><span className="profile-status">Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="skel-serv-sect-revenue">
                                    <div><span>Revenue:<br /> 28925 USD</span></div>
                                    <div><span>Average:<br /> 3213.89 USD</span></div>
                                </div>
                                <hr className="cmmn-hline mt-2" />
                                <img src="/bcae/static/media/v-img.e197af69aa8fdbcad604.png" alt="" className="img-fluid skel-place-img" /></div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
})

const interactionListColumns = [
    {
        Header: "Interaction ID",
        accessor: "intxnId",
        disableFilters: true,
    },
    {
        Header: "Interaction Category",
        accessor: "intxnCategory.description",
        disableFilters: true,
    },
    {
        Header: "Interaction Type",
        accessor: "intxnType.description",
        disableFilters: true,
    },
    {
        Header: "Service Category",
        accessor: "serviceCategory.description",
        disableFilters: true,
    },
    {
        Header: "Service Type",
        accessor: "serviceType.description",
        disableFilters: true,
    },
    {
        Header: "Status",
        accessor: "intxnStatus.description",
        disableFilters: true,
    },
];

const orderListColumns = [
    {
        Header: "Order No",
        accessor: "orderNo",
        disableFilters: true,
    },
    {
        Header: "Order Category",
        accessor: "orderCategory.description",
        disableFilters: true,
    },
    {
        Header: "Order Type",
        accessor: "orderType.description",
        disableFilters: true,
    },
    // {
    //   Header: "Service Category",
    //   accessor: "serviceCategory.description",
    //   disableFilters: true,
    // },
    // {
    //   Header: "Service Type",
    //   accessor: "serviceType.description",
    //   disableFilters: true,
    // },
    {
        Header: "Status",
        accessor: "orderStatus.description",
        disableFilters: true,
    },
];

const CustomerDetailsColumns = [
    {
        Header: "Customer ID Type",
        accessor: "idType",
        disableFilters: true,
        id: "idType"
    },
    {
        Header: "ID Number",
        accessor: "idValue",
        disableFilters: true,
        id: "idValue"
    },
    {
        Header: "Email",
        accessor: "email",
        disableFilters: true,
        id: "email"
    },
    // {
    //     Header: "Contact Type",
    //     accessor: "contactType",
    //     disableFilters: true,
    //     id: "contactType",
    // },
    {
        Header: "Contact Number",
        accessor: "contactNo",
        disableFilters: true,
        id: "contactNo"
    },
    {
        Header: "Modified Date Time",
        accessor: "updatedAt",
        disableFilters: true,
        id: "updatedAt"
    },
    {
        Header: "Modified By",
        accessor: "modifiedBy",
        disableFilters: true,
        id: "modifiedBy"
    }
]

const CustomerAddressColumns = [
    {
        Header: "Address 1",
        accessor: "address1",
        disableFilters: true,
        id: "address1"
    },
    {
        Header: "Address 2",
        accessor: "address2",
        disableFilters: true,
        id: "address2"
    },
    {
        Header: "Address 3",
        accessor: "address3",
        disableFilters: true,
        id: "address3"
    },
    {
        Header: "City/Town",
        accessor: "city",
        disableFilters: true,
        id: "city"
    },
    {
        Header: "District/Province",
        accessor: "district",
        disableFilters: true,
        id: "district"
    },
    {
        Header: "State/Region",
        accessor: "state",
        disableFilters: true,
        id: "state"
    },
    {
        Header: "Post Code",
        accessor: "postcode",
        disableFilters: true,
        id: "postcode"
    },
    {
        Header: "Country",
        accessor: "country",
        disableFilters: true,
        id: "country"
    },
    {
        Header: "Modified Date Time",
        accessor: "updatedAt",
        disableFilters: true,
        id: "updatedBy"
    },
    {
        Header: "Modified By",
        accessor: "modifiedBy",
        disableFilters: true,
        id: "modifiedBy"
    }
]

export default CustomerViewPrint