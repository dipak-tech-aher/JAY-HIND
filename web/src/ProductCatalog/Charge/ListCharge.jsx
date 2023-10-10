import React, { useContext, useRef, useEffect, useState, useCallback } from 'react';
import { Link } from "react-router-dom";

import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { formFilterObject } from '../../common/util/util';
import moment from 'moment';
import { AppContext } from "../../AppContext";

const ListCharge = (props) => {

    //const { sourceName } = props?.location?.data?.sourceName || null;
    const [userPermission, setUserPermission] = useState({
        chargeList: "",
        addCharge: "",
    })
    const [tableRowData, setTableRowData] = useState([]);
    const [chargeName, setChargeName] = useState("");
    const { auth } = useContext(AppContext);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)
    const [listSearch, setListSearch] = useState([]);
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const getChargeList = useCallback((name = chargeName) => {

        const requestBody = {
            name,
            filter: formFilterObject(filters)
        }
        setListSearch(requestBody)
        post(`${properties.CHARGE_API}/search?limit=${perPage}&page=${currentPage}&excel=true`, requestBody)
            .then((response) => {
                const { count, rows } = response?.data
                if (Number(count) > 0) {
                    unstable_batchedUpdates(() => {
                        setTotalCount(count)
                        setTableRowData(rows)
                    })
                }
                else {
                    toast.error("Records not Found")
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [perPage, currentPage])

    useEffect(() => {
        getChargeList();
    }, [getChargeList])
    useEffect(() => {
        let rolePermission

        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)
            let value

            if (property[0] === "Charge") {
                value = Object.values(e)
                rolePermission = { ...rolePermission, charge: Object.values(value[0]) }
            }

        })

        let listOfCharge, chargeAdd;

        rolePermission?.charge?.map((screen) => {

            if (screen.screenName === "Get charge list") {
                listOfCharge = screen.accessType
            }
            else if (screen.screenName === "Add charge") {
                chargeAdd = screen.accessType
            }
        })


        setUserPermission({
            chargeList: listOfCharge, addCharge: chargeAdd,
        })



    }, [auth])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Action") {
            return (
                <button disabled={userPermission === "deny" || userPermission === "read"} type="button" className="skel-btn-submit"
                    onClick={(e) => handleCellLinkClick(e, row.original)}>

                    {/* <span className="btn-label"><i className="fa fa-edit text-white"></i></span>Edit */}
                    <i className="fa fa-edit text-white mr-2"></i>Edit

                </button>
            )
        }
        else if (["Start Date", "End Date"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>)
        }
        else if (["Updated At", "Created At"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else {
            return (<span>{cell.value ? cell.value : '-'}</span>)
        }
    }

    const handleCellLinkClick = (event, rowData) => {
        props.history.push(`${process.env.REACT_APP_BASE}/edit-charge`, {
            data: {
                row: rowData,
                sourceName: 'Edit',
                userPermission: userPermission
            }
        })
    }

    const handleOnChargeNameSearch = () => {
        unstable_batchedUpdates(() => {
            setPerPage((perPage) => {
                if (perPage === 10) {
                    return '10';
                }
                return 10;
            });
            setCurrentPage((currentPage) => {
                if (currentPage === 0) {
                    return '0';
                }
                return 0;
            });
        })
    }

    const handleKeyDown = (event) => {
        console.log(event);
        if (event.key === 'Enter') {
            handleOnChargeNameSearch();
        }
    }

    return (
        <div className="container-fluid">
            <div className="row mt-1">
                <div className="col-lg-12 row">
                    <div className="col-lg-12">
                        <div className="search-result-box m-t-30 card-box">
                            <div className="row mt-1">
                                <div className="col-lg-12">

                                    <div className="col-12 pr-0">
                                        <section className="triangle">
                                            <div className="row align-items-center">
                                                <div className="col mx-auto"><h4 id="list-item-1" className="pl-1">Add / Edit Charges</h4></div>
                                                <div className="col-auto mx-auto">
                                                    <div className="input-group input-group-sm pr-1 pt-1 form-inline">
                                                        <input type="text" className="form-control border-0" placeholder="Search Charge Name" onKeyDown={handleKeyDown} value={chargeName} onChange={(e) => setChargeName(e.target.value)} />
                                                        <div className="input-group-append">
                                                            <div className="btn-group" role="group" aria-label="Basic example">
                                                                <button className="skel-btn-submit append-button" onClick={handleOnChargeNameSearch}>
                                                                    <i className="fe-search" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <button type="button" className={`skel-btn-submit ${((userPermission?.addCharge !== 'write') ? "" : "")}`} >
                                                            <Link className="text-white" to={{ pathname: `${process.env.REACT_APP_BASE}/add-charge`, state: { data: { sourceName: 'Add', userPermission: userPermission } } }}>
                                                                Add Charges
                                                            </Link>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                    <br></br>
                                    {
                                        !!tableRowData.length && userPermission.listOfCharge !== "deny" && < div >
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    {
                                                        !!tableRowData.length &&
                                                        <div className="card">
                                                            <div className="card-body" id="datatable">
                                                                <DynamicTable
                                                                    listSearch={listSearch}
                                                                    listKey={"Charge List"}
                                                                    row={tableRowData}
                                                                    rowCount={totalCount}
                                                                    header={ChargeListColumns}
                                                                    itemsPerPage={perPage}
                                                                    backendPaging={true}
                                                                    backendCurrentPage={currentPage}
                                                                    isTableFirstRender={isTableFirstRender}
                                                                    hasExternalSearch={hasExternalSearch}
                                                                    exportBtn={exportBtn}
                                                                    handler={{
                                                                        handleCellRender: handleCellRender,
                                                                        handlePageSelect: handlePageSelect,
                                                                        handleItemPerPage: setPerPage,
                                                                        handleCurrentPage: setCurrentPage,
                                                                        handleFilters: setFilters,
                                                                        handleExportButton: setExportBtn
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >

    );
}
const ChargeListColumns = [
    {
        Header: "Charge Id",
        accessor: "chargeId",
        disableFilters: false,
        click: true,
        id: "chargeId",

    },
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: false,
        id: 'chargeName'
    },
    {
        Header: "Charge category",
        accessor: "chargeCatDes",
        disableFilters: false,
    },
    {
        Header: "Service type",
        accessor: "serviceTypeDes",
        disableFilters: false,
        id: "serviceType"
    },
    {
        Header: "Currency",
        accessor: "currencyDes",
        disableFilters: false,
        id: "currency"
    },
    {
        Header: "Start Date",
        accessor: "startDate",
        disableFilters: true,
        id: "startDate"
    },
    {
        Header: "End Date",
        accessor: "endDate",
        disableFilters: true,
    },
    {
        Header: "GL Code",
        accessor: "glcode",
        disableFilters: false,
        id: "glcode"
    },
    {
        Header: "Status",
        accessor: "statusDes",
        disableFilters: false,
        id: "chargeStatus"
    },
    {
        Header: "Updated By",
        accessor: "updatedUser",
        disableFilters: false
    },
    {
        Header: "Updated At",
        accessor: "updatedAt",
        disableFilters: true
    },
    {
        Header: "Created By",
        accessor: "createdUser",
        disableFilters: false
    },
    {
        Header: "Created At",
        accessor: "createdAt",
        disableFilters: true
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
    }
]
export default ListCharge;


