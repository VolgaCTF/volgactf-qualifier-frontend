define 'identityProvider', ['jquery', 'metadataStore'], ($, metadataStore) ->
    class IdentityProvider
        constructor: ->
            @identity = null

        subscribe: ->

        unsubscribe: ->
            @identity = null

        getIdentity: ->
            @identity

        fetchIdentity: ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/identity"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) =>
                    @identity = responseJSON
                    promise.resolve @identity
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise


    new IdentityProvider()
