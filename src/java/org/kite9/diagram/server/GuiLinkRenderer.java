package org.kite9.diagram.server;

import java.awt.Color;
import java.awt.Paint;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Writer;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;

import org.kite9.diagram.adl.Arrow;
import org.kite9.diagram.adl.Diagram;
import org.kite9.diagram.adl.Link;
import org.kite9.diagram.position.DiagramRenderingInformation;
import org.kite9.diagram.position.Dimension2D;
import org.kite9.diagram.position.RouteRenderingInformation;
import org.kite9.diagram.visualization.display.java2d.GriddedCompleteDisplayer;
import org.kite9.diagram.visualization.display.java2d.adl_basic.ADLBasicCompleteDisplayer;
import org.kite9.diagram.visualization.display.java2d.style.Stylesheet;
import org.kite9.diagram.visualization.display.java2d.style.sheets.Designer2012Stylesheet;
import org.kite9.diagram.visualization.format.png.BufferedImageRenderer;
import org.kite9.diagram.visualization.pipeline.ImageRenderingPipeline;
import org.kite9.framework.common.HelpMethods;
import org.kite9.framework.common.RepositoryHelp;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Provides some simple code for rendering images of links, so you can see what they will look like.
 * 
 * @author robmoffat
 *
 */
@Controller
public class GuiLinkRenderer extends AbstractImageGeneratingController {

	private static final int ARROW_LENGTH=208;
	private static final int ARROW_GAP_X=10;
	private static final int ARROW_GAP_Y=12;
	
	private static final Stylesheet STYLESHEET = new Designer2012Stylesheet() {

		@Override
		public Paint getBackground() {
			return new Color(1f, 1f, 1f, 0);
		}
		
	};
	
	/**
	 * Creates a diagram showing a single link.
	 */
	private Diagram createDiagram(String fromTerminator, String toTerminator, String shape, String styleAttr) {
		Arrow a = new Arrow("from", "");
		Arrow b = new Arrow("to", "");

		Link l = new Link(a, b);
		l.setShapeName(shape);
		l.setID("link");

		l.setFromDecoration(fromTerminator);
		l.setToDecoration(toTerminator);
		l.setStyle(styleAttr);
		RouteRenderingInformation rri = new RouteRenderingInformation();
		rri.add(new Dimension2D(ARROW_GAP_X, ARROW_GAP_Y));
		rri.add(new Dimension2D(ARROW_LENGTH+ARROW_GAP_X, ARROW_GAP_Y));
		l.setRenderingInformation(rri);

		Diagram d = new Diagram("diagram", HelpMethods.listOf(a, b), null);
		d.addLink(l);
		DiagramRenderingInformation rri2 = new DiagramRenderingInformation();
		rri2.setPosition(new Dimension2D(0, 0));
		rri2.setSize(new Dimension2D(ARROW_LENGTH+2*ARROW_GAP_X, 2*ARROW_GAP_Y));
		d.setRenderingInformation(rri2);

		return d;
	}

	
	
	/**
	 * This is used for individual images
	 */
	@RequestMapping(value = "/gui-link.png")
	public ResponseEntity<byte[]> generatePNGImage(
			final @RequestParam(value = "fromTerminator", defaultValue = "NONE", required = false) String fromTerminator,
			final @RequestParam(value = "toTerminator", defaultValue = "NONE", required = false) String toTerminator,
			final @RequestParam(value = "linkStyle", defaultValue = "", required = false) String styleAttr,
			final @RequestParam(value = "linkShape", defaultValue = "NORMAL", required = false) String shape,
			final @RequestParam(value = "width", defaultValue = "150", required = false) int width,
			final HttpServletRequest req) {

		final HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.setContentType(MediaType.IMAGE_PNG);
		final REHolder holder = new REHolder();
		String hash = generateLinkHash(fromTerminator, toTerminator, shape, styleAttr);
		final String style = "gui-link";

		generateOrRetrieveDiagram(null, null, null, hash, new Action() {

			public boolean handleExistingOutput(String hash, HttpServletRequest req) {
				try {
					File existing = getImageFile(hash, style, ".png", width);
					if (existing.exists()) {
						ByteArrayOutputStream baos = new ByteArrayOutputStream();
						RepositoryHelp.streamCopy(new FileInputStream(existing), baos, true);
						createETag(existing, responseHeaders);
						ResponseEntity<byte[]> out = new ResponseEntity<byte[]>(baos.toByteArray(), responseHeaders,
								HttpStatus.OK);
						holder.out = out;
						return true;
					} else {
						return false;
					}
				} catch (Exception e) {
					return false;
				}
			}

			private void createETag(File existing, HttpHeaders responseHeaders) {
				long l = existing.lastModified();
				responseHeaders.setETag("" + l);
			}

			public void handleException(Throwable t, HttpServletRequest req) {
				String finalXml = helper.toXML(createDiagram(fromTerminator, toTerminator, shape, styleAttr));
				sendErrorEmail(t, finalXml, req.getRequestURL().toString());
				holder.out = new ResponseEntity<byte[]>(t.getMessage().getBytes(), HttpStatus.BAD_REQUEST);
			}

			public void process(Project p, User u, Diagram d, String hash, boolean watermark) throws Exception {
				ByteArrayOutputStream baos = new ByteArrayOutputStream(10000);
				basicProcess(hash, null, d, false, baos, null, width, new Format() {
					
					public void handleWrite(Diagram d, OutputStream baos, File imageFile, Stylesheet ss, boolean watermark, Integer width) throws IOException {
						// render (ONLY) and send the image
						ImageRenderingPipeline<BufferedImage> p = new ImageRenderingPipeline<BufferedImage>(new GriddedCompleteDisplayer(new ADLBasicCompleteDisplayer(ss, watermark, false),ss),
								new BufferedImageRenderer(width));

						BufferedImage bi = p.render(d);
						if (imageFile != null) {
							ImageIO.write(bi, "PNG", imageFile);
						}
						if (baos != null) {
							ImageIO.write(bi, "PNG", baos);
						}
					}
					
					public MediaType getMediaType() {
						return MediaType.IMAGE_PNG;
					}
					
					public String getExtension() {
						return ".png";
					}
				});
				File newFile = getImageFile(hash, style, ".png", width);
				createETag(newFile, responseHeaders);
				ResponseEntity<byte[]> out = new ResponseEntity<byte[]>(baos.toByteArray(), responseHeaders,
						HttpStatus.OK);
				holder.out = out;

			}

			public boolean checkComplexity(Project p, User u, DiagramSize ds) throws Exception {
				return basicCheckComplexity(p, u, ds);
			}

			public String toString() {
				return "/img.png";
			}

			public Diagram getDiagram(String xml, File xmlFile, HttpServletRequest r) throws IOException {
				return createDiagram(fromTerminator, toTerminator, shape, styleAttr);
			}

		}, req);

		return holder.out;

	}

	private static String generateLinkHash(String fromTerminator, String toTerminator, String shape, String style) {
		return generateHash(fromTerminator + toTerminator + shape+style);
	}

	/**
	 * Overrides to only include the rendering part of the process.
	 */
	@Override
	public void basicProcess(String hash, String style, Diagram d, boolean watermark, OutputStream baos, Writer mapTo,
			Integer width, Format fmt) throws Exception {
		File imageFile = getImageFile(hash, style, ".png", width);
		fmt.handleWrite(d, baos, imageFile, STYLESHEET, watermark, width);
	}

}
