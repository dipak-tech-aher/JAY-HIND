import React, { useState, useContext, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import Header from '../header';
import { AppContext } from "../../AppContext";
import { history } from '../util/history';
import { properties } from "../../properties";
import { get } from "../util/restUtil";

const AppLayout = ({ isAuthenticated, children }) => {
    const { setAuth } = useContext(AppContext);
    const [menuCollapse, setMenuCollapse] = useState(true)
    const [clientFacingName, setClientFacingName] = useState(null)
    const [appsConfig, setAppsConfig] = useState([])
    const child = children?.props?.props

    // console.log('children===============================', child)
    const pathName = children.props.location.pathname
    const screenName = child?.screenName ? child?.screenName : children?.props?.children?.props?.props?.screenName
    const screenAction = child?.screenAction ? child?.screenAction : children?.props?.children?.props?.props?.screenAction
    // const previousPage = child.previousPage

    const isLogin = pathName.includes("user/login") || pathName.includes("user/faq")
        || pathName.includes("user/forgotpassword") || pathName.includes("user/change-password")
        || pathName.includes("user/register") ? true : false


    useEffect(() => {
        console.log('---------calling in applayout--------')
        get(properties.MASTER_API + '/get-app-config')
            .then((resp) => {
                if (resp?.status === 200) {
                    setAppsConfig(resp?.data)
                    if (resp?.data?.clientFacingName[screenName]) {
                        let lable = resp?.data?.clientFacingName[screenName]?.lable
                        setClientFacingName(lable || screenName)
                    }
                }
            }).catch((error) => { console.log(error) })
            .finally()
    }, [])

    useEffect(() => {
        if (appsConfig && appsConfig?.clientFacingName) {
            for (const key in appsConfig?.clientFacingName) {
                if (key === screenName) {
                    setClientFacingName(appsConfig?.clientFacingName[key]?.lable);
                    break;
                } else {
                    setClientFacingName(screenName);
                }
            }
        } else {
            setClientFacingName(screenName);
        }
    }, [child])

    return (
        <div id="wrapper" className="App">
            <ToastContainer hideProgressBar closeButton={false} style={{ zIndex: 99999 }} />
            {
                isAuthenticated &&
                <>
                    <Header
                        data={{
                            menuCollapse: menuCollapse,
                            appsConfig: appsConfig
                        }}
                        handler={{
                            setMenuCollapse: setMenuCollapse
                        }} />
                </>
            }
            <div className={isLogin === true ? '' : "menu-show"}>
                <div className={isLogin === true ? "" : "content-page"}>
                    <div className="content">
                        <div className="container-fluid">
                            {screenName && <div className="top-breadcrumb cmmn-skeleton">
                                <div className="lft-skel">
                                    <ul>
                                        <li><a href="" onClick={
                                            (e) => {
                                                e.preventDefault()
                                                history.goBack();
                                                //history.push(`${process.env.REACT_APP_BASE}/`)
                                            }}><i className="fas fa-arrow-left"></i> Back</a></li>
                                        <li>{clientFacingName} - {screenAction}</li>
                                        {/* <li>{screenName} - {screenAction}</li> */}
                                    </ul>
                                </div>
                            </div>}
                            {/* {children} */}
                            {React.cloneElement(children, { screenName, setClientFacingName, clientFacingName, appsConfig })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AppLayout;