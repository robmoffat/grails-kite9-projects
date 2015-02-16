package org.kite9.diagram.server;

import java.io.File;
import java.io.FileFilter;
import java.io.FileReader;
import java.io.IOException;
import java.io.Writer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.kite9.framework.common.RepositoryHelp;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class DiagramManagementController extends AbstractKite9DiagramManagementController {

	@RequestMapping("/user-can-save")
	public void userCanSave(
			HttpServletRequest req, 
			HttpServletResponse out) throws IOException {
		
		User u = getUser(req);
		String sanitized = sanitizeFilePath(u.userName);
		Writer w = out.getWriter();
		
		int q = getUserRemainingQuota(sanitized, u);
		w.write("["+q+"]");
		log("User "+u.userName+" has quota: "+q, null);
		w.flush();
		w.close();
	}
	
	@RequestMapping("/user-details")
	public void userDetails(
			HttpServletRequest req, 
			HttpServletResponse out) throws IOException {
		
		User u = getUser(req);
		Writer w = out.getWriter();
		String towrite = xs.toXML(u);
		w.write(towrite);
		w.close();
	}
	
	

	@RequestMapping("/list-user-diagrams")
	public void listDiagrams(
			HttpServletRequest req, 
			HttpServletResponse out) throws IOException {
		User u = getUser(req);
		
		if (u==NO_USER) {
			sendErrorFormBack(out.getOutputStream(), "login");
		}
		
		String sanitized = sanitizeFilePath(u.userName);
		
		File dir = getUserFile(sanitized, null);
		File[] matches = dir.listFiles(new FileFilter() {
			
			public boolean accept(File arg0) {
				return (arg0.getName().endsWith(".details"));
			}
		});
		
		
		Writer w = out.getWriter();
		w.write("[\n");
		boolean addComma = false;
		
		for (File file : matches) {
			if (addComma) {
				w.write(",\n");
			}
			addComma = true;
			RepositoryHelp.streamCopy(new FileReader(file), w, false);
		}
		
		w.write("]");
		w.close();
	}
	
	

}
