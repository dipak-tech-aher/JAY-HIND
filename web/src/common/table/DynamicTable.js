/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useMemo, useEffect } from 'react';
import { useTable, useSortBy, useFilters } from 'react-table';
import { unstable_batchedUpdates } from 'react-dom';
import ReactPaginate from 'react-paginate';
import { ColumnFilter } from './columnFilter';
import ExportExcelFile from "../excelUtils/ExportExcelFile"
import './table.css';
import { formatISODateDDMMMYY } from '../util/dateUtil';
import { Dropdown, Form } from 'react-bootstrap';

const DynamicTable = (props) => {
    // console.log("hii  from DynamicTable")
    // console.log(props, 'from dynamic table')
    const fixedHeader = props.fixedHeader;
    const backendPaging = props.backendPaging
    const columnFilter = props.columnFilter
    const hideFooter = props.hideFooter;
    const handlePageSelect = props.handler.handlePageSelect
    const handleItemPerPage = props.handler.handleItemPerPage
    const handleCurrentPage = props.handler.handleCurrentPage

    const customButtons = props.customButtons;
    const bulkUpload = props.bulkUpload;
    const handleFilters = props.handler.handleFilters
    const handleExportButton = props.handler.handleExportButton
    const listKey = props.listKey !== undefined ? props.listKey : "NA"
    const listSearch = props.listSearch !== undefined ? props.listSearch : "NA"
    const listSelectedTab = props.listSelectedTab !== undefined ? props.listSelectedTab : "NA"

    let { row, rowCount, header, itemsPerPage, customClassName, backendCurrentPage, isTableFirstRender, hasExternalSearch, exportBtn, hiddenColumns = [], filterRequired = true, selectedRow = null, url, method, isScroll = true } = props

    header = header.map((x, idx) => ({ ...x, index: idx }));

    const [showFilter, setShowFilter] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([...header]);
    const showFilterVisible = () => setShowFilter(!showFilter)

    const handleClear = (event) => {
        event.preventDefault();
        setSelectedColumns([...header]);
        setShowFilter(false);
    }

    const fileName = "" + listKey.replaceAll(/ /g, "_") + "_" + formatISODateDDMMMYY(Date().toLocaleString()); // filename of the excel file

    const [currentPage, setCurrentPage] = useState(0);
    const [PER_PAGE, setPER_PAGE] = useState(itemsPerPage)

    let offset = currentPage * PER_PAGE;

    const data = useMemo(() => {
        return row?.slice(offset, offset + PER_PAGE)
    }, [offset, PER_PAGE, row])

    let pagecount = Math.ceil(row?.length / PER_PAGE);

    const defaultColumn = useMemo(() => {
        return {
            Filter: ColumnFilter
        }
    }, [])

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state,
        setAllFilters
    } = useTable({
        columns: selectedColumns,
        data: data,
        defaultColumn,
        manualFilters: backendPaging,
        initialState: {
            hiddenColumns: hiddenColumns
        }
    }, useFilters, useSortBy)

    const { filters } = state;

    if (backendPaging && isTableFirstRender) {

        if (hasExternalSearch) {
            useEffect(() => {
                if (isTableFirstRender.current && hasExternalSearch.current) {
                    setAllFilters([])
                }
                else {
                    hasExternalSearch.current = true
                }
            }, [isTableFirstRender.current])
        }


        useEffect(() => {
            if (!isTableFirstRender.current) {
                unstable_batchedUpdates(() => {
                    handleCurrentPage((backendCurrentPage) => {
                        if (backendCurrentPage === 0) {
                            return '0';
                        }
                        return 0;
                    });
                    handleFilters(filters);
                })
            }
            else {
                isTableFirstRender.current = false;
            }

        }, [filters])
    }

    const handlePageSizeChange = (e) => {
        unstable_batchedUpdates(() => {
            setPER_PAGE(Number(e.target.value));
            setCurrentPage(0);
            if (backendPaging) {
                handleItemPerPage(Number(e.target.value));
                handleCurrentPage(0);
            }
        })
    }
    return (
        <div >
            <React.Fragment>
                <div className='skel-cust-role-btn mb-2'>
                    {bulkUpload && (bulkUpload)}
                    {exportBtn && (
                        <ExportExcelFile
                            fileName={fileName} listSelectedTab={listSelectedTab}
                            listKey={listKey} listSearch={listSearch} filters={filters}
                            handleExportButton={handleExportButton} header={selectedColumns}
                            url={url} method={method}
                        />
                    )}
                    {customButtons && (customButtons)}
                    {columnFilter && (
                        <Dropdown  className="skel-filter-dropdown" show={showFilter} onToggle={showFilterVisible}>
                            <Dropdown.Toggle variant="success" onClick={showFilterVisible}>
                                Column filters
                            </Dropdown.Toggle>
                            <Dropdown.Menu  className="skel-ul-data-filter">
                                <Form className="mt-1 filter-form">
                                    <div className="form-group">
                                        {header?.map((column, index) => (
                                            <div key={column.Header} className={`custom-control col-filter custom-checkbox`}>
                                                <input type="checkbox" id={column.Header} name={column.Header}
                                                    className="custom-control-input"
                                                    style={{ cursor: "pointer" }}
                                                    checked={selectedColumns.find(x => x.Header === column.Header) ? true : false}
                                                    onChange={(e) => {
                                                        let columnIndex = header.findIndex(x => x.Header === e.target.id);
                                                        let selectedColumnss = selectedColumns;
                                                        if (e.target.checked) {
                                                            selectedColumnss.push(header[columnIndex]);
                                                        } else {
                                                            selectedColumnss = selectedColumnss.filter(x => x.Header !== e.target.id);
                                                        }
                                                        selectedColumnss.sort((a, b) => {
                                                            return a.index - b.index;
                                                        });
                                                        console.log(selectedColumnss);
                                                        setSelectedColumns([...selectedColumnss])
                                                    }}
                                                />
                                                <label className="custom-control-label" htmlFor={column.Header}>{column.Header}</label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="form-group text-center">
                                        <button type='button' className="skel-btn-cancel" onClick={handleClear}>
                                            Clear
                                        </button>
                                    </div>
                                </Form>
                            </Dropdown.Menu>
                        </Dropdown>
                    )}
                </div>
            </React.Fragment>
            <div className={`${isScroll && "data-scroll1"}`} style={isScroll ? { width: "100%", maxHeight: "580px", overflowY: "auto", whiteSpace: "nowrap" } : {}}>
                <table {...getTableProps()}
                    className={`table ${customClassName ? customClassName : ''} table-responsive table-striped dt-responsive nowrap w-100 skel-cust-table-dyn`}
                    style={{ textAlign: "center", marginLeft: "0px" }}>

                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()} >
                                {headerGroup.headers.map((column, idx) => (
                                    <th key={idx} {...column.getHeaderProps(/*column.getSortByToggleProps(){
                                    onClick : () => handleClick()
                                    }*/)}>
                                        <div className='skel-dyn-header-label'>
                                            <span>{column.render('Header')}</span>
                                            {filterRequired && column.canFilter && <span className='skel-table-filter-dynamic'>
                                                {(column.canFilter && filterRequired) ? column.render('Filter') : null}
                                                {/* {column.isSorted ? (column.isSortedDesc ? '' : '') : ''} */}
                                            </span>}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows?.length ? rows.map((row, idx) => {
                            prepareRow(row)
                            return (
                                <tr key={idx}  {...row.getRowProps()} className={selectedRow === row?.index ? "row-act" : ""} style={{ whiteSpace: "pre-wrap" }}>
                                    {

                                        row.cells.map((cell, idx) => {
                                            return (
                                                <td key={idx}>
                                                    {cell.render(props.handler.handleCellRender(cell, row))}
                                                </td>
                                            )
                                        })
                                    }
                                </tr>
                            )
                        }) : (
                            <tr><td colSpan={selectedColumns?.length} className='text-center'>No records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={`table-footer-info ${hideFooter ? 'd-none' : ''}`}>

                {
                    (backendPaging) ?
                        <>
                            <div className="select-cus">
                                <select value={PER_PAGE}
                                    onChange={handlePageSizeChange}
                                    className="custom-select custom-select-sm ml-1" >
                                    {
                                        [10, 20, 30, 40, 50].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                {pageSize} Rows
                                            </option>
                                        ))
                                    }
                                </select>
                                <span className="ml-1">per Page</span>
                            </div>
                            <div className="tbl-pagination">
                                <ReactPaginate
                                    previousLabel={"←"}
                                    nextLabel={"→"}
                                    pageCount={((rowCount !== undefined && !isNaN(rowCount) && !isNaN(PER_PAGE)) ? Math.ceil(rowCount / PER_PAGE) : 0)}
                                    onPageChange={({ selected: selectedPage }) => {
                                        handlePageSelect(selectedPage)
                                    }}
                                    forcePage={Number(backendCurrentPage)}
                                    containerClassName={"pagination"}
                                    previousLinkClassName={"pagination__link"}
                                    nextLinkClassName={"pagination__link"}
                                    disabledClassName={"pagination__link--disabled"}
                                    activeClassName={"pagination__link--active"}
                                />
                            </div>
                        </>
                        :
                        <>
                            <div className="select-cus">
                                <select value={PER_PAGE}
                                    onChange={handlePageSizeChange}
                                    className="custom-select custom-select-sm ml-1" >
                                    {
                                        [10, 20, 30, 40, 50].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                {pageSize} Rows
                                            </option>
                                        ))
                                    }
                                </select>
                                <span className="ml-1">per Page</span>
                            </div>
                            <div className="tbl-pagination">
                                <ReactPaginate
                                    previousLabel={"←"}
                                    nextLabel={"→"}
                                    pageCount={pagecount}
                                    forcePage={currentPage}
                                    onPageChange={({ selected: selectedPage }) => {
                                        setCurrentPage(selectedPage)
                                    }}
                                    containerClassName={"pagination"}
                                    previousLinkClassName={"pagination__link"}
                                    nextLinkClassName={"pagination__link"}
                                    disabledClassName={"pagination__link--disabled"}
                                    activeClassName={"pagination__link--active"}
                                />
                            </div>
                        </>
                }

            </div>
        </div >
    );
}

export default DynamicTable;