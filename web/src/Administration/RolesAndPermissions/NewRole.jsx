import React, { useState, useEffect } from 'react';
import Switch from "react-switch";
import { properties } from "../../properties";
import { post, get } from "../../common/util/restUtil";
import { toast } from "react-toastify";
import { string, object, number } from "yup";
import { useTranslation } from "react-i18next";

import UserLevelPermission from './userLevelPermission';
const validationSchema = object().shape({
    roleName: string().required("Please enter role name"),
    roleDesc: string().required("Please enter role description"),
    roleFamilyId: number().required("Please select role family").typeError('Please select role family'),
});

const NewRole = (props) => {
    const { roleFamilies } = props
    const { t } = useTranslation();
    const [error, setError] = useState({});
    const [state, setState] = useState(false);
    const [permissionMasterData, setPermissionMasterData] = useState({});
    const [data, setData] = useState({

        roleName: "",
        roleDesc: "",
        roleFamilyId: "",
        isAdmin: false,
        mappingPayload: "",
        status: "AC"
    })
    const handleClear = () => {
        setData({ ...data, roleName: "", roleDesc: "", roleFamilyId: "", isAdmin: false, mappingPayload: "", status: 'AC' })
    }

    let array = []
    let temp = [];
    let array2 = []

    useEffect(() => {
        get(properties.ROLE_API + "/modules")
            .then((resp) => {
                if (resp.data && resp.data.length > 0) {
                    array = resp.data
                    array.map((node) => {
                        node["accessType"] = "allow";
                    })
                    let id = 1;
                    temp = []
                    array.map((node) => {
                        let found = false;
                        if (temp.length > 0) {
                            temp.map((child) => {
                                if (child === node.moduleName) {
                                    found = true
                                }
                            })
                        }
                        if (found === false) {
                            temp.push(node.moduleName)
                        }
                    })
                    let i = 0;
                    temp.map((module) => {
                        let j = 2
                        let item = [];
                        array.map((node) => {
                            if (temp[i] === node.moduleName) {
                                item.push({ label: node.screenName, id: j, accessType: "allow" })
                                j = j + 1;
                            }
                        })
                        array2.push({ label: module, id: i + 1, item: item })
                        i = i + 1;
                    })
                    setPermissionMasterData(array2)

                }
                else {
                    toast.error("Error while getting permission")
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }, [])

    const choosePermission = (parentKey, childKey, permission) => {

        if (parentKey !== null && parentKey !== undefined && parentKey !== "") {
            setPermissionMasterData((prevState) => {
                prevState[parentKey]['item'][childKey]['accessType'] = permission;
                return [...prevState];
            })
        }


    }
    const handleChange = (checked) => {
        setState(checked)
        setData({ ...data, isAdmin: checked })
    }

    const validate = () => {
        try {
            validationSchema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const onHandleSubmit = () => {
        const error = validate(validationSchema, data);
        if (error) return;
        let mappingScreen = [];
        permissionMasterData.map((value) => {
            let list = []
            value.item.map((o) => {
                list.push({ screenName: o.label, accessType: o.accessType, api: o.api, method: o.method })
            })
            let temp = value.label
            let obj = {}
            obj[temp] = list
            mappingScreen.push(obj)
        })
        data["mappingPayload"] = { "permissions": mappingScreen }
        post(properties.ROLE_API + '/create', data)
            .then((resp) => {
                if (resp.status === 200) {
                    toast.success("Role created successfully")
                }
                else {
                    toast.error("Error while creating role")
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally(() => { props.setDisplay(false) });
    }

    return (

        <div className="">
            <div className="modal-content">
                <div className="modal-header">
                    <h4 className="modal-title">Create Role</h4>
                    {/* <button className="close-btn" data-dismiss="modal" aria-label="Close" type="button">&times;</button> */}
                </div>
                <div className="modal-body">
                    <fieldset className="scheduler-border">
                        <form className="col-md-12 justify-content-center">
                            <div className="row col-12">
                                <div style={{ paddingLeft: "0px", paddingRight: "12px" }} className="col-md-3">
                                    <label>Role Name <span className="text-danger">*</span></label>
                                    <input onChange={(e) => setData({ ...data, roleName: e.target.value })}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter") onHandleSubmit();
                                        }}
                                        id="roleName" value={data.roleName} className="form-control" type="text" required="" placeholder="Role Name" />
                                    {error.roleName ? <p className="error-msg">{error.roleName}</p> : ""}
                                </div>
                                <div style={{ paddingLeft: "12px", paddingRight: "12px" }} className="col-md-3">
                                    <label>Role Family <span className="text-danger">*</span></label>
                                    <select className='form-control' onChange={(e) => setData({ ...data, roleFamilyId: e.target.value })} >
                                        <option value="">Select Role Family</option>
                                        {roleFamilies?.map((e, i) => (
                                            <option value={e.value} key={i}>{e.label}</option>
                                        ))}
                                    </select>
                                    {error.roleFamilyId ? <p className="error-msg">{error.roleFamilyId}</p> : ""}
                                </div>
                                <div style={{ paddingLeft: "12px", paddingRight: "12px" }} className="col-md-3">
                                    <label >Role Description <span className="text-danger">*</span></label>
                                    <input onChange={(e) => setData({ ...data, roleDesc: e.target.value })}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter") onHandleSubmit();
                                        }} id="roleDesc" value={data.roleDesc} className="form-control" type="text" required="" placeholder="Role Description" />
                                    {error.roleDesc ? <p className="error-msg">{error.roleDesc}</p> : ""}
                                </div>
                                {/* <div style={{ paddingLeft: "12px", paddingRight: "12px" }} className="col-md-3">
                                    <label >Is Admin</label>
                                    <Switch onChange={handleChange} checked={data.isAdmin} />
                                    {error.roleName ? <p className="error-msg">     </p> : ""}
                                </div> */}
                            </div>
                        </form>
                        <div className=" pt-2"><div className="col-12 pl-2 bg-light border"><h5 className="text-primary">Set Role Level Permission</h5> </div></div>
                        <UserLevelPermission setPermissionMasterData={setPermissionMasterData} cPermission={choosePermission} permissionMasterData={permissionMasterData}></UserLevelPermission>
                    </fieldset>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <button className="skel-btn-cancel" type="button" onClick={handleClear}>Clear</button>
                        <button className="skel-btn-submit" onClick={onHandleSubmit}>{t("Add")}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default NewRole;