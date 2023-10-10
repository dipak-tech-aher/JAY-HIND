import React, { useState } from 'react';
import AddEditCatalog from './AddEditCatalog';
import CatalogList from './CatalogList';

const CatalogSearchList = () => {

    const [isActive, setIsActive] = useState('list');
    const [catalogData, setCatalogData] = useState({});
    const [location, setLocation] = useState('create');

    return (
        <>
        <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">Search Catalog</h4>
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-lg-12">
                    <div className="card-body card-box"> 
            {
                (() => {
                    switch (isActive) {
                        case 'list':
                            return (
                                <CatalogList 
                                    handler={{
                                        setIsActive: setIsActive,
                                        setCatalogData: setCatalogData,
                                        setLocation: setLocation
                                    }}
                                    data={{
                                        catalogData: catalogData
                                    }} 
                                />
                            )
                        case 'create-edit':
                            return (
                                <AddEditCatalog 
                                    data={{
                                        location: location,
                                        catalogData: catalogData
                                    }}
                                    handler={{
                                        setIsActive: setIsActive,
                                    }}
                                />
                            )
                        default:
                            return <></>
                    }
                })()
            }
                </div>
            </div>
        </div>
        </>
    )
}

export default CatalogSearchList;