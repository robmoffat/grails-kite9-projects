function setup_controls_symbols(kite9) {
	
	// symbols editing
	
	$('#edit-symbol-dialog').dialog({
		resizable: false,
		autoOpen: false,
		width: 400,
		position: ['center', 30],
		modal: true,
		buttons: {
			"Ok": function() { 
				var id = $('#edit-symbol-target-id').val();
				var theChar = $('#edit-symbol-char').val(); 
				var shape = $('#edit-symbol-shape input:checked').attr("id");
				var text = $('#edit-symbol-text').val();
				var key = theChar+shape;
				if (id === "") {
					$('#symbol-picker-list')
						.append('<li id="'+key+'"><div class="'+shape+' symbol">'+theChar+'</div></li>')
						.animate({scrollTop: $('#symbol-picker-list')[0].scrollHeight});
					
				} else {
					$("#"+id).children(".symbol")
						.text(theChar)
						.removeClass("CIRCLE HEXAGON DIAMOND")
						.addClass(shape);
					$("#"+id).children(".symbol-text").text(text);
				}
				$(this).dialog("close"); 
			}, 
			"Cancel": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	$('#symbol-add').button({
		text: true
	}).click(function() {
		$('#edit-symbol-target-id').val("");
		$('#edit-symbol-char').val("");
		$('#edit-symbol-dialog').dialog("open");
		return false;
	}); 
	
	$('#edit-symbol-shape').buttonset();
	
	$('#symbol-picker-dialog').dialog({
		resizable: false,
		autoOpen: false,
		width: 400,
		position: ['center', 30],
		modal: true,
		buttons: {
			"Ok": function() { 
				// write back selected symbols to the container
				var htmlToAdd = '';
				var containerid = $('#symbol-picker-target-id').val();
				
				if (containerid !== '') {
					$('#symbol-picker-list li.ui-selected').each(function(k,v) {
						var symId = $(v).attr("id");
						var theChar = $(v).children("div").text();
						var shape= getClass($(v).children("div").attr("class"));
						htmlToAdd = htmlToAdd + '<li id="'+symId+'" class="'+shape+' symbol">'+theChar+'</li>';
					});
					
					$('#'+containerid).html(htmlToAdd);
				}
				
				$(this).dialog("close"); 
			}, 
			"Cancel": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	kite9.setup_symbol_contents = function(list, contents, editable) {
		var htmlToAdd = '';
		var symbols = [];
		
		if (contents !== undefined) {
			$(contents).each(function (i, v) {
				var theChar = $(v).attr("theChar");
				var shape= $(v).attr("shape");
				var id = theChar+shape;
				htmlToAdd = htmlToAdd + '<li id="'+id+'" class="'+shape+' symbol">'+theChar+'</li>';
				symbols.push(theChar+shape);
	 		});
			list.html(htmlToAdd);
		}
		list.bind("click", function() {
			// populate the picker
			setup_selected_symbols("#"+list.attr("id"), list);
			$('#symbol-picker-dialog').dialog("open");	
		});
	}
	
	function setup_selected_symbols(symbol_space, target) {
		$('#symbol-picker-list li').each(function (k, v) {
			var root = $(symbol_space);
			var id = $(v).attr('id');
			if (root.find('#'+id).size()>0) {
				$(v).addClass("ui-selected");
			} else {
				$(v).removeClass("ui-selected");
				$(v).children().removeClass("ui-selected");
			}
		});
		
		var selectedCount = $('#symbol-picker-list .ui-selected').size();
		$("#symbol-delete").button(selectedCount > 0 ? "enable" : "disable");
		$("#symbol-edit").button(selectedCount === 1 ? "enable" : "disable");
		
		if (target) {
			$('#symbol-picker-target-id').val(target.attr("id"));
		}
	}
	
	kite9.setup_symbol_picker = function() {
		var htmlForPicker = '';
		var uniqueSymbols = {};
		
		$(kite9.main_control.theDiagram).find("symbol").each(function(k, v) {
			var char = $(v).attr("theChar");
			var shape = $(v).attr("shape");
			var key = char+shape;
			uniqueSymbols[key] = { char: char, shape: shape};
		});
			
			
		$.each(uniqueSymbols, function(key, val) {
			var theChar = val.char;
			var shape = val.shape;
			htmlForPicker = htmlForPicker + '<li id="'+key+'"><div class="'+shape+' symbol">'+theChar+'</div></li>';
		});
		
		$('#symbol-picker-list').html(htmlForPicker).selectable();
		
		kite9.add_selectable_behaviour($('#symbol-picker-list'), '#symbol-delete', '#symbol-edit');
		
		$('#symbol-delete').css("display", "inline-block");
	}
	
	function edit_symbol(theLi) {
		$('#edit-symbol-target-id').val($(theLi).attr("id"));
		var classStr = $(theLi).children(".symbol").attr("class");
		var shape = getClass(classStr);
		$('#edit-symbol-dialog').dialog("open");
		$('#edit-symbol-shape').children().attr("checked", false);
		$('#edit-symbol-shape').children("#"+shape).attr("checked", true).button("refresh");
		$('#edit-symbol-char').val($(theLi).children(".symbol").text());	
	}
	
	kite9.write_back_symbol_xml = function(list, target) {
		$(target).children("symbol").remove();
		
		$(list).children().each(function(k,v) {
			var id = $(v).attr("id");
			var theChar = id.substring(0, 1);
			var shape = id.substring(1);
			$(target).addXMLTag("symbol")
				.attr("theChar", theChar)
				.attr("shape", shape);
		});
		
	}
	
	function getClass(str) {
		if (str.indexOf("CIRCLE") > -1) {
			return "CIRCLE";
		} else if (str.indexOf("DIAMOND") > -1) {
			return "DIAMOND";
		} else if (str.indexOf("HEXAGON") > -1) {
				return "HEXAGON";
		}
	}
	
	kite9.add_selectable_behaviour = function(content, deleteId, editId) {
		content.selectable();
		
		var f1 = function(event, ui) {
			var selectedCount = $(content).children('.ui-selected').size();
			if (deleteId) {
				$(deleteId).button(selectedCount > 0 ? "enable" : "disable");
			} 
			if (editId) {
				$(editId).button(selectedCount === 1 ? "enable" : "disable");
			}
		};
		
		content.bind( "selectableselected", f1);
		content.bind( "selectableunselected", f1);
	}
	
	/**
	 * Adds namespace support to jQuery for xsi:type attribute
	 */
	$.fn.attrNS = function(ns, prefix, name, value) {		
		var result = this;
		$(this).each(function (k, v) {
			switch (BrowserDetect.browser) {
			case "Chrome" :
			case "Safari" :
				if (value != undefined) {
					$(v).attr(prefix+":"+name, value);	
				} else {
					result = $(v).attr(prefix+":"+name);
				}
				break;
			case "Mozilla" : /* for IE11*/
			case "Firefox" :
			case "Explorer" :
				if (BrowserDetect.version  >=9) {
					if (value !== undefined) {
						v.setAttributeNS(ns, name, value);
					} else {
						result = v.getAttributeNS(ns, name);
					}
				} else {
					result = $(v).attr(prefix+":"+name, value);	
				}
			}
		});
		
		return result;
	}
	
	
}