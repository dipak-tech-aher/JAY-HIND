import React, { useState, useContext, useEffect, useRef } from "react";
import icon from "../assets/images/template-img.png"
import { history } from "../common/util/history";
import { properties } from "../properties";
import { get, post, put } from "../common/util/restUtil";
import { TemplateContext } from "../AppContext";
import Modal from "react-modal"
import moment from 'moment'
import { toast } from "react-toastify";
const MapTemplate = () => {
    const [templateData, setTemplateData] = useState([])
    const [OpenAppointments, setOpenAppointments] = useState([])
    const [ClosedAppointments, setClosedAppointments] = useState([])
    const [TotalMappedCustomers, setTotalMappedCustomers] = useState([])
    const [BookedSlots, setBookedSlots] = useState([])
    const [selectedTemplateData, setSelectedTemplateData] = useState({})
    const [searchParams, setSearchParams] = useState({})
    const [openViewModal, setOpenViewModal] = useState(false)
    const [pinned, setPinned] = useState(false)
    const [searchText, setSearchText] = useState("");

    function handleSearch() {
        const reqBody = {}
        if (searchParams) {
            reqBody.searchParam = searchParams.searchParam
        }
        post(properties.MASTER_API + '/template/search', reqBody).then((resp) => {
            if (resp.status === 200) {
                post(properties.MASTER_API + '/template/get-mapped-unmapped', {}).then((mapResp) => {
                    if (mapResp.status === 200) {
                        const finalArr = []
                        for (const d of resp.data) {
                            mapResp.data.mappedTemplate.filter(e => {
                                if (e.templateId === d.templateId) {
                                    const obj = {
                                        ...d,
                                        ...e
                                    }
                                    finalArr.push(obj)
                                }
                            })
                        }
                        console.log('finalArr ', finalArr)
                        setTemplateData(finalArr)

                    }
                }).catch(error => console.log(error))
            }
        }).catch(error => console.log(error))
    }

    useEffect(() => {
        setSearchParams({})
        handleSearch()
    }, [])

    const handleView = (inputArray) => {
        console.log(inputArray)
        const openarr = [], closedarr = [], bookedarr = [], totalarr = []

        Array.of(inputArray).map(s1 => (
            s1.appointmentHdr.map(s2 => {
                s2.appointmentDet.filter(s3 => {
                    console.log('inside ', s3.status)
                    if (s3.status === 'AS_SCHED') {
                        openarr.push(s3)
                    } else if (s3.status === 'AS_COMP') {
                        closedarr.push(s3)
                    }
                })
                setOpenAppointments(openarr)
                setClosedAppointments(closedarr)

                s2.appointmentTxnDet.filter(s3 => {
                    if (s3.status === 'AS_SCHED') {
                        bookedarr.push(s3)
                    } else if (s3.status === 'AS_SCHED' && s3.appointUserCategory === 'CUSTOMER') {
                        totalarr.push(s3)
                    }
                })
                setBookedSlots(bookedarr)
                setTotalMappedCustomers(totalarr)
            })
        ))
    }

    const getSelectedTemplateData = (templateNo) => {
        post(properties.MASTER_API + '/template/search', { templateNo, from: 'mapScreen' }).then((resp) => {
            if (resp.status === 200) {
                console.log(resp.data);
                handleView(resp.data[0])
                let tempData = templateData.find(x => x.templateNo == templateNo);
                resp.data[0]['appointDetailCount'] = tempData.appointDetailCount;
                setSelectedTemplateData(resp.data[0])
                setOpenViewModal(true)
            }
        }).catch(err => toast.error("Error in fetching template details"))
    }

    const searchTextAvailable = (val) => {
        console.log("searchTextAvailable get called")
        return val.templateNo?.toLowerCase()?.includes(searchText.toLowerCase()) ||
            val.templateName?.toLowerCase()?.includes(searchText.toLowerCase());
    }

    const handlePin = (pinStatus, templateId) => {
        setPinned(pinStatus)
        put(`${properties.MASTER_API}/template/set-pinned-status`, { isPinned: pinStatus, entityCode: 'fOaauuatLv', entityId: templateId })
            .then((res) => {
                console.log(res)
                if (res.status == 200) {
                    handleSearch()
                }
            }).catch(error => console.log(error))
    }
    const contextProvider = {

    }
    return (
        <TemplateContext.Provider value={contextProvider}>
            <div className="customer-skel">
                <div className="cmmn-skeleton">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="skel-create-template-base">
                                <img src={icon} alt="" className="img-fluid" />
                            </div>
                        </div>
                        <div className="col-md-9 skel-appointment-templ">
                            <p className="skel-dashboard-info-msg mt-2 mb-3"><span>Template Master</span>Map Template in single view</p>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="input-group skel-cust-sr-input">
                                        <input type="text" className="form-control" placeholder="Search Template by Name and Number"
                                            onChange={(e) => setSearchText(e.target.value)}
                                        />
                                        <div className="input-group-append">
                                            <button className="skel-btn-sr-input" type="button">
                                                <i className="fa fa-search" onClick={handleSearch}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="tabbable mt-4">
                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    <li className="nav-item">
                                        <a className="nav-link active" id="all-tab" data-toggle="tab" href="#alltempl" role="tab" aria-controls="alltab" aria-selected="true">All</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="recent-tab" data-toggle="tab" href="#recenttempl" role="tab" aria-controls="recenttab" aria-selected="false">Recent</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="pin-tab" data-toggle="tab" href="#pinntempl" role="tab" aria-controls="pintab" aria-selected="false">Pinned</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="sms-tab" data-toggle="tab" href="#smstempl" role="tab" aria-controls="smstab" aria-selected="false">Popular Mapped Templates</a>
                                    </li>
                                </ul>
                            </div>

                            <div className="tab-content mt-3">
                                <div className="tab-pane fade active show skel-base-height" id="alltempl" role="tabpanel" aria-labelledby="all-tab">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="skel-templ">
                                                <div className="skel-templ-details skel-new-template" onClick={(e) => {
                                                    history.push(process.env.REACT_APP_BASE + '/map-template-form', { mode: 'ADD' })
                                                }}>
                                                    <div className="skel-create">
                                                        <i className="material-icons" onClick={(e) => {
                                                            history.push(process.env.REACT_APP_BASE + '/map-template-form', { mode: 'ADD' })
                                                        }}>add</i>
                                                        <span>Map Template</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            templateData && templateData.map((val, idx) => (
                                                (searchText == "" || searchTextAvailable(val)) && (
                                                    <div key={idx} className="col-md-4">
                                                        <div className="skel-templ">
                                                            <div className="skel-templ-details">
                                                                <div className="skel-templ-id">{val.templateNo}
                                                                    <span>
                                                                        <a onClick={() => {
                                                                            handlePin(val.templateMap.find(f => f.templateId === val.templateId)?.isPinned === true ? false : true, val.templateId)
                                                                        }}><i className={`fas fa-thumbtack ${val.templateMap.some(e => e.isPinned) === true ? "ml-1 g-color" : "ml-1"}`}></i>
                                                                        </a>
                                                                    </span>
                                                                </div>
                                                                <div className="skel-tot-slots">{val.mapCategoryDesc?.description}</div>
                                                                <div className="skel-templ-name">{val.templateName}</div>
                                                                <div className="skel-templ-status"><span className="skel-success">{val.statusDesc?.description}</span></div>
                                                                <div className="skel-tot-slots">{val.templateCategory === 'TC_APPOINT' ? 'Total slots ' + (val.appointDetailCount ?? '0') : ''}</div>
                                                            </div>
                                                            <hr />
                                                            <div className="skel-templ-bt">
                                                                <p className="apt-footer">
                                                                    {/* <a onClick={() => {
                                                                    history.push(process.env.REACT_APP_BASE + '/map-template-form', {data: val, mode: 'COPY'})                                                                       
                                                                    }}>
                                                                copy
                                                                </a> 
                                                                <span className="bar">|</span>*/}
                                                                    <a onClick={() => {
                                                                        history.push(process.env.REACT_APP_BASE + '/map-template-form', { data: val, mode: 'EDIT' })
                                                                    }}>
                                                                        edit
                                                                    </a>
                                                                    <span className="bar">|</span>
                                                                    <a data-target="#skel-view-modal-appointment-template" data-toggle="modal"
                                                                        onClick={() => {
                                                                            getSelectedTemplateData(val.templateNo)
                                                                        }}
                                                                    >
                                                                        view
                                                                    </a>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="recenttempl" role="tabpanel" aria-labelledby="recent-tab">
                                    <div className="row">
                                        {
                                            templateData && templateData.map((val, idx) => (
                                                val.templateMap.some(e => moment(e.createdAt).format('YYYY-MM-DD') <= moment(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)).format('YYYY-MM-DD')) === true ?
                                                    (searchText == "" || searchTextAvailable(val)) && (
                                                        <div key={idx} className="col-md-4">
                                                            <div className="skel-templ">
                                                                <div className="skel-templ-details">
                                                                    <div className="skel-templ-id">{val.templateNo}
                                                                        <span>
                                                                            <a onClick={() => {
                                                                                handlePin(val.templateMap.find(f => f.templateId === val.templateId)?.isPinned === true ? false : true, val.templateId)
                                                                            }}

                                                                            ><i className={`fas fa-thumbtack ${val.templateMap.some(e => e.isPinned) === true ? "ml-1 g-color" : "ml-1"}`}></i>
                                                                            </a>
                                                                        </span>
                                                                    </div>
                                                                    <div className="skel-templ-name">{val.templateName}</div>
                                                                    <div className="skel-templ-status"><span className="skel-success">{val.statusDesc?.description}</span></div>
                                                                    <div className="skel-tot-slots">{val.templateCategory === 'TC_APPOINT' ? 'Total slots ' + (val.appointDetailCount ?? '0') : ''}</div>
                                                                </div>
                                                                <hr />
                                                                <div className="skel-templ-bt">
                                                                    <p className="apt-footer">
                                                                        {/* <a onClick={() => {
                                                                history.push(process.env.REACT_APP_BASE + '/map-template-form', {data: val, mode: 'COPY'})                                                                       
                                                                }}>
                                                            copy
                                                            </a> 
                                                            <span className="bar">|</span>*/}
                                                                        <a onClick={() => {
                                                                            history.push(process.env.REACT_APP_BASE + '/map-template-form', { data: val, mode: 'EDIT' })
                                                                        }}>
                                                                            edit
                                                                        </a>
                                                                        <span className="bar">|</span>
                                                                        <a data-target="#skel-view-modal-appointment-template" data-toggle="modal"
                                                                            onClick={() => {
                                                                                getSelectedTemplateData(val.templateNo)
                                                                            }}
                                                                        >
                                                                            view
                                                                        </a>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                    : <></>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pinntempl" role="tabpanel" aria-labelledby="pin-tab">
                                    <div className="row">
                                        {
                                            templateData && templateData.map((val, idx) => (
                                                val.templateMap.some(e => e.isPinned) === true ?
                                                    (searchText == "" || searchTextAvailable(val)) && (
                                                        <div key={idx} className="col-md-4">
                                                            <div className="skel-templ">
                                                                <div className="skel-templ-details">
                                                                    <div className="skel-templ-id">{val.templateNo}
                                                                        <span>
                                                                            <a onClick={() => {
                                                                                handlePin(val.templateMap.find(f => f.templateId === val.templateId)?.isPinned === true ? false : true, val.templateId)
                                                                            }}><i className={`fas fa-thumbtack ${val.templateMap.some(e => e.isPinned) === true ? "ml-1 g-color" : "ml-1"}`}></i>
                                                                            </a>
                                                                        </span>
                                                                    </div>
                                                                    <div className="skel-templ-name">{val.templateName}</div>
                                                                    <div className="skel-templ-status"><span className="skel-success">{val.statusDesc?.description}</span></div>
                                                                    <div className="skel-tot-slots">{val.templateCategory === 'TC_APPOINT' ? 'Total slots ' + (val.appointDetailCount ?? '0') : ''}</div>
                                                                </div>
                                                                <hr />
                                                                <div className="skel-templ-bt">
                                                                    <p className="apt-footer">
                                                                        {/* <a onClick={() => {
                                                                    history.push(process.env.REACT_APP_BASE + '/map-template-form', {data: val, mode: 'COPY'})                                                                       
                                                                    }}>
                                                                copy
                                                                </a> 
                                                                <span className="bar">|</span>*/}
                                                                        <a onClick={() => {
                                                                            history.push(process.env.REACT_APP_BASE + '/map-template-form', { data: val, mode: 'EDIT' })
                                                                        }}>
                                                                            edit
                                                                        </a>
                                                                        <span className="bar">|</span>
                                                                        <a data-target="#skel-view-modal-appointment-template" data-toggle="modal"
                                                                            onClick={() => {
                                                                                getSelectedTemplateData(val.templateNo)
                                                                            }}
                                                                        >
                                                                            view
                                                                        </a>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                    : <></>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="smstempl" role="tabpanel" aria-labelledby="sms-tab">
                                    <div className="row">
                                        {
                                            templateData && templateData.map((val, idx) => (
                                                val.templateMap.some(e => e.isPopular) === true ?
                                                    (searchText == "" || searchTextAvailable(val)) && (
                                                        <div key={idx} className="col-md-4">
                                                            <div className="skel-templ">
                                                                <div className="skel-templ-details">
                                                                    <div className="skel-templ-id">{val.templateNo}
                                                                        <span>
                                                                            <a onClick={() => {
                                                                                handlePin(val.templateMap.find(f => f.templateId === val.templateId)?.isPinned === true ? false : true, val.templateId)
                                                                            }}><i className={`fas fa-thumbtack ${val.templateMap.some(e => e.isPinned) === true ? "ml-1 g-color" : "ml-1"}`}></i>
                                                                            </a>
                                                                        </span>
                                                                    </div>
                                                                    <div className="skel-templ-name">{val.templateName}</div>
                                                                    <div className="skel-templ-status"><span className="skel-success">{val.statusDesc?.description}</span></div>
                                                                    <div className="skel-tot-slots">{val.templateCategory === 'TC_APPOINT' ? 'Total slots ' + (val.appointDetailCount ?? '0') : ''}</div>
                                                                </div>
                                                                <hr />
                                                                <div className="skel-templ-bt">
                                                                    <p className="apt-footer">
                                                                        {/* <a onClick={() => {
                                                            history.push(process.env.REACT_APP_BASE + '/map-template-form', {data: val, mode: 'COPY'})                                                                       
                                                            }}>
                                                        copy
                                                        </a> 
                                                        <span className="bar">|</span>*/}
                                                                        <a onClick={() => {
                                                                            history.push(process.env.REACT_APP_BASE + '/map-template-form', { data: val, mode: 'EDIT' })
                                                                        }}>
                                                                            edit
                                                                        </a>
                                                                        <span className="bar">|</span>
                                                                        <a data-target="#skel-view-modal-appointment-template" data-toggle="modal"
                                                                            onClick={() => {
                                                                                getSelectedTemplateData(val.templateNo)
                                                                            }}
                                                                        >
                                                                            view
                                                                        </a>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                    : <></>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    selectedTemplateData &&
                    <Modal isOpen={openViewModal}>
                        <div className="modal-content">
                            <div className="modal-header px-4 border-bottom-0 d-block">
                                <button type="button" className="close" data-dismiss="modal" onClick={() => {
                                    setOpenViewModal(false)
                                }}
                                    aria-hidden="true">&times;</button>
                                <h5 className="modal-title">View Mapped Template</h5>
                            </div>
                            <div className="modal-body px-4">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="skel-templ-details skel-rem-min-ht">
                                            <div className="skel-templ-id">{selectedTemplateData.templateNo}</div>
                                            <div className="skel-templ-name">{selectedTemplateData.templateName}</div>
                                            <div className="skel-templ-status"><span className="skel-success">{selectedTemplateData.statusDesc?.description}</span></div>
                                        </div>
                                        <hr className="cmmn-hline" />
                                        <div className="container-three-row mt-2 mb-2">
                                            <div className="container-label">
                                                <span className="label-container-style">Template Type</span>
                                                <span>{selectedTemplateData.categoryDesc?.description}</span>
                                            </div>
                                            <div className="container-label">
                                                <span className="label-container-style">User Group</span>
                                                <span>{selectedTemplateData.userGroupDesc?.description}</span>
                                            </div>

                                            {
                                                selectedTemplateData.templateCategory === 'TC_APPOINT' ?
                                                    <>
                                                        <div className="container-label">
                                                            <span className="label-container-style">Appointment Type</span>
                                                            <span>{selectedTemplateData.appointmentHdr?.[0]?.appointTypeDesc?.description}</span>
                                                        </div>
                                                        <div className="container-label">
                                                            <span className="label-container-style">Holiday Calendar</span>
                                                            <span>{selectedTemplateData.appointmentHdr?.[0]?.appointmentDet?.[0]?.calendarDet?.calendarDescription}</span>
                                                        </div>
                                                        <div className="container-label">
                                                            <span className="label-container-style">Shift</span>
                                                            <span>{selectedTemplateData.appointmentHdr?.[0]?.appointmentDet?.[0]?.shiftDet?.shiftDescription}</span>
                                                        </div>
                                                        <div className="container-label">
                                                            <span className="label-container-style">Created At</span>
                                                            <span>{moment(selectedTemplateData.appointmentHdr?.[0]?.createdAt).format('YYYY-MM-DD')}</span>
                                                        </div>
                                                        <div className="container-label">
                                                            <span className="label-container-style">From - To Date</span>
                                                            <span>{selectedTemplateData.startDate} - {selectedTemplateData.endDate}</span>
                                                        </div>

                                                        <hr className="cmmn-hline" />
                                                        <p className="mt-2 mb-2">Total Slots: {selectedTemplateData?.appointDetailCount ?? '0'}</p>
                                                        <div className="slots">
                                                            <ul>
                                                                {selectedTemplateData?.appointmentHdr && selectedTemplateData?.appointmentHdr?.length > 0 && selectedTemplateData.appointmentHdr?.[0].appointmentDet?.map((slot, idx) => (
                                                                    <li key={idx}>{slot.appointStartTime + '-' + slot.appointEndTime}</li>
                                                                ))
                                                                }
                                                            </ul>
                                                        </div>
                                                    </>
                                                    :
                                                    <></>
                                            }

                                        </div>
                                    </div>
                                    {['TC_PRODUCTBUNDLE', 'TC_PROMOCODE'].includes(selectedTemplateData.templateCategory) ?
                                        <div className="col-md-12">

                                            <span className="label-container-style">Mapped Products</span>
                                            <hr className="cmmn-hline" />
                                            <table width={"100%"}>
                                                <thead>
                                                    <th>Product Name</th>
                                                    <th>Product Type</th>
                                                    <th>Product Sub Type</th>
                                                    <th>Service Type</th>
                                                </thead>
                                                <tbody>

                                                    {selectedTemplateData.templateMap?.map((val, key) => (
                                                        <tr key={key}>
                                                            <td>
                                                                {val?.templateMapName}
                                                            </td>
                                                            <td>
                                                                {val?.tranTypeDesc?.description}
                                                            </td>
                                                            <td>
                                                                {val?.serviceCategoryDesc?.description}
                                                            </td>
                                                            <td>
                                                                {val?.serviceTypeDesc?.description}
                                                            </td>
                                                        </tr>

                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        :
                                        <></>
                                    }
                                </div>
                                <span className="skel-profile-heading mt-3 mb-1 text-center">Mapped Template</span>
                                <hr className="cmmn-hline" />
                                <div className="row mt-3">
                                    {
                                        templateData?.length > 0 && templateData.map((val, idx) => (
                                            selectedTemplateData.templateId === val.templateId &&
                                            <div className="col-md-3">
                                                <div className="skel-map-templ-data">

                                                    <span className="skel-map-title">{val?.mapCategoryDesc?.description}</span>

                                                    {/* (val.templateCategory ? val.templateCategory : val.templateMst.templateCategory) === 'TC_APPOINT' ? */}
                                                    <div key={idx} className="skel-templ-cust-ht">
                                                        <div className="skel-templ-details">
                                                            <div className="skel-templ-id">{(val.templateNo ? val.templateNo : val.templateMst.templateNo)}</div>
                                                            <div className="skel-templ-name">{(val.templateName ? val.templateName : val.templateMst.templateName)}</div>
                                                        </div>
                                                    </div>
                                                    {/* : <></> */}

                                                </div>

                                            </div>
                                        ))
                                    }
                                    {/* <div className="col-md-3">
                                        <div className="skel-map-templ-data">
                                            <span className="skel-map-title">SMS</span>
                                            {
                                                templateData?.length > 0 && templateData.map((val, idx) => (
                                                    selectedTemplateData.templateId === val.templateId &&
                                                        (val.templateCategory ? val.templateCategory : val.templateMst.templateCategory) === 'TC_SMS' ?
                                                        <div key={idx} className="skel-templ-cust-ht">
                                                            <div className="skel-templ-details">
                                                                <div className="skel-templ-id">{(val.templateNo ? val.templateNo : val.templateMst.templateNo)}</div>
                                                                <div className="skel-templ-name">{(val.templateName ? val.templateName : val.templateMst.templateName)}</div>
                                                            </div>
                                                        </div>
                                                        : <></>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="skel-map-templ-data">
                                            <span className="skel-map-title">Email</span>
                                            {
                                                templateData?.length > 0 && templateData.map((val, idx) => (
                                                    selectedTemplateData.templateId === val.templateId &&
                                                        (val.templateCategory ? val.templateCategory : val.templateMst.templateCategory) === 'TC_EMAIL' ?
                                                        <div key={idx} className="skel-templ-cust-ht">
                                                            <div className="skel-templ-details">
                                                                <div className="skel-templ-id">{(val.templateNo ? val.templateNo : val.templateMst.templateNo)}</div>
                                                                <div className="skel-templ-name">{(val.templateName ? val.templateName : val.templateMst.templateName)}</div>
                                                            </div>
                                                        </div>
                                                        : <></>
                                                ))
                                            }
                                        </div>
                                    </div> */}
                                </div>
                                <hr className="cmmn-hline" />
                                {
                                    selectedTemplateData.templateCategory === 'TC_APPOINT' ?
                                        <ul className="skel-mapped-view">
                                            <li>Open Appointments ({OpenAppointments?.length || '0'})</li>
                                            <li>Closed Appointments ({ClosedAppointments?.length || '0'})</li>
                                            <li>Booked Slots ({BookedSlots?.length || '0'})</li>
                                            <li>Total Mapped Customers ({TotalMappedCustomers?.length || '0'})</li>
                                        </ul>
                                        : <> </>
                                }


                            </div>
                        </div>
                    </Modal>
                }
                <div className="skel-pg-bot-sect-btn">
                    <span>You are creating SMS Template.</span>
                    <div className="skel-btn-sect">
                        <button className="skel-btn-submit" onClick={() => {
                            history.push(process.env.REACT_APP_BASE + '/map-template-form')
                        }}>New Template</button>
                    </div>
                </div>
            </div>
        </TemplateContext.Provider>
    )
}

export default MapTemplate