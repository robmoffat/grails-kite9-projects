package org.kite9.diagram.server;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.UnknownHostException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.mail.Message;
import javax.mail.Message.RecipientType;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.ServletContext;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.sql.DataSource;
import javax.xml.transform.Source;
import javax.xml.transform.sax.SAXSource;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;

import org.kite9.diagram.adl.Diagram;
import org.kite9.diagram.primitives.Connected;
import org.kite9.diagram.primitives.Connection;
import org.kite9.diagram.primitives.DiagramElement;
import org.kite9.diagram.visitors.DiagramElementVisitor;
import org.kite9.diagram.visitors.VisitorAction;
import org.kite9.diagram.visualization.display.java2d.style.Stylesheet;
import org.kite9.diagram.visualization.display.java2d.style.sheets.BasicBlueStylesheet;
import org.kite9.diagram.visualization.display.java2d.style.sheets.BasicStylesheet;
import org.kite9.diagram.visualization.display.java2d.style.sheets.CGWhiteStylesheet;
import org.kite9.diagram.visualization.display.java2d.style.sheets.Designer2012Stylesheet;
import org.kite9.diagram.visualization.display.java2d.style.sheets.DesignerStylesheet;
import org.kite9.diagram.visualization.display.java2d.style.sheets.OutlinerStylesheet;
import org.kite9.diagram.visualization.format.ClientSideMapRenderer;
import org.kite9.framework.common.Kite9ProcessingException;
import org.kite9.framework.common.RepositoryHelp;
import org.kite9.framework.logging.Kite9Log;
import org.kite9.framework.logging.LogicException;
import org.kite9.framework.serialization.XMLHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.context.ServletContextAware;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

public abstract class AbstractKite9Controller implements ServletContextAware {

	public static final int MAX_UNLICENSED_ELEMENTS = 20;
	public static final int MAX_NO_AUTH_ELEMENTS = 20;
	protected XMLHelper helper = new XMLHelper();
	protected JdbcTemplate template;

	protected static Map<String, Stylesheet> stylesheet;
	public static final String BASIC = "basic";
	public static final String DOCTYPE = "<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">";
	private static final Project LOCAL_PROJECT = new Project(1, true);
	private static final User LOCAL_USER = new User(999, "Mr Local", true, "", "");
	public static final User NO_USER = new User(-1, "(none)", false, "", "");
	public static final Project NO_PROJECT = new Project(-1, false);

	static {
		stylesheet = new HashMap<String, Stylesheet>();
		stylesheet.put(BASIC, new BasicStylesheet());
		stylesheet.put("cg_white", new CGWhiteStylesheet());
		stylesheet.put("blue", new BasicBlueStylesheet());
		stylesheet.put("outline", new OutlinerStylesheet());
		stylesheet.put("designer", new DesignerStylesheet());
		stylesheet.put("designer2012", new Designer2012Stylesheet());
		
	}

	public Stylesheet getStylesheet(String style) {
		Stylesheet out = stylesheet.get(style);
		if (out == null) {
			return stylesheet.get(BASIC);
		}

		return out;
	}

	public String getStyle(String style) {
		if (stylesheet.containsKey(style)) {
			return style;
		} else {
			return BASIC;
		}
	}

	public AbstractKite9Controller() {
		super();
		if (!isLocal()) {
			Kite9Log.setLogging(false);
			System.out.println("Setting logging off for diagrams");
		} else {
			System.out.println("Setting logging on for diagrams");
		}
	}

	@Autowired
	public void setDataSource(DataSource ds) {
		this.template = new JdbcTemplate(ds);
	}

	public static final String PROJECT_SQL_ROOT = "select ctp.nid as nid, field_key_value, ur.rid = 4 as license "
			+ "from content_type_project ctp " + "left join node n  on (n.nid = ctp.nid) "
			+ "left join users_roles ur ON ur.uid = n.uid " + "where (ur.rid is null or ur.rid = 4) ";

	public Project getProject(int projectId, String projectKey) {
		if (isLocal()) {
			return LOCAL_PROJECT;
		}

		try {
			Project out = (Project) template.queryForObject(
					PROJECT_SQL_ROOT + " and n.nid=? and ctp.field_key_value=?",
					new Object[] { projectId, projectKey }, createProjectRowMapper());

			return out;
		} catch (EmptyResultDataAccessException e) {
			return NO_PROJECT;
		} catch (DataAccessException e) {
			throw new InvalidProjectException("The Project with ID " + projectId + " and key " + projectKey
					+ " could not be retrieved from the server.", e);

		}
	}

	public static class User {

		public User(int i, String string, boolean b, String ip, String host) {
			this.number = i;
			this.userName = string;
			this.isLicensed = b;
			this.ip = ip;
			this.host = host;
		}

		public User() {
		}

		int number;
		String userName;
		boolean isLicensed;
		String ip;
		String host;

		public String toString() {
			return number + "," + userName + ",l=" + isLicensed + "," + ip + "," + host;
		}
		
		public int getDiagramSaveQuota() {
			return 50;
		}
	}

	/**
	 * Retrieves user info from cookie
	 */
	public User getUser(HttpServletRequest req) {
		if (isLocal()) {
			return LOCAL_USER;
		}

		Cookie[] cookies = req.getCookies();
		String wpCookieName = null;
		String wpCookieValue = null;
		if (cookies != null) {
			for (Cookie cookie : cookies) {
				if (cookie.getName().startsWith("wordpress_logged_in")) {
					wpCookieName = cookie.getName();
					wpCookieValue = cookie.getValue();
				}
			}
		}

		final String ip = req.getRemoteAddr();
		final String host = req.getRemoteHost();

		System.out.println("Session : " + wpCookieName+ " "+wpCookieValue);

		if (wpCookieName == null) {
			return NO_USER;
		}
		
		try { 
			URL u = new URL(URL_ROOT+"/kite9_user_info");
			URLConnection conn = u.openConnection();
			conn.setRequestProperty("Cookie", wpCookieName+"="+wpCookieValue);
			conn.connect();
			BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
			String line = br.readLine();
			br.close();
			if (line.contains("<none>")) {
				return NO_USER;
			} else {
				String parts[] = line.split(",");
				int id = Integer.parseInt(parts[1]);
				return new User(id, parts[0], false, ip, host);
			}
		} catch (IOException e) {
			throw new Kite9ProcessingException("Couldn't handle user log-in", e);
		}
	}

	protected boolean isLocal() {
		try {
			if (InetAddress.getLocalHost().toString().contains("kite9")) {
				return false;
			}
		} catch (UnknownHostException e) {
			return true;
		}

		return true;
	}

	private RowMapper<Project> createProjectRowMapper() {
		return new RowMapper<Project>() {

			public Project mapRow(ResultSet rs, int arg1) throws SQLException {
				Project p = new Project();
				p.setId(rs.getInt("nid"));
				p.setLicensed(rs.getInt("license") == 1);
				return p;
			}

		};
	}

	public Project getProject(String domain) {
		if (isLocal()) {
			return LOCAL_PROJECT;
		}
		try {
			Project out = (Project) template.queryForObject(PROJECT_SQL_ROOT + " and field_domain_name_value=?",
					new Object[] { domain }, createProjectRowMapper());

			return out;
		} catch (EmptyResultDataAccessException e) {
				return null;
		} catch (DataAccessException e) {
			throw new InvalidProjectException("The Project with domain " + domain
					+ " could not be retrieved from the server.", e);

		}
	}

	protected void storeDiagramDetails(Project p, User u, String fileName, long currentTime, boolean failed, DiagramSize mva, Action a, String xml) {
		try {
			String stamp = new SimpleDateFormat("HH:mm:ss").format(new Date());
			PrintWriter pw = new PrintWriter(new FileWriter(getDiagramLog(), true), false);
			pw.write(u + "," + p + "," + currentTime + "," + (failed ? "FAIL" : "GOOD") + "," + mva + ","
					+ a.toString() + "," + fileName + ","+stamp+"\n");
			pw.close();
		} catch (Exception e) {
			sendErrorEmail(e, xml, null);
		}
	}

	public File getDiagramLog() throws MalformedURLException {
		Date d = new Date();
		String log = "/diagram-log-" + new SimpleDateFormat("yyyyMMdd").format(d) + ".csv";

		File f = new File(getCacheRoot() + log);
		return f;
	}

	protected DiagramSize getDiagramSize(Diagram d) {
		DiagramElementVisitor vis = new DiagramElementVisitor();
		DiagramSize mva = new DiagramSize();
		vis.visit(d, mva);
		return mva;
	}

	public static class DiagramSize implements VisitorAction {

		public int connections = 0;
		public int connecteds = 0;

		public void visit(DiagramElement de) {
			if (de instanceof Connection) {
				connections++;
			} else if (de instanceof Connected) {
				connecteds++;
			}
		}

		public String toString() {
			return connections + "," + connecteds;
		}
	}

	/**
	 * Generates the SHA-1 hash of the XML content item.
	 */
	public static String generateHash(String xml) {
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-1");
			byte[] data = xml.getBytes();
			byte[] out = md.digest(data);

			// convert the byte to hex format method 1
			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < out.length; i++) {
				sb.append(Integer.toString((out[i] & 0xff) + 0x100, 16).substring(1));
			}

			return sb.toString();
		} catch (NoSuchAlgorithmException e) {
			throw new LogicException("Algorithm doesn't exist!", e);
		}
	}

	private static final String CACHE_ROOT = "/var/www/server.kite9.org/kite9-repo";
	private static final String STATIC_URL_ROOT = "http://kite9.com/kite9-repo/";
	private static final String LOCAL_URL_ROOT = "http://localhost:9080/org.kite9.diagram.server/";
	private static final String URL_ROOT = "http://kite9.com";

	/**
	 * Returns a handle to a file, whether or not it has been generated
	 * 
	 * @throws MalformedURLException
	 */
	public File getCacheFile(String hash, String name) throws MalformedURLException {
		String first = hash.substring(0, 3);
		String rest = hash.substring(3);
		return getFile("cache", first, rest, name);
	}
	
	
	
	/**
	 * Returns a handle to a file, whether or not it has been generated
	 * 
	 * @throws MalformedURLException
	 */
	public File getFile(String sub0, String sub1, String sub2, String name) throws MalformedURLException {
		File out = new File(getCacheRoot());
		out = createAndCheck(out, sub0);
		out = createAndCheck(out, sub1);
		out = createAndCheck(out, sub2);
		
		if (name ==null) {
			return out;
		}
		
		File actual = new File(out, name);

		return actual;
	}

	private File createAndCheck(File from, String name) {
		if (name != null) {
			from = new File(from, name);
		}
		if (!from.exists()) {
			boolean created = from.mkdir();
			if (!created) {
				throw new Kite9ProcessingException("Could not create directory for file cache (check inodes): "+from);
			}
		}
		
		return from;
	}

	protected String getCacheRoot() throws MalformedURLException {
		if (isLocal()) {
			if (ctx != null) {
				String out = new File(ctx.getRealPath("/")).getParent();
				return out + "/ROOT/kite9-repo";
			} else {
				return "target/kite9-repo";
			}
		} else {
			return CACHE_ROOT;
		}
	}

	protected String getStaticURLRoot() throws MalformedURLException {
		if (isLocal()) {
			return LOCAL_URL_ROOT;
		}
		return STATIC_URL_ROOT;
	}

	protected String getServletURLRoot(HttpServletRequest request) throws MalformedURLException {
		if (isLocal()) {
			return request.getContextPath();
		}
		return URL_ROOT+request.getContextPath();

	}

	protected String getXML(String hash, String file) throws IOException {
		File xmlFile = getCacheFile(hash, file);
		Reader xmlIn = new FileReader(xmlFile);
		StringWriter sw = new StringWriter(1000);
		RepositoryHelp.streamCopy(xmlIn, sw, true);
		return sw.toString();
	}

	protected String getXML(File xmlFile) throws IOException {
		Reader xmlIn = new FileReader(xmlFile);
		StringWriter sw = new StringWriter(1000);
		RepositoryHelp.streamCopy(xmlIn, sw, true);
		return sw.toString();
	}

	public static interface Action {

		public boolean handleExistingOutput(String hash, HttpServletRequest r);

		public void handleException(Throwable t,HttpServletRequest r);
		
		// builds a new diagram
		public Diagram getDiagram(String xml, File xmlFile, HttpServletRequest r) throws IOException;

		// pass in the diagram here.
		public void process(Project p, User u, Diagram d, String hash, boolean watermark) throws Exception;

		// return true if ok to generate
		public boolean checkComplexity(Project p, User u, DiagramSize ds) throws Exception;

	}

	protected void generateOrRetrieveDiagram(Project p, User u, String xml, String hash, Action a, HttpServletRequest r) {
		long time = System.currentTimeMillis();
		boolean ok = true;

		if ((hash == null) && (xml == null)) {
			throw new Kite9ProcessingException("No XML or Hash Provided!");
		}

		if (hash == null) {
			hash = generateHash(xml);
		}

		u = u == null ? NO_USER : u;
		p = p == null ? NO_PROJECT : p;

		File xmlFile;
		try {
			xmlFile = getCacheFile(hash, "diagram.xml");
		} catch (MalformedURLException e) {
			a.handleException(e, r);
			sendErrorEmail(e, null, r.getRequestURL().toString());
			return;
		}

		if (!a.handleExistingOutput(hash, r)) {
			// ok, diagram needs to be generated.
			DiagramSize ds = new DiagramSize();
			Diagram d = null;

			try {
				d = a.getDiagram(xml, xmlFile, r);

				if (d == null) {
					throw new Kite9ProcessingException("No Diagram Provided (xml contains no diagram): \n" + xml);
				}

				ds = getDiagramSize(d);

				if (a.checkComplexity(p, u, ds)) {
					goDiagramGeneration(p, u, hash, a, d);
				}

			} catch (Throwable t) {
				log("Could not generate diagram: \n" + xml, t);
				a.handleException(t, r);
				ok = false;
				sendErrorEmail(t, xml, r.getRequestURL().toString());
			} finally {
				storeDiagramDetails(p, u, xmlFile.toString(), System.currentTimeMillis() - time, !ok, ds, a, xml);
				storeDiagramXML(xmlFile, xml);
			}
		}
	}

	protected Object loadXML(String xml, File xmlFile, HttpServletRequest r) throws IOException {
		return helper.fromXML(xml);
	}

	/**
	 * Ensures a time limit on diagram generation of 20 seconds.
	 */
	protected void goDiagramGeneration(final Project p, final User u, final String hash, final Action a, final Diagram d) throws Exception {
		final Thread me = Thread.currentThread();
		final boolean watermark = !(u.isLicensed || p.isLicensed());
		Thread timer = new Thread(new Runnable() {
			
			public void run() {
				try {
					Thread.sleep(20000);
					me.interrupt();
				} catch (InterruptedException e) {
					// exit normally, the diagram is complete.
					log("Diagram completed ok", null);
				}
			}
		});
		
		try {
			timer.start();
			a.process(p, u, d, hash, watermark);
		} catch (InterruptedException e) {
			// run out of time.
			log("Run out of time generating diagram", null);
			throw new Kite9ProcessingException("Diagram couldn't be completed in time");
		} finally {
			timer.interrupt();
		}
	}

	protected void log(String string, Throwable e) {
		if (ctx!=null) {
			ctx.log(string, e);
		} else {
			System.out.println(string);
			if (e!=null) {
				e.printStackTrace();
			}
		}
	}

	protected void storeDiagramXML(File xmlFile, String xml) {
		try {
			if ((!xmlFile.exists()) && (xml != null)){
				File f = xmlFile.getParentFile();
				if (!f.exists()) {
					f.mkdir();
				}
				Writer xmlOut = new OutputStreamWriter(new FileOutputStream(xmlFile));
				xmlOut.write(xml);
				xmlOut.close();
			}
		} catch (Throwable t) {
			sendErrorEmail(t, xml, xmlFile.toString());
		}
	}
	
	protected void sendErrorFormBack(OutputStream os, String formName) throws IOException {
		OutputStreamWriter osw = new OutputStreamWriter(os);
		osw.write("form="+formName);
		osw.close();
	}
	
	private String pattern = "[^0-9_a-zA-Z\\(\\)\\%\\-\\.]";
    private Pattern filePattern = Pattern.compile(pattern);
	
	protected String sanitizeFilePath(String badFileName) {
	    StringBuffer cleanFileName = new StringBuffer();
	    Matcher fileMatcher = filePattern.matcher(badFileName);
	    boolean match = fileMatcher.find();
	    while(match) {
	        fileMatcher.appendReplacement(cleanFileName, "");
	        match = fileMatcher.find();
	    }
        fileMatcher.appendTail(cleanFileName);
	    return cleanFileName.substring(0, cleanFileName.length() > 250 ? 250 : cleanFileName.length());         
	}

	protected boolean basicCheckComplexity(Project p, User u, DiagramSize mva) {
		if (getAccessType(p, u) != AccessType.LICENSED) {
			if (mva.connecteds > MAX_UNLICENSED_ELEMENTS) {
				throw new Kite9ProcessingException("To have more than " + MAX_UNLICENSED_ELEMENTS
						+ " attr, you will need a kite9 license.  Your diagram has " + mva.connecteds + " attr. User=" + u);
			}
		}

		return true;
	}

	public enum AccessType {
		NO_AUTH, LOGGED_IN, LICENSED
	};

	public AccessType getAccessType(Project p, User u) {
		// check license
		if ((p != null) && (p.isLicensed())) {
			return AccessType.LICENSED;
		}

		if (u != null) {
			if (u.isLicensed) {
				return AccessType.LICENSED;
			} else {
				return AccessType.LOGGED_IN;
			}
		}

		return AccessType.NO_AUTH;
	}

	protected ClientSideMapRenderer createMapRenderer() {
		return new ClientSideMapRenderer(10);
	}

	protected void validateXML(String xml) throws SAXException, IOException {
		// validate the xml against the schema
		InputSource is = new InputSource(new StringReader(xml));

		SchemaFactory factory = SchemaFactory.newInstance("http://www.w3.org/2001/XMLSchema");

		// load a WXS schema, represented by a Schema instance
		Source schemaFile = new StreamSource(Diagram.class.getResourceAsStream("/adl_1.0.xsd"));
		Schema schema = factory.newSchema(schemaFile);

		Validator validator = schema.newValidator();

		SAXSource source = new SAXSource(is);
		validator.validate(source);
	}

	private ServletContext ctx;

	public void setServletContext(ServletContext servletContext) {
		this.ctx = servletContext;
	}

	protected void handleException(Exception ee, OutputStream os) {
		StringBuilder out = new StringBuilder();
		if (ee instanceof SAXParseException) {
			SAXParseException e = (SAXParseException) ee;
			out.append("<html><head><title>Validation Error</title></head><body>\n");
			out.append("<h1>Validation Error</h1>\n");
			out.append("<p>Line: " + e.getLineNumber() + "</p>\n");
			out.append("<p>Column: " + e.getColumnNumber() + "</p>\n");
			formatMessage(out, e.getMessage());
		} else {
			out.append("<html><head><title>XML Error</title></head><body>\n");
			out.append("<h1>Validation Error</h1>\n");
			formatMessage(out, ee.getMessage());
		}

		PrintWriter psw = new PrintWriter(os);
		psw.append(out.toString());
		psw.append("<h2>Detail: </h2>\n");
		psw.append("<pre>/n");
		ee.printStackTrace(psw);
		psw.append("</pre></body></html>");
		psw.close();
	}

	private void formatMessage(StringBuilder out, String m) {
		out.append("<h2>Message</h2>\n");
		out.append("<p>");
		out.append(m.replaceAll("\n", "</p><p>"));
		out.append("</p>");
	}

	public void sendErrorEmail(Throwable t, String xml, String url) {
		try {
			Properties props = new Properties();
			props.put("mail.smtp.host", "server.kite9.org");
			Session session = Session.getInstance(props);
			Message msg = new MimeMessage(session);
			msg.setFrom(new InternetAddress("servicetest@kite9.com"));
			msg.setRecipient(RecipientType.TO, new InternetAddress("rob@kite9.com"));
			String name = ctx.getServletContextName();
			boolean local = isLocal();
			msg.setSubject("Failure in "+(local ? "TEST" : name)+" Service: " + this.getClass().getName());
			StringWriter sw = new StringWriter(10000);
			PrintWriter pw = new PrintWriter(sw);
			pw.write("URL: "+url+"\n");
			
			t.printStackTrace(pw);
			
			if (xml!=null) {
				pw.println();
				pw.print(xml);
			}
			
			pw.close();
			msg.setText(sw.toString());
			Transport.send(msg);
		} catch (Exception e) {
		} finally {
			t.printStackTrace();
		}
	}
	
	protected Diagram getDiagramFromXML(String xml, File xmlFile, HttpServletRequest r) throws IOException {
		if ((xml == null) && (xmlFile != null) && (xmlFile.exists())) {
			xml = getXML(xmlFile);
		}
		
		if (xml == null) {
			// empty diagram
			xml = "<?xml version=\"1.0\" ?><diagram xmlns=\"http://www.kite9.org/schema/adl\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" id=\"empty\"><allLinks></allLinks></diagram>";
		}

		Object o = loadXML(xml, xmlFile, r);

		if (o instanceof Diagram) {
			return (Diagram) o;
		}

		throw new Kite9ProcessingException("Can't parse xml into diagram: "+xml);
	}
}