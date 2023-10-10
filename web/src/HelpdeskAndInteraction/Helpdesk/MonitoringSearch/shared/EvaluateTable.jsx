import React, { memo } from 'react';

const EvaluateTable = memo((props) => {
    const { tableView, calculatedMappingData, isAlreadyEvaluated, isAgent } = props;
    const { handleOnOptionsChange, handleOnCommentInputChange } = props.handlers;

    const findCheckedWeightage = (item) => {
        let data = item?.options?.find((opt) => opt.check === true);
        if (data) {
            return data?.weightage;
        }
        return '0%';
    }

    const getTotalWeightage = (len, avgWeightage) => {
        return `${len * avgWeightage}%`;
    }

    return (
        <div className='mb-2 p-0'>
            <h4>{tableView?.displayName}</h4>
            <div className="table-responsive">
                <table className="table table-bordered mb-0 shadow">
                    <thead>
                        <tr>
                            <th>Quality Guidelines</th>
                            {
                                (isAlreadyEvaluated || isAgent) && (
                                    <th className="text-center">Score</th>
                                )
                            }
                            <th className="text-center">Weightage</th>
                            <th className="text-center">Total Weightage</th>
                            {
                                isAgent && (
                                    <th className="text-center">Agent Comments</th>
                                )
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            tableView?.guideline?.map((item, gIdx) => (
                                <tr key={`${item?.sectionId}-${gIdx}`}>
                                    <th scope="row">
                                        <h5>{item?.qualityGuidelines}</h5>
                                        <div className="form-inline pl-2">
                                            {
                                                item?.options?.map((option, optIdx) => (
                                                    <span className="pl-2" key={option?.guidelineId}>
                                                        <div className="radio radio-success mb-2">
                                                            <input type="radio" disabled={isAlreadyEvaluated || isAgent} name={`radio-name-${item?.guidelineId}`} id={`radio-id-${item?.sectionId}-${item?.guidelineId}-${gIdx}-${optIdx}`} value={option?.weightage} checked={option?.check || false} onChange={handleOnOptionsChange} />
                                                            <label htmlFor={`radio-id-${item?.sectionId}-${item?.guidelineId}-${gIdx}-${optIdx}`}>{option.value}</label>
                                                        </div>
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    </th>
                                    {
                                        (isAlreadyEvaluated || isAgent) &&
                                        <td className="text-center">
                                            {
                                                findCheckedWeightage(item)
                                            }
                                        </td>
                                    }
                                    <td className="text-center">
                                        {
                                            (isAlreadyEvaluated || isAgent) ? findCheckedWeightage(item) : !!Object.keys(calculatedMappingData)?.length ? `${calculatedMappingData[item?.sectionId][item?.guidelineId]}%` : '0%'
                                        }
                                    </td>
                                    {
                                        gIdx === 0 &&
                                        <td rowSpan={tableView?.guideline?.length} className="text-center">
                                            <p className="my-5">
                                                {
                                                    (isAlreadyEvaluated || isAgent) ? getTotalWeightage(tableView?.guideline?.length, item?.avgWeightage) : !!Object.keys(calculatedMappingData)?.length ? `${calculatedMappingData[item?.sectionId]['total']}%` : '0%'
                                                }
                                            </p>
                                        </td>
                                    }
                                    {
                                        isAgent && (
                                            <td className="text-center px-0 py-2">
                                                <textarea rows="1" cols="20" name={`text-name-${item?.guidelineId}`} id={`text-id-${item?.sectionId}-${item?.guidelineId}-${gIdx}`} value={item?.agentReview} onChange={handleOnCommentInputChange} />
                                            </td>
                                        )
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
})

export default EvaluateTable;