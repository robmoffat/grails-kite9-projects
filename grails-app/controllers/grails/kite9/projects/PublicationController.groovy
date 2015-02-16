package grails.kite9.projects

import org.springframework.security.access.annotation.Secured
import org.kite9.diagram.server.Project

@Secured(['ROLE_USER'])
class PublicationController {
    static scaffold = true
}
