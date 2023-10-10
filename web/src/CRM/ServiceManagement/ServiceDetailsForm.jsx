import { useState, useEffect } from "react"
import { toast } from "react-toastify";
import ReactSwitch from "react-switch";
import AssignSimLater from "react-switch";
import AddressDetailsFormView from "../Address/AddressDetailsFormView";
import { properties } from '../../properties';
import { get } from "../../common/util/restUtil";
// import AccessNumberList from "./accessNumberList";

import { validateNumber, handlePaste } from "../../common/util/validateUtil";
import { unstable_batchedUpdates } from "react-dom";
import AddProductModal from "./AddProductModal";
import SelectedCatalogCard from "./SelectedCatalogCard";
import SelectedPlanServiceAssetAddonCard from "./SelectedPlanServiceAssetAddonCard";

const ServiceDetailsForm = (props) => {

    const serviceTypeLookup = props?.lookups?.serviceTypeLookup

    const [validate, setValidate] = useState({
        excludeReason: true
    })
    const [imsiSpinner, setImsiSpinner] = useState(false)
    const fixedCatalog = ["Fixed"]
    const mobileCatalog = ["Postpaid", "Prepaid"]

    let serviceData = props.data.serviceData
    let installationAddress = props.data.installationAddress
    let fixedService = props.data.fixedService
    let mobileService = props.data.mobileService
    let gsm = props.data.gsm
    let deposit = props.data.deposit
    let creditProfile = props.data.creditProfile
    let payment = props.data.payment
    let portIn = props.data.portIn

    let setServiceData = props.handler.setServiceData
    let setInstallationAddress = props.handler.setInstallationAddress
    let setFixedService = props.handler.setFixedService
    let setMobileService = props.handler.setMobileService
    let setGSM = props.handler.setGSM
    let setDeposit = props.handler.setDeposit
    let setCreditProfile = props.handler.setCreditProfile
    let setPayment = props.handler.setPayment
    let setPortIn = props.handler.setPortIn
    
    const catalogLookup = props.lookups.catalogLookup
    const productLookup = props.lookups.productLookup
    const fixedBBServiceNumberLookup = props.lookups.fixedBBServiceNumberLookup
    const mobileServiceNumberLookup = props.lookups.mobileServiceNumberLookup
    const dealershipLookup = props.lookups.dealershipLookup
    const exchangeCodeLookup = props.lookups.exchangeCodeLookup
    const creditProfileLookup = props.lookups.creditProfileLookup
    const depositChargeLookup = props.lookups.depositChargeLookup
    const paymentMethodLookup = props.lookups.paymentMethodLookup

    const districtLookup = props.lookups.districtLookup
    const kampongLookup = props.lookups.kampongLookup
    const postCodeLookup = props.lookups.postCodeLookup

    const addressElements = props.lookups.addressElements

    const plansList = props.lookups.plansList

    const addressChangeHandler = props.lookupsHandler.addressChangeHandler
    const setProductLookup = props.lookupsHandler.setProductLookup
    const error = props.error
    const setError = props.setError

    const detailsValidate = props.data.detailsValidate
    const setDetailsValidate = props.handler.setDetailsValidate
    const [display, setDisplay] = useState(false)
    const [suggestion, setSuggestion] = useState(true)
    const [accessNumbers, setAccessNumbers] = useState([])
    let array = []
    let array2 = []
    let array3 = []
    let temp = []

    const source = props.data.source
    const countries = props.data.countries
    const locations = props.data.locations

    const selectedCatalog = props.data.selectedCatalog
    const selectedPlan = props.data.selectedPlan
    const selectedAssetList = props.data.selectedAssetList
    const selectedServiceList = props.data.selectedServiceList
    
    const setSelectedCatalog = props.handler.setSelectedCatalog
    const setSelectedPlan = props.handler.setSelectedPlan
    const setSelectedServiceList = props.handler.setSelectedServiceList
    const setSelectedAssetList = props.handler.setSelectedAssetList

    const [catalogList,setCatalogList] = useState([])
    const [planList,setPlanList] = useState([])
    const [serviceList,setServiceList] = useState([])
    const [assetList,setAssetList] = useState([])
    
    const [isAddProductOpen,setIsAddProductOpen] = useState(false)


    useEffect(() => {
        if(serviceData?.serviceType !== '' && serviceData?.serviceType !== undefined && serviceData?.serviceType !== null)
        {
            
            get(`${properties.CATALOGUE_API}/upgrade-downgrade/${serviceData?.serviceType}`)
            .then((response) => {
                if (response.data) {
                    unstable_batchedUpdates(() => {
                        setCatalogList(response.data)
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
             
            
            get(`${properties.PLANS_API}/upgrade-downgrade/${serviceData?.serviceType}`)
            .then((response) => {
                if (response.data) {
                    unstable_batchedUpdates(() => {
                        setPlanList(response.data)
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()

            
            get(`${properties.CATALOG_SERVICE_API}/upgrade-downgrade/${serviceData?.serviceType}`)
            .then((response) => {
                if (response.data) {
                    unstable_batchedUpdates(() => {
                        setServiceList(response.data.map((service) => ({...service,isSelected:'N'})))
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()

            
            get(`${properties.ASSET_API}/upgrade-downgrade/${serviceData?.serviceType}`)
            .then((response) => {
                if (response.data) {
                    unstable_batchedUpdates(() => {
                        setAssetList(response.data.map((asset) => ({...asset,isSelected:'N'})))
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
        }
        
    },[serviceData?.serviceType])

    const handleAddProductModal = () => {
        if(serviceData?.serviceType === '' || serviceData?.serviceType === undefined || serviceData?.serviceType === null) {
            toast.error('Please Select Service Type')
            return false
        }
        setIsAddProductOpen(true)
    }

    const resetData = () => {
        setServiceData({
            ...serviceData,
            serviceType: "",
            serviceTypeDesc: "",
            catalogs:"",
            plans: "",
            services:[],
            addons: [],
            assets: [],
            property1:"",
            property2:"",
            property3:"",
            // catalog: '',
            // catalogDesc: '',
            // product: '',
            // productDesc: '',
            // prodType: '',
            // serviceItems : []
        })
        setInstallationAddress({
            ...installationAddress,
            sameAsCustomerAddress: true,
            flatHouseUnitNo: '',
            building: '',
            street: '',
            district: '',
            state: '',
            cityTown: '',
            country: '',
            postCode: ''
        })
        setFixedService({
            ...fixedService,
            serviceNumberSelection: '',
            serviceNumberSelectionDesc: '',
            serviceNumberGroup: '',
            serviceNumberGroupDesc: '',
            exchangeCode: '',
            exchangeCodeDesc: '',
            accessNbr: ''
        })

    }


    const handleSubmit = (id, category) => {


        if (!id || isNaN(id) || String(id).length < 3) {
            toast.error('Enter atleast first 3 digits to search for Access Numbers')
            return false
        }

        if (!category || category.trim() === '') {
            toast.error('Number Group is mandatory to search for Access Numbers')
            return false
        }

        let m = 0, n = 10
        let data = []
        setAccessNumbers([])
        
        get(properties.ACCESS_NUMBER + "?id=" + id + "&category=" + category)
            .then((resp) => {

                if (resp.data) {
                    data = resp.data
                    let length = data.length
                    if (length === 0) {
                        toast.error('No numbers available for given search criteria')
                    }
                    while (length > 0) {
                        data.slice(m, n).map((child) => {
                            length = length - 1;
                            array3.push({ value: child.label, category: child.category })
                        })
                        array2.push(array3)
                        if (array2.length === 5 && array2[4].length === 10) {
                            array3 = []
                            array.push(array2)
                            array2 = []
                        }
                        else {
                            array3 = []
                            temp = array2;
                        }
                        m = n;
                        n = m + 10;
                    }
                    array.push(temp)
                    setAccessNumbers([...array])
                    array = []
                    array2 = []
                    array3 = []
                    temp = []
                    setDisplay(true)
                    setSuggestion(true)
                }
                else {
                    setSuggestion(false)
                    setDisplay(true)
                }
            }).catch((error) => {
                console.log(error)
            }).finally()
    }

    const handleClearFixed = () => {
        setDisplay(false)
        setFixedService({ ...fixedService, accessNbr: "" })
        setAccessNumbers([])
    }
    const handleClearMobile = () => {
        setDisplay(false)
        setMobileService({ ...mobileService, accessNbr: "" })
        setAccessNumbers([])
    }

    const handleVerify = (type, accessNbr) => {
        
        get(properties.ACCESS_NUMBER + "?id=" + accessNbr)
            .then((resp) => {
                if (resp.data) {
                    if (resp.data.length === 1) {
                        if (type === 'Fixed') {
                            fixedBBServiceNumberLookup.map((e) => {
                                if (e.code === resp.data[0].category) {
                                    setFixedService((prevState) => {
                                        return ({
                                            ...prevState,
                                            serviceNumberGroup: e.code,
                                            serviceNumberGroupDesc: e.description
                                        })
                                    })
                                }
                            })
                        } else if (type === 'Prepaid' || type === 'Postpaid') {
                            mobileServiceNumberLookup.map((e) => {
                                if (e.code === resp.data[0].category) {
                                    setMobileService((prevState) => {
                                        return ({
                                            ...prevState,
                                            nbrGroup: e.code,
                                            nbrGroupDesc: e.description
                                        })
                                    })
                                }
                            })
                        }
                    } else {
                        toast.error('Error validating Access Number and Group relationship')
                    }
                } else {
                    toast.error('Error validating Access Number and Group relationship ' + resp.statusCode)
                }
            }).catch((error) => {
                console.log(error)
            }).finally()
    }

    const setAccessNumberAndGroup = (type, accessNbr, category) => {
        if (type === 'Fixed') {
            fixedBBServiceNumberLookup.map((e) => {
                if (e.code === category) {
                    setFixedService((prevState) => {
                        return ({
                            ...prevState,
                            accessNbr: accessNbr,
                            serviceNumberGroup: e.code,
                            serviceNumberGroupDesc: e.description
                        })
                    })
                }
            })
        } else if (type === 'Prepaid' || type === 'Postpaid') {
            mobileServiceNumberLookup.map((e) => {
                if (e.code === category) {
                    setMobileService((prevState) => {
                        return ({
                            ...prevState,
                            accessNbr: accessNbr,
                            nbrGroup: e.code,
                            nbrGroupDesc: e.description
                        })
                    })
                }
            })
        }
    }


    return (

        <>
            <form>
                <div className="col-12 pl-2  bg-light border">
                    <h5 className="text-primary">Service Type</h5>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="serviceType" className="col-form-label">Select Service Type<span>*</span></label>
                            <select id="serviceType" className={`form-control ${(error.serviceType ? "input-error" : "")}`} value={serviceData?.serviceType}
                                onChange={(e) => { 
                                    setServiceData({...serviceData,serviceType : e.target.value, serviceTypeDesc: e.target.options[e.target.selectedIndex].label})
                                    setError({}) 
                                }}
                            >
                                <option key="1" value="">Select</option>
                                {
                                    serviceTypeLookup && serviceTypeLookup.map((e) => (
                                        <option key={e.code} value={e.code}>{e.description}</option>
                                    ))
                                }
                                <option key="2" value="Accessories">Accessories</option>
                                <option key="3" value="Lic Windows">Lic Windows</option>
                            </select>
                            <span className="errormsg">{error.serviceType ? error.serviceType : ""}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="col-12 pl-2 bg-light border mt-2">
                        <h5 className="text-primary">Installation Address</h5>
                    </div>
                    <div className="row ml-0 mt-2">
                        <div className="ml-0 row col-12 label-align">
                            <ReactSwitch
                                onColor="#f58521"
                                offColor="#6c757d"
                                activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                height={20}
                                width={48}
                                className={`${(error.sameAsCustomerAddress ? "input-error" : "")}`} id="sameAsCustomerAddressSwitch" checked={installationAddress.sameAsCustomerAddress}
                                onChange={e => {
                                    if (e === true) {
                                        setInstallationAddress({
                                            ...installationAddress, sameAsCustomerAddress: e,
                                            flatHouseUnitNo: '',
                                            building: '',
                                            street: '',
                                            district: '',
                                            state: '',
                                            cityTown: '',
                                            country: '',
                                            postCode: ''
                                        })                    
                                    }
                                    else {
                                        setInstallationAddress({ ...installationAddress, sameAsCustomerAddress: e })
                                    }
                                }} 
                            />
                            <label htmlFor="sameAsCustomerAddressSwitch" className="mt-0 pt-0 ml-2 col-form-label">Use Customer Address</label>
                        </div>
                        <span className="errormsg">{error.sameAsCustomerAddress ? error.sameAsCustomerAddress : ""}</span>
                    </div>
                    {
                        (installationAddress.sameAsCustomerAddress) ?
                            <></>
                            :
                            <AddressDetailsFormView
                                data={installationAddress}
                                countries={countries}
                                locations={locations}
                                lookups={{
                                    districtLookup: districtLookup,
                                    kampongLookup: kampongLookup,
                                    postCodeLookup: postCodeLookup,
                                    addressElements: addressElements
                                }}
                                title={"installation_address"}
                                error={error}
                                setError={setError}
                                setDetailsValidate={setDetailsValidate}
                                detailsValidate={detailsValidate}
                                lookupsHandler={{
                                    addressChangeHandler: addressChangeHandler
                                }}
                                handler={setInstallationAddress} 
                            />                
                    }                                                           
            </div>
            <div className="mr-2 mt-3 bg-light border row">
                <div className="col-6">
                    <h5 className="text-primary">Catalog</h5>
                </div>
                <div className="col-6 text-right">
					<button type="button" className="m-1 btn btn-labeled btn-primary btn-sm" onClick={handleAddProductModal}>
                        <span className="btn-label mr-0"><i className="fas fa-plus"></i></span>Add Products
                    </button>
                </div>
                {
                    isAddProductOpen &&
                    <AddProductModal
                        data={{
                            isOpen: isAddProductOpen,
                            serviceData,
                            selectedCatalog,
                            selectedPlan,
                            selectedAssetList,
                            selectedServiceList,
                            catalogList,
                            planList,
                            serviceList,
                            assetList
                        }}
                        handler={{
                            setIsOpen: setIsAddProductOpen,
                            setServiceData,
                            setSelectedCatalog,
                            setSelectedPlan,
                            setSelectedServiceList,
                            setSelectedAssetList,
                            setServiceList,
                            setAssetList,
                        }}
                    />
                }
			</div> 
            <div className="col-xl-12">
                <div className="card-box mt-1">
                    <div className="tab-content">
                        <div className="tab-pane active">
                            <SelectedCatalogCard
                                data={{
                                    selectedCatalog
                                }}
                            />
                            <SelectedPlanServiceAssetAddonCard
                                data={{
                                    selectedPlan,
                                    selectedServiceList,
                                    selectedAssetList
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="form-row m-0 mt-2">
                <div className="col-12 pl-2 bg-light border btm-sp">
                    <h5 className="text-primary">Service Property</h5>
                </div>
            </div>
            <div className="row">
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="property1" className="col-form-label">Service Property 1</label>
                        <input type="text" className="form-control" id="property1" placeholder="Service Property 1" value={serviceData?.property1}
                            onChange={e => {setServiceData({ ...serviceData, property1: e.target.value })}} 
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="property2" className="col-form-label">Service Property 2</label>
                        <input type="text" className="form-control" id="property2" placeholder="Service Property 2" value={serviceData?.property2}
                            onChange={e => {setServiceData({ ...serviceData, property2: e.target.value })}} 
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label htmlFor="property3" className="col-form-label">Service Property 3</label>
                        <input type="text" className="form-control" id="property3" placeholder="Service Property 3" value={serviceData?.property3}
                            onChange={e => {setServiceData({ ...serviceData, property3: e.target.value })}} 
                        />
                    </div>
                </div>
            </div>
        </form>
        </>
    )
}
export default ServiceDetailsForm;