package org.kite9.diagram.server;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import javax.imageio.ImageIO;

import org.kite9.diagram.adl.Diagram;
import org.kite9.diagram.visualization.display.java2d.GriddedCompleteDisplayer;
import org.kite9.diagram.visualization.display.java2d.adl_basic.ADLBasicCompleteDisplayer;
import org.kite9.diagram.visualization.display.java2d.style.Stylesheet;
import org.kite9.diagram.visualization.format.pdf.PDFRenderer;
import org.kite9.diagram.visualization.format.png.BufferedImageRenderer;
import org.kite9.diagram.visualization.pipeline.ImageRenderingPipeline;
import org.springframework.http.MediaType;

/**
 * Handles sending a certain file format to the output stream for http responses.
 * 
 * @author robmoffat
 *
 */
public interface Format {
	
	public MediaType getMediaType();

	public void handleWrite(Diagram d, OutputStream baos, File imageFile,
			Stylesheet ss, boolean watermark, Integer width) throws IOException;
	
	public String getExtension();
	
	
	public static Format PDF = new Format() {
		
		MediaType PDF_MEDIA_TYPE = new MediaType("application", "pdf");
		
		public MediaType getMediaType() {
			return PDF_MEDIA_TYPE;
		}

		public void handleWrite(Diagram d, OutputStream baos, File imageFile,
				Stylesheet ss, boolean watermark, Integer width) throws IOException {
			ImageRenderingPipeline<byte[]> p = new ImageRenderingPipeline<byte[]>(new GriddedCompleteDisplayer(new ADLBasicCompleteDisplayer(ss, watermark, false),ss),
					new PDFRenderer());

			byte[] bi = p.process(d);
			if (imageFile != null) {
				FileOutputStream fos = new FileOutputStream(imageFile);
				fos.write(bi);
				fos.close();
			}
			if (baos != null) {
				baos.write(bi);
				baos.flush();
			}
		}

		public String getExtension() {
			return ".pdf";
		}
	};
	
	Format PNG = new Format() {
		

		public MediaType getMediaType() {
			return MediaType.IMAGE_PNG;
		}



		public void handleWrite(Diagram d, OutputStream baos, File imageFile, Stylesheet ss,
				boolean watermark, Integer width) throws IOException {
			ImageRenderingPipeline<BufferedImage> p = new ImageRenderingPipeline<BufferedImage>(new GriddedCompleteDisplayer(new ADLBasicCompleteDisplayer(ss, watermark, false),ss),
					new BufferedImageRenderer(width));

			BufferedImage bi = p.process(d);
			if (imageFile != null) {
				ImageIO.write(bi, "PNG", imageFile);
			}
			if (baos != null) {
				ImageIO.write(bi, "PNG", baos);
			}
		}



		public String getExtension() {
			return ".png";
		}

	};

}
