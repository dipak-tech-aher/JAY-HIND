import EquiSvg from "../../../assets/images/ops/equi.svg"
import SuccessCalSvg from "../../../assets/images/ops/success-cal.svg"
import WarnCalSvg from "../../../assets/images/ops/warn-cal.svg"
import DangerCalSvg from "../../../assets/images/ops/danger-cal.svg"
import moment from 'moment';


const DashboardOverview =(props)=>{

    const {setSelectedEntity, updateSearchParams } = props.handler
    const {assignedAge, type } = props.data
    const entityType = type === 'Interaction' ? 'Interaction' : type === 'Order' ? 'Order' :'Request'
    const todayDate = moment().format("YYYY-MM-DD");
    const thirdDate = moment().add(-3, 'days').format("YYYY-MM-DD");
    const fifthDate = moment().add(-5, 'days').format("YYYY-MM-DD");
    return(
        // col-lg-4 col-md-12 col-xs-12  dashboard-overview-card"
        <div className="col-lg-4 col-md-12 col-xs-12 brd-right-visible"> 
            <div className="skel-dashboard-tiles">
                <span className="skel-header-title">{entityType} Overview</span>
                <div className="skel-tile-sect">
                    <div className="skel-tile-info" onClick={() => {
                        setSelectedEntity(`${entityType} - All`);
                        updateSearchParams(entityType, undefined, undefined, "All")
                    }}>
                        <div className="skel-tile-icon skel-tile-b-color">
                            <img src={EquiSvg} />
                        </div>
                        <div className="skel-tile-data">
                            <p>Total {entityType}</p>
                            <span>{assignedAge?.total || 0}</span>
                        </div>
                    </div>
                    <div className="skel-tile-info" onClick={() => {
                        setSelectedEntity(`${entityType} - 0 to 3 Days`);
                        updateSearchParams(entityType, todayDate, thirdDate, "0 to 3 Days")
                    }}>
                        <div className="skel-tile-icon skel-tile-g-color">
                            <img src={SuccessCalSvg} />
                        </div>
                        <div className="skel-tile-data">
                            <p>0 to 3 Days</p>
                            <span>{assignedAge?.threeDays || 0}</span>
                        </div>
                    </div>
                </div>
                <div className="skel-tile-sect">
                    <div className="skel-tile-info" onClick={() => {
                        setSelectedEntity(`${entityType} - 3 to 5 Days`);
                        updateSearchParams(entityType, thirdDate, fifthDate, "3 to 5 Days")
                    }}>
                        <div className="skel-tile-icon skel-tile-y-color">
                            <img src={WarnCalSvg} />
                        </div>
                        <div className="skel-tile-data">
                            <p>3 to 5 Days</p>
                            <span>{assignedAge?.fiveDays || 0}</span>
                        </div>
                    </div>
                    <div className="skel-tile-info" onClick={() => {
                        setSelectedEntity(`${entityType} - More than 5 Days`);
                        updateSearchParams(entityType, fifthDate, undefined, "More than 5 Days")
                    }}>
                        <div className="skel-tile-icon skel-tile-r-color">
                            <img src={DangerCalSvg} />
                        </div>
                        <div className="skel-tile-data">
                            <p>&gt; 5 Days</p>
                            <span>{assignedAge?.morethan || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardOverview