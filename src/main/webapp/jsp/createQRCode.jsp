<%--
  Created by IntelliJ IDEA.
  User: ma.liang
  Date: 2018/7/7
  Time: 17:52
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
    <title></title>
</head>
<body>
<h1>二维码</h1>
<img class="q_code" src="<%=request.getContextPath()%>/service/tools/getQRCode?content=12018070901" />
</body>
</html>
