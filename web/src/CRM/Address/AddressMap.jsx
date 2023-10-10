import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import {
//     MapContainer,
//     TileLayer,
//     useMap,
//   } from 'https://cdn.esm.sh/react-leaflet'
// import { MapContainer } from 'react-leaflet/MapContainer'
// import { TileLayer } from 'react-leaflet/TileLayer'
import "leaflet/dist/leaflet.css";
import LeafletControlGeocoder from './LeafletControlGeocoder';

const AddressMap = (props) => {
    
    const {setAddressString, setAddressData, fetchCountryList} = props?.handler
    const {addressData, latitude, longitude, countries} = props?.data
    const position = [latitude, longitude];
    
    return (
        <>
            {/* <MapContainer center={position} zoom={13} style={{ height: "100vh" }}>
            <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
            </MapContainer> */}
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100vh" }}>
                <TileLayer style={{display:'none'}}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LeafletControlGeocoder handler={{setAddressString, setAddressData, fetchCountryList}} data={{addressData, latitude, longitude, countries}}/>
            </MapContainer>
        </>
    )
}

export default AddressMap