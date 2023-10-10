import verifiedIcon from '../../assets/images/verified-icon.png'
import Slider from "react-slick";
const ServiceListFormView = (props) => {
    console.log('props------>', props)
    const { data, handleOnManageService, activeService, setActiveService
    } = props;
    console.log('servicesListData--------->', data?.accountDetailsData)
    let serviceList = data.serviceList;
    let accountNo = data?.accountNo;
    if (data?.accountDetailsData?.length > 0) {
        console.log('--here--', accountNo)
        serviceList = data.accountDetailsData.filter((ele) => ele?.accountNo === accountNo)[0];
    }
    console.log('serviceList---------->', serviceList?.length);

    const recentActivitySettings = {
        dots: true,
        infinite: false,
        speed: 300,
        arrows: false,
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
            // You can unslick at a given breakpoint now by adding:
            // settings: "unslick"
            // instead of a settings object
        ]
    };

    return (
        <>
            <div className="card">
                <div className="card-head" id="catalog">
                    <h2 className="mb-0" data-toggle="collapse" data-target="#catalog" aria-expanded="true" aria-controls="collapseOne">
                        <i className="fe-pocket"></i> Products ({serviceList?.length})
                    </h2>
                </div>
                <div id="catalog" className="collapse show" aria-labelledby="catalog" data-parent="#serviceaccordion">
                    <div className="card-body prodt-slick skel-prdt-slick-preview service-account-sect pb-4 pt-4">
                        {console.log('serviceList----xxx------>', serviceList)}
                        {data?.accountDetailsData ? serviceList && serviceList.map((val, idx) =>
                            <div className={"service-base " + ((activeService && activeService === val?.serviceNo) ? "active" : "")}>
                                <div className="service-top-sect" onClick={() => { setActiveService(val?.serviceNo) }}>
                                    <span>{val?.serviceName}</span>
                                    <span className="profile-status">{val?.serviceStatus?.description}</span>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="service-info-sect">
                                    <div className="three-grid">
                                        <div className="container-label">
                                            <span className="label-container-style">Service Type</span>
                                            <span>{val?.srvcTypeDesc?.description}</span>
                                        </div>
                                        <div className="container-label">
                                            <span className="label-container-style">Start Date</span>
                                            <span>{val?.activationDate}</span>
                                        </div>
                                        <div className="container-label">
                                            <span className="label-container-style">Expiry Date</span>
                                            <span>{val?.expiryDate}</span>
                                        </div>
                                        <div className="container-label">
                                            <span className="label-container-style">Service Limit</span>
                                            <span>{val?.serviceLimit || 'NA'}</span>
                                        </div>
                                        <div className="container-label">
                                            <span className="label-container-style">Service Balance</span>
                                            <span>{val?.serviceBalance || 'NA'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                            : <Slider {...recentActivitySettings} className="px-0">
                                {serviceList && serviceList.map((val, idx) =>
                                    <div className={"service-base " + ((activeService && activeService === val?.serviceNo) ? "active" : "")}>
                                        <div className="service-top-sect" onClick={() => { setActiveService(val?.serviceNo) }}>
                                            <span>{val?.serviceName}</span>
                                            <span className="profile-status">{val?.serviceStatus?.description}</span>
                                        </div>
                                        <hr className="cmmn-hline" />
                                        <div className="service-info-sect">
                                            <div className="three-grid">
                                                <div className="container-label">
                                                    <span className="label-container-style">Service Type</span>
                                                    <span>{val?.srvcTypeDesc?.description}</span>
                                                </div>
                                                <div className="container-label">
                                                    <span className="label-container-style">Start Date</span>
                                                    <span>{val?.activationDate}</span>
                                                </div>
                                                <div className="container-label">
                                                    <span className="label-container-style">Expiry Date</span>
                                                    <span>{val?.expiryDate}</span>
                                                </div>
                                                <div className="container-label">
                                                    <span className="label-container-style">Service Limit</span>
                                                    <span>{val?.serviceLimit || 'NA'}</span>
                                                </div>
                                                <div className="container-label">
                                                    <span className="label-container-style">Service Balance</span>
                                                    <span>{val?.serviceBalance || 'NA'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Slider>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default ServiceListFormView