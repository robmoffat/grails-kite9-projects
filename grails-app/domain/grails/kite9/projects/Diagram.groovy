package grails.kite9.projects

class Diagram {


    String title
    String description
    String latestHash
    Date dateCreated // Predefined names by Grails will be filled automatically
    Date lastUpdated // Predefined names by Grails will be filled automatically

    // relationsship to the other classes
    Project project

    static belongsTo = [ project: Project ]

    static hasMany = [revisions: Revision]

    // contrains are defined as static
    static constraints = {
        title(blank:false, nullable: false, size:3..80)
        description(blank:false, nullable:false,size:3..500)
        project(nullable:false)
    }
}
