$(function () {
  var palika, viewer, terrainProvider, imageryProvider, initialized, pilots, keys, sections, $events;
  const jancsi = '111381';

  pilots = {
    '1774': {
      '80278' : {
      	name: 'B.Jani',
      	code: 'FE392',
      	color: Cesium.Color.CHARTREUSE,
	trackColor: Cesium.Color.GREENYELLOW
    	},
      '80229' : {
      	name: 'H.Adél',
      	code: 'FE715',
      	color: Cesium.Color.HOTPINK,
	trackColor: Cesium.Color.LIGHTCORAL
    	},
      '80334' : {
      	name: 'T.Pál',
      	code: 'FE443',
      	color: Cesium.Color.DODGERBLUE,
	trackColor: Cesium.Color.CORNFLOWERBLUE
    	},
      '80272' : {
      	name: 'H.Bence',
      	code: 'FE809',
      	color: Cesium.Color.DARKORANGE,
	trackColor: Cesium.Color.GOLD
    	}
    },
    '2236': {
      '111381' : {
        name: 'B.Jani',
        code: 'flymaster-353161078890749',
        color: Cesium.Color.CHARTREUSE,
        trackColor: Cesium.Color.GREENYELLOW
        },
      '111412' : {
        name: 'G.Ricsi',
        code: 'flymaster-357520076109889',
        color: Cesium.Color.HOTPINK,
        trackColor: Cesium.Color.LIGHTCORAL
        },
      '111606' : {
        name: 'F.Szilárd',
        code: 'flymaster-353161078903559',
        color: Cesium.Color.DODGERBLUE,
        trackColor: Cesium.Color.CORNFLOWERBLUE
        },
      '111410' : {
        name: 'H.Bence',
        code: 'flymaster-359316077118849',
        color: Cesium.Color.DARKORANGE,
        trackColor: Cesium.Color.GOLD
        }
    }
  };

  keys = Object.keys(pilots['2236']);

  sections = [];
  /*sections = {
    0: [13.0484000, 47.7988500, 500, 13.1109100, 47.8041300, 1600],
    1: [13.1109100, 47.8041300, 1600, 13.6313330, 46.4385000, 2800],
    2: [13.6313330, 46.4385000, 2800, 12.3331850, 47.7817340, 1500],
    3: [12.3331850, 47.7817340, 1500, 10.8797700, 47.4012900, 3000],
    4: [10.8797700, 47.4012900, 3000, 10.8647020, 45.7725530, 2300],
    5: [10.8647020, 45.7725530, 2300, 7.6583200, 45.9765100, 4500],
    6: [7.6583200, 45.9765100, 4500, 7.4108200, 43.7559400, 600],
    7: [7.4108200, 43.7559400, 600, 7.434, 43.7445, 0]
  };*/

  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZmVhZDYxMC0xOWFhLTRmN2YtODliMi1iMjQ4NDQzMzZiODciLCJpZCI6MjEwODEsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1Nzg5NDM0NDB9.vzjN4c4XuhccCxWWIZL4Tf0H6Nw7OGXLmsKMTntW6SQ';

  //terrainProvider = new Cesium.CesiumTerrainProvider({
  //  url: 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
  //  requestVertexNormals: true
  //});

  terrainProvider = Cesium.createWorldTerrain({
    requestVertexNormals: true
  });

  imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
    url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
  });

  //imageryProvider = Cesium.createWorldImagery({
  //  style : Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS
  //});

  viewer = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    baseLayerPicker: false,
    geocoder: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationInstructionsInitiallyVisible: false,
    terrainProvider: terrainProvider,
    imageryProvider: imageryProvider,
    targetFrameRate: 60
  });

  viewer.scene.globe.enableLighting = true;

  for (var i = 0, section; section = sections[i]; i++) {
    viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(section),
        width: 10,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.RED
        })
      }
    });
  }

  function circle(r) {
    var positions = [], i = 0, rads;

    for (; i < 360; i++) {
      rads = Cesium.Math.toRadians(i);
      positions.push(new Cesium.Cartesian2(r * Math.cos(rads), r * Math.sin(rads)));
    }

    return positions;
  }

  function Palika(viewer) {
    var url, $event, eventId, bounding, aggregate;

    $event = $('#event');
    eventId = $event.val();
    url = './rolda_aggregate_' + eventId + '.json';
    eventId = '2236';

    this.updateStats = function (row) {
      $('#stats').attr({
        'data-utc': 'UTC: ' + row.time,
        'data-local': new Date(row.time).toLocaleString(),
        'data-climb': row.climb,
        'data-alt': row.alt,
        'data-agl': Math.max(0, row.alt - row.agl).toFixed(1),
        'data-speed': row.h_speed,
        'data-move': row.mov_status
      });
    };

    this.onTrackSuccess = function (response) {
      var me = this, jani, str, last, positions, rows, newRows, track, poi;

      if (!response[jancsi]) {
        return;
      }

      jani = response[jancsi];

      let janiLast = Object.assign({}, jani.slice().pop());
      poi = Cesium.Cartographic.fromDegrees(janiLast.lon, janiLast.lat, janiLast.alt, new Cesium.Cartographic());

      Cesium.sampleTerrain(viewer.terrainProvider, 9, [poi])
          .then(function (samples) {
              let marker;

	      viewer.entities.removeAll();
	      for (const id in response) {
        	last = Object.assign({}, response[id].slice().pop());

                last.agl = samples[0].height;

                positions = response[id].map(function (row) {
                  return [row.lon, row.lat, row.alt];
                }).reduce(function (a, b) {
                  return a.concat(b);
                }, []);

              track = Cesium.Cartesian3.fromDegreesArrayHeights(positions);

              if (id === jancsi) {
		me.updateStats(last);

                bounding = new Cesium.BoundingSphere(
                   Cesium.Cartesian3.fromDegrees(last.lon, last.lat, last.alt),
                   1000
                );
              }

	      if (keys.includes(id)) {
                viewer.entities.add({
                  id: id + '-track',
                  name: (pilots[eventId][id] ? pilots[eventId][id].name : 'N/N') + '\'s track',
                  polyline: {
                   positions: track,
                    width: 3, 
		  material: pilots[eventId][id] ? pilots[eventId][id].trackColor : Cesium.Color.POWDERBLUE
                  }
                });

		marker = {
                  id: id,
                  name: pilots[eventId][id] ? pilots[eventId][id].name : 'N/N',
                  position: Cesium.Cartesian3.fromDegrees(last.lon, last.lat, last.alt),
                  label: {
                    text: pilots[eventId][id] ? pilots[eventId][id].name : 'N/N',
                    horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
                    verticalOrigin: Cesium.VerticalOrigin.TOP
                   },
                  cylinder: {
                    length: 30,
                    topRadius: 15,
                    bottomRadius: 0,
                    material:  pilots[eventId][id] ? pilots[eventId][id].color : Cesium.Color.CADETBLUE
                  }
                };
	      } else {
                marker = {
                  id: id,
                  name: 'N/N',
                  position: Cesium.Cartesian3.fromDegrees(last.lon, last.lat, last.alt),
                  cylinder: {
                    length: 10,
		    topRadius: 5,
		    bottomRadius: 5,
		    material: Cesium.Color.CADETBLUE
                 }
		};
              }
              viewer.entities.add(marker);
            }

            if (!initialized) {
              initialized = true;

              $('#findpalika').attr('disabled', false);
              me.flyTo();
            }
          });
    };

    this.flyTo = function () {
      viewer.camera.flyToBoundingSphere(bounding);
    };

    this.getTrack = function () {
      let url = './rolda_aggregate_' + $event.val() + '.json';
      $.getJSON(url)
          .done(this.onTrackSuccess.bind(this))
          .fail(console.log.bind(console, 'Request failed!'));
    };
  }

  $events = $('#event');
  $events.on('change', e => {
	palika.getTrack();
  });

  palika = new Palika(viewer);
  $('#findpalika').on('click', palika.flyTo.bind(palika));
  setTimeout(palika.getTrack.bind(palika), 0);
  // setInterval(palika.getTrack.bind(palika), 60000);
});
