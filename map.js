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
            $citySelect = $('select').eq(0),
            showCityStores = function() {
                var city = $citySelect.val();

                if(!city) {
                    clusterer.removeAll();
                } else {
                    getStoresByCity(city).then(function(stores) {
                        return ymaps.vow.all(stores.map(function(store) {
                            var address = [store.city, store.street, store.house].join(' ');

                            return ymaps.geocode(address).then(function(data) {
                                return data.geoObjects.get(0).geometry;
                            });
                        })).then(function(data) {
                            clusterer.removeAll().add(data.map(function(geometry, index) {
                                return new ymaps.Placemark(geometry, stores[index], {
                                    iconLayout : 'default#image',
                                    iconImageHref : '/img/map.png',
                                    iconImageSize : [68, 57],
                                    iconImageOffset : [-22, -57],
                                    balloonShadow : false,
                                    balloonLayout : ymaps.templateLayoutFactory.createClass(
                                        '<div class="popover top">' +
                                        '<a class="close" href="#">&times;</a>' +
                                        '<div class="arrow"></div>' +
                                        '<div class="popover-inner">' +
                                        '$[[options.contentLayout]]' +
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
                                    balloonContentLayout : ymaps.templateLayoutFactory.createClass(
                                        '<span>{{properties.dealername}}</span><br>{[{properties.street}, {properties.house}].join(\', \')} <a href="" class="go_mag"></a>'
                                    ),
                                    balloonPanelMaxMapArea : 0,
                                    hideIconOnBalloonOpen : false,
                                    balloonOffset : [0, 0]
                                });
                            }));

                            myMap.setBounds(clusterer.getBounds(), {
                                checkZoomRange : true
                            });
                        });
                    }).fail(function() {
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
