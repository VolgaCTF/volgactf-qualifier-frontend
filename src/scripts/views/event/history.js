import $ from 'jquery'
import _ from 'underscore'
import EventBaseView from './base'
import contestProvider from '../../providers/contest'
import identityProvider from '../../providers/identity'
import categoryProvider from '../../providers/category'
import postProvider from '../../providers/post'
import taskProvider from '../../providers/task'
import taskCategoryProvider from '../../providers/task-category'
import teamProvider from '../../providers/team'

import taskValueProvider from '../../providers/task-value'
import taskRewardSchemeProvider from '../../providers/task-reward-scheme'

import remoteCheckerProvider from '../../providers/remote-checker'

class EventHistoryView extends EventBaseView {
  constructor () {
    super()
    this.container = null
  }

  fetchEvents (fetchThreshold, page) {
    const promise = $.Deferred()

    $.ajax({
      url: '/api/event/index',
      data: {
        fetch_threshold: fetchThreshold,
        page: page
      },
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        promise.resolve(responseJSON)
      },
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseJSON) {
          promise.reject(jqXHR.responseJSON)
        } else {
          promise.reject('Unknown error. Please try again later.')
        }
      }
    })

    return promise
  }

  renderEvents (history) {
    const htmlStringList = []
    const paginationHtmlString = window.volgactf.qualifier.templates.eventHistoryPaginationPartial({
      _: _,
      page: history.page,
      pageSize: history.pageSize,
      numEntries: history.numEntries
    })
    htmlStringList.push(paginationHtmlString)

    for (const entry of history.entries) {
      const entryHtmlString = super.renderEvent(entry.name, entry.data, new Date(entry.createdAt))
      if (entryHtmlString) {
        htmlStringList.push(entryHtmlString)
      }
    }

    htmlStringList.push(paginationHtmlString)
    return htmlStringList.join('')
  }

  requestRenderEvents (page) {
    $(this.container).addClass('history-loading')
    $
      .when(this.fetchEvents(window.volgactf.qualifier.data.fetchThreshold, page))
      .then((eventHistory) => {
        const html = this.renderEvents(eventHistory)
        this.container.innerHTML = ''
        this.container.insertAdjacentHTML('beforeend', html)
      })
      .fail((e) => {
        this.container.innerHTML = ''
        const html = '<p class="text-danger">Unknown error. Please reload the page and try again.</p>'
        this.container.insertAdjacentHTML('beforeend', html)
      })
      .always(() => {
        $(this.container).removeClass('history-loading')
      })
  }

  present () {
    $
      .when(
        identityProvider.initIdentity(),
        contestProvider.initContest(),
        categoryProvider.initCategories(),
        postProvider.initPosts(),
        taskProvider.initTaskPreviews(),
        taskCategoryProvider.initTaskCategories(),
        taskValueProvider.initTaskValues(),
        taskRewardSchemeProvider.initTaskRewardSchemes(),
        teamProvider.initTeams(),
        remoteCheckerProvider.initRemoteCheckers()
      )
      .done((identity, contest, eventHistory) => {
        this.container = document.getElementById('volgactf-qualifier-events')
        this.requestRenderEvents(1)

        $(this.container).on('click', 'a[data-action="load"]', (e) => {
          e.preventDefault()
          const page = parseInt($(e.target).attr('data-page'), 10)
          this.requestRenderEvents(page)
        })
      })
  }
}

export default new EventHistoryView()
