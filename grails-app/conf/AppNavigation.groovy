navigation = {
    // Declare the "app" scope, used by default in tags
    app {
     
        home()
 
        about(controller:'content')
        help(controller:'content')
         
        projects {
            // "list" action in "books" controller
            list()
            // "create" action in "books" controller
            create()
        }
         
    }
}