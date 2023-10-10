import * as FileSaver from "file-saver";
import moment from "moment";
import { nanoid } from 'nanoid';
import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import { toast } from "react-toastify";
import { DateRangePicker } from 'rsuite';
import * as XLSX from "xlsx";
import imgLeft from '../../assets/images/prameya-left.png';
import imgRight from '../../assets/images/prameya-right.png';
import { get } from '../../common/util/restUtil';
import { properties } from '../../properties';
import StackedHorizontalBar from './StackedHorizontalBar';

const Aggregation = () => {
    const [snefChartData, setSnefChartData] = useState([])
    const [snefTableData, setSnefTableData] = useState([])

    const [fensChartData, setFensChartData] = useState([])
    const [fensTableData, setFensTableData] = useState([])
    const [surveyRefNo, setSurveyRefNo] = useState('')
    const [selectedDate, setSelectedDate] = useState([])


    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: () => {
            // setGeneratePdf(false)
        }
    });


    useEffect(() => {
        const qryString = new URLSearchParams(window.location.search);
        const fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment().startOf('month').format("YYYY-MM-DD");
        const toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().endOf('month').format("YYYY-MM-DD")
        setSurveyRefNo(qryString.get("surveyRefNo"))
        get(`${properties.REPORTS_API}/survey/aggregation?type=SNEF&surveyNo=${qryString.get("surveyRefNo")}&fromDate=${fromDate}&toDate=${toDate}`).then((resp) => {
            if (resp.status === 200) {
                const series = []
                const a = resp?.data.service
                const yAxis = resp?.data?.yAxis
                for (let x = 0; x <= a[0].data.length - 1; x++) {
                    const desiredList = [];
                    a.forEach((item, index) => {
                        // const name = item.name;
                        const data = item.data[x];
                        desiredList.push({ [x]: data });
                    });
                    series.push({ name: yAxis[x], data: desiredList })
                }
                unstable_batchedUpdates(() => {
                    setSnefChartData(resp?.data)
                    setSnefTableData(series)
                })
            }
        }).catch((error) => {
            unstable_batchedUpdates(() => {
                setSnefChartData([])
                setSnefTableData([])
            })
            console.error(error)
        })

        get(`${properties.REPORTS_API}/survey/aggregation?type=FENS&surveyNo=${qryString.get("surveyRefNo")}&fromDate=${fromDate}&toDate=${toDate}`).then((response) => {
            if (response.status === 200) {
                const series = []
                const a = response?.data.service
                const yAxis = response?.data?.yAxis
                for (let x = 0; x <= a[0].data.length - 1; x++) {
                    const desiredList = [];
                    a.forEach((item, index) => {
                        // const name = item.name;
                        const data = item.data[x];
                        desiredList.push({ [x]: data });
                    });
                    series.push({ name: yAxis[x], data: desiredList })
                }
                unstable_batchedUpdates(() => {
                    setFensChartData(response?.data)
                    setFensTableData(series)
                })
            }
        }).catch((error) => {
            unstable_batchedUpdates(() => {
                setFensChartData([])
                setFensTableData([])
            })
            console.error(error)
        })

    }, [selectedDate])

    const handleDateFilter = (e) => {
        setSelectedDate(e)
    }

    const handleGenerateExcel = () => {
        if (fensTableData && fensTableData.length > 0 && fensTableData && fensTableData?.length > 0) {
            const excelData = [{
                data: snefTableData,
                sheetName: 'SNEF Summary'
            }, {
                data: fensTableData,
                sheetName: 'FENS Summary'
            }]
            exportExcel(excelData)
        } else {
            toast.info('No record to export')
        }
    };

    const handleGeneratePdf = () => {
        // setGeneratePdf(true)
        setTimeout(() => {
            handlePrint()
            // setGeneratePdf(false)
        }, 1000)
    }

    const exportExcel = (sheets) => {
        if (sheets.length === 0) {
            return;
        }

        const wb = {
            Sheets: {},
            SheetNames: [],
        };
        sheets.forEach((sheetData, index) => {
            const { data, sheetName } = sheetData;
            const tableData = [{ task: "", value0: 0, value1: 1, value2: 2, value3: 3, value4: 4, value5: 5 }]

            // for (const element of data) {
            data?.forEach((f) => {
                let b = {}
                const keys = Object.keys(f.data[0]);
                f.data.forEach((d, i) => {
                    b = { ...b, ['value' + i]: d[keys[0]] }
                })
                b = { task: f.name, ...b }
                tableData.push(b)
            })
            // let map = new Map();
            // for (const h of headerSheet) {
            //     const head = h.accessor;
            //     if (element.hasOwnProperty(head)) {
            //         map.set(h.Header, element[head]);
            //     }
            // }
            // const obj = Object.fromEntries(map);
            // tableData.push(obj);
            // }

            const ws = XLSX.utils.json_to_sheet(tableData, {
                origin: 'A2',
                skipHeader: true,
            });

            wb.Sheets[sheetName] = ws;
            wb.SheetNames.push(sheetName);
        });

        const excelBuffer = XLSX.write(wb, {
            bookType: 'xlsx',
            type: 'array',
        });

        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        FileSaver.saveAs(data, 'PatientDetails.xlsx');
    };

    return (
        <div id="pdf-content" className="content" ref={componentRef}>
            {/* style={{ margin: '100px 100px' }} */}
            <div className="container-fluid" >
                <div className="cnt-wrapper" style={{ margin: 'auto', width: '86%', padding: '10px' }}>
                    {/* Filter */}
                    <div className="row mt-2">
                        <div className="col-md-6 px-0">
                            <img alt="logo" src={imgLeft} width={'250px'} height={'100px'} />
                        </div>
                        <div className="col-md-6 px-0" style={{ display: "flex", justifyContent: 'flex-end' }}>
                            <img alt="logo" src={imgRight} width={'150px'} height={'100px'} />
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="col-md-12">
                            <div className="d-flex col-12">
                                <div className="row">
                                    <span>Date Filter</span>
                                    <DateRangePicker
                                        format="yyyy-MM-dd"
                                        character={' to '}
                                        value={selectedDate || []}
                                        onChange={handleDateFilter}
                                        placeholder="Select Date Range"
                                        className="z-idx w-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="row mt-2">
                            <div className="col-md-12 px-0">
                                {/* <div className="card"> */}
                                <div className="card-body">
                                    <div className="row col-md-12 px-2" style={{ display: "flex", justifyContent: 'flex-end' }}>
                                        {
                                            <div className="py-2">
                                                <button type="button" className="skel-btn-submit" onClick={handleGenerateExcel} > Export as Excel </button>
                                                <button type="button" className="skel-btn-submit" onClick={handleGeneratePdf}>Export as PDF </button>
                                            </div>
                                        }
                                    </div>

                                    <div className="col-md-12 p-2 bg-white border" id="cardCollpase5xc">
                                        <h4 className="header-title mb-3">SNEF Summary</h4>
                                        {fensTableData && fensTableData?.length > 0 ? <>
                                            <div className="col-md-12" width="100%" height="320">
                                                <StackedHorizontalBar
                                                    data={{
                                                        chartData: snefChartData
                                                    }}
                                                    handler={{
                                                        setChartData: setSnefChartData
                                                    }} />
                                            </div>
                                            <div className="col-md-12">
                                                <table className="skel-req-details mt-2">
                                                    <thead>
                                                        <tr>
                                                            <th key={nanoid()}>{ }</th>
                                                            {fensTableData?.[0]?.data?.map((header, headerIndex) => (
                                                                <th className='text-center' key={nanoid()}>{headerIndex}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            fensTableData.map((rows, rowsIndex) => (
                                                                <tr key={nanoid()} id={nanoid()}>
                                                                    <td key={nanoid()} width="20%">
                                                                        <input className="form-control input-sm border text-center" id={nanoid()} type="text" value={rows?.name} disabled={true} />
                                                                    </td>
                                                                    {rows?.data?.map((r) => (
                                                                        <td key={nanoid()}>
                                                                            <input className="form-control input-sm border text-center" style={{ background: '#fff' }} id={nanoid()} type="text" value={r[rowsIndex]} disabled={true} />
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </> :
                                            <p className="skel-widget-warning">No Record Found!!!</p>}
                                    </div>
                                    <div className="col-md-12 mt-2 bg-white border" id="cardCollpase5xc">
                                        <h4 className="header-title mb-3">FENS Summary</h4>
                                        {snefTableData && snefTableData?.length > 0 ? <>
                                            <div className="col-md-12" width="100%" height="320">
                                                <StackedHorizontalBar
                                                    data={{
                                                        chartData: fensChartData
                                                    }}
                                                    handler={{
                                                        setChartData: setFensChartData
                                                    }} />
                                            </div>
                                            <div className="col-md-12">
                                                <table className="skel-req-details mt-2">
                                                    <thead>
                                                        <tr>
                                                            <th key={nanoid()}>{ }</th>
                                                            {snefTableData?.[0]?.data?.map((header, headerIndex) => (
                                                                <th className='text-center' key={nanoid()}>{headerIndex}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            snefTableData.map((rows, rowsIndex) => (
                                                                <tr key={nanoid()} id={nanoid()}>
                                                                    <td key={nanoid()} width="20%">
                                                                        <input className="form-control input-sm border text-center" id={nanoid()} type="text" value={rows?.name} disabled={true} />
                                                                    </td>
                                                                    {rows?.data?.map((r) => (
                                                                        <td key={nanoid()}>
                                                                            <input className="form-control input-sm border text-center" style={{ background: '#fff' }} id={nanoid()} type="text" value={r[rowsIndex]} disabled={true} />
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </> :
                                            <p className="skel-widget-warning">No Record Found!!!</p>}
                                    </div>
                                </div>
                                {/* </div> */}
                            </div>
                        </div>

                    </div>
                    {/* {
                        generatePdf &&
                        <Modal isOpen={generatePdf}>
                            <BIDashboardPdf
                                pdfData={pdfData}
                                chartData={surveyList}
                                ref={componentRef}
                                handler={{
                                    handlePreviewCancel: false,
                                    handlePrint: false
                                }}
                            />
                        </Modal>
                    } */}
                </div>
            </div>
        </div >
    )

}

export default Aggregation;