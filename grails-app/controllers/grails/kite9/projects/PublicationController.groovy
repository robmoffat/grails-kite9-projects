package grails.kite9.projects

import org.springframework.security.access.annotation.Secured

@Secured(['ROLE_USER'])
class RevisionController {
    static scaffold = true
}
