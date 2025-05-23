import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import dataStore from '../data-store'
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
import 'tempusdominius-bootstrap-4'
import 'bootstrap-select'

import ClipboardJS from 'clipboard'

import remoteCheckerProvider from '../providers/remote-checker'
import taskRemoteCheckerProvider from '../providers/task-remote-checker'

import taskValueProvider from '../providers/task-value'
import taskRewardSchemeProvider from '../providers/task-reward-scheme'

import taskFileProvider from '../providers/task-file'

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

    this.onCreateTaskValue = null
    this.onUpdateTaskValue = null
    this.onRevealTaskValue = null

    this.onCreateTaskRewardScheme = null
    this.onUpdateTaskRewardScheme = null
    this.onRevealTaskRewardScheme = null

    this.flagRenderTasks = false
    this.flagRenderingTasks = false
    this.renderTasksInterval = null
    this.onRenderTasks = null
  }

  initCreateTaskFromGitHubModal () {
    const $modal = $('#create-task-from-github-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $submitSuccess = $modal.find('.submit-success > p')
    const $submitButton = $modal.find('button[data-action="complete-create-task-from-github"]')
    const $form = $modal.find('form')
    const $repositorySelect = $('#create-task-from-github-repository')

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    $modal.on('show.bs.modal', (e) => {
      $submitError.text('')
      $submitSuccess.text('')
      $submitButton.show()
      $submitButton.prop('disabled', true)
      $repositorySelect.selectpicker('destroy')
      $repositorySelect.empty()
      $repositorySelect.prop('disabled', true)
    })

    $modal.on('shown.bs.modal', (e) => {
      $.ajax({
        url: '/api/task/github-repository/index',
        type: 'GET',
        dataType: 'json',
        success: (responseJSON, textStatus, jqXHR) => {
          _.each(responseJSON, (repository) => {
            $repositorySelect.append($('<option></option>').attr('value', repository).text(repository))
          })
          $repositorySelect.prop('disabled', false)
          $repositorySelect.focus()
          $repositorySelect.selectpicker()
          $submitButton.prop('disabled', false)
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            $submitError.text('Unknown error. Please try again later.')
          }
        }
      })
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
        success: (responseJSON, textStatus, jqXHR) => {
          $submitButton.hide()
          $submitSuccess.text('Created the task')
          const closeModal = () => {
            $modal.modal('hide')
          }
          setTimeout(closeModal, 1000)
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

  initCreateTaskFromGitFlicModal () {
    const $modal = $('#create-task-from-gitflic-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $submitSuccess = $modal.find('.submit-success > p')
    const $submitButton = $modal.find('button[data-action="complete-create-task-from-gitflic"]')
    const $form = $modal.find('form')
    const $repositorySelect = $('#create-task-from-gitflic-repository')

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    $modal.on('show.bs.modal', (e) => {
      $submitError.text('')
      $submitSuccess.text('')
      $submitButton.show()
      $submitButton.prop('disabled', true)
      $repositorySelect.selectpicker('destroy')
      $repositorySelect.empty()
      $repositorySelect.prop('disabled', true)
    })

    $modal.on('shown.bs.modal', (e) => {
      $.ajax({
        url: '/api/task/gitflic-repository/index',
        type: 'GET',
        dataType: 'json',
        success: (responseJSON, textStatus, jqXHR) => {
          _.each(responseJSON, (repository) => {
            $repositorySelect.append($('<option></option>').attr('value', repository).text(repository))
          })
          $repositorySelect.prop('disabled', false)
          $repositorySelect.focus()
          $repositorySelect.selectpicker()
          $submitButton.prop('disabled', false)
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            $submitError.text('Unknown error. Please try again later.')
          }
        }
      })
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
        success: (responseJSON, textStatus, jqXHR) => {
          $submitButton.hide()
          $submitSuccess.text('Created the task')
          const closeModal = () => {
            $modal.modal('hide')
          }
          setTimeout(closeModal, 1000)
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

  initSubscribeTaskModal () {
    const $modal = $('#subscribe-task-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $submitSuccess = $modal.find('.submit-success > p')
    const $submitButton = $modal.find('button[data-action="complete-subscribe-task"]')
    const $form = $modal.find('form')

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    $modal.on('show.bs.modal', (e) => {
      const taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $modal.data('task-id', taskId)
      $('#subscribe-task-email').val(identityProvider.getIdentity().email)
      $submitError.text('')
      $submitSuccess.text('')
      $submitButton.show()
    })

    $modal.on('shown.bs.modal', (e) => {
      $('#subscribe-task-email').focus()
    })

    $form.on('submit', (e) => {
      e.preventDefault()
      const taskId = $modal.data('task-id')
      const url = `/api/task/${taskId}/subscribe`

      $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: {},
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseJSON, textStatus, jqXHR) => {
          $submitButton.hide()
          $submitSuccess.text('Subscribed to new reviews')
          const reloadPage = () => {
            window.location.reload()
          }
          setTimeout(reloadPage, 1000)
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

  initUnsubscribeTaskModal () {
    const $modal = $('#unsubscribe-task-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $submitSuccess = $modal.find('.submit-success > p')
    const $submitButton = $modal.find('button[data-action="complete-unsubscribe-task"]')
    const $form = $modal.find('form')

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    $modal.on('show.bs.modal', (e) => {
      const taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $modal.data('task-id', taskId)
      $('#unsubscribe-task-email').val(identityProvider.getIdentity().email)
      $submitError.text('')
      $submitSuccess.text('')
      $submitButton.show()
    })

    $modal.on('shown.bs.modal', (e) => {
      $('#unsubscribe-task-email').focus()
    })

    $form.on('submit', (e) => {
      e.preventDefault()
      const taskId = $modal.data('task-id')
      const url = `/api/task/${taskId}/unsubscribe`

      $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: {},
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseJSON, textStatus, jqXHR) => {
          $submitButton.hide()
          $submitSuccess.text('Unsubscribed from new reviews')
          const reloadPage = () => {
            window.location.reload()
          }
          setTimeout(reloadPage, 1000)
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

  initManageTaskFilesModal () {
    const $modal = $('#manage-task-files-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $submitSuccess = $modal.find('.submit-success > p')
    const $submitButton = $modal.find('button[data-action="upload-file"]')
    const $form = $modal.find('form')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

    const $fileInput = $('#manage-task-files-file')
    const $nameInput = $('#manage-task-files-name')

    const $progressControl = $('#manage-task-files-progress')

    const $uploadedContainer = $('#manage-task-files-uploaded')

    let clipboard = null

    const updateProgressControl = function (value) {
      $progressControl.css('width', `${value}%`)
      $progressControl.attr('aria-valuenow', value)
    }

    $('input[type="file"]', $form).change(function () {
      let fieldVal = $(this).val()

      fieldVal = fieldVal.replace('C:\\fakepath\\', '')

      if (typeof fieldVal !== 'undefined' || fieldVal !== '') {
        $(this).next('.custom-file-label').attr('data-content', fieldVal)
        $(this).next('.custom-file-label').text(fieldVal)
        $nameInput.val(fieldVal)
      } else {
        $(this).next('.custom-file-label').attr('data-content', '')
        $(this).next('.custom-file-label').text('Choose file')
      }
    })

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    const reloadUploadedList = function () {
      const taskId = $modal.data('task-id')
      $uploadedContainer.find('[data-action="copy-to-clipboard"]').tooltip('dispose')
      if (!_.isNull(clipboard)) {
        clipboard.destroy()
      }
      $
        .when(
          taskFileProvider.fetchTaskFilesByTask(taskId)
        )
        .done(function (taskFiles) {
          $uploadedContainer.html(window.volgactf.qualifier.templates.taskFileList({
            window: window,
            _: _,
            moment: moment,
            taskFiles: taskFiles,
            templates: window.volgactf.qualifier.templates
          }))
          $uploadedContainer.find('[data-action="copy-to-clipboard"]').tooltip({
            trigger: 'manual'
          })
          clipboard = new ClipboardJS('#manage-task-files-uploaded [data-action="copy-to-clipboard"]', {
            container: $modal[0]
          })
          clipboard.on('success', function (e) {
            const $btn = $(e.trigger)
            $btn.tooltip('show')
            setTimeout(function () {
              $btn.tooltip('hide')
            }, 1000)
          })
        })
    }

    const reinitializeForm = function () {
      $fileInput.val('')
      $fileInput.trigger('change')
      $nameInput.val('')
      updateProgressControl(0)

      $submitError.text('')
      $form.parsley().reset()
      $submitButton.prop('disabled', false)

      reloadUploadedList()
    }

    $modal.on('dblclick', '[data-action="delete-task-file"]', function (e) {
      const taskId = $modal.data('task-id')
      const taskFileId = parseInt($(this).attr('data-task-file-id'), 10)
      const $btn = $(this)
      $btn.prop('disabled', true)

      $
        .when(
          taskFileProvider.deleteTaskFile(taskId, taskFileId, identityProvider.getIdentity().token)
        )
        .done(() => {
          setTimeout(function () {
            reloadUploadedList()
          }, 1000)
        })
        .fail((err) => {
          console.log(err)
          $btn.prop('disabled', false)
        })
    })

    $modal.on('show.bs.modal', (e) => {
      const taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $modal.data('task-id', taskId)
      $form.attr('action', `/api/task/${taskId}/file/create`)
      reinitializeForm()
    })

    $modal.on('shown.bs.modal', (e) => {
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
          $submitSuccess.text('Uploaded!')
          setTimeout(function () {
            $submitSuccess.text('')
            reinitializeForm()
          }, 1500)
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            if (jqXHR.status === 413) {
              $submitError.text('Task file size must not exceed 100 Mb.')
            } else {
              $submitError.text('Unknown error. Please try again later.')
            }
          }
        },
        uploadProgress: (e, position, total, percentComplete) => {
          updateProgressControl(percentComplete)
        },
        complete: () => {
          $submitButton.prop('disabled', false)
        }
      })
    })
  }

  initCreateTaskModal () {
    const $modal = $('#create-task-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $submitButton = $modal.find('button[data-action="complete-create-task"]')
    const $form = $modal.find('form')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element
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

    const $tabList = $('#create-task-tablist')
    const $tabData = $tabList.find('a[href="#create-task-data"]')
    const $tabPreview = $tabList.find('a[href="#create-task-preview"]')

    const $taskTitle = $('#create-task-title')
    const $taskDescription = $('#create-task-description')
    const $categories = $('#create-categories')

    const $openAt = $('#create-open-at')

    const $taskHints = $('#create-task-hints')
    const $taskHintList = $('#create-task-hint-list')

    const $taskRewardScheme = $('#create-task-reward-scheme')
    const $taskRewardSchemeFixed = $('#create-task-reward-scheme-fixed')
    const $taskRewardSchemeVariable = $('#create-task-reward-scheme-variable')
    const $taskRewardSchemeDynlog = $('#create-task-reward-scheme-dynlog')
    const $taskRewardSchemeGroup = $('#create-task-reward-scheme-group')

    const $taskCheckMethod = $('#create-task-check-method')
    const $taskCheckMethodList = $('#create-task-check-method-list')
    const $taskCheckMethodRemote = $('#create-task-check-method-remote')
    const $taskCheckMethodGroup = $('#create-task-check-method-group')

    const $taskPreview = $('#create-task-preview')

    $tabData.tab()
    $tabPreview.tab()

    const pickerFormat = 'D MMM YYYY [at] HH:mm'

    const icons = {
      time: 'oi oi-clock',
      date: 'oi oi-calendar',
      up: 'oi oi-chevron-top',
      down: 'oi oi-chevron-bottom',
      previous: 'oi oi-chevron-left',
      next: 'oi oi-chevron-right',
      today: 'oi oi-check',
      clear: 'oi oi-trash',
      close: 'oi oi-x'
    }

    $openAt.datetimepicker({
      showClose: true,
      sideBySide: true,
      format: pickerFormat,
      icons: icons
    })

    $('#create-open-at-clear').on('click', (e) => {
      $openAt.datetimepicker('clear')
    })

    $taskHints.on('click', 'a[data-action="create-task-hint"]', (e) => {
      e.preventDefault()
      $taskHintList.append(window.volgactf.qualifier.templates.createTaskHintTextareaPartial({
        _: _,
        number: $taskHintList.children().length + 1,
        hint: ''
      }))
    })

    $taskHintList.on('click', 'a[data-action="remove-task-hint"]', (e) => {
      e.preventDefault()
      const number = $(e.target).closest('a').attr('data-number')
      $(`#create-task-hint-${number}`).remove()
      const hints = getHints()
      $taskHintList.empty()
      _.each(hints, (hint, ndx) => {
        $taskHintList.append(window.volgactf.qualifier.templates.createTaskHintTextareaPartial({
          _: _,
          number: ndx + 1,
          hint: hint
        }))
      })
    })

    function getHints () {
      const hints = []
      $taskHintList.find('.volgactf-task-hint-group').each((ndx, el) => {
        const $el = $(el)
        hints.push($el.find('textarea').val())
      })

      return hints
    }

    $taskCheckMethodGroup.on('click', 'a[data-action="create-task-answer"]', (e) => {
      e.preventDefault()
      const $taskAnswerList = $('#create-task-answer-list')
      $taskAnswerList.append(window.volgactf.qualifier.templates.createTaskAnswerInputPartial({
        _: _,
        number: $taskAnswerList.children().length + 1,
        answer: '',
        caseSensitive: true
      }))
    })

    $taskCheckMethodGroup.on('click', 'a[data-action="remove-task-answer"]', (e) => {
      e.preventDefault()
      const $taskAnswerList = $('#create-task-answer-list')
      const number = $(e.target).closest('a').attr('data-number')
      $(`#create-task-answer-${number}`).remove()
      const answers = getAnswers()
      $taskAnswerList.empty()
      _.each(answers, (entry, ndx) => {
        $taskAnswerList.append(window.volgactf.qualifier.templates.createTaskAnswerInputPartial({
          _: _,
          number: ndx + 1,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        }))
      })
    })

    function getAnswers () {
      const answers = []
      const $taskAnswerList = $('#create-task-answer-list')
      $taskAnswerList.find('.volgactf-task-answer-group').each((ndx, el) => {
        const $el = $(el)
        answers.push({
          answer: $el.find('input[type=text]').val(),
          caseSensitive: $el.find('input[type=checkbox]').prop('checked')
        })
      })

      return answers
    }

    $tabPreview.on('show.bs.tab', (e) => {
      const md = new MarkdownRenderer()

      $taskPreview.html(window.volgactf.qualifier.templates.taskContentPartial({
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
      $taskCheckMethodGroup.html(window.volgactf.qualifier.templates.createTaskCheckMethodPartial({
        checkMethod: method
      }))
      if (method === 'remote') {
        const $taskRemoteChecker = $('#create-task-remote-checker')
        _.each(remoteCheckerProvider.getRemoteCheckers(), (remoteChecker) => {
          $taskRemoteChecker
            .append(
              $('<option></option>')
                .attr('value', remoteChecker.id)
                .prop('disabled', _.where(taskRemoteCheckerProvider.getTaskRemoteCheckers(), { remoteCheckerId: remoteChecker.id }).length > 0)
                .text(remoteChecker.name)
            )
        })
      }
    })

    function getReward () {
      const scheme = $('input[type="radio"]:checked', $taskRewardScheme).val()
      if (scheme === 'fixed') {
        return {
          maxValue: $('#create-task-reward-scheme-fixed-value').val(),
          minValue: null,
          subtractPoints: null,
          subtractHitCount: null
        }
      } else if (scheme === 'variable') {
        return {
          maxValue: $('#create-task-reward-scheme-variable-max-value').val(),
          minValue: $('#create-task-reward-scheme-variable-min-value').val(),
          subtractPoints: $('#create-task-reward-scheme-variable-subtract-points').val(),
          subtractHitCount: $('#create-task-reward-scheme-variable-subtract-hit-count').val()
        }
      } else {
        return null
      }
    }

    $taskRewardScheme.on('change', () => {
      const scheme = $('input[type="radio"]:checked', $taskRewardScheme).val()
      $taskRewardSchemeGroup.html(window.volgactf.qualifier.templates.createTaskRewardSchemePartial({
        _: _,
        rewardScheme: scheme,
        taskMinValue: window.volgactf.qualifier.data.taskMinValue,
        taskMaxValue: window.volgactf.qualifier.data.taskMaxValue,
        scoringDynlogMin: window.volgactf.qualifier.data.scoringDynlogMin,
        scoringDynlogMax: window.volgactf.qualifier.data.scoringDynlogMax,
        scoringDynlogK: window.volgactf.qualifier.data.scoringDynlogK,
        scoringDynlogV: window.volgactf.qualifier.data.scoringDynlogV
      }))
    })

    $modal.on('show.bs.modal', (e) => {
      $tabData.tab('show')
      $taskTitle.val('')
      $taskDescription.val('')
      $openAt.datetimepicker('clear')

      $categories.empty()
      _.each(categoryProvider.getCategories(), (category) => {
        $categories.append($('<option></option>').attr('value', category.id).text(category.title))
      })

      $taskHintList.empty()

      $taskCheckMethodList.prop('checked', true)
      $taskCheckMethodRemote.prop('checked', false)
      $taskCheckMethodGroup.html(window.volgactf.qualifier.templates.createTaskCheckMethodPartial({
        checkMethod: 'list'
      }))

      $taskRewardSchemeFixed.prop('checked', true)
      $taskRewardSchemeVariable.prop('checked', false)
      $taskRewardSchemeDynlog.prop('checked', false)
      $taskRewardSchemeGroup.html(window.volgactf.qualifier.templates.createTaskRewardSchemePartial({
        _: _,
        rewardScheme: 'fixed',
        taskMinValue: window.volgactf.qualifier.data.taskMinValue,
        taskMaxValue: window.volgactf.qualifier.data.taskMaxValue
      }))

      $submitError.text('')
      $form.parsley().reset()
    })

    $modal.on('shown.bs.modal', (e) => {
      $taskTitle.focus()
    })

    $form.on('submit', (e) => {
      e.preventDefault()
      const valOpenAt = $openAt.datetimepicker('date')
      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        data: {
          hints: getHints(),
          answers: getAnswers(),
          reward: getReward(),
          openAt: (valOpenAt) ? valOpenAt.seconds(0).milliseconds(0).valueOf() : null
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
    const $modal = $('#edit-task-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $submitButton = $modal.find('button[data-action="complete-edit-task"]')
    const $form = $modal.find('form')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element
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

    const $tabList = $('#edit-task-tablist')
    const $tabData = $tabList.find('a[href="#edit-task-data"]')
    const $tabFiles = $tabList.find('a[href="#edit-task-files"]')
    const $tabPreview = $tabList.find('a[href="#edit-task-preview"]')

    const $taskTitle = $('#edit-task-title')
    const $taskDescription = $('#edit-task-description')
    const $categories = $('#edit-categories')

    const $openAt = $('#edit-open-at')

    const $taskRewardScheme = $('#edit-task-reward-scheme')
    const $taskRewardSchemeFixed = $('#edit-task-reward-scheme-fixed')
    const $taskRewardSchemeVariable = $('#edit-task-reward-scheme-variable')
    const $taskRewardSchemeDynlog = $('#edit-task-reward-scheme-dynlog')
    const $taskRewardSchemeGroup = $('#edit-task-reward-scheme-group')

    const $taskHints = $('#edit-task-hints')
    const $taskHintList = $('#edit-task-hint-list')

    const $taskCheckMethodList = $('#edit-task-check-method-list')
    const $taskCheckMethodRemote = $('#edit-task-check-method-remote')
    const $taskCheckMethodGroup = $('#edit-task-check-method-group')

    const $taskPreview = $('#edit-task-preview')

    const $tabFileContainer = $('#edit-task-files')
    let clipboard = null

    $tabData.tab()
    $tabFiles.tab()
    $tabPreview.tab()

    const pickerFormat = 'D MMM YYYY [at] HH:mm'

    const icons = {
      time: 'oi oi-clock',
      date: 'oi oi-calendar',
      up: 'oi oi-chevron-top',
      down: 'oi oi-chevron-bottom',
      previous: 'oi oi-chevron-left',
      next: 'oi oi-chevron-right',
      today: 'oi oi-check',
      clear: 'oi oi-trash',
      close: 'oi oi-x'
    }

    $openAt.datetimepicker({
      showClose: true,
      sideBySide: true,
      format: pickerFormat,
      icons: icons
    })

    $('#edit-open-at-clear').on('click', (e) => {
      if (!$openAt.find('input').prop('disabled')) {
        $openAt.datetimepicker('clear')
      }
    })

    $taskHints.on('click', 'a[data-action="create-task-hint"]', (e) => {
      e.preventDefault()
      $taskHintList.append(window.volgactf.qualifier.templates.editTaskHintTextareaPartial({
        _: _,
        number: $taskHintList.children().length + 1,
        hint: '',
        editable: true
      }))
    })

    $taskHintList.on('click', 'a[data-action="remove-task-hint"]', (e) => {
      e.preventDefault()
      const number = $(e.target).closest('a').attr('data-number')
      $(`#edit-task-hint-${number}`).remove()

      const hints = getHints()
      $taskHintList.empty()
      _.each(savedTaskHints, (entry, ndx) => {
        $taskHintList.append(window.volgactf.qualifier.templates.editTaskHintTextareaPartial({
          _: _,
          number: ndx + 1,
          editable: false,
          hint: entry.hint
        }))
      })
      _.each(hints, (hint, ndx) => {
        $taskHintList.append(window.volgactf.qualifier.templates.editTaskHintTextareaPartial({
          _: _,
          number: savedTaskHints.length + ndx + 1,
          editable: true,
          hint: hint
        }))
      })
    })

    function getHints () {
      const hints = []
      $taskHintList.find('.volgactf-task-hint-group[data-state-disabled=false]').each((ndx, el) => {
        const $el = $(el)
        hints.push($el.find('textarea').val())
      })

      return hints
    }

    let savedTaskHints = null

    $taskCheckMethodGroup.on('click', 'a[data-action="create-task-answer"]', (e) => {
      e.preventDefault()
      const $taskAnswerList = $('#edit-task-answer-list')
      $taskAnswerList.append(window.volgactf.qualifier.templates.editTaskAnswerInputPartial({
        _: _,
        number: $taskAnswerList.children().length + 1,
        editable: true,
        answer: '',
        caseSensitive: true
      }))
    })

    $taskCheckMethodGroup.on('click', 'a[data-action="remove-task-answer"]', (e) => {
      e.preventDefault()
      const number = $(e.target).closest('a').attr('data-number')
      $(`#edit-task-answer-${number}`).remove()
      const answers = getAnswers()
      const $taskAnswerList = $('#edit-task-answer-list')
      $taskAnswerList.empty()
      _.each(savedTaskAnswers, (entry, ndx) => {
        $taskAnswerList.append(window.volgactf.qualifier.templates.editTaskAnswerInputPartial({
          _: _,
          number: ndx + 1,
          editable: false,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        }))
      })
      _.each(answers, (entry, ndx) => {
        $taskAnswerList.append(window.volgactf.qualifier.templates.editTaskAnswerInputPartial({
          _: _,
          number: savedTaskAnswers.length + ndx + 1,
          editable: true,
          answer: entry.answer,
          caseSensitive: entry.caseSensitive
        }))
      })
    })

    function getAnswers () {
      const answers = []
      const $taskAnswerList = $('#edit-task-answer-list')
      $taskAnswerList.find('.volgactf-task-answer-group[data-state-disabled=false]').each((ndx, el) => {
        const $el = $(el)
        answers.push({
          answer: $el.find('input[type=text]').val(),
          caseSensitive: $el.find('input[type=checkbox]').prop('checked')
        })
      })

      return answers
    }

    let savedTaskAnswers = null

    $tabPreview.on('show.bs.tab', (e) => {
      const md = new MarkdownRenderer()
      const hintsFormatted = savedTaskHints.map((entry) => {
        return entry.hint
      }).concat(getHints()).map((hint) => {
        return md.render(hint)
      })

      $taskPreview.html(window.volgactf.qualifier.templates.taskContentPartial({
        _: _,
        title: $taskTitle.val(),
        description: md.render($taskDescription.val()),
        hints: hintsFormatted
      }))
    })

    function getReward () {
      const scheme = $('input[type="radio"]:checked', $taskRewardScheme).val()
      if (scheme === 'fixed') {
        return {
          maxValue: $('#edit-task-reward-scheme-fixed-value').val(),
          minValue: null,
          subtractPoints: null,
          subtractHitCount: null
        }
      } else if (scheme === 'variable') {
        return {
          maxValue: $('#edit-task-reward-scheme-variable-max-value').val(),
          minValue: $('#edit-task-reward-scheme-variable-min-value').val(),
          subtractPoints: $('#edit-task-reward-scheme-variable-subtract-points').val(),
          subtractHitCount: $('#edit-task-reward-scheme-variable-subtract-hit-count').val()
        }
      } else if (scheme === 'dynlog') {
        return {
          maxValue: $('#edit-task-reward-scheme-dynlog-max-value').val(),
          minValue: $('#edit-task-reward-scheme-dynlog-min-value').val()
        }
      } else {
        return null
      }
    }

    $taskRewardScheme.on('change', () => {
      const scheme = $('input[type="radio"]:checked', $taskRewardScheme).val()
      const taskId = $modal.data('task-id')
      const taskRewardScheme = _.findWhere(taskRewardSchemeProvider.getTaskRewardSchemes(), { taskId: taskId })
      $taskRewardSchemeGroup.html(window.volgactf.qualifier.templates.editTaskRewardSchemePartial({
        _: _,
        rewardScheme: scheme,
        taskRewardScheme: taskRewardScheme,
        taskMinValue: window.volgactf.qualifier.data.taskMinValue,
        taskMaxValue: window.volgactf.qualifier.data.taskMaxValue,
        scoringDynlogMin: window.volgactf.qualifier.data.scoringDynlogMin,
        scoringDynlogMax: window.volgactf.qualifier.data.scoringDynlogMax,
        scoringDynlogK: window.volgactf.qualifier.data.scoringDynlogK,
        scoringDynlogV: window.volgactf.qualifier.data.scoringDynlogV
      }))
    })

    const reloadFileList = function (taskFiles) {
      $tabFileContainer.find('[data-action="copy-to-clipboard"]').tooltip('dispose')
      if (!_.isNull(clipboard)) {
        clipboard.destroy()
      }
      $tabFileContainer.html(window.volgactf.qualifier.templates.taskFileListCompact({
        window: window,
        _: _,
        moment: moment,
        taskFiles: taskFiles,
        templates: window.volgactf.qualifier.templates
      }))
      $tabFileContainer.find('[data-action="copy-to-clipboard"]').tooltip({
        trigger: 'manual'
      })
      clipboard = new ClipboardJS('#edit-task-files [data-action="copy-to-clipboard"]', {
        container: $modal[0]
      })
      clipboard.on('success', function (e) {
        const $btn = $(e.trigger)
        $btn.tooltip('show')
        setTimeout(function () {
          $btn.tooltip('hide')
        }, 1000)
      })
    }

    $modal.on('show.bs.modal', (e) => {
      const taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $modal.data('task-id', taskId)

      $tabData.tab('show')
      $taskTitle.val('')
      $taskDescription.val('')
      $openAt.datetimepicker('clear')

      $categories.empty()
      _.each(categoryProvider.getCategories(), (category) => {
        $categories.append($('<option></option>').attr('value', category.id).text(category.title))
      })

      const taskRewardScheme = _.findWhere(taskRewardSchemeProvider.getTaskRewardSchemes(), { taskId: taskId })
      let rewardScheme = 'fixed'
      if (taskRewardScheme && !_.isNull(taskRewardScheme.minValue) && !_.isNull(taskRewardScheme.subtractHitCount) && !_.isNull(taskRewardScheme.subtractPoints)) {
        rewardScheme = 'variable'
      }
      if (taskRewardScheme && !_.isNull(taskRewardScheme.minValue) && !_.isNull(taskRewardScheme.dynlogK) && !_.isNull(taskRewardScheme.dynlogV)) {
        rewardScheme = 'dynlog'
      }

      $taskRewardSchemeFixed.prop('checked', rewardScheme === 'fixed')
      $taskRewardSchemeVariable.prop('checked', rewardScheme === 'variable')
      $taskRewardSchemeDynlog.prop('checked', rewardScheme === 'dynlog')
      $taskRewardSchemeGroup.html(window.volgactf.qualifier.templates.editTaskRewardSchemePartial({
        _: _,
        rewardScheme: rewardScheme,
        taskRewardScheme: taskRewardScheme,
        taskMinValue: window.volgactf.qualifier.data.taskMinValue,
        taskMaxValue: window.volgactf.qualifier.data.taskMaxValue,
        scoringDynlogMin: window.volgactf.qualifier.data.scoringDynlogMin,
        scoringDynlogMax: window.volgactf.qualifier.data.scoringDynlogMax,
        scoringDynlogK: window.volgactf.qualifier.data.scoringDynlogK,
        scoringDynlogV: window.volgactf.qualifier.data.scoringDynlogV
      }))

      $taskHintList.empty()
      $taskCheckMethodGroup.empty()

      let checkMethod = 'list'
      if (_.where(taskRemoteCheckerProvider.getTaskRemoteCheckers(), { taskId: taskId }).length > 0) {
        checkMethod = 'remote'
      }

      $taskCheckMethodList.prop('checked', checkMethod === 'list')
      $taskCheckMethodRemote.prop('checked', checkMethod === 'remote')
      $taskCheckMethodGroup.html(window.volgactf.qualifier.templates.editTaskCheckMethodPartial({
        checkMethod: checkMethod
      }))

      $submitError.text('')
      $form.parsley().reset()
      $form.attr('action', `/api/task/${taskId}/update`)

      $submitButton.prop('disabled', true)

      $
        .when(
          taskProvider.fetchTask(taskId),
          taskCategoryProvider.fetchTaskCategoriesByTask(taskId),
          taskAnswerProvider.fetchTaskAnswersByTask(taskId),
          taskHintProvider.fetchTaskHintsByTask(taskId),
          taskFileProvider.fetchTaskFilesByTask(taskId)
        )
        .done((task, taskCategories, taskAnswers, taskHints, taskFiles) => {
          savedTaskAnswers = taskAnswers
          savedTaskHints = taskHints
          $submitButton.prop('disabled', false)

          $taskTitle.val(task.title)
          $taskDescription.val(task.description)
          $openAt.datetimepicker('date', task.openAt)
          $openAt.datetimepicker((task.state === 1) ? 'enable' : 'disable')

          $categories.val(taskCategories.map((taskCategory) => {
            return taskCategory.categoryId
          }))

          $taskHintList.empty()
          _.each(taskHints, (entry, ndx) => {
            $taskHintList.append(window.volgactf.qualifier.templates.editTaskHintTextareaPartial({
              _: _,
              number: ndx + 1,
              editable: false,
              hint: entry.hint
            }))
          })

          let checkMethod = 'list'
          if (_.where(taskRemoteCheckerProvider.getTaskRemoteCheckers(), { taskId: taskId }).length > 0) {
            checkMethod = 'remote'
          }

          if (checkMethod === 'list') {
            const $taskAnswerList = $('#edit-task-answer-list')
            _.each(taskAnswers, (entry, ndx) => {
              $taskAnswerList.append(window.volgactf.qualifier.templates.editTaskAnswerInputPartial({
                _: _,
                number: ndx + 1,
                editable: false,
                answer: entry.answer,
                caseSensitive: entry.caseSensitive
              }))
            })
          } else if (checkMethod === 'remote') {
            const $taskRemoteChecker = $('#edit-task-remote-checker')
            $taskRemoteChecker.empty()
            _.each(remoteCheckerProvider.getRemoteCheckers(), (remoteChecker) => {
              $taskRemoteChecker.append(
                $('<option></option>')
                  .attr('value', remoteChecker.id)
                  .prop('selected', _.where(taskRemoteCheckerProvider.getTaskRemoteCheckers(), { taskId: taskId, remoteCheckerId: remoteChecker.id }).length > 0)
                  .text(remoteChecker.name)
              )
            })
          }

          reloadFileList(taskFiles)
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
      const valOpenAt = $openAt.datetimepicker('date')

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
          answers: getAnswers(),
          reward: getReward(),
          openAt: (valOpenAt) ? valOpenAt.seconds(0).milliseconds(0).valueOf() : null
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
    const $modal = $('#revise-task-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $submitSuccess = $modal.find('.submit-success > p')
    const $taskStatus = $modal.find('#revise-task-status')
    const $submitButton = $modal.find('button[data-action="complete-revise-task"]')
    const $form = $modal.find('form')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element
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

    const $taskAnswerGroup = $('#revise-task-answer-group')
    const $taskAnswer = $('#revise-task-answer')
    const $taskContents = $modal.find('.volgactf-task-contents')

    $modal.on('show.bs.modal', (e) => {
      const taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
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
          const md = new MarkdownRenderer()

          $taskContents.html(window.volgactf.qualifier.templates.taskContentPartial({
            _: _,
            title: task.title,
            description: md.render(task.description),
            hints: _.map(taskHints, (taskHint) => {
              return md.render(taskHint.hint)
            })
          }))

          $taskStatus.html(window.volgactf.qualifier.templates.reviseTaskStatusPartial({
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
          const hideModal = () => {
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
    const $modal = $('#open-task-modal')
    $modal.modal({ show: false })

    const $modalBody = $modal.find('.modal-body p.confirmation')
    const $submitError = $modal.find('.submit-error > p')
    const $submitButton = $modal.find('button[data-action="complete-open-task"]')

    $modal.on('show.bs.modal', (e) => {
      const taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $modal.data('task-id', taskId)
      const taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      const msgTemplate = _.template('You are about to open the task <mark><%- title %></mark>. Teams will be able to submit answers for the task. Continue?')
      $modalBody.html(msgTemplate({ title: taskPreview.title }))
      $submitError.text('')
    })

    $submitButton.on('click', (e) => {
      const taskId = $modal.data('task-id')
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
    const $modal = $('#close-task-modal')
    $modal.modal({ show: false })

    const $modalBody = $modal.find('.modal-body p.confirmation')
    const $submitError = $modal.find('.submit-error > p')
    const $submitButton = $modal.find('button[data-action="complete-close-task"]')

    $modal.on('show.bs.modal', (e) => {
      const taskId = parseInt($(e.relatedTarget).data('task-id'), 10)
      $modal.data('task-id', taskId)
      const taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      const msgTemplate = _.template('You are about to close the task <mark><%- title %></mark>. Teams will not be able to submit answers for the task although the scores will not be recalculated. Continue?')
      $modalBody.html(msgTemplate({ title: taskPreview.title }))
      $submitError.text('')
    })

    $submitButton.on('click', (e) => {
      const taskId = $modal.data('task-id')
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
    const $modal = $('#submit-task-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $taskInfo = $modal.find('.submit-info > p')
    const $submitSuccess = $modal.find('.submit-success > p')
    const $submitButton = $modal.find('button[data-action="complete-submit-task"]')
    const $submitForm = $modal.find('form[data-target="submit"]')
    $submitForm.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element
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

    const $submitFieldGroup = $('#submit-task-field-group')
    const $taskAnswer = $('#submit-task-answer')
    const $taskContents = $modal.find('.volgactf-task-contents')

    const $reviewButton = $modal.find('button[data-action="complete-review-task"]')
    const $reviewForm = $modal.find('form[data-target="review"]')
    $reviewForm.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })
    const $reviewError = $modal.find('.review-error > p')
    const $reviewSuccess = $modal.find('.review-success > p')

    const $reviewFieldGroup = $modal.find('#review-task-field-group')
    const $reviewRating = $modal.find('#review-task-rating')
    const $reviewComment = $modal.find('#review-task-comment')

    $reviewButton.on('click', (e) => {
      $reviewForm.trigger('submit')
    })

    $modal.on('show.bs.modal', (e) => {
      const taskId = parseInt($(e.relatedTarget).data('task-id'), 10)

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

      const taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      const identity = identityProvider.getIdentity()
      const contest = contestProvider.getContest()
      let taskSolvedAt = null
      let teamTaskReview = null
      let onlyReview = false

      $reviewFieldGroup.hide()
      $reviewButton.hide()

      if (taskPreview && identity.isTeam()) {
        const taskHit = _.findWhere(teamTaskHitProvider.getTeamTaskHits(), {
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
          const md = new MarkdownRenderer()
          const hintsFormatted = []
          _.each(taskHints, (entry) => {
            hintsFormatted.push(md.render(entry.hint))
          })
          $taskContents.html(window.volgactf.qualifier.templates.taskContentPartial({
            _: _,
            title: task.title,
            description: md.render(task.description),
            hints: hintsFormatted
          }))

          teamTaskReview = _.findWhere(teamTaskReviews, { taskId: taskId, teamId: identityProvider.getIdentity().id })

          $taskInfo.show().html(window.volgactf.qualifier.templates.submitTaskStatusPartial({
            _: _,
            taskSolvedAt: taskSolvedAt ? moment(taskSolvedAt).format('MMM D [at] HH:mm [UTC]') : null,
            solvedTeamCount: taskHitStatistics.count,
            reviewAverageRating: taskReviewStatistics.averageRating,
            reviewCount: taskReviewStatistics.count,
            teamReview: teamTaskReview
              ? {
                  rating: teamTaskReview.rating,
                  comment: teamTaskReview.comment,
                  createdAt: moment(teamTaskReview.createdAt).format('MMM D [at] HH:mm [UTC]')
                }
              : null
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
          const showReviewForm = () => {
            $submitSuccess.text('')
            $reviewFieldGroup.show()
            $reviewButton.show()
            $reviewRating.focus()
          }

          const hideModal = () => {
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
          const hideModal = () => {
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
    const $modal = $('#check-task-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $taskInfo = $modal.find('.submit-info > p')
    const $submitSuccess = $modal.find('.submit-success > p')
    const $submitButton = $modal.find('button[data-action="complete-check-task"]')
    const $form = $modal.find('form')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element
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

    const $taskAnswerGroup = $('#check-task-answer-group')
    const $taskAnswer = $('#check-task-answer')
    const $taskContents = $modal.find('.volgactf-task-contents')

    $modal.on('show.bs.modal', (e) => {
      const taskId = parseInt($(e.relatedTarget).data('task-id'), 10)

      $taskContents.empty()
      $taskAnswer.val('')
      $submitError.text('')
      $taskInfo.text('')
      $submitSuccess.text('')
      $submitButton.prop('disabled', true)

      const taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
      const identity = identityProvider.getIdentity()
      const contest = contestProvider.getContest()

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
            const md = new MarkdownRenderer()
            const hintsFormatted = []
            _.each(taskHints, (entry) => {
              hintsFormatted.push(md.render(entry.hint))
            })

            $taskContents.html(window.volgactf.qualifier.templates.taskContentPartial({
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
          const hideModal = () => {
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
    const taskPreview = _.findWhere(taskProvider.getTaskPreviews(), { id: taskId })
    if (taskPreview) {
      let $modal = null
      const $button = $(`<button data-task-id="${taskId}"></button>`)
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

  disposeTooltips () {
    this.$taskPreviewsList.find('[data-action="show-task-reward-information"]').tooltip('dispose')
  }

  setupTooltips () {
    this.$taskPreviewsList.find('[data-action="show-task-reward-information"]').tooltip()
  }

  renderTaskPreviews () {
    const identity = identityProvider.getIdentity()
    let teamTaskHits = []
    if (identity.isTeam()) {
      teamTaskHits = _.where(teamTaskHitProvider.getTeamTaskHits(), { teamId: identity.id })
    }

    this.disposeTooltips()
    this.$taskPreviewsList.html(window.volgactf.qualifier.templates.taskList({
      _: _,
      moment: moment,
      templates: window.volgactf.qualifier.templates,
      identity: identity,
      contest: contestProvider.getContest(),
      categories: categoryProvider.getCategories(),
      taskPreviews: taskProvider.getTaskPreviews(),
      taskCategories: taskCategoryProvider.getTaskCategories(),
      taskValues: taskValueProvider.getTaskValues(),
      taskRewardSchemes: taskRewardSchemeProvider.getTaskRewardSchemes(),
      teamTaskHits: teamTaskHits,
      supervisorTaskSubscriptions: window.volgactf.qualifier.data.supervisorTaskSubscriptions
    }))
    this.setupTooltips()
  }

  present () {
    this.$main = $('#main')

    const identity = identityProvider.getIdentity()

    let promise = null
    if (identity.isTeam()) {
      promise = $.when(taskProvider.initTaskPreviews(), categoryProvider.initCategories(), taskCategoryProvider.initTaskCategories(), taskValueProvider.initTaskValues(), taskRewardSchemeProvider.initTaskRewardSchemes(), teamTaskHitProvider.initTeamTaskHits())
    } else if (identity.isAdmin()) {
      promise = $.when(taskProvider.initTaskPreviews(), categoryProvider.initCategories(), taskCategoryProvider.initTaskCategories(), taskValueProvider.initTaskValues(), taskRewardSchemeProvider.initTaskRewardSchemes(), remoteCheckerProvider.initRemoteCheckers(), taskRemoteCheckerProvider.initTaskRemoteCheckers())
    } else {
      promise = $.when(taskProvider.initTaskPreviews(), categoryProvider.initCategories(), taskCategoryProvider.initTaskCategories(), taskValueProvider.initTaskValues(), taskRewardSchemeProvider.initTaskRewardSchemes())
    }

    promise
      .done((taskPreviews, categories) => {
        if (identity.isSupervisor()) {
          this.initReviseTaskModal()
        }

        if (identity.isAdmin()) {
          remoteCheckerProvider.subscribe()
          taskRemoteCheckerProvider.subscribe()

          this.initCreateTaskModal()
          this.initCreateTaskFromGitHubModal()
          this.initCreateTaskFromGitFlicModal()
          this.initOpenTaskModal()
          this.initCloseTaskModal()
          this.initEditTaskModal()
          this.initManageTaskFilesModal()
        }

        if (identity.isAdmin() || identity.isManager()) {
          this.initSubscribeTaskModal()
          this.initUnsubscribeTaskModal()
        }

        if (identity.isTeam()) {
          this.initSubmitTaskModal()
        }

        if (identity.isGuest()) {
          this.initCheckTaskModal()
        }

        this.$taskPreviewsList = $('#volgactf-task-previews')
        this.setupTooltips()

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

        taskValueProvider.subscribe(identity)
        taskRewardSchemeProvider.subscribe(identity)

        this.onUpdateTaskValue = () => {
          this.requestRenderTasks()
          return false
        }
        taskValueProvider.on('updateTaskValue', this.onUpdateTaskValue)

        if (identity.isSupervisor()) {
          this.onCreateTaskValue = () => {
            this.requestRenderTasks()
            return false
          }
          taskValueProvider.on('createTaskValue', this.onCreateTaskValue)
        }

        if (identity.isTeam() || identity.isGuest()) {
          this.onRevealTaskValue = () => {
            this.requestRenderTasks()
            return false
          }
          taskValueProvider.on('revealTaskValue', this.onRevealTaskValue)
        }

        this.onUpdateTaskRewardScheme = () => {
          this.requestRenderTasks()
          return false
        }
        taskRewardSchemeProvider.on('updateTaskRewardScheme', this.onUpdateTaskRewardScheme)

        if (identity.isSupervisor()) {
          this.onCreateTaskRewardScheme = () => {
            this.requestRenderTasks()
            return false
          }
          taskRewardSchemeProvider.on('createTaskRewardScheme', this.onCreateTaskRewardScheme)
        }

        if (identity.isTeam() || identity.isGuest()) {
          this.onRevealTaskRewardScheme = () => {
            this.requestRenderTasks()
            return false
          }
          taskValueProvider.on('revealTaskRewardScheme', this.onRevealTaskRewardScheme)
        }

        this.onRenderTasks = (force = false) => {
          if ((this.flagRenderTasks || force) && !this.flagRenderingTasks) {
            this.flagRenderingTasks = true
            this.renderTaskPreviews()
            this.flagRenderingTasks = false
            this.flagRenderTasks = false
          }
        }

        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('action') === 'show' && urlParams.has('taskId')) {
          this.showTaskModal(identity, parseInt(urlParams.get('taskId'), 10))
        }

        this.renderTasksInterval = window.setInterval(this.onRenderTasks, 500)
      })
  }
}

export default new TasksView()
