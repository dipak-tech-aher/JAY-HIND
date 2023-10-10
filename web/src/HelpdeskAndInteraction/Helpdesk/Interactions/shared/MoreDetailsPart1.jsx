import React, { useState } from 'react';
import DynamicTable from '../../../../common/table/DynamicTable';
import { CustomerDetailsInteractionViewColumns } from '../../CustomerDetailsViewColumn';
import moment from 'moment';
import { history } from '../../../../common/util/history';
import CreateInteraction from '../../interactionModal';

const MoreDetailsPart1 = (props) => {
    const { detailedViewItem, customerDetails, readOnly = false } = props.data;
    const { doSoftRefresh, getInteractionDataById } = props.handlers;

    const [createInteraction, setCreateInteraction] = useState(false);

    console.log('props ------------>', props)

    const handleOnViewDetails = () => {
        const response = getInteractionDataById(detailedViewItem?.intxnId);
        response.then((resolved, rejected) => {
            if (resolved && !!Object.keys(resolved)?.length) {
                history.push(`${process.env.REACT_APP_BASE}/edit-${resolved?.row?.intxnTypeDesc?.toLowerCase()?.replace(' ', '-')}`, {
                    data: {
                        ...resolved,
                        fromHelpDesk: true,
                        helpDeskView: 'ASSIGNED',
                        detailedViewItem
                    }
                })
            }
        }).catch(error => console.log(error))
    }

    const handleCreateInteraction = () => {
        setCreateInteraction(true)
    }

    const handleCellRender = (cell, row) => {
        if (['Created On', 'Updated On'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD-MMM-YYYY HH:MM:SS A') : '-'}</span>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    return (
        <>
            <div className="col-12 row">
                <div className="col-4">
                    <div className="form-group">
                        <label htmlFor="customerTitle" className="col-form-label">Source </label>
                        <p className='text-capitalize remove-p-style'>{detailedViewItem?.helpdeskDetails?.source?.toLowerCase() || 'Live Chat'}</p>
                    </div>
                </div>
                <div className="col-4">
                    <div className="form-group">
                        <label htmlFor="customerTitle" className="col-form-label">Source Reference</label>
                        <p className="text-break remove-p-style">{detailedViewItem?.helpdeskDetails?.email || detailedViewItem?.chatDetails?.emailId}</p>
                    </div>
                </div>
                {
                    <div className="col-4 pt-1 text-right">
                        <button type="button" className="skel-btn-submit" onClick={handleOnViewDetails}>
                            Update
                        </button>
                    </div>
                }
            </div>
            {
                !readOnly ?
                    <div className="col-12 text-center pt-1">
                        <section className="triangle">
                            <div className="row col-12 pr-0">
                                <div className="col-6 text-left">
                                    <h4 id="list-item-0">Interaction History</h4>
                                </div>
                                <div className={`col-6 text-right pt-1 pr-1 ${readOnly ? 'd-none' : ''}`}>
                                    <button type="button" className="skel-btn-submit"  data-toggle="modal" data-target="#createlead" onClick={handleCreateInteraction}>Create Interaction</button>
                                </div>
                            </div>
                        </section>
                        <DynamicTable
                            row={customerDetails?.interaction ? customerDetails.interaction : customerDetails?.interactionDetails ? customerDetails.interactionDetails : []}
                            header={CustomerDetailsInteractionViewColumns}
                            itemsPerPage={10}
                            exportBtn={false}
                            handler={{
                                handleCellRender: handleCellRender,
                            }}
                        />
                    </div>
                    :
                    <hr />
            }
            {
                createInteraction &&
                <CreateInteraction
                    data={{
                        isOpen: createInteraction,
                        customerDetails: customerDetails,
                        helpdeskId: detailedViewItem?.helpdeskDetails?.helpdeskId,
                        fromInteractions: true,
                        detailedViewItem
                    }}
                    handler={{
                        setIsOpen: setCreateInteraction,
                        doSoftRefresh
                    }}
                />
            }
        </>
    )
}

export default MoreDetailsPart1;