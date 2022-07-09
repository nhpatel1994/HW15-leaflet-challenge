// Store our API endpoint as queryURl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  console.log('data is displayed below')
  console.log(data)
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------

function createFeatures(earthquakeData) {

    console.log('earthquakeData is displayed below')
    console.log(earthquakeData)
    console.log(earthquakeData.length)

    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer)
    {
      layer.bindPopup(
          `<h3>Location: ${feature.properties.place}</h3>
           <hr>
           <p>Time: ${new Date(feature.properties.time)}</p>
           <hr>
           <p>Depth: ${feature.geometry.coordinates[2]}</p>
           <hr>
           <p>Magnitude: ${feature.properties.mag}</p>`
           );
    }

    // This function determines the color of each circle
    // Darker shades for greater depth earthquakes
    function circleColor(feature)
    {
      if (feature.geometry.coordinates[2] > 90) {
        return "#ff3333";
      }
      else if (feature.geometry.coordinates[2] > 70) {
        return "#ff8000";
      }
      else if (feature.geometry.coordinates[2] > 50) {
        return "#ffb366";
      }
      else if (feature.geometry.coordinates[2] > 30) {
        return "#ffd9b3";
      }
      else if (feature.geometry.coordinates[2] > 10) {
        return "#ffff99";
      }
      else {
        return "#b3ff66";
      }
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    var earthquakes = L.geoJSON(earthquakeData, { 
      onEachFeature: onEachFeature, 
      pointToLayer: function(feature, latlng){
        return L.circleMarker(latlng)
      },
      style: function(feature){
        return {
          fillOpacity: 0.75,
          fillColor: circleColor(feature),
          color: 'black', //add color function,
          radius: feature.properties.mag * 6,
          weight: 1
        }
      }
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}

// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 
    { attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'});

  // Create a baseMaps object.
  var baseMaps = { "Street Map": street, "Topographic Map": topo };

  // Create an overlay object to hold our overlay.
  var overlayMaps = { Earthquakes: earthquakes };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [ 37.09, -95.71 ],
    zoom: 4,
    layers: [street, earthquakes]
  });

  // Create a legend.

  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend");
    var depthLabels = [0,10,30,50,70,90];
    var colors = ["#b3ff66","#ffff99","#ffd9b3","#ffb366","#ff8000","#ff3333"];

    div.innerHTML = '<center>Depth of<br>Earthquake<center>'

    for (var i = 0; i < depthLabels.length; i++) {
        div.innerHTML += 
            '<li style="background:'+ colors[i] + '"></li> ' +
            depthLabels[i] + (depthLabels[i + 1] ? ' &ndash; ' + depthLabels[i + 1] + '<br>' : ' +');
    }
    return div;
  };
  legend.addTo(myMap);

  

  // Create a layer control. Pass it our baseMaps and overlayMaps. Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
}