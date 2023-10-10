import moment from "moment"
import DynamicTable from "../../../../common/table/DynamicTable"
import { ChildTicketTemplateColumns } from '../PreviewAndValidate/BulkUploadColumns'

const PreviewDelete = (props) => {


    const { deleteChildTicketIdList } = props?.data


    const handleCellRender = (cell, row) => {
        if (["Created Date"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD-MM-YYYY') : '-'}</span>)
        }
        return (<span>{cell.value}</span>)
    }

    return (
        <>
            <div className="col-12 mb-3">
                <div className="mb-2">
                    <div className="row">
                        <div className="col-12 text-sm-center form-inline">
                            <div className="form-group mr-2">
                            </div>
                            <div className="col-12 text-center">
                                <p className="text-center font-22">{deleteChildTicketIdList?.length} Rows of Records Found </p>
                            </div>
                        </div>
                    </div>
                    {deleteChildTicketIdList && deleteChildTicketIdList.length > 0 && <div className="card p-1">
                        <DynamicTable
                            row={deleteChildTicketIdList}
                            itemsPerPage={10}
                            header={ChildTicketTemplateColumns}
                            handler={{
                                handleCellRender: handleCellRender,
                            }}
                        />
                    </div>}
                </div>
            </div>
        </>
    )
}
export default PreviewDelete