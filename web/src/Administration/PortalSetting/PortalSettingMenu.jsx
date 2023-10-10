import React from 'react';
import APISETTING from "../../../src/assets/images/icons/api.png";
import LDAPSETTING from "../../../src/assets/images/icons/ldap.png";
import SMTP from "../../../src/assets/images/icons/smtp.png";
import SMSGATEWAY from "../../../src/assets/images/icons/sms.png";
import CHATADMIN from "../../../src/assets/images/icons/chat.png";
import BOTADMIN from "../../../src/assets/images/icons/bot.png";
import PAYMENTGATEWAY from "../../../src/assets/images/icons/payment.png";
import NOTIFICATION from "../../../src/assets/images/icons/notification.png";
import ALERT from "../../../src/assets/images/icons/alert.png";
import ERRORREPORT from "../../../src/assets/images/icons/error-report.png";
import QUALITYMONITORING from "../../../src/assets/images/icons/quality-control.png";
import { Link } from 'react-router-dom';
import CHANNELSETTINGS from "../../../src/assets/images/icons/channels.png";
import SLASETTINGS from "../../../src/assets/images/icons/automation.png";
import SERVICESTATUS from "../../../src/assets/images/icons/status.png";
import LOG from "../../../src/assets/images/icons/auditlog.png";

const PortalSettingMenu = () => {
    return (
        <div className="row p-0">
            <div className="card-body">
                <div className="card-box">
                    <h5>Portal Settings</h5>
                    <div className="row pt-2">
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/portal-settings/api-setting`}>
                                <img src={APISETTING} alt="API" />
                                <span>API Settings</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/portal-settings/add-ldap-settings`}>
                                <img src={LDAPSETTING} alt="LDAP" />
                                <span>LDAP Settings</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/portal-settings/smtp`}>
                                <img src={SMTP} alt="EMail" />
                                <span>SMTP</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/portal-settings/sms`}>
                                <img src={SMSGATEWAY} alt="SMS" />
                                <span>SMS Gateway</span>
                            </Link>
                        </div>
                    </div>

                    <div className="row pt-4">
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/chat`}>
                                <img src={CHATADMIN} alt="Payment" />
                                <span>Chat Admin</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/bot`}>
                                <img src={BOTADMIN} alt="Payment" />
                                <span>Bot Admin</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/payment`}>
                                <img src={PAYMENTGATEWAY} alt="Payment" />
                                <span>Payment Gateway</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/notification`}>
                                <img src={NOTIFICATION} alt="Notification" />
                                <span>Notification</span>
                            </Link>
                        </div>
                    </div>
                    <div className="row pt-4">
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/alerts`}>
                                <img src={ALERT} alt="Alert" />
                                <span>Alerts</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/error-report`}>
                                <img src={ERRORREPORT} alt="error report" />
                                <span>Error Reporting</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/portal-settings/email-sms-template`}>
                                <img src={NOTIFICATION} alt="Email Template" />
                                <span>Email / SMS Template</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={{ pathname: `${process.env.REACT_APP_BASE}/portal-settings/quality-monitoring/evaluation`, state: { source: 'EVALUATION' } }}>
                                <img src={QUALITYMONITORING} alt="Email Template" />
                                <span>Quality Monitoring</span>
                            </Link>
                        </div>
                    </div>
                    <div className="row pt-4">
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/portal-settings/channel-settings`}>
                                <img src={CHANNELSETTINGS} alt="Channel Settings" />
                                <span>Channels Settings</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/`}>
                                <img src={SLASETTINGS} alt="SLA Settings" />
                                <span>SLA Settings</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/portal-settings/service-status`}>
                                <img src={SERVICESTATUS} alt="Service Status" />
                                <span>Service Status</span>
                            </Link>
                        </div>
                        <div className="col-3">
                            <Link className="dropdown-icon-item" to={`${process.env.REACT_APP_BASE}/portal-settings/application-logs`}>
                                <img src={LOG} alt="Application Log" />
                                <span>Application Log</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PortalSettingMenu;