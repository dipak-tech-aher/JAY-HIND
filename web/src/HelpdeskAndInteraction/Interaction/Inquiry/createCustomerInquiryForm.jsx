import { useState } from "react";
import { useTranslation } from "react-i18next";
import SwitchToExistingCustomer from "react-switch";
import { toast } from "react-toastify";
import { string, date, object } from "yup";
import { get, post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";

import { handlePaste, validateNumber } from "../../../common/util/validateUtil";
import { NumberFormatBase } from 'react-number-format';
import { getServiceCategoryMappingBasedOnProdType } from "../../../common/util/util";
const accessNumberValidationSchema = object().shape({
    serviceNo: string().required("Access Number is required.")
})

const CreateCustomerInquiryForm = (props) => {
    let requestParam;
    const { t } = useTranslation();
    let viewMode = props.viewMode;

    const [serviceNoError, setServiceNoError] = useState({});

    let personalDetailsData = props.data.personalDetailsData
    let saveSearchResultData = props.data.saveSearchResultData
    let switchToExistingCustomer = props.data.switchToExistingCustomer
    let customerSearchToShow = props.customerSearchToShow
    let serviceNumber = props.data.serviceNumber
    let serviceTypeRef = props.data.serviceTypeRef
    let statusPendingOrPDCheckRef = props.data.statusPendingOrPDCheckRef

    let setPersonalDetailsData = props.stateHandler.setPersonalDetailsData
    let setSwitchToExistingCustomer = props.stateHandler.setSwitchToExistingCustomer
    let setSaveSearchResultData = props.stateHandler.setSaveSearchResultData
    let setViewMode = props.stateHandler.setViewMode
    let setServiceNumber = props.stateHandler.setServiceNumber
    let getSetFilteredProductOrServices = props.stateHandler.getSetFilteredProductOrServices
    let setInquiryDataDetails = props.stateHandler.setInquiryDataDetails
    const customerTypeLookup = props.lookups.customerTypeLookup
    const categoryLookup = props.lookups.categoryLookup
    const contactTypeLookup = props.lookups.contactTypeLookup
    const prodTypeLookup = props.lookups.prodTypeLookup

    const serviceTypeLookup = [
        { code: 'Postpaid', description: 'Postpaid' },
        { code: 'Prepaid', description: 'Prepaid' },
        { code: 'Fixed', description: 'Fixed' },
        { code: 'Fixed Broadband', description: 'Fixed Broadband' },
        { code: 'Booster', description: 'Booster' }
    ]

    const error = props.error
    const setError = props.setError

    const validate = (section, schema, data) => {
        try {
            if (section === 'ACCESSNUMBER') {
                setServiceNoError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'ACCESSNUMBER') {
                    setServiceNoError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };
    const validateAccessnumber = () => {
        const error = validate('ACCESSNUMBER', accessNumberValidationSchema, serviceNumber);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        return true
    }
    const handleServiceNumber = () => {
        // if (serviceNumber.serviceNo.length < 7) {
        //     toast.error("Please enter 7 digit Access Number")
        //     return false
        // }
        if (validateAccessnumber()) {
            getCustomerDetailsByServiceNo(serviceNumber.serviceNo)
        }
    }
    const getCustomerDetailsByServiceNo = (data) => {
        let apiData;
        let custData

        requestParam = {
            searchType: "QUICK_SEARCH",
            customerQuickSearchInput: data,
            source: 'INQUIRY'
        }
        
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
                            toast.success("Customer Information Retrieved Successfully");
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
                                    setPersonalDetailsData({
                                        customerName: custData.title + " " + custData.firstName + " " + custData.lastName,
                                        customerType: custData?.custType,
                                        //  customerCategoryDesc: custData?.categoryDesc,
                                        // customerCategory: 'CATSTD', // For Demo Purpose, actual is above one
                                        // customerCategoryDesc: 'Standard',
                                        email: custData?.contact?.email,
                                        contactPreference: custData?.contact?.contactType,
                                        contactPreferenceDesc: custData?.contactTypeDesc?.description,
                                        contactNbr: custData?.contact?.contactNo,
                                    })
                                    setError({ ...error, customerName: "", customerType: "", contactNbr: "", email: "", contactPreference: "" })
                                }).catch(error => console.log(error))
                            //et service = 'Prepaid'  // For Demo Purpose
                            setViewMode({ ...viewMode, mode: 'Create_Existing' })
                            serviceTypeRef.current = apiData?.prodType
                            //serviceTypeRef.current = service // For Demo Purpose, actual is above one
                            let serviceCategoryMapping = getServiceCategoryMappingBasedOnProdType(prodTypeLookup, apiData?.prodType);
                            setInquiryDataDetails((prevState) => {
                                return {
                                    ...prevState,
                                    serviceType: apiData?.prodType,
                                    serviceTypeDesc: apiData?.serviceTypeDesc,
                                    //serviceType: service, // For Demo Purpose, actual is above one
                                    serviceCategory: serviceCategoryMapping?.hasOwnProperty('serviceCategory') ? serviceCategoryMapping?.serviceCategory : ""
                                }
                            })
                            getSetFilteredProductOrServices(apiData?.prodType)
                            //getSetFilteredProductOrServices(service) // For Demo Purpose, actual is above one
                            statusPendingOrPDCheckRef.current = false;
                        }
                        else {
                            setPersonalDetailsData({
                                customerName: "",
                                customerType: '',
                                email: "",
                                contactPreference: "",
                                contactPreferenceDesc: "",
                                contactNbr: "",
                            })
                            setError({ ...error, customerName: "", customerType: "", contactNbr: "", email: "", contactPreference: "" })
                            serviceTypeRef.current = ""
                            statusPendingOrPDCheckRef.current = true;
                            setInquiryDataDetails((prevState) => {
                                return {
                                    ...prevState,
                                    serviceType: ""
                                }
                            })
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
    const validateEmail = (object) => {
        const pattern = new RegExp("^[a-zA-Z0-9@._-]{1,100}$");
        let key = String.fromCharCode(!object.charCode ? object.which : object.charCode);
        let temp = pattern.test(key)
        if (temp === false) {
            object.preventDefault();
            return false;
        }
    }
    return (
        <form>
            {
                (customerSearchToShow === "show") ?
                    <div>
                        <div className="col-form-label" style={(viewMode.mode === 'Create_New' || viewMode.mode === 'Create_Existing') ? { display: 'display' } : { display: 'none' }}>
                            <h5>{t("access_number")}</h5>
                        </div>

                        <div className="form-row" style={(viewMode.mode === 'Create_New' || viewMode.mode === 'Create_Existing') ? { display: 'display' } : { display: 'none' }}>

                            <div className="col-md-3" >
                                <div className="app-search-box dropdown">
                                    <div className="input-group">
                                        <input
                                            type="search"
                                            className={`form-control ${(serviceNoError.serviceNo ? "input-error" : "")}`}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    handleServiceNumber()
                                                };
                                            }}
                                            maxLength={15}
                                            value={serviceNumber.serviceNo}
                                            disabled={(switchToExistingCustomer.isExsitingCustomer) ? '' : 'disabled'}
                                            placeholder="Access Number"
                                            id="service-no-search"
                                            onChange={e => setServiceNumber({ ...serviceNumber, serviceNo: e.target.value })}
                                        />
                                        <div className="input-group-append">
                                            <button
                                                disabled={(switchToExistingCustomer.isExsitingCustomer) ? '' : 'disabled'}
                                                className="btn btn-primary btn-sm"
                                                onClick={handleServiceNumber}
                                                type="button">
                                                <i className="fe-search"></i>
                                            </button>
                                        </div>
                                        <span className="errormsg">{serviceNoError.serviceNo ? serviceNoError.serviceNo : ""}</span>
                                    </ div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <SwitchToExistingCustomer
                                    onColor="#f58521"
                                    offColor="#6c757d"
                                    activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                    height={20}
                                    width={48}
                                    checked={switchToExistingCustomer.isExsitingCustomer}
                                    onChange={e => {
                                        setSwitchToExistingCustomer({ ...switchToExistingCustomer, isExsitingCustomer: e });
                                        if (e === false) {
                                            setServiceNumber({ ...serviceNumber, serviceNo: "" })
                                        }
                                    }}
                                />
                                <label htmlFor="switchToExixtingCustomer" className="col-form-label">Use Access Number</label>
                            </div>
                        </div>
                    </div > : ""
            }




            <hr></hr>
            <div className="form-row">
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="customerTitle" className="col-form-label">Customer Name<span>*</span></label>
                        <input type="text" disabled={(viewMode.mode !== 'Create_New') ? 'disabled' : ""} className={`form-control ${(error.customerName ? "input-error" : "")}`} value={personalDetailsData.customerName} id="customerTitle" placeholder="Customer Name"
                            maxLength="80"
                            onChange={(e) => {
                                setPersonalDetailsData({ ...personalDetailsData, customerName: e.target.value });
                                setError({ ...error, customerName: "" })
                            }
                            }
                        />
                        <span className="errormsg">{error.customerName ? error.customerName : ""}</span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="category" className="col-form-label">Customer Type<span>*</span></label>
                        <select id="category" disabled={(viewMode.mode !== 'Create_New') ? 'disabled' : ""} value={personalDetailsData.customerType} className={`form-control ${(error.customerType ? "input-error" : "")}`}
                            onChange={e => {
                                setPersonalDetailsData({ ...personalDetailsData, customerType: e.target.value })
                                setError({ ...error, customerType: "" })
                            }
                            }>
                            <option value="">Choose Customer Type</option>
                            {
                                customerTypeLookup.map((e) => (
                                    <option key={e.code} value={e.code}>{e.description}</option>
                                ))
                            }
                        </select>
                        <span className="errormsg">{error.customerType ? error.customerType : ""}</span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="Surname" className="col-form-label">Customer Contact Number<span>*</span></label>
                        <NumberFormatBase type="text" disabled={(viewMode.mode !== 'Create_New') ? 'disabled' : ""} className={`form-control ${(error.contactNbr ? "input-error" : "")}`} value={personalDetailsData.contactNbr} id="contacyNbr" placeholder="Contact Number"
                            maxLength="15"
                            onKeyPress={(e) => { validateNumber(e) }}
                            onChange={(e) => {
                                setPersonalDetailsData({ ...personalDetailsData, contactNbr: e.target.value })
                                setError({ ...error, contactNbr: "" })
                            }
                            }
                        />
                        <span className="errormsg">{error.contactNbr ? error.contactNbr : ""}</span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="email" className="col-form-label">Customer Email ID<span>*</span></label>
                        <input type="text" disabled={(viewMode.mode !== 'Create_New') ? 'disabled' : ""} value={personalDetailsData.email} className={`form-control ${(error.email ? "input-error" : "")}`} id="email" placeholder="Email"
                            onKeyPress={(e) => { validateEmail(e) }}
                            onPaste={(e) => handlePaste(e)}
                            onChange={(e) => {
                                setPersonalDetailsData({ ...personalDetailsData, email: e.target.value })
                                setError({ ...error, email: "" })
                            }
                            }
                        />
                        <span className="errormsg">{error.email ? error.email : ""}</span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="contactType" className="col-form-label">Contact Preference<span>*</span></label>
                        <select id="contactType" disabled={(viewMode.mode !== 'Create_New') ? 'disabled' : ""} value={personalDetailsData.contactPreference} className={`form-control ${(error.contactPreference ? "input-error" : "")}`}
                            onChange={(e) => {
                                setPersonalDetailsData({ ...personalDetailsData, contactPreference: e.target.value, contactPreferenceDesc: e.target.options[e.target.selectedIndex].label })
                                setError({ ...error, contactPreference: "" })
                            }
                            }>
                            <option value="">Choose Contact Type</option>
                            {
                                contactTypeLookup.map((e) => (
                                    <option key={e.code} value={e.code}>{e.description}</option>
                                ))
                            }
                        </select>
                        <span className="errormsg">{error.contactPreference ? error.contactPreference : ""}</span>
                    </div>
                </div>

            </div>
        </form >
    )

}
export default CreateCustomerInquiryForm;