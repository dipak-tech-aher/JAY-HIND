import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import custImg from '../../assets/images/placeholder.jpg'

import { get, post } from '../../common/util/restUtil';
import { properties } from '../../properties';

const CustomerDetailsEdit = (props) => {

    const { t } = useTranslation();

    const customerDetails = props.data.personalDetailsData
    const customerAddress = props.data.customerAddress
    const customerType = props.custType
    const form = props.data.form

    const [custIDTypes, setCustIDTypes] = useState([]);
    const [contactTypes, setContactTypes] = useState([]);
    const [district, setDistrict] = useState([])
    const [state, setState] = useState([])
    const [postCode, setPostCode] = useState([])

    console.log('customerDetails::',customerDetails)
    console.log('customerAddress::',customerAddress)
    console.log('customerType::',customerType)
    console.log('form::',form)

    

    useEffect(() => {
        
        post(properties.BUSINESS_ENTITY_API, [
            "CUSTOMER_ID_TYPE", "CONTACT_TYPE",'LOCATION','COUNTRY'
        ])
        .then((response) => {
            if (response.data) {
                setCustIDTypes(response.data["CUSTOMER_ID_TYPE"])
                setContactTypes(response.data["CONTACT_TYPE"])

                get(properties.ADDRESS_LOOKUP_API)
                .then((resp) => {
                    if (resp && resp.data) {
                        //addressLookup.current = resp.data
                        //setAddressLookUpRef(resp.data)
                        console.log('addressLoopup 1:::',resp.data)

                        for (let e of resp.data) {
                            console.log('addressLoopup 2:::',e)                            
                            if (!district.includes(e.district)) {
                                district.push(e.district)
                            }                            
                            if (!postCode.includes(e.postCode)) {
                                postCode.push(e.postCode)
                            }                            
                        }
                        //setDistrict(district)
                        //setPostCode(postCode)
                        console.log('district :::',district)
                        console.log('postCode :::',postCode)

                    }
                }).catch((error) => {
                    console.log(error)
                });
            }
        })
        .catch(error => {
            console.error(error);
        }).finally()
    }, [])

    //console.log('custIDTypes::',custIDTypes)
    //console.log('contactTypes::',contactTypes)

    return(
        custIDTypes && 
        <div className="addresshadow" id="editcustomer" tabIndex="-1" role="dialog" aria-hidden="true">
            <div className="modal-dialog">
            <div className="modal-content border bg-light">
                <div className="modal-header p-1">
                <h4 className="modal-title" id="myCenterModalLabel">Edit - {customerDetails.title + " " + customerDetails.surName + " " + customerDetails.foreName} - {customerDetails.crmCustomerNo} </h4>
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
                </div>
                <div className="modal-body bg-white">
                <fieldset className="scheduler-border1">
                    <div className="row col-12">
                    <div className="col-md-2">
                        <form>
                        <div className="d-flex flex-column">
                            <img className="mb-2" src={custImg} />
                            <button id="file-button" type="submit" className="form-control btn btn-primary btn-sm waves-effect waves-light  border-0 text-white">Change Photo</button>
                        </div>
                        </form>
                    </div>
                    <div className="col-md-10">
                        <form>
                        <div className="form-row">
                            <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="customerTitle" className="col-form-label">Title</label>
                                <input type="text" className="form-control" id="customerTitle" Value={customerDetails.title} readonly="true"/>
                            </div>
                            </div>
                            <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="customerNumber" className="col-form-label">Customer Number </label>
                                <input type="text" className="form-control" id="customerNumber" Value={customerDetails.crmCustomerNo} readonly="true"/>
                            </div>
                            </div>
                            <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="Surname" className="col-form-label">Surname</label>
                                <input type="text" className="form-control" id="Surname" Value={customerDetails.surName} readonly="true"/>
                            </div>
                            </div>
                            <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="Forename" className="col-form-label">Forename</label>
                                <input type="text" className="form-control" id="Forename" Value={customerDetails.foreName} readonly="true"/>
                            </div>
                            </div>
                            <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="Gender" className="col-form-label">Gender</label>
                                <select id="gender" className="form-control" value={customerDetails.gender} readonly="true">
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                            </div>
                            <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="Gender" className="col-form-label">Date of Birth</label>
                                <input type="date" className="form-control" value={customerDetails.foreName}/>
                            </div>
                            </div>
                            <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="customerid" className="col-form-label">ID Type</label>
                                <select id="idtype" className="form-control" value={customerDetails.idTypeDesc}>
                                {
                                    custIDTypes && custIDTypes.map((e) => (
                                        <option key={e.code} value={e.code}>{e.description}</option>
                                    ))                                
                                }
                                </select>
                            </div>
                            </div>
                            <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="idnumber" className="col-form-label">ID Number</label>
                                <input type="text" className="form-control" id="idnumber" Value="24172664" value={customerDetails.idNumber}/>
                            </div>
                            </div>
                            <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="email" className="col-form-label">Email</label>
                                <input type="text" className="form-control" id="email" value={customerDetails.email}/>
                            </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="contactType" className="col-form-label">Contact Type</label>
                                <select id="contactType" className="form-control" onchange="checkMask($(this))">
                                {
                                    contactTypes && contactTypes.map((e) => (
                                        <option key={e.code} value={e.code}>{e.description}</option>
                                    ))                                
                                }
                                </select>
                            </div>
                            </div>
                            <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="contactNbr" className="col-form-label">Contact Number</label>
                                <input type="text" className="form-control" id="contactNbr" value={customerDetails.contactNbr}/>
                            </div>
                            </div>
                            <div className="col-4 mt-2">
                            <label htmlFor="contactNbr" className="col-form-label">Billable</label>
                            <fieldset className="question">
                                <input id="coupon_question" type="checkbox" name="coupon_question" value="1" checked disabled />
                                <span className="item-text">Yes</span>
                            </fieldset>
                            </div>
                        </div>
                        </form>
                    </div>
                    </div>
                    <div className="row col-12">
                    <form id="address-form" className="col-12">
                        <div className="col-12 p-2">
                        <div className="col-12">
                            <fieldset className="pb-2">
                            <div className="form-row">
                                <div className="col-12 pl-2 bg-light border">
                                <h5 className="text-primary">Billing Details</h5>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-3">
                                <div className="form-group">
                                    <label htmlFor="billgroup" className="col-form-label">Bill Group</label>
                                    <select id="billgroup" className="form-control" disabled>
                                    <option>Select </option>
                                    <option selected="">Group 1</option>
                                    <option>Group 2</option>
                                    <option>Group 3</option>
                                    </select>
                                </div>
                                </div>
                                <div className="col-3">
                                <div className="form-group">
                                    <label htmlFor="currency" className="col-form-label">Currency</label>
                                    <select id="currency" className="form-control" disabled>
                                    <option>Select </option>
                                    <option selected="">AED</option>
                                    <option>KWD</option>
                                    <option>USD</option>
                                    <option>QAR</option>
                                    <option>SAR</option>
                                    <option>QAR</option>
                                    <option>BND</option>
                                    </select>
                                </div>
                                </div>
                                <div className="col-3">
                                <div className="form-group">
                                    <label htmlFor="postcode" className="col-form-label">Account Credit Limit</label>
                                    <input type="text" className="form-control" Value="300" disabled/>
                                </div>
                                </div>
                                <div className="col-3">
                                <div className="form-group">
                                    <label htmlFor="country" className="col-form-label">Exempt Credit Control</label>
                                    <select id="country" className="form-control" disabled>
                                    <option>Select</option>
                                    <option selected="">Yes</option>
                                    <option selected="">No</option>
                                    </select>
                                </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-3">
                                <div className="form-group">
                                    <label htmlFor="billgroup" className="col-form-label">Bill Language</label>
                                    <select id="billgroup" className="form-control" disabled>
                                    <option>Select </option>
                                    <option selected="">English</option>
                                    <option>Arabic</option>
                                    <option>French</option>
                                    </select>
                                </div>
                                </div>
                                <div className="col-3">
                                <div className="form-group">
                                    <label htmlFor="currency" className="col-form-label">Bill Notification</label>
                                    <select id="currency" className="form-control" disabled>
                                    <option>Select </option>
                                    <option selected="">Email</option>
                                    <option>SMS</option>
                                    <option>Print</option>
                                    </select>
                                </div>
                                </div>
                                <div className="col-3">
                                <div className="form-group">
                                    <label htmlFor="postcode" className="col-form-label">No of Copies</label>
                                    <input type="text" className="form-control" Value="1" disabled/>
                                </div>
                                </div>
                                <div className="col-3">
                                <div className="form-group">
                                    <label htmlFor="country" className="col-form-label">Source of Registration</label>
                                    <select id="country" className="form-control" disabled>
                                    <option>Select</option>
                                    <option selected="">Online</option>
                                    <option selected="">Counter</option>
                                    </select>
                                </div>
                                </div>
                                <div className="col-3">
                                <div className="form-group">
                                    <label htmlFor="country" className="col-form-label">Sales Agent</label>
                                    <select id="country" className="form-control" disabled>
                                    <option>Select</option>
                                    <option selected="">Srini</option>
                                    <option selected="">Basha</option>
                                    </select>
                                </div>
                                </div>
                            </div>
                            </fieldset>
                            <div className="form-row">
                            <div className="col-12 pl-2 bg-light border">
                                <h5 className="text-primary">Customer Address</h5>
                            </div>
                            </div>
                            <fieldset className="mt-2">
                            <div className="row col-12 p-0">
                                <div className="col-4">
                                <div className="form-group">
                                    <label htmlFor="flatHouseUnitNo" className="col-form-label">Flat/House/Unit No</label>
                                    <input type="text" className="form-control" id="flatHouseUnitNo" value={customerAddress.flatHouseUnitNo}/>
                                </div>
                                </div>
                                <div className="col-4">
                                <div className="form-group">
                                    <label htmlFor="building" className="col-form-label">Building Name/Others</label>
                                    <input type="text" className="form-control" id="building" value={customerAddress.building}/>
                                </div>
                                </div>
                                <div className="col-4">
                                <div className="form-group">
                                    <label htmlFor="building" className="col-form-label">Street/ Area</label>
                                    <input type="text" className="form-control" id="building" value={customerAddress.street}/>
                                </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-4">
                                <div className="form-group">
                                    <label htmlFor="simpang" className="col-form-label">City/ Town</label>
                                    <input type="text" className="form-control" id="simpang" value={customerAddress.cityTown}/>
                                </div>
                                </div>
                                <div className="col-4">
                                <div className="form-group">
                                    <label htmlFor="jalan" className="col-form-label">District/ Province</label>
                                    <select id="district" className="form-control" value={customerAddress.district}>
                                    {
                                        district && district.map((e) => (
                                            <option key={e} value={e}>{e}</option>
                                        ))                                
                                    }
                                    </select>
                                </div>
                                </div>
                                <div className="col-4">
                                <div className="form-group">
                                    <label htmlFor="district" className="col-form-label">State/ Region</label>
                                    <select id="district" className="form-control" value={customerAddress.state}>
                                    <option>Select State/Region</option>
                                    <option selected>Region 1</option>
                                    <option>Region 2</option>
                                    <option>Region 3</option>
                                    <option>Region 4</option>
                                    <option>Region 5</option>
                                    </select>
                                </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-4">
                                <div className="form-group">
                                    <label htmlFor="Country" className="col-form-label">ZIP</label>
                                    <select id="zip/postalcode" className="form-control" value={customerAddress.postCode}>
                                    {
                                        postCode && postCode.map((e) => (
                                            <option key={e} value={e}>{e}</option>
                                        ))                                
                                    }
                                    </select>
                                </div>
                                </div>
                                <div className="col-4">
                                <div className="form-group">
                                    <label htmlFor="Country" className="col-form-label">Country</label>
                                    <select id="country" className="form-control" value={customerAddress.country}>
                                    <option>Select country</option>
                                    <option selected>Country 1</option>
                                    <option>Country 2</option>
                                    <option>Country 3</option>
                                    <option>Country 4</option>
                                    <option>Country 5</option>
                                    </select>
                                </div>
                                </div>
                            </div>
                            </fieldset>
                        </div>
                        </div>
                        <div className="form-row pl-2">
                        <div className="col-12 bg-light border">
                            <h5 className="text-primary">Customer Property</h5>
                        </div>
                        </div>
                        <div className="form-row col-12">
                        <div className="col-md-3 pl-2">
                            <div className="form-group">
                            <label htmlFor="category" className="col-form-label">Customer Property 1</label>
                            <input type="text" className="form-control" id="simpang" value="Customer Property"/>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                            <label htmlFor="category" className="col-form-label">Customer Property 2</label>
                            <input type="text" className="form-control" id="simpang" value="Customer Property"/>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                            <label htmlFor="category" className="col-form-label">Customer Property 3</label>
                            <input type="text" className="form-control" id="simpang" value="Customer Property"/>
                            </div>
                        </div>
                        </div>
                    </form>
                    </div>
                </fieldset>
                <div className="col-12 p-1">
                    <div id="customer-buttons" className="d-flex justify-content-center">
                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2">Submit</button>
                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" data-dismiss="modal">Cancel</button>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
    )
}
export default CustomerDetailsEdit;