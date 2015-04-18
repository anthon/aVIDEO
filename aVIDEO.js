// Generated by CoffeeScript 1.8.0
var aVIMEO;

aVIMEO = (function() {
  var eventCallbacks, getCallback, getDomainFromUrl, isFunction, isReady, onMessageReceived, playerDomain, postMessage, removeCallback, slice, storeCallback;
  aVIMEO = function(iframe) {
    return new aVIMEO.fn.init(iframe);
  };
  eventCallbacks = {};
  isReady = false;
  slice = Array.prototype.slice;
  playerDomain = '';
  aVIMEO.fn = aVIMEO.prototype = {
    element: null,
    target_id: null,
    init: function(iframe) {
      if (typeof iframe === 'string') {
        iframe = document.getElementById(iframe);
      }
      this.element = iframe;
      this.target_id = this.element.id !== '' ? this.element.id : null;
      playerDomain = getDomainFromUrl(this.element.getAttribute('src'));
      return this;
    },
    api: function(method, valueOrCallback) {
      var callback, element, params, target_id;
      if (!this.element || !method) {
        return false;
      }
      element = this.element;
      target_id = this.target_id;
      if (isFunction(valueOrCallback)) {
        params = null;
        callback = valueOrCallback;
        storeCallback(method, callback, target_id);
      } else {
        params = valueOrCallback;
        callback = null;
      }
      postMessage(method, params, element);
      return this;
    },
    addEvent: function(eventName, callback) {
      var element, target_id;
      if (!this.element) {
        return false;
      }
      element = this.element;
      target_id = this.target_id;
      storeCallback(eventName, callback, target_id);
      if (eventName !== 'ready') {
        postMessage('addEventListener', eventName, element);
      } else if (eventName === 'ready' && isReady) {
        callback.call(null, target_id);
      }
      return this;
    },
    removeEvent: function(eventName) {
      var element, removed, target_id;
      if (!this.element) {
        return false;
      }
      element = this.element;
      target_id = this.target_id;
      removed = removeCallback(eventName, target_id);
      if (eventName !== 'ready' && removed) {
        return postMessage('removeEventListener', eventName, element);
      }
    }
  };
  postMessage = function(method, params, target) {
    var data, url;
    if (!target.contentWindow.postMessage) {
      return false;
    }
    url = target.getAttribute('src').split('?')[0];
    data = JSON.stringify({
      method: method,
      value: params
    });
    if (url.substr(0, 2) === '//') {
      url = window.location.protocol + url;
    }
    return target.contentWindow.postMessage(data, url);
  };
  onMessageReceived = function(event) {
    var callback, data, e, eventData, method, params, target_id, value;
    if (event.origin !== playerDomain) {
      return false;
    }
    try {
      data = JSON.parse(event.data);
      method = data.event || data.method;
    } catch (_error) {
      e = _error;
    }
    if (method === 'ready' && !isReady) {
      isReady = true;
    }
    value = data.value;
    eventData = data.data;
    target_id = target_id === '' ? null : data.player_id;
    callback = getCallback(method, target_id);
    params = [];
    if (!callback) {
      return false;
    }
    if (value !== void 0) {
      params.push(value);
    }
    if (eventData) {
      params.push(eventData);
    }
    if (target_id) {
      params.push(target_id);
    }
    if (params.length > 0) {
      return callback.apply(null, params);
    } else {
      return callback.call();
    }
  };
  storeCallback = function(eventName, callback, target_id) {
    if (target_id) {
      eventCallbacks[target_id] = eventCallbacks[target_id] || {};
      return eventCallbacks[target_id][eventName] = callback;
    } else {
      return eventCallbacks[eventName] = callback;
    }
  };
  getCallback = function(eventName, target_id) {
    if (target_id) {
      return eventCallbacks[target_id][eventName];
    } else {
      return eventCallbacks[eventName];
    }
  };
  removeCallback = function(eventName, target_id) {
    if (target_id && eventCallbacks[target_id]) {
      if (!eventCallbacks[target_id][eventName]) {
        return false;
      }
      eventCallbacks[target_id][eventName] = null;
    } else {
      if (!eventCallbacks[eventName]) {
        return false;
      }
      eventCallbacks[eventName] = null;
    }
    return true;
  };
  getDomainFromUrl = function(url) {
    var domain, matches;
    if (url.substr(0, 2) === '//') {
      url = window.location.protocol + url;
    }
    matches = url.match(/^(https?\:\/\/[^\/?#]+)/i);
    return domain = matches && matches[1];
  };
  isFunction = function(obj) {
    return toString.call(obj) === '[object Function]';
  };
  aVIMEO.fn.init.prototype = aVIMEO.fn;
  if (window.addEventListener) {
    window.addEventListener('message', onMessageReceived, false);
  } else {
    window.attachEvent('onmessage', onMessageReceived);
  }
  return (window.aVIMEO = window.$v = aVIMEO);
})();
