import React from "react";

const MonitoringDoubleCard = (props) => {

    const { header, icon, count1, count2, footer1, footer2, onClickFlag } = props?.data

    const onClickListnerHandler = () => {
        props?.handler?.handleonClickView()
    };

    return (
        <div className="card chat-mon">
            <div className="card-body">
                <div className="media">
                    <div className="media-body overflow-hidden">
                        <h5 className="header-title" style={{float:"left"}}>{header}</h5>
                            <p className="img-icon"> <i className={icon}></i></p> 
                    </div>
                </div>
            </div>
            <div className="card-body chat-mon">
                <div className="row" onClick={onClickFlag ? onClickListnerHandler : () => { }} style={onClickFlag ? { cursor: "pointer" } : { cursor: "default" }}>
                    <div className="col-6">
                        <div className="time-left text-center">
                            <h3 style={onClickFlag ? { color: "#0f3780" } : { color: "#808080" }}>{count1}</h3>
                            <p>{footer1}</p>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="time-left text-center">
                            <h3 style={onClickFlag ? { color: "#0f3780" } : { color: "#808080" }} >{count2}</h3>
                            <p>{footer2}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MonitoringDoubleCard;