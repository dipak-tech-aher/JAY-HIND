import React from "react";

const SideBarMenu = () => {
    return (
        <div className="sidebar-menu">

            <div className="menus-col">
                <div className="chat-menus">
                    <ul>
                        <li>
                            <a href="index.html" className="chat-unread blue">
                                <span className="material-icons">message</span>
                                <span>Chats</span>
                            </a>
                        </li>


                        <li>
                            <a href="audio-call.html" className="chat-unread">
                                <span className="material-icons">call</span>
                                <span>Calls</span>
                            </a>
                        </li>
                        <li>
                            <a href="settings.html" className="chat-unread">
                                <span className="material-icons">settings</span>
                                <span>Settings</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="bottom-menus">
                    <ul>


                        {/* <li>
                            <a  id="dark-mode-toggle" className="dark-mode-toggle">
                                <i className="far fa-moon"></i>
                            </a>
                        </li> */}
                        <li>
                            <a  className="chat-profile-icon" data-bs-toggle="dropdown">
                                <img src="assets/img/avatar/avatar-2.jpg" alt="" />
                            </a>
                            <div className="dropdown-menu dropdown-menu-end bg-white">
                                <a  className="dropdown-item dream_profile_menu">Edit Profile <span className="edit-profile-icon"><i className="fas fa-edit"></i></span></a>


                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
export default SideBarMenu