import React, { useState } from 'react';
import AddEditPlan from './addEditPlan';
import PlanTable from './planTable';

const CreatePlan = () => {

    const [isActive,setIsActive] = useState('list')
    const [planData,setPlanData] = useState({})
    const [location,setLocation] = useState('create')
    return (
        <>
            {(() => {
                switch (isActive) {
                    case 'list':
                        return (
                            <PlanTable 
                                handler = {{
                                    setIsActive : setIsActive,
                                    setPlanData : setPlanData,
                                    setLocation : setLocation
                                }}
                            />
                        );
                    case 'create-edit':
                         return (
                            <AddEditPlan
                                data = {{
                                    planData: planData,
                                    location: location
                                }}
                                handler = {{
                                    setIsActive: setIsActive
                                }}
                            />);
                    default:
                        return (
                            <PlanTable
                                handler = {{
                                    setIsActive : setIsActive,
                                    setPlanData : setPlanData,
                                    setLocation : setLocation
                                }}
                            />
                        );
                    }
                    })()}  
        </>
    )
}

export default CreatePlan;