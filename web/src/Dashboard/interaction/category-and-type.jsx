import React, { useState, useEffect, useRef, useContext } from 'react';
import * as echarts from 'echarts';
import { get, post } from "../../common/util/restUtil";
import { properties } from '../../properties';
import LastRefreshTime from './LastRefreshTime';
import Filter from './filter';
import { InteractionDashboardContext } from "../../AppContext";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { history } from '../../common/util/history';
import moment from 'moment';
import { CloseButton, Modal } from 'react-bootstrap';
import DynamicTable from '../../common/table/DynamicTable';

const CategoryType = (props) => {
    const { height, mode, level, searchParams, isParentRefresh, color } = props?.data;
    // mode => interaction, service
    // level => category, type
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

    const capitalizeFirstLetter = (string) => {
        return string?.charAt(0)?.toUpperCase() + string?.slice(1);
    }

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
        post(properties.INTERACTION_API + `/${mode}/${level}/cnt`, { searchParams }).then((resp) => {
            if (resp?.status == 200) {
                console.log(mode, level, resp?.data?.rows);
                setChartData(resp?.data?.rows ?? [])
            }
        }).catch((error) => console.log(error));
    }, [isRefresh, searchParams, isParentRefresh])

    const interactionClicked = (data) => {
        console.log(data)
        let modee = data?.oCategory?.split("_")?.[0]?.toLowerCase();
        let levell = data?.oCategory?.split("_")?.[1]?.toLowerCase();
        // intxnType, intxnCat, serviceType, serviceCat
        const codes = {
            INTERACTION_CATEGORY: "intxnCat",
            INTERACTION_TYPE: "intxnType",
            SERVICE_CATEGORY: "serviceCat",
            SERVICE_TYPE: "serviceType",
        }
        let searchParamss = {
            ...searchParams,
            [codes[data?.oCategory]]: [{ value: data?.oCategoryCode }]
        }
        post(properties.INTERACTION_API + `/${modee}/${levell}/list`, { searchParams: searchParamss }).then((resp) => {
            if (resp?.status == 200) {
                let records = resp?.data?.rows?.filter(x => x[`o${capitalizeFirstLetter(modee)}${capitalizeFirstLetter(levell)}`] == data?.oCategoryValue);
                console.log(records.length);
                records.sort((a, b) => {
                    return new Date(b.oCreatedAt) - new Date(a.oCreatedAt);
                });
                setTableData(records ?? []);
                setIsOpen({ ...isOpen, view: true });
            }
        }).catch((error) => console.log(error));
    }

    useEffect(() => {
        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        const option = {
            tooltip: {
                trigger: 'axis',
            },
            xAxis: {
                type: 'category',
                axisLabel: { interval: 0, rotate: 35 },
                fontSize: 10,
                left: "10%",
                data: chartData.map(x => x.oCategoryValue)
            },
            // grid: {
            //     left: '3%',
            //     right: '4%',
            //     bottom: '3%',
            //     containLabel: true
            // },
            yAxis: {},
            series: {
                type: 'bar',
                encode: { x: 'name', y: 'score' },
                datasetIndex: 1
            },
            series: [
                {
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'inside'
                    },
                    data: chartData.map(x => ({
                        value: Number(x.oIntxnCnt),
                        metaData: x,
                        itemStyle: { color }
                    }))
                }
            ]
        };

        if (option && typeof option === 'object') {
            myChart.setOption(option);
        }

        myChart.on('click', (params) => {
            interactionClicked(params.data.metaData);
        });

        window.addEventListener('resize', myChart.resize);

        return () => {
            window.removeEventListener('resize', myChart.resize);
            myChart.dispose();
        };
    }, [chartData]);

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

    return (
        <React.Fragment>
            <div className="cmmn-skeleton">
                <div className="skel-dashboard-title-base">
                    <span className="skel-header-title"> Top 5 {capitalizeFirstLetter(mode)} {capitalizeFirstLetter(level)} </span>
                    <div className="skel-dashboards-icons">
                        <a href="javascript:void(null)" onClick={() => setIsRefresh(!isRefresh)}>
                            <i className="material-icons">refresh</i>
                        </a>

                    </div>
                </div>
                <hr className="cmmn-hline" />
                <div className="skel-graph-sect mh-370">
                    <div ref={chartRef} style={{ height }}></div>
                </div>
                <hr className="cmmn-hline" />
                <div className="skel-refresh-info">
                    <LastRefreshTime data={{ isRefresh, componentName: 'CategoryType' }} />
                </div>
            </div>
            <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isOpen.view} onHide={() => setIsOpen({ ...isOpen, view: false })} dialogClassName="wsc-cust-mdl-temp-prev">
                <Modal.Header>
                    <Modal.Title><h5 className="modal-title">Interaction Details</h5></Modal.Title>
                    <CloseButton onClick={() => setIsOpen({ ...isOpen, view: false })} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                        <span>×</span>
                    </CloseButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-lg-12 col-md-12 col-xs-12">
                        <DynamicTable
                            row={tableData ?? []}
                            itemsPerPage={10}
                            columnFilter={true}
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
        </React.Fragment>
    );
};

export default CategoryType;