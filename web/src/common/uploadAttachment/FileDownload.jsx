import React, { useState } from 'react'
import FileUpload from './fileUpload'

const FileDownload = (props) => {

    const { entityType, entityId , refresh } = props?.data
    const [existingFiles, setExistingFiles] = useState([])

    return (
        <>
            <FileUpload
                data={{
                    existingFiles,
                    entityType: entityType,
                    interactionId: entityId,
                    permission: true,
                    refresh
                }}
                handlers={{
                    setExistingFiles
                }}
            />
        </>
    )
}

export default FileDownload

