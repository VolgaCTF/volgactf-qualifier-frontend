import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import newNavigationBar from '../new-navigation-bar'
import newStatusBar from '../new-status-bar'
import moment from 'moment'
import categoryProvider from '../providers/category'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import 'bootstrap'
import 'jquery-form'
import 'parsley'
import URLSearchParams from 'url-search-params'

class CategoriesView extends View {
  constructor () {
    super()
    this.$main = null

    this.onCreateCategory = null
    this.onUpdateCategory = null
    this.onDeleteCategory = null

    this.onUpdateContest = null
  }

  initCreateCategoryModal () {
    let $modal = $('#create-category-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-create-category"]')
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

    $modal.on('show.bs.modal', (e) => {
      $submitError.text('')
      $form.parsley().reset()
    })

    $modal.on('shown.bs.modal', (e) => {
      $('#create-category-title').focus()
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

  initEditCategoryModal () {
    let $modal = $('#edit-category-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-edit-category"]')
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

    let $editCategoryTitle = $('#edit-category-title')
    let $editCategoryDescription = $('#edit-category-description')

    $modal.on('show.bs.modal', (e) => {
      let categoryId = parseInt($(e.relatedTarget).data('category-id'), 10)
      let category = _.findWhere(categoryProvider.getCategories(), { id: categoryId })

      $form.attr('action', `/api/category/${categoryId}/update`)
      $editCategoryTitle.val(category.title)
      $editCategoryDescription.val(category.description)
      $submitError.text('')
      $form.parsley().reset()
    })

    $modal.on('shown.bs.modal', (e) => {
      $editCategoryTitle.focus()
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

  initDeleteCategoryModal () {
    let $modal = $('#delete-category-modal')
    $modal.modal({ show: false })

    let $modalBody = $modal.find('.modal-body p.confirmation')
    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-delete-category"]')

    $modal.on('show.bs.modal', (e) => {
      let categoryId = parseInt($(e.relatedTarget).data('category-id'), 10)
      $modal.data('category-id', categoryId)
      let category = _.findWhere(categoryProvider.getCategories(), { id: categoryId })
      const msgTemplate = _.template('You are about to delete the category <mark><%- title %></mark>. Continue?')
      $modalBody.html(msgTemplate({ title: category.title }))
      $submitError.text('')
    })

    $submitButton.on('click', (e) => {
      let categoryId = $modal.data('category-id')
      $
        .when(categoryProvider.deleteCategory(categoryId, identityProvider.getIdentity().token))
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

  renderCategories () {
    $('#themis-categories-list').html(window.themis.quals.templates.categoryList({
      _: _,
      identity: identityProvider.getIdentity(),
      contest: contestProvider.getContest(),
      categories: categoryProvider.getCategories(),
      templates: window.themis.quals.templates,
      moment: moment
    }))
  }

  present () {
    this.$main = $('#main')

    $
      .when(
        identityProvider.initIdentity(),
        categoryProvider.initCategories(),
        contestProvider.initContest()
      )
      .done((identity, categories, contest) => {
        identityProvider.subscribe()
        newNavigationBar.present()
        newStatusBar.present()

        let urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('action') === 'scrollTo' && urlParams.has('categoryId')) {
          let $el = $(`div.themis-category[data-id="${urlParams.get('categoryId')}"]`)
          if ($el.length > 0) {
            $el.get(0).scrollIntoView()
          }
        }

        this.initCreateCategoryModal()
        this.initEditCategoryModal()
        this.initDeleteCategoryModal()

        this.onCreateCategory = () => {
          this.renderCategories()
          return false
        }

        this.onUpdateCategory = () => {
          this.renderCategories()
          return false
        }

        this.onDeleteCategory = () => {
          this.renderCategories()
          return false
        }

        categoryProvider.subscribe()
        categoryProvider.on('createCategory', this.onCreateCategory)
        categoryProvider.on('updateCategory', this.onUpdateCategory)
        categoryProvider.on('deleteCategory', this.onDeleteCategory)

        this.onUpdateContest = (contest) => {
          this.renderCategories()
          return false
        }

        contestProvider.on('updateContest', this.onUpdateContest)
      })
  }
}

export default new CategoriesView()
