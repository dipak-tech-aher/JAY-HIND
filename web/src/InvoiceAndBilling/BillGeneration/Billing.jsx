import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import { properties } from '../../properties';
import { post, get } from '../../common/util/restUtil';
import { AppContext } from '../../AppContext';
import BillCycleOrYear from './BillCycleOrYear';
import GenerateInvoice from './BillingTabs/GenerateInvoice/GenerateInvoice';
import PreviewInvoice from './BillingTabs/PreviewInvoice/PreviewInvoice';
import SubmitInvoice from './BillingTabs/SubmitInvoice/SubmitInvoice';
import ViewContract from './BillingTabs/ViewContract/ViewContract';
import ReviewContract from './BillingTabs/ReviewContract/ReviewContract';
import ViewWorkflowModal from './ViewWorkflowModal';

const Billing = (props) => {

    const tabs = [
        {
            name: 'View Contract',
            index: 0
        },
        {
            name: 'Review Contract',
            index: 1
        },
        {
            name: 'Generate Invoice',
            index: 2
        },
        {
            name: 'Preview Invoice',
            index: 3
        },
        {
            name: 'Submit Invoice',
            index: 4
        }
    ];

    const months = [
        "January", "February",
        "March", "April", "May",
        "June", "July", "August",
        "September", "October",
        "November", "December"
    ];
    const { auth } = useContext(AppContext)
    const [userPermission, setUserPermission] = useState({ generateInvoice: false })
    // For Parent State
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [isViewWorflowOpen, setIsViewWorflowOpen] = useState(false);
    const [workflowData, setWorkflowData] = useState([]);
    const [billingReadOnly, setBillingReadOnly] = useState(false);
    const [billingGenerated, setBillingGenerated] = useState(false);

    // For View Contract & Review Contract Component
    const [viewContractTotalRowCount, setViewContractTotalRowCount] = useState(0);
    const [viewContractPerPage, setViewContractPerPage] = useState(10);
    const [viewContractCurrentPage, setViewContractCurrentPage] = useState(0);

    const [viewContractList, setViewContractList] = useState([]);
    const [viewContractRegenerateCount, setViewContractRegenerateCount] = useState(0);
    const [viewContractCounts, setViewContractCounts] = useState({
        contractCount: "0",
        contractValue: "0",
        revenue: "0",
        customers: "0",
        newCustomers: "0",
        rcAmount: "0",
        nrcAmount: "0",
        usageAmount: "0"
    });
    const [viewContractInputs, setViewContractInputs] = useState({
        soNumber: "",
        contractId: "",
        customerNumber: "",
        customerName: "",
        billRefNo: "",
        billRefName: "",
        startDate: "",
        endDate: "",
    });

    const [submitInvoiceInputs, setSubmitInvoiceInputs] = useState({
        uploadLocation: ""
    });

    // For Billing Cycle Or Year
    const lookupData = useRef(undefined);
    const currentBillCycleYear = useRef(undefined);
    const [billPeriodLookup, setBillPeriodLookup] = useState([{ code: "BP_MONTHLY", description: "Monthly" }]);
    const [billYearLookup, setBillYearLookup] = useState([]);
    const [selectionOptionLookup, setSelectionOptionLookup] = useState([]);
    const [billCycleLookup, setBillCycleLookup] = useState([]);

    const [billSelectionInputs, setBillSelectionInputs] = useState({
        billCycle: "",
        billPeriod: "",
        billYear: "",
        billPeriodOption: ""
    });

    const [listSearch, setListSearch] = useState([]);

    useEffect(() => {
        // if (props.data === undefined) { setIsOpen(false) }
        let rolePermission = []

        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)

            if (property[0] === "Invoice") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, invoice: Object.values(value[0]) }
            }
        })

        let createInvoice;

        rolePermission?.invoice?.map((screen) => {
            if (screen.screenName === "Generate Invoice") {
                createInvoice = screen.accessType
            }

        })
        setUserPermission({ generateInvoice: createInvoice })


    }, [auth])

    useEffect(() => {
        getCurrentBillCycleYear();
        getViewContractCountData();
        getViewContractRegenerateCountData();
        getGenerateInvoiceCountData();
        getPreviewInvoiceCounts();
    }, [])

    useEffect(() => {
        getViewContractData()
    }, [viewContractPerPage, viewContractCurrentPage])

    const handleOnBillSelectionInputs = (e) => {
        const { target } = e;
        setBillSelectionInputs({
            ...billSelectionInputs,
            [target.id]: target.value
        })
    }

    // Handlers For View Contract 
    const getViewContractData = () => {

        let requestBody = {
            ...viewContractInputs
        }
        requestBody = Object.entries(requestBody).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {})

        setListSearch(requestBody);
        // post(`${properties.CONTRACT_API}/unbilled/search?limit=${viewContractPerPage}&page=${viewContractCurrentPage}`, requestBody)
        post(`${properties.CONTRACT_API}/unbilled?limit=${viewContractPerPage}&page=${viewContractCurrentPage}`, requestBody)

            .then((response) => {
                if (response.data) {
                    const { rows, count } = response.data;
                    unstable_batchedUpdates(() => {
                        setViewContractTotalRowCount(count);
                        setViewContractList(rows);
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    };

    const getViewContractCountData = useCallback(() => {

        get(`${properties.CONTRACT_API}/count`)
            .then((response) => {
                if (response.data) {
                    setViewContractCounts(response.data)
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [])

    const getViewContractRegenerateCountData = useCallback(() => {

        get(`${properties.CONTRACT_API}/re-generate`)
            .then((response) => {
                if (response.data) {
                    setViewContractRegenerateCount(Number(response.data.count));
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, []);

    const getCurrentBillCycleYear = useCallback(() => {

        get(`${properties.BILLING_API}/current/cycle`)
            .then((response) => {
                if (response.status === 200) {
                    const { data } = response;
                    currentBillCycleYear.current = data;
                    unstable_batchedUpdates(() => {
                        setBillYearLookup(Array({ code: data?.year, description: data?.year }));
                        setSelectionOptionLookup(Array({ code: months[data?.month], description: months[data?.month] }));
                        setBillCycleLookup(Array({ code: data?.cycle, description: data?.cycle }));
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, []);

    const handleOnViewContractsInputsChange = useCallback((e) => {
        const { target } = e;
        setViewContractInputs({
            ...viewContractInputs,
            [target.id]: target.value
        })
    }, [viewContractInputs])

    const handleOnViewContractSearch = useCallback(() => {
        unstable_batchedUpdates(() => {
            setViewContractPerPage(10);
            setViewContractCurrentPage((viewContractCurrentPage) => {
                if (viewContractCurrentPage === 0) {
                    return '0'
                }
                return 0
            });
        })
    }, []);

    const handleViewContractPageSelect = useCallback((pageNo) => {
        setViewContractCurrentPage(pageNo)
    }, [])
    // End of Hanlers for View Contract


    // For Preview Invoice 
    const [previewInvoiceTotalRowCount, setPreviewInvoiceTotalRowCount] = useState(0);
    const [previewInvoicePerPage, setPreviewInvoicePerPage] = useState(10);
    const [previewInvoiceCurrentPage, setPreviewInvoiceCurrentPage] = useState(0);

    const [previewInvoiceCounts, setPreviewInvoiceCounts] = useState({
        totalAdvanceAmount: "0",
        totalOutstandingAmount: "0",
        totalInvoiceAmount: "0",
        totalPreviousBalanceAmount: "0"
    });
    const [previewInvoiceList, setPreviewInvoiceList] = useState([])
    const [previewInvoiceInputs, setPreviewInvoiceInputs] = useState({
        invoiceId: "",
        customerNumber: "",
        customerName: "",
        billRefNo: "",
        invoiceStartDate: null,
        invoiceEndDate: null,
    });

    useEffect(() => {
        getPreviewInvoiceList();
    }, [previewInvoicePerPage, previewInvoiceCurrentPage, billCycleLookup])


    const getPreviewInvoiceList = () => {
        if(!currentBillCycleYear.current?.year || !currentBillCycleYear.current?.cycle ){
            return
        }

        let requestBody = {
            ...previewInvoiceInputs,
            billYear: currentBillCycleYear.current?.year,
            billCycle: currentBillCycleYear.current?.cycle  
        }
        requestBody = Object.entries(requestBody).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {})

        setListSearch(requestBody);
        // post(`${properties.INVOICE_API}/search?limit=${previewInvoicePerPage}&page=${previewInvoiceCurrentPage}&screen=billing`, requestBody)
        post(`${properties.INVOICE_API}/search?limit=${previewInvoicePerPage}&page=${previewInvoiceCurrentPage}`, requestBody)

            .then((response) => {
                if (response.data) {
                    const { count, rows } = response.data;
                    unstable_batchedUpdates(() => {
                        setPreviewInvoiceTotalRowCount(count)
                        setPreviewInvoiceList(rows)
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const getPreviewInvoiceCounts = () => {
        if(!currentBillCycleYear.current?.year || !currentBillCycleYear.current?.cycle ){
            return
        }

        let requestBody = {
            billingStatus: 'PENDING',
            billYear: currentBillCycleYear.current?.year,
            billCycle: currentBillCycleYear.current?.cycle  
        }
        post(`${properties.INVOICE_API}/invoice-count`, requestBody)
            .then((response) => {
                if (response.data) {
                    const { count, rows } = response.data;
                    const { advanceTotal, invOsAmtTotal, invAmtTotal, PreviousBalance, totalOutstanding } = rows[0];
                    setPreviewInvoiceCounts({
                        totalAdvanceAmount: advanceTotal,
                        totalOutstandingAmount: totalOutstanding,
                        totalInvoiceAmount: invAmtTotal,
                        totalPreviousBalanceAmount: PreviousBalance
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    // End of Preview Invoice

    // Generate Invoice
    const [generateInvoiceCounts, setGenerateInvoiceCounts] = useState({
        potentialInvoiceCount: "0",
        potentialRevenue: "0",
        potentialRc: "0",
        potentialNrc: "0",
        potentialUsageValue: "0",
        invoiceCycleNo: "0",
        invoiceRegenCnt: "0"
    });

    const [generateList, setGenerateList] = useState([]);

    const getGenerateInvoiceCountData = useCallback(() => {
        const { billYear, billCycle } = billSelectionInputs
        const requestBody = {
            billYear,
            billCycle,
            invoiceStatus: 'OPEN',
            status: [
                "PENDING",
                "UNBILLED",
                "REGENERATE"
            ]
        }

        post(`${properties.INVOICE_API}/counts`, requestBody)
            .then((response) => {
                if (response.data) {
                    const { thisMonthProcess } = response.data;
                    unstable_batchedUpdates(() => {
                        setGenerateInvoiceCounts({
                            ...generateInvoiceCounts,
                            ...response.data.counts[0],
                            //potentialInvoiceCount: thisMonthProcess?.totalProcessed ? thisMonthProcess.totalProcessed : '0',
                            invoiceCycleNo: thisMonthProcess?.invoiceCycleNo ? thisMonthProcess.invoiceCycleNo : '0',
                            //invoiceRegenCnt: thisMonthProcess[0]?.invoiceRegenCnt && thisMonthProcess[0]?.billingStatus === 'PENDING' ? thisMonthProcess[0].invoiceRegenCnt : '0'
                        });
                        setGenerateList(thisMonthProcess);
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [generateInvoiceCounts]);

    const handleOnGenerateInvoice = useCallback((e) => {

        post(properties.INVOICE_API + '/create')
            .then((response) => {
                if (response.data) {
                    unstable_batchedUpdates(() => {
                        setGenerateInvoiceCounts({
                            ...generateInvoiceCounts,
                            invoiceCycleNo: response.data.invoiceCycleNo,
                            invoiceRegenCnt: response.data.invoiceRegenCnt
                        })
                        setGenerateList(Array(response.data));
                        setViewContractCurrentPage(0);
                        setPreviewInvoiceCurrentPage(0);
                        setBillingGenerated(true)
                        doSoftRefreshForList();
                    })
                }
                getGenerateInvoiceCountData();
                getPreviewInvoiceList();
                getPreviewInvoiceCounts();
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [generateInvoiceCounts])

    //End of Generate Invoice

    const handleOnTabChange = useCallback((selectedTab) => {
        setActiveTab(selectedTab);
    }, [])

    const handleOnPreviousNext = useCallback((e) => {
        const { target } = e;
        if (target.id === 'prev') {
            setActiveTab(tabs[--activeTab.index])
        }
        else {
            setActiveTab(tabs[++activeTab.index]);
        }
    }, [activeTab.index])

    const doSoftRefreshForContract = useCallback(() => {
        getViewContractData();
        getViewContractCountData();
        getViewContractRegenerateCountData();
    }, [])

    const doSoftRefreshForList = useCallback(() => {
        getViewContractData();
       // getPreviewInvoiceList();
    }, [])

    const handleOnSubmitInvoiceInputsChange = (e) => {
        const { target } = e;
        setSubmitInvoiceInputs({
            ...submitInvoiceInputs,
            [target.id]: target.value
        })
    }

    const handleOnViewContractsInputsClear = () => {
        setViewContractInputs({
            contractId: "",
            customerNumber: "",
            customerName: "",
            billRefNo: "",
            billRefName: "",
            startDate: "",
            endDate: "",
            soNumber: ""
        })
        handleOnViewContractSearch()
    }

    return (
        <div className="container-fluid">
            <div className="row justify-content-center align-items-center">
                {/* <div className="col mx-auto">
                    <div className="page-title-box">
                        <h4 className="page-title">Billing</h4>
                    </div>
                </div>
                <div className="col-auto mx-auto">
                    <div className="pt-2 cursor-pointer">
                        <p className="m-0" onClick={() => setIsViewWorflowOpen(true)}>View Workflow</p>
                    </div>
                </div> */}
            </div>
            <BillCycleOrYear
                data={{
                    billPeriodLookup,
                    billYearLookup,
                    selectionOptionLookup,
                    billCycleLookup,
                    billSelectionInputs: { ...billSelectionInputs, billPeriod: 'BP_MONTHLY', billYear: currentBillCycleYear.current?.year, billPeriodOption: months[currentBillCycleYear.current?.month], billCycle: currentBillCycleYear.current?.cycle },
                    readOnly: true
                }}
                handler={{
                    handleOnBillSelectionInputs
                }}
            />
            <div className="p-0">
                <div className="col-lg-12 p-0">
                    <div className="col-lg-12 p-0">
                        <div className="search-result-box card-box">
                            <div>
                                <div className="card-body">
                                    <div id="basicwizard">
                                        <ul className="nav nav-pills bg-light nav-justified form-wizard-header">
                                            {
                                                tabs.map((tab, index) => (
                                                    <li key={tab.name} className="nav-item">
                                                        <div className={`nav-link rounded-0 pt-2 pb-2 cursor-pointer ${activeTab.index === index ? 'active' : ''}`} onClick={() => handleOnTabChange(tab)}>
                                                            <span className="number mr-1">{++index}</span>
                                                            <span className="d-sm-inline">{tab.name}</span>
                                                        </div>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                        <div className="tab-content p-0">
                                            <div className="tab-pane active" id={activeTab.name}>
                                                {
                                                    activeTab?.index === 0 ?
                                                        <ViewContract
                                                            data={{
                                                                viewContractInputs,
                                                                viewContractList,
                                                                viewContractCounts,
                                                                viewContractTotalRowCount,
                                                                viewContractPerPage,
                                                                viewContractCurrentPage,
                                                                viewContractRegenerateCount,
                                                                listSearch
                                                            }}
                                                            isReview={false}
                                                            handler={{
                                                                handleOnViewContractsInputsChange,
                                                                handleOnViewContractSearch,
                                                                handleViewContractPageSelect,
                                                                setViewContractPerPage,
                                                                setViewContractCurrentPage,
                                                                doSoftRefreshForContract,
                                                                handleOnViewContractsInputsClear
                                                            }}
                                                        />
                                                        : activeTab?.index === 1 ?
                                                            <ReviewContract
                                                                data={{
                                                                    viewContractInputs,
                                                                    viewContractList,
                                                                    viewContractCounts,
                                                                    viewContractTotalRowCount,
                                                                    viewContractPerPage,
                                                                    viewContractCurrentPage,
                                                                    viewContractRegenerateCount,
                                                                    billingReadOnly,
                                                                    listSearch
                                                                }}
                                                                isReview={true}
                                                                handler={{
                                                                    handleOnViewContractsInputsChange,
                                                                    handleOnViewContractSearch,
                                                                    handleViewContractPageSelect,
                                                                    setViewContractPerPage,
                                                                    setViewContractList,
                                                                    setViewContractCurrentPage,
                                                                    doSoftRefreshForContract,
                                                                    handleOnViewContractsInputsClear,
                                                                    getViewContractData
                                                                }}
                                                            />
                                                            : activeTab?.index === 2 ?
                                                                <GenerateInvoice
                                                                    data={{
                                                                        generateInvoiceCounts,
                                                                        generateList,
                                                                        billingReadOnly
                                                                    }}
                                                                    handler={{
                                                                        handleOnGenerateInvoice
                                                                    }}
                                                                />
                                                                : activeTab?.index === 3 ?
                                                                    <PreviewInvoice
                                                                        data={{
                                                                            previewInvoiceList,
                                                                            previewInvoiceInputs,
                                                                            previewInvoiceTotalRowCount,
                                                                            previewInvoicePerPage,
                                                                            previewInvoiceCurrentPage,
                                                                            previewInvoiceCounts,
                                                                            listSearch
                                                                        }}
                                                                        handler={{
                                                                            setPreviewInvoicePerPage,
                                                                            setPreviewInvoiceCurrentPage,
                                                                            setPreviewInvoiceInputs
                                                                        }}
                                                                    />
                                                                    :
                                                                    <SubmitInvoice
                                                                        data={{
                                                                            submitInvoiceInputs,
                                                                            previewInvoiceCounts,
                                                                            generateData: generateList,
                                                                            billingReadOnly,
                                                                            billingGenerated
                                                                        }}
                                                                        handler={{
                                                                            handleOnSubmitInvoiceInputsChange,
                                                                            setBillingReadOnly
                                                                        }}
                                                                    />
                                                }
                                            </div>
                                        </div>
                                        <ul className="list-inline wizard mt-2 mb-2">
                                            <li className="previous list-inline-item disabled">
                                                {
                                                    activeTab.index === 0 ?
                                                        <>
                                                        </>
                                                        :
                                                        <button className="skel-btn-cancel" id='prev' disabled={activeTab.index === 0} onClick={handleOnPreviousNext}>Previous</button>
                                                }

                                            </li>
                                            {
                                                activeTab.index === 4 ?
                                                    <>
                                                    </>
                                                    :
                                                    <li className="next list-inline-item float-right">
                                                        <button className="skel-btn-submit" id='next' disabled={activeTab.index === 4} onClick={handleOnPreviousNext}>Next</button>
                                                    </li>
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ViewWorkflowModal isViewWorflowOpen={isViewWorflowOpen} setIsViewWorflowOpen={setIsViewWorflowOpen} workflowData={workflowData} />
        </div>
    )
}

export default Billing;