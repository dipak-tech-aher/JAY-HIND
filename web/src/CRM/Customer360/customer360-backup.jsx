import React, { useState, useRef, useContext, useEffect } from 'react'
import { useTranslation } from "react-i18next";
import { Link, Element } from 'react-scroll'
import { Link as DomLink } from 'react-router-dom';
import { toast } from "react-toastify";
import Modal from 'react-modal'
import { get, post } from "../../common/util/restUtil";
import { properties } from "../../properties";

import CustomerDetailsPreview from './customerDetailsView'
import BusinessCustomerDetailsPreview from '../Customer/businessCustomerDetailsPreview'
import AccountDetailsView from './accountDetailsView'
import ServiceFullView from './serviceFullView'
import ServiceRequestList from './serviceRquestList'
import ComplaintList from './complaintList'
import NewCustomerBkp from '../Customer/newCustomerBkp';
import EditCustomerModal from './customerSection/EditCustomerModal';

// import 'antd/dist/antd.css';
import { Tabs } from 'antd';
import InquiryList from './inquiryList';
import SearchContract from '../../InvoiceAndBilling/Contract/SearchContract';
import SearchInvoice from '../../InvoiceAndBilling/Invoice/SearchInvoice';
import PaymentHistory from '../../InvoiceAndBilling/Accounting/AccountDetailsView/PaymentHistory';
import CustomerUploadAttachment from './customerSection/CustomerUploadAttachment';
import FileDownload from '../../common/uploadAttachment/FileDownload';
import CustomerHistory from './customerSection/CustomerHistory';
import CatalogCard from './CatalogCard';
import Slider from "react-slick";
import PlanServiceAssetCard from './PlanServiceAssetCard';
import { unstable_batchedUpdates } from 'react-dom';
import ManageService from './ManageServices/ManageServices';
import { AppContext } from '../../AppContext';
import HelpdeskHistory from './HelpdeskHistory/HelpdeskHistory';
import WorkOrderList from '../../InvoiceAndBilling/SalesOrder360/WorkOrderList';

let Limiter = require('async-limiter');
const { TabPane } = Tabs;
let accessNumber = null
var settings = {
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

var catalogSettings = {
    dots: false,
    infinite: false,
    arrows: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    initialSlide: 0,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
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
    const accountNo = sessionStorage.getItem("accountNo") ? Number(sessionStorage.getItem("accountNo")) : null
    //const accountNo = 20179013
    let limiter = new Limiter({ concurrency: 1 });
    let serviceCardRef = useRef(null)
    const refVoid = useRef(null)
    let serviceRef = useRef(null)
    let accountRef = useRef(null)
    const { auth } = useContext(AppContext)
    const { t } = useTranslation();
    const [refreshPage, setRefreshPage] = useState(true)
    const [searchInput, setSearchInput] = useState({})
    const [activeService, setActiveService] = useState("")
    const [customerDetails, setCustomerDetails] = useState({})
    const [accountIdList, setAccountIdList] = useState({})
    const [selectedAccount, setSelectedAccount] = useState({})
    const [accountDetails, setAccountDetails] = useState({})
    const [accountRealtimeDetails, setAccountRealtimeDetails] = useState({})

    const [serviceIdsList, setServiceIdsList] = useState([])

    const [servicesList, setServicesList] = useState([])
    const [servicesSummary, setServicesSummary] = useState([])
    const [serviceModal, setServiceModal] = useState({ state: false })
    const [selectedService, setSelectedService] = useState({ idx: -1 })

    const [catalogList, setCatalogList] = useState([]);
    const [planServiceAssetList, setPlanServiceAssetCatalogList] = useState([]);
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
    //modal handled 
    const [openCustomerHistoryModal, setOpenCustomerHistoryModal] = useState(false)
    const [openAddAttachmentModal, setOpenAddAttachmentModal] = useState(false)
    const [openEditCustomerModal, setOpenEditCustomerModal] = useState(false)
    const [openAccModal, setAccOpenModal] = useState(false)
    const [openSerModal, setServiceOpenModal] = useState(false)
    const [openCompModal, setComplaintOpenModal] = useState(false)
    const [openInqModal, setInquiryOpenModal] = useState(false)
    const [openBillHistoryModal, setOpenBillHistoryModal] = useState(false)


    const [userPermission, setUserPermission] = useState({
        addAttachment: false, editUser: false, editAccount: false, addService: false,
        addComplaint: false, addInquiry: false, viewCustomer: false
    })


    const [connectionStatusLookup, setConnectionStatusLookup] = useState([{}])
    const [kioskRefNo, setKioskRefeNo] = useState(null)
    let customerId = ""
    let accountId = ""
    let serviceId = ""
    const [service, setService] = useState(sessionStorage.getItem("service") === "true" ? true : false)
    const [account, setAccount] = useState(sessionStorage.getItem("account") === "true" ? true : false)
    const [quickLinks, setQuickLinks] = useState([{}])
    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(false)

    const [pageRefreshHandlers, setPageRefreshHandlers] = useState({
        attachmentRefresh: true,
        customerRefresh: true,
        accountEditRefresh: true,
        serviceRefresh: true,
        contractInvoicePaymentRefresh: true
    })
    const [customerRefresh, setCustomerRefresh] = useState(true)
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

    useEffect(() => {
        accessNumber = sessionStorage.getItem("accessNbr") ? Number(sessionStorage.getItem("accessNbr")) : null
        if (props?.location?.state !== undefined && props?.location?.state?.data !== undefined) {

            customerId = props?.location?.state?.data?.customerId
            accountId = props?.location?.state?.data?.accountId
            serviceId = props?.location?.state?.data?.serviceId
            if (props.location.state.data.sourceName === 'fromKiosk') {
                customerId = sessionStorage.getItem("customerId") ? Number(sessionStorage.getItem("customerId")) : null
                accountId = sessionStorage.getItem("accountId") ? Number(sessionStorage.getItem("accountId")) : null
                serviceId = sessionStorage.getItem("serviceId") ? Number(sessionStorage.getItem("serviceId")) : null
                accessNumber = props?.location?.state?.data?.apiData?.accessNumber
            }
            setKioskRefeNo(props?.location?.state?.data?.referenceNo)
        }
        else {
            customerId = sessionStorage.getItem("customerId") ? Number(sessionStorage.getItem("customerId")) : null
            accountId = sessionStorage.getItem("accountId") ? Number(sessionStorage.getItem("accountId")) : null
            serviceId = sessionStorage.getItem("serviceId") ? Number(sessionStorage.getItem("serviceId")) : null

        }

        setSearchInput({
            customerId: customerId,
            accountNo: accountId,
            serviceId: serviceId
        })
        // if (serviceId !== null || serviceId !== undefined || serviceId !== '') {
        //     console.log('setActiveService1', serviceId)
        //     setActiveService(serviceId)
        // }

        if (customerId && customerId !== '') {
            
            get(properties.CUSTOMER360_API + '/' + customerId)
                .then((resp) => {
                    if (resp && resp.data) {
                        const customerData = {}
                        customerData.customerId = resp?.data?.customerId
                        customerData.crmCustomerNo = (resp?.data?.crmCustomerNo) ? resp?.data?.crmCustomerNo : ''
                        if (resp?.data?.custType === 'RESIDENTIAL') {
                            customerData.title = resp?.data?.title || ""
                            customerData.foreName = resp?.data?.firstName || ""
                            customerData.surName = resp?.data?.lastName || ""
                        }
                        if (resp?.data?.custType === 'BUSINESS' || resp?.data?.custType === 'GOVERNMENT') {
                            customerData.companyName = resp?.data?.firstName || ""
                        }
                        customerData.customerType = resp?.data?.custType || ""
                        customerData.customerTypeDesc = resp?.data?.customerTypeDesc?.description || ""
                        customerData.email = resp?.data?.contact?.email || ""
                        customerData.contactType = resp?.data?.contact?.contactType || ""
                        customerData.contactTypeDesc = resp?.data?.contact?.contactTypeDesc?.description || ""
                        customerData.contactNbr = resp?.data?.contact?.contactNo || ""
                        customerData.gender = resp?.data?.gender || ""
                        customerData.dob = resp?.data?.birthDate || ""
                        customerData.idNumber = resp?.data?.idValue || ""
                        customerData.idType = resp?.data?.idType || ""
                        customerData.idTypeDesc = resp?.data?.idTypeDesc?.description || ""
                        customerData.property1 = resp?.data?.property_1 || ""
                        customerData.property2 = resp?.data?.property_2 || ""
                        customerData.property3 = resp?.data?.property_3 || ""
                        customerData.registrationDate = resp?.data?.regDate || ""
                        customerData.registrationNbr = resp?.data?.registeredNo || ""
                        customerData.isBillable = resp?.data?.isBillable || ""
                        customerData.status = resp?.data?.status || ""
                        customerData.statusDesc = resp?.data?.statusDesc?.description || ""
                        customerData.billableDetails = resp?.data?.billableDetails || {}
                        customerData.billableDetails.groupDesc = resp?.data?.billableDetails.billGroupDesc?.description || ""
                        customerData.billableDetails.currencyDesc = resp?.data?.billableDetails.currencyDesc?.description || ""
                        customerData.billableDetails.notificationDesc = resp?.data?.billableDetails.billNotificationDesc?.description || ""
                        customerData.billableDetails.languageDesc = resp?.data?.billableDetails.billLanguageDesc?.description || ""
                        customerData.billableDetails.sourceOfRegDesc = resp?.data?.billableDetails.sourceOfRegDesc?.description || ""
                        customerData.address = []
                        customerData.address.push({})
                        customerData.address[0].flatHouseUnitNo = resp?.data?.address?.hno || ""
                        customerData.address[0].building = resp?.data?.address?.buildingName || ""
                        customerData.address[0].street = resp?.data?.address?.street || ""
                        customerData.address[0].district = resp?.data?.address?.district || ""
                        customerData.address[0].cityTown = resp?.data?.address?.city || ""
                        customerData.address[0].country = resp?.data?.address?.country || ""
                        customerData.address[0].postCode = resp?.data?.address?.postCode || ""
                        customerData.address[0].state = resp?.data?.address?.state || ""
                        customerData.address[0].districtDesc = resp?.data?.address?.districtDesc?.description || ""
                        customerData.address[0].countryDesc = resp?.data?.address?.countryDesc?.description || ""
                        customerData.address[0].postCodeDesc = resp?.data?.address?.postCodeDesc?.description || ""
                        customerData.address[0].stateDesc = resp?.data?.address?.stateDesc?.description || ""

                        setCustomerDetails(customerData)

                    } else {
                        toast.error("Failed to fetch Customer Details - " + resp?.status);
                    }
                }).catch((error) => {
                    console.log(error)
                }).finally();

            

            get(properties.ACCOUNTS_LIST_API + '/' + customerId)
                .then((resp) => {
                    if (resp && resp?.data) {
                        let acctData = []
                        let selIdx = 0
                        let loopCount = 0
                        for (let r of resp?.data?.account) {
                            if (String(r?.accountId) === String(accountId)) {
                                selIdx = loopCount
                            }
                            acctData.push({
                                customerId: customerId,
                                accountId: r?.accountId,
                                accountNo: r?.accountNo
                            })
                            loopCount++
                        }
                        setAccountIdList(acctData)
                        if (accountNo !== null && isNaN(accountNo) !== true && accountId !== null && accountNo !== undefined) {
                            setSelectedAccount({
                                customerId: customerId,
                                accountId: accountId,
                                accountNo: accountNo
                            })
                        }
                        else {
                            setSelectedAccount({
                                customerId: acctData[selIdx]?.customerId,
                                accountId: acctData[selIdx]?.accountId,
                                accountNo: acctData[selIdx]?.accountNo
                            })
                        }
                    } else {
                        toast.error("Failed to fetch account ids data - " + resp?.status);
                    }
                }).catch((error) => {
                    console.log(error)
                }).finally();
            /* Commented as per new services
            
            post(properties.BUSINESS_ENTITY_API, ['CERILLION_STATUS'])
                .then((resp) => {
                    if (resp.data) {
                        setConnectionStatusLookup(resp.data['CERILLION_STATUS'])
                    }
                }).catch((error) => {
                console.log(error)
            }).finally();
            */
            // 
            // get(properties.SERVICE_REQUEST_LIST_BY_CUSTOMER + '/' + customerId
            //     + '?' + 'account-id=' + accountId + '&service-id=' + serviceId + '&status=OPEN')
            //     .then((resp) => {
            //         if (resp && resp.data) {
            //             for (let sr of resp.data) {
            //                 if (sr.woType === 'BAR') {

            //                 }
            //         }
            //         } else {
            //             toast.error("Failed to fetch Service Requests - " + resp.status);
            //         }
            //     }).catch((error) => {
                // console.log(error)
            // }).finally();

        } else {
            toast.error("Invalid data - customer id is not available");
        }

    }, [newAccountAddded, props.location.state, /*refreshPage*/customerRefresh]);

    useEffect(() => {
        if (newAccountAddded.isAccountAdded) {
            setAccOpenModal(false)
        }

        if (selectedAccount && selectedAccount?.customerId && selectedAccount?.accountId && selectedAccount?.customerId !== '' && selectedAccount?.accountId !== '') {
            
            get(properties.ACCOUNT_DETAILS_API + '/' + selectedAccount?.customerId + '?' + 'account-id=' + selectedAccount?.accountId)
                .then((resp) => {
                    if (resp && resp.data) {

                        setAccountDetails(resp?.data)
                        const serviceIds = []
                        // for(let s of resp.data.serviceIds) {
                        //     serviceIds.push({serviceId: s.connectionId, fetch: false})
                        // }
                        /* Commented as per new service list
                        const svcIdsList = []
                        for (let s of resp.data.serviceIds) {
                            if (searchInput && searchInput.serviceId && (Number(searchInput.serviceId) === s.serviceId)) {
                                svcIdsList.splice(0, 0, s)
                            } else {
                                svcIdsList.push(s)
                            }
                        }
                        
                        get(properties.SERVICES_LIST_API + '/' + selectedAccount.customerId + '?' + 'account-id=' + selectedAccount.accountId)
                            .then((resp) => {
                                if (resp && resp.data) {
                                    if (resp.data.length > 0) {
                                        const svcList = []
                                        for (let s of resp.data) {
                                            if (searchInput && searchInput.serviceId && (Number(searchInput.serviceId) === s.serviceId)) {
                                                svcList.splice(0, 0, s)
                                            } else {
                                                svcList.push(s)
                                            }
                                        }
                                        setServiceIdsList(svcIdsList)
                                        setServicesList(svcList)
                                        if (accountNo !== selectedAccount.accountNo) {
                                            // service = false
                                            // account = false 
                                            setAccount(false)
                                            setService(false)
                                            setActiveService(svcList[0].serviceId)
                                        }

                                    }
                                } else {
                                    toast.error("Failed to fetch account ids data - " + resp.status);
                                }
                            })
                            .finally()
                            */
                    } else {
                        toast.error("Failed to fetch account ids data - " + resp.status);
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
                
                get(properties.SERVICES_LIST_API + '/' + selectedAccount.customerId + '?' + 'account-id=' + selectedAccount.accountId + '&service-id=' + refreshServiceList)
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

    //useEffect for user permissions
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
        rolePermission?.users.map((screen) => {
            if (screen.screenName === "Edit User") {
                userEdit = screen.accessType
            }

        })
        rolePermission?.attachment.map((screen) => {
            if (screen.screenName === "Add Attachment") {
                attachmentAdd = screen.accessType
            }

        })
        rolePermission?.account.map((screen) => {
            if (screen.screenName === "Edit Account") {
                accountEdit = screen.accessType
            }

        })
        rolePermission?.service.map((screen) => {
            if (screen.screenName === "Add Service") {
                serviceAdd = screen.accessType
            }

        })
        rolePermission?.complaint.map((screen) => {
            if (screen.screenName === "Add Complaint") {
                complaintAdd = screen.accessType
            }

        })
        rolePermission?.inquiry.map((screen) => {
            if (screen.screenName === "Add Inquiry") {
                inquiryAdd = screen.accessType
            }

        })
        rolePermission?.customer.map((screen) => {
            if (screen.screenName === "View Customer") {
                viewCust = screen.accessType
            }

        })
        setUserPermission({ editUser: userEdit, addAttachment: attachmentAdd, editAccount: accountEdit, addService: serviceAdd, addComplaint: complaintAdd, addInquiry: inquiryAdd, viewCustomer: viewCust })

        
    }, [auth])



    useEffect(() => {
        // if (Number(accountNo) === Number(selectedAccount.accountNo)) {
        //     onClickScrollTo()
        // }
    }, [servicesList, serviceCardRef])

    const handleLoadBalances = async (serviceId) => {

        if (serviceId !== undefined && serviceId !== null) {
            await fetchServiceDetails(serviceId, undefined);
        }
    }

    // useEffect(() => {
    //     if (newServiceAddded.isServicesAdded) {
    //         setServiceModal(false)
    //     }
    //     if (selectedAccount && selectedAccount.customerId && selectedAccount.accountId && selectedAccount.customerId !== '' && selectedAccount.accountId !== '') {

    //     }
    // }, [newServiceAddded, refreshServiceList]);


    const fetchServiceDetails = async (serviceId, updatedPortalData) => {
        //commented by Alsaad for demo.
        // const resp = await slowGet(properties.SERVICE_REALTIME_API + '/' + selectedAccount.customerId + '?' + 'account-id=' + selectedAccount.accountId + '&service-id=' + serviceId)

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
        setSelectedAccount({
            customerId: e?.customerId,
            accountId: e?.accountId,
            accountNo: e?.accountNo
        })
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

    useEffect(() => {
        const requestBody = {
            screenName: "Search Customer",
            moduleName: "Manage Customer"
        }
        
        post(properties.MAINMENU_API + '/getQuickLinks', requestBody)
            .then((response) => {
                setQuickLinks(response.data[0].links.Customer)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
    }, [])

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
        if(selectedAccount?.accountId) {
        
        get(`${properties.CUSTOMER_DETAILS}/services/${Number(sessionStorage.getItem("customerId"))}?accountId=${selectedAccount?.accountId}`)
            .then((response) => {
                if (response.data) {
                    let { catalogData, planData, assetData, serviceData } = response.data;
                    let serviceId = sessionStorage.getItem("serviceId") ? Number(sessionStorage.getItem("serviceId")) : null
                    let selectedService = false
                    if (activeService === "") {
                        if (!!catalogData.length) {
                            catalogData.map((catalog) => {
                                if (Number(catalog.connectionId) === serviceId) {
                                    selectedService = true
                                    setActiveService(catalog.connectionId)
                                }
                            })
                        }
                        if (selectedService === false) {
                            if (!!planData.length) {
                                planData.map((plan) => {
                                    if (Number(plan.connectionId) === serviceId) {
                                        selectedService = true
                                        setActiveService(plan.connectionId)
                                    }
                                })
                            }
                        }
                        if (selectedService === false) {
                            if (!!assetData.length) {
                                assetData.map((asset) => {
                                    if (Number(asset.connectionId) === serviceId) {
                                        selectedService = true
                                        setActiveService(asset.connectionId)
                                    }
                                })
                            }
                        }
                        if (selectedService === false) {
                            if (!!serviceData.length) {
                                serviceData.map((service) => {
                                    if (Number(service.connectionId) === serviceId) {
                                        selectedService = true
                                        setActiveService(service.connectionId)
                                    }
                                })
                            }
                        }
                        if (selectedService === false) {
                            if (!!catalogData.length) {
                                setActiveService(catalogData && catalogData[0]?.connectionId)
                            }
                            else if (!!planData.length) {
                                setActiveService(planData && planData[0]?.connectionId)
                            }
                            else if (!!assetData.length) {
                                setActiveService(assetData && assetData[0]?.connectionId)
                            }
                            else if (!!serviceData.length) {
                                setActiveService(serviceData && serviceData[0]?.connectionId)
                            }
                        }

                    }
                    catalogData = catalogData ? catalogData : [];
                    planData = planData ? planData : [];
                    assetData = assetData ? assetData : [];
                    serviceData = serviceData ? serviceData : [];
                    unstable_batchedUpdates(() => {
                        setCatalogList(catalogData);
                        setPlanServiceAssetCatalogList([
                            ...planData,
                            ...assetData,
                            ...serviceData
                        ]);
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

    // useEffect(() => {
    //     setRefreshServiceList(!refreshServiceList)
    // },[refreshPage])

    const data = {
        customerDetails,
        accountDetails
    }

    return (
        <>
            {
                userPermission.viewCustomer !== 'deny' && <>
                    <div className="row">
                        <div className="col">
                            <div className="page-title-box">
                                <h4 className="page-title">Customer 360</h4>
                            </div>
                        </div>
                        <div className="form-inline">
                            <span className="ml-1" >Quick Link</span>
                            <div className="switchToggle ml-1">
                                <input type="checkbox" id="quickLink" checked={isQuickLinkEnabled} onChange={() => {
                                    setIsQuickLinkEnabled(!isQuickLinkEnabled)
                                }} />
                                <label htmlFor="quickLink">Toggle</label>
                            </div>
                        </div>
                        <div className='col-auto mx-auto'>
                            <DomLink className={`btn btn-labeled btn-primary btn-sm mt-1`}
                                to={{
                                    pathname: `${process.env.REACT_APP_BASE}/customer360/preview-print`,
                                    state: {
                                        data: {
                                            isScroll: false,
                                            customerDetails,
                                            selectedAccount,
                                            accountIdList,
                                            accountNo,
                                            accountDetails,
                                            accountRealtimeDetails,
                                            newAccountAddded,
                                            userPermission,
                                            catalogList,
                                            catalogSettings,
                                            activeService,
                                            settings,
                                            planServiceAssetList,
                                            leftNavCounts,
                                            leftNavCountsComplaint,
                                            leftNavCountsInquiry,
                                        }
                                    }
                                }}>
                                <i className="fas fa-print" /><span className="btn-label" />
                                Preview and Print
                            </DomLink>
                        </div>
                    </div>
                    <div className="row mt-1">
                        <div className="col-md-12">
                            <div className="card-box">
                                <div className="d-flex"></div>
                                <div style={{ marginTop: '0px' }}>
                                    <div className="testFlex">
                                        {/* <div className="col-md-2 sticky">


                                            <div className="">
                                                <nav className="navbar navbar-default navbar-fixed-top">
                                                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">

                                                        {(customerDetails.status === "PROSPECT") ?
                                                            (<ul className="nav navbar-nav">
                                                                <li>
                                                                    <Link activeclassName="active" to="customerSection" spy={true} offset={-120} smooth={true} duration={100} >Customer</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="helpdeskSection" spy={true} offset={-120} smooth={true} duration={100} >Helpdesk History</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="complaintSection" spy={true} offset={-120} smooth={true} duration={100} >Incident History
                                                                        <span className="badge badge-primary badge-pill float-right">{(leftNavCountsComplaint && leftNavCountsComplaint.cmpCount !== undefined && leftNavCountsComplaint.cmpCount !== 0) ? leftNavCountsComplaint.cmpCount : ''}</span>
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="inquirySection" spy={true} offset={-120} smooth={true} duration={100} >Lead History
                                                                        <span className="badge badge-primary badge-pill float-right">{(leftNavCountsInquiry && leftNavCountsInquiry.inqCount !== undefined && leftNavCountsInquiry.inqCount !== 0) ? leftNavCountsInquiry.inqCount : ''}</span>
                                                                    </Link>
                                                                </li>
                                                            </ul>)
                                                            :
                                                            (<ul className="nav navbar-nav">
                                                                <li>
                                                                    <Link activeclassName="active" to="customerSection" spy={true} offset={-120} smooth={true} duration={100} >Customer</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="contractSection" spy={true} offset={-120} smooth={true} duration={100} >Contract</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="invoiceSection" spy={true} offset={-120} smooth={true} duration={100} >Invoice</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="helpdeskSection" spy={true} offset={-120} smooth={true} duration={100} >Helpdesk History</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="paymentSection" spy={true} offset={-120} smooth={true} duration={100} >Payment History</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="accountSection" spy={true} offset={-119} smooth={true} duration={100}>Accounts</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="serviceSection" spy={true} offset={-119} smooth={true} duration={100} >Services</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="workOrderSection" spy={true} offset={-119} smooth={true} duration={100} >Work Order History
                                                                        <span className="badge badge-primary badge-pill float-right">{(leftNavWoCounts && leftNavWoCounts.srCount !== undefined && leftNavWoCounts.srCount !== 0) ? leftNavWoCounts.srCount : ''}</span>
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="serviceRequestSection" spy={true} offset={-119} smooth={true} duration={100} >Order History
                                                                        <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts.srCount !== undefined && leftNavCounts.srCount !== 0) ? leftNavCounts.srCount : ''}</span>
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="complaintSection" spy={true} offset={-120} smooth={true} duration={100} >Incident History
                                                                        <span className="badge badge-primary badge-pill float-right">{(leftNavCountsComplaint && leftNavCountsComplaint.cmpCount !== undefined && leftNavCountsComplaint.cmpCount !== 0) ? leftNavCountsComplaint.cmpCount : ''}</span>
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="inquirySection" spy={true} offset={-120} smooth={true} duration={100} >Lead History
                                                                        <span className="badge badge-primary badge-pill float-right">{(leftNavCountsInquiry && leftNavCountsInquiry.inqCount !== undefined && leftNavCountsInquiry.inqCount !== 0) ? leftNavCountsInquiry.inqCount : ''}</span>
                                                                    </Link>
                                                                </li>
                                                            </ul>)}

                                                    </div>

                                                </nav>
                                            </div>
                                        </div> */}

                                        <div className={isQuickLinkEnabled ? "cust360 col-md-10":"cust360 col-md-12" }>
                                            <div className="scrollspy-div">
                                                <Element name="customerSection" className="edit-customer">
                                                    <div className="row">
                                                        <section className="triangle col-12 pb-2">
                                                            <div className="row col-12">
                                                                <div className="col-9">
                                                                    {
                                                                        (customerDetails && customerDetails.customerId) ?
                                                                            (customerDetails.customerType === 'RESIDENTIAL') ?
                                                                                <h4 id="list-item-0" className="pl-1">{customerDetails.title + " " + customerDetails.surName + " " + customerDetails.foreName} - {(customerDetails.crmCustomerNo && customerDetails.crmCustomerNo != '') ? customerDetails.crmCustomerNo : customerDetails.customerId}</h4>
                                                                                :
                                                                                <h4 id="list-item-0" className="pl-1">{customerDetails.companyName} - {(customerDetails.crmCustomerNo && customerDetails.crmCustomerNo != '') ? customerDetails.crmCustomerNo : customerDetails.customerId}</h4>
                                                                            :
                                                                            ""
                                                                    }

                                                                </div>
                                                                <div className="col-3 text-left">
                                                                    <span style={{ marginBottom: "5px", float: "right" }}>

                                                                        {userPermission &&
                                                                            <button type="button"
                                                                                className={`btn btn-labeled btn-primary btn-sm mt-1 ${((userPermission.editUser !== 'write') ? "d-none" : "")}`}
                                                                                onClick={() => { setOpenEditCustomerModal(true) }}
                                                                            >
                                                                                <i className="fas fa-edit"></i><span className="btn-label"></span>
                                                                                Edit
                                                                            </button>}&nbsp;
                                                                        <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1"
                                                                            onClick={() => { setOpenCustomerHistoryModal(true) }}
                                                                        >
                                                                            <i className="fas fa-book"></i><span className="btn-label"></span>
                                                                            History
                                                                        </button>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    {
                                                        openEditCustomerModal &&
                                                        <EditCustomerModal
                                                            data={{
                                                                customerDetails: customerDetails,
                                                                isOpen: openEditCustomerModal
                                                            }}
                                                            handler={{
                                                                setIsOpen: setOpenEditCustomerModal,
                                                                pageRefresh: customerRefreshDetails
                                                            }}
                                                        />
                                                    }
                                                    {
                                                        openCustomerHistoryModal &&
                                                        <CustomerHistory
                                                            data={{
                                                                customerData: customerDetails,
                                                                isOpen: openCustomerHistoryModal
                                                            }}
                                                            handler={{
                                                                setIsOpen: setOpenCustomerHistoryModal
                                                            }}
                                                        />
                                                    }
                                                    <div className="row pt-1">
                                                        <div className="col-md-12 row">
                                                            {/* <div className="col-md-2"><img className="mb-2 pt-2" src="./assets/images/placeholder.jpeg"></div> */}
                                                            <div className="form-row ml-0 mr-0">
                                                                <div className="form-row col-md-12 p-0 ml-0 mr-0">
                                                                    <div className="col-md-12 card-box m-0 p-0">
                                                                        {
                                                                            (customerDetails.customerType === 'RESIDENTIAL') ?
                                                                                <CustomerDetailsPreview
                                                                                    custType={customerDetails.customerType}
                                                                                    data={{
                                                                                        personalDetailsData: customerDetails,
                                                                                        customerAddress: customerDetails.address[0],
                                                                                        form: "customer360"
                                                                                    }}
                                                                                />
                                                                                :
                                                                                <></>
                                                                        }
                                                                        {
                                                                            (customerDetails.customerType === 'BUSINESS' || customerDetails.customerType === 'GOVERNMENT') ?
                                                                                <BusinessCustomerDetailsPreview
                                                                                    custType={customerDetails.customerType}
                                                                                    data={{
                                                                                        businessDetailsData: customerDetails,
                                                                                        customerAddress: customerDetails.address[0],
                                                                                        form: "customer360"
                                                                                    }} />
                                                                                :
                                                                                <></>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Element>
                                                {(customerDetails.status === "PROSPECT") ? "" :
                                                    (<Element name="attachmentSection" className="edit-customer">
                                                        <div className="row col-12 p-0">
                                                            <div className="row mt-2 col-12 p-0">
                                                                <section className="triangle col-12">
                                                                    <div className="row col-12">
                                                                        <div className="col-6">
                                                                            <h5 className="pl-1">Attachments</h5>
                                                                            {/* <h4 id="list-item-4" className="pl-1">Attachments</h4> */}
                                                                        </div>
                                                                        <div className="col-6 p-1 cus-act add-new">

                                                                            <span className='act-btn' style={{ float: "right" }} >
                                                                                {userPermission &&
                                                                                    <button type="button" className={`btn btn-primary btn-sm waves-effect waves-light ${((userPermission.addAttachment !== 'write') ? "d-none" : "")}`} onClick={() => { setOpenAddAttachmentModal(true) }}>Add New</button>}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </section>
                                                            </div>
                                                            <div className="row pl-2 col-12">
                                                                {
                                                                    customerDetails && customerDetails?.customerId &&
                                                                    <FileDownload
                                                                        data={{
                                                                            entityType: "CUSTOMER",
                                                                            entityId: customerDetails?.customerId,
                                                                            refresh: pageRefreshHandlers?.attachmentRefresh
                                                                        }}
                                                                    />
                                                                }
                                                            </div>
                                                            {
                                                                openAddAttachmentModal &&
                                                                <CustomerUploadAttachment
                                                                    data={{
                                                                        customerDetails: customerDetails,
                                                                        isOpen: openAddAttachmentModal
                                                                    }}
                                                                    handler={{
                                                                        setIsOpen: setOpenAddAttachmentModal,
                                                                        pageRefresh: handleAttachmentRefresh
                                                                    }}
                                                                />
                                                            }
                                                        </div>
                                                    </Element>)}
                                                {(customerDetails.status === "PROSPECT") ? "" :
                                                    (<Element name="contractSection" className="edit-customer">
                                                        <div className="row col-12 p-0">
                                                            <div className="row mt-2 col-12 p-0">
                                                                <section className="triangle col-12">
                                                                    <div className="row col-12">
                                                                        <div className="col-12">
                                                                            <h5 className="pl-3">Contract</h5>
                                                                            {/* <h4 id="list-item-4" className="pl-1">Contract/h4> */}
                                                                        </div>
                                                                    </div>
                                                                </section>
                                                            </div>
                                                            <div className="col-12">
                                                                {
                                                                    selectedAccount && selectedAccount?.accountNo ?
                                                                        <SearchContract
                                                                            data={{
                                                                                data: { billRefNo: selectedAccount?.accountNo },
                                                                                hideForm: true,
                                                                                contractType: "billed",
                                                                                refresh: pageRefreshHandlers.contractInvoicePaymentRefresh,
                                                                                from: "Customer360"
                                                                            }}
                                                                            handler={{
                                                                                pageRefresh: handleContractInvoicePaymentRefresh
                                                                            }}
                                                                        />
                                                                        :
                                                                        <span className="msg-txt pt-1">No Contracts Available</span>
                                                                }
                                                            </div>
                                                        </div>
                                                    </Element>)}
                                                    {(customerDetails.status === "PROSPECT") ? "" :
                                               (<Element name="unbilledContractSection" className="edit-customer">
                                                    <div className="row col-12 p-0">
                                                        <div className="row mt-2 col-12 p-0">
                                                            <section className="triangle col-12">
                                                                <div className="row col-12">
                                                                    <div className="col-12">
                                                                        <h5 className="pl-3">Unbilled Contract</h5>
                                                                        {/* <h4 id="list-item-4" className="pl-1">Contract/h4> */}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        </div>
                                                        <div className="col-12">
                                                            {
                                                                selectedAccount && selectedAccount?.accountNo ?
                                                                    <SearchContract
                                                                        data={{
                                                                            data: { billRefNo: selectedAccount?.accountNo },
                                                                            hideForm: true,
                                                                            contractType: "unbilled",
                                                                            refresh: pageRefreshHandlers.contractInvoicePaymentRefresh,
                                                                            from: "Customer360"
                                                                        }}
                                                                        handler={{
                                                                            pageRefresh: handleContractInvoicePaymentRefresh
                                                                        }}
                                                                    />
                                                                    :
                                                                    <span className="msg-txt pt-1">No Contracts Available</span>
                                                            }
                                                        </div>
                                                    </div>
                                                </Element>)}
                                                {(customerDetails.status === "PROSPECT") ? "" :
                                                (<Element name="contractHistorySection" className="edit-customer">
                                                    <div className="row col-12 p-0">
                                                        <div className="row mt-2 col-12 p-0">
                                                            <section className="triangle col-12">
                                                                <div className="row col-12">
                                                                    <div className="col-12">
                                                                        <h5 className="pl-3">Contract History</h5>
                                                                        {/* <h4 id="list-item-4" className="pl-1">Contract/h4> */}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        </div>
                                                        <div className="col-12">
                                                            {
                                                                selectedAccount && selectedAccount?.accountNo ?
                                                                    <SearchContract
                                                                        data={{
                                                                            data: { billRefNo: selectedAccount?.accountNo },
                                                                            hideForm: true,
                                                                            contractType: "history",
                                                                            refresh: pageRefreshHandlers.contractInvoicePaymentRefresh,
                                                                            from: "Customer360"
                                                                        }}
                                                                        handler={{
                                                                            pageRefresh: handleContractInvoicePaymentRefresh
                                                                        }}
                                                                    />
                                                                    :
                                                                    <span className="msg-txt pt-1">No Contracts Available</span>
                                                            }
                                                        </div>
                                                    </div>
                                                </Element>)}
                                                {(customerDetails.status === "PROSPECT") ? "" :
                                                (<Element name="invoiceSection" className="edit-customer">
                                                    <div className="row col-12 p-0">
                                                        <div className="row mt-2 col-12 p-0">
                                                            <section className="triangle col-12">
                                                                <div className="row col-12">
                                                                    <div className="col-12">
                                                                        <h5 className="pl-3">Invoice</h5>
                                                                        {/* <h4 id="list-item-4" className="pl-1">Contract/h4> */}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        </div>
                                                        <div className="col-12">
                                                            {
                                                                selectedAccount && selectedAccount?.accountNo ?
                                                                    <SearchInvoice
                                                                        data={{
                                                                            data: { billRefNo: selectedAccount?.accountNo },
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
                                                </Element>)}
                                                <Element name="helpdeskSection" className="edit-customer">
                                                    <div className="row col-12 p-0">
                                                        <div className="row mt-2 col-12 p-0">
                                                            <section className="triangle col-12">
                                                                <div className="row col-12">
                                                                    <div className="col-12">
                                                                        <h5 className="pl-3">Helpdesk History</h5>
                                                                        {/* <h4 id="list-item-4" className="pl-1">Contract/h4> */}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        </div>
                                                        <div className="col-12 p-1">
                                                            {
                                                                customerDetails?.customerId &&
                                                                <HelpdeskHistory data={{ customerId: customerDetails?.customerId }} />
                                                            }
                                                        </div>
                                                    </div>
                                                </Element>
                                                {(customerDetails.status === "PROSPECT") ? "" :
                                                (<Element name="paymentSection" className="edit-customer">
                                                    <div className="row col-12 p-0">
                                                        <div className="row mt-2 col-12 p-0">
                                                            <section className="triangle col-12">
                                                                <div className="row col-12">
                                                                    <div className="col-12">
                                                                        <h5 className="pl-3">Payment History</h5>
                                                                        {/* <h4 id="list-item-4" className="pl-1">Contract/h4> */}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        </div>
                                                        <div className="col-12 p-1">
                                                            {
                                                                selectedAccount && selectedAccount?.accountNo ?
                                                                    <PaymentHistory
                                                                        data={{
                                                                            data: selectedAccount?.accountNo,
                                                                            refresh: pageRefreshHandlers.contractInvoicePaymentRefresh
                                                                        }}
                                                                    />
                                                                    :
                                                                    <span className="msg-txt pt-1">No Payment History Available</span>
                                                            }
                                                        </div>
                                                    </div>
                                                </Element>)}
                                                {(customerDetails.status === "PROSPECT") ? "" :
                                                (<Element name="accountSection" className="edit-customer">
                                                    <section className="triangle col-md-12" ref={accountRef}>
                                                        <div className="row col-md-12">
                                                            <div className="col-md-8">
                                                                <h5 className="pl-1">Accounts</h5>
                                                            </div>
                                                            <div className="col-md-3 cus-act">
                                                                <span className="act-btn float-right">
                                                                    {/* <button type="button" onClick={() => setAccOpenModal(true)} className="btn btn-labeled btn-primary btn-sm mt-1" data-toggle="modal" data-target="#myModal">
                                                                <span className="btn-label"><i className="fa fa-plus"></i></span>Add Account
                                                            </button> */}
                                                                </span>
                                                                <div>
                                                                    <Modal isOpen={openAccModal}>
                                                                        <NewCustomerBkp
                                                                            customerDetails={customerDetails}
                                                                            setNewAccountAdded={setNewAccountAdded}
                                                                            customerType={customerDetails.customerType}
                                                                            sourceName={'new_account'}

                                                                        />
                                                                        {/* <NewCustomerAccount customerType={customerDetails.customerType} /> */}
                                                                        <button className="close-btn" onClick={() => setAccOpenModal(false)} >&times;</button>
                                                                    </Modal>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                    <div className="pt-1">
                                                        {
                                                            (accountIdList && accountIdList.length > 0) ?
                                                                <div>
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            <Tabs defaultActiveKey={accountNo} type="card">
                                                                                {
                                                                                    accountIdList.map((e) => {
                                                                                        return (
                                                                                            <TabPane
                                                                                                tab={
                                                                                                    <div className="account-sec">
                                                                                                        <div className="nav nav-tabs">
                                                                                                            <div id={e?.accountId} key={e?.accountId} className={"nav-item pl-0 " + ((e?.accountId === selectedAccount?.accountId) ? "active" : "")}>
                                                                                                                <button key={e?.accountId} className={"nav-link font-17 bolder " + ((e?.accountId === selectedAccount?.accountId) ? "active" : "")} role="tab"
                                                                                                                    onClick={(evnt) => handleAccountSelect(evnt, e)}
                                                                                                                >
                                                                                                                    {/* onClick={(evnt) => handleAccountSelect(evnt, e)} */}
                                                                                                                    <div className="tabs" style={(e?.accountId === selectedAccount?.accountId) ? { color: "orange" } : {}}>Account&nbsp;{(e?.status === 'PENDING') ? 'Pending' : (e?.accountNo) ? e?.accountNo : e?.accountId + ' (Id)'}</div>
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                }
                                                                                                key={Number(e?.accountNo)}
                                                                                            >
                                                                                                <div className="bg-light  p-2">
                                                                                                    <div className="form-row bg-light ml-0 mr-0">
                                                                                                        <div className="form-row border col-md-12 p-0 ml-0 mr-0">
                                                                                                            <div className="col-md-12 card-box m-0 p-0">
                                                                                                                {
                                                                                                                    (accountDetails && accountDetails?.accountId && accountDetails?.accountId !== '' && userPermission) ?
                                                                                                                        <AccountDetailsView
                                                                                                                            data={{
                                                                                                                                userPermission: userPermission?.editAccount,
                                                                                                                                customerType: customerDetails?.customerType,
                                                                                                                                billableDetails: customerDetails?.billableDetails,
                                                                                                                                accountData: accountDetails,
                                                                                                                                accountRealtimeDetails: accountRealtimeDetails,
                                                                                                                                newAccountAddded: newAccountAddded,
                                                                                                                                setNewAccountAdded: setNewAccountAdded,
                                                                                                                                openBillHistoryModal,
                                                                                                                                setOpenBillHistoryModal,
                                                                                                                                pageRefresh: handleAccountRefresh
                                                                                                                            }}
                                                                                                                        />
                                                                                                                        :
                                                                                                                        <></>
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </TabPane>
                                                                                        )
                                                                                    })
                                                                                }
                                                                            </Tabs>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                :
                                                                <span className="msg-txt p-1">No Accounts Available</span>
                                                        }
                                                    </div>
                                                </Element>)}
                                                {(customerDetails.status === "PROSPECT") ? "" :
                                                (<Element name="serviceSection" className="edit-customer">
                                                    <section className="triangle col-md-12" ref={serviceRef}>
                                                        <div className="row col-md-12">
                                                            <div className="col-md-8">
                                                                <h5 className="pl-1">Services</h5>
                                                            </div>
                                                            <div className="col-md-3 cus-act">
                                                                <span className="act-btn float-right">
                                                                    {userPermission &&
                                                                        <button type="button" onClick={() => props.history.push(`${process.env.REACT_APP_BASE}/new-service-account`, {data})/*setServiceOpenModal(true)*/}
                                                                            className={`btn btn-labeled btn-primary btn-sm mt-1 ${((userPermission.addService !== 'write') ? "d-none" : "")}`}
                                                                            data-toggle="modal" data-target="#myModal">
                                                                            <span className="btn-label"><i className="fa fa-plus"></i></span>Add Service
                                                                        </button>}
                                                                </span>
                                                                <div>

                                                                    <Modal isOpen={openSerModal} >
                                                                        {/* <NewCustomerAccount /> */}

                                                                        <NewCustomerBkp
                                                                            customerType={customerDetails.customerType}
                                                                            customerDetails={customerDetails}
                                                                            accountDetails={accountDetails}
                                                                            newServiceAddded={newServiceAddded}
                                                                            selectedAccount={selectedAccount}
                                                                            sourceName={'new_service'}
                                                                            setNewServiceAdded={setNewServiceAdded}
                                                                            data={{
                                                                                customerType: customerDetails.customerType,
                                                                                customerDetails: customerDetails,
                                                                                accountDetails: accountDetails,
                                                                                newServiceAddded: newServiceAddded
                                                                            }}
                                                                            statusHandler={
                                                                                {
                                                                                    setNewServiceAdded: setNewServiceAdded
                                                                                }
                                                                            }

                                                                        />
                                                                        {/* <NewCustomerService customerType={customerDetails.customerType} selectedAccount={selectedAccount} /> */}
                                                                        <button className="close-btn" onClick={() => setServiceOpenModal(false)} >&times;</button>
                                                                    </Modal>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                    <div className="row col-12 p-2">
                                                        <div className="col-12 bg-light border">
                                                            <div className="row">
                                                                <div className="col-6">
                                                                    <h5 className="text-primary">Catalogs</h5>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="card">
                                                        <div className="card-body">

                                                            {
                                                                !!catalogList?.length ?
                                                                    <div className="bg-secondary p-1">
                                                                        <Slider {...catalogSettings} className="px-4">
                                                                            {
                                                                                catalogList.map((catalog, idx) =>
                                                                                    <CatalogCard data={catalog} handleOnManageService={handleOnManageService} key={activeService || idx} activeService={activeService} setActiveService={setActiveService} />
                                                                                )
                                                                            }
                                                                        </Slider>
                                                                    </div>
                                                                    :
                                                                    <span className="msg-txt">No Catalog Available</span>
                                                            }

                                                        </div>
                                                    </div>
                                                    <div className="row col-12 p-2">
                                                        <div className="col-12 bg-light border">
                                                            <div className="row">
                                                                <div className="col-6">
                                                                    <h5 className="text-primary">Plans, Services & Assets</h5>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="py-2">
                                                        <Slider {...settings} className="px-4">
                                                            {
                                                                !!planServiceAssetList.length ?
                                                                    planServiceAssetList.map((data, idx) =>
                                                                        <PlanServiceAssetCard data={data} handleOnManageService={handleOnManageService} key={activeService || idx} activeService={activeService} setActiveService={setActiveService} />
                                                                    )
                                                                    :
                                                                    <span className="msg-txt">No Plan, Services & Assets Available</span>
                                                            }
                                                        </Slider>
                                                    </div>
                                                    {
                                                        isManageServicesOpen &&
                                                        <ManageService
                                                            data={{
                                                                selectedAccount,
                                                                isManageServicesOpen,
                                                                manageServiceRef
                                                            }}
                                                            handlers={{
                                                                setIsManageServicesOpen,
                                                                pageRefresh: handleServiceRefresh
                                                            }}
                                                        />
                                                    }
                                                </Element>)}
                                                <Modal isOpen={serviceModal.state}>
                                                    <ServiceFullView
                                                        data={{
                                                            customerType: customerDetails.customerType,
                                                            selectedAccount: selectedAccount,
                                                            serviceDetails: servicesList[selectedService.idx],
                                                            customerAddress: customerDetails.hasOwnProperty('address') && customerDetails.address[0],
                                                            connectionStatusLookup: connectionStatusLookup
                                                        }}
                                                        handler={{
                                                            handleServicePopupClose: handleServicePopupClose,
                                                            setServicesList: setServicesList,
                                                            setRefreshServiceList: setRefreshServiceList,
                                                            setRefreshServiceRequest: setRefreshServiceRequest,
                                                            setRefreshPage: setRefreshPage
                                                        }}
                                                    />
                                                </Modal>

                                                {(customerDetails.status === "PROSPECT") ? "" :
                                               (<Element name="workOrderSection" className="edit-customer">
                                                    <section className="triangle col-md-12">
                                                        <div className="tit-his row col-md-12">
                                                            <div className="col-md-8">
                                                                <h5 className="pl-1">Work Order History</h5>
                                                            </div>
                                                            <div className="col-md-3 mt-1  cus-act">
                                                                <span className="act-btn" style={{ float: "right" }}><button type="button" style={{ float: "right" }} className="btn btn-sm btn-primary p-1" onClick={() => { setRefreshServiceRequest(!refreshServiceRequest) }}>Refresh</button></span>
                                                            </div>
                                                        </div>
                                                    </section>
                                                    <div className="col-md-12 pl-2 pr-2 pt-2 pb-1">
                                                        <div className="form-row ml-0 mr-0">
                                                            <div className="form-row col-md-12 p-0 ml-0 mr-0">
                                                                <div className="col-md-12 m-0 p-0">
                                                                    {
                                                                        customerDetails?.customerId && selectedAccount?.accountId &&
                                                                        <WorkOrderList
                                                                            data={{
                                                                                customerDetails: {
                                                                                    ...customerDetails,
                                                                                    accountId: selectedAccount?.accountId
                                                                                },
                                                                                leftNavCounts: leftNavWoCounts,
                                                                            }}
                                                                            handler={{
                                                                                setLeftNavCounts: setLeftNavWoCounts
                                                                            }}
                                                                        />
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Element>)}
                                                {(customerDetails.status === "PROSPECT") ? "" :
                                               (<Element name="serviceRequestSection" className="edit-customer">
                                                    <section className="triangle col-md-12">
                                                        <div className="tit-his row col-md-12">
                                                            <div className="col-md-8">
                                                                <h5 className="pl-1">Request History</h5>
                                                            </div>
                                                            <div className="col-md-3 mt-1  cus-act">
                                                                <span className="act-btn" style={{ float: "right" }}><button type="button" style={{ float: "right" }} className="btn btn-sm btn-primary p-1" onClick={() => { setRefreshServiceRequest(!refreshServiceRequest) }}>Refresh</button></span>
                                                            </div>
                                                        </div>
                                                    </section>
                                                    <div className="col-md-12 pl-2 pr-2 pt-2 pb-1">
                                                        <div className="form-row ml-0 mr-0">
                                                            <div className="form-row col-md-12 p-0 ml-0 mr-0">
                                                                <div className="col-md-12 m-0 p-0">
                                                                    <ServiceRequestList
                                                                        data={{
                                                                            customerDetails: customerDetails,
                                                                            leftNavCounts: leftNavCounts,
                                                                            refreshServiceRequest: refreshServiceRequest,
                                                                            selectedAccount: selectedAccount,
                                                                            activeService: activeService
                                                                        }}

                                                                        handler={{
                                                                            setLeftNavCounts: setLeftNavCounts
                                                                        }}
                                                                    />

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Element>)}
                                                <Element name="complaintSection" className="edit-customer">
                                                    <section className="triangle col-md-12">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-8">
                                                                <h5 className="pl-1">Incident History</h5>
                                                            </div>
                                                            <div className="col-md-3 align-items-right">

                                                                <button type="button" className="btn btn-sm btn-primary p-1 mr-2"
                                                                    onClick={() => { setRefreshComplaint(!refreshComplaint) }}>
                                                                    Refresh
                                                                </button>

                                                                {userPermission && customerDetails.status != 'PROSPECT' && <button type="button"
                                                                    className={`btn btn-sm btn-primary p-1 ${((userPermission.addComplaint !== 'write') ? "d-none" : "")}`}

                                                                    onClick={() => {

                                                                        // console.log(selectedAccount.customerId, selectedAccount.accountId, selectedAccount.accountNo, activeService)

                                                                        if (!selectedAccount || !selectedAccount?.customerId || !selectedAccount?.accountId || !selectedAccount?.accountNo || selectedAccount?.accountNo === null) {
                                                                            toast.error('Cannot create Incident as Account Number is not available')
                                                                            return false
                                                                        }

                                                                        if (!activeService) {
                                                                            toast.error('Please select a service first to create an Incident')
                                                                            return false
                                                                        }

                                                                        let svcDetails = catalogList.find((s) => (Number(s?.connectionId) === Number(activeService)))
                                                                        if (!svcDetails) {
                                                                            svcDetails = planServiceAssetList.find((s) => (Number(s?.connectionId) === Number(activeService)))
                                                                        }

                                                                        if (svcDetails.status === 'PENDING') {
                                                                            toast.error('Incident cannot be created when service is in PENDING status')
                                                                            return false
                                                                        }
                                                                        const accountName = accountDetails && `${accountDetails?.foreName} ${accountDetails?.surName}`.trim()
                                                                        return props.history.push(`${process.env.REACT_APP_BASE}/create-complaint`, {
                                                                            data: {
                                                                                customerId: selectedAccount?.customerId,
                                                                                accountId: selectedAccount?.accountId,
                                                                                accountNo: selectedAccount.accountNo,
                                                                                accountName: accountName ? accountName : '-',
                                                                                accountContactNo: accountDetails?.contactNbr,
                                                                                accountEmail: accountDetails?.email,
                                                                                serviceId: svcDetails?.connectionId,
                                                                                serviceType: svcDetails?.serviceType,
                                                                                accessNumber: svcDetails?.identificationNo,//access number hard coded here.
                                                                                kioskRefId: (kioskRefNo !== null) ? kioskRefNo : null,
                                                                                type: 'Complaint'
                                                                            }
                                                                        })
                                                                    }
                                                                    }>
                                                                    Create Incident
                                                                </button>}

                                                            </div>
                                                        </div>
                                                    </section>
                                                    <div className="col-md-12 pl-2 pr-2 pt-2 pb-1">
                                                        <div className="form-row ml-0 mr-0">
                                                            <div className="form-row col-md-12 p-0 ml-0 mr-0">
                                                                <div className="col-md-12 m-0 p-0">
                                                                    <ComplaintList
                                                                        data={{
                                                                            customerDetails: customerDetails,
                                                                            leftNavCounts: leftNavCountsComplaint,
                                                                            refreshComplaint: refreshComplaint,
                                                                            selectedAccount: selectedAccount,
                                                                            activeService: activeService
                                                                        }}


                                                                        handler={{
                                                                            setLeftNavCounts: setLeftNavCountsComplaint
                                                                        }}
                                                                    />

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Element>
                                                <Element name="inquirySection" className="edit-customer">
                                                    <section className="triangle col-md-12">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-8">
                                                                <h5 className="pl-1">Lead History</h5>
                                                            </div>
                                                            <div className="col-md-3 align-items-right">

                                                                <button type="button" className="btn btn-sm btn-primary p-1 mr-2"
                                                                    onClick={() => { setRefreshInquiry(!refreshInquiry) }}>
                                                                    Refresh
                                                                </button>
                                                                {userPermission && customerDetails.status != 'PROSPECT' &&
                                                                    <button type="button"
                                                                        className={`btn btn-sm btn-primary p-1 ${((userPermission.addInquiry !== 'write') ? "d-none" : "")}`}

                                                                        onClick={() => {

                                                                            if (!selectedAccount || !selectedAccount?.customerId || !selectedAccount?.accountId || !selectedAccount?.accountNo || selectedAccount?.accountNo === null) {
                                                                                toast.error('Cannot create Lead as Account Number is not available')
                                                                                return false
                                                                            }

                                                                            if (!activeService) {
                                                                                toast.error('Please select a service first to create an Lead')
                                                                                return false
                                                                            }

                                                                            let svcDetails = catalogList.find((s) => (Number(s?.connectionId) === Number(activeService)))
                                                                            if (!svcDetails) {
                                                                                svcDetails = planServiceAssetList.find((s) => (Number(s?.connectionId) === Number(activeService)))
                                                                            }

                                                                            if (svcDetails.status === 'PENDING') {
                                                                                toast.error('Lead cannot be created when service is in PENDING status')
                                                                                return false
                                                                            }

                                                                            props.history.push(`${process.env.REACT_APP_BASE}/create-inquiry-new-customer`
                                                                                , {
                                                                                    data: {
                                                                                        sourceName: 'customer360',
                                                                                        accessNumber: svcDetails?.identificationNo,//access number hard coded here.
                                                                                        kioskRefId: (kioskRefNo !== null) ? kioskRefNo : null
                                                                                    }
                                                                                })
                                                                        }
                                                                        }>
                                                                        Create Lead
                                                                    </button>}
                                                            </div>
                                                        </div>

                                                    </section>
                                                    <div className="col-md-12 pl-2 pr-2 pt-2 pb-1">
                                                        <div className="form-row ml-0 mr-0">
                                                            <div className="form-row col-md-12 p-0 ml-0 mr-0">
                                                                <div className="col-md-12 m-0 p-0">
                                                                    <InquiryList
                                                                        data={{
                                                                            customerDetails: customerDetails,
                                                                            leftNavCounts: leftNavCountsInquiry,
                                                                            refreshInquiry: refreshInquiry,
                                                                            selectedAccount: selectedAccount,
                                                                            activeService: activeService
                                                                        }}

                                                                        handler={{
                                                                            setLeftNavCounts: setLeftNavCountsInquiry
                                                                        }}
                                                                    />

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Element>
                                            </div>
                                        </div>
                                        {isQuickLinkEnabled && <div className="col-md-2 sticky">
                                            <div className="">
                                                <nav className="navbar navbar-default navbar-fixed-top">
                                                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                                        <ul className="nav navbar-nav">
                                                            {quickLinks && quickLinks.map((e) => (
                                                                handleQuickLinks(e)
                                                            ))}
                                                        </ul>

                                                        {/*   {(customerDetails.status === "PROSPECT") ?
                                                            (<ul className="nav navbar-nav">
                                                                <li>
                                                                    <Link activeclassName="active" to="customerSection" spy={true} offset={-120} smooth={true} duration={100} >Customer</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="helpdeskSection" spy={true} offset={-120} smooth={true} duration={100} >Helpdesk History</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="complaintSection" spy={true} offset={-120} smooth={true} duration={100} >Incident History
                                                                        <span className="badge badge-primary badge-pill float-right">{(leftNavCountsComplaint && leftNavCountsComplaint.cmpCount !== undefined && leftNavCountsComplaint.cmpCount !== 0) ? leftNavCountsComplaint.cmpCount : ''}</span>
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="inquirySection" spy={true} offset={-120} smooth={true} duration={100} >Lead History
                                                                        <span className="badge badge-primary badge-pill float-right">{(leftNavCountsInquiry && leftNavCountsInquiry.inqCount !== undefined && leftNavCountsInquiry.inqCount !== 0) ? leftNavCountsInquiry.inqCount : ''}</span>
                                                                    </Link>
                                                                </li>
                                                            </ul>)
                                                            :
                                                            (<ul className="nav navbar-nav">
                                                                
                                                                 <li>
                                                                    <Link activeclassName="active" to="customerSection" spy={true} offset={-120} smooth={true} duration={100} >Customer</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="contractSection" spy={true} offset={-120} smooth={true} duration={100} >Contract</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="invoiceSection" spy={true} offset={-120} smooth={true} duration={100} >Invoice</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="helpdeskSection" spy={true} offset={-120} smooth={true} duration={100} >Helpdesk History</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="paymentSection" spy={true} offset={-120} smooth={true} duration={100} >Payment History</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="accountSection" spy={true} offset={-119} smooth={true} duration={100}>Accounts</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="serviceSection" spy={true} offset={-119} smooth={true} duration={100} >Services</Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="serviceRequestSection" spy={true} offset={-119} smooth={true} duration={100} >Order History
                                                                        <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts.srCount !== undefined && leftNavCounts.srCount !== 0) ? leftNavCounts.srCount : ''}</span>
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="complaintSection" spy={true} offset={-120} smooth={true} duration={100} >Incident History
                                                                        <span className="badge badge-primary badge-pill float-right">{(leftNavCountsComplaint && leftNavCountsComplaint.cmpCount !== undefined && leftNavCountsComplaint.cmpCount !== 0) ? leftNavCountsComplaint.cmpCount : ''}</span>
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link activeclassName="active" to="inquirySection" spy={true} offset={-120} smooth={true} duration={100} >Lead History
                                                                        <span className="badge badge-primary badge-pill float-right">{(leftNavCountsInquiry && leftNavCountsInquiry.inqCount !== undefined && leftNavCountsInquiry.inqCount !== 0) ? leftNavCountsInquiry.inqCount : ''}</span>
                                                                    </Link>
                                                                </li> 
                                                        </ul>)}*/}

                                                    </div>

                                                </nav>
                                            </div>
                                        </div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
        </>
    )
}
export default Customer360;
