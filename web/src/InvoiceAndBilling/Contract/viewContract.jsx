import React from 'react';
import Modal from 'react-modal';
import { useState, useEffect } from 'react';
import { ContractSerachCols, contractHistoryDetailHiddenColumn, ContractDetailEditCols } from './contractSerachCols';
import DynamicTable from '../../common/table/DynamicTable';
import moment from 'moment'
import { toast } from 'react-toastify';
import { string, object } from "yup";
import AdjustmentForm from '../BillGeneration/AdjustmentForm';

import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';
import { RegularModalCustomStyles, USNumberFormat } from '../../common/util/util';

const ViewContract = (props) => {

    const { isOpen, contract, type, contractSearchHiddenColumns } = props?.data;
    const { setIsOpen, handleCellRender, setContractSearchHiddenColumns, pageRefresh } = props.handler;
    const [exportBtn, setExportBtn] = useState(false)
    const contractList = [contract]
    const [contractDetailList, setContractDetailList] = useState(type === "billed" ? props?.data?.contract?.contractDetail : props?.data?.contract?.monthlyContractDtl)
    const [contractDetailHiddenColumns, setContractDetailHiddenColumns] = useState([ 'select', 'remove', 'edit'])
    const [showAdjustmentForm, setShowAdjustmentForm] = useState(false)
    const [amountRefresh, setAmountRefresh] = useState(false)

    const initialState = {
        billRefNo: contractList[0]?.billRefNo,
        adjustmentCat: "POSTBILL",
        allocationLevel: "",
        adjustmentType: "",
        reason: "",
        maxAdjAmount: 0,
        adjAmount: "",
        remarks: "",
    }

    const [adjustmentInputs, setAdjustmentInputs] = useState(initialState);
    const [adjustmentInputsErrors, setAdjustmentInputsErrors] = useState({});
    const [showContractDetails, setShowContractDetails] = useState(true)

    const AdjustmentValidationSchema = object().shape({
        adjustmentType: string().required("Adjustment Type is required"),
        allocationLevel: string().required("Service Allocation is required"),
        reason: string().required("Reason is required"),
        adjAmount: string().required("Adjustment Amount is required")
    });

    const handleAddAdjustment = () => {
        setShowAdjustmentForm(true)
        setShowContractDetails(false)
    }
    const handleBackAdjustment = () => {
        setShowAdjustmentForm(false)
        handleOnClear()
        setShowContractDetails(true)
        setIsOpen(false)
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
                    pageRefresh()
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
        let amount = 0
        contractDetailList && !!contractDetailList.length && contractDetailList.map((con) => {
            amount += Number(con?.chargeAmt)
        })
        initialState.maxAdjAmount = Number(amount)
        setAdjustmentInputs({ ...adjustmentInputs, maxAdjAmount: Number(amount) })
    }, [contract, amountRefresh])

    useEffect(() => {
        let amount = 0
        if (adjustmentInputs?.allocationLevel === 'CONTRACTCHARGE') {
            contractDetailList && !!contractDetailList.length && contractDetailList.map((c) => {
                if (c?.select === 'Y') {
                    amount += Number(c?.chargeAmt)
                }
            })
            initialState.maxAdjAmount = Number(amount)
            setAdjustmentInputs({ ...adjustmentInputs, maxAdjAmount: Number(amount) })
        }
    }, [contractDetailList])

    useEffect(() => {
        if (type === "billed") {
            setContractSearchHiddenColumns(['monthlyContractId', 'billPeriod', 'contractRefId', 'chargeName', 'totalCharge', 'itemName', 'serviceNumber', 'edit', 'select', 'isAdvanceAllowed', 'advAllocationPercent'])
            setContractDetailHiddenColumns(['contractRefId', 'totalCharge', 'billPeriod', 'select', 'remove', 'edit', 'ageingDays'])
        }
        else if (type === "unbilled") {
            setContractSearchHiddenColumns(['startDate','endDate','nextBillPeriod', 'lastBillPeriod', 'status', 'contractRefId', 'chargeName', 'totalCharge', 'edit', 'itemName', 'serviceNumber', 'select', 'billPeriod'])
            setContractDetailHiddenColumns(['lastBillPeriod', 'nextBillPeriod', 'contractRefId', 'totalCharge', 'status', 'select', 'remove', 'edit', 'billPeriod', 'balanceAmount'])
        }
        else {
            setContractSearchHiddenColumns(['contractRefId', 'totalCharge', 'billPeriod', 'nextBillPeriod', 'lastBillPeriod', 'status', 'edit', 'itemName', 'serviceNumber', 'select', 'remove'])
            setContractDetailHiddenColumns(['billPeriod', 'totalCharge', 'status', 'contractRefId', 'select', 'remove', 'edit', 'balanceAmount', 'lastBillPeriod', 'nextBillPeriod'])
        }
    }, [isOpen, showAdjustmentForm, type])

    useEffect(() => {
        if (adjustmentInputs.allocationLevel === 'CONTRACTCHARGE') {
            setShowContractDetails(true)
        }
        else if (adjustmentInputs.allocationLevel === 'CONTRACT') {
            setShowContractDetails(false)
        }
        setAmountRefresh(!amountRefresh)
    }, [adjustmentInputs.allocationLevel])

    const handleOnModelClose = () => {
        setIsOpen({ ...isOpen, openModal: false });
    }

    const handleContractDetailAdjustment = (e, data) => {
        setContractDetailList(
            contractDetailList.map((c) => {
                if (Number(c?.monthlyContractDtlId) === Number(data?.monthlyContractDtlId)) {
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

    const handleCellRenderDetail = (cell, row) => {

        if (cell.column.Header === "Select") {
            return (
                <div className="form-check">
                    <input id={`mandatory${row.original.monthlyContractDtlId}`} className="form-check-input position-static checkmark" type="checkbox" checked={cell.value === "Y" ? true : false} value={cell.value}
                        onChange={(e) => { handleContractDetailAdjustment(e, row.original) }}
                    />
                </div>
            )
        }
        else if (["Actual End Date", "Actual Start Date", "Last Bill Period", "Next Bill Period", "Contract Start Date", "Contract End Date"].includes(cell.column.Header)) {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (["Bill Period"].includes(cell.column.Header)) {
            let date = row?.original?.lastBillPeriod
            return (
                <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
            )
        }
        // else if (cell.column.Header === "Start Date") {
        //     let date = row?.original?.actualStartDate
        //     return (
        //         <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
        //     )
        // }
        // else if (cell.column.Header === "End Date") {
        //     let date = row?.original?.actualEndDate
        //     return (
        //         <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
        //     )
        // }
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
        else if (cell.column.Header === "Tier Type") {
            return (
                <span>{cell.value === 'Y' ? 'Yes' : cell.value === 'N' ? 'No' : '-'}</span>
            )
        }
        else if (["RC", "OTC", "Usage", "Credit Adjustment", "Debit Adjustment", "Total Amount","Total Charge"].includes(cell.column.Header)) {
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
        else if (cell.column.Header === "Fee Type") {
            let frequency = row?.original?.frequencyDesc?.description
            return (
                <span>{frequency || "-"}</span>
            )
        }
        else if (cell.column.Header === "Service Number") {
            let sNo = row?.original?.identificationNo
            return (
                <span>{sNo}</span>
            )
        }
        else if (['Updated At Date and Time', 'Created At Date and Time'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{(row?.original?.createdByName?.firstName || '') + " " + (row?.original?.createdByName?.lastName|| '')}</span>)
        }
        else if (cell.column.Header === "Updated By") {
            return (<span>{(row?.original?.updatedByName?.firstName || "") + " " + (row?.original?.updatedByName?.lastName || "")}</span>)
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    return (
        <Modal isOpen={isOpen.openModal} contentLabel="Contract Search Modal" style={RegularModalCustomStyles}>

            <div className="modal-content">
                <div className="modal-header">
                    <h4 className="modal-title">View {type === "billed" ? "Contract" : type === "unbilled" ? "Unbilled Contract" : "Contract History"}</h4>
                    {
                        type === "history" &&
                        <div className="paybill2 pr-3 d-none">
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
                        <section className="triangle col-12">
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
                                    filterRequired={false}
                                    itemsPerPage={10}
                                    header={ContractSerachCols}
                                    hiddenColumns={contractSearchHiddenColumns}
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
                                <section className="triangle col-12">
                                    <div className="row col-12">
                                        <div className="col-12">
                                            <h4 id="" className="pl-3">Contract Detail</h4>
                                        </div>
                                    </div>
                                </section>
                            </div>
                            <div className="modal-body overflow-auto cus-srch">
                                {console.log('contractDetailList----->',contractDetailList)}
                                {
                                    contractDetailList && contractDetailList?.length > 0 &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Contract List"}
                                            row={contractDetailList}
                                            filterRequired={false}
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

export default ViewContract;