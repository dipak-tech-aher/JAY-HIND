// import L from "leaflet";
import L from "./leafletGeosearchFix";

import markerIcon2x from "../../assets/images/marker-icon-2x.png";
import markerShadow from "../../assets/images/marker-shadow.png";

export default L.icon({
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
  iconUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png"
});


export const customIcon = L.icon({
  iconUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [12, 41],
  shadowAnchor: [12, 41],
});
