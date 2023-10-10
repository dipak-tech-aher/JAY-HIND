import React, { useEffect, useContext, useState } from "react";
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import { AppContext } from '../../../AppContext';

import { history } from '../../../common/util/history';
import Slider from "react-slick";

const Products = (props) => {
    // console.log('props --------------->', props)
    const order = props?.data?.selectedOrder;
    const { setSelectedProduct } = props?.handlers;
    // console.log('order--------xxx----->', order)
    const recentActivitySettings = {
        dots: true,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        autoplay: false,
        autoplaySpeed: 10000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };
    const [orderedProductDetails, setOrderedProductDetails] = useState([]);

    useEffect(() => {
        
        post(`${properties.ORDER_API}/search?limit=10&page=0`, { searchParams: { orderNo: order?.oOrderNo } })
            .then((response) => {
                if (response?.data?.row && response?.data?.row.length > 0) {
                    let orderDetails = response?.data?.row[0];
                    let orderProductDetails = [];
                    if (orderDetails.childOrder.length > 0) {
                        orderDetails.childOrder.forEach(childOrder => {
                            if(childOrder.orderNo === order?.oChildOrderNo){
                                const childOrderId = childOrder.orderUuid;
                                const deptId = childOrder.currEntity?.unitId;
                                const roleId = childOrder.currRole?.roleId;
                                childOrder.orderProductDetails.forEach(productDetail => {
                                    orderProductDetails.push({ ...productDetail, childOrderUuId: childOrderId, deptId, roleId, childOrder });
                                });
                            }
                        });
                    } else {
                        orderProductDetails.push(orderDetails.orderProductDetails);
                    }

                    setOrderedProductDetails(orderProductDetails);
                    if (orderProductDetails.length >= 1) {
                        setSelectedProduct(orderProductDetails[0])
                    }

                }

            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }, [order?.oChildOrderNo]);

    const handleAfterChange = (index, data) => {
        data = orderedProductDetails[index];
        setSelectedProduct(data)
    };

    // console.log('orderedProductDetails ---------------->', orderedProductDetails)

    return (
        <div className="col-md-12">
            <div className="skel-view-base-card">
                <span className="skel-profile-heading">Order Product Details- {order?.oNo}

                </span>
                {
                    orderedProductDetails && orderedProductDetails.length > 0 ?
                        <Slider {...recentActivitySettings} className="px-0" afterChange={handleAfterChange}>
                            {
                                orderedProductDetails.map((val, idx) => (
                                    <div key={idx} className="skel-wrk-ord-summ" data-Modal={val}>
                                        <div className='skel-heading'>Product Name: <br />{val?.productDetails?.productName || ""}</div>
                                        <div className="skel-wrk-ord-graph">
                                            <div className="pieID pie">
                                                <img src={val?.productDetails?.productImage} alt="ProductImage" srcset="" className='skel-prdt-cust-size' />
                                            </div>
                                            <div className='view-int-details-key skel-op-ord-view mt-2'>
                                                <p><span className='skel-lbl-f-sm'>Product Type</span> <span>:</span><span>
                                                   {val?.productDetails?.productType?.description || ""}</span>
                                                </p>
                                                <p><span className='skel-lbl-f-sm'>Product Type</span> <span>:</span>
                                                    <span>{val?.productQuantity || 0}</span>
                                                </p>
                                                <p><span className='skel-lbl-f-sm'>Amount</span> <span>:</span>
                                                    <span>{val?.billAmount || 0}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>


                                ))
                            }
                        </Slider>
                        :
                        <span className="actv-list activity-cnt no-pro-found">No Products Available</span>
                }
            </div>
        </div>)
}
export default Products;
