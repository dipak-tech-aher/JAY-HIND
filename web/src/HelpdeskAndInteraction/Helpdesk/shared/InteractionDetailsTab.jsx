import React from 'react';

const InteractionDetailsTab = () => {
    return (
        <div className="card-body">
            <div className="desk-form clearfix">
                <div className="col-12 pl-2 row">
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="customerTitle" className="col-form-label">Source </label>
                            <p>Live Chat</p>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="customerTitle" className="col-form-label">Source Reference</label>
                            <p>73233998</p>
                        </div>
                    </div>
                </div>
                <div className="col-12 pl-2 row" id="account-details-no1">
                    <div className="col-12 row">
                        <div className="col-6">
                            <div className="form-label">Profile Number :</div>
                            <div className="form-vtext">223451</div>
                        </div>
                        <div className="col-6">
                            <div className="form-label">Full Name :</div>
                            <div className="form-vtext">‪Mahaboob Basha</div>
                        </div>
                    </div>
                    <div className="col-12 row pt-1">
                        <div className="col-6">
                            <div className="form-label">Customer Type :</div>
                            <div className="form-vtext">Business</div>
                        </div>
                        <div className="col-6">
                            <div className="form-label">Contact Number :</div>
                            <div className="form-vtext">72358421</div>
                        </div>
                    </div>
                    <div className="col-12 row pt-1">
                        <div className="col-6">
                            <div className="form-label">Email :</div>
                            <div className="form-vtext">bash@comquest.com</div>
                        </div>
                        <div className="col-6">
                            <div className="form-label">Contact Preference :</div>
                            <div className="form-vtext">Phone</div>
                        </div>
                    </div>
                    <div className="col-12 row pt-1 pb-2">
                        <div className="col-6">
                            <div className="form-label">ID Type:</div>
                            <div className="form-vtext">Passport</div>
                        </div>
                        <div className="col-6">
                            <div className="form-label">ID Value :</div>
                            <div className="form-vtext">SSA1823477</div>
                        </div>
                    </div>
                    <div className="col-12 text-center mt-2">
                        <section className="triangle">
                            <div className="row col-12 pr-0">
                                <div className="col-6 text-left">
                                    <h4 id="list-item-0" className="pl-2">Interaction History</h4>
                                </div>
                            </div>
                        </section>
                        <table role="table" className="table table-responsive table-striped dt-responsive nowrap w-100" >
                            <thead>
                                <tr role="row">
                                    <th colspan="1" role="columnheader">
                                        <div>Interaction ID</div>
                                    </th>
                                    <th>Interaction Type</th>
                                    <th>Customer Name</th>
                                    <th>Problem Type</th>
                                    <th>Status</th>
                                    <th>
                                        Created On
                                    </th>
                                    <th>Closed On</th>
                                </tr>
                            </thead>
                            <tbody role="rowgroup">
                                <tr role="row">
                                    <td>
                                        <span className="text-primary cursor-pointer">
                                            <a >1234261</a>
                                        </span>
                                    </td>
                                    <td>Alagu</td>
                                    <td>Fault Report</td>
                                    <td>8764261</td>
                                    <td>Closed</td>
                                    <td>10/11/2021</td>
                                    <td>13/11/2021</td>
                                </tr>
                                <tr role="row">
                                    <td>
                                        <span className="text-primary cursor-pointer">
                                            <a >1234261</a>
                                        </span>
                                    </td>
                                    <td>Alagu</td>
                                    <td>Fault Report</td>
                                    <td>8764261</td>
                                    <td>Closed</td>
                                    <td>10/11/2021</td>
                                    <td>13/11/2021</td>
                                </tr>
                                <tr role="row">
                                    <td>
                                        <span className="text-primary cursor-pointer">
                                            <a >1234261</a>
                                        </span>
                                    </td>
                                    <td>Alagu</td>
                                    <td>Fault Report</td>
                                    <td>8764261</td>
                                    <td>Closed</td>
                                    <td>10/11/2021</td>
                                    <td>13/11/2021</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="col-12 row pl-2 pt-2">
                    <div className="row col-12">
                        <div className="col-3 form-label">Subject :</div>
                        <div className="col-9 form-vtext">Name Server Issue for Acme.com</div>
                    </div>
                    <div className="col-12 row pt-2">
                        <div className="col-3 form-label">Issue Details :</div>
                        <div className="col-9 form-vtext">Hi our domain name acme.com website hosted in VPN Server under provided our control panel, we changed given DNS, but website not working and shows balnk page.</div>
                    </div>
                    <div className="col-12 row pt-2">
                        <div className="col-3 form-vtext">Domain :</div>
                        <div className="col-9 form-vtext">Acme.com</div>
                    </div>
                    <div className="col-12 row pt-2">
                        <div className="col-3 form-vtext">Attachment</div>
                        <div className="col-9 form-vtext">
                            <div className="card mb-1 shadow-none border">
                                <div className="p-2">
                                    <div className="row align-items-center">
                                        <div className="col-auto">
                                            <div className="avatar-sm">
                                                <span className="avatar-title badge-soft-primary text-primary rounded">
                                                    pdf
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col pl-0">
                                            <a  className="text-muted font-weight-bold">Error Screenshot.pdf</a>
                                            <p className="mb-0 font-12">1.3 MB</p>
                                        </div>
                                        <div className="col-auto">
                                            <a  className="btn btn-link font-16 text-muted">
                                                <i className="dripicons-download"></i>
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
    )
}

export default InteractionDetailsTab;