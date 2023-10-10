import React, { useState } from 'react';
import AddonList from './AddonList';
import AddEditAddon from './AddEditAddon';

const CreateAddon = () => {

    const [isActive, setIsActive] = useState('list');
    const [addonData, setAddonData] = useState({});
    const [location, setLocation] = useState('create');

    return (
        <>
            {
                (() => {
                    switch (isActive) {
                        case 'list':
                            return (
                                <AddonList handler={{
                                    setIsActive: setIsActive,
                                    setAddonData: setAddonData,
                                    setLocation: setLocation
                                }} />
                            )
                        case 'create-edit':
                            return <AddEditAddon data={{
                                addonData: addonData,
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

export default CreateAddon;