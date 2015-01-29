package grails.kite9.projects

class Project {

    String title;
    String description;
    String stub

    static hasMany = [diagrams: Diagram, members: Member]

    static constraints = {
        title(blank:false, nullable: false, size:3..80)
        description(blank:false, nullable:false,size:3..500)
        stub(blank: false, nullable: false, size: 3..30, unique: true)
    }
}
