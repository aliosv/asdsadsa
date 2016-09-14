$(function() {
    $(document.body).on('click', '.products-catalog__nav-link', function(e) {
        e.preventDefault();

        var $catalog = $(this).parents('.products-catalog').eq(0);

        $catalog.addClass('products-catalog_pending');

        var delay = 200,
            requestStartTime = new Date(),
            request = $.get('/shop/jsmodules/item/market.php' + $(this).attr('href'));

        request.always(function(html) {
            var t = setInterval(function() {
                if((new Date()) - requestStartTime > delay) {
                    clearInterval(t);

                    if(request.state() === 'resolved') {
                        $catalog.replaceWith(html);
                    } else {
                        $catalog.html('<div class="products-catalog__error">Произошла ошибка, попробуйте' +
                            ' перезагрузить страницу</div>');
                        $catalog.removeClass('products-catalog_pending');
                    }
                }
            }, 100);
        });
    });
});
