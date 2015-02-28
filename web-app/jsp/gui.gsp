<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<title>Kite9 Diagram Designer</title>
		<meta http-equiv="X-UA-Compatible" content="chrome=IE8">
		<!--link type="text/css" href="css/ui-lightness/jquery-ui-1.8.13.custom.css" rel="stylesheet" /-->	
		<link type="text/css" href="css/red-theme/jquery-ui-1.10.3.custom.css" rel="stylesheet" />	
		<meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
		
		<link type="text/css" href="stylesheet.css?name=${style}" rel="stylesheet" />	
		
		<link type="text/css" href="css/main-red.css" rel="stylesheet" />
		<link type="text/css" href="css/codemirror.css" rel="stylesheet" />
		<link type="text/css" href="js/cm/theme/default.css" rel="stylesheet" />
		<link type="text/css" href="css/ipad-menu.css" rel="stylesheet" />
		<link type="text/css" href="css/spectrum.css" rel="stylesheet" />
		<link type="text/css" href="css/fontselector.css" rel="stylesheet" />
		
		<!--[if IE 7]>
    		<link rel="stylesheet" type="text/css" href="css/ie7.css" rel="stylesheet" />
			<script src="js/json2.js"></script>	
		<![endif]-->
		

		<script src="js/raphael.2.1.2.large.js"></script> <!-- this is a patched version @line 5068 -->
		<script src="js/jquery-1.9.1.min.js"></script>
		<script src="js/jquery-ui-1.10.3.custom.min.js"></script>
		<script src="js/jquery.autogrowtextarea.min.js"></script>
		<script src="js/jquery.selectbox.js"></script>
		<script src="js/jquery.fontselector.js"></script>
		<script src="js/spectrum.js"></script>
		<script src="js/history.js"></script>	
		<script src="js/history.adapter.jquery.js"></script>	
		<script src="js/history.html4.js"></script>	
		<script src="js/k9/kite9_style_chooser.js"></script>
		<script src="js/k9/kite9_primitives.js"></script>
		<script src="js/k9/kite9_rendering.js"></script>
		<script src="js/k9/kite9_selection.js"></script>
		<script src="js/k9/kite9_srp.js"></script>
		<script src="js/k9/kite9_drag_and_drop.js"></script>
		<script src="js/k9/kite9_history.js"></script>
		<script src="stylesheet.js?name=${style}&jsonp=setup_stylesheet" type="text/javascript"></script>
		<script src="js/k9/kite9_controls_symbols.js"></script>
		<script src="js/k9/kite9_controls_main.js"></script>	
		<script src="js/k9/kite9_controls_popups.js"></script>	
		<script src="js/k9/kite9_controls_file.js"></script>	
		<script src="js/k9/kite9_controls_link.js"></script>	
		<script src="js/k9/kite9_drag_auto_connect.js"></script>	
		<script src="js/browser.detect.js"></script>	
		<script src="js/codemirror.js" type="text/javascript"></script>
		<script src="js/cm/mode/xml/xml.js" type="text/javascript"></script>
		<script src="js/jquery.cookies.2.2.0.min.js" type="text/javascript"></script>
		<script src='js/ga.js' type='text/javascript'></script>
		<script src='js/hammer.js' type='text/javascript'></script>
		<!-- script src='js/jquery.simplemodal.js' type='text/javascript'></script>
		<script src='js/simplemodal.js' type='text/javascript'></script -->
		
		<script><!--
		window.onload = function () {
             kite9 = {}; 
             
             if (!isBrowserSupported()) {
             	$("#browser").dialog({
					resizable: false,
					autoOpen: false,
					width: 600,
					modal: true,
					buttons: {
						"Ok": function() { 
							$(this).dialog("close"); 
						} 
					}
				}).dialog("open"); 
                $('#loading').css("display","none");
             } 
             
           	 kite9.isTouch = navigator.userAgent.match(/iPad/i) != null;
           	 $("body").addClass(kite9.isTouch ? "touch" : "mouse");
           	 setup_primitives(kite9);
		     setup_rendering(kite9);
             kite9.main_control = kite9.new_control(Raphael("holder", 1, 1), $('#holder'));
             setup_selection(kite9, kite9.main_control);
             setup_srp(kite9);
             setup_dragable(kite9, kite9.main_control);
             setup_autoconnect(kite9, kite9.main_control);
             setup_history(kite9, kite9.main_control);
             setup_style_chooser(kite9, kite9.main_control);
             
             $('#controls').buttonset();
             setup_controls_symbols(kite9);
             setup_controls_main(kite9);
             kite9.main_control.stylesheet = '${style}'; 
             
             setup_controls_popups(kite9);
             setup_controls_file(kite9);
             setup_controls_link(kite9);
			 
             // set by the Java controller
             var url = "${xmlUrl}";
             
			 if (url.indexOf("sxml") !== -1) {
	         	// check for cookies
	         	var hash = $.cookies.get("hash");
	         	if (hash !== null) {
	      			url = window.location.href.substring(0, window.location.href.lastIndexOf("/"))+"/view/"+hash+"/"+kite9.main_control.stylesheet+".xml";    		 
	         	}
			 }

			 kite9.load(kite9.main_control, url, undefined);
	
			 // show the main page when load is done
			 kite9.main_control.update_listeners.push(function() {
	            $('#loading').css("display","none");
			 });
			
        };
		--></script>
	</head>  
	<body>
		<div id="toolbar" class="ui-widget-header ui-corner-all toolbar header-bar">
			<div class="row1">
			
				<span id="file_span">
					<img id="loading1" src="images/ajax-loader.gif" alt="loading"/>
					<button id="file">file</button>
				</span>	
			
				<button id="add">add...</button>
				
				<span id="controls">
					<input type="checkbox" id="move" /><label for="move" id="lmove">move</label>
					<input type="checkbox" id="multi" /><label for="multi">multi</label>
					<input type="checkbox" id="link" /><label for="link">link</label> 
					<button id="link_menu">link options</button>
				</span>
				
				<span id="historical">
					<button id='undo'>undo</button>
					<button id='redo'>redo</button>
				</span>
				<span id="zoom">
					<button id='zoom-in'>zoom in</button>
					<button id='zoom-out'>zoom out</button>
				</span>
			</div>
		</div>	
		
		<menu id="palette-frame" class="ipad-menu" style="opacity: 0; z-index: -50; visibility: hidden">
			<div id="menuHandle"></div>
			<div class="menuHeader">
				<!--a class="button back black"><span class="pointer"></span>Back</a-->
				<h3>Chooser</h3>
				<a id="palette-close" class="button close black">Close</a>
			</div>
			<div id="palette" title="drag elements onto diagram">
				<div id="palette-accordion" />
			</div>
		</menu>
		
		<menu id="link-frame" class="ipad-menu" style="opacity: 0; z-index: -50; visibility: hidden">
			<div id="menuHandle"></div>
			<div class="menuHeader">
				<h3>Link Options</h3>
				<a id="link-menu-close" class="button close black">Close</a>
			</div>
			<div class="menuWhiteBG">
				<ul class="dropdown-menu-basic">
					<li id="link_style_current" class="disabled"></li>
					<li id="link_style_copy_selected" class="disabled">Copy Selected Link Style </li>
					<li id="link_style_auto_connect_new" title="Auto connect new elements only">Auto-Connect: New</li>
					<li id="link_style_auto_connect_on" title="Create new connections between aligned elements">Auto-Connect: On</li>
					<li id="link_style_auto_connect_off" title="Don't create new connections when aligning">Auto-Connect: Off</li>
				</ul>
			</div>
		</menu>
		
		<menu id="file-frame" class="ipad-menu" style="opacity: 0; z-index: -50; visibility: hidden">
			<div id="menuHandle"></div>
			<div class="menuHeader">
				<h3>Options</h3>
				<a id="file-menu-close" class="button close black">Close</a>
			</div>
			<div class="menuWhiteBG">
				<ul class="dropdown-menu-basic">
					<li id="clear">New Diagram</li>
					<li id="open">Open...</li>
					<li id="save">Save As...</li>
					<li id="edit_xml">Edit XML...</li>
					<li id="submit_bug">Report Issue</li>
					<li id="image">Publish</li>
				</ul>
			</div>
		</menu>
		
		<div id="zoomable">
			<div id="panzoomlayer"></div>
			<div id="holder"></div> 
		</div>
		
		<div id="loading">
			<div class="centered">
				<img src="images/loading-01.png" alt="Please Wait - Loading Kite9 Designer" />
			</div>
			<div class="centered2">
				<img src="images/ajax-loader-big.gif" alt="Spinner" />
			</div>
		</div>

		<!--  uncomment this for debug info -->
		<!-- div id="errors"></div>
		
		<div id="counts">
			c: <span id="main_control_count">0</span>
			p: <span id="palette_control_count">0</span>
			d: <span id="draglayer_count">0</span>
			m: <span id="move_count">0</span>
			p: <span id="path_count">0</span>
		</div -->
		
		
<div id="zoom_chooser_dialog" title="Something" class="dialog">
	<div id="zoom_chooser_paper"></div>
</div>
	
<div id="glyph-edit-dialog" title="Edit Part" class="dialog wide-dialog">
	<form>
		<input type="hidden" name="id" id="glyph-edit-id" class="text ui-widget-content ui-corner-all" />
		<div class="right-box">
			<label for="glyph-edit-sybmols">Symbols (click to edit)</label>
			<ol id="glyph-edit-symbols" class="symbols-list ui-widget-content ui-corner-all"></ol>
		</div>
		<div class="left-main">
			<label for="glyph-edit-label">Label</label>
			<textarea name="glyph-edit-label" id="glyph-edit-label" class="text ui-widget-content ui-corner-all" style="width: 95%; height: 20px; resize: vertical"></textarea>
			<label for="glyph-edit-stereotype">Type</label>
			<textarea name="glyph-edit-stereotype" id="glyph-edit-stereotype" class="text ui-widget-content ui-corner-all" style="width: 95%; height: 20px; resize: vertical"></textarea>
		</div>
		<ol id="glyph-edit-contents" class="contents-list">
		</ol>
		<span id="toolbar-glyph" class="toolbar">
			<button id="text-line">Add Text Line</button>
			<button id="divider">Add Divider</button>
			<button id="delete-text-line">delete</button>
		</span>
	</form>
</div>

<div id="key-edit-dialog" title="Edit Key" class="dialog wide-dialog">
	<form>
		<input type="hidden" name="id" id="key-edit-id" class="text ui-widget-content ui-corner-all" />
		<label for="key-edit-bold">Key Title Text</label>
		<textarea name="bold-key-text" id="key-edit-bold" class="text ui-widget-content ui-corner-all" style="width: 100%; height: 50px; resize: vertical"></textarea>
		<label for="key-edit-normal">Normal Text</label>
		<textarea name="normal-key-text" id="key-edit-normal" class="text ui-widget-content ui-corner-all" style="width: 100%; height: 50px; resize: vertical"></textarea>
		<ol id="key-edit-contents" class="contents-list">
		</ol>
		<span id="toolbar-key" class="toolbar">
			<button id="key-text-line">Add Text Line</button>
			<button id="key-delete-text-line">delete</button>
		</span>
	</form>
</div>

<div id="diagram-name-dialog" title="Name Your Diagram" class="dialog">
	<p>Once named, your diagram will be auto-saved after every change.</p>
	<form>
		<label for="diagram-name">Diagram Name</label>
		<input type="text" name="name" id="diagram-name" class="text ui-widget-content ui-corner-all" />
	</form>
</div>

<div id="arrow-edit-dialog" title="Edit Link Body" class="dialog wide-dialog">
	<form>
		<input type="hidden" name="id" id="arrow-edit-id" class="text ui-widget-content ui-corner-all" />
		<label for="arrow-edit-label">Label</label>
		<textarea name="label" id="arrow-edit-label" class="text ui-widget-content ui-corner-all" style="width: 95%; height: 50px; resize: vertical"></textarea>
	</form>
</div>

<div id="text-line-edit-dialog" title="Edit Text Area" class="dialog">
	<form>
		<input type="hidden" name="id" id="text-line-edit-id" class="text ui-widget-content ui-corner-all" />
		<div class="right-box">
			<label for="text-line-edit-sybmols">Symbols (click to edit)</label>
			<ol id="text-line-edit-symbols" class="symbols-list ui-widget-content ui-corner-all"></ol>
		</div>
		<div class="left-main">
			<label for="text-line-edit-label">Label</label>
			<textarea name="text-line-edit-label" id="text-line-edit-label" class="text ui-widget-content ui-corner-all" style="width: 95%; height: 50px; resize: vertical"></textarea>
		</div>
	</form>

</div>

<div id="context-edit-dialog" title="Edit Context" class="dialog wide-dialog">
	<form>
		<input type="hidden" name="id" id="context-edit-id" class="text ui-widget-content ui-corner-all" />
		<input type="hidden" name="parent_id" id="context-edit-parent-id" class="text ui-widget-content ui-corner-all" />
		
		<label for="context-edit-contents">Context Contents</label>
		<ol id="context-edit-contents" class="contents-list">
		</ol>
		<span id="toolbar-ctx" class="toolbar">
			<button id="glyph-context">Add Part</button>
			<button id="arrow-context">Add Connection Body</button>
			<button id="context-context">Add Context</button>
			<button id="delete-context">delete</button>
		</span>
	</form>
</div>

<div id="diagram-edit-dialog" title="Edit Diagram Contents" class="dialog wide-dialog">
	<form>
		<input type="hidden" name="id" id="diagram-edit-id" class="text ui-widget-content ui-corner-all" />
		<label for="diagram-edit-contents">Diagram Contents</label>
		<ol id="diagram-edit-contents" class="contents-list">
		</ol>
		<span id="toolbar-diagram" class="toolbar">
			<button id="glyph-diagram">Add Part</button>
			<button id="arrow-diagram">Add Connection Body</button>
			<button id="context-diagram">Add Context</button>
			<button id="delete-diagram">delete</button>
		</span>
	</form>
</div>

<div id="edit-xml-dialog" title="XML Editor" class="dialog wide-dialog">
	<p class="validateTips">This is the XML your diagram is using as it's definition</p>
	<form id="edit-xml-form">
		 <textarea style="width : 100%;" rows="30" name="body" id="edit-xml"></textarea>
	</form>
</div>

<div id="edit-symbol-dialog" title="Key Symbol Item" class="dialog narrow-dialog">
	<p class="validateTips">Provide a unique letter / shape combination</p>
	<form>
		<input type="hidden" name="id" id="edit-symbol-target-id" class="text" />	
		<label for="edit-symbol-char">Symbol Letter</label>
		<input type="text" name="letter" id="edit-symbol-char" maxlength="1" class="text ui-widget-content ui-corner-all" />
		
		<label for="edit-symbol-shape">Symbol Shape</label>
		<span id="edit-symbol-shape" class="toolbar">
			<input type="radio" id="CIRCLE" name="radio" /><label for="CIRCLE">Circle</label>
			<input type="radio" id="HEXAGON" name="radio" checked="checked" /><label for="HEXAGON">Hexagon</label>
			<input type="radio" id="DIAMOND" name="radio" /><label for="DIAMOND">Diamond</label>
		</span>
	</form>
</div>

<div id="symbol-picker-dialog" title="Symbol Picker" class="dialog narrow-dialog">
	<p class="validateTips">Choose symbols for this item</p>
	<form>
		<input type="hidden" name="id" id="symbol-picker-target-id" class="text" />	
		<ol id="symbol-picker-list" class="contents-list">
		</ol>
		<span id="toolbar-symbol-picker" class="toolbar">
			<button id="symbol-add">new</button>
		</span>
	</form>
</div>

<div id="browser" title="Unsupported Browser" class="dialog info">
	<h2>Your browser is not supported</h2>
	<p>We recommend one of the following:</p>
	<ul>
		<li><a href="http://www.google.com/chrome"><strong>Chrome (v 13 tested)</strong></a> is recommended.  </li>
		<li><strong>Safari (5.1 tested) </strong></li>
		<li><strong>Firefox (6 tested)</strong></li>
		<li><strong>IE (9 tested).  </strong>Earlier versions are supported using <a href="http://www.google.com/chromeframe">Chrome Frame</a></li>
	</ul> 
</div>

<div id="login" title="Login Required" class="dialog info">
	<h2>Please log in and retry.</h2>
	<form name="loginform" id="loginform" action="TBC" method="post">
	    <p>
	            <label>User Name<br />
	            <input type="text" name="log" class="user_login input" value="" size="20" tabindex="10" /></label>
	    </p>
	    <p>
	            <label>Password<br />
	            <input type="password" name="pwd" class="user_pass input" value="" size="20" tabindex="20" /></label>
	    </p>
        <p class="forgetmenot">
        		<label><input name="rememberme" type="checkbox" id="rememberme" class="rememberme" value="forever" tabindex="90" /> Remember Me</label>
        </p>
        <p class="submit">
                <input type="submit" name="wp-submit" value="%s" tabindex="100" />
                <input type="button" class="simplemodal-close" value="TBC" tabindex="101" />
                <input type="hidden" name="testcookie" value="1" />
        </p>
    </form>
	<ul>
		<li><a href="/wp-login.php?action=register" title="register" target="_blank">Click here to register, free </a> (opens a new browser window)</li>
	</ul>
</div>

<div id="upgrade" title="Upgrade Required" class="dialog info">
	<h2>Kite9 Free Limit Reached</h2>
	<p>Your diagram exceeds the number of elements you can have in the demo version.</p>
	<p>Thanks for having a look.  Drop <a href="mailto:support@kite9.com">Kite9 a message</a> and let us know what you think</p>
	<ul>
		<li><a href="/user/login" title="log in" target="_blank">Click here to log in</a> (opens a new browser window)</li>
		<li><a href="/user/register" title="register" target="_blank">Click here to register, free </a> (opens a new browser window)</li>
	</ul>
</div>

<div id="error" title="Apologies" class="dialog info">
	<h2>Server Error</h2>
	<p>Something went wrong while processing your diagram on the server.  An email has been sent to support.</p>
	<p>Some things you could try:</p>
	<ul>
		<li>If you are editing the XML directly, make sure your XML is well-formed</li>
		<li>Press the 'Undo' button to return to the last good state of the diagram</li>
	</ul>
</div>

<div id="save_limit" title="Diagram Limit Reached" class="dialog info">
	<h2>Too Many Diagrams!</h2>
	<p>You cannot save the current diagram as you have exceeded the number of diagrams for your account.</p>
	<p>Time to upgrade?</p>
</div>

<div id="load" title="Choose Diagram To Open" class="dialog">
	<ol id="load_diagram_list" class="contents-list"></ol>
</div>

<div id="not-saved" title="Not Saved" class="dialog narrow-dialog">
	<p class="validateTips">Your current diagram is going to be lost - are you sure?</p>
</div>


<div id="link-info" title="About Connections" class="dialog info">
	<h2>About Connections</h2>
	<p>Kite9 Allows you to link elements of your diagram together with "Connections"</p>
	<p>To create a connection:</p>
	<ol>
		<li>Select multiple diagram elements</li>
		<li>Click "connect" to join them.</li>
	</ol>
	
	<h2>What Can You Connect?</h2>
	<ul>
		<li>Any two Parts (shaded boxes)</li>
		<li>Any two Contexts (containers)</li>
		<li>Any number of Parts or Contexts to a Connection Body (the black boxes)</li>	
		<li>Contexts can be connected elements not contained inside it</li>
	</ul>
</div>

<div id="contradiction" title="Contradiction" class="dialog info">
	<h2>Your dialog contains contradictions</h2>
	<p>These are connections in the diagram where the direction of the connection contradicts 
	  the direction of another connection or layout in the diagram.</p>
	  
	<p><b style="color: red">Contradictions are highlighted in red</b></p>
	
	<h2>How to Fix Them</h2>
	<ul>
	<li>Find the connection with the contradiction and remove it's direction</li>
	<li><strong>Undo</strong> the diagram to get back to a previous good state</li>
	<li>Remove the container layout ordering on some containers.</li>
	</ul>
</div>

<div id="sc" title="Style Settings" class="dialog info">
	<p class="validateTips">Override the default settings of the selected elements</p>
	<form>
		<div id="sc-tabs">
		  <ul>
		    <li><a href="#sc-stroke">Stroke</a></li>
		    <li><a href="#sc-fill">Fill</a></li>
		    <li><a href="#sc-label">Label Text</a></li>
		    <li><a href="#sc-type">Type Text</a></li>
		    <li><a href="#sc-shape">Shape</a></li>
		  </ul>
			<div id="sc-stroke">
				<div class="sc-divider">
					<label for="sc_stroke-width">Line Width</label>
					<button id="sc_stroke-width-cancel" class="sc-cancel sc-cancel-input">click to unset</button>		
					<input type="text" name="stroke-width" id="sc_stroke-width" maxlength="2" class="text ui-widget-content ui-corner-all" style="width: 60px"/> pixels
				</div>
				<div class="sc-divider">			
					<label for="sc_stroke">Colour</label>
					<button id="sc_stroke-cancel" class="sc-cancel sc-cancel-spectrum">click to unset</button>		
					<input type="text" name="stroke" id="sc_stroke" maxlength="6" class="text ui-widget-content ui-corner-all spectrum" style="width: 60px"/>
				</div>				
				<div class="sc-divider-bottom">			
					<label for="sc_stroke-dasharray">Stroke Pattern</label>
					<button id="sc_stroke-dasharray-cancel" class="sc-cancel">click to unset</button>		
					<span id="sc_stroke-dasharray" class="toolbar" style="font-size: 75%">
				    	<input type="radio" id="sc_stroke-dasharray-1" name="sc_stroke-dasharray" value=""/><label for="sc_stroke-dasharray-1">Solid</label>
				    	<input type="radio" id="sc_stroke-dasharray-2" name="sc_stroke-dasharray" value="-"/><label for="sc_stroke-dasharray-2">- </label>
				    	<input type="radio" id="sc_stroke-dasharray-3" name="sc_stroke-dasharray" value="."/><label for="sc_stroke-dasharray-3">.</label>
				    	<input type="radio" id="sc_stroke-dasharray-4" name="sc_stroke-dasharray" value="-.."/><label for="sc_stroke-dasharray-4">-..</label>
				    	<input type="radio" id="sc_stroke-dasharray-5" name="sc_stroke-dasharray" value=". "/><label for="sc_stroke-dasharray-5">. </label>
				    	<input type="radio" id="sc_stroke-dasharray-6" name="sc_stroke-dasharray" value="- "/><label for="sc_stroke-dasharray-6">- </label>
				    	<input type="radio" id="sc_stroke-dasharray-7" name="sc_stroke-dasharray" value="--"/><label for="sc_stroke-dasharray-7">--</label>
				    	<input type="radio" id="sc_stroke-dasharray-8" name="sc_stroke-dasharray" value="- ."/><label for="sc_stroke-dasharray-8">- .</label>
				    	<input type="radio" id="sc_stroke-dasharray-9" name="sc_stroke-dasharray" value="--."/><label for="sc_stroke-dasharray-9">--.</label>
				    	<input type="radio" id="sc_stroke-dasharray-10" name="sc_stroke-dasharray" value="--.."/><label for="sc_stroke-dasharray-10">--..</label>
					</span>
			    </div>
			</div>
			<div id="sc-fill">
				<div class="sc-divider-bottom">
					<p class="validateTips">Gradient fills are not visible in Firefox</p>			
					<label for="sc_fill">Gradient Fill</label>
					<button id="sc_fill-cancel" class="sc-cancel sc-cancel-select">click to unset</button>		
					<select name="sc_fill" id="sc_fill">
						<option name="default" value="">Default</option>
						<option name="solid" value="solid">Solid Colour (select below)</option>
					</select>
					<input type="text" name="sc_fill" id="sc_fill-2" maxlength="6" class="text ui-widget-content ui-corner-all spectrum" style="width: 60px"/> pixels
				</div>
			</div>
			<div id="sc-label">
				<div class="sc-divider">
					<label for="sc_label_sample">Sample: </label>
					<div id="sc_label_sample" class="sc-text-sample">
					</div>
				</div>
				<div class="sc-divider">			
					<label for="sc_label_font-family">Font</label>
					<button id="sc_label_font-family-cancel" class="sc-cancel sc-cancel-font">click to unset</button>		
					<div id="sc_label_font-family" class="fontSelect">
						<div class="arrow-down"></div>
					</div>
				</div>
				<div class="sc-divider">			
					<label for="sc_label_fill">Colour</label>
					<button id="sc_label_fill-cancel" class="sc-cancel sc-cancel-spectrum">click to unset</button>		
					<input type="text" name="sc_label_fill" id="sc_label_fill" maxlength="6" class="text ui-widget-content ui-corner-all spectrum" style="width: 60px"/>
				</div>		
				<div class="sc-divider-bottom">			
					<label for="sc_label_font-size">Size</label>
					<button id="sc_label_font-size-cancel" class="sc-cancel sc-cancel-input">click to unset</button>		
					<input type="text" name="sc_label_font-size" id="sc_label_font-size" maxlength="2" class="text ui-widget-content ui-corner-all" style="width: 60px" value="12" /> pixels
				</div>
			</div>
			<div id="sc-type">
				<div class="sc-divider">
					<label for="sc_type_sample">Sample: </label>
					<div id="sc_type_sample" class="sc-text-sample">
					</div>
				</div>
				<div class="sc-divider">			
					<label for="sc_type_font-family">Font</label>
					<button id="sc_type_font-family-cancel" class="sc-cancel sc-cancel-font">click to unset</button>		
					<div id="sc_type_font-family" class="fontSelect">
						<div class="arrow-down"></div>
					</div>
				</div>
				<div class="sc-divider">			
					<label for="sc_type_fill">Colour</label>
					<button id="sc_type_fill-cancel" class="sc-cancel sc-cancel-spectrum">click to unset</button>		
					<input type="text" name="sc_type_fill" id="sc_type_fill" maxlength="6" class="text ui-widget-content ui-corner-all spectrum" style="width: 60px"/>
				</div>		
				<div class="sc-divider-bottom">			
					<label for="sc_type_font-size">Size</label>
					<button id="sc_type_font-size-cancel" class="sc-cancel sc-cancel-input">click to unset</button>		
					<input type="text" name="sc_type_font-size" id="sc_type_font-size" maxlength="2" class="text ui-widget-content ui-corner-all" style="width: 60px" value="12" /> pixels
				</div>				
			</div>
			<div id="sc-shape">
				<div class="sc-divider-bottom">			
					<label for="sc_shape">Shape Outline</label>
					<button id="sc_shape-cancel" class="sc-cancel sc-cancel-select">click to unset</button>		
					<select name="sc_shape" id="sc_shape">
					</select>
				</div>	
			</div>
			
		</div>

	</form>
</div>

<div id="tool-tip"></div>

<script type="text/javascript">
		try{
			if (${track}) {
				var pageTracker = _gat._getTracker("UA-11589584-2");
				pageTracker._trackPageview();
			}
		} catch(err) {}
</script>


</body>


</html>