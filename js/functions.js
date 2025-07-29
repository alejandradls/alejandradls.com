/*
 * Theme functions file.
 *
 */

"use strict";

// Simple way of determining if user is using a mouse.
var screenHasMouse = false;
function themeMouseMove() { 
	screenHasMouse = true;
}
function themeTouchStart() {
	jQuery( window ).off( "mousemove.papaia" );
	screenHasMouse = false;
	setTimeout(function() {
		jQuery( window ).on( "mousemove.papaia", themeMouseMove );
	}, 250);
}
if ( ! navigator.userAgent.match( /(iPad|iPhone|iPod)/g ) ) {
	jQuery( window ).on( "touchstart.papaia", themeTouchStart ).on( "mousemove.papaia", themeMouseMove );
	if ( window.navigator.msPointerEnabled ) {
		document.addEventListener( "MSPointerDown", themeTouchStart, false );
	}
}

jQuery( function() {

	// Handle both mouse hover and touch events for traditional menu + mobile hamburger.
	jQuery( ".site-menu-toggle" ).on( "click.papaia", function( e ) {
		jQuery( "body" ).toggleClass( "mobile-menu-opened" );
		e.stopPropagation();
		e.preventDefault();
	});

	jQuery( ".menu-list .menu-expand" ).on( "click.papaia", function ( e ) {
		var $parent = jQuery( this ).parent();
		$parent.toggleClass( "collapse" );
		e.preventDefault();
	});
	jQuery( ".menu-list .current-menu-parent" ).addClass( "collapse" );

	jQuery( document ).on({
		mouseenter: function() {
			if ( screenHasMouse ) {
				jQuery( this ).addClass( "hover" );
			}
		},
		mouseleave: function() {
			if ( screenHasMouse ) {
				jQuery( this ).removeClass( "hover" );
			}
		}
	}, ".menu-list li:not(.menu-item-search)" );

	if ( jQuery( "html" ).hasClass( "touchevents" ) ) {
		jQuery( ".menu-list li.menu-item-has-children > a" ).on( "click.papaia", function (e) {
			if ( ! screenHasMouse && ! window.navigator.msPointerEnabled && ! jQuery( ".site-menu-toggle" ).is( ":visible" ) ) {
				var $parent = jQuery( this ).parent();
				if ( ! $parent.parents( ".hover" ).length ) {
					jQuery( ".menu-list li.menu-item-has-children" ).not( $parent ).removeClass( "hover" );
				}
				$parent.toggleClass( "hover" );
				e.preventDefault();
			}
		});

		// Toggle visibility of dropdowns if touched outside the menu area.
		jQuery( document ).on( "click.papaia", function(e) {
			if ( jQuery( e.target ).parents( "#site-menu" ).length > 0 ) {
				return;
			}
			jQuery( ".menu-list li.menu-item-has-children, .menu-list li.menu-item-search" ).removeClass( "hover" );
		});
	} else {

		// Toggle visibility of dropdowns on keyboard focus events.
		jQuery( ".menu-list li > a, .site-title a" ).on( "focus.papaia blur.papaia", function(e) {
			if ( screenHasMouse && ! jQuery( "#top .site-menu-toggle" ).is( ":visible" ) ) {
				var $parent = jQuery( this ).parent();
				if ( ! $parent.parents( ".hover" ).length ) {
					jQuery( ".menu-list li.menu-item-has-children.hover" ).not( $parent ).removeClass( "hover" );
				}
				if ( $parent.hasClass( "menu-item-has-children" ) ) {
					$parent.addClass( "hover" );
				}
				e.preventDefault();
			}
		});
	}

	jQuery( document ).on( "click", ".tabs > ul a", function ( e ) {
		e.preventDefault();
		if ( jQuery( this ).hasClass( "active" ) ) {
			return;
		}
		var $parent = jQuery( this ).parent();
		$parent.siblings( "li" ).each( function() {
			jQuery( "a", this ).removeClass( "active" ).attr( "aria-selected", "false" );
			jQuery( jQuery( this ).find( "a" ).attr( "href" ) ).removeClass( "active" );
		});
		jQuery( this ).addClass( "active" ).attr( "aria-selected", "true" );
		jQuery( jQuery( this ).attr( "href" ) ).addClass( "active" );
	});

	// Scroll top top functionality.
	var $goToTopLink = jQuery( "#go-to-top-link" ).on( "click.papaia", function(e) {
		jQuery( "html, body" ).animate({
			scrollTop: 0
		}, {
			duration: 500,
			easing: "swing"
		} );
		e.stopPropagation();
		e.preventDefault();
	});

	// Toggle go-to-top visibility and avoid using any event on mobile devices (for better performance).
	if ( $goToTopLink.length > 0 ) {
		var goToTopLimit = 100;
		jQuery(window).on( "resize.to-top-papaia", function() {
			if ( window.innerWidth >= 768 ) {
				goToTopLimit = jQuery( "#top" ).height() - jQuery( "#secondary-menu" ).height();
				if ( ! $goToTopLink.hasClass( "watching" ) ) {
					$goToTopLink.addClass( "watching" );
					jQuery(window).on( "scroll.to-top-papaia", function() {
						$goToTopLink.toggleClass( "active", jQuery( window ).scrollTop() > goToTopLimit );
					} );
				}
			} else {
				if ( $goToTopLink.hasClass( "watching" ) ) {
					$goToTopLink.removeClass( "watching" );
					jQuery( window ).unbind( "scroll.to-top-papaia" );
				}
			}
		}).resize();
	}

	var secondary_menu_sticky_limit = jQuery( "#content" ).height() - jQuery( "#secondary-menu" ).height() - 30;
	jQuery( window ).on( "scroll.papaia", function() {
		if ( window.innerWidth >= 768 ) {
			if ( jQuery( window ).scrollTop() > secondary_menu_sticky_limit ) {
				$( "#secondary-menu" ).removeClass( "sticky" );
			} else {
				$( "#secondary-menu" ).addClass( "sticky" );
			}
		}
	}).scroll();

	var full_height_container = jQuery( ".welcome #content .inner" );
	jQuery( window ).on( "resize.papaia", function() {
		if ( full_height_container.length > 0 ) {
			center_image_in_container( full_height_container );
		}
		if ( window.innerWidth >= 768 ) {
			secondary_menu_sticky_limit = jQuery( "#content" ).height() - jQuery( "#secondary-menu" ).height() / 2 - 30;
		}
	}).resize();

	jQuery(window).on("beforeunload", function() {
		jQuery("body").addClass("before-unload");
	});
	
	jQuery(window).on("pageshow", function(event) {
		if (event.originalEvent.persisted) {
			jQuery("body").removeClass("before-unload");
		}
	});

	// determine if browser supports fixed positioning
	setTimeout(
		function () {
			var container = document.body;
			if ( document.createElement && container && container.appendChild && container.removeChild ) {
				var el = document.createElement( "div" );
				if ( ! el.getBoundingClientRect ) {
					return;
				}
				el.innerHTML = "x";
				el.style.cssText = "position:fixed;top:100px;";
				container.appendChild( el );
				var originalHeight = container.style.height,
						originalScrollTop = container.scrollTop,
						extraTop  = document.documentElement.getBoundingClientRect().top;
				extraTop = extraTop > 0 ? extraTop : 0;
				container.style.height = "3000px";
				container.scrollTop = 500;
				var elementTop = el.getBoundingClientRect().top;
				container.style.height = originalHeight;
				var isSupported = (elementTop - extraTop) === 100;
				container.removeChild( el );
				container.scrollTop = originalScrollTop;
				if ( ! isSupported ) {
					jQuery( "html" ).addClass( "no-position-fixed" );
				}
			}
		}, 
		20
	);

});

function center_image_in_container( $container ) {
	var container_width = $container.width(),
		container_height = $container.height(),
		container_aspect_ratio = container_height / container_width,
		container_image_align = "center center";

	if ( $container.data( "image-align" ) ) {
		container_image_align = $container.data( "image-align" );
	}
	jQuery( "img", $container ).each(function() {
		var img = jQuery( this ),
			img_width = parseInt( img.attr( "width" ) ),
			img_height = parseInt( img.attr( "height" ) ),
			img_aspect_ratio = img_height / img_width,
			final_top = "auto",
			final_left = "auto",
			final_bottom = "auto",
			final_right = "auto",
			final_width,
			final_height,
			align_image = container_image_align;
		if ( container_aspect_ratio > img_aspect_ratio ) {
			final_width = container_height / img_aspect_ratio;
			final_height = container_height;
		} else {
			final_width = container_width;
			final_height = container_width * img_aspect_ratio;
		}
		if ( jQuery( this ).parent().data( "image-align" ) ) {
			align_image = jQuery( this ).parent().data( "image-align" );
		}
		if (align_image === "left top" || align_image === "center top" || align_image === "right top") {
			final_top = 0;
		}
		if (align_image === "left center" || align_image === "right center" || align_image === "center center") {
			final_top = ( container_height - final_height ) / 2;
		}
		if (align_image === "left top" || align_image === "left center" || align_image === "left bottom") {
			final_left = 0;
		}
		if (align_image === "center top" || align_image === "center center" || align_image === "center bottom") {
			final_left = ( container_width - final_width ) / 2;
		}
		if (align_image === "right top" || align_image === "right center" || align_image === "right bottom") {
			final_right = 0;
		}
		if (align_image === "left bottom" || align_image === "center bottom" || align_image === "right bottom") {
			final_bottom = 0;
		}

		img.css({
			top    : final_top,
			left   : final_left,
			right  : final_right,
			bottom : final_bottom,
			width  : final_width,
			height : final_height
		});
	});
}

// Drawing logo animation ***

// Obtener referencias del SVG
var path = document.querySelector('.cls-1'); // Línea del logo
var background = document.querySelector('.cls-2'); // Fondo rojo

// Obtener la longitud del trazo del logo
var pathLength = path.getTotalLength();

// Configurar el trazo inicial para que el logo inicie completamente dibujado
path.style.strokeDasharray = pathLength + ' ' + pathLength;
path.style.strokeDashoffset = 0; // El logo inicia visible

// Agregar la transición de fade-in al fondo rojo
background.style.transition = "opacity 0.8s ease-in-out"; 

// Manejar el scroll
window.addEventListener("scroll", function() {
    var scrollTop = document.documentElement.scrollTop + document.body.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrollPercentage = scrollTop / scrollHeight;

    // Desdibujar progresivamente el logo en reversa
    path.style.strokeDashoffset = pathLength * scrollPercentage;

    // Hacer que el fondo rojo empiece a aparecer cuando el logo se haya desdibujado un 80%
    if (scrollPercentage >= 0.8) { 
        background.style.opacity = 1; // Fade-in del fondo rojo
    } else {
        background.style.opacity = 0; // Desaparece si el usuario sube
    }
});


document.addEventListener("DOMContentLoaded", function () {
	// Detecta el idioma desde el atributo <html lang="">
	const lang = document.documentElement.lang || 'en'; // fallback a 'en' si no hay lang definido

	// Crea y carga el script de reCAPTCHA con el idioma correcto
	const script = document.createElement("script");
	script.src = `https://www.google.com/recaptcha/api.js?hl=${lang}`;
	script.async = true;
	script.defer = true;
	document.head.appendChild(script);
});

//Content input animations

document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.fade-in-section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;

        // Calcular índice entre sus hermanos con la misma clase para el delay
        const siblings = [...el.parentElement.querySelectorAll('.fade-in-section')];
        const index = siblings.indexOf(el);
        el.style.transitionDelay = `${index * 0.2}s`;

        el.classList.add('visible');
        observer.unobserve(el); // Solo animar una vez
      }
    });
  });

  animatedElements.forEach(el => observer.observe(el));
});

