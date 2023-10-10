import React, { useEffect, useState } from 'react'
import { string, object } from "yup";
import { get, post, put } from "../../common/util/restUtil";
import { properties } from "../../properties";

import { toast } from 'react-toastify';
import moment from 'moment'
import AddProperty from '../addProperty';
import AddEditChargeModal from '../addEditChargeModal';
import ChargeListView from '../SearchProduct';
import { unstable_batchedUpdates } from 'react-dom';

const AddEditPlan = (props) => {

    const planData = props.data.planData
    const location = props.data.location
    const setIsActive = props.handler.setIsActive

    const initialState = {
        planName: "",
        serviceType: "",
        startDate: "",
        endDate: "",
        status: "NEW",
        statusDesc: "New",
        planProperty: [],
        charge: []
    }
    const [mode, setMode] = useState('create')
    const [newPlanData, setNewPlanData] = useState(initialState)
    const [planPropertyList, setPlanPropertyList] = useState([])
    const [chargeList, setChargeList] = useState([])
    const [error, setError] = useState({})
    const [chargeError, setChargeError] = useState({})
    const [serviceTypeLookup, setServiceTypeLookup] = useState([])
    const [statusLookup, setStatusLookup] = useState([])
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false)
    const [oldChargeName, setOldChargeName] = useState()
    const [chargeName, setChargeName] = useState('')
    const [showChargeDropdown, setShowChargeDropdown] = useState(false)
    const [chargeNameLookup, setChargeNameLookup] = useState([])
    const [isPlanTerminated, setIsPlanTerminated] = useState(false)
    const [chargeData, setChargeData] = useState({
        chargeId: 0,
        chargeName: '',
        chargeType: '',
        chargeTypeDesc: '',
        currencyDesc: '',
        currency: '',
        chargeAmount: '',
        frequency: '',
        prorated: '',
        billingEffective: 1,
        advanceCharge: '',
        chargeUpfront: '',
        startDate: '',
        endDate: '',
        changesApplied: ''
    })

    const [planPropertyObject, setPlanPropertyObject] = useState({
        property: "",
        description: ""
    })

    const planValidationSchema = object().shape({
        planName: string().required("Plan Name is required"),
        serviceType: string().required("Service Type is required"),
        startDate: string().required("Start Date is required"),
        status: string().required("Status is required"),
        endDate: string().test(
            "Date",
            "End date should not be less than from Start date",
            (endDate) => validateToDate(endDate)
        )
    });

    const validateToDate = (value) => {
        try {
            if (Date.parse(value) < Date.parse(newPlanData.startDate))
                return false;
            return true
        } catch (e) {
            return false
        }
    }

    const validate = (section, schema, data) => {
        try {
            if (section === 'DETAILS') {
                setError({})
            }
            if (section === 'CHARGE') {
                setChargeError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'DETAILS') {
                    setError((prevState) => {
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
        
        post(properties.BUSINESS_ENTITY_API, ['PROD_TYPE', 'CONNECTION_STATUS'])
            .then((response) => {
                if (response.data) {
                    setServiceTypeLookup(response.data.PROD_TYPE)
                    //setStatusLookup(response.data.CONNECTION_STATUS)
                    setStatusLookup(response?.data?.CONNECTION_STATUS.filter((status) => {
                        if (status.code === 'ACTIVE' || status.code === 'HOLD') {
                            return status
                        }
                    }))
                }
            }).catch(error => console.log(error))
            .finally()
    }, [])

    useEffect(() => {
        let list = []
        
        get(properties.CHARGE_API + "/search/all")
            .then((resp) => {
                list = resp.data
                setChargeNameLookup(resp.data.filter((charge) => charge.status !== 'INACTIVE'))
                if (location === 'edit') {
                    if (planData?.status === 'PD') {
                        setIsPlanTerminated(true)
                    }
                    setNewPlanData({
                        ...newPlanData,
                        planName: planData.planName,
                        serviceType: planData.serviceType,
                        startDate: planData.startDate,
                        endDate: planData?.endDate || '',
                        status: planData.status,
                        statusDesc: planData?.statusDesc?.description
                    })
                    setPlanPropertyList(planData?.property?.plan || [])
                    let fullChargeList = planData?.planCharges || []
                    fullChargeList.map((charge) => {
                        list.map((chargeNode) => {
                            if (Number(charge.chargeId) === Number(chargeNode.chargeId)) {
                                charge["chargeName"] = chargeNode?.chargeName
                                charge["chargeType"] = chargeNode?.chargeCat
                                charge["chargeTypeDesc"] = chargeNode?.chargeCatDesc?.description
                                charge["currency"] = chargeNode?.currency
                                charge["currencyDesc"] = chargeNode?.currencyDesc?.description
                                charge["changesApplied"] = charge?.changesApplied !== '' ? charge?.changesApplied : 'N'
                            }
                        })
                    })

                    setChargeList(fullChargeList)
                }
            }).catch(error => console.log(error))
            .finally()
        setShowChargeDropdown(false)
    }, [newPlanData.serviceType])



    const handleSubmit = () => {
        let error = validate('DETAILS', planValidationSchema, newPlanData);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        if (chargeList.length === 0) {
            toast.error("Alteast One charge is required");
            return false;
        }
        if (newPlanData?.status === 'NEW') {
            if (moment(newPlanData?.startDate).isBefore(moment().add(1, 'days').format('YYYY-MM-DD'))) {
                toast.error('Start Date Should be Tomorrow Date')
                return
            }
        }
        if (newPlanData?.endDate !== "" || newPlanData?.endDate !== null || newPlanData?.endDate !== undefined) {
            if (moment(newPlanData?.endDate).isBefore(moment().format('YYYY-MM-DD'))) {
                toast.error('End Date Cannot be Past Date')
                return
            }
        }
        setNewPlanData({ ...newPlanData, planProperty: planPropertyList, charge: chargeList })

        let data = {}
        data = newPlanData
        data.planProperty = planPropertyList
        data.charge = chargeList
        if (location === 'create') {
            
            post(properties.PLANS_API, data)
                .then((response) => {
                    if (response.status === 200) {
                        if (response.data) {
                            toast.success("Plan Created Successfully")
                            setIsActive('list')
                        }
                    }
                })
                .catch((error) => {
                    toast.error("Unable to create Plan")
                })
                .finally()
        }
        else if (location === 'edit') {
            
            put(properties.PLANS_API + "/" + planData.planId, data)
                .then((response) => {
                    if (response.status === 200) {
                        toast.success("Plan Updated Successfully")
                        setIsActive('list')
                    }
                })
                .catch((error) => {
                    toast.error("Unable to create Plan")
                })
                .finally()
        }

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
        setChargeData({
            chargeId: charge[0]?.chargeId,
            planChargeId: '',
            chargeName: charge[0]?.chargeName,
            chargeType: charge[0]?.chargeCat,
            chargeTypeDesc: charge[0]?.chargeCatDesc?.description,
            currencyDesc: charge[0]?.currencyDesc?.description,
            currency: charge[0]?.currency,
            chargeAmount: '',
            frequency: '',
            prorated: '',
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
    }

    const handleClear = () => {
        unstable_batchedUpdates(() => {
            setNewPlanData(initialState);
            setPlanPropertyList([]);
            setChargeList([]);
            setChargeName("");
            setPlanPropertyObject({
                property: "",
                description: ""
            });
        })
    }

    const handleAddCharge = () => {
        if (newPlanData.serviceType === '') {
            toast.error("Please Select Service Type")
            return false
        }
        setChargeNameLookup(chargeNameLookup.filter((charge) => charge.serviceType === newPlanData.serviceType))
        setShowChargeDropdown(true)
    }

    return (
        <>
            <div className="row mt-1">
                <div className="col-lg-12">
                    <div className="col-12 pr-0">
                        <section className="triangle">
                            <div className="row">
                                <div className="col-md-4">
                                    <h4 id="list-item-1" className="pl-2">{location === 'create' ? 'Create' : 'Edit'} Plan</h4>
                                </div>
                            </div>
                        </section>
                        <div className="autoheight p-2">
                            <section>
                                <div className="form-row pb-2">
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="planName" className="col-form-label">Plan Name <span className="text-danger"> *</span></label>
                                            <input type="text" disabled={isPlanTerminated} className="form-control" id="planName" value={newPlanData.planName}
                                                onChange={(e) => {
                                                    setNewPlanData({ ...newPlanData, planName: e.target.value })
                                                    setError({ ...error, planName: "" })
                                                }}
                                            />
                                            <span className="errormsg">{error.planName ? error.planName : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="serviceType" className="col-form-label">Service Type <span className="text-danger"> *</span> </label>
                                            <select id="serviceType" disabled={location === 'edit' ? true : false} className="form-control" value={newPlanData.serviceType}
                                                onChange={(e) => {
                                                    setNewPlanData({ ...newPlanData, serviceType: e.target.value })
                                                    setError({ ...error, serviceType: "" })
                                                }}
                                            >
                                                <option value="">Select Service Type</option>
                                                {
                                                    serviceTypeLookup && serviceTypeLookup.map((service) => (
                                                        <option key={service.code} value={service.code}>{service.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.serviceType ? error.serviceType : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="startDate" className="col-form-label">Start Date <span className="text-danger"> *</span></label>
                                            <input type="date" disabled={(newPlanData?.status !== 'NEW' || isPlanTerminated)} className="form-control" id="startDate" value={newPlanData.startDate}
                                                min={moment().add(1, 'days').format('YYYY-MM-DD')}
                                                onChange={(e) => {
                                                    setNewPlanData({ ...newPlanData, startDate: e.target.value })
                                                    setError({ ...error, startDate: "" })
                                                }}
                                            />
                                            <span className="errormsg">{error.startDate ? error.startDate : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="endDate" className="col-form-label">End Date</label>
                                            <input type="date" className="form-control" id="endDate" value={newPlanData.endDate}
                                                min={moment().format('YYYY-MM-DD')}
                                                disabled={isPlanTerminated}
                                                onChange={(e) => {
                                                    setNewPlanData({ ...newPlanData, endDate: e.target.value })
                                                    setError({ ...error, endDate: "" })
                                                }}
                                            />
                                            <span className="errormsg">{error.endDate ? error.endDate : ""}</span>
                                        </div>
                                    </div>
                                    {
                                        (newPlanData?.status === 'NEW' || newPlanData?.status === 'PD') ?
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="planStatus" className="col-form-label">Status <span className="text-danger"> *</span></label>
                                                    <input type="text" id="planStatus" disabled={true} className="form-control" value={newPlanData?.statusDesc}
                                                        onChange={(e) => {
                                                            setNewPlanData({ ...newPlanData, status: e.target.value })
                                                            setError({ ...error, status: "" })
                                                        }}
                                                    />
                                                    <span className="errormsg">{error.status ? error.status : ""}</span>
                                                </div>
                                            </div>
                                            :
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="planStatus" className="col-form-label">Status <span className="text-danger"> *</span></label>
                                                    <select id="planStatus" className="form-control" value={newPlanData.status}
                                                        onChange={(e) => {
                                                            setNewPlanData({ ...newPlanData, status: e.target.value })
                                                            setError({ ...error, status: "" })
                                                        }}
                                                    >
                                                        <option value="">Select Status</option>
                                                        {
                                                            statusLookup && statusLookup.map((status) => (
                                                                <option key={status.code} value={status.code}>{status.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    <span className="errormsg">{error.status ? error.status : ""}</span>
                                                </div>
                                            </div>
                                    }
                                </div>

                                <AddProperty
                                    data={{
                                        propertyList: planPropertyList,
                                        propertyObject: planPropertyObject,
                                        module: 'Plan',
                                        location: location,
                                        isTerminated: isPlanTerminated
                                    }}
                                    handler={{
                                        setPropertyList: setPlanPropertyList,
                                        setPropertyObject: setPlanPropertyObject
                                    }}
                                />



                                {/* <div className="row p-1 mt-3"> */}
                                    <div className="col-12 p-0">
                                        <section className="triangle">
                                            <div className="row col-12">
                                                <div className="col-10">
                                                    <h5 id="list-item-1" className="pl-1">Plan Charge Details</h5>
                                                </div>
                                                <div className="col-2">
                                                    <span style={{ float: "right" }}>
                                                        <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" disabled={isPlanTerminated}
                                                            onClick={() => { handleAddCharge() }}
                                                        >
                                                            <span className="btn-label"><i className="fa fa-plus"></i></span>Add Charges
                                                        </button>
                                                    </span>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                {/* </div> */}
                                {
                                    showChargeDropdown === true &&
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
                                                        <option value="">Select Plan Charge Name</option>
                                                        {
                                                            chargeNameLookup && chargeNameLookup.map((charge) => (
                                                                <option value={charge.chargeId}>{charge.chargeName}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    <div className="col-md-2 pl-0 mt-1">
                                                        <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" disabled={isPlanTerminated}
                                                            onClick={() => { handleChargeNameSearch() }}
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
                                        isTerminated: isPlanTerminated
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
                                            module: 'Plan'
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
                                        <button type="button" className="btn waves-effect waves-light btn-primary mr-1" disabled={isPlanTerminated} onClick={() => { handleSubmit() }}>{location === 'edit' ? "Update" : "Submit"}</button>
                                        <button type="button" className="btn waves-effect waves-light btn-secondary mr-1" disabled={isPlanTerminated} onClick={() => { handleClear() }}>Clear</button>
                                        <button type="button" className="btn waves-effect waves-light btn-primary" onClick={() => { setIsActive('list') }} >Back to Plan List</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddEditPlan;