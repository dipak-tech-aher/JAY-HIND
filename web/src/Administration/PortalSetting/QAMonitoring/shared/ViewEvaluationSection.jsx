import React from 'react';

const ViewEvaluationSection = (props) => {
    const { viewData } = props.data;
    return (
        <div id="searchBlock" className="modal-body">
            <div className="col-md-12">
                <div>
                    <label className="control-label">Section Nick Name</label>
                    <p>{viewData?.sectionName || '-'}</p>
                </div>
            </div>
            <div className="col-md-12">
                <div>
                    <label className="control-label">Section Display Name</label>
                    <p>{viewData?.displayName || '-'}</p>
                </div>
            </div>
            <div className="col-md-12">
                <div>
                    <label className="control-label">Channel</label>
                    <p>
                        {
                            viewData?.channel?.map((chnl, idx) => `${chnl?.description}${viewData?.channel?.length === 1 ? '' : idx % 2 === 0 ? ',' : ''}`)
                        }
                    </p>
                </div>
            </div>
            <div className="col-md-12">
                <div>
                    <label htmlFor="field-2" className="control-label">Section Weightage</label>
                    <p>{viewData?.weightage || '-'}</p>
                </div>
            </div>
            <div className="col-md-12">
                <div>
                    <label className="control-label">Maximum No. of.Guidelines</label>
                    <p>{viewData?.guidelines || '-'}</p>
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

export default ViewEvaluationSection;