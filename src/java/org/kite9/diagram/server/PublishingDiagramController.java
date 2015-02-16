package org.kite9.diagram.server;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.kite9.diagram.adl.Diagram;
import org.kite9.framework.common.RepositoryHelp;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

/**
 * This provides a controller for publishing a diagram and viewing published diagrams.
 * Used by the javascript gui.
 * 
 * @author robmoffat
 *
 */
@Controller
public class PublishingDiagramController extends AbstractImageGeneratingController {

	String toInclude = null;
	
	/**
	 * This is called by the kite9 designer when you have created the final diagram.  
	 */
	@RequestMapping("/publish.html")
	public void generatePNGImage(
			@RequestParam(value = "projectId", required= false) String projectId,
			@RequestParam(value = "secretKey", required = false) String secretKey,
			final @RequestParam(required = false, value = "style") String style,
			final @RequestParam("code") String xml, 
			final @RequestParam(value="width", required= false) Integer width,
 			HttpServletRequest request, 
			final OutputStream os) {
		try {
			Project p = null;
			User u = getUser(request);
			try {
				int pid = Integer.parseInt(projectId);
				p = getProject(pid, secretKey);
			} catch (Exception e) {
				// p can stay as null;
			}
			
			if ((u == NO_USER) && ((p==NO_PROJECT) || (p==null))) {
				sendErrorFormBack(os, "login");
				return;
			}

			String hash = generateHash(xml);
			generateOrRetrieveDiagram(p, u, xml, hash, new Action() {

				public boolean handleExistingOutput(String hash, HttpServletRequest r) {
					try {
						if (getImageFile(hash, getStyle(style), ".png", width).exists()) {
							writeHash(hash);
							return true;							
						}
						
						return false;
					
					} catch (Exception e) {
						return false;
					}
				}

				private void writeHash(String hash) throws IOException {
					OutputStreamWriter osw = new OutputStreamWriter(os);
					osw.write(hash);   // just need the hash returned
					osw.close();
				}

				public void handleException(Throwable t, HttpServletRequest req) {
					sendErrorEmail(t, xml, req.getRequestURL().toString());
				}

				public void process(Project p, User u, Diagram d, String hash, boolean watermark) throws Exception {
					basicProcess(hash, style, d, watermark, null, null, width, Format.PNG);
					writeHash(hash);
				}

				public boolean checkComplexity(Project p, User u, DiagramSize ds) throws Exception {
					return basicCheckComplexity(p, u, ds);
				}
				
				public String toString() {
					return "/publish.html";
				}

				public Diagram getDiagram(String xml, File xmlFile, HttpServletRequest r) throws IOException {
					return getDiagramFromXML(xml, xmlFile, r);
				}

				
			}, request);
			
		} catch (Exception e) {
			sendErrorEmail(e, xml, request.getRequestURL().toString());
			handleException(e, os);
		}
	}
	
	static class MHolder {
		
		Object out;
	}
	
	/**
	 * This calls the 'surround.jsp' viewer page, for showing you a diagram with a menu.
	 */
	@RequestMapping("{id}/{style}.html")
	public ModelAndView viewPNGImage(
			final @PathVariable("id") String hash, 
			final @PathVariable("style") String style,
			final @RequestParam(value="width", required= false) Integer width,
			final HttpServletRequest request) throws Throwable {
		
			User u = getUser(request);
			
			final MHolder holder = new MHolder();
		
			generateOrRetrieveDiagram(null, u, null, hash, new Action() {
				
				public void generatePage(String inMap) throws Exception {
					Map<String, String> map = new HashMap<String, String>();
					String widthParam = width != null ? "?width="+width : "";
					
					String pngURL = getServletURLRoot(request) + "/view/" + hash + "/" + style + ".png" + widthParam;
					String pdfURL = getServletURLRoot(request) + "/view/" + hash + "/" + style + ".pdf" + widthParam;
					String pageURL = getServletURLRoot(request) + "/view/"+hash+"/"+style+".html" + widthParam;
					map.put("hash", hash);
					map.put("image_url", pngURL);
					map.put("page_url", pageURL);
					map.put("map", inMap);
					map.put("style", style);
					map.put("pdf_url", pdfURL);
					ModelAndView out = new ModelAndView("/jsp/surround", map);
					holder.out = out;
				}

				public boolean handleExistingOutput(String hash, HttpServletRequest req) {
					try {
						File map = getImageFile(hash, getStyle(style), ".map", width);
						if (map.exists()) {
							FileReader fr = new FileReader(map);
							StringWriter sw = new StringWriter(1000);
							RepositoryHelp.streamCopy(fr, sw, true);
							generatePage(sw.toString());						
						}
						
						return false;
					
					} catch (Exception e) {
						return false;
					}
				}

				public void handleException(Throwable t, HttpServletRequest req) {
					holder.out = t;
				}

				public void process(Project p, User u, Diagram d, String hash, boolean watermark) throws Exception {
					StringWriter sw = new StringWriter(1000);
					basicProcess(hash, style, d, watermark, null, sw, width, Format.PNG);
					generatePage(sw.toString());
				}

				public boolean checkComplexity(Project p, User u, DiagramSize ds) throws Exception {
					return true;
				}
				
				public String toString() {
					return "/view/*/*.html";
				}

				public Diagram getDiagram(String xml, File xmlFile, HttpServletRequest r) throws IOException {
					return getDiagramFromXML(xml, xmlFile, r);
				}
				
				
			}, request);
			
			if (holder.out instanceof Throwable) {
				throw (Throwable) holder.out;
			}
			
			return (ModelAndView) holder.out;

	}

}
