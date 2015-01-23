package grails.kite9.projects

class Revision {

    Diagram diagram
    String afterStateHash
    String beforeStateHash
    Date dateCreated // Predefined names by Grails will be filled automatically
    User author

    static belongsTo = [diagram: Diagram]

}