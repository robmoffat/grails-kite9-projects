package grails.kite9.projects

import org.springframework.security.access.annotation.Secured

@Secured(['ROLE_ADMIN'])
class AnotherController {
    static scaffold = true
}
