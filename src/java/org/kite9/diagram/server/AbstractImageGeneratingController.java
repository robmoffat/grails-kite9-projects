package org.kite9.diagram.server;

import java.io.File;
import java.io.FileWriter;
import java.io.OutputStream;
import java.io.StringReader;
import java.io.Writer;
import java.net.MalformedURLException;

import org.kite9.diagram.adl.Diagram;
import org.kite9.diagram.visualization.format.ClientSideMapRenderer;
import org.kite9.framework.common.RepositoryHelp;
import org.springframework.http.ResponseEntity;

public class AbstractImageGeneratingController extends AbstractKite9Controller {

	class REHolder {

		ResponseEntity<byte[]> out;

	}
	
	public File getImageFile(String hash, String style, String ext, Integer width) throws MalformedURLException {
		String filePart;
		if (width == null) {
			filePart = getStyle(style) + ext;
		} else {
			filePart = getStyle(style)+"-"+width+"px"+ext;
		}
		return getCacheFile(hash, filePart);
	}
	
	/**
	 * Generates the diagram png and the map file and stores in the cache.  Writes to outputs if provided.
	 */
	public void basicProcess(String hash, String style, Diagram d, boolean watermark, OutputStream baos, Writer mapTo, Integer width, Format fmt) throws Exception {
		style =getStyle(style);
		File imageFile = getImageFile(hash, style, ".png", width);
		File mapFile = getImageFile(hash, style, ".map", width);

		// render and send the image
		fmt.handleWrite(d, baos, imageFile, getStylesheet(style), watermark, width);

		// store the map for next time
		ClientSideMapRenderer csmr = createMapRenderer();
		String mapOut = csmr.render(d);
		StringReader sr = new StringReader(mapOut);
		RepositoryHelp.streamCopy(sr, new FileWriter(mapFile), true);
		if (mapTo != null) {
			sr.reset();
			RepositoryHelp.streamCopy(sr, mapTo, true);
		}
		
	}
}
