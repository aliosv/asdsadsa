$(function() {
    $(document.body).on('click', '.products-catalog__nav-link', function(e) {
        e.preventDefault();

        var $catalog = $(this).parents('.products-catalog').eq(0);

        $catalog.addClass('products-catalog_pending');

        var delay = 200,
            requestStartTime = new Date();

        $.get('/shop/jsmodules/item/market.php' + $(this).attr('href')).then(function(html) {
            var t = setInterval(function() {
                if((new Date()) - requestStartTime > delay) {
                    clearInterval(t);

                    $catalog.replaceWith(html);
                }
            }, 100);
        }, function() {
            $catalog.replaceWith('<div class="products-catalog__error">Произошла ошибка, попробуйте перезагрузить страницу</div>');
            $catalog.removeClass('products-catalog_pending');
        });
    });
});
