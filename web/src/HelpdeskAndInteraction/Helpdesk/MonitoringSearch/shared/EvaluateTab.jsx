import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { properties } from '../../../../properties';
import { history } from '../../../../common/util/history';
import { get, post } from '../../../../common/util/restUtil';
import EvaluateTable from './EvaluateTable';

const EvaluateTab = memo((props) => {
    const { detailedViewItem, isAgent } = props?.data;

    const [evaluateList, setEvaluateList] = useState([]);
    const [calculatedMappingData, setCalculatedMappingData] = useState({});
    let initialCalculatedMappingDataRef = undefined;
    const isAlreadyEvaluated = useRef(false);
    const totalScoreRef = useRef();

    const getEvaluationBasedOnChannel = useCallback(() => {
        
        const requestBody = {
            channel: detailedViewItem?.source
        }
        post(`${properties.QUALITY_MONITORING}/evaluate`, requestBody)
            .then((response) => {
                const { status, data } = response;
                if (status === 200 && data) {
                    contructCalculateDataBasedOnQAList(data);
                    setEvaluateList(data);
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally()
    }, [detailedViewItem?.source])

    const verifyEvaluation = useCallback(() => {
        
        get(`${properties.QUALITY_MONITORING}/evaluate/helpdesk/${detailedViewItem?.helpdeskId}`)
            .then((response) => {
                const { status, data } = response;
                if (status === 200) {
                    if (isAgent) {
                        isAlreadyEvaluated.current = !!data?.evaluationPayload?.length ? !!data?.evaluationPayload[0]?.guideline?.length ? data?.evaluationPayload[0]?.guideline[0].hasOwnProperty('agentReview') ? true : false : true : true;
                        totalScoreRef.current = data?.evaluationPayload?.pop()
                        setEvaluateList(data?.evaluationPayload);
                    }
                    else {
                        if (data?.status === 201) {
                            getEvaluationBasedOnChannel();
                        }
                        else {
                            isAlreadyEvaluated.current = true;
                            totalScoreRef.current = data?.evaluationPayload?.pop();
                            setEvaluateList(data?.evaluationPayload);
                        }
                    }
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally()
    }, [detailedViewItem?.helpdeskId])

    useEffect(() => {
        verifyEvaluation();
    }, [verifyEvaluation])

    const handleOnOptionsChange = useCallback((e) => {
        const { target } = e;
        const splittedId = target?.id?.split('-');
        const sectionId = Number(splittedId[2]);
        const guidelineId = Number(splittedId[3]);
        const guidelineIndex = Number(splittedId[4]);
        const optionIndex = Number(splittedId[5]);
        const evalList = evaluateList?.map((list, idx) => {
            if (list.sectionId === sectionId) {
                if (!!list?.guideline?.length) {
                    list.guideline[guidelineIndex]?.options?.forEach((oList, oIdx) => {
                        if (optionIndex === oIdx) {
                            oList.check = target.checked;
                            setCalculatedMappingData((prevVal) => {
                                return {
                                    ...prevVal,
                                    [`${sectionId}`]: {
                                        ...prevVal[sectionId],
                                        [guidelineId]: Number(target.value?.replace('%', '')),
                                        total: getTotal(Number(target.value?.replace('%', '')), guidelineId, prevVal[sectionId])
                                    }
                                }
                            })
                        }
                        else {
                            oList.check = false;
                        }
                    })
                }
            }
            return list;
        })
        setEvaluateList(evalList);
    }, [evaluateList])

    const getTotal = (currVal, guidelineId, data) => {
        let total = currVal;
        for (let key in data) {
            if (guidelineId !== Number(key) && key !== 'total') {
                total += data[key];
            }
        }
        return total;
    }

    const contructCalculateDataBasedOnQAList = (data) => {
        try {
            let formedObject = {};
            for (const me of data) {
                formedObject[`${me?.sectionId}`] = {}
                for (const ge of me?.guideline) {
                    formedObject[`${me?.sectionId}`] = {
                        ...formedObject[`${me?.sectionId}`],
                        [`${ge?.guidelineId}`]: 0,
                        total: 0
                    };
                }
            }
            setCalculatedMappingData(formedObject);
        }
        catch (error) {
            console.error(error);
        }
    }

    const calculateAverage = (mappingData) => {
        if (mappingData?.total !== 0) {
            return ((mappingData?.total) / (Object.keys(mappingData)?.length - 1));
        }
        return 0;
    }

    const formEvaluationPayload = () => {
        try {
            return evaluateList?.map((list, lIdx) => {
                let data = {
                    displayName: list?.displayName,
                    sectionName: list?.sectionName,
                    sectionId: list?.sectionId,
                    weightage: list?.weightage,
                    guideline: list?.guideline?.map((gLine, gIdx) => {
                        let gData = {
                            options: gLine.options,
                            qualityGuidelines: gLine?.qualityGuidelines,
                            evaluationType: gLine?.evaluationType,
                            mandatory: gLine?.mandatory,
                            avgWeightage: isAgent ? gLine?.avgWeightage : calculateAverage(calculatedMappingData[`${gLine?.sectionId}`]),
                            sectionId: gLine?.sectionId,
                            guidelineId: gLine?.guidelineId
                        };
                        if (isAgent) {
                            gData.agentReview = gLine?.agentReview
                        }
                        return gData;
                    })
                };
                return data;
            })
        }
        catch (error) {
            console.error(error)
        }
    }

    const handleOnCommentInputChange = (e) => {
        const { id, value } = e.target;
        const splittedId = id?.split('-');
        const sectionId = Number(splittedId[2]);
        const guidelineId = Number(splittedId[3]);
        const evalList = evaluateList?.map((list, idx) => {
            if (list.sectionId === sectionId) {
                if (!!list?.guideline?.length) {
                    list.guideline = list?.guideline?.map((gLine, gIdx) => {
                        if (gLine.guidelineId === guidelineId) {
                            gLine.agentReview = value
                        }
                        return gLine
                    })
                }
            }
            return list;
        })
        setEvaluateList(evalList);
    }

    const handleOnSubmit = () => {
        
        const { helpdeskId, agent } = detailedViewItem;
        const requestBody = {
            helpdeskId,
            agentId: agent?.userId,
            supervisorId: null,
            evaluationPayload: formEvaluationPayload()
        }
        console.log(requestBody);
        post(`${properties.QUALITY_MONITORING}/evaluation/helpdesk`, requestBody)
            .then((response) => {
                const { status, message } = response;
                if (status === 200) {
                    toast.success(message);
                    history.push(`${process.env.REACT_APP_BASE}/monitoring-search`);
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally()
    }

    const handleOnClear = () => {
        setCalculatedMappingData(initialCalculatedMappingDataRef);
    }

    return (
        <div className="row justify-content-center">
            {
                !!evaluateList?.length ? (
                    <>
                        <div className="col-2">
                            <div className="nav border flex-column nav-pills nav-pills-tab" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                                {
                                    evaluateList?.map((item, idx) => (
                                        <a key={`${item?.sectionId}`} className={`nav-link mb-1 show ${idx === 0 ? 'active' : ''}`} id={`v-pills-${idx}-tab`} data-toggle="pill" href={`#v-pills-${idx}`} role="tab" aria-controls={`#v-pills-${idx}`} aria-selected="true">
                                            {item?.displayName}
                                        </a>
                                    ))
                                }
                            </div>
                        </div>
                        <div className='col-10'>
                            {
                                totalScoreRef.current &&
                                <div className="text-right"><h4>Total Score: {totalScoreRef.current.totalScore}</h4></div>
                            }
                            <div className='tab-content pt-0 detailsbg-grey border-1 p-2'>
                                {
                                    evaluateList?.map((item, idx) => (
                                        <div key={`${item?.sectionId}`} className={`tab-pane fade show ${idx === 0 ? 'active' : ''}`} id={`v-pills-${idx}`} role="tabpanel" aria-labelledby={`v-pills-${idx}-tab`}>
                                            <EvaluateTable
                                                tableView={item}
                                                calculatedMappingData={calculatedMappingData}
                                                isAlreadyEvaluated={isAlreadyEvaluated.current}
                                                isAgent={isAgent}
                                                handlers={{
                                                    setEvaluateList,
                                                    handleOnOptionsChange,
                                                    handleOnCommentInputChange
                                                }}
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="col-12  mt-1 p-0 card">
                            <div className="text-center p-2">
                                {
                                    !isAlreadyEvaluated?.current &&
                                    <button type="button" className="btn waves-effect waves-light btn-primary" onClick={handleOnSubmit}> Submit</button>
                                }
                                <Link to={`${process.env.REACT_APP_BASE}/monitoring-search`} className="btn waves-effect waves-light btn-primary ml-1">Back to Quality Monitoring List</Link>
                            </div>
                        </div>
                    </>
                )
                    : (
                        <p class="skel-widget-warning">No records found!!!</p>
                    )
            }
        </div>
    )
})

export default EvaluateTab;