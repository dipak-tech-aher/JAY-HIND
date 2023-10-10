import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { properties } from "../../properties";
import { get, put } from "../../common/util/restUtil";
import Switch from "react-switch";
import { Toggle } from 'rsuite';
import { RoleTableColumns } from './roleTableColumns';
import DynamicTable from '../../common/table/DynamicTable';
import { RegularModalCustomStyles } from '../../common/util/util';
import { toast } from 'react-toastify';
import SaveRole from './SaveRole';
import { history } from '../../common/util/history';

const RoleTable = () => {
    const [userPermission, setUserPermission] = useState({ createRole: true, editRole: true, viewRole: true, viewRoleList: true })
    const [display, setDisplay] = useState(false);
    const [update, setUpdate] = useState(false);
    const [data, setData] = useState({});
    const [roleDetails, setroleDetails] = useState([]);
    const [exportBtn, setExportBtn] = useState(true);
    const [roleFamilies, setRoleFamilies] = useState([]);
    const [modules, setModules] = useState({});

    useEffect(() => {
        get(properties.ROLE_API + '/role-family').then((resp) => {
            if (resp.data) {
                console.log(resp.data);
                setRoleFamilies(resp.data?.map(x => ({ label: x.roleFamilyName, value: x.roleFamilyId })))
            }
        }).catch(err => console.log(err))

        get(properties.MASTER_API + '/get-modules-list').then((resp) => {
            if (resp.data) {
                setModules({ ...resp.data })
            }
        }).catch(err => console.log(err))
    }, [])

    useEffect(() => {
        if (update === false) {
            get(properties.ROLE_API).then(resp => {
                if (resp && resp.data && resp.data.length > 0) {
                    let arrayCopy = resp.data
                    arrayCopy.sort(compareBy("roleId"));
                    setroleDetails(arrayCopy);
                }
            }).catch(err => console.log(err))
        }
    }, [update]);

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

    const switchChange = (key) => {
        let index = roleDetails.findIndex(x => x.roleId == key);
        roleDetails[index]['status'] = roleDetails[index]['status'] === 'AC' ? 'IN' : 'AC';

        setroleDetails([...roleDetails]);

        let obj = roleDetails[index];
        delete obj.roleFamily;

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
        setUpdate(true);
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id === "status") {
            return (
                <Toggle
                    size="lg"
                    checked={cell.value === 'AC'}
                    checkedChildren="Active"
                    unCheckedChildren="InActive"
                    onChange={(e) => switchChange(row.original.roleId)}
                    className={'skel-role-status-switch'}
                />
            )
        }
        else if (cell.column.id === "action") {
            return (
                // skel-action-btn
                <div className="">
                    <button className="skel-btn-submit" onClick={(e) => handleSubmit(row.original, row.original.roleId)}><i className="mdi mdi-file-document-edit-outline font20"></i> Edit</button>
                    <button className="skel-btn-delete ml-2"><i className="mdi mdi-delete font20"></i> Delete</button>
                </div>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    return (
        <React.Fragment>
            <Modal style={RegularModalCustomStyles} isOpen={display}>
                <SaveRole
                    setDisplay={setDisplay}
                    roleFamilies={roleFamilies}
                    modules={modules}
                />
            </Modal>

            <div className="skel-config-base mt-4">
                {(roleDetails.length > 0) && (
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
                        bulkUpload={(
                            <button type="button" className="skel-btn-orange" onClick={() => history.push(`${process.env.REACT_APP_BASE}/create-bulk-upload`)}>
                                Bulk Upload
                            </button>
                        )}
                        customButtons={(
                            <button type="button" className="skel-btn-submit" onClick={() => setDisplay(true)}>
                                Add Role
                            </button>
                        )}
                    />
                )}
            </div>
        </React.Fragment>
    )
}


export default RoleTable;