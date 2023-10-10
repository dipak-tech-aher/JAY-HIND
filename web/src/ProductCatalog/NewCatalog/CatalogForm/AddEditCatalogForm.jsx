import React from 'react';
import moment from 'moment';
import ReactSelect from 'react-select'

const AddEditCatalogFrom = (props) => {
    const { catalogDetailsFromInputs, isCatalogTerminated, location } = props.data;
    const { serviceTypeLookup, customerTypeLookup, statusLookup } = props.lookup;
    const { handleCatalogDetailsFormInputChange, handleCustomerTypeChange } = props.handler;
    const { catalogDetailsFormInputErrors } = props.error;
    return (
        <section>
            <div className="form-row pb-2">
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="catalogName" className="col-form-label">Catalog Name <span>*</span></label>
                        <input type="text" disabled={isCatalogTerminated} placeholder="Enter Charge Name" className={`form-control ${catalogDetailsFormInputErrors.catalogName ? "error-border" : ""}`} id="catalogName" value={catalogDetailsFromInputs.catalogName} onChange={handleCatalogDetailsFormInputChange} />
                        <span className="errormsg">{catalogDetailsFormInputErrors.catalogName ? catalogDetailsFormInputErrors.catalogName : ""}</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="serviceType" className="col-form-label">Service Type <span>*</span> </label>
                        <select id="serviceType" disabled={location === 'edit' ? true : false} className={`form-control ${catalogDetailsFormInputErrors.serviceType ? "error-border" : ""}`} value={catalogDetailsFromInputs.serviceType} onChange={handleCatalogDetailsFormInputChange}>
                            <option value="">Select Service Type</option>
                            {
                                serviceTypeLookup && serviceTypeLookup.map((e) => (
                                    <option key={e.code} value={e.code}>{e.description}</option>
                                ))
                            }
                        </select>
                        <span className="errormsg">{catalogDetailsFormInputErrors.serviceType ? catalogDetailsFormInputErrors.serviceType : ""}</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="customerType" className="col-form-label">Customer Type <span>*</span> </label>
                        <ReactSelect
                            isDisabled={isCatalogTerminated}
                            id='customerType'

                            menuPortalTarget={document.body} 
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            
                            placeholder="Select Customer Type"
                            options={customerTypeLookup.map((item) => ({ label: item.description, value: item.code }))}
                            isMulti={true}
                            onChange={(selected) => {
                                handleCustomerTypeChange(selected)
                            }}
                            value={catalogDetailsFromInputs.customerType}
                            className={`${catalogDetailsFormInputErrors.customerType ? "error-border" : ""}`}
                        />
                        <span className="errormsg">{catalogDetailsFormInputErrors.customerType ? catalogDetailsFormInputErrors.customerType : ""}</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="startDate" className="col-form-label">Start Date <span>*</span> </label>
                        <input type="date" id="startDate" disabled={(catalogDetailsFromInputs?.status !== 'NEW' || isCatalogTerminated)}
                            min={moment().add(1, 'days').format('YYYY-MM-DD')}
                            className={`form-control ${catalogDetailsFormInputErrors.startDate ? "error-border" : ""}`} placeholder="Start Date" value={catalogDetailsFromInputs.startDate} onChange={handleCatalogDetailsFormInputChange} />
                        <span className="errormsg">{catalogDetailsFormInputErrors.startDate ? catalogDetailsFormInputErrors.startDate : ""}</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="endDate" className="col-form-label">End Date</label>
                        <input type="date" id="endDate" disabled={isCatalogTerminated} min={moment().format('YYYY-MM-DD')} className={`form-control ${catalogDetailsFormInputErrors.endDate ? "error-border" : ""}`} placeholder="End Date" value={catalogDetailsFromInputs.endDate} onChange={handleCatalogDetailsFormInputChange} />
                        <span className="errormsg">{catalogDetailsFormInputErrors.endDate ? catalogDetailsFormInputErrors.endDate : ""}</span>
                    </div>
                </div>
                {
                    (catalogDetailsFromInputs?.status === 'NEW' || catalogDetailsFromInputs?.status === 'PD') ?
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="status-" className="col-form-label">Status <span>*</span></label>
                                <input type="text" id="status-" disabled={true} className={`form-control ${catalogDetailsFormInputErrors.status ? "error-border" : ""}`} value={catalogDetailsFromInputs.statusDesc} onChange={handleCatalogDetailsFormInputChange} />
                                <span className="errormsg">{catalogDetailsFormInputErrors.status ? catalogDetailsFormInputErrors.status : ""}</span>
                            </div>
                        </div>
                        :
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="status-" className="col-form-label">Status <span>*</span></label>
                                <select id="status-" className={`form-control ${catalogDetailsFormInputErrors.status ? "error-border" : ""}`} value={catalogDetailsFromInputs.status} onChange={handleCatalogDetailsFormInputChange}>
                                    <option value="">Select Status</option>
                                    {
                                        statusLookup && statusLookup.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{catalogDetailsFormInputErrors.status ? catalogDetailsFormInputErrors.status : ""}</span>
                            </div>
                        </div>
                }

            </div>
        </section>
    )
}

export default AddEditCatalogFrom;