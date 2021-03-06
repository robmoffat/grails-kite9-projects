<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="../../favicon.ico">

    <!-- Bootstrap core CSS -->
    <link href="${request.contextPath}/bootstrap/3.3.1/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- for icons -->
    <link href="${request.contextPath}/font-awesome-4.2.0/css/font-awesome.min.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="${request.contextPath}/dashboard/dashboard.css" rel="stylesheet">
    <link href="${request.contextPath}/dashboard/kite9.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    <g:layoutHead/>
    <title><g:layoutTitle default="Some Title" /></title>
</head>

<body>

<nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container-fluid">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="http://kite9.com"><img src="${request.contextPath}/images/kite9-logo-small-01.png" alt="Kite9 Logo" /></a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav navbar-right">
                <li><g:link action='index' controller='project'>My Projects</g:link></li>
                <li><a href="#">TODO</a></li>
                <kite9:renderUserDetails />
                <li><a href="#">TODO</a></li>
            </ul>
            <!--form class="navbar-form navbar-right">
                <input type="text" class="form-control" placeholder="Search...">
            </form-->
        </div>
    </div>
</nav>

<div class="container-fluid">
    <div class="row">
        <div class="col-sm-3 col-md-2 sidebar">
		    <div class="nav nav-sidebar" role="navigation">
		    	<nav:secondary/>
			</div>
        </div>
        <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
            <h1 class="page-header"><g:layoutTitle default="Some Title" /></h1>
            <g:layoutBody/>
        </div>
    </div>
</div>

<!-- Bootstrap core JavaScript
================================================== -->
<g:javascript library='jquery' plugin='jquery' />
<script src="${request.contextPath}/bootstrap/3.3.1/js/bootstrap.min.js"></script>
<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
<script src="${request.contextPath}/dashboard/ie10-viewport-bug-workaround.js"></script>
</body>
</html>

