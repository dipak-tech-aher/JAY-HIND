import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { string, object } from "yup";
import { RegularModalCustomStyles } from '../../common/util/util';
import { properties } from "../../properties";
import { get, put, post } from "../../common/util/restUtil";

const AddEditOrgOuDeptModal = (props) => {

    const { isOpen, unitType, data,  orgList, ouList } = props?.data
    const { setIsOpen, softRefresh } = props?.handler
    const [businessUnitData,setBusinessUnitData] = useState({
        unitName: '',
        unitId: '',
        unitType: unitType,
        unitDesc: '',
        parentUnit: ''
    })
    const [parentUnitList,setParentUnitList] = useState([])
    const [rolesList,setRolesList] = useState([])
    const [deptRoles, setDeptRoles] = useState()
    const [error,setError] = useState({})

    const unitDetailsValidationSchema = object().shape({
        unitName: string().required("Please Enter Unit Name"),
        unitDesc: string().required("Please Enter Unit Description"),
        parentUnit: unitType !== 'ORG' ? string().required("Please Select Parent Unit") : string().nullable(true),
    })
    
    useEffect(() => {
        if(unitType === 'OU') {
            setParentUnitList(orgList)
        } else if(unitType === 'DEPT') {
            setParentUnitList(ouList)
        }
        if(data.mode === 'EDIT') {
            setBusinessUnitData({
                ...businessUnitData,
                ...data
            })
        }
    },[])

    useEffect(() => {
        get(`${properties.ROLE_API}`).then(resp => {
          if (resp.data) {
            setRolesList(resp.data.map((role) => { return  { "id": role.roleId, "label": role.roleName, "value": role.roleDesc }}))
            if(data.mode === 'EDIT') {
                const defaultRoles = data?.mappingPayload?.unitroleMapping || [];
                setDeptRoles(resp.data.filter((x) => defaultRoles.includes(x.roleId)).map((role) => { return  { "id": role.roleId, "label": role.roleName, "value": role.roleDesc }})) 
            } else {
                setDeptRoles([])
            }
          }
        }).catch((error) => {
            console.log(error)
        })
        .finally()
    }, [])

    const handleRoleChange = (selectedOptions) => {
        setDeptRoles(selectedOptions)
    }

    const handleChange = (e) => {
        const { target } = e
        setBusinessUnitData({
            ...businessUnitData,
            [target.id]: target.value
        })
        setError({
            ...error,
            [target.id]: ""
        })
    }

    const validate = (schema, data) => {
        try {
            setError({})
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleSubmit = () => {
        const error = validate(unitDetailsValidationSchema, businessUnitData);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        const reWhiteSpace = new RegExp("\\s+")
        if (reWhiteSpace.test(businessUnitData.unitName)) {
            toast.error("Unit Name Cannot Have Space");
            return 'true';
        }

        let reqBody = {}
        if (data?.mode === 'CREATE') {
            reqBody = {
                unitId: unitType === 'ORG' ? businessUnitData.unitName.toUpperCase() : businessUnitData.parentUnit + '.' + businessUnitData.unitName.toUpperCase(),
                unitName: businessUnitData.unitName,
                unitDesc: businessUnitData.unitDesc,
                unitType: businessUnitData.unitType,
                parentUnit: unitType === 'ORG' ?  null : businessUnitData.parentUnit,
                mappingPayload: { unitroleMapping: deptRoles?.map((x) => Number(x.id)) },
            }
        } else {
            reqBody = {
                unitId: businessUnitData.unitId,
                unitName: businessUnitData.unitName,
                unitDesc: businessUnitData.unitDesc,
                unitType: businessUnitData.unitType,
                parentUnit: businessUnitData.parentUnit,
                mappingPayload: { unitroleMapping: deptRoles?.map((x) => Number(x.id)) },
            }
        }
        console.log('reqBody',reqBody)
        if (data?.mode === 'CREATE') {
            post(properties.ORGANIZATION + '/create', reqBody)
                .then((resp) => {
                    if (resp) {
                        if (resp.status === 200) {
                            toast.success(resp.message);
                            setIsOpen(false)
                            softRefresh()
                        } else {
                            toast.error(resp.message);
                        }
                    }
                }).catch((error) => {
                    console.log(error)
                }).finally();
        } else {
            put(properties.ORGANIZATION + "/update/" + data.unitId, reqBody)
                .then((resp) => {
                    if (resp) {
                        if (resp.status === 200) {
                            toast.success(resp.message);
                            setIsOpen(false)
                            softRefresh()
                        } else {
                            toast.error(resp.message);
                        }
                    }
                }).catch((error) => {
                    console.log(error)
                }).finally();
        }
    }

    return (
        <ReactModal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
            <div className="modal-center" id="followhistoryModal" tabIndex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                <div className="modal-dialog " role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="followupModal">Business Unit</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className={`skel-form-heading-bar mt-2`}>
                                <span className="messages-page__title">{data?.mode === 'CREATE' ? 'Add' : 'Edit' } {unitType === 'ORG' ? 'Organization' : unitType === 'OU' ? 'Operation Unit' : 'Department'}</span>
                            </div>
                            <div className={`cmmn-skeleton skel-br-tp-r0`}>
                                <div className="form-row px-0 py-0 mt-1">
                                    {/* <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="unitType" className="control-label">Unit Type</label>
                                            <span className="d-flex">{unitType}</span>
                                        </div>
                                    </div> */}
                                    {
                                        unitType !== 'ORG' &&
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="parentUnit" className="control-label">Parent Unit <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <div className="custselect">
                                                    <select className={`form-control ${error.parentUnit ? "input-error" : ""}`} id="parentUnit" onChange={handleChange} value={businessUnitData.parentUnit}>
                                                        <option value={null}>Select Parent Unit</option>
                                                        {
                                                            parentUnitList.map((e, k) => (
                                                                <option key={k} value={e.unitId}>{e.unitDesc}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    {error.parentUnit ? <span className="error-msg">{error.parentUnit}</span> : ""}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="unitName" className="control-label">Unit Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" id="unitName" /*readOnly={true}*/ className={`form-control ${error.unitName ? "input-error" : ""}`} onChange={handleChange} value={businessUnitData.unitName}/>
                                            {error.unitName ? <span className="error-msg">{error.unitName}</span> : ""}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="unitDesc" className="control-label">Unit Description <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" id="unitDesc" className={`form-control ${error.unitDesc ? "input-error" : ""}`} onChange={handleChange} value={businessUnitData.unitDesc}/>
                                            {error.unitDesc ? <span className="error-msg">{error.unitDesc}</span> : ""}
                                        </div>
                                    </div>
                                    {
                                        unitType !== 'ORG' && deptRoles && 
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <div className="">
                                                    <label htmlFor="udesc" className="control-label">Map Roles<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <Select
                                                        closeMenuOnSelect={false}
                                                        defaultValue={deptRoles.length === 0 ? [] : deptRoles}
                                                        value={deptRoles}
                                                        options={rolesList}
                                                        getOptionLabel={option => `${option.label}: ${option.value}`}
                                                        onChange={handleRoleChange}
                                                        isMulti
                                                        isClearable
                                                        name="roles"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12 pl-2">
                            <div className="form-group pb-1">
                                <div className="text-center">
                                    <button type="button" className="skel-btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                                    <button type="button" className="skel-btn-submit" onClick={handleSubmit}>{data?.mode === 'CREATE' ? 'Add' : 'Edit' }</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ReactModal>
    )
}

export default AddEditOrgOuDeptModal