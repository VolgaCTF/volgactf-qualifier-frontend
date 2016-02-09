import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import statusBar from '../status-bar'
import metadataStore from '../utils/metadata-store'
import moment from 'moment'
import taskCategoryModel from '../models/task-category'
import taskPreviewModel from '../models/task-preview'
import taskCategoryProvider from '../providers/task-category'
import taskProvider from '../providers/task'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import teamProvider from '../providers/team'
import MarkdownIt from 'markdown-it'
import 'bootstrap'
import 'jquery.form'
import 'parsley'


class TasksView extends View {
  constructor() {
    super(/^\/tasks$/)
    this.$main = null
    this.$taskCategoriesSection = null
    this.$taskCategoriesList = null

    this.$taskPreviewsList = null

    this.onCreateTaskCategory = null
    this.onUpdateTaskCategory = null
    this.onRemoveTaskCategory = null

    this.onCreateTask = null
    this.onOpenTask = null
    this.onCloseTask = null
    this.onUpdateTask = null

    this.onCreateTeamTaskProgress = null
    this.onUpdateContest = null
  }

  getTitle() {
    return `${metadataStore.getMetadata('event-title')} :: Tasks`
  }

  initCreateTaskCategoryModal() {
    let $createTaskCategoryModal = $('#create-task-category-modal')
    $createTaskCategoryModal.modal({ show: false })

    let $createTaskCategorySubmitError = $createTaskCategoryModal.find('.submit-error > p')
    let $createTaskCategorySubmitButton = $createTaskCategoryModal.find('button[data-action="complete-create-task-category"]')
    let $createTaskCategoryForm = $createTaskCategoryModal.find('form')
    $createTaskCategoryForm.parsley()

    $createTaskCategorySubmitButton.on('click', (e) => {
      $createTaskCategoryForm.trigger('submit')
    })

    $createTaskCategoryModal.on('show.bs.modal', (e) => {
      $createTaskCategorySubmitError.text('')
      $createTaskCategoryForm.parsley().reset()
    })

    $createTaskCategoryModal.on('shown.bs.modal', (e) => {
      $('#create-task-category-title').focus()
    })

    $createTaskCategoryForm.on('submit', (e) => {
      e.preventDefault()
      $createTaskCategoryForm.ajaxSubmit({
        beforeSubmit: () => {
          $createTaskCategorySubmitError.text('')
          $createTaskCategorySubmitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $createTaskCategoryModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $createTaskCategorySubmitError.text(jqXHR.responseJSON)
          } else {
            $createTaskCategorySubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $createTaskCategorySubmitButton.prop('disabled', false)
        }
      })
    })
  }

  initEditTaskCategoryModal() {
    let $editTaskCategoryModal = $('#edit-task-category-modal')
    $editTaskCategoryModal.modal({ show: false })

    let $editTaskCategorySubmitError = $editTaskCategoryModal.find('.submit-error > p')
    let $editTaskCategorySubmitButton = $editTaskCategoryModal.find('button[data-action="complete-edit-task-category"]')
    let $editTaskCategoryForm = $editTaskCategoryModal.find('form')
    $editTaskCategoryForm.parsley()

    $editTaskCategorySubmitButton.on('click', (e) => {
      $editTaskCategoryForm.trigger('submit')
    })

    let $editTaskCategoryTitle = $('#edit-task-category-title')
    let $editTaskCategoryDescription = $('#edit-task-category-description')

    $editTaskCategoryModal.on('show.bs.modal', (e) => {
      let taskCategoryId = parseInt($(e.relatedTarget).data('task-category-id'), 10)
      let taskCategory = _.findWhere(taskCategoryProvider.getTaskCategories(), { id: taskCategoryId })

      $editTaskCategoryForm.attr('action', `${metadataStore.getMetadata('domain-api')}/task/category/${taskCategoryId}/update`)
      $editTaskCategoryTitle.val(taskCategory.title)
      $editTaskCategoryDescription.val(taskCategory.description)
      $editTaskCategorySubmitError.text('')
      $editTaskCategoryForm.parsley().reset()
    })

    $editTaskCategoryModal.on('shown.bs.modal', (e) => {
      $editTaskCategoryTitle.focus()
    })

    $editTaskCategoryForm.on('submit', (e) => {
      e.preventDefault()
      $editTaskCategoryForm.ajaxSubmit({
        beforeSubmit: () => {
          $editTaskCategorySubmitError.text('')
          $editTaskCategorySubmitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $editTaskCategoryModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $editTaskCategorySubmitError.text(jqXHR.responseJSON)
          } else {
            $editTaskCategorySubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $editTaskCategorySubmitButton.prop('disabled', false)
        }
      })
    })
  }

  initRemoveTaskCategoryModal() {
    let $removeTaskCategoryModal = $('#remove-task-category-modal')
    $removeTaskCategoryModal.modal({ show: false })

    let $removeTaskCategoryModalBody = $removeTaskCategoryModal.find('.modal-body p.confirmation')
    let $removeTaskCategorySubmitError = $removeTaskCategoryModal.find('.submit-error > p')
    let $removeTaskCategorySubmitButton = $removeTaskCategoryModal.find('button[data-action="complete-remove-task-category"]')

    $removeTaskCategoryModal.on('show.bs.modal', (e) => {
      let taskCategoryId = parseInt($(e.relatedTarget).data('task-category-id'), 10)
      $removeTaskCategoryModal.data('task-category-id', taskCategoryId)
      let taskCategory = _.findWhere(taskCategoryProvider.getTaskCategories(), { id: taskCategoryId })
      $removeTaskCategoryModalBody.html(renderTemplate('remove-task-category-confirmation', { title: taskCategory.title }))
      $removeTaskCategorySubmitError.text('')
    })

    $removeTaskCategorySubmitButton.on('click', (e) => {
      let taskCategoryId = $removeTaskCategoryModal.data('task-category-id')
      $
        .when(taskCategoryProvider.removeTaskCategory(taskCategoryId, identityProvider.getIdentity().token))
        .done(() => {
          $removeTaskCategoryModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        })
        .fail((err) => {
          $removeTaskCategorySubmitError.text(err)
        })
    })
  }

  initCreateTaskModal() {
    let $createTaskModal = $('#create-task-modal')
    $createTaskModal.modal({ show: false })

    let $createTaskSubmitError = $createTaskModal.find('.submit-error > p')
    let $createTaskSubmitButton = $createTaskModal.find('button[data-action="complete-create-task"]')
    let $createTaskForm = $createTaskModal.find('form')
    $createTaskForm.parsley()

    $createTaskSubmitButton.on('click', (e) => {
      $createTaskForm.trigger('submit')
    })

    let $createTaskTablist = $('#create-task-tablist')
    let $createTaskTabData = $createTaskTablist.find('a[href="#create-task-data"]')
    let $createTaskTabPreview = $createTaskTablist.find('a[href="#create-task-preview"]')

    let $createTaskTitle = $('#create-task-title')
    let $createTaskDescription = $('#create-task-description')
    let $createTaskValue = $('#create-task-value')
    let $createTaskCategories = $('#create-task-categories')

    let $createTaskHints = $('#create-task-hints')
    let $createTaskHintList = $('#create-task-hint-list')

    let $createTaskAnswers = $('#create-task-answers')
    let $createTaskAnswerList = $('#create-task-answer-list')

    let $createTaskCaseSensitive = $('#create-task-case-sensitive')

    let $createTaskPreview = $('#create-task-preview')

    $createTaskTabData.tab()
    $createTaskTabPreview.tab()

    $createTaskHints.find('a[data-action="create-task-hint"]').on('click', (e) => {
      e.preventDefault()
      let number = $createTaskHintList.children().length + 1
      $createTaskHintList.append($(renderTemplate('create-task-hint-textarea-partial', { number: number })))
    })

    $createTaskHintList.on('click', 'a[data-action="remove-task-hint"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#create-task-hint-${number}`).remove()
      let hints = []
      $createTaskHintList.find('textarea[name="hints"]').each((ndx, $el) => {
        hints.push($($el).val())
      })

      $createTaskHintList.empty()
      _.each(hints, (hint, ndx) => {
        $createTaskHintList.append($(renderTemplate('create-task-hint-textarea-partial', { number: ndx + 1 })))
        $(`#create-task-hint-${ndx + 1} textarea`).val(hint)
      })
    })

    $createTaskAnswers.find('a[data-action="create-task-answer"]').on('click', (e) => {
      e.preventDefault()
      let number = $createTaskAnswerList.children().length + 1
      $createTaskAnswerList.append($(renderTemplate('create-task-answer-input-partial', { number: number })))
    })

    $createTaskAnswerList.on('click', 'a[data-action="remove-task-answer"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#create-task-answer-${number}`).remove()
      let answers = []
      $createTaskAnswerList.find('input[name="answers"]').each((ndx, $el) => {
        answers.push($($el).val())
      })
      $createTaskAnswerList.empty()
      _.each(answers, (answer, ndx) => {
        $createTaskAnswerList.append($(renderTemplate('create-task-answer-input-partial', { number: ndx + 1 })))
        $(`#create-task-answer-${ndx + 1} input`).val(answer)
      })
    })

    $createTaskTabPreview.on('show.bs.tab', (e) => {
      let md = new MarkdownIt()
      let hintsFormatted = []
      $createTaskHintList.find('textarea[name="hints"]').each((ndx, $el) => {
        hintsFormatted.push(md.render($($el).val()))
      })

      let options = {
        title: $createTaskTitle.val(),
        description: md.render($createTaskDescription.val()),
        hints: hintsFormatted
      }

      $createTaskPreview.html(renderTemplate('task-content-partial', options))
    })

    $createTaskModal.on('show.bs.modal', (e) => {
      $createTaskTabData.tab('show')
      $createTaskTitle.val('')
      $createTaskDescription.val('')
      $createTaskValue.val('')

      $createTaskCategories.empty()
      _.each(taskCategoryProvider.getTaskCategories(), (taskCategory) => {
        $createTaskCategories.append($('<option></option>').attr('value', taskCategory.id).text(taskCategory.title))
      })

      $createTaskHintList.empty()
      $createTaskAnswerList.empty()

      $createTaskCaseSensitive.val('true')

      $createTaskSubmitError.text('')
      $createTaskForm.parsley().reset()
    })

    $createTaskModal.on('shown.bs.modal', (e) => {
      $createTaskTitle.focus()
    })

    $createTaskForm.on('submit', (e) => {
      e.preventDefault()
      $createTaskForm.ajaxSubmit({
        beforeSubmit: () => {
          $createTaskSubmitError.text('')
          $createTaskSubmitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $createTaskModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $createTaskSubmitError.text(jqXHR.responseJSON)
          } else {
            $createTaskSubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $createTaskSubmitButton.prop('disabled', false)
        }
      })
    })
  }

  initEditTaskModal() {
    let $editTaskModal = $('#edit-task-modal')
    $editTaskModal.modal({ show: false })

    let $editTaskSubmitError = $editTaskModal.find('.submit-error > p')
    let $editTaskSubmitButton = $editTaskModal.find('button[data-action="complete-edit-task"]')
    let $editTaskForm = $editTaskModal.find('form')
    $editTaskForm.parsley()

    $editTaskSubmitButton.on('click', (e) => {
      $editTaskForm.trigger('submit')
    })

    let $editTaskTablist = $('#edit-task-tablist')
    let $editTaskTabData = $editTaskTablist.find('a[href="#edit-task-data"]')
    let $editTaskTabPreview = $editTaskTablist.find('a[href="#edit-task-preview"]')

    let $editTaskTitle = $('#edit-task-title')
    let $editTaskDescription = $('#edit-task-description')
    let $editTaskValue = $('#edit-task-value')
    let $editTaskCategories = $('#edit-task-categories')

    let $editTaskHints = $('#edit-task-hints')
    let $editTaskHintList = $('#edit-task-hint-list')

    let $editTaskAnswers = $('#edit-task-answers')
    let $editTaskAnswerList = $('#edit-task-answer-list')

    let $editTaskCaseSensitive = $('#edit-task-case-sensitive')

    let $editTaskPreview = $('#edit-task-preview')

    $editTaskTabData.tab()
    $editTaskTabPreview.tab()

    $editTaskHints.find('a[data-action="create-task-hint"]').on('click', (e) => {
      e.preventDefault()
      let number = $editTaskHintList.children().length + 1
      $editTaskHintList.append($(renderTemplate('edit-task-hint-textarea-partial', { number: number })))
    })

    $editTaskHintList.on('click', 'a[data-action="remove-task-hint"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#edit-task-hint-${number}`).remove()
      let hints = []
      $editTaskHintList.find('textarea[name="hints"]').each((ndx, el) => {
        let $el = $(el)
        hints.push($el.val())
      })
      $editTaskHintList.empty()
      _.each(hints, (hint, ndx) => {
        $editTaskHintList.append($(renderTemplate('edit-task-hint-textarea-partial', { number: ndx + 1 })))
        $(`#edit-task-hint-${ndx + 1} textarea`).val(hint)
      })
    })

    $editTaskAnswers.find('a[data-action="create-task-answer"]').on('click', (e) => {
      e.preventDefault()
      let number = $editTaskAnswerList.children().length + 1
      $editTaskAnswerList.append($(renderTemplate('edit-task-answer-input-partial', { number: number, editable: true })))
    })

    $editTaskAnswerList.on('click', 'a[data-action="remove-task-answer"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#edit-task-answer-${number}`).remove()
      let answerParams = []
      $editTaskAnswerList.find('input[name="answers"]').each((ndx, el) => {
        let $el = $(el)
        answerParams.push({
          value: $el.val(),
          editable: !$el.prop('disabled')
        })
      })

      $editTaskAnswerList.empty()
      _.each(answerParams, (answerParam, ndx) => {
        $editTaskAnswerList.append($(renderTemplate('edit-task-answer-input-partial', {
          number: ndx + 1,
          editable: answerParam.editable
        })))
        $(`#edit-task-answer-${ndx + 1} input`).val(answerParam.value)
      })
    })

    $editTaskTabPreview.on('show.bs.tab', (e) => {
      let md = new MarkdownIt()
      let hintsFormatted = []
      $editTaskHintList.find('textarea[name="hints"]').each((ndx, el) => {
        hintsFormatted.push(md.render($(el).val()))
      })

      let options = {
        title: $editTaskTitle.val(),
        description: md.render($editTaskDescription.val()),
        hints: hintsFormatted
      }

      $editTaskPreview.html(renderTemplate('task-content-partial', options))
    })

    $editTaskModal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $editTaskModal.data('task-id', taskId)

      $editTaskTabData.tab('show')
      $editTaskTitle.val('')
      $editTaskDescription.val('')
      $editTaskValue.val('')

      $editTaskCategories.empty()
      _.each(taskCategoryProvider.getTaskCategories(), (taskCategory) => {
        $editTaskCategories.append($('<option></option>').attr('value', taskCategory.id).text(taskCategory.title))
      })

      $editTaskHintList.empty()
      $editTaskAnswerList.empty()

      $editTaskCaseSensitive.val('true')

      $editTaskSubmitError.text('')
      $editTaskForm.parsley().reset()
      $editTaskForm.attr('action', `${metadataStore.getMetadata('domain-api')}/task/${taskId}/update`)

      $editTaskSubmitButton.prop('disabled', true)

      $
        .when(taskProvider.fetchTask(taskId, { full: true }))
        .done((task) => {
          $editTaskSubmitButton.prop('disabled', false)

          $editTaskTitle.val(task.title)
          $editTaskDescription.val(task.description)
          $editTaskValue.val(task.value)
          $editTaskCategories.val(task.categories)
          $editTaskCaseSensitive.val(task.caseSensitive.toString())

          $editTaskHintList.empty()
          _.each(task.hints, (hint, ndx) => {
            $editTaskHintList.append($(renderTemplate('edit-task-hint-textarea-partial', {
              number: ndx + 1,
              editable: false
            })))
            $(`#edit-task-hint-${ndx + 1} textarea`).val(hint)
          })

          $editTaskAnswerList.empty()
          _.each(task.answers, (answer, ndx) => {
            $editTaskAnswerList.append($(renderTemplate('edit-task-answer-input-partial', {
              number: ndx + 1,
              editable: false
            })))
            $(`#edit-task-answer-${ndx + 1} input`).val(answer)
          })
        })
        .fail((err) => {
          $editTaskSubmitError.text(err)
        })
    })

    $editTaskModal.on('shown.bs.modal', (e) => {
      $editTaskTitle.focus()
    })

    $editTaskForm.on('submit', (e) => {
      e.preventDefault()
      $editTaskForm.ajaxSubmit({
        beforeSubmit: () => {
          $editTaskSubmitError.text('')
          $editTaskSubmitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $editTaskModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $editTaskSubmitError.text(jqXHR.responseJSON)
          } else {
            $editTaskSubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $editTaskSubmitButton.prop('disabled', false)
        }
      })
    })
  }

  initReviseTaskModal() {
    let $reviseTaskModal = $('#revise-task-modal')
    $reviseTaskModal.modal({ show: false })

    let $reviseTaskSubmitError = $reviseTaskModal.find('.submit-error > p')
    let $reviseTaskSubmitSuccess = $reviseTaskModal.find('.submit-success > p')
    let $reviseTaskStatus = $reviseTaskModal.find('#revise-task-status')
    let $reviseTaskSubmitButton = $reviseTaskModal.find('button[data-action="complete-revise-task"]')
    let $reviseTaskForm = $reviseTaskModal.find('form')
    $reviseTaskForm.parsley()

    $reviseTaskSubmitButton.on('click', (e) => {
      $reviseTaskForm.trigger('submit')
    })

    let $reviseTaskAnswerGroup = $('#revise-task-answer-group')
    let $reviseTaskAnswer = $('#revise-task-answer')
    let $reviseTaskContents = $reviseTaskModal.find('.themis-task-contents')

    $reviseTaskModal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $reviseTaskModal.data('task-id', taskId)

      $reviseTaskForm.parsley().reset()
      $reviseTaskForm.attr('action', `${metadataStore.getMetadata('domain-api')}/task/${taskId}/revise`)

      $reviseTaskContents.empty()
      $reviseTaskAnswerGroup.show()
      $reviseTaskSubmitButton.show()
      $reviseTaskAnswer.val('')
      $reviseTaskSubmitError.text('')
      $reviseTaskSubmitSuccess.text('')
      $reviseTaskStatus.text('')
      $reviseTaskSubmitButton.prop('disabled', true)

      $
        .when(taskProvider.fetchTask(taskId))
        .done((task) => {
          let md = new MarkdownIt()
          let hintsFormatted = []
          _.each(task.hints, (hint) => {
            hintsFormatted.push(md.render(hint))
          })

          let options = {
            title: task.title,
            description: md.render(task.description),
            hints: hintsFormatted
          }

          $reviseTaskContents.html(renderTemplate('task-content-partial', options))

          let teamTaskProgressEntries = _.where(contestProvider.getTeamTaskProgressEntries(), { taskId: task.id })
          let sortedTeamTaskProgressEntries = _.sortBy(teamTaskProgressEntries, 'createdAt')
          let teamIds = _.map(sortedTeamTaskProgressEntries, (entry) => {
            return entry.teamId
          })
          let teamNames = []
          let teams = teamProvider.getTeams()
          for (let teamId of teamIds) {
            let team = _.findWhere(teams, { id: teamId })
            if (team) {
              teamNames.push(team.name)
            }
          }

          $reviseTaskStatus.html(renderTemplate('revise-task-status-partial', { teamNames: teamNames }))
          $reviseTaskSubmitButton.prop('disabled', false)
        })
        .fail((err) => {
          $reviseTaskSubmitError.text(err)
        })
    })

    $reviseTaskModal.on('shown.bs.modal', (e) => {
      $reviseTaskAnswer.focus()
    })

    $reviseTaskForm.on('submit', (e) => {
      e.preventDefault()
      $reviseTaskForm.ajaxSubmit({
        beforeSubmit: () => {
          $reviseTaskSubmitError.text('')
          $reviseTaskSubmitSuccess.text('')
          $reviseTaskSubmitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $reviseTaskAnswerGroup.hide()
          $reviseTaskSubmitButton.hide()
          $reviseTaskSubmitSuccess.text('Answer is correct!')
          let hideModal = () => {
            $reviseTaskModal.modal('hide')
            if (!dataStore.connectedRealtime()) {
              window.location.reload()
            }
          }

          setTimeout(hideModal, 1000)
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $reviseTaskSubmitError.text(jqXHR.responseJSON)
          } else {
            $reviseTaskSubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $reviseTaskSubmitButton.prop('disabled', false)
        }
      })
    })
  }

  initOpenTaskModal() {
    let $openTaskModal = $('#open-task-modal')
    $openTaskModal.modal({ show: false })

    let $openTaskModalBody = $openTaskModal.find('.modal-body p.confirmation')
    let $openTaskSubmitError = $openTaskModal.find('.submit-error > p')
    let $openTaskSubmitButton = $openTaskModal.find('button[data-action="complete-open-task"]')

    $openTaskModal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $openTaskModal.data('task-id', taskId)
      let taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      $openTaskModalBody.html(renderTemplate('open-task-confirmation', { title: taskPreview.title }))
      $openTaskSubmitError.text('')
    })

    $openTaskSubmitButton.on('click', (e) => {
      let taskId = $openTaskModal.data('task-id')
      $
        .when(taskProvider.openTask(taskId, identityProvider.getIdentity().token))
        .done(() => {
          $openTaskModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        })
        .fail((err) => {
          $openTaskSubmitError.text(err)
        })
    })
  }

  initCloseTaskModal() {
    let $closeTaskModal = $('#close-task-modal')
    $closeTaskModal.modal({ show: false })

    let $closeTaskModalBody = $closeTaskModal.find('.modal-body p.confirmation')
    let $closeTaskSubmitError = $closeTaskModal.find('.submit-error > p')
    let $closeTaskSubmitButton = $closeTaskModal.find('button[data-action="complete-close-task"]')

    $closeTaskModal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $closeTaskModal.data('task-id', taskId)
      let taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      $closeTaskModalBody.html(renderTemplate('close-task-confirmation', { title: taskPreview.title }))
      $closeTaskSubmitError.text('')
    })

    $closeTaskSubmitButton.on('click', (e) => {
      let taskId = $closeTaskModal.data('task-id')
      $
        .when(taskProvider.closeTask(taskId, identityProvider.getIdentity().token))
        .done(() => {
          $closeTaskModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        })
        .fail((err) => {
          $closeTaskSubmitError.text(err)
        })
    })
  }

  initSubmitTaskModal() {
    let $submitTaskModal = $('#submit-task-modal')
    $submitTaskModal.modal({ show: false })

    let $submitTaskSubmitError = $submitTaskModal.find('.submit-error > p')
    let $submitTaskInfo = $submitTaskModal.find('.submit-info > p')
    let $submitTaskSubmitSuccess = $submitTaskModal.find('.submit-success > p')
    let $submitTaskSubmitButton = $submitTaskModal.find('button[data-action="complete-submit-task"]')
    let $submitTaskForm = $submitTaskModal.find('form')
    $submitTaskForm.parsley()

    $submitTaskSubmitButton.on('click', (e) => {
      $submitTaskForm.trigger('submit')
    })

    let $submitTaskAnswerGroup = $('#submit-task-answer-group')
    let $submitTaskAnswer = $('#submit-task-answer')
    let $submitTaskContents = $submitTaskModal.find('.themis-task-contents')

    $submitTaskModal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)

      $submitTaskContents.empty()
      $submitTaskAnswer.val('')
      $submitTaskSubmitError.text('')
      $submitTaskInfo.text('')
      $submitTaskSubmitSuccess.text('')
      $submitTaskSubmitButton.prop('disabled', true)

      let taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      let identity = identityProvider.getIdentity()
      let contest = contestProvider.getContest()

      if (taskPreview && identity.role === 'team') {
        if (identity.emailConfirmed) {
          let taskIsSolved = false
          let taskProgress = _.findWhere(contestProvider.getTeamTaskProgressEntries(), {
            teamId: identity.id,
            taskId: taskId
          })
          if (taskProgress) {
            taskIsSolved = true
          }

          if (taskPreview.isOpened() && ((!taskIsSolved && contest.isStarted()) || contest.isFinished())) {
            $submitTaskAnswerGroup.show()
            $submitTaskSubmitButton.show()
          } else {
            $submitTaskAnswerGroup.hide()
            $submitTaskSubmitButton.hide()
            if (contest.isPaused() && !taskIsSolved) {
              $submitTaskSubmitError.text('Contest has been paused.')
            }
            if (taskPreview.isClosed()) {
              $submitTaskSubmitError.text('Task has been closed by the event organizers.')
            }
          }

          if (taskIsSolved) {
            $submitTaskSubmitSuccess.text(`Your team has solved the task on ${moment(taskProgress.createdAt).format('lll')}!`)
          }
        } else {
          $submitTaskSubmitError.text('You should confirm your email before you can submit an answer to the task.')
          $submitTaskAnswerGroup.hide()
          $submitTaskSubmitButton.hide()
        }
      } else {
        $submitTaskAnswerGroup.hide()
        $submitTaskSubmitButton.hide()
      }

      $submitTaskModal.data('task-id', taskId)

      $submitTaskForm.parsley().reset()
      if (contest.isFinished()) {
        $submitTaskForm.attr('action', `${metadataStore.getMetadata('domain-api')}/task/${taskId}/check`)
      } else {
        $submitTaskForm.attr('action', `${metadataStore.getMetadata('domain-api')}/task/${taskId}/submit`)
      }

      $
        .when(taskProvider.fetchTask(taskId), contestProvider.fetchSolvedTeamCountByTask(taskId))
        .done((task, solvedTeamCount) => {
          let md = new MarkdownIt()
          let hintsFormatted = []
          _.each(task.hints, (hint) => {
            hintsFormatted.push(md.render(hint))
          })
          let options = {
            title: task.title,
            description: md.render(task.description),
            hints: hintsFormatted
          }
          $submitTaskContents.html(renderTemplate('task-content-partial', options))

          $submitTaskInfo.text(renderTemplate('submit-task-status-partial', { solvedTeamCount: solvedTeamCount }))

          $submitTaskSubmitButton.prop('disabled', false)
        })
        .fail((err) => {
          $submitTaskSubmitError.text(err)
        })
    })

    $submitTaskModal.on('shown.bs.modal', (e) => {
      $submitTaskAnswer.focus()
    })

    $submitTaskForm.on('submit', (e) => {
      e.preventDefault()
      $submitTaskForm.ajaxSubmit({
        beforeSubmit: () => {
          $submitTaskSubmitError.text('')
          $submitTaskSubmitSuccess.text('')
          $submitTaskSubmitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $submitTaskAnswerGroup.hide()
          $submitTaskSubmitButton.hide()
          $submitTaskSubmitSuccess.text('Answer is correct!')
          let hideModal = () => {
            $submitTaskModal.modal('hide')
            if (!dataStore.connectedRealtime()) {
              window.location.reload()
            }
          }

          setTimeout(hideModal, 1000)
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitTaskSubmitError.text(jqXHR.responseJSON)
          } else {
            $submitTaskSubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $submitTaskSubmitButton.prop('disabled', false)
        }
      })
    })
  }

  initCheckTaskModal() {
    let $checkTaskModal = $('#check-task-modal')
    $checkTaskModal.modal({ show: false })

    let $checkTaskSubmitError = $checkTaskModal.find('.submit-error > p')
    let $checkTaskInfo = $checkTaskModal.find('.submit-info > p')
    let $checkTaskSubmitSuccess = $checkTaskModal.find('.submit-success > p')
    let $checkTaskSubmitButton = $checkTaskModal.find('button[data-action="complete-check-task"]')
    let $checkTaskForm = $checkTaskModal.find('form')
    $checkTaskForm.parsley()

    $checkTaskSubmitButton.on('click', (e) => {
      $checkTaskForm.trigger('submit')
    })

    let $checkTaskAnswerGroup = $('#check-task-answer-group')
    let $checkTaskAnswer = $('#check-task-answer')
    let $checkTaskContents = $checkTaskModal.find('.themis-task-contents')

    $checkTaskModal.on('show.bs.modal', (e) => {
      let taskId = parseInt($(e.relatedTarget).data('task-id'), 10)

      $checkTaskContents.empty()
      $checkTaskAnswer.val('')
      $checkTaskSubmitError.text('')
      $checkTaskInfo.text('')
      $checkTaskSubmitSuccess.text('')
      $checkTaskSubmitButton.prop('disabled', true)

      let taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      let identity = identityProvider.getIdentity()
      let contest = contestProvider.getContest()

      if (taskPreview && identity.role === 'guest') {
        if (contest.isFinished()) {
          if (taskPreview.isOpened()) {
            $checkTaskAnswerGroup.show()
            $checkTaskSubmitButton.show()
          } else {
            $checkTaskAnswerGroup.hide()
            $checkTaskSubmitButton.hide()
            if (taskPreview.isClosed()) {
              $checkTaskSubmitError.text('Task has been closed by the event organizers.')
            }
          }
        } else {
          $checkTaskAnswerGroup.hide()
          $checkTaskSubmitButton.hide()
          $checkTaskSubmitError.html(renderTemplate('check-task-guest-error'))
        }
      } else {
        $checkTaskAnswerGroup.hide()
        $checkTaskSubmitButton.hide()
      }

      $checkTaskModal.data('task-id', taskId)

      $checkTaskForm.parsley().reset()
      $checkTaskForm.attr('action', `${metadataStore.getMetadata('domain-api')}/task/${taskId}/check`)

      if (contest.isFinished()) {
        $
          .when(taskProvider.fetchTask(taskId))
          .done((task) => {
            let md = new MarkdownIt()
            let hintsFormatted = []
            _.each(task.hints, (hint) => {
              hintsFormatted.push(md.render(hint))
            })

            let options = {
              title: task.title,
              description: md.render(task.description),
              hints: hintsFormatted
            }
            $checkTaskContents.html(renderTemplate('task-content-partial', options))
            $checkTaskSubmitButton.prop('disabled', false)
          })
          .fail((err) => {
            $checkTaskSubmitError.text(err)
          })
      }
    })

    $checkTaskModal.on('shown.bs.modal', (e) => {
      $checkTaskAnswer.focus()
    })

    $checkTaskForm.on('submit', (e) => {
      e.preventDefault()
      $checkTaskForm.ajaxSubmit({
        beforeSubmit: () => {
          $checkTaskSubmitError.text('')
          $checkTaskSubmitSuccess.text('')
          $checkTaskSubmitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $checkTaskAnswerGroup.hide()
          $checkTaskSubmitButton.hide()
          $checkTaskSubmitSuccess.text('Answer is correct!')
          let hideModal = () => {
            $checkTaskModal.modal('hide')
            if (!dataStore.connectedRealtime()) {
              window.location.reload()
            }
          }

          setTimeout(hideModal, 1000)
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $checkTaskSubmitError.text(jqXHR.responseJSON)
          } else {
            $checkTaskSubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $checkTaskSubmitButton.prop('disabled', false)
        }
      })
    })
  }

  renderTaskCategories() {
    let taskCategories = taskCategoryProvider.getTaskCategories()
    if (taskCategories.length === 0) {
      this.$taskCategoriesList.empty()
      this.$taskCategoriesList.html($('<p></p>').addClass('lead').text('No task categories yet.'))
    } else {
      this.$taskCategoriesList.empty()
      let sortedTaskCategories = _.sortBy(taskCategories, 'createdAt')
      let manageable = (identityProvider.getIdentity().role === 'admin' && !contestProvider.getContest().isFinished())
      for (let taskCategory of sortedTaskCategories) {
        let options = {
          id: taskCategory.id,
          title: taskCategory.title,
          description: taskCategory.description,
          updatedAt: moment(taskCategory.updatedAt).format('lll'),
          manageable: manageable
        }

        this.$taskCategoriesList.append($(renderTemplate('task-category-supervisor-partial', options)))
      }
    }
  }

  renderTaskPreviews() {
    let taskPreviews = taskProvider.getTaskPreviews()
    if (taskPreviews.length === 0) {
      this.$taskPreviewsList.empty()
      this.$taskPreviewsList.html($('<p></p>').addClass('lead').text('No tasks yet.'))
    } else {
      let identity = identityProvider.getIdentity()
      let solvedTaskIds = []
      if (identity.role === 'team') {
        let taskProgressEntries = _.where(contestProvider.getTeamTaskProgressEntries(), { teamId: identity.id })
        solvedTaskIds = _.map(taskProgressEntries, (taskProgress) => {
          return taskProgress.taskId
        })
      }

      let getSortResultByKey = (a, b, getValueFunc) => {
        let valA = getValueFunc(a)
        let valB = getValueFunc(b)
        if (a < b) {
          return -1
        } else if (a > b) {
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
          } if(a.isInitial() && b.isClosed()) {
            return 1
          }

          return 0
        }
      }

      let taskCategories = taskCategoryProvider.getTaskCategories()

      this.$taskPreviewsList.empty()
      taskPreviews.sort(sortTaskPreviewsFunc)
      let contest = contestProvider.getContest()
      for (let taskPreview of taskPreviews) {
        let categoriesList = ''
        for (let categoryId of taskPreview.categories) {
          let taskCategory = _.findWhere(taskCategories, { id: categoryId })
          if (taskCategory) {
            categoriesList += renderTemplate('task-category-partial', {
              title: taskCategory.title,
              description: taskCategory.description
            })
          }
        }

        let taskIsSolved = (identity.role === 'team' && _.contains(solvedTaskIds, taskPreview.id))

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

  present() {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(identityProvider.fetchIdentity(), contestProvider.fetchContest())
      .done((identity, contest) => {
        identityProvider.subscribe()
        this.$main.html(renderTemplate('tasks-view', { identity: identity }))

        if (dataStore.supportsRealtime()) {
          dataStore.connectRealtime()
        }

        let isAdmin = (identity.role === 'admin')
        let isSupervisor = _.contains(['admin', 'manager'], identity.role)
        let isTeam = (identity.role === 'team')
        let isGuest = (identity.role === 'guest')

        navigationBar.present({ active: 'tasks' })

        let promise = null
        if (isTeam) {
          promise = $.when(taskProvider.fetchTaskPreviews(), taskCategoryProvider.fetchTaskCategories(), contestProvider.fetchTeamTaskProgressEntries(), contestProvider.fetchTeamScores())
        } else if (isSupervisor) {
          promise = $.when(taskProvider.fetchTaskPreviews(), taskCategoryProvider.fetchTaskCategories(), contestProvider.fetchTeamTaskProgressEntries(), teamProvider.fetchTeams())
        } else {
          promise = $.when(taskProvider.fetchTaskPreviews(), taskCategoryProvider.fetchTaskCategories())
        }

        promise
          .done((taskPreviews, taskCategories) => {
            this.$taskCategoriesSection = $('#themis-task-categories')
            statusBar.present()

            if (isSupervisor) {
              this.$taskCategoriesSection.html(renderTemplate('task-categories-view', {
                identity: identity,
                contest: contest
              }))
              this.$taskCategoriesList = $('#themis-task-categories-list')

              this.renderTaskCategories()
              this.initReviseTaskModal()
            }

            if (isAdmin) {
              this.initCreateTaskCategoryModal()
              this.initEditTaskCategoryModal()
              this.initRemoveTaskCategoryModal()

              this.initCreateTaskModal()
              this.initOpenTaskModal()
              this.initCloseTaskModal()
              this.initEditTaskModal()
            }

            if (isTeam) {
              this.initSubmitTaskModal()
            }

            if (isGuest) {
              this.initCheckTaskModal()
            }

            this.$taskPreviewsList = $('#themis-task-previews')
            this.renderTaskPreviews()

            this.onCreateTaskCategory = (taskCategory) => {
              if (isSupervisor) {
                this.renderTaskCategories()
              }
              return false
            }

            this.onUpdateTaskCategory = (taskCategory) => {
              if (isSupervisor) {
                this.renderTaskCategories()
              }

              this.renderTaskPreviews()
              return false
            }

            this.onRemoveTaskCategory = (taskCategoryId) => {
              if (isSupervisor) {
                this.renderTaskCategories()
              }

              this.renderTaskPreviews()
              return false
            }

            taskCategoryProvider.subscribe()
            taskCategoryProvider.on('createTaskCategory', this.onCreateTaskCategory)
            taskCategoryProvider.on('updateTaskCategory', this.onUpdateTaskCategory)
            taskCategoryProvider.on('removeTaskCategory', this.onRemoveTaskCategory)

            taskProvider.subscribe()
            if (isSupervisor) {
              this.onCreateTask = (taskPreview) => {
                this.renderTaskPreviews()
                return false
              }

              taskProvider.on('createTask', this.onCreateTask)
            }

            this.onOpenTask = (taskPreview) => {
              this.renderTaskPreviews()
              return false
            }

            taskProvider.on('openTask', this.onOpenTask)

            this.onCloseTask = (taskPreview) => {
              this.renderTaskPreviews()
              return false
            }

            taskProvider.on('closeTask', this.onCloseTask)

            this.onUpdateTask = (taskPreview) => {
              this.renderTaskPreviews()
              return false
            }

            taskProvider.on('updateTask', this.onUpdateTask)

            if (isTeam) {
              this.onCreateTeamTaskProgress = (teamTaskProgress) => {
                this.renderTaskPreviews()
                return false
              }

              contestProvider.on('createTeamTaskProgress', this.onCreateTeamTaskProgress)
            }

            this.onUpdateContest = (contest) => {
              this.renderTaskCategories()
              this.renderTaskPreviews()
              return false
            }

            contestProvider.on('updateContest', this.onUpdateContest)

            teamProvider.subscribe()
          })
          .fail((err) => {
            this.$main.html(renderTemplate('internal-error-view'))
          })
      })
      .fail((err) => {
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss() {
    identityProvider.unsubscribe()

    if (this.onCreateTeamTaskProgress) {
      contestProvider.off('createTeamTaskProgress', this.onCreateTeamTaskProgress)
      this.onCreateTeamTaskProgress = null
    }

    if (this.onCreateTaskCategory) {
      taskCategoryProvider.off('createTaskCategory', this.onCreateTaskCategory)
      this.onCreateTaskCategory = null
    }

    if (this.onUpdateTaskCategory) {
      taskCategoryProvider.off('updateTaskCategory', this.onUpdateTaskCategory)
      this.onUpdateTaskCategory = null
    }

    if (this.onRemoveTaskCategory) {
      taskCategoryProvider.off('removeTaskCategory', this.onRemoveTaskCategory)
      this.onRemoveTaskCategory = null
    }

    taskCategoryProvider.unsubscribe()

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

    this.$main.empty()
    this.$main = null
    this.$taskCategoriesSection = null
    this.$taskCategoriesList = null
    this.$taskPreviewsList = null
    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}


export default new TasksView()
