import React, { useRef, useEffect, useState, useCallback, useContext } from 'react';

import DynamicTable from '../../../common/table/DynamicTable';
import { properties } from '../../../properties';
import { get, post } from '../../../common/util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { NumberFormatBase } from 'react-number-format';
import { formFilterObject, removeEmptyKey } from '../../../common/util/util';
import { validateNumber } from '../../../common/util/validateUtil';
import { HelpdeskSearchColumns } from './HelpdeskSearchColumnLits';
import HelpdeskCancelModal from '../HelpdeskCancelModal';
import { statusConstantCode } from '../../../AppConstants';
import { isEmpty } from 'lodash'
import { AppContext } from '../../../AppContext';

const HelpdeskSearch = (props) => {
    const initialValues = {
        helpdeskId: "",
        source: "",
        sourceReference: "",
        profileNumber: "",
        fullName: "",
        customerType: "",
        contactNumber: "",
        email: ""
    };

    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [entityTypes, setEntityTypes] = useState({
        source: [],
        customerType: []
    });
    const [tableRowData, setTableRowData] = useState([]);
    const [displayForm, setDisplayForm] = useState(true);

    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [listSearch, setListSearch] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false)

    const [helpdeskDetails, setHelpdeskDetails] = useState()
    const [refresh, setRefresh] = useState(false)

    useEffect(() => {
        if (!isFirstRender.current) {
            getInteractionSearchData();
        }
        else {
            isFirstRender.current = false
            getEntityLookup();
        }
    }, [currentPage, perPage, refresh])

    const getEntityLookup = useCallback(() => {

        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=CUSTOMER_CATEGORY,HELPDESK_SOURCE')
            .then((response) => {
                const { data } = response;
                setEntityTypes({
                    source: data['HELPDESK_SOURCE'],
                    customerType: data['CUSTOMER_CATEGORY']
                });
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [])

    const getInteractionSearchData = (fromCallback = false) => {

        const requestBody = {
            contain: ['CUSTOMER']
        }

        const requestBodyFiltered = removeEmptyKey(searchInputs)

        if (isEmpty(requestBodyFiltered)) {
            toast.error('Please provide atleast one filed for search')
            return false
        }

        if (searchInputs?.helpdeskId) {
            requestBody.helpdeskId = Number(searchInputs?.helpdeskId)
        }
        if (searchInputs?.source) {
            requestBody.helpdeskSource = searchInputs?.source
        }
        if (searchInputs?.profileNumber) {
            requestBody.profileId = searchInputs?.profileNumber
        }
        if (searchInputs?.fullName) {
            requestBody.profileName = searchInputs?.fullName
        }
        if (searchInputs?.contactNumber) {
            requestBody.phoneNo = searchInputs?.contactNumber
        }
        if (searchInputs?.email) {
            requestBody.mailId = searchInputs?.email
        }

        setListSearch(requestBody);
        post(`${properties.HELPDESK_API}/search?limit=${perPage}&page=${fromCallback ? 0 : Number(currentPage)}`, requestBody)
            .then((response) => {
                if (response.data) {
                    if (Number(response.data.count) > 0) {
                        unstable_batchedUpdates(() => {
                            setTotalCount(response.data.count)
                            setTableRowData(response.data.rows)
                        })
                    }
                    else {
                        toast.error("Records not Found")
                        setTableRowData([])
                        setTotalCount(0)
                    }
                }
            }).catch((error) => {
                if (error?.message) {
                    toast.error(error?.message)
                } else {
                    console.error(error)
                }
            })
            .finally(() => {

                isTableFirstRender.current = false;
            })
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleOnKeyPress = (e) => {
        const { key } = e;
        validateNumber(e);
        if (key === "Enter") {
            handleSubmit(e)
        };
    }

    const handleInputChange = (e) => {
        const target = e.target;
        setSearchInputs({
            ...searchInputs,
            [target.id]: target.type === 'checkbox' ? target.checked : target.value
        })
    }

    const handleSubmit = (e) => {
        if (e) {
            e.preventDefault();
            isTableFirstRender.current = true;
            unstable_batchedUpdates(() => {
                setFilters([])
                setCurrentPage((currentPage) => {
                    if (currentPage === 0) {
                        return '0'
                    }
                    return 0
                });
            })
        }
    }

    const handleCancelHelpdesk = (e) => {
        unstable_batchedUpdates(() => {
            setIsCancelOpen(true)
            setHelpdeskDetails(e)
        })

    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Helpdesk ID") {
            return (<span className="text-secondary cursor-pointer" onClick={(e) => handleCellLinkClick(e, row.original)}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Full Name") {
            return (
                <span>{(cell?.row?.original?.customerDetails?.firstName || "") + " " + (cell?.row?.original?.customerDetails?.lastName || "")}</span>
            )
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" onClick={() => handleCancelHelpdesk(row.original?.helpdeskId)} disabled={[statusConstantCode.status.HELPDESK_CLOSED, statusConstantCode.status.HELPDESK_CANCEL, statusConstantCode.status.HELPDESK_ESCALATED].includes(row.original?.status.code)}
               /*     disabled={[statusConstantCode.status.HELPDESK_CLOSED, statusConstantCode.status.HELPDESK_CANCEL].includes(row.original?.status.code)}*/ className={[statusConstantCode.status.HELPDESK_CLOSED, statusConstantCode.status.HELPDESK_CANCEL, statusConstantCode.status.HELPDESK_ESCALATED].includes(row.original?.status.code) ? "skel-btn-submit skel-btn-disable" : "skel-btn-submit"} data-toggle="modal" data-target="#search-modal-editservice">
                    Cancel</button >
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const getHelpdeskData = useCallback((helpdeskId) => {
        return new Promise((resolve, reject) => {

            get(`${properties.HELPDESK_API}/${helpdeskId}`)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200) {
                        resolve(data);
                    }
                })
                .catch(error => {
                    console.error(error);
                    reject(true);
                })
                .finally()
        })
    }, [])

    const getInteractionDataById = useCallback((interactionId) => {

        return new Promise((resolve, reject) => {
            if (interactionId) {
                const requestBody = {
                    searchType: "ADV_SEARCH",
                    interactionId,
                    filters: []
                }
                post(`${properties.INTERACTION_API}/search?limit=${10}&page=${0}`, requestBody)
                    .then((response) => {
                        if (response.data) {
                            if (Number(response.data.count) > 0) {
                                const { rows } = response.data;
                                const { intxnId, customerId, intxnType, intxnTypeDesc, serviceId, accountId, woType, woTypeDesc } = rows[0];
                                if (intxnType === 'REQCOMP' || intxnType === 'REQINQ' || intxnType === 'REQSR') {
                                    const isAdjustmentOrRefund = ['Adjustment', 'Refund'].includes(woTypeDesc) ? true : ['Fault'].includes(woTypeDesc) && intxnType === 'REQSR' ? true : false;
                                    let data = {
                                        customerId,
                                        serviceId,
                                        interactionId: intxnId,
                                        accountId,
                                        type: isAdjustmentOrRefund ? 'complaint' : intxnTypeDesc.toLowerCase(),
                                        woType,
                                        isAdjustmentOrRefund,
                                        row: rows[0]
                                    }
                                    resolve(data);
                                }
                            }
                            else {
                                reject(undefined);
                                toast.error("Records not Found")
                            }
                        }
                    }).catch(error => {
                        console.error(error);
                    })
                    .finally(() => {

                    })
            }
            else {

                resolve({ noInteraction: true })
            }
        })
    }, [])

    // const handleCellLinkClick = (event, rowData) => {
    //     const { helpdeskId, interactionDetails } = rowData;
    //     const helpdeskResponse = getHelpdeskData(helpdeskId);
    //     helpdeskResponse.then((resolvedHD, rejectedHD) => {
    //         if (resolvedHD) {
    //             const interactionResponse = getInteractionDataById(interactionDetails[0]?.intxnId);
    //             interactionResponse.then((resolvedIntxn, rejectedIntxn) => {
    //                 if (resolvedIntxn) {
    //                     props.history.push(`${process.env.REACT_APP_BASE}/edit-${resolvedIntxn?.type?.toLowerCase()?.replace(' ', '-') || 'complaint'}`, {
    //                         data: {
    //                             ...resolvedIntxn,
    //                             detailedViewItem: resolvedHD,
    //                             fromHelpDesk: true,
    //                             helpDeskView: 'Search'
    //                         }
    //                     })
    //                 }
    //             })
    //         }
    //     })
    // }

    const handleCellLinkClick = (event, rowData) => {
        props.history.push(`${process.env.REACT_APP_BASE}/view-helpdesk-ticket`, {
            data: rowData
        })
    }

    return (
        <div className="container-fluid cust-skeleton cmmn-skeleton mt-2 mb-3">
            {/* <div className="row">
                <div className="col">
                    <div className="page-title-box">
                        <h4 className="page-title">Helpdesk Search</h4>
                    </div>
                </div>
            </div> */}
            <div className="row mt-1">
                <div className="col-lg-12">
                    <div className="search-result-box m-t-30">
                        <div id="searchBlock" className="modal-body p-2 d-block">
                            <div className="d-flex justify-content-end">
                                <h6 className='cursor-pointer' onClick={() => { setDisplayForm(!displayForm) }}>
                                    {displayForm ? "Hide Search" : "Show Search"}
                                </h6>
                            </div>
                            {
                                displayForm &&
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="helpdeskId" className="control-label">Helpdesk ID</label>
                                                <NumberFormatBase
                                                    value={searchInputs.helpdeskId}
                                                    onKeyPress={(e) => handleOnKeyPress(e)}
                                                    onChange={handleInputChange}
                                                    type="text"
                                                    className="form-control"
                                                    id="helpdeskId"
                                                    placeholder="Enter Helpdesk ID" />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="source" className="control-label">Source</label>
                                                <select id='source' className='form-control' value={searchInputs.source} onChange={handleInputChange} >
                                                    <option value="">Select Source</option>
                                                    {
                                                        entityTypes?.source?.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4 d-none">
                                            <div className="form-group">
                                                <label htmlFor="sourceReference" className="control-label">Source Reference</label>
                                                <input
                                                    value={searchInputs.sourceReference}
                                                    onChange={handleInputChange}
                                                    type="text"
                                                    className="form-control"
                                                    id="sourceReference"
                                                    placeholder="Enter Name"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="profileNumber" className="control-label">Profile Id</label>
                                                <NumberFormatBase
                                                    value={searchInputs.profileNumber}
                                                    onKeyPress={(e) => handleOnKeyPress(e)}
                                                    onChange={handleInputChange}
                                                    type="text"
                                                    className="form-control"
                                                    id="profileNumber"
                                                    placeholder="Enter Profile ID" />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="fullName" className="control-label">Profile Name</label>
                                                <input
                                                    value={searchInputs.fullName}
                                                    onChange={handleInputChange}
                                                    type="text"
                                                    className="form-control"
                                                    id="fullName"
                                                    placeholder="Enter Full Name"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4 d-none">
                                            <div className="form-group">
                                                <label htmlFor="customerType" className="control-label">Customer Type</label>
                                                <select className='form-control' id='customerType' value={searchInputs.customerType} onChange={handleInputChange} >
                                                    <option value="">Select Source</option>
                                                    {
                                                        entityTypes?.customerType?.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="contactNumber" className="control-label">Primary Contact Number</label>
                                                <NumberFormatBase
                                                    type="text"
                                                    value={searchInputs.contactNumber}
                                                    onKeyPress={(e) => handleOnKeyPress(e)}
                                                    onChange={handleInputChange}
                                                    className="form-control"
                                                    id="contactNumber"
                                                    placeholder="Enter Primary Contact Number "
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="email" className="control-label">Email</label>
                                                <input
                                                    value={searchInputs.email}
                                                    onChange={handleInputChange}
                                                    type="text"
                                                    className="form-control"
                                                    id="email"
                                                    placeholder="Enter Email"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row justify-content-center'>
                                        <div className="text-center mt-3">
                                            <button type="button" className="skel-btn-cancel" onClick={() => { setSearchInputs(initialValues); setTableRowData([]) }}>Clear</button>
                                            <button type="submit" className="skel-btn-submit">Search</button>
                                        </div>
                                    </div>
                                </form>
                            }{
                                console.log('tableRowData', tableRowData)
                            }
                        </div>
                        {
                            // !!tableRowData.length ?
                            <div className="row mt-2">
                                <div className="col-lg-12">
                                    {
                                        // !!tableRowData.length &&
                                        <div className="">
                                            <div className="" id="datatable">
                                                <DynamicTable
                                                    listKey={"Helpdesk Search"}
                                                    listSearch={listSearch}
                                                    row={tableRowData}
                                                    header={HelpdeskSearchColumns}
                                                    rowCount={totalCount}
                                                    itemsPerPage={perPage}
                                                    backendPaging={true}
                                                    columnFilter={true}
                                                    backendCurrentPage={currentPage}
                                                    isTableFirstRender={isTableFirstRender}
                                                    hasExternalSearch={hasExternalSearch}
                                                    exportBtn={exportBtn}
                                                    handler={{
                                                        handleCellRender: handleCellRender,
                                                        handlePageSelect: handlePageSelect,
                                                        handleItemPerPage: setPerPage,
                                                        handleCurrentPage: setCurrentPage,
                                                        handleFilters: setFilters,
                                                        handleExportButton: setExportBtn
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                            // :
                            // <></>
                        }
                    </div>
                </div>
            </div>
            <div>
                <HelpdeskCancelModal
                    data={{
                        helpDeskId: helpdeskDetails,
                        isCancelOpen,
                        refresh
                    }}

                    handler={{
                        setIsCancelOpen,
                        setRefresh
                    }}
                />
            </div>
        </div>
    )
}

export default HelpdeskSearch;