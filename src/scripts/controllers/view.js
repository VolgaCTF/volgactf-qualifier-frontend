import ViewControllerBase from './view-base'
import indexView from '../views/index'
import teamSigninView from '../views/team/signin'
import teamSignupView from '../views/team/signup'
import supervisorSigninView from '../views/supervisor/signin'
import newsView from '../views/news'
import teamVerifyEmailView from '../views/team/verify-email'
import teamProfileView from '../views/team/profile'
import aboutView from '../views/about'
import teamsView from '../views/teams'
// import categoriesView from '../views/categories'
// import tasksView from '../views/tasks'
// import scoreboardView from '../views/scoreboard'
// import eventsView from '../views/events'
import teamRestoreView from '../views/team/restore'
import teamResetPasswordView from '../views/team/reset-password'
import notFoundView from '../views/not-found'
// import taskStatisticsView from '../views/task/statistics'

let viewController = new ViewControllerBase()

viewController.view(indexView)
viewController.view(teamSigninView)
viewController.view(teamSignupView)
viewController.view(supervisorSigninView)
viewController.view(newsView)
viewController.view(teamVerifyEmailView)
viewController.view(teamProfileView)
viewController.view(aboutView)
viewController.view(teamsView)
// viewController.view(categoriesView)
// viewController.view(tasksView)
// viewController.view(eventsView)
// viewController.view(scoreboardView)
viewController.view(teamRestoreView)
viewController.view(teamResetPasswordView)
// viewController.view(taskStatisticsView)

viewController.errorView('not-found', notFoundView)

export default viewController
