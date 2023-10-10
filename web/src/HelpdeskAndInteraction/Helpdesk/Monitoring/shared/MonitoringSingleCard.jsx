import React from "react";

const MonitoringSingleCard = (props) =>{

    const { header, icon, count, footer,cardStyle, onClickFlag} = props?.data
    
    const onClickListnerHandler = () =>{
        props?.handler?.handleonClickView(header) 
    };
    
    return(
        <div className={ cardStyle ? "card-sec":"card"} >
        <div className="card-body">
            <div className="media">
                <div className="media-body overflow-hidden">
                    <h5 className="header-title" style={{float:"left"}}>{header}</h5> 
                    <p className="img-icon"><i className={icon} aria-hidden="true"></i></p>
                </div>
            </div>
        </div>
        <div className="card-body chat-mon count-act" onClick={onClickFlag ? onClickListnerHandler: ()=>{}} style={onClickFlag ? {cursor: "pointer"}:{cursor: "default"}} >
            <div className="row">
                <div className="col-md-12">
                    <div className="time-left text-center agent-count">
                        <h3 style={ onClickFlag ? {color:"#0f3780"}:{color:"#808080"}}>{count}</h3>
                        <p>{footer}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default MonitoringSingleCard;