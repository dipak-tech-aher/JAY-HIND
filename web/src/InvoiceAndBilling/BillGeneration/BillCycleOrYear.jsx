import React, { useState, useEffect } from 'react';
import { string, object } from "yup";

const BillCycleOrYear = (props) => {

    const { billPeriodLookup, billYearLookup, selectionOptionLookup, billCycleLookup, billSelectionInputs, readOnly = false, lastSixBillCycle = [] } = props.data;
    const { handleOnBillSelectionInputs, handleOnBillingCycleSubmit, setBillSelectionInputs, setBillCycleLookup } = props.handler;

    const [selectedBill, setSelectedBill] = useState(readOnly ? 'Cplus' : 'C');
    const [error, setError] = useState({})

    const validationSchema = object().shape({
        billCycle: string().required("Please Select Bill Cycle"),
        billPeriod: selectedBill === "Cplus" ? string().required("Please Select Bill Period") : string().nullable(true),
        billYear: selectedBill === "Cplus" ? string().required("Please Select Bill Year") : string().nullable(true),
        billPeriodOption: selectedBill === "Cplus" ? string().required("Please Select Bill Period Option") : string().nullable(true)
    })

    const validate = () => {
        try {
            validationSchema.validateSync(billSelectionInputs, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    useEffect(() => {
        if (!!lastSixBillCycle.length) {
            setBillSelectionInputs({
                billCycle: "",
                billPeriod: "",
                billYear: "",
                billPeriodOption: ""
            });
            if (selectedBill === 'C') {
                setBillCycleLookup(lastSixBillCycle);
            }
            else {
                setBillCycleLookup([]);
            }
        }
    }, [lastSixBillCycle, selectedBill])

    const handleOnSelectBillChange = (e) => {
        const { target } = e;
        setSelectedBill(target.value);
    }

    const handleBillingHistorySearch = () => {
        if(readOnly === false) 
        {
            const error = validate(validationSchema, billSelectionInputs);
            if (error) return;
        }
        handleOnBillingCycleSubmit()
    }

    const handleBillSelectionInputChange = (e) => {
        const target = e.target;
        setError({
            ...error,
            [target.id]: ""
        })
        handleOnBillSelectionInputs(e)
    }

    return (
        <fieldset className="cmmn-skeleton mb-2">
            <div className="row col-lg-12 p-1">
                <div className="col-3 custom-control custom-radio">
                    <label htmlFor="billSelection" className="col-form-label">Select Bill Cycle or Year </label><br />
                    <div className='row align-items-center pl-2'>
                        
                        <div className={`form-check-inline radio radio-primary skel-bill-radio ${readOnly ? 'd-none' : ''}`}>
                            
                            <input id="billCycle" type="radio" value="C" checked={selectedBill === 'C'} onChange={handleOnSelectBillChange} className="mt-0 mr-1 form-check-input" />
                                <label>Bill Cycle
                            </label>
                        </div>
                        <div className="form-check-inline radio radio-primary skel-bill-radio">
                            
                            <input id="billPeriod" type="radio" value="Cplus" checked={selectedBill === 'Cplus'} onChange={handleOnSelectBillChange} className="mt-0 mr-1 form-check-input" />
                                <label> Bill Period
                            </label>
                        </div>
                    </div>
                </div>
                <div className="col-9">
                    <div className="C selectt">
                        <div className="row align-items-center">
                            {
                                selectedBill === 'Cplus' &&
                                <>
                                    <div className="col-2">
                                        <div className="form-group">
                                            <label htmlFor="billPeriod" className="col-form-label">Bill Period<span>{readOnly === true ? '' : '*' }</span></label>
                                            <select id="billPeriod" className="form-control" value={billSelectionInputs.billPeriod} onChange={handleBillSelectionInputChange} readOnly={readOnly}>
                                                <option value="" key="BP">Select Bill Period</option>
                                                {
                                                    billPeriodLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            {error.billPeriod ? <span className="errormsg">{error.billPeriod}</span> : ""}
                                        </div>
                                    </div>
                                    <div className="col-2">
                                        <div className="form-group">
                                            <label htmlFor="billYear" className="col-form-label">Bill Year<span>{readOnly === true ? '' : '*' }</span></label>
                                            <select id="billYear" className="form-control" value={billSelectionInputs.billYear} onChange={handleBillSelectionInputChange} readOnly={readOnly}>
                                                <option value="" key="BY">Select Bill Year</option>
                                                {
                                                    billYearLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            {error.billYear ? <span className="errormsg">{error.billYear}</span> : ""}
                                        </div>
                                    </div>
                                    <div className="col-2">
                                        <div className="form-group">
                                            <label htmlFor="billPeriodOption" className="col-form-label">Select Option<span>{readOnly === true ? '' : '*' }</span></label>
                                            <select id="billPeriodOption" className="form-control" value={billSelectionInputs.billPeriodOption} onChange={handleBillSelectionInputChange} readOnly={readOnly}>
                                                <option value="" key="BO">Select Bill Option</option>
                                                {
                                                    selectionOptionLookup.map((e) => (
                                                        <option key={e.description} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                             </select>
                                            {error.billPeriodOption ? <span className="errormsg">{error.billPeriodOption}</span> : ""}
                                        </div>
                                    </div>
                                </>
                            }
                            {
                                selectedBill &&
                                <>
                                    <div className="col-2">
                                        <div className="form-group">
                                            <label htmlFor="billCycle" className="col-form-label">Bill Cycle<span>{readOnly === true ? '' : '*' }</span></label>
                                            <select id="billCycle" className="form-control" value={billSelectionInputs.billCycle} onChange={handleBillSelectionInputChange} readOnly={readOnly}>
                                                <option value="" key="BC">Select Bill Cycle</option>
                                                {
                                                    billCycleLookup.map((e, index) => (
                                                        <option key={index} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            {error.billCycle ? <span className="errormsg">{error.billCycle}</span> : ""}
                                        </div>
                                    </div>
                                    <div className={`col-2 ${readOnly ? 'd-none' : ''}`}>
                                        <div className="form-group">
                                            <label>&nbsp;</label>
                                            <button className="skel-btn-submit" onClick={handleBillingHistorySearch}>Submit</button>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </fieldset>
    )
}

export default BillCycleOrYear;