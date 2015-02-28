class UrlMappings {

	static mappings = {
        "/$controller/$action?/$id?(.$format)?"{
            constraints {
                // apply constraints here
            }
        }

        "/"(view:"/index")
        "500"(view:'/error')
		"/gui"(uri:"/gui.editor.dispatch")
		"/gui/stylesheet.css"(uri:"/gui.stylesheet.css.dispatch")
		"/gui/stylesheet.js"(uri:"/gui.stylesheet.js.dispatch")
		"/gui/gui-link.png"(uri:"/gui.gui-link.png.dispatch")
		"/gui/retrieveFont/fonts/$name"(uri: "/gui.font.dispatch")
		"/gui/sizes.xml"(uri:"/gui.sizes.xml.dispatch")
	}
}
