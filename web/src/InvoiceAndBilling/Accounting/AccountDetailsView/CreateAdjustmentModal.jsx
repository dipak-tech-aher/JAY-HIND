import React, { useEffect, useState, useRef } from 'react'
import Modal from 'react-modal'
import ContractAjustmentForm from './ContractAdjustmentForm'
import { string, object } from "yup";
import { toast } from 'react-toastify';

import { post } from '../../../common/util/restUtil';
import { properties } from '../../../properties';
import { unstable_batchedUpdates } from 'react-dom';
import { ContractSerachCols, ContractDetailCols } from '../../Contract/contractSerachCols';
import DynamicTable from '../../../common/table/DynamicTable';
import moment from 'moment'
import { formFilterObject, RegularModalCustomStyles, USNumberFormat } from '../../../common/util/util';

const CreateAdjustmentModal = (props) => {

    const setIsOpen = props?.handler?.setIsOpen
    const pageRefresh = props?.handler?.pageRefresh
    const isOpen = props?.data?.isOpen
    const accountData = props?.data?.accountData
    const initialState = {
        adjustmentCat: "",
        adjustmentPeriod: "",
        adjustmentType: "",
        adjustmentImmediate: "N",
        reason: "",
        maxAdjAmount: 0,
        adjAmount: "",
        remarks: "",
        billRefNo: accountData[0].billRefNo,
        contractId: []
    }
    const contractHiddenColumns = useRef(null)
    const contractDetailHiddenColumns = useRef(null)
    const [adjustmentInputs, setAdjustmentInputs] = useState(initialState);
    const [adjustmentInputsErrors, setAdjustmentInputsErrors] = useState({});

    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(false);
    const isTableFirstRender = useRef(true);
    const [amountRefresh,setAmountRefresh]  = useState(false)
    const [contract, setContract] = useState([])
    const [contractDetail, setContractDetail] = useState([])

    const AdjustmentValidationSchema = object().shape({
        adjustmentCat: string().required("Adjustment Category is required"),
        billRefNo: string().required("Billable Reference Number is required"),
        reason: string().required("Reason is required"),
        adjustmentType: string().required("Adjustment Type is required"),
        maxAdjAmount: string().required("Maximum Adjustment Amount is required"),
        adjAmount: string().required("Adjustment Amount is required")
    });

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

    useEffect((fromCallback = false) => {
        const requestBody = {
            billRefNo: accountData[0].billRefNo,
            filters: formFilterObject(filters)
        }
        let adjUrl
        if(adjustmentInputs.adjustmentCat === 'POSTBILL'){
            adjUrl= `${properties.CONTRACT_API}/monthly/search?limit=${perPage}&page=${fromCallback ? 0 : Number(currentPage)}${adjustmentInputs.adjustmentCat === 'POSTBILL' ? '&type=BILLED' : ''}`
        }else if(adjustmentInputs.adjustmentCat === 'PREBILL'){
            adjUrl= `${properties.CONTRACT_API}/search?limit=${perPage}&page=${fromCallback ? 0 : Number(currentPage)}`
        }
        contractHiddenColumns.current = ['monthlyContractId','nextBillPeriod', 'lastBillPeriod', 'status', 'contractRefId', 'chargeName', 'totalCharge', 'edit', 'itemName', 'serviceNumber', 'billPeriod']
        contractDetailHiddenColumns.current = ['lastBillPeriod', 'nextBillPeriod', 'contractRefId', 'totalCharge', 'status', 'billPeriod','ageingDays','remove']
        if (adjustmentInputs.adjustmentCat !== '') {
            
            post(adjUrl, requestBody)
                .then((response) => {
                    if (response.data) {
                        let { rows, count } = response.data;
                        rows.map((row) => {
                            row.select = 'N'
                            return row
                        })
                        unstable_batchedUpdates(() => {
                            setTotalCount(count);
                            setContract(rows);
                            setContractDetail([])
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
                .finally()
        }

    }, [adjustmentInputs.adjustmentCat, adjustmentInputs.adjustmentPeriod, currentPage, perPage])

    useEffect(() => {
        let amount = 0
        contract && !!contract.length && contract.map((c) => {
            if(c.select === 'Y')
            {
                c?.contractDtl && !!c?.contractDtl.length && c?.contractDtl.map((monC) => {
                    if (adjustmentInputs.adjustmentCat === 'PREBILL') {
                        if(monC.status === 'UNBILLED')
                        {
                            amount += Number(monC.chargeAmt)
                        }
                    }
                })
                c?.monthlyContractDtl && !!c?.monthlyContractDtl.length && c?.monthlyContractDtl.map((monC) => {
                    if (adjustmentInputs.adjustmentCat === 'POSTBILL') {
                        if(monC.status === 'BILLED')
                        {
                            amount += Number(monC.chargeAmt)
                        }
                    }
                    
                })
            }    
        })
        setAdjustmentInputs({ ...adjustmentInputs, maxAdjAmount: Number(amount) })
    }, [contract,amountRefresh])

    useEffect(() => {
        if (!!contractDetail.length) {
            let amount = 0
            let selected = false
            contractDetail?.length && contractDetail?.map((monC) => {
                if(monC.select === 'Y')
                {
                    selected = true
                    amount += Number(monC.chargeAmt)
                }
            })
            if(selected === true)
            {
                setAdjustmentInputs({ ...adjustmentInputs, maxAdjAmount: Number(amount) })
            }
            else
            {
                setAmountRefresh(!amountRefresh)
            }
        }
    }, [contractDetail])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleOnSubmit = () => {
        if (validate(AdjustmentValidationSchema, adjustmentInputs)) {
            toast.error("Validation Errors Found")
            return;
        }
        let contractId = []
        let contractDtlId = []
        contract && !!contract.length && contract.map((c) => {
            if (c.select === 'Y') {
                contractId.push(Number(c.contractId))
            }
        })
        if (contractId.length === 0) {
            toast.error("Please Select the Contract")
            return
        }
        let body = {
            ...adjustmentInputs,
            contractId: contractId
        }
        contractDetail && !!contractDetail.length && contractDetail.map((c) => {
            if (c.select === 'Y') {
                contractDtlId.push(Number(c.contractDtlId))
            }
        })
        if (contractDtlId.length > 0) {
            body.contractDetId = contractDtlId
        }
        
        //setAdjustmentInputs({...adjustmentInputs,contractId:contractId,contractDetId:contractDtlId})
        post(properties.ADJUSTMENT_API, body)
            .then((resp) => {
                if (resp.status === 200) {
                    toast.success("Adjustment added successfully")
                    unstable_batchedUpdates(() => {
                        setIsOpen(false)
                        pageRefresh()
                    })
                }
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
    }

    const handleOnClear = () => {
        setAdjustmentInputs(initialState)
        setContract([])
        setContractDetail([])
    }

    const handleContractAdjustment = (e, data) => {
        console.log(data)
        setContract(
            contract.map((c) => {
                //console.log('c==>',c)
                if(adjustmentInputs.adjustmentCat === 'POSTBILL'){
                    if (Number(c?.monthlyContractId) === Number(data?.monthlyContractId)) {
                        if (e.target.checked === true) {
                            c.select = 'Y'
                        }
                        else if (e.target.checked === false) {
                            c.select = 'N'
                        }
                    }
                }else{
                    if (Number(c?.contractId) === Number(data?.contractId)) {
                        if (e.target.checked === true) {
                            c.select = 'Y'
                        }
                        else if (e.target.checked === false) {
                            c.select = 'N'
                        }
                    } 
                }
                return c
            })
        )
        if (e.target.checked === false) {
            setContractDetail(contractDetail.filter((c) => adjustmentInputs.adjustmentCat === 'POSTBILL'?(Number(c?.monthlyContractId) !== Number(data?.monthlyContractId)):Number(c?.contractId) !== Number(data?.contractId)))
        }
        else if (e.target.checked === true) {
            let list =[]
            if(adjustmentInputs.adjustmentCat === 'POSTBILL'){
                list= data?.monthlyContractDtl
            }else{
                list= data?.contractDetail
            }
            contract && contract.filter((c) => {
                if(adjustmentInputs.adjustmentCat === 'POSTBILL'){
                    if(Number(c?.monthlyContractId) === Number(data?.monthlyContractId))
                    {
                        list =  c?.monthlyContractDtl
                    }
                }else{
                    if(Number(c?.contractId) === Number(data?.contractId))
                    {
                        list =  c?.contractDetail
                    }  
                }
            })            
            let filteredList = [];
            console.log(list)
            if (adjustmentInputs.adjustmentCat === 'PREBILL') {
                filteredList = list.filter(c => c.status === 'ACTIVE')
            }
            else if (adjustmentInputs.adjustmentCat === 'POSTBILL') {
                filteredList = list.filter(c => c.status === 'BILLED')
            }
            filteredList.map((c) => {
                c.monthlyContractId = adjustmentInputs.adjustmentCat === 'POSTBILL'? data?.monthlyContractId:data?.contractId
                c.select = 'N'
                return c
            })
            setContractDetail([...contractDetail, ...filteredList])
        }

    }

    const handleContractDetailAdjustment = (e, data) => {
        setContractDetail(
            contractDetail.map((c) => {
                if (adjustmentInputs.adjustmentCat === 'POSTBILL') {
                    if (Number(c?.monthlyContractDtlId) === Number(data?.monthlyContractDtlId)) {
                        if (e.target.checked === true) {
                            c.select = 'Y'
                        }
                        else if (e.target.checked === false) {
                            c.select = 'N'
                        }
                    }
                }
                else{
                    if (Number(c?.contractDtlId) === Number(data?.contractDtlId)) {
                        if (e.target.checked === true) {
                            c.select = 'Y'
                        }
                        else if (e.target.checked === false) {
                            c.select = 'N'
                        }
                    }
                }
                return c
            })
        )
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Select") {
            return (
                <div className="form-check">
                    <input id={`mandatory${row.original.monthlyContractId}`} className="form-check-input position-static checkmark" type="checkbox" checked={cell.value === "Y" ? true : false} value={cell.value}
                        onChange={(e) => { handleContractAdjustment(e, row.original) }}
                    />
                </div>
            )
        }
        else if (cell.column.Header === "Status") {
            return (
                <span>{row?.original?.statusDesc?.description}</span>
            )
        }
        else if (cell.column.Header === "Contract Start Date" || cell.column.Header === "Contract End Date" || cell.column.Header === "Last Bill Period" || cell.column.Header === "Next Bill Period") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        // else if (cell.column.Header === "Actual Contract Start Date" || cell.column.Header === "Actual Contract End Date" || cell.column.Header === "Contract End Date" || cell.column.Header === "Last Bill Period" || cell.column.Header === "Next Bill Period") {
        //     return (
        //         <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
        //     )
        // }
        else if (["Bill Period"].includes(cell.column.Header)) {
            let date = row?.original?.lastBillPeriod
            return (
                <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
            )
        }
        // else if (cell.column.Header === "Contract Start Date") {
        //     let data = row?.original?.startDate
        //     return (
        //         <span>{data ? moment(data).format('DD MMM YYYY') : '-'}</span>
        //     )
        // }
        else if (cell.column.Header === "RC" || cell.column.Header === "OTC" || cell.column.Header === "Usage" || cell.column.Header === "Credit Adjustment" || cell.column.Header === "Debit Adjustment" || cell.column.Header === "Total Charge") {
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
        else if (cell.column.Header === "Last Bill Period" || cell.column.Header === "Next Bill Period" || cell.column.Header === "Bill Period") {
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
            let billRefNo = accountData[0]?.billRefNo
            return (
                <span>{billRefNo}</span>
            )
        }
        else if (cell.column.Header === "Status") {
            return (
                <span>{row?.original?.statusDesc?.description}</span>
            )
        }
        else if (cell.column.Header === "RC" || cell.column.Header === "OTC" || cell.column.Header === "Usage" || cell.column.Header === "Credit Adjustment" || cell.column.Header === "Debit Adjustment" || cell.column.Header === "Total Amount") {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Balance Amount") {
            return (
                <span>{row?.original?.chargeType === 'CC_USGC' ? "" : USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Prorated") {
            return (
                <span>{cell.value === 'Y' ? 'Yes' : cell.value === 'N' ? 'No' : '-'}</span>
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
            <Modal isOpen={isOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Create Adjustment</h5>
                            <button type="button" className="close" onClick={() => { setIsOpen(false) }}>
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="p-2">
                            <fieldset className="scheduler-border">
                                <div className="row">
                                    <div className="col-4">
                                        <div className="form-group">
                                            <label htmlFor="adjustmentCat" className="col-form-label">Adjustment Category<span>*</span></label>
                                            <select id="adjustmentCat" className="form-control" value={adjustmentInputs.adjustmentCat}
                                                onChange={(e) => {
                                                    setAdjustmentInputs({ ...adjustmentInputs, adjustmentCat: e.target.value })
                                                    setAdjustmentInputsErrors({ ...adjustmentInputsErrors, adjustmentCat: "" })
                                                }}
                                            >
                                                <option value="">Select Adjustment Category</option>
                                                <option value="PREBILL">Prebill</option>
                                                <option value="POSTBILL">Postbill</option>
                                            </select>
                                            <span className="errormsg">{adjustmentInputsErrors.adjustmentCat ? adjustmentInputsErrors.adjustmentCat : ""}</span>
                                        </div>
                                    </div>
                                    {
                                        adjustmentInputs.adjustmentCat === 'POSTBILL' &&
                                        <div className="col-4">
                                            <div className="form-group">
                                                <label htmlFor="adjustmentPeriod" className="col-form-label">Adjustment Period</label>
                                                <input type="date" className="form-control" id="adjustmentPeriod" placeholder="" value={adjustmentInputs.adjustmentPeriod}
                                                    onChange={(e) => { setAdjustmentInputs({ ...adjustmentInputs, adjustmentPeriod: e.target.value }) }}
                                                />
                                            </div>
                                        </div>
                                    }
                                </div>
                            </fieldset>
                        </div>
                        {
                            adjustmentInputs.adjustmentCat !== '' &&
                            <>
                                <div className="pl-3">
                                    <div className="row">
                                        <section className="triangle col-12">
                                            <div className="row col-12">
                                                <div className="col-12">
                                                    <h4 className="pl-3">Contract</h4>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                    <div className="col-md-12 card-box m-0 ">
                                        {
                                            contract && !!contract.length &&
                                            <div className="card">
                                                <DynamicTable
                                                    listKey={"Contract List"}
                                                    row={contract}
                                                    rowCount={totalCount}
                                                    header={ContractSerachCols}
                                                    itemsPerPage={perPage}
                                                    backendPaging={true}
                                                    backendCurrentPage={currentPage}
                                                    isTableFirstRender={isTableFirstRender}
                                                    hiddenColumns={contractHiddenColumns.current}
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
                                        }
                                    </div>
                                </div>
                                <div className="pl-3">
                                    <div className="row">
                                        <section className="triangle col-12">
                                            <div className="row col-12">
                                                <div className="col-12">
                                                    <h4 className="pl-3">Contract Detail</h4>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                    <div className="col-md-12 card-box m-0 ">
                                        {
                                            contractDetail && !!contractDetail.length &&
                                            <div className="card">
                                                <DynamicTable
                                                    listKey={"Contract Detail List"}
                                                    row={contractDetail}
                                                    header={ContractDetailCols}
                                                    itemsPerPage={perPage}
                                                    hiddenColumns={contractDetailHiddenColumns.current}
                                                    exportBtn={exportBtn}
                                                    handler={{
                                                        handleCellRender: handleCellRenderDetail,
                                                        handleExportButton: setExportBtn
                                                    }}
                                                />
                                            </div>
                                        }
                                    </div>
                                </div>
                                {
                                    <ContractAjustmentForm
                                        data={{
                                            adjustmentInputs: adjustmentInputs,
                                            accountData: accountData,
                                            adjustmentInputsErrors: adjustmentInputsErrors
                                        }}
                                        handler={{
                                            setAdjustmentInputs: setAdjustmentInputs,
                                            setAdjustmentInputsErrors: setAdjustmentInputsErrors
                                        }}
                                    />
                                }
                                <div className="flex-row pre-bill-sec">
                                    <div className="col-12 p-1">
                                        <div id="customer-buttons" className="d-flex justify-content-center">
                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleOnSubmit}>Submit</button>
                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleOnClear}>Clear</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default CreateAdjustmentModal