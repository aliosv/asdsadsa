$(function() {
    $('.table:eq(1) a[href^="?"]').on('click', function(e) {
        e.preventDefault();

        var $catalog = $(this).parents('.table').eq(0);

        $.get('/shop/jsmodules/item/market.php' + $(this).attr('href')).then(function(html) {
            $catalog.replaceWith(html);
        });
    });
});
