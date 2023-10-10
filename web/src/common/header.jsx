import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";
import Notification from "./header/notification";
import ProfileNav from "./header/profileNav";
import UserRole from "./header/userRole";
import { Link } from "react-router-dom";
import QuickSearch from "./header/QuickSearch";
import MainMenu from "./mainMenu";
import { properties } from "../properties";
import { get } from "./util/restUtil";
import { isEmpty } from 'lodash';


const Header = (props) => {
  const { appsConfig } = props.data;
  const { auth } = useContext(AppContext);
  const menuCollapse = props?.data?.menuCollapse

  useEffect(() => {
    sessionStorage.setItem("appConfig", JSON.stringify(appsConfig));
  }, [])

  return (
    <div>
      {auth && auth.user ? (
        <>
          <div className="navbar-custom skel-custom-nav-bar">
            <div className="container-fluid">
              <div>
                <ul className="list-unstyled topnav-menu float-right mb-0">
                  <li><QuickSearch appsConfig={appsConfig} /></li>
                  <UserRole></UserRole>
                  <Notification></Notification>
                  <ProfileNav></ProfileNav>
                </ul>
              </div>
              <div className="logo-box">
                <Link to="/" className="logo logo-light text-center">
                  <span className="logo-lg">
                    {menuCollapse === false ? <img src={appsConfig?.appLogo} alt="" height="35" width="35" /> :
                      <img src={appsConfig?.appLogo} alt="" height="35" width="35" />}
                  </span>
                </Link>
              </div>
              <MainMenu appsConfig={appsConfig} />
              <div className="clearfix"></div>
            </div>
          </div >
        </>
      ) : (
        ""
      )}

    </div >
  );
};

export default Header;
