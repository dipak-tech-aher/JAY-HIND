import React, { useState } from 'react';
import { properties } from "../../../properties";
import { post, get } from "../../../common/util/restUtil";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Modal, CloseButton } from 'react-bootstrap';

function CustomModal(props) {
    let { selectedStatus, isCancelOpen, selectedInteraction, statusReason, isUpcomingRefresh, selectedOrder } = props.data;
    let { setIsCancelOpen, setIsUpcomingRefresh } = props.handlers;

    selectedInteraction = selectedInteraction && selectedInteraction?.length > 0 && selectedInteraction[0]

    selectedOrder = selectedOrder && selectedOrder?.length > 0 && selectedOrder[0]

    const initialFormData = {
        statusReason: ''
    }

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmitForm = (e) => {
        e.preventDefault();
        // Validate form data
        const newErrors = {};

        if (!formData.statusReason) {
            newErrors.statusReason = 'Status Reason is required';
        }

        // If there are errors, update the state
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            Swal.fire({
                title: 'Are you sure to want to mark the appointment as ' + selectedStatus?.description + ' ?',
                text: ``,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: `Proceed`
            }).then((result) => {
                if (result.isConfirmed) {
                    // Submit the form or perform other actions
                    // console.log('Form submitted:', formData);
                    post(`${properties.APPOINTMENT_API}/update-appoinment-status`, { status: selectedStatus?.code, appointTxnId: selectedInteraction?.appoint_txn_id || selectedOrder?.appoint_txn_id })
                        .then((response) => {
                            if (response?.status === 200) {
                                setIsUpcomingRefresh(!isUpcomingRefresh)
                                setIsCancelOpen(!isCancelOpen)
                                toast.success(response?.message);
                            }
                        })
                        .catch((error) => {
                            console.error(error)
                        })
                        .finally()
                }
            }).catch((error) => {
                console.log(error)
            })

        }
    };


    return (
        <React.Fragment>
            <Modal show={isCancelOpen} onHide={() => setIsCancelOpen(false)} dialogClassName='cust-xs-modal'>
                <Modal.Header>
                    <Modal.Title><h5 className="modal-title">{selectedStatus?.description ?? "Cancel"} Appointment {selectedInteraction?.tran_category_no}</h5></Modal.Title>
                    <CloseButton onClick={() => setIsCancelOpen(false)}><span aria-hidden="true">×</span></CloseButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="row pt-2">
                        <div className="col-md-12">
                            <form onSubmit={handleSubmitForm}>
                                <div>
                                    <label>Status Reason:</label>
                                    {
                                        <select className="form-control" name="statusReason" id="statusReason" onChange={handleChange}>
                                            <option value="">Select the status reason</option>
                                            {statusReason?.map((ele) => {
                                                return <option value={ele?.code}>{ele?.description}</option>
                                            })}
                                        </select>
                                    }
                                    {errors.statusReason && <span className="error" style={{ color: 'red' }}>{errors.statusReason}</span>}
                                </div>
                                <button type="submit" className='btn btn-primary'>Submit</button>
                            </form>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    );
}

export default CustomModal;
