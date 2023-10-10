import React, { memo } from 'react';
import HelpDeskHistory from '../../Interactions/shared/HelpdeskHistory';
import DetailsTabLabels from './DetailsTabLabels';

const DetailsTab = memo((props) => {
    const { detailedViewItem } = props?.data;
    return (
        <div className='row'>
            <div className='card-body'>
                <div className='row'>
                    <div className='col-6'>
                        <DetailsTabLabels
                            data={{
                                detailedViewItem
                            }}
                        />
                    </div>
                    <div className='col-6 border p-0 m-0'>
                        <div className="col-12 p-0">
                            <div className=" bg-light border"><h5 className="text-primary pl-2">Helpdesk Record</h5> </div>
                        </div>
                        <div className='col-12'>
                            <div className='form-group px-2 pt-2 m-0'>
                                <label htmlFor="field-2" className="control-label text-capitalize m-0">{detailedViewItem?.source?.toLowerCase()} Details</label>
                            </div>
                        </div>
                        <div className="mt-2 overflow-auto" style={{ height: `${['E-MAIL'].includes(detailedViewItem?.source) ? '450px' : 'auto'}` }}>
                            <HelpDeskHistory
                                data={{
                                    detailedViewItem,
                                    helpDeskView: 'QA-View'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default DetailsTab;