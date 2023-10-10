import React, { useCallback, useEffect, useState } from 'react';
import { properties } from '../../../../properties';
import { get } from '../../../../common/util/restUtil';
import { handleOnDownload } from '../../../../common/util/util';

const MultipleAttachments = (props) => {

    const { entityType, entityId } = props.data;

    const [attachments, setAttachments] = useState([]);

    const getAttachment = useCallback(() => {
        if (entityId && entityType) {
            get(`${properties.ATTACHMENT_API}?entity-id=${entityId}&entity-type=${entityType}`).then((response) => {
                if (response.data && response.data.length) {
                    setAttachments(response.data)
                }
            }).catch((error) => {
                console.error("error", error)
            }).finally()
        }
    }, [])

    useEffect(() => {
        getAttachment();
    }, [getAttachment])

    return (
        <>
            {
                !!attachments?.length &&
                <div className="row col-12 mt-3 p-0">
                    <h5 className="mb-3">Attachments </h5>
                    <div className="row">
                        {
                            attachments?.map((attachment, idx) => (
                                <div className="col-auto mb-1" key={attachment.attachmentId}>
                                    <div className="card mb-1 shadow-none border">
                                        <div className="p-2">
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    <div className="avatar-sm">
                                                        <span className="avatar-title bg-soft-primary text-primary rounded">
                                                            {attachment?.fileName ? attachment?.fileName?.split('.')[1] : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col pl-0">
                                                    <div className="text-muted font-weight-bold"> {attachment?.fileName}</div>
                                                </div>
                                                <div className="col-auto">
                                                    <div className="btn btn-link btn-lg text-muted" onClick={() => handleOnDownload(entityId, entityType, attachment.attachmentId)}>
                                                        <i className="dripicons-download"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            }
        </>
    )
}

export default MultipleAttachments;