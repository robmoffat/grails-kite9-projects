package grails.kite9.projects

class Project {

    enum ProjectState { ACTIVE, DELETED }

    String fullName;
    String description;
    Date createdDate;
    ProjectState state = ProjectState.ACTIVE;

    static constraints = {
        fullName(blank: false)
    }
}
