/**
 * Attaches a context-sensitive menu to the display so that you can see the editing options available
 */
function setup_controls_popups(kite9) {
	
	var control = kite9.main_control;
	kite9.popup_layer = control.paper;
	kite9.popup_set = undefined;
	kite9.popup_anim_set = undefined;
	kite9.popup_handlers = {};
	
	var ss = kite9.get_stylesheet();
	
	var icon_internal_pad_x = 1;
	var icon_internal_pad_y = 1;
	
	var mousex, mousey;
	
	function getMousePosition() {
		if (kite9.isTouch) {
			if (kite9.selectEvent) {
				var touch = kite9.selectEvent.originalEvent.touches[0];
				mousex = touch.pageX - kite9.main_control.css_offsetx;
				mousey = touch.pageY - kite9.main_control.css_offsety;
			}
		} else {
			if (kite9.selectEvent) {
				mousex = kite9.selectEvent.pageX;
				mousey = kite9.selectEvent.pageY;
			}
		}
	}
    
	
  
	POPUP_REGULAR_COLOR = "#ACF";
	POPUP_HIGHLIGHT_COLOR = "#FFF";
	POPUP_BACKGROUND_COLOR = "#004";
	POPUP_INACTIVE_COLOR = "#667";
	ANIM_SPEED = 200;
	
	var zoom_chooser_open = false;
	
	var tip = $("#tool-tip").hide();
	
	
	POPUP_BACKGROUND = {
		"fill" : POPUP_BACKGROUND_COLOR,
		"stroke" : POPUP_REGULAR_COLOR,
		"stroke-width" : 2
	}
	
	POPUP_ICON = {
			"fill" : POPUP_REGULAR_COLOR,
			"stroke-width" : 0
	}
	
	POPUP_DIALOG_ICON = {
			"fill" : POPUP_REGULAR_COLOR,
			"fill-opacity" : 1,
			"opacity" : 1
	}
	
	ICON_FLANNEL = {
		"fill" : "#FF0",
		"stroke-width" : 0,
		"opacity" : 0.01	
	}
	
	LABEL_TEXT = {
		"fill" : '#000',	
		"font-size" : 14,
		"font-family" : "'Helvetica Neue', HelveticaNeue, Helvetica, Arial, sans-serif",
	}
	
	ICON_BOUNDING_BOX_SIZE = 33;
	
	EDIT_ICON = 'm25.31,2.872l-3.384-2.127c-0.854-0.536-1.979-0.278-2.517,0.576l-1.334,2.123l6.474,4.066l1.335-2.122C26.42,4.533,26.164,3.407,25.31,2.872zM6.555,21.786l6.474,4.066L23.581,9.054l-6.477-4.067L6.555,21.786zM5.566,26.952l-0.143,3.819l3.379-1.787l3.14-1.658l-6.246-3.925L5.566,26.952z';
	CROP_ICON = 'm24.303,21.707V8.275l4.48-4.421l-2.021-2.048l-4.126,4.07H8.761V2.083H5.882v3.793H1.8v2.877h4.083v15.832h15.542v4.609h2.878v-4.609H29.2v-2.878H24.303zM19.72,8.753L8.761,19.565V8.753H19.72zM10.688,21.706l10.735-10.591l0.001,10.592L10.688,21.706z';
	DELETE_ICON = "m16,3.667C9.189,3.667,3.667,9.188,3.667,16S9.189,28.333,16,28.333c6.812,0,12.333-5.521,12.333-12.333S22.812,3.667,16,3.667zM16,6.667c1.851,0,3.572,0.548,5.024,1.48L8.147,21.024c-0.933-1.452-1.48-3.174-1.48-5.024C6.667,10.854,10.854,6.667,16,6.667zM16,25.333c-1.85,0-3.572-0.548-5.024-1.48l12.876-12.877c0.933,1.452,1.48,3.174,1.48,5.024C25.333,21.146,21.146,25.333,16,25.333z";
	KEY_ICON = 'M18.386,16.009l0.009-0.006l-0.58-0.912c1.654-2.226,1.876-5.319,0.3-7.8c-2.043-3.213-6.303-4.161-9.516-2.118c-3.212,2.042-4.163,6.302-2.12,9.517c1.528,2.402,4.3,3.537,6.944,3.102l0.424,0.669l0.206,0.045l0.779-0.447l-0.305,1.377l2.483,0.552l-0.296,1.325l1.903,0.424l-0.68,3.06l1.406,0.313l-0.424,1.906l4.135,0.918l0.758-3.392L18.386,16.009z M10.996,8.944c-0.685,0.436-1.593,0.233-2.029-0.452C8.532,7.807,8.733,6.898,9.418,6.463s1.594-0.233,2.028,0.452C11.883,7.6,11.68,8.509,10.996,8.944z';
	LAYOUT_ICONS = {
		"CLEAR" : 'M4.083,14H14V4.083H4.083V14zM17,4.083V14h9.917V4.083H17zM17,26.917h9.917v-9.918H17V26.917zM4.083,26.917H14v-9.918H4.083V26.917z',
		"HORIZONTAL" : 'M21.25,8.375V28h6.5V8.375H21.25zM12.25,28h6.5V4.125h-6.5V28zM3.25,28h6.5V12.625h-6.5V28z',
		"VERTICAL" : 'M2.021,9.748L2.021,9.748V9.746V9.748zM12.248,23.269h14.419V20.27H12.248V23.269zM16.583,17.019h10.084V14.02H16.583V17.019zM12.248,7.769v3.001h14.419V7.769H12.248z',
		"RIGHT" : 'M11.166,23.963L22.359,17.5c1.43-0.824,1.43-2.175,0-3L11.166,8.037c-1.429-0.826-2.598-0.15-2.598,1.5v12.926C8.568,24.113,9.737,24.789,11.166,23.963z',
		"LEFT" : 'M20.834,8.037L9.641,14.5c-1.43,0.824-1.43,2.175,0,3l11.193,6.463c1.429,0.826,2.598,0.15,2.598-1.5V9.537C23.432,7.887,22.263,7.211,20.834,8.037z',
		"UP" : 'M23.963,20.834L17.5,9.64c-0.825-1.429-2.175-1.429-3,0L8.037,20.834c-0.825,1.429-0.15,2.598,1.5,2.598h12.926C24.113,23.432,24.788,22.263,23.963,20.834z',
		"DOWN" : 'M8.037,11.166L14.5,22.359c0.825,1.43,2.175,1.43,3,0l6.463-11.194c0.826-1.429,0.15-2.598-1.5-2.598H9.537C7.886,8.568,7.211,9.737,8.037,11.166z'
	};
	
	LAYOUT_NAMES = {
			"CLEAR" : 'No Fixed Layout',
			"RIGHT" : 'Left To Right',
			"DOWN" : 'Top To Bottom',
			"HORIZONTAL" : 'Horizontal',
			"VERTICAL" : 'Vertical'
		};
	
	LABEL_ICON = 'M15.5,1.999c-1.042,0-1.916,0.377-2.57,1.088L2.895,13.138C2.302,13.784,1.999,14.58,1.999,15.5C1.999,22.943,8.057,29,15.5,29S29,22.943,29,15.5S22.943,1.999,15.5,1.999zM15.5,28C8.596,28,3,22.404,3,15.5c0-3.452,5.239-2.737,7.501-4.999C12.762,8.239,12.048,3,15.5,3C22.404,3,28,8.597,28,15.5S22.404,28,15.5,28z';
	
	DIRECTION_ICONS = {
		"CLEAR" : 'M29.342,15.5l-7.556-4.363v2.614H18.75c-1.441-0.004-2.423,1.002-2.875,1.784c-0.735,1.222-1.056,2.561-1.441,3.522c-0.135,0.361-0.278,0.655-0.376,0.817c-1.626,0-0.998,0-2.768,0c-0.213-0.398-0.571-1.557-0.923-2.692c-0.237-0.676-0.5-1.381-1.013-2.071C8.878,14.43,7.89,13.726,6.75,13.75H2.812v3.499c0,0,0.358,0,1.031,0'+
			'h2.741c0.008,0.013,0.018,0.028,0.029,0.046c0.291,0.401,0.634,1.663,1.031,2.888c0.218,0.623,0.455,1.262,0.92,1.897c0.417,0.614,1.319,1.293,2.383,1.293H11c2.25,0,1.249,0,3.374,0c0.696,0.01,1.371-0.286,1.809-0.657c1.439-1.338,1.608-2.886,2.13-4.127c0.218-0.608,0.453-1.115,0.605-1.314c0.006-0.01,0.012-0.018,0.018-0.025h2.85v2.614L29.342,15.5z',	
		"RIGHT" : 'M11.166,23.963L22.359,17.5c1.43-0.824,1.43-2.175,0-3L11.166,8.037c-1.429-0.826-2.598-0.15-2.598,1.5v12.926C8.568,24.113,9.737,24.789,11.166,23.963z',
		"LEFT" : 'M20.834,8.037L9.641,14.5c-1.43,0.824-1.43,2.175,0,3l11.193,6.463c1.429,0.826,2.598,0.15,2.598-1.5V9.537C23.432,7.887,22.263,7.211,20.834,8.037z',
		"UP" : 'M23.963,20.834L17.5,9.64c-0.825-1.429-2.175-1.429-3,0L8.037,20.834c-0.825,1.429-0.15,2.598,1.5,2.598h12.926C24.113,23.432,24.788,22.263,23.963,20.834z',
		"DOWN" : 'M8.037,11.166L14.5,22.359c0.825,1.43,2.175,1.43,3,0l6.463-11.194c0.826-1.429,0.15-2.598-1.5-2.598H9.537C7.886,8.568,7.211,9.737,8.037,11.166z'
	}
	
	DIRECTION_NAMES = {
		"CLEAR" : "No Fixed Direction",
		"UP" : "Upwards",
		"DOWN" : "Downwards",
		"LEFT" : "Left",
		"RIGHT" : "Right",
	}
	
	BASIC_CONNECTION_STYLE_ATTRS=  {
			"stroke-width" : 4,
			"fill" : "none",
			"stroke" : POPUP_REGULAR_COLOR,
			"opacity" : 1
	}; 

	BASIC_TERM_STYLE_ATTRS=  {
			"stroke-width" : 4,
			"fill" : "none",
			"stroke" : POPUP_REGULAR_COLOR,
	}; 

	
	BORDER_ICONS = {
			"true" : 'M2.379,14.729 5.208,11.899 12.958,19.648 25.877,6.733 28.707,9.561 12.958,25.308z',
			"false" : 'M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z'
	};
	
	BORDER_NAMES = {
			"true" : "Visible",
			"false" : "Invisible"
	};
	
	GROUP_ICON = 'M26,27.5H6c-0.829,0-1.5-0.672-1.5-1.5V6c0-0.829,0.671-1.5,1.5-1.5h20c0.828,0,1.5,0.671,1.5,1.5v20C27.5,26.828,26.828,27.5,26,27.5zM7.5,24.5h17v-17h-17V24.5z';
	ALIGN_HORIZ_ICON = 'M2,15h28v2h-28z M8,9h6v14h-6zM20,12h6v8h-6z'; 
	ALIGN_VERT_ICON = 'M15,2v28h2v-28z M9,8v6h14v-6zM12,20v6h8v-6z';
	PALETTE_ICON = 'M15.653,7.25c-3.417,0-8.577,0.983-8.577,3.282c0,1.91,2.704,3.229,1.691,3.889c-1.02,0.666-2.684-1.848-4.048-1.848c-1.653,0-2.815,1.434-2.815,2.926c0,4.558,6.326,8.25,13.749,8.25c7.424,0,13.443-3.692,13.443-8.25C29.096,10.944,23.077,7.25,15.653,7.25zM10.308,13.521c0-0.645,0.887-1.166,1.98-1.166c1.093,0,1.979,0.521,1.979,1.166c0,0.644-0.886,1.166-1.979,1.166C11.195,14.687,10.308,14.164,10.308,13.521zM14.289,22.299c-1.058,0-1.914-0.68-1.914-1.518s0.856-1.518,1.914-1.518c1.057,0,1.914,0.68,1.914,1.518S15.346,22.299,14.289,22.299zM19.611,21.771c-1.057,0-1.913-0.681-1.913-1.519c0-0.84,0.856-1.521,1.913-1.521c1.059,0,1.914,0.681,1.914,1.521C21.525,21.092,20.67,21.771,19.611,21.771zM20.075,10.66c0-0.838,0.856-1.518,1.914-1.518s1.913,0.68,1.913,1.518c0,0.839-0.855,1.518-1.913,1.518C20.934,12.178,20.075,11.499,20.075,10.66zM24.275,19.482c-1.057,0-1.914-0.681-1.914-1.519s0.857-1.518,1.914-1.518c1.059,0,1.914,0.68,1.914,1.518S25.334,19.482,24.275,19.482zM25.286,15.475c-1.058,0-1.914-0.68-1.914-1.519c0-0.838,0.856-1.518,1.914-1.518c1.057,0,1.913,0.68,1.913,1.518C27.199,14.795,26.343,15.475,25.286,15.475z';
	
	scale_attr = function(style) {
		var scale = 1 / get_holder_scale();
		var perform_scale = function(item) {
			if (item === undefined) {
				return undefined;
			} else if (item === null) {
				return null;
			} else if ((typeof item) === 'boolean') {
				return item;
			} else if ((typeof item) === 'string') {
				return item;
			} else if ((typeof item) === 'number') {
				return item * scale;
			} else {
				var out = {};
				$.each(item, function(k, v) {
					if (((typeof k) === 'string') && (k.indexOf("opacity") > -1)) {
						out[k]=v;
					} else {
						out[k] = perform_scale(v);
					}
				});
				
				return out;
			}
		};
		
		var out =  perform_scale(style);
		return out;
	}
	
	ARROW_END_NAMES = create_style_names(ss.linkTerminatorStyles[0]);
	ARROW_END_ICONS = create_arrow_paths(ss.linkTerminatorStyles[0]);
	ARROW_END_ATTRS = create_arrow_attrs(ss.linkTerminatorStyles[0]);
	
	function get_holder_scale() {
		return control.css_scale;
	}
	
	function get_icon_size() {
		return 33 / control.css_scale;
	}
	
	function get_padding_size() {
		return 8 / control.css_scale;
	}
	
	function get_border_content_offset() {
		return 1.5 /control.css_scale;
	}
	
	function create_style_names(styles) {
		var out = {};
		$.each(styles, function(k, v) {
			out[k] = k.toLowerCase();
		});
		
		return out;
	}

	function create_arrow_paths(styles) {
		var out = {};
		$.each(styles, function(k, v) {
			var vert_start = 10;
			var path = v.path;
			var size = 8;
			var holder_scale = get_holder_scale();
			var req_size = get_icon_size() / 2;
			var scale = req_size / size;
			var posTrans = Raphael.parseTransformString("t"+(get_icon_size()/2)+","+vert_start);
			var path3 = Raphael.transformPath(path, posTrans);
			var stemStart = v.margin.bottom + vert_start;
			var height = get_icon_size() - stemStart - 3;
			var pathStem = "M"+(get_icon_size()/2-1)+","+stemStart+"h2v"+height+"h-2v-"+height+"z";
			var pathButtB = "M3,"+vert_start+"h"+(get_icon_size()-6)+"v1h"+(-get_icon_size()+6)+"z";
			var pathButtT = "M3,3h"+(get_icon_size()-6)+"v1h"+(-get_icon_size()+6)+"z";
			var pathButtL = "M3,4v"+(vert_start-4)+"h1v"+(-vert_start+4)+"h-1z";
			var pathButtR = "M"+(get_icon_size()-4)+",4v"+(vert_start-4)+"h1v"+(-vert_start+4)+"h-1z";
			out[k] = path3+pathStem+pathButtT+pathButtB+pathButtL+pathButtR;
		});
		
		return out;
	}
	
	function create_arrow_attrs(styles) {
		var out = {};
		
		$.each(styles, function(k, v) {
			var newObject= jQuery.extend({}, v.attr, BASIC_TERM_STYLE_ATTRS);
			out[k] = newObject;
		});
		
		return out;
	}
	
	NO_STYLE = "M25.979,12.896,5.979,12.896,5.979,19.562,25.979,19.562z";
	
	kite9.selectCallbacks.push(function(s) {
		getMousePosition();
		if (s) {
			show_popups();
		} else {
			hide_popups();
		}
	});
	
	kite9.main_control.update_listeners.push(function() {
		hide_popups();
	})
	
	kite9.drag_listeners.push(function() {
		hide_popups();
	});
	
	var popup_selected_id;
	
	function show_popups() {
		hide_popups();
		
		kite9.popup_set = kite9.popup_layer.set();
		kite9.popup_anim_set = kite9.popup_layer.set();
		var k = kite9.lastSelectedId;
		popup_selected_id = k;
		var memento = kite9.main_control.objectMap[k];
		var type = memento.type;
		var pop = kite9.popup_handlers[type];
		pop(memento);	

		kite9.popup_anim_set.animate({"opacity": 1}, ANIM_SPEED, "linear", function() {});
	}
	
	function hide_popups() {
		if (kite9.popup_set !== undefined) {
			var old = kite9.popup_set;
			old.remove();
		}
		zoom_chooser_open = false;
		$("#tool-tip").hide();
		over = null;
	}
	
	/*
	 * This redefines some functions to include hiding the popups first.
	 */
	var old_movemode = kite9.setMoveMode;
	
	kite9.setMoveMode = function(active) {
		hide_popups();
		old_movemode(active);
	}
	
	var old_resize = kite9.resize;
	
	kite9.resize = function() {
		hide_popups();
		old_resize();
	}
	
	/**
	 * Returns the border shape
	 */
	function create_border(xp, yp, w, h, reversex, reversey) {
		var maxx = (xp + (w*get_icon_size()));
		
		if ((maxx > control.maxx) && (!reversex)) {
			reversex = true;
		} 
		
		
		var holder_scale = get_holder_scale();
		var p = get_padding_size();
		var is = get_icon_size();
		var pointy = get_border_content_offset();

		
		if (reversex) {
			var path = "M"+(xp)+","+(yp)+
		    "l"+(-p)+","+pointy+
			"l"+(-w*is)+",0"+
			"a"+p+","+p+",0,0,0,"+(-p)+","+p+
			"l0,"+(h*is)+
			"a"+p+","+p+",0,0,0,"+(p)+","+(p)+
			"l"+((w*is)-pointy)+",0"+
			"a"+p+","+p+",0,0,0,"+(p)+","+(-p)+
			"l0,"+(-is*h)+
			"Z";	
		} else {
			var path = "M"+(xp)+","+(yp)+
		    "l"+p+","+pointy+
			"l"+(w*is)+",0"+
			"a"+p+","+p+",0,0,1,"+p+","+p+
			"l0,"+(is*h)+
			"a"+p+","+p+",0,0,1,"+(-p)+","+(p)+
			"l"+(-(w*is)+pointy)+",0"+
			"a"+p+","+p+",0,0,1,"+(-p)+","+(-p)+
			"l0,"+(-is*h)+
			"Z";	
		}
		
			
		var r = kite9.popup_layer.path(path).attr(scale_attr(POPUP_BACKGROUND)).attr("opacity", 0);
		kite9.popup_set.push(r);
		kite9.popup_anim_set.push(r);
		return r;
	}
	
	var parent = undefined;
	
	function can_group() {
		parent = undefined;
		var ok = true;
		if (kite9.selectedCount < 1) {
			return false;
		}
		
		$.each(kite9.selectedObjects, function(k, v) {
			var par = $(kite9.main_control.objectMap[k].definition).parent().attr("id");
			if (parent === undefined) {
				parent = par;
			} else if (parent !== par) {
				ok = false;
				return;
			}
		});
		
		return ok;
	}
	
	function can_align() {
		return (kite9.selectedCount == kite9.selectedType.arrow + kite9.selectedType.glyph + kite9.selectedType.context) && (kite9.selectedCount > 1);
	}
	
	function can_palette() {
		return true;
		
	}
	
	kite9.popup_handlers['glyph'] = function(memento) {
		var box = memento.box_ri;
		var xp = box.x + box.w-(10 / get_holder_scale());
		var yp = box.y + box.h-(10 / get_holder_scale());	
		var canGroup = can_group();
		var canAlign = can_align();
		var canPalette = can_palette();
		var b = create_border(xp, yp, 3, 2, false);
		xp = b.getBBox().x;
		add_edit_icon(xp, yp, memento, 0, false);
		add_delete_icon(xp, yp, memento, 1, false, true);
		add_palette_icon(xp, yp, memento, 2, true);
		//add_crop_icon(xp, yp, memento, 2, false);
		add_group_icon(xp, yp, memento, 0, 1, canGroup);
		add_align_icons(xp, yp, memento, 1, 1, canAlign);
	};
	
	kite9.popup_handlers['arrow'] = kite9.popup_handlers['glyph'];
	
	kite9.popup_handlers['text-line'] = function(memento) {
		var box = memento.box_ri;
		var xp = mousex / get_holder_scale();
		var yp = mousey / get_holder_scale();
		var b = create_border(xp, yp, 3, 1);
		xp = b.getBBox().x;
		add_edit_icon(xp, yp, memento, 0);
		add_delete_icon(xp, yp, memento, 1);
		add_palette_icon(xp, yp, memento, 2, true);
	};
	
	kite9.popup_handlers['comp-shape'] = function(memento) {
		var box = memento.box_ri;
		var xp = mousex / get_holder_scale();
		var yp = mousey / get_holder_scale();
		var b = create_border(xp, yp, 2, 1);
		xp = b.getBBox().x;
		add_delete_icon(xp, yp, memento, 0);
		add_palette_icon(xp, yp, memento, 1, true);
	};
	
	kite9.popup_handlers['label'] = kite9.popup_handlers['text-line'];
	kite9.popup_handlers['fromLabel'] = kite9.popup_handlers['text-line'];
	kite9.popup_handlers['toLabel'] = kite9.popup_handlers['text-line'];
	
	kite9.popup_handlers['diagram'] = function(memento) {
		var box = memento.box_ri;
		var xp = mousex / get_holder_scale();
		var yp = mousey / get_holder_scale();
		var hasLabel = $(memento.definition).children("label").size() > 0;
		var b = create_border(xp, yp, 3, 1);
		xp = b.getBBox().x;
		add_edit_icon(xp, yp, memento, 0);
		add_layout_icon(xp, yp, memento, 1, b);
		add_key_icon(xp, yp, memento, 2, !hasLabel);
	}
	
	kite9.popup_handlers['context'] = function(memento) {
		var box = memento.box_ri;
		var xp = mousex / get_holder_scale();
		var yp = mousey / get_holder_scale();
		var hasLabel = $(memento.definition).children("label").size() > 0;
		var hasBorder = $(memento.definition).attr("bordered") !== 'false';
		var showLabelCreate = !hasLabel && hasBorder;
		var icons = 9;
		var canGroup = can_group();
		var canAlign = can_align();
		var b = create_border(xp, yp, 3, 3);
		xp = b.getBBox().x;
		add_edit_icon(xp, yp, memento, 0);
		add_delete_icon(xp, yp, memento, 1);
		add_palette_icon(xp, yp, memento, 2, true);
		add_group_icon(xp, yp, memento, 0, 1, canGroup);
		add_align_icons(xp, yp, memento, 1, 1, canAlign);
		add_layout_icon(xp, yp + get_icon_size() * 2, memento, 0, b);
		add_border_icon(xp, yp+ get_icon_size() * 2, memento, 1, b);
		add_label_icon(xp, yp+ get_icon_size() * 2, memento, 2, 'label', 'Label Container', showLabelCreate);
	};
	
	kite9.popup_handlers['link'] = function(memento) {
		var ri = memento.location;
		var fromPos =$(ri).children("fromDecoration").children("position"); 
		var toPos =$(ri).children("toDecoration").children("position"); 
		var fromx = +fromPos.attr("x");
		fromx = (fromx + kite9.main_control.leftOffset);
		var fromy = +fromPos.attr("y");
		fromy = (fromy + kite9.main_control.topOffset);
		
		var tox = +toPos.attr("x");
		tox = (tox + kite9.main_control.leftOffset);
		var toy = +toPos.attr("y");
		toy = (toy + kite9.main_control.topOffset);
	
		var hasFromLabel = $(memento.definition).children("fromLabel").size() > 0;
		var hasToLabel = $(memento.definition).children("toLabel").size() > 0;
		
		var fromReversed = true;
		if (fromx > tox) {
			fromReversed = false;
		}
		
		// icons on the to end
		var b1 = create_border(tox, toy, 3, 2, !fromReversed);
		var contra = $(memento.location).children("contradicting").text()=='true';
		tox = b1.getBBox().x;
		add_delete_icon(tox, toy, memento, 1, false);
		add_palette_icon(tox, toy, memento, 2, true);
		add_direction_icon(tox, toy + get_icon_size(), memento, 0, b1, false, contra);
		add_arrow_style_icon(tox, toy+ get_icon_size(), memento, 1, b1, 'toDecoration');
		add_label_icon(tox, toy+ get_icon_size(), memento, 2, "toLabel", 'Label This End', !hasToLabel);
		
		// icons on the from end
		var b2 = create_border(fromx, fromy, 3, 1, fromReversed);
		fromx = b2.getBBox().x;
		add_direction_icon(fromx, fromy, memento, 0, b2, true, contra);
		add_arrow_style_icon(fromx, fromy, memento, 1, b2, 'fromDecoration');
		add_label_icon(fromx, fromy, memento, 2, "fromLabel", "Label This End", !hasFromLabel);
	}
	
	function add_direction_icon(xp, yp, memento, i, border, reverseDirection, contradiction) {
		var type = memento.type;
		var layout = $(memento.definition).attr("drawDirection");
		if (layout == undefined) {
			layout = 'CLEAR';
		}
		
		if (reverseDirection) {
			layout = kite9.reverse_direction(layout);
		}
		
		var icon = DIRECTION_ICONS[layout];
		var attr = contradiction ? { fill: '#FFAAAA', "stroke-width" : 0} : POPUP_ICON;
		
		var r =create_standard_path(icon, xp, yp, i, function(f, r) {
			if (!zoom_chooser_open) {
				zoom_chooser(DIRECTION_ICONS, DIRECTION_NAMES, undefined, layout, function(layout) {
					// change the xml
					var def = memento.definition;
					if (reverseDirection) {
						layout = kite9.reverse_direction(layout);
					}
					layout = layout === 'CLEAR' ? null : layout;
					
					if (layout) {
						$(def).attr("drawDirection", layout);
						
						// move this element to the end of links
						$(def).detach();
						$(kite9.main_control.get_links()).append(def);
						
					} else {
						$(def).removeAttr("drawDirection");			
					}

					kite9.load(kite9.main_control, POST_URL);
				}, "Select direction For this end of the link");	
			} else {
				// user has gone with the original choice, nothing to do
				show_popups();
			}
		}, "Direction", attr);
		
	}
	
	function add_align_icons(xp, yp, memento, i, y, active) {
		
		var align_function = function(horiz) {
			// first of all, sort the selected elements into the order they will be aligned
			var toSort = [];
			$.each(kite9.selectedObjects, function(k, v) {
				var sortOb = control.objectMap[k];
				
				toSort.push({
					definition: sortOb,
					x1: sortOb.box_ri.x + sortOb.box_ri.w / 2,
					y1: sortOb.box_ri.y + sortOb.box_ri.h / 2
				});
			});
			
			if (horiz) {
				toSort.sort(function (a,b) { return a.x1 - b.x1; });
			} else {
				toSort.sort(function (a,b) { return a.y1 - b.y1; });
			}
			
			var lastOb = undefined;
			$.each(toSort, function(k, v) {
				thisOb = v.definition;
				if (lastOb !== undefined) {
					var d1 = horiz ? "RIGHT" : "DOWN";
					var d2 = horiz ? "LEFT" : "UP";
					var aligned_already = relax_links_in_direction(lastOb, d1, thisOb) || 
						relax_links_in_direction(thisOb, d2, lastOb);
					
					if (!aligned_already) {
						var c = kite9.get_connection_between(lastOb.id, thisOb.id);
						if (c!==undefined) {
							var cFrom = $(c).children("from").attr("reference");
							if (cFrom == lastOb.id) {
								$(c).attr("drawDirection", d1);
							} else {
								$(c).attr("drawDirection", d2);
							}
						} else {
							var memento = kite9.connect_between(lastOb.id, thisOb.id);
							var xml = memento.definition;
							$(xml).attr("drawDirection", d1);
							$(xml).attr("shape", "INVISIBLE");
						}
					}
				}
				lastOb = thisOb;
			});
			
			kite9.load(kite9.main_control, POST_URL);
		};
		
		var rx=create_standard_path(ALIGN_HORIZ_ICON, xp, yp + get_icon_size() * y, i, active ? function(f, r) {
			align_function(true);
		} : undefined, "Align Horizontally");
		
		var ry =create_standard_path(ALIGN_VERT_ICON, xp, yp + get_icon_size() * y, i+1, active ? function(f, r) {
			align_function(false);
		} : undefined, "Align Vertically");
		
	}
	
	function relax_links_in_direction(from, direction, idealTo) {
		var alreadyAligned = false; 
		var revDir = kite9.reverse_direction(direction);
		kite9.main_control.get_links().children().each(function (k, v) {
			var d = $(v).attr("drawDirection");
			if ((d==direction) || (d==revDir)) {
				var fromId = $(v).children("from").attr("reference");	
				var toId = $(v).children("to").attr("reference");
				if ((fromId == from.id) && (d == direction)) {
					if ((toId == idealTo.id) && (!alreadyAligned)) {
						// going to the right place
						alreadyAligned = true;
					} else if (kite9.is_link_invisible(v)){
						kite9.remove(kite9.main_control, $(v).attr("id"));
					} else {
						$(v).removeAttr("drawDirection");
					}	 				
				} else if ((toId == from.id) && (d == revDir)) {
					if ((fromId == idealTo.id) && (!alreadyAligned)) {
						alreadyAligned = false;
					} else if (kite9.is_link_invisible(v)){
						kite9.remove(kite9.main_control, $(v).attr("id"));
					} else {
						$(v).removeAttr("drawDirection");
					}	 	
				}
			}
		});
		
		return alreadyAligned;
	};
	

	function add_group_icon(xp, yp, memento, i, y, active) {
		var layout = $(memento.definition).parent().attr("layout");
		
		var group_function = function() {
			// create the new context
			hide_popups();
			var id = kite9.new_id();
			var parentOb = kite9.main_control.objectMap[parent];
			
			var toSort = [];
			
			// add selected elements to the context
			$(get_selected_ids()).each(function (k, v) {
				var ob = kite9.main_control.objectMap[v];
				var def = ob.definition;
				toSort.push({
						definition: def,
						x1: ob.flannel.getBBox().x,
						y1: ob.flannel.getBBox().y
				})
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
			
			var xml = create_content_xml(id, 'context', undefined, parentOb.definition);
			var aft = toSort[0].definition;
			$(aft).before(xml);
			if (layout!='CLEAR') {
				$(xml).attr("layout", layout);
			}
			$(xml).attr("bordered", "true");
			kite9.create(id, xml, 'context', kite9.main_control);
			
			$(toSort).each(function (k, v) {
				$(xml).append(v.definition);
			});
		
			kite9.load(kite9.main_control, POST_URL);
		}
		
		
		var r =create_standard_path(GROUP_ICON, xp, yp + get_icon_size() * y, i, active ? function(f, r) {
			group_function();
		} : undefined, "Group");
	}
	
	function add_label_icon(xp, yp, memento, i, type, tool_tip_text, active) {
		var r =create_standard_path(LABEL_ICON, xp, yp, i, active ? function() {
			hide_popups();
			var id = kite9.new_id();
			var label = kite9.create(id, create_content_xml(id, type, "My New Label", memento.definition), type, kite9.main_control);
			label.deleteOnCancel = true;
			kite9.open_properties_dialog(id);
		} : undefined, tool_tip_text);
	}
	
	function add_key_icon(xp, yp, memento, i, active) {
		var r =create_standard_path(KEY_ICON, xp, yp, i, active ? function() {
			hide_popups();
			var id = kite9.new_id();
			kite9.create(id, create_content_xml(id, 'key', "My New Key", memento.definition), 'key', kite9.main_control);
			kite9.load(kite9.main_control, POST_URL);
		} : undefined, "Add Diagram Key");
	}
	
	
	function add_edit_icon(xp, yp, memento, i) {
		var r =create_standard_path(EDIT_ICON, xp, yp, i, function() {
			hide_popups();
			var type = memento.type;
			var toOpen = memento.id;
			kite9.open_properties_dialog(popup_selected_id);
		}, "Edit");
	}
	
	function add_crop_icon(xp, yp, memento, i) {
		var r =create_standard_path(CROP_ICON, xp, yp, i, function() {
			
		}, "Size");
	}
	
	function add_palette_icon(xp, yp, memento, i, active) {
		var r =create_standard_path(PALETTE_ICON, xp, yp, i, active ? function() {
			kite9.init_palette();
		} :undefined, "Style Settings");
	}
	
	function get_selected_ids() {
		var ids = [];
		for (var id in kite9.selectedObjects) {
			if (kite9.selectedObjects.hasOwnProperty(id)) {
				ids.push(id);
			}
		}
		
		return ids;
	}
	
	function add_delete_icon(xp, yp, memento, i) {
		var r =create_standard_path(DELETE_ICON, xp, yp, i, function() {
			hide_popups();
			$(get_selected_ids()).each(function (k, v) {
				kite9.remove(kite9.main_control, v);
			});
			kite9.load(kite9.main_control, POST_URL);
		}, "Remove");
	}
	
	function add_arrow_style_icon(xp, yp, memento, i, border, elementName) {
		var type = memento.type;
		var layout = $(memento.definition).children(elementName).text();
		if (layout == "") {
			layout = 'NONE';
		};
		var icon = ARROW_END_ICONS[layout];
		
		if (icon == '') {
			icon = NO_STYLE;
		}
		
		var r =create_standard_path(icon, xp, yp, i, function(f, r) {
			if (!zoom_chooser_open) {
				zoom_chooser(ARROW_END_ICONS, ARROW_END_NAMES, ARROW_END_ATTRS, layout, function(layout) {
					// change the xml
					
					if ($(memento.definition).children(elementName).length == 0) {
						$(memento.definition).addXMLTag(elementName).text(layout);
					} else {
						$(memento.definition).children(elementName).text(layout);
					}

					kite9.load(kite9.main_control, POST_URL);
				}, "Select style for end of link");	
			} else {
				// user has gone with the original choice, nothing to do
				show_popups();
			}
		}, "Style End");
	}

	function add_border_icon(xp, yp, memento, i, border) {
		var type = memento.type;
		var layout = $(memento.definition).attr("bordered");
		if (layout == undefined) {
			layout = 'true';
		}
		
		var icon = BORDER_ICONS[layout];
		
		var r =create_standard_path(icon, xp, yp, i, function(f, r) {
			if (!zoom_chooser_open) {
				zoom_chooser(BORDER_ICONS, BORDER_NAMES, undefined, layout, function(layout) {
					// change the xml
					var def = memento.definition;
					$(def).attr("bordered", layout);
					

					kite9.load(kite9.main_control, POST_URL);
				}, "Container Border");	
			} else {
				// user has gone with the original choice, nothing to do
				show_popups();
			}
		}, "Container Border");
	}
	
	function add_layout_icon(xp, yp, memento, i, border) {
		var type = memento.type;
		var layout = $(memento.definition).attr("layout");
		if (layout == undefined) {
			layout = 'CLEAR';
		}
		
		var icon = LAYOUT_ICONS[layout];
		
		var r =create_standard_path(icon, xp, yp, i, function(f, r) {
			if (!zoom_chooser_open) {
				zoom_chooser(LAYOUT_ICONS, LAYOUT_NAMES, undefined, layout, function(layout) {
					// change the xml
					var def = memento.definition;
					layout = layout === 'CLEAR' ? null : layout;
					
					if (layout) {
						$(def).attr("layout", layout);
					} else {
						$(def).removeAttr("layout");			
					}

					kite9.load(kite9.main_control, POST_URL);
				}, "Select layout for the container");	
			} else {
				// user has gone with the original choice, nothing to do
				show_popups();
			}
		}, "Layout");
	}
	
	function create_path(paper, set, anim_set, p, xp, yp, w, click_function, tip_text, attr) {
		 var sx = xp;
		 var sy = yp;
		 var r = paper.path(p).attr(scale_attr(POPUP_ICON));
		 
		 if (attr) {
			 r.attr(scale_attr(attr));
		 }
		 
		 r.attr("opacity", 0);
		 
		 var f = paper.rect(sx, sy, w, w).attr(scale_attr(ICON_FLANNEL));
		 if (click_function) {
			 f.mouseover(function () {
				 r.animate({"fill": POPUP_HIGHLIGHT_COLOR, "stroke" : POPUP_HIGHLIGHT_COLOR }, ANIM_SPEED, "linear");
			 });
			  
			 f.mouseout(function() {
				 r.animate({"fill": POPUP_REGULAR_COLOR, "stroke" : POPUP_REGULAR_COLOR}, ANIM_SPEED, "linear");
			 });
			 
			 f.click(function() {
				 click_function(f, r);
			 })
		 } else {
			 r.attr({fill: POPUP_INACTIVE_COLOR});
		 }
			 
		 var box = r.getBBox();
		 var scale = w / ICON_BOUNDING_BOX_SIZE;
		 var trans = 't'+(xp+(w-ICON_BOUNDING_BOX_SIZE)/2)+','+(yp+(w-ICON_BOUNDING_BOX_SIZE)/2)+"S"+scale;
		 r = r.transform(trans);
		 set.push(r);
		 set.push(f);
		 anim_set.push(r);
		 
		 
		 if (tip_text) {
			 createToolTip(f, tip_text);
		 }
		 
		 
		 return f;
	}
	
	
	function create_standard_path(p, xp, yp, i, click_function, tool_tip_text, attr) {
		var pointy = get_border_content_offset();
		var w = (i*get_icon_size())+get_padding_size()+pointy;
		return create_path(kite9.popup_layer, kite9.popup_set, kite9.popup_anim_set, p, xp+w, yp+get_padding_size()+pointy, get_icon_size(), click_function, tool_tip_text, attr);
	}
	
	
	var zoom_paper = Raphael('zoom_chooser_paper');
	$('#zoom_chooser_dialog').dialog({
		resizable: false,
		autoOpen: false,
		modal: true,
		position: ['center', 20],
		buttons: {
			"Cancel": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	/**
	 * Zooms the user in on the chosen zoom_shape, and allows them to select one.
	 * Now using a separate paper and a dialog
	 */
	function zoom_chooser(icon_map, label_map, attr_map, chosen, action_function, caption) {
		zoom_chooser_open = true;
		
		hide_popups();
		
		var choices = 0;
		$.each(label_map, function(k, v) {
			choices++;
		});
		
		var icon_zoomed_width = 100;
		var label_height = 15;
		var caption_height = 15;
		var padding = 8;
		var total_width = icon_zoomed_width * choices;
		var total_height = 170;
		var sx = 0, sy = 0;
		
		zoom_paper.clear();
		var set = zoom_paper.set();
		var anim_set = zoom_paper.set();
		var index = 0;
		var caption_y = 140;
		var text_set = zoom_paper.set();
		

		zoom_paper.canvas.setAttribute("viewBox", "0 0 "+total_width+" "+total_height);
		zoom_paper.setSize(total_width, total_height);
		
		$('#zoom_chooser_dialog')
		.dialog('option', 'title', caption)
		.dialog({width: total_width+30})
		.dialog("open"); 
		
		$.each(label_map, function(k, v) {
			var label = v;
			var icon = icon_map[k];
			var attr = attr_map === undefined ? undefined : attr_map[k];
			
			var ix = sx + (icon_zoomed_width * index);
			create_path(zoom_paper, set, anim_set, icon, ix+padding, sy+padding+caption_height, icon_zoomed_width, function(f, r) {
					$('#zoom_chooser_dialog').dialog("close"); 
					action_function(k);
			}, undefined, attr);
			
			
			var text = zoom_paper.text(ix+padding+icon_zoomed_width/2, caption_y, label)
				.attr({"text-anchor" : "middle"})
				.attr(LABEL_TEXT)
				.attr({x: ix+padding+icon_zoomed_width/2, y: caption_y, height: 20, width: 100});
			
			text_set.push(text);
			
			index ++;
		});
		

		anim_set.attr(POPUP_DIALOG_ICON);
	
	}


	
	var over = '';
	var tipText = '';
	
	/**
	 * Sets up tool tips
	 */
	function createToolTip(f, txt){
	    f.mouseover(function() {
	    	over = txt;
	    	var box = f.getBBox();
	    	var holder = kite9.main_control.element.position();
	    	
	    	var screen_left = holder.left + (box.x * get_holder_scale()) + 15;
	    	var screen_top = holder.top + (box.y * get_holder_scale()) + 35;
	    	
	        tip.css("left", screen_left).css("top",screen_top);
	        tip.text(txt);
	    	window.setTimeout(function() {
	    		if (over === txt) {
	    	        tipText = txt;
	    	        tip.fadeIn();
	    		}
	    	}, 500);
	     }).mouseout(function(){
	        tip.fadeOut(0);
	        over = false;
	     });
	 }
}

