var stat = require('node-static'),
    http = require('http'),
    fs   = require('fs'),
    server;

server = new stat.Server('./public', { cache: 0 });
fs.writeFileSync('./public/palika_track.json', '{}');

function getData () {
  http.get({
    hostname: 'www.redbullxalps.com',
    path: '/api/v2/sql?q=SELECT%20*%20FROM%20(%20SELECT%20date,%20lat,%20lon,%20alt,%20mov_status,%20heading,%20avg_speed,%20climb%20%20FROM%20rbxa17_race_17%20WHERE%20date%20%3E=%20(%272017-07-02T09:30:00Z%27)::TIMESTAMP%20%20AND%20date%20%3C=%20(%272018-01-01T00:00:44Z%27)::TIMESTAMP%20ORDER%20BY%20date%20DESC%20LIMIT%203600)%20desclist%20ORDER%20BY%20date%20ASC',
    headers: {
     'Accept': 'application/json, text/plain, */*'
    }
  }).on('response', function (response) {
      var chunks = '';

        response.on('data', function (chunk) {
           chunks += chunk;
        });

        response.on('end', function () {
          fs.writeFileSync('./public/palika_track.json', chunks);
        });
  });
}

http.createServer(function (request, response) {
  request.addListener('end', function () {
    server.serve(request, response);
  }).resume();
}).listen(process.env.PORT || 3000).on('listening', function () {
  getData();
  setInterval(getData, 120000);
});


