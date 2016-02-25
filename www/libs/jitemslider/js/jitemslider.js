(function ($) {
    if ('undefined' === typeof window.itemSlider) {

        function devError(m) {
            console.log("jItemSlider: devError: " + m);
        }

        var inst = 0;

        window.itemSlider = function (options) {

            var theInst = inst++;

            //------------------------------------------------------------------------------/
            // TOOLS
            //------------------------------------------------------------------------------/
            function mod(n, m) {
                return ((n % m) + m) % m;
            }

            /**
             * return int
             */
            function nbItemsPerPage() {
                return d.nbItemsPerPage();
            }


            function initialPaint() {
                var nbElsPerPage = nbItemsPerPage();
                var the_offset = 0; // start
                var length = getItemsLength();
                var i;


                if (true === d.infinite) {

                    // paint first items
                    for (i = the_offset; i < nbElsPerPage; i++) {
                        paintItem(mod(i, length), d.css.main);
                    }

                    // paint extra item
                    paintItem(mod(i++, length), d.css.extra);

                    // paint next slice
                    paintNextSlice(i);


                    // paint previous extra item
                    var start = length - 1;
                    var s = "";
                    if ('right' === d.openingSide) {
                        s = " " + d.css.invisible;
                    }
                    paintItem(mod(start--, length), d.css.extra + s, false);

                    //paint previous items
                    paintPrevSlice(start);

                }
                else {
                    var c = 0;
                    // paint first items
                    for (i = the_offset; i < nbElsPerPage; i++) {
                        if (c < length) {
                            paintItem(i, d.css.main);
                        }
                        c++;
                    }

                    if (c < length) {
                        // paint extra item
                        paintItem(c++, d.css.extra);
                    }

                    paintNextSlice(c);

                    // prepend invisible items to make calculations easier
                    paintItem(itemToCopyIndex, d.css.extra + ' ' + d.css.invisible, false);
                    for (i = 0; i < nbElsPerPage; i++) {
                        paintItem(itemToCopyIndex, d.css.prev + ' ' + d.css.invisible, false);
                    }
                }
                alignByFirstItem();
            }


            /**
             * Called:
             * - AFTER a reforge
             * - during a left/right move
             */
            function renameItems() {


                var nbElsPerPage = nbItemsPerPage();
                var c = 0;
                var d = 0;
                jSliderContent.find('> .' + d.css.item).each(function () {
                    $(this).removeClass(d.css.prev + " " + d.css.next + " "+ d.css.extra +" " + d.css.main);
                    if (c < nbElsPerPage) {
                        $(this).addClass(d.css.prev);
                    }
                    else if (nbElsPerPage === c) {
                        $(this).addClass(d.css.extra);
                    }
                    else {
                        if (d < nbElsPerPage) {
                            $(this).addClass(d.css.main);
                        }
                        else if (nbElsPerPage === d) {
                            $(this).addClass(d.css.extra);
                        }
                        else {
                            $(this).addClass(d.css.next);
                        }
                        d++;
                    }
                    c++;
                });
            }

            function cutLeft() {
                jSliderContent.find('> .' + d.css.prev).remove();
                offset += getPageWidth();
                repositionSlider(offset);
            }

            function cutRight() {
                jSliderContent.find('> .' + d.css.next).remove();
            }

            function hasPrevious() {
                return (jSliderContent.find('> .' + d.css.prev).length > 0);
            }


            function getItemsLength() {
                return d.items.length;
            }

            function moveSlider(the_offset) {
                jSliderContent.css({
                    transform: "translate3d(" + the_offset + "px, 0px, 0px)"
                });
            }

            function repositionSlider(the_offset) {
                jSliderContent.css({
                    left: the_offset + "px"
                });
            }

            function paintItem(the_offset, extraClass, append) {
                var h = d.renderItemCb(d.items[the_offset]);
                h = $(h);
                h.attr('data-id', the_offset);
                h.addClass(extraClass);
                if (false === append) {
                    jSliderContent.prepend(h);
                }
                else {
                    jSliderContent.append(h);
                }

            }

            function getFirstMainItem() {
                /**
                 * @conception: first item looses leftmost position
                 * added the not(invisible)
                 */
                return jSliderContent.find('> .' + d.css.main).not('.' + d.css.invisible).first();
            }

            function getLastMainItem() {
                return jSliderContent.find('> .' + d.css.main).last();
            }

            function getLastItemOffset() {
                return jSliderContent.find('> .' + d.css.item).last().data('id');
            }

            function getFirstItemOffset() {
                return jSliderContent.find('> .' + d.css.item).first().data('id');
            }

            function getPageWidth() {
                /**
                 * with proper css, should be equivalent to Math.ceil(jSlider.outerWidth())
                 */
                return Math.ceil(nbItemsPerPage() * getFirstMainItem().outerWidth(true));
            }

            function alignByFirstItem() {

                // adjusting slider position
                // align the first item with the mask content
                var jMain = getFirstMainItem();
                var itemWidth = jMain.outerWidth(true);
                var margin = itemWidth - jMain.outerWidth();
                offset = jMain.position().left; // "perfectly" aligned
                offset += sliderOffset;


                switch (d.alignMargin) {
                    case "none":
                        break;
                    case "full":
                        offset -= margin;
                        break;
                    case "half":
                        offset -= margin / 2;
                        break;
                    default:
                        break;
                }
                offset = -offset;
                repositionSlider(offset);
            }


            function paintNextSlice(startOffset) {
                var max, j;
                var length = getItemsLength();
                if (true === d.infinite) {
                    startOffset = mod(startOffset, length);
                    max = startOffset + nbItemsPerPage();
                    for (j = startOffset; j < max; j++) {
                        paintItem(mod(j, length), d.css.next);
                    }
                }
                else {
                    if (startOffset < length) {
                        // paint next slice
                        max = startOffset + nbItemsPerPage();
                        for (j = startOffset; j < max; j++) {
                            if (j < length) {
                                paintItem(j, d.css.next);
                            }
                        }
                    }
                }
            }

            function paintPrevSlice(startOffset) {
                var end = startOffset - nbItemsPerPage();
                var i;
                if (true === d.infinite) {
                    for (i = startOffset; i > end; i--) {
                        paintItem(mod(i, getItemsLength()), d.css.prev, false);
                    }
                }
                else {
                    for (i = startOffset; i > end; i--) {
                        if (i >= 0) {
                            paintItem(i, d.css.prev, false);
                        }
                        else {
                            paintItem(0, d.css.prev + " " + d.css.invisible, false);
                        }
                    }
                }
            }


            /**
             * With responsive design, your nb of items per page can change.
             * For instance, you can have a 25% width item for 800px+ page width,
             * and 20% width item for page width < 800px.
             *
             * This method basically redraw a "stabilized slider" to ensure consistency.
             * See docs conception for more info
             *
             */
            function reforge(oldNbItemsPerPage, newNbItemsPerPage) {
                var _hasPrevious = hasPrevious();
                var delta = newNbItemsPerPage - oldNbItemsPerPage;
                if (0 !== delta) {
                    var length = getItemsLength();
                    var i;

                    // the number of items has been raised
                    if (delta > 0) {
                        var firstOffset = getFirstItemOffset();
                        var lastOffset = getLastItemOffset();

                        if (true === _hasPrevious) {
                            var startOffset = firstOffset - 1;
                            var end = startOffset - delta;
                            var hasInvisible = jSliderContent.find('> .' + d.css.item).first().hasClass(d.css.invisible);
                            if (true === hasInvisible && false === d.infinite) {
                                for (i = startOffset; i > end; i--) {
                                    paintItem(itemToCopyIndex, d.css.prev + " " + d.css.invisible, false);
                                }
                            }
                            else {
                                if (false === d.infinite) {
                                    for (i = startOffset; i > end; i--) {
                                        if (i >= 0) {
                                            paintItem(i, d.css.prev, false);
                                        }
                                    }
                                }
                                else {
                                    for (i = startOffset; i > end; i--) {
                                        paintItem(mod(i, length), d.css.prev, false);
                                    }
                                }
                            }
                        }


                        startOffset = lastOffset + 1;
                        var max = startOffset + (delta * 2);
                        if (false === d.infinite) {
                            if (startOffset < length) {
                                for (i = startOffset; i < max; i++) {
                                    if (i < length) {
                                        paintItem(i, d.css.next);
                                    }
                                }
                            }
                        }
                        else {
                            for (i = startOffset; i < max; i++) {
                                paintItem(mod(i, length), d.css.next);
                            }
                        }
                    }
                    // the number of items has been diminished
                    else {
                        var n = -delta;

                        if (true === _hasPrevious) {
                            jSliderContent.find('> .' + d.css.item).each(function () {
                                if (n > 0) {
                                    $(this).remove();
                                    n--;
                                }
                            });
                        }

                        n = -delta * 2;
                        var removeNext = true;

                        /**
                         * @conception reforge down can strip main
                         * we ensure that in finite mode, there is always some main visible items
                         */
                        if (false === d.infinite) {
                            var nbMain = jSliderContent.find('> .' + d.css.main).length;
                            if (nbMain <= n) {
                                removeNext = false;
                            }
                        }

                        if (true === removeNext) {
                            $(jSliderContent.find('> .' + d.css.item).get().reverse()).each(function () {
                                if (n > 0) {
                                    $(this).remove();
                                    n--;
                                }
                            });
                        }
                    }

                    // rename 
                    renameItems();
                }
            }

            function getBoundaryValue() {
                var ret = 0;
                if (false === d.infinite) {
                    var jMain = getFirstMainItem();
                    if (0 === parseInt(jMain.data('id'))) {
                        ret++;
                    }
                    jMain = getLastMainItem();
                    var index = getItemsLength() - 1;
                    if (index === parseInt(jMain.data('id'))) {
                        ret += 2;
                    }
                }
                return ret;
            }


            //------------------------------------------------------------------------------/
            // INIT
            //------------------------------------------------------------------------------/
            var offset = 0;
            var sliderOffset = 0;
            var itemToCopyIndex = 0;
            var d = $.extend({
                //------------------------------------------------------------------------------/
                // COMMON OPTIONS
                //------------------------------------------------------------------------------/
                /**
                 * @param slider - jquery handle representing the slider mask.
                 *
                 * The slider mask should contain the slider content, which contains the items.
                 *
                 * <sliderMask>
                 *     <sliderContent>
                 *         <item/>
                 *         <item/>
                 *         ...
                 *     </sliderContent>
                 * </sliderMask>
                 *
                 */
                slider: null,
                /**
                 * @param items - array containing the items info
                 * All items should be generated right from the beginning (i.e. no ajax call or dynamic feeding).
                 */
                items: [],
                /**
                 * @param renderItemCb - callback that renders an item given the item info
                 *
                 *              str:itemHtml      function ( map:item )
                 *
                 */
                renderItemCb: function (item) {

                },
                /**
                 * @param nbItemsPerPage - callback, to sync the plugin with your css responsive design
                 *
                 *              int:nbItemsPerPage     function( )
                 *
                 * It returns the number of visible item on a page at any moment.
                 */
                nbItemsPerPage: function () {
                },
                /**
                 * @param alignMargin - string=none,
                 *
                 * How to handle the margin between the left boundary of the slider mask and the left boundary of the
                 * first main item.
                 *
                 * none (default): no margin: both boundaries are perfectly aligned
                 * full: full margin. the first item starts at a distance of a full margin
                 * half: half margin. the first item starts at a distance of half the (item) margin
                 *
                 */
                alignMargin: "none",
                /**
                 * @param animationLockTime, int=2000
                 *
                 * When the user clicks a left/right button, how many milliseconds to wait before those
                 * buttons become functional again.
                 * This is to avoid a user clicking repeatedly on the button.
                 * Ideally you want to set this to the animation time (in your css).
                 */
                animationLockTime: 2000,
                /**
                 *
                 * @param onLeftSlideAfter - callback executed after a left move
                 *
                 *
                 * The boundaryValue argument.
                 *
                 * A flag to detect whether or not we are on the first page or last page in finite mode.
                 *
                 * boundaryValue value is set to 0 in infinite mode, and is irrelevant.
                 * boundaryValue value is set to 0, 1, 2 or 3 in finite mode, and is relevant.
                 *
                 * 0: not on first page, not on last page
                 * 1: first page
                 * 2: last page
                 * 3: first page AND last page
                 *
                 *
                 *
                 * @conception first page, last page flags
                 */
                onLeftSlideAfter: function (boundaryValue) {
                },
                onRightSlideAfter: function (boundaryValue) {
                },
                /**
                 * @param css - map
                 * css classes used by this plugin
                 */
                css: {
                    sliderContent: "slider_content",
                    item: "item",
                    prev: "prev",
                    next: "next",
                    extra: "extra",
                    main: "main",
                    invisible: "invisible"
                },
                //------------------------------------------------------------------------------/
                // INFINITE RELATED OPTIONS
                //------------------------------------------------------------------------------/
                /**
                 * @param infinite, bool=true
                 * Whether to be in infinite mode or finite mode.
                 *
                 * In finite mode, one can not slide past a boundary item (left most or rightmost).
                 */
                infinite: true,
                /**
                 * @param openingSide - string=both,
                 *
                 * Only work in infinite mode
                 * both|right
                 * left is not implemented yet
                 *
                 * Whatever your option is, you can start the slide by clicking the left or right handle.
                 * The only difference is that in "right" mode, the plugin adds the class "invisible" to
                 * the previous extra item (the item just before the first item, see conception notes for more details),
                 * which allows you to style it as visibility:hidden in your css, which in turn gives the illusion
                 * that there is no element on the left when the plugin starts.
                 *
                 * See the infinite_slider_open_right example in the documentation demos.
                 */
                openingSide: 'both'
            }, options);

            if (!d.slider instanceof jQuery) {
                devError("slider must be an instance of jQuery");
            }
            var jSlider = d.slider;
            var jSliderContent = jSlider.find('.' + d.css.sliderContent);
            var isLocked = false;
            var lastNumberOfItemsPerPage = nbItemsPerPage();


            if (0 === jSliderContent.length) {
                devError("slider content not found");
            }


            // define coordinates
            initialPaint();


            $(window).on('resize.itemSlider' + theInst, function () {

                // fix case where slider items have been re-sized due to responsive css rules
                var curNbItemsPerPage = nbItemsPerPage();
                if (lastNumberOfItemsPerPage !== curNbItemsPerPage) {
                    reforge(lastNumberOfItemsPerPage, curNbItemsPerPage);
                }
                lastNumberOfItemsPerPage = curNbItemsPerPage;
                alignByFirstItem();
            });


            //------------------------------------------------------------------------------/
            // API
            //------------------------------------------------------------------------------/
            /**
             * Moves the slider to the left;
             * unless you are in finite mode and there is no more items to show on the left.
             */
            this.moveLeft = function () {
                if (false === isLocked) {
                    isLocked = true;


                    if (false === d.infinite) {
                        if (0 === parseInt(getFirstMainItem().data('id'))) {
                            isLocked = false;
                            return;
                        }
                    }

                    // append new items
                    var firstOffset = getFirstItemOffset();
                    var startOffset = firstOffset - 1;
                    paintPrevSlice(startOffset);

                    // fix position
                    offset -= getPageWidth();
                    repositionSlider(offset);

                    // remove obsolete (rightmost) items
                    cutRight();


                    // rename items
                    renameItems();


                    // trick: remove invisible if any in infinite mode
                    if (true === d.infinite) {
                        jSliderContent.find('> .' + d.css.invisible).removeClass(d.css.invisible);
                    }

                    // slide
                    sliderOffset += getPageWidth();
                    moveSlider(sliderOffset);


                    setTimeout(function () {
                        isLocked = false;
                        alignByFirstItem(); // fix chrome imprecise positioning
                        d.onLeftSlideAfter(getBoundaryValue());
                    }, d.animationLockTime);

                }

            };

            /**
             * Moves the slider to the right;
             * unless you are in finite mode and there is no more items to show on the right.
             */
            this.moveRight = function () {
                if (false === isLocked) {
                    isLocked = true;


                    if (false === d.infinite) {
                        if (parseInt(getLastMainItem().data('id')) === getItemsLength() - 1) {
                            isLocked = false;
                            return;
                        }
                    }

                    // append new items
                    var lastOffset = getLastItemOffset();
                    var startOffset = lastOffset + 1;
                    paintNextSlice(startOffset);

                    // remove obsolete (leftmost) items
                    cutLeft();


                    // rename items
                    renameItems();


                    // slide
                    sliderOffset -= getPageWidth();
                    moveSlider(sliderOffset);


                    setTimeout(function () {
                        isLocked = false;
                        alignByFirstItem(); // fix chrome imprecise positioning 
                        d.onRightSlideAfter(getBoundaryValue());
                    }, d.animationLockTime);
                }
            };

            /**
             * get the first main item's jquery handle.
             * The first main item is the first fully visible item in the slider.
             * See conception notes for more details.
             */
            this.getFirstMainItem = function () {
                return getFirstMainItem();
            };


            /**
             * Get the current boundary value (see options.onLeftSlideAfter for more details on boundary value).
             * This allows you to show/hide the left/right handle when the plugin instantiates.
             */
            this.getBoundaryValue = function () {
                return getBoundaryValue();
            }
        };
    }
})(jQuery);