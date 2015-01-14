package grails.kite9.projects

class Another {


    String title
    String feedback
    Date dateCreated // Predefined names by Grails will be filled automatically
    Date lastUpdated // Predefined names by Grails will be filled automatically

    // relationsship to the other classes
    Project project

    // contrains are defined as static
    static constraints = {
        title(blank:false, nullable: false, size:3..80)
        feedback(blank:false, nullable:false,size:3..500)
        project(nullable:true)
    }
}
