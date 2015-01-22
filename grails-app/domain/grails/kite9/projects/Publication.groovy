package grails.kite9.projects

class Publication {

    Diagram diagram
    String hash
    Date dateCreated // Predefined names by Grails will be filled automatically
    User author

    static belongsTo = [diagram: Diagram]

}