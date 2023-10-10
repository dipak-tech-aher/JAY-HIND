import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import { properties } from '../../properties';
import { post, put, get } from '../../common/util/restUtil';
import { string, object } from "yup";
import { validateToDate } from '../../common/util/util';
import { toast } from 'react-toastify';
import moment from 'moment';

const AddEditCharge = (props) => {
    
    const { sourceName, row = {}, userPermission } = props.location.state.data;
    let handler = props.location.state.handler
    const lookupData = useRef();
    const [chargeCategoryLookup, setChargeCategoryLookup] = useState([]);
    const [serviceTypeLookup, setServiceTypeLookup] = useState([]);
    const [currencyLookup, setCurrencyLookup] = useState([]);
    const [statusLookup, setStatusLookup] = useState([]);
    const [addChargeInputErrors, setAddChargeInputErrors] = useState({});
    const [isChargeTerminated,setIsChargeTerminated] = useState(false)
    const initialState = {
        chargeName: "",
        chargeCat: "",
        serviceType: "",
        currency: "",
        //status: "",
        status: "AC",
        statusDes: "New",
        startDate: "",
        endDate: "",
        glcode: ""
    }

    const [chargeInputs, setChargeInputs] = useState(initialState);

    const AddChargeValidationSchema = object().shape({
        chargeName: string().required("Charge Name is required"),
        chargeCat: string().required("Charge Category is required"),
        serviceType: string().required("Service Type is required"),
        currency: string().required("Currency is required"),
        startDate: string().required("Start Date is required"),
        endDate: string().nullable(true).test(
            "Date",
            "End date should not be less than from Start date",
            (endDate) => validateToDate(endDate, chargeInputs.startDate)
        ),
        status: string().required("Status is required"),
        glcode: string().required("GL Code is required"),
    });

    const validate = (schema, data) => {
        try {
            setAddChargeInputErrors({})
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setAddChargeInputErrors((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    useEffect(() => {
        if (sourceName === 'Edit') {
            setChargeInputs(row);
            if(row?.status === 'PD')
            {
                setIsChargeTerminated(true)
            }
        }
        
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=CURRENCY,SERVICE_TYPE,CURRENCY,STATUS,CHARGE_CATEGORY')
            .then((response) => {
                if (response.data) {
                    lookupData.current = response.data;
                    unstable_batchedUpdates(() => {
                        setChargeCategoryLookup(lookupData.current['CHARGE_CATEGORY'])
                        setServiceTypeLookup(lookupData.current['SERVICE_TYPE'])
                        setCurrencyLookup(lookupData.current['CURRENCY'])
                        setStatusLookup(lookupData.current['STATUS'])
                        // setStatusLookup(lookupData.current['STATUS'].filter((status) => {
                        //     if(status.code === 'AC' || status.code === 'HOLD')
                        //     {
                        //         return status
                        //     }
                        // }))
                    });
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally()
    }, [])

    const handleAddChargeInputChange = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {
            setChargeInputs({
                ...chargeInputs,
                [target.id.replace('-', '')]: target.value
            })
            setAddChargeInputErrors({
                ...addChargeInputErrors,
                [target.id.replace('-', '')]: ""
            })
        })
    }

    const handleOnSubmit = () => {
        delete chargeInputs.statusDes
        if (validate(AddChargeValidationSchema, chargeInputs)) {
            return;
        }
        if(chargeInputs?.status === 'AC')
        {
            if(moment(chargeInputs?.startDate).isBefore(moment().add(1,'days').format('YYYY-MM-DD')))
            {
                toast.error('Start Date Should be Tomorrow Date')
                return 
            }
        }
        if(chargeInputs?.endDate !== "" || chargeInputs?.endDate !== null || chargeInputs?.endDate !== undefined)
        {
            if(moment(chargeInputs?.endDate).isBefore(moment().format('YYYY-MM-DD')))
            {
                    toast.error('End Date Cannot be Past Date')
                    return 
            }
        }
        if (sourceName === 'Add') {
            
            post(properties.CHARGE_API, { ...chargeInputs })
                .then((response) => {
                    const { status, message } = response;
                    if (status === 200) {
                        toast.success(message);
                        handleOnClear();
                        handleOnGoBack();
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        }
        else {
            
            put(properties.CHARGE_API + '/' + row.chargeId, { ...chargeInputs })
                .then((response) => {
                    const { status, message } = response;
                    if (status === 200) {
                        toast.success(message);
                        handleOnGoBack();
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        }
    }

    const handleOnGoBack = () => {
        props.history.push(`${process.env.REACT_APP_BASE}/list-charge`, { data: { sourceName: 'Add', userPermission: userPermission }  });
    }

    const handleOnClear = () => {
        unstable_batchedUpdates(() => {
            setAddChargeInputErrors({})
            setChargeInputs(initialState)
        })
    }

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title">Charge - {sourceName}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-1">
                        <div className="col-lg-12 row">
                            <div className="col-lg-12 p-2">
                                <div className="search-result-box m-t-30 card-box">
                                    <div className="autoheight">
                                        <fieldset className="p-2">
                                            <section>
                                                <div className="form-row pb-2">
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="chargeName" className="col-form-label">Charge Name <span>*</span></label>
                                                            <input type="text" disabled={isChargeTerminated} placeholder="Enter Charge Name" className={`form-control ${addChargeInputErrors.chargeName ? "error-border" : ""}`} id="chargeName" value={chargeInputs.chargeName} onChange={handleAddChargeInputChange} />
                                                            <span className="errormsg">{addChargeInputErrors.chargeName ? addChargeInputErrors.chargeName : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="chargeCat" className="col-form-label">Charge category <span>*</span> </label>
                                                            <select id="chargeCat" disabled={(sourceName ==='Edit' || isChargeTerminated)} className={`form-control ${addChargeInputErrors.chargeCat ? "error-border" : ""}`} value={chargeInputs.chargeCat} onChange={handleAddChargeInputChange}>
                                                                <option value="">Select Charge Category</option>
                                                                {
                                                                    chargeCategoryLookup && chargeCategoryLookup.map((e) => (
                                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <span className="errormsg">{addChargeInputErrors.chargeCat ? addChargeInputErrors.chargeCat : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="serviceType" className="col-form-label">Service Type <span>*</span> </label>
                                                            <select id="serviceType" disabled={(sourceName ==='Edit' || isChargeTerminated)} className={`form-control ${addChargeInputErrors.serviceType ? "error-border" : ""}`} value={chargeInputs.serviceType} onChange={handleAddChargeInputChange}>
                                                                <option value="">Select Service Type</option>
                                                                {
                                                                    serviceTypeLookup && serviceTypeLookup.map((e) => (
                                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <span className="errormsg">{addChargeInputErrors.serviceType ? addChargeInputErrors.serviceType : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="currency" className="col-form-label">Currency <span>*</span> </label>
                                                            <select id="currency" disabled={(sourceName ==='Edit' || isChargeTerminated)} className={`form-control ${addChargeInputErrors.currency ? "error-border" : ""}`} value={chargeInputs.currency} onChange={handleAddChargeInputChange}>
                                                                <option value="">Select Currency</option>
                                                                {
                                                                    currencyLookup && currencyLookup.map((e) => (
                                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <span className="errormsg">{addChargeInputErrors.currency ? addChargeInputErrors.currency : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="startDate" className="col-form-label">Start Date <span>*</span> </label>
                                                            <input type="date" id="startDate" disabled={(isChargeTerminated)} min={moment().add(1,'days').format('YYYY-MM-DD')} className={`form-control ${addChargeInputErrors.startDate ? "error-border" : ""}`} placeholder="Start Date" value={chargeInputs.startDate} onChange={handleAddChargeInputChange} />
                                                            <span className="errormsg">{addChargeInputErrors.startDate ? addChargeInputErrors.startDate : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="endDate" className="col-form-label">End Date</label>
                                                            <input type="date" id="endDate" disabled={isChargeTerminated || chargeInputs?.chargeCat === 'CC_NRC'} min={moment().format('YYYY-MM-DD')}  className={`form-control ${addChargeInputErrors.endDate ? "error-border" : ""}`} placeholder="End Date" value={chargeInputs.endDate} onChange={handleAddChargeInputChange} />
                                                            <span className="errormsg">{addChargeInputErrors.endDate ? addChargeInputErrors.endDate : ""}</span>
                                                        </div>
                                                    </div>
                                                    {
                                                        // (chargeInputs?.status === 'NEW' || chargeInputs?.status === 'PD') ?
                                                        // <div className="col-md-4">
                                                        //     <div className="form-group">
                                                        //         <label htmlFor="status-" className="col-form-label">Status <span>*</span></label>
                                                        //         <input type="text" id="status-" disabled={true} className={`form-control ${addChargeInputErrors.status ? "error-border" : ""}`} value={chargeInputs?.statusDes} onChange={handleAddChargeInputChange}/> 
                                                        //         <span className="errormsg">{addChargeInputErrors.status ? addChargeInputErrors.status : ""}</span>
                                                        //     </div>
                                                        // </div>
                                                        // :
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="status-" className="col-form-label">Status <span>*</span></label>
                                                                <select id="status-" className={`form-control ${addChargeInputErrors.status ? "error-border" : ""}`} value={chargeInputs.status} onChange={handleAddChargeInputChange}>
                                                                    <option value="">Select Status</option>
                                                                    {
                                                                        statusLookup && statusLookup.map((e) => (
                                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                                <span className="errormsg">{addChargeInputErrors.status ? addChargeInputErrors.status : ""}</span>
                                                            </div>
                                                        </div>
                                                    }
                                                    
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="glcode" className="col-form-label">GL Code <span className="text-danger"> *</span> </label>
                                                            <input type="text" disabled={(sourceName ==='Edit' || isChargeTerminated)} placeholder="Enter GL Code" className={`form-control ${addChargeInputErrors.glcode ? "error-border" : ""}`} id="glcode" value={chargeInputs.glcode} onChange={handleAddChargeInputChange} />
                                                            <span className="errormsg">{addChargeInputErrors.glcode ? addChargeInputErrors.glcode : ""}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </fieldset>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="pt-1 pb-1">
                                                    <div className="text-center">
                                                        <button type="button" className="btn waves-effect waves-light btn-primary m-1" onClick={handleOnGoBack}>
                                                            Back to Charge List
                                                        </button>
                                                        <button type="button" disabled={isChargeTerminated} className="btn waves-effect waves-light btn-primary mr-1" onClick={handleOnSubmit}>
                                                            {
                                                                sourceName === 'Add' ? 'Submit' : 'Update'
                                                            }
                                                        </button>
                                                        <button type="button" disabled={isChargeTerminated} className={`btn waves-effect waves-light btn-secondary`} onClick={handleOnClear}>Clear</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddEditCharge;