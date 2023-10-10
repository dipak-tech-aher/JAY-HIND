import React, { useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { toast } from 'react-toastify'
import CatalogList from './CatalogList'
import PlanServiceAssetAddonList from './PlanServiceAssetAddonList'
import SelectedProductList from './SelectedProductList'

const AddProductModal = (props) => {

    const { isOpen, productList, serviceData, selectedProductList } = props?.data
    const { setIsOpen, handleAddProduct, setSelectedProductList } = props?.handler

    const [oldSelectedProducts, setOldSelectedProducts] = useState({
        oldSelectedCatalog: {},
        oldSelectedPlan: {},
        oldSelectedAssetList: [],
        oldSelectedServiceList: []
    })
     

    const handleDeleteProduct = (data) => {  
        unstable_batchedUpdates(() => {
            setSelectedProductList({})
        })
    }

      

    return (
        
            <div className="form-row pl-4">
                <div className="skel-add-product-stype mt-4">
                <div className="add-products">
                    <div className="add-prod-left">
                        <div className="tabbable-responsive">
                            <div className="tabbable pl-2">
                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    <li className="nav-item">
                                        <a className="nav-link active" id="catalog-prod" data-toggle="tab" href="#catalogprod" role="tab" aria-controls="catalog-prod" aria-selected="true">Products</a>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body cursor-pointer">           
                                <div className="tab-content">
                                    <div className="tab-pane fade show active" style={{overflowY: "auto",height: "500px"}} id="catalogprod" role="tabpanel" aria-labelledby="catalog-prod">
                                        {
                                            productList && productList.map((product) => (
                                                <div className="radio radio-primary pos-rel">
                                                    {/* <input type="radio" name="product" className="card-input-element" /> */}
                                                    <div className="add-prod-data cust-header">
                                                        <div className="add-prod-title">
                                                            {/* <img src={verifiedIcon} alt="" className="verified-services verified-symbol" /> */}
                                                            <div className="prod-info-header">
                                                                <h4 onClick={() => handleAddProduct(product)}>{product?.productName}</h4>
                                                                <span>Service Type: {product?.serviceTypeDescription}</span>
                                                            </div>
                                                            <div className="total-prod-amt">
                                                                <p><span>Total RC</span><span>${Number(product?.totalRc).toFixed(2)}</span></p>
                                                                <p><span>Total NRC</span><span>${Number(product?.totalNrc).toFixed(2)}</span></p>
                                                            </div>
                                                        </div>
                                                        {
                                                            product?.productChargesList && product?.productChargesList.length > 0 && 
                                                            <div className="add-prod-details">
                                                                <table className="plans-prod">
                                                                    <thead>
                                                                        <tr><th>Charges</th>
                                                                            <th className="txt-right">RC</th>
                                                                            <th className="txt-right">NRC</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {
                                                                            product?.productChargesList && product?.productChargesList.map((x) => (
                                                                            <tr>
                                                                                <td>{x?.chargeDetails?.chargeName}</td>
                                                                                <td className="txt-right">${x?.chargeDetails?.chargeCat ==='CC_RC' && x?.chargeAmount ? Number(x?.chargeAmount).toFixed(2) : 0.00}</td>
                                                                                <td className="txt-right">${x?.chargeDetails?.chargeCat ==='CC_NRC' && x?.chargeAmount ? Number(x?.chargeAmount).toFixed(2) : 0.00}</td>
                                                                            </tr>
                                                                            ))
                                                                        } 
                                                                        
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>  
                                    
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="add-prod-rht cursor-pointer">
                        <h4>Selected Products</h4>
                            <div className="sel-scroll-prod">
                                {
                                    selectedProductList && selectedProductList.map((product) => (
                                        <div className="selected-prod-header">
                                        <div className="sect-top-prod">
                                            <div className="sel-prod-top">
                                                <span className="profile-status-catalog">Product</span>
                                                <h4>{product?.productName}</h4>
                                                <span>Service Type: {product?.serviceTypeDescription}</span>
                                            </div>
                                            <span onClick={() => handleDeleteProduct(product)}><i className="fa fa-times"></i></span>
                                        </div>
                                        <div className="sect-bottom-prod">
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td></td>
                                                        <td>RC: ${Number(product?.totalRc).toFixed(2)}</td>
                                                        <td></td>
                                                        <td>NRC: ${Number(product?.totalNrc).toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    ))
                                }
                            </div>
                            <div className="selec-footer">
                                <div className="sect-bottom-prod">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td className="txt-right">Total</td>
                                                <td>RC: ${Number(serviceData?.totalRc).toFixed(2)}</td>
                                                <td></td>
                                                <td>NRC: ${Number(serviceData?.totalNrc).toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
    )
}

export default AddProductModal