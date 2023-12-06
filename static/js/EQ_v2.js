//Choose your data source set:

//let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";
//let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
//let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";
//let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";



// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
});

  //determine size by nested if else 
  function getCircleSize(magnitude) {
    if (magnitude < 1) {
      return 3;
    } else if (magnitude < 3) {
      return 7;
    } else if (magnitude < 5) {
      return 15;
    } else if (magnitude < 7) {
      return 25;
    } else if (magnitude < 9) {
      return 30;
    } else {
      return 40;
    }
  }

  //determine color by nested if else
  function getCircleColor(depth) {
    if (depth <= 10) {
      return "#a3f600";
    } else if (depth <= 30) {
      return "#dcf400";
    } else if (depth <= 50) {
      return "#f7db11";
    } else if (depth <= 70) {
      return "#fdb72a";
    } else if (depth <= 90) {
      return "#fca35d";
    } else {
      return "#ff5f65";
    }
  }

function createFeatures(earthquakeData) {
  //adds my pop up details
  function onEachFeature(feature, layer) {
    layer.bindPopup(`
      <h3>${feature.properties.place}
      <p>Magnitude: ${feature.properties.mag}
      <p>Depth: ${feature.geometry.coordinates[2]} km
      <p>Link: <a href="${feature.properties.url}"target="_blank">Click for details</a>
      </h3>
      <hr><p>${new Date(feature.properties.time)}</p>
      `
    );
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      //uses my 2 previous functions for each data point
      return L.circleMarker(latlng, {
        radius: getCircleSize(feature.properties.mag),
        fillColor: getCircleColor(feature.geometry.coordinates[2]),
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

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //my legend.
  let legend = L.control({ position: "bottomright" });

  //set up variables/location
  legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "legend");
    //let magnitudes = [0, 1, 3, 5, 7, 9];
    let depths = [10, 30, 50, 70, 90];
    let labels = [];
  
  //legend title
  let title = '<div class="legend-title">Depth Scale</div>';
  labels.push(title);

  for (let i = 0; i < depths.length; i++) {
    let color = getCircleColor(depths[i]);
    let label = (i === 0 ? "< " : depths[i - 1] + " - ") + depths[i] + " km";

    labels.push(
      '<div class="legend-item">' +
        '<div class="legend-color-bar" style="background-color:' + color + '"></div>' +
        '<div class="legend-label">' + label + '</div>' +
      '</div>'
    );
  }

  //after the for loop runs we add the final 'if greater than or equal to' legend item ">"
  let lastColor = getCircleColor(depths[depths.length]);
  let lastLabel = "≥ " + depths[depths.length - 1] + " km";
  labels.push(
    '<div class="legend-item">' +
      '<div class="legend-color-bar" style="background-color:' + lastColor + '"></div>' +
      '<div class="legend-label">' + lastLabel + '</div>' +
    '</div>'
  );

  div.innerHTML = labels.join("");
  return div;
};
  legend.addTo(myMap);
}
