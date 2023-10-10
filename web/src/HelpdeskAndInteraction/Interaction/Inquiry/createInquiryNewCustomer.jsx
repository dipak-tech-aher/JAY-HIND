import React, { useState, useRef, useEffect, useContext } from 'react'
import { useTranslation } from "react-i18next";
import { Link, Element } from 'react-scroll'
import { toast } from "react-toastify";
import { string, object } from "yup";
import { get, post, put } from "../../../common/util/restUtil";
import { properties } from "../../../properties";

import CreateCustomerInquiryDetailsForm from './createCustomerInquiryForm';

import NewCustomerEnquiryPreview from './newCustomerInquiryPreview';
import CustomerInquiryList from './getCustomerInquiryList';
import NewCustomerBusinessInquiryPreview from './newCustomerBusinessInquiryPreview';
import NewCustomerBusinessInquiryForm from './newCustomerBusinessInquiryForm';
import InquiryDetailsForm from './inquiryDetailsForm';
import InquiryDetailsPreview from './inquiryDetailsPreview'
import KioskRefUI from './kioskRefUI';
import FileUpload from '../../../common/uploadAttachment/fileUpload';
import { useHistory } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'
import { AppContext } from "../../../AppContext";
import { getServiceCategoryMappingBasedOnProdType } from '../../../common/util/util';

const createInquiryFromValidationSchema = object().shape({
    customerName: string().required("Customer name is required"),
    contactPreference: string().required("Contact Preference is required"),
    customerType: string().required("Customer type is required"),
    email: string().required("Email is required").email("Email is not in correct format"),
    contactNbr: string().required("Contact Number is required")
});

const inquiryDetailsFromValidationSchema = object().shape({
    inquiryAbout: string().required("Inquiry About is required"),
    ticketChannel: string().required("Ticket Channel is required"),
    ticketSource: string().required("Ticket Source is required"),
    ticketPriority: string().required("Ticket Priority is required"),
    serviceType: string().required("Service Type is required"),
    productOrServices: string().required("Inquiry Category is required")
});

const businessCustomerInquiryFromValidationSchema = object().shape({
    companyName: string().required("Company name is required"),
    //remark: string().required("Remark is required"),
    contactPreference: string().required("Contact Preference is required"),
    customerCategory: string().required("Category is required"),
    serviceType: string().required("Service type is required"),
    email: string().required("Email is required").email("Email is not in correct format"),
    productEnquired: string().required("Product enquired type is required"),
    contactNbr: string().required("Contact Number is required")
});


const validateDateFormat = (value) => {
    try {
        Date.parse(value)
        return true
    } catch (e) {
        return false
    }
}


function CreateEnquireNewCustomer(props) {
    const { auth } = useContext(AppContext);
    const userLocation = auth.user.location;

    let switchStatus = 'hide'
    let customerSerchHide = 'show'
    let isExsitingCustomerStatus = false
    let accNo = null
    const { t } = useTranslation();
    const history = useHistory();

    const [customerDetailsError, setCustomerDetailsError] = useState({});
    const [inquiryDetailsError, setInquiryDetailsError] = useState({});
    const [viewMode, setViewMode] = useState({ mode: 'Create_New' })
    const [newcustomerId, setCustomerId] = useState({ customerId: '' })


    if (props.location.data !== undefined) {
        if (props.location.data.sourceName === 'fromDashboard') {
            switchStatus = 'hide'
            customerSerchHide = 'show'
        }
        else if (props.location.data.sourceName === 'customer360') {
            accNo = props.location.state.data.accessNumber
            isExsitingCustomerStatus = true
        }
        else {
            accNo = null
        }
    }
    if (props.location.state !== undefined) {
        if (props.location.state.data.sourceName === 'fromKiosk') {
            switchStatus = 'show'
        }
        if (props.location.state.data.customerType === 'New') {
            customerSerchHide = 'hide'
        }
        else {
            customerSerchHide = 'show'
        }
    }
    const [accessNumber, setAccessNumber] = useState(accNo)
    const [switchToExistingCustomer, setSwitchToExistingCustomer] =
        useState({
            isExsitingCustomer: false
        })

    const [renderMode, setRenderMode] = useState({
        customerTypeSelection: 'hide',
        customerDetails: 'form',
        customerDetailsPreview: 'hide',
        previewButton: 'show',
        submitButton: 'show',
        cancelButton: 'hide',
        kioskCancelButton: switchStatus,
        customerDetailsEditButton: 'show',
        kioskEnable: switchStatus,
        createLeadButton: 'show',
        createCustomerButton: 'show'
    })

    const newCustomerData = useRef({})
    const newInquiryData = useRef({})

    const [newCustomerDetails, setNewCustomerInquiryDetails] = useState({})

    const [selectedCustomerType, setSelectedCustomerType] = useState('RESIDENTIAL')

    const [customerType, setCustomerType] = useState('')

    const [inquiryData, setInquiryData] = useState(null)

    const [serviceNumber, setServiceNumber] = useState({
        serviceNo: ""
    })

    const [personalInquireData, setCustomerInquiryData] = useState({
        customerName: '',
        customerType: "",
        serviceType: '',
        serviceTypeDesc: '',
        productEnquired: '',
        email: '',
        contactPreference: '',
        contactPreferenceDesc: '',
        contactNbr: '',
        remark: ''
    });

    const [customerbusinessInquireData, setCustomerBusinessInquiryData] = useState({
        companyName: '',
        customerType: '',
        serviceType: '',
        serviceTypeDesc: '',
        productEnquired: '',
        email: '',
        contactPreference: '',
        contactPreferenceDesc: '',
        contactNbr: '',
        remark: ''
    });

    const [inquiryDataDetails, setInquiryDataDetails] = useState({
        inquiryAbout: '',
        inquiryAboutDesc: '',
        ticketChannel: '',
        ticketChannelDesc: '',
        ticketPriority: '',
        ticketPriorityDesc: '',
        ticketSource: '',
        ticketSourceDesc: '',
        serviceType: '',
        serviceTypeDesc: '',
        productOrServices: '',
        productOrServicesDesc: '',
        problemCause: '',
        problemCauseDesc: '',
        remark: '',
        ticketUserLocation: userLocation,
        serviceCategory: ''
    })

    const [saveSearchResultData, setSaveSearchResultData] = useState()

    //lookup data assigment
    // const serviceTypeLookup = [
    //     { code: 'Postpaid', description: 'Postpaid' },
    //     { code: 'Prepaid', description: 'Prepaid' },
    //     { code: 'Fixed', description: 'Fixed' },
    //     { code: 'Fixed Broadband', description: 'Fixed Broadband' },
    //     { code: 'Booster', description: 'Booster' }
    // ]

    // const lookupInquiryAbout = [

    //     { code: 'fixed', description: 'Billing' },
    //     { code: 'Prepaid', description: 'Budget' },
    //     { code: 'postpaid', description: 'Data Usage' },
    //     { code: 'Rewards', description: 'Rewards' },
    //     { code: 'SelfCare', description: 'Self Care' },
    //     { code: 'VAS', description: 'Value Added Service' }
    // ]

    const lookupTicketchannel = [
        { code: 'Roadshow', description: 'Roadshow' },
        { code: 'Walkin', description: 'Walkin' },
        { code: 'Email', description: 'Email' },
        { code: 'Center', description: 'Center' },
        { code: 'SocialMedia', description: 'Social Media' }
    ]


    const lookupTicketSource = [
        { code: 'Customer', description: 'Customer' },
        { code: 'staff', description: 'Staff' },
        { code: 'others', description: 'Others' }
    ]

    const lookupCause = [
        { code: 'cause1', description: 'Cause1' },
        { code: 'cause2', description: 'Cause2' },
        { code: 'cause3', description: 'Cause3' }
    ]


    const lookupData = useRef({})
    const serviceTypeRef = useRef()
    const statusPendingOrPDCheckRef = useRef(false)
    const [categoryLookup, setCategoryLookup] = useState([{}])
    const [inquiryCategoryLookup, setinquiryCategoryLookup] = useState([{}])
    const [ticketPriority, setTicketPriority] = useState([{}])
    const [classLookup, setClassLookup] = useState([{}])
    const [contactTypeLookup, setContactTypeLookup] = useState([{}])
    const [ticketChannel, setTicketChannelLookup] = useState([{}])
    const [ticketSource, setTicketSourceLookup] = useState([{}])
    const [problemCause, setProblemCauseLookup] = useState([{}])
    const [lookupInquiryAbout, setInquiryAboutLookUp] = useState([{}])
    const [serviceTypeLookup, setServiceTypeLookup] = useState([])
    const [productOrServicesLookup, setProductOrServicesLookup] = useState([])
    const [currentFiles, setCurrentFiles] = useState([])
    const [customerTypes, setCustomerTypes] = useState([])
    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(false)
    const [quickLinks, setQuickLinks] = useState([{}])


    useEffect(() => {
        if (switchToExistingCustomer.isExsitingCustomer) {
            setViewMode({ ...viewMode, mode: 'Create_Existing' })
            setCustomerInquiryData({
                ...personalInquireData,
                customerName: '',
                customerType: '',

                serviceType: '',
                serviceTypeDesc: '',
                productEnquired: '',
                email: '',
                contactPreference: '',
                contactPreferenceDesc: '',
                contactNbr: '',
                remark: ''
            })
        }
        else {
            setViewMode({ ...viewMode, mode: 'Create_New' })
            setCustomerInquiryData({
                ...personalInquireData,
                customerName: '',
                customerType: '',

                serviceType: '',
                serviceTypeDesc: '',
                productEnquired: '',
                email: '',
                contactPreference: '',
                contactPreferenceDesc: '',
                contactNbr: '',
                remark: ''
            })
            serviceTypeRef.current = "";
            statusPendingOrPDCheckRef.current = false;
        }
    }, [switchToExistingCustomer]);

    //inquiry api call
    useEffect(() => {
        if (newcustomerId.customerId !== '' && newcustomerId.customerId !== undefined) {
            submitRequstBody()
        }
    }, [newcustomerId]);

    useEffect(() => {
        //Bellow business api call was in use-effect with no dependency, Since we need this when refreshed so placed it in one. We need prodType lookup for getting serviceCategory when we route from 360/AdvSearch
        
        post(properties.BUSINESS_ENTITY_API, ['CATEGORY',
            'CLASS',
            'CONTACT_TYPE',
            'CAUSE_CODE',
            'PROBLEM_CAUSE',
            'TICKET_CHANNEL',
            'TICKET_SOURCE',
            'SERVICES',
            'PROBLEM_TYPE',
            'TICKET_PRIORITY',
            'PROD_TYPE',
            'CUSTOMER_TYPE'
        ])
            .then((resp) => {
                if (resp.data) {
                    lookupData.current = resp.data
                    setCategoryLookup(lookupData.current['CATEGORY'])
                    setCustomerTypes(lookupData.current['CUSTOMER_TYPE'])
                    setClassLookup(lookupData.current['CLASS'])
                    setContactTypeLookup(lookupData.current['CONTACT_TYPE'])
                    setInquiryAboutLookUp(lookupData.current['PROBLEM_TYPE'])
                    setTicketChannelLookup(lookupData.current['TICKET_CHANNEL'])
                    setTicketSourceLookup(lookupData.current['TICKET_SOURCE'])
                    //setProblemCauseLookup(lookupData.current['PROBLEM_CAUSE'])
                    setTicketPriority(lookupData.current['TICKET_PRIORITY'])
                    setinquiryCategoryLookup(lookupData.current['SERVICES'])
                    setServiceTypeLookup(lookupData.current['PROD_TYPE'])
                    setRenderMode({ ...renderMode, customerTypeSelection: 'show' })
                    

                    //bellow block was in another use-effect with props.location.state dependency.
                    let apiData
                    if (props.location.state === undefined)
                        return;
                    const { data } = props.location.state
                    if (data.sourceName === 'fromKiosk') {
                        //setRenderMode({...renderMode,kioskEnable:'show',kioskCancelButton:'show'})
                        apiData = data.apiData
                        setCustomerInquiryData({
                            ...personalInquireData, customerName: apiData.firstName + " " + apiData.lastName,
                            contactNbr: apiData.contactNo, serviceType: apiData.problemType
                        })
                        setInquiryData(apiData)
                        //getKioskCustomerByReferenceNo(data.referenceNo)
                    }
                    else if (data.sourceName === 'customer360') {
                        console.log('Access Number from customer360 Id: ', props.location.state.data.accessNumber)
                        console.log('kioskRefId : ', props.location.state.data.kioskRefId)
                        setAccessNumber(props.location.state.data.kioskRefId)
                        setSwitchToExistingCustomer({ ...switchToExistingCustomer, isExsitingCustomer: true })
                        getCustomerDetailsByServiceNo(props.location.state.data.accessNumber)
                    }
                }
            }).catch(error => console.log(error)).finally();
    }, [props.location.state]);

    const getCustomerDetailsByServiceNo = (data) => {
        let apiData;
        let custData

        let requestParam = {
            searchType: "QUICK_SEARCH",
            customerQuickSearchInput: data,
            source: 'INQUIRY'
        }
        
        //get(properties.CUSTOMER_API + `/${data}`)
        post(properties.CUSTOMER_API + "/search?limit=10&page=0", requestParam)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        if (resp.data.rows.length === 0) {
                            toast.error('Access Number not Found.')
                            return;
                        }
                        apiData = resp.data.rows.find((data) => !['PD', 'PENDING'].includes(data.serviceStatus));
                        if (apiData) {
                            toast.success("Customer Information Retrieved Successfully ");
                            setSaveSearchResultData(apiData)
                            if (apiData.customerId === undefined) {
                                toast.error(`No Customer found with Access Number ${data}`)
                                return
                            }
                            get(`${properties.CUSTOMER_DETAILS}/${apiData.customerId}?serviceId=${apiData.serviceId}`)
                                .then((customerResp) => {
                                    if (customerResp && customerResp.data) {
                                        custData = customerResp.data
                                    }
                                    //customer details
                                    setCustomerInquiryData({
                                        customerName: custData.title + " " + custData.firstName + " " + custData.lastName,
                                        customerType: custData.custType, // jira Id:70 Pon Arasi

                                        email: custData?.contact?.email,
                                        contactPreference: custData?.contact?.contactType,
                                        contactPreferenceDesc: custData?.contact?.contactTypeDesc?.description,
                                        contactNbr: custData?.contact?.contactNo
                                    })
                                }).catch(error => console.log(error))
                            getSetFilteredProductOrServices(apiData.prodType);
                            serviceTypeRef.current = apiData.prodType;
                            let serviceCategoryMapping = getServiceCategoryMappingBasedOnProdType(lookupData.current['PROD_TYPE'], apiData.prodType);
                            setInquiryDataDetails({
                                ...inquiryDataDetails,
                                serviceTypeDesc: apiData?.serviceTypeDesc,
                                serviceCategory: serviceCategoryMapping?.hasOwnProperty('serviceCategory') ? serviceCategoryMapping.serviceCategory : "",
                                serviceType: apiData?.prodType
                            })
                            setViewMode({ ...viewMode, mode: 'Create_Existing' })
                            setServiceNumber({ ...serviceNumber, serviceNo: data })
                        }
                        else {
                            toast.error('Inquiry cannot be created when service is in PENDING/PD status.')
                            return;
                        }
                    } else {
                        toast.error("Failed to call get Customer - " + resp.status);
                    }
                } else {
                    toast.error("Uexpected error ocurred " + resp.statusCode);
                }
            }).catch(error => {
                console.error(error);
            }).finally();
    }

    const validate = (section, schema, data, holdPrevErrors = false) => {
        try {
            if (section === 'CreateInquiry') {
                holdPrevErrors === false && setCustomerDetailsError({})
            }
            if (section === 'InquriyDetails') {
                holdPrevErrors === false && setInquiryDetailsError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'CreateInquiry') {
                    setCustomerDetailsError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
                if (section === 'InquriyDetails') {
                    setInquiryDetailsError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }

            });
            return e;
        }
    };


    const handleCustomerTypeChange = (value) => {

        setCustomerType(value)
        setRenderMode({ ...renderMode, customerDetails: 'form', accountDetails: 'form', serviceDetails: 'form', previewButton: 'show' })
    }

    const handleAssignToMe = () => {
        assignSelfAPICall()

    }
    const assignSelfAPICall = () => {
        put(properties.KIOSK_REF_API + "/" + inquiryData.referenceNo)
            .then((resp) => {
                if (resp.status === 200) {
                    toast.success(resp.message);

                    setRenderMode({
                        ...renderMode,
                        kioskEnable: 'hide',
                        kioskCancelButton: 'hide',
                        submitButton: 'hide',
                        createCustomerButton: 'show',
                        createLeadButton: 'show'
                    })
                    //closeModal()
                } else {
                    toast.error("Failed, Please try again");
                }
            }

            ).catch(error => console.log(error))
            .finally();
    }
    // const handleInquiryDetailsCancel = () => {
    //     if (!newCustomerData.current.customer) {
    //         return;
    //     }
    //     newCustomerData.current.customer.customerType = selectedCustomerType
    //     if (newCustomerData.current.customer.customerType === 'RESIDENTIAL') {
    //         setCustomerInquiryData(
    //             {
    //                 customerName: newCustomerData.current.customer.custName,
    //                 customerCategory: newCustomerData.current.customer.custCat,
    //                 serviceType: newCustomerData.current.customer.serviceType,
    //                 productEnquired: newCustomerData.current.customer.productEnquired,
    //                 email: newCustomerData.current.customer.emailId,
    //                 contactPreference: newCustomerData.current.customer.contactPreference,
    //                 contacyNbr: newCustomerData.current.customer.contactNo,
    //                 remark: newCustomerData.current.customer.remarks,
    //             }
    //         )
    //         // setInquiryDataDetails({
    //         //     serviceType: newCustomerData.current.customer.service,
    //         //     inquryAbout: newCustomerData.current.customer.inquryAbout,
    //         //     ticketChannel: newCustomerData.current.customer.ticketChannel,
    //         //     ticketSource: newCustomerData.current.customer.ticketSource,
    //         //     problemCause: newCustomerData.current.customer.problemCause,
    //         //     "NEW"		:	newCustomerData.current.customer.status	,	
    //         //     "Details"		: newCustomerData.current.customer.details,
    //         //     // saveSearchResultData.customerId	: newCustomerData.current.customer.customerId,
    //         //     // saveSearchResultData.accountId		: newCustomerData.current.customer.accountId,
    //         //     // saveSearchResultData.serviceId		: newCustomerData.current.customer.connectionId

    //         // })
    //     }
    //     if (selectedCustomerType === 'BUSINESS') {
    //         setCustomerBusinessInquiryData(
    //             {
    //                 companyName: newCustomerData.current.customer.custName,
    //                 customerCategory: newCustomerData.current.customer.custCat,
    //                 serviceType: newCustomerData.current.customer.serviceType,
    //                 productEnquired: newCustomerData.current.customer.productEnquired,
    //                 email: newCustomerData.current.customer.emailId,
    //                 contactPreference: newCustomerData.current.customer.contactPreference,
    //                 contacyNbr: newCustomerData.current.customer.contactNo,
    //                 remark: newCustomerData.current.customer.remarks,
    //             }
    //         )
    //     }
    //     setSelectedCustomerType(newCustomerData.current.customer.customerType)
    //     setRenderMode({
    //         ...renderMode,
    //         customerDetails: 'view',
    //         customerTypeSelection: 'hide',
    //         submitButton: 'hide',
    //         cancelButton: 'hide',
    //         previewButton: 'show'
    //     })
    // }

    const handleInquiryrDetailsDone = () => {
        if (setCustomerDetails() && setInquiryDetails()) {
            setRenderMode({
                ...renderMode,
                customerDetails: 'view',
                customerTypeSelection: 'hide',
                submitButton: 'show',
                cancelButton: 'hide',
                previewButton: 'show',
                customerDetailsEditButton: 'show'
            })
        }
    }

    const setInquiryDetails = () => {
        let error

        if (selectedCustomerType === 'RESIDENTIAL') {
            error = validate('CreateInquiry', createInquiryFromValidationSchema, personalInquireData);
        }
        if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
            error = validate('CreateInquiry', businessCustomerInquiryFromValidationSchema, customerbusinessInquireData);
        }
        if (selectedCustomerType === 'RESIDENTIAL') {
            const error1 = validate('InquriyDetails', inquiryDetailsFromValidationSchema, inquiryDataDetails, true);
            if (error || error1) {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
        }
        // if (selectedCustomerType === 'RESIDENTIAL') {
        //     if (personalInquireData.contactNbr.length < 7) {
        //         toast.error("Please Enter 7 Digit Contact Number")
        //         return false;
        //     }
        // }
        // if (selectedCustomerType === 'BUSINESS') {
        //     if (customerbusinessInquireData.contactNbr.length < 7) {
        //         toast.error("Please Enter 7 Digit Contact Number")
        //         return false;
        //     }
        // }
        if (selectedCustomerType === 'RESIDENTIAL') {
            if (!newInquiryData.current.customer) {
                newInquiryData.current.customer = {}
            }
            if (switchToExistingCustomer.isExsitingCustomer) {
                newInquiryData.current.customer.serviceType = inquiryDataDetails.serviceType
                newInquiryData.current.customer.productOrServices = inquiryDataDetails.productOrServices
                newInquiryData.current.customer.inquiryCategory = inquiryDataDetails.productOrServices
                newInquiryData.current.customer.inquiryAbout = inquiryDataDetails.inquiryAbout
                newInquiryData.current.customer.ticketPriority = inquiryDataDetails.ticketPriority
                newInquiryData.current.customer.ticketChannel = inquiryDataDetails.ticketChannel//"CHNL004",
                newInquiryData.current.customer.ticketSource = inquiryDataDetails.ticketSource//"SRC006",
                newInquiryData.current.customer.problemCause = inquiryDataDetails.problemCause//"CT007",
                newInquiryData.current.customer.status = "NEW"
                newInquiryData.current.customer.ticketDescription = inquiryDataDetails.remark
                newInquiryData.current.customer.customerId = saveSearchResultData.customerId
                newInquiryData.current.customer.accountId = saveSearchResultData.accountId
                newInquiryData.current.customer.connectionId = saveSearchResultData.serviceId
                newInquiryData.current.customer.kioskRefId = (accessNumber !== null) ? accessNumber : null
                newInquiryData.current.customer.location = inquiryDataDetails.ticketUserLocation
                //accessNumber
            }
            else {
                newInquiryData.current.customer.serviceType = inquiryDataDetails.serviceType
                newInquiryData.current.customer.productOrServices = inquiryDataDetails.productOrServices
                newInquiryData.current.customer.inquiryCategory = inquiryDataDetails.productOrServices
                newInquiryData.current.customer.inquiryAbout = inquiryDataDetails.inquiryAbout
                newInquiryData.current.customer.ticketPriority = inquiryDataDetails.ticketPriority
                newInquiryData.current.customer.ticketChannel = inquiryDataDetails.ticketChannel//"CHNL004",
                newInquiryData.current.customer.ticketSource = inquiryDataDetails.ticketSource//"SRC006",
                newInquiryData.current.customer.problemCause = inquiryDataDetails.problemCause//"CT007",
                newInquiryData.current.customer.status = "NEW"
                newInquiryData.current.customer.ticketDescription = inquiryDataDetails.remark
                newInquiryData.current.customer.kioskRefId = (inquiryData !== null) ? inquiryData.referenceNo : null
                newInquiryData.current.customer.location = inquiryDataDetails.ticketUserLocation
                //newInquiryData.current.customer.customerId = ""
                // newCustomerData.current.customer.accountId = ""
                // newCustomerData.current.customer.connectionId = ""
            }
        }

        return true
    }

    const setCustomerDetails = () => {
        if (selectedCustomerType === 'RESIDENTIAL') {
            const error = validate('CreateInquiry', createInquiryFromValidationSchema, personalInquireData);
            if (error) {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
        }
        // if (personalInquireData.contactNbr.length < 7) {
        //     toast.error("Please Enter 7 Digit Contact Number")
        //     return false;
        // }

        if (selectedCustomerType === 'BUSINESS') {
            const error = validate('CreateInquiry', businessCustomerInquiryFromValidationSchema, customerbusinessInquireData);
            if (error) {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
        }

        if (!newCustomerData.current.customer) {
            newCustomerData.current.customer = {}
        }
        newCustomerData.current.customer.customerType = selectedCustomerType
        if (selectedCustomerType === 'RESIDENTIAL') {
            // newCustomerData.current.customer.custName = personalInquireData.customerName
            // newCustomerData.current.customer.custCat = personalInquireData.customerCategory
            // //newCustomerData.current.customer.serviceType = personalInquireData.serviceType
            // //newCustomerData.current.customer.productEnquired = personalInquireData.productEnquired
            // newCustomerData.current.customer.contactPreference = personalInquireData.contactPreference
            // newCustomerData.current.customer.emailId = personalInquireData.email
            // newCustomerData.current.customer.contactNo = personalInquireData.contactNbr
            // newCustomerData.current.customer.remarks = personalInquireData.remark
            // new customer call API DATA
            newCustomerData.current.customer.title = 'Mr'
            //newCustomerData.current.customer.firstName = personalInquireData.customerName
            newCustomerData.current.customer.firstName = " " // Demo Purpose
            newCustomerData.current.customer.lastName = personalInquireData.customerName
            newCustomerData.current.customer.customerType = personalInquireData.customerType
            // newCustomerData.current.customer.categoryDesc = personalInquireData.customerCategoryDesc
            newCustomerData.current.customer.email = personalInquireData.email
            newCustomerData.current.customer.contactType = personalInquireData.contactPreference
            newCustomerData.current.customer.contactNbr = personalInquireData.contactNbr
            newCustomerData.current.customer.class = "CLASTD"
            // newCustomerData.current.customer.customerType = 'RESIDENTIAL'
        }
        if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
            // newCustomerData.current.customer.companyName = personalDetailsData.companyName
            // newCustomerData.current.customer.category = personalDetailsData.category
            // newCustomerData.current.customer.class = personalDetailsData.class
            // newCustomerData.current.customer.email = personalDetailsData.email
            // newCustomerData.current.customer.contactType = personalDetailsData.contactType
            // newCustomerData.current.customer.contactNbr = personalDetailsData.contactNbr

            newCustomerData.current.customer.custName = customerbusinessInquireData.companyName
            newCustomerData.current.customer.customerType = customerbusinessInquireData.customerType
            newCustomerData.current.customer.serviceType = customerbusinessInquireData.serviceType
            newCustomerData.current.customer.productEnquired = customerbusinessInquireData.productEnquired
            newCustomerData.current.customer.contactPreference = customerbusinessInquireData.contactPreference
            newCustomerData.current.customer.emailId = customerbusinessInquireData.email
            newCustomerData.current.customer.contactNo = customerbusinessInquireData.contactNbr
            newCustomerData.current.customer.remarks = customerbusinessInquireData.remark
        }

        return true
    }

    const handleInquiryDetailsEdit = () => {
        setRenderMode({
            ...renderMode,
            customerDetails: 'form',
            customerTypeSelection: 'show',
            submitButton: 'show',
            cancelButton: 'hide'
        })
    }

    const handlePreview = () => {
        if (switchToExistingCustomer.isExsitingCustomer) {

            if (setInquiryDetails()) {
                //toast.success("Field validations completed successfully");
                //showPreview()
            }
        }
        else {
            if (setCustomerDetails() && setInquiryDetails()) {
                //toast.success("Field validations completed successfully");
                //showPreview()
            }
        }
    }
    const showPreview = () => {
        setRenderMode({
            ...renderMode,
            customerTypeSelection: 'hide',
            customerDetails: 'view',
            accountDetails: 'view',
            serviceDetails: 'view',
            submitButton: 'show',
            cancelButton: 'show',
            previewButton: 'hide'
        })
    }

    const kioskCancle = () => {
        history.push(`${process.env.REACT_APP_BASE}/`)
    }

    const handleCancel = () => {
        setRenderMode({
            ...renderMode,
            customerTypeSelection: 'show',
            customerDetails: 'form',
            submitButton: 'hide',
            cancelButton: 'hide',
            previewButton: 'show'
        })
    }
    // handle create lead
    const handleCreateLead = () => {
        if (setCustomerDetails() && setInquiryDetails()) {
            toast.success("Field validations completed successfully");
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className="alert">
                            <fieldset className="scheduler-border1">

                                <h1 className="alert__title">Are you sure?</h1>
                                <p className="alert__body">Do you want create inqury?</p>
                                <div className="d-flex justify-content-center">
                                    <button onClick={
                                        () => {
                                            createCustomer(newCustomerData.current.customer);
                                            onClose();
                                        }
                                    } type="button" className="btn btn-primary btn-md  waves-effect waves-light ml-2 float-right " >Yes</button>
                                    <button onClick={onClose} type="button" className="btn btn-primary btn-md  waves-effect waves-light ml-2 float-right " >Cancel</button>
                                </div>
                            </fieldset>
                        </div>
                    );
                }
            });
            //showPreview()
        }

    }
    // handle convert to customer
    const handleConverToCustomer = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="alert">
                        <fieldset className="scheduler-border1">

                            <h1 className="alert__title">Are you sure?</h1>
                            <p className="alert__body">Do you want to enroll as customer?</p>
                            <div className="d-flex justify-content-center">
                                <button onClick={
                                    () => {
                                        history.push(`${process.env.REACT_APP_BASE}/new-customer`, {
                                            data: {
                                                custType: "RESIDENTIAL",
                                                sourceName: 'Inquiry',
                                                customerDetails: inquiryData
                                            }
                                        })
                                        onClose()
                                    }

                                }

                                    type="button" className="btn btn-primary btn-md  waves-effect waves-light ml-2 float-right " >Yes</button>
                                <button onClick={onClose} type="button" className="btn btn-primary btn-md  waves-effect waves-light ml-2 float-right " >Cancel</button>
                            </div>
                        </fieldset>
                    </div>
                );
            }
        });

    }
    const handleSubmit = () => {

        //handlePreview()

        if (switchToExistingCustomer.isExsitingCustomer) {
            if (statusPendingOrPDCheckRef.current) {
                toast.error('Inquiry cannot be created when service is in PENDING/PD status.')
                return;
            }
            else {
                if (setInquiryDetails()) {
                    //toast.success("Field validations completed successfully");
                    submitRequstBody();
                    //showPreview()
                }
            }
        }
        else {
            if (setCustomerDetails() && setInquiryDetails()) {
                //toast.success("Field validations completed successfully");
                createCustomer(newCustomerData.current.customer)
                //showPreview()
            }
        }
    }

    const createCustomer = () => {
        
        newCustomerData.current.customer.attachments = [...currentFiles.map((current) => current.entityId)]
        post(properties.CUSTOMER_API, newCustomerData.current.customer)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        //toast.success(resp.message);
                        setCustomerId({
                            ...newcustomerId,
                            customerId: resp.data.customerId
                        })
                        newInquiryData.current.customer.customerId = resp.data.customerId

                    } else {
                        toast.error("Failed to create - " + resp.status);
                    }
                } else {
                    toast.error("Uexpected error ocurred " + resp.statusCode);
                }
            }).catch(error => console.log(error)).finally();
    }

    const submitRequstBody = () => {
        
        newInquiryData.current.customer.attachments = [...currentFiles.map((current) => current.entityId)]
       
        post(properties.CUSTOMER_INQUIRY_API_2, newInquiryData.current.customer)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        //toast.success(`${resp.message} with ID ${resp.data.interactionId}`);
                        toast.success(`Lead Created Successfully with ID ${resp.data.interactionId}`);
                        props.history.push(`${process.env.REACT_APP_BASE}/`);
                        setRenderMode({
                            ...renderMode,
                            submitButton: 'hide',
                            cancelButton: 'hide',
                            previewButton: 'hide',
                            customerDetails: 'view',
                            customerDetailsEditButton: 'show',
                            accountDetailsEditButton: 'hide',
                            serviceDetailsEditButton: 'hide',
                            kioskEnable: 'hide',
                            createCustomerButton: 'hide',
                            createLeadButton: 'hide',
                            kioskCancelButton: 'hide'
                        })
                        setNewCustomerInquiryDetails({
                            customerId: resp.data.leadId,
                            leadId: resp.data.leadId
                        })
                    } else {
                        toast.error("Failed to create - " + resp.status);
                        setRenderMode({
                            ...renderMode,
                            submitButton: 'hide',
                            cancelButton: 'show',
                            previewButton: 'hide'
                        })
                    }
                } else {
                    toast.error("Uexpected error ocurred " + resp.statusCode);
                    setRenderMode({
                        ...renderMode,
                        submitButton: 'hide',
                        cancelButton: 'show',
                        previewButton: 'hide'
                    })
                }
            }).catch(error => console.log(error)).finally();
    }

    const getSetFilteredProductOrServices = (filterValue) => {
        let filteredProductOrServices = lookupData.current['SERVICES'].filter((service) => {
            let isTrue = false;
            if (service.mapping && service.mapping.hasOwnProperty('serviceType') && service.mapping.serviceType.includes(filterValue)) {
                return isTrue = true;
            }
            return isTrue;
        })
        setProductOrServicesLookup(filteredProductOrServices)
    }

    const handleInquiryDetailsOnChange = (e) => {
        const { target } = e;
        if (target.localName === 'select') {
            if (target.id === 'serviceType') {
                getSetFilteredProductOrServices(target.value);
                const selectedObject = JSON.parse(target.options[target.selectedIndex].dataset.object);
                setInquiryDataDetails({
                    ...inquiryDataDetails,
                    [target.id]: target.value,
                    [`${target.id}Desc`]: target.options[e.target.selectedIndex].label,
                    productOrServices: "",
                    productOrServicesDesc: "",
                    serviceCategory: selectedObject.mapping && selectedObject.mapping.hasOwnProperty('serviceCategory') ? selectedObject.mapping.serviceCategory : ""
                })
            }
            else {
                setInquiryDataDetails({
                    ...inquiryDataDetails,
                    [target.id]: target.value,
                    [`${target.id}Desc`]: target.options[e.target.selectedIndex].label
                })
            }
            setInquiryDetailsError({
                ...inquiryDetailsError,
                [target.id]: ""
            })
        }
        else {
            setInquiryDataDetails({
                ...inquiryDataDetails,
                [target.id]: target.value
            })
        }
    }

    useEffect(() => {
        const requestBody = {
            screenName: "Create Lead",
            moduleName: "Helpdesk 360"
        }
        
        post(properties.MAINMENU_API + '/getQuickLinks', requestBody)
            .then((response) => {
                setQuickLinks(response.data[0].links.QuickLinks)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
    }, [])

    const handleQuickLinks = (e) =>{
        if(e.name === "Kiosk Details"){
            if(renderMode.kioskEnable === 'show'){
                <li><Link activeclassName="active" className="test4" to={e.to} spy={true} offset={-190} smooth={true} duration={100}>{e.name}</Link></li>
            }
        }
        else{
            return(
                <li><Link activeclassName="active" className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100}>{e.name}</Link></li>
            )
        }
    }


    return (
        <div className="row mt-1">
            <div className="col-12">
            <div className='row pr-3'>
                    <div className="col">
                        <div className="page-title-box">
                        <h1 className="title">Create Lead - (New)</h1>
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
                </div>
                <div className="card-box">
                    <div className="d-flex"></div>
                    <div style={{ marginTop: '0px' }}>
                        <div className="testFlex">
                            {/* <div className="new-customer col-md-10"> */}
                            <div className="new-customer flex">
                                <div data-spy="scroll" data-target="#scroll-list" data-offset="0" className="scrollspy-div">
                                    {
                                        ((renderMode.kioskEnable === 'show' || renderMode.kioskEnable === 'hide') && inquiryData && inquiryData !== null) ?
                                            <Element name="kiosk_page" className="element" >
                                                <div>
                                                    <div className="row">
                                                        <div className="col-12 p-0">
                                                            {/* <section className="triangle">
                                                                <h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>{t("lead")}-Ref No:{inquiryData.referenceNo}</h4>
                                                            </section> */}
                                                            <section className="triangle col-12">
                                                                <div className="row col-12">
                                                                    <div className="col-8">
                                                                        <h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>{t("kiosk")}-Ref No:{inquiryData.referenceNo}</h4>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        <span className="act-btn" style={{ display: 'none', float: "right" }}>
                                                                            <button disabled={(renderMode.kioskEnable === 'hide') ? "disabled" : ""} onClick={handleAssignToMe} type="button" className="btn btn-labeled btn-primary btn-sm mt-1" data-toggle="modal" data-target="#myModal">
                                                                                {t('assign_to_me')}
                                                                            </button>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        <div className="pt-2 pr-2">
                                                            <fieldset disabled={(renderMode.kioskEnable === 'hide') ? "disabled" : ""} className="scheduler-border">
                                                                <KioskRefUI
                                                                    data={
                                                                        {
                                                                            inquiryData: inquiryData
                                                                        }
                                                                    }
                                                                />
                                                            </fieldset>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* <div className="pt-2 pr-2">
                                                    <fieldset className="scheduler-border">
                                                        <div className="form-row">
                                                            <div className="col-12 pl-2 bg-light border">
                                                                <h5 className="text-primary">Customer Type</h5>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex flex-row pt-2">
                                                            <div className="col-md-2 pl-0">
                                                                <div className="form-group">
                                                                    <div className="radio radio-primary mb-2">
                                                                        <input type="radio" id="radio1" className="form-check-input" name="optCustomerType" value='RESIDENTIAL'
                                                                            checked={'RESIDENTIAL' === customerType} onChange={e => {
                                                                                handleCustomerTypeChange(e.target.value);
                                                                                //resetDataValues();
                                                                            }} />
                                                                        <label htmlFor="radio1">{t("residential")}</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-2">
                                                                <div className="form-group">
                                                                    <div className="radio radio-primary mb-2">
                                                                        <input type="radio" id="radio2" className="form-check-input" name="optCustomerType" value='BUSINESS'
                                                                            checked={'BUSINESS' === customerType} onChange={e => {
                                                                                handleCustomerTypeChange(e.target.value);
                                                                                //resetDataValues();
                                                                            }} />
                                                                        <label htmlFor="radio2">{t("business")}</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </fieldset>
                                                </div> */}
                                            </Element>
                                            : ""
                                    }

                                    <Element name="createinquiry" className="element" >
                                        <div className="row">
                                            <div className="col-12 p-0">

                                                <section className="triangle">
                                                    <h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>Create Lead&nbsp;{newCustomerDetails.leadId}</h4>
                                                </section>
                                            </div>
                                        </div>

                                        {
                                            (selectedCustomerType && selectedCustomerType !== '') ?
                                                <div className="pt-2">
                                                    {

                                                        (selectedCustomerType === 'RESIDENTIAL' && renderMode.customerDetails === 'form') ?
                                                            <div className="pt-2 pr-2">
                                                                <fieldset disabled={(renderMode.kioskEnable === 'show') ? "" : ""} className="scheduler-border">

                                                                    <CreateCustomerInquiryDetailsForm data={{
                                                                        personalDetailsData: personalInquireData,
                                                                        switchToExistingCustomer: switchToExistingCustomer,
                                                                        saveSearchResultData: saveSearchResultData,
                                                                        serviceNumber: serviceNumber,
                                                                        serviceTypeRef,
                                                                        statusPendingOrPDCheckRef
                                                                        //accessNumber:(accessNumber!==null)?accessNumber:null
                                                                    }}
                                                                        viewMode={viewMode}
                                                                        customerType={selectedCustomerType}
                                                                        lookups={{
                                                                            customerTypeLookup: customerTypes,
                                                                            categoryLookup: categoryLookup,
                                                                            classLookup: classLookup,
                                                                            contactTypeLookup: contactTypeLookup,
                                                                            prodTypeLookup: lookupData.current['PROD_TYPE']
                                                                        }}
                                                                        customerSearchToShow={customerSerchHide}
                                                                        // lookupsHandler={{
                                                                        //     addressChangeHandler: addressChangeHandler
                                                                        // }}
                                                                        stateHandler={{
                                                                            setPersonalDetailsData: setCustomerInquiryData,
                                                                            setSwitchToExistingCustomer: setSwitchToExistingCustomer,
                                                                            setSaveSearchResultData: setSaveSearchResultData,
                                                                            setViewMode: setViewMode,
                                                                            setServiceNumber: setServiceNumber,
                                                                            getSetFilteredProductOrServices,
                                                                            setInquiryDataDetails
                                                                        }}
                                                                        error={customerDetailsError}
                                                                        setError={setCustomerDetailsError}
                                                                    />

                                                                </fieldset>
                                                            </div>
                                                            :
                                                            <></>
                                                    }


                                                    {/* -------------upload------------------ */}

                                                </div>
                                                : <></>
                                        }

                                        {
                                            (selectedCustomerType === 'RESIDENTIAL' && renderMode.customerDetails === 'view') ?
                                                <fieldset className="scheduler-border">

                                                    <NewCustomerEnquiryPreview custType={selectedCustomerType}
                                                        data={
                                                            {
                                                                personalInquireData: personalInquireData,
                                                                inquiryDataDetails: inquiryDataDetails
                                                            }

                                                        } />

                                                </fieldset>
                                                :
                                                <></>
                                        }
                                        {
                                            (selectedCustomerType === 'BUSINESS' && renderMode.customerDetails === 'form') ?
                                                <fieldset className="scheduler-border">

                                                    <NewCustomerBusinessInquiryForm
                                                        data={{
                                                            businessDetailsData: customerbusinessInquireData,

                                                        }}
                                                        lookups={{
                                                            customerTypeLookup: customerTypes,
                                                            categoryLookup: categoryLookup,
                                                            classLookup: classLookup,
                                                            contactTypeLookup: contactTypeLookup
                                                        }}
                                                        stateHandler={{
                                                            setPersonalDetailsData: setCustomerBusinessInquiryData,
                                                        }}
                                                        error={customerDetailsError}
                                                    />

                                                </fieldset>
                                                :
                                                <></>
                                        }
                                    </Element>

                                    <Element name="inquirydetails" className="element" >
                                        <div className="row">
                                            <div className="col-12 p-0">
                                                <section className="triangle">
                                                    <h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>Lead Details</h4>
                                                </section>
                                            </div>
                                        </div>
                                        {

                                            (selectedCustomerType === 'RESIDENTIAL' && renderMode.customerDetails === 'form') ?
                                                <div className="pt-2">
                                                    <div className="pt-2 pr-2">
                                                        <fieldset disabled={(renderMode.kioskEnable === 'show') ? "" : ""} className="scheduler-border">

                                                            <InquiryDetailsForm data={{
                                                                inquiryDataDetails: inquiryDataDetails,
                                                                serviceTypeRef
                                                            }}
                                                                customerType={selectedCustomerType}
                                                                lookups={{
                                                                    serviceTypeLookup: serviceTypeLookup,
                                                                    productOrServicesLookup,
                                                                    lookupInquiryAbout: lookupInquiryAbout,
                                                                    lookupTicketchannel: ticketChannel,
                                                                    lookupTicketSource: ticketSource,
                                                                    lookupTicketPriority: ticketPriority,
                                                                    lookupInquiryCategory: inquiryCategoryLookup,
                                                                    lookupCause: problemCause,

                                                                }}
                                                                lookupsHandler={{
                                                                    handleInquiryDetailsOnChange
                                                                }}
                                                                stateHandler={{
                                                                    setInquiryDataDetails: setInquiryDataDetails,
                                                                }}
                                                                error={inquiryDetailsError}
                                                                setError={setInquiryDetailsError}
                                                            />

                                                        </fieldset>
                                                    </div>
                                                </div>
                                                :
                                                <div className="pt-2">
                                                    <div className="pt-2 pr-2">
                                                        <fieldset className="scheduler-border">
                                                            <InquiryDetailsPreview custType={selectedCustomerType}
                                                                data={
                                                                    {
                                                                        personalInquireData: personalInquireData,
                                                                        inquiryDataDetails: inquiryDataDetails
                                                                    }
                                                                } />
                                                        </fieldset>
                                                    </div></div>
                                        }
                                        {
                                            (selectedCustomerType === 'BUSINESS' && renderMode.customerDetails === 'view') ?
                                                <fieldset className="scheduler-border">

                                                    <NewCustomerBusinessInquiryPreview custType={selectedCustomerType} data={customerbusinessInquireData} />

                                                </fieldset>
                                                :
                                                <></>
                                        }
                                    </Element>


                                    <div>
                                        <Element name="attachment_upload" className="element" >
                                            {

                                                (selectedCustomerType === 'RESIDENTIAL' && (renderMode.customerDetails === 'form' || renderMode.customerDetails === 'view')) ?
                                                    <div className="pt-2 pr-2">
                                                        <div className="full-width-bg row">
                                                            <div className="col-12 p-0">
                                                                <section className="triangle">
                                                                    <h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>{t("attachment")}</h4>
                                                                </section>
                                                            </div>
                                                        </div>
                                                        <div className="pt-2">
                                                            <fieldset disabled={(renderMode.kioskEnable === 'show') ? "" : ""} className="scheduler-border">
                                                                <FileUpload
                                                                    data={{
                                                                        currentFiles: currentFiles,
                                                                        entityType: 'INQUIRY',
                                                                        shouldGetExistingFiles: false,
                                                                        permission: false
                                                                    }}
                                                                    handlers={{
                                                                        setCurrentFiles
                                                                    }}
                                                                />
                                                                {/* <AttachmentToInquiry /> */}
                                                            </fieldset>
                                                        </div>
                                                    </div>
                                                    :
                                                    <></>
                                            }
                                        </Element>
                                    </div>
                                    {/* <fieldset className="scheduler-border"> */}
                                    {
                                        props.location.state && props.location.state.data.sourceName !== 'fromKiosk' &&
                                            (renderMode.customerDetails === 'form') ?
                                            <div className="d-flex justify-content-end">
                                                {/* <button type="button" className="btn btn-outline-secondary waves-effect waves-light" onClick={handleInquiryDetailsCancel}>Cancel</button> */}
                                                {/* <button type="button" className="btn btn-outline-primary text-primary   waves-effect waves-light ml-2" onClick={handleInquiryrDetailsDone}>Done</button> */}
                                            </div>
                                            :
                                            <></>
                                    }
                                    {
                                        props.location.state && props.location.state.data.sourceName !== 'fromKiosk' &&
                                            (renderMode.customerDetails === 'view' && renderMode.customerDetailsEditButton === 'show') ?
                                            <div className="d-flex justify-content-end edit-btn">
                                                <button type="button" className="btn btn-outline-primary text-primary waves-effect waves-light ml-2" onClick={handleInquiryDetailsEdit}>Edit</button>
                                            </div>
                                            :
                                            <></>
                                    }



                                    {/* kiosk ui end */}

                                    {
                                        (renderMode.kioskEnable === 'show') ?
                                            <div className="d-flex justify-content-center">
                                                {
                                                    (renderMode.createLeadButton === 'show') ?
                                                        <button type="button" className="btn btn-primary btn-md  waves-effect waves-light ml-2" onClick={handleCreateLead}>{t('create_as_lead')}</button>
                                                        :
                                                        <></>
                                                }
                                                {
                                                    (renderMode.createCustomerButton === 'show') ?
                                                        <button type="button" className="btn btn-primary btn-md  waves-effect waves-light ml-2" onClick={handleConverToCustomer}>{t('convert_to_customer')}</button>
                                                        :
                                                        <></>
                                                }
                                                {
                                                    (renderMode.kioskCancelButton === 'show') ?
                                                        <button type="button" className="btn btn-secondary btn-md  waves-effect waves-light ml-2" onClick={kioskCancle} >Cancel</button>
                                                        :
                                                        <></>
                                                }
                                            </div>
                                            :
                                            <div className="d-flex justify-content-center">

                                                {
                                                    (renderMode.submitButton === 'show') ?
                                                        <>
                                                            <button type="button" className="btn btn-primary btn-md  waves-effect waves-light ml-2" onClick={handleSubmit}>Submit</button>
                                                            <button type="button" className="btn btn-secondary btn-md  waves-effect waves-light ml-2" onClick={() => props.history.goBack()}>Cancel</button>
                                                        </>
                                                        :
                                                        <></>
                                                }

                                                {
                                                    (renderMode.cancelButton === 'show') ?
                                                        <button type="button" className="btn btn-secondary btn-md  waves-effect waves-light ml-2" onClick={handleCancel}>Cancel</button>
                                                        :
                                                        <></>
                                                }
                                            </div>
                                    }

                                    {
                                        (newCustomerDetails && newCustomerDetails.customerId) ?
                                            <Element name="serviceRequestSection">
                                                <section className="triangle col-12">
                                                    <div className="row col-12">
                                                        <div className="col-8">
                                                            <h4 className="pl-1">Customer Inquiry List</h4>
                                                        </div>
                                                    </div>
                                                </section>
                                                <div className="col-md-12 pl-2 pr-2 pt-2 pb-1">
                                                    <div className="form-row bg-light pt-2 ml-0 mr-0">
                                                        <div className="form-row border col-12 p-0 ml-0 mr-0">
                                                            <div className="col-md-12 card-box m-0 p-0">
                                                                <CustomerInquiryList
                                                                    data={{
                                                                        customerDetails: newCustomerDetails
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Element>
                                            :
                                            <></>
                                    }
                                </div>
                            </div>
                           { isQuickLinkEnabled && <div className="col-md-2 pl-2 sticky">
                                <div className="">
                                    <nav className="navbar navbar-default navbar-fixed-top">
                                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                            <ul className="nav navbar-nav">

                                                {
                                                    quickLinks && quickLinks.map((e)=>(
                                                        handleQuickLinks(e)
                                                    ))
                                                }
                                                
                                                {/* {
                                                    (renderMode.kioskEnable === 'show') ?
                                                        <li><Link activeclassName="active" className="test4" to="kiosk_page" spy={true} offset={-190} smooth={true} duration={100}>Kiosk Details</Link></li>
                                                        :
                                                        <></>
                                                }
                                                <li><Link activeclassName="active" className="test1" to="createinquiry" spy={true} offset={-120} smooth={true} duration={100}>Create Lead</Link></li> */}
                                                {/* <li><Link activeclassName="active" className="test2" to="accountSection" spy={true} offset={-100} smooth={true} duration={100}>Address</Link></li>
                                                <li><Link activeclassName="active" className="test3" to="serviceSection" spy={true} offset={-320} smooth={true} duration={100}>Contact</Link></li> */}
                                                {/* <li><Link activeclassName="active" className="test2" to="inquirydetails" spy={true} offset={-120} smooth={true} duration={100}>Lead Details</Link></li>

                                                <li><Link activeclassName="active" className="test3" to="attachment_upload" spy={true} offset={-120} smooth={true} duration={100}>{t("attachments")}</Link></li> */}
                                            </ul>
                                        </div>

                                    </nav>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div >


    )

}
export default CreateEnquireNewCustomer;



