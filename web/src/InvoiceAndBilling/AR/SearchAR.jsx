import React, { useState, useEffect } from "react";
import { Modal, Button, CloseButton } from 'react-bootstrap';
import totalOutstanding from "../../assets/images/icons/total-outstanding.png";
import totalNonRecurring from "../../assets/images/icons/total-non-recurring.png";
import totalRecurring from "../../assets/images/icons/total-recurring.png";
import totalUsage from "../../assets/images/icons/total-usage.png";


const SearchAR = () => {
    const [chatWidth, setChatWidth] = useState(undefined);
    const [sidebarTop, setSidebarTop] = useState(undefined);
    useEffect(() => {
        const chatEl = document.querySelector('.skel-ar-lft-sect').getBoundingClientRect();
        setChatWidth(chatEl.width);
        // setChatWidth(200);
        setSidebarTop(chatEl.top);
    }, [window?.scrollY]);

    useEffect(() => {
        if (!sidebarTop) return;
        // console.log("calling...")
        window.addEventListener('scroll', isSticky);
        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, [sidebarTop]);

    const isSticky = (e) => {
        const chatEl = document.querySelector('.skel-ar-lft-sect');
        const scrollTop = window.scrollY;
        if (scrollTop >= sidebarTop - 10) {
            chatEl?.classList?.add('is-sticky');
        } else {
            chatEl?.classList?.remove('is-sticky');
        }
    };
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showUnbilledContract, setUnbilledContract] = useState(false);
    const handleCloseUnbilled = () => setUnbilledContract(false);
    const handleShowUnbilled = () => setUnbilledContract(true);

    const [showEditUnbilledContract, setEditUnBilledContract] = useState(false);
    const handleEditCloseUnbilled = () => setEditUnBilledContract(false);
    const handleEditShowUnbilled = () => setEditUnBilledContract(true);

    const [showEditBilledContract, setEditBilledContract] = useState(false);
    const handleEditBillCloseUnbilled = () => setEditBilledContract(false);
    const handleEditBillShowUnbilled = () => setEditBilledContract(true);



    const [showContractHistroy, setContractHistroy] = useState(false);
    const handleCloseContractHistroy = () => setContractHistroy(false);
    const handleShowContractHistroy = () => setContractHistroy(true);

    const [showAdjustmentHistroy, setAdjustmentHistroy] = useState(false);
    const handleCloseAdjustmentHistroy = () => setAdjustmentHistroy(false);
    const handleShowAdjustmentHistroy = () => setAdjustmentHistroy(true);

    const [showPayNow, setPayNow] = useState(false);
    const handleClosePayNow = () => setPayNow(false);
    const handlePayNow = () => setPayNow(true);

    return (
        <>
            <div class="row mt-3">
                <div class="col-2 pt-2">
                    <div id="scroll-list" class="list-group skel-ar-lft-sect">
                        <a class="list-group-item list-group-item-action" href="#list-item-0">Account</a>
                        <a class="list-group-item list-group-item-action" href="#list-item-1">Contract</a>
                        <a class="list-group-item list-group-item-action" href="#list-item-2">Unbilled Contract</a>
                        <a class="list-group-item list-group-item-action" href="#list-item-3">Contract History</a>
                        <a class="list-group-item list-group-item-action" href="#list-item-4">Invoice</a>
                        <a class="list-group-item list-group-item-action" href="#list-item-5">Payment History</a>
                        <a class="list-group-item list-group-item-action active" href="#list-item-6">Adjusment History</a>
                       
                    </div>
                </div>

                {/*<!-- Modal --> */}
                <Modal show={show} onHide={handleClose} dialogClassName='cust-lg-modal'>
                   
                        <Modal.Header>
                        <Modal.Title><span className="skel-grid-title-section">View Contract</span></Modal.Title>
                            <CloseButton onClick={handleClose}>x</CloseButton>
                        </Modal.Header>
                        <Modal.Body>
                        <div class="adjusment">
                            <div class="">
                                <section class="triangle d-flex-center">
                                   
                                    <h4 id="" class="skel-grid-heading-section pl-1">Contract</h4>
                                      
                                </section>
                            </div>


                            <div class="col-md-12 card-box m-0 ">
                                <div class="card">
                                    <div class="data-scroll1">
                                        <table class="table table-striped dt-responsive nowrap w-100">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Contract ID</span>
                                                            <span class="float-right">
                                                                <ul class="mb-0">
                                                                    <li class="dropdown notification-list topbar-dropdown">
                                                                        <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                            <i class="mdi mdi-filter-menu-outline"></i>
                                                                        </a>
                                                                        <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                            <span>Filter</span>
                                                                            <select class="form-control input-xs mt-1" id="example-select">
                                                                                <option>contains</option>
                                                                                <option>does not contain</option>
                                                                                <option>&lt;</option>
                                                                                <option>≤</option>
                                                                                <option>&gt;</option>
                                                                                <option>≥</option>
                                                                            </select>
                                                                            <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Search
                                                                            </a>
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Clear
                                                                            </a>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Customer No</span>
                                                        
                                                            <span class="float-right">
                                                                <ul class="mb-0">
                                                                    <li class="dropdown notification-list topbar-dropdown">
                                                                        <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                            <i class="mdi mdi-filter-menu-outline"></i>
                                                                        </a>
                                                                        <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end">
                                                                            <span>Filter</span>
                                                                            <select class="form-control input-xs mt-1" id="example-select">
                                                                                <option>contains</option>
                                                                                <option>does not contain</option>
                                                                                <option>&lt;</option>
                                                                                <option>≤</option>
                                                                                <option>&gt;</option>
                                                                                <option>≥</option>
                                                                            </select>
                                                                            <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Search
                                                                            </a>
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Clear
                                                                            </a>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th id="ticketId">
                                                        <div class="skel-dyn-header-label">
                                                            <span>Customer Name</span>
                                                        
                                                            <span class="float-right">
                                                                <ul class="mb-0">
                                                                    <li class="dropdown notification-list topbar-dropdown">
                                                                        <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                            <i class="mdi mdi-filter-menu-outline"></i>
                                                                        </a>
                                                                        <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                            <span>Filter</span>
                                                                            <select class="form-control input-xs mt-1" id="example-select">
                                                                                <option>contains</option>
                                                                                <option>does not contain</option>
                                                                                <option>&lt;</option>
                                                                                <option>≤</option>
                                                                                <option>&gt;</option>
                                                                                <option>≥</option>
                                                                            </select>
                                                                            <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                            
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Search
                                                                            </a>
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Clear
                                                                            </a>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Billable Referance Number</span>
                                                        
                                                            <span class="float-right">
                                                                <ul class="mb-0">
                                                                    <li class="dropdown notification-list topbar-dropdown">
                                                                        <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                            <i class="mdi mdi-filter-menu-outline"></i>
                                                                        </a>
                                                                        <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                            <span>Filter</span>
                                                                            <select class="form-control input-xs mt-1" id="example-select">
                                                                                <option>contains</option>
                                                                                <option>does not contain</option>
                                                                                <option>&lt;</option>
                                                                                <option>≤</option>
                                                                                <option>&gt;</option>
                                                                                <option>≥</option>
                                                                            </select>
                                                                            <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                            
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Search
                                                                            </a>
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Clear
                                                                            </a>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                  
                                                    <th>Actual  Contract Start Date </th>
                                                    <th>Actual  Contract End Date </th>
                                                    <th>Contract end date </th>
                                                    <th>Status </th>
                                                    <th>RC</th>
                                                    <th>OTC</th>
                                                    <th>Usage</th>
                                                    <th>Credit Adjustment</th>
                                                    <th>Debit Adjustment</th>
                                                    <th>Last Bill period</th>
                                                    <th>Next Bill period</th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>654789</td>
                                                    <td>713586</td>
                                                    <td>Maboob Basha Abdul Kadhar</td>
                                                    <td>100001 </td>
                                                   
                                                    <td>15-Sep-20</td>
                                                    <td>30-Sep-25</td>
                                                    <td></td>
                                                    <td>Active</td>
                                                    <td>$50 </td>
                                                    <td>$20 </td>
                                                    <td>$10</td>
                                                    <td>$10</td>
                                                    <td>$0</td>
                                                    <td>1-Oct-21</td>
                                                    <td>1-Nov-21</td>

                                                </tr>




                                            </tbody>
                                        </table>
                                    </div>

                                </div> 
                            </div> 

                            <div class="">
                                <section class="triangle d-flex-center">
                                    
                                    <h4 id="" class="skel-grid-heading-section pl-1">Contract Detail</h4>
                                        
                                </section>
                            </div>

                            <div class="col-md-12 card-box m-0 ">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Contract ID</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>


                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Billable Referance Number</span>                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Service Number</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>

                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Contract Name</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                
                                                <th>Actual Start Date </th>
                                                <th>Actual End Date </th>
                                                <th>End date </th>
                                                <th>Status </th>
                                                <th>Charge Name </th>
                                                <th>Charge Type </th>
                                                <th>Charge Amount </th>
                                                <th>Frequency  </th>
                                                <th>Prorated  </th>
                                                <th>Credit Adjustment</th>
                                                <th>Debit Adjustment</th>
                                                <th>Last Bill period</th>
                                                <th>Next Bill period</th>


                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>654789</td>
                                                <td>100001 </td>
                                                <td>2238600</td>
                                                <td>Broad band 200 GB</td>
                                                <td>15-Sep-20</td>
                                                <td>30-Sep-25</td>
                                                <td></td>
                                                <td>Active</td>
                                                <td>Broadband charge</td>
                                                <td>RC </td>
                                                <td>$20 </td>
                                                <td>Monthly </td>
                                                <td>Yes </td>
                                                <td>$10</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>
                                                <td>31-Nov-21</td>

                                            </tr>

                                            <tr>
                                                <td>654789</td>
                                                <td>100001 </td>
                                                <td>2238601</td>
                                                <td>Netflix</td>
                                                <td>1-Oct-20</td>
                                                <td>30-Sep-25</td>
                                                <td></td>
                                                <td>Active</td>
                                                <td>Topup charge</td>
                                                <td>OTC </td>
                                                <td>$50 </td>
                                                <td> </td>
                                                <td> </td>
                                                <td>0</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>
                                                <td>31-Nov-21</td>

                                            </tr>
                                            <tr>
                                                <td>654789</td>
                                                <td>100001 </td>
                                                <td>2238602</td>
                                                <td>Telephone</td>
                                                <td>1-Oct-20</td>
                                                <td>30-Sep-25</td>
                                                <td></td>
                                                <td>Active</td>
                                                <td>Asset charge</td>
                                                <td>Usage </td>
                                                <td>$10 </td>
                                                <td> </td>
                                                <td> </td>
                                                <td>0</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>
                                                <td>31-Nov-21</td>

                                            </tr>




                                        </tbody>
                                    </table>
                                </div>
                                <div class="table-footer-info">
                                    <div class="select-cus">
                                        <span>Showing 1 to 10 of 1 entries</span>
                                        <select class="custom-select custom-select-sm ml-1">
                                            <option value="10">10 Rows</option>
                                            <option value="20">20 Rows</option>
                                            <option value="30">30 Rows</option>
                                            <option value="40">40 Rows</option>
                                            <option value="50">50 Rows</option>
                                        </select>
                                        <span class="ml-1">per page</span>
                                    </div>
                                    <div class="tbl-pagination">
                                        <ul class="page">
                                            <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                            <li class="page__numbers active"> 1</li>
                                            <li class="page__numbers">2</li>
                                            <li class="page__numbers">3</li>
                                            <li class="page__dots">...</li>
                                            <li class="page__numbers"> 10</li>
                                            <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                        </ul>
                                    </div>
                                </div>

                            </div>
                 
                        </div>

                        </Modal.Body>
                        <Modal.Footer>
                           
                        </Modal.Footer>
                    
                </Modal>

                <Modal show={showUnbilledContract} onHide={handleCloseUnbilled} dialogClassName='cust-lg-modal'>

                    <Modal.Header>
                        <Modal.Title><span className="skel-grid-title-section">View Unbilled Contract</span></Modal.Title>
                        <CloseButton onClick={handleCloseUnbilled}>x</CloseButton>
                    </Modal.Header>
                    <Modal.Body>
                        <div class="adjusment">
                            <div class="">
                                <section class="triangle d-flex-center">

                                    <h4 id="" class="skel-grid-heading-section pl-1">Contract</h4>

                                </section>
                            </div>


                            <div class="col-md-12 card-box m-0 ">
                                <div class="card">
                                    <div class="data-scroll1">
                                        <table class="table table-striped dt-responsive nowrap w-100">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Contract ID</span>
                                                            <span class="float-right">
                                                                <ul class="mb-0">
                                                                    <li class="dropdown notification-list topbar-dropdown">
                                                                        <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                            <i class="mdi mdi-filter-menu-outline"></i>
                                                                        </a>
                                                                        <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                            <span>Filter</span>
                                                                            <select class="form-control input-xs mt-1" id="example-select">
                                                                                <option>contains</option>
                                                                                <option>does not contain</option>
                                                                                <option>&lt;</option>
                                                                                <option>≤</option>
                                                                                <option>&gt;</option>
                                                                                <option>≥</option>
                                                                            </select>
                                                                            <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                            
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Search
                                                                            </a>
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Clear
                                                                            </a>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Customer No</span>
                                                        
                                                            <span class="float-right">
                                                                <ul class="mb-0">
                                                                    <li class="dropdown notification-list topbar-dropdown">
                                                                        <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                            <i class="mdi mdi-filter-menu-outline"></i>
                                                                        </a>
                                                                        <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                            <span>Filter</span>
                                                                            <select class="form-control input-xs mt-1" id="example-select">
                                                                                <option>contains</option>
                                                                                <option>does not contain</option>
                                                                                <option>&lt;</option>
                                                                                <option>≤</option>
                                                                                <option>&gt;</option>
                                                                                <option>≥</option>
                                                                            </select>
                                                                            <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                            
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Search
                                                                            </a>
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Clear
                                                                            </a>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th id="ticketId">
                                                        <div class="skel-dyn-header-label">
                                                            <span>Customer Name</span>
                                                            <span class="float-right">
                                                                <ul class="mb-0">
                                                                    <li class="dropdown notification-list topbar-dropdown">
                                                                        <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                            <i class="mdi mdi-filter-menu-outline"></i>
                                                                        </a>
                                                                        <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                            <span>Filter</span>
                                                                            <select class="form-control input-xs mt-1" id="example-select">
                                                                                <option>contains</option>
                                                                                <option>does not contain</option>
                                                                                <option>&lt;</option>
                                                                                <option>≤</option>
                                                                                <option>&gt;</option>
                                                                                <option>≥</option>
                                                                            </select>
                                                                            <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                            
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Search
                                                                            </a>
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Clear
                                                                            </a>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Billable Referance Number</span>
                                                        
                                                            <span class="float-right">
                                                                <ul class="mb-0">
                                                                    <li class="dropdown notification-list topbar-dropdown">
                                                                        <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                            <i class="mdi mdi-filter-menu-outline"></i>
                                                                        </a>
                                                                        <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                            <span>Filter</span>
                                                                            <select class="form-control input-xs mt-1" id="example-select">
                                                                                <option>contains</option>
                                                                                <option>does not contain</option>
                                                                                <option>&lt;</option>
                                                                                <option>≤</option>
                                                                                <option>&gt;</option>
                                                                                <option>≥</option>
                                                                            </select>
                                                                            <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                          
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Search
                                                                            </a>
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Clear
                                                                            </a>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </span>
                                                        </div>
                                                    </th>

                                                    <th>Contract Start Date </th>
                                                    <th>Contract End Date </th>
                                                    <th>RC</th>
                                                    <th>OTC</th>
                                                    <th>Usage</th>
                                                    <th>Credit Adjustment</th>
                                                    <th>Debit Adjustment</th>
                                                    <th>Bill Period</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>654789</td>
                                                    <td>713586</td>
                                                    <td>Maboob Basha Abdul Kadhar</td>
                                                    <td>100001 </td>
                                                    
                                                    <td>1-Sep-21</td>
                                                    <td>30-Sep-21</td>
                                                    <td>$50 </td>
                                                    <td>$20 </td>
                                                    <td>$10</td>
                                                    <td>$10</td>
                                                    <td>$0</td>
                                                    <td>1-Oct-21</td>

                                                </tr>




                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            </div>

                            <div class="">
                                <section class="triangle d-flex-center">

                                    <h4 id="" class="skel-grid-heading-section pl-1">Contract Detail</h4>

                                </section>
                            </div>

                            <div class="col-md-12 card-box m-0 ">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th><div class="skel-dyn-header-label">
                                                    <span>Contract ID</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                   
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                    </div>
                                                </th>


                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Billable Referance Number</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                        </span>
                                                        </div>
                                                </th>
                                                <th><div class="skel-dyn-header-label">
                                                    <span>Service Number</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                    </div>
                                                </th>

                                                <th><div class="skel-dyn-header-label">
                                                    <span>Contract Name</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                   
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                    </div>
                                                </th>
                                                <th>Start Date </th>
                                                <th>End Date </th>
                                                <th>Charge Name </th>
                                                <th>Charge Type </th>
                                                <th>Charge Amount </th>
                                                <th>Frequency </th>
                                                <th>Prorated</th>
                                                <th>Credit Adjustment</th>
                                                <th>Debit Adjustment</th>
                                                <th>Bill Period</th>



                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>654789</td>
                                                <td>100001 </td>
                                                <td>2238600</td>
                                                <td>Broad band 200 GB</td>
                                                <td>1-Sep-21</td>
                                                <td>30-Sep-21</td>
                                                <td>Broadband charge </td>
                                                <td>RC </td>
                                                <td>$20 </td>
                                                <td>Monthly </td>
                                                <td>Yes </td>
                                                <td>$10</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>

                                            </tr>

                                            <tr>
                                                <td>654789</td>
                                                <td>100001 </td>
                                                <td>2238601</td>
                                                <td>Netflix</td>
                                                <td>1-Oct-21</td>
                                                <td>30-Oct-21</td>
                                                <td>Topup charge </td>
                                                <td>OTC </td>
                                                <td>$50 </td>
                                                <td> </td>
                                                <td> </td>
                                                <td>0</td>
                                                <td>$0</td>
                                                <td>1-Nov-21</td>

                                            </tr>
                                            <tr>
                                                <td>654789</td>
                                                <td>100001 </td>
                                                <td>2238602</td>
                                                <td>Telephone</td>
                                                <td>1-Oct-21</td>
                                                <td>30-Oct-21</td>
                                                <td>Asset charge </td>
                                                <td>Usage </td>
                                                <td>$10 </td>
                                                <td> </td>
                                                <td> </td>
                                                <td>0</td>
                                                <td>$0</td>
                                                <td>1-Nov-21</td>

                                            </tr>




                                        </tbody>
                                    </table>
                                </div>
                                <div class="table-footer-info">
                                    <div class="select-cus">
                                        <span>Showing 1 to 10 of 1 entries</span>
                                        <select class="custom-select custom-select-sm ml-1">
                                            <option value="10">10 Rows</option>
                                            <option value="20">20 Rows</option>
                                            <option value="30">30 Rows</option>
                                            <option value="40">40 Rows</option>
                                            <option value="50">50 Rows</option>
                                        </select>
                                        <span class="ml-1">per page</span>
                                    </div>
                                    <div class="tbl-pagination">
                                        <ul class="page">
                                            <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                            <li class="page__numbers active"> 1</li>
                                            <li class="page__numbers">2</li>
                                            <li class="page__numbers">3</li>
                                            <li class="page__dots">...</li>
                                            <li class="page__numbers"> 10</li>
                                            <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                        </ul>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </Modal.Body>
                    <Modal.Footer>
                        
                    </Modal.Footer>

                </Modal>

                <Modal show={showContractHistroy} onHide={handleCloseContractHistroy} dialogClassName='cust-lg-modal'>

                    <Modal.Header>
                        <Modal.Title><span className="skel-grid-title-section">View Contract History</span></Modal.Title>
                        <CloseButton onClick={handleCloseContractHistroy}>x</CloseButton>
                    </Modal.Header>
                    <Modal.Body>
                        <div class="adjusment">
                            <div class="">
                                <div class="adjus-button"><button type="button" class="skel-btn-submit ml-2" onclick="$('#adjustment-sec2').show();$('#edit-contract-sec4').hide();">Adjustment</button></div>
                                <section class="triangle d-flex-center">

                                    <h4 id="" class="skel-grid-heading-section pl-1">Contract</h4>

                                </section>
                            </div>


                            <div class="col-md-12 card-box m-0 ">
                                <div class="card">
                                    <div class="data-scroll1">
                                        <table class="table table-striped dt-responsive nowrap w-100">
                                            <thead>
                                                <tr>

                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Contract ID</span>
                                                            <span class="float-right">
                                                                <ul class="mb-0">
                                                                    <li class="dropdown notification-list topbar-dropdown">
                                                                        <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                            <i class="mdi mdi-filter-menu-outline"></i>
                                                                        </a>
                                                                        <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                            <span>Filter</span>
                                                                            <select class="form-control input-xs mt-1" id="example-select">
                                                                                <option>contains</option>
                                                                                <option>does not contain</option>
                                                                                <option>&lt;</option>
                                                                                <option>≤</option>
                                                                                <option>&gt;</option>
                                                                                <option>≥</option>
                                                                            </select>
                                                                            <span class="mt-1">
                                                                                <input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Search
                                                                            </a>
                                                                            <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                                Clear
                                                                            </a>
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Customer No</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th id="ticketId">
                                                        <div class="skel-dyn-header-label">
                                                            <span>Customer Name</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Billable Referance Number</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                            </div>
                                                    </th>


                                                    <th><div class="skel-dyn-header-label">
                                                        <span>Contract Refernace ID</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                      
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                    </th>

                                                    <th>Contract start date </th>
                                                    <th>Contract end date </th>
                                                    <th><div class="skel-dyn-header-label">
                                                        <span>Charge Name</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                    </th>
                                                    <th>RC</th>
                                                    <th>OTC</th>
                                                    <th>Usage</th>
                                                    <th>Credit Adjustment</th>
                                                    <th>Debit Adjustment</th>
                                                    <th>Total Charge</th>
                                                    <th>Bill Period</th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>

                                                    <td>654789</td>
                                                    <td>713586</td>
                                                    <td>Maboob Basha Abdul Kadhar</td>
                                                    <td>100001</td>
                                                    

                                                    <td>10</td>
                                                    
                                                    <td>1-Sep-20</td>
                                                    <td>30-Sep-20</td>
                                                    <td>broadband charge</td>
                                                    <td>$50 </td>
                                                    <td>$20 </td>
                                                    <td>$15 </td>
                                                    <td>$10</td>
                                                    <td>$0</td>
                                                    <td>$95</td>
                                                    <td>30-Oct-20</td>


                                                </tr>


                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            </div>

                            <div class="">
                                <section class="triangle d-flex-center">

                                    <h4 id="" class="skel-grid-heading-section pl-1">Contract Detail</h4>

                                </section>
                            </div>

                            <div class="col-md-12 card-box m-0 ">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th><div class="skel-dyn-header-label">
                                                    <span>Contract ID</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                </div>
                                                </th>


                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Billable Referance Number</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                   
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th><div class="skel-dyn-header-label">
                                                    <span>Service Number</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                </div>
                                                </th>

                                                <th><div class="skel-dyn-header-label">
                                                    <span>Contract Name</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                   
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                    </div>
                                                </th><th>Start Date </th>
                                                <th>End Date </th>
                                                <th>Charge Type </th>
                                                <th>Charge Amount </th>
                                                <th>Credit Adjustment</th>
                                                <th>Debit Adjustment</th>
                                                <th>Last Bill period</th>
                                                <th>Next Bill period</th>



                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr id="row-sel1">
                                                <td>654789</td>

                                                <td>100001 </td>
                                                <td>2238600</td>
                                                <td>Broad band 200 GB</td>
                                                <td>15-Sep-20</td>
                                                <td>30-Sep-25</td>
                                                <td>OTC </td>
                                                <td>$20 </td>
                                                <td>$10</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>
                                                <td>31-Nov-21</td>

                                                <td>

                                                </td></tr>


                                            <tr id="row-sel2">
                                                <td>654789</td>

                                                <td>100001 </td>
                                                <td>2238601</td>
                                                <td>Netflix</td>
                                                <td>1-Oct-20</td>
                                                <td>30-Sep-25</td>
                                                <td>RC </td>
                                                <td>$50 </td>
                                                <td>0</td>
                                                <td>$0</td>
                                                <td>1-Sep-21</td>
                                                <td>31-Oct-21</td>

                                            </tr>

                                            <tr id="row-sel3">
                                                <td>654789</td>

                                                <td>100001 </td>
                                                <td>2238602</td>
                                                <td>Telephone</td>
                                                <td>1-Oct-20</td>
                                                <td>30-Sep-25</td>
                                                <td>Usage </td>
                                                <td>$15 </td>
                                                <td>0</td>
                                                <td>$0</td>
                                                <td>1-Sep-21</td>
                                                <td>31-Oct-21</td>


                                            </tr></tbody>
                                    </table>
                                </div>
                                <div class="table-footer-info">
                                    <div class="select-cus">
                                        <span>Showing 1 to 10 of 1 entries</span>
                                        <select class="custom-select custom-select-sm ml-1">
                                            <option value="10">10 Rows</option>
                                            <option value="20">20 Rows</option>
                                            <option value="30">30 Rows</option>
                                            <option value="40">40 Rows</option>
                                            <option value="50">50 Rows</option>
                                        </select>
                                        <span class="ml-1">per page</span>
                                    </div>
                                    <div class="tbl-pagination">
                                        <ul class="page">
                                            <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                            <li class="page__numbers active"> 1</li>
                                            <li class="page__numbers">2</li>
                                            <li class="page__numbers">3</li>
                                            <li class="page__dots">...</li>
                                            <li class="page__numbers"> 10</li>
                                            <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                        </ul>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </Modal.Body>
                    <Modal.Footer>

                    </Modal.Footer>

                </Modal>

                <Modal show={showAdjustmentHistroy} onHide={handleCloseAdjustmentHistroy} dialogClassName='cust-lg-modal'>

                    <Modal.Header>
                        <Modal.Title><span className="skel-grid-title-section">View Adjustment</span></Modal.Title>
                        <CloseButton onClick={handleCloseAdjustmentHistroy}>x</CloseButton>
                    </Modal.Header>
                    <Modal.Body>
                        <div class="adjusment">
                            <div class="">
                                
                                <section class="triangle d-flex-center">

                                    <h4 id="" class="skel-grid-heading-section pl-1">Adjustment</h4>

                                </section>
                            </div>


                            <div class="col-md-12 card-box m-0 ">
                                <div class="card">
                                    <div class="data-scroll1">
                                        <table class="table table-striped dt-responsive nowrap w-100">
                                            <thead>
                                                <tr>
                                                    <th id="ticketId">
                                                        <div class="skel-dyn-header-label">
                                                            <span>Adjustment Number</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                            </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Adjustment Period</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Adjustment Category</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Adjustment Type</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Billable Referance Number</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Contract ID</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                        </div>
                                                    </th>

                                                    <th>Total Adjustment Amount</th>
                                                    <th>Status </th>
                                                    <th>Reason </th>
                                                    <th>Remarks  </th>
                                                    <th>Modified By </th>
                                                    <th>Modified On  </th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>441536</td>
                                                    <td>21-Aug-2021</td>
                                                    <td>Prebill</td>
                                                    <td>Credit</td>
                                                    <td>100001</td>
                                                    <td>136547</td>
                                                    <td>$50.00</td>
                                                    <td>Approved</td>
                                                    <td>System/Machine related</td>
                                                    <td>Customer Service</td>
                                                    <td>Abdul</td>
                                                    <td>10/10/2021 07:29:46 </td>

                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            </div>

                            <div class="">
                                <section class="triangle d-flex-center">

                                    <h4 id="" class="skel-grid-heading-section pl-1">Contract Detail</h4>

                                </section>
                            </div>

                            <div class="col-md-12 card-box m-0 ">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th id="ticketId">
                                                    <div class="skel-dyn-header-label">
                                                        <span>Adjustment Number</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                   
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Adjustment Category</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                   
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Adjustment Type</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Billable Referance Number</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Contract ID</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th><div class="skel-dyn-header-label">
                                                    <span>Contract Name</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                   
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                </div>
                                                </th>
                                                <th><div class="skel-dyn-header-label">
                                                    <span>Service Number</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                   
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                </div>
                                                </th>
                                                <th>Charge Name  </th>
                                                <th>Charge Type  </th>
                                                <th>Charge Amount  </th>
                                                <th>Adjustment Amount </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>441536</td>
                                                <td>Pre Bill</td>
                                                <td>Credit</td>
                                                <td>100001</td>
                                                <td>136547</td>
                                                <td>STD Peak Usage</td>
                                                <td>2238600</td>
                                                <td>STD Peak Charge</td>
                                                <td>RC</td>
                                                <td>$200.00</td>
                                                <td>15</td>
                                            </tr>
                                            <tr>
                                                <td>441536</td>
                                                <td>Post Bill</td>
                                                <td>Debit</td>
                                                <td>100001</td>
                                                <td>569547</td>
                                                <td>Netflix</td>
                                                <td>2238600</td>
                                                <td>Topup charge</td>
                                                <td>OTC</td>
                                                <td>$100.00</td>
                                                <td>25</td>
                                            </tr>
                                            <tr>
                                                <td>441536</td>
                                                <td>Pre Bill</td>
                                                <td>Credit</td>
                                                <td>100001</td>
                                                <td>652017</td>
                                                <td>Telephone</td>
                                                <td>2238600</td>
                                                <td>Asset charge</td>
                                                <td>Usage</td>
                                                <td>$80.00</td>
                                                <td>10</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="table-footer-info">
                                    <div class="select-cus">
                                        <span>Showing 1 to 10 of 1 entries</span>
                                        <select class="custom-select custom-select-sm ml-1">
                                            <option value="10">10 Rows</option>
                                            <option value="20">20 Rows</option>
                                            <option value="30">30 Rows</option>
                                            <option value="40">40 Rows</option>
                                            <option value="50">50 Rows</option>
                                        </select>
                                        <span class="ml-1">per page</span>
                                    </div>
                                    <div class="tbl-pagination">
                                        <ul class="page">
                                            <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                            <li class="page__numbers active"> 1</li>
                                            <li class="page__numbers">2</li>
                                            <li class="page__numbers">3</li>
                                            <li class="page__dots">...</li>
                                            <li class="page__numbers"> 10</li>
                                            <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                        </ul>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </Modal.Body>
                    <Modal.Footer>

                    </Modal.Footer>

                </Modal>

                <Modal show={showPayNow} onHide={handleClosePayNow} dialogClassName='cust-lg-modal'>

                    <Modal.Header>
                        <Modal.Title><span className="skel-grid-title-section">Pay Now</span></Modal.Title>
                        <CloseButton onClick={handleClosePayNow}>x</CloseButton>
                    </Modal.Header>
                    <Modal.Body>
                        <div class="p-2">
                            <fieldset class="scheduler-border">

                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="catalog" class="col-form-label">Billable Referance Number</label>
                                            <input type="text" class="form-control" id="customerTitle" placeholder="100001 " disabled="" />
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="contactType" class="col-form-label">Allocation Level<span class="ast">*</span></label>
                                            <select id="contactType" class="form-control" onchange="checkCatalog($(this))">
                                                <option value="Auto">Auto Allocation</option>
                                                <option value="invoice">Invoice</option>
                                                <option value="invoice-Charge">Invoice Charge</option>

                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="contactType" class="col-form-label">Currency<span class="ast">*</span></label>
                                            <select id="contactType" class="form-control" onchange="checkCatalog($(this))">
                                                <option value="">BND</option>
                                                <option value="">USD</option>
                                                <option value="">QAR</option>
                                                <option value="">INR</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="contactType" class="col-form-label">Payment Mode<span class="ast">*</span></label>
                                            <select id="contactType" class="form-control" onchange="checkCatalog($(this))">
                                                <option value="">Cash</option>
                                                <option value="check">Cheque</option>
                                                <option value="credit-card">Card</option>
                                            </select>
                                        </div>
                                    </div>


                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="catalog" class="col-form-label">Total Outstanding</label>
                                            <input type="text" class="form-control" id="customerTitle" placeholder="355" disabled="" />
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="catalog" class="col-form-label">Due Outstanding</label>
                                            <input type="text" class="form-control" id="customerTitle" placeholder="280" disabled="" />
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="catalog" class="col-form-label">Payment Amount</label>
                                            <input type="text" class="form-control" id="customerTitle" placeholder="" />
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="contactType" class="col-form-label">Payment Location<span class="ast">*</span></label>
                                            <select id="contactType" class="form-control" onchange="checkCatalog($(this))" disabled="">
                                                <option value="">HQ</option>
                                                <option value="">HQ</option>

                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="contactType" class="col-form-label"></label>
                                            <div class="custom-control custom-checkbox label-txt">
                                                <input type="checkbox" class="custom-control-input" id="customCheck5" />
                                                    <label class="custom-control-label" for="customCheck5">Offline payment</label>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div class="row" id="check" style={{ display: 'none' }}>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="catalog" class="col-form-label">Cheque Number</label>
                                            <input type="text" class="form-control" id="customerTitle" placeholder="" />
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="catalog" class="col-form-label">Cheque Date</label>
                                            <input type="date" class="form-control" id="customerTitle" placeholder="" />
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="contactType" class="col-form-label">Cheque Bank Name<span class="ast">*</span></label>
                                            <input type="text" class="form-control" id="customerTitle" placeholder="" />
                                        </div>
                                    </div>
                                </div>

                                <div class="row" id="credit-card" style={{ display: 'none' }}>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="catalog" class="col-form-label">Card Number</label>
                                            <input type="text" class="form-control" id="customerTitle" placeholder="" />
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="catalog" class="col-form-label">Card expiry Date</label>
                                            <input type="date" class="form-control" id="customerTitle" placeholder="" />
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="contactType" class="col-form-label">Card Type<span class="ast">*</span></label>
                                            <select id="contactType" class="form-control">
                                                <option value="">Master</option>
                                                <option value="">Visa</option>

                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="contactType" class="col-form-label">Remarks</label>
                                            <textarea id="textarea" class="form-control" name="">                              </textarea>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex-row pre-bill-sec">
                                    <div class="col-12 p-1">
                                        <div id="customer-buttons" class="d-flex justify-content-center">
                                            <button type="button" class="skel-btn-cancel" onclick="$('#customer-details').show();$('#personal').hide();">Clear</button>
                                            <button type="button" class="skel-btn-submit" onclick="$('#customer-details').show();$('#personal').hide();">Submit</button>
                                            
                                        </div>
                                    </div>
                                </div>

                            </fieldset>
                        </div>

                    </Modal.Body>
                    <Modal.Footer>

                    </Modal.Footer>

                </Modal>

                <Modal show={showEditBilledContract} onHide={handleEditBillCloseUnbilled} dialogClassName='cust-lg-modal'>

                    <Modal.Header>
                        <Modal.Title><span className="skel-grid-title-section">Edit Contract</span></Modal.Title>
                        <CloseButton onClick={handleEditBillCloseUnbilled}>x</CloseButton>
                    </Modal.Header>
                    <Modal.Body>
                        <div class="adjusment">
                            <div class="">
                               
                                <section class="triangle d-flex-center">

                                    <h4 id="" class="skel-grid-heading-section pl-1">Contract</h4>

                                </section>
                            </div>


                            <div class="col-md-12 card-box m-0 ">
                                <div class="card">
                                    <div class="data-scroll1">
                                        <table class="table table-striped dt-responsive nowrap w-100">
                                            <thead>
                                                <tr>
                                                    <th><div class="skel-dyn-header-label">
                                                        <span></span>Contract ID
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>???</option>
                                                                            <option>&gt;</option>
                                                                            <option>???</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>

                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                        </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                        <span></span>Sales Order Number
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>???</option>
                                                                            <option>&gt;</option>
                                                                            <option>???</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>

                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                            </div>
                                                    </th>
                                                    <th><div class="skel-dyn-header-label">
                                                        <span>Customer Contract Number</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>???</option>
                                                                            <option>&gt;</option>
                                                                            <option>???</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>

                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Customer No</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>???</option>
                                                                            <option>&gt;</option>
                                                                            <option>???</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>

                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                            </div>
                                                    </th>
                                                    <th id="ticketId">
                                                        <div class="skel-dyn-header-label">
                                                            <span>Customer Name</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>???</option>
                                                                            <option>&gt;</option>
                                                                            <option>???</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>

                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                            </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Billable Referance Number</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>???</option>
                                                                            <option>&gt;</option>
                                                                            <option>???</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>

                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                        </div>
                                                    </th>

                                                    <th>Actual  Contract Start Date </th>
                                                    <th>Actual  Contract End Date </th>
                                                    <th>Contract End Date </th>
                                                    <th>Status </th>
                                                    <th>Total Charge Amount</th>
                                                    <th>Balance Amount</th>
                                                    <th>Total Recurring Amount</th>
                                                    <th>Total non Reccuring Amount</th>
                                                    <th>Total Usage Amount</th>
                                                    <th>Debit Adjustment Amount</th>
                                                    <th>Last Bill Period</th>
                                                    <th>Next Bill Period</th>
                                                    <th>Created By</th>
                                                    <th>Created AT </th>
                                                    <th>Updated By</th>
                                                    <th>Updated At</th>
                                                    <th>Action</th>


                                                </tr>
                                            </thead>
                                            <tbody>



                                                <tr id="con-edit">
                                                    <td>654789</td>
                                                    <td><input type="text" class="form-control" value="MZA-SO6119" disabled="" /></td>
                                                    <td>715258</td>
                                                    <td>713586</td>
                                                    <td>Maboob Basha Abdul Kadhar</td>
                                                    <td>100001 </td>
                                                    <td><input type="text" class="form-control" value="15-Sep-20" disabled="" /></td>
                                                    <td><input type="text" class="form-control" value="30-Sep-25" disabled="" /></td>
                                                    <td></td>
                                                    <td>Active</td>
                                                    <td>$50 </td>
                                                    <td>$20 </td>
                                                    <td>$20 </td>
                                                    <td>$20 </td>
                                                    <td>$10</td>
                                                    <td>$10</td>
                                                    <td>1-Oct-21</td>
                                                    <td>1-Nov-21</td>
                                                    <td>Rahim</td>
                                                    <td>02/16/22 13:10</td>
                                                    <td>Rahim</td>
                                                    <td>02/16/22 13:10</td>
                                                    <td><button type="button" class="skel-btn-submit" onclick="$('#con-edit').hide();$('#con-done').show(); ">Edit</button></td>
                                                </tr>

                                                <tr id="con-done" style={{ display: 'none' }}>
                                                    <td>654789</td>
                                                    <td><input type="text" class="form-control" value="MZA-SO6119" /></td>
                                                    <td>715258</td>
                                                    <td>713586</td>
                                                    <td>Maboob Basha Abdul Kadhar</td>
                                                    <td>100001 </td>
                                                    <td><input type="text" class="form-control" value="15-Sep-20" /></td>
                                                    <td><input type="text" class="form-control" value="30-Sep-25" /></td>
                                                    <td></td>
                                                    <td>Active</td>
                                                    <td>$50 </td>
                                                    <td>$20 </td>
                                                    <td>$20 </td>
                                                    <td>$20 </td>
                                                    <td>$10</td>
                                                    <td>$10</td>
                                                    <td>1-Oct-21</td>
                                                    <td>1-Nov-21</td>
                                                    <td>Rahim</td>
                                                    <td>02/16/22 13:10</td>
                                                    <td>Rahim</td>
                                                    <td>02/16/22 13:10</td>
                                                    <td>
                                                        <button type="button" class="skel-btn-submit" onclick="$('#con-edit').show();$('#con-done').hide(); ">Done</button></td>
                                                </tr>




                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            </div>

                            <div class="">
                                <section class="triangle d-flex-center">
                                    
                                    <h4 id="" class="skel-grid-heading-section pl-1">Contract Detail</h4>

                                </section>
                            </div>
                            <div class="col-12 adjus-btn mt-2 mb-2"><button type="button" data-toggle="modal" data-target="" class="skel-btn-submit" onclick="$('#add-form2').show();$('#manual-check2').hide(); $('#task-block2').show();">Add</button></div>
                            <div class="col-md-12 card-box m-0 ">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th></th>
                                                <th><div class="skel-dyn-header-label">
                                                    <span>Plan Name</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end">
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>???</option>
                                                                        <option>&gt;</option>
                                                                        <option>???</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                </div>
                                                </th>

                                                <th>
                                                    Plan Description

                                                </th>

                                                <th>
                                                    Sales Order Number

                                                </th>
                                                <th><div class="skel-dyn-header-label">
                                                    <span>Plan Start Date</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end">
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>???</option>
                                                                        <option>&gt;</option>
                                                                        <option>???</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                   
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                    </div>
                                                </th>

                                                <th><div class="skel-dyn-header-label">
                                                    <span>Plan End Date</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end">
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>???</option>
                                                                        <option>&gt;</option>
                                                                        <option>???</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                    </div>
                                                </th>
                                                <th>Status &nbsp;&nbsp;&nbsp;</th>
                                                <th>Total Product Charge Amount </th>
                                                <th>Balance Amount</th>
                                                <th>Minimum Commitment</th>
                                                <th>Total Consumption </th>
                                                <th>Charge Type</th>
                                                <th>Frequency  </th>
                                                <th>Prorated  </th>
                                                <th>Quantity</th>
                                                <th>Advance Flag</th>
                                                <th>Credit Adjustment Amount</th>
                                                <th>Debit Adjustment Amount</th>
                                                <th>Action</th>

                                            </tr>
                                        </thead>
                                        <tbody>

                                            <tr id="task-block2">
                                                <td width={50}><button type="button" class="btn btn-sm rowfy-deleterow btn-danger">-</button></td>
                                                <td width={50}><button type="button" class="btn btn-sm rowfy-addrow btn-success">+</button></td>
                                                <td>
                                                    <select id="ContractName" class="form-control">
                                                        <option value="">Select</option>
                                                        <option value="1">Mobile Contract</option>
                                                        <option value="2">Dell Server</option>
                                                        <option value="3">Broadband</option>
                                                    </select>
                                                </td>
                                                <td><input type="text" class="form-control" id="customerTitle" value="" /></td>
                                                <td><select id="" class="form-control" onchange="checkCatalog($(this))">
                                                    <option value="">Select</option>
                                                    <option value="SalesdName">MZA-SO6119</option>
                                                    <option value="3">MZA-SO6120</option>
                                                    <option value="3">MZA-SO6121</option>
                                                </select></td>
                                                <td><input type="date" class="form-control" id="customerTitle" value="" /></td>
                                                <td><input type="date" class="form-control" id="customerTitle" value="" /></td>
                                                <td><input type="text" class="form-control" id="customerTitle" value="" /></td>
                                                <td><input type="text" class="form-control" id="customerTitle" value="" /></td>
                                                <td><input type="text" class="form-control" id="customerTitle" value="" /></td>
                                                <td><input type="text" class="form-control" id="customerTitle" value="" /></td>
                                                <td><input type="text" class="form-control" id="customerTitle" value="" /></td>
                                                <td>
                                                    <select id="ContractName" class="form-control" onchange="checkCatalog($(this))">
                                                        <option value="">Select</option>
                                                        <option value="1">RC</option>
                                                        <option value="2">OTC</option>
                                                        <option value="type-charge">Usage</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <select id="ContractName" class="form-control">
                                                        <option value="">Select</option>
                                                        <option value="2">Monthly</option>
                                                        <option value="3">Quarterly</option>
                                                        <option value="3">Yearly</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <select id="ContractName" class="form-control">
                                                        <option value="">Select</option>
                                                        <option value="2">Yes</option>
                                                        <option value="3">No</option>
                                                    </select>
                                                </td>
                                                <td><input type="text" class="form-control" id="customerTitle" value="" /></td>
                                                <td>
                                                    <select id="ContractName" class="form-control">
                                                        <option value="">Select</option>
                                                        <option value="2">Yes</option>
                                                        <option value="3">No</option>
                                                    </select>
                                                </td>
                                                <td><input type="text" class="form-control" id="customerTitle" value="" /></td>
                                                <td><input type="text" class="form-control" id="customerTitle" value="" /></td>
                                            </tr>

                                            <tr id="row-sel2">
                                                <td></td>
                                                <td></td>
                                                <td>MSI-GOM</td>
                                                <td class="wrp-txt"><input type="text" class="form-control" value="SD119-Global operations and Maintenance..." disabled="" /></td>
                                                <td><input type="text" class="form-control" value="MZA-SO6120" disabled="" /></td>
                                                <td><input type="date" class="form-control" value="1-Jan-2021" disabled="" /></td>
                                                <td><input type="date" class="form-control" value="31-Jan-2022" disabled="" /></td>
                                                <td>Active</td>
                                                <td><input type="text" class="form-control" value="60,0000" disabled="" /></td>
                                                <td>80,000</td>
                                                <td><input type="text" class="form-control" value="100.5" disabled="" /></td>
                                                <td><input type="text" class="form-control" value="250.35" disabled="" /></td>
                                                <td>Usage </td>
                                                <td><input type="text" class="form-control" value="Quarterly" disabled="" /> </td>
                                                <td>No </td>
                                                <td><input type="text" class="form-control" value="2" disabled="" /> </td>
                                                <td><input type="text" class="form-control" value="Yes" disabled="" /></td>
                                                <td>0</td>
                                                <td>0</td>

                                                <td>
                                                    <button type="button" class="skel-btn-submit" onclick="$('#row-sel2').hide();$('#row-sel22').show();">Edit</button></td>
                                            </tr>
                                            <tr id="row-sel22" style={{ display: 'none' }}>
                                                <td></td>
                                                <td></td>
                                                <td>MSI-GOM</td>
                                                <td class="wrp-txt"><input type="text" class="form-control" value="SD119-Global operations and Maintenance..." /></td>
                                                <td><select id="" class="form-control" onchange="checkCatalog($(this))">
                                                    <option value="">Select</option>
                                                    <option value="SalesdName">MZA-SO6119</option>
                                                    <option value="3">MZA-SO6120</option>
                                                    <option value="3">MZA-SO6121</option>
                                                </select></td>
                                                <td><input type="date" class="form-control" value="1-Jan-2021" /></td>
                                                <td><input type="date" class="form-control" value="31-Jan-2022" /></td>
                                                <td>Active</td>
                                                <td><input type="text" class="form-control" value="60,0000" /></td>
                                                <td>80,000</td>
                                                <td><input type="text" class="form-control" value="100.5" /></td>
                                                <td><input type="text" class="form-control" value="250.35" /></td>
                                                <td>Usage </td>
                                                <td><input type="text" class="form-control" value="Quarterly" /> </td>
                                                <td>No </td>
                                                <td><input type="text" class="form-control" value="2" /> </td>
                                                <td><input type="text" class="form-control" value="Yes" /></td>
                                                <td>0</td>
                                                <td>0</td>

                                                <td>
                                                    <button type="button" class="skel-btn-submit" onclick="$('#row-sel2').show();$('#row-sel22').hide();">Done</button></td>
                                            </tr>
                                            <tr id="row-sel3">
                                                <td></td>
                                                <td></td>
                                                <td>MSI</td>
                                                <td class="wrp-txt"><input type="text" class="form-control" value="Osperations and Maintenance..." disabled="" /></td>
                                                <td><input type="text" class="form-control" value="MZA-SO6119" disabled="" /></td>
                                                <td><input type="date" class="form-control" value="2-Jan-2021" disabled="" /></td>
                                                <td><input type="date" class="form-control" value="2-Feb-2022" disabled="" /></td>
                                                <td>Active</td>
                                                <td><input type="text" class="form-control" value="50,0000" disabled="" /></td>
                                                <td>80,000</td>
                                                <td><input type="text" class="form-control" value="102.5" disabled="" /></td>
                                                <td><input type="text" class="form-control" value="200.35" disabled="" /></td>
                                                <td>Usage </td>
                                                <td><input type="text" class="form-control" value="Quarterly" disabled="" /> </td>
                                                <td>No </td>
                                                <td><input type="text" class="form-control" value="2" disabled="" /> </td>
                                                <td><input type="text" class="form-control" value="Yes" disabled="" /></td>
                                                <td>0</td>
                                                <td>0</td>

                                                <td>
                                                    <button type="button" class="skel-btn-submit" onclick="$('#row-sel3').hide();$('#row-sel33').show();">Edit</button></td>
                                            </tr>
                                            <tr id="row-sel33" style={{ display: 'none' }}>
                                                <td></td>
                                                <td></td>
                                                <td>MSI</td>
                                                <td class="wrp-txt"><input type="text" class="form-control" value="Osperations and Maintenance..." /></td>
                                                <td><select id="" class="form-control" onchange="checkCatalog($(this))">
                                                    <option value="">Select</option>
                                                    <option value="SalesdName">MZA-SO6119</option>
                                                    <option value="3">MZA-SO6120</option>
                                                    <option value="3">MZA-SO6121</option>
                                                </select></td>
                                                <td><input type="date" class="form-control" value="2-Jan-2021" /></td>
                                                <td><input type="date" class="form-control" value="2-Feb-2022" /></td>
                                                <td>Active</td>
                                                <td><input type="text" class="form-control" value="50,0000" /></td>
                                                <td>80,000</td>
                                                <td><input type="text" class="form-control" value="102.5" /></td>
                                                <td><input type="text" class="form-control" value="200.35" /></td>
                                                <td>Usage </td>
                                                <td><input type="text" class="form-control" value="Quarterly" /> </td>
                                                <td>No </td>
                                                <td><input type="text" class="form-control" value="2" /> </td>
                                                <td><input type="text" class="form-control" value="Yes" /></td>
                                                <td>0</td>
                                                <td>0</td>

                                                <td>
                                                    <button type="button" class="skel-btn-submit" onclick="$('#row-sel3').show();$('#row-sel33').hide();">Done</button></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="col-12 p-1" id="sub-btn2">
                                    <div id="customer-buttons" class="d-flex justify-content-center">
                                        <button type="button" class="skel-btn-cancel">Clear</button>
                                        <button type="button" class="skel-btn-submit" id="customCheck2" onclick=" $('#add-form3').hide(); $('#cr-new-contract').show(); $('#aft-submit').show(); ">Done</button>
                                        
                                    </div>
                                </div>
                                <div class="table-footer-info">
                                    <div class="select-cus">
                                        <span>Showing 1 to 10 of 1 entries</span>
                                        <select class="custom-select custom-select-sm ml-1">
                                            <option value="10">10 Rows</option>
                                            <option value="20">20 Rows</option>
                                            <option value="30">30 Rows</option>
                                            <option value="40">40 Rows</option>
                                            <option value="50">50 Rows</option>
                                        </select>
                                        <span class="ml-1">per page</span>
                                    </div>
                                    <div class="tbl-pagination">
                                        <ul class="page">
                                            <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                            <li class="page__numbers active"> 1</li>
                                            <li class="page__numbers">2</li>
                                            <li class="page__numbers">3</li>
                                            <li class="page__dots">...</li>
                                            <li class="page__numbers"> 10</li>
                                            <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                        </ul>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </Modal.Body>
                    <Modal.Footer>

                    </Modal.Footer>

                </Modal>

                <Modal show={showEditUnbilledContract} onHide={handleEditCloseUnbilled} dialogClassName='cust-lg-modal'>

                    <Modal.Header>
                        <Modal.Title><span className="skel-grid-title-section">Edit Unbilled Contract</span></Modal.Title>
                        <CloseButton onClick={handleEditCloseUnbilled}>x</CloseButton>
                    </Modal.Header>
                    <Modal.Body>
                        <div class="adjusment">
                            <div class="">

                                <section class="triangle d-flex-center">

                                    <h4 id="" class="skel-grid-heading-section pl-1">Contract</h4>

                                </section>
                            </div>


                            <div class="col-md-12 card-box m-0 ">
                                <div class="card">
                                    <div class="data-scroll1">
                                        <table class="table table-striped dt-responsive nowrap w-100">
                                            <thead>
                                                <tr>
                                                    <th><div class="skel-dyn-header-label">
                                                        <span>Contract ID</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Customer No</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end">
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                        </div>
                                                    </th>
                                                    <th id="ticketId">
                                                        <div class="skel-dyn-header-label">
                                                            <span>Customer Name</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                       
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                            </div>
                                                    </th>
                                                    <th>
                                                        <div class="skel-dyn-header-label">
                                                            <span>Billable Referance Number</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                            </span>
                                                            </div>
                                                    </th>

                                                    <th>Contract Start Date </th>
                                                    <th>Contract End Date </th>
                                                    
                                                    <th>RC</th>
                                                    <th>OTC</th>
                                                    <th>Usage</th>
                                                    <th>Credit Adjustment</th>
                                                    <th>Debit Adjustment</th>
                                                    <th>Bill period</th>
                                                    <th>Action</th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr id="con-edit3">
                                                    <td>654789</td>
                                                    <td>713586</td>
                                                    <td>Maboob Basha Abdul Kadhar</td>
                                                    <td>100001 </td>

                                                    <td>15-Sep-20</td>
                                                    <td><input type="text" class="form-control" value="30-Sep-25" disabled="" /></td>
                                                    
                                                    <td>$50 </td>
                                                    <td>$20 </td>
                                                    <td>$10</td>
                                                    <td>$10</td>
                                                    <td>$0</td>
                                                    <td>31-Nov-21</td>
                                                    <td>
                                                        <button type="button" class="btn btn-primary btn-sm waves-effect waves-light ml-2" onclick="$('#con-edit3').hide();$('#con-done3').show(); ">Edit</button></td>
                                                </tr>

                                                <tr id="con-done3" style={{display:'none'}}>
                                                    <td>654789</td>
                                                    <td>713586</td>
                                                    <td>Maboob Basha Abdul Kadhar</td>
                                                    <td>100001 </td>

                                                    <td>15-Sep-20</td>
                                                    <td><input type="text" class="form-control" value="30-Sep-25" /></td>
                                                   
                                                    <td>$50 </td>
                                                    <td>$20 </td>
                                                    <td>$10</td>
                                                    <td>$10</td>
                                                    <td>$0</td>
                                                    <td>31-Nov-21</td>
                                                    <td>
                                                        <button type="button" class="btn btn-primary btn-sm waves-effect waves-light ml-2" onclick="$('#con-edit3').show();$('#con-done3').hide(); ">Done</button></td>
                                                </tr>




                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            </div>

                            <div class="">
                                <section class="triangle d-flex-center">

                                    <h4 id="" class="skel-grid-heading-section pl-1">Contract Detail</h4>

                                </section>
                            </div>
                            <div class="col-12 adjus-btn mt-2 mb-2"><button type="button" data-toggle="modal" data-target="" class="skel-btn-submit">Add</button></div>
                            <div class="add-line card-box mt-2 mb-2" id="add-form4" style={{ display: 'block' }}>
                                <div>

                                    <div class="row">

                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <label for="contactType" class="col-form-label"></label>
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" id="customCheck8" onclick="$('#freetext4').show(); $('#submit-button4').hide(); $('#manual').show();$('#manual-check4').show(); $('#unmanual').hide();$('#manual-contract').hide(); $('#unmanual-contract').show(); $('#contract-name4').hide(); $('#cont-type-unbill').hide(); $('#cont-type-unbill2').show(); $('#manual-check').show(); $('#submit-button').hide(); $('#sub-btn2').show();" />
                                                        <label class="custom-control-label col-form-label p-0" for="customCheck8">Adhoc Contract</label>
                                                </div>
                                            </div>
                                        </div>




                                        <div class="col-md-3" id="cont-type-unbill" style={{display:'none'}}>
                                            <label for="ContractName" class="col-form-label">Contract Type</label>
                                            <select id="ContractName" class="form-control">
                                                <option value="">Select</option>
                                                <option value="2">Plan</option>
                                                <option value="3">Services</option>
                                                <option value="3">Asset</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3" id="cont-type-unbill2">
                                            <label for="ContractName" class="col-form-label">Contract Type</label>
                                            <input type="text" class="form-control" id="cal" value="" disabled="" />
                                        </div>
                                        <div class="col-md-3" id="freetext4" >
                                            <div class="form-group">
                                                <label for="contactType" class="col-form-label">Contract Name<span class="ast">*</span></label>
                                                <input type="text" class="form-control" id="cal" name="" />
                                            </div>
                                        </div>
                                        <div class="col-md-3" id="contract-name4" style={{ display: 'none' }}>
                                            <label for="ContractName" class="col-form-label">Contract Name</label>
                                            <select id="ContractName" class="form-control">
                                                <option value="">Select</option>
                                                <option value="1">Mobile Contract</option>
                                                <option value="2">Dell Server</option>
                                                <option value="3">Broadband</option>
                                            </select>
                                        </div>


                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <label for="contactType" class="col-form-label">Contract Start Date</label>
                                                <input type="date" class="form-control" id="cal" name="" />
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <label for="contactType" class="col-form-label">Contract End Date</label>
                                                <input type="date" class="form-control" id="cal" name="" />
                                            </div>
                                        </div>

                                    </div>

                                    <div class="col-12 p-1" id="submit-button4" style={{ display: 'none' }}>
                                        <div id="customer-buttons" class="d-flex justify-content-center">
                                            <button type="button" class="btn btn-primary btn-sm waves-effect waves-light ml-2" id="customCheck2" onclick="$('#all-contract2').show(); $('#add-form').hide();">Submit</button>
                                            <button type="button" class="btn btn-primary btn-sm waves-effect waves-light ml-2">Clear</button>
                                        </div>
                                    </div>
                                </div>

                              

                                <div id="manual-check4" style={{ display: 'block' }}>
                                    <br />



                                        <div class="row" id="charge-uncheck">


                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="contactType" class="col-form-label">Charge Name</label>
                                                    <input type="text" class="form-control" id="cal" value="" />
                                                </div>
                                            </div>

                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="contactType" class="col-form-label">Charge Type</label>
                                                    <select id="ContractName" class="form-control">
                                                        <option value="">Select</option>
                                                        <option value="1">RC</option>
                                                        <option value="2">OTC</option>
                                                        <option value="3">Usage</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div class="col-md-2">
                                                <div class="form-group">
                                                    <label for="contactType" class="col-form-label">Charge Amount</label>
                                                    <input type="text" class="form-control" id="cal" value="" />
                                                </div>
                                            </div>

                                            <div class="col-md-2">
                                                <div class="form-group">
                                                    <label for="contactType" class="col-form-label">Frequency</label>
                                                    <select id="ContractName" class="form-control">
                                                        <option value="">Select</option>
                                                        <option value="2">Monthly</option>
                                                        <option value="3">Quarterly</option>
                                                        <option value="3">Yearly</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div class="col-md-2">
                                                <div class="form-group">
                                                    <label for="contactType" class="col-form-label">Prorated</label>
                                                    <select id="ContractName" class="form-control">
                                                        <option value="">Select</option>
                                                        <option value="2">Yes</option>
                                                        <option value="3">No</option>
                                                    </select>
                                                </div>
                                            </div>

                                        </div>


                                        <div class="col-12 p-1" id="sub-btn2">
                                        <div id="customer-buttons" class="d-flex justify-content-center">
                                            <button type="button" class="skel-btn-cancel">Clear</button>
                                                <button type="button" class="skel-btn-submit" id="customCheck2" onclick="$('#all-contract2').show(); $('#add-form4').hide(); $('#manual-check2').hide();">Submit</button>
                                                
                                            </div>
                                        </div>

                                </div>
                            </div>
                            <div class="col-md-12 card-box m-0 ">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th><div class="skel-dyn-header-label">
                                                    <span>Contract ID</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                   
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                    </div>
                                                </th>


                                                <th> <div class="skel-dyn-header-label">
                                                    <span>Billable Referance Number</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                    </div>
                                                </th>
                                                <th><div class="skel-dyn-header-label">
                                                    <span>Service Number</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                    </div>
                                                </th>

                                                <th><div class="skel-dyn-header-label">
                                                    <span>Contract Name</span>
                                                    <span class="float-right">
                                                        <ul class="mb-0">
                                                            <li class="dropdown notification-list topbar-dropdown">
                                                                <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                    <i class="mdi mdi-filter-menu-outline"></i>
                                                                </a>
                                                                <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                    <span>Filter</span>
                                                                    <select class="form-control input-xs mt-1" id="example-select">
                                                                        <option>contains</option>
                                                                        <option>does not contain</option>
                                                                        <option>&lt;</option>
                                                                        <option>≤</option>
                                                                        <option>&gt;</option>
                                                                        <option>≥</option>
                                                                    </select>
                                                                    <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Search
                                                                    </a>
                                                                    <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                        Clear
                                                                    </a>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </span>
                                                    </div>
                                                </th>
                                                <th>Start Date </th>

                                                <th> End Date </th>

                                                <th>Charge Name </th>
                                                <th>Charge Type </th>
                                                <th>Charge Amount </th>
                                                <th>Credit Adjustment</th>
                                                <th>Debit Adjustment</th>
                                                <th>Last Bill period</th>
                                                <th>Next Bill period</th>
                                                <th>Detail</th>


                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr id="row-sel5">
                                                <td>654789</td>

                                                <td>100001 </td>
                                                <td>2238600</td>
                                                <td>Broad band 200 GB</td>
                                                <td>15-Sep-20</td>
                                                <td><input type="text" class="form-control" value="30-Sep-25" disabled="" /></td>
                                                <td>Broadband charge </td>
                                                <td>RC </td>
                                                <td>$20 </td>
                                                <td>$10</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>
                                                <td>31-Nov-21</td>

                                                <td>
                                                    <button type="button" class="skel-btn-submit" onclick="$('#row-sel5').hide();$('#row-sel55').show();">Edit</button></td>
                                            </tr>
                                            <tr id="row-sel55" style={{ display: 'none' }}>
                                                <td>654789</td>

                                                <td>100001 </td>
                                                <td>2238600</td>
                                                <td>Broad band 200 GB</td>
                                                <td>15-Sep-20</td>
                                                <td><input type="text" class="form-control" value="30-Sep-25" /></td>
                                                <td>Broadband charge </td>
                                                <td>RC </td>
                                                <td>$20 </td>
                                                <td>$10</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>
                                                <td>31-Nov-21</td>

                                                <td>
                                                    <button type="button" class="skel-btn-submit" onclick="$('#row-sel5').show();$('#row-sel55').hide();">Done</button></td>
                                            </tr>

                                            <tr id="row-sel6">
                                                <td>654789</td>

                                                <td>100001 </td>
                                                <td>2238601</td>
                                                <td>Netflix</td>
                                                <td>1-Oct-20</td>
                                                <td><input type="text" class="form-control" value="30-Sep-25" disabled="" /></td>
                                                <td> Topup charge</td>
                                                <td> OTC</td>
                                                <td>$50 </td>
                                                <td>0</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>
                                                <td>31-Nov-21</td>
                                                <td>
                                                    <button type="button" class="skel-btn-submit" onclick="$('#row-sel6').hide();$('#row-sel66').show();">Edit</button></td>
                                            </tr>
                                            <tr id="row-sel66" style={{ display: 'none' }}>
                                                <td>654789</td>

                                                <td>100001 </td>
                                                <td>2238601</td>
                                                <td>Netflix</td>
                                                <td>1-Oct-20</td>
                                                <td><input type="text" class="form-control" value="30-Sep-25" /></td>
                                                <td>Topup charge </td>
                                                <td>OTC </td>
                                                <td>$50 </td>
                                                <td>0</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>
                                                <td>31-Nov-21</td>
                                                <td>
                                                    <button type="button" class="skel-btn-submit" onclick="$('#row-sel6').show();$('#row-sel66').hide();">Done</button></td>
                                            </tr>
                                            <tr id="row-sel7">
                                                <td>654789</td>

                                                <td>100001 </td>
                                                <td>2238602</td>
                                                <td>Telephone</td>
                                                <td>1-Oct-20</td>
                                                <td><input type="text" class="form-control" value="30-Sep-25" disabled="" /></td>
                                                <td>Asset charge </td>
                                                <td>Usage </td>
                                                <td>$10 </td>
                                                <td>0</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>
                                                <td>31-Nov-21</td>
                                                <td>
                                                    <button type="button" class="skel-btn-submit" onclick="$('#row-sel7').hide();$('#row-sel77').show();">Edit</button></td>
                                            </tr>
                                            <tr id="row-sel77" style={{ display: 'none' }}>
                                                <td>654789</td>

                                                <td>100001 </td>
                                                <td>2238602</td>
                                                <td>Telephone</td>
                                                <td>1-Oct-20</td>
                                                <td><input type="text" class="form-control" value="30-Sep-25" /></td>
                                                <td>Asset charge </td>
                                                <td>Usage </td>
                                                <td>$10 </td>
                                                <td>0</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>
                                                <td>31-Nov-21</td>
                                                <td>
                                                    <button type="button" class="skel-btn-submit" onclick="$('#row-sel7').show();$('#row-sel77').hide();">Done</button></td>
                                            </tr>




                                        </tbody>
                                    </table>
                                </div>
                                <div class="table-footer-info">
                                    <div class="select-cus">
                                        <span>Showing 1 to 10 of 1 entries</span>
                                        <select class="custom-select custom-select-sm ml-1">
                                            <option value="10">10 Rows</option>
                                            <option value="20">20 Rows</option>
                                            <option value="30">30 Rows</option>
                                            <option value="40">40 Rows</option>
                                            <option value="50">50 Rows</option>
                                        </select>
                                        <span class="ml-1">per page</span>
                                    </div>
                                    <div class="tbl-pagination">
                                        <ul class="page">
                                            <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                            <li class="page__numbers active"> 1</li>
                                            <li class="page__numbers">2</li>
                                            <li class="page__numbers">3</li>
                                            <li class="page__dots">...</li>
                                            <li class="page__numbers"> 10</li>
                                            <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                        </ul>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </Modal.Body>
                    <Modal.Footer>

                    </Modal.Footer>

                </Modal>

                <div class="col-md-10 p-10">
                    <div data-spy="scroll" data-target="#scroll-list" data-offset="0" class="scrollspy-div ac-screen">
                        <div class="">
                            <section class="triangle">
                                <h4 id="list-item-0" class="skel-grid-heading-section pl-1">Billable Reference Number: 100001 -  Maboob Basha Abdul Kadhar</h4>
                            </section>
                        </div>
                        <div class="col-md-12 card-box m-0 ">
                            <div class="row p-0 bg-light border d-flex-center">
                                <div class="col-10 pl-2">
                                    <h5 class="skel-grid-title-section ">Account Overview</h5>
                                </div>
                                <div class="col-2 usage">
                                    
                                    <div class="paybill"><button type="button" onClick={handlePayNow} class="skel-btn-submit">Pay Now</button></div>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="row pt-1">
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="inputState" class="col-form-label">Billable Reference Number</label>
                                            <p>100001</p>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="inputState" class="col-form-label">Customer Number</label>
                                            <p> 713586</p>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="inputState" class="col-form-label">Customer Name</label>
                                            <p> Maboob Basha Abdul Kadhar</p>
                                        </div>
                                    </div>
                                    <div class="col-md-3 pt-2">
                                        <div class="form-group">Status<span class="ml-1 badge badge-outline-success font-17">ACTIVE</span></div></div>
                                </div>
                                <div class="row pt-1">
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="inputState" class="col-form-label">Customer Created Date</label>
                                            <p>1-Oct-21</p>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="inputState" class="col-form-label">Customer Type</label>
                                            <p>Residential</p>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="inputState" class="col-form-label">Customer Category</label>
                                            <p>VIP</p>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="inputState" class="col-form-label">Account Manager</label>
                                            <p>Srini</p>
                                        </div>
                                    </div>

                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="inputState" class="col-form-label">Bill Group</label>
                                            <p>Bill Group 1</p>
                                        </div>
                                    </div>
                                    <div class="col-3">
                                        <div class="form-group">
                                            <label for="inputState" class="col-form-label">Currency</label>
                                            <p>USD</p>
                                        </div>
                                    </div>
                                    <div class="col-3">
                                        <div class="form-group">
                                            <label for="inputState" class="col-form-label">Credit Limit</label>
                                            <p>1000</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="row scheduler-border2">
                                    <div class="col-md-3">
                                        <article class="ac-sec stat-cards-item border">
                                            <div class="stat-cards-icon primary">
                                                <img src={totalOutstanding} />
                                            </div>
                                            <div class="form-group">
                                                <label for="inputState" class="col-form-label">Total Outstanding</label>
                                                <p class="outstand">$355.00</p>
                                            </div>
                                        </article>
                                    </div>
                                    <div class="col-md-3">
                                        <article class="ac-sec stat-cards-item border">
                                            <div class="stat-cards-icon primary">
                                                <img src={totalNonRecurring} />
                                            </div>
                                            <div class="form-group">
                                                <label for="inputState" class="col-form-label">Due Outstanding</label>
                                                <p>$280.00</p>
                                            </div>
                                        </article>
                                    </div>
                                    <div class="col-md-3">
                                        <article class="ac-sec stat-cards-item border">
                                            <div class="stat-cards-icon primary">
                                                <img src={totalRecurring} />
                                            </div>
                                            <div class="form-group">
                                                <label for="inputState" class="col-form-label">Advanced Amount</label>
                                                <p class="advance">50</p>
                                            </div>
                                        </article>
                                    </div>
                                    <div class="col-md-3">
                                        <article class="ac-sec stat-cards-item border">
                                            <div class="stat-cards-icon primary">
                                                <img src={totalUsage} />
                                            </div>
                                            <div class="form-group">
                                                <label for="inputState" class="col-form-label">No of Active Services</label>
                                                <p class="">10</p>
                                            </div>
                                        </article>
                                    </div>
                                </div>

                            </div>
                        </div>

                       
                        <div class="">
                            <section class="triangle row d-flex-center">
                                <div class="col-10">
                                <h4 id="list-item-1" class="skel-grid-heading-section pl-1">Contract</h4>
                                </div>
                                    <div class="col-2 usage">
                                        
                                        <div class="paybill2 pl-3"><a class="skel-btn-submit" href="meeza-account-create-contract.html">Create Contract</a></div>
                                    </div>

                                
                            </section>
                        </div>
                        <div class="col-md-12 card-box m-0 ">
                            <div class="card">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Action</span>                                                        
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Contract ID</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end">
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1">
                                                                            <input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>

                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                    
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Sales Order Number</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Customer Contract Number</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Customer No</span> 
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1">
                                                                            <input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th id="ticketId">
                                                    <div class="skel-dyn-header-label">
                                                        <span>Customer Name</span> 
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end">
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1">
                                                                            <input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Billable Referance Number</span> 
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end">
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1">
                                                                            <input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>

                                                <th>Actual  Contract Start Date </th>
                                                <th>Actual  Contract End Date </th>
                                                <th>Contract End Date </th>
                                                <th>Status </th>
                                                <th>Total Charge Amount</th>
                                                <th>Balance Amount</th>
                                                <th>Total Recurring Amount</th>
                                                <th>Total non Reccuring Amount</th>
                                                <th>Total Usage Amount</th>
                                                <th>Debit Adjustment Amount</th>
                                                <th>Last Bill Period</th>
                                                <th>Next Bill Period</th>
                                                <th>Created By</th>
                                                <th>Created AT </th>
                                                <th>Updated By</th>
                                                <th>Updated At</th>


                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr>
                                                <td><button type="button" onClick={handleEditBillShowUnbilled} class="skel-btn-submit">Edit</button></td>
                                                <td><button type="button" class="link-btn btn btn-primary btn-sm waves-effect waves-light" onClick={handleShow}>654789</button></td>
                                                <td>MZA-SO6119</td>
                                                <td>715258</td>
                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001 </td>
                                                
                                                <td>15-Sep-20</td>
                                                <td>30-Sep-25</td>
                                                <td></td>
                                                <td>Active</td>
                                                <td>$50 </td>
                                                <td>$20 </td>
                                                <td>$20 </td>
                                                <td>$20 </td>
                                                <td>$10</td>
                                                <td>$10</td>
                                                <td>1-Oct-21</td>
                                                <td>1-Nov-21</td>
                                                <td>Rahim</td>
                                                <td>02/16/22 13:10</td>
                                                <td>Rahim</td>
                                                <td>02/16/22 13:10</td>

                                            </tr>

                                            <tr>
                                                <td><button type="button" data-toggle="modal" data-target="#cr-adjus3" class="skel-btn-submit">Edit</button></td>
                                                <td><button type="button" onClick={handleShow} class="link-btn btn btn-primary btn-sm waves-effect waves-light">852789</button></td>
                                                <td>MZA-SO6119</td>
                                                <td>752695</td>
                                                <td>715147</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001 </td>
                                                <td>1-Oct-20</td>
                                                <td>30-Sep-25</td>
                                                <td></td>
                                                <td>Active</td>
                                                <td>$10 </td>
                                                <td>$0 </td>
                                                <td></td>
                                                <td>$20 </td>
                                                <td>$0</td>
                                                <td>$0</td>
                                                <td>1-Sep-21</td>
                                                <td>1-Oct-21</td>
                                                <td>Rahim</td>
                                                <td>02/17/22 13:10</td>
                                                <td>Rahim</td>
                                                <td>02/17/22 13:10</td>
                                            </tr>




                                        </tbody>
                                    </table>
                                    
                                </div>
                                <div class="table-footer-info">
                                    <div class="select-cus">
                                        <span>Showing 1 to 10 of 1 entries</span>
                                        <select class="custom-select custom-select-sm ml-1">
                                            <option value="10">10 Rows</option>
                                            <option value="20">20 Rows</option>
                                            <option value="30">30 Rows</option>
                                            <option value="40">40 Rows</option>
                                            <option value="50">50 Rows</option>
                                        </select>
                                        <span class="ml-1">per page</span>
                                    </div>
                                    <div class="tbl-pagination">
                                        <ul class="page">
                                            <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                            <li class="page__numbers active"> 1</li>
                                            <li class="page__numbers">2</li>
                                            <li class="page__numbers">3</li>
                                            <li class="page__dots">...</li>
                                            <li class="page__numbers"> 10</li>
                                            <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                          
                        </div>
                       
                        <div class="">
                            <section class="triangle d-flex-center">
                                
                                <h4 id="list-item-2" class="skel-grid-heading-section pl-1">Unbilled Contract</h4>
                                    
                            </section>
                        </div>
                        <div class="col-md-12 card-box m-0 ">
                            <div class="card">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th>Action</th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Contract ID</span> 
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end">
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Customer No</span> 
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th id="ticketId">
                                                    <div class="skel-dyn-header-label">
                                                        <span>Customer Name</span> 
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Billable Referance Number</span> 
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>

                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>

                                                <th>Contract start date </th>
                                                <th>Contract end date </th>
                                                <th>RC</th>
                                                <th>OTC</th>
                                                <th>Usage</th>
                                                <th>Credit Adjustment</th>
                                                <th>Debit Adjustment</th>
                                                <th>Bill Period</th>


                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><button type="button" onClick={handleEditShowUnbilled} class="skel-btn-submit">Edit</button></td>
                                                <td><button type="button" onClick={handleShowUnbilled} class="link-btn btn btn-primary btn-sm waves-effect waves-light">654789</button></td>
                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001 </td>
                                               
                                                <td>1-Sep-21</td>
                                                <td>30-Sep-21</td>
                                                <td>$50 </td>
                                                <td>$20 </td>
                                                <td>$10</td>
                                                <td>$10</td>
                                                <td>$0</td>
                                                <td>1-Oct-21</td>

                                            </tr>

                                            <tr>
                                                <td><button type="button" data-toggle="modal" data-target="#cr-adjus6" class="skel-btn-submit">Edit</button></td>
                                                <td><button type="button" onClick={handleShowUnbilled} class="link-btn btn btn-primary btn-sm waves-effect waves-light">526789</button></td>
                                                <td>852586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001 </td>
                                                
                                                <td>1-Oct-21</td>
                                                <td>30-Oct-21</td>
                                                <td>$10 </td>
                                                <td>$0 </td>
                                                <td></td>
                                                <td>$0</td>
                                                <td>$0</td>
                                                <td>1-Nov-21</td>

                                            </tr>




                                        </tbody>
                                    </table>
                                    
                                </div>
                                <div class="table-footer-info">
                                    <div class="select-cus">
                                        <span>Showing 1 to 10 of 1 entries</span>
                                        <select class="custom-select custom-select-sm ml-1">
                                            <option value="10">10 Rows</option>
                                            <option value="20">20 Rows</option>
                                            <option value="30">30 Rows</option>
                                            <option value="40">40 Rows</option>
                                            <option value="50">50 Rows</option>
                                        </select>
                                        <span class="ml-1">per page</span>
                                    </div>
                                    <div class="tbl-pagination">
                                        <ul class="page">
                                            <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                            <li class="page__numbers active"> 1</li>
                                            <li class="page__numbers">2</li>
                                            <li class="page__numbers">3</li>
                                            <li class="page__dots">...</li>
                                            <li class="page__numbers"> 10</li>
                                            <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="">
                            <section class="triangle d-flex-center">
                               
                                <h4 id="list-item-3" class="skel-grid-heading-section pl-1">Contract History</h4>
                                  
                            </section>
                        </div>
                        <div class="col-md-12 card-box m-0 ">
                            <div class="card">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>

                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Contract ID</span> 
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Customer No</span> 
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th id="ticketId">
                                                    <div class="skel-dyn-header-label">
                                                        <span>Customer Name</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Billable Referance Number</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>


                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Contract Refernace ID</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>

                                                <th>Contract start date </th>
                                                <th>Contract end date </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Charge Name</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>RC</th>
                                                <th>OTC</th>
                                                <th>Usage</th>
                                                <th>Credit Adjustment</th>
                                                <th>Debit Adjustment</th>
                                                <th>Total Charge</th>
                                                <th>Bill Period</th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>

                                                <td><button type="button" onClick={handleShowContractHistroy} class="link-btn btn btn-primary btn-sm waves-effect waves-light">654789</button></td>
                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001</td>
                                               

                                                <td>10</td>
                                                
                                                <td>1-Sep-20</td>
                                                <td>30-Sep-20</td>
                                                <td>broadband charge</td>
                                                <td>$50 </td>
                                                <td>$20 </td>
                                                <td>$15 </td>
                                                <td>$10</td>
                                                <td>$0</td>
                                                <td>$95</td>
                                                <td>30-Oct-20</td>


                                            </tr>
                                            <tr>

                                                <td><button type="button" data-toggle="modal" data-target="#contract-history" class="link-btn btn btn-primary btn-sm waves-effect waves-light">136547</button></td>

                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001</td>
                                               

                                                <td>11</td>
                                                
                                                <td>1-Oct-20</td>
                                                <td>31-Oct-20</td>
                                                <td>broadband charge</td>
                                                <td>$50 </td>
                                                <td> </td>
                                                <td>$25 </td>
                                                <td>$0</td>
                                                <td>$0</td>
                                                <td>$75</td>
                                                <td>30-Nov-20</td>


                                            </tr>
                                            <tr>


                                                <td><button type="button" data-toggle="modal" data-target="#contract-history" class="link-btn btn btn-primary btn-sm waves-effect waves-light">789456</button></td>

                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001</td>
                                               

                                                <td>12</td>
                                               
                                                <td>1-Oct-20</td>
                                                <td>31-Oct-20</td>
                                                <td>Addon charge</td>
                                                <td>$10 </td>
                                                <td>$0</td>
                                                <td> </td>
                                                <td>$0</td>
                                                <td>$5</td>
                                                <td>$5</td>
                                                <td>30-Nov-20</td>


                                            </tr>
                                            <tr>

                                                <td><button type="button" data-toggle="modal" data-target="#contract-history" class="link-btn btn btn-primary btn-sm waves-effect waves-light">136547</button></td>
                                                <td>713586</td>
                                                <td>Hassanal Bolkiah Abdul Rahaman</td>
                                                <td>100001</td>
                                               

                                                <td>13</td>
                                               
                                                <td>1-Nov-20</td>
                                                <td>30-Nov-20</td>
                                                <td>broadband charge</td>
                                                <td>$50 </td>
                                                <td></td>
                                                <td>$5</td>
                                                <td>$0</td>
                                                <td>$0</td>
                                                <td>$55</td>
                                                <td>30-Dec-20</td>


                                            </tr>
                                            <tr>

                                                <td><button type="button" data-toggle="modal" data-target="#contract-history" class="link-btn btn btn-primary btn-sm waves-effect waves-light">789456</button></td>

                                                <td>713586</td>
                                                <td>PENGIRAN ISMAIL PENGIRAN MUHAIMIN</td>
                                                <td>100001</td>
                                                

                                                <td>14</td>
                                                
                                                <td>1-Nov-20</td>
                                                <td>30-Nov-20</td>
                                                <td>Addon charge</td>
                                                <td>$10 </td>
                                                <td>$0</td>
                                                <td></td>
                                                <td>$0</td>
                                                <td>$0</td>
                                                <td>$10</td>
                                                <td>30-Dec-20</td>


                                            </tr>

                                        </tbody>
                                    </table>
                                    
                                </div>
                                <div class="table-footer-info">
                                    <div class="select-cus">
                                        <span>Showing 1 to 10 of 1 entries</span>
                                        <select class="custom-select custom-select-sm ml-1">
                                            <option value="10">10 Rows</option>
                                            <option value="20">20 Rows</option>
                                            <option value="30">30 Rows</option>
                                            <option value="40">40 Rows</option>
                                            <option value="50">50 Rows</option>
                                        </select>
                                        <span class="ml-1">per page</span>
                                    </div>
                                    <div class="tbl-pagination">
                                        <ul class="page">
                                            <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                            <li class="page__numbers active"> 1</li>
                                            <li class="page__numbers">2</li>
                                            <li class="page__numbers">3</li>
                                            <li class="page__dots">...</li>
                                            <li class="page__numbers"> 10</li>
                                            <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                       
                        <div class="">
                            <section class="triangle d-flex-center">
                               
                                <h4 id="list-item-4" class="skel-grid-heading-section pl-1">Invoice</h4>
                                    
                            </section>
                        </div>
                        <div class="col-md-12 card-box m-0 ">
                            <div class="card">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                               
                                                <th id="ticketId">
                                                    <div class="skel-dyn-header-label">
                                                        <span>Invoice No</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1">
                                                                            <input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Customer No</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1">
                                                                            <input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Customer Name</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>Biilable Referance Number</th>
                                                <th>Invoice Start Date</th>
                                                <th>Invoice End Date</th>
                                                <th>Invoice Date  </th>
                                                <th>Due Date  </th>
                                                <th>Invoice Amount </th>
                                                <th>Invoice O/S Amount</th>

                                                <th>Invoice status </th>
                                                <th>Invoice PDF </th>
                                                <th>Usage</th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>

                                                <td><a href="account-invoice-detail.html" class="link-btn btn waves-effect waves-light btn-primary"> 441536</a></td>
                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001</td>
                                                <td>1-Sep-2021</td>
                                                <td>30-Sep-2021</td>
                                                <td>1-Oct-2021</td>
                                                <td>31-Oct-2021</td>
                                                <td>$280.00</td>
                                                <td>$280.00</td>
                                                <td>open</td>
                                                <td><button type="button" class="skel-btn-submit" onclick="window.open('invoice.pdf')">Bill </button></td>
                                                <td><a href="account-billed-usage.html" class="skel-btn-submit"> Billed Usage</a></td>

                                            </tr>
                                            <tr>
                                                <td><a href="account-invoice-detail.html" class="link-btn btn waves-effect waves-light btn-primary"> 254896</a></td>
                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001</td>
                                                <td>1-Aug-2021</td>
                                                <td>31-Aug-2021</td>
                                                <td>1-Sep-2021</td>
                                                <td>30-Sep-2021</td>
                                                <td>$75.00</td>
                                                <td>$150.00</td>
                                                <td>open</td>

                                                <td><button type="button" class="skel-btn-submit" onclick="window.open('invoice.pdf')">Bill </button></td>
                                                <td><a href="account-billed-usage.html" class="skel-btn-submit"> Billed Usage</a></td>

                                            </tr>
                                            <tr>

                                                <td><a href="account-invoice-detail.html" class="link-btn btn waves-effect waves-light btn-primary"> 651842</a></td>
                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001</td>
                                                <td>1-July-2021</td>
                                                <td>31-July-2021</td>
                                                <td>1-Aug-2021</td>
                                                <td>30-Aug-2021</td>
                                                <td>$60.00</td>
                                                <td>$120.00</td>
                                                <td>open</td>

                                                <td><button type="button" class="skel-btn-submit" onclick="window.open('invoice.pdf')">Bill </button></td>
                                                <td><a href="account-billed-usage.html" class="skel-btn-submit"> Billed Usage</a></td>

                                            </tr>
                                            <tr>

                                                <td><a href="account-invoice-detail.html" class="link-btn btn waves-effect waves-light btn-primary"> 356715</a></td>
                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001</td>
                                                <td>1-Jun-2021</td>
                                                <td>30-Jun-2021</td>
                                                <td>1-Jul-2021</td>
                                                <td>31-Jul-2021</td>
                                                <td>$85.00</td>
                                                <td>$140.00</td>
                                                <td>Closed</td>

                                                <td><button type="button" class="skel-btn-submit" onclick="window.open('invoice.pdf')">Bill </button></td>
                                                <td><a href="account-billed-usage.html" class="skel-btn-submit"> Billed Usage</a></td>

                                            </tr>

                                        </tbody>
                                    </table>
                                    
                                </div>
                                <div class="table-footer-info">
                                    <div class="select-cus">
                                        <span>Showing 1 to 10 of 1 entries</span>
                                        <select class="custom-select custom-select-sm ml-1">
                                            <option value="10">10 Rows</option>
                                            <option value="20">20 Rows</option>
                                            <option value="30">30 Rows</option>
                                            <option value="40">40 Rows</option>
                                            <option value="50">50 Rows</option>
                                        </select>
                                        <span class="ml-1">per page</span>
                                    </div>
                                    <div class="tbl-pagination">
                                        <ul class="page">
                                            <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                            <li class="page__numbers active"> 1</li>
                                            <li class="page__numbers">2</li>
                                            <li class="page__numbers">3</li>
                                            <li class="page__dots">...</li>
                                            <li class="page__numbers"> 10</li>
                                            <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                           
                        </div>
                       
                        <div class="">
                            <section class="triangle">
                                
                                <h4 id="list-item-5" class="skel-grid-heading-section pl-1">Payment History</h4>
                                    
                            </section>
                        </div>
                        <div class="col-md-12 card-box m-0 ">
                            <div class="card">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Payment ID</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Customer Number</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Customer Name</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Biilable Referance Number</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Payment Date</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Currency</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>Amount Paid </th>
                                                <th>Payment Captured By  </th>
                                                <th>Payment Mode   </th>
                                                <th>Reference Number </th>

                                                <th>Reference Date  </th>
                                                <th>Referance Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>

                                                <td>7135888565</td>
                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001</td>
                                                <td>30-Aug-2021</td>
                                                <td>USD </td>
                                                <td>$100.00</td>
                                                <td>Mohamed</td>
                                                <td>Card</td>
                                                <td>Card No (5733 **** **** **** 1234)</td>

                                                <td>25-10-25</td>
                                                <td>master</td>
                                            </tr>
                                            <tr>

                                                <td>9635888565</td>
                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001</td>
                                                <td>30-June-2021</td>
                                                <td>USD </td>
                                                <td>$150.00</td>
                                                <td>Mohamed</td>
                                                <td>Card</td>
                                                <td>Card No (5628 **** **** **** 6541)</td>

                                                <td>30-12-25</td>
                                                <td>Visa</td>
                                            </tr>
                                            <tr>

                                                <td>2585888565</td>
                                                <td>713586</td>
                                                <td>Maboob Basha Abdul Kadhar</td>
                                                <td>100001</td>
                                                <td>30-May-2021</td>
                                                <td>USD </td>
                                                <td>$150.00</td>
                                                <td>Mohamed</td>
                                                <td>Cheque</td>
                                                <td>Cheque No (5687 **** **** **** 0147)</td>

                                                <td>30-12-25</td>
                                                <td>HSBC</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                
                            </div>
                            <div class="table-footer-info">
                                <div class="select-cus">
                                    <span>Showing 1 to 10 of 1 entries</span>
                                    <select class="custom-select custom-select-sm ml-1">
                                        <option value="10">10 Rows</option>
                                        <option value="20">20 Rows</option>
                                        <option value="30">30 Rows</option>
                                        <option value="40">40 Rows</option>
                                        <option value="50">50 Rows</option>
                                    </select>
                                    <span class="ml-1">per page</span>
                                </div>
                                <div class="tbl-pagination">
                                    <ul class="page">
                                        <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                        <li class="page__numbers active"> 1</li>
                                        <li class="page__numbers">2</li>
                                        <li class="page__numbers">3</li>
                                        <li class="page__dots">...</li>
                                        <li class="page__numbers"> 10</li>
                                        <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                    </ul>
                                </div>
                            </div>
                           
                        </div>
                       

                        <div class="">
                            <section class="triangle row d-flex-center" id="#adjus-history">
                                
                                    <div class="col-10">
                                    <h4 id="list-item-6" class="skel-grid-heading-section pl-1">Adjusment History</h4>
                                    </div>
                                    <div class="col-2 adjus-btn"><button type="button" data-toggle="modal" data-target="#cr-adjus" class="skel-btn-submit">Create Adjustment</button></div>
                                
                            </section>
                        </div>
                        <div class="col-md-12 card-box m-0 ">
                            <div class="card">
                                <div class="data-scroll1">
                                    <table class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>

                                                <th id="ticketId">
                                                    <div class="skel-dyn-header-label">
                                                        <span>Adjustment Number</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Adjustment Period</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    
                                                    <div class="skel-dyn-header-label">
                                                        <span>Adjustment Category</span>
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Adjustment Type</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Billable Referance Number</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                    
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div class="skel-dyn-header-label">
                                                        <span>Contract ID</span>
                                                    
                                                        <span class="float-right">
                                                            <ul class="mb-0">
                                                                <li class="dropdown notification-list topbar-dropdown">
                                                                    <a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                                                                        <i class="mdi mdi-filter-menu-outline"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-xs dropdown-bottom" x-placement="bottom-end" >
                                                                        <span>Filter</span>
                                                                        <select class="form-control input-xs mt-1" id="example-select">
                                                                            <option>contains</option>
                                                                            <option>does not contain</option>
                                                                            <option>&lt;</option>
                                                                            <option>≤</option>
                                                                            <option>&gt;</option>
                                                                            <option>≥</option>
                                                                        </select>
                                                                        <span class="mt-1"><input type="text" id="example-input-small" name="example-input-small" class="form-control form-control-sm mt-1" placeholder="" /></span>
                                                                        
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Search
                                                                        </a>
                                                                        <a href="javascript:void(0);" class="dropdown-item text-center text-primary notify-item notify-all">
                                                                            Clear
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </th>

                                                <th>Total Adjustment Amount</th>
                                                <th>Status </th>
                                                <th>Reason </th>
                                                <th>Remarks  </th>
                                                <th>Modified By </th>
                                                <th>Modified On  </th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>

                                                <td><button type="button" onClick={handleShowAdjustmentHistroy} class="link-btn btn btn-primary btn-sm waves-effect waves-light">441536</button></td>
                                                <td>21-Aug-2021</td>
                                                <td>Prebill</td>
                                                <td>Credit</td>
                                                <td>100001</td>
                                                <td>136547</td>

                                                <td>$50.00</td>
                                                <td>Approved</td>
                                                <td>System/Machine related</td>
                                                <td>Customer Service</td>
                                                <td>Abdul</td>
                                                <td>10/10/2021 07:29:46 </td>
                                            </tr>
                                                
                                            <tr>

                                                <td><button type="button" data-toggle="modal" data-target="#adjusment" class="link-btn btn btn-primary btn-sm waves-effect waves-light">258536</button></td>
                                                <td>10-sep-2021</td>
                                                <td>postbill</td>
                                                <td>Debit</td>
                                                <td>100001</td>
                                                <td>856547</td>

                                                <td>$30.00</td>
                                                <td>Approved</td>
                                                <td>System/Machine related</td>
                                                <td>Customer Service</td>
                                                <td>Abdul</td>
                                                <td>18/09/2021 04:55:20 </td>

                                                
                                            </tr>
                                            <tr>
                                                <td><button type="button" data-toggle="modal" data-target="#adjusment" class="link-btn btn btn-primary btn-sm waves-effect waves-light">261736</button></td>
                                                <td>12-Oct-2021</td>
                                                <td>Prebill</td>
                                                <td>Credit</td>
                                                <td>100001</td>
                                                <td>105647</td>

                                                <td>$25.00</td>
                                                <td>Approved</td>
                                                <td>System/Machine related</td>
                                                <td>Customer Service</td>
                                                <td>Mohamed</td>
                                                <td>25/09/2021 10:45:12 </td>

                                               
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                
                            </div>
                            <div class="table-footer-info">
                                <div class="select-cus">
                                    <span>Showing 1 to 10 of 1 entries</span>
                                    <select class="custom-select custom-select-sm ml-1">
                                        <option value="10">10 Rows</option>
                                        <option value="20">20 Rows</option>
                                        <option value="30">30 Rows</option>
                                        <option value="40">40 Rows</option>
                                        <option value="50">50 Rows</option>
                                    </select>
                                    <span class="ml-1">per page</span>
                                </div>
                                <div class="tbl-pagination">
                                    <ul class="page">
                                        <li class="page__btn"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i></li>
                                        <li class="page__numbers active"> 1</li>
                                        <li class="page__numbers">2</li>
                                        <li class="page__numbers">3</li>
                                        <li class="page__dots">...</li>
                                        <li class="page__numbers"> 10</li>
                                        <li class="page__btn"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i></li>
                                    </ul>
                                </div>
                            </div>
                           
                        </div>
                        
                    </div>
                    
                </div>
               
            </div>
        </>
    )

}

export default SearchAR