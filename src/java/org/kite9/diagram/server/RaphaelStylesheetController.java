package org.kite9.diagram.server;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.LinearGradientPaint;
import java.awt.Paint;
import java.awt.Shape;
import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Writer;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.batik.svggen.SVGGeneratorContext;
import org.apache.batik.svggen.SVGPath;
import org.apache.batik.util.CSSConstants;
import org.kite9.diagram.position.Dimension2D;
import org.kite9.diagram.visualization.display.java2d.style.DirectionalValues;
import org.kite9.diagram.visualization.display.java2d.style.FixedShape;
import org.kite9.diagram.visualization.display.java2d.style.LocalFont;
import org.kite9.diagram.visualization.display.java2d.style.OverrideableAttributedStyle;
import org.kite9.diagram.visualization.display.java2d.style.ShapeStyle;
import org.kite9.diagram.visualization.display.java2d.style.Stylesheet;
import org.kite9.diagram.visualization.display.java2d.style.TextBoxStyle;
import org.kite9.diagram.visualization.display.java2d.style.TextStyle;
import org.kite9.diagram.visualization.display.java2d.style.io.GradientPaintValueManager;
import org.kite9.diagram.visualization.display.java2d.style.io.SVGHelper;
import org.kite9.diagram.visualization.display.java2d.style.sheets.AbstractStylesheet;
import org.kite9.diagram.visualization.format.png.BufferedImageRenderer;
import org.kite9.framework.common.RepositoryHelp;
import org.kite9.framework.logging.LogicException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.w3c.dom.Element;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.converters.Converter;
import com.thoughtworks.xstream.converters.MarshallingContext;
import com.thoughtworks.xstream.converters.SingleValueConverter;
import com.thoughtworks.xstream.converters.UnmarshallingContext;
import com.thoughtworks.xstream.converters.collections.AbstractCollectionConverter;
import com.thoughtworks.xstream.converters.javabean.BeanProvider;
import com.thoughtworks.xstream.converters.javabean.JavaBeanConverter;
import com.thoughtworks.xstream.core.TreeMarshallingStrategy;
import com.thoughtworks.xstream.io.ExtendedHierarchicalStreamWriterHelper;
import com.thoughtworks.xstream.io.HierarchicalStreamReader;
import com.thoughtworks.xstream.io.HierarchicalStreamWriter;
import com.thoughtworks.xstream.io.json.JsonHierarchicalStreamDriver;
import com.thoughtworks.xstream.io.json.JsonWriter;

/**
 * This is used for turning a java stylesheet into something that raphael can use.
 * 
 * 
 * @author robmoffat
 * 
 */
@Controller
public class RaphaelStylesheetController extends AbstractKite9Controller {

	XStream xs;

	public RaphaelStylesheetController() {
		super();
		this.xs = getConfiguredXStream();
	}
	
	@RequestMapping("/stylesheet.js")
	public void retrieveStylesheet(@RequestParam(value = "name", required = false) String name,
			final @RequestParam(value = "jsonp", required = false) String function, final Writer w) throws IOException {

		Stylesheet ss = getStylesheet(name);
		if (function != null) {
			w.append(function + "(");
		}
		String out = xs.toXML(ss);
		w.append(out);

		if (function != null) {
			w.append(");");
		}
		w.close();
	}

	@RequestMapping("/fonts/{file}.ttf")
	public void retrieveFont(@PathVariable("file") String file, OutputStream os) throws IOException {
		InputStream is = AbstractStylesheet.getFontStream(file);
		RepositoryHelp.streamCopy(is, os, true);
	}

	@RequestMapping("/stylesheet.css")
	public void retrieveStylesheet(@RequestParam(value = "name", required = false) String name,
			final HttpServletResponse sr) throws IOException {
		Stylesheet ss = getStylesheet(name);

		Map<String, ? extends Font> textStyles = ss.getFontFamilies();
		sr.setContentType("text/css");
		Writer w = sr.getWriter();

		for (Map.Entry<String, ? extends Font> e : textStyles.entrySet()) {
			w.write("@font-face { \n");
			w.write("\tfont-family: '" + e.getKey() + "';\n");
			w.write("\tfont-weight: 'normal';\n");
			w.write("\tfont-style: 'normal';\n");

			Font f = e.getValue();
			if (f instanceof LocalFont) {
				w.write("\tsrc: url('retrieveFont" + ((LocalFont) f).getFontFileName() + "') format('truetype');\n");
			}

			w.write("}\n\n");
		}
		w.flush();
		w.close();
	}

	private XStream getConfiguredXStream() {

		DocumentBuilder builder;
		try {
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			builder = factory.newDocumentBuilder();
		} catch (ParserConfigurationException e1) {
			throw new LogicException("Parser problem: ", e1);
		}
		SVGGeneratorContext context = SVGGeneratorContext.createDefault(builder.newDocument());
		final SVGPath pathConverter = new SVGPath(context);

		final Graphics2D tempGraphics;
		BufferedImageRenderer bir = new BufferedImageRenderer();
		tempGraphics = bir.getGraphics(1, new Dimension2D(1, 1));

		XStream xs = new XStream(new JsonHierarchicalStreamDriver() {

			@Override
			public HierarchicalStreamWriter createWriter(Writer out) {
				return new JsonWriter(out, JsonWriter.DROP_ROOT_MODE);
			}

		});

		// this converter makes it output the values of all the get* methods in the stylesheet
		xs.registerConverter(new JavaBeanConverter(xs.getMapper(), new BeanProvider() {

			@Override
			protected boolean canStreamProperty(PropertyDescriptor descriptor) {
				return descriptor.getReadMethod() != null;
			}

		}), -10);

		final GradientPaintValueManager gpvm = new SVGHelper().getGradientPaintValueManager();

		// handle paints
		xs.registerConverter(new Converter() {

			public boolean canConvert(@SuppressWarnings("rawtypes") Class type) {
				System.out.println(type);
				return Paint.class.isAssignableFrom(type);
			}

			public void marshal(Object source, HierarchicalStreamWriter writer, MarshallingContext context) {
				if (source instanceof LinearGradientPaint) {
					writer.startNode("attr");
					String s = gpvm.convert((LinearGradientPaint) source);
					writer.startNode(CSSConstants.CSS_FILL_PROPERTY);
					writer.setValue(s);
					writer.endNode();
					writer.endNode();

				} else if (source instanceof Color) {
					writer.startNode("attr");
					writer.startNode(CSSConstants.CSS_FILL_PROPERTY);
					writer.setValue(gpvm.convertColour((Color) source));
					writer.endNode();
					writer.endNode();
				}
			}

			public Object unmarshal(HierarchicalStreamReader reader, UnmarshallingContext context) {
				return null;
			}

		}, 20);

		// convert maps in a javascript style
		xs.registerConverter(new AbstractCollectionConverter(xs.getMapper()) {

			@Override
			public Object unmarshal(HierarchicalStreamReader reader, UnmarshallingContext context) {
				return null;
			}

			@Override
			@SuppressWarnings("rawtypes")
			public void marshal(Object source, HierarchicalStreamWriter writer, MarshallingContext context) {
				writer.startNode("map");
				Map map = (Map) source;
				for (Iterator iterator = map.entrySet().iterator(); iterator.hasNext();) {
					Map.Entry entry = (Map.Entry) iterator.next();
					writer.startNode(entry.getKey().toString());
					if (entry.getValue() != null) {
						context.convertAnother(entry.getValue());
					}
					writer.endNode();
				}
				writer.endNode();
			}

			@Override
			@SuppressWarnings("rawtypes")
			public boolean canConvert(Class type) {
				return type.equals(HashMap.class) || type.equals(LinkedHashMap.class);
			}
		});

		// handles conversion of paths
		xs.registerConverter(new SingleValueConverter() {

			public boolean canConvert(@SuppressWarnings("rawtypes") Class type) {
				return Shape.class.isAssignableFrom(type);
			}

			public String toString(Object obj) {
				if (obj == null) {
					return "";
				}
				Element e = pathConverter.toSVG((Shape) obj);
				return e == null ? "" : e.getAttribute("d");
			}

			public Object fromString(String str) {
				return null;
			}
		}, 20);

		// this handles returning local font height and baseline info
		xs.registerConverter(new Converter() {

			public boolean canConvert(@SuppressWarnings("rawtypes") Class type) {
				boolean out = type.equals(LocalFont.class);
				return out;
			}

			public void marshal(Object source, HierarchicalStreamWriter writer, MarshallingContext context) {
				LocalFont lf = (LocalFont) source;
				Font f = lf.deriveFont(1000f);
				tempGraphics.setFont(f);
				FontMetrics fm = tempGraphics.getFontMetrics();
				int maxAscent = fm.getMaxAscent();
				int maxDescent = fm.getMaxDescent();
				ExtendedHierarchicalStreamWriterHelper.startNode(writer, "baselineProportion", Float.class);
				writer.setValue("" + maxAscent / 1000f);
				writer.endNode();
				ExtendedHierarchicalStreamWriterHelper.startNode(writer, "heightProportion", Float.class);
				writer.setValue("" + (maxAscent + maxDescent) / 1000f);
				writer.endNode();
			}

			public Object unmarshal(HierarchicalStreamReader reader, UnmarshallingContext context) {
				return null;
			}
		});

		// this converter outputs font details correctly
		xs.registerConverter(new Converter() {

			public boolean canConvert(@SuppressWarnings("rawtypes") Class type) {
				boolean out = type.equals(TextStyle.class);
				return out;
			}

			public void marshal(Object source, HierarchicalStreamWriter writer, MarshallingContext context) {
				TextStyle tf = (TextStyle) source;
				writer.startNode("attr");
				outputAttributes(tf, writer);
				writer.endNode();

				// non-attr details
				if (tf.getJust() != null) {
					writer.startNode("justification");
					writer.setValue(tf.getJust().toString());
					writer.endNode();
				}

				if (tf.getFont() != null) {
					int maxAscent = tempGraphics.getFontMetrics(tf.getFont()).getMaxAscent();
					int maxDescent = tempGraphics.getFontMetrics(tf.getFont()).getMaxDescent();
					ExtendedHierarchicalStreamWriterHelper.startNode(writer, "baseline", Integer.class);
					writer.setValue("" + maxAscent);
					writer.endNode();
					ExtendedHierarchicalStreamWriterHelper.startNode(writer, "height", Integer.class);
					writer.setValue("" + (maxAscent + maxDescent));
					writer.endNode();
				}

			}

			public Object unmarshal(HierarchicalStreamReader reader, UnmarshallingContext context) {
				return null;
			}

		}, 20);

		// handle shapestyles correctly
		xs.registerConverter(new JavaBeanConverter(xs.getMapper()) {

			public boolean canConvert(@SuppressWarnings("rawtypes") Class type) {
				boolean out = ShapeStyle.class.isAssignableFrom(type);
				return out;
			}

			public void marshal(Object source, HierarchicalStreamWriter writer, MarshallingContext context) {
				super.marshal(source, writer, context);
				ShapeStyle tf = (ShapeStyle) source;
				writer.startNode("attr");
				outputAttributes(tf, writer);
				writer.endNode(); // attr

				ExtendedHierarchicalStreamWriterHelper.startNode(writer, "castsShadow", Boolean.class);
				writer.setValue("" + tf.castsShadow());
				writer.endNode();
				ExtendedHierarchicalStreamWriterHelper.startNode(writer, "invisible", Boolean.class);
				writer.setValue("" + tf.isInvisible());
				writer.endNode();

				// handle path & margin
				if (tf instanceof FixedShape) {
					Shape s = ((FixedShape) tf).getPath();
					if (s != null) {
						Element e = pathConverter.toSVG(s);
						String path = e == null ? "" : e.getAttribute("d");
						if (path != null) {
							writer.startNode("path");
							writer.setValue(path);
							writer.endNode();
						}
					}

					DirectionalValues db = ((FixedShape) tf).getMargin();
					if (db != null) {
						writer.startNode("margin");
						context.convertAnother(db);
						writer.endNode();
					}
				}

				ExtendedHierarchicalStreamWriterHelper.startNode(writer, "filled", Boolean.class);
				context.convertAnother(((ShapeStyle) tf).isFilled());
				writer.endNode();

				if (tf instanceof TextBoxStyle) {
					if (((TextBoxStyle) tf).getLabelTextFormat() != null) {
						writer.startNode("labelTextFormat");
						context.convertAnother(((TextBoxStyle) tf).getLabelTextFormat());
						writer.endNode();
					}

					if (((TextBoxStyle) tf).getTypeTextFormat() != null) {
						writer.startNode("typeTextFormat");
						context.convertAnother(((TextBoxStyle) tf).getTypeTextFormat());
						writer.endNode();
					}
				}
			}

			public Object unmarshal(HierarchicalStreamReader reader, UnmarshallingContext context) {
				return null;
			}

		}, 20);

		xs.setMarshallingStrategy(new TreeMarshallingStrategy());
		return xs;
	}

	public static String[] STRIP_QUOTES = new String[] { "fill", "stroke" };

	protected void outputAttributes(OverrideableAttributedStyle d, HierarchicalStreamWriter writer) {
		if (d == null) {
			return;
		}
		for (Map.Entry<String, String> entry : d.getElements().entrySet()) {
			String name = entry.getKey();
			String value = entry.getValue();
			if (contains(STRIP_QUOTES, name) && (value.startsWith("\""))) {
				value = value.substring(1, value.length() - 1);
			}

			outputEntry(writer, name, value);
		}
	}

	private boolean contains(String[] items, String name) {
		for (String string : items) {
			if (string.equals(name)) {
				return true;
			}
		}
		return false;
	}

	private void outputEntry(HierarchicalStreamWriter writer, String name, String value) {
		try {
			Integer.valueOf(value);
			ExtendedHierarchicalStreamWriterHelper.startNode(writer, name, Integer.class);
			writer.setValue(value);
			writer.endNode();
			return;
		} catch (NumberFormatException nfe) {
		}
		try {
			Float.valueOf(value);
			ExtendedHierarchicalStreamWriterHelper.startNode(writer, name, Float.class);
			writer.setValue(value);
			writer.endNode();
			return;
		} catch (NumberFormatException nfe) {
		}

		writer.startNode(name);
		writer.setValue(value);
		writer.endNode();
	}

}
