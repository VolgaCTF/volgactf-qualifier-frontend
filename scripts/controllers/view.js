import ViewControllerBase from './view-base'
import indexView from '../views/index'
import teamSigninView from '../views/team/signin'
import teamSignupView from '../views/team/signup'
import supervisorSigninView from '../views/supervisor/signin'
import newsView from '../views/news'
import verifyEmailView from '../views/verify-email'
import teamProfileView from '../views/team/profile'
import aboutView from '../views/about'
import teamsView from '../views/teams'
import categoriesView from '../views/categories'
import tasksView from '../views/tasks'
import scoreboardView from '../views/scoreboard'
import logsView from '../views/logs'
import restoreView from '../views/restore'
import resetPasswordView from '../views/reset-password'
import notFoundView from '../views/not-found'

let viewController = new ViewControllerBase()

viewController.view(indexView)
viewController.view(teamSigninView)
viewController.view(teamSignupView)
viewController.view(supervisorSigninView)
viewController.view(newsView)
viewController.view(verifyEmailView)
viewController.view(teamProfileView)
viewController.view(aboutView)
viewController.view(teamsView)
viewController.view(categoriesView)
viewController.view(tasksView)
viewController.view(logsView)
viewController.view(scoreboardView)
viewController.view(restoreView)
viewController.view(resetPasswordView)

viewController.errorView('not-found', notFoundView)

export default viewController
