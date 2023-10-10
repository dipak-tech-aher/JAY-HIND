import React, { useState, useEffect } from "react";
import DynamicTable from "../../common/table/DynamicTable";
import { ManageParametersCols } from "./manageParaCol"
import { properties } from "../../properties";
import { history } from '../../common/util/history';
import { get } from "../../common/util/restUtil";
import AddParameter from "./addParameter";
import Modal from 'react-modal';
import EditParameter from "./editParameter";
import { RegularModalCustomStyles } from "../../common/util/util";
import ParametersMapping from "./ParametersMapping";


const ManageParameters = (props) => {
    // console.log('Props ----------------------->', props?.props?.screenName)
    const screenName = props?.props?.screenName
    const [data, setData] = useState([])
    const [adminMenu, setAdminMenu] = useState([]);
    const [isActive, setIsActive] = useState()
    const [display, setDisplay] = useState(false);
    const [update, setUpdate] = useState(false);
    const [exportBtn, setExportBtn] = useState(true);
    const [isOpen, setIsOpen] = useState(false)
    const [listSearch, setListSearch] = useState([]);
    const showtab = (selectedMenuId) => { setIsActive(selectedMenuId) }
    const [codeType, setCodeType] = useState("")
     
    let type
    if (screenName === 'Business Parameter Management') {
        type = 'management'
    } else if (screenName === 'Business Parameter Mapping') {
        type = 'mapping'
    }

    useEffect(() => {

        get(properties.MASTER_API + "/code-types")
            .then(resp => {
                if (resp.data) {
                    setAdminMenu(resp.data)
                    handleRender(resp.data?.[0].codeType)
                    setIsActive(resp.data?.[0].codeType)
                    setCodeType(resp.data?.[0].codeType)
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }, [])

    useEffect(() => {
        if (display === false && update === false && isOpen === false) {
            handleRender(isActive)
        }
    }, [display, update, isOpen])

    const handleRender = (e) => {
        if (e) {
            setListSearch({ codeType: e })
            get(properties.MASTER_API + "/list/" + e)
                .then(resp => {
                    if (resp.data) {
                        let value = Object.keys(resp.data).map((key) => resp.data[key]);
                        let merged = [].concat.apply([], value);
                        console.log('merged', merged)
                        setData(resp.data.rows)
                    }
                }).catch((error) => {
                    console.log(error)
                })
        }
    }

    const handleSubmit = (data, code) => {
        setData(data);
        setUpdate(true)
    }


    const handleParameterMapping = (data) => {
        setData(data);
        setIsOpen(true)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Edit") {
            return (
                <button type="button" className="skel-btn-submit" onClick={() => handleSubmit(row.original, row.original.code)}><span><i className="mdi mdi-file-document-edit-outline font20"></i></span> Edit</button>
            )
        }
        else if (cell.column.Header === "Mapping") {
            return (
                <button type="button" className="map-btn skel-btn-submit" onClick={() => handleParameterMapping(row.original)}><span><i className="ti-arrow-circle-right font20"></i></span>Map</button >
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }


    return (
        <>
            {
                (display) &&
                <Modal style={RegularModalCustomStyles} isOpen={display}>
                    <AddParameter Code={{
                        adminMenu,
                        codeType
                        }}
                        setDisplay={setDisplay} />
                </Modal>
            }
            <hr className="cmmn-hline" />
            <div className="row mt-1">
                <div className="skel-config-base">
                    <div className="col-lg-12">
                        <div className="m-t-30">
                            <form className="col-12 d-flex justify-content-left ml-1" >
                                <div className="col-8 form-row align-items-left">
                                    <label><h5>Business Parameter :</h5></label>
                                    <select className="form-control" id="example-select" required
                                        style={{ width: "400px" }}
                                        autoFocus
                                        onChange={(e) => { setCodeType(e.target.value); handleRender(e.target.value); showtab(e.target.value) }}
                                    >
                                        {
                                            adminMenu.map((e) => (
                                                <option key={e.codeType} value={e.codeType}>{e.description}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </form>
                            <div className="tab-content p-0">
                                <div className="tab-pane  show active" id="naturecode">
                                    <div className="row mt-2" id="datatable">
                                        <div className="col-lg-12 p-0">
                                            <div className="card-body">
                                                {
                                                    data.length > 0 &&
                                                    <div className="">
                                                        <div className="card-body">
                                                            <div style={{ width: "100%", overflowX: "auto", overflowY: "hidden", whiteSpace: "nowrap" }}>
                                                                <DynamicTable
                                                                    listSearch={listSearch}
                                                                    listKey={"Manage Parameters"}
                                                                    row={data}
                                                                    header={type === 'mapping'
                                                                        ? ManageParametersCols.filter((e) => e.Header !== 'Edit')
                                                                        : type === 'management'
                                                                            ? ManageParametersCols.filter((e) => e.Header !== 'Mapping')
                                                                            : ManageParametersCols}
                                                                    itemsPerPage={10}
                                                                    exportBtn={exportBtn}
                                                                    handler={{
                                                                        handleCellRender: handleCellRender,
                                                                        handleExportButton: setExportBtn
                                                                    }}
                                                                    customButtons={(
                                                                        <button onClick={() => setDisplay(true)} type="button" hidden={(type === 'mapping')} className="skel-btn-submit">
                                                                            Add New Parameters
                                                                        </button>
                                                                    )}
                                                                    bulkUpload={(
                                                                        <button className="skel-btn-orange mr-1" hidden={(type === 'mapping')} onClick={() => history.push(`${process.env.REACT_APP_BASE}/create-bulk-upload`)}>
                                                                            Bulk Upload
                                                                        </button>
                                                                    )}
                                                                />
                                                            </div>
                                                            <br />
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                            {
                                                console.log(type === 'management', !type)
                                            }
                                        </div>
                                        {
                                            (update === true) &&
                                            <EditParameter Code={adminMenu} Data={data} setUpdate={setUpdate} isOpen={update} style={{ height: "50%" }} />
                                        }
                                        {
                                            (isOpen === true) &&
                                            <ParametersMapping
                                                data={{ isOpen, data }}
                                                handler={{ setIsOpen }}
                                                style={{ height: "50%" }}
                                            />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div >
                    </div>
                </div>
            </div >
        </>
    )
}
export default ManageParameters;
