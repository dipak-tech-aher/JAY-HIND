import React, { useContext, useEffect, useState, useRef } from 'react';
import Switch from "react-switch";
import UserManagementForm from './userManagementForm';
import { post, get, put } from "../../common/util/restUtil";
import { history } from '../../common/util/history';
import { properties } from "../../properties";

// import UserRoleMapping from './userRoleMapping';
import { UserManagementColumns } from './userManagementColumns';
import DynamicTable from '../../common/table/DynamicTable';
import { unstable_batchedUpdates } from 'react-dom';
import { AppContext } from '../../AppContext';
import { toast } from 'react-toastify';
import { formFilterObject, USNumberFormat } from '../../common/util/util';

const UserManagement = (props) => {
    const { appsConfig } = props;
    const [userList, serUserList] = useState({})
    const [isOpenModal, setIsOpen] = useState(false);
    const [isNewForm, setIsNewForm] = useState(true);
    const [userData, setUserData] = useState({});
    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        contactNo: '',
        userType: '',

    }
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [listSearch, setListSearch] = useState([]);
    const [conactTypes, setContactTypes] = useState({})
    const [isOpenRoleMappingModal, setIsOpenRoleMappingModal] = useState(false);
    const [selectedRoleData, setSelectedRoleData] = useState({});
    const [locations, setLocations] = useState([])
    const [userTypes, setUserTypes] = useState([])
    const [notificationTypes, setNotificationTypes] = useState([])
    const [emailDomains, setEmailDomains] = useState([])
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [exportBtn, setExportBtn] = useState(true);
    const [userPermission, setUserPermission] = useState({ addUser: false, editUser: false, viewUser: false, viewUserList: true, changeUserPassword: false, switchUser: false, UserMobileList: false })
    const { auth } = useContext(AppContext)
    const [filters, setFilters] = useState([]);
    const [userSearchParams, setUserSearchParams] = useState(initialValues)
    const userSearchAPI = `${properties.USER_API}/search`

    useEffect(() => {

        let rolePermission = []

        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)
            if (property[0] === "Users") {
                let value = Object.values(e)
                rolePermission = Object.values(value[0])
            }
        })

        let add, edit, view, list, changePassword, userByMobile, switchUser;
        rolePermission.map((screen) => {
            if (screen.screenName === `Add ${appsConfig?.clientFacingName?.user ?? "User"}`) {
                add = screen.accessType
            }
            else if (screen.screenName === `Edit ${appsConfig?.clientFacingName?.user ?? "User"}`) {
                edit = screen.accessType
            }
            else if (screen.screenName === `View ${appsConfig?.clientFacingName?.user ?? "User"}`) {
                view = screen.accessType
            }
            else if (screen.screenName === `View ${appsConfig?.clientFacingName?.user ?? "User"} List`) {
                list = screen.accessType
            }
            else if (screen.screenName === "Change Password") {
                changePassword = screen.accessType
            }
            else if (screen.screenName === `Get ${appsConfig?.clientFacingName?.user ?? "User"} By Mobile`) {
                userByMobile = screen.accessType
            }
            else if (screen.screenName === `Switch ${appsConfig?.clientFacingName?.user ?? "User"}`) {
                switchUser = screen.accessType
            }
        })
        setUserPermission({ addUser: add, editUser: edit, viewUser: view, viewUserList: list, changeUserPassword: changePassword, switchUser: switchUser, UserMobileList: userByMobile })


    }, [auth])

    // const [currentDataKey, setCurrentDataKey] = useState(0);
    useEffect(() => {
        if (isOpenModal === false && isOpenRoleMappingModal === false) {

            const requestBody = {
                //                ...userSearchParams,
                filters: formFilterObject(filters)
            }
            setListSearch(requestBody);

            post(userSearchAPI + `?limit=${perPage}&page=${currentPage}`, requestBody).then(resp => {

                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        if (resp.data.count === 0) {
                            toast.error("Records Not found");
                            setFilters([]);
                        } else {
                            unstable_batchedUpdates(() => {
                                setTotalCount(count)
                                serUserList(rows);
                            })
                        }

                    } else {
                        serUserList([]);
                        toast.error("Records Not Found");
                    }
                } else {
                    serUserList([]);
                    toast.error("Records Not Found");
                }
            }).catch((error) => {
                console.log(error)
            }).finally(() => {

                isTableFirstRender.current = false;
            });

            get(properties.BUSINESS_ENTITY_API + '?searchParam=code_type&valueParam=CONTACT_TYPE,EMAIL_DOMAIN,CONTACT_PREFERENCE,LOCATION,USER_TYPE')
                .then((resp) => {
                    if (resp.data) {
                        setLocations(resp.data.LOCATION)
                        setNotificationTypes(resp.data.CONTACT_PREFERENCE)
                        setUserTypes(resp.data.USER_TYPE)
                        setContactTypes(resp.data.CONTACT_TYPE)
                        setEmailDomains(resp.data.EMAIL_DOMAIN)
                    }
                }).catch((error) => {
                    console.log(error)
                })
                .finally()
        }

        // get(properties.ORGANIZATION_CREATE).then(resp => {
        //     if (resp && resp.data && resp.data.length > 0) {
        //         setOrgData(resp.data);
        //         doTreeFormat(resp.data);
        //     }
        // });
    }, [selectedRoleData, isOpenModal, isOpenRoleMappingModal, currentPage, perPage]);


    const openModal = (userId, formFlag, user) => {
        let reqBody = {}
        if (isOpenModal) {
            setIsOpen(false);
        } else {
            // getRoleList();
            if (formFlag)
                setIsOpen(true);
        }
        reqBody = {
            data: {},
            isApprovalForm: false,
            isNewForm: true
        }
        setIsNewForm(formFlag);
        if (formFlag === false) {
            reqBody = {
                data: user,
                isApprovalForm: false,
                isNewForm: false
            }

            setUserData(user);
            setIsOpen(true);

        } else {
            setUserData({})
        }

        history.push(`${process.env.REACT_APP_BASE}/update-user`, { ...reqBody })
    }

    const roleMappingModelPopup = (selectedRole) => {

        let isOpen = (isOpenRoleMappingModal) ? false : true;

        setIsOpenRoleMappingModal(isOpen);
        if (selectedRole) setSelectedRoleData(selectedRole);
    }
    const switchChange = (key) => {

        let index = 0
        let obj = {}
        userList.map((user, i) => {
            if (user.userId === key) {
                obj.status = user.status === 'AC' ? 'IN' : 'AC'
                index = i
            }
        })

        serUserList((previousState) => {
            previousState[index]['status'] = (previousState[index]['status'] === 'AC') ? 'IN' : 'AC';

            put(properties.USER_API + "/update-status/" + key, obj)
                .then((resp) => {
                    if (resp.status === 200) {
                        toast.success(resp.message);

                    } else {
                        toast.error("Failed, Please try again");
                    }
                }

                ).catch((error) => {
                    console.log(error)
                })
                .finally();
            return [...previousState];

        });
    };
    const handleCellRender = (cell, row) => {
        if (cell.column.id === "userStatus") {
            return (<>
                {
                    cell.value === 'RJ' ? row.original?.statusDesc?.description : <Switch onChange={(e) => switchChange(row.original.userId)} checked={cell.value === 'AC' ? true : false} />
                }
            </>)
        }
        else if (cell.column.id === "editUser") {
            return (
                <button disabled={userPermission.editUser === "deny"} type="button" onClick={() => openModal(row.original.userId, false, row.original)} className="skel-btn-submit" data-toggle="modal" data-target="#search-modal-editservice"><span><i className="mdi mdi-file-document-edit-outline font20"></i></span>Edit</button >
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    return (

        <div className="row" id="datatable">
            <div className="col-lg-12">
                <div className="card-body">
                    <div className="card">
                        <div className="card-body" id="datatable">
                            {
                                !!userList.length && userPermission.viewUserList !== "deny" &&
                                <DynamicTable
                                    listSearch={listSearch}
                                    listKey={`Admin View ${appsConfig?.clientFacingName?.user ?? "User"} Management`}
                                    row={userList}
                                    rowCount={totalCount}
                                    header={UserManagementColumns}
                                    itemsPerPage={perPage}
                                    columnFilter={true}
                                    backendPaging={true}
                                    isTableFirstRender={isTableFirstRender}
                                    hasExternalSearch={hasExternalSearch}
                                    backendCurrentPage={currentPage}
                                    exportBtn={exportBtn}
                                    url={userSearchAPI + `?limit=${totalCount}&page=0`}
                                    method='POST'
                                    handler={{
                                        handleCellRender: handleCellRender,
                                        handlePageSelect: handlePageSelect,
                                        handleItemPerPage: setPerPage,
                                        handleCurrentPage: setCurrentPage,
                                        handleExportButton: setExportBtn,
                                        handleFilters: setFilters
                                    }}
                                    customButtons={(
                                        <button disabled={userPermission.addUser === "deny"} onClick={() => openModal(false, true)} type="button" className="skel-btn-submit">
                                            Add New {appsConfig?.clientFacingName?.user ?? "User"}
                                        </button>
                                    )}
                                    bulkUpload={(
                                        <button className="skel-btn-orange mr-1" onClick={() => history.push(`${process.env.REACT_APP_BASE}/create-bulk-upload`)}>
                                            Bulk Upload
                                        </button>
                                    )}
                                />
                            }
                        </div>
                    </div>
                </div>
            </div >
            {/* {isOpenModal && ( */}

            {/* <UserRoleMapping userPermission={userPermission} isOpenModal={isOpenRoleMappingModal} roleData={selectedRoleData} roleMappingModelPopup={roleMappingModelPopup} /> */}
            {/* <RoleMapping isOpenModal={isOpenRoleMappingModal} roleData={selectedRoleData} roleMappingModelPopup={roleMappingModelPopup}></RoleMapping> */}
            {
                isOpenModal === true &&
                <UserManagementForm
                    userPermission={userPermission}
                    userData={userData}
                    isNewForm={isNewForm}
                    isModal={openModal}
                    isOpenModal={isOpenModal}
                    appsConfig={appsConfig}
                ></UserManagementForm>
            }
            {/* )} */}
        </div >

    );
};

export default UserManagement;
