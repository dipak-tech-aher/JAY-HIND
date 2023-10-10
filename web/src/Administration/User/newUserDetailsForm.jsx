import { useEffect, useState, useRef } from 'react';
import { string, object } from "yup";
import Modal from 'react-modal';
import Select from 'react-select'
import { properties } from "../../properties";
import { put, get, post } from "../../common/util/restUtil";

import { toast } from "react-toastify";
import { isObjectEmpty } from '../../common/util/validateUtil';
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment';
import Switch from "react-switch";


const validationSchema = object().shape({
    activationDate: string().required("Please enter activation date"),
    loc: string().required("Please select location"),
    userType: string().required("Please select user type"),
    status: string().required("Please select status"),
});
Modal.setAppElement('body');

const UserDetailsForm = (props) => {
    const userPermission = props?.userPermission
    const refresh = props?.refresh
    const setRefresh = props?.setRefresh
    const setUpdate = props?.setUpdate
    const isOpen = props?.isOpen
    const [userData, setUserData] = useState(props?.userData)
    const [departments, setDepartments] = useState()
    const [permissionMasterData, setPermissionMasterData] = useState({});
    const [rolesData, setRolesData] = useState([])
    const [error, setError] = useState()
    const [selectedRoles, setSelectedRoles] = useState({});     
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedUserFamily, setSelectedUserFamily] = useState([]);
    const [selectedNotificationType, setSelectedNotificationType] = useState([]);
    const [selectedRoleData, setSelectedRoleData] = useState({});
    const [locations, setLocations] = useState([])
    const [countries, setCountries] = useState([])
    const [userTypes, setUserTypes] = useState([])
    const [notificationTypes, setNotificationTypes] = useState([])
    const [userGroups, setUserGroups] = useState([]);
    const [userCategories, setUserCategories] = useState([]);
    const [userFamilies, setUserFamilies] = useState([]);
    const [userSources, setUserSources] = useState([]);    
    const [managerIds, setManagerIds] = useState([]); 
    const [userStatus, setUserStatus] = useState(true)
    const [biAccessStatus, setBiAccessStatus] = useState(false)
    const [phoneNolength, setPhoneNolength] = useState()   
    const roleDetails = useRef()
    const entityRef = useRef()

    setUserData({       
        userType: "UT_BUSINESS",
        userGroup: "UG_BUSINESS",
        userCategory: "UC_FULLTIME",
        userFamily: [],
        userSource: "US_WEBAPP",
        notificationType: [],
        country: "",
        loc: "",      
        biAccess: biAccessStatus === true ? 'Y' : 'N',
        status: userStatus === true ? 'AC' : 'IN',
        managerId: null
    })
    
    let permission = []   

    useEffect(() => {
        let temp = []

        
        setUserData({
            ...userData,
            activationDate: (props?.userData?.activationDate) ? props?.userData?.activationDate : null,
            expiryDate: (props?.userData?.expiryDate) ? props?.userData?.expiryDate : null,
        })
        get(properties.ORGANIZATION+'/search')
            .then((resp) => {
                if (resp.data && resp.data.length > 0) {
                    const departmentObject = resp.data
                    departmentObject.map((e) => {
                        temp.push({ "unitId": e?.unitId, "unitName": e?.unitName, "unitDesc": e?.unitDesc, "roles": e?.mappingPayload?.unitroleMapping || [] })
                    })
                    get(`${properties.ROLE_API}`).then(resp => {
                        if (resp.data) {
                            const roles=[]
                            roleDetails.current = resp.data;

                            roleDetails.current.map((role) => {
                                roles.push({ "roleId": role.roleId, "roleName": role.roleName, "roleDesc": role.roleDesc })
                            })
                            let departmentList = []
                            temp.map((t) => {
                                let rolesArray = []
                                t.roles.map((r) => {
                                    roleDetails.current.map((role) => {
                                        if (Number(r) === Number(role.roleId)) {
                                            rolesArray.push(role)
                                        }
                                    })
                                })
                                departmentList.push({ ...t, roles: rolesArray })
                            })

                            let mappingList = []
                            departmentList.map((d) => {
                                let obj = { "label": d.unitDesc, "value": d.unitId }
                                let options = []
                                d.roles.map((r) => {
                                    options.push(
                                        { "label": r.roleDesc, "value": { "id": r.roleId, "dept": d.unitId }, "unitId": d.unitId }
                                    )
                                })
                                obj.options = options
                                mappingList.push(obj)
                            })

                            setRolesData(mappingList)
                        }
                    }).catch((error) => {
                        console.log(error)
                    })
                    setDepartments(departmentObject)
                }
            }).catch((error) => {
                console.log(error)
            }).finally()
        
        get(`${properties.USER_API}/get-managerlist`).then(resp => {
                if (resp.status === 200) {                        
                    unstable_batchedUpdates(() => {
                        setManagerIds(resp.data);
                    })
                } 
            }).catch((error) => {
                console.log(error)
            }).finally()   
        
        get(properties.BUSINESS_ENTITY_API+'?searchParam=code_type&valueParam=CONTACT_TYPE,EMAIL_DOMAIN,CONTACT_PREFERENCE,LOCATION,USER_TYPE,COUNTRY,USER_GROUP,USER_CATEGORY,USER_FAMILY,USER_SOURCE')
            .then((resp) => {
                if (resp.data) {
                    setLocations(resp.data.LOCATION)
                    setNotificationTypes(resp.data.CONTACT_PREFERENCE)
                    setUserTypes(resp.data.USER_TYPE)
                    setCountries(resp.data.COUNTRY)
                    setUserGroups(resp.data.USER_GROUP)
                    setUserCategories(resp.data.USER_CATEGORY)
                    setUserFamilies(resp.data.USER_FAMILY)
                    setUserSources(resp.data.USER_SOURCE)

                    if (resp.data.CONTACT_PREFERENCE.length > 0) {
                        const val=[]
                        resp.data.CONTACT_PREFERENCE.map((col, i)=>{
                            const obj={
                                label: col.description,
                                value: col.code
                            }
                            val.push(obj)            
                        })
                        setNotificationTypes(val)
                    }        
                }
            }).catch((error) => {
                console.log(error)
            })
        .finally()
    
        const familyArray = [], notiArray = []
        props?.userData?.userFamily.map((e) => {
            entityRef.current.USER_FAMILY.map((f) => {
                if (f.code === e) {
                    familyArray.push({
                        label: f.description, value: f.code
                    })
                }
            })

        })

        props?.userData?.notificationType.map((e) => {
            entityRef.current.CONTACT_PREFERENCE.map((f) => {
                if (f.code === e) {
                    notiArray.push({
                        label: f.description, value: f.code
                    })
                }
            })

        })
        setSelectedUserFamily(familyArray)
        setSelectedNotificationType(notiArray)
        setPhoneNolength(entityRef.current.COUNTRY.find(ele=> ele.code === props?.userData?.country)?.mapping.phoneNolength)
    
        let arr= []
        entityRef.current.USER_SOURCE.filter(ele => { 
            if (ele.mapping?.hasOwnProperty("userGroup") && ele.mapping?.userGroup.includes(props?.userData.userGroup || 'UG_BUSINESS'))
            return ele
        }).map((col, i) => {
            const obj = {
                label: col.description,
                value: col.code
            }
            arr.push(obj)
        })            
        setUserSources(arr)

        setUserCategories(entityRef.current.USER_CATEGORY.filter(ele => { 
            if (ele.mapping?.hasOwnProperty("userGroup") && ele.mapping?.userGroup.includes(props?.userData.userGroup || 'UG_BUSINESS'))
            return ele
        }))

        setUserTypes(entityRef.current.USER_TYPE.filter(ele => { 
            if (ele.mapping?.hasOwnProperty("userGroup") && ele.mapping?.userGroup.includes(props?.userData.userGroup || 'UG_BUSINESS'))
            return ele
        }))
        
        const val=[]
        entityRef.current.USER_FAMILY.filter(ele => { 
            if (ele.mapping?.hasOwnProperty("userGroup") && ele.mapping?.userGroup.includes(props?.userData.userGroup || 'UG_BUSINESS'))
            return ele
        }).map((col, i)=>{
            const obj={
                label: col.description,
                value: col.code
            }
            val.push(obj)            
        })
        setUserFamilies(val)
    }, [props]);

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
                    if (userData.mappingPayload && userData.mappingPayload !== null && userData.mappingPayload.permissions && userData.mappingPayload.permissions.length > 0) {
                        array2.map((module) => {
                            if (permission && permission.length > 0) {
                                permission.map((node) => {
                                    let property = Object.keys(node)
                                    let value = Object.values(node)
                                    if (property[0] === module.label) {
                                        module.item.map((child) => {
                                            value[0].map((childNode) => {
                                                if (child.label === childNode["screenName"]) {
                                                    child["accessType"] = childNode["accessType"]
                                                }
                                            })
                                        })
                                    }
                                })
                            }
                        })
                    }
                    setPermissionMasterData(array2)
                }
                else {
                    toast.error("Error while getting permission")
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally();
    }, [])

    const validate = () => {
        try {
            validationSchema.validateSync(userData, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const choosePermission = (parentKey, childKey, permission) => {
        if (parentKey !== null && parentKey !== undefined && parentKey !== "") {
            setPermissionMasterData((prevState) => {
                prevState[parentKey]['item'][childKey]['accessType'] = permission;
                return [...prevState];
            })
        }
    }


    const handleSubmit = () => {
        const error = validate(validationSchema, userData);
        if (error) return;
        if (isObjectEmpty(selectedRoles)) {
            toast.error("Please select roles")
            return;
        }
        let units
        let userObject = userData
        if (userStatus === true) {
            userObject.status = 'AC'
        }
        if (!isObjectEmpty(selectedRoles)) {
            units = selectedRoles.map(item => item.unitId).filter((value, index, self) => self.indexOf(value) === index)
            let mapping = []
            units.map((u) => {
                let roles = []

                selectedRoles.map((s) => {
                    if (s.unitId === u) {
                        roles.push(s.value.id)
                    }
                })
                mapping.push({
                    "roleId": roles,
                    "unitId": u
                })
            })

            let mappingPayloadFinal = {
                "userDeptRoleMapping": mapping
            }

            userObject.mappingPayload = mappingPayloadFinal

        }

        
        put(properties.USER_API + "/approve", userObject).then((resp) => {
            if (resp.status === 200) {
                toast.success("User approved successfully")
                setRefresh(true)
                setUpdate(false)

            }
            else {
                toast.error("Error while approving user")
            }
        }).catch((error) => {
            console.log(error)
        }).finally()

    }
    const closeModal = () => {
        unstable_batchedUpdates(() => {
            setUpdate(!isOpen)
        })
    }

    const handleChange = (selectedOptions) => {

        setSelectedRoles(selectedOptions);
    }


    return (

        <Modal isOpen={isOpen} onRequestClose={() => setUpdate(false)} contentLabel="Example Modal">
            <div className="">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">New User Details</h4>
                        <button onClick={closeModal} type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div></div>
                    <div className="modal-body">
                        <fieldset className="scheduler-border">
                            <form className="d-flex justify-content-center">
                                {userData && <div className="row">

                                    <div className="col-md-3">
                                        <div className="form-group" >
                                            <label className="control-label">User Id&nbsp;<span>*</span></label>
                                            <p>{userData.userId}</p>

                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group" >
                                            <label className="control-label">Name&nbsp;<span>*</span></label>
                                            <p>{userData.firstName + " " + userData.lastName}</p>

                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group" >
                                            <label className="control-label">Gender&nbsp;<span>*</span></label>
                                            <p>{userData.gender === "M" ? "Male" : "Female"}</p>

                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">Email&nbsp;<span>*</span></label>
                                            <p>{userData.email}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <div style={{ display: "flex" }}>
                                                <div style={{ width: "25%" }}>
                                                    <label className="control-label">Prefix&nbsp;<span>*</span></label>
                                                    <p>{"+" + userData?.extn}</p>   
                                                </div>
                                                &nbsp;
                                                <div style={{ width: "75%" }}>
                                                    <label className="control-label">Contact Number&nbsp;<span>*</span></label>
                                                    <p>{userData.contactNo}</p>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    {/* <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">Country&nbsp;<span>*</span></label>
                                            <p>{userData.country}</p>
                                        </div>
                                    </div> */}
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">Location&nbsp;<span>*</span></label>
                                            <select id="contactType" className={`form-control ${(error?.loc ? "input-error" : "")}`} value={userData?.loc}
                                                onChange={(e) => {
                                                    setError({ ...error, loc: "" })
                                                    setUserData({ ...userData, loc: e.target.value })
                                                }}
                                            >
                                                <option value="">Select Location..</option>
                                                {
                                                    locations?.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            {error?.loc ? <p className="error-msg">{error?.loc}</p> : ""}

                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">User Type&nbsp;<span>*</span></label>

                                            <select id="contactType" className={`form-control ${(error?.userType ? "input-error" : "")}`} value={userData?.userType}
                                                onChange={(e) => {
                                                    setError({ ...error, userType: "" })
                                                    setUserData({ ...userData, userType: e.target.value })
                                                }}
                                            >
                                                <option value="">Select User Type..</option>
                                                {
                                                    userTypes?.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            {error?.userType ? <p className="error-msg">{error?.userType}</p> : ""}
                                        </div>
                                    </div>                                    
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">User Source&nbsp;<span>*</span></label>
                                            <select className={`form-control ${(error?.userSource ? "input-error" : "")}`}
                                                value={userData?.userSource}
                                                onChange={(e) => {
                                                    setUserData({ ...userData, userSource: e.target.value });
                                                    setError({ ...error, userSource: "" })
                                                }}>
                                                <option value="">Select user source...</option>
                                                {userSources && userSources.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))}
                                            </select>
                                            {error?.userSource ? <span className="errormsg">{error?.userSource}</span> : ""}
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">User Category&nbsp;<span>*</span></label>
                                            <select className={`form-control ${(error?.userCategory ? "input-error" : "")}`}
                                                value={userData?.userCategory}
                                                onChange={(e) => {
                                                    setUserData({ ...userData, userCategory: e.target.value });
                                                    setError({ ...error, userCategory: "" })
                                                }}>
                                                <option value="">Select user category...</option>
                                                {userCategories && userCategories.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))}
                                            </select>
                                            {error?.userCategory ? <span className="errormsg">{error?.userCategory}</span> : ""}
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">User Group&nbsp;<span>*</span></label>
                                            <select className={`form-control ${(error?.userGroup ? "input-error" : "")}`}
                                                value={userData?.userGroup}
                                                onChange={(e) => {
                                                    setUserData({ ...userData, userGroup: e.target.value });
                                                    setError({ ...error, userGroup: "" })
                                                }}>
                                                <option value="">Select user group...</option>
                                                {userGroups && userGroups.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))}
                                            </select>
                                            {error?.userGroup ? <span className="errormsg">{error?.userGroup}</span> : ""}
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">User Family&nbsp;<span>*</span></label>
                                            <select className={`form-control ${(error?.userFamily ? "input-error" : "")}`}
                                                value={userData?.userFamily}
                                                onChange={(e) => {
                                                    setUserData({ ...userData, userFamily: e.target.value });
                                                    setError({ ...error, userFamily: "" })
                                                }}>
                                                <option value="">Select user family...</option>
                                                {userFamilies && userFamilies.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))}
                                            </select>
                                            {error?.userFamily ? <span className="errormsg">{error?.userFamily}</span> : ""}
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">Notification Type&nbsp;<span>*</span></label>
                                            <select className={`form-control ${(error?.notificationType ? "input-error" : "")}`}
                                                value={userData?.notificationType}
                                                onChange={(e) => {
                                                    setUserData({ ...userData, notificationType: e.target.value });
                                                    setError({ ...error, notificationType: "" })
                                                }}>
                                                <option value="">Select notification type...</option>
                                                {notificationTypes && notificationTypes.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))}
                                            </select>
                                            {error?.notificationType ? <span className="errormsg">{error?.notificationType}</span> : ""}


                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">Manager&nbsp;<span>*</span></label>
                                          
                                            {/* <AsyncPaginate
                                                value={value}
                                                loadOptions={loadOptions}
                                                onChange={setValue}
                                                additional={{
                                                    page: 1,
                                                  }}
                                                /> */}
                                            <select className={`form-control ${(error?.managerId ? "input-error" : "")}`}
                                                value={userData?.managerId}
                                                onChange={(e) => {
                                                    setUserData({ ...userData, managerId: Number(e.target.value) });
                                                    setError({ ...error, managerId: "" })
                                                }}>
                                                <option value="">Select manager...</option>
                                                {managerIds && managerIds.map((e) => (
                                                    <option key={e.userId} value={e.userId}>{e.firstName}</option>
                                                ))}
                                            </select>
                                            {error?.managerId ? <span className="errormsg">{error?.managerId}</span> : ""}
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="contactType" className="control-label">Status&nbsp;<span>*</span></label>
                                            <Switch checked={userStatus}
                                                onChange={(e) => {
                                                    setUserStatus(!userStatus)
                                                    setUserData({
                                                        ...userData,
                                                        status: e === false ? 'IN' : 'AC'
                                                    });

                                                }} />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">Activation date<span>*</span></label>
                                            <input type="date" className={`form-control ${(error?.activationDate ? "input-error" : "")}`} value={userData?.activationDate}
                                                min={moment(new Date()).format('YYYY-MM-DD')}
                                                onChange={(e) => {
                                                    setError({ ...error, activationDate: "" })
                                                    setUserData({ ...userData, activationDate: e.target.value })
                                                }}
                                            />
                                            {error?.activationDate ? <span className="errormsg">{error?.activationDate}</span> : ""}

                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">Expiry Date</label>
                                            <input type="date" className="form-control" value={userData?.expiryDate}
                                                min={(userData?.activationDate) ? moment(new Date(userData?.activationDate)).format('YYYY-MM-DD') : moment(new Date()).format('YYYY-MM-DD')}
                                                onChange={(e) => {

                                                    setUserData({ ...userData, expiryDate: e.target.value })
                                                }}
                                            />

                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="field-2" className="control-label mt-1">Admin Remarks</label>

                                            <div className="switchToggle">
                                                <textarea className="form-control" id="details" name="remarks" rows="4" value={userData?.adminRemark}
                                                    onChange={(e) => { setUserData({ ...userData, adminRemark: e.target.value }) }}>

                                                </textarea>
                                            </div>
                                        </div>
                                    </div>


                                </div>}


                            </form>

                            <div className=" pt-2" >
                                <div className="col-12 pl-2 bg-light border" > <h5 className="text-primary" >User Roles Mapping</h5 > </div >
                            </div >
                            <br></br>
                            {
                                rolesData &&

                                <form className="d-flex justify-content-center" >
                                    <div style={{ width: "100%" }}>
                                        <Select
                                            closeMenuOnSelect={false}
                                            options={rolesData}
                                            getOptionLabel={option => `${option.label}`}
                                            onChange={handleChange}
                                            isMulti
                                            isClearable
                                            name="roles"
                                            menuPortalTarget={document.Modal}

                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        />
                                    </div>
                                </form>

                            }

                            {/* <div className="pt-2"><div className="col-12 pl-2 bg-light border"><h5 className="text-primary">User / Department Permission</h5> </div></div>
                            <UserLevelPermission setPermissionMasterData={setPermissionMasterData} cPermission={choosePermission} permissionMasterData={permissionMasterData} userPermission={userPermission.editRole}></UserLevelPermission> */}
                        </fieldset>


                        <div style={{ marginTop: "30px" }} className="col-md-12 text-center">
                        <button className="skel-btn-cancel" onClick={closeModal}>Close</button>
                            <button className="skel-btn-submit" onClick={handleSubmit} >Submit and Send Mail</button>&nbsp;
                            
                        </div>
                    </div >
                </div>
            </div>


        </Modal >


    );
};

export default UserDetailsForm;
