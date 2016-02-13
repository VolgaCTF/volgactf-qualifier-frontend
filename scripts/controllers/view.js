import ViewControllerBase from './view-base'
import indexView from '../views/index'
import signinView from '../views/signin'
import signupView from '../views/signup'
import loginView from '../views/login'
import newsView from '../views/news'
import verifyEmailView from '../views/verify-email'
import profileView from '../views/profile'
import aboutView from '../views/about'
import teamsView from '../views/teams'
import tasksView from '../views/tasks'
import scoreboardView from '../views/scoreboard'
import logsView from '../views/logs'
import restoreView from '../views/restore'
import resetPasswordView from '../views/reset-password'
import notFoundView from '../views/not-found'

let viewController = new ViewControllerBase()

viewController.view(indexView)
viewController.view(signinView)
viewController.view(signupView)
viewController.view(loginView)
viewController.view(newsView)
viewController.view(verifyEmailView)
viewController.view(profileView)
viewController.view(aboutView)
viewController.view(teamsView)
viewController.view(tasksView)
viewController.view(logsView)
viewController.view(scoreboardView)
viewController.view(restoreView)
viewController.view(resetPasswordView)

viewController.errorView('not-found', notFoundView)

export default viewController
