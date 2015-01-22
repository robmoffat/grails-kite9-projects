package grails.kite9.projects

class Member {

    String title;
    String description;

    static belongsTo = User

    static hasMany = [diagrams: Diagram, members: String, admins: String]

    static constraints = {
        title(blank:false, nullable: false, size:3..80)
        description(blank:false, nullable:false,size:3..500)
    }
}
