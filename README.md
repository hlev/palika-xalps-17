# jani-rolda-2020
Barna Jani Roldanillo Open 3D LiveTracking (kind of)

Based on my previous Palika X-Alps '17 tracking app. 

This time the server collects data from Airtribune and aggregates "last point" information for each pilot.
Multiple pilots could be tracked, but first one has to figue out which data points represent the pilot of interest which did not seem to be straightforward.
This is a single data point for Jani in Day 3 - Task 2:

```
 "80278" : {
  "last_point" : {
     "battery" : 0,
     "time" : "2020-01-13T18:26:07",
     "lat" : 3.95075,
     "lon" : -76.21817,
     "alt" : 2135,
     "h_speed" : 63,
     "utm" : "18 N 364757.988491 436782.589805"
  },
  "device_type_name" : "Flymaster Live",
  "device_type" : "flymaster",
  "device_type_name_short" : "FM Live",
  "name" : "FE392",
  "id" : "flymaster-359316073868991",
  "device_id" : "359316073868991"
}
```

The URL for this data is in the format `https://airtribune.com/api/contest/<event_id>/last_points`.
The `event_id` can be observed from the URL of these requests in the official Airtribune 2D tracking, when an event is in progress (i.e. "Watch Live").
Then we assume that the pilot's string ID remains the same across events, in this case `"80278"` for Jani.

Should that change, it needs to be adjusted in a few places in source code.

The engine, [Cesium](http://cesiumjs.org), is the same one that the popular 3D track visualization service [Doarama](https://doarama.com/) (now called ayvri) uses and it was used for the official 2015 X-Alps live tracking as well. 

## Installation
You could either deploy this to a heroku-16 stack (Node 6.11.0) or run it locally:

```
$ npm install
$ node main.js
```
Visit `localhost:3000`

## Usage 
After opening the page, the app will query for tracklogs. Once available it will fly to Jani's position and point the camera at him.
The green upside-down cone is Jani, the other pilots are smaller grey cylinders.

If you tilt/zoom/pan and get lost, press "Find Jani" to reset the position.
Happy tracking, Go Jani!

## Logs
The browser polls the server for data every minute and redraws the track and the green upside-down cone marker that signifies the last entry in the tracklog. Data from the last track point is shown on the data panel.

## Disclaimer
This was hacked together in an evening after...because, why not? We are using data as-is from the Airtribune API. I'm not a geographer, so may have made mistakes. I simply relied on the brilliant Cesium library.

## Licence
MIT kindly extended with the Do Whatever You Like licence.
