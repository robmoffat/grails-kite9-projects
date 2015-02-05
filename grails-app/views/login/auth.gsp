<!DOCTYPE html>
<html lang="en">
  <head>
  	<meta name="layout" content="register">
  </head>
  <body>
      <form class="form-signin" action='${postUrl}' method='POST' id="loginForm" name="loginForm" autocomplete='off'>
        <h2 class="form-signin-heading">Please sign in</h2>
        <label for="inputEmail" class="sr-only">Email address</label>
        <input type="email" name="j_username" id="inputEmail" class="form-control" placeholder="User Name" required autofocus>
        <label for="inputPassword" class="sr-only">Password</label>
        <input type="password" name="j_password" id="inputPassword" class="form-control" placeholder="Password" required>
        <div class="checkbox">
          <label>
            <input type="checkbox" name="${rememberMeParameter}" value="remember-me"> Remember me
          </label>
        </div>
        <button elementId='loginButton' form='loginForm' class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
      	<s2ui:linkButton elementId='register' controller='register' messageCode='spring.security.ui.login.register'/>
	  	<div class="forgot-link">
			<g:link controller='register' action='forgotPassword'><g:message code='spring.security.ui.login.forgotPassword'/></g:link>
		</div>
      </form>
  </body>
</html>

