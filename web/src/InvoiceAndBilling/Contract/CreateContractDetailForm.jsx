import React from 'react';
import { useState, useEffect } from 'react';
import { get, post } from '../../common/util/restUtil';
import { validateNumber } from '../../common/util/util';
import { properties } from '../../properties';

import { toast } from 'react-toastify';
import moment from 'moment'
import { NumberFormatBase } from 'react-number-format';
import { string, object } from "yup";

const CreateContractDetailForm = (props) => {

    const { selectedContractId, customer, refresh, contractData, contractDetailData, isOpen } = props.data;
    const { pageRefresh, setRefresh, setIsOpen, setContractDetailData } = props.handler;
    const [contractTypes, setContractTypes] = useState([]);
    const [contractNames, setContractNames] = useState([]);
    const prorateArray = [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" }
    ]
    const [detailsError, setDetailsError] = useState({});
    const [chargeTypes, setChargeTypes] = useState([]);
    const [frequency, setFrequency] = useState([])
    const [serviceType, setServiceType] = useState([])
    const [plan, setPlan] = useState([])
    const [isTierType, setIsTierType] = useState(false)
    const [hideTierTypeFlag, setHideTierTypeFlag] = useState(true)

    const initialValues = {
        soNumber: "",
        itemName: "",
        billRefNo: customer.crmCustomerNo,
        contractType: "",
        contractTypeDesc: "",
        contractName: "",
        contractStartDate: "",
        contractEndDate: "",
        itemId: "",
        prorated: "",
        chargeId: "",
        chargeAmount: "",
        frequency: "",
        chargeName: "",
        chargeType: "",
        serviceType: "",
        minCommitment: "",
        totalConsumption: "",
        upfrontPayment: "",
        quantity: "",
        adhocContract: "NO",
        durationMonth: getMonthDifference(new Date(contractData?.startDate), new Date(contractData?.endDate))
    }

    function getMonthDifference (startDate, endDate) {
        return (
          endDate.getMonth() -
          startDate.getMonth() +
          12 * (endDate.getFullYear() - startDate.getFullYear())
        )
      }

    const [contractDetailForm, setContractDetailForm] = useState(initialValues)

    const contractDetailValidationSchema = object().shape({
        //soNumber: string().required("Please Select SO Number"),
        itemId: string().required("Please Select Product Name"),
        serviceType: string().required("Please Select Service Type"),
        contractName: string().required("Please Enter Product Description"),
        contractType: string().required("Please Enter Product Type"),
        // contractStartDate: contractDetailForm?.chargeType !== 'CC_USGC' ? string().required("Please Enter Start sate") : string().nullable(true),
        // contractEndDate: contractDetailForm?.chargeType !== 'CC_USGC' ? string().required("Please Enter End sate").test(
        //     "Date",
        //     "End date should not be less than from Start date",
        //     (endDate) => validateToDateContractDetails(endDate)
        // ) : string().nullable(true),
        //chargeName: contractDetailForm?.adhocContract === 'YES' ? string().required("Please enter Charge Name") : string().nullable(true),
        minCommitment: contractDetailForm?.chargeType === 'CC_USGC' ? string().required("Please Enter Minimum Commitment") : string().nullable(true),
        totalConsumption: contractDetailForm?.chargeType === 'CC_USGC' ? string().required("Please Enter Total Consumption").test(
            "Total Consumption",
            "Total Consumption should not be less than Minimum Consumption",
            () => validateTotalConsumption()
        ) : string().nullable(true),
        chargeAmount: contractDetailForm?.chargeType !== 'CC_USGC' ? string().required("Please Enter Total Charge Amount") : string().nullable(true),
        quantity: contractDetailForm?.chargeType !== 'CC_USGC' ? string().required("Please Enter Quantity") : string().nullable(true),
        upfrontPayment: string().required("Please Enter Advance Flag"),
        //quantity: string().required("Please Enter Quantity"),
        chargeType: string().required("Please Enter Charge Type"),
        // chargeAmount: string().required("Please Enter Charge Amount"),
        frequency: (contractDetailForm?.chargeType === 'CC_RC') ? string().required("Please Enter Frequency") : string().nullable(true),
        prorated: (contractDetailForm?.chargeType === 'CC_RC') ? string().required("Please Enter Prorated") : string().nullable(true),
        addConsumption1: contractDetailForm?.chargeType === 'CC_USGC' && isTierType === true ? string().required("Please Enter value") : string().nullable(true),
        addConsumption2: contractDetailForm?.chargeType === 'CC_USGC' && isTierType === true ? string().required("Please Enter value") : string().nullable(true),
        addConsumption3: contractDetailForm?.chargeType === 'CC_USGC' && isTierType === true ? string().required("Please Enter value") : string().nullable(true)
    });

    const usageValidationSchema = object().shape({
        itemId: string().required("Please Select Plan Name"),
        serviceType: string().required("Please Select Service Type"),
        minCommitment: string().required("Please Enter Minimum Commitment").nullable(true),
        totalConsumption: string().required("Please Enter Total Consumption").test(
            "Total Consumption",
            "Total Consumption should not be less than Minimum Consumption",
            () => validateTotalConsumption()
        ).nullable(true),
        chargeType: string().required("Please Enter Charge Type"),
        addConsumption1: isTierType === true ? string().required("Please Enter value") : string().nullable(true),
        addConsumption2: isTierType === true ? string().required("Please Enter value") : string().nullable(true),
        addConsumption3: isTierType === true ? string().required("Please Enter value") : string().nullable(true)
    });

    const validateToDateContractDetails = (value) => {
        try {
            if (Date.parse(value) < Date.parse(contractDetailForm?.contractStartDate))
                return false;
            return true
        } catch (e) {
            return false
        }
    }

    const validateTotalConsumption = () => {
        try {
            if (Number(contractDetailForm?.totalConsumption) < Number(contractDetailForm?.minCommitment))
                return false;
            return true
        } catch (e) {
            return false
        }
    }

    const validateDetails = (schema, data) => {
        try {
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setDetailsError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    }

    useEffect(() => {
        
        setDetailsError({})
        post(properties.BUSINESS_ENTITY_API, [
            "CATALOG_TYPE", "CHARGE_CATEGORY", "CHARGE_FREQUENCY", "PROD_TYPE"
        ])
            .then((response) => {
                if (response.data) {
                    setContractTypes(response.data["CATALOG_TYPE"].filter((c) => c.code !== 'CATALOG_ADDON'))
                    setChargeTypes(response.data["CHARGE_CATEGORY"].filter((c) => c.code !== 'CC_USGC'))
                    setFrequency(response.data["CHARGE_FREQUENCY"])
                    setServiceType(response.data["PROD_TYPE"])
                }
            })
            .catch(error => {
                console.error(error);
            })
        get(properties.LOOKUP_ITEMS).then((resp) => {
            if (resp.data) {
                setContractNames(resp.data.filter((record) => ['plan','service','asset'].includes(record.contractType)))
            }
        }).catch(error => {
            console.error(error);
        }).finally()
    }, [])

    const [salesOrderNumberList, setSalesOrderNumberList] = useState([])
    
    useEffect(() => {
        
        get(properties.ORDERS_API + '/sales-order-list/' + customer?.customerId + '?contractSoNo=true')
            .then((response) => {
                if (response.data.length > 0) {
                    setSalesOrderNumberList(response.data)
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }, [])

    const [removeIndex, setRemoveIndex] = useState(0)

    const handleClear = () => {
        setDetailsError({})
        setContractDetailForm(initialValues);
    }

    const onChangeServiceType = (e) => {
        setPlan(contractNames.filter(r => r.serviceType === e.target.value))
    }

    const handleContractDetail = () => {
        if (contractDetailForm.adhocContract === "YES") {
            setContractDetailForm({ ...contractDetailForm, contractType: "Plan" })
            if (true) {
                const error = validateDetails(contractDetailValidationSchema, contractDetailForm);
                if (error) {
                    toast.error("Validation Error Found, Please Add Contract Details")
                    return;
                }
                if (contractDetailForm.chargeType !== 'CC_RC') {
                    contractDetailForm.frequency = ""
                    contractDetailForm.prorated = ""
                }
                else {
                    if (contractDetailForm.frequency === "") {
                        toast.error("Frequency is Required")
                        return
                    }
                    if (contractDetailForm.prorated === "") {
                        toast.error("Prorated is Required")
                        return
                    }
                    if (Number(contractDetailForm?.chargeAmount).toFixed(2) === Number(0).toFixed(2)) {
                        toast.error("Total Charge Amount cannot be Zero")
                        return
                    }
                }
                if (moment(contractDetailForm.contractEndDate).isBefore(contractDetailForm.contractStartDate)) {
                    toast.error("End Date Cannot be less than Start Date")
                    return
                }
                if (!moment(contractDetailForm.contractStartDate).isBetween(moment(contractData?.startDate).format('YYYY-MM-DD'), moment(contractData?.endDate).format('YYYY-MM-DD'), null, '[]')) {
                    toast.error("Contract Detail Start Date Should be between Contract Start and End Date")
                    return
                }
                // if (!moment(contractDetailForm.contractEndDate).isBetween(moment(contractData?.startDate).format('YYYY-MM-DD'), moment(contractData?.endDate).format('YYYY-MM-DD'), null, '[]')) {
                //     toast.error("Contract Detail End Date Should be between Contract Start and End Date")
                //     return
                // }
                let obj = {
                    ...contractDetailForm
                }
                //delete obj.itemId
                //delete obj.chargeId
                handleSubmit(obj);
            } else { toast.error("Please Add Contract Details") }

        } else {
            if (true) {
                const error = validateDetails(contractDetailValidationSchema, contractDetailForm);
                if (error) {
                    console.log('error',error)
                    toast.error("Validation Error Found, Please check contract Details")
                    return;
                }
                if (contractDetailForm.chargeType === 'CC_USGC' && (contractDetailForm.contractStartDate === null || contractDetailForm.contractStartDate === '') && (contractDetailForm.contractEndDate === null || contractDetailForm.contractEndDate === '')) {
                    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
                    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');

                    contractDetailForm.contractStartDate = startOfMonth
                    contractDetailForm.contractEndDate = endOfMonth
                } else {
                    if (moment(contractDetailForm.contractEndDate).isBefore(contractDetailForm.contractStartDate)) {
                        toast.error("End Date Cannot be less than Start Date")
                        return
                    }
                    // if (!moment(contractDetailForm.contractStartDate).isBetween(moment(contractData?.startDate).format('YYYY-MM-DD'), moment(contractData?.endDate).format('YYYY-MM-DD'), null, '[]')) {
                    //     toast.error("Contract Detail Start Date Should be between Contract Start and End Date")
                    //     return
                    // }
                    // if (!moment(contractDetailForm.contractEndDate).isBetween(moment(contractData?.startDate).format('YYYY-MM-DD'), moment(contractData?.endDate).format('YYYY-MM-DD'), null, '[]')) {
                    //     toast.error("Contract Detail End Date Should be between Contract Start and End Date")
                    //     return
                    // }
                    if (contractDetailForm.chargeType !== 'CC_USGC') {
                        if (Number(contractDetailForm?.chargeAmount).toFixed(2) === Number(0).toFixed(2)) {
                            toast.error("Total Charge Amount cannot be Zero")
                            return
                        }
                        if (Number(contractDetailForm?.quantity).toFixed(2) === Number(0).toFixed(2)) {
                            toast.error("Quantity cannot be Zero")
                            return
                        }
                    }
                }

                handleSubmit(contractDetailForm);
            } else { toast.error("Please Add Contract Details") }
        }
    }
    /*
    const handleSubmit = (data) => {
        let array = [data]
        array.map((p) => {
            // contractTypes.map((type) => {
            //     if (type.description === p.contractType) {
            //         p.contractType = type.code
            //     }
            // })

            salesOrderNumberList.forEach((salesOrder) => {
                if (p.soNumber === salesOrder.soNumber) {
                    p.soId = salesOrder.soId
                }
            })
            contractNames.map((a) => {
                if (p.adhocContract === "NO" && Number(p.itemId) === Number(a.itemId) && a.contractType === 'plan') {

                    p.planName = a.itemName
                    p.itemId = a.itemId
                    //p.serviceType = a.serviceType
                    p.chargeId = a.chargeId
                    //p.chargeName = a.chargeName
                    //p.chargeAmount = Number(a.chargeAmount)
                    //p.chargeType = a.chargeCat
                    //p.frequency = a?.frequency ? a?.frequency : 'FREQ_MONTH'
                    //p.frequencyDesc = a?.frequencyDesc ? a?.frequencyDesc : 'Monthly'
                    //p.prorated = a?.prorated ? a?.prorated : ''
                }
            })
            //p.itemId = p.itemId
            p.minCommitment = p.minCommitment === "" ? null : p.minCommitment
            p.totalConsumption = p.totalConsumption === "" ? null : p.totalConsumption
            p.adhocContract = 'YES'
            return p;
        })

        let reqBody = { contractId: Number(selectedContractId), contractDtl: array }
        
        post(properties.CONTRACT_API, reqBody).then((resp) => {
            if (resp.status === 200) {
                setIsOpen(false)
                toast.success("Contract Detail Created successfully ");
                setRefresh(!refresh)
                pageRefresh()
                setContractDetailForm(initialValues)
            }
        }).catch((error) => {
            console.log(error)
            toast.error(error);

        }).finally();

    }
    */
    const handleSubmit = (data) => {
        let count = removeIndex + 1
        setRemoveIndex(count)
        const detailData = data
        contractNames.map((a) => {
            if (Number(data.itemId) === Number(a.itemId) && a.contractType ===  data.contractTypeDesc.toLowerCase()) {
                detailData.itemName = a.itemName
                detailData.itemId = a.itemId
            }
        })
        detailData.pricePerUnit = Number(data?.chargeAmount)
        if(data?.chargeType === 'CC_RC') {
            detailData.chargeAmount = (Number(data?.chargeAmount) * Number(data?.quantity) * Number(data?.durationMonth))
        } else if(data?.chargeType === 'CC_NRC') {
            detailData.chargeAmount = (Number(data?.chargeAmount) * Number(data?.quantity))
        }
        detailData.indexId = count
        setContractDetailData([...contractDetailData,detailData])
        setIsOpen(!isOpen)
    } 

    const handleTierType = (e) => {
        setIsTierType(e.target.checked)
    }

    const handleUsageDetail = () => {
        setDetailsError({})
        const error = validateDetails(usageValidationSchema, contractDetailForm);
        if (error) {
            toast.error("Validation Error Found, Please enter minimum Details")
            return;
        }
        if (Number(contractDetailForm?.totalConsumption).toFixed(2) === Number(0).toFixed(2)) {
            toast.error("Total Consumption cannot be Zero")
            return
        }
        if (Number(contractDetailForm?.minCommitment).toFixed(2) === Number(0).toFixed(2)) {
            toast.error("Minimum Commitment cannot be Zero")
            return
        }
        contractDetailForm.isTierType = isTierType
        let reqBody = { contractId: Number(selectedContractId), contractDtl: contractDetailForm }
        
        post(properties.CONTRACT_API + '/usage-calculation', reqBody).then((resp) => {
            if (resp.status === 200) {
                if (!resp.data.error) {
                    setContractDetailForm({ ...contractDetailForm, quantity: resp.data.quantity, chargeAmount: resp.data.chargeAmount })
                } else {
                    toast.error(resp.data.error);
                }
            }

        }).catch((error) => {
            toast.error(error);
        }).finally();
    }

    const hideTierType = (e) => {
        const flag = []
        contractNames.filter(ele => {
            if (Number(ele.itemId) === Number(e) && ele.isTierType === 'Y') {
                flag.push('N')
            }
        })
        if (flag[0] === 'N') {
            setHideTierTypeFlag(false)
        } else {
            setHideTierTypeFlag(true)
            setIsTierType(false)
        }
    }

    const handleProductTypeChange = (e) => {
        setPlan(contractNames.filter(r => r.contractType === e.toLowerCase()))
    }

    return (
        <div className="add-line card-box" style={{ border: "1px solid grey" }}>
            <div>
                <div className="row">
                    <div className="col-md-3 d-none">
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">S.O Number<span>*</span></label>
                            <select className="form-control" value={contractDetailForm.soNumber}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, soNumber: e.target.value });
                                    setDetailsError({ ...detailsError, soNumber: "" })
                                }}>
                                <option value="">Select SO Number</option>
                                {
                                    salesOrderNumberList && salesOrderNumberList.map((c, index) => {
                                        return (<option key={index} value={c.soNumber}>{c.soNumber}</option>)
                                    })
                                }
                            </select>
                            {detailsError.soNumber ? <span className="errormsg">{detailsError.soNumber}</span> : ""}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Product Type<span>*</span></label>
                            <select className="form-control" value={contractDetailForm?.contractType}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, contractType: e.target.value, contractTypeDesc: e.target.options[e.target.selectedIndex].label });
                                    setDetailsError({ ...detailsError, contractType: "" })
                                    handleProductTypeChange(e.target.options[e.target.selectedIndex].label)
                                }}>
                                <option value="">Select Product Type</option>
                                {
                                    contractTypes && contractTypes.map((c, index) => {
                                        return (<option key={index} value={c.code}>{c.description}</option>)
                                    })
                                }
                            </select>
                            {detailsError.contractType ? <span className="errormsg">{detailsError.contractType}</span> : ""}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Service Type<span>*</span></label>
                            <select className="form-control" value={serviceType.code}
                                onChange={(e) => {
                                    if(contractDetailForm?.contractType === '') {
                                        toast.error('Please Select Product Type')
                                        return
                                    } else {
                                        setContractDetailForm({ ...contractDetailForm, serviceType: e.target.value });
                                        setDetailsError({ ...detailsError, serviceType: "" })
                                        onChangeServiceType(e)
                                    }
                                }}>
                                <option value="">Select Service Type</option>
                                {
                                    serviceType && serviceType.map((c, index) => {
                                        return (<option key={index} value={c.code}>{c.description}</option>)
                                    })
                                }
                            </select>
                            {detailsError.serviceType ? <span className="errormsg">{detailsError.serviceType}</span> : ""}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Product Name<span>*</span></label>
                            <select className="form-control" value={contractDetailForm.itemId}
                                onChange={(e) => {
                                    if(contractDetailForm?.contractType === '') {
                                        toast.error('Please Select Product Type')
                                        return
                                    } else {
                                        setContractDetailForm({ ...contractDetailForm, itemId: e.target.value });
                                        setDetailsError({ ...detailsError, itemId: "" })
                                        hideTierType(e.target.value)
                                    }
                                }}
                            >
                                <option value="">Select Product Name</option>
                                {
                                    plan && plan.map((c, index) => {
                                        return (<option key={index} value={c.itemId}>{c.itemName}</option>)
                                    })
                                }
                            </select>
                            {detailsError.itemId ? <span className="errormsg">{detailsError.itemId}</span> : ""}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Product Description<span>*</span></label>
                            <input type="text" className="form-control"
                                value={contractDetailForm.contractName}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, contractName: e.target.value });
                                    setDetailsError({ ...detailsError, contractName: "" })
                                }}></input>
                            {detailsError.contractName ? <span className="errormsg">{detailsError.contractName}</span> : ""}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Charge Type<span>*</span></label>
                            <select className="form-control" value={contractDetailForm.chargeType}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, chargeType: e.target.value, chargeTypeDesc: e.target.options[e.target.selectedIndex].label, minCommitment: 0, totalConsumption: 0, prorated: "", frequency: "", contractStartDate: "", contractEndDate: "", quantity: 0, chargeAmount: 0 });
                                    setDetailsError({ ...detailsError, chargeType: "", frequency: "", prorated: "", minCommitment: 0, totalConsumption: 0, contractStartDate: "", contractEndDate: "", quantity: 0, chargeAmount: 0 })
                                }}>
                                <option value="">Select Charge Type</option>
                                {chargeTypes && chargeTypes.map((c, index) => {

                                    return (<option key={index} value={c.code}>{c.description}</option>)
                                })
                                }
                            </select>
                            {detailsError.chargeType ? <span className="errormsg">{detailsError.chargeType}</span> : ""}
                        </div>
                    </div>
                    <div className="col-md-3 d-none">
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Start Date {contractDetailForm?.chargeType === 'CC_USGC' ? "" : <span>*</span>}</label>
                            <input type="date" className="form-control"
                                value={contractDetailForm.contractStartDate}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, contractStartDate: e.target.value });
                                    setDetailsError({ ...detailsError, contractStartDate: "" })
                                }}></input>
                            {detailsError.contractStartDate ? <span className="errormsg">{detailsError.contractStartDate}</span> : ""}
                        </div>
                    </div>
                    <div className="col-md-3 d-none">
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">End Date {contractDetailForm?.chargeType === 'CC_USGC' ? "" : <span>*</span>}</label>
                            <input type="date" className="form-control"
                                value={contractDetailForm.contractEndDate}
                                //min={contractDetailForm.contractStartDate}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, contractEndDate: e.target.value });
                                    setDetailsError({ ...detailsError, contractEndDate: "" })
                                }}></input>
                            {detailsError.contractEndDate ? <span className="errormsg">{detailsError.contractEndDate}</span> : ""}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Total Charge Amount {contractDetailForm?.chargeType === 'CC_USGC' ? "" : <span>*</span>}</label>
                            <NumberFormatBase className="form-control"
                                value={Number(contractDetailForm.chargeAmount).toFixed(2)}
                                disabled={contractDetailForm?.chargeType === 'CC_USGC'}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, chargeAmount: Number(e.target.value).toFixed(2) });
                                    setDetailsError({ ...detailsError, chargeAmount: "" })
                                }}></NumberFormatBase>
                            {detailsError.chargeAmount ? <span className="errormsg">{detailsError.chargeAmount}</span> : ""}
                        </div>
                    </div>
                {/* </div>
                <div className="row"> */}
                    <div className={contractDetailForm?.chargeType === 'CC_USGC' && hideTierTypeFlag === false ? "col-md-3" : "d-none"}>
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Tier based ?</label>
                            <div className="form-check">
                                <input className="form-check-input position-static checkmark" type="checkbox" value={contractDetailForm.isTierType}
                                    onChange={(e) => {
                                        handleTierType(e)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={contractDetailForm?.chargeType !== 'CC_USGC' ? "d-none" : "col-md-3"}>
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Minimum Commitment<span>*</span></label>
                            <NumberFormatBase className="form-control"
                                value={Number(contractDetailForm.minCommitment).toFixed(2)}
                                disabled={contractDetailForm?.chargeType !== 'CC_USGC'}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, minCommitment: Number(e.target.value).toFixed(2) });
                                    setDetailsError({ ...detailsError, minCommitment: "" })
                                }}></NumberFormatBase>
                            {detailsError.minCommitment ? <span className="errormsg">{detailsError.minCommitment}</span> : ""}
                        </div>
                    </div>
                    <div className={contractDetailForm?.chargeType !== 'CC_USGC' ? "d-none" : "col-md-3"}>
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Total Consumption<span>*</span></label>
                            <NumberFormatBase className="form-control"
                                value={Number(contractDetailForm.totalConsumption).toFixed(2)}
                                disabled={contractDetailForm?.chargeType !== 'CC_USGC'}
                                //onKeyPress={(e) => { validateNumber(e) }}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, totalConsumption: Number(e.target.value).toFixed(2) });
                                    setDetailsError({ ...detailsError, totalConsumption: "" })
                                }}></NumberFormatBase>
                            {detailsError.totalConsumption ? <span className="errormsg">{detailsError.totalConsumption}</span> : ""}
                        </div>
                    </div>
                {/* </div>
                <div className="row"> */}
                    <div className={isTierType === true ? "col-md-3" : "d-none"}>
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Additional Consumption upto 50 TB<span>*</span></label>
                            <NumberFormatBase className="form-control"
                                value={Number(contractDetailForm.addConsumption1).toFixed(2)}
                                disabled={contractDetailForm?.chargeType !== 'CC_USGC'}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, addConsumption1: Number(e.target.value).toFixed(2) });
                                    setDetailsError({ ...detailsError, addConsumption1: "" })
                                }}></NumberFormatBase>
                            {detailsError.addConsumption1 ? <span className="errormsg">{detailsError.addConsumption1}</span> : ""}
                        </div>
                    </div>
                    <div className={isTierType === true ? "col-md-3" : "d-none"}>
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Additional Consumption More than 50 TB<span>*</span></label>
                            <NumberFormatBase className="form-control"
                                value={Number(contractDetailForm.addConsumption2).toFixed(2)}
                                disabled={contractDetailForm?.chargeType !== 'CC_USGC'}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, addConsumption2: Number(e.target.value).toFixed(2) });
                                    setDetailsError({ ...detailsError, addConsumption2: "" })
                                }}></NumberFormatBase>
                            {detailsError.addConsumption2 ? <span className="errormsg">{detailsError.addConsumption2}</span> : ""}
                        </div>
                    </div>
                    <div className={isTierType === true ? "col-md-3" : "d-none"}>
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Additional Consumption More than 100 TB<span>*</span></label>
                            <NumberFormatBase className="form-control"
                                value={Number(contractDetailForm.addConsumption3).toFixed(2)}
                                disabled={contractDetailForm?.chargeType !== 'CC_USGC'}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, addConsumption3: Number(e.target.value).toFixed(2) });
                                    setDetailsError({ ...detailsError, addConsumption3: "" })
                                }}></NumberFormatBase>
                            {detailsError.addConsumption3 ? <span className="errormsg">{detailsError.addConsumption3}</span> : ""}
                        </div>
                    </div>
                {/* </div>
                <div className="row"> */}
                    <div className={contractDetailForm?.chargeType !== 'CC_RC' ? "d-none" : "col-md-3"}>
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Frequency<span>*</span></label>
                            <select className="form-control" value={contractDetailForm.frequency} disabled={contractDetailForm?.chargeType !== 'CC_RC'}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, frequency: e.target.value, frequencyDesc: e.target.options[e.target.selectedIndex].label, });
                                    setDetailsError({ ...detailsError, frequency: "" })
                                }}>
                                <option value="">Select frequency</option>
                                {frequency && frequency.map((c, index) => {

                                    return (<option key={index} value={c.code}>{c.description}</option>)
                                })
                                }
                            </select>
                            {detailsError.frequency ? <span className="errormsg">{detailsError.frequency}</span> : ""}
                        </div>
                    </div>
                    <div className={contractDetailForm?.chargeType !== 'CC_RC' ? "d-none" : "col-md-3"} >
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Prorated<span>*</span></label>
                            <select type="text" className="form-control"
                                value={contractDetailForm.prorated}
                                disabled={contractDetailForm?.chargeType !== 'CC_RC'}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, prorated: e.target.value });
                                    setDetailsError({ ...detailsError, prorated: "" })
                                }}>
                                <option value="">Select prorated</option>
                                {prorateArray && prorateArray.map((c, index) => {

                                    return (<option key={index} value={c.value}>{c.label}</option>)
                                })
                                }
                            </select>
                            {detailsError.prorated ? <span className="errormsg">{detailsError.prorated}</span> : ""}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Quantity {contractDetailForm?.chargeType === 'CC_USGC' ? "" : <span>*</span>}</label>
                            <NumberFormatBase className="form-control"
                                value={contractDetailForm.quantity}
                                disabled={contractDetailForm?.chargeType === 'CC_USGC'}
                                //onKeyPress={(e) => { validateNumber(e) }}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, quantity: e.target.value });
                                    setDetailsError({ ...detailsError, quantity: "" })
                                }}></NumberFormatBase>
                            {detailsError.quantity ? <span className="errormsg">{detailsError.quantity}</span> : ""}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="inputState" className="col-form-label">Advance Flag<span>*</span></label>
                            <select type="text" className="form-control"
                                value={contractDetailForm.upfrontPayment}
                                onChange={(e) => {
                                    setContractDetailForm({ ...contractDetailForm, upfrontPayment: e.target.value });
                                    setDetailsError({ ...detailsError, upfrontPayment: "" })
                                }}>
                                <option value="">Select Advance Flag</option>
                                {prorateArray && prorateArray.map((c, index) => {

                                    return (<option key={index} value={c.value}>{c.label}</option>)
                                })
                                }
                            </select>
                            {detailsError.upfrontPayment ? <span className="errormsg">{detailsError.upfrontPayment}</span> : ""}
                        </div>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-center mt-2">
                <button type="submit" className={contractDetailForm?.chargeType !== 'CC_USGC' ? "d-none" : "btn btn-primary btn-sm waves-effect waves-light mr-2"} onClick={handleUsageDetail}>Calculate Usage</button>
                <button type="submit" className="btn btn-primary btn-sm waves-effect waves-light mr-2" onClick={handleContractDetail}>Submit</button>
                <button type="submit" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleClear} >Clear</button>
            </div>

        </div>
    )


}
export default CreateContractDetailForm;
