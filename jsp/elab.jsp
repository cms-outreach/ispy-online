<%@ page import="gov.fnal.elab.Elab" %>
<%@ page import="gov.fnal.elab.ElabGroup" %>

<%@ include file="../login/session-invalidator.jspf" %>

<%	
	Elab elab = Elab.getElab(pageContext, "cms");
	request.setAttribute("elab", elab);
	request.setAttribute("user", ElabGroup.getUser(session));
%>