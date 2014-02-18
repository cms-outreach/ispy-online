<%@ include file="../include/elab.jsp" %>
<%@ page import="gov.fnal.elab.util.URLEncoder" %>
<%@ page import="gov.fnal.elab.ElabGroup" %>

<%
if (!ElabGroup.isUserLoggedIn(session)) {
%>
	<!-- not logged in -->
	<div id="login-form">
		<div id="login-form-header">
			<h2>Log in</h2>
		</div>
		<div id="login-form-contents">
			<%@ include file="login-form.jsp" %>
		</div>
		<div id="login-form-text">
			<p>
				To explore our website, <br /><a href="<%= elab.getGuestLoginLink(request) %>">log in as guest</a>
			</p>
			
			<h2>Need a student login?</h2>
			<p>Ask your teacher.</p>
			
			<%
								String subject = URLEncoder.encode(elab.getName() + " elab account request");
								String body = URLEncoder.encode("Please complete each of the fields below and send this email to be registered " 
									+ "as an e-Labs teacher. You will receive a response from the e-Labs team by the end of the business "
									+ "day.\n\n"
									+ "First Name:\n\n"
									+ "Last Name:\n\n"
									+ "City:\n\n"
									+ "State:\n\n"
									+ "School:\n");
								String mailURL = "mailto:e-labs@fnal.gov?Subject=" + subject + "&Body=" + body;
						%>
			<h2>Need a teacher login?</h2>
			<p>Contact 
			<a href="<%= mailURL %>">e-labs@fnal.gov</a>
			</p>
		</div>
	</div>
<%
	}
	else {
%>
	<!-- yes logged in -->
<!--  For new home page with study guide - we don't want to display the logout
	<div id="login-form">
		<div id="login-form-header">
			<h2>Logout</h2>
		</div>
		<div id="login-form-contents">
			<form method="post" action="../login/logout.jsp">
				<table>
					<tr>
						<td class="form-label">
							If you are not 
							<span class="username"><%=ElabGroup.getUser(session).getName()%></span>,
						</td>
					</tr>
					<tr>
						<td class="form-label">
							<input type="submit" name="logout" value="Logout" />
						</td>
					</tr>
				</table>
			</form>
		</div>
	</div>
 -->
<%
	}
%>
