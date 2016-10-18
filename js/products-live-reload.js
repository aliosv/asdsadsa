$(function() {
    var updateContent = (function() {
        var lastRequest;

        return function(url) {
            var $catalog = $('.products-catalog').eq(0);

            $catalog.addClass('products-catalog_pending');

            var delay = 200,
                requestStartTime = new Date(),
                request = $.get(url);

            lastRequest = request;
            request.always(function(html) {
                // handle only last request
                if(lastRequest !== request) return;

                var t = setInterval(function() {
                    if((new Date()) - requestStartTime > delay) {
                        clearInterval(t);

                        if(request.state() === 'resolved') {
                            $catalog.replaceWith(html);
                        } else {
                            $catalog.addClass('products-catalog_error');
                            $catalog.removeClass('products-catalog_pending');
                        }
                    }
                }, 100);
            });
        };
    }());

    History.replaceState({ url : location.search, productsList : true }, null, location.search);

    $(document.body).on('click', '.products-catalog__nav-link', function(e) {
        var url = $(this).attr('href');

        History.pushState({ url : url, productsList : true }, null, url);

        e.preventDefault();
    });

    $(window).bind('popstate', function() {
        var state = History.getState() || { data : {} };

        state.data.productsList && updateContent('/shop/jsmodules/item/market.php' + state.data.url);
    });
});
