console.log('Checkin Ready !!!');
function setup() {
    noCanvas();
    const video = createCapture(VIDEO);
    video.size(220,180);

    let lat, lon, weather, airquality;

    if ("geolocation" in navigator){
        console.log("Geolocation available!");
        navigator.geolocation.getCurrentPosition(async position => {
            lat  = position.coords.latitude;
            lon = position.coords.longitude;
            console.log(lat, lon);
    
            const fetch_response = await fetch(`/api/weather/${lat},${lon}`);
            const data_json = await fetch_response.json();
            console.log(data_json);
            
            weather = data_json.weather.currently;
            console.log(weather);
    
            document.getElementById("latitude").textContent = lat.toFixed(2);
            document.getElementById("longitude").textContent = lon.toFixed(2);
            document.getElementById("weather_sumary").textContent = weather.summary;
            document.getElementById('temperature').textContent = ((weather.temperature - 32)/1.8).toFixed(1);
            if (data_json.airquality.meta.found == 0) {
                airquality = -1;
                console.log(airquality);
                document.getElementById('air_parameter').textContent = "Không có dữ liệu đo lường";
                document.getElementById('location').hidden = true;
            } else {
                airquality = data_json.airquality.results[0];
                console.log(airquality);
                let air_parameter = document.getElementById('air_parameter');
                airquality.measurements.forEach(elt => {
                    air_parameter.innerHTML += `- Nồng độ: ${elt.parameter} : ${elt.value} ${elt.unit} <br />`; 
                })
                document.getElementById('city').textContent = airquality.city;
                document.getElementById("air_date").textContent = Date(airquality.measurements[0].lastUpdated).toLocaleString();
            };
        });
        document.getElementById('checkin').addEventListener('click', async event => {
            const mood = document.getElementById('mood').value;

            video.loadPixels(); // load the pixel of video to the canvas as image
            const image64 = video.canvas.toDataURL(); // base64 encoding of image

            const data = { lat, lon, weather, airquality, mood, image64 };
    
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            };
            const fetch_response = await fetch('/api/savedata', options);
            const data_json = await fetch_response.json();
            console.log(data_json);
        })
        
    
    }else{
        console.log('this does not support geolocation');
        document.getElementById("status").textContent = "Sorry!!! Trình duyệt của bạn hiện không hỗ trợ GPS";
        document.getElementById("maincontent").hidden = true;
    };
    
}
