import L from "leaflet";

// Override the default icon URLs used by leaflet-geosearch
L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.9.3/dist/images/";

// Export the modified L object
export default L;
