import React, { useState } from 'react'
import { toast } from 'react-toastify'

const AddProperty = (props) => {

    const propertyObject = props.data.propertyObject
    const propertyList = props.data.propertyList
    const setPropertyList = props.handler.setPropertyList
    const setPropertyObject = props.handler.setPropertyObject
    const module = props.data.module
    const location = props.data.location
    const isTerminated = props.data.isTerminated
    const [propertyData, setPropertyData] = useState({
        property: '',
        description: ''
    })
    const [tableIndex, setTableIndex] = useState()

    const handlePropertySubmit = () => {
        let found = false
        for (let node in propertyList) {
            if (propertyList[node].property === propertyObject.property) {
                found = true
            }
        }
        if (found === true) {
            toast.error(`${module} Property already exist`)
            return true
        }
        if (propertyObject.property === "" || propertyObject.description === "") {
            toast.error(`Please Enter the ${module} Property Values`)
            return false
        }
        setPropertyList([...propertyList, propertyObject])
        setPropertyObject({
            property: "",
            description: ""
        })
    }

    const handlePropertyDelete = (propertyDelete) => {
        const filteredProperty = propertyList.filter((propertyMap) => propertyMap.property !== propertyDelete.property)
        setPropertyList(filteredProperty)
    }

    const handleEdit = (data, index) => {
        setPropertyData({
            ...propertyData,
            property: data.property,
            description: data.description
        })
    }

    const handleDone = (index) => {
        let found = false
        let count = 0
        let loopIndex
        if (propertyList.length > 1) {
            propertyList.map((prop, key) => {
                if (prop.property === propertyData.property) {
                    loopIndex = key
                    found = true
                    count = count + 1
                }
            })
        }
        if (found === true && count > 0 && index !== loopIndex) {
            toast.error(`${module} Property already exist`)
            return true
        }
        setPropertyList((prevState) => {
            let stateValue = prevState
            prevState[index] = { property: propertyData.property, description: propertyData.description }
            return prevState
        })
        setTableIndex()
    }
    return (
        <>
            <div className="col-12 pl-2 bg-light border mt-3">
                <h5 className="text-primary">Add {module} Property</h5>
            </div>
            <div className="col-12 pr-0 mt-2" id="billtable">
                <div className="data-scroll1" style={{ width: "100%", maxHeight: "200px", border: "1px solid #ccc", overflowX: "hidden", overflowY: "auto" }}>
                    <table className="table table-responsive table-bordered table-striped table-hover rowfy">
                        <thead>
                            <tr>
                                <th>{module} Property</th>
                                <th>{module} Description</th>
                                <th>Add/Remove</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                propertyList && !!propertyList.length && propertyList.map((module, index) => (
                                    <tr key={index}>
                                        <td>
                                            {
                                                index === tableIndex ?
                                                    <input type="text" disabled={location === 'edit'} className="form-control" id="property1" value={propertyData.property}
                                                        onChange={(e) => { setPropertyData({ ...propertyData, property: e.target.value }) }}
                                                    />
                                                    :
                                                    <input type="text" disabled={true} className="form-control" id="property" value={module.property} />
                                            }
                                        </td>
                                        <td>
                                            {
                                                index === tableIndex ?
                                                    <input type="text" className="form-control" id="descriptionq" value={propertyData.description}
                                                        onChange={(e) => { setPropertyData({ ...propertyData, description: e.target.value }) }}
                                                    />
                                                    :
                                                    <input type="text" disabled={true} className="form-control" id="description" value={module.description} />
                                            }


                                        </td>
                                        <td>
                                            <button type="button" className="btn btn-sm rowfy-deleterow btn-danger" disabled={isTerminated} onClick={() => {
                                                handlePropertyDelete(module)
                                            }}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                        <td>
                                            {
                                                index !== tableIndex ?
                                                    <button type="button" className="btn btn-sm rowfy-deleterow btn-primary" disabled={isTerminated} onClick={() => {
                                                        setTableIndex(index)
                                                        handleEdit(module, index)
                                                    }}
                                                    >Edit
                                                    </button>
                                                    :
                                                    <button type="button" className="btn btn-sm rowfy-deleterow btn-success" disabled={isTerminated} onClick={() => {
                                                        handleDone(index)
                                                    }}
                                                    >Done
                                                    </button>
                                            }
                                        </td>
                                    </tr>
                                ))
                            }
                            <tr>
                                <td>
                                    <input type="text" className="form-control" id="property" value={propertyObject.property}
                                        onChange={(e) => {
                                            setPropertyObject({ ...propertyObject, property: e.target.value })
                                        }}
                                    />
                                </td>
                                <td>
                                    <input type="text" className="form-control" id="description" value={propertyObject.description}
                                        onChange={(e) => {
                                            setPropertyObject({ ...propertyObject, description: e.target.value })
                                        }}
                                    />
                                </td>
                                <td>
                                    <button type="button" className="btn btn-sm rowfy-addrow btn-success " disabled={isTerminated} onClick={() => {
                                        handlePropertySubmit()
                                    }}
                                    >
                                        Add
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default AddProperty;