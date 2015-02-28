function setup_controls_link(kite9) {
	
	$.fn.flash = function(times, duration, callback) { 
		var T = this; times = times || 3; duration = duration || 200; 
		for ( var i=0; i < times; i++ ) { 
			(function() { setTimeout(function() { 
				T.animate({'background-color' : '#AAAAFF'}, duration / 2, 'swing', function() { 
					T.animate({'background-color' : '#FFFFFF'}, duration / 2, 'swing', callback); }); 
				}, i*duration*2+50); 
			})(i); 
		} 
	};
	
	function show_link_menu() {
		kite9.hide_menus('#link-frame');
		$('#link-frame').css({"visibility": "visible", "z-index" : 50, top: "45px"}).animate({"opacity" : 1}, 150);
	}
	
	function is_link_menu_visible() {
		var depth = $('#link-frame').css("visibility");
		return (depth != 'hidden');
	}
	
	function is_link_enabled() {
		return $("#link").is(":checked");
	}
	
	kite9.is_selecting2 = kite9.is_selecting;
	
	kite9.is_selecting = function() {
		return !is_link_enabled() && kite9.is_selecting2();
	}
		
	$("#link").button({
		text : true,
		icons : {
			primary : "ui-icon-arrowthick-1-e"
		}
	}).click(function () {
		// turn off multi mode, if set
		$("#multi").removeAttr('checked');
		$('#multi').button( "refresh" );
		kite9.setMoveMode(false);
		kite9.unselect_all();
		
		if (is_link_enabled()) {
			$("body").css("cursor", "crosshair");
		} else {
			$("body").css("cursor", "");
		}
		
		return true;
	});
	
	$("label[for='link']").attr("title", "Draw links between elements");
	
	$("#link_menu").button({
		text : false,
		icons : {
			primary : "ui-icon-triangle-1-s",
		}
	}).click(function() {
		if (!is_link_menu_visible()) {
			show_link_menu();
		} else {
			kite9.hide_menus();
		}
	});
	
	$('#link-frame').css("left", ($("#link_menu").position().left-14)+"px");
	
	
	var menu_item_width = $('#link_style_auto_connect_new').width();
	
	
	// set up connection palette
	var link_style = undefined;
	
	function set_link_style() {
		$('#link_style_current').html('<div class="overlay">Currently Drawing:</div>'+image_for_style(link_style))
			.flash(1, 300, function () {
				kite9.hide_menus();
			});
	}
	
	function image_for_style(v) {
		return '<img src="gui-link.png?fromTerminator='+v.fromTerminator+
			'&toTerminator='+v.toTerminator+
			'&linkStyle='+v.linkStyle+
	        '&linkShape='+v.linkShape+
	        '&width='+menu_item_width+'"'+
	        'style="vertical-align: middle"/>';
	}
	$.each(kite9.get_stylesheet().connectionTemplates[0], function(k, v) {
		if (link_style == undefined) {
			link_style = v;
		}
		
		$('#link_style_auto_connect_off').after('<li id="template-'+k+
				'" title="'+v.description+'" >'+image_for_style(v)+'</li>');
		
		$('#template-'+k).mousedown(function() {
			link_style = v;
			set_link_style();
		});
	});
	
	set_link_style();

	$('#link-menu-close').click(function() {
		kite9.hide_menus();
	});
		
	var link_detail = {
		drawing: false,
		sx: 0, 
		sy: 0, 
		ex: 0, 
		ey: 0, 
		shape: undefined,
		fromShape: undefined,
		toShape: undefined,
		from: undefined,
		to: undefined,
	}
	
	function allowLinkStyleGrab() {
		return kite9.lastSelectedId && kite9.main_control.objectMap[kite9.lastSelectedId].type=='link'; 
	}

	$('#link_style_copy_selected').click(function() {
		if (allowLinkStyleGrab()) {
			var xml = kite9.main_control.objectMap[kite9.lastSelectedId].definition;
			link_style.linkStyle = $(xml).attr("style");
			link_style.linkShape = $(xml).attr("shape");
			link_style.fromTerminator = $(xml).children("fromDecoration").text();
			link_style.toTerminator = $(xml).children("toDecoration").text();
			kite9.hide_menus();
			
			set_link_style();
		}
	});
	
	
	kite9.selectCallbacks.push(function(s) {
		if (allowLinkStyleGrab()) {
			$('#link_style_copy_selected').removeClass("disabled");
		} else {
			$('#link_style_copy_selected').addClass("disabled");
		}
	});
	
	
	kite9.main_control.flannel.push(function(memento) {
		var shape = memento.flannel;
		if (can_link_from(memento)) {
			shape.drag(
				function(dx,dy, x, y,e) {
					if (link_detail.drawing) {
						update_link(memento, dx, dy, x, y);
					}
				},
				function (x, y, e) {
					if (is_link_enabled()) {
						// begin drawing something
						begin_link(memento, x, y);
						link_detail.from = memento;
					}
				},
				function(e) {
					if (link_detail.drawing) {
						end_link();
					}
				}
			);
		}
	});
	
	function begin_link(memento, x, y) {
		if (can_link_from(memento)) {
			link_detail.drawing = true;
			link_detail.sx = (x - kite9.main_control.css_offsetx) / kite9.main_control.css_scale;
			link_detail.sy = (y - kite9.main_control.css_offsety) / kite9.main_control.css_scale; 
			link_detail.ex = link_detail.sx;
			link_detail.ey = link_detail.sy;
			kite9.update_temp_link(link_style);
		}
	}
	
	function make_path(link_detail, xo, yo) {
		return "M"+(link_detail.sx+xo)+" "+(link_detail.sy+yo)+"L"+(link_detail.ex+xo)+" "+(link_detail.ey+yo);
	}
	
	function update_link(memento, dx, dy, x, y) {
		link_detail.ex = (x  - kite9.main_control.css_offsetx)  / kite9.main_control.css_scale;
		link_detail.ey = (y - kite9.main_control.css_offsety) / kite9.main_control.css_scale;
		
		kite9.update_temp_link(link_style);
	}
	
	/**
	 * Provides a function for you to draw/update the temporary link on the page.
	 */
	kite9.update_temp_link = function(ls, x1, y1, x2, y2) {
		if (ls == undefined) {
			ls = link_style;
		}
		
		if (x1!=undefined) {
			link_detail.sx = x1;
			link_detail.sy = y1;
			link_detail.ex = x2;
			link_detail.ey = y2;
		}
		
		var ang1 = Math.atan2(link_detail.ey-link_detail.sy, link_detail.ex-link_detail.sx) * (180 / Math.PI)+270 ;
		
		
		if (link_detail.shape) {
			// in this case we just need to move the terminators and the link
			link_detail.shape.attr("path", make_path(link_detail, 0, 0));

			// update terminator position
			var fromPath = kite9.getOrientedTerminator(ang1, kite9.main_control, link_detail.fromDef, link_detail.sx, link_detail.sy);
			var toPath = kite9.getOrientedTerminator(ang1+180, kite9.main_control, link_detail.toDef, link_detail.ex, link_detail.ey);
			link_detail.fromShape.attr("path", fromPath);
			link_detail.toShape.attr("path", toPath);
			
		} else {
			// these are set up permanently for this link
			// set up permanent details of the link
			link_detail.fromDef = kite9.override_style(kite9.get_stylesheet().linkTerminatorStyles[0][ls.fromTerminator]);
			link_detail.toDef = kite9.override_style(kite9.get_stylesheet().linkTerminatorStyles[0][ls.toTerminator]);
			link_detail.style = kite9.override_style(kite9.get_stylesheet().linkStyles[0][ls.linkShape], ls.linkStyle);
			kite9.checkTerminatorFill(link_detail.fromDef, link_detail.style.attr['stroke']);
			kite9.checkTerminatorFill(link_detail.toDef, link_detail.style.attr['stroke'])

			// create the body
			link_detail.shape = kite9.main_control.paper.path(make_path(link_detail, 0, 0));
			link_detail.shape.attr(link_detail.style.attr);
			
			// create the fromTerminator
			var fromPath = kite9.getOrientedTerminator(ang1, kite9.main_control, link_detail.fromDef, link_detail.sx, link_detail.sy);
			link_detail.fromShape = kite9.main_control.paper.path(fromPath);
			link_detail.fromShape.attr(link_detail.fromDef.attr);
			link_detail.fromShape.attr({"stroke-width" : link_detail.style.attr['stroke-width']});
			
			// create the toTerminator
			var toPath = kite9.getOrientedTerminator(ang1+180, kite9.main_control, link_detail.toDef, link_detail.ex, link_detail.ey);
			link_detail.toShape = kite9.main_control.paper.path(toPath);
			link_detail.toShape.attr(link_detail.toDef.attr);
			link_detail.toShape.attr({"stroke-width" : link_detail.style.attr['stroke-width']});
		}
	}
	
	/**
	 * Removes the temporary link
	 */
	kite9.remove_temp_link = function() {
		if (link_detail.shape) {
			link_detail.shape.remove();
			link_detail.shape = undefined;
		}
		
		if (link_detail.fromShape) {
			link_detail.fromShape.remove();
			link_detail.fromShape = undefined;
		}
		
		if (link_detail.toShape) {
			link_detail.toShape.remove();
			link_detail.toShape = undefined;
		}
	}
	
	function connect_to(x, y) {
		return kite9.get_smallest_element_by_point(x, y, can_link_from, kite9.main_control);
	}
	
	function end_link() {
		if ((kite9.focus !== null) && (kite9.focus._id)) {
			var id = kite9.focus._id;
			link_detail.to = kite9.main_control.objectMap[id];
		} else {
			link_detail.to = connect_to(link_detail.ex, link_detail.ey);
		}
		
		link_detail.drawing = false;

		if ((link_detail.to !== undefined) && (linkOk(link_detail.from, link_detail.to))) {
			// create the link xml	
			var xml = kite9.get_connection_between(link_detail.from.id, link_detail.to.id);
			var invisible = kite9.is_link_invisible(xml);
			var reverse = false;
			
			if ((xml==undefined) || (!invisible)) {
				var id = kite9.new_id();
				xml = create_content_xml(id, 'link', null, kite9.main_control.get_links(), link_detail.from.id, link_detail.to.id);
				var link = kite9.create(id, xml, 'link', kite9.main_control);
			} else {
				var id = $(xml).attr("id");
				var link = kite9.main_control.objectMap[id];
				reverse = $(xml).children("from").attr("reference") != link_detail.from.id;	
			}
				
			kite9.apply_link_style(xml, reverse, link_style);
			kite9.remove_temp_link();
			
			if (!link.location) {
				var location = $(link.definition).addXMLTag("renderingInformation");
				var xo = kite9.main_control.leftOffset;
				var yo = kite9.main_control.topOffset;
				
				// create a temporary location for rendering with now
				$(location).detach();
				var fd = $(location).addXMLTag("fromDecoration");
				var ang1 = Math.atan2(link_detail.ey-link_detail.sy, link_detail.ex-link_detail.sx) * (180 / Math.PI)+270 ;
				fd.addXMLTag("name").text(link_style.fromTerminator);
				fd.addXMLTag("position").attr("x", link_detail.sx-xo).attr("y", link_detail.sy-yo);
				fd.addXMLTag("d").text(ang1);
				
				var td= $(location).addXMLTag("toDecoration");
				var ang2 = ang1-180;
				td.addXMLTag("name").text(link_style.toTerminator);
				td.addXMLTag("position").attr("x", link_detail.ex - xo).attr("y", link_detail.ey - yo);
				td.addXMLTag("d").text(ang2);	
				$(location).addXMLTag("path").text(make_path(link_detail, -xo, -yo));
				link.location = location;
				kite9.draw_link(link, link.location, kite9.main_control, true, true, xo, yo);
			}
			
			
			// draw it all properly
			kite9.load(kite9.main_control, POST_URL);	
		} else {
			kite9.remove_temp_link();
		}
 	}
	
	/**
	 * Adds the link_style style to the link xml passed in.
	 */
	kite9.apply_link_style = function(xml, reverse, ls) {
		if (ls == undefined) {
			ls = link_style;
		}
		
		xml=$(xml);
		
		xml.children("fromDecoration").remove();
		xml.children("toDecoration").remove();
		xml.addXMLTag("fromDecoration").text(reverse ? ls.toTerminator : ls.fromTerminator);
		xml.addXMLTag("toDecoration").text(reverse ? ls.fromTerminator : ls.toTerminator);
		xml.attr("shape", ls.linkShape);
		xml.attr("style", ls.linkStyle);
	}
	
	old_cfocl = kite9.can_focus_over;
	
	kite9.can_focus_over = function(memento) {
		if (is_link_enabled()) {
			if (!can_link_from(memento)) {
				return false;
			}
		}
		return old_cfocl(memento);
	}
	
	function jq(myid) { 
		   return '#' + myid.replace(/(:|\.)/g,'\\$1');
	}

	function can_link_from(v) {
		switch (v.type) {
		case 'label':
		case 'fromLabel':
		case 'toLabel':
		case 'text-line':
		case 'link':
		case 'diagram':
		case 'comp-shape':
			return false;
		}
		
		return true
	}
	
	function linkOk(fromDef, toDef) {
		var ok = true;
		
		if (fromDef == toDef) {
			return false;
		}
		
		if ((!can_link_from(fromDef)) || (!can_link_from(toDef))) {
			return false;
		}
				
		if (ok) {
			var toIdSel = jq(toDef.id);
			var fromIdSel = jq(fromDef.id);
				
			var found = $(fromDef.definition).find(toIdSel);
		
			if (found.size() === 0) {
				found = $(toDef.definition).find(fromIdSel);
			}	
			
			if (found.size() > 0 ) {
				ok = false;
			}
		}
			
		return ok;
	}
	
	
	
	
}