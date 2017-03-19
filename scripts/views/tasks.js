import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import statusBar from '../status-bar'
import metadataStore from '../utils/metadata-store'
import moment from 'moment'
import categoryProvider from '../providers/category'
import taskCategoryProvider from '../providers/task-category'
import taskAnswerProvider from '../providers/task-answer'
import taskHintProvider from '../providers/task-hint'
import taskProvider from '../providers/task'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import teamProvider from '../providers/team'
import MarkdownRenderer from '../utils/markdown'
import teamTaskReviewProvider from '../providers/team-task-review'
import teamTaskHitProvider from '../providers/team-task-hit'
import 'bootstrap'
import 'jquery.form'
import 'parsley'

class TasksView extends View {
  constructor () {
    super(/^\/tasks$/)
    this.$main = null
    this.$taskPreviewsList = null

    this.onUpdateCategory = null

    this.onCreateTaskCategory = null
    this.onRevealTaskCategory = null
    this.onDeleteTaskCategory = null

    this.onCreateTask = null
    this.onOpenTask = null
    this.onCloseTask = null
    this.onUpdateTask = null

    this.onCreateTeamTaskHit = null
    this.onUpdateContest = null

    this.flagRenderTasks = false
    this.flagRenderingTasks = false
    this.renderTasksInterval = null
    this.onRenderTasks = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Tasks`
  }

  initCreateTaskModal () {
    let $modal = $('#create-task-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-create-task"]')
    let $form = $modal.find('form')
    $form.parsley()

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    let $tabList = $('#create-task-tablist')
    let $tabData = $tabList.find('a[href="#create-task-data"]')
    let $tabPreview = $tabList.find('a[href="#create-task-preview"]')

    let $taskTitle = $('#create-task-title')
    let $taskDescription = $('#create-task-description')
    let $taskValue = $('#create-task-value')
    let $categories = $('#create-categories')

    let $taskHints = $('#create-task-hints')
    let $taskHintList = $('#create-task-hint-list')

    let $taskAnswers = $('#create-task-answers')
    let $taskAnswerList = $('#create-task-answer-list')

    let $taskPreview = $('#create-task-preview')

    $tabData.tab()
    $tabPreview.tab()

    $taskHints.find('a[data-action="create-task-hint"]').on('click', (e) => {
      e.preventDefault()
      let options = {
        number: $taskHintList.children().length + 1,
        hint: ''
      }
      $taskHintList.append($(renderTemplate('create-task-hint-textarea-partial', options)))
    })

    function getHints () {
      let hints = []
      $taskHintList.find('.themis-task-hint-group').each((ndx, el) => {
        let $el = $(el)
        hints.push($el.find('textarea').val())
      })

      return hints
    }

    $taskHintList.on('click', 'a[data-action="remove-task-hint"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#create-task-hint-${number}`).remove()
      let hints = getHints()
      $taskHintList.empty()
      _.each(hints, (hint, ndx) => {
        let options = {
          number: ndx + 1,
          hint: hint
        }
        $taskHintList.append($(renderTemplate('create-task-hint-textarea-partial', options)))
      })
    })

    $taskAnswers.find('a[data-action="create-task-answer"]').on('click', (e) => {
      e.preventDefault()
      let options = {
        number: $taskAnswerList.children().length + 1,
        answer: '',
        caseSensitive: true
      }
      $taskAnswerList.append($(renderTemplate('create-task-answer-input-partial', options)))
    })

    function getAnswers () {
      let answers = []
      $taskAnswerList.find('.themis-task-answer-group').each((ndx, el) => {
        let $el = $(el)
        answers.push({
          answer: $el.find('input[type=text]').val(),
          caseSensitive: $el.find('input[type=checkbox]').prop('checked')
        })
      })

      return answers
    }

    $taskAnswerList.on('click', 'a[data-action="remove-task-answer"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#create-task-answer-${number}`).remove()
      let answers = getAnswers()
      $taskAnswerList.empty()
      _.each(answers, (entry, ndx) => {
        let options = {
          number: ndx + 1,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        }
        $taskAnswerList.append($(renderTemplate('create-task-answer-input-partial', options)))
      })
    })

    $tabPreview.on('show.bs.tab', (e) => {
      let md = new MarkdownRenderer()
      let hintsFormatted = getHints().map((hint) => {
        return md.render(hint)
      })

      let options = {
        title: $taskTitle.val(),
        description: md.render($taskDescription.val()),
        hints: hintsFormatted
      }

      $taskPreview.html(renderTemplate('task-content-partial', options))
    })

    $modal.on('show.bs.modal', (e) => {
      $tabData.tab('show')
      $taskTitle.val('')
      $taskDescription.val('')
      $taskValue.val('')

      $categories.empty()
      _.each(categoryProvider.getCategories(), (category) => {
        $categories.append($('<option></option>').attr('value', category.id).text(category.title))
      })

      $taskHintList.empty()
      $taskAnswerList.empty()

      $submitError.text('')
      $form.parsley().reset()
    })

    $modal.on('shown.bs.modal', (e) => {
      $taskTitle.focus()
    })

    $form.on('submit', (e) => {
      e.preventDefault()
      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        data: {
          hints: getHints(),
          answers: getAnswers()
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $modal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            $submitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $submitButton.prop('disabled', false)
        }
      })
    })
  }

  initEditTaskModal () {
    let $modal = $('#edit-task-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-edit-task"]')
    let $form = $modal.find('form')
    $form.parsley()

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    let $tabList = $('#edit-task-tablist')
    let $tabData = $tabList.find('a[href="#edit-task-data"]')
    let $tabPreview = $tabList.find('a[href="#edit-task-preview"]')

    let $taskTitle = $('#edit-task-title')
    let $taskDescription = $('#edit-task-description')
    let $taskValue = $('#edit-task-value')
    let $categories = $('#edit-categories')

    let $taskHints = $('#edit-task-hints')
    let $taskHintList = $('#edit-task-hint-list')

    let $taskAnswers = $('#edit-task-answers')
    let $taskAnswerList = $('#edit-task-answer-list')

    let $taskPreview = $('#edit-task-preview')

    $tabData.tab()
    $tabPreview.tab()

    $taskHints.find('a[data-action="create-task-hint"]').on('click', (e) => {
      e.preventDefault()
      let options = {
        number: $taskHintList.children().length + 1,
        hint: '',
        editable: true
      }
      $taskHintList.append($(renderTemplate('edit-task-hint-textarea-partial', options)))
    })

    function getHints () {
      let hints = []
      $taskHintList.find('.themis-task-hint-group[data-state-disabled=false]').each((ndx, el) => {
        let $el = $(el)
        hints.push($el.find('textarea').val())
      })

      return hints
    }

    let savedTaskHints = null

    $taskHintList.on('click', 'a[data-action="remove-task-hint"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#edit-task-hint-${number}`).remove()

      let hints = getHints()
      $taskHintList.empty()
      _.each(savedTaskHints, (entry, ndx) => {
        $taskHintList.append($(renderTemplate('edit-task-hint-textarea-partial', {
          number: ndx + 1,
          editable: false,
          hint: entry.hint
        })))
      })
      _.each(hints, (hint, ndx) => {
        $taskHintList.append($(renderTemplate('edit-task-hint-textarea-partial', {
          number: savedTaskHints.length + ndx + 1,
          editable: true,
          hint: hint
        })))
      })
    })

    $taskAnswers.find('a[data-action="create-task-answer"]').on('click', (e) => {
      e.preventDefault()
      let options = {
        number: $taskAnswerList.children().length + 1,
        editable: true,
        answer: '',
        caseSensitive: true
      }
      $taskAnswerList.append($(renderTemplate('edit-task-answer-input-partial', options)))
    })

    function getAnswers () {
      let answers = []
      $taskAnswerList.find('.themis-task-answer-group[data-state-disabled=false]').each((ndx, el) => {
        let $el = $(el)
        answers.push({
          answer: $el.find('input[type=text]').val(),
          caseSensitive: $el.find('input[type=checkbox]').prop('checked')
        })
      })

      return answers
    }

    let savedTaskAnswers = null

    $taskAnswerList.on('click', 'a[data-action="remove-task-answer"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#edit-task-answer-${number}`).remove()
      let answers = getAnswers()
      $taskAnswerList.empty()
      _.each(savedTaskAnswers, (entry, ndx) => {
        $taskAnswerList.append($(renderTemplate('edit-task-answer-input-partial', {
          number: ndx + 1,
          editable: false,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        })))
      })
      _.each(answers, (entry, ndx) => {
        $taskAnswerList.append($(renderTemplate('edit-task-answer-input-partial', {
          number: savedTaskAnswers.length + ndx + 1,
          editable: true,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        })))
      })
    })

    $tabPreview.on('show.bs.tab', (e) => {
      let md = new MarkdownRenderer()
      let hintsFormatted = savedTaskHints.map((entry) => {
        return entry.hint
      }).concat(getHints()).map((hint) => {
        return md.render(hint)
      })

      let options = {
        title: $taskTitle.val(),
        description: md.render($taskDescription.val()),
        hints: hintsFormatted
      }

      $taskPreview.html(renderTemplate('task-content-partial', options))
    })

    $modal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $modal.data('task-id', taskId)

      $tabData.tab('show')
      $taskTitle.val('')
      $taskDescription.val('')
      $taskValue.val('')

      $categories.empty()
      _.each(categoryProvider.getCategories(), (category) => {
        $categories.append($('<option></option>').attr('value', category.id).text(category.title))
      })

      $taskHintList.empty()
      $taskAnswerList.empty()

      $submitError.text('')
      $form.parsley().reset()
      $form.attr('action', `/api/task/${taskId}/update`)

      $submitButton.prop('disabled', true)

      $
        .when(
          taskProvider.fetchTask(taskId),
          taskCategoryProvider.fetchTaskCategoriesByTask(taskId),
          taskAnswerProvider.fetchTaskAnswersByTask(taskId),
          taskHintProvider.fetchTaskHintsByTask(taskId)
        )
        .done((task, taskCategories, taskAnswers, taskHints) => {
          savedTaskAnswers = taskAnswers
          savedTaskHints = taskHints
          $submitButton.prop('disabled', false)

          $taskTitle.val(task.title)
          $taskDescription.val(task.description)
          $taskValue.val(task.value)

          $categories.val(taskCategories.map((taskCategory) => {
            return taskCategory.categoryId
          }))

          $taskHintList.empty()
          _.each(taskHints, (entry, ndx) => {
            $taskHintList.append($(renderTemplate('edit-task-hint-textarea-partial', {
              number: ndx + 1,
              editable: false,
              hint: entry.hint
            })))
          })

          $taskAnswerList.empty()
          _.each(taskAnswers, (entry, ndx) => {
            $taskAnswerList.append($(renderTemplate('edit-task-answer-input-partial', {
              number: ndx + 1,
              editable: false,
              answer: entry.answer,
              caseSensitive: entry.caseSensitive
            })))
          })
        })
        .fail((err) => {
          $submitError.text(err)
        })
    })

    $modal.on('shown.bs.modal', (e) => {
      $taskTitle.focus()
    })

    $form.on('submit', (e) => {
      e.preventDefault()
      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        data: {
          hints: getHints(),
          answers: getAnswers()
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $modal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            $submitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $submitButton.prop('disabled', false)
        }
      })
    })
  }

  initReviseTaskModal () {
    let $modal = $('#revise-task-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitSuccess = $modal.find('.submit-success > p')
    let $taskStatus = $modal.find('#revise-task-status')
    let $submitButton = $modal.find('button[data-action="complete-revise-task"]')
    let $form = $modal.find('form')
    $form.parsley()

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    let $taskAnswerGroup = $('#revise-task-answer-group')
    let $taskAnswer = $('#revise-task-answer')
    let $taskContents = $modal.find('.themis-task-contents')

    $modal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $modal.data('task-id', taskId)

      $form.parsley().reset()
      $form.attr('action', `/api/task/${taskId}/revise`)

      $taskContents.empty()
      $taskAnswerGroup.show()
      $submitButton.show()
      $taskAnswer.val('')
      $submitError.text('')
      $submitSuccess.text('')
      $taskStatus.text('')
      $submitButton.prop('disabled', true)

      $
        .when(
          taskProvider.fetchTask(taskId),
          taskHintProvider.fetchTaskHintsByTask(taskId),
          teamTaskHitProvider.fetchTaskHitStatistics(taskId),
          teamTaskReviewProvider.fetchTaskReviewStatistics(taskId)
        )
        .done((task, taskHints, taskHitStatistics, taskReviewStatistics) => {
          let md = new MarkdownRenderer()

          $taskContents.html(renderTemplate('task-content-partial', {
            title: task.title,
            description: md.render(task.description),
            hints: _.map(taskHints, (taskHint) => {
              return md.render(taskHint.hint)
            })
          }))

          $taskStatus.html(renderTemplate('revise-task-status-partial', {
            solvedTeamCount: taskHitStatistics.count,
            averageRating: taskReviewStatistics.averageRating,
            ratedTeamCount: taskReviewStatistics.count
          }))
          $submitButton.prop('disabled', false)
        })
        .fail((err) => {
          $submitError.text(err)
        })
    })

    $modal.on('shown.bs.modal', (e) => {
      $taskAnswer.focus()
    })

    $form.on('submit', (e) => {
      e.preventDefault()
      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitSuccess.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $taskAnswerGroup.hide()
          $submitButton.hide()
          $submitSuccess.text('Answer is correct!')
          let hideModal = () => {
            $modal.modal('hide')
            if (!dataStore.connectedRealtime()) {
              window.location.reload()
            }
          }

          setTimeout(hideModal, 1000)
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            $submitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $submitButton.prop('disabled', false)
        }
      })
    })
  }

  initOpenTaskModal () {
    let $modal = $('#open-task-modal')
    $modal.modal({ show: false })

    let $modalBody = $modal.find('.modal-body p.confirmation')
    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-open-task"]')

    $modal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $modal.data('task-id', taskId)
      let taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      $modalBody.html(renderTemplate('open-task-confirmation', { title: taskPreview.title }))
      $submitError.text('')
    })

    $submitButton.on('click', (e) => {
      let taskId = $modal.data('task-id')
      $
        .when(taskProvider.openTask(taskId, identityProvider.getIdentity().token))
        .done(() => {
          $modal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        })
        .fail((err) => {
          $submitError.text(err)
        })
    })
  }

  initCloseTaskModal () {
    let $modal = $('#close-task-modal')
    $modal.modal({ show: false })

    let $modalBody = $modal.find('.modal-body p.confirmation')
    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-close-task"]')

    $modal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $modal.data('task-id', taskId)
      let taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      $modalBody.html(renderTemplate('close-task-confirmation', { title: taskPreview.title }))
      $submitError.text('')
    })

    $submitButton.on('click', (e) => {
      let taskId = $modal.data('task-id')
      $
        .when(taskProvider.closeTask(taskId, identityProvider.getIdentity().token))
        .done(() => {
          $modal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        })
        .fail((err) => {
          $submitError.text(err)
        })
    })
  }

  initSubmitTaskModal () {
    let $modal = $('#submit-task-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $taskInfo = $modal.find('.submit-info > p')
    let $submitSuccess = $modal.find('.submit-success > p')
    let $submitButton = $modal.find('button[data-action="complete-submit-task"]')
    let $submitForm = $modal.find('form[data-target="submit"]')
    $submitForm.parsley()

    $submitButton.on('click', (e) => {
      $submitForm.trigger('submit')
    })

    let $submitFieldGroup = $('#submit-task-field-group')
    let $taskAnswer = $('#submit-task-answer')
    let $taskContents = $modal.find('.themis-task-contents')

    let $reviewButton = $modal.find('button[data-action="complete-review-task"]')
    let $reviewForm = $modal.find('form[data-target="review"]')
    $reviewForm.parsley()
    let $reviewError = $modal.find('.review-error > p')
    let $reviewSuccess = $modal.find('.review-success > p')

    let $reviewFieldGroup = $modal.find('#review-task-field-group')
    let $reviewRating = $modal.find('#review-task-rating')
    let $reviewComment = $modal.find('#review-task-comment')

    $reviewButton.on('click', (e) => {
      $reviewForm.trigger('submit')
    })

    $modal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)

      $taskContents.empty()
      $taskAnswer.val('')
      $submitError.text('')
      $taskInfo.text('')
      $submitSuccess.text('')
      $submitButton.prop('disabled', true)

      $reviewFieldGroup.hide()
      $reviewButton.hide()
      $reviewButton.prop('disabled', true)
      $reviewRating.val(5)
      $reviewComment.val('')
      $reviewError.text('')
      $reviewSuccess.text('')

      let taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      let identity = identityProvider.getIdentity()
      let contest = contestProvider.getContest()
      let taskSolvedAt = null
      let teamTaskReview = null
      let onlyReview = false

      $reviewFieldGroup.hide()
      $reviewButton.hide()

      if (taskPreview && identity.isTeam()) {
        let taskHit = _.findWhere(teamTaskHitProvider.getTeamTaskHits(), {
          teamId: identity.id,
          taskId: taskId
        })
        if (taskHit) {
          taskSolvedAt = taskHit.createdAt
        }

        if (taskPreview.isOpened()) {
          if (contest.isPaused()) {
            $submitError.text('Contest has been paused.')
            $submitFieldGroup.hide()
            $submitButton.hide()
          } else {
            if ((!taskSolvedAt && contest.isStarted()) || contest.isFinished()) {
              $submitFieldGroup.show()
              $submitButton.show()
            } else {
              $submitFieldGroup.hide()
              $submitButton.hide()
            }
          }
        } else if (taskPreview.isClosed()) {
          $submitError.text('Task has been closed by the event organizers.')
          $submitFieldGroup.hide()
          $submitButton.hide()
        }
      } else {
        $submitFieldGroup.hide()
        $submitButton.hide()
      }

      $modal.data('task-id', taskId)

      $submitForm.parsley().reset()
      if (contest.isFinished()) {
        $submitForm.attr('action', `/api/task/${taskId}/check`)
      } else {
        $submitForm.attr('action', `/api/task/${taskId}/submit`)
      }

      $reviewForm.parsley().reset()
      $reviewForm.attr('action', `/api/task/${taskId}/review`)

      if (taskPreview.isClosed()) {
        return
      }

      $
        .when(
          taskProvider.fetchTask(taskId),
          teamTaskHitProvider.fetchTaskHitStatistics(taskId),
          taskHintProvider.fetchTaskHintsByTask(taskId),
          teamTaskReviewProvider.fetchTeamTaskReviewsByTask(taskId),
          teamTaskReviewProvider.fetchTaskReviewStatistics(taskId)
        )
        .done((task, taskHitStatistics, taskHints, teamTaskReviews, taskReviewStatistics) => {
          let md = new MarkdownRenderer()
          let hintsFormatted = []
          _.each(taskHints, (entry) => {
            hintsFormatted.push(md.render(entry.hint))
          })
          let options = {
            title: task.title,
            description: md.render(task.description),
            hints: hintsFormatted
          }
          $taskContents.html(renderTemplate('task-content-partial', options))

          teamTaskReview = _.findWhere(teamTaskReviews, { taskId: taskId, teamId: identityProvider.getIdentity().id })

          $taskInfo.show().html(renderTemplate('submit-task-status-partial', {
            taskSolvedAt: taskSolvedAt ? moment(taskSolvedAt).format('lll') : null,
            solvedTeamCount: taskHitStatistics.count,
            reviewAverageRating: taskReviewStatistics.averageRating,
            reviewCount: taskReviewStatistics.count,
            teamReview: teamTaskReview ? {
              rating: teamTaskReview.rating,
              comment: teamTaskReview.comment,
              createdAt: moment(teamTaskReview.createdAt).format('lll')
            } : null
          }))

          onlyReview = taskSolvedAt && contest.isStarted() && !teamTaskReview
          if (onlyReview) {
            $reviewFieldGroup.show()
            $reviewButton.show()
            $reviewRating.focus()
          }

          $submitButton.prop('disabled', false)
          $reviewButton.prop('disabled', false)
        })
        .fail((err) => {
          $submitError.text(err)
        })
    })

    $modal.on('shown.bs.modal', (e) => {
      $taskAnswer.focus()
    })

    $submitForm.on('submit', (e) => {
      e.preventDefault()
      $submitForm.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitSuccess.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $submitFieldGroup.hide()
          $submitButton.hide()
          $taskInfo.hide()
          $submitSuccess.text('Answer is correct!')
          let showReviewForm = () => {
            $submitSuccess.text('')
            $reviewFieldGroup.show()
            $reviewButton.show()
            $reviewRating.focus()
          }

          let hideModal = () => {
            $modal.modal('hide')
            if (!dataStore.connectedRealtime()) {
              window.location.reload()
            }
          }

          if (contestProvider.getContest().isFinished()) {
            setTimeout(hideModal, 1000)
          } else {
            setTimeout(showReviewForm, 1000)
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            $submitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $submitButton.prop('disabled', false)
        }
      })
    })

    $reviewForm.on('submit', (e) => {
      e.preventDefault()
      $reviewForm.ajaxSubmit({
        beforeSubmit: () => {
          $reviewError.text('')
          $reviewSuccess.text('')
          $reviewButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $reviewFieldGroup.hide()
          $reviewButton.hide()
          $reviewSuccess.text('Review has been submitted!')
          let hideModal = () => {
            $modal.modal('hide')
            if (!dataStore.connectedRealtime()) {
              window.location.reload()
            }
          }

          setTimeout(hideModal, 1000)
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $reviewError.text(jqXHR.responseJSON)
          } else {
            $reviewError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $reviewButton.prop('disabled', false)
        }
      })
    })
  }

  initCheckTaskModal () {
    let $modal = $('#check-task-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $taskInfo = $modal.find('.submit-info > p')
    let $submitSuccess = $modal.find('.submit-success > p')
    let $submitButton = $modal.find('button[data-action="complete-check-task"]')
    let $form = $modal.find('form')
    $form.parsley()

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    let $taskAnswerGroup = $('#check-task-answer-group')
    let $taskAnswer = $('#check-task-answer')
    let $taskContents = $modal.find('.themis-task-contents')

    $modal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)

      $taskContents.empty()
      $taskAnswer.val('')
      $submitError.text('')
      $taskInfo.text('')
      $submitSuccess.text('')
      $submitButton.prop('disabled', true)

      let taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      let identity = identityProvider.getIdentity()
      let contest = contestProvider.getContest()

      if (taskPreview && identity.isGuest()) {
        if (contest.isFinished()) {
          if (taskPreview.isOpened()) {
            $taskAnswerGroup.show()
            $submitButton.show()
          } else {
            $taskAnswerGroup.hide()
            $submitButton.hide()
            if (taskPreview.isClosed()) {
              $submitError.text('Task has been closed by the event organizers.')
            }
          }
        } else {
          $taskAnswerGroup.hide()
          $submitButton.hide()
          $submitError.html(renderTemplate('check-task-guest-error'))
        }
      } else {
        $taskAnswerGroup.hide()
        $submitButton.hide()
      }

      $modal.data('task-id', taskId)

      $form.parsley().reset()
      $form.attr('action', `/api/task/${taskId}/check`)

      if (taskPreview.isClosed()) {
        return
      }

      if (contest.isFinished()) {
        $
          .when(
            taskProvider.fetchTask(taskId),
            taskHintProvider.fetchTaskHintsByTask(taskId)
          )
          .done((task, taskHints) => {
            let md = new MarkdownRenderer()
            let hintsFormatted = []
            _.each(taskHints, (entry) => {
              hintsFormatted.push(md.render(entry.hint))
            })

            let options = {
              title: task.title,
              description: md.render(task.description),
              hints: hintsFormatted
            }
            $taskContents.html(renderTemplate('task-content-partial', options))
            $submitButton.prop('disabled', false)
          })
          .fail((err) => {
            $submitError.text(err)
          })
      }
    })

    $modal.on('shown.bs.modal', (e) => {
      $taskAnswer.focus()
    })

    $form.on('submit', (e) => {
      e.preventDefault()
      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitSuccess.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $taskAnswerGroup.hide()
          $submitButton.hide()
          $submitSuccess.text('Answer is correct!')
          let hideModal = () => {
            $modal.modal('hide')
            if (!dataStore.connectedRealtime()) {
              window.location.reload()
            }
          }

          setTimeout(hideModal, 1000)
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            $submitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $submitButton.prop('disabled', false)
        }
      })
    })
  }

  requestRenderTasks () {
    this.flagRenderTasks = true
  }

  showTaskModal (identity, taskId) {
    let taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
    if (taskPreview) {
      let $modal = null
      let $button = $(`<button data-task-id="${taskId}"></button>`)
      if (identity.isSupervisor()) {
        $modal = $('#revise-task-modal')
      } else if (identity.isTeam()) {
        $modal = $('#submit-task-modal')
      } else {
        $modal = $('#check-task-modal')
      }
      if ($modal) {
        $modal.modal('show', $button)
      }
    } else {
      console.log('Task does not exist!')
    }
  }

  renderTaskPreviews () {
    let taskPreviews = taskProvider.getTaskPreviews()
    let identity = identityProvider.getIdentity()

    if (taskPreviews.length === 0) {
      this.$taskPreviewsList.empty()
      let text = null
      if (identity.isGuest() || identity.isTeam()) {
        text = 'No tasks have been opened yet.'
      } else if (identity.isSupervisor()) {
        text = 'No tasks have been created yet.'
      }

      this.$taskPreviewsList.html($('<p></p>').addClass('lead').text(text))
    } else {
      let solvedTaskIds = []
      if (identity.isTeam()) {
        let taskHits = _.where(teamTaskHitProvider.getTeamTaskHits(), { teamId: identity.id })
        solvedTaskIds = _.map(taskHits, (taskHit) => {
          return taskHit.taskId
        })
      }

      let getSortResultByKey = (a, b, getValueFunc) => {
        let valA = getValueFunc(a)
        let valB = getValueFunc(b)
        if (valA < valB) {
          return -1
        } else if (valA > valB) {
          return 1
        } else {
          return 0
        }
      }

      let sortTaskPreviewsFunc = (a, b) => {
        if (a.state === b.state) {
          let solvedA = _.contains(solvedTaskIds, a.id)
          let solvedB = _.contains(solvedTaskIds, b.id)
          if (!solvedA && !solvedB) {
            return getSortResultByKey(a, b, (v) => {
              return v.updatedAt.getTime()
            })
          } else if (solvedA && !solvedB) {
            return 1
          } else if (!solvedA && solvedB) {
            return -1
          } else {
            return getSortResultByKey(a, b, (v) => {
              return v.updatedAt.getTime()
            })
          }
        } else {
          if (a.isOpened()) {
            return -1
          } if (b.isOpened()) {
            return 1
          } if (a.isClosed() && b.isInitial()) {
            return -1
          } if (a.isInitial() && b.isClosed()) {
            return 1
          }

          return 0
        }
      }

      let categories = categoryProvider.getCategories()
      let allTaskCategories = taskCategoryProvider.getTaskCategories()

      this.$taskPreviewsList.empty()
      taskPreviews.sort(sortTaskPreviewsFunc)
      let contest = contestProvider.getContest()
      for (let taskPreview of taskPreviews) {
        let categoriesList = ''
        let taskCategories = _.where(allTaskCategories, { taskId: taskPreview.id })
        for (let taskCategory of taskCategories) {
          let category = _.findWhere(categories, { id: taskCategory.categoryId })
          if (category) {
            categoriesList += renderTemplate('category-partial', {
              title: category.title,
              description: category.description
            })
          }
        }

        let taskIsSolved = (identity.isTeam() && _.contains(solvedTaskIds, taskPreview.id))

        let options = {
          task: taskPreview,
          categoriesList: categoriesList,
          identity: identity,
          contest: contest,
          taskIsSolved: taskIsSolved
        }

        this.$taskPreviewsList.append($(renderTemplate('task-preview-partial', options)))
      }
    }
  }

  present () {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(identityProvider.fetchIdentity(), contestProvider.fetchContest())
      .done((identity, contest) => {
        identityProvider.subscribe()
        this.$main.html(renderTemplate('tasks-view', { identity: identity, contest: contest }))

        if (dataStore.supportsRealtime()) {
          dataStore.connectRealtime()
        }

        navigationBar.present({ active: 'tasks' })

        let promise = null
        if (identity.isTeam()) {
          promise = $.when(taskProvider.fetchTaskPreviews(), categoryProvider.fetchCategories(), taskCategoryProvider.fetchTaskCategories(), teamTaskHitProvider.fetchTeamHits(identity.id), contestProvider.fetchTeamScores())
        } else if (identity.isSupervisor()) {
          promise = $.when(taskProvider.fetchTaskPreviews(), categoryProvider.fetchCategories(), taskCategoryProvider.fetchTaskCategories())
        } else {
          promise = $.when(taskProvider.fetchTaskPreviews(), categoryProvider.fetchCategories(), taskCategoryProvider.fetchTaskCategories())
        }

        promise
          .done((taskPreviews, categories) => {
            statusBar.present()

            if (identity.isSupervisor()) {
              this.initReviseTaskModal()
            }

            if (identity.isAdmin()) {
              this.initCreateTaskModal()
              this.initOpenTaskModal()
              this.initCloseTaskModal()
              this.initEditTaskModal()
            }

            if (identity.isTeam()) {
              this.initSubmitTaskModal()
            }

            if (identity.isGuest()) {
              this.initCheckTaskModal()
            }

            this.$taskPreviewsList = $('#themis-task-previews')

            this.onCreateTaskCategory = (taskCategory) => {
              this.requestRenderTasks()
              return false
            }

            if (identity.isTeam() || identity.isGuest()) {
              this.onRevealTaskCategory = (taskCategory) => {
                this.requestRenderTasks()
                return false
              }
            }

            this.onDeleteTaskCategory = () => {
              this.requestRenderTasks()
              return false
            }

            this.onUpdateCategory = (category) => {
              this.requestRenderTasks()
              return false
            }

            categoryProvider.subscribe()
            categoryProvider.on('updateCategory', this.onUpdateCategory)

            taskProvider.subscribe()
            if (identity.isSupervisor()) {
              this.onCreateTask = (taskPreview) => {
                this.requestRenderTasks()
                return false
              }

              taskProvider.on('createTask', this.onCreateTask)
            }

            this.onOpenTask = (taskPreview) => {
              this.requestRenderTasks()
              return false
            }

            taskProvider.on('openTask', this.onOpenTask)

            this.onCloseTask = (taskPreview) => {
              this.requestRenderTasks()
              return false
            }

            taskProvider.on('closeTask', this.onCloseTask)

            this.onUpdateTask = (taskPreview) => {
              this.requestRenderTasks()
              return false
            }

            taskProvider.on('updateTask', this.onUpdateTask)

            if (identity.isTeam()) {
              teamTaskHitProvider.subscribe()

              this.onCreateTeamTaskHit = (teamTaskHit) => {
                this.requestRenderTasks()
                return false
              }

              teamTaskHitProvider.on('createTeamTaskHit', this.onCreateTeamTaskHit)
            }

            this.onUpdateContest = (contest) => {
              this.requestRenderTasks()
              return false
            }

            contestProvider.on('updateContest', this.onUpdateContest)

            teamProvider.subscribe()
            taskCategoryProvider.subscribe()
            taskCategoryProvider.on('createTaskCategory', this.onCreateTaskCategory)
            taskCategoryProvider.on('deleteTaskCategory', this.onDeleteTaskCategory)

            let firstRender = true

            this.onRenderTasks = (force = false) => {
              if ((this.flagRenderTasks || force) && !this.flagRenderingTasks) {
                this.flagRenderingTasks = true
                this.renderTaskPreviews()
                this.flagRenderingTasks = false
                this.flagRenderTasks = false
                if (firstRender) {
                  firstRender = false
                  const urlParams = History.getState().data.params
                  if (urlParams.action === 'show' && urlParams.taskId) {
                    this.showTaskModal(identity, parseInt(urlParams.taskId, 10))
                  }
                }
              }
            }

            this.renderTasksInterval = window.setInterval(this.onRenderTasks, 500)
            this.requestRenderTasks()
          })
          .fail((err) => {
            console.error(err)
            this.$main.html(renderTemplate('internal-error-view'))
          })
      })
      .fail((err) => {
        console.error(err)
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss () {
    identityProvider.unsubscribe()

    if (this.onCreateTeamTaskHit) {
      contestProvider.off('createTeamTaskHit', this.onCreateTeamTaskHit)
      this.onCreateTeamTaskHit = null
      teamTaskHitProvider.unsubscribe()
    }

    if (this.onUpdateCategory) {
      categoryProvider.off('updateCategory', this.onUpdateCategory)
      this.onUpdateCategory = null
    }

    categoryProvider.unsubscribe()

    if (this.onCreateTask) {
      taskProvider.off('createTask', this.onCreateTask)
      this.onCreateTask = null
    }

    if (this.onOpenTask) {
      taskProvider.off('openTask', this.onOpenTask)
      this.onOpenTask = null
    }

    if (this.onCloseTask) {
      taskProvider.off('closeTask', this.onCloseTask)
      this.onCloseTask = null
    }

    if (this.onUpdateTask) {
      taskProvider.off('updateTask', this.onUpdateTask)
      this.onUpdateTask = null
    }

    taskProvider.unsubscribe()
    teamProvider.unsubscribe()

    if (this.onUpdateContest) {
      contestProvider.off('updateContest', this.onUpdateContest)
      this.onUpdateContest = null
    }

    if (this.onCreateTaskCategory) {
      taskCategoryProvider.off('createTaskCategory', this.onCreateTaskCategory)
      this.onCreateTaskCategory = null
    }

    if (this.onDeleteTaskCategory) {
      taskCategoryProvider.off('deleteTaskCategory', this.onDeleteTaskCategory)
      this.onDeleteTaskCategory = null
    }

    if (this.onRevealTaskCategory) {
      taskCategoryProvider.off('revealTaskCategory', this.onRevealTaskCategory)
      this.onRevealTaskCategory = null
    }

    taskCategoryProvider.unsubscribe()

    window.clearInterval(this.renderTasksInterval)
    this.onRenderTasks = null
    this.flagRenderTasks = false
    this.flagRenderingTasks = false

    this.$main.empty()
    this.$main = null
    this.$taskPreviewsList = null
    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new TasksView()
