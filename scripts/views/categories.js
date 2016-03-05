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
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import 'bootstrap'
import 'jquery.form'
import 'parsley'

class CategoriesView extends View {
  constructor () {
    super(/^\/categories$/)
    this.$main = null
    this.$categoriesList = null

    this.onCreateCategory = null
    this.onUpdateCategory = null
    this.onDeleteCategory = null

    this.onUpdateContest = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Categories`
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
      $modalBody.html(renderTemplate('delete-category-confirmation', { title: category.title }))
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
    let categories = categoryProvider.getCategories()
    if (categories.length === 0) {
      this.$categoriesList.empty()
      this.$categoriesList.html($('<p></p>').addClass('lead').text('No categories have been created yet.'))
    } else {
      this.$categoriesList.empty()
      let sortedCategories = _.sortBy(categories, 'createdAt')
      let manageable = identityProvider.getIdentity().isAdmin() && !contestProvider.getContest().isFinished()
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

  present () {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(identityProvider.fetchIdentity())
      .done((identity) => {
        if (identity.isSupervisor()) {
          identityProvider.subscribe()

          if (dataStore.supportsRealtime()) {
            dataStore.connectRealtime()
          }

          navigationBar.present({ active: 'categories' })

          $
            .when(categoryProvider.fetchCategories(), contestProvider.fetchContest())
            .done((categories, contest) => {
              statusBar.present()
              this.$main.html(renderTemplate('categories-view', { identity: identity, contest: contest }))

              this.$categoriesList = $('#themis-categories-list')

              this.renderCategories()

              this.initCreateCategoryModal()
              this.initEditCategoryModal()
              this.initDeleteCategoryModal()

              this.onCreateCategory = (category) => {
                this.renderCategories()
                return false
              }

              this.onUpdateCategory = (category) => {
                this.renderCategories()
                return false
              }

              this.onDeleteCategory = (categoryId) => {
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
            .fail((err) => {
              console.error(err)
              this.$main.html(renderTemplate('internal-error-view'))
            })
        } else {
          this.$main.html(renderTemplate('access-forbidden-view', {
            urlPath: window.location.pathname
          }))
        }
      })
      .fail((err) => {
        console.error(err)
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss () {
    identityProvider.unsubscribe()

    if (this.onCreateCategory) {
      categoryProvider.off('createCategory', this.onCreateCategory)
      this.onCreateCategory = null
    }

    if (this.onUpdateCategory) {
      categoryProvider.off('updateCategory', this.onUpdateCategory)
      this.onUpdateCategory = null
    }

    if (this.onDeleteCategory) {
      categoryProvider.off('deleteCategory', this.onDeleteCategory)
      this.onDeleteCategory = null
    }

    categoryProvider.unsubscribe()

    if (this.onUpdateContest) {
      contestProvider.off('updateContest', this.onUpdateContest)
      this.onUpdateContest = null
    }

    this.$main.empty()
    this.$main = null
    this.$categoriesList = null
    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new CategoriesView()
