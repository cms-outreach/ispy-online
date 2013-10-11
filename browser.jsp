<%@ include file="../include/elab.jsp" %>
<%@ page import="java.io.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.util.zip.*" %>
<%
	// alternatively set the data location manually for standalone use
	String dataLocation = elab.getProperty("event.display.data.location");
	//String dataLocation = "/home/mike/Desktop";
	String op = request.getParameter("op");
	String param = request.getParameter("param");
	
	response.setHeader("Cache-Control", "no-cache");
	System.out.println("Event display browser: op = " + op + ", param = " + param);
	if ("list".equals(op)) {
	    if (param == null) {
	        throw new RuntimeException("Missing directory parameter");
	    }
	    File loc = new File(dataLocation);
	    File dir = new File(loc, param);
	    String cloc = loc.getCanonicalPath();
	    String cdir = dir.getCanonicalPath();
	    if (!cdir.startsWith(cloc)) {
	        dir = loc;
	    }
	    if (!dir.exists()) {
	        dir = loc;
	    }
	    cdir = dir.getCanonicalPath();
	    File[] fs = dir.listFiles(new FileFilter() {
	        public boolean accept(File f) {
	            return f.isDirectory() || f.getName().endsWith(".ig");
	        }
	    });
	    Arrays.sort(fs, new Comparator<File>() {
	        public int compare(File f, File g) {
	            if (f.isDirectory() == g.isDirectory()) {
	                return f.getName().compareTo(g.getName());
	            }
	            else {
	                return f.isDirectory() ? -1 : 1;
	            }
	        }
	    });

	    out.write("[\"" + cdir.substring(cloc.length()) + "\", ");
	    out.write("[");
	    boolean first = true;
	    if (!dir.getCanonicalPath().equals(loc.getCanonicalPath())) {
	        out.write("{ type: 1, name: \"..\"}");
	        first = false;
	    }
	    for (File f : fs) {
	        if (first) {
	            first = false;
	        }
	        else {
	            out.write(", ");
	        }
	        out.write("{ type: " + (f.isDirectory() ? 1 : 0) + ", name: \"" + f.getName() + "\" }");
	    }
	    out.write("]]");
	}
	else if ("events".equals(op)) {
	    File loc = new File(dataLocation);
	    File igf = new File(loc, param);
	    String cloc = loc.getCanonicalPath();
	    String cigf = igf.getCanonicalPath();
	    if (!cigf.startsWith(cloc)) {
	        throw new RuntimeException("Invalid file: " + param);
	    }
	    ZipFile zf = new ZipFile(igf);
	    Enumeration<? extends ZipEntry> entries = zf.entries();
	    boolean first = true;
	    out.write("[\"" + cigf.substring(cloc.length()) + "\", ");
	    out.write("[");
	    while (entries.hasMoreElements()) {
	        ZipEntry e = entries.nextElement();
	        if (e.isDirectory()) {
	            continue;
	        }
	        if (e.getName().startsWith("Events") || e.getName().startsWith("Geometry")) {
	     	 	if (first) {
	     	 	    first = false;
	     	 	}
	     	 	else {
	     	 	    out.write(", ");
	     	 	}
	     	 	out.write("{ type: 2, name: \"" + e.getName() + "\", size: " + e.getSize() + " }");  
	        }
	    }
	    out.write("]]");
	    zf.close();
	}
	else if ("get".equals(op)) {
	    String[] ps = param.split(":");
	    File loc = new File(dataLocation);
	    File igf = new File(loc, ps[0]);
	    if (!igf.getCanonicalPath().startsWith(loc.getCanonicalPath())) {
	        throw new RuntimeException("Invalid file: " + ps[0]);
	    }
	    ZipFile zf = new ZipFile(igf);
	    ZipEntry e = zf.getEntry(ps[1]);
	    if (e == null) {
	    	throw new RuntimeException("Event not found: " + ps[1]);
	    }
	    BufferedInputStream bis = new BufferedInputStream(zf.getInputStream(e));
	    byte[] buf = new byte[16384];
	    int len = bis.read(buf);
	    while (len >= 0) {
	        for (int i = 0; i < len; i++) {
	        	byte c = buf[i];
	        	switch (c) {
	        	    case '(':
	        	        c = '[';
	        	        break;
	        	    case ')':
	        	        c = ']';
	        	    	break;
	        	}
	        	out.write(c);
	        }
	        len = bis.read(buf);
	    }
	}
	else {
	    throw new RuntimeException("Unrecognized operation: " + op);
	}
%>