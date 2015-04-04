define 'viewController', ['viewControllerBase', 'renderTemplate', 'indexView', 'signinView', 'signupView', 'loginView', 'newsView', 'verifyEmailView', 'profileView', 'aboutView', 'notFoundView'], (ViewControllerBase, renderTemplate, indexView, signinView, signupView, loginView, newsView, verifyEmailView, profileView, aboutView, notFoundView) ->
    viewController = new ViewControllerBase()

    viewController.view indexView
    viewController.view signinView
    viewController.view signupView
    viewController.view loginView
    viewController.view newsView
    viewController.view verifyEmailView
    viewController.view profileView
    viewController.view aboutView

    viewController.errorView 'not-found', notFoundView

    viewController
