import React, { useState } from 'react'
import Modal from 'react-modal'
import { toast } from 'react-toastify'

import FileUpload from '../../../common/uploadAttachment/fileUpload'
import { properties } from '../../../properties'
import { put } from '../../../common/util/restUtil'
import { RegularModalCustomStyles } from '../../../common/util/util'

const CustomerUploadAttachment = (props) => {

    const { customerDetails, isOpen } = props?.data
    const { setIsOpen , pageRefresh} = props?.handler 
    const [currentFiles, setCurrentFiles] = useState([])

    const handleSubmit = () => {
        let requestBody = {
            attachments: [...currentFiles.map((current) => current.entityId)]
        }
        if(requestBody?.attachments.length === 0)
        {
            toast.error("Please Add Attachment")
            return false
        }
        
        put(properties.CUSTOMER_API + '/attachment/' + customerDetails?.customerId,requestBody)
        .then((response) => {
            if(response.status === 200)
            {
                toast.success("Attachment Added Successfully")
                setIsOpen(false)
                pageRefresh()
            }
        })
        .catch((error) => {
            console.log(error)
        })
        .finally()
    }

    return (
        <>
            <Modal isOpen={isOpen} contentLabel="" style={RegularModalCustomStyles}>
                <div>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title" id="standard-modalLabel">Upload - Add New</h4>
                                <button type="button" className="close"  onClick={() => {setIsOpen(false)}}>×</button>
                            </div>
                            <div className="modal-body">
                                <FileUpload
                                    data={{
                                        currentFiles,
                                        entityType: 'CUSTOMER',
                                        shouldGetExistingFiles: false,
                                        permission: false
                                    }}
                                    handlers={{
                                        setCurrentFiles
                                    }}
                                />
                            </div>
                            <div className="modal-footer d-flex justify-content-center">
                                <button type="button" className="btn btn-primary" onClick={handleSubmit}>Attach</button>
							    <button type="button" className="btn btn-secondary" onClick={() => {setIsOpen(false)}}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default CustomerUploadAttachment

