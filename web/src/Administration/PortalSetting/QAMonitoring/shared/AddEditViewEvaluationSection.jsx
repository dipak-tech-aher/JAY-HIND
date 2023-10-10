import React, { useCallback, useEffect, useState } from 'react';
import ReactSelect from 'react-select';

import { properties } from '../../../../properties';
import { post, put } from '../../../../common/util/restUtil';
import { NumberFormatBase } from 'react-number-format';
import ViewEvaluationSection from './ViewEvaluationSection';

const AddEditViewEvaluationSection = (props) => {
    const { viewScreen, source, helperValues, viewEditData } = props.data;
    const { setIsOpen, doSoftRefresh } = props.handlers;

    const [evaluationInputs, setEvaluationInputs] = useState({
        sectionName: "",
        displayName: "",
        channel: "",
        weightage: "",
        maxGuidelines: null,
        eStatus: false
    });

    const [entityTypes, setEntityTypes] = useState({
        channel: []
    });

    const getEntityLookup = useCallback(() => {
        
        return new Promise((resolve, reject) => {
            post(properties.BUSINESS_ENTITY_API, ['HELPDESK_SOURCE'])
                .then((response) => {
                    const { data } = response;
                    setEntityTypes({
                        ...entityTypes,
                        channel: data['HELPDESK_SOURCE']
                    });
                    resolve(true);
                })
                .catch(error => {
                    console.error(error);
                    reject(false);
                })
                .finally()
        })
    }, [])

    const handleOnEditViewScreen = useCallback(() => {
        const { sectionName, displayName, channel, weightage, status, maxGuidelines } = viewEditData;
        setEvaluationInputs({
            sectionName,
            displayName,
            channel: channel?.map((chnl) => ({ label: chnl?.description, value: chnl?.code })),
            weightage,
            maxGuidelines,
            eStatus: status === 'AC' ? true : false
        })
    }, [viewEditData])

    useEffect(() => {
        if (viewScreen !== 'VIEW') {
            getEntityLookup();
        }
        if (viewScreen === 'EDIT') {
            handleOnEditViewScreen();
        }
    }, [getEntityLookup, handleOnEditViewScreen, viewScreen])

    const handleOnInputChange = (e) => {
        const { target } = e;
        setEvaluationInputs({
            ...evaluationInputs,
            [target.id]: target.id === 'eStatus' ? target.checked : target.value
        })
    }

    const handleChannelChange = (selectedObjects) => {
        setEvaluationInputs({
            ...evaluationInputs,
            channel: selectedObjects
        })
    }

    const onCreate = () => {
        const { sectionName, displayName, channel, weightage, maxGuidelines, eStatus } = evaluationInputs;
        
        const requestBody = {
            sectionName,
            displayName,
            weightage,
            maxGuidelines,
            status: eStatus ? 'AC' : 'IN',
            channel: channel?.map((chnl) => chnl?.value)
        }
        post(`${helperValues[source]['apiEndpoint']}`, requestBody)
            .then((response) => {
                const { status, data } = response;
                if (status === 200 && data) {
                    setIsOpen(false);
                    doSoftRefresh();
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const onEdit = () => {
        
        const requestBody = {
            ...evaluationInputs,
            channel: evaluationInputs.channel?.map((chnl) => chnl?.value)
        }
        put(`${helperValues[source]['apiEndpoint']}/${viewEditData?.sectionId}`, requestBody)
            .then((response) => {
                const { status, data } = response;
                if (status === 200) {
                    setIsOpen(false);
                    doSoftRefresh();
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleOnSubmit = () => {
        switch (viewScreen) {
            case 'EDIT':
                onEdit();
                break;
            default:
                onCreate();
                break;
        }
    }

    return (
        <>
            {
                ['ADD', 'EDIT'].includes(viewScreen) ? (
                    <>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="sectionName" className="control-label">Section Nick Name</label>
                                    <input type="text" id="sectionName" className="form-control" placeholder="Nick Name" value={evaluationInputs?.sectionName} onChange={handleOnInputChange} />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="displayName" className="control-label">Section Display Name</label>
                                    <input type="text" className="form-control" id="displayName" placeholder="Section Display Name" value={evaluationInputs?.displayName} onChange={handleOnInputChange} />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="channel" className="control-label">Select Channel</label>
                                    <ReactSelect
                                        id='channel'
                                        placeholder="Select Channel"

                                        menuPortalTarget={document.body} 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                     
                                        options={entityTypes?.channel?.map((item) => ({ label: item.description, value: item.code }))}
                                        isMulti={true}
                                        onChange={(selected) => {
                                            handleChannelChange(selected)
                                        }}
                                        value={evaluationInputs.channel}
                                    />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="weightage" className="control-label">Section Weightage</label>
                                    <select id="weightage" className="form-control" value={evaluationInputs?.weightage} onChange={handleOnInputChange}>
                                        <option value="">Select Weightage</option>
                                        <option value="5%">5%</option>
                                        <option value="10%">10%</option>
                                        <option value="15">15%</option>
                                        <option value="20%">20%</option>
                                        <option value="25%">25%</option>
                                        <option value="30%">30%</option>
                                        <option value="35%">35%</option>
                                        <option value="40%">40%</option>
                                        <option value="45%">45%</option>
                                        <option value="50%">50%</option>
                                        <option value="55%">55%</option>
                                        <option value="60%">60%</option>
                                        <option value="65%">65%</option>
                                        <option value="70%">70%</option>
                                        <option value="75%">75%</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="maxGuidelines" className="control-label">Maximum No. of.Guidelines</label>
                                    <NumberFormatBase className="form-control" id="maxGuidelines" placeholder="Please Enter Max Guidelines"
                                        value={evaluationInputs?.maxGuidelines}
                                        onChange={handleOnInputChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="eStatus" className="control-label">Status</label>
                                    <div className="switchToggle">
                                        <input type="checkbox" name="eStatus" id="eStatus" checked={evaluationInputs?.eStatus} onChange={handleOnInputChange} />
                                        <label htmlFor="eStatus"></label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row pt-4">
                            <div className="mx-auto">
                                <button className="btn btn-primary btn-sm  mr-1" type="button" onClick={handleOnSubmit}>
                                    {
                                        viewScreen === 'ADD' ? 'Submit' : 'Update'
                                    }
                                </button>
                                <button className="btn btn-secondary btn-sm" type="button" data-dismiss="modal" onClick={() => setIsOpen(false)}>Close</button>
                            </div>
                        </div>
                    </>
                )
                    : (
                        <ViewEvaluationSection
                            data={{
                                viewData: viewEditData
                            }}
                        />
                    )
            }
        </>
    )
}

export default AddEditViewEvaluationSection;