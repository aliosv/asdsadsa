$(function() {
    $('.table:eq(1) a[href^="?"]').on('click', function() {
        var catalog = $(this).parents('.table').eq(0);

        $.get('/shop/jsmodules/item/market.php' + location.search).then(function(html) {
            $(catalog).replace(html);
        });
    });
});
