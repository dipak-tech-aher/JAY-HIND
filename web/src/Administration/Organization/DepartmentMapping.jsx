/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { properties } from "../../properties";
import { get, put } from "../../common/util/restUtil";
import Select from 'react-select';

import { toast } from "react-toastify";

const DepartmentMapping = (props) => {

  let deptRoleList = []
  const [deptRoles, setDeptRoles] = useState([])
  const [selectedRoles, setSelectedRoles] = useState({});
  const [data, setData] = useState([]);
  const [length, setLength] = useState()
  const selectUnit = props.selectUnit
  const [check, setCheck] = useState(false)
  let roleDetails = []
  let roles = [];

  useEffect(() => {
    
    setData(props.data)
    get(`${properties.ROLE_API}`).then(resp => {
      if (resp.data) {
        roleDetails = resp.data;
        roleDetails.map((role) => {
          roles.push({ "id": role.roleId, "label": role.roleName, "value": role.roleDesc })
        })
        roleDetails = roles;
        setData([...roleDetails])
      }
    }).catch((error) => {
      console.log(error)
  })
      .finally()
  }, [props.mode, check]);

  useEffect(() => {
    setDeptRoles([])
    setLength(0)
    deptRoleList = []
    let defaultRoles = []
    
    get(properties.ORGANIZATION + "/search/" + props.currentNode.unitId)
      .then((resp) => {
        if (resp.data.mappingPayload && resp.data.mappingPayload != null && resp.data.mappingPayload.unitroleMapping !== null) {
          defaultRoles = resp.data.mappingPayload.unitroleMapping;
        }
        if (defaultRoles.length > 0) {
          if (props.data.length > 0) {
            defaultRoles.map((role) => {
              props.data.map((node) => {
                if (node.id === role) {
                  deptRoleList.push({ "id": node.id, "label": node.label, "value": node.value })
                  setDeptRoles(deptRoleList)
                  setLength(deptRoleList.length)
                }
              })
            })
          }
          handleChange(deptRoleList)
          setCheck(!check)
        }
        else {
          setDeptRoles([])
          setLength(0)
          setCheck(!check)
        }
      })
      .catch((error) => {
        setDeptRoles([])
        setLength(0)
        setCheck(!check)
      })
      .finally()

  }, [props.mode])

  const handleChange = (selectedOptions) => {
    let roles = [];
    if (selectedOptions.length > 0) {
      selectedOptions.map(item => {
        roles.push(item.id)
      });
    }
    setSelectedRoles(roles);
    setDeptRoles(selectedOptions)
  }

  const handleCancel = () => {
    selectUnit('')
  }

  const handleSubmit = (e) => {
    let data = {}
    data['mappingPayload'] = { "unitroleMapping": selectedRoles }
    data['unitId'] = props.currentNode.unitId
    data['unitDesc'] = props.currentNode.unitDesc
    data['unitName'] = props.currentNode.unitName
    data['unitType'] = props.currentNode.unitType
    data['parentUnit'] = props.currentNode.parentUnit
    
    put(properties.ORGANIZATION + "/update/" + props.currentNode.unitId, data)
      .then((resp) => {
        if (resp.status === 200) {
          toast.success(resp.message);
        }
      })
      .catch((error) => {
        console.error(error)
      })
      .finally();
  }

  return (
    <div style={{ width: "100%", marginLeft: "0px" }}>
      <div className="row" style={{ marginLeft: "0px" }}>

        <div className="row depart">
          <div className="col-12 pt-2">
            <section className="triangle"><h4 id="list-item-1" className="pl-2">Department Mapping Details</h4></section>
          </div >
        </div >
      </div >
      <br></br>
      <div className="row field-set mb-3 new-customer" >
        <div className="col-md-5" >
          <div className="form-group">
            <label className="control-label">Unit Name</label>
            <p><b>{props.currentNode.unitName}</b></p>
          </div>
        </div >
        <div className="col-md-7" >
          <div className="form-group">
            <label className="control-label">Unit Description</label>
            <p><b>{props.currentNode.unitDesc}</b></p>
          </div>
        </div >
        <div className="col-md-3" >
          <div className="form-group">
            <label className="control-label">Parent Unit Name</label>
            <p><b>{props.parentUnitName}</b></p>
          </div>
        </div >
        <div className="col-md-3" >
          <div className="form-group">
            <label className="control-label">Unit Type</label>
            <p><b>{props.currentNode.unitType}</b></p>
          </div>
        </div >
      </div >
      <fieldset className="scheduler-border dep-role" >
        <div className="row pt-2" >
          <div className="col-12 pl-2 bg-light border" > <h5 className="text-primary" > Department Role Mapping</h5 > </div >
        </div >
        <br></br>
         <form className="d-flex justify-content-center" >
          <div style={{ width: "100%" }}>
            { deptRoles &&
              <Select
                closeMenuOnSelect={false}

                menuPortalTarget={document.body} 
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                
                defaultValue={deptRoles.length === 0 ? [] : deptRoles}
                value={deptRoles}
                options={data}
                getOptionLabel={option => `${option.label}: ${option.value}`}
                onChange={handleChange}
                isMulti
                isClearable
                name="roles"
              />
            }
            </div>
        </form>       
      </fieldset >
      <div style={{ display: "flex", justifyContent: "center" }}>        
      <button className="skel-btn-cancel" type="button" onClick={handleCancel}>Cancel</button>
        <button className="skel-btn-submit" type="button" onClick={handleSubmit} >Map</button>
      </div>
    </div >
  );
}
export default DepartmentMapping;