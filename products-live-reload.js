$(function() {
    $(document.body).on('click', '.products-catalog__nav-link', function(e) {
        e.preventDefault();

        var $catalog = $(this).parents('.products-catalog').eq(0);

        $.get('/shop/jsmodules/item/market.php' + $(this).attr('href')).then(function(html) {
            $catalog.replaceWith(html);
        });
    });
});
