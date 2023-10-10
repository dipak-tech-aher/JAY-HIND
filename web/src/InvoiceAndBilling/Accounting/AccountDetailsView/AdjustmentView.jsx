import React, { useState } from 'react'
import Modal from 'react-modal'
import DynamicTable from '../../../common/table/DynamicTable';
import { RegularModalCustomStyles } from '../../../common/util/util';

const AdjustmentView = (props) => {

    const isOpen = props.data.isOpen
    const AdjustmentHistoryColumns = props.data.AdjustmentHistoryColumns
    const setIsOpen = props.handler.setIsOpen
    const handleCellRender = props.handler.handleCellRender
    const adjustmentData = props.data.adjustmentData
    const [exportBtn, setExportBtn] = useState(false)
    const AdjustmentHistoryHiddenColumns = ["serviceNumber", "chargeName", "chargeType", "chargeAmount", "adjAmount", "action"]
    const AdjustmentDetailsHiddenColumns = ["adjustmentPeriod", "totalAdjAmount", "status", "reason", "remarks", "modifiedOn", "modifiedBy", "action"]

    return (
        <>
            <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} style={RegularModalCustomStyles}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">View Adjustment</h5>
                            <button type="button" className="close" onClick={() => setIsOpen(false)}>
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="adjusment modal-body">
                            <div className="row">
                                <section className="triangle col-md-12">
                                    <div className="row col-12">
                                        <div className="col-12">
                                            <h4 id="" className="pl-1">Adjustment</h4>
                                        </div>
                                    </div>
                                </section>
                            </div>
                            <div className="col-md-12 card-box">
                                {
                                    !!adjustmentData.length &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Adjustment History"}
                                            row={adjustmentData}
                                            filterRequired={false}
                                            header={AdjustmentHistoryColumns}
                                            hiddenColumns={AdjustmentHistoryHiddenColumns}
                                            itemsPerPage={10}
                                            exportBtn={exportBtn}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handleExportButton: setExportBtn
                                            }}
                                        />
                                    </div>
                                }
                            </div>
                            <div className="row">
                                <section className="triangle col-md-12">
                                    <div className="row col-12">
                                        <div className="col-12">
                                            <h4 id="" className="pl-1">Adjustment Details</h4>
                                        </div>
                                    </div>
                                </section>
                            </div>
                            <div className="col-md-12 card-box">
                                {
                                    adjustmentData && adjustmentData[0]?.adjustmentDetails && !!adjustmentData[0]?.adjustmentDetails.length &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Adjustment Details"}
                                            filterRequired={false}
                                            row={adjustmentData[0]?.adjustmentDetails}
                                            header={AdjustmentHistoryColumns}
                                            hiddenColumns={AdjustmentDetailsHiddenColumns}
                                            itemsPerPage={10}
                                            exportBtn={exportBtn}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handleExportButton: setExportBtn
                                            }}
                                        />
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default AdjustmentView

