import React, { useEffect, useState } from 'react'
import NoProductImg from '../../assets/images/no-product.png';
import { Card, Button, ListGroup } from 'react-bootstrap';
import ServiceAppointmentModal from './ServiceAppointmentModal';
import contactInfo from "../../assets/images/cnt-info.svg";
import Modal from 'react-modal';
import { makeFirstLetterLowerOrUppercase } from '../../common/util/util';


const CustomerServiceForm = (props) => {
    const { serviceType, serviceTypeLookup, productType, productTypeLookup, productCategory, productCategoryLookup,
        productSubCategory, productSubCategoryLookup, serviceData, productList, selectedProductList, customerAddress,
        countries, selectedCustomerType, selectedAppointmentList, customerData, customerTypeLookup, existingApplicationProdList,
        productBenefitLookup, appsConfig
    } = props?.data
    const { setServiceData, fetchProductList, handleAddProduct, handleDeleteProduct, handleIncreaseProduct,
        handleDecreaseProduct, handleRemoveServiceType, setSelectedAppointmentList, setServiceType,
        setProductType, setProductCategory, setProductSubCategory, handleManualProductChange, setProductList } = props?.handler

    const [isOpen, setIsOpen] = useState(false)
    const [bundleListPopup, setBundleListPopup] = useState(Array(productList.length).fill(false))
    const [selectedProductData, setSelectedProductData] = useState({})

    Modal.setAppElement('#root');

    const customStyle = {
        content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '30%',
            maxHeight: '50%'
        }
    }

    useEffect(() => {

        // console.log('productList---x----------->', productList)
        // console.log('existingApplicationProdList---x----------->', existingApplicationProdList)

        document.body.scrollTop = document.documentElement.scrollTop = 0;

        if (existingApplicationProdList.length > 0) {
            const prodList = productList.map((product) => {
                const existingProduct = existingApplicationProdList.find(
                    (existingProduct) => {
                        if (existingProduct.bundleId && existingProduct.bundleId != '') {
                            if (existingProduct.bundleId == product.bundleId) {
                                return existingProduct
                            }
                        } else {
                            if (existingProduct.productId == product.productId) {
                                return existingProduct
                            }
                        }

                    }
                );
                if (existingProduct) {

                    if (product.contractFlag == 'Y') {
                        return {
                            ...product,
                            quantity: existingProduct.quantity,
                            isSelected: 'Y',
                            selectedContract: product.selectedContract ? [...new Set([...product.selectedContract, existingProduct.selectedContract || 0])]
                                : [existingProduct.selectedContract || 0],
                            upfrontCharge: existingProduct?.upfrontCharge,
                            advanceCharge: existingProduct?.advanceCharge
                        };
                    }
                    else {
                        return {
                            ...product,
                            quantity: existingProduct.quantity,
                            isSelected: 'Y',
                            upfrontCharge: existingProduct?.upfrontCharge,
                            advanceCharge: existingProduct?.advanceCharge
                        };
                    }

                }

                return product;
            });
            // console.log('prodList ', prodList)
            setProductList(prodList)
        }
    }, [])

    const handleClickAppointment = (data) => {
        setSelectedProductData(data)
        setIsOpen(true)
    }

    const toggleBundleListPopup = (index) => {
        setBundleListPopup(prevState => {
            const updatedState = [prevState];
            updatedState[index] = !prevState[index];
            return updatedState;
        });
    };

    // console.log('serviceData ', serviceData)
    console.log('productList ', productList)
    return (
        <div className="cmmn-skeleton skel-selected-category">
            <div className="form-row pl-4 skel-available-products">
                <div className="skel-add-product-stype mt-4">
                    {selectedCustomerType && <div className="form-group">
                        <label>Selected {appsConfig && appsConfig.clientFacingName && appsConfig.clientFacingName['Customer'.toLowerCase()] && makeFirstLetterLowerOrUppercase(appsConfig?.clientFacingName['Customer'.toLowerCase()],'upperCase') || 'customer'} Category</label>
                        <ul className="skel-top-inter">
                            {
                                customerTypeLookup
                                    .filter((e) => e.code === selectedCustomerType)
                                    .map((filteredItem) => (
                                        <li key={filteredItem.code}>
                                            {filteredItem.description}
                                        </li>
                                    ))
                            }
                        </ul>
                    </div>}
                    {productCategory.length > 0 && <div className="form-group">
                        <label>Selected Category</label>
                        <ul className="skel-top-inter">
                            {
                                productCategoryLookup
                                    .filter((e) => productCategory.includes(e.code))
                                    .map((filteredItem) => (
                                        <li key={filteredItem.code}>
                                            {filteredItem.description} <a onClick={() => {
                                                setProductCategory(productCategory.filter(f => f !== filteredItem.code))
                                            }}><i className="material-icons">close</i></a>
                                        </li>
                                    ))
                            }
                        </ul>
                    </div>}
                    {productSubCategory.length > 0 && <div className="form-group">
                        <label>Selected Sub Category</label>
                        <ul className="skel-top-inter">
                            {
                                productSubCategoryLookup
                                    .filter((e) => productSubCategory.includes(e.code))
                                    .map((filteredItem) => (
                                        <li key={filteredItem.code}>
                                            {filteredItem.description} <a onClick={() => {
                                                setProductSubCategory(productSubCategory.filter(f => f !== filteredItem.code))
                                            }}><i className="material-icons">close</i></a>
                                        </li>
                                    ))
                            }
                        </ul>
                    </div>}
                    {productType.length > 0 && <div className="form-group">
                        <label>Selected Type</label>
                        <ul className="skel-top-inter">
                            {
                                productTypeLookup
                                    .filter((e) => productType.includes(e.code))
                                    .map((filteredItem) => (
                                        <li key={filteredItem.code}>
                                            {filteredItem.description} <a onClick={() => {
                                                setProductType(productType.filter(f => f !== filteredItem.code))
                                            }}><i className="material-icons">close</i></a>
                                        </li>
                                    ))
                            }
                        </ul>
                    </div>}
                    {serviceType.length > 0 && <div className="form-group">
                        <label>Selected Service</label>
                        <ul className="skel-top-inter">
                            {
                                serviceTypeLookup
                                    .filter((e) => serviceType.includes(e.code))
                                    .map((filteredItem) => (
                                        <li key={filteredItem.code}>
                                            {filteredItem.description} <a onClick={() => {
                                                setServiceType(serviceType.filter(f => f !== filteredItem.code))
                                            }}><i className="material-icons">close</i></a>
                                        </li>
                                    ))
                            }
                        </ul>
                    </div>}
                    <div className="pl-0 pt-0">
                        <label>Available Products</label>
                    </div>
                    {console.log('productList---------->', productList)}
                    <div className="skel-plans product-skel-plans">
                        {
                            productList && productList.map((product, index) => (
                                <Card bsPrefix='skel-plans-product skel-plan' key={index} style={{ marginBottom: '20px' }}>
                                    {product?.isSelected === 'Y' && (
                                        <span className='product-selected-check'>
                                            <i className="fas fa-check" />
                                        </span>
                                    )}
                                    <Card.Img variant="top" onClick={() => {
                                        handleAddProduct(!(product?.isSelected === 'Y'), product)
                                    }} style={{ cursor: 'pointer' }} src={product?.productImage ? product?.productImage : product?.bundleImage ? product?.bundleImage : NoProductImg} width="288px" height="162px" />
                                    {
                                        product?.productCategory === 'PC_BUNDLE' ? <>
                                            <Card.Body>
                                                <Card.Title bsPrefix='card-title text-overflow skel-product-title-text' style={{ display: 'block' }}>
                                                    {product.productName || product.bundleName}
                                                </Card.Title>
                                                <Card.Text bsPrefix='card-title text-overflow skel-product-title-text' style={{ display: 'block' }}>
                                                    Bundle List: <a href="javascript:void(0)" onClick={() => {
                                                        toggleBundleListPopup(index)
                                                    }}>View Bundle List</a>
                                                </Card.Text>
                                                <Card.Text>
                                                    {product?.contractList?.length > 0 && (
                                                        <>
                                                            <div className="checkbox-container">
                                                                {
                                                                    product.contractList.map((v, k) => {
                                                                        const checkboxId = `${product.bundleId}_${v}_${k}`;
                                                                        const isSelectedContract = product.selectedContract?.includes(Number(v)) || false;
                                                                        return (
                                                                            <div className="checkbox-item" key={k}>
                                                                                <input type="checkbox" style={{ position: 'relative', opacity: '1' }} name="contract"
                                                                                    value={v}
                                                                                    id={checkboxId}
                                                                                    checked={isSelectedContract}
                                                                                    onChange={(e) => {
                                                                                        handleManualProductChange(product, e);
                                                                                    }} />
                                                                                <label>{v} Months</label>
                                                                            </div>)
                                                                    })
                                                                }
                                                            </div>
                                                        </>
                                                    )}
                                                </Card.Text>
                                                <Card.Text>
                                                    <div className="checkbox-container">
                                                        <div className="checkbox-item">
                                                            <input type="radio" style={{ position: 'relative', opacity: '1' }} name="billType"
                                                                value="mergeBill"
                                                                id="billType"
                                                                onChange={(e) => {
                                                                    handleManualProductChange(product, e);
                                                                }} />
                                                            <label>Merge Bill</label>
                                                            &nbsp;
                                                            <input type="radio" style={{ position: 'relative', opacity: '1' }} name="billType"
                                                                value="splitBill"
                                                                id="billType"
                                                                onChange={(e) => {
                                                                    handleManualProductChange(product, e);
                                                                }} />
                                                            <label>Split Bill</label>
                                                        </div>
                                                    </div>
                                                </Card.Text>
                                                {
                                                    <Modal isOpen={bundleListPopup[index]} onRequestClose={() => toggleBundleListPopup(index)}
                                                        contentLabel="Bundled Products List" appElement={document.getElementById('root')} style={customStyle}>
                                                        <div className="modal-content">
                                                            <div className='row'>
                                                                <div className="col-md-12">
                                                                    <span className="col-md-7">Bundled Products List</span>
                                                                    <button type="button" className="col-md-2 close" onClick={() => setBundleListPopup(false)}>
                                                                        <span aria-hidden="true">×</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="modal-body overflow-auto">
                                                                <table width="100%" border="1px solid" style={{ textAlign: 'center' }}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Product</th>
                                                                            <th>Category</th>
                                                                            <th>Type</th>
                                                                            <th>RC Amount</th>
                                                                            <th>NRC Amount</th>
                                                                            <th>Benefit</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {
                                                                            product?.productBundleDtl?.map((bundleDtl, idx) => {
                                                                                if (bundleDtl?.productDtl) {
                                                                                    const rcAmount = bundleDtl?.charges?.reduce((total, charge) => {
                                                                                        if (charge.chargeType === 'CC_RC') {
                                                                                            return total + Number(charge.chargeAmount);
                                                                                        }
                                                                                        return total;
                                                                                    }, 0);
                                                                                    const nrcAmount = bundleDtl?.charges?.reduce((total, charge) => {
                                                                                        if (charge.chargeType === 'CC_NRC') {
                                                                                            return total + Number(charge.chargeAmount);
                                                                                        }
                                                                                        return total;
                                                                                    }, 0);
                                                                                    return (<tr key={idx}>
                                                                                        <td>{bundleDtl?.productDtl?.productName}</td>
                                                                                        <td>{bundleDtl?.productDtl?.productCategoryDesc?.description}</td>
                                                                                        <td>{bundleDtl?.productDtl?.productTypeDescription?.description}</td>
                                                                                        <td>{rcAmount || 0}</td>
                                                                                        <td>{nrcAmount || 0}</td>
                                                                                        <td>
                                                                                            {bundleDtl?.productDtl?.productBenefit?.length > 0 ? (
                                                                                                <div className="product-benefits">
                                                                                                    {bundleDtl?.productDtl?.productBenefit?.map((productBenefit, idx) => (
                                                                                                        productBenefit?.benefits && productBenefit?.benefits?.length > 0 ? (
                                                                                                            <span key={idx} className="tooltiptext">
                                                                                                                {productBenefit?.benefits.map((val, key) => (
                                                                                                                    <span key={key}>{productBenefit?.contract + ' Months'}-{productBenefitLookup.find(f => f.code == val.selectedValue)?.description}: {val.description}<br /></span>
                                                                                                                ))}
                                                                                                            </span>
                                                                                                        ) : null
                                                                                                    ))}
                                                                                                </div>
                                                                                            ) : null}
                                                                                        </td>
                                                                                    </tr>)
                                                                                }
                                                                            })
                                                                        }
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </Modal>
                                                }
                                            </Card.Body>
                                            <Card.Body>
                                                <div className="checkbox-container">
                                                    <div className="checkbox-item">
                                                        {product?.upfrontCharge == 'Y' && (
                                                            <React.Fragment>
                                                                <input type="checkbox" checked={product?.upfrontCharge == 'Y' ? true : false} disabled={product?.quantity === 0 ? true : false} style={{ position: 'relative', opacity: '1' }} name="upfrontPayment" onChange={(e) => {
                                                                    handleManualProductChange(product, e)
                                                                }} />
                                                                <label>Upfront Payment</label>
                                                            </React.Fragment>
                                                        )}
                                                        {product?.advanceCharge == 'Y' && (
                                                            <React.Fragment>
                                                                <input type="checkbox" checked={product?.advanceCharge == 'Y' ? true : false} disabled={product?.quantity === 0 ? true : false} style={{ position: 'relative', opacity: '1' }} name="advancePayment" onChange={(e) => {
                                                                    handleManualProductChange(product, e)
                                                                }} />
                                                                <label>Advance Payment</label>
                                                            </React.Fragment>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="input-group">
                                                    <span className="input-group-btn">
                                                        <button type="button" className="btn-number btn-left-qty" data-type="minus" onClick={() => handleDecreaseProduct(product)}>
                                                            <i className="material-icons">remove</i>
                                                        </button>
                                                    </span>
                                                    <input
                                                        type="text" name="quantity" style={{ textAlign: 'center' }} className="form-control input-number"
                                                        value={product?.quantity} onChange={(e) => { handleManualProductChange(product, e) }}
                                                    />
                                                    <span className="input-group-btn">
                                                        <button type="button" className="btn btn-default btn-number btn-right-qty" data-type="plus"
                                                            onClick={() => handleIncreaseProduct(product)}>
                                                            <i className="material-icons">add</i>
                                                        </button>
                                                    </span>
                                                    {
                                                        product?.isSelected === 'Y' && product.isAppointRequired === 'Y' && (
                                                            <span className="float-right">
                                                                <button type="button" className="btn btn-primary" onClick={() => handleClickAppointment(product)}>
                                                                    <i className="fa fa-calendar"></i>  Book Appointment
                                                                </button>
                                                            </span>
                                                        )
                                                    }
                                                </div>
                                            </Card.Body>
                                            <Card.Body>
                                                {
                                                    <div className="skel-plans-sect-base" >
                                                        <span className="skel-plans-price">RC: {Number(product?.totalRc).toFixed(2)} {product?.currency}</span>
                                                        <span className="skel-plans-price pull-right" style={{ marginTop: '0px' }}>
                                                            NRC: {Number(product?.totalNrc).toFixed(2)} {product?.currency}
                                                        </span>
                                                    </div>
                                                }
                                            </Card.Body>
                                        </> :
                                            <>
                                                <Card.Body>
                                                    <Card.Title bsPrefix='card-title text-overflow skel-product-title-text' style={{ display: 'block' }}>
                                                        {product?.productName}
                                                    </Card.Title>
                                                    <Card.Text bsPrefix='card-title text-overflow skel-product-title-text' style={{ display: 'block' }}>
                                                        Category: {product?.productCategoryDesc?.description}
                                                    </Card.Text>
                                                    <Card.Text bsPrefix='card-title text-overflow skel-product-title-text' style={{ display: 'block' }}>
                                                        Type: {product?.productTypeDescription?.description}
                                                    </Card.Text>
                                                    <Card.Text>
                                                        Service type: {product?.serviceTypeDescription?.description}
                                                        {product?.productBenefit?.length > 0 && (
                                                            <>
                                                                {product?.productBenefit?.map((productBenefit, idx) => {
                                                                    const checkboxId = `${product.productId}_${productBenefit.contract}_${idx}`;
                                                                    const isSelectedContract = product.selectedContract?.includes(Number(productBenefit.contract)) || false;
                                                                    return productBenefit.contract ? (
                                                                        <div className="checkbox-container" key={idx}>
                                                                            <div className="checkbox-item">
                                                                                <input
                                                                                    id={checkboxId}
                                                                                    type="checkbox"
                                                                                    style={{ position: 'relative', opacity: '1' }}
                                                                                    name="contract"
                                                                                    checked={isSelectedContract}
                                                                                    value={productBenefit.contract}
                                                                                    onChange={(e) => {
                                                                                        handleManualProductChange(product, e);
                                                                                    }}
                                                                                />
                                                                                <label>{productBenefit.contract} Months</label>
                                                                                <div className="product-benefits">
                                                                                    <label className="custom-tooltip ml-2 mt-1">
                                                                                        <i className="mdi mdi-information-outline" />
                                                                                        <span className="tooltiptext">
                                                                                            {productBenefit.benefits && productBenefit.benefits.map((val, key) => (
                                                                                                <span key={key}>
                                                                                                    {productBenefitLookup.find((f) => f.code === val.selectedValue)?.description ||
                                                                                                        '-'}: {val.description}
                                                                                                    <br />
                                                                                                </span>
                                                                                            ))}
                                                                                        </span>
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <label className="custom-tooltip ml-2 mt-1">
                                                                            <i className="mdi mdi-information-outline" />
                                                                            <span className="tooltiptext">
                                                                                {productBenefit.benefits && productBenefit.benefits.map((val, key) => (
                                                                                    <span key={key}>
                                                                                        {productBenefitLookup.find((f) => f.code === val.selectedValue)?.description || '-'}: {val.description}
                                                                                        <br />
                                                                                    </span>
                                                                                ))}
                                                                            </span>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </>
                                                        )}

                                                    </Card.Text>
                                                </Card.Body>
                                                <Card.Body>
                                                    <div className="checkbox-container">
                                                        <div className="checkbox-item">
                                                            {product?.upfrontCharge == 'Y' && (
                                                                <React.Fragment>
                                                                    <input type="checkbox" checked={product?.upfrontCharge == 'Y' ? true : false} disabled={product?.quantity === 0 ? true : false} style={{ position: 'relative', opacity: '1' }} name="upfrontPayment" onChange={(e) => {
                                                                        handleManualProductChange(product, e)
                                                                    }} />
                                                                    <label>Upfront Payment</label>
                                                                </React.Fragment>
                                                            )}
                                                            {product?.advanceCharge == 'Y' && (
                                                                <React.Fragment>
                                                                    <input type="checkbox" checked={product?.advanceCharge == 'Y' ? true : false} disabled={product?.quantity === 0 ? true : false} style={{ position: 'relative', opacity: '1' }} name="advancePayment" onChange={(e) => {
                                                                        handleManualProductChange(product, e)
                                                                    }} />
                                                                    <label>Advance Payment</label>
                                                                </React.Fragment>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <span className="input-group-btn">
                                                            <button type="button" className="btn-number btn-left-qty" data-type="minus" onClick={() => handleDecreaseProduct(product)}>
                                                                <i className="material-icons">remove</i>
                                                            </button>
                                                        </span>
                                                        <input type="text" name="quantity" style={{ textAlign: 'center' }} className="form-control input-number"
                                                            value={product?.quantity} onChange={(e) => { handleManualProductChange(product, e) }} />
                                                        <span className="input-group-btn">
                                                            <button type="button" className="btn btn-default btn-number btn-right-qty" data-type="plus" onClick={() => handleIncreaseProduct(product)}>
                                                                <i className="material-icons">add</i>
                                                            </button>
                                                        </span>
                                                        {
                                                            product?.isSelected === 'Y' && product.isAppointRequired === 'Y' && (
                                                                <span className="float-right">
                                                                    <button type="button" className="btn btn-primary" onClick={() => handleClickAppointment(product)}>
                                                                        <i className="fa fa-calendar"></i>  Book Appointment
                                                                    </button>
                                                                </span>
                                                            )
                                                        }
                                                    </div>
                                                </Card.Body>
                                                <Card.Body>
                                                    <div className='skel-plans-sect-base'>
                                                        <span className="skel-plans-price">RC: {Number(product?.totalRc).toFixed(2)} {product?.currency}</span>
                                                        <span className="skel-plans-price pull-right" style={{ marginTop: '0px' }}>NRC: {Number(product?.totalNrc).toFixed(2)} {product?.currency}</span>
                                                    </div>
                                                </Card.Body>
                                            </>
                                    }
                                </Card>
                            ))
                        }
                    </div>
                </div>
            </div>
            {
                isOpen &&
                <ServiceAppointmentModal
                    data={{
                        isOpen: isOpen,
                        serviceTypeLookup,
                        serviceData,
                        selectedProductData,
                        customerAddress,
                        countries,
                        selectedCustomerType,
                        selectedAppointmentList,
                        customerData
                    }}
                    handler={{
                        setIsOpen: setIsOpen,
                        fetchProductList,
                        setSelectedAppointmentList
                    }}
                />
            }
        </div>
    )
}

export default CustomerServiceForm;