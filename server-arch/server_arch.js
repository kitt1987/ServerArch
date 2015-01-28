function BackReq(req, mime_type) {
  this.url = req;
  this.mime_type = mime_type;
  this.weight = 1;
}

BackReq.prototype.ref = function() {
  this.weight += 1;
}

BackReq.prototype.sameAs = function(request) {
  return this.url == request.url && this.mime_type == request.mime_type;
}

function BackServer(server_arch, name, from, ssl) {
  this.dname = name;
  this.from = from;
  this.use_ssl = ssl;
  this.requests = [];

  // FIXME handle browsers are not supported!
  var pos = server_arch.getNextPos();
  var size = server_arch.getServerSize();
  var canvas_obj = document.createElement("CANVAS");
  canvas_obj.height = size.height;
  this.canvas = new Canvas2D(canvas_obj);
  this.canvas.changeColor('rgb(51, 204, 255');
  this.canvas.changeText(null, 'black');
  __Log('Draw server at {' + pos.x + ',' + pos.y + '} size {' + size.width + ',' + size.height + '}');
  this.canvas.drawRec(pos.x, pos.y, size.width, size.height, name);
  server_arch.appendServer(this);
}

BackServer.prototype.getCanvasObj = function() {
  return this.canvas.getCanvasObj();
}

BackServer.prototype.appendRequest = function(req) {
  for (var id in this.requests) {
    if (this.requests[id].sameAs(req)) {
      this.requests[id].ref();
      return;
    }
  }

  this.requests.push(req);
}

function ServerArch() {
  this.server_page = document.getElementById('servers');
  this.servers = [];
  this.server_names = [];
  this.num_reqs = 0;
  this.distance_between_servers = 5;
  this.server_size = {width: 100, height: 50};
// watch the page reload and clear data
}

ServerArch.prototype.reqHandler = function(request) {
  this.num_reqs += 1;
  var mime_type = null;
  if (request.response.status != 200) {
      __Log("The response is " + request.response.status);
  } else {
    for (var each in request.response.headers) {
        if (request.response.headers[each].name == "Content-Type") {
          mime_type = request.response.headers[each].value.trim();
      }
    }
  }

  __Log('mime_type:' + mime_type);
  __Log('headers in total:' + request.request.headers.length);

  for (var each in request.request.headers) {
    __Log('Header:' + request.request.headers[each].name + "," + (request.request.headers[each].name == "Host"));
    if (request.request.headers[each].name == "Host") {
      var host = request.request.headers[each].value.trim();
      var i = this.server_names.indexOf(host);
      __Log('Lookup host:' + host + ',' + i);
      var req = new BackReq(request.request.url, mime_type);
      if (i >= 0) {
        __Log('Found server ' + host);
        this.servers[i].appendRequest(req);
        return;
      }

      // FIXME ssl
      var s = new BackServer(this, host);
      s.appendRequest(req);
      this.server_names.push(host);
      this.servers.push(s);
      if (this.server_names.length != this.servers.length) {
        __Log('The length of names is different from servers');
      }
    }
  }
}

ServerArch.prototype.getServerSize = function() {
  return this.server_size;
}

ServerArch.prototype.getNextPos = function() {
  return {x: 0, y: 0};
}

ServerArch.prototype.appendServer = function(back_server) {
  this.server_page.appendChild(back_server.getCanvasObj());
}

function __Log(text) {
  chrome.experimental.devtools.console.addMessage(
    chrome.experimental.devtools.console.Severity.Warning,
    text);

//  console.log(text);
}

function ct(dn) {
  return {
      response: {
        status: 200
      },

      request: {
        headers: [
          {
            name: 'Host',
            value: dn
          }
        ],
        url: 'aaa.bbb.ccc'
      }
    };
}

(function() {
    var main = new ServerArch();
    chrome.devtools.network.onRequestFinished.addListener(main.reqHandler.bind(main));
    /*
    main.reqHandler(ct('aaa.com'));
    main.reqHandler(ct('bbb.com'));
    main.reqHandler(ct('ccc.com'));
    main.reqHandler(ct('ddd.com'));
    */

    __Log('ServerArch Initialized!');
})();