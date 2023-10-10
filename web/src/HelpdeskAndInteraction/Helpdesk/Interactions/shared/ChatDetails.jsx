import React from 'react';

const ChatDetails = (props) => {
    const { detailedViewItem } = props.data;
    return (
        <div className="col-12 row pl-0 pt-2">
            <div className="row col-12">
                <div className="col-3 form-label">Chat Category:</div>
                <div className="col-9 form-vtext">-</div>
            </div>
            <div className="col-12 row pt-2">
                <div className="col-3 form-label">Enquiry Deatils:</div>
                <div className="col-9 form-vtext">-</div>
            </div>
        </div>
    )
}

export default ChatDetails;