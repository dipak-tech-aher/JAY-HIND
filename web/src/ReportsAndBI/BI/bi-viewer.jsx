import React, { useEffect, useState, useContext } from 'react'
import { properties } from "../../properties";
import { get } from "../../common/util/restUtil";

import { AppContext } from '../../AppContext';
import { toast } from 'react-toastify';

const BIViewer = (props) => {
    const { auth } = useContext(AppContext)

    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [token, setToken] = useState();

    useEffect(() => {

        const src1 = document.getElementById("ejblapi")

        let script1

        if (!src1) {
            script1 = document.createElement('script');
            script1.id = "ejblapi"
            script1.src = "/smarten/js/EJBIapi.js";
            script1.async = false;
            document.body.appendChild(script1);
            setScriptLoaded(true)
        }
        return () => {
            if (script1) {
                document.body.removeChild(script1);
                setScriptLoaded(false)
            }
        }
    }, []);

    useEffect(() => {
        if (scriptLoaded && (!token || token === '') && auth?.user?.biAccess === "Y")
            
        get(`${properties.SMARTENBI_API}/token/${auth.user.biAccessKey}`)
            .then((response) => {
                setToken(response.data.token)
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()

    }, [scriptLoaded]);

    useEffect(()=>{
        if(auth?.user?.biAccess === "N"){
            toast.error("You Do Not have Access Permission for BI")
            return
        }
    },[auth])

    return (
        (scriptLoaded && token && token !== '') ?
            <iframe src={'/smarten/API/getObject?tokenid=' + token} scrolling="yes" frameBorder="0" style={{ width: "100%", height: "600px" }} />
            :
            <>Please wait..., loading the dashboard...</>
    )

};

export default BIViewer