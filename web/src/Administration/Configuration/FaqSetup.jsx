import React, { useState, useEffect } from 'react'
import { CloseButton, Modal, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ReactSelect from 'react-select';
import DynamicTable from '../../common/table/DynamicTable';
import { get, post } from '../../common/util/restUtil';
import { properties } from '../../properties';

const FaqSetup = (props) => {
    const { isOpen, faqList } = props?.data
    const { setIsOpen, getFAQs } = props?.handler
    const [faqData, setFaqData] = useState({
        question: "",
        answer: "",
        channel: "",
        status: "",
        faqId: ""
    })

    const [saving, setSaving] = useState(false);
    const [channels, setChannels] = useState([]);
    const [faqStatuses, setFaqStatuses] = useState([]);

    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=CONFIG_CHANNEL,FAQ_STATUS').then((resp) => {
            if (resp.data) {
                setChannels(resp?.data?.CONFIG_CHANNEL?.map(x => { return { label: x.description, value: x.code } }) || [])
                setFaqStatuses(resp?.data?.FAQ_STATUS || [])
            }
        }).catch(err => console.log(err))
    }, [])

    const handleAdd = () => {
        if (!faqData.question || !faqData.answer || !faqData.channel || !faqData.status) {
            toast.error('Please Provide the Mandatory Fields')
            return;
        }
        setSaving(true);
        post(properties.MASTER_API + '/faqs', faqData).then((res) => {
            if (res.status === 200) {
                console.log("Faqs ===> ", res);
                setIsOpen({
                    ...isOpen,
                    addOrEdit: false
                });
                getFAQs();
                setFaqData({
                    question: "",
                    answer: "",
                    channel: "",
                    status: "",
                    faqId: ""
                });
            }
        }).catch(error => {
            console.error(error)
        }).finally(() => {
            setSaving(false);
        });
    }

    const handleEditOrDelete = (data, key) => {
        setFaqData({ ...data });
        setIsOpen({
            ...isOpen,
            [key]: !isOpen[key]
        });
    }

    const columns = [
        {
            Header: "Question",
            accessor: "question",
            disableFilters: true,
        },
        {
            Header: "Answer",
            accessor: "answer",
            disableFilters: true,
        },
        {
            Header: "Status",
            accessor: "status",
            disableFilters: true,
        },
        {
            Header: "Action",
            accessor: "action",
            disableFilters: true,
        }
    ]

    const handleCellRender = (cell, row) => {
        if (["Action"].includes(cell.column.Header)) {
            return (
                <React.Fragment>
                    <i className="fas fa-trash pl-2 font-16 icolor5 cursor-pointer" onClick={() => handleEditOrDelete(row.original, 'delete')}></i>
                    <i className="fas fa-edit pl-2 font-16 icolor5 cursor-pointer" onClick={() => handleEditOrDelete(row.original, 'addOrEdit')}></i>
                </React.Fragment>
            )
        } else if (["Status"].includes(cell.column.Header)) {
            console.log(row);
            return (
                <Badge bg={row?.original?.statusDesc?.mapping_payload?.statusColorClass}>{row?.original?.statusDesc?.description}</Badge>
            )
        }
        return (<span>{cell.value}</span>)
    }

    return (
        <React.Fragment>
            {faqList?.map((ele, idx) => (
                <div key={idx} className='mt-2'>
                    <span className="skel-app-heading">{ele?.description}</span>
                    <DynamicTable
                        row={ele?.data ?? []}
                        itemsPerPage={10}
                        header={columns}
                        handler={{
                            handleCellRender: handleCellRender,
                        }}
                    />
                </div>
            ))}
            <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isOpen.addOrEdit} onHide={() => setIsOpen({ ...isOpen, addOrEdit: false })} dialogClassName="wsc-cust-mdl-temp-prev">
                <Modal.Header>
                    <Modal.Title><h5 className="modal-title">FAQ</h5></Modal.Title>
                    <CloseButton onClick={() => setIsOpen({ ...isOpen, addOrEdit: false })} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                        <span>×</span>
                    </CloseButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-lg-12 col-md-12 col-xs-12">
                        <div className='form-row'>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="channel" className="control-label">Channel <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <ReactSelect
                                        id='channel'
                                        placeholder="Select Channel"

                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        options={channels}
                                        isMulti={true}
                                        onChange={(selected) => {
                                            setFaqData({ ...faqData, channel: selected?.map(x => x.value) })
                                        }}
                                        value={channels?.filter(x => faqData?.channel?.includes(x.value))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='form-row'>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="question" className="control-label">Question <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input id="question" className="form-control" value={faqData.question} onChange={(e) => setFaqData({ ...faqData, question: e.target.value })} type='text' />
                                </div>
                            </div>
                        </div>
                        <div className='form-row'>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="answer" className="control-label">Answer <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <textarea style={{ height: 'auto' }} id="answer" rows={10} className="form-control" value={faqData.answer} onChange={(e) => setFaqData({ ...faqData, answer: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className='form-row'>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="status" className="control-label">Status <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <select id='status' className='form-control' value={faqData.status} onChange={(e) => setFaqData({ ...faqData, status: e.target.value })} >
                                        <option value="">Select Status</option>
                                        {faqStatuses?.map((e, i) => (
                                            <option value={e.code} key={i}>{e.description}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ display: 'block' }}>
                    <div className="skel-btn-center-cmmn">
                        <button type="button" className="skel-btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                        <button type="button" className="skel-btn-submit" disabled={saving} onClick={handleAdd}>{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                </Modal.Footer>
            </Modal>
            <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isOpen?.delete} onHide={() => setIsOpen({ ...isOpen, delete: false })} dialogClassName="wsc-cust-mdl-temp-prev">
                <Modal.Header>
                    <Modal.Title><h5 className="modal-title">Delete FAQ</h5></Modal.Title>
                    <CloseButton onClick={() => setIsOpen({ ...isOpen, delete: false })} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                        <span>×</span>
                    </CloseButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-lg-12 col-md-12 col-xs-12">
                        Are you sure want to delete the question, <strong>{faqData.question}</strong>?
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ display: 'block' }}>
                    <div className="skel-btn-center-cmmn">
                        <button type="button" className="skel-btn-cancel" onClick={() => setIsOpen({ ...isOpen, delete: false })}>Cancel</button>
                        <button type="button" className="skel-btn-submit" disabled={saving} onClick={handleAdd}>{saving ? 'Deleting...' : 'Delete'}</button>
                    </div>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    )
}

export default FaqSetup