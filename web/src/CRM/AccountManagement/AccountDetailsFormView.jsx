import React, { useState } from 'react'
import { Tabs } from 'antd';
import AddressDetailsFormViewMin from '../Address/AddressDetailsFormViewMin';
import EditAccountDetailsModal from './EditAccountDetailsModal';
import AccountDetailsHistory from './AccountDetailsHistory';
import AddressDetailsFormView from '../Address/AddressDetailsFormView';

const AccountDetailsFormView = (props) => {
   console.log('props...........',props)
   const { TabPane } = Tabs;
   const { accountData,isPrint,accountDetailsData } = props?.data;
   console.log('accountDetailsData------>',accountDetailsData)
   const userPermission = props?.data?.userPermission
   const billableDetails = props?.data?.billableDetails
   const customerType = props.data.customerType;
   const accountRealtimeDetails = props.data.accountRealtimeDetails;
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
         <div className="tab-content">
            <div className="tab-pane fade show active" id="first" role="tabpanel" aria-labelledby="first-tab">
               <div className="accounts-edit-history">
                  <button className="styl-btn-history" data-target="#accounthistoryModal" data-toggle="modal" onClick={handleOnAccountHistory}>History</button>
                  {/* ${((userPermission && userPermission !== 'write') ? "d-none" : "")} */}
                  <button className={`styl-edti-btn`} onClick={handleOnAccountEdit}>Edit</button>
                  <button className="styl-edti-btn">Add Account</button>
               </div>
               <div className="accounts-basic-info">
                  <div className="account-details">
                     <span className="label-container-style">
                        Account Name
                     </span>
                     <span>{accountData?.firstName || ""} {accountData?.lastName || ""}</span>
                     <div className="bussiness-info">
                        <span className="bussiness-type">{accountData?.accountCatagoryDesc?.description}</span>
                        <span className="profile-status">{accountData?.accountStatus?.description}</span>
                     </div>
                  </div>
                  <div className="account-address">
                     <span className="label-container-style">
                        Contact Information
                     </span>
                     <span>{accountData?.firstName || accountData?.lastName}</span>
                     <span><a>{accountData?.accountContact[0]?.emailId}</a></span>
                     <span>{(accountData?.accountContact[0]?.mobilePrefix || '')}  {accountData?.accountContact[0]?.mobileNo || ''}</span>
                  </div>
               </div>
               <div className="cust-sect-fullgrid">
                  <AddressDetailsFormView data={{ addressData: accountData?.accountAddress[0] || [], title: 'Billing Address' }} />
               </div>
            </div>
         </div>
         {
            isEditAccountDetailsOpen &&
            <EditAccountDetailsModal
               data={{

                  isEditAccountDetailsOpen,
                  accountDetails: accountData,
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
export default AccountDetailsFormView;