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

        assert User.count() == 1
        assert Role.count() == 2
        assert UserRole.count() == 2
    }

    def destroy = {
    }
}
