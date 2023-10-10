import React, { useContext, useState, useEffect, useRef } from 'react'
import { toast } from "react-toastify";
import { post, get } from "../../../common/util/restUtil";
import { properties } from "../../../properties";
import { unstable_batchedUpdates } from 'react-dom';

const ServiceStatus = (props) => {

    const initialValues = {
        "Domain": "UNN_GW_TEST_DOMAIN",
        "Application": "all"
    }
    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [ServiceStatusData, setServiceStatusData] = useState([]);
    const [api, setApi] = useState({})
    const [operation, setOperation] = useState({})
    let hitAgain = false, data;

    useEffect(() => {
        getServiceStatusData();
    }, [])

    const getServiceStatusData = (Inputs) => {
        console.log('Inputs===>', Inputs)
        
        const requestBody = {
            ...searchInputs,
            ...Inputs
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        };
        let apiUrl
        //apiUrl = `http://172.17.20.126:4000/api/tibco/applicationStatus`
        apiUrl = properties.JOB_SERVICE_API
        if (hitAgain) {
            //     apiUrl = `http://172.17.20.126:4000/api/tibco/applicationOperationStatus`;
            apiUrl = `${properties.JOB_SERVICE_API}${Inputs.api}/${Inputs.Operation}`
        }
        get(apiUrl)
            .then((resp) => {
                console.log('hitAgain..', hitAgain)
                if (hitAgain) {
                    // delete searchInputs.Operation;
                    // console.log('here',searchInputs)
                    // setSearchInputs({
                    //     "Domain": "UNN_GW_TEST_DOMAIN",
                    //     "Application": "all"
                    // })
                    get(properties.JOB_SERVICE_API)
                        .then((resp) => {
                            if (resp.data) {
                                if (resp.status === 200) {
                                    // const responsedata = resolve(resp.json());
                                    const rows = resp.data;
                                    // console.log('..........', rows)
                                    if (rows.length > 0) {
                                        unstable_batchedUpdates(() => {
                                            setServiceStatusData(rows);
                                        })
                                    }
                                    else {
                                        toast.error("Records Not found");
                                    }
                                } else {
                                    setServiceStatusData([]);
                                    toast.error("Records Not Found");
                                }
                            } else {
                                setServiceStatusData([]);
                                toast.error("Records Not Found");
                            }
                        }).catch((error) => {
                            console.log(error)
                        })
                }
                // console.log('.....resp.....', resp.status)
                if (resp.data) {
                    if (resp.status === 200) {
                        // const responsedata = resolve(resp.json());
                        const rows = resp.data;
                        //  console.log('..........', rows)
                        if (rows.length > 0) {
                            unstable_batchedUpdates(() => {
                                setServiceStatusData(rows);
                            })
                        }
                    }
                }
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                
            });
    }

    return (
        <>
            <div className="content-page" cx="">
                <div className="content" cx="">
                    <div className="container-fluid" cx="">
                        <div className="row" cx="">
                            <div className="col-12" cx="">
                                <div className="page-title-box" cx="">
                                    <h4 className="page-title" cx="">Service Running Status</h4>
                                </div>
                            </div>
                        </div>
                        <div className="card-box p-0 border" cx="">
                            <div className="card-body p-2" cx="">
                                <div className="mt-3">
                                    <h5 className="mb-2">Application Services UP and Running Status</h5>

                                    <div className="row pb-1">
                                        {
                                            ServiceStatusData.map((e) => (

                                                <div className="col-xl-3 col-lg-6" >
                                                    <div className="card m-1 shadow-none border">
                                                        <div className="p-2">
                                                            <div className="row align-items-center">
                                                                <div className="col-auto">
                                                                    {
                                                                        ['Stopped', 'STOP', 'stop'].includes(e.Status || e.status) ? <svg height="40" width="40" className="blinking">
                                                                            <circle cx="15" cy="15" r="12" fill="red" />
                                                                            Sorry, your browser does not support inline SVG.
                                                                        </svg> : <div className="loader">{e.Status || e.status}</div>
                                                                    }
                                                                </div>
                                                                <div className="col pt-2" style={{ width: "10px" }}>
                                                                    <a  className="text-muted font-weight-bold">{e.Name || e.name}</a>
                                                                    {
                                                                        ['Stopped', 'STOP', 'stop'].includes(e.Status || e.status) ? <p className="mb-0 font-13 text-danger" >{e.Status || e.status}</p> : <p className="text-success" >{e.Status || e.status}</p>
                                                                    }
                                                                </div>

                                                                <div className="col pl-0">
                                                                    <div className="form-group">
                                                                        <div className="custom-control custom-switch">
                                                                            <input type="checkbox" id={e.id} className="custom-control-input" value={e.api} checked={["Running", "START", "start"].includes(e.Status || e.status) ? true : false} onChange={(x) => {
                                                                                if (x.target.checked === true) {
                                                                                    hitAgain = true
                                                                                    data = { Operation: 'start', Application: e.Name || e.name, AppSpace: e.AppSpace, api: e.api ? e.api : null }
                                                                                    setSearchInputs({ ...searchInputs }, data)
                                                                                }
                                                                                else if (x.target.checked === false) {
                                                                                    hitAgain = true
                                                                                    data = { Operation: 'stop', Application: e.Name || e.name, AppSpace: e.AppSpace, api: e.api ? e.api : null }
                                                                                    setSearchInputs({ ...searchInputs }, data)
                                                                                }
                                                                                getServiceStatusData(data)
                                                                            }}
                                                                            />
                                                                            <label htmlFor={e.id} className="custom-control-label mt-1">{searchInputs.Operation === 'Y' || ['Stopped', 'STOP', 'stop'].includes(e.Status || e.status) ? 'start' : 'stop'}</label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>))
                                        }
                                    </div>

                                    {/* <div className="row">
                                        <div className="col-xl-3 col-lg-6">
                                            <div className="card m-1 shadow-none border">
                                                <div className="p-2">
                                                    <div className="row align-items-center">
                                                        <div className="col-auto">
                                                            <div className="loader">Running</div>
                                                        </div>
                                                        <div className="col pt-2">
                                                            <a  className="text-muted font-weight-bold">Service
                                                                2</a>
                                                            <p className="text-success">Running</p>
                                                        </div>
                                                        <div className="col pl-0">
                                                            <div id="sameAsCustomerAddress" className="custom-control custom-switch">
                                                                <input type="checkbox" className="custom-control-input" id="qlinks"
                                                                    onchange="#" checked />
                                                                    <label className="custom-control-label mt-1" htmlFor="qlinks">Stop</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-xl-3 col-lg-6">
                                            <div className="card m-1 shadow-none border">
                                                <div className="p-2">
                                                    <div className="row align-items-center">
                                                        <div className="col-auto">
                                                            <svg height="40" width="40" className="blinking">
                                                                <circle cx="15" cy="15" r="12" fill="red" />
                                                                Sorry, your browser does not support inline SVG.
                                                            </svg>
                                                        </div>
                                                        <div className="col  p-2">
                                                            <a  className="text-muted font-weight-bold">SMS
                                                                Service</a>
                                                            <p className="mb-0 font-13 text-danger">Stopped</p>
                                                        </div>
                                                        <div className="col pl-0">
                                                            <div id="sameAsCustomerAddress" className="custom-control custom-switch">
                                                                <input type="checkbox" className="custom-control-input" id="stop" />
                                                                    <label className="custom-control-label mt-1" htmlFor="stop">Start</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div> */}
                                </div>
                                <div className="col-12 text-center mt-3" cx=""><button type="button"
                                    className="btn btn-sm waves-effect waves-light btn-primary"
                                    onClick="location.href='admin-settings.html'" cx="">Back to Admin Dashboard</button></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default ServiceStatus;