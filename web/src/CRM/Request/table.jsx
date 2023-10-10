import React, { useState, useRef, useEffect } from "react"
import { RegularModalCustomStyles } from "../../common/util/util";
import DynamicTable from "../../common/table/DynamicTable";
import Modal from 'react-modal';
import { RequestColumns } from "./columns";
import { properties } from '../../properties';
import { post, get, put } from '../../common/util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment';
import { Form, Badge } from 'react-bootstrap';
import { formFilterObject } from '../../common/util/util';
import { toast } from 'react-toastify';

const RequestTable = (props) => {
    const {
        requestStatus, selectedTab, screenAction, setRequestTotalCount,
        requestRefresh, setRequestRefresh
    } = props;
    const isFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [searchInputs, setSearchInputs] = useState({});
    const [listSearch, setListSearch] = useState([]);
    const [requestData, setRequestData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const isTableFirstRender = useRef(true);
    const [submitting, setSubmitting] = useState(false);
    const [requestStatuses, setRequestStatuses] = useState([]);
    const [selectedRequestIds, setSelectedRequestIds] = useState([]);
    const [selectedRequestData, setSelectedRequestData] = useState({});
    const [requestColumns, setRequestColumns] = useState(RequestColumns);
    const getRequestDataAPI = `${properties.INTERACTION_API}/get-requests`;
    const [reason, setReason] = useState('');
    const accountInitialValues = {
        isAccountCreate: "N",
        sameAsCustomerData: "Y",
        firstName: '',
        lastName: '',
        email: '',
        contactNbr: '',
        dob: '',
        gender: '',
        idType: '',
        idValue: '',
        registrationNbr: "",
        registrationDate: "",
        accountCategory: "AC_POST",
        accountClass: "",
        accountPriority: "",
        accountLevel: "PRIMARY",
        billLanguage: "BLENG",
        accountType: "",
        notificationPreference: ["CNT_EMAIL"],
        creditLimit: "",
        accountBalance: "",
        accountOutstanding: "",
        accountStatusReason: "",
        currency: "CUR-INR"
    }
    const [accountData, setAccountData] = useState(accountInitialValues);
    const [serviceData, setServiceData] = useState();

    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=REQ_STATUS').then((resp) => {
            if (resp.data) {
                setRequestStatuses(resp.data.REQ_STATUS);
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
    }, [screenAction]);

    useEffect(() => {
        if (setRequestTotalCount) {
            setRequestTotalCount(totalCount ?? 0);
        }
    }, [totalCount])

    useEffect(() => {
        let filteredColumns = [];
        if (requestStatus == 'open') {
            filteredColumns.push('requestStatusReason');
        }

        if (requestStatus == 'closed' || selectedTab == 'team-request') {
            filteredColumns.push('action');
        }

        if (selectedTab == 'my-request') {
            filteredColumns.push('userName');
        }

        setRequestColumns(RequestColumns.filter(x => !filteredColumns.includes(x.id)));

        if (requestRefresh) {
            isTableFirstRender.current = true;
        }
        setFilters([]);
        setRequestData([]);
        setTotalCount(0);
        setPerPage(10);
        setCurrentPage(0);

        getRequestData();
    }, [selectedTab, requestRefresh])

    useEffect(() => {
        if (!isFirstRender.current) {
            getRequestData();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    const getRequestData = () => {
        const requestBody = {
            ...searchInputs,
            requestStatus,
            myRequest: (selectedTab == 'my-request'),
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${getRequestDataAPI}?limit=${perPage}&page=${currentPage}`, requestBody).then((resp) => {
            if (resp.data) {
                if (resp.status === 200) {
                    const { count, rows } = resp.data;
                    unstable_batchedUpdates(() => {
                        setTotalCount(count);
                        setRequestData(rows);
                        if (setRequestRefresh) setRequestRefresh(false);
                    })
                }
            }
        }).catch(error => console.log(error)).finally(() => {
            isTableFirstRender.current = false;
        });
    }
    const openApproveRejectModal = (openClose, row = {}) => {
        console.log('row----->', row?.mappingPayload)
        if (row?.entityType == "AI_REQUEST") {
            const productIds = row?.mappingPayload?.map((ele) => ele?.productId);
            post(properties.PRODUCT_API + '/get-product-details', { productIds }).then((resp) => {
                if (resp.data) {
                    setSelectedRequestData({ row: resp.data, ...row });

                    let Rc = 0
                    let Nrc = 0
                    let totalRc = 0
                    let totalNrc = 0
                    let quantity = 0
                    let total = 0

                    console.log('resp.data------->', resp.data?.rows)
                    resp?.data?.rows?.forEach((x) => {
                        if (x?.productChargesList && x?.productChargesList.length > 0) {
                            x?.productChargesList.forEach((y) => {
                                if (y?.chargeDetails?.chargeCat === 'CC_RC' && (!y.objectReferenceId || y.objectReferenceId == null)) {
                                    Rc = Number(y?.chargeAmount || 0)
                                    totalRc = totalRc + Number(y?.chargeAmount || 0)
                                } else if (y?.chargeDetails?.chargeCat === 'CC_NRC' && (!y.objectReferenceId || y.objectReferenceId == null)) {
                                    totalNrc = totalNrc + Number(y?.chargeAmount || 0)
                                    Nrc = Number(y?.chargeAmount || 0)
                                }
                            })
                        }

                        quantity = Number(resp?.data?.mappingPayload?.find((ele) => ele?.productId === x?.productId)?.qty)
                        totalRc += Rc
                        totalNrc += Nrc
                    })
                    setServiceData({
                        ...serviceData,
                        totalRc,
                        totalNrc,
                        total: Number(totalRc) + Number(totalNrc)
                    })
                    console.log('setServices------->', {
                        ...serviceData,
                        totalRc,
                        totalNrc,
                        total: Number(totalRc) + Number(totalNrc)
                    })
                }
            }).catch((error) => { console.log(error) }).finally()
            console.log('productIds------>', productIds)
        } else {
            setSelectedRequestData({ ...row });
        }
        setOpenModal(openClose === 'open');
        setReason("");
    }

    const selectRequest = (e) => {
        const { checked, id } = e.target;
        selectedRequestIds[checked ? 'push' : 'pop'](id);
        console.log(selectedRequestIds);
        setSelectedRequestIds([...selectedRequestIds]);
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id == "selector") {
            return (
                <Form.Check type={'checkbox'} id={row.original?.requestNo} onChange={selectRequest} />
            );
        } else if (cell.column.id == "userName") {
            return (<span>{row.original?.currUserDetails?.firstName} {row.original?.currUserDetails?.lastName}</span>);
        } else if (cell.column.id == "userRoleDept") {
            return (<span>{row.original?.roleDetails?.roleName} / {row.original?.departmentDetails?.unitName}</span>);
        } else if (cell.column.id == "requestType") {
            return (<span>{row.original?.requestTypeDesc?.description}</span>);
        } else if (cell.column.id == "requestPriority") {
            return (<span>{row.original?.priorityDesc?.description}</span>);
        } else if (cell.column.id == "dateTime") {
            return (<span>{moment(row.original?.requestDate).format("YYYY-MM-DD hh:mm A")}</span>);
        } else if (cell.column.id == "status") {
            let mapping = requestStatuses.find(x => x.code == row.original?.requestStatus)?.mapping;
            return (<Badge bg={mapping?.bgClass} style={{ color: mapping?.textColor }}>{row.original?.currStatusDesc?.description}</Badge>);
        } else if (cell.column.id == "action") {
            return (
                <div className="skel-action-btn">
                    <button className="skel-btn-submit" onClick={() => openApproveRejectModal('open', row?.original)} style={{ minWidth: '38px' }}>
                        <i className="mdi mdi-pencil font20" /> Edit
                    </button>
                </div>
            );
        } else {
            return (<span>{cell.value}</span>);
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const approveOrRejectRequest = (requestStatusFlag) => {
        console.log('serviceData----->', serviceData)
        if (requestStatusFlag === "reject" && reason == "") {
            toast.error("Please fill the reason"); return;
        }
        if (requestStatusFlag === 'approve') {
            setSubmitting(true);
            put(`${properties.INTERACTION_API}/request/${requestStatusFlag}`, { requestNo: selectedRequestData.requestNo, reason }).then((resp) => {
                if (resp.status === 200) {
                    const list = []
                    get(`${properties.CUSTOMER_API}/${selectedRequestData?.customerUuid}`).then((resp) => {
                        if (resp?.data) {
                            const customerData = resp?.data;
                            const customerAddress = resp?.data?.customerAddress?.find((ele) => ele?.isPrimary === true)
                            selectedRequestData?.row?.rows?.forEach((x) => {
                                console.log('here looping')
                                const details = []
                                details.push({
                                    action: "ADD",
                                    serviceName: x?.productName,
                                    serviceCategory: x?.productSubType,
                                    serviceType: x?.serviceType,
                                    planPayload: {
                                        productId: x?.productId,
                                        productUuid: x?.productUuid,
                                        contract: x?.selectedContract?.[0] || 0,
                                        actualContract: x?.oldSelectedContract ? x?.oldSelectedContract?.[0] : x.selectedContract?.[0] || 0,
                                        promoContract: x?.promoContract ? x?.promoContract : 0,
                                        promoCode: x?.promoCode || [],
                                        serviceLimit: x?.productBenefit && x.productBenefit?.length > 0 ? x.productBenefit?.find(f => x.selectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f.productId === 'PB_DATA')?.description : null,
                                        actualServiceLimit: x?.oldProductBenefit && x?.oldProductBenefit.length > 0 ? x?.oldProductBenefit?.find(f => x?.oldSelectedContract?.[0] === Number(f?.contract))?.benefits?.find(f => f?.productId === 'PB_DATA')?.description : null,
                                        promoServiceLimit: x?.promoBenefit && x?.promoBenefit?.length > 0 ? x?.promoBenefit?.find(f => f?.productId === 'PB_DATA')?.description : null,
                                        productBenefit: x?.productBenefit || null,
                                        promoBenefit: x?.promoBenefit || null,
                                        actualProductBenefit: x?.oldProductBenefit ? x?.oldProductBenefit : x?.productBenefit || null,
                                        upfrontCharge: x?.upfrontCharge,
                                        advanceCharge: x?.advanceCharge,
                                    },
                                    serviceClass: x?.produtClass,
                                    quantity: String(selectedRequestData?.mappingPayload?.find((ele) => ele?.productId === x?.productId)?.qty),
                                    customerUuid: customerData?.customerUuid,
                                    currency: accountData?.currency,
                                    billLanguage: accountData?.billLanguage
                                });
                                list.push({ details: details })
                            })
                            const requestBody = {
                                service: list
                            }
                            post(properties.ACCOUNT_DETAILS_API + '/service/create', requestBody)
                                .then((resp) => {
                                    if (resp.data) {
                                        if (resp.status === 200) {
                                            const list = []
                                            selectedRequestData?.row?.rows?.forEach((x) => {
                                                let oldProductData = resp?.data?.find((y) => y?.service?.productUuid === x?.productUuid)
                                                let ordeReqObj = {
                                                    orderFamily: "OF_PHYCL",
                                                    orderMode: "ONLINE",
                                                    billAmount: Number(serviceData?.totalRc) + Number(serviceData?.totalNrc),
                                                    orderDescription: x?.serviceTypeDescription?.description || "New Sign up Order",
                                                    serviceType: x?.serviceType,
                                                    accountUuid: oldProductData?.account?.accountUuid || oldProductData?.service?.accountUuid,
                                                    serviceUuid: oldProductData?.service?.serviceUuid,
                                                    //orderDeliveryMode: "SPT_HOME",
                                                    rcAmount: serviceData?.totalRc,
                                                    nrcAmount: serviceData?.totalNrc,
                                                    isBundle: false,
                                                    isSplitOrder: true,
                                                    upfrontCharge: x?.upfrontCharge,
                                                    advanceCharge: x?.advanceCharge,
                                                    contactPreference: customerAddress?.contactPreferences || [
                                                        "CHNL004"
                                                    ],
                                                    product: [{
                                                        productId: Number(x?.productId),
                                                        productQuantity: Number(selectedRequestData?.mappingPayload?.find((ele) => ele?.productId === x?.productId)?.qty),
                                                        productAddedDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                                                        billAmount: Number(serviceData?.totalRc) + Number(serviceData?.totalNrc),
                                                        edof: moment().format('YYYY-MM-DD'),
                                                        productSerialNo: x?.productNo,
                                                        bundleId: null,
                                                        rcAmount: serviceData?.totalRc,
                                                        nrcAmount: serviceData?.totalNrc
                                                    }]
                                                }
                                                if (x?.selectedContract && Array.isArray(x?.selectedContract)) {
                                                    for (const contract of x?.selectedContract) {
                                                        ordeReqObj.product[0].contract = Number(contract)
                                                        list.push(ordeReqObj)
                                                    }
                                                } else {
                                                    list.push(ordeReqObj)
                                                }
                                            });
                                            const requestBody = {
                                                customerUuid: customerData?.customerUuid,
                                                orderCategory: "OC_N",
                                                orderSource: "CC",
                                                orderType: "OT_SU",
                                                orderChannel: "WALKIN",
                                                orderCause: "CHNL024",
                                                orderPriority: "PRTYHGH",
                                                billAmount: Number(serviceData?.totalRc) + Number(serviceData?.totalNrc),
                                                orderDescription: "New Sign up Order",
                                                appointmentList: [],
                                                order: list,
                                            }
                                            post(properties.ORDER_API + '/create', requestBody)
                                                .then((resp) => {
                                                    if (resp.data) {
                                                        if (resp.status === 200) {
                                                            getRequestData();
                                                            openApproveRejectModal('close');
                                                            toast.success(resp.message);
                                                            setReason("");
                                                        } else {
                                                            toast.error("Failed to create - " + resp.status);
                                                        }
                                                    }
                                                })
                                                .catch((error) => {
                                                    console.error(error)
                                                })
                                                .finally();
                                        }
                                    }
                                }).catch((error) => {
                                    console.log(error)
                                })
                        }
                    }).catch((error) => {
                        console.error(error)
                    }).finally();
                } else {
                    toast.error(resp.message);
                }
            }).catch(error => {
                console.log(error);
                toast.error("Request could not be " + requestStatusFlag + "ed");
            }).finally(() => setSubmitting(false));
        }
    }

    return (
        <React.Fragment>
            <DynamicTable
                listSearch={listSearch}
                listKey={screenAction}
                row={requestData}
                rowCount={totalCount}
                header={requestColumns}
                itemsPerPage={perPage}
                backendPaging={true}
                isScroll={false}
                url={getRequestDataAPI + `?limit=${totalCount}&page=0`}
                customClassName={'table-sticky-header'}
                backendCurrentPage={currentPage}
                isTableFirstRender={isTableFirstRender}
                hasExternalSearch={hasExternalSearch}
                method='POST'
                // exportBtn={exportBtn}
                // customButtons={(
                //     (tab.id == 'my-request' && requestStatus !== 'closed') && (
                //         <button onClick={() => console.log()} type="button" className="skel-btn-submit">
                //             Add Request
                //         </button>
                //     )
                // )}
                handler={{
                    handleCellRender: handleCellRender,
                    handlePageSelect: handlePageSelect,
                    handleItemPerPage: setPerPage,
                    handleCurrentPage: setCurrentPage,
                    handleFilters: setFilters,
                    handleExportButton: setExportBtn
                }}
            />
            <Modal isOpen={openModal} onRequestClose={() => openApproveRejectModal('close')} style={RegularModalCustomStyles}>
                <div className="">
                    <div className="modal-content">
                        <div className="modal-header">
                            {selectedRequestData?.entityType === "AI_REQUEST" ? <h4 className="modal-title">Request - {selectedRequestData?.requestNo}</h4> : <h4 className="modal-title">Request - {selectedRequestData?.entityType} - {selectedRequestData?.requestNo}</h4>}
                            <button type="button" className="close" onClick={() => openApproveRejectModal('close')}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {selectedRequestData?.entityType !== "AI_REQUEST" ? <fieldset className="scheduler-border">
                                <table className='table table-bordered'>
                                    <thead>
                                        <tr>
                                            <th scope="col">Property</th>
                                            <th scope="col">Previous value</th>
                                            <th scope="col">Current value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedRequestData?.mappingPayload?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.label}</td>
                                                <td>{item.previousValueDesc ? item.previousValueDesc : item.previousValue}</td>
                                                <td><strong>{item.currentValueDesc ? item.currentValueDesc : item.currentValue}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="form-group">
                                    <label className="form-label">Reason</label>
                                    <textarea className="form-control" onChange={({ target: { value } }) => setReason(value)}></textarea>
                                </div>
                            </fieldset>
                                : <fieldset className="scheduler-border">
                                    <table className='table table-bordered'>
                                        {console.log('selectedRequestData?.rows----->', selectedRequestData)}
                                        <thead>
                                            <tr>
                                                <th scope="col">Product name</th>
                                                <th scope="col">Qty</th>
                                                <th scope="col">Requested by Dept</th>
                                                <th scope="col">Requested by Role</th>
                                                <th scope="col">Requested by Name</th>
                                                <th scope="col">Requested date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedRequestData?.row?.rows?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item?.productName}</td>
                                                    <td>{selectedRequestData?.mappingPayload?.find((ele) => ele?.productId == item?.productId)?.qty}</td>
                                                    <td>{item?.productName}</td>
                                                    <td>{item?.productName}</td>
                                                    <td><strong>{selectedRequestData?.createdUser?.firstName + ' ' + selectedRequestData?.createdUser?.lastName}</strong></td>
                                                    <td>{moment(selectedRequestData?.requestDate).format('DD-MM-YYYY')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="form-group">
                                        <label className="form-label">Reason</label>
                                        <textarea className="form-control" onChange={({ target: { value } }) => setReason(value)}></textarea>
                                    </div>
                                </fieldset>
                            }

                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <button className="skel-btn-cancel" disabled={submitting} type="button" onClick={() => openApproveRejectModal('close')}>Close</button>
                                <button className="skel-btn-submit" disabled={submitting} type="button" onClick={() => approveOrRejectRequest('approve')}>Approve</button>
                                <button className="skel-btn-submit bg-danger" style={{ borderColor: '#f86262' }} disabled={submitting} type="button" onClick={() => approveOrRejectRequest('reject')}>Reject</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </React.Fragment>
    )
}

export default RequestTable;