/*
 * Slim v4.6.4 - Image Cropping Made Easy
 * Copyright (c) 2017 Rik Schennink - http://slimimagecropper.com
 */
(function($,undefined){

	'use strict';

	// if no jquery, stop here
	if (!$) {return;}

	// library reference
	var Slim = (function() {

// custom event polyfill for IE10
(function() {
	if ( typeof window.CustomEvent === 'function' ) return false;

	function CustomEvent ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	}

	CustomEvent.prototype = window.Event.prototype;

	window.CustomEvent = CustomEvent;
})();
/*
* JavaScript Load Image
* https://github.com/blueimp/JavaScript-Load-Image
*
* Copyright 2011, Sebastian Tschan
* https://blueimp.net
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/MIT
*/

/*global define, module, window, document, URL, webkitURL, FileReader */

// Loads an image for a given File object.
// Invokes the callback with an img or optional canvas
// element (if supported by the browser) as parameter:
var loadImage = function (file, callback, options) {
    var img = document.createElement('img')
    var url
    var oUrl
    img.onerror = callback
    img.onload = function () {
        if (oUrl && !(options && options.noRevoke)) {
            loadImage.revokeObjectURL(oUrl)
        }
        if (callback) {
            callback(loadImage.scale(img, options))
        }
    }
    if (loadImage.isInstanceOf('Blob', file) ||
        // Files are also Blob instances, but some browsers
        // (Firefox 3.6) support the File API but not Blobs:
        loadImage.isInstanceOf('File', file)) {
        url = oUrl = loadImage.createObjectURL(file)
        // Store the file type for resize processing:
        img._type = file.type
    } else if (typeof file === 'string') {
        url = file
        if (options && options.crossOrigin) {
            img.crossOrigin = options.crossOrigin
        }
    } else {
        return false
    }
    if (url) {
        img.src = url
        return img
    }
    return loadImage.readFile(file, function (e) {
        var target = e.target
        if (target && target.result) {
            img.src = target.result
        } else {
            if (callback) {
                callback(e)
            }
        }
    })
}
// The check for URL.revokeObjectURL fixes an issue with Opera 12,
// which provides URL.createObjectURL but doesn't properly implement it:
var urlAPI = (window.createObjectURL && window) ||
    (window.URL && URL.revokeObjectURL && URL) ||
    (window.webkitURL && webkitURL)

loadImage.isInstanceOf = function (type, obj) {
    // Cross-frame instanceof check
    return Object.prototype.toString.call(obj) === '[object ' + type + ']'
}

// Transform image coordinates, allows to override e.g.
// the canvas orientation based on the orientation option,
// gets canvas, options passed as arguments:
loadImage.transformCoordinates = function () {
    return
}

// Returns transformed options, allows to override e.g.
// maxWidth, maxHeight and crop options based on the aspectRatio.
// gets img, options passed as arguments:
loadImage.getTransformedOptions = function (img, options) {
    var aspectRatio = options.aspectRatio
    var newOptions
    var i
    var width
    var height
    if (!aspectRatio) {
        return options
    }
    newOptions = {}
    for (i in options) {
        if (options.hasOwnProperty(i)) {
            newOptions[i] = options[i]
        }
    }
    newOptions.crop = true
    width = img.naturalWidth || img.width
    height = img.naturalHeight || img.height
    if (width / height > aspectRatio) {
        newOptions.maxWidth = height * aspectRatio
        newOptions.maxHeight = height
    } else {
        newOptions.maxWidth = width
        newOptions.maxHeight = width / aspectRatio
    }
    return newOptions
}

// Canvas render method, allows to implement a different rendering algorithm:
loadImage.renderImageToCanvas = function (
    canvas,
    img,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destX,
    destY,
    destWidth,
    destHeight
) {
    canvas.getContext('2d').drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth,
        destHeight
    )
    return canvas
}

// This method is used to determine if the target image
// should be a canvas element:
loadImage.hasCanvasOption = function (options) {
    return options.canvas || options.crop || !!options.aspectRatio
}

// Scales and/or crops the given image (img or canvas HTML element)
// using the given options.
// Returns a canvas object if the browser supports canvas
// and the hasCanvasOption method returns true or a canvas
// object is passed as image, else the scaled image:
loadImage.scale = function (img, options) {
    options = options || {}
    var canvas = document.createElement('canvas')
    var useCanvas = img.getContext ||
        (loadImage.hasCanvasOption(options) && canvas.getContext)
    var width = img.naturalWidth || img.width
    var height = img.naturalHeight || img.height
    var destWidth = width
    var destHeight = height
    var maxWidth
    var maxHeight
    var minWidth
    var minHeight
    var sourceWidth
    var sourceHeight
    var sourceX
    var sourceY
    var pixelRatio
    var downsamplingRatio
    var tmp
    function scaleUp () {
        var scale = Math.max(
            (minWidth || destWidth) / destWidth,
            (minHeight || destHeight) / destHeight
        )
        if (scale > 1) {
            destWidth *= scale
            destHeight *= scale
        }
    }
    function scaleDown () {
        var scale = Math.min(
            (maxWidth || destWidth) / destWidth,
            (maxHeight || destHeight) / destHeight
        )
        if (scale < 1) {
            destWidth *= scale
            destHeight *= scale
        }
    }
    if (useCanvas) {
        options = loadImage.getTransformedOptions(img, options)
        sourceX = options.left || 0
        sourceY = options.top || 0
        if (options.sourceWidth) {
            sourceWidth = options.sourceWidth
            if (options.right !== undefined && options.left === undefined) {
                sourceX = width - sourceWidth - options.right
            }
        } else {
            sourceWidth = width - sourceX - (options.right || 0)
        }
        if (options.sourceHeight) {
            sourceHeight = options.sourceHeight
            if (options.bottom !== undefined && options.top === undefined) {
                sourceY = height - sourceHeight - options.bottom
            }
        } else {
            sourceHeight = height - sourceY - (options.bottom || 0)
        }
        destWidth = sourceWidth
        destHeight = sourceHeight
    }
    maxWidth = options.maxWidth
    maxHeight = options.maxHeight
    minWidth = options.minWidth
    minHeight = options.minHeight
    if (useCanvas && maxWidth && maxHeight && options.crop) {
        destWidth = maxWidth
        destHeight = maxHeight
        tmp = sourceWidth / sourceHeight - maxWidth / maxHeight
        if (tmp < 0) {
            sourceHeight = maxHeight * sourceWidth / maxWidth
            if (options.top === undefined && options.bottom === undefined) {
                sourceY = (height - sourceHeight) / 2
            }
        } else if (tmp > 0) {
            sourceWidth = maxWidth * sourceHeight / maxHeight
            if (options.left === undefined && options.right === undefined) {
                sourceX = (width - sourceWidth) / 2
            }
        }
    } else {
        if (options.contain || options.cover) {
            minWidth = maxWidth = maxWidth || minWidth
            minHeight = maxHeight = maxHeight || minHeight
        }
        if (options.cover) {
            scaleDown()
            scaleUp()
        } else {
            scaleUp()
            scaleDown()
        }
    }
    if (useCanvas) {
        pixelRatio = options.pixelRatio
        if (pixelRatio > 1) {
            canvas.style.width = destWidth + 'px'
            canvas.style.height = destHeight + 'px'
            destWidth *= pixelRatio
            destHeight *= pixelRatio
            canvas.getContext('2d').scale(pixelRatio, pixelRatio)
        }
        downsamplingRatio = options.downsamplingRatio
        if (downsamplingRatio > 0 && downsamplingRatio < 1 &&
            destWidth < sourceWidth && destHeight < sourceHeight) {
            while (sourceWidth * downsamplingRatio > destWidth) {
                canvas.width = sourceWidth * downsamplingRatio
                canvas.height = sourceHeight * downsamplingRatio
                loadImage.renderImageToCanvas(
                    canvas,
                    img,
                    sourceX,
                    sourceY,
                    sourceWidth,
                    sourceHeight,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                )
                sourceWidth = canvas.width
                sourceHeight = canvas.height
                img = document.createElement('canvas')
                img.width = sourceWidth
                img.height = sourceHeight
                loadImage.renderImageToCanvas(
                    img,
                    canvas,
                    0,
                    0,
                    sourceWidth,
                    sourceHeight,
                    0,
                    0,
                    sourceWidth,
                    sourceHeight
                )
            }
        }
        canvas.width = destWidth
        canvas.height = destHeight
        loadImage.transformCoordinates(
            canvas,
            options
        )
        return loadImage.renderImageToCanvas(
            canvas,
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            destWidth,
            destHeight
        )
    }
    img.width = destWidth
    img.height = destHeight
    return img
}

loadImage.createObjectURL = function (file) {
    return urlAPI ? urlAPI.createObjectURL(file) : false
}

loadImage.revokeObjectURL = function (url) {
    return urlAPI ? urlAPI.revokeObjectURL(url) : false
}

// Loads a given File object via FileReader interface,
// invokes the callback with the event object (load or error).
// The result can be read via event.target.result:
loadImage.readFile = function (file, callback, method) {
    if (window.FileReader) {
        var fileReader = new FileReader()
        fileReader.onload = fileReader.onerror = callback
        method = method || 'readAsDataURL'
        if (fileReader[method]) {
            fileReader[method](file)
            return fileReader
        }
    }
    return false
}

var originalHasCanvasOption = loadImage.hasCanvasOption
var originalTransformCoordinates = loadImage.transformCoordinates
var originalGetTransformedOptions = loadImage.getTransformedOptions

// This method is used to determine if the target image
// should be a canvas element:
loadImage.hasCanvasOption = function (options) {
    return !!options.orientation ||
        originalHasCanvasOption.call(loadImage, options)
}

// Transform image orientation based on
// the given EXIF orientation option:
loadImage.transformCoordinates = function (canvas, options) {
    originalTransformCoordinates.call(loadImage, canvas, options)
    var ctx = canvas.getContext('2d')
    var width = canvas.width
    var height = canvas.height
    var styleWidth = canvas.style.width
    var styleHeight = canvas.style.height
    var orientation = options.orientation
    if (!orientation || orientation > 8) {
        return
    }
    if (orientation > 4) {
        canvas.width = height
        canvas.height = width
        canvas.style.width = styleHeight
        canvas.style.height = styleWidth
    }
    switch (orientation) {
        case 2:
            // horizontal flip
            ctx.translate(width, 0)
            ctx.scale(-1, 1)
            break
        case 3:
            // 180° rotate left
            ctx.translate(width, height)
            ctx.rotate(Math.PI)
            break
        case 4:
            // vertical flip
            ctx.translate(0, height)
            ctx.scale(1, -1)
            break
        case 5:
            // vertical flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI)
            ctx.scale(1, -1)
            break
        case 6:
            // 90° rotate right
            ctx.rotate(0.5 * Math.PI)
            ctx.translate(0, -height)
            break
        case 7:
            // horizontal flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI)
            ctx.translate(width, -height)
            ctx.scale(-1, 1)
            break
        case 8:
            // 90° rotate left
            ctx.rotate(-0.5 * Math.PI)
            ctx.translate(-width, 0)
            break
    }
}

// Transforms coordinate and dimension options
// based on the given orientation option:
loadImage.getTransformedOptions = function (img, opts) {
    var options = originalGetTransformedOptions.call(loadImage, img, opts)
    var orientation = options.orientation
    var newOptions
    var i
    if (!orientation || orientation > 8 || orientation === 1) {
        return options
    }
    newOptions = {}
    for (i in options) {
        if (options.hasOwnProperty(i)) {
            newOptions[i] = options[i]
        }
    }
    switch (options.orientation) {
        case 2:
            // horizontal flip
            newOptions.left = options.right
            newOptions.right = options.left
            break
        case 3:
            // 180° rotate left
            newOptions.left = options.right
            newOptions.top = options.bottom
            newOptions.right = options.left
            newOptions.bottom = options.top
            break
        case 4:
            // vertical flip
            newOptions.top = options.bottom
            newOptions.bottom = options.top
            break
        case 5:
            // vertical flip + 90 rotate right
            newOptions.left = options.top
            newOptions.top = options.left
            newOptions.right = options.bottom
            newOptions.bottom = options.right
            break
        case 6:
            // 90° rotate right
            newOptions.left = options.top
            newOptions.top = options.right
            newOptions.right = options.bottom
            newOptions.bottom = options.left
            break
        case 7:
            // horizontal flip + 90 rotate right
            newOptions.left = options.bottom
            newOptions.top = options.right
            newOptions.right = options.top
            newOptions.bottom = options.left
            break
        case 8:
            // 90° rotate left
            newOptions.left = options.bottom
            newOptions.top = options.left
            newOptions.right = options.top
            newOptions.bottom = options.right
            break
    }
    if (options.orientation > 4) {
        newOptions.maxWidth = options.maxHeight
        newOptions.maxHeight = options.maxWidth
        newOptions.minWidth = options.minHeight
        newOptions.minHeight = options.minWidth
        newOptions.sourceWidth = options.sourceHeight
        newOptions.sourceHeight = options.sourceWidth
    }
    return newOptions
}

var hasblobSlice = window.Blob && (Blob.prototype.slice ||
    Blob.prototype.webkitSlice || Blob.prototype.mozSlice)

loadImage.blobSlice = hasblobSlice && function () {
        var slice = this.slice || this.webkitSlice || this.mozSlice
        return slice.apply(this, arguments)
    }

loadImage.metaDataParsers = {
    jpeg: {
        0xffe1: [] // APP1 marker
    }
}

// Parses image meta data and calls the callback with an object argument
// with the following properties:
// * imageHead: The complete image head as ArrayBuffer (Uint8Array for IE10)
// The options arguments accepts an object and supports the following properties:
// * maxMetaDataSize: Defines the maximum number of bytes to parse.
// * disableImageHead: Disables creating the imageHead property.
loadImage.parseMetaData = function (file, callback, options) {
    options = options || {}
    var that = this
    // 256 KiB should contain all EXIF/ICC/IPTC segments:
    var maxMetaDataSize = options.maxMetaDataSize || 262144
    var data = {}
    var noMetaData = !(window.DataView && file && file.size >= 12 &&
    file.type === 'image/jpeg' && loadImage.blobSlice)
    if (noMetaData || !loadImage.readFile(
            loadImage.blobSlice.call(file, 0, maxMetaDataSize),
            function (e) {
                if (e.target.error) {
                    // FileReader error
                    //console.log(e.target.error)
                    callback(data)
                    return
                }
                // Note on endianness:
                // Since the marker and length bytes in JPEG files are always
                // stored in big endian order, we can leave the endian parameter
                // of the DataView methods undefined, defaulting to big endian.
                var buffer = e.target.result
                var dataView = new DataView(buffer)
                var offset = 2
                var maxOffset = dataView.byteLength - 4
                var headLength = offset
                var markerBytes
                var markerLength
                var parsers
                var i
                // Check for the JPEG marker (0xffd8):
                if (dataView.getUint16(0) === 0xffd8) {
                    while (offset < maxOffset) {
                        markerBytes = dataView.getUint16(offset)
                        // Search for APPn (0xffeN) and COM (0xfffe) markers,
                        // which contain application-specific meta-data like
                        // Exif, ICC and IPTC data and text comments:
                        if ((markerBytes >= 0xffe0 && markerBytes <= 0xffef) ||
                            markerBytes === 0xfffe) {
                            // The marker bytes (2) are always followed by
                            // the length bytes (2), indicating the length of the
                            // marker segment, which includes the length bytes,
                            // but not the marker bytes, so we add 2:
                            markerLength = dataView.getUint16(offset + 2) + 2
                            if (offset + markerLength > dataView.byteLength) {
                                //console.log('Invalid meta data: Invalid segment size.')
                                break
                            }
                            parsers = loadImage.metaDataParsers.jpeg[markerBytes]
                            if (parsers) {
                                for (i = 0; i < parsers.length; i += 1) {
                                    parsers[i].call(
                                        that,
                                        dataView,
                                        offset,
                                        markerLength,
                                        data,
                                        options
                                    )
                                }
                            }
                            offset += markerLength
                            headLength = offset
                        } else {
                            // Not an APPn or COM marker, probably safe to
                            // assume that this is the end of the meta data
                            break
                        }
                    }
                    // Meta length must be longer than JPEG marker (2)
                    // plus APPn marker (2), followed by length bytes (2):
                    if (!options.disableImageHead && headLength > 6) {
                        if (buffer.slice) {
                            data.imageHead = buffer.slice(0, headLength)
                        } else {
                            // Workaround for IE10, which does not yet
                            // support ArrayBuffer.slice:
                            data.imageHead = new Uint8Array(buffer)
                                .subarray(0, headLength)
                        }
                    }
                } else {
                    //console.log('Invalid JPEG file: Missing JPEG marker.')
                }
                callback(data)
            },
            'readAsArrayBuffer'
        )) {
        callback(data)
    }
}

loadImage.ExifMap = function () {
    return this
}

loadImage.ExifMap.prototype.map = {
    'Orientation': 0x0112
}

loadImage.ExifMap.prototype.get = function (id) {
    return this[id] || this[this.map[id]]
}

loadImage.getExifThumbnail = function (dataView, offset, length) {
    var hexData,
        i,
        b
    if (!length || offset + length > dataView.byteLength) {
        //console.log('Invalid Exif data: Invalid thumbnail data.')
        return
    }
    hexData = []
    for (i = 0; i < length; i += 1) {
        b = dataView.getUint8(offset + i)
        hexData.push((b < 16 ? '0' : '') + b.toString(16))
    }
    return 'data:image/jpeg,%' + hexData.join('%')
}

loadImage.exifTagTypes = {
    // byte, 8-bit unsigned int:
    1: {
        getValue: function (dataView, dataOffset) {
            return dataView.getUint8(dataOffset)
        },
        size: 1
    },
    // ascii, 8-bit byte:
    2: {
        getValue: function (dataView, dataOffset) {
            return String.fromCharCode(dataView.getUint8(dataOffset))
        },
        size: 1,
        ascii: true
    },
    // short, 16 bit int:
    3: {
        getValue: function (dataView, dataOffset, littleEndian) {
            return dataView.getUint16(dataOffset, littleEndian)
        },
        size: 2
    },
    // long, 32 bit int:
    4: {
        getValue: function (dataView, dataOffset, littleEndian) {
            return dataView.getUint32(dataOffset, littleEndian)
        },
        size: 4
    },
    // rational = two long values, first is numerator, second is denominator:
    5: {
        getValue: function (dataView, dataOffset, littleEndian) {
            return dataView.getUint32(dataOffset, littleEndian) /
                dataView.getUint32(dataOffset + 4, littleEndian)
        },
        size: 8
    },
    // slong, 32 bit signed int:
    9: {
        getValue: function (dataView, dataOffset, littleEndian) {
            return dataView.getInt32(dataOffset, littleEndian)
        },
        size: 4
    },
    // srational, two slongs, first is numerator, second is denominator:
    10: {
        getValue: function (dataView, dataOffset, littleEndian) {
            return dataView.getInt32(dataOffset, littleEndian) /
                dataView.getInt32(dataOffset + 4, littleEndian)
        },
        size: 8
    }
}
// undefined, 8-bit byte, value depending on field:
loadImage.exifTagTypes[7] = loadImage.exifTagTypes[1]

loadImage.getExifValue = function (dataView, tiffOffset, offset, type, length, littleEndian) {
    var tagType = loadImage.exifTagTypes[type]
    var tagSize
    var dataOffset
    var values
    var i
    var str
    var c
    if (!tagType) {
        //console.log('Invalid Exif data: Invalid tag type.')
        return
    }
    tagSize = tagType.size * length
    // Determine if the value is contained in the dataOffset bytes,
    // or if the value at the dataOffset is a pointer to the actual data:
    dataOffset = tagSize > 4
        ? tiffOffset + dataView.getUint32(offset + 8, littleEndian)
        : (offset + 8)
    if (dataOffset + tagSize > dataView.byteLength) {
        //console.log('Invalid Exif data: Invalid data offset.')
        return
    }
    if (length === 1) {
        return tagType.getValue(dataView, dataOffset, littleEndian)
    }
    values = []
    for (i = 0; i < length; i += 1) {
        values[i] = tagType.getValue(dataView, dataOffset + i * tagType.size, littleEndian)
    }
    if (tagType.ascii) {
        str = ''
        // Concatenate the chars:
        for (i = 0; i < values.length; i += 1) {
            c = values[i]
            // Ignore the terminating NULL byte(s):
            if (c === '\u0000') {
                break
            }
            str += c
        }
        return str
    }
    return values
}

loadImage.parseExifTag = function (dataView, tiffOffset, offset, littleEndian, data) {
    var tag = dataView.getUint16(offset, littleEndian)
    data.exif[tag] = loadImage.getExifValue(
        dataView,
        tiffOffset,
        offset,
        dataView.getUint16(offset + 2, littleEndian), // tag type
        dataView.getUint32(offset + 4, littleEndian), // tag length
        littleEndian
    )
}

loadImage.parseExifTags = function (dataView, tiffOffset, dirOffset, littleEndian, data) {
    var tagsNumber,
        dirEndOffset,
        i
    if (dirOffset + 6 > dataView.byteLength) {
        //console.log('Invalid Exif data: Invalid directory offset.')
        return
    }
    tagsNumber = dataView.getUint16(dirOffset, littleEndian)
    dirEndOffset = dirOffset + 2 + 12 * tagsNumber
    if (dirEndOffset + 4 > dataView.byteLength) {
        //console.log('Invalid Exif data: Invalid directory size.')
        return
    }
    for (i = 0; i < tagsNumber; i += 1) {
        this.parseExifTag(
            dataView,
            tiffOffset,
            dirOffset + 2 + 12 * i, // tag offset
            littleEndian,
            data
        )
    }
    // Return the offset to the next directory:
    return dataView.getUint32(dirEndOffset, littleEndian)
}

loadImage.parseExifData = function (dataView, offset, length, data, options) {
    if (options.disableExif) {
        return
    }
    var tiffOffset = offset + 10
    var littleEndian
    var dirOffset
    var thumbnailData
    // Check for the ASCII code for "Exif" (0x45786966):
    if (dataView.getUint32(offset + 4) !== 0x45786966) {
        // No Exif data, might be XMP data instead
        return
    }
    if (tiffOffset + 8 > dataView.byteLength) {
        //console.log('Invalid Exif data: Invalid segment size.')
        return
    }
    // Check for the two null bytes:
    if (dataView.getUint16(offset + 8) !== 0x0000) {
        //console.log('Invalid Exif data: Missing byte alignment offset.')
        return
    }
    // Check the byte alignment:
    switch (dataView.getUint16(tiffOffset)) {
        case 0x4949:
            littleEndian = true
            break
        case 0x4D4D:
            littleEndian = false
            break
        default:
            //console.log('Invalid Exif data: Invalid byte alignment marker.')
            return
    }
    // Check for the TIFF tag marker (0x002A):
    if (dataView.getUint16(tiffOffset + 2, littleEndian) !== 0x002A) {
        //console.log('Invalid Exif data: Missing TIFF marker.')
        return
    }
    // Retrieve the directory offset bytes, usually 0x00000008 or 8 decimal:
    dirOffset = dataView.getUint32(tiffOffset + 4, littleEndian)
    // Create the exif object to store the tags:
    data.exif = new loadImage.ExifMap()
    // Parse the tags of the main image directory and retrieve the
    // offset to the next directory, usually the thumbnail directory:
    dirOffset = loadImage.parseExifTags(
        dataView,
        tiffOffset,
        tiffOffset + dirOffset,
        littleEndian,
        data
    )
    if (dirOffset && !options.disableExifThumbnail) {
        thumbnailData = {exif: {}}
        dirOffset = loadImage.parseExifTags(
            dataView,
            tiffOffset,
            tiffOffset + dirOffset,
            littleEndian,
            thumbnailData
        )
        // Check for JPEG Thumbnail offset:
        if (thumbnailData.exif[0x0201]) {
            data.exif.Thumbnail = loadImage.getExifThumbnail(
                dataView,
                tiffOffset + thumbnailData.exif[0x0201],
                thumbnailData.exif[0x0202] // Thumbnail data length
            )
        }
    }
    // Check for Exif Sub IFD Pointer:
    if (data.exif[0x8769] && !options.disableExifSub) {
        loadImage.parseExifTags(
            dataView,
            tiffOffset,
            tiffOffset + data.exif[0x8769], // directory offset
            littleEndian,
            data
        )
    }
    // Check for GPS Info IFD Pointer:
    if (data.exif[0x8825] && !options.disableExifGps) {
        loadImage.parseExifTags(
            dataView,
            tiffOffset,
            tiffOffset + data.exif[0x8825], // directory offset
            littleEndian,
            data
        )
    }
}

// Registers the Exif parser for the APP1 JPEG meta data segment:
loadImage.metaDataParsers.jpeg[0xffe1].push(loadImage.parseExifData)
var snabbt = (function() {

var tickRequests = [];
var runningAnimations = [];
var completedAnimations = [];
var transformProperty = 'transform';

// Find which vendor prefix to use
var styles = window.getComputedStyle(document.documentElement, '');
var vendorPrefix = (Array.prototype.slice
  .call(styles)
  .join('') 
  .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
)[1];
if(vendorPrefix === 'webkit')
transformProperty = 'webkitTransform';

/* Entry point, only function to be called by user */
var snabbt = function(arg1, arg2, arg3) {

var elements = arg1;

// If argument is an Array or a NodeList or other list type that can be iterable.
// Loop through and start one animation for each element.
if(elements.length !== undefined) {
  var aggregateChainer = {
    chainers: [],
    then: function(opts) {
      return this.snabbt(opts);
    },
    snabbt: function(opts) {
      var len = this.chainers.length;
      this.chainers.forEach(function(chainer, index) {
        chainer.snabbt(preprocessOptions(opts, index, len));
      });
      return aggregateChainer;
    },
    setValue: function(value) {
      this.chainers.forEach(function(chainer) {
        chainer.setValue(value);
      });
      return aggregateChainer;
    },
    finish: function() {
      this.chainers.forEach(function(chainer) {
        chainer.finish();
      });
      return aggregateChainer;
    },
    rollback: function() {
      this.chainers.forEach(function(chainer) {
        chainer.rollback();
      });
      return aggregateChainer;
    }
  };

  for(var i=0, len=elements.length;i<len;++i) {
    if(typeof arg2 == 'string')
      aggregateChainer.chainers.push(snabbtSingleElement(elements[i], arg2, preprocessOptions(arg3, i, len)));
    else
      aggregateChainer.chainers.push(snabbtSingleElement(elements[i], preprocessOptions(arg2, i, len), arg3));
  }
  return aggregateChainer;
} else {
  if(typeof arg2 == 'string')
    return snabbtSingleElement(elements, arg2, preprocessOptions(arg3, 0, 1));
  else
    return snabbtSingleElement(elements, preprocessOptions(arg2, 0, 1), arg3);
}
};

var preprocessOptions = function(options, index, len) {
if(!options)
  return options;
var clone = cloneObject(options);

if(isFunction(options.delay)) {
  clone.delay = options.delay(index, len);
}

if(isFunction(options.callback)) {
  clone.complete = function() {
    options.callback.call(this, index, len);
  };
}

var hasAllDoneCallback = isFunction(options.allDone);
var hasCompleteCallback = isFunction(options.complete);

if(hasCompleteCallback || hasAllDoneCallback) {
  clone.complete = function() {
    if(hasCompleteCallback) {
      options.complete.call(this, index, len);
    }
    if(hasAllDoneCallback && (index == len - 1)) {
      options.allDone();
    }
  };
}

if(isFunction(options.valueFeeder)) {
  clone.valueFeeder = function(i, matrix) {
    return options.valueFeeder(i, matrix, index, len);
  };
}
if(isFunction(options.easing)) {
  clone.easing = function(i) {
    return options.easing(i, index, len);
  };
}

var properties = [
  'position',
  'rotation',
  'skew',
  'rotationPost',
  'scale',
  'width',
  'height',
  'opacity',
  'fromPosition',
  'fromRotation',
  'fromSkew',
  'fromRotationPost',
  'fromScale',
  'fromWidth',
  'fromHeight',
  'fromOpacity',
  'transformOrigin',
  'duration',
  'delay'
];

properties.forEach(function(property) {
  if(isFunction(options[property])) {
    clone[property] = options[property](index, len);
  }
});

return clone;
};

var snabbtSingleElement = function(element, arg2, arg3) {

if(arg2 === 'attention') {
  return setupAttentionAnimation(element, arg3);
}

if(arg2 === 'stop') {
  return stopAnimation(element);
}

if(arg2 === 'detach') {
  return detachChildren(element);
}

var options = arg2;

// Remove orphaned end states
clearOphanedEndStates();

// If there is a running or past completed animation with element, use that end state as start state
var currentState = currentAnimationState(element);
var start = currentState;
// from has precendance over current animation state
start = stateFromOptions(options, start, true);
var end = cloneObject(currentState);
end = stateFromOptions(options, end);

var animOptions = setupAnimationOptions(start, end, options);
var animation = createAnimation(animOptions);

runningAnimations.push([element, animation]);

animation.updateElement(element, true);
var queue = [];
var chainer = {
  snabbt: function(opts) {
    queue.unshift(preprocessOptions(opts, 0, 1));
    return chainer;
  },
  then: function(opts) {
    return this.snabbt(opts);
  }
};

function tick(time) {
  animation.tick(time);
  animation.updateElement(element);
  if(animation.isStopped())
    return;

  if(!animation.completed())
    return queueTick(tick);

  if(options.loop > 1 && !animation.isStopped()) {
    // Loop current animation
    options.loop -= 1;
    animation.restart();
    queueTick(tick);
  } else {
    if(options.complete) {
      options.complete.call(element);
    }

    // Start next animation in queue
    if(queue.length) {
      options = queue.pop();

      start = stateFromOptions(options, end, true);
      end = stateFromOptions(options, cloneObject(end));
      options = setupAnimationOptions(start, end, options);

      animation = createAnimation(options);
      runningAnimations.push([element, animation]);

      animation.tick(time);
      queueTick(tick);
    }
  }
}

queueTick(tick);
// Manual animations are not chainable, instead an animation controller object is returned
// with setValue, finish and rollback methods
if(options.manual)
  return animation;
return chainer;
};

var setupAttentionAnimation = function(element,  options) {
var movement = stateFromOptions(options, createState({}));
options.movement = movement;
var animation = createAttentionAnimation(options);

runningAnimations.push([element, animation]);
function tick(time) {
  animation.tick(time);
  animation.updateElement(element);
  if(!animation.completed()) {
    queueTick(tick);
  } else {
    if(options.callback) {
      options.callback(element);
    }
    if(options.loop && options.loop > 1) {
      options.loop--;
      animation.restart();
      queueTick(tick);
    }
  }
}
queueTick(tick);
};

var stopAnimation = function(element) {
for(var i= 0,len=runningAnimations.length;i<len;++i) {
  var currentAnimation = runningAnimations[i];
  var animatedElement = currentAnimation[0];
  var animation = currentAnimation[1];

  if(animatedElement === element) {
    animation.stop();
  }
}
};

var indexOfElement = function(arr, element) {
  for(var i=0,len=arr.length;i<len;++i) {
    if (arr[i][0]===element) {
      return i;
    }
  }
  return -1;
};

var detachChildren = function(element) {

  var elements = [];
  var animations = runningAnimations.concat(completedAnimations);
  var el;
  var i;
  var len = animations.length;

  for(i=0;i<len;++i) {
    el = animations[i][0];
    if (element.contains(el) || element === el) {
      elements.push(el);
    }
  }

  len=elements.length;
  for(i=0;i<len;++i) {
    detachElement(elements[i]);
  }

};

var detachElement = function(element) {

  // stop animations
  stopAnimation(element);

  // remove
  var index = indexOfElement(runningAnimations, element);
  if (index >= 0) {
    runningAnimations.splice(index,1);
  }

  index = indexOfElement(completedAnimations, element);
  if (index >= 0) {
    completedAnimations.splice(index,1);
  }

};

var findAnimationState = function(animationList, element) {
for(var i=0,len=animationList.length;i<len;++i) {
  var currentAnimation = animationList[i];
  var animatedElement = currentAnimation[0];
  var animation = currentAnimation[1];

  if(animatedElement === element) {
    var state = animation.getCurrentState();
    animation.stop();
    return state;
  }
}
};

var clearOphanedEndStates = function() {
completedAnimations = completedAnimations.filter(function(animation) {
  return (findUltimateAncestor(animation[0]).body);
});
};

var findUltimateAncestor = function(node) {
var ancestor = node;
while(ancestor.parentNode) {
  ancestor = ancestor.parentNode;
}
return ancestor;
};

/**
* Returns the current state of element if there is an ongoing or previously finished
* animation releated to it. Will also call stop on the animation.
* TODO: The stopping of the animation is better put somewhere else
*/
var currentAnimationState = function(element) {
// Check if a completed animation is stored for this element
var state = findAnimationState(runningAnimations, element);
if(state)
  return state;

return findAnimationState(completedAnimations, element);
};

/**
* Parses an animation configuration object and returns a State instance
*/
var stateFromOptions = function(options, state, useFromPrefix) {
if (!state) {
  state = createState({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    rotationPost: [0, 0, 0],
    scale: [1, 1],
    skew: [0, 0]
  });
}
var position = 'position';
var rotation = 'rotation';
var skew = 'skew';
var rotationPost = 'rotationPost';
var scale = 'scale';
var scalePost = 'scalePost';
var width = 'width';
var height = 'height';
var opacity = 'opacity';

if(useFromPrefix) {
  position = 'fromPosition';
  rotation = 'fromRotation';
  skew = 'fromSkew';
  rotationPost = 'fromRotationPost';
  scale = 'fromScale';
  scalePost = 'fromScalePost';
  width = 'fromWidth';
  height = 'fromHeight';
  opacity = 'fromOpacity';
}

state.position = optionOrDefault(options[position], state.position);
state.rotation = optionOrDefault(options[rotation], state.rotation);
state.rotationPost = optionOrDefault(options[rotationPost], state.rotationPost);
state.skew = optionOrDefault(options[skew], state.skew);
state.scale = optionOrDefault(options[scale], state.scale);
state.scalePost = optionOrDefault(options[scalePost], state.scalePost);
state.opacity = options[opacity];
state.width = options[width];
state.height = options[height];

return state;
};

var setupAnimationOptions = function(start, end, options) {
options.startState = start;
options.endState = end;
return options;
};

var polyFillrAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return setTimeout(callback, 1000 / 60); }; 

var queueTick = function(func) {
if(tickRequests.length === 0)
  polyFillrAF(tickAnimations);
tickRequests.push(func);
};

var tickAnimations = function(time) {
var len = tickRequests.length;
for(var i=0;i<len;++i) {
  tickRequests[i](time);
}
tickRequests.splice(0, len);

var finishedAnimations = runningAnimations.filter(function(animation) {
  return animation[1].completed();
});

// See if there are any previously completed animations on the same element, if so, remove it before merging
completedAnimations = completedAnimations.filter(function(animation) {
  for(var i=0,len=finishedAnimations.length;i<len;++i) {
    if(animation[0] === finishedAnimations[i][0]) {
      return false;
    }
  }
  return true;
});

completedAnimations = completedAnimations.concat(finishedAnimations);

runningAnimations = runningAnimations.filter(function(animation) {
  return !animation[1].completed();
});

if(tickRequests.length !== 0)
  polyFillrAF(tickAnimations);
};


// Class for handling animation between two states
var createAnimation = function(options) {
var startState = options.startState;
var endState = options.endState;
var duration = optionOrDefault(options.duration, 500);
var delay = optionOrDefault(options.delay, 0);
var perspective = options.perspective;
var easing = createEaser(optionOrDefault(options.easing, 'linear'), options);
var currentState = duration === 0 ? endState.clone() : startState.clone();
var transformOrigin = options.transformOrigin;
currentState.transformOrigin = options.transformOrigin;

var startTime = 0;
var currentTime = 0;
var stopped = false;
var started = false;

// Manual related
var manual = options.manual;
var manualValue = 0;
var manualDelayFactor = delay / duration;
var manualCallback;

var tweener;
// Setup tweener
if(options.valueFeeder) {
  tweener = createValueFeederTweener(options.valueFeeder,
                                     startState,
                                     endState,
                                     currentState);
} else {
  tweener = createStateTweener(startState, endState, currentState);
}

// Public api
return {
  stop: function() {
    stopped = true;
  },
  isStopped: function() {
    return stopped;
  },

  finish: function(callback) {
    manual = false;
    var manualDuration = duration * manualValue;
    startTime = currentTime - manualDuration;
    manualCallback = callback;
    easing.resetFrom = manualValue;
  },

  rollback: function(callback) {
    manual = false;
    tweener.setReverse();
    var manualDuration = duration * (1 - manualValue);
    startTime = currentTime - manualDuration;
    manualCallback = callback;
    easing.resetFrom = manualValue;
  },

  restart: function() {
    // Restart timer
    startTime = undefined;
    easing.resetFrom(0);
  },

  tick: function(time) {
    if(stopped)
      return;

    if(manual) {
      currentTime = time;
      this.updateCurrentTransform();
      return;
    }

    // If first tick, set startTime
    if(!startTime) {
      startTime = time;
    }
    if(time - startTime > delay) {
      started = true;
      currentTime = time - delay;

      var curr = Math.min(Math.max(0.0, currentTime - startTime), duration);
      easing.tick(curr / duration);
      this.updateCurrentTransform();
      if(this.completed() && manualCallback) {
        manualCallback();
      }
    }
  },

  getCurrentState: function() {
    return currentState;
  },

  setValue: function(_manualValue) {
    started = true;
    manualValue = Math.min(Math.max(_manualValue, 0.0001), 1 + manualDelayFactor);
  },

  updateCurrentTransform: function() {
    var tweenValue = easing.getValue();
    if(manual) {
      var val = Math.max(0.00001, manualValue - manualDelayFactor);
      easing.tick(val);
      tweenValue = easing.getValue();
    }
    tweener.tween(tweenValue);
  },

  completed: function() {
    if(stopped)
      return true;
    if(startTime === 0) {
      return false;
    }
    return easing.completed();
  },

  updateElement: function(element, forceUpdate) {
    if(!started && !forceUpdate)
      return;
    var matrix = tweener.asMatrix();
    var properties = tweener.getProperties();
    updateElementTransform(element, matrix, perspective);
    updateElementProperties(element, properties);
  }
};
};

// ------------------------------
// End Time animation
// ------------------------------

// ------------------------
// -- AttentionAnimation --
// ------------------------

var createAttentionAnimation = function(options) {
var movement = options.movement;
options.initialVelocity = 0.1;
options.equilibriumPosition = 0;
var spring = createSpringEasing(options);
var stopped = false;
var tweenPosition = movement.position;
var tweenRotation = movement.rotation;
var tweenRotationPost = movement.rotationPost;
var tweenScale = movement.scale;
var tweenSkew = movement.skew;

var currentMovement = createState({
  position: tweenPosition ? [0, 0, 0] : undefined,
  rotation: tweenRotation ? [0, 0, 0] : undefined,
  rotationPost: tweenRotationPost ? [0, 0, 0] : undefined,
  scale: tweenScale ? [0, 0] : undefined,
  skew: tweenSkew ? [0, 0] : undefined,
});

// Public API
return {
  stop: function() {
    stopped = true;
  },

  isStopped: function(time) {
    return stopped;
  },

  tick: function(time) {
    if(stopped)
      return;
    if(spring.equilibrium)
      return;
    spring.tick();

    this.updateMovement();
  },

  updateMovement:function() {
    var value = spring.getValue();
    if(tweenPosition) {
      currentMovement.position[0] = movement.position[0] * value;
      currentMovement.position[1] = movement.position[1] * value;
      currentMovement.position[2] = movement.position[2] * value;
    }
    if(tweenRotation) {
      currentMovement.rotation[0] = movement.rotation[0] * value;
      currentMovement.rotation[1] = movement.rotation[1] * value;
      currentMovement.rotation[2] = movement.rotation[2] * value;
    }
    if(tweenRotationPost) {
      currentMovement.rotationPost[0] = movement.rotationPost[0] * value;
      currentMovement.rotationPost[1] = movement.rotationPost[1] * value;
      currentMovement.rotationPost[2] = movement.rotationPost[2] * value;
    }
    if(tweenScale) {
      currentMovement.scale[0] = 1 + movement.scale[0] * value;
      currentMovement.scale[1] = 1 + movement.scale[1] * value;
    }

    if(tweenSkew) {
      currentMovement.skew[0] = movement.skew[0] * value;
      currentMovement.skew[1] = movement.skew[1] * value;
    }
  },

  updateElement: function(element) {
    updateElementTransform(element, currentMovement.asMatrix());
    updateElementProperties(element, currentMovement.getProperties());
  },

  getCurrentState: function() {
    return currentMovement;
  },

  completed: function() {
    return spring.equilibrium || stopped;
  },

  restart: function() {
    // Restart spring
    spring = createSpringEasing(options);
  }
};
};


/**********
* Easings *
***********/

var linearEasing = function(value) {
return value;
};

var ease = function(value) {
return (Math.cos(value*Math.PI + Math.PI) + 1)/2;
};

var easeIn = function(value) {
return value*value;
};

var easeOut = function(value) {
return -Math.pow(value - 1, 2) + 1;
};

var createSpringEasing = function(options) {
var position = optionOrDefault(options.startPosition, 0);
var equilibriumPosition = optionOrDefault(options.equilibriumPosition, 1);
var velocity = optionOrDefault(options.initialVelocity, 0);
var springConstant = optionOrDefault(options.springConstant, 0.8);
var deceleration = optionOrDefault(options.springDeceleration, 0.9);
var mass = optionOrDefault(options.springMass, 10);

var equilibrium = false;

// Public API
return {

  tick: function(value) {
    if(value === 0.0)
      return;
    if(equilibrium)
      return;
    var springForce = -(position - equilibriumPosition) * springConstant;
    // f = m * a
    // a = f / m
    var a = springForce / mass;
    // s = v * t
    // t = 1 ( for now )
    velocity += a;
    position += velocity;

    // Deceleration
    velocity *= deceleration;

    if(Math.abs(position - equilibriumPosition) < 0.001 && Math.abs(velocity) < 0.001) {
      equilibrium = true;
    }
  },

  resetFrom: function(value) {
    position = value;
    velocity = 0;
  },


  getValue: function() {
    if(equilibrium)
      return equilibriumPosition;
    return position;
  },

  completed: function() {
    return equilibrium;
  }
};
};

var EASING_FUNCS = {
'linear': linearEasing,
'ease': ease,
'easeIn': easeIn,
'easeOut': easeOut,
};


var createEaser = function(easerName, options) {
if(easerName == 'spring') {
  return createSpringEasing(options);
}
var easeFunction = easerName;
if(!isFunction(easerName)) {
  easeFunction = EASING_FUNCS[easerName];
}

var easer = easeFunction;
var value = 0;
var lastValue;

// Public API
return {
  tick: function(v) {
    value = easer(v);
    lastValue = v;
  },

  resetFrom: function(value) {
    lastValue = 0;
  },

  getValue: function() {
    return value;
  },

  completed: function() {
    if(lastValue >= 1) {
      return lastValue;
    }
    return false;
  }
};
};

/***
* Matrix related
*/

var assignTranslate = function(matrix, x, y, z) {
matrix[0] = 1;
matrix[1] = 0;
matrix[2] = 0;
matrix[3] = 0;
matrix[4] = 0;
matrix[5] = 1;
matrix[6] = 0;
matrix[7] = 0;
matrix[8] = 0;
matrix[9] = 0;
matrix[10] = 1;
matrix[11] = 0;
matrix[12] = x;
matrix[13] = y;
matrix[14] = z;
matrix[15] = 1;
};

var assignRotateX = function(matrix, rad) {
matrix[0] = 1;
matrix[1] = 0;
matrix[2] = 0;
matrix[3] = 0;
matrix[4] = 0;
matrix[5] = Math.cos(rad);
matrix[6] = -Math.sin(rad);
matrix[7] = 0;
matrix[8] = 0;
matrix[9] = Math.sin(rad);
matrix[10] = Math.cos(rad);
matrix[11] = 0;
matrix[12] = 0;
matrix[13] = 0;
matrix[14] = 0;
matrix[15] = 1;
};


var assignRotateY = function(matrix, rad) {
matrix[0] = Math.cos(rad);
matrix[1] = 0;
matrix[2] = Math.sin(rad);
matrix[3] = 0;
matrix[4] = 0;
matrix[5] = 1;
matrix[6] = 0;
matrix[7] = 0;
matrix[8] = -Math.sin(rad);
matrix[9] = 0;
matrix[10] = Math.cos(rad);
matrix[11] = 0;
matrix[12] = 0;
matrix[13] = 0;
matrix[14] = 0;
matrix[15] = 1;
};

var assignRotateZ = function(matrix, rad) {
matrix[0] = Math.cos(rad);
matrix[1] = -Math.sin(rad);
matrix[2] = 0;
matrix[3] = 0;
matrix[4] = Math.sin(rad);
matrix[5] = Math.cos(rad);
matrix[6] = 0;
matrix[7] = 0;
matrix[8] = 0;
matrix[9] = 0;
matrix[10] = 1;
matrix[11] = 0;
matrix[12] = 0;
matrix[13] = 0;
matrix[14] = 0;
matrix[15] = 1;
};

var assignSkew = function(matrix, ax, ay) {
matrix[0] = 1;
matrix[1] = Math.tan(ax);
matrix[2] = 0;
matrix[3] = 0;
matrix[4] = Math.tan(ay);
matrix[5] = 1;
matrix[6] = 0;
matrix[7] = 0;
matrix[8] = 0;
matrix[9] = 0;
matrix[10] = 1;
matrix[11] = 0;
matrix[12] = 0;
matrix[13] = 0;
matrix[14] = 0;
matrix[15] = 1;
};


var assignScale = function(matrix, x, y) {
matrix[0] = x;
matrix[1] = 0;
matrix[2] = 0;
matrix[3] = 0;
matrix[4] = 0;
matrix[5] = y;
matrix[6] = 0;
matrix[7] = 0;
matrix[8] = 0;
matrix[9] = 0;
matrix[10] = 1;
matrix[11] = 0;
matrix[12] = 0;
matrix[13] = 0;
matrix[14] = 0;
matrix[15] = 1;
};

var assignIdentity = function(matrix) {
matrix[0] = 1;
matrix[1] = 0;
matrix[2] = 0;
matrix[3] = 0;
matrix[4] = 0;
matrix[5] = 1;
matrix[6] = 0;
matrix[7] = 0;
matrix[8] = 0;
matrix[9] = 0;
matrix[10] = 1;
matrix[11] = 0;
matrix[12] = 0;
matrix[13] = 0;
matrix[14] = 0;
matrix[15] = 1;
};

var copyArray = function(a, b) {
b[0] = a[0];
b[1] = a[1];
b[2] = a[2];
b[3] = a[3];
b[4] = a[4];
b[5] = a[5];
b[6] = a[6];
b[7] = a[7];
b[8] = a[8];
b[9] = a[9];
b[10] = a[10];
b[11] = a[11];
b[12] = a[12];
b[13] = a[13];
b[14] = a[14];
b[15] = a[15];
};

var createMatrix = function() {
var data = new Float32Array(16);
var a = new Float32Array(16);
var b = new Float32Array(16);
assignIdentity(data);

return {
  data: data,

  asCSS: function() {
    var css = 'matrix3d(';
    for(var i=0;i<15;++i) {
      if(Math.abs(data[i]) < 0.0001)
        css += '0,';
      else
        css += data[i].toFixed(10) + ',';
    }
    if(Math.abs(data[15]) < 0.0001)
      css += '0)';
    else
      css += data[15].toFixed(10) + ')';
    return css;
  },

  clear: function() {
    assignIdentity(data);
  },

  translate: function(x, y, z) {
    copyArray(data, a);
    assignTranslate(b, x, y, z);
    assignedMatrixMultiplication(a, b, data);
    return this;
  },

  rotateX: function(radians) {
    copyArray(data, a);
    assignRotateX(b, radians);
    assignedMatrixMultiplication(a, b, data);
    return this;
  },

  rotateY: function(radians) {
    copyArray(data, a);
    assignRotateY(b, radians);
    assignedMatrixMultiplication(a, b, data);
    return this;
  },

  rotateZ: function(radians) {
    copyArray(data, a);
    assignRotateZ(b, radians);
    assignedMatrixMultiplication(a, b, data);
    return this;
  },

  scale: function(x, y) {
    copyArray(data, a);
    assignScale(b, x, y);
    assignedMatrixMultiplication(a, b, data);
    return this;
  },

  skew: function(ax, ay) {
    copyArray(data, a);
    assignSkew(b, ax, ay);
    assignedMatrixMultiplication(a, b, data);
    return this;
  }
};
};

var assignedMatrixMultiplication = function(a, b, res) {
// Unrolled loop
res[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
res[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
res[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
res[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

res[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
res[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
res[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
res[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

res[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
res[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
res[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
res[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

res[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
res[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
res[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
res[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

return res;
};

var createState = function(config) {
// Caching of matrix and properties so we don't have to create new ones everytime they are needed
var matrix = createMatrix();
var properties = {
  opacity: undefined,
  width: undefined,
  height: undefined
};

// Public API
return {
  position: config.position,
  rotation: config.rotation,
  rotationPost: config.rotationPost,
  skew: config.skew,
  scale: config.scale,
  scalePost: config.scalePost,
  opacity: config.opacity,
  width: config.width,
  height: config.height,


  clone: function() {
    return createState({
      position: this.position ? this.position.slice(0) : undefined,
      rotation: this.rotation ? this.rotation.slice(0) : undefined,
      rotationPost: this.rotationPost ? this.rotationPost.slice(0) : undefined,
      skew: this.skew ? this.skew.slice(0) : undefined,
      scale: this.scale ? this.scale.slice(0) : undefined,
      scalePost: this.scalePost ? this.scalePost.slice(0) : undefined,
      height: this.height,
      width: this.width,
      opacity: this.opacity
    });
  },

  asMatrix: function() {
    var m = matrix;
    m.clear();

    if(this.transformOrigin)
      m.translate(-this.transformOrigin[0], -this.transformOrigin[1], -this.transformOrigin[2]);

    if(this.scale) {
      m.scale(this.scale[0], this.scale[1]);
    }

    if(this.skew) {
      m.skew(this.skew[0], this.skew[1]);
    }

    if(this.rotation) {
      m.rotateX(this.rotation[0]);
      m.rotateY(this.rotation[1]);
      m.rotateZ(this.rotation[2]);
    }

    if(this.position) {
      m.translate(this.position[0], this.position[1], this.position[2]);
    }

    if(this.rotationPost) {
      m.rotateX(this.rotationPost[0]);
      m.rotateY(this.rotationPost[1]);
      m.rotateZ(this.rotationPost[2]);
    }

    if(this.scalePost) {
      m.scale(this.scalePost[0], this.scalePost[1]);
    }

    if(this.transformOrigin)
      m.translate(this.transformOrigin[0], this.transformOrigin[1], this.transformOrigin[2]);
    return m;
  },

  getProperties: function() {
    properties.opacity = this.opacity;
    properties.width = this.width + 'px';
    properties.height = this.height + 'px';
    return properties;
  }
};
};
// ------------------
// -- StateTweener -- 
// -------------------

var createStateTweener = function(startState, endState, resultState) {
var start = startState;
var end = endState;
var result = resultState;

var tweenPosition = end.position !== undefined;
var tweenRotation = end.rotation !== undefined;
var tweenRotationPost = end.rotationPost !== undefined;
var tweenScale = end.scale !== undefined;
var tweenSkew = end.skew !== undefined;
var tweenWidth = end.width !== undefined;
var tweenHeight = end.height !== undefined;
var tweenOpacity = end.opacity !== undefined;

// Public API
return {

  tween: function(tweenValue) {

    if(tweenPosition) {
      var dX = (end.position[0] - start.position[0]);
      var dY = (end.position[1] - start.position[1]);
      var dZ = (end.position[2] - start.position[2]);
      result.position[0] = start.position[0] + tweenValue*dX;
      result.position[1] = start.position[1] + tweenValue*dY;
      result.position[2] = start.position[2] + tweenValue*dZ;
    }

    if(tweenRotation) {
      var dAX = (end.rotation[0] - start.rotation[0]);
      var dAY = (end.rotation[1] - start.rotation[1]);
      var dAZ = (end.rotation[2] - start.rotation[2]);
      result.rotation[0] = start.rotation[0] + tweenValue*dAX;
      result.rotation[1] = start.rotation[1] + tweenValue*dAY;
      result.rotation[2] = start.rotation[2] + tweenValue*dAZ;
    }

    if(tweenRotationPost) {
      var dBX = (end.rotationPost[0] - start.rotationPost[0]);
      var dBY = (end.rotationPost[1] - start.rotationPost[1]);
      var dBZ = (end.rotationPost[2] - start.rotationPost[2]);
      result.rotationPost[0] = start.rotationPost[0] + tweenValue*dBX;
      result.rotationPost[1] = start.rotationPost[1] + tweenValue*dBY;
      result.rotationPost[2] = start.rotationPost[2] + tweenValue*dBZ;
    }

    if(tweenSkew) {
      var dSX = (end.scale[0] - start.scale[0]);
      var dSY = (end.scale[1] - start.scale[1]);

      result.scale[0] = start.scale[0] + tweenValue*dSX;
      result.scale[1] = start.scale[1] + tweenValue*dSY;
    }

    if(tweenScale) {
      var dSkewX = (end.skew[0] - start.skew[0]);
      var dSkewY = (end.skew[1] - start.skew[1]);

      result.skew[0] = start.skew[0] + tweenValue*dSkewX;
      result.skew[1] = start.skew[1] + tweenValue*dSkewY;
    }

    if(tweenWidth) {
      var dWidth = (end.width - start.width);
      result.width = start.width + tweenValue*dWidth;
    }


    if(tweenHeight) {
      var dHeight = (end.height - start.height);
      result.height = start.height + tweenValue*dHeight;
    }

    if(tweenOpacity) {
      var dOpacity = (end.opacity - start.opacity);
      result.opacity = start.opacity + tweenValue*dOpacity;
    }

  },

  asMatrix: function() {
    return result.asMatrix();
  },

  getProperties: function() {
    return result.getProperties();
  },

  setReverse: function() {
    var oldStart = start;
    start = end;
    end = oldStart;
  }
};
};

// ------------------------
// -- ValueFeederTweener -- 
// ------------------------

var createValueFeederTweener = function(valueFeeder, startState, endState, resultState) {
var currentMatrix = valueFeeder(0, createMatrix());
var start = startState;
var end = endState;
var result = resultState;
var reverse = false;


// Public API
return {

  tween: function(tweenValue) {
    if(reverse)
      tweenValue = 1 - tweenValue;
    currentMatrix.clear();
    currentMatrix = valueFeeder(tweenValue, currentMatrix);

    var dWidth = (end.width - start.width);
    var dHeight = (end.height - start.height);
    var dOpacity = (end.opacity - start.opacity);

    if(end.width !== undefined)
      result.width = start.width + tweenValue*dWidth;
    if(end.height !== undefined)
      result.height = start.height + tweenValue*dHeight;
    if(end.opacity !== undefined)
      result.opacity = start.opacity + tweenValue*dOpacity;
  },

  asMatrix: function() {
    return currentMatrix;
  },

  getProperties: function() {
    return result.getProperties();
  },

  setReverse: function() {
    reverse = true;
  }

};
};

var optionOrDefault = function(option, def) {
if(typeof option == 'undefined') {
  return def;
}
return option;
};

var updateElementTransform = function(element, matrix, perspective) {
var cssPerspective = '';
if(perspective) {
  cssPerspective = 'perspective(' + perspective + 'px) ';
}
var cssMatrix = matrix.asCSS();
element.style[transformProperty] = cssPerspective + cssMatrix;
};

var updateElementProperties = function(element, properties) {
for(var key in properties) {
  element.style[key] = properties[key];
}
};

var isFunction = function(object) {
return (typeof object === "function");
};

var cloneObject = function(object) {
if(!object)
  return object;
var clone = {};
for(var key in object) {
  clone[key] = object[key];
}
return clone;
};

snabbt.createMatrix = createMatrix;
snabbt.setElementTransform = updateElementTransform;
return snabbt;
}());
var stackBlur = (function(){

var mul_table = [
    512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
    454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
    482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
    437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
    497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
    320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
    446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
    329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
    505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
    399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
    324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,
    268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
    451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
    385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
    332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
    289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];


var shg_table = [
    9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
    17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
    19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];

function getImageDataFromCanvas(canvas, top_x, top_y, width, height)
{
    if (typeof(canvas) == 'string')
        canvas  = document.getElementById(canvas);
    else if (!canvas instanceof HTMLCanvasElement)
        return;

    var context = canvas.getContext('2d');
    var imageData;

    try {
        try {
            imageData = context.getImageData(top_x, top_y, width, height);
        } catch(e) {
            throw new Error("unable to access local image data: " + e);
            return;
        }
    } catch(e) {
        throw new Error("unable to access image data: " + e);
    }

    return imageData;
}

function processCanvasRGBA(canvas, top_x, top_y, width, height, radius)
{
    if (isNaN(radius) || radius < 1) return;
    radius |= 0;

    var imageData = getImageDataFromCanvas(canvas, top_x, top_y, width, height);

    imageData = processImageDataRGBA(imageData, top_x, top_y, width, height, radius);

    canvas.getContext('2d').putImageData(imageData, top_x, top_y);
}

function processImageDataRGBA(imageData, top_x, top_y, width, height, radius)
{
    var pixels = imageData.data;

    var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
        r_out_sum, g_out_sum, b_out_sum, a_out_sum,
        r_in_sum, g_in_sum, b_in_sum, a_in_sum,
        pr, pg, pb, pa, rbs;

    var div = radius + radius + 1;
    var w4 = width << 2;
    var widthMinus1  = width - 1;
    var heightMinus1 = height - 1;
    var radiusPlus1  = radius + 1;
    var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

    var stackStart = new BlurStack();
    var stack = stackStart;
    for (i = 1; i < div; i++)
    {
        stack = stack.next = new BlurStack();
        if (i == radiusPlus1) var stackEnd = stack;
    }
    stack.next = stackStart;
    var stackIn = null;
    var stackOut = null;

    yw = yi = 0;

    var mul_sum = mul_table[radius];
    var shg_sum = shg_table[radius];

    for (y = 0; y < height; y++)
    {
        r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi+1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi+2]);
        a_out_sum = radiusPlus1 * (pa = pixels[yi+3]);

        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;

        stack = stackStart;

        for (i = 0; i < radiusPlus1; i++)
        {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack.a = pa;
            stack = stack.next;
        }

        for (i = 1; i < radiusPlus1; i++)
        {
            p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
            r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
            g_sum += (stack.g = (pg = pixels[p+1])) * rbs;
            b_sum += (stack.b = (pb = pixels[p+2])) * rbs;
            a_sum += (stack.a = (pa = pixels[p+3])) * rbs;

            r_in_sum += pr;
            g_in_sum += pg;
            b_in_sum += pb;
            a_in_sum += pa;

            stack = stack.next;
        }


        stackIn = stackStart;
        stackOut = stackEnd;
        for (x = 0; x < width; x++)
        {
            pixels[yi+3] = pa = (a_sum * mul_sum) >> shg_sum;
            if (pa != 0)
            {
                pa = 255 / pa;
                pixels[yi]   = ((r_sum * mul_sum) >> shg_sum) * pa;
                pixels[yi+1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                pixels[yi+2] = ((b_sum * mul_sum) >> shg_sum) * pa;
            } else {
                pixels[yi] = pixels[yi+1] = pixels[yi+2] = 0;
            }

            r_sum -= r_out_sum;
            g_sum -= g_out_sum;
            b_sum -= b_out_sum;
            a_sum -= a_out_sum;

            r_out_sum -= stackIn.r;
            g_out_sum -= stackIn.g;
            b_out_sum -= stackIn.b;
            a_out_sum -= stackIn.a;

            p =  (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;

            r_in_sum += (stackIn.r = pixels[p]);
            g_in_sum += (stackIn.g = pixels[p+1]);
            b_in_sum += (stackIn.b = pixels[p+2]);
            a_in_sum += (stackIn.a = pixels[p+3]);

            r_sum += r_in_sum;
            g_sum += g_in_sum;
            b_sum += b_in_sum;
            a_sum += a_in_sum;

            stackIn = stackIn.next;

            r_out_sum += (pr = stackOut.r);
            g_out_sum += (pg = stackOut.g);
            b_out_sum += (pb = stackOut.b);
            a_out_sum += (pa = stackOut.a);

            r_in_sum -= pr;
            g_in_sum -= pg;
            b_in_sum -= pb;
            a_in_sum -= pa;

            stackOut = stackOut.next;

            yi += 4;
        }
        yw += width;
    }


    for (x = 0; x < width; x++)
    {
        g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

        yi = x << 2;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi+1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi+2]);
        a_out_sum = radiusPlus1 * (pa = pixels[yi+3]);

        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;

        stack = stackStart;

        for (i = 0; i < radiusPlus1; i++)
        {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack.a = pa;
            stack = stack.next;
        }

        yp = width;

        for (i = 1; i <= radius; i++)
        {
            yi = (yp + x) << 2;

            r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
            g_sum += (stack.g = (pg = pixels[yi+1])) * rbs;
            b_sum += (stack.b = (pb = pixels[yi+2])) * rbs;
            a_sum += (stack.a = (pa = pixels[yi+3])) * rbs;

            r_in_sum += pr;
            g_in_sum += pg;
            b_in_sum += pb;
            a_in_sum += pa;

            stack = stack.next;

            if(i < heightMinus1)
            {
                yp += width;
            }
        }

        yi = x;
        stackIn = stackStart;
        stackOut = stackEnd;
        for (y = 0; y < height; y++)
        {
            p = yi << 2;
            pixels[p+3] = pa = (a_sum * mul_sum) >> shg_sum;
            if (pa > 0)
            {
                pa = 255 / pa;
                pixels[p]   = ((r_sum * mul_sum) >> shg_sum) * pa;
                pixels[p+1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                pixels[p+2] = ((b_sum * mul_sum) >> shg_sum) * pa;
            } else {
                pixels[p] = pixels[p+1] = pixels[p+2] = 0;
            }

            r_sum -= r_out_sum;
            g_sum -= g_out_sum;
            b_sum -= b_out_sum;
            a_sum -= a_out_sum;

            r_out_sum -= stackIn.r;
            g_out_sum -= stackIn.g;
            b_out_sum -= stackIn.b;
            a_out_sum -= stackIn.a;

            p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;

            r_sum += (r_in_sum += (stackIn.r = pixels[p]));
            g_sum += (g_in_sum += (stackIn.g = pixels[p+1]));
            b_sum += (b_in_sum += (stackIn.b = pixels[p+2]));
            a_sum += (a_in_sum += (stackIn.a = pixels[p+3]));

            stackIn = stackIn.next;

            r_out_sum += (pr = stackOut.r);
            g_out_sum += (pg = stackOut.g);
            b_out_sum += (pb = stackOut.b);
            a_out_sum += (pa = stackOut.a);

            r_in_sum -= pr;
            g_in_sum -= pg;
            b_in_sum -= pb;
            a_in_sum -= pa;

            stackOut = stackOut.next;

            yi += width;
        }
    }
    return imageData;
}

function BlurStack()
{
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 0;
    this.next = null;
}

return processCanvasRGBA;

}());
// canvas to blob polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill
if (!HTMLCanvasElement.prototype.toBlob) {
	Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
		value: function (callback, type, quality) {

			var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
				len = binStr.length,
				arr = new Uint8Array(len);

			for (var i=0; i<len; i++ ) {
				arr[i] = binStr.charCodeAt(i);
			}

			callback( new Blob( [arr], {type: type || 'image/png'} ) );
		}
	});
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var copyString = function copyString(str) {
	return str + '';
};

var getDataset = function getDataset(el) {

	if (typeof el.dataset === 'undefined') {
		var res = {};
		var attr;
		var attrName;
		var attrs = el.attributes;
		for (attr in attrs) {
			if (attrs.hasOwnProperty(attr) && attrs[attr].name && /^data-[a-z_\-\d]*$/i.test(attrs[attr].name)) {
				attrName = toCamelCase(attrs[attr].name.substr(5));
				res[attrName] = attrs[attr].value;
			}
		}
		return res;
	}
	return el.dataset;
};

var toCamelCase = function toCamelCase(str) {
	return str.replace(/\-./g, function (substr) {
		return substr.charAt(1).toUpperCase();
	});
};

var getElementAttributes = function getElementAttributes(el) {
	// is a for loop on purpose as this should still function when Slim not supported
	var result = [];
	var attributes = Array.prototype.slice.call(el.attributes);
	var l = attributes.length;
	for (var i = 0; i < l; i++) {
		result.push({
			name: attributes[i].name,
			value: attributes[i].value
		});
	}
	return result;
};

// helper method
var getOffsetByEvent = function getOffsetByEvent(e) {
	return {
		x: typeof e.offsetX === 'undefined' ? e.layerX : e.offsetX,
		y: typeof e.offsetY === 'undefined' ? e.layerY : e.offsetY
	};
};

// merge two objects together
var mergeOptions = function mergeOptions(base, additives) {

	var key;
	var options = {};
	var optionsToMerge = additives || {};

	for (key in base) {
		if (!base.hasOwnProperty(key)) {
			continue;
		}
		options[key] = typeof optionsToMerge[key] === 'undefined' ? base[key] : optionsToMerge[key];
	}

	return options;
};

// keys
var Key = {
	ESC: 27,
	RETURN: 13
};

// pointer events
var Events = {
	DOWN: ['touchstart', 'pointerdown', 'mousedown'],
	MOVE: ['touchmove', 'pointermove', 'mousemove'],
	UP: ['touchend', 'touchcancel', 'pointerup', 'mouseup']
};

var MimeTypes = {
	'jpeg': 'image/jpeg',
	'jpg': 'image/jpeg',
	'jpe': 'image/jpeg',
	'png': 'image/png',
	'gif': 'image/gif',
	'bmp': 'image/bmp'
};

var ImageExtensionsRegex = /(\.png|\.bmp|\.gif|\.jpg|\.jpe|\.jpg|\.jpeg)$/;

var CanvasExportExtensions = /(jpe|jpg|jpeg|png)/;

// shortcuts
var create = function create(name, className) {
	var node = document.createElement(name);
	if (className) {
		node.className = className;
	}
	return node;
};

// events
var addEvents = function addEvents(obj, events, scope) {
	events.forEach(function (event) {
		obj.addEventListener(event, scope, false);
	});
};

var removeEvents = function removeEvents(obj, events, scope) {
	events.forEach(function (event) {
		obj.removeEventListener(event, scope, false);
	});
};

var getEventOffset = function getEventOffset(e) {

	var event = e.changedTouches ? e.changedTouches[0] : e;

	// no event found, quit!
	if (!event) {
		return;
	}

	// get offset from events
	return {
		x: event.pageX,
		y: event.pageY
	};
};

var rotate = function rotate(rect, angle) {

	var cx = .5;
	var cy = .5;

	var radians = Math.PI / 180 * angle;
	var cos = Math.cos(radians);
	var sin = Math.sin(radians);

	var x1 = rect.x;
	var y1 = rect.y;
	var x2 = rect.x + rect.width;
	var y2 = rect.y + rect.height;

	var rx1 = cos * (x1 - cx) + sin * (y1 - cy) + cx;
	var ry1 = cos * (y1 - cy) - sin * (x1 - cx) + cy;

	var rx2 = cos * (x2 - cx) + sin * (y2 - cy) + cx;
	var ry2 = cos * (y2 - cy) - sin * (x2 - cx) + cy;

	if (rx1 <= rx2) {
		rect.x = rx1;
		rect.width = rx2 - rx1;
	} else {
		rect.x = rx2;
		rect.width = rx1 - rx2;
	}

	if (ry1 <= ry2) {
		rect.y = ry1;
		rect.height = ry2 - ry1;
	} else {
		rect.y = ry2;
		rect.height = ry1 - ry2;
	}
};

var getEventOffsetScroll = function getEventOffsetScroll(e) {
	var offset = getEventOffset(e);
	offset.x -= window.pageXOffset || document.documentElement.scrollLeft;
	offset.y -= window.pageYOffset || document.documentElement.scrollTop;
	return offset;
};

var lowercaseFirstLetter = function lowercaseFirstLetter(string) {
	return string.charAt(0).toLowerCase() + string.slice(1);
};

var capitalizeFirstLetter = function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

var last = function last(array) {
	return array[array.length - 1];
};

var limit = function limit(value, min, max) {
	return Math.max(min, Math.min(max, value));
};

var inArray = function inArray(needle, arr) {
	// is for loop so we can use this method on older browsers to render fallback message
	if (!arr) {
		return false;
	}
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] === needle) {
			return true;
		}
	}
	return false;
};

var send = function send(url, data, requestDecorator, progress, success, err) {

	var xhr = new XMLHttpRequest();

	// if progress callback defined handle progress events
	if (progress) {
		xhr.upload.addEventListener('progress', function (e) {
			progress(e.loaded, e.total);
		});
	}

	// open the request
	xhr.open('POST', url, true);

	// if request decorator defined pass XMLHttpRequest instance to decorator
	if (requestDecorator) {
		requestDecorator(xhr);
	}

	// handle state changes
	xhr.onreadystatechange = function () {

		if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {

			var text = xhr.responseText;

			// if no data returned from server assume success
			if (!text.length) {
				success();
				return;
			}

			// catch possible PHP content length problem
			if (text.indexOf('Content-Length') !== -1) {
				err('file-too-big');
				return;
			}

			// if data returned it should be in suggested JSON format
			var obj = void 0;
			try {
				obj = JSON.parse(xhr.responseText);
			} catch (e) {}

			// if is failure response
			if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj.status === 'failure') {
				err(obj.message);
				return;
			}

			success(obj || text);
		} else if (xhr.readyState === 4) {

			var _obj = void 0;
			try {
				_obj = JSON.parse(xhr.responseText);
			} catch (e) {}

			// if is clean failure response
			if ((typeof _obj === 'undefined' ? 'undefined' : _typeof(_obj)) === 'object' && _obj.status === 'failure') {
				err(_obj.message);
				return;
			}

			err('fail');
		}
	};

	// do request
	xhr.send(data);
};

var resetTransforms = function resetTransforms(element) {
	if (!element) {
		return;
	}
	element.style.webkitTransform = '';
	element.style.transform = '';
};

var bytesToMegaBytes = function bytesToMegaBytes(b) {
	return b / 1000000;
};

var megaBytesToBytes = function megaBytesToBytes(mb) {
	return mb * 1000000;
};

var getCommonMimeTypes = function getCommonMimeTypes() {
	var types = [];
	var type = void 0;
	var mimeType = void 0;
	for (type in MimeTypes) {
		if (!MimeTypes.hasOwnProperty(type)) {
			continue;
		}
		mimeType = MimeTypes[type];
		if (types.indexOf(mimeType) == -1) {
			types.push(mimeType);
		}
	}
	return types;
};

var isJPEGMimeType = function isJPEGMimeType(type) {
	return type === 'image/jpeg';
};

var getExtensionByMimeType = function getExtensionByMimeType(mimetype) {
	var type = void 0;
	for (type in MimeTypes) {
		if (!MimeTypes.hasOwnProperty(type)) {
			continue;
		}
		if (MimeTypes[type] === mimetype) {
			return type;
		}
	}
	return mimetype;
};

var getMimeTypeFromResponseType = function getMimeTypeFromResponseType(responseType) {
	var type = void 0;
	for (type in MimeTypes) {
		if (!MimeTypes.hasOwnProperty(type)) {
			continue;
		}
		if (responseType.indexOf(MimeTypes[type]) !== -1) {
			return MimeTypes[type];
		}
	}
	return null;
};

var getFileName = function getFileName(path) {
	return path.split('/').pop().split('?').shift();
};

var leftPad = function leftPad(value) {
	var padding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	return (padding + value).slice(-padding.length);
};

var getDateString = function getDateString(date) {
	return date.getFullYear() + '-' + leftPad(date.getMonth() + 1, '00') + '-' + leftPad(date.getDate(), '00') + '_' + leftPad(date.getHours(), '00') + '-' + leftPad(date.getMinutes(), '00') + '-' + leftPad(date.getSeconds(), '00');
};

var getFileNameByFile = function getFileNameByFile(file) {
	if (typeof file.name === 'undefined') {
		return getDateString(new Date()) + '.' + getExtensionByMimeType(getFileTypeByFile(file));
	}
	return file.name;
};

var getFileTypeByFile = function getFileTypeByFile(file) {
	return file.type || 'image/jpeg';
};

var getFileNameWithoutExtension = function getFileNameWithoutExtension(path) {
	if (typeof path !== 'string') {
		return getDateString(new Date());
	}
	var name = getFileName(path);
	return name.split('.').shift();
};

var blobToFile = function blobToFile(blob, name) {
	blob.lastModifiedDate = new Date();
	blob.name = name;
	return blob;
};

var resourceIsFetchURL = function resourceIsFetchURL(resource) {
	return (/^fetch\//.test(resource)
	);
};

var resourceIsBase64Data = function resourceIsBase64Data(resource) {
	return (/^data:image/.test(resource)
	);
};

var loadRemoteURL = function loadRemoteURL(fetcher, url, err, cb) {

	var xhr = new XMLHttpRequest();
	xhr.open('GET', fetcher + '?url=' + url, true);
	xhr.responseType = 'json';
	xhr.onload = function (e) {

		if (this.response.status === 'failure') {
			err(this.response.message);
			return;
		}

		loadURL(this.response.body, cb);
	};

	xhr.send();
};

var loadURL = function loadURL(url, cb) {

	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'blob';
	xhr.onload = function (e) {

		var name = getFileName(url);
		var type = getMimeTypeFromResponseType(this.response.type);

		if (!ImageExtensionsRegex.test(name)) {
			name += '.' + getExtensionByMimeType(type);
		}

		// get as file
		var file = blobToFile(this.response, name);

		// need to set correct type
		cb(cloneFile(file, type));
	};

	xhr.send();
};

var base64ToByteString = function base64ToByteString(dataURI) {

	// get data part of string (remove data:image/jpeg...,)
	var dataPart = dataURI.split(',')[1];

	// remove any whitespace as that causes InvalidCharacterError in IE
	var dataPartCleaned = dataPart.replace(/\s/g, '');

	// to bytestring
	return atob(dataPartCleaned);
};

var base64ToBlob = function base64ToBlob(dataURI, filename) {

	var byteString = base64ToByteString(dataURI);
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);

	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}

	var mimeType = getMimeTypeFromDataURI(dataURI);

	if (typeof filename === 'undefined') {
		filename = getDateString(new Date()) + '.' + getExtensionByMimeType(mimeType);
	}

	return blobToFile(createBlob(ab, mimeType), filename);
};

var createBlob = function createBlob(data, mimeType) {

	var BB = window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;

	if (BB) {
		var bb = new BB();
		bb.append(data);
		return bb.getBlob(mimeType);
	}

	return new Blob([data], {
		type: mimeType
	});
};

var getImageAsCanvas = function getImageAsCanvas(src, size, callback) {

	// only cross origin when it's not base64 data, to prevent errors in Safari
	// http://stackoverflow.com/questions/31643096/why-does-safari-throw-cors-error-when-setting-base64-data-on-a-crossorigin-an
	var crossOrigin = typeof src === 'string' ? src.indexOf('data:image') !== 0 : true;

	loadImage.parseMetaData(src, function (meta) {

		var options = {
			canvas: true,
			crossOrigin: crossOrigin
		};

		if (size) {
			options.maxWidth = size.width;
			options.maxHeight = size.height;
		}

		if (meta.exif) {
			options.orientation = meta.exif.get('Orientation');
		}

		loadImage(src, function (res) {

			if (res.type === 'error') {
				callback();
				return;
			}

			callback(res, meta);
		}, options);
	});
};

var getAutoCropRect = function getAutoCropRect(width, height, ratioOut) {

	var x,
	    y,
	    w,
	    h,
	    ratioIn = height / width;

	// if input is portrait and required is landscape
	// width is portrait width, height is width times outputRatio
	if (ratioIn < ratioOut) {
		h = height;
		w = h / ratioOut;
		x = (width - w) * .5;
		y = 0;
	}

	// if input is landscape and required is portrait
	// height is landscape height, width is height divided by outputRatio
	else {
			w = width;
			h = w * ratioOut;
			x = 0;
			y = (height - h) * .5;
		}

	return {
		x: x,
		y: y,
		height: h,
		width: w
	};
};

var transformCanvas = function transformCanvas(canvas) {
	var transforms = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var cb = arguments[2];


	var result = create('canvas');

	var rotation = transforms.rotation,
	    crop = transforms.crop,
	    size = transforms.size,
	    filters = transforms.filters;

	// do crop transforms

	if (crop) {

		// do crop
		var isTilted = rotation % 180 !== 0;
		var space = {
			width: isTilted ? canvas.height : canvas.width,
			height: isTilted ? canvas.width : canvas.height
		};

		// limit crop to size of canvas else safari might return transparent image
		if (crop.x < 0) {
			crop.x = 0;
		}

		if (crop.y < 0) {
			crop.y = 0;
		}

		if (crop.width > space.width) {
			crop.width = space.width;
		}

		if (crop.height > space.height) {
			crop.height = space.height;
		}

		if (crop.y + crop.height > space.height) {
			crop.y = Math.max(0, space.height - crop.height);
		}

		if (crop.x + crop.width > space.width) {
			crop.x = Math.max(0, space.width - crop.width);
		}

		// crop offsets in percentages
		var px = crop.x / space.width;
		var py = crop.y / space.height;
		var pw = crop.width / space.width;
		var ph = crop.height / space.height;

		// resize canvas to the final crop result size
		result.width = crop.width;
		result.height = crop.height;

		// draw the crop
		var ctx = result.getContext('2d');

		if (rotation === 90) {

			ctx.translate(result.width * .5, result.height * .5);
			ctx.rotate(-90 * Math.PI / 180);
			ctx.drawImage(canvas,

			// source rectangle (crop area)
			(1 - py) * canvas.width - canvas.width * ph, crop.x, crop.height, crop.width,

			// target area (cover)
			-result.height * .5, -result.width * .5, result.height, result.width);
		} else if (rotation === 180) {

			ctx.translate(result.width * .5, result.height * .5);
			ctx.rotate(-180 * Math.PI / 180);
			ctx.drawImage(canvas,

			// source rectangle (crop area)
			(1 - (px + pw)) * space.width, (1 - (py + ph)) * space.height, pw * space.width, ph * space.height,

			// target area (cover)
			-result.width * .5, -result.height * .5, result.width, result.height);
		} else if (rotation === 270) {

			ctx.translate(result.width * .5, result.height * .5);
			ctx.rotate(-270 * Math.PI / 180);
			ctx.drawImage(canvas,

			// source rectangle (crop area)
			crop.y, (1 - px) * canvas.height - canvas.height * pw, crop.height, crop.width,

			// target area (cover)
			-result.height * .5, -result.width * .5, result.height, result.width);
		} else {

			ctx.drawImage(canvas,

			// source rectangle (crop area)
			crop.x, crop.y, crop.width, crop.height,

			// target area (cover)
			0, 0, result.width, result.height);
		}
	}

	// do size transforms
	if (size) {

		var scalarX = size.width / result.width;
		var scalarY = size.height / result.height;
		var scalar = Math.min(scalarX, scalarY);

		scaleCanvas(result, scalar, size);

		// sharpen result
		if (filters.sharpen > 0) {
			filter(result, sharpen(filters.sharpen));
		}
	}

	cb(result);
};

function scaleCanvas(canvas, scalar, bounds) {

	// if not scaling down, bail out
	if (scalar >= 1) {
		return;
	}

	var targetWidth = Math.min(bounds.width, Math.round(canvas.width * scalar));
	var targetHeight = Math.min(bounds.height, Math.round(canvas.height * scalar));
	var w = canvas.width;
	var h = canvas.height;
	var tmp = canvas;
	var c = void 0;
	var ctx = void 0;

	while (w > targetWidth && h > targetHeight) {

		c = document.createElement('canvas');
		w = Math.round(tmp.width * .5);
		h = Math.round(tmp.height * .5);

		if (w < targetWidth) {
			w = targetWidth;
		}

		if (h < targetHeight) {
			h = targetHeight;
		}

		c.width = w;
		c.height = h;
		ctx = c.getContext('2d');
		ctx.drawImage(tmp, 0, 0, w, h);

		tmp = cloneCanvas(c);
	}

	canvas.width = targetWidth;
	canvas.height = targetHeight;
	ctx = canvas.getContext('2d');
	ctx.drawImage(tmp, 0, 0, targetWidth, targetHeight);
}

var getPixels = function getPixels(canvas) {
	var ctx = canvas.getContext('2d');
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

var filter = function filter(canvas, _filter) {
	var ctx = canvas.getContext('2d');
	ctx.putImageData(_filter(getPixels(canvas), canvas.width, canvas.height), 0, 0);
};

var createImageData = function createImageData(w, h, pixels) {
	var c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	var ctx = c.getContext('2d');
	var data = ctx.createImageData(c.width, c.height);
	if (pixels) {
		data.set(pixels.data);
	}
	return data;
};

var sharpen = function sharpen(mix) {

	return function (pixels, w, h) {

		var weights = [0, -1, 0, -1, 5, -1, 0, -1, 0],
		    katet = Math.round(Math.sqrt(weights.length)),
		    half = katet * 0.5 | 0,
		    dstData = createImageData(w, h),
		    dstBuff = dstData.data,
		    srcBuff = pixels.data,
		    y = h,
		    x = void 0;

		while (y--) {

			x = w;

			while (x--) {

				var sy = y,
				    sx = x,
				    dstOff = (y * w + x) * 4,
				    r = 0,
				    g = 0,
				    b = 0,
				    a = 0;

				for (var cy = 0; cy < katet; cy++) {
					for (var cx = 0; cx < katet; cx++) {

						var scy = sy + cy - half;
						var scx = sx + cx - half;

						if (scy >= 0 && scy < h && scx >= 0 && scx < w) {

							var srcOff = (scy * w + scx) * 4;
							var wt = weights[cy * katet + cx];

							r += srcBuff[srcOff] * wt;
							g += srcBuff[srcOff + 1] * wt;
							b += srcBuff[srcOff + 2] * wt;
							a += srcBuff[srcOff + 3] * wt;
						}
					}
				}

				dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
				dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
				dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
				dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
			}
		}

		return dstData;
	};
};

var sizeDist = function sizeDist(rect, canvas) {

	var dx = Math.abs(rect.width - canvas.width);
	var dy = Math.abs(rect.height - canvas.height);

	return Math.max(dx, dy);
};

var cloneCanvas = function cloneCanvas(original) {
	return cloneCanvasScaled(original, 1);
};

var cloneCanvasScaled = function cloneCanvasScaled(original, scalar) {

	if (!original) {
		return null;
	}

	var duplicate = document.createElement('canvas');
	var ctx = duplicate.getContext('2d');
	duplicate.width = original.width;
	duplicate.height = original.height;
	ctx.drawImage(original, 0, 0);
	if (scalar > 0 && scalar != 1) {
		scaleCanvas(duplicate, scalar, {
			width: Math.round(original.width * scalar),
			height: Math.round(original.height * scalar)
		});
	}

	return duplicate;
};

var canvasHasDimensions = function canvasHasDimensions(canvas) {
	return canvas.width && canvas.height;
};

var copyCanvas = function copyCanvas(original, destination) {

	var ctx = destination.getContext('2d');
	if (canvasHasDimensions(destination)) {
		ctx.drawImage(original, 0, 0, destination.width, destination.height);
	} else {
		destination.width = original.width;
		destination.height = original.height;
		ctx.drawImage(original, 0, 0);
	}
};

var clearCanvas = function clearCanvas(canvas) {
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};

var blurCanvas = function blurCanvas(canvas) {
	stackBlur(canvas, 0, 0, canvas.width, canvas.height, 3);
};

var covers = function covers(image, rect) {
	return parseInt(image.width, 10) >= rect.width && parseInt(image.height, 10) >= rect.height;
};

var scaleRect = function scaleRect(rect, w, h) {
	return {
		x: rect.x * w,
		y: rect.y * h,
		width: rect.width * w,
		height: rect.height * h
	};
};

var divideRect = function divideRect(rect, w, h) {
	return {
		x: rect.x / w,
		y: rect.y / h,
		width: rect.width / w,
		height: rect.height / h
	};
};

var resetFileInput = function resetFileInput(input) {

	// no value, no need to reset
	if (!input || input.value === '') {
		return;
	}

	try {
		// for modern browsers
		input.value = '';
	} catch (err) {}

	// for IE10
	if (input.value) {

		// quickly append input to temp form and reset form
		var form = document.createElement('form');
		var parentNode = input.parentNode;
		var ref = input.nextSibling;
		form.appendChild(input);
		form.reset();

		// re-inject input where it originally was
		if (ref) {
			parentNode.insertBefore(input, ref);
		} else {
			parentNode.appendChild(input);
		}
	}
};

var clone = function clone(obj) {
	if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null) {
		return JSON.parse(JSON.stringify(obj));
	}
	return obj;
};

var cloneFile = function cloneFile(file) {
	var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	if (!file) {
		return null;
	}
	var dupe = file.slice(0, file.size, type || file.type);
	dupe.name = file.name;
	if (file.lastModifiedDate) {
		dupe.lastModifiedDate = new Date(file.lastModifiedDate);
	}
	return dupe;
};

var cloneData = function cloneData(obj) {
	var dupe = clone(obj);
	dupe.input.file = cloneFile(obj.input.file);
	dupe.output.image = cloneCanvas(obj.output.image);
	return dupe;
};

/**
 * @param image
 * @param type
 * @param jpegCompression - value between 0 and 100 or undefined/null to use default compression
 * @returns {*}
 */
var toDataURL = function toDataURL(image, type, jpegCompression) {
	if (!image || !type) {
		return null;
	}
	return image.toDataURL(type, isJPEGMimeType(type) && typeof jpegCompression === 'number' ? jpegCompression / 100 : undefined);
};

var getMimeTypeFromDataURI = function getMimeTypeFromDataURI(dataUri) {
	if (!dataUri) {
		return null;
	}
	var matches = dataUri.substr(0, 16).match(/^.+;/);
	if (matches.length) {
		return matches[0].substring(5, matches[0].length - 1);
	}
	return null;
};

var flattenData = function flattenData(obj) {
	var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
	var jpegCompression = arguments[2];
	var forcedType = arguments[3];
	var async = arguments[4];


	var data = {
		server: clone(obj.server),
		meta: clone(obj.meta),
		input: {
			name: obj.input.name,
			type: obj.input.type,
			size: obj.input.size,
			width: obj.input.width,
			height: obj.input.height,
			field: obj.input.field
		}
	};

	if (inArray('input', props) && !async) {
		data.input.image = toDataURL(obj.input.image, obj.input.type);
	}

	if (inArray('output', props)) {

		data.output = {
			name: forcedType ? getFileNameWithoutExtension(obj.input.name) + '.' + forcedType : obj.input.name,
			type: MimeTypes[forcedType] || obj.input.type,
			width: obj.output.width,
			height: obj.output.height
		};

		data.output.image = toDataURL(obj.output.image, data.output.type, jpegCompression);
		data.output.type = getMimeTypeFromDataURI(data.output.image);

		// browser problem:
		// if output is of type png and input was of type jpeg we need to fix extension of filename
		// so instead of testing the above situation we just always fix extension when handling PNGs
		if (data.output.type === 'image/png') {
			data.output.name = getFileNameWithoutExtension(data.input.name) + '.png';
		}
	}

	if (inArray('actions', props)) {
		data.actions = clone(obj.actions);
	}

	return data;
};

var downloadCanvas = function downloadCanvas(data, jpegCompression, forcedType) {

	var canvas = data.output.image;
	var filename = forcedType ? getFileNameWithoutExtension(data.input.name) + '.' + forcedType : data.input.name;
	var type = MimeTypes[forcedType] || data.input.type;

	// browser problem:
	// if output is of type png and input was of type jpeg we need to fix extension of filename
	// so instead of testing the above situation we just always fix extension when handling PNGs
	if (type === 'image/png') {
		filename = getFileNameWithoutExtension(data.input.name) + '.png';
	}

	canvas.toBlob(function (blob) {

		if ('msSaveBlob' in window.navigator) {
			window.navigator.msSaveBlob(blob, filename);
			return;
		}

		var url = (window.URL || window.webkitURL).createObjectURL(blob);

		// setup hidden link
		var link = create('a');
		link.style.display = 'none';
		link.download = filename;
		link.href = url;

		// attach to DOM otherwise this does not work in Firefox
		document.body.appendChild(link);

		// fire click
		link.click();

		// delay on remove otherwise does not work in Firefox
		setTimeout(function () {
			document.body.removeChild(link);
			(window.URL || window.webkitURL).revokeObjectURL(url);
		}, 0);
	}, type, typeof jpegCompression === 'number' ? jpegCompression / 100 : undefined);
};

var toggleDisplayBySelector = function toggleDisplayBySelector(selector, enabled, root) {
	var node = root.querySelector(selector);
	if (!node) {
		return;
	}
	node.style.display = enabled ? '' : 'none';
};

var nodeListToArray = function nodeListToArray(nl) {
	return Array.prototype.slice.call(nl);
};

var removeElement = function removeElement(el) {
	el.parentNode.removeChild(el);
};

var wrap = function wrap(element) {
	var wrapper = create('div');
	if (element.parentNode) {
		if (element.nextSibling) {
			element.parentNode.insertBefore(wrapper, element.nextSibling);
		} else {
			element.parentNode.appendChild(wrapper);
		}
	}
	wrapper.appendChild(element);
	return wrapper;
};

var polarToCartesian = function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

	return {
		x: centerX + radius * Math.cos(angleInRadians),
		y: centerY + radius * Math.sin(angleInRadians)
	};
};

var describeArc = function describeArc(x, y, radius, startAngle, endAngle) {

	var start = polarToCartesian(x, y, radius, endAngle);
	var end = polarToCartesian(x, y, radius, startAngle);

	var arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

	var d = ['M', start.x, start.y, 'A', radius, radius, 0, arcSweep, 0, end.x, end.y].join(' ');

	return d;
};

var percentageArc = function percentageArc(x, y, radius, p) {
	return describeArc(x, y, radius, 0, p * 360);
};
var CropArea = function () {

	var resizers = {
		'n': function n(rect, offset, space, ratio) {

			var t, r, b, l, w, h, p, d;

			// bottom is fixed
			b = rect.y + rect.height;

			// intended top
			t = limit(offset.y, 0, b);

			// if is too small vertically
			if (b - t < space.min.height) {
				t = b - space.min.height;
			}

			// if should scale by ratio, pick width by ratio of new height
			w = ratio ? (b - t) / ratio : rect.width;

			// check if has fallen below min width or height
			if (w < space.min.width) {
				w = space.min.width;
				t = b - w * ratio;
			}

			// add half to left and half to right edge
			p = (w - rect.width) * .5;
			l = rect.x - p;
			r = rect.x + rect.width + p;

			// check if any of the edges has moved out of the available space, if so,
			// set max size of rectangle from original position
			if (l < 0 || r > space.width) {

				// smallest distance to edge of space
				d = Math.min(rect.x, space.width - (rect.x + rect.width));

				// new left and right offsets
				l = rect.x - d;
				r = rect.x + rect.width + d;

				// resulting width
				w = r - l;

				// resulting height based on ratio
				h = w * ratio;

				// new top position
				t = b - h;
			}

			return {
				x: l,
				y: t,
				width: r - l,
				height: b - t
			};
		},
		's': function s(rect, offset, space, ratio) {

			var t, r, b, l, w, h, p, d;

			// top is fixed
			t = rect.y;

			// intended bottom
			b = limit(offset.y, t, space.height);

			// if is too small vertically
			if (b - t < space.min.height) {
				b = t + space.min.height;
			}

			// if should scale by ratio, pick width by ratio of new height
			w = ratio ? (b - t) / ratio : rect.width;

			// check if has fallen below min width or height
			if (w < space.min.width) {
				w = space.min.width;
				b = t + w * ratio;
			}

			// add half to left and half to right edge
			p = (w - rect.width) * .5;
			l = rect.x - p;
			r = rect.x + rect.width + p;

			// check if any of the edges has moved out of the available space, if so,
			// set max size of rectangle from original position
			if (l < 0 || r > space.width) {

				// smallest distance to edge of space
				d = Math.min(rect.x, space.width - (rect.x + rect.width));

				// new left and right offsets
				l = rect.x - d;
				r = rect.x + rect.width + d;

				// resulting width
				w = r - l;

				// resulting height based on ratio
				h = w * ratio;

				// new bottom position
				b = t + h;
			}

			return {
				x: l,
				y: t,
				width: r - l,
				height: b - t
			};
		},
		'e': function e(rect, offset, space, ratio) {

			var t, r, b, l, w, h, p, d;

			// left is fixed
			l = rect.x;

			// intended right edge
			r = limit(offset.x, l, space.width);

			// if is too small vertically
			if (r - l < space.min.width) {
				r = l + space.min.width;
			}

			// if should scale by ratio, pick height by ratio of new width
			h = ratio ? (r - l) * ratio : rect.height;

			// check if has fallen below min width or height
			if (h < space.min.height) {
				h = space.min.height;
				r = l + h / ratio;
			}

			// add half to top and bottom
			p = (h - rect.height) * .5;
			t = rect.y - p;
			b = rect.y + rect.height + p;

			// check if any of the edges has moved out of the available space, if so,
			// set max size of rectangle from original position
			if (t < 0 || b > space.height) {

				// smallest distance to edge of space
				d = Math.min(rect.y, space.height - (rect.y + rect.height));

				// new top and bottom offsets
				t = rect.y - d;
				b = rect.y + rect.height + d;

				// resulting height
				h = b - t;

				// resulting width based on ratio
				w = h / ratio;

				// new right position
				r = l + w;
			}

			return {
				x: l,
				y: t,
				width: r - l,
				height: b - t
			};
		},
		'w': function w(rect, offset, space, ratio) {

			var t, r, b, l, w, h, p, d;

			// right is fixed
			r = rect.x + rect.width;

			// intended left edge
			l = limit(offset.x, 0, r);

			// if is too small vertically
			if (r - l < space.min.width) {
				l = r - space.min.width;
			}

			// if should scale by ratio, pick height by ratio of new width
			h = ratio ? (r - l) * ratio : rect.height;

			// check if has fallen below min width or height
			if (h < space.min.height) {
				h = space.min.height;
				l = r - h / ratio;
			}

			// add half to top and bottom
			p = (h - rect.height) * .5;
			t = rect.y - p;
			b = rect.y + rect.height + p;

			// check if any of the edges has moved out of the available space, if so,
			// set max size of rectangle from original position
			if (t < 0 || b > space.height) {

				// smallest distance to edge of space
				d = Math.min(rect.y, space.height - (rect.y + rect.height));

				// new top and bottom offsets
				t = rect.y - d;
				b = rect.y + rect.height + d;

				// resulting height
				h = b - t;

				// resulting width based on ratio
				w = h / ratio;

				// new right position
				l = r - w;
			}

			return {
				x: l,
				y: t,
				width: r - l,
				height: b - t
			};
		},
		'ne': function ne(rect, offset, space, ratio) {

			var t, r, b, l, w, h, d;

			// left and bottom are fixed
			l = rect.x;
			b = rect.y + rect.height;

			// intended right edge
			r = limit(offset.x, l, space.width);

			// if is too small vertically
			if (r - l < space.min.width) {
				r = l + space.min.width;
			}

			// if should scale by ratio, pick height by ratio of new width
			h = ratio ? (r - l) * ratio : limit(b - offset.y, space.min.height, b);

			// check if has fallen below min width or height
			if (h < space.min.height) {
				h = space.min.height;
				r = l + h / ratio;
			}

			// add height difference with original height to top
			t = rect.y - (h - rect.height);

			// check if any of the edges has moved out of the available space, if so,
			// set max size of rectangle from original position
			if (t < 0 || b > space.height) {

				// smallest distance to edge of space
				d = Math.min(rect.y, space.height - (rect.y + rect.height));

				// new top and bottom offsets
				t = rect.y - d;

				// resulting height
				h = b - t;

				// resulting width based on ratio
				w = h / ratio;

				// new right position
				r = l + w;
			}

			return {
				x: l,
				y: t,
				width: r - l,
				height: b - t
			};
		},
		'se': function se(rect, offset, space, ratio) {

			var t, r, b, l, w, h, d;

			// left and top are fixed
			l = rect.x;
			t = rect.y;

			// intended right edge
			r = limit(offset.x, l, space.width);

			// if is too small vertically
			if (r - l < space.min.width) {
				r = l + space.min.width;
			}

			// if should scale by ratio, pick height by ratio of new width
			h = ratio ? (r - l) * ratio : limit(offset.y - rect.y, space.min.height, space.height - t);

			// check if has fallen below min width or height
			if (h < space.min.height) {
				h = space.min.height;
				r = l + h / ratio;
			}

			// add height difference with original height to bottom
			b = rect.y + rect.height + (h - rect.height);

			// check if any of the edges has moved out of the available space, if so,
			// set max size of rectangle from original position
			if (t < 0 || b > space.height) {

				// smallest distance to edge of space
				d = Math.min(rect.y, space.height - (rect.y + rect.height));

				// new bottom offset
				b = rect.y + rect.height + d;

				// resulting height
				h = b - t;

				// resulting width based on ratio
				w = h / ratio;

				// new right position
				r = l + w;
			}

			return {
				x: l,
				y: t,
				width: r - l,
				height: b - t
			};
		},
		'sw': function sw(rect, offset, space, ratio) {

			var t, r, b, l, w, h, d;

			// right and top are fixed
			r = rect.x + rect.width;
			t = rect.y;

			// intended left edge
			l = limit(offset.x, 0, r);

			// if is too small vertically
			if (r - l < space.min.width) {
				l = r - space.min.width;
			}

			// if should scale by ratio, pick height by ratio of new width
			h = ratio ? (r - l) * ratio : limit(offset.y - rect.y, space.min.height, space.height - t);

			// check if has fallen below min width or height
			if (h < space.min.height) {
				h = space.min.height;
				l = r - h / ratio;
			}

			// add height difference with original height to bottom
			b = rect.y + rect.height + (h - rect.height);

			// check if any of the edges has moved out of the available space, if so,
			// set max size of rectangle from original position
			if (t < 0 || b > space.height) {

				// smallest distance to edge of space
				d = Math.min(rect.y, space.height - (rect.y + rect.height));

				// new bottom offset
				b = rect.y + rect.height + d;

				// resulting height
				h = b - t;

				// resulting width based on ratio
				w = h / ratio;

				// new left position
				l = r - w;
			}

			return {
				x: l,
				y: t,
				width: r - l,
				height: b - t
			};
		},
		'nw': function nw(rect, offset, space, ratio) {

			var t, r, b, l, w, h, d;

			// right and bottom are fixed
			r = rect.x + rect.width;
			b = rect.y + rect.height;

			// intended left edge
			l = limit(offset.x, 0, r);

			// if is too small vertically
			if (r - l < space.min.width) {
				l = r - space.min.width;
			}

			// if should scale by ratio, pick height by ratio of new width
			h = ratio ? (r - l) * ratio : limit(b - offset.y, space.min.height, b);

			// check if has fallen below min width or height
			if (h < space.min.height) {
				h = space.min.height;
				l = r - h / ratio;
			}

			// add height difference with original height to bottom
			t = rect.y - (h - rect.height);

			// check if any of the edges has moved out of the available space, if so,
			// set max size of rectangle from original position
			if (t < 0 || b > space.height) {

				// smallest distance to edge of space
				d = Math.min(rect.y, space.height - (rect.y + rect.height));

				// new bottom offset
				t = rect.y - d;

				// resulting height
				h = b - t;

				// resulting width based on ratio
				w = h / ratio;

				// new left position
				l = r - w;
			}

			return {
				x: l,
				y: t,
				width: r - l,
				height: b - t
			};
		}

	};

	/**
  * CropArea
  */
	return function () {
		function CropArea() {
			var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.createElement('div');

			_classCallCheck(this, CropArea);

			this._element = element;

			this._interaction = null;

			this._minWidth = 0;
			this._minHeight = 0;

			this._ratio = null;

			this._rect = {
				x: 0,
				y: 0,
				width: 0,
				height: 0
			};

			this._space = {
				width: 0,
				height: 0
			};

			this._rectChanged = false;

			this._init();
		}

		_createClass(CropArea, [{
			key: '_init',
			value: function _init() {

				this._element.className = 'slim-crop-area';

				// lines
				var lines = create('div', 'grid');
				this._element.appendChild(lines);

				// corner & edge resize buttons
				for (var handler in resizers) {
					if (!resizers.hasOwnProperty(handler)) {
						continue;
					}
					var _btn = create('button', handler);
					this._element.appendChild(_btn);
				}
				var btn = create('button', 'c');
				this._element.appendChild(btn);

				addEvents(document, Events.DOWN, this);
			}
		}, {
			key: 'reset',
			value: function reset() {

				this._interaction = null;

				this._rect = {
					x: 0,
					y: 0,
					width: 0,
					height: 0
				};

				this._rectChanged = true;

				this._redraw();

				this._element.dispatchEvent(new CustomEvent('change'));
			}
		}, {
			key: 'rescale',
			value: function rescale(scale) {

				// no rescale
				if (scale === 1) {
					return;
				}

				this._interaction = null;

				this._rectChanged = true;

				this._rect.x *= scale;
				this._rect.y *= scale;
				this._rect.width *= scale;
				this._rect.height *= scale;

				this._redraw();

				this._element.dispatchEvent(new CustomEvent('change'));
			}
		}, {
			key: 'limit',
			value: function limit(width, height) {
				this._space.width = width;
				this._space.height = height;
			}
		}, {
			key: 'offset',
			value: function offset(x, y) {
				this._space.x = x;
				this._space.y = y;
			}
		}, {
			key: 'resize',
			value: function resize(x, y, width, height) {

				this._interaction = null;

				this._rect = {
					x: limit(x, 0, this._space.width - this._minWidth),
					y: limit(y, 0, this._space.height - this._minHeight),
					width: limit(width, this._minWidth, this._space.width),
					height: limit(height, this._minHeight, this._space.height)
				};

				this._rectChanged = true;

				this._redraw();

				this._element.dispatchEvent(new CustomEvent('change'));
			}
		}, {
			key: 'handleEvent',
			value: function handleEvent(e) {

				switch (e.type) {

					case 'touchstart':
					case 'pointerdown':
					case 'mousedown':
						{
							this._onStartDrag(e);
						}
						break;
					case 'touchmove':
					case 'pointermove':
					case 'mousemove':
						{
							this._onDrag(e);
						}
						break;
					case 'touchend':
					case 'touchcancel':
					case 'pointerup':
					case 'mouseup':
						{
							this._onStopDrag(e);
						}

				}
			}
		}, {
			key: '_onStartDrag',
			value: function _onStartDrag(e) {

				// is not my event?
				if (!this._element.contains(e.target)) {
					return;
				}

				e.preventDefault();

				// listen to drag related events
				addEvents(document, Events.MOVE, this);
				addEvents(document, Events.UP, this);

				this._interaction = {
					type: e.target.className,
					offset: getEventOffsetScroll(e)
				};

				this._interaction.offset.x -= this._rect.x;
				this._interaction.offset.y -= this._rect.y;

				// now dragging
				this._element.setAttribute('data-dragging', 'true');

				// start the redraw update loop
				this._redraw();
			}
		}, {
			key: '_onDrag',
			value: function _onDrag(e) {

				e.preventDefault();

				// get local offset for this event
				var offset = getEventOffsetScroll(e);
				var type = this._interaction.type;

				// drag
				if (type === 'c') {

					this._rect.x = limit(offset.x - this._interaction.offset.x, 0, this._space.width - this._rect.width);
					this._rect.y = limit(offset.y - this._interaction.offset.y, 0, this._space.height - this._rect.height);
				}

				// resize
				else if (resizers[type]) {
						this._rect = resizers[type](this._rect, {
							x: offset.x - this._space.x,
							y: offset.y - this._space.y
						}, {
							x: 0,
							y: 0,
							width: this._space.width,
							height: this._space.height,
							min: {
								width: this._minWidth,
								height: this._minHeight
							}
						}, this._ratio);
					}

				this._rectChanged = true;

				// dispatch
				this._element.dispatchEvent(new CustomEvent('input'));
			}
		}, {
			key: '_onStopDrag',
			value: function _onStopDrag(e) {

				e.preventDefault();

				// stop listening to drag related events
				removeEvents(document, Events.MOVE, this);
				removeEvents(document, Events.UP, this);

				// no longer interacting, so no need to redraw
				this._interaction = null;

				// now dragging
				this._element.setAttribute('data-dragging', 'false');

				// fire change event
				this._element.dispatchEvent(new CustomEvent('change'));
			}
		}, {
			key: '_redraw',
			value: function _redraw() {
				var _this = this;

				if (this._rectChanged) {

					var transform = 'translate(' + this._rect.x + 'px,' + this._rect.y + 'px);';
					this._element.style.cssText = '\n\t\t\t\t\t-webkit-transform: ' + transform + ';\n\t\t\t\t\ttransform: ' + transform + ';\n\t\t\t\t\twidth:' + this._rect.width + 'px;\n\t\t\t\t\theight:' + this._rect.height + 'px;\n\t\t\t\t';

					this._rectChanged = false;
				}

				// if no longer interacting with crop area stop here
				if (!this._interaction) {
					return;
				}

				// redraw
				requestAnimationFrame(function () {
					return _this._redraw();
				});
			}
		}, {
			key: 'destroy',
			value: function destroy() {

				this._interaction = false;
				this._rectChanged = false;

				removeEvents(document, Events.DOWN, this);
				removeEvents(document, Events.MOVE, this);
				removeEvents(document, Events.UP, this);

				removeElement(this._element);
			}
		}, {
			key: 'element',
			get: function get() {
				return this._element;
			}
		}, {
			key: 'space',
			get: function get() {
				return this._space;
			}
		}, {
			key: 'area',
			get: function get() {

				var x = this._rect.x / this._space.width;
				var y = this._rect.y / this._space.height;
				var width = this._rect.width / this._space.width;
				var height = this._rect.height / this._space.height;

				return {
					x: x,
					y: y,
					width: width,
					height: height
				};
			}
		}, {
			key: 'dirty',
			get: function get() {
				return this._rect.x !== 0 || this._rect.y !== 0 || this._rect.width !== 0 || this._rect.height !== 0;
			}
		}, {
			key: 'minWidth',
			set: function set(value) {
				this._minWidth = value;
			}
		}, {
			key: 'minHeight',
			set: function set(value) {
				this._minHeight = value;
			}
		}, {
			key: 'ratio',
			set: function set(value) {
				this._ratio = value;
			}
		}]);

		return CropArea;
	}();
}();
var ImageEditor = function () {

	/**
  * ImageEditor
  * @param element
  * @param options
  * @constructor
  */

	var CropAreaEvents = ['input', 'change'];

	var ImageEditor = function () {
		function ImageEditor() {
			var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.createElement('div');
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			_classCallCheck(this, ImageEditor);

			this._element = element;
			this._options = mergeOptions(ImageEditor.options(), options);

			this._ratio = null;
			this._output = null;

			this._input = null;

			this._preview = null;
			this._previewBlurred = null;

			this._blurredPreview = false;

			this._cropper = null;
			this._straightCrop = null;
			this._previewWrapper = null;
			this._currentWindowSize = {};

			this._btnGroup = null;
			this._maskFrame = null;

			this._dirty = false;

			this._wrapperRotation = 0;
			this._wrapperScale = 1.0;

			this._init();
		}

		_createClass(ImageEditor, [{
			key: '_init',
			value: function _init() {
				var _this2 = this;

				this._element.className = 'slim-image-editor';

				// container
				this._container = create('div', 'slim-container');

				// wrapper
				this._wrapper = create('div', 'slim-wrapper');

				// photo crop mark container
				this._stage = create('div', 'slim-stage');
				this._container.appendChild(this._stage);

				// create crop marks
				this._cropper = new CropArea();
				CropAreaEvents.forEach(function (e) {
					_this2._cropper.element.addEventListener(e, _this2);
				});
				this._stage.appendChild(this._cropper.element);

				// canvas ghost
				this._previewWrapper = create('div', 'slim-image-editor-preview slim-crop-preview');
				this._previewBlurred = create('canvas', 'slim-crop-blur');
				this._previewWrapper.appendChild(this._previewBlurred);
				this._wrapper.appendChild(this._previewWrapper);

				this._previewMask = create('div', 'slim-crop-mask');
				this._preview = create('img');
				this._previewMask.appendChild(this._preview);
				//this._previewWrapper.appendChild(this._preview);
				this._cropper.element.appendChild(this._previewMask);

				// buttons
				this._btnGroup = create('div', 'slim-editor-btn-group');
				ImageEditor.Buttons.forEach(function (c) {
					var prop = capitalizeFirstLetter(c);
					var label = _this2._options['button' + prop + 'Label'];
					var title = _this2._options['button' + prop + 'Title'];
					var className = _this2._options['button' + prop + 'ClassName'];
					var btn = create('button', 'slim-editor-btn slim-btn-' + c + (className ? ' ' + className : ''));
					btn.innerHTML = label;
					btn.title = title || label;
					btn.type = 'button';
					btn.setAttribute('data-action', c);
					btn.addEventListener('click', _this2);
					_this2._btnGroup.appendChild(btn);
				});

				// utils
				this._utilsGroup = create('div', 'slim-editor-utils-group');

				// create rotation button
				var btn = create('button', 'slim-editor-utils-btn slim-btn-rotate' + (this._options.buttonRotateClassName ? ' ' + this._options.buttonRotateClassName : ''));
				btn.setAttribute('data-action', 'rotate');
				btn.addEventListener('click', this);
				btn.title = this._options.buttonRotateTitle;
				this._utilsGroup.appendChild(btn);

				this._container.appendChild(this._wrapper);

				this._element.appendChild(this._container);
				this._element.appendChild(this._utilsGroup);
				this._element.appendChild(this._btnGroup);
			}
		}, {
			key: 'dirty',
			value: function dirty() {
				this._dirty = true;
			}
		}, {
			key: 'handleEvent',
			value: function handleEvent(e) {

				switch (e.type) {
					case 'click':
						this._onClick(e);
						break;
					case 'change':
						this._onGridChange(e);
						break;
					case 'input':
						this._onGridInput(e);
						break;
					case 'keydown':
						this._onKeyDown(e);
						break;
					case 'resize':
						this._onResize(e);
						break;
				}
			}
		}, {
			key: '_onKeyDown',
			value: function _onKeyDown(e) {

				switch (e.keyCode) {
					case Key.RETURN:
						{
							this._confirm();
							break;
						}
					case Key.ESC:
						{
							this._cancel();
							break;
						}
				}
			}
		}, {
			key: '_onClick',
			value: function _onClick(e) {

				if (e.target.classList.contains('slim-btn-cancel')) {
					this._cancel();
				}

				if (e.target.classList.contains('slim-btn-confirm')) {
					this._confirm();
				}

				if (e.target.classList.contains('slim-btn-rotate')) {
					this._rotate();
				}
			}
		}, {
			key: '_onResize',
			value: function _onResize() {

				// remember window size
				this._currentWindowSize = {
					width: window.innerWidth,
					height: window.innerHeight
				};

				// redraw the image editor based on new dimensions
				this._redraw();

				this._redrawCropper(this._cropper.area);

				this._updateWrapperScale();

				// apply rotation and scale
				this._redrawWrapper();
			}
		}, {
			key: '_redrawWrapper',
			value: function _redrawWrapper() {
				var matrix = snabbt.createMatrix();
				matrix.scale(this._wrapperScale, this._wrapperScale);
				matrix.rotateZ(this._wrapperRotation * (Math.PI / 180));
				snabbt.setElementTransform(this._previewWrapper, matrix);
			}
		}, {
			key: '_onGridInput',
			value: function _onGridInput() {

				this._redrawCropMask();
			}
		}, {
			key: '_onGridChange',
			value: function _onGridChange() {

				this._redrawCropMask();
			}
		}, {
			key: '_updateWrapperRotation',
			value: function _updateWrapperRotation() {

				if (this._options.minSize.width > this._input.height || this._options.minSize.height > this._input.width) {
					this._wrapperRotation += 180;
				} else {
					this._wrapperRotation += 90;
				}
			}
		}, {
			key: '_updateWrapperScale',
			value: function _updateWrapperScale() {

				// test if is tilted
				var isTilted = this._wrapperRotation % 180 !== 0;

				// if tilted determine correct scale factor
				if (isTilted) {

					// maximum size
					var maxWidth = this._container.offsetWidth;
					var maxHeight = this._container.offsetHeight;

					// get wrapper size
					var wrapperWidth = this._wrapper.offsetHeight;
					var wrapperHeight = this._wrapper.offsetWidth;

					var scalar = maxWidth / wrapperWidth;
					if (scalar * wrapperHeight > maxHeight) {
						scalar = maxHeight / wrapperHeight;
					}

					this._wrapperScale = scalar;
				} else {
					this._wrapperScale = 1.0;
				}
			}

			/**
    * Action handlers
    */

		}, {
			key: '_cancel',
			value: function _cancel() {

				this._element.dispatchEvent(new CustomEvent('cancel'));
			}
		}, {
			key: '_confirm',
			value: function _confirm() {

				var isTilted = this._wrapperRotation % 180 !== 0;
				var area = this._cropper.area;

				var result = scaleRect(area, isTilted ? this._input.height : this._input.width, isTilted ? this._input.width : this._input.height);

				this._element.dispatchEvent(new CustomEvent('confirm', {
					detail: {
						rotation: this._wrapperRotation % 360,
						crop: result
					}
				}));
			}
		}, {
			key: '_rotate',
			value: function _rotate() {
				var _this3 = this;

				// rotate!
				this._updateWrapperRotation();

				// only pass current rect if is 1:1 or free
				var rect = this.ratio === 1 || this._ratio === null ? this._cropper.area : null;
				if (rect) {
					rotate(rect, 90);
				}

				// wrapper might also need to be scaled
				this._updateWrapperScale();

				// hide the cropper
				this._hideCropper();

				// rotation effect
				snabbt(this._previewWrapper, {
					rotation: [0, 0, this._wrapperRotation * (Math.PI / 180)],
					scale: [this._wrapperScale, this._wrapperScale],
					easing: 'spring',
					springConstant: .8,
					springDeceleration: .65,
					complete: function complete() {

						// redraws auto cropper
						_this3._redrawCropper(rect);

						// shows the cropper
						_this3._showCropper();
					}
				});
			}
		}, {
			key: '_showCropper',
			value: function _showCropper() {

				snabbt(this._stage, {
					easing: 'ease',
					duration: 250,
					fromOpacity: 0,
					opacity: 1.0
				});
			}
		}, {
			key: '_hideCropper',
			value: function _hideCropper() {

				snabbt(this._stage, {
					duration: 0,
					fromOpacity: 0,
					opacity: 0
				});
			}
		}, {
			key: '_redrawCropMask',
			value: function _redrawCropMask() {
				var _this4 = this;

				// get rotation
				var rotation = this._wrapperRotation % 360;

				// get scale
				var scale = this._wrapperScale;

				// get image size
				var canvas = {
					width: this._wrapper.offsetWidth,
					height: this._wrapper.offsetHeight
				};

				// get default mask cropper area
				var mask = this._cropper.area;
				var preview = {
					x: 0,
					y: 0
				};

				if (rotation === 0) {
					preview.x = -mask.x;
					preview.y = -mask.y;
				} else if (rotation === 90) {
					preview.x = -(1 - mask.y);
					preview.y = -mask.x;
				} else if (rotation === 180) {
					preview.x = -(1 - mask.x);
					preview.y = -(1 - mask.y);
				} else if (rotation === 270) {
					preview.x = -mask.y;
					preview.y = -(1 - mask.x);
				}

				// scale rect to fit canvas
				preview.x *= canvas.width;
				preview.y *= canvas.height;

				// update on next frame (so it's in sync with crop area redraw)
				cancelAnimationFrame(this._maskFrame);
				this._maskFrame = requestAnimationFrame(function () {

					var transform = 'scale(' + scale + ') rotate(' + -rotation + 'deg) translate(' + preview.x + 'px, ' + preview.y + 'px);';
					_this4._preview.style.cssText = '\n\t\t\t\t\twidth: ' + _this4._previewSize.width + 'px;\n\t\t\t\t\theight: ' + _this4._previewSize.height + 'px;\n\t\t\t\t\t-webkit-transform: ' + transform + ';\n\t\t\t\t\ttransform: ' + transform + ';\n\t\t\t\t';
				});
			}
		}, {
			key: 'open',
			value: function open(image, ratio, crop, rotation, complete) {
				var _this5 = this;

				// test if is same image
				if (this._input && !this._dirty && this._ratio === ratio) {
					complete();
					return;
				}

				// remember current window size
				this._currentWindowSize = {
					width: window.innerWidth,
					height: window.innerHeight
				};

				// reset dirty value
				this._dirty = false;

				// reset rotation
				this._wrapperRotation = rotation || 0;

				// we'll always have to blur the preview of a newly opened image
				this._blurredPreview = false;

				// set ratio
				this._ratio = ratio;

				// reset preview size
				this._previewSize = null;

				// hide editor
				this._element.style.opacity = '0';

				// set as new input image
				this._input = image;

				// calculate crop
				var tilted = rotation % 180 !== 0;
				var relativeCrop = divideRect(crop, tilted ? image.height : image.width, tilted ? image.width : image.height);

				// preview has now loaded
				this._preview.onload = function () {

					// reset onload listener
					_this5._preview.onload = null;

					// setup cropper
					_this5._cropper.ratio = _this5.ratio;

					// redraw view (for first time)
					_this5._redraw();

					// redraw cropper
					_this5._redrawCropper(relativeCrop);

					// done
					complete();

					// fade in
					_this5._element.style.opacity = '';
				};

				// load lower resolution preview image
				this._preview.src = cloneCanvasScaled(this._input, Math.min(this._container.offsetWidth / this._input.width, this._container.offsetHeight / this._input.height)).toDataURL();
			}
		}, {
			key: '_redrawCropper',
			value: function _redrawCropper(rect) {

				var isTilted = this._wrapperRotation % 180 !== 0;

				// image ratio
				var imageRatio = isTilted ? this._input.height / this._input.width : this._input.width / this._input.height;

				// get dimensions of image wrapper
				var width = this._wrapper.offsetWidth;
				var height = this._wrapper.offsetHeight;

				// get space
				var maxWidth = this._container.offsetWidth;
				var maxHeight = this._container.offsetHeight;

				// rescale wrapper
				this._updateWrapperScale();

				// position cropper container to fit wrapper
				var sw = this._wrapperScale * (isTilted ? height : width);
				var sh = this._wrapperScale * (isTilted ? width : height);
				var sx = isTilted ? (maxWidth - sw) * .5 : this._wrapper.offsetLeft;
				var sy = isTilted ? (maxHeight - sh) * .5 : this._wrapper.offsetTop;

				this._stage.style.cssText = '\n\t\t\t\tleft:' + sx + 'px;\n\t\t\t\ttop:' + sy + 'px;\n\t\t\t\twidth:' + sw + 'px;\n\t\t\t\theight:' + sh + 'px;\n\t\t\t';

				// set new size limit for crops
				// use image ratio so we have exact amount of pixels
				this._cropper.limit(sw, sw / imageRatio);
				this._cropper.offset(sx + this._element.offsetLeft, sy + this._element.offsetTop);

				// set min and max height of cropper
				this._cropper.minWidth = this._wrapperScale * this._options.minSize.width * this.scalar;
				this._cropper.minHeight = this._wrapperScale * this._options.minSize.height * this.scalar;

				// set crop rect
				var crop = null;
				if (rect) {
					crop = {
						x: rect.x * sw,
						y: rect.y * sh,
						width: rect.width * sw,
						height: rect.height * sh
					};
				} else {
					crop = getAutoCropRect(sw, sh, this._ratio || sh / sw);
				}

				this._cropper.resize(crop.x, crop.y, crop.width, crop.height);
			}
		}, {
			key: '_redraw',
			value: function _redraw() {

				// image ratio
				var ratio = this._input.height / this._input.width;

				// determine rounded size
				var maxWidth = this._container.clientWidth;
				var maxHeight = this._container.clientHeight;

				var width = maxWidth;
				var height = width * ratio;

				if (height > maxHeight) {
					height = maxHeight;
					width = height / ratio;
				}

				width = Math.round(width);
				height = Math.round(height);

				// rescale and recenter wrapper
				var x = (maxWidth - width) / 2;
				var y = (maxHeight - height) / 2;

				this._wrapper.style.cssText = '\n\t\t\t\tleft:' + x + 'px;\n\t\t\t\ttop:' + y + 'px;\n\t\t\t\twidth:' + width + 'px;\n\t\t\t\theight:' + height + 'px;\n\t\t\t';

				// set image size based on container dimensions
				this._previewBlurred.style.cssText = '\n\t\t\t\twidth:' + width + 'px;\n\t\t\t\theight:' + height + 'px;\n\t\t\t';

				this._preview.style.cssText = '\n\t\t\t\twidth:' + width + 'px;\n\t\t\t\theight:' + height + 'px;\n\t\t\t';

				this._previewSize = {
					width: width,
					height: height
				};

				// scale and blur the blurry preview
				if (!this._blurredPreview) {

					this._previewBlurred.width = 300;
					this._previewBlurred.height = this._previewBlurred.width * ratio;

					copyCanvas(this._input, this._previewBlurred);

					blurCanvas(this._previewBlurred, 3);

					this._blurredPreview = true;
				}
			}
		}, {
			key: 'show',
			value: function show() {
				var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};


				// test if window size has changed since previous showing
				if (this._currentWindowSize.width !== window.innerWidth || this._currentWindowSize.height !== window.innerHeight) {

					// if so, reposition elements
					this._redraw();

					// redraw cropper position
					this._redrawCropper(this._cropper.area);
				}

				// listen to keydown so we can close or confirm with RETURN / ESC
				document.addEventListener('keydown', this);

				// when window is scaled we want to resize the editor
				window.addEventListener('resize', this);

				// fade in preview
				var rotation = this._wrapperRotation * (Math.PI / 180);
				snabbt(this._previewWrapper, {
					fromRotation: [0, 0, rotation],
					rotation: [0, 0, rotation],
					fromPosition: [0, 0, 0],
					position: [0, 0, 0],
					fromOpacity: 0,
					opacity: 1,
					fromScale: [this._wrapperScale - .02, this._wrapperScale - .02],
					scale: [this._wrapperScale, this._wrapperScale],
					easing: 'spring',
					springConstant: .3,
					springDeceleration: .85,
					delay: 450,
					complete: function complete() {
						// don't reset transforms because we need rotation to stick
					}
				});

				if (this._cropper.dirty) {

					// now show cropper
					snabbt(this._stage, {
						fromPosition: [0, 0, 0],
						position: [0, 0, 0],
						fromOpacity: 0,
						opacity: 1,
						duration: 250,
						delay: 850,
						complete: function complete() {
							resetTransforms(this);
							callback();
						}
					});
				} else {

					// now show cropper
					snabbt(this._stage, {
						fromPosition: [0, 0, 0],
						position: [0, 0, 0],
						fromOpacity: 0,
						opacity: 1,
						duration: 250,
						delay: 1000,
						complete: function complete() {
							resetTransforms(this);
						}
					});
				}

				// now show buttons
				snabbt(this._btnGroup.childNodes, {
					fromScale: [.9, .9],
					scale: [1, 1],
					fromOpacity: 0,
					opacity: 1,
					delay: function delay(i) {
						return 1000 + i * 100;
					},
					easing: 'spring',
					springConstant: .3,
					springDeceleration: .85,
					complete: function complete() {
						resetTransforms(this);
					}
				});

				snabbt(this._utilsGroup.childNodes, {
					fromScale: [.9, .9],
					scale: [1, 1],
					fromOpacity: 0,
					opacity: 1,
					easing: 'spring',
					springConstant: .3,
					springDeceleration: .85,
					delay: 1250,
					complete: function complete() {
						resetTransforms(this);
					}
				});
			}
		}, {
			key: 'hide',
			value: function hide() {
				var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};


				// no more need to listen to keydown
				document.removeEventListener('keydown', this);

				// no more need to resize editor when window is scaled
				window.removeEventListener('resize', this);

				// fade out buttons
				snabbt(this._utilsGroup.childNodes, {
					fromOpacity: 1,
					opacity: 0,
					duration: 250
				});

				snabbt(this._btnGroup.childNodes, {
					fromOpacity: 1,
					opacity: 0,
					delay: 200,
					duration: 350
				});

				snabbt([this._stage, this._previewWrapper], {
					fromPosition: [0, 0, 0],
					position: [0, -250, 0],
					fromOpacity: 1,
					opacity: 0,
					easing: 'spring',
					springConstant: .3,
					springDeceleration: .75,
					delay: 250,
					allDone: function allDone() {

						callback();
					}
				});
			}
		}, {
			key: 'destroy',
			value: function destroy() {
				var _this6 = this;

				nodeListToArray(this._btnGroup.children).forEach(function (btn) {
					btn.removeEventListener('click', _this6);
				});

				CropAreaEvents.forEach(function (e) {
					_this6._cropper.element.removeEventListener(e, _this6);
				});

				this._cropper.destroy();

				// if still attached to DOM, detach
				if (this._element.parentNode) {
					removeElement(this._element);
				}
			}
		}, {
			key: 'showRotateButton',
			set: function set(enabled) {
				if (enabled) {
					this._element.classList.remove('slim-rotation-disabled');
				} else {
					this._element.classList.add('slim-rotation-disabled');
				}
			}
		}, {
			key: 'element',
			get: function get() {
				return this._element;
			}
		}, {
			key: 'ratio',
			get: function get() {
				if (this._ratio === 'input') {
					return this._input.height / this._input.width;
				}
				return this._ratio;
			}
		}, {
			key: 'offset',
			get: function get() {
				return this._element.getBoundingClientRect();
			}
		}, {
			key: 'original',
			get: function get() {
				return this._input;
			}
		}, {
			key: 'scalar',
			get: function get() {
				return this._previewSize.width / this._input.width;
			}
		}], [{
			key: 'options',
			value: function options() {

				return {
					buttonCancelClassName: null,
					buttonConfirmClassName: null,
					buttonCancelLabel: 'Cancel',
					buttonConfirmLabel: 'Confirm',
					buttonCancelTitle: null,
					buttonConfirmTitle: null,

					buttonRotateTitle: 'Rotate',
					buttonRotateClassName: null,

					minSize: {
						width: 0,
						height: 0
					}
				};
			}
		}]);

		return ImageEditor;
	}();

	ImageEditor.Buttons = ['cancel', 'confirm'];

	return ImageEditor;
}(CropArea);
var FileHopper = function () {

	/**
  * FileHopper
  * @param element
  * @param options
  * @constructor
  */
	var DragDropEvents = ['dragover', 'dragleave', 'drop'];

	return function () {
		function FileHopper() {
			var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.createElement('div');

			_classCallCheck(this, FileHopper);

			this._element = element;
			this._accept = [];
			this._allowURLs = false;

			this._dragPath = null;

			this._init();
		}

		// public properties


		_createClass(FileHopper, [{
			key: 'isValidDataTransfer',
			value: function isValidDataTransfer(dataTransfer) {

				if (dataTransfer.files && dataTransfer.files.length) {
					return this.areValidDataTransferFiles(dataTransfer.files);
				}

				if (dataTransfer.items && dataTransfer.items.length) {
					return this.areValidDataTransferItems(dataTransfer.items);
				}

				return null;
			}
		}, {
			key: 'areValidDataTransferFiles',
			value: function areValidDataTransferFiles(files) {
				if (this._accept.length && files) {
					return this._accept.indexOf(files[0].type) !== -1;
				}
				return true;
			}
		}, {
			key: 'areValidDataTransferItems',
			value: function areValidDataTransferItems(items) {

				if (this._accept.length && items) {

					// is possibly dropping url
					if (this._allowURLs && items[0].kind === 'string') {
						return null;
					}

					// is http website so firefox will not return file type
					if (items[0].type && items[0].type.indexOf('application') === 0) {
						return null;
					}

					return this._accept.indexOf(items[0].type) !== -1;
				}

				return true;
			}

			// public methods

		}, {
			key: 'reset',
			value: function reset() {
				this._element.files = null;
			}

			// private

		}, {
			key: '_init',
			value: function _init() {
				var _this7 = this;

				this._element.className = 'slim-file-hopper';

				DragDropEvents.forEach(function (e) {
					_this7._element.addEventListener(e, _this7);
				});
			}

			// the input has changed

		}, {
			key: 'handleEvent',
			value: function handleEvent(e) {

				switch (e.type) {
					case 'dragover':
						this._onDragOver(e);
						break;
					case 'dragleave':
						this._onDragLeave(e);
						break;
					case 'drop':
						this._onDrop(e);
						break;
				}
			}
		}, {
			key: '_onDrop',
			value: function _onDrop(e) {

				// prevents browser from opening image
				e.preventDefault();

				// test if a url was dropped
				var remote = null;

				if (this._allowURLs) {

					var url = void 0;
					var meta = void 0;
					try {
						url = e.dataTransfer.getData('url');
						meta = e.dataTransfer.getData('text/html');
					} catch (e) {
						// nope nope nope (ie11 trouble)
					}

					if (meta && meta.length) {
						var parsed = meta.match(/src\s*=\s*"(.+?)"/);
						if (parsed) {
							remote = parsed[1];
						}
					} else if (url && url.length) {
						remote = url;
					}
				}

				if (remote) {
					this._element.files = [{ remote: remote }];
				}
				// nope, must have been a file
				else {

						// test type in older browsers
						var filesValidity = this.isValidDataTransfer(e.dataTransfer);
						if (!filesValidity) {

							// invalid files, stop here
							this._element.dispatchEvent(new CustomEvent('file-invalid-drop'));

							// no longer hovering
							this._dragPath = null;
							return;
						}

						// store dropped files on element files property, so can be accessed by same function as file input handler
						this._element.files = e.dataTransfer.files;
					}

				// file has been dropped
				this._element.dispatchEvent(new CustomEvent('file-drop', {
					detail: getOffsetByEvent(e)
				}));

				// file list has changed, let's notify others
				this._element.dispatchEvent(new CustomEvent('change'));

				// no longer hovering
				this._dragPath = null;
			}
		}, {
			key: '_onDragOver',
			value: function _onDragOver(e) {

				// prevents browser from opening image
				e.preventDefault();

				// set drop effect
				e.dataTransfer.dropEffect = 'copy';

				// determin if is valid data
				var dataValidity = this.isValidDataTransfer(e.dataTransfer);
				// if validity is null is undetermined
				if (dataValidity !== null && !dataValidity) {

					// indicate drop mode to user
					e.dataTransfer.dropEffect = 'none';

					// invalid files, stop here
					this._element.dispatchEvent(new CustomEvent('file-invalid'));
					return;
				}

				// now hovering file over the area
				if (!this._dragPath) {
					this._dragPath = [];
				}

				// push location
				this._dragPath.push(getOffsetByEvent(e));

				// file is hovering over element
				this._element.dispatchEvent(new CustomEvent('file-over', {
					detail: {
						x: last(this._dragPath).x,
						y: last(this._dragPath).y
					}
				}));
			}
		}, {
			key: '_onDragLeave',
			value: function _onDragLeave(e) {

				// user has dragged file out of element area
				this._element.dispatchEvent(new CustomEvent('file-out', {
					detail: getOffsetByEvent(e)
				}));

				// now longer hovering file
				this._dragPath = null;
			}
		}, {
			key: 'destroy',
			value: function destroy() {
				var _this8 = this;

				DragDropEvents.forEach(function (e) {
					_this8._element.removeEventListener(e, _this8);
				});

				removeElement(this._element);

				this._element = null;
				this._dragPath = null;
				this._accept = null;
			}
		}, {
			key: 'element',
			get: function get() {
				return this._element;
			}
		}, {
			key: 'dragPath',
			get: function get() {
				return this._dragPath;
			}
		}, {
			key: 'enabled',
			get: function get() {
				return this._element.style.display === '';
			},
			set: function set(value) {
				this._element.style.display = value ? '' : 'none';
			}
		}, {
			key: 'allowURLs',
			set: function set(value) {
				this._allowURLs = value;
			}
		}, {
			key: 'accept',
			set: function set(mimetypes) {
				this._accept = mimetypes;
			},
			get: function get() {
				return this._accept;
			}
		}]);

		return FileHopper;
	}();
}();
var Popover = function () {

	/**
  * Popover
  */
	return function () {
		function Popover() {
			_classCallCheck(this, Popover);

			this._element = null;
			this._inner = null;

			this._init();
		}

		_createClass(Popover, [{
			key: '_init',
			value: function _init() {

				this._element = create('div', 'slim-popover');
				this._element.setAttribute('data-state', 'off');
				document.body.appendChild(this._element);
			}
		}, {
			key: 'show',
			value: function show() {
				var _this9 = this;

				var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};


				// turn on
				this._element.setAttribute('data-state', 'on');

				// show and animate in
				snabbt(this._element, {
					fromOpacity: 0,
					opacity: 1,
					duration: 350,
					complete: function complete() {

						// clean up transforms
						resetTransforms(_this9._element);

						// ready!
						callback();
					}
				});
			}
		}, {
			key: 'hide',
			value: function hide() {
				var _this10 = this;

				var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};


				// animate out and hide
				snabbt(this._element, {
					fromOpacity: 1,
					opacity: 0,
					duration: 500,
					complete: function complete() {

						// clean up transforms
						resetTransforms(_this10._element);

						// hide the editor
						_this10._element.setAttribute('data-state', 'off');

						// ready!
						callback();
					}
				});
			}
		}, {
			key: 'destroy',
			value: function destroy() {
				if (!this._element.parentNode) {
					return;
				}
				this._element.parentNode.removeChild(this._element);
				this._element = null;
				this._inner = null;
			}
		}, {
			key: 'inner',
			set: function set(element) {

				this._inner = element;
				if (this._element.firstChild) {
					this._element.removeChild(this._element.firstChild);
				}
				this._element.appendChild(this._inner);
			}
		}]);

		return Popover;
	}();
}();
var intSplit = function intSplit(v, c) {
	return v.split(c).map(function (v) {
		return parseInt(v, 10);
	});
};

var isWrapper = function isWrapper(element) {
	return element.nodeName === 'DIV' || element.nodeName === 'SPAN';
};

var CropType = {
	AUTO: 'auto',
	INITIAL: 'initial',
	MANUAL: 'manual'
};

var Rect = ['x', 'y', 'width', 'height'];

var HopperEvents = ['file-invalid-drop', 'file-invalid', 'file-drop', 'file-over', 'file-out', 'click'];

var ImageEditorEvents = ['cancel', 'confirm'];

var SlimButtons = ['remove', 'edit', 'download', 'upload'];

var SlimPopover = null;
var SlimCount = 0;

var SlimLoaderHTML = '\n<div class="slim-loader">\n\t<svg>\n\t\t<path class="slim-loader-background" fill="none" stroke-width="3" />\n\t\t<path class="slim-loader-foreground" fill="none" stroke-width="3" />\n\t</svg>\n</div>\n';

var SlimUploadStatusHTML = '\n<div class="slim-upload-status"></div>\n';

var stringToSize = function stringToSize(str) {
	var size = str.split(',');
	return {
		width: parseInt(size[0], 10),
		height: parseInt(size[1], 10)
	};
};

var Slim = function () {
	function Slim(element) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		_classCallCheck(this, Slim);

		// create popover element if not already created
		if (!SlimPopover) {
			SlimPopover = new Popover();
		}

		// we create a new counter, we use this counter to determine if we need to clean up the popover
		this._uid = SlimCount++;

		// the options to use
		this._options = mergeOptions(Slim.options(), options);

		// test options correctness
		if (this._options.forceSize) {
			if (typeof this._options.forceSize === 'string') {
				this._options.forceSize = stringToSize(this._options.forceSize);
			}
			this._options.ratio = this._options.forceSize.width + ':' + this._options.forceSize.height;
			this._options.size = clone(this._options.forceSize);
		}

		// test for size set as string
		if (typeof this._options.size === 'string') {
			this._options.size = stringToSize(this._options.size);
		}

		// test for size set as string
		if (typeof this._options.minSize === 'string') {
			this._options.minSize = stringToSize(this._options.minSize);
		}

		// reference to original element so we can restore original situation
		this._originalElement = element;
		this._originalElementInner = element.innerHTML;
		this._originalElementAttributes = getElementAttributes(element);

		// should be file input, image or slim wrapper, if not wrapper, wrap
		if (!isWrapper(element)) {

			this._element = wrap(element);
			this._element.className = element.className;
			element.className = '';

			// ratio is used for CSS so let's set default attribute
			this._element.setAttribute('data-ratio', this._options.ratio);
		} else {
			this._element = element;
		}
		this._element.classList.add('slim');
		this._element.setAttribute('data-state', 'init');

		// editor state
		this._state = [];

		// internal timer array for async processes
		this._timers = [];

		// the source element (can either be an input or an img)
		this._input = null;

		// the source element unique name if is input type file
		this._inputReference = null;

		// the output element (hidden input that contains the resulting json object)
		this._output = null;

		// current image ratio
		this._ratio = null;

		// was required field
		this._isRequired = false;

		// components
		this._imageHopper = null;
		this._imageEditor = null;

		// progress path
		this._progressEnabled = true;

		// resulting data
		this._data = {};
		this._resetData();

		// the circle below the mouse hover point
		this._drip = null;

		// had initial image
		this._hasInitialImage = false;

		// initial crop
		this._initialCrop = this._options.crop;

		// initial rotation
		this._initialRotation = this._options.rotation && this._options.rotation % 90 === 0 ? this._options.rotation : null;

		// set to true when destroy method is called, used to halt any timeouts or async processes
		this._isBeingDestroyed = false;

		// stop here if not supported
		if (!Slim.supported) {
			this._fallback();
		} else {
			// let's go!
			this._init();
		}
	}

	_createClass(Slim, [{
		key: 'setRotation',
		value: function setRotation(rotation, callback) {

			if (typeof rotation !== 'number' && rotation % 90 !== 0) {
				return;
			}

			this._data.actions.rotation = rotation;
			var isTilted = this._data.actions.rotation % 180 !== 0;

			if (this._data.input.image) {
				var w = isTilted ? this._data.input.image.height : this._data.input.image.width;
				var h = isTilted ? this._data.input.image.width : this._data.input.image.height;
				this._data.actions.crop = getAutoCropRect(w, h, this._ratio);
				this._data.actions.crop.type = CropType.AUTO;
			}

			if (this._data.input.image && callback) {
				this._manualTransform(callback);
			}
		}
	}, {
		key: 'setSize',
		value: function setSize(dimensions, callback) {

			if (typeof dimensions === 'string') {
				dimensions = stringToSize(dimensions);
			}

			if (!dimensions || !dimensions.width || !dimensions.height) {
				return;
			}

			this._options.size = clone(dimensions);
			this._data.actions.size = clone(dimensions);

			// if a crop area is set do re-crop to conform to size
			if (this._data.input.image && callback) {
				this._manualTransform(callback);
			}
		}
	}, {
		key: 'setRatio',
		value: function setRatio(ratio, callback) {
			var _this11 = this;

			if (!ratio || typeof ratio !== 'string') {
				return;
			}

			this._options.ratio = ratio;

			if (this._isFixedRatio()) {

				var parts = intSplit(this._options.ratio, ':');
				this._ratio = parts[1] / parts[0];

				if (this._data.input.image && callback) {
					this._cropAuto(function (data) {
						_this11._scaleDropArea(_this11._ratio);
						if (callback) {
							callback(data);
						}
					});
				} else {

					if (this._data.input.image) {
						this._data.actions.crop = getAutoCropRect(this._data.input.image.width, this._data.input.image.height, this._ratio);
						this._data.actions.crop.type = CropType.AUTO;
					}

					this._scaleDropArea(this._ratio);

					if (callback) {
						callback(null);
					}
				}
			}
		}

		// methods
		// Test if this Slim object has been bound to the given element

	}, {
		key: 'isAttachedTo',
		value: function isAttachedTo(element) {
			return this._element === element || this._originalElement === element;
		}
	}, {
		key: 'isDetached',
		value: function isDetached() {
			return this._element.parentNode === null;
		}
	}, {
		key: 'load',
		value: function load(src) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var callback = arguments[2];


			if (typeof options === 'function') {
				callback = options;
			} else {

				// store in options
				this._options.crop = options.crop;

				// set rotation
				this._options.rotation = options.rotation;

				// initial rotation
				this._initialRotation = options.rotation && options.rotation % 90 === 0 ? options.rotation : null;

				// set initial crop
				this._initialCrop = this._options.crop;
			}

			this._load(src, callback);
		}
	}, {
		key: 'upload',
		value: function upload(callback) {
			this._doUpload(callback);
		}
	}, {
		key: 'download',
		value: function download() {
			this._doDownload();
		}
	}, {
		key: 'remove',
		value: function remove() {
			return this._doRemove();
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			this._doDestroy();
		}
	}, {
		key: 'edit',
		value: function edit() {
			this._doEdit();
		}
	}, {
		key: 'crop',
		value: function crop(rect, callback) {
			this._crop(rect.x, rect.y, rect.width, rect.height, callback);
		}
	}, {
		key: 'containsImage',
		value: function containsImage() {
			return this._data.input.name !== null;
		}

		/**
   * State Related
   */

	}, {
		key: '_canInstantEdit',
		value: function _canInstantEdit() {
			return this._options.instantEdit && !this._isInitialising;
		}
	}, {
		key: '_getFileInput',
		value: function _getFileInput() {
			return this._element.querySelector('input[type=file]');
		}
	}, {
		key: '_getInitialImage',
		value: function _getInitialImage() {
			return this._element.querySelector('img');
		}
	}, {
		key: '_getInputElement',
		value: function _getInputElement() {
			return this._getFileInput() || this._getInitialImage();
		}
	}, {
		key: '_getRatioSpacerElement',
		value: function _getRatioSpacerElement() {
			return this._element.children[0];
		}
	}, {
		key: '_isImageOnly',
		value: function _isImageOnly() {
			return this._input.nodeName !== 'INPUT';
		}
	}, {
		key: '_isFixedRatio',
		value: function _isFixedRatio() {
			return this._options.ratio.indexOf(':') !== -1;
		}
	}, {
		key: '_isAutoCrop',
		value: function _isAutoCrop() {
			return this._data.actions.crop.type === CropType.AUTO;
		}
	}, {
		key: '_toggleButton',
		value: function _toggleButton(action, state) {
			toggleDisplayBySelector('.slim-btn[data-action="' + action + '"]', state, this._element);
		}
	}, {
		key: '_clearState',
		value: function _clearState() {
			this._state = [];
			this._updateState();
		}
	}, {
		key: '_removeState',
		value: function _removeState(state) {
			this._state = this._state.filter(function (item) {
				return item !== state;
			});
			this._updateState();
		}
	}, {
		key: '_addState',
		value: function _addState(state) {
			if (inArray(state, this._state)) {
				return;
			}
			this._state.push(state);
			this._updateState();
		}
	}, {
		key: '_updateState',
		value: function _updateState() {
			if (!this._element) {
				return;
			}
			this._element.setAttribute('data-state', this._state.join(','));
		}
	}, {
		key: '_resetData',
		value: function _resetData() {

			// resets data object
			this._data = {
				server: null,
				meta: clone(this._options.meta),
				input: {
					field: this._inputReference,
					name: null,
					type: null,
					width: 0,
					height: 0,
					file: null
				},
				output: {
					image: null,
					width: 0,
					height: 0
				},
				actions: {
					rotation: null,
					crop: null,
					size: null
				}
			};

			// resets hidden input clone (has not yet been created when reset call in constructor, hence the check)
			if (this._output) {
				this._output.value = '';
			}

			// should reset file input
			resetFileInput(this._getFileInput());
		}

		/**
   * Initialisation
   */

	}, {
		key: '_init',
		value: function _init() {
			var _this12 = this;

			// busy initialising
			this._isInitialising = true;

			// cropper root is not file input
			this._addState('empty');

			// define input reference field name
			if (inArray('input', this._options.post)) {
				this._inputReference = 'slim_input_' + this._uid;
			}

			// get input element
			this._input = this._getInputElement();

			// if no input supplied we'll automatically create one
			if (!this._input) {
				this._input = create('input');
				this._input.type = 'file';
				this._element.appendChild(this._input);
			}

			// get required state of input element
			this._isRequired = this._input.required === true;

			// set or create output field
			this._output = this._element.querySelector('input[type=hidden]');

			// if no output element defined we'll create one automagically
			if (!this._output) {
				this._output = create('input');
				this._output.type = 'hidden';
				this._output.name = this._input.name || this._options.defaultInputName;
				this._element.appendChild(this._output);
			}

			// prevent the original file input field from posting (value will be duplicated to output field)
			this._input.removeAttribute('name');

			// create drop area
			var area = create('div', 'slim-area');

			// test if contains initial image
			var initialImage = this._getInitialImage();
			var initialImageSrc = (initialImage || {}).src;
			if (initialImageSrc) {
				this._hasInitialImage = true;
			} else {
				this._initialCrop = null;
				this._initialRotation = null;
			}

			var resultHTML = '\n\t\t<div class="slim-result">\n\t\t\t<img class="in" style="opacity:0" ' + (initialImageSrc ? 'src="' + initialImageSrc + '"' : '') + '><img><img style="opacity:0">\n\t\t</div>';

			// add drop overlay
			if (this._isImageOnly()) {
				area.innerHTML = '\n\t\t\t\t' + SlimLoaderHTML + '\n\t\t\t\t' + SlimUploadStatusHTML + '\n\t\t\t\t' + resultHTML + '\n\t\t\t\t<div class="slim-status"><div class="slim-label-loading">' + (this._options.labelLoading || '') + '</div></div>\n\t\t\t';
			} else {

				// if should post input data
				if (inArray('input', this._options.post)) {

					this._data.input.field = this._inputReference;

					// if is sync post
					// and should post input data
					if (!this._options.service) {
						this._input.name = this._inputReference;
					}
				}

				// set common image mime type to the accept attribute
				var mimetypes = void 0;
				if (!this._input.hasAttribute('accept') || this._input.getAttribute('accept') === 'image/*') {
					mimetypes = getCommonMimeTypes();
					this._input.setAttribute('accept', mimetypes.join(','));
				} else {
					mimetypes = this._input.accept.split(',').map(function (mimetype) {
						return mimetype.trim();
					}).filter(function (mimetype) {
						return mimetype.length > 0;
					});
				}

				// setup hopper
				this._imageHopper = new FileHopper();
				this._imageHopper.accept = mimetypes;
				this._imageHopper.allowURLs = typeof this._options.fetcher === 'string';
				this._element.appendChild(this._imageHopper.element);
				HopperEvents.forEach(function (e) {
					_this12._imageHopper.element.addEventListener(e, _this12);
				});

				// render area
				area.innerHTML = '\n\t\t\t\t' + SlimLoaderHTML + '\n\t\t\t\t' + SlimUploadStatusHTML + '\n\t\t\t\t<div class="slim-drip"><span><span></span></span></div>\n\t\t\t\t<div class="slim-status"><div class="slim-label">' + (this._options.label || '') + '</div><div class="slim-label-loading">' + (this._options.labelLoading || '') + '</div></div>\n\t\t\t\t' + resultHTML + '\n\t\t\t';

				// start listening for events so we can load image on file input change
				this._input.addEventListener('change', this);
			}

			// add area node
			this._element.appendChild(area);

			// add button group
			this._btnGroup = create('div', 'slim-btn-group');
			this._btnGroup.style.display = 'none';
			this._element.appendChild(this._btnGroup);
			SlimButtons.filter(function (c) {
				return _this12._isButtonAllowed(c);
			}).forEach(function (c) {
				var prop = capitalizeFirstLetter(c);
				var label = _this12._options['button' + prop + 'Label'];
				var title = _this12._options['button' + prop + 'Title'] || label;
				var className = _this12._options['button' + prop + 'ClassName'];
				var btn = create('button', 'slim-btn slim-btn-' + c + (className ? ' ' + className : ''));
				btn.innerHTML = label;
				btn.title = title;
				btn.type = 'button';
				btn.addEventListener('click', _this12);
				btn.setAttribute('data-action', c);
				_this12._btnGroup.appendChild(btn);
			});

			// add ratio padding
			if (this._isFixedRatio()) {
				var parts = intSplit(this._options.ratio, ':');
				this._ratio = parts[1] / parts[0];
				this._scaleDropArea(this._ratio);
			}

			// setup loader
			this._updateProgress(.5);

			// preload source
			if (initialImageSrc) {

				this._load(initialImageSrc, function () {
					_this12._onInit();
				});
			} else {
				this._onInit();
			}
		}
	}, {
		key: '_onInit',
		value: function _onInit() {
			var _this13 = this;

			// we're done initialising
			this._isInitialising = false;

			// done initialising now, else is only called after image load
			var done = function done() {
				// we call this async so the constructor of Slim has returned before the onInit is called, allowing clean immidiate destroy
				var timer = setTimeout(function () {
					_this13._options.didInit.apply(_this13, [_this13.data]);
				}, 0);
				_this13._timers.push(timer);
			};

			// save initial image
			if (this._options.saveInitialImage && this.containsImage()) {

				if (!this._options.service) {
					this._save(function () {
						done();
					}, false);
				}
			} else {

				// by default upload button is disabled for existing images
				if (this._options.service && this.containsImage()) {
					this._toggleButton('upload', false);
				}

				done();
			}
		}
	}, {
		key: '_updateProgress',
		value: function _updateProgress(progress) {

			progress = Math.min(.99999, progress);

			if (!this._element) {
				return;
			}

			if (!this._progressEnabled) {
				return;
			}

			var loader = this._element.querySelector('.slim-loader');
			if (!loader) {
				return;
			}

			var size = loader.offsetWidth;
			var paths = loader.querySelectorAll('path');
			var ringWidth = parseInt(paths[0].getAttribute('stroke-width'), 10);

			paths[0].setAttribute('d', percentageArc(size * .5, size * .5, size * .5 - ringWidth, .9999));

			paths[1].setAttribute('d', percentageArc(size * .5, size * .5, size * .5 - ringWidth, progress));
		}
	}, {
		key: '_startProgress',
		value: function _startProgress(cb) {
			var _this14 = this;

			if (!this._element) {
				return;
			}

			this._progressEnabled = false;

			var loader = this._element.querySelector('.slim-loader');
			if (!loader) {
				return;
			}
			var ring = loader.children[0];

			this._stopProgressLoop(function () {

				loader.removeAttribute('style');
				ring.removeAttribute('style');

				_this14._progressEnabled = true;

				_this14._updateProgress(0);

				_this14._progressEnabled = false;

				snabbt(ring, {

					fromOpacity: 0,
					opacity: 1,
					duration: 250,
					complete: function complete() {
						_this14._progressEnabled = true;
						if (cb) {
							cb();
						}
					}
				});
			});
		}
	}, {
		key: '_stopProgress',
		value: function _stopProgress() {
			var _this15 = this;

			if (!this._element) {
				return;
			}

			var loader = this._element.querySelector('.slim-loader');
			if (!loader) {
				return;
			}
			var ring = loader.children[0];

			this._updateProgress(1);

			snabbt(ring, {
				fromOpacity: 1,
				opacity: 0,
				duration: 250,
				complete: function complete() {

					loader.removeAttribute('style');
					ring.removeAttribute('style');

					_this15._updateProgress(.5);

					_this15._progressEnabled = false;
				}
			});
		}
	}, {
		key: '_startProgressLoop',
		value: function _startProgressLoop() {

			if (!this._element) {
				return;
			}

			// start loading animation
			var loader = this._element.querySelector('.slim-loader');
			if (!loader) {
				return;
			}

			var ring = loader.children[0];
			loader.removeAttribute('style');
			ring.removeAttribute('style');

			// set infinite load state
			this._updateProgress(.5);

			// repeat!
			var repeat = 1000;

			snabbt(loader, 'stop');

			snabbt(loader, {
				rotation: [0, 0, -(Math.PI * 2) * repeat],
				easing: 'linear',
				duration: repeat * 1000
			});

			snabbt(ring, {
				fromOpacity: 0,
				opacity: 1,
				duration: 250
			});
		}
	}, {
		key: '_stopProgressLoop',
		value: function _stopProgressLoop(callback) {

			if (!this._element) {
				return;
			}

			var loader = this._element.querySelector('.slim-loader');
			if (!loader) {
				return;
			}

			var ring = loader.children[0];

			snabbt(ring, {
				fromOpacity: parseFloat(ring.style.opacity),
				opacity: 0,
				duration: 250,
				complete: function complete() {

					snabbt(loader, 'stop');

					loader.removeAttribute('style');
					ring.removeAttribute('style');

					if (callback) {
						callback();
					}
				}
			});
		}
	}, {
		key: '_isButtonAllowed',
		value: function _isButtonAllowed(button) {

			if (button === 'edit') {
				return this._options.edit;
			}

			if (button === 'download') {
				return this._options.download;
			}

			if (button === 'upload') {

				// if no service defined upload button makes no sense
				if (!this._options.service) {
					return false;
				}

				// if push mode is set, no need for upload button
				if (this._options.push) {
					return false;
				}

				// set upload button
				return true;
			}

			if (button === 'remove') {
				return !this._isImageOnly();
			}

			return true;
		}
	}, {
		key: '_fallback',
		value: function _fallback() {

			// create status area
			var area = create('div', 'slim-area');
			area.innerHTML = '\n\t\t\t<div class="slim-status"><div class="slim-label">' + (this._options.label || '') + '</div></div>\n\t\t';
			this._element.appendChild(area);

			this._throwError(this._options.statusNoSupport);
		}

		/**
   * Event routing
   */

	}, {
		key: 'handleEvent',
		value: function handleEvent(e) {

			switch (e.type) {
				case 'click':
					this._onClick(e);
					break;
				case 'change':
					this._onChange(e);
					break;
				case 'cancel':
					this._onCancel(e);
					break;
				case 'confirm':
					this._onConfirm(e);
					break;
				case 'file-over':
					this._onFileOver(e);
					break;
				case 'file-out':
					this._onFileOut(e);
					break;
				case 'file-drop':
					this._onDropFile(e);
					break;
				case 'file-invalid':
					this._onInvalidFile(e);
					break;
				case 'file-invalid-drop':
					this._onInvalidFileDrop(e);
					break;
			}
		}
	}, {
		key: '_getIntro',
		value: function _getIntro() {
			return this._element.querySelector('.slim-result .in');
		}
	}, {
		key: '_getOutro',
		value: function _getOutro() {
			return this._element.querySelector('.slim-result .out');
		}
	}, {
		key: '_getInOut',
		value: function _getInOut() {
			return this._element.querySelectorAll('.slim-result img');
		}
	}, {
		key: '_getDrip',
		value: function _getDrip() {
			if (!this._drip) {
				this._drip = this._element.querySelector('.slim-drip > span');
			}
			return this._drip;
		}

		// errors

	}, {
		key: '_throwError',
		value: function _throwError(error) {

			this._addState('error');

			this._element.querySelector('.slim-label').style.display = 'none';

			var node = this._element.querySelector('.slim-error');
			if (!node) {
				node = create('div', 'slim-error');
				this._element.querySelector('.slim-status').appendChild(node);
			}

			node.innerHTML = error;
		}
	}, {
		key: '_removeError',
		value: function _removeError() {

			this._removeState('error');
			this._element.querySelector('.slim-label').style.display = '';

			var error = this._element.querySelector('.slim-error');
			if (error) {
				error.parentNode.removeChild(error);
			}
		}
	}, {
		key: '_openFileDialog',
		value: function _openFileDialog() {
			this._removeError();
			this._input.click();
		}

		// drop area clicked

	}, {
		key: '_onClick',
		value: function _onClick(e) {
			var _this16 = this;

			var list = e.target.classList;
			var target = e.target;

			// no preview, so possible to drop file
			if (list.contains('slim-file-hopper')) {
				this._openFileDialog();
				return;
			}

			// decide what button was clicked
			switch (target.getAttribute('data-action')) {
				case 'remove':
					this._options.willRemove.apply(this, [this.data, function () {
						_this16._doRemove();
					}]);
					break;
				case 'edit':
					this._doEdit();
					break;
				case 'download':
					this._doDownload();
					break;
				case 'upload':
					this._doUpload();
					break;
			}
		}
	}, {
		key: '_onInvalidFileDrop',
		value: function _onInvalidFileDrop() {

			this._onInvalidFile();

			this._removeState('file-over');

			// animate out drip
			var drip = this._getDrip();
			snabbt(drip.firstChild, {
				fromScale: [.5, .5],
				scale: [0, 0],
				fromOpacity: .5,
				opacity: 0,
				duration: 150,
				complete: function complete() {

					// clean up transforms
					resetTransforms(drip.firstChild);
				}
			});
		}
	}, {
		key: '_onInvalidFile',
		value: function _onInvalidFile() {

			var types = this._imageHopper.accept.map(getExtensionByMimeType);
			var error = this._options.statusFileType.replace('$0', types.join(', '));
			this._throwError(error);
		}
	}, {
		key: '_onImageTooSmall',
		value: function _onImageTooSmall() {

			var error = this._options.statusImageTooSmall.replace('$0', this._options.minSize.width + ' \xD7 ' + this._options.minSize.height);
			this._throwError(error);
		}
	}, {
		key: '_onOverWeightFile',
		value: function _onOverWeightFile() {

			var error = this._options.statusFileSize.replace('$0', this._options.maxFileSize);
			this._throwError(error);
		}
	}, {
		key: '_onRemoteURLProblem',
		value: function _onRemoteURLProblem(error) {
			this._throwError(error);
		}
	}, {
		key: '_onFileOver',
		value: function _onFileOver(e) {

			this._addState('file-over');
			this._removeError();

			// animations
			var drip = this._getDrip();

			// move around drip
			var matrix = snabbt.createMatrix();
			matrix.translate(e.detail.x, e.detail.y, 0);
			snabbt.setElementTransform(drip, matrix);

			// on first entry fade in blob
			if (this._imageHopper.dragPath.length == 1) {

				// show
				drip.style.opacity = 1;

				// animate in
				snabbt(drip.firstChild, {
					fromOpacity: 0,
					opacity: .5,
					fromScale: [0, 0],
					scale: [.5, .5],
					duration: 150
				});
			}
		}
	}, {
		key: '_onFileOut',
		value: function _onFileOut(e) {

			this._removeState('file-over');
			this._removeState('file-invalid');
			this._removeError();

			// move to last position
			var drip = this._getDrip();
			var matrix = snabbt.createMatrix();
			matrix.translate(e.detail.x, e.detail.y, 0);
			snabbt.setElementTransform(drip, matrix);

			// animate out
			snabbt(drip.firstChild, {
				fromScale: [.5, .5],
				scale: [0, 0],
				fromOpacity: .5,
				opacity: 0,
				duration: 150,
				complete: function complete() {

					// clean up transforms
					resetTransforms(drip.firstChild);
				}
			});
		}

		/**
   * When a file was literally dropped on the drop area
   * @param e
   * @private
   */

	}, {
		key: '_onDropFile',
		value: function _onDropFile(e) {
			var _this17 = this;

			this._removeState('file-over');

			// get drip node reference and set to last position
			var drip = this._getDrip();
			var matrix = snabbt.createMatrix();
			matrix.translate(e.detail.x, e.detail.y, 0);
			snabbt.setElementTransform(drip, matrix);

			// get element minimum 10 entries distant from the last entry so we can calculate velocity of movement
			var l = this._imageHopper.dragPath.length;
			var jump = this._imageHopper.dragPath[l - Math.min(10, l)];

			// velocity
			var dx = e.detail.x - jump.x;
			var dy = e.detail.y - jump.y;

			snabbt(drip, {
				fromPosition: [e.detail.x, e.detail.y, 0],
				position: [e.detail.x + dx, e.detail.y + dy, 0],
				duration: 200
			});

			// animate out drip
			snabbt(drip.firstChild, {

				fromScale: [.5, .5],
				scale: [2, 2],
				fromOpacity: 1,
				opacity: 0,
				duration: 200,

				complete: function complete() {

					// clean up transforms
					resetTransforms(drip.firstChild);

					// load dropped resource
					_this17._load(e.target.files[0]);
				}
			});
		}

		/**
   * When a file has been selected after a click on the drop area
   * @param e
   * @private
   */

	}, {
		key: '_onChange',
		value: function _onChange(e) {

			if (e.target.files.length) {
				this._load(e.target.files[0]);
			}
		}

		/**
   * Loads a resource (blocking operation)
   * @param resource
   * @param callback(err)
   * @private
   */

	}, {
		key: '_load',
		value: function _load(resource, callback) {
			var _this18 = this;

			// stop here
			if (this._isBeingDestroyed) {
				return;
			}

			// if currently contains image, remove it
			if (this.containsImage()) {

				clearTimeout(this._replaceTimeout);

				this._doRemove(function () {

					_this18._replaceTimeout = setTimeout(function () {
						_this18._load(resource, callback);
					}, 100);
				});

				return;
			}

			// no longer empty
			this._removeState('empty');
			this._addState('busy');

			// start loading indicator
			this._startProgressLoop();

			// can't drop any other image while loading
			if (this._imageHopper) {
				this._imageHopper.enabled = false;
			}

			clearTimeout(this._loadTimeout);
			var load = function load() {
				clearTimeout(_this18._loadTimeout);
				_this18._loadTimeout = setTimeout(function () {

					if (_this18._isBeingDestroyed) {
						return;
					}

					_this18._addState('loading');

					snabbt(_this18._element.querySelector('.slim-label-loading'), {
						fromOpacity: 0,
						opacity: 1,
						duration: 250
					});
				}, 500);
			};

			// early exit
			var exit = function exit() {
				if (_this18._imageHopper) {
					_this18._imageHopper.enabled = true;
				}
				_this18._removeState('loading');
				_this18._removeState('busy');
				_this18._addState('empty');
				_this18._stopProgressLoop();
			};

			// turn string based resources (url / base64) into file objects
			if (typeof resource === 'string') {

				if (resourceIsBase64Data(resource)) {
					// resource is base64 data, turn into file
					this._load(base64ToBlob(resource), callback);
				} else {

					// will take a while, show loading indicator
					load();

					// resource is url, load with XHR
					loadURL(resource, function (file) {
						// continue with file object
						_this18._load(file, callback);
					});
				}

				// don't continue, wait for load
				return;
			} else if (typeof resource.remote !== 'undefined' && this._options.fetcher) {

				loadRemoteURL(this._options.fetcher, resource.remote, function (error) {

					exit();

					_this18._onRemoteURLProblem('<p>' + error + '</p>');

					if (callback) {
						callback.apply(_this18, ['remote-url-problem']);
					}
				}, function (file) {
					// continue with file object
					_this18._load(file, callback);
				});

				// don't continue wait for server fetch
				return;
			}

			// let's continue with file resource
			var file = resource;

			// re-test if is valid file type
			// in case of loading base64 data or url
			if (this._imageHopper && this._imageHopper.accept.indexOf(file.type) === -1) {

				exit();

				this._onInvalidFile();
				if (callback) {
					callback.apply(this, ['file-invalid']);
				}
				return;
			}

			// test if too big
			if (file.size && this._options.maxFileSize && bytesToMegaBytes(file.size) > this._options.maxFileSize) {

				exit();

				this._onOverWeightFile();
				if (callback) {
					callback.apply(this, ['file-too-big']);
				}
				return;
			}

			// if has loaded image editor set to dirty
			if (this._imageEditor) {
				this._imageEditor.dirty();
			}

			// continue
			this._data.input.name = getFileNameByFile(file);
			this._data.input.type = getFileTypeByFile(file);
			this._data.input.size = file.size;
			this._data.input.file = file;

			// fetch resource
			getImageAsCanvas(file, this._options.internalCanvasSize, function (image, meta) {

				var rewind = function rewind() {

					// rewind state
					if (_this18._imageHopper) {
						_this18._imageHopper.enabled = true;
					}

					_this18._removeState('loading');
					_this18._removeState('busy');
					_this18._addState('empty');
					_this18._stopProgressLoop();
					_this18._resetData();
				};

				// if no image, something went wrong
				if (!image) {

					rewind();

					if (callback) {
						callback.apply(_this18, ['file-not-found']);
					}

					return;
				}

				// test if image is too small
				if (!covers(image, _this18._options.minSize)) {

					rewind();

					_this18._onImageTooSmall();

					if (callback) {
						callback.apply(_this18, ['image-too-small']);
					}

					return;
				}

				var status = _this18._options.didLoad.apply(_this18, [file, image, meta]);
				if (status !== true) {

					rewind();

					if (status !== false) {
						_this18._throwError(status);
					}

					if (callback) {
						callback.apply(_this18, [status]);
					}

					return;
				}

				// done loading file
				_this18._removeState('loading');

				var revealCanvas = function revealCanvas(done) {

					// done, enable hopper
					if (_this18._imageHopper && _this18._options.dropReplace) {
						_this18._imageHopper.enabled = true;
					}

					// do intro stuff
					var intro = _this18._getIntro();

					// setup base animation
					var animation = {
						fromScale: [1.25, 1.25],
						scale: [1, 1],
						fromOpacity: 0,
						opacity: 1,
						complete: function complete() {

							resetTransforms(intro);

							intro.style.opacity = 1;

							done();
						}

					};

					// if not attached to DOM, don't animate
					if (_this18.isDetached()) {
						animation.duration = 1;
					} else {
						animation.easing = 'spring';
						animation.springConstant = .3;
						animation.springDeceleration = .7;
					}

					// if is instant edit mode don't zoom out but zoom in
					if (_this18._canInstantEdit()) {
						animation.delay = 500;
						animation.duration = 1;

						// instant edit mode just fire up the editor immidiately
						_this18._doEdit();
					}

					// reveal loaded image
					snabbt(intro, animation);
				};

				// load the image
				_this18._loadCanvas(image,

				// done loading the canvas
				function (isUploading) {

					_this18._addState('preview');

					revealCanvas(function () {

						// don't show buttons when instant editing
						// the buttons will be triggered by the closing of the popup
						if (!_this18._canInstantEdit() && !isUploading) {
							_this18._showButtons();
						}

						if (!isUploading) {
							_this18._stopProgressLoop();
							_this18._removeState('busy');
						}

						if (callback) {
							callback.apply(_this18, [null, _this18.data]);
						}
					});
				},

				// done uploading
				function () {

					// don't show buttons when instant editing
					if (!_this18._canInstantEdit()) {
						_this18._showButtons();
					}

					_this18._removeState('busy');
				});
			});
		}
	}, {
		key: '_loadCanvas',
		value: function _loadCanvas(image, ready, complete) {
			var _this19 = this;

			// halt here if cropper is currently being destroyed
			if (this._isBeingDestroyed) {
				return;
			}

			// store raw data
			this._data.input.image = image;
			this._data.input.width = image.width;
			this._data.input.height = image.height;

			if (this._initialRotation) {
				this._data.actions.rotation = this._initialRotation;
				this._initialRotation = null;
			}

			var isTilted = this._data.actions.rotation % 180 !== 0;

			// scales the drop area
			// if is 'input' or 'free' parameter
			if (!this._isFixedRatio()) {
				if (this._initialCrop) {
					this._ratio = this._initialCrop.height / this._initialCrop.width;
				} else {
					this._ratio = isTilted ? image.width / image.height : image.height / image.width;
				}
				this._scaleDropArea(this._ratio);
			}

			if (this._initialCrop) {

				// use initial supplied crop rectangle
				this._data.actions.crop = clone(this._initialCrop);
				this._data.actions.crop.type = CropType.INITIAL;

				// clear initial crop, it's no longer useful
				this._initialCrop = null;
			} else {
				// get automagical crop rectangle
				this._data.actions.crop = getAutoCropRect(isTilted ? image.height : image.width, isTilted ? image.width : image.height, this._ratio);
				this._data.actions.crop.type = CropType.AUTO;
			}

			// if max size set
			if (this._options.size) {
				this._data.actions.size = {
					width: this._options.size.width,
					height: this._options.size.height
				};
			}

			// do initial auto transform
			this._applyTransforms(image, function (transformedImage) {

				var intro = _this19._getIntro();
				var scalar = intro.offsetWidth / transformedImage.width;

				// store data, if has preview image this prevents initial load from pushing
				var willUpload = false;

				// can only do auto upload when service is defined and push is enabled...
				if (_this19._options.service && _this19._options.push) {

					// ...and is not transformation of initial image
					// + is not instant edit mode
					if (!_this19._hasInitialImage && !_this19._canInstantEdit()) {
						willUpload = true;
						_this19._stopProgressLoop(function () {
							_this19._startProgress(function () {
								_this19._updateProgress(.1);
							});
						});
					}
				}

				// no service set, and instant edit
				if (!_this19._canInstantEdit()) {

					// store data (possibly)
					_this19._save(function () {
						if (_this19._isBeingDestroyed) {
							return;
						}
						if (willUpload) {
							_this19._stopProgress();
							complete();
						}
					}, willUpload);
				}

				// show intro animation
				intro.src = '';
				intro.src = cloneCanvasScaled(transformedImage, scalar).toDataURL();
				intro.onload = function () {

					intro.onload = null;

					// bail out if we've been cleaned up
					if (_this19._isBeingDestroyed) {
						return;
					}

					if (ready) {
						ready(willUpload);
					}
				};
			});
		}
	}, {
		key: '_applyTransforms',
		value: function _applyTransforms(image, ready) {
			var _this20 = this;

			var actions = clone(this._data.actions);
			actions.filters = {
				sharpen: this._options.filterSharpen / 100
			};

			transformCanvas(image, actions, function (transformedImage) {

				var outputImage = transformedImage;

				// if should force/correct output size?
				// - is forced size set?
				// - is a discrepancy found between requested output size and transformed size
				if (_this20._options.forceSize || _this20._options.size && sizeDist(_this20._options.size, transformedImage) == 1) {
					outputImage = create('canvas');
					outputImage.width = _this20._options.size.width;
					outputImage.height = _this20._options.size.height;
					var ctx = outputImage.getContext('2d');
					ctx.drawImage(transformedImage, 0, 0, _this20._options.size.width, _this20._options.size.height);
				}

				// store output
				_this20._data.output.width = outputImage.width;
				_this20._data.output.height = outputImage.height;
				_this20._data.output.image = outputImage;

				_this20._onTransformCanvas(function (transformedData) {

					_this20._data = transformedData;

					_this20._options.didTransform.apply(_this20, [_this20.data]);

					ready(_this20._data.output.image);
				});
			});
		}
	}, {
		key: '_onTransformCanvas',
		value: function _onTransformCanvas(ready) {

			this._options.willTransform.apply(this, [this.data, ready]);
		}

		/**
   * Creates the editor nodes
   * @private
   */

	}, {
		key: '_appendEditor',
		value: function _appendEditor() {
			var _this21 = this;

			// we already have an editor
			if (this._imageEditor) {
				return;
			}

			// add editor
			this._imageEditor = new ImageEditor(create('div'), {
				minSize: this._options.minSize,

				buttonConfirmClassName: this._options.buttonConfirmClassName,
				buttonCancelClassName: this._options.buttonCancelClassName,
				buttonRotateClassName: this._options.buttonRotateClassName,

				buttonConfirmLabel: this._options.buttonConfirmLabel,
				buttonCancelLabel: this._options.buttonCancelLabel,
				buttonRotateLabel: this._options.buttonRotateLabel,

				buttonConfirmTitle: this._options.buttonConfirmTitle,
				buttonCancelTitle: this._options.buttonCancelTitle,
				buttonRotateTitle: this._options.buttonRotateTitle

			});

			// listen to events
			ImageEditorEvents.forEach(function (e) {
				_this21._imageEditor.element.addEventListener(e, _this21);
			});
		}
	}, {
		key: '_scaleDropArea',
		value: function _scaleDropArea(ratio) {
			var node = this._getRatioSpacerElement();
			if (!node || !this._element) {
				return;
			}
			node.style.marginBottom = ratio * 100 + '%';
			this._element.setAttribute('data-ratio', '1:' + ratio);
		}

		/**
   * Data Layer
   * @private
   */
		// image editor closed

	}, {
		key: '_onCancel',
		value: function _onCancel(e) {

			this._removeState('editor');

			this._options.didCancel.apply(this);

			this._showButtons();

			this._hideEditor();

			if (this._options.instantEdit && !this._hasInitialImage && this._isAutoCrop()) {
				this._doRemove();
			}
		}

		// user confirmed changes

	}, {
		key: '_onConfirm',
		value: function _onConfirm(e) {
			var _this22 = this;

			// if
			// - service set
			// - and we are pushing
			// - and we don't instant edit
			// we will upload
			var willUpload = this._options.service && this._options.push;
			if (willUpload) {
				this._startProgress(function () {
					_this22._updateProgress(.1);
				});
			} else {
				this._startProgressLoop();
			}

			this._removeState('editor');

			this._addState('busy');

			// clear data
			this._output.value = '';

			// apply new action object to this._data
			this._data.actions.rotation = e.detail.rotation;
			this._data.actions.crop = e.detail.crop;
			this._data.actions.crop.type = CropType.MANUAL;

			// do transforms
			this._applyTransforms(this._data.input.image, function (transformedImage) {

				// user confirmed the crop (and changes have been applied to data)
				_this22._options.didConfirm.apply(_this22, [_this22.data]);

				// set new image result
				var images = _this22._getInOut();
				var intro = images[0].className === 'out' ? images[0] : images[1];
				var outro = intro === images[0] ? images[1] : images[0];

				intro.className = 'in';
				intro.style.opacity = '0';
				intro.style.zIndex = '2';
				outro.className = 'out';
				outro.style.zIndex = '1';

				// new image get's
				intro.src = '';
				intro.src = cloneCanvasScaled(transformedImage, intro.offsetWidth / transformedImage.width).toDataURL();
				intro.onload = function () {

					intro.onload = null;

					// scale the dropzone
					if (_this22._options.ratio === 'free') {
						_this22._ratio = intro.naturalHeight / intro.naturalWidth;
						_this22._scaleDropArea(_this22._ratio);
					}

					// close the editor
					_this22._hideEditor();

					// wait a tiny bit so animations sync up nicely
					var timer = setTimeout(function () {

						// show the preview
						_this22._showPreview(intro, function () {

							// save the data
							_this22._save(function (err, data, res) {

								// done!
								_this22._toggleButton('upload', true);

								if (willUpload) {
									_this22._stopProgress();
								} else {
									_this22._stopProgressLoop();
								}

								_this22._removeState('busy');

								_this22._showButtons();
							}, willUpload);
						});
					}, 250);

					_this22._timers.push(timer);
				};
			});
		}
	}, {
		key: '_cropAuto',
		value: function _cropAuto() {
			var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (data) {};


			var isTilted = this._data.actions.rotation % 180 !== 0;

			var rect = getAutoCropRect(isTilted ? this._data.input.image.width : this._data.input.image.height, isTilted ? this._data.input.image.height : this._data.input.image.width, this._ratio);

			this._crop(rect.x, rect.y, rect.width, rect.height, callback, CropType.AUTO);
		}
	}, {
		key: '_crop',
		value: function _crop(x, y, width, height) {
			var callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : function (data) {};
			var cropType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : CropType.MANUAL;


			// clear data
			this._output.value = '';

			// apply new action object to this._data
			this._data.actions.crop = {
				x: x,
				y: y,
				width: width,
				height: height
			};
			this._data.actions.crop.type = cropType;

			this._manualTransform(callback);
		}
	}, {
		key: '_manualTransform',
		value: function _manualTransform(callback) {
			var _this23 = this;

			this._startProgressLoop();
			this._addState('busy');

			// do transforms
			this._applyTransforms(this._data.input.image, function (transformedImage) {

				// set new image result
				var images = _this23._getInOut();
				var intro = images[0].className === 'out' ? images[0] : images[1];
				var outro = intro === images[0] ? images[1] : images[0];

				intro.className = 'in';
				intro.style.opacity = '1';
				intro.style.zIndex = '2';
				outro.className = 'out';
				outro.style.zIndex = '0';

				// new image
				intro.src = '';
				intro.src = cloneCanvasScaled(transformedImage, intro.offsetWidth / transformedImage.width).toDataURL();
				intro.onload = function () {
					intro.onload = null;

					// scale the dropzone
					if (_this23._options.ratio === 'free') {
						_this23._ratio = intro.naturalHeight / intro.naturalWidth;
						_this23._scaleDropArea(_this23._ratio);
					}

					// determine if will also upload
					var willUpload = _this23._options.service && _this23._options.push;

					var save = function save() {

						// save the data
						_this23._save(function (err, data, res) {

							// stop loader
							if (!willUpload) {
								_this23._stopProgressLoop();
							}

							_this23._removeState('busy');

							callback.apply(_this23, [_this23.data]);
						}, willUpload);
					};

					if (willUpload) {
						_this23._startProgress(save);
					} else {
						save();
					}
				};
			});
		}
	}, {
		key: '_save',
		value: function _save() {
			var _this24 = this;

			var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
			var allowUpload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;


			if (this._isBeingDestroyed) {
				return;
			}

			// flatten data also turns output canvas into data uri
			// removes input file object and image object
			var data = this.dataBase64;

			// decide if we need to
			// - A. Store the data in an output field
			// - B. Upload the data and store the response in output field

			// - we are not doing async uploading (in which case output is used for response)
			// - we are not initialising a replaceable image
			if (!this._options.service && !(this._isInitialising && !this._isImageOnly())) {

				this._options.willSave.apply(this, [data, function (data) {

					_this24._store(data);

					_this24._options.didSave.apply(_this24, [data]);
				}]);
			}

			if (this._isBeingDestroyed) {
				return;
			}

			// is remote service defined upload async
			if (this._options.service && allowUpload) {

				// allow user to modify the data
				this._options.willSave.apply(this, [data, function (data) {

					_this24._addState('upload');

					if (_this24._imageHopper && _this24._options.dropReplace) {
						_this24._imageHopper.enabled = false;
					}

					// do the actual uploading
					_this24._upload(data, function (err, res) {

						if (_this24._imageHopper && _this24._options.dropReplace) {
							_this24._imageHopper.enabled = true;
						}

						// store response
						if (!err) {
							_this24._storeServerResponse(res);
						}

						// we did upload data
						_this24._options.didUpload.apply(_this24, [err, data, res]);

						_this24._removeState('upload');

						// done!
						callback(err, data, res);
					});
				}]);
			}

			// if no service, we're done here
			if (!this._options.service || !allowUpload) {
				callback();
			}
		}

		// stores active file information in hidden output field

	}, {
		key: '_storeServerResponse',
		value: function _storeServerResponse(data) {

			// remove required flag
			if (this._isRequired) {
				this._input.required = false;
			}

			// store data returned from server
			this._data.server = data;

			// sync with output value
			this._output.value = (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' ? JSON.stringify(this._data.server) : data;
		}

		// stores data in output field

	}, {
		key: '_store',
		value: function _store(data) {

			if (this._isRequired) {
				this._input.required = false;
			}

			this._output.value = JSON.stringify(data);
		}

		// uploads given data to server

	}, {
		key: '_upload',
		value: function _upload(data, callback) {
			var _this25 = this;

			var formData = new FormData();

			// if image data is defined, turn it into a file object (we can send files if we're uploading)
			if (this._data.output.image !== null && this._options.uploadBase64 === false) {
				var output = base64ToBlob(data.output.image, data.output.name);
				var field = 'slim_output_' + this._uid;
				data.output.image = null;
				data.output.field = field;
				formData.append(field, output, data.output.name);
			}

			// output dataset
			formData.append(this._output.name, JSON.stringify(data));

			// if input should be posted along, append data
			// to FormData object as file
			if (inArray('input', this._options.post)) {
				formData.append(this._inputReference, this._data.input.file, this._data.input.file.name);
			}

			var statusNode = this._element.querySelector('.slim-upload-status');

			var requestDecorator = this._options.willRequest;

			send(
			// url to service
			this._options.service,

			// data
			formData,

			// decorator (useful to add headers to request
			requestDecorator,

			// progress
			function (loaded, total) {

				_this25._updateProgress(Math.max(.1, loaded / total));
			},

			// success
			function (obj) {

				var timer = setTimeout(function () {

					// it's possible that Slim has been destroyed in the mean time.
					if (_this25._isBeingDestroyed) {
						return;
					}

					statusNode.innerHTML = _this25._options.statusUploadSuccess;
					statusNode.setAttribute('data-state', 'success');
					statusNode.style.opacity = 1;

					// hide status update after 2 seconds
					var timer = setTimeout(function () {
						statusNode.style.opacity = 0;
					}, 2000);

					_this25._timers.push(timer);
				}, 250);

				_this25._timers.push(timer);

				callback(null, obj);
			},

			// error
			function (status) {

				var html = '';
				if (status === 'file-too-big') {
					html = _this25._options.statusContentLength;
				} else {
					html = _this25._options.didReceiveServerError.apply(_this25, [status, _this25._options.statusUnknownResponse]);
				}

				// when an error occurs the status update is not automatically hidden
				var timer = setTimeout(function () {

					statusNode.innerHTML = html;
					statusNode.setAttribute('data-state', 'error');
					statusNode.style.opacity = 1;
				}, 250);

				_this25._timers.push(timer);

				callback(status);
			});
		}
	}, {
		key: '_showEditor',
		value: function _showEditor() {

			SlimPopover.show();

			this._imageEditor.show();
		}
	}, {
		key: '_hideEditor',
		value: function _hideEditor() {

			this._imageEditor.hide();

			var timer = setTimeout(function () {

				SlimPopover.hide();
			}, 250);

			this._timers.push(timer);
		}

		/**
   * Animations
   */

	}, {
		key: '_showPreview',
		value: function _showPreview(intro, callback) {

			snabbt(intro, {

				fromPosition: [0, 50, 0],
				position: [0, 0, 0],

				fromScale: [1.5, 1.5],
				scale: [1, 1],

				fromOpacity: 0,
				opacity: 1,

				easing: 'spring',
				springConstant: .3,
				springDeceleration: .7,

				complete: function complete() {

					resetTransforms(intro);

					if (callback) {
						callback();
					}
				}

			});
		}
	}, {
		key: '_hideResult',
		value: function _hideResult(callback) {

			var intro = this._getIntro();
			if (!intro) {
				return;
			}

			snabbt(intro, {

				fromScale: [1, 1],
				scale: [.5, .5],

				fromOpacity: 1,
				opacity: 0,

				easing: 'spring',
				springConstant: .3,
				springDeceleration: .75,

				complete: function complete() {
					resetTransforms(intro);
					if (callback) {
						callback();
					}
				}

			});
		}
	}, {
		key: '_showButtons',
		value: function _showButtons(callback) {

			if (!this._btnGroup) {
				return;
			}

			this._btnGroup.style.display = '';

			// setup animation
			var animation = {
				fromScale: [.5, .5],
				scale: [1, 1],
				fromPosition: [0, 10, 0],
				position: [0, 0, 0],
				fromOpacity: 0,
				opacity: 1,
				complete: function complete() {
					resetTransforms(this);
				},
				allDone: function allDone() {
					if (callback) {
						callback();
					}
				}
			};

			// don't animate when detached
			if (this.isDetached()) {
				animation.duration = 1;
			} else {
				animation.delay = function (i) {
					return 250 + i * 50;
				};
				animation.easing = 'spring';
				animation.springConstant = .3;
				animation.springDeceleration = .85;
			}

			snabbt(this._btnGroup.childNodes, animation);
		}
	}, {
		key: '_hideButtons',
		value: function _hideButtons(callback) {
			var _this26 = this;

			if (!this._btnGroup) {
				return;
			}

			var animation = {
				fromScale: [1, 1],
				scale: [.85, .85],
				fromOpacity: 1,
				opacity: 0,
				allDone: function allDone() {
					_this26._btnGroup.style.display = 'none';
					if (callback) {
						callback();
					}
				}
			};

			// don't animate when detached
			if (this.isDetached()) {
				animation.duration = 1;
			} else {
				animation.easing = 'spring';
				animation.springConstant = .3;
				animation.springDeceleration = .75;
			}

			// go hide the buttons
			snabbt(this._btnGroup.childNodes, animation);
		}
	}, {
		key: '_hideStatus',
		value: function _hideStatus() {

			var statusNode = this._element.querySelector('.slim-upload-status');
			statusNode.style.opacity = 0;
		}
	}, {
		key: '_doEdit',
		value: function _doEdit() {
			var _this27 = this;

			// if no input data available, can't edit anything
			if (!this._data.input.image) {
				return;
			}

			// now in editor mode
			this._addState('editor');

			// create editor (if not already created)
			if (!this._imageEditor) {
				this._appendEditor();
			}

			// hide or show rotate button
			this._imageEditor.showRotateButton = this._options.rotateButton;

			// append to popover
			SlimPopover.inner = this._imageEditor.element;

			// read the data
			this._imageEditor.open(

			// send copy of canvas to the editor
			cloneCanvas(this._data.input.image),

			// determine ratio
			this._options.ratio === 'free' ? null : this._ratio,

			// the initial crop to show
			this._data.actions.crop,

			// the initial rotation of the image
			this._data.actions.rotation,

			// handle editor load
			function () {

				_this27._showEditor();

				_this27._hideButtons();

				_this27._hideStatus();
			});
		}
	}, {
		key: '_doRemove',
		value: function _doRemove(done) {
			var _this28 = this;

			// cannot remove when is only one image
			if (this._isImageOnly()) {
				return;
			}

			this._clearState();
			this._addState('empty');

			this._hasInitialImage = false;
			if (this._imageHopper) {
				this._imageHopper.enabled = true;
			}

			if (this._isRequired) {
				this._input.required = true;
			}

			var out = this._getOutro();
			if (out) {
				out.style.opacity = '0';
			}

			// get public available clone of data
			var data = this.data;

			// now reset all data
			this._resetData();

			var timer = setTimeout(function () {

				if (_this28._isBeingDestroyed) {
					return;
				}

				_this28._hideButtons(function () {

					_this28._toggleButton('upload', true);
				});

				_this28._hideStatus();

				_this28._hideResult();

				_this28._options.didRemove.apply(_this28, [data]);

				if (done) {
					done();
				}
			}, this.isDetached() ? 0 : 250);

			this._timers.push(timer);

			return data;
		}
	}, {
		key: '_doUpload',
		value: function _doUpload(callback) {
			var _this29 = this;

			// if no input data available, can't upload anything
			if (!this._data.input.image) {
				return;
			}

			this._addState('upload');
			this._startProgress();

			this._hideButtons(function () {

				// block upload button
				_this29._toggleButton('upload', false);

				_this29._save(function (err, data, res) {

					_this29._removeState('upload');
					_this29._stopProgress();

					if (callback) {
						callback.apply(_this29, [err, data, res]);
					}

					if (err) {
						_this29._toggleButton('upload', true);
					}

					_this29._showButtons();
				});
			});
		}
	}, {
		key: '_doDownload',
		value: function _doDownload() {

			var image = this._data.output.image;
			if (!image) {
				return;
			}

			downloadCanvas(this._data, this._options.jpegCompression, this._options.forceType);
		}
	}, {
		key: '_doDestroy',
		value: function _doDestroy() {
			var _this30 = this;

			// set destroy flag to halt any running functionality
			this._isBeingDestroyed = true;

			// clear timers
			this._timers.forEach(function (timer) {
				clearTimeout(timer);
			});
			this._timers = [];

			// clean up snabbt animations
			snabbt(this._element, 'detach');

			// this removes the image hopper if it's attached
			if (this._imageHopper) {
				HopperEvents.forEach(function (e) {
					_this30._imageHopper.element.removeEventListener(e, _this30);
				});
				this._imageHopper.destroy();
				this._imageHopper = null;
			}

			// this block removes the image editor
			if (this._imageEditor) {
				ImageEditorEvents.forEach(function (e) {
					_this30._imageEditor.element.removeEventListener(e, _this30);
				});
				this._imageEditor.destroy();
				this._imageEditor = null;
			}

			// remove button event listeners
			nodeListToArray(this._btnGroup.children).forEach(function (btn) {
				btn.removeEventListener('click', _this30);
			});

			// stop listening to input
			this._input.removeEventListener('change', this);

			// detect if was wrapped, if so, remove wrapping (needs to have parent node)
			if (this._element !== this._originalElement && this._element.parentNode) {
				this._element.parentNode.replaceChild(this._originalElement, this._element);
			}

			// restore HTML of original element
			this._originalElement.innerHTML = this._originalElementInner;

			// get current attributes and remove all, then add original attributes
			function matchesAttributeInList(a, attributes) {
				return attributes.filter(function (attr) {
					return a.name === attr.name && a.value === attr.value;
				}).length !== 0;
			}

			var attributes = getElementAttributes(this._originalElement);
			attributes.forEach(function (attribute) {

				// if attribute  is contained in original element attribute list and is the same, don't remove
				if (matchesAttributeInList(attribute, _this30._originalElementAttributes)) {
					return;
				}

				// else remove
				_this30._originalElement.removeAttribute(attribute.name);
			});

			this._originalElementAttributes.forEach(function (attribute) {

				// attribute was never removed
				if (matchesAttributeInList(attribute, attributes)) {
					return;
				}

				// add attribute
				_this30._originalElement.setAttribute(attribute.name, attribute.value);
			});

			// now destroyed this counter so the total Slim count can be lowered
			SlimCount = Math.max(0, SlimCount - 1);

			// if slim count has reached 0 it's time to clean up the popover
			if (SlimPopover && SlimCount === 0) {
				SlimPopover.destroy();
				SlimPopover = null;
			}

			this._originalElement = null;
			this._element = null;
			this._input = null;
			this._output = null;
			this._btnGroup = null;
			this._options = null;
		}
	}, {
		key: 'dataBase64',


		/**
   * Public API
   */
		// properties
		get: function get() {
			return flattenData(this._data, this._options.post, this._options.jpegCompression, this._options.forceType, this._options.service !== null);
		}
	}, {
		key: 'data',
		get: function get() {
			return cloneData(this._data);
		}
	}, {
		key: 'element',
		get: function get() {
			return this._element;
		}
	}, {
		key: 'service',
		set: function set(service) {
			this._options.service = service;
		}
	}, {
		key: 'size',
		set: function set(dimensions) {
			this.setSize(dimensions, null);
		}
	}, {
		key: 'rotation',
		set: function set(rotation) {
			this.setRotation(rotation, null);
		}
	}, {
		key: 'ratio',
		set: function set(ratio) {
			this.setRatio(ratio, null);
		}
	}], [{
		key: 'options',
		value: function options() {

			var defaults = {

				// edit button is enabled by default
				edit: true,

				// immidiately summons editor on load
				instantEdit: false,

				// set to true to upload data as base64 string
				uploadBase64: false,

				// metadata values
				meta: {},

				// ratio of crop by default is the same as input image ratio
				ratio: 'free',

				// dimensions to resize the resulting image to
				size: null,

				// set initial rotation
				rotation: null,

				// initial crop settings for example: {x:0, y:0, width:100, height:100}
				crop: null,

				// post these values
				post: ['output', 'actions'],

				// call this service to submit cropped data
				service: null,

				// sharpen filter value, really low values might improve image output
				filterSharpen: 0,

				// when service is set, and this is set to true, Soon will auto upload all crops (also auto crops)
				push: false,

				// default fallback name for field
				defaultInputName: 'slim[]',

				// minimum size of cropped area object with width and height property
				minSize: {
					width: 100,
					height: 100
				},

				// maximum file size in MB to upload
				maxFileSize: null,

				// compression of JPEG (between 0 and 100)
				jpegCompression: null,

				// render download link
				download: false,

				// save initially loaded image
				saveInitialImage: false,

				// the type to force (jpe|jpg|jpeg or png)
				forceType: false,

				// the forced output size of the image
				forceSize: null,

				// disable drop to replace
				dropReplace: true,

				// remote URL service
				fetcher: null,

				// set the internal canvas size
				internalCanvasSize: {
					width: 4096,
					height: 4096
				},

				// enable or disable rotation
				rotateButton: true,

				// label HTML to show inside drop area
				label: '<p>Drop your image here</p>',
				labelLoading: '<p>Loading image...</p>',

				// error messages
				statusFileType: '<p>Invalid file type, expects: $0.</p>',
				statusFileSize: '<p>File is too big, maximum file size: $0 MB.</p>',
				statusNoSupport: '<p>Your browser does not support image cropping.</p>',
				statusImageTooSmall: '<p>Image is too small, minimum size is: $0 pixels.</p>',
				statusContentLength: '<span class="slim-upload-status-icon"></span> The file is probably too big',
				statusUnknownResponse: '<span class="slim-upload-status-icon"></span> An unknown error occurred',
				statusUploadSuccess: '<span class="slim-upload-status-icon"></span> Saved',

				// callback methods
				didInit: function didInit(data) {},
				didLoad: function didLoad(file, image, meta) {
					return true;
				},
				didSave: function didSave(data) {},
				didUpload: function didUpload(err, data, res) {},
				didReceiveServerError: function didReceiveServerError(err, defaultError) {
					return defaultError;
				},
				didRemove: function didRemove(data) {},
				didTransform: function didTransform(data) {},
				didConfirm: function didConfirm(data) {},
				didCancel: function didCancel() {},

				willTransform: function willTransform(data, cb) {
					cb(data);
				},
				willSave: function willSave(data, cb) {
					cb(data);
				},
				willRemove: function willRemove(data, cb) {
					cb();
				},
				willRequest: function willRequest(xhr) {}

			};

			// add default button labels
			SlimButtons.concat(ImageEditor.Buttons).concat('rotate').forEach(function (btn) {
				var capitalized = capitalizeFirstLetter(btn);
				defaults['button' + capitalized + 'ClassName'] = null;
				defaults['button' + capitalized + 'Label'] = capitalized;
				defaults['button' + capitalized + 'Title'] = capitalized;
			});

			return defaults;
		}
	}]);

	return Slim;
}();

/**
 * Slim Static Methods
 */


(function () {

	var instances = [];

	var indexOfElement = function indexOfElement(element) {
		var i = 0;
		var l = instances.length;
		for (; i < l; i++) {
			if (instances[i].isAttachedTo(element)) {
				return i;
			}
		}
		return -1;
	};

	function toLabel(v) {
		// if value set, use as label
		if (v) {
			return '<p>' + v + '</p>';
		}

		// else use default text
		return null;
	}

	function toFunctionReference(name) {
		var ref = window;
		var levels = name.split('.');
		levels.forEach(function (level, index) {
			if (!ref[levels[index]]) {
				return;
			}
			ref = ref[levels[index]];
		});
		return ref !== window ? ref : null;
	}

	var passThrough = function passThrough(v) {
		return v;
	};
	var defaultFalse = function defaultFalse(v) {
		return v === 'true';
	};
	var defaultTrue = function defaultTrue(v) {
		return v ? v === 'true' : true;
	};
	var defaultLabel = function defaultLabel(v) {
		return toLabel(v);
	};
	var defaultFunction = function defaultFunction(v) {
		return v ? toFunctionReference(v) : null;
	};
	var defaultSize = function defaultSize(v) {
		if (!v) {
			return null;
		}
		var parts = intSplit(v, ',');
		return {
			width: parts[0],
			height: parts[1]
		};
	};

	var toFloat = function toFloat(v) {
		if (!v) {
			return null;
		}
		return parseFloat(v);
	};

	var toInt = function toInt(v) {
		if (!v) {
			return null;
		}
		return parseInt(v, 10);
	};

	var toRect = function toRect(v) {
		if (!v) {
			return null;
		}
		var obj = {};
		v.split(',').map(function (p) {
			return parseInt(p, 10);
		}).forEach(function (v, i) {
			obj[Rect[i]] = v;
		});
		return obj;
	};

	var defaults = {

		// is user allowed to download the cropped image?
		'download': defaultFalse,

		// is user allowed to edit the cropped image?
		'edit': defaultTrue,

		// open editor immidiately on file drop
		'instantEdit': defaultFalse,

		// minimum crop size in pixels of original image
		'minSize': defaultSize,

		// the final bounding box of the output image
		'size': defaultSize,

		// the forced output size of the image
		'forceSize': defaultSize,

		// the internal data canvas size
		'internalCanvasSize': defaultSize,

		// url to post to
		'service': function service(v) {
			return typeof v === 'undefined' ? null : v;
		},

		// url to fetch service
		'fetcher': function fetcher(v) {
			return typeof v === 'undefined' ? null : v;
		},

		// set auto push mode
		'push': defaultFalse,

		// initial rotation
		'rotation': function rotation(v) {
			return typeof v === 'undefined' ? null : parseInt(v, 10);
		},

		// set crop rect
		'crop': toRect,

		// what to post
		'post': function post(v) {
			if (!v) {
				return null;
			}
			return v.split(',').map(function (item) {
				return item.trim();
			});
		},

		// default input name
		'defaultInputName': passThrough,

		// the ratio of the crop
		'ratio': function ratio(v) {
			if (!v) {
				return null;
			}
			return v;
		},

		// maximum file size
		'maxFileSize': toFloat,

		// sharpen filter
		'filterSharpen': toInt,

		// jpeg compression
		'jpegCompression': toInt,

		// base64 data uploading
		'uploadBase64': defaultFalse,

		// sets file type to force output to
		'forceType': passThrough,

		// drop to replace
		'dropReplace': defaultTrue,

		// bool determining if initial image should be saved
		'saveInitialImage': defaultFalse,

		// rotate button
		'rotateButton': defaultTrue,

		// default labels
		'label': defaultLabel,
		'labelLoading': defaultLabel

	};

	// labels
	['FileSize', 'FileType', 'NoSupport', 'ImageTooSmall'].forEach(function (status) {
		defaults['status' + status] = defaultLabel;
	});

	// status
	['ContentLength', 'UnknownResponse', 'UploadSuccess'].forEach(function (status) {
		defaults['status' + status] = passThrough;
	});

	// the did callbacks
	['Init', 'Load', 'Save', 'Upload', 'Remove', 'Transform', 'ReceiveServerError', 'Confirm', 'Cancel'].forEach(function (cb) {
		defaults['did' + cb] = defaultFunction;
	});

	// the will callbacks
	['Transform', 'Save', 'Remove', 'Request'].forEach(function (cb) {
		defaults['will' + cb] = defaultFunction;
	});

	// button defaults
	var buttonOptions = ['ClassName', 'Label', 'Title'];
	SlimButtons.concat(ImageEditor.Buttons).concat('rotate').forEach(function (btn) {
		var capitalized = capitalizeFirstLetter(btn);
		buttonOptions.forEach(function (opt) {
			defaults['button' + capitalized + opt] = passThrough;
		});
	});

	Slim.supported = function () {

		return !(

		// is opera mini
		Object.prototype.toString.call(window.operamini) === '[object OperaMini]' ||

		// no event listener support
		typeof window.addEventListener === 'undefined' ||

		// no file reader support
		typeof window.FileReader === 'undefined' ||

		// no .createObjectURL support, used by download method but also convenient to exclude Android 4.3 and lower
		// Android 4.3 and lower don't support XHR2 responseType blob
		typeof window.URL === 'undefined' || typeof window.URL.createObjectURL === 'undefined');
	}();

	Slim.parse = function (context) {
		var elements;
		var element;
		var i;
		var croppers = [];

		// find all crop elements and bind Crop behavior
		elements = context.querySelectorAll('.slim:not([data-state])');
		i = elements.length;

		while (i--) {
			element = elements[i];
			croppers.push(Slim.create(element, Slim.getOptionsFromAttributes(element)));
		}

		return croppers;
	};

	Slim.getOptionsFromAttributes = function (element) {

		var dataset = getDataset(element);

		var options = {
			meta: {}
		};

		for (var prop in dataset) {

			var valueTransformer = defaults[prop];
			var _value = dataset[prop];

			if (valueTransformer) {
				_value = valueTransformer(_value);
				_value = _value === null ? clone(Slim.options()[prop]) : _value;
				options[prop] = _value;
			} else if (prop.indexOf('meta') === 0) {
				options['meta'][lowercaseFirstLetter(prop.substr(4))] = _value;
			}
		}

		return options;
	};

	Slim.find = function (element) {
		var result = instances.filter(function (instance) {
			return instance.isAttachedTo(element);
		});
		return result ? result[0] : null;
	};

	Slim.create = function (element, options) {

		// if already in array, can't create another slim
		if (Slim.find(element)) {
			return;
		}

		// if no options supplied, try to get the options from the element
		if (!options) {
			options = Slim.getOptionsFromAttributes(element);
		}

		// instance
		var slim = new Slim(element, options);

		// add new slim
		instances.push(slim);

		// return the slim instance
		return slim;
	};

	Slim.destroy = function (element) {
		var index = indexOfElement(element);

		if (index < 0) {
			return false;
		}

		instances[index].destroy();
		instances.splice(index, 1);

		return true;
	};
})();
    return Slim;
}());

	// helpers
	function argsToArray(args) {
		return Array.prototype.slice.call(args);
	}

	function isConstructor(parameters) {
		return typeof parameters[0] === 'object' || parameters.length === 0;
	}

	function isGetter(slim, method, parameters) {
		var descriptor = Object.getOwnPropertyDescriptor(Slim.prototype, method);
		return descriptor ? typeof descriptor.get !== 'undefined' : false;
	}

	function isSetter(slim, method, parameters) {
		var descriptor = Object.getOwnPropertyDescriptor(Slim.prototype, method);
		return descriptor ? typeof descriptor.set !== 'undefined' : false;
	}

	function isMethod(slim, method) {
		return typeof slim[method] === 'function';
	}

	// plugin
	$.fn['slim'] = function() {

		// get arguments as array
		var parameters = argsToArray(arguments);

		// is method
		if (isConstructor(parameters)) {
			return this.each(function(){
				Slim.create(this, parameters[0]);
			});
		}
		else {
			var method = parameters.shift();
			switch (method) {
				case 'supported':
					return Slim.supported;
				case 'destroy':
					return this.each(function(){
						Slim.destroy(this);
					});
				case 'parse':
					return this.each(function(){
						Slim.parse(this);
					});
				default:
					var results = [];
					this.each(function(){

						var slim = Slim.find(this);
						if (!slim) {
							return;
						}

						if (isMethod(slim, method)) {
							results.push(slim[method].apply(slim, parameters));
						}

						else if (isGetter(slim, method)) {
							results.push(slim[method]);
						}

						else if (isSetter(slim, method)) {
							results.push(slim[method] = parameters[0]);
						}

					});
					return results;
			}
		}

	};

}(window.jQuery));