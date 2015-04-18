
aVIMEO = (->

	aVIMEO = (iframe)->
		new aVIMEO.fn.init iframe

	eventCallbacks = {}
	isReady = false
	slice = Array.prototype.slice
	playerDomain = ''

	aVIMEO.fn = aVIMEO.prototype =
		
		element: null
		target_id: null

		init: (iframe)->
			if typeof iframe is 'string'
				iframe = document.getElementById iframe

			this.element = iframe
			this.target_id = if this.element.id isnt '' then this.element.id else null

			playerDomain = getDomainFromUrl this.element.getAttribute('src')

			return this

		api: (method,valueOrCallback)->

			if not this.element or not method then return false

			element = this.element
			target_id = this.target_id

			if isFunction valueOrCallback
				params = null
				callback = valueOrCallback
				storeCallback method, callback, target_id
			else
				params = valueOrCallback
				callback = null

			postMessage method, params, element
			return this

		addEvent: (eventName, callback)->

			if not this.element then return false

			element = this.element
			target_id = this.target_id

			storeCallback eventName, callback, target_id

			if eventName isnt 'ready'
				postMessage 'addEventListener', eventName, element
			else if eventName is 'ready' and isReady
				callback.call null, target_id

			return this

		removeEvent: (eventName)->

			if not this.element then return false

			element = this.element
			target_id = this.target_id
			removed = removeCallback eventName, target_id

			if eventName isnt 'ready' and removed
				postMessage 'removeEventListener', eventName, element


	postMessage = (method, params, target)->

		if not target.contentWindow.postMessage then return false

		url = target.getAttribute('src').split('?')[0]
		data = JSON.stringify
			method: method
			value: params

		if url.substr(0,2) is '//'
			url = window.location.protocol + url

		target.contentWindow.postMessage data, url

	onMessageReceived = (event)->

		if event.origin isnt playerDomain
			return false

		try
			data = JSON.parse event.data
			method = data.event || data.method
		catch e
			# fail

		if method is 'ready' and not isReady
			isReady = true

		value = data.value
		eventData = data.data
		target_id = if target_id is '' then null else data.player_id
		callback = getCallback method, target_id
		params = []

		if not callback then return false

		if value isnt undefined then params.push value

		if eventData then params.push eventData

		if target_id then params.push target_id

		if params.length > 0 then callback.apply(null,params) else callback.call()

	storeCallback = (eventName, callback, target_id)->

		if target_id
			eventCallbacks[target_id] = eventCallbacks[target_id] || {}
			eventCallbacks[target_id][eventName] = callback
		else
			eventCallbacks[eventName] = callback

	getCallback = (eventName, target_id)->

		if target_id
			return eventCallbacks[target_id][eventName]
		else
			return eventCallbacks[eventName]

	removeCallback = (eventName, target_id)->

		if target_id and eventCallbacks[target_id]
			if not eventCallbacks[target_id][eventName] then return false
			eventCallbacks[target_id][eventName] = null
		else
			if not eventCallbacks[eventName] then return false
			eventCallbacks[eventName] = null
		return true

	getDomainFromUrl = (url)->

		if url.substr(0,2) is '//'
			url = window.location.protocol + url

		matches = url.match /^(https?\:\/\/[^\/?#]+)/i
		domain = matches and matches[1]

	isFunction = (obj)->
		return toString.call(obj) is '[object Function]'


	aVIMEO.fn.init.prototype = aVIMEO.fn

	if window.addEventListener
		window.addEventListener 'message', onMessageReceived, false
	else
		window.attachEvent 'onmessage', onMessageReceived


	return (window.aVIMEO = window.$v = aVIMEO)

)()
























