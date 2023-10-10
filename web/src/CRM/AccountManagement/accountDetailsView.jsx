
import React, { useState } from 'react';
import AccountAddressView from '../Customer/addressPreview'
import AccountDetailsHistory from './AccountDetailsHistory';
import BillingDetails from './BillingDetails';
import EditAccountDetailsModal from './EditAccountDetailsModal';

const AccountDetailsView = (props) => {
    const userPermission = props?.data?.userPermission

    const billableDetails = props?.data?.billableDetails
    const customerType = props.data.customerType;
    const accountData = props.data.accountData;
    const accountRealtimeDetails = props.data.accountRealtimeDetails;
    const properties = props.data.properties;
    const billingAddress = accountData.billingAddress[0];
    const securityData = accountData.securityData;
    const billOptions = accountData.billOptions;

    const openBillHistoryModal = props.data.openBillHistoryModal;
    const setOpenBillHistoryModal = props.data.setOpenBillHistoryModal;
    const pageRefresh = props.data.pageRefresh
    const [isEditAccountDetailsOpen, setIsEditAccountDetailsOpen] = useState(false);
    const [isAccountDetailsHistoryOpen, setIsAccountDetailsHistoryOpen] = useState(false);

    const handleOnAccountEdit = () => {
        setIsEditAccountDetailsOpen(true);
    }

    const handleOnAccountHistory = () => {
        setIsAccountDetailsHistoryOpen(true);
    }

    return (
        <>
            <div className="row bg-light border ml-2 mr-2 mt-3">
                <div className="col">
                    <h5 className="text-primary">Account Details</h5>
                </div>
                <div className="col-auto mx-auto">

                    <button type="button" className={`btn btn-labeled btn-primary btn-sm mt-1 mr-1 ${((userPermission && userPermission !== 'write') ? "d-none" : "")}`} onClick={handleOnAccountEdit}>
                        <i className="fas fa-edit" />
                        <span className="btn-label" />
                        Edit
                    </button>
                    <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" onClick={handleOnAccountHistory} >
                        <i className="fas fa-book" />
                        <span className="btn-label" />
                        History
                    </button>
                </div>
            </div>
            <div className="row pl-1">
                {
                    (customerType === 'RESIDENTIAL') ?
                        <div className="col-md-10">
                            <div className="form-group">
                                <label htmlFor="accountName" className="col-form-label">Account Name</label>
                                <p>{accountData?.title + " " + accountData?.foreName + " " + accountData?.surName}</p>
                            </div>
                        </div>
                        :
                        <></>
                }
                {
                    (customerType === 'BUSINESS') ?
                        <div className="col-md-10">
                            <div className="form-group">
                                <label htmlFor="companyName" className="col-form-label">Account Name</label>
                                <p>{accountData?.companyName}</p>
                            </div>
                        </div>
                        :
                        <></>
                }
                <div className="col-md-2 pl-3 pt-2 bold">
                    Status
                    <span className="ml-1 badge badge-outline-success font-17">
                        {accountData?.status}
                    </span>
                </div>
            </div>
            <br></br>
            <div className="row p-0 ml-2 mr-2">
                <div className="col-12 pl-2 bg-light border">
                    <h5 className="text-primary">Account Contact Details</h5>
                </div>
            </div>
            <div className="row pt-1 pl-1">
                <div className="col-md-9">
                    <div className="form-group">
                        <label htmlFor="contactTitle" className="col-form-label">Contact Person Name</label>
                        <p>{accountData?.contactTitle + " " + accountData?.contactForeName + " " + accountData?.contactSurName}</p>
                    </div>
                </div>
            </div>
            <div className="row pt-1 pl-1">
                <div className="col-4">
                    <div className="form-group">
                        <label htmlFor="email" className="col-form-label">Contact Email</label>
                        <p>{accountData?.email}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="contactNbr" className="col-form-label">Contact Type</label>
                        <p>{accountData.contactTypeDesc}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="contactNbr" className="col-form-label">Contact Number</label>
                        <p>{accountData?.contactNbr}</p>
                    </div>
                </div>
            </div>
            {/* {
                billableDetails && billableDetails !== undefined && billableDetails !== null && billableDetails?.isCustBillable && billableDetails?.isCustBillable === 'N' &&
                <div className="pb-2">
                    <BillingDetails
                        data={{
                            billableDetails: billableDetails
                        }}
                    />
                </div>
            } */}
            {
                (accountData && accountData.billingAddress && accountData.billingAddress.length > 0) ?
                    <div className="col-12 p-2">
                        <AccountAddressView
                            data={{
                                title: "billing_address",
                                addressData: billingAddress
                            }}
                        />
                    </div>
                    :
                    <></>
            }
            <div className="row p-0 ml-2 mr-2">
                <div className="col-12 pl-2 bg-light border">
                    <h5 className="text-primary">Account Property</h5>
                </div>
            </div>
            <div className="row pl-1 pt-1">
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="categoryDesc" className="col-form-label">Account Property 1</label>
                        <p>{accountData.property_1}</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="classDesc" className="col-form-label">Account Property 2</label>
                        <p>{accountData.property_2}</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="baseCollPlanDesc" className="col-form-label">Account Property 3</label>
                        <p>{accountData.property_3}</p>
                    </div>
                </div>
            </div>
            {
                isEditAccountDetailsOpen &&
                <EditAccountDetailsModal
                    data={{

                        isEditAccountDetailsOpen,
                        accountData,
                        billableDetails: billableDetails
                    }}
                    handlers={{
                        setIsEditAccountDetailsOpen,
                        pageRefresh
                    }}
                />
            }
            {
                isAccountDetailsHistoryOpen &&
                <AccountDetailsHistory
                    data={{
                        isAccountDetailsHistoryOpen,
                        accountData
                    }}
                    handlers={{
                        setIsAccountDetailsHistoryOpen
                    }}
                />
            }

        </>
    )
}
export default AccountDetailsView;