import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import { formFilterObject, RegularModalCustomStyles } from '../../common/util/util';
import DynamicTable from '../../common/table/DynamicTable';
import { post } from '../../common/util/restUtil';
import { properties } from '../../properties';

import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment'
import { toast } from 'react-toastify';

const AccountDetailsHistory = (props) => {

    const { isAccountDetailsHistoryOpen, accountData } = props.data;
    const { setIsAccountDetailsHistoryOpen } = props.handlers;

    const [accountDetailsList, setAccountDetailsList] = useState([]);
    const [accountAddressList, setAccountAddressList] = useState([]);
    const [accountPropertyList, setAccountPropertyList] = useState([]);

    const [exportBtn, setExportBtn] = useState(true);
    const hasExternalSearch = useRef(false);
    const [listSearch, setListSearch] = useState([]);

    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([])
    const isTableFirstRender = useRef(true);

    const [totalCountAddress, setTotalCountAddress] = useState(0);
    const [perPageAddress, setPerPageAddress] = useState(10);
    const [currentPageAddress, setCurrentPageAddress] = useState(0);
    const [filtersAddress, setFiltersAddress] = useState([])
    const isTableFirstRenderAddress = useRef(true);

    const [totalCountProperty, setTotalCountProperty] = useState(0);
    const [perPageProperty, setPerPageProperty] = useState(10);
    const [currentPageProperty, setCurrentPageProperty] = useState(0);
    const [filtersProperty, setFiltersProperty] = useState([])
    const isTableFirstRenderProperty = useRef(true);


    useEffect(() => {
        getAccountHistoryData("details")
    },[currentPage, perPage])

    useEffect(() => {
        getAccountHistoryData("address")
    },[currentPageAddress, perPageAddress])

    useEffect(() => {
        getAccountHistoryData("property")
    },[currentPageProperty, perPageProperty])

    const getAccountHistoryData = (type) => {
        
        const { accountId } = accountData;
        const requestBody = {
            accountId
        }
        if(type === "details")
        {
            requestBody.filters = formFilterObject(filters)
        }
        else if(type === "address")
        {
            requestBody.filters =  formFilterObject(filtersAddress)
        }
        else if(type === "property")
        {
            requestBody.filters = formFilterObject(filtersProperty)
        }
        setListSearch(requestBody);
        post(`${properties.CUSTOMER_DETAILS}/account/${type === "details" ? 'details' : type === "address" ? 'address' : type === "property" ? 'property' : '' }/history?limit=${type === "details" ? perPage : type === "address" ? perPageAddress : type === "property" ? perPageProperty : 10 }&page=${type === "details" ? currentPage : type === "address" ? currentPageAddress : type === "property" ? currentPageProperty : 0 }`, requestBody)
            .then((response) => {
                if (response.data) {
                    const { count, rows } = response.data;
                    let acDetails = [];
                    let acAddress = [];
                    let acProperty = [];
                    if(count > 0)
                    {
                        rows?.forEach((data) => {
                            const { email, title, lastName, firstName, contactNo, updatedAt, modifiedBy, hno, buildingName, street, city, district, state, zip, country, property_1, property_2, property_3 } = data;
                            if(type === "details")
                            {
                                acDetails.push({
                                    email,
                                    title,
                                    firstName,
                                    lastName,
                                    contactNo,
                                    updatedAt: moment(updatedAt).format('DD-MMM-YYYY hh:mm:ss A'),
                                    modifiedBy: `${modifiedBy?.firstName} ${modifiedBy.lastName}`
                                })
                            }
                            if(type === "address")
                            {
                                acAddress.push({
                                    flatHouseUnitNo: hno,
                                    building: buildingName,
                                    street,
                                    cityTown: city,
                                    district,
                                    state,
                                    postCode: zip,
                                    country,
                                    updatedAt: moment(updatedAt).format('DD-MMM-YYYY hh:mm:ss A'),
                                    modifiedBy: `${modifiedBy?.firstName} ${modifiedBy.lastName}`
                                })
                            }
                            if(type === "property")
                            {
                                acProperty.push({
                                    property_1,
                                    property_2,
                                    property_3,
                                    updatedAt: moment(updatedAt).format('DD-MM-YYYY hh:mm:ss A'),
                                    modifiedBy: `${modifiedBy?.firstName} ${modifiedBy.lastName}`
                                })
                            }
                        });
                        unstable_batchedUpdates(() => {
                            if(type === "details")
                            {
                                setTotalCount(count)
                                setAccountDetailsList(acDetails);
                            }
                            if(type === "address")
                            {
                                setTotalCountAddress(count)
                                setAccountAddressList(acAddress);
                            }
                            if(type === "property")
                            {
                                setTotalCountProperty(count)
                                setAccountPropertyList(acProperty);
                            }
                        })
                    }
                    else if(filters.length > 0 || filtersAddress.length > 0 || filtersProperty.length > 0)
                    {
                        toast.error("No Records Found")
                    }
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handlePageSelectAddress = (pageNo) => {
        setCurrentPageAddress(pageNo)
    }

    const handlePageSelectProperty = (pageNo) => {
        setCurrentPageProperty(pageNo)
    }

    const handleCellRender = (cell, row) => {
        return (<span>{cell.value}</span>)
    }

    return (
        <Modal isOpen={isAccountDetailsHistoryOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header p-1">
                        <h4 className="modal-title">Account History</h4>
                        <button type="button" className="close" onClick={() => setIsAccountDetailsHistoryOpen(false)}>×</button>
                    </div>
                    <div className="modal-body">
                        <ul className="nav nav-tabs">
                            <li className="nav-item ">
                                <a href="#accountDetails" data-toggle="tab" aria-expanded="false" className="nav-link active">
                                    Account Details
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#accountAddress" data-toggle="tab" aria-expanded="true" className="nav-link">
                                    Account Address
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#accountProperty" data-toggle="tab" aria-expanded="false" className="nav-link">
                                    Account Property
                                </a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane active" id="accountDetails">
                                {
                                    !!accountDetailsList.length ?
                                        <DynamicTable
                                            listSearch={listSearch}
                                            listKey={"Account Details History"}
                                            row={accountDetailsList}
                                            rowCount={totalCount}
                                            header={AccountDetailsColumns}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            exportBtn={exportBtn}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,
                                                handleExportButton: setExportBtn
                                            }}
                                        />
                                        :
                                        <p class="skel-widget-warning">No records found!!!</p>
                                }
                            </div>
                            <div className="tab-pane" id="accountAddress">
                                {
                                    !!accountAddressList.length ?
                                        <DynamicTable
                                            listSearch={listSearch}
                                            listKey={"Account Address History"}
                                            row={accountAddressList}
                                            rowCount={totalCountAddress}
                                            header={AccountAddressColumns}
                                            itemsPerPage={perPageAddress}
                                            backendPaging={true}
                                            backendCurrentPage={currentPageAddress}
                                            isTableFirstRender={isTableFirstRenderAddress}
                                            hasExternalSearch={hasExternalSearch}
                                            exportBtn={exportBtn}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelectAddress,
                                                handleItemPerPage: setPerPageAddress,
                                                handleCurrentPage: setCurrentPageAddress,
                                                handleFilters: setFiltersAddress,
                                                handleExportButton: setExportBtn
                                            }}
                                        />
                                        :
                                        <p class="skel-widget-warning">No records found!!!</p>
                                }
                            </div>
                            <div className="tab-pane" id="accountProperty">
                                {
                                    !!accountPropertyList.length ?
                                        <DynamicTable
                                            listSearch={listSearch}
                                            listKey={"Account Property History"}
                                            row={accountPropertyList}
                                            rowCount={totalCountProperty}
                                            header={AccountPropertyColumns}
                                            itemsPerPage={perPageProperty}
                                            backendPaging={true}
                                            backendCurrentPage={currentPageProperty}
                                            isTableFirstRender={isTableFirstRenderProperty}
                                            hasExternalSearch={hasExternalSearch}
                                            exportBtn={exportBtn}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelectProperty,
                                                handleItemPerPage: setPerPageProperty,
                                                handleCurrentPage: setCurrentPageProperty,
                                                handleFilters: setFiltersProperty,
                                                handleExportButton: setExportBtn
                                            }}
                                        />
                                        :
                                        <p class="skel-widget-warning">No records found!!!</p>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default AccountDetailsHistory;

const AccountDetailsColumns = [
    {
        Header: "Email",
        accessor: "email",
        disableFilters: false,
        id: "email"
    },
    {
        Header: "Title",
        accessor: "title",
        disableFilters: false,
        id: "title"
    },
    {
        Header: "First Name",
        accessor: "firstName",
        disableFilters: false,
        id: "firstName"
    },
    {
        Header: "Last Name",
        accessor: "lastName",
        disableFilters: false,
        id: "lastName"
    },
    {
        Header: "Contact Number",
        accessor: "contactNo",
        disableFilters: false,
        id: "contactNo"
    },
    {
        Header: "Modified Date Time",
        accessor: "updatedAt",
        disableFilters: true,
    },
    {
        Header: "Modified By",
        accessor: "modifiedBy",
        disableFilters: false,
        id: "modifiedBy"
    }
]

const AccountAddressColumns = [
    {
        Header: "Flat/House/Unit No",
        accessor: "flatHouseUnitNo",
        disableFilters: false,
        id: 'hno'
    },
    {
        Header: "Building Name/Others",
        accessor: "building",
        disableFilters: false,
        id: 'buildingName'
    },
    {
        Header: "Street/Area",
        accessor: "street",
        disableFilters: false,
        id: 'street'
    },
    {
        Header: "City/Town",
        accessor: "cityTown",
        disableFilters: false,
        id: 'city'
    },
    {
        Header: "District/Province",
        accessor: "district",
        disableFilters: false,
        id: 'district'
    },
    {
        Header: "State/Region",
        accessor: "state",
        disableFilters: false,
        id: 'state'
    },
    {
        Header: "ZIP",
        accessor: "postCode",
        disableFilters: false,
        id: 'zip'
    },
    {
        Header: "Country",
        accessor: "country",
        disableFilters: false,
        id: 'country'
    },
    {
        Header: "Modified Date Time",
        accessor: "updatedAt",
        disableFilters: true,
    },
    {
        Header: "Modified By",
        accessor: "modifiedBy",
        disableFilters: false,
        id: "modifiedBy"
    }
]

const AccountPropertyColumns = [
    {
        Header: "Account Property 1",
        accessor: "property_1",
        disableFilters: false,
        id: "property1"
    },
    {
        Header: "Account Property 2",
        accessor: "property_2",
        disableFilters: false,
        id: "property2"
    },
    {
        Header: "Account Property 3",
        accessor: "property_3",
        disableFilters: false,
        id: "property3"
    },
    {
        Header: "Modified Date Time",
        accessor: "updatedAt",
        disableFilters: true,
    },
    {
        Header: "Modified by",
        accessor: "modifiedBy",
        disableFilters: false,
        id: "modifiedBy"
    }
]
