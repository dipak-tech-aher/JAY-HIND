import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify';

import DynamicTable from '../../../common/table/DynamicTable'
import { properties } from '../../../properties';
import { get, post } from '../../../common/util/restUtil';
import moment from 'moment'
import PreviewModal from '../../previewModal'
import ReactSelect from 'react-select'

const AddEditCatalogService = (props) => {

    const [data, setData] = useState()
    const [exportBtn, setExportBtn] = useState(false);
    const [serviceList, setServiceList] = useState([])
    const [chargeList, setChargeList] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [serviceObject, setServiceObject] = useState({
        catalogServiceId: "",
        serviceId: "",
        serviceCatalogStatus: 'ACTIVE',
        mandatory: 'N'
    })
    const [selectedServiceList, setSelectedServiceList] = useState([])
    const [showHide, setShowHide] = useState(true)
    const serviceSelectedList = props.data.serviceSelectedList
    const setServiceSelectedList = props.handler.setServiceSelectedList
    const catalogData = props.data.catalogData
    const isCatalogTerminated = props?.data?.isCatalogTerminated
    const dynamicInfoMsg = useRef('Loading services...');

    useEffect(() => {
        
        post(properties.CATALOG_SERVICE_API + "/search?all=true")
            .then((response) => {
                if (response.data) {
                    if (response.data.length === 0) {
                        toast.error("No Records Found")
                        return
                    }
                    let services = response.data.filter((service) => service.status !== 'INACTIVE' && service?.serviceType === catalogData?.serviceType);
                    setServiceList(services);
                    if (!services.length) {
                        dynamicInfoMsg.current = 'No services found with the service type';
                    }
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

    const getServiceList = async () => {
        
        let services = []
        serviceSelectedList.forEach((serviceNode) => {
            serviceList && !!serviceList.length && serviceList.forEach((service) => {
                if (Number(service?.serviceId) === Number(serviceNode?.serviceId) && serviceNode?.status !== 'INACTIVE') {
                    let serviceCopy = {
                        ...serviceObject,
                        ...serviceNode,
                        ...service
                    }
                    services.push(serviceCopy)
                }
            })
        })
        
        return services
    }

    useEffect(async () => {
        
        if (serviceSelectedList.length > 0) {
            if (selectedServiceList.length === 0) {
                let services = await getServiceList()
                setSelectedServiceList(services)
                setServiceObject({ ...serviceObject, serviceId: "", catalogServiceId: "" })
                setShowHide(false)
            }
        }
        
    }, [chargeList])

    const handleAdd = () => {
        if (serviceObject.serviceId === '') {
            toast.error("Please Select a Service")
            return false
        }
        for (let service in selectedServiceList) {
            if (Number(selectedServiceList[service].serviceId) === Number(serviceObject.serviceId)) {
                toast.error("Service Already Added")
                setServiceObject({ ...serviceObject, serviceId: "", catalogServiceId: "" })
                return
            }
        }
        serviceList && !!serviceList.length && serviceList.forEach((service) => {
            if (Number(service.serviceId) === Number(serviceObject.serviceId)) {
                let serviceCopy = {
                    ...serviceObject,
                    ...service
                }
                setServiceSelectedList([...serviceSelectedList, {
                    serviceId: Number(service.serviceId),
                    catalogServiceId: "",
                    status: 'ACTIVE',
                    mandatory: 'N'
                }])
                setSelectedServiceList([...selectedServiceList, serviceCopy])
            }
        })
        setShowHide(false)
        setServiceObject({ ...serviceObject, serviceId: "", catalogServiceId: "" })
    }

    const handleRemove = (data) => {
        if (data.catalogServiceId !== '') {
            let filteredData = selectedServiceList.filter((service) => Number(service.serviceId) !== Number(data.serviceId))
            setServiceSelectedList(
                serviceSelectedList.map((service) => {
                    if (Number(service.serviceId) === Number(data.serviceId)) {
                        service.status = 'INACTIVE'
                    }
                    return service
                })
            )
            setShowHide(true)
            setSelectedServiceList(filteredData)
        }
        else {
            let filteredData = selectedServiceList.filter((service) => Number(service.serviceId) !== Number(data.serviceId))
            let filteredData1 = serviceSelectedList.filter((service) => Number(service.serviceId) !== Number(data.serviceId))
            setShowHide(true)
            setSelectedServiceList(filteredData)
            setServiceSelectedList(filteredData1)
        }
    }

    const handleMandatoryCheck = (e, data) => {
        setSelectedServiceList(
            selectedServiceList.map((service) => {
                if (Number(service.serviceId) === Number(data.serviceId)) {
                    service.mandatory = e.target.checked ? 'Y' : 'N'
                }
                return service
            })
        )
        setServiceSelectedList(
            serviceSelectedList.map((service) => {
                if (Number(service.serviceId) === Number(data.serviceId)) {
                    service.mandatory = e.target.checked ? 'Y' : 'N'
                }
                return service
            })
        )
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Service Id") {
            return (<span className="text-secondary cursor-pointer" onClick={() => { setData(row.original); setIsModalOpen(true) }}>{cell.value}</span>)
        }
        else if (cell.column.Header === "View") {
            return (
                <button type="button" className="btn btn-labeled btn-primary btn-sm ml-1" onClick={() => { setData(row.original); setIsModalOpen(true) }}><i className="mdi mdi-file-document-edit-outline font10 mr-1"></i><small>View</small></button>
            )
        }
        else if (cell.column.Header === "Service Charge Name") {

            let chargeName = []
            row?.original?.serviceCharges.map((charge) => {
                chargeList.map((chargeNode) => {
                    if (Number(charge.chargeId) === Number(chargeNode.chargeId)) {
                        chargeName.push(chargeNode.chargeName)
                    }
                })
            })

            return (<span>{chargeName.toString()}</span>)
        }
        else if (cell.column.Header === "Service Charge Amount") {

            let chargeAmount = []
            row?.original?.serviceCharges.map((charge) => {
                chargeAmount.push(charge.chargeAmount)
            })

            return (<span>{chargeAmount.toString()}</span>)
        }
        else if (cell.column.Header === "Mandatory") {
            return (
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" id={`mandatory${row.original.serviceId}`} disabled={isCatalogTerminated} className="custom-control-input " value={cell.value} checked={cell.value === 'Y' ? true : false} onChange={(e) => { handleMandatoryCheck(e, row.original) }} />
                    <label className="custom-control-label cursor-pointer" htmlFor={`mandatory${row.original.serviceId}`}></label>
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
                            showHide === true ?
                                <div className="col-12 ml-2 pb-2 row" id="servicelist">
                                    {
                                        !!serviceList.length ?
                                            <>
                                                <div className="col-md-3 pl-0">
                                                    <div className="form-group">
                                                        <label htmlFor="serviceList" className="col-form-label">Search Service Name</label>
                                                        <ReactSelect
                                                            id='serviceList'
                                                            placeholder="Select Service"

                                                            menuPortalTarget={document.body} 
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                            
                                                            options={serviceList && !!serviceList.length && serviceList.map((service) => ({ label: service.serviceName, value: service.serviceId }))}
                                                            onChange={(selected) => {
                                                                setServiceObject({ ...serviceObject, serviceId: selected.value })
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3 pl-0 mt-3 pt-2">
                                                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" disabled={isCatalogTerminated}
                                                        onClick={() => { handleAdd() }}
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </>
                                            :
                                            <p className="mx-auto">{dynamicInfoMsg.current}</p>
                                    }
                                </div>
                                :
                                <>
                                    <div className="float-right pb-1 pr-1">
                                        <button type="button" className="btn btn-labeled btn-primary btn-sm " disabled={isCatalogTerminated}
                                            onClick={() => { setShowHide(true) }}
                                        >
                                            Add New Service
                                        </button>
                                    </div>
                                </>
                        }
                        <section>
                            <div className='m-1'>
                                {
                                    !!selectedServiceList.length &&
                                    <DynamicTable
                                        listKey={"Catalog Service List"}
                                        row={selectedServiceList}
                                        header={serviceCatalogTableColumns}
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
                                module: 'Service'
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

export default AddEditCatalogService


const serviceCatalogTableColumns = [
    {
        Header: "Service Id",
        accessor: "serviceId",
        disableFilters: true
    },
    {
        Header: "Service Name",
        accessor: "serviceName",
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
        Header: "Service Charge Name",
        accessor: "serviceChargeName",
        disableFilters: true
    },
    {
        Header: "Service Charge Amount",
        accessor: "serviceChargeAmount",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "serviceCatalogStatus",
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