import React, { useState } from 'react';
import AssetList from './AssetList';
import AddEditAsset from './AddEditAsset';

const CreateAsset = () => {

    const [isActive, setIsActive] = useState('list');
    const [assetData, setAssetData] = useState({});
    const [location, setLocation] = useState('create');

    return (
        <>
            {
                (() => {
                    switch (isActive) {
                        case 'list':
                            return (
                                <AssetList handler={{
                                    setIsActive: setIsActive,
                                    setAssetData: setAssetData,
                                    setLocation: setLocation
                                }} />
                            )
                        case 'create-edit':
                            return <AddEditAsset data={{
                                assetData: assetData,
                                location: location
                            }}
                                handler={{
                                    setIsActive: setIsActive
                                }} />
                        default:
                            return <></>
                    }
                })()
            }
        </>
    )
}

export default CreateAsset;