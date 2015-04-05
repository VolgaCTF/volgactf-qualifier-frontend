define 'newsView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore', 'markdown-it', 'moment', 'jquery.form', 'parsley'], ($, _, View, renderTemplate, dataStore, navigationBar, metadataStore, MarkdownIt, moment) ->
    class NewsView extends View
        constructor: ->
            @$main = null
            @posts = []
            @identity = null
            @urlRegex = /^\/news$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: News"

        renderPosts: ->
            $section = @$main.find 'section'
            if @posts.length == 0
                $section.empty()
                $section.html $('<p></p>').addClass('lead').text 'No news yet.'
            else
                $section.empty()
                md = new MarkdownIt()
                sortedPosts = _.sortBy(@posts, 'createdAt').reverse()
                manageable = _.contains ['admin', 'manager'], @identity.role
                for post in sortedPosts
                    options =
                        id: post.id
                        title: post.title
                        description: md.render post.description
                        updatedAt: moment(post.updatedAt).format 'lll'
                        manageable: manageable

                    $section.append $ renderTemplate 'post-partial', options

        initRemovePostModal: ->
            $buttonRemovePost = @$main.find 'button[data-action="remove-post"]'

            if $buttonRemovePost.length
                $removePostModal = $ '#remove-post-modal'
                $removePostModal.modal
                    show: no

                $removePostModalBody = $removePostModal.find '.modal-body p.confirmation'
                $removePostSubmitError = $removePostModal.find '.submit-error > p'
                $removePostSubmitButton = $removePostModal.find 'button[data-action="complete-remove-post"]'

                $removePostModal.on 'show.bs.modal', (e) =>
                    postId = parseInt $(e.relatedTarget).data('post-id'), 10
                    $removePostModal.data 'post-id', postId
                    post = _.findWhere @posts, id: postId
                    $removePostModalBody.html renderTemplate 'remove-post-confirmation', title: post.title
                    $removePostSubmitError.text ''

                $removePostSubmitButton.on 'click', (e) ->
                    postId = $removePostModal.data 'post-id'
                    dataStore.removePost postId, (err) ->
                        if err?
                            $removePostSubmitError.text err
                        else
                            $removePostModal.modal 'hide'


        initCreatePostModal: ->
            $buttonCreatePost = @$main.find 'button[data-action="create-post"]'
            if $buttonCreatePost.length
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
                        success: (responseText, textStatus, jqXHR) ->
                            $createPostModal.modal 'hide'
                        error: (jqXHR, textStatus, errorThrown) ->
                            if jqXHR.responseJSON?
                                $createPostSubmitError.text jqXHR.responseJSON
                            else
                                $createPostSubmitError.text 'Unknown error. Please try again later.'
                        complete: ->
                            $createPostSubmitButton.prop 'disabled', no

        present: ->
            @$main = $ '#main'

            dataStore.getIdentity (err, identity) =>
                if err?
                    @$main.html renderTemplate 'internal-error'
                    navigationBar.present()
                else
                    @identity = identity
                    @$main.html renderTemplate 'news-view', identity: identity
                    navigationBar.present
                        identity: identity
                        active: 'news'

                    $section = @$main.find 'section'

                    dataStore.getPosts (err, posts) =>
                        if err?
                            $section.html $('<p></p>').addClass('lead text-danger').text err
                        else
                            @posts = posts
                            @renderPosts()

                            if _.contains ['admin', 'manager'], identity.role
                                @initCreatePostModal()
                                @initRemovePostModal()

                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()
                        dataStore.getRealtimeProvider().addEventListener 'createPost', (e) =>
                            data = JSON.parse e.data
                            post =
                                id: data.id
                                title: data.title
                                description: data.description
                                createdAt: new Date data.createdAt
                                updatedAt: new Date data.updatedAt

                            @posts.push post
                            @renderPosts()

                        dataStore.getRealtimeProvider().addEventListener 'removePost', (e) =>
                            post = JSON.parse e.data
                            ndx = _.findIndex @posts, id: post.id

                            if ndx > -1
                                @posts.splice ndx, 1
                                @renderPosts()

        dismiss: ->
            if dataStore.supportsRealtime()
                dataStore.getRealtimeProvider().removeEventListener 'createPost'
                dataStore.getRealtimeProvider().removeEventListener 'removePost'
                dataStore.disconnectRealtime()

            @$main.empty()
            @$main = null
            navigationBar.dismiss()

    new NewsView()
