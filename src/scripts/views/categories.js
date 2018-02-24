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
import 'jquery-form'
import 'parsley'
import URLSearchParams from 'url-search-params'

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
    let $modal = $('#create-category-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-create-category"]')
    let $form = $modal.find('form')
    $form.parsley()

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
    $form.parsley()

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
