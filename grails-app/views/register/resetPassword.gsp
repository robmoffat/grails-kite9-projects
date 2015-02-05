<html>
	<head>
		<title><g:message code='spring.security.ui.resetPassword.title'/></title>
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
						<g:form action='resetPassword' name='resetPasswordForm' autocomplete='off'>
							<h4><g:message code='spring.security.ui.resetPassword.description'/></h4>
						
							<g:hiddenField name='t' value='${token}'/>
							
							<div class="form-group input-group ${ hasErrors(bean:command, field:'password', 'true') ? 'has-error' : '' }">
                                <span class="input-group-addon"><i class="fa fa-lock"  ></i></span>
                                <g:passwordField  value="${command.password}" name="password" class="form-control" placeholder="Enter Password" />
                            </div>
                            
                            <div class="help-block">
                            	<g:renderErrors bean="${command}" field="password"/>
                           	</div>	
                            
                            <div class="form-group input-group ${ hasErrors(bean:command, field:'password2', 'true') ? 'has-error' : '' }">
                                <span class="input-group-addon"><i class="fa fa-lock"  ></i></span>
                                <g:passwordField value="${command.password2}" name="password2" class="form-control" placeholder="Enter Password" />
                            </div>
                            
                            <div class="help-block">
                            	<g:renderErrors bean="${command}" field="password2"/>
                           	</div>	
							
							<s2ui:submitButton class="btn btn-success" elementId='reset' form='resetPasswordForm' messageCode='spring.security.ui.resetPassword.submit'/>
						</g:form>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>
