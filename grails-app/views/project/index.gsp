
<%@ page import="grails.kite9.projects.Project" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="dashboard">
		<g:set var="entityName" value="${message(code: 'project.label', default: 'Project')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<div id="list-project" class="content scaffold-list table-responsive" role="main">
			<g:if test="${flash.message}">
				<div class="message" role="status">${flash.message}</div>
			</g:if>
			<g:each in="${projectInstanceList}" status="i" var="projectInstance">
				<div class="col-md-4 portfolio-item">
					<g:if test="${projectInstance.imageUrl!=null}">
						<g:link action="show" id="${projectInstance.id}">
	                    	<img class="img-responsive" src="${fieldValue(bean: projectInstance, field: "imageUrl")}">
	                	</g:link>
					</g:if>
					<g:else>
						<g:link action="show" id="${projectInstance.id}">
	                    	<i class="fa fa-book fa-5x"></i>
	                    </g:link>
					</g:else>
	                <h3>
	                    <g:link action="show" id="${projectInstance.id}">${fieldValue(bean: projectInstance, field: "title")}</g:link>
	                </h3>
                <p>${fieldValue(bean: projectInstance, field: "description")}</p>
            </div>
			</g:each>
			<div class="pagination">
				<g:paginate total="${projectInstanceCount ?: 0}" />
			</div>
		</div>
	</body>
</html>
