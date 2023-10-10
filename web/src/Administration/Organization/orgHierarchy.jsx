import React, { useEffect, useState } from "react";
import Switch from "react-switch";
import { properties } from "../../properties";
import { get, put } from "../../common/util/restUtil";
import DynamicTable from "../../common/table/DynamicTable";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import AddEditOrgOuDeptModal from "./AddEditOrgOuDeptModal";

const OrgHierarchy = () => {

    const history = useHistory();
    const [refreshTree, setRefreshTree] = useState(false)
    const [exportBtn, setExportBtn] = useState(true)
    const [exportOuBtn, setExportOuBtn] = useState(true)
    const [exportDeptBtn, setExportDeptBtn] = useState(true)
    const [listSearch, setListSearch] = useState({ unitType: 'ORG' })
    const [masterData, setMasterData] = useState([])
    const [orgList, setOrgList] = useState([])
    const [ouList, setOuList] = useState([])
    const [deptList, setDeptList] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [data, setData] = useState({
        mode: 'CREATE'
    });

    useEffect(() => {
        get(properties.ORGANIZATION + '/search')
            .then(resp => {
                if (resp && resp.data && resp.data.length > 0) {
                    console.log(resp.data);
                    setMasterData(resp.data);
                    setOrgList(resp.data.filter((x) => x.unitType === 'ORG'))
                    setOuList(resp.data.filter((x) => x.unitType === 'OU'))
                    setDeptList(resp.data.filter((x) => x.unitType === 'DEPT'))
                }
            }).catch((error) => {
                console.log(error)
            }).finally();
    }, [refreshTree]);

    const columns = [
        {
            Header: "ID",
            accessor: "unitId",
            disableFilters: true,
        },
        {
            Header: "Unit Name",
            accessor: "unitName",
            disableFilters: true,
        },
        {
            Header: "Unit Desc",
            accessor: "unitDesc",
            disableFilters: true,
        },
        {
            Header: "Parent Unit",
            accessor: row => {
                console.log(row);
                let record = masterData.find(x => x.unitId == row.parentUnit);
                return record ? record.unitDesc : null;
            },
            id: "parentUnit",
            disableFilters: true,
        },
        {
            Header: "Status",
            accessor: "status",
            disableFilters: true,
        },
        {
            Header: "Action",
            accessor: "action",
            disableFilters: true,
        }
    ]

    const softRefresh = () => {
        setRefreshTree(!refreshTree)
    }

    const handleChangeStatus = (data, e) => {
        try {
            let objList = {
                ORG: {
                    data: orgList,
                    setData: setOrgList
                },
                OU: {
                    data: ouList,
                    setData: setOuList
                },
                DEPT: {
                    data: deptList,
                    setData: setDeptList
                }
            }

            let index = objList[data.unitType].data.findIndex(x => x.unitId == data.unitId);
            objList[data.unitType].data[index]['status'] = objList[data.unitType].data[index]['status'] === 'AC' ? 'IN' : 'AC';
            objList[data.unitType].setData([...objList[data.unitType].data]);

            const reqBody = {
                ...data,
                status: e ? 'AC' : 'IN'
            }
            console.log('reqBody', reqBody)
            let success = false;
            put(properties.ORGANIZATION + "/update/" + data.unitId, reqBody).then((resp) => {
                if (resp.status === 200) {
                    toast.success(resp.message);
                    // softRefresh()
                    success = true
                }
            }).catch((error) => {
                console.error(error)
            }).finally(e => {
                if (!success) {
                    objList[data.unitType].data[index]['status'] = objList[data.unitType].data[index]['status'] === 'AC' ? 'IN' : 'AC';
                    objList[data.unitType].setData([...objList[data.unitType].data]);
                }
            })
        } catch (error) {
            toast.error("Status cannot be updated");
            console.log(error)
        }
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Status") {
            return (<Switch onChange={(e) => handleChangeStatus(row.original, e)} checked={cell.value === 'AC' ? true : false} />)
        } else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="skel-btn-submit" onClick={(e) => {
                    setData({ ...data, mode: 'EDIT', ...row.original });
                    setIsOpen(true)
                }}>
                    <span><i className="mdi mdi-file-document-edit-outline font20"></i></span> Edit
                </button>
            )
        } else {
            return (<span>{cell.value}</span>)
        }
    }

    return (
        <>
            <div className="cnt-wrapper">
                <div className="card-skeleton">
                    <div className="customer-skel">
                        <div className="cmmn-skeleton">
                            <div className="">
                                <div className="mb-4">
                                    <div className="tabbable">
                                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                                            <li className="nav-item">
                                                <a className="nav-link active" id="org-tab" data-toggle="tab" href="#orgtab" role="tab" aria-controls="alltab" aria-selected="true" onClick={() => setListSearch({ unitType: 'ORG' })} >Organization</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="ou-tab" data-toggle="tab" href="#octab" role="tab" aria-controls="recenttab" aria-selected="false" onClick={() => setListSearch({ unitType: 'OU' })} >Operational Unit</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="depart-tab" data-toggle="tab" href="#departtab" role="tab" aria-controls="pintab" aria-selected="false" onClick={() => setListSearch({ unitType: 'DEPT' })} >Department</a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="tab-content mt-2">
                                        <div className="tab-pane fade active show" id="orgtab" role="tabpanel" aria-labelledby="all-tab">
                                            <div className="col-lg-12">
                                                <div className="card-body">
                                                    <div className="card">
                                                        <div className="card-body" id="datatable">
                                                            {
                                                                orgList.length > 0 &&
                                                                <DynamicTable
                                                                    listSearch={listSearch}
                                                                    listKey={"Admin View Org List"}
                                                                    row={orgList}
                                                                    header={columns.filter(x => x.id !== 'parentUnit')}
                                                                    hiddenColumns={['parentUnit']}
                                                                    itemsPerPage={10}
                                                                    exportBtn={exportBtn}
                                                                    handler={{
                                                                        handleCellRender: handleCellRender,
                                                                        handleExportButton: setExportBtn
                                                                    }}
                                                                    customButtons={(
                                                                        <button type="button" className="skel-btn-submit" onClick={() => { setData({ ...data, mode: 'CREATE' }); setIsOpen(true) }}>
                                                                            Create Organization
                                                                        </button>
                                                                    )}
                                                                    bulkUpload={(
                                                                        <button type="button" className="skel-btn-orange mr-1" onClick={() => history.push(`${process.env.REACT_APP_BASE}/create-bulk-upload`)}>
                                                                            Bulk Upload
                                                                        </button>
                                                                    )}
                                                                />
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="tab-pane fade" id="octab" role="tabpanel" aria-labelledby="recent-tab">
                                            <div className="col-lg-12">
                                                <div className="card-body">
                                                    <div className="card">
                                                        <div className="card-body" id="datatable">
                                                            {
                                                                ouList.length > 0 &&
                                                                <DynamicTable
                                                                    listSearch={listSearch}
                                                                    listKey={"Admin View Ou List"}
                                                                    row={ouList}
                                                                    header={columns}
                                                                    itemsPerPage={10}
                                                                    exportBtn={exportOuBtn}
                                                                    handler={{
                                                                        handleCellRender: handleCellRender,
                                                                        handleExportButton: setExportOuBtn
                                                                    }}
                                                                    customButtons={(
                                                                        <button type="button" className="skel-btn-submit" onClick={() => { setData({ ...data, mode: 'CREATE' }); setIsOpen(true) }}>
                                                                            Create OU
                                                                        </button>
                                                                    )}
                                                                    bulkUpload={(
                                                                        <button type="button" className="skel-btn-orange mr-1" onClick={() => history.push(`${process.env.REACT_APP_BASE}/create-bulk-upload`)}>
                                                                            Bulk Upload
                                                                        </button>
                                                                    )}
                                                                />
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="tab-pane fade" id="departtab" role="tabpanel" aria-labelledby="pin-tab">
                                            <div className="col-lg-12">
                                                <div className="card-body">
                                                    <div className="card">
                                                        <div className="card-body" id="datatable">
                                                            {
                                                                deptList.length > 0 &&
                                                                <DynamicTable
                                                                    listSearch={listSearch}
                                                                    listKey={"Admin View Dept List"}
                                                                    row={deptList}
                                                                    header={columns}
                                                                    itemsPerPage={10}
                                                                    exportBtn={exportDeptBtn}
                                                                    handler={{
                                                                        handleCellRender: handleCellRender,
                                                                        handleExportButton: setExportDeptBtn
                                                                    }}
                                                                    customButtons={(
                                                                        <button type="button" className="skel-btn-submit" onClick={() => { setData({ ...data, mode: 'CREATE' }); setIsOpen(true) }}>
                                                                            Create Department
                                                                        </button>
                                                                    )}
                                                                    bulkUpload={(
                                                                        <button type="button" className="skel-btn-orange mr-1" onClick={() => history.push(`${process.env.REACT_APP_BASE}/create-bulk-upload`)}>
                                                                            Bulk Upload
                                                                        </button>
                                                                    )}
                                                                />
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        isOpen &&
                                        <AddEditOrgOuDeptModal
                                            data={{
                                                isOpen,
                                                unitType: listSearch.unitType,
                                                data,
                                                orgList,
                                                ouList
                                            }}
                                            handler={{
                                                setIsOpen,
                                                softRefresh
                                            }}
                                        />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrgHierarchy;
