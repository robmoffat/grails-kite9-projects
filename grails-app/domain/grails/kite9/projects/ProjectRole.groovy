package grails.kite9.projects

public enum ProjectRole {
    MEMBER("M"), ADMIN("A")

    String id

    ProjectRole(String id) { this.id = id }

    static ProjectRole byId(String id) {
        values().find { it.id == id }
    }

}