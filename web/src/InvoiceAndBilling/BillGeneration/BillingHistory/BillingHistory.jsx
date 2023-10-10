import React, { useRef, useState, useEffect, useCallback, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import { properties } from '../../../properties';
import { get, post } from '../../../common/util/restUtil';
import BillCycleOrYear from '../BillCycleOrYear';
import ViewContract from '../BillingTabs/ViewContract/ViewContract';
import GenerateInvoice from '../BillingTabs/GenerateInvoice/GenerateInvoice';
import PreviewInvoice from '../BillingTabs/PreviewInvoice/PreviewInvoice';
import SubmitInvoice from '../BillingTabs/SubmitInvoice/SubmitInvoice';
import { AppContext } from '../../../AppContext';
import { removeEmptyKey } from '../../../common/util/util';
import { toast } from 'react-toastify';
const BillingHistory = (props) => {
    const { auth } = useContext(AppContext)
    const [userPermission, setUserPermission] = useState({ billingHistory: false })
    const tabs = [
        {
            name: 'View Contract',
            index: 0
        },
        {
            name: 'Generate Invoice',
            index: 1
        },
        {
            name: 'Preview Invoice',
            index: 2
        },
        {
            name: 'Submit Invoice',
            index: 3
        }
    ];

    const lookupData = useRef({
        selectionOptions: {
            BP_HFYEARLY: [{ code: JSON.stringify(["01", "02", "03", "04", "05", "06"]), description: 'First-Half' }, { code: JSON.stringify(["07", "08", "09", "10", "11", "12"]), description: 'Second-Half' }],
            BP_QTYEARLY: [{ code: JSON.stringify(["01", "02", "03"]), description: 'First-Quater' }, { code: JSON.stringify(["04", "05", "06"]), description: 'Second-Quater' }, { code: JSON.stringify(["07", "08", "09"]), description: 'Third-Quater' }, { code: JSON.stringify(["10", "11", "12"]), description: 'Fourth-Quater' }],
            BP_YEARLY: [],
            BP_MONTHLY: [
                {
                    description: "January",
                    code: "01"
                },
                {
                    description: "February",
                    code: "02"
                },
                {
                    description: "March",
                    code: "03"
                },
                {
                    description: "April",
                    code: "04"
                },
                {
                    description: "May",
                    code: "05"
                },
                {
                    description: "June",
                    code: "06"
                },
                {
                    description: "July",
                    code: "07"
                },
                {
                    description: "August",
                    code: "08"
                },
                {
                    description: "September",
                    code: "09"
                },
                {
                    description: "October",
                    code: "10"
                },
                {
                    description: "November",
                    code: "11"
                },
                {
                    description: "December",
                    code: "12"
                }
            ],
            lastSixBillCycle: []
        }
    });

    const [activeTab, setActiveTab] = useState(tabs[0]);

    const [billPeriodLookup, setBillPeriodLookup] = useState([]);
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

            if (property[0] === "Billing") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, billing: Object.values(value[0]) }
            }
        })

        let history;

        rolePermission?.billing?.map((screen) => {
            if (screen.screenName === "Bill History") {
                history = screen.accessType
            }

        })
        setUserPermission({ billingHistory: history })


    }, [auth])
    useEffect(() => {
        getBillingLookup();
    }, [])

    const getBillingLookup = useCallback(() => {

        get(`${properties.BILLING_API}/lookup`)
            .then((response) => {
                if (response.data) {
                    lookupData.current = { ...lookupData.current, ...response.data };
                    setBillPeriodLookup(lookupData.current.billPeriod);
                    lookupData.current.billYear = lookupData.current.billYear?.map((year) => ({ code: year, description: year }));
                    lookupData.current.billCycle.forEach((cycleObject) => {
                        Object.values(cycleObject).forEach((cycle, i) => {
                            Object.values(cycle).forEach((subCycle) => {
                                let key = Object.keys(subCycle);
                                let value = Object.values(subCycle);
                                subCycle[key[0]] = { code: value[0], description: value[0] }
                            })
                        })
                    })
                    lookupData.current.sixMonthsCycle = lookupData.current?.sixMonthsCycle.filter((val, index) => lookupData.current?.sixMonthsCycle.indexOf(val) === index)
                        .map((data) => ({ code: data, description: data }));
                    const billingCycleInfo = lookupData.current.billingCycle.map((ele) => ({ code: ele, description: ele }))
                    setBillCycleLookup(billingCycleInfo)
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()

    }, [])

    const handleOnBillSelectionInputs = (e) => {
        const { target } = e;
        if (target.id === 'billPeriod') {
            unstable_batchedUpdates(() => {
                if (target.value !== "") {
                    setBillYearLookup(lookupData.current.billYear);
                }
                else {
                    setBillYearLookup([]);
                    setSelectionOptionLookup([]);
                }
                setBillSelectionInputs({
                    ...billSelectionInputs,
                    billYear: "",
                    billCycle: "",
                    billPeriodOption: "",
                    [target.id]: target.value
                })
            })
        }
        else if (target.id === 'billYear') {
            unstable_batchedUpdates(() => {
                if (target.value !== "") {
                    if (billSelectionInputs.billPeriod === "BP_YEARLY") {
                        let billCycles = lookupData.current.billCycle.find((data) => data[target.value])[target.value]
                            .map((data) => Object.values(data));
                        setBillCycleLookup(billCycles.flat());
                    }
                    else {
                        setSelectionOptionLookup(lookupData.current.selectionOptions[billSelectionInputs.billPeriod])
                    }
                }
                else {
                    setSelectionOptionLookup([]);
                    setBillCycleLookup([]);
                }
                setBillSelectionInputs({
                    ...billSelectionInputs,
                    billPeriodOption: "",
                    billCycle: "",
                    [target.id]: target.value
                })
            })
        }
        else if (target.id === 'billPeriodOption') {
            unstable_batchedUpdates(() => {
                if (target.value !== "") {
                    let billCycles = [];
                    lookupData.current.billCycle.find((data) => data[billSelectionInputs.billYear])[billSelectionInputs.billYear]
                        .forEach((data) => {
                            Object.keys(data).some((item) => {
                                let isTrue = false;
                                if (target.value.includes(item)) {
                                    isTrue = true;
                                    billCycles.push(data[item]);
                                }
                                return isTrue;
                            })
                        })
                    setBillCycleLookup(billCycles)
                }
                else {
                    setBillCycleLookup([]);
                }
                setBillSelectionInputs({
                    ...billSelectionInputs,
                    billCycle: "",
                    [target.id]: target.value
                })
            })
        }
        else {
            setBillSelectionInputs({
                ...billSelectionInputs,
                [target.id]: target.value
            })
        }
    }

    const handleOnBillingCycleSubmit = () => {
        getBillingHistory();
        getSubmitInvoiceCounts();
        getInvoiceListData();
    }

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

    // For View Contract

    const isViewContractFirstRender = useRef(true);
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
        contractId: "",
        customerNumber: "",
        customerName: "",
        billRefNo: "",
        billRefName: "",
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        if (!isViewContractFirstRender.current) {
            getBillingHistory();
        }
    }, [viewContractCurrentPage, viewContractPerPage])

    const handleOnViewContractsInputsChange = useCallback((e) => {
        const { target } = e;
        setViewContractInputs({
            ...viewContractInputs,
            [target.id]: target.value
        })
    }, [viewContractInputs])

    const handleOnViewContractSearch = () => {
        unstable_batchedUpdates(() => {
            setViewContractPerPage(10);
            setViewContractCurrentPage((viewContractCurrentPage) => {
                if (viewContractCurrentPage === 0) {
                    return '0'
                }
                return 0
            });
        })
    };

    const handleViewContractPageSelect = useCallback((pageNo) => {
        setViewContractCurrentPage(pageNo)
    }, [])

    const getBillingHistory = () => {

        const { billYear, billCycle, billPeriodOption } = billSelectionInputs;
        let requestBody = {
            ...viewContractInputs,
            // billPeriod,
            billYear,
            billCycle,
            billMonth: billPeriodOption
        }
        requestBody = removeEmptyKey(requestBody)
        setListSearch(requestBody);
        post(`${properties.CONTRACT_API}/billed?limit=${viewContractPerPage}&page=${viewContractCurrentPage}`, requestBody)
            .then((response) => {
                if (response?.data) {
                    const { count, rows, counts } = response.data;
                    if (count > 0) {
                        unstable_batchedUpdates(() => {
                            setViewContractTotalRowCount(count);
                            setViewContractList(rows);
                            setViewContractCounts(counts);
                        })
                    } else {
                        toast.info('No records Found')
                    }
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }
    // End of View Contract

    // For Generate Invoice
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
    // End of Generate Invoice

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
    const [previewInvoiceList, setPreviewInvoiceList] = useState([]);
    const [previewInvoiceInputs, setPreviewInvoiceInputs] = useState({
        invoiceId: "",
        customerNumber: "",
        customerName: "",
        billRefNo: "",
        invoiceStartDate: "",
        invoiceEndDate: "",
    });

    useEffect(() => {
        if (!isViewContractFirstRender.current) {
            getInvoiceListData();
        }
        else {
            isViewContractFirstRender.current = false;
        }
    }, [previewInvoiceCurrentPage, previewInvoicePerPage])

    const getInvoiceListData = () => {

        const { billYear, billCycle } = billSelectionInputs;
        let requestBody = {
            billYear,
            billCycle,
            ...previewInvoiceInputs
        }
        requestBody = removeEmptyKey(requestBody);
        setListSearch(requestBody);
        post(`${properties.INVOICE_API}/search?limit=10&page=0`, requestBody)
            .then((response) => {
                if (response.data) {
                    const { count, rows } = response.data;
                    unstable_batchedUpdates(() => {
                        setPreviewInvoiceTotalRowCount(count);
                        setPreviewInvoiceList(rows);
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const getSubmitInvoiceCounts = useCallback(() => {

        const { billYear, billCycle } = billSelectionInputs;
        let requestBody = {
            billYear,
            billCycle,
            status: [
                "BILLED"
            ]
        }
        requestBody = removeEmptyKey(requestBody);
        post(`${properties.INVOICE_API}/counts`, requestBody)
            .then((response) => {
                if (response.data) {
                    const { /*processData, coutntableDatas, counts, noOfContracts,*/ thisMonthProcess } = response.data;
                    // const { rows, count, totalOutstanding } = coutntableDatas;
                    unstable_batchedUpdates(() => {
                        // setGenerateInvoiceCounts({
                        //     ...generateInvoiceCounts,
                        //     ...counts[0],
                        //     // potentialInvoiceCount: count ? count : '0',
                        //     invoiceCycleNo: processData[0]?.invoiceCycleNo ? processData[0]?.invoiceCycleNo : '0',
                        //     // invoiceRegenCnt: processData[0]?.invoiceRegenCnt ? processData[0]?.invoiceRegenCnt : '0'
                        // })

                        setGenerateInvoiceCounts({
                            ...generateInvoiceCounts,
                            ...response.data.counts[0],
                            //potentialInvoiceCount: thisMonthProcess?.totalProcessed ? thisMonthProcess.totalProcessed : '0',
                            invoiceCycleNo: thisMonthProcess?.invoiceCycleNo ? thisMonthProcess.invoiceCycleNo : '0',
                            //invoiceRegenCnt: thisMonthProcess[0]?.invoiceRegenCnt && thisMonthProcess[0]?.billingStatus === 'PENDING' ? thisMonthProcess[0].invoiceRegenCnt : '0'
                        });
                        // setPreviewInvoiceCounts({
                        //     ...previewInvoiceCounts,                            
                        //     totalInvoiceAmount: coutntableDatas[0]?.invAmtTotal,
                        //     totalAdvanceAmount: coutntableDatas[0]?.advanceTotal,
                        //     totalPreviousBalanceAmount: coutntableDatas[0]?.previousBalance,
                        //     totalOutstandingAmount: coutntableDatas[0]?.totalOutstanding,                            

                        // });
                        setGenerateList(thisMonthProcess);
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
            
           
            post(`${properties.INVOICE_API}/invoice-count`, {...requestBody, billingStatus: 'BILLED'})
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



    }, [billSelectionInputs, previewInvoiceCounts])
    // End of Preview Invoice

    const handleOnViewContractsInputsClear = () => {
        setViewContractInputs({
            contractId: "",
            customerNumber: "",
            customerName: "",
            billRefNo: "",
            billRefName: "",
            startDate: "",
            endDate: "",
        })
    }

    return (
        <div>{userPermission?.billingHistory !== "deny" &&
            <div className="">
                {/* <div className="row justify-content-center align-items-center">
                    <div className="col mx-auto">
                        <div className="page-title-box">
                            <h4 className="page-title">Billing History</h4>
                        </div>
                    </div>
                    <div className="col-auto mx-auto">
                        <div className="pt-2 cursor-pointer">
                        </div>
                    </div>
                </div> */}
                <div className='mt-2'>
                    <BillCycleOrYear
                        data={{
                            billPeriodLookup,
                            billYearLookup,
                            selectionOptionLookup,
                            billCycleLookup,
                            billSelectionInputs,
                            lastSixBillCycle: lookupData.current.sixMonthsCycle
                        }}
                        handler={{
                            handleOnBillSelectionInputs,
                            handleOnBillingCycleSubmit,
                            setBillSelectionInputs,
                            setBillCycleLookup,
                        }}
                    />
                </div>
                <div className="p-0 mt-2">
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
                                                                isHistory={true}
                                                                handler={{
                                                                    handleOnViewContractsInputsChange,
                                                                    handleOnViewContractSearch,
                                                                    handleViewContractPageSelect,
                                                                    setViewContractPerPage,
                                                                    setViewContractCurrentPage,
                                                                    handleOnViewContractsInputsClear
                                                                }}
                                                            />
                                                            : activeTab?.index === 1 ?
                                                                <GenerateInvoice
                                                                    data={{
                                                                        generateInvoiceCounts,
                                                                        generateList,
                                                                        billingReadOnly: true
                                                                    }}
                                                                    handler={{
                                                                        handleOnGenerateInvoice: () => { }
                                                                    }}
                                                                />
                                                                : activeTab?.index === 2 ?
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
                                                                        isHistory={true}
                                                                        handler={{
                                                                            setPreviewInvoicePerPage,
                                                                            setPreviewInvoiceCurrentPage,
                                                                            setPreviewInvoiceInputs
                                                                        }}
                                                                    />
                                                                    :
                                                                    <SubmitInvoice
                                                                        data={{
                                                                            previewInvoiceCounts,
                                                                            generateData: generateList,
                                                                            billingReadOnly: true,
                                                                            billingGenerated: true,
                                                                        }}
                                                                        handler={{
                                                                            handleOnSubmitInvoiceInputsChange: () => { },
                                                                            setBillingReadOnly: () => { }
                                                                        }}
                                                                    />
                                                    }
                                                </div>
                                            </div>
                                            <ul className="list-inline wizard mt-2 mb-0">
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
                                                    activeTab.index === 3 ?
                                                        <>
                                                        </>
                                                        :
                                                        <li className="next list-inline-item float-right pb-2">
                                                            <button className="skel-btn-submit" id='next' disabled={activeTab.index === 3} onClick={handleOnPreviousNext}>Next</button>
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
            </div>}</div>
    )
}

export default BillingHistory;