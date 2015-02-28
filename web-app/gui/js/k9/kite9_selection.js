/**
 * Sets up main control so that items are selectable.
 */
function setup_selection(kite9, control) {
	
	kite9.selectedObjects = {};  // id -> flannel
	kite9.lastSelectedObject = undefined;
	kite9.lastSelectedId = undefined;
	kite9.selectedType = {arrow: 0, glyph: 0, context: 0, diagram: 0, link: 0, toLabel: 0, fromLabel: 0, label: 0, "text-line" : 0};
	kite9.selectCallbacks = [];
	kite9.selectedCount = 0;
	kite9.focus = null;
	kite9.LINK_ATTRS = ["stroke", "opacity"];
	kite9.BOX_ATTRS = ["stroke", "opacity", "fill-opacity", "fill"];
	
	kite9.HOVER_BOX_ATTR = {stroke: '#AAF',
			fill:  '#AAF',
			"fill-opacity":  .3,
			opacity: .7,
			};
	
	kite9.HOVER_LINK_ATTR = {stroke: '#AAF',
			opacity: .7};
	
	kite9.SELECTED_BOX_ATTR = {stroke: '#FC0',
			fill: '#FC0',
			"fill-opacity" : .3,
			opacity: .7
			};
	
	kite9.SELECTED_LINK_ATTR = {stroke: '#FC0',
			opacity: .7};
	
	kite9.is_selecting = function() {
		return true;
	}
	
	function isMultiSelect() {
		return $("#multi").is(":checked") || kite9.selectEvent.ctrlKey || 
			kite9.selectEvent.metaKey || 
			kite9.selectEvent.altKey || 
			kite9.selectEvent.shiftKey;
	}
	
	$("#multi").button({
		text : true,
		icons : {
			primary : "ui-icon-arrow-4-diag"
		}
	}).click(function () {
		if (!isMultiSelect()) {
			$('#multi').removeAttr('checked');
			$('#multi').button( "refresh" ).removeClass("ui-state-focus ui-state-hover");
		} else {
			$("body").css("cursor", "");
			
			// turn off link mode, if set
			$("#link").removeAttr('checked');
			$('#link').button( "refresh" );
			
			// turn off move mode, if set
			kite9.setMoveMode(false);
		}
		
		return true;
	});
	
	$("label[for='multi']").attr("title", "Multiple, Marquee Selection Mode (or hold Ctrl)");
	
	kite9.select = function(item, shape, additive) {
		var id = item.id;
		var type = item.type;
		var alreadySelected = kite9.selectedObjects[id];
		var multiSelect = isMultiSelect();
		
		if (alreadySelected) {
			if (!multiSelect) {
				kite9.unselect_all();
			} else if (!additive) {
				kite9.unselect_item(id, shape);
				for ( var int = 0; int < kite9.selectCallbacks.length; int++) {
					kite9.selectCallbacks[int](false);
				}
			}
		} else {
			if (!multiSelect) {
				kite9.unselect_all();
			}
			
			kite9.select_item(id, shape);
			var object = control.objectMap[id];
			
			// unselect all child objects
			$(object.definition).find("[id]").each(function(k, v) {
				var id = $(v).attr("id");
				if (kite9.is_selected(id)) {
					kite9.unselect_item(id, shape);
				}
			});
			
			// unselect all parent objects
			$(object.definition).parents().each(function(k, v) {
				var id = $(v).attr("id");
				if (id && kite9.is_selected(id)) {
					kite9.unselect_item(id, shape);
				}
			});
			
			for ( var int = 0; int < kite9.selectCallbacks.length; int++) {
				kite9.selectCallbacks[int](true);
			}
		}
	}
	
	kite9.is_selected = function(id) {
		return kite9.selectedObjects[id] !== undefined;
	}
	
	kite9.unselect_item = function(id) {
		shape = kite9.selectedObjects[id];
		delete kite9.selectedObjects[id];
		kite9.animate_select(shape, null);
		kite9.update_selections(control.objectMap[id], -1);
		kite9.selectedCount = kite9.selectedCount - 1;
		
		if (kite9.lastSelectedObject == shape) {
			kite9.lastSelectedObject = undefined;
			kite9.lastSelectedId = undefined;
		}
	}
	
	kite9.animate_select = function(item, attrs) {
		var type = item.type;
		if (type == null) {
			return;
		} else if (type==="set") {
			$(item).each(function (k, v) {
				kite9.animate_select(v, attrs);
			});
		} else if (attrs === null) {
			item.animate(item.original_attr, 100);
		} else {
			item.animate(attrs, 100);
		}
	}
	
	kite9.animate_select_setup = function(item, link) {
		var type = item.type;
		if (type==="set") {
			$(item).each(function (k, v) {
				kite9.animate_select_setup(v, link);
			});
		} else {
			// store originals so we can get back to them
			if (link) {
				item.original_attr = item.attr(kite9.LINK_ATTRS);
			} else {
				item.original_attr = item.attr(kite9.BOX_ATTRS);
			}
		}
	}
	
	kite9.update_selections = function(def, count) {
		var type = def.type;
		
		var tc = kite9.selectedType[type];
		if (tc === undefined) {
			tc = 0;
		}
		tc += count;
		kite9.selectedType[type] = tc;
	}
	
	kite9.select_item = function(id, shape) {
		kite9.selectedObjects[id] = shape;
		var memento = control.objectMap[id];
		var type = memento.type;
		
		kite9.lastSelectedObject = shape;
		kite9.lastSelectedId = id;
		
		if (type !== 'diagram') {
			kite9.animate_select(shape, type === 'link' ? kite9.SELECTED_LINK_ATTR : kite9.SELECTED_BOX_ATTR);
		}
		kite9.update_selections(memento, 1);
		kite9.selectedCount = kite9.selectedCount + 1;
	}
	
	function get_change_shape(memento) {
		if (memento.type === 'link' ) {
			memento.changes = control.paper.set();
			
			if (memento.mainFrom != undefined) {
				memento.changes.push(memento.mainFrom);
			}
			
			if (memento.mainTo != undefined) {
				memento.changes.push(memento.mainTo);
			}
			
			memento.changes.push(memento.main);
		} else {
			memento.changes = memento.main;
		}
		
		return memento.changes;
	}
	
	kite9.can_focus_over = function(memento) {
		if (drag_select.bounds) {
			return false;
		}
		return true;
	}
	
	/**
	 * Stores the event used to select an item.
	 */
	kite9.selectEvent = undefined;
	
	
	drag_select = {
			bounds: undefined,
			shape: undefined,
	}
	
	/**
	 * Enables selection.
	 */
	control.flannel.push(function(memento) {
		var shape = memento.flannel;
		var id = memento.id;
		var changes = memento.flannel;
		var type = memento.type;
		
		kite9.animate_select_setup(changes, type==='link');
		
		shape.mouseover(function (event) {
			if ((kite9.focus !== null) && (kite9.focus._id === id)) {
				// do nothing, just selecting something within the current shape
			} else if (kite9.can_focus_over(memento)) {
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
		
		/**
		 * Single-select approach
		 */
		shape.mousedown(function (event) {
			kite9.selectEvent = event;
			if (kite9.is_selecting() && !isMultiSelect()) {
				kite9.select(memento, changes);
			}
		});
		
		/**
		 * Multi-select approach
		 */
		shape.drag(function(dx, dy, x, y, e) {
			// move
			if (drag_select.bounds) {
				dx = dx / control.css_scale;
				dy = dy / control.css_scale;
				drag_select.bounds.width = dx;
				drag_select.bounds.height = dy;
				if (dx < 0) {
					drag_select.bounds.x = drag_select.bounds.ox + dx;
				} else {
					drag_select.bounds.x = drag_select.bounds.ox;
				}
				drag_select.bounds.width = Math.abs(dx);
	
				if (dy < 0) {
					drag_select.bounds.y = drag_select.bounds.oy + dy;
				} else {
					drag_select.bounds.y = drag_select.bounds.oy;
				}
				drag_select.bounds.height = Math.abs(dy);
				
				drag_select.shape.attr({x: drag_select.bounds.x, y: drag_select.bounds.y, width: drag_select.bounds.width, height: drag_select.bounds.height});
			}
		}, function(x, y, e) {
			// start
			kite9.selectEvent = e;
			if ((drag_select.bounds == undefined) && isMultiSelect() && ((!kite9.is_selected(id)) || (type=='diagram'))) {
				x = (x - control.css_offsetx )/ control.css_scale;
				y = (y - control.css_offsety) / control.css_scale;
				drag_select.bounds = {
					ox: x,
					oy: y,
					x: x, 
					y: y,
					width: 0,
					height: 0
				};
				drag_select.shape = control.paper.rect(x, y, 0, 0);
				drag_select.shape.attr(kite9.HOVER_BOX_ATTR);
			}
		}, function() {
			// end
			if (drag_select.bounds !== undefined) {
				// deal with the bounds being just a click
				if ((Math.abs(drag_select.bounds.width)<3) && (Math.abs(drag_select.bounds.height)<3)) {
					kite9.select(memento, changes);
				} else {
					// ok, so we have to see if the bounding box affects other areas
					kite9.select_all(control.objectMap, drag_select.bounds);
				}
				
				drag_select.bounds = undefined;
				drag_select.shape.remove();
				drag_select.shape = undefined;
			}
		});
		
		shape.dblclick(function () {
			if (kite9.is_selecting()) {
				kite9.open_properties_dialog(memento.id);
			}
		});
	});
	
	function is_rect_within(inner, outer) {
		return (inner.x >= outer.x) && (inner.y >= outer.y) && (inner.x+inner.width<=outer.x+outer.width) && (inner.y+inner.height <=outer.y+outer.height);
	}
	
	function is_rect_intercepting(a, b) {
		var between = function(a1, a2, b) {
			return (b>=a1) && (b<=a2);
		}
		
		var between2 = function(a1, a2, b1, b2) {
			return between(a1, a2, b1) || between(a1, a2, b2);
		}
		
		return between2(a.x, a.x+a.width, b.x, b.x+b.width) && between2(a.y, a.y+a.height, b.y, b.y+b.height);
	}
	
	
	
	/**
	 * Keeps a map of which objects occupy which positions on screen as a useful hash function
	 */
	vertical_occupants = {};
	horizontal_occupants = {};
	
	update_occupants = function(newbox, object) {
		var id = object.id;
		var factor = kite9_stylesheet.gridSize;

		remove = function(map, lower, upper) {
			lower = Math.floor(lower);
			upper = Math.ceil(upper);
			for ( var p = lower; p < upper; p++) {
				var contained = map[p];
				if (contained) {
					delete contained[id];
				}
			}
		}
		
		add = function(map, lower, upper) {
			lower = Math.floor(lower);
			upper = Math.ceil(upper);
			for ( var p = lower; p < upper; p++) {
				var contained = map[p];
				if (contained == undefined) {
					contained = {};
					map[p] = contained;
				}
				
				contained[id] = object;
			}
		}
		if (object.box_ri) {
			remove(vertical_occupants, object.box_ri.y / factor, (object.box_ri.y + object.box_ri.h) / factor);
			remove(horizontal_occupants, object.box_ri.x / factor, (object.box_ri.x + object.box_ri.w) / factor);
		}
		if (newbox) {
			add(vertical_occupants, newbox.y / factor, (newbox.y + newbox.h) / factor);
			add(horizontal_occupants, newbox.x / factor, (newbox.x + newbox.w) / factor);
		}
	};
	
	control.changed.push(update_occupants);
	control.newitem.push(update_occupants);
	control.removed.push(update_occupants);
	
	
	kite9.get_elements_in_axis = function(coord, horiz) {
		var factor = kite9_stylesheet.gridSize;
		coord = Math.round(coord/factor);
		if (horiz) {
			var out = horizontal_occupants[coord];
		} else {
			var out = vertical_occupants[coord];
		}
		
		if (out == undefined) {
			return [];
		} else {
			return out;
		}
	}
	
	/**
	 * This is written because Raphael's one is broken.  Utility function for returning the element
	 * at a certain position. This is much faster than Raphael's as it only considers 
	 * the flannels too.
	 */
	kite9.get_elements_by_point = function(dx, dy, accept, control) {
		var out = [];
		var factor = kite9_stylesheet.gridSize;
		var coord = Math.round(dy / factor);
		var possibles = vertical_occupants[coord];
		if (possibles) {
			$.each(possibles, function(k, v) {
				if (accept(v)) {
					var box = v.box_ri;
					if (box != undefined) {
						if ((dx >= box.x) && (dy >=box.y) && (dx<=box.x+box.w) && (dy<=box.y+box.h)) {
							if (v.type == 'link') {
								var px = dx - v.flannel._.dx;
								var py = dy - v.flannel._.dy;
								if (Raphael.isPointInsidePath(v.flannel.attr("path"), px, py)) {
									out.push(v);
								}
							} else if (v.type == 'context') {
								out.push(v);
							} else {
								out.push(v);
							}
						}
					}
				}
			});
		}
		
		return out;
	}
	
	/**
	 * Smallest is the same as top-most for everything except links.
	 */
	kite9.get_smallest_element_by_point = function(dx, dy, accept, control) {
		var smallest = undefined;
		var to = undefined;
		var under = kite9.get_elements_by_point(dx, dy, accept, control);
		$.each(under,
			function(k, ob) {
				var size = ob.box_ri.w * ob.box_ri.h;
				if ((smallest == undefined) || (size < smallest)) {
					to = ob;
					smallest = size;
				}
		});
		
		return to;	
	}
	
	kite9.unselect_all = function(except) {
		for (key in kite9.selectedObjects) {
			if (key!==except) {
				kite9.unselect_item(key);
			}
		}
		
		kite9.selectedCount = 0;
		
		$.each(kite9.selectedType, function(k, v) {
			kite9.selectedType[k] = 0;
		});
		
		for ( var int = 0; int < kite9.selectCallbacks.length; int++) {
			kite9.selectCallbacks[int](false);
		}
	}
	
	kite9.select_all = function(objectMap, within) {
		var intercepted = [];
		var contained= {};
		var boundingPath = Raphael.parsePathString("M"+within.x+" "+within.y+" h "+within.width+"v"+within.height+"h-"+within.width+"v-"+within.height);
		
		// first, gather a list of mementos which intercept / contain the bounding box
		$.each(objectMap, function(k, mem) {
			if (mem.flannel) {
				var bbox = mem.flannel.getBBox();
				if (mem.type == 'link') {
					var points = Raphael.pathIntersection(boundingPath, mem.flannel.attr("path"));
					if (points.length>0) {
						intercepted.push(mem);
					}
				} else {
					if (is_rect_intercepting(within, bbox)) {
						intercepted.push(mem);
					} 
				
					if (is_rect_within(bbox, within)) {
						contained[k] = mem;
					}
				}
			}
		});
		
		// for any memento, select it from the intercepted list if 
		// it's parent is not in contained.
		$.each(intercepted, function(k,mem) {
			var par = get_parent_id(mem);
			var isContained = contained[par];
			if (!isContained) {
				kite9.select(mem, mem.flannel, true);
			}
		});
	}
	
	function get_parent_id(memento) {
		var par = $(memento.definition).parent();
		var pid = par.attr("id");
		if (pid == undefined) {
			par = par.parent();
			pid = par.attr("id");
		}
		
		return pid;
	}
	
	/**
	 * Handles making sure things maintain colour scheme when changed
	 */
	control.changed.push(function(new_ri, memento) {
		var id = memento.id;
		var type = memento.type;
		var changes = memento.flannel;
		if (kite9.is_selected(id)) {
			if (type !== 'diagram') {
				kite9.animate_select(changes, type === 'link' ? kite9.SELECTED_LINK_ATTR : kite9.SELECTED_BOX_ATTR);;
			}
		}
	});
	
	control.removed.push(function(ri, memento) {
		// unselect deleted items
		if (kite9.is_selected(memento.id)) {
			kite9.unselect_item(memento.id);
		}
	});
	
};
