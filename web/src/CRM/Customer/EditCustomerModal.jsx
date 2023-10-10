import { useState, useEffect, useRef } from 'react';
import { NumberFormatBase } from 'react-number-format';
import Modal from 'react-modal'
import { string, object, array } from "yup";
import { toast } from 'react-toastify';
import Select from 'react-select'
import { get, post, put } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { formatDateForBirthDate } from '../../common/util/dateUtil';
import { validateEmail } from '../../common/util/util';
import AddressDetailsEditable from '../Address/AddressDetailsFormMin';
import Swal from 'sweetalert2';
import { useHistory } from "react-router-dom";

const EditCustomerModal = (props) => {
    const history = useHistory();
    const { customerDetails, isEditCustomerDetailsOpen } = props?.data
    const { setIsEditCustomerDetailsOpen, setCustomerDetails, pageRefresh } = props?.handlers
    const [customerData, setCustomerData] = useState({})
    const [customerAddress, setCustomerAddress] = useState({})
    const [custIDTypes, setCustIDTypes] = useState([]);
    const [contactTypes, setContactTypes] = useState([]);
    const [customerError, setCustomerError] = useState({})
    const [contactPreferenceLookup, setContactPreferenceLookup] = useState([])
    const customerContact = props?.data?.customerDetails?.customerContact
    // console.log({customerData});

    // useEffect(() => {
    //     get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=CONTACT_PREFERENCE')
    //         .then((response) => {
    //             if (response.data) {
    //                 setContactPreferenceLookup(response.data.CONTACT_PREFERENCE.map((x) => { return { label: x.description, value: x.code } }))
    //             }
    //         })
    //         .catch(error => {
    //             console.error(error);
    //         }).finally()
    // }, [])

    const customStyle = {
        content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '73%',
            maxHeight: '100%'
        }
    }

    const personalCustomerValidationSchema = object().shape({
        emailId: string().required("Email is required").email("Email is not in correct format"),
        idType: string().required("ID Type is required"),
        idValue: string().required("ID Number is required"),
        mobileNo: string().required("Contact Number is required"),
        address1: string().required("Address Line 1 is required"),
        address2: string().required("Address Line 2 is required"),
        district: string().required("District is required"),
        city: string().required("City is required"),
        contactPreferences: array().required("Contact preferences required"),
        postcode: string().required("Postcode is required"),
        country: string().required("Country is required"),
        state: string().required("State is required")
    });

    const [districtLookup, setDistrictLookup] = useState([{}])
    const [stateLookup, setStateLookup] = useState([{}])
    const [postCodeLookup, setPostCodeLookup] = useState([{}])
    const [cityLookup, setCityLookup] = useState([{}])
    const [countries, setCountries] = useState()
    const [addressLookUpRef, setAddressLookUpRef] = useState(null)
    const addressLookup = useRef({})
    const [contactTypeLookup, setContactTypeLookup] = useState([])
    const [maritalStatusLookup, setMaritalStatusLookup] = useState([])
    const [customerClassLookup, setCustomerClassLookup] = useState([])
    const [genderLookup, setGenderLookup] = useState([])
    const existingEmail = useRef()
    const existingMobileNo = useRef()

    useEffect(() => {
        existingEmail.current = customerContact && customerContact[0]?.emailId
        existingMobileNo.current = customerContact && customerContact[0]?.mobileNo
        setCustomerData({
            ...props?.data?.customerDetails,
            gender: props?.data?.customerDetails?.gender?.code || props?.data?.customerDetails?.gender,
            idType: props?.data?.customerDetails?.idType?.code || props?.data?.customerDetails?.idType,
            emailId: customerContact && customerContact[0]?.emailId || "",
            mobileNo: customerContact && customerContact[0]?.mobileNo || "",
            customerPhoto: props?.data?.customerDetails?.customerPhoto || "",
            whatsappNo: customerContact && customerContact[0]?.whatsappNo || "",
            telephoneNo: customerContact && customerContact[0]?.telephoneNo || "",
            fax: customerContact && customerContact[0]?.fax || "",
            facebookId: customerContact && customerContact[0]?.facebookId || "",
            instagramId: customerContact && customerContact[0]?.instagramId || "",
            telegramId: customerContact && customerContact[0]?.telegramId || "",
        })
        setCustomerAddress({
            ...customerAddress,
            ...customerDetails?.customerAddress[0],
            countryCode: customerDetails?.customerContact[0]?.mobilePrefix
        })
    }, [props.data])

    useEffect(() => {
        // COUNTRY,DISTRICT,
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=COUNTRY,CUSTOMER_ID_TYPE,CONTACT_TYPE,GENDER,CONTACT_PREFERENCE,CUSTOMER_CLASS,MARITAL_STATUS')
            .then((response) => {
                if (response.data) {
                    // 
                    // get(properties.ADDRESS_LOOKUP_API + '?postCode=' + customerDetails?.customerAddress[0]?.postCode || "")
                    //     .then((resp) => {
                    //         if (resp && resp.data) {
                    //             addressLookup.current = resp.data
                    //             setAddressLookUpRef(resp.data)
                    //         }
                    //     })
                    //     .finally()
                    setContactPreferenceLookup(response.data.CONTACT_PREFERENCE.map((x) => { return { label: x.description, value: x.code } }))
                    setCountries(response.data.COUNTRY)
                    setCustIDTypes(response.data.CUSTOMER_ID_TYPE)
                    setDistrictLookup(response.data.DISTRICT)
                    setContactTypeLookup(response.data.CONTACT_TYPE)
                    setGenderLookup(response.data.GENDER)
                    setCustomerClassLookup(response.data.CUSTOMER_CLASS)
                    setMaritalStatusLookup(response.data.MARITAL_STATUS)
                }
            })
            .catch(error => {
                console.error(error);
            }).finally()
    }, [])

    const validate = (section, schema, data, holdPrevErrors = false) => {
        try {
            if (section === 'CUSTOMER') {
                holdPrevErrors === false && setCustomerError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'CUSTOMER') {
                    setCustomerError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    const handleDeactivateCustomer = () => {
        customerAddress.country = countries.find(x => x.description == customerAddress.country)?.code;

        const validateData = {
            emailId: customerData?.emailId ? customerData?.emailId : customerData?.customerContact[0]?.emailId,
            mobileNo: customerData?.mobileNo ? customerData?.mobileNo : customerData?.customerContact[0]?.mobileNo,
            contactPreferences: customerData?.contactPreferences,
            idType: customerData?.idType,
            idValue: customerData?.idValue,
            address1: customerAddress.address1,
            address2: customerAddress.address2,
            district: customerAddress.district,
            country: customerAddress.country,
            postcode: customerAddress.postcode,
            state: customerAddress.state,
            city: customerAddress.city,
        }
        const personalError = validate('CUSTOMER', personalCustomerValidationSchema, validateData);
        console.log(personalError)
        if (personalError) {
            toast.error("Mandatory fields need your input kindly check the highlighted fields");
            return false;
        }


        const requestBody = {
            details: {
                customerNo: customerData?.customerNo,
                firstName: customerData?.firstName,
                lastName: customerData?.lastName,
                gender: customerData?.gender,
                birthDate: customerData?.dob,
                idType: customerData?.idType,
                idValue: customerData?.idValue,
                customerMaritalStatus: customerData?.customerMaritalStatus,
                registeredNo: customerData?.registeredNbr || null,
                registeredDate: customerData?.registeredDate || null
            },
            address: {
                addressNo: customerAddress?.addressNo,
                isPrimary: customerAddress?.isPrimary,
                address1: customerAddress?.address1,
                address2: customerAddress?.address2,
                address3: customerAddress?.address3,
                city: customerAddress?.city,
                state: customerAddress?.state,
                district: customerAddress?.district,
                country: customerAddress?.country,
                postcode: customerAddress?.postcode,
            },
            contact: {
                isPrimary: true,
                firstName: customerData?.firstName,
                lastName: customerData?.lastName,
                emailId: customerData?.emailId,
                mobilePrefix: customerAddress?.countryCode,
                mobileNo: customerData?.mobileNo,
                contactNo: customerData?.customerContact[0]?.contactNo
            }
        }
        if (customerData?.customerPhoto) {
            requestBody.details.customerPhoto = customerData?.customerPhoto
        }
        console.log('===>', existingEmail.current, '===>', requestBody?.contact?.emailId, '===>', existingMobileNo.current, requestBody?.contact?.mobileNo)


        put(properties.CUSTOMER_API + "/deactivate/" + customerData?.customerUuid, requestBody)
            .then((response) => {
                if (response.status === 200) {
                    toast.success("Customer De-Activated Successfully")
                    setIsEditCustomerDetailsOpen(false)
                    //  pageRefresh()
                    history.push(`${process.env.REACT_APP_BASE}/customer-search`)
                    // window.location.reload(false);
                }
            })
            .catch((error) => {
                console.log(error)
            })
            .finally()

    }

    const handleSubmit = () => {
        customerAddress.country = countries.find(x => x.description === customerAddress.country)?.code;

        const validateData = {
            emailId: customerData?.emailId ? customerData?.emailId : customerData?.customerContact[0]?.emailId,
            mobileNo: customerData?.mobileNo ? customerData?.mobileNo : customerData?.customerContact[0]?.mobileNo,
            idType: customerData?.idType,
            idValue: customerData?.idValue,
            address1: customerAddress.address1,
            address2: customerAddress.address2,
            contactPreferences: customerData?.contactPreferences,
            district: customerAddress.district,
            country: customerAddress.country,
            postcode: customerAddress.postcode,
            state: customerAddress.state,
            city: customerAddress.city,
        }
        const personalError = validate('CUSTOMER', personalCustomerValidationSchema, validateData);
        // console.log(personalError)
        if (personalError) {
            toast.error("Mandatory fields need your input kindly check the highlighted fields");
            return false;
        }

        // console.log('customerData for saving ', customerData)
        let requestBody = {
            details: {
                customerNo: customerData?.customerNo,
                firstName: customerData?.firstName,
                lastName: customerData?.lastName,
                gender: customerData?.gender,
                birthDate: customerData?.dob,
                idType: customerData?.idType,
                idValue: customerData?.idValue,
                occupation: customerData?.occupation,
                customerMaritalStatus: customerData?.customerMaritalStatus,
                customerClass: customerData?.customerClass,
                contactPreferences: customerData?.contactPreferences,
                registeredNo: customerData?.registeredNbr || null,
                registeredDate: customerData?.registeredDate || null
            },
            address: {
                addressNo: customerAddress?.addressNo,
                isPrimary: customerAddress?.isPrimary || true,
                address1: customerAddress?.address1,
                address2: customerAddress?.address2,
                address3: customerAddress?.address3,
                city: customerAddress?.city,
                state: customerAddress?.state,
                district: customerAddress?.district,
                country: customerAddress?.country,
                postcode: customerAddress?.postcode,
            },
            contact: {
                isPrimary: true,
                firstName: customerData?.firstName,
                lastName: customerData?.lastName,
                emailId: customerData?.emailId,
                mobilePrefix: customerAddress?.countryCode,
                mobileNo: customerData?.mobileNo,
                whatsappNo: customerData?.whatsappNo,
                telephoneNo: customerData?.telephoneNo,
                fax: customerData?.fax,
                facebookId: customerData?.facebookId,
                instagramId: customerData?.instagramId,
                telegramId: customerData?.telegramId,
                contactNo: customerData?.customerContact[0]?.contactNo
            }
        }
        if (customerData?.customerPhoto) {
            requestBody.details.customerPhoto = customerData?.customerPhoto
        }

        requestBody = removeEmptyKeyValues(requestBody)
        // console.log('===>', existingEmail.current, '===>', requestBody?.contact?.emailId, '===>', existingMobileNo.current, requestBody?.contact?.mobileNo)
        //return false
        if (existingEmail.current !== requestBody?.contact?.emailId || existingMobileNo.current !== requestBody?.contact?.mobileNo) {
            setIsEditCustomerDetailsOpen(false)
            Swal.fire({
                text: "Changing email or contact number may affect the login services of other source. Would you like to proceed !",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {

                    put(properties.CUSTOMER_API + "/" + customerData?.customerUuid, requestBody)
                        .then((response) => {
                            if (response.status === 200) {
                                toast.success("Customer Updated Successfully")
                                // let customerDetailsss = customerDetails;
                                // let customerAddressss = customerDetailsss.customerAddress;
                                // let addressIndex = customerAddressss.find(x => x.addressNo == requestBody.address.addressNo);
                                // customerAddressss[addressIndex] = requestBody.address;
                                // console.log(customerDetailsss, "customerDetailsss customerDetailsss customerDetailsss")
                                // setCustomerDetails({
                                //     ...customerDetailsss,
                                //     customerAddress: customerAddressss
                                // })
                                setIsEditCustomerDetailsOpen(false)
                                pageRefresh()
                                // window.location.reload(false);
                                // history.push(`${process.env.REACT_APP_BASE}/customer-search`)

                            }
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                        .finally()
                }
                else {
                    setIsEditCustomerDetailsOpen(true)
                }
            }).catch((error) => {
                console.log(error)
            })
        } else {
            // console.log('requestBody ', requestBody)
            put(properties.CUSTOMER_API + "/" + customerData?.customerUuid, requestBody)
                .then((response) => {
                    if (response.status === 200) {
                        toast.success("Customer Updated Successfully")
                        // let customerDetailsss = customerDetails;
                        // let customerAddressss = customerDetailsss.customerAddress;
                        // let addressIndex = customerAddressss.find(x => x.addressNo == requestBody.address.addressNo);
                        // customerAddressss[addressIndex] = requestBody.address;
                        // console.log(customerDetailsss, "customerDetailsss customerDetailsss customerDetailsss")
                        // setCustomerDetails({
                        //     ...customerDetailsss,
                        //     customerAddress: customerAddressss
                        // })
                        setIsEditCustomerDetailsOpen(false)
                        pageRefresh()
                        // window.location.reload(true);
                        // history.push(`${process.env.REACT_APP_BASE}/customer-search`)

                    }
                })
                .catch((error) => {
                    console.log(error)
                })
                .finally()
        }
    }

    const handleCancel = () => {
        setCustomerError({})
        setCustomerData({})
        setCustomerAddress({})
        setIsEditCustomerDetailsOpen(false)
    }

    const handleChangeStatus = async (e) => {
        let image = await convertBase64(e);
        setCustomerData({
            ...customerData,
            customerPhoto: image
        })
    }

    const convertBase64 = (e) => {
        console.log('e......>', e)
        if (!e || !e.target || !e.target.files || e.target.files.length === 0) {
            return Promise.reject(new Error('Invalid input'));
        }

        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(e.target.files[0]);

            fileReader.onload = () => {
                const result = fileReader.result;
                resolve(result);
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        })
            .catch((error) => {
                console.error('Error loading file:', error);
                return null;
            });
    };

    const handleOpenPopup = () => {
    }
    // console.log('customerData ', customerData)

    const removeEmptyKeyValues = (obj) => {
        if (typeof obj === "object") {
            if (Array.isArray(obj)) {
                // Process each item in the array
                obj = obj.map(removeEmptyKeyValues).filter(item => item !== null && item !== "");
            } else {
                // Process each key-value pair in the object
                if (obj && typeof obj === "object" ) {
                    Object?.keys(obj)?.forEach(key => {
                        obj[key] = removeEmptyKeyValues(obj[key]);
                        if (obj[key] === null || obj[key] === "") {
                         obj[key] = null
                        }
                    });
                }
            }
        }
        return obj;
    }

    return (
        <Modal isOpen={isEditCustomerDetailsOpen} contentLabel="" style={customStyle}>
            <div className="addresshadow">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title" id="myCenterModalLabel">Edit - {props?.data?.customerDetails?.firstName + " " + props?.data?.customerDetails?.lastName} - {customerData?.customerNo} </h4>
                            <button type="button" className="close" data-dismiss="modal" aria-hidden="true" onClick={() => { setIsEditCustomerDetailsOpen(false) }}>×</button>
                        </div>
                        <div className="modal-body">
                            <fieldset className="form-modal-group">
                                <div className="row">
                                    <div className="col-lg-3 col-md-12 col-xs-12">
                                        <>
                                            <div className="text-center mt-3">
                                                <img className="mb-2" id="img" src={customerData?.customerPhoto} width="150px" height="150px" style={{ objectFit: "cover" }} />
                                            </div>
                                            <input type="file"
                                                accept="image/*"
                                                name="image-upload"
                                                id="input"
                                                style={{ display: "none" }}
                                                onChange={handleChangeStatus}
                                            />
                                            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }} className="button_outer">
                                                <label style={{
                                                    margin: "auto",
                                                    padding: "5px",
                                                    color: "white",
                                                    textJustify: "auto",
                                                    textAlign: "center",
                                                    cursor: "pointer",

                                                }} htmlFor="input" className="btn_upload">

                                                    Upload Image
                                                </label>
                                            </div>
                                            <div className="text-center mt-2 d-none" >
                                                OR
                                            </div>
                                            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }} className="button_outer d-none">
                                                <label style={{
                                                    margin: "auto",
                                                    padding: "5px",
                                                    color: "white",
                                                    textJustify: "auto",
                                                    textAlign: "center",
                                                    cursor: "pointer",

                                                }} className="btn_upload" onClick={handleOpenPopup}>
                                                    Capture Image
                                                </label>
                                            </div>
                                        </>
                                    </div>
                                    <div className="col-lg-9 col-md-12 col-xs-12">
                                        <div className="row form-outline">
                                            <h5>Customer Details</h5>
                                            <div className="col-md-12">
                                                <div className="form-row">
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="customerNumber" className="col-form-label">Customer Number <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <input type="text" className="form-control" id="customerNumber" value={customerData?.customerNo} readOnly="true" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="firstName" className="col-form-label">First Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <input type="text" className="form-control" id="firstName" value={customerData?.firstName} onChange={(e) => {
                                                                setCustomerData({ ...customerData, firstName: e.target.value })
                                                                setCustomerError({ ...customerError, firstName: "" })
                                                            }} />
                                                            <span className="errormsg">{customerError.firstName ? customerError.firstName : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="lastName" className="col-form-label">Last Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <input type="text" className="form-control" id="lastName" value={customerData?.lastName} onChange={(e) => {
                                                                setCustomerData({ ...customerData, lastName: e.target.value })
                                                                setCustomerError({ ...customerError, lastName: "" })
                                                            }} />
                                                            <span className="errormsg">{customerError.lastName ? customerError.lastName : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="gender" className="col-form-label">Gender <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <select type="text" className="form-control" id="gender" value={customerData?.gender}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, gender: e.target.value })
                                                                    setCustomerError({ ...customerError, gender: "" })
                                                                }}>
                                                                <option key={1} value="">Select Gender</option>
                                                                {
                                                                    genderLookup && genderLookup.map((e) => (
                                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <span className="errormsg">{customerError.gender ? customerError.gender : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="dob" className="col-form-label">Date of Birth <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <input type="date" className="form-control" id="dob" value={customerData?.birthDate}
                                                                max={formatDateForBirthDate(new Date())}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, birthDate: e.target.value })
                                                                    setCustomerError({ ...customerError, birthDate: "" })
                                                                }}
                                                            />
                                                            <span className="errormsg">{customerError.birthDate ? customerError.birthDate : ""}</span>
                                                        </div>
                                                    </div>
                                                    {
                                                        customerDetails?.customerCategory !== 'REG' &&
                                                        <>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="registeredDate" className="col-form-label">Registered Date </label>
                                                                    <input type="date" className="form-control" id="registeredDate" value={customerData?.registeredDate}
                                                                        max={formatDateForBirthDate(new Date())}
                                                                        onChange={(e) => {
                                                                            setCustomerData({ ...customerData, registeredDate: e.target.value })
                                                                            setCustomerError({ ...customerError, registeredDate: "" })
                                                                        }}
                                                                    />
                                                                    <span className="errormsg">{customerError.registeredDate ? customerError.registeredDate : ""}</span>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="registeredNbr" className="col-form-label">Registered Number </label>
                                                                    <input type="text" className="form-control" id="registeredNbr" value={customerData?.registeredNo}
                                                                        onChange={(e) => {
                                                                            setCustomerData({ ...customerData, registeredNo: e.target.value })
                                                                            setCustomerError({ ...customerError, registeredNo: "" })
                                                                        }}
                                                                    />
                                                                    <span className="errormsg">{customerError.registeredNo ? customerError.registeredNo : ""}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    }
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="idType" className="col-form-label">ID Type <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <select id="idType" className="form-control" value={customerData?.idType}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, idType: e.target.value })
                                                                    setCustomerError({ ...customerError, idType: "" })
                                                                }}
                                                                disabled={true}
                                                            >
                                                                <option key={1} value="">Select ID Type</option>
                                                                {
                                                                    custIDTypes && custIDTypes.map((e) => (
                                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <span className="errormsg">{customerError.idType ? customerError.idType : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="idValue" className="col-form-label">ID Number <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <input type="text" className="form-control" id="idValue" value={customerData?.idValue}
                                                                maxLength="20"
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, idValue: e.target.value })
                                                                    setCustomerError({ ...customerError, idValue: "" })
                                                                }}
                                                                readOnly={true}
                                                            />
                                                            <span className="errormsg">{customerError.idValue ? customerError.idValue : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="email" className="col-form-label">Email <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <input type="email" className="form-control" id="email" value={customerData?.emailId}
                                                                onKeyPress={(e) => { validateEmail(e) }}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, emailId: e.target.value })
                                                                    setCustomerError({ ...customerError, emailId: "" })
                                                                }}
                                                                readOnly={true}
                                                            />
                                                            <span className="errormsg">{customerError.emailId ? customerError.emailId : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="mobileNo" className="col-form-label">Contact Number <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <div className="form-inline">
                                                                <input className="form-control form-inline mr-1" style={{ width: "20%" }} type="text" id="code" value={"+" + customerAddress?.countryCode} disabled />
                                                                <NumberFormatBase className="form-control" id="mobileNo" value={customerData?.mobileNo}
                                                                    onChange={(e) => {
                                                                        setCustomerData({ ...customerData, mobileNo: e.target.value })
                                                                        setCustomerError({ ...customerError, mobileNo: "" })
                                                                    }}
                                                                    style={{ width: "72%" }}
                                                                    readOnly={true}
                                                                />
                                                                <span className="errormsg">{customerError.mobileNo ? customerError.mobileNo : ""}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="customerClass" className="col-form-label">Customer Class </label>
                                                            <select id="idType" className="form-control" value={customerData?.customerClass}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, customerClass: e.target.value })
                                                                    setCustomerError({ ...customerError, customerClass: "" })
                                                                }}
                                                            // disabled={true}
                                                            >
                                                                <option key={1} value="">Select..</option>
                                                                {
                                                                    customerClassLookup && customerClassLookup.map((e) => (
                                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <span className="errormsg">{customerError.customerClass ? customerError.customerClass : ""}</span>
                                                        </div>
                                                    </div> <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="customerMaritalStatus" className="col-form-label">Marital Status </label>
                                                            <select id="idType" className="form-control" value={customerData?.customerMaritalStatus}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, customerMaritalStatus: e.target.value })
                                                                    setCustomerError({ ...customerError, customerMaritalStatus: "" })
                                                                }}
                                                            // disabled={true}
                                                            >
                                                                <option key={1} value="">Select..</option>
                                                                {
                                                                    maritalStatusLookup && maritalStatusLookup.map((e) => (
                                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <span className="errormsg">{customerError.customerMaritalStatus ? customerError.customerMaritalStatus : ""}</span>
                                                        </div>
                                                    </div> <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="occupation" className="col-form-label">Occupation </label>
                                                            <input type="occupation" className="form-control" id="occupation" value={customerData?.occupation}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, occupation: e.target.value })
                                                                    setCustomerError({ ...customerError, occupation: "" })
                                                                }}
                                                            // readOnly={true}
                                                            />
                                                            <span className="errormsg">{customerError.occupation ? customerError.occupation : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="whatsappNo" className="col-form-label">Whatsapp No. </label>
                                                            <input type="whatsappNo" className="form-control" id="whatsappNo" value={customerData?.whatsappNo}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, whatsappNo: e.target.value })
                                                                    setCustomerError({ ...customerError, whatsappNo: "" })
                                                                }}
                                                            // readOnly={true}
                                                            />
                                                            <span className="errormsg">{customerError.whatsappNo ? customerError.whatsappNo : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="telephoneNo" className="col-form-label">Telephone No. </label>
                                                            <input type="telephoneNo" className="form-control" id="telephoneNo" value={customerData?.telephoneNo}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, telephoneNo: e.target.value })
                                                                    setCustomerError({ ...customerError, telephoneNo: "" })
                                                                }}
                                                            // readOnly={true}
                                                            />
                                                            <span className="errormsg">{customerError.telephoneNo ? customerError.telephoneNo : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="fax" className="col-form-label">Fax No. </label>
                                                            <input type="fax" className="form-control" id="fax" value={customerData?.fax}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, fax: e.target.value })
                                                                    setCustomerError({ ...customerError, fax: "" })
                                                                }}
                                                            // readOnly={true}
                                                            />
                                                            <span className="errormsg">{customerError.fax ? customerError.fax : ""}</span>
                                                        </div>
                                                    </div> <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="facebookId" className="col-form-label">Facebook ID </label>
                                                            <input type="facebookId" className="form-control" id="facebookId" value={customerData?.facebookId}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, facebookId: e.target.value })
                                                                    setCustomerError({ ...customerError, facebookId: "" })
                                                                }}
                                                            // readOnly={true}
                                                            />
                                                            <span className="errormsg">{customerError.facebookId ? customerError.facebookId : ""}</span>
                                                        </div>
                                                    </div> <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="instagramId" className="col-form-label">Instagram ID </label>
                                                            <input type="instagramId" className="form-control" id="instagramId" value={customerData?.instagramId}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, instagramId: e.target.value })
                                                                    setCustomerError({ ...customerError, instagramId: "" })
                                                                }}
                                                            // readOnly={true}
                                                            />
                                                            <span className="errormsg">{customerError.instagramId ? customerError.instagramId : ""}</span>
                                                        </div>
                                                    </div> <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="telegramId" className="col-form-label">Telegram ID </label>
                                                            <input type="telegramId" className="form-control" id="telegramId" value={customerData?.telegramId}
                                                                onKeyPress={(e) => { validateEmail(e) }}
                                                                onChange={(e) => {
                                                                    setCustomerData({ ...customerData, telegramId: e.target.value })
                                                                    setCustomerError({ ...customerError, telegramId: "" })
                                                                }}
                                                            // readOnly={true}
                                                            />
                                                            <span className="errormsg">{customerError.telegramId ? customerError.telegramId : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <label htmlFor="contactPreferences" className="control-label">Contact Preferences <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <Select
                                                                placeholder="Select Contact Preference"
                                                                components={{
                                                                    IndicatorSeparator: () => null
                                                                }}
                                                                isMulti
                                                                defaultValue={customerData?.contactPreferences?.length === 0 ? [] : customerData?.contactPreferences}
                                                                closeMenuOnSelect={true}
                                                                value={customerData?.contactPreferences ? contactPreferenceLookup?.filter(c => customerData?.contactPreferences?.includes(c.value)) : null}
                                                                options={contactPreferenceLookup}
                                                                getOptionLabel={option => `${option.label || ''}`}
                                                                onChange={(val) => {
                                                                    setCustomerData({ ...customerData, contactPreferences: val?.map(x => x.value) })
                                                                    setCustomerError({ ...customerError, contactPreferences: "" })
                                                                }}
                                                                name="state"

                                                                menuPortalTarget={document.modal}
                                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                                            />
                                                            <span className="errormsg">{customerError.contactPreferences ? customerError.contactPreferences : ""}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* {addressLookUpRef && countries && */}
                                <AddressDetailsEditable
                                    data={{
                                        addressData: customerAddress
                                    }}
                                    countries={countries}
                                    lookups={{
                                        addressElements: addressLookUpRef
                                    }}
                                    title={"Customer Address"}
                                    error={customerError}
                                    setError={setCustomerError}
                                    handler={{
                                        setAddressData: setCustomerAddress,
                                        setAddressLookUpRef
                                    }}
                                />
                                {/* } */}
                            </fieldset>
                            <div className="col-md-12">
                                <div id="customer-buttons" className="text-center mt-2">
                                    <button type="button" className="skel-btn-submit mr-2" onClick={handleSubmit}>Submit</button>
                                    <button type="button" className="skel-btn-cancel mr-1" onClick={handleCancel}>Cancel</button>
                                    <button type="button" className="skel-btn-submit" onClick={handleDeactivateCustomer}>De-Activate</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
export default EditCustomerModal;