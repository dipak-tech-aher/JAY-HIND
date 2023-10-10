import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

import DynamicTable from '../../../common/table/DynamicTable'
import { properties } from '../../../properties';
import { get, post } from '../../../common/util/restUtil';
import moment from 'moment'
import PreviewModal from '../../previewModal'
import ReactSelect from 'react-select'

const AddEditCatalogPlan = (props) => {

    const [data, setData] = useState()
    const [exportBtn, setExportBtn] = useState(false);
    const [planList, setPlanList] = useState([])
    const [chargeList, setChargeList] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [planObject, setPlanObject] = useState({
        catalogPlanId: "",
        planId: "",
        planCatalogStatus: 'ACTIVE',
        mandatory: 'Y'
    })
    const [selectedPlanList, setSelectedPlanList] = useState([])
    const [showHide, setShowHide] = useState(true)
    const isCatalogTerminated = props?.data?.isCatalogTerminated 
    const planSelectedList = props.data.planSelectedList
    const setPlanSelectedList = props.handler.setPlanSelectedList
    const catalogData = props.data.catalogData

    useEffect(() => {
        
        post(properties.PLANS_API + "/search?all=true")
            .then((response) => {
                if (response.data) {
                    if (response.data.length === 0) {
                        toast.error("No Records Found")
                        return
                    }
                    setPlanList(response.data.filter((plan) => plan?.status !== 'INACTIVE' && plan?.serviceType === catalogData?.serviceType))
                    get(properties.CHARGE_API + "/search/all")
                        .then((resp) => {
                            if (resp.data.length > 0) {
                                setChargeList(resp.data)
                            }
                        }).catch(error => console.log(error))
                }
            }).catch(error => console.log(error))
            .finally()

    }, [])

    useEffect(() => {
        
        if(planSelectedList.length === 1)
        {
            if(planSelectedList[0]?.status === 'INACTIVE')
            {
                
                return
            }
        }
        if (planSelectedList.length > 0) {
            if (selectedPlanList.length === 0) {
                planSelectedList.forEach((planNode) => {
                    planList && !!planList.length && planList.forEach((plan) => {
                        if (Number(plan?.planId) === Number(planNode?.planId) && planNode?.status !== 'INACTIVE') {
                            let planCopy = {
                                ...planObject,
                                ...planNode,
                                ...plan
                            }
                            setSelectedPlanList([...selectedPlanList, planCopy])
                        }
                    })
                })
                setPlanObject({ ...planObject, planId: "", catalogPlanId: "" })
                setShowHide(false)
            }
        }
        
    }, [chargeList])

    const handleAdd = () => {
        if (planObject.planId === '') {
            toast.error("Please Select a Plan")
            return false
        }
        planList && !!planList.length && planList.forEach((plan) => {
            if (Number(plan.planId) === Number(planObject.planId)) {
                let planCopy = {
                    ...planObject,
                    ...plan
                }
                setPlanSelectedList([...planSelectedList, {
                    planId: Number(plan.planId),
                    catalogPlanId: "",
                    status: 'ACTIVE',
                    mandatory: 'Y'
                }])
                setSelectedPlanList([...selectedPlanList, planCopy])
            }
        })
        setShowHide(false)
        setPlanObject({ ...planObject, planId: "", catalogPlanId: "" })
    }

    const handleRemove = (data) => {
        if (data.catalogPlanId !== '') {
            let filteredData = selectedPlanList.filter((plan) => Number(plan.planId) !== Number(data.planId))
            setPlanSelectedList(
                planSelectedList.map((plan) => {
                    if (Number(plan.planId) === Number(data.planId)) {
                        plan.status = 'INACTIVE'
                    }
                    return plan
                })
            )
            setShowHide(true)
            setSelectedPlanList(filteredData)
        }
        else {
            let filteredData = selectedPlanList.filter((plan) => Number(plan.planId) !== Number(data.planId))
            let filteredData1 = planSelectedList.filter((plan) => Number(plan.planId) !== Number(data.planId))
            setShowHide(true)
            setSelectedPlanList(filteredData)
            setPlanSelectedList(filteredData1)
        }
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Plan Id") {
            return (<span className="text-secondary cursor-pointer" onClick={() => { setData(row.original); setIsModalOpen(true) }}>{cell.value}</span>)
        }
        else if (cell.column.Header === "View") {
            return (
                <button type="button" className="btn btn-labeled btn-primary btn-sm ml-1" onClick={() => { setData(row.original); setIsModalOpen(true) }}><i className="mdi mdi-file-document-edit-outline font10 mr-1"></i><small>View</small></button>
            )
        }
        else if (cell.column.Header === "Plan Charge Name") {
            let chargeName = []
            row?.original?.planCharges.map((charge) => {
                chargeList.map((chargeNode) => {
                    if (Number(charge.chargeId) === Number(chargeNode.chargeId)) {
                        chargeName.push(chargeNode.chargeName)
                    }
                })
            })
            return (<span>{chargeName.toString()}</span>)
        }
        else if (cell.column.Header === "Plan Charge Amount") {
            let chargeAmount = []
            row?.original?.planCharges.map((charge) => {
                chargeAmount.push(charge.chargeAmount)
            })
            return (<span>{chargeAmount.toString()}</span>)
        }
        else if (cell.column.Header === "Mandatory") {
            return (<div className="custom-control custom-checkbox">
                <input type="checkbox" disabled={true} /*disabled={isCatalogTerminated}*/ className="custom-control-input" value={cell.value} checked={cell.value === 'Y' ? true : false} />
                <label className="custom-control-label" htmlFor="customCheckp2"></label>
            </div>
            )
        }
        else if (cell.column.Header === "Start Date" || cell.column.Header === "End Date") {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : ''}</span>)
        }
        else if (cell.column.Header === "Status") {
            return (<span>{cell.value === 'ACTIVE' ? 'Active' : cell.value === 'INACTIVE' ? 'Inactive' : ''}</span>)
        }
        else if (cell.column.Header === "Remove") {
            return (<button type="button" disabled={isCatalogTerminated} className="btn btn-labeled btn-primary btn-sm" onClick={() => { handleRemove(row.original) }}>-</button>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    return (
        <>
            <div className="tab-pane" id="basictab2">
                <div className="row">
                    <div className="col-12">
                        {
                            showHide === true &&
                            <div className="col-12 ml-2 pb-2 row" id="planlist">
                                <div className="col-md-3 pl-0">
                                    <div className="form-group">
                                        <label htmlFor="planList" className="col-form-label">Search Plan Name <span className="text-danger">*</span></label>
                                        <ReactSelect
                                            id='planList'
                                            placeholder="Select Plan"

                                            menuPortalTarget={document.body} 
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            
                                            options={planList && !!planList.length > 0 && planList.map((plan) => ({ label: plan.planName, value: plan.planId }))}
                                            onChange={(selected) => {
                                                setPlanObject({ ...planObject, planId: selected.value })
                                            }}
                                            //value={planObject.planId}
                                        />
                                        {/* <div className="input-group form-inline">
                                            <select className="form-control select2-hidden-accessible" value={planObject.planId}
                                                onChange={(e) => { setPlanObject({ ...planObject, planId: e.target.value }) }}
                                            >
                                                <option value="">Select Plan</option>
                                                {
                                                    planList && !!planList.length > 0 && planList.map((plan, index) => (
                                                        <option value={plan.planId} key={index}>{plan.planName}</option>
                                                    ))
                                                }
                                            </select>
                                        </div> */}
                                    </div>
                                </div>
                                <div className="col-md-3 pl-0 mt-3 pt-2">
                                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" disabled={isCatalogTerminated}
                                        onClick={() => { handleAdd() }}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        }
                        <section>
                            <div className='m-1'>
                                {
                                    !!selectedPlanList.length &&
                                    <DynamicTable
                                        listKey={"Catalog Plan List"}
                                        row={selectedPlanList}
                                        header={planCatalogTableColumns}
                                        itemsPerPage={10}
                                        exportBtn={exportBtn}
                                        handler={{
                                            handleCellRender: handleCellRender,
                                            handleExportButton: setExportBtn
                                        }}
                                    />
                                }
                            </div>
                        </section>
                    </div>
                    {
                        isModalOpen &&
                        <PreviewModal
                            data={{
                                isOpen: isModalOpen,
                                data: data,
                                module: 'Plan'
                            }}
                            handler={{
                                setIsOpen: setIsModalOpen
                            }}
                        />
                    }
                </div>
            </div>
        </>
    )
}

export default AddEditCatalogPlan


const planCatalogTableColumns = [
    {
        Header: "Plan Id",
        accessor: "planId",
        disableFilters: true
    },
    {
        Header: "Plan Name",
        accessor: "planName",
        disableFilters: true
    },
    {
        Header: "Service Type",
        accessor: "serviceTypeDesc.description",
        disableFilters: true
    },
    {
        Header: "Start Date",
        accessor: "startDate",
        disableFilters: true
    },
    {
        Header: "End Date",
        accessor: "endDate",
        disableFilters: true
    },
    {
        Header: "Plan Charge Name",
        accessor: "planChargeName",
        disableFilters: true
    },
    {
        Header: "Plan Charge Amount",
        accessor: "planChargeAmount",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "planCatalogStatus",
        disableFilters: true
    },
    {
        Header: "Mandatory",
        accessor: "mandatory",
        disableFilters: true
    },
    {
        Header: "View",
        accessor: "view",
        disableFilters: true
    },
    {
        Header: "Remove",
        accessor: "action",
        disableFilters: true
    }
]