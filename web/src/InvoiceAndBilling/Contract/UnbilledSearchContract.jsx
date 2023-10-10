import React, { useRef } from 'react';
import Modal from 'react-modal';
import { useState, useEffect } from 'react';
import { ContractSerachCols, contractHistoryDetailHiddenColumn, ContractDetailEditCols, contractSearchHiddenColumn } from './contractSerachCols';
import DynamicTable from '../../common/table/DynamicTable';
import moment from 'moment'
import { toast } from 'react-toastify';
import { string, object } from "yup";
import AdjustmentForm from '../BillGeneration/AdjustmentForm';

import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';
import { RegularModalCustomStyles, USNumberFormat } from '../../common/util/util';

const EditContract = (props) => {

    const { isOpen, contract, type, contractSearchHiddenColumns } = props?.data;
    const { setIsOpen, setContractSearchHiddenColumns } = props.handler;
    const [exportBtn, setExportBtn] = useState(false)
    const [contractList, setContractList] = useState([contract])
    const [contractDetailList, setContractDetailList] = useState(type === "billed" ? props?.data?.contract?.contractDetail : props?.data?.contract?.monthlyContractDtl)
    const [contractDetailHiddenColumns, setContractDetailHiddenColumns] = useState([])
    const [showAdjustmentForm, setShowAdjustmentForm] = useState(false)

    const initialState = {
        billRefNo: contractList[0]?.billRefNo,
        adjustmentCat: type === 'billed' ? "POSTBILL" : "PREBILL",
        allocationLevel: "",
        adjustmentType: "",
        reason: "",
        maxAdjAmount: 50,
        adjAmount: "",
        remarks: "",
    }

    const [selectedContractId, setSelectedContractId] = useState()
    const [modifiedDate, setModifiedDate] = useState()
    const [adjustmentInputs, setAdjustmentInputs] = useState(initialState);
    const [adjustmentInputsErrors, setAdjustmentInputsErrors] = useState({});
    const [showContractDetails, setShowContractDetails] = useState(true)
    const editRef = useRef(null)
    const editDetailRef = useRef(null)
    const AdjustmentValidationSchema = object().shape({
        adjustmentType: string().required("Adjustment Type is required"),
        allocationLevel: string().required("Service Allocation is required"),
        reason: string().required("Reason is required")
    });

    const handleAddAdjustment = () => {
        setShowAdjustmentForm(true)
        handleOnClear()
        setShowContractDetails(false)
    }
    const handleBackAdjustment = () => {
        setShowAdjustmentForm(false)
        handleOnClear()
        setShowContractDetails(true)
    }


    const validate = (schema, data) => {
        try {
            setAdjustmentInputsErrors({});
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setAdjustmentInputsErrors((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleOnSubmit = () => {
        if (validate(AdjustmentValidationSchema, adjustmentInputs)) {
            return;
        }
        let body = {
            ...adjustmentInputs,
            contractId: [contractList[0]?.contractId]
        }
        let contractDtlId = []
        let found = false
        if (adjustmentInputs.allocationLevel === 'CONTRACTCHARGE') {
            contractDetailList && !!contractDetailList.length && contractDetailList.map((c) => {
                if (c.select === 'Y') {
                    contractDtlId.push(Number(c.contractDtlId))
                }
            })
            if (contractDtlId.length === 0) {
                found = true
                toast.error("Please Select the Contract Charge Details")
            }
        }
        if (found === true) {
            return
        }
        if (contractDtlId.length > 0) {
            body.contractDetId = contractDtlId
        }
        console.log("Adjustment: ", body)
        
        post(properties.ADJUSTMENT_API, body)
            .then((resp) => {
                if (resp.status === 200) {
                    toast.success("Adjustment added successfully")
                    setIsOpen(false)
                }
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
    }

    const handleOnClear = () => {
        setAdjustmentInputsErrors({})
        setAdjustmentInputs(initialState)
        setShowContractDetails(true)
    }

    useEffect(() => {
        if (type === "billed") {
            setContractSearchHiddenColumns(['billPeriod', 'contractStartDate', 'contractRefId', 'chargeName', 'totalCharge', 'itemName', 'serviceNumber', 'select'])
            setContractDetailHiddenColumns(['contractRefId', 'totalCharge', 'billPeriod', 'contractStartDate', 'contractEndDate', 'select', 'remove'])
        }
        else if (type === "unbilled") {
            setContractSearchHiddenColumns(['nextBillPeriod', 'lastBillPeriod', 'status', 'actualEndDate', 'startDate', 'contractRefId', 'chargeName', 'totalCharge', 'itemName', 'serviceNumber', 'select'])
            setContractDetailHiddenColumns(['lastBillPeriod', 'nextBillPeriod', 'contractRefId', 'totalCharge', 'status', 'actualStartDate', 'actualEndDate', 'select', 'remove'])
        }
    }, [isOpen, showAdjustmentForm])

    useEffect(() => {
        if (adjustmentInputs.allocationLevel === 'CONTRACTCHARGE') {
            setShowContractDetails(true)
        }
        else if (adjustmentInputs.allocationLevel === 'CONTRACT') {
            setShowContractDetails(false)
        }
    }, [adjustmentInputs.allocationLevel])

    const handleOnModelClose = () => {
        setIsOpen(false);
    }

    const handleContractDetailAdjustment = (e, data) => {
        setContractDetailList(
            contractDetailList.map((c) => {
                if (type === 'billed' ? Number(c?.contractDtlId) === Number(data?.contractDtlId) : Number(c?.monthlyContractDtlId) === Number(data?.monthlyContractDtlId)) {
                    if (e.target.checked === true) {
                        c.select = 'Y'
                    }
                    else if (e.target.checked === false) {
                        c.select = 'N'
                    }
                }
                return c
            })
        )
    }


    const handleEdit = (data) => {
        setSelectedContractId(Number(data));
        
        setTimeout(() => {
            editRef && editRef.current !== null && editRef.current.scrollIntoView({ behavior: 'smooth', block: "start" })
            
        }, 2000)
    }

    const handleDone = (data) => {
        setContractList(
            contractList.map((c) => {
                if (Number(c.contractId) === Number(selectedContractId)) {
                    if (type === "billed") {
                        c.actualEndDate = modifiedDate
                    }
                    else if (type === "unbilled") {
                        c.endDate = modifiedDate
                    }
                }
                return c
            })
        )
        setSelectedContractId();
    }

    const handleEditDetails = (data) => {
        setSelectedContractId(Number(data));
        
        setTimeout(() => {
            editDetailRef && editDetailRef.current !== null && editDetailRef.current.scrollIntoView({ behavior: 'smooth', block: "start" })
            
        }, 2000)
    }

    const handleDoneDetails = (data) => {
        setContractDetailList(
            contractDetailList.map((c) => {
                if (type === 'billed' ? (Number(c.contractDtlId) === Number(selectedContractId)) : (Number(c.monthlyContractDtlId) === Number(selectedContractId))) {
                    c.endDate = modifiedDate
                }
                return c
            })
        )
        setSelectedContractId();
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Edit") {
            return (
                <>
                    {
                        Number(selectedContractId) !== Number(row?.original?.contractId) ?
                            <button className="btn waves-effect waves-light btn-primary btn-sm"
                                onClick={() => { handleEdit(row.original?.contractId) }}
                            >
                                Edit
                            </button>
                            :
                            <button className="btn waves-effect waves-light btn-primary btn-sm"
                                onClick={() => { handleDone(row.original) }}
                            >
                                Done
                            </button>
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
        else if (cell.column.Header === "Actual Contract End Date" || cell.column.Header === "Contract End Date") {
            return (
                <>
                    {
                        ((type === "billed" && cell.column.Header === "Actual Contract End Date") || (type === "unbilled" && cell.column.Header === "Contract End Date")) ?
                            <>
                                {
                                    Number(selectedContractId) === Number(row?.original?.contractId) ?
                                        <input ref={editRef} type="date" className="form-control" value={modifiedDate} onChange={(e) => { setModifiedDate(e.target.value) }} />
                                        :
                                        <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
                                }
                            </>
                            :
                            <>
                                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
                            </>
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
        else if (["RC", "NRC", "Usage", "Credit Adjustment", "Debit Adjustment", "Total Charge"].includes(cell.column.Header)) {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Customer Name") {
            let name = row?.original?.customer?.firstName + " " + row?.original?.customer?.lastName
            return (
                <span>{name}</span>
            )
        }
        else if (cell.column.Header === "Customer Number") {
            let cNo = row?.original?.customer?.crmCustomerNo
            return (
                <span>{cNo}</span>
            )
        }
        else if (cell.column.Header === "Service Number") {
            let sNo = row?.original?.identificationNo
            return (
                <span>{sNo}</span>
            )
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }
    const handleCellRenderDetail = (cell, row) => {
        if (cell.column.Header === "Edit") {
            return (
                <>
                    {
                        Number(selectedContractId) !== Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "") ?
                            <button className="btn waves-effect waves-light btn-primary btn-sm"
                                onClick={() => { handleEditDetails(type === 'billed' ? row.original?.contractDtlId : row.original?.monthlyContractDtlId) }}
                            >
                                Edit
                            </button>
                            :
                            <button className="btn waves-effect waves-light btn-primary btn-sm"
                                onClick={() => { handleDoneDetails(row.original) }}
                            >
                                Done
                            </button>
                    }
                </>

            )
        }
        else if (cell.column.Header === "Select") {
            return (
                <div className="form-check">
                    <input id={`mandatory${row.original.monthlyContractDtlId}`} className="form-check-input position-static checkmark" type="checkbox" checked={cell.value === "Y" ? true : false} value={cell.value}
                        onChange={(e) => { handleContractDetailAdjustment(e, row.original) }}
                    />
                </div>
            )
        }
        else if (["Actual End Date", "Actual Start Date", "Last Bill Period", "Next Bill Period", "Bill Period"].includes(cell.column.Header)) {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Start Date") {
            let date = row?.original?.actualStartDate
            return (
                <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "End Date") {
            return (
                <>
                    {
                        Number(selectedContractId) === Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "") ?
                            <input type="date" ref={editDetailRef} className="form-control" value={modifiedDate} onChange={(e) => { setModifiedDate(e.target.value) }} />
                            :
                            <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
                    }
                </>
            )
        }

        else if (cell.column.Header === "Billable Reference Number") {
            let billRefNo = contractList[0]?.billRefNo
            return (
                <span>{billRefNo}</span>
            )
        }
        else if (cell.column.Header === "Status") {
            return (
                <span>{row?.original?.statusDesc?.description}</span>
            )
        }
        else if (["RC", "NRC", "Usage", "Credit Adjustment", "Debit Adjustment", "Charge Amount"].includes(cell.column.Header)) {
            return (
                <span>{USNumberFormat(cell.value)}</span>
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
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    return (
        <Modal isOpen={isOpen} contentLabel="Contract Search Modal" style={RegularModalCustomStyles}>

            <div className="modal-content">
                <div className="modal-header">
                    <h4 className="modal-title">Edit {type === "billed" ? "Contract" : type === "unbilled" ? "Unbilled Contract" : "Contract History"}</h4>
                    {
                        <div className="paybill2 pr-3">
                            {
                                showAdjustmentForm === false ?
                                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light"
                                        onClick={() => {
                                            handleAddAdjustment()
                                        }}
                                    >
                                        Adjustment
                                    </button>
                                    :
                                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light"
                                        onClick={() => {
                                            handleBackAdjustment()
                                        }}
                                    >
                                        Back
                                    </button>
                            }

                        </div>
                    }
                    <button type="button" className="close" onClick={handleOnModelClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="adjusment modal-body">
                    {
                        showAdjustmentForm &&
                        <div className="p-2">
                            <fieldset className="scheduler-border" id="prebill">
                                <AdjustmentForm
                                    data={{
                                        adjustmentInputs: adjustmentInputs,
                                        adjustmentInputsErrors: adjustmentInputsErrors
                                    }}
                                    handler={{
                                        setAdjustmentInputsErrors: setAdjustmentInputsErrors,
                                        setAdjustmentInputs: setAdjustmentInputs
                                    }}
                                />
                                <div className="flex-row pre-bill-sec">
                                    <div className="col-12 p-1">
                                        <div id="customer-buttons" className="d-flex justify-content-center">
                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleOnSubmit}>Submit</button>
                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleOnClear}>Clear</button>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    }
                    <div className="row">
                        <section className="triangle col-12 pb-2">
                            <div className="row col-12">
                                <div className="col-19">
                                    <h4 id="" className="pl-3">Contract</h4>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="modal-body overflow-auto cus-srch">
                        {
                            contractList && contractList?.length > 0 &&
                            <div className="card">
                                <DynamicTable
                                    row={contractList}
                                    itemsPerPage={10}
                                    header={ContractSerachCols}
                                    hiddenColumns={showAdjustmentForm === true ? contractSearchHiddenColumn : contractSearchHiddenColumns}
                                    handler={{
                                        handleCellRender: handleCellRender,
                                    }}
                                />
                            </div>
                        }
                    </div>
                    {
                        showContractDetails &&
                        <>
                            <div className="row">
                                <section className="triangle col-12 pb-2">
                                    <div className="row col-12">
                                        <div className="col-10">
                                            <h4 id="" className="pl-3">Contract Detail</h4>
                                        </div>
                                        <div className="col mt-2 ml-5">
                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2">
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                            <div className="modal-body overflow-auto cus-srch">
                                {
                                    contractDetailList && contractDetailList?.length > 0 &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Contract List"}
                                            row={contractDetailList}
                                            itemsPerPage={10}
                                            header={ContractDetailEditCols}
                                            exportBtn={exportBtn}
                                            hiddenColumns={showAdjustmentForm === true ? contractHistoryDetailHiddenColumn : contractDetailHiddenColumns}
                                            handler={{
                                                handleCellRender: handleCellRenderDetail,
                                                handleExportButton: setExportBtn
                                            }}
                                        />
                                    </div>
                                }
                            </div>
                        </>
                    }
                </div>
            </div>
        </Modal>

    )
}

export default EditContract;