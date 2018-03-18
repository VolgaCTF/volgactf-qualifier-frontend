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
import tasksView from './views/tasks'
import scoreboardView from './views/scoreboard'
import eventsView from './views/events'
import teamRestoreView from './views/team/restore'
import teamResetPasswordView from './views/team/reset-password'
import defaultView from './views/default'
import taskStatisticsView from './views/task/statistics'
import contestView from './views/contest'
import remoteCheckersView from './views/remote-checkers'

import dataStore from './data-store'

import contestProvider from './providers/contest'
import teamRankingProvider from './providers/team-ranking'
import identityProvider from './providers/identity'
import navigationBar from './navigation-bar'

$(document).ready(function () {
  if (dataStore.supportsRealtime()) {
    dataStore.connectRealtime()
  }

  const views = {
    index: indexView,
    teams: teamsView,
    news: newsView,
    scoreboard: scoreboardView,
    tasks: tasksView,
    about: aboutView,
    categories: categoriesView,
    contest: contestView,
    remoteCheckers: remoteCheckersView,
    events: eventsView,

    teamSignin: teamSigninView,
    teamSignup: teamSignupView,
    teamVerifyEmail: teamVerifyEmailView,
    teamProfile: teamProfileView,
    teamRestore: teamRestoreView,
    teamResetPassword: teamResetPasswordView,

    taskStatistics: taskStatisticsView,

    supervisorSignin: supervisorSigninView,
    default: defaultView
  }

  $
  .when(
    identityProvider.initIdentity(),
    contestProvider.initContest()
  )
  .done(function (identity, contest) {
    contestProvider.subscribe()
    teamRankingProvider.subscribe()
    navigationBar.present()

    const viewName = window.themis.quals.view
    if (viewName && views.hasOwnProperty(viewName)) {
      views[viewName].present()
    }
  })
})
