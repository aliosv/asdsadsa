$(function() {
    $(document.body).on('click', '.products-catalog__nav-link', function(e) {
        e.preventDefault();

        var $catalog = $(this).parents('.products-catalog').eq(0);

        $catalog.addClass('products-catalog_pending');

        $.get('/shop/jsmodules/item/market.php' + $(this).attr('href')).then(function(html) {
            $catalog.replaceWith(html);
        }, function() {
            $catalog.replaceWith('<div class="products-catalog__error">Произошла ошибка, попробуйте перезагрузить страницу</div>');
            $catalog.removeClass('products-catalog_pending');
        });
    });
});
