/* eslint-disable array-callback-return */
import { isEmpty } from 'lodash';
import moment from "moment";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { CloseButton, Modal } from "react-bootstrap";
import { unstable_batchedUpdates } from "react-dom";
import { useTranslation } from "react-i18next";
import Joyride from 'react-joyride';
import { Link } from "react-router-dom";
import { useReactToPrint } from 'react-to-print';
import { toast } from "react-toastify";
import { moduleConfig } from "../../AppConstants";
import { AppContext } from "../../AppContext";
import PaymentHistory from "../../InvoiceAndBilling/Accounting/AccountDetailsView/PaymentHistory";
import SearchContract from "../../InvoiceAndBilling/Contract/SearchContract";
import SearchInvoice from "../../InvoiceAndBilling/Invoice/SearchInvoice";
import arrowDown from "../../assets/images/updown.svg";
import vIcon from "../../assets/images/v-img.png";
import DynamicTable from "../../common/table/DynamicTable";
import { history } from "../../common/util/history";
import { get, post } from "../../common/util/restUtil";
import { properties } from "../../properties";
import Helpdesk from "../Customer360/InteractionTabs/Helpdesk";
import Interactions from "../Customer360/InteractionTabs/Interactions";
import Payment from "../Customer360/InteractionTabs/Payment";
import WorkOrders from "../Customer360/InteractionTabs/WorkOrders";
import ManageService from "../Customer360/ManageServices/ManageServices";
import CustomerServiceForm from "../ServiceManagement/CustomerServiceForm";
import ChannelActivityChart from "./ChannelActivityChart";
import ChannelPerformanceChart from "./ChannelPerformanceChart";
import CustomerDetailsFormViewMin from "./CustomerDetailsFormViewMin";
import CustomerJourney from "./CustomerJourney";
import NegativeScatterChart from "./NegativeScatterChart";
import SentimentChart from "./SentimentChart";
import SentimentGauge from "./SentimentScoreGauge";
import CustomerViewPrint from './CustomerViewPrint';

// import { Link, Element } from 'react-scroll'
// import { Link as DomLink } from 'react-router-dom';
// import Modal from "react-modal";
// import CustomerHistory from "./CustomerHistory";
// import Slider from "react-slick";
// import BestOffer from './BestOffers'
// import AccountDetailsFormView from '../AccountManagement/AccountDetailsFormView';
// import BillableDetailsFormView from '../Customer/BillableDetailsFormView';
// import ServiceListFormView from '../ServiceManagement/ServiceListFormView';
// import ProgressBar from 'react-bootstrap/ProgressBar';
// import DynamicTable from '../../common/table/DynamicTable';
// import InteractionList from "../../HelpdeskAndInteraction/Interaction/InteractionList";
// import emojiIcon from '../../assets/images/emoji.png';
// import profileIcon from "../../assets/images/profile.png";
// import IntelligenceCorner from "./IntelligenceCorner";
// import ActivityChart from "./ChannelActivityChart";
// import { Model } from "echarts";
// let Limiter = require("async-limiter");
// const { TabPane } = Tabs;
// const settings = {
//     dots: false,
//     infinite: false,
//     arrows: true,
//     speed: 500,
//     slidesToShow: 3,
//     slidesToScroll: 3,
//     initialSlide: 0,
//     responsive: [
//         {
//             breakpoint: 1024,
//             settings: {
//                 slidesToShow: 3,
//                 slidesToScroll: 3,
//                 infinite: true,
//                 dots: false
//             }
//         },
//         {
//             breakpoint: 600,
//             settings: {
//                 slidesToShow: 2,
//                 slidesToScroll: 2,
//                 initialSlide: 2
//             }
//         },
//         {
//             breakpoint: 480,
//             settings: {
//                 slidesToShow: 1,
//                 slidesToScroll: 1
//             }
//         }
//     ]
// };
// const recentActivitySettings = {
//     dots: false,
//     infinite: true,
//     arrows: true,
//     speed: 500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     initialSlide: 0,
//     autoplay: true,
//     autoplaySpeed: 5000,
//     responsive: [
//         {
//             breakpoint: 1024,
//             settings: {
//                 slidesToShow: 1,
//                 slidesToScroll: 1,
//                 infinite: true,
//                 dots: false
//             }
//         },
//         {
//             breakpoint: 600,
//             settings: {
//                 slidesToShow: 1,
//                 slidesToScroll: 1,
//                 initialSlide: 1
//             }
//         },
//         {
//             breakpoint: 480,
//             settings: {
//                 slidesToShow: 1,
//                 slidesToScroll: 1
//             }
//         }
//     ]
// };

const CustomerDetailsView = (props) => {
  const modulePermission = props?.appsConfig?.moduleSetupPayload
  const [runTour, setRunTour] = useState(true);
  const steps = [
    {
      target: '.step-1', // CSS selector of the element you want to highlight
      content: 'This is step 1. Click Next to continue.',
    },
    {
      target: '.step-2',
      content: 'Step 2 description.',
    },
    // Add more steps as needed
  ];

  // function handleOnClickBack() {
  //   history.goBack();
  // }

  const customerUuid = sessionStorage.getItem("customerUuid") || null;
  const customerIds = sessionStorage.getItem("customerIds") || null;
  const accountNo = sessionStorage.getItem("accountNo")
    ? Number(sessionStorage.getItem("accountNo"))
    : null;
  const [perPage, setPerPage] = useState(10);
  const [customerDetails, setCustomerDetails] = useState(
    props?.location?.state?.data?.customerData
  );
  const [accountDetails, setAccountDetails] = useState(
    props?.location?.state?.data?.accountData
  );
  const [servicesList, setServicesList] = useState(
    props?.location?.state?.data?.serviceDetails
  );

  const [interactionModalData, setInteractionModalData] = useState();
  const [orderModalData, setOrderModalData] = useState();
  const [intelligenceList, setIntelligenceList] = useState([]);
  const [appointmentList, setAppointmentList] = useState([]);
  const [isPrint, setIsPrint] = useState(false);

  // let limiter = new Limiter({ concurrency: 1 });
  // let serviceCardRef = useRef(null);
  // const refVoid = useRef(null)
  // let serviceRef = useRef(null);
  // let accountRef = useRef(null);
  let openInteractionCount = useRef(0),
    closedInteractionCount = useRef(0);
  const { auth, appsConfig } = useContext(AppContext);
  const { t } = useTranslation();
  const [refreshPage, setRefreshPage] = useState(true);
  const [searchInput, setSearchInput] = useState({});
  const [activeService, setActiveService] = useState("");
  const [accountList, setAccountList] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState({});
  const [accountRealtimeDetails, setAccountRealtimeDetails] = useState({});
  const [accountUuid, setAccountUuid] = useState();
  // const [serviceIdsList, setServiceIdsList] = useState([])
  const [expiryServicesList, setExpiryServicesList] = useState([]);
  // const [servicesSummary, setServicesSummary] = useState([])
  const [serviceModal, setServiceModal] = useState({ state: false });
  const [selectedService, setSelectedService] = useState({ idx: -1 });
  const [productList, setProductList] = useState([]);
  const [isManageServicesOpen, setIsManageServicesOpen] = useState(false);
  const [isInteractionListOpen, setIsInteractionListOpen] = useState(false);
  const [isOrderListOpen, setIsOrderListOpen] = useState(false);


  const [interactionStatusType, setInteractionStatusType] = useState();
  const [customerDetailsList, setCustomerDetailsList] = useState([]);
  const [sentimentScore, setSentimentScore] = useState(0);

  const manageServiceRef = useRef();

  // const [leftNavCounts, setLeftNavCounts] = useState({})
  const [leftNavCountsComplaint, setLeftNavCountsComplaint] = useState({});
  // const [leftNavCountsInquiry, setLeftNavCountsInquiry] = useState({})
  // const [leftNavWoCounts, setLeftNavWoCounts] = useState({})
  const [newAccountAddded, setNewAccountAdded] = useState({
    isAccountAdded: false,
  });
  // const [newServiceAddded, setNewServiceAdded] = useState({ isServicesAdded: false })
  // const [refreshServiceList, setRefreshServiceList] = useState(null)
  // const [refreshServiceRequest, setRefreshServiceRequest] = useState(true);
  // const [refreshComplaint, setRefreshComplaint] = useState(true);
  // const [refreshInquiry, setRefreshInquiry] = useState(true)
  const [serviceStatus, setServiceStatus] = useState("");
  const [buttonDisable, setButtonDisable] = useState(true);
  // const [openAccModal, setAccOpenModal] = useState(false)
  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [openAddServiceModal, setOpenAddServiceModal] = useState(false);
  const [customerAddressList, setCustomerAddressList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [openInteractionModal, setOpenInteractionModal] = useState(false);
  // const [openBillHistoryModal, setOpenBillHistoryModal] = useState(false)
  // const [billingDetails, setBillingDetails] = useState()
  const [accountCount, setAccountCount] = useState();
  const [serviceTypeLookup, setServiceTypeLookup] = useState([]);
  const [serviceData, setServiceData] = useState({
    serviceType: "",
    totalRc: 0,
    totalNrc: 0,
    isNeedQuoteOnly: "N",
  });
  const [selectedProductList, setSelectedProductList] = useState([]);
  const [userPermission, setUserPermission] = useState({
    addAttachment: false,
    editUser: false,
    editAccount: false,
    addService: false,
    addComplaint: false,
    addInquiry: false,
    viewCustomer: false,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [service, setService] = useState(
    sessionStorage.getItem("service") === "true" ? true : false
  );
  const [account, setAccount] = useState(
    sessionStorage.getItem("account") === "true" ? true : false
  );
  const [tabType, setTabType] = useState("customerHistory");
  const [customerEmotions, setCustomerEmotions] = useState([]);
  const [channelActivity, setChannelActivity] = useState([]);
  const [sentimentChartData, setSentimentChartData] = useState([]);


  const [currentPage, setCurrentPage] = useState(0);
  const [pageRefreshHandlers, setPageRefreshHandlers] = useState({
    attachmentRefresh: true,
    customerRefresh: true,
    accountEditRefresh: true,
    serviceRefresh: true,
    contractInvoicePaymentRefresh: true,
  });
  // const [customerRefresh, setCustomerRefresh] = useState(true);
  const [scheduleContract, setScheduleContract] = useState([]);
  const [revenueDetails, setRevenueDetails] = useState({});
  const [totalCountAddress, setTotalCountAddress] = useState(0);
  const [perPageAddress, setPerPageAddress] = useState(10);
  const [currentPageAddress, setCurrentPageAddress] = useState(0);
  // const [filtersAddress, setFiltersAddress] = useState([])
  const [productBenefitLookup, setProductBenefitLookup] = useState([])
  const businessMasterRef = useRef()
  const [isSetimentPopupOpen, setIssetimentPopupOpen] = useState(false)
  const [sentimentFilter, setSentimentFilter] = useState({})
  const [sentimentFilterData, setSentimentFilterData] = useState([])
  const [sentimentCurrentPage, setSentimentCurrentPage] = useState(0);
  const [sentimentPerPage, setSentimentPerPage] = useState(10);

  // Interaction List

  const [interactionCurrentPage, setInteractionCurrentPage] = useState(0)
  const [interactionPerPage, setInteractionPerPage] = useState(10)
  const [interactionList, setInteractionList] = useState([]);
  const [interactionData, setInteractionData] = useState([]);

  // Order List
  const [orderList, setOrderList] = useState([]);
  const [orderCurrentPage, setOrderCurrentPage] = useState(0)
  const [orderPerpage, setOrderPerpage] = useState(10)

  //Followups
  const [followUpList, setFollowupList] = useState([]);
  const [followUpCurrentPage, setFollowUpCurrentPage] = useState(0)
  const [followUpPerpage, setFollowupPerpage] = useState(10)
  const [isFolloupListOpen, setIsFolloupListOpen] = useState(false)


  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      setIsPrint(false)
    }
  });


  useEffect(() => {
    if (!isEmpty(sentimentFilter) && Array.isArray(sentimentChartData) && sentimentChartData?.length > 0) {
      const filterData = sentimentChartData?.filter(ch => ch?.monthYear === sentimentFilter?.monthYear && ch?.emotion === sentimentFilter?.emotion).map((e) => e?.details) || []
      setSentimentFilterData(filterData)
    }
  }, [sentimentChartData, sentimentFilter])

  const getCustomerHistoryData = useCallback((type) => {
    if (['customerHistory', 'addressHistory'].includes(type) && customerDetails) {

      const { customerUuid, customerNo } = customerDetails;
      const requestBody = {
        customerUuid,
        customerNo
      }
      post(`${properties.CUSTOMER_API}/${type === "customerHistory" ? 'details/' : type === "addressHistory" ? 'address/' : ''}history?limit=${type === "customerHistory" ? perPage : type === "addressHistory" ? perPageAddress : 10}&page=${type === "customerHistory" ? currentPage : type === "addressHistory" ? currentPageAddress : 0}`, requestBody)
        .then((response) => {
          if (response.data) {
            const { count, rows } = response.data;
            if (!!rows.length) {
              let customerDetails = [];
              let customerAddress = [];
              // let customerProperty = [];
              rows?.forEach((data) => {
                const { idValue, idTypeDesc, contactTypeDesc, updatedAt, modifiedBy,
                  address1, address2, address3, city, district, state, postcode, country, customerContact } = data;
                if (data && type === "customerHistory") {
                  customerContact && customerContact.map((val) => (
                    customerDetails.push({
                      idType: idTypeDesc?.description,
                      idValue,
                      email: val.emailId,
                      contactType: contactTypeDesc?.description,
                      contactNo: val.mobileNo,
                      updatedAt: moment(updatedAt).format('DD-MM-YYYY hh:mm:ss A'),
                      modifiedBy: `${data.updatedByName ? (data.updatedByName?.firstName || '') + ' ' + (data.updatedByName?.lastName || '') : (data.createdByName?.firstName || '') + ' ' + (data.createdByName?.lastName || '')}`
                    })
                  ))

                }
                if (type === "addressHistory") {
                  customerAddress.push({
                    address1,
                    address2,
                    address3,
                    city,
                    district,
                    districtDesc: data?.districtDesc || district,
                    state,
                    stateDesc: state,
                    postcode,
                    zipDesc: postcode,
                    country,
                    countryDesc: data?.countryDesc?.description || country,
                    updatedAt: moment(updatedAt).format('DD-MM-YYYY hh:mm:ss A'),
                    modifiedBy: `${modifiedBy?.firstName || ""} ${modifiedBy?.lastName || ""}`
                  })
                }
              });
              unstable_batchedUpdates(() => {
                if (type === "customerHistory") {
                  setTotalCount(count)
                  setCustomerDetailsList(customerDetails);
                }
                if (type === "addressHistory") {
                  setTotalCountAddress(count)
                  setCustomerAddressList(customerAddress);
                }
              })
            }
          }
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {

        })
    }
  }, [])

  useEffect(() => {
    if (tabType === 'customerHistory')
      getCustomerHistoryData('customerHistory')
  }, [customerDetails, getCustomerHistoryData, tabType])


  const handleContractInvoicePaymentRefresh = () => {
    setPageRefreshHandlers({
      ...pageRefreshHandlers,
      contractInvoicePaymentRefresh:
        !pageRefreshHandlers.contractInvoicePaymentRefresh,
    });
  };

  // const handleAttachmentRefresh = () => {
  //     setPageRefreshHandlers({
  //         ...pageRefreshHandlers,
  //         attachmentRefresh: !pageRefreshHandlers.attachmentRefresh
  //     })
  // }

  const capitalizeFirstLetter = (string) => {
    return string?.charAt(0)?.toUpperCase() + string?.slice(1);
  };

  const pageRefresh = () => {
    setRefreshPage(!refreshPage);
  };

  const handleTypeSelect = (type) => {
    setTabType(type);
  };

  const handleInteractionModal = (data) => {
    // console.log('in data==', data)
    setInteractionModalData(data);
    setOpenInteractionModal(true);
  };

  const hanldeOpenOrderModal = (data) => {
    setOrderModalData(data);
    setOpenOrderModal(true);
  };
  // const customerRefreshDetails = () => {
  //     setCustomerRefresh(!customerRefresh)
  // }

  const handleOnModelClose = () => {
    setOpenServiceModal(false);
    setOpenAddServiceModal(false);
    setOpenInteractionModal(false);
    setOpenOrderModal(false);
    setIsInteractionListOpen(false);
    setIsOrderListOpen(false);
    setIsFolloupListOpen(false)
  };

  const handleSentimentModelClose = () => {
    setIssetimentPopupOpen(false)
    setSentimentFilter({})
  };

  // const onClickScrollTo = () => {
  //
  //     setTimeout(() => {

  //         if (Number(accountNo) === Number(selectedAccount.accountNo) && accountNo !== null && accountNo !== undefined && accountNo !== '') {
  //             if (accountRef && accountRef !== null && account === true) {
  //                 accountRef.current.scrollIntoView({ top: serviceCardRef.current.offsetTop, behavior: 'smooth', block: "start" })
  //             }
  //             if (searchInput.serviceId !== null && activeService !== null && activeService !== undefined && serviceCardRef !== null && serviceCardRef !== undefined && serviceCardRef !== '') {
  //                 if (searchInput.serviceId !== null && Number(searchInput.serviceId) === Number(activeService)) {
  //                     if (serviceCardRef && serviceCardRef !== null && service === true) {
  //                         serviceCardRef.current.scrollIntoView({ top: serviceCardRef.current.offsetTop, bottom: 10, behavior: 'smooth', block: "start" })
  //                         serviceRef.current.scrollIntoView({ top: serviceRef.current.offsetTop, behavior: 'smooth', block: "start" })
  //                     }

  //                 }
  //             }
  //         }
  //         else {
  //             setService(false)
  //             setAccount(false)
  //         }
  //
  //     }, 5000)
  // }
  useEffect(() => {
    get(
      properties.INTERACTION_API + "/counts?customerUuid=" + customerUuid
    ).then((resp) => {
      // console.log('count rows================', resp.data)
      if (resp.data.count !== 0) {
        closedInteractionCount.current = resp.data?.rows.filter((e) =>
          ["CLOSED", "CANCELLED"].includes(e.intxnStatus.code)
        );
        openInteractionCount.current = resp.data?.rows.filter(
          (e) => !["CLOSED", "CANCELLED"].includes(e.intxnStatus.code)
        );
      }

    }).catch((error) => console.error(error));

    get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=PRODUCT_BENEFIT')
      .then((response) => {
        if (response.data) {
          businessMasterRef.current = response.data
          unstable_batchedUpdates(() => {
            setProductBenefitLookup(response.data.PRODUCT_BENEFIT)
          })
        }
      }).catch((error) => console.error(error))
  }, []);

  useEffect(() => {
    post(`${properties.CUSTOMER_API}/get-customer?limit=1&page=0`, { customerUuid }).then((resp) => {
      if (resp.data) {
        if (resp.status === 200) {
          const { rows } = resp.data;
          unstable_batchedUpdates(() => {
            setCustomerDetails(rows[0]);
          });
        }
      }
    }).catch((error) => console.error(error))
      .finally();
  }, [refreshPage])

  useEffect(() => {
    if (customerUuid && customerUuid !== "") {
      get(properties.MASTER_API + "/lookup?searchParam=code_type&valueParam=SERVICE_TYPE")
        .then((response) => {
          if (response.data) {
            setServiceTypeLookup(response.data.SERVICE_TYPE);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally();

      if (!customerDetails) {
        post(`${properties.CUSTOMER_API}/get-customer?limit=1&page=0`, {
          customerUuid,
        })
          .then((resp) => {
            if (resp.data) {
              if (resp.status === 200) {
                const { rows } = resp.data;
                unstable_batchedUpdates(() => {
                  setCustomerDetails(rows[0]);
                });
              }
            }
          }).catch((error) => console.error(error))
          .finally();
      }
      get(properties.CUSTOMER_API + "/recent-activities/" + customerUuid)
        .then((resp) => {
          setRecentActivity(resp.data);
        }).catch((error) => console.error(error))
        .finally();

      //   const searchParams = {
      //   customerUuid,
      // };
      // post(`${properties.INTERACTION_API}/search?limit=${perPage}&page=${currentPage}`,{ searchParams })
      // .then((resp) => {
      //     // console.log('interaction list====================', resp?.data?.rows)
      //     setInteractionList(resp.data);
      //     setInteractionData(resp.data?.rows);
      //   })
      //   .catch((error) => console.error(error))
      //   .finally();

      // console.log('customerUuid------------->', customerIds)
      // post(
      //   `${properties.ORDER_API}/search?limit=${perPage}&page=${currentPage}`,
      //   {
      //     searchParams: {
      //       customerId: customerIds
      //     }
      //   }
      // )
      //   .then((resp) => {
      //     // console.log('order list====================', resp?.data?.row)
      //     setOrderList(resp?.data?.row || []);
      //   }).catch((error) => console.error(error))
      //   .finally();

      get(
        properties.INTELLIGENCE_API + "/get-events?customerUuid=" + customerUuid
      )
        .then((resp) => {
          // console.log('intelligence data == ', resp.data)
          setIntelligenceList(resp?.data || []);
        }).catch((error) => console.error(error))
        .finally();

      // get schedule contract
      get(`${properties.CONTRACT_API}/get-scheduled-contracts/${customerUuid}`)
        .then((response) => {
          if (response?.data && response?.data) {
            setScheduleContract(response?.data);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally();

      // get customer revenue
      get(`${properties.CUSTOMER_API}/getCustomerRevenue/${customerUuid}`)
        .then((response) => {
          if (response?.data && response?.data) {
            setRevenueDetails(response?.data);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally();

    }
  }, [currentPage, perPage]);

  useEffect(() => {
    if (customerUuid && customerUuid !== "") {
      // console.log('customerUuid=--------------------', customerUuid)
      get(properties.INTERACTION_API + "/customers-interaction/" + customerUuid)
        .then((resp) => {
          if (resp && resp.data) {
            // console.log('emotions===> ', resp.data)
            setSentimentChartData([...resp.data]);
          }
        })
        .catch((error) => console.error(error));
      get(properties.CUSTOMER_API + "/customers-interaction/" + customerUuid)
        .then((resp) => {
          if (resp && resp.data) {
            setCustomerEmotions([...resp.data]);
          }
        })
        .catch((error) => console.error(error));

      get(
        properties.CUSTOMER_API + "/customers-channel-activity/" + customerUuid
      )
        .then((resp) => {
          if (resp && resp.data) {
            setChannelActivity([...resp.data]);
          }
        })
        .catch((error) => console.error(error));
    }
  }, []);

  useEffect(() => {
    if (customerDetails?.customerId) {
      get(
        properties.APPOINTMENT_API + `/customer/${customerDetails.customerId}`
      )
        .then((resp) => {
          // console.log('appointment data == ', resp.data)
          setAppointmentList(resp?.data || []);
        })
        .catch((error) => console.error(error));


    }
  }, [customerDetails]);

  useEffect(() => {
    if (customerUuid && customerUuid !== "") {
      get(
        properties.ACCOUNT_DETAILS_API + "/get-accountid-list/" + customerUuid
      )
        .then((resp) => {
          if (resp && resp.data) {
            let acctData = [];
            let selIdx = 0;
            let loopCount = 0;
            setAccountCount(resp?.data?.length);
            //setAccountUuid(resp.data[0])
            for (let r of resp.data) {
              if (String(r.accountUuid) === String(accountUuid)) {
                selIdx = loopCount;
              }
              acctData.push({
                customerUuid: customerUuid,
                accountUuid: r.accountUuid,
                accountNo: r.accountNo,
              });
              loopCount++;
            }
            setAccountList(resp?.data);
            //console.log('accountUuid==',accountUuid)
            if (accountUuid && accountUuid !== null) {
              setSelectedAccount({
                customerUuid: customerUuid,
                accountUuid: accountUuid,
                accountNo: accountNo,
              });
            } else {
              setSelectedAccount({
                customerUuid: acctData[selIdx]?.customerUuid,
                accountUuid: acctData[selIdx]?.accountUuid,
                accountNo: acctData[selIdx]?.accountNo,
              });
            }
          } else {
            toast.error("Failed to fetch account ids data - " + resp.status);
          }
        }).catch((error) => console.error(error))
        .finally();
    }
  }, [newAccountAddded, props.location.state, refreshPage]);

  useEffect(() => {
    // if (newAccountAddded.isAccountAdded) {
    //     setAccOpenModal(false)
    // }

    if (customerUuid) {
      //&& selectedAccount?.accountUuid && selectedAccount?.customerUuid !== '' && selectedAccount?.accountUuid !== ''

      post(
        properties.ACCOUNT_DETAILS_API + "/get-account-list?limit=10&page=0",
        { customerUuid: customerUuid }
      ) //,
        .then((resp) => {
          if (resp && resp.data) {
            const accrowData = resp?.data?.rows?.[0];
            const acclistData = resp?.data?.rows;
            setAccountDetails(accrowData);
            setAccountList(acclistData);
            // setAccountNo(rowData.accountNo)
            post(
              properties.ACCOUNT_DETAILS_API +
              "/get-service-list?limit=10&page=0",
              { customerUuid: customerUuid }
            ).then((resp) => {
              if (resp && resp.data) {
                if (resp.data.length > 0) {
                  const svcList = [];
                  for (let s of resp.data) {
                    if (
                      searchInput &&
                      searchInput.serviceNo &&
                      Number(searchInput.serviceNo) === s.serviceNo
                    ) {
                      svcList.splice(0, 0, s);
                    } else {
                      svcList.push(s);
                    }
                  }
                  //setServiceIdsList(svcIdsList)

                  const acclist = [];
                  for (const a of acclistData) {
                    for (const s of svcList) {
                      if (s.accountUuid === a.accountUuid) {
                        acclist.push({
                          ...a,
                          ...s,
                        });
                      }
                    }
                  }
                  setServicesList(acclist);
                  if (accountNo !== selectedAccount.accountNo) {
                    // service = false
                    // account = false
                    setAccount(false);
                    setService(false);
                    setActiveService(svcList[0].serviceNo);
                  }
                }
              } else {
                toast.error(
                  "Failed to fetch account ids data - " + resp.status
                );
              }
            }).catch((error) => console.error(error));

            post(
              properties.ACCOUNT_DETAILS_API +
              "/get-expiry-service-list?limit=10&page=0",
              { customerUuid: customerUuid }
            ).then((resp) => {
              if (resp && resp.data) {
                if (resp.data.length > 0) {
                  setExpiryServicesList(resp.data);
                }
              }
            }).catch((error) => console.error(error));
          }
        }).catch((error) => {
          console.error(error)
        })
        .finally(() => { });
    }
  }, []);

  /* Commented As per new services   
       useEffect(() => {
           const sdf = async () => {
               if (serviceIdsList && serviceIdsList.length > 0) {
   
                   setActiveService(serviceIdsList[0].serviceId)
                   await fetchServiceDetails(serviceIdsList[0].serviceId, undefined);
               }
           }
           sdf();
       }, [serviceIdsList, refreshPage]);
       
       useEffect(() => {
           const sdf = async () => {
               if (refreshServiceList !== undefined && refreshServiceList !== null) {
                   
                   get(properties.SERVICES_LIST_API + '/' + selectedAccount.customerUuid + '?' + 'account-id=' + selectedAccount.accountUuid + '&service-id=' + refreshServiceList)
                       .then((resp) => {
                           if (resp && resp.data) {
                               if (resp.data.length === 1) {
                                   fetchServiceDetails(refreshServiceList, resp.data[0]);
                                   setRefreshServiceList(null)
                                   // setServicesList((prevState) => {
                                   //     const list = prevState.map((e) => {
                                   //         if (e.serviceId === refreshServiceList) {
                                   //             found = true
                                   //             return resp.data[0]
                                   //         } else {
                                   //             return e
                                   //         }
                                   //     })
                                   //     return list
                                   // })
                               }
                           } else {
                               toast.error("Failed to fetch account ids data - " + resp.status);
                           }
                       }).finally()
   
   
               }
           }
           sdf();
       }, [refreshServiceList, refreshPage]);
       */

  //useEffect forhtml user permissions
  useEffect(() => {
    let rolePermission = [];

    auth &&
      auth.permissions &&
      auth.permissions.filter(function (e) {
        let property = Object.keys(e);
        if (property[0] === "Users") {
          let value = Object.values(e);
          rolePermission = {
            ...rolePermission,
            users: Object.values(value[0]),
          };
        } else if (property[0] === "Attachment") {
          let value = Object.values(e);
          rolePermission = {
            ...rolePermission,
            attachment: Object.values(value[0]),
          };
        } else if (property[0] === "Account") {
          let value = Object.values(e);
          rolePermission = {
            ...rolePermission,
            account: Object.values(value[0]),
          };
        } else if (property[0] === "Service") {
          let value = Object.values(e);
          rolePermission = {
            ...rolePermission,
            service: Object.values(value[0]),
          };
        } else if (property[0] === "Complaint") {
          let value = Object.values(e);
          rolePermission = {
            ...rolePermission,
            complaint: Object.values(value[0]),
          };
        } else if (property[0] === "Inquiry") {
          let value = Object.values(e);
          rolePermission = {
            ...rolePermission,
            inquiry: Object.values(value[0]),
          };
        } else if (property[0] === "Customer") {
          let value = Object.values(e);
          rolePermission = {
            ...rolePermission,
            customer: Object.values(value[0]),
          };
        }
      });

    let attachmentAdd,
      userEdit,
      accountEdit,
      serviceAdd,
      complaintAdd,
      inquiryAdd,
      viewCust,
      editCust;
    rolePermission?.users &&
      rolePermission?.users.map((screen) => {
        if (screen?.screenName === "Edit User") {
          userEdit = screen?.accessType;
        }
      });
    rolePermission &&
      rolePermission?.attachment &&
      rolePermission?.attachment?.map((screen) => {
        if (screen?.screenName === "Add Attachment") {
          attachmentAdd = screen?.accessType;
        }
      });
    rolePermission &&
      rolePermission?.account &&
      rolePermission?.account.map((screen) => {
        if (screen?.screenName === "Edit Account") {
          accountEdit = screen?.accessType;
        }
      });
    rolePermission &&
      rolePermission?.service &&
      rolePermission?.service.map((screen) => {
        if (screen?.screenName === "Add Service") {
          serviceAdd = screen?.accessType;
        }
      });
    rolePermission &&
      rolePermission?.complaint &&
      rolePermission?.complaint.map((screen) => {
        if (screen?.screenName === "Add Complaint") {
          complaintAdd = screen?.accessType;
        }
      });
    rolePermission &&
      rolePermission?.inquiry &&
      rolePermission?.inquiry.map((screen) => {
        if (screen?.screenName === "Add Inquiry") {
          inquiryAdd = screen?.accessType;
        }
      });
    rolePermission &&
      rolePermission?.customer &&
      rolePermission?.customer.map((screen) => {
        if (screen?.screenName === "View Customer") {
          viewCust = screen?.accessType;
        } else if (screen?.screenName === "Edit Employee") {
          editCust = screen?.accessType;
        }
      });
    setUserPermission({
      editUser: userEdit,
      addAttachment: attachmentAdd,
      editAccount: accountEdit,
      addService: serviceAdd,
      addComplaint: complaintAdd,
      addInquiry: inquiryAdd,
      viewCustomer: viewCust,
      editCustomer: editCust
    });
  }, [auth]);

  // const handleLoadBalances = async (serviceId) => {
  //   if (serviceId !== undefined && serviceId !== null) {
  //     await fetchServiceDetails(serviceId, undefined);
  //   }
  // };

  const handlePageSelect = (pageNo) => {
    if (isOrderListOpen) {
      setOrderCurrentPage(pageNo)
    } else if (isInteractionListOpen) {
      setInteractionCurrentPage(pageNo)
    } else {
      setCurrentPage(pageNo);
    }
  };

  const handleSentimentPageSelect = (pageNo) => {
    setSentimentCurrentPage(pageNo)
  };

  const handlePageSelectAddress = (pageNo) => {
    setCurrentPageAddress(pageNo)
  }

  // useEffect(() => {
  //     if (newServiceAddded.isServicesAdded) {
  //         setServiceModal(false)
  //     }
  //     if (selectedAccount && selectedAccount.customerUuid && selectedAccount.accountUuid && selectedAccount.customerUuid !== '' && selectedAccount.accountUuid !== '') {

  //     }
  // }, [newServiceAddded, refreshServiceList]);

  // const fetchServiceDetails = async (serviceId, updatedPortalData) => {
  //   //commented by Alsaad forhtml demo.
  //   // const resp = await slowGet(properties.SERVICE_REALTIME_API + '/' + selectedAccount.customerUuid + '?' + 'account-id=' + selectedAccount.accountUuid + '&service-id=' + serviceId)
  //   // if (resp && resp.data) {
  //   //     updateAccountRealtimeDetails(resp)
  //   //     let found = false
  //   //     setServicesList((prevState) => {
  //   //         const list = prevState.map((e) => {
  //   //             if (e.serviceId === serviceId) {
  //   //                 found = true
  //   //                 if (updatedPortalData) {
  //   //                     updatedPortalData.realtime = resp.data
  //   //                     updatedPortalData.realtimeLoaded = true
  //   //                     return updatedPortalData
  //   //                 } else {
  //   //                     e.realtime = resp.data
  //   //                     e.realtimeLoaded = true
  //   //                     return e
  //   //                 }
  //   //             } else {
  //   //                 return e
  //   //             }
  //   //         })
  //   //         return list
  //   //     })
  //   // } else {
  //   //     toast.error("Failed to fetch account ids data - " + resp.status);
  //   // }
  // };

  // const updateAccountRealtimeDetails = (resp) => {
  //   if (
  //     accountRealtimeDetails.filled === undefined ||
  //     !accountRealtimeDetails.filled
  //   ) {
  //     if (resp.data) {
  //       let firstService = resp.data;
  //       let realtimeData = {};
  //       if (firstService.accountBalance !== undefined) {
  //         realtimeData.accountBalance = firstService.accountBalance;
  //       }
  //       if (firstService.lastPayment !== undefined) {
  //         realtimeData.lastPayment = firstService.lastPayment;
  //       }
  //       if (firstService.lastPaymentDate) {
  //         realtimeData.lastPaymentDate = firstService.lastPaymentDate;
  //       }
  //       if (firstService.accountCreationDate) {
  //         realtimeData.accountCreationDate = firstService.accountCreationDate;
  //       }
  //       if (firstService.billCycle) {
  //         realtimeData.billCycle = firstService.billCycle;
  //       }
  //       if (firstService.billingDetails) {
  //         realtimeData.billingDetails = firstService.billingDetails;
  //       }

  //       realtimeData.serviceType = firstService.serviceType;
  //       realtimeData.filled = true;
  //       setAccountRealtimeDetails(realtimeData);
  //     }
  //   }
  // };

  const handleCellRender = (cell, row) => {
    // if (cell.column.Header === "Campaign Name") {
    //     return (<span className="text-primary cursor-pointer" onClick={(e) => handleCellLinkClick(e, row.original)}>{cell.value}</span>)
    // }
    // else if (['Valid From', 'Valid To'].includes(cell.column.Header)) {
    //     return (<span>{formatISODateDDMMMYY(cell.value)}</span>)
    // }
    // else if (cell.column.Header === "Created At") {
    //     return (<span>{formatISODateTime(cell.value)}</span>)
    // }
    // else {
    //     return (<span>{cell.value}</span>)
    // }

    if (cell.column.Header === "Created At") {
      return (<span>{cell.value ? moment(cell.value).format('DD-MM-YYYY') : '-'}</span>)
    } else {
      return <span>{cell.value}</span>
    }
  };

  // const handleAccountSelect = (evnt, e) => {
  //   // console.log('Handle select e is ', e)
  //   setAccountUuid(e?.accountUuid);
  //   setSelectedAccount({
  //     customerUuid: e?.customerUuid,
  //     accountUuid: e?.accountUuid,
  //     accountNo: e?.accountNo,
  //   });
  //   // setAccountNo(e?.accountNo)
  //   pageRefresh();
  // };

  // const handleServicePopupOpen = (evnt, idx) => {
  //   setServiceModal({ state: true });
  //   setSelectedService({ idx: idx });
  // };

  // const handleServicePopupClose = () => {
  //   setServiceModal({ state: false });
  // };

  useEffect(() => {
    if (serviceStatus !== "PENDING") {
      setButtonDisable(false);
    } else {
      setButtonDisable(true);
    }
  }, [activeService]);

  useEffect(() => {
    if (selectedAccount?.accountUuid) {
      post(
        properties.ACCOUNT_DETAILS_API + "/get-service-list?limit=10&page=0",
        {
          customerUuid: customerUuid,
          accountUuid: selectedAccount?.accountUuid,
        }
      )
        .then((response) => {
          if (response.data) {
            // console.log(response.data)
            let { productDetails } = response.data;
            let serviceNo = sessionStorage.getItem("serviceNo")
              ? Number(sessionStorage.getItem("serviceNo"))
              : null;
            let selectedService = false;
            if (activeService === "") {
              if (!!productDetails?.length) {
                productDetails.map((product) => {
                  if (Number(product.serviceNo) === serviceNo) {
                    selectedService = true;
                    setActiveService(product.serviceNo);
                  }
                });
              }
              if (selectedService === false) {
                if (!!productDetails?.length) {
                  setActiveService(
                    productDetails && productDetails[0]?.productUuid
                  );
                }
              }
            }
            productDetails = productDetails ? productDetails : [];
            // console.log(productDetails)
            unstable_batchedUpdates(() => {
              setProductList(productDetails);
            });
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally();
    }
  }, [pageRefreshHandlers.serviceRefresh, refreshPage, selectedAccount]);

  const handleOnManageService = (serviceObject) => {
    // console.log("manageServiceRef is set here");
    manageServiceRef.current = serviceObject;
    setIsManageServicesOpen(true);
  };

  const handleAddProduct = (product) => {
    // console.log(product, "============> handleAddProduct handleAddProduct");
    setSelectedProductList([...selectedProductList, product]);
    let totalRc = 0;
    let totalNrc = 0;
    const list = [...selectedProductList, product];
    list.forEach((y) => {
      totalRc = totalRc + Number(y?.totalRc || 0);
      totalNrc = totalNrc + Number(y?.totalNrc || 0);
    });
    setServiceData({ ...serviceData, totalRc, totalNrc });
  };

  const handleDeleteProduct = (product) => {
    setSelectedProductList(
      selectedProductList.filter(
        (x) => Number(x?.productId) !== Number(product?.productId)
      )
    );
    let totalRc = 0;
    let totalNrc = 0;
    selectedProductList
      .filter((x) => Number(x?.productId) !== Number(product?.productId))
      .forEach((y) => {
        totalRc = totalRc + Number(y?.totalRc || 0);
        totalNrc = totalNrc + Number(y?.totalNrc || 0);
      });
    setServiceData({ ...serviceData, totalRc, totalNrc });
  };

  const fetchProductList = (serviceType) => {
    // console.log("serviceType", serviceType);

    get(properties.PRODUCT_API + "?serviceType=" + serviceType?.code)
      .then((response) => {
        if (response.data) {
          const list = response?.data;
          let totalRc = 0;
          let totalNrc = 0;
          list.map((x) => {
            if (x?.productChargesList && x?.productChargesList.length > 0) {
              x?.productChargesList.forEach((y) => {
                if (y?.chargeDetails?.chargeCat === "CC_RC") {
                  totalRc = totalRc + Number(y?.chargeAmount || 0);
                } else if (y?.chargeDetails?.chargeCat === "NCC_RC") {
                  totalNrc = totalNrc + Number(y?.chargeAmount || 0);
                }
              });
            }
            x.totalRc = totalRc;
            x.totalNrc = totalNrc;
            x.serviceTypeDescription = serviceType?.description;
          });
          setProductList(list);
          // console.log("response.data", response.data);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
  };

  const getContactDetail = (contacts) => {
    if (contacts && contacts.length) {
      let primaryContact = contacts.find((x) => x.isPrimary);
      primaryContact = primaryContact ? primaryContact : contacts[0];
      return `+${primaryContact.mobilePrefix} ${primaryContact.mobileNo}`;
    }
  };

  function handlePrintClick() {
    setIsPrint(true);
    setTimeout(() => {
      // window.print();
      handlePrint()
      //  setIsPrint(false); // set the state variable back to false after printing
      // setAccountDetailsData(accountDetailsData);
    }, 400);
  }

  const fetchInteractionDetail = (intxnNo) => {
    get(`${properties.INTERACTION_API}/search?q=${intxnNo}`).then((resp) => {
      if (resp.status === 200) {
        const response = resp.data?.[0];
        const data = {
          ...response,
          sourceName: 'customer360'
        }
        if (response.customerUuid) {
          sessionStorage.setItem("customerUuid", response.customerUuid)
          sessionStorage.setItem("customerIds", response.customerId)
        }
        history.push(`${process.env.REACT_APP_BASE}/interaction360`, { data })
      } else {
        //
      }
    }).catch(error => {
      console.error(error);
    });
  }

  const getInteractionList = useCallback(() => {
    post(`${properties.INTERACTION_API}/search?limit=${interactionPerPage}&page=${interactionCurrentPage}`, { searchParams: { customerUuid } })
      .then((resp) => {
        unstable_batchedUpdates(() => {
          setInteractionList(resp.data);
          setInteractionData(resp.data?.rows);
        })
      })
      .catch((error) => console.error(error))
      .finally();
  }, [interactionPerPage, interactionCurrentPage, customerUuid])

  const getOrderList = useCallback(() => {
    post(
      `${properties.ORDER_API}/search?limit=${orderPerpage}&page=${orderCurrentPage}`, { searchParams: { customerId: customerIds } })
      .then((resp) => {
        if (resp?.status === 200) {
          const response = resp?.data && Array.isArray(resp?.data) ? { count: 0, rows: [] } : resp?.data
          setOrderList(response);
        }
      }).catch((error) => console.error(error))
      .finally();
  }, [orderPerpage, orderCurrentPage, customerIds])

  const getFollowUpList = useCallback(() => {
    get(`${properties.CUSTOMER_API}/followup/${customerUuid}?limit=${followUpPerpage}&page=${followUpCurrentPage}`)
      .then((resp) => {
        unstable_batchedUpdates(() => {
          setFollowupList(resp?.data)
        })
      })
      .catch((error) => console.error(error))
      .finally();
  }, [followUpCurrentPage, followUpPerpage, customerUuid])

  useEffect(() => {
    if (customerUuid && customerUuid !== "") {
      getInteractionList()
    }
  }, [interactionPerPage, interactionCurrentPage, customerUuid, getInteractionList])

  useEffect(() => {
    if (customerUuid && customerUuid !== "") {
      getOrderList()
    }
  }, [orderPerpage, orderCurrentPage, customerUuid, getOrderList])

  useEffect(() => {
    if (customerUuid && customerUuid !== "") {
      getFollowUpList()
    }
  }, [followUpCurrentPage, followUpPerpage, customerUuid, getFollowUpList])

  return (
    <>
      {/* <button onClick={() => setRunTour(true)}>Start Tour</button> */}
      <div className="cnt-wrapper skel-print-hide">
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
                    <span style={{ color: '#000' }}
                      data-toggle="modal"
                      data-target="#skel-view-modal-interactions"
                      onClick={() => {
                        setIsInteractionListOpen(true);
                        setInteractionStatusType("ALL");
                      }}
                    >
                      {interactionList?.count || 0}
                    </span>
                  </span>
                </div>}
                {modulePermission?.includes(moduleConfig?.order) &&
                  <div className="skel-tot">
                    Total Order Count
                    <span>
                      <span style={{ color: '#000' }}
                        data-toggle="modal"
                        data-target="#skel-view-modal-interactions"
                        onClick={() => {
                          setIsOrderListOpen(true);
                        }}
                      >
                        {orderList?.count || 0}
                      </span>
                    </span>
                  </div>
                }
                <div className="skel-tot">
                  Total Followups
                  <span>
                    <span style={{ color: '#000' }}
                      data-toggle="modal"
                      data-target="#skel-view-modal-interactions"
                      onClick={() => {
                        setIsFolloupListOpen(true)
                        //setIsInteractionListOpen(true);
                        //  setInteractionStatusType("ALL");
                      }}
                    >
                      {followUpList?.count || 0}
                    </span>
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
                            modulePermission: modulePermission,
                            userPermission: userPermission
                          }}
                          handler={{ setCustomerDetails, pageRefresh, handlePrintClick }}
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
                      {props?.appsConfig?.clientFacingName?.customer} Sentiments
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
              <div className="form-row d-flex-wrap">
                <div className='f-wrap-child'>
                  <div className="col-lg-12 col-md-12 col-xs-12">
                  <div className="skel-view-base-card">
                    <div className="skel-inter-statement">
                      <span className="skel-profile-heading">
                        Interaction Details({interactionList?.count || 0}){" "}
                        <span
                          className="skel-badge badge-yellow"
                          onClick={() => {
                            history.push(
                              `${process.env.REACT_APP_BASE}/create-interaction`,
                              { data: customerDetails }
                            );
                          }}
                        >
                          <a>+</a>
                        </span>
                      </span>
                      <div className="skel-cust-view-det">
                        {interactionData ?
                          <>{
                            interactionData.map((val, idx) => (
                              <>
                                <div
                                  key={idx}
                                  className="skel-inter-hist"
                                  onClick={() => {
                                    handleInteractionModal(val);
                                  }}
                                >
                                  <div className="skel-serv-sect-lft">
                                    <span
                                      className="skel-lbl-flds"
                                      data-toggle="modal"
                                      data-target="#skel-view-modal-accountdetails"
                                      // style={{ color: "#1675e0" }}
                                    >
                                      ID: {val.intxnNo}
                                    </span>
                                    <span className="mt-1">{val.problemCause}</span>
                                    <span className="skel-cr-date">
                                      Created On: {val?.createdAt ? moment(val.createdAt).format('DD-MM-YYYY') : '-'}
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
                            ))
                          }
                          </> :
                          <span className="skel-widget-warning">
                            No Interaction Found!!!
                          </span>
                        }
                      </div>
                      {/* <a className="skel-a-lnk" data-target="#skel-view-modal-inter" data-toggle="modal">View All Interactions</a> */}
                    </div>
                  </div>
                  </div>
                </div>
                {modulePermission?.includes(moduleConfig?.order) &&
                  <div className='f-wrap-child'>
                    <div className="col-lg-12 col-md-12 col-xs-12">
                      <div className="skel-view-base-card">
                        <span className="skel-profile-heading">
                          Order Details({orderList?.count}){" "}
                          <span className="skel-badge badge-blue" onClick={() => {
                            //setOpenAddServiceModal(true)
                            if (modulePermission?.includes(moduleConfig?.order)) {
                              history.push(
                                `${process.env.REACT_APP_BASE}/new-customer`,
                                {
                                  data: {
                                    customerDetails,
                                    pageIndex: 2,
                                    edit: true,
                                  },
                                }
                              )
                            } else {
                              toast.error(t("order_module_permision"))
                            }
                          }}>
                            <span
                              data-toggle="modal"
                              data-target="#skel-view-modal-interactions"
                            >
                              +
                            </span>
                          </span>
                        </span>
                        <div className="skel-cust-view-det">
                          {orderList.count > 0 ?
                            <>
                              {orderList?.rows?.map((val, idx) => (
                                <div
                                  key={idx}
                                  className="skel-inter-hist"
                                  onClick={() => {
                                    hanldeOpenOrderModal(val);
                                  }}
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
                              No order Found!!!
                            </span>
                          }
                        </div>
                        {/* <a className="skel-a-lnk" data-target="#skel-view-modal-inter" data-toggle="modal">View All Orders</a> */}
                      </div>
                    </div>
                  </div>
                }
                {modulePermission?.includes(moduleConfig?.service) &&
                  <div className='f-wrap-child'>
                    <div className="col-lg-12 col-md-12 col-xs-12">
                      <div className="skel-view-base-card">
                        <span className="skel-profile-heading">
                          Service Details({servicesList?.length || 0}){" "}
                          <span
                            className="skel-badge badge-marron"
                            onClick={() => {
                              //setOpenAddServiceModal(true)
                              if (modulePermission?.includes(moduleConfig?.order)) {
                                history.push(
                                  `${process.env.REACT_APP_BASE}/new-customer`,
                                  {
                                    data: {
                                      customerDetails,
                                      pageIndex: 2,
                                      edit: true,
                                    },
                                  }
                                )
                              } else {
                                toast.error(t("service_module_permision"))
                              }
                            }}
                          >
                            <span>+</span>
                          </span>
                        </span>
                        <div className="skel-cust-view-det">
                          {servicesList ? <>
                            {
                              servicesList.map((val, idx) => (
                                <div
                                  key={idx}
                                  className="skel-inter-hist"
                                  onClick={() => handleOnManageService(val)}
                                >
                                  <div className="skel-serv-sect-lft">
                                    <span
                                      className="skel-lbl-flds"
                                      data-toggle="modal"
                                      data-target="#skel-view-modal-accountdetails"
                                    >
                                      {val?.serviceNo}
                                      {/* {val?.accountNo} */}
                                    </span>
                                    <span>
                                      {/* {val?.serviceNo}:-{" "} */}
                                      {val?.accountNo}:-{" "} 
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
                              ))
                            }</>
                            : <span className="skel-widget-warning">
                              No Service Found!!!
                            </span>
                          }
                        </div>
                        {/* <a className="skel-a-lnk" data-toggle="modal" data-target="#skel-view-modal-accountdetails">View All Services</a> */}
                      </div>
                    </div>
                  </div>
                  }
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
              <div className="form-row d-flex-wrap">
                {modulePermission?.includes(moduleConfig?.appointment) &&
                  <div className='f-wrap-child f-flex-grow'>
                    <div className="col-lg-12 col-md-12 col-xs-12">
                      <div className="skel-view-base-card">
                        <span className="skel-profile-heading">
                          Appointment Details{" "}
                          <span className="skel-badge badge-green">
                            <span data-toggle="modal"
                              data-target="#skel-view-modal-appointment">
                              {appointmentList?.length}
                            </span>
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
                                  <span>
                                    {getContactDetail(
                                      appointment?.appointmentCustomer
                                        ?.customerContact
                                    )}
                                  </span>
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
                                          <a href={appointment.appointModeValue} target="_blank">Click here</a>
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
                    </div>
                  </div>
                }
                <div className='f-wrap-child'>
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
              </div>
              <div className="tab-scroller mt-2">
                <div className="container-fluid" id="list-wrapper">
                  <div className="wrapper1">
                    <ul
                      className="nav nav-tabs skel-tabs list"
                      id="list"
                      role="tablist"
                    >
                      <li className="nav-item">
                        {modulePermission?.includes(moduleConfig?.customer) && <a className={`nav-link  ${tabType === "customerHistory" ? "active" : ""}`}
                          id="CUSTHIST-tab"
                          data-toggle="tab"
                          href="#CUSTHIST"
                          role="tab"
                          aria-controls="CUSTHIST"
                          aria-selected="true"
                          onClick={(evnt) => { handleTypeSelect("customerHistory"); getCustomerHistoryData('customerHistory') }}>
                          Customer History
                        </a>}
                      </li>
                      <li className="nav-item">
                        {modulePermission?.includes(moduleConfig?.customer) && <a
                          className={`nav-link  ${tabType === "addressHistory" ? "active" : ""
                            }`}
                          id="ADDRHIST-tab"
                          data-toggle="tab"
                          href="#ADDRHIST"
                          role="tab"
                          aria-controls="ADDRHIST"
                          aria-selected="true"
                          onClick={(evnt) => { handleTypeSelect("addressHistory"); getCustomerHistoryData('addressHistory') }}
                        >
                          Address History
                        </a>}
                      </li>
                      <li className="nav-item">
                        {modulePermission?.includes(moduleConfig?.billing) && <a
                          className={`nav-link  ${tabType === "monthlyBilled" ? "active" : ""
                            }`}
                          id="BC-tab"
                          data-toggle="tab"
                          href="#BC"
                          role="tab"
                          aria-controls="BC"
                          aria-selected="true"
                          onClick={() => handleTypeSelect("monthlyBilled")}
                        >
                          Billed Contract
                        </a>}
                      </li>
                      <li className="nav-item">
                        {modulePermission?.includes(moduleConfig?.contract) && <a
                          className={`nav-link  ${tabType === "unbilled" ? "active" : ""
                            }`}
                          id="UBC-tab"
                          data-toggle="tab"
                          href="#UBC"
                          role="tab"
                          aria-controls="UBC"
                          aria-selected="false"
                          onClick={(evnt) => handleTypeSelect("unbilled")}
                        >
                          UnBilled Contract
                        </a>}
                      </li>
                      <li className="nav-item">
                        {modulePermission?.includes(moduleConfig?.billing) && <a
                          className={`nav-link  ${tabType === "history" ? "active" : ""
                            }`}
                          id="CH-tab"
                          data-toggle="tab"
                          href="#CH"
                          role="tab"
                          aria-controls="CH"
                          aria-selected="false"
                          onClick={(evnt) => handleTypeSelect("history")}
                        >
                          Billing Scheduled
                        </a>}
                      </li>
                      <li className="nav-item">
                        {modulePermission?.includes(moduleConfig?.invoice) && <a
                          className={`nav-link  ${tabType === "Invoice" ? "active" : ""
                            }`}
                          id="invoice-tab"
                          data-toggle="tab"
                          href="#invoice"
                          role="tab"
                          aria-controls="invoice"
                          aria-selected="false"
                          onClick={(evnt) => handleTypeSelect("Invoice")}
                        >
                          Invoice
                        </a>}
                      </li>
                      <li className="nav-item">
                        {modulePermission?.includes(moduleConfig?.interaction) && <a
                          className={`nav-link  ${tabType === "interaction" ? "active" : ""
                            }`}
                          id="interaction-tab"
                          data-toggle="tab"
                          href="#interaction"
                          role="tab"
                          aria-controls="interaction"
                          aria-selected="false"
                          onClick={(evnt) => handleTypeSelect("interaction")}
                        >
                          Interaction
                        </a>}
                      </li>
                      <li className="nav-item">
                        {modulePermission?.includes(moduleConfig?.order) && <a
                          className={`nav-link  ${tabType === "order" ? "active" : ""
                            }`}
                          id="order-tab"
                          data-toggle="tab"
                          href="#order"
                          role="tab"
                          aria-controls="order"
                          aria-selected="false"
                          onClick={(evnt) => handleTypeSelect("order")}
                        >
                          Order
                        </a>}
                      </li>
                      <li className="nav-item">
                        {modulePermission?.includes(moduleConfig?.helpdesk) && <a
                          className={`nav-link  ${tabType === "helpdesk" ? "active" : ""
                            }`}
                          id="helpdesk-tab"
                          data-toggle="tab"
                          href="#helpdesk"
                          role="tab"
                          aria-controls="helpdesk"
                          aria-selected="false"
                          onClick={(evnt) => handleTypeSelect("helpdesk")}
                        >
                          Help Desk
                        </a>}
                      </li>
                      <li className="nav-item">
                        {modulePermission?.includes(moduleConfig?.payment) && <a
                          className={`nav-link  ${tabType === "payment" ? "active" : ""
                            }`}
                          id="payment-tab"
                          data-toggle="tab"
                          href="#paymenthistory"
                          role="tab"
                          aria-controls="payment"
                          aria-selected="true"
                          onClick={(evnt) => handleTypeSelect("payment")}
                        >
                          Payment Scheduled
                        </a>}
                      </li>
                      <li className="nav-item">
                        {modulePermission?.includes(moduleConfig?.payment) && <a
                          className={`nav-link  ${tabType === "paymentHistory" ? "active" : ""
                            }`}
                          id="payment-tab-history"
                          data-toggle="tab"
                          href="#paymenttabhistory"
                          role="tab"
                          aria-controls="payment"
                          aria-selected="true"
                          onClick={(evnt) => handleTypeSelect("paymentHistory")}
                        >
                          Payment History
                        </a>}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="tab-scroller mt-2">
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
                              columnFilter={true}
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
                              columnFilter={true}
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
                      className={`tab-pane fade ${tabType === "monthlyBilled" ? "show active" : ""
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
                                //   billRefNo: selectedAccount?.accountNo,
                                customerUuid,
                              },
                              hideForm: true,
                              contractType: tabType,
                              // contractType: "billed",
                              refresh: pageRefreshHandlers.contractInvoicePaymentRefresh,
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
                                //   billRefNo: selectedAccount?.accountNo,
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
                                //     billRefNo: selectedAccount?.accountNo,
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
                                customerDetails,
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
                      className={`tab-pane fade ${tabType === "paymentHistory" ? "show active" : ""
                        }`}
                      id="paymenttabhistory"
                      role="tabpanel"
                      aria-labelledby="payment-tab-history"
                    >
                      <div className="cmmn-container-base no-brd">
                        {
                          <PaymentHistory
                            data={{
                              accountData: { customerUuid },
                              refresh: refreshPage
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
              </div>
            </div>
          </div>
        </div>
        {
          <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={openAddServiceModal} contentLabel="Search Modal" onHide={handleOnModelClose}  dialogClassName='cust-lg-modal'
          >
            <Modal.Header>
              <Modal.Title>
                <h5 className="modal-title">Add Service</h5>
              </Modal.Title>
              <CloseButton onClick={handleOnModelClose} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                <span>×</span>
              </CloseButton>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <CustomerServiceForm
                  data={{
                    serviceTypeLookup,
                    serviceData,
                    productList,
                    selectedProductList,
                  }}
                  handler={{
                    setServiceData,
                    fetchProductList,
                    handleAddProduct,
                    handleDeleteProduct,
                  }}
                />
                {/* <button
                type="button"
                className="close"
                onClick={handleOnModelClose}
              >
                <span aria-hidden="true">&times;</span>
              </button> */}
              </div>
            </Modal.Body>
            <Modal.Footer style={{ display: 'block' }}>
              <div className="skel-btn-center-cmmn">
                <button type="button" className="skel-btn-cancel" onClick={handleOnModelClose}>Close</button>
              </div>
            </Modal.Footer>
          </Modal>
        }
        {
          <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={openInteractionModal} onHide={handleOnModelClose} dialogClassName='cust-lg-modal' >
            {/* <div className="row">
              <div
                className=""
                style={{ width: "100%" }}
                id="skel-view-modal-inter"
                tabIndex="-1"
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header px-4 border-bottom-0 d-block">
                      <h5 className="modal-title">
                        Details for Interaction Number{" "}
                        {interactionModalData?.intxnNo}
                      </h5>
                      <a style={{ cursor: 'pointer', color: "#1675e0" }}
                        onClick={() => fetchInteractionDetail(interactionModalData?.intxnNo)}
                      >
                        Go to Interaction 360 View
                      </a>

                      <button
                        type="button"
                        className="close"
                        onClick={handleOnModelClose}
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div> */}
            <Modal.Header>
              <Modal.Title>
                <h5 className="modal-title">Details for Interaction Number  {interactionModalData?.intxnNo}</h5>
                <a style={{ cursor: 'pointer', color: "#1675e0" }}
                  onClick={() => fetchInteractionDetail(interactionModalData?.intxnNo)}
                >Go to Interaction 360 View</a>
              </Modal.Title>
              <CloseButton onClick={handleOnModelClose} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                <span>×</span>
              </CloseButton>
            </Modal.Header>
            <Modal.Body>
              <div className="modal-body px-4">
                <form>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label
                          htmlFor="Statement"
                          className="control-label"
                        >
                          Statement
                        </label>
                        <span className="data-cnt">
                          {interactionModalData?.requestStatement}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label
                          htmlFor="Interactiontype"
                          className="control-label"
                        >
                          Interaction Category
                        </label>
                        <span className="data-cnt">
                          {interactionModalData?.intxnCategory?.description}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label
                          htmlFor="Interactiontype"
                          className="control-label"
                        >
                          Interaction Type
                        </label>
                        <span className="data-cnt">
                          {interactionModalData?.intxnType?.description}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label
                          htmlFor="Servicetype"
                          className="control-label"
                        >
                          Service Category
                        </label>
                        <span className="data-cnt">
                          {
                            interactionModalData?.serviceCategory
                              ?.description
                          }
                        </span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label
                          htmlFor="Servicetype"
                          className="control-label"
                        >
                          Service type
                        </label>
                        <span className="data-cnt">
                          {interactionModalData?.serviceType?.description}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="Channel" className="control-label">
                          Channel
                        </label>
                        <span className="data-cnt">
                          {interactionModalData?.intxnChannel?.description}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    {/* <div className="col-md-4">
                      <div className="form-group">
                        <label
                          htmlFor="Problemstatement"
                          className="control-label"
                        >
                          Problem Statement
                        </label>
                        <span className="data-cnt">
                          {interactionModalData?.intxnDescription}
                        </span>
                      </div>
                    </div> */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="Priority" className="control-label">
                          Priority
                        </label>
                        <span className="data-cnt">
                          {interactionModalData?.intxnPriority?.description}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group uploader">
                        <label
                          htmlFor="Contactpreferenece"
                          className="control-label"
                        >
                          Attachment
                        </label>
                        <div className="attachment-details">
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </Modal.Body>
            {/*                     
                  </div>
                </div>
              </div>
            </div> */}
          </Modal>
        }
        {
          <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={openOrderModal} onHide={handleOnModelClose} dialogClassName='cust-lg-modal' >
            {/* <div className="row">
              <div
                className=""
                style={{ width: "100%" }}
                id="skel-view-modal-inter"
                tabIndex="-1"
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header px-4 border-bottom-0 d-block">
                      <h5 className="modal-title">
                        Details for Order Number {orderModalData?.orderNo}
                      </h5>
                      <Link
                        to={{
                          pathname: `${process.env.REACT_APP_BASE}/order360`,
                          state: {
                            data: { orderNo: orderModalData?.orderNo, customerUid: orderModalData?.customerDetails?.customerUuid },
                          }
                        }}
                      >
                        Go to Order 360 View
                      </Link>
                      <button
                        type="button"
                        className="close"
                        onClick={handleOnModelClose}
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div> */}
            <Modal.Header>
              <Modal.Title>
                <h5 className="modal-title">Details for Order Number {orderModalData?.orderNo}</h5>
                <Link to={{
                  pathname: `${process.env.REACT_APP_BASE}/order360`,
                  state: {
                    data: {
                      orderNo: orderModalData?.orderNo,
                      customerUid: orderModalData?.customerDetails?.customerUuid
                    },
                  }
                }}>Go to Order 360 View</Link>
              </Modal.Title>
              <CloseButton onClick={handleOnModelClose} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                <span>×</span>
              </CloseButton>
            </Modal.Header>
            <Modal.Body>
              {orderModalData?.childOrder.map((val, i) => (
                <div
                  key={i}
                  className="skel-view-base-card modal-body px-4"
                >
                  <form>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="Statement" className="control-label">
                            Order Details
                          </label>
                          <span className="data-cnt">
                            {val?.orderDescription}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="Statement" className="control-label">
                            Child Order No
                          </label>
                          <span className="data-cnt">
                            {val.orderNo}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="Interactiontype"
                            className="control-label"
                          >
                            Order Type
                          </label>
                          <span className="data-cnt">
                            {val?.orderType?.description}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="Servicetype"
                            className="control-label"
                          >
                            Service type
                          </label>
                          <span className="data-cnt">
                            {val?.serviceType?.description}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="Channel"
                            className="control-label"
                          >
                            Channel
                          </label>
                          <span className="data-cnt">
                            {val?.orderChannel?.description}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="Channel"
                            className="control-label"
                          >
                            Order Family
                          </label>
                          <span className="data-cnt">
                            {val?.orderFamily?.description}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="Channel"
                            className="control-label"
                          >
                            Order Status
                          </label>
                          <span className="data-cnt">
                            {val?.orderStatus?.description}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="Problemstatement"
                            className="control-label"
                          >
                            Product Name
                          </label>
                          <span className="data-cnt">
                            {
                              val?.orderProductDetails[0]?.productDetails
                                ?.productName
                            }
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="Problemstatement"
                            className="control-label"
                          >
                            Product Family
                          </label>
                          <span className="data-cnt">
                            {
                              val?.orderProductDetails[0]?.productDetails
                                ?.productFamily?.description
                            }
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="Problemstatement"
                            className="control-label"
                          >
                            Product Categry
                          </label>
                          <span className="data-cnt">
                            {
                              val?.orderProductDetails[0]?.productDetails
                                ?.productCategory?.description
                            }
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="Problemstatement"
                            className="control-label"
                          >
                            Product Amount
                          </label>
                          <span className="data-cnt">
                            {val?.orderProductDetails[0]?.billAmount}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="Priority"
                            className="control-label"
                          >
                            Priority
                          </label>
                          <span className="data-cnt">
                            {val?.orderPriority?.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

              ))}
            </Modal.Body>
            {/* </div>
                </div>
              </div>
            </div> */}
          </Modal>
        }
        {
          <Modal size="xl" aria-labelledby="contained-modal-title-vcenter" fullscreen show={isManageServicesOpen} onHide={() => setIsManageServicesOpen(false)} dialogClassName='modal-fullscreen-xl'  >
            <ManageService
              data={{
                isManageServicesOpen,
                manageServiceRef,
                selectedAccount,
                selectedService,
                productBenefitLookup
              }}
              handlers={{
                setIsManageServicesOpen,
                pageRefresh,
              }}
            />
          </Modal>
        }
        {
          <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isInteractionListOpen || isOrderListOpen || isFolloupListOpen} onHide={handleOnModelClose} dialogClassName='cust-lg-modal' >
            <Modal.Header>
              <Modal.Title>
                <h5 className="modal-title">
                  {isOrderListOpen ? 'Order' : isFolloupListOpen ? 'Follow up' : 'Interaction'} Details for {props?.appsConfig?.clientFacingName?.customer ?? 'Customer'} Number{" "}
                  {customerDetails?.customerNo}
                </h5>
              </Modal.Title>
              <CloseButton onClick={handleOnModelClose} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                <span>×</span>
              </CloseButton>
            </Modal.Header>
            <Modal.Body>
              <div className="col-lg-12 col-md-12 col-xs-12">
                <DynamicTable
                  row={isInteractionListOpen ? interactionData : isOrderListOpen ? orderList?.rows : isFolloupListOpen ? followUpList?.rows : []}
                  header={isInteractionListOpen ? interactionListColumns : isOrderListOpen ? orderListColumns : isFolloupListOpen ? followupListColumns : []}
                  itemsPerPage={isInteractionListOpen ? interactionPerPage : isOrderListOpen ? orderPerpage : isFolloupListOpen ? followUpPerpage : perPage}
                  backendPaging={true}
                  columnFilter={true}
                  backendCurrentPage={isInteractionListOpen ? interactionCurrentPage : isOrderListOpen ? orderCurrentPage : isFolloupListOpen ? followUpCurrentPage : currentPage}
                  rowCount={isInteractionListOpen ? interactionList.count : isOrderListOpen ? orderList?.count : isFolloupListOpen ? followUpList?.count : 0}
                  handler={{
                    handleCellRender: handleCellRender,
                    handlePageSelect: handlePageSelect,
                    handleItemPerPage: isInteractionListOpen ? setInteractionPerPage : isOrderListOpen ? setOrderPerpage : isFolloupListOpen ? setFollowupPerpage : setPerPage,
                    handleCurrentPage: isInteractionListOpen ? setInteractionCurrentPage : isOrderListOpen ? setOrderCurrentPage : isFolloupListOpen ? setFollowUpCurrentPage : setCurrentPage,
                  }}
                />
              </div>
            </Modal.Body>
            <Modal.Footer style={{ display: 'block' }}>
              <div className="skel-btn-center-cmmn">
                <button type="button" className="skel-btn-cancel" onClick={handleSentimentModelClose}>Close</button>
              </div>
            </Modal.Footer>
          </Modal>
        }
        {
          isPrint &&
          <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isPrint} dialogClassName='cust-lg-modal'>
            <CustomerViewPrint data={{
              customerDetails,
              accountCount,
              servicesList,
              interactionList,
              followUpList: followUpList,
              revenueDetails,
              sentimentChartData,
              channelActivity,
              interactionData,
              orderList: orderList?.rows,
              appointmentList,
              customerEmotions,
              customerDetailsList,
              customerAddressList,
              selectedAccount,
              modulePermission,
              moduleConfig
            }}
              handler={{
                handlePreviewCancel: false,
                handlePrint: false,
                setCustomerDetails
              }}
              ref={componentRef}
            />
          </Modal>
        }
        {
          <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isSetimentPopupOpen} onHide={handleSentimentModelClose} dialogClassName='cust-lg-modal'>
            <Modal.Header>
              <Modal.Title><h5 className="modal-title">Interaction Details for {props?.appsConfig?.clientFacingName?.customer ?? 'Customer'}  Number{" "}
                {customerDetails?.customerNo}</h5></Modal.Title>
              <CloseButton onClick={handleSentimentModelClose} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                <span>×</span>
              </CloseButton>
            </Modal.Header>
            <Modal.Body>
              <div className="col-lg-12 col-md-12 col-xs-12">
                <DynamicTable
                  row={sentimentFilterData}
                  header={sentimentColumns}
                  itemsPerPage={sentimentPerPage}
                  backendPaging={false}
                  columnFilter={true}
                  backendCurrentPage={sentimentCurrentPage}
                  handler={{
                    handleCellRender: handleCellRender,
                    handlePageSelect: handleSentimentPageSelect,
                    handleItemPerPage: setSentimentPerPage,
                    handleCurrentPage: setSentimentCurrentPage,
                  }}
                />
              </div>
            </Modal.Body>
            <Modal.Footer style={{ display: 'block' }}>
              <div className="skel-btn-center-cmmn">
                <button type="button" className="skel-btn-cancel" onClick={handleSentimentModelClose}>Close</button>
              </div>
            </Modal.Footer>
          </Modal>
        }
      </div>
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true} // Whether to restart the tour when it's completed
        showProgress={true} // Show progress indicator
        showSkipButton={true} // Show skip button
        callback={(data) => {
          // You can handle events like "tour finished" here
          if (data.status === 'finished') {
            setRunTour(false); // Stop the tour
          }
        }}
      />
    </>
  );
};

const sentimentColumns = [
  {
    Header: "#id",
    accessor: "id",
    disableFilters: true,
  },
  {
    Header: "Entity Type",
    accessor: "entityType",
    disableFilters: true,
  },
  {
    Header: "Type",
    accessor: "type",
    disableFilters: true,
  },
  {
    Header: "Status",
    accessor: "status",
    disableFilters: true,
  }, {
    Header: "Created At",
    accessor: "createdAt",
    disableFilters: true,
    id: "updatedBy"
  }
  // ,{
  //   Header: "Created By",
  //   accessor: "createdBy",
  //   disableFilters: true,
  //   id: "modifiedBy"
  // }
];

const interactionListColumns = [
  {
    Header: "Interaction No",
    accessor: "intxnNo",
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

const followupListColumns = [{
  Header: "#ID",
  accessor: "id",
  disableFilters: true
}, {
  Header: "Status",
  accessor: "status.description",
  disableFilters: true
}, {
  Header: "Service Category",
  accessor: "serviceCategory.description",
  disableFilters: true
}, {
  Header: "Type",
  accessor: "type.description",
  disableFilters: true
},
{
  Header: "Service Type",
  accessor: "serviceType.description",
  disableFilters: true
},
{
  Header: "remarks",
  accessor: "remarks",
  disableFilters: true
}, {
  Header: "Created At",
  accessor: "createdDate",
  disableFilters: true
}]

export default CustomerDetailsView;
