var stat = require('node-static'),
    http = require('http'),
    https = require('https'),
    fs   = require('fs'),
    server, events, pilots;

server = new stat.Server('./public', { cache: 0 });
events = [
 1774
];
aggregate = {};

function getData (event) {
  const now = Date.now();
  https.get({
    hostname: 'airtribune.com',
    path: '/api/contest/' + event + '/last_points',
    headers: {
     'Accept': 'application/json, text/plain, */*'
    }
  }).on('response', function (response) {
      var chunks = '';

        response.on('data', function (chunk) {
           chunks += chunk;
        });

        response.on('end', function () {
	  var lastPoints, current, points, aggregatePoints;

	  try {
	    lastPoints = JSON.parse(chunks);

            for (const id in lastPoints) {
		current = lastPoints[id].last_point;

		if (!current) {
		  continue;
		}

 	        aggregatePoints = aggregate[id] || [];
		points = aggregatePoints.map(row => {
			return JSON.stringify(row);
		});

		if (points.includes(JSON.stringify(current)) === false && (now - new Date(current.time).valueOf()) < 64800000) {
			aggregatePoints.push(current);
			aggregate[id] = aggregatePoints;
		}
	    }

            fs.writeFileSync('./public/rolda_aggregate_' + event + '.json', JSON.stringify(aggregate));
            fs.writeFileSync('./public/rolda_' + event + '.json', chunks);
          }
	  catch (err) {
	    console.error(err);
            return;
	  }
        });
  });
}

function processEvents() {
  events.forEach(event => getData(event));
}

http.createServer(function (request, response) {
  request.addListener('end', function () {
    server.serve(request, response);
  }).resume();
}).listen(process.env.PORT || 3000).on('listening', function () {
  processEvents();
  setInterval(processEvents, 25000);
});


