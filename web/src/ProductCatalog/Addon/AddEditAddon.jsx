import React, { useEffect, useState, useRef } from 'react';
import { string, object } from "yup";
import { validateToDate } from '../../common/util/util';
import { unstable_batchedUpdates } from 'react-dom';
import { NumberFormatBase } from 'react-number-format';
import moment from 'moment';
import { get, post, put } from '../../common/util/restUtil';
import { properties } from '../../properties';

import AddProperty from '../addProperty';
import { toast } from 'react-toastify';
import ChargeListView from '../SearchProduct';
import AddEditChargeModal from '../addEditChargeModal';

const AddEditAddon = (props) => {

    const { addonData, location } = props.data;
    const { setIsActive } = props.handler;
    const isEditView = location === 'edit' ? true : false;

    const addinitialState = {
        addonName: "",
        serviceType: "",
        startDate: "",
        endDate: "",
        status: "NEW",
        statusDes: "New",
        volumeAllowed: "",
        multipleSelection: ""
    }

    const lookupData = useRef();
    const [addonInputs, setAddonInputs] = useState(isEditView ? {} : addinitialState);
    const [serviceTypeLookup, setServiceTypeLookup] = useState([]);
    const [statusLookup, setStatusLookup] = useState([]);
    const [volumeAllowedLookup, setVolumeAllowedLookup] = useState([]);
    const [multipleSelectionLookup, setMultipleSelectionLookup] = useState([]);
    const [addonInputErrors, setAddonInputErrors] = useState({});

    const [addonProperty, setAddonProperty] = useState([])
    const [addonPropertyObject, setAddonPropertyObject] = useState({
        property: "",
        description: ""
    })

    const [showChargeDropdown, setShowChargeDropdown] = useState(false);
    const [chargeName, setChargeName] = useState('');
    const [chargeNameLookup, setChargeNameLookup] = useState([]);
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
    const [chargeList, setChargeList] = useState([]);
    const [mode, setMode] = useState('create');
    const [oldChargeName, setOldChargeName] = useState();
    const [chargeError, setChargeError] = useState({})
    const [isAddonTerminated, setIsAddonTerminated] = useState(false)
    const [chargeData, setChargeData] = useState({
        chargeId: 0,
        chargeName: '',
        chargeType: '',
        chargeTypeDesc: '',
        currencyDesc: '',
        currency: '',
        chargeAmount: '',
        frequency: '',
        billingEffective: 1,
        advanceCharge: '',
        chargeUpfront: '',
        startDate: '',
        endDate: '',
        changesApplied: ''
    })

    const ValidationSchema = object().shape({
        addonName: string().required("Addon Name is required"),
        serviceType: string().required("Service Type is required"),
        startDate: string().required("Start Date is required"),
        endDate: string().nullable(true).test(
            "Date",
            "End date should not be less than from Start date",
            (endDate) => validateToDate(endDate, addonInputs.startDate)
        ),
        status: string().required("Status is required")
    });

    const validate = (section, schema, data) => {
        try {
            if (section === 'DETAILS') {
                setAddonInputErrors({});
            }
            if (section === 'CHARGE') {
                setChargeError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'DETAILS') {
                    setAddonInputErrors((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
                if (section === 'CHARGE') {
                    setChargeError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    useEffect(() => {
        getLookupData();
    }, [])

    const getLookupData = async () => {
        
        post(properties.BUSINESS_ENTITY_API, [
            'PROD_TYPE',
            'CONNECTION_STATUS',
            'YES_NO'
        ])
            .then((response) => {
                if (response.data) {
                    lookupData.current = response.data;
                    unstable_batchedUpdates(() => {
                        setServiceTypeLookup(lookupData.current['PROD_TYPE']);
                        //setStatusLookup(lookupData.current['CONNECTION_STATUS']);
                        setStatusLookup(lookupData.current['CONNECTION_STATUS'].filter((status) => {
                            if (status.code === 'ACTIVE' || status.code === 'HOLD') {
                                return status
                            }
                        }))
                        setVolumeAllowedLookup(lookupData.current['YES_NO']);
                        setMultipleSelectionLookup(lookupData.current['YES_NO']);
                    });
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                
                if (isEditView) {
                    getChargeNameListOREditData(addonData.serviceType);
                }
            })

    }

    const getChargeNameListOREditData = (serviceType = "") => {
        
        get(properties.CHARGE_API + "/search/all")
            .then((chargeResponse) => {
                let validChargeList = chargeResponse.data.filter((charge) => (charge.status !== 'INACTIVE' && charge.serviceType === serviceType));
                setChargeNameLookup(validChargeList);
                if (isEditView) {
                    get(`${properties.ADDON_API}/${addonData.addonId}`)
                        .then((addonResponse) => {
                            if (addonResponse.data) {
                                addonResponse.data.addonCharges.forEach((charge) => {
                                    validChargeList.forEach((chargeNode) => {
                                        if (Number(charge.chargeId) === Number(chargeNode.chargeId)) {
                                            charge["chargeName"] = chargeNode?.chargeName;
                                            charge["chargeType"] = chargeNode?.chargeCat;
                                            charge["chargeTypeDesc"] = chargeNode?.chargeCatDesc?.description;
                                            charge["currency"] = chargeNode?.currency;
                                            charge["currencyDesc"] = chargeNode?.currencyDesc?.description;
                                            charge["changesApplied"] = charge?.changesApplied !== '' ? charge?.changesApplied : 'N';
                                            charge["prorated"] = charge?.prorated !== '' ? charge?.prorated : 'N';
                                        }
                                    })
                                })
                                unstable_batchedUpdates(() => {
                                    if (addonResponse.data?.status === 'PD') {
                                        setIsAddonTerminated(true)
                                    }
                                    setAddonInputs(addonResponse.data);
                                    setAddonProperty(addonResponse.data?.property);
                                    setChargeList(addonResponse.data?.addonCharges);
                                })
                            }
                        }).catch(error => console.log(error))
                }
            }).catch(error => console.log(error))
            .finally()
    }

    const handleOnInputsChange = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {
            setAddonInputs({
                ...addonInputs,
                [`${target.id.replace('-', '')}`]: target.value
            })
            setAddonInputErrors({
                ...addonInputErrors,
                [target.id.replace('-', '')]: ""
            })
        })
        if (target.id === 'serviceType' && !isEditView) {
            getChargeNameListOREditData(target.value);
        }
    }

    const handleOnAddList = (e) => {
        setIsActive('list');
    }

    const handleOnSubmit = (e) => {
        if (validate('DETAILS', ValidationSchema, addonInputs)) {
            toast.error("Validation errors found. Please check highlighted fields");
            return;
        }
        if (chargeList.length === 0) {
            toast.error("Alteast One charge is required");
            return false;
        }
        if (addonInputs?.status === 'NEW') {
            if (moment(addonInputs?.startDate).isBefore(moment().add(1, 'days').format('YYYY-MM-DD'))) {
                toast.error('Start Date Should be Tomorrow Date')
                return
            }
        }
        if (addonInputs?.endDate !== "" || addonInputs?.endDate !== null || addonInputs?.endDate !== undefined) {
            if (moment(addonInputs?.endDate).isBefore(moment().format('YYYY-MM-DD'))) {
                toast.error('End Date Cannot be Past Date')
                return
            }
        }
        const requestBody = {
            ...addonInputs,
            addonProperty,
            charge: chargeList
        }
        if (isEditView) {
            
            put(`${properties.ADDON_API}/${addonInputs.addonId}`, { ...requestBody })
                .then((response) => {
                    if (response.status === 200) {
                        toast.success(response.message);
                        setIsActive('list');
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        }
        else {
            
            post(properties.ADDON_API, { ...requestBody })
                .then((response) => {
                    if (response.data) {
                        toast.success(response.message);
                        setIsActive('list');
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        }
    }

    const handleOnClear = () => {
        unstable_batchedUpdates(() => {
            setAddonInputErrors({})
            setAddonInputs(addinitialState);
            setAddonProperty([]);
            setChargeList([])
            setChargeName("");
            setAddonPropertyObject({
                property: "",
                description: ""
            })
        })
    }

    const handleChargeNameSearch = (e) => {
        if (chargeList.length > 0) {
            for (let charge in chargeList) {
                if (Number(chargeList[charge].chargeId) === Number(chargeName)) {
                    toast.error("Charge Name Already Added")
                    setChargeName('')
                    return
                }
            }
        }
        if (chargeName === '') {
            toast.error("Please Select Charge Name")
            return
        }
        let charge = chargeNameLookup.filter((charge) => Number(charge.chargeId) === Number(chargeName))
        unstable_batchedUpdates(() => {
            setChargeData({
                chargeId: charge[0]?.chargeId,
                addonChargeId: '',
                chargeName: charge[0]?.chargeName,
                chargeType: charge[0]?.chargeCat,
                chargeTypeDesc: charge[0]?.chargeCatDesc?.description,
                currencyDesc: charge[0]?.currencyDesc?.description,
                currency: charge[0]?.currency,
                chargeAmount: '',
                frequency: '',
                billingEffective: 1,
                advanceCharge: '',
                chargeUpfront: '',
                startDate: '',
                endDate: '',
                changesApplied: ''
            })
            setMode('create')
            setIsChargeModalOpen(true)
            setChargeName('')
            setShowChargeDropdown(false)
        })
    }

    const handleOnAddCharge = (e) => {
        if (addonInputs.serviceType === '') {
            toast.error("Please select Service Type")
            return false
        }
        setShowChargeDropdown(true)
    }

    return (
        <>
            <div className="col-12 pr-0">
                <section className="triangle"><h4 id="list-item-1" className="pl-2">{isEditView ? 'Edit' : 'Create'} Add-on</h4></section>
            </div>
            <div className="autoheight p-2">
                <section>
                    <div className="form-row pb-2">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="addonName" className="col-form-label">Addon Name<span>*</span></label>
                                <input type="text" disabled={isAddonTerminated} className={`form-control ${addonInputErrors.addonName ? "error-border" : ""}`} id="addonName" placeholder="Enter Addon Name" value={addonInputs.addonName} onChange={handleOnInputsChange} />
                                <span className="errormsg">{addonInputErrors.addonName ? addonInputErrors.addonName : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="serviceType" className="col-form-label">Service Type <span> *</span> </label>
                                <select disabled={isEditView} id="serviceType" className={`form-control ${addonInputErrors.serviceType ? "error-border" : ""}`} value={addonInputs.serviceType} onChange={handleOnInputsChange} >
                                    <option value="">Select Service Type</option>
                                    {
                                        serviceTypeLookup && serviceTypeLookup.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addonInputErrors.serviceType ? addonInputErrors.serviceType : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="startDate" className="col-form-label">Start Date <span> *</span> </label>
                                <input disabled={(addonInputs?.status !== 'NEW' || isAddonTerminated)} type="date" id="startDate"
                                    min={moment().add(1, 'days').format('YYYY-MM-DD')}
                                    className={`form-control ${addonInputErrors.startDate ? "error-border" : ""}`} placeholder="Start Date" value={addonInputs.startDate} onChange={handleOnInputsChange} />
                                <span className="errormsg">{addonInputErrors.startDate ? addonInputErrors.startDate : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="endDate" className="col-form-label">End Date</label>
                                <input type="date" disabled={isAddonTerminated} min={moment().format('YYYY-MM-DD')} id="endDate" className={`form-control ${addonInputErrors.endDate ? "error-border" : ""}`} placeholder="End Date" value={addonInputs.endDate} onChange={handleOnInputsChange} />
                                <span className="errormsg">{addonInputErrors.endDate ? addonInputErrors.endDate : ""}</span>
                            </div>
                        </div>
                        {
                            (addonInputs?.status === 'NEW' || addonInputs?.status === 'PD') ?
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="status-" className="col-form-label">Status <span> *</span> </label>
                                        <input type="text" disabled={true} className={`form-control ${addonInputErrors.status ? "error-border" : ""}`} id="status-" value={addonInputs?.statusDes} onChange={handleOnInputsChange} />
                                        <span className="errormsg">{addonInputErrors.status ? addonInputErrors.status : ""}</span>
                                    </div>
                                </div>
                                :
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="status-" className="col-form-label">Status <span> *</span> </label>
                                        <select className={`form-control ${addonInputErrors.status ? "error-border" : ""}`} id="status-" value={addonInputs.status} onChange={handleOnInputsChange}>
                                            <option value="">Select Status</option>
                                            {
                                                statusLookup && statusLookup.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))
                                            }
                                        </select>
                                        <span className="errormsg">{addonInputErrors.status ? addonInputErrors.status : ""}</span>
                                    </div>
                                </div>
                        }
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="volumeAllowed" className="col-form-label">Volume Allowed </label>
                                <select className="form-control" disabled={isAddonTerminated} id="volumeAllowed" value={addonInputs.volumeAllowed} onChange={handleOnInputsChange}>
                                    <option value="">Select Volume Allowed</option>
                                    {
                                        volumeAllowedLookup && volumeAllowedLookup.map((e) => (
                                            <option disabled={e.code === 'YES' && addonInputs.multipleSelection === 'YES' ? true : false} key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="multipleSelection" className="col-form-label">Multiple Selection</label>
                                <select className="form-control" disabled={isAddonTerminated} id="multipleSelection" value={addonInputs.multipleSelection} onChange={handleOnInputsChange}>
                                    <option value="">Select Multiple Selection</option>
                                    {
                                        multipleSelectionLookup && multipleSelectionLookup.map((e) => (
                                            <option disabled={e.code === 'YES' && addonInputs.volumeAllowed === 'YES' ? true : false} key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <AddProperty
                            data={{
                                propertyList: addonProperty,
                                propertyObject: addonPropertyObject,
                                module: 'Addon',
                                isTerminated: isAddonTerminated
                            }}
                            handler={{
                                setPropertyList: setAddonProperty,
                                setPropertyObject: setAddonPropertyObject
                            }}
                        />
                    </div>
                </section>
            </div>
            <div className="col-12 p-0">
                <section className="triangle">
                    <div className="row col-12">
                        <div className="col-10">
                            <h5 id="list-item-1" className="pl-1">Addon Charge Details</h5>
                        </div>
                        <div className="col-2">
                            <span className="float-right">
                                <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" onClick={handleOnAddCharge}
                                    disabled={isAddonTerminated}
                                >
                                    <span className="btn-label">
                                        <i className="fa fa-plus"></i>
                                    </span>
                                    Add Charges
                                </button>
                            </span>
                        </div>
                    </div>
                    {
                        showChargeDropdown &&
                        <div className="col-12 pt-2 pl-0 pb-2 row ml-1">
                            <div className="col-md-4 pl-0">
                                <div className="form-group">
                                    <label htmlFor="chargeName" className="col-form-label">Search Charge Name</label>
                                    <div className="input-group">
                                        <select className="form-control" value={chargeName}
                                            onChange={(e) => {
                                                setChargeName(e.target.value);
                                            }}
                                        >
                                            <option value="">Select Addon Charge Name</option>
                                            {
                                                chargeNameLookup && chargeNameLookup.map((charge) => (
                                                    <option value={charge.chargeId}>{charge.chargeName}</option>
                                                ))
                                            }
                                        </select>
                                        <div className="col-md-3 pl-0 mt-1">
                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2"
                                                disabled={isAddonTerminated}
                                                onClick={handleChargeNameSearch}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    <ChargeListView
                        data={{
                            chargeList: chargeList,
                            chargeData: chargeData,
                            isTerminated: isAddonTerminated
                        }}
                        handler={{
                            setChargeData: setChargeData,
                            setIsOpen: setIsChargeModalOpen,
                            setMode: setMode,
                            setOldChargeName: setOldChargeName
                        }}
                    />
                    {
                        isChargeModalOpen &&
                        <AddEditChargeModal
                            data={{
                                chargeList: chargeList,
                                isOpen: isChargeModalOpen,
                                chargeData: chargeData,
                                error: chargeError,
                                mode: mode,
                                oldChargeName: oldChargeName,
                                location: location,
                                module: 'Addon'
                            }}
                            handler={{
                                setIsOpen: setIsChargeModalOpen,
                                setChargeData: setChargeData,
                                setError: setChargeError,
                                setChargeList: setChargeList,
                                validate: validate
                            }}
                        />
                    }
                </section>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="pt-1 pb-1">
                        <div className="text-center">
                            <button type="button" className="btn waves-effect waves-light btn-primary m-1" disabled={isAddonTerminated} onClick={handleOnSubmit}>
                                {isEditView ? 'Update' : 'Submit'}
                            </button>
                            <button type="button" className={`btn waves-effect waves-light btn-secondary m-1 ${isEditView ? 'd-none' : ''}`} onClick={handleOnClear}>
                                Clear
                            </button>
                            <button type="button" className="btn waves-effect waves-light btn-primary m-1" onClick={handleOnAddList}>
                                Back to Addon List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddEditAddon;