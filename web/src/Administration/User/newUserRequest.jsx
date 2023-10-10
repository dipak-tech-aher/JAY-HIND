import React, { useContext, useEffect, useState, useRef } from 'react';
import { post, get } from "../../common/util/restUtil";
import { properties } from "../../properties";

import { NewUserRequestCols } from './newUserRequestColumns';
import DynamicTable from '../../common/table/DynamicTable';
import { unstable_batchedUpdates } from 'react-dom';
import { AppContext } from '../../AppContext';
import UserDetailsForm from './newUserDetailsForm';
import { formFilterObject } from '../../common/util/util';
import UserManagementForm from './userManagementForm';
import { toast } from 'react-toastify';
import { history } from '../../common/util/history';

const NewUserRequest = (props) => {
    const { appsConfig } = props;
    const [listSearch, setListSearch] = useState([]);
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [userList, setUserList] = useState([])
    const [isOpenModal, setIsOpen] = useState(false);
    const [refresh, setRefresh] = useState(false)
    const [conactTypes, setContactTypes] = useState({})
    const [userTypes, setUserTypes] = useState([])
    const [isOpenRoleMappingModal, setIsOpenRoleMappingModal] = useState(false);
    const [isCreate, setIsCreate] = useState(false)
    const [emailDomains, setEmailDomains] = useState([])
    const [filters, setFilters] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [exportBtn, setExportBtn] = useState(true);
    const [userPermission, setUserPermission] = useState({ addUser: false, editUser: false, viewUser: false, viewUserList: true, changeUserPassword: false, switchUser: false, UserMobileList: false })
    const { auth } = useContext(AppContext)
    const [update, setUpdate] = useState(false);
    const [userData, setUserData] = useState({});
    const userSearchAPI = `${properties.USER_API}/search`;

    useEffect(() => {
        if (isOpenModal === false && isOpenRoleMappingModal === false) {
            const requestBody = {
                //...searchInputs,
                filters: formFilterObject(filters)
            }
            
            post(`${properties.USER_API}/search?limit=${perPage}&page=${currentPage}&source=NEW`, requestBody).then(resp => {

                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        if (resp.data.count === 0) {
                            setUserList([]);
                            setFilters([]);
                            // toast.error("Records Not Found");
                        } else {
                            unstable_batchedUpdates(() => {
                                setTotalCount(count)
                                setUserList(rows);
                            })
                        }

                    } else {
                        setUserList([]);
                        // toast.error("Records Not Found");
                    }
                } else {
                    setUserList([]);
                    // toast.error("Records Not Found");
                }
            }).catch(error => {
                console.error(error);
            }).finally(() => {
                
                isTableFirstRender.current = false;
            });

            
            get(properties.BUSINESS_ENTITY_API+'?searchParam=code_type&valueParam=CONTACT_TYPE,EMAIL_DOMAIN,USER_TYPE')
                .then((resp) => {
                    if (resp.data) {                   
                        setUserTypes(resp.data.USER_TYPE)
                        setContactTypes(resp.data.CONTACT_TYPE)
                        setEmailDomains(resp.data.EMAIL_DOMAIN)
                    }
                }).catch((error) => {
                    console.log(error)
                })
                .finally()

        }


    }, [isOpenModal, isOpenRoleMappingModal, currentPage, perPage, refresh]);

    const updateUser = (data, id) => {        
        setUserData(data)
        //setIsOpen(true)
        const reqBody={
            data,
            isApprovalForm: true,
            isNewForm: false
        }
        history.push(`${process.env.REACT_APP_BASE}/update-user`,{ ...reqBody })
    }

    const switchChange = (key) => {
        let index = 0
        userList.map((user, i) => {
            if (user.userId === key) {
                index = i
            }
        })
        setUserList((previousState) => {
            previousState[index]['status'] = (previousState[index]['status'] === 'ACTIVE') ? 'INACTIVE' : 'ACTIVE';
            return [...previousState];
        });
    };
    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Gender") {
            let userGender
            if (row.original.gender === "M") {
                userGender = "Male"
            } else {
                userGender = "Female"
            }
            return (<span>{userGender}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <>
                    <button onClick={() => updateUser(row.original, row.original.userId)} type="button" className="map-btn skel-btn-submit">Edit</button >
                </>
            )
        }
        else if (cell.column.Header === "User Type") {
            let type
            userTypes.map((e) => {
                if (e.code === row?.original?.userType) {
                    type = e.description
                }
            })
            return (<span>{type}</span>)

        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const openModal = (userId, formFlag, user) => {
        if (isOpenModal) {
            setIsOpen(false);
        } else {
            // getRoleList();
            if (formFlag)
                setIsOpen(true);
        }
        if (formFlag === false) {
            
            setUserData(user);
            setIsOpen(true);
            
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
                        <div className={`card-body ${!!userList.length ? '' : 'text-center'}`} id="datatable">
                            {
                                !!userList.length && userPermission.viewUserList !== "deny" ?
                                    <DynamicTable
                                        listSearch={listSearch}
                                        listKey={"Admin View New-User-Request Management"}
                                        row={userList}
                                        rowCount={totalCount}
                                        header={NewUserRequestCols}
                                        itemsPerPage={perPage}
                                        backendPaging={true}
                                        isTableFirstRender={isTableFirstRender}
                                        hasExternalSearch={hasExternalSearch}
                                        backendCurrentPage={currentPage}
                                        exportBtn={exportBtn}
                                        url={userSearchAPI + `?newUserRequest=${true}&limit=${totalCount}&page=0`}
                                        method='POST'
                                        handler={{
                                            handleCellRender: handleCellRender,
                                            handlePageSelect: handlePageSelect,
                                            handleItemPerPage: setPerPage,
                                            handleCurrentPage: setCurrentPage,
                                            handleExportButton: setExportBtn,
                                            handleFilters: setFilters,
                                        }}
                                    />
                                    : (
                                        <span>No new {appsConfig?.clientFacingName?.user?.toLowerCase() ?? "user"} got registered</span>
                                    )
                                }
                        </div>
                    </div>
                </div>
            </div >
            {/* <UserManagementForm
                isNewForm={false}
                userPermission={userPermission}
                userData={userData}
                isModal={openModal}
                isApprovalForm={true}
                isOpenModal={isOpenModal}
                refresh={refresh}
                setRefresh={setRefresh}
            /> */}

            {/* {(update === true) &&
                <UserDetailsForm
                    setUpdate={setUpdate}
                    isOpen={update}                  
                    userPermission={userPermission}
                    userData={userData}
                    refresh={refresh}
                    setRefresh={setRefresh}

                ></UserDetailsForm>
            }
            {isCreate === true && <UserManagementForm
                isNewForm={true}
                isModal={openModal}
                isOpenModal={isCreate}></UserManagementForm>} */}

        </div >

    );
};

export default NewUserRequest;
