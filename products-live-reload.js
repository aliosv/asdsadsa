$(function() {
    $(document.body).on('click', '.table:eq(1) a[href^="?"]', function(e) {
        e.preventDefault();

        var $catalog = $(this).parents('.table').eq(0);

        $.get('/shop/jsmodules/item/market.php' + $(this).attr('href')).then(function(html) {
            $catalog.replaceWith(html);
        });
    });
});
