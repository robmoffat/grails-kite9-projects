package org.kite9.diagram.server;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.math.BigInteger;
import java.net.MalformedURLException;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;

import org.kite9.diagram.adl.Diagram;
import org.kite9.diagram.position.DiagramRenderingInformation;
import org.kite9.diagram.visualization.display.java2d.GriddedCompleteDisplayer;
import org.kite9.diagram.visualization.display.java2d.adl_basic.ADLBasicCompleteDisplayer;
import org.kite9.diagram.visualization.display.java2d.style.Stylesheet;
import org.kite9.diagram.visualization.format.pos.PositionInfoRenderer;
import org.kite9.diagram.visualization.format.pos.SVGPathConverter;
import org.kite9.diagram.visualization.pipeline.ImageRenderingPipeline;
import org.kite9.framework.common.RepositoryHelp;
import org.kite9.framework.serialization.XMLHelper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import com.thoughtworks.xstream.XStream;

/**
 * This accepts a diagram request in XML format, converting it back into objects.
 * Then, it processes this and returns just the positional details, again in JSON format.
 * 
 * Doesn't render a PNG/PDF or any actual image in the process.
 * 
 * @author robmoffat
 *
 */
@Controller
public class GuiController extends AbstractKite9DiagramManagementController {
	
	private SecureRandom random = new SecureRandom();


	private final class DiagramSizingAction implements Action {
		private final OutputStream os;
		private final String styleID;
		private final String sentXml;
		Stylesheet ss;

		private DiagramSizingAction(OutputStream os, String styleID, String sentXml) {
			this.os = os;
			this.styleID = styleID;
			this.sentXml = sentXml;
			ss = getStylesheet(styleID);
		}

		public File getSizes(String hash) throws MalformedURLException {
			return getSizesFile(styleID, hash);
		}

		public boolean handleExistingOutput(String hash, HttpServletRequest req) {
			try {
				File sizes = getSizes(hash);
				if (sizes.exists()) {
					RepositoryHelp.streamCopy(new FileInputStream(sizes), os, true);
					return true;
				}
				
				return false;
			} catch (Exception e) {
				sendErrorEmail(e, sentXml, req.getRequestURL().toString());
				return false;
			}
		}

		public void handleException(Throwable t, HttpServletRequest req) {
			try {
				sendErrorFormBack(os, "error");
			} catch (IOException e) {
			}
		}
		
		private static final String SAVED_ID = "srvuniq_";

		public void process(Project p, User u, Diagram d, String hash, boolean watermark) throws IOException {
			// ensure a saveable id
			String name = d.getName();
			boolean saving = ((name != null) && (name.length() > 0) && (u != NO_USER));
			String userDir = null;
			
			if (saving) {
				userDir = sanitizeFilePath(u.userName);
				String id = d.getID();
				if (!id.startsWith(SAVED_ID)) {
					// generate a better, more unique id
				    String newID = new BigInteger(30, random).toString(32);
				    d.setID(SAVED_ID+newID);
				    
				    if (getUserRemainingQuota(userDir, u)<=0) {
						sendErrorFormBack(os, "save_limit");
						return;
					}
				}
			}
			 
			
			Diagram out = renderImage(d, ss);
			DiagramRenderingInformation dri = out.getRenderingInformation();
			dri.setHash(hash);
			dri.setStylesheet(getStyle(styleID));
			
			// write back the response
			String outStr = helper.toXML(out);
			Writer wr = new OutputStreamWriter(os);
			wr.write(outStr);
			
			if (isLocal()) {
				System.out.println(outStr);
			}
			
			wr.close();
			
			// store the result for a rainy day.
			File sizes = getSizes(hash);
			storeDiagramXML(sizes, outStr);
			
			if (saving) {
				long t = System.currentTimeMillis();
				File historyFile = getUserFile(userDir, d.getID()+".history");
				Writer swr = new FileWriter(historyFile, true);
				swr.append(hash+"\t"+t+"\t"+u.userName+"\n3");
				swr.close();
				
				File detailsFile = getUserFile(userDir, d.getID()+".details");
				DiagramListItem dli = new DiagramListItem(name, d.getID(), hash, t);
				OutputStream os = new FileOutputStream(detailsFile);
				xs.toXML(dli, os);
				os.close();
			}
		}

		public boolean checkComplexity(Project p, User u, DiagramSize ds) throws IOException {
			System.out.println("Connections: "+ds.connections+" Connected: "+ds.connecteds);
			if ((u==null) || (u.number == 0)) {
				if (ds.connecteds > MAX_NO_AUTH_ELEMENTS) {
					sendErrorFormBack(os, "login");
					return false;
				} else {
					return true;
				}
			} else if (!u.isLicensed) {
				if (ds.connecteds > MAX_UNLICENSED_ELEMENTS) {
					sendErrorFormBack(os, "upgrade");
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}
		}

		public String toString() {
			return "/sizes.xml";
		}

		public Diagram getDiagram(String xml, File xmlFile, HttpServletRequest r) throws IOException {
			return getDiagramFromXML(xml, xmlFile, r);
		}

		
	}



	private static final String DEFAULT_DESIGNER_STYLESHEET = "designer2012";
	XStream outputSerializer;
	
	public GuiController() {
		super();
		this.outputSerializer = new XMLHelper().buildXStream();
		this.outputSerializer.registerConverter(new SVGPathConverter());
	}

	private File getSizesFile(final String styleID, String hash) throws MalformedURLException {
		return getCacheFile(hash, "sizes-"+getStyle(styleID)+".xml");
	}
	
	@RequestMapping("gui.sizes.xml.dispatch")
	public void generateDiagram(
			final @RequestParam(value = "xml", required = false) String sentXml, 
			@RequestParam(value = "hash", required = false) String hash, 
			final @RequestParam(value = "stylesheet", required = false) String styleID, 
			final OutputStream os, 
			HttpServletRequest request) throws Exception {
		if (isLocal()) {
			// this is to make it similar to real-life
			Thread.sleep(new Random().nextInt(1000));
			System.out.println(sentXml);
		}
			
		User u = getUser(request);
		generateOrRetrieveDiagram(null, u, sentXml, hash, new DiagramSizingAction(os, styleID, sentXml), request);
	}
	
	/**
	 * This returns xml for occasions where the Kite9 Designer is reloading the xml via the hash, and needs the xml definition of the
	 * diagram underlying it.
	 * @throws Exception 
	 */
	@RequestMapping("{id}/{style}.xml")
	public void returnXML(
			@PathVariable("id") String hash,
			final @PathVariable("style") String style, 
			HttpServletRequest request,
			final OutputStream os) throws Exception {
		
		generateDiagram(null, hash, style, os, request);
	}

	/**
	 * This initialises the GUI from scratch.
	 */
	@RequestMapping("gui.editor.dispatch")
	public ModelAndView guiEditor(@RequestParam(required=false, value="hash") String hash, @RequestParam(required=false, value="stylesheet") String style) {
		Map<String, String> map = new HashMap<String, String>();
		map.put("hash", hash);
		style = style == null ? DEFAULT_DESIGNER_STYLESHEET : style;
		map.put("style", style);
		boolean track = !isLocal();
		map.put("track", ""+track);
		
		if (hash!=null) {
			map.put("xmlUrl", "view/"+hash+"/"+style+".xml");
		} else {
			map.put("xmlUrl", "init.sxml");
		}
		ModelAndView out = new ModelAndView("/jsp/gui", map);
		return out;
	}
	
		

	protected Diagram renderImage(Diagram d, Stylesheet ss) {
		return new ImageRenderingPipeline<Diagram>(
				new GriddedCompleteDisplayer(new ADLBasicCompleteDisplayer(ss, true, true), ss), new PositionInfoRenderer()).process(d);
	}
}
