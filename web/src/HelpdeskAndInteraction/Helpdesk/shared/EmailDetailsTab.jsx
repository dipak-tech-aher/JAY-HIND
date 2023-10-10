import React, { useCallback, useState, useEffect } from 'react';
import { } from '../../../common/spinner';
import { properties } from '../../../properties';
import { get } from '../../../common/util/restUtil';
import Attachements from './Attachments';

const EmailDetailsTab = (props) => {
    const { detailedViewItem } = props.data;

    const [mailAttachments, setMailAttachments] = useState([]);

    const getAttachments = useCallback((type) => {
        if (detailedViewItem?.helpdeskId && type) {
            get(`${properties.ATTACHMENT_API}?entity-id=${detailedViewItem?.helpdeskId}&entity-type=${type}`).then((response) => {
                if (response.data && response.data.length) {
                    setMailAttachments(response.data);
                }
            }).catch((error) => {
                console.error("error", error)
            }).finally()
        }
    }, [detailedViewItem?.helpdeskId])

    useEffect(() => {
        getAttachments('HELPDESK');
    }, [getAttachments])

    return (
        <div className="card-body pl-2 skel-helpdesk-right-col-info">
            <table>
                <tr>
                    <td className='form-label'>Subject</td>
                    <td width="5%">:</td>
                    <td>{detailedViewItem?.helpdeskSubject}</td>
                </tr>
                <tr>
                    <td className='form-label'>Content</td>
                    <td width="5%">:</td>
                    <td>{detailedViewItem?.helpdeskContent}</td>
                </tr>
                <tr>
                    <td className='form-label'>From Email</td>
                    <td width="5%">:</td>
                    <td>{detailedViewItem?.mailId}</td>
                </tr>
                <tr>
                    <td className='form-label'>Domain</td>
                    <td width="5%">:</td>
                    <td>{detailedViewItem?.mailId ? detailedViewItem?.mailId.split('@')[1] : ''}</td>
                </tr>
                <tr>
                    <td className='form-label'>Project</td>
                    <td width="5%">:</td>
                    <td>{detailedViewItem?.project ? detailedViewItem?.project?.description : ''}</td>
                </tr>
            </table>
            {/* <div className="col-12 row pt-2 helpdesk-padding-left-0">
                <div className="col-3 form-label pl-1">Subject</div>
                <div className="col-9 form-vtext pl-1">{detailedViewItem?.helpdeskSubject}</div>
            </div>
            <div className="col-12 row pt-2 helpdesk-padding-left-0">
                <div className="col-3 form-label pl-1">Content</div>
                <div className="col-9 form-vtext pl-1">{detailedViewItem?.helpdeskContent}</div>
            </div>
            <div className="col-12 row pt-2 helpdesk-padding-left-0">
                <div className="col-3 form-label pl-1">From Email</div>
                <div className="col-9 form-vtext pl-1">{detailedViewItem?.mailId}</div>
            </div>
            <div className="col-12 row pt-2 helpdesk-padding-left-0">
                <div className="col-3 form-label pl-1">Domain</div>
                <div className="col-9 form-vtext pl-1">{detailedViewItem?.mailId ? detailedViewItem?.mailId.split('@')[1] : ''}</div>
            </div>
            <div className="col-12 row pt-2 helpdesk-padding-left-0">
                <div className="col-3 form-label pl-1">Project</div>
                <div className="col-9 form-vtext pl-1">{detailedViewItem?.project ? detailedViewItem?.project?.description : ''}</div>
            </div> */}
            {
                !!mailAttachments?.length && (
                    <div className={`col-12 row pt-2 mb-2 helpdesk-padding-left-0`}>
                        <div className="col-3 form-label pl-1">Attachment</div>
                        {/* Commented for dtWorks 2.0
                            <Attachements
                            data={{
                                attachmentList: mailAttachments,
                                entityId: detailedViewItem?.helpdeskId,
                                entityType: 'HELPDESK'
                            }}
                        /> */}
                    </div>
                )
            }
        </div>
    )
}

export default EmailDetailsTab;