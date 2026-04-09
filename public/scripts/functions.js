(function($) {
    $(document).ready(function() {
        "use strict";
        /* =================================
        ===  Resize images slideshow                 ====
        =================================== */
        function resize_img_slideshow() {
            if (Modernizr.mq('(min-width: 1200px)')) {
                $.each($('.content-img'), function() {
                    $(this).css({
                        "width": this.naturalWidth,
                    });
                });
            } else if (Modernizr.mq('(min-width: 992px)')) {
                $.each($('.content-img'), function() {
                    $(this).css({
                        "width": ((this.naturalWidth * 70) / 100),
                    });
                });
            } else if (Modernizr.mq('(min-width: 768px)')) {
                $.each($('.content-img'), function() {
                    $(this).css({
                        "width": ((this.naturalWidth * 50) / 100),
                    });
                });
            } else {
                $.each($('.content-img'), function() {
                    $(this).css({
                        "width": ((this.naturalWidth * 30) / 100),
                    });
                });
            }
        }
        $(window).on('load', function() {
            resize_img_slideshow();
            $(".responsive-accordion li.first-open .responsive-accordion-head").trigger("click");
        });
  
        $(window).resize(function() {
            resize_img_slideshow();
        });      

       /* =================================
        ===  Change Logo                 ====
        =================================== */
        function change_logo() {
            var logo = $('.white-logo');
            var white_src = logo.attr('data-white-src');
            var src = logo.attr('data-src');
            if (Modernizr.mq('(min-width: 768px)')) {
                logo.attr('src', white_src);
            } else {
                logo.attr('src', src);
            }
        }
        if ($('.white-logo').length) {
            change_logo();
            $(window).resize(function() {
                change_logo();
            });
        }
       
        /* =================================
        ===  Minimal Menu                 ====
        =================================== */
        $('.minimal-menu').before('<label class=\"minimal-menu-button\" for=\"mobile-nav\"><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span></label><input class=\"minimal-menu-button\" type=\"checkbox\" id=\"mobile-nav\" name=\"mobile-nav\" />');
        $('.minimal-menu').find('ul.sub-menu').parent().addClass('submenu');
        $('.minimal-menu').find('div.menu-wrapper').parent().addClass('megamenu submenu');
        $('.minimal-menu').find('ul.sub-menu').before('<input class=\"show-submenu\" type=\"checkbox\" />');
        $('.minimal-menu').find('div.menu-wrapper').before('<input class=\"show-submenu\" type=\"checkbox\" />');
        /* =================================
        ===  Fancy Select                 ====
        =================================== */
        if ($('.custom-select').length) {
            var mySelect = $('.custom-select');
            mySelect.fancySelect().on('change.fs', function() {
                var raw_val = $(this).parent().find('.options').find('.selected').attr('data-raw-value');
                $(this).find('option').removeAttr('selected').filter('[value=' + raw_val + ']').attr('selected', true);
            }
            );
        }
        
        /* =================================
        ===  Fancy Box                 ====
        =================================== */
        if ($('.fancybox').length) {
            $(".fancybox").fancybox();
        }
        
        /* =================================
        ===  Slideshow                 ====
        =================================== */
        if ($('#slideshow1').length) {
            $('#slideshow1').allinone_bannerRotator( {
                skin: 'universal', width:1920, height:700, responsive:true, thumbsWrapperMarginBottom:35, showCircleTimer:false, showNavArrows:false, autoHideBottomNav:false, showPreviewThumbs:false
            }
            );
        }
        if ($('#slideshow2').length) {
            $('#slideshow2').allinone_bannerRotator( {
                skin: 'universal', width:1170, height:570, responsive:true, responsiveRelativeToBrowser: false, showCircleTimer:false, showNavArrows:true, showBottomNav:false, showPreviewThumbs:false, effectDuration: 0, defaultEffect: 'fade'
            }
            );
        }
        if ($('#slideshow3').length) {
            $('#slideshow3').allinone_bannerRotator( {
                skin: 'universal', width: 1170, height: 550, responsive:true, responsiveRelativeToBrowser: false, thumbsWrapperMarginBottom:35, showCircleTimer:false, showNavArrows:false, autoHideBottomNav:false, showPreviewThumbs:false
            }
            );
        }
        if ($('#slideshow4').length) {
            $('#slideshow4').allinone_bannerRotator( {
                skin: 'universal', width: 850, height: 500, responsive:true, responsiveRelativeToBrowser: false, thumbsWrapperMarginBottom:35, showCircleTimer:false, showNavArrows:false, autoHideBottomNav:false, showPreviewThumbs:false
            }
            );
        }
        if ($('#slideshow5').length) {
            $('#slideshow5').allinone_bannerRotator( {
                skin: 'universal', width: 1170, height: 500, responsive:true, responsiveRelativeToBrowser: false, thumbsWrapperMarginBottom:35, showCircleTimer:false, showNavArrows:false, autoHideBottomNav:false, showPreviewThumbs:false
            }
            );
        }
        if ($('#slideshow6').length) {
            $('#slideshow6').allinone_bannerRotator( {
                skin: 'universal', width:1920, height:600, responsive:true, thumbsWrapperMarginBottom:35, showCircleTimer:false, showNavArrows:false, autoHideBottomNav:false, showPreviewThumbs:false
            }
            );
        }
        if ($('#slideshow7').length) {
            $('#slideshow7').allinone_bannerRotator( {
                skin: 'universal', width:1920, height:1050, responsive:true, thumbsWrapperMarginBottom:35, showCircleTimer:false, showNavArrows:false, autoHideBottomNav:false, showPreviewThumbs:false
            }
            );
        }
        if ($('#slideshow8').length) {
            $('#slideshow8').allinone_bannerRotator( {
                skin: 'universal', width:1920, height:1000, responsive:true, thumbsWrapperMarginBottom:35, showCircleTimer:false, showNavArrows:false, autoHideBottomNav:false, showPreviewThumbs:false
            }
            );
        }
        if ($('.post-slider').length) {
            $('.post-slider').allinone_bannerRotator( {
                skin: 'universal', width: 870, height: 580, responsive:true, responsiveRelativeToBrowser: false, showBottomNav:false, showCircleTimer:false, autoHideNavArrows:false
            }
            );
        }

        /* =================================
        ===  OwlCarousel                 ====
        =================================== */
        $(window).on('load', function() {
            var tabHeading_1 = $("#carousel-1 .tab-heading span");
            tabHeading_1.first().addClass('active');
            var owl1 = $('#carousel-1 .box-content');
            owl1.owlCarousel( {
                loop: true, items:1, dots:false, autoHeight:true, rtl:false
            }
            );
            owl1.on('changed.owl.carousel', function(e) {
                var tabIdx = e.item.index % e.item.count - 2;
                tabHeading_1
                .removeClass('active')
                .eq(tabIdx)
                .addClass('active');
            }
            );
            tabHeading_1.on('touchstart mousedown', function(e) {
                e.preventDefault();
                owl1.trigger('to.owl.carousel', [$(this).index(), 300, true]);
            }
            );

            var owl2 = $('#carousel-2 .box-content');
            owl2.owlCarousel( {
                loop: true, items:1, dots:false, autoHeight:true, rtl:false, smartSpeed: 1500
            }
            );
            $("#carousel-2 .next").click(function() {
                owl2.trigger('next.owl.carousel');
            }
            );
            $("#carousel-2 .prev").click(function() {
                owl2.trigger('prev.owl.carousel');
            }
            );

            $('#carousel-3').owlCarousel({
                loop:true,
                margin:10,
                autoplay:true,
                autoplayTimeout:3000,
                autoplayHoverPause:true,
                navigation: false,
                pagination: true,
                responsive:{
                    0:{
                        items:1
                    },
                    480:{
                        items:2
                    },
                    768:{
                        items:3
                    },
                    992:{
                        items:4
                    },
                    1200:{
                        items:5
                    }
                }
            });

            $('#carousel-4').owlCarousel({
                loop:true,
                items:1,
                navigation: false,
                pagination: true,
                dotsSpeed: 800
            });

            var owl5 = $('#carousel-5 .box-content');
            owl5.owlCarousel( {
                loop: true, items:1, dots:false, autoHeight:true, rtl:false, smartSpeed: 1500
            }
            );
            $("#carousel-5 .next").click(function() {
                owl5.trigger('next.owl.carousel');
            }
            );
            $("#carousel-5 .prev").click(function() {
                owl5.trigger('prev.owl.carousel');
            }
            );

            var tabHeading_6 = $("#carousel-6 .tab-heading span");
            tabHeading_6.first().addClass('active');
            var owl6 = $('#carousel-6 .box-content');
            owl6.owlCarousel( {
                loop: true, items:1, dots:false, autoHeight:true, rtl:false, smartSpeed: 1500
            }
            );
            $("#carousel-6 .next").click(function() {
                owl6.trigger('next.owl.carousel');
            }
            );
            $("#carousel-6 .prev").click(function() {
                owl6.trigger('prev.owl.carousel');
            }
            );
            owl6.on('changed.owl.carousel', function(e) {
                var tabIdx = e.item.index % e.item.count - 2;
                tabHeading_6
                .removeClass('active')
                .eq(tabIdx)
                .addClass('active');
            }
            );
            tabHeading_6.on('touchstart mousedown', function(e) {
                e.preventDefault();
                owl6.trigger('to.owl.carousel', [$(this).index(), 300, true]);
            }
            );

            var owl7 = $('#carousel-7 .box-content');
            owl7.owlCarousel( {
                loop: true, items:1, dots:false, autoHeight:true, rtl:false, smartSpeed: 1500
            }
            );
            $("#carousel-7 .next").click(function() {
                owl7.trigger('next.owl.carousel');
            }
            );
            $("#carousel-7 .prev").click(function() {
                owl7.trigger('prev.owl.carousel');
            }
            );

            $('#carousel-8').owlCarousel({
                loop:true,
                items:1,
                navigation: false,
                pagination: true,
                dotsSpeed: 1000
            });

            var owl9 = $('#carousel-9 .box-content');
            owl9.owlCarousel( {
                loop: true, items:1, dots:false, autoHeight:true, rtl:false, smartSpeed: 1500
            }
            );
            $("#carousel-9 .next").click(function() {
                owl9.trigger('next.owl.carousel');
            }
            );
            $("#carousel-9 .prev").click(function() {
                owl9.trigger('prev.owl.carousel');
            }
            );

            var owl10 = $('#carousel-10 .box-content');
            owl10.owlCarousel({
                loop:true,
                margin:10,
                autoplay:true,
                autoplayTimeout:3000,
                autoplayHoverPause:true,
                smartSpeed: 1500,
                dots:false,
                responsive:{
                    0:{
                        items:1
                    },
                    480:{
                        items:2
                    },
                    768:{
                        items:3
                    },
                    992:{
                        items:4
                    },
                    1200:{
                        items:5
                    }
                }
            });
            $("#carousel-10 .next").click(function() {
                owl10.trigger('next.owl.carousel');
            }
            );
            $("#carousel-10 .prev").click(function() {
                owl10.trigger('prev.owl.carousel');
            }
            );

            var owl11 = $('#carousel-11 .box-content');
            owl11.owlCarousel( {
                loop: true, items:1, dots:false, autoHeight:true, rtl:false, smartSpeed: 1500
            }
            );
            $("#carousel-11 .next").click(function() {
                owl11.trigger('next.owl.carousel');
            }
            );
            $("#carousel-11 .prev").click(function() {
                owl11.trigger('prev.owl.carousel');
            }
            );

            var related_products = $('.related-products .box-content');
            related_products.owlCarousel( {
                loop: true, items:1, dots:false, autoHeight:true, rtl:false, smartSpeed: 1500
            }
            );
            $(".related-products .next").click(function() {
                related_products.trigger('next.owl.carousel');
            }
            );
            $(".related-products .prev").click(function() {
                related_products.trigger('prev.owl.carousel');
            }
            );

            var product_showcase_thumb = $('.gallery .previews .box-content');
            product_showcase_thumb.owlCarousel({
                margin: 0,
                smartSpeed: 1000,
                dots:false,
                responsive:{
                    0:{
                        items:3
                    },
                    480:{
                        items:4
                    },
                    768:{
                        items:5
                    },
                    1200:{
                        items:6
                    }
                }
            });
            $(".gallery .previews .next").click(function() {
                product_showcase_thumb.trigger('next.owl.carousel');
            }
            );
            $(".gallery .previews .prev").click(function() {
                product_showcase_thumb.trigger('prev.owl.carousel');
            }
            );
        }
        );
        /* =================================
        ===  Tooltip                 ====
        =================================== */
        $('[data-toggle="tooltip"]').tooltip( {
            container: 'body'
        }
        );
        /* =================================
        ===  Countdown                 ====
        =================================== */
        if($('.countdown').length) {
            $('.countdown').each(function() {
                var $this = $(this), finalDate = $(this).attr('data-time');
                $this.countdown(finalDate, function(event) {
                    $this.html(event.strftime(''
                    + '<span class="countdown-section"><span class="countdown-time">%D</span> <span class="countdown-label">DAY</span></span>'
                    + '<span class="countdown-section"><span class="countdown-time">%H</span> <span class="countdown-label">HOUR</span></span>'
                    + '<span class="countdown-section"><span class="countdown-time">%M</span> <span class="countdown-label">MIN</span></span>'
                    + '<span class="countdown-section"><span class="countdown-time">%S</span> <span class="countdown-label">SEC</span></span>'));
                }
                );
            }
            );
        }
        /* =================================
        ===  mixItUp                 ====
        =================================== */
        if ($('.list-works').length) {
            $('.list-works').mixItUp();
        }

        /* =================================
        ===  Progress Bar                 ====
        =================================== */
        if ($('.progress-bar').length) {
            $('.progress-bar').waypoint(function() {
                $('.progress-bar').each(function() {
                    $(this).animate({
                        width: $(this).attr('aria-valuenow') + "%"
                    }, 400);
                });
            }, {
                triggerOnce: true,
                offset: 'bottom-in-view'
            });
        }

        /* =================================
         ===  Google Map                 ====
         =================================== */
        if ($('#map').length) {
            var map = new GMaps({
                el: '#map', lat: -12.043333, lng: -77.028333
            }
            );
            map.addMarker({
                lat: -12.042, lng: -77.028333, title: 'Marker with InfoWindow', infoWindow: {
                    content: '<h4>Zorka</h4>'
                }
            }
            );
        }

        /* =================================
         ===  Responsive Map                 ====
         =================================== */
        if ($('.vertical-tabs').length) {
            $('.vertical-tabs').easyResponsiveTabs({
                type: 'vertical',
                width: 'auto',
                fit: true,
                closed: 'accordion',
                tabidentify: 'hor_1'
            });
        }

        /* =================================
         ===  Price Slider                 ====
         =================================== */
        if ($("#price-slider").length) {
            $("#price-slider").slider({
                range: true, min: 1, max: 100, values: [12, 60], slide: function(event, ui) {
                    $("#amount").val("$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ]);
                }
            }
            );
            $("#amount").val("$" + $("#price-slider").slider("values", 0) +
                    " - $" + $("#price-slider").slider("values", 1));
        }

        /* =================================
         ===  Quantity Input                 ====
         =================================== */
        $('.minus-btn').click(function(e) {
            e.preventDefault();
            var input = $(this).parent().find('input');
            var currentVal = parseInt(input.val());
            if (currentVal > 1) {
                input.val(currentVal - 1).change();
            }
        }
        );
        $('.plus-btn').click(function(e) {
            e.preventDefault();
            var input = $(this).parent().find('input');
            var currentVal = parseInt(input.val());
            input.val(currentVal + 1).change();
        }
        );
        $('.quantity input').focusin(function() {
            $(this).data('oldValue', $(this).val());
        }
        );

        /* =================================
         ===  Product Showcase                 ====
         =================================== */
        if ($('#product-showcase').length) {
            $('.previews img').click(function(e) {
                e.preventDefault();
                var largeImage = $(this).attr('data-full');
                $('.selected').removeClass();
                $(this).addClass('selected');
                $('.full img').hide();
                $('.full img').attr('src', largeImage);
                $('.full img').show();
            }
            );
            $('.full').click(function(e) {
                e.preventDefault();
                var modalImage = $(this).find('img').attr('src');
                $.fancybox.open(modalImage);
            }
            );
        }

        /* =================================
         ===  Star Rating                 ====
         =================================== */
        if ($('.review-star').length) {
            $('.review-star').raty({
                half: true,
                score: function() {
                    return $(this).attr('data-score');
                }
            }
            );
        }
        if ($('.review-star-read').length) {
            $('.review-star-read').raty({
                readOnly: true,
                score: function() {
                    return $(this).attr('data-score');
                }
            }
            );
        }

        /* =================================
         ===  Different address checkbox                 ====
         =================================== */
        if($(".dif-add-chb").length) {
            $('.dif-add-chb').attr("checked",true);
            $('.dif-add-chb').click(function() {
                $(".wrap-different-address").slideToggle(this.checked);
            });
        }

        /* =================================
         ===  Payment methods                 ====
         =================================== */
        $('.payment-methods').on( "click", ".responsive-accordion-head", function() {
            // $('.payment-methods input[type="radio"]').attr('checked', false);
            if($(this).hasClass('active')) {
                console.log($(this).text());
                var radios = $(this).find('input[type="radio"]');
                if(radios.is(':checked') === false) {
                    radios.prop('checked', true);
                }
            }
        });

        /* =================================
         ===  Pie Progress                 ====
         =================================== */
        if($(".pie_progress").length) {
            $('.pie_progress').asPieProgress({
                namespace: 'pie_progress'
            });
            $('.pie_progress').waypoint(function() {
                $('.pie_progress').asPieProgress('start');
            }, {
                triggerOnce: true,
                offset: 'bottom-in-view'
            });
            
        }

        /* =================================
         ===  Counter Number                 ====
         =================================== */
        function counter_number(variable) {
            if($(variable).length) {
                $(variable).waypoint(function() {
                    $({countNum: $(variable).text()}).animate({countNum: $(variable).attr('data-counter')}, {
                        duration: 2000,
                        easing:'linear',
                        step: function() {
                            $(variable).text(Math.floor(this.countNum));
                        },
                        complete: function() {
                            $(variable).text(this.countNum);
                        }
                    });
                }, {
                    triggerOnce: true,
                    offset: 'bottom-in-view'
                });
            }
        }
        counter_number('.counter-1');
        counter_number('.counter-2');
        counter_number('.counter-3');
        counter_number('.counter-4');

        /* =================================
         ===  Send Email                 ====
         =================================== */
        $('.contact-form').submit(function() {
            $('.contact-content .form-note').html('<br /><div class="alert alert-info" role="alert">Processing...</div>');
            $(".contact-form input").prop('readonly', true);
            var formInput = $(this).serialize();
            $.post($(this).attr('action'), formInput, function(data) {
                if (data === 'Message has been sent') {
                    $('.contact-content .form-note').html('<br /><div class="alert alert-success" role="alert">Successfull!</div>');
                    $('.contact-form').slideUp();
                } else {
                    $('.contact-content .form-note').html(data);
                    $(".contact-form input").prop('readonly', false);
                }
            });
            return false;
        });
        $('.subscribe-form').submit(function() {
            $('.subscribe .form-note, .subscribe-box .form-note').html('<br /><div class="alert alert-info" role="alert">Processing...</div>');
            $(".subscribe-form input").prop('readonly', true);
            var formInput = $(this).serialize();
            $.post($(this).attr('action'), formInput, function(data) {
                if (data === 'Message has been sent') {
                    $('.subscribe .form-note, .subscribe-box .form-note').html('<br /><div class="alert alert-success" role="alert">Successfull!</div>');
                    $('.subscribe-form').slideUp();
                } else {
                    $('.subscribe .form-note, .subscribe-box .form-note').html(data);
                    $(".subscribe-form input").prop('readonly', false);
                }
            });
            return false;
        });

        
    }
    );
}
)(window.jQuery);