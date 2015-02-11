<%@ page import="grails.kite9.projects.Project" %>



<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'title', 'error')} required">
	<label for="title">
		<g:message code="project.title.label" default="Title" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="title" maxlength="80" required="" value="${projectInstance?.title}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'description', 'error')} required">
	<label for="description">
		<g:message code="project.description.label" default="Description" />
		<span class="required-indicator">*</span>
	</label>
	<g:textArea name="description" cols="40" rows="5" maxlength="500" required="" value="${projectInstance?.description}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'stub', 'error')} required">
	<label for="stub">
		<g:message code="project.stub.label" default="Stub" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="stub" maxlength="30" required="" value="${projectInstance?.stub}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'diagrams', 'error')} ">
	<label for="diagrams">
		<g:message code="project.diagrams.label" default="Diagrams" />
		
	</label>
	
<ul class="one-to-many">
<g:each in="${projectInstance?.diagrams?}" var="d">
    <li><g:link controller="diagram" action="show" id="${d.id}">${d?.encodeAsHTML()}</g:link></li>
</g:each>
<li class="add">
<g:link controller="diagram" action="create" params="['project.id': projectInstance?.id]">${message(code: 'default.add.label', args: [message(code: 'diagram.label', default: 'Diagram')])}</g:link>
</li>
</ul>


</div>

<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'members', 'error')} ">
	<label for="members">
		<g:message code="project.members.label" default="Members" />
		
	</label>
	
<ul class="one-to-many">
<g:each in="${projectInstance?.members?}" var="m">
    <li><g:link controller="member" action="show" id="${m.id}">${m?.encodeAsHTML()}</g:link></li>
</g:each>
<li class="add">
<g:link controller="member" action="create" params="['project.id': projectInstance?.id]">${message(code: 'default.add.label', args: [message(code: 'member.label', default: 'Member')])}</g:link>
</li>
</ul>


</div>

