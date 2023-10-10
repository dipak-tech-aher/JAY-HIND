import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { properties } from "../../properties";
import { get, put } from "../../common/util/restUtil";
import Switch from "react-switch";
import NewRole from './NewRole';
import UpdateRole from './UpdateRole';
import { toast } from 'react-toastify';
import { RoleTableColumns } from './roleTableColumns';
import DynamicTable from '../../common/table/DynamicTable';
import { RegularModalCustomStyles } from '../../common/util/util';

const RoleTable = () => {
    const [userPermission, setUserPermission] = useState({ createRole: true, editRole: true, viewRole: true, viewRoleList: true })
    const [display, setDisplay] = useState(false);
    const [update, setUpdate] = useState(false);
    const [data, setData] = useState({});
    const [roleDetails, setroleDetails] = useState([]);
    const [exportBtn, setExportBtn] = useState(true);
    const [roleFamilies, setRoleFamilies] = useState([]);

    useEffect(() => {
        get(properties.ROLE_API + '/role-family')
            .then((resp) => {
                if (resp.data) {
                    console.log(resp.data);
                    setRoleFamilies(resp.data?.map(x => ({ label: x.roleFamilyName, value: x.roleFamilyId })))
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }, [])

    useEffect(() => {
        let permisssion = []
        if (display === false && update === false) {

            get(properties.ROLE_API).then(resp => {
                if (resp && resp.data && resp.data.length > 0) {
                    let arrayCopy = resp.data
                    arrayCopy.sort(compareBy("roleId"));
                    setroleDetails(arrayCopy);
                }
            }).catch((error) => {
                console.log(error)
            }).finally()
        }
    }, [display, update]);

    const compareBy = (key) => {
        return function (a, b) {
            if (a[key] < b[key]) return -1;
            if (a[key] > b[key]) return 1;
            return 0;
        };
    }

    const sortBy = (key) => {
        let arrayCopy = roleDetails
        arrayCopy.sort(compareBy(key));
        setroleDetails(arrayCopy);
    }

    // const switchChange = (key) => {
    //     let array = roleDetails;
    //     array.map((role) => {
    //         if (role.roleId === key) {
    //             if (role["isAdmin"] === true) {
    //                 role["isAdmin"] = false
    //             }
    //             else {
    //                 role["isAdmin"] = true
    //             }
    //         }
    //     })
    //     setroleDetails([...array])
    // };

    const switchChange = (key) => {
        let index = roleDetails.findIndex(x => x.roleId == key);
        roleDetails[index]['status'] = roleDetails[index]['status'] === 'AC' ? 'IN' : 'AC';

        setroleDetails([...roleDetails]);

        let obj = roleDetails[index];
        delete obj.roleFamily;

        // toast.dismiss("role_update_toast");

        let success = true;
        put(properties.ROLE_API + "/update/" + key, obj).then((resp) => {
            success = (resp.status === 200);
        }).catch((err) => {
            success = false;
        }).finally(e => {
            toast[success ? "success" : "error"](success ? 'Role status updated' : 'Error while updating role');
            if (!success) {
                roleDetails[index]['status'] = roleDetails[index]['status'] === 'AC' ? 'IN' : 'AC';
                setroleDetails([...roleDetails]);
            }
        });
    };

    const handleSubmit = (role, id) => {
        setData(role);
        setUpdate(true)

    }
    const handleCellRender = (cell, row) => {
        if (cell.column.id === "status") {
            return (<Switch onChange={(e) => switchChange(row.original.roleId)} checked={cell.value === 'AC' ? true : false} />)

        }
        else
            if (cell.column.Header === "Edit Role") {
                return (
                    <button type="button" className="skel-btn-submit" onClick={(e) => handleSubmit(row.original, row.original.roleId)}><span><i className="mdi mdi-file-document-edit-outline font20"></i></span> Edit</button>
                )
            }
            else {
                return (<span>{cell.value}</span>)
            }
    }
    return (
        <>
            {(display) ?

                <Modal style={RegularModalCustomStyles} isOpen={display}>
                    <NewRole
                        setDisplay={setDisplay}
                        roleFamilies={roleFamilies}
                    />
                    <button className="close-btn" onClick={() => setDisplay(false)} >&times;</button>
                </Modal>
                : <></>}

            <div className="col-lg-12">
                <div>
                    <div className="card-body">
                        <div className="card">
                            <div className="card-body" id="datatable">
                                {
                                    roleDetails.length > 0 &&
                                    <DynamicTable
                                        listKey={"Admin View User-Roles Setup"}
                                        row={roleDetails}
                                        header={RoleTableColumns}
                                        itemsPerPage={10}
                                        exportBtn={exportBtn}
                                        handler={{
                                            handleCellRender: handleCellRender,
                                            handleExportButton: setExportBtn
                                        }}
                                        customButtons={(
                                            <button type="button" className="skel-btn-submit" onClick={() => setDisplay(true)}>
                                                Create Role
                                            </button>
                                        )}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div >
            {(update === true) && (
                <UpdateRole
                    Data={data}
                    setUpdate={setUpdate}
                    isOpen={update}
                    roleFamilies={roleFamilies}
                />
            )}
        </>

    )
}


export default RoleTable;