import React from 'react';
import entityImg from '../assets/images/entity.png'
import parameterImg from '../assets/images/parameter-img.png'
import slaImg from '../assets/images/sla.png'
import usermanagementImg from '../assets/images/usermanagement.png'
import workflowImg from '../assets/images/workflow.png'
import serviceMapping from '../assets/images/service-mapping.png'

const AdminDashboard = () => {
    return (
        <>
            <div className="row p-0">
                <div className="col p-0">
                    <div>
                        <div className="card-body">
                            <div className="col-xl-6 ">
                                <div className="card-box admin-dash">


                                    <ul className="nav nav-tabs">
                                        <li className="nav-item">
                                            <a href="#home1" data-toggle="tab" aria-expanded="false" className="nav-link">
                                                Masters
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#profile1" data-toggle="tab" aria-expanded="true" className="nav-link active">
                                                Statistics / Reports
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#messages1" data-toggle="tab" aria-expanded="false" className="nav-link">
                                                Portal Settings
                                            </a>
                                        </li>

                                    </ul>
                                    <div className="tab-content">
                                        <div className="tab-pane" id="home1">
                                            <div className="col-md-12 p-lg-1">
                                                <div className="row col-12 d-flex justify-content-around">
                                                    <div className="d-flex justify-content-around col">
                                                        <a className="dropdown-icon-item" >
                                                            <img src={entityImg} alt="entity" />
                                                            <span>Entity</span>
                                                        </a>
                                                    </div>
                                                    <div className="d-flex justify-content-around col">
                                                        <a className="dropdown-icon-item" >
                                                            <img src={workflowImg} alt="workflow" />
                                                            <span>Workflow</span>
                                                        </a>
                                                    </div>
                                                    <div className="d-flex justify-content-around col">
                                                        <a className="dropdown-icon-item" >
                                                            <img src={slaImg} alt="SLA" />
                                                            <span>SLA</span>
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="row col-12 d-flex justify-content-around pt-4 pb-2">
                                                    <div className="col d-flex justify-content-around ">
                                                        <a className="dropdown-icon-item" >
                                                            <img src={serviceMapping} alt="Service" />
                                                            <span>Service Mapping</span>
                                                        </a>
                                                    </div>
                                                    <div className="col d-flex justify-content-around ">
                                                        <a className="dropdown-icon-item" >
                                                            <img src={parameterImg} alt="Parameters" />
                                                            <span>Business Parameters</span>
                                                        </a>
                                                    </div>
                                                    <div className="col d-flex justify-content-around ">
                                                        <a className="dropdown-icon-item" >
                                                            <img src={usermanagementImg} alt="User" />
                                                            <span>User Management</span>
                                                        </a>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                        <div className="tab-pane show active" id="profile1">
                                            <div className="row">
                                                <div className="col-xl-12">
                                                    <div className="row">
                                                        <div className="col-md-4 bottom-spc">
                                                            <div className="card border">
                                                                <div className="card-body">
                                                                    <div className="media">
                                                                        <div className="media-body overflow-hidden">
                                                                            <p className="text-truncate font-size-14 mb-2"><h4>User</h4></p>
                                                                            <a href="admin-users.html"><h2 className="mb-0">300</h2></a>
                                                                        </div>
                                                                        <div className="text-primary">
                                                                            <i className="far fa-user mr-1 noti-icon"></i>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="card-body border-top py-3">
                                                                    <div className="row">
                                                                        <div className="col-4">
                                                                            <div className="text-center">
                                                                                <a href="admin-new-users.html"> <p className="mb-2 text-truncate">New</p>
                                                                                    <h4 className="text-dark">8</h4></a>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-4">
                                                                            <div className="text-center">
                                                                                <p className="mb-2 text-truncate">Active</p>
                                                                                <h4 className="text-dark">280</h4>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-4">
                                                                            <div className="text-center">
                                                                                <p className="mb-2 text-truncate">Expired/Inactive</p>
                                                                                <h4 className="text-dark">12</h4>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4 bottom-spc">
                                                            <div className="card border">
                                                                <div className="card-body">
                                                                    <div className="media">
                                                                        <div className="media-body overflow-hidden">
                                                                            <p className="text-truncate font-size-14 mb-2"><h4>Organization</h4></p>
                                                                            <h3 className="mb-0">1</h3>
                                                                        </div>
                                                                        <div className="text-primary">
                                                                            <i className="far fa-building mr-1 noti-icon"></i>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="card-body border-top py-3">
                                                                    <div className="row">
                                                                        <div className="col-4">
                                                                            <div className="text-center">
                                                                                <p className="mb-2 text-truncate">OU</p>
                                                                                <h4 className="text-dark">2</h4>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-4">
                                                                            <div className="text-center">
                                                                                <p className="mb-2 text-truncate">Department</p>
                                                                                <h4 className="text-dark">12</h4>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-4">
                                                                            <div className="text-center">
                                                                                <p className="mb-2 text-truncate">Roles</p>
                                                                                <h4 className="text-dark">32</h4>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4 bottom-spc">
                                                            <div className="card border">
                                                                <div className="card-body">
                                                                    <div className="media">
                                                                        <div className="media-body overflow-hidden">
                                                                            <p className="text-truncate font-size-14 mb-2"><h4>Admin Request - This Month</h4></p>
                                                                            <h3 className="mb-0">37</h3>
                                                                        </div>
                                                                        <div className="text-primary">
                                                                            <i className="fas fa-code-branch mr-1 noti-icon"></i>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="card-body border-top py-3">
                                                                    <div className="row">
                                                                        <div className="col-4">
                                                                            <div className="text-center">
                                                                                <p className="mb-2 text-truncate">Open</p>
                                                                                <h4>12</h4>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-4">
                                                                            <div className="text-center">
                                                                                <p className="mb-2 text-truncate">In Progress</p>
                                                                                <h4>6</h4>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-4">
                                                                            <div className="text-center">
                                                                                <p className="mb-2 text-truncate">Completed</p>
                                                                                <h4>46</h4>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>


                                                    </div>
                                                    <div className="row pt-2">
                                                        <div className="col">
                                                            <div className="card border">
                                                                <div className="card-body">

                                                                    <h4 className="header-title">Reports</h4>
                                                                    <div className="row mt-4 text-center">


                                                                    </div>
                                                                    <div className="mt-1">
                                                                        <div className="pl-4">
                                                                            <div className="row pt-2">
                                                                                <div className="col">
                                                                                    <a className="dropdown-icon-item" >
                                                                                        <img src="./assets/images/agent.png" alt="Agent" />
                                                                                        <span>Agent Activity</span>
                                                                                    </a>
                                                                                </div>
                                                                                <div className="col">
                                                                                    <a className="dropdown-icon-item" >
                                                                                        <img src="./assets/images/call-abondon.png" alt="call abondon" />
                                                                                        <span>Call Abandon</span>
                                                                                    </a>
                                                                                </div>
                                                                                <div className="col">
                                                                                    <a className="dropdown-icon-item" >
                                                                                        <img src="./assets/images/leads.png" alt="leads"/>
                                                                                        <span>Leads</span>
                                                                                    </a>
                                                                                </div>
                                                                            </div>

                                                                            <div className="row pt-4">
                                                                                <div className="col">
                                                                                    <a className="dropdown-icon-item" >
                                                                                        <img src="./assets/images/sales.png" alt="sales" />
                                                                                        <span>Sales</span>
                                                                                    </a>
                                                                                </div>
                                                                                <div className="col">
                                                                                    <a className="dropdown-icon-item" >
                                                                                        <img src="./assets/images/complaints.png" alt="compliaints" />
                                                                                        <span>Complaints</span>
                                                                                    </a>
                                                                                </div>
                                                                                <div className="col">
                                                                                    <a className="dropdown-icon-item" >
                                                                                        <img src="./assets/images/error.png" alt="errors" />
                                                                                        <span>Errors</span>
                                                                                    </a>
                                                                                </div>

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>)
}
export default AdminDashboard;