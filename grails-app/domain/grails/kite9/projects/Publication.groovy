package grails.kite9.projects

class Publication {

    User author
    Revision revision
    String stub
    String description
    String url

    Date dateCreated // Predefined names by Grails will be filled automatically
    Date lastUpdated // Predefined names by Grails will be filled automatically

    static belongsTo = [project: Project]

    static constraints = {
        stub(blank: false, nullable: false, size: 3..30)
        url(unique: true)
    }

}