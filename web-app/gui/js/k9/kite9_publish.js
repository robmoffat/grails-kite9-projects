function setup_controls(image_url, page_url, pdf_url) {
	
	var base_url = location.href;
	
	if (base_url.indexOf("?") > -1) {
		base_url = base_url.substring(0, base_url.indexOf("?"));
	}
	
	
	$('#share').button({
		
	}).click(function (){
		$('#share-dialog').dialog("open");
	});
	

	$('#share-dialog').dialog({
		autoOpen: false,
		width: 600,
		modal: true,
		buttons: {
			"Close": function() { 
				$(this).dialog("close"); 
			} 
		}
	});
	
	$('#size').button({
		
	}).click(function (){
		$('#size-dialog').dialog("open");
		var width = $("#img").width();
		var height = $("#img").height();
		$('#aspect').val(width / height)
		$('#width').val(width);
		$('#height').val(height);
	});
	
	$('#size-dialog').dialog({
		autoOpen: false,
		width: 300,
		position: ['center', 20],
		modal: true,
		buttons: {
			"Change" : function() {
				location.href=base_url+"?width="+$('#width').val();
			},
			"Cancel": function() { 
				$(this).dialog("close"); 
			},
		}
	});
	
	$('#width').change(function() {
		var width = $("#width").val();
		var aspect = $('#aspect').val();
		$('#height').val(Math.round(width / aspect));
	});
	
	$('#height').change(function() {
		var height = $("#height").val();
		var aspect = $('#aspect').val();
		$('#width').val(Math.round(height * aspect));
	});
	
	
	
	var holder = $('#img-holder img').get(0) 
	
	var width = holder.clientWidth;
	var pageHeight = holder.clientHeight + 30;
	var imageHeight = holder.clientHeight;
	
	$('#img-holder').css("width", width);
	$('#share_embedded_dropdown').val('<iframe style="width: '+width+'px; height: '+pageHeight+'px" src="'+page_url+'"></iframe>');
	$('#share_image_dropdown').val('<img style="width: '+width+'px; height: '+imageHeight+'px" src="'+image_url+'"></img>');
	$('#share_url_dropdown').val(image_url);
	
	$('#stylesheet').selectBox().change(function () {
		var stylesheet = $(this).val();
		if (stylesheet !== '') {
			location.href = stylesheet+".html";
		}
	});
	
	$('#download-pdf').button({
		text : true,
		icons : {
			primary : "ui-icon-circle-arrow-s"
		},
		disabled: false
	}).click(function () {
		window.open(pdf_url);
	});
	
	$('#download-png').button({
		text : true,
		icons : {
			primary : "ui-icon-circle-arrow-s"
		},
		disabled: false
	}).click(function () {
		window.open(image_url);
	});
	
}



