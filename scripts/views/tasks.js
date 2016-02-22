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
import 'bootstrap'
import 'jquery.form'
import 'parsley'

class TasksView extends View {
  constructor () {
    super(/^\/tasks$/)
    this.$main = null
    this.$categoriesSection = null
    this.$categoriesList = null

    this.$taskPreviewsList = null

    this.onCreateCategory = null
    this.onUpdateCategory = null
    this.onRemoveCategory = null

    this.onCreateTaskCategory = null
    this.onRemoveTaskCategory = null

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

  initCreateCategoryModal () {
    let $createCategoryModal = $('#create-category-modal')
    $createCategoryModal.modal({ show: false })

    let $createCategorySubmitError = $createCategoryModal.find('.submit-error > p')
    let $createCategorySubmitButton = $createCategoryModal.find('button[data-action="complete-create-category"]')
    let $createCategoryForm = $createCategoryModal.find('form')
    $createCategoryForm.parsley()

    $createCategorySubmitButton.on('click', (e) => {
      $createCategoryForm.trigger('submit')
    })

    $createCategoryModal.on('show.bs.modal', (e) => {
      $createCategorySubmitError.text('')
      $createCategoryForm.parsley().reset()
    })

    $createCategoryModal.on('shown.bs.modal', (e) => {
      $('#create-category-title').focus()
    })

    $createCategoryForm.on('submit', (e) => {
      e.preventDefault()
      $createCategoryForm.ajaxSubmit({
        beforeSubmit: () => {
          $createCategorySubmitError.text('')
          $createCategorySubmitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $createCategoryModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $createCategorySubmitError.text(jqXHR.responseJSON)
          } else {
            $createCategorySubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $createCategorySubmitButton.prop('disabled', false)
        }
      })
    })
  }

  initEditCategoryModal () {
    let $editCategoryModal = $('#edit-category-modal')
    $editCategoryModal.modal({ show: false })

    let $editCategorySubmitError = $editCategoryModal.find('.submit-error > p')
    let $editCategorySubmitButton = $editCategoryModal.find('button[data-action="complete-edit-category"]')
    let $editCategoryForm = $editCategoryModal.find('form')
    $editCategoryForm.parsley()

    $editCategorySubmitButton.on('click', (e) => {
      $editCategoryForm.trigger('submit')
    })

    let $editCategoryTitle = $('#edit-category-title')
    let $editCategoryDescription = $('#edit-category-description')

    $editCategoryModal.on('show.bs.modal', (e) => {
      let categoryId = parseInt($(e.relatedTarget).data('category-id'), 10)
      let category = _.findWhere(categoryProvider.getCategories(), { id: categoryId })

      $editCategoryForm.attr('action', `/api/category/${categoryId}/update`)
      $editCategoryTitle.val(category.title)
      $editCategoryDescription.val(category.description)
      $editCategorySubmitError.text('')
      $editCategoryForm.parsley().reset()
    })

    $editCategoryModal.on('shown.bs.modal', (e) => {
      $editCategoryTitle.focus()
    })

    $editCategoryForm.on('submit', (e) => {
      e.preventDefault()
      $editCategoryForm.ajaxSubmit({
        beforeSubmit: () => {
          $editCategorySubmitError.text('')
          $editCategorySubmitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $editCategoryModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $editCategorySubmitError.text(jqXHR.responseJSON)
          } else {
            $editCategorySubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $editCategorySubmitButton.prop('disabled', false)
        }
      })
    })
  }

  initRemoveCategoryModal () {
    let $removeCategoryModal = $('#remove-category-modal')
    $removeCategoryModal.modal({ show: false })

    let $removeCategoryModalBody = $removeCategoryModal.find('.modal-body p.confirmation')
    let $removeCategorySubmitError = $removeCategoryModal.find('.submit-error > p')
    let $removeCategorySubmitButton = $removeCategoryModal.find('button[data-action="complete-remove-category"]')

    $removeCategoryModal.on('show.bs.modal', (e) => {
      let categoryId = parseInt($(e.relatedTarget).data('category-id'), 10)
      $removeCategoryModal.data('category-id', categoryId)
      let category = _.findWhere(categoryProvider.getCategories(), { id: categoryId })
      $removeCategoryModalBody.html(renderTemplate('remove-category-confirmation', { title: category.title }))
      $removeCategorySubmitError.text('')
    })

    $removeCategorySubmitButton.on('click', (e) => {
      let categoryId = $removeCategoryModal.data('category-id')
      $
        .when(categoryProvider.removeCategory(categoryId, identityProvider.getIdentity().token))
        .done(() => {
          $removeCategoryModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        })
        .fail((err) => {
          $removeCategorySubmitError.text(err)
        })
    })
  }

  initCreateTaskModal () {
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
    let $createCategories = $('#create-categories')

    let $createTaskHints = $('#create-task-hints')
    let $createTaskHintList = $('#create-task-hint-list')

    let $createTaskAnswers = $('#create-task-answers')
    let $createTaskAnswerList = $('#create-task-answer-list')

    let $createTaskPreview = $('#create-task-preview')

    $createTaskTabData.tab()
    $createTaskTabPreview.tab()

    $createTaskHints.find('a[data-action="create-task-hint"]').on('click', (e) => {
      e.preventDefault()
      let options = {
        number: $createTaskHintList.children().length + 1,
        hint: ''
      }
      $createTaskHintList.append($(renderTemplate('create-task-hint-textarea-partial', options)))
    })

    function getHints () {
      let hints = []
      $createTaskHintList.find('.themis-task-hint-group').each((ndx, el) => {
        let $el = $(el)
        hints.push($el.find('textarea').val())
      })

      return hints
    }

    $createTaskHintList.on('click', 'a[data-action="remove-task-hint"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#create-task-hint-${number}`).remove()
      let hints = getHints()
      $createTaskHintList.empty()
      _.each(hints, (hint, ndx) => {
        let options = {
          number: ndx + 1,
          hint: hint
        }
        $createTaskHintList.append($(renderTemplate('create-task-hint-textarea-partial', options)))
      })
    })

    $createTaskAnswers.find('a[data-action="create-task-answer"]').on('click', (e) => {
      e.preventDefault()
      let options = {
        number: $createTaskAnswerList.children().length + 1,
        answer: '',
        caseSensitive: true
      }
      $createTaskAnswerList.append($(renderTemplate('create-task-answer-input-partial', options)))
    })

    function getAnswers () {
      let answers = []
      $createTaskAnswerList.find('.themis-task-answer-group').each((ndx, el) => {
        let $el = $(el)
        answers.push({
          answer: $el.find('input[type=text]').val(),
          caseSensitive: $el.find('input[type=checkbox]').prop('checked')
        })
      })

      return answers
    }

    $createTaskAnswerList.on('click', 'a[data-action="remove-task-answer"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#create-task-answer-${number}`).remove()
      let answers = getAnswers()
      $createTaskAnswerList.empty()
      _.each(answers, (entry, ndx) => {
        let options = {
          number: ndx + 1,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        }
        $createTaskAnswerList.append($(renderTemplate('create-task-answer-input-partial', options)))
      })
    })

    $createTaskTabPreview.on('show.bs.tab', (e) => {
      let md = new MarkdownRenderer()
      let hintsFormatted = getHints().map((hint) => {
        return md.render(hint)
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

      $createCategories.empty()
      _.each(categoryProvider.getCategories(), (category) => {
        $createCategories.append($('<option></option>').attr('value', category.id).text(category.title))
      })

      $createTaskHintList.empty()
      $createTaskAnswerList.empty()

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
        data: {
          hints: getHints(),
          answers: getAnswers()
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

  initEditTaskModal () {
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
    let $editCategories = $('#edit-categories')

    let $editTaskHints = $('#edit-task-hints')
    let $editTaskHintList = $('#edit-task-hint-list')

    let $editTaskAnswers = $('#edit-task-answers')
    let $editTaskAnswerList = $('#edit-task-answer-list')

    let $editTaskPreview = $('#edit-task-preview')

    $editTaskTabData.tab()
    $editTaskTabPreview.tab()

    $editTaskHints.find('a[data-action="create-task-hint"]').on('click', (e) => {
      e.preventDefault()
      let options = {
        number: $editTaskHintList.children().length + 1,
        hint: '',
        editable: true
      }
      $editTaskHintList.append($(renderTemplate('edit-task-hint-textarea-partial', options)))
    })

    function getHints () {
      let hints = []
      $editTaskHintList.find('.themis-task-hint-group[data-state-disabled=false]').each((ndx, el) => {
        let $el = $(el)
        hints.push($el.find('textarea').val())
      })

      return hints
    }

    let savedTaskHints = null

    $editTaskHintList.on('click', 'a[data-action="remove-task-hint"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#edit-task-hint-${number}`).remove()

      let hints = getHints()
      $editTaskHintList.empty()
      _.each(savedTaskHints, (entry, ndx) => {
        $editTaskHintList.append($(renderTemplate('edit-task-hint-textarea-partial', {
          number: ndx + 1,
          editable: false,
          hint: entry.hint
        })))
      })
      _.each(hints, (hint, ndx) => {
        $editTaskHintList.append($(renderTemplate('edit-task-hint-textarea-partial', {
          number: savedTaskHints.length + ndx + 1,
          editable: true,
          hint: hint
        })))
      })
    })

    $editTaskAnswers.find('a[data-action="create-task-answer"]').on('click', (e) => {
      e.preventDefault()
      let options = {
        number: $editTaskAnswerList.children().length + 1,
        editable: true,
        answer: '',
        caseSensitive: true
      }
      $editTaskAnswerList.append($(renderTemplate('edit-task-answer-input-partial', options)))
    })

    function getAnswers () {
      let answers = []
      $editTaskAnswerList.find('.themis-task-answer-group[data-state-disabled=false]').each((ndx, el) => {
        let $el = $(el)
        answers.push({
          answer: $el.find('input[type=text]').val(),
          caseSensitive: $el.find('input[type=checkbox]').prop('checked')
        })
      })

      return answers
    }

    let savedTaskAnswers = null

    $editTaskAnswerList.on('click', 'a[data-action="remove-task-answer"]', (e) => {
      e.preventDefault()
      let number = $(e.target).closest('a').attr('data-number')
      $(`#edit-task-answer-${number}`).remove()
      let answers = getAnswers()
      $editTaskAnswerList.empty()
      _.each(savedTaskAnswers, (entry, ndx) => {
        $editTaskAnswerList.append($(renderTemplate('edit-task-answer-input-partial', {
          number: ndx + 1,
          editable: false,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        })))
      })
      _.each(answers, (entry, ndx) => {
        $editTaskAnswerList.append($(renderTemplate('edit-task-answer-input-partial', {
          number: savedTaskAnswers.length + ndx + 1,
          editable: true,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        })))
      })
    })

    $editTaskTabPreview.on('show.bs.tab', (e) => {
      let md = new MarkdownRenderer()
      let hintsFormatted = savedTaskHints.map((entry) => {
        return entry.hint
      }).concat(getHints()).map((hint) => {
        return md.render(hint)
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

      $editCategories.empty()
      _.each(categoryProvider.getCategories(), (category) => {
        $editCategories.append($('<option></option>').attr('value', category.id).text(category.title))
      })

      $editTaskHintList.empty()
      $editTaskAnswerList.empty()

      $editTaskSubmitError.text('')
      $editTaskForm.parsley().reset()
      $editTaskForm.attr('action', `/api/task/${taskId}/update`)

      $editTaskSubmitButton.prop('disabled', true)

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
          $editTaskSubmitButton.prop('disabled', false)

          $editTaskTitle.val(task.title)
          $editTaskDescription.val(task.description)
          $editTaskValue.val(task.value)

          $editCategories.val(taskCategories.map((taskCategory) => {
            return taskCategory.categoryId
          }))

          $editTaskHintList.empty()
          _.each(taskHints, (entry, ndx) => {
            $editTaskHintList.append($(renderTemplate('edit-task-hint-textarea-partial', {
              number: ndx + 1,
              editable: false,
              hint: entry.hint
            })))
          })

          $editTaskAnswerList.empty()
          _.each(taskAnswers, (entry, ndx) => {
            $editTaskAnswerList.append($(renderTemplate('edit-task-answer-input-partial', {
              number: ndx + 1,
              editable: false,
              answer: entry.answer,
              caseSensitive: entry.caseSensitive
            })))
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
        data: {
          hints: getHints(),
          answers: getAnswers()
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

  initReviseTaskModal () {
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
      $reviseTaskForm.attr('action', `/api/task/${taskId}/revise`)

      $reviseTaskContents.empty()
      $reviseTaskAnswerGroup.show()
      $reviseTaskSubmitButton.show()
      $reviseTaskAnswer.val('')
      $reviseTaskSubmitError.text('')
      $reviseTaskSubmitSuccess.text('')
      $reviseTaskStatus.text('')
      $reviseTaskSubmitButton.prop('disabled', true)

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

          $reviseTaskContents.html(renderTemplate('task-content-partial', options))

          let teamTaskHits = _.where(contestProvider.getTeamTaskHits(), { taskId: task.id })
          let sortedTeamTaskHits = _.sortBy(teamTaskHits, 'createdAt')
          let teamIds = _.map(sortedTeamTaskHits, (entry) => {
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

  initOpenTaskModal () {
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

  initCloseTaskModal () {
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

  initSubmitTaskModal () {
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
          let taskHit = _.findWhere(contestProvider.getTeamTaskHits(), {
            teamId: identity.id,
            taskId: taskId
          })
          if (taskHit) {
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
            $submitTaskSubmitSuccess.text(`Your team has solved the task on ${moment(taskHit.createdAt).format('lll')}!`)
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
        $submitTaskForm.attr('action', `/api/task/${taskId}/check`)
      } else {
        $submitTaskForm.attr('action', `/api/task/${taskId}/submit`)
      }

      $
        .when(
          taskProvider.fetchTask(taskId),
          contestProvider.fetchSolvedTeamCountByTask(taskId),
          taskHintProvider.fetchTaskHintsByTask(taskId)
        )
        .done((task, solvedTeamCount, taskHints) => {
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

  initCheckTaskModal () {
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
      $checkTaskForm.attr('action', `/api/task/${taskId}/check`)

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

  renderCategories () {
    let categories = categoryProvider.getCategories()
    if (categories.length === 0) {
      this.$categoriesList.empty()
      this.$categoriesList.html($('<p></p>').addClass('lead').text('No task categories yet.'))
    } else {
      this.$categoriesList.empty()
      let sortedCategories = _.sortBy(categories, 'createdAt')
      let manageable = (identityProvider.getIdentity().role === 'admin' && !contestProvider.getContest().isFinished())
      for (let category of sortedCategories) {
        let options = {
          id: category.id,
          title: category.title,
          description: category.description,
          updatedAt: moment(category.updatedAt).format('lll'),
          manageable: manageable
        }

        this.$categoriesList.append($(renderTemplate('category-supervisor-partial', options)))
      }
    }
  }

  requestRenderTasks () {
    this.flagRenderTasks = true
  }

  renderTaskPreviews () {
    let taskPreviews = taskProvider.getTaskPreviews()
    if (taskPreviews.length === 0) {
      this.$taskPreviewsList.empty()
      this.$taskPreviewsList.html($('<p></p>').addClass('lead').text('No tasks yet.'))
    } else {
      let identity = identityProvider.getIdentity()
      let solvedTaskIds = []
      if (identity.role === 'team') {
        let taskHits = _.where(contestProvider.getTeamTaskHits(), { teamId: identity.id })
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

  present () {
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
          promise = $.when(taskProvider.fetchTaskPreviews(), categoryProvider.fetchCategories(), taskCategoryProvider.fetchTaskCategories(), contestProvider.fetchTeamTaskHits(), contestProvider.fetchTeamScores())
        } else if (isSupervisor) {
          promise = $.when(taskProvider.fetchTaskPreviews(), categoryProvider.fetchCategories(), taskCategoryProvider.fetchTaskCategories(), contestProvider.fetchTeamTaskHits(), teamProvider.fetchTeams())
        } else {
          promise = $.when(taskProvider.fetchTaskPreviews(), categoryProvider.fetchCategories(), taskCategoryProvider.fetchTaskCategories())
        }

        promise
          .done((taskPreviews, categories) => {
            this.$categoriesSection = $('#themis-categories')
            statusBar.present()

            if (isSupervisor) {
              this.$categoriesSection.html(renderTemplate('categories-view', {
                identity: identity,
                contest: contest
              }))
              this.$categoriesList = $('#themis-categories-list')

              this.renderCategories()
              this.initReviseTaskModal()
            }

            if (isAdmin) {
              this.initCreateCategoryModal()
              this.initEditCategoryModal()
              this.initRemoveCategoryModal()

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

            this.onCreateCategory = (category) => {
              if (isSupervisor) {
                this.renderCategories()
              }
              return false
            }

            this.onCreateTaskCategory = (taskCategory) => {
              this.requestRenderTasks()
              return false
            }

            this.onRemoveTaskCategory = (taskCategoryId) => {
              this.requestRenderTasks()
              return false
            }

            this.onUpdateCategory = (category) => {
              if (isSupervisor) {
                this.renderCategories()
              }

              this.requestRenderTasks()
              return false
            }

            this.onRemoveCategory = (categoryId) => {
              if (isSupervisor) {
                this.renderCategories()
              }

              this.requestRenderTasks()
              return false
            }

            categoryProvider.subscribe()
            categoryProvider.on('createCategory', this.onCreateCategory)
            categoryProvider.on('updateCategory', this.onUpdateCategory)
            categoryProvider.on('removeCategory', this.onRemoveCategory)

            taskProvider.subscribe()
            if (isSupervisor) {
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

            if (isTeam) {
              this.onCreateTeamTaskHit = (teamTaskHit) => {
                this.requestRenderTasks()
                return false
              }

              contestProvider.on('createTeamTaskHit', this.onCreateTeamTaskHit)
            }

            this.onUpdateContest = (contest) => {
              this.renderCategories()
              this.requestRenderTasks()
              return false
            }

            contestProvider.on('updateContest', this.onUpdateContest)

            teamProvider.subscribe()
            taskCategoryProvider.subscribe()
            taskCategoryProvider.on('createTaskCategory', this.onCreateTaskCategory)
            taskCategoryProvider.on('removeTaskCategory', this.onRemoveTaskCategory)

            this.onRenderTasks = (force = false) => {
              if ((this.flagRenderTasks || force) && !this.flagRenderingTasks) {
                this.flagRenderingTasks = true
                this.renderTaskPreviews()
                this.flagRenderingTasks = false
                this.flagRenderTasks = false
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
    }

    if (this.onCreateCategory) {
      categoryProvider.off('createCategory', this.onCreateCategory)
      this.onCreateCategory = null
    }

    if (this.onUpdateCategory) {
      categoryProvider.off('updateCategory', this.onUpdateCategory)
      this.onUpdateCategory = null
    }

    if (this.onRemoveCategory) {
      categoryProvider.off('removeCategory', this.onRemoveCategory)
      this.onRemoveCategory = null
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

    if (this.onRemoveTaskCategory) {
      taskCategoryProvider.off('removeTaskCategory', this.onRemoveTaskCategory)
      this.onRemoveTaskCategory = null
    }

    taskCategoryProvider.unsubscribe()

    window.clearInterval(this.renderTasksInterval)
    this.onRenderTasks = null
    this.flagRenderTasks = false
    this.flagRenderingTasks = false

    this.$main.empty()
    this.$main = null
    this.$categoriesSection = null
    this.$categoriesList = null
    this.$taskPreviewsList = null
    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new TasksView()
