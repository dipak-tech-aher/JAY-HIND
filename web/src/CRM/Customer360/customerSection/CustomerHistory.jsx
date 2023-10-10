import React, { useContext, useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { formFilterObject, RegularModalCustomStyles } from '../../../common/util/util';
import DynamicTable from '../../../common/table/DynamicTable';
import { post } from '../../../common/util/restUtil';
import { properties } from '../../../properties';
import { AppContext } from "../../AppContext";
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment'
import { toast } from 'react-toastify';

const CustomerHistory = (props) => {
    let { appConfig } = useContext(AppContext);

    const { isOpen, customerData } = props.data;
    const { setIsOpen } = props.handler;

    const hasExternalSearch = useRef(false);
    const [listSearch, setListSearch] = useState([]);
    const [customerDetailsList, setCustomerDetailsList] = useState([]);
    const [customerAddressList, setCustomerAddressList] = useState([]);
    const [customerPropertyList, setCustomerPropertyList] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)

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
        getCustomerHistoryData("details")
    },[currentPage, perPage])

    useEffect(() => {
        getCustomerHistoryData("address")
    },[currentPageAddress, perPageAddress])

    useEffect(() => {
        getCustomerHistoryData("property")
    },[currentPageProperty, perPageProperty])

    const getCustomerHistoryData = (type) => {
        
        const { customerId } = customerData;
        const requestBody = {
            customerId,
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
        post(`${properties.CUSTOMER_API}/${type === "details" ? 'details' : type === "address" ? 'address' : type === "property" ? 'property' : '' }/history?limit=${type === "details" ? perPage : type === "address" ? perPageAddress : type === "property" ? perPageProperty : 10 }&page=${type === "details" ? currentPage : type === "address" ? currentPageAddress : type === "property" ? currentPageProperty : 0 }`, requestBody)
            .then((response) => {
                if (response.data) {
                    const { count, rows } = response.data;
                    if(!!rows.length)
                    {
                        let customerDetails = [];
                        let customerAddress = [];
                        let customerProperty = [];
                        rows?.forEach((data) => {
                            const { email, contactType, idType, idValue, idTypeDesc, contactTypeDesc, contactNo, updatedAt, modifiedBy, hno, buildingName, street, city, district, state, zip, country, property_1, property_2, property_3 } = data;
                            if(type === "details")
                            {
                                customerDetails.push({
                                    idType : idTypeDesc?.description,
                                    idValue,
                                    email,
                                    contactType : contactTypeDesc?.description,
                                    contactNo,
                                    updatedAt : moment(updatedAt).format('DD-MM-YYYY hh:mm:ss A'),
                                    modifiedBy: `${modifiedBy?.firstName} ${modifiedBy.lastName}`
                                })
                            }
                            if(type === "address")
                            {
                                customerAddress.push({
                                    flatHouseUnitNo: hno,
                                    building: buildingName,
                                    street,
                                    cityTown: city,
                                    district,
                                    districtDesc: data?.districtDesc,
                                    state,
                                    stateDesc: data?.stateDesc,
                                    postCode: zip,
                                    zipDesc: data?.zipDesc,
                                    country,
                                    countryDesc: data?.countryDesc,
                                    updatedAt : moment(updatedAt).format('DD-MM-YYYY hh:mm:ss A'),
                                    modifiedBy: `${modifiedBy?.firstName || ""} ${modifiedBy?.lastName || ""}`
                                })
                            }
                            if(type === "property")
                            {
                                customerProperty.push({
                                    property_1,
                                    property_2,
                                    property_3,
                                    updatedAt : moment(updatedAt).format('DD-MM-YYYY hh:mm:ss A'),
                                    modifiedBy: `${modifiedBy?.firstName} ${modifiedBy.lastName}`
                                })
                            }
                        });
                        unstable_batchedUpdates(() => {
                            if(type === "details")
                            {
                                setTotalCount(count)
                                setCustomerDetailsList(customerDetails);
                            }
                            if(type === "address")
                            {
                                console.log("Customer Address : ", customerAddress)
                                setTotalCountAddress(count)
                                setCustomerAddressList(customerAddress);
                            }
                            if(type === "property")
                            {
                                setTotalCountProperty(count)
                                setCustomerPropertyList(customerProperty);
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
            .finally(() => {
                
            })
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
        <Modal isOpen={isOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header p-1">
                        <h4 className="modal-title">View {appConfig?.clientFacingName?.customer ?? 'Customer'} History - {customerData?.custType === "RESIDENTIAL" ? (customerData?.title || "") + " " + (customerData?.firstName || "") + " " + (customerData?.lastName || "") : (customerData?.companyName || "")}</h4>
                        <button type="button" className="close" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="modal-body">
                        <ul className="nav nav-tabs">
                            <li className="nav-item ">
                                <a href="#customerDetails" data-toggle="tab" aria-expanded="false" className="nav-link active">
                                    Customer Details
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#customerAddress" data-toggle="tab" aria-expanded="true" className="nav-link">
                                    Customer Address
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#customerProperty" data-toggle="tab" aria-expanded="false" className="nav-link">
                                    Customer Property
                                </a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane active" id="customerDetails">
                                {
                                    !!customerDetailsList.length ?
                                        <DynamicTable
                                            listSearch={listSearch}
                                            listKey={"Customer Details History"}
                                            row={customerDetailsList}
                                            rowCount={totalCount}
                                            header={CustomerDetailsColumns}
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
                            <div className="tab-pane" id="customerAddress">
                                {
                                    !!customerAddressList.length ?
                                        <DynamicTable
                                            listSearch={listSearch}
                                            listKey={"Customer Address History"}
                                            row={customerAddressList}
                                            rowCount={totalCountAddress}
                                            header={CustomerAddressColumns}
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
                            <div className="tab-pane" id="customerProperty">
                                {
                                    !!customerPropertyList.length ?
                                        <DynamicTable
                                            listSearch={listSearch}
                                            listKey={"Customer Property History"}
                                            row={customerPropertyList}
                                            rowCount={totalCountProperty}
                                            header={CustomerPropertyColumns}
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

export default CustomerHistory;


const CustomerDetailsColumns = [
    {
        Header: "Customer ID Type",
        accessor: "idType",
        disableFilters: false,
        id: "idType"
    },
    {
        Header: "ID Number",
        accessor: "idValue",
        disableFilters: false,
        id: "idValue"
    },
    {
        Header: "Email",
        accessor: "email",
        disableFilters: false,
        id: "email"
    },
    {
        Header: "Contact Type",
        accessor: "contactType",
        disableFilters: false,
        id: "contactType",
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
        id: "updatedAt"
    },
    {
        Header: "Modified By",
        accessor: "modifiedBy",
        disableFilters: false,
        id: "modifiedBy"
    }
]

const CustomerAddressColumns = [
    {
        Header: "Flat/House/Unit No",
        accessor: "flatHouseUnitNo",
        disableFilters: false,
        id: "hno"
    },
    {
        Header: "Building Name/Others",
        accessor: "building",
        disableFilters: false,
        id: "buildingName"
    },
    {
        Header: "Street/Area",
        accessor: "street",
        disableFilters: false,
        id: "street"
    },
    {
        Header: "City/Town",
        accessor: "cityTown",
        disableFilters: false,
        id: "city"
    },
    {
        Header: "District/Province",
        accessor: "districtDesc.description",
        disableFilters: false,
        id: "district"
    },
    {
        Header: "State/Region",
        accessor: "stateDesc.description",
        disableFilters: false,
        id: "state"
    },
    {
        Header: "ZIP",
        accessor: "zipDesc.description",
        disableFilters: false,
        id: "zip"
    },
    {
        Header: "Country",
        accessor: "countryDesc.description",
        disableFilters: false,
        id: "country"
    },
    {
        Header: "Modified Date Time",
        accessor: "updatedAt",
        disableFilters: true,
        id: "updatedBy"
    },
    {
        Header: "Modified By",
        accessor: "modifiedBy",
        disableFilters: false,
        id: "modifiedBy"
    }
]

const CustomerPropertyColumns = [
    {
        Header: "Customer Property 1",
        accessor: "property_1",
        disableFilters: false,
        id: "property1"
    },
    {
        Header: "Customer Property 2",
        accessor: "property_2",
        disableFilters: false,
        id: "property2"
    },
    {
        Header: "Customer Property 3",
        accessor: "property_3",
        disableFilters: false,
        id: "property3"
    },
    {
        Header: "Modified Date Time",
        accessor: "updatedAt",
        disableFilters: true,
        id: "updatedBy"
    },
    {
        Header: "Modified by",
        accessor: "modifiedBy",
        disableFilters: false,
        id: "modifiedBy"
    }
]