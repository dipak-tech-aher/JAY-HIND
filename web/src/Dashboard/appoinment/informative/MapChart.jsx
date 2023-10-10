import { useState, useEffect } from 'react';
import { scaleLinear } from 'd3-scale';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";

const geoUrl =
    'https://raw.githubusercontent.com/deldersveld/topojson/master/world-continents.json';

const MapChart = () => {
    const [data, setData] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);
    const [maxValue, setMaxValue] = useState(0);

    useEffect(() => {
        post(properties.APPOINTMENT_API + '/get-appointment-locations').then((response) => {
            if (response.data) {
                let cities = [];
                console.log('response.data----->', response?.data?.rows);
                response.data.rows.map((ele) => {
                    const lat = ele?.lat_long.split(':')[0]
                    const lng = ele?.lat_long.split(':')[1]
                    console.log('lat------>', lat)
                    console.log('lng------>', lng)
                    lng && lat && cities.push({ name: 'City 1' + new Date() + '', population: 10, lng, lat })
                })
                const sortedCities = cities && cities.length > 0 && cities.sort((a, b) => b.population - a.population);
                setMaxValue(sortedCities[0].population);
                setData(sortedCities);
            }
        }).catch((error) => {
            console.log(error)
        })
    }, [isRefresh]);

    const popScale = scaleLinear().domain([0, maxValue]).range([0, 24]);


    const [hoveredPopulation, setHoveredPopulation] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Location History</span>
                <div className="skel-dashboards-icons">
                    <a href="#"><i className="material-icons">fullscreen</i></a>
                    <a onClick={() => setIsRefresh(!isRefresh)}><i className="material-icons">refresh</i></a>
                    <a href="#"><i className="material-icons">filter_alt</i></a>
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-perf-sect">
                <div className="skel-perf-graph">
                    {/* <ComposableMap projectionConfig={{ rotate: [-10, 0, 0] }}>
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} fill="#DDD" />)
                            }
                        </Geographies>
                        {console.log('data--------->', data)}
                        {data.map(({ name, lng, lat, population }) => (
                            <Marker key={name} coordinates={[lng, lat]}>
                                <circle fill="#F53" stroke="#FFF" r={popScale(population)} />
                            </Marker>
                        ))}
                    </ComposableMap> */}
                    <ComposableMap
                        projectionConfig={{ rotate: [-10, 0, 0] }}
                        style={{ position: 'relative', width: '100%', height: '100%' }}
                    >
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#DDD"
                                        onMouseEnter={(event) => {
                                            // Retrieve the population from the geo object
                                            const population = geo.properties.population;
                                            setHoveredPopulation(population);
                                            const { clientX, clientY } = event;
                                            setTooltipPosition({ x: clientX, y: clientY });
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredPopulation(null);
                                        }}
                                    />
                                ))
                            }
                        </Geographies>
                        {console.log('data--------->', data)}
                        {data.map(({ name, lng, lat, population },i) => (
                            <Marker key={i} coordinates={[lng, lat]}>
                                <circle fill="#F53" stroke="#FFF" r={popScale(population)} />
                            </Marker>
                        ))}
                        {hoveredPopulation && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: tooltipPosition.y + 10,
                                    left: tooltipPosition.x + 10,
                                    backgroundColor: 'white',
                                    padding: '5px',
                                    borderRadius: '5px',
                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                Population: {hoveredPopulation}
                            </div>
                        )}
                    </ComposableMap>
                </div>
            </div>
            <hr className="cmmn-hline" />
        </div>
    );
};

export default MapChart;
