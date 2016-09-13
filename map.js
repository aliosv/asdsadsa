$(function() {
    function getStoresByCity(city) {
        return $.get('http://michel.edu-surgut.ru/geo/index.php?city=' + city).then(function(res) {
            return JSON.parse(res);
        });
    }
    
    ymaps.ready(function() {
        var myMap = new ymaps.Map('map', {
                center : [55.751574, 37.573856],
                zoom : 9,
                behaviors : ['scrollZoom']
            }, {
                searchControlProvider : 'yandex#search'
            }),
            clusterer = new ymaps.Clusterer({
                clusterIcons : [{
                    href : '/img/map.png',
                    size : [68, 57],
                    offset : [-15, -40]
                }],
                clusterNumbers : [100]
            }),

            getPointData = function(index) {
                return {
                    balloonContentBody : '<div class=""><span>ТД ПЯТОРОЧКА<span><br>Ул. Новоясеневская, 32' + index + '</div>',
                };
            },
            getPointOptions = function() {
                return {
                    iconLayout : 'default#image',
                    iconImageHref : '/img/map.png',
                    iconImageSize : [68, 57],
                    iconImageOffset : [-22, -57],
                    balloonShadow : false,
                    balloonLayout : MyBalloonLayout,
                    balloonContentLayout : MyBalloonContentLayout,
                    balloonPanelMaxMapArea : 0,
                    hideIconOnBalloonOpen : false,
                    balloonOffset : [0, 0]

                };
            },
            MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="popover top">' +
                '<a class="close" href="#">&times;</a>' +
                '<div class="arrow"></div>' +
                '<div class="popover-inner">' +
                '<span>ТД ПЯТОРОЧКА</span><br>Ул. Новоясеневская, 32 <a href="" class="go_mag"></a>' +
                '</div>' +
                '</div>', {
                    /**
                     * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
                     * @function
                     * @name build
                     */
                    build : function() {
                        this.constructor.superclass.build.call(this);

                        this._$element = $('.popover', this.getParentElement());

                        this.applyElementOffset();

                        this._$element.find('.close')
                            .on('click', $.proxy(this.onCloseClick, this));
                    },

                    /**
                     * Удаляет содержимое макета из DOM.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
                     * @function
                     * @name clear
                     */
                    clear : function() {
                        this._$element.find('.close')
                            .off('click');

                        this.constructor.superclass.clear.call(this);
                    },

                    /**
                     * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                     * @function
                     * @name onSublayoutSizeChange
                     */
                    onSublayoutSizeChange : function() {
                        MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                        if(!this._isElement(this._$element)) {
                            return;
                        }

                        this.applyElementOffset();

                        this.events.fire('shapechange');
                    },

                    /**
                     * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                     * @function
                     * @name applyElementOffset
                     */
                    applyElementOffset : function() {
                        this._$element.css({
                            left : -(this._$element[0].offsetWidth / 2),
                            top : -(this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight)
                        });
                    },

                    /**
                     * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                     * @function
                     * @name onCloseClick
                     */
                    onCloseClick : function(e) {
                        e.preventDefault();

                        this.events.fire('userclose');
                    },

                    /**
                     * Используется для автопозиционирования (balloonAutoPan).
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
                     * @function
                     * @name getClientBounds
                     * @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
                     */
                    getShape : function() {
                        if(!this._isElement(this._$element)) {
                            return MyBalloonLayout.superclass.getShape.call(this);
                        }

                        var position = this._$element.position();

                        return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                            [position.left, position.top], [
                                position.left + this._$element[0].offsetWidth,
                                position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight
                            ]
                        ]));
                    },

                    /**
                     * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
                     * @function
                     * @private
                     * @name _isElement
                     * @param {jQuery} [element] Элемент.
                     * @returns {Boolean} Флаг наличия.
                     */
                    _isElement : function(element) {
                        return element && element[0] && element.find('.arrow')[0];
                    }
                }),

        // Создание вложенного макета содержимого балуна.
            MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
                '<h3 class="popover-title">$[properties.balloonHeader]</h3>' +
                '<div class="popover-content">$[properties.balloonContent]</div>'
            ),
            $citySelect = $('select').eq(0),
            showCityStores = function() {
                var city = $citySelect.val();

                if(!city) {
                    clusterer.removeAll();
                } else {
                    getStoresByCity(city).then(function(points) {
                        clusterer.add(points.map(function(data) {
                            return new ymaps.Placemark(data, getPointData(data), getPointOptions())
                        }));

                        myMap.setBounds(clusterer.getBounds(), {
                            checkZoomRange : true
                        });
                    }, function() {
                        clusterer.removeAll();
                    });
                }
            };

        clusterer.options.set({
            gridSize : 80,
            clusterDisableClickZoom : false
        });

        myMap.geoObjects.add(clusterer);

        $citySelect.change(showCityStores);
        showCityStores();
    });
});
