import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import dataStore from '../data-store'
import newNavigationBar from '../new-navigation-bar'
import newStatusBar from '../new-status-bar'
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
import URLSearchParams from 'url-search-params'
import 'bootstrap'
import 'jquery-form'
import 'parsley'

import remoteCheckerProvider from '../providers/remote-checker'
import taskRemoteCheckerProvider from '../providers/task-remote-checker'

class TasksView extends View {
  constructor () {
    super()
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

  initCreateTaskModal () {
    let $modal = $('#create-task-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-create-task"]')
    let $form = $modal.find('form')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element;
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

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

    const $taskCheckMethod = $('#create-task-check-method')
    const $taskCheckMethodList = $('#create-task-check-method-list')
    const $taskCheckMethodRemote = $('#create-task-check-method-remote')

    let $taskAnswerGroup = $('#create-task-answer-group')
    let $taskAnswerList = $('#create-task-answer-list')

    const $taskRemoteCheckerGroup = $('#create-task-remote-checker-group')
    const $taskRemoteChecker = $('#create-task-remote-checker')

    let $taskPreview = $('#create-task-preview')

    $tabData.tab()
    $tabPreview.tab()

    $taskHints.find('a[data-action="create-task-hint"]').on('click', (e) => {
      e.preventDefault()
      $taskHintList.append(window.themis.quals.templates.createTaskHintTextareaPartial({
        _: _,
        number: $taskHintList.children().length + 1,
        hint: ''
      }))
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
        $taskHintList.append(window.themis.quals.templates.createTaskHintTextareaPartial({
          _: _,
          number: ndx + 1,
          hint: hint
        }))
      })
    })

    $taskAnswerGroup.find('a[data-action="create-task-answer"]').on('click', (e) => {
      e.preventDefault()
      $taskAnswerList.append(window.themis.quals.templates.createTaskAnswerInputPartial({
        _: _,
        number: $taskAnswerList.children().length + 1,
        answer: '',
        caseSensitive: true
      }))
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
        $taskAnswerList.append(window.themis.quals.templates.createTaskAnswerInputPartial({
          _: _,
          number: ndx + 1,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        }))
      })
    })

    $tabPreview.on('show.bs.tab', (e) => {
      const md = new MarkdownRenderer()

      $taskPreview.html(window.themis.quals.templates.taskContentPartial({
        _: _,
        title: $taskTitle.val(),
        description: md.render($taskDescription.val()),
        hints: getHints().map((hint) => {
          return md.render(hint)
        })
      }))
    })

    $taskCheckMethod.on('change', () => {
      const method = $('input[type="radio"]:checked', $taskCheckMethod).val()
      $taskAnswerGroup.toggle(method === 'list')
      $taskRemoteCheckerGroup.toggle(method === 'remote')
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

      $taskRemoteChecker.empty()
      _.each(remoteCheckerProvider.getRemoteCheckers(), (remoteChecker) => {
        $taskRemoteChecker
        .append($('<option></option>')
        .attr('value', remoteChecker.id)
        .prop('disabled', _.where(taskRemoteCheckerProvider.getTaskRemoteCheckers(), { remoteCheckerId: remoteChecker.id }).length > 0)
        .text(remoteChecker.name))
      })

      $taskHintList.empty()
      $taskAnswerList.empty()

      $taskCheckMethodList.prop('checked', true)
      $taskAnswerGroup.show()

      $taskCheckMethodRemote.prop('checked', false)
      $taskRemoteCheckerGroup.hide()

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
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element;
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

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

    const $taskCheckMethod = $('#edit-task-check-method')
    const $taskCheckMethodList = $('#edit-task-check-method-list')
    const $taskCheckMethodRemote = $('#edit-task-check-method-remote')

    let $taskAnswerGroup = $('#edit-task-answer-group')
    let $taskAnswerList = $('#edit-task-answer-list')

    const $taskRemoteCheckerGroup = $('#edit-task-remote-checker-group')
    const $taskRemoteChecker = $('#edit-task-remote-checker')

    let $taskPreview = $('#edit-task-preview')

    $tabData.tab()
    $tabPreview.tab()

    $taskHints.find('a[data-action="create-task-hint"]').on('click', (e) => {
      e.preventDefault()
      $taskHintList.append(window.themis.quals.templates.editTaskHintTextareaPartial({
        _: _,
        number: $taskHintList.children().length + 1,
        hint: '',
        editable: true
      }))
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
        $taskHintList.append(window.themis.quals.templates.editTaskHintTextareaPartial({
          _: _,
          number: ndx + 1,
          editable: false,
          hint: entry.hint
        }))
      })
      _.each(hints, (hint, ndx) => {
        $taskHintList.append(window.themis.quals.templates.editTaskHintTextareaPartial({
          _: _,
          number: savedTaskHints.length + ndx + 1,
          editable: true,
          hint: hint
        }))
      })
    })

    $taskAnswerGroup.find('a[data-action="create-task-answer"]').on('click', (e) => {
      e.preventDefault()
      $taskAnswerList.append(window.themis.quals.templates.editTaskAnswerInputPartial({
        _: _,
        number: $taskAnswerList.children().length + 1,
        editable: true,
        answer: '',
        caseSensitive: true
      }))
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
        $taskAnswerList.append(window.themis.quals.templates.editTaskAnswerInputPartial({
          _: _,
          number: ndx + 1,
          editable: false,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        }))
      })
      _.each(answers, (entry, ndx) => {
        $taskAnswerList.append(window.themis.quals.templates.editTaskAnswerInputPartial({
          _: _,
          number: savedTaskAnswers.length + ndx + 1,
          editable: true,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        }))
      })
    })

    $tabPreview.on('show.bs.tab', (e) => {
      let md = new MarkdownRenderer()
      let hintsFormatted = savedTaskHints.map((entry) => {
        return entry.hint
      }).concat(getHints()).map((hint) => {
        return md.render(hint)
      })

      $taskPreview.html(window.themis.quals.templates.taskContentPartial({
        _: _,
        title: $taskTitle.val(),
        description: md.render($taskDescription.val()),
        hints: hintsFormatted
      }))
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

      let checkMethod = 'list'
      if (_.where(taskRemoteCheckerProvider.getTaskRemoteCheckers(), { taskId: taskId }).length > 0) {
        checkMethod = 'remote'
      }

      $taskRemoteChecker.empty()
      _.each(remoteCheckerProvider.getRemoteCheckers(), (remoteChecker) => {
        $taskRemoteChecker
        .append($('<option></option>')
        .attr('value', remoteChecker.id)
        .prop('selected', _.where(taskRemoteCheckerProvider.getTaskRemoteCheckers(), { taskId: taskId, remoteCheckerId: remoteChecker.id }).length > 0)
        .text(remoteChecker.name))
      })

      $taskCheckMethodList.prop('checked', checkMethod === 'list')
      $taskAnswerGroup.toggle(checkMethod === 'list')

      $taskCheckMethodRemote.prop('checked', checkMethod === 'remote')
      $taskRemoteCheckerGroup.toggle(checkMethod === 'remote')

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
            $taskHintList.append(window.themis.quals.templates.editTaskHintTextareaPartial({
              _: _,
              number: ndx + 1,
              editable: false,
              hint: entry.hint
            }))
          })

          $taskAnswerList.empty()
          _.each(taskAnswers, (entry, ndx) => {
            $taskAnswerList.append(window.themis.quals.templates.editTaskAnswerInputPartial({
              _: _,
              number: ndx + 1,
              editable: false,
              answer: entry.answer,
              caseSensitive: entry.caseSensitive
            }))
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

      const taskId = $modal.data('task-id')
      let checkMethod = 'list'
      if (_.where(taskRemoteCheckerProvider.getTaskRemoteCheckers(), { taskId: taskId }).length > 0) {
        checkMethod = 'remote'
      }

      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        data: {
          checkMethod: checkMethod,
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
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element;
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

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

          $taskContents.html(window.themis.quals.templates.taskContentPartial({
            _: _,
            title: task.title,
            description: md.render(task.description),
            hints: _.map(taskHints, (taskHint) => {
              return md.render(taskHint.hint)
            })
          }))

          $taskStatus.html(window.themis.quals.templates.reviseTaskStatusPartial({
            _: _,
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
          $submitSuccess.text('The answer is correct!')
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
      const msgTemplate = _.template('You are about to open the task <mark><%- title %></mark>. Teams will be able to submit answers for the task. Continue?')
      $modalBody.html(msgTemplate({ title: taskPreview.title }))
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
      const msgTemplate = _.template('You are about to close the task <mark><%- title %></mark>. Teams will not be able to submit answers for the task although the scores will not be recalculated. Continue?')
      $modalBody.html(msgTemplate({ title: taskPreview.title }))
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
    $submitForm.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element;
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

    $submitButton.on('click', (e) => {
      $submitForm.trigger('submit')
    })

    let $submitFieldGroup = $('#submit-task-field-group')
    let $taskAnswer = $('#submit-task-answer')
    let $taskContents = $modal.find('.themis-task-contents')

    let $reviewButton = $modal.find('button[data-action="complete-review-task"]')
    let $reviewForm = $modal.find('form[data-target="review"]')
    $reviewForm.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element;
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })
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
          $taskContents.html(window.themis.quals.templates.taskContentPartial({
            _: _,
            title: task.title,
            description: md.render(task.description),
            hints: hintsFormatted
          }))

          teamTaskReview = _.findWhere(teamTaskReviews, { taskId: taskId, teamId: identityProvider.getIdentity().id })

          $taskInfo.show().html(window.themis.quals.templates.submitTaskStatusPartial({
            _: _,
            taskSolvedAt: taskSolvedAt ? moment(taskSolvedAt).format('MMM D [at] HH:mm [UTC]') : null,
            solvedTeamCount: taskHitStatistics.count,
            reviewAverageRating: taskReviewStatistics.averageRating,
            reviewCount: taskReviewStatistics.count,
            teamReview: teamTaskReview ? {
              rating: teamTaskReview.rating,
              comment: teamTaskReview.comment,
              createdAt: moment(teamTaskReview.createdAt).format('MMM D [at] HH:mm [UTC]')
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
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element;
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

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
          $submitError.html('You must be authorized in order to view the task and submit answers. Please <u><a class="text-danger" href="/team/signin">sign in</a></u>. If you have not registered yet, please <u><a class="text-danger" href="/team/signup">sign up</a></u>.')
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

            $taskContents.html(window.themis.quals.templates.taskContentPartial({
              _: _,
              title: task.title,
              description: md.render(task.description),
              hints: hintsFormatted
            }))
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
    const identity = identityProvider.getIdentity()
    let teamTaskHits = []
    if (identity.isTeam()) {
      teamTaskHits = _.where(teamTaskHitProvider.getTeamTaskHits(), { teamId: identity.id })
    }

    this.$taskPreviewsList.html(window.themis.quals.templates.taskList({
      _: _,
      templates: window.themis.quals.templates,
      identity: identity,
      contest: contestProvider.getContest(),
      categories: categoryProvider.getCategories(),
      taskPreviews: taskProvider.getTaskPreviews(),
      taskCategories: taskCategoryProvider.getTaskCategories(),
      teamTaskHits: teamTaskHits
    }))
  }

  present () {
    this.$main = $('#main')

    $
      .when(identityProvider.initIdentity(), contestProvider.initContest())
      .done((identity, contest) => {
        identityProvider.subscribe()
        newNavigationBar.present()

        let promise = null
        if (identity.isTeam()) {
          promise = $.when(taskProvider.initTaskPreviews(), categoryProvider.initCategories(), taskCategoryProvider.initTaskCategories(), teamTaskHitProvider.initTeamTaskHits(), contestProvider.initTeamScores())
        } else if (identity.isAdmin()) {
          promise = $.when(taskProvider.initTaskPreviews(), categoryProvider.initCategories(), taskCategoryProvider.initTaskCategories(), remoteCheckerProvider.initRemoteCheckers(), taskRemoteCheckerProvider.initTaskRemoteCheckers())
        } else {
          promise = $.when(taskProvider.initTaskPreviews(), categoryProvider.initCategories(), taskCategoryProvider.initTaskCategories())
        }

        promise
          .done((taskPreviews, categories) => {
            newStatusBar.present()

            if (identity.isSupervisor()) {
              this.initReviseTaskModal()
            }

            if (identity.isAdmin()) {
              remoteCheckerProvider.subscribe()
              taskRemoteCheckerProvider.subscribe()

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
                  const urlParams = new URLSearchParams(window.location.search)
                  if (urlParams.get('action') === 'show' && urlParams.has('taskId')) {
                    this.showTaskModal(identity, parseInt(urlParams.get('taskId'), 10))
                  }
                }
              }
            }

            this.renderTasksInterval = window.setInterval(this.onRenderTasks, 500)
          })
      })
  }
}

export default new TasksView()
