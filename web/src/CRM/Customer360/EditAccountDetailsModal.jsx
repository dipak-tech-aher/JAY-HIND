import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';

import AddressDetailsForm from '../Address/AddressDetailsForm';
import { properties } from '../../properties';
import { get, post, put } from '../../common/util/restUtil';
import { RegularModalCustomStyles, validateEmail } from '../../common/util/util';
import BillingDetails from './BillingDetails';
import { string, object } from "yup";
import { toast } from 'react-toastify';
import { unstable_batchedUpdates } from 'react-dom';

const accountValidationSchema = object().shape({
    flatHouseUnitNo: string().required("Flat/House/Unit No is required"),
    street: string().required("Street is required"),
    district: string().required("District is required"),
    cityTown: string().required("City/Town is required"),
    postCode: string().required("Postcode is required"),
    country: string().required("Country is required"),
    state: string().required("State is required")
});

const EditAccountDetailsModal = (props) => {

    const { isEditAccountDetailsOpen, accountData, billableDetails } = props.data;
    const { setIsEditAccountDetailsOpen, pageRefresh } = props.handlers;

    const [editAccountDetailsInputs, setEditAccountDetailsInputs] = useState({
        accountName: `${accountData?.title ? accountData.title : ""} ${accountData?.surName} ${accountData?.foreName}`,
        accountContactTitle: accountData?.contactTitle,
        accountContactSurName: accountData?.contactSurName,
        accountContactForeName: accountData?.contactForeName,
        contactEmail: accountData?.email,
        contactNumber: accountData?.contactNbr,
        flatHouseUnitNo: accountData?.billingAddress[0]?.flatHouseUnitNo,
        building: accountData?.billingAddress[0]?.building,
        street: accountData?.billingAddress[0]?.street,
        cityTown: accountData?.billingAddress[0]?.cityTown,
        district: accountData?.billingAddress[0]?.district,
        state: accountData?.billingAddress[0]?.state,
        postCode: accountData?.billingAddress[0]?.postCode,
        country: accountData?.billingAddress[0]?.country,
        accountProperty1: accountData?.property_1,
        accountProperty2: accountData?.property_1,
        accountProperty3: accountData?.property_1,
    });

    const addressLookup = useRef();
    const [addressLookUpRef, setAddressLookUpRef] = useState(null)
    const [districtLookup, setDistrictLookup] = useState([{}])
    const [kampongLookup, setKampongLookup] = useState([{}])
    const [postCodeLookup, setPostCodeLookup] = useState([{}])
    const [countries, setCountries] = useState()
    const [accountDetailsError, setAccountDetailsError] = useState({});

    useEffect(() => {
        let district = [], v_district = []
        let kampong = [], v_kampong = []
        let postCode = [], v_postCode = []
        
        post(properties.BUSINESS_ENTITY_API, ["COUNTRY"])
            .then((response) => {
                if (response.data) {
                    
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
                                for (const a of district) {
                                    console.log('inside for district ', a)
                                    v_district.push({ code: a, description: a })
                                }
                                for (const a of kampong) {
                                    v_kampong.push({ code: a, description: a })
                                }
                                for (const a of postCode) {
                                    v_postCode.push({ code: a, description: a })
                                }
                            }
                        }).catch((error) => {
                            console.log(error)
                        })
                        .finally()
                    unstable_batchedUpdates(() => {

                        console.log('districtdsfdfd===>', district)
                        setDistrictLookup(v_district);
                        setKampongLookup(v_kampong);
                        setPostCodeLookup(v_postCode);
                        setCountries(response.data.COUNTRY)
                    })
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }, [])

    const handleOnAccountDetailsInputsChange = (e) => {
        const { target } = e;
        setEditAccountDetailsInputs({
            ...editAccountDetailsInputs,
            [target.id]: target.value
        })
    }

    const validate = (section, schema, data) => {
        try {
            setAccountDetailsError({})
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setAccountDetailsError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleOnSubmit = () => {
        if (validate('', accountValidationSchema, editAccountDetailsInputs)) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        
        const { accountContactTitle, accountContactForeName, accountContactSurName, contactEmail, contactNumber, flatHouseUnitNo, building, street, cityTown, district, state, postCode, country, accountProperty1, accountProperty2, accountProperty3 } = editAccountDetailsInputs
        let requestBody = {
            details: {
                email: contactEmail,
                contactNbr: contactNumber,
                title: accountContactTitle,
                firstName: accountContactSurName,
                lastName: accountContactForeName
            },
            address: {
                flatHouseUnitNo,
                building,
                street,
                road: "",
                cityTown,
                state,
                district,
                country,
                postCode
            },
            property: {
                property1: accountProperty1,
                property2: accountProperty2,
                property3: accountProperty3
            },
        }
        put(`${properties.ACCOUNT_DETAILS_API}/${accountData.accountId}`, requestBody)
            .then((response) => {
                const { status, message } = response;
                if (status === 200) {
                    toast.success(message);
                    setIsEditAccountDetailsOpen(false)
                    pageRefresh()
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleOnCancel = () => {
        setIsEditAccountDetailsOpen(false);
    }

    return (
        <Modal isOpen={isEditAccountDetailsOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header p-1">
                        <h4 className="modal-title">Edit Account Details</h4>
                        <button type="button" className="close" onClick={() => setIsEditAccountDetailsOpen(false)}>×</button>
                    </div>
                    <div className="modal-body bg-white">
                        <fieldset className="scheduler-border1">
                            <div className="row col-12">
                                <div className="col-md-12">
                                    <form>
                                        <div className="col-12 bg-light border mt-2"><h5 className="text-primary pl-2">Account Details </h5> </div>
                                        <div className="form-row">
                                            <div className="col-md-8">
                                                <div className="form-group">
                                                    <label htmlFor="customerTitle" className="col-form-label">Account Name</label>
                                                    <p>{editAccountDetailsInputs?.accountName}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="col-12 bg-light border">
                                                <h5 className="text-primary">Account Contact Details</h5>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="accountContactTitle" className="col-form-label">Title </label>
                                                    <input type="text" maxLength="20" className="form-control" id="accountContactTitle" onChange={handleOnAccountDetailsInputsChange} value={editAccountDetailsInputs?.accountContactTitle} />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="accountContactSurName" className="col-form-label">First Name </label>
                                                    <input type="text" maxLength="40" className="form-control" id="accountContactSurName" onChange={handleOnAccountDetailsInputsChange} value={editAccountDetailsInputs?.accountContactSurName} />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="accountContactForeName" className="col-form-label">Last Name </label>
                                                    <input type="text" maxLength="80" className="form-control" id="accountContactForeName" onChange={handleOnAccountDetailsInputsChange} value={editAccountDetailsInputs?.accountContactForeName} />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="contactEmail" className="col-form-label">Contact Email
                                                    </label>
                                                    <input type="email" className="form-control" onKeyPress={(e) => { validateEmail(e) }} id="contactEmail" onChange={handleOnAccountDetailsInputsChange} value={editAccountDetailsInputs.contactEmail} />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="contactNumber" className="col-form-label">Contact Number
                                                    </label>
                                                    <input type="text" className="form-control" id="contactNumber" maxLength="15" onChange={handleOnAccountDetailsInputsChange} value={editAccountDetailsInputs.contactNumber} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mt-2">
                                            {
                                                billableDetails && billableDetails !== undefined && billableDetails !== null && billableDetails?.isCustBillable && billableDetails?.isCustBillable === 'N' &&
                                                <div className="pb-2">
                                                    <BillingDetails
                                                        data={{
                                                            billableDetails: billableDetails
                                                        }}
                                                    />
                                                </div>
                                            }
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="row p-2">
                                <div className="col-12">
                                    {
                                        addressLookUpRef && addressLookUpRef !== null &&
                                        <AddressDetailsForm
                                            data={editAccountDetailsInputs}
                                            countries={countries}
                                            lookups={{
                                                districtLookup,
                                                kampongLookup,
                                                postCodeLookup,
                                                addressElements: addressLookUpRef
                                            }}
                                            title={"Account Address"}
                                            error={accountDetailsError}
                                            setError={setAccountDetailsError}
                                            lookupsHandler={{
                                                addressChangeHandler: handleOnAccountDetailsInputsChange
                                            }}
                                            handler={setEditAccountDetailsInputs}
                                        />
                                    }
                                </div>
                                <div className="row col-12">
                                    <form id="address-form" className="col-12">
                                        <div className="form-row pl-2">
                                            <div className="col-12 bg-light border">
                                                <h5 className="text-primary">Account Property</h5>
                                            </div>
                                        </div>
                                        <div className="form-row col-12">
                                            <div className="col-md-3 pl-2">
                                                <div className="form-group">
                                                    <label htmlFor="accountProperty1" className="col-form-label">Account Property 1</label>
                                                    <input maxLength="50" type="text" className="form-control" id="accountProperty1" onChange={handleOnAccountDetailsInputsChange} value={editAccountDetailsInputs.accountProperty1} />
                                                </div>
                                            </div>
                                            <div className="col-md-3 pl-2" >
                                                <div className="form-group">
                                                    <label htmlFor="accountProperty2" className="col-form-label">Account Property 2</label>
                                                    <input maxLength="50" type="text" className="form-control" id="accountProperty2" onChange={handleOnAccountDetailsInputsChange} value={editAccountDetailsInputs.accountProperty2} />
                                                </div>
                                            </div>
                                            <div className="col-md-3 pl-2">
                                                <div className="form-group">
                                                    <label htmlFor="accountProperty3" className="col-form-label">Account Property 3</label>
                                                    <input maxLength="50" type="text" className="form-control" id="accountProperty3" onChange={handleOnAccountDetailsInputsChange} value={editAccountDetailsInputs.accountProperty3} />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </fieldset>
                        <div className="col-12 p-1">
                            <div id="customer-buttons" className="d-flex justify-content-center">
                                <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleOnSubmit}>Submitxx</button>
                                <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" data-dismiss="modal" onClick={handleOnCancel}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default EditAccountDetailsModal;