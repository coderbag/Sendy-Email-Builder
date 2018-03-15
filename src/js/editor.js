// Load jQuery & jQuery UI
import $ from 'jquery';
window.$ = window.jQuery = $;

import 'jquery-ui/ui/effects/effect-slide';
import 'jquery-ui/ui/widgets/draggable.js';
import 'jquery-ui/ui/widgets/sortable.js';

import MediumEditor from 'medium-editor';
window.MediumEditor = MediumEditor;

import CodeMirror from 'codemirror';
window.CodeMirror = CodeMirror;
require('codemirror/mode/xml/xml.js');

// Load NPM modules
import swal from 'sweetalert';
window.swal = swal;

require('@claviska/jquery-minicolors');
require('@fancyapps/fancybox');

// Load custom modules
require('../libs/jquery.htmlClean.js');
require('../libs/uploader/slim.jquery.js');


(function($) {
    "use strict";

    // Make a global event emitter
    window.top.jsEmailBuilderEmitter = require('./_emitter.js');
    var emitter = window.top.jsEmailBuilderEmitter;

    // Navigation & Sidebar
    var Nav = require('./_nav.js');
    // Theme
    var Theme = require('./_theme.js');
    // Module
    var Module = require('./_module.js');
    // Content Editor
    var ContentEditor = require('./_content_editor.js');
    // Utils
    var Utils = require('./_utils.js');


    // Default options for jQuery plugin
    var defaults = {
        theme: 'default'
    }

    // jQuery plugin
    $.EmailBuilder = function (options) {
        var settings = $.extend({}, defaults, options);

        // Allow access to Email Builder events through event emitter
        this.emitter = emitter;

        // Allow access to custom classes
        this.Nav = Nav;
        this.Theme = Theme;
        this.Module = Module;
        this.Module = Module;
        this.ContentEditor = ContentEditor;
        this.Utils = Utils;

        // Events
        this.emitter.on('init', function () {
            emitter.emit('theme_load', settings.theme);
            $('[data-type="editor"]').on('DOMSubtreeModified', function(){
                emitter.emit('update_template');
            });
        });

        this.emitter.on('switch_theme', function () {
            emitter.emit('theme_load', settings.theme);
        });

        // Public Methods
        this.init = function () {
            this.emitter.emit('init');
        };

        this.switchTheme = function (themeName) {
            settings.theme = themeName;
            this.emitter.emit('switch_theme');
        };
    }
}(jQuery));