import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { get, post } from "../../common/util/restUtil";
import { properties } from '../../properties';
import LastRefreshTime from './LastRefreshTime';
import moment from 'moment';
import { CloseButton, Modal } from 'react-bootstrap';
import DynamicTable from '../../common/table/DynamicTable';
import { history } from '../../common/util/history';

const ChannelWise = (props) => {
    const { data, handlers } = props;
    const { searchParams, isParentRefresh } = data
    const [isRefresh, setIsRefresh] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [chartDataList, setChartDataList] = useState([]);
    const chartRef = useRef(null);
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
        post(properties.INTERACTION_API + "/channel-wise", { ...searchParams, category: "CHANNEL" }).then((resp) => {
            if (resp?.status == 200) {
                setChartData(resp?.data?.rows)
            }
        }).catch((error) => console.log(error));

    }, [searchParams, isRefresh, isParentRefresh]);

    const getDetailsList = (value, month) => {
        console.log('month------>', month)
        post(properties.INTERACTION_API + "/channel-wise-list", { ...searchParams, channel: [{ code: '', value }], category: "CHANNEL" }).then((resp) => {
            if (resp?.status == 200) {
                const data = resp?.data?.rows.sort((a, b) => {
                    return b.oIntxnId - a.oIntxnId;
                });
                setChartDataList(data?.filter((ele) => ele?.oDays === month));
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

    useEffect(() => {
        const xAxisData = [...new Set(chartData.map(item => item?.oMonthYear))];

        const priorities = [...new Set(chartData.map(item => item.oMonthYear))];
        const statuses = [...new Set(chartData.map(item => item.oCategoryValue))];

        const series = statuses.map(status => {
            const data = priorities.map(priority => {
                const matchingItem = chartData.find(item => item.oCategoryValue === status && item.oMonthYear === priority);
                return { value: matchingItem ? matchingItem.oIntxnCnt : 0, metaData: matchingItem }
            });

            return {
                name: status,
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: data
            };
        });

        const option = {
            title: {
                show: !chartData?.length > 0 ? true : false,
                textStyle: {
                    color: "grey",
                    fontSize: 20
                },
                text: "No data available",
                left: "center",
                top: "center"
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}<br/>{a}: {c}'
            },
            // toolbox: {
            //     show: true,
            //     feature: {
            //         dataView: { show: true, readOnly: false },
            //         magicType: { show: true, type: ['line', 'bar'] },
            //         restore: { show: true },
            //         saveAsImage: { show: true, name: 'Top 5 Interactions by Channel' }
            //     },
            //     top: "5%",
            // },
            legend: {
                width: "75%",
                left: "0",
                top: "5%"
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
                top: "30%"
            },
            xAxis: {
                type: 'category',
                data: xAxisData
            },
            yAxis: {
                type: 'value'
            },
            series: series
        };

        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        if (option && typeof option === 'object') {
            myChart.setOption(option);
        }

        myChart.on('click', (params) => {
            console.log('params --------xx-->', params);
            getDetailsList(params?.data?.metaData?.oCategoryCode, params?.data?.metaData?.oMonthYear);
        })

        window.addEventListener('resize', myChart.resize);

        return () => {
            window.removeEventListener('resize', myChart.resize);
            myChart.dispose();
        };
    }, [chartData]);

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title"> Top 5 Interactions by Channel </span>
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
            <div className="skel-perf-sect">
                <div className="skel-perf-graph h-400 mt-0">
                    <div ref={chartRef} style={{ height: '400px' }}></div>
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <LastRefreshTime data={{ isRefresh, componentName: 'ChannelWise' }} />
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

export default ChannelWise;