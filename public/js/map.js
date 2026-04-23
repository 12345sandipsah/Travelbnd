

mapboxgl.accessToken = mapToken;
console.log(listing);

const map = new mapboxgl.Map({ 
  container: "map", // container ID
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/standard", // style URL
  center: listing.geometry.coordinates, // starting position
  zoom: 6, // starting zoom
});

// Creates a new scale control to measure the map
const scale = new mapboxgl.ScaleControl({
  maxWidth: 120, // the max pixel width of the scale bar to be rendered on the map (default is 100 pixels)
  unit: "imperial", // The type of measurement displayed, options are: 'imperial', 'metric', 'nautical' (default it metric)
});

// Adds the new scale control to the map
map.addControl(scale);

const marker1 = new mapboxgl.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(
        `<h4>${listing.location},${listing.country}</h4><p>Excat  location is provided after booking!</p>`,
      )
      .setMaxWidth("400px"),
  )
  .addTo(map);
