import moment from 'moment';
import React, { useState } from 'react';
import DynamicTable from '../../common/table/DynamicTable';
import { CustomerDetailsViewColumns } from './CustomerDetailsViewColumn';
import CreateInteraction from './interactionModal';
import { Element } from 'react-scroll';
import { post } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { useHistory } from 'react-router-dom';
import { statusConstantCode } from '../../AppConstants';
import { toast } from 'react-toastify';

const CustomerDetailsView = (props) => {
    const { detailedViewItem, customerDetails, helpdeskId, readOnly } = props.data;
    const { doSoftRefresh } = props.handler
    const [createInteraction, setCreateInteraction] = useState(false);
    const [customerinfo, setCustomerinfo] = useState([])
    const history = useHistory();

    const getCustomerDataForComplaint = () => {
        console.log(customerDetails);
        if (customerDetails && customerDetails?.source !== 'PROFILE') {
            const requestParam = {
                customerNo: customerDetails?.profileNo,
                status: ['CS_ACTIVE', 'CS_PEND', 'CS_TEMP', 'CS_PROSPECT']
            }

            post(`${properties.CUSTOMER_API}/get-customer?limit=${1}&page=${0}`, requestParam)
                .then((resp) => {
                    if (resp?.data) {
                        if (resp?.status === 200) {
                            const data = resp?.data?.rows?.[0]
                            if (data) {
                                data.source = statusConstantCode.entityCategory.HELPDESK
                                data.helpdeskDetails = detailedViewItem || {}
                                history.push(`${process.env.REACT_APP_BASE}/create-interaction`, { data })
                            }
                        }
                    } else {
                        toast.error('No Customer details Found')
                    }
                }).catch((error) => {
                    console.error(error);
                    toast.error('No Customer details Found')
                })
                .finally();

        } else {
            const requestParam = {
                profileNo: customerDetails?.profileNo,
                status: 'AC'
            }
            post(`${properties.PROFILE_API}/search`, requestParam).then((resp) => {
                if (resp?.data && resp?.status === 200) {
                    console.log('resp --------------->', resp)

                }
            }).catch((error) => {
                console.error(error)
            })
        }
    }

    const handleCreateInteraction = () => {
        getCustomerDataForComplaint()
        // setCreateInteraction(true)
    }

    const handleCellRender = (cell, row) => {
        if (['Created On', 'Updated On'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD-MMM-YYYY HH:MM:SS A') : '-'}</span>)
        }
        else {
            return (<span>{cell.value || '-'}</span>)
        }
    }

    console.log(customerDetails && customerDetails !== null && customerDetails?.profileId && customerDetails.profileNo)

    return (
        <>
            <div className="col-12 row pt-2 m-0 helpdesk-padding-left-0 skel-interaction-detail-section">
                {
                    // (customerDetails && customerDetails.customer && customerDetails.customer.customerId > 0) ?
                    (customerDetails && customerDetails !== null && customerDetails?.profileId && customerDetails.profileNo) ?
                        <>
                            <Element>
                                <table>
                                    <tr>
                                        <td width="100%" className='form-label'>Profile ID</td>
                                        <td width="5">:</td>
                                        <td width="25%">{customerDetails?.customer?.crmCustomerNo || customerDetails?.profileNo}</td>
                                    </tr>
                                    <tr>
                                        <td width="100%" className='form-label'>Full Name</td>
                                        <td width="5%">:</td>
                                        <td width="25%">{customerDetails?.customer?.fullName || ((customerDetails?.firstName || "") + ' ' + (customerDetails?.lastName || ""))}</td>
                                    </tr>
                                    <tr>
                                        <td width="100%" className='form-label'>Customer Type</td>
                                        <td width="5%">:</td>
                                        <td width="50%">{customerDetails?.profileCategory?.description}</td>
                                    </tr>
                                    <tr>
                                        <td width="100%" className='form-label'>Contact Number</td>
                                        <td width="5%">:</td>
                                        <td width="50%">{customerDetails?.contactDetails?.mobileNo}</td>
                                    </tr>
                                    <tr>
                                        <td width="100%" className='form-label'>ID Type</td>
                                        <td width="5%">:</td>
                                        <td width="50%">{customerDetails?.idType?.description}</td>
                                    </tr>
                                    <tr>
                                        <td width="100%" className='form-label'>ID Value</td>
                                        <td width="5%">:</td>
                                        <td width="50%">{customerDetails?.idValue}</td>
                                    </tr>
                                    <tr>
                                        <td width="100%" className='form-label'>Email</td>
                                        <td width="5%">:</td>
                                        <td width="50%">{customerDetails?.contactDetails?.emailId}</td>
                                    </tr>
                                    <tr>
                                        <td width="100%" className='form-label'>Contact Preference</td>
                                        <td width="5%">:</td>
                                        <td width="50%">{customerDetails?.contactPreferences ? customerDetails?.contactPreferences.map((e) => { return ' ' + e.description }) : ''}</td>
                                    </tr>
                                </table>
                                {/* <div className="col-12 row pt-2">
                            <div className="col-6 pl-0">
                                <div className="form-label ">Profile ID:</div>
                                <div className="form-vtext">{customerDetails?.customer?.crmCustomerNo || customerDetails?.profileNo}</div>
                            </div>
                            <div className="col-6 pl-0">
                                <div className="form-label ">Full Name:</div>
                                <div className="form-vtext">{customerDetails?.customer?.fullName || ( (customerDetails?.firstName || "") + ' ' + (customerDetails?.lastName || "")  )}</div>
                            </div>
                        </div>
                        <div className="col-12 row pt-1">
                            <div className="col-6 pl-0">
                                <div className="form-label ">Customer Type:</div>
                                <div className="form-vtext text-capitalize">{customerDetails?.profileCategory?.description}</div>
                            </div>
                            <div className="col-6 pl-0">
                                <div className="form-label ">Contact Number:</div>
                                <div className="form-vtext">{customerDetails?.contactDetails?.mobileNo}</div>
                            </div>
                        </div>
                        <div className="col-12 row pt-1">
                            <div className="col-6 pl-0">
                                <div className="form-label ">ID Type:</div>
                                <div className="form-vtext">{customerDetails?.idType?.description}</div>
                            </div>
                            <div className="col-6 pl-0">
                                <div className="form-label ">ID Value:</div>
                                <div className="form-vtext">{customerDetails?.idValue}</div>
                            </div>
                        </div>
                        <div className="col-12 row pt-1">
                            <div className="col-12 pl-0">
                                <div className="form-label ">Email:</div>
                                <div className="form-vtext text-break">{customerDetails?.contactDetails?.emailId}</div>
                            </div>
                        </div>
                        <div className="col-12 row pt-1">
                            <div className="col-12 pl-0">
                                <div className="form-label ">Contact Preference :</div>
                                <div className="form-vtext">{customerDetails?.contactPreferences ? customerDetails?.contactPreferences.map((e)=> {return ' '+e.description}) : ''}</div>
                            </div>
                        </div> */}
                            </Element>
                        </>
                        :
                        <></>
                }


                {

                    (customerDetails && customerDetails !== null && customerDetails?.profileId && customerDetails.profileNo) ?
                        <Element>
                            <div>
                                <hr className='cmmn-hmline' />
                                <div className="skel-helpdeskinfo-search mt-2">


                                    <h5 id="list-item-0">Interaction History</h5>

                                    <div className={`text-right pt-1 pr-0 ${readOnly ? 'd-none' : ''}`}>
                                        <button type="button" className="skel-btn-submit" data-toggle="modal" data-target="#createlead" onClick={handleCreateInteraction}>Create Interaction</button>
                                    </div>


                                    {
                                        (detailedViewItem?.interactionDetails && detailedViewItem?.interactionDetails?.length > 0) ?
                                            <DynamicTable
                                                row={detailedViewItem?.interactionDetails
                                                    ? detailedViewItem.interactionDetails
                                                    : []}
                                                header={CustomerDetailsViewColumns}
                                                itemsPerPage={10}
                                                exportBtn={false}
                                                columnFilter={true}
                                                handler={{
                                                    handleCellRender: handleCellRender,
                                                }}
                                            />
                                            :
                                            <span className="skel-widget-warning">No interactions available yet</span>
                                    }
                                </div>
                            </div>
                        </Element>
                        :
                        <></>

                }
                {
                    createInteraction &&
                    <CreateInteraction
                        data={{
                            isOpen: createInteraction,
                            customerDetails: customerDetails,
                            helpdeskId: helpdeskId,
                            detailedViewItem,
                            forChatInteractions: detailedViewItem?.source === 'E-MAIL' ? false : detailedViewItem?.source === 'LIVECHAT' ? true : false
                        }}
                        handler={{
                            setIsOpen: setCreateInteraction,
                            doSoftRefresh
                        }}
                    />
                }
            </div>
        </>
    )
}

export default CustomerDetailsView;