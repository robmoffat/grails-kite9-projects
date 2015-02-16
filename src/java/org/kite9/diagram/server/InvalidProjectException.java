package org.kite9.diagram.server;

import org.kite9.framework.common.Kite9ProcessingException;
import org.springframework.dao.DataAccessException;

public class InvalidProjectException extends Kite9ProcessingException {

	public InvalidProjectException(String arg0) {
		super(arg0);
	}

	public InvalidProjectException(String string, DataAccessException e) {
		super(string, e);
	}

	private static final long serialVersionUID = -996297657502469198L;

}
