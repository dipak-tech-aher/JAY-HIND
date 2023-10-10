import React, { useState, useContext, useEffect } from "react";
import { AppContext, TemplateContext } from "../AppContext";
import { properties } from "../properties";
import { get, post } from "../common/util/restUtil";
import TemplatePng from "../assets/images/template-img.png";
import TemplateCategory from "./TemplateCategory";

const Templates = () => {
    let { auth, setAuth } = useContext(AppContext);

    const [templateObj, setTemplateObj] = useState({
        businessEntities: {},
        selectTCat: {}
    });

    const [leftCatClicked, setLeftCatClicked] = useState(Math.random());
    const [templateData, setTemplateData] = useState([])
    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=CURRENCY,CHARGE_FREQUENCY,CHARGE_CATEGORY,PRODUCT_BENEFIT,YES_NO,PROMO_TYPE,ORDER_TYPE,APPOINT_INTERVAL,TEMPLATE_CATEGORY,TEMPLATE_MAP_CATEGORY,SERVICE_TYPE,TEMPLATE_STATUS,USER_GROUP,APPOINT_TYPE,EVENT_TYPE,LOCATION').then((response) => {
            if (response.data) {
                get(properties.MASTER_API + '/calendar/search').then((resp) => {
                    get(properties.MASTER_API + '/template/get-terms-conditions').then((termsResp) => {
                        setTemplateObj({
                            ...templateObj,
                            businessEntities: {
                                templateCategories: response.data.TEMPLATE_CATEGORY?.sort((a, b) => a.mapping.order - b.mapping.order),
                                templateMapCategories: response.data.TEMPLATE_MAP_CATEGORY?.sort((a, b) => a.mapping.order - b.mapping.order),
                                serviceTypes: response.data.SERVICE_TYPE,
                                templateStatuses: response.data.TEMPLATE_STATUS,
                                userGroups: response.data.USER_GROUP,
                                appointmentTypes: response.data.APPOINT_TYPE,
                                eventTypes: response.data.EVENT_TYPE,
                                appointmentIntervals: response.data.APPOINT_INTERVAL,
                                locations: response.data.LOCATION,
                                orderTypes: response.data.ORDER_TYPE,
                                promoTypes: response.data.PROMO_TYPE,
                                yesNos: response.data.YES_NO,
                                benefits: response.data.PRODUCT_BENEFIT,
                                frequencyLookup: response.data.CHARGE_FREQUENCY,
                                termsAndConditionLookup: termsResp.data,
                                chargeTypes: response.data.CHARGE_CATEGORY,
                                currencies: response.data.CURRENCY,
                            },
                            selectedTCat: response.data.TEMPLATE_CATEGORY.find(x => x.mapping.default === true),
                            calendarList: resp.data
                        })
                    }).catch(error => console.log(error))
                }).catch(error => console.log(error))
            } else {
                setTemplateObj({ ...templateObj, businessEntities: {}, selectedTCat: {} })
            }
        }).catch(error => {
            setTemplateObj({ ...templateObj, businessEntities: {}, selectedTCat: {} })
            console.error(error);
        });
        post(properties.MASTER_API + '/template/search', {}).then((resp) => {
            if (resp.status === 200) {
                setTemplateData(resp.data)
            }
        }).catch(error => console.log(error));
    }, [])

    const selectTCat = (e) => {
        setLeftCatClicked(Math.random());
        setTemplateObj({
            ...templateObj,
            selectedTCat: templateObj.businessEntities.templateCategories.find(x => x.code === e.target.id)
        })
    }

    const getCount = (code) => {
        return templateData?.filter(x => x.templateCategory == code)?.length ?? 0;
    }

    const { selectedTCat, businessEntities: { templateCategories } } = templateObj;

    const contextProvider = {
        data: {
            templateObj,
            templateData,
            leftCatClicked
        },
        handlers: {
            setTemplateObj,
            setTemplateData
        }
    }

    return (
        <React.Fragment>
            <TemplateContext.Provider value={contextProvider}>
                <div className="container-fluid pr-1">
                    <div className="cnt-wrapper">
                        {/* New skeleton base */}
                        <div className="card-skeleton">
                            <div className="customer-skel">
                                <div className="cmmn-skeleton">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="skel-create-template-base">
                                                <img src={TemplatePng} alt="" className="img-fluid" />
                                                <ul>
                                                    {templateCategories?.length > 0 && templateCategories.map((tCat, index) => (
                                                        <li key={index}>
                                                            <a className={`${selectedTCat?.code === tCat.code ? 'skel-appt-active' : ''}`} onClick={selectTCat} id={tCat.code}>
                                                                <i onClick={selectTCat} id={tCat.code} className={`fas fa${selectedTCat?.code === tCat.code ? '-arrow' : '-arrow-circle'}-right`}></i>&nbsp;{tCat.description} ({getCount(tCat.code)})
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="col-md-9">
                                            <TemplateCategory />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TemplateContext.Provider>
        </React.Fragment>
    )
}

export default Templates