import React, { useEffect, useState }  from "react";
import Modal from 'react-modal';
import { toast } from "react-toastify";

import { properties } from "../../properties";
import { get, post, put } from "../../common/util/restUtil";
import { RegularModalCustomStyles } from '../../common/util/util';

const ParametersMapping = (props) => {

    const { isOpen, data } = props?.data
    const { setIsOpen } = props?.handler
    const [parameterList,setParameterList] = useState([])
    const [selectedParamater,setSelectedParameter] =  useState({
        code: "",
        description: "",
        mappingKey: ""
    })
    const [paramaterMappingPayload,setParamaterMappingPayload] = useState([])
    const [businessEntityList,setBusinessEntityList] = useState([])

    useEffect(() => {
        
        get(properties.MASTER_API + "/code-types").then(resp => {
            if (resp.data) {
                setParameterList(resp.data.filter((x) => x.code !== data?.codeType))
                handleLoadExistingParameterMapping(resp.data.filter((x) => x.code !== data?.codeType))
            }
        }).catch((error) => {
            console.log(error)
        })
        .finally()
    },[])

    const handleBusinessParamaterChange = (data) => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam='+ data.code)
            .then((resp) => {
                if (resp.data) {
                    const initialData = paramaterMappingPayload.filter((x) => x.mappingCode === data.code).map((y) => y.code) || []
                    setBusinessEntityList(resp?.data[data.code]?.map((x) => { return { ...x, isSelected: initialData.includes(x.code) ? "Y" : "N" } }) || [])
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }

    const handleLoadExistingParameterMapping = (list) => {
        const mappingKeys = Object.keys(data?.mappingPayload || {})
        const mappingCodes = list.filter((x) => mappingKeys.includes(x.mappingKey)).map((y) => y.code)
        if(mappingKeys.length > 0 && mappingCodes.length > 0) {
            get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam='+ mappingCodes.toString())
            .then((resp) => {
                if (resp.data) {
                    const mappingList = []
                    mappingKeys.forEach((x) => {
                        data?.mappingPayload[x].forEach((z) => {
                            mappingList.push({
                                mappingKey: x,
                                mappingDescription: list.find((y) => y.mappingKey === x)?.description,
                                mappingCode: list.find((y) => y.mappingKey === x)?.code,
                                code: resp.data[list.find((y) => y.mappingKey === x)?.code].find((y) => y.code === z)?.code,
                                description: resp.data[list.find((y) => y.mappingKey === x)?.code].find((y) => y.code === z)?.description
                            })
                        })
                    })
                    setParamaterMappingPayload(mappingList)
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally()
        }
    }

    const handleAddParameterMapping = (data, e) => {
        setBusinessEntityList(
            businessEntityList.map((service) => {
                if (service?.code === data?.code) {
                    service.isSelected = e.target.checked ? 'Y' : 'N'
                }
                return service
            })
        )
        if(e.target.checked) {
            setParamaterMappingPayload([...paramaterMappingPayload, 
                { 
                    mappingKey: selectedParamater.mappingKey,
                    mappingDescription: selectedParamater.description,
                    mappingCode: selectedParamater.code,
                    code: data.code,
                    description: data.description
                } 
            ])
        } else {
            setParamaterMappingPayload(paramaterMappingPayload.filter((x) => x.code !== data.code))
        }
    }

    const handleRemoveParameterMapping = (data) => {
        setBusinessEntityList(
            businessEntityList.map((service) => {
                if (service?.code === data.code) {
                    service.isSelected = 'N'
                }
                return service
            })
        )
        setParamaterMappingPayload(paramaterMappingPayload.filter((x) => x.code !== data.code))
    }

    const handleBusinessParameterChange = (e) => {
        const { target } = e;
        if(target.value !== "") {
            setSelectedParameter(JSON.parse(target.options[target.selectedIndex]?.dataset?.entity)); 
            handleBusinessParamaterChange(JSON.parse(target.options[target.selectedIndex]?.dataset?.entity))
        } else {
            setSelectedParameter({}); 
            setBusinessEntityList([])
        }
    }

    const handleEditParameterMapping = () => {
        const codes = [...new Set(paramaterMappingPayload.map((x) => x.mappingCode))]
        const reqBody = {}
        codes.forEach((x) => {
            const mappingKey = paramaterMappingPayload.find((y) => y.mappingCode === x)?.mappingKey
            reqBody[mappingKey] = paramaterMappingPayload.filter((z) => z.mappingCode === x).map((i) => i.code)
        })
        const requestBody = {
            code: data.code,
            description: data.description,
            codeType: data.codeType,
            mappingPayload: reqBody 
        }
        put(properties.MASTER_API + "/" + data.code, requestBody)
        .then((resp) => {
            if (resp.status === 200) {
                toast.success("Business Entity updated successfully")
                setIsOpen(false)
            }
            else {
                toast.error("Error while updating business entity")
            }
        }).catch((error) => {
            console.log(error)
        })
        .finally();
    }

    return (
        <>
            <Modal style={RegularModalCustomStyles} isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Parameters Mapping">
            <div>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Paramater Mapping - {data?.description} ({data?.code}) </h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <hr />
                        <form className="col-12 d-flex justify-content-left ml-1" >
                            <div className="col-8 form-row align-items-left">
                                    <label><h5>Business Parameter :</h5></label>
                                <select className="form-control" id="example-select" required
                                    value={selectedParamater.code}
                                    style={{ width: "400px" }}
                                    autoFocus
                                    onChange={handleBusinessParameterChange}
                                >
                                    <option key={1} value={""}>Select Parameter</option>
                                    {
                                        parameterList.map((e) => (
                                            <option key={e.code} value={e.code} data-entity={JSON.stringify(e)}>{e.description}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </form>
                        <div className="modal-body bg-secondary m-2">
                            <div className="col-12">
                                <div className="row">
                                    <div className="col-7">
                                        <div className="card p-0">
                                            <div className="card-body">
                                                <div className="col-xl-12 p-0">
                                                    <div className="card-box p-0">
                                                        <div className="tab-content pt-0">
                                                            <div className={`tab-pane active`}>
                                                                <div className="list-group">
                                                                    <div className="input-group input-group-merge p-2 d-none">
                                                                        <input type="text" className="form-control height38" placeholder="Search" style={{border: "1px solid #ccc"}}
                                                                            value={selectedParamater} onChange={() => {}}
                                                                        />
                                                                        <div className="input-group-append">
                                                                            <div className="input-group-text">
                                                                                <i className="mdi mdi-filter-outline"></i>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                        <div style={{height:"400px", overflowY:"auto"}} className="mt-1">
                                                                            {
                                                                                businessEntityList && businessEntityList.length > 0 ?
                                                                                <>
                                                                                    {
                                                                                        businessEntityList.map((product) => (
                                                                                            <button type="button" className="list-group-item list-group-item-action grow p-0">
                                                                                                <div className="col-12 p-0">
                                                                                                    <div className="card-box p-0 cardbg">
                                                                                                        <div className="col-12 p-0">
                                                                                                            <div className="row col-12 p-0">
                                                                                                                <div className="col-12 text-left table-responsive">
                                                                                                                    <table className="w-100 table table-border mb-0 height60">
                                                                                                                        <tr>
                                                                                                                            <td align="center" width="10%" >
                                                                                                                                {
                                                                                                                                    <input type="checkbox" id={`mandatory ${product?.code}`} value={product?.isSelected} 
                                                                                                                                        style={{cursor: "pointer"}}
                                                                                                                                        checked={product?.isSelected === 'Y' ? true : false}
                                                                                                                                        onChange={(e) => handleAddParameterMapping(product,e)}
                                                                                                                                    />
                                                                                                                                }
                                                                                                                            </td>
                                                                                                                            <td className="font-14 bold" width="45%">{product?.description}</td>
                                                                                                                            <td className="font-12 bold" width="45%">{product?.code}</td>
                                                                                                                        </tr>
                                                                                                                    </table>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <hr></hr>                                                                                 
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </button>
                                                                                        ))
                                                                                    }
                                                                                </>
                                                                                :
                                                                                <span className="msg-txt">No Parameters Available</span>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-1 text-center" style={{ maxWidth: "45px" }}>
                                        <a ><i className="fas fa-arrow-circle-right text-primary" style={{ fontSize: "30px", paddingTop: "220px" }}></i></a>
                                    </div>
                                    <div className="col">
                                        <div className="table-responsive bg-white p-0 shadow">
                                            <table className="table table-bordered table-centered mb-0 border">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th width="60%"><h5>Selected Paramaters</h5></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <div style={{height:"400px", overflowY:"auto"}}>                
                                                            {
                                                                paramaterMappingPayload && paramaterMappingPayload.length > 0 && paramaterMappingPayload.map((service) => (
                                                                    <div className="card autoheight mb-0 mt-1">
                                                                        <div className="card-header bg-light border">
                                                                            <div className="card-widgets">
                                                                                <div style={{cursor:"pointer"}} data-toggle="remove" onClick={() => handleRemoveParameterMapping(service) }><i className="mdi mdi-close"></i></div>
                                                                            </div>
                                                                            <h5 className="card-title mb-0 text-dark">{service?.description}
                                                                                <span className="float-right badge badge-primary badgefont mr-2 font-12">{service?.mappingDescription}</span>
                                                                            </h5>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center">
                            <button type="button" className="skel-btn-submit" onClick={handleEditParameterMapping}>Save and Close</button>
                            <button type="button" className="skel-btn-cancel" data-dismiss="modal" onClick={() => setIsOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
        </>

    )
}
export default ParametersMapping;
