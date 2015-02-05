package grails.kite9.projects

import grails.plugin.springsecurity.ui.RegisterCommand
import grails.plugin.springsecurity.ui.RegistrationCode
import grails.plugin.springsecurity.authentication.dao.NullSaltSource
import grails.plugin.springsecurity.SpringSecurityUtils
import groovy.text.SimpleTemplateEngine


class RegisterController extends grails.plugin.springsecurity.ui.RegisterController {
	
	def index() {
		def copy = [:] + (flash.chainedParams ?: [:])
		copy.remove 'controller'
		copy.remove 'action'
		copy.remove 'format'
		[command: new RegisterCommand(copy)]
	}

}
