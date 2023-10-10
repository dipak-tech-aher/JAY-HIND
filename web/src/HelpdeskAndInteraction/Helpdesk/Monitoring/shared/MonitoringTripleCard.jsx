import React from "react";

const MonitoringTripleCard = (props) => {
    const { header, icon, count1, count2, count3, footer1, footer2, footer3, onClickFlag } = props?.data;


    const onClickListnerHandler = () => {
        props?.handler?.handleonClickView(header)
    };


    return (

        <div className="card chat-mon">
            <div className="card-body">
                <div className="media">
                    <div className="media-body overflow-hidden">
                        <h5 className="header-title">{header}
                            <p className="img-icon"> <i className={icon}></i></p></h5>
                    </div>
                </div>
            </div>
            <div className="card-body chat-mon">
                <div className="row" onClick={onClickFlag ? onClickListnerHandler : () => { }} style={onClickFlag ? { cursor: "pointer" } : { cursor: "default" }}>
                    <div className="col-4">
                        <div className="time-left text-center">
                            <h3>{count1}</h3>
                            <p>{footer1}</p>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="time-left text-center">
                            <h3 style={onClickFlag ? { color: "#0f3780" } : { color: "#808080" }}>{count2}</h3>
                            <p>{footer2}</p>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="time-left text-center">
                            <h3 style={onClickFlag ? { color: "#0f3780" } : { color: "#808080" }}>{count3}</h3>
                            <p>{footer3}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

};

export default MonitoringTripleCard;