package grails.kite9.projects;


public class Kite9TagLib {

    static final namespace = 'kite9'
    def springSecurityService 
    
    def renderUserDetails = { attrs ->
		User currentLoggedInUser = springSecurityService.getCurrentUser();
		if (currentLoggedInUser == null) {
			out << "<li>"+g.link(action: "index", controller: "project", title: "Open the login window", {"Log In"}) + "</li>";
		} else {
			out << "<li class='dropdown'>"
			out << "<a href='#' class='dropdown-toggle' data-toggle='dropdown' role='button' aria-expanded='false'>"
			out << avatar.gravatar(email: currentLoggedInUser.email, cssClass: "avatar")
			out << "<span class='username'>" 
			out << currentLoggedInUser.username
			out << "</span>"
			out << "<span class='caret'></span></a>"
          	out << "<ul class='dropdown-menu' role='menu'>"
            out << "<li>"+g.link(action: "show", controller: "user", id: currentLoggedInUser.id, title: "Go to settings", {"Settings"} )+"</li>"
            out << "<li class='divider'></li>"
            out << "<li>"+g.link(action: "index", controller: "logout", title: "Log out of Kite9", {"Logout"}) +"</li>"
          	out << "</ul>"
		    out << "</li>"
		}
	}
}