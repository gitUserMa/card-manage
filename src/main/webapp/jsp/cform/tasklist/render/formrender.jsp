<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html; charset=UTF-8"%>
<%@ taglib uri="/tags/next-web" prefix="next"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ page import="org.loushang.cform.api.ProcFormService" %>
<%@ page import="org.loushang.cform.api.IProcFormQuery" %>
<%@ page import="org.loushang.cform.api.FormService" %>
<%@ page import="org.loushang.cform.api.IFormQuery" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page import="org.loushang.cform.util.BspUtil"%>
<%
	String contextPath = request.getContextPath();
    String actDefUniqueId=request.getParameter("actDefUniqueId");
	String formId = request.getParameter("formId");
	String formDataId = request.getParameter("formDataId");
	String assignmentId = request.getParameter("assignmentId");
	String procDefUniqueId = request.getParameter("procDefUniqueId");
	String processId = request.getParameter("processId");
	if(formDataId==null){
		formDataId="";
	}
	if(assignmentId==null){
		assignmentId="";
	}
	if(procDefUniqueId==null){
		procDefUniqueId="";
	}
	if(processId==null){
		processId="";
	}
	
	//任务类型--0:新建任务,1:待办任务,2:已办任务,3:办结任务,9:历史记录
	String taskType=request.getParameter("taskType");
	
	//渲染按钮
	IProcFormQuery pFormQuery = ProcFormService.getProcFormQuery();
	List actBtns = pFormQuery.getActFormBtn(actDefUniqueId,formId,taskType);
	
	//获取bsp应用的上下文
	String bspAppName = BspUtil.getBspAppName();
	String bspAppPath;
	if(bspAppName == "."){  // 如果是集成部署，那么bsp的上下文就是当前应用的上下文
		bspAppPath = contextPath;
	}else if (80 == request.getServerPort()) {
		bspAppPath = request.getScheme() + "://"
			+ request.getServerName()
			+ bspAppName + "/";
	} else {
		bspAppPath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+bspAppName + "/";
	}
%>
<html>
<head>
<next:ScriptManager></next:ScriptManager>
<link rel="stylesheet" href="<%=contextPath%>/jsp/cform/skin/css/bootstrap.css">
<link rel="stylesheet" href="<%=contextPath%>/jsp/cform/skin/css/jquery.combo.select.css">
<link rel="stylesheet" href="<%=contextPath%>/jsp/cform/skin/css/cform.css">
<link rel="stylesheet" href="<%=contextPath%>/jsp/cform/tasklist/render/css/formrender.css">
<link rel="stylesheet" href="<%=contextPath%>/jsp/cform/skin/css/form.css">
<link rel="stylesheet" href="<%=contextPath%>/jsp/cform/skin/css/ui.css">
<link rel="stylesheet" href="<%=contextPath%>/skins/skin/css/font-awesome.css">
	<%--二维码图片样式--%>
	<link rel="stylesheet" href="<%=contextPath%>/jsp/cform/builder/widget/image/image.css">
<%
  //业务自定义样式
  IFormQuery formQuery=FormService.getFormQuery();
  out.println(formQuery.getFormTheme(formId,contextPath));
%>

<script src="<%=contextPath%>/skins/js/jquery.js"></script>
<script src="<%=contextPath%>/skins/js/bootstrap.js"></script>
<script src="<%=contextPath%>/jsp/cform/skin/js/form.js"></script>
<script src="<%=contextPath%>/jsp/cform/skin/js/autosize.js"></script>
<script src="<%=contextPath%>/jsp/cform/skin/js/cform.js"></script>
<script src="<%=contextPath%>/jsp/cform/skin/js/cforml5.js"></script>
<script src="<%=contextPath%>/jsp/cform/skin/js/jquery-ui-dialog.js"></script>
<script src="<%=contextPath%>/jsp/cform/skin/js/ajaxfileupload.js"></script>
<script src="<%=contextPath%>/jsp/cform/skin/js/jquery.combo.select.js"></script>

<script src="<%=contextPath%>/skins/js/i18n.js"></script>
<script src="<%=contextPath%>/jsp/cform/tasklist/render/js/formrender.js"></script>
<script src="<%=contextPath%>/jsp/cform/tasklist/action/formaction.js"></script>
</head>
<body class="body">
<!-- 遮罩 -->
<div class="loading-container">
<ul id="tab" class="nav nav-tabs ue-tabs">
    <li><a id="basicformbtn" href="#basicform" data-toggle="tab"><spring:message code="cf.basicform" text="基础表单"/></a></li>
    <li class="active"><a id="flowformbtn" href="#flowform" data-toggle="tab"><spring:message code="cf.flowform" text="表单操作"/></a></li>
    <li><a id="flowchartbtn" href="#flowchart" data-toggle="tab"><spring:message code="cf.flowchart" text="流程图示"/></a></li>
</ul>
<div id="tabContent" class="tab-content">
	<div class="tab-pane" id="basicform">
		<iframe class="historyform"></iframe>
	</div>
	<div class="tab-pane active" id="flowform">
		<!-- 操作按钮 -->
		<div id="btnContainer" class="btnContainer"></div>
		<!-- 表单内容(html)容器 -->
		<div id="htmlContainer" class="htmlContainer" align="center"></div>
		<hr/>
		<!-- 历史操作记录 -->
		<div id="historyInfoContainer" class="historyInfoContainer">
			<span class="historyInfoBtn"><i class="fa fa-plus"></i><spring:message code="cf.expandall" text="全部显示"/></span>
			<ul class="historyInfos"></ul>
		</div>
	</div>
	<div class="tab-pane" id="flowchart">
		<!-- 流程图容器 -->
		<iframe id="flowchartContainer" class="flowchartContainer"></iframe>
	</div>
</div>
</div>
<script type="text/javascript">
var taskType = '<%=taskType%>';
var formDataId='<%=formDataId%>';
var contextPath = '<%=contextPath%>';
var bspAppPath = '<%=bspAppPath%>';
var isShowFlowChart = false;//全局控制是否显示流程图
var isShowHistoryInfo = false;//全局控制是否显示历史记录
var isShowBasicForm = false;//全局控制是否显示基础表单
var $t = $('.loading-container');//遮罩容器
//请求按钮的url
var actFormBtnUrl = contextPath + "/command/dispatcher/"+
              "org.loushang.cform.tasklist.cmd.RenderDispatcherCmd/renderActFormBtn"+
              "?actDefUniqueId=<%=actDefUniqueId%>"+"&formId=<%=formId%>"+"&taskType=<%=taskType%>";
//请求表单内容(html)的url
//添加随机数，解决ajax缓存问题
var htmlUrl = contextPath + "/jsp/cform/output/<%=formId%>.html?r=" + Math.random();

//渲染表单（包括表单数据、数据绑定、表单域权限控制）
var formRenderUrl = contextPath + "/command/dispatcher/"+
				"org.loushang.cform.tasklist.cmd.RenderDispatcherCmd/renderForm"+
				"?actDefUniqueId=<%=actDefUniqueId%>&formId=<%=formId%>&formDataId=<%=formDataId%>&assignmentId=<%=assignmentId%>&r="+Math.random();
//渲染流程图
var flowchartUrl = contextPath + "/jsp/workflow/monitor/infoprocessviewer/infoprocessview.jsp?assignmentId=<%=assignmentId%>&procDefUniqueId=<%=procDefUniqueId%>&r="+Math.random();

//历史操作信息
var historyInfoUrl = contextPath + "/command/dispatcher/"+
				"org.loushang.cform.tasklist.cmd.RenderDispatcherCmd/renderHistoryInfo"+
				"?processId=<%=processId%>"
//基础表单
var basicFormInfoUrl = contextPath + "/command/dispatcher/"+
				"org.loushang.cform.tasklist.cmd.RenderDispatcherCmd/renderBasicFormInfo"+
				"?assignmentId=<%=assignmentId%>"

$(function(){
	//添加遮罩
	loadmask();
	//渲染按钮
	renderAction();
	//渲染历史记录
	renderHistoryInfo();
	//渲染流程图
	renderFlowChart();
	//渲染基础表单信息
	renderBasicForm();
	//渲染html
	renderHtml();
	
	CForm.on("afterLoadFormData", function(){
		//去除遮罩
		$t.unloading();
	}); 
	//初始化tab页
	$('#tab a').click(function(e) {
		e.preventDefault();
		$(this).tab('show');
	});
	if(!isShowFlowChart&&!isShowHistoryInfo&&!isShowBasicForm){
		$(".body>.loading-container>#tab").hide();
	}
	if(taskType=="2"||taskType=="3"){
		$("#htmlContainer").hide();
	}
});
</script>
</body>
</html>
