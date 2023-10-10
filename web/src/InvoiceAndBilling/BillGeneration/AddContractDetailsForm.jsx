import React, { useState } from 'react';

const AddContractDetailsForm = () => {

    const initialState = {
        contractType: "",
        contractName: "",
        startDate: "",
        endDate: "",
        chargeName: "",
        chargeType: "",
        chargeAmount: "",
        frequency: "",
        prorated: ""
    }

    const [showAdhocContractForm, setShowAdhocContractForm] = useState(false);
    const [addContractDetailsFromInputs, setAddContractDetailsFromInputs] = useState(initialState)

    const handleOnContractDetailsChange = (e) => {
        const { target } = e;
        setAddContractDetailsFromInputs({
            ...addContractDetailsFromInputs,
            [target.id]: target.value
        })
    }

    const handleOnAddContractDetailsSubmit = () => {

    }

    const handleOnClear = () => {
        setAddContractDetailsFromInputs(initialState)
    }

    return (
        <>
            <div className="row">
                <div className="col-md-2 mx-2">
                    <div className="form-group">
                        <label htmlFor="adhocContract" className="col-form-label"></label>
                        <div className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" checked={showAdhocContractForm} id="adhocCheck" onChange={() => setShowAdhocContractForm(!showAdhocContractForm)} />
                            <label className="custom-control-label col-form-label" htmlFor="adhocCheck">Adhoc Contract</label>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mx-2" id="cont-type">
                    <label htmlFor="contractType" className="col-form-label">Contract Type</label>
                    <select id="contractType" className="form-control" value={addContractDetailsFromInputs.contractType} onChange={handleOnContractDetailsChange}>
                        <option value="">Select</option>
                        <option value="2">Plan</option>
                        <option value="3">Services</option>
                        <option value="3">Asset</option>
                    </select>
                </div>
                <div className="col-md-2 mx-2" id="contract-name33">
                    <label htmlFor="contractName" className="col-form-label">Contract Name</label>
                    <select id="contractName" className="form-control" value={addContractDetailsFromInputs.contractName} onChange={handleOnContractDetailsChange}>
                        <option value="">Select</option>
                        <option value="1">Mobile Contract</option>
                        <option value="2">Dell Server</option>
                        <option value="3">Broadband</option>
                    </select>
                </div>
                <div className="col-md-2 mx-2">
                    <div className="form-group">
                        <label htmlFor="startDate" className="col-form-label">Contract Start Date</label>
                        <input type="date" className="form-control" id="startDate" value={addContractDetailsFromInputs.startDate} onChange={handleOnContractDetailsChange} />
                    </div>
                </div>
                <div className="col-md-2 mx-2">
                    <div className="form-group">
                        <label htmlFor="endDate" className="col-form-label">Contract End Date</label>
                        <input type="date" className="form-control" id="endDate" value={addContractDetailsFromInputs.endDate} onChange={handleOnContractDetailsChange} />
                    </div>
                </div>
            </div>
            {
                showAdhocContractForm &&
                <div className="row mt-2">
                    <div className="col-md-2 mx-2">
                        <div className="form-group">
                            <label htmlFor="chargeName" className="col-form-label">Charge Name</label>
                            <input type="text" className="form-control" id="chargeName" placeholder="Charge name" value={addContractDetailsFromInputs.chargeName} onChange={handleOnContractDetailsChange} />
                        </div>
                    </div>

                    <div className="col-md-2 mx-2">
                        <div className="form-group">
                            <label htmlFor="chargeType" className="col-form-label">Charge Type</label>
                            <select id="chargeType" className="form-control" value={addContractDetailsFromInputs.chargeType} onChange={handleOnContractDetailsChange}>
                                <option value="">Select</option>
                                <option value="1">RC</option>
                                <option value="2">OTC</option>
                                <option value="3">Usage</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-md-2 mx-2">
                        <div className="form-group">
                            <label htmlFor="chargeAmount" className="col-form-label">Charge Amount</label>
                            <input type="text" className="form-control" id="chargeAmount" placeholder="Charge Amount" value={addContractDetailsFromInputs.chargeAmount} onChange={handleOnContractDetailsChange} />
                        </div>
                    </div>

                    <div className="col-md-2 mx-2">
                        <div className="form-group">
                            <label htmlFor="frequency" className="col-form-label">Frequency</label>
                            <select id="frequency" className="form-control" value={addContractDetailsFromInputs.frequency} onChange={handleOnContractDetailsChange}>
                                <option value="">Select</option>
                                <option value="2">Monthly</option>
                                <option value="3">Quarterly</option>
                                <option value="3">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-md-2 mx-2">
                        <div className="form-group">
                            <label htmlFor="prorated" className="col-form-label">Prorated</label>
                            <select id="prorated" className="form-control" value={addContractDetailsFromInputs.prorated} onChange={handleOnContractDetailsChange}>
                                <option value="">Select</option>
                                <option value="2">Yes</option>
                                <option value="3">No</option>
                            </select>
                        </div>
                    </div>
                </div>
            }
            <div className="col-12 p-1 mt-1" id="submit-button2">
                <div id="customer-buttons" className="d-flex justify-content-center">
                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" id="customCheck2" onClick={handleOnAddContractDetailsSubmit}>Submit</button>
                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleOnClear}>Clear</button>
                </div>
            </div>
        </>
    )
}

export default AddContractDetailsForm;