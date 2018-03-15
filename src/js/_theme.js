'use strict';
// Global Event Emitter
var emitter = window.top.jsEmailBuilderEmitter;

// Current theme
var Theme = {

    // Private attributes
    // Shouldn't be called directly!
    name: '', // Theme name (slug)
    path: '', // Theme path
    template: {}, // Theme template
    modulesHTML: {}, // Theme modules module_uid => module_html, used in getModuleHTML(uid) method
    // Private methods
    renderModulePreview: function (uid, title, thumb) {
        return '<div class="module-item" data-module="' + uid + '"><div class="module-thumb"><img src="' + thumb + '"></div><div class="module-title">' + title + '</div></div>';
    },
    // Public methods
    load: function (themeName) { // Load the theme
        var self = this;
        self.name = themeName;
        self.path = 'templates/' + self.name;
        return $.getJSON(self.getPath() + '/template.json', function (data) {
            self.template = data;
            var fonts = self.getFonts();
            $("head").append(fonts);
            $.each(self.template.modules, function (index, module) {
                self.modulesHTML[module.uid] = module.html;
            });
        });
    },
    getPath: function () { // Return theme path / string
        return this.path;
    },
    getName: function () { // Return theme name (slug) / string
        return this.name;
    },
    getTitle: function () { // Return theme title / string
        return this.template.template;
    },
    getTemplate: function () { // Return theme template / object
        return this.template;
    },
    getModules: function () { // Return the list of theme modules / object
        return this.template.modules;
    },
    getModuleHTML: function (uid) { // Return the module HTML
        return this.modulesHTML[uid];
    },
    getModulesPreview: function () { // Return ready-to-display list of theme modules / string
        var self = this;
        var path = self.getPath();
        var modules = self.getModules();
        var modulesPreview = '';
        $.each(modules, function (index, module) {
            var moduleThumb = path + '/' + module.thumb;
            modulesPreview += self.renderModulePreview(module.uid, module.title, moduleThumb);
        });
        emitter.emit('modules_preview');
        return modulesPreview;
    },
    getHeader: function () { // Return theme header / string
        return this.template.header;
    },
    getFooter: function () { // Return theme footer / string
        return this.template.footer;
    },
    getFonts: function () {
        var fontsHTML = '';
        if('fonts' in this.template) {
            var fonts = this.template.fonts;
            $.each(fonts, function (index, font) {
                fontsHTML += "<link href='" + font + "' rel='stylesheet' type='text/css'>";
            });
        }
        return fontsHTML;
    },
    actionModuleDrag: function () {
        $('[data-type="modules-container"] .module-item').draggable({
            appendTo: "body",
            helper: "clone",
            connectToSortable: '[data-type="editor"]',
            scroll: false,
            zIndex: 1000,
            delay: 100,
            revert: 'invalid',

        });
    },

    actionModuleAdd: function () {
        var self = this;

        $('[data-type="editor"]').sortable({
            handle: '.btn-module-sort',
            items: '.module-container',
            placeholder: 'module-placeholder',
            axis: 'y',
            opacity: 0.9,
            scroll: false,
            zIndex: 1000,
            refreshPositions: true,
            beforeStop: function (event, ui) {
                // Editor.moduleControlsEvent();
                var uid = ui.item.data('module');
                var moduleHTML = $('<div/>').html(self.getModuleHTML(uid));
                $('img', moduleHTML).each(function () {
                    var host = config.host;
                    var theme = self.name;
                    var image = $(this).attr('src');
                    var imagePath = host + '/' + 'templates' + '/' + theme + '/' + image;
                    $(this).attr('src', imagePath);
                });
                $(ui.item).replaceWith('<div class="module-container" data-module="' + uid + '">' + moduleHTML.html() + '</div>');


            },
            receive: function (event, ui) {

                //   Editor.moduleControlsEvent();

            },
            activate: function (event, ui) {
                // Show only the thumbnail when dragging module
                $(ui.helper).html($('.module-thumb', ui.item).html());
            },
            start: function (event, ui) {
            },
            update: function (event, ui) {
                emitter.emit('module_added');
            },
        });
    }
};

emitter.on('theme_load', function (theme) {
    $.when(Theme.load(theme)).done(function (data) {
        emitter.emit('theme_loaded');

    });
});

emitter.on('theme_loaded', function () {
    var modulesPreview = Theme.getModulesPreview();
    // Render sidebar
    $('[data-type="modules-container"]').html(modulesPreview);

    Theme.actionModuleDrag();
    Theme.actionModuleAdd();
});

emitter.on('update_template', function () {
    // Update template HTML
    var templateHeader = Theme.getHeader();
    var templateFooter = Theme.getFooter();
    var curTemplateHTML = $('[data-type="editor"]').html();
    var templateHTML = templateHeader + curTemplateHTML + templateFooter;
    $('#templateHTML').val(btoa(templateHTML));
});



// Export Theme object
module.exports = Theme;


