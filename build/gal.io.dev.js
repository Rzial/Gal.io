(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Gal = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    "CONST": require('./core/const'),
    "io": require('./io')
};
},{"./core/const":17,"./io":26}],2:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? (this || self)
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(err || new_err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":3,"reduce":4}],3:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],4:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],5:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint Champion
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "1.2";
var methodOptions = {
    "": "/api/lol/{region}/v{version}/champion",
    "id": "/api/lol/{region}/v{version}/champion/{id}"
};

module.exports = function() {
    var Champion = function(options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions[""], {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Champion.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.id, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    Champion.methodVersion = methodVersion;

    return Champion;
};
},{"../core/const":17,"../utils/region-exists":27,"../utils/string-replacer":28,"superagent":2}],6:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint Current Game
 *
 *  RITO_COMPLAINT: The CORS policy in this API call make it unavailable to use it from client javascript without
 *  using "hacks" like jsonp proxy :(.
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "1.0";
var methodOptions = {
    "": "/observer-mode/rest/consumer/getSpectatorGameInfo/{platformId}/{summonerId}"
};

module.exports = function() {
    var CurrentGame = function(summonerId, options, callback) {
        console.warn("This Endpoint is buggy for client javascript, it will not work. " +
        "Look at the RITO_COMPLAINT tag in the source code.");

        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions[""], {
            version: methodVersion,
            platformId: CONST.REGIONAL_ENDPOINT[this.region].platformId,
            summonerId: summonerId
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    CurrentGame.methodVersion = methodVersion;

    return CurrentGame;
};
},{"../core/const":17,"../utils/region-exists":27,"../utils/string-replacer":28,"superagent":2}],7:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint Featured Games
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "1.0";
var methodOptions = {
    "": "/observer-mode/rest/featured"
};

module.exports = function() {
    var FeaturedGames = function(options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions[""], {
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    FeaturedGames.methodVersion = methodVersion;

    return FeaturedGames;
};
},{"../core/const":17,"../utils/region-exists":27,"../utils/string-replacer":28,"superagent":2}],8:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint Game
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "1.3";
var methodOptions = {
    "": "/api/lol/{region}/v{version}/game/by-summoner/{summonerId}/recent"
};

module.exports = function() {
    var Game = function(summonerId, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions[""], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerId: summonerId
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Game.methodVersion = methodVersion;

    return Game;
};
},{"../core/const":17,"../utils/region-exists":27,"../utils/string-replacer":28,"superagent":2}],9:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint League
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists'),
    typeCheck = require('../utils/type-check');

var methodVersion = "2.5";
var methodOptions = {
    "bySummoner": "/api/lol/{region}/v{version}/league/by-summoner/{summonerIds}",
    "bySummoner-entry": "/api/lol/{region}/v{version}/league/by-summoner/{summonerIds}/entry",
    "byTeam": "/api/lol/{region}/v{version}/league/by-team/{teamIds}",
    "byTeam-entry": "/api/lol/{region}/v{version}/league/by-team/{teamIds}/entry",
    "challenger": "/api/lol/{region}/v{version}/league/challenger",
    "master": "/api/lol/{region}/v{version}/league/master"
};

module.exports = function() {
    var League = function(options, callback) {
        callback("Error: This endpoint dont exists");
        return this;
    }.bind(this);

    League.bySummoner = function (summonerIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var summoners;
        if (typeCheck.isArray(summonerIds))
            summoners = summonerIds.join(", ");
        else
            summoners = summonerIds;

        stringReplacer(methodOptions.bySummoner, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerIds: summoners
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    League.bySummoner.entry = function (summonerIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var summoners;
        if (typeCheck.isArray(summonerIds))
            summoners = summonerIds.join(", ");
        else
            summoners = summonerIds;

        stringReplacer(methodOptions["bySummoner-entry"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerIds: summoners
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    League.byTeam = function (teamIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var teams;
        if (typeCheck.isArray(teamIds))
            teams = teamIds.join(", ");
        else
            teams = teamIds;

        stringReplacer(methodOptions.byTeam, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            teamIds: teams
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    League.byTeam.entry = function (teamIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var teams;
        if (typeCheck.isArray(teamIds))
            teams = teamIds.join(", ");
        else
            teams = teamIds;

        stringReplacer(methodOptions["byTeam-entry"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            teamIds: teams
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    League.challenger = function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.challenger, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    League.master = function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.master, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    League.methodVersion = methodVersion;

    return League;
};
},{"../core/const":17,"../utils/region-exists":27,"../utils/string-replacer":28,"../utils/type-check":29,"superagent":2}],10:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint LOL Static Data
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "1.2";
var methodOptions = {
    "champion": "/api/lol/static-data/{region}/v{version}/champion",
    "champion-id": "/api/lol/static-data/{region}/v{version}/champion/{id}",
    "item": "/api/lol/static-data/{region}/v{version}/item",
    "item-id": "/api/lol/static-data/{region}/v{version}/item/{id}",
    "languageStrings": "/api/lol/static-data/{region}/v{version}/language-strings",
    "languages": "/api/lol/static-data/{region}/v{version}/languages",
    "map": "/api/lol/static-data/{region}/v{version}/map",
    "mastery": "/api/lol/static-data/{region}/v{version}/mastery",
    "mastery-id": "/api/lol/static-data/{region}/v{version}/mastery/{id}",
    "realm": "/api/lol/static-data/{region}/v{version}/realm",
    "rune": "/api/lol/static-data/{region}/v{version}/rune",
    "rune-id": "/api/lol/static-data/{region}/v{version}/rune/{id}",
    "summonerSpell": "/api/lol/static-data/{region}/v{version}/summoner-spell",
    "summonerSpell-id": "/api/lol/static-data/{region}/v{version}/summoner-spell/{id}",
    "versions": "/api/lol/static-data/{region}/v{version}/versions"
};

module.exports = function() {
    var LOLStaticData = function(options, callback) {
        callback("Error: This endpoint dont exists");
        return this;
    }.bind(this);

    LOLStaticData.champion = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.champion, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.champion.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions["champion-id"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.item = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.item, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.item.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions["item-id"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.languageStrings = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.languageStrings, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.languages = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.languages, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.map = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.map, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.mastery = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.mastery, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.mastery.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions["mastery-id"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.realm = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.realm, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.rune = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.rune, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.rune.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions["rune-id"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.summonerSpell = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.summonerSpell, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.summonerSpell.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions["summonerSpell-id"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.versions = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.versions, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.methodVersion = methodVersion;

    return LOLStaticData;
};
},{"../core/const":17,"../utils/region-exists":27,"../utils/string-replacer":28,"superagent":2}],11:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint LOL Status
 *
 *  RITO_COMPLAINT: The server fires an error when the api key is included on the request (even if not needed) in
 *  the region version but not on the global one.
 *
 *  Error: The 'Access-Control-Allow-Origin' header contains multiple values '*, *', but only one is allowed.
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer');

var methodVersion = "1.0";
var methodOptions = {
    "": "/shards",
    "region": "/shards/{region}"
};

module.exports = function() {
    var LOLStatus = function(options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        stringReplacer(methodOptions[""], {
        }, function (err, resultString) {
            var resultUrl = ["http://", CONST.REGIONAL_ENDPOINT.Status.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    LOLStatus.region = (function (region, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        stringReplacer(methodOptions.region, {
            region: region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["http://", CONST.REGIONAL_ENDPOINT.Status.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStatus.methodVersion = methodVersion;

    return LOLStatus;
};
},{"../core/const":17,"../utils/string-replacer":28,"superagent":2}],12:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint Match History
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "2.2";
var methodOptions = {
    "": "/api/lol/{region}/v{version}/matchhistory/{summonerId}"
};

module.exports = function() {
    var MatchHistory = function(summonerId, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions[""], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerId: summonerId
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    MatchHistory.methodVersion = methodVersion;

    return MatchHistory;
};
},{"../core/const":17,"../utils/region-exists":27,"../utils/string-replacer":28,"superagent":2}],13:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint Match
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "2.2";
var methodOptions = {
    "": "/api/lol/{region}/v{version}/match/{matchId}"
};

module.exports = function() {
    var Match = function(matchId, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions[""], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            matchId: matchId
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Match.methodVersion = methodVersion;

    return Match;
};
},{"../core/const":17,"../utils/region-exists":27,"../utils/string-replacer":28,"superagent":2}],14:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint Stats
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "1.3";
var methodOptions = {
    "ranked": "/api/lol/{region}/v{version}/stats/by-summoner/{summonerId}/ranked",
    "summary": "/api/lol/{region}/v{version}/stats/by-summoner/{summonerId}/summary"
};

module.exports = function() {
    var Stats = function(options, callback) {
        callback("Error: This endpoint dont exists");
        return this;
    }.bind(this);

    Stats.ranked = function(summonerId, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.ranked, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerId: summonerId
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Stats.summary = function(summonerId, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.summary, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerId: summonerId
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Stats.methodVersion = methodVersion;

    return Stats;
};
},{"../core/const":17,"../utils/region-exists":27,"../utils/string-replacer":28,"superagent":2}],15:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint Summoner
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists'),
    typeCheck = require('../utils/type-check');

var methodVersion = "1.4";
var methodOptions = {
    "": "/api/lol/{region}/v{version}/summoner/{summonerIds}",
    "masteries": "/api/lol/{region}/v{version}/summoner/{summonerIds}/masteries",
    "name": "/api/lol/{region}/v{version}/summoner/{summonerIds}/name",
    "runes": "/api/lol/{region}/v{version}/summoner/{summonerIds}/runes",
    "byName": "/api/lol/{region}/v{version}/summoner/by-name/{summonerNames}"
};

module.exports = function() {
    var Summoner = function(summonerIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var summoners;
        if (typeCheck.isArray(summonerIds))
            summoners = summonerIds.join(", ");
        else
            summoners = summonerIds;

        stringReplacer(methodOptions[""], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerIds: summoners
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Summoner.masteries = function(summonerIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var summoners;
        if (typeCheck.isArray(summonerIds))
            summoners = summonerIds.join(", ");
        else
            summoners = summonerIds;

        stringReplacer(methodOptions.masteries, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerIds: summoners
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Summoner.runes = function(summonerIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var summoners;
        if (typeCheck.isArray(summonerIds))
            summoners = summonerIds.join(", ");
        else
            summoners = summonerIds;

        stringReplacer(methodOptions.runes, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerIds: summoners
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Summoner.getName = function(summonerIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var summoners;
        if (typeCheck.isArray(summonerIds))
            summoners = summonerIds.join(", ");
        else
            summoners = summonerIds;

        stringReplacer(methodOptions.name, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerIds: summoners
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Summoner.byName = function(summonerNames, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var summoners;
        if (typeCheck.isArray(summonerNames))
            summoners = summonerNames.join(", ");
        else
            summoners = summonerNames;

        stringReplacer(methodOptions.byName, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerNames: summoners
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Summoner.methodVersion = methodVersion;

    return Summoner;
};
},{"../core/const":17,"../utils/region-exists":27,"../utils/string-replacer":28,"../utils/type-check":29,"superagent":2}],16:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint Team
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists'),
    typeCheck = require('../utils/type-check');

var methodVersion = "2.4";
var methodOptions = {
    "": "/api/lol/{region}/v{version}/team/{teamIds}",
    "bySummoner": "/api/lol/{region}/v{version}/team/by-summoner/{summonerIds}"
};

module.exports = function() {
    var Team = function(teamIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var teams;
        if (typeCheck.isArray(teamIds))
            teams = teamIds.join(", ");
        else
            teams = teamIds;

        stringReplacer(methodOptions[""], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            teamIds: teams
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Team.bySummoner = function(summonerIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var summoners;
        if (typeCheck.isArray(summonerIds))
            summoners = summonerIds.join(", ");
        else
            summoners = summonerIds;

        stringReplacer(methodOptions.bySummoner, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerIds: summoners
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Team.methodVersion = methodVersion;

    return Team;
};
},{"../core/const":17,"../utils/region-exists":27,"../utils/string-replacer":28,"../utils/type-check":29,"superagent":2}],17:[function(require,module,exports){
/**
 * League of Legends API
 *  Consts
 *
 * REFERENCE: https://developer.riotgames.com/docs/game-constants
 *
 * TODO: Match timeline data position values
 * TODO: Rune slot Id
 *
 */

var CONST = {
    "REGIONAL_ENDPOINT": require('./const/regional-endpoint'),
    "MATCHMAKING_QUEUES": require('./const/matchmaking-queues'),
    "MAP_NAME": require('./const/map-name'),
    "GAME_MODE": require('./const/game-mode'),
    "GAME_TYPE": require('./const/game-type'),
    "SUBTYPE": require('./const/subtype'),
    "PLAYER_STAT_SUMMARY_TYPE": require('./const/player-stat-summary-type'),
    "SEASON": require('./const/season')
};

module.exports = CONST;
},{"./const/game-mode":18,"./const/game-type":19,"./const/map-name":20,"./const/matchmaking-queues":21,"./const/player-stat-summary-type":22,"./const/regional-endpoint":23,"./const/season":24,"./const/subtype":25}],18:[function(require,module,exports){
/**
 * League of Legends API
 *  Game Mode
 *
 */

var GAME_MODE = {
    "CUSTOM_GAME": {
        "gameType": "CUSTOM_GAME",
        "description": "Custom games"
    },

    "TUTORIAL_GAME": {
        "gameType": "TUTORIAL_GAME",
        "description": "Tutorial games"
    },

    "MATCHED_GAME": {
        "gameType": "MATCHED_GAME",
        "description": "All other games"
    }
};

module.exports = GAME_MODE;
},{}],19:[function(require,module,exports){
/**
 * League of Legends API
 *  Game Type
 *
 */

var GAME_TYPE = {
    "CLASSIC": {
        "gameMode": "CLASSIC",
        "description": "Classic Summoner's Rift and Twisted Treeline games"
    },

    "ODIN": {
        "gameMode": "ODIN",
        "description": "Dominion/Crystal Scar games"
    },

    "ARAM": {
        "gameMode": "ARAM",
        "description": "ARAM games"
    },

    "TUTORIAL": {
        "gameMode": "TUTORIAL",
        "description": "Tutorial games"
    },

    "ONEFORALL": {
        "gameMode": "ONEFORALL",
        "description": "One for All games"
    },

    "ASCENSION": {
        "gameMode": "ASCENSION",
        "description": "Ascension games"
    },

    "FIRSTBLOOD": {
        "gameMode": "FIRSTBLOOD",
        "description": "Snowdown Showdown games"
    },

    "KINGPORO": {
        "gameMode": "KINGPORO",
        "description": "King Poro games"
    }
};

module.exports = GAME_TYPE;
},{}],20:[function(require,module,exports){
/**
 * League of Legends API
 *  Map Name
 *
 */

var MAP_NAME = {
    1: {
        "mapId": 1,
        "name": "Summoner's Rift",
        "notes": "Original Summer Variant"
    },

    2: {
        "mapId": 2,
        "name": "Summoner's Rift",
        "notes": "Original Autumn Variant"
    },

    3: {
        "mapId": 3,
        "name": "The Proving Grounds",
        "notes": "Tutorial Map"
    },

    4: {
        "mapId": 4,
        "name": "Twisted Treeline",
        "notes": "Original Version"
    },

    8: {
        "mapId": 8,
        "name": "The Crystal Scar",
        "notes": "Dominion Map"
    },

    10:	{
        "mapId": 10,
        "name": "Twisted Treeline",
        "notes": "Current Version"
    },

    11:	{
        "mapId": 11,
        "name": "Summoner's Rift",
        "notes": "Current Version"
    },

    12:	{
        "mapId": 12,
        "name": "Howling Abyss",
        "notes": "ARAM Map"
    }
};

module.exports = MAP_NAME;
},{}],21:[function(require,module,exports){
/**
 * League of Legends API
 *  Matchmacking Queues
 *
 */

var MATCHMAKING_QUEUES = {
    "CUSTOM": {
        "queueType": "CUSTOM",
        "gameQueueConfigId": 0,
        "name": "Custom games"
    },

    "NORMAL_5x5_BLIND": {
        "queueType": "NORMAL_5x5_BLIND",
        "gameQueueConfigId": 2,
        "name": "Normal 5v5 Blind Pick games"
    },

    "BOT_5x5": {
        "queueType": "BOT_5x5",
        "gameQueueConfigId": 7,
        "name": "Historical Summoner's Rift Coop vs AI games"
    },

    "BOT_5x5_INTRO": {
        "queueType": "BOT_5x5_INTRO",
        "gameQueueConfigId": 31,
        "name": "Summoner's Rift Coop vs AI Intro Bot games"
    },

    "BOT_5x5_BEGINNER": {
        "queueType": "BOT_5x5_BEGINNER",
        "gameQueueConfigId": 32,
        "name": "Summoner's Rift Coop vs AI Beginner Bot games"
    },

    "BOT_5x5_INTERMEDIATE": {
        "queueType": "BOT_5x5_INTERMEDIATE",
        "gameQueueConfigId": 33,
        "name": "Historical Summoner's Rift Coop vs AI Intermediate Bot games"
    },

    "NORMAL_3x3": {
        "queueType": "NORMAL_3x3",
        "gameQueueConfigId": 8,
        "name": "Normal 3v3 games"
    },

    "NORMAL_5x5_DRAFT": {
        "queueType": "NORMAL_5x5_DRAFT",
        "gameQueueConfigId": 14,
        "name": "Normal 5v5 Draft Pick games"
    },

    "ODIN_5x5_BLIND": {
        "queueType": "ODIN_5x5_BLIND",
        "gameQueueConfigId": 16,
        "name": "Dominion 5v5 Blind Pick games"
    },

    "ODIN_5x5_DRAFT": {
        "queueType": "ODIN_5x5_DRAFT",
        "gameQueueConfigId": 17,
        "name": "Dominion 5v5 Draft Pick games"
    },

    "BOT_ODIN_5x5": {
        "queueType": "BOT_ODIN_5x5",
        "gameQueueConfigId": 25,
        "name": "Dominion Coop vs AI games"
    },

    "RANKED_SOLO_5x5": {
        "queueType": "RANKED_SOLO_5x5",
        "gameQueueConfigId": 4,
        "name": "Ranked Solo 5v5 games"
    },

    "RANKED_PREMADE_3x3": {
        "queueType": "RANKED_PREMADE_3x3",
        "gameQueueConfigId": 9,
        "name": "Ranked Premade 3v3 games"
    },

    "RANKED_PREMADE_5x5": {
        "queueType": "RANKED_PREMADE_5x5",
        "gameQueueConfigId": 6,
        "name": "Ranked Premade 5v5 games"
    },

    "RANKED_TEAM_3x3": {
        "queueType": "RANKED_TEAM_3x3",
        "gameQueueConfigId": 41,
        "name": "Ranked Team 3v3 games"
    },

    "RANKED_TEAM_5x5": {
        "queueType": "RANKED_TEAM_5x5",
        "gameQueueConfigId": 42,
        "name": "Ranked Team 5v5 games"
    },

    "BOT_TT_3x3": {
        "queueType": "BOT_TT_3x3",
        "gameQueueConfigId": 52,
        "name": "Twisted Treeline Coop vs AI games"
    },

    "GROUP_FINDER_5x5": {
        "queueType": "GROUP_FINDER_5x5",
        "gameQueueConfigId": 61,
        "name": "Team Builder games"
    },

    "ARAM_5x5": {
        "queueType": "ARAM_5x5",
        "gameQueueConfigId": 65,
        "name": "ARAM games"
    },

    "ONEFORALL_5x5": {
        "queueType": "ONEFORALL_5x5",
        "gameQueueConfigId": 70,
        "name": "One for All games"
    },

    "FIRSTBLOOD_1x1": {
        "queueType": "FIRSTBLOOD_1x1",
        "gameQueueConfigId": 72,
        "name": "Snowdown Showdown 1v1 games"
    },

    "FIRSTBLOOD_2x2": {
        "queueType": "FIRSTBLOOD_2x2",
        "gameQueueConfigId": 73,
        "name": "Snowdown Showdown 2v2 games"
    },

    "SR_6x6": {
        "queueType": "SR_6x6",
        "gameQueueConfigId": 75,
        "name": "Summoner's Rift 6x6 Hexakill games"
    },

    "URF_5x5": {
        "queueType": "URF_5x5",
        "gameQueueConfigId": 76,
        "name": "Ultra Rapid Fire games"
    },

    "BOT_URF_5x5": {
        "queueType": "BOT_URF_5x5",
        "gameQueueConfigId": 83,
        "name": "Ultra Rapid Fire games played against AI games"
    },

    "NIGHTMARE_BOT_5x5_RANK1": {
        "queueType": "NIGHTMARE_BOT_5x5_RANK1",
        "gameQueueConfigId": 91,
        "name": "Doom Bots Rank 1 games"
    },

    "NIGHTMARE_BOT_5x5_RANK2": {
        "queueType": "NIGHTMARE_BOT_5x5_RANK2",
        "gameQueueConfigId": 92,
        "name": "Doom Bots Rank 2 games"
    },

    "NIGHTMARE_BOT_5x5_RANK5": {
        "queueType": "NIGHTMARE_BOT_5x5_RANK5",
        "gameQueueConfigId": 93,
        "name": "Doom Bots Rank 5 games"
    },

    "ASCENSION_5x5": {
        "queueType": "ASCENSION_5x5",
        "gameQueueConfigId": 96,
        "name": "Ascension games"
    },

    "HEXAKILL": {
        "queueType": "HEXAKILL",
        "gameQueueConfigId": 98,
        "name": "Twisted Treeline 6x6 Hexakill games"
    },

    "KING_PORO_5x5": {
        "queueType": "KING_PORO_5x5",
        "gameQueueConfigId": 300,
        "name": "King Poro games"
    },

    "COUNTER_PICK": {
        "queueType": "COUNTER_PICK",
        "gameQueueConfigId": 310,
        "name": "Nemesis games"
    }
};

module.exports = MATCHMAKING_QUEUES;
},{}],22:[function(require,module,exports){
/**
 * League of Legends API
 *  Player Stat Summary Type
 *
 */

var SUBTYPE = {
    "Unranked": {
        "playerStatSummaryType": "Unranked",
        "description": "Summoner's Rift unranked games"
    },

    "Unranked3x3": {
        "playerStatSummaryType": "Unranked3x3",
        "description": "Twisted Treeline unranked games"
    },

    "OdinUnranked": {
        "playerStatSummaryType": "OdinUnranked",
        "description": "Dominion/Crystal Scar games"
    },

    "AramUnranked5x5": {
        "playerStatSummaryType": "AramUnranked5x5",
        "description": "ARAM / Howling Abyss games"
    },

    "CoopVsAI": {
        "playerStatSummaryType": "CoopVsAI",
        "description": "Summoner's Rift and Crystal Scar games played against AI"
    },

    "CoopVsAI3x3": {
        "playerStatSummaryType": "CoopVsAI3x3",
        "description": "Twisted Treeline games played against AI"
    },

    "RankedSolo5x5": {
        "playerStatSummaryType": "RankedSolo5x5",
        "description": "Summoner's Rift ranked solo queue games"
    },

    "RankedTeam3x3": {
        "playerStatSummaryType": "RankedTeam3x3",
        "description": "Twisted Treeline ranked team games"
    },

    "RankedTeam5x5": {
        "playerStatSummaryType": "RankedTeam5x5",
        "description": "Summoner's Rift ranked team games"
    },

    "OneForAll5x5": {
        "playerStatSummaryType": "OneForAll5x5",
        "description": "One for All games"
    },

    "FirstBlood1x1": {
        "playerStatSummaryType": "FirstBlood1x1",
        "description": "Snowdown Showdown 1x1 games"
    },

    "FirstBlood2x2": {
        "playerStatSummaryType": "FirstBlood2x2",
        "description": "Snowdown Showdown 2x2 games"
    },

    "SummonersRift6x6": {
        "playerStatSummaryType": "SummonersRift6x6",
        "description": "Summoner's Rift 6x6 Hexakill games"
    },

    "CAP5x5": {
        "playerStatSummaryType": "CAP5x5",
        "description": "Team Builder games"
    },

    "URF": {
        "playerStatSummaryType": "URF",
        "description": "Ultra Rapid Fire games"
    },

    "URFBots": {
        "playerStatSummaryType": "URFBots",
        "description": "Ultra Rapid Fire games played against AI"
    },

    "NightmareBot": {
        "playerStatSummaryType": "NightmareBot",
        "description": "Summoner's Rift games played against Nightmare AI"
    },

    "Ascension": {
        "playerStatSummaryType": "Ascension",
        "description": "Ascension games"
    },

    "Hexakill": {
        "playerStatSummaryType": "Hexakill",
        "description": "Twisted Treeline 6x6 Hexakill games"
    },

    "KingPoro": {
        "playerStatSummaryType": "KingPoro",
        "description": "King Poro games"
    },

    "CounterPick": {
        "playerStatSummaryType": "CounterPick",
        "description": "Nemesis games"
    }
};

module.exports = SUBTYPE;
},{}],23:[function(require,module,exports){
/**
 * League of Legends API
 *  Regional Endpoint
 *
 */

var REGIONAL_ENDPOINT = {
    "BR": {
        "region": "BR",
        "platformId": "BR1",
        "host": "br.api.pvp.net"
    },

    "EUNE": {
        "region": "EUNE",
        "platformId": "EUNE1",
        "host": "eune.api.pvp.net"
    },

    "EUW": {
        "region": "EUW",
        "platformId": "EUW1",
        "host": "euw.api.pvp.net"
    },

    "KR": {
        "region": "KR",
        "platformId": "KR",
        "host": "kr.api.pvp.net"
    },

    "LAN": {
        "region": "LAN",
        "platformId": "LA1",
        "host": "lan.api.pvp.net"
    },

    "LAS": {
        "region": "LAS",
        "platformId": "LA2",
        "host": "las.api.pvp.net"
    },

    "NA": {
        "region": "NA",
        "platformId": "NA1",
        "host": "na.api.pvp.net"
    },

    "OCE": {
        "region": "OCE",
        "platformId": "OC1",
        "host": "oce.api.pvp.net"
    },

    "TR": {
        "region": "TR",
        "platformId": "TR1",
        "host": "tr.api.pvp.net"
    },

    "RU": {
        "region": "RU",
        "platformId": "RU",
        "host": "ru.api.pvp.net"
    },

    "PBE": {
        "region": "PBE",
        "platformId": "PBE1",
        "host": "global.api.pvp.net"
    },

    "Global": {
        "region": "Global",
        "platformId": null,
        "host": "global.api.pvp.net"
    },

    "Status": {
        "region": "Status",
        "platformId": null,
        "host": "status.leagueoflegends.com"
    }
};

module.exports = REGIONAL_ENDPOINT;
},{}],24:[function(require,module,exports){
/**
 * League of Legends API
 *  Season
 *
 *  RITO_COMPLAINT: This constants are not documented in the constant section. Added it for the Stats endpoint
 */

var SEASON = {
    "SEASON3": "SEASON3",
    "SEASON2014": "SEASON2014",
    "SEASON2015": "SEASON2015"
};

module.exports = SEASON;
},{}],25:[function(require,module,exports){
/**
 * League of Legends API
 *  Subtype
 *
 */

var SUBTYPE = {
    "NONE": {
        "subType": "NONE",
        "description": "Custom games"
    },

    "NORMAL": {
        "subType": "NORMAL",
        "description": "Summoner's Rift unranked games"
    },

    "NORMAL_3x3": {
        "subType": "NORMAL_3x3",
        "description": "Twisted Treeline unranked games"
    },

    "ODIN_UNRANKED": {
        "subType": "ODIN_UNRANKED",
        "description": "Dominion/Crystal Scar games"
    },

    "ARAM_UNRANKED_5x5": {
        "subType": "ARAM_UNRANKED_5x5",
        "description": "ARAM / Howling Abyss games"
    },

    "BOT": {
        "subType": "BOT",
        "description": "Summoner's Rift and Crystal Scar games played against Intro, Beginner, or Intermediate AI"
    },

    "BOT_3x3": {
        "subType": "BOT_3x3",
        "description": "Twisted Treeline games played against AI"
    },

    "RANKED_SOLO_5x5": {
        "subType": "RANKED_SOLO_5x5",
        "description": "Summoner's Rift ranked solo queue games"
    },

    "RANKED_TEAM_3x3": {
        "subType": "RANKED_TEAM_3x3",
        "description": "Twisted Treeline ranked team games"
    },

    "RANKED_TEAM_5x5": {
        "subType": "RANKED_TEAM_5x5",
        "description": "Summoner's Rift ranked team games"
    },

    "ONEFORALL_5x5": {
        "subType": "ONEFORALL_5x5",
        "description": "One for All games"
    },

    "FIRSTBLOOD_1x1": {
        "subType": "FIRSTBLOOD_1x1",
        "description": "Snowdown Showdown 1x1 games"
    },

    "FIRSTBLOOD_2x2": {
        "subType": "FIRSTBLOOD_2x2",
        "description": "Snowdown Showdown 2x2 games"
    },

    "SR_6x6": {
        "subType": "SR_6x6",
        "description": "Summoner's Rift 6x6 Hexakill games"
    },

    "CAP_5x5": {
        "subType": "CAP_5x5",
        "description": "Team Builder games"
    },

    "URF": {
        "subType": "URF",
        "description": "Ultra Rapid Fire games"
    },

    "URF_BOT": {
        "subType": "URF_BOT",
        "description": "Ultra Rapid Fire games played against AI"
    },

    "NIGHTMARE_BOT": {
        "subType": "NIGHTMARE_BOT",
        "description": "Summoner's Rift games played against Nightmare AI"
    },

    "ASCENSION": {
        "subType": "ASCENSION",
        "description": "Ascension games"
    },

    "HEXAKILL": {
        "subType": "HEXAKILL",
        "description": "Twisted Treeline 6x6 Hexakill games"
    },

    "KING_PORO": {
        "subType": "KING_PORO",
        "description": "King Poro games"
    },

    "COUNTER_PICK": {
        "subType": "COUNTER_PICK",
        "description": "Nemesis games"
    }
};

module.exports = SUBTYPE;
},{}],26:[function(require,module,exports){
/**
 * League of Legends API
 *  Endpoint Binding (IO)
 */

module.exports = function (apiKey, region) {
    var io = {
        api_key: apiKey,
        region: region
    };

    io.Champion = require('./api/champion').apply(io);
    io.CurrentGame = require('./api/current-game').apply(io);
    io.FeaturedGames = require('./api/featured-games').apply(io);
    io.Game = require('./api/game').apply(io);
    io.League = require('./api/league').apply(io);
    io.LOLStaticData = require('./api/lol-static-data').apply(io);
    io.LOLStatus = require('./api/lol-status').apply(io);
    io.Match = require('./api/match').apply(io);
    io.MatchHistory = require('./api/match-history').apply(io);
    io.Stats = require('./api/stats').apply(io);
    io.Summoner = require('./api/summoner').apply(io);
    io.Team = require('./api/team').apply(io);

    return io;
};
},{"./api/champion":5,"./api/current-game":6,"./api/featured-games":7,"./api/game":8,"./api/league":9,"./api/lol-static-data":10,"./api/lol-status":11,"./api/match":13,"./api/match-history":12,"./api/stats":14,"./api/summoner":15,"./api/team":16}],27:[function(require,module,exports){
var CONST = require('../core/const');

module.exports = function (region, callback) {
    if (CONST.REGIONAL_ENDPOINT[region] === undefined) {
        callback("Error: Region not provided or invalid.");
        return false;
    }

    return true;
};
},{"../core/const":17}],28:[function(require,module,exports){
/**
 * League of Legends API
 *  String replacer
 */

module.exports = function (originString, replaceWith, callback) {
    for (var id in replaceWith)
        if (replaceWith.hasOwnProperty(id))
            originString = originString.replace(new RegExp("{" + id + "}"), replaceWith[id]);

    var matches = originString.match(new RegExp("{.*?}", "g"));

    callback(matches, originString);
};
},{}],29:[function(require,module,exports){
var whatType = Object.prototype.toString;

module.exports = {
    isObject: function(object) {
    return (whatType.call(object) === "[object Object]");
    },

    isFunction: function(object) {
        return (whatType.call(object) === "[object Function]");
    },

    isArray : function(object) {
        return (whatType.call(object) === "[object Array]");
    },

    isString: function(object) {
        return (whatType.call(object) === "[object String]");
    },

    isNumber: function(object) {
        return (whatType.call(object) === "[object Number]");
    }
};
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvY2xpZW50LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiLCJzcmMvYXBpL2NoYW1waW9uLmpzIiwic3JjL2FwaS9jdXJyZW50LWdhbWUuanMiLCJzcmMvYXBpL2ZlYXR1cmVkLWdhbWVzLmpzIiwic3JjL2FwaS9nYW1lLmpzIiwic3JjL2FwaS9sZWFndWUuanMiLCJzcmMvYXBpL2xvbC1zdGF0aWMtZGF0YS5qcyIsInNyYy9hcGkvbG9sLXN0YXR1cy5qcyIsInNyYy9hcGkvbWF0Y2gtaGlzdG9yeS5qcyIsInNyYy9hcGkvbWF0Y2guanMiLCJzcmMvYXBpL3N0YXRzLmpzIiwic3JjL2FwaS9zdW1tb25lci5qcyIsInNyYy9hcGkvdGVhbS5qcyIsInNyYy9jb3JlL2NvbnN0LmpzIiwic3JjL2NvcmUvY29uc3QvZ2FtZS1tb2RlLmpzIiwic3JjL2NvcmUvY29uc3QvZ2FtZS10eXBlLmpzIiwic3JjL2NvcmUvY29uc3QvbWFwLW5hbWUuanMiLCJzcmMvY29yZS9jb25zdC9tYXRjaG1ha2luZy1xdWV1ZXMuanMiLCJzcmMvY29yZS9jb25zdC9wbGF5ZXItc3RhdC1zdW1tYXJ5LXR5cGUuanMiLCJzcmMvY29yZS9jb25zdC9yZWdpb25hbC1lbmRwb2ludC5qcyIsInNyYy9jb3JlL2NvbnN0L3NlYXNvbi5qcyIsInNyYy9jb3JlL2NvbnN0L3N1YnR5cGUuanMiLCJzcmMvaW8uanMiLCJzcmMvdXRpbHMvcmVnaW9uLWV4aXN0cy5qcyIsInNyYy91dGlscy9zdHJpbmctcmVwbGFjZXIuanMiLCJzcmMvdXRpbHMvdHlwZS1jaGVjay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbm1DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIFwiQ09OU1RcIjogcmVxdWlyZSgnLi9jb3JlL2NvbnN0JyksXHJcbiAgICBcImlvXCI6IHJlcXVpcmUoJy4vaW8nKVxyXG59OyIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdyZWR1Y2UnKTtcblxuLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdCA9ICd1bmRlZmluZWQnID09IHR5cGVvZiB3aW5kb3dcbiAgPyAodGhpcyB8fCBzZWxmKVxuICA6IHdpbmRvdztcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbnJlcXVlc3QuZ2V0WEhSID0gZnVuY3Rpb24gKCkge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdFxuICAgICAgJiYgKCFyb290LmxvY2F0aW9uIHx8ICdmaWxlOicgIT0gcm9vdC5sb2NhdGlvbi5wcm90b2NvbFxuICAgICAgICAgIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgdHJpbSA9ICcnLnRyaW1cbiAgPyBmdW5jdGlvbihzKSB7IHJldHVybiBzLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7IH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHBhaXJzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAobnVsbCAhPSBvYmpba2V5XSkge1xuICAgICAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICAgICArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvYmpba2V5XSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFpcnMuam9pbignJicpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbiAvKipcbiAgKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAqIEByZXR1cm4ge09iamVjdH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciBwYXJ0cztcbiAgdmFyIHBhaXI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBhcnRzID0gcGFpci5zcGxpdCgnPScpO1xuICAgIG9ialtkZWNvZGVVUklDb21wb25lbnQocGFydHNbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAnYXBwbGljYXRpb24veG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICAnYXBwbGljYXRpb24vanNvbic6IEpTT04uc3RyaW5naWZ5XG4gfTtcblxuIC8qKlxuICAqIERlZmF1bHQgcGFyc2Vycy5cbiAgKlxuICAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICAqICAgICB9O1xuICAqXG4gICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyKSB7XG4gIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICB2YXIgZmllbGRzID0ge307XG4gIHZhciBpbmRleDtcbiAgdmFyIGxpbmU7XG4gIHZhciBmaWVsZDtcbiAgdmFyIHZhbDtcblxuICBsaW5lcy5wb3AoKTsgLy8gdHJhaWxpbmcgQ1JMRlxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBtaW1lIHR5cGUgZm9yIHRoZSBnaXZlbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0eXBlKHN0cil7XG4gIHJldHVybiBzdHIuc3BsaXQoLyAqOyAqLykuc2hpZnQoKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGhlYWRlciBmaWVsZCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcmFtcyhzdHIpe1xuICByZXR1cm4gcmVkdWNlKHN0ci5zcGxpdCgvICo7ICovKSwgZnVuY3Rpb24ob2JqLCBzdHIpe1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgvICo9ICovKVxuICAgICAgLCBrZXkgPSBwYXJ0cy5zaGlmdCgpXG4gICAgICAsIHZhbCA9IHBhcnRzLnNoaWZ0KCk7XG5cbiAgICBpZiAoa2V5ICYmIHZhbCkgb2JqW2tleV0gPSB2YWw7XG4gICAgcmV0dXJuIG9iajtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXNwb25zZWAgd2l0aCB0aGUgZ2l2ZW4gYHhocmAuXG4gKlxuICogIC0gc2V0IGZsYWdzICgub2ssIC5lcnJvciwgZXRjKVxuICogIC0gcGFyc2UgaGVhZGVyXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogIEFsaWFzaW5nIGBzdXBlcmFnZW50YCBhcyBgcmVxdWVzdGAgaXMgbmljZTpcbiAqXG4gKiAgICAgIHJlcXVlc3QgPSBzdXBlcmFnZW50O1xuICpcbiAqICBXZSBjYW4gdXNlIHRoZSBwcm9taXNlLWxpa2UgQVBJLCBvciBwYXNzIGNhbGxiYWNrczpcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJykuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJywgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgU2VuZGluZyBkYXRhIGNhbiBiZSBjaGFpbmVkOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5zZW5kKClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnBvc3QoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIE9yIGZ1cnRoZXIgcmVkdWNlZCB0byBhIHNpbmdsZSBjYWxsIGZvciBzaW1wbGUgY2FzZXM6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogQHBhcmFtIHtYTUxIVFRQUmVxdWVzdH0geGhyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gUmVzcG9uc2UocmVxLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLnJlcSA9IHJlcTtcbiAgdGhpcy54aHIgPSB0aGlzLnJlcS54aHI7XG4gIC8vIHJlc3BvbnNlVGV4dCBpcyBhY2Nlc3NpYmxlIG9ubHkgaWYgcmVzcG9uc2VUeXBlIGlzICcnIG9yICd0ZXh0JyBhbmQgb24gb2xkZXIgYnJvd3NlcnNcbiAgdGhpcy50ZXh0ID0gKCh0aGlzLnJlcS5tZXRob2QgIT0nSEVBRCcgJiYgKHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJycgfHwgdGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAndGV4dCcpKSB8fCB0eXBlb2YgdGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAndW5kZWZpbmVkJylcbiAgICAgPyB0aGlzLnhoci5yZXNwb25zZVRleHRcbiAgICAgOiBudWxsO1xuICB0aGlzLnN0YXR1c1RleHQgPSB0aGlzLnJlcS54aHIuc3RhdHVzVGV4dDtcbiAgdGhpcy5zZXRTdGF0dXNQcm9wZXJ0aWVzKHRoaXMueGhyLnN0YXR1cyk7XG4gIHRoaXMuaGVhZGVyID0gdGhpcy5oZWFkZXJzID0gcGFyc2VIZWFkZXIodGhpcy54aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICAvLyBnZXRBbGxSZXNwb25zZUhlYWRlcnMgc29tZXRpbWVzIGZhbHNlbHkgcmV0dXJucyBcIlwiIGZvciBDT1JTIHJlcXVlc3RzLCBidXRcbiAgLy8gZ2V0UmVzcG9uc2VIZWFkZXIgc3RpbGwgd29ya3MuIHNvIHdlIGdldCBjb250ZW50LXR5cGUgZXZlbiBpZiBnZXR0aW5nXG4gIC8vIG90aGVyIGhlYWRlcnMgZmFpbHMuXG4gIHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSA9IHRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKTtcbiAgdGhpcy5zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKTtcbiAgdGhpcy5ib2R5ID0gdGhpcy5yZXEubWV0aG9kICE9ICdIRUFEJ1xuICAgID8gdGhpcy5wYXJzZUJvZHkodGhpcy50ZXh0ID8gdGhpcy50ZXh0IDogdGhpcy54aHIucmVzcG9uc2UpXG4gICAgOiBudWxsO1xufVxuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLmhlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciByZWxhdGVkIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAudHlwZWAgdGhlIGNvbnRlbnQgdHlwZSB3aXRob3V0IHBhcmFtc1xuICpcbiAqIEEgcmVzcG9uc2Ugb2YgXCJDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLThcIlxuICogd2lsbCBwcm92aWRlIHlvdSB3aXRoIGEgYC50eXBlYCBvZiBcInRleHQvcGxhaW5cIi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0SGVhZGVyUHJvcGVydGllcyA9IGZ1bmN0aW9uKGhlYWRlcil7XG4gIC8vIGNvbnRlbnQtdHlwZVxuICB2YXIgY3QgPSB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gIHRoaXMudHlwZSA9IHR5cGUoY3QpO1xuXG4gIC8vIHBhcmFtc1xuICB2YXIgb2JqID0gcGFyYW1zKGN0KTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikgdGhpc1trZXldID0gb2JqW2tleV07XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnBhcnNlQm9keSA9IGZ1bmN0aW9uKHN0cil7XG4gIHZhciBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgcmV0dXJuIHBhcnNlICYmIHN0ciAmJiAoc3RyLmxlbmd0aCB8fCBzdHIgaW5zdGFuY2VvZiBPYmplY3QpXG4gICAgPyBwYXJzZShzdHIpXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBTZXQgZmxhZ3Mgc3VjaCBhcyBgLm9rYCBiYXNlZCBvbiBgc3RhdHVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBhIDJ4eCByZXNwb25zZSB3aWxsIGdpdmUgeW91IGEgYC5va2Agb2YgX190cnVlX19cbiAqIHdoZXJlYXMgNXh4IHdpbGwgYmUgX19mYWxzZV9fIGFuZCBgLmVycm9yYCB3aWxsIGJlIF9fdHJ1ZV9fLiBUaGVcbiAqIGAuY2xpZW50RXJyb3JgIGFuZCBgLnNlcnZlckVycm9yYCBhcmUgYWxzbyBhdmFpbGFibGUgdG8gYmUgbW9yZVxuICogc3BlY2lmaWMsIGFuZCBgLnN0YXR1c1R5cGVgIGlzIHRoZSBjbGFzcyBvZiBlcnJvciByYW5naW5nIGZyb20gMS4uNVxuICogc29tZXRpbWVzIHVzZWZ1bCBmb3IgbWFwcGluZyByZXNwb25kIGNvbG9ycyBldGMuXG4gKlxuICogXCJzdWdhclwiIHByb3BlcnRpZXMgYXJlIGFsc28gZGVmaW5lZCBmb3IgY29tbW9uIGNhc2VzLiBDdXJyZW50bHkgcHJvdmlkaW5nOlxuICpcbiAqICAgLSAubm9Db250ZW50XG4gKiAgIC0gLmJhZFJlcXVlc3RcbiAqICAgLSAudW5hdXRob3JpemVkXG4gKiAgIC0gLm5vdEFjY2VwdGFibGVcbiAqICAgLSAubm90Rm91bmRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0U3RhdHVzUHJvcGVydGllcyA9IGZ1bmN0aW9uKHN0YXR1cyl7XG4gIC8vIGhhbmRsZSBJRTkgYnVnOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwMDQ2OTcyL21zaWUtcmV0dXJucy1zdGF0dXMtY29kZS1vZi0xMjIzLWZvci1hamF4LXJlcXVlc3RcbiAgaWYgKHN0YXR1cyA9PT0gMTIyMykge1xuICAgIHN0YXR1cyA9IDIwNDtcbiAgfVxuXG4gIHZhciB0eXBlID0gc3RhdHVzIC8gMTAwIHwgMDtcblxuICAvLyBzdGF0dXMgLyBjbGFzc1xuICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgdGhpcy5zdGF0dXNUeXBlID0gdHlwZTtcblxuICAvLyBiYXNpY3NcbiAgdGhpcy5pbmZvID0gMSA9PSB0eXBlO1xuICB0aGlzLm9rID0gMiA9PSB0eXBlO1xuICB0aGlzLmNsaWVudEVycm9yID0gNCA9PSB0eXBlO1xuICB0aGlzLnNlcnZlckVycm9yID0gNSA9PSB0eXBlO1xuICB0aGlzLmVycm9yID0gKDQgPT0gdHlwZSB8fCA1ID09IHR5cGUpXG4gICAgPyB0aGlzLnRvRXJyb3IoKVxuICAgIDogZmFsc2U7XG5cbiAgLy8gc3VnYXJcbiAgdGhpcy5hY2NlcHRlZCA9IDIwMiA9PSBzdGF0dXM7XG4gIHRoaXMubm9Db250ZW50ID0gMjA0ID09IHN0YXR1cztcbiAgdGhpcy5iYWRSZXF1ZXN0ID0gNDAwID09IHN0YXR1cztcbiAgdGhpcy51bmF1dGhvcml6ZWQgPSA0MDEgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEFjY2VwdGFibGUgPSA0MDYgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEZvdW5kID0gNDA0ID09IHN0YXR1cztcbiAgdGhpcy5mb3JiaWRkZW4gPSA0MDMgPT0gc3RhdHVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciByZXEgPSB0aGlzLnJlcTtcbiAgdmFyIG1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gIHZhciB1cmwgPSByZXEudXJsO1xuXG4gIHZhciBtc2cgPSAnY2Fubm90ICcgKyBtZXRob2QgKyAnICcgKyB1cmwgKyAnICgnICsgdGhpcy5zdGF0dXMgKyAnKSc7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IobXNnKTtcbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gbWV0aG9kO1xuICBlcnIudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307XG4gIHRoaXMuX2hlYWRlciA9IHt9O1xuICB0aGlzLm9uKCdlbmQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBlcnIgPSBudWxsO1xuICAgIHZhciByZXMgPSBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlcyA9IG5ldyBSZXNwb25zZShzZWxmKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGVyciA9IG5ldyBFcnJvcignUGFyc2VyIGlzIHVuYWJsZSB0byBwYXJzZSB0aGUgcmVzcG9uc2UnKTtcbiAgICAgIGVyci5wYXJzZSA9IHRydWU7XG4gICAgICBlcnIub3JpZ2luYWwgPSBlO1xuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyKTtcbiAgICB9XG5cbiAgICBzZWxmLmVtaXQoJ3Jlc3BvbnNlJywgcmVzKTtcblxuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICB9XG5cbiAgICBpZiAocmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDMwMCkge1xuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyLCByZXMpO1xuICAgIH1cblxuICAgIHZhciBuZXdfZXJyID0gbmV3IEVycm9yKHJlcy5zdGF0dXNUZXh0IHx8ICdVbnN1Y2Nlc3NmdWwgSFRUUCByZXNwb25zZScpO1xuICAgIG5ld19lcnIub3JpZ2luYWwgPSBlcnI7XG4gICAgbmV3X2Vyci5yZXNwb25zZSA9IHJlcztcbiAgICBuZXdfZXJyLnN0YXR1cyA9IHJlcy5zdGF0dXM7XG5cbiAgICBzZWxmLmNhbGxiYWNrKGVyciB8fCBuZXdfZXJyLCByZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGltZW91dCB0byBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmFib3J0ZWQpIHJldHVybjtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIuYWJvcnQoKTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3Mpe1xuICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBzdHIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIlxuICogcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBxdWVyeXN0cmluZ1xuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG11bHRpcGxlIGRhdGEgXCJ3cml0ZXNcIlxuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuc2VuZCh7IHNlYXJjaDogJ3F1ZXJ5JyB9KVxuICogICAgICAgICAuc2VuZCh7IHJhbmdlOiAnMS4uNScgfSlcbiAqICAgICAgICAgLnNlbmQoeyBvcmRlcjogJ2Rlc2MnIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnanNvbicpXG4gKiAgICAgICAgIC5zZW5kKCd7XCJuYW1lXCI6XCJ0alwifSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaiB8fCBpc0hvc3QoZGF0YSkpIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICBmbihlcnIsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdPcmlnaW4gaXMgbm90IGFsbG93ZWQgYnkgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0RXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3RpbWVvdXQgb2YgJyArIHRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnKTtcbiAgZXJyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLndpdGhDcmVkZW50aWFscyA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3dpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB4aHIgPSB0aGlzLnhociA9IHJlcXVlc3QuZ2V0WEhSKCk7XG4gIHZhciBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoNCAhPSB4aHIucmVhZHlTdGF0ZSkgcmV0dXJuO1xuXG4gICAgLy8gSW4gSUU5LCByZWFkcyB0byBhbnkgcHJvcGVydHkgKGUuZy4gc3RhdHVzKSBvZmYgb2YgYW4gYWJvcnRlZCBYSFIgd2lsbFxuICAgIC8vIHJlc3VsdCBpbiB0aGUgZXJyb3IgXCJDb3VsZCBub3QgY29tcGxldGUgdGhlIG9wZXJhdGlvbiBkdWUgdG8gZXJyb3IgYzAwYzAyM2ZcIlxuICAgIHZhciBzdGF0dXM7XG4gICAgdHJ5IHsgc3RhdHVzID0geGhyLnN0YXR1cyB9IGNhdGNoKGUpIHsgc3RhdHVzID0gMDsgfVxuXG4gICAgaWYgKDAgPT0gc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi50aW1lZG91dCkgcmV0dXJuIHNlbGYudGltZW91dEVycm9yKCk7XG4gICAgICBpZiAoc2VsZi5hYm9ydGVkKSByZXR1cm47XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgdmFyIGhhbmRsZVByb2dyZXNzID0gZnVuY3Rpb24oZSl7XG4gICAgaWYgKGUudG90YWwgPiAwKSB7XG4gICAgICBlLnBlcmNlbnQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiAxMDA7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgfTtcbiAgaWYgKHRoaXMuaGFzTGlzdGVuZXJzKCdwcm9ncmVzcycpKSB7XG4gICAgeGhyLm9ucHJvZ3Jlc3MgPSBoYW5kbGVQcm9ncmVzcztcbiAgfVxuICB0cnkge1xuICAgIGlmICh4aHIudXBsb2FkICYmIHRoaXMuaGFzTGlzdGVuZXJzKCdwcm9ncmVzcycpKSB7XG4gICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBoYW5kbGVQcm9ncmVzcztcbiAgICB9XG4gIH0gY2F0Y2goZSkge1xuICAgIC8vIEFjY2Vzc2luZyB4aHIudXBsb2FkIGZhaWxzIGluIElFIGZyb20gYSB3ZWIgd29ya2VyLCBzbyBqdXN0IHByZXRlbmQgaXQgZG9lc24ndCBleGlzdC5cbiAgICAvLyBSZXBvcnRlZCBoZXJlOlxuICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvODM3MjQ1L3htbGh0dHByZXF1ZXN0LXVwbG9hZC10aHJvd3MtaW52YWxpZC1hcmd1bWVudC13aGVuLXVzZWQtZnJvbS13ZWItd29ya2VyLWNvbnRleHRcbiAgfVxuXG4gIC8vIHRpbWVvdXRcbiAgaWYgKHRpbWVvdXQgJiYgIXRoaXMuX3RpbWVyKSB7XG4gICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBzZWxmLnRpbWVkb3V0ID0gdHJ1ZTtcbiAgICAgIHNlbGYuYWJvcnQoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8vIHF1ZXJ5c3RyaW5nXG4gIGlmIChxdWVyeSkge1xuICAgIHF1ZXJ5ID0gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QocXVlcnkpO1xuICAgIHRoaXMudXJsICs9IH50aGlzLnVybC5pbmRleE9mKCc/JylcbiAgICAgID8gJyYnICsgcXVlcnlcbiAgICAgIDogJz8nICsgcXVlcnk7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBib2R5XG4gIGlmICgnR0VUJyAhPSB0aGlzLm1ldGhvZCAmJiAnSEVBRCcgIT0gdGhpcy5tZXRob2QgJiYgJ3N0cmluZycgIT0gdHlwZW9mIGRhdGEgJiYgIWlzSG9zdChkYXRhKSkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIHZhciBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVt0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyldO1xuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKHZhciBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmIChudWxsID09IHRoaXMuaGVhZGVyW2ZpZWxkXSkgY29udGludWU7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuICB4aHIuc2VuZChkYXRhKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHVybCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmRlbCA9IGZ1bmN0aW9uKHVybCwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnREVMRVRFJywgdXJsKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wYXRjaCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUEFUQ0gnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucG9zdCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUE9TVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBVVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnB1dCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUFVUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogRXhwb3NlIGByZXF1ZXN0YC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVlc3Q7XG4iLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICBmdW5jdGlvbiBvbigpIHtcbiAgICBzZWxmLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyIsIi8qKlxyXG4gKiBMZWFndWUgb2YgTGVnZW5kcyBBUElcclxuICogIEVuZHBvaW50IENoYW1waW9uXHJcbiAqL1xyXG5cclxudmFyIHN1cGVyYWdlbnQgPSByZXF1aXJlKCdzdXBlcmFnZW50JyksXHJcblxyXG4gICAgQ09OU1QgPSByZXF1aXJlKCcuLi9jb3JlL2NvbnN0JyksXHJcbiAgICBzdHJpbmdSZXBsYWNlciA9IHJlcXVpcmUoJy4uL3V0aWxzL3N0cmluZy1yZXBsYWNlcicpLFxyXG4gICAgcmVnaW9uRXhpc3RzID0gcmVxdWlyZSgnLi4vdXRpbHMvcmVnaW9uLWV4aXN0cycpO1xyXG5cclxudmFyIG1ldGhvZFZlcnNpb24gPSBcIjEuMlwiO1xyXG52YXIgbWV0aG9kT3B0aW9ucyA9IHtcclxuICAgIFwiXCI6IFwiL2FwaS9sb2wve3JlZ2lvbn0vdnt2ZXJzaW9ufS9jaGFtcGlvblwiLFxyXG4gICAgXCJpZFwiOiBcIi9hcGkvbG9sL3tyZWdpb259L3Z7dmVyc2lvbn0vY2hhbXBpb24ve2lkfVwiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIENoYW1waW9uID0gZnVuY3Rpb24ob3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCB8fCBjYWxsYmFjayA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVnaW9uRXhpc3RzKHRoaXMucmVnaW9uLCBjYWxsYmFjaykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9uc1tcIlwiXSwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKClcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5UW3RoaXMucmVnaW9uXS5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIENoYW1waW9uLmlkID0gKGZ1bmN0aW9uIChpZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCB8fCBjYWxsYmFjayA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVnaW9uRXhpc3RzKHRoaXMucmVnaW9uLCBjYWxsYmFjaykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9ucy5pZCwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgIGlkOiBpZFxyXG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdFN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0VXJsID0gW1wiaHR0cHM6Ly9cIiwgQ09OU1QuUkVHSU9OQUxfRU5EUE9JTlRbdGhpcy5yZWdpb25dLmhvc3QsIHJlc3VsdFN0cmluZ107XHJcblxyXG4gICAgICAgICAgICBzdXBlcmFnZW50XHJcbiAgICAgICAgICAgICAgICAuZ2V0KHJlc3VsdFVybC5qb2luKFwiXCIpKVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHtcImFwaV9rZXlcIjogdGhpcy5hcGlfa2V5fSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeShvcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgLmVuZChjYWxsYmFjayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIENoYW1waW9uLm1ldGhvZFZlcnNpb24gPSBtZXRob2RWZXJzaW9uO1xyXG5cclxuICAgIHJldHVybiBDaGFtcGlvbjtcclxufTsiLCIvKipcclxuICogTGVhZ3VlIG9mIExlZ2VuZHMgQVBJXHJcbiAqICBFbmRwb2ludCBDdXJyZW50IEdhbWVcclxuICpcclxuICogIFJJVE9fQ09NUExBSU5UOiBUaGUgQ09SUyBwb2xpY3kgaW4gdGhpcyBBUEkgY2FsbCBtYWtlIGl0IHVuYXZhaWxhYmxlIHRvIHVzZSBpdCBmcm9tIGNsaWVudCBqYXZhc2NyaXB0IHdpdGhvdXRcclxuICogIHVzaW5nIFwiaGFja3NcIiBsaWtlIGpzb25wIHByb3h5IDooLlxyXG4gKi9cclxuXHJcbnZhciBzdXBlcmFnZW50ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpLFxyXG5cclxuICAgIENPTlNUID0gcmVxdWlyZSgnLi4vY29yZS9jb25zdCcpLFxyXG4gICAgc3RyaW5nUmVwbGFjZXIgPSByZXF1aXJlKCcuLi91dGlscy9zdHJpbmctcmVwbGFjZXInKSxcclxuICAgIHJlZ2lvbkV4aXN0cyA9IHJlcXVpcmUoJy4uL3V0aWxzL3JlZ2lvbi1leGlzdHMnKTtcclxuXHJcbnZhciBtZXRob2RWZXJzaW9uID0gXCIxLjBcIjtcclxudmFyIG1ldGhvZE9wdGlvbnMgPSB7XHJcbiAgICBcIlwiOiBcIi9vYnNlcnZlci1tb2RlL3Jlc3QvY29uc3VtZXIvZ2V0U3BlY3RhdG9yR2FtZUluZm8ve3BsYXRmb3JtSWR9L3tzdW1tb25lcklkfVwiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIEN1cnJlbnRHYW1lID0gZnVuY3Rpb24oc3VtbW9uZXJJZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXCJUaGlzIEVuZHBvaW50IGlzIGJ1Z2d5IGZvciBjbGllbnQgamF2YXNjcmlwdCwgaXQgd2lsbCBub3Qgd29yay4gXCIgK1xyXG4gICAgICAgIFwiTG9vayBhdCB0aGUgUklUT19DT01QTEFJTlQgdGFnIGluIHRoZSBzb3VyY2UgY29kZS5cIik7XHJcblxyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zW1wiXCJdLCB7XHJcbiAgICAgICAgICAgIHZlcnNpb246IG1ldGhvZFZlcnNpb24sXHJcbiAgICAgICAgICAgIHBsYXRmb3JtSWQ6IENPTlNULlJFR0lPTkFMX0VORFBPSU5UW3RoaXMucmVnaW9uXS5wbGF0Zm9ybUlkLFxyXG4gICAgICAgICAgICBzdW1tb25lcklkOiBzdW1tb25lcklkXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVFt0aGlzLnJlZ2lvbl0uaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICBDdXJyZW50R2FtZS5tZXRob2RWZXJzaW9uID0gbWV0aG9kVmVyc2lvbjtcclxuXHJcbiAgICByZXR1cm4gQ3VycmVudEdhbWU7XHJcbn07IiwiLyoqXHJcbiAqIExlYWd1ZSBvZiBMZWdlbmRzIEFQSVxyXG4gKiAgRW5kcG9pbnQgRmVhdHVyZWQgR2FtZXNcclxuICovXHJcblxyXG52YXIgc3VwZXJhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKSxcclxuXHJcbiAgICBDT05TVCA9IHJlcXVpcmUoJy4uL2NvcmUvY29uc3QnKSxcclxuICAgIHN0cmluZ1JlcGxhY2VyID0gcmVxdWlyZSgnLi4vdXRpbHMvc3RyaW5nLXJlcGxhY2VyJyksXHJcbiAgICByZWdpb25FeGlzdHMgPSByZXF1aXJlKCcuLi91dGlscy9yZWdpb24tZXhpc3RzJyk7XHJcblxyXG52YXIgbWV0aG9kVmVyc2lvbiA9IFwiMS4wXCI7XHJcbnZhciBtZXRob2RPcHRpb25zID0ge1xyXG4gICAgXCJcIjogXCIvb2JzZXJ2ZXItbW9kZS9yZXN0L2ZlYXR1cmVkXCJcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgRmVhdHVyZWRHYW1lcyA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQgfHwgY2FsbGJhY2sgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlZ2lvbkV4aXN0cyh0aGlzLnJlZ2lvbiwgY2FsbGJhY2spKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHN0cmluZ1JlcGxhY2VyKG1ldGhvZE9wdGlvbnNbXCJcIl0sIHtcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVFt0aGlzLnJlZ2lvbl0uaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICBGZWF0dXJlZEdhbWVzLm1ldGhvZFZlcnNpb24gPSBtZXRob2RWZXJzaW9uO1xyXG5cclxuICAgIHJldHVybiBGZWF0dXJlZEdhbWVzO1xyXG59OyIsIi8qKlxyXG4gKiBMZWFndWUgb2YgTGVnZW5kcyBBUElcclxuICogIEVuZHBvaW50IEdhbWVcclxuICovXHJcblxyXG52YXIgc3VwZXJhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKSxcclxuXHJcbiAgICBDT05TVCA9IHJlcXVpcmUoJy4uL2NvcmUvY29uc3QnKSxcclxuICAgIHN0cmluZ1JlcGxhY2VyID0gcmVxdWlyZSgnLi4vdXRpbHMvc3RyaW5nLXJlcGxhY2VyJyksXHJcbiAgICByZWdpb25FeGlzdHMgPSByZXF1aXJlKCcuLi91dGlscy9yZWdpb24tZXhpc3RzJyk7XHJcblxyXG52YXIgbWV0aG9kVmVyc2lvbiA9IFwiMS4zXCI7XHJcbnZhciBtZXRob2RPcHRpb25zID0ge1xyXG4gICAgXCJcIjogXCIvYXBpL2xvbC97cmVnaW9ufS92e3ZlcnNpb259L2dhbWUvYnktc3VtbW9uZXIve3N1bW1vbmVySWR9L3JlY2VudFwiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIEdhbWUgPSBmdW5jdGlvbihzdW1tb25lcklkLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zW1wiXCJdLCB7XHJcbiAgICAgICAgICAgIHZlcnNpb246IG1ldGhvZFZlcnNpb24sXHJcbiAgICAgICAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb24udG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgc3VtbW9uZXJJZDogc3VtbW9uZXJJZFxyXG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdFN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0VXJsID0gW1wiaHR0cHM6Ly9cIiwgQ09OU1QuUkVHSU9OQUxfRU5EUE9JTlRbdGhpcy5yZWdpb25dLmhvc3QsIHJlc3VsdFN0cmluZ107XHJcblxyXG4gICAgICAgICAgICBzdXBlcmFnZW50XHJcbiAgICAgICAgICAgICAgICAuZ2V0KHJlc3VsdFVybC5qb2luKFwiXCIpKVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHtcImFwaV9rZXlcIjogdGhpcy5hcGlfa2V5fSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeShvcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgLmVuZChjYWxsYmFjayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgR2FtZS5tZXRob2RWZXJzaW9uID0gbWV0aG9kVmVyc2lvbjtcclxuXHJcbiAgICByZXR1cm4gR2FtZTtcclxufTsiLCIvKipcclxuICogTGVhZ3VlIG9mIExlZ2VuZHMgQVBJXHJcbiAqICBFbmRwb2ludCBMZWFndWVcclxuICovXHJcblxyXG52YXIgc3VwZXJhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKSxcclxuXHJcbiAgICBDT05TVCA9IHJlcXVpcmUoJy4uL2NvcmUvY29uc3QnKSxcclxuICAgIHN0cmluZ1JlcGxhY2VyID0gcmVxdWlyZSgnLi4vdXRpbHMvc3RyaW5nLXJlcGxhY2VyJyksXHJcbiAgICByZWdpb25FeGlzdHMgPSByZXF1aXJlKCcuLi91dGlscy9yZWdpb24tZXhpc3RzJyksXHJcbiAgICB0eXBlQ2hlY2sgPSByZXF1aXJlKCcuLi91dGlscy90eXBlLWNoZWNrJyk7XHJcblxyXG52YXIgbWV0aG9kVmVyc2lvbiA9IFwiMi41XCI7XHJcbnZhciBtZXRob2RPcHRpb25zID0ge1xyXG4gICAgXCJieVN1bW1vbmVyXCI6IFwiL2FwaS9sb2wve3JlZ2lvbn0vdnt2ZXJzaW9ufS9sZWFndWUvYnktc3VtbW9uZXIve3N1bW1vbmVySWRzfVwiLFxyXG4gICAgXCJieVN1bW1vbmVyLWVudHJ5XCI6IFwiL2FwaS9sb2wve3JlZ2lvbn0vdnt2ZXJzaW9ufS9sZWFndWUvYnktc3VtbW9uZXIve3N1bW1vbmVySWRzfS9lbnRyeVwiLFxyXG4gICAgXCJieVRlYW1cIjogXCIvYXBpL2xvbC97cmVnaW9ufS92e3ZlcnNpb259L2xlYWd1ZS9ieS10ZWFtL3t0ZWFtSWRzfVwiLFxyXG4gICAgXCJieVRlYW0tZW50cnlcIjogXCIvYXBpL2xvbC97cmVnaW9ufS92e3ZlcnNpb259L2xlYWd1ZS9ieS10ZWFtL3t0ZWFtSWRzfS9lbnRyeVwiLFxyXG4gICAgXCJjaGFsbGVuZ2VyXCI6IFwiL2FwaS9sb2wve3JlZ2lvbn0vdnt2ZXJzaW9ufS9sZWFndWUvY2hhbGxlbmdlclwiLFxyXG4gICAgXCJtYXN0ZXJcIjogXCIvYXBpL2xvbC97cmVnaW9ufS92e3ZlcnNpb259L2xlYWd1ZS9tYXN0ZXJcIlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBMZWFndWUgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGNhbGxiYWNrKFwiRXJyb3I6IFRoaXMgZW5kcG9pbnQgZG9udCBleGlzdHNcIik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgTGVhZ3VlLmJ5U3VtbW9uZXIgPSBmdW5jdGlvbiAoc3VtbW9uZXJJZHMsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQgfHwgY2FsbGJhY2sgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlZ2lvbkV4aXN0cyh0aGlzLnJlZ2lvbiwgY2FsbGJhY2spKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBzdW1tb25lcnM7XHJcbiAgICAgICAgaWYgKHR5cGVDaGVjay5pc0FycmF5KHN1bW1vbmVySWRzKSlcclxuICAgICAgICAgICAgc3VtbW9uZXJzID0gc3VtbW9uZXJJZHMuam9pbihcIiwgXCIpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgc3VtbW9uZXJzID0gc3VtbW9uZXJJZHM7XHJcblxyXG4gICAgICAgIHN0cmluZ1JlcGxhY2VyKG1ldGhvZE9wdGlvbnMuYnlTdW1tb25lciwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgIHN1bW1vbmVySWRzOiBzdW1tb25lcnNcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5UW3RoaXMucmVnaW9uXS5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIExlYWd1ZS5ieVN1bW1vbmVyLmVudHJ5ID0gZnVuY3Rpb24gKHN1bW1vbmVySWRzLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgc3VtbW9uZXJzO1xyXG4gICAgICAgIGlmICh0eXBlQ2hlY2suaXNBcnJheShzdW1tb25lcklkcykpXHJcbiAgICAgICAgICAgIHN1bW1vbmVycyA9IHN1bW1vbmVySWRzLmpvaW4oXCIsIFwiKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHN1bW1vbmVycyA9IHN1bW1vbmVySWRzO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zW1wiYnlTdW1tb25lci1lbnRyeVwiXSwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgIHN1bW1vbmVySWRzOiBzdW1tb25lcnNcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5UW3RoaXMucmVnaW9uXS5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIExlYWd1ZS5ieVRlYW0gPSBmdW5jdGlvbiAodGVhbUlkcywgb3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCB8fCBjYWxsYmFjayA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVnaW9uRXhpc3RzKHRoaXMucmVnaW9uLCBjYWxsYmFjaykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIHRlYW1zO1xyXG4gICAgICAgIGlmICh0eXBlQ2hlY2suaXNBcnJheSh0ZWFtSWRzKSlcclxuICAgICAgICAgICAgdGVhbXMgPSB0ZWFtSWRzLmpvaW4oXCIsIFwiKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRlYW1zID0gdGVhbUlkcztcclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9ucy5ieVRlYW0sIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICB0ZWFtSWRzOiB0ZWFtc1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdFN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0VXJsID0gW1wiaHR0cHM6Ly9cIiwgQ09OU1QuUkVHSU9OQUxfRU5EUE9JTlRbdGhpcy5yZWdpb25dLmhvc3QsIHJlc3VsdFN0cmluZ107XHJcblxyXG4gICAgICAgICAgICBzdXBlcmFnZW50XHJcbiAgICAgICAgICAgICAgICAuZ2V0KHJlc3VsdFVybC5qb2luKFwiXCIpKVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHtcImFwaV9rZXlcIjogdGhpcy5hcGlfa2V5fSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeShvcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgLmVuZChjYWxsYmFjayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgTGVhZ3VlLmJ5VGVhbS5lbnRyeSA9IGZ1bmN0aW9uICh0ZWFtSWRzLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgdGVhbXM7XHJcbiAgICAgICAgaWYgKHR5cGVDaGVjay5pc0FycmF5KHRlYW1JZHMpKVxyXG4gICAgICAgICAgICB0ZWFtcyA9IHRlYW1JZHMuam9pbihcIiwgXCIpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGVhbXMgPSB0ZWFtSWRzO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zW1wiYnlUZWFtLWVudHJ5XCJdLCB7XHJcbiAgICAgICAgICAgIHZlcnNpb246IG1ldGhvZFZlcnNpb24sXHJcbiAgICAgICAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb24udG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgdGVhbUlkczogdGVhbXNcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5UW3RoaXMucmVnaW9uXS5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIExlYWd1ZS5jaGFsbGVuZ2VyID0gZnVuY3Rpb24gKG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQgfHwgY2FsbGJhY2sgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlZ2lvbkV4aXN0cyh0aGlzLnJlZ2lvbiwgY2FsbGJhY2spKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHN0cmluZ1JlcGxhY2VyKG1ldGhvZE9wdGlvbnMuY2hhbGxlbmdlciwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKClcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5UW3RoaXMucmVnaW9uXS5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIExlYWd1ZS5tYXN0ZXIgPSBmdW5jdGlvbiAob3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCB8fCBjYWxsYmFjayA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVnaW9uRXhpc3RzKHRoaXMucmVnaW9uLCBjYWxsYmFjaykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9ucy5tYXN0ZXIsIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVFt0aGlzLnJlZ2lvbl0uaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICBMZWFndWUubWV0aG9kVmVyc2lvbiA9IG1ldGhvZFZlcnNpb247XHJcblxyXG4gICAgcmV0dXJuIExlYWd1ZTtcclxufTsiLCIvKipcclxuICogTGVhZ3VlIG9mIExlZ2VuZHMgQVBJXHJcbiAqICBFbmRwb2ludCBMT0wgU3RhdGljIERhdGFcclxuICovXHJcblxyXG52YXIgc3VwZXJhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKSxcclxuXHJcbiAgICBDT05TVCA9IHJlcXVpcmUoJy4uL2NvcmUvY29uc3QnKSxcclxuICAgIHN0cmluZ1JlcGxhY2VyID0gcmVxdWlyZSgnLi4vdXRpbHMvc3RyaW5nLXJlcGxhY2VyJyksXHJcbiAgICByZWdpb25FeGlzdHMgPSByZXF1aXJlKCcuLi91dGlscy9yZWdpb24tZXhpc3RzJyk7XHJcblxyXG52YXIgbWV0aG9kVmVyc2lvbiA9IFwiMS4yXCI7XHJcbnZhciBtZXRob2RPcHRpb25zID0ge1xyXG4gICAgXCJjaGFtcGlvblwiOiBcIi9hcGkvbG9sL3N0YXRpYy1kYXRhL3tyZWdpb259L3Z7dmVyc2lvbn0vY2hhbXBpb25cIixcclxuICAgIFwiY2hhbXBpb24taWRcIjogXCIvYXBpL2xvbC9zdGF0aWMtZGF0YS97cmVnaW9ufS92e3ZlcnNpb259L2NoYW1waW9uL3tpZH1cIixcclxuICAgIFwiaXRlbVwiOiBcIi9hcGkvbG9sL3N0YXRpYy1kYXRhL3tyZWdpb259L3Z7dmVyc2lvbn0vaXRlbVwiLFxyXG4gICAgXCJpdGVtLWlkXCI6IFwiL2FwaS9sb2wvc3RhdGljLWRhdGEve3JlZ2lvbn0vdnt2ZXJzaW9ufS9pdGVtL3tpZH1cIixcclxuICAgIFwibGFuZ3VhZ2VTdHJpbmdzXCI6IFwiL2FwaS9sb2wvc3RhdGljLWRhdGEve3JlZ2lvbn0vdnt2ZXJzaW9ufS9sYW5ndWFnZS1zdHJpbmdzXCIsXHJcbiAgICBcImxhbmd1YWdlc1wiOiBcIi9hcGkvbG9sL3N0YXRpYy1kYXRhL3tyZWdpb259L3Z7dmVyc2lvbn0vbGFuZ3VhZ2VzXCIsXHJcbiAgICBcIm1hcFwiOiBcIi9hcGkvbG9sL3N0YXRpYy1kYXRhL3tyZWdpb259L3Z7dmVyc2lvbn0vbWFwXCIsXHJcbiAgICBcIm1hc3RlcnlcIjogXCIvYXBpL2xvbC9zdGF0aWMtZGF0YS97cmVnaW9ufS92e3ZlcnNpb259L21hc3RlcnlcIixcclxuICAgIFwibWFzdGVyeS1pZFwiOiBcIi9hcGkvbG9sL3N0YXRpYy1kYXRhL3tyZWdpb259L3Z7dmVyc2lvbn0vbWFzdGVyeS97aWR9XCIsXHJcbiAgICBcInJlYWxtXCI6IFwiL2FwaS9sb2wvc3RhdGljLWRhdGEve3JlZ2lvbn0vdnt2ZXJzaW9ufS9yZWFsbVwiLFxyXG4gICAgXCJydW5lXCI6IFwiL2FwaS9sb2wvc3RhdGljLWRhdGEve3JlZ2lvbn0vdnt2ZXJzaW9ufS9ydW5lXCIsXHJcbiAgICBcInJ1bmUtaWRcIjogXCIvYXBpL2xvbC9zdGF0aWMtZGF0YS97cmVnaW9ufS92e3ZlcnNpb259L3J1bmUve2lkfVwiLFxyXG4gICAgXCJzdW1tb25lclNwZWxsXCI6IFwiL2FwaS9sb2wvc3RhdGljLWRhdGEve3JlZ2lvbn0vdnt2ZXJzaW9ufS9zdW1tb25lci1zcGVsbFwiLFxyXG4gICAgXCJzdW1tb25lclNwZWxsLWlkXCI6IFwiL2FwaS9sb2wvc3RhdGljLWRhdGEve3JlZ2lvbn0vdnt2ZXJzaW9ufS9zdW1tb25lci1zcGVsbC97aWR9XCIsXHJcbiAgICBcInZlcnNpb25zXCI6IFwiL2FwaS9sb2wvc3RhdGljLWRhdGEve3JlZ2lvbn0vdnt2ZXJzaW9ufS92ZXJzaW9uc1wiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIExPTFN0YXRpY0RhdGEgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGNhbGxiYWNrKFwiRXJyb3I6IFRoaXMgZW5kcG9pbnQgZG9udCBleGlzdHNcIik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgTE9MU3RhdGljRGF0YS5jaGFtcGlvbiA9IChmdW5jdGlvbiAob3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCB8fCBjYWxsYmFjayA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVnaW9uRXhpc3RzKHRoaXMucmVnaW9uLCBjYWxsYmFjaykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9ucy5jaGFtcGlvbiwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKClcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5ULkdsb2JhbC5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBMT0xTdGF0aWNEYXRhLmNoYW1waW9uLmlkID0gKGZ1bmN0aW9uIChpZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCB8fCBjYWxsYmFjayA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVnaW9uRXhpc3RzKHRoaXMucmVnaW9uLCBjYWxsYmFjaykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9uc1tcImNoYW1waW9uLWlkXCJdLCB7XHJcbiAgICAgICAgICAgIHZlcnNpb246IG1ldGhvZFZlcnNpb24sXHJcbiAgICAgICAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb24udG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgaWQ6IGlkXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVC5HbG9iYWwuaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgTE9MU3RhdGljRGF0YS5pdGVtID0gKGZ1bmN0aW9uIChvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zLml0ZW0sIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVC5HbG9iYWwuaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgTE9MU3RhdGljRGF0YS5pdGVtLmlkID0gKGZ1bmN0aW9uIChpZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCB8fCBjYWxsYmFjayA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVnaW9uRXhpc3RzKHRoaXMucmVnaW9uLCBjYWxsYmFjaykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9uc1tcIml0ZW0taWRcIl0sIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICBpZDogaWRcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5ULkdsb2JhbC5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBMT0xTdGF0aWNEYXRhLmxhbmd1YWdlU3RyaW5ncyA9IChmdW5jdGlvbiAob3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCB8fCBjYWxsYmFjayA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVnaW9uRXhpc3RzKHRoaXMucmVnaW9uLCBjYWxsYmFjaykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9ucy5sYW5ndWFnZVN0cmluZ3MsIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVC5HbG9iYWwuaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgTE9MU3RhdGljRGF0YS5sYW5ndWFnZXMgPSAoZnVuY3Rpb24gKG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQgfHwgY2FsbGJhY2sgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlZ2lvbkV4aXN0cyh0aGlzLnJlZ2lvbiwgY2FsbGJhY2spKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHN0cmluZ1JlcGxhY2VyKG1ldGhvZE9wdGlvbnMubGFuZ3VhZ2VzLCB7XHJcbiAgICAgICAgICAgIHZlcnNpb246IG1ldGhvZFZlcnNpb24sXHJcbiAgICAgICAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb24udG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdFN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0VXJsID0gW1wiaHR0cHM6Ly9cIiwgQ09OU1QuUkVHSU9OQUxfRU5EUE9JTlQuR2xvYmFsLmhvc3QsIHJlc3VsdFN0cmluZ107XHJcblxyXG4gICAgICAgICAgICBzdXBlcmFnZW50XHJcbiAgICAgICAgICAgICAgICAuZ2V0KHJlc3VsdFVybC5qb2luKFwiXCIpKVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHtcImFwaV9rZXlcIjogdGhpcy5hcGlfa2V5fSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeShvcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgLmVuZChjYWxsYmFjayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIExPTFN0YXRpY0RhdGEubWFwID0gKGZ1bmN0aW9uIChvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zLm1hcCwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKClcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5ULkdsb2JhbC5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBMT0xTdGF0aWNEYXRhLm1hc3RlcnkgPSAoZnVuY3Rpb24gKG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQgfHwgY2FsbGJhY2sgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlZ2lvbkV4aXN0cyh0aGlzLnJlZ2lvbiwgY2FsbGJhY2spKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHN0cmluZ1JlcGxhY2VyKG1ldGhvZE9wdGlvbnMubWFzdGVyeSwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKClcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5ULkdsb2JhbC5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBMT0xTdGF0aWNEYXRhLm1hc3RlcnkuaWQgPSAoZnVuY3Rpb24gKGlkLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zW1wibWFzdGVyeS1pZFwiXSwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgIGlkOiBpZFxyXG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdFN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0VXJsID0gW1wiaHR0cHM6Ly9cIiwgQ09OU1QuUkVHSU9OQUxfRU5EUE9JTlQuR2xvYmFsLmhvc3QsIHJlc3VsdFN0cmluZ107XHJcblxyXG4gICAgICAgICAgICBzdXBlcmFnZW50XHJcbiAgICAgICAgICAgICAgICAuZ2V0KHJlc3VsdFVybC5qb2luKFwiXCIpKVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHtcImFwaV9rZXlcIjogdGhpcy5hcGlfa2V5fSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeShvcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgLmVuZChjYWxsYmFjayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIExPTFN0YXRpY0RhdGEucmVhbG0gPSAoZnVuY3Rpb24gKG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQgfHwgY2FsbGJhY2sgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlZ2lvbkV4aXN0cyh0aGlzLnJlZ2lvbiwgY2FsbGJhY2spKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHN0cmluZ1JlcGxhY2VyKG1ldGhvZE9wdGlvbnMucmVhbG0sIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVC5HbG9iYWwuaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgTE9MU3RhdGljRGF0YS5ydW5lID0gKGZ1bmN0aW9uIChvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zLnJ1bmUsIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVC5HbG9iYWwuaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgTE9MU3RhdGljRGF0YS5ydW5lLmlkID0gKGZ1bmN0aW9uIChpZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCB8fCBjYWxsYmFjayA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVnaW9uRXhpc3RzKHRoaXMucmVnaW9uLCBjYWxsYmFjaykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9uc1tcInJ1bmUtaWRcIl0sIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICBpZDogaWRcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5ULkdsb2JhbC5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBMT0xTdGF0aWNEYXRhLnN1bW1vbmVyU3BlbGwgPSAoZnVuY3Rpb24gKG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQgfHwgY2FsbGJhY2sgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlZ2lvbkV4aXN0cyh0aGlzLnJlZ2lvbiwgY2FsbGJhY2spKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHN0cmluZ1JlcGxhY2VyKG1ldGhvZE9wdGlvbnMuc3VtbW9uZXJTcGVsbCwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKClcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5ULkdsb2JhbC5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBMT0xTdGF0aWNEYXRhLnN1bW1vbmVyU3BlbGwuaWQgPSAoZnVuY3Rpb24gKGlkLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zW1wic3VtbW9uZXJTcGVsbC1pZFwiXSwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgIGlkOiBpZFxyXG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdFN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0VXJsID0gW1wiaHR0cHM6Ly9cIiwgQ09OU1QuUkVHSU9OQUxfRU5EUE9JTlQuR2xvYmFsLmhvc3QsIHJlc3VsdFN0cmluZ107XHJcblxyXG4gICAgICAgICAgICBzdXBlcmFnZW50XHJcbiAgICAgICAgICAgICAgICAuZ2V0KHJlc3VsdFVybC5qb2luKFwiXCIpKVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHtcImFwaV9rZXlcIjogdGhpcy5hcGlfa2V5fSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeShvcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgLmVuZChjYWxsYmFjayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIExPTFN0YXRpY0RhdGEudmVyc2lvbnMgPSAoZnVuY3Rpb24gKG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQgfHwgY2FsbGJhY2sgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlZ2lvbkV4aXN0cyh0aGlzLnJlZ2lvbiwgY2FsbGJhY2spKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHN0cmluZ1JlcGxhY2VyKG1ldGhvZE9wdGlvbnMudmVyc2lvbnMsIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVC5HbG9iYWwuaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgTE9MU3RhdGljRGF0YS5tZXRob2RWZXJzaW9uID0gbWV0aG9kVmVyc2lvbjtcclxuXHJcbiAgICByZXR1cm4gTE9MU3RhdGljRGF0YTtcclxufTsiLCIvKipcclxuICogTGVhZ3VlIG9mIExlZ2VuZHMgQVBJXHJcbiAqICBFbmRwb2ludCBMT0wgU3RhdHVzXHJcbiAqXHJcbiAqICBSSVRPX0NPTVBMQUlOVDogVGhlIHNlcnZlciBmaXJlcyBhbiBlcnJvciB3aGVuIHRoZSBhcGkga2V5IGlzIGluY2x1ZGVkIG9uIHRoZSByZXF1ZXN0IChldmVuIGlmIG5vdCBuZWVkZWQpIGluXHJcbiAqICB0aGUgcmVnaW9uIHZlcnNpb24gYnV0IG5vdCBvbiB0aGUgZ2xvYmFsIG9uZS5cclxuICpcclxuICogIEVycm9yOiBUaGUgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicgaGVhZGVyIGNvbnRhaW5zIG11bHRpcGxlIHZhbHVlcyAnKiwgKicsIGJ1dCBvbmx5IG9uZSBpcyBhbGxvd2VkLlxyXG4gKi9cclxuXHJcbnZhciBzdXBlcmFnZW50ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpLFxyXG5cclxuICAgIENPTlNUID0gcmVxdWlyZSgnLi4vY29yZS9jb25zdCcpLFxyXG4gICAgc3RyaW5nUmVwbGFjZXIgPSByZXF1aXJlKCcuLi91dGlscy9zdHJpbmctcmVwbGFjZXInKTtcclxuXHJcbnZhciBtZXRob2RWZXJzaW9uID0gXCIxLjBcIjtcclxudmFyIG1ldGhvZE9wdGlvbnMgPSB7XHJcbiAgICBcIlwiOiBcIi9zaGFyZHNcIixcclxuICAgIFwicmVnaW9uXCI6IFwiL3NoYXJkcy97cmVnaW9ufVwiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIExPTFN0YXR1cyA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQgfHwgY2FsbGJhY2sgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zW1wiXCJdLCB7XHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5ULlN0YXR1cy5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeShvcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgLmVuZChjYWxsYmFjayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgTE9MU3RhdHVzLnJlZ2lvbiA9IChmdW5jdGlvbiAocmVnaW9uLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9ucy5yZWdpb24sIHtcclxuICAgICAgICAgICAgcmVnaW9uOiByZWdpb24udG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdFN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0VXJsID0gW1wiaHR0cDovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVC5TdGF0dXMuaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBMT0xTdGF0dXMubWV0aG9kVmVyc2lvbiA9IG1ldGhvZFZlcnNpb247XHJcblxyXG4gICAgcmV0dXJuIExPTFN0YXR1cztcclxufTsiLCIvKipcclxuICogTGVhZ3VlIG9mIExlZ2VuZHMgQVBJXHJcbiAqICBFbmRwb2ludCBNYXRjaCBIaXN0b3J5XHJcbiAqL1xyXG5cclxudmFyIHN1cGVyYWdlbnQgPSByZXF1aXJlKCdzdXBlcmFnZW50JyksXHJcblxyXG4gICAgQ09OU1QgPSByZXF1aXJlKCcuLi9jb3JlL2NvbnN0JyksXHJcbiAgICBzdHJpbmdSZXBsYWNlciA9IHJlcXVpcmUoJy4uL3V0aWxzL3N0cmluZy1yZXBsYWNlcicpLFxyXG4gICAgcmVnaW9uRXhpc3RzID0gcmVxdWlyZSgnLi4vdXRpbHMvcmVnaW9uLWV4aXN0cycpO1xyXG5cclxudmFyIG1ldGhvZFZlcnNpb24gPSBcIjIuMlwiO1xyXG52YXIgbWV0aG9kT3B0aW9ucyA9IHtcclxuICAgIFwiXCI6IFwiL2FwaS9sb2wve3JlZ2lvbn0vdnt2ZXJzaW9ufS9tYXRjaGhpc3Rvcnkve3N1bW1vbmVySWR9XCJcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgTWF0Y2hIaXN0b3J5ID0gZnVuY3Rpb24oc3VtbW9uZXJJZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCB8fCBjYWxsYmFjayA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVnaW9uRXhpc3RzKHRoaXMucmVnaW9uLCBjYWxsYmFjaykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9uc1tcIlwiXSwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgIHN1bW1vbmVySWQ6IHN1bW1vbmVySWRcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5UW3RoaXMucmVnaW9uXS5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIE1hdGNoSGlzdG9yeS5tZXRob2RWZXJzaW9uID0gbWV0aG9kVmVyc2lvbjtcclxuXHJcbiAgICByZXR1cm4gTWF0Y2hIaXN0b3J5O1xyXG59OyIsIi8qKlxyXG4gKiBMZWFndWUgb2YgTGVnZW5kcyBBUElcclxuICogIEVuZHBvaW50IE1hdGNoXHJcbiAqL1xyXG5cclxudmFyIHN1cGVyYWdlbnQgPSByZXF1aXJlKCdzdXBlcmFnZW50JyksXHJcblxyXG4gICAgQ09OU1QgPSByZXF1aXJlKCcuLi9jb3JlL2NvbnN0JyksXHJcbiAgICBzdHJpbmdSZXBsYWNlciA9IHJlcXVpcmUoJy4uL3V0aWxzL3N0cmluZy1yZXBsYWNlcicpLFxyXG4gICAgcmVnaW9uRXhpc3RzID0gcmVxdWlyZSgnLi4vdXRpbHMvcmVnaW9uLWV4aXN0cycpO1xyXG5cclxudmFyIG1ldGhvZFZlcnNpb24gPSBcIjIuMlwiO1xyXG52YXIgbWV0aG9kT3B0aW9ucyA9IHtcclxuICAgIFwiXCI6IFwiL2FwaS9sb2wve3JlZ2lvbn0vdnt2ZXJzaW9ufS9tYXRjaC97bWF0Y2hJZH1cIlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBNYXRjaCA9IGZ1bmN0aW9uKG1hdGNoSWQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQgfHwgY2FsbGJhY2sgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlZ2lvbkV4aXN0cyh0aGlzLnJlZ2lvbiwgY2FsbGJhY2spKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHN0cmluZ1JlcGxhY2VyKG1ldGhvZE9wdGlvbnNbXCJcIl0sIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICBtYXRjaElkOiBtYXRjaElkXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVFt0aGlzLnJlZ2lvbl0uaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICBNYXRjaC5tZXRob2RWZXJzaW9uID0gbWV0aG9kVmVyc2lvbjtcclxuXHJcbiAgICByZXR1cm4gTWF0Y2g7XHJcbn07IiwiLyoqXHJcbiAqIExlYWd1ZSBvZiBMZWdlbmRzIEFQSVxyXG4gKiAgRW5kcG9pbnQgU3RhdHNcclxuICovXHJcblxyXG52YXIgc3VwZXJhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKSxcclxuXHJcbiAgICBDT05TVCA9IHJlcXVpcmUoJy4uL2NvcmUvY29uc3QnKSxcclxuICAgIHN0cmluZ1JlcGxhY2VyID0gcmVxdWlyZSgnLi4vdXRpbHMvc3RyaW5nLXJlcGxhY2VyJyksXHJcbiAgICByZWdpb25FeGlzdHMgPSByZXF1aXJlKCcuLi91dGlscy9yZWdpb24tZXhpc3RzJyk7XHJcblxyXG52YXIgbWV0aG9kVmVyc2lvbiA9IFwiMS4zXCI7XHJcbnZhciBtZXRob2RPcHRpb25zID0ge1xyXG4gICAgXCJyYW5rZWRcIjogXCIvYXBpL2xvbC97cmVnaW9ufS92e3ZlcnNpb259L3N0YXRzL2J5LXN1bW1vbmVyL3tzdW1tb25lcklkfS9yYW5rZWRcIixcclxuICAgIFwic3VtbWFyeVwiOiBcIi9hcGkvbG9sL3tyZWdpb259L3Z7dmVyc2lvbn0vc3RhdHMvYnktc3VtbW9uZXIve3N1bW1vbmVySWR9L3N1bW1hcnlcIlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBTdGF0cyA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgY2FsbGJhY2soXCJFcnJvcjogVGhpcyBlbmRwb2ludCBkb250IGV4aXN0c1wiKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICBTdGF0cy5yYW5rZWQgPSBmdW5jdGlvbihzdW1tb25lcklkLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zLnJhbmtlZCwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgIHN1bW1vbmVySWQ6IHN1bW1vbmVySWRcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5UW3RoaXMucmVnaW9uXS5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIFN0YXRzLnN1bW1hcnkgPSBmdW5jdGlvbihzdW1tb25lcklkLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zLnN1bW1hcnksIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICBzdW1tb25lcklkOiBzdW1tb25lcklkXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVFt0aGlzLnJlZ2lvbl0uaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICBTdGF0cy5tZXRob2RWZXJzaW9uID0gbWV0aG9kVmVyc2lvbjtcclxuXHJcbiAgICByZXR1cm4gU3RhdHM7XHJcbn07IiwiLyoqXHJcbiAqIExlYWd1ZSBvZiBMZWdlbmRzIEFQSVxyXG4gKiAgRW5kcG9pbnQgU3VtbW9uZXJcclxuICovXHJcblxyXG52YXIgc3VwZXJhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKSxcclxuXHJcbiAgICBDT05TVCA9IHJlcXVpcmUoJy4uL2NvcmUvY29uc3QnKSxcclxuICAgIHN0cmluZ1JlcGxhY2VyID0gcmVxdWlyZSgnLi4vdXRpbHMvc3RyaW5nLXJlcGxhY2VyJyksXHJcbiAgICByZWdpb25FeGlzdHMgPSByZXF1aXJlKCcuLi91dGlscy9yZWdpb24tZXhpc3RzJyksXHJcbiAgICB0eXBlQ2hlY2sgPSByZXF1aXJlKCcuLi91dGlscy90eXBlLWNoZWNrJyk7XHJcblxyXG52YXIgbWV0aG9kVmVyc2lvbiA9IFwiMS40XCI7XHJcbnZhciBtZXRob2RPcHRpb25zID0ge1xyXG4gICAgXCJcIjogXCIvYXBpL2xvbC97cmVnaW9ufS92e3ZlcnNpb259L3N1bW1vbmVyL3tzdW1tb25lcklkc31cIixcclxuICAgIFwibWFzdGVyaWVzXCI6IFwiL2FwaS9sb2wve3JlZ2lvbn0vdnt2ZXJzaW9ufS9zdW1tb25lci97c3VtbW9uZXJJZHN9L21hc3Rlcmllc1wiLFxyXG4gICAgXCJuYW1lXCI6IFwiL2FwaS9sb2wve3JlZ2lvbn0vdnt2ZXJzaW9ufS9zdW1tb25lci97c3VtbW9uZXJJZHN9L25hbWVcIixcclxuICAgIFwicnVuZXNcIjogXCIvYXBpL2xvbC97cmVnaW9ufS92e3ZlcnNpb259L3N1bW1vbmVyL3tzdW1tb25lcklkc30vcnVuZXNcIixcclxuICAgIFwiYnlOYW1lXCI6IFwiL2FwaS9sb2wve3JlZ2lvbn0vdnt2ZXJzaW9ufS9zdW1tb25lci9ieS1uYW1lL3tzdW1tb25lck5hbWVzfVwiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIFN1bW1vbmVyID0gZnVuY3Rpb24oc3VtbW9uZXJJZHMsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQgfHwgY2FsbGJhY2sgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlZ2lvbkV4aXN0cyh0aGlzLnJlZ2lvbiwgY2FsbGJhY2spKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBzdW1tb25lcnM7XHJcbiAgICAgICAgaWYgKHR5cGVDaGVjay5pc0FycmF5KHN1bW1vbmVySWRzKSlcclxuICAgICAgICAgICAgc3VtbW9uZXJzID0gc3VtbW9uZXJJZHMuam9pbihcIiwgXCIpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgc3VtbW9uZXJzID0gc3VtbW9uZXJJZHM7XHJcblxyXG4gICAgICAgIHN0cmluZ1JlcGxhY2VyKG1ldGhvZE9wdGlvbnNbXCJcIl0sIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICBzdW1tb25lcklkczogc3VtbW9uZXJzXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVFt0aGlzLnJlZ2lvbl0uaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICBTdW1tb25lci5tYXN0ZXJpZXMgPSBmdW5jdGlvbihzdW1tb25lcklkcywgb3B0aW9ucywgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCB8fCBjYWxsYmFjayA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVnaW9uRXhpc3RzKHRoaXMucmVnaW9uLCBjYWxsYmFjaykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIHN1bW1vbmVycztcclxuICAgICAgICBpZiAodHlwZUNoZWNrLmlzQXJyYXkoc3VtbW9uZXJJZHMpKVxyXG4gICAgICAgICAgICBzdW1tb25lcnMgPSBzdW1tb25lcklkcy5qb2luKFwiLCBcIik7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBzdW1tb25lcnMgPSBzdW1tb25lcklkcztcclxuXHJcbiAgICAgICAgc3RyaW5nUmVwbGFjZXIobWV0aG9kT3B0aW9ucy5tYXN0ZXJpZXMsIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICBzdW1tb25lcklkczogc3VtbW9uZXJzXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVFt0aGlzLnJlZ2lvbl0uaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICBTdW1tb25lci5ydW5lcyA9IGZ1bmN0aW9uKHN1bW1vbmVySWRzLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgc3VtbW9uZXJzO1xyXG4gICAgICAgIGlmICh0eXBlQ2hlY2suaXNBcnJheShzdW1tb25lcklkcykpXHJcbiAgICAgICAgICAgIHN1bW1vbmVycyA9IHN1bW1vbmVySWRzLmpvaW4oXCIsIFwiKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHN1bW1vbmVycyA9IHN1bW1vbmVySWRzO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zLnJ1bmVzLCB7XHJcbiAgICAgICAgICAgIHZlcnNpb246IG1ldGhvZFZlcnNpb24sXHJcbiAgICAgICAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb24udG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgc3VtbW9uZXJJZHM6IHN1bW1vbmVyc1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdFN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0VXJsID0gW1wiaHR0cHM6Ly9cIiwgQ09OU1QuUkVHSU9OQUxfRU5EUE9JTlRbdGhpcy5yZWdpb25dLmhvc3QsIHJlc3VsdFN0cmluZ107XHJcblxyXG4gICAgICAgICAgICBzdXBlcmFnZW50XHJcbiAgICAgICAgICAgICAgICAuZ2V0KHJlc3VsdFVybC5qb2luKFwiXCIpKVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHtcImFwaV9rZXlcIjogdGhpcy5hcGlfa2V5fSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeShvcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgLmVuZChjYWxsYmFjayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgU3VtbW9uZXIuZ2V0TmFtZSA9IGZ1bmN0aW9uKHN1bW1vbmVySWRzLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgc3VtbW9uZXJzO1xyXG4gICAgICAgIGlmICh0eXBlQ2hlY2suaXNBcnJheShzdW1tb25lcklkcykpXHJcbiAgICAgICAgICAgIHN1bW1vbmVycyA9IHN1bW1vbmVySWRzLmpvaW4oXCIsIFwiKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHN1bW1vbmVycyA9IHN1bW1vbmVySWRzO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zLm5hbWUsIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICBzdW1tb25lcklkczogc3VtbW9uZXJzXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVFt0aGlzLnJlZ2lvbl0uaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICBTdW1tb25lci5ieU5hbWUgPSBmdW5jdGlvbihzdW1tb25lck5hbWVzLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgc3VtbW9uZXJzO1xyXG4gICAgICAgIGlmICh0eXBlQ2hlY2suaXNBcnJheShzdW1tb25lck5hbWVzKSlcclxuICAgICAgICAgICAgc3VtbW9uZXJzID0gc3VtbW9uZXJOYW1lcy5qb2luKFwiLCBcIik7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBzdW1tb25lcnMgPSBzdW1tb25lck5hbWVzO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zLmJ5TmFtZSwge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRob2RWZXJzaW9uLFxyXG4gICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgIHN1bW1vbmVyTmFtZXM6IHN1bW1vbmVyc1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdFN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0VXJsID0gW1wiaHR0cHM6Ly9cIiwgQ09OU1QuUkVHSU9OQUxfRU5EUE9JTlRbdGhpcy5yZWdpb25dLmhvc3QsIHJlc3VsdFN0cmluZ107XHJcblxyXG4gICAgICAgICAgICBzdXBlcmFnZW50XHJcbiAgICAgICAgICAgICAgICAuZ2V0KHJlc3VsdFVybC5qb2luKFwiXCIpKVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHtcImFwaV9rZXlcIjogdGhpcy5hcGlfa2V5fSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeShvcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgLmVuZChjYWxsYmFjayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgU3VtbW9uZXIubWV0aG9kVmVyc2lvbiA9IG1ldGhvZFZlcnNpb247XHJcblxyXG4gICAgcmV0dXJuIFN1bW1vbmVyO1xyXG59OyIsIi8qKlxyXG4gKiBMZWFndWUgb2YgTGVnZW5kcyBBUElcclxuICogIEVuZHBvaW50IFRlYW1cclxuICovXHJcblxyXG52YXIgc3VwZXJhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKSxcclxuXHJcbiAgICBDT05TVCA9IHJlcXVpcmUoJy4uL2NvcmUvY29uc3QnKSxcclxuICAgIHN0cmluZ1JlcGxhY2VyID0gcmVxdWlyZSgnLi4vdXRpbHMvc3RyaW5nLXJlcGxhY2VyJyksXHJcbiAgICByZWdpb25FeGlzdHMgPSByZXF1aXJlKCcuLi91dGlscy9yZWdpb24tZXhpc3RzJyksXHJcbiAgICB0eXBlQ2hlY2sgPSByZXF1aXJlKCcuLi91dGlscy90eXBlLWNoZWNrJyk7XHJcblxyXG52YXIgbWV0aG9kVmVyc2lvbiA9IFwiMi40XCI7XHJcbnZhciBtZXRob2RPcHRpb25zID0ge1xyXG4gICAgXCJcIjogXCIvYXBpL2xvbC97cmVnaW9ufS92e3ZlcnNpb259L3RlYW0ve3RlYW1JZHN9XCIsXHJcbiAgICBcImJ5U3VtbW9uZXJcIjogXCIvYXBpL2xvbC97cmVnaW9ufS92e3ZlcnNpb259L3RlYW0vYnktc3VtbW9uZXIve3N1bW1vbmVySWRzfVwiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIFRlYW0gPSBmdW5jdGlvbih0ZWFtSWRzLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgdGVhbXM7XHJcbiAgICAgICAgaWYgKHR5cGVDaGVjay5pc0FycmF5KHRlYW1JZHMpKVxyXG4gICAgICAgICAgICB0ZWFtcyA9IHRlYW1JZHMuam9pbihcIiwgXCIpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGVhbXMgPSB0ZWFtSWRzO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zW1wiXCJdLCB7XHJcbiAgICAgICAgICAgIHZlcnNpb246IG1ldGhvZFZlcnNpb24sXHJcbiAgICAgICAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb24udG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgdGVhbUlkczogdGVhbXNcclxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRTdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdFVybCA9IFtcImh0dHBzOi8vXCIsIENPTlNULlJFR0lPTkFMX0VORFBPSU5UW3RoaXMucmVnaW9uXS5ob3N0LCByZXN1bHRTdHJpbmddO1xyXG5cclxuICAgICAgICAgICAgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgICAgICAgLmdldChyZXN1bHRVcmwuam9pbihcIlwiKSlcclxuICAgICAgICAgICAgICAgIC5xdWVyeSh7XCJhcGlfa2V5XCI6IHRoaXMuYXBpX2tleX0pXHJcbiAgICAgICAgICAgICAgICAucXVlcnkob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5lbmQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIFRlYW0uYnlTdW1tb25lciA9IGZ1bmN0aW9uKHN1bW1vbmVySWRzLCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkIHx8IGNhbGxiYWNrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZWdpb25FeGlzdHModGhpcy5yZWdpb24sIGNhbGxiYWNrKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgc3VtbW9uZXJzO1xyXG4gICAgICAgIGlmICh0eXBlQ2hlY2suaXNBcnJheShzdW1tb25lcklkcykpXHJcbiAgICAgICAgICAgIHN1bW1vbmVycyA9IHN1bW1vbmVySWRzLmpvaW4oXCIsIFwiKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHN1bW1vbmVycyA9IHN1bW1vbmVySWRzO1xyXG5cclxuICAgICAgICBzdHJpbmdSZXBsYWNlcihtZXRob2RPcHRpb25zLmJ5U3VtbW9uZXIsIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogbWV0aG9kVmVyc2lvbixcclxuICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbi50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICBzdW1tb25lcklkczogc3VtbW9uZXJzXHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0U3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRVcmwgPSBbXCJodHRwczovL1wiLCBDT05TVC5SRUdJT05BTF9FTkRQT0lOVFt0aGlzLnJlZ2lvbl0uaG9zdCwgcmVzdWx0U3RyaW5nXTtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyYWdlbnRcclxuICAgICAgICAgICAgICAgIC5nZXQocmVzdWx0VXJsLmpvaW4oXCJcIikpXHJcbiAgICAgICAgICAgICAgICAucXVlcnkoe1wiYXBpX2tleVwiOiB0aGlzLmFwaV9rZXl9KVxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAuZW5kKGNhbGxiYWNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICBUZWFtLm1ldGhvZFZlcnNpb24gPSBtZXRob2RWZXJzaW9uO1xyXG5cclxuICAgIHJldHVybiBUZWFtO1xyXG59OyIsIi8qKlxyXG4gKiBMZWFndWUgb2YgTGVnZW5kcyBBUElcclxuICogIENvbnN0c1xyXG4gKlxyXG4gKiBSRUZFUkVOQ0U6IGh0dHBzOi8vZGV2ZWxvcGVyLnJpb3RnYW1lcy5jb20vZG9jcy9nYW1lLWNvbnN0YW50c1xyXG4gKlxyXG4gKiBUT0RPOiBNYXRjaCB0aW1lbGluZSBkYXRhIHBvc2l0aW9uIHZhbHVlc1xyXG4gKiBUT0RPOiBSdW5lIHNsb3QgSWRcclxuICpcclxuICovXHJcblxyXG52YXIgQ09OU1QgPSB7XHJcbiAgICBcIlJFR0lPTkFMX0VORFBPSU5UXCI6IHJlcXVpcmUoJy4vY29uc3QvcmVnaW9uYWwtZW5kcG9pbnQnKSxcclxuICAgIFwiTUFUQ0hNQUtJTkdfUVVFVUVTXCI6IHJlcXVpcmUoJy4vY29uc3QvbWF0Y2htYWtpbmctcXVldWVzJyksXHJcbiAgICBcIk1BUF9OQU1FXCI6IHJlcXVpcmUoJy4vY29uc3QvbWFwLW5hbWUnKSxcclxuICAgIFwiR0FNRV9NT0RFXCI6IHJlcXVpcmUoJy4vY29uc3QvZ2FtZS1tb2RlJyksXHJcbiAgICBcIkdBTUVfVFlQRVwiOiByZXF1aXJlKCcuL2NvbnN0L2dhbWUtdHlwZScpLFxyXG4gICAgXCJTVUJUWVBFXCI6IHJlcXVpcmUoJy4vY29uc3Qvc3VidHlwZScpLFxyXG4gICAgXCJQTEFZRVJfU1RBVF9TVU1NQVJZX1RZUEVcIjogcmVxdWlyZSgnLi9jb25zdC9wbGF5ZXItc3RhdC1zdW1tYXJ5LXR5cGUnKSxcclxuICAgIFwiU0VBU09OXCI6IHJlcXVpcmUoJy4vY29uc3Qvc2Vhc29uJylcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ09OU1Q7IiwiLyoqXHJcbiAqIExlYWd1ZSBvZiBMZWdlbmRzIEFQSVxyXG4gKiAgR2FtZSBNb2RlXHJcbiAqXHJcbiAqL1xyXG5cclxudmFyIEdBTUVfTU9ERSA9IHtcclxuICAgIFwiQ1VTVE9NX0dBTUVcIjoge1xyXG4gICAgICAgIFwiZ2FtZVR5cGVcIjogXCJDVVNUT01fR0FNRVwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJDdXN0b20gZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlRVVE9SSUFMX0dBTUVcIjoge1xyXG4gICAgICAgIFwiZ2FtZVR5cGVcIjogXCJUVVRPUklBTF9HQU1FXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlR1dG9yaWFsIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJNQVRDSEVEX0dBTUVcIjoge1xyXG4gICAgICAgIFwiZ2FtZVR5cGVcIjogXCJNQVRDSEVEX0dBTUVcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQWxsIG90aGVyIGdhbWVzXCJcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR0FNRV9NT0RFOyIsIi8qKlxyXG4gKiBMZWFndWUgb2YgTGVnZW5kcyBBUElcclxuICogIEdhbWUgVHlwZVxyXG4gKlxyXG4gKi9cclxuXHJcbnZhciBHQU1FX1RZUEUgPSB7XHJcbiAgICBcIkNMQVNTSUNcIjoge1xyXG4gICAgICAgIFwiZ2FtZU1vZGVcIjogXCJDTEFTU0lDXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkNsYXNzaWMgU3VtbW9uZXIncyBSaWZ0IGFuZCBUd2lzdGVkIFRyZWVsaW5lIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJPRElOXCI6IHtcclxuICAgICAgICBcImdhbWVNb2RlXCI6IFwiT0RJTlwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJEb21pbmlvbi9DcnlzdGFsIFNjYXIgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkFSQU1cIjoge1xyXG4gICAgICAgIFwiZ2FtZU1vZGVcIjogXCJBUkFNXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkFSQU0gZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlRVVE9SSUFMXCI6IHtcclxuICAgICAgICBcImdhbWVNb2RlXCI6IFwiVFVUT1JJQUxcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVHV0b3JpYWwgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIk9ORUZPUkFMTFwiOiB7XHJcbiAgICAgICAgXCJnYW1lTW9kZVwiOiBcIk9ORUZPUkFMTFwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJPbmUgZm9yIEFsbCBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiQVNDRU5TSU9OXCI6IHtcclxuICAgICAgICBcImdhbWVNb2RlXCI6IFwiQVNDRU5TSU9OXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkFzY2Vuc2lvbiBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiRklSU1RCTE9PRFwiOiB7XHJcbiAgICAgICAgXCJnYW1lTW9kZVwiOiBcIkZJUlNUQkxPT0RcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU25vd2Rvd24gU2hvd2Rvd24gZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIktJTkdQT1JPXCI6IHtcclxuICAgICAgICBcImdhbWVNb2RlXCI6IFwiS0lOR1BPUk9cIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiS2luZyBQb3JvIGdhbWVzXCJcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR0FNRV9UWVBFOyIsIi8qKlxyXG4gKiBMZWFndWUgb2YgTGVnZW5kcyBBUElcclxuICogIE1hcCBOYW1lXHJcbiAqXHJcbiAqL1xyXG5cclxudmFyIE1BUF9OQU1FID0ge1xyXG4gICAgMToge1xyXG4gICAgICAgIFwibWFwSWRcIjogMSxcclxuICAgICAgICBcIm5hbWVcIjogXCJTdW1tb25lcidzIFJpZnRcIixcclxuICAgICAgICBcIm5vdGVzXCI6IFwiT3JpZ2luYWwgU3VtbWVyIFZhcmlhbnRcIlxyXG4gICAgfSxcclxuXHJcbiAgICAyOiB7XHJcbiAgICAgICAgXCJtYXBJZFwiOiAyLFxyXG4gICAgICAgIFwibmFtZVwiOiBcIlN1bW1vbmVyJ3MgUmlmdFwiLFxyXG4gICAgICAgIFwibm90ZXNcIjogXCJPcmlnaW5hbCBBdXR1bW4gVmFyaWFudFwiXHJcbiAgICB9LFxyXG5cclxuICAgIDM6IHtcclxuICAgICAgICBcIm1hcElkXCI6IDMsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiVGhlIFByb3ZpbmcgR3JvdW5kc1wiLFxyXG4gICAgICAgIFwibm90ZXNcIjogXCJUdXRvcmlhbCBNYXBcIlxyXG4gICAgfSxcclxuXHJcbiAgICA0OiB7XHJcbiAgICAgICAgXCJtYXBJZFwiOiA0LFxyXG4gICAgICAgIFwibmFtZVwiOiBcIlR3aXN0ZWQgVHJlZWxpbmVcIixcclxuICAgICAgICBcIm5vdGVzXCI6IFwiT3JpZ2luYWwgVmVyc2lvblwiXHJcbiAgICB9LFxyXG5cclxuICAgIDg6IHtcclxuICAgICAgICBcIm1hcElkXCI6IDgsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiVGhlIENyeXN0YWwgU2NhclwiLFxyXG4gICAgICAgIFwibm90ZXNcIjogXCJEb21pbmlvbiBNYXBcIlxyXG4gICAgfSxcclxuXHJcbiAgICAxMDpcdHtcclxuICAgICAgICBcIm1hcElkXCI6IDEwLFxyXG4gICAgICAgIFwibmFtZVwiOiBcIlR3aXN0ZWQgVHJlZWxpbmVcIixcclxuICAgICAgICBcIm5vdGVzXCI6IFwiQ3VycmVudCBWZXJzaW9uXCJcclxuICAgIH0sXHJcblxyXG4gICAgMTE6XHR7XHJcbiAgICAgICAgXCJtYXBJZFwiOiAxMSxcclxuICAgICAgICBcIm5hbWVcIjogXCJTdW1tb25lcidzIFJpZnRcIixcclxuICAgICAgICBcIm5vdGVzXCI6IFwiQ3VycmVudCBWZXJzaW9uXCJcclxuICAgIH0sXHJcblxyXG4gICAgMTI6XHR7XHJcbiAgICAgICAgXCJtYXBJZFwiOiAxMixcclxuICAgICAgICBcIm5hbWVcIjogXCJIb3dsaW5nIEFieXNzXCIsXHJcbiAgICAgICAgXCJub3Rlc1wiOiBcIkFSQU0gTWFwXCJcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTUFQX05BTUU7IiwiLyoqXHJcbiAqIExlYWd1ZSBvZiBMZWdlbmRzIEFQSVxyXG4gKiAgTWF0Y2htYWNraW5nIFF1ZXVlc1xyXG4gKlxyXG4gKi9cclxuXHJcbnZhciBNQVRDSE1BS0lOR19RVUVVRVMgPSB7XHJcbiAgICBcIkNVU1RPTVwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJDVVNUT01cIixcclxuICAgICAgICBcImdhbWVRdWV1ZUNvbmZpZ0lkXCI6IDAsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiQ3VzdG9tIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJOT1JNQUxfNXg1X0JMSU5EXCI6IHtcclxuICAgICAgICBcInF1ZXVlVHlwZVwiOiBcIk5PUk1BTF81eDVfQkxJTkRcIixcclxuICAgICAgICBcImdhbWVRdWV1ZUNvbmZpZ0lkXCI6IDIsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiTm9ybWFsIDV2NSBCbGluZCBQaWNrIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJCT1RfNXg1XCI6IHtcclxuICAgICAgICBcInF1ZXVlVHlwZVwiOiBcIkJPVF81eDVcIixcclxuICAgICAgICBcImdhbWVRdWV1ZUNvbmZpZ0lkXCI6IDcsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiSGlzdG9yaWNhbCBTdW1tb25lcidzIFJpZnQgQ29vcCB2cyBBSSBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiQk9UXzV4NV9JTlRST1wiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJCT1RfNXg1X0lOVFJPXCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiAzMSxcclxuICAgICAgICBcIm5hbWVcIjogXCJTdW1tb25lcidzIFJpZnQgQ29vcCB2cyBBSSBJbnRybyBCb3QgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkJPVF81eDVfQkVHSU5ORVJcIjoge1xyXG4gICAgICAgIFwicXVldWVUeXBlXCI6IFwiQk9UXzV4NV9CRUdJTk5FUlwiLFxyXG4gICAgICAgIFwiZ2FtZVF1ZXVlQ29uZmlnSWRcIjogMzIsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiU3VtbW9uZXIncyBSaWZ0IENvb3AgdnMgQUkgQmVnaW5uZXIgQm90IGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJCT1RfNXg1X0lOVEVSTUVESUFURVwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJCT1RfNXg1X0lOVEVSTUVESUFURVwiLFxyXG4gICAgICAgIFwiZ2FtZVF1ZXVlQ29uZmlnSWRcIjogMzMsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiSGlzdG9yaWNhbCBTdW1tb25lcidzIFJpZnQgQ29vcCB2cyBBSSBJbnRlcm1lZGlhdGUgQm90IGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJOT1JNQUxfM3gzXCI6IHtcclxuICAgICAgICBcInF1ZXVlVHlwZVwiOiBcIk5PUk1BTF8zeDNcIixcclxuICAgICAgICBcImdhbWVRdWV1ZUNvbmZpZ0lkXCI6IDgsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiTm9ybWFsIDN2MyBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiTk9STUFMXzV4NV9EUkFGVFwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJOT1JNQUxfNXg1X0RSQUZUXCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiAxNCxcclxuICAgICAgICBcIm5hbWVcIjogXCJOb3JtYWwgNXY1IERyYWZ0IFBpY2sgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIk9ESU5fNXg1X0JMSU5EXCI6IHtcclxuICAgICAgICBcInF1ZXVlVHlwZVwiOiBcIk9ESU5fNXg1X0JMSU5EXCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiAxNixcclxuICAgICAgICBcIm5hbWVcIjogXCJEb21pbmlvbiA1djUgQmxpbmQgUGljayBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiT0RJTl81eDVfRFJBRlRcIjoge1xyXG4gICAgICAgIFwicXVldWVUeXBlXCI6IFwiT0RJTl81eDVfRFJBRlRcIixcclxuICAgICAgICBcImdhbWVRdWV1ZUNvbmZpZ0lkXCI6IDE3LFxyXG4gICAgICAgIFwibmFtZVwiOiBcIkRvbWluaW9uIDV2NSBEcmFmdCBQaWNrIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJCT1RfT0RJTl81eDVcIjoge1xyXG4gICAgICAgIFwicXVldWVUeXBlXCI6IFwiQk9UX09ESU5fNXg1XCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiAyNSxcclxuICAgICAgICBcIm5hbWVcIjogXCJEb21pbmlvbiBDb29wIHZzIEFJIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJSQU5LRURfU09MT181eDVcIjoge1xyXG4gICAgICAgIFwicXVldWVUeXBlXCI6IFwiUkFOS0VEX1NPTE9fNXg1XCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiA0LFxyXG4gICAgICAgIFwibmFtZVwiOiBcIlJhbmtlZCBTb2xvIDV2NSBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiUkFOS0VEX1BSRU1BREVfM3gzXCI6IHtcclxuICAgICAgICBcInF1ZXVlVHlwZVwiOiBcIlJBTktFRF9QUkVNQURFXzN4M1wiLFxyXG4gICAgICAgIFwiZ2FtZVF1ZXVlQ29uZmlnSWRcIjogOSxcclxuICAgICAgICBcIm5hbWVcIjogXCJSYW5rZWQgUHJlbWFkZSAzdjMgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlJBTktFRF9QUkVNQURFXzV4NVwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJSQU5LRURfUFJFTUFERV81eDVcIixcclxuICAgICAgICBcImdhbWVRdWV1ZUNvbmZpZ0lkXCI6IDYsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiUmFua2VkIFByZW1hZGUgNXY1IGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJSQU5LRURfVEVBTV8zeDNcIjoge1xyXG4gICAgICAgIFwicXVldWVUeXBlXCI6IFwiUkFOS0VEX1RFQU1fM3gzXCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiA0MSxcclxuICAgICAgICBcIm5hbWVcIjogXCJSYW5rZWQgVGVhbSAzdjMgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlJBTktFRF9URUFNXzV4NVwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJSQU5LRURfVEVBTV81eDVcIixcclxuICAgICAgICBcImdhbWVRdWV1ZUNvbmZpZ0lkXCI6IDQyLFxyXG4gICAgICAgIFwibmFtZVwiOiBcIlJhbmtlZCBUZWFtIDV2NSBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiQk9UX1RUXzN4M1wiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJCT1RfVFRfM3gzXCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiA1MixcclxuICAgICAgICBcIm5hbWVcIjogXCJUd2lzdGVkIFRyZWVsaW5lIENvb3AgdnMgQUkgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkdST1VQX0ZJTkRFUl81eDVcIjoge1xyXG4gICAgICAgIFwicXVldWVUeXBlXCI6IFwiR1JPVVBfRklOREVSXzV4NVwiLFxyXG4gICAgICAgIFwiZ2FtZVF1ZXVlQ29uZmlnSWRcIjogNjEsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiVGVhbSBCdWlsZGVyIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJBUkFNXzV4NVwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJBUkFNXzV4NVwiLFxyXG4gICAgICAgIFwiZ2FtZVF1ZXVlQ29uZmlnSWRcIjogNjUsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiQVJBTSBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiT05FRk9SQUxMXzV4NVwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJPTkVGT1JBTExfNXg1XCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiA3MCxcclxuICAgICAgICBcIm5hbWVcIjogXCJPbmUgZm9yIEFsbCBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiRklSU1RCTE9PRF8xeDFcIjoge1xyXG4gICAgICAgIFwicXVldWVUeXBlXCI6IFwiRklSU1RCTE9PRF8xeDFcIixcclxuICAgICAgICBcImdhbWVRdWV1ZUNvbmZpZ0lkXCI6IDcyLFxyXG4gICAgICAgIFwibmFtZVwiOiBcIlNub3dkb3duIFNob3dkb3duIDF2MSBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiRklSU1RCTE9PRF8yeDJcIjoge1xyXG4gICAgICAgIFwicXVldWVUeXBlXCI6IFwiRklSU1RCTE9PRF8yeDJcIixcclxuICAgICAgICBcImdhbWVRdWV1ZUNvbmZpZ0lkXCI6IDczLFxyXG4gICAgICAgIFwibmFtZVwiOiBcIlNub3dkb3duIFNob3dkb3duIDJ2MiBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiU1JfNng2XCI6IHtcclxuICAgICAgICBcInF1ZXVlVHlwZVwiOiBcIlNSXzZ4NlwiLFxyXG4gICAgICAgIFwiZ2FtZVF1ZXVlQ29uZmlnSWRcIjogNzUsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiU3VtbW9uZXIncyBSaWZ0IDZ4NiBIZXhha2lsbCBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiVVJGXzV4NVwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJVUkZfNXg1XCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiA3NixcclxuICAgICAgICBcIm5hbWVcIjogXCJVbHRyYSBSYXBpZCBGaXJlIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJCT1RfVVJGXzV4NVwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJCT1RfVVJGXzV4NVwiLFxyXG4gICAgICAgIFwiZ2FtZVF1ZXVlQ29uZmlnSWRcIjogODMsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiVWx0cmEgUmFwaWQgRmlyZSBnYW1lcyBwbGF5ZWQgYWdhaW5zdCBBSSBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiTklHSFRNQVJFX0JPVF81eDVfUkFOSzFcIjoge1xyXG4gICAgICAgIFwicXVldWVUeXBlXCI6IFwiTklHSFRNQVJFX0JPVF81eDVfUkFOSzFcIixcclxuICAgICAgICBcImdhbWVRdWV1ZUNvbmZpZ0lkXCI6IDkxLFxyXG4gICAgICAgIFwibmFtZVwiOiBcIkRvb20gQm90cyBSYW5rIDEgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIk5JR0hUTUFSRV9CT1RfNXg1X1JBTksyXCI6IHtcclxuICAgICAgICBcInF1ZXVlVHlwZVwiOiBcIk5JR0hUTUFSRV9CT1RfNXg1X1JBTksyXCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiA5MixcclxuICAgICAgICBcIm5hbWVcIjogXCJEb29tIEJvdHMgUmFuayAyIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJOSUdIVE1BUkVfQk9UXzV4NV9SQU5LNVwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJOSUdIVE1BUkVfQk9UXzV4NV9SQU5LNVwiLFxyXG4gICAgICAgIFwiZ2FtZVF1ZXVlQ29uZmlnSWRcIjogOTMsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiRG9vbSBCb3RzIFJhbmsgNSBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiQVNDRU5TSU9OXzV4NVwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJBU0NFTlNJT05fNXg1XCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiA5NixcclxuICAgICAgICBcIm5hbWVcIjogXCJBc2NlbnNpb24gZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkhFWEFLSUxMXCI6IHtcclxuICAgICAgICBcInF1ZXVlVHlwZVwiOiBcIkhFWEFLSUxMXCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiA5OCxcclxuICAgICAgICBcIm5hbWVcIjogXCJUd2lzdGVkIFRyZWVsaW5lIDZ4NiBIZXhha2lsbCBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiS0lOR19QT1JPXzV4NVwiOiB7XHJcbiAgICAgICAgXCJxdWV1ZVR5cGVcIjogXCJLSU5HX1BPUk9fNXg1XCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiAzMDAsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiS2luZyBQb3JvIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJDT1VOVEVSX1BJQ0tcIjoge1xyXG4gICAgICAgIFwicXVldWVUeXBlXCI6IFwiQ09VTlRFUl9QSUNLXCIsXHJcbiAgICAgICAgXCJnYW1lUXVldWVDb25maWdJZFwiOiAzMTAsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiTmVtZXNpcyBnYW1lc1wiXHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1BVENITUFLSU5HX1FVRVVFUzsiLCIvKipcclxuICogTGVhZ3VlIG9mIExlZ2VuZHMgQVBJXHJcbiAqICBQbGF5ZXIgU3RhdCBTdW1tYXJ5IFR5cGVcclxuICpcclxuICovXHJcblxyXG52YXIgU1VCVFlQRSA9IHtcclxuICAgIFwiVW5yYW5rZWRcIjoge1xyXG4gICAgICAgIFwicGxheWVyU3RhdFN1bW1hcnlUeXBlXCI6IFwiVW5yYW5rZWRcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3VtbW9uZXIncyBSaWZ0IHVucmFua2VkIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJVbnJhbmtlZDN4M1wiOiB7XHJcbiAgICAgICAgXCJwbGF5ZXJTdGF0U3VtbWFyeVR5cGVcIjogXCJVbnJhbmtlZDN4M1wiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUd2lzdGVkIFRyZWVsaW5lIHVucmFua2VkIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJPZGluVW5yYW5rZWRcIjoge1xyXG4gICAgICAgIFwicGxheWVyU3RhdFN1bW1hcnlUeXBlXCI6IFwiT2RpblVucmFua2VkXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkRvbWluaW9uL0NyeXN0YWwgU2NhciBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiQXJhbVVucmFua2VkNXg1XCI6IHtcclxuICAgICAgICBcInBsYXllclN0YXRTdW1tYXJ5VHlwZVwiOiBcIkFyYW1VbnJhbmtlZDV4NVwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBUkFNIC8gSG93bGluZyBBYnlzcyBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiQ29vcFZzQUlcIjoge1xyXG4gICAgICAgIFwicGxheWVyU3RhdFN1bW1hcnlUeXBlXCI6IFwiQ29vcFZzQUlcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3VtbW9uZXIncyBSaWZ0IGFuZCBDcnlzdGFsIFNjYXIgZ2FtZXMgcGxheWVkIGFnYWluc3QgQUlcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkNvb3BWc0FJM3gzXCI6IHtcclxuICAgICAgICBcInBsYXllclN0YXRTdW1tYXJ5VHlwZVwiOiBcIkNvb3BWc0FJM3gzXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlR3aXN0ZWQgVHJlZWxpbmUgZ2FtZXMgcGxheWVkIGFnYWluc3QgQUlcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlJhbmtlZFNvbG81eDVcIjoge1xyXG4gICAgICAgIFwicGxheWVyU3RhdFN1bW1hcnlUeXBlXCI6IFwiUmFua2VkU29sbzV4NVwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTdW1tb25lcidzIFJpZnQgcmFua2VkIHNvbG8gcXVldWUgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlJhbmtlZFRlYW0zeDNcIjoge1xyXG4gICAgICAgIFwicGxheWVyU3RhdFN1bW1hcnlUeXBlXCI6IFwiUmFua2VkVGVhbTN4M1wiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUd2lzdGVkIFRyZWVsaW5lIHJhbmtlZCB0ZWFtIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJSYW5rZWRUZWFtNXg1XCI6IHtcclxuICAgICAgICBcInBsYXllclN0YXRTdW1tYXJ5VHlwZVwiOiBcIlJhbmtlZFRlYW01eDVcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3VtbW9uZXIncyBSaWZ0IHJhbmtlZCB0ZWFtIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJPbmVGb3JBbGw1eDVcIjoge1xyXG4gICAgICAgIFwicGxheWVyU3RhdFN1bW1hcnlUeXBlXCI6IFwiT25lRm9yQWxsNXg1XCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk9uZSBmb3IgQWxsIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJGaXJzdEJsb29kMXgxXCI6IHtcclxuICAgICAgICBcInBsYXllclN0YXRTdW1tYXJ5VHlwZVwiOiBcIkZpcnN0Qmxvb2QxeDFcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU25vd2Rvd24gU2hvd2Rvd24gMXgxIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJGaXJzdEJsb29kMngyXCI6IHtcclxuICAgICAgICBcInBsYXllclN0YXRTdW1tYXJ5VHlwZVwiOiBcIkZpcnN0Qmxvb2QyeDJcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU25vd2Rvd24gU2hvd2Rvd24gMngyIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJTdW1tb25lcnNSaWZ0Nng2XCI6IHtcclxuICAgICAgICBcInBsYXllclN0YXRTdW1tYXJ5VHlwZVwiOiBcIlN1bW1vbmVyc1JpZnQ2eDZcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3VtbW9uZXIncyBSaWZ0IDZ4NiBIZXhha2lsbCBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiQ0FQNXg1XCI6IHtcclxuICAgICAgICBcInBsYXllclN0YXRTdW1tYXJ5VHlwZVwiOiBcIkNBUDV4NVwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUZWFtIEJ1aWxkZXIgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlVSRlwiOiB7XHJcbiAgICAgICAgXCJwbGF5ZXJTdGF0U3VtbWFyeVR5cGVcIjogXCJVUkZcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVWx0cmEgUmFwaWQgRmlyZSBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiVVJGQm90c1wiOiB7XHJcbiAgICAgICAgXCJwbGF5ZXJTdGF0U3VtbWFyeVR5cGVcIjogXCJVUkZCb3RzXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlVsdHJhIFJhcGlkIEZpcmUgZ2FtZXMgcGxheWVkIGFnYWluc3QgQUlcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIk5pZ2h0bWFyZUJvdFwiOiB7XHJcbiAgICAgICAgXCJwbGF5ZXJTdGF0U3VtbWFyeVR5cGVcIjogXCJOaWdodG1hcmVCb3RcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3VtbW9uZXIncyBSaWZ0IGdhbWVzIHBsYXllZCBhZ2FpbnN0IE5pZ2h0bWFyZSBBSVwiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiQXNjZW5zaW9uXCI6IHtcclxuICAgICAgICBcInBsYXllclN0YXRTdW1tYXJ5VHlwZVwiOiBcIkFzY2Vuc2lvblwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBc2NlbnNpb24gZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkhleGFraWxsXCI6IHtcclxuICAgICAgICBcInBsYXllclN0YXRTdW1tYXJ5VHlwZVwiOiBcIkhleGFraWxsXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlR3aXN0ZWQgVHJlZWxpbmUgNng2IEhleGFraWxsIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJLaW5nUG9yb1wiOiB7XHJcbiAgICAgICAgXCJwbGF5ZXJTdGF0U3VtbWFyeVR5cGVcIjogXCJLaW5nUG9yb1wiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJLaW5nIFBvcm8gZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkNvdW50ZXJQaWNrXCI6IHtcclxuICAgICAgICBcInBsYXllclN0YXRTdW1tYXJ5VHlwZVwiOiBcIkNvdW50ZXJQaWNrXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk5lbWVzaXMgZ2FtZXNcIlxyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTVUJUWVBFOyIsIi8qKlxyXG4gKiBMZWFndWUgb2YgTGVnZW5kcyBBUElcclxuICogIFJlZ2lvbmFsIEVuZHBvaW50XHJcbiAqXHJcbiAqL1xyXG5cclxudmFyIFJFR0lPTkFMX0VORFBPSU5UID0ge1xyXG4gICAgXCJCUlwiOiB7XHJcbiAgICAgICAgXCJyZWdpb25cIjogXCJCUlwiLFxyXG4gICAgICAgIFwicGxhdGZvcm1JZFwiOiBcIkJSMVwiLFxyXG4gICAgICAgIFwiaG9zdFwiOiBcImJyLmFwaS5wdnAubmV0XCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJFVU5FXCI6IHtcclxuICAgICAgICBcInJlZ2lvblwiOiBcIkVVTkVcIixcclxuICAgICAgICBcInBsYXRmb3JtSWRcIjogXCJFVU5FMVwiLFxyXG4gICAgICAgIFwiaG9zdFwiOiBcImV1bmUuYXBpLnB2cC5uZXRcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkVVV1wiOiB7XHJcbiAgICAgICAgXCJyZWdpb25cIjogXCJFVVdcIixcclxuICAgICAgICBcInBsYXRmb3JtSWRcIjogXCJFVVcxXCIsXHJcbiAgICAgICAgXCJob3N0XCI6IFwiZXV3LmFwaS5wdnAubmV0XCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJLUlwiOiB7XHJcbiAgICAgICAgXCJyZWdpb25cIjogXCJLUlwiLFxyXG4gICAgICAgIFwicGxhdGZvcm1JZFwiOiBcIktSXCIsXHJcbiAgICAgICAgXCJob3N0XCI6IFwia3IuYXBpLnB2cC5uZXRcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkxBTlwiOiB7XHJcbiAgICAgICAgXCJyZWdpb25cIjogXCJMQU5cIixcclxuICAgICAgICBcInBsYXRmb3JtSWRcIjogXCJMQTFcIixcclxuICAgICAgICBcImhvc3RcIjogXCJsYW4uYXBpLnB2cC5uZXRcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkxBU1wiOiB7XHJcbiAgICAgICAgXCJyZWdpb25cIjogXCJMQVNcIixcclxuICAgICAgICBcInBsYXRmb3JtSWRcIjogXCJMQTJcIixcclxuICAgICAgICBcImhvc3RcIjogXCJsYXMuYXBpLnB2cC5uZXRcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIk5BXCI6IHtcclxuICAgICAgICBcInJlZ2lvblwiOiBcIk5BXCIsXHJcbiAgICAgICAgXCJwbGF0Zm9ybUlkXCI6IFwiTkExXCIsXHJcbiAgICAgICAgXCJob3N0XCI6IFwibmEuYXBpLnB2cC5uZXRcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIk9DRVwiOiB7XHJcbiAgICAgICAgXCJyZWdpb25cIjogXCJPQ0VcIixcclxuICAgICAgICBcInBsYXRmb3JtSWRcIjogXCJPQzFcIixcclxuICAgICAgICBcImhvc3RcIjogXCJvY2UuYXBpLnB2cC5uZXRcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlRSXCI6IHtcclxuICAgICAgICBcInJlZ2lvblwiOiBcIlRSXCIsXHJcbiAgICAgICAgXCJwbGF0Zm9ybUlkXCI6IFwiVFIxXCIsXHJcbiAgICAgICAgXCJob3N0XCI6IFwidHIuYXBpLnB2cC5uZXRcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlJVXCI6IHtcclxuICAgICAgICBcInJlZ2lvblwiOiBcIlJVXCIsXHJcbiAgICAgICAgXCJwbGF0Zm9ybUlkXCI6IFwiUlVcIixcclxuICAgICAgICBcImhvc3RcIjogXCJydS5hcGkucHZwLm5ldFwiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiUEJFXCI6IHtcclxuICAgICAgICBcInJlZ2lvblwiOiBcIlBCRVwiLFxyXG4gICAgICAgIFwicGxhdGZvcm1JZFwiOiBcIlBCRTFcIixcclxuICAgICAgICBcImhvc3RcIjogXCJnbG9iYWwuYXBpLnB2cC5uZXRcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkdsb2JhbFwiOiB7XHJcbiAgICAgICAgXCJyZWdpb25cIjogXCJHbG9iYWxcIixcclxuICAgICAgICBcInBsYXRmb3JtSWRcIjogbnVsbCxcclxuICAgICAgICBcImhvc3RcIjogXCJnbG9iYWwuYXBpLnB2cC5uZXRcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlN0YXR1c1wiOiB7XHJcbiAgICAgICAgXCJyZWdpb25cIjogXCJTdGF0dXNcIixcclxuICAgICAgICBcInBsYXRmb3JtSWRcIjogbnVsbCxcclxuICAgICAgICBcImhvc3RcIjogXCJzdGF0dXMubGVhZ3Vlb2ZsZWdlbmRzLmNvbVwiXHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJFR0lPTkFMX0VORFBPSU5UOyIsIi8qKlxyXG4gKiBMZWFndWUgb2YgTGVnZW5kcyBBUElcclxuICogIFNlYXNvblxyXG4gKlxyXG4gKiAgUklUT19DT01QTEFJTlQ6IFRoaXMgY29uc3RhbnRzIGFyZSBub3QgZG9jdW1lbnRlZCBpbiB0aGUgY29uc3RhbnQgc2VjdGlvbi4gQWRkZWQgaXQgZm9yIHRoZSBTdGF0cyBlbmRwb2ludFxyXG4gKi9cclxuXHJcbnZhciBTRUFTT04gPSB7XHJcbiAgICBcIlNFQVNPTjNcIjogXCJTRUFTT04zXCIsXHJcbiAgICBcIlNFQVNPTjIwMTRcIjogXCJTRUFTT04yMDE0XCIsXHJcbiAgICBcIlNFQVNPTjIwMTVcIjogXCJTRUFTT04yMDE1XCJcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU0VBU09OOyIsIi8qKlxyXG4gKiBMZWFndWUgb2YgTGVnZW5kcyBBUElcclxuICogIFN1YnR5cGVcclxuICpcclxuICovXHJcblxyXG52YXIgU1VCVFlQRSA9IHtcclxuICAgIFwiTk9ORVwiOiB7XHJcbiAgICAgICAgXCJzdWJUeXBlXCI6IFwiTk9ORVwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJDdXN0b20gZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIk5PUk1BTFwiOiB7XHJcbiAgICAgICAgXCJzdWJUeXBlXCI6IFwiTk9STUFMXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlN1bW1vbmVyJ3MgUmlmdCB1bnJhbmtlZCBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiTk9STUFMXzN4M1wiOiB7XHJcbiAgICAgICAgXCJzdWJUeXBlXCI6IFwiTk9STUFMXzN4M1wiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUd2lzdGVkIFRyZWVsaW5lIHVucmFua2VkIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJPRElOX1VOUkFOS0VEXCI6IHtcclxuICAgICAgICBcInN1YlR5cGVcIjogXCJPRElOX1VOUkFOS0VEXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkRvbWluaW9uL0NyeXN0YWwgU2NhciBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiQVJBTV9VTlJBTktFRF81eDVcIjoge1xyXG4gICAgICAgIFwic3ViVHlwZVwiOiBcIkFSQU1fVU5SQU5LRURfNXg1XCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkFSQU0gLyBIb3dsaW5nIEFieXNzIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJCT1RcIjoge1xyXG4gICAgICAgIFwic3ViVHlwZVwiOiBcIkJPVFwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTdW1tb25lcidzIFJpZnQgYW5kIENyeXN0YWwgU2NhciBnYW1lcyBwbGF5ZWQgYWdhaW5zdCBJbnRybywgQmVnaW5uZXIsIG9yIEludGVybWVkaWF0ZSBBSVwiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiQk9UXzN4M1wiOiB7XHJcbiAgICAgICAgXCJzdWJUeXBlXCI6IFwiQk9UXzN4M1wiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUd2lzdGVkIFRyZWVsaW5lIGdhbWVzIHBsYXllZCBhZ2FpbnN0IEFJXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJSQU5LRURfU09MT181eDVcIjoge1xyXG4gICAgICAgIFwic3ViVHlwZVwiOiBcIlJBTktFRF9TT0xPXzV4NVwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTdW1tb25lcidzIFJpZnQgcmFua2VkIHNvbG8gcXVldWUgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlJBTktFRF9URUFNXzN4M1wiOiB7XHJcbiAgICAgICAgXCJzdWJUeXBlXCI6IFwiUkFOS0VEX1RFQU1fM3gzXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlR3aXN0ZWQgVHJlZWxpbmUgcmFua2VkIHRlYW0gZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlJBTktFRF9URUFNXzV4NVwiOiB7XHJcbiAgICAgICAgXCJzdWJUeXBlXCI6IFwiUkFOS0VEX1RFQU1fNXg1XCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlN1bW1vbmVyJ3MgUmlmdCByYW5rZWQgdGVhbSBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiT05FRk9SQUxMXzV4NVwiOiB7XHJcbiAgICAgICAgXCJzdWJUeXBlXCI6IFwiT05FRk9SQUxMXzV4NVwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJPbmUgZm9yIEFsbCBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiRklSU1RCTE9PRF8xeDFcIjoge1xyXG4gICAgICAgIFwic3ViVHlwZVwiOiBcIkZJUlNUQkxPT0RfMXgxXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNub3dkb3duIFNob3dkb3duIDF4MSBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiRklSU1RCTE9PRF8yeDJcIjoge1xyXG4gICAgICAgIFwic3ViVHlwZVwiOiBcIkZJUlNUQkxPT0RfMngyXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNub3dkb3duIFNob3dkb3duIDJ4MiBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiU1JfNng2XCI6IHtcclxuICAgICAgICBcInN1YlR5cGVcIjogXCJTUl82eDZcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3VtbW9uZXIncyBSaWZ0IDZ4NiBIZXhha2lsbCBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiQ0FQXzV4NVwiOiB7XHJcbiAgICAgICAgXCJzdWJUeXBlXCI6IFwiQ0FQXzV4NVwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUZWFtIEJ1aWxkZXIgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlVSRlwiOiB7XHJcbiAgICAgICAgXCJzdWJUeXBlXCI6IFwiVVJGXCIsXHJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlVsdHJhIFJhcGlkIEZpcmUgZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIlVSRl9CT1RcIjoge1xyXG4gICAgICAgIFwic3ViVHlwZVwiOiBcIlVSRl9CT1RcIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVWx0cmEgUmFwaWQgRmlyZSBnYW1lcyBwbGF5ZWQgYWdhaW5zdCBBSVwiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiTklHSFRNQVJFX0JPVFwiOiB7XHJcbiAgICAgICAgXCJzdWJUeXBlXCI6IFwiTklHSFRNQVJFX0JPVFwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTdW1tb25lcidzIFJpZnQgZ2FtZXMgcGxheWVkIGFnYWluc3QgTmlnaHRtYXJlIEFJXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJBU0NFTlNJT05cIjoge1xyXG4gICAgICAgIFwic3ViVHlwZVwiOiBcIkFTQ0VOU0lPTlwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBc2NlbnNpb24gZ2FtZXNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBcIkhFWEFLSUxMXCI6IHtcclxuICAgICAgICBcInN1YlR5cGVcIjogXCJIRVhBS0lMTFwiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUd2lzdGVkIFRyZWVsaW5lIDZ4NiBIZXhha2lsbCBnYW1lc1wiXHJcbiAgICB9LFxyXG5cclxuICAgIFwiS0lOR19QT1JPXCI6IHtcclxuICAgICAgICBcInN1YlR5cGVcIjogXCJLSU5HX1BPUk9cIixcclxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiS2luZyBQb3JvIGdhbWVzXCJcclxuICAgIH0sXHJcblxyXG4gICAgXCJDT1VOVEVSX1BJQ0tcIjoge1xyXG4gICAgICAgIFwic3ViVHlwZVwiOiBcIkNPVU5URVJfUElDS1wiLFxyXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJOZW1lc2lzIGdhbWVzXCJcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU1VCVFlQRTsiLCIvKipcclxuICogTGVhZ3VlIG9mIExlZ2VuZHMgQVBJXHJcbiAqICBFbmRwb2ludCBCaW5kaW5nIChJTylcclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcGlLZXksIHJlZ2lvbikge1xyXG4gICAgdmFyIGlvID0ge1xyXG4gICAgICAgIGFwaV9rZXk6IGFwaUtleSxcclxuICAgICAgICByZWdpb246IHJlZ2lvblxyXG4gICAgfTtcclxuXHJcbiAgICBpby5DaGFtcGlvbiA9IHJlcXVpcmUoJy4vYXBpL2NoYW1waW9uJykuYXBwbHkoaW8pO1xyXG4gICAgaW8uQ3VycmVudEdhbWUgPSByZXF1aXJlKCcuL2FwaS9jdXJyZW50LWdhbWUnKS5hcHBseShpbyk7XHJcbiAgICBpby5GZWF0dXJlZEdhbWVzID0gcmVxdWlyZSgnLi9hcGkvZmVhdHVyZWQtZ2FtZXMnKS5hcHBseShpbyk7XHJcbiAgICBpby5HYW1lID0gcmVxdWlyZSgnLi9hcGkvZ2FtZScpLmFwcGx5KGlvKTtcclxuICAgIGlvLkxlYWd1ZSA9IHJlcXVpcmUoJy4vYXBpL2xlYWd1ZScpLmFwcGx5KGlvKTtcclxuICAgIGlvLkxPTFN0YXRpY0RhdGEgPSByZXF1aXJlKCcuL2FwaS9sb2wtc3RhdGljLWRhdGEnKS5hcHBseShpbyk7XHJcbiAgICBpby5MT0xTdGF0dXMgPSByZXF1aXJlKCcuL2FwaS9sb2wtc3RhdHVzJykuYXBwbHkoaW8pO1xyXG4gICAgaW8uTWF0Y2ggPSByZXF1aXJlKCcuL2FwaS9tYXRjaCcpLmFwcGx5KGlvKTtcclxuICAgIGlvLk1hdGNoSGlzdG9yeSA9IHJlcXVpcmUoJy4vYXBpL21hdGNoLWhpc3RvcnknKS5hcHBseShpbyk7XHJcbiAgICBpby5TdGF0cyA9IHJlcXVpcmUoJy4vYXBpL3N0YXRzJykuYXBwbHkoaW8pO1xyXG4gICAgaW8uU3VtbW9uZXIgPSByZXF1aXJlKCcuL2FwaS9zdW1tb25lcicpLmFwcGx5KGlvKTtcclxuICAgIGlvLlRlYW0gPSByZXF1aXJlKCcuL2FwaS90ZWFtJykuYXBwbHkoaW8pO1xyXG5cclxuICAgIHJldHVybiBpbztcclxufTsiLCJ2YXIgQ09OU1QgPSByZXF1aXJlKCcuLi9jb3JlL2NvbnN0Jyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyZWdpb24sIGNhbGxiYWNrKSB7XHJcbiAgICBpZiAoQ09OU1QuUkVHSU9OQUxfRU5EUE9JTlRbcmVnaW9uXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY2FsbGJhY2soXCJFcnJvcjogUmVnaW9uIG5vdCBwcm92aWRlZCBvciBpbnZhbGlkLlwiKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn07IiwiLyoqXHJcbiAqIExlYWd1ZSBvZiBMZWdlbmRzIEFQSVxyXG4gKiAgU3RyaW5nIHJlcGxhY2VyXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3JpZ2luU3RyaW5nLCByZXBsYWNlV2l0aCwgY2FsbGJhY2spIHtcclxuICAgIGZvciAodmFyIGlkIGluIHJlcGxhY2VXaXRoKVxyXG4gICAgICAgIGlmIChyZXBsYWNlV2l0aC5oYXNPd25Qcm9wZXJ0eShpZCkpXHJcbiAgICAgICAgICAgIG9yaWdpblN0cmluZyA9IG9yaWdpblN0cmluZy5yZXBsYWNlKG5ldyBSZWdFeHAoXCJ7XCIgKyBpZCArIFwifVwiKSwgcmVwbGFjZVdpdGhbaWRdKTtcclxuXHJcbiAgICB2YXIgbWF0Y2hlcyA9IG9yaWdpblN0cmluZy5tYXRjaChuZXcgUmVnRXhwKFwiey4qP31cIiwgXCJnXCIpKTtcclxuXHJcbiAgICBjYWxsYmFjayhtYXRjaGVzLCBvcmlnaW5TdHJpbmcpO1xyXG59OyIsInZhciB3aGF0VHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGlzT2JqZWN0OiBmdW5jdGlvbihvYmplY3QpIHtcclxuICAgIHJldHVybiAod2hhdFR5cGUuY2FsbChvYmplY3QpID09PSBcIltvYmplY3QgT2JqZWN0XVwiKTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNGdW5jdGlvbjogZnVuY3Rpb24ob2JqZWN0KSB7XHJcbiAgICAgICAgcmV0dXJuICh3aGF0VHlwZS5jYWxsKG9iamVjdCkgPT09IFwiW29iamVjdCBGdW5jdGlvbl1cIik7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzQXJyYXkgOiBmdW5jdGlvbihvYmplY3QpIHtcclxuICAgICAgICByZXR1cm4gKHdoYXRUeXBlLmNhbGwob2JqZWN0KSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNTdHJpbmc6IGZ1bmN0aW9uKG9iamVjdCkge1xyXG4gICAgICAgIHJldHVybiAod2hhdFR5cGUuY2FsbChvYmplY3QpID09PSBcIltvYmplY3QgU3RyaW5nXVwiKTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNOdW1iZXI6IGZ1bmN0aW9uKG9iamVjdCkge1xyXG4gICAgICAgIHJldHVybiAod2hhdFR5cGUuY2FsbChvYmplY3QpID09PSBcIltvYmplY3QgTnVtYmVyXVwiKTtcclxuICAgIH1cclxufTsiXX0=
