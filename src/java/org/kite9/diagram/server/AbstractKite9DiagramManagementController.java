package org.kite9.diagram.server;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.net.MalformedURLException;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.annotations.XStreamAlias;
import com.thoughtworks.xstream.io.HierarchicalStreamWriter;
import com.thoughtworks.xstream.io.json.JsonHierarchicalStreamDriver;
import com.thoughtworks.xstream.io.json.JsonWriter;

public class AbstractKite9DiagramManagementController extends AbstractKite9Controller {

	public AbstractKite9DiagramManagementController() {
		super();
		xs = getConfiguredXStream();
	}
	
	@XStreamAlias("diagram")
	public static class DiagramListItem {
		
		String name;
		String id;
		String lastHash;
		long lastModified;
		String lastModifiedStr;
		
		public DiagramListItem(String name, String id, String lastHash, long lastModified) {
			super();
			this.name = name;
			this.id = id;
			this.lastHash = lastHash;
			this.lastModified = lastModified;
		}
		
		
	}
	
	XStream xs;
	private XStream getConfiguredXStream() {

		XStream xs = new XStream(new JsonHierarchicalStreamDriver() {

			@Override
			public HierarchicalStreamWriter createWriter(Writer out) {
				return new JsonWriter(out, JsonWriter.DROP_ROOT_MODE);
			}
		});
		
		return xs;
	}
	
	/**
	 * Returns the user's file directory, or a file within it
	 */
	protected File getUserFile(String userDir, String file) throws MalformedURLException {
		return getFile("users", null, userDir, file);
	}
	
	/**
	 * Remember there are currently 2 files per diagram, so a limit of 10 means 5 diagrams.
	 */
	public int getUserRemainingQuota(String userDir, User u) throws IOException {
		File dir = getUserFile(userDir, null);
		int files = dir.list().length;
		return u.getDiagramSaveQuota() - (files / 2);
	}
	
}
