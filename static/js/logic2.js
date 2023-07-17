// Store the API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

  // Define a function to determine the circle size based on the magnitude.
  function getCircleSize(magnitude) {
    if (magnitude < 1) {
      return 5;
    } else if (magnitude < 3) {
      return 10;
    } else if (magnitude < 5) {
      return 15;
    } else if (magnitude < 7) {
      return 20;
    } else if (magnitude < 9) {
      return 25;
    } else {
      return 30;
    }
  }

  // Define a function to determine the circle color based on the magnitude.
  function getCircleColor(magnitude) {
    if (magnitude < 1) {
      return "#a3f600";
    } else if (magnitude < 3) {
      return "#dcf400";
    } else if (magnitude < 5) {
      return "#f7db11";
    } else if (magnitude < 7) {
      return "#fdb72a";
    } else if (magnitude < 9) {
      return "#fca35d";
    } else {
      return "#ff5f65";
    }
  }

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}<p>Magnitude: ${feature.properties.mag}<p>Link: <a href="${feature.properties.url}"target="_blank">Click for details</a></h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }


  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      // Create a circle marker for each earthquake feature.
      return L.circleMarker(latlng, {
        radius: getCircleSize(feature.properties.mag),
        fillColor: getCircleColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: onEachFeature
  });

  // Send the earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create the map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it the baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend.
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "legend");
    let magnitudes = [0, 1, 3, 5, 7, 9];
    let labels = [];
  
    let title = '<div class="legend-title">Magnitude Scale</div>';
    labels.push(title);
  
    for (let i = 0; i < magnitudes.length; i++) {
      let color = getCircleColor(magnitudes[i] + 0.1);
      let label = magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] : "+");
  
      labels.push(
        '<div class="legend-item">' +
          '<div class="legend-color-bar" style="background-color:' + color + '"></div>' +
          '<div class="legend-label">' + label + '</div>' +
        '</div>'
      );
    }
  
    div.innerHTML = labels.join("");
    return div;
  };

  legend.addTo(myMap);
}
