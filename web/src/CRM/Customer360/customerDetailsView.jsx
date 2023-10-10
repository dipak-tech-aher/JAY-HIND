// import { useTranslation } from "react-i18next";
import CustomerAddressPreview from '../Customer/addressPreview';
import moment from 'moment'
import BillingDetails from "./BillingDetails";
const CustomerDetailsPreview = (props) => {

    // const { t } = useTranslation();

    const customerDetails = props.data.personalDetailsData
    const customerAddress = props.data.customerAddress
    // const customerType = props.custType
    const form = props.data.form

    return (
        <>
            <div className="form-row">
                <div className="col-12 pl-2 bg-light border mt-2">
                    <h5 className="text-primary">Customer Details</h5>
                </div>
            </div>
            <div className="row pt-1">
                {

                    form && form !== null && form !== undefined && form === "customer360" ?

                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="customerNumber" className="col-form-label">Customer Number </label>
                                <p>{customerDetails?.crmCustomerNo}</p>
                            </div>
                        </div>
                        : ''
                }
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputName" className="col-form-label">Customer Name</label>
                        <p>{customerDetails?.title.charAt(0).toUpperCase() + customerDetails?.title.substr(1).toLowerCase() + " " + customerDetails?.surName.charAt(0).toUpperCase() + customerDetails?.surName.substr(1).toLowerCase() + " " + customerDetails?.foreName.charAt(0).toUpperCase() + customerDetails?.foreName.substr(1).toLowerCase()}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputName" className="col-form-label">Customer Type</label>
                        <p>{customerDetails && customerDetails?.customerTypeDesc || '-'}</p>
                    </div>
                </div>
                {
                    form && form !== null && form !== undefined && form === "customer360" ?
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="customerNumber" className="col-form-label">Status </label>
                                <span className="ml-1 badge badge-outline-success font-17">{customerDetails?.statusDesc || '-'}</span>
                            </div>
                        </div> : ''
                }
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">Gender</label>
                        <p>{customerDetails?.gender === 'M' ? 'Male' : 'Female'}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">Date of Birth</label>
                        <p>{moment(customerDetails?.dob).format('DD MMM YYYY')}</p>
                    </div>
                </div>
                {
                    form && form !== null && form !== undefined && form === "customer360" ?
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="customerid" className="col-form-label">ID Type</label>
                                <p>{customerDetails?.idTypeDesc}</p>
                            </div>
                        </div>
                        : ''
                }
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">ID Number</label>
                        <p>{customerDetails?.idNumber}</p>
                    </div>
                </div>
                {/* <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">Customer Type</label>
                        <p>{(customerType === 'BUSINESS') ? t("business") : t("Residential")}</p>
                    </div>
                </div> */}
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">Email</label>
                        <p>{customerDetails?.email}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">Contact Type</label>
                        <p>{customerDetails?.contactTypeDesc || '-'}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">Contact Number</label>
                        <p>{customerDetails?.contactNbr}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">Billable</label>
                        <p>{customerDetails?.billableDetails?.isCustBillable === 'Y' ? 'Yes' : customerDetails?.billableDetails?.isCustBillable === 'N' ? 'No' : '-'}</p>
                    </div>
                </div>
            </div>
            {
                customerDetails?.billableDetails?.isCustBillable && customerDetails.billableDetails?.isCustBillable === 'Y' &&
                <div className="pb-2">
                    <BillingDetails
                        data={{
                            billableDetails: customerDetails?.billableDetails
                        }}
                    />
                </div>
            }

            <CustomerAddressPreview
                data={{
                    title: "customer_address",
                    addressData: customerAddress
                }}
            />
            <div className="form-row">
                <div className="col-12 pl-1 bg-light border">
                    <h5 className="text-primary">Customer Property</h5>
                </div>
            </div>
            <div className="form-row col-12 pl-2">
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">Customer Property 1</label>
                        <p>{customerDetails?.property1 || '-'}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">Customer Property 2</label>
                        <p>{customerDetails?.property2 || '-'}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">Customer Property 3</label>
                        <p>{customerDetails?.property3 || '-'}</p>
                    </div>
                </div>
            </div>
        </>
    )
}
export default CustomerDetailsPreview;