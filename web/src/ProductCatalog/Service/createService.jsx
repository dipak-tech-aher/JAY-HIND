import React, { useState } from 'react';
import AddEditService from './addEditService';
import ServiceTable from './serviceTable';

const CreateService = () => {

    const [isActive,setIsActive] = useState('list')
    const [serviceData,setServiceData] = useState({})
    const [location,setLocation] = useState('create')
    return (
        <>
            {(() => {
                switch (isActive) {
                    case 'list':
                        return (
                            <ServiceTable
                                handler = {{
                                    setIsActive : setIsActive,
                                    setServiceData : setServiceData,
                                    setLocation : setLocation
                                }}
                            />
                        );
                    case 'create-edit':
                         return (
                            <AddEditService
                                data = {{
                                    serviceData: serviceData,
                                    location: location
                                }}
                                handler = {{
                                    setIsActive: setIsActive
                                }}
                            />);
                    default:
                        return (
                            <ServiceTable
                                handler = {{
                                    setIsActive : setIsActive,
                                    setServiceData : setServiceData,
                                    setLocation : setLocation
                                }}
                            />
                        );
                    }
                    })()}  
        </>
    )
}

export default CreateService;