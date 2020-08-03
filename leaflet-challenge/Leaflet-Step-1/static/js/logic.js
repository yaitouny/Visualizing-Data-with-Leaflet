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
  var fullURL =
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

  var tectonicPlatesURL =
    "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

  d3.json(fullURL).then(function (response) {
    console.log(response);

    //create markers and heatmap
    var markers = L.markerClusterGroup(); //this is already a master layer
    var heatArray = [];
    var circles = [];

    var earthquakes = response.features;

    earthquakes.forEach(function (earthquake) {
      if (
        earthquake.geometry.coordinates[1] &&
        earthquake.geometry.coordinates[0]
      ) {
        //marker for cluster
        let temp = L.marker([
          +earthquake.geometry.coordinates[1],
          +earthquake.geometry.coordinates[0],
        ]).bindPopup(
          `<h4>${earthquake.properties.place}</h4><hr><p>Magnitude: ${earthquake.properties.mag}</p>`
        );
        markers.addLayer(temp);

        //heatmap points
        heatArray.push([
          +earthquake.geometry.coordinates[1],
          +earthquake.geometry.coordinates[0],
        ]);

        var circle = L.circle(
          [
            +earthquake.geometry.coordinates[1],
            +earthquake.geometry.coordinates[0],
          ],
          {
            fillOpacity: 0.5,
            color: "red",
            fillColor: circleColor(earthquake.properties.mag),
            radius: markerSize(earthquake.properties.mag),
            stroke: true,
            weight: 1,
          }
        ).bindPopup(
          `<h4>${earthquake.properties.place}</h4><hr><p>Magnitude: ${earthquake.properties.mag}</p>`
        );
        circles.push(circle);
      }
    });

    d3.json(tectonicPlatesURL).then(function (plates) {
      let plateLayer = L.geoJson(plates, {
        style: function (feature) {
          return {
            color: "orange",
            weight: 1.5,
          };
        },
      });
      //create heatmap layer
      var heat = L.heatLayer(heatArray, {
        radius: 60,
        blur: 40,
      });

      // create circle layer
      var circleLayer = L.layerGroup(circles);

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
        Circles: circleLayer,
        "Tectonic plates": plateLayer,
      };

      // Creating map object
      var myMap = L.map("map", {
        center: [40.73, -74.0059],
        zoom: 3,
        layers: [darkmap, markers, plateLayer],
      });

      // Create a layer control, containing our baseMaps and overlayMaps, and add them to the map
      myMap.addLayer(markers);
      L.control.layers(baseMaps, overlayMaps).addTo(myMap);

      // Create a legend
      var legend = L.control({ position: "bottomleft" });
      legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");

        //create HTML for legend (has to be i tags)
        div.innerHTML += "<h4>Magnitudes</h4>";
        div.innerHTML +=
          '<i style="background: #FFC300"></i><span>0-1</span><br>';
        div.innerHTML +=
          '<i style="background: #FF5733"></i><span>1-2</span><br>';
        div.innerHTML +=
          '<i style="background: #C70039"></i><span>2-3</span><br>';
        div.innerHTML +=
          '<i style="background: #900C3F"></i><span>3-4</span><br>';
        div.innerHTML +=
          '<i style="background: #581845"></i><span>4-5</span><br>';
        div.innerHTML += '<i style="background: #DAF7A6"></i><span>5+</span>';

        return div;
      };
      legend.addTo(myMap);
    });
  });
}

function markerSize(magnitude) {
  if (magnitude === 0) {
    return 1;
  }
  return magnitude * 60000;
}

function circleColor(magnitude) {
  switch (true) {
    case magnitude >= 5:
      return "#581845";
    case magnitude >= 4:
      return "#900C3F";
    case magnitude >= 3:
      return "#C70039";
    case magnitude >= 2:
      return "#FF5733";
    case magnitude >= 1:
      return "#FFC300";
    default:
      return "#DAF7A6";
  }
}
