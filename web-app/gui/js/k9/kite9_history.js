/**
 * This file handles the browser history, loading XML and moving between different versions of the 
 * document
 */
function setup_history(kite9) {
	
	NEW_URL = "?page=init.sxml";

	// for url changes when we load new diagram content.
	kite9.browserHistory = window.History;

	if (kite9.browserHistory.enabled) {
		kite9.browserHistory.Adapter.bind(window, 'statechange', function() {
			State = kite9.browserHistory.getState();
			var subIndex = State.url.lastIndexOf("?");
			historyState = subIndex !== -1 ? State.url.substring(subIndex) : undefined;
			var historyId = kite9.urlToHistory[historyState];
			if (historyId !== undefined) {
				kite9.historical(historyId);
			} else {
				// we're restarting from scratch
				kite9.historyPos = -1;
				kite9.load(kite9.main_control, historyState);
			}
		});
	}
	
	kite9.history = [];
	kite9.historyPos = -1;
	kite9.urlToHistory = {};
	
	/**
	 * Attach to this to receive notification of when history changes.
	 */
	kite9.historyListeners = [];

	/**
	 * Call this function to retrieve the XML for a particular 
	 * historical version of the diagram.
	 */
	kite9.historical = function(i) {
		if (kite9.historyPos != i) {
			var xmlText = kite9.history[i];
			kite9.historyPos = i;
			kite9.update(kite9.main_control, xmlText);
			for ( var int = 0; int < kite9.historyListeners.length; int++) {
				kite9.historyListeners[int]();
			}
		}
	}

	/**
	 * Rewrite the URL so that we can use back/forward on the browser.
	 * Set the cookie for the last page viewed.
	 * Add the diagram to the history
	 */
	kite9.main_control.changed.push(function (new_ri, memento) {
		if (memento.type === 'diagram') {
			var hash = $(memento.location).attr("hash");
			var xmlText = kite9.main_control.xmlText;
			
			// rewrite the url
			if (hash) {
				kite9.shownState = "?hash="+hash+"&stylesheet="+kite9.main_control.stylesheet;
				$.cookies.set("hash", hash);
			} else {
				kite9.shownState = NEW_URL;
			}
			
			// set the history, if it has changed.
			var oldHistory = kite9.history[kite9.historyPos];
			var change = xmlText != oldHistory;
			var len = kite9.history.length;
			
			if (change) {
				kite9.history[kite9.historyPos] = xmlText;
				kite9.history.splice(kite9.historyPos+1, len-kite9.historyPos);	
				kite9.urlToHistory[kite9.shownState] = kite9.historyPos;

				// since the page has changed, update the browser history
				if (kite9.browserHistory.enabled)  {
					kite9.browserHistory.pushState(null, "Kite9 Diagram Designer", kite9.shownState);
				}
			}

			for ( var int = 0; int < kite9.historyListeners.length; int++) {
				kite9.historyListeners[int]();
			}
			
		}
	});
		
	/**
	 * When a load occurs, we need to advance the history position by 1.
	 */
	kite9.main_control.load_listeners.push(function() {
		kite9.historyPos ++;
	});
	
	/**
	 * Google analytics tracking
	 */
	kite9.main_control.load_listeners.push(function () {
		try{
			var pageTracker = _gat._getTracker("UA-11589584-2");
			pageTracker._trackPageview();
		} catch(err) {}
	});
	
	   //      if (location.href.indexOf("#") !== -1) {
    //      	 // support for IE9 hash URLs.
    //      	var queryString = location.href.substring(location.href.indexOf("?"));
    //      	var url = POST_URL + queryString;
    //      }
	
	
	// undo / redo
	
	$('#historical').buttonset();
	
	$('#undo').button({
		text : true,
		icons : {
			primary : "ui-icon-circle-arrow-w"
		},
		disabled: true
	}).click(function () {
		kite9.historical(kite9.historyPos-1);
	});

	$('#redo').button({
		text : true,
		icons : {
			primary : "ui-icon-circle-arrow-e"
		},
		disabled: true
	}).click(function () {
		kite9.historical(kite9.historyPos+1);
	});
	
	kite9.historyListeners.push(function () {
		if (kite9.historyPos > 0) {
			$('#undo').button("enable");
		} else {
			$('#undo').button("disable");
		}
		
		if (kite9.historyPos < kite9.history.length-1) {
			$('#redo').button("enable");
		} else {
			$("#redo").button("disable");
		}
	});
}