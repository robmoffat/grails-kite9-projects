import grails.kite9.projects.Diagram
import grails.kite9.projects.Member
import grails.kite9.projects.Project
import grails.kite9.projects.Role
import grails.kite9.projects.User
import grails.kite9.projects.UserRole

class BootStrap {

    def init = { servletContext ->
        def adminRole = new Role(authority: 'ROLE_ADMIN').save(flush: true)
        def userRole = new Role(authority: 'ROLE_USER').save(flush: true)

        def testUser = new User(username: 'admin', enabled: true, password: 'admin', email: 'robmoffat@mac.com')
        testUser.save(flush: true)

        UserRole.create testUser, adminRole, true
        UserRole.create testUser, userRole, true

        def testProject = new Project (title: "Test Project 1", description: "From Bootstrap", stub: "stub123")
        testProject.save(flush: true)
        
        def member = new Member(email: "robmoffat@mac.com", project: testProject, projectRoleString: "A")
        member.save(flush: true)
  
  
  		for (int i = 0; i < 5; i++) {
			def testProject2 = new Project (title: "Test Project 2", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam viverra euismod odio, gravida pellentesque urna varius vitae.", stub: "dsf"+i)
	        testProject2.save(flush: true)
	        def member2 = new Member(email: "robmoffat@mac.com", project: testProject2, projectRoleString: "A")
      		member2.save(flush: true)
		}

        def diagram1 = new Diagram(title: "Test Diagram 1", description: "Created by Bootstrap", project: testProject, latestHash: 'abc352')
        diagram1.save flush: true

        def diagram2 = new Diagram(title: "Test Diagram 2", description: "Created by Bootstrap", project: testProject, latestHash: 'abc32')
        diagram2.save flush: true

        assert User.count() == 1
        assert Role.count() == 2
        assert UserRole.count() == 2
        assert Project.count() == 6
    }

    def destroy = {
    }
}
