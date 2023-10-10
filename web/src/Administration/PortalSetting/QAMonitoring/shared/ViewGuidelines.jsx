import React from 'react';

const ViewGuidelines = (props) => {
    const { viewData } = props.data;
    return (
        <div id="guidelinesBlock" className="modal-body">
            <div className="col-md-12">
                <div>
                    <label className="control-label">Quality Guidelines</label>
                    <p>{viewData?.qualityGuidelines || '-'}</p>
                </div>
            </div>
            <div className="col-md-12">
                <div>
                    <label className="control-label">Evaluation Section</label>
                    <p>{viewData?.evaluationSection?.sectionName || '-'}</p>
                </div>
            </div>
            <div className="col-md-12">
                <div>
                    <label className="control-label">Options and Weightage</label>
                    {
                        viewData?.options?.options?.map((item, idx) => (
                            <p>-{item?.value} -{item?.weightage}</p>
                        ))
                        ||
                        '-'
                    }
                </div>
            </div>
            <div className="col-md-12">
                <div>
                    <label htmlFor="field-2" className="control-label">Status</label>
                    <p>{viewData?.statusDesc?.description || '-'}</p>
                </div>
            </div>
        </div>
    )
}

export default ViewGuidelines;