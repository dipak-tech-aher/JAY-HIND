import React, { useContext, useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { formFilterObject, RegularModalCustomStyles } from '../../common/util/util';
import DynamicTable from '../../common/table/DynamicTable';
import { post } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { AppContext } from "../../AppContext";
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment'
import { toast } from 'react-toastify';

const CustomerHistory = (props) => {
    let { appConfig } = useContext(AppContext);

    const { isOpen, customerData } = props?.data;
    const { setIsOpen } = props?.handler;

    const hasExternalSearch = useRef(false);
    const [listSearch, setListSearch] = useState([]);
    const [customerDetailsList, setCustomerDetailsList] = useState([]);
    const [customerAddressList, setCustomerAddressList] = useState([]);
    const [customerPropertyList, setCustomerPropertyList] = useState([]);
    const [exportBtn, setExportBtn] = useState(false)

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
    }, [currentPage, perPage])

    useEffect(() => {
        getCustomerHistoryData("address")
    }, [currentPageAddress, perPageAddress])

    // useEffect(() => {
    //     getCustomerHistoryData("property")
    // },[currentPageProperty, perPageProperty])

    const getCustomerHistoryData = (type) => {
        if (['details', 'address'].includes(type)) {

            const { customerUuid, customerNo } = customerData;
            const requestBody = {
                customerUuid,
                customerNo
            }
            if (type === "details") {
                requestBody.filters = formFilterObject(filters)
            }
            else if (type === "address") {
                requestBody.filters = formFilterObject(filtersAddress)
            }
            // else if(type === "property")
            // {
            //     requestBody.filters = formFilterObject(filtersProperty)
            // }
            setListSearch(requestBody);
            post(`${properties.CUSTOMER_API}/${type === "details" ? 'details/' : type === "address" ? 'address/' : ''}history?limit=${type === "details" ? perPage : type === "address" ? perPageAddress : 10}&page=${type === "details" ? currentPage : type === "address" ? currentPageAddress : 0}`, requestBody)
                .then((response) => {
                    if (response.data) {
                        const { count, rows } = response.data;
                        if (!!rows.length) {
                            let customerDetails = [];
                            let customerAddress = [];
                            let customerProperty = [];
                            rows?.forEach((data) => {
                                console.log(data);
                                const { email, contactType, idType, idValue, idTypeDesc, contactTypeDesc, contactNo, updatedAt, modifiedBy,
                                    address1, address2, address3, city, district, state, postcode, country, customerContact } = data;
                                if (data && type === "details") {
                                    customerContact && customerContact.map((val) => (
                                        customerDetails.push({
                                            idType: idTypeDesc?.description,
                                            idValue,
                                            email: val.emailId,
                                            contactType: contactTypeDesc?.description,
                                            contactNo: val.mobileNo,
                                            updatedAt: moment(updatedAt).format('DD-MM-YYYY hh:mm:ss A'),
                                            modifiedBy: `${data.updatedByName ? data.updatedByName?.firstName + ' ' + data.updatedByName?.lastName : data.createdByName?.firstName + ' ' + data.createdByName?.lastName}`
                                        })
                                    ))

                                }
                                if (type === "address") {
                                    customerAddress.push({
                                        address1,
                                        address2,
                                        address3,
                                        city,
                                        district,
                                        districtDesc: data?.districtDesc || district,
                                        state,
                                        stateDesc: state,
                                        postcode,
                                        zipDesc: postcode,
                                        country,
                                        countryDesc: data?.countryDesc?.description || country,
                                        updatedAt: moment(updatedAt).format('DD-MM-YYYY hh:mm:ss A'),
                                        modifiedBy: `${modifiedBy?.firstName || ""} ${modifiedBy?.lastName || ""}`
                                    })
                                }
                            });

                            let customerDetailsArr = [];
                            customerDetails.filter(function (item) {
                                let i = customerDetailsArr.findIndex(x => (x.idValue == item.idValue && x.email == item.email && x.contactNo == item.contactNo));
                                if (i <= -1) {
                                    customerDetailsArr.push(item);
                                }
                                return null;
                            });

                            unstable_batchedUpdates(() => {
                                if (type === "details") {
                                    setTotalCount(count)
                                    setCustomerDetailsList(customerDetailsArr);
                                }
                                if (type === "address") {
                                    setTotalCountAddress(count)
                                    setCustomerAddressList(customerAddress);
                                }
                            })
                        }
                        else if (filters.length > 0 || filtersAddress.length > 0 || filtersProperty.length > 0) {
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
                        <h4 className="modal-title">View {appConfig?.clientFacingName?.customer ?? 'Customer'} History - {customerData?.custType === "RESIDENTIAL" ? (customerData?.title || "") + " " + (customerData?.firstName || "") + " " + (customerData?.lastName || "") : (customerData?.firstName || "")}</h4>
                        <button type="button" className="close" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="modal-body">
                        <ul className="nav nav-tabs">
                            <li className="nav-item ">
                                <a href="#customerDetails" data-toggle="tab" aria-expanded="false" className="nav-link active">
                                    {appConfig?.clientFacingName?.customer ?? 'Customer'} Details
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#customerAddress" data-toggle="tab" aria-expanded="true" className="nav-link">
                                    {appConfig?.clientFacingName?.customer ?? 'Customer'} Address
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
                                            columnFilter={true}
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
                                            columnFilter={true}
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
        Header: "ID Type",
        accessor: "idType",
        disableFilters: true,
        id: "idType"
    },
    {
        Header: "ID Number",
        accessor: "idValue",
        disableFilters: true,
        id: "idValue"
    },
    {
        Header: "Email",
        accessor: "email",
        disableFilters: true,
        id: "email"
    },
    // {
    //     Header: "Contact Type",
    //     accessor: "contactType",
    //     disableFilters: true,
    //     id: "contactType",
    // },
    {
        Header: "Contact Number",
        accessor: "contactNo",
        disableFilters: true,
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
        disableFilters: true,
        id: "modifiedBy"
    }
]

const CustomerAddressColumns = [
    {
        Header: "Address 1",
        accessor: "address1",
        disableFilters: true,
        id: "address1"
    },
    {
        Header: "Address 2",
        accessor: "address2",
        disableFilters: true,
        id: "address2"
    },
    {
        Header: "Address 3",
        accessor: "address3",
        disableFilters: true,
        id: "address3"
    },
    {
        Header: "City/Town",
        accessor: "city",
        disableFilters: true,
        id: "city"
    },
    {
        Header: "District/Province",
        accessor: "district",
        disableFilters: true,
        id: "district"
    },
    {
        Header: "State/Region",
        accessor: "state",
        disableFilters: true,
        id: "state"
    },
    {
        Header: "Post Code",
        accessor: "postcode",
        disableFilters: true,
        id: "postcode"
    },
    {
        Header: "Country",
        accessor: "country",
        disableFilters: true,
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
        disableFilters: true,
        id: "modifiedBy"
    }
]