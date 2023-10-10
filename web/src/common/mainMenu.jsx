import React, { useContext, useRef, useState, useEffect } from "react";
import { AppContext } from "../AppContext";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { post, get } from "../common/util/restUtil";
import { properties } from "../properties";
import { CustomerSearchColumns, ComplaintCustomerSearchHiddenColumns } from "../CRM/Customer/customerSearchColumns";
import SearchModal from "./SearchModal";
import { unstable_batchedUpdates } from "react-dom";
// import { Navbar, Nav } from 'rsuite';
// import ResponsiveNav from '@rsuite/responsive-nav';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
// import Nav from '@rsuite/responsive-nav';
// import '@rsuite/responsive/dist/index.css';
// import '@rsuite/react-sidenav/dist/styles/rsuite-default.css';
// import "rsuite/dist/rsuite.css";
// import 'rsuite/dist/rsuite.min.css';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { object, string } from 'yup';

const MainMenu = (props) => {
    const { appsConfig } = props;

    const CREATE_INTERACTION = "Create Interaction";
    const OTHERS_INTERACTION = "Interaction For Others"
    const INVENTORY_ASSIGNMENT = "Inventory Assignment"

    const menuCollapse = props?.data?.menuCollapse
    const history = useHistory();
    let requestParam;
    const { auth } = useContext(AppContext);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);

    const isFirstRender = useRef(true);
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [mainMenuData, setMainMenuData] = useState([])
    const [dashboards, setDashboards] = useState([])
    const [isContractModalOpen, setIsContractModalOpen] = useState({ openModal: false });
    const [complaintSearchInput, setComplaintSearchInput] = useState({});
    const [complaintSearchData, setComplaintSearchData] = useState([]);
    const [dataError, setDataError] = useState({})
    const validationSchema = object().shape({
        customerName: string().required("Name is required"),
        mobileNo: string().required("Contact is required"),
        emailId: string().required("Email Id is required").email("Please Enter Valid Email ID")
    })
    const NavLink = React.forwardRef((props, ref) => {
        const { href, as, ...rest } = props;
        return (
            <Link to={{ pathname: href, data: { sourceName: rest.data } }} as={as}>
                <span ref={ref} {...rest} />
            </Link>
        );
    });


    useEffect(() => {
        if (!isFirstRender.current) {
            getCustomerDataForComplaint()
        }
        else {
            isFirstRender.current = false;
        }
    }, [perPage, currentPage])

    useEffect(() => {
        get(properties.MAINMENU_API + '/getMenu').then((resp) => {
            if (resp.data) {
                // console.log('resp.data---->', resp.data)
                setMainMenuData(resp.data)
                setDashboards(resp.data.filter((e) => e.moduleName === 'Dashboard'))
            }
        }).catch((error) => {
            console.log(error)
        })
    }, [auth])

    const handleOnCustomerSearch = (e) => {
        if (!complaintSearchInput.customerName && !complaintSearchInput.mobileNo && !complaintSearchInput.customerNo && !complaintSearchInput.emailId) {
            toast.error("Validation errors found. Please provide any one field");
            return false
        }
        e.preventDefault();
        isTableFirstRender.current = true;
        unstable_batchedUpdates(() => {
            setFilters([])
            setCurrentPage((currentPage) => {
                if (currentPage === 0) {
                    return '0'
                }
                return 0
            });
        })
    }

    const getCustomerDataForComplaint = () => {
        complaintSearchInput.status = ['AC', 'CS_ACTIVE', 'CS_PEND', 'CS_PROSPECT']
        requestParam = {
            // searchType: 'QUICK_SEARCH',
            //customerQuickSearchInput: complaintSearchInput,
            // filters: formFilterObject(filters),
            // source: 'COMPLAINT'
            checkIsPrimary: false,
            ...complaintSearchInput
        }

        post(`${properties.CUSTOMER_API}/get-customer?limit=${perPage}&page=${currentPage}`, requestParam)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { rows, count } = resp.data;
                        unstable_batchedUpdates(() => {
                            setTotalCount(count)
                            setComplaintSearchData(rows);
                        })
                    } else {
                        setComplaintSearchData([])
                        //toast.error("Error searching for customer - " + resp.status + ', ' + resp.message);
                    }
                } else {
                    setComplaintSearchData([])
                    //toast.error("Uexpected error searching for customer " + resp.statusCode);
                }
            }).catch((error) => {
                console.error(error);
            }).finally();
    }

    const handleCellLinkClick = (e, rowData, popUpstatus) => {
        const data = {
            ...rowData
        }
        // console.log("came here to close setIsComplaintModalOpen", data);
        setIsComplaintModalOpen(false);
        setComplaintSearchData([]);
        setComplaintSearchInput("");
        setTimeout(() => {
            history.push(`${process.env.REACT_APP_BASE}/create-interaction`, { data })
        }, 500);
    }
    const validate = (schema, data) => {
        try {
            setDataError({})
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setDataError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    }

    const handleSearchSubmit = () => {
        // console.log('complaintSearchInput', complaintSearchInput)

        let error = validate(validationSchema, complaintSearchInput);
        if (error) {
            toast.error("Validation errors found. Please check all fields");
            return false
        }
        complaintSearchInput.anonymous = true
        setIsComplaintModalOpen(false);
        setComplaintSearchData([]);
        setComplaintSearchInput("")
        setTimeout(() => {
            history.push(`${process.env.REACT_APP_BASE}/create-interaction`, { complaintSearchInput })
        }, 500);

    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id === "customerNo") {
            return (<span className="text-secondary cursor-pointer" onClick={(e) => handleCellLinkClick(e, row.original, isComplaintModalOpen)}>{cell.value}</span>)
        } else {
            return (<span>{cell.value}</span>)
        }

    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleItemCreate = (formId) => {
        history.push(`${process.env.REACT_APP_BASE}/formdata-addedit`, {
            data: {
                formId: formId
            }
        })
    }

    const handleItemsList = (formId) => {
        history.push(`${process.env.REACT_APP_BASE}/formdata-list`, {
            data: {
                formId: formId
            }
        })
    }
    const [expanded, setExpanded] = useState(false);

    const handleToggle = () => {
        setExpanded(!expanded);
    };

    const openSelfInteraction = () => {
        post(`${properties.CUSTOMER_API}/get-customer?limit=1&page=0`, { emailId: auth?.user?.email }).then((resp) => {
            if (resp?.data) {
                handleCellLinkClick("", resp?.data?.rows?.[0], "");
            }
        }).catch((error) => {
            console.error(error);
        }).finally();
    }

    const createInteraction = () => {
        let permissions = auth?.permissions ?? [];
        let interactionPermissions;
        for (let index = 0; index < permissions.length; index++) {
            if (permissions[index]['Interaction']) {
                interactionPermissions = permissions[index]['Interaction'];
                break;
            }
        }
        // console.log("interactionPermissions ==> ", interactionPermissions);
        let othersInteractionAllowed = interactionPermissions?.find(x => x.screenName === OTHERS_INTERACTION)?.accessType === "allow";
        if (othersInteractionAllowed) {
            setIsComplaintModalOpen(true);
        } else {
            openSelfInteraction();
        }
    }

    const renderMenuItems = (menus) => {
        // console.log("menus ===> ", menus);
        return menus.map((menu, index) => {
            if (menu.accessType === 'deny') {
                return null;
            }

            if (menu.moduleName) {
                const hasSubMenus = menu.list && menu.list.length > 0;

                return (
                    <NavDropdown
                        title={<div className="menu-title">
                            {menu.moduleName}
                            {hasSubMenus && (
                                <ArrowRightIcon className="submenu-arrow" size={16} />
                            )}
                        </div>}
                        id={`menu-${index}`}
                        key={index}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {renderMenuItems(menu.list)}
                    </NavDropdown>
                );
            }

            if (menu.screenName === OTHERS_INTERACTION) {
                return null;
            }
            if (menu.screenName === INVENTORY_ASSIGNMENT) {
                return null;
            }

            if (menu.screenName === CREATE_INTERACTION) {
                return (
                    <NavDropdown.Item
                        key={index}
                        onClick={createInteraction}
                    >
                        {menu.screenName}
                    </NavDropdown.Item>
                );
            }

            return (
                <NavDropdown.Item
                    key={index}
                    as={NavLink}
                    href={`${process.env.REACT_APP_BASE}/${menu.url}`}
                    data={menu.props?.sourceName}
                >
                    {menu.screenName}
                </NavDropdown.Item>
            );
        });
    };
    return (
        auth && auth.user ?
            <>
                <Navbar expand="lg">
                    <Navbar.Toggle aria-controls="main-menu" />
                    <Navbar.Collapse id="main-menu">
                        <Nav className="mr-auto">
                            {renderMenuItems(mainMenuData)}
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                {/* <div className="rs-nav-horizontal">
                    <ul className="rs-nav-item">
                            {mainMenuData && mainMenuData.map((e, i) => (
                                e.accessType !== "deny" && e?.list?.length > 0 &&
                                <li title={e?.moduleName} key={i}>
                                    {e?.moduleName}
                                    {e?.list.map((l, idx) => (
                                        <React.Fragment key={idx}>
                                            {l?.moduleName ?
                                                <div key={idx}>
                                                    {l.accessType !== "deny" && l?.list?.length > 0 &&
                                                        <li title={l?.moduleName} >
                                                            {l?.moduleName} 
                                                            {l.list.map((p, ind) => (<React.Fragment key={ind}>
                                                                {p.accessType !== "deny" &&
                                                                    <Link to={{ pathname: `${process.env.REACT_APP_BASE}/${p?.url}`, data: { sourceName: p?.props?.sourceName} }} as={NavLink}>
                                                                    <span> {p?.screenName}</span>
                                                                </Link>
                                                                    // <Nav.Item key={ind} as={NavLink} href={`${process.env.REACT_APP_BASE}/${p?.url}`} data={p?.props?.sourceName}>
                                                                    //     {p?.screenName}
                                                                    // </Nav.Item>
                                                                }
                                                            </React.Fragment>))}
                                                        </li>
                                                    }
                                                </div>
                                                : <React.Fragment>
                                                    {
                                                        // l.accessType !== "deny" && l?.screenName === 'Create Interaction' &&
                                                        // <Nav.Item onClick={() => setIsComplaintModalOpen(true)}> {l?.screenName} </Nav.Item>

                                                    }
                                                    {l.accessType !== "deny" && l?.screenName !== 'Create Request' && l?.screenName !== 'Create Interaction' && l?.screenName !== 'Create Lead' &&
                                                        // <Nav.Item as={NavLink} href={`${process.env.REACT_APP_BASE}/${l?.url}`} data={l?.props?.sourceName}>
                                                        //     {l?.screenName}
                                                        // </Nav.Item>
                                                        <Link to={{ pathname: `${process.env.REACT_APP_BASE}/${l?.url}`, data: { sourceName: l?.props?.sourceName} }} as={NavLink}>
                                                        <span> {l?.screenName}</span>
                                                    </Link>
                                                    }
                                                </React.Fragment>
                                            }
                                        </React.Fragment>
                                    ))}
                                </li>
                            ))}
                    </ul>
                </div> */}

                {/* <div ref={containerRef}>
                    <ResponsiveNav>                      
                            {mainMenuData && mainMenuData.map((e, i) => (
                                e.accessType !== "deny" && e?.list?.length > 0 &&
                                <Nav.Menu title={e?.moduleName} key={i}>
                                    {e?.list.map((l, idx) => (
                                        <React.Fragment key={idx}>
                                            {l?.moduleName ?
                                                <div key={idx}>
                                                    {l.accessType !== "deny" && l?.list?.length > 0 &&
                                                        <Nav.Menu title={l?.moduleName} >
                                                            {l.list.map((p, ind) => (<React.Fragment key={ind}>
                                                                {p.accessType !== "deny" &&
                                                                    <Nav.Item key={ind} as={NavLink} href={`${process.env.REACT_APP_BASE}/${p?.url}`} data={p?.props?.sourceName}>
                                                                        {p?.screenName}
                                                                    </Nav.Item>
                                                                }
                                                            </React.Fragment>))}
                                                        </Nav.Menu>
                                                    }
                                                </div>
                                                : <React.Fragment>
                                                    {
                                                        l.accessType !== "deny" && l?.screenName === 'Create Interaction' &&
                                                        <Nav.Item onClick={() => setIsComplaintModalOpen(true)}> {l?.screenName} </Nav.Item>

                                                    }
                                                    {l.accessType !== "deny" && l?.screenName !== 'Create Request' && l?.screenName !== 'Create Interaction' && l?.screenName !== 'Create Lead' &&
                                                        <Nav.Item as={NavLink} href={`${process.env.REACT_APP_BASE}/${l?.url}`} data={l?.props?.sourceName}>
                                                            {l?.screenName}
                                                        </Nav.Item>
                                                    }
                                                </React.Fragment>
                                            }
                                        </React.Fragment>
                                    ))}
                                </Nav.Menu>
                            ))}
                    </ResponsiveNav>
                </div> */}
                <SearchModal
                    data={{
                        isOpen: isComplaintModalOpen,
                        searchInput: complaintSearchInput,
                        tableRowData: complaintSearchData,
                        tableHeaderColumns: CustomerSearchColumns,
                        tableHiddenColumns: ComplaintCustomerSearchHiddenColumns,
                        currentPage,
                        perPage,
                        totalCount,
                        isTableFirstRender,
                        filters,
                        hasExternalSearch,
                        dataError,
                        appsConfig
                    }}
                    modalStateHandlers={{
                        setIsOpen: setIsComplaintModalOpen,
                        setSearchInput: setComplaintSearchInput,
                        setSearchData: setComplaintSearchData,
                        handleSearch: handleOnCustomerSearch,
                        setDataError
                    }}
                    tableStateHandlers={{
                        handleCellLinkClick: handleCellLinkClick,
                        handleCellRender: handleCellRender,
                        handlePageSelect: handlePageSelect,
                        handleItemPerPage: setPerPage,
                        handleCurrentPage: setCurrentPage,
                        handleFilters: setFilters,
                        handleSubmit: handleSearchSubmit
                    }}
                />

            </> : <></>

    );
};

export default MainMenu;
