import React from 'react';

const PriorityBadge = (props) => {
    const { priority } = props.data;
    const badgeColor = {
        HIGH: 'badge-danger',
        LOW: 'badge-success',
        OPEN: 'badge-danger',
        CLOSED: 'badge-success',
        NEW: 'badge-danger',
        ASSIGNED: 'badge-warning'
    }
    return (
        <span className={`${badgeColor[priority]} text-capitalize`}>{priority?.toLowerCase()}</span>
    )
}

export default PriorityBadge;