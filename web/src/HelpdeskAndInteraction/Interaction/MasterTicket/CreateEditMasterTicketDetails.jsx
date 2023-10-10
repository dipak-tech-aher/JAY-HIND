import React, { useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { properties } from "../../../properties";
import { get } from "../../../common/util/restUtil";

const CreateEditMasterTicketDetails = (props) => {
    const { masterTicketData, masterTicketDataError, servcieTypeLookup, problemCodeLookup,
        priorityLookup, ticketSourceLookup, districtLookup, kampongLookup,
        postCodeLookup, countries, department, organization, role } = props?.data
    const { setMasterTicketDataError, setMasterTicketData, setDepartment, setRole, setKampongLookup, setPostCodeLookup } = props?.handler
    const { departmentRef, addressLookUpRef, roleRef } = props?.reference
    const [userLookup, setUserLookup] = useState([])

    /**
     * @param {string} roleId 
     * @param {string} deptId 
     * Get User Based on Role and Department
     */
    const getUsersBasedOnRole = (roleId, deptId) => {
        
        const data = {
            roleId,
            deptId
        }
        get(`${properties.USER_LOOKUP_API}?role-id=${data.roleId}&dept="${data.deptId}"`)
            .then((userResponse) => {
                if (userResponse.data) {
                    const { data } = userResponse;
                    setUserLookup(data);
                }
            }).catch(error => console.log(error))
            .finally()
    }

    /**
     * The function is called when the user types into the input field. It updates the state of the
     * component with the new value of the input field and clears the error message for that field.
     */
    const handleOnChange = (e) => {
        const { target } = e;
        if (target.id === "ouId") {
            const dept = departmentRef.current.filter((d) => {
                let isTrue = false
                if (d.unitType === "DEPT" && d.parentUnit === target.value) {
                    return isTrue = true
                }
                return isTrue = false

            })

            setDepartment(dept)
            unstable_batchedUpdates(() => {
                setDepartment(dept)
                setMasterTicketData({
                    ...masterTicketData,
                    entityId: "",
                    roleId: "",
                    userId: "",
                    [target.id]: target.value
                })
                setMasterTicketDataError({
                    ...masterTicketDataError,
                    [target.id]: ""
                })
            })
        }
        else if (target.id === "entityId") {
            let roleList = []
            let unitroleMapping = []
            const dept = departmentRef.current.filter((d) => {
                let isTrue = false
                if (d.unitType === "DEPT" && d.unitId === target.value) {
                    return isTrue = true
                }
                return isTrue = false
            })

            unitroleMapping = dept[0]?.mappingPayload?.unitroleMapping
            if (unitroleMapping?.length > 0) {
                for (let a of unitroleMapping) {
                    for (let r of roleRef.current) {
                        if (r.roleId === a) {
                            roleList.push(r)
                        }
                    }
                }
            }
            unstable_batchedUpdates(() => {
                setRole(roleList)
                setMasterTicketData({
                    ...masterTicketData,
                    roleId: "",
                    userId: "",
                    [target.id]: target.value
                })
                setMasterTicketDataError({
                    ...masterTicketDataError,
                    [target.id]: ""
                })
            })
        }
        else if (target.id === "roleId") {
            if (target.value === null || target.value === undefined || masterTicketData?.entityId === null || masterTicketData?.entityId === undefined) {
                toast.error('Please Select Department and Role')
            }
            else {
                getUsersBasedOnRole(target.value, masterTicketData.entityId)
                unstable_batchedUpdates(() => {
                    setMasterTicketData({
                        ...masterTicketData,
                        userId: "",
                        [target.id]: target.value
                    })
                    setMasterTicketDataError({
                        ...masterTicketDataError,
                        [target.id]: ""
                    })
                })
            }
        }
        else if (target.id === "district") {
            let state = []
            for (let e of addressLookUpRef) {
                if (e.district === target.value) {
                    if (!state.includes(e.kampong)) {
                        state.push(e.kampong)
                    }
                }
            }
            unstable_batchedUpdates(() => {
                setKampongLookup(state)
                setMasterTicketData({
                    ...masterTicketData,
                    state: "",
                    postCode: "",
                    [target.id]: target.value
                })
                setMasterTicketDataError({
                    ...masterTicketDataError,
                    [target.id]: ""
                })
            })

        }
        else if (target.id === "state") {
            let postalCode = []
            for (let e of addressLookUpRef) {
                if (e.kampong === target.value) {
                    if (!postalCode.includes(e.postCode)) {
                        postalCode.push(e.postCode)
                    }
                }
            }
            unstable_batchedUpdates(() => {
                setPostCodeLookup(postalCode)
                setMasterTicketData({
                    ...masterTicketData,
                    postCode: "",
                    [target.id]: target.value
                })
                setMasterTicketDataError({
                    ...masterTicketDataError,
                    [target.id]: ""
                })
            })
        }
        else {
            unstable_batchedUpdates(() => {
                setMasterTicketData({
                    ...masterTicketData,
                    [target.id]: target.value
                })
                setMasterTicketDataError({
                    ...masterTicketDataError,
                    [target.id]: ""
                })
            })
        }
    }


    return (
        <div className="tab-content p-0">
            <div className="tab-pane active" id="basictab1">
                <div className="row">
                    <div className="col-12">
                        <section>
                            <div className="form-row pb-2">
                                <div className="col-6">
                                    <div className="form-group">
                                        <label htmlFor="title" className="col-form-label">Ticket Title<span className="text-danger">*</span></label>
                                        <input type="text" id="title" name="title" className={`form-control ${masterTicketDataError.title && "error-border"}`} value={masterTicketData?.title} onChange={handleOnChange}></input>
                                        <span className="errormsg">{masterTicketDataError.title ? masterTicketDataError.title : ""}</span>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="description" className="col-form-label">Ticket Details<span className="text-danger">*</span></label>
                                        <textarea rows="4" cols="78" id='description' className={`form-control ${masterTicketDataError.description && "error-border"}`} name='description' value={masterTicketData?.description} onChange={handleOnChange}></textarea>
                                        <span className="errormsg">{masterTicketDataError.description ? masterTicketDataError.description : ""}</span>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="row col-12">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="ouId" className="col-form-label">Operational Unit <span className="text-danger">*</span> </label>
                                                <select id="ouId" name="ouId" className={`form-control ${masterTicketDataError.ouId && "error-border"}`} value={masterTicketData?.ouId} onChange={handleOnChange}>
                                                    <option key="Ou" value="" data-object={JSON.stringify({})}>Select OU</option>
                                                    {
                                                        organization && organization.map((e) => (
                                                            <option key={e.unitId} value={e.unitId} data-object={JSON.stringify(e)}>{e.unitDesc}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{masterTicketDataError.ouId ? masterTicketDataError.ouId : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="entityId" className="col-form-label">Department <span className="text-danger">*</span></label>
                                                <select id="entityId" name="entityId" className={`form-control ${masterTicketDataError.entityId && "error-border"}`} value={masterTicketData?.entityId} onChange={handleOnChange}>
                                                    <option>Select Department</option>
                                                    {
                                                        department && department.map((e) => (
                                                            <option key={e.unitId} value={e.unitId} data-object={JSON.stringify(e)}>{e.unitDesc}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{masterTicketDataError.entityId ? masterTicketDataError.entityId : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="roleId" className="col-form-label">Role <span className="text-danger">*</span></label>
                                                <select id="roleId" name="roleId" className={`form-control ${masterTicketDataError.roleId && "error-border"}`} value={masterTicketData?.roleId} onChange={handleOnChange}>
                                                    <option>Select Role</option>
                                                    {
                                                        role && role.map((e) => (
                                                            <option key={e.roleId} value={e.roleId} data-object={JSON.stringify(e)}>{e.roleDesc}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{masterTicketDataError.roleId ? masterTicketDataError.roleId : ""}</span>
                                            </div>
                                        </div>
                                        {/* className={`form-control ${masterTicketDataError.userId && "error-border"}`} */}
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="Surname" className="col-form-label">Dept User </label>
                                                <select id="userId" name="userId" className="form-control" value={masterTicketData?.userId} onChange={handleOnChange}>
                                                    <option>Select User</option>
                                                    {
                                                        userLookup && userLookup.map((e) => (
                                                            <option key={e.userId} value={e.userId} data-object={JSON.stringify(e)}>{e.firstName} {e.lastName}</option>
                                                        ))
                                                    }
                                                </select>
                                                {/* <span className="errormsg">{masterTicketDataError.userId ? masterTicketDataError.userId : ""}</span> */}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="Surname" className="col-form-label">Service Type <span className="text-danger">*</span></label>
                                                <select id="serviceType" name="serviceType" className={`form-control ${masterTicketDataError.serviceType && "error-border"}`} value={masterTicketData?.serviceType} onChange={handleOnChange}>
                                                    <option key="Ou" value="" data-object={JSON.stringify({})}>Select Service Type</option>
                                                    {
                                                        servcieTypeLookup && servcieTypeLookup.map((e) => (
                                                            <option key={e.code} value={e.code} data-object={JSON.stringify(e)}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{masterTicketDataError.serviceType ? masterTicketDataError.serviceType : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="Surname" className="col-form-label">Problem Code <span className="text-danger">*</span></label>
                                                <select id="problemCode" name="problemCode" className={`form-control ${masterTicketDataError.problemCode && "error-border"}`} value={masterTicketData?.problemCode} onChange={handleOnChange}>
                                                    <option key="Ou" value="" data-object={JSON.stringify({})}>Select Problem Code</option>
                                                    {
                                                        problemCodeLookup && problemCodeLookup.map((e) => (
                                                            <option key={e.code} value={e.code} data-object={JSON.stringify(e)}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{masterTicketDataError.problemCode ? masterTicketDataError.problemCode : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="Surname" className="col-form-label">Priority<span className="text-danger"> *</span></label>
                                                <select id="priorityCode" namee="priorityCode" className={`form-control ${masterTicketDataError.priorityCode && "error-border"}`} value={masterTicketData?.priorityCode} onChange={handleOnChange}>
                                                    <option key="Ou" value="" data-object={JSON.stringify({})}>Select Priority</option>

                                                    {
                                                        priorityLookup && priorityLookup.map((e) => (
                                                            <option key={e.code} value={e.code} data-object={JSON.stringify(e)}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{masterTicketDataError.priorityCode ? masterTicketDataError.priorityCode : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="Surname" className="col-form-label">Source of Ticket <span className="text-danger">*</span></label>
                                                <select id="ticketSource" name="ticketSource" className={`form-control ${masterTicketDataError.ticketSource && "error-border"}`} value={masterTicketData?.ticketSource} onChange={handleOnChange}>
                                                    <option key="Ou" value="" data-object={JSON.stringify({})}>Select Source of Ticket</option>

                                                    {
                                                        ticketSourceLookup && ticketSourceLookup.map((e) => (
                                                            <option key={e.code} value={e.code} data-object={JSON.stringify(e)}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{masterTicketDataError.ticketSource ? masterTicketDataError.ticketSource : ""}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="col-12 pl-2 bg-light border">
                                    <h5 className="text-primary">Address Details</h5>
                                </div>
                            </div>
                            <fieldset className="mt-2">
                                <div className="row col-12 p-0">
                                    <div className="col-4">
                                        <div className="form-group">
                                            <label htmlFor="hno" className="col-form-label">Flat/House/Unit No</label>
                                            <input name="hno" type="text" className="form-control" id="hno" value={masterTicketData?.hno} onChange={handleOnChange}></input>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-group">
                                            <label htmlFor="buildingName" className="col-form-label">Building Name/Others</label>
                                            <input name="buildingName" type="text" className="form-control" id="buildingName" value={masterTicketData?.buildingName} onChange={handleOnChange}></input>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-group">
                                            <label htmlFor="street" className="col-form-label">Street/ Area<span className="text-danger"> *</span></label>
                                            <input name="street" type="text" className={`form-control ${masterTicketDataError.street && "error-border"}`} id="street" value={masterTicketData?.street} onChange={handleOnChange}></input>
                                            <span className="errormsg">{masterTicketDataError.street ? masterTicketDataError.street : ""}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-4">
                                        <div className="form-group">
                                            <label htmlFor="city" className="col-form-label">City/ Town<span className="text-danger"> *</span></label>
                                            <input name="city" type="text" className={`form-control ${masterTicketDataError.city && "error-border"}`} id="city" value={masterTicketData?.city} onChange={handleOnChange}></input>
                                            <span className="errormsg">{masterTicketDataError.city ? masterTicketDataError.city : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-group">
                                            <label htmlFor="district" className="col-form-label">District/ Province<span className="text-danger"> *</span></label>
                                            <select name="district" id="district" className={`form-control ${masterTicketDataError.district && "error-border"}`} value={masterTicketData?.district} onChange={handleOnChange}>
                                                <option>Select District</option>
                                                {
                                                    districtLookup && districtLookup.length > 0 && districtLookup.map((e) => (
                                                        <option key={e} value={e} data-object={JSON.stringify(e)}>{e}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{masterTicketDataError.district ? masterTicketDataError.district : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-group">
                                            <label htmlFor="state" className="col-form-label">State/ Region<span className="text-danger"> *</span></label>
                                            <select name="state" id="state" className={`form-control ${masterTicketDataError.state && "error-border"}`} value={masterTicketData?.state} onChange={handleOnChange}>
                                                <option>Select State/Region</option>
                                                {
                                                    kampongLookup && kampongLookup.length > 0 && kampongLookup.map((e) => (
                                                        <option key={e} value={e} data-object={JSON.stringify(e)}>{e}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{masterTicketDataError.state ? masterTicketDataError.state : ""}</span>
                                        </div>
                                    </div>

                                </div>
                                <div className="row">
                                    <div className="col-4">
                                        <div className="form-group">
                                            <label htmlFor="postCode" className="col-form-label">PostCode<span className="text-danger"> *</span></label>
                                            <select name="postCode" id="postCode" className={`form-control ${masterTicketDataError.postCode && "error-border"}`} value={masterTicketData?.postCode} onChange={handleOnChange}>
                                                <option>Select PostCode</option>
                                                {
                                                    postCodeLookup && postCodeLookup.length > 0 && postCodeLookup.map((e) => (
                                                        <option key={e} value={e} data-object={JSON.stringify(e)}>{e}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{masterTicketDataError.postCode ? masterTicketDataError.postCode : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-group">
                                            <label htmlFor="country" className="col-form-label">Country<span className="text-danger"> *</span></label>
                                            <select name="country" id="country" className={`form-control ${masterTicketDataError.country && "error-border"}`} value={masterTicketData?.country} onChange={handleOnChange}>
                                                <option>Select country</option>
                                                {
                                                    countries && countries.map((e) => (
                                                        <option key={e.code} value={e.code} data-object={JSON.stringify(e)}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{masterTicketDataError.country ? masterTicketDataError.country : ""}</span>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default CreateEditMasterTicketDetails;