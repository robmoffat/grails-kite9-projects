package org.kite9.diagram.server;

/**
 * Contains project-specific settings for the diagram being generated. 
 * 
 * @author robmoffat
 *
 */
public class Project {
	
	public static final String SOMETHING = "Hello";

	public Project(int id, boolean license) {
		super();
		this.id = id;
		this.license = license;
	}

	public Project() {
	}
	
	private int id;
	private boolean license;
	
	public boolean isLicensed() {
		return license;
	}

	public void setLicensed(boolean license) {
		this.license = license;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}
	
	// csv format for the output file
	public String toString() {
		return id+",l="+license;
	}
}
