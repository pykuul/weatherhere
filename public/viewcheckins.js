console.log('View Checkin Ready !!!');
// Making the leaflet map
const myMap = L.map('checkinMap').setView([0, 0], 2); // latitude, longitude and zoom
// add tiles to the map
const attribution = '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors';
const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileURL, { attribution }).addTo(myMap);

const getData = async () => {
    const fetch_response = await fetch('/api/logs');
    const data_json = await fetch_response.json();
    console.log(data_json);

    const position_list = [];

    for (item of data_json){
        position_list.push([item.lat, item.lon]);
        const marker = L.marker([item.lat, item.lon]).addTo(myMap);

        let txt = `I'm sitting out here at ${item.lat}&deg;, ${item.lon}&deg;, on this
        ${item.weather.summary} day and it feels like ${item.weather.temperature}&deg; outside. `;

        if(item.airquality < 0) {
            txt += "No air quality reading.";
        }else{
            txt += `The concentration of small carcinogenic particles that I'm breathing in are `;
            item.airquality.measurements.forEach(elt => {
                txt += `${elt.parameter} : ${elt.value} ${elt.unit}, `; 
            });
            txt += `measured from ${item.airquality.city} on ${item.airquality.measurements[0].lastUpdated}.`;
        }
        marker.bindPopup(txt);
    }
    console.log(position_list);
}

getData();