import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import logoLight from '../../../assets/images/logo-light.png';
import { history } from '../../../common/util/history';

const PrintLayout = ({ children }) => {

    const printLayoutRef = useRef();
    const customerDetails = children?.props?.location?.state?.data?.customerDetails

    let customerName = (customerDetails.customerType === 'RESIDENTIAL') ? customerDetails.title + " " + customerDetails.surName + " " + customerDetails.foreName
        : customerDetails.companyName  // jira Id 48 Pon Arasi

    const handleOnPrint = useReactToPrint({
        content: () => printLayoutRef.current,
        documentTitle: 'dtWorks' + "_" + customerDetails.customerId + "_" + customerName, // jira Id 48 Pon Arasi
        onAfterPrint: () => document.title = 'dtWorks',


    });

    const handleOnBack = () => {
        history.goBack();
    }

    return (
        <div className='content' ref={printLayoutRef}>
            <div className='container-fluid'>
                <div className='row bg-white bg-white-print'>

                    <div className='col-lg-12 p-2'>
                        <div className='p-2'>
                            <div className='row'>
                                <div className="col-12 row pb-2">
                                    <div className="col-6">
                                        <div className="logo-box">
                                            <span className="logo-sm">
                                                <img src={logoLight} alt="" height="50" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className='col-6'>
                                        <div className="text-right">
                                            <button type="button" className="btn btn-labeled btn-primary btn-sm mt-2 printbutton" onClick={handleOnPrint}>
                                                <i className="fas fa-print mr-1" />
                                                Print
                                            </button>
                                            <button type="button" className="btn btn-labeled btn-primary btn-sm mt-2 printbutton ml-2" onClick={handleOnBack}>
                                                <i className="fas fa-arrow-left mr-1" />
                                                Back
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-12 p-0'>
                                    {
                                        children
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrintLayout;