import DynamicTable from '../../common/table/DynamicTable';

const AgentTable = (props) => {
    return (
        <DynamicTable
            listKey={props.data.listKey}
            row={props.data.row}
            rowCount={props.data.rowCount}
            header={props.data.header}
            itemsPerPage={props.data.itemsPerPage}
            // backendPaging={true}
            // backendCurrentPage={firstTabCurrentPage}
            url={props.data.url}
            method= {props.data.method}
            listSearch= {props.data.requestBody}
            exportBtn={props.data.exportBtn}
            handler={{
                handleExportButton: props.data.handleExportButton,
                handleCellRender: props.data.handleCellRender,
                handlePageSelect: props.data.handleSecondTabPageSelect,
                handleItemPerPage: props.data.setSecondTabPerPage,
                handleCurrentPage: props.data.setSecondTabCurrentPage
            }
            }
        />
    )
}
export default AgentTable