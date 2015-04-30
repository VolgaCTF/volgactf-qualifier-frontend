define 'newsView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'markdown-it', 'moment', 'postProvider', 'contestProvider', 'identityProvider', 'jquery.form', 'parsley'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, MarkdownIt, moment, postProvider, contestProvider, identityProvider) ->
    class NewsView extends View
        constructor: ->
            @$main = null

            @onCreatePost = null
            @onUpdatePost = null
            @onRemovePost = null

            @urlRegex = /^\/news$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: News"

        renderPosts: ->
            posts = postProvider.getPosts()
            $section = @$main.find 'section'
            if posts.length == 0
                $section.empty()
                $section.html $('<p></p>').addClass('lead').text 'No news yet.'
            else
                $section.empty()
                md = new MarkdownIt()
                sortedPosts = _.sortBy(posts, 'createdAt').reverse()
                manageable = _.contains ['admin', 'manager'], identityProvider.getIdentity().role
                for post in sortedPosts
                    options =
                        id: post.id
                        title: post.title
                        description: md.render post.description
                        updatedAt: moment(post.updatedAt).format 'lll'
                        manageable: manageable

                    $section.append $ renderTemplate 'post-partial', options

        initRemovePostModal: ->
            $removePostModal = $ '#remove-post-modal'
            $removePostModal.modal
                show: no

            $removePostModalBody = $removePostModal.find '.modal-body p.confirmation'
            $removePostSubmitError = $removePostModal.find '.submit-error > p'
            $removePostSubmitButton = $removePostModal.find 'button[data-action="complete-remove-post"]'

            $removePostModal.on 'show.bs.modal', (e) ->
                postId = parseInt $(e.relatedTarget).data('post-id'), 10
                $removePostModal.data 'post-id', postId
                post = _.findWhere postProvider.getPosts(), id: postId
                $removePostModalBody.html renderTemplate 'remove-post-confirmation', title: post.title
                $removePostSubmitError.text ''

            $removePostSubmitButton.on 'click', (e) =>
                postId = $removePostModal.data 'post-id'
                $
                    .when postProvider.removePost postId, identityProvider.getIdentity().token
                    .done ->
                        $removePostModal.modal 'hide'
                    .fail (err) ->
                        $removePostSubmitError.text err

        initCreatePostModal: ->
            $createPostModal = $ '#create-post-modal'
            $createPostModal.modal
                show: no

            $createPostSubmitError = $createPostModal.find '.submit-error > p'
            $createPostSubmitButton = $createPostModal.find 'button[data-action="complete-create-post"]'
            $createPostForm = $createPostModal.find 'form'
            $createPostForm.parsley()

            $createPostSubmitButton.on 'click', (e) ->
                $createPostForm.trigger 'submit'

            $createPostTablist = $ '#create-post-tablist'
            $createPostTabData = $createPostTablist.find 'a[href="#create-post-data"]'
            $createPostTabPreview = $createPostTablist.find 'a[href="#create-post-preview"]'

            $createPostTitle = $ '#create-post-title'
            $createPostDescription = $ '#create-post-description'

            $createPostPreview = $ '#create-post-preview'

            $createPostTabData.tab()
            $createPostTabPreview.tab()

            $createPostTabPreview.on 'show.bs.tab', (e) ->
                md = new MarkdownIt()
                options =
                    title: $createPostTitle.val()
                    description: md.render $createPostDescription.val()
                    updatedAt: moment(new Date()).format 'lll'

                $createPostPreview.html renderTemplate 'post-simplified-partial', options

            $createPostModal.on 'show.bs.modal', (e) ->
                $createPostTabData.tab 'show'
                $createPostTitle.val ''
                $createPostDescription.val ''
                $createPostSubmitError.text ''
                $createPostForm.parsley().reset()

            $createPostModal.on 'shown.bs.modal', (e) ->
                $createPostTitle.focus()

            $createPostForm.on 'submit', (e) ->
                e.preventDefault()
                $createPostForm.ajaxSubmit
                    beforeSubmit: ->
                        $createPostSubmitError.text ''
                        $createPostSubmitButton.prop 'disabled', yes
                    clearForm: yes
                    dataType: 'json'
                    xhrFields:
                        withCredentials: yes
                    headers: { 'X-CSRF-Token': identityProvider.getIdentity().token }
                    success: (responseText, textStatus, jqXHR) ->
                        $createPostModal.modal 'hide'
                    error: (jqXHR, textStatus, errorThrown) ->
                        if jqXHR.responseJSON?
                            $createPostSubmitError.text jqXHR.responseJSON
                        else
                            $createPostSubmitError.text 'Unknown error. Please try again later.'
                    complete: ->
                        $createPostSubmitButton.prop 'disabled', no

        initEditPostModal: ->
            $editPostModal = $ '#edit-post-modal'
            $editPostModal.modal
                show: no

            $editPostSubmitError = $editPostModal.find '.submit-error > p'
            $editPostSubmitButton = $editPostModal.find 'button[data-action="complete-edit-post"]'
            $editPostForm = $editPostModal.find 'form'
            $editPostForm.parsley()

            $editPostSubmitButton.on 'click', (e) ->
                $editPostForm.trigger 'submit'

            $editPostTablist = $ '#edit-post-tablist'
            $editPostTabData = $editPostTablist.find 'a[href="#edit-post-data"]'
            $editPostTabPreview = $editPostTablist.find 'a[href="#edit-post-preview"]'

            $editPostTitle = $ '#edit-post-title'
            $editPostDescription = $ '#edit-post-description'

            $editPostPreview = $ '#edit-post-preview'

            $editPostTabData.tab()
            $editPostTabPreview.tab()

            $editPostTabPreview.on 'show.bs.tab', (e) ->
                md = new MarkdownIt()
                options =
                    title: $editPostTitle.val()
                    description: md.render $editPostDescription.val()
                    updatedAt: moment(new Date()).format 'lll'

                $editPostPreview.html renderTemplate 'post-simplified-partial', options

            $editPostModal.on 'show.bs.modal', (e) ->
                $editPostTabData.tab 'show'
                postId = parseInt $(e.relatedTarget).data('post-id'), 10
                post = _.findWhere postProvider.getPosts(), id: postId

                $editPostForm.attr 'action', "#{metadataStore.getMetadata 'domain-api' }/post/#{postId}/update"
                $editPostTitle.val post.title
                $editPostDescription.val post.description
                $editPostSubmitError.text ''
                $editPostForm.parsley().reset()

            $editPostModal.on 'shown.bs.modal', (e) ->
                $editPostTitle.focus()

            $editPostForm.on 'submit', (e) ->
                e.preventDefault()
                $editPostForm.ajaxSubmit
                    beforeSubmit: ->
                        $editPostSubmitError.text ''
                        $editPostSubmitButton.prop 'disabled', yes
                    clearForm: yes
                    dataType: 'json'
                    xhrFields:
                        withCredentials: yes
                    headers: { 'X-CSRF-Token': identityProvider.getIdentity().token }
                    success: (responseText, textStatus, jqXHR) ->
                        $editPostModal.modal 'hide'
                    error: (jqXHR, textStatus, errorThrown) ->
                        if jqXHR.responseJSON?
                            $editPostSubmitError.text jqXHR.responseJSON
                        else
                            $editPostSubmitError.text 'Unknown error. Please try again later.'
                    complete: ->
                        $editPostSubmitButton.prop 'disabled', no

        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'loading-view'

            $
                .when identityProvider.fetchIdentity()
                .done (identity) =>
                    if identity.role is 'team'
                        promise = $.when contestProvider.fetchContest(), postProvider.fetchPosts(), contestProvider.fetchTeamScores()
                    else
                        promise = $.when contestProvider.fetchContest(), postProvider.fetchPosts()

                    promise
                        .done (contest) =>
                            identityProvider.subscribe()
                            if dataStore.supportsRealtime()
                                dataStore.connectRealtime()

                            navigationBar.present active: 'news'
                            statusBar.present()

                            @$main.html renderTemplate 'news-view', identity: identity
                            $section = @$main.find 'section'

                            if _.contains ['admin', 'manager'], identity.role
                                @initCreatePostModal()
                                @initRemovePostModal()
                                @initEditPostModal()

                            @renderPosts()

                            @onCreatePost = (post) =>
                                @renderPosts()
                                false

                            @onUpdatePost = (post) =>
                                @renderPosts()
                                false

                            @onRemovePost = (postId) =>
                                @renderPosts()
                                false

                            postProvider.subscribe()
                            postProvider.on 'createPost', @onCreatePost
                            postProvider.on 'updatePost', @onUpdatePost
                            postProvider.on 'removePost', @onRemovePost
                        .fail (err) =>
                            navigationBar.present()
                            @$main.html renderTemplate 'internal-error-view'
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()

            if @onCreatePost?
                postProvider.off 'createPost', @onCreatePost
                @onCreatePost = null
            if @onRemovePost?
                postProvider.off 'removePost', @onRemovePost
                @onRemovePost = null
            if @onUpdatePost?
                postProvider.off 'updatePost', @onUpdatePost
                @onUpdatePost = null
            postProvider.unsubscribe()

            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()

    new NewsView()
