import React from 'react';
import { handleOnDownload } from '../../../common/util/util';

const Attachements = (props) => {
    const { attachmentList, entityType, entityId } = props.data;
    return (
        <>
            {
                attachmentList?.map((attachmentList, idx) => (
                    <>
                        {
                            idx !== 0 &&
                            <div className="col-3 form-vtext" key={attachmentList.id + idx}></div>
                        }
                        <div className="col-9 form-vtext my-1" key={attachmentList.id}>
                            <div className="card mb-1 shadow-none border">
                                <div className="p-2">
                                    <div className="row align-items-center">
                                        <div className="col-auto">
                                            <div className="avatar-sm">
                                                <span className="avatar-title badge-soft-primary text-primary rounded">
                                                    {attachmentList?.fileName ? attachmentList?.fileName?.split('.')[1] : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col pl-0">
                                            <div className="text-muted font-weight-bold">
                                                {attachmentList?.fileName}
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <div className="btn btn-link font-16 text-muted" onClick={() => handleOnDownload(entityId, entityType, attachmentList.attachmentId)}>
                                                <i className="dripicons-download"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ))
            }
        </>
    )
}

export default Attachements;