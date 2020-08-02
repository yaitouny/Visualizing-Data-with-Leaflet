$(document).ready(function () {
  makeMap();
});

function makeMap() {
  //clear map
  $("#mapParent").empty();
  $("#mapParent").append('<div style="height:700px" id="map"></div>');

  // Adding tile layer to the map
  var streetmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY,
    }
  );

  var lightmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY,
    }
  );

  var darkmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY,
    }
  );

  var satellitemap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "satellite-streets-v11",
      accessToken: API_KEY,
    }
  );

  // TODO:
  var fullURL = "https://gbfs.citibikenyc.com/gbfs/en/station_information.json";

  d3.json(fullURL).then(function (response) {
    // console.log(data);

    //create markers and heatmap
    var markers = L.markerClusterGroup(); //this is already a master layer
    var heatArray = [];

    var stations = response.data.stations;

    stations.forEach(function (station) {
      if (station.lat && station.lon) {
        //marker for cluster
        let temp = L.marker([+station.lat, +station.lon]).bindPopup(
          `<h3>${station.name}</h3><hr><h5>Capacity: ${station.capacity}</h5>`
        );
        markers.addLayer(temp);

        //heatmap points
        heatArray.push([+station.lat, +station.lon]);
      }
    });

    //create heatmap layer
    var heat = L.heatLayer(heatArray, {
      radius: 60,
      blur: 40,
    });

    // Create a baseMaps object to contain the streetmap and darkmap
    var baseMaps = {
      Street: streetmap,
      Dark: darkmap,
      Light: lightmap,
      Satellite: satellitemap,
    };

    // Create an overlayMaps object here to contain the "State Population" and "City Population" layers
    var overlayMaps = {
      Heatmap: heat,
      Markers: markers,
    };

    // Creating map object
    var myMap = L.map("map", {
      center: [40.73, -74.0059],
      zoom: 11,
      layers: [darkmap, markers],
    });

    // Create a layer control, containing our baseMaps and overlayMaps, and add them to the map
    myMap.addLayer(markers);
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
  });
}
