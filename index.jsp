<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>CMS 3D Event Display</title>
	
		<link href="./css/scrollbar.css" rel="stylesheet" type="text/css" />
		<link href="./css/eventdisplay.css" rel="stylesheet" type="text/css" />		
		<link href="./css/settings.css" rel="stylesheet" type="text/css" />
		<link href="./css/range-selection.css" rel="stylesheet" type="text/css" />
		<link href="./css/event-browser.css" rel="stylesheet" type="text/css" />
		<link href="./css/speed-test.css" rel="stylesheet" type="text/css" />
		
		<script src="./js/jquery-1.9.0.js"></script>
        <script src="./js/jquery-migrate-1.0.0.js"></script>

		<script type="text/javascript" src="js/three.js"></script>
		<script type="text/javascript" src="js/TrackballControls.js"></script>

		<script src="./js/setup.js"></script>
		<script src="./js/detector-model-gen.js"></script>
		<script src="./js/detector-model-geometry.js"></script>
		<script src="./js/object-conversion.js"></script>
		<script src="./js/data-description.js"></script>
		<script src="./js/eventdisplay.js"></script>

		<script src="./js/about.js"></script>
		<script src="./js/settings.js"></script>
		<script src="./js/event-browser.js"></script>
		<script src="./js/range-selection.js"></script>
		<script src="./js/speed-test.js"></script>

		<script src="./js/elab.js"></script>
		<script src="./js/utils.js"></script>
		<script src="./js/flexcroll.js"></script>
		
		<!--
		<script src="./js/pre3d.js"></script>
		<script src="./js/pre3d_shape_utils.js"></script>
		<script src="./js/demo_utils.js"></script>
		-->
		<script src="./js/base64.js"></script>
		<script src="./js/canvas2image.js"></script>
		<script src="./js/object-conversion.js"></script>
		
		<script src="./js/save.js"></script>
	</head>
	<body class="black">
<table>
	<tr>
		<td colspan="2" class="titlebar-plain bordered">
			<div id="title"></div>
		</td>
	</tr>
	<tr height="24px">
		<td colspan="2" class="bordered">
			<%@ include file="./jsp/toolbar.jspf" %>
		</td>
	</tr>
	<tr>
		<td width="280px" class="bordered">
			<div id="switches-div" style="overflow: auto; height: 600px;" class="flexcroll">
				<table id="switches" width="266px">
				</table>
			</div>
		</td>
		<td class="bordered">
			<!-- This is where the canvas goes -->
			<div id="container"></div>
		</td>
	</tr>
	<tr>
		<td class="bordered">
			<%@ include file="./jsp/controls-help.jspf" %>
		</td>
		<td class="bordered">
		</td>
	</tr>
</table>

<%@ include file="./jsp/settings.jspf" %>
<%@ include file="./jsp/range-selection.jspf" %>
<%@ include file="./jsp/event-browser.jspf" %>
<%@ include file="./jsp/speed-test.jspf" %>
<%@ include file="./jsp/about.jspf" %>
<%@ include file="./jsp/detector-help.jspf" %>

<script type="text/javascript">
	$(function() {
    	EVD.init();
    	EVD.animate();
    });
</script>

</body>
</html>
