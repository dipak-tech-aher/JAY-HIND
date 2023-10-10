/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, useCallback, useContext } from 'react';
// import ServiceRequestActions from '../ServiceRequestActions';

import DynamicTable from '../../../common/table/DynamicTable';
import { properties } from '../../../properties';
import { formatISODateTime } from '../../../common/util/dateUtil';
import { get, post } from '../../../common/util/restUtil';
import { InteractionSearchColumns as InteractionSearchColumnsProps, InteractionSearchHiddenColumns } from './interactionSearchColumns';
import ResolveStatus from './resolveStatus';
import ServiceRequestPreview from './ServiceRequestPreview';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { NumberFormatBase } from 'react-number-format';
import { formFilterObject, removeEmptyKey } from '../../../common/util/util';
import { validateNumber } from '../../../common/util/validateUtil';
import { history } from '../../../common/util/history';
import { AppContext } from '../../../AppContext';

const InteractionSearch = (props) => {
    const { auth, appConfig } = useContext(AppContext);
    const OTHERS_INTERACTION = "Interaction For Others";
    const initialValues = {
        customerName: "",
        // serviceNumber: "",
        // accountNumber: "",
        // accountName: "",
        contactNumber: "",
        // interactionId: "",
        interactionNumber: "",
        interactionType: "",
        unAssignedOnly: false
    }

    const [tableRowData, setTableRowData] = useState([]);
    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [isResolveOpen, setIsResolveOpen] = useState(false);
    const [serviceRequestData, setServiceRequestData] = useState({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [resolveData, setResolveData] = useState({})
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const requestType = params.get('requestType');
    const status = params.get('status');
    const selfDept = params.get('selfDept');
    const startDate = params.get('fromDate');
    const endDate = params.get('toDate');
    const [isCountSearch, setIsCountSearch] = useState(true);
    const [displayForm, setDisplayForm] = useState(true);

    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [listSearch, setListSearch] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(false)

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [entityTypes, setEntityTypes] = useState([]);

    useEffect(() => {
        if (search !== "") {
            interactionSearchByTypeAndStatus();
            setIsCountSearch(false);
        } else {
            setIsCountSearch(true);
        }
    }, [search, perPage, currentPage])

    const [InteractionSearchColumns, setInteractionSearchColumns] = useState([])

    useEffect(() => {
        setInteractionSearchColumns(InteractionSearchColumnsProps?.map(x => {
            if (["customerName"].includes(x.id)) {
                if (appConfig && appConfig.clientFacingName && appConfig?.clientFacingName?.customer) {
                    x.Header = x.Header?.replace('Customer', appConfig?.clientFacingName?.customer ?? 'Customer');
                }
            }
            return x;
        }))
    }, [props])

    useEffect(() => {
        if (!isFirstRender.current && !params.has('status')) {
            getInteractionSearchData();
        }
        else {
            isFirstRender.current = false
        }
    }, [currentPage, perPage])

    useEffect(() => {
        getEntityLookup()
    }, [])

    const getInteractionSearchData = (fromCallback = false) => {

        const { customerName, interactionType, contactNumber, interactionNumber } = searchInputs;
        let searchParams = {
            customerName,
            contactNumber: contactNumber ? Number(contactNumber) : '',
            interactionNumber,
            interactionType
        }
        searchParams = removeEmptyKey(searchParams);

        let requestBody = {
            searchParams: {
                ...searchParams
            }
        }

        setListSearch(requestBody);
        post(`${properties.INTERACTION_API}/search?limit=${perPage}&page=${fromCallback ? 0 : Number(currentPage)}`, requestBody)
            .then((response) => {
                if (response.data) {
                    if (Number(response.data.count) > 0) {
                        unstable_batchedUpdates(() => {
                            setTotalCount(response.data.count)
                            setTableRowData(response.data.rows)
                        })
                    }
                    else {
                        setTotalCount(0)
                        setTableRowData([])
                        toast.error("Records not Found")
                    }
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally(() => {
                isTableFirstRender.current = false;
            })
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleInputChange = (e) => {
        const target = e.target;
        setSearchInputs({
            ...searchInputs,
            [target.id]: target.type === 'checkbox' ? target.checked : target.value
        })
    }

    const interactionSearchByTypeAndStatus = () => {
        if (requestType !== undefined && requestType !== null) {

            let requestBody = {
                status: status,
                type: requestType,
                selfDept,
                startDate: startDate.split("-").reverse().join("-"),
                endDate: endDate.split("-").reverse().join("-"),
                roleId: JSON.parse(sessionStorage.getItem('auth')).currRoleId,
                filters: formFilterObject(filters)
            }
            setListSearch(requestBody);
            post(`${properties.INTERACTION_API}/search?limit=${perPage}&page=${currentPage}`, requestBody)
                .then((response) => {
                    if (Number(response.data.count) > 0) {
                        unstable_batchedUpdates(() => {
                            setTotalCount(response.data.count)
                            setTableRowData(response.data.rows)
                        })
                    }
                    else {
                        toast.error("No Records Found")
                    }
                }).catch((error) => {
                    console.log(error)
                })
                .finally()
        }
    }

    const handleSubmit = (e) => {
        if (e) {
            e.preventDefault();

            if (!searchInputs?.customerName && !searchInputs?.contactNumber && !searchInputs?.interactionNumber &&
                !searchInputs?.interactionType) {
                toast.error("Validation error found, Please provide atleast one field")
                return
            }



            // if (searchInputs.serviceNumber.length !== 0) {
            //     if (searchInputs.serviceNumber.length < 3) {
            //         toast.error("Please Enter Minimum 3 digits for Subscription ID")
            //         return
            //     }
            // }
            if (searchInputs?.interactionNumber && searchInputs?.interactionNumber?.length !== 0) {
                if (searchInputs.interactionNumber.length < 5) {
                    toast.error("Please Enter Minimum 5 digits for Interaction Number")
                    return
                }
            }
            if (searchInputs?.contactNumber && searchInputs.contactNumber.length !== 0) {
                if (searchInputs.contactNumber.length < 3) {
                    toast.error("Please Enter Minimum 3 digits for Contact Number")
                    return
                }
            }
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
        else {
            getInteractionSearchData(true);
        }
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Interaction No") {
            return (<span className="text-secondary" style={{ cursor: "pointer" }} onClick={(e) => redirectToRespectivePages(e, row.original)}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Created Date") {
            return (<span>{formatISODateTime(cell.value)}</span>)
        }
        // else if (cell.column.Header === "Action") {
        //     return (
        //         <ServiceRequestActions
        //             data={{
        //                 row: row.original
        //             }}
        //             handlers={{
        //                 setIsResolveOpen,
        //                 setIsPreviewOpen,
        //                 setResolveData,
        //                 setServiceRequestData
        //             }}
        //         />
        //     )
        // }
        else if (cell.column.Header === "Customer Name" || cell.column.Header === "Account Name" || cell.column.Header === "Assigned" || cell.column.Header === "Created By") {
            return (<span>{cell.value}</span>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    // const getHelpdeskData = useCallback((helpdeskId) => {
    //     return new Promise((resolve, reject) => {
    //         if (helpdeskId) {

    //             get(`${properties.HELPDESK_API}/${helpdeskId}`)
    //                 .then((response) => {
    //                     const { status, data } = response;
    //                     if (status === 200) {
    //                         resolve(data);
    //                     }
    //                 })
    //                 .catch(error => {
    //                     console.error(error);
    //                     reject(true);
    //                 })
    //                 .finally()
    //         }
    //         else {
    //             resolve();
    //         }
    //     })
    // }, [])

    // const handleCellLinkClick = (event, rowData) => {
    //     const { intxnId, customerId, intxnType, intxnTypeDesc, serviceId, accountId, woType, woTypeDesc, helpdeskId } = rowData;
    //     if (intxnType === 'REQCOMP' || intxnType === 'REQINQ' || intxnType === 'REQSR') {
    //         const helpdeskResponse = getHelpdeskData(helpdeskId);
    //         helpdeskResponse.then((resolvedHD, rejectedHD) => {
    //             const isValidHD = typeof (resolvedHD) === 'object' ? true : false;
    //             const isAdjustmentOrRefund = ['Adjustment', 'Refund'].includes(woTypeDesc) ? true : ['Fault'].includes(woTypeDesc) && intxnType === 'REQSR' ? true : false;
    //             props.history.push(`${process.env.REACT_APP_BASE}/edit-${intxnTypeDesc.toLowerCase().replace(' ', '-')}`, {
    //                 data: {
    //                     customerId,
    //                     serviceId,
    //                     interactionId: intxnId,
    //                     accountId,
    //                     type: isAdjustmentOrRefund ? 'complaint' : intxnTypeDesc.toLowerCase(),
    //                     woType,
    //                     isAdjustmentOrRefund,
    //                     row: rowData,
    //                     detailedViewItem: isValidHD ? resolvedHD : {},
    //                     fromHelpDesk: isValidHD ? true : false,
    //                     helpDeskView: isValidHD ? 'Incident' : ''
    //                 }
    //             })
    //         })
    //     } else if(intxnType === 'REQWO') {
    //         props.history.push(`${process.env.REACT_APP_BASE}/edit-work-order`, {
    //             data: {
    //                 customerId,
    //                 serviceId,
    //                 interactionId: intxnId,
    //                 accountId,
    //                 type: 'order',
    //                 woType,
    //                 isAdjustmentOrRefund : false,
    //                 row: rowData
    //             }
    //         })
    //     }
    // }

    const redirectToRespectivePages = (e, rows) => {
        const data = {
            intxnNo: rows?.intxnNo,
            customerUid: rows?.customerUid,
            sourceName: 'customer360'
        }
        // if (response?.oCustomerUuid) {
        //     sessionStorage.setItem("customerUuid", response.oCustomerUuid)
        // }
        history.push(`${process.env.REACT_APP_BASE}/interaction360`, { data })
    }

    const handleParentModalState = () => {
        setIsPreviewOpen(false);
    }

    const getEntityLookup = useCallback(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=INTXN_TYPE')
            .then((response) => {
                const { data } = response;
                setEntityTypes(data['INTXN_TYPE']);
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [])

    const hasOtherInteractionPermission = () => {
        let permissions = auth?.permissions ?? [];
        let interactionPermissions;
        for (let index = 0; index < permissions.length; index++) {
            if (permissions[index]['Interaction']) {
                interactionPermissions = permissions[index]['Interaction'];
                break;
            }
        }
        return interactionPermissions?.find(x => x.screenName === OTHERS_INTERACTION)?.accessType === "allow";
    }

    return (
        <div className="container-fluid cust-skeleton cmmn-skeleton mt-2 mb-3">
            {/* <div className="row">
                <div className="col">
                    <div className="page-title-box">
                        <h4 className="page-title">Interactions Search</h4>
                    </div>
                </div>
                {
                    isCountSearch === false &&
                    <div className="col-auto">
                        <button type="button" onClick={() => props.history.goBack()} className="btn btn-labeled btn-primary btn-sm mt-1">Back</button>
                    </div>
                }

            </div> */}
            <div className="row mt-2">
                <div className="col-lg-12">
                    <div className="search-result-box m-t-30">
                        {isCountSearch && (
                            <div id="searchBlock" className="modal-body p-2 d-block">
                                <div className="d-flex justify-content-end">
                                    <h6 style={{ color: "#142cb1", cursor: "pointer" }} onClick={() => { setDisplayForm(!displayForm) }}>{displayForm ? "Hide Search" : "Show Search"}</h6>
                                </div>
                                {
                                    displayForm &&
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="interactionId" className="control-label">Interaction Number</label>
                                                    <input
                                                        value={searchInputs.interactionNumber}
                                                        onChange={handleInputChange}
                                                        type="text"
                                                        className="form-control"
                                                        id="interactionNumber"
                                                        placeholder="Enter Interaction Number" />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="interactionType" className="control-label">Interaction Type</label>
                                                    <select id='interactionType' className='form-control' value={searchInputs.interactionType} onChange={handleInputChange} >
                                                        <option value="">Select Interaction Type</option>
                                                        {
                                                            entityTypes?.map((e) => (
                                                                <option key={e.code} value={e.code}>{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                            {/* <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="accountNumber" className="control-label">Account ID</label>
                                                    <NumberFormatBase
                                                        value={searchInputs.accountNumber}
                                                        onKeyPress={(e) => {
                                                            validateNumber(e);
                                                            if (e.key === "Enter") {
                                                                handleSubmit(e)
                                                            };
                                                        }}
                                                        onChange={handleInputChange}
                                                        type="text"
                                                        className="form-control"
                                                        id="accountNumber"
                                                        placeholder="Enter Account ID" />
                                                </div>
                                            </div> */}
                                            {/* <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="accountName" className="control-label">Account Name</label>
                                                    <input
                                                        value={searchInputs.accountName}
                                                        onChange={handleInputChange}
                                                        type="text"
                                                        className="form-control"
                                                        id="accountName"
                                                        placeholder="Enter Account Name"
                                                    />
                                                </div>
                                            </div> */}
                                            {hasOtherInteractionPermission() && (
                                                <React.Fragment>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label htmlFor="customerName" className="control-label">{appConfig?.clientFacingName?.customer ?? 'Customer'} Name</label>
                                                            <input
                                                                value={searchInputs.customerName}
                                                                onChange={handleInputChange}
                                                                type="text"
                                                                className="form-control"
                                                                id="customerName"
                                                                placeholder="Enter Name"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label htmlFor="contactNumber" className="control-label">Primary Contact Number</label>
                                                            <NumberFormatBase
                                                                type="text"
                                                                maxLength={15}
                                                                value={searchInputs.contactNumber}
                                                                onKeyPress={(e) => {
                                                                    validateNumber(e);
                                                                    if (e.key === "Enter") {
                                                                        handleSubmit(e)
                                                                    };
                                                                }}
                                                                onChange={handleInputChange}
                                                                className="form-control"
                                                                id="contactNumber"
                                                                placeholder="Enter Primary Contact Number "
                                                            />
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            )}
                                            {/* <div className="col-md-4 switchery-demo">
                                                <div className="custom-control custom-switch">
                                                    <input onChange={handleInputChange} checked={searchInputs.unAssignedOnly} type="checkbox" className="custom-control-input" id="unAssignedOnly" />
                                                    <label className="custom-control-label" htmlFor="unAssignedOnly">Unassigned only</label>
                                                </div>
                                            </div> */}
                                        </div>
                                        <div className="col-md-12 text-center mt-3">
                                            <button type="button" className="skel-btn-cancel" onClick={() => { setSearchInputs(initialValues); setTableRowData([]) }}>Clear</button>
                                            <button type="submit" className="skel-btn-submit">Search</button>

                                        </div>

                                    </form>
                                }
                            </div>
                        )}
                        {
                            !!tableRowData.length &&
                            <div className="row mt-2">
                                <div className="col-lg-12">
                                    {
                                        !!tableRowData.length &&
                                        <div className="">
                                            <div className="" id="datatable">
                                                <DynamicTable
                                                    listKey={"Interactions Search"}
                                                    listSearch={listSearch}
                                                    row={tableRowData}
                                                    header={InteractionSearchColumns}
                                                    rowCount={totalCount}
                                                    handleRow={setResolveData}
                                                    itemsPerPage={perPage}
                                                    hiddenColumns={InteractionSearchHiddenColumns}
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
                        }
                        {
                            isResolveOpen ?
                                <ResolveStatus value={resolveData} isOpen={isResolveOpen} setIsOpen={setIsResolveOpen} refreshSearch={handleSubmit} />
                                :
                                <></>
                        }
                        {
                            isPreviewOpen &&
                            <ServiceRequestPreview data={{ serviceRequestData }} stateHandlers={{ handleParentModalState: handleParentModalState }} />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InteractionSearch;