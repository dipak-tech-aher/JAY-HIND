import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'
import { formatDateForBirthDate } from "../common/util/dateUtil";
import { string, object } from "yup";
import { properties } from "../properties";
import { toast } from 'react-toastify';
import { get } from '../common/util/restUtil';

import Switch from 'react-switch'
import { NumberFormatBase } from 'react-number-format';
import { RegularModalCustomStyles } from '../common/util/util';
import moment from 'moment'
const AddEditChargeModal = (props) => {

    const chargeData = props.data.chargeData;
    console.log(chargeData)
    const isNRC = chargeData.chargeType === 'CC_NRC' ? true : chargeData.chargeType === 'CC_USGC' ? true : false;

    const chargeValidationSchema = object().shape({
        chargeName: string().required("Charge Name is required"),
        chargeType: string().required("Charge Type is required"),
        currency: string().required("Currency is required"),
        chargeAmount: string().required("Charge Amount is required"),
        startDate: string().required("Start Date is required"),
        frequency: isNRC ? string().nullable(true) : string().required("Frequency is required"),
        prorated: isNRC ? string().nullable(true) : string().required("Proration is required"),
        billingEffective: string().required("Billing Effective Start Cycle is required"),
        advanceCharge: isNRC ? string().nullable(true) : string().required('Advance Charge is required'),
        chargeUpfront: isNRC ? string().required('Advance Charge is required') : string().nullable(true),
        endDate: string().nullable(true).test(
            "Date",
            "End date should not be less than from Start date",
            (endDate) => validateToDate(endDate)
        )
    });

    const validateToDate = (value) => {
        try {
            if (Date.parse(value) < Date.parse(chargeData.startDate))
                return false;
            return true
        } catch (e) {
            return false
        }
    }

    const oldChargeName = props.data.oldChargeName
    const validate = props.handler.validate

    const chargeList = props.data.chargeList
    const isOpen = props.data.isOpen
    const setIsOpen = props.handler.setIsOpen
    const setChargeData = props.handler.setChargeData
    const setChargeList = props.handler.setChargeList
    const error = props.data.error
    const setError = props.handler.setError
    const mode = props.data.mode
    const location = props.data.location
    const module = props.data.module

    const [frequencyLookup, setFrequencyLookup] = useState([])
    const [disableFields, setDisableFields] = useState({
        editMode: false,
        advanceCharge: true,
        chargeUpfront: true
    })

    const handleSubmit = () => {
        let error = validate('CHARGE', chargeValidationSchema, chargeData);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        /*if (location === 'edit') {
            if (chargeData.changesApplied === '') {
                toast.error("Please confirm whether Changes to be Applied on Existing Customers")
                return false;
            }
        }*/
        if (mode === 'create') {
            setChargeList([...chargeList, chargeData])
            toast.success("Charge Details Added Succesfully")
        }

        if (mode === 'edit') {
            console.log('inside edit ', chargeData)
            setChargeList((prevState) => {
                let stateValue = prevState
                console.log('chargeList statevalue==================================',stateValue)
                console.log('chargeList oldChargeName==================================',oldChargeName)
                stateValue[Number(oldChargeName)] = chargeData;
                return stateValue;
            })
            toast.success("Charge Details Updated Succesfully")
        }
        setIsOpen(false)
    }

    useEffect(() => {
        setError({})
        
        if (chargeData.chargeType === 'CC_RC') {
            setDisableFields({
                ...disableFields,
                advanceCharge: false
            })
        }
        if (chargeData.chargeType === 'CC_NRC') {
            setDisableFields({
                ...disableFields,
                chargeUpfront: false,
                frequency: true,
                prorated: true
            })
        }
        if (chargeData.chargeType === 'CC_USGC') {
            setDisableFields({
                ...disableFields,
                chargeUpfront: false,
                frequency: true,
                prorated: true
            })
        }
        // if (module === 'Service') {
        //     if (chargeData.serviceChargeId !== '') {
        //         setDisableFields({
        //             ...disableFields,
        //             editMode: true
        //         })
        //     }
        // }
        // else if (module === 'Plan') {
        //     if (chargeData.planChargeId !== '') {
        //         setDisableFields({
        //             ...disableFields,
        //             editMode: true
        //         })
        //     }
        // }
        // else if (module === 'Addon') {
        //     if (chargeData.addonChargeId !== '') {
        //         setDisableFields({
        //             ...disableFields,
        //             editMode: true
        //         })
        //     }
        // }
        // else if (module === 'Asset') {
        //     if (chargeData.assetChargeId !== '') {
        //         setDisableFields({
        //             ...disableFields,
        //             editMode: true
        //         })
        //     }
        // }

        get(properties.MASTER_API+ '/lookup?searchParam=code_type&valueParam=CHARGE_FREQUENCY')
            .then((response) => {
                if (response.data) {
                    setFrequencyLookup(response.data.CHARGE_FREQUENCY)
                }
            }).catch(error => console.log(error))
            .finally()
    }, [])

    return (
        <>
            <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
                <div className="modal-dialog reslove-state" style={{ marginTop: "0px" }}>
                    <div className="modal-content">
                        <div className="">
                            <div className="form-row col-md-12 bg-light border">
                                <div className="col-md-10 pl-2">
                                    <h5 className="text-primary">Charge Details</h5>
                                </div>
                                <div className="col-md-2 pl-2">
                                <button type="button" className="close" onClick={() => setIsOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-body">
                            <div className="form-row col-12">
                                <div className="col-4">
                                    <label htmlFor="chargeName">Charge Name<span className="required">*</span></label>
                                    <input disabled={true} id="chargeName" value={chargeData.chargeName} className="form-control" type="text"
                                        onChange={(e) => {
                                            setError({ ...error, chargeName: '' })
                                            setChargeData({ ...chargeData, chargeName: e.target.value })
                                        }}
                                    />
                                    <span className="errormsg">{error.chargeName ? error.chargeName : ""}</span>
                                </div>
                                <div className="col-4">
                                    <label htmlFor="chargeType">Charge Type</label>
                                    <input disabled={true} id="chargeType" value={chargeData.chargeTypeDesc} className="form-control" type="text"
                                        onChange={(e) => {
                                            setError({ ...error, chargeName: '' })
                                        }}
                                    />
                                    <span className="errormsg">{error.chargeType ? error.chargeType : ""}</span>
                                </div>
                                <div className="col-4">
                                    <label htmlFor="currency">Currency</label>
                                    <input disabled={true} id="currency" value={chargeData.currencyDesc} className="form-control" type="text"
                                        onChange={(e) => {
                                            setError({ ...error, currency: '' })
                                        }}
                                    />
                                    <span className="errormsg">{error.currency ? error.currency : ""}</span>
                                </div>
                            </div>
                            <div className="form-row col-12 mt-3">
                                <div className="col-4">
                                    <label htmlFor="chargeAmount">Charge Amount<span className="required">*</span></label>
                                    <input type="number" id="chargeAmount" placeholder="Charge Amount" disabled={disableFields.editMode} value={Number(chargeData.chargeAmount)} 
                                        className={`form-control ${error.chargeAmount ? "error-border" : ""}`} 
                                        min = "0"
                                        onChange={(e) => {
                                            setError({ ...error, chargeAmount: '' })
                                            setChargeData({ ...chargeData, chargeAmount: e.target.value })
                                        }}
                                        step=".01"
                                    />
                                    <span className="errormsg">{error.chargeAmount ? error.chargeAmount : ""}</span>
                                </div>
                                <div className="col-4">
                                    <label htmlFor="frequency">Frequency<span className={`required ${isNRC ? "d-none" : ""}`}>*</span></label>
                                    <select id="frequency" disabled={disableFields.frequency || disableFields.editMode} value={chargeData.frequency} className={`form-control ${error.frequency ? "error-border" : ""}`}
                                        onChange={(e) => {
                                            setError({ ...error, frequency: '' })
                                            setChargeData({ ...chargeData, frequency: e.target.value, frequencyDesc: { description: e.target.options[e.target.selectedIndex].label } })
                                        }}
                                    >
                                        <option value="">Select Frequency</option>
                                        {
                                            frequencyLookup && frequencyLookup.map((frequency) => (
                                                <option value={frequency.code}>{frequency.description}</option>
                                            ))
                                        }
                                    </select>
                                    <span className="errormsg">{error.frequency ? error.frequency : ""}</span>
                                </div>
                                <div className="col-4">
                                    <label htmlFor="prorated">Prorated<span className={`required ${isNRC ? "d-none" : ""}`}>*</span></label>
                                    <select id="prorated" disabled={disableFields.prorated || disableFields.editMode} value={chargeData.prorated} className={`form-control ${error.prorated ? "error-border" : ""}`}
                                        onChange={(e) => {
                                            setError({ ...error, prorated: '' })
                                            setChargeData({ ...chargeData, prorated: e.target.value })
                                        }}
                                    >
                                        <option value="">Select Prorate</option>
                                        <option value='Y'>Yes</option>
                                        <option value='N'>No</option>
                                    </select>
                                    <span className="errormsg">{error.prorated ? error.prorated : ""}</span>
                                </div>
                            </div>
                            <div className="form-row col-12 mt-3">
                                <div className="col-4">
                                    <label htmlFor="billingEffective">Billing Effective Start Cycle<span className="required">*</span></label>
                                    <NumberFormatBase id="billingEffective" placeholder="Billing Effective" allownegative={false} disabled={disableFields.editMode} value={chargeData.billingEffective} className={`form-control ${error.billingEffective ? "error-border" : ""}`} type="text"
                                        onChange={(e) => {
                                            setError({ ...error, billingEffective: '' })
                                            setChargeData({ ...chargeData, billingEffective: e.target.value })
                                        }}
                                    />
                                    <span className="errormsg">{error.billingEffective ? error.billingEffective : ""}</span>
                                </div>
                                <div className="col-4">
                                    <label htmlFor="advanceCharge">Advance Charge<span className={`required ${isNRC ? "d-none" : ""}`}>*</span></label>
                                    <select id="advanceCharge" disabled={disableFields.advanceCharge || disableFields.editMode} value={chargeData.advanceCharge} className={`form-control ${error.advanceCharge ? "error-border" : ""}`}
                                        onChange={(e) => {
                                            setChargeData({ ...chargeData, advanceCharge: e.target.value })
                                            setError({ ...error, advanceCharge: '' })
                                        }}
                                    >
                                        <option value="">Select Option</option>
                                        <option value="Y">Yes</option>
                                        <option value="N">No</option>
                                    </select>
                                    <span className="errormsg">{error.advanceCharge ? error.advanceCharge : ""}</span>
                                </div>
                                <div className="col-4">
                                    <label htmlFor="chargeUpfront">Charge Upfront<span className={`required ${!isNRC ? "d-none" : ""}`}>*</span></label>
                                    <select id="chargeUpfront" disabled={disableFields.chargeUpfront || disableFields.editMode} value={chargeData.chargeUpfront} className={`form-control ${error.chargeUpfront ? "error-border" : ""}`}
                                        onChange={(e) => {
                                            setChargeData({ ...chargeData, chargeUpfront: e.target.value })
                                            setError({ ...error, chargeUpfront: '' })
                                        }}
                                    >
                                        <option value="">Select Option</option>
                                        <option value="Y">Yes</option>
                                        <option value="N">No</option>
                                    </select>
                                    <span className="errormsg">{error.chargeUpfront ? error.chargeUpfront : ""}</span>
                                </div>
                                <div className="col-4 mt-3">
                                    <label htmlFor="startDate">Start Date<span className="required">*</span></label>
                                    <input id="startDate" value={chargeData.startDate} disabled={disableFields.editMode} className={`form-control ${error.startDate ? "error-border" : ""}`} type="date"
                                        min={moment().add(1, 'days').format('YYYY-MM-DD')}
                                        onChange={(e) => {
                                            setError({ ...error, startDate: '' })
                                            setChargeData({ ...chargeData, startDate: e.target.value })
                                            // setChargeData({ ...chargeData, 
                                            //     startDate: e.target.value,
                                            //     endDate: chargeData.chargeType === 'CC_NRC' ? e.target.value : ""
                                            // })
                                        }}
                                    />
                                    <span className="errormsg">{error.startDate ? error.startDate : ""}</span>
                                </div>
                                <div className="col-4 mt-3">
                                    <label htmlFor="endDate">End Date</label>
                                    <input id="endDate" value={chargeData.endDate} className="form-control" type="date" min={formatDateForBirthDate(new Date())}
                                        disabled={chargeData.chargeType === 'CC_NRC'}
                                        onChange={(e) => {
                                            setChargeData({ ...chargeData, endDate: e.target.value })
                                            setError({ ...error, endDate: '' })
                                        }}
                                    />
                                    <span className="errormsg">{error.endDate ? error.endDate : ""}</span>
                                </div>
                            </div>
                            <div className="form-row col-12 mt-3">
                                {
                                    location === 'edit' &&
                                    <div className="col-4">
                                        <label htmlFor="changesApplied">Changes Applied on Existing Customers </label>
                                        <Switch onChange={(e) => {
                                            if (e === true) {
                                                setChargeData({ ...chargeData, changesApplied: 'Y' })
                                            }
                                            else {
                                                setChargeData({ ...chargeData, changesApplied: 'N' })
                                            }

                                        }}
                                            checked={chargeData.changesApplied === 'Y' ? true : false}
                                        />
                                    </div>
                                }

                            </div>
                        </div>
                        <div className="modal-footer d-flex mt-2 justify-content-center">
                            <button className="btn btn-primary mr-2" onClick={handleSubmit}>Submit</button>
                            <button className="btn btn-secondary" onClick={() => { setIsOpen(false) }} type="button">Close</button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default AddEditChargeModal