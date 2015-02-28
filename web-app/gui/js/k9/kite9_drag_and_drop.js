/**
 * Adds drag and drop functionality to the flannel element.
 * 
 */
function setup_dragable(kite9, control) {
	
	kite9.dragging = false;	
	kite9.mid_drag_move = false;
	
	/**
	 * Top-level items being dragged
	 */
	kite9.drag_ids = {};
	
	/**
	 * Lower level items being dragged
	 */
	kite9.sub_drag_ids = {};
	
	/**
	 * Actual item under the mouse
	 */
	kite9.mouse_drag_object = null;
	
	kite9.drag_set = kite9.main_control.paper.set();
	kite9.drop_targets = kite9.main_control.paper.set();
	kite9.drag_move_listeners = [];
	
	function can_drag(object) {
		var type = object.type;
		if (!((type === 'glyph') || (type==='context') || (type==='arrow'))) {
			return false;
		}
		
		return true;
	}
	
	control.flannel.push(function(object) {		
		var handle = object.flannel;
		var id = object.id;
		var type = object.type;
		
		if (!can_drag(object)) {
			return;
		}
		
		var sx, sy;
		handle.drag(function(dx, dy, x, y, event) {
				if (!kite9.is_selected(id)) {
					return;
				}
				if (((kite9.dragging) || (Math.abs(dx) > 8) || (Math.abs(dy) >8)) && (kite9.selectedObjects[id])) {
					if (kite9.dragging == false) {
						kite9.compose_drag(handle, event, control, id, object);
					}  
					kite9.move_drag(handle,  dx, dy);
				}
			}, function () {
					// start drag
					if (!kite9.is_selected(id)) {
						return;
					}
					var box = object.flannel.getBBox();
					sx = box.x + box.width/2;
					sy = box.y + box.height/2;
					kite9.main_drag_set_moved_position(0, 0, sx, sy);
			}, function() {
				// end drag
				if (kite9.dragging) {
					kite9.drop_targets.toBack();
					kite9.dragging = false;
					var box = handle.getBBox();
					kite9.end_drag(handle, box.x+box.width/2, box.y + box.height/2, sx, sy, control);
					kite9.load(control);
				}
			}
		);
	});
	
	var mx, my;  // record how far we have already moved the drag flannel
	var mox, moy; // original position of drag flannel
	kite9.main_drag_set_moved_position = function(mmx, mmy, mmox, mmoy) {
		mx = mmx;
		my = mmy;
		mox = mmox;
		moy = mmoy;
	}
	
	/**
	 * builds kite9.drag_set, kite9.drag_ids and kite9.mouse_drag_object.
	 */
	kite9.compose_drag = function(handle, event, control_space, id, object) {
		if (kite9.drag_listeners) {
			$.each(kite9.drag_listeners, function(k, v) {
				v();
			});
		}
		
		kite9.dragging = true;
		kite9.drag_set.clear();
		
		// build a list of selected items
		kite9.drag_ids = {};
		kite9.sub_drag_ids = {};
		kite9.mouse_drag_object = null;
		
		if (!kite9.is_selected(id)) {
			// make sure we add the object being dragged
			kite9.select(object, handle);
		}
		
		$.each(kite9.selectedObjects, function (k, v) {
			if (can_drag(control.objectMap[k])) {
				kite9.drag_ids[k] = control.objectMap[k];
			}
		});
		
		kite9.mouse_drag_object = object;
		
		// remove nested elements
		$.each(kite9.selectedObjects, function(key, v) {
			var ob = control_space.objectMap[key];
			if (ob !== undefined) {
				var def = ob.definition;
				$(def).find("arrow,context,glyph,text-line,label,comp-shape").each(function(k, v) { 
					var id = $(v).attr("id");
					delete kite9.drag_ids[id];
				});	
			}
		});
		
		// build the set of things to drag
		$.each(kite9.drag_ids, function(key,v) {
			var drag_ob = v;
			kite9.add_drag(drag_ob, kite9.drag_set, handle);
			$(drag_ob.definition).find("arrow,context,glyph,text-line,label,comp-shape").each(function (k,v) {
				// drag all child stuff too
				var id = $(v).attr("id");
				if (id !== undefined) {
					var def = control_space.objectMap[id];
					kite9.add_drag(def, kite9.drag_set, undefined);
					kite9.sub_drag_ids[id] = def;
				}
				
			});
			
			kite9.drag_set.push(drag_ob.drag_contents);
		});

		// move the drop targets to the front
		kite9.to_front_drop_targets(kite9.drag_ids);
		
		kite9.mid_drag_move = false;	
	}
	
	kite9.move_drag = function(handle, dx, dy) {
		kite9.mid_drag_move = true;
		var control = kite9.main_control;
		var scale = control.css_scale;
		var d2x = (dx-mx)/scale;
		var d2y = (dy-my)/scale;
		mx = dx;
		my = dy;
		control.move_set(kite9.drag_set,d2x, d2y, false);	
		kite9.mid_drag_move = false;
		kite9.handle_drag_over(mox + (mx/scale), moy + (my/scale));
	}
	
	/**
	 * Moves to front drop targets that you are allowed to drop to.
	 */
	kite9.to_front_drop_targets = function(drag_ids) {
		$(control.theDiagram).find("diagram,context,link").each(function (k, v) {
			var id = $(v).attr("id");
			var memento = control.objectMap[id];
			if (memento) {
				var dt = memento.drop;
				if (dt && (drag_ids[id]===undefined)) {
					memento.drop.toFront();
				}
			}
		});
	}
	
	kite9.end_drag = function(handle, xp, yp, xs, ys, from_control_space) {
		var id = kite9.current_drop_target;
		if ((id===undefined) || (id===null)) {
			// use the diagram
			id = $(kite9.main_control.theDiagram).find("diagram").attr("id");
		}
		
		// dragging to
		var object = control.objectMap[id];
		var changed = false;
		
		if (object && object.drop) {
			object.drop.attr({"fill-opacity" : .01, "opacity" : .01});	
		}
		
		$.each(kite9.drag_ids, function (key, drag_object) {
			// return the content back to the main paper
			var drag = kite9.main_control.paper.set();
			var moveComplete = kite9.can_drop(id, drag_object);
			
			if (moveComplete) {
				changed = true;
				var dragBox = drag_object.flannel.getBBox();
				
				kite9.main_control.move_set(drag, xp - dragBox.x - (dragBox.width /2), yp - dragBox.y - (dragBox.height /2), true);
				move_int(drag_object, xp -xs, yp-ys);
				// alter the xml
				var xml = null;
				if (drag_object.toClone) {
					// clone
					xml = $(drag_object.definition).clone().detach();
				} else {
					// move
					xml = $(drag_object.definition).detach();
				}
				$(object.definition).prepend(xml);
			} else {
				var dragBox = drag_object.flannel.getBBox();
				// return to it's original location
				kite9.main_control.move_set(drag, drag_object._orig_x - dragBox.x, drag_object._orig_y - dragBox.y, true);
			}
			
			moveObject(drag_object, drag, handle, kite9.main_control.paper, kite9.main_control, true);
			drag_object.box_ri.x = drag_object.box_ri.x-0.01; //minor size change just to cause a move back
			drag_object.int_ri.x = drag_object.int_ri.x-0.01;
			
			$(drag_object.definition).find("arrow,context,glyph,text-line,label,comp-shape").each(function (k,v) {
				// move all contents back
				var id = $(v).attr("id");
				var def = from_control_space.objectMap[id];
				if (def) {
					def.box_ri.x = def.box_ri.x-0.01;
					def.int_ri.x = def.int_ri.x-0.01;//minor size change just to cause a move back
					moveObject(def, drag, handle, kite9.main_control.paper, kite9.main_control, true);

					if (moveComplete) {
						move_int(def, xp -xs, yp-ys);
					}
				}
				
			});
		});

		if (changed) {
			var layout = $(object.definition).attr("layout")
			var toSort = [];
			
			$(object.definition).children("arrow,glyph,context").each(function(k, v) {
				var sortOb = control.objectMap[$(v).attr("id")];
				if (sortOb === undefined) {
					toSort.push({
						definition: v,
						x1: xp,
						y1: yp
					});
				} else {
					toSort.push({
						definition: v,
						x1: sortOb.flannel.getBBox().x,
						y1: sortOb.flannel.getBBox().y
					});
				}
				$(v).detach();
			});
			
			switch (layout) {
			case "UP":
				toSort.sort(function (a,b) { return b.y1 - a.y1; });
				break;
			case "DOWN":
			case "VERTICAL":
				toSort.sort(function (a,b) { return a.y1 - b.y1; });
				break;
			case "LEFT":
				toSort.sort(function (a,b) { return b.x1 - a.x1; });
				break;
			case "RIGHT":
			case "HORIZONTAL":
			default:
				toSort.sort(function (a,b) { return a.x1 - b.x1; });
				break;
			}
			
			$(toSort).each(function (k, v) {
				$(object.definition).append(v.definition);
			});
			
			kite9.unselect_all();
			handle_drop_link();
		} else {
			kite9.update(control);
		}
		
		kite9.drag_ids={};
		kite9.sub_drag_ids={};
		
		$.each(kite9.drag_move_listeners, function(k, v) {
			v(null, null);
		});
		
	};
	
	function move_int(drag_object, x, y) {
		if (drag_object.int_ri) {
			var int_ri = drag_object.int_ri;
			int_ri.x = int_ri.x + x;
			int_ri.y = int_ri.y + y;
		}
	}
	 
	/**
	 * Moves all of the elements into the drag plane, except the handle (as this breaks raphael).
	 */
	function checkMove(set, item, handle, paper, isFlannel) {
    	if (item !== undefined) {
    		var fromPaper = item.paper;
    		if ((item == handle) || (isFlannel) || (fromPaper == paper)) {
    			if (set) {
    				set.push(item);
    			}
    			
    			return item;
    		} else {
        		var out = kite9.moveTo(item, paper)
        		if (set) {
            		set.push(out);
        		}
        		
        		return out;
    		}
    	}
    }
	
	/**
	 * Move a whole object between papers.
	 * Done in layout order
	 */
	function moveObject(object, set, handle, paper, control, toDestination) {
		object.shad = checkMove(set, object.shad, handle,paper, false);
		object.shadFrom = checkMove(set, object.shadFrom, handle,paper, false);
		object.shadTo = checkMove(set, object.shadTo, handle,paper, false);
		object.main = checkMove(set, object.main, handle,paper, false);
		object.mainFrom = checkMove(set, object.mainFrom, handle,paper, false);
		object.mainTo = checkMove(set, object.mainTo, handle,paper, false);
		object.contents = checkMove(set, object.contents, handle,paper, false);
		object.flannel = checkMove(set, object.flannel, handle,paper, toDestination == false);
	
		if (toDestination) {
			// ensure that the object is in the control's map
			if (control.objectMap[object.id] === undefined) {
				control.objectMap[object.id] = object;
			}
		}
	}
	
	
	/**
	 * Adds drawing elements to the drag set, moving to the drag layer as it does so.
	 */
	kite9.add_drag = function(object, set, handle) {
		object._orig_x = object.flannel.getBBox().x;
		object._orig_y = object.flannel.getBBox().y;
		moveObject(object, set, handle, kite9.main_control.paper, kite9.main_control, false);
	}
	
	jq = function (myid) { 
		return '#' + myid.replace(/(:|\.)/g,'\\$1');
	};
	
	kite9.can_drop = function(into_id, dropping) {
		if (into_id === undefined) {
			return false;
		}
			
		var self_drop_ok = $(dropping.definition).attr("id") !== into_id;
		
		// can't drop into ancestor
		var ancestor_drop_ok = $(dropping.definition).find(jq(into_id)).size()===0;
		
		// can't drop into existing parent container
		var parent = $(dropping.definition).parent().attr("id");
		var parent_drop_ok = into_id !== parent;
		
		return self_drop_ok && ancestor_drop_ok;
		
	};
	
    /**
     * Clones a raphael element into a different drawing paper.
     */
	kite9.cloneTo = function (e, topaper) {
    	if (e.removed) {
             return null;
        } else if (e.type === 'set') {
    		var out = topaper.set();
    		for (var i = 0, ii = e.items.length; i < ii; i++) {
                out.push(kite9.cloneTo(e.items[i], topaper));
            }
    		return out;
    	} else {
            var out = topaper[e.type]().attr(e.attr());
            return out;
    	}
    };
    
    /**
     * Moves a raphael element into a different drawing paper.
     */
    kite9.moveTo = function(e, topaper) {
    	if (e.removed) {
            return null;
       } else if (e.type === 'set') {
    	   // we are going to leave the set as-is, but change the elements in it
     	   var contents = e.items.slice(0);
    	   e.clear();
    	   for (var i = 0, ii = contents.length; i < ii; i++) {
               e.push(kite9.moveTo(contents[i], topaper));
           }
   		   return e;
   		} else {
           var out = topaper[e.type]().attr(e.attr());
           e.remove();
           return out;
   		}
    }
    
    /*
     * Handling the current drag state
     */
    kite9.drag_handling = false;
	kite9.current_drop_target = undefined;
	kite9.current_drop_link = undefined;
	kite9.current_drop_shape = undefined;
	
	kite9.handle_drag_over = function(x, y) {
		var elem = kite9.get_smallest_element_by_point(x, y, function(v) {
			return (v.type == 'diagram') || (v.type == 'context') || (v.type == 'link');
		}, control);
		
		if (elem) {
			var id = elem.id;
			var memento = control.objectMap[id];
			if (memento.type == 'link') {
				if (kite9.current_drop_link != id) {
					// deal with link change
					if (kite9.current_drop_link) {
						var changes = control.objectMap[kite9.current_drop_link].flannel;
						kite9.animate_select(changes, null);
					}
					if (can_drop_link(memento)) {
						kite9.animate_select(memento.flannel, kite9.HOVER_LINK_ATTR);
						kite9.current_drop_link = id;
					} else {
						kite9.current_drop_link = undefined;
					}
				}
			} else {
				// unselect drop link
				if (kite9.current_drop_link) {
					var changes = control.objectMap[kite9.current_drop_link].flannel;
					kite9.animate_select(changes, null);
					kite9.current_drop_link = undefined;
				}
				if ((!kite9.is_selected(id)) &&  (kite9.current_drop_target != id)) {
					// deal with drop target change
					if (kite9.current_drop_target) {
						var changes = control.objectMap[kite9.current_drop_target].flannel;
						kite9.animate_select(changes, null);
					}
					kite9.current_drop_target = id;
					if (memento.type !== 'diagram') {
						kite9.animate_select(memento.flannel, kite9.HOVER_BOX_ATTR);
					}
				}
			}
		}

		$.each(kite9.drag_move_listeners, function(k, v) {
			v(x, y);
		});
		
	}
    
	kite9.DROP_LINK_ATTR = {	
			"stroke-width": 10, 
			stroke: "#AAF"};

	
	/**
	 * Override focusing for when we are dragging something over a link
	 */
	old_cfo = kite9.can_focus_over;
	kite9.can_focus_over = function(memento) {
		if (memento.type == 'link') {
			if (kite9.dragging) {
				return can_drop_link(memento);
			} else {
				return old_cfo(memento);
			}
		} else {
			return old_cfo(memento);
		}
	}
	
    function setup_drop_target(object) {
		var id = object.id;
		var drop_target = object.flannel; 
		var type = object.type;
		object.drop = drop_target;
		kite9.drop_targets.push(drop_target);
		drop_target._id = id;
		
		if (type=='link') {
			drop_target.mouseover(function() {
				if (can_drop_link(object)) {
					kite9.current_drop_link = id;
				}
			});
		} else {
			drop_target.mouseover(function() {
				if (!kite9.is_selected(drop_target._id)) {
					kite9.current_drop_target = drop_target._id;
					kite9.current_drop_link = undefined;
				}
			});
		}
		
		return drop_target;
    }
    
    function can_drop_link(object) {
    	var id = object.id;
		var fromId = $(object.definition).children("from").attr("reference");
		var toId = $(object.definition).children("to").attr("reference");
    	
    	var canDrop = true;
       	canDrop = canDrop && kite9.mouse_drag_object;				
        canDrop = canDrop && (kite9.mouse_drag_object.type !== 'context');
    	canDrop = canDrop && (!kite9.is_selected(id)); 
    	canDrop = canDrop && (kite9.mouse_drag_object.id !== fromId)
    	canDrop = canDrop && (kite9.mouse_drag_object.id !== toId);
    	return canDrop;
    }
        
   function handle_drop_link() {
	   if (kite9.current_drop_link) {
		   // remove any connections the object currently has
		   $(kite9.main_control.get_links()).find('[reference="'+kite9.mouse_drag_object.id+'"]').each(function (k,v) {
			   var theLink = $(v).parent();
			   var theLinkId = theLink.attr("id");
			   kite9.remove(kite9.main_control,theLinkId);
		   });
		   
		   var linkOb = kite9.main_control.objectMap[kite9.current_drop_link];
		   var linkDef1 = $(linkOb.definition);
		   var linkDef2 = linkDef1.clone();
		   linkDef1.children("fromDecoration").remove();
		   linkDef1.children("fromLabel").remove();
		   linkDef1.children("from")
		   	.attr("reference", kite9.mouse_drag_object.id)
		    .attrNS("http://www.w3.org/2001/XMLSchema-instance", "xsi", "type", kite9.mouse_drag_object.type);
		    
		   linkDef2.children("toDecoration").remove();
		   linkDef2.children("toLabel").remove(); 
		   linkDef2.children("to")
		   	.attr("reference", kite9.mouse_drag_object.id)
		    .attrNS("http://www.w3.org/2001/XMLSchema-instance", "xsi", "type", kite9.mouse_drag_object.type);
		   
		   linkDef2.appendTo(kite9.main_control.get_links());
	   }
   }
    
	// create drop targets
	control.flannel.push(function(object) {
		if ((object.type === 'context') || (object.type === 'diagram') || (object.type == 'link')) {
			return setup_drop_target(object);
		}
	});
	
	/**
	 * This replaces the Raphael implementation with something faster.  Used heavily in drag and drop
	 */
	var old = control.paper.getElementByPoint;
	var cache = {
		x: -1,
		y: -1,
		last: undefined
	}
	control.paper.getElementByPoint = function(x, y) {
		if ((x == cache.x) && (y == cache.y)) {
			return cache.last;
		}
		var out = kite9.get_smallest_element_by_point(x, y, function(ob) { 
			return (kite9.drag_ids[ob.id] == undefined) && (kite9.sub_drag_ids[ob.id]==undefined); 
		}, control);
		if (out !== undefined) {
			cache.last = out.flannel;
			cache.x = x;
			cache.y = y;
			return out.flannel;
		}
	}
};