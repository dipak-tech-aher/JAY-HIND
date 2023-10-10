/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";

import { ChildTicketMandatoryColumns } from '../PreviewAndValidate/BulkUploadColumns';
import Child_Ticket_Template from '../UploadExcelTemplates/Child_Ticket_Template.xlsx';

const UploadChildTickets = (props) => {
    const { uploadTemplateList, fileName, templateUploadCounts, showImportantInstruction } = props?.data
    const { setUploadTemplateList, setFile, setFileName, setTemplateUploadCounts, setTemplateStatusFlags, setShowImportantInstruction } = props?.handler

    const handleFileRejection = () => {
        setUploadTemplateList({
            uploadList: [],
            rejectedList: [],
            finalList: [],
            extraList: []
        })
        setTemplateUploadCounts({
            success: 0,
            failed: 0,
            total: 0
        })
        setTemplateStatusFlags({
            validateCheck: false,
            showErrorCheck: false,
            proceedCheck: false
        })
    }

    const handleFileSelect = (e) => {
        
        setFileName(e.target.files[0]?.name);
        setFile(e.target.files[0]);
        readExcel(e.target.files[0])
    }

    const readExcel = (file) => {
        let error = false
        let fi = document.getElementById('file');
        var extension = file.name.substr(file.name.lastIndexOf('.'));
        if ((extension.toLowerCase() === ".xls") || (extension.toLowerCase() === ".xlsx")) {
            error = false
        }
        else {
            error = true
            toast.error(file.name + ' is not a excel file, Please try again');
            
            handleFileRejection()
            return false;
        }
        if (fi.files.length > 0) {
            for (let i = 0; i <= fi.files.length - 1; i++) {
                let fsize = fi.files.item(i).size;
                if (fsize > 5242880) {
                    error = true
                    toast.error("File too Big, Please Select a File less than 4mb");
                    setFile(null)
                    setFileName("")
                    handleFileRejection()
                    
                }
            }
        }
        if (error) {
            
            return;
        }
        else {
            const promise = new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);
                fileReader.onload = (e) => {
                    const bufferArray = e.target.result;
                    const wb = XLSX.read(bufferArray, { type: "buffer" });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws);
                    resolve(data);
                };
                fileReader.onerror = (error) => {
                    
                    reject(error);
                };
            });
            promise.then((d) => {
                handleFileUpload(d);
                fi.value = "";
            }).catch(error => console.log(error));
        }
    }

    const handleFileUpload = (list) => {
        let acceptFile = false
        list.map((z) => {
            if ("Interaction Id" in z && "Account Id" in z && "Account Name" in z && "Problem Code" in z && "Status" in z) {
                acceptFile = true
            }
        })

        if (acceptFile === false) {
            setFile(null)
            setFileName("")
            handleFileRejection()
            
            toast.error("Fields are not matching, Please Check the Mandatory Fields and try again")
            return false;
        }

        let tempTaskList = []
        let count = 0
        list.map((task) => {
            count = count + 1
            let taskObject = {}
            taskObject = {
                indexId: count,
                intxnId: task["Interaction Id"] || null,
                accountId: task["Account Id"] || null,
                AccountName: task["Account Name"] || null,
                problemCode: task["Problem Code"] || null,
                status: task["Status"] || null
            }
            tempTaskList.push(taskObject)
        })

        toast.success(fileName + ' Uploaded Successfully');
        setUploadTemplateList({ ...uploadTemplateList, uploadList: tempTaskList, rejectedList: [], finalList: [] })
        setTemplateUploadCounts({ ...templateUploadCounts, total: tempTaskList.length, failed: 0, success: 0 })
        setTemplateStatusFlags({
            validateCheck: false,
            showErrorCheck: false,
            proceedCheck: false
        })
        
    }

    // FIXME: NEED TO CHECK ACCORDION
    return (
        (
            <div className="row ">
                <div className="col-6 pt-4 float-left"></div>
                <div className="col-6 float-right">
                    <h5>Sample Template Child Ticket Bulk Upload</h5>
                    <div className="form-group row bg-white border p-2" key="1">
                        <div className="col-md-2">
                            <div className="avatar-sm">
                                <a download="Child_Ticket_Template.xlsx" href={Child_Ticket_Template}>
                                    <span className="avatar-title bg-primary rounded">
                                        <i className="mdi mdi-microsoft-excel font-22"></i>
                                    </span>
                                </a>
                            </div>
                        </div>
                        <div className="col-md-7">
                            <a className="text-black font-weight-bold" download="Child_Ticket_Template.xlsx" href={Child_Ticket_Template}>Child_Ticket_Template.xlsx</a>
                            {/* <p className="mb-0">1.11 MB</p> */}
                        </div>
                        <div className="col-md-2">
                            <a className="btn btn-link btn-lg text-muted" download="Child_Ticket_Template.xlsx" href={Child_Ticket_Template}>
                                <i className="dripicons-download"></i>
                            </a>
                        </div>
                    </div>
                    <br />
                </div>
                <div className="accordion custom-accordion col-md-12 p-0 border customer skill status-card-btm" id="custom-accordion-one" >
                    <div className="card-header" id="headingTen">
                        <h5 className="m-0 position-relative" onClick={() => { setShowImportantInstruction(!showImportantInstruction) }}>
                            <a className="custom-accordion-title text-reset d-block" data-toggle="collapse" data-target="#collapseTen" aria-expanded="true" aria-controls="collapseTen">
                                Important Instructions
                                {
                                    showImportantInstruction ?
                                        <i className="mdi mdi-chevron-down accordion-arrow"></i>
                                        :
                                        <i className="mdi mdi-chevron-right accordion-arrow"></i>
                                }

                            </a>
                        </h5>
                    </div>
                    {
                        showImportantInstruction &&
                        <div id="collapseTen" className="collapse show" aria-labelledby="headingTen" data-parent="#custom-accordion-one" >
                            <div>
                                <div className="col-md-12 row pt-2 pl-2">
                                    <div className="border bg-light p-2 mb-2">

                                        <div className="col-md-12" >
                                            <p>These are the mandatory fields required for the migration. The Excel sheet template should contain these mandatory fields</p>
                                            <p></p>
                                            {/* <p>Es un hecho establecido hace demasiado tiempo que un lector se distraerá con el contenido del texto de un sitio mientras que mira su diseño. El punto de usar Lorem Ipsum es que tiene una distribución más o menos normal de las letras, al contrario de usar textos como por ejemplo "Contenido aquí, contenido aquí". </p> */}
                                            <h4>Mandatory Fileds</h4>
                                            <div className="card-body">
                                                <div className="row col-12">

                                                    <div className="col-4">
                                                        <ul className="list-group">
                                                            {
                                                                ChildTicketMandatoryColumns.map((name) => (
                                                                    <li className="list-group-item">{name}</li>
                                                                ))
                                                            }
                                                        </ul>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <div className="col-12 pt-2">
                    <div className=" pl-2 bg-light border">
                        <h5 className="text-primary">File Upload</h5>
                    </div>
                </div>
                <div className="col-12">
                    <br />
                    <div className="form-group col-12">
                        <label htmlFor="email_address" className=" col-form-label text-md-left">Choose the file to Upload</label>
                    </div>
                    <div className="grid-x grid-padding-x">
                        <div className="small-10 small-offset-1 medium-8 medium-offset-2 cell">
                            <fieldset className="scheduler-border">
                                <div className="ml-6 file-upload d-flex justify-content-center mt-3 cursor-pointer excel" >
                                    <div className="file-select">
                                        <div className="file-select-button" id="fileName" >Choose File</div>
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls"
                                            id="file"
                                            onChange={handleFileSelect}
                                        />
                                    </div>
                                </div>
                                <div className="ml-3 d-flex justify-content-center">
                                    <div className="file-select">
                                        <div className="file-select-name" id="noFile">{fileName}</div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    <br /><br /><br />
                </div>
            </div>
        )
    )

}

export default UploadChildTickets