import React, { useState, useEffect, useRef, useContext } from 'react';
import * as echarts from 'echarts';
import { get, post } from "../../common/util/restUtil";
import { properties } from '../../properties';
import { CloseButton, Modal } from 'react-bootstrap';
import DynamicTable from '../../common/table/DynamicTable';
import moment from 'moment';
import LastRefreshTime from './LastRefreshTime';
import { history } from '../../common/util/history';
import { AppContext } from '../../AppContext';

const AgeingVsFollowups = (props) => {
    let { appConfig } = useContext(AppContext);

    const { searchParams, isParentRefresh } = props?.data
    const [ageingChartData, setAgeingChartData] = useState({});
    const [followupChartData, setFollowupChartData] = useState({});
    const [tableData, setTableData] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isRefresh, setIsRefresh] = useState(false);
    const [type, setType] = useState();

    const [filters, setFilters] = useState([]);

    const columns = [
        {
            Header: "Interaction No",
            accessor: "oIntxnNo",
            disableFilters: false,
            id: "oIntxnNo"
        },
        {
            Header: `${appConfig?.clientFacingName?.customer ?? 'Customer'} Name`,
            accessor: "oCustomerName",
            disableFilters: false,
        },
        {
            Header: "Interaction Category",
            accessor: "oInteractionCategory",
            disableFilters: false,
        },
        {
            Header: "Interaction Type",
            accessor: "oInteractionType",
            disableFilters: false,
        },
        {
            Header: "Service Category",
            accessor: "oServiceCategory",
            disableFilters: false,
        },
        {
            Header: "Service Type",
            accessor: "oServiceType",
            disableFilters: false,
        },
        {
            Header: "Priority",
            accessor: "oPriority",
            disableFilters: false,
        },
        {
            Header: "Project",
            accessor: "oProject",
            disableFilters: false,
        },
        {
            Header: "Status",
            accessor: "oStatus",
            disableFilters: false,
        },
        {
            Header: "Channel",
            accessor: "oChannel",
            disableFilters: false,
        },
        {
            Header: "Current User",
            accessor: "oCurrUser",
            id: "oCurrUser",
            disableFilters: false,
        },
        {
            Header: "Created User",
            accessor: "oCreatedUser",
            disableFilters: false,
        },
        {
            Header: "Created At",
            accessor: "oCreatedAt",
            disableFilters: false,
            id: "oCreatedAt"
        }
    ]

    useEffect(() => {
        console.log("filters ===> ", filters);
    }, [filters])

    useEffect(() => {
        post(properties.INTERACTION_API + "/by-ageing", { searchParams }).then((resp) => {
            if (resp?.status == 200) {
                setAgeingChartData(resp?.data?.rows?.[0] ?? {})
            }
        }).catch((error) => console.log(error));

        post(properties.INTERACTION_API + "/by-followups", { searchParams }).then((resp) => {
            if (resp?.status == 200) {
                setFollowupChartData(resp?.data?.rows?.[0] ?? {})
            }
        }).catch((error) => console.log(error));
    }, [isRefresh, searchParams, isParentRefresh])

    const ChartComponent = ({ chartData }) => {
        const chartRef = useRef(null);

        useEffect(() => {
            const chartDom = chartRef.current;
            const myChart = echarts.init(chartDom, null, {
                renderer: 'canvas',
                useDirtyRect: false
            });

            const option = {
                xAxis: {
                    type: 'category',
                    data: ['0 to 3', '3 to 5', '> 5']
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: [
                            {
                                value: chartData?.oIntxn3DayCnt ?? 0,
                                itemStyle: {
                                    color: '#d85454'
                                }
                            },
                            {
                                value: chartData?.oIntxn5DayCnt ?? 0,
                                itemStyle: {
                                    color: '#ff9e45'
                                }
                            },
                            {
                                value: chartData?.oIntxnMoreThan5DayCnt ?? 0,
                                itemStyle: {
                                    color: '#509ade'
                                }
                            }
                        ],
                        type: 'bar',
                        label: {
                            show: true,
                            position: 'inside'
                        }
                    }
                ]
            };

            if (option && typeof option === 'object') {
                myChart.setOption(option);
            }

            window.addEventListener('resize', myChart.resize);

            return () => {
                window.removeEventListener('resize', myChart.resize);
                myChart.dispose();
            };
        }, [chartData]);

        return (
            <div ref={chartRef} style={{ height: '240px' }}></div>
        )
    }

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
        else if (cell.column.id === "oCreatedAt") {
            return (<span>{moment(cell.value).format("DD-MM-YYYY hh:mm:ss")}</span>)
        }
        else if (cell.column.id === "oCurrUser") {
            return (<span>{cell.value ?? "Others"}</span>)
        }
        return (<span>{cell.value}</span>)
    }

    const countClicked = (type, duration) => {
        setType(type);
        post(properties.INTERACTION_API + `/by-${type}`, { searchParams: { category: duration, ...searchParams } }).then((resp) => {
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
                <span className="skel-header-title"> Interaction by Ageing vs Follow-up by Ageing </span>
                <div className="skel-dashboards-icons">
                    <a href="javascript:void(null)" onClick={() => setIsRefresh(!isRefresh)}>
                        <i className="material-icons" >refresh</i>
                    </a>
                    {/* <a href="#">
                        <i className="material-icons">filter_alt</i>
                    </a> */}
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-graph-sect mt-3 skel-graph-grid">
                <div className="skel-two-grid">
                    <span className="text-center d-block mb-3">Interaction By Ageing </span>
                    <div className="row">
                        <div className="col-4">
                            <div className="text-center">
                                <p className="mb-2 text-truncate skel-sm-heading"> 0 to 3 </p>
                                <h4 className="text-dark cursor-pointer skel-font-sm-bold" onClick={() => countClicked('ageing', '0_3DAYS')}> {ageingChartData?.oIntxn3DayCnt ?? 0} </h4>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="text-center">
                                <p className="mb-2 text-truncate skel-sm-heading"> 3 to 5 </p>
                                <h4 className="text-dark cursor-pointer skel-font-sm-bold" onClick={() => countClicked('ageing', '3_5DAYS')}> {ageingChartData?.oIntxn5DayCnt ?? 0} </h4>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="text-center">
                                <p className="mb-2 text-truncate skel-sm-heading"> &gt; 5 </p>
                                <h4 className="text-dark cursor-pointer skel-font-sm-bold" onClick={() => countClicked('ageing', 'MORE_5DAYS')}> {ageingChartData?.oIntxnMoreThan5DayCnt ?? 0} </h4>
                            </div>
                        </div>
                    </div>

                    <ChartComponent chartData={ageingChartData} />

                </div>
                <div className="skel-two-grid">
                    <span className="text-center d-block mb-3"> Follow-up By Ageing </span>
                    <div className="row">
                        <div className="col-4">
                            <div className="text-center">
                                <p className="mb-2 text-truncate skel-sm-heading"> 0 to 3 </p>
                                <h4 className="text-dark cursor-pointer skel-font-sm-bold" onClick={() => countClicked('followups', '0_3DAYS')}> {followupChartData?.oIntxn3DayCnt ?? 0} </h4>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="text-center">
                                <p className="mb-2 text-truncate skel-sm-heading"> 3 to 5 </p>
                                <h4 className="text-dark cursor-pointer skel-font-sm-bold" onClick={() => countClicked('followups', '3_5DAYS')}> {followupChartData?.oIntxn5DayCnt ?? 0} </h4>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="text-center">
                                <p className="mb-2 text-truncate skel-sm-heading"> &gt; 5 </p>
                                <h4 className="text-dark cursor-pointer skel-font-sm-bold" onClick={() => countClicked('followups', 'MORE_5DAYS')}> {followupChartData?.oIntxnMoreThan5DayCnt ?? 0} </h4>
                            </div>
                        </div>
                    </div>

                    <ChartComponent chartData={followupChartData} />

                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <LastRefreshTime data={{ isRefresh, componentName: 'AgeingVsFollowups' }} />
            </div>
            <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isOpen.view} onHide={() => setIsOpen({ ...isOpen, view: false })} dialogClassName="wsc-cust-mdl-temp-prev">
                <Modal.Header>
                    <Modal.Title><h5 className="modal-title">Interaction by {type}</h5></Modal.Title>
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
                            columnFilter={true}
                            handler={{
                                handleCellRender: handleCellRender,
                                handleFilters: setFilters,
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

export default AgeingVsFollowups;