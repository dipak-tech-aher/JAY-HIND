import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { get, post } from "../../common/util/restUtil";
import { properties } from '../../properties';
import LastRefreshTime from './LastRefreshTime';
import moment from 'moment';
import { CloseButton, Modal } from 'react-bootstrap';
import DynamicTable from '../../common/table/DynamicTable';
import { history } from '../../common/util/history';

const StatementWise = (props) => {
    const { searchParams, isParentRefresh } = props?.data;
    console.log('searchParams------->', searchParams)
    const [chartData, setChartData] = useState([]);
    const [responseData, setResponseData] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);
    const chartRef = useRef(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [chartDataList, setChartDataList] = useState([]);
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
            accessor: "oStatusDesc",
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
        post(properties.INTERACTION_API + "/statement-wise", { ...searchParams, category: "STATEMENT" }).then((resp) => {
            if (resp?.status == 200) {
                const respData = resp?.data?.rows;
                setResponseData(respData)
                let data = []
                respData?.map((ele) => {
                    return data.push({ name: ele?.oCategoryValue, value: ele?.oIntxnCnt })
                });
                const oIntxnCntValues = respData.map(item => parseInt(item.oIntxnCnt));
                const totalValue = oIntxnCntValues.reduce((acc, value) => acc + value, 0);
                data.push({
                    value: totalValue,
                    itemStyle: {
                        color: 'none',
                        decal: {
                            symbol: 'none'
                        }
                    },
                    label: {
                        show: false
                    }
                })
                setChartData(data ?? []);
            }
        }).catch((error) => console.log(error));
    }, [isRefresh, searchParams, isParentRefresh])

    useEffect(() => {
        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        const option = {
            title: {
                show: !responseData?.length > 0 ? true : false,
                textStyle: {
                    color: "grey",
                    fontSize: 20
                },
                text: "No data available",
                left: "center",
                top: "center"
            },
            tooltip: {
                trigger: 'item'
            },
            // toolbox: {
            //     show: true,
            //     feature: {
            //         dataView: { show: false, readOnly: false },
            //         magicType: { show: false, type: ['line', 'bar'] },
            //         restore: { show: false },
            //         saveAsImage: { show: true, name: 'Top 5 Interactions by Statements' }
            //     },
            //     top: "0%",
            // },
            legend: {
                top: '5%',
                left: 'center',
                // doesn't perfectly work with our tricks, disable it
                selectedMode: false,
                width: "85%",
                left: "0"
            },
            series: [
                {
                    name: 'Interaction Statement',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '70%'],
                    // adjust the start angle
                    startAngle: 180,
                    label: {
                        show: true,
                        formatter(param) {
                            // correct the percentage
                            return param.name + ' (' + param.percent * 2 + '%)';
                        }
                    },
                    data: chartData
                }
            ]
        };

        if (option && typeof option === 'object') {
            myChart.setOption(option);
        }

        myChart.on('click', (params) => {
            console.log('params ---------->', params);
            getDetailsList(params?.data?.name);
        })


        window.addEventListener('resize', myChart.resize);

        return () => {
            window.removeEventListener('resize', myChart.resize);
            myChart.dispose();
        };
    }, [chartData]);


    const getDetailsList = (value) => {
        post(properties.INTERACTION_API + "/statement-wise-list", { ...searchParams, statement: value, category: "STATEMENT" }).then((resp) => {
            if (resp?.status == 200) {
                const data = resp?.data?.rows.sort((a, b) => {
                    return b.oIntxnId - a.oIntxnId;
                });
                setChartDataList(data);
                setModalOpen(true)
            }
        }).catch((error) => console.log(error));
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
                <span className="skel-header-title"> Top 5 Interactions by Statement </span>
                <div className="skel-dashboards-icons">
                    <a href="javascript:void(null)" >
                        <i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i>
                    </a>
                    {/* <a href="#">
                        <i className="material-icons">filter_alt</i>
                    </a> */}
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-perf-sect">
                <div className="skel-perf-graph h-400">
                    <div ref={chartRef} style={{ height: '450px' }}></div>
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <LastRefreshTime data={{ isRefresh, componentName: 'StatementWise' }} />
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
                            row={chartDataList ?? []}
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

export default StatementWise;