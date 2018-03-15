'use strict';

// Global Event Emitter
var emitter = window.top.jsEmailBuilderEmitter;

// Navigation & Sidebar
var Nav = {

    // Init
    init: function(){
        emitter.emit('show_nav');
        this.bindAccordion();
        this.bindSidebar();
    },

    // Show Modules on Load
    showModulesSidebar: function () {
        // Show modules sidebar
        var target = $('[data-type="nav"] [data-target="modules"]').get(0); // Get DOM element
        this.toggleSidebar(target);

        // Make modules menu item active
        var modulesNav = $('[data-type="nav"] [data-nav="has-child"]').find('[data-target="modules"]');
        modulesNav.closest('[data-type="subnav"]').slideDown(200, function () {
            modulesNav.addClass('active');
        });
    },

    // Accordion navigation
    bindAccordion: function () {
        $('[data-nav="has-child"]').on('click', function (event) {
            var target = event.currentTarget;

            // Exit if there is no child items
            if (!$(target).data('nav') == 'has-child') {
                return false;
            }

            // Exit if item is already active
            if ($(target).hasClass('active')) {
                return false;
            }

            // Hide previous items
            $('[data-type="nav"]').find('[data-type="subnav"]').slideUp(200, function () {
                $('[data-nav="has-child"]').removeClass('active');
            });

            // Show selected item
            $(target).find('[data-type="subnav"]').slideDown(200, function () {
                $(target).addClass('active');
            });
        });
    },

    // Second sidebar actions
    bindSidebar: function () {
        var self = this;
        $('[data-type="nav"] [data-target]').on('click', function (event) {
            var
                // Reference to event listener target
                target = event.currentTarget;
                self.toggleSidebar(target);
        });
    },

    toggleSidebar: function(target){

        var relatedModule = $(target).data('target');

        $('[data-type="sidebar-second"]').effect('slide', { direction: 'left', mode: 'hide' }, 500, function () {
            $('[data-type="nav"] [data-target]').removeClass('active');
            $(target).addClass('active');
            // Hide the content of the sidebar
            $('[data-type="sidebar-second"]').find('[data-sidebar]').hide();
        }).promise().done(function(){
            // Show the content of the sidebar
            $('[data-type="sidebar-second"]').find('[data-sidebar="' + relatedModule + '"]').show();
            // Show the sidebar itself
            $('[data-type="sidebar-second"]').effect('slide', { direction: 'left', mode: 'show' }, 500);
        });
    }

};

emitter.on('init', function () {
    Nav.init();
    // Show Modules Sidebar
    Nav.showModulesSidebar();
});

emitter.on('module_change', function () {
    // Show the sidebar
    var target = $('[data-type="nav"] [data-target="styles"]').get(0); // Get DOM element
    Nav.toggleSidebar(target);

});

// Export Nav object
module.exports = Nav;


