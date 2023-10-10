import React from 'react';
import SearchContract from '../../Contract/SearchContract';
import SearchInvoice from '../../Invoice/SearchInvoice';
import AccountOverview from './AccountOverview';
import AdjustmentHistory from './AdjustmentHistory';
import PaymentHistory from './PaymentHistory';

const PdfARView = (props) => {
    const { customerData, accountData } = props.location.state.data;
    return (
        <>
            <div className="row">
                <section className="triangle col-12">
                    <div className="row m-0">
                        <div className="col-12">
                            <h4 id="list-item-0" className="pl-1">Billable Reference Number : {accountData[0]?.billRefNo}  -  {accountData[0]?.customerName}</h4>
                        </div>
                    </div>
                </section>
            </div>
            <AccountOverview
                data={{
                    accountData,
                    customerData,
                    refresh: false,
                    isPrintView: true
                }}
                handler={{
                    setCustomerData: () => { },
                    pageRefresh: () => { }
                }}
            />
            <div className="row pt-1">
                <section className="triangle col-12">
                    <div className="row m-0">
                        <div className="col-10">
                            <h4 id="list-item-1">Contract</h4>
                        </div>
                    </div>
                </section>
            </div>
            <SearchContract
                data={{
                    data: { billRefNo: accountData[0]?.billRefNo },
                    hideForm: true,
                    contractType: "billed",
                    refresh: false,
                    from: "AccountView"
                }}
                handler={{
                    pageRefresh: () => { }
                }}
            />
            <div className="row pt-1">
                <section className="triangle col-12">
                    <div className="row m-0">
                        <div className="col-12">
                            <h4 id="list-item-2" className="pl-1">Unbilled Contract</h4>
                        </div>
                    </div>
                </section>
            </div>
            <div className="pagebreak">
            <SearchContract
                data={{
                    data: { billRefNo: accountData[0]?.billRefNo },
                    hideForm: true,
                    contractType: "unbilled",
                    refresh: false,
                    from: "AccountView"
                }}
                handler={{
                    pageRefresh: () => { }
                }}
            />
            </div>
            <div className="row pt-1">
                <section className="triangle col-12">
                    <div className="row m-0">
                        <div className="col-12">
                            <h4 id="list-item-3" className="pl-1">Contract History</h4>
                        </div>
                    </div>
                </section>
            </div>
            <SearchContract
                data={{
                    data: { billRefNo: accountData[0]?.billRefNo },
                    hideForm: true,
                    contractType: "history",
                    refresh: false,
                    from: "AccountView"
                }}
                handler={{
                    pageRefresh: () => { }
                }}
            />
            <div className="row pt-1">
                <section className="triangle col-12">
                    <div className="row m-0">
                        <div className="col-12">
                            <h4 id="list-item-4" className="pl-1">Invoice</h4>
                        </div>
                    </div>
                </section>
            </div>
            <SearchInvoice
                data={{
                    data: { billRefNo: accountData[0]?.billRefNo },
                    hideForm: true,
                    refresh: false
                }}
            />
            <div className="row pt-1">
                <section className="triangle col-12">
                    <div className="row m-0">
                        <div className="col-12">
                            <h4 id="list-item-5" className="pl-1">Payment History</h4>
                        </div>
                    </div>
                </section>
            </div>
            <PaymentHistory
                data={{
                    data: accountData[0]?.billRefNo,
                    refresh: () => { }
                }}
            />
            <div className="row pt-1">
                <section className="triangle col-12">
                    <div className="row m-0">
                        <div className="col-10">
                            <h4 id="list-item-6">Adjusment History</h4>
                        </div>

                    </div>
                </section>
            </div>
            <AdjustmentHistory
                data={{
                    data: accountData,
                    refresh: false
                }}
            />
        </>
    )
}

export default PdfARView;