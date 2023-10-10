import React, { useState, useEffect, useContext } from 'react';
import { get, post } from "../../common/util/restUtil";
import { properties } from '../../properties';
import { CloseButton, Modal } from 'react-bootstrap';
import DynamicTable from '../../common/table/DynamicTable';
import moment from 'moment';
import LastRefreshTime from './LastRefreshTime';
import { history } from '../../common/util/history';

const AgentWise = (props) => {
    const { searchParams, isParentRefresh } = props?.data;
    const [isRefresh, setIsRefresh] = useState(false);
    const [listData, setListData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [agent, setAgent] = useState();

    const columns = [
        {
            Header: "Interaction No",
            accessor: "oIntxnNo",
            disableFilters: true,
            id: "oIntxnNo"
        },
        {
            Header: "Current User",
            accessor: "oCurrUserDesc",
            id: 'oCurrUser',
            disableFilters: true,
        },
        {
            Header: "Interaction Category",
            accessor: "oInteractionCategory",
            disableFilters: true,
        },
        {
            Header: "Interaction Type",
            accessor: "oInteractionType",
            disableFilters: true,
        },
        {
            Header: "Service Category",
            accessor: "oServiceCategory",
            disableFilters: true,
        },
        {
            Header: "Service Type",
            accessor: "oServiceType",
            disableFilters: true,
        },
        {
            Header: "Priority",
            accessor: "oPriority",
            disableFilters: true,
        },
        {
            Header: "Project",
            accessor: "oProject",
            disableFilters: true,
        },
        {
            Header: "Status",
            accessor: "oStatus",
            disableFilters: true,
        },
        {
            Header: "Channel",
            accessor: "oChannel",
            disableFilters: true,
        },
        {
            Header: "Created User",
            accessor: "oCreatedUser",
            disableFilters: true,
        },
        {
            Header: "Created At",
            accessor: "oCreatedAt",
            disableFilters: true,
            id: "oCreatedAt"
        }
    ]

    useEffect(() => {
        post(properties.INTERACTION_API + "/agent-wise/count", { searchParams }).then((resp) => {
            if (resp?.status == 200) {
                setListData(resp?.data?.rows ?? []);
            }
        }).catch((error) => console.log(error));
    }, [isRefresh, searchParams, isParentRefresh])

    const fetchInteractionDetail = (intxnNo) => {
        get(`${properties.INTERACTION_API}/search?q=${intxnNo}`).then((resp) => {
            if (resp.status === 200) {
                const response = resp.data?.[0];
                const data = {
                    ...response,
                    sourceName: 'customer360'
                }
                if (response.customerUuid) {
                    sessionStorage.setItem("customerUuid", response.customerUuid)
                    sessionStorage.setItem("customerIds", response.customerId)
                }
                history.push(`${process.env.REACT_APP_BASE}/interaction360`, { data })
            } else {
                //
            }
        }).catch(error => {
            console.log(error);
        });
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id === "oIntxnNo") {
            return (<span onClick={() => fetchInteractionDetail(cell.value)} style={{ cursor: 'pointer', color: 'rgb(80, 154, 222)' }}>{cell.value}</span>);
        }
        else if (cell.column.id === "oCurrUser") {
            return (<span>{cell.value ?? "Others"}</span>)
        }
        else if (cell.column.id === "oCreatedAt") {
            return (<span>{moment(cell.value).format("DD-MM-YYYY hh:mm:ss")}</span>)
        }
        return (<span>{cell.value}</span>)
    }

    const countClicked = (agent) => {
        setAgent(agent);
        post(properties.INTERACTION_API + `/agent-wise/list`, { searchParams: { ...searchParams, userId: agent ?? null } }).then((resp) => {
            if (resp?.status == 200) {
                const records = resp?.data?.rows;
                records.sort((a, b) => {
                    return new Date(b.oCreatedAt) - new Date(a.oCreatedAt);
                });
                setTableData(records ?? []);
                setIsOpen({ ...isOpen, view: true });
            }
        }).catch((error) => console.log(error));
    }

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title"> Agent wise Interaction </span>
                <div className="skel-dashboards-icons">
                    <a href="javascript:void(null)" onClick={() => setIsRefresh(!isRefresh)}>
                        <i className="material-icons">refresh</i>
                    </a>
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-graph-sect mt-3 mh-370">
                <table className="table table-hover mb-0 table-centered table-nowrap">
                    <tbody>
                        {listData?.length > 0 ? (
                            listData.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <h5 className="font-size-14 mb-0 skel-font-sm-bold"> {item.oCurrUserDesc ?? 'Others'} </h5>
                                    </td>
                                    <td>
                                        <p className="text-dark mb-0 cursor-pointer" onClick={() => countClicked(item.oCurrUser)}> {item.oIntxnCount} </p>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2}>
                                    <h5 className="font-size-14 mb-0 skel-font-sm-bold">No agent wise interactions found</h5>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <LastRefreshTime data={{ isRefresh, componentName: 'AgentWise' }} />
            </div>
            <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isOpen.view} onHide={() => setIsOpen({ ...isOpen, view: false })} dialogClassName="wsc-cust-mdl-temp-prev">
                <Modal.Header>
                    <Modal.Title><h5 className="modal-title">Interaction by {listData?.find(x => x.oCurrUser == agent)?.oCurrUserDesc ?? "Others"}</h5></Modal.Title>
                    <CloseButton onClick={() => setIsOpen({ ...isOpen, view: false })} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                        <span>×</span>
                    </CloseButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-lg-12 col-md-12 col-xs-12">
                        <DynamicTable
                            row={tableData ?? []}
                            itemsPerPage={10}
                            header={columns}
                            handler={{
                                handleCellRender: handleCellRender,
                            }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ display: 'block' }}>
                    <div className="skel-btn-center-cmmn">
                        <button type="button" className="skel-btn-cancel" onClick={() => setIsOpen({ ...isOpen, view: false })}>Close</button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AgentWise;