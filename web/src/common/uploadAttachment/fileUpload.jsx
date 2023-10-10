import React, { useContext, useEffect, useState } from 'react'
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'
import { properties } from '../../properties';
import { get, post } from "../../common/util/restUtil";
import { toast } from "react-toastify";

import axios from 'axios'
import { AppContext } from "../../AppContext";
import { hideSpinner, showSpinner } from '../spinner';

const FileUpload = (props) => {

    const { currentFiles = [], existingFiles, entityType, interactionId, shouldGetExistingFiles = true, permission = false, refresh = false } = props.data;
    const { setCurrentFiles, setExistingFiles } = props.handlers;
    const { auth } = useContext(AppContext);



    // useEffect(() => {
    //     if (shouldGetExistingFiles) {

    //         get(properties.ATTACHMENT_API + "?entity-id=" + interactionId + "&entity-type=" + entityType)
    //             .then((resp) => {
    //                 if (resp.data && resp.data.length) {
    //                     setExistingFiles(resp.data)
    //                 }
    //             })
    //             .catch((error) => {
    //                 console.error("error", error)
    //             })
    //             .finally()
    //     }
    // }, [refresh])

    let array = []
    // const convertBase64 = (file) => {
    //     return new Promise((resolve, reject) => {
    //         const fileReader = new FileReader();
    //         fileReader.readAsDataURL(file);
    //         //fileReader.readAsBinaryString(file)
    //         //fileReader.readAsArrayBuffer(file)
    //         fileReader.onload = () => {
    //             resolve(fileReader.result);
    //             return fileReader.result
    //         };

    //         fileReader.onerror = (error) => {
    //             reject(error);
    //         };
    //     });
    // };

    // const handleDelete = (id) => {
    //     let finalData = []
    //     finalData = existingFiles.filter((item) => item.attachmentId !== id)
    //     setExistingFiles(finalData)
    //     toast.success("File Deleled Successfully")
    // }

    // called every time a file's `status` changes
    const handleChangeStatus = ({ meta, file, remove }, status) => {
        if (file.size > 5242880) {
            if (status === "preparing") {
                remove()
                toast.error("Attached file size is big greater than 5MB")
                return false;
            }
            else {
                return false;
            }
        }
        // let name = file.name
        let arrayObject = {}
        let array = []
        if (status === 'done') {

            (async () => {
                const data = new FormData();
                data.append("file_to_upload", file)
                try {
                    showSpinner()

                    await axios.post(properties.API_ENDPOINT + properties.COMMON_API + '/upload-files/storage?entityType=' + entityType, data, {
                        headers: {
                            "x-tenant-id": properties.REACT_APP_TENANT_ID,
                            //    "x-refresh-token": auth?.refreshToken,
                            Authorization: auth?.accessToken
                        },
                    }).then((resp) => {
                        arrayObject = { entityId: resp?.data?.data?.entityId, metaId: meta?.id }
                        array.push(arrayObject)
                        setCurrentFiles([...currentFiles, ...array])
                        toast.success(`${file.name} Uploaded Successfully`)
                    })
                        .catch((error) => {
                            console.error(error)
                        })
                        .finally(hideSpinner);
                } catch (error) {
                    console.error(error)
                }
            })();
        }
        else if (status === 'removed') {
            let data = currentFiles.filter((item) => item.metaId !== meta.id)
            setCurrentFiles(data)
            // let data = []
            // data = array.filter((item) => item.fileName !== name)
            // array = data
            // setCurrentFiles([...data])
        }
    }

    // const handleUploadImage = async (fileData, base64String) => {
    //     
    //     const data = new FormData();
    //     data.append("file_to_upload", fileData)
    //     try {
    //         await axios.post(properties.API_ENDPOINT + properties.COMMON_API + '/upload-files', data, {
    //             headers: {
    //                 "x-tenant-id": "a89d6593-3aa8-437b-9629-9fcbaa201da6",
    //                 Authorization: auth?.accessToken
    //             },
    //         }).then((resp) => {
    //             if (resp.data) {
    //                 if (resp.status === 200) {
    //                     const response = resp?.data?.data
    //                     console.log(response)
    //                     // setFile(response?.fileUrl)
    //                     // setFileUploadType('')
    //                     // setIsOpen(false)
    //                 }
    //             }
    //         }).finally();
    //     } catch (ex) {
    //         console.log(ex);
    //         
    //     }
    // }

    const handleFileDownload = (id) => {
        get(`${properties.COMMON_API}/download-files/${id}`)
            .then((resp) => {
                if (resp?.data?.url) {
                    const downloadLink = document.createElement("a");
                    downloadLink.href = resp.data.url;
                    downloadLink.style.display = "none";
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            })
            .catch((error) => {
                console.error("error", error)
            })
            .finally(() => {

            })
    }

    return (
        <>
            <div className="row attach-block">
                {
                    permission !== true &&
                    <div className="col-lg-12 mt-2 pl-3 pr-3">
                        <span className="errormsg">Each File Size allowed : less than 5 mb</span>
                        <Dropzone
                            classNames="w-100"
                            onChangeStatus={handleChangeStatus}
                            // onSubmit={handleSubmit}
                            styles={{ dropzone: { height: "100px" } }}
                            accept="image/*,.pdf,.txt,.docx,.doc,.xlsx,.xls,.csv"
                            submitButtonContent=""
                        //maxSizeBytes="5242880"
                        // maxFiles={3}
                        />
                        {/* <span>Maximum 3 files</span> */}
                    </div>
                }
                <div className="col-12" /*style={{ width: "900px" }}*/>
                    {
                        existingFiles && existingFiles.map((file) => {
                            return (
                                <div className="attach-btn" key={file.attachmentUuid}>
                                    <i className="fa fa-paperclip" aria-hidden="true"></i>
                                    <a key={file.attachmentUuid} onClick={() => handleFileDownload(file.attachmentUuid)}>{file.fileName}</a>
                                    {/* <button type="button" disabled={permission} className="close ml-2" onClick={() => handleDelete(file.attachmentId)}>
                                        <span aria-hidden="true">&times;</span>
                                    </button> */}
                                </div>
                            );
                        })
                    }
                </div>
                {
                    permission === true && existingFiles && existingFiles.length === 0 &&
                    <div className="col-12 msg-txt pl-2 pr-2 pb-0">
                        <p class="skel-widget-warning">No Attachments Found</p>
                    </div>
                }
            </div>
        </>
    );
}


export default FileUpload;