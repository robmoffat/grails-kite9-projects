<html>
	<head>
	<title><g:message code='spring.security.ui.forgotPassword.title'/></title>
	<meta name='layout' content='register'/>
	</head>
	<body>
		<div class="row  pad-top">
			<div class="col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 col-xs-10 col-xs-offset-1">
				<div class="panel panel-default">
				    <div class="panel-heading">
						<strong>Forgotten Password</strong>  
				    </div>
				    <div class="panel-body">
						<g:form action='forgotPassword' name="forgotPasswordForm" autocomplete='off'>
							<g:if test='${emailSent}'>
								<g:message code='spring.security.ui.forgotPassword.sent'/>
							</g:if>
							<g:else>
								<h4><g:message code='spring.security.ui.forgotPassword.description'/></h4>
								<g:if test="${flash.error}">
								 	<div class="input-group has-error" style="display: block">
								 		<div class="help-block">${flash.error}</div>
								 	</div>
								</g:if>	
								
	      						<div class="form-group input-group ${ hasErrors(bean:command, field:'username', 'true') ? 'has-error' : '' }">
	                                <span class="input-group-addon"><i class="fa fa-circle-o-notch"  ></i></span>
	                                <g:textField name="username" labelCode="user.username.label"
	                                	 class="form-control" placeholder="Your Name" />
	                            </div>
								<s2ui:submitButton class="btn btn-success" elementId='reset' form='forgotPasswordForm' messageCode='spring.security.ui.forgotPassword.submit'/>
							</g:else>
						</g:form>
					</div>
				</div>
			</div>
		</div>	
	</body>
</html>
