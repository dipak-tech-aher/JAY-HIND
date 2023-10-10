import React, { memo, useState } from 'react';
import CreateProfileModal from '../CreateProfileModal';
import CustomerDetailsView from '../CustomerDetailsView';

const InteractionDeatilsPart1 = memo((props) => {

    const { detailedViewItem, customerDetails, readOnly = false } = props.data;

    // console.log('ineractionDetailsPart1', customerDetails)

    const { doSoftRefresh } = props.handlers;

    const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);

    return (
        <>
            <div className="col-12 row pt-2 m-0 helpdesk-padding-left-0">
                <div className="skel-helpdesk-right-col-info">

                    <table>
                        <tr>
                            <td className='form-label'>Helpdesk ID</td>
                            <td width="5%">:</td>
                            <td>#{detailedViewItem?.helpdeskId || '-'}</td>
                        </tr>
                        <tr>
                            <td className='form-label'>Source</td>
                            <td width="5%">:</td>
                            <td>{detailedViewItem?.source?.toLowerCase() || 'Live Chat'}</td>
                        </tr>
                        <tr>
                            <td className='form-label'>Source Reference</td>
                            <td width="5%">:</td>
                            <td>{detailedViewItem?.email || detailedViewItem?.emailId || detailedViewItem?.callerNo || detailedViewItem?.mailId}</td>
                        </tr>

                    </table>
                </div>
                {/* <div className="col-4 pr-0">
                    <div className="form-group">
                        <label htmlFor="customerTitle" className="col-form-label">Source</label>
                        <p className='text-capitalize remove-p-style'>{detailedViewItem?.source?.toLowerCase() || 'Live Chat'}</p>
                    </div>
                </div>
                <div className="col-4 pr-0">
                    <div className="form-group">
                        <label htmlFor="customerTitle" className="col-form-label">Source Reference</label>
                        <p className="text-break remove-p-style">{detailedViewItem?.email || detailedViewItem?.emailId || detailedViewItem?.callerNo  || detailedViewItem?.mailId}</p>
                    </div>
                </div> */}
                {/* {
                    ((customerDetails && customerDetails !== null && customerDetails.customer && customerDetails.customer.customerId > 0) && readOnly === false) ?
                        <div className="col-6 pl-0 pr-0 pt-1 text-right">
                            <button type="button" className="btn waves-effect waves-light btn-primary mt-0 ml-1 btn-sm pt-1" onClick={() => setIsCreateProfileOpen(!isCreateProfileOpen)}>
                                Add/Update Profile
                            </button>
                        </div>
                        :
                        <></>
                }
                {
                    ((customerDetails === undefined || customerDetails === null || customerDetails.customer === undefined || customerDetails.customer.customerId === undefined) && readOnly === false) ?
                        <div className="col-12 mb-1">
                            <h5 className="text-center text-danger">
                                Source not found please create new profile
                            </h5>
                            <div className="text-center">
                                <button type="button" className="btn waves-effect waves-light btn-primary mt-0 ml-1 btn-sm pt-1" onClick={() => setIsCreateProfileOpen(!isCreateProfileOpen)}> Add/Update Profile</button>
                            </div>
                        </div>
                        :
                        <></>
                } */}
                {
                    ((customerDetails && customerDetails !== null && customerDetails?.profileId && customerDetails.profileNo) && readOnly === false) ?
                        <div className="col-12 pl-0 pr-0 pt-1 text-right">
                            <button type="button" className="skel-btn-submit" onClick={() => setIsCreateProfileOpen(!isCreateProfileOpen)}>
                                Add/Update Profile
                            </button>
                        </div>
                        :
                        <></>
                }
                {
                    ((!customerDetails || !customerDetails?.profileId || !customerDetails.profileNo) && readOnly === false) ?
                        <div className="skel-widget-warning">
                            <span className="text-center mb-2">
                                Source not found please create new profile!
                            </span>
                            <div className="text-center">
                                <button type="button" className="skel-btn-submit" onClick={() => setIsCreateProfileOpen(!isCreateProfileOpen)}> Add/Update Profile</button>
                            </div>
                        </div>
                        :
                        <></>
                }
            </div>
            <CustomerDetailsView
                data={{
                    customerDetails,
                    helpdeskId: detailedViewItem?.helpdeskId || detailedViewItem?.chatId,
                    readOnly,
                    detailedViewItem
                }}
                handler={{
                    doSoftRefresh
                }}
            />
            {
                isCreateProfileOpen && readOnly === false &&
                <CreateProfileModal
                    data={{
                        isCreateProfileOpen,
                        detailedViewItem
                    }}
                    handlers={{
                        doSoftRefresh,
                        setIsCreateProfileOpen
                    }}
                />
            }
        </>
    )
})

export default InteractionDeatilsPart1;