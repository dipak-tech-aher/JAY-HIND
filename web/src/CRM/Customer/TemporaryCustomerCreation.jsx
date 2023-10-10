import React from 'react'
import NewCustomerPreviewModal from 'react-modal'
import SearchCustomer from './SearchCustomer';

function TempCustomer(props) {    
    return (
        <>
            <div className="cnt-wrapper">
                <div className="card-skeleton">
                    <div className="top-breadcrumb cmmn-skeleton">
                        <div className="lft-skel">
                            <ul>
                                {/* <li><a ><i className="material-icons">arrow_back</i>Back</a></li>  */}
                                <li>Search Customer</li>
                            </ul>
                        </div>
                        <div className="rht-skel">

                        </div>
                    </div>
                    <div className="cutomer-skel mt-1">
                        <div id="msform">
                            <div className="form-row">                                
                                <div className="col-9">
                                    <fieldset> 
                                        {                                       
                                            <NewCustomerPreviewModal isOpen={true}>
                                                <div className="row">
                                                    <SearchCustomer
                                                        data={{                                                        
                                                            source: 'CUSTOMER_CREATION'
                                                        }}
                                                    />                                                  
                                                </div>
                                            </NewCustomerPreviewModal>
                                        }
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )

}
export default TempCustomer;
