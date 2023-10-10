import React, { useState, useEffect } from 'react';
import Switch from "react-switch";
import { properties } from "../../properties";
import { get, post, put } from "../../common/util/restUtil";
import { toast } from "react-toastify";
import { string, object } from "yup";
import { useTranslation } from "react-i18next";
import Modal from 'react-modal';
import { RegularModalCustomStyles } from '../../common/util/util';


const validationSchema = object().shape({
    code: string().required("Please Enter Service Name"),
    description: string().required("Please Enter Service Description"),
    codeType: string().required("Please Select Service Type"),
});


const EditParameter = ({ Code, Data, isOpen, setUpdate }) => {
    const { t } = useTranslation();
    const [error, setError] = useState({});
    const [state, setState] = useState(false);

    const [data, setData] = useState({
        code: Data.code,
        description: Data.description,
        codeType: Data.codeType,
        mappingPayload: Data.mappingPayload,
        status: Data.status,
    })
    const [parameterList, setParameterList] = useState([])
    const [selectedParamater, setSelectedParameter] = useState({
        code: "",
        description: "",
        mappingKey: ""
    })
    const [businessEntityList, setBusinessEntityList] = useState([])
    const [paramaterMappingPayload, setParamaterMappingPayload] = useState([])


    const options = Code
    useEffect(() => {
        //setData({ ...data, code: Data.code, description: Data.description, codeType: Data.codeType, status: Data.status })
    }, [Data])

    const validate = () => {
        try {
            validationSchema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const setCodeType = (e) => {
        setData({ ...data, codeType: e })

    }

    const handleChange = (checked) => {
        setState(checked)
        if (checked) {
            setData({ ...data, status: "AC" })
        } else {
            setData({ ...data, status: "IN" })
        }

    }

    // const handleClear = () => {

    //     setData({
    //         ...data,
    //         code: "",
    //         description: "",
    //         codeType: "",
    //         mappingPayload: "",
    //         status: "IN"

    //     })
    //     setState(false)

    // }

    const onHandleSubmit = () => {
        const error = validate(validationSchema, data);
        if (error) return;


        put(properties.MASTER_API + "/" + Data.code, data)
            .then((resp) => {
                if (resp.status === 200) {
                    toast.success("Business Entity updated successfully")
                    setUpdate(false)
                }
                else {
                    toast.error("Error while updating business entity")
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally(() => { });
    }

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
    }, [])

    const handleLoadExistingParameterMapping = (list) => {
        const mappingKeys = Object.keys(data?.mappingPayload || {})
        const mappingCodes = list.filter((x) => mappingKeys.includes(x.mappingKey)).map((y) => y.code)
        if (mappingKeys.length > 0 && mappingCodes.length > 0) {
            get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=' + mappingCodes.toString())
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

    const handleBusinessParameterChange = (e) => {
        const { target } = e;
        if (target.value !== "") {
            setSelectedParameter(JSON.parse(target.options[target.selectedIndex]?.dataset?.entity));
            handleBusinessParamaterChange(JSON.parse(target.options[target.selectedIndex]?.dataset?.entity))
        } else {
            setSelectedParameter({});
            setBusinessEntityList([])
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
        if (e.target.checked) {
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

    const handleBusinessParamaterChange = (data) => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=' + data.code)
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

    const handleEditParameterMapping = () => {
        const error = validate(validationSchema, data);
        if (error) return;

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
        put(properties.MASTER_API + "/" + Data.code, requestBody)
            .then((resp) => {
                if (resp.status === 200) {
                    toast.success("Business Entity updated successfully")
                    setUpdate(false)
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
        <Modal style={RegularModalCustomStyles} isOpen={isOpen} onRequestClose={() => setUpdate(false)} contentLabel="Edit Parameters" >
            <div className="modal-center" id="followhistoryModal" tabIndex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                <div className="modal-dialog " role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="followupModal">Edit Parameters</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setUpdate(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className={`skel-form-heading-bar mt-2`}>
                                <span className="messages-page__title">Edit</span>
                            </div>
                            <div className={`cmmn-skeleton skel-br-tp-r0`}>
                                <div className="form-row px-0 py-0 mt-1">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">Service Name
                                            </label>
                                            <input type="text" disabled={true}
                                                className={`form-control mr-2 ${error.code ? "input-error" : ""}`}
                                                placeholder="Charge Batteries"
                                                value={data.code}
                                                onChange={(e) => { setData({ ...data, code: e.target.value }); setError({ ...error, code: "" }) }} />

                                            {error.code ? <span className="errormsg">{error.code}</span> : ""}

                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">Service Description
                                            </label>
                                            <input type="text"
                                                className={`form-control mr-2 ${error.description ? "input-error" : ""}`}
                                                id="field-1"
                                                value={data.description}
                                                placeholder="Charge Batteries"
                                                onChange={(e) => { setData({ ...data, description: e.target.value }); setError({ ...error, description: "" }) }} />

                                            {error.description ? <span className="errormsg">{error.description}</span> : ""}

                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="control-label">Code Type
                                            </label>

                                            <select placeholder="Select Code Type" id="system" disabled={true}
                                                className={`form-control mr-2 ${error.codeType ? "input-error" : ""}`}
                                                value={data.codeType}
                                                onChange={e => { setData({ ...data, codeType: e.target.value }); setError({ ...error, codeType: "" }) }}
                                            >
                                                <option key="" value=''>Select Code Type</option>
                                                {
                                                    options.map((e) => (
                                                        <option key={e.codeType} value={e.codeType}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            {error.codeType ? <span className="errormsg">{error.codeType}</span> : ""}

                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label >Enable/Disable</label>
                                            <Switch onChange={handleChange} checked={data.status === "AC" ? true : false} />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="modal-body">
                            <div className={`skel-form-heading-bar mt-2`}>
                                <span className="messages-page__title">Mapping Parameter</span>
                            </div>
                            <form className="col-12 d-flex justify-content-left ml-1 pt-2" >
                                <div className="col-8 form-row align-items-left">
                                    <lable>Business Parameter :</lable>&nbsp;&nbsp;
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
                                                                            <input type="text" className="form-control height38" placeholder="Search" style={{ border: "1px solid #ccc" }}
                                                                                value={selectedParamater} onChange={() => { }}
                                                                            />
                                                                            <div className="input-group-append">
                                                                                <div className="input-group-text">
                                                                                    <i className="mdi mdi-filter-outline"></i>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ height: "400px", overflowY: "auto" }} className="mt-1">
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
                                                                                                                                            style={{ cursor: "pointer" }}
                                                                                                                                            checked={product?.isSelected === 'Y' ? true : false}
                                                                                                                                            onChange={(e) => handleAddParameterMapping(product, e)}
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
                                                                <div style={{ height: "400px", overflowY: "auto" }}>
                                                                    {
                                                                        paramaterMappingPayload && paramaterMappingPayload.length > 0 && paramaterMappingPayload.map((service) => (
                                                                            <div className="card autoheight mb-0 mt-1">
                                                                                <div className="card-header bg-light border">
                                                                                    <div className="card-widgets">
                                                                                        <div style={{ cursor: "pointer" }} data-toggle="remove" onClick={() => handleRemoveParameterMapping(service)}><i className="mdi mdi-close"></i></div>
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
                        </div>
                        <div className="col-md-12 pl-2">
                            <div className="form-group pb-1">
                                <div className="text-center">
                                    <button type="button" className="skel-btn-cancel" onClick={() => setUpdate(false)}>Cancel</button>
                                    <button type="button" className="skel-btn-submit" onClick={handleEditParameterMapping}>Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>


    )
}
export default EditParameter;

