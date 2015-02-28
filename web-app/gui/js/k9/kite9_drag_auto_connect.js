setup_autoconnect = function(kite9) {
	
	var connectable_objects = {};
	var link_to;
	var link_d;
	
	var bboxCache = {};
	var xoff, yoff, width, height;
	
	function bbox(k) {
		var out = bboxCache[k];
		if (out == undefined) {
			out = kite9.main_control.objectMap[k].flannel.getBBox();
			bboxCache[k] = out;
		}
		
		return out;
	}
	
	var connect_mode = 2;  // new
	
	$('#link_style_auto_connect_on').mousedown(function() {
		$('#link_style_auto_connect_on').hide();
		$('#link_style_auto_connect_new').show();
		connect_mode = 2;
	}).hide();
	
	$('#link_style_auto_connect_off').mousedown(function() {
		$('#link_style_auto_connect_off').hide();
		$('#link_style_auto_connect_on').show();
		connect_mode = 1;
	}).hide();
	
	$('#link_style_auto_connect_new').mousedown(function() {
		$('#link_style_auto_connect_new').hide();
		$('#link_style_auto_connect_off').show();
		connect_mode = 0;
	});
	
	function is_auto_connect(from_id) {
		if (connect_mode == 0) {
			return false;
		} else if (connect_mode == 1) {
			return true;
		} else if (from_id.indexOf("palette:")==0) {
			return true;
		} else {
			return false;
		}
	}
	
	PALETTE_MAX_AUTO_CONNECT_DISTANCE = 100;	// pixels
	EXISTING_MAX_AUTO_CONNECT_DISTANCE = 60;
	

	kite9.set_link_invisible = function(xml) {
		$.each(kite9.get_stylesheet().linkStyles[0], function(k, v) {
			if (v.invisible) {
				xml.attr("shape", k);
			}
		});
	}
	
	/**
	 * This makes the editor more eager to connect elements from the palette than
	 * existing on the diagram already.
	 */
	function get_max_auto_connect_distance() {
		if ($(kite9.mouse_drag_object.definition).attr("id").indexOf("palette:")==0) {
			return PALETTE_MAX_AUTO_CONNECT_DISTANCE;
		} else {
			return EXISTING_MAX_AUTO_CONNECT_DISTANCE;
		}
	}
	
	AUTO_CONNECT_ATTR = {
		fromTerminator: "NONE",
		toTerminator: "NONE",
		linkShape: "INVISIBLE",
		linkStyle: {
			stroke: '#AAF',
			opacity: .6,
			"stroke-width": 3
		}
	};
	
	function in_directed_container() {
		if (kite9.current_drop_target) {
			var memento = kite9.main_control.objectMap[kite9.current_drop_target];
			if (memento) {
				var direction = $(memento.definition).attr("layout");
				if (direction) {
					return memento;
				}
			}
		}
		
		return false;
	}
	
	/**
	 * This function looks for stuff to connect to and shows links on screen to demonstrate this
	 */
	kite9.drag_move_listeners.push(function(x, y) {
		if ((x==null) || (kite9.current_drop_link)) {
			// hide the visible object
			clear_link();
			return;
		}
		
		// should only be a single selected item
		var pos = undefined;
		if (xoff == undefined) {
			pos = kite9.mouse_drag_object.flannel.getBBox();
			xx = pos.x + pos.width /2;
			yy = pos.y + pos.height / 2;
			xoff = x - xx;
			yoff = y - yy;
			width = pos.width;
			height = pos.height;
			x = xx;
			y = yy;
		} else {
			x = x - xoff;
			y = y - yoff;
			pos= {
				x: x - width /2,
				y: y - height / 2,
				width: width,
				height: height
			};
		}
		
		var dc = in_directed_container();
		if (dc) {
			if (link_to !== undefined) {
				link_to.flannel.attr(link_to.flannel.original_attr); // revert highlight
				link_to = undefined;
			}
			update_directed_container_indicator(dc, pos.x + (pos.width / 2), pos.y + (pos.height / 2));
			return;
		}
		
		if (kite9.drag_ids.length > 1) {
			link_to = undefined;
			return;
		}

		var best = undefined;
		var best_dist = undefined;
		var best_d  = undefined;
		
		$.each(kite9.get_elements_in_axis(y, false), function(k, c) {
			if ((!kite9.drag_ids[k]) && (!kite9.sub_drag_ids[k]) && (connectable_objects[k])) {
				var v = bbox(k);
				
				if ((y <= v.y + v.height) && (y >= v.y)) {
					// intersection on y position
					var d;
					if (v.x + v.width < x) {
						dist = pos.x - v.x - v.width;
						d = 'RIGHT';
					} else if (v.x > x) {
						dist = v.x - pos.x - pos.width;
						d = 'LEFT';
					} else {
						dist = get_max_auto_connect_distance() +1;
						d = null;
					}
								
					if (best_dist) {
						if (dist > best_dist) {
							return;
						}
					}
						
					best = k;
					best_dist = dist;
					best_d = d;
				}
			}
		});
			
		$.each(kite9.get_elements_in_axis(x, true), function(k, c) {
			if ((!kite9.drag_ids[k]) && (!kite9.sub_drag_ids[k]) && (connectable_objects[k])) {
				var v = bbox(k);

				if ((x <= v.x+v.width) && (x >= v.x)) {
					// intersection on x position
					if (v.y + v.height < y) {
						dist = pos.y - v.y - v.height;
						d = 'DOWN';
					} else if (v.y > y) {
						dist = v.y - pos.y - pos.height;
						d = 'UP';
					} else {
						dist = get_max_auto_connect_distance() +1;
						d = null;
					}
					
					if (best_dist) {
						if (dist > best_dist) {
							return;
						}
					}
						
						
					best = k;
					best_dist = dist;
					best_d = d;
				}
			}
		});

		
		if ((best_dist > get_max_auto_connect_distance() * kite9.main_control.scale)){
			best = undefined;
		}
		
		best = (best === undefined) ? undefined : kite9.main_control.objectMap[best];
		
		if (best === undefined) {
			clear_link();
		} else if (best === link_to) {
			link_d = best_d;
			update_link(x, y, pos);	
		} else {
			clear_link();
			link_to = best;
			link_d = best_d;
			link_to.flannel.attr(kite9.HOVER_BOX_ATTR);
			update_link(x, y, pos);
		}
		//$("#errors").html("Best: "+link_to+" d = "+link_d+" dist "+best_dist);
	});
	
	function clear_link() {
		if (container_indicator !== undefined) {
			container_indicator.remove();
			container_indicator = undefined;
		}
		
		kite9.remove_temp_link();
		
		if (link_to !== undefined) {
			link_to.flannel.attr(link_to.flannel.original_attr);
			link_to = undefined;
		}
	}
	
	var container_indicator = undefined;

		
	function update_directed_container_indicator(dc, x, y) {
		var direction = $(dc.definition).attr("layout");
		var horiz = (direction == "RIGHT") || (direction == "LEFT" || (direction=="HORIZONTAL"));
		var containerBox = dc.flannel.getBBox();
	
		var path;
		
		if (horiz) {
			path = "M"+x+" "+containerBox.y+" l"+0+" "+containerBox.height;
		} else {
			path = "M"+containerBox.x+" "+y+" l"+containerBox.width+" "+0;
		}
		kite9.remove_temp_link();
		if (container_indicator == null) {
			container_indicator = kite9.main_control.paper.path(path);
			container_indicator.attr(AUTO_CONNECT_ATTR.linkStyle);
		} else {
			container_indicator.attr({path: path})	
		}
	}
	
	function update_link(tx, ty, frompos) {
		var fx, fy;
		var fromob = kite9.mouse_drag_object;
		if (fromob) {
			var topos = link_to.flannel.getBBox();
			if ((link_d == 'LEFT') || (link_d=='RIGHT')) {
				fy = ty;
				fx = frompos.x + frompos.width / 2;
				tx = topos.x + topos.width / 2;
			} else {
				fx = tx;
				fy  =frompos.y + frompos.height / 2;
				ty = topos.y + topos.height / 2;
			}

			kite9.update_temp_link(is_auto_connect(fromob.id) ? undefined : AUTO_CONNECT_ATTR, tx, ty, fx, fy);
		}
	}
	

	
	kite9.main_control.changed.push(function(new_ri, object) {
		if ((object.type =='glyph') || (object.type == 'arrow')) {
			 connectable_objects[object.id] = new_ri;
		}
	});
	
	kite9.main_control.newitem.push(function(new_ri, object) {
		if ((object.type =='glyph') || (object.type == 'arrow')) {
			 connectable_objects[object.id] = new_ri;
		}
		
	});
	
	
	kite9.main_control.removed.push(function(new_ri, object) {
		 delete connectable_objects[object.id];
	});
	
	var old_end_drag = kite9.end_drag;
	
	kite9.end_drag = function(handle, xp, yp, xs, ys, from_control_space) {
		// empty the cache
		bboxCache = {};
		xoff = undefined;
		yoff = undefined;
		
		if (link_to) {
			// create links between the selected object and the link_to one
			var id_from = kite9.mouse_drag_object.id;
			var ob_from = kite9.drag_ids[id_from];
			var xml = kite9.get_connection_between(link_to.id, id_from);

			ensure_no_directed_leavers(id_from,  kite9.reverse_direction(link_d));

			if (!xml) {
				var id = kite9.new_id();
				var xml = create_content_xml(id, 'link', null, kite9.main_control.get_links(), link_to.id, id_from, link_to.type, kite9.mouse_drag_object.type);
				$(xml).attr("drawDirection", link_d);
				kite9.create(id, xml , 'link', kite9.main_control);
				if (is_auto_connect(id_from)) {
					kite9.apply_link_style(xml, false);
				} else {
					kite9.set_link_invisible(xml);
				}
			} else {
				var isReversed = $(xml).children("from").attr("reference") != link_to.id;		
				if (isReversed) {
					link_d = kite9.reverse_direction(link_d);
				}
				
				$(xml).attr("drawDirection", link_d);
				if (kite9.is_link_invisible(xml) && is_auto_connect(id_from)) {
					kite9.apply_link_style(xml, isReversed);
				}
				
				// ensure changed link is at the end of allLinks
				$(xml).detach();
				$(kite9.main_control.get_links()).append(xml);
			}
			
			
			
		}
		
		old_end_drag(handle, xp, yp, xs, ys, from_control_space);
	};
	
	/**
	 * Make sure there are no directed edges going from the element anywhere else 
	 * (enforces only one directed edge per side)
	 */
	function ensure_no_directed_leavers(id_from, direction) {
		var reversed = kite9.reverse_direction(direction);
		kite9.main_control.get_links().children().each(function (k, v) {
			var dd= $(v).attr("drawDirection");
			if ((dd!=undefined) && (dd!='')) {
				var fromId = $(v).children("from").attr("reference");
				var toId = $(v).children("to").attr("reference");
			
				if (((fromId == id_from) && (direction == dd)) 
					||  ((toId == id_from) && (reversed == dd))) {
					if (kite9.is_link_invisible(v)) {
						kite9.remove(kite9.main_control, $(v).attr("id"));
					} else {
						$(v).removeAttr("drawDirection");
					}
				}
			}
		});
	}
}