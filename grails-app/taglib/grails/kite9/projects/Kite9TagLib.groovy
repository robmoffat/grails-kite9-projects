package grails.kite9.projects;


public class Kite9TagLib {

    static final namespace = 'kite9'
    def springSecurityService 
    
    def renderUserDetails = { attrs ->
		User currentLoggedInUser = springSecurityService.getCurrentUser();
		if (currentLoggedInUser == null) {
			out << "Log In"
		} else {
			out << avatar.gravatar(email: currentLoggedInUser.email, cssClass: "avatar")
			out << "<span class='username'>" 
			out << currentLoggedInUser.username
			out << "</span>"
		}
	}

	def renderUserLink = { attrs -> 
		User currentLoggedInUser = springSecurityService.getCurrentUser();
		if (currentLoggedInUser == null) {
			out << request.contextPath + "/auth/login";
		} else {
			out << request.contextPath + "/user/show/"+currentLoggedInUser.id
		}	
	}
    
}