import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom'

import { properties } from '../../../properties';
import { post } from '../../../common/util/restUtil';
import { NumberFormatBase } from 'react-number-format';
import { validateNumber } from '../../../common/util/util';

const ContractAjustmentForm = (props) => {

    const adjustmentInputs =  props.data.adjustmentInputs
    const setAdjustmentInputs = props.handler.setAdjustmentInputs
    const accountData = props.data.accountData
    const adjustmentInputsErrors =  props.data.adjustmentInputsErrors
    const setAdjustmentInputsErrors = props.handler.setAdjustmentInputsErrors
    const lookupData = useRef(undefined);
    const [adjustmentTypeLookup, setAdjustmentTypeLookup] = useState([]);
    const [reasonlookup, setReasonlookup] = useState([]);

    const handleOnAdjustmentInputsChange = (e) => {
        const { target } = e;
        setAdjustmentInputs({
            ...adjustmentInputs,
            [target.id]: target.id === 'adjAmount' ? target.value : target.value
        })
    }

    useEffect(() => {
        
        post(properties.BUSINESS_ENTITY_API, [
            'ADJUSTMENT_TYPE',
            'BAR_REASON'
        ])
            .then((response) => {
                if (response.data) {
                    lookupData.current = response.data;
                    unstable_batchedUpdates(() => {
                        setAdjustmentTypeLookup(lookupData?.current['ADJUSTMENT_TYPE']);
                        setReasonlookup(lookupData?.current['BAR_REASON']);
                    });
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [])

    return (
        <>
            <div className="p-2">
                <fieldset className="scheduler-border">
                    <div className="row">
                        <div className="col-4">
                            <div className="form-group">
                                <label htmlFor="billRefNo" className="col-form-label">Billable Referance Number<span>*</span></label>
                                <input type="text" className="form-control" id="billRefNo" placeholder="" disabled value={accountData[0]?.billRefNo} />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="adjustmentType" className="col-form-label">Adjustment Type<span>*</span></label>
                                <select id="adjustmentType" className={`form-control ${adjustmentInputsErrors.adjustmentType ? "error-border" : ""}`} value={adjustmentInputs.adjustmentType} 
                                    onChange={(e) => {
                                        handleOnAdjustmentInputsChange(e)
                                        setAdjustmentInputsErrors({...adjustmentInputsErrors,adjustmentType:""})
                                    }} 
                                >
                                    <option value="">Select Adjustment Type</option>
                                    {
                                        adjustmentTypeLookup.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{adjustmentInputsErrors.adjustmentType ? adjustmentInputsErrors.adjustmentType : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="adjustmentImmediate" className="col-form-label">Adjustment Immediate</label>
                                <input type="checkbox" className="control-input" id="adjustmentImmediate" checked={adjustmentInputs.adjustmentImmediate ==="Y" ? true : false}
                                    onChange={(e) => {
                                        if(e.target.checked === true)
                                        {
                                            setAdjustmentInputs({...adjustmentInputs,adjustmentImmediate:'Y'})
                                        }
                                        else if(e.target.checked === false)
                                        {
                                            setAdjustmentInputs({...adjustmentInputs,adjustmentImmediate:'N'})
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="form-group">
                                <label htmlFor="maxAdjAmount" className="col-form-label">Max Adjustment Amount<span>*</span></label>
                                <NumberFormatBase className="form-control" id="maxAdjAmount" disabled value={adjustmentInputs.maxAdjAmount}
                                    onChange={(e) => {
                                        handleOnAdjustmentInputsChange(e)
                                        setAdjustmentInputsErrors({...adjustmentInputsErrors,maxAdjAmount:""})
                                    }} 
                                />
                                <span className="errormsg">{adjustmentInputsErrors.maxAdjAmount ? adjustmentInputsErrors.maxAdjAmount : ""}</span>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="form-group">
                                <label htmlFor="adjAmount" className="col-form-label">Adjustment Amount<span>*</span></label>
                                <NumberFormatBase className="form-control" id="adjAmount" placeholder="Please Enter Ajustment Amount" value={adjustmentInputs.adjAmount}
                                    onKeyPress={(e) => { validateNumber(e) }}
                                    onChange={(e) => {
                                        handleOnAdjustmentInputsChange(e)
                                        setAdjustmentInputsErrors({...adjustmentInputsErrors,adjAmount:""})
                                    }}  
                                />
                                <span className="errormsg">{adjustmentInputsErrors.adjAmount ? adjustmentInputsErrors.adjAmount : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="reason" className="col-form-label">Reason<span>*</span></label>
                                <select id="reason" className={`form-control ${adjustmentInputsErrors.reason ? "error-border" : ""}`} value={adjustmentInputs.reason} 
                                    onChange={(e) => {
                                        handleOnAdjustmentInputsChange(e)
                                        setAdjustmentInputsErrors({...adjustmentInputsErrors,reason:""})
                                    }} 
                                >
                                    <option value="">Select Reason</option>
                                    {
                                        reasonlookup && reasonlookup.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{adjustmentInputsErrors.reason ? adjustmentInputsErrors.reason : ""}</span>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label htmlFor="remarks" className="col-form-label">Remarks</label>
                                <textarea id="remarks" className="form-control" value={adjustmentInputs.remarks} onChange={handleOnAdjustmentInputsChange} />
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        </>
    )
}

export default ContractAjustmentForm