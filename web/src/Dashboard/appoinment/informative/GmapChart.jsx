import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import Filter from './Filter';
import locationPng from '../../../assets/images/location.png';
import "leaflet/dist/leaflet.css";
import icon from "../../../CRM/Address/constants";

const GmapChart = () => {
    const [isRefresh, setIsRefresh] = useState(false);
    const [locations, setLocations] = useState();
    const [filterParams, setFilterParams] = useState()

    useEffect(() => {
        post(properties.APPOINTMENT_API + '/get-appointment-locations', filterParams).then((response) => {
            if (response.data) {
                setLocations(response.data.rows)
            }
        }).catch((error) => {
            console.log(error)
        })
    }, [isRefresh, filterParams]);

    const filtration = (e) => {
        setFilterParams({ tran_category_type: e?.target?.value })
    }
    const [entityType, setEntityType] = useState()

    return (
        <div className="cmmn-skeleton mt-3">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Location History</span>
                <div className="skel-dashboards-icons1">
                    <a onClick={() => setIsRefresh(!isRefresh)}><i className="material-icons">refresh</i></a>&nbsp;&nbsp;
                    <Filter
                        data={{ entityType }}
                        handlers={{
                            filtration,
                            setEntityType
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-perf-sect">
                <div className="skel-perf-graph">
                    {console.log('locations ', locations)}
                    {locations && locations.length > 0 ? <MapContainer center={locations[0].position} zoom={5} style={{ height: '600px', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="Map data © OpenStreetMap contributors"
                        />
                        {locations.map((location, index) => (
                            <Marker key={index} position={location.position} icon={icon}>
                                <Popup>
                                    <div>
                                        <h3>{location.name}</h3>
                                        <p>{location.info}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                :<div style={{ marginTop:'45%', marginLeft:'45%' }}><b>No Data Available</b></div>    
                }
                </div>
            </div>
        </div>
    );
};

export default GmapChart;
