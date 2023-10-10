import React, { useState, useRef, useEffect } from 'react';
import { properties } from '../../properties';
import { history } from '../../common/util/history';
import { get } from '../../common/util/restUtil';
import Card from 'react-bootstrap/Card';
import '../../assets/css/AutoExpandingTextbox.css';

const QuickSearch = (props) => {
    const { appsConfig } = props;
    const [showSearchCat, setShowSearchCat] = useState(false)
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [searchError, setSearchError] = useState('No results found');
    const categories = [
        { flag: appsConfig?.clientFacingName?.customer ?? "Customer", endpoint: properties.CUSTOMER_API, redirectUrl: 'view-customer', enabled: appsConfig?.clientConfig?.customer?.enabled },
        { flag: 'Interaction', endpoint: properties.INTERACTION_API, redirectUrl: 'interaction360', enabled: appsConfig?.clientConfig?.interaction?.enabled },
        { flag: 'Order', endpoint: properties.ORDER_API, redirectUrl: 'order360', enabled: appsConfig?.clientConfig?.order?.enabled },
    ];
    const [selectedCategory, setSelectedCategory] = useState(categories[0].flag)
    const [customerQuickSearchInput, setCustomerQuickSearchInput] = useState("");

    useEffect(() => {
        setSearching(true);
        setSearchResults([]);
        const delayDebounceFn = setTimeout(() => {
            if (customerQuickSearchInput && customerQuickSearchInput != "") {
                if (customerQuickSearchInput.length >= 5) {
                    const categoryDetail = categories.find(x => x.flag == selectedCategory);
                    if (categoryDetail) {
                        get(`${categoryDetail.endpoint}/search?q=${customerQuickSearchInput.trim()}`).then((resp) => {
                            if (resp.status === 200) {
                                setSearchResults([
                                    ...resp.data
                                ])
                            } else {
                                setSearchResults([]);
                                setSearchError("No results found");
                            }
                        }).catch(error => {
                            console.log(error)
                            setSearchResults([]);
                            setSearchError("No results found");
                        }).finally(() => setSearching(false));
                    } else {
                        setSearchResults([]);
                        setSearchError("Please select a category");
                        setSearching(false);
                    }
                } else {
                    setSearchResults([]);
                    setSearchError("Please enter minimum 5 characters");
                    setSearching(false);
                }
            } else {
                setSearchResults([]);
                setSearchError("No results found");
                setSearching(false);
            }
        }, 2000)

        return () => clearTimeout(delayDebounceFn)

    }, [customerQuickSearchInput])

    const handleCustomerQuickSearch = (e) => e.preventDefault();

    const redirectToRespectivePages = (category, response) => {
        const categoryDetail = categories.find(x => x.flag == category);
        const data = {
            ...response,
            sourceName: 'customer360'
        }
        if (response.customerUuid) {
            sessionStorage.setItem("customerUuid", response.customerUuid)
            sessionStorage.setItem("customerIds", response.customerId)
        }
        setShowSearchCat(false);
        setCustomerQuickSearchInput('')
        history.push(`${process.env.REACT_APP_BASE}/${categoryDetail.redirectUrl}`, { data })
    }

    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target) && event.target.id != 'search-input-box') {
                setShowSearchCat(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const categoryClicked = (e) => {
        if (e.target.id !== "") {
            setSearchResults([]);
            setSelectedCategory(e.target.id);
            setCustomerQuickSearchInput("");
            setTimeout(() => {
                setCustomerQuickSearchInput(document.getElementById('search-input-box').value);
            }, 100);
        }
    }

    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef(null);

    const handleClickInside = () => {
        setIsExpanded(true);
    };

    const handleClickOutside = (event) => {
        if (inputRef.current && !inputRef.current.contains(event.target)) {
            setIsExpanded(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <React.Fragment>
            <div className="search-box2">
                <div className="box-srh">
                    <form onSubmit={handleCustomerQuickSearch} autoComplete="off">
                        <input type="text"
                            id='search-input-box'
                            //className="input skel-cust-search"
                            ref={inputRef}
                        // className={`expandable-input ${isExpanded ? 'expanded' : ''}`}
                            className={`expandable-input`}
                            value={customerQuickSearchInput}
                            onClick={(e) => {
                                setShowSearchCat(true)
                                setIsExpanded(true)
                            }}
                            onChange={(e) => {
                                setCustomerQuickSearchInput(e.target.value)
                            }}
                            placeholder="Search..."
                        />
                    </form>
                    <i className="fas fa-search" onClick={(e) => {
                        handleCustomerQuickSearch(e)
                        handleClickOutside(e)
                    }}></i>
                </div>
                <div ref={wrapperRef} className={`skel-fulldetail-sr-view ${showSearchCat ? '' : 'display-none'}`} >
                    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {searchResults.length > 0 ? (
                            searchResults.map((searchResult, index) => (
                                <Card bsPrefix='card border-primary search-list' key={index} border="primary" onClick={() => redirectToRespectivePages(selectedCategory, searchResult)} style={{ marginBottom: '10px', cursor: 'pointer' }}>
                                    <Card.Body>
                                        <Card.Text>
                                            {(selectedCategory == (appsConfig?.clientFacingName?.customer ?? "Customer")) ? (
                                                <React.Fragment>
                                                    <strong>ID:</strong> {searchResult?.customerNo}&nbsp;<br />
                                                    <strong>Name:</strong> {searchResult?.firstName} {searchResult?.lastName ? searchResult?.lastName : ''}&nbsp;
                                                    <strong>Status:</strong> {searchResult?.statusDesc?.description}
                                                </React.Fragment>
                                            ) : (selectedCategory == "Interaction") ? (
                                                <React.Fragment>
                                                    <strong>ID:</strong> {searchResult?.intxnNo}&nbsp;<br />
                                                    <strong>{appsConfig?.clientFacingName?.customer ?? "Customer"} Name:</strong> {searchResult?.customerDetails?.firstName} {searchResult?.customerDetails?.lastName ? searchResult?.customerDetails?.lastName : ''}&nbsp;
                                                </React.Fragment>
                                            ) : (selectedCategory == "Order") ? (
                                                <React.Fragment>
                                                    <strong>ID:</strong> {searchResult?.orderNo}&nbsp;<br />
                                                    <strong>{appsConfig?.clientFacingName?.customer ?? "Customer"} Name:</strong> {searchResult?.customerDetails?.firstName} {searchResult?.customerDetails?.lastName ? searchResult?.customerDetails?.lastName : ''}&nbsp;
                                                </React.Fragment>
                                            ) : null}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            ))) : (
                            <ul className='skel-sr-result-data' style={{ pointerEvents: 'none' }}>
                                <li className='text-center'>
                                    {searching ? (
                                        <div className="spinner-box">
                                            <div className="three-quarter-spinner"></div>
                                        </div>
                                    ) : (searchError)}
                                </li>
                            </ul>
                        )}
                    </div>
                    <ul className='skel-fixed-sr-result' onClick={categoryClicked}>
                        <li className='p-none'>Categories: &nbsp;</li>
                        {categories?.filter(x => x.enabled)?.map((category) => (
                            <li key={category.flag} id={category.flag} className={`${selectedCategory == category.flag ? "b-shadow" : ""}`}>{category.flag}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </React.Fragment>
    )
}

export default QuickSearch;