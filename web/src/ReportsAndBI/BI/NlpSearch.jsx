import React, { useEffect, useState } from 'react'

import { properties } from '../../properties';
import { get } from '../../common/util/restUtil';
// import EJBIapi from './EJBIapi'
const NlpSearch = () => {

    const [token, setToken] = useState();
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const query = 'w'
    const url = "/smarten"
    const dsId = "1815b85974f.dtst"
    const contextUrl  = "/smarten"

    useEffect(() => {
        
        get(properties.SMARTENBI_API + '/token')
            .then((response) => {
                setToken(response.data.token)
             //   submitQuery()
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }, []);

    useEffect(()=>{
        console.log('scriptLoaded', scriptLoaded, token!=='')
        if(!scriptLoaded && token && token!==''){
            console.log('Load', window)
            loadScript('/smarten/js/EJBIapi.js','ejblapi')
        }
    },[token])

    useEffect(()=>{
        if (scriptLoaded && (token || token !== '')){
            NLPobjectType()
        }
    },[scriptLoaded])

    const loadScript = (src,id) => {
        return new Promise(function(resolve, reject) {
          const s = document.createElement('script');
          let r = false;
          s.type = 'text/javascript';
          s.id = id
          s.src = src;
          s.async = false;
          s.onerror = function(err) {
            reject(err, s);
          };
          s.onload = s.onreadystatechange = function() {
            if (!r && (!this.readyState || this.readyState === 'complete')) {
              r = true;
              resolve();
            }
          }
          const t = document.body.appendChild(s);
          setScriptLoaded(true)
        });
      }

    const NLPobjectType = () => {
        const requestBody = {
            url: url,
            objectid: dsId,
            tokenid: token,
            type: "autocomplete",
            containerid: "queryBox",
          //  autoHeight: true,
            width: "100%",
            height: "100%",
            query: query,
            submitFunction: submitQuery,
            selectdataset: true
        }
        try {
           // eslint-disable-next-line no-undef
           new EJBIapi(requestBody).loadTypeAhed()

        } catch (error) {
            console.error(error)

        }
    }

    const  submitQuery = (dsId, query) =>{
        const prequest={
                url : url,
                    objectid : dsId,
                    username : "API",
                    password : "Api@123",
                    type : "object",
                    containerid : "nlpcontentid",
                    autoHeight: true,
                    width : "100%",
                    height : "100%",
                    rightpane:false,
                    query : query
                }
                // eslint-disable-next-line no-undef
                new EJBIapi(prequest).loadNLPObject();
        } 

    return (
        <>
            <div id="nlpcontent">
                {/* <input type= "text" value={contextUrl}/> */}
                <div>
                    <div id="queryBox" >
                    </div>
                </div>
                <div id="nlpcontentid">
                </div>

            </div>
        </>
    )
}
export default NlpSearch;