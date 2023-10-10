import React, { useState, useRef, useContext, useEffect } from 'react'
import { useTranslation } from "react-i18next";
import { Link, Element } from 'react-scroll'
import { Link as DomLink } from 'react-router-dom';
import { toast } from "react-toastify";
import Modal from 'react-modal'
import { get, post } from "../../common/util/restUtil";
import { properties } from "../../properties";

import { Tabs } from 'antd';
import Slider from "react-slick";
import { unstable_batchedUpdates } from 'react-dom';
import BestOffer from './BestOffers'
import { AppContext } from '../../AppContext';
import CustomerDetailsFormView from '../Customer/CustomerDetailsFormView';
import AccountDetailsFormView from '../AccountManagement/AccountDetailsFormView';
import BillableDetailsFormView from '../Customer/BillableDetailsFormView';
import ServiceListFormView from '../ServiceManagement/ServiceListFormView';
import ProgressBar from 'react-bootstrap/ProgressBar';
import DynamicTable from '../../common/table/DynamicTable';
import SearchInvoice from '../../InvoiceAndBilling/Invoice/SearchInvoice';
import SearchContract from '../../InvoiceAndBilling/Contract/SearchContract';
import InteractionList from '../../HelpdeskAndInteraction/Interaction/InteractionList'
import Interactions from './InteractionTabs/Interactions';
import Helpdesk from './InteractionTabs/Helpdesk';
import WorkOrders from './InteractionTabs/WorkOrders';
import Payment from './InteractionTabs/Payment';
import { isEmpty } from 'lodash'
let Limiter = require('async-limiter');
const { TabPane } = Tabs;
const settings = {
    dots: false,
    infinite: false,
    arrows: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    initialSlide: 0,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: true,
                dots: false
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                initialSlide: 2
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
};
const recentActivitySettings = {
    dots: false,
    infinite: true,
    arrows: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: false
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                initialSlide: 1
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
};
function Customer360(props) {
    const { appsConfig, screenName } = props;
    console.log('appsConfig---------->',appsConfig)
    // const [interactions, setInteractions] = useState([])
    const xx = ['a', 'b']
    console.log(sessionStorage.getItem("customerUuid"))
    console.log('Customer 360 props ==>', props?.location?.state?.data)
    const customerUuid = sessionStorage.getItem("customerUuid") || null
    const accountNo = sessionStorage.getItem("accountNo") ? Number(sessionStorage.getItem("accountNo")) : null

    const [customerDetails, setCustomerDetails] = useState(props?.location?.state?.data?.customerData)
    const [accountDetails, setAccountDetails] = useState(props?.location?.state?.data?.accountData)
    let [accountDetailsData, setAccountDetailsData] = useState([])
    const [servicesList, setServicesList] = useState(props?.location?.state?.data?.serviceDetails)

    const [isPrint, setIsPrint] = useState(false);
    const [servicesListData, setServicesListData] = useState([]);

    let limiter = new Limiter({ concurrency: 1 });
    let serviceCardRef = useRef(null)
    const refVoid = useRef(null)
    let serviceRef = useRef(null)
    let accountRef = useRef(null)
    const { auth } = useContext(AppContext)
    const { t } = useTranslation();
    const [contractType, setContractType] = useState('billed')
    const [refreshPage, setRefreshPage] = useState(true)
    const [searchInput, setSearchInput] = useState({})
    const [activeService, setActiveService] = useState("")
    const [accountUuidList, setAccountUuidList] = useState([])
    const [selectedAccount, setSelectedAccount] = useState({})
    const [accountRealtimeDetails, setAccountRealtimeDetails] = useState({})
    const [accountUuid, setAccountUuid] = useState()
    const [serviceIdsList, setServiceIdsList] = useState([])
    const [expiryServicesList, setExpiryServicesList] = useState([])
    const [servicesSummary, setServicesSummary] = useState([])
    const [serviceModal, setServiceModal] = useState({ state: false })
    const [selectedService, setSelectedService] = useState({ idx: -1 })
    const [catalogList, setProductList] = useState([]);
    const [isManageServicesOpen, setIsManageServicesOpen] = useState(false);
    const manageServiceRef = useRef();

    const [leftNavCounts, setLeftNavCounts] = useState({})
    const [leftNavCountsComplaint, setLeftNavCountsComplaint] = useState({})
    const [leftNavCountsInquiry, setLeftNavCountsInquiry] = useState({})
    const [leftNavWoCounts, setLeftNavWoCounts] = useState({})
    const [newAccountAddded, setNewAccountAdded] = useState({ isAccountAdded: false })
    const [newServiceAddded, setNewServiceAdded] = useState({ isServicesAdded: false })
    const [refreshServiceList, setRefreshServiceList] = useState(null)
    const [refreshServiceRequest, setRefreshServiceRequest] = useState(true)
    const [refreshComplaint, setRefreshComplaint] = useState(true)
    const [refreshInquiry, setRefreshInquiry] = useState(true)
    const [serviceStatus, setServiceStatus] = useState("")
    const [buttonDisable, setButtonDisable] = useState(true)
    const [openAccModal, setAccOpenModal] = useState(false)
    const [openServiceModal, setOpenServiceModal] = useState(false)
    const [openInteractionModal, setOpenInteractionModal] = useState(false)
    const [openBillHistoryModal, setOpenBillHistoryModal] = useState(false)
    const [billingDetails, setBillingDetails] = useState()
    const [accountCount, setAccountCount] = useState()
    const [userPermission, setUserPermission] = useState({
        addAttachment: false, editUser: false, editAccount: false, addService: false,
        addComplaint: false, addInquiry: false, viewCustomer: false
    })
    const [recentActivity, setRecentActivity] = useState([])

    const [service, setService] = useState(sessionStorage.getItem("service") === "true" ? true : false)
    const [account, setAccount] = useState(sessionStorage.getItem("account") === "true" ? true : false)

    const [pageRefreshHandlers, setPageRefreshHandlers] = useState({
        attachmentRefresh: true,
        customerRefresh: true,
        accountEditRefresh: true,
        serviceRefresh: true,
        contractInvoicePaymentRefresh: true
    })
    const [customerRefresh, setCustomerRefresh] = useState(true)
    const [tabType, setTabType] = useState('helpDesk')

    const handleContractTypeSelect = (contractType) => {
        setContractType(contractType)
    }

    const handleTypeSelect = (type) => {
        setTabType(type);
    }

    const handleCustomerRefresh = () => {
        setPageRefreshHandlers({
            ...pageRefreshHandlers,
            customerRefresh: !pageRefreshHandlers.customerRefresh
        })
    }

    const handleAccountRefresh = () => {
        setPageRefreshHandlers({
            ...pageRefreshHandlers,
            accountEditRefresh: !pageRefreshHandlers.accountEditRefresh
        })
    }

    const handleServiceRefresh = () => {
        setPageRefreshHandlers({
            ...pageRefreshHandlers,
            serviceRefresh: !pageRefreshHandlers.serviceRefresh
        })
        setRefreshServiceRequest(!refreshServiceRequest)
    }

    const handleContractInvoicePaymentRefresh = () => {
        setPageRefreshHandlers({
            ...pageRefreshHandlers,
            contractInvoicePaymentRefresh: !pageRefreshHandlers.contractInvoicePaymentRefresh
        })
    }

    const handleAttachmentRefresh = () => {
        setPageRefreshHandlers({
            ...pageRefreshHandlers,
            attachmentRefresh: !pageRefreshHandlers.attachmentRefresh
        })
    }

    const pageRefresh = () => {
        setRefreshPage(!refreshPage)
    }

    const customerRefreshDetails = () => {
        setCustomerRefresh(!customerRefresh)
    }

    const onClickScrollTo = () => {

        setTimeout(() => {

            if (Number(accountNo) === Number(selectedAccount.accountNo) && accountNo !== null && accountNo !== undefined && accountNo !== '') {
                if (accountRef && accountRef !== null && account === true) {
                    accountRef.current.scrollIntoView({ top: serviceCardRef.current.offsetTop, behavior: 'smooth', block: "start" })
                }
                if (searchInput.serviceId !== null && activeService !== null && activeService !== undefined && serviceCardRef !== null && serviceCardRef !== undefined && serviceCardRef !== '') {
                    if (searchInput.serviceId !== null && Number(searchInput.serviceId) === Number(activeService)) {
                        if (serviceCardRef && serviceCardRef !== null && service === true) {
                            serviceCardRef.current.scrollIntoView({ top: serviceCardRef.current.offsetTop, bottom: 10, behavior: 'smooth', block: "start" })
                            serviceRef.current.scrollIntoView({ top: serviceRef.current.offsetTop, behavior: 'smooth', block: "start" })
                        }

                    }
                }
            }
            else {
                setService(false)
                setAccount(false)
            }

        }, 5000)
    }

    function getAccountList(customerUuid) {
        // console.log('customerUuid===========================>', customerUuid)
        get(properties.ACCOUNT_DETAILS_API + '/get-accountid-list/' + customerUuid)
            .then((resp) => {
                if (resp && resp.data) {
                    let acctData = []
                    let selIdx = 0
                    let loopCount = 0
                    setAccountCount(resp?.data?.length)
                    //setAccountUuid(resp.data[0])
                    for (let r of resp.data) {
                        if (String(r.accountUuid) === String(accountUuid)) {
                            selIdx = loopCount
                        }

                        acctData.push({
                            customerUuid: customerUuid,
                            accountUuid: r.accountUuid,
                            accountNo: r.accountNo
                        })
                        loopCount++
                    }
                    setAccountUuidList(acctData)
                    if (accountUuid && accountUuid !== null) {
                        setSelectedAccount({
                            customerUuid: customerUuid,
                            accountUuid: accountUuid,
                            accountNo: accountNo
                        })
                    }
                    else {
                        setSelectedAccount({
                            customerUuid: !isEmpty(acctData[selIdx]) ? acctData[selIdx]?.customerUuid : '',
                            accountUuid: !isEmpty(acctData[selIdx]) ? acctData[selIdx]?.accountUuid : '',
                            accountNo: !isEmpty(acctData[selIdx]) ? acctData[selIdx]?.accountNo : '',
                        })
                    }
                } else {
                    toast.error("Failed to fetch account ids data - " + resp.status);
                }
            }).catch((error) => {
                console.log(error)
            }).finally();
    }

    useEffect(() => {
        console.log('inuseeff')
        console.log('customerDetails===', customerDetails)
        console.log('customerUuid==>', customerUuid)
        if (customerUuid && customerUuid !== '') {

            if (!customerDetails) {

                post(`${properties.CUSTOMER_API}/get-customer?limit=1&page=0`, { customerUuid })
                    .then((resp) => {
                        if (resp.data) {
                            if (resp.status === 200) {
                                const { rows } = resp.data;
                                unstable_batchedUpdates(() => {
                                    setCustomerDetails(rows[0]);
                                })
                                getAccountList(customerUuid)
                            }
                        }
                    }).catch((error) => {
                        console.error(error);
                    }).finally();
            }
            get(properties.CUSTOMER_API + '/recent-activities/' + customerUuid)
                .then((resp) => {
                    console.log(resp.data)
                    setRecentActivity(resp.data)
                }).catch((error) => {
                    console.log(error)
                }).finally()
        }
    }, [])

    useEffect(() => {

        if (customerUuid && customerUuid !== '') {


            getAccountList(customerUuid)

        }

    }, [newAccountAddded, props.location.state, refreshPage]);

    useEffect(() => {
        if (newAccountAddded.isAccountAdded) {
            setAccOpenModal(false)
        }

        if (selectedAccount && selectedAccount?.customerUuid && selectedAccount?.accountUuid && selectedAccount?.customerUuid !== '' && selectedAccount?.accountUuid !== '') {

            post(properties.ACCOUNT_DETAILS_API + '/get-account-list?limit=10&page=0', { customerUuid: customerUuid, accountUuid: selectedAccount?.accountUuid })//, 
                .then((resp) => {
                    if (resp && resp.data) {
                        console.log('get accounts ', resp.data)
                        const rowData = resp?.data?.rows[0];
                        setAccountDetails(rowData)
                        // setAccountNo(rowData.accountNo)
                        post(properties.ACCOUNT_DETAILS_API + '/get-service-list?limit=10&page=0', { customerUuid: customerUuid, accountUuid: selectedAccount?.accountUuid })
                            .then((resp) => {
                                if (resp && resp.data) {
                                    if (resp.data.length > 0) {
                                        const svcList = []
                                        for (let s of resp.data) {
                                            if (searchInput && searchInput.serviceNo && (Number(searchInput.serviceNo) === s.serviceNo)) {
                                                svcList.splice(0, 0, s)
                                            } else {
                                                svcList.push(s)
                                            }
                                        }
                                        console.log('svcList==', svcList)
                                        //setServiceIdsList(svcIdsList)
                                        setServicesList(svcList)
                                        if (accountNo !== selectedAccount.accountNo) {
                                            // service = false
                                            // account = false 
                                            setAccount(false)
                                            setService(false)
                                            setActiveService(svcList[0].serviceNo)
                                        }

                                    }
                                } else {
                                    toast.error("Failed to fetch account ids data - " + resp.status);
                                }
                            }).catch((error) => {
                                console.log(error)
                            })

                        post(properties.ACCOUNT_DETAILS_API + '/get-expiry-service-list?limit=10&page=0', { customerUuid: customerUuid, accountUuid: selectedAccount?.accountUuid })
                            .then((resp) => {
                                if (resp && resp.data) {
                                    if (resp.data.length > 0) {
                                        setExpiryServicesList(resp.data)

                                    }
                                }
                            }).catch((error) => {
                                console.log(error)
                            })

                    }
                }).catch((error) => {
                    console.log(error)
                }).finally(() => {

                });


        }
    }, [selectedAccount, pageRefreshHandlers.accountEditRefresh, refreshPage]);

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
        let rolePermission = []

        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)
            if (property[0] === "Users") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, users: Object.values(value[0]) }
            }
            else if (property[0] === "Attachment") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, attachment: Object.values(value[0]) }
            }
            else if (property[0] === "Account") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, account: Object.values(value[0]) }
            }
            else if (property[0] === "Service") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, service: Object.values(value[0]) }
            }
            else if (property[0] === "Complaint") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, complaint: Object.values(value[0]) }
            }
            else if (property[0] === "Inquiry") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, inquiry: Object.values(value[0]) }
            } else if (property[0] === "Customer") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, customer: Object.values(value[0]) }
            }
        })

        let attachmentAdd, userEdit, accountEdit, serviceAdd, complaintAdd, inquiryAdd, viewCust;
        rolePermission?.users?.map((screen) => {
            if (screen.screenName === "Edit User") {
                userEdit = screen.accessType
            }

        })
        rolePermission?.attachment?.map((screen) => {
            if (screen.screenName === "Add Attachment") {
                attachmentAdd = screen.accessType
            }

        })
        rolePermission?.account?.map((screen) => {
            if (screen.screenName === "Edit Account") {
                accountEdit = screen.accessType
            }

        })
        rolePermission?.service?.map((screen) => {
            if (screen.screenName === "Add Service") {
                serviceAdd = screen.accessType
            }

        })
        rolePermission?.complaint?.map((screen) => {
            if (screen.screenName === "Add Complaint") {
                complaintAdd = screen.accessType
            }

        })
        rolePermission?.inquiry?.map((screen) => {
            if (screen.screenName === "Add Inquiry") {
                inquiryAdd = screen.accessType
            }

        })
        rolePermission?.customer?.map((screen) => {
            if (screen.screenName === "View Customer") {
                viewCust = screen.accessType
            }

        })
        setUserPermission({ editUser: userEdit, addAttachment: attachmentAdd, editAccount: accountEdit, addService: serviceAdd, addComplaint: complaintAdd, addInquiry: inquiryAdd, viewCustomer: viewCust })


    }, [auth])

    const handleLoadBalances = async (serviceId) => {

        if (serviceId !== undefined && serviceId !== null) {
            await fetchServiceDetails(serviceId, undefined);
        }
    }

    // useEffect(() => {
    //     if (newServiceAddded.isServicesAdded) {
    //         setServiceModal(false)
    //     }
    //     if (selectedAccount && selectedAccount.customerUuid && selectedAccount.accountUuid && selectedAccount.customerUuid !== '' && selectedAccount.accountUuid !== '') {

    //     }
    // }, [newServiceAddded, refreshServiceList]);


    const fetchServiceDetails = async (serviceId, updatedPortalData) => {
        //commented by Alsaad forhtml demo.
        // const resp = await slowGet(properties.SERVICE_REALTIME_API + '/' + selectedAccount.customerUuid + '?' + 'account-id=' + selectedAccount.accountUuid + '&service-id=' + serviceId)

        // if (resp && resp.data) {
        //     updateAccountRealtimeDetails(resp)
        //     let found = false
        //     setServicesList((prevState) => {
        //         const list = prevState.map((e) => {
        //             if (e.serviceId === serviceId) {
        //                 found = true
        //                 if (updatedPortalData) {
        //                     updatedPortalData.realtime = resp.data
        //                     updatedPortalData.realtimeLoaded = true
        //                     return updatedPortalData
        //                 } else {
        //                     e.realtime = resp.data
        //                     e.realtimeLoaded = true
        //                     return e
        //                 }
        //             } else {
        //                 return e
        //             }
        //         })
        //         return list
        //     })
        // } else {
        //     toast.error("Failed to fetch account ids data - " + resp.status);
        // }

    }

    const updateAccountRealtimeDetails = (resp) => {
        if (accountRealtimeDetails.filled === undefined || !accountRealtimeDetails.filled) {
            if (resp.data) {
                let firstService = resp.data
                let realtimeData = {}
                if (firstService.accountBalance !== undefined) {
                    realtimeData.accountBalance = firstService.accountBalance
                }
                if (firstService.lastPayment !== undefined) {
                    realtimeData.lastPayment = firstService.lastPayment
                }
                if (firstService.lastPaymentDate) {
                    realtimeData.lastPaymentDate = firstService.lastPaymentDate
                }
                if (firstService.accountCreationDate) {
                    realtimeData.accountCreationDate = firstService.accountCreationDate
                }
                if (firstService.billCycle) {
                    realtimeData.billCycle = firstService.billCycle
                }
                if (firstService.billingDetails) {
                    realtimeData.billingDetails = firstService.billingDetails
                }

                realtimeData.serviceType = firstService.serviceType
                realtimeData.filled = true
                setAccountRealtimeDetails(realtimeData)
            }
        }
    }

    const handleAccountSelect = (evnt, e) => {
        console.log('Handle select e is ', e)
        setAccountUuid(e?.accountUuid)
        setSelectedAccount({
            customerUuid: e?.customerUuid,
            accountUuid: e?.accountUuid,
            accountNo: e?.accountNo
        })
        // setAccountNo(e?.accountNo)
        pageRefresh()
    }

    const handleServicePopupOpen = (evnt, idx) => {
        setServiceModal({ state: true })
        setSelectedService({ idx: idx })
    }

    const handleServicePopupClose = () => {
        setServiceModal({ state: false })
    }

    useEffect(() => {
        if (serviceStatus !== "PENDING") {
            setButtonDisable(false)
        }
        else {
            setButtonDisable(true)
        }
    }, [activeService])

    // useEffect(() => {
    //     const requestBody = {
    //         screenName: "Search Customer",
    //         moduleName: "Manage Customer"
    //     }
    //     
    //     post(properties.MAINMENU_API + '/getQuickLinks', requestBody)
    //         .then((response) => {
    //             setQuickLinks(response.data[0].links.Customer)
    //         })
    //         .catch((error) => {
    //             console.log("error", error)
    //         })
    //         .finally()
    // }, [])
    useEffect(() => {
        const requestBody = {
            customerUuid: selectedAccount?.customerUuid,
            accountUuid: selectedAccount?.accountUuid
        }
        get(properties.BILLING_API + '/billing-details?customerUuid=' + customerUuid + '&accountUuid=' + accountUuid)
            .then((response) => {
                setBillingDetails(response.data)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
    }, [selectedAccount])

    const handleQuickLinks = (e) => {
        if (customerDetails.status === "PROSPECT") {
            if (['Customer', 'Helpdesk History', 'Incident History', 'Lead History'].includes(e.name)) {
                if (e.name === "Incident History") {
                    return (<li>
                        <Link activeclassName="active" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}
                            <span className="badge badge-primary badge-pill float-right">{(leftNavCountsComplaint && leftNavCountsComplaint.cmpCount !== undefined && leftNavCountsComplaint.cmpCount !== 0) ? leftNavCountsComplaint.cmpCount : ''}</span>
                        </Link>
                    </li>)
                }
                else if (e.name === "Lead History") {
                    return (<li>
                        <Link activeclassName="active" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}
                            <span className="badge badge-primary badge-pill float-right">{(leftNavCountsInquiry && leftNavCountsInquiry.inqCount !== undefined && leftNavCountsInquiry.inqCount !== 0) ? leftNavCountsInquiry.inqCount : ''}</span>
                        </Link>
                    </li>)
                }
                else {
                    return (<li>
                        <Link activeclassName="active" key={e.to} className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}</Link>
                    </li>)
                }
            }
        } else {
            if (e.name === "Order History") {
                return (<li>
                    <Link activeclassName="active" to={e.to} spy={true} offset={-119} smooth={true} duration={100} >{e.name}
                        <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts.srCount !== undefined && leftNavCounts.srCount !== 0) ? leftNavCounts.srCount : ''}</span>
                    </Link>
                </li>)

            }
            else if (e.name === "Incident History") {
                return (<li>
                    <Link activeclassName="active" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}
                        <span className="badge badge-primary badge-pill float-right">{(leftNavCountsComplaint && leftNavCountsComplaint.cmpCount !== undefined && leftNavCountsComplaint.cmpCount !== 0) ? leftNavCountsComplaint.cmpCount : ''}</span>
                    </Link>
                </li>)

            }
            else if (e.name === "Lead History") {
                return (<li>
                    <Link activeclassName="active" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}
                        <span className="badge badge-primary badge-pill float-right">{(leftNavCountsInquiry && leftNavCountsInquiry.inqCount !== undefined && leftNavCountsInquiry.inqCount !== 0) ? leftNavCountsInquiry.inqCount : ''}</span>
                    </Link>
                </li>)
            }
            else {
                return (<li>
                    <Link activeclassName="active" key={e.to} className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}</Link>
                </li>)
            }
        }
    }

    useEffect(() => {
        if (selectedAccount?.accountUuid) {

            post(properties.ACCOUNT_DETAILS_API + '/get-service-list?limit=10&page=0', { customerUuid: customerUuid, accountUuid: selectedAccount?.accountUuid })
                .then((response) => {
                    if (response.data) {
                        console.log(response.data)
                        let { productDetails } = response.data;
                        let serviceNo = sessionStorage.getItem("serviceNo") ? Number(sessionStorage.getItem("serviceNo")) : null
                        let selectedService = false
                        if (activeService === "") {
                            if (!!productDetails?.length) {
                                productDetails.map((product) => {
                                    if (Number(product.serviceNo) === serviceNo) {
                                        selectedService = true
                                        setActiveService(product.serviceNo)
                                    }
                                })
                            }
                            if (selectedService === false) {
                                if (!!productDetails?.length) {
                                    setActiveService(productDetails && productDetails[0]?.productUuid)
                                }
                            }

                        }
                        productDetails = productDetails ? productDetails : [];
                        console.log(productDetails)
                        unstable_batchedUpdates(() => {
                            setProductList(productDetails);
                        })
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        }
    }, [pageRefreshHandlers.serviceRefresh, refreshPage, selectedAccount])

    const handleOnManageService = (serviceObject, source) => {
        const serviceEndPointMapping = {
            Catalog: {
                endPoint: properties.CATALOGUE_API,
                id: serviceObject.catalogId,
            },
            Plan: {
                endPoint: properties.PLANS_API,
                id: serviceObject.planId,
            },
            Service: {
                endPoint: properties.SERVICE_API_2,
                id: serviceObject.serviceId,
            },
            Asset: {
                endPoint: properties.ASSET_API_2,
                id: serviceObject.assetId,
            }
        }

        get(`${serviceEndPointMapping[source].endPoint}/${serviceEndPointMapping[source].id}${source === 'Asset' ? '?type=customer' : ''}`)
            .then((response) => {
                if (response.data) {
                    manageServiceRef.current = {
                        source,
                        serviceObject,
                        address: customerDetails?.address[0],
                        properties: {
                            property1: customerDetails?.property1 ? customerDetails.property1 : '-',
                            property2: customerDetails?.property2 ? customerDetails.property2 : '-',
                            property3: customerDetails?.property3 ? customerDetails.property3 : '-'
                        },
                        ...response.data
                    }
                    setIsManageServicesOpen(true);
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }


    function handlePrintClick() {
        setIsPrint(true);
        setTimeout(() => {
            window.print();
            setIsPrint(false); // set the state variable back to false after printing
            accountDetailsData = []
            setAccountDetailsData(accountDetailsData);
        }, 1000);
    }


    useEffect(() => {
        console.log('----here----');
        let promises = [];
        let arr = [];

        accountUuidList.forEach((e) => {
            promises.push(
                post(properties.ACCOUNT_DETAILS_API + '/get-service-list?limit=10&page=0', {
                    customerUuid: customerUuid,
                    accountUuid: e?.accountUuid
                })
                    .then((resp) => {
                        if (resp && resp.data) {
                            console.log('get accounts xxxx', resp.data)
                            let rowData = resp?.data;
                            rowData.accountNo = e?.accountNo;
                            console.log('rowData--------->', rowData);
                            arr.push(rowData);
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    })
            );
        });

        Promise.all(promises).then(() => {
            console.log('arr-------->', arr);
            setAccountDetailsData(() => arr);
        }).catch((error) => {
            console.log(error)
        });
    }, [isPrint]);

    const [customizedLable, setCustomizedLable] = useState('');
    const [sectionConfig, setSectionConfig] = useState('');
    // useEffect(() => {
    //     console.log('appsConfig--------xx-->',appsConfig)
    //     console.log('appsConfig?.clientFacingName---------->',appsConfig?.clientFacingName)
     
    // }, [])
    // console.log('appsConfig----------->',appsConfig)
    // if (appsConfig) {
    //     console.log('screenName----->', screenName)
    //     console.log('appsConfig.clientFacingName----->', appsConfig?.clientFacingName)
    //     for (const key in appsConfig?.clientFacingName) {
    //         if (key?.toLowerCase() === screenName.toLowerCase()) {
    //             // console.log('appsConfig.clientFacingName?.sectionConfigs-------->', appsConfig.clientFacingName[key])
    //             setSectionConfig(appsConfig?.clientFacingName[key]?.sectionConfigs)
    //         }
    //     }
    //     for (const key in appsConfig?.clientFacingName) {
    //         if (key === 'Customer'.toLowerCase()) {
    //             setCustomizedLable(appsConfig?.clientFacingName[key]);
    //             break;
    //         } else {
    //             setCustomizedLable('Customer')
    //         }
    //     }
    // }

    return (
        <>
            {
                userPermission.viewCustomer !== 'deny' && <>
                    <div className="cust-pd">
                        <div className={`'cust-summary skel-print-prev-sect cmmn-skeleton mt-2'`}>
                            <div className="cust-sect-1">
                                <CustomerDetailsFormView data={{
                                    customerData: customerDetails,
                                    accountCount: accountCount,
                                    serviceCount: servicesList?.length,
                                    sectionConfig,
                                    customizedLable
                                }} handler={{ setCustomerDetails, handlePrintClick }} />
                            </div>
                            <div className="cust-sect-2">
                               
                                {<div className="cmmn-container-base">
                                    <div className="container-heading">
                                        <span className="container-title"><i className="fe-pocket"></i>Billing Summary</span>
                                    </div>
                                    <div className="cust-sect-fullgrid">
                                        <div className="container-label b-summary">
                                            <p><span className="label-container-style">Total Monthly Billing</span> <span>:</span> <span>{billingDetails?.totInvAmount || 0}</span></p>
                                            <p className="wr-txt"><span className="label-container-style">Total Outstanding</span>  <span>:</span> <span>{billingDetails?.totOutstandAmt || 0}</span></p>
                                            <p><span className="label-container-style">Next Billing Cycle</span> <span>:</span> <span>{billingDetails?.invoicePeriod || '-'}</span> </p>
                                        </div>
                                    </div>
                                    <hr className="cmmn-hline" />
                                    <div className="plan-summary">
                                        <p>Upgrade/Downgrade Services</p>
                                    </div>
                                </div>}
                                {<div className="cmmn-container-base">
                                    <div className="container-heading">
                                        <span className="container-title"><i className="fe-pocket"></i> Data Usage</span>
                                    </div>
                                    {
                                        servicesList && servicesList.length > 0 ?
                                            <Slider {...recentActivitySettings}>
                                                {
                                                    servicesList && servicesList.map((val, idx) => (
                                                        <div className="container-one-row skel-slick-wd">
                                                            <div className="container-label">
                                                                <div className="data-usage">
                                                                    {val.serviceUsage / 1000} GB
                                                                </div>
                                                                <span className="txt-small">Data left of {val.serviceBalance / 1000} GB</span>
                                                                <ProgressBar className="progress-status progress-moved" now={(Number(val.serviceUsage) / Number(val.serviceLimit)) * 100} />

                                                                <span className="txt-small txt-orange">Renews in 8 hours</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </Slider>
                                            : <>No Services Available</>
                                    }

                                </div>}
                                {<div className="cmmn-container-base">
                                    <div className="container-heading">
                                        <span className="container-title"><i className="fe-pocket"></i> Upcoming Appointment(0)</span>
                                    </div>
                                    <div className="cust-sect-fullgrid">
                                        <div className="container-label b-summary">
                                            <p><span className="label-container-style">Appointment Date</span> <span>:</span> <span>NA</span></p>
                                            <p><span className="label-container-style">Branch</span>  <span>:</span> <span>NA</span></p>
                                            <p><span className="label-container-style">Request Type</span> <span>:</span> <span>NA</span> </p>
                                        </div>
                                    </div>
                                </div>}
                            </div>
                            {!isPrint && <div className="cust-sect-3">
                                {/* <BestOffer/> */}
                                {<div className="cmmn-container-base">
                                    <div className="container-heading">
                                        <span className="container-title"><i className="fe-pocket"></i> Recent Activity({recentActivity.length})</span>

                                    </div>
                                    {
                                        recentActivity.length > 0 ?
                                            <Slider {...recentActivitySettings}>
                                                {
                                                    recentActivity && recentActivity.map((val, idx) => (
                                                        <div className="container-one-row skel-slick-wd">
                                                            <div className="container-label rec-activity-info-shrt">
                                                                <div className="actv-list activity-cnt">
                                                                    {val?.message}
                                                                    <span className="txt-small">{val?.date}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                    )
                                                }
                                            </Slider>
                                            : <span className="actv-list activity-cnt">No Recent Activities</span>
                                    }


                                </div>}

                                {<div className="cmmn-container-base">
                                    <div className="container-heading">
                                        <span className="container-title"><i className="fe-pocket"></i> Service Expiry({expiryServicesList.length})</span>
                                    </div>
                                    {
                                        expiryServicesList.length > 0 ?
                                            <Slider {...recentActivitySettings}>
                                                {
                                                    expiryServicesList && expiryServicesList.map((val, idx) => (
                                                        <div className="container-one-row skel-slick-wd">
                                                            <div className="container-label rec-activity-info-shrt">
                                                                <div className="actv-list activity-cnt">
                                                                    {val.serviceName}
                                                                    <span className="exp-info">{val.expiryDate}</span>
                                                                </div>
                                                                <button className="styl-edti-btn">Renew</button>
                                                            </div>
                                                        </div>
                                                    )
                                                    )
                                                }
                                            </Slider>
                                            : <span className="actv-list activity-cnt">No Services Expired</span>
                                    }
                                </div>}
                            </div>}
                        </div>

                        <div className="cust-sect-tgrid skel-preview-full-grid">
                            {/* <div className="cust-lft-info">
                                <div className="cmmn-container-base">
                                    <div className="container-heading">
                                        <span className="container-title"><i className="fe-pocket"></i> Customer Property</span>
                                    </div>
                                    <div className="container-three-row">
                                        <div className="container-label">
                                            <span className="label-container-style">Contact Person Name</span>
                                            <span>Santoso</span>
                                        </div>
                                        <div className="container-label">
                                            <span className="label-container-style">Contact Person Name</span>
                                            <span>Santoso</span>
                                        </div>
                                        <div className="container-label">
                                            <span className="label-container-style">Contact Person Name</span>
                                            <span>Santoso</span>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                            {<BillableDetailsFormView data={{
                                billingData: customerDetails?.billableDetails
                            }} />}
                            {<div className="cust-rht-info skel-attachments-preview">
                                <div className="cmmn-container-base">
                                    <div className="container-heading">
                                        <span className="container-title"><i className="fe-pocket"></i> Attachments</span>
                                        <span><button className="styl-edti-btn">Add New</button></span>
                                    </div>

                                </div>
                            </div>}
                        </div>
                        {<div className="cust-accounts">
                            <div className="cmmn-container-base">
                                <div className="container-heading">
                                    <span className="container-title"><i className="fe-pocket"></i> Accounts</span>
                                </div>
                                {!isPrint && <div className="account-sect-cinfo">
                                    <div className="tabbable-responsive">
                                        <div className="tabbable">
                                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                                {
                                                    accountUuidList.map((e) => (
                                                        <li className="nav-item">
                                                            <a onClick={(evnt) => handleAccountSelect(evnt, e)} className={"nav-link " + ((e?.accountUuid === selectedAccount?.accountUuid) ? "active" : "")} id="first-tab" data-toggle="tab" role="tab" aria-controls="first" aria-selected="true">{e?.accountNo}</a>
                                                        </li>
                                                    ))
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <>
                                            {
                                                (accountUuidList && accountUuidList.length > 0) ?
                                                    <>
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <AccountDetailsFormView
                                                                    data={{
                                                                        userPermission: userPermission?.editAccount,
                                                                        customerType: customerDetails?.customerType,
                                                                        billableDetails: customerDetails?.billableDetails,
                                                                        accountData: accountDetails,
                                                                        isPrint,
                                                                        accountDetailsData,
                                                                        accountRealtimeDetails: accountRealtimeDetails,
                                                                        newAccountAddded: newAccountAddded,
                                                                        setNewAccountAdded: setNewAccountAdded,
                                                                        openBillHistoryModal,
                                                                        setOpenBillHistoryModal,
                                                                        pageRefresh: handleAccountRefresh
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                    :
                                                    <span className="msg-txt p-1">No Accounts Available</span>
                                            }

                                            {/* Services Section */}
                                            <div className="accordion" id="serviceaccordion">
                                                <ServiceListFormView
                                                    data={{
                                                        serviceList: servicesList
                                                    }}
                                                    handleOnManageService={handleOnManageService}
                                                    activeService={activeService}
                                                    setActiveService={setActiveService}
                                                />
                                            </div>
                                            {/* Services Section Ends */}

                                        </>
                                    </div>
                                </div>}
                                {
                                    isPrint &&
                                    accountUuidList.map((e) => (<div className="account-sect-cinfo">
                                        <div className="tabbable-responsive">
                                            <div className="tabbable">
                                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                                    <li className="nav-item">
                                                        <a className={"nav-link " + ((e?.accountUuid === selectedAccount?.accountUuid) ? "active" : "")} id="first-tab" data-toggle="tab" role="tab" aria-controls="first" aria-selected="true">{e?.accountNo}</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <>
                                                {
                                                    (accountUuidList && accountUuidList.length > 0) ?
                                                        <>
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <AccountDetailsFormView
                                                                        data={{
                                                                            userPermission: userPermission?.editAccount,
                                                                            customerType: customerDetails?.customerType,
                                                                            billableDetails: customerDetails?.billableDetails,
                                                                            accountData: accountDetails,
                                                                            isPrint,
                                                                            accountDetailsData,
                                                                            accountRealtimeDetails: accountRealtimeDetails,
                                                                            newAccountAddded: newAccountAddded,
                                                                            setNewAccountAdded: setNewAccountAdded,
                                                                            openBillHistoryModal,
                                                                            setOpenBillHistoryModal,
                                                                            pageRefresh: handleAccountRefresh
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                        :
                                                        <span className="msg-txt p-1">No Accounts Available</span>
                                                }
                                                {/* Services Section */}
                                                {
                                                    console.log('------servuce data-------->', accountDetailsData.filter((ele) => ele.accountNo === e?.accountNo))
                                                }
                                                {accountDetailsData && accountDetailsData.length > 0 && <div className="accordion" id="serviceaccordion">
                                                    <ServiceListFormView
                                                        data={{
                                                            serviceList: servicesList, isPrint,
                                                            accountDetailsData,
                                                            accountNo: e?.accountNo
                                                        }}
                                                        handleOnManageService={handleOnManageService}
                                                        activeService={activeService}
                                                        setActiveService={setActiveService}
                                                    />
                                                </div>}
                                                {/* Services Section Ends */}
                                            </>
                                        </div>
                                    </div>
                                    ))
                                }
                            </div>
                        </div>}

                        {!isPrint && 
                            <div className="cust-accounts">
                                <div className="cmmn-container-base">
                                    <div className="container-heading">
                                        <span className="container-title"><i className="fe-pocket"></i> Contract</span>

                                    </div>
                                    <div className="account-sect-cinfo">
                                        <div className="tabbable-responsive">
                                            <div className="tabbable">
                                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                                    <li className="nav-item">
                                                        <a className="nav-link active" id="BC-tab" data-toggle="tab" href="#BC" role="tab" aria-controls="BC" aria-selected="true" onClick={(evnt) => handleContractTypeSelect('billed')}>Billed Contract</a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a className="nav-link" id="UBC-tab" data-toggle="tab" href="#UBC" role="tab" aria-controls="UBC" aria-selected="false" onClick={(evnt) => handleContractTypeSelect('unbilled')}>UnBilled Contract</a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a className="nav-link" id="CH-tab" data-toggle="tab" href="#CH" role="tab" aria-controls="CH" aria-selected="false" onClick={(evnt) => handleContractTypeSelect('history')}>Contract History</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="tab-content">
                                                <div className={`tab-pane fade ${contractType === 'billed' ? 'show active' : ''}`} id="BC" role="tabpanel" aria-labelledby="BC-tab">
                                                    <div className="cmmn-container-base no-brd">
                                                        {
                                                            selectedAccount && selectedAccount?.accountNo ?
                                                                <SearchContract
                                                                    data={{
                                                                        data: { billRefNo: selectedAccount?.accountNo, customerUuid },
                                                                        hideForm: true,
                                                                        contractType: contractType,
                                                                        // contractType: "billed",
                                                                        refresh: pageRefreshHandlers.contractInvoicePaymentRefresh,
                                                                        from: "Customer360"
                                                                    }}
                                                                    handler={{
                                                                        pageRefresh: handleContractInvoicePaymentRefresh
                                                                    }}
                                                                />
                                                                :
                                                                <span className="msg-txt pt-1">No Billed Contracts Available</span>
                                                        }
                                                    </div>
                                                </div>
                                                <div className={`tab-pane fade ${contractType === 'unbilled' ? 'show active' : ''}`} id="UBC" role="tabpanel" aria-labelledby="UBC-tab">
                                                    <div className="cmmn-container-base no-brd">
                                                        {
                                                            selectedAccount && selectedAccount?.accountNo ?
                                                                <SearchContract
                                                                    data={{
                                                                        data: { billRefNo: selectedAccount?.accountNo, customerUuid },
                                                                        hideForm: true,
                                                                        // contractType: "unbilled",
                                                                        contractType: contractType,
                                                                        refresh: pageRefreshHandlers.contractInvoicePaymentRefresh,
                                                                        from: "Customer360"
                                                                    }}
                                                                    handler={{
                                                                        pageRefresh: handleContractInvoicePaymentRefresh
                                                                    }}
                                                                />
                                                                :
                                                                <span className="msg-txt pt-1">No Unbilled Contracts Available</span>
                                                        }
                                                    </div>
                                                </div>
                                                <div className={`tab-pane fade ${contractType === 'history' ? 'show active' : ''}`} id="CH" role="tabpanel" aria-labelledby="CH-tab">
                                                    <div className="cmmn-container-base no-brd">
                                                        {
                                                            selectedAccount && selectedAccount?.accountNo ?
                                                                <SearchContract
                                                                    data={{
                                                                        data: { billRefNo: selectedAccount?.accountNo, customerUuid },
                                                                        hideForm: true,
                                                                        // contractType: "history",
                                                                        contractType: contractType,
                                                                        refresh: pageRefreshHandlers.contractInvoicePaymentRefresh,
                                                                        from: "Customer360"
                                                                    }}
                                                                    handler={{
                                                                        pageRefresh: handleContractInvoicePaymentRefresh
                                                                    }}
                                                                />
                                                                :
                                                                <span className="msg-txt pt-1">No Contracts History Available</span>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                        {!isPrint && 
                            <div className="cust-accounts">
                                <div className="cmmn-container-base">
                                    <div className="container-heading">
                                        <span className="container-title"><i className="fe-pocket"></i> Invoice</span>
                                    </div>
                                    <div className="tabbable-responsive">
                                        <div className="tabbable">
                                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                                <li className="nav-item">
                                                    <a className="nav-link active" id="first-tab" data-toggle="tab" href="#invoice" role="tab" aria-controls="first" aria-selected="true" onClick={(evnt) => handleTypeSelect('Invoice')}>Invoice</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="account-sect-cinfo">
                                        <div className="cmmn-container-base no-brd">
                                            {
                                                tabType === 'Invoice' && selectedAccount && selectedAccount?.accountNo ?
                                                    <SearchInvoice
                                                        data={{
                                                            data: { customerId: customerDetails?.customerId, customerUuid, startDate: null, endDate: null },
                                                            hideForm: true,
                                                            refresh: pageRefreshHandlers.contractInvoicePaymentRefresh,
                                                            from: "Customer360"
                                                        }}
                                                    />
                                                    :
                                                    <span className="msg-txt pt-1">No Invoice Available</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                        {!isPrint &&
                            <div className="cust-accounts" >
                                <div className="cmmn-container-base">
                                    <div className="container-heading">
                                        <span className="container-title"><i className="fe-pocket"></i> Interactions</span>
                                    </div>
                                    <div className="account-sect-cinfo">
                                        <div className="tabbable-responsive">
                                            <div className="tabbable">
                                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                                    <li className="nav-item">
                                                        <a className="nav-link active" id="first-tab" data-toggle="tab" href="#helpdesk" role="tab" aria-controls="first" aria-selected="true" onClick={(evnt) => handleTypeSelect('helpDesk')}>Help Desk</a>
                                                    </li>
                                                    {<li className="nav-item">
                                                        <a className="nav-link" id="second-tab" data-toggle="tab" href="#paymenthistory" role="tab" aria-controls="second" aria-selected="false" onClick={(evnt) => handleTypeSelect('payment')}>Payment</a>
                                                    </li>}
                                                    { <li className="nav-item">
                                                        <a className="nav-link" id="third-tab" data-toggle="tab" href="#workorder" role="tab" aria-controls="third" aria-selected="false" onClick={(evnt) => handleTypeSelect('workOrder')}>Work Order</a>
                                                    </li>}
                                                    <li className="nav-item">
                                                        <a className="nav-link " id="fourth-tab" data-toggle="tab" href="#requesthistory" role="tab" aria-controls="third" aria-selected="false" onClick={(evnt) => handleTypeSelect('interactions')}>Interaction</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="card-body">

                                            <div className="tab-content">
                                                <div className={`tab-pane fade ${tabType === 'helpDesk' ? 'show active' : ''}`} id="helpdesk" role="tabpanel" aria-labelledby="first-tab">

                                                    <div className="cmmn-container-base no-brd">
                                                        {customerDetails && <Helpdesk
                                                            data={{
                                                                customerDetails: customerDetails
                                                            }}
                                                        />}
                                                    </div>

                                                </div>
                                                <div className={`tab-pane fade ${tabType === 'payment' ? 'show active' : ''}`} id="paymenthistory" role="tabpanel" aria-labelledby="second-tab">
                                                    <div className="cmmn-container-base no-brd">
                                                        {<Payment
                                                            data={{
                                                                selectedAccount: selectedAccount,
                                                            }}
                                                        />}
                                                    </div>
                                                </div>
                                                <div className={`tab-pane fade ${tabType === 'workOrder' ? 'show active' : ''}`} id="workorder" role="tabpanel" aria-labelledby="third-tab">
                                                    <div className="cmmn-container-base no-brd">
                                                        {customerDetails && <WorkOrders
                                                            data={{
                                                                customerDetails
                                                            }}
                                                        />}

                                                    </div>
                                                </div>
                                                <div className={`tab-pane fade ${tabType === 'interactions' ? 'show active' : ''}`} id="requesthistory" role="tabpanel" aria-labelledby="fourth-tab">
                                                    <div className="cmmn-container-base no-brd">
                                                        {customerDetails && <Interactions
                                                            data={{
                                                                customerDetails,
                                                            }}
                                                        />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>

                </>
            }
        </>
    )
}
export default Customer360;
