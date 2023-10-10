import React, { useState } from 'react';
import AddEditCatalog from './AddEditCatalog';
import CatalogList from './CatalogList';

const CreateCatalog = () => {

    const [isActive, setIsActive] = useState('list');
    const [catalogData, setCatalogData] = useState({});
    const [location, setLocation] = useState('create');

    return (
        <>
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
        </>
    )
}

export default CreateCatalog;