/**
 * This file adds _s_caling, window _r_esize and _p_alette functionality to Kite9.
 */
function setup_srp(kite9) {
	
	PALETTES  = {
		"ADL Symbols" : "palette_adl.sxml",
		"Flowchart Symbols (1)"  : "palette_flowchart1.sxml",
		"Flowchart Symbols (2)"  : "palette_flowchart2.sxml",
		"UML Symbols (1)" : "palette_uml1.sxml",
		"UML Symbols (2)" : "palette_uml2.sxml",
	};
	
	PALETTE_ON = true;
	HIDE_MOVE = true;

	
	kite9.margin = 60;
	
	kite9.palette_max_width = 280;
	kite9.palette_max_height = 300;
	
	kite9.set_palette_size = function(control) {
		var m_width = control.diagramx; //Math.max(control.diagramx, kite9.palette_max_width);
		var m_height = control.diagramy;
		var m_scale = 1;
		control.paper.setSize(m_width, m_height);
		control.maxx = control.diagramx;
		control.maxy = control.diagramy;
		control.element.css("width", m_width);
		control.element.css("height", m_height);
		
		var m_scale = kite9.palette_max_width / m_width;
		control.element.css("transform", "scale("+m_scale+")");
		control.css_scale = m_scale;
	}
		
	kite9.main_control.set_size = function(maxx, maxy) {
		kite9.main_control.diagramx = maxx;
		kite9.main_control.diagramy = maxy;
		kite9.set_holder_size(kite9.main_control, maxx, maxy);
	}

	var pzl = $('#panzoomlayer');
	var zoomable = $('#zoomable');

	
	kite9.set_holder_size = function(control, diagramx, diagramy) {
		var swidth = ((diagramx === undefined) || (isNaN(diagramx))) ? 0: diagramx + (kite9.margin *2);
		var sheight = ((diagramy === undefined) || (isNaN(diagramy))) ? 0 : diagramy + (kite9.margin *2);

		if ((sheight < 150)) {
			// empty diagram
			sheight = 650;
			swidth = 650;
		}
		
		if ((swidth !== control.maxx) || (sheight !== control.maxy)) {
			control.paper.canvas.setAttribute("viewBox", "0 0 "+swidth+" "+sheight);
			control.paper.setSize(swidth, sheight);
			
			if (control.background) {
				control.background.attr({width: swidth, height: sheight});
			}
			
			control.maxx = swidth;
			control.maxy = sheight;
			control.leftOffset = kite9.margin;
			control.topOffset = kite9.margin;
	
			$(control.element).css("width", swidth);
			$(control.element).css("height", sheight);
			
			$(pzl).css("width", swidth);
			$(pzl).css("height", sheight);
			
			$(zoomable).css("width", swidth);
			$(zoomable).css("height", sheight);
		}

		if ((control==kite9.main_control) && (control.keep_scale == undefined)){
			control.keep_scale = true;
			var w_width = $(window).width();
			var w_height = $(window).height();
			
			var max_v_scale = w_height / sheight;
			var max_h_scale = w_width / swidth;
			var max_scale = Math.min(max_v_scale, max_h_scale);
			// stop things getting too big
			var max_scale = Math.min(max_scale, 4);
			// or too small
			var max_scale = Math.max(max_scale, 1);
			kite9.main_control.css_scale = max_scale;
			$("#zoomable").css("transform", "scale("+kite9.main_control.css_scale+")");
		}
	}
	
	kite9.resize = function() {
		if (kite9.animationMaster === null) {
			if ((kite9.main_control) && (kite9.main_control.diagramx)) {	
				kite9.set_holder_size(kite9.main_control, kite9.main_control.diagramx, kite9.main_control.diagramy);
			}
		}
	}
	
	var accordioned = false;
    
	function show_palette() {
		if (!accordioned) {
			$('#palette-accordion').accordion();
			accordioned = true;
		} 
		kite9.hide_menus('#palette-frame');
		$('#palette-frame').css({"visibility": "visible", "z-index": 50, "top": "45px"}).animate({"opacity" : 1}, 150);
	}
	
	function is_palette_visible() {
		var depth = $('#palette-frame').css("visibility");
		return (depth != 'hidden');
	}
	
	function escape_id( myid ) {
	    return "#" + myid.replace( /(:|\.|\[|\])/g, "\\$1" );
	}
	
	function isMoveMode() {
		return $("#move").is(":checked");
	}
	
	/**
	 * Toggles the panzoomlayer being on or off
	 */
	kite9.setMoveMode = function(active) {
		if (active) {
			$("body").css("cursor", "all-scroll");
			$('#panzoomlayer').css("display", "block");
		} else {
			$("body").css("cursor", "");
			$('#move').removeAttr('checked');
			$('#move').button( "refresh" );
			$('#panzoomlayer').css("display", "none");	
		}
	}
	
	
	
	if (!kite9.isTouch) {
		$('#zoom').buttonset();	
		
		$('#zoom-in').button({
			text: false,
			icons : {
				primary : "ui-icon-zoomin"
			},
		}).click(function () {
			kite9.main_control.css_scale = kite9.main_control.css_scale * 1.25;
			kite9.resize();
			var scale = "scale("+kite9.main_control.css_scale+")";
			$('#zoomable').css({"transform": scale });
		});
		
		$('#zoom-out').button({
			text: false,
			icons : {
				primary : "ui-icon-zoomout"
			},
		}).click(function () {
			kite9.main_control.css_scale = kite9.main_control.css_scale / 1.25;
			kite9.resize();
			var scale = "scale("+kite9.main_control.css_scale+")";
			$('#zoomable').css({"transform": scale });
		});
		
		if (HIDE_MOVE) {
			// control for panzoomlayer
			$('#move').remove();
			$('#lmove').remove();
			$('#panzoomlayer').remove();
		}
	} 

	if (kite9.isTouch) {
		$('#zoom').remove();	
		
		// stops ability to move background of screen
		$(document).bind('touchmove', function(e) { e.preventDefault(); });
	}
	
	if (kite9.isTouch || (!HIDE_MOVE)) {
		// zoom - not used on the ipad, use gestures instead and the move button
		$("#move").button({
			text : true,
			icons : {
				primary : "ui-icon-arrow-4"
			}
		}).click(function () {
			if (!isMoveMode()) {
				kite9.setMoveMode(false);
			} else {
				kite9.setMoveMode(true);
				
				// turn off link mode, if set
				$("#link").removeAttr('checked');
				$('#link').button( "refresh" );
				
				// turn off multi mode, if set
				$('#multi').removeAttr('checked');
				$('#multi').button( "refresh" );
			}
			
			return true;
		});
		
		// allow panzoom to move
		var hammertime = Hammer(document.getElementById('panzoomlayer'), {
	        transform_always_block: true,
	        drag_block_horizontal: true,
	        drag_block_vertical: true,
	        drag_min_distance: 0
	    });
		
		var rect = document.getElementById('zoomable');
    	var newScale = 1;
    	var posX = 0, posY = 0;
		
	    hammertime.on('touch drag transform release', function(ev) {
	    	var origScale = kite9.main_control.css_scale;
	    	var restX = kite9.main_control.css_offsetx;
	    	var restY = kite9.main_control.css_offsety;
	        switch(ev.type) {
	            case 'drag':
	                posX = ev.gesture.deltaX;
	                posY = ev.gesture.deltaY;
	                break;

	            case 'transform':
	                newScale = ev.gesture.scale;
	                break;
	            case 'release':
	            	restX = restX + posX;
	            	restY = restY + posY;
	            	origScale = origScale * newScale;
	            	kite9.main_control.css_offsetx = restX;
	            	kite9.main_control.css_offsety = restY;
	    	        kite9.main_control.css_scale = origScale;
	            	posX = 0;
	            	posY = 0;
	            	newScale = 1;
	            	break;
	        }

	        // transform!
	        var transform ="scale("+(origScale * newScale)+") ";

	        rect.style.left=(posX+restX)+"px";
	        rect.style.top=(posY+restY)+"px";
	        rect.style.transform = transform;
	        rect.style.oTransform = transform;
	        rect.style.msTransform = transform;
	        rect.style.mozTransform = transform;
	        rect.style.webkitTransform = transform;
	    }); 
	}
		
	$('#add').button({
		text: true, 
		icons : {
			primary : "ui-icon-plusthick"
		}
	}).click(function () {
		if (is_palette_visible()) {
			kite9.hide_menus();
		} else {
			show_palette();
		}
	});	
	
	$('#palette-close').click(function() {
		kite9.hide_menus();
	});
	
	
	
	var palette_id = 0;
	
	if (PALETTE_ON) {
		// create the palettes
		$.each(PALETTES, function(label, file) {
			$('#palette-accordion').append("<h3>"+label+"</h3>");
			var palette_div_id = 'palette'+palette_id;
			$('#palette-accordion').append('<div id="'+palette_div_id+'c" class="palette_container"><div id="'+palette_div_id+'" class="palette-svg" /></div>');
			
			var palette_control = kite9.new_control(Raphael(palette_div_id,1, 1), $('#'+palette_div_id));
			
			palette_id ++;
			
			palette_control.flannel.push(function(memento) {
				var shape = memento.flannel;
				var id = memento.id;
				var changes = memento.flannel;
				var type = memento.type;
				
				kite9.animate_select_setup(changes, type==='link');
			
				if (id.indexOf("palette:") == 0) {
					shape.mouseover(function (event) {
						if ((kite9.focus !== null) && (kite9.focus._id === id)) {
							// do nothing, just selecting something within the current shape
						} else {
							if (!kite9.is_selected(id)) {
								if (type !== 'diagram') {
									kite9.animate_select(changes, type === 'link' ? kite9.HOVER_LINK_ATTR : kite9.HOVER_BOX_ATTR);
								}
							}
							if (kite9.focus !== null) {
								kite9.animate_select(kite9.focus, null);
							}
							kite9.focus = changes;
							kite9.focus._id = id;
						}
					});
					
			
					shape.mouseout(function (event) {
						if ((kite9.focus !== null) && (kite9.focus._id === id)) {
							if (!kite9.is_selected(id)) {
								kite9.animate_select(kite9.focus, null);
							}
							kite9.focus = null;
						}
					});
				}
			});
			
			
			palette_control.set_size = function(maxx, maxy) {
				palette_control.diagramx = maxx;
				palette_control.diagramy = maxy;
				kite9.set_palette_size(palette_control);
			}
			
			palette_control.newitem.push(function(new_ri, object) {
				object.toClone = true;
				var handle = object.flannel;
				var id = object.id;
				var type = object.type;
	
				if (id.indexOf("palette:") === 0) {
					var sx, sy, old_opacity;
					handle.drag(function(dx, dy, x, y, event) {
						
						if (kite9.dragging == false) {
							kite9.dragging = true;
							kite9.drag_set.clear();
							kite9.drag_ids = {};
							kite9.sub_drag_ids = {};
							kite9.drag_ids[id] = object;
							
						
							kite9.add_drag(object, kite9.drag_set, handle);
							$(object.definition).find("arrow,context,glyph,text-line,label,comp-shape").each(function (k,v) {
								// drag all child stuff too
								var id = $(v).attr("id");
								if (id !== undefined) {
									var def = palette_control.objectMap[id];
									kite9.sub_drag_ids[id] = def;
									kite9.add_drag(def, kite9.drag_set, undefined);
								}
							});
								
							kite9.drag_set.push(object.drag_contents);
							
							// move the drop targets to the front
							kite9.to_front_drop_targets(kite9.drag_ids);
							
							kite9.mid_drag_move = false;	
							kite9.mouse_drag_object = object;
							
							
							if (kite9.drag_listeners) {
								$.each(kite9.drag_listeners, function(k, v) {
									v();
								});
							}
												
							// calculate postion on main control
							var drag_box =$(kite9.main_control.element).offset();
							var mx = ( x - drag_box.left) / kite9.main_control.css_scale;
							var my = ( y - drag_box.top) / kite9.main_control.css_scale;
							
							// reposition drag item under mouse
							var box = object.main.getBBox();
							var cx = box.x + (box.width /2);
							var cy = box.y + (box.height / 2);
							kite9.main_control.move_set(kite9.drag_set, mx - cx, my - cy, false);
							
							kite9.main_drag_set_moved_position(0, 0, mx, my);
						}  
						
						kite9.move_drag(handle, dx, dy, x, y);
					}, function () {
						}, function() {
							// end drag
							if (kite9.dragging) {
								kite9.drop_targets.toBack();
								kite9.dragging = false;
								var box = handle.getBBox();
								kite9.end_drag(handle, box.x+box.width/2, box.y + box.height/2, 0, 0, palette_control);
								
								var idMap = {};
								
								// update ids so that they are not the palette ids
								var movedXML = $(kite9.main_control.theDiagram).find(escape_id(id));
								var movedChildren = movedXML.find("[id]");
								movedChildren =movedChildren.add(movedXML);
								movedChildren.each(function(k, v) {
									// rename ids which have been dragged in from the palette
									var newId = kite9.new_id();
									var oldId = $(v).attr("id");
									var memento = kite9.main_control.objectMap[oldId];
									delete kite9.main_control.objectMap[oldId];
									delete palette_control.objectMap[oldId];
									kite9.main_control.objectMap[newId] = memento;
									memento.id = newId;
									delete memento.toClone;	
									$(v).attr("id", newId);
									idMap[oldId] = newId;
									
									// delete the flannel, as it's on the wrong paper
									if (memento.flannel) {
										memento.flannel.remove();
										delete memento.flannel;
									}
									
									// update the container layout to match the parent
									if (memento.type=='context') {
										var parentLayout = $(v).parent().attr("layout");
										var thisLayout = $(v).attr("layout");
										if ((thisLayout == undefined) && (parentLayout)) {
											$(v).attr("layout", parentLayout);
										}
									}
								});
								
								$(kite9.main_control.get_links()).find("[reference^=palette]").each(function(k, v) {
									var oldId = $(v).attr("reference");
									var newId = idMap[oldId];
									$(v).attr("reference", newId);
								});
								
								kite9.load(kite9.main_control);
								kite9.load(palette_control, file, undefined);
							}
						}
					);
				}
			});
			
			palette_control.update_listeners.push(function() {
				$.each(palette_control.objectMap, function(k, v) {
					if ((k.indexOf("palette:") == 0) && (v.flannel)) {
						v.flannel.toFront();
					}
				})
			});
			
			palette_control.element.css("display", "block");
			kite9.load(palette_control, file, undefined);
		});
	}
	
	
		
	if (!kite9.drag_listeners) {
		kite9.drag_listeners = [];
	}
	
	kite9.drag_listeners.push(function() {
		// hide palette when drag starts
		kite9.hide_menus();
	});
	
	kite9.count_elements = function(holder, counter) {
		if ($(counter).size() > 0) {
			$(counter).text($(holder).find("*").size());
		}
	}
	
	kite9.main_control.update_listeners.push(function() {
		kite9.count_elements(kite9.main_control.element, $('#main_control_count'));
	});
	
}
	