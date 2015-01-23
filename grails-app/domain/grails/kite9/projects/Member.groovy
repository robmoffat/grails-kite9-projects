package grails.kite9.projects

class Member {

    String email
    Project project
    String projectRoleString

    static belongsTo = Project

    static constraints = {
        project(nullable: false)
        projectRoleString inList: ProjectRole.values()*.id
    }

    static mapping = {
        projectRoleString sqlType: 'char(1)'
    }


    ProjectRole getProjectRole() { projectRoleString ? ProjectRole.byId(projectRoleString) : null }
    void setProjectRole(ProjectRole pr) { projectRoleString = pr.id }

    static transients = ['projectRole']

}
