package grails.kite9.projects

class Project {

    String title;
    String description;

    static hasMany = [diagrams: Diagram]  //, members: User, admins: User]

    static constraints = {
        title(blank:false, nullable: false, size:3..80)
        description(blank:false, nullable:false,size:3..500)
    }
}
