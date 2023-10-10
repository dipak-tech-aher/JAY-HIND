import React from "react";

const MonitoringTripleVerticalCard = (props) => {
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
                <div className="col" onClick={onClickFlag ? onClickListnerHandler : () => { }} style={onClickFlag ? { cursor: "pointer" } : { cursor: "default" }}>
                        <div className="time-left text-center">
                            <div className="number clearfix" style={{display:"block"}}>
                                <span className="color1"></span>
                                <h3 style={onClickFlag ? { color: "#0f3780" } : { color: "#808080" }}>{count1}</h3>
                            {/* </div>
                            <div className="number clearfix" style={{display:"block"}}> */}
                                <span className="color2"></span>
                                <h3 style={onClickFlag ? { color: "#0f3780" } : { color: "#808080" }}>{count2}</h3>
                            {/* </div>
                            <div className="number clearfix" style={{display:"block"}}> */}
                                <span className="color3"></span>
                                <h3 style={onClickFlag ? { color: "#0f3780" } : { color: "#808080" }}>{count3}</h3>
                            </div>
                       
                    </div>
                </div>
            </div>
        </div>
    )
};

export default MonitoringTripleVerticalCard;