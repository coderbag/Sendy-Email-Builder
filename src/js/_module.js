'use strict';

// Global Event Emitter
var emitter = window.top.jsEmailBuilderEmitter;

// Module
var Module = {

    confirm: function (title, callback) {
        swal({
                title: title,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                closeOnConfirm: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    swal("Deleted!", "The module has been deleted", "success");
                    callback();
                }
            });
    },
    current: null, // current selected module
    imageUploader: null,
    controls: '<div class="module-controls-container" style="top: 10px"><!-- Controls -->' +
    '<div class="btn-module btn-module-sort"><i class="icon-arrows"></i></div>' +
    '<div class="btn-module btn-module-duplicate"><i class="icon-files-o"></i></div>' +
    '<div class="btn-module btn-module-code" data-action="codeEditor"><i class="icon-code"></i></div>' +
    '<div class="btn-module btn-module-delete"><i class="icon-close"></i></div>' +
    '<!-- /Controls --></div>',
    codeControls: '<div class="module-code-controls">' +
    '<div class="btn-code-control btn-code-update"><i class="icon-check"></i></div>' +
    '<div class="btn-code-control btn-code-cancel"><i class="icon-close"></i></div>' +
    '</div>',
    options: {
        'color': [],
        'bgcolor': [],
        'bg': []
    },
    init: function () {
        var self = this;
        $('.module-container', '[data-type="editor"]').off('mouseenter mouseleave');

        $('.module-container', '[data-type="editor"]').on('mouseenter', function (event) {
            $(this).children('table').append(self.controls);
            self.eventsInit();
            $('[data-type="editor"]').sortable("refresh");
        });

        $('.module-container', '[data-type="editor"]').on('mouseleave', function (event) {
            $('.module-controls-container', this).remove();
        });

        $('.module-container').on('click', function (event) {

            var currentModule = this;
            if (self.current !== currentModule) {
                self.current = currentModule;
                emitter.emit('module_change');
            }
        });
    },
    rgb2hex: function (rgb) { // transform RGB to HEX
        if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }

        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    },
    eventsInit: function () {
        this.controlsDuplicate();
        this.controlsCode();
        this.controlsDelete();
    },

    controlsDuplicate: function () {
        var self = this;
        $('.btn-module-duplicate', '.module-controls-container').off('click');
        $('.btn-module-duplicate', '.module-controls-container').on('click', function (event) {
            var module = $(this).closest('.module-container');
            module.clone().insertAfter(module).find('.module-controls-container').remove();
            emitter.emit('update_template');
        });
    },

    controlsCode: function () {

        var self = this;

        $('.btn-module-code', '.module-controls-container').on('click', function (event) {

            var module = $(this).closest('.module-container');

            var tmpModule = $(module).clone();

            // FIX TinyMCE style changes
            $('.mce-content-body', tmpModule).each(function () {
                var cleanStyle = $(this).attr('style').replace(/"/g, "'");
                $(this).attr('style', cleanStyle);
            });

            tmpModule.find('.module-controls-container').remove();
            tmpModule.find('.mce-content-body').removeClass('mce-content-body');


            var moduleTmpHTML = $(tmpModule).html();

            moduleTmpHTML = moduleTmpHTML.replace(/<tbody>/g, '').replace(/<\/tbody>/g, '');

            moduleTmpHTML = moduleTmpHTML.replace(/(v:)+([\w])|(xmlns)+(:v)/gi, function vml_pre_replace(x) {
                return x.replace(/:/g, "_");
            });

            moduleTmpHTML = $.htmlClean(moduleTmpHTML, {
                format: true,
                allowEmpty: [["td"], ["link"], ["meta"], ["table"], ["tr"], ["p"], ["b"], ["i"], ["font"], ["div"], ["a"], ["li"], ["ul"]],
                formatIndent: 1,
                allowComments: true,
                allowedAttributes: [["id"], ["map"], ["area"], ["class"], ["border"], ["style"], ["width"], ["height"], ["bgcolor"], ["shape"], ["coords"], ["cellspacing"], ["cellpadding"], ["mso-table-lspace"], ["mso-table-rspace"], ["align"], ["bgcolor"], ["valign"], ["name"], ["data-module"], ["data-color"], ["data-size"], ["data-editable"], ["contenteditable"], ["href"], ["data-min"], ["data-max"], ["data-crop"], ["data-link-style"], ["data-link-size"], ["data-link-color"], ["data-bg"], ["data-bgcolor"], ["data-border-top-color"], ["data-border-bottom-color"], ["data-border-left-color"], ["data-border-right-color"], ["background"], ["itemscope"], ["itemtype"], ["itemprop"], ["datetime"], ["fill", ["v_rect"]], ["stroke", ["v_rect"]], ["type", ["v_fill"]], ["src", ["v_fill"]], ["color", ["v_fill"]], ["inset", ["v_textbox"]], ["xmlns_v", ["v_rect"]]]
            });

            moduleTmpHTML = moduleTmpHTML.replace(/(v_)+([\w])|(xmlns)+(_v)/gi, function vml_aft_replace(x) {
                return x.replace(/_/g, ":");
            });

            $('#code').remove();
            $(module).after(self.getCodeEditorHTML(moduleTmpHTML));

            var editor = CodeMirror.fromTextArea(document.getElementById('code'), {
                mode: "xml",
                htmlMode: true,
                lineNumbers: true,
                lineWrapping: true,
                styleActiveLine: true
            });

            editor.setSize('100%', '100%');
            editor.setOption('theme', 'tomorrow-night-bright');

            $('.btn-code-update').on('click', function (event) {
                var moduleNewHTML = editor.getValue();

                module.html(moduleNewHTML);
                $('.module-code-container', module.parent()).remove();
                emitter.emit('update_template');

            });
            $('.btn-code-cancel').on('click', function (event) {
                $('.module-code-container', module.parent()).remove();
            });
        });
    },

    controlsDelete: function () {
        var self = this;
        $('.btn-module-delete', '.module-controls-container').off('click');
        $('.btn-module-delete', '.module-controls-container').on('click', function (event) {
            var module = $(this).closest('.module-container');
            self.confirm('Remove this module?', function () {
                module.remove();
                emitter.emit('update_template');
            });

        });
    },

    optionActions: function () {
        var self = this;
        // Re-init option fields
        // Colorpicker
        $('[data-control="colorpicker"]').minicolors({position: 'bottom right'});

        // Colorpicker live update
        $('[data-control="colorpicker"]').on('change', function (event) {
            var targetOption = $(this).data('target-option');
            var targetAttr = $(this).data('target-attr');
            var currentVal = $(this).val();
            $('[data-' + targetAttr + '="' + targetOption + '"]', self.current).css(targetAttr, currentVal);
            $('[data-' + targetAttr + '="' + targetOption + '"]', self.current).attr(targetAttr, currentVal);
            emitter.emit('update_template');
        });

        // Background image live update
        $('[data-control="background-image"]').on('click', function (event) {

            // Destroy the uploader
            if(Module.imageUploader){
                Module.imageUploader.slim('destroy');
                Module.imageUploader=null;
            }

            var $target = $(event.target), // clicked button
                modalContainer = $('#bgeditor'),  // Modal Container
                targetImageSrc =  $(this).data('bg-image'), // Currrent Image Src
                option_id = $(this).data('target-option'); // Option Id to update

            // Fill-in Modal Form with Image attributes
            $('[data-image="src"]', modalContainer).attr('src', targetImageSrc);

            $.fancybox.open({
                src  : '#bgeditor',
                type : 'inline',
                opts : {
                    afterClose: function(){
                        // Clear the modal form
                        $('[data-image="src"]', modalContainer).attr('src', '');
                    },
                    onComplete : function() {
                        // Remove previous on-click event listeners
                        $('.modal-btn-cancel', modalContainer).off('click');
                        $('.modal-btn-ok', modalContainer).off('click');

                        // Init image uploader
                        Module.imageUploader = $('#modal-bg-uploader').slim({
                            fetcher: 'server/fetch.php',
                            service: 'server/async.php',
                            push: true,
                            instantEdit: true,
                            didUpload: function(){
                                var $data = Module.imageUploader.slim('data')[0],
                                    imageSrc = config.uploads + '/' + $data.server.file;

                                $('[data-image="src"]', modalContainer).attr('src', imageSrc);
                            }
                        });

                        $('.modal-btn-cancel', modalContainer).on('click', function (event) {
                            // Close Modal
                            $.fancybox.close();
                        });
                        $('.modal-btn-ok', modalContainer).on('click', function(event){
                            // Get new link attributes
                            var imageSrc = $('[data-image="src"]', modalContainer).attr('src');

                            // Update background label
                            $('[data-bg-option-label="' + option_id + '"]', $target.parent()).html(imageSrc);
                            // Update module background
                            $('[data-bg="' + option_id + '"]', Module.current).css('background-image', "url('" + imageSrc + "')");

                            // Close Modal
                            $.fancybox.close();
                        });
                    }
                }
            });

            emitter.emit('update_template');
        });
        // Background appearance live update
        $('[data-control="background-appearance"]').on('change', function (event) {
            var targetOption = $(this).data('target-option');
            var currentVal = $(this).val();
            // Reset background appearance
            $('[data-bg="' + targetOption + '"]', self.current).css('background-position', '');
            $('[data-bg="' + targetOption + '"]', self.current).css('background-size', '');
            $('[data-bg="' + targetOption + '"]', self.current).css('background-attachment', '');
            switch (currentVal) {
                case 'original':
                    $('[data-bg="' + targetOption + '"]', self.current).css('background-position', 'center center');
                    break;
                case '100%':
                    $('[data-bg="' + targetOption + '"]', self.current).css('background-size', '100%');
                    break;
                case 'fluid':
                    $('[data-bg="' + targetOption + '"]', self.current).css('background-position', 'center center');
                    $('[data-bg="' + targetOption + '"]', self.current).css('background-size', 'cover');
                    break;
                case 'fixed':
                    $('[data-bg="' + targetOption + '"]', self.current).css('background-position', 'center center');
                    $('[data-bg="' + targetOption + '"]', self.current).css('background-size', 'cover');
                    $('[data-bg="' + targetOption + '"]', self.current).css('background-attachment', 'fixed');
                    break;
            }

        });
    },

    getCodeEditorHTML: function (moduleHTML = '') {
        var codeEditorHTML = '<div class="module-code-container">' + this.codeControls + '<textarea id="code" name="code">' + moduleHTML + '</textarea></div>';
        return codeEditorHTML;
    },

    getOptions: function () {
        var self = this;

        // Reset module options
        self.options = {
            'color': [],
            'bgcolor': [],
            'bg': []
        };

        var colorOptions = [],
            bgcolorOptions = [],
            bgOptions = [];

        // Looking for 'color' option in selected module
        $('[data-color]', self.current).each(function () {
            var optionName = $(this).data('color');
            colorOptions.push(optionName);
        });
        // Looking for 'bgcolor' option in selected module
        $('[data-bgcolor]', self.current).each(function () {
            var optionName = $(this).data('bgcolor');
            bgcolorOptions.push(optionName);
        });
        // Looking for 'bg' option in selected module
        $('[data-bg]', self.current).each(function () {
            var optionName = $(this).data('bg');
            bgOptions.push(optionName);
        });
        // Remove repeatable options
        self.options['color'] = colorOptions.filter((v, i, a) => a.indexOf(v) === i);
        self.options['bgcolor'] = bgcolorOptions.filter((v, i, a) => a.indexOf(v) === i);
        self.options['bg'] = bgOptions.filter((v, i, a) => a.indexOf(v) === i);

    },

    getOptionsHTML: function(){
        var self = this;

        var optionsHTML = '';
        // Render 'color' options
        if (self.options['color'].length > 0) {
            optionsHTML += '<div class="styles-group">';
            optionsHTML += '    <div class="group-header">Font colors</div>';
            optionsHTML += '    <div class="group-styles-inner">';
            self.options['color'].forEach(function (option) {
                // get option value
                var color = $('[data-color="' + option + '"]', self.current).css('color');
                var val = self.rgb2hex(color);
                optionsHTML += '        <div class="style-item">';
                optionsHTML += '            <div class="style-label">' + option + '</div>';
                optionsHTML += '            <div class="style-control"><input type="text" value="' + val + '" data-control="colorpicker" data-target-option="' + option + '" data-target-attr="color"></div>';
                optionsHTML += '        </div>';
            });
            optionsHTML += '    </div>';
            optionsHTML += '</div>';
        }

        // Render 'bgcolor' options
        if (self.options['bgcolor'].length > 0) {
            optionsHTML += '<div class="styles-group">';
            optionsHTML += '    <div class="group-header">Background colors</div>';
            optionsHTML += '    <div class="group-styles-inner">';
            self.options['bgcolor'].forEach(function (option) {
                // get option value
                var color = $('[data-bgcolor="' + option + '"]', self.current).css('background-color');
                var val = self.rgb2hex(color);
                optionsHTML += '        <div class="style-item">';
                optionsHTML += '            <div class="style-label">' + option + '</div>';
                optionsHTML += '            <div class="style-control"><input type="text" value="' + val + '" data-control="colorpicker" data-target-option="' + option + '" data-target-attr="bgcolor"></div>';
                optionsHTML += '        </div>';
            });
            optionsHTML += '    </div>';
            optionsHTML += '</div>';
        }

        // Render 'bg' options
        if (self.options['bg'].length > 0) {
            optionsHTML += '<div class="styles-group">';
            optionsHTML += '    <div class="group-header">Background images</div>';
            optionsHTML += '    <div class="group-styles-inner">';
            self.options['bg'].forEach(function (option) {
                var bgImage = $('[data-bg="' + option + '"]', self.current).css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                optionsHTML += '        <div class="style-item">';
                optionsHTML += '            <div class="style-label">' + option + '</div>';
                optionsHTML += '            <div class="style-control"><span data-bg-option-label="' + option + '">' + bgImage + '</span><button data-control="background-image" data-bg-image="' + bgImage + '" data-target-option="' + option + '">Change</button></div>';
                optionsHTML += '        </div>';
                optionsHTML += '        <div class="style-item">';
                optionsHTML += '            <div class="style-label">Position</div>';
                optionsHTML += '            <div class="style-control">';
                optionsHTML += '                <select data-control="background-appearance" data-target-option="' + option + '">';
                optionsHTML += '                    <option value="original">Original</option>';
                optionsHTML += '                    <option value="100%">100%</option>';
                optionsHTML += '                    <option value="fluid">Fluid</option>';
                optionsHTML += '                    <option value="fixed">Fixed</option>';
                optionsHTML += '                </select>';
                optionsHTML += '            </div>';
                optionsHTML += '        </div>';

            });
            optionsHTML += '    </div>';
            optionsHTML += '</div>';
        }

        return optionsHTML;
    }

};

emitter.on('module_added', function () {
    // Update template event
    emitter.emit('update_template');
});

emitter.on('module_change', function () {
    // Hide the content of the sidebar
    $('[data-type="sidebar-second"]').find('[data-sidebar]').hide();
    Module.getOptions();
    var moduleOptionsHTML = Module.getOptionsHTML();
    $('[data-type="module-options"]').html(moduleOptionsHTML);
    Module.optionActions();

});

emitter.on('update_template', function () {
    // Init the Module controls
    Module.init();
});





// Export Module object
module.exports = Module;


