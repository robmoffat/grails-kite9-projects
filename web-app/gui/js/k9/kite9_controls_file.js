/**
  * Save/Load/etc controls for Kite9 gui
 */
function setup_controls_file(kite9) {
	
	PUBLISH_URL = "publish.html";
	VIEW_URL = "view";
	EMPTY_URL = 'gui/empty.sxml';

	
	$('#file_span').buttonset();
	
	function show_file_menu() {
		kite9.hide_menus('#file-frame');
		$('#file-frame').css({"visibility": "visible", "z-index" : 50, top: "45px"}).animate({"opacity" : 1}, 150);
	}
	
	function is_file_menu_visible() {
		var depth = $('#file-frame').css("visibility");
		return (depth != 'hidden');
	}
	
	$('#file').button({
		text: true, 
		icons : {
			primary : "ui-icon-folder-open"
		}
	}).click(function () {
		if (is_file_menu_visible()) {
			kite9.hide_menus();
		} else {
			show_file_menu();
		}
	});	
	
	$('#file-menu-close').click(function() {
		kite9.hide_menus();
	});
	
	$('#login').dialog({
		resizable: false,
		autoOpen: false,
		width: 600,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Done": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	$('#save_limit').dialog({
		resizable: false,
		autoOpen: false,
		width: 600,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Done": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	$('#user_tabs').tabs();
	
	$('#user_tabs-1').get('/kite9_registration');
	
	$('#upgrade').dialog({
		resizable: false,
		autoOpen: false,
		width: 600,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Continue": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	// xml stuff
	
	var code_editor = null;
	
	$('#edit-xml-dialog').dialog({
		resizable: false,
		autoOpen: false,
		width: 600,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Ok": function() { 
				// submit it back
				code_editor.toTextArea();
				code_editor = null;
				kite9.load(kite9.main_control, POST_URL, $("#edit-xml").val());
				$(this).dialog("close"); 
			}, 
			"Cancel": function() { 
				code_editor.toTextArea();
				code_editor = null;
				$(this).dialog("close"); 
			} 
		},
		close: function() {
			if (code_editor !== null) {
				code_editor.toTextArea();
				code_editor = null;
			}
		}
	});
	
	$('#edit_xml').click(function () {
		kite9.hide_menus()
		$('#edit-xml-dialog').dialog('open');
		 code_editor = CodeMirror.fromTextArea(document.getElementById('edit-xml'), {
			 mode: {name: "xml"},
		     lineNumbers: true
			  });
	}).attr('title','View the XML definition for this diagram');
	
	// keeps the xml editor up-to-date with changes
	kite9.main_control.update_listeners.push(function() {
		$('#edit-xml').val(kite9.main_control.get_xml());
	});

	
	// bug dialog
	
	$('#submit_bug').click(function () {
		kite9.hide_menus()
         var title = encodeURI("Problem in GUI");
         var body = encodeURI("Problem with Diagram: "+location.href);
         body = body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
         bug = window.open("mailto:support@kite9.com?subject="+title+"&body="+body);
	 }).attr('title', 'Report a problem with Kite9 Designer');

	// publish
	$('#image').click(function () {
		kite9.hide_menus();
		if (!is_logged_in()) {
			$('#login').dialog("open");
			return;
		}
		//myWin = window.open("", "Kite9 Output");
		var serializedXml = kite9.main_control.get_xml();
		
		$.ajax({
			type: "POST",
			url: PUBLISH_URL,
			dataType: "text",
			data: {
				code: serializedXml,
				style: kite9.main_control.stylesheet
			},
			success: function(htmlText) {
				if (htmlText.indexOf("form=") == 0) {
					var form = htmlText.substring(5);
					$('#'+form).dialog("open");
				} else {
					window.location = VIEW_URL+"/"+htmlText+"/"+kite9.main_control.stylesheet+".html";				
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert(textStatus+" "+errorThrown);
				//alert(serializedXml);
			}
		});
	});
	
	$('#image').attr('title','View the completed diagram as a rendered image');
	
	// saving
	$('#diagram-name-dialog').dialog({
		resizable: false,
		autoOpen: false,
		width: 600,
		position: ['center', 20],
		modal: true,
		buttons: {
			"OK" : function() {
				var newName = $('#diagram-name').val();
				$(kite9.main_control.theDiagram).children().attr("name", newName);
				$('#diagram-name-dialog').dialog("close");
				kite9.load(kite9.main_control);
			},
			"Cancel": function() { 
				$(this).dialog("close"); 
			}
		}
	});
	
	function user_has_capacity() {
		var result = false;
		$.ajax({  
			  url: "mgt/user-can-save",  
			  dataType: 'json',  
			  async: false,  
			  success: function(data){  
				  result = data;
			  }
		});
		var out = result > 0;
		return out;
	}
	
	function is_logged_in() {
		var user = undefined;

		$.ajax({  
			  url: "mgt/user-details",  
			  dataType: 'json',  
			  async: false,  
			  success: function(data){  
				  user = data;
			  }
		});
		var out = user.number != -1;
		return out;
	}
	
	
	function get_diagram_saved_name() {
		var existingName = $(kite9.main_control.theDiagram).children().attr("name");
		return existingName;
	}
	
	$('#save').click(function() {
		kite9.hide_menus();
		if (is_logged_in()) {
			var existingName = get_diagram_saved_name();
			if (!existingName) {
				// check user has capacity to save
				if (!user_has_capacity()) {
					$('#save_limit').dialog("open");
					return;
				}
				existingName = "Enter a name here";
			}
			$('#diagram-name-dialog').dialog("open");
			$('#diagram-name').val(existingName);
		} else {
			$('#login').dialog("open");
		}
	});
	
	$('#load').dialog({
		resizable: false,
		autoOpen: false,
		width: 600,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Open" : function() {
				var selected = $('#load_diagram_list li.ui-selected');
				if (selected.size() > 0) {
					var hash = selected.attr("id");
					kite9.load(kite9.main_control, "view/"+hash+"/"+kite9.main_control.stylesheet +".xml");
					$(this).dialog("close"); 
				}
			},
			"Cancel": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	kite9.main_control.update_listeners.push(function() {
		var diagramName = get_diagram_saved_name();
		if (diagramName) {
			$('#save').html("Rename...");
		} else {
			$('#save').html("Save...");
		}
	});
	
	$('#open').click(function() {
		kite9.hide_menus();
		$("#load .ui-dialog-buttonpane button:contains('Open')").button("disable");
		var action = function() {
			var to = $('#load_diagram_list').empty();
			$.getJSON("mgt/list-user-diagrams", function(data) {
				var some = false;
				$.each(data, function(k, v) {
					var modified = new Date(v.lastModified);
					var file = to.append('<li class="diagram-file" id="'+v.lastHash+'"><strong>'+v.name+'</strong> Last Updated: '+modified+"</li>");
					some = true;
				});
				
				if (!some) {
					to.append("<p>You have no saved diagrams</p>");
				}
			})
			
			to.selectable({ 
					selected: function(event, ui) {
						$(ui.selected).siblings().removeClass("ui-selected");
					},
			
			});
			$('#load').dialog("open");
		};
		
		if (is_logged_in()) {
			if (get_diagram_saved_name()) {
				action();
			} else {
				kite9.not_saved_ok = action;
				$('#not-saved').dialog("open");
			}
		
		} else {
			$('#login').dialog("open");
		}
	});
	
	
	// new diagram
	
	kite9.not_saved_ok = function() {};
	
	$('#not-saved').dialog({
		resizable: false,
		autoOpen: false,
		width: 400,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Ok" : function() {
				kite9.not_saved_ok();
				$(this).dialog("close"); 
			},
			"Cancel": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	$('#clear').click(function () {
		kite9.hide_menus();
		if (get_diagram_saved_name()) {
			delete kite9.main_control.keep_scale;
			kite9.load(kite9.main_control, EMPTY_URL);
		} else {
			kite9.not_saved_ok = function() {
				delete kite9.main_control.keep_scale;
				kite9.load(kite9.main_control, EMPTY_URL);
			}
			$('#not-saved').dialog("open");
		}
	}).attr("title","Start again with a clean sheet");

	
}	