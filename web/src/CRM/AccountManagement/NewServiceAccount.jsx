import React, { useState, useRef, useContext, useEffect, useCallback } from 'react'
import NewCustomerPreviewModal from 'react-modal'
import { useTranslation } from "react-i18next";
import { Link, Element } from 'react-scroll'
import { toast } from "react-toastify";
import { string, date, object } from "yup";
import { useReactToPrint } from 'react-to-print';
import { get, post } from "../../common/util/restUtil";
import { properties } from "../../properties";

import CustomerDetailsForm from '../Customer/CustomerDetailsForm'
import CustomerDetailsPreview from '../Customer/CustomerDetailsForm'
import AccountDetailsForm from './AccountDetailsForm';
import ServiceDetailsForm from '../ServiceManagement/ServiceDetailsForm';
import ServiceDetailsFormView from '../ServiceManagement/ServiceDetailsFormView';
import ServiceRequestList from '../Customer360/serviceRquestList'
import CustomerDetailsFormView from '../Customer/CustomerDetailsFormView';
import { AppContext } from '../../AppContext';
import CustomerLookupModal from '../Customer/customerLookupModal';
import AddressDetailsFormView from '../Address/AddressDetailsFormView'
import moment from 'moment'
import { unstable_batchedUpdates } from 'react-dom';

const idNbrRegexPattern = /[0-9]{2}-[0-9]{6}/
const icIdTypes = ['ICGREEN', 'ICRED', 'ICYELLOW']

const personalCustomerValidationSchema = object().shape({
    title: string().required("Title is required"),
    firstName: string().required("ForeName is required"),
    lastName: string().required("SurName is required"),
    // category: string().required("Category is required"),
    // class: string().required("Class is required"),
    email: string().required("Email is required").email("Email is not in correct format"),
    contactType: string().required("Contact type is required"),
    contactNbr: string().required("Contact Number is required")
});

const businessCustomerValidationSchema = object().shape({
    companyName: string().required("Company Name is required"),
    //category: string().required("Category is required"),
    //class: string().required("Class is required"),
    email: string().required("Email is required").email("Email is not in correct format"),
    contactType: string().required("Contact type is required"),
    contactNbr: string().required("Contact Number is required")
});

const addressValidationSchema = object().shape({
    flatHouseUnitNo: string().required("Flat/House/Unit No is required"),
    street: string().required("Street is required"),
    district: string().required("District is required"),
    cityTown: string().required("City/Town is required"),
    postCode: string().required("Postcode is required"),
    country: string().required("Country is required"),
    state: string().required("State is required")
});

const validateDateFormat = (value) => {
    try {
        Date.parse(value)
        return true
    } catch (e) {
        return false
    }
}

const personalAccountValidationSchema = object().shape({
    title: string().required("Title is required"),
    foreName: string().required("ForeName is required"),
    surName: string().required("SurName is required"),
    email: string().required("Email is required").email("Email is not in correct format"),
    contactType: string().required("Contact type is required"),
    contactNbr: string().required("Contact Number is required"),

    // baseCollPlan: string().required("Base collection plan is required"),
    contactTitle: string().required("Contact title is required"),
    contactSurName: string().required("Contact Surname is required"),
    contactForeName: string().required("Contact Surname is required"),
});

const businessAccountValidationSchema = object().shape({
    companyName: string().required("Company Name is required"),
    email: string().required("Email is required").email("Email is not in correct format"),
    contactType: string().required("Contact type is required"),
    contactNbr: string().required("Contact Number is required"),
    //idType: string().required("ID Type is required"),
    //idNbr: string().required("ID Number is required"),
    contactTitle: string().required("Contact title is required"),
    contactSurName: string().required("Contact Surname is required"),
    contactForeName: string().required("Contact Surname is required"),
});

// const billOptionsValidationSchema = object().shape({
//     billLanguage: string().required("Bill Language is required"),
//     billDeliveryMethod: string().required("Bill delivery methoed  is required"),
//     noOfCopies: string().required("No of copies required")
// });

// const securityQuestionValidationSchema = object().shape({
//     securityQuestion: string().required("Security Question is required"),
//     securityAnswer: string().required("Security Answer  is required")
// });

const serviceDataValidationSchema = object().shape({
    serviceType: string().required("Service Type is required")
});

const fixedServiceValidationSchema = object().shape({
    serviceNumberSelection: string().required("Service Number Selection is required"),
    //serviceNumberGroup: string().required("Service Number Group is required"),
    //exchangeCode: string().required("Exchange Code is required"),
    accessNbr: string().when("serviceNumberSelection", {
        is: "manual",
        then: string().required("Access Number is required")
    }
    )
});

const mobileServiceValidationSchema = object().shape({
    serviceNumberSelection: string().required("Service Number Selection is required"),
    nbrGroup: string().required("Number Group is required"),
    dealership: string().required("Dealership is required"),
    accessNbr: string().when("serviceNumberSelection", {
        is: "manual",
        then: string().required("Access Number is required")
    }
    )
});

const gsmValidationSchema = object().shape({
    iccid: string().required("ICCID is required"),
    imsi: string().required("IMSI is required")
});

const creditProfileValidationSchema = object().shape({
    creditProfile: string().required("Credit Profile is required")
});

const depositValidationSchema = object().shape({
    includeExclude: string().required("Deposit inclusion or exclusion is required"),
    charge: string().when("includeExclude", {
        is: "include",
        then: string().required("Deposit Charge is required")
    }
    ),
    excludeReason: string().when("includeExclude", {
        is: includeExclude => includeExclude === "exclude",
        then: string().required("Exclude Reason is required")
    }
    )
});

const paymentValidationSchema = object().shape({
    paymentMethod: string().required("Payment Method is required")
});

function NewServiceAccount(props) {
    const [refreshServiceRequest, setRefreshServiceRequest] = useState(true)
    const [countries, setCountries] = useState()
    const [locations, setLocations] = useState()
    let custType = ''
    let viewStatus = 'hide'
    const { auth } = useContext(AppContext)
    const [userPermission, setUserPermission] = useState({
        createService: false
    })
    if (props.location.state !== undefined) {
        if (props.location.state.data !== undefined) {
            if (props.location.state.data.sourceName === 'Inquiry') {
                custType = (props.location.state.data !== undefined)
                    ? props.location.state.data.rowData.customerType : ''
                viewStatus = 'show'
            }
        }
    }

    const [customerData, setCustomerData] = useState({})
    const [isBillingDetailsActive, setIsBillingDetailsActive] = useState(false)
    const [isAddressDetailsActive, setIsAddressDetailsActive] = useState(false)
    const [isCustPropertyDetailsActive, setIsCustPropertyDetailsActive] = useState(false)
    const [isCustomerLookupModalOpen, setIsCustomerLookupModalOpen] = useState(false)
    const [detailsValidate, setDetailsValidate] = useState({
        title: true,
        surName: true,
        foreName: true,
        email: true,
        companyName: true,
        contactNbr: true,
        flatNo: true,
        block: true,
        building: true,
        simpang: true,
        jalan: true,
        mukim: true,
        city: true,
        profileValue: true
    })
    const [accountValidate, setAccountValidate] = useState({
        title: true,
        surName: true,
        foreName: true,
        email: true,
        companyName: true,
        contactNbr: true,
        dateOfBirth: true,
        idNumber: true,
        registeredNbr: true,
        contactTitle: true,
        contactSurName: true,
        contactForeName: true,
        flatNo: true,
        block: true,
        building: true,
        simpang: true,
        jalan: true,
        mukim: true,
        city: true,
        copiesCount: true,
        profileValue: true
    })

    const [serviceValidate, setServiceValidate] = useState({
        flatNo: true,
        block: true,
        building: true,
        simpang: true,
        jalan: true,
        mukim: true,
        city: true,
        accessNbr: true
    })
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });
    // let found = false;
    const [found, setFound] = useState(false)
    const { t } = useTranslation();

    const [leftNavCounts, setLeftNavCounts] = useState({})

    const [customerDetailsError, setCustomerDetailsError] = useState({});
    const [accountDetailsError, setAccountDetailsError] = useState({});
    const [serviceDetailsError, setServiceDetailsError] = useState({});

    const [newCustomerPreviewModalState, setNewCustomerPreviewModalState] = useState({ state: false })

    const [renderMode, setRenderMode] = useState({
        customerTypeSelection: viewStatus,
        customerDetails: 'hide',
        customerDetailsPreview: 'hide',
        accountDetails: 'hide',
        accountDetailsPreview: 'hide',
        serviceDetails: 'hide',
        previewAndSubmitButton: 'hide',
        previewButton: 'hide',
        previewCloseButton: 'hide',
        submitButton: 'hide',
        previewCancelButton: 'hide',
        customerDetailsEditButton: 'show',
        accountDetailsEditButton: 'show',
        serviceDetailsEditButton: 'show',
        submitted: 'no'
    })

    const [doneStatus, setDoneStatus] = useState({
        customer: false,
        account: false,
        service: false
    })


    const newCustomerData = useRef({})

    const [kioskReferenceId, setKioskReferenceId] = useState()

    const [newCustomerDetails, setNewCustomerDetails] = useState({})
    const [selectedAccount, setSelectedAccount] = useState({})
    const [activeService, setActiveService] = useState({})

    const [selectedCustomerType, setSelectedCustomerType] = useState(custType)

    const [personalDetailsData, setPersonalDetailsData] = useState({
        customerId: 0,
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        contactType: '',
        contactTypeDesc: '',
        contactNbr: '',
        dob: '',
        gender: '',
        idType: '',
        idTypeDesc: '',
        idNumber: '',
        property1: '',
        property2: '',
        property3: ''
    });

    const [businessDetailsData, setBusinessDetailsData] = useState({
        customerId: 0,
        companyName: '',
        email: '',
        contactType: '',
        contactTypeDesc: '',
        contactNbr: '',
        registrationDate: '',
        registrationNbr: '',
        property1: '',
        property2: '',
        property3: ''
    });
    const [governmentDetailsData, setGovernmentDetailsData] = useState({
        companyName: '',
        category: '',
        categoryDesc: '',
        class: '',
        classDesc: '',
        email: '',
        contactType: '',
        contactTypeDesc: '',
        contactNbr: '',
        registrationDate: '',
        registrationNbr: '',
        property1: '',
        property2: '',
        property3: ''
    });

    const [customerAddress, setCustomerAddress] = useState({
        flatHouseUnitNo: '',
        building: '',
        street: '',
        district: '',
        state: '',
        cityTown: '',
        country: '',
        postCode: ''
    })

    const [personalAccountData, setPersonalAccountData] = useState({
        sameAsCustomerDetails: false,
        contactSameAsCustomerDetails: false,
        title: '',
        surName: '',
        foreName: '',
        email: '',
        contactType: '',
        contactTypeDesc: '',
        contactNbr: '',
        property1: '',
        property2: '',
        property3: '',
        baseCollPlan: '',
        baseCollPlanDesc: '',
        contactTitle: '',
        contactSurName: '',
        contactForeName: '',

    });

    const [businessAccountData, setBusinessAccountData] = useState({
        sameAsCustomerDetails: false,
        companyName: '',
        email: '',
        contactType: '',
        contactTypeDesc: '',
        contactNbr: '',
        property1: '',
        property2: '',
        property3: '',
        baseCollPlan: '',
        baseCollPlanDesc: '',
        contactTitle: '',
        contactSurName: '',
        contactForeName: '',
    });

    const [accountAddress, setAccountAddress] = useState({
        sameAsCustomerAddress: true,
        flatHouseUnitNo: '',
        building: '',
        street: '',
        district: '',
        state: '',
        cityTown: '',
        country: '',
        postCode: ''
    });

    const [billOptions, setBillOptions] = useState({
        billLanguage: '',
        billLanguageDesc: '',
        billDeliveryMethod: '',
        billDeliveryMethodDesc: '',
        noOfCopies: '1'
    });

    const [securityData, setSecurityData] = useState({
        securityQuestion: '',
        securityQuestionDesc: '',
        securityAnswer: ''
    });

    const [serviceData, setServiceData] = useState({
        serviceType: "",
        serviceTypeDesc: "",
        catalog: "",
        plan: "",
        services: [],
        addons: [],
        assets: [],
        property1: "",
        property2: "",
        property3: "",

        // catalog: '',
        // catalogDesc: '',
        // product: '',
        // productDesc: '',
        // prodType: '',
        // serviceItems: []
    });

    const [installationAddress, setInstallationAddress] = useState({
        sameAsCustomerAddress: true,
        flatHouseUnitNo: '',
        building: '',
        street: '',
        district: '',
        state: '',
        cityTown: '',
        country: '',
        postCode: ''
    });

    const [fixedService, setFixedService] = useState({
        serviceNumberSelection: '',
        serviceNumberSelectionDesc: '',
        serviceNumberGroup: '',
        serviceNumberGroupDesc: '',
        exchangeCode: '',
        exchangeCodeDesc: '',
        accessNbr: ''
    });

    const [mobileService, setMobileService] = useState({
        serviceNumberSelection: '',
        serviceNumberSelectionDesc: '',
        dealership: '',
        dealershipDesc: '',
        nbrGroup: '',
        nbrGroupDesc: '',
        accessNbr: ''
    });

    const [creditProfile, setCreditProfile] = useState({
        creditProfile: '',
        creditProfileDesc: ''
    });

    const [gsm, setGSM] = useState({
        assignSIMLater: false,
        iccid: '',
        confirmiccid: '',
        imsi: ''
    });

    const [deposit, setDeposit] = useState({
        includeExclude: '',
        charge: '',
        chargeDesc: '',
        excludeReason: ''
    });

    const [payment, setPayment] = useState({
        paymentMethod: '',
        paymentMethodDesc: ''
    });

    const [portIn, setPortIn] = useState({
        portInChecked: false,
        donor: '',
        donorDesc: '',
    });

    const [customerList, setCustomerList] = useState([])
    const [viewServiceDetails, setViewServiceDetails] = useState(false)
    const lookupData = useRef({})
    const addressLookup = useRef({})
    const plansList = useRef({})
    const catalogList = useRef({})
    const accountCategoryForClass = useRef([])
    const [addressLookUpRef, setAddressLookUpRef] = useState(null)
    const [categoryLookup, setCategoryLookup] = useState([{}])
    const [classLookup, setClassLookup] = useState([{}])
    const [contactTypeLookup, setContactTypeLookup] = useState([{}])
    const [districtLookup, setDistrictLookup] = useState([{}])
    const [kampongLookup, setKampongLookup] = useState([{}])
    const [postCodeLookup, setPostCodeLookup] = useState([{}])
    const [idTypeLookup, setIdTypeLookup] = useState([{}])
    const [priorityLookup, setPriorityLookup] = useState([{}])
    const [accountClassLookup, setAccountClassLookup] = useState([{}])
    const [accountCategoryLookup, setAccountCategoryLookup] = useState([{}])
    const [baseCollectionPlanLookup, setbaseCollectionPlanLookup] = useState([{}])
    const [billLanguageLookup, setBillLanguageLookup] = useState([{}])
    const [billDeliveryMethodLookup, setBillDeliveryMethodLookup] = useState([{}])
    const [securityQuestionLookup, setSecurityQuestionLookup] = useState([{}])
    const [catalogLookup, setCatalogLookup] = useState([{}])
    const [productLookup, setProductLookup] = useState([{}])
    const [fixedBBServiceNumberLookup, setFixedBBServiceNumberLookup] = useState([{}])
    const [mobileServiceNumberLookup, setMobileServiceNumberLookup] = useState([{}])
    const [exchangeCodeLookup, setExchangeCodeLookup] = useState([{}])
    const [dealershipLookup, setDealershipLookup] = useState([{}])
    const [creditProfileLookup, setCreditProfileLookup] = useState([{}])
    const [depositChargeLookup, setDepositChargeLookup] = useState([{}])
    const [paymentMethodLookup, setPaymentMethodLookup] = useState([{}])
    const [donorLookup, setDonorLookup] = useState([{}])

    const [customerTypeLookup, setCustomerTypeLookup] = useState([{}])

    const [serviceTypeLookup, setServiceTypeLookup] = useState([])
    const [selectedCatalog, setSelectedCatalog] = useState({})
    const [selectedPlan, setSelectedPlan] = useState({})
    const [selectedServiceList, setSelectedServiceList] = useState([])
    const [selectedAssetList, setSelectedAssetList] = useState([])
    // let addServiceCustomerId 
    const addServiceAccountId = props?.location?.state?.data?.accountDetails?.accountId
    const [addServiceCustomerId, setAddServiceCustomerId] = useState()
    const [checkSameCustomerDetails, setCheckSameCustomerDetails] = useState()
    const resetDataValues = () => {
        setCustomerDetailsError({})
        setAccountDetailsError({})
        setServiceDetailsError({})
        setPersonalDetailsData({
            ...personalDetailsData,
            title: '',
            foreName: '',
            surName: '',
            category: '',
            categoryDesc: '',
            class: '',
            classDesc: '',
            email: '',
            contactType: '',
            contactTypeDesc: '',
            contactNbr: ''
        })
        setBusinessDetailsData({
            ...businessDetailsData,
            companyName: '',
            category: '',
            categoryDesc: '',
            class: '',
            classDesc: '',
            email: '',
            contactType: '',
            contactTypeDesc: '',
            contactNbr: ''
        })
        setCustomerAddress({
            ...customerAddress,
            flatHouseUnitNo: '',
            block: '',
            building: '',
            street: '',
            road: '',
            district: '',
            state: '',
            village: '',
            cityTown: '',
            country: '',
            postCode: ''
        })
        setAccountAddress({
            ...accountAddress,
            sameAsCustomerAddress: true,
            flatHouseUnitNo: '',
            block: '',
            building: '',
            street: '',
            road: '',
            district: '',
            state: '',
            village: '',
            cityTown: '',
            country: '',
            postCode: ''
        })
        setBillOptions({
            ...billOptions,
            billLanguage: '',
            billLanguageDesc: '',
            billDeliveryMethod: '',
            billDeliveryMethodDesc: '',
            noOfCopies: '1'
        })
        setSecurityData({
            ...securityData,
            securityQuestion: '',
            securityQuestionDesc: '',
            securityAnswer: ''
        })
        setServiceData({
            ...serviceData,
            catalog: '',
            catalogDesc: '',
            product: '',
            productDesc: '',
            prodType: ''
        })
        setInstallationAddress({
            ...installationAddress,
            sameAsCustomerAddress: true,
            flatHouseUnitNo: '',
            block: '',
            building: '',
            street: '',
            road: '',
            district: '',
            state: '',
            village: '',
            cityTown: '',
            country: '',
            postCode: ''
        })
        setFixedService({
            ...fixedService,
            serviceNumberSelection: '',
            serviceNumberSelectionDesc: '',
            serviceNumberGroup: '',
            serviceNumberGroupDesc: '',
            exchangeCode: '',
            exchangeCodeDesc: '',
            accessNbr: ''
        })

        setMobileService({
            ...mobileService,
            serviceNumberSelection: '',
            serviceNumberSelectionDesc: '',
            dealership: '',
            dealershipDesc: '',
            nbrGroup: '',
            nbrGroupDesc: '',
            accessNbr: ''
        })
        setCreditProfile({
            ...creditProfile,
            creditProfile: '',
            creditProfileDesc: ''
        })
        setGSM({
            ...gsm,
            assignSIMLater: false,
            iccid: '',
            confirmiccid: '',
            imsi: ''
        })
        setDeposit({
            ...deposit,
            includeExclude: '',
            charge: '',
            chargeDesc: '',
            excludeReason: ''
        })
        setPayment({
            ...payment,
            paymentMethod: '',
            paymentMethodDesc: ''
        })
        setPortIn({
            ...portIn,
            portInChecked: false,
            donor: '',
            donorDesc: '',
        })

    }
    const handleModalClick = (data, showCustomer) => {


        setViewServiceDetails(showCustomer)

        
        get(properties.CUSTOMER360_API + '/' + data?.customerId).then((resp) => {
            if (resp.data) {
                //  console.log(resp.data)
                setCustomerData(resp.data)
                handleCustomerTypeChange(resp.data)
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
        //setRenderMode({ ...renderMode, customerTypeSelection: 'show' })
    }

    useEffect(() => {

        let rolePermission = []
        
        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)
            if (property[0] === "Service") {
                let value = Object.values(e)
                rolePermission = Object.values(value[0])
            }
        })

        let add;
        rolePermission.map((screen) => {
            if (screen.screenName === "Add Service") {
                add = screen.accessType
            }

        })
        setUserPermission({ createService: add })

        
    }, [auth])

    useEffect(() => {

        let district = []
        let kampong = []
        let postCode = []
        let plans = []

        

        post(properties.BUSINESS_ENTITY_API, ['CATEGORY',
            'PROD_TYPE',
            'CLASS',
            'CONTACT_TYPE',
            'ID_TYPE',
            'CUSTOMER_ID_TYPE',
            'PRIORITY',
            'ACCOUNT_CATEGORY',
            'ACCOUNT_CLASS',
            'BASE_COLL_PLAN',
            'BILL_LANGUAGE',
            'BILL_DELIVERY_METHOD',
            'SECURITY_QUESTION',
            'CATALOGUE',
            'FXD_BB_SERVICE_NUMBER_GROUP',
            'MOBILE_SERVICE_NUMBER_GROUP',
            'EXCHANGE_CODE',
            'DEALERSHIP',
            'CREDIT_PROFILE',
            'DEPOSIT_CHARGE',
            'PAYMENT_METHOD',
            'COUNTRY',
            'LOCATION',
            'CUSTOMER_TYPE', 'STATE', 'DISTRICT', 'POSTCODE'])
            .then((resp) => {
                if (resp.data) {
                    setCountries(resp.data.COUNTRY)
                    setLocations(resp.data.LOCATION)
                    lookupData.current = resp.data

                    get(properties.ADDRESS_LOOKUP_API)
                        .then((resp) => {
                            if (resp && resp.data) {
                                addressLookup.current = resp.data
                                setAddressLookUpRef(resp.data)
                                for (let e of addressLookup.current) {
                                    if (!district.includes(e.district)) {
                                        district.push(e.district)
                                    }
                                    if (!kampong.includes(e.kampong)) {
                                        kampong.push(e.kampong)
                                    }
                                    if (!postCode.includes(e.postCode)) {
                                        postCode.push(e.postCode)
                                    }
                                }
                                setAddServiceCustomerId(props?.location?.state?.data?.customerDetails?.customerId)

                                // get(properties.PLANS_API)
                                //     .then((resp) => {
                                //         if (resp && resp.data) {
                                //             plansList.current = resp.data
                                //             for (let p of plansList.current) {
                                //                 if (p.planType === 'BASE') {
                                //                     plans.push(p)
                                //                 }
                                //             }
                                //         }
                                //     });
                            }
                        }).catch((error) => {
                            console.log(error)
                        });
                    setServiceTypeLookup(lookupData.current['PROD_TYPE'])
                    setCategoryLookup(lookupData.current['CATEGORY'])
                    setClassLookup(lookupData.current['CLASS'])
                    setContactTypeLookup(lookupData.current['CONTACT_TYPE'])
                    setIdTypeLookup(lookupData.current['CUSTOMER_ID_TYPE'])
                    setPriorityLookup(lookupData.current['PRIORITY'])
                    setAccountCategoryLookup(lookupData.current['ACCOUNT_CATEGORY'])
                    setAccountClassLookup(lookupData.current['ACCOUNT_CLASS'])
                    setbaseCollectionPlanLookup(lookupData.current['BASE_COLL_PLAN'])
                    setBillLanguageLookup(lookupData.current['BILL_LANGUAGE'])
                    setBillDeliveryMethodLookup(lookupData.current['BILL_DELIVERY_METHOD'])
                    setSecurityQuestionLookup(lookupData.current['SECURITY_QUESTION'])
                    catalogList.current = lookupData.current['CATALOGUE']
                    setFixedBBServiceNumberLookup(lookupData.current['FXD_BB_SERVICE_NUMBER_GROUP'])
                    setMobileServiceNumberLookup(lookupData.current['MOBILE_SERVICE_NUMBER_GROUP'])
                    setExchangeCodeLookup(lookupData.current['EXCHANGE_CODE'])
                    setDealershipLookup(lookupData.current['DEALERSHIP'])
                    setCreditProfileLookup(lookupData.current['CREDIT_PROFILE'])
                    setDepositChargeLookup(lookupData.current['DEPOSIT_CHARGE'])
                    setPaymentMethodLookup(lookupData.current['PAYMENT_METHOD'])
                    setCustomerTypeLookup(lookupData.current['CUSTOMER_TYPE'])
                    setDistrictLookup(resp.data.DISTRICT)
                    setKampongLookup(resp.data.STATE)
                    setPostCodeLookup(resp.data.POSTCODE)


                    setRenderMode({ ...renderMode, customerTypeSelection: 'show' })
                    if (props.location.state !== undefined) {

                        const { data } = props.location.state
                        if (props.location.state.data !== undefined) {
                            if (data.sourceName === 'Inquiry') {
                                setRenderMode(
                                    {
                                        ...renderMode,
                                        customerDetails: 'form',
                                        //customerDetailsPreview: 'hide',
                                        accountDetails: 'form',
                                        //accountDetailsPreview: 'hide',
                                        serviceDetails: 'form',
                                        previewAndSubmitButton: 'show',
                                        //previewButton: 'show',
                                    }
                                )
                                //setRenderMode({ ...renderMode, customerTypeSelection: 'show' })
                            }
                        }
                    }
                    //  

                }
            }).catch((error) => {
                console.log(error)
            }).finally();

    }, []);


    const validate = (section, schema, data, holdPrevErrors = false) => {
        try {
            // if (section === 'CUSTOMER') {
            //     holdPrevErrors === false && setCustomerDetailsError({})
            // }
            if (section === 'ACCOUNT') {
                holdPrevErrors === false && setAccountDetailsError({})
            }
            if (section === 'SERVICE') {
                holdPrevErrors === false && setServiceDetailsError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                // if (section === 'CUSTOMER') {
                //     setCustomerDetailsError((prevState) => {
                //         return { ...prevState, [err.params.path]: err.message };
                //     });
                // }
                if (section === 'ACCOUNT') {
                    setAccountDetailsError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
                if (section === 'SERVICE') {
                    setServiceDetailsError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    const addressChangeHandler = (field, value) => {

    }

    const handleCustomerTypeChange = (selectUser) => {

        setProductLookup([{}])
        setServiceData({
            catalog: '',
            catalogDesc: '',
            product: '',
            productDesc: '',
            prodType: ''
        })
        //  console.log('test', selectUser)
        setSelectedCustomerType(selectUser?.custType)
        if (selectUser?.custType === 'RESIDENTIAL') {
            setPersonalDetailsData({
                customerId: selectUser?.customerId,
                title: selectUser?.title,
                firstName: selectUser?.firstName,
                lastName: selectUser?.lastName,
                email: selectUser?.contact?.email,
                contactType: selectUser?.contact?.contactType,
                contactTypeDesc: selectUser?.contact?.contactTypeDesc?.description,
                contactNbr: selectUser?.contact?.contactNo,
                gender: selectUser?.gender,
                idType: selectUser?.idType,
                idNumber: selectUser?.idValue,
                idTypeDesc: selectUser?.idTypeDesc?.description,
                dob: selectUser?.birthDate,
                property1: selectUser?.property_1,
                property2: selectUser?.property_2,
                property3: selectUser?.property_3,
            })
        }
        if (selectUser?.custType === 'BUSINESS' || selectUser?.custType === 'GOVERNMENT') {
            setBusinessDetailsData({
                customerId: selectUser?.customerId,
                companyName: selectUser?.firstName,
                email: selectUser?.contact?.email,
                contactType: selectUser?.contact?.contactType,
                contactTypeDesc: selectUser?.contact?.contactTypeDesc?.description,
                contactNbr: selectUser?.contact?.contactNo,
                registrationDate: selectUser?.regDate,
                registrationNbr: selectUser?.registeredNo,
                idType: selectUser?.idType,
                idNumber: selectUser?.idValue,
                idTypeDesc: selectUser?.idTypeDesc?.description,
                property1: selectUser?.property_1,
                property2: selectUser?.property_2,
                property3: selectUser?.property_3,
            })
        }
        setCustomerAddress({
            flatHouseUnitNo: selectUser?.address?.hno,
            building: selectUser?.address?.buildingName,
            street: selectUser?.address?.street,
            district: selectUser?.address?.district,
            state: selectUser?.address?.state,
            cityTown: selectUser?.address?.city,
            country: selectUser?.address?.country,
            postCode: selectUser?.address?.postCode,
            districtDesc: selectUser?.address?.districtDesc?.description,
            stateDesc: selectUser?.address?.stateDesc?.description,
            countryDesc: selectUser?.address?.countryDesc?.description,
            postCodeDesc: selectUser?.address?.postCodeDesc?.description
        })
        setRenderMode({
            ...renderMode,
            customerDetails: 'view',
            accountDetails: 'form',
            serviceDetails: 'form',
            previewAndSubmitButton: 'show'
        })
    }

    const handleCustomerDetailsCancel = () => {

        if (newCustomerData.current.customer.customerType === 'RESIDENTIAL') {
            setPersonalDetailsData(
                {
                    title: newCustomerData.current.customer.title,
                    foreName: newCustomerData.current.customer.foreName,
                    surName: newCustomerData.current.customer.surName,
                    category: newCustomerData.current.customer.category,
                    class: newCustomerData.current.customer.class,
                    email: newCustomerData.current.customer.email,
                    contactType: newCustomerData.current.customer.contactType,
                    contactNbr: newCustomerData.current.customer.contactNbr
                }
            )
        }
        if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
            setBusinessDetailsData(
                {
                    companyName: newCustomerData.current.customer.companyName,
                    category: newCustomerData.current.customer.category,
                    class: newCustomerData.current.customer.class,
                    email: newCustomerData.current.customer.email,
                    contactType: newCustomerData.current.customer.contactType,
                    contactNbr: newCustomerData.current.customer.contactNbr
                }
            )
        }
        setSelectedCustomerType(newCustomerData.current.customer.customerType)
        setRenderMode({
            ...renderMode,
            customerDetails: 'view',
            customerTypeSelection: 'hide'
        })
    }

    const handleCustomerDetailsDone = () => {
        if (setCustomerDetails()) {
            setRenderMode({
                ...renderMode,
                customerDetails: 'view',
                customerTypeSelection: 'hide'
            })
        }
    }

    const setCustomerDetails = () => {
        if (selectedCustomerType === 'RESIDENTIAL') {
            const personalError = validate('CUSTOMER', personalCustomerValidationSchema, personalDetailsData);
            const addressError = validate('CUSTOMER', addressValidationSchema, customerAddress, true);
            if (personalError || addressError) {
                toast.error("Validation errors found. Please check highlighted fields Hello");
                return false;
            }
        }

        if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
            const businessError = validate('CUSTOMER', businessCustomerValidationSchema, businessDetailsData);
            const addressError = validate('CUSTOMER', addressValidationSchema, customerAddress, true);
            if (businessError || addressError) {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
        }
        // if (selectedCustomerType === 'RESIDENTIAL') {
        //     if (personalDetailsData.contactNbr.length < 7) {
        //         toast.error("Please Enter 7 Digit Contact Number")
        //         return false;
        //     }
        // }
        // else if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
        //     if (businessDetailsData.contactNbr.length < 7) {
        //         toast.error("Please Enter 7 Digit Contact Number")
        //         return false;
        //     }
        // }
        if (!newCustomerData.current.customer) {
            newCustomerData.current.customer = {}
        }
        newCustomerData.current.customer.customerType = selectedCustomerType
        if (selectedCustomerType === 'RESIDENTIAL') {
            newCustomerData.current.customer.customerId = personalDetailsData.customerId
            newCustomerData.current.customer.title = personalDetailsData.title
            newCustomerData.current.customer.foreName = personalDetailsData.firstName
            newCustomerData.current.customer.surName = personalDetailsData.lastName
            newCustomerData.current.customer.gender = personalDetailsData.gender
            newCustomerData.current.customer.dob = personalDetailsData.dob
            newCustomerData.current.customer.idType = personalDetailsData.idType
            newCustomerData.current.customer.idTypeDesc = personalDetailsData.idTypeDesc
            newCustomerData.current.customer.idNbr = personalDetailsData.idNumber
            newCustomerData.current.customer.email = personalDetailsData.email
            newCustomerData.current.customer.contactType = personalDetailsData.contactType
            newCustomerData.current.customer.contactTypeDesc = personalDetailsData.contactTypeDesc
            newCustomerData.current.customer.contactNbr = personalDetailsData.contactNbr
            newCustomerData.current.customer.property1 = personalDetailsData.property1
            newCustomerData.current.customer.property2 = personalDetailsData.property2
            newCustomerData.current.customer.property3 = personalDetailsData.property3
            newCustomerData.current.customer.kioskRefId = (kioskReferenceId !== null) ? kioskReferenceId : null
        }
        if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
            newCustomerData.current.customer.customerId = businessDetailsData.customerId
            newCustomerData.current.customer.companyName = businessDetailsData.companyName
            newCustomerData.current.customer.idType = businessDetailsData?.idType
            newCustomerData.current.customer.idTypeDesc = businessDetailsData?.idTypeDesc
            newCustomerData.current.customer.idNbr = businessDetailsData?.idNumber
            newCustomerData.current.customer.property1 = businessDetailsData.property1
            newCustomerData.current.customer.property2 = businessDetailsData.property2
            newCustomerData.current.customer.property3 = businessDetailsData.property3
            newCustomerData.current.customer.registeredDate = businessDetailsData.registrationDate
            newCustomerData.current.customer.registeredNbr = businessDetailsData.registrationNbr
            newCustomerData.current.customer.email = businessDetailsData.email
            newCustomerData.current.customer.contactType = businessDetailsData.contactType
            newCustomerData.current.customer.contactTypeDesc = businessDetailsData.contactTypeDesc
            newCustomerData.current.customer.contactNbr = businessDetailsData.contactNbr
        }
        newCustomerData.current.customer.isCustBillable = customerData?.billableDetails?.isCustBillable
        //  console.log(newCustomerData.current.customer)
        if (!newCustomerData.current.customer.address) {
            newCustomerData.current.customer.address = []
        }
        newCustomerData.current.customer.address[0] = {
            flatHouseUnitNo: customerAddress.flatHouseUnitNo,
            //block: customerAddress.block,
            building: customerAddress.building,
            street: customerAddress.street,
            //road: customerAddress.road,
            district: customerAddress.district,
            state: customerAddress.state,
            //village: customerAddress.village,
            cityTown: customerAddress.cityTown,
            country: customerAddress.country,
            postCode: customerAddress.postCode,
            districtDesc: customerAddress?.districtDesc,
            stateDesc: customerAddress?.stateDesc,
            countryDesc: customerAddress?.countryDesc,
            postCodeDesc: customerAddress?.postCodeDesc
        }
        setDoneStatus({ ...doneStatus, customer: true })
        return true
    }

    const handleCustomerDetailsEdit = () => {
        setRenderMode({
            ...renderMode,
            customerDetails: 'form',
            customerTypeSelection: 'show'
        })
        setDoneStatus({ ...doneStatus, customer: false })
    }

    const handleAccountDetailsCancel = () => {
        setRenderMode({
            ...renderMode,
            accountDetails: 'view'
        })
    }

    const handleAccountDetailsDone = () => {
        if (setAccountDetails()) {
            setRenderMode({
                ...renderMode,
                accountDetails: 'view'
            })
        }
    }

    const setAccountDetails = () => {

        if (selectedCustomerType === 'RESIDENTIAL') {
            let error = validate('ACCOUNT', personalAccountValidationSchema, personalAccountData);
            let errorAddress
            if (!accountAddress.sameAsCustomerAddress) {
                errorAddress = validate('ACCOUNT', addressValidationSchema, accountAddress, true);
            }
            if ((error || errorAddress) && customerData && customerData?.billableDetails && customerData?.billableDetails?.isCustBillable === "N") {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }

        }
        if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
            let error = validate('ACCOUNT', businessAccountValidationSchema, businessAccountData);
            let errorAddress
            if (!accountAddress.sameAsCustomerAddress) {
                errorAddress = validate('ACCOUNT', addressValidationSchema, accountAddress, true);
            }

            if ((error || errorAddress) && customerData && customerData?.billableDetails && customerData?.billableDetails?.isCustBillable === "N") {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
        }

        // if (selectedCustomerType === 'RESIDENTIAL') {
        //     if (personalAccountData.contactNbr.length < 7) {
        //         toast.error("Please Enter 7 Digit Contact Number")
        //         return false;
        //     }
        // }
        // else if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
        //     if (businessAccountData.contactNbr.length < 7) {
        //         toast.error("Please Enter 7 Digit Contact Number")
        //         return false;
        //     }
        // }

        if (!newCustomerData.current.customer) {
            newCustomerData.current.customer = {}
        }
        if (!newCustomerData.current.customer.account) {
            newCustomerData.current.customer.account = []
            newCustomerData.current.customer.account.push({})
        }
        if (selectedCustomerType === 'RESIDENTIAL') {
            if (customerData && customerData?.billableDetails && customerData?.billableDetails?.isCustBillable === "N") {
                newCustomerData.current.customer.account[0].title = personalAccountData.title
                newCustomerData.current.customer.account[0].foreName = personalAccountData.foreName
                newCustomerData.current.customer.account[0].surName = personalAccountData.surName
                newCustomerData.current.customer.account[0].email = personalAccountData.email
                newCustomerData.current.customer.account[0].contactType = personalAccountData.contactType
                newCustomerData.current.customer.account[0].contactTypeDesc = personalAccountData.contactTypeDesc
                newCustomerData.current.customer.account[0].contactNbr = personalAccountData.contactNbr
                newCustomerData.current.customer.account[0].contactTitle = personalAccountData.contactTitle
                newCustomerData.current.customer.account[0].contactForeName = personalAccountData.contactForeName
                newCustomerData.current.customer.account[0].contactSurName = personalAccountData.contactSurName
                newCustomerData.current.customer.account[0].property1 = personalAccountData.property1
                newCustomerData.current.customer.account[0].property2 = personalAccountData.property2
                newCustomerData.current.customer.account[0].property3 = personalAccountData.property3
            } else {
                newCustomerData.current.customer.account[0].title = personalDetailsData.title
                newCustomerData.current.customer.account[0].foreName = personalDetailsData.firstName
                newCustomerData.current.customer.account[0].surName = personalDetailsData.lastName
                newCustomerData.current.customer.account[0].email = personalDetailsData.email
                newCustomerData.current.customer.account[0].contactType = personalDetailsData.contactType
                newCustomerData.current.customer.account[0].contactTypeDesc = personalDetailsData.contactTypeDesc
                newCustomerData.current.customer.account[0].contactNbr = personalDetailsData.contactNbr
                newCustomerData.current.customer.account[0].contactTitle = personalDetailsData.title
                newCustomerData.current.customer.account[0].contactForeName = personalDetailsData.firstName
                newCustomerData.current.customer.account[0].contactSurName = personalDetailsData.lastName
                newCustomerData.current.customer.account[0].property1 = personalDetailsData.property1
                newCustomerData.current.customer.account[0].property2 = personalDetailsData.property2
                newCustomerData.current.customer.account[0].property3 = personalDetailsData.property3
            }

        }
        if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
            if (customerData && customerData?.billableDetails && customerData?.billableDetails?.isCustBillable === "N") {
                newCustomerData.current.customer.account[0].companyName = businessAccountData.companyName
                newCustomerData.current.customer.account[0].email = businessAccountData.email
                newCustomerData.current.customer.account[0].contactType = businessAccountData.contactType
                newCustomerData.current.customer.account[0].contactTypeDesc = businessAccountData.contactTypeDesc
                newCustomerData.current.customer.account[0].contactNbr = businessAccountData.contactNbr
                newCustomerData.current.customer.account[0].contactTitle = businessAccountData.contactTitle
                newCustomerData.current.customer.account[0].contactForeName = businessAccountData.contactForeName
                newCustomerData.current.customer.account[0].contactSurName = businessAccountData.contactSurName
                newCustomerData.current.customer.account[0].property1 = businessAccountData.property1
                newCustomerData.current.customer.account[0].property2 = businessAccountData.property2
                newCustomerData.current.customer.account[0].property3 = businessAccountData.property3
            } else {
                newCustomerData.current.customer.account[0].companyName = businessDetailsData.companyName
                newCustomerData.current.customer.account[0].email = businessDetailsData.email
                newCustomerData.current.customer.account[0].contactType = businessDetailsData.contactType
                newCustomerData.current.customer.account[0].contactTypeDesc = businessDetailsData.contactTypeDesc
                newCustomerData.current.customer.account[0].contactNbr = businessDetailsData.contactNbr
                newCustomerData.current.customer.account[0].contactTitle = businessDetailsData.companyName
                newCustomerData.current.customer.account[0].contactForeName = businessDetailsData.companyName
                newCustomerData.current.customer.account[0].contactSurName = businessDetailsData.companyName
                newCustomerData.current.customer.account[0].property1 = businessDetailsData.property1
                newCustomerData.current.customer.account[0].property2 = businessDetailsData.property2
                newCustomerData.current.customer.account[0].property3 = businessDetailsData.property3
            }
        }

        if (!newCustomerData.current.customer.account[0].billingAddress) {
            newCustomerData.current.customer.account[0].billingAddress = []
            newCustomerData.current.customer.account[0].billingAddress.push({})
        }
        if (accountAddress.sameAsCustomerAddress) {
            newCustomerData.current.customer.account[0].billingAddress[0] = {
                sameAsCustomerAddress: true
            }
        } else {
            newCustomerData.current.customer.account[0].billingAddress[0] = {
                flatHouseUnitNo: accountAddress.flatHouseUnitNo,
                building: accountAddress.building,
                street: accountAddress.street,
                district: accountAddress.district,
                state: accountAddress.state,
                cityTown: accountAddress.cityTown,
                country: accountAddress.country,
                postCode: accountAddress.postCode,
                districtDesc: accountAddress?.districtDesc,
                stateDesc: accountAddress?.stateDesc,
                countryDesc: accountAddress?.countryDesc,
                postCodeDesc: accountAddress?.postCodeDesc
            }
        }
        setDoneStatus({ ...doneStatus, account: true })
        return true;

        // if (!newCustomerData.current.customer.account[0].billOptions) {
        //     newCustomerData.current.customer.account[0].billOptions = {}
        // }
        // newCustomerData.current.customer.account[0].billOptions.billLanguage = billOptions.billLanguage
        // newCustomerData.current.customer.account[0].billOptions.billLanguageDesc = billOptions.billLanguageDesc
        // newCustomerData.current.customer.account[0].billOptions.billDeliveryMethod = billOptions.billDeliveryMethod
        // newCustomerData.current.customer.account[0].billOptions.billDeliveryMethodDesc = billOptions.billDeliveryMethodDesc
        // newCustomerData.current.customer.account[0].billOptions.noOfCopies = billOptions.noOfCopies

        // if (!newCustomerData.current.customer.account[0].securityData) {
        //     newCustomerData.current.customer.account[0].securityData = {}
        // }
        // newCustomerData.current.customer.account[0].securityData.securityQuestion = securityData.securityQuestion
        // newCustomerData.current.customer.account[0].securityData.securityQuestionDesc = securityData.securityQuestionDesc
        // newCustomerData.current.customer.account[0].securityData.securityAnswer = securityData.securityAnswer

    }

    const handleAccountDetailsEdit = () => {
        setRenderMode({
            ...renderMode,
            accountDetails: 'form'
        })
        setDoneStatus({ ...doneStatus, account: false })
    }

    const handleServiceDetailsCancel = () => {
        setRenderMode({
            ...renderMode,
            serviceDetails: 'view'
        })
    }

    // const handleServiceDetailsDone = () => {
    //     if (setServiceDetails()) {
    //         setRenderMode({
    //             ...renderMode,
    //             serviceDetails: 'view'
    //         })
    //     }
    // }

    const handleSameAsCustomerDetailsChange = (value) => {
        let accountPartDetails = {}
        if (value) {
            if (selectedCustomerType === 'RESIDENTIAL') {
                accountPartDetails.title = personalDetailsData.title
                accountPartDetails.foreName = personalDetailsData.firstName
                accountPartDetails.surName = personalDetailsData.lastName
                accountPartDetails.email = personalDetailsData.email
                accountPartDetails.contactType = personalDetailsData.contactType
                accountPartDetails.contactTypeDesc = personalDetailsData.contactTypeDesc
                accountPartDetails.contactNbr = personalDetailsData.contactNbr
                setPersonalAccountData({ ...personalAccountData, ...accountPartDetails, sameAsCustomerDetails: value })
            }
            if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
                accountPartDetails.companyName = businessDetailsData.companyName
                accountPartDetails.email = businessDetailsData.email
                accountPartDetails.contactType = businessDetailsData.contactType
                accountPartDetails.contactTypeDesc = businessDetailsData.contactTypeDesc
                accountPartDetails.contactNbr = businessDetailsData.contactNbr
                setBusinessAccountData({ ...businessAccountData, ...accountPartDetails, sameAsCustomerDetails: value })
            }
        } else {
            if (selectedCustomerType === 'RESIDENTIAL') {
                setPersonalAccountData({ ...personalAccountData, title: "", foreName: "", surName: "", email: "", contactType: "", contactTypeDesc: "", contactNbr: "", sameAsCustomerDetails: value })
            }
            if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
                setBusinessAccountData({ ...businessAccountData, companyName: "", email: "", contactType: "", contactTypeDesc: "", contactNbr: "", sameAsCustomerDetails: value })
            }
        }
    }

    const handleContactSameAsCustomerDetailsChange = (value) => {
        let accountContactPartDetails = {}

        if (value) {
            if (selectedCustomerType === 'RESIDENTIAL') {
                accountContactPartDetails.contactTitle = personalDetailsData.title
                accountContactPartDetails.contactSurName = personalDetailsData.lastName
                accountContactPartDetails.contactForeName = personalDetailsData && personalDetailsData.firstName.slice(0, 40)
                setPersonalAccountData({ ...personalAccountData, ...accountContactPartDetails, contactSameAsCustomerDetails: value })
            }

        } else {
            if (selectedCustomerType === 'RESIDENTIAL') {
                setPersonalAccountData({ ...personalAccountData, contactTitle: "", contactSurName: "", contactForeName: "", contactSameAsCustomerDetails: value })
            }

        }
    }

    const setServiceDetails = () => {
        let error = validate('SERVICE', serviceDataValidationSchema, serviceData, true);
        let error1
        if (!installationAddress.sameAsCustomerAddress) {
            error1 = validate('SERVICE', addressValidationSchema, installationAddress, true);
        }
        //let error2 = validate('SERVICE', fixedServiceValidationSchema, fixedService, true);
        if (error || error1) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        if (!selectedCatalog?.catalogId && !selectedPlan?.planId && selectedServiceList.length === 0 && selectedAssetList.length === 0) {
            toast.error('Please select at least a Catalog/Plan/Service/Asset')
            return
        }

        if (!newCustomerData.current.customer) {
            newCustomerData.current.customer = {}
        }
        if (!newCustomerData.current.customer.account) {
            newCustomerData.current.customer.account = []
            newCustomerData.current.customer.account.push({})
        }

        if (!newCustomerData.current.customer.account[0].service) {
            newCustomerData.current.customer.account[0].service = []
            newCustomerData.current.customer.account[0].service.push({})
        }
        newCustomerData.current.customer.account[0].service[0].serviceType = serviceData.serviceType
        newCustomerData.current.customer.account[0].service[0].serviceTypeDesc = serviceData.serviceTypeDesc
        newCustomerData.current.customer.account[0].service[0].catalog = selectedCatalog?.catalogId || ""
        newCustomerData.current.customer.account[0].service[0].plan = selectedPlan?.planId || ""
        newCustomerData.current.customer.account[0].service[0].addons = serviceData?.addons || []
        newCustomerData.current.customer.account[0].service[0].assets = serviceData?.assets || []
        newCustomerData.current.customer.account[0].service[0].services = serviceData?.services || []
        newCustomerData.current.customer.account[0].service[0].selectedCatalog = selectedCatalog || {}
        newCustomerData.current.customer.account[0].service[0].selectedPlan = selectedPlan || {}
        //newCustomerData.current.customer.account[0].service[0].selectedAddonList = serviceData?.addons || []
        newCustomerData.current.customer.account[0].service[0].selectedAssetList = selectedAssetList || []
        newCustomerData.current.customer.account[0].service[0].selectedServiceList = selectedServiceList || []
        newCustomerData.current.customer.account[0].service[0].property1 = serviceData?.property1
        newCustomerData.current.customer.account[0].service[0].property2 = serviceData?.property2
        newCustomerData.current.customer.account[0].service[0].property3 = serviceData?.property3
        if (!newCustomerData.current.customer.account[0].service[0].installationAddress) {
            newCustomerData.current.customer.account[0].service[0].installationAddress = []
            newCustomerData.current.customer.account[0].service[0].installationAddress.push({})
        }
        if (installationAddress.sameAsCustomerAddress) {
            newCustomerData.current.customer.account[0].service[0].installationAddress[0] = {
                sameAsCustomerAddress: true
            }
        } else {
            newCustomerData.current.customer.account[0].service[0].installationAddress[0] = {
                flatHouseUnitNo: installationAddress.flatHouseUnitNo,
                building: installationAddress.building,
                street: installationAddress.street,
                district: installationAddress.district,
                state: installationAddress.state,
                cityTown: installationAddress.cityTown,
                country: installationAddress.country,
                postCode: installationAddress.postCode,
                districtDesc: installationAddress?.districtDesc,
                stateDesc: installationAddress?.stateDesc,
                countryDesc: installationAddress?.countryDesc,
                postCodeDesc: installationAddress?.postCodeDesc
            }
        }
        if (!newCustomerData.current.customer.account[0].service[0].fixed) {
            newCustomerData.current.customer.account[0].service[0].fixed = {}
        }
        newCustomerData.current.customer.account[0].service[0].fixed.serviceNumberSelection = fixedService.serviceNumberSelection
        if (fixedService.serviceNumberSelection === 'manual') {
            newCustomerData.current.customer.account[0].service[0].fixed.serviceNumberSelection = 'manual'
            newCustomerData.current.customer.account[0].service[0].fixed.accessNbr = fixedService?.accessNbr
        } else {
            newCustomerData.current.customer.account[0].service[0].fixed.serviceNumberSelection = 'auto'
        }
        setDoneStatus({ ...doneStatus, service: true })
        return true
    }



    const handlePreviewAndSubmit = () => {
        if (setCustomerDetails() && setAccountDetails() && setServiceDetails()) {
            toast.success("Field validations completed successfully");
            // console.log("customer Data : ", newCustomerData.current.customer)
            setRenderMode({
                ...renderMode,
                previewAndSubmitButton: 'hide',
                printButton: 'show',
                submitButton: 'show',
                previewCancelButton: 'show',
                previewCloseButton: 'hide'
            })
            NewCustomerPreviewModal.setAppElement('#newcustomerpreview');
            setNewCustomerPreviewModalState({ ...newCustomerPreviewModalState, state: true });
        }
    }

    const handlePreview = () => {
        setRenderMode({
            ...renderMode,
            customerTypeSelection: 'hide',
            customerDetails: 'view',
            accountDetails: 'view',
            serviceDetails: 'view',
            previewAndSubmitButton: 'hide',
            printButton: 'show',
            submitButton: 'hide',
            previewCancelButton: 'hide',
            previewCloseButton: 'show'
        })
        NewCustomerPreviewModal.setAppElement('#newcustomerpreview');
        setNewCustomerPreviewModalState({ ...newCustomerPreviewModalState, state: true });
    }
    const handleNewCustomerPreviewModalClose = () => {
        setRenderMode({
            ...renderMode,
            customerTypeSelection: 'hide',
            customerDetails: 'view',
            accountDetails: 'view',
            serviceDetails: 'view',
            previewAndSubmitButton: 'hide',
            previewButton: 'show'
        })
        setNewCustomerPreviewModalState({ ...newCustomerPreviewModalState, state: false });
    }

    const handlePreviewCancel = () => {
        setNewCustomerPreviewModalState({
            ...newCustomerPreviewModalState,
            state: false
        })
        setRenderMode({
            ...renderMode,
            customerTypeSelection: 'hide',
            customerDetails: 'view',
            accountDetails: 'form',
            serviceDetails: 'form',
            previewAndSubmitButton: 'show',
            previewCancelButton: 'hide',
            previewSubmitButton: 'hide',
            printButton: 'hide'
        })
        setDoneStatus({
            customer: false,
            account: false,
            service: false
        })
    }

    const handleSubmit = () => {
        console.log('newCustomerData.current.customer', newCustomerData.current.customer)
        if (addServiceAccountId) {
            newCustomerData.current.customer.account[0].accountId = addServiceAccountId
        }
        console.log('addServiceAccountId', addServiceAccountId)
        console.log('addServiceAccountId', newCustomerData)
        //   return false
        
        post(properties.CUSTOMER_API, newCustomerData.current.customer)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        toast.success("Customer, Account & Service created successfully " + resp?.data?.customerId);
                        props.history.push(`${process.env.REACT_APP_BASE}/`);
                        setRenderMode({
                            ...renderMode,
                            submitted: 'yes',
                            printButton: 'show',
                            submitAndPreviewButton: 'hide',
                            submitButton: 'hide',
                            previewCancelButton: 'hide',
                            previewButton: 'show',
                            previewCloseButton: 'show',
                            customerDetailsEditButton: 'hide',
                            accountDetailsEditButton: 'hide',
                            serviceDetailsEditButton: 'hide'
                        })
                        setNewCustomerDetails({
                            customerId: resp.data.customerId
                        })
                        setSelectedAccount({
                            accountId: resp.data.accountId
                        })
                        setActiveService(resp.data.serviceId)
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

    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [categoryOrClassData, setCategoryOrClassData] = useState({
        category: '',
        categoryDesc: '',
        class: '',
        classDesc: '',
    })
    const handleClick = () => {

        setIsCustomerLookupModalOpen(true)

    }

    const handleAddService = useCallback(() => {
        
        return new Promise((resolve, reject) => {
            get(properties.CUSTOMER360_API + '/' + addServiceCustomerId).then((resp) => {
                if (resp.data) {
                    unstable_batchedUpdates(() => {
                        setCustomerData(resp.data)
                        handleCustomerTypeChange(resp.data)
                    })
                    setViewServiceDetails(true)
                    resolve(resp.data)
                }
            }).catch(error => {
                console.error(error);
                reject(error);
            }).finally()
        })
    })

    useEffect(() => {
        if (addServiceCustomerId !== null && addServiceCustomerId !== undefined) {
            const response = handleAddService()
            response.then((resolved, rejected) => {
                if (resolved) {
                    setCheckSameCustomerDetails(true)
                }
            }).catch((error) => {
                console.log(error)
            })
        }
    }, [addServiceCustomerId])

    const handleSameCustomerDetails = (value) => {
        let accountPartDetails = {}
        let accountContactPartDetails = {}
        if (value) {
            if (selectedCustomerType === 'RESIDENTIAL') {
                accountPartDetails.title = personalDetailsData.title
                accountPartDetails.foreName = personalDetailsData.firstName
                accountPartDetails.surName = personalDetailsData.lastName
                accountPartDetails.email = personalDetailsData.email
                accountPartDetails.contactType = personalDetailsData.contactType
                accountPartDetails.contactTypeDesc = personalDetailsData.contactTypeDesc
                accountPartDetails.contactNbr = personalDetailsData.contactNbr
                accountContactPartDetails.contactTitle = personalDetailsData.title
                accountContactPartDetails.contactSurName = personalDetailsData.lastName
                accountContactPartDetails.contactForeName = personalDetailsData && personalDetailsData.firstName.slice(0, 40)
                setPersonalAccountData({ ...personalAccountData, ...accountPartDetails, ...accountContactPartDetails, sameAsCustomerDetails: value, contactSameAsCustomerDetails: value })
            }
            if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
                accountPartDetails.companyName = businessDetailsData.companyName
                accountPartDetails.email = businessDetailsData.email
                accountPartDetails.contactType = businessDetailsData.contactType
                accountPartDetails.contactTypeDesc = businessDetailsData.contactTypeDesc
                accountPartDetails.contactNbr = businessDetailsData.contactNbr
                setBusinessAccountData({ ...businessAccountData, ...accountPartDetails, sameAsCustomerDetails: value })
            }
        } else {
            if (selectedCustomerType === 'RESIDENTIAL') {
                setPersonalAccountData({ ...personalAccountData, title: "", foreName: "", surName: "", email: "", contactType: "", contactTypeDesc: "", contactNbr: "", sameAsCustomerDetails: value, contactTitle: "", contactSurName: "", contactForeName: "", contactSameAsCustomerDetails: value })
            }
            if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
                setBusinessAccountData({ ...businessAccountData, companyName: "", email: "", contactType: "", contactTypeDesc: "", contactNbr: "", sameAsCustomerDetails: value })
            }
        }
    }

    useEffect(() => {
        if (checkSameCustomerDetails) {
            handleSameCustomerDetails(true)
        }
    }, [checkSameCustomerDetails])

    return (
        <>
            {userPermission?.createService !== 'deny' && <div>
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box">
                            <h4 className="page-title">Add New Service</h4>
                        </div>
                    </div>
                </div>
                <div className="row mt-1">
                    <div className="col-12 p-0">
                        <div className="card-box">
                            <div className="d-flex">
                                <div className="col-2 p-0 sticky">
                                    <ul className="list-group">
                                        <li>
                                            <Link activeclassName="active" className="list-group-item list-group-item-action" to="customersection" spy={true} offset={-190} smooth={true} duration={100}>
                                                Customer
                                                {
                                                    (doneStatus && doneStatus.customer) ?
                                                        <i className="fe-check float-right"></i>
                                                        :
                                                        <></>
                                                }
                                            </Link>
                                        </li>
                                        {
                                            customerData && customerData?.billableDetails && customerData?.billableDetails?.isCustBillable === "N" &&
                                            <li>
                                                <Link activeclassName="active" className="list-group-item list-group-item-action" to="accountSection" spy={true} offset={-190} smooth={true} duration={100}>
                                                    Accounts
                                                    {
                                                        (doneStatus && doneStatus.account) ?
                                                            <i className="fe-check float-right"></i>
                                                            :
                                                            <></>
                                                    }
                                                </Link>
                                            </li>
                                        }
                                        <li>
                                            <Link activeclassName="active" className="list-group-item list-group-item-action" to="serviceSection" spy={true} offset={-190} smooth={true} duration={100}>
                                                Services
                                                {
                                                    (doneStatus && doneStatus.service) ?
                                                        <i className="fe-check float-right"></i>
                                                        :
                                                        <></>
                                                }
                                            </Link>
                                        </li>
                                        {
                                            (newCustomerDetails && newCustomerDetails.customerId) ?
                                                <li><Link activeclassName="active" className="list-group-item list-group-item-action" to="serviceRequestSection" spy={true} offset={-350} smooth={true} duration={100}>Service Request</Link></li>
                                                :
                                                <></>
                                        }
                                    </ul>
                                </div>
                                <div className="new-customer col-md-10">
                                    <div className="scrollspy-div">
                                        <Element name="customersection" className="element" >
                                            <div className="row">
                                                <div className="title-box col-12 p-0">
                                                    <section className="triangle">
                                                        <h4 className="pl-2" style={{ alignContent: 'left' }}>Add New Service</h4>
                                                    </section>
                                                </div>
                                            </div>
                                            {
                                                <div className="pt-2 pr-2 pl-2">
                                                    <Element className="p-0">
                                                        <div id="searchBlock" className="modal-body p-0" style={{ display: "block" }}>
                                                            <div className="row">
                                                                <div className="col-12 p-0 mb-2 ml-3">
                                                                    <div className="input-group input-group-sm ">
                                                                        <label htmlFor="customerNumber" className="col-form-label mt-1">Lookup Customer Details </label>&nbsp;
                                                                        <button type="button" className="btn waves-effect waves-light btn-primary mt-1 ml-1 btn-sm" onClick={handleClick} ><i className="fa fa-search mr-1"></i> Search</button>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                            <hr></hr>
                                                        </div>
                                                    </Element>
                                                    {
                                                    isCustomerLookupModalOpen === true &&
                                                        <CustomerLookupModal data={{

                                                            isOpen: isCustomerLookupModalOpen,

                                                        }}
                                                            modalStateHandlers={{
                                                                setIsOpen: setIsCustomerLookupModalOpen,
                                                                handleModalClick: handleModalClick
                                                            }} 
                                                        />
                                                    }
                                                    {viewServiceDetails === true ?

                                                        <></> : <></>}
                                                </div>

                                            }

                                            {
                                                (selectedCustomerType && selectedCustomerType !== ''
                                                    && addressLookUpRef && addressLookUpRef !== null && viewServiceDetails === true) ?
                                                    <div className="pt-0 pr-2 pl-2 d-none">
                                                        <fieldset className="scheduler-border">
                                                            {
                                                                (selectedCustomerType === 'RESIDENTIAL' && renderMode.customerDetails === 'form') ?
                                                                    <CustomerDetailsForm data={{
                                                                        personalDetailsData: personalDetailsData,
                                                                        personalAccountData: personalAccountData,
                                                                        customerAddress: customerAddress,
                                                                        countries: countries,
                                                                        locations: locations,
                                                                        detailsValidate: detailsValidate,
                                                                        source: 'Create',
                                                                    }}
                                                                        customerType={selectedCustomerType}
                                                                        lookups={{
                                                                            categoryLookup: categoryLookup,
                                                                            classLookup: classLookup,
                                                                            contactTypeLookup: contactTypeLookup,
                                                                            districtLookup: districtLookup,
                                                                            kampongLookup: kampongLookup,
                                                                            postCodeLookup: postCodeLookup,
                                                                            idTypeLookup: idTypeLookup,
                                                                            addressElements: addressLookUpRef //addressLookup.current
                                                                        }}
                                                                        lookupsHandler={{
                                                                            addressChangeHandler: addressChangeHandler
                                                                        }}
                                                                        stateHandler={{
                                                                            setPersonalDetailsData: setPersonalDetailsData,
                                                                            setPersonalAccountData: setPersonalAccountData,
                                                                            setCustomerAddress: setCustomerAddress,
                                                                            setDetailsValidate: setDetailsValidate
                                                                        }}
                                                                        error={customerDetailsError}
                                                                        setError={setCustomerDetailsError}
                                                                    />
                                                                    :
                                                                    <></>
                                                            }
                                                            {
                                                                (selectedCustomerType === 'RESIDENTIAL' && renderMode.customerDetails === 'view') ?
                                                                    <CustomerDetailsPreview custType={selectedCustomerType}
                                                                        data={{
                                                                            personalDetailsData: personalDetailsData,
                                                                            customerAddress: customerAddress
                                                                        }}
                                                                    />
                                                                    :
                                                                    <></>
                                                            }                                                                                                                                                                          
                                                        </fieldset>
                                                        {
                                                            (renderMode.customerDetails === 'form') ?
                                                                <div className="d-flex justify-content-end mr-0">
                                                                    <button type="button" className="btn btn-sm btn-primary p-1 waves-effect waves-light ml-2" onClick={handleCustomerDetailsDone}>Done</button>
                                                                </div>
                                                                :
                                                                <></>
                                                        }
                                                        {
                                                            (renderMode.customerDetails === 'view' && renderMode.customerDetailsEditButton === 'show') ?
                                                                <div className="d-flex justify-content-end edit-btn mr-0">
                                                                    <button type="button" className="btn btn-sm btn-primary p-1 btn-sm  waves-effect waves-light mr-2" onClick={handleCustomerDetailsEdit}>Edit</button>
                                                                </div>
                                                                :
                                                                <></>
                                                        }
                                                    </div>
                                                    :
                                                    <></>
                                            }
                                        </Element>
                                        {viewServiceDetails === true ? <div>
                                            {
                                                customerData && customerData?.billableDetails && customerData?.billableDetails?.isCustBillable === "N" &&
                                                <Element name="accountSection" className="element">
                                                    <div className="row">
                                                        <div className="title-box col-12 p-0">
                                                            <section className="triangle">
                                                                <h4 className="pl-2">Account</h4>
                                                            </section>
                                                        </div>
                                                    </div>
                                                    {
                                                        (selectedCustomerType && selectedCustomerType !== '') ?
                                                            <div className="pt-2 pr-2 pl-2">
                                                                <fieldset className="scheduler-border">                                                                   
                                                                    <AccountDetailsForm data={{
                                                                        personalDetailsData: personalDetailsData,
                                                                        accountData: personalAccountData,
                                                                        accountAddress: accountAddress,
                                                                        billOptions: billOptions,
                                                                        securityData: securityData,
                                                                        countries: countries,
                                                                        locations: locations,
                                                                        detailsValidate: detailsValidate,
                                                                        source: 'Create',
                                                                        selectedCustomerType: selectedCustomerType
                                                                    }}
                                                                        lookups={{
                                                                            idTypeLookup: idTypeLookup,
                                                                            contactTypeLookup: contactTypeLookup,
                                                                            priorityLookup: priorityLookup,
                                                                            accountClassLookup: accountClassLookup,
                                                                            accountCategoryLookup: accountCategoryLookup,
                                                                            baseCollectionPlanLookup: baseCollectionPlanLookup,
                                                                            billLanguageLookup: billLanguageLookup,
                                                                            billDeliveryMethodLookup: billDeliveryMethodLookup,
                                                                            securityQuestionLookup: securityQuestionLookup,
                                                                            districtLookup: districtLookup,
                                                                            kampongLookup: kampongLookup,
                                                                            postCodeLookup: postCodeLookup,
                                                                            accountCategoryForClass: accountCategoryForClass,
                                                                            addressElements: addressLookUpRef,//addressLookup.current,
                                                                            customerTypeLookup: customerTypeLookup
                                                                        }}
                                                                        error={accountDetailsError}
                                                                        setError={setAccountDetailsError}
                                                                        lookupsHandler={{
                                                                            addressChangeHandler: addressChangeHandler
                                                                        }}
                                                                        handler={{
                                                                            setAccountData: setPersonalAccountData,
                                                                            setAccountAddress: setAccountAddress,
                                                                            setBillOptions: setBillOptions,
                                                                            setSecurityData: setSecurityData,
                                                                            handleSameAsCustomerDetailsChange: handleSameAsCustomerDetailsChange,
                                                                            handleContactSameAsCustomerDetailsChange: handleContactSameAsCustomerDetailsChange,
                                                                            setDetailsValidate: setAccountValidate
                                                                        }}
                                                                    />
                                                                                                                                 

                                                                </fieldset>
                                                            </div>
                                                            :
                                                            <></>
                                                    }


                                                </Element>
                                            }
                                            <Element name="serviceSection" className="element">
                                                <div className="row">
                                                    <div className="title-box col-12 p-0">
                                                        <section className="triangle">
                                                            <h4 className="pl-2">Services</h4>
                                                        </section>
                                                    </div>
                                                </div>
                                                <div><br></br></div>

                                                {

                                                    (selectedCustomerType && selectedCustomerType !== ''
                                                        && addressLookUpRef && addressLookUpRef !== null) ?
                                                        <div className="pr-2 pl-2">
                                                            <fieldset className="scheduler-border mr-0 pr-0">
                                                                {
                                                                    (renderMode.serviceDetails === 'form') ?
                                                                        <ServiceDetailsForm data={{
                                                                            serviceData: serviceData,
                                                                            installationAddress: installationAddress,
                                                                            fixedService: fixedService,
                                                                            mobileService: mobileService,
                                                                            gsm: gsm,
                                                                            creditProfile: creditProfile,
                                                                            deposit: deposit,
                                                                            payment: payment,
                                                                            portIn: portIn,
                                                                            countries: countries,
                                                                            locations: locations,
                                                                            detailsValidate: detailsValidate,
                                                                            source: 'Create',
                                                                            selectedCatalog,
                                                                            selectedPlan,
                                                                            selectedAssetList,
                                                                            selectedServiceList
                                                                        }}
                                                                            lookups={{
                                                                                serviceTypeLookup: serviceTypeLookup,
                                                                                catalogLookup: catalogLookup,
                                                                                productLookup: productLookup,
                                                                                fixedBBServiceNumberLookup: fixedBBServiceNumberLookup,
                                                                                mobileServiceNumberLookup: mobileServiceNumberLookup,
                                                                                dealershipLookup: dealershipLookup,
                                                                                exchangeCodeLookup: exchangeCodeLookup,
                                                                                creditProfileLookup: creditProfileLookup,
                                                                                depositChargeLookup: depositChargeLookup,
                                                                                paymentMethodLookup: paymentMethodLookup,
                                                                                districtLookup: districtLookup,
                                                                                kampongLookup: kampongLookup,
                                                                                postCodeLookup: postCodeLookup,
                                                                                donorLookup: donorLookup,
                                                                                plansList: plansList,
                                                                                addressElements: addressLookUpRef//addressLookup.current
                                                                            }}
                                                                            lookupsHandler={{
                                                                                addressChangeHandler: addressChangeHandler,
                                                                                setProductLookup: setProductLookup
                                                                            }}
                                                                            error={serviceDetailsError}
                                                                            setError={setServiceDetailsError}
                                                                            handler={{
                                                                                setServiceData: setServiceData,
                                                                                setInstallationAddress: setInstallationAddress,
                                                                                setFixedService: setFixedService,
                                                                                setMobileService: setMobileService,
                                                                                setGSM: setGSM,
                                                                                setCreditProfile: setCreditProfile,
                                                                                setDeposit: setDeposit,
                                                                                setPayment: setPayment,
                                                                                setPortIn: setPortIn,
                                                                                setDetailsValidate: setServiceValidate,
                                                                                setSelectedCatalog,
                                                                                setSelectedPlan,
                                                                                setSelectedServiceList,
                                                                                setSelectedAssetList
                                                                            }}
                                                                            setFound={setFound}
                                                                            found={found}
                                                                        />
                                                                        :
                                                                        <></>
                                                                }
                                                                {
                                                                    (renderMode.serviceDetails === 'view') ?
                                                                        <ServiceDetailsFormView data={{
                                                                            serviceData: serviceData,
                                                                            installationAddress: installationAddress,
                                                                            fixedService: fixedService,
                                                                            mobileService: mobileService,
                                                                            creditProfile: creditProfile,
                                                                            gsm: gsm,
                                                                            deposit: deposit,
                                                                            plansList: plansList,
                                                                            payment: payment,
                                                                            portIn: portIn
                                                                        }}
                                                                        />
                                                                        :
                                                                        <></>
                                                                }
                                                            </fieldset>
                                                        </div>
                                                        :
                                                        <></>
                                                }

                                            </Element>
                                            <div className="d-flex justify-content-center">
                                                {
                                                    (renderMode.previewAndSubmitButton === 'show') ?
                                                        <>
                                                            <button type="button" className="btn btn-primary btn-md  waves-effect waves-light ml-2" onClick={handlePreviewAndSubmit}>Preview and Submit</button>
                                                            <button type="button" className="btn btn-secondary btn-md  waves-effect waves-light ml-2" onClick={() => props.history.goBack()}>Cancel</button>
                                                        </>
                                                        :
                                                        <></>
                                                }
                                                {
                                                    (renderMode.previewButton === 'show') ?
                                                        <button type="button" className="btn btn-primary btn-md  waves-effect waves-light ml-2" onClick={handlePreview}>View Again</button>
                                                        :
                                                        <></>
                                                }
                                            </div>
                                            {
                                                (newCustomerDetails && newCustomerDetails.customerId) ?
                                                    <Element name="serviceRequestSection">
                                                        {/* <section className="triangle col-12">
                                                    <div className="row col-12">
                                                        <div className="col-8">
                                                            <h4 className="pl-1">Service Requests</h4>
                                                            <button type="button" className="btn btn-sm btn-primary p-1 pb-2 float-right" onClick={() => { setRefreshServiceRequest(!refreshServiceRequest) }}>Refresh</button>
                                                        </div>
                                                    </div>
                                                </section> */}
                                                        <section className="triangle col-md-12">
                                                            <div className="tit-his row col-md-12">
                                                                <div className="col-md-3">
                                                                    <h5 className="pl-1">Service Requests</h5>
                                                                </div>
                                                                <div className="col-md-9 mt-1">
                                                                    <span className="act-btn" style={{ float: "right" }}><button type="button" style={{ float: "right" }} className="btn btn-sm btn-primary p-1" onClick={() => { setRefreshServiceRequest(!refreshServiceRequest) }}>Refresh</button></span>
                                                                </div>
                                                            </div>
                                                        </section>
                                                        <div className="col-md-12 pl-2 pr-2 pt-2 pb-1">
                                                            <div className="form-row bg-light pt-2 ml-0 mr-0">
                                                                <div className="form-row border col-12 p-0 ml-0 mr-0">
                                                                    <div className="col-md-12 card-box m-0 p-0">
                                                                        {/* <ServiceRequestList
                                                                    data={{
                                                                        customerDetails: newCustomerDetails,
                                                                        leftNavCounts: leftNavCounts,
                                                                        refreshServiceRequest: refreshServiceRequest,
                                                                        selectedAccount: selectedAccount,
                                                                        activeService: activeService
                                                                    }}
                                                                    handler={{
                                                                        setLeftNavCounts: setLeftNavCounts
                                                                    }}
                                                                /> */}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Element>
                                                    :
                                                    <></>
                                            }
                                        </div> : <></>}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div >
                </div >
                <div id="newcustomerpreview">
                    {
                        (newCustomerPreviewModalState.state) ?
                            <NewCustomerPreviewModal isOpen={newCustomerPreviewModalState.state}>
                                <CustomerDetailsFormView
                                    previewData={{
                                        renderMode: renderMode
                                    }}
                                    data={{
                                        newCustomerData: newCustomerData,
                                        plansList: plansList
                                    }}
                                    modalStateHandlers={{
                                        handlePreviewCancel: handlePreviewCancel,
                                        handleSubmit: handleSubmit,
                                        handleNewCustomerPreviewModalClose: handleNewCustomerPreviewModalClose,
                                        handlePrint: handlePrint

                                    }}
                                    ref={componentRef}
                                />
                            </NewCustomerPreviewModal>
                            :
                            <></>
                    }
                </div>
            </div>}
        </>
    )

}
export default NewServiceAccount;
