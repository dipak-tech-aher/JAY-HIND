import React, { useRef } from 'react';
import Modal from 'react-modal';
import { useState, useEffect } from 'react';
import { ContractEditSerachCols, ContractDetailEditCols } from './contractSerachCols';
import DynamicTable from '../../common/table/DynamicTable';
import moment from 'moment'
import { toast } from 'react-toastify';
import { string, object } from "yup";
import AdjustmentForm from '../BillGeneration/AdjustmentForm';

import { properties } from '../../properties';
import { get, post, put } from '../../common/util/restUtil';
import CreateContractDetail from './CreateDetailForm';
import { RegularModalCustomStyles, USNumberFormat } from '../../common/util/util';
import { NumberFormatBase } from 'react-number-format';
import { unstable_batchedUpdates } from 'react-dom';

const EditContract = (props) => {

    const { isOpen, contract, type, contractSearchHiddenColumns, billingReadOnly = false } = props?.data;
    const { setIsOpen, setContractSearchHiddenColumns, pageRefresh } = props.handler;
    const [exportBtn, setExportBtn] = useState(false)
    //const [contractList, setContractList] = useState([contract])
    const [contractList, setContractList] = useState([])
    //const [contractDetailList, setContractDetailList] = useState(type === "billed" ? props?.data?.contract?.contractDetail : props?.data?.contract?.monthlyContractDtl)
    const [contractDetailList, setContractDetailList] = useState([])
    const [contractDetailHiddenColumns, setContractDetailHiddenColumns] = useState([])
    const [showAdjustmentForm, setShowAdjustmentForm] = useState(false)
    const [showAddContractDetailForm, setShowAddContractDetailForm] = useState(false)
    const [amountRefresh, setAmountRefresh] = useState(false)
    const initialState = {
        billRefNo: contractList[0]?.billRefNo,
        adjustmentCat: "PREBILL",
        allocationLevel: "",
        adjustmentType: "",
        reason: "",
        maxAdjAmount: 0,
        adjAmount: "",
        remarks: "",
    }
    const [allowEdit,setAllowEdit] = useState(true)
    const [selectedContractId, setSelectedContractId] = useState()
    const [modifiedData, setModifiedData] = useState({
        startDate: "",
        endDate: "",
        itemName: "",
        minCommitment: "",
        totalConsumption: "",
        upfrontPayment: "",
        isAdvanceAllowed: "",
        advAllocationPercent: ""
    })
    const [adjustmentInputs, setAdjustmentInputs] = useState(initialState);
    const [adjustmentInputsErrors, setAdjustmentInputsErrors] = useState({});
    const [showContractDetails, setShowContractDetails] = useState(true)
    const [refresh, setRefresh] = useState(false)

    const editRef = useRef(null)
    const editDetailRef = useRef(null)
    const AdjustmentValidationSchema = object().shape({
        adjustmentType: string().required("Adjustment Type is required"),
        allocationLevel: string().required("Service Allocation is required"),
        reason: string().required("Reason is required"),
        adjAmount: string().required("Adjustment Amount is required")
    });

    const getContractDetails = () => {
        const apiProperties = {
            billed : properties.CONTRACT_API + '/billed?limit=10&page=0',
            unbilled: properties.CONTRACT_API + '/unbilled?limit=10&page=0'
        }
        
        post(apiProperties[type], {contractId: contract?.contractId.toString(), monthlyContractId: contract?.monthlyContractId })
        .then((resp) => {
            if(resp.data) 
            {
                unstable_batchedUpdates(() => {
                    setContractList(resp?.data.rows)
                    console.log('resp?.data.rows====', resp?.data.rows)
                    setContractDetailList(type === "billed" ? resp?.data?.rows[0].contractDetail : resp.data?.rows[0].monthlyContractDtl)
                })
            }
        })
        .catch((error) => {
            console.error(error)
        })
        .finally()
    }
    useEffect(() => {
        getContractDetails()
    },[refresh])


    const handleAddAdjustment = () => {
        setShowAdjustmentForm(true)
        handleOnClear()
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
            contractSourceType: type,
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
        
        post(properties.ADJUSTMENT_API, body)
            .then((resp) => {
                if (resp.status === 200) {
                    toast.success("Adjustment added successfully")
                    pageRefresh()
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
        setShowContractDetails(true)
    }

    useEffect(() => {
        let amount = 0
        contractDetailList && !!contractDetailList.length && contractDetailList.map((con) => {
            amount += Number(con?.chargeAmt)
        })
        initialState.maxAdjAmount = Number(amount)
        setAdjustmentInputs({ ...adjustmentInputs, maxAdjAmount: Number(amount) })
        //setAdjustmentInputs(initialState)
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
            setContractSearchHiddenColumns(['monthlyContractId', 'billPeriod', 'contractRefId', 'chargeName', 'totalCharge', 'itemName', 'serviceNumber', 'select', 'isAdvanceAllowed', 'advAllocationPercent'])
            setContractDetailHiddenColumns(['contractRefId', 'totalCharge', 'billPeriod', 'select', 'remove', 'ageingDays'])
            if (showAdjustmentForm === true) {
                setContractDetailHiddenColumns(['contractRefId', 'totalCharge', 'billPeriod', 'edit', 'remove', 'ageingDays'])
            }
            else if (showAdjustmentForm === false) {
                setContractDetailHiddenColumns(['contractRefId', 'totalCharge', 'billPeriod', 'select', 'remove', 'ageingDays'])
            }
        }
        else if (type === "unbilled") {
            setContractSearchHiddenColumns(['startDate','endDate','nextBillPeriod', 'lastBillPeriod', 'status', 'contractRefId', 'chargeName', 'totalCharge', 'itemName', 'serviceNumber', 'select', 'billPeriod'])
            if (showAdjustmentForm === true) {
                setContractDetailHiddenColumns(['nextBillPeriod', 'lastBillPeriod', 'billPeriod', 'contractRefId', 'totalCharge', 'status', 'edit', 'remove', 'balanceAmount'])
            }
            else if (showAdjustmentForm === false) {
                setContractDetailHiddenColumns(['nextBillPeriod', 'lastBillPeriod', 'billPeriod', 'contractRefId', 'totalCharge', 'status', 'select', 'remove', 'balanceAmount'])
            }
        }
    }, [isOpen, showAdjustmentForm])

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


    const handleEdit = (data, rowData) => {
        if (type === 'billed') {
            setModifiedData({
                ...modifiedData,
                startDate: rowData.startDate,
                endDate: rowData.endDate,
            })
        }
        if (type === 'unbilled') {
            setModifiedData({
                ...modifiedData,
                isAdvanceAllowed: rowData.isAdvanceAllowed,
                advAllocationPercent: rowData.advAllocationPercent,
            })
        }
        setSelectedContractId(Number(data));
        
        setTimeout(() => {
            editRef && editRef.current !== null && editRef.current.scrollIntoView({ /*top: editRef.current.offsetTop,*/behavior: 'smooth', block: "start" })
            
        }, 2000)
    }

    const handleDone = (data) => {
        let body = {}
        let url = ""
        let id = ""
        if (type === 'billed' && (modifiedData.startDate == "" || modifiedData.endDate == "")) {
            toast.error("Please Provide the Editable field Values")
            return
        }
        if (type === 'unbilled' && (modifiedData.isAdvanceAllowed === "" || modifiedData.advAllocationPercent == "")) {
            toast.error("Please Provide the Editable field Values")
            return
        }
        if (moment(modifiedData.endDate).isBefore(modifiedData.startDate)) {
            toast.error("End Date Cannot be less than Start Date")
            return
        }
        // if (modifiedData === "") {
        //     toast.error("Please Select the Date")
        //     return
        // }
        setContractList(
            contractList.map((c) => {
                if (Number(c.contractId) === Number(selectedContractId)) {
                    if (type === "billed") {
                        if (modifiedData.startDate !== "") {
                            c.startDate = modifiedData.startDate
                            body.startDate = modifiedData.startDate
                        }
                        if (modifiedData.endDate !== "") {
                            c.endDate = modifiedData.endDate
                            body.endDate = modifiedData.endDate
                        }
                        //c.actualEndDate = modifiedData
                        //body.actualEndDate = modifiedData
                        // c.endDate = modifiedData.endDate
                        // body.endDate = modifiedData.endDate
                        url = ''
                        id = c.contractId
                    }
                    else if (type === "unbilled") {
                        if (modifiedData.isAdvanceAllowed !== "") {
                            c.isAdvanceAllowed = modifiedData.isAdvanceAllowed
                            body.isAdvanceAllowed = modifiedData.isAdvanceAllowed
                        }
                        if (modifiedData.advAllocationPercent !== "") {
                            c.advAllocationPercent = modifiedData.advAllocationPercent
                            body.advAllocationPercent = modifiedData.advAllocationPercent
                        }
                        //c.endDate = modifiedData.endDate
                        //body.endDate = modifiedData.endDate
                        url = '/monthly'
                        id = c.monthlyContractId
                    }
                }
                return c
            })
        )
        console.log('body', body)
        handleDateChange(url, id, body,'HEADER')
        setSelectedContractId();
    }

    const handleDateChange = (url, id, body, type) => {
        
        let reqBody = {
            ...body,
            billRefNo: contractList[0]?.billRefNo
        }
        console.log('reqBody==>', reqBody)
        put(`${properties.CONTRACT_API}${url}/${Number(id)}`, reqBody)
            .then((response) => {
                if (response.status === 200) {
                    toast.success(`${response.message}`)
                    setRefresh(!refresh)
                    pageRefresh()
                    // if(type === 'HEADER')
                    // {
                    //     //setIsOpen(true)
                    // }  
                }
            })
            .catch((error) => {
                toast.error(`${error}`)
            })
            .finally()
    }

    const handleEditDetails = (data, rowData) => {
        // if(type === 'billed') {
        // } 
        // if(type === 'unbilled') {
        //     if(rowData?.chargeType === 'CC_USGC' && (rowData?.totalConsumption === '' || rowData?.totalConsumption === null || rowData?.totalConsumption === 0))
        //     {
        //         setAllowEdit(true)
        //     }
        //     else
        //     {
        //         setAllowEdit(false)
        //         toast.error('No Fields Allowed to Edit')
        //         return
        //     }
        // }
        
        if (type === 'billed') {
            setModifiedData({
                ...modifiedData,
                itemName: rowData.itemName,
                startDate: rowData.actualStartDate,
                endDate: rowData.actualEndDate,
                minCommitment: rowData.minCommitment,
                totalConsumption: rowData.totalConsumption,
                upfrontPayment: rowData.upfrontPayment,
                addConsumption1: rowData.addConsumption1,
                addConsumption2: rowData.addConsumption2,
                addConsumption3: rowData.addConsumption3
            })
        }
        if (type === 'unbilled') {
            setModifiedData({
                ...modifiedData,
                minCommitment: rowData.minCommitment,
                totalConsumption: rowData.totalConsumption,
                addConsumption1: rowData.addConsumption1,
                addConsumption2: rowData.addConsumption2,
                addConsumption3: rowData.addConsumption3
            })
        }
        setSelectedContractId(Number(data));
        
        setTimeout(() => {
            editDetailRef && editDetailRef.current !== null && editDetailRef.current.scrollIntoView({ behavior: 'smooth', block: "start" })
            
        }, 2000)
    }

    const handleDoneDetails = (data) => {
        let body = {}
        let url = ""
        let id = ""
        console.log('data==>', data)
        if (type === 'billed' && (modifiedData.minCommitment === "" || modifiedData.totalConsumption == "" || modifiedData.itemName == "" || modifiedData.startDate == "" || modifiedData.endDate == "" || modifiedData.upfrontPayment == "")) {
            toast.error("Please Provide the Editable field Values")
            return
        }
        if (type === 'unbilled' && (modifiedData.minCommitment === "" || modifiedData.totalConsumption == "")) {
            toast.error("Please Provide the Editable field Values")
            return
        }
        if (moment(modifiedData.endDate).isBefore(modifiedData.startDate)) {
            toast.error("End Date Cannot be less than Start Date")
            return
        }
        // if (modifiedData === "") {
        //     toast.error("Please Select the Date")
        //     return
        // }
        setContractDetailList(
            contractDetailList.map((c) => {
                if (type === 'billed' ? (Number(c.contractDtlId) === Number(selectedContractId)) : (Number(c.monthlyContractDtlId) === Number(selectedContractId))) {
                    //c.endDate = modifiedData
                    //body.endDate = modifiedData
                    body.itemId = data.itemId
                    body.chargeType = data.chargeType
                    if (modifiedData.minCommitment !== "") {
                        c.minCommitment = modifiedData.minCommitment
                        body.minCommitment = modifiedData.minCommitment
                    }
                    if (modifiedData.totalConsumption !== "") {
                        c.totalConsumption = modifiedData.totalConsumption
                        body.totalConsumption = modifiedData.totalConsumption
                    }
                    let mappingPayload = {
                        addConsumption: {
                            addConsumption1: "",
                            addConsumption2: "",
                            addConsumption3: ""
                        }
                    }
                    if (modifiedData.addConsumption1 !== "") {
                        mappingPayload.addConsumption.addConsumption1 = Number(modifiedData.addConsumption1)
                        body.addConsumption1 = Number(modifiedData.addConsumption1)
                    }
                    if (modifiedData.addConsumption2 !== "") {
                        mappingPayload.addConsumption.addConsumption2 = Number(modifiedData.addConsumption2)
                        body.addConsumption2 = Number(modifiedData.addConsumption2)
                    }
                    if (modifiedData.addConsumption3 !== "") {
                        mappingPayload.addConsumption.addConsumption3 = Number(modifiedData.addConsumption3)
                        body.addConsumption3 = Number(modifiedData.addConsumption3)
                    }
                    c.mappingPayload = mappingPayload
                    if (type === 'billed') {
                        if (modifiedData.itemName !== "") {
                            c.itemName = modifiedData.itemName
                            body.itemName = modifiedData.itemName
                        }
                        if (modifiedData.startDate !== "") {
                            c.actualStartDate = modifiedData.startDate
                            body.actualStartDate = modifiedData.startDate
                        }
                        if (modifiedData.endDate !== "") {
                            c.actualEndDate = modifiedData.endDate
                            body.actualEndDate = modifiedData.endDate
                        }
                        if (modifiedData.upfrontPayment !== "") {
                            c.upfrontPayment = modifiedData.upfrontPayment
                            body.upfrontPayment = modifiedData.upfrontPayment
                        }
                        url = '/detail'
                        id = data.contractDtlId
                    }
                    else if (type === 'unbilled') {
                        url = '/detail/monthly'
                        id = data.monthlyContractDtlId
                    }
                    // c.actualEndDate = modifiedData.endDate
                    // body.actualEndDate = modifiedData.endDate
                }
                return c
            })
        )
        handleDateChange(url, id, body,'DETAIL')
        setSelectedContractId();
    }

    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Edit" && billingReadOnly === false) {
            return (
                <>
                    {
                        Number(selectedContractId) !== Number(row?.original?.contractId) ?
                            <button className="skel-btn-submit"
                                disabled={row?.original?.status === 'INACTIVE'}
                                onClick={() => { handleEdit(row.original?.contractId, row.original) }}
                            >
                                Edit
                            </button>
                            :
                            <>
                                <button className="skel-btn-submit"
                                    onClick={() => { handleDone(row.original) }}
                                >
                                    Done
                                </button>
                                <button className="skel-btn-cancel"
                                    onClick={() => { setSelectedContractId() }}
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
        else if (["Actual Contract Start Date", "Last Bill Period", "Next Bill Period"].includes(cell.column.Header)) {
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
        else if (cell.column.Header === "Contract End Date") {
            return (
                <>
                    {
                        (cell.column.Header === "Contract End Date") ?
                            <>
                                {
                                    Number(selectedContractId) === Number(row?.original?.contractId) && type === 'billed' ?
                                        <input ref={editRef} type="date" className="form-control" value={modifiedData?.endDate} onChange={(e) => { setModifiedData({ ...modifiedData, endDate: e.target.value }) }} />
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
            return (
                <>
                    {
                        Number(selectedContractId) === Number(row?.original?.contractId) && type === 'billed' ?
                            <input ref={editRef} type="date" className="form-control" value={modifiedData?.startDate} onChange={(e) => { setModifiedData({ ...modifiedData, startDate: e.target.value }) }} />
                            :
                            <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
                    }
                </>
            )
        }
        else if (cell.column.Header === "Advance Payment Allocation") {
            return (
                <>
                    {
                        Number(selectedContractId) === Number(row?.original?.contractId) && type === 'unbilled' ?
                            <select type="text" style={{ width: "150px" }} ref={editRef} className="form-control" value={modifiedData.isAdvanceAllowed} onChange={(e) => { setModifiedData({ ...modifiedData, isAdvanceAllowed: e.target.value }) }} >
                                <option value="">Select Advance Flag</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                            :
                            <span>{cell?.value ? cell.value : '-'}</span>
                    }
                </>
            )
        }
        else if (cell.column.Header === "Allocation Percentage") {
            return (
                <>
                    {
                        Number(selectedContractId) === Number(row?.original?.contractId) && type === 'unbilled' ?
                            <input ref={editRef} type="text" maxLength="2" className="form-control" value={Number(modifiedData?.advAllocationPercent)} onChange={(e) => { setModifiedData({ ...modifiedData, advAllocationPercent: Number(e.target.value) }) }} />
                            :
                            <span>{cell?.value ? cell.value : '-'}</span>
                    }
                </>
            )
        }
        else if (["RC", "OTC", "Usage", "Credit Adjustment", "Debit Adjustment", "Total Charge"].includes(cell.column.Header)) {
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
            let cNo = row?.original?.customer?.customerNo
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
        else if (['Updated At Date and Time', 'Created At Date and Time'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{row?.original?.createdByName?.firstName + " " + row?.original?.createdByName?.lastName}</span>)
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
    const handleCellRenderDetail = (cell, row) => {
        if (cell.column.Header === "Edit" && billingReadOnly === false) {
            return (
                <>
                    {
                        Number(selectedContractId) !== Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : type === 'billed' ) ?
                            <button className="skel-btn-submit" disabled={row.original.chargeType === 'CC_NRC' || row.original.status === 'INACTIVE'}
                                onClick={() => { handleEditDetails(type === 'billed' ? row.original?.contractDtlId : row.original?.monthlyContractDtlId, row.original) }}
                            >
                                Edit
                            </button>
                            :
                            <>
                                <button className="skel-btn-submit"
                                    onClick={() => { handleDoneDetails(row.original) }} disabled={row.original.chargeType === 'CC_NRC'}
                                >
                                    Done
                                </button>
                                <button className="skel-btn-cancel"
                                    onClick={() => { setSelectedContractId() }} disabled={row.original.chargeType === 'CC_NRC'}
                                >
                                    Cancel
                                </button>
                            </>
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
        else if (["Actual End Date", "Actual Start Date", "Last Bill Period", "Next Bill Period", "Bill Period"].includes(cell.column.Header)) {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }

        else if (cell.column.Header === "Contract End Date") {
            return (
                <>
                    {
                        (Number(selectedContractId) === Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "") && type === 'billed') ?
                            <input type="date" ref={editDetailRef} className="form-control" value={modifiedData.endDate} onChange={(e) => { setModifiedData({ ...modifiedData, endDate: e.target.value }) }} />
                            :
                            <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
                    }
                </>
            )
        }
        else if (cell.column.Header === "Contract Start Date") {
            return (
                <>
                    {
                        (Number(selectedContractId) === Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "") && type === 'billed') ?
                            <input type="date" ref={editDetailRef} className="form-control" value={modifiedData.startDate} onChange={(e) => { setModifiedData({ ...modifiedData, startDate: e.target.value }) }} />
                            :
                            <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
                    }
                </>
            )
        }
        else if (cell.column.Header === "Product Description") {
            return (
                <>
                    {
                        (Number(selectedContractId) === Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "") && type === 'billed') ?
                            <input type="text" ref={editDetailRef} className="form-control" value={modifiedData.itemName} onChange={(e) => { setModifiedData({ ...modifiedData, itemName: e.target.value }) }} />
                            :
                            <span >{cell?.value ? cell.value : '-'}</span>
                    }
                </>
            )
        }
        /*else if (cell.column.Header === "Minimum Commitment") {
            return (
                <>
                    {
                        Number(selectedContractId) === Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "") ?
                            <div ref={editDetailRef}>
                                <NumberFormatBase type="text" ref={editDetailRef} className="form-control" value={modifiedData.minCommitment} onChange={(e) => { setModifiedData({ ...modifiedData, minCommitment: e.target.value }) }} />
                            </div>
                            :
                            <span ref={editDetailRef}>{cell?.value ? cell.value : '-'}</span>
                    }
                </>
            )
        }
        else if (cell.column.Header === "Total Consumption") {
            return (
                <>
                    {
                        Number(selectedContractId) === Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "") && row.original.chargeType === 'CC_USGC'
                            && (row.original?.totalConsumption === '' || row.original?.totalConsumption === null || row.original?.totalConsumption === 0) ?
                            <div ref={editDetailRef}>
                                <NumberFormatBase type="text" ref={editDetailRef} className="form-control" value={modifiedData.totalConsumption} onChange={(e) => { setModifiedData({ ...modifiedData, totalConsumption: e.target.value }) }} />
                            </div>
                            :
                            <span>{cell?.value ? cell.value : '-'}</span>
                    }
                </>
            )
        }*/
        else if (cell.column.Header === "Total Consumption") {
            return (
                <>
                    {
                        (Number(selectedContractId) === Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "") && row.original.chargeType === 'CC_USGC') ?
                            <div ref={editDetailRef}>
                                <NumberFormatBase type="text" ref={editDetailRef} className="form-control" value={modifiedData.totalConsumption} onChange={(e) => { setModifiedData({ ...modifiedData, totalConsumption: e.target.value }) }} />
                            </div>
                            :
                            <span>{cell?.value ? cell.value : '-'}</span>
                    }
                </>
            )
        }
        else if (cell.column.id === "addConsumption1") {
            return (
                <>
                    {
                        Number(selectedContractId) === Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "")
                            && (row.original?.prodDetails?.planUsage[0]?.isTierType === 'Y')
                            && (!row.original?.mappingPayload?.addConsumption?.addConsumption1 || row.original?.mappingPayload?.addConsumption?.addConsumption1 === '' || row.original?.mappingPayload?.addConsumption?.addConsumption1 === null) ?
                            <div ref={editDetailRef}>
                                <NumberFormatBase type="text" ref={editDetailRef} className="form-control" value={modifiedData.addConsumption1} onChange={(e) => { setModifiedData({ ...modifiedData, addConsumption1: e.target.value }) }} />
                            </div>
                            :
                            <span>{cell?.value ? cell.value : '-'}</span>
                    }
                </>
            )
        }
        else if (cell.column.id === "addConsumption2") {
            return (
                <>
                    {
                        Number(selectedContractId) === Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "") && (row.original?.prodDetails?.planUsage[0]?.isTierType === 'Y') && (!row.original?.mappingPayload?.addConsumption?.addConsumption2 || row.original?.mappingPayload?.addConsumption?.addConsumption2 === '' || row.original?.mappingPayload?.addConsumption?.addConsumption2 === null) ?
                            <div ref={editDetailRef}>
                                <NumberFormatBase type="text" ref={editDetailRef} className="form-control" value={modifiedData.addConsumption2} onChange={(e) => { setModifiedData({ ...modifiedData, addConsumption2: e.target.value }) }} />
                            </div>
                            :
                            <span>{cell?.value ? cell.value : '-'}</span>
                    }
                </>
            )
        }
        else if (cell.column.id === "addConsumption3") {
            return (
                <>
                    {
                        Number(selectedContractId) === Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "") && (row.original?.prodDetails?.planUsage[0]?.isTierType === 'Y') && (!row.original?.mappingPayload?.addConsumption?.addConsumption3 || row.original?.mappingPayload?.addConsumption?.addConsumption3 === '' || row.original?.mappingPayload?.addConsumption?.addConsumption3 === null) ?
                            <div ref={editDetailRef}>
                                <NumberFormatBase type="text" ref={editDetailRef} className="form-control" value={modifiedData.addConsumption3} onChange={(e) => { setModifiedData({ ...modifiedData, addConsumption3: e.target.value }) }} />
                            </div>
                            :
                            <span>{cell?.value ? cell.value : '-'}</span>
                    }
                </>
            )
        }
        else if (cell.column.Header === "Advance Flag") {
            return (
                <>
                    {
                        (Number(selectedContractId) === Number(type === 'billed' ? row.original?.contractDtlId : type === 'unbilled' ? row.original?.monthlyContractDtlId : "") && type === 'billed') ?
                            <select type="text" style={{ width: "150px" }} ref={editDetailRef} className="form-control" value={modifiedData.upfrontPayment} onChange={(e) => { setModifiedData({ ...modifiedData, upfrontPayment: e.target.value }) }} >
                                <option value="">Select Advance Flag</option>
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                            </select>
                            :
                            <span>{cell?.value ? cell.value : '-'}</span>
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
        else if (cell.column.id === "isTierType") {
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
            return (<span>{row?.original?.createdByName?.firstName + " " + row?.original?.createdByName?.lastName}</span>)
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
        <Modal isOpen={isOpen} contentLabel="Contract Search Modal" style={RegularModalCustomStyles}>

            <div className="modal-content">
                <div className="modal-header">
                    <h4 className="modal-title">Edit {type === "billed" ? "Contract" : type === "unbilled" ? "Unbilled Contract" : "Contract History"}</h4>
                    {
                        <div className="paybill2 pr-3 d-none">
                            {
                                showAdjustmentForm === false ?
                                    <button type="button" className={`btn btn-primary btn-sm waves-effect waves-light ${billingReadOnly ? 'd-none' : ''}`}
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
                                    itemsPerPage={10}
                                    filterRequired={false}
                                    header={ContractEditSerachCols}
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
                                        <div className="col-10">
                                            <h4 id="" className="pl-2">Contract Detail</h4>
                                        </div>
                                        {
                                            type === 'billed' &&
                                            <div className="col-2 mt-21 pt-1 add-btn">
                                                <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2 d-none"
                                                    onClick={() => { setShowAddContractDetailForm(!showAddContractDetailForm) }}
                                                >
                                                    {showAddContractDetailForm ? 'Cancel' : 'Add'}
                                                </button>
                                            </div>
                                        }
                                    </div>
                                </section>
                            </div>
                            <div className="modal-body overflow-auto cus-srch">
                                {
                                    showAddContractDetailForm &&
                                    <CreateContractDetail
                                        data={{
                                            selectedContractId: contract?.contractId,
                                            customer: { account: [{ accountNo: contract?.billRefNo }] },
                                            refresh: refresh,
                                            contractData: contractList[0]
                                        }}
                                        handler={{
                                            pageRefresh: pageRefresh,
                                            setRefresh: setRefresh,
                                            setIsOpen: setIsOpen
                                        }}
                                    />
                                }
                                {
                                    contractDetailList && contractDetailList?.length > 0 &&
                                    <div className="card mt-3">
                                        <DynamicTable
                                            listKey={"Contract List"}
                                            row={contractDetailList}
                                            itemsPerPage={10}
                                            filterRequired={false}
                                            header={ContractDetailEditCols}
                                            exportBtn={exportBtn}
                                            hiddenColumns={contractDetailHiddenColumns}
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