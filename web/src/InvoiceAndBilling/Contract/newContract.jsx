
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, Element } from 'react-scroll';

import { properties } from '../../properties';
import { get, put } from '../../common/util/restUtil';
import CreateContract from "./CreateContract";
import { ContractDetailCols, ContractDetailEditCols, ContractEditSerachCols, NewContractEditColumns } from "./contractSerachCols"
import DynamicTable from '../../common/table/DynamicTable';
import { NumberFormatBase } from 'react-number-format';
// import ViewEditContractTable from '../Billling/ViewEditContractTable';
import SearchCustomerContract from './searchCustomerModal';
import moment from 'moment';
import CreateContractDetail from './CreateDetailForm';
import { USNumberFormat } from '../../common/util/util';
import { toast } from 'react-toastify';
import { AppContext } from '../../AppContext';



const NewContract = (props) => {
    const [viewContractDetails, setviewContractDetails] = useState(false)
    const [billRefNbr, setBillRefNbr] = useState(props.location.state?.data?.viewContractDetails === false ? "" : props?.location?.state?.data?.rowData?.account[0]?.accountNo);
    const [isContractModalOpen, setIsContractModalOpen] = useState({ openModal: false });
    const [data, setData] = useState();
    const [contractData, setContractData] = useState([]);
    const [contractDetailData, setContractDetailData] = useState([])
    const [exportBtn, setExportBtn] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isContractCreateModalOpen, setIsContractCreateModalOpen] = useState(false)
    const [selectedContractId, setSelectedcontractId] = useState("")
    const [isAddContractDetail, setIsAddContractDetail] = useState(false);
    const [refresh, setRefresh] = useState(false)
    const [modifiedDate, setModifiedDate] = useState("")
    const editRef = useRef(null)
    const [customerData, setCustomerData] = useState({})
    const [contractId, setContractId] = useState()
    const { auth } = useContext(AppContext)
    const [userPermission, setUserPermission] = useState({ createContract: false })
    const [selectedContract,setSelectedContract] = useState({})
    const [selectedRow,setSelectedRow] = useState()
    const [highlightRow,setHighlightRow] = useState(true)
    useEffect(() => {
        // if (props.data === undefined) { setIsOpen(false) }
        let rolePermission = []
        
        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)
            if (property[0] === "Contract") {
                let value = Object.values(e)
                rolePermission = Object.values(value[0])
            }
        })

        let create;
        rolePermission.map((screen) => {
            if (screen.screenName === "Create Contract") {
                create = screen.accessType
            }

        })
        setUserPermission({ createContract: create })

        
    }, [auth])

    useEffect(() => {

        let details = []
        contractData.map((p) => {
            if (Number(selectedContractId) === Number(p.contractId)) {
                details = p.contractDetail
            }
        })
        setContractDetailData(details?.sort((a, b) => Number(b?.contractDtlId) - Number(a?.contractDtlId)))

    }, [selectedContractId])

    useEffect(() => {

        if (props.location.state === undefined)
            return;
        setData(props.location.state.data.rowData)
        setviewContractDetails(props.location.state.data.viewContractDetails)
        if (props.location.state.data.viewContractDetails === true) {
            setIsEdit(true)
        }

        
        get(properties.CONTRACT_API + "/customer/" + props.location.state.data.rowData.customerId).then((resp) => {
            if (resp.data) {
                setContractData(resp?.data?.sort((a, b) => Number(b?.contractId) - Number(a?.contractId)))
                if (!!resp?.data?.length && !!resp?.data[0]?.contractDetail.length) {
                    if(selectedContractId !== "")
                    {
                        resp?.data?.map((contract,index) => {
                            if(Number(selectedContractId) === Number(contract?.contractId))
                            {
                                setContractDetailData(contract?.contractDetail?.sort((a, b) => Number(b?.contractDtlId) - Number(a?.contractDtlId)))
                                setSelectedContract(contract)
                                setSelectedRow(index)
                            }
                        })
                    }
                    else
                    {
                        setContractDetailData(resp.data[0]?.contractDetail?.sort((a, b) => Number(b?.contractDtlId) - Number(a?.contractDtlId)))
                        setSelectedcontractId(resp.data[0]?.contractDetail[0]?.contractId)
                        setSelectedRow(0)
                        setSelectedContract(resp.data[0])
                    }
                }
            }
        }).catch(error => console.log(error)).finally()
    }, [refresh])

    useEffect(() => {
        if (props.location.state !== undefined) {
            
            get(properties.CUSTOMER360_API + '/' + props?.location?.state?.data?.rowData?.customerId)
                .then((response) => {
                    setCustomerData(response?.data)
                })
                .catch(error => console.log(error))
                .finally()
        }
    }, [])

    const pageRefresh = () => {
        
        get(properties.CONTRACT_API + "/customer/" + props?.location?.state?.data?.rowData?.customerId).then((resp) => {
            if (resp.data) {
                console.log(resp.data)
                setContractData(resp?.data?.sort((a, b) => Number(b?.contractId) - Number(a?.contractId)))
            }
        }).catch(error => console.log(error)).finally()
    }
    const handleClick = () => {

        setIsContractModalOpen({ openModal: true })

    }
    const handleEdit = (data) => {
        setContractId(Number(data));
        setSelectedcontractId(Number(data))
        
        setTimeout(() => {
            editRef && editRef.current !== null && editRef.current.scrollIntoView({ top: editRef.current.offsetTop, behavior: 'smooth', block: "start" })
            
        }, 2000)
    }
    const handleDone = (data) => {
        let body = {}
        let url = ""
        let id = ""
        if (modifiedDate === "") {
            toast.error("Please Select the Date")
            return
        }
        setContractData(
            contractData.map((c) => {
                if (Number(c.contractId) === Number(contractId)) {
                    //c.actualEndDate = modifiedDate
                    //body.actualEndDate = modifiedDate
                    c.endDate = modifiedDate
                    body.endDate = modifiedDate
                    url = ''
                    id = c.contractId
                }
                return c
            })
        )
        handleDateChange(url, id, body)
        setContractId();
    }

    const handleDateChange = (url, id, body) => {
        
        put(`${properties.CONTRACT_API}${url}/${Number(id)}`, body)
            .then((response) => {
                if (response.status === 200) {
                    setModifiedDate('')
                    toast.success(`${response.message}`)
                    setRefresh(!refresh)
                    //pageRefresh()
                }
            })
            .catch((error) => {
                toast.error(`${error}`)
            })
            .finally()
    }

    const handleSelectContract = (data) => {
        setSelectedContract(data)
        setSelectedcontractId(data?.contractId) ;
        setIsAddContractDetail(false)
    }

    const handleContractCellRender = (cell, row) => {

        if (cell.column.Header === "Contract Id") {
            return (
                <>
                    {
                        Number(selectedContractId) === Number(row?.original?.contractId) ?
                            <div className="cursor-pointer pr-1 pl-1 pt-1 pb-1" style={{ backgroundColor: "grey", border: "1px solid black", borderRadius: "10px" }} onClick={() => { handleSelectContract(row?.original) }}>{cell.value}</div>
                            :
                            <span className="cursor-pointer pr-1 pl-1 pt-1 pb-1" onClick={() => { handleSelectContract(row?.original)}}>{cell.value}</span>
                    }
                </>


            )
        }
        else if (cell.column.Header === "Edit") {
            return (
                <>
                    {
                        Number(contractId) !== Number(row?.original?.contractId) ?
                            <button className="btn waves-effect waves-light btn-primary btn-sm"
                                onClick={() => { handleEdit(row.original?.contractId) }}
                            >
                                Edit
                            </button>
                            :
                            <>
                                <button className="btn waves-effect waves-light btn-primary btn-sm mr-2"
                                    onClick={() => { handleDone(row.original) }}
                                >
                                    Done
                                </button>
                                <button className="btn waves-effect waves-light btn-primary btn-sm"
                                    onClick={() => { setContractId(); setModifiedDate('') }}
                                >
                                    Cancel
                                </button>
                            </>
                    }
                </>

            )
        }
        else if (cell.column.Header === "Status") {
            return (
                <span>{row?.original?.statusDesc?.description}</span>
            )
        }
        else if (["Actual Contract Start Date", "Last Bill Period", "Next Bill Period", "Bill Period"].includes(cell.column.Header)) {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Contract End Date") {
            return (
                <>
                    {
                        Number(contractId) === Number(row?.original?.contractId) ?
                            <input ref={editRef} type="date" className="form-control" value={modifiedDate} onChange={(e) => { setModifiedDate(e.target.value) }} />
                            :
                            <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
                    }
                </>
            )
        }
        else if (cell.column.Header === "Contract Start Date") {
            let data = row?.original?.startDate
            return (
                <span>{data ? moment(data).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (["RC", "OTC", "Usage", "Credit Adjustment", "Debit Adjustment", "Total Charge"].includes(cell.column.Header)) {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Customer Name") {
            return (
                <span>{data?.firstName + " " + data?.lastName}</span>
            )
        }
        else if (cell.column.Header === "Customer Number") {
            return (
                <span>{data?.crmCustomerNo}</span>
            )
        }
        else if (cell.column.Header === "Service Number") {
            let sNo = row?.original?.identificationNo
            return (
                <span>{sNo}</span>
            )
        }
        else if (['Updated At', 'Created At'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{row?.original?.createdByName?.firstName + " " + row?.original?.createdByName?.lastName}</span>)
        }
        else if (cell.column.Header === "Updated By") {
            return (<span>{row?.original?.updatedByName?.firstName + " " + row?.original?.updatedByName?.lastName}</span>)
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Last Bill Period" || cell.column.Header === "Next Bill Period" || cell.column.Header === "Bill Period") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Contract Start Date" || cell.column.Header === "Contract End Date") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        // else if (cell.column.Header === "Actual Start Date" || cell.column.Header === "Contract Start Date") {
        //     let date = row?.original?.actualStartDate
        //     return (
        //         <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
        //     )
        // }
        // else if (cell.column.Header === "Actual End Date") {
        //     return (
        //         <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
        //     )
        // }
        // else if (cell.column.Header === "Contract End Date" || cell.column.Header === "End Date") {
        //     let date = row?.original?.endDate
        //     return (
        //         <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
        //     )
        // }
        else if (cell.column.Header === "Billable Reference Number") {
            let billRefNo = contractData[0]?.billRefNo
            return (
                <span>{billRefNo}</span>
            )
        }
        else if (cell.column.Header === "Status") {
            return (
                <span>{row?.original?.statusDesc?.description}</span>
            )
        }
        else if (cell.column.Header === "Charge Name") {
            return (
                <span>{row?.original?.charge?.chargeName ? row?.original?.charge?.chargeName : row?.original?.chargeName}</span>
            )
        }
        else if (cell.column.Header === "Charge Type") {
            return (
                <span>{row?.original?.charge?.chargeCat ? row?.original?.charge?.chargeCatDesc?.description : row?.original?.chargeTypeDesc?.description}</span>
            )
        }
        else if (cell.column.Header === "Tier Type") {
            return (
                <span>{cell.value === 'Y' ? 'Yes' : cell.value === 'N' ? 'No' : '-'}</span>
            )
        }
        else if (["RC", "OTC", "Usage", "Credit Adjustment", "Debit Adjustment", "Total Amount"].includes(cell.column.Header)) {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (["Balance Amount"].includes(cell.column.Header)) {
            return (
                <span>{row?.original?.chargeType === 'CC_USGC' ? "" : USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Prorated") {
            return (
                <span>{cell.value === 'Y' ? 'Yes' : cell.value === 'N' ? 'No' : '-'}</span>
            )
        }
        else if (cell.column.Header === "Service Number") {
            let sNo = row?.original?.identificationNo
            return (
                <span>{sNo}</span>
            )
        }
        else if (cell.column.Header === "Fee Type") {
            let frequency = row?.original?.frequencyDesc?.description
            return (
                <span>{frequency || "-"}</span>
            )
        }
        else if (['Updated At', 'Created At'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{row?.original?.createdByName?.firstName + " " + row?.original?.createdByName?.lastName}</span>)
        }
        else if (cell.column.Header === "Updated By") {
            return (<span>{row?.original?.updatedByName?.firstName + " " + row?.original?.updatedByName?.lastName}</span>)
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    return (
        <>
            {
                userPermission.createContract !== "deny" &&
                <div>
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title">Create Contract</h4>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-1">
                        <div className="col-12 p-0">
                            <div className="card-box">
                                <div className="d-flex">
                                    <div className="col-md-2 p-0 sticky">
                                        <ul className="list-group">
                                            <li><Link activeclassName="active" className="list-group-item list-group-item-action" to="customersection" spy={true} offset={-130} smooth={true} duration={100}>Customer Details</Link></li>
                                            <li><Link activeclassName="active" className="list-group-item list-group-item-action" to="catalogueOffer" spy={true} offset={-120} smooth={true} duration={100}>Contract</Link></li>
                                            <li><Link activeclassName="active" className="list-group-item list-group-item-action" to="catalogueOffer" spy={true} offset={-120} smooth={true} duration={100}>Contract Details</Link></li>
                                        </ul>
                                    </div>
                                    <div className="col-md-10">
                                        <div className="scrollspy-div h-100">
                                            <Element>
                                                <div className="row">
                                                    <div className="col-4 ml-4 mt-4">
                                                        <label htmlFor="inputState" className="col-form-label">Billable Reference Number</label>
                                                        <div className="input-group input-group-sm ">
                                                            <NumberFormatBase className="form-control" type="text" value={billRefNbr}
                                                                onChange={(e) => {
                                                                    setBillRefNbr(e.target.value);

                                                                }}
                                                                onKeyPress={(e) => {
                                                                    if(e.key === "Enter")
                                                                    {
                                                                        handleClick()
                                                                    }
                                                                }}
                                                            />
                                                            &nbsp;
                                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light "
                                                                onClick={() => handleClick()} >
                                                                <i className="fa fa-search fa-fw"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Element>
                                            <br />
                                            <Element className={`${data ? '' : 'd-none'}`}>
                                                <div className="row">
                                                    <section className="triangle col-12">
                                                        <div className="row col-12">
                                                            <div className="col-12">
                                                                <h4 id="list-item-0" className="pl-1">Customer Details</h4>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>
                                                <div className="col-md-12 card-box m-0 ">
                                                    <div className="row pt-1">
                                                        <div className="col-md-3">
                                                            <div className="form-group ">
                                                                <label htmlFor="inputState" className="col-form-label">Customer Number</label>
                                                                <p>{customerData && customerData?.crmCustomerNo || '-'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group ">
                                                                <label htmlFor="inputState" className="col-form-label">Customer Name</label>
                                                                <p>{customerData ? (customerData?.firstName + " " + customerData?.lastName) : '-'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-3">
                                                            <div className="form-group ">
                                                                <label htmlFor="inputState" className="col-form-label">Billable Reference Number</label>
                                                                <p>{data?.account[0]?.accountNo || '-'}</p>
                                                            </div>
                                                        </div>
                                                        {/* </div>
                                            <div className="row pt-1"> */}
                                                        <div className="col-md-3">
                                                            <div className="form-group ">
                                                                <label htmlFor="inputState" className="col-form-label">Customer Type</label>
                                                                <p>{customerData && customerData?.customerTypeDesc?.description || '-'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group ">
                                                                <label htmlFor="inputState" className="col-form-label">Customer Created Date</label>
                                                                <p>{customerData && moment(customerData?.createdAt).format('DD MMM YYYY') || '-'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group ">
                                                                <label htmlFor="inputState" className="col-form-label">Account Manager</label>
                                                                <p>{customerData?.billableDetails?.salesAgent || '-'}</p>
                                                            </div>
                                                        </div>
                                                        {/* </div>
                                            <div className="row pt-1"> */}
                                                        <div className="col-md-3">
                                                            <div className="form-group ">
                                                                <label htmlFor="inputState" className="col-form-label">Currency</label>
                                                                <p>{customerData?.billableDetails?.currencyDesc?.description || '-'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group ">
                                                                <label htmlFor="inputState" className="col-form-label">Customer Status</label>
                                                                <p>{customerData && customerData?.statusDesc?.description || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Element>
                                            <br />
                                            <Element className={`${data ? '' : 'd-none'}`}>
                                                <div className="row">
                                                    <section className="triangle col-12">
                                                        <div className="row col-12">
                                                            <div className="col-10">
                                                                <h4 id="list-item-0" className="pl-1">Contract</h4>
                                                            </div>
                                                            <div className="col-2 adjus-btn pt-1">
                                                                <button type="button"
                                                                    className="btn btn-primary btn-sm waves-effect waves-light"
                                                                    onClick={(e) => { setIsContractCreateModalOpen({ openModal: true }) }}>
                                                                    Create Contract
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>
                                                {!!contractData?.length &&
                                                    <div className="card p-2">
                                                        {
                                                            contractData && contractData?.length > 0 &&
                                                            <DynamicTable
                                                                row={contractData}
                                                                filterRequired={false}
                                                                selectedRow={highlightRow ? selectedRow : null}
                                                                itemsPerPage={10}
                                                                header={ContractEditSerachCols}
                                                                hiddenColumns={NewContractEditColumns}
                                                                handler={{
                                                                    handleCellRender: handleContractCellRender,
                                                                }}
                                                            />
                                                        }
                                                        {/* <ViewEditContractTable
                                                    data={{
                                                        tableList: contractData,
                                                        headersToRemove: true ? ["contractDetail", "customerId", "accountId", "contractName", "createdBy", 'createdAt', 'updatedBy', 'updatedAt'] : ["contractDetail"],
                                                        editingFieldsIndexes: [5],
                                                        isEdit: true,
                                                        endPointURL: `${properties.CONTRACT_API}`,
                                                        entityKey: 'contractId',
                                                        isClickAble: true,
                                                        columnHeader: "contractId",
                                                        scrollViewName: "entity"
                                                    }}
                                                    handler={{
                                                        pageRefresh: pageRefresh,
                                                        setSelectedcontractId
                                                    }}
                                                /> */}
                                                    </div>
                                                }
                                            </Element>
                                            <br />
                                            <Element className={`${data ? '' : 'd-none'}`}>
                                                <div className="row">
                                                    <section className="triangle col-12">
                                                        <div className="row col-12">
                                                            <div className="col-10">
                                                                <h4 id="list-item-0" className="pl-1">Contract Details</h4>
                                                            </div>
                                                            <div className="col-2 adjus-btn pt-1 pl-5 d-none">
                                                                <button type="button"
                                                                    className="btn btn-primary btn-sm waves-effect waves-light"
                                                                    onClick={() => setIsAddContractDetail(!isAddContractDetail)} >
                                                                    {
                                                                        isAddContractDetail ? 'Cancel' : 'Add'
                                                                    }
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>
                                                {
                                                    isAddContractDetail &&
                                                    <div className="p-2">
                                                        <CreateContractDetail
                                                            data={{
                                                                selectedContractId: selectedContractId,
                                                                customer: data,
                                                                refresh: refresh,
                                                                contractData: selectedContract
                                                            }}
                                                            handler={{
                                                                pageRefresh: pageRefresh,
                                                                setRefresh: setRefresh,
                                                                setIsOpen: setIsAddContractDetail
                                                            }}
                                                        />
                                                    </div>
                                                }
                                                {
                                                    contractDetailData && contractDetailData?.length > 0 &&
                                                    <div className="card p-2">
                                                        <DynamicTable
                                                            listKey={"Contract List"}
                                                            exportBtn={exportBtn}
                                                            row={contractDetailData}
                                                            itemsPerPage={10}
                                                            filterRequired={false}
                                                            header={ContractDetailEditCols}
                                                            hiddenColumns={['contractRefId', 'totalCharge', 'billPeriod', 'select', 'remove', 'edit', 'ageingDays']}
                                                            handler={{
                                                                handleCellRender: handleCellRender,
                                                                handleExportButton: setExportBtn
                                                            }}
                                                        />
                                                    </div>
                                                }
                                            </Element>
                                        </div>
                                        <br></br>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {isContractModalOpen.openModal === true &&
                        <SearchCustomerContract
                            data={{
                                billRefNbr: billRefNbr,
                                isOpen: isContractModalOpen,

                            }}
                            modalStateHandlers={{
                                setIsOpen: setIsContractModalOpen,
                            }}
                        />}

                    {isContractCreateModalOpen.openModal === true &&
                        <CreateContract
                            data={{
                                isOpen: isContractCreateModalOpen,
                                customer: data,
                                refresh: refresh,

                            }}
                            modalStateHandlers={{
                                setIsOpen: setIsContractCreateModalOpen,
                                setRefresh: setRefresh,
                                setSelectedContractId: setSelectedcontractId
                            }}
                        />}
                </div>}
        </>
    )

}
export default NewContract;