/**
 * This function handles:
 * 
 * Marshalling from XML to diagram elements.
 * Retrieving XML from AJAX / Files
 * Setting up a surrounding "flannel" on top of the elements, for attaching selection logic to
 * Updating when the xml underlying it changes.
 * Keeping track of the elements on the page (in the control)
 */
function setup_rendering(kite9) {
	
	POST_URL = (function() {
		return window.location.href.substring(0, window.location.href.lastIndexOf("/"))+"/sizes.xml";
	})();
	
	kite9.LINK_FLANNEL_ATTR = {	"stroke-width": 10, 
			stroke: "#FFF",
			opacity: .02,
			"fill-opacity" : .2};
	
	kite9.BOX_FLANNEL_ATTR = {	
			"stroke-width": 4, 
			stroke: "#FF0",
			opacity: .02,
			fill: "#FFF",
			"fill-opacity" : .22};
	
	kite9.ERROR_COLOUR = '#FF0000'
		
	kite9.INVISIBLE_ATTR = { 
			"stroke-width" : 1,
			stroke: "#AAF",
			"fill-opacity" : 0,
			"stroke-dasharray" : "-.."
	};
	
	kite9.is_directed_link = function(link_xml) {
		var dd= $(link_xml).attr("drawDirection");
		if ((dd!=undefined) && (dd!='')) {
			return true;
		}
		
		return false;
	};
	
	/**
	 * A useful hash function.  
	 */
	kite9.hash = function(str) {
		var hash = 0;
		if ((str == undefined) || (str==null)) {
			return hash;
		}
		
		if (str.length == 0) 
			return hash;
		    
		for (i = 0; i < str.length; i++) {
		        char = str.charCodeAt(i);
		        hash = ((hash<<5)-hash)+char;
		}

		return hash;
	};
	
	
	/**
	 * Cross - browser toXML function.
	 */
	kite9.toXML = function(xmlNode) {
		   try {
		      // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
		      return (new XMLSerializer()).serializeToString(xmlNode);
		  }
		  catch (e) {
		     try {
		        // Internet Explorer.
		        return xmlNode.xml;
		     }
		     catch (e) {  
		        //Other browsers without XML Serializer
		        alert('Xmlserializer not supported');
		     }
		   }
		   return false;
		};
	
	/**
	 * Translates the xml into some local-coordinates rendering info.
	 */
	kite9.createRectangularBounds = function(location_xml, left, top, scale, internal) {
		var pos = internal ? $(location_xml).find("internalPosition").first() : $(location_xml).find("position").first();		
		var size = internal ? $(location_xml).find("internalSize").first() : $(location_xml).find("size").first(); 
		
		var x = parseFloat(pos.attr("x"));
		var y = parseFloat(pos.attr("y"));
		var w = parseFloat(size.attr("x"));
		var h = parseFloat(size.attr("y"));
		x = x + left;
		y = y + top;
		
		return { x: x, y: y, w: w, h: h};
	};
	
	kite9.get_symbol_baseline = function(symbolSize) {
		return symbolSize;
	};
	
	kite9.lineBreakCount = function(str){
		/* counts \n */
		try {
			return((str.match(/[^\n]*\n[^\n]*/gi).length));
		} catch(e) {
			return 0;
		}
	};
	
	kite9.get_baseline = function(text, textStyle) {
		var c = kite9.lineBreakCount(text);
		return c * textStyle.height + textStyle.baseline;
	};
	
	/**
	 * Draws the collection of symbols on screen, left-to-right from x.
	 */
	kite9.drawSymbols = function(symbols, x, y, baseline, contents, control, xo, yo) {
		$(symbols).each(function (i, sym) {
	        kite9.draw_symbol($(sym).attr("theChar"), x, y+baseline, $(sym).attr("shape"), contents, control, xo, yo);
			x = x + kite9_stylesheet.interSymbolPadding;
	        x = x + kite9_stylesheet.symbolSize;
		});
	};
	
	/**
	 * xl = leftmost x point
	 * by = bottommost y point.
	 */
	kite9.draw_symbol = function(char, xl, by, shape, contents, control, xo, yo) {
		var innerSize = kite9_stylesheet.symbolSize;
		var raphShape = null;
		var symbolDef = kite9.override_style('symbolShapes')[0][shape];
		var path = symbolDef.path;
		var attr = symbolDef.attr;
		var symStyle = kite9.override_style( 'symbolTextStyle');
		var height = symStyle.height;
		var baseline = symStyle.baseline;
		var slack = innerSize - height;
	
		// draw the shape and then reposition so it sits on the line
		var newPath = kite9.shift_path(path, xl, by-height);
		raphShape = control.path(newPath, attr, undefined, xo, yo);
		contents.push(raphShape);
		var box = raphShape.getBBox();
		
		// center text in shape
		var text = control.placeStyledText(xl, by-height + (slack / 2), box.width, char, baseline, symStyle, "CENTER", contents, xo, yo);
		text.toFront();
	};
	
	/**
	 * Returns the width of the box occupied by symbols
	 */
	kite9.get_symbol_size = function(symbols, control) {
		var count = symbols.size();
		return (count * kite9_stylesheet.symbolSize ) + ((count -1) * kite9_stylesheet.interSymbolPadding);
	}
	
	
	kite9.generate_text_style = function(stylesheet, styleProperty) {
		var styles = kite9.parse_styles(styleProperty);
		var outAttr = {};
		jQuery.extend(outAttr, stylesheet.attr, styles);
		var out = {};
		out.attr = outAttr;
		var fontFamily= out.attr['font-family'];
		var fontSize = out.attr['font-size'];
		out.baseline = kite9.calculate_font_baseline(fontFamily, fontSize);
		out.height = kite9.calculate_font_height(fontFamily, fontSize);
		out.justification = stylesheet.justification;
		return out;
	}
	
	kite9.override_shape_attr = function(stylesheet_attr, styleProperty) {
		var styles = kite9.parse_styles(styleProperty);
		var outAttr = {};
		jQuery.extend(outAttr, stylesheet_attr, styles);
		return outAttr;
	}
	
	kite9.calculate_font_height = function(fontFamily, fontSize) {
		var fontLookup = kite9.get_stylesheet().fontFamilies[0][fontFamily];
		return fontLookup.heightProportion * fontSize;
	}
	
	kite9.calculate_font_baseline = function(fontFamily, fontSize) {
		var fontLookup = kite9.get_stylesheet().fontFamilies[0][fontFamily];
		return fontLookup.baselineProportion * fontSize;
	}
	
	
	
	/**
	 * Adds label, symbols and type items within a box area.
	 */
	kite9.redraw_box_contents = function (memento, new_ri, style, properties, control, center_vertically) {
		if (memento.contents === undefined) {
			memento.contents = control.paper.set();
		} else {
			memento.contents.forEach(function(item) {
				item.remove();
			});
			
			memento.contents.clear();
		}
	
		var syms = (properties.symbols !== null) && (properties.symbols !== undefined) && (properties.symbols.size() > 0);
		var symbols = properties.symbols;
		var symWidth = syms ? kite9.get_symbol_size(symbols, control) : 0;
		var yp = 0;
		memento.style = style;
		
		if (properties.stereotype) {
			var typeStyle = kite9.generate_text_style(style['typeTextFormat'], properties.typeStyle);
			if (syms) {
				// draw syms right
				var baseline = Math.max(kite9.get_symbol_baseline(kite9_stylesheet.symbolSize), 
						kite9.get_baseline(properties.stereotype, typeStyle));
 				kite9.drawSymbols(symbols, new_ri.w - symWidth, 0, baseline, memento.contents, control, new_ri.x, new_ri.y);
				control.placeStyledText(0,0, new_ri.w - symWidth, properties.stereotype, baseline, typeStyle, 'LEFT', memento.contents, new_ri.x, new_ri.y);
				memento.typeStyle = typeStyle;
			} else {
				var baseline = kite9.get_baseline(properties.stereotype, typeStyle);
				control.placeStyledText(0,0, new_ri.w, properties.stereotype, baseline, typeStyle, typeStyle.justification, memento.contents, new_ri.x, new_ri.y);	
				memento.typeStyle = typeStyle;
			}
			syms = false; // done
			yp = memento.contents.getBBox().height;
		} 
	
		if (syms) {
			var labelStyle = kite9.generate_text_style(style['labelTextFormat'], properties.labelStyle);
			var baseline = Math.max(kite9.get_symbol_baseline(kite9_stylesheet.symbolSize), 
					kite9.get_baseline(properties.label, labelStyle));
			var textHeight = labelStyle.height;
			kite9.drawSymbols(symbols, new_ri.w - symWidth, yp, baseline, memento.contents, control, new_ri.x, new_ri.y);
 			control.placeStyledText(0, yp, new_ri.w - symWidth, properties.label, baseline, labelStyle, 'LEFT', memento.contents, new_ri.x, new_ri.y);
			yp = memento.contents.getBBox().height;
			memento.labelStyle = labelStyle;
		} else if (properties.label) {
			var labelStyle = kite9.generate_text_style(style['labelTextFormat'], properties.labelStyle);
			var baseline = kite9.get_baseline(properties.label, labelStyle);
			control.placeStyledText(0, yp, new_ri.w, properties.label, baseline, labelStyle, labelStyle.justification, memento.contents, new_ri.x, new_ri.y);	
			yp = memento.contents.getBBox().height;
			memento.labelStyle = labelStyle;
		} 
		
		return new_ri;
	};
	
	/**
	 * Creates a container/glyph/part/whatever on the screen.
	 */
	kite9.drawShapeBorder = function(memento, style, path, control, bounds) {
		var moved = false;
		var sized = false;		
		var flannelAttr = kite9.override_style( kite9.BOX_FLANNEL_ATTR);
		var flannelCreated = false;

		memento.main = control.path(path, style.attr, memento.main, bounds.x, bounds.y);
		
		if (style.castsShadow) {
			memento.shad = control.createShadow(path, style.attr, memento.shad, bounds.x, bounds.y);
		} else if (memento.shad !== undefined) {
			memento.shad.remove();
			memento.shad = undefined;
		}

		var flannelCreated = memento.flannel === undefined;
		if ((path === undefined) || (path=== '')) {
			memento.flannel = control.insetRect(0, 0, bounds.w, bounds.h, 0, flannelAttr, memento.flannel, bounds.x, bounds.y);
		} else {
			memento.flannel = control.path(path, flannelCreated ? flannelAttr : null, memento.flannel, bounds.x, bounds.y);
		}
		
		if (flannelCreated && control.flannel) {
			$.each(control.flannel, function(k, v) {
				v(memento);
			});	
		}
	};
	
	/**
	 * Hashes the box content details
	 */
	kite9.hashBoxDetails = function(details, style) {
		var out = 0;
		if (details.label) {
			out += kite9.hash(details.label);
		} 
		if (details.labelStyle) {
			out += kite9.hash(details.labelStyle);
		} 
		if (details.type) {
			out += kite9.hash(details.type);
		}
		if (details.typeStyle) {
			out += kite9.hash(details.typeStyle);
		} 
		if (details.symbols) {
			out += kite9.hash(kite9.toXML(details.symbols));
		}
		if (style) {
			out += kite9.hash(details.style);
		}
		
		
		return out;
	};

	
	
	/**
	 * Creates or updates a text box on the screen
	 */
	kite9.update_box_content = function(object, location, control, style, details, changedCallbacks, newCallbacks, center_vertically) {
		var hash = kite9.hashBoxDetails(details, style);
		
		// first, handle the border creation / update
		var isNew = object.flannel === undefined;  // new, or dragged from palette
		var new_ri = kite9.createRectangularBounds(location, control.leftOffset, control.topOffset,1, false);
		var path = $(location).children("path").text();
		kite9.drawShapeBorder(object, style, path, control, new_ri);
		
		// now check the contents
		var moved = false;
		var int_ri = kite9.createRectangularBounds(location, control.leftOffset, control.topOffset,1, true);
		var changed = hash != object.hashval;
		
		if (!changed) {
			moved = (object.int_ri.x != int_ri.x) || (object.int_ri.y != int_ri.y);
			
			if (moved) {
				// move box contents
				control.move_set(object.contents, int_ri.x, int_ri.y, true, true);
			}
		} else {
			kite9.redraw_box_contents(object, int_ri, style, details, control, center_vertically, control);
		}
			
		if (isNew) {
			if (newCallbacks !== undefined) {
				$.each(newCallbacks, function (k, v) {
					v(new_ri, object);
				});
			}
		} else if ((changed || moved) && (changedCallbacks !== undefined)) {
			$.each(changedCallbacks, function (k, v) {
				v(new_ri, object);
			});
		}
		
		object.box_ri = new_ri;
		object.int_ri = int_ri;
		object.hashval = hash;
	};
	
	/**
	 * Adds the XML definition into the control.objectMap.
	 */
	kite9.create = function(id, definition, type, control) {
		var ob = control.objectMap[id];
		if (ob === undefined) {
			ob = new Object();
			control.objectMap[id] = ob;
		}
		
		if (ob.type !== type) {
			kite9.remove(control, id);
			ob = new Object();
			control.objectMap[id] = ob;
		}
		
		// extract location info from the rest of the XML.
		$(definition).children("renderingInformation").each(function (k, v) {
			ob.location = v;	
		});		
		
		$(ob.location).detach();
		ob.definition = definition;
		ob.type = type;
		ob.id = id;
		return ob;
	};
	
	kite9.remove_shapes = function(ob) {
		if (ob.shad !== undefined) {
			ob.shad.remove();
		}
		
		if (ob.shadFrom !== undefined) {
			ob.shadFrom.remove();
		}
		
		if (ob.shadTo !== undefined) {
			ob.shadTo.remove();
		}		
		
		if (ob.main != undefined) {
			ob.main.remove();
		}
		
		if (ob.mainFrom != undefined) {
			ob.mainFrom.remove();
		}
		
		if (ob.mainTo != undefined) {
			ob.mainTo.remove();
		}
		
		
		if (ob.flannel != undefined) {
			ob.flannel.remove();
		}
	}
			
	/**
	 * Handles removal of items from the diagram.  Understands that some items might be nested,
	 * and also worries about links to removed items.
	 */
	kite9.remove = function(control, id, leaveXML) {
		var ob = control.objectMap[id];
		if (ob === undefined) {
			return;
		}
		
		// undraw it
		if (ob.contents !== undefined) {
			ob.contents.remove();
			delete ob.contents;
		}
		
		kite9.remove_shapes(ob);
		
		
		if (!leaveXML) {
			// ensure links are also removed
			if ((ob.type==="arrow") || (ob.type==="glyph") || (ob.type==="context")) {
				$(control.get_links()).children().each(function (k,v) {
					var fromRef = $(v).children("from").attr("reference");
					var toRef = $(v).children("to").attr("reference");
					if ((fromRef === id) || (toRef === id)) {
						var linkAttr = $(v).attr("id"); 
						kite9.remove(control, linkAttr);
					}
				});
			}
			
			// move contained stuff into outer context
			$(ob.definition).children("glyph,context,arrow").each(function (k, v) {
				var subId = $(v).attr("id");
				try {
					$(v).detach();
					if (ob.type !== 'diagram') {
						$(ob.definition).before(v);
					}
				} catch (exception) {
					// need to delete the child too
				}
			});
			
			if (ob.type==="glyph") {
				$(ob.definition).children("text-lines text-line").each(function (k, v) {
					var subId = $(v).attr("id");
					kite9.remove(control, subId);
				});
			} else {
				// remove any labels, text-lines
				$(ob.definition).children("label,fromLabel,toLabel").each(function (k, v) {
					var subId = $(v).attr("id");
					kite9.remove(control, subId);
				});
			}
		}
		
		// run callbacks
		if (control.removed !== undefined) {
			$.each(control.removed, function(k, v) {
				v(null, ob);
			})
		}

		// get rid of the object itself
		$(ob.definition).remove();
		delete control.objectMap[id];
		
	};
	
	/**
	 * Looks for elements of a given type within the control.objectMap and displays them
	 */
	kite9.show_elements = function(type, control) {
		var f = kite9.displayers[type];
		if (type=='context') {
			// we have to handle contexts in order
			$(control.theDiagram).find("context").each(function (k, v) {
				var id = $(v).attr("id");
				var memento = control.objectMap[id];
				f(id, memento.location, control);
			});
		} else {
			$.each(control.objectMap, function(k, v) {
				if (v.type === type) {
					f(v.id, v.location, control);
				}
			});	
		}
	};
	
	kite9.layout_elements = function(xml, control, id) {
		var unusedItems = [];
		
		if (id === undefined) {
			if (control.objectMap !== undefined) {
				for (var name in control.objectMap) {
					if (control.objectMap.hasOwnProperty(name)) {
					    unusedItems.push(name);
					}
				}
			}
		
		
			// first, create the map of all items that need rendering individually
			$(xml).find("*[id]").each(function(k, v) {
				var id = $(v).attr("id");
				var ris = $(v).children("renderingInformation");
				var canRender = ris.attr("rendered") !== 'false';
				if (canRender) {
					kite9.create(id, v, v.tagName, control);
					
					var i = jQuery.inArray(id, unusedItems);
					if (i !== -1) {
						unusedItems.splice(i,1);
					}
				} else {
					// remove anything that doesn't get rendered
					$(v).remove();
				}
			});
		
			// remove anything that's no longer in the diagram
			for ( var int = 0; int < unusedItems.length; int++) {
				kite9.remove(control, unusedItems[int], true);
			}
		} else {
			// id is set - we are upating it
			var ob = control.objectMap[id];
			var f = kite9.displayers[ob.type];
			f(id, ob.location, control);
		}
		
		// run through elements in order and display
		kite9.show_elements("diagram", control);
		kite9.show_elements("context", control);
		kite9.show_elements("link", control);
		kite9.show_elements("glyph", control);
		kite9.show_elements("arrow", control);
		kite9.show_elements("fromLabel", control);
		kite9.show_elements("toLabel", control);
		kite9.show_elements("label", control);
		kite9.show_elements("text-line", control);
		kite9.show_elements("comp-shape", control);
	};

	/**
	 * Contains all the different handlers for drawing ADL elements.
	 */
	kite9.displayers = {};
	
	kite9.displayers["arrow"] = function(id, location, control) {
		var object = control.objectMap[id];
	
		kite9.update_box_content(object, location, control, 
				kite9.override_style( 'connectionBodyStyle'),
				{
					label: $(object.definition).children("label").text(),
					labelStyle: $(object.definition).children("label").attr('style')
				},	
				control.changed, 
				control.newitem,
				true
		);
		
		kite9.reorder(object);
	};
	
	kite9.displayers["glyph"] = function(id, location, control) {
		var object = control.objectMap[id];
		var hasText = $(object.definition).children("text-lines").children().size()> 0;
		var shape = $(object.definition).attr("shape");
		if ((shape === undefined) || (shape === '')) {
			shape = "DEFAULT";
		}
		var style = kite9.override_style( 'glyphBoxStyle', $(object.definition).attr("style"));
		
		kite9.update_box_content(object, location, control, 
				style,
				{
					label: $(object.definition).children("label").text(),
					labelStyle: $(object.definition).children("label").attr('style'),
					stereotype: $(object.definition).children("stereotype").text(),
					typeStyle: $(object.definition).children("stereotype").attr('style'),
					symbols: $(object.definition).children("symbols").children("symbol")
				},	
				control.changed, 
				control.newitem,
				!hasText
		);
		kite9.reorder(object);
	}
	
	kite9.displayers["context"] = function(id, location, control) {
		var object = control.objectMap[id];
		var invisible = $(object.definition).attr("bordered") === 'false';
		var scaledStyle = kite9.override_style( 'contextBoxStyle', $(object.definition).attr("style"));
		if (invisible) {
			scaledStyle.attr = kite9.override_style( kite9.INVISIBLE_ATTR);
		}
	
		kite9.update_box_content(object, location, control, scaledStyle,
				{
				},	
				control.changed, 
				control.newitem,
				false
		);
		
		kite9.reorder(object);
	};
	
	kite9.displayers["fromLabel"] = function(id, location, control) {
		var object = control.objectMap[id];
		
		kite9.update_box_content(object, location, control, 
				kite9.override_style( 'connectionLabelStyle', $(object.definition).attr("style")),
				{
					label: $(object.definition).children("text").text(),
					labelStyle: $(object.definition).children("text").attr('style'),
					symbols: $(object.definition).children("symbols").children("symbol"),
				},	
				control.changed, 
				control.newitem,
				false
		);
		
		kite9.reorder(object);
	};
	
	kite9.displayers["label"] = function(id, location, control) {
		var object = control.objectMap[id];
		var type = $(object.definition).attr("xsi:type");
		var styleAttr = $(object.definition).attr("style");
		var style = type === 'key' ? 
				kite9.override_style( 'keyBoxStyle', styleAttr) : 
				kite9.override_style( 'contextLabelStyle', styleAttr);
		var properties;
		if (type == 'text-line') {
			properties = {
					label: $(object.definition).children("text").text(),
					labelStyle: $(object.definition).children("text").attr('style'),
					symbols: $(object.definition).children("symbols").children("symbol")
					};
		} else {
			var needsDivider = $(object.definition).children("symbols").size() > 0;
			properties = {
					label: $(object.definition).children("bodyText").text(),
					labelStyle: $(object.definition).children("bodyText").attr('style'),
					stereotype: $(object.definition).children("boldText").text(),
					typeStyle: $(object.definition).children("boldText").attr('style'),
					};
		}
		
		kite9.update_box_content(object, location, control, style, properties,	
				control.changed, 
				control.newitem,
				false
		);
		
		kite9.reorder(object);
	};
	
	kite9.displayers["toLabel"] = kite9.displayers["fromLabel"];
	
	kite9.displayers["diagram"]  = function(id, location, control){
		var object = control.objectMap[id];
		var isNew = object.main === undefined;		
		var size = $(location).find("size").first(); 
		control.set_size(parseFloat(size.attr("x")), parseFloat(size.attr("y")));
		var maxx = control.maxx;
		var maxy = control.maxy;
		
		var new_ri = {x: 0, y: 0, w: control.maxx, h: control.maxy};
		object.new_ri = new_ri;
		
		if (isNew) {
			object.main = control.insetRect(0, 0, maxx, maxy, 0, undefined, object.main, 0, 0);
			object.main.attr({fill: '#FFF', "fill-opacity" : .01, stroke: "none", "stroke-width" : 0});
			object.flannel = object.main;
			$.each(control.newitem, function (k, v) {
					v(new_ri, object);
			});
			if (control.flannel) {
				$.each(control.flannel, function(k, v) {
					v(object);
				});
			}
			control.background = object.main;
			
		}
		
		$.each(control.changed, function (k, v) {
			v(new_ri, object);
		});
		
		object.box_ri = new_ri;
		kite9.reorder(object);
	};
	
	kite9.displayers["text-line"] = function(id, location, control) {
		var object = control.objectMap[id];
		
		var parent = $(object.definition).parent();
		
		if (parent.size() === 0) {
			return;
		}
		
		var styleAttr = $(object.definition).attr("style");
		var style = parent.get(0).nodeName.toLowerCase() == 'text-lines' ?  
				kite9.override_style( 'glyphTextLineStyle', styleAttr) :  
					kite9.override_style( 'keySymbolStyle', styleAttr);
		
		kite9.update_box_content(object, location, control, 
				style,
				{
					label: $(object.definition).children("text").text(),
					labelStyle: $(object.definition).children("text").attr('style'),
					symbols: $(object.definition).children("symbols").children("symbol")
				},	
				control.changed, 
				control.newitem,
				false
		);
		
		kite9.reorder(object);
	};
	
	kite9.displayers["comp-shape"] = function(id, location, control) {
		var object = control.objectMap[id];
		
		var parent = $(object.definition).parent();
		
		if (parent.size() === 0) {
			return;
		}
		var styleAttr = $(object.definition).attr("style");
		var style = parent.get(0).nodeName.toLowerCase() == 'text-lines' ?  
				kite9.override_style( 'glyphCompositionalShapeStyle', styleAttr) :  
				kite9.override_style( 'glyphCompositionalShapeStyle', styleAttr);
		
		kite9.update_box_content(object, location, control, 
				style,
				{
					label: undefined,
					symbols: undefined
				},	
				control.changed, 
				control.newitem,
				false
		);
		
		kite9.reorder(object);
	};
	
	kite9.getOrientedTerminator = function(d, control, def, x, y) {
		if ((def === undefined) || (def.path == undefined)) {
			return undefined;
		}

		var transform;
		if (d === 'LEFT') {
			transform = "r-90, 0, 0";
				
		} else if (d==='RIGHT') {
			transform = "r90, 0, 0"
			
		} else if (d=== 'DOWN') {
			transform = "r180, 0, 0";
			
		} else if (d == 'UP') {
			transform = "s1";
		} else {
			transform = "r"+d+", 0 0";
		}
		
		var path = Raphael.transformPath(def.path, transform);
		
		transform ="t"+(x)+" "+(y);
		return Raphael.transformPath(path, transform);
	};

	kite9.contradiction = function(object) {
		return true;
	};
	
	kite9.checkTerminatorFill = function(def, colour) {
		if ((def.filled) && (def.attr['fill']=='none')) {
			def.attr['fill'] = colour;
		} else {
			def.attr['stroke-linejoin'] = 'round';
		}
		def.attr['stroke'] = colour;
	}
	
	kite9.displayers["link"] = function(id, location, control){
		var object = control.objectMap[id];	
		var isNew = object.main === undefined;
		var xml = kite9.toXML(object.definition);
		var hash = kite9.hash(xml);
		var lxml = kite9.toXML(location);
		var lhash = kite9.hash(lxml);
		hash = hash + lhash;
		var offset = lp(location, "offset");
		var xo = control.leftOffset + parseFloat(lpa(offset, "x"));
		var yo = control.topOffset + parseFloat(lpa(offset, "y"));
		
		var changed = object.hashval !== hash;
		
		var box = kite9.draw_link(object, location, control, isNew, changed, xo, yo);
		
		if (changed && !isNew) {
			$.each(control.changed, function (k, v) {
				v(box, object);
			});
		}
		
		object.hashval = hash;
		object.box_ri = box;
	}
	
	function useAsArray(l) {
		if (l === undefined) {
			throw 'uh oh';
		}
		return !((l instanceof jQuery) || (l instanceof Element));
	}
	
	function lp(l, name) {
		if (useAsArray(l)) {
			return l[name];
		} else {
			return $(l).children(name);
		}
	}
	
	function lpt(l, name) {
		if (useAsArray(l)) {
			return l[name];
		} else {
			return $(l).children(name).text();
		}
	}
	
	function lpa(l, name) {
		if (useAsArray(l)) {
			return l[name];
		} else {
			return $(l).attr(name);
		}
	}
	
	kite9.draw_link = function(object, location, control, isNew, changed, xo, yo) {
		var flannelCreated = false;
		var out = undefined;
			
		if (changed) {
			var route = lpt(location, "path"); 
			var flannelRoute = lpt(location, "perimeter");
			var clss = $(object.definition).attr("shape");

			clss = ((clss === undefined) || (clss == '')) ? "NORMAL" : clss;
			style = kite9.override_style(kite9.get_stylesheet().linkStyles[0][clss], $(object.definition).attr("style"));
			var styleAttr = style.attr;
			
			// update checksums
			object.leftOffset = xo;
			object.topOffset = yo;
			
			// store style
			object.style = style;
			
			// store bounding box
			var border = kite9.LINK_FLANNEL_ATTR['stroke-width'] / 2;
			var box = Raphael.pathBBox(route);
			out = { 
					x: box.x - border + xo, 
					y: box.y - border + yo, 
					w: box.width + border + border, 
					h: box.height + border + border};
			
		
			// set colour if line is contradicting
			var contradict = lpt(location, "contradicting") === 'true';
			if (contradict) {
				contradict = kite9.contradiction(object);
			}
			
			styleAttr.stroke = contradict ? kite9.ERROR_COLOUR : styleAttr.stroke;
			
			var flannelAttr = kite9.override_style(kite9.LINK_FLANNEL_ATTR);
			
			// figure out terminator styles / shapes
			var from = lp(location, "fromDecoration");
			var fromShape = lpt(from, "name");
			fromShape = fromShape == '' ? "NONE" : fromShape;
			var fromDef = kite9.override_style(kite9.get_stylesheet().linkTerminatorStyles[0][fromShape]);
			kite9.checkTerminatorFill(fromDef, styleAttr['stroke']);
			
			var position = lp(from, "position");
			var d = lpt(from, "d");
			var xt = parseFloat(lpa(position, "x"));
			var yt = parseFloat(lpa(position, "y"));
			var fromTerm = kite9.getOrientedTerminator(d, control, fromDef, xt + control.leftOffset - xo, yt + control.topOffset - yo);

			var to = lp(location, "toDecoration");
			var toShape = lpt(to, "name");
			toShape = toShape == '' ? "NONE" : toShape;
			var toDef = kite9.override_style(kite9.get_stylesheet().linkTerminatorStyles[0][toShape]);
			kite9.checkTerminatorFill(toDef, styleAttr['stroke']);
			
			var position = lp(to, "position");
			var d = lpt(to, "d");
			var xt = parseFloat(lpa(position, "x"));
			var yt = parseFloat(lpa(position, "y"));
			var toTerm = kite9.getOrientedTerminator(d, control, toDef, xt + control.leftOffset - xo, yt+ control.topOffset - yo);
			
			object.main = control.path(route, styleAttr, object.main, xo, yo);

			if (fromTerm) {
				object.mainFrom = control.path(fromTerm, fromDef.attr, object.mainFrom, xo, yo);
				object.mainFrom.attr({"stroke-width" : styleAttr['stroke-width']});	
			} else if (object.mainFrom) {
				object.mainFrom.remove();
				object.mainFrom = undefined;
			}
			
			if (toTerm) {
				object.mainTo = control.path(toTerm, toDef.attr, object.mainTo, xo, yo);
				object.mainTo.attr({"stroke-width" : styleAttr['stroke-width']});
			} else if (object.mainTo) {
				object.mainTo.remove();
				object.mainTo = undefined;
			}
			
			
			if (style.castsShadow) {
				object.shad = control.createShadow(route, styleAttr, object.shad, xo, yo);
				if (fromTerm) {
					object.shadFrom = control.createShadow(fromTerm, fromDef.attr, object.shadFrom, xo, yo);
					object.shadFrom.attr({"stroke-width" : styleAttr['stroke-width']});		
				} else if (object.shadFrom) {
					object.shadFrom.remove();
					object.shadFrom = undefined;
				}
				if (toTerm) {
					object.shadTo = control.createShadow(toTerm, toDef.attr, object.shadTo, xo, yo);	
					object.shadTo.attr({"stroke-width" : styleAttr['stroke-width']});
				} else if (object.shadTo) {
					object.shadTo.remove();
					object.shadTo = undefined;
				}
			} else {
				if (object.shad) {
					object.shad.remove();
					object.shad = undefined;
				}
				if (object.shadFrom) {
					object.shadFrom.remove();
					object.shadFrom = undefined;
				}
				if (object.shadTo) {
					object.shadTo.remove();
					object.shadTo = undefined;
				}
			}
			
			if (isNew) {
				$.each(control.newitem, function (k, v) {
					v(out, object);
				});
			}
			
			var flannel = control.path(flannelRoute, flannelAttr, object.flannel, xo, yo);
			if (object.flannel === undefined) {
				object.flannel = flannel;
				flannelCreated = true;
				if (control.flannel) {
					$.each(control.flannel, function(k, v) {
						v(object);
					});
				}
			}
		}
		
		kite9.reorder(object);
		
		return out;
	};
	
	/**
	 * Builds a new, empty control object.
	 */
	var existing = kite9.new_control;
	
	kite9.new_control = function(paper, element) {
		var control = existing(paper, element);
	
		control.objectMap= {};
		control.css_scale = 1;
		control.css_offsetx = 0;
		control.css_offsety = 0;
		control.leftOffset = 0;
		control.topOffset = 0;
		control.xmlText = undefined;
				
		control.changed = [];   // function(new_ri, memento) { };
		
		control.newitem = [];  // function(new_ri, memento) { }

		control.removed = [];  // function(null, memento) {} 
		
		control.flannel = []; // function(memento) {};  // called when flannel created
		
		control.get_xml = function() {			
			// first, make sure all links is at the end of the diagram
			var al = $(control.theDiagram).children("diagram").children("allLinks").detach();
			$(control.theDiagram).children("diagram").append(al);
			return kite9.toXML(control.theDiagram);
		}
		
		control.get_links = function() {
			return $(control.theDiagram).find("allLinks");
		}
		
		control.update_listeners = [];
		
		control.load_listeners = [];
		
		return control;
		
	}
	
	/**
	 * This function renders some ADL XML which is annotated with rendering information 
	 * objects.
	 * 
	 * id is optional, and indicates we only want to update a single element
	 */
	kite9.update = function(control, xmlText, id) {
		if (id) {
			return;
			
		}
		var xml = undefined;

		if (control === undefined) {
			control = kite9.new_control();
		}
		control.animateSuspend();
		
		if (xmlText) {
			try {
				var xml = jQuery.parseXML(xmlText);
			} catch (err) {
				alert(err);
			}	
			control.xmlText = xmlText;
			control.theDiagram = xml;
		}  else {
			xml = control.theDiagram;
		}
		
		kite9.layout_elements(xml, control, id);
		control.animateStart();
		
		$.each(control.update_listeners, function (k, v) {
			v();
		});
	}
	
	/**
	 * Makes sure that the objects are in the right order in the display.
	 * This has to be done to ensure that new elements don't occlude older ones
	 */
	kite9.reorder = function(memento) {
		kite9.checkDo(memento.shad, kite9.to_back);
		kite9.checkDo(memento.shadFrom, kite9.to_back);
		kite9.checkDo(memento.shadTo, kite9.to_back);
		kite9.checkDo(memento.main, kite9.to_front);
		kite9.checkDo(memento.mainFrom, kite9.to_front);
		kite9.checkDo(memento.mainTo, kite9.to_front);
		kite9.checkDo(memento.contents, kite9.to_front);
		kite9.checkDo(memento.flannel, kite9.to_front);
	};
	
	kite9.checkDo = function(object, f) {
		if (object) {
			f(object);
		}
	};
	
	kite9.to_back = function(contents) {
		contents.toBack();
	}
	
	/**
	 *  Fixes issue where raphael to front is arbitrary ordered 
	 */
	kite9.to_front = function(contents) {
		if (contents.type === 'set') {
			for (var i = 0, l = contents.length; i < l; i += 1) {
				kite9.to_front(contents[i]);
			}	
		} else {
			if (contents[0] == null)
				return;
			
			contents.toFront();
		}
	}

	kite9.load_result = function(control, xmlText) {
		if (xmlText.indexOf("form=") === 0) {
			// problem - display error screen.
			var form = xmlText.substring(5);
			$('#'+form).dialog("open");	
		} else {
			$.each(control.load_listeners, function (k, v) {
				v(xmlText);
			});
			kite9.update(control, xmlText);
		}
	}
	
	
	
	/**
	 * Use this function to load data from a file which has renderingInformation attached, 
	 * or from the server, where we send some XML and receive back the same XML with the rendering information attached.
	 */
	kite9.load = function(control, url, serializedXml) {
		control = control === undefined ? kite9.new_control() : control;
		
		//do {
			control.loading = true;
			
			if (url === undefined) {
				url = POST_URL;
			}
			
			if (url.indexOf("?") == 0) {
				// need to append the POST_URL
				url = POST_URL + url;
			}

			if (url.indexOf(POST_URL) === 0) {
				// actual server request

				if ((serializedXml === undefined) && (control.theDiagram !== undefined)) {
					serializedXml = control.get_xml();
				}
				
				var sentData = {
					xml : serializedXml,
					stylesheet : control.stylesheet
				};

				// add any query params into the actual get request.
				var qmark = url.indexOf("?");
				if (qmark !== -1) {
					var queryPath = url.substring(qmark + 1);
					url = url.substring(0, qmark);
					var params = queryPath.split("&");
					delete sentData.xml;
					$(params).each(function(k, v) {
						var eq = v.indexOf("=");
						var key = v.substring(0, eq);
						var value = v.substring(eq + 1);
						sentData[key] = value;
					});
				}

				$.ajax({
					type : "POST",
					url : url,
					dataType : "text",
					data : sentData,
					success : function(xmlText) {
						kite9.load_result(control, xmlText);
					},
					error : function(jqXHR, textStatus, errorThrown) {
						alert(textStatus + " " + errorThrown);
						alert("URL: " + url);
					}
				});

			} else {
				// need to load in some XML first
				$.get(url, 
						function(xmlText) {
							kite9.load_result(control, xmlText);
						}, 
					'text');
			}

		//	kite9.load_needed = false;

		//} while (kite9.load_needed);

		control.loading = false;
	}

	kite9.override_style = function(m, styleParam) {
		var style = (typeof m) === 'string' ? kite9_stylesheet[m] : m;
		var override = kite9.parse_styles(styleParam);
		
		if (style.attr) {
			// processing a whole style
			var outAttr = {};
			jQuery.extend(outAttr, style.attr, override);
			
			var out = {};
			jQuery.extend(out, style);
			out.attr = outAttr;
			return out;
		} else {
			// processing the attr
			var outAttr = {};
			jQuery.extend(outAttr, style, override);
			return outAttr;
		}
	}
	
	kite9.get_stylesheet = function() {
		return kite9_stylesheet;
	}
	
}



/**
 * This is called by the jsonp command, which sets the global stylesheet for kite9.
 */
function setup_stylesheet(json) {
	kite9_stylesheet = json;
}

