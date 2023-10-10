import { useTranslation } from "react-i18next";
import React, { useEffect } from 'react';

const UserLevelPermission = (props) => {
    const { t } = useTranslation();
    const permissionMasterData = props.permissionMasterData

    useEffect(() => {

    }, [permissionMasterData])


    const isActiveParent = (id, element) => {
        if (element.target.className === "active") {
            element.target.className = "";
            element.target.nextSibling.classList.remove("active");

        } else {
            element.target.className = "active";
            element.target.nextSibling.classList.add("active");
        }
    }
    const choosePermission = (parentKey, childKey, permission) => {
        props.cPermission(parentKey, childKey, permission);
    }
    return (
        <>
                                              
            {/* New Design
             <div className="tabbable-responsive">
                <div className="tabbable">
                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item">
                            <a className="nav-link active" id="first-tab" data-toggle="tab" href="#account" role="tab" aria-controls="first" aria-selected="true">Account</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" id="second-tab" data-toggle="tab" href="#admin" role="tab" aria-controls="second" aria-selected="false">Admin</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" id="third-tab" data-toggle="tab" href="#customer" role="tab" aria-controls="third" aria-selected="false">Customer</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" id="fourth-tab" data-toggle="tab" href="#dashboard" role="tab" aria-controls="fourth" aria-selected="false">Dashboard</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" id="fifth-tab" data-toggle="tab" href="#financial" role="tab" aria-controls="fifth" aria-selected="false">Financial</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" id="sixth-tab" data-toggle="tab" href="#helpdesk" role="tab" aria-controls="six" aria-selected="false">Helpdesk 360</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" id="seventh-tab" data-toggle="tab" href="#mis" role="tab" aria-controls="seven" aria-selected="false">MIS</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" id="eight-tab" data-toggle="tab" href="#products" role="tab" aria-controls="eight" aria-selected="false">Products</a>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <div className="tab-content">
                        <div className="tab-pane fade skel-tabs-role show active" id="account" role="tabpanel" aria-labelledby="first-tab">
                            <span>Account</span>
                            <ul className="userLevelChild active" id="mas1">
                                <li className="parent_li">
                                    <span title="Collapse this branch">Search Account</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>   
                        <div className="tab-pane fade skel-tabs-role" id="admin" role="tabpanel" aria-labelledby="second-tab">
                            <span>Admin</span>
                            <ul className="userLevelChild active" id="mas2">
                                <li className="parent_li"><span title="Collapse this branch">User Management</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Manage Parameters</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Role Management</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Manage Workflow</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Migration</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Portal Settings</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Template Management</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>    
                            </ul>
                            <span>Manage Paramenter</span>
                            <ul className="userLevelChild active" id="mas16">
                                <li className="parent_li"><span title="Collapse this branch">Create Parameter</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                            <span>Manage Workflow</span>
                            <ul className="userLevelChild active" id="mas17">
                                <li className="parent_li"><span title="Collapse this branch">Workflow</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Map Workflow</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                            <span>Migration</span>
                            <ul className="userLevelChild active" id="mas18">
                                <li className="parent_li"><span title="Collapse this branch">Search Migration</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Create Migration</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className="tab-pane fade skel-tabs-role" id="customer" role="tabpanel" aria-labelledby="third-tab">
                            <span>Customer</span>
                            <ul className="userLevelChild active" id="mas5">
                                <li className="parent_li"><span title="Collapse this branch">Search Customer</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Customer Eagle Eye View</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Create Customer</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className="tab-pane fade skel-tabs-role" id="dashboard" role="tabpanel" aria-labelledby="fourth-tab">
                            <span>Dashboard</span>
                            <ul className="userLevelChild active" id="mas7">
                                <li className="parent_li"><span title="Collapse this branch">Interaction Dashboard</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">WhatsApp Dashboard</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Appointment Dashboard</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Sales Dashboard</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Customer Engagement Dashboard</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className="tab-pane fade skel-tabs-role" id="financial" role="tabpanel" aria-labelledby="fifth-tab">
                            <span>Financial</span>
                            <ul className="userLevelChild active" id="mas9">
                                <li className="parent_li"><span title="Collapse this branch">Billing</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Invoice</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Contract</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                            <span>Billing</span>
                            <ul className="userLevelChild active" id="mas3">
                                <li className="parent_li"><span title="Collapse this branch">Bill Generation</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul
                                ></li>
                                <li className="parent_li"><span title="Collapse this branch">Bill History</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                            <span>Contract</span>
                            <ul className="userLevelChild active" id="mas4">
                                <li className="parent_li"><span title="Collapse this branch">Unbilled Search Contract</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Search Contract</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                            <span>Invoice</span>
                            <ul className="userLevelChild active" id="mas14">
                                <li className="parent_li"><span title="Collapse this branch">Search Invoice</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className="tab-pane fade skel-tabs-role" id="helpdesk" role="tabpanel" aria-labelledby="sixth-tab">
                            <span>Helpdesk 360</span>
                            <ul className="userLevelChild active" id="mas11">
                                <li className="parent_li"><span title="Collapse this branch">Quality Monitoring</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Helpdesk</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Create Interaction</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Manage Live chat</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                            <span>Helpdesk</span>
                            <ul className="userLevelChild active" id="mas10">
                                <li className="parent_li"><span title="Collapse this branch">Helpdesk Search</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Helpdesk Board</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                            <span>Manage Live Chat</span>
                            <ul className="userLevelChild active" id="mas15">
                                <li className="parent_li"><span title="Collapse this branch">Agent Chat View</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Agent Monitoring</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Agent Live Chat</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Chat Monitoring</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className="tab-pane fade skel-tabs-role" id="mis" role="tabpanel" aria-labelledby="seventh-tab">
                            <span>MIS</span>
                            <ul className="userLevelChild active" id="mas19">
                                <li className="parent_li"><span title="Collapse this branch">Sales Reports</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Helpdesk Reports</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Interaction Reports</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Customer Reports</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Finance Reports</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Product Reports</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className="tab-pane fade skel-tabs-role" id="products" role="tabpanel" aria-labelledby="eight-tab">
                            <span>Products</span>
                            <ul className="userLevelChild active" id="mas21">
                                <li className="parent_li"><span title="Collapse this branch">Search Product</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Create Product</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                                <li className="parent_li"><span title="Collapse this branch">Charges</span>
                                    <ul className="ui-choose">
                                        <li title="Allow" data-value="b" className="selected">Allow</li>
                                        <li title="Deny" data-value="c" className="ddd">Deny</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>                     
                    </div>
                </div>
            </div>     */}
                       
            <div className="user-block popup-box">

                <div className="row">
                    <div className="userLevelPermission">
                        <ul className="">
                            {permissionMasterData.length > 0 && permissionMasterData.map((masterData, i) => (
                                <li key={i} className="parent_li">
                                    <span onClick={(e) => isActiveParent(masterData.id, e)} title="Collapse this branch"><i className="feather icon-chevron-right"></i><i className=""></i>{masterData.label}</span>
                                    {masterData.item.length > 0 && (
                                        <ul className="userLevelChild" id={"mas" + masterData.id}>
                                            {masterData.item.map((permissionPage, j) => (
                                                <li key={j} className="parent_li">
                                                    <span title="Collapse this branch">{permissionPage.label}</span>
                                                    <ul className="ui-choose">
                                                        {/* <li onClick={() => choosePermission(i, j, 'read')} title="Read" data-value="a" className={(permissionPage.accessType === "read") ? "selected" : "rrr"}>Read</li> */}
                                                        <li onClick={() => choosePermission(i, j, 'allow')} title="Allow" data-value="b" className={(permissionPage.accessType === "allow") ? "selected" : "www"}>Allow</li>
                                                        <li onClick={() => choosePermission(i, j, 'deny')} title="Deny" data-value="c" className={(permissionPage.accessType === "deny") ? "selected" : "ddd"}>Deny</li>
                                                    </ul>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>                        
                    </div>                    
                </div>
            </div>
        </>
    )
}
export default UserLevelPermission;