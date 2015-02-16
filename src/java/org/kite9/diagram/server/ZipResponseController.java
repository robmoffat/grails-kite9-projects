package org.kite9.diagram.server;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintStream;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;

import org.kite9.diagram.adl.Diagram;
import org.kite9.framework.common.Kite9ProcessingException;
import org.kite9.framework.common.RepositoryHelp;
import org.kite9.framework.server.WorkItem;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * This controller responds to the XML request by returning a zip file containing 
 * all of the various diagrams asked for.  This is used by the java diagram server.
 * @author robmoffat
 *
 */
@Controller
public class ZipResponseController extends AbstractImageGeneratingController {
	
	static class EHolder {
		Throwable t;
		
	}

	@RequestMapping("/image.zip")
	public void generateDiagram(@RequestBody String item, final OutputStream os, final HttpServletRequest req) throws IOException {
		final WorkItem workItem = (WorkItem) helper.fromXML(item);
		final EHolder holder = new EHolder();
		String xml = null;
		Project p = null;
		
		try {
				int projectId = workItem.getProjectId();
				String projectKey = workItem.getSecretKey();
				p = getProject(projectId, projectKey);
				xml = helper.toXML((Diagram) workItem.getDesignItem());
		} catch (Exception e) {
				holder.t = e;
		}
	
		generateOrRetrieveDiagram(p, null, xml, null, new Action() {
			
			public void beginZipEntry(WorkItem workItem, String fileExtension, ZipOutputStream zos) throws IOException {
				ZipEntry ze = new ZipEntry(workItem.getSubjectId() + "/" + workItem.getName() + "." + fileExtension);
				zos.putNextEntry(ze);
			}
			
			public Diagram getDiagram(String xml, File xmlFile, HttpServletRequest r) throws IOException {
				return getDiagramFromXML(xml, xmlFile, r);
			}
			
			public void writeOutputs(Reader map, InputStream bytes) throws IOException {
				ZipOutputStream zos = new ZipOutputStream(os);
				
				beginZipEntry(workItem, "png", zos);
				RepositoryHelp.streamCopy(bytes, zos, false);
				zos.closeEntry();

				beginZipEntry(workItem, "map", zos);
				OutputStreamWriter osw = new OutputStreamWriter(zos);
				RepositoryHelp.streamCopy(map, osw, false);
				osw.flush();
				zos.closeEntry();
				
				if (holder.t != null) {
					beginZipEntry(workItem, "exception", zos);
					PrintStream ps = new PrintStream(zos);
					holder.t.printStackTrace(ps);
					ps.flush();
					zos.closeEntry();
				}
				
				zos.close();
				osw.close();
			}

			public boolean handleExistingOutput(String hash, HttpServletRequest req) {
				try {
					File png = getImageFile(hash, BASIC, ".png", null);
					File map = getImageFile(hash, BASIC, ".map", null);
					
					if (map.exists()) {
						Reader mapIn = new InputStreamReader(new FileInputStream(map));
						InputStream pngIn = new FileInputStream(png);
						writeOutputs(mapIn, pngIn);
						return true;
					} else {
						return false;
					}
				} catch (Exception e) {
					return false;
				}
			}

			public void handleException(Throwable t, HttpServletRequest req) {
				holder.t = t;
			}

			public void process(Project p, User u, Diagram d, String hash, boolean watermark) throws Exception {
				ByteArrayOutputStream baos = new ByteArrayOutputStream(10000);
				StringWriter sw = new StringWriter(1000);
				
				basicProcess(hash, BASIC, d, watermark, baos, sw, null, Format.PNG);
				writeOutputs(new StringReader(sw.toString()), new ByteArrayInputStream(baos.toByteArray()));
			}

			public boolean checkComplexity(Project p, User u, DiagramSize ds) throws Exception {
				return basicCheckComplexity(p, u, ds);

			}

			public String toString() {
				return "/image.zip";
			}
			
		}, req);
		
		if (holder.t != null) {
			throw new Kite9ProcessingException(holder.t);
		}
			
	}
	

}
