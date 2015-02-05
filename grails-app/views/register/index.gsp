<html>

<head>
	<meta name='layout' content='register'/>
	<title><g:message code='spring.security.ui.register.title'/></title>
</head>

<body>
	<div class="row text-center pad-top ">
	    <div class="col-md-12">
	        <h2>Kite9 Registration Page</h2>
	    </div>
	</div>
	<div class="row  pad-top">
		<div class="col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 col-xs-10 col-xs-offset-1">
			<div class="panel panel-default">
			    <div class="panel-heading">
					<strong>Register For Kite9</strong>  
			    </div>
			    <div class="panel-body">
					<g:form action='register' name='registerForm' role="form">
						<g:if test='${emailSent}'>
							<br/>
							<g:message code='spring.security.ui.register.sent'/>
						</g:if>	
						<g:else>
							<g:if test="${flash.error}">
							 	<div class="input-group has-error" style="display: block">
							 		<div class="help-block">${flash.error}</div>
							 	</div>
							</g:if>	
							<br/>
                            <div class="form-group input-group ${ hasErrors(bean:command, field:'username', 'true') ? 'has-error' : '' }">
                                <span class="input-group-addon"><i class="fa fa-circle-o-notch"  ></i></span>
                                <g:textField name="username" labelCode="user.username.label"
                                	 bean="${command}" value="${command.username}" 
                                	 class="form-control" placeholder="Your Name" />
                                	 
                            </div>
                            <div class="help-block">
                        		<g:renderErrors bean="${command}" field="username"/>
                        	</div>	 
                            
                            <div class="form-group input-group ${ hasErrors(bean:command, field:'email', 'true') ? 'has-error' : '' }">
                                <span class="input-group-addon"><i class="fa fa-tag"  ></i></span>
                                <g:textField name='email' class="form-control" type="text" bean="${command}" value="${command.email} class="form-control" name="email" placeholder="Your Email"  />
                            </div>
                            
                            <div class="help-block">
                            	<g:renderErrors bean="${command}" field="email"/>
                           	</div>	
							
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
                           	
							<s2ui:submitButton class="btn btn-success" elementId='create' form='registerForm' messageCode='spring.security.ui.register.submit'/>
							<hr />
                            Already Registered ?  <a href="#" >Login here</a>
						</g:else>
					</g:form>
				</div>
			</div>
		</div>
	</div>
<script>
$(document).ready(function() {
	$('#username').focus();
});
</script>

</body>
</html>
