$(function () {
  var palika, viewer, terrainProvider, imageryProvider, initialized, sections;

  sections = {
    0: [13.0484000, 47.7988500, 500, 13.1109100, 47.8041300, 1600],
    1: [13.1109100, 47.8041300, 1600, 13.6313330, 46.4385000, 2800],
    2: [13.6313330, 46.4385000, 2800, 12.3331850, 47.7817340, 1500],
    3: [12.3331850, 47.7817340, 1500, 10.8797700, 47.4012900, 3000],
    4: [10.8797700, 47.4012900, 3000, 10.8647020, 45.7725530, 2300],
    5: [10.8647020, 45.7725530, 2300, 7.6583200, 45.9765100, 4500],
    6: [7.6583200, 45.9765100, 4500, 7.4108200, 43.7559400, 600],
    7: [7.4108200, 43.7559400, 600, 7.434, 43.7445, 0]
  };

  Cesium.BingMapsApi.defaultKey = 'sk.eyJ1IjoiaGxldjgwIiwiYSI6ImNqNHByNmUzbDIzajYzM3FhZGlvbHFhb2QifQ.aadTC9-Lm_1CmgrCETHvMA';

  terrainProvider = new Cesium.CesiumTerrainProvider({
    url: 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
    requestVertexNormals: true
  });

  imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
    url: 'http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
  });

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
    var url = './palika_track.json', bounding, aggregate;

    this.updateStats = function (row) {
      $('#stats').attr({
        'data-utc': 'UTC: ' + row.date,
        'data-local': new Date(row.date).toLocaleString(),
        'data-climb': row.climb,
        'data-alt': row.alt,
        'data-agl': Math.max(0, row.alt - row.agl).toFixed(1),
        'data-speed': row.avg_speed,
        'data-move': row.mov_status
      });
    };

    this.onTrackSuccess = function (response) {
      var me = this, last, positions, rows, newRows, track, poi;

      if (!response.rows) {
        return;
      }

      aggregate = aggregate || response;
      rows = aggregate.rows;
      rows = rows.map(function (row) {
        return JSON.stringify(row);
      });

      newRows = response.rows.filter(function (row) {
        return rows.indexOf(JSON.stringify(row)) === -1;
      });

      aggregate.rows = aggregate.rows.concat(newRows);

      last = aggregate.rows.slice().pop();
      poi = Cesium.Cartographic.fromDegrees(last.lon, last.lat, last.alt, new Cesium.Cartographic());

      Cesium.sampleTerrain(viewer.terrainProvider, 9, [poi])
          .then(function (samples) {
            last.agl = samples[0].height;
            me.updateStats(last);

            positions = aggregate.rows.map(function (row) {
              return [row.lon, row.lat, row.alt];
            }).reduce(function (a, b) {
              return a.concat(b);
            }, []);

            track = Cesium.Cartesian3.fromDegreesArrayHeights(positions);

            viewer.entities.removeById('palika');
            viewer.entities.removeById('palika-track');
            viewer.entities.add({
              id: 'palika-track',
              name: 'Palika\'s track points',
              polyline: {
                positions: track,
                width: 3,
                material: Cesium.Color.CORNFLOWERBLUE
              }
            });

            viewer.entities.add({
              id: 'palika',
              name: 'Palika',
              position: Cesium.Cartesian3.fromDegrees(last.lon, last.lat, last.alt),
              cylinder: {
                length: 60,
                topRadius: 30,
                bottomRadius: 0,
                material: Cesium.Color.CHARTREUSE
              }
            });

            bounding = new Cesium.BoundingSphere(
                Cesium.Cartesian3.fromDegrees(last.lon, last.lat, last.alt),
                1000
            );

            if (!initialized) {
              initialized = true;

              $('#findpalika').attr('disabled', false);
              me.flyTo();

              /*viewer.camera.flyTo({
               destination: Cesium.Cartesian3.fromDegrees(last.lon, last.lat, Math.max(last.alt, 6000)),
               orientation: {
               heading: (last.heading + 180) % 360,
               pitch: -0.8,
               roll: 0.0
               }
               });*/
            }
          });
    };

    this.flyTo = function () {
      viewer.camera.flyToBoundingSphere(bounding);
    };

    this.getTrack = function () {
      $.getJSON(url)
          .done(this.onTrackSuccess.bind(this))
          .fail(console.log.bind(console, 'Request failed!'));
    };
  }

  palika = new Palika(viewer);
  $('#findpalika').on('click', palika.flyTo.bind(palika));
  setTimeout(palika.getTrack.bind(palika), 0);
  setInterval(palika.getTrack.bind(palika), 120000);
});
