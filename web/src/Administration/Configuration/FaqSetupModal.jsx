import React, { useState } from 'react'
import ReactModal from 'react-modal';
import { toast } from 'react-toastify';

import { Uploader } from 'rsuite';
import DynamicTable from '../../common/table/DynamicTable';
import { RegularModalCustomStyles } from '../../common/util/util';

const FaqSetupModal = (props) => {

    const { isOpen, faqList } = props?.data
    const { setIsOpen, setFaqList } = props?.handler
    const [faqData,setFaqData] = useState({
        faqQuestion: "",
        faqAnswer: ""
    })

    const handleAdd = () => {
        if(!faqData.faqQuestion || !faqData.faqAnswer) {
            toast.error('Please Provide the Mandatory Fields')
            return
        }
        setFaqList([...faqList,{...faqData, indexId: Math.floor((Math.random() * 100) + 1)}])
        setIsOpen(false)
    }

    const handleRemove = (data) => {
        setFaqList(faqList.filter((x) => x.indexId !== data.indexId))
    }

    const columns = [
        {
            Header: "Action",
            accessor: "action",
            disableFilters: true,
        },
        {
            Header: "FAQ Question",
            accessor: "faqQuestion",
            disableFilters: true,
        },
        {
            Header: "FAQ Answer",
            accessor: "faqAnswer",
            disableFilters: true,
        },
    ]

    const handleCellRender = (cell, row) => {
        if (["Action"].includes(cell.column.Header)) {
            return (
                <>
                    {/* <button type="button" className="btn btn-danger btn-sm waves-effect waves-light mr-2" onClick={() => handleRemove(row.original)}>Remove</button> */}
                    <button type="button" className="btn btn-danger btn-sm waves-effect waves-light mr-2" onClick={() => handleRemove(row.original)}>Remove</button>
                </>
            )
        }
        return (<span>{cell.value}</span>)
    }

    return (
        <>
            <ReactModal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                <div className="modal-center" id="followhistoryModal" tabIndex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                    <div className="modal-dialog " role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="followupModal">FAQ</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {/* <div className={`skel-form-heading-bar mt-2`}>
                                    <span className="messages-page__title">Add FAQ</span>
                                </div> */}
                                <div className="col-lg-12 col-md-12 col-xs-12">
                                    <div className='form-row px-0 py-0 mt-1'>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="faqQuestion" className="control-label">FAQ Question <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <textarea id="faqQuestion" className="form-control" value={faqData.faqQuestion} onChange={(e) => setFaqData({ ...faqData, faqQuestion: e.target.value })} type='text' />
                                            </div>
                                        </div>
                                        {/* <div className="col-md-12">
                                            <div className="form-group">
                                                <label htmlFor="order" className="control-label">Order</label>
                                                <input id="order" className="form-control" value="" type='text' />
                                            </div>
                                        </div> */}
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="faqAnswer" className="control-label">FAQ Answer <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <textarea id="faqAnswer" className="form-control" value={faqData.faqAnswer} onChange={(e) => setFaqData({ ...faqData, faqAnswer: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="col-md-12 pl-2 mt-3">
                                            <div className="form-group pb-1">
                                                <div className="text-center">
                                                    <button type="button" className="skel-btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                                                    <button type="button" className="skel-btn-submit" onClick={handleAdd}>Add</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className='col-lg-6 col-md-6 col-xs-12'>
                                        <label className='control-label'>Upload PDF</label>
                                        <Uploader action="" draggable>
                                            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span>Click or Drag files to this area to upload</span>
                                            </div>
                                        </Uploader>
                                    </div> */}
                                </div>
                                
                                

                                <hr className="cmmn-hline mt-2 mb-4" />
                                <div className={``}>
                                    {/* <span className='skel-heading'>Frequently Asked Questions</span> */}
                                    <div className="skel-cust-role-btn mb-2"><button type="button" className="skel-btn-orange mr-1">Upload PDF</button></div>
                                    <DynamicTable
                                        row={faqList}
                                        itemsPerPage={10}
                                        header={columns}
                                        handler={{
                                            handleCellRender: handleCellRender,
                                        }}
                                    />
                                    

                                   
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </ReactModal>
        </>
    )
}

export default FaqSetupModal