/**
  * Editor controls for Kite9 gui
 */
function setup_controls_main(kite9) {
	
	kite9.writers = [];
	kite9.populaters = [];	
	kite9.nextId = 0;
	
	kite9.new_id = function() {
		do {
			var id = "id_"+kite9.nextId;
			kite9.nextId = kite9.nextId+1;
		} while (kite9.main_control.objectMap[id] !== undefined);
		
		return id;
	}

	create_list_content_html = function(id, type, label) {
		var out = '<li id="'+id+'" class="'+type+'"><span class="ui-icon ui-icon-arrowthick-2-n-s handle"></span>';
		if (type==='text-line') {
			out = out + '<textarea class="editable text ui-widget-content ui-corner-all">'+label+'</textarea>';
			out = out + '<ol class="symbols-list ui-widget-content ui-corner-all" id="text-line-edit-'+id+'"></ol>';
		} else if (type==='divider'){
			out = out + '<hr />';
		} else {
			out = out + '<textarea class="editable text full-width ui-widget-content ui-corner-all">'+label+'</textarea>';
		}
		
		out = out + '</li>';	
		return out;
	}
	
	create_content_xml = function(id, type, label, on, from, to, fromType, toType) {
		if (type=='glyph') {
			doc = on.ownerDocument;
			glyph = doc.createElement("glyph");
			on.appendChild(glyph);
			glyph.setAttribute("id", id);
			labelEl = doc.createElement("label");
			glyph.appendChild(labelEl);
			text = doc.createTextNode(label);
			labelEl.appendChild(text);
			return glyph;
		} else if (type=='arrow') {
			doc = on.ownerDocument;
			arrow = doc.createElement("arrow");
			on.appendChild(arrow);
			arrow.setAttribute("id", id);
			labelEl = doc.createElement("label");
			arrow.appendChild(labelEl);
			text = doc.createTextNode(label);
			labelEl.appendChild(text);
			return arrow;
		} else if (type=='context') {
			doc = on.ownerDocument;
			ctx = doc.createElement("context");
			on.appendChild(ctx);
			if (label) {
			labelel = doc.createElement("label");
				ctx.appendChild(labelel);
				ctx.setAttribute("id", id);
				$(labelel).attrNS("http://www.w3.org/2001/XMLSchema-instance", "xsi", "type","text-line");
				text = doc.createElement("text");
				labelel.appendChild(text);
				textVal = doc.createTextNode(label);
				text.appendChild(textVal);
			}
			return ctx;
		} else if (type=='text-line') {
			var out = $(on).addXMLTag("text-line");
			out.addXMLTag("text").text(label);
			out.addXMLTag("symbols");
			return out;
		} else if (type=='divider') {
			var out = $(on).addXMLTag("comp-shape");
			out.attr("shape", "divider");
			return out;
		} else if (type=='link') {
			fromType = (fromType === undefined) ? kite9.main_control.objectMap[from].type : fromType;
			toType = (toType === undefined) ? kite9.main_control.objectMap[to].type : toType;
			
			var out = $(on).addXMLTag("link");
			out.attr("id", id);
			$(out).addXMLTag("from").attrNS("http://www.w3.org/2001/XMLSchema-instance", "xsi", "type", fromType).attr("reference", from);
			$(out).addXMLTag("to").attrNS("http://www.w3.org/2001/XMLSchema-instance", "xsi", "type", toType).attr("reference", to);
			return out;
		} else if ((type=='fromLabel') || (type=="toLabel") || (type=='label')) {
			doc = on.ownerDocument;
			labelel = doc.createElement(type);
			on.appendChild(labelel);
			labelel.setAttribute("id", id);
			$(labelel).attrNS("http://www.w3.org/2001/XMLSchema-instance", "xsi", "type","text-line");
			text = doc.createElement("text");
			symbols = doc.createElement("symbols");
			labelel.appendChild(text);
			labelel.appendChild(symbols);
			textVal = doc.createTextNode(label);
			text.appendChild(textVal);
			return labelel;
		} else if (type =='key') {
			doc = on.ownerDocument;
			labelel = doc.createElement("label");
			on.appendChild(labelel);
			labelel.setAttribute("id", id);
			$(labelel).attrNS("http://www.w3.org/2001/XMLSchema-instance", "xsi", "type","key");
			text = doc.createElement("boldText");
			labelel.appendChild(text);
			textVal = doc.createTextNode(label);
			text.appendChild(textVal);
		}
	}
	
	// menu setup
		
	function add_nested(depth, v, type) {
		var tab = "";
		var id = $(v).attr("id");
		var label = $(v).children("label").children("text").text();

		if (!label) {
			label = "("+type+")";
		}
		
		for ( var int = 0; int < depth; int++) {
			tab = tab + "-";
		}

		
		
		$('#move-container').append($("<option>", {value: id}).text(tab+label));
		
		$(v).children("context").each(function (k, v) {
			add_nested(depth+1, v, "context");
		});
		
	}

	$('#split').button({
		text: true,
		icons : {
			primary : "ui-icon-arrow-4"
		}
	}).click(function() {
		if (splitOk()) {
			ids = get_selected_ids();
			$('#context-split-id').val(ids[0]);
			$('#split-context').dialog("open");
		} else {
			$('#split-context-info').dialog("open");			
		}
	});
	
	$('#split').attr("title", "For splitting contexts or connections\ninto smaller parts");
	
	function splitOk() {
		if (kite9.selectedCount != 1) {
			return false;
		}
		
		if ((kite9.selectedType['context'] != 1) && (kite9.selectedType['diagram'] != 1)) {
			return false;
		}
		
		ids = get_selected_ids();
		var def = kite9.main_control.objectMap[ids[0]].definition;
		
		var contents = $(def).find("glyph, context");
		
		if (contents.size() > 0) {
			return false;
		}
		
			
		return true;
	}
	
	kite9.open_properties_dialog = function(toOpen) {
		if (toOpen === undefined) {
			if (kite9.selectedCount === 0) {
				toOpen = $(kite9.main_control.theDiagram).find("diagram").attr("id");
			} else {
				for (var id in kite9.selectedObjects) {
					if (kite9.selectedObjects.hasOwnProperty(id)) {
						toOpen = id;
						break;
					}
				}
			}
		}
		
		kite9.unselect_all();
		var object = kite9.main_control.objectMap[toOpen];
		var type = object.type;
		
		// label opens the container
		if ((type==='label') || (type === 'fromLabel') || (type==='toLabel')) {
			type = $(object.definition).attrNS("http://www.w3.org/2001/XMLSchema-instance", "xsi", "type");
		}
		
		var dialog_id = "#"+type+"-edit-dialog";
		var pop = kite9.populaters[type];
		pop(toOpen);
		$(dialog_id).dialog("open");
		$(dialog_id+" textarea").autoGrow();
	}
	
	$('#properties').attr('title','Change layout or content properties');
	
	kite9.is_link_invisible = function(xml) {
		var ls = $(xml).attr("shape");
		var invisible = false;
		if ((ls != undefined) && (ls != '')) {
			var style = kite9.override_style('linkStyles')[0][ls];
			invisible = style.invisible;
		}
		
		return invisible;
	}
	
	kite9.get_connection_between = function(id1, id2) {
		var directed_invis_match = undefined;
		var directed_match = undefined;
		var undirected_match = undefined;
		
		$(kite9.main_control.get_links()).children().each(function (k, v) {
			var ch1 = $(v).children("[reference='"+id1+"']");
			var ch2 = $(v).children("[reference='"+id2+"']");
			if ((ch1.size() > 0) && 
				(ch2.size() > 0)) {
				
				if ($(v).attr("drawDirection")) {
					var ls = $(v).attr("style");
					if (kite9.is_link_invisible(v)) {
						directed_invis_match = v;
					} else {
						directed_match = v;
					}
				} else {
					undirected_match = v;
				}
			}
		});
		
		if (directed_invis_match) {
			return directed_invis_match;
		} else if (directed_match) {
			return directed_match;
		} else if (undirected_match) {
			return undirected_match;
		} else {
			return undefined;
		}
	}
	
	kite9.selectCallbacks.push(function(s) {
		if ((kite9.selectedCount < 2) && (kite9.selectedType['link'] ==0)) {
			$("#properties").button("enable");
		} else {
			$("#properties").button("disable");			
		}
	});
	
	kite9.reverse_direction = function(d) {
		
		switch (d) {
		case "LEFT":
			return "RIGHT";
		case "UP": 
			return "DOWN";
		case "DOWN":
			return "UP";
		case "RIGHT":
			return "LEFT";
		}
		
		return d;
	};
	
	kite9.connect_between = function(id1, id2) {
		var id = kite9.new_id();
		var existing = kite9.get_connection_between(id1, id2);
		var xml = create_content_xml(id, 'link', null, kite9.main_control.get_links(), id1, id2);
		if (kite9.is_link_invisible(existing)) {
			var direction = $(existing).attr("drawDirection");
			var reverse = $(existing).children("to").attr("reference") == id1;
			if ((direction !== undefined) && (direction !== '')) {
				if (reverse) {
					direction = kite9.reverse_direction(direction);
				}
			}
			$(xml).attr("drawDirection", direction);
			
			kite9.remove(kite9.main_control, $(existing).attr("id"));
		}
		
		var memento = kite9.create(id, xml, 'link', kite9.main_control);
		return memento;
	};
	
	function get_selected_ids() {
		var ids = [];
		for (var id in kite9.selectedObjects) {
			if (kite9.selectedObjects.hasOwnProperty(id)) {
				ids.push(id);
			}
		}
		
		return ids;
	}
	
	function get_arrow(ids) {
		var arrowDef = null;
		for ( var i = 0; i < ids.length; i++) {
			var ob = kite9.main_control.objectMap[ids[i]];
			if (ob.type === 'arrow') {
				if (arrowDef===null) {
					arrowDef = ids[i];
				} else {
					return null;  // not a single arrow, more than one
				}
			}
		}
		
		return arrowDef;
	}
	
	// prevents delete key from moving you back a page
	$(document).bind("keydown", function( eo) {
		if (eo.keyCode == 13) {  // return
			// kills all non text-area events
			
			if (eo.target.tagName.toLowerCase() === 'textarea') {
				return true;
			}
			
			eo.stopPropagation();
			return false;
		} else if (eo.keyCode === 8) { // delete 
			var interrupt = false;
			$(".dialog").each(function(k, v) {
				if ($(v).dialog("isOpen")) {
					interrupt = true;
				}
			});

			if (interrupt) {
				return ((eo.target.value !== undefined));
			}
			
			if ((kite9.selectedCount === 0) || (kite9.selectedType['diagram']===1) || (kite9.selectedType['palette']===1)){
				return;
			}
			
			$(get_selected_ids()).each(function (k, v) {
				kite9.remove(kite9.main_control, v);
			});
			
			kite9.load(kite9.main_control, POST_URL);
			
			return false;
		} else {
			return true;
		}
		
		
 	});
			
	$(document).ajaxStart(function(){
		$("body").addClass("loading");
	    $("#loading1").css("visibility", "visible");
	 }).ajaxStop(function(){
	    $("#loading1").css("visibility", "hidden");
		$("body").removeClass("loading");
	 });
	

	//context editing
		
	$.fn.addXMLTag = function(name) {		
		var out = null;
		
		$(this).each(function (k, v) {
			var doc = v.ownerDocument;
			var el = doc.createElement(name); //"http://www.kite9.org/schema/adl", name);
			v.appendChild(el);
			out = out === null ? $(el) : out.add(el);
		});
		
		return out;
	}
	
	$("#glyph-context").button({
		text : true,
		icons : {
			primary : "ui-icon-newwin"
		}
	}).click(function(){
		$("#context-edit-contents").append(create_list_content_html(kite9.new_id(), 'glyph', "New Part"));
		$("#context-edit-contents textarea").autoGrow();
		return false;
	});
	
	$("#arrow-context").button({
		text : true,
		icons : {
			primary : "ui-icon-circle-triangle-e"
		}
	}).click(function(){
		$("#context-edit-contents").append(create_list_content_html(kite9.new_id(), 'arrow', "New Connection Body"));
		$("#context-edit-contents textarea").autoGrow();
		return false;
	});
	
	$("#context-context").button({
		text : true,
		icons : {
			primary : "ui-icon-arrow-4-diag"
		}
	}).click(function(){
		$("#context-edit-contents").append(create_list_content_html(kite9.new_id(), 'context', "New Context"));
		$("#context-edit-contents textarea").autoGrow();
		return false;
	});
	
	$("#delete-context").button({
		text : true,
		icons : {
			primary : "ui-icon-trash"
		}
	}).button("disable");
	
	$("#context-edit-dialog").dialog({
		resizable: false,
		autoOpen: false,
		width: 620,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Ok": function() { 
				var id = $("#context-edit-id").val();
				kite9.writers['context'](id, this);
				$(this).dialog("close"); 
				kite9.load(kite9.main_control, POST_URL);
			}, 
			"Cancel": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	kite9.writers['context'] = function(id) {
		var object = kite9.main_control.objectMap[id];
		if (object === undefined) {
			var parentId = $('#context-edit-parent-id').val();
			object = kite9.create(id, create_content_xml(id, "context", labelVal, kite9.main_control.objectMap[parentId].definition), "link", kite9.main_control);
		}
		
		var def = object.definition;
				
		content = $("#context-edit-contents");
		write_container_contents(def, content);
	}
	
	function write_container_contents(def, content) {
		var removedElements = [];
		
		// now ensure that we write back any changes to the contents
		$(def).children("glyph,context,arrow").each(function (i, v) {
			$(v).detach();
			removedElements.push(v);
		});
		
		content.children().each(function (i, v){
			var cid = $(v).attr("id");
			var label = $(v).children("textarea").val();
			var cl = $(v).attr("class");
			var type = cl.indexOf("glyph") > -1 ? "glyph" : (cl.indexOf("arrow") > -1 ? "arrow" : "context");
			var cob = kite9.main_control.objectMap[cid];
			if (cob === undefined) {
				// ok, it's a new one
				var xml = create_content_xml(cid, type, label, def)
				kite9.create(cid, xml, type, kite9.main_control);
			} else {
				$(cob.definition).detach();
				$(def).append(cob.definition);
				// update label if needed
				if (type==="context") {
					if ($(cob.definition).children("label").size() > 0) {
						$(cob.definition).children("label").children("text").text(label);
					} else {
						$(cob.definition).addXMLTag("label").attrNS("http://www.w3.org/2001/XMLSchema-instance","xsi","type","text-line").addXMLTag("text").text(label);
					}
				} else {
					if ($(cob.definition).children("label").size()==0) {
						$(cob.definition).addXMLTag("label");
					} 
				
					$(cob.definition).children("label").text(label);
				}
				var re = $.inArray(cob.definition, removedElements);
				if (re != -1) {
					removedElements.splice(re,1);
				}
			}
		});
		
		for ( var int = 0; int < removedElements.length; int++) {
			kite9.remove(kite9.main_control, $(removedElements[int]).attr("id"));
		}
	}
	
	function setup_container_contents(def, content, containerType, contents) {
		var htmlToAdd = ''
		if (contents === undefined) {
			contents = $(def).children();
		}	
			
		$(contents).each(function (i, v) {
			var type = v.tagName;
			if ((type==="glyph") || (type === "arrow")) {
				var id = $(v).attr("id");
				var label = $(v).children("label").text();
				htmlToAdd = htmlToAdd + create_list_content_html(id, type, label);
			} else if (type=="context") {
				var id = $(v).attr("id");
				var label = $(v).children("label").children("text").text();
				htmlToAdd = htmlToAdd + create_list_content_html(id, type, label);
			}
 		});
		content.html(htmlToAdd);
		content.sortable({
			handle: ".handle"	
		});		
		var selectedCount = 0;
		content.selectable()
			.bind( "selectableselected", function(event, ui) {
				selectedCount ++;
				$("#delete-"+containerType).button("enable").click(function(e) {
						$("#"+containerType+"-edit-contents li.ui-selected").remove();
						//$( this ).dialog( "close" );
						//$("#delete-"+containerType).button("disable");
						//e.stopPropagation();
						return false;
				});
			})
			.bind( "selectableunselected", function(event, ui) {
				selectedCount --;
				if (selectedCount==0) {
					$("#delete-"+containerType).button("disable");
				}
			});
	}
	
	kite9.populaters['context'] = function(id) {
		kite9.setup_symbol_picker();
		var object = kite9.main_control.objectMap[id];
		var def = object.definition;
		
		$("#context-edit-id").val($(def).attr("id"));

		// set up contents
		content = $("#context-edit-contents");
		
		setup_container_contents(def, content, "context");
	};
	
	
	// glyph editing
	$("#glyph-edit-dialog").dialog({
			resizable: false,
			autoOpen: false,
			width: 620,
			position: ['center', 20],
			modal: true,
			buttons: {
				"Ok": function() { 
					var id = $("#glyph-edit-id").val();
					kite9.writers['glyph'](id, this);
					$(this).dialog("close"); 
					kite9.update(kite9.main_control, undefined, id); 
					kite9.load(kite9.main_control, POST_URL);
				}, 
				"Cancel": function() { 
					$(this).dialog("close"); 
				} 
			}
		}
	);
	
	// key editing
	$("#key-edit-dialog").dialog({
			resizable: false,
			autoOpen: false,
			width: 620,
			position: ['center', 20],
			modal: true,
			buttons: {
				"Ok": function() { 
					var id = $("#key-edit-id").val();
					kite9.writers['key'](id, this);
					$(this).dialog("close"); 
					kite9.update(kite9.main_control, undefined, id); 
					kite9.load(kite9.main_control, POST_URL);
				}, 
				"Cancel": function() { 
					$(this).dialog("close"); 
				} 
			}
		}
	);
	
	
	
	$("#text-line").button({
		text : true,
		icons : {
			primary : "ui-icon-newwin"
		}
	}).click(function(){
		$("#glyph-edit-contents").append(create_list_content_html(kite9.new_id(), 'text-line', "New Text Line"));
		$("#glyph-edit-contents textarea").autoGrow();

		kite9.setup_symbol_contents($("#glyph-edit-contents li:last ol"), undefined, true);
		$("#glyph-edit-contents li:last").dblclick(function() { return false;}).children("textarea").autoGrow();
		return false;
	});
	
	$('#glyph-edit-contents').dblclick(function() {
		$("#glyph-edit-contents").append(create_list_content_html(kite9.new_id(), 'text-line', "New Text Line"));
		$("#glyph-edit-contents textarea").autoGrow();
		kite9.setup_symbol_contents($("#glyph-edit-contents li:last ol"), undefined, true);
		$("#glyph-edit-contents li:last").dblclick(function() { return false;}).children("textarea").autoGrow();
		return false;
	});
	
	$("#divider").button({
		text : true,
		icons : {
			primary : "ui-icon-newwin"
		}
	}).click(function(){
		$("#glyph-edit-contents").append(create_list_content_html(kite9.new_id(), 'divider', "New Divider"));
		$("#glyph-edit-contents textarea").autoGrow();
		kite9.setup_symbol_contents($("#glyph-edit-contents li:last ol"), undefined, true);
		return false;
	});
	
	$("#delete-text-line").button({
		enabled: false,
		text: true
	}).click(function() {
		$("#glyph-edit-contents li.ui-selected").remove();
		return false;
	});
	
	$("#key-text-line").button({
		text : true,
		icons : {
			primary : "ui-icon-newwin"
		}
	}).click(function(){
		$("#key-edit-contents").append(create_list_content_html(kite9.new_id(), 'text-line', "New Text Line"));
		$("#key-edit-contents textarea").autoGrow();
		kite9.setup_symbol_contents($("#key-edit-contents li:last ol"), undefined, true);
		return false;
	});
	
	
	$("#key-delete-text-line").button({
		enabled: false,
		text: true
	}).click(function() {
		$("#key-edit-contents li.ui-selected").remove();
		return false;
	});
	
	kite9.writers['text-line'] = function(id) {
		var object = kite9.main_control.objectMap[id];
		var def = object.definition;
		$(def).find("text").text(($("#text-line-edit-label").val()));
		kite9.write_back_symbol_xml($('#text-line-edit-symbols'), $(def).children("symbols"));
	}
	
	kite9.populaters['text-line'] = function(id) {
		kite9.setup_symbol_picker();
		var object = kite9.main_control.objectMap[id];
		var def = object.definition;
		$("#text-line-edit-id").val($(def).attr("id"));
		$("#text-line-edit-label").val($(def).find("text").text()).height(20);
		kite9.setup_symbol_contents($('#text-line-edit-symbols'), $(def).children("symbols").children("symbol"), false);
	}
	
	$("#text-line-edit-label").autoGrow();
	$("#glyph-edit-label").autoGrow();
	$("#glyph-edit-stereotype").autoGrow();
	$("#key-edit-bold").autoGrow();
	$("#key-edit-normal").autoGrow();
	$("#arrow-edit-label").autoGrow();
	
	function replace_text(def, tag, text) {
		if ((text == undefined) || (text.length == 0)) {
			$(def).children(tag).remove();	
		} else {
			
		}
		var label = $(def).children(tag);
		if ($(def).children(tag).size()  == 0) {
			label = $(def).addXMLTag(tag);
		}
		label.text(text);
	}
	
	kite9.writers['glyph'] = function(id) {
		var object = kite9.main_control.objectMap[id];
		var def = object.definition;

		replace_text(def, 'label', $("#glyph-edit-label").val());
		replace_text(def, 'stereotype', $("#glyph-edit-stereotype").val());
		$(def).children('text-lines').remove();
		
		// now ensure that we write back any changes to the contents
		var text_lines = $(def).addXMLTag("text-lines").first();
		content = $("#glyph-edit-contents");
		content.children().each(function (i, v){
			if ($(v).hasClass("divider")) {
				var xml = create_content_xml(null, 'divider', null, text_lines);
				
			} else if ($(v).hasClass("text-line")) {
				var label = $(v).children("textarea").val();
				var text_xml = create_content_xml(null, 'text-line', label, text_lines);
				kite9.write_back_symbol_xml($(v).children(".symbols-list"), $(text_xml).children("symbols"));
			}
		});
		
		kite9.write_back_symbol_xml($('#glyph-edit-symbols'), $(def).children("symbols"));
	}

	kite9.populaters['glyph'] = function(id) {
		kite9.setup_symbol_picker();
		var object = kite9.main_control.objectMap[id];
		var def = object.definition;
		
		$("#glyph-edit-id").val($(def).attr("id"));
		$("#glyph-edit-label").val($(def).children("label").text()).height(20);
		$("#glyph-edit-stereotype").val($(def).children("stereotype").text()).height(20);
		
		// symbol editing
		kite9.setup_symbol_contents($('#glyph-edit-symbols'), $(def).children("symbols").children("symbol"), false);
		
		// set up contents
		content = $("#glyph-edit-contents");
		content.children().remove();
		$(def).children("text-lines").children().each(function (i, v) {
			var type = v.tagName;
			if (type==="text-line") {
				var label = $(v).children("text").text();
				var textline = $(create_list_content_html(""+i, type, label)).appendTo(content);
				textline.dblclick(function() {return false;}).children("textarea").autoGrow();
				var symbols = $(textline).children(".symbols-list");
				var xmlSymbols = $(v).children("symbols").children("symbol");
				kite9.setup_symbol_contents(symbols, xmlSymbols, false);
			} else if (type==='comp-shape') {
				var div = $(create_list_content_html(""+i, 'divider', null)).appendTo(content);
			}
 		});
		
		content.sortable({
			handle: ".handle"	
		});		
		kite9.add_selectable_behaviour(content, '#delete-text-line');
	};
	
	$("#delete-text-line").button({
		text : true,
		icons : {
			primary : "ui-icon-trash"
		}
	}).button("disable");
	
	// arrow body editing
	$("#arrow-edit-dialog").dialog({
		resizable: false,
		autoOpen: false,
		width: 620,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Ok": function() { 
				var id = $("#arrow-edit-id").val();
				var label = $("#arrow-edit-label").val();
				kite9.writers['arrow'](id, this);
				$(this).dialog("close"); 
				kite9.update(kite9.main_control, undefined, id);
				kite9.load(kite9.main_control, POST_URL);
				$("#context-edit-contents").children().each(function (k, v) {
					var testId = $(v).attr("id");
					if (testId === id) {
						$(v).replaceWith(create_list_content_html(id, "arrow", label));
					}
				});
			}, 
			"Cancel": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	kite9.writers['arrow'] = function(id) {
		var object = kite9.main_control.objectMap[id];
		var def = object.definition;
		$(def).children("label").remove();
		$(def).addXMLTag("label").text($("#arrow-edit-label").val());
	}
	
	kite9.populaters['arrow'] = function(id, dialog) {
		var object = kite9.main_control.objectMap[id];
		var def = object.definition;
		var label = $(def).children("label").text();
		
		$("#arrow-edit-id").val(id);
		$("#arrow-edit-label").val(label);
	};
	
	
	function get_short_label(prefix, ob) {
		var l = ob.type === 'context' ? $(ob.definition).children("label").text() : $(ob.definition).attr("label");

		l = jQuery.trim(l);

		if (l.indexOf("\n") > -1) {
			l = l.substr(0, l.indexOf("\n"));  // just get first line
		}
		
		if (l.length===0) {
			l = "untitled "+ob.type;
		} else {
			l = "'"+l+"'";
		}
		
		return prefix+" "+l;
	}
	
	
	
	// diagram editing
	$('#diagram-edit-symbols').button().click(function () {
		$('#symbol-picker-dialog').dialog("open");	
	});
	
	$("#diagram-edit-dialog").dialog({
		autoOpen: false,
		width: 620,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Ok": function() { 
				var id = $("#diagram-edit-id").val();
				kite9.writers['diagram'](id, this);
				$(this).dialog("close"); 
				kite9.update(kite9.main_control, undefined, id);  // redisplay
				kite9.load(kite9.main_control, POST_URL);
			}, 
			"Cancel": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	$("#text-line-edit-dialog").dialog({
		autoOpen: false,
		width: 640,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Ok": function() { 
				var id = $("#text-line-edit-id").val();
				kite9.writers['text-line'](id, this);
				$(this).dialog("close"); 
				kite9.update(kite9.main_control, undefined, id);  // redisplay
				var memento = kite9.main_control.objectMap[id];
				delete memento.deleteOnCancel;
				kite9.load(kite9.main_control, POST_URL);
			}, 
			"Cancel": function() { 
				var id = $("#text-line-edit-id").val();
				var memento = kite9.main_control.objectMap[id];
				if (memento.deleteOnCancel) {
					$(kite9.main_control.theDiagram).find('#'+id).remove();
				}
				$(this).dialog("close"); 
			} 
		}
	});
	
	$("#glyph-diagram").button({
		text : true,
		icons : {
			primary : "ui-icon-newwin"
		}
	}).click(function(){
		$("#diagram-edit-contents").append(create_list_content_html(kite9.new_id(), 'glyph', "New Part"));
		//$("#diagram-edit-contents li:last").enable_editable(function(event) { handle_edit_contained_content(event, "diagram") });
		return false;
	});
	
	$("#arrow-diagram").button({
		text : true,
		icons : {
			primary : "ui-icon-circle-triangle-e"
		}
	}).click(function(){
		$("#diagram-edit-contents").append(create_list_content_html(kite9.new_id(), 'arrow', "New Connection Body"));
		//$("#diagram-edit-contents li:last").enable_editable(function(event) { handle_edit_contained_content(event, "diagram") });
		return false;
	});
	
	$("#context-diagram").button({
		text : true,
		icons : {
			primary : "ui-icon-arrow-4-diag"
		}
	}).click(function(){
		$("#diagram-edit-contents").append(create_list_content_html(kite9.new_id(), 'context', "New Context"));
		//$("#diagram-edit-contents li:last").enable_editable(function(event) { handle_edit_contained_content(event, "diagram") });
		return false;
	});
	
	$("#delete-diagram").button({
		text : true,
		icons : {
			primary : "ui-icon-trash"
		}
	}).button("disable");
	
	kite9.populaters['key'] = function(id) {
		kite9.setup_symbol_picker();
		var object = kite9.main_control.objectMap[id];
		var def = object.definition;
		$('#key-edit-bold').val($(def).children("boldText").text());
		$('#key-edit-normal').val($(def).children("bodyText").text());
		$("#key-edit-id").val($(def).attr("id"));
		
		// set up contents
		content = $("#key-edit-contents");
		content.children().remove();
		$(def).children("symbols").children().each(function (i, v) {
			var type = v.tagName;
			if (type==="text-line") {
				var label = $(v).children("text").text();
				var textline = $(create_list_content_html(""+i, type, label)).appendTo(content);
				var symbols = $(textline).children(".symbols-list");
				var xmlSymbols = $(v).children("symbols").children("symbol");
				kite9.setup_symbol_contents(symbols, xmlSymbols, false);
			} 
 		});
		
		content.sortable({
			handle: ".handle"	
		});		
		kite9.add_selectable_behaviour(content, '#key-delete-text-line');
	}

	kite9.populaters['diagram'] = function(id) {
		kite9.setup_symbol_picker();
		var object = kite9.main_control.objectMap[id];
		var def = object.definition;
		var layout = $(def).attr("layout");
		$("#diagram-edit-id").val($(def).attr("id"));
		
		// set up contents
		content = $("#diagram-edit-contents");
		
		setup_container_contents(def, content, "diagram");
//		content.children().enable_editable(function(event) {
//				handle_edit_contained_content(event, "diagram");
//		});
		
		if (layout) {
			$("#diagram-edit-layout").val(layout).selectBox("value", layout);
		} else {
			$("#diagram-edit-layout").val("CLEAR").selectBox("value", "CLEAR");
		}
	};
	
	kite9.writers['key'] = function(id) {
		var object = kite9.main_control.objectMap[id];
		var def = object.definition;
		var boldText = $('#key-edit-bold').val();
		var bodyText = $('#key-edit-normal').val();
		
	
		var bt = $(def).children("boldText");
		if (bt.size()===0) {
			$(def).addXMLTag("boldText").text(boldText);
		} else {
			bt.text(boldText);
		}
		
		var tt = $(def).children("bodyText");
		if (tt.size()===0) {
			$(def).addXMLTag("bodyText").text(bodyText);
		} else {
			tt.text(bodyText);
		}
		
		if ($(def).children("symbols").size() === 0) {
			$(def).addXMLTag("symbols");
		}
		
		var text_lines = $(def).children("symbols").first();
		$(text_lines).children("text-line").remove();
		content = $("#key-edit-contents");
		content.children().each(function (i, v){
			var label = $(v).children("textarea").val();
			var text_xml = create_content_xml(null, 'text-line', label, text_lines);
			kite9.write_back_symbol_xml($(v).children(".symbols-list"), $(text_xml).children("symbols"));
		});
		
	}
	
	
	kite9.writers['diagram'] = function(id) {
		var object = kite9.main_control.objectMap[id];
		var def = object.definition;
		content = $("#diagram-edit-contents");
		write_container_contents(def, content);
	}
	
		
	// splash page
	
	$("#browser").dialog({
		resizable: false,
		autoOpen: false,
		width: 30,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Ok": function() { 
				$(this).dialog("close"); 
			} 
		}
	});

	$('#error').dialog({
		resizable: false,
		autoOpen: false,
		width: 600,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Ok": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	
	$("#link-info").dialog({
		resizable: false,
		autoOpen: false,
		width: 600,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Ok": function() { 
				$(this).dialog("close"); 
			} 
		}
	});

	$("#contradiction").dialog({
		resizable: false,
		autoOpen: false,
		width: 600,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Ok": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	var first_contradiction = true;
	var resolve_contradictions = true;
	
	kite9.contradiction = function(object) {
		if (resolve_contradictions) {
			if (object.type === 'link') {
				$(object.definition).removeAttr("drawDirection");
				return false;
			}
		}
		
		if (first_contradiction) {
			first_contradiction = false;
			$("#contradiction").dialog("open");
		}
		
		return true;
	};
	
	kite9.hide_menus = function(except) {
		var toHide = $('.ipad-menu');
		if (except) {
			toHide = toHide.not($(except));
		}
		toHide.animate({"opacity" : 0}, 150, "linear", function() {
			toHide.css({"visibility" : "hidden", "z-index" : -50, top: -1000});
		});
	}
	
	if (kite9.isTouch) {
		// prevents the keyboard appearing as soon as you open a dialog
		$.ui.dialog.prototype._focusTabbable = $.noop;
				
	}
	
}