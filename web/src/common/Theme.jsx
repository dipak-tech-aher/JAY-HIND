import React, { useState, useEffect, useContext } from 'react';
import customtheme from '../common/themes.json'
import { properties } from '../properties';
import { get } from "../common/util/restUtil";
import { AppContext } from "../AppContext";
import { isEmpty } from 'lodash';

const Theme = ({ children }) => {

    const [theme, settheme] = useState({});
    // const [appsConfig, setAppsConfig] = useState({})
    const { appConfig  } = useContext(AppContext);

    useEffect(() => {
        if (!isEmpty(appConfig)) {
            // setAppsConfig(appConfig)
            settheme({
                // '--skel-custom-submit-btn': appConfig?.appButtonColor,
                // '--skel-custom-submit-btn-hover': appConfig?.appButtonColor,
                '--skel-navBar-custom-color': appConfig?.appBarColor,
                '--primaryColor': appConfig?.appButtonColor
            })
        } else {
            get(properties.MASTER_API + '/get-app-config')
                .then((resp) => {
                    if (resp?.status === 200) {
                        // setAppsConfig(resp?.data)
                        settheme({
                            // '--skel-custom-submit-btn': resp?.data.appButtonColor,
                            // '--skel-custom-submit-btn-hover': resp?.data.appButtonColor,
                            '--skel-navBar-custom-color': resp?.data?.appBarColor,
                            '--primaryColor': resp?.data?.appButtonColor
                        })
                        sessionStorage.setItem("appConfig", JSON.stringify(resp?.data));
                    }
                }).catch((error) => { console.log(error) })
                .finally()
        }
    }, [])

    // useEffect(() => {
    //     
    //     get(properties.THEME_API + "?name=bcae").then((resp) => {
    //         if (resp.data) {
    //             settheme(resp.data.config);
    //         } else {
    //             settheme({ ...customtheme });
    //         }
    //     })
    //     .catch((error) => {
    //         console.error(error)
    //     })
    //     .finally()
    // }, []);

    // console.log('theme', theme)

    return (
        <div  style={{ ...theme }} >
            {children}
        </div>
    );
}

export default Theme;

