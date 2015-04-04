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
