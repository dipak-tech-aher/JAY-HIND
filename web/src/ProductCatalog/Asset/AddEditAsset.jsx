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

const AddEditAsset = (props) => {

    const { assetData, location } = props.data;
    const { setIsActive } = props.handler;
    const isEditView = location === 'edit' ? true : false;

    const addAssestinitialState = {
        assetName: "",
        serviceType: "",
        startDate: "",
        endDate: "",
        status: "NEW",
        statusDes: "New",
        volumeAllowed: "",
        multipleSelection: "",
        assetType: "",
        assetStatus: "",
        assetSegment: "",
        assetManufacturer: "",
        assetWarrantyPeriod: ""
    }

    const lookupData = useRef();
    const [assetInputs, setAssetInputs] = useState(isEditView ? {} : addAssestinitialState);
    const [serviceTypeLookup, setServiceTypeLookup] = useState([]);
    const [statusLookup, setStatusLookup] = useState([]);
    const [volumeAllowedLookup, setVolumeAllowedLookup] = useState([]);
    const [multipleSelectionLookup, setMultipleSelectionLookup] = useState([]);
    const [assetStatusLookup, setAssetStatusLookup] = useState([]);
    const [assetSegmentLookup, setAssetSegmentLookup] = useState([]);
    const [assetManufacturerLookup, setAssetManufacturerLookup] = useState([]);
    const [assetInputsErrors, setAssetInputsErros] = useState({});

    const [assetProperty, setAssetProperty] = useState([])
    const [assetPropertyObject, setAssetPropertyObject] = useState({
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
    const [isAssetTerminated, setIsAssetTerminated] = useState(false)
    const [chargeData, setChargeData] = useState({
        chargeId: 0,
        chargeName: '',
        chargeType: '',
        chargeTypeDesc: '',
        currencyDesc: '',
        currency: '',
        chargeAmount: '',
        frequency: '',
        frequencyDesc: '',
        billingEffective: 1,
        advanceCharge: '',
        chargeUpfront: '',
        startDate: '',
        endDate: '',
        changesApplied: ''
    })

    const AssetValidationSchema = object().shape({
        assetName: string().required("Asset Name is required"),
        serviceType: string().required("Service Type is required"),
        startDate: string().required("Start Date is required"),
        endDate: string().nullable(true).test(
            "Date",
            "End date should not be less than from date",
            (endDate) => validateToDate(endDate, assetInputs.startDate)
        ),
        status: string().required("Status is required")
    });

    const validate = (section, schema, data) => {
        try {
            if (section === 'DETAILS') {
                setAssetInputsErros({});
            }
            if (section === 'CHARGE') {
                setChargeError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'DETAILS') {
                    setAssetInputsErros((prevState) => {
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
            'YES_NO',
            'ASSET_MANUFACTURER',
            'ASSET_SEGMENT',
            'ASSET_STATUS'
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
                        setAssetStatusLookup(lookupData.current['ASSET_STATUS']);
                        setAssetSegmentLookup(lookupData.current['ASSET_SEGMENT']);
                        setAssetManufacturerLookup(lookupData.current['ASSET_MANUFACTURER']);
                    });
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                
                if (isEditView) {
                    getChargeNameListOREditData(assetData.serviceType);
                }
            })
    }

    const getChargeNameListOREditData = (serviceType = "") => {
        
        get(properties.CHARGE_API + "/search/all")
            .then((chargeResponse) => {
                let validChargeList = chargeResponse.data.filter((charge) => (charge.status !== 'INACTIVE' && charge.serviceType === serviceType));
                setChargeNameLookup(validChargeList);
                if (isEditView) {
                    get(`${properties.ASSET_API}/${assetData.assetId}`)
                        .then((assetResponse) => {
                            if (assetResponse.data) {
                                assetResponse.data.assetCharges.forEach((charge) => {
                                    validChargeList.forEach((chargeNode) => {
                                        if (Number(charge.chargeId) === Number(chargeNode.chargeId)) {
                                            charge["chargeName"] = chargeNode?.chargeName;
                                            charge["chargeType"] = chargeNode?.chargeCat;
                                            charge["chargeTypeDesc"] = chargeNode?.chargeCatDesc?.description;
                                            charge["currency"] = chargeNode?.currency;
                                            charge["currencyDesc"] = chargeNode?.currencyDesc?.description;
                                            charge["changesApplied"] = charge?.changesApplied !== '' ? charge?.changesApplied : 'N'
                                        }
                                    })
                                })
                                unstable_batchedUpdates(() => {
                                    if (assetResponse?.data?.status === 'PD') {
                                        setIsAssetTerminated(true)
                                    }
                                    setAssetInputs(assetResponse.data);
                                    setAssetProperty(assetResponse.data?.property);
                                    setChargeList(assetResponse.data?.assetCharges);
                                })
                            }
                        }).catch(error => console.log(error))
                }
            }).catch(error => console.log(error))
            .finally()
    }

    const handleOnAssetInputsChange = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {
            setAssetInputs({
                ...assetInputs,
                [`${target.id.replace('-', '')}`]: target.value
            })
            setAssetInputsErros({
                ...assetInputsErrors,
                [target.id.replace('-', '')]: ""
            })
        })
        if (target.id === 'serviceType' && !isEditView) {
            getChargeNameListOREditData(target.value);
        }
    }

    const handleOnAddAssetList = (e) => {
        setIsActive('list');
    }

    const handleOnSubmit = (e) => {
        if (validate('DETAILS', AssetValidationSchema, assetInputs)) {
            toast.error("Validation errors found. Please check highlighted fields");
            return;
        }
        if (chargeList.length === 0) {
            toast.error("Alteast One charge is required");
            return false;
        }
        if (assetInputs?.status === 'NEW') {
            if (moment(assetInputs?.startDate).isBefore(moment().add(1, 'days').format('YYYY-MM-DD'))) {
                toast.error('Start Date Should be Tomorrow Date')
                return
            }
        }
        if (assetInputs?.endDate !== "" || assetInputs?.endDate !== null || assetInputs?.endDate !== undefined) {
            if (moment(assetInputs?.endDate).isBefore(moment().format('YYYY-MM-DD'))) {
                toast.error('End Date Cannot be Past Date')
                return
            }
        }
        const requestBody = {
            ...assetInputs,
            assetProperty,
            charge: chargeList
        }
        if (isEditView) {
            
            put(`${properties.ASSET_API}/${assetInputs.assetId}`, { ...requestBody })
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
            
            post(properties.ASSET_API, { ...requestBody })
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
            setAssetInputsErros({});
            setAssetInputs(addAssestinitialState);
            setAssetProperty([]);
            setChargeList([])
            setChargeName("");
            setAssetPropertyObject({
                property: "",
                description: ""
            });
        })
    }

    const handleChargeNameSearch = (e) => {
        if (chargeList.length > 0) {
            for (let charge in chargeList) {
                if (Number(chargeList[charge].chargeId) === Number(chargeName)) {
                    toast.error("Charge Name Already Added");
                    setChargeName('');
                    return;
                }
            }
        }
        if (chargeName === '') {
            toast.error("Please Select Charge Name");
            return;
        }
        let charge = chargeNameLookup.filter((charge) => Number(charge.chargeId) === Number(chargeName));
        unstable_batchedUpdates(() => {
            setChargeData({
                chargeId: charge[0]?.chargeId,
                assetChargeId: '',
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
        if (assetInputs.serviceType === '') {
            toast.error("Please select Service Type")
            return false
        }
        setShowChargeDropdown(true)
    }

    return (
        <>
            <div className="col-12 pr-0">
                <section className="triangle"><h4 id="list-item-1" className="pl-2">{isEditView ? 'Edit' : 'Create'} Asset</h4></section>
            </div>
            <div className="autoheight p-2">
                <section>
                    <div className="form-row pb-2">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="assetName" className="col-form-label">Asset Name<span>*</span></label>
                                <input type="text" disabled={isAssetTerminated} className={`form-control ${assetInputsErrors.assetName ? "error-border" : ""}`} id="assetName" placeholder="Enter Asset Name" value={assetInputs.assetName} onChange={handleOnAssetInputsChange} />
                                <span className="errormsg">{assetInputsErrors.assetName ? assetInputsErrors.assetName : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="serviceType" className="col-form-label">Service Type <span> *</span> </label>
                                <select disabled={isEditView} id="serviceType" className={`form-control ${assetInputsErrors.serviceType ? "error-border" : ""}`} value={assetInputs.serviceType} onChange={handleOnAssetInputsChange} >
                                    <option value="">Select Service Type</option>
                                    {
                                        serviceTypeLookup && serviceTypeLookup.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{assetInputsErrors.serviceType ? assetInputsErrors.serviceType : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="startDate" className="col-form-label">Start Date <span> *</span> </label>
                                <input disabled={(assetInputs?.status !== 'NEW' || isAssetTerminated)} type="date" id="startDate"
                                    min={moment().add(1, 'days').format('YYYY-MM-DD')}
                                    className={`form-control ${assetInputsErrors.startDate ? "error-border" : ""}`} placeholder="Start Date" value={assetInputs.startDate} onChange={handleOnAssetInputsChange} />
                                <span className="errormsg">{assetInputsErrors.startDate ? assetInputsErrors.startDate : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="endDate" className="col-form-label">End Date</label>
                                <input type="date" disabled={isAssetTerminated} min={moment().format('YYYY-MM-DD')} id="endDate" className={`form-control ${assetInputsErrors.endDate ? "error-border" : ""}`} placeholder="End Date" value={assetInputs.endDate} onChange={handleOnAssetInputsChange} />
                                <span className="errormsg">{assetInputsErrors.endDate ? assetInputsErrors.endDate : ""}</span>
                            </div>
                        </div>
                        {
                            (assetInputs?.status === 'NEW' || assetInputs?.status === 'PD') ?
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="status-" className="col-form-label">Status <span> *</span> </label>
                                        <input type="text" disabled={true} className={`form-control ${assetInputsErrors.status ? "error-border" : ""}`} id="status-" value={assetInputs?.statusDes} onChange={handleOnAssetInputsChange} />
                                        <span className="errormsg">{assetInputsErrors.status ? assetInputsErrors.status : ""}</span>
                                    </div>
                                </div>
                                :
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="status-" className="col-form-label">Status <span> *</span> </label>
                                        <select className={`form-control ${assetInputsErrors.status ? "error-border" : ""}`} id="status-" value={assetInputs.status} onChange={handleOnAssetInputsChange}>
                                            <option value="">Select Status</option>
                                            {
                                                statusLookup && statusLookup.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))
                                            }
                                        </select>
                                        <span className="errormsg">{assetInputsErrors.status ? assetInputsErrors.status : ""}</span>
                                    </div>
                                </div>
                        }

                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="volumeAllowed" className="col-form-label">Volume Allowed </label>
                                <select className="form-control" id="volumeAllowed" disabled={isAssetTerminated} value={assetInputs.volumeAllowed} onChange={handleOnAssetInputsChange}>
                                    <option value="">Select Volume Allowed</option>
                                    {
                                        volumeAllowedLookup && volumeAllowedLookup.map((e) => (
                                            <option disabled={e.code === 'YES' && assetInputs.multipleSelection === 'YES' ? true : false} key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="multipleSelection" className="col-form-label">Multiple Selection</label>
                                <select className="form-control" id="multipleSelection" disabled={isAssetTerminated} value={assetInputs.multipleSelection} onChange={handleOnAssetInputsChange}>
                                    <option value="">Select Multiple Selection</option>
                                    {
                                        multipleSelectionLookup && multipleSelectionLookup.map((e) => (
                                            <option disabled={e.code === 'YES' && assetInputs.volumeAllowed === 'YES' ? true : false} key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="assetType" className="col-form-label">Asset Type </label>
                                <input type="text" className="form-control" id="assetType" disabled={isAssetTerminated} placeholder='Enter Asset Type' value={assetInputs.assetType} onChange={handleOnAssetInputsChange} />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="assetStatus" className="col-form-label">Asset Status</label>
                                <select className="form-control" id="assetStatus" disabled={isAssetTerminated} value={assetInputs.assetStatus} onChange={handleOnAssetInputsChange}>
                                    <option value="">Select Asset Status</option>
                                    {
                                        assetStatusLookup && assetStatusLookup.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="assetSegment" className="col-form-label">Asset Segment</label>
                                <select className="form-control" id="assetSegment" disabled={isAssetTerminated} value={assetInputs.assetSegment} onChange={handleOnAssetInputsChange}>
                                    <option value="">Select Asset Segment</option>
                                    {
                                        assetSegmentLookup && assetSegmentLookup.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="assetManufacturer" className="col-form-label">Asset Manufacturer</label>
                                <select className="form-control" id="assetManufacturer" disabled={isAssetTerminated} value={assetInputs.assetManufacturer} onChange={handleOnAssetInputsChange}>
                                    <option value="">Select Asset Manufacturer</option>
                                    {
                                        assetManufacturerLookup && assetManufacturerLookup.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="assetWarrantyPeriod" className="col-form-label">Asset Warranty Period (* in Months)</label>
                                <NumberFormatBase type="text" disabled={isAssetTerminated} className="form-control" id="assetWarrantyPeriod" placeholder='Enter Warranty Period' value={assetInputs.assetWarrantyPeriod} onChange={handleOnAssetInputsChange} />
                            </div>
                        </div>
                        <AddProperty
                            data={{
                                propertyList: assetProperty,
                                propertyObject: assetPropertyObject,
                                module: 'Asset',
                                location,
                                isTerminated: isAssetTerminated
                            }}
                            handler={{
                                setPropertyList: setAssetProperty,
                                setPropertyObject: setAssetPropertyObject
                            }}
                        />
                    </div>
                </section>
            </div>
            <div className="col-12 p-0">
                <section className="triangle">
                    <div className="row col-12">
                        <div className="col-10">
                            <h5 id="list-item-1" className="pl-1">Asset Charge Details</h5>
                        </div>
                        <div className="col-2">
                            <span className="float-right">
                                <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" onClick={handleOnAddCharge}
                                    disabled={isAssetTerminated}
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
                                            <option value="">Select Asset Charge Name</option>
                                            {
                                                chargeNameLookup && chargeNameLookup.map((charge) => (
                                                    <option value={charge.chargeId}>{charge.chargeName}</option>
                                                ))
                                            }
                                        </select>
                                        <div className="col-md-3 pl-0 mt-1">
                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2"
                                                disabled={isAssetTerminated}
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
                            isTerminated: isAssetTerminated
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
                                module: 'Asset'
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
                            <button type="button" className="btn waves-effect waves-light btn-primary m-1" onClick={handleOnSubmit} disabled={isAssetTerminated} >
                                {isEditView ? 'Update' : 'Submit'}
                            </button>
                            <button type="button" className={`btn waves-effect waves-light btn-secondary m-1 ${isEditView ? 'd-none' : ''}`} onClick={handleOnClear}>
                                Clear
                            </button>
                            <button type="button" className="btn waves-effect waves-light btn-primary m-1" onClick={handleOnAddAssetList}>
                                Back to Asset List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddEditAsset;