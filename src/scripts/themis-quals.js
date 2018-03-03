import $ from 'jquery'
import 'bootstrap'

import indexView from './views/index'
import teamSigninView from './views/team/signin'
import teamSignupView from './views/team/signup'
import supervisorSigninView from './views/supervisor/signin'
import newsView from './views/news'
import teamVerifyEmailView from './views/team/verify-email'
import teamProfileView from './views/team/profile'
import aboutView from './views/about'
import teamsView from './views/teams'
import categoriesView from './views/categories'
// import tasksView from './views/tasks'
// import scoreboardView from './views/scoreboard'
// import eventsView from './views/events'
import teamRestoreView from './views/team/restore'
import teamResetPasswordView from './views/team/reset-password'
import defaultView from './views/default'
// import taskStatisticsView from './views/task/statistics'

import dataStore from './data-store'


$(document).ready(function () {
  if (dataStore.supportsRealtime()) {
    dataStore.connectRealtime()
  }

  const views = {
    index: indexView,
    teams: teamsView,
    news: newsView,
    about: aboutView,
    categories: categoriesView,

    teamSignin: teamSigninView,
    teamSignup: teamSignupView,
    teamVerifyEmail: teamVerifyEmailView,
    teamProfile: teamProfileView,
    teamRestore: teamRestoreView,
    teamResetPassword: teamResetPasswordView,

    supervisorSignin: supervisorSigninView,
    default: defaultView
  }

  const viewName = window.themis.quals.view
  if (viewName && views.hasOwnProperty(viewName)) {
    views[viewName].present()
  }
})
