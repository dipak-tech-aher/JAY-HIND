import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import moment from 'moment';
import DynamicTable from '../../common/table/DynamicTable';
import {
    CustomerContractTemplateColumns, BillingContractTemplateColumns, ProductTemplateColumns, IncidentTemplateColumns, UserColumns, RequestStatementColumns,
    ProfileTemplateColumns, ServiceTemplateColumns, InteractionTemplateColumns, ChargeTemplateColumns, OrderTemplateColumns,CalenderTemplateColumns,
    CustomerTemplateColumns, SalesOrderTemplateColumns, EntityTransactionMappingTemplateColumns, BusinessUnitsTemplateColumns,SkillTemplateColumns,HolidayCalenderTemplateColumns
} from './BulkUploadColumns';
import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';


const customStyles = {
    content: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '70%',
    }
};

const SearchExcelViewUploadDataModal = (props) => {
    const { isOpen, row } = props.data;
    const { setIsOpen } = props.handlers;
    const { bulkUploadType, payload } = row;
    const [totalCount, setTotalCount] = useState(0);
    const [tableRowData, setTableRowData] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [listSearch, setListSearch] = useState([]);

    useEffect(() => {
        let requestBody = {
            bulkuploadId: props?.data?.row?.bulkUploadId,
            type: props?.data?.row?.uploadTableName,
        }
        post(`${properties.BULK_UPLOAD_API}/details?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((response) => {
                const { status, data } = response;
                if (status === 200) {

                    setTotalCount(data.count)
                    setTableRowData(data.rows);
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [perPage, currentPage])
    const handleCellRender = (cell, row) => {
        if (["Bill Date", "Due Date", "Paid Date"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>)
        }
        return (<span>{cell.value}</span>)
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }
    return (
        <Modal isOpen={isOpen} contentLabel="Worflow History Modal" style={customStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Uploaded Data</h4>
                        <button type="button" className="close" onClick={() => setIsOpen(!isOpen)}>×</button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="modal-body overflow-auto cus-srch">
                                {tableRowData && props?.data?.row?.uploadTableName === 'CUSTOMER' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={CustomerTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'USERS' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={UserColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'CHARGE' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={ChargeTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'REQUEST_STATEMENT' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={RequestStatementColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'PROFILE' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={ProfileTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'PRODUCT' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={ProductTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'INTERACTION' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={InteractionTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'ORDER' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={OrderTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'SERVICE' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={ServiceTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.bulkUploadType === 'CUSTOMER CONTRACT' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={CustomerContractTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}

                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.bulkUploadType === 'BILLING CONTRACT' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={BillingContractTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}

                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.bulkUploadType === 'SALES_ORDER' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={SalesOrderTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}

                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'ENTITY_TRANSACTION_MAPPING' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={EntityTransactionMappingTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}

                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'BUSINESS_UNITS' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={BusinessUnitsTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}

                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'CALENDAR' &&
                                <div className="card">
                                    <DynamicTable
                                        listKey={"Bulk Upload Search"}
                                        listSearch={listSearch}
                                        row={tableRowData}
                                        header={CalenderTemplateColumns}
                                        rowCount={totalCount}
                                        itemsPerPage={perPage}
                                        backendPaging={true}
                                        backendCurrentPage={currentPage}
                                        isTableFirstRender={isTableFirstRender}
                                        hasExternalSearch={hasExternalSearch}
                                        handler={{
                                            handleCellRender: handleCellRender,
                                            handlePageSelect: handlePageSelect,
                                            handleItemPerPage: setPerPage,
                                            handleCurrentPage: setCurrentPage,
                                            handleFilters: setFilters,

                                        }}
                                    />
                                </div>
                            }
                                {tableRowData && props?.data?.row?.uploadTableName === 'SKILL' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={SkillTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                                {tableRowData && props?.data?.row?.uploadTableName === 'HOLIDAY_CALENDAR' &&
                                    <div className="card">
                                        <DynamicTable
                                            listKey={"Bulk Upload Search"}
                                            listSearch={listSearch}
                                            row={tableRowData}
                                            header={HolidayCalenderTemplateColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,

                                            }}
                                        />
                                    </div>
                                }
                            </div>
                            <br></br>
                            <div className="row pt-4">
                                <button className="btn btn-secondary btn-sm " type="button" data-dismiss="modal" onClick={() => setIsOpen(!isOpen)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default SearchExcelViewUploadDataModal;