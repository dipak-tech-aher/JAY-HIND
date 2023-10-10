import React, { useState, useRef, useContext, useEffect } from 'react'
import { useTranslation } from "react-i18next";
import { Element } from 'react-scroll'
import { toast } from "react-toastify";
import { string, object } from "yup";
import { get, post, put } from "../../common/util/restUtil";
import { properties } from "../../properties";

import CustomerDetailsForm from './CustomerDetailsForm'
import { AppContext } from '../../AppContext';
import Modal from 'react-modal';
import CustomerPreview from './CustomerDetailsFormView';
import { useReactToPrint } from 'react-to-print';
import { useHistory } from "react-router-dom";
import moment from 'moment'


const personalCustomerValidationSchema = object().shape({
    title: string().required("Title is required"),
    firstName: string().required("ForeName is required"),
    lastName: string().required("SurName is required"),
    gender: string().required("Gender is required"),
    email: string().required("Email is required").email("Email is not in correct format"),
    contactType: string().required("Contact type is required"),
    idType: string().required("ID type is required"),
    contactNbr: string().required("Contact Number is required"),
    idNumber: string().required("ID Number is required"),
    dob: string().required("Date of birth is required"),

});

const businessCustomerValidationSchema = object().shape({
    companyName: string().required("Company Name is required"),
    email: string().required("Email is required").email("Email is not in correct format"),
    contactType: string().required("Contact type is required"),
    contactNbr: string().required("Contact Number is required"),
    idType: string().required("ID type is required"),
    idNumber: string().required("ID number is required"),
    registrationNbr: string().required("Registration number is required"),
    registrationDate: string().required("Registration date is required"),

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
const billableValidationSchema = object().shape({
    group: string().required("Bill group is required"),
    currency: string().required("Currency is required"),
    accountCredLimit: string().required("Account credit limit is required"),
    exemptCredCtrl: string().required("Exempt credit control is required"),
    language: string().required("Bill language is required"),
    notification: string().required("Bill notification is required"),
    sourceOfReg: string().required("Bill registration is required"),
    noOfCopies: string().required("/number of copies required"),
    salesAgent: string().required("Sales Agent is required"),


});

function NewCustomer(props) {
    let custType = ''
    let viewStatus = 'hide'
    if (props.location.state !== undefined) {
        if (props.location.state.data !== undefined) {
            if (props.location.state.data.sourceName === 'Inquiry') {
                custType = (props.location.state.data !== undefined)
                    ? props.location.state.data.custType : ''
                viewStatus = 'show'
            }
        }
    }
    let custTypeFromEdit = props?.location?.state?.data?.custTypeFromEdit || ""
    let customerId = props?.location?.state?.data?.customerId || ""
    let source = props?.location?.state?.data?.source || ""

    const history = useHistory();
    const { auth } = useContext(AppContext)
    const [userPermission, setUserPermission] = useState({
        createCustomer: false
    })
    const [detailsValidate, setDetailsValidate] = useState({
        title: true,
        firstName: true,
        lastName: true,
        email: true,
        gender: true,
        companyName: true,
        contactNbr: true,
        flatNo: true,
        building: true,
        street: true,
        state: true,
        city: true,
        profileValue: true,
        registrationNbr: true,
        registrationDate: true,
        dob: true,
        idType: true,
        idNumber: true,

    })
    const { t } = useTranslation();


    const [customerDetailsError, setCustomerDetailsError] = useState({});

    const [renderMode, setRenderMode] = useState({
        customerTypeSelection: viewStatus,
        customerDetails: 'hide',
        customerDetailsPreview: 'hide',

    })

    const [doneStatus, setDoneStatus] = useState({
        customer: false,
        account: false,
        service: false
    })
    const [isBillable, setIsBillable] = useState(false);
    const [displayPreview, setDisplayPreview] = useState(false);
    const newCustomerData = useRef({})
    const componentRef = useRef();

    const handlePrint = useReactToPrint({

        content: () => componentRef.current,

    });
    const [kioskReferenceId, setKioskReferenceId] = useState()

    const [selectedCustomerType, setSelectedCustomerType] = useState(custType)

    const [personalDetailsData, setPersonalDetailsData] = useState({
        title: '',
        firstName: '',
        lastName: '',
        crmCustomerNo: '',
        //category: '',
        //categoryDesc: '',
        //class: '',
        //classDesc: '',
        billable: false,
        email: '',
        contactType: '',
        contactTypeDesc: '',
        contactNbr: '',
        dob: '',
        gender: '',
        contactNoType: '',
        idType: '',
        idNumber: '',
        idTypeDesc: '',
        property1: '',
        property2: '',
        property3: ''
    });

    const [businessDetailsData, setBusinessDetailsData] = useState({
        companyName: '',
        //category: '',
        //categoryDesc: '',
        //class: '',
        //classDesc: '',
        email: '',
        contactType: '',
        contactTypeDesc: '',
        contactNbr: '',
        idType: '',
        idNumber: '',
        registrationDate: '',
        registrationNbr: '',
        billable: false,
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
    const [billableData, setBillableData] = useState({
        group: '',
        currency: '',
        language: '',
        accountCredLimit: '',
        exemptCredCtrl: '',
        notification: '',
        sourceOfReg: '',
        noOfCopies: '',
        salesAgent: ''

    })


    const lookupData = useRef({})
    const addressLookup = useRef({})
    const catalogList = useRef({})
    const [addressLookUpRef, setAddressLookUpRef] = useState(null)
    const [categoryLookup, setCategoryLookup] = useState([{}])
    const [classLookup, setClassLookup] = useState([{}])
    const [contactTypeLookup, setContactTypeLookup] = useState([{}])
    const [districtLookup, setDistrictLookup] = useState([{}])
    const [kampongLookup, setKampongLookup] = useState([{}])
    const [postCodeLookup, setPostCodeLookup] = useState([{}])
    const [countries, setCountries] = useState()
    const [locations, setLocations] = useState()
    const [currencyType, setCurrencyType] = useState()
    const [billGroups, setBillGroups] = useState()
    const [notificationType, setNotificationType] = useState()
    const [billLanguages, setBillLanguages] = useState()
    const [registrationType, setRegistrationType] = useState()
    const [idTypeLookup, setIdTypeLookup] = useState([{}])
    const [customerTypeLookup, setCustomerTypeLookup] = useState([{}])
    const options = [
        { value: 'BUSINESS', label: 'Business' },
        { value: 'RESIDENTIAL', label: 'Residential' },
        { value: 'GOVERNMENT', label: 'Government' },
    ]
    const resetDataValues = () => {
        newCustomerData.current = {}
        setCustomerDetailsError({})
        setPersonalDetailsData({
            ...personalDetailsData,
            title: '',
            firstName: '',
            lastName: '',
            crmCustomerNo: '',
            property1: '',
            property2: '',
            property3: '',
            email: '',
            contactType: '',
            contactTypeDesc: '',
            contactNbr: '',
            gender: '',
            idType: '',
            idNumber: '',
            dob: '',
            billable: false,
        })
        setBusinessDetailsData({
            ...businessDetailsData,
            companyName: '',
            property1: '',
            property2: '',
            property3: '',
            email: '',
            contactType: '',
            contactTypeDesc: '',
            contactNbr: '',
            registrationNbr: '',
            registrationDate: '',
            billable: false,
        })

        setCustomerAddress({
            ...customerAddress,
            flatHouseUnitNo: '',
            building: '',
            street: '',
            district: '',
            state: '',
            cityTown: '',
            country: '',
            postCode: ''
        })
        setBillableData({
            ...billableData,
            billGroup: '',
            billLanguage: '',
            currency: '',
            accountCreditLimit: '',
            exemptCreditControl: '',
            billNotification: '',
            billRegistrationSource: '',
            noOfCopies: '',
            salesAgent: ''
        })
        // setBillableData(false)  // jira Id 51 Pon Arasi

    }
    useEffect(() => {
        if (props.location.state === undefined)
            return;
        const { data } = props.location.state
        // if (props.location.state.data !== undefined) {
        //     setKioskReferenceId(props.location.state.data.customerDetails.referenceNo)
        // }
        //setRenderMode({ ...renderMode, customerTypeSelection: 'show' })
    }, [props.location.state]);
    useEffect(() => {

        let rolePermission = []
        
        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)
            if (property[0] === "Customer") {
                let value = Object.values(e)
                rolePermission = Object.values(value[0])
            }
        })

        let add;
        rolePermission.map((screen) => {
            if (screen.screenName === "Add Customer") {
                add = screen.accessType
            }

        })
        setUserPermission({ createCustomer: add })

        
    }, [auth])



    useEffect(() => {

        let district = []
        let kampong = []
        let postCode = []



        
        post(properties.BUSINESS_ENTITY_API, ['CATEGORY',
            'CLASS',
            'CONTACT_TYPE',
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
            'CUSTOMER_TYPE',
            'CURRENCY',
            'BILL_GROUP',
            'REGISTRATION_SOURCE',
            'CONTACT_PREFERENCE',
            'STATE','DISTRICT','POSTCODE'
        ])
            .then((resp) => {
                if (resp.data) {
                    setBillGroups(resp.data.BILL_GROUP)
                    setBillLanguages(resp.data.BILL_LANGUAGE)
                    setNotificationType(resp.data.CONTACT_PREFERENCE)
                    setRegistrationType(resp.data.REGISTRATION_SOURCE)
                    setCurrencyType(resp.data.CURRENCY)
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
                            }
                        }).catch((error) => {
                            console.log(error)
                        });

                    setCategoryLookup(lookupData.current['CATEGORY'])
                    setClassLookup(lookupData.current['CLASS'])
                    setContactTypeLookup(lookupData.current['CONTACT_TYPE'])
                    catalogList.current = lookupData.current['CATALOGUE']
                    setCustomerTypeLookup(lookupData.current['CUSTOMER_TYPE'])
                    setIdTypeLookup(lookupData.current['CUSTOMER_ID_TYPE'])
                    setDistrictLookup(resp.data.DISTRICT)
                    setKampongLookup(resp.data.STATE)
                    setPostCodeLookup(resp.data.POSTCODE)

                    setRenderMode({ ...renderMode, customerTypeSelection: 'show' })
                    if (props.location.state !== undefined) {

                        const { data } = props.location.state
                        if (props.location.state.data !== undefined) {
                            if (data.sourceName === 'Inquiry') {
                                handleCustomerTypeChange(data.custType)
                                setRenderMode(
                                    {
                                        ...renderMode,
                                        customerDetails: 'form',
                                        //customerDetailsPreview: 'hide',
                                        accountDetails: 'form',
                                        //accountDetailsPreview: 'hide',
                                        serviceDetails: 'form',

                                        //previewButton: 'show',
                                    }
                                )
                                //setRenderMode({ ...renderMode, customerTypeSelection: 'show' })
                            }
                        }
                        if (source === "Edit") {
                            getEditData();
                        }
                    }

                    

                }
            }).catch((error) => {
                console.log(error)
            }).finally();

    }, []);

    const getEditData = () => {
        
        get(properties.CUSTOMER_API + "/" + customerId).then((resp) => {
            if (resp.data) {
            
                setCustomerAddress(resp.data.address)
                if (custTypeFromEdit === "RESIDENTIAL") {
                    setPersonalDetailsData({
                        title: resp.data?.title,
                        firstName: resp.data?.firstName,
                        lastName: resp.data?.lastName,
                        crmCustomerNo: resp.data?.crmCustomerNo,
                        email: resp.data?.email,
                        contactType: resp.data?.contactType,
                        contactTypeDesc: resp.data?.contactTypeDesc,
                        contactNbr: resp.data?.contactNbr,
                        gender: resp.data?.gender,
                        idType: resp.data?.idType,
                        idNumber: resp.data?.idValue,
                        dob: resp.data?.birthDate,
                        property1: resp.data?.property_1,
                        property2: resp.data?.property_2,
                        property3: resp.data?.property_3,
                    })
                    handleCustomerTypeChange('RESIDENTIAL')

                } else if (custTypeFromEdit === "BUSINESS" || custTypeFromEdit === "GOVERNMENT") {
                    setBusinessDetailsData({
                        companyName: resp.data?.firstName,
                        email: resp.data?.email,
                        contactType: resp.data?.contactType,
                        contactTypeDesc: resp.data?.contactTypeDesc,
                        contactNbr: resp.data?.contactNbr,
                        registrationDate: resp.data?.regDate,
                        registrationNbr: resp?.data?.registeredNo,
                        property1: resp.data?.property_1,
                        property2: resp.data?.property_2,
                        property3: resp.data?.property_3,
                    })
                    handleCustomerTypeChange('BUSINESS')
                }
                setCustomerAddress({
                    flatHouseUnitNo: resp.data?.address?.flatNo,
                    building: resp.data?.address?.buildingName,
                    street: resp.data?.address?.street,
                    district: resp.data?.address?.district,
                    state: resp.data?.address?.state,
                    cityTown: resp.data?.address?.town,
                    country: resp.data?.address?.country,
                    postCode: resp.data?.address?.postCode
                })
                setBillableData({
                    billGroup: resp.data?.billable?.billGroup,
                    accountCreditLimit: resp.data?.billable?.accountCreditLimit,
                    currency: resp.data?.billable?.currency,
                    exemptCreditControl: resp.data?.billable?.exemptCreditControl,
                    billLanguage: resp.data?.billable?.billLanguage,
                    billNotification: resp.data?.billable?.billNotification,
                    billRegistrationSource: resp.data?.billable?.billRegistrationSource,
                    noOfCopies: resp.data?.billable?.noOfCopies,
                    salesAgent: resp.data?.billable?.salesAgent
                })
                setRenderMode({
                    ...renderMode,
                    customerDetails: 'view',
                    customerTypeSelection: 'hide',

                })
            }

        }).catch((error) => {
            console.log(error)
        }).finally()


    }


    const validate = (section, schema, data, holdPrevErrors = false) => {
        try {
            if (section === 'CUSTOMER') {
                holdPrevErrors === false && setCustomerDetailsError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'CUSTOMER') {
                    setCustomerDetailsError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    const addressChangeHandler = (field, value) => {

    }

    const handleCustomerTypeChange = (value) => {
        setRenderMode({
            ...renderMode,
            customerDetails: 'form',
            accountDetails: 'form',
            serviceDetails: 'form',

        })
        setSelectedCustomerType(value)
        const catalog = []
        if (catalogList !== undefined && catalogList !== null && catalogList.current !== undefined && catalogList.current !== null && catalogList.current.length > 0) {
            for (let c of catalogList?.current) {
                if (c?.mapping?.customerType === value) {
                    catalog.push({
                        code: c.code,
                        description: c.description
                    })
                }
            }
        }


    }

    const handleCustomerDetailsCancel = () => {

        if (newCustomerData.current.customer.customerType === 'RESIDENTIAL') {
            setPersonalDetailsData(
                {
                    title: newCustomerData.current.customer.title,
                    firstName: newCustomerData.current.customer.firstName,
                    lastName: newCustomerData.current.customer.lastName,
                    email: newCustomerData.current.customer.email,
                    contactType: newCustomerData.current.customer.contactType,
                    contactNbr: newCustomerData.current.customer.contactNbr,
                    idType: newCustomerData.current.customer.idType,
                    idNumber: newCustomerData.current.customer.idNumber,
                    billable: false,
                    property1: newCustomerData.current.customer.property1,
                    property2: newCustomerData.current.customer.property2,
                    property3: newCustomerData.current.customer.property3,
                }
            )
        }
        if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
            setBusinessDetailsData(
                {
                    companyName: newCustomerData.current.customer.companyName,
                    email: newCustomerData.current.customer.email,
                    contactType: newCustomerData.current.customer.contactType,
                    contactNbr: newCustomerData.current.customer.contactNbr,
                    registrationNbr: newCustomerData.current.customer.registrationNbr,
                    registrationDate: newCustomerData.current.customer.registrationDate,
                    property1: newCustomerData.current.customer.property1,
                    property2: newCustomerData.current.customer.property2,
                    property3: newCustomerData.current.customer.property3,
                    billable: false,
                }
            )
        }
        // if (selectedCustomerType === 'GOVERNMENT') {
        //     setBusinessDetailsData(
        //         {
        //             companyName: newCustomerData.current.customer.companyName,
        //             email: newCustomerData.current.customer.email,
        //             contactType: newCustomerData.current.customer.contactType,
        //             contactNbr: newCustomerData.current.customer.contactNbr,
        //             registrationNbr: newCustomerData.current.customer.registrationNbr,
        //             registrationDate: newCustomerData.current.customer.registrationDate,
        //             property1: newCustomerData.current.customer.property1,
        //             property2: newCustomerData.current.customer.property2,
        //             property3: newCustomerData.current.customer.property3,
        //             billable: false,
        //         }
        //     )
        // }
        setSelectedCustomerType(newCustomerData.current.customer.customerType)
        setRenderMode({
            ...renderMode,
            customerDetails: 'view',
            customerTypeSelection: 'hide'
        })

    }

    const handleCustomerDetailsDone = () => {
        if (setCustomerDetails()) {
            handleSubmit();
        }
    }

    const setCustomerDetails = () => {

        if (selectedCustomerType === 'RESIDENTIAL') {
            const personalError = validate('CUSTOMER', personalCustomerValidationSchema, personalDetailsData);
            const billableError = validate('CUSTOMER', billableValidationSchema, billableData, true);
            const addressError = validate('CUSTOMER', addressValidationSchema, customerAddress, true);

            if (isBillable === true) {
                if (personalError || addressError || billableError) {
                    toast.error("Validation errors found. Please check highlighted fields");
                    return false;
                }
            } else {
                if (personalError || addressError) {
                    toast.error("Validation errors found. Please check highlighted fields");
                    return false;
                }
            }

        }

        if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
            const businessError = validate('CUSTOMER', businessCustomerValidationSchema, businessDetailsData);
            const addressError = validate('CUSTOMER', addressValidationSchema, customerAddress, true);
            const billableError = validate('CUSTOMER', billableValidationSchema, billableData, true);
            if (isBillable === true) {
                if (businessError || addressError || billableError) {
                    toast.error("Validation errors found. Please check highlighted fields");
                    return false;
                }
            } else {
                if (businessError || addressError) {
                    toast.error("Validation errors found. Please check highlighted fields");
                    return false;
                }
            }
        }

        // if (selectedCustomerType === 'GOVERNMENT') {
        //     const governmentError = validate('CUSTOMER', governmentCustomerValidationSchema, governmentDetailsData);
        //     const addressError = validate('CUSTOMER', addressValidationSchema, customerAddress, true);
        //     const billableError = validate('CUSTOMER', billableValidationSchema, billableData, true);
        //     if (isBillable === true) {
        //         if (governmentError || addressError || billableError) {
        //             toast.error("Validation errors found. Please check highlighted fields");
        //             return false;
        //         }
        //     } else {
        //         if (governmentError || addressError) {
        //             toast.error("Validation errors found. Please check highlighted fields");
        //             return false;
        //         }
        //     }
        // }
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
        if (selectedCustomerType === 'RESIDENTIAL') {
            if (moment(personalDetailsData?.dob).isAfter(moment().format('YYYY-MM-DD'))) {
                toast.error("Date of Birth Cannot be Future Date")
                return false;
            }
        }
        else if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
            if (moment(businessDetailsData?.registrationDate).isAfter(moment().format('YYYY-MM-DD'))) {
                toast.error("Registration Date Cannot be Future Date")
                return false;
            }
        }

        if (!newCustomerData.current.customer) {
            newCustomerData.current.customer = {}
        }
        newCustomerData.current.customer.customerType = selectedCustomerType
        if (selectedCustomerType === 'RESIDENTIAL') {
            newCustomerData.current.customer.title = personalDetailsData.title
            newCustomerData.current.customer.firstName = personalDetailsData.firstName
            newCustomerData.current.customer.lastName = personalDetailsData.lastName
            newCustomerData.current.customer.email = personalDetailsData.email
            newCustomerData.current.customer.property1 = personalDetailsData.property1
            newCustomerData.current.customer.property2 = personalDetailsData.property2
            newCustomerData.current.customer.property3 = personalDetailsData.property3
            newCustomerData.current.customer.contactType = personalDetailsData.contactType
            newCustomerData.current.customer.contactTypeDesc = personalDetailsData.contactTypeDesc
            newCustomerData.current.customer.contactNbr = personalDetailsData.contactNbr
            newCustomerData.current.customer.kioskRefId = (kioskReferenceId !== null) ? kioskReferenceId : null
            newCustomerData.current.customer.gender = personalDetailsData.gender
            newCustomerData.current.customer.dob = personalDetailsData.dob
            newCustomerData.current.customer.idType = personalDetailsData.idType
            newCustomerData.current.customer.idNbr = personalDetailsData.idNumber
            newCustomerData.current.customer.billable = personalDetailsData.billable
        }
        if (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') {
            newCustomerData.current.customer.companyName = businessDetailsData.companyName
            newCustomerData.current.customer.property1 = businessDetailsData.property1
            newCustomerData.current.customer.property2 = businessDetailsData.property2
            newCustomerData.current.customer.property3 = businessDetailsData.property3
            newCustomerData.current.customer.email = businessDetailsData.email
            newCustomerData.current.customer.contactType = businessDetailsData.contactType
            newCustomerData.current.customer.contactTypeDesc = businessDetailsData.contactTypeDesc
            newCustomerData.current.customer.contactNbr = businessDetailsData.contactNbr
            newCustomerData.current.customer.registrationNbr = businessDetailsData.registrationNbr
            newCustomerData.current.customer.registrationDate = businessDetailsData.registrationDate
            newCustomerData.current.customer.idType = businessDetailsData.idType
            newCustomerData.current.customer.idNbr = businessDetailsData.idNumber
            newCustomerData.current.customer.billable = businessDetailsData.billable
        }



        if (!newCustomerData.current.customer.address) {
            newCustomerData.current.customer.address = []
        }
        // if (!newCustomerData.current.customer.billable) {
        //     newCustomerData.current.customer.billable = []
        // }
        newCustomerData.current.customer.address[0] = {
            flatHouseUnitNo: customerAddress.flatHouseUnitNo,
            building: customerAddress.building,
            street: customerAddress.street,
            district: customerAddress.district,
            state: customerAddress.state,
            cityTown: customerAddress.cityTown,
            country: customerAddress.country,
            postCode: customerAddress.postCode
        }
    
        if (newCustomerData.current.customer.billable) {
            newCustomerData.current.customer.billableDetails = {
                group: billableData.group,
                currency: billableData.currency,
                accountCredLimit: billableData.accountCredLimit,
                exemptCredCtrl: billableData.exemptCredCtrl,
                language: billableData.language,
                notification: billableData.notification,
                sourceOfReg: billableData.sourceOfReg,
                noOfCopies: billableData.noOfCopies,
                salesAgent: billableData.salesAgent

            }

        } else {
            newCustomerData.current.customer.billableDetails = {}
        }

        setDoneStatus({ ...doneStatus, customer: true })
        return true
    }

    // const handleCustomerDetailsEdit = () => {
    //     setRenderMode({
    //         ...renderMode,
    //         customerDetails: 'form',
    //         customerTypeSelection: 'show',

    //     })
    //     setDoneStatus({ ...doneStatus, customer: false })
    // }


    const handlePreviewAndSubmit = () => {
        if (setCustomerDetails()) {
            toast.success("Field validations completed successfully");
            setDisplayPreview(true)
        }

    }

    const handleSubmit = () => {

        if (source !== "Edit") {

            
            post(properties.CUSTOMER_API, newCustomerData.current.customer)
                .then((resp) => {
                    if (resp.data) {
                        if (resp.status === 200) {
                            toast.success("Customer created successfully " + resp.data.customerId);
                            setRenderMode({
                                ...renderMode,
                                submitted: 'yes',

                            })
                            props.history.push(`${process.env.REACT_APP_BASE}/`);
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
        else {
            put(properties.CUSTOMER_API + "/" + customerId, newCustomerData.current.customer).then((resp) => {
                if (resp.status === 200) {
                    toast.success("Customer updated successfully")
                }
                else { toast.error("Error While updating customer") }
            }).catch((error) => {
                console.log(error)
            }).finally()
        }


    }

    const handleCancel = () => {

        history.push(`${process.env.REACT_APP_BASE}/`)
    }
    return (
        <>{userPermission.createCustomer !== 'deny' && <div>
            {
                (displayPreview === true) ?


                    <CustomerPreview
                        data={{
                            isOpen: displayPreview,
                            selectedCustomerType: selectedCustomerType,
                            customerData: selectedCustomerType === 'RESIDENTIAL' ? personalDetailsData : businessDetailsData,
                            customerAddress: customerAddress,

                            billableData: billableData,

                        }}
                        modalStateHandlers={{
                            setIsOpen: setDisplayPreview,
                            handlePrint: handlePrint
                        }}
                        ref={componentRef}
                    />


                    :
                    <></>
            }
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        {source === 'Edit' ? <h4 className="page-title">Edit Customer</h4> : <h4 className="page-title">Add New Customer</h4>}
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-12 p-0">
                    <div className="card-box">
                        <div className="d-flex">

                            <div className="new-customer col-md-12">
                                <div className="scrollspy-div">
                                    <Element name="customersection" className="element" >
                                        <div className="row pl-0">
                                            <div className="title-box col-12 pl-0">
                                                <section className="triangle pl-0">
                                                    {source === 'Edit' ?
                                                        <h4 className="pl-2" style={{ alignContent: 'left' }}>{t("edit_customer")}</h4>
                                                        : <h4 className="pl-2" style={{ alignContent: 'left' }}>{t("new_customer")}</h4>}
                                                </section>
                                            </div>
                                        </div>
                                        {
                                            (renderMode.customerTypeSelection === 'show' && renderMode.customerDetails !== 'view') ?

                                                <div className="pt-2 pr-2 pl-2">
                                                    <fieldset className="scheduler-border">
                                                        <div className="form-row">
                                                            <div className="col-12 pl-2 bg-light border">
                                                                <h5 className="text-primary">Customer Type</h5>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex flex-row pt-2">
                                                            <div className="col-md-4 pl-0">
                                                                <div className="form-group">

                                                                    <select className="form-control "
                                                                        value={selectedCustomerType}
                                                                        onChange={e => {
                                                                            handleCustomerTypeChange(e.target.value);
                                                                            resetDataValues()
                                                                        }}>
                                                                        <option key="1" value="">Select Customer Type...</option>
                                                                        {
                                                                            options.map((e) => (
                                                                                <option key={e.value} value={e.value}>{e.label}</option>
                                                                            ))
                                                                        }
                                                                    </select>
                                                                    {/* <div className="radio radio-primary mb-2">
                                                                        <input type="radio" id="radio1" className="form-check-input" name="optCustomerType" value='RESIDENTIAL'
                                                                            checked={'RESIDENTIAL' === selectedCustomerType} onChange={e => {
                                                                                handleCustomerTypeChange(e.target.value);
                                                                                resetDataValues();
                                                                            }} />
                                                                        <label htmlFor="radio1">{t("residential")}</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-2">
                                                                <div className="form-group">
                                                                    <div className="radio radio-primary mb-2">
                                                                        <input type="radio" id="radio2" className="form-check-input" name="optCustomerType" value='BUSINESS'
                                                                            checked={'BUSINESS' === selectedCustomerType} onChange={e => {
                                                                                handleCustomerTypeChange(e.target.value);
                                                                                resetDataValues();
                                                                            }} />
                                                                        <label htmlFor="radio2">{t("business")}</label>
                                                                    </div>*/}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </fieldset>
                                                </div>
                                                :
                                                <></>
                                        }
                                        {
                                            (renderMode.customerDetails === 'view') ?

                                                <div className="pt-2 pr-2 pl-2">
                                                    <fieldset className="scheduler-border">
                                                        <div className="form-row">
                                                            <div className="col-12 pl-2 bg-light border">
                                                                <h5 className="text-primary">Customer Type</h5>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex flex-row pt-2">
                                                            <div className="col-md-2 pl-0">
                                                                <div className="form-group">
                                                                    {
                                                                        ('RESIDENTIAL' === selectedCustomerType) ?
                                                                            <h5>{t("residential")}</h5>
                                                                            :
                                                                            <></>
                                                                    }
                                                                    {
                                                                        ('BUSINESS' === selectedCustomerType) ?
                                                                            <h5>{t("business")}</h5>
                                                                            :
                                                                            <></>
                                                                    }
                                                                    {
                                                                        ('GOVERNMENT' === selectedCustomerType) ?
                                                                            <h5>{t("government")}</h5>
                                                                            :
                                                                            <></>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </fieldset>
                                                </div>
                                                :
                                                <></>
                                        }                                                                                    
                                                <div className="pt-0 pr-2 pl-2">
                                                    <fieldset className="scheduler-border">                                                  
                                                            
                                                                <CustomerDetailsForm data={{
                                                                    personalDetailsData: personalDetailsData,
                                                                    customerAddress: customerAddress,
                                                                    countries: countries,
                                                                    locations: locations,
                                                                    detailsValidate: detailsValidate,
                                                                    billableData: billableData,
                                                                    billGroups: billGroups,
                                                                    notificationType: notificationType,
                                                                    registrationType: registrationType,
                                                                    billLanguages: billLanguages,
                                                                    currencyType: currencyType,
                                                                    source: source,
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
                                                                        setCustomerAddress: setCustomerAddress,
                                                                        setDetailsValidate: setDetailsValidate,
                                                                        setBillable: setIsBillable,
                                                                        setBillableData: setBillableData
                                                                    }}
                                                                    error={customerDetailsError}
                                                                    setError={setCustomerDetailsError}
                                                                />
                                                                                                               
                                                    </fieldset>
                                                    {
                                                        (renderMode.customerDetails === 'form') ?
                                                            <div className="d-flex justify-content-center ">

                                                                <button type="button" className="skel-btn-submit"
                                                                    onClick={() => {
                                                                        handlePreviewAndSubmit()

                                                                    }} >Preview</button>
                                                                <button type="button" className="skel-btn-submit" onClick={handleCustomerDetailsDone}>Submit</button>

                                                                <button type="button" className="skel-btn-cancel" onClick={handleCancel}>Cancel</button>

                                                            </div>
                                                            :
                                                            <></>
                                                    }

                                                </div>
                                       
                                    </Element>


                                    <div className="d-flex justify-content-center">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </div>}
        </>
    )

}
export default NewCustomer;
