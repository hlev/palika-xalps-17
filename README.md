# palika-xalps-17
HUN1 P. Takats X-Alps 2017 LiveTracking (kind of)

Data comes from the offical Red Bull X-Alps site.
We're piggybacking on their (at first sight) hairy API that allows SQL queries in URL query strings.
Hopefully the db user has read rights only. Be nice.

The engine, [Cesium](http://cesiumjs.org), is the same one that the popular 3D track visualization service [Doarama](https://doarama.com/) uses and it was used for the 2015 X-Alps live tracking as well. 

## Installation
You could either deploy this to a heroku-16 stack (Node 6.11.0) or run it locally:

```
$ npm install
$ node main.js
```
Visit `localhost:3000`

## Usage 
After opening the page, the app will query for Palika's tracklog. Once available it will fly to his position and point the camera at him.

If you tilt/zoom/pan and get lost, press "Find Palika" to reset the position.
Happy tracking, Go Palika!

## Logs
The app keeps only 1 hour worth of logs on the server, given I used a free account at [Heroku](https://www.heroku.com/).
1 hour is ~500Kb so it could probably store more safely.

The browser polls the server for data every 2 minutes and redraws the track and the green upside-down cone marker that signifies the last entry in the tracklog. Data from the last track point is shown on the data panel. If you keep the app open in the browser, it will concatenate new track data to what it already has, so you can see the whole day if you don't close the page.

Race sections are drawn as red dotted line.

## Possible improvements
- Error handling
- Code style/architecture...obviously
- optimizations for weaker hardware
- More pilots
- A seekable timeline
- Data displayed for arbitrary points on the timeline
- Different visuals for hiking/flying sections 
- VR mode when flying
- Selectable map imagery, or simply more overlays, eg. hiking trails
- More accurate AGL calculation
- TP columns
- Other POIs
- Distance calculation
- etc.

## Disclaimer
This was hacked together in an evening after reading fellow pilots' complaints about the official live tracking and to make up for the lack of 3D visulaization. I'm not a geographer, so may have made mistakes. I simply relied on the brilliant Cesium library that I have not used before.

## Licence
MIT kindly extended with the Do Whatever You Like licence.
