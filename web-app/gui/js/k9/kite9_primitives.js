/**
 * This function handles:
 * 
 * Drawing all of the elements on the page
 * Animating the display 
 */
function setup_primitives(kite9) {
	
	/**
	 * Very fast parser for translation transforms (i.e. T1.33,4.343)
	 */
	function quickTransformParser(tstr) {
		var split = tstr.split(",");
		var out =  [ [ 'T', parseFloat(split[0].substr(1)), parseFloat(split[1])]];
		return out;
	}

	/**
	 * This overrides Raphael's transform functionality to replace it with something
	 * much faster - specifically for the ipad.  However it reduces the functionality to
	 * just translation.
	 */
	Raphael.el.oldTransform = Raphael.el.transform;
	Raphael.el.transform = function(tstr) {
		var _ = this._;
		var parsed = undefined;
        if (tstr == null) {
            return _.transform;
        }
        
        if ((tstr) && (tstr instanceof Array)) {
        	parsed = tstr;
        } else if ((tstr) && (tstr.charAt(0) == 'T') && (tstr.indexOf("S") == -1)) {
        	parsed = quickTransformParser(tstr);
        } else {
        	parsed = Raphael.parseTransformString(tstr);
        }
    	
        	
    	if ((parsed.length == 1) && (parsed[0][0] == 'T')) {
    		var item = this;
        	var trans = parsed[0];
 
        	var sx = (item && item._) ? item._.dx : 0;
        	var sy = (item && item._) ? item._.dy : 0;
        	
        	// calculate start, end, deltas
        	var ex = trans[1];
        	var ey = trans[2];
   
        	var cx = ex - sx;	// transform delta
        	var cy = ey - sy;
        	
        	item.node.setAttribute("transform", "translate("+ex+","+ey+")");
        	item.attrs.transform = parsed; 
        	item._.transform = parsed;
            
        	item._.dx = ex;  // x and y of the transform
            item._.dy = ey;
            
            item.matrix.translate(cx, cy);
            
            if (item._.bbox) {
                item._.bbox.x += +cx;
                item._.bbox.y += +cy;
            }
        	
        	return this;
		} 
    	
		// revert back to the old method at no extra expense.
        return this.oldTransform(parsed);
	}
	
	/**
	 * Handles moving a text-path from one position to another.   @Todo: DEPRECATE
	 * SHould only be for shadows
	 */
	kite9.shift_path = function(path, dx, dy) {
		return Raphael.transformPath(path, "t"+dx+","+dy);
	};
	
	
	/**
	 * Builds a new, empty control object.
	 */
	kite9.new_control = function(paper, element) {
		var animationMaster = null;
		var animating = "go";
		var control = {};
		var moveCount = 0;
		var pathCount = 0;
		
		control.paper = paper;
		control.element = element;
				
		control.set_size = function(maxx, maxy) {
			control.paper.setSize(maxx, maxy);
		};

		applyStyle = function(contents, styleAttr) {
			// remove fill as this breaks on firefox.
			if (BrowserDetect.browser=='Firefox') {
				if ((styleAttr.fill) && (styleAttr.fill.indexOf("-") !== -1)) {
					var fillParts = styleAttr.fill.split("-");
					styleAttr.fill = fillParts[1];
				}
			}
			
			contents.attr(styleAttr);
		}
		
		
		/**
		 * Suspends animation.
		 */
		control.animateSuspend = function() {
			while (kite9.animating === "go") {
				setTimeout(function() {
					kite9.animateSuspend();
				}, 50);
				return;
			}
		
			animating = "suspend";
			pathCount = 0;
			moveCount = 0;
		};
			
		/**
		 * Starts the suspended animation
		 */
		control.animateStart = function() {
			/*$('#move_count').html(moveCount);
			$('#path_count').html(pathCount);
			$('#errors').html('');*/
			
			if (animating === "suspend") {
				animating = "go";
				if (animationMaster !== null) {
					animationMaster.resume();
				}
			}
		};

		/**
		 * Adds elements to the animation
		 */
		control.animateWith = function(item, params, instant) {
			if (item === undefined) {
				return;
			}
			
			if (instant) {
				item.attr(params);
				return;
			}
			
			if (animationMaster === null) {
				animationMaster = item;
			}
			
			
			if (item !== animationMaster) {
				item.animateWith(animationMaster, "gordon", params, 1000, ">");
			} else {
				item.animate(params, 1000, ">", function () {
					animationMaster = null;
				});
				
				if (animating === "suspend") {
					item.pause();
				}
			}
		};
		
		/**
		 * Moves a bunch of content, either directly or via the animation.
		 */
		control.move_set = function(contents, dx, dy, anim, absolute) {
			if (contents.type === 'set') {
				for (var i = 0, l = contents.length; i < l; i += 1) {
					control.move_set(contents[i], dx, dy, anim, absolute);
				}	
			} else {
				if (contents[0] == null)
					return;
				
				var item = contents;
				var change;
				if (absolute !== true) {
					var trans = item.attr("transform");
					var tx = (trans && trans[0]) ? trans[0][1] : 0;
					var ty = (trans && trans[0]) ? trans[0][2] : 0;
					var tx = tx + dx;
					var ty = ty + dy;
					change = {transform: "T"+tx+","+ty};
				} else {
					change = {transform: "T"+dx+","+dy};
				}
				
				if (anim) {
					control.animateWith(item, change);
				} else {
					item.attr(change);
				}
			}
		};
		
		/**
	 	 * Called for border shapes, generally.  Creates or moves an existing path.
		 */
		control.path = function(pathStr, attr, existing, xo, yo, immediate) {
			xo = xo === undefined ? 0 : xo;
			yo = yo === undefined ? 0 : yo;
			if (pathStr instanceof Array) {
				// convert to string
				var str = '';
				$.each(pathStr, function(k, v) {
					$.each(v, function(k2, v2) {
						str = str + v2 + ' ';
					});
				});
				pathStr = str;
			}
			
			var trans =  "T"+xo+","+yo;
			if (existing == undefined) {
				existing = paper.path(pathStr);
				if (attr != null) applyStyle(existing, attr);
				existing.attr('transform', trans);
			} else if (immediate) {
				if (attr != null) applyStyle(existing, attr);
				existing.attr(existing, {path: pathStr, transform: trans});
			} else if (pathStr != existing._k9hash) {
				if (attr != null) applyStyle(existing, attr);
				control.animateWith(existing, {path: pathStr, transform: trans});
				pathCount ++;
			} else {
				// just move the path
				if (attr != null) applyStyle(existing, attr);
				control.animateWith(existing, {transform: trans});
				moveCount++;
			}
			
			existing._k9hash=pathStr;
			return existing;
		}
		
		/**
		 * Called for border rectangle functions.  Creates or moves an existing rectangle.
		 */
		control.insetRect = function(x, y, w, h, strokeWidth, attr, existing, xo, yo) {
			xo = xo === undefined ? 0 : xo;
			yo = yo === undefined ? 0 : yo;
			
			// adjust for stroke width
			x = x+(strokeWidth / 2);
			y = y+(strokeWidth/2);
			w = w-strokeWidth;
			h = h-strokeWidth;
			
			var hash = x+"_"+y+"_"+w+"_"+h+"_";
			var trans = "T"+xo+","+yo;
			if (existing === undefined) {
				existing = control.paper.rect(x, y, w, h);
				existing.attr('transform', trans);
			} else if (existing._k9hash != hash) {
				control.animateWith(existing, {x: x, y: y, width: w, height: h, transform: trans});
				pathCount ++;
			} else {
				control.animateWith(existing, {transform: trans});
				moveCount ++;
			}
			existing._k9hash = hash;
			if (attr != null) {
				applyStyle(existing, attr);
			}
			return existing;
		};
		

		/**
		 * Puts text on screen within a given area, and styles it.
		 * Adds it to container if given.  text is returned as a raphael object.
		 */
		control.placeStyledText = function(x, y, w, textIn, baseline, style, justification, container, xo, yo) {
			xo = xo === undefined ? 0 : xo;
			yo = yo === undefined ? 0 : yo;
			var out = paper.set();
				
			var lines = textIn.split("\n");
			var yPos = y + baseline - ((lines.length-1) * style.height) - style.baseline;
			
			$.each(lines, function(k, v) {
				if (v.length === 0) {
					yPos += style.height;
				} else {
					var trimmed = v.replace(/^\s+/, '').replace(/\s+$/, '');
					var text = paper.text(x, yPos + (style.height / 2), trimmed);
					applyStyle(text, style.attr);
					
					if (justification == 'RIGHT') {
						// right justify
						text.attr({x: x + w, "text-anchor" : "end"});
					} else if (justification == 'CENTER') {
						// handle center-justification
						text.attr({x: x + (w / 2), "text-anchor" : "middle"});
					} else {
						// make left justified
						text.attr({x: x, "text-anchor" : "start"});
					}
					
					//paper.rect(x, yPos + style.baseline, w, 1);
									
					yPos += style.height;
					out.push(text);
				}
			});
			
			if ((container !== null) && (container !== undefined)) {
				container.push(out);
			}
			
			out.attr('transform', "T"+xo+","+yo);
			return out;
		};
				
		shadowAttr = function(main_attr) {
			var filled = (main_attr.fill !== undefined) && (main_attr.fill !== 'none');
			if (filled) {
				var out = {};
				jQuery.extend(out, main_attr, {
					stroke: 'none', 
					opacity: kite9_stylesheet.shadowColour.attr['fill-opacity'],
					fill: kite9_stylesheet.shadowColour.attr['fill'],
					"fill-opacity":   kite9_stylesheet.shadowColour.attr['fill-opacity']*2
				});
				return out;
			} else {
				// unfilled shape
				var out = {};
				jQuery.extend(out, main_attr, {
					fill: 'none',
					stroke: kite9_stylesheet.shadowColour.attr.fill, 
					opacity: kite9_stylesheet.shadowColour.attr['fill-opacity']});
				return out;
			}
		}
		
		/**
		 * Creates a "shadow" version of an element.
		 */
		control.createShadow = function(pathOrig, main_attr, shadow, xo, yo) {
			var changePath = false;
			if ((shadow == undefined) || (shadow._k9hash != pathOrig)) {
				changePath = true;
			}
			
			if (changePath) {
				var path = kite9.shift_path(pathOrig,  kite9_stylesheet.shadowXOffset, kite9_stylesheet.shadowYOffset);
				shadow = control.path(path, shadowAttr(main_attr), shadow, xo, yo);	
				shadow._k9hash = pathOrig;
			} else {
				var trans =  "T"+xo+","+yo;
				control.animateWith(shadow, {transform: trans});
				moveCount ++;
			}

			applyStyle(shadow, shadowAttr(main_attr));
			shadow.toBack();
			return shadow;
		};
		
		
		return control;
		
	}
	
}