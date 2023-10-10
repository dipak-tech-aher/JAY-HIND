import React, { useState, useEffect } from 'react';
import Switch from "react-switch";
import { properties } from "../../properties";
import { post, get } from "../../common/util/restUtil";
import { toast } from "react-toastify";
import { string, object, number } from "yup";
import { useTranslation } from "react-i18next";
import UserLevelPermission from './userLevelPermission';
import { Toggle } from 'rsuite';

const validationSchema = object().shape({
    roleName: string().required("Please enter role name"),
    roleDesc: string().required("Please enter role description"),
    roleFamilyId: number().required("Please select role family").typeError('Please select role family'),
});

const SaveRole = (props) => {
    const { roleFamilies, modules } = props
    const { t } = useTranslation();
    const [error, setError] = useState({});
    const [state, setState] = useState(false);
    const [selectedModules, setSelectedModules] = useState([]);
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

    // useEffect(() => {
    //     get(properties.ROLE_API + "/modules")
    //         .then((resp) => {
    //             if (resp.data && resp.data.length > 0) {
    //                 array = resp.data
    //                 array.map((node) => {
    //                     node["accessType"] = "allow";
    //                 })
    //                 let id = 1;
    //                 temp = []
    //                 array.map((node) => {
    //                     let found = false;
    //                     if (temp.length > 0) {
    //                         temp.map((child) => {
    //                             if (child === node.moduleName) {
    //                                 found = true
    //                             }
    //                         })
    //                     }
    //                     if (found === false) {
    //                         temp.push(node.moduleName)
    //                     }
    //                 })
    //                 let i = 0;
    //                 temp.map((module) => {
    //                     let j = 2
    //                     let item = [];
    //                     array.map((node) => {
    //                         if (temp[i] === node.moduleName) {
    //                             item.push({ label: node.screenName, id: j, accessType: "allow" })
    //                             j = j + 1;
    //                         }
    //                     })
    //                     array2.push({ label: module, id: i + 1, item: item })
    //                     i = i + 1;
    //                 })
    //                 setPermissionMasterData(array2)

    //             }
    //             else {
    //                 toast.error("Error while getting permission")
    //             }
    //         })
    //         .finally()
    // }, [])

    const choosePermission = (parentKey, childKey, permission) => {
        if (parentKey !== null && parentKey !== undefined && parentKey !== "") {
            setPermissionMasterData((prevState) => {
                prevState[parentKey]['item'][childKey]['accessType'] = permission;
                return [...prevState];
            })
        }
    }

    const addOrRemove = (arr, value) => {
        console.log(arr, value);
        let index = arr.indexOf(value);

        if (index === -1) {
            arr.push(value);
        } else {
            arr.splice(index, 1);
        }

        setSelectedModules([...arr]);
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
                    <button className="close-btn" style={{ top: '-8px' }} onClick={() => props.setDisplay(false)} >&times;</button>
                </div>
                <div className="modal-body">
                    <div className="skel-config-base">
                        <div className="skel-config-data">
                            <div className="row p-3">
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label for="rname" className="control-label">Role Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                        <input className="form-control" id="rname" placeholder="" type="text" />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label for="rdesc" className="control-label">Role Description <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                        <input className="form-control" id="rdesc" placeholder="" type="text" />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label for="rfamily" className="control-label">Role Family <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                        <select className='form-control' onChange={(e) => console.log()} >
                                            <option>Select Role Family</option>
                                            {roleFamilies?.map((e, i) => (
                                                <option value={e.value} key={i}>{e.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* <div className="col-md-3">
                                    <div className="form-group">
                                        <label for="isAdmin" className="control-label">Is Admin <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                        <Switch onChange={handleChange} checked={data.isAdmin} />
                                    </div>
                                </div> */}
                                <hr className="cmmn-hline" />
                                <div className="col-md-12 mt-2">
                                    <div className="form-group">
                                        <label for="maprole" className="control-label">Select Modules <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div class='row mt-0 pl-2'>
                                        {Object.keys(modules)?.map((module, idx) => (
                                            <div className="col-md-3" key={module}>
                                                <div className="form-group">
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            checked={selectedModules.includes(module)}
                                                            id={`${module}-module-${idx}`}
                                                            onChange={e => addOrRemove(selectedModules, module)}
                                                        />
                                                        <label className="custom-control-label" for={`${module}-module-${idx}`}>{module}</label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="tabbable-responsive">
                            <div className="tabbable mt-2">
                                {selectedModules?.length > 0 && (
                                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                                        {selectedModules?.map((selectedModule, idx) => (
                                            <li className="nav-item" key={idx}>
                                                <a class={`nav-link ${idx === 0 ? 'active' : ''}`}
                                                    id={`${selectedModule}-tab`}
                                                    data-toggle="tab"
                                                    href={`#${selectedModule}tab`}
                                                    role="tab"
                                                    aria-controls={`#${selectedModule}tab`}
                                                    aria-selected="true"
                                                    onClick={(e) => {
                                                        document.querySelectorAll(".skel-tabs-role").forEach(el => el.classList.remove("show", "active"))
                                                        document.getElementById(`#${selectedModule}tab-old`)?.classList?.add("show", "active")
                                                        document.getElementById(`#${selectedModule}tab-new`)?.classList?.add("show", "active")
                                                    }}
                                                >
                                                    {selectedModule}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {selectedModules?.length > 0 && (
                                <div className="card-body">
                                    <div className="tab-content">
                                        {selectedModules?.map((selectedModule, idx1) => (
                                            <div key={idx1} class={`tab-pane fade skel-tabs-role ${idx1 === 0 ? 'show active' : ''} mb-2`} id={`#${selectedModule}tab-old`} role="tabpanel" aria-labelledby={`${selectedModule}-tab`}>
                                                <span>{selectedModule}</span>
                                                <div className="skel-role-base">
                                                    {modules[selectedModule]?.map((action, idx2) => (
                                                        <div className="skel-tabs-role-config" style={{ display: 'flex' }}>
                                                            <div className="skel-app-tile">{action.screenName}</div>
                                                            <Toggle
                                                                size="lg"
                                                                checkedChildren="Allow"
                                                                unCheckedChildren="Deny"
                                                                onChange={(e) => console.log(e)}
                                                                className={'skel-role-status-switch'}
                                                            />
                                                            <div className="skel-crud-sect">
                                                                <div className="col-md-12">
                                                                    <div class='row mt-0'>
                                                                        <div className="col-md-3">
                                                                            <div className="form-group">
                                                                                <div className="custom-control custom-checkbox">
                                                                                    <input type="checkbox" className="custom-control-input" id="Create" checked="" />
                                                                                    <label className="custom-control-label" for="Create">Create</label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-3">
                                                                            <div className="form-group">
                                                                                <div className="custom-control custom-checkbox">
                                                                                    <input type="checkbox" className="custom-control-input" id="Read" checked="" />
                                                                                    <label className="custom-control-label" for="Read">Read</label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-3">
                                                                            <div className="form-group">
                                                                                <div className="custom-control custom-checkbox">
                                                                                    <input type="checkbox" className="custom-control-input" id="Update" checked="" />
                                                                                    <label className="custom-control-label" for="Update">Update</label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-3">
                                                                            <div className="form-group">
                                                                                <div className="custom-control custom-checkbox">
                                                                                    <input type="checkbox" className="custom-control-input" id="Delete" checked="" />
                                                                                    <label className="custom-control-label" for="Delete">Delete</label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedModules?.length > 0 && (
                                <div className="card-body">
                                    <div className="tab-content">
                                        {selectedModules?.map((selectedModule, idx1) => (
                                            <div key={idx1} class={`tab-pane fade skel-tabs-role ${idx1 === 0 ? 'show active' : ''}`} id={`#${selectedModule}tab-new`} role="tabpanel" aria-labelledby={`${selectedModule}-tab`}>
                                                <div className="skel-role-base">
                                                    <div className="skel-tabs-role-config">
                                                        <div className="skel-crud-sect">
                                                            <div className="col-md-12">
                                                                <div class='row mt-0'>
                                                                    {modules[selectedModule]?.map((action, idx2) => (
                                                                        <div className="col-md-3 mb-2 mt-2" key={idx2}>
                                                                            <div className="form-group">
                                                                                <div className="custom-control custom-checkbox">
                                                                                    <input type="checkbox" className="custom-control-input" id={`${selectedModule}-${action.screenName}`} onChange={(e) => console.log(e)} />
                                                                                    <label className="custom-control-label" for={`${selectedModule}-${action.screenName}`}>{action.screenName}</label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SaveRole;