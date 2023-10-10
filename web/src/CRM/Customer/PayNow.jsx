import React, { useEffect, useState, useRef } from 'react'
import Modal from 'react-modal'
import { unstable_batchedUpdates } from 'react-dom';
import { string, object } from "yup";
import { toast } from 'react-toastify';
import moment from 'moment'
import { NumberFormatBase } from 'react-number-format';
import { get, post } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { InvoiceSearchColumns, InvoicePaymentHiddenColumns, InvoiceDetailPaymentHiddenColumns } from '../../InvoiceAndBilling/Invoice/InvoiceSearchColumns';
import { InvoiceDetailListColumns } from '../../InvoiceAndBilling/Invoice/InvoiceTables/InvoiceDetailList'
import DynamicTable from '../../common/table/DynamicTable';
import { isObjectEmpty } from '../../common/util/validateUtil';
import { formFilterObject, RegularModalCustomStyles } from '../../common/util/util';
import { USNumberFormat } from '../../common/util/util';

const PayNow = (props) => {

    const setIsOpen = props.handler.setIsOpen
    const pageRefresh = props?.handler?.pageRefresh
    const isOpen = props.data.isOpen
    const accountData = props.data.accountData
    const invoiceCounts = props.data.invoiceCounts
    const [invoice, setInvoice] = useState([])
    const [invoiceDetail, setInvoiceDetail] = useState([])
    console.log('accountData',accountData)
    const initialValues = {
        // billRefNo: accountData[0]?.billRefNo,
        allocationLevel: "INV",
        currency: "",
        paymentMode: "",
        // totalOutstanding: Number(invoiceCounts.totoalOutstanding),
        // dueOutstanding: Number(invoiceCounts.dueOutStanding),
        totalOutstanding: Number(0),
        dueOutstanding: Number(0),
        paymentAmount: 0,
        paymentLocation: "",
        isOffline: "N",
        paymentRemark: "",
        refNo: "",
        refDate: null,
        refName: "",
    }
    const [chequeDetails, setChequeDetails] = useState({
        chequeNo: "",
        chequeDate: null,
        chequeBankName: ""
    })
    const [cardDetails, setCardDetails] = useState({
        cardNo: "",
        cardExpiryDate: null,
        cardType: ""
    })
    const [paymentData, setPaymentData] = useState(initialValues)
    const [paymentError, setPaymentError] = useState({});
    const [cardError, setCardError] = useState({});
    const [chequeError, setChequeError] = useState({});

    const [allocationLevelLookup, setAllocationLevelLookup] = useState([])
    const [currencyLookup, setCurrencyLookup] = useState([])
    const [paymentModeLookup, setPaymentModeLookup] = useState([])
    const [paymentLocationLookup, setPaymentLocationLookup] = useState([])
    const lookupData = useRef();

    const paymentValidationSchema = object().shape({
        allocationLevel: string().required("Allocation Level is required"),
        currency: string().required("Currency is required"),
        paymentMode: string().required("Payment Mode is required"),
        paymentLocation: string().required("Payment Location is required"),
        paymentAmount: string().required("Payment Amount is required")
    });
    const cardValidationSchema = object().shape({
        cardNo: string().required("Card Number is required"),
        cardExpiryDate: string().required("Card Expiry Date is required"),
        cardType: string().required("Card Type is required")
    });
    const chequeValidationSchema = object().shape({
        chequeNo: string().required("Cheque Number is required"),
        chequeDate: string().required("Cheque Date required"),
        chequeBankName: string().required("Cheque Bank Name is required")
    });

    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(false);
    const isTableFirstRender = useRef(true);

    const validate = (section, schema, data) => {
        try {
            if (section === 'CARD') {
                setCardError({})
            }
            if (section === 'CHEQUE') {
                setChequeError({})
            }
            if (section === 'PAYMENT') {
                setPaymentError({});
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'CHEQUE') {
                    setChequeError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
                if (section === 'CARD') {
                    setCardError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
                if (section === 'PAYMENT') {
                    setPaymentError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    const handleOnSubmit = () => {
        if (validate('PAYMENT', paymentValidationSchema, paymentData)) {
            toast.error("Validation Errors Found")
            return;
        }
        if (paymentData.paymentMode === 'PM_CARD') {
            if (validate('CARD', cardValidationSchema, cardDetails)) {
                toast.error("Validation Errors Found")
                return;
            }

          
            if(cardDetails && cardDetails?.cardExpiryDate){
                if ((moment(new Date(cardDetails?.cardExpiryDate)).format('YYYY-MM-DD') < moment(new Date()).format('YYYY-MM-DD'))) {
                    toast.error("Invalid Card Expiry Date");
                    return false;
                }
               
            }

        }
        if (paymentData.paymentMode === 'PM_CHEQUE') {
            if (validate('CHEQUE', chequeValidationSchema, chequeDetails)) {
                toast.error("Validation Errors Found")
                return;
            }
        }
        let requestBody = {
            ...paymentData,
            invoiceId: [],
            invoiceChargeIds: {},
            customerUuid: accountData.customerUuid,
            customerId: accountData.customerId,
            customerNo: accountData.customerNo
        }
        let invoiceIds = []
        let invoiceDtlIds = []
        if (paymentData.allocationLevel === 'INV' || paymentData.allocationLevel === 'INVCHARGE') {
            invoice && invoice.map((inv) => {
                if (inv.select === 'Y') {
                    invoiceIds.push(inv.invoiceId)
                }
            })
            requestBody.invoiceId = invoiceIds
        }
        if (paymentData.allocationLevel === 'INVCHARGE') {
            let invoiceChargeIds = {}
            invoiceIds && !!invoiceIds.length && invoiceIds.map((invoice) => {
                invoiceDetail && invoiceDetail.map((inv) => {
                    if (inv.select === 'Y' && Number(inv.invoiceId) === Number(invoice)) {
                        if (!invoiceDtlIds.includes(inv.invoiceDtlId)) {
                            invoiceDtlIds.push(inv.invoiceDtlId)
                        }
                    }
                })
                if (invoiceDtlIds.length > 0) {
                    invoiceChargeIds[invoice] = invoiceDtlIds
                }
                invoiceDtlIds = []
            })
            requestBody.invoiceChargeIds = invoiceChargeIds
        }
        if (requestBody.paymentMode === 'PM_CARD') {
            requestBody.refNo = cardDetails.cardNo
            requestBody.refDate = cardDetails.cardExpiryDate
            requestBody.refName = cardDetails.cardType
        }
        if (requestBody.paymentMode === 'PM_CHEQUE') {
            requestBody.refNo = chequeDetails.chequeNo
            requestBody.refDate = chequeDetails.chequeDate
            requestBody.refName = chequeDetails.chequeBankName
        }
        let found = false
        if (paymentData.allocationLevel === 'INV') {
            if (invoiceIds.length === 0) {
                toast.error("Please Select the Invoice")
                found = true
            }
        }
        if (paymentData.allocationLevel === 'INVCHARGE') {
            if (invoiceIds.length === 0) {
                toast.error("Please Select the Invoice")
                found = true
            }
            if (isObjectEmpty(requestBody.invoiceChargeIds)) {
                toast.error("Please Select the Invoice Charge Details")
                found = true
            }
        }
        if (found === true) {
            return
        }
        console.log("Payment Data : ", requestBody)
        
        post(properties.BILLING_API + '/payBill', requestBody)
            .then((response) => {
                if (response.status === 200) {
                    toast.success("Payment Done Successfully")
                    setIsOpen(false)
                    pageRefresh()
                }
            })
            .catch((error) => {
                console.log(error)
            })
            .finally()
    }

    const handleOnClear = () => {
        setChequeError({})
        setCardError({})
        setPaymentData(initialValues)
        setPaymentError({})
        //setInvoice([])
        //setInvoiceDetail([])
    }

    const handleOnPaymentInputsChange = (e) => {
        const { target } = e;
        if (target.id === "paymentAmount") {
            const value = String(target.value)
            setPaymentData({
                ...paymentData,
                [target.id]: (value.indexOf(".") >= 0) ? (value.substr(0, value.indexOf(".")) + value.substr(value.indexOf("."), 3)) : value,
                balanceAmount: target.value
            })
        } else {
            setPaymentData({
                ...paymentData,
                [target.id]: target.value
            })
        }
    }
    const handleOnChequeInputsChange = (e) => {
        const { target } = e;
        setChequeDetails({
            ...chequeDetails,
            [target.id]: target.id === 'chequeNo' ? Number(target.value) : target.value
        })
    }
    const handleOnCardInputsChange = (e) => {
        const { target } = e;
        setCardDetails({
            ...cardDetails,
            [target.id]: target.id === 'cardNo' ? Number(target.value) : target.value
        })
    }

    useEffect(() => {
        // PRODUCT_BENEFIT,COUNTRY,GENDER,CUSTOMER_CATEGORY,CUSTOMER_ID_TYPE,ACCOUNT_CATEGORY,ACCOUNT_TYPE,ACCOUNT_CLASS,ACCOUNT_LEVEL,CONTACT_PREFERENCE,PRIORITY,ACC_STATUS_REASON,CURRENCY,BILL_LANGUAGE,PRODUCT_TYPE,PRODUCT_CATEGORY,PRODUCT_SUB_CATEGORY,SERVICE_TYPE,CONTACT_PREFERENCE,APPOINT_TYPE
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=PAYMENT_METHOD,CURRENCY,LOCATION,ALLOCATION_LEVEL')
            .then((response) => {
                if (response.data) {
                    lookupData.current = response.data;
                    unstable_batchedUpdates(() => {
                        setPaymentModeLookup(lookupData.current['PAYMENT_METHOD'])
                        setCurrencyLookup(lookupData.current['CURRENCY'])
                        //setPaymentLocationLookup(lookupData.current['PAYMENT_LOCATION'])
                        setPaymentLocationLookup(lookupData.current['LOCATION'])
                        setAllocationLevelLookup(lookupData.current['ALLOCATION_LEVEL'])
                    });
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally()
    }, [])

    useEffect(() => {
        const requestBody = {
            customerUuid: accountData?.customerUuid,
            //billRefNo: accountData[0]?.billRefNo,
            filters: formFilterObject(filters)
        }

        post(`${properties.INVOICE_API}/search?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((response) => {
                if (response.status === 200) {
                    let { rows, count } = response?.data
                    rows.map((row) => {
                        row.select = 'N'
                        return row
                    })
                    console.log('rows.filter((inv) => inv.invoiceStatus !== ',rows.filter((inv) => inv.invoiceStatus !== 'CLOSED'))
                    unstable_batchedUpdates(() => {
                        setInvoice(rows.filter((inv) => inv.invoiceStatus !== 'CLOSED'));
                        setTotalCount(count)
                    })
                }
            })
            .catch((error) => {
                toast.error("Error while getting Invoice List", error)
            })
            .finally(() => {
                
            })
    }, [paymentData.allocationLevel, perPage, currentPage])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const clearPaymentData = () => {
        setChequeError({})
        setCardError({})
        setCardDetails({
            cardNo: "",
            cardExpiryDate: "",
            cardType: ""
        })
        setChequeDetails({
            chequeNo: "",
            chequeDate: "",
            chequeBankName: ""
        })
    }

    const handleInvoicePayment = (e, data) => {
        setInvoice(
            invoice.map((c) => {
                if (Number(c?.invoiceId) === Number(data?.invoiceId)) {
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
        if (e.target.checked === false) {
            setInvoiceDetail(invoiceDetail.filter((c) => Number(c?.invoiceId) !== Number(data?.invoiceId)))
        }
        else if (e.target.checked === true) {
            let list = data?.invoiceDetails
            list.map((c) => {
                c.invoiceId = data?.invoiceId
                c.billRefNo = data?.billRefNo
                c.select = 'N'
                return c
            })
            setInvoiceDetail([...invoiceDetail, ...list])
        }
    }

    const handleInvoiceDetailPayment = (e, data) => {
        setInvoiceDetail(
            invoiceDetail.map((c) => {
                if (Number(c?.invoiceDtlId) === Number(data?.invoiceDtlId)) {
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

    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Select") {
            return (
                <>
                    {
                        row.original?.invoiceDtlId ?
                            <div className="form-check">
                                <input id={`mandatory${row.original.invoiceDtlId}`} className="form-check-input position-static checkmark" type="checkbox" checked={cell.value === "Y" ? true : false} value={cell.value}
                                    onChange={(e) => { handleInvoiceDetailPayment(e, row.original) }}
                                />
                            </div>
                            :
                            <div className="form-check">
                                <input id={`mandatory${row.original.invoiceId}`} className="form-check-input position-static checkmark" type="checkbox" checked={cell.value === "Y" ? true : false} value={cell.value}
                                    onChange={(e) => { handleInvoicePayment(e, row.original) }}
                                />
                            </div>
                    }
                </>

            )
        }
        else if (cell.column.Header === "Service ID") {
            let no = row?.original?.invoiceDetails && row?.original?.invoiceDetails[0]?.monthlyContractDet && row?.original?.invoiceDetails[0]?.monthlyContractDet?.soNumber
            return (
                <span>{no}</span>
            )
        }
        else if (cell.column.Header === "Invoice Start Date" || cell.column.Header === "Invoice End Date" || cell.column.Header === "Invoice Date" || cell.column.Header === "Invoice Due Date" || cell.column.Header === "Contract Start Date" || cell.column.Header === "Contract End Date") {
            return (
                <span>{cell.value && cell.value !== null ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Customer Number") {
            return (
                <span>{row?.original?.customer[0]?.customerNo}</span>
            )
        }
        else if (cell.column.Header === "Customer Name") {
            let name = row?.original?.customer[0]?.firstName + " " + row?.original?.customer[0]?.lastName
            return (
                <span>{name}</span>
            )
        }
        else if (cell.column.Header === "Invoice O/S Amount" || cell.column.Header === "Invoice Amount") {
            return (
                <span>{cell.value && cell.value !== null ? USNumberFormat(cell.value) : USNumberFormat(0)}</span>
            )
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }


    return (
        <Modal isOpen={isOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Pay Now</h5>
                        <button type="button" className="close" onClick={() => { setIsOpen(false) }}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div className="p-2">
                        <fieldset className="scheduler-border">
                            <div className="row">
                                <div className="col-3">
                                    <div className="form-group">
                                        <label htmlFor="billRefNo" className="col-form-label">Customer Number</label>
                                        <input type="text" className="form-control" id="billRefNo" value={accountData?.customerNo} disabled />
                                    </div>
                                </div>
                                <div className="col-3">
                                    <div className="form-group">
                                        <label htmlFor="allocationLevel" className="col-form-label">Allocation Level<span>*</span></label>
                                        <select id="allocationLevel" className={`form-control ${paymentError.allocationLevel ? "error-border" : ""}`}
                                            value={paymentData.allocationLevel}
                                            onChange={(e) => {
                                                handleOnPaymentInputsChange(e)
                                                setPaymentError({ ...paymentError, allocationLevel: "" })
                                            }}
                                        >
                                            <option key="1" value="">Please Select Allocation Level</option>
                                            {
                                                allocationLevelLookup && allocationLevelLookup.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))
                                            }
                                            <option value="AUTOALLOC">Auto Allocation</option>
                                            <option value="INV">Invoice</option>
                                        </select>
                                        <span className="errormsg">{paymentError.allocationLevel ? paymentError.allocationLevel : ""}</span>
                                    </div>
                                </div>
                                <div className="col-3">
                                    <div className="form-group">
                                        <label htmlFor="currency" className="col-form-label">Currency<span className="ast">*</span></label>
                                        <select id="currency" className={`form-control ${paymentError.currency ? "error-border" : ""}`}
                                            value={paymentData.currency}
                                            onChange={(e) => {
                                                handleOnPaymentInputsChange(e)
                                                setPaymentError({ ...paymentError, currency: "" })
                                            }}
                                        >
                                            <option key="1" value="">Please Select Currency</option>
                                            {
                                                currencyLookup && currencyLookup.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))
                                            }
                                        </select>
                                        <span className="errormsg">{paymentError.currency ? paymentError.currency : ""}</span>
                                    </div>
                                </div>
                                <div className="col-3">
                                    <div className="form-group">
                                        <label htmlFor="paymentMode" className="col-form-label">Payment Mode<span className="ast">*</span></label>
                                        <select id="paymentMode" className={`form-control ${paymentError.paymentMode ? "error-border" : ""}`}
                                            value={paymentData.paymentMode}
                                            onChange={(e) => {
                                                handleOnPaymentInputsChange(e)
                                                clearPaymentData()
                                                setPaymentError({ ...paymentError, paymentMode: "" })
                                            }}
                                        >
                                            <option key="1" value="">Please Select Payment Mode</option>
                                            {
                                                paymentModeLookup && paymentModeLookup.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))
                                            }
                                        </select>
                                        <span className="errormsg">{paymentError.paymentMode ? paymentError.paymentMode : ""}</span>
                                    </div>
                                </div>
                                <div className="col-3 d-none">
                                    <div className="form-group">
                                        <label htmlFor="totalOutstanding" className="col-form-label">Total Outstanding</label>
                                        <input type="text" className="form-control" id="totalOutstanding" value={Number(paymentData.totalOutstanding).toFixed(2)} disabled />
                                    </div>
                                </div>
                                <div className="col-3 d-none">
                                    <div className="form-group">
                                        <label htmlFor="dueOutstanding" className="col-form-label">Due Outstanding</label>
                                        <input type="text" className="form-control" id="dueOutstanding" value={Number(paymentData.dueOutstanding).toFixed(2)} disabled />
                                    </div>
                                </div>
                                <div className="col-3">
                                    <div className="form-group">
                                        <label htmlFor="paymentAmount" className="col-form-label">Payment Amount<span className="ast">*</span></label>
                                        <input type="number" className="form-control" id="paymentAmount" value={paymentData.paymentAmount}
                                            onChange={(e) => {
                                                handleOnPaymentInputsChange(e)
                                                setPaymentError({ ...paymentError, paymentAmount: "" })
                                            }}
                                        />
                                        <span className="errormsg">{paymentError.paymentAmount ? paymentError.paymentAmount : ""}</span>
                                    </div>
                                </div>
                                <div className="col-3">
                                    <div className="form-group">
                                        <label htmlFor="contactType" className="col-form-label">Payment Location<span className="ast">*</span></label>
                                        <select id="paymentLocation" className={`form-control ${paymentError.paymentLocation ? "error-border" : ""}`}
                                            value={paymentData.paymentLocation}
                                            onChange={(e) => {
                                                handleOnPaymentInputsChange(e)
                                                setPaymentError({ ...paymentError, paymentLocation: "" })
                                            }}
                                        >
                                            <option key="1" value="">Please Select Payment Location</option>
                                            {
                                                paymentLocationLookup && paymentLocationLookup.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))
                                            }
                                        </select>
                                        <span className="errormsg">{paymentError.paymentLocation ? paymentError.paymentLocation : ""}</span>
                                    </div>
                                </div>
                                <div className="col-3 d-none">
                                    <div className="form-group">
                                        <label htmlFor="contactType" className="col-form-label"></label>
                                        <div className="custom-control custom-checkbox label-txt">
                                            <input type="checkbox" className="custom-control-input" id="isOffline" checked={paymentData.isOffline === "Y" ? true : false}
                                                onChange={(e) => {
                                                    if (e.target.checked === true) {
                                                        setPaymentData({ ...paymentData, isOffline: 'Y' })
                                                    }
                                                    else if (e.target.checked === false) {
                                                        setPaymentData({ ...paymentData, isOffline: 'N' })
                                                    }
                                                }}
                                            />
                                            <label className="custom-control-label" htmlFor="isOffline">Offline payment</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {
                                paymentData?.paymentMode !== "" && paymentData?.paymentMode === "PM_CHEQUE" &&
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="chequeNo" className="col-form-label">Cheque Number<span className="ast">*</span></label>
                                            <NumberFormatBase className="form-control" id="chequeNo" placeholder="Please Enter Cheque Number" value={chequeDetails.chequeNo}
                                                onChange={(e) => {
                                                    handleOnChequeInputsChange(e)
                                                    setChequeError({ ...chequeError, chequeNo: "" })
                                                }}
                                            />
                                            <span className="errormsg">{chequeError.chequeNo ? chequeError.chequeNo : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="chequeDate" className="col-form-label">Cheque Date<span className="ast">*</span></label>
                                            <input type="date" className="form-control" id="chequeDate" placeholder="" value={chequeDetails.chequeDate}
                                                onChange={(e) => {
                                                    handleOnChequeInputsChange(e)
                                                    setChequeError({ ...chequeError, chequeDate: "" })
                                                }}
                                            />
                                            <span className="errormsg">{chequeError.chequeDate ? chequeError.chequeDate : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="chequeBankName" className="col-form-label">Cheque Bank Name<span className="ast">*</span></label>
                                            <input type="text" className="form-control" id="chequeBankName" placeholder="Please Enter Cheque Bank Name" value={chequeDetails.chequeBankName}
                                                onChange={(e) => {
                                                    handleOnChequeInputsChange(e)
                                                    setChequeError({ ...chequeError, chequeBankName: "" })
                                                }}
                                            />
                                            <span className="errormsg">{chequeError.chequeBankName ? chequeError.chequeBankName : ""}</span>
                                        </div>
                                    </div>
                                </div>
                            }
                            {
                                paymentData?.paymentMode !== "" && paymentData?.paymentMode === "PM_CARD" &&
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="cardNo" className="col-form-label">Card Number<span className="ast">*</span></label>
                                            <NumberFormatBase maxLength = "15" className="form-control" id="cardNo" placeholder="Please Enter Card Number" value={cardDetails.cardNo}
                                                onChange={(e) => {
                                                    handleOnCardInputsChange(e)
                                                    setCardError({ ...cardError, cardNo: "" })
                                                }}
                                            />
                                            <span className="errormsg">{cardError.cardNo ? cardError.cardNo : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="cardExpiryDate" className="col-form-label">Card Expiry Date<span className="ast">*</span></label>
                                            <input type="date" className="form-control" min= {moment().add(2, 'days').format('YYYY-MM-DD')} id="cardExpiryDate" placeholder="" value={cardDetails.cardExpiryDate}
                                                onChange={(e) => {
                                                    handleOnCardInputsChange(e)
                                                    setCardError({ ...cardError, cardExpiryDate: "" })
                                                }}
                                            />
                                            <span className="errormsg">{cardError.cardExpiryDate ? cardError.cardExpiryDate : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="cardType" className="col-form-label">Card Type<span className="ast">*</span></label>
                                            <select type="text" className="form-control" id="cardType" placeholder="" value={cardDetails.cardType}
                                                onChange={(e) => {
                                                    handleOnCardInputsChange(e)
                                                    setCardError({ ...cardError, cardType: "" })
                                                }}
                                            >
                                                <option value="">Select Card Type</option>
                                                <option value="MASTER">Master</option>
                                                <option value="VISA">Visa</option>
                                            </select>
                                            <span className="errormsg">{cardError.cardType ? cardError.cardType : ""}</span>
                                        </div>
                                    </div>
                                </div>
                            }
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label htmlFor="paymentRemark" className="col-form-label">Remarks</label>
                                        <textarea id="paymentRemark" className="form-control" value={paymentData.paymentRemark}
                                            onChange={(e) => { handleOnPaymentInputsChange(e) }}
                                        >
                                        </textarea>
                                    </div>
                                </div>
                            </div>
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
                    <div className="adjusment modal-body">
                        {
                            paymentData.allocationLevel !== '' && paymentData.allocationLevel !== 'AUTOALLOC' &&
                            <>
                                <div className="row">
                                    <section className="triangle col-12 pb-2">
                                        <div className="row col-12">
                                            <div className="col-12">
                                                <h4 id="" className="pl-3">Invoice</h4>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                                <div className="col-md-12 card-box m-0 ">
                                    {
                                        invoice && !!invoice.length ?
                                        <div className="card">
                                            <DynamicTable
                                                listKey={"Invoice List"}
                                                row={invoice}
                                                rowCount={totalCount}
                                                header={InvoiceSearchColumns}
                                                itemsPerPage={perPage}
                                                backendPaging={true}
                                                backendCurrentPage={currentPage}
                                                hiddenColumns={InvoicePaymentHiddenColumns}
                                                isTableFirstRender={isTableFirstRender}
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
                                        :
                                        <span className="msg-txt">No Invoice Available</span>
                                    }
                                </div>
                            </>
                        }
                    </div>
                    <div className="adjusment modal-body">
                        {
                            paymentData.allocationLevel === 'INVCHARGE' &&
                            <>
                                <div className="row">
                                    <section className="triangle col-12 pb-2">
                                        <div className="row col-12">
                                            <div className="col-12">
                                                <h4 id="" className="pl-3">Invoice Details</h4>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                                <div className="col-md-12 card-box m-0 ">
                                    {
                                        invoiceDetail && !!invoiceDetail.length &&
                                        <div className="card">
                                            <DynamicTable
                                                listKey={"Invoice Detail List"}
                                                row={invoiceDetail}
                                                header={InvoiceDetailListColumns}
                                                itemsPerPage={10}
                                                hiddenColumns={InvoiceDetailPaymentHiddenColumns}
                                                exportBtn={exportBtn}
                                                handler={{
                                                    handleCellRender: handleCellRender,
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
            </div>
        </Modal>
    )
}

export default PayNow