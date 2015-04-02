require.config
    paths:
        jquery: [
            'http://code.jquery.com/jquery-2.1.3.min',
            'jquery'
        ],
        bootstrap: [
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min',
            'bootstrap'
        ],
        underscore: [
            'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min',
            'underscore'
        ],
        'jquery.history': [
            'http://cdnjs.cloudflare.com/ajax/libs/history.js/1.8/bundled/html5/jquery.history.min',
            'jquery.history'
        ],
        'jquery.form': [
            'http://cdnjs.cloudflare.com/ajax/libs/jquery.form/3.46/jquery.form.min',
            'jquery.form'
        ],
        parsley: [
            'http://cdnjs.cloudflare.com/ajax/libs/parsley.js/2.0.7/parsley.min',
            'parsley'
        ]
    shim:
        'jquery.history':
            deps: ['jquery']
            exports: 'History'
        bootstrap: ['jquery']
        'bootstrap-filestyle': ['bootstrap']


define 'stateController', ['jquery', 'jquery.history', 'query-string'], ($, History, queryString) ->
    class StateController
        constructor: ->
            @viewController = null

        getStateData: (urlPath, params = {}) ->
            # AT: maybe it's a bug: replaceState won't call statechange
            # event if you reload page at the same url (e.g. Cmd+R or Ctrl+F5).
            # To workaround the problem, you can pass a unique value to state.
            # I have chosen to pass unix timestamp.
            {
                urlPath: urlPath
                tick: (new Date()).getTime()
                params: params
            }

        init: (viewController) ->
            @viewController = viewController
            History.Adapter.bind window, 'statechange', =>
                data = History.getState().data
                unless data.urlPath?
                    data.urlPath = window.location.pathname
                @viewController.render data.urlPath

            $(document).on 'click', 'a[data-push-history]', (e) =>
                e.preventDefault()
                e.stopPropagation()
                urlPath = $(e.target).attr 'href'
                title = @viewController.getTitle urlPath

                History.pushState @getStateData(urlPath), title, urlPath

            curLocation = window.location.pathname
            queryParams = queryString.parse window.location.search
            windowTitle = @viewController.getTitle curLocation
            historyData = urlPath: curLocation, tick: (new Date()).getTime()
            History.replaceState @getStateData(curLocation, queryParams), windowTitle, curLocation

        navigateTo: (urlPath, params = {}) ->
            title = @viewController.getTitle urlPath
            History.pushState @getStateData(urlPath, params), title, urlPath

    new StateController()


define 'dataStore', ['jquery', 'metadataStore'], ($, metadataStore) ->
    class DataStore
        constructor: ->

        getIdentity: (callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/identity"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseText, textStatus, jqXHR) ->
                    callback null, responseText
                error: (jqXHR, textStatus, errorThrown) ->
                    callback errorThrown, null

        verifyEmail: (data, callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/team/verify-email"
            $.ajax
                url: url
                type: 'POST'
                dataType: 'json'
                data: data
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    callback null, responseJSON
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        callback jqXHR.responseJSON, null
                    else
                        callback 'Unknown error. Please try again later.', null

        getTeamProfile: (id, callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/team/profile/#{id}"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    callback null, responseJSON
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        callback jqXHR.responseJSON, null
                    else
                        callback 'Unknown error. Please try again later.', null

    new DataStore()


define 'metadataStore', ['jquery'], ($) ->
    class MetadataStore
        constructor: ->
            @metadata = {}

        getMetadata: (name) ->
            unless @metadata[name]?
                $el = $ "script[type=\"text/x-metadata\"][data-name=\"#{name}\"]"
                if $el.length > 0
                    @metadata[name] = $el.data 'value'
                else
                    @metadata[name] = null

            @metadata[name]

    new MetadataStore()


define 'renderTemplate', ['jquery', 'underscore'], ($, _) ->
    store = null
    templates = {}

    (name, params = {}) ->
        unless templates[name]?
            unless store?
                store = $ '.themis-partials'

            $el = store.find "script[type=\"text/x-template\"][data-name=\"#{name}\"]"
            if $el.length > 0
                templates[name] = _.template $el.html()
            else
                templates[name] = _.template ''

        templates[name] params


define 'view', [], ->
    class View
        constructor: (urlRegex = null) ->
            @urlRegex = urlRegex

        present: ->

        dismiss: ->

        getTitle: ->
            ''

    View


define 'signupView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'stateController', 'metadataStore', 'parsley', 'jquery.form', 'bootstrap-filestyle'], ($, View, renderTemplate, dataStore, navigationBar, stateController, metadataStore) ->
    class SignupView extends View
        constructor: ->
            @urlRegex = /^\/signup$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Sign up"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'signup-view'
                    navigationBar.present()

                    $form = $main.find 'form.themis-form-signup'
                    $form.parsley()

                    $form.find('input[name="team"]').focus()

                    $successAlert = $main.find 'div.themis-alert-signup'

                    $submitError = $form.find '.submit-error > p'
                    $submitButton = $form.find 'button'

                    $form.find('input:file').filestyle()
                    $form.on 'submit', (e) ->
                        e.preventDefault()
                        $form.ajaxSubmit
                            beforeSubmit: ->
                                $submitError.text ''
                                $submitButton.prop 'disabled', yes
                            clearForm: yes
                            dataType: 'json'
                            xhrFields:
                                withCredentials: yes
                            success: (responseText, textStatus, jqXHR) ->
                                $form.hide()
                                $successAlert.show()
                            error: (jqXHR, textStatus, errorThrown) ->
                                if jqXHR.responseJSON?
                                    $submitError.text jqXHR.responseJSON
                                else
                                    $submitError.text 'Unknown error. Please try again later.'
                            complete: ->
                                $submitButton.prop 'disabled', no
                else
                    $main.html renderTemplate 'already-authenticated'
                    navigationBar.present()

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new SignupView()


define 'signinView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'stateController', 'metadataStore', 'parsley', 'jquery.form'], ($, View, renderTemplate, dataStore, navigationBar, stateController, metadataStore) ->
    class SigninView extends View
        constructor: ->
            @urlRegex = /^\/signin$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Sign in"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'signin-view'
                    navigationBar.present active: 'signin'

                    $form = $main.find 'form.themis-form-signin'
                    $form.parsley()

                    $form.find('input[name="team"]').focus()

                    $submitError = $form.find '.submit-error > p'
                    $submitButton = $form.find 'button'

                    $form.on 'submit', (e) ->
                        e.preventDefault()
                        $form.ajaxSubmit
                            beforeSubmit: ->
                                $submitError.text ''
                                $submitButton.prop 'disabled', yes
                            clearForm: yes
                            dataType: 'json'
                            xhrFields:
                                withCredentials: yes
                            success: (responseText, textStatus, jqXHR) ->
                                stateController.navigateTo '/'
                            error: (jqXHR, textStatus, errorThrown) ->
                                if jqXHR.responseJSON?
                                    $submitError.text jqXHR.responseJSON
                                else
                                    $submitError.text 'Unknown error. Please try again later.'
                            complete: ->
                                $submitButton.prop 'disabled', no
                else
                    $main.html renderTemplate 'already-authenticated'
                    navigationBar.present()

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new SigninView()


define 'loginView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'stateController', 'metadataStore', 'parsley', 'jquery.form'], ($, View, renderTemplate, dataStore, navigationBar, stateController, metadataStore) ->
    class LoginView extends View
        constructor: ->
            @urlRegex = /^\/login$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Login"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'login-view'
                    navigationBar.present()

                    $form = $main.find 'form.themis-form-login'
                    $form.parsley()

                    $submitError = $form.find '.submit-error > p'
                    $submitButton = $form.find 'button'

                    $form.on 'submit', (e) ->
                        e.preventDefault()
                        $form.ajaxSubmit
                            beforeSubmit: ->
                                $submitError.text ''
                                $submitButton.prop 'disabled', yes
                            clearForm: yes
                            dataType: 'json'
                            xhrFields:
                                withCredentials: yes
                            success: (responseText, textStatus, jqXHR) ->
                                stateController.navigateTo '/'
                            error: (jqXHR, textStatus, errorThrown) ->
                                if jqXHR.responseJSON?
                                    $submitError.text jqXHR.responseJSON
                                else
                                    $submitError.text 'Unknown error. Please try again later.'
                            complete: ->
                                $submitButton.prop 'disabled', no
                else
                    $main.html renderTemplate 'already-authenticated'
                    navigationBar.present()

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new LoginView()


define 'indexView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class IndexView extends View
        constructor: ->
            @urlRegex = /^\/$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Main"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                else
                    $('#main').html renderTemplate 'index-view', identity: identity
                    navigationBar.present
                        show:
                            news: yes
                        identity: identity

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new IndexView()


define 'profileView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore', 'jquery.history', 'parsley', 'jquery.form', 'bootstrap-filestyle'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore, History) ->
    class ProfileView extends View
        constructor: ->
            @urlRegex = /^\/profile\/[0-9]+$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Team profile"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                else
                    url = History.getState().data.urlPath
                    urlParts = url.split '/'
                    teamId = parseInt urlParts[urlParts.length - 1], 10
                    dataStore.getTeamProfile teamId, (err, team) ->
                        if err? or not team?
                            $main.html renderTemplate 'internal-error'
                            navigationBar.present
                                show:
                                    news: yes
                                identity: identity
                        else
                            $main.html renderTemplate 'profile-view', identity: identity, team: team
                            navigationBar.present
                                show:
                                    news: yes
                                identity: identity

                            if identity.role is 'team' and identity.id == team.id
                                $buttonUploadLogo = $main.find 'a[data-action="upload-logo"]'

                                if $buttonUploadLogo.length
                                    $uploadLogoModal = $ '#upload-logo-modal'
                                    $uploadLogoModal.modal
                                        show: no

                                    $uploadLogoSubmitError = $uploadLogoModal.find '.submit-error > p'
                                    $uploadLogoSubmitButton = $uploadLogoModal.find 'button[data-action="complete-upload-logo"]'
                                    $uploadLogoForm = $uploadLogoModal.find 'form'
                                    $uploadLogoForm.find('input:file').filestyle()
                                    $uploadLogoForm.parsley()

                                    $uploadLogoSubmitButton.on 'click', (e) ->
                                        $uploadLogoForm.trigger 'submit'

                                    $uploadLogoModal.on 'show.bs.modal', (e) ->
                                        $uploadLogoForm.find('input:file').filestyle 'clear'

                                    $uploadLogoForm.on 'submit', (e) ->
                                        e.preventDefault()
                                        $uploadLogoForm.ajaxSubmit
                                            beforeSubmit: ->
                                                $uploadLogoSubmitError.text ''
                                                $uploadLogoSubmitButton.prop 'disabled', yes
                                            clearForm: yes
                                            dataType: 'json'
                                            xhrFields:
                                                withCredentials: yes
                                            success: (responseText, textStatus, jqXHR) ->
                                                onTimeout = ->
                                                    $uploadLogoModal.modal 'hide'
                                                    window.location.reload()

                                                setTimeout onTimeout, 1500
                                            error: (jqXHR, textStatus, errorThrown) ->
                                                if jqXHR.responseJSON?
                                                    $uploadLogoSubmitError.text jqXHR.responseJSON
                                                else
                                                    $uploadLogoSubmitError.text 'Unknown error. Please try again later.'
                                            complete: ->
                                                $uploadLogoSubmitButton.prop 'disabled', no

                                $buttonUploadLogo.on 'click', (e) ->
                                    $uploadLogoModal.modal 'show'
                                    e.preventDefault()









                                $buttonChangeEmail = $main.find 'button[data-action="change-email"]'
                                $buttonResendConfirmation = $main.find 'button[data-action="resend-confirmation"]'

                                if not identity.emailConfirmed
                                    if $buttonResendConfirmation.length
                                        $resendConfirmationModal = $ '#resend-confirmation-modal'
                                        $resendConfirmationModal.modal
                                            show: no

                                        $resendConfirmationSubmitError = $resendConfirmationModal.find '.submit-error > p'
                                        $resendConfirmationSubmitButton = $resendConfirmationModal.find 'button[data-action="complete-resend-confirmation"]'
                                        $resendConfirmationForm = $resendConfirmationModal.find 'form'

                                        $resendConfirmationSubmitButton.on 'click', (e) ->
                                            $resendConfirmationForm.trigger 'submit'

                                        $resendConfirmationModal.on 'show.bs.modal', (e) ->
                                            $resendConfirmationSubmitError.text ''

                                        $resendConfirmationModal.on 'shown.bs.modal', (e) ->
                                            $('#resend-confirmation-email').val(team.email).focus()

                                        $resendConfirmationForm.on 'submit', (e) ->
                                            e.preventDefault()
                                            $resendConfirmationForm.ajaxSubmit
                                                beforeSubmit: ->
                                                    $resendConfirmationSubmitError.text ''
                                                    $resendConfirmationSubmitButton.prop 'disabled', yes
                                                clearForm: yes
                                                dataType: 'json'
                                                xhrFields:
                                                    withCredentials: yes
                                                success: (responseText, textStatus, jqXHR) ->
                                                    $resendConfirmationModal.modal 'hide'
                                                    window.location.reload()
                                                error: (jqXHR, textStatus, errorThrown) ->
                                                    if jqXHR.responseJSON?
                                                        $resendConfirmationSubmitError.text jqXHR.responseJSON
                                                    else
                                                        $resendConfirmationSubmitError.text 'Unknown error. Please try again later.'
                                                complete: ->
                                                    $resendConfirmationSubmitButton.prop 'disabled', no


                                        $buttonResendConfirmation.on 'click', (e) ->
                                            $resendConfirmationModal.modal 'show'


                                    if $buttonChangeEmail.length
                                        $changeEmailModal = $ '#change-email-modal'
                                        $changeEmailModal.modal
                                            show: no

                                        $changeEmailSubmitError = $changeEmailModal.find '.submit-error > p'
                                        $changeEmailSubmitButton = $changeEmailModal.find 'button[data-action="complete-change-email"]'
                                        $changeEmailForm = $changeEmailModal.find 'form'
                                        $changeEmailForm.parsley()

                                        $changeEmailSubmitButton.on 'click', (e) ->
                                            $changeEmailForm.trigger 'submit'

                                        $changeEmailModal.on 'show.bs.modal', (e) ->
                                            $changeEmailSubmitError.text ''

                                        $changeEmailModal.on 'shown.bs.modal', (e) ->
                                            $('#change-email-new').val('').focus()

                                        $changeEmailForm.on 'submit', (e) ->
                                            e.preventDefault()
                                            $changeEmailForm.ajaxSubmit
                                                beforeSubmit: ->
                                                    $changeEmailSubmitError.text ''
                                                    $changeEmailSubmitButton.prop 'disabled', yes
                                                clearForm: yes
                                                dataType: 'json'
                                                xhrFields:
                                                    withCredentials: yes
                                                success: (responseText, textStatus, jqXHR) ->
                                                    $changeEmailModal.modal 'hide'
                                                    window.location.reload()
                                                error: (jqXHR, textStatus, errorThrown) ->
                                                    if jqXHR.responseJSON?
                                                        $changeEmailSubmitError.text jqXHR.responseJSON
                                                    else
                                                        $changeEmailSubmitError.text 'Unknown error. Please try again later.'
                                                complete: ->
                                                    $changeEmailSubmitButton.prop 'disabled', no


                                        $buttonChangeEmail.on 'click', (e) ->
                                            $changeEmailModal.modal 'show'


                                $buttonEditProfile = $main.find 'button[data-action="edit-profile"]'
                                if $buttonEditProfile.length
                                    $editProfileModal = $ '#edit-profile-modal'
                                    $editProfileModal.modal
                                        show: no

                                    $editProfileSubmitError = $editProfileModal.find '.submit-error > p'
                                    $editProfileSubmitButton = $editProfileModal.find 'button[data-action="complete-edit-profile"]'
                                    $editProfileForm = $editProfileModal.find 'form'
                                    $editProfileForm.parsley()

                                    $editProfileSubmitButton.on 'click', (e) ->
                                        $editProfileForm.trigger 'submit'

                                    $editProfileModal.on 'show.bs.modal', (e) ->
                                        $editProfileSubmitError.text ''

                                    $editProfileModal.on 'shown.bs.modal', (e) ->
                                        $('#edit-profile-country').val(team.country).focus()
                                        $('#edit-profile-locality').val team.locality
                                        $('#edit-profile-institution').val team.institution

                                    $editProfileForm.on 'submit', (e) ->
                                        e.preventDefault()
                                        $editProfileForm.ajaxSubmit
                                            beforeSubmit: ->
                                                $editProfileSubmitError.text ''
                                                $editProfileSubmitButton.prop 'disabled', yes
                                            clearForm: yes
                                            dataType: 'json'
                                            xhrFields:
                                                withCredentials: yes
                                            success: (responseText, textStatus, jqXHR) ->
                                                $editProfileModal.modal 'hide'
                                                window.location.reload()
                                            error: (jqXHR, textStatus, errorThrown) ->
                                                if jqXHR.responseJSON?
                                                    $editProfileSubmitError.text jqXHR.responseJSON
                                                else
                                                    $editProfileSubmitError.text 'Unknown error. Please try again later.'
                                            complete: ->
                                                $editProfileSubmitButton.prop 'disabled', no


                                    $buttonEditProfile.on 'click', (e) ->
                                        $editProfileModal.modal 'show'


                                $buttonChangePassword = $main.find 'button[data-action="change-password"]'
                                if $buttonChangePassword.length
                                    $changePasswordModal = $ '#change-password-modal'
                                    $changePasswordModal.modal
                                        show: no

                                    $changePasswordSubmitError = $changePasswordModal.find '.submit-error > p'
                                    $changePasswordSubmitButton = $changePasswordModal.find 'button[data-action="complete-change-password"]'
                                    $changePasswordForm = $changePasswordModal.find 'form'
                                    $changePasswordForm.parsley()

                                    $changePasswordSubmitButton.on 'click', (e) ->
                                        $changePasswordForm.trigger 'submit'

                                    $changePasswordModal.on 'show.bs.modal', (e) ->
                                        $changePasswordSubmitError.text ''

                                    $changePasswordModal.on 'shown.bs.modal', (e) ->
                                        $('#change-pwd-current').focus()

                                    $changePasswordForm.on 'submit', (e) ->
                                        e.preventDefault()
                                        $changePasswordForm.ajaxSubmit
                                            beforeSubmit: ->
                                                $changePasswordSubmitError.text ''
                                                $changePasswordSubmitButton.prop 'disabled', yes
                                            clearForm: yes
                                            dataType: 'json'
                                            xhrFields:
                                                withCredentials: yes
                                            success: (responseText, textStatus, jqXHR) ->
                                                $changePasswordModal.modal 'hide'
                                            error: (jqXHR, textStatus, errorThrown) ->
                                                if jqXHR.responseJSON?
                                                    $changePasswordSubmitError.text jqXHR.responseJSON
                                                else
                                                    $changePasswordSubmitError.text 'Unknown error. Please try again later.'
                                            complete: ->
                                                $changePasswordSubmitButton.prop 'disabled', no

                                    $buttonChangePassword.on 'click', (e) ->
                                        $changePasswordModal.modal 'show'

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new ProfileView()


define 'verifyEmailView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore', 'jquery.history'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore, History) ->
    class VerifyEmailView extends View
        constructor: ->
            @urlRegex = /^\/verify-email$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Email verification"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                else
                    $main.html renderTemplate 'verify-email-view', identity: identity
                    navigationBar.present
                        show:
                            news: yes
                        identity: identity

                    $progress = $main.find 'p[data-role="progress"]'
                    $result = $main.find 'p[data-role="result"]'

                    dataStore.verifyEmail History.getState().data.params, (err, result) ->
                        $progress.hide()
                        if err?
                            $result.addClass('text-danger').text err
                        else
                            $result.addClass('text-success').text 'Email verified! Thank you!'

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new VerifyEmailView()


define 'newsView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class NewsView extends View
        constructor: ->
            @urlRegex = /^\/news$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: News"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                else
                    $('#main').html renderTemplate 'news-view', identity: identity
                    navigationBar.present
                        show:
                            news: yes
                        identity: identity
                        active: 'news'

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new NewsView()


define 'notFoundView', ['jquery', 'view', 'renderTemplate', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, navigationBar, metadataStore) ->
    class NotFoundView extends View
        constructor: ->
            super null

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Not Found"

        present: ->
            $('#main').html renderTemplate 'not-found-view', urlPath: window.location.pathname

        dismiss: ->
            $('#main').empty()

    new NotFoundView()


define 'viewControllerBase', ['underscore', 'view'], (_, View) ->
    class ViewControllerBase
        constructor: ->
            @views = []
            @activeView = null
            @errorViews = {}

        view: (view) ->
            @views.push view
            view

        errorView: (name, view) ->
            @errorViews[name] = view
            view

        findView: (urlPath) ->
            found = _.find @views, (view) ->
                view.urlRegex.test urlPath

            found ? @errorViews['not-found']

        getTitle: (urlPath) ->
            view = @findView urlPath
            view.getTitle()

        render: (urlPath) ->
            newView = @findView urlPath
            @activeView?.dismiss()
            @activeView = newView
            @activeView.present()


define 'viewController', ['viewControllerBase', 'renderTemplate', 'indexView', 'signinView', 'signupView', 'loginView', 'newsView', 'verifyEmailView', 'profileView', 'notFoundView'], (ViewControllerBase, renderTemplate, indexView, signinView, signupView, loginView, newsView, verifyEmailView, profileView, notFoundView) ->
    viewController = new ViewControllerBase()

    viewController.view indexView
    viewController.view signinView
    viewController.view signupView
    viewController.view loginView
    viewController.view newsView
    viewController.view verifyEmailView
    viewController.view profileView

    viewController.errorView 'not-found', notFoundView

    viewController


define 'navigationBar', ['jquery', 'underscore', 'renderTemplate', 'metadataStore', 'stateController'], ($, _, renderTemplate, metadataStore, stateController) ->
    class NavigationBar
        present: (options = {}) ->
            defaultOptions =
                show:
                    news: yes
                urlPath: window.location.pathname
                identity: null
                active: null
            options = _.extend defaultOptions, options

            $navbar = $ '#themis-navbar'
            $navbar.html renderTemplate 'navbar', options

            $signout = $navbar.find 'a[data-action="signout"]'
            if $signout.length > 0
                $signout.on 'click', (e) ->
                    e.preventDefault()
                    e.stopPropagation()

                    url = "#{metadataStore.getMetadata('domain-api')}/signout"
                    $.ajax
                        method: 'POST'
                        url: url
                        dataType: 'json'
                        xhrFields:
                            withCredentials: yes
                        success: (responseText, textStatus, jqXHR) ->
                            stateController.navigateTo '/'
                        error: (jqXHR, textStatus, errorThrown) ->
                            console.log errorThrown

        dismiss: ->
            $('#themis-navbar').empty()

    new NavigationBar()


define 'themis', ['jquery', 'stateController', 'viewController', 'bootstrap'], ($, stateController, viewController) ->
    $(document).ready ->
        stateController.init viewController
