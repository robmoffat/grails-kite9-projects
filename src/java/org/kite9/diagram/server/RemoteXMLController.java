package org.kite9.diagram.server;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.MalformedURLException;
import java.net.URL;

import javax.servlet.http.HttpServletRequest;

import org.kite9.diagram.adl.Diagram;
import org.kite9.framework.common.RepositoryHelp;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * This controller handles requests from the javascript library or direct img-based requests. 
 * 
 */
@Controller
public class RemoteXMLController extends AbstractImageGeneratingController {

	/**
	 * Used for non-parameterized, published images referenced by a hash
	 */
	@RequestMapping("/{id}/{style}.png")
	public ResponseEntity<byte[]> returnPNG(@PathVariable("id") String hash,
				final @PathVariable("style") String style, HttpServletRequest req,
				final @RequestParam(value="width", required= false) Integer width) {
		return generateImage(null, hash, style, null, null, width, null, Format.PNG, req);
	}
	
	/**
	 * Used for non-parameterized, published pdfs referenced by a hash
	 */
	@RequestMapping("/{id}/{style}.pdf")
	public ResponseEntity<byte[]> returnPDF(@PathVariable("id") String hash,
				final @PathVariable("style") String style, HttpServletRequest req,
				final @RequestParam(value="width", required= false) Integer width) {
		return generateImage(null, hash, style, null, null, width, null, Format.PDF, req);
	}
	
	/**
	 * This is used for individual png images
	 */
	@RequestMapping(value = "/img.png")
	public ResponseEntity<byte[]> generatePNGImage(@RequestParam(required = false, value = "url") String url,
			@RequestParam(required = false, value = "hash") String hash,
			@RequestParam(required = false, value = "style") String style,
			@RequestParam(required = false, value = "projectId") Integer projectId,
			@RequestParam(required = false, value = "secretKey") String secretKey,
			@RequestParam(value="width", required= false) Integer width,
			@RequestParam(required = false, value = "xml") String xml,
			HttpServletRequest req) {
		
		return generateImage(url, hash, style, projectId, secretKey, width, xml, Format.PNG, req);
	}
	
	/**
	 * This is used for individual images
	 */
	@RequestMapping(value = "/img.pdf")
	public ResponseEntity<byte[]> generatePDFImage(@RequestParam(required = false, value = "url") String url,
			@RequestParam(required = false, value = "hash") String hash,
			@RequestParam(required = false, value = "style") String style,
			@RequestParam(required = false, value = "projectId") Integer projectId,
			@RequestParam(required = false, value = "secretKey") String secretKey,
			@RequestParam(value="width", required= false) Integer width,
			@RequestParam(required = false, value = "xml") String xml,
			HttpServletRequest req) {
		
		return generateImage(url, hash, style, projectId, secretKey, width, xml, Format.PDF, req);
	}
		
		
	protected ResponseEntity<byte[]> generateImage(String url, String hash,  final String style, 
			Integer projectId, String secretKey, final Integer width, String xml, final Format format,
			HttpServletRequest req) {

		final HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.setContentType(format.getMediaType());
		final REHolder holder = new REHolder();

		Project p = null;

		if (projectId != null) {
			p = getProject(projectId, secretKey);
		}

		if (url != null) {
			try {
				URL u = new URL(url);
				String host = u.getHost();
				if (p == null) {
					p = getProject(host);
				}
				xml = downloadXML(u);
				//validateXML(xml);
			} catch (Exception e) {
				sendErrorEmail(e, xml, req.getRequestURL().toString());
				return new ResponseEntity<byte[]>(e.getMessage().getBytes(), responseHeaders, HttpStatus.BAD_REQUEST);
			}
		}

		if (xml != null) {
			hash = generateHash(xml);
		}
		
		final String finalXml = xml;
		User u = getUser(req);
		
		generateOrRetrieveDiagram(p, u, xml, hash, new Action() {
			private String getStyle() {
				if (style == null) {
					return BASIC;
				} else {
					return style;
				}
			}

			public boolean handleExistingOutput(String hash, HttpServletRequest req) {
				try {
					File existing = getImageFile(hash, getStyle(), format.getExtension(), width);
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
				responseHeaders.setETag(""+l);
			}

			public void handleException(Throwable t, HttpServletRequest req) {
				sendErrorEmail(t, finalXml, req.getRequestURL().toString());
				holder.out = new ResponseEntity<byte[]>(t.getMessage().getBytes(), HttpStatus.BAD_REQUEST);
			}

			public void process(Project p, User u, Diagram d, String hash, boolean watermark) throws Exception {
				ByteArrayOutputStream baos = new ByteArrayOutputStream(10000);
				basicProcess(hash, style, d, watermark, baos, null, width, format);
				File newFile = getImageFile(hash, getStyle(), format.getExtension(), width);
				createETag(newFile, responseHeaders);
				ResponseEntity<byte[]> out = new ResponseEntity<byte[]>(baos.toByteArray(), responseHeaders,
						HttpStatus.OK);
				holder.out = out;

			}

			public boolean checkComplexity(Project p, User u, DiagramSize ds) throws Exception {
				return basicCheckComplexity(p, u, ds);
			}
			
			public String toString() {
				return "/img"+format.getExtension();
			}

			public Diagram getDiagram(String xml, File xmlFile, HttpServletRequest r) throws IOException {
				return getDiagramFromXML(finalXml, xmlFile, r);
			}

		}, req);

		return holder.out;

	}

	/**
	 * So this needs to return some javascript which when executed will output some html which contains the img and map
	 * tags.
	 */
	@RequestMapping(value = "/embed_url.js")
	public void generateJavascript(@RequestParam(required = false, value = "url") String url,
			@RequestParam(required = false, value = "hash") String hash,
			final @RequestParam(required = false, value = "style") String style,
			final @RequestParam(required = true, value = "container") String container, 
			final @RequestParam(value="width", required= false) Integer width,
			final OutputStream os,
			final HttpServletRequest req) {
		
		Project p = null;
		String xml = null;

		if (url != null) {
			try {
				URL u = new URL(url);
				String host = u.getHost();
				if (p == null) {
					p = getProject(host);
				}
				xml = downloadXML(u);
				//validateXML(xml);
				hash = generateHash(xml);
			} catch (Exception e) {
				sendErrorEmail(e, xml, req.getRequestURL().toString());
				
			}
		}
		
		final String finalXML = xml;
		
		generateOrRetrieveDiagram(p, null, xml, hash, new Action() {

			public void writeOutput(String hash, String map) throws MalformedURLException {
				PrintWriter pw = new PrintWriter(os);
				pw.print("(function (c) { \n");
				pw.print("$(c).html('");
				// getStaticURLRoot();
				pw.print("<img src=\"" + getStaticURLRoot() + hash + "/" + getStyle(style)
						+ ".png\" class=\"kite9\" usemap=\"#" + hash + "\" />");
				pw.print("<map name=\"" + hash + "\">");
				pw.print(map.toString().trim().replace('\n', ' '));
				pw.print("</map>");
				pw.print("');}('" + container + "'));");
				pw.close();
			}

			public boolean handleExistingOutput(String hash,  HttpServletRequest req) {
				try {
					File existing = getImageFile(hash, getStyle(style), ".png", width);
					if (existing.exists()) {
						StringWriter map = new StringWriter();
						FileReader mapIn = new FileReader(getImageFile(hash, getStyle(style), ".map", width));
						RepositoryHelp.streamCopy(mapIn, map, true);
						writeOutput(hash, map.toString());
						return true;
					} else {
						return false;
					}
				} catch (Exception e) {
					sendErrorEmail(e, finalXML, req.getRequestURL().toString());
					return false;
				}
			}

			public void process(Project p, User u, Diagram d, String hash, boolean watermark) throws Exception {
				StringWriter map = new StringWriter();
				basicProcess(hash, getStyle(style), d, watermark, null, map, width, Format.PNG);
				writeOutput(hash, map.toString());
			}

			public boolean checkComplexity(Project p, User u, DiagramSize ds) throws Exception {
				return basicCheckComplexity(p, u, ds);
			}

			public void handleException(Throwable t, HttpServletRequest req) {
				basicHandleException(t, os, container);
			}
			
			public String toString() {
				return "/embed_url.js";
			}

			public Diagram getDiagram(String xml, File xmlFile, HttpServletRequest r) throws IOException {
				return getDiagramFromXML(xml, xmlFile, r);
			}

		}, req);
	}
	
	public void basicHandleException(Throwable t, OutputStream os, String container) {
		PrintWriter pw = new PrintWriter(os);
		pw.print("(function (c) { \n");
		pw.print("$(c).insert('<pre>");
		t.printStackTrace(pw);
		pw.print("</pre>')('" + container + "'))");
		pw.close();
	}

	/**
	 * So this needs to return some javascript which when executed will output some html which contains the img and map
	 * tags.
	 */
	// @RequestMapping(value = "/embed_url.js")
	// public void generateHTML(@RequestParam(required = false, value = "url") String url,
	// @RequestParam(required = false, value = "hash") String hash,
	// @RequestParam(required = false, value = "style") String style,
	// @RequestParam(required = false, value = "projectId") Integer projectId,
	// @RequestParam(required = false, value = "secretKey") String secretKey,
	// @RequestParam(required = false, value = "callback") String callback, OutputStream os) {
	// StringBuilder map = new StringBuilder(1000);
	// File f = null;
	//
	// try {
	//
	// Project p = null;
	//
	// if (projectId != null) {
	// p = getProject(projectId, secretKey);
	// }
	//
	// if (url != null) {
	// URL u = new URL(url);
	// String host = u.getHost();
	// if (p == null) {
	// p = getProject(host);
	// }
	// xml = downloadXML(u);
	// validateXML(xml);
	// hash = generateHash(xml);
	// } else if (xml != null) {
	// hash = generateHash(xml);
	// }
	// generatePNGDiagram(style, p, null, xml, hash, map, false);
	// f = getFile(hash, style + ".png");
	// } catch (Exception e) {
	// writeException(os, e);
	// return;
	// }
	//
	// try {
	// PrintWriter pw = new PrintWriter(os);
	// pw.print("<img src=\""+getStaticURLRoot()+hash+"/"+style+".png\" class=\"kite9\" usemap=\"#"+hash+"\">");
	// pw.print("<map name=\""+hash+"\">");
	// pw.print(map);
	// pw.print("</map>");
	// pw.close();
	// } catch (MalformedURLException e) {
	// writeException(os, e);
	// }
	// }


	private String downloadXML(URL u) throws IOException {
		InputStream is = u.openConnection().getInputStream();
		InputStreamReader r = new InputStreamReader(is);
		StringBuilder sb = new StringBuilder(1000);
		int c;
		do {
			c = r.read();
			if (c != -1) {
				sb.append((char) c);
			}
		} while ((c != -1) && (sb.length() < 10000));
		return sb.toString();
	}

}
