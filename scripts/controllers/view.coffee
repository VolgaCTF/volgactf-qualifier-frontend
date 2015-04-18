define 'viewController', ['viewControllerBase', 'renderTemplate', 'indexView', 'signinView', 'signupView', 'loginView', 'newsView', 'verifyEmailView', 'profileView', 'aboutView', 'teamsView', 'tasksView', 'scoreboardView', 'logsView', 'notFoundView'], (ViewControllerBase, renderTemplate, indexView, signinView, signupView, loginView, newsView, verifyEmailView, profileView, aboutView, teamsView, tasksView, scoreboardView, logsView, notFoundView) ->
    viewController = new ViewControllerBase()

    viewController.view indexView
    viewController.view signinView
    viewController.view signupView
    viewController.view loginView
    viewController.view newsView
    viewController.view verifyEmailView
    viewController.view profileView
    viewController.view aboutView
    viewController.view teamsView
    viewController.view tasksView
    viewController.view logsView
    viewController.view scoreboardView

    viewController.errorView 'not-found', notFoundView

    viewController
