import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { NumberFormatBase } from 'react-number-format';

import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';
import { validateNumber } from '../../common/util/util';

const AdjustmentForm = (props) => {

    const lookupData = useRef(undefined);
    const adjustmentInputs = props.data.adjustmentInputs
    const adjustmentInputsErrors = props.data.adjustmentInputsErrors
    const setAdjustmentInputsErrors = props.handler.setAdjustmentInputsErrors
    const setAdjustmentInputs = props.handler.setAdjustmentInputs
    const [adjustmentTypeLookup, setAdjustmentTypeLookup] = useState([]);
    const [allocationLevelLookup, setAllocationLevelLookup] = useState([]);
    const [reasonlookup, setReasonlookup] = useState([]);

    useEffect(() => {
        
        post(properties.BUSINESS_ENTITY_API, [
            'ADJUSTMENT_TYPE',
            'ALLOCATION_LEVEL',
            'REASON'
        ])
            .then((response) => {
                if (response.data) {
                    lookupData.current = response.data;
                    unstable_batchedUpdates(() => {
                        setAdjustmentTypeLookup(lookupData?.current['ADJUSTMENT_TYPE']);
                        setAllocationLevelLookup(lookupData?.current['ALLOCATION_LEVEL']);
                        setReasonlookup(lookupData?.current['REASON']);
                    });
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [])


    const handleOnAdjustmentInputsChange = (e) => {
        const { target } = e;
        setAdjustmentInputs({
            ...adjustmentInputs,
            [target.id]: target.id === 'adjAmount' ? target.value : target.value
        })
    }

    return (
            <>
                <div className="row">
                    <div className="col-4">
                        <div className="form-group">
                            <label htmlFor="adjustmentCat" className="col-form-label">Adjusment Category</label>
                            <select type="text" className="form-control" id="adjustmentCat" disabled value={adjustmentInputs.adjustmentCat} 
                            >
                                <option value="">Select Adjustment Category</option>
                                <option value="PREBILL">Prebill</option>
                                <option value="POSTBILL">Postbill</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="allocationLevel" className="col-form-label">Allocation Level<span>*</span></label>
                            <select id="allocationLevel" className={`form-control ${adjustmentInputsErrors.allocationLevel ? "error-border" : ""}`} value={adjustmentInputs.allocationLevel} 
                                onChange={(e) => {
                                    handleOnAdjustmentInputsChange(e)
                                    setAdjustmentInputsErrors({...adjustmentInputsErrors,allocationLevel:""})
                                }} 
                            >
                                <option value="">Select Allocation Level</option>
                                {
                                    allocationLevelLookup.map((e) => (
                                        <option key={e.code} value={e.code}>{e.description}</option>
                                    ))
                                }
                                <option value="CONTRACT">Contract</option>
                                <option value="CONTRACTCHARGE">Contract Charge</option>
                            </select>
                            <span className="errormsg">{adjustmentInputsErrors.allocationLevel ? adjustmentInputsErrors.allocationLevel : ""}</span>
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
                            <label htmlFor="reason" className="col-form-label">Reason<span>*</span></label>
                            <select id="reason" className={`form-control ${adjustmentInputsErrors.reason ? "error-border" : ""}`} value={adjustmentInputs.reason} 
                                onChange={(e) => {
                                    handleOnAdjustmentInputsChange(e)
                                    setAdjustmentInputsErrors({...adjustmentInputsErrors,reason:""})
                                }}
                            >
                                <option value="">Select Reason</option>
                                {
                                    reasonlookup.map((e) => (
                                        <option key={e.code} value={e.code}>{e.description}</option>
                                    ))
                                }
                                <option value="reason1">Reason1</option>
                            </select>
                            <span className="errormsg">{adjustmentInputsErrors.reason ? adjustmentInputsErrors.reason : ""}</span>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="form-group">
                            <label htmlFor="maxAdjAmount" className="col-form-label">Max Adjustment Amount</label>
                            <input type="text" className="form-control" id="maxAdjAmount" disabled value={adjustmentInputs.maxAdjAmount} onChange={handleOnAdjustmentInputsChange} />
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="form-group">
                            <label htmlFor="adjAmount" className="col-form-label">Adjustment Amount</label>
                            <NumberFormatBase className="form-control" id="adjAmount" 
                                // onKeyPress={(e) => { validateNumber(e) }} 
                                value={adjustmentInputs.adjAmount} 
                                onChange={(e) => {
                                    handleOnAdjustmentInputsChange(e)
                                    setAdjustmentInputsErrors({...adjustmentInputsErrors,adjAmount:""})
                                }} 
                            />
                            <span className="errormsg">{adjustmentInputsErrors.adjAmount ? adjustmentInputsErrors.adjAmount : ""}</span>
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
        </>
    )
}

export default AdjustmentForm;