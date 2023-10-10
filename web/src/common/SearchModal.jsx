import React, { useContext, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { RegularModalCustomStyles } from '../common/util/util';
import DynamicTable from './table/DynamicTable';
import { history } from './util/history';
import ReactSwitch from "react-switch";
import { unstable_batchedUpdates } from 'react-dom';
import { NumberFormatBase } from "react-number-format";
import { AppContext } from '../AppContext';
import { post } from './util/restUtil';
import { properties } from '../properties';

Modal.setAppElement('#root')

const SearchModal = (props) => {
    const { auth } = useContext(AppContext)
    const { data: { appsConfig } } = props;
    const OTHERS_INTERACTION = "Interaction For Others"
    const { dataError, isOpen, searchInput, tableRowData, tableHeaderColumns: tableHeaderColumnsProps, tableHiddenColumns, currentPage, totalCount, perPage, isTableFirstRender, hasExternalSearch } = props.data;
    const { setDataError, setIsOpen, setSearchInput, setSearchData, handleSearch } = props.modalStateHandlers;
    const { handleCellRender, handleCellLinkClick, handleCurrentPage, handlePageSelect, handleItemPerPage, handleFilters, handleSubmit } = props.tableStateHandlers;
    const [suggestion, setSuggestion] = useState(false)
    const [anonymous, setAnonymous] = useState(false)
    const [forSelf, setForSelf] = useState(false)
    const handleOnModelClose = () => {
        setIsOpen(false);
        setSearchData([]);
        setSearchInput("");
        setSuggestion(false)
        setDataError({})
    }

    const [tableHeaderColumns, setTableHeaderColumns] = useState([])

    useEffect(() => {
        setTableHeaderColumns(tableHeaderColumnsProps?.map(x => {
            if (["customerUuid", "customerNo", "customerName", "customerServiceStatus"].includes(x.id)) {
                if (appsConfig && appsConfig.clientFacingName && appsConfig?.clientFacingName?.customer) {
                    x.Header = x.Header?.replace('Customer', appsConfig?.clientFacingName?.customer ?? 'Customer');
                }
            }
            return x;
        }))
    }, [props])

    useEffect(() => {
        if (searchInput !== "") {
            if (tableRowData.length === 0) {
                setSuggestion(true)
            }
            else {
                setSuggestion(false)
            }
        }
    }, [tableRowData])

    useEffect(() => {
        unstable_batchedUpdates(() => {
            setSearchInput({
                customerName: "",
                customerNo: "",
                mobileNo: "",
                emailId: ""
            })
            setDataError({})
            setSearchData([]);
            setSuggestion(false)
        })
    }, [anonymous])

    const hasOtherInteractionPermission = () => {
        let permissions = auth?.permissions ?? [];
        let interactionPermissions;
        for (let index = 0; index < permissions.length; index++) {
            if (permissions[index]['Interaction']) {
                interactionPermissions = permissions[index]['Interaction'];
                break;
            }
        }
        return interactionPermissions?.find(x => x.screenName === OTHERS_INTERACTION)?.accessType === "allow";
    }

    useEffect(() => {
        if (forSelf) {
            post(`${properties.CUSTOMER_API}/get-customer?limit=1&page=0`, { emailId: auth?.user?.email }).then((resp) => {
                if (resp?.data) {
                    console.log(resp?.data);
                    handleCellLinkClick("", resp?.data?.rows?.[0], "");
                }
            }).catch((error) => {
                console.error(error);
            }).finally(() => setForSelf(false));
        }
    }, [forSelf])

    return (
        <Modal isOpen={isOpen} contentLabel="Search Modal" style={RegularModalCustomStyles}>
            <div className="">
                <div className="modal-content">
                    <div className="modal-header px-4 border-bottom-0">
                        <h4 className="modal-title">Create Information</h4>
                        <button type="button" className="close" onClick={handleOnModelClose}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body px-4">
                        <form className="needs-validation p-2" name="event-form" id="form-event">
                            <div className="">
                                {appsConfig?.clientConfig?.interaction?.for_register_unregister && (
                                    <div className="row mb-0 toggle-switch pl-2">
                                        <label className={`mr-1 mb-0 ${anonymous ? 'd-none' : ''}`}>Registered</label>
                                        <ReactSwitch
                                            onColor="#4C5A81"
                                            offColor="#6c757d"
                                            activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                            height={20}
                                            width={48}
                                            className="inter-toggle skel-inter-toggle" id="anonymous" checked={anonymous}
                                            onChange={(e) => { setAnonymous(!anonymous) }}
                                        />
                                        <label className={`mr-1 mb-0 ${anonymous ? '' : 'd-none'}`}>Unregistered</label>
                                    </div>
                                )}

                                {hasOtherInteractionPermission() && (
                                    <div className="row mb-0 toggle-switch pl-2">
                                        <label className={`mr-1 mb-0 ${forSelf ? 'd-none' : ''}`}>Others</label>
                                        <ReactSwitch
                                            onColor="#4C5A81"
                                            offColor="#6c757d"
                                            activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                            height={20}
                                            width={48}
                                            className="inter-toggle skel-inter-toggle" id="forSelf" checked={forSelf}
                                            onChange={(e) => { setForSelf(!forSelf) }}
                                        />
                                        <label className={`mr-1 mb-0 pl-1 ${forSelf ? '' : 'd-none'}`}>Self</label>
                                    </div>
                                )}

                                {anonymous &&
                                    <span className='skel-heading mt-3'>Kindly provide few of your details</span>
                                }
                                <div className="row skel-active-new-user-field mt-2">

                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="customerName" className="control-label">{appsConfig?.clientFacingName?.customer ?? "Customer"} Name<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" className="form-control" autoComplete="off"
                                                onChange={(e) => { setSearchInput({ ...searchInput, customerName: e.target.value }); setSuggestion(false) }}
                                                value={searchInput?.customerName}                                                
                                            />
                                            <span className="errormsg">{dataError.customerName ? dataError.customerName : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="cntnumber" className="control-label">Contact No.<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <NumberFormatBase className="form-control" autoComplete="off" placeholder="1234567"
                                                onChange={(e) => { setSearchInput({ ...searchInput, mobileNo: e.target.value }); setSuggestion(false) }}
                                                value={searchInput?.mobileNo}                                                
                                            />
                                            <span className="errormsg">{dataError.mobileNo ? dataError.mobileNo : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="emailId" className="control-label">Email ID<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="email" className="form-control" placeholder="abc@mail.com" autoComplete="off"
                                                onChange={(e) => { setSearchInput({ ...searchInput, emailId: e.target.value }); setSuggestion(false) }}
                                                value={searchInput?.emailId}
                                            />
                                            <span className="errormsg">{dataError.emailId ? dataError.emailId : ""}</span>

                                        </div>
                                    </div>
                                    {
                                        !anonymous ?
                                            <>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="customerName" className="control-label">{appsConfig?.clientFacingName?.customer ?? "Customer"} No.<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                        <input type="text" className="form-control" autoComplete="off"
                                                            onChange={(e) => { setSearchInput({ ...searchInput, customerNo: e.target.value }); setSuggestion(false) }}
                                                            value={searchInput?.customerNo}                                                            
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <button type="button" className="skel-btn-submit" onClick={handleSearch}>
                                                            Search
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                            :
                                            <>                                   
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <button type="button" onClick={handleSubmit} className="skel-btn-submit">
                                                            Submit
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                    }

                                </div>

                                {!anonymous ?
                                    !!tableRowData.length ?
                                        <div className="">
                                            <DynamicTable
                                                row={tableRowData}
                                                rowCount={totalCount}
                                                header={tableHeaderColumns}
                                                itemsPerPage={perPage}
                                                hiddenColumns={tableHiddenColumns}
                                                backendPaging={true}
                                                backendCurrentPage={currentPage}
                                                isTableFirstRender={isTableFirstRender}
                                                hasExternalSearch={hasExternalSearch}
                                                handler={{
                                                    handleCellRender: handleCellRender,
                                                    handleLinkClick: handleCellLinkClick,
                                                    handlePageSelect,
                                                    handleItemPerPage,
                                                    handleCurrentPage,
                                                    handleFilters
                                                }}
                                            />
                                        </div>
                                        :
                                        suggestion === true
                                            ?
                                            <p className='skel-widget-warning'>No Records Found!!!</p>
                                            :
                                            <></>
                                    : <></>
                                }
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default SearchModal;