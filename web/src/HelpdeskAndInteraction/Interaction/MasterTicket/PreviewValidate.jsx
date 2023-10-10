/* eslint-disable array-callback-return */

import PreviewDelete from "./PreviewAndValidate/PreviewDelete";
import PreviewValidateImport from "./PreviewAndValidate/PreviewValidateImport";
import PreviewValidateSearch from "./PreviewAndValidate/PreViewValidateSearch";

const PreviewValidate = (props) => {

    const { templateStatusFlags, templateUploadCounts, uploadTemplateList, childTicketChoice, intialValue, deleteChildTicketIdList } = props?.data
    const { setTemplateUploadCounts, setUploadTemplateList, setTemplateStatusFlags } = props?.handler

    return (
        <>

            {intialValue?.mode === "EDIT" ?
                <div className="tab-pane" id="basictab2">
                    <div className="col-12 pl-2 bg-light border">
                        <h5 className="text-primary">Delete Child Tickets</h5>
                    </div>
                    {<PreviewDelete
                        data={{
                            deleteChildTicketIdList
                        }}
                    ></PreviewDelete>}
                </div>
                : <></>
            }
            <div className="tab-pane" id="basictab2">
                <div className="col-12 pl-2 bg-light border">
                    <h5 className="text-primary">Add Child Tickets (Search or Import)</h5>
                </div>
                {
                    childTicketChoice === "search" ? <PreviewValidateSearch
                        data={{
                            uploadTemplateList,
                            templateUploadCounts,
                            templateStatusFlags
                        }}
                        handler={{
                            setUploadTemplateList,
                            setTemplateUploadCounts,
                            setTemplateStatusFlags
                        }}
                    ></PreviewValidateSearch>
                        : <PreviewValidateImport
                            data={{
                                uploadTemplateList, templateUploadCounts, templateStatusFlags
                            }}
                            handler={{
                                setUploadTemplateList, setTemplateUploadCounts, setTemplateStatusFlags
                            }}
                        ></PreviewValidateImport>
                }
            </div>
        </>
    )
}
export default PreviewValidate;