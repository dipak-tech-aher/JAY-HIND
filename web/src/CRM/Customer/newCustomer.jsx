import React, { useState, useRef, useContext, useEffect } from 'react'
import { toast } from "react-toastify";
import { string, object, date } from "yup";
import { get, post, put } from "../../common/util/restUtil";
import { properties } from "../../properties";

import CustomerDetailsForm from './CustomerDetailsForm'
import CustomerTypePopup from './CustomerTypePopup'
import { AppContext } from '../../AppContext';
import CustomerIVR from './CustomerIVR';
import CustomerContactForm from '../Contact/CustomerContactForm';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import CustomerAccountForm from '../AccountManagement/CustomerAccountForm';
import CustomerServiceForm from '../ServiceManagement/CustomerServiceForm';
import Swal from 'sweetalert2';
import AccountOtherDetailsForm from '../AccountManagement/AccountOtherDetailsForm';
import CustomerAccountAddressForm from '../AccountManagement/CustomerAccountAddressForm';
import CustomerServiceAddressForm from '../ServiceManagement/CustomerServiceAddressForm';
import moment from 'moment'
import ServiceCategoryPopup from '../ServiceManagement/ServiceCategoryPopup';
import ServiceDetailsPopup from '../ServiceManagement/ServiceFinalPopup';
import { useReactToPrint } from 'react-to-print';
import NewCustomerPreviewModal from 'react-modal'
import CustomerPreviewPrint from './CustomerPreviewPrint';
import SearchCustomer from './SearchCustomer';
import { unstable_batchedUpdates } from 'react-dom';
import AccountConfirmationPopup from '../AccountManagement/AccountConfirmationPopup';
import { isEmpty } from 'lodash'
import CustomerProductFinalPreview from './CustomerProductFinalPreview';
import CustomerContractAgreement from './CustomerContractAgreement';
import { CloseButton, Modal, Badge } from 'react-bootstrap';

function NewCustomer(props) {
    const { appsConfig } = props;
    // console.log('props?.location?.state?.data-------new cust----->', props?.location?.state?.data)
    const { pageIndex, accountDetails, customerDetails, edit, servicePopupOpen = false, selectedProductsList, servicesData
    } = props?.location?.state?.data || {}

    console.log('edit------==>', edit)

    console.log('customerDetails------==>', customerDetails)
    console.log('selectedProductsList==>', selectedProductsList)
    const productsList = selectedProductsList && selectedProductsList.length > 0 && selectedProductsList || [];
    let existingApplicationProdList = []
    customerDetails &&
        customerDetails.customerAccounts &&
        customerDetails.customerAccounts.length > 0 &&
        customerDetails.customerAccounts.forEach((account) => {
            if (account.accountServices && account.accountServices.length > 0) {
                account.accountServices.forEach((service) => {
                    if (!!!['SS_IN', 'SS_AC', 'SS_PEND'].includes(service.status) &&
                        !existingApplicationProdList.some(
                            (element) => element.productId == service.planPayload
                        )
                    ) {
                        existingApplicationProdList.push({
                            quantity: service.quantity,
                            productId: service.planPayload,
                            selectedContract: service.actualContractMonths,
                            bundleId: service.prodBundleId,
                            promoId: service.promoId,
                            advanceCharge: service?.advanceCharge,
                            upfrontCharge: service?.upfrontCharge
                        });
                    }
                });
            }
        });

    const finalSelectedProductsList = selectedProductsList && selectedProductsList.length > 0 && selectedProductsList?.filter((ele) => ele.isSelected === 'Y') || [];
    const { auth } = useContext(AppContext)
    const [userPermission, setUserPermission] = useState({
        createCustomer: false
    })
    const customerInitialValues = {
        firstName: '',
        lastName: '',
        gender: '',
        dob: '',
        idType: '',
        idValue: '',
        registrationNbr: "",
        registrationDate: "",
        businessName: "",
        customerCategory: "",
    }
    const accountInitialValues = {
        isAccountCreate: "N",
        sameAsCustomerData: "Y",
        firstName: '',
        lastName: '',
        email: '',
        contactNbr: '',
        dob: '',
        gender: '',
        idType: '',
        idValue: '',
        registrationNbr: "",
        registrationDate: "",
        accountCategory: "AC_POST",
        accountClass: "",
        accountPriority: "",
        accountLevel: "PRIMARY",
        billLanguage: "BLENG",
        accountType: "",
        notificationPreference: ["CNT_EMAIL"],
        creditLimit: "",
        accountBalance: "",
        accountOutstanding: "",
        accountStatusReason: "",
        currency: "CUR-INR"
    }
    /*LATEST STATES*/
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });
    const [idScanSuccess, setIdScanSuccess] = useState(false);
    const [displayPreview, setDisplayPreview] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [customerSearchData, setCustomerSearchData] = useState([]);
    const [creationPercentage, setCreationPercentage] = useState(0)
    const [customerPageIndex, setCustomerPageIndex] = useState(0) // it need to be 0
    const [selectedCustomerType, setSelectedCustomerType] = useState("REG")
    const [customerTypeLookup, setCustomerTypeLookup] = useState([])
    const [idTypeLookup, setIdTypeLookup] = useState([])
    const [countries, setCountries] = useState([])
    const [genderLookup, setGenderLookup] = useState([])
    const [addressLookUpRef, setAddressLookUpRef] = useState(null)
    const [isSameasCustomerAddress, setIsSameasCustomerAddress] = useState()
    const [phoneNumberLength, setPhoneNumberLength] = useState(0);

    const [customerData, setCustomerData] = useState(customerInitialValues);
    const [customerAddress, setCustomerAddress] = useState({
        email: '',
        contactNbr: '',
        address1: '',
        address2: '',
        address3: '',
        district: '',
        state: '',
        city: '',
        country: '',
        postcode: '',
        countryCode: ''
    })
    const [serviceAgreement, setServiceAgreement] = useState(false);
    const [addressString, setAddressString] = useState("")
    const [customerDetailsError, setCustomerDetailsError] = useState({});
    const [customerContactDetailsError, setCustomerContactDetailsError] = useState({});
    const [accountDetailsError, setAccountDetailsError] = useState({});
    const [serviceDetailsError, setServiceDetailsError] = useState({});
    const [accountData, setAccountData] = useState(accountInitialValues);
    const [accountAddress, setAccountAddress] = useState({
        sameAsCustomerAddress: "N",
        address1: '',
        address2: '',
        address3: '',
        district: '',
        state: '',
        city: '',
        country: '',
        postcode: '',
        countryCode: ''
    })
    const [priorityLookup, setPriorityLookup] = useState([])
    const [accountClassLookup, setAccountClassLookup] = useState([])
    const [accountLevelLookup, setAccountLevelLookup] = useState([])
    const [accountTypeLookup, setAccountTypeLookup] = useState([])
    const [accountCategoryLookup, setAccountCategoryLookup] = useState([])
    const [accountStatusReasonLookup, setAccountStatusReasonLookup] = useState([])
    const [billLanguageLookup, setBillLanguageLookup] = useState([])
    const [notificationLookup, setNotificationLookup] = useState([])
    const [currencyLookup, setCurrencyLookup] = useState([])
    const [productCategoryLookup, setProductCategoryLookup] = useState([])
    const [productTypeLookup, setProductTypeLookup] = useState([])
    const [productSubCategoryLookup, setProductSubCategoryLookup] = useState([])
    const [serviceTypeLookup, setServiceTypeLookup] = useState([])
    const [contactPreferenceLookup, setContactPreferenceLookup] = useState([])
    const [selectedContactPreferences, setSelectedContactPreferences] = useState([])
    const [phoneNoPrefix, setPhoneNoPrefix] = useState([])

    const [serviceData, setServiceData] = useState({
        serviceType: servicesData && servicesData.length > 0 && servicesData[0]?.serviceType.length > 0 && servicesData[0]?.serviceType || [],
        totalRc: servicesData && servicesData.length > 0 && servicesData[0].totalRc || 0,
        totalNrc: servicesData && servicesData.length > 0 && servicesData[0].totalNrc || 0,
        total: (servicesData && servicesData.length > 0 && servicesData[0].total) || 0,
        isNeedQuoteOnly: 'N',
        serviceAgreement: "",
        isAgreed: "N",
        serviceUuid: (servicesData && servicesData.length > 0 && servicesData[0].serviceUuid) || ''
    })

    const [productList, setProductList] = useState(productsList)
    const [originalProductList, setOriginalProductList] = useState(productsList)
    const [selectedProductList, setSelectedProductList] = useState(finalSelectedProductsList)
    const businessMasterRef = useRef()
    const [serviceAddress, setServiceAddress] = useState({
        sameAsCustomerAddress: "Y",
        address1: '',
        address2: '',
        address3: '',
        district: '',
        state: '',
        city: '',
        country: '',
        postcode: ''
    })
    const [isServicePopupOpen, setIsServicePopupOpen] = useState(false)
    const [isServiceDetailsPopupOpen, setIsServiceDetailsPopupOpen] = useState(servicePopupOpen)
    const [isCustomerTypePopupOpen, setIsCustomerTypePopupOpen] = useState(false)
    const sigPad = useRef({});
    const [isAccountCreateOpen, setIsAccountCreateOpen] = useState(false)
    const [isAccountSameAsCustomerOpen, setIsAccountSameAsCustomerOpen] = useState(false)
    const [isAccountAddressSameAsCustomerOpen, setIsAccountAddressSameAsCustomerOpen] = useState(false)
    const [selectedAppointmentList, setSelectedAppointmentList] = useState([])
    const [productCategory, setProductCategory] = useState([])
    const [productSubCategory, setProductSubCategory] = useState([])
    const [productBenefitLookup, setProductBenefitLookup] = useState([])

    const [openProductMetaAttributeForm, setOpenProductMetaAttributeForm] = useState({ show: false, product: {} });

    const [productType, setProductType] = useState([])
    const [serviceType, setServiceType] = useState([])
    const [isActiveTab, setIsActiveTab] = useState('MAP');

    const eighteenYears = moment(new Date()).subtract(18, "years").format('DD-MM-YYYY')

    const customerDataValidationSchema = object().shape({
        firstName: string().test(
            "no-numeric",
            "Should contain only Alphabets",
            (value) => {
                return /^[A-Za-z\s]+$/.test(value); // Check if the value contains any numeric characters
            }
        ).required("Firstname is required"),
        lastName: string().test(
            "no-numeric",
            "Should contain only Alphabets",
            (value) => {
                return /^[A-Za-z\s]+$/.test(value); // Check if the value contains any numeric characters
            }
        ).required("Lastname is required"),
        gender: selectedCustomerType !== 'REG' ? string().nullable(true) : string().required("Gender is required"),
        idType: string().required("ID type is required"),
        idValue: string().required("ID Number is required"),
        dob: selectedCustomerType !== 'REG' ? string().nullable(true) : string().required("Date of birth is required"),
        registrationNbr: selectedCustomerType === 'REG' ? string().nullable(true) : string().required("Registration number is required"),
        businessName: selectedCustomerType === 'REG' ? string().nullable(true) : string().required("Business Name is required"),
        registrationDate: selectedCustomerType === 'REG' ? string().nullable(true) : string().required("Registration date is required"),
    });

    const customerAddressValidationSchema = object().shape({
        address1: string().test(
            "no-numeric",
            "Should contain only Alphabets, numbers, symbolx .-#,&",
            (value) => {
                return /^[A-Za-z\s\d-,.#$]+$/.test(value); // Check if the value contains any numeric characters
            }
        ).required("Address 1 is required"),
        address2: string().test(
            "no-numeric",
            "Should contain only Alphabets, numbers, symbolx .-#,&",
            (value) => {
                return /^[A-Za-z\s\d-,.#$]+$/.test(value); // Check if the value contains any numeric characters
            }
        ).required("Address 2 is required"),
        district: string().required("District is required"),
        city: string().required("City/Town is required"),
        postcode: string().required("Postcode is required"),
        country: string().required("Country is required"),
        state: string().required("State is required"),
        // email: string().required("Email is required"),
        email: string().email("Please Enter Valid Email ID").required("Please Enter Email ID"),
        contactNbr: string().required("Contact Number is required"),
        countryCode: string().required("State is required")
    });

    const accountDataValidationSchema = object().shape({
        firstName: string().test(
            "no-numeric",
            "Only Alphabets are allowed",
            (value) => {
                return /^[A-Za-z\s]+$/.test(value); // Check if the value contains any numeric characters
            }
        ).required("Firstname is required"),
        lastName: string().test(
            "no-numeric",
            "Only Alphabets are allowed",
            (value) => {
                return /^[A-Za-z\s]+$/.test(value); // Check if the value contains any numeric characters
            }
        ).required("Lastname is required"),
        gender: selectedCustomerType !== 'REG' ? string().nullable(true) : string().required("Gender is required"),
        idType: string().required("ID type is required"),
        idValue: string().required("ID Number is required"),
        // email: string().required("Email is required"),
        email: string().email("Please Enter Valid Email ID").required("Please Enter Email ID"),
        contactNbr: string().required("Contact Number is required"),
        // dob: string().required("Date of birth is required"),
        registrationNbr: selectedCustomerType === 'REG' ? string().nullable(true) : string().required("Registration number is required"),
        registrationDate: selectedCustomerType === 'REG' ? string().nullable(true) : string().required("Registration date is required"),
    });

    const accountOtherDataValidationSchema = object().shape({
        accountCategory: string().required("Account Category is required"),
        // accountClass: string().required("Account Class is required"),
        // accountPriority: string().required("Account Priority is required"),
        accountLevel: string().required("Account Level is required"),
        billLanguage: string().required("Bill Language is required"),
        accountType: string().required("Account Type is required"),
        // notificationPreference: string().required("Notification Preference is required"),
        currency: string().required("Currency is required"),
        // creditLimit: string().required("Credit Limit is required"),
        // accountOutstanding: string().required("Account Outstanding is required"),
        // accountBalance: string().required("Account Balance is required")
    });

    const accountAddressValidationSchema = object().shape({
        address1: string().test(
            "no-numeric",
            "Should contain only Alphabets, numbers, symbolx .-#,&",
            (value) => {
                return /^[A-Za-z\s\d-,.#$]+$/.test(value); // Check if the value contains any numeric characters
            }
        ).required("Address 1 is required"),
        address2: string().test(
            "no-numeric",
            "Should contain only Alphabets, numbers, symbolx .-#,&",
            (value) => {
                return /^[A-Za-z\s\d-,.#$]+$/.test(value); // Check if the value contains any numeric characters
            }
        ).required("Address 2 is required"),
        district: string().required("District is required"),
        city: string().required("City/Town is required"),
        postcode: string().required("Postcode is required"),
        country: string().required("Country is required"),
        state: string().required("State is required"),
    });

    const validate = (section, schema, data) => {
        try {
            if (section === 'CUSTOMER') {
                setCustomerDetailsError({})
            } else if (section === 'CUSTOMER_CONTACT') {
                setCustomerContactDetailsError({})
            } else if (section === 'ACCOUNT') {
                setAccountDetailsError({})
            } else if (section === 'SERVICE') {
                setServiceDetailsError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'CUSTOMER') {
                    setCustomerDetailsError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                } else if (section === 'CUSTOMER_CONTACT') {
                    setCustomerContactDetailsError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                } else if (section === 'ACCOUNT') {
                    setAccountDetailsError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                } else if (section === 'SERVICE') {
                    setServiceDetailsError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=PRODUCT_BENEFIT,COUNTRY,GENDER,CUSTOMER_CATEGORY,CUSTOMER_ID_TYPE,ACCOUNT_CATEGORY,ACCOUNT_TYPE,ACCOUNT_CLASS,ACCOUNT_LEVEL,CONTACT_PREFERENCE,PRIORITY,ACC_STATUS_REASON,CURRENCY,BILL_LANGUAGE,PRODUCT_TYPE,PRODUCT_CATEGORY,PRODUCT_SUB_CATEGORY,SERVICE_TYPE,CONTACT_PREFERENCE,APPOINT_TYPE')
            .then((response) => {
                if (response.data) {
                    businessMasterRef.current = response.data
                    unstable_batchedUpdates(() => {
                        setCountries(response.data.COUNTRY)
                        setGenderLookup(response.data.GENDER)
                        setCustomerTypeLookup(response.data.CUSTOMER_CATEGORY)
                        setIdTypeLookup(response.data.CUSTOMER_ID_TYPE)
                        setAccountCategoryLookup(response.data.ACCOUNT_CATEGORY)
                        setAccountTypeLookup(response.data.ACCOUNT_TYPE)
                        setAccountClassLookup(response.data.ACCOUNT_CLASS)
                        setAccountLevelLookup(response.data.ACCOUNT_LEVEL)
                        setNotificationLookup(response.data.CONTACT_PREFERENCE)
                        setPriorityLookup(response.data.PRIORITY)
                        setAccountStatusReasonLookup(response.data.ACC_STATUS_REASON)
                        setCurrencyLookup(response.data.CURRENCY)
                        setBillLanguageLookup(response.data.BILL_LANGUAGE)
                        setProductCategoryLookup(response.data.PRODUCT_CATEGORY)
                        setProductSubCategoryLookup(response.data.PRODUCT_SUB_CATEGORY)
                        setProductTypeLookup(response.data.PRODUCT_TYPE)
                        setServiceTypeLookup(response.data.SERVICE_TYPE)
                        setProductBenefitLookup(response.data.PRODUCT_BENEFIT)
                        setContactPreferenceLookup(response.data.CONTACT_PREFERENCE.map((x) => { return { label: x.description, value: x.code } }))
                    })
                    const prefix = []
                    response.data.COUNTRY.map((e) => {
                        prefix.push({ value: e.mapping.countryCode, label: "(" + e.mapping.countryCode + ") " + e.description, phoneNolength: e.mapping.phoneNolength })
                    })
                    setPhoneNoPrefix(prefix)

                    // console.log('serviceData ', serviceData)
                    // setServiceData({
                    //     ...serviceData,
                    //     serviceType: response.data.SERVICE_TYPE && response.data.SERVICE_TYPE.length > 0 ? response.data.SERVICE_TYPE[0]?.code : ""
                    // })
                    if (customerDetails?.customerContact && customerDetails?.customerContact[0]?.mobilePrefix) {
                        const phoneLength = prefix?.find(f => f.value === customerDetails?.customerContact[0]?.mobilePrefix).phoneNolength || 0
                        setPhoneNumberLength(phoneLength)
                    }
                    else if (
                        customerDetails?.customerAddress[0]?.country
                    ) {
                        const phoneLength = response.data.COUNTRY?.find(f => String(f.code).toUpperCase() === String(customerDetails?.customerAddress[0]?.country).toUpperCase()).mapping.phoneNolength || 0
                        setPhoneNumberLength(phoneLength)
                    }
                    // console.log('---------------------------------------------', phoneLength)

                }
                fetchProductList();
            })
            .catch(error => {
                console.error(error);
            }).finally()

    }, [])

    useEffect(() => {
        if (!isEmpty(customerTypeLookup)) {
            fetchProductList()
        }
    }, [customerTypeLookup])

    const fetchCountryList = (input, data = undefined, pageIndex = undefined) => {
        get(properties.ADDRESS_LOOKUP_API + '?country=' + input)
            .then((resp) => {
                if (resp && resp.data) {
                    setAddressLookUpRef(resp.data)
                    if (data) {
                        const addressData = resp.data?.find((x) => x.postCode === data?.postcode)
                        setCustomerAddress({
                            ...customerAddress,
                            latitude: addressData?.latitude?.toString() || data?.latitude?.toString() || "",
                            longitude: addressData?.longitude?.toString() || data?.longitude?.toString() || "",
                            address1: data?.address1 || "",
                            address2: data?.address2 || "",
                            address3: data?.address3 || "",
                            postcode: addressData?.postCode || "",
                            state: addressData?.state || "",
                            district: addressData?.district || "",
                            city: addressData?.city || "",
                            country: addressData?.country || '',
                            // countryCode: data?.countryCode || ''
                        })
                    }
                    if (pageIndex) {
                        setCustomerPageIndex(pageIndex)
                        // if (pageIndex === 2) {
                        //     setIsServicePopupOpen(true)
                        // }

                    }
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }
    const fetchProductList = (serviceType, key = undefined) => {
        if (selectedCustomerType && !isEmpty(customerTypeLookup) && isEmpty(productList)) {
            const reqBody = {}

            const customerTypeProductMapping = customerTypeLookup.filter((e) => e.code === selectedCustomerType)?.[0]?.mapping?.productSubCategory;
            console.log('customerTypeProductMapping--------->', customerTypeProductMapping)
            post(properties.PRODUCT_API + "/mapping-list", reqBody)
                .then((response) => {
                    if (response.data) {
                        const productList = response.data.productList.rows.filter((p) => customerTypeProductMapping?.includes(p.productSubCategory));

                        // const productList = response.data.productList.rows;

                        console.log('productList-------->', productList);

                        let bundleList = response.data.bundleList.rows.map((m) => m);
                        // console.log('bundleList-------->', bundleList)

                        productList.map((x) => {
                            let Rc = 0
                            let Nrc = 0
                            let totalRc = 0
                            let totalNrc = 0
                            let currency = '$'
                            if (x?.productChargesList && x?.productChargesList.length > 0) {
                                x?.productChargesList.forEach((y) => {
                                    if (y?.chargeDetails?.chargeCat === 'CC_RC' && (!y.objectReferenceId || y.objectReferenceId == null)) {
                                        Rc = Number(y?.chargeAmount || 0)
                                        totalRc = totalRc + Number(y?.chargeAmount || 0)
                                    } else if (y?.chargeDetails?.chargeCat === 'CC_NRC' && (!y.objectReferenceId || y.objectReferenceId == null)) {
                                        totalNrc = totalNrc + Number(y?.chargeAmount || 0)
                                        Nrc = Number(y?.chargeAmount || 0)
                                    }
                                    currency = y?.chargeDetails?.currencyDesc?.description || '$'
                                })
                            }
                            x.Rc = Rc
                            x.Nrc = Nrc
                            x.totalRc = totalRc
                            x.totalNrc = totalNrc
                            x.quantity = 0
                            x.isSelected = 'N'
                            x.currency = currency
                        })

                        bundleList = bundleList.filter((x) => {
                            if (x.productBundleDtl && x.productBundleDtl.length > 0) {

                                return true;
                            }

                            return false;
                        });

                        bundleList.map((x) => {
                            let Rc = 0
                            let Nrc = 0
                            let totalRc = 0
                            let totalNrc = 0
                            let currency = '$'

                            if (x?.productBundleDtl && x?.productBundleDtl.length > 0) {
                                x?.productBundleDtl?.forEach((bundleDtl) => {
                                    const rcAmount = bundleDtl.charges && bundleDtl.charges?.length > 0 && bundleDtl.charges
                                        .filter((charge) => charge.chargeType === 'CC_RC' && (!charge.objectReferenceId || charge.objectReferenceId == null))
                                        .reduce((total, charge) => total + Number(charge.chargeAmount), 0);

                                    const nrcAmount = bundleDtl.charges && bundleDtl.charges?.length > 0 && bundleDtl.charges
                                        .filter((charge) => charge.chargeType === 'CC_NRC' && (!charge.objectReferenceId || charge.objectReferenceId == null))
                                        .reduce((total, charge) => total + Number(charge.chargeAmount), 0);

                                    totalRc += rcAmount;
                                    totalNrc += nrcAmount;

                                    currency = bundleDtl.charges && bundleDtl.charges?.length > 0 && bundleDtl.charges?.[0].currency || '$'

                                });
                            }

                            x.Rc = Rc
                            x.Nrc = Nrc
                            x.totalRc = totalRc
                            x.totalNrc = totalNrc
                            x.quantity = 0
                            x.isSelected = 'N'
                            x.currency = currency
                        })

                        !serviceData && !serviceData?.serviceType && serviceData?.serviceType.push(serviceType?.code)
                        if (customerDetails && customerDetails?.customerAccounts && customerDetails?.customerAccounts.length > 0) {
                            const accountInitialValues = {
                                isAccountCreate: "N",
                                ...customerDetails.customerAccounts[0],
                            };
                            // console.log('accountInitialValues ', accountInitialValues)
                            setAccountData(accountInitialValues)

                        }
                        let serviceList = []
                        customerDetails && customerDetails.customerAccounts &&
                            customerDetails.customerAccounts.length > 0 &&
                            customerDetails.customerAccounts
                                .filter((f) => {
                                    return f.accountServices && f.accountServices.length > 0;
                                })
                                .map((f) => {
                                    f.accountServices.map((ele) => {

                                        if (!!!['SS_IN', 'SS_AC', 'SS_PEND'].includes(ele.status)) {
                                            serviceList.push({ service: ele })
                                        }
                                    })
                                })
                        // console.log('=1===========',serviceList)

                        serviceList = serviceList.map(f => {
                            f.service.productUuid = productList.length > 0 && productList?.find(x => x.productId === f.service.planPayload)?.productUuid
                            return f
                        })

                        // console.log('==========2================================', serviceList)

                        setServiceData({
                            ...serviceData,
                            serviceUuid: serviceList

                        })
                        // console.log('productList==>', productList)
                        // console.log('bundleList==>', bundleList)

                        setProductList([...productList, ...bundleList]) // need to do customer type filter
                        setOriginalProductList([...productList, ...bundleList])// need to do customer type filter
                        if (key === 'POPUP') {
                            setIsServicePopupOpen(false)
                            handleMoveNext()
                        }
                    }
                })
                .catch(error => {
                    console.error(error);
                }).finally()
        }
    }

    const handleInputChange = (e) => {
        const { target } = e
        setCustomerData({
            ...customerData,
            [target.id]: target.value
        })
        setCustomerDetailsError({
            ...customerDetailsError,
            [target.id]: ""
        })
    }

    const handleAccountInputChange = (e) => {
        const { target } = e
        if (target.id == "email") {
            if (target.value.match(/^[A-Za-z0-9._]+@[A-Za-z0-9.-]+$/)) {
                setAccountData({
                    ...accountData,
                    [target.id]: target.value
                })
                setAccountDetailsError({
                    ...accountDetailsError,
                    [target.id]: ""
                })
            } else {
                setAccountDetailsError({
                    ...accountDetailsError,
                    [target.id]: "Please enter valid email id"
                })
            }
        } else {
            setAccountData({
                ...accountData,
                [target.id]: target.value
            })
            setAccountDetailsError({
                ...accountDetailsError,
                [target.id]: ""
            })
        }
    }

    useEffect(() => {
        if (edit) {
            setCustomerPageIndex(1)
            setCustomerData({
                ...customerData,
                firstName: customerDetails?.firstName || "",
                lastName: customerDetails?.lastName || "",
                gender: customerDetails?.gender || "",
                dob: customerDetails?.birthDate || "",
                idType: customerDetails?.idType || "",
                idValue: customerDetails?.idValue || "",
                registrationNbr: customerDetails?.registeredNo || "",
                registrationDate: customerDetails?.registeredDate || "",
                customerNo: customerDetails?.customerNo,
                customerId: customerDetails?.customerId,
                customerUuid: customerDetails?.customerUuid,
                customerPhoto: customerDetails?.customerPhoto || '',
                businessName: customerDetails?.businessName || ''
            })
            setCustomerAddress({
                ...customerAddress,
                email: customerDetails?.customerContact ? customerDetails?.customerContact[0]?.emailId : "",
                contactNbr: customerDetails?.customerContact && customerDetails?.customerContact[0]?.mobileNo || "",
                address1: customerDetails?.customerAddress && customerDetails?.customerAddress[0]?.address1 || "",
                address2: customerDetails?.customerAddress && customerDetails?.customerAddress[0]?.address2 || "",
                address3: customerDetails?.customerAddress && customerDetails?.customerAddress[0]?.address3 || "",
                district: customerDetails?.customerAddress && customerDetails?.customerAddress[0]?.district || "",
                state: customerDetails?.customerAddress && customerDetails?.customerAddress[0]?.state || "",
                city: customerDetails?.customerAddress && customerDetails?.customerAddress[0]?.city || "",
                country: customerDetails?.customerAddress && customerDetails?.customerAddress[0]?.country || "",
                postcode: customerDetails?.customerAddress && customerDetails?.customerAddress[0]?.postcode || "",
                latitude: customerDetails?.customerAddress && customerDetails?.customerAddress[0]?.latitude || "",
                longitude: customerDetails?.customerAddress && customerDetails?.customerAddress[0]?.longitude || "",
                countryCode: customerDetails?.customerContact && customerDetails?.customerContact[0]?.mobilePrefix || "",
                contactNo: customerDetails?.customerContact && customerDetails?.customerContact[0]?.contactNo || "",
                addressNo: customerDetails?.customerAddress && customerDetails?.customerAddress[0]?.addressNo || "",
                intxnNo: props?.location?.state?.data?.intxnNo || "",
                contactPreferences: customerDetails?.contactPreferences || []

            })

            if (pageIndex !== 0) {
                if (customerDetails?.customerCategory) {
                    setSelectedCustomerType(customerDetails?.customerCategory)
                }
                if (customerDetails?.customerAddress[0]?.country) {
                    fetchCountryList(customerDetails?.customerAddress[0]?.country, undefined, pageIndex)
                }
            }
            // if(pageIndex === 2){
            //setIsServicePopupOpen(true)
            // }
            // if(pageIndex === 0){
            //     setIsCustomerTypePopupOpen(true)
            // }

        }
    }, [props?.location?.state?.data])

    useEffect(() => {
        if (idScanSuccess) {
            handleMoveNext()
        }
    }, [idScanSuccess])
    // useEffect(() => {
    //     if (!edit) {
    //         const requestBody = {
    //             status: ['CS_TEMP']
    //         }
    //         
    //         post(`${properties.CUSTOMER_API}/get-customer?limit=10&page=0`, requestBody)
    //             .then((resp) => {
    //                 if (resp.data) {
    //                     if (resp.status === 200) {
    //                         const { count, rows } = resp.data;

    //                         if (Number(count) > 0) {
    //                             unstable_batchedUpdates(() => {
    //                                 setTotalCount(count)
    //                                 setCustomerSearchData(rows);
    //                             })
    //                         } 

    //                     }
    //                 }
    //             }).finally(() => {
    //                 
    //             });
    //     }
    // }, [])

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
        const countryData = countries?.find((x) => x?.code === customerAddress?.country)
        if (countryData) {
            setAccountData({
                ...accountData,
                billLanguage: countryData?.mapping?.billLanguage || "",
                currency: countryData?.mapping?.currency || "",
            })
        }
    }, [customerAddress?.country])

    useEffect(() => {
        setCreationPercentage(customerPageIndex * 10.5)
    }, [customerPageIndex])

    const handleSubmit = () => {
        if (serviceData?.isAgreed === "N") {
            toast.error('Please Confirm the terms and conditions')
            return
        }
        if (sigPad.current?.getTrimmedCanvas().toDataURL('image/png') === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC') {
            toast.error('Please Provide Signature')
            return
        } else {
            setServiceAgreement(sigPad.current?.getTrimmedCanvas().toDataURL('image/png'));
            handleUpdateServiceSubmit('FINAL_SUBMIT_AGREEMENT', sigPad.current?.getTrimmedCanvas().toDataURL('image/png'))
        }
    }

    const handleRemoveServiceType = (serviceType) => {
        let serviceTypes = Array.isArray(serviceData?.serviceType) ? serviceData.serviceType.filter(x => x !== serviceType) : []
        setServiceData({
            ...serviceData,
            serviceType: serviceTypes
        })
        let newProductsList = Array.isArray(productList) ? productList.filter(x => x.productType !== serviceType) : []
        setProductList([...newProductsList])
        let newSelectedProductsList = Array.isArray(selectedProductList) ? selectedProductList.filter(x => x.productType !== serviceType) : []
        setSelectedProductList([...newSelectedProductsList])
    }

    const handleCustomerSubmitPopup = () => {
        // setDisplayPreview(true)
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            // cancelButtonText: 'Cancel',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, Submit it!`,
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                if (serviceData?.isNeedQuoteOnly === 'Y') {
                    handleNeedQuote()
                } else {
                    handleCreateOrder()
                    // handleNeedQuote()
                }
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleCustomerFinalSubmit = () => {
        if (serviceData?.isNeedQuoteOnly === 'Y') {
            handleNeedQuote()
        } else {
            setDisplayPreview(false)
            Swal.fire({
                title: 'Are you sure, you want to generate order?',
                icon: '',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonText: 'No',
                cancelButtonColor: '#d33',
                confirmButtonText: `Yes`,
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    handleCreateOrder()
                }
            }).catch((error) => {
                console.log(error)
            })
        }
    }

    const handleOnSelectAccountCreate = () => {
        Swal.fire({
            title: 'Do you want to create Account?',
            text: 'Yes or No',
            icon: '',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonText: 'No',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes`,
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                handleOnSelectAccountSameAsCustomer()
            } else {
                if (accountData?.accountUuid) {
                    setAccountData({
                        ...accountData,
                        isAccountCreate: "N"
                    })
                    setCustomerPageIndex(8)
                    window.scrollTo(0, 0);
                } else {
                    handleAccountDetailsSubmit('FINAL_SUBMIT')
                }
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleYesCreateAccount = () => {
        setIsAccountSameAsCustomerOpen(true)
        setIsAccountCreateOpen(false)
    }

    const handleNoCreateAccount = () => {
        if (accountData?.accountUuid) {
            setAccountData({
                ...accountData,
                isAccountCreate: "N"
            })
            setCustomerPageIndex(8)
            window.scrollTo(0, 0);
        } else {
            handleAccountDetailsSubmit('FINAL_SUBMIT')
        }
        setIsAccountCreateOpen(false)
    }

    const handleYesUseCustomerAsAccount = () => {
        handleSameAsCustomerDetailsChange(true, { isAccountCreate: "Y" })
        setCustomerPageIndex(6)
        window.scrollTo(0, 0);
        setIsAccountSameAsCustomerOpen(false)
    }

    const handleNoUseCustomerAsAccount = () => {
        handleSameAsCustomerDetailsChange(false, { isAccountCreate: 'Y' })
        handleMoveNext()
        setIsAccountSameAsCustomerOpen(false)
    }

    const handleYesUseCustomerAddressAsAccountAddress = () => {
        if (accountData?.accountUuid) {
            handleSameAsCustomerAddressDetailsChange(true)
            setCustomerPageIndex(8)
            window.scrollTo(0, 0);
        }
        setIsAccountAddressSameAsCustomerOpen(false)
    }

    const handleNoUseCustomerAddressAsAccountAddress = () => {
        handleSameAsCustomerAddressDetailsChange(false)
        handleMoveNext()
        setIsAccountAddressSameAsCustomerOpen(false)
    }

    const handleOnSelectAccountSameAsCustomer = () => {
        Swal.fire({
            title: 'Do you want to Use Account Details same as customer details?',
            text: 'Yes or No',
            icon: '',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonText: 'No',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes`,
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                // setAccountData({
                //     ...accountData,
                //     isAccountCreate: "Y"
                // })
                handleSameAsCustomerDetailsChange(true, { isAccountCreate: "Y" })
                setCustomerPageIndex(6)
                window.scrollTo(0, 0);
            } else {
                handleSameAsCustomerDetailsChange(false, { isAccountCreate: 'Y' })
                handleMoveNext()
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleOnSelectAccountAddressSameAsCustomerAddress = () => {
        Swal.fire({
            title: 'Do you want to Use Account Address same as Customer Address?',
            text: 'Yes or No',
            icon: '',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonText: 'No',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes`,
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                if (accountData?.accountUuid) {
                    handleSameAsCustomerAddressDetailsChange(true)
                    setCustomerPageIndex(8)
                    window.scrollTo(0, 0);
                }
            } else {
                handleSameAsCustomerAddressDetailsChange(false)
                handleMoveNext()
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleSameAsCustomerDetailsChange = (value, data = {}) => {
        if (value) {
            setIsSameasCustomerAddress(true)
            setAccountData({
                ...accountData,
                ...data,
                sameAsCustomerData: "Y",
                firstName: customerData?.firstName,
                lastName: customerData?.lastName,
                email: customerAddress?.email,
                contactNbr: customerAddress?.contactNbr,
                dob: customerData?.dob,
                gender: customerData?.gender,
                idType: customerData?.idType,
                idValue: customerData?.idValue,
                registrationNbr: customerData?.registrationNbr,
                registrationDate: customerData?.registrationDate,
                businessName: customerData?.businessName
            })
            setAccountAddress({
                ...accountAddress,
                sameAsCustomerAddress: "Y",
                countryCode: customerAddress?.countryCode
            })
            setAccountDetailsError({})
        } else {
            setIsSameasCustomerAddress(false)
            setAccountData({
                ...accountData,
                ...data,
                sameAsCustomerData: "N",
                firstName: "",
                lastName: '',
                email: '',
                contactNbr: '',
                dob: '',
                gender: '',
                idType: '',
                idValue: '',
                registrationNbr: "",
                registrationDate: "",
                businessName: ""
            })
            setAccountAddress({
                ...accountAddress,
                sameAsCustomerAddress: "N",
                countryCode: customerAddress?.countryCode
            })
            setAccountDetailsError({})
        }

    }

    const handleSameAsCustomerAddressDetailsChange = (value, data = {}) => {
        if (value) {
            setAccountAddress({
                ...accountAddress,
                ...data,
                sameAsCustomerAddress: "Y",
                address1: customerAddress?.address1,
                address2: customerAddress?.address2,
                address3: customerAddress?.address3,
                district: customerAddress?.district,
                state: customerAddress?.state,
                city: customerAddress?.city,
                country: customerAddress?.country,
                postcode: customerAddress?.postcode,
                latitude: customerAddress?.latitude,
                longitude: customerAddress?.longitude,
                countryCode: customerAddress?.countryCode
            })
            setAccountDetailsError({})
        } else {
            setAccountAddress({
                ...accountAddress,
                sameAsCustomerAddress: "N",
                address1: "",
                address2: "",
                address3: "",
                district: "",
                state: "",
                city: "",
                country: "",
                postcode: "",
                countryCode: ""
            })
            setAccountDetailsError({})
        }

    }

    const handleSameAsCustomerServiceAddressDetailsChange = (value) => {
        if (value) {
            setServiceAddress({
                ...serviceAddress,
                sameAsCustomerAddress: "Y",
                address1: customerAddress?.address1,
                address2: customerAddress?.address2,
                address3: customerAddress?.address3,
                district: customerAddress?.district,
                state: customerAddress?.state,
                city: customerAddress?.city,
                country: customerAddress?.country,
                postcode: customerAddress?.postcode,
                latitude: customerAddress?.latitude,
                longitude: customerAddress?.longitude,
                countryCode: customerAddress?.countryCode
            })
            setServiceDetailsError({})
        } else {
            setServiceAddress({
                ...serviceAddress,
                sameAsCustomerAddress: "N",
                address1: "",
                address2: "",
                address3: "",
                district: "",
                state: "",
                city: "",
                country: "",
                postcode: "",
                countryCode: ""
            })
            setServiceDetailsError({})
        }

    }

    const handleCustomerDetailsSubmit = () => {
        const requestBody = {
            details: {
                source: 'CREATE_CUSTOMER',
                firstName: customerData?.firstName,
                lastName: customerData?.lastName,
                gender: customerData?.gender,
                birthDate: customerData?.dob || null,
                idType: customerData?.idType,
                idValue: customerData?.idValue,
                customerCategory: selectedCustomerType,
                registeredNo: customerData?.registrationNbr || null,
                registeredDate: customerData?.registrationDate || null,
                businessName: customerData?.businessName || null
            }
            // requestBody.details.nationality = customerData.firstName
            // requestBody.details.billable =  'Y'
        }
        if (customerData?.entityId) {
            requestBody.attachment = [customerData?.entityId]
        }

        post(properties.CUSTOMER_API + '/create', requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        toast.success("Information Saved Successfully");
                        setCustomerData({
                            ...customerData,
                            customerUuid: resp?.data?.customerUuid,
                            customerNo: resp?.data?.customerNo,
                            customerId: resp?.data?.customerId
                        })
                        handleMoveNext()
                    } else {
                        toast.error("Failed to create - " + resp.status);
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally();
    }

    const handleUpdateCustomerDetailsSubmit = (key = undefined) => {
        let contactPreferences = selectedContactPreferences.map((x) => x.value);
        const requestBody = {
            details: {
                customerNo: customerData?.customerNo,
                firstName: customerData?.firstName,
                lastName: customerData?.lastName,
                gender: customerData?.gender,
                birthDate: customerData?.dob || null,
                idType: customerData?.idType,
                idValue: customerData?.idValue,
                customerPhoto: customerData?.customerPhoto,
                customerCategory: selectedCustomerType,
                registeredNo: customerData?.registrationNbr || null,
                registeredDate: customerData?.registrationDate || null,
                contactPreferences: contactPreferences?.length ? contactPreferences : undefined,
                businessName: customerData?.businessName || null
            }
        }
        if (customerData?.entityId) {
            requestBody.attachment = [customerData?.entityId]
        }
        if (key === 'CONTACT') {
            requestBody.address = {
                isPrimary: true,
                address1: customerAddress?.address1,
                address2: customerAddress?.address2,
                address3: customerAddress?.address3,
                city: customerAddress?.city,
                state: customerAddress?.state,
                district: customerAddress?.district,
                country: customerAddress?.country,
                postcode: customerAddress?.postcode,
                latitude: customerAddress?.latitude,
                longitude: customerAddress?.longitude,
            }
            if (customerAddress?.addressNo) {
                requestBody.address.addressNo = customerAddress?.addressNo
            }
            requestBody.contact = {
                isPrimary: true,
                firstName: customerData?.firstName,
                lastName: customerData?.lastName,
                emailId: customerAddress?.email,
                mobilePrefix: customerAddress?.countryCode,
                mobileNo: customerAddress?.contactNbr
            }
            if (customerAddress?.contactNo) {
                requestBody.contact.contactNo = customerAddress?.contactNo
            }
        }

        put(properties.CUSTOMER_API + '/' + customerData?.customerUuid, requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        toast.success("Information Saved Successfully");
                        if (key === 'CONTACT') {
                            setCustomerAddress({
                                ...customerAddress,
                                contactNo: resp?.data?.contactNo,
                                addressNo: resp?.data?.addressNo
                            })
                            // if(accountData?.accountUuid) {
                            //     handleUpdateAccountDetailsSubmit()
                            // } else {
                            //     handleAccountDetailsSubmit('POPUP_SUBMIT')
                            // }

                            //it was enabled. considering the new update bringing the filter inside

                            // if (serviceData?.serviceType && serviceData?.serviceType.length < 1) {
                            //     setIsServicePopupOpen(false) //it was true
                            // } else {

                            // }
                            handleMoveNext()
                        } else {
                            handleMoveNext()
                        }
                    } else {
                        toast.error("Failed to create - " + resp.status);
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally();
    }

    const handleAccountDetailsSubmit = (key = undefined) => {
        const requestBody = {
            details: {
                customerUuid: customerData?.customerUuid,
                firstName: accountData?.firstName || customerData?.firstName,
                lastName: accountData?.lastName || customerData?.lastName,
                gender: accountData?.gender || customerData?.gender,
                // birthDate: accountData?.dob || accountData?.firstName,
                idType: accountData?.idType || customerData?.idType,
                idValue: accountData?.idValue || customerData?.idValue,
                registeredNo: accountData?.registrationNbr || customerData?.registeredNo,
                registeredDate: accountData?.registrationDate || customerData?.registeredDate,
                currency: accountData?.currency,
                billLanguage: accountData?.billLanguage,
            },
            contact: {
                isPrimary: true,
                firstName: accountData?.firstName || customerData?.firstName,
                lastName: accountData?.lastName || customerData?.lastName,
                emailId: accountData?.email || customerAddress?.email,
                mobilePrefix: accountAddress?.countryCode || customerAddress?.countryCode,
                mobileNo: accountData?.contactNbr || customerAddress?.contactNbr
            }
        }
        if (key === 'FINAL_SUBMIT' || key === 'POPUP_SUBMIT') {
            requestBody.address = {
                isPrimary: false,
                address1: accountAddress?.address1 || customerAddress?.address1,
                address2: accountAddress?.address2 || customerAddress?.address2,
                address3: accountAddress?.address3 || customerAddress?.address3,
                city: accountAddress?.city || customerAddress?.city,
                state: accountAddress?.state || customerAddress?.state,
                district: accountAddress?.district || customerAddress?.district,
                country: accountAddress?.country || customerAddress?.country,
                postcode: accountAddress?.postcode || customerAddress?.postcode,
                latitude: accountAddress?.latitude || customerAddress?.latitude,
                longitude: accountAddress?.longitude || customerAddress?.longitude,
            }
        }

        post(properties.ACCOUNT_DETAILS_API + '/create', requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        if (!key) {
                            setAccountData({
                                ...accountData,
                                isAccountCreate: key === 'FINAL_SUBMIT' ? 'N' : 'Y',
                                accountUuid: resp?.data?.accountUuid,
                                accountNo: resp?.data?.accountNo,
                                accountId: resp?.data?.accountId,
                                contactNo: resp?.data?.contactNo,
                                addressNo: resp?.data?.addressNo,
                            })
                            toast.success("Information Saved Successfully");
                            handleMoveNext()
                        } else if (key === 'FINAL_SUBMIT') {
                            setAccountData({
                                ...accountData,
                                isAccountCreate: key === 'FINAL_SUBMIT' ? 'N' : 'Y',
                                accountUuid: resp?.data?.accountUuid,
                                accountNo: resp?.data?.accountNo,
                                accountId: resp?.data?.accountId,
                                contactNo: resp?.data?.contactNo,
                                addressNo: resp?.data?.addressNo,
                            })
                            handleSameAsCustomerServiceAddressDetailsChange(true)
                            setCustomerPageIndex(7)
                            window.scrollTo(0, 0);
                        } else if (key === 'POPUP_SUBMIT') {
                            const data = {
                                isAccountCreate: "N",
                                accountUuid: resp?.data?.accountUuid,
                                accountNo: resp?.data?.accountNo,
                                accountId: resp?.data?.accountId,
                                contactNo: resp?.data?.contactNo,
                                addressNo: resp?.data?.addressNo,
                            }
                            handleSameAsCustomerDetailsChange(true, data)
                        }
                    } else {
                        toast.error("Failed to create - " + resp.status);
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally();
    }

    const handleUpdateAccountDetailsSubmit = (key = undefined) => {
        const requestBody = {
            details: {
                action: "UPDATE",
                // accountNo: accountData?.accountNo,
                firstName: accountData?.firstName,
                lastName: accountData?.lastName,
                gender: accountData?.gender,
                // birthDate: accountData?.dob,
                idType: accountData?.idType,
                idValue: accountData?.idValue,
                registeredNo: accountData?.registrationNbr == "" ? undefined : accountData?.registrationNbr,
                registeredDate: accountData?.registrationDate == "" ? undefined : accountData?.registrationDate,
                accountCategory: accountData?.accountCategory,
                // accountClass: accountData?.accountClass,
                // accountPriority: accountData?.accountPriority,
                accountLevel: accountData?.accountLevel,
                billLanguage: accountData?.billLanguage,
                accountType: accountData?.accountType,
                notificationPreference: [accountData?.notificationPreference],
                // creditLimit: accountData?.creditLimit,
                // accountBalance: accountData?.accountBalance,
                // accountOutstanding: accountData?.accountOutstanding,
                currency: accountData?.currency,
            },
            contact: {
                contactNo: accountData?.contactNo,
                isPrimary: true,
                firstName: accountData?.firstName,
                lastName: accountData?.lastName,
                emailId: accountData?.email,
                mobilePrefix: accountAddress?.countryCode || customerAddress?.countryCode,
                mobileNo: accountData?.contactNbr
            }
        }
        if (key === 'ADDRESS' || key === 'POPUP_SUBMIT') {
            requestBody.address = {
                isPrimary: true,
                address1: accountAddress?.address1 || customerAddress?.address1,
                address2: accountAddress?.address2 || customerAddress?.address2,
                address3: accountAddress?.address3 || customerAddress?.address3,
                city: accountAddress?.city || customerAddress?.city,
                state: accountAddress?.state || customerAddress?.state,
                district: accountAddress?.district || customerAddress?.district,
                country: accountAddress?.country || customerAddress?.country,
                postcode: accountAddress?.postcode || customerAddress?.postcode,
                latitude: accountAddress?.latitude || customerAddress?.latitude,
                longitude: accountAddress?.longitude || customerAddress?.longitude,
            }
            if (accountData?.addressNo) {
                requestBody.address.addressNo = accountData?.addressNo
            }
        }

        put(properties.ACCOUNT_DETAILS_API + '/update/' + accountData?.accountUuid, requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        toast.success("Information Saved Successfully");
                        if (key === 'OTHER') {
                            setIsAccountAddressSameAsCustomerOpen(true)
                        } else if (key === 'ADDRESS') {
                            setAccountData({
                                ...accountData,
                                addressNo: accountData?.addressNo
                            })
                            // handleSameAsCustomerServiceAddressDetailsChange(true)
                            handleMoveNext()
                        } else if (key === 'POPUP_SUBMIT') {
                            handleSameAsCustomerAddressDetailsChange(true, { addressNo: accountData?.addressNo })
                            handleSameAsCustomerServiceAddressDetailsChange(true)
                            setCustomerPageIndex(7)
                            window.scrollTo(0, 0);
                        } else if (!key) {
                            handleMoveNext()
                        }
                    } else {
                        toast.error("Failed to create - " + resp.status);
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally();
    }

    const handleServiceSubmit = () => {
        const list = []
        const serviceObject = {}
        selectedProductList.forEach((x) => {
            const details = []
            if (x.productCategory === 'PC_BUNDLE') {
                for (const pb of x?.productBundleDtl) {
                    details.push({
                        action: 'ADD',
                        serviceName: pb?.productDtl.productName,
                        serviceCategory: pb?.productDtl.productSubType,
                        serviceType: pb?.productDtl.serviceType,
                        planPayload: {
                            productId: pb?.productDtl.productId,
                            productUuid: pb?.productDtl.productUuid,
                            bundleId: x.bundleId,
                            contract: x.selectedContract?.[0] || 0,
                            actualContract: x.oldSelectedContract ? x.oldSelectedContract?.[0] : x.selectedContract?.[0] || 0,
                            serviceLimit: pb?.productDtl.productBenefit && pb?.productDtl.productBenefit.length > 0 ?
                                pb?.productDtl.productBenefit?.find(f => x.selectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f.selectedValue === 'PB_DATA')?.description
                                : null,
                            actualServiceLimit: pb?.productDtl.oldProductBenefit && pb?.productDtl.oldProductBenefit.length > 0 ?
                                pb?.productDtl.oldProductBenefit?.find(f => x.oldSelectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f.selectedValue === 'PB_DATA')?.description
                                : pb?.productDtl.productBenefit && pb?.productDtl.productBenefit.length > 0 ?
                                    pb?.productDtl.productBenefit?.find(f => x.selectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f.selectedValue === 'PB_DATA')?.description
                                    : null,
                            productBenefit: pb?.productDtl.productBenefit || null,
                            actualProductBenefit: pb?.productDtl.oldProductBenefit ? pb?.productDtl.oldProductBenefit : pb?.productDtl.productBenefit || null,
                            upfrontCharge: x?.upfrontCharge,
                            advanceCharge: x?.advanceCharge,
                        },
                        serviceAgreement: serviceAgreement ? serviceAgreement : undefined,
                        serviceClass: pb?.productDtl.productClass,
                        quantity: String(x?.quantity),
                        customerUuid: customerData?.customerUuid,
                        currency: accountData?.currency,
                        billLanguage: accountData?.billLanguage
                    })
                }
            } else {
                details.push({
                    action: "ADD",
                    serviceName: x?.productName,
                    serviceCategory: x?.productSubType,
                    serviceType: x?.serviceType,
                    planPayload: {
                        productId: x?.productId,
                        productUuid: x?.productUuid,
                        contract: x.selectedContract?.[0] || 0,
                        actualContract: x.oldSelectedContract ? x.oldSelectedContract?.[0] : x.selectedContract?.[0] || 0,
                        promoContract: x.promoContract ? x.promoContract : 0,
                        promoCode: x.promoCode || [],
                        serviceLimit: x.productBenefit && x.productBenefit.length > 0 ? x.productBenefit?.find(f => x.selectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f.selectedValue === 'PB_DATA')?.description : null,
                        actualServiceLimit: x.oldProductBenefit && x.oldProductBenefit.length > 0 ? x.oldProductBenefit?.find(f => x.oldSelectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f.selectedValue === 'PB_DATA')?.description : null,
                        promoServiceLimit: x.promoBenefit && x.promoBenefit.length > 0 ? x.promoBenefit?.find(f => f.selectedValue === 'PB_DATA')?.description : null,
                        productBenefit: x.productBenefit || null,
                        promoBenefit: x.promoBenefit || null,
                        actualProductBenefit: x.oldProductBenefit ? x.oldProductBenefit : x.productBenefit || null,
                        upfrontCharge: x?.upfrontCharge,
                        advanceCharge: x?.advanceCharge,
                    },
                    serviceClass: x?.produtClass,
                    quantity: String(x?.quantity),
                    customerUuid: customerData?.customerUuid,
                    currency: accountData?.currency,
                    billLanguage: accountData?.billLanguage
                })
            }
            list.push({ details: details })
        })
        const requestBody = {
            service: list
        }

        post(properties.ACCOUNT_DETAILS_API + '/service/create', requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        toast.success("Information Saved Successfully");
                        setIsServiceDetailsPopupOpen(false)
                        handleSameAsCustomerServiceAddressDetailsChange(true)
                        handleMoveNext()
                        // setIsAccountCreateOpen(true)
                        resp?.data?.map((x) => {
                            const productData = selectedProductList?.find((y) => y.productUuid === x.service.productUuid)
                            x.quantity = String(productData?.quantity)
                            return x
                        })
                        setServiceData({
                            ...serviceData,
                            serviceUuid: resp?.data
                        })
                        const postpaidAccountData = selectedProductList?.find((y) => y.productType === 'PT_POSTPAID')
                        if (postpaidAccountData) {
                            const accountInfo = resp?.data?.find((x) => x.service.productUuid === postpaidAccountData.productUuid)
                            const accountCategoryInfo = serviceTypeLookup?.find((x) => x.code == 'PT_POSTPAID')
                            setAccountData({
                                ...accountData,
                                accountId: accountInfo?.account?.accountId,
                                accountNo: accountInfo?.account?.accountNo,
                                accountUuid: accountInfo?.account?.accountUuid,
                                contactNo: accountInfo?.account?.contactNo,
                                addressNo: accountInfo?.account?.addressNo,
                                productType: postpaidAccountData?.productType,
                                accountCategory: accountCategoryInfo?.mapping?.accountCategory,
                                accountType: selectedCustomerType === 'REG' ? 'AT_RES' : 'AT_BUSS'
                            })
                        }

                    } else {
                        toast.error("Failed to create - " + resp.status);
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally();
    }


    const handleUpdateServiceSubmit = (key = undefined, agreement) => {
        const list = []
        const oldProductIds = [...new Set(serviceData.serviceUuid.map((x) => x.service.productUuid))]

        // console.log('serviceData========>', serviceData)
        // console.log('oldProductIds ', oldProductIds)
        oldProductIds.forEach((x) => {
            const productData = selectedProductList?.find((y) => {
                if (y.productCategory === "PC_BUNDLE") {
                    const productUuids = []
                    y.productBundleDtl.filter(f => productUuids.push(f.productDtl.productUuid));
                    return productUuids.includes(x);
                } else {
                    return y?.productUuid === x;
                }
            })
            // console.log('productData====', productData)
            //check here whether the bundleid product is available. 
            if (!productData) {
                const serviceObject = {}
                const product = productList?.find((y) => y?.productUuid === x)
                // console.log('serviceData========>', product)
                const oldProductData = serviceData.serviceUuid?.find((y) => y?.service?.productUuid === x)
                // console.log('oldProductData=========>', oldProductData)
                serviceObject.details = [{
                    action: 'REMOVE',
                    serviceName: product?.productName,
                    serviceCategory: product?.productSubType,
                    serviceType: product?.serviceType,
                    planPayload: {
                        productId: product?.productId,
                        productUuid: product?.productUuid
                    },
                    serviceClass: product?.productClass,
                    quantity: oldProductData?.quantity,
                    customerUuid: customerData?.customerUuid,
                    currency: accountData?.currency,
                    billLanguage: accountData?.billLanguage,
                    serviceUuid: oldProductData?.service?.serviceUuid,
                    accountUuid: oldProductData?.account?.accountUuid || oldProductData?.service?.accountUuid
                }]
                if (oldProductData?.service?.addressNo) {
                    serviceObject.address = {
                        isPrimary: false,
                        address1: serviceAddress?.address1,
                        address2: serviceAddress?.address1,
                        address3: serviceAddress?.address1,
                        city: serviceAddress?.city,
                        district: serviceAddress?.district,
                        state: serviceAddress?.state,
                        postcode: serviceAddress?.postcode,
                        latitude: serviceAddress?.latitude,
                        longitude: serviceAddress?.longitude,
                        country: serviceAddress?.country,
                        addressNo: oldProductData?.service?.addressNo
                    }
                }
                list.push(serviceObject)
            }
        })
        // console.log('selectedProductList ', selectedProductList)
        selectedProductList.forEach((x) => {

            const productData = serviceData?.serviceUuid?.find((y) => {
                if (x.productCategory !== "PC_BUNDLE") {
                    if (y?.service?.productUuid && y?.service?.productUuid === x.productUuid) {
                        return y;
                    }
                }
            })

            const bundleData = serviceData?.serviceUuid.map((y) => {
                // console.log('serviceData for update ', serviceData)
                // console.log('x======================== ', x)
                // console.log('x======================== ', y?.service?.productUuid)
                if (x.productCategory === "PC_BUNDLE") {
                    const productUuids = []
                    x.productBundleDtl.filter(f => productUuids.push(f.productDtl.productUuid));
                    // console.log('productUuidsproductUuids', productUuids)
                    if (productUuids.includes(y?.service?.productUuid)) {
                        return y;
                    }
                }
            })
            // console.log('bundleData', bundleData)
            const hasRealValues = bundleData && bundleData.length > 0 && bundleData.some(item => item !== null && item !== undefined && item !== '');

            // console.log('hasRealValues=====',hasRealValues)
            const serviceObject = {}
            const details = []
            if (x.productCategory === 'PC_BUNDLE') {
                for (const pb of x?.productBundleDtl) {
                    details.push({
                        action: hasRealValues ? 'UPDATE' : 'ADD',
                        serviceName: pb?.productDtl.productName,
                        serviceCategory: pb?.productDtl.productSubType,
                        serviceType: pb?.productDtl.serviceType,
                        planPayload: {
                            productId: pb?.productDtl.productId,
                            productUuid: pb?.productDtl.productUuid,
                            bundleId: x.bundleId,
                            contract: x.selectedContract?.[0] || 0,
                            actualContract: x.oldSelectedContract ? x.oldSelectedContract?.[0] : x.selectedContract?.[0] || 0,
                            serviceLimit: pb?.productDtl.productBenefit && pb?.productDtl.productBenefit.length > 0 ?
                                pb?.productDtl.productBenefit?.find(f => x.selectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f.selectedValue === 'PB_DATA')?.description
                                : null,
                            actualServiceLimit: pb?.productDtl.oldProductBenefit && pb?.productDtl.oldProductBenefit.length > 0 ?
                                pb?.productDtl.oldProductBenefit?.find(f => x.oldSelectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f.selectedValue === 'PB_DATA')?.description
                                : pb?.productDtl.productBenefit && pb?.productDtl.productBenefit.length > 0 ?
                                    pb?.productDtl.productBenefit?.find(f => x.selectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f.selectedValue === 'PB_DATA')?.description
                                    : null,
                            productBenefit: pb?.productDtl.productBenefit || null,
                            actualProductBenefit: pb?.productDtl.oldProductBenefit ? pb?.productDtl.oldProductBenefit : pb?.productDtl.productBenefit || null,
                            upfrontCharge: x?.upfrontCharge,
                            advanceCharge: x?.advanceCharge,
                        },
                        serviceAgreement: serviceAgreement ? serviceAgreement : agreement,
                        serviceClass: pb?.productDtl.productClass,
                        quantity: String(x?.quantity),
                        customerUuid: customerData?.customerUuid,
                        currency: accountData?.currency,
                        billLanguage: accountData?.billLanguage,
                        accountUuid: bundleData ? bundleData?.find(f => f?.service?.productUuid === pb.productDtl.productUuid)?.account?.accountUuid || bundleData?.find(f => f?.service?.productUuid === pb.productDtl.productUuid)?.service?.accountUuid : null,
                        serviceUuid: bundleData ? bundleData?.find(f => f?.service?.productUuid === pb.productDtl.productUuid)?.service?.serviceUuid || bundleData?.find(f => f?.service?.productUuid === pb.productDtl.productUuid)?.serviceUuid : null
                    })
                }
                serviceObject.details = details
            } else {
                serviceObject.details = [{
                    action: productData ? 'UPDATE' : 'ADD',
                    serviceName: x?.productName,
                    serviceCategory: x?.productSubType,
                    serviceType: x?.serviceType,
                    planPayload: {
                        productId: x?.productId,
                        productUuid: x?.productUuid,
                        contract: x.selectedContract?.[0] || 0,
                        actualContract: x.oldSelectedContract ? x.oldSelectedContract?.[0] : x.selectedContract?.[0] || 0,
                        promoContract: x.promoContract ? x.promoContract : 0,
                        promoCode: x.promoCode || [],
                        serviceLimit: x.productBenefit && x.productBenefit.length > 0 ? x.productBenefit?.find(f => x.selectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f.selectedValue === 'PB_DATA')?.description : null,
                        actualServiceLimit: x.oldProductBenefit && x.oldProductBenefit.length > 0 ? x.oldProductBenefit?.find(f => x.oldSelectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f.selectedValue === 'PB_DATA')?.description : null,
                        promoServiceLimit: x.promoBenefit && x.promoBenefit.length > 0 ? x.promoBenefit?.find(f => f.selectedValue === 'PB_DATA')?.description : null,
                        productBenefit: x.productBenefit || null,
                        promoBenefit: x.promoBenefit || null,
                        actualProductBenefit: x.oldProductBenefit ? x.oldProductBenefit : x.productBenefit || null,
                        upfrontCharge: x?.upfrontCharge,
                        advanceCharge: x?.advanceCharge,
                    },
                    serviceAgreement: serviceAgreement ? serviceAgreement : agreement,
                    serviceClass: x?.productClass,
                    quantity: String(x?.quantity),
                    customerUuid: customerData?.customerUuid,
                    currency: accountData?.currency,
                    billLanguage: accountData?.billLanguage,
                    accountUuid: productData ? productData?.account?.accountUuid || productData?.service?.accountUuid : null,
                    serviceUuid: productData ? productData?.service?.serviceUuid || serviceData.serviceUuid : null
                }]
            }

            // if (productData) {
            //     serviceObject.details.accountUuid = productData?.account?.accountUuid || productData?.service?.accountUuid
            //     // serviceObject.details.accountId = productData?.account?.accountId
            //     serviceObject.details.serviceUuid = productData?.service?.serviceUuid || serviceData.serviceUuid
            // }

            if (key === 'ADDRESS' || key === 'FINAL_SUBMIT_AGREEMENT') {
                serviceObject.address = {
                    isPrimary: false,
                    address1: serviceAddress?.address1,
                    address2: serviceAddress?.address1,
                    address3: serviceAddress?.address1,
                    city: serviceAddress?.city,
                    district: serviceAddress?.district,
                    state: serviceAddress?.state,
                    postcode: serviceAddress?.postcode,
                    latitude: serviceAddress?.latitude,
                    longitude: serviceAddress?.longitude,
                    country: serviceAddress?.country
                }
                if (productData?.service?.addressNo) {
                    serviceObject.address.addressNo = productData?.service?.addressNo
                }
            }
            if (key === 'FINAL_SUBMIT_AGREEMENT') {
                serviceObject.details.map(s => {
                    return {
                        serviceAgreement: serviceAgreement ? serviceAgreement : agreement
                    }
                });
            }
            if (key === 'FINAL_SUBMIT_NO_AGREEMENT') {
                serviceObject.address = {
                    isPrimary: false,
                    address1: customerAddress?.address1,
                    address2: customerAddress?.address1,
                    address3: customerAddress?.address1,
                    city: customerAddress?.city,
                    district: customerAddress?.district,
                    state: customerAddress?.state,
                    postcode: customerAddress?.postcode,
                    latitude: customerAddress?.latitude,
                    longitude: customerAddress?.longitude,
                    country: customerAddress?.country
                }
                if (productData?.service?.addressNo) {
                    serviceObject.address.addressNo = productData?.service?.addressNo
                }
            }
            list.push(serviceObject)
        })

        const requestBody = {
            service: list
        }

        put(properties.ACCOUNT_DETAILS_API + '/service/update', requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        toast.success("Information Saved Successfully");
                        if (key === 'ADDRESS') {
                            resp?.data?.map((x) => {
                                const productData = selectedProductList?.find((y) => y.productUuid === x.service.productUuid)
                                x.quantity = String(productData?.quantity)
                                return x
                            })
                            // console.log('resp?.dataresp?.dataresp?.data inside the if address ', resp?.data)
                            setServiceData({
                                ...serviceData,
                                serviceUuid: resp?.data
                            })
                            setIsAccountCreateOpen(true)
                        } else if (key === 'FINAL_SUBMIT_AGREEMENT' || key === 'FINAL_SUBMIT_NO_AGREEMENT') {
                            // handleCustomerSubmitPopup()
                            setDisplayPreview(true)
                        } else {
                            handleSameAsCustomerServiceAddressDetailsChange(true)
                            handleMoveNext()
                            resp?.data?.map((x) => {
                                const productData = selectedProductList?.find((y) => y.productUuid === x.service.productUuid)
                                x.quantity = String(productData?.quantity)
                                return x
                            })
                            // console.log('resp?.dataresp?.dataresp?.data inside the else ', resp?.data)
                            setServiceData({
                                ...serviceData,
                                serviceUuid: resp?.data
                            })
                            const postpaidAccountData = selectedProductList?.find((y) => y.productType == 'PT_POSTPAID')
                            if (postpaidAccountData) {
                                const accountInfo = resp?.data?.find((x) => x.service.productUuid === postpaidAccountData.productUuid)
                                const accountCategoryInfo = serviceTypeLookup?.find((x) => x.code == 'PT_POSTPAID')
                                setAccountData({
                                    ...accountData,
                                    accountId: accountInfo?.account?.accountId,
                                    accountNo: accountInfo?.account?.accountNo,
                                    accountUuid: accountInfo?.account?.accountUuid,
                                    contactNo: accountInfo?.account?.contactNo,
                                    addressNo: accountInfo?.account?.addressNo,
                                    productType: postpaidAccountData?.productType,
                                    accountCategory: accountCategoryInfo?.mapping?.accountCategory,
                                    accountType: selectedCustomerType === 'REG' ? 'AT_RES' : 'AT_BUSS'
                                })
                            } else {
                                setAccountData({
                                    ...accountData,
                                    accountId: null,
                                    accountNo: null,
                                    accountUuid: null,
                                    contactNo: null,
                                    addressNo: null,
                                    productType: null
                                })
                            }
                        }
                        setIsServiceDetailsPopupOpen(false)
                    } else {
                        toast.error("Failed to create - " + resp.status);
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally();
    }

    const handleServicePopupSubmit = () => {
        // console.log('---------------------------------------------------', serviceData)
        if (Array.isArray(serviceData?.serviceUuid) && !isEmpty(serviceData?.serviceUuid)) {
            // console.log('inside if')
            handleUpdateServiceSubmit()
        } else {
            if (!Array.isArray(serviceData?.serviceUuid) && serviceData?.serviceUuid) {
                // console.log('inside else if')

                handleUpdateServiceSubmit()
            } else {
                handleServiceSubmit()
            }
        }
    }

    const handleOpenServiceFinalPopup = () => {
        const list = productList.filter((x) => x.isSelected === 'Y');
        const finalList = []
        for (const prod of list) {
            finalList.push({
                ...prod,
                quantity: prod?.quantity,
                totalNrc: Number(prod?.totalNrc) * Number(prod?.quantity),
                totalRc: Number(prod?.totalRc) * Number(prod?.quantity)
            })
        }
        setSelectedProductList(finalList)

        let totalRc = 0
        let totalNrc = 0
        let quantity = 0
        let total = 0
        finalList.forEach((x) => {
            let Rc = 0
            let Nrc = 0

            Rc = Rc + Number(x?.totalRc)
            Nrc = Nrc + Number(x?.totalNrc)
            quantity = Number(x?.quantity)
            totalRc += Rc
            totalNrc += Nrc
            total = (totalRc + totalNrc)
        })
        setServiceData({
            ...serviceData,
            totalRc,
            totalNrc,
            total: total
        })
        setIsServiceDetailsPopupOpen(true)
    }

    const [customerContactAddressError, setCustomerContactAddressError] = useState(false);
    const handleMoveNextValidation = () => {
        setCustomerContactAddressError(false);

        if (customerPageIndex === 0) {
            // setIsCustomerTypePopupOpen(true)
            handleMoveNext()

        }
        if (customerPageIndex === 1) {
            const customerError = validate('CUSTOMER', customerDataValidationSchema, customerData);
            if (customerError) {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
            // console.log('dob' , moment(new Date(customerData.dob)).format('YYYY-MM-DD') )
            if ((selectedCustomerType === 'REG' && moment(new Date(customerData.dob)).format('YYYY-MM-DD') > moment(new Date()).subtract(18, "years").format('YYYY-MM-DD'))) {
                toast.error("Invalid Date of birth");
                return false;
            }
            if ((selectedCustomerType !== 'REG' && moment(new Date(customerData.registrationDate)).format('YYYY-MM-DD') > moment(new Date()).format('YYYY-MM-DD'))) {
                toast.error("Registration date cannot be future");
                return false;
            }
            if (customerData?.customerUuid) {
                handleUpdateCustomerDetailsSubmit('CUSTOMER')
            } else {
                handleCustomerDetailsSubmit()
            }
        } else if (customerPageIndex === 2) {
            const customerAddressError = validate('CUSTOMER_CONTACT', customerAddressValidationSchema, customerAddress);
            if (customerAddressError || selectedContactPreferences.length === 0) {
                setCustomerContactAddressError(true);
                setIsActiveTab('FORM')
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
            if (Number(customerAddress.contactNbr.length) !== Number(phoneNumberLength)) {
                setCustomerContactAddressError(true);
                toast.error("Validation errors found. Please check contact number length");
                return false;
            }
            if (customerData?.customerUuid) {
                handleUpdateCustomerDetailsSubmit('CONTACT')
            }
        } else if (customerPageIndex === 3) {
            if (productList.filter((x) => x.isSelected === 'Y').length === 0) {
                toast.error("Please Add Products");
                return false;
            }
            handleOpenServiceFinalPopup()
        } else if (customerPageIndex === 5) {
            if (accountData?.isAccountCreate === 'N') {
                if (accountData?.accountUuid) {
                    setCustomerPageIndex(8)
                    window.scrollTo(0, 0);
                } else {
                    handleAccountDetailsSubmit('FINAL_SUBMIT')
                }
            } else {
                const accountError = validate('ACCOUNT', accountDataValidationSchema, accountData);
                if (accountError) {
                    toast.error("Validation errors found. Please check highlighted fields");
                    return false;
                }
                if (accountData?.accountUuid) {
                    handleUpdateAccountDetailsSubmit()
                } else {
                    handleAccountDetailsSubmit()
                }
            }
        } else if (customerPageIndex === 6) {
            const accountOtherDetailsError = validate('ACCOUNT', accountOtherDataValidationSchema, accountData);
            if (accountOtherDetailsError) {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
            handleUpdateAccountDetailsSubmit('OTHER')
        } else if (customerPageIndex === 7) {
            const accountAddressError = validate('ACCOUNT', accountAddressValidationSchema, accountAddress);
            if (accountAddressError) {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
            handleUpdateAccountDetailsSubmit('ADDRESS')
        } else if (customerPageIndex === 4) {
            if (serviceData?.isNeedQuoteOnly === 'N') {
                const serviceAddressError = validate('SERVICE', accountAddressValidationSchema, serviceAddress);
                if (serviceAddressError) {
                    toast.error("Validation errors found. Please check highlighted fields");
                    return false;
                }
                if (accountData?.accountUuid) {
                    handleUpdateServiceSubmit('ADDRESS')
                } else {
                    setAccountData({
                        ...accountData,
                        isAccountCreate: "N"
                    })
                    setCustomerPageIndex(8)
                    window.scrollTo(0, 0);
                    // handleUpdateServiceSubmit('FINAL_SUBMIT_NO_AGREEMENT')
                }
            } else {
                handleUpdateServiceSubmit('FINAL_SUBMIT_NO_AGREEMENT')
            }
        } else {
            handleMoveNext()
        }
    }

    const handleMoveBack = () => {
        if (customerPageIndex === 8) {
            // console.log(accountData?.isAccountCreate , customerPageIndex - 1)
            setCustomerPageIndex(accountData?.isAccountCreate === 'N' ? 4 : customerPageIndex - 1)
            window.scrollTo(0, 0);
        } else {
            let count = customerPageIndex
            setCustomerPageIndex(count - 1)
            window.scrollTo(0, 0);
        }
    }

    const handleMoveNext = () => {
        let count = customerPageIndex
        setCustomerPageIndex(count + 1)
        window.scrollTo(0, 0);
        setCreationPercentage(count + 1)
    }

    const handleManualProductChange = (product, e) => {
        const { checked, value, name } = e.target;
        console.log('checked-------->', checked)
        let quantity = 0
        const updatedProductList = productList.map((p) => {
            if (p.productCategory !== 'PC_BUNDLE') {
                if (p.productId === product.productId) {
                    let updatedProduct = { ...p, isSelected: 'Y' };

                    if (name === 'upfrontPayment') {
                        updatedProduct.upfrontPayment = checked;
                        if (checked) {
                            updatedProduct.upfrontCharge = 'Y'
                        } else {
                            updatedProduct.upfrontCharge = 'N'
                        }
                    }
                    if (name === 'advancePayment') {
                        updatedProduct.advancePayment = checked;
                        if (checked) {
                            updatedProduct.advanceCharge = 'Y'
                        } else {
                            updatedProduct.advanceCharge = 'N'
                        }
                    }
                    if (name === 'quantity') {
                        quantity = parseInt(value) || 0;
                        updatedProduct.quantity = quantity >= 0 ? quantity : 0;
                    }
                    if (name === 'contract') {
                        if (checked) {
                            updatedProduct.selectedContract = p.selectedContract ? [...p.selectedContract, parseInt(value) || 0] : [parseInt(value) || 0];
                            updatedProduct.quantity = 1;
                        } else {
                            updatedProduct.selectedContract = p.selectedContract ? p.selectedContract.filter((c) => c !== (parseInt(value) || 0)) : [];
                            updatedProduct.quantity = updatedProduct.selectedContract.length === 0 ? 0 : 1
                        }
                    }

                    return updatedProduct;
                }
            } else {
                if (Number(p.bundleId) === Number(product.bundleId)) {
                    let updatedProduct = { ...p, isSelected: 'Y' };

                    if (name === 'upfrontPayment') {
                        updatedProduct.upfrontPayment = checked;
                        if (checked) {
                            updatedProduct.upfrontCharge = 'Y'
                        } else {
                            updatedProduct.upfrontCharge = 'N'
                        }
                    }
                    if (name === 'advancePayment') {
                        updatedProduct.advancePayment = checked;
                        if (checked) {
                            updatedProduct.advanceCharge = 'Y'
                        } else {
                            updatedProduct.advanceCharge = 'N'
                        }
                    }
                    if (name === 'quantity') {
                        quantity = parseInt(value) || 0;
                        updatedProduct.quantity = quantity >= 0 ? quantity : 0;
                    }
                    if (name === 'billType') {
                        // console.log('valuevaluevaluevaluevalue', value)
                        updatedProduct.isSplitOrder = value === 'splitBill' ? true : false;
                    }
                    if (name === 'contract') {
                        if (checked) {
                            updatedProduct.selectedContract = p.selectedContract ? [...p.selectedContract, parseInt(value) || 0] : [parseInt(value) || 0];
                            updatedProduct.quantity = 1;
                        } else {
                            updatedProduct.selectedContract = p.selectedContract ? p.selectedContract.filter((c) => c !== (parseInt(value) || 0)) : [];
                            updatedProduct.quantity = updatedProduct.selectedContract.length === 0 ? 0 : 1
                        }
                    }

                    return updatedProduct;
                }
            }

            return p;
        });

        // console.log('updatedProductList================>>>>>>>>>>>>>>', updatedProductList)
        setProductList(updatedProductList);
    }

    const handleAddProduct = (value, product) => {
        if (value) {
            setProductList(
                productList.map((c, i) => {
                    if (Number(c?.productId) === Number(product?.productId)) {
                        c = { ...c, quantity: 1, isSelected: 'Y' }
                    }
                    return c
                })
            )
        } else {
            setProductList(
                productList.map((c, i) => {
                    if (Number(c?.productId) === Number(product?.productId)) {
                        c = { ...c, quantity: 0, isSelected: 'N' }
                    }
                    return c
                })
            )
        }
    }

    const handleIncreaseProduct = (product) => {
        const productData = product.productCategory === 'PC_BUNDLE' ? productList?.find((x) => Number(x.bundleId) === Number(product.bundleId)) : productList?.find((x) => Number(x.productId) === Number(product.productId))
        const productQuantity = Number(productData?.quantity) < Number(productData?.volumeAllowed) ? Number(productData?.quantity) + 1 : Number(productData?.quantity);
      //  setOpenProductMetaAttributeForm({ show: true, product: productData })
        setProductList(
            productList.map((c, i) => {
                const condition = product.productCategory === 'PC_BUNDLE' ? (Number(c?.bundleId) === Number(product?.bundleId)) : (Number(c?.productId) === Number(product?.productId))
                if (condition && c.contractFlag == 'N') {
                    c = { ...c, quantity: productQuantity, isSelected: 'Y' }
                }

                if (condition && c.contractFlag == 'Y') {
                    if (!c.selectedContract || c.selectedContract.length === 0) {
                        toast.error('Please choose the contract you would like to purchase')
                    } else {
                        c = { ...c, quantity: productQuantity, isSelected: 'Y' }
                    }

                }
                return c
            })
        )
    }

    const hideProductMetaAttributeForm = () => {
        setOpenProductMetaAttributeForm({ show: false, product: {} });
    }

    const handleDecreaseProduct = (product) => {
        const productData = product.productCategory === 'PC_BUNDLE' ? productList?.find((x) => Number(x.bundleId) === Number(product.bundleId) && x?.isSelected === 'Y') : productList?.find((x) => Number(x.productId) === Number(product.productId) && x?.isSelected === 'Y')
        if (productData) {
            setProductList(
                productList.map((c, i) => {
                    const condition = product.productCategory === 'PC_BUNDLE' ? (Number(c?.bundleId) === Number(product?.bundleId)) : (Number(c?.productId) === Number(product?.productId))
                    if (condition && c.contractFlag == 'N') {
                        c = { ...c, quantity: Number(productData?.quantity) - 1, isSelected: Number(productData?.quantity) - 1 === 0 ? 'N' : 'Y' }
                    }
                    if (condition && c.contractFlag == 'Y') {
                        c = { ...c, quantity: Number(productData?.quantity) - 1, isSelected: Number(productData?.quantity) - 1 === 0 ? 'N' : 'Y' }
                        c.selectedContract = Number(productData?.quantity) - 1 === 0 ? [] : c.selectedContract
                    }
                    return c
                })
            )
            const productAppointData = selectedAppointmentList?.find((x) => x.productNo === product?.productNo)
            if ((Number(productData?.quantity) - 1 === 0) && product?.isAppointRequired === 'Y' && productAppointData) {
                handleConfirmAppointment(productAppointData)
            }
        }
    }

    const handleConfirmAppointment = (data) => {
        const reqBody = {
            appointDtlId: data?.appointDtlId,
            appointAgentId: data?.appointUserId,
            customerId: data?.customerId,
            productNo: data?.productNo,
            operation: 'DELETE'
        }
        post(properties.MASTER_API + '/temp-appointment/create', { ...reqBody }).then((resp) => {
            // console.log(resp.data)
            if (resp.status === 200) {
                setSelectedAppointmentList(selectedAppointmentList.filter((x) => x.productNo !== data?.productNo))
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleDeleteProduct = (product) => {
        setProductList(
            productList.map((c, i) => {
                if (Number(c?.productId) === Number(product?.productId)) {
                    c = { ...c, quantity: 0, isSelected: 'N' }
                }
                return c
            })
        )
        let totalRc = 0
        let totalNrc = 0
        selectedProductList.filter((x) => Number(x?.productId) !== Number(product?.productId)).forEach((y) => {
            totalRc = totalRc + Number(y?.totalRc || 0)
            totalNrc = totalNrc + Number(y?.totalNrc || 0)
        })
        setSelectedProductList(selectedProductList.filter((x) => Number(x?.productId) !== Number(product?.productId)))
        setServiceData({
            ...serviceData,
            totalRc,
            totalNrc,
            total: Number(totalRc) + Number(totalNrc)
        })
        const productAppointData = selectedAppointmentList?.find((x) => x.productNo === product?.productNo)
        if (product?.isAppointRequired === 'Y' && productAppointData) {
            handleConfirmAppointment(productAppointData)
        }
    }

    const handleCreateOrder = () => {
        const list = []
        selectedProductList.forEach((x) => {
            // console.log('x is=========================>', x)           

            if (x.productCategory === 'PC_BUNDLE') {
                for (const prod of x.productBundleDtl) {
                    let prodRrcAmount = 0, prodNrcAmount = 0

                    prodRrcAmount = prod.charges.reduce((total, charge) => charge.chargeType === 'CC_RC' ? (total + Number(charge.chargeAmount)) : total, 0);
                    prodNrcAmount = prod.charges.reduce((total, charge) => charge.chargeType === 'CC_NRC' ? (total + Number(charge.chargeAmount)) : total, 0);
                    const oldProductData = serviceData.serviceUuid?.find((y) => y?.service?.productUuid === prod.productDtl?.productUuid)
                    let ordeReqObj = {
                        orderFamily: "OF_PHYCL",
                        orderMode: "ONLINE",
                        billAmount: x?.isSplitOrder ? (Number(prodRrcAmount) + Number(prodNrcAmount)) : (Number(x?.totalRc) + Number(x?.totalNrc)),
                        orderDescription: prod.productDtl?.serviceTypeDescription?.description || "Bundle Order Signup",
                        serviceType: prod.productDtl?.serviceType,
                        accountUuid: oldProductData?.account?.accountUuid || oldProductData?.service?.accountUuid,
                        serviceUuid: oldProductData?.service?.serviceUuid,
                        //orderDeliveryMode: "SPT_HOME",
                        rcAmount: x?.isSplitOrder ? prodRrcAmount : x?.totalRc,
                        nrcAmount: x?.isSplitOrder ? prodNrcAmount : x?.totalNrc,
                        upfrontCharge: x?.upfrontCharge,
                        advanceCharge: x?.advanceCharge,
                        isSplitOrder: x?.isSplitOrder,
                        isBundle: true,
                        contactPreference: customerAddress?.contactPreferences || [
                            "CHNL004"
                        ]
                    }
                    // console.log('oldProductData for bundle===================>', oldProductData)                   

                    if (x?.selectedContract && Array.isArray(x?.selectedContract) && !isEmpty(x?.selectedContract)) {
                        for (const contract of x?.selectedContract) {
                            ordeReqObj.product = [{
                                productId: Number(prod.productDtl?.productId),
                                productQuantity: Number(x.quantity),
                                productAddedDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                                billAmount: Number(prodRrcAmount) + Number(prodNrcAmount),
                                edof: moment().format('YYYY-MM-DD'),
                                productSerialNo: prod.productDtl?.productNo,
                                contract: Number(contract),
                                bundleId: Number(x?.bundleId),
                                rcAmount: prodRrcAmount,
                                nrcAmount: prodNrcAmount
                            }]
                            // console.log('ordeReqObjordeReqObjordeReqObjordeReqObj', ordeReqObj)
                            list.push(ordeReqObj)
                        }
                    } else {
                        ordeReqObj.product = [{
                            productId: Number(prod.productDtl?.productId),
                            productQuantity: Number(x.quantity),
                            productAddedDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                            billAmount: Number(prodRrcAmount) + Number(prodNrcAmount),
                            edof: moment().format('YYYY-MM-DD'),
                            productSerialNo: prod.productDtl?.productNo,
                            contract: 0,
                            bundleId: Number(x?.bundleId),
                            rcAmount: prodRrcAmount,
                            nrcAmount: prodNrcAmount
                        }]
                        list.push(ordeReqObj)
                    }

                }
            } else {
                let oldProductData = serviceData.serviceUuid?.find((y) => y?.service?.productUuid === x?.productUuid)
                let ordeReqObj = {
                    orderFamily: "OF_PHYCL",
                    orderMode: "ONLINE",
                    billAmount: Number(x?.totalRc) + Number(x?.totalNrc),
                    orderDescription: x?.serviceTypeDescription?.description || "New Sign up Order",
                    serviceType: x?.serviceType,
                    accountUuid: oldProductData?.account?.accountUuid || oldProductData?.service?.accountUuid,
                    serviceUuid: oldProductData?.service?.serviceUuid,
                    //orderDeliveryMode: "SPT_HOME",
                    rcAmount: x?.totalRc,
                    nrcAmount: x?.totalNrc,
                    isBundle: false,
                    isSplitOrder: true,
                    upfrontCharge: x?.upfrontCharge,
                    advanceCharge: x?.advanceCharge,
                    contactPreference: customerAddress?.contactPreferences || [
                        "CHNL004"
                    ],
                    product: [{
                        productId: Number(x?.productId),
                        productQuantity: Number(x.quantity),
                        productAddedDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                        billAmount: Number(x?.totalRc) + Number(x?.totalNrc),
                        edof: moment().format('YYYY-MM-DD'),
                        productSerialNo: x?.productNo,
                        bundleId: null,
                        rcAmount: x?.totalRc,
                        nrcAmount: x?.totalNrc
                    }]
                }
                if (x?.selectedContract && Array.isArray(x?.selectedContract)) {
                    for (const contract of x?.selectedContract) {
                        ordeReqObj.product[0].contract = Number(contract)

                        list.push(ordeReqObj)
                    }
                } else {
                    list.push(ordeReqObj)
                }
            }
        })
        const requestBody = {
            // customerId: Number(customerData?.customerId),
            customerUuid: customerData?.customerUuid,
            // accountId: Number(accountData?.accountId),
            // accountUuid: accountData?.accountUuid,
            // serviceId: Number(serviceData?.serviceId),
            // serviceUuid: serviceData?.serviceUuid,
            // orderCategory: selectedProductList[0]?.productCategory,
            orderCategory: "OC_N",
            orderSource: "CC",
            orderType: "OT_SU",
            orderChannel: "WALKIN",
            orderCause: "CHNL024",
            orderPriority: "PRTYHGH",
            billAmount: Number(serviceData?.totalRc) + Number(serviceData?.totalNrc),
            orderDescription: "New Sign up Order",
            appointmentList: selectedAppointmentList,
            order: list,
        }
        console.log('serviceAgreement------->', serviceAgreement)
        post(properties.ORDER_API + '/create', requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        toast.success(resp.message);
                        // props.history.push(`${process.env.REACT_APP_BASE}/`);
                        handleNeedQuote();
                    } else {
                        toast.error("Failed to create - " + resp.status);
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally();
    }

    const handleNeedQuote = () => {
        const requestBody = {
            customerUuid: customerData?.customerUuid,
            accountUuid: accountData?.accountUuid,
            service: (serviceData?.serviceUuid && serviceData?.serviceUuid.map((x) => x.service.serviceUuid)) || [],
            getQuote: serviceData?.isNeedQuoteOnly === 'Y' ? true : false
        }

        post(properties.CUSTOMER_API + '/update-status', requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        toast.success(resp.message)
                        props.history.push(`${process.env.REACT_APP_BASE}/`);
                    } else {
                        toast.error("Failed to create - " + resp.status);
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally();
    }

    useEffect(() => {
        // Filter the productList based on productSubCategory whenever it changes
        // console.log('productList before filter ', productList)
        // console.log('productCategory ', productCategory)
        // console.log('productSubCategory ', productSubCategory)
        // console.log('productType ', productType)
        // console.log('serviceType ', serviceType)

        const filteredList = originalProductList.filter((f) => {
            if (productCategory.length > 0 && productSubCategory.length === 0 && productType.length === 0 && serviceType.length === 0) {
                if (productCategory.includes(f.productCategory)) {
                    return true
                } else {
                    return false
                }
            } else if (productCategory.length > 0 && productSubCategory.length > 0 && productType.length === 0 && serviceType.length === 0) {
                if (productCategory.includes(f.productCategory) && productSubCategory.includes(f.productSubCategory)) {
                    return true
                } else {
                    return false
                }
            } else if (productCategory.length > 0 && productSubCategory.length > 0 && productType.length > 0 && serviceType.length === 0) {
                if (productCategory.includes(f.productCategory) && productSubCategory.includes(f.productSubCategory) && productType.includes(f.productSubCategory)) {
                    return true
                } else {
                    return false
                }
            } else if (productCategory.length > 0 && productSubCategory.length > 0 && productType.length > 0 && serviceType.length > 0) {
                if (productCategory.includes(f.productCategory) && productSubCategory.includes(f.productSubCategory) && productType.includes(f.productType) && serviceType.includes(f.serviceType)) {
                    return true
                } else {
                    return false
                }
            } else if (productCategory.length > 0 && productSubCategory.length === 0 && productType.length > 0 && serviceType.length > 0) {
                if (productCategory.includes(f.productCategory) && productType.includes(f.productType) && serviceType.includes(f.serviceType)) {
                    return true
                } else {
                    return false
                }
            } else if (productCategory.length > 0 && productSubCategory.length === 0 && productType.length === 0 && serviceType.length > 0) {
                if (productCategory.includes(f.productCategory) && serviceType.includes(f.serviceType)) {
                    return true
                } else {
                    return false
                }
            } else if (productCategory.length > 0 && productSubCategory.length === 0 && productType.length > 0 && serviceType.length === 0) {
                if (productCategory.includes(f.productCategory) && productType.includes(f.productType)) {
                    return true
                } else {
                    return false
                }
            } else if (productCategory.length > 0 && productSubCategory.length === 0 && productType.length > 0 && serviceType.length === 0) {
                if (productCategory.includes(f.productCategory) && productType.includes(f.productType)) {
                    return true
                } else {
                    return false
                }
            } else if (productSubCategory.length > 0 && productCategory.length === 0 && productType.length === 0 && serviceType.length === 0) {
                if (productSubCategory.includes(f.productSubCategory)) {
                    return true
                } else {
                    return false
                }
            } else if (productSubCategory.length > 0 && productCategory.length === 0 && productType.length > 0 && serviceType.length === 0) {
                if (productSubCategory.includes(f.productSubCategory) && productType.includes(f.productType)) {
                    return true
                } else {
                    return false
                }
            } else if (productSubCategory.length > 0 && productCategory.length === 0 && productType.length === 0 && serviceType.length > 0) {
                if (productSubCategory.includes(f.productSubCategory) && serviceType.includes(f.serviceType)) {
                    return true
                } else {
                    return false
                }
            } else if (productType.length > 0 && productCategory.length === 0 && productSubCategory.length === 0 && serviceType.length > 0) {
                if (productType.includes(f.productType) && serviceType.includes(f.serviceType)) {
                    return true
                } else {
                    return false
                }
            } else if (productType.length > 0 && productCategory.length === 0 && productSubCategory.length === 0 && serviceType.length === 0) {
                if (productType.includes(f.productType)) {
                    return true
                } else {
                    return false
                }
            } else if (serviceType.length > 0 && productSubCategory.length === 0 && productCategory.length === 0 && productType.length === 0) {
                if (serviceType.includes(f.serviceType)) {
                    return true
                } else {
                    return false
                }
            }
        });
        // console.log('filteredList ', filteredList)
        if (filteredList.length === 0) {
            if (productCategory.length === 0 && productSubCategory.length === 0 && productType.length === 0 && serviceType.length === 0) {
                if (existingApplicationProdList.length > 0) {
                    const prodList = originalProductList.map((product) => {
                        const existingProduct = existingApplicationProdList?.find(
                            (existingProduct) => existingProduct.productId === product.productId
                        );
                        if (existingProduct) {
                            return {
                                ...product,
                                quantity: existingProduct.quantity,
                                isSelected: 'Y',
                                selectedContract: product.selectedContract ? [...product.selectedContract, existingProduct.selectedContract] : [existingProduct.selectedContract]
                            };
                        }
                        return product
                    });
                    setProductList(prodList)
                } else {
                    setProductList(originalProductList)
                }
            } else {
                // if (existingApplicationProdList.length > 0) {
                //     const prodList = productList.map((product) => {
                //         console.log('product to filter existing prod ', product)
                //         const existingProduct = existingApplicationProdList?.find(
                //             (existingProduct) => existingProduct.productId === product && product.productId
                //         );

                //         if (existingProduct) {
                //             return {
                //                 ...product,
                //                 quantity: existingProduct.quantity,
                //                 isSelected: 'Y',
                //             };
                //         }
                //         return product

                //     });
                // }
                setProductList(existingApplicationProdList)

            }

        } else {
            if (existingApplicationProdList.length > 0) {
                const prodList = filteredList.map((product) => {
                    const existingProduct = existingApplicationProdList?.find(
                        (existingProduct) => existingProduct.productId === product.productId
                    );

                    if (existingProduct) {
                        return {
                            ...product,
                            quantity: existingProduct.quantity,
                            isSelected: 'Y',
                            selectedContract: product.selectedContract ? [...product.selectedContract, existingProduct.selectedContract] : [existingProduct.selectedContract]
                        };
                    }

                    return product;
                });
                // console.log('prodList ', prodList)
                setProductList(prodList)
            } else {
                setProductList(filteredList);
            }
        }
    }, [productCategory, productSubCategory, productType, serviceType]);
    // console.log('productList to be shared======================================', productList)
    const [customizedLable, setCustomizedLable] = useState('');
    useEffect(() => {
        if (appsConfig?.clientFacingName) {
            for (const key in appsConfig.clientFacingName) {
                if (key === 'Customer'.toLowerCase()) {
                    setCustomizedLable(appsConfig?.clientFacingName[key]);
                    break;
                } else {
                    setCustomizedLable('Customer')
                }
            }
        }
    }, [appsConfig])

    return (
        <>
            <div className="cnt-wrapper mt-2">
                <div className="card-skeleton">
                    {/* <div className="top-breadcrumb cmmn-skeleton">
                        <div className="lft-skel">
                            <ul>
                                <li>Create Customer</li>
                            </ul>
                        </div>
                        <div className="rht-skel">

                        </div>
                    </div> */}
                    {/* <div className="col-lg-3 col-md-12 col-xs-12"> */}
                    <div className="cmmn-skeleton skel-progress-bar-hr">
                        <div className="progress-bar-container">
                            <ul id="progressbar" className="skel-vl-progressbar" role="tablist">
                                <li className={customerPageIndex > 0 ? "active" : ""} id="uploadDoc">
                                    <strong>Upload Your Document</strong>
                                </li>
                                {console.log('here---------->', appsConfig?.clientFacingName)}
                                <li className={customerPageIndex > 1 ? "active" : ""} id="customerDet">
                                    <strong>{customizedLable} Details</strong>
                                </li>
                                <li className={customerPageIndex > 2 ? "active" : ""} id="customerAdd">
                                    <strong>{customizedLable} Address</strong>
                                </li>
                                <li className={customerPageIndex > 3 ? "active" : ""} id="servCreate">
                                    <strong>Service Creation</strong>
                                </li>
                                <li className={customerPageIndex > 4 ? "active" : ""} id="servAdd">
                                    <strong>Service Address</strong>
                                </li>
                                {accountData?.isAccountCreate === 'Y' && (
                                    <>
                                        <li className={customerPageIndex > 5 ? "active" : ""} id="accDet">
                                            <strong>Account Details</strong>
                                        </li>
                                        <li className={customerPageIndex > 6 ? "active" : ""} id="accOth">
                                            <strong>Account Other Details</strong>
                                        </li>
                                        <li className={customerPageIndex > 7 ? "active" : ""} id="accAdd">
                                            <strong>Account(Billing) Address</strong>
                                        </li>
                                    </>
                                )}
                                <li className={customerPageIndex > 8 ? "active" : ""} id="summary">
                                    <strong>Product Summary</strong>
                                </li>
                                <li className={customerPageIndex > 9 ? "active" : ""} id="customerAgree">
                                    <strong>{customizedLable} Agreement</strong>
                                </li>

                            </ul><div style={{ width: 50, height: 50, }} className='skel-circular-per'>
                                <CircularProgressbar
                                    value={creationPercentage ? (creationPercentage).toFixed(1) : 0}
                                    text={`${creationPercentage ? (creationPercentage).toFixed(1) : 0}%`}
                                    styles={buildStyles({
                                        strokeLinecap: 'butt',
                                        textSize: '20px',
                                        pathTransitionDuration: 0.5,
                                        pathColor: `green`,
                                        textColor: 'grey',
                                        trailColor: 'light-grey',
                                        backgroundColor: 'white',
                                    })}
                                />
                            </div>
                        </div>
                        {/* <p className="text-center">You are still in the process of completing the creation.</p>
                        <div className="skel-progress">
                        <div className="percen-comp">
                            <div className="chart">
                            
                            </div>
                        </div>
                        </div> */}
                    </div>
                    {/* </div> */}

                    <div className="cutomer-skel mt-1">
                        <div id="msform">
                            <div className="form-row">
                                {
                                    customerPageIndex === 3 &&
                                    <div className="cmmn-skeleton skel-lft-fltr-catg col-lg-3 col-md-12 col-xs-12">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="font-bold">Filter By Category</label>
                                                <div className="checkbox-container">
                                                    {productCategoryLookup &&
                                                        productCategoryLookup.map((x) => (
                                                            <div className="checkbox-item" key={x.code}>
                                                                <input
                                                                    type="checkbox"
                                                                    name="pcat"
                                                                    id={x.code}
                                                                    checked={productCategory.includes(x.code) ? true : false}
                                                                    onChange={() => {
                                                                        if (productCategory.includes(x.code)) {

                                                                            setProductCategory(productCategory.filter((c) => c !== x.code));
                                                                        } else {
                                                                            setProductCategory([...productCategory, x.code]);
                                                                        }
                                                                    }}
                                                                />
                                                                <label htmlFor={x.code}>{x.description}</label>
                                                            </div>
                                                        ))}
                                                    <button className='skel-btn-cancel mt-2 mb-2' onClick={() => {
                                                        setProductCategory([])
                                                    }}>Clear Filter</button>
                                                </div>
                                                <hr className="cmmn-hline" />
                                                <label className="font-bold">Filter By Sub Category</label>
                                                <div className="checkbox-container">
                                                    {productSubCategoryLookup &&
                                                        productSubCategoryLookup.map((x) => (
                                                            <div className="checkbox-item" key={x.code}>
                                                                <input
                                                                    type="checkbox"
                                                                    name="psubcat"
                                                                    id={x.code}
                                                                    checked={productSubCategory.includes(x.code) ? true : false}
                                                                    onChange={() => {
                                                                        if (productSubCategory.includes(x.code)) {
                                                                            setProductSubCategory(productSubCategory.filter((c) => c !== x.code));
                                                                        } else {
                                                                            setProductSubCategory([...productSubCategory, x.code]);
                                                                        }
                                                                    }}
                                                                />
                                                                <label htmlFor={x.code}>{x.description}</label>
                                                            </div>
                                                        ))}
                                                    <button className='skel-btn-cancel mt-2 mb-2' onClick={() => {
                                                        setProductSubCategory([])
                                                    }}>Clear Filter</button>
                                                </div>
                                                <hr className="cmmn-hline" />
                                                <label className="font-bold">Filter By Type</label>
                                                <div className="checkbox-container">
                                                    {productTypeLookup &&
                                                        productTypeLookup.map((x) => (
                                                            <div className="checkbox-item" key={x.code}>
                                                                <input
                                                                    type="checkbox"
                                                                    name="ptype"
                                                                    id={x.code}
                                                                    checked={productType.includes(x.code) ? true : false}
                                                                    onChange={() => {
                                                                        if (productType.includes(x.code)) {
                                                                            setProductType(productType.filter((c) => c !== x.code));
                                                                        } else {
                                                                            setProductType([...productType, x.code]);
                                                                        }
                                                                    }}
                                                                />
                                                                <label htmlFor={x.code}>{x.description}</label>
                                                            </div>
                                                        ))}
                                                    <button className='skel-btn-cancel mt-2 mb-2' onClick={() => {
                                                        setProductType([])
                                                    }}>Clear Filter</button>
                                                </div>
                                                <hr className="cmmn-hline" />
                                                <label className='font-bold'>Filter By Service</label>
                                                <div className="checkbox-container">
                                                    {serviceTypeLookup &&
                                                        serviceTypeLookup.map((x) => (
                                                            <div className="checkbox-item" key={x.code}>
                                                                <input
                                                                    type="checkbox"
                                                                    name="stype"
                                                                    id={x.code}
                                                                    checked={serviceType.includes(x.code) ? true : false}
                                                                    onChange={() => {
                                                                        if (serviceType.includes(x.code)) {
                                                                            setServiceType(serviceType.filter((c) => c !== x.code));
                                                                        } else {
                                                                            setServiceType([...serviceType, x.code]);
                                                                        }
                                                                    }}
                                                                />
                                                                <label htmlFor={x.code}>{x.description}</label>
                                                            </div>
                                                        ))}
                                                    <button className='skel-btn-cancel mt-2 mb-2' onClick={() => {
                                                        setServiceType([])
                                                    }}>Clear Filter</button>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                }
                                <div className={customerPageIndex === 3 ? 'col-lg-9' : '' + 'col-md-12 col-xs-12 skel-resp-mt'}>
                                    <fieldset>
                                        {
                                            customerPageIndex === 0 &&
                                            <CustomerIVR
                                                data={{
                                                    customerData,
                                                    customerAddress,
                                                    idTypeLookup,
                                                    countries
                                                }}
                                                handler={{
                                                    setCustomerData,
                                                    setIdScanSuccess,
                                                    setCustomerAddress,
                                                    fetchCountryList
                                                }}
                                            />
                                        }
                                        {
                                            customerPageIndex === 1 &&
                                            <CustomerDetailsForm
                                                data={{
                                                    genderLookup,
                                                    idTypeLookup,
                                                    customerTypeLookup,
                                                    customerData,
                                                    selectedCustomerType,
                                                    error: customerDetailsError,
                                                    appsConfig
                                                }}
                                                handler={{
                                                    handleInputChange,
                                                    setCustomerData,
                                                    setSelectedCustomerType
                                                }}
                                            />
                                        }
                                        {
                                            customerPageIndex === 2 &&
                                            <CustomerContactForm
                                                data={{
                                                    isActiveTab,
                                                    isSameasCustomerAddress,
                                                    customerData,
                                                    customerAddress,
                                                    error: customerContactDetailsError,
                                                    addressLookUpRef,
                                                    countries,
                                                    phoneNoPrefix,
                                                    addressString,
                                                    customerContactAddressError,
                                                    contactPreferenceLookup,
                                                    selectedContactPreferences,
                                                    phoneNumberLength,
                                                }}
                                                handler={{
                                                    setIsActiveTab,
                                                    setError: setCustomerContactDetailsError,
                                                    setCustomerAddress,
                                                    setAddressLookUpRef,
                                                    setAddressString,
                                                    fetchCountryList,
                                                    setSelectedContactPreferences,
                                                    setPhoneNumberLength
                                                }}
                                            />
                                        }
                                        {
                                            customerPageIndex === 3 &&
                                            <CustomerServiceForm
                                                data={{
                                                    serviceTypeLookup,
                                                    productTypeLookup,
                                                    productCategoryLookup,
                                                    productSubCategoryLookup,
                                                    serviceType,
                                                    productType,
                                                    productCategory,
                                                    productSubCategory,
                                                    serviceData,
                                                    productList,
                                                    selectedProductList,
                                                    customerAddress,
                                                    countries,
                                                    selectedCustomerType,
                                                    selectedAppointmentList,
                                                    customerData,
                                                    customerTypeLookup,
                                                    existingApplicationProdList,
                                                    productBenefitLookup,
                                                    appsConfig
                                                }}
                                                handler={{
                                                    setServiceType,
                                                    setProductType,
                                                    setProductCategory,
                                                    setProductSubCategory,
                                                    setProductList,
                                                    setServiceData,
                                                    fetchProductList,
                                                    setSelectedProductList,
                                                    handleAddProduct,
                                                    handleDeleteProduct,
                                                    handleIncreaseProduct,
                                                    handleManualProductChange,
                                                    handleDecreaseProduct,
                                                    handleRemoveServiceType,
                                                    setSelectedAppointmentList
                                                }}
                                            />
                                        }
                                        {
                                            customerPageIndex === 4 &&
                                            <CustomerServiceAddressForm
                                                data={{
                                                    serviceData,
                                                    serviceAddress,
                                                    error: serviceDetailsError,
                                                    addressLookUpRef,
                                                    countries,
                                                    appsConfig
                                                }}
                                                handler={{
                                                    setServiceData,
                                                    setError: setServiceDetailsError,
                                                    setServiceAddress,
                                                    setAddressLookUpRef,
                                                    handleSameAsCustomerServiceAddressDetailsChange
                                                }}
                                            />
                                        }
                                        {
                                            customerPageIndex === 5 &&
                                            <CustomerAccountForm
                                                data={{
                                                    genderLookup,
                                                    idTypeLookup,
                                                    accountData,
                                                    error: accountDetailsError,
                                                    accountAddress,
                                                    selectedCustomerType,
                                                    countries,
                                                    phoneNoPrefix
                                                }}
                                                handler={{
                                                    setAccountData,
                                                    handleAccountInputChange,
                                                    handleSameAsCustomerDetailsChange,
                                                    setAccountAddress
                                                }}
                                            />
                                        }
                                        {
                                            customerPageIndex === 6 &&
                                            <AccountOtherDetailsForm
                                                data={{
                                                    accountData,
                                                    error: accountDetailsError,
                                                    priorityLookup,
                                                    accountClassLookup,
                                                    accountLevelLookup,
                                                    accountTypeLookup,
                                                    accountCategoryLookup,
                                                    accountStatusReasonLookup,
                                                    billLanguageLookup,
                                                    notificationLookup,
                                                    currencyLookup
                                                }}
                                                handler={{
                                                    setAccountData,
                                                    handleAccountInputChange,
                                                    setError: setAccountDetailsError
                                                }}
                                            />
                                        }
                                        {
                                            customerPageIndex === 7 &&
                                            <CustomerAccountAddressForm
                                                data={{
                                                    addressLookUpRef,
                                                    countries,
                                                    accountData,
                                                    error: accountDetailsError,
                                                    accountAddress,
                                                }}
                                                handler={{
                                                    setError: setAccountDetailsError,
                                                    setAccountAddress,
                                                    setAddressLookUpRef,
                                                    handleSameAsCustomerAddressDetailsChange
                                                }}
                                            />
                                        }
                                        {
                                            customerPageIndex === 8 &&
                                            <CustomerProductFinalPreview
                                                data={{
                                                    serviceData,
                                                    selectedProductList,
                                                    productBenefitLookup
                                                }}
                                            />
                                        }
                                        {
                                            customerPageIndex === 9 &&
                                            <CustomerContractAgreement
                                                data={{
                                                    sigPad,
                                                    serviceData,
                                                    selectedProductList,
                                                    productBenefitLookup,
                                                    appsConfig
                                                }}
                                                handler={{
                                                    setServiceData
                                                }}
                                            />
                                        }
                                        {
                                            isServicePopupOpen &&
                                            <ServiceCategoryPopup
                                                data={{
                                                    isOpen: isServicePopupOpen,
                                                    serviceTypeLookup,
                                                    serviceData
                                                }}
                                                handler={{
                                                    setIsOpen: setIsServicePopupOpen,
                                                    fetchProductList
                                                }}
                                            />
                                        }
                                        {
                                            isServiceDetailsPopupOpen &&
                                            <ServiceDetailsPopup
                                                data={{
                                                    isOpen: isServiceDetailsPopupOpen,
                                                    selectedProductList,
                                                    serviceData,
                                                    productBenefitLookup

                                                }}
                                                handler={{
                                                    setIsOpen: setIsServiceDetailsPopupOpen,
                                                    handleDeleteProduct,
                                                    handleServicePopupSubmit,
                                                    setServiceData,
                                                    setSelectedProductList
                                                }}
                                            />
                                        }
                                        {
                                            isCustomerTypePopupOpen &&
                                            <CustomerTypePopup
                                                data={{
                                                    isOpen: isCustomerTypePopupOpen,
                                                    customerTypeLookup,
                                                    selectedCustomerType
                                                }}
                                                handler={{
                                                    setIsOpen: setIsCustomerTypePopupOpen,
                                                    setSelectedCustomerType,
                                                    handleMoveNext
                                                }}
                                            />
                                        }
                                        {
                                            (isAccountCreateOpen || isAccountSameAsCustomerOpen || isAccountAddressSameAsCustomerOpen) &&
                                            <AccountConfirmationPopup
                                                data={{
                                                    isOpen: isAccountCreateOpen,
                                                    isOpen1: isAccountSameAsCustomerOpen,
                                                    isOpen2: isAccountAddressSameAsCustomerOpen,
                                                }}
                                                handler={{
                                                    setIsOpen: setIsAccountCreateOpen,
                                                    setIsOpen1: setIsAccountSameAsCustomerOpen,
                                                    setIsOpen2: setIsAccountAddressSameAsCustomerOpen,
                                                    handleYesCreateAccount,
                                                    handleNoCreateAccount,
                                                    handleYesUseCustomerAsAccount,
                                                    handleNoUseCustomerAsAccount,
                                                    handleYesUseCustomerAddressAsAccountAddress,
                                                    handleNoUseCustomerAddressAsAccountAddress
                                                }}
                                            />
                                        }
                                        {/* <button onClick={() => setDisplayPreview(true)} className="btn waves-effect waves-light btn-primary next action-button" >Open</button> */}
                                        <div id="newcustomerpreview">
                                            {
                                                (displayPreview) &&
                                                <NewCustomerPreviewModal isOpen={displayPreview}>
                                                    <CustomerPreviewPrint
                                                        data={{
                                                            customerData,
                                                            customerAddress,
                                                            accountData,
                                                            accountAddress,
                                                            selectedCustomerType,
                                                            serviceData,
                                                            selectedProductList,
                                                            serviceTypeLookup,
                                                            serviceAddress,
                                                            countries,
                                                            idTypeLookup,
                                                            customerTypeLookup,
                                                            accountLevelLookup,
                                                            accountTypeLookup,
                                                            genderLookup,
                                                            accountCategoryLookup,
                                                            billLanguageLookup,
                                                            notificationLookup,
                                                            currencyLookup,
                                                            sigPad,
                                                            appsConfig
                                                        }}
                                                        handler={{
                                                            handlePreviewCancel: () => setDisplayPreview(false),
                                                            handleSubmit: handleCustomerFinalSubmit,
                                                            handlePrint: handlePrint

                                                        }}
                                                        ref={componentRef}
                                                    />
                                                </NewCustomerPreviewModal>
                                            }
                                        </div>

                                        {
                                            customerPageIndex === 9 &&
                                            <button onClick={handleSubmit} className="skel-btn-submit next action-button" >Proceed to Preview</button>
                                        }
                                        {
                                            customerPageIndex === 0 &&
                                            <button onClick={handleMoveNextValidation} className="skel-btn-submit next action-button" >{idScanSuccess ? 'Next' : 'Skip and Proceed'}</button>
                                        }
                                        {
                                            customerPageIndex !== 9 && customerPageIndex !== 0 &&
                                            <button onClick={handleMoveNextValidation} className="skel-btn-submit next action-button" >Save and Continue</button>
                                        }
                                        {
                                            customerPageIndex !== 0 &&
                                            <button onClick={handleMoveBack} className="skel-btn-cancel previous action-button-previous">Previous</button>
                                        }
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={openProductMetaAttributeForm?.show} onHide={hideProductMetaAttributeForm} dialogClassName="wsc-cust-mdl-temp-prev">
                <Modal.Header>
                    <Modal.Title><h5 className="modal-title">Meta Information</h5></Modal.Title>
                    <CloseButton onClick={hideProductMetaAttributeForm} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                        <span>×</span>
                    </CloseButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-lg-12 col-md-12 col-xs-12">
                        <div className='form-row'>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="question" className="control-label">Question</label>
                                    <input id="question" className="form-control" value={''} onChange={(e) => console.log(e.target.value)} type='text' />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ display: 'block' }}>
                    <div className="skel-btn-center-cmmn">
                        <button type="button" className="skel-btn-cancel" onClick={hideProductMetaAttributeForm}>Cancel</button>
                        <button type="button" className="skel-btn-submit" onClick={() => console.log()}>Save</button>
                    </div>
                </Modal.Footer>
            </Modal> */}
        </>
    )

}
export default NewCustomer;
