import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { get, post } from "../../common/util/restUtil";
import { properties } from '../../properties';
import moment from 'moment';
import { CloseButton, Modal } from 'react-bootstrap';
import DynamicTable from '../../common/table/DynamicTable';
import LastRefreshTime from './LastRefreshTime';
import { history } from '../../common/util/history';

const Priority = (props) => {
    const { searchParams, isParentRefresh } = props?.data
    const [chartData, setChartData] = useState([]);
    const chartRef = useRef(null);
    const [isRefresh, setIsRefresh] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const [columns, setColums] = useState([
        {
            Header: "Interaction No",
            accessor: "oIntxnNo",
            disableFilters: true,
            id: "oIntxnNo"
        },
        // {
        //     Header: "Customer Name",
        //     accessor: "oCustomerName",
        //     disableFilters: true,
        // },
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
            accessor: "oCurrUserDesc",
            id: "oCurrUserDesc",
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
        post(properties.INTERACTION_API + "/by-priority", { searchParams }).then((resp) => {
            if (resp?.status == 200) {
                setChartData(resp?.data?.rows ?? [])
            }
        }).catch((error) => console.log(error));
    }, [isRefresh, isParentRefresh, searchParams])

    const stringToColour = (str) => {
        let hash = 0;
        str.split('').forEach(char => {
            hash = char.charCodeAt(0) + ((hash << 5) - hash)
        })
        let colour = '#'
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff
            colour += value.toString(16).padStart(2, '0')
        }
        return colour
    }

    useEffect(() => {
        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        const xAxisLabels = chartData.map(x => x.oPriorityDesc);
        const xAxisData = chartData.map(x => ({ value: x.oIntxnCount, itemStyle: { color: stringToColour(x.oPriorityDesc) } }));

        const option = {
            title: {
                show: chartData.length === 0,
                textStyle: {
                    color: "grey",
                    fontSize: 20
                },
                text: "No interactions found",
                left: "center",
                top: "center"
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: xAxisLabels

            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'Count',
                    type: 'bar',
                    data: xAxisData
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


    const countClicked = (oPriorityCode) => {
        console.log('oPriorityCode------->', oPriorityCode)
        let searchPayload = { ...searchParams, category: 'LIST' }
        searchPayload.priority = [{ "label": "", "value": oPriorityCode }]
        post(properties.INTERACTION_API + "/by-priority", { searchParams: searchPayload }).then((resp) => {
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
        else if (cell.column.id === "oCurrUserDesc") {
            return (<span>{cell.value ?? "Others"}</span>)
        }
        return (<span>{cell.value}</span>)
    }

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title"> Interactions by Priority </span>
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
            <div className="row mt-3">
                <div className="col-4">
                    <div className="text-center">
                        <p className="mb-2 text-truncate skel-sm-heading"> High </p>
                        <h4 className="text-dark cursor-pointer skel-font-sm-bold" onClick={() => countClicked('PRTYHGH')}>{chartData?.find(x => x.oPriorityCode == 'PRTYHGH')?.oIntxnCount ?? 0}</h4>
                    </div>
                </div>
                <div className="col-4">
                    <div className="text-center">
                        <p className="mb-2 text-truncate skel-sm-heading"> Medium </p>
                        <h4 className="text-dark cursor-pointer skel-font-sm-bold" onClick={() => countClicked('PRTYMED')}>{chartData?.find(x => x.oPriorityCode == 'PRTYMED')?.oIntxnCount ?? 0}</h4>
                    </div>
                </div>
                <div className="col-4">
                    <div className="text-center">
                        <p className="mb-2 text-truncate skel-sm-heading"> Low </p>
                        <h4 className="text-dark cursor-pointer skel-font-sm-bold" onClick={() => countClicked('PRTYLOW')}>{chartData?.find(x => x.oPriorityCode == 'PRTYLOW')?.oIntxnCount ?? 0}</h4>
                    </div>
                </div>
            </div>
            <div className="skel-graph-sect mt-2">
                <div ref={chartRef} style={{ height: '545px' }}></div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <LastRefreshTime data={{ isRefresh, componentName: 'Priority' }} />
            </div>
            <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isOpen.view} onHide={() => setIsOpen({ ...isOpen, view: false })} dialogClassName="wsc-cust-mdl-temp-prev">
                <Modal.Header>
                    <Modal.Title><h5 className="modal-title">Interaction by Priority</h5></Modal.Title>
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

export default Priority;