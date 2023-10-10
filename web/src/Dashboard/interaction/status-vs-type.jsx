import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { post, get } from "../../common/util/restUtil";
import { properties } from '../../properties';
import LastRefreshTime from './LastRefreshTime';
import moment from 'moment';
import { CloseButton, Modal } from 'react-bootstrap';
import DynamicTable from '../../common/table/DynamicTable';
import { history } from '../../common/util/history';

const StatusVsType = (props) => {
    const { searchParams, isParentRefresh } = props?.data
    const [statusData, setStatusData] = useState([]);
    const [typeData, setTypeData] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [statusDataList, setStatusDataList] = useState([]);

    const [columns, setColums] = useState([
        {
            Header: "Interaction No",
            accessor: "oIntxnNo",
            disableFilters: true,
            id: "oIntxnNo"
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
            Header: "Current User",
            accessor: "oCurrUser",
            id: "oCurrUser",
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
    ]);

    useEffect(() => {
        post(properties.INTERACTION_API + "/by-status/percent", { searchParams, listCountDatatype: 'count' }).then((resp) => {
            if (resp?.status == 200) {
                setStatusData(resp?.data?.rows ?? [])
            }
        }).catch((error) => console.log(error));
        post(properties.INTERACTION_API + "/by-type/percent", { searchParams, listCountDatatype: 'count' }).then((resp) => {
            if (resp?.status == 200) {
                setTypeData(resp?.data?.rows ?? [])
            }
        }).catch((error) => console.log(error));
    }, [isRefresh, searchParams, isParentRefresh])

    function genData(chartData, attribute, code, callingFrom) {
        console.log('attribute------>', attribute, chartData)
        const codeName = chartData.map(x => x[code]);
        const nameList = chartData.map(x => x[attribute]);
        const legendData = [];
        const seriesData = [];
        for (var i = 0; i < nameList.length; i++) {
            legendData.push(nameList[i]);
            seriesData.push({
                callingFrom,
                code: codeName[i],
                name: nameList[i],
                value: Number(chartData.find(x => x[attribute] == nameList[i])?.oSIntxnPercentage?.replace(" %", ""))
            });
        }
        return {
            legendData: legendData,
            seriesData: seriesData
        };
    }

    const getDetailsList = (status, callingFrom) => {
        if (callingFrom === "Type") {
            const payloadSearchParams = { ...searchParams, intxnType: [{ code: '', value: status }] }
            post(properties.INTERACTION_API + "/by-type/percent", { searchParams: payloadSearchParams, listCountDatatype: 'list' }).then((resp) => {
                if (resp?.status == 200) {
                    const data = resp?.data?.rows.sort((a, b) => {
                        return b.oIntxnId - a.oIntxnId;
                    });
                    setStatusDataList(data ?? []);
                    setModalOpen(true)
                }
            }).catch((error) => console.log(error));
        } else {
            const payloadSearchParams = { ...searchParams, status: [{ code: '', value: status }] }
            post(properties.INTERACTION_API + "/by-status/percent", { searchParams: payloadSearchParams, listCountDatatype: 'list' }).then((resp) => {
                if (resp?.status == 200) {
                    const data = resp?.data?.rows.sort((a, b) => {
                        console.log('b.oIntxnId--->', b.oIntxnId, 'a.oIntxnId---', a.oIntxnId)
                        return b.oIntxnId - a.oIntxnId;
                    });
                    setStatusDataList(data ?? []);
                    setModalOpen(true)
                }
            }).catch((error) => console.log(error));
        }
    }

    const ChartComponent = ({ chartData, attribute, code, callingFrom }) => {
        const chartRef = useRef(null);
        useEffect(() => {
            const chartDom = chartRef.current;
            const myChart = echarts.init(chartDom, null, {
                renderer: 'canvas',
                useDirtyRect: false
            });

            const data = genData(chartData ?? [], attribute, code, callingFrom);

            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c}%'
                },
                legend: {
                    top: '1%',
                    left: 'center'
                },
                series: [
                    {
                        name: '',
                        type: 'pie',
                        label: {
                            position: 'inner',
                            fontSize: 12,
                            formatter: function (params) {
                                return `${params.percent}%`;
                            }
                        },
                        data: data.seriesData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            myChart.on('click', (params) => {
                console.log('params ---------->', params);
                getDetailsList(params?.data?.code, params?.data?.callingFrom);
            })

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
            <div ref={chartRef} style={{ height: '550px'/*, width:'800px'*/ }}></div>
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
        if (cell.column.id === "oCurrUser") {
            return (<span>{cell.value ?? "Others"}</span>);
        }
        else if (cell.column.id === "oCreatedAt") {
            return (<span>{moment(cell.value).format("DD-MM-YYYY hh:mm:ss")}</span>)
        }
        return (<span>{cell.value}</span>)
    }

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title"> Interaction by Status vs Interaction by Type </span>
                <div className="skel-dashboards-icons">
                    <a href="javascript:void(null)" onClick={() => setIsRefresh(!isRefresh)}>
                        <i className="material-icons">refresh</i>
                    </a>
                    {/* <a href="#">
                        <i className="material-icons">filter_alt</i>
                    </a> */}
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-graph-sect mt-3 skel-graph-grid">
                <div className="skel-two-grid">
                    <span className="text-center d-block mb-3"> Interaction By Status </span>
                    <div className="skel-graph-sect">
                        <ChartComponent chartData={statusData} attribute={'oStatusDesc'} code='oStatusCode' callingFrom='Status' />
                    </div>
                </div>
                <div className="skel-two-grid">
                    <span className="text-center d-block mb-3"> Interaction By Type </span>
                    <div className="skel-graph-sect">
                        <ChartComponent chartData={typeData} attribute={'oStatusDesc'} code='oStatusCode' callingFrom='Type' />
                    </div>
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <LastRefreshTime data={{ isRefresh, componentName: 'StatusVsType' }} />
            </div>

            <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={modalOpen} onHide={() => setModalOpen(!modalOpen)} dialogClassName="wsc-cust-mdl-temp-prev">
                <Modal.Header>
                    <Modal.Title><h5 className="modal-title">Interaction by Status</h5></Modal.Title>
                    <CloseButton onClick={() => setModalOpen(!modalOpen)} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                        <span>×</span>
                    </CloseButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-lg-12 col-md-12 col-xs-12">
                        <DynamicTable
                            row={statusDataList ?? []}
                            itemsPerPage={10}
                            header={columns}
                            columnFilter={true}
                            handler={{
                                handleCellRender: handleCellRender,
                            }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ display: 'block' }}>
                    <div className="skel-btn-center-cmmn">
                        <button type="button" className="skel-btn-cancel" onClick={() => setModalOpen(!modalOpen)}>Close</button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default StatusVsType;