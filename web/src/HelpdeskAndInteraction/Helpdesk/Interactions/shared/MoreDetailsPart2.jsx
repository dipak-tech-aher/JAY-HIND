import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import { properties } from '../../../../properties';
import { post, get } from '../../../../common/util/restUtil';
import { formatISODateDDMMMYY } from '../../../../common/util/dateUtil';
import DeptRoleSelect from 'react-select';

const MoreDetailsPart2 = memo((props) => {
    const { detailedViewItem, ticketDetailsInputs = {}, workFlowEntityTypes = {}, readOnly = false } = props.data;
    const { handleOnTicketDetailsInputsChange = () => { }, setTicketDetailsInputs = () => { }, setWorkFlowEntityTypes = () => { } } = props.handlers;

    const [entityTypes, setEntityTypes] = useState({
        problemType: [],
        problemCause: []
    });

    const deptRoleMasterOptions = useRef([])
    const [deptRoleOptions, setDeptRoleOptions] = useState([])
    const [statusOptions, setStatusOptions] = useState([])
    const [fieldAccess, setFieldAccess] = useState(false)

    // console.log('detailedViewItem', detailedViewItem)
    // console.log('ticketDetailsInputs', ticketDetailsInputs)
    // const getLookupData = useCallback(() => {
        
    //     post(properties.BUSINESS_ENTITY_API, ['PROBLEM_TYPE', 'PROBLEM_CAUSE'])
    //         .then((response) => {
    //             const { data } = response;
    //             setEntityTypes({
    //                 problemType: data['PROBLEM_TYPE'],
    //                 problemCause: data['PROBLEM_CAUSE']
    //             });
    //         })
    //         .catch(error => {
    //             console.error(error);
    //         })
    //         .finally()
    // }, [])

    const getStatusRole = useCallback(() => {
        
        get(`${properties.WORKFLOW_DEFN_API}/get-status?entityId=${detailedViewItem?.intxnUuid}&entity=INTERACTION`)
            .then((response) => {
                const { status, data } = response;
                if (status === 200) {
                    if (data?.entities?.length) {
                        let deptRoleLocal = []
                        for(let e of data.entities) {
                          
                            let found = false
                            for(let d of deptRoleLocal) {
                                if(e.entity[0].unitId === d.unitId) {
                                    if(!d.options) {
                                        d.options = []
                                    }
                                    d.options.push({
                                        label: e.roles[0].roleName,
                                        value: e.roles[0].roleId,
                                        unitId: e.entity[0].unitId
                                    })
                                    found = true
                                }
                            }
                            if(!found) {
                                deptRoleLocal.push({
                                    label: e.entity[0].unitName,
                                    unitId: e.entity[0].unitId,
                                    options: [{
                                        label: e.roles[0].roleName,
                                        value: e.roles[0].roleId,
                                        unitId: e.entity[0].unitId
                                    }]
                                })
                            
                        }
                    }
                        // console.log('deptRoleOptions', deptRoleLocal)
                        deptRoleMasterOptions.current = data.entities
                        setDeptRoleOptions(deptRoleLocal)
                        // let entities = data?.entities[0];
                        // console.log('entities.status', entities?.status)
                        // unstable_batchedUpdates(() => {
                        //     setWorkFlowEntityTypes({
                        //         ...workFlowEntityTypes,
                        //         status: entities?.status,
                        //         role: entities?.roles
                        //     })
                        //     setTicketDetailsInputs({
                        //         ...ticketDetailsInputs,
                        //         dept: entities?.entity[0]?.unitId,
                        //         flwId: data?.flwId,
                        //         transactionName: data?.transactionName
                        //     })
                        // })
                    }
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [detailedViewItem?.intxnId])

    // useEffect(() => {
    //     if (readOnly === false) {
    //         getLookupData();
    //     }
    // }, [getLookupData, readOnly])

    useEffect(() => {
        if (readOnly === false) {
            getStatusRole();
        }
    }, [getStatusRole, readOnly, detailedViewItem?.intxnId])

    return (
        <>
            <div className="row col-12 pt-1">
                {/* <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="ticketNo" className="col-form-label">Interaction Number</label>
                        <p>{detailedViewItem?.intxnId}</p>
                    </div>
                </div> */}
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="ticketType" className="col-form-label">Interaction Type</label>
                        <p>{detailedViewItem?.srType?.description}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="serviceOrProduct" className="col-form-label">Problem Code</label>
                        <p>{detailedViewItem?.problemCodeDescription?.description}</p>
                    </div>
                </div>
                {fieldAccess && <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="serviceOrProduct" className="col-form-label">Problem Category</label>
                        <p>{detailedViewItem?.categoryDescription?.description}</p>
                    </div>
                </div>}
                {fieldAccess && <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="problemType" className="col-form-label">Problem Type</label>
                        {
                            readOnly ? (
                                <p>{detailedViewItem?.problemTypeDescription?.description}</p>
                            )
                                : (
                                    <select id="problemType" className={`form-control pb-2 `} value={ticketDetailsInputs.problemType} onChange={handleOnTicketDetailsInputsChange}>
                                        <option value="">Select Problem Type</option>
                                        {
                                            entityTypes.problemType.map((e) => (
                                                <option key={e.code} value={e.code}>{e.description}</option>
                                            ))
                                        }
                                    </select>
                                )
                        }
                    </div>
                </div>}
                {fieldAccess && <div className="col-md-4">
                    <div className="form-group  p-0 m-0">
                        <label htmlFor="problemCause" className="col-form-label">Problem Cause</label>
                        {
                            readOnly ? (
                                <p>{detailedViewItem?.problemCauseDescription?.description}</p>
                            )
                                : (
                                    <select id="problemCause" className={`form-control pb-2 `} value={ticketDetailsInputs.problemCause} onChange={handleOnTicketDetailsInputsChange}>
                                        <option value="">Select Problem Cause</option>
                                        {
                                            entityTypes.problemCause.map((e) => (
                                                <option key={e.code} value={e.code}>{e.description}</option>
                                            ))
                                        }
                                    </select>
                                )
                        }
                    </div>
                </div>}
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="crmCustomerNo" className="col-form-label">Service Type</label>
                        <p>{detailedViewItem?.serviceTypeDesc?.description}</p>
                    </div>
                </div>
              {/*  <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="crmCustomerNo" className="col-form-label">Interaction Severity</label>
                        <p>{detailedViewItem?.sevearityDescription?.description}</p>
                    </div>
                </div>
                
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="ticketServiceType" className="col-form-label">Service Category</label>
                        <p></p>
                    </div>
                </div>
                
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="ticketUserLocation" className="col-form-label">Interaction Location</label>
                        <p>{detailedViewItem?.locationDescription?.description}</p>
                    </div>
                </div>*/}
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="serviceOrProduct" className="col-form-label">Interaction Channel</label>
                        <p>{detailedViewItem?.channleDescription?.description}</p>
                    </div>
                </div>
                {/* <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="ticketSource" className="col-form-label">Interaction Source</label>
                        <p>{detailedViewItem?.sourceDescription?.description}</p>
                    </div>
                </div> */}
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="ticketPriority" className="col-form-label text-capitlize">Interaction Priority</label>
                        <p>{detailedViewItem?.priorityDescription?.description}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="preference" className="col-form-label">Contact Preference</label>
                        <p>{detailedViewItem?.cntPreferDescription?.description}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="createdOn" className="col-form-label">Created On</label>
                        <p>{formatISODateDDMMMYY(detailedViewItem?.createdAt)}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="createdBy" className="col-form-label">Created By</label>
                        <p>{detailedViewItem?.userId?.firstName} {detailedViewItem?.userId?.lastName}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="currStatus" className="col-form-label"> Current Status</label>
                        <p>{detailedViewItem?.currStatusDesc?.description}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="currDeptRole" className="col-form-label">Current Deptarment/Role</label>
                        <p>{detailedViewItem?.departmentDetials?.unitName}-{detailedViewItem?.roleDetails?.roleName}</p>
                    </div>
                </div>
            </div>
            {
                !readOnly &&
                <div className='row'>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="role" className="col-form-label">Assign to Department/Role</label>
                            <DeptRoleSelect
                                id="DeptRoleSelect"
                                options={deptRoleOptions}
                                isMulti={false}
                                isClearable={true}
                                onChange={(selectedValue) => {
                                    // console.log('selectedValue', selectedValue, deptRoleMasterOptions.current)
                                    let localStatus = []
                                    if(selectedValue && selectedValue !== null ) {
                                        for(let e of deptRoleMasterOptions.current) {
                                            if(e.entity[0].unitId === selectedValue.unitId && e.roles[0].roleId === selectedValue.value) {
                                                localStatus = [
                                                    ...e.status
                                                ]
                                            }
                                        }
                                        setTicketDetailsInputs({
                                            ...ticketDetailsInputs,
                                            dept: selectedValue.unitId,
                                            role: selectedValue.value,
                                        })
                                    } else {
                                        setTicketDetailsInputs({
                                            ...ticketDetailsInputs,
                                            dept: null,
                                            role: null
                                        })
                                    }
                                    setStatusOptions(localStatus)
                                }}
                            />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="currStatus" className="col-form-label">Choose Status</label>
                            <select id="currStatus"
                                value={ticketDetailsInputs.currStatus}
                                onChange={(e) => {
                                    setTicketDetailsInputs({
                                        ...ticketDetailsInputs,
                                        currStatus: e.target.value
                                    })
                                }}
                                className={`form-control`}>
                                <option key="status">Select Status</option>
                                {
                                    (statusOptions && statusOptions.length > 0)?
                                        statusOptions.map((s) => <option key={s.code} value={s.code}>{s.description}</option>)
                                        :
                                        <></>
                                }
                            </select>
                        </div>
                    </div>                    
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="user" className="col-form-label">Assign To User</label>
                            <select id="user"
                                value={ticketDetailsInputs.user}
                                onChange={handleOnTicketDetailsInputsChange}
                                className="form-control">
                                <option key="user" value="">Select User</option>
                                {
                                    workFlowEntityTypes?.user?.map((e) => (
                                        <option key={e.userId} value={e.userId}>{e.firstName} {e.lastName}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    <div className="col-12 mt-2 pl-2">
                        <div className="form-group ">
                            <label htmlFor="remarks" className="col-form-label pt-0">Add Additional Remarks</label>
                            <textarea
                                value={ticketDetailsInputs.remarks}
                                onChange={handleOnTicketDetailsInputsChange}
                                maxLength="2500" className="form-control" id="remarks" name="remarks" rows="4"></textarea>
                            <span>Maximum 2500 characters</span>
                        </div>
                    </div>
                </div>
            }
            <hr />
        </>
    )
})

export default MoreDetailsPart2;