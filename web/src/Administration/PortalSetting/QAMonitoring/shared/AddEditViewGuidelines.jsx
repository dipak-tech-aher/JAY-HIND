import React, { useCallback, useEffect, useState } from 'react';

import { properties } from '../../../../properties';
import { get, post, put } from '../../../../common/util/restUtil';
import AddEditMultipleOptionsWeightage from './AddEditMultipleOptionsWeightage';
import ViewGuidelines from './ViewGuidelines';

const AddEditViewGuidelines = (props) => {
    const { viewScreen, source, helperValues, viewEditData } = props.data;
    const { setIsOpen, doSoftRefresh } = props.handlers;

    const [guidelinesInputs, setGuidelinesInputs] = useState({
        qualityGuidelines: "",
        sectionId: "",
        mandatory: "",
        nonMandatory: "",
        options: [],
        eStatus: false
    });

    const [entityTypes, setEntityTypes] = useState({
        sectionId: []
    });

    const getEvaluationSection = useCallback(() => {
        
        return new Promise((resolve, reject) => {
            get(`${helperValues['EVALUATION']['apiEndpoint']}/names`)
                .then((response) => {
                    const { data, status } = response;
                    if (status === 200) {
                        setEntityTypes({
                            ...entityTypes,
                            sectionId: data?.map((ele) => ({ code: ele.sectionId, description: ele.sectionName }))
                        });
                    }
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
        const { qualityGuidelines, sectionId, mandatory, options, status } = viewEditData;
        setGuidelinesInputs({
            qualityGuidelines,
            sectionId,
            mandatory,
            nonMandatory: mandatory ? mandatory === 'Y' ? 'N' : 'Y' : '',
            options,
            eStatus: status === 'AC' ? true : false
        })
    }, [viewEditData])

    useEffect(() => {
        if (viewScreen !== 'VIEW') {
            getEvaluationSection();
        }
        if (viewScreen === 'EDIT') {
            handleOnEditViewScreen();
        }
    }, [getEvaluationSection, handleOnEditViewScreen, viewScreen])

    const handleOnInputChange = (e) => {
        const { target } = e;
        if (target?.type === "radio") {
            if (target.id === 'mandatory') {
                setGuidelinesInputs({
                    ...guidelinesInputs,
                    mandatory: target.value,
                    nonMandatory: 'N'
                })
            }
            else {
                setGuidelinesInputs({
                    ...guidelinesInputs,
                    mandatory: target.value,
                    nonMandatory: 'Y'
                })
            }
        }
        else {
            setGuidelinesInputs({
                ...guidelinesInputs,
                [target.id]: target.id === 'eStatus' ? target.checked : target.value
            })
        }
    }

    const onCreate = () => {
        const { qualityGuidelines, sectionId, mandatory, options, eStatus } = guidelinesInputs;
        
        const requestBody = {
            qualityGuidelines,
            sectionId,
            mandatory,
            options,
            status: eStatus ? 'AC' : 'IN'
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
        const { guidelineId } = viewEditData;
        
        const requestBody = {
            ...guidelinesInputs,
            status: guidelinesInputs?.eStatus ? 'AC' : 'IN',
        }
        put(`${helperValues[source]['apiEndpoint']}/${guidelineId}`, requestBody)
            .then((response) => {
                const { status } = response;
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
                                    <label htmlFor="qualityGuidelines" className="control-label">Quality Guidelines</label>
                                    <input type="text" id="qualityGuidelines" className="form-control" placeholder="Quality Guidelines" value={guidelinesInputs?.qualityGuidelines} onChange={handleOnInputChange} />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="sectionId" className="control-label">Evaluation Section</label>
                                    <select id='sectionId' className={`form-control`}
                                        value={guidelinesInputs.sectionId} onChange={handleOnInputChange} >
                                        <option value="">Select Evaluation Section</option>
                                        {
                                            entityTypes?.sectionId?.map((e) => (
                                                <option key={e.code} value={e.code}>{e.description}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <label htmlFor="mandatory" className="control-label">Mandatory or Add Not Applicable?</label>
                                <div className="ml-3 mt-1 radio radio-primary">
                                    <input type="radio" id="mandatory" className="form-check-input" name="mandatory" value='Y'
                                        checked={guidelinesInputs?.mandatory === 'Y' && true}
                                        onChange={handleOnInputChange}
                                    />
                                    <label htmlFor="mandatory">Mandatory</label>
                                </div>
                                <div className="ml-3 mt-1 radio radio-primary">
                                    <input type="radio" id="nonMandatory" className="form-check-input" name="nonMandatory" value='N'
                                        checked={guidelinesInputs?.nonMandatory === 'Y' && true}
                                        onChange={handleOnInputChange}
                                    />
                                    <label htmlFor="nonMandatory">Non Mandatory</label>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <AddEditMultipleOptionsWeightage
                                    data={{
                                        options: viewEditData?.options,
                                        viewScreen
                                    }}
                                    handlers={{
                                        setGuidelinesInputs
                                    }}
                                />
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="eStatus" className="control-label">Status</label>
                                    <div className="switchToggle">
                                        <input type="checkbox" name="eStatus" id="eStatus" checked={guidelinesInputs?.eStatus} onChange={handleOnInputChange} />
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
                        <ViewGuidelines
                            data={{
                                viewData: viewEditData
                            }}
                        />
                    )
            }
        </>
    )
}

export default AddEditViewGuidelines;