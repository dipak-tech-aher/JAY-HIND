import React from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import DeleteChildTickets from './DeleteChildTickets';
import SearchChildTickets from './SearchChildTickets';
import UploadChildTickets from './UploadChildTickets';

const AddChildTickets = (props) => {

    const { servcieTypeLookup, problemCodeLookup, interactionLookup, templateStatusFlags, templateUploadCounts, uploadTemplateList, childTicketChoice, file, fileName, uploadStatusResponse, showImportantInstruction, childTicketData, totalCount, selectedMappedChildTicketIdList,
        intialValue, masterTicketId, deleteChildTicketIdList } = props?.data
    const { setTemplateUploadCounts, setUploadTemplateList, setTemplateStatusFlags, setChildTicketChoice, setFile, setFileName, setUploadStatusResponse, setShowImportantInstruction, setChildTicketData, setTotalCount, setSelectedMappedChildTicketIdList,
        handleProcessChildTicket, setDeleteChildTicketIdList } = props.handler

    /**
     * 
     * @param {Event} e 
     */
    const handleOnChangeRadio = (e) => {
        const { target } = e
        if (target.id === "search") {
            unstable_batchedUpdates(() => {
                setChildTicketChoice("search")
                setSelectedMappedChildTicketIdList([])
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
            })

        }
        else if (target.id === "import") {
            unstable_batchedUpdates(() => {
                setChildTicketChoice("import")
                setSelectedMappedChildTicketIdList([])
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
            })
        }

    }

    return (
        <>
            {intialValue?.mode === "EDIT" ?
                <div className="tab-pane pb-2" id="basictab1">
                    <div className="col-12 pl-2 bg-light border">
                        <h5 className="text-primary">Delete Previously Added Existing Child Tickets</h5>
                    </div>
                    <DeleteChildTickets
                        data={{
                            intialValue,
                            masterTicketId,
                            deleteChildTicketIdList
                        }}
                        handler={{
                            setDeleteChildTicketIdList
                        }}
                    ></DeleteChildTickets>
                </div>
                : <></>
            }
            <div className="tab-pane" id="basictab2">
                <div className="col-12 pl-2 bg-light border">
                    <h5 className="text-primary">Add Child Tickets (Search or Import)</h5>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="form-group">
                            <div className="col-sm-8 pt-2">
                                <div className="input-group date">
                                    <div className="radio radio-primary mb-2">
                                        <input type="radio" id="search" name="search" className="form-check-input"
                                            checked={childTicketChoice === 'search'} onChange={handleOnChangeRadio} />
                                        <label htmlFor="search">Search Tickets</label>
                                    </div>
                                    <div className="radio radio-primary mb-2">
                                        <input type="radio" id="import" className="form-check-input" name="import"
                                            checked={childTicketChoice === 'import'} onChange={handleOnChangeRadio} />
                                        <label htmlFor="import">Import Tickets</label>
                                    </div>
                                </div>
                            </div>
                            {
                                childTicketChoice === "search" ? <SearchChildTickets
                                    data={{
                                        servcieTypeLookup,
                                        problemCodeLookup,
                                        interactionLookup,
                                        childTicketData,
                                        totalCount,
                                        selectedMappedChildTicketIdList,
                                        templateUploadCounts
                                    }}
                                    handler={{
                                        setChildTicketData,
                                        setTotalCount,
                                        setSelectedMappedChildTicketIdList,
                                        setTemplateUploadCounts,
                                        handleProcessChildTicket
                                    }}
                                /> : childTicketChoice === "import" ?
                                    <UploadChildTickets
                                        data={{
                                            uploadTemplateList,
                                            file,
                                            fileName,
                                            templateUploadCounts,
                                            templateStatusFlags,
                                            uploadStatusResponse,
                                            showImportantInstruction
                                        }}
                                        handler={{
                                            setUploadTemplateList,
                                            setFile,
                                            setFileName,
                                            setTemplateUploadCounts,
                                            setTemplateStatusFlags,
                                            setUploadStatusResponse,
                                            setShowImportantInstruction
                                        }}
                                    />
                                    : <></>
                            }
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default AddChildTickets;