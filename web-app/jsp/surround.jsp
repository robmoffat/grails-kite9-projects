<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<!--link type="text/css" href="gui/css/ui-lightness/jquery-ui-1.8.13.custom.css" rel="stylesheet" /-->	
		<link type="text/css" href="../../gui/css/red-theme/jquery-ui-1.10.3.custom.css" rel="stylesheet" />	
		<link type="text/css" href="../../gui/css/main-red.css" rel="stylesheet" />
		<link rel="shortcut icon" href="/wp-content/uploads/2014/06/alagna_favicon.ico" type="image/x-icon" />
		<meta http-equiv="X-UA-Compatible" content="chrome=IE8">

		<title>Diagram</title>

		<script src="../../gui/js/jquery-1.6.1.min.js"></script>
		<script src="../../gui/js/jquery-ui-1.10.3.custom.min.js"></script>
		<script src="../../gui/js/k9/kite9_publish.js"></script>
		<script src="../../gui/js/jquery.selectbox.js"></script>
		<script src='http://www.google-analytics.com/ga.js' type='text/javascript'></script>
	</head>
	<body>
		<span id="toolbar" class="ui-widget-header ui-corner-all toolbar header-bar">
			<span id="logo">
				<a href="/" target="_blank"><img src="../../gui/images/kite9-logo-small-01.png" alt="Kite9 Logo" class="logo" /></a>
			</span>
					
			<button id="edit">edit</button>
			<button id="share">share</button>
			<select id="stylesheet">
					<option selected="selected" value="">Choose New Style</option>
					<option value="designer">Kite9 Designer Style</option>
					<option value="designer2012">Kite9 Designer Style 2012</option>
					<option value="outline">Outline Style</option>
					<option value="cg_white">Century Gothic White</option>
					<option value="blue">Basic Blue</option>
					<option value="basic">basic</option>
			</select>
			<button id="download-png">PNG</button>
			<button id="download-pdf">PDF</button>
			<button id="size">Size</button>
			
		</span>
		
		<script>
			$().ready(function () {
				$('#edit').button({

				}).click(function () {
					window.location = "../../gui.html?hash=${hash}&style=${style}";
				});
			});
			
			$(window).load(function () {
				setup_controls('${image_url}', '${page_url}', '${pdf_url}');
			});
		</script>
	
		<div id="img-holder">
			<img id="img" src="${image_url}" usemap="#map"/>
		</div>
		
		<map id="map">
			${map}
		</map>
		
		<div id="size-dialog" title="Set Size of Image" class="dialog narrow-dialog">
			<form>
				<input type="hidden" name="aspect" id="aspect" class="text ui-widget-content ui-corner-all" />
				<label for="width">Width</label> 
				<input id="width" type="text" maxlength=4 class="text ui-widget-content ui-corner-all" value="" style="width: 50px" /> pixels
				 
				<label for="height">Height</label> 
				<input id="height" type="text" maxlength=4 class="text ui-widget-content ui-corner-all" value="" style="width: 50px" /> pixels
			</form>
		</div>
		
		

		<div id="share-dialog" title="Share & Publish Options" class="dialog info">
			<p class="validateTips">Cut &amp; Paste the links below into your web page</p>
			<form>
				<fieldset>
					<legend>Links</legend>
					<p> 
						<label for="share_link_dropdown">Share link to this page</label> 
						<input id="share_link_dropdown" type="text" class="text ui-widget-content ui-corner-all" value="${page_url}" /> 
					</p> 

					<p> 
						<label for="share_embedded_dropdown">Embed this page on your page (with menu)</label> 
						<input id="share_embedded_dropdown" type="text" class="text ui-widget-content ui-corner-all" value='' /> 
					</p> 

					<p> 
						<label for="share_image_dropdown">Embed image on your page (without menu)</label> 
						<input id="share_image_dropdown" type="text" class="text ui-widget-content ui-corner-all" value='' /> 
					</p> 
					
					<p> 
						<label for="share_url_dropdown">Link to your image</label> 
						<input id="share_url_dropdown" type="text" class="text ui-widget-content ui-corner-all" value='' /> 
					</p> 
					
				</fieldset>
				
				<fieldset>
					<legend>Social Media</legend>
						<ul id="share-social"> 
							<li class="social twitter"><a href="http://twitter.com/home?status=You should check this out! - ${page_url} " title="Click to send this page to Twitter!" target="_blank">Share on Twitter</a></li> 
							<li class="social facebook"><a href="javascript:var%20d=document,f='http://www.facebook.com/share',l=d.location,e=encodeURIComponent,p='.php?src=bm&amp;v=4&amp;i=1244125276&amp;u='+e(l.href)+'&amp;t='+e(d.title);1;try%7Bif%20(!/%5E(.*%5C.)?facebook%5C.%5B%5E.%5D*$/.test(l.host))throw(0);share_internal_bookmarklet(p)%7Dcatch(z)%20%7Ba=function()%20%7Bif%20(!window.open(f+'r'+p,'sharer','toolbar=0,status=0,resizable=1,width=626,height=436'))l.href=f+p%7D;if%20(/Firefox/.test(navigator.userAgent))setTimeout(a,0);else%7Ba()%7D%7Dvoid(0)" title="Post to Facebook">Post to Facebook</a></li> 
						</ul> 
				</fieldset>
			</form>
		</div>
		<script type="text/javascript">
			try{
			var pageTracker = _gat._getTracker("UA-11589584-2");
			pageTracker._trackPageview();
			} catch(err) {}
		</script>
	</body>
</html>