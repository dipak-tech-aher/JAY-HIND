import React from 'react';
import PaymentHistory from '../../InvoiceAndBilling/Accounting/AccountDetailsView/PaymentHistory';
import FileDownload from '../../common/uploadAttachment/FileDownload';
import SearchContract from '../../InvoiceAndBilling/Contract/SearchContract';
import CustomerDetailsPreview from '../Customer/CustomerDetailsForm';
import SearchInvoice from '../../InvoiceAndBilling/Invoice/SearchInvoice';
import HelpdeskHistory from './HelpdeskHistory/HelpdeskHistory';
import { Tabs } from 'antd';
import AccountDetailsView from './accountDetailsView';
import Slider from "react-slick";
import CatalogCard from './CatalogCard';
import PlanServiceAssetCard from './PlanServiceAssetCard';
import ServiceRequestList from './serviceRquestList';
import ComplaintList from '../../HelpdeskAndInteraction/Interaction/Complaint/complaintList';
import InquiryList from '../../HelpdeskAndInteraction/Interaction/Inquiry/inquiryList';
const { TabPane } = Tabs;

const Pdf360View = (props) => {

    const { customerDetails, selectedAccount, accountIdList, accountNo, accountDetails, accountRealtimeDetails, newAccountAddded, userPermission, catalogList, catalogSettings, activeService, settings, planServiceAssetList, leftNavCounts, leftNavCountsComplaint, leftNavCountsInquiry, isScroll } = props.location.state.data;
    return (
        <>

            <section className="triangle col-12">
                <div className="row col-12">
                    <div className="col-9">
                        {
                            (customerDetails && customerDetails.customerId) ?
                                (customerDetails.customerType === 'RESIDENTIAL') ?
                                    <h4 id="list-item-0" className="pl-1">{customerDetails.title + " " + customerDetails.surName + " " + customerDetails.foreName} - {(customerDetails.crmCustomerNo && customerDetails.crmCustomerNo != '') ? customerDetails.crmCustomerNo : customerDetails.customerId}</h4>
                                    :
                                    <h4 id="list-item-0" className="pl-1">{customerDetails.companyName} - {(customerDetails.crmCustomerNo && customerDetails.crmCustomerNo != '') ? customerDetails.crmCustomerNo : customerDetails.customerId}</h4>
                                :
                                ""
                        }
                    </div>
                </div>
            </section>
            <div className="pt-1">
                <div className="col-md-12">
                    {/* <div className="col-md-2"><img className="mb-2 pt-2" src="./assets/images/placeholder.jpeg"></div> */}
                    <div className="form-row ml-0 mr-0">
                        <div className="form-row col-md-12 p-0 ml-0 mr-0">
                            <div className="col-md-11 card-box m-0 p-0">
                                {
                                    
                                    <CustomerDetailsPreview
                                        custType={customerDetails.customerType}
                                        data={{
                                            personalDetailsData: customerDetails,
                                            customerAddress: customerDetails.address[0],
                                            form: "customer360"
                                        }}
                                    />
                                     
                                }                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="col-12 p-0 pagebreak">

                <div className="mt-2 col-12 p-0">
                    <section className="triangle col-12">
                        <div className="row col-12">
                            <div className="col-6">
                                <h5 className="pl-1">Attachments</h5>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="pl-2 col-12">
                    {
                        customerDetails && customerDetails?.customerId &&
                        <FileDownload
                            data={{
                                entityType: "CUSTOMER",
                                entityId: customerDetails?.customerId,
                            }}
                        />
                    }
                </div>

            </div>



            <div className="col-12 p-0">
                <div className="mt-2 col-12 p-0">
                    <section className="triangle col-12">
                        <div className="row col-12">
                            <div className="col-12">
                                <h5 className="pl-3">Contract</h5>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="col-12">
                    {
                        selectedAccount && selectedAccount?.accountNo ?
                            <SearchContract
                                data={{
                                    isScroll: isScroll,
                                    data: { billRefNo: selectedAccount?.accountNo },
                                    hideForm: true,
                                    contractType: "billed",
                                    from: "Customer360"
                                }}
                                handler={{
                                    pageRefresh: () => { }
                                }}
                            />
                            :
                            <span className="msg-txt pt-1">No Contracts Available</span>
                    }
                </div>
            </div>
            <div className="col-12 p-0">
                <div className="mt-2 col-12 p-0">
                    <section className="triangle col-12">
                        <div className="row col-12">
                            <div className="col-12">
                                <h5 className="pl-3">Unbilled Contract</h5>
                                {/* <h4 id="list-item-4" className="pl-1">Contract/h4> */}
                            </div>
                        </div>
                    </section>
                </div>
                <div className="col-12">
                    {
                        selectedAccount && selectedAccount?.accountNo ?
                            <SearchContract
                                data={{
                                    isScroll: isScroll,
                                    data: { billRefNo: selectedAccount?.accountNo },
                                    hideForm: true,
                                    contractType: "unbilled",
                                    from: "Customer360"
                                }}
                                handler={{
                                    pageRefresh: () => { }
                                }}
                            />
                            :
                            <span className="msg-txt pt-1">No Contracts Available</span>
                    }
                </div>
            </div>
            <div className="col-12 p-0 pagebreak">
                <div className="mt-2 col-12 p-0">
                    <section className="triangle col-12">
                        <div className="row col-12">
                            <div className="col-12">
                                <h5 className="pl-3">Contract History</h5>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="col-12">
                    {
                        selectedAccount && selectedAccount?.accountNo ?
                            <SearchContract
                                data={{
                                    isScroll: isScroll,
                                    data: { billRefNo: selectedAccount?.accountNo },
                                    hideForm: true,
                                    contractType: "history",
                                    from: "Customer360"
                                }}
                                handler={{
                                    pageRefresh: () => { }
                                }}
                            />
                            :
                            <span className="msg-txt pt-1">No Contracts Available</span>
                    }
                </div>
            </div>
            <div className="col-12 p-0 ">
                <div className="mt-2 col-12 p-0">
                    <section className="triangle col-12">
                        <div className="row col-12">
                            <div className="col-12">
                                <h5 className="pl-3">Invoice</h5>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="col-12">
                    {
                        selectedAccount && selectedAccount?.accountNo ?
                            <SearchInvoice
                                data={{
                                    isScroll: isScroll,
                                    data: { billRefNo: selectedAccount?.accountNo },
                                    hideForm: true,
                                    from: "Customer360"
                                }}
                            />
                            :
                            <span className="msg-txt pt-1">No Invoice Available</span>
                    }
                </div>
            </div>
            <div className="col-12 p-0">
                <div className="mt-2 col-12 p-0">
                    <section className="triangle col-12">
                        <div className="row col-12">
                            <div className="col-12">
                                <h5 className="pl-3">Helpdesk History</h5>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="col-12 p-1">
                    {
                        customerDetails?.customerId &&
                        <HelpdeskHistory
                            data={{
                                customerId: customerDetails?.customerId,
                                isScroll: isScroll
                            }}
                        />
                    }
                </div>
            </div>
            <div className="col-12 p-0 pagebreak">
                <div className="mt-2 col-12 p-0">
                    <section className="triangle col-12">
                        <div className="row col-12">
                            <div className="col-12">
                                <h5 className="pl-3">Payment History</h5>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="col-12 p-1">
                    {
                        selectedAccount && selectedAccount?.accountNo ?
                            <PaymentHistory
                                data={{
                                    isScroll: isScroll,
                                    data: selectedAccount?.accountNo,
                                }}
                            />
                            :
                            <span className="msg-txt pt-1">No Payment History Available</span>
                    }
                </div>
            </div>
            <div className="mt-2 col-12 p-0">
                <section className="triangle col-12">
                    <div className="row col-12">
                        <div className="col-12">
                            <h5 className="pl-3">Accounts</h5>
                        </div>
                    </div>
                </section>
            </div>
            <div className="pt-1 pagebreak">
                {
                    (accountIdList && accountIdList.length > 0) ?
                        <div>
                            <div className="row">
                                <div className="col-md-12">
                                    <Tabs defaultActiveKey={accountNo} type="card">
                                        {
                                            accountIdList.map((e) => {
                                                return (
                                                    <TabPane
                                                        tab={
                                                            <div className="account-sec">
                                                                <div className="nav nav-tabs">
                                                                    <div id={e?.accountId} key={e?.accountId} className={"nav-item pl-0 " + ((e?.accountId === selectedAccount?.accountId) ? "active" : "")}>
                                                                        <button key={e?.accountId} className={"nav-link font-17 bolder " + ((e?.accountId === selectedAccount?.accountId) ? "active" : "")} role="tab" >
                                                                            <div className="tabs" style={(e?.accountId === selectedAccount?.accountId) ? { color: "orange" } : {}}>Account&nbsp;{(e?.status === 'PENDING') ? 'Pending' : (e?.accountNo) ? e?.accountNo : e?.accountId + ' (Id)'}</div>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        }
                                                        key={Number(e?.accountNo)}
                                                    >
                                                        <div className="bg-light  p-2">
                                                            <div className="form-row bg-light ml-0 mr-0">
                                                                <div className="form-row border col-md-12 p-0 ml-0 mr-0">
                                                                    <div className="col-md-12 card-box m-0 p-0">
                                                                        {
                                                                            (accountDetails && accountDetails?.accountId && accountDetails?.accountId !== '' && userPermission) ?
                                                                                <AccountDetailsView
                                                                                    data={{
                                                                                        userPermission,
                                                                                        customerType: customerDetails?.customerType,
                                                                                        billableDetails: customerDetails?.billableDetails,
                                                                                        accountData: accountDetails,
                                                                                        accountRealtimeDetails: accountRealtimeDetails,
                                                                                        newAccountAddded: newAccountAddded,
                                                                                        setNewAccountAdded: () => { },
                                                                                        openBillHistoryModal: false,
                                                                                        setOpenBillHistoryModal: () => { },
                                                                                        pageRefresh: () => { }
                                                                                    }}
                                                                                />
                                                                                :
                                                                                <></>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TabPane>
                                                )
                                            })
                                        }
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                        :
                        <span className="msg-txt p-1">No Accounts Available</span>
                }
            </div>
            <section className="triangle col-md-12">
                <div className="row col-md-12">
                    <div className="col-md-8">
                        <h5 className="pl-1">Services</h5>
                    </div>
                </div>
            </section>
            <div className="row col-12 p-2">
                <div className="col-12 pl-2 ml-2 mr-2 bg-light border">
                    <div className="row">
                        <div className="col-6">
                            <h5 className="text-primary">Catalogs</h5>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card ml-2 mr-2">
                <div className="card-body">
                    {
                        !!catalogList?.length ?
                            <div className="bg-secondary p-1">
                                <Slider {...catalogSettings} className="px-4">
                                    {
                                        catalogList.map((catalog, idx) =>
                                            <CatalogCard data={catalog} handleOnManageService={() => { }} key={activeService || idx} activeService={activeService} setActiveService={() => { }} />
                                        )
                                    }
                                </Slider>
                            </div>
                            :
                            <span className="msg-txt">No Catalog Available</span>
                    }
                </div>
            </div>
            <div className="row col-12 p-2">
                <div className="col-12 pl-2 ml-2 mr-2 bg-light border">
                    <div className="row">
                        <div className="col-6">
                            <h5 className="text-primary">Plans, Services & Assets</h5>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 py-2 ml-2 mr-2">
                {/* <Slider {...settings} className="px-4"> */}
                    {
                        !!planServiceAssetList.length ?
                            planServiceAssetList.map((data, idx) =>
                                <PlanServiceAssetCard data={data} handleOnManageService={() => { }} key={activeService || idx} activeService={activeService} setActiveService={() => { }} />
                            )
                            :
                            <span className="msg-txt">No Plan, Services & Assets Available</span>
                    }
                {/* </Slider> */}
            </div>
            <div className="mt-2 col-12 p-0">
                <section className="triangle col-12">
                    <div className="row col-12">
                        <div className="col-12">
                            <h5 className="pl-3">Order History</h5>
                        </div>
                    </div>
                </section>
            </div>
            <div className="col-md-12 pl-2 pr-2 pt-2 pb-1">
                <div className="form-row ml-0 mr-0">
                    <div className="form-row col-md-12 p-0 ml-0 mr-0">
                        <div className="col-md-12 mr- pr-2">
                            <ServiceRequestList
                                data={{
                                    isScroll: isScroll,
                                    customerDetails: customerDetails,
                                    leftNavCounts: leftNavCounts,
                                    refreshServiceRequest: false,
                                    selectedAccount: selectedAccount,
                                    activeService: activeService
                                }}

                                handler={{
                                    setLeftNavCounts: () => { }
                                }}
                            />

                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-2 col-12 p-0">
                <section className="triangle col-12">
                    <div className="row col-12">
                        <div className="col-12">
                            <h5 className="pl-3">Incident History</h5>
                        </div>
                    </div>
                </section>
            </div>
            <div className="col-md-12 pl-2 pr-2 pt-2 pb-1">
                <div className="form-row ml-0 mr-0">
                    <div className="form-row col-md-12 p-0 ml-0 mr-0">
                        <div className="col-md-12 m-0 p-0">
                            <ComplaintList
                                data={{
                                    isScroll: isScroll,
                                    customerDetails: customerDetails,
                                    leftNavCounts: leftNavCountsComplaint,
                                    refreshComplaint: false,
                                    selectedAccount: selectedAccount,
                                    activeService: activeService
                                }}
                                handler={{
                                    setLeftNavCounts: () => { }
                                }}
                            />

                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-2 col-12 p-0">
                <section className="triangle col-12">
                    <div className="row col-12">
                        <div className="col-12">
                            <h5 className="pl-3">Lead History</h5>
                        </div>
                    </div>
                </section>
            </div>
            <div className="col-md-12 pl-2 pr-2 pt-2 pb-1">
                <div className="form-row ml-0 mr-0">
                    <div className="form-row col-md-12 p-0 ml-0 mr-0">
                        <div className="col-md-12 m-0 p-0">
                            <InquiryList
                                data={{
                                    isScroll: isScroll,
                                    customerDetails: customerDetails,
                                    leftNavCounts: leftNavCountsInquiry,
                                    refreshInquiry: false,
                                    selectedAccount: selectedAccount,
                                    activeService: activeService
                                }}
                                handler={{
                                    setLeftNavCounts: () => { }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>


        </>
    )
}

export default Pdf360View;