'use strict';

// Global Event Emitter
var emitter = window.top.jsEmailBuilderEmitter;

// Utils, e.g.: export and send
var Utils = {
    showPreview(w = 375, h = 559){
        var previewWindow = window.open(null, 'Preview HTML', 'width=' + w + ',height=' + h + ',resizeable,scrollbars');
        var html = $('#templateHTML').val();
        previewWindow.document.write(atob(html));
        previewWindow.document.close(); // needed for chrome and safari
    },
    templatePreviewMobile: function () {
        this.showPreview(375, 559);
    },

    templatePreviewTablet: function () {
        this.showPreview(768, 600);
    },
    // Clear template
    templateClear: function () {
        swal({
                title: 'Clear the template?',
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                closeOnConfirm: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    swal("All done!", "The template has been cleared", "success");
                    $('[data-type="editor"]').html('');
                }
            });
    },
};


emitter.on('init', function () {
    // Mobile Preview
    $('.template-preview-mobile').on('click', function (event) {
        Utils.templatePreviewMobile();
    });
    // Tablet Preview
    $('.template-preview-tablet').on('click', function (event) {
        Utils.templatePreviewTablet();
    });
    // Clear the template
    $('.template-clear').on('click', function (event) {
        Utils.templateClear();
    });


});

// Export Utils object
module.exports = Utils;