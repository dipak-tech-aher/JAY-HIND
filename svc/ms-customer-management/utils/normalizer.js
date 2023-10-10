"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Normalizer = void 0;
function isArray(input) {
    return (Object.prototype.toString.call(input) === '[object Array]') ? true : false;
}
var Normalizer = /** @class */ (function () {
    function Normalizer(data) {
        if (data === void 0) { data = []; }
        this.dataset = [];
        this.datasetMeta = null; // training meta data (ranges, min, max, etc)
        this.binaryInput = [];
        this.binaryOutput = [];
        this.outputProperties = [];
        this.dataset = data;
        // prevent empty data input
        if (true !== Array.isArray(data)) {
            throw new Error('\x1b[37m\x1b[44mNormalizer input data should be an array of rows: [{...}, {...}]\x1b[0m');
        }
        // prevent empty data input
        if (this.dataset.length <= 0) {
            throw new Error("\u001B[37m\u001B[44mNormalizer input data shouldn't be empty\u001B[0m");
        }
        // prevent data rows to contain no properties
        if (Object.keys(this.dataset[0]).length <= 0) {
            throw new Error("\u001B[37m\u001B[44mNormalizer input data rows has to contain some properties (only 1st row is checked)\u001B[0m");
        }
    }
    Normalizer.prototype.getOutputLength = function () {
        return this.outputProperties.length;
    };
    Normalizer.prototype.getOutputProperties = function () {
        return this.outputProperties;
    };
    Normalizer.prototype.getInputLength = function () {
        return this.binaryInput[0].length;
    };
    Normalizer.prototype.getBinaryInputDataset = function () {
        return this.binaryInput;
    };
    Normalizer.prototype.getBinaryOutputDataset = function () {
        return this.binaryOutput;
    };
    Normalizer.prototype.getDatasetMetaData = function () {
        return this.datasetMeta;
    };
    Normalizer.prototype.setDatasetMetaData = function (metadata) {
        this.datasetMeta = metadata;
        return this;
    };
    Normalizer.prototype.convertOutput = function () {
        var metadata = this.datasetMeta;
    };
    Normalizer.prototype.normalize = function () {
        this.datasetMeta = (this.datasetMeta === null) ? this.analyzeMetaData() : this.datasetMeta;
        // now loop through data and convert any data to bits
        // depending on data type and known settings of metadata
        var binaryInput = [];
        var binaryOutput = [];
        for (var i in this.dataset) {
            var row = this.dataset[i];
            var index = 0;
            var inputBits = [];
            var outputBits = [];
            for (var prop in row) {
                // skip output properties, they are not in the input dataset
                // start turning all data into bits!
                var bitsArr = void 0;
                var value = row[prop];
                var meta = this.datasetMeta[prop];
                switch (meta.type) {
                    case 'number':
                        bitsArr = [this.numToBit(meta.min, meta.max, value)]; // scalar to array of 1 length
                        break;
                    case 'boolean':
                        bitsArr = [this.boolToBit(value)]; // scalar to array of 1 length
                        break;
                    case 'string':
                        bitsArr = this.strToBitsArr(meta.distinctValues, value);
                        break;
                    case 'array':
                        bitsArr = this.arrToBitsArr(meta.distinctValues, value);
                        break;
                    default:
                        break;
                }
                if (this.outputProperties.indexOf(prop) > -1) {
                    outputBits = outputBits.concat(bitsArr);
                }
                else {
                    inputBits = inputBits.concat(bitsArr);
                }
                index++;
            }
            if (inputBits.length > 0) {
                this.binaryInput.push(inputBits);
            }
            if (outputBits.length > 0) {
                this.binaryOutput.push(outputBits);
            }
        }
    };
    Normalizer.prototype.analyzeMetaData = function () {
        // at this point we know that data is not an empty array and
        // that the first row contains at least one property (the others should as well)
        // depending on each data row property, find the values data type using only the first row
        var firstRow = this.dataset[0];
        var distinctProps = this.distinctProps(firstRow);
        var distinctTypes = this.distinctTypes(firstRow);
        var metadata = {};
        var bitDataset = [];
        for (var _i = 0, distinctProps_1 = distinctProps; _i < distinctProps_1.length; _i++) {
            var prop = distinctProps_1[_i];
            var type = distinctTypes[prop];
            metadata[prop] = {
                type: type,
                min: null,
                max: null,
                distinctValues: null,
            };
            switch (type) {
                case 'number':
                    // data will be normalize with a number between 0 and 1
                    var minMax = this.getMinMax(prop, this.dataset);
                    metadata[prop].min = minMax[0];
                    metadata[prop].max = minMax[1];
                    break;
                case 'boolean':
                    // data is a simple 0 or 1 bit
                    metadata[prop].min = 0;
                    metadata[prop].max = 1;
                    break;
                case 'string':
                    // data will be normalize in an array of bits which length is equivalent
                    // to the total number of distinct string values of the whole dataset
                    var distinctStrVals = this.getDistinctVals(prop, this.dataset);
                    metadata[prop].distinctValues = distinctStrVals;
                    break;
                case 'array':
                    var arrMinMax = this.get2DimArrayMinMax(prop, this.dataset);
                    var distinctArrVals = this.getDistinctArrayVals(prop, this.dataset);
                    metadata[prop].min = arrMinMax[0];
                    metadata[prop].max = arrMinMax[1];
                    metadata[prop].distinctValues = distinctArrVals;
                    break;
            }
        }
        return metadata;
    };
    Normalizer.prototype.setOutputProperties = function (props) {
        this.outputProperties = props;
        return this;
    };
    Normalizer.prototype.getMinMax = function (prop, data) {
        var min = null;
        var max = null;
        for (var i in data) {
            var val = data[i][prop];
            if (min === null || val < min) {
                min = val;
            }
            if (max === null || val > max) {
                max = val;
            }
        }
        return [min, max];
    };
    Normalizer.prototype.getFlatArrMinMax = function (arr) {
        var min = null;
        var max = null;
        if (typeof arr[0] === 'string') {
            return [min, max];
        }
        for (var i in arr) {
            if (typeof arr[i] !== 'number') {
                continue;
            }
            var val = parseFloat(arr[i]);
            if (min === null || val < min) {
                min = val;
            }
            if (max === null || val > max) {
                max = val;
            }
        }
        return [min, max];
    };
    Normalizer.prototype.get2DimArrayMinMax = function (prop, data) {
        var min = null;
        var max = null;
        var mins = [];
        var maxs = [];
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var row = data_1[_i];
            var arr = row[prop]; // this is itself a 1 dim array
            var minMax = this.getFlatArrMinMax(arr);
            mins.push(minMax[0]);
            maxs.push(minMax[1]);
        }
        min = this.getFlatArrMinMax(mins)[0];
        max = this.getFlatArrMinMax(maxs)[1];
        return [min, max];
    };
    Normalizer.prototype.getDistinctVals = function (property, data) {
        var count = 0;
        var distinctValues = [];
        for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
            var row = data_2[_i];
            var val = row[property];
            if (distinctValues.indexOf(val) === -1) {
                distinctValues.push(val);
            }
        }
        return distinctValues;
    };
    Normalizer.prototype.getDistinctArrayVals = function (property, data) {
        var count = 0;
        var distinctValues = [];
        for (var _i = 0, data_3 = data; _i < data_3.length; _i++) {
            var row = data_3[_i];
            var arrVal = row[property];
            for (var _a = 0, arrVal_1 = arrVal; _a < arrVal_1.length; _a++) {
                var val = arrVal_1[_a];
                if (distinctValues.indexOf(val) === -1) {
                    distinctValues.push(val);
                }
            }
        }
        return distinctValues;
    };
    Normalizer.prototype.numToBit = function (min, max, value) {
        var num = (value - min) / (max - min);
        return Number((num).toFixed(6));
    };
    Normalizer.prototype.boolToBit = function (val) {
        return +val;
    };
    /**
     * Turns discint values into unique array of bits to represent them all.
     * For example if we have distinct data values of [ 500, 1050, 300, 950 ]
     * will will need a 4 length array of bits to represent them all.
     * The 1st value will be [0,0,0,1], the second [0,0,1,0]... and so on.
     * The methor
     */
    Normalizer.prototype.strToBitsArr = function (distinctValues, val) {
        var bitArr = new Array(distinctValues.length);
        bitArr.fill(0);
        for (var i in distinctValues) {
            if (val === distinctValues[i]) {
                bitArr[i] = 1;
            }
        }
        return bitArr;
    };
    Normalizer.prototype.arrToBitsArr = function (distinctValues, vals) {
        var bitArr = new Array(distinctValues.length);
        bitArr.fill(0);
        for (var j in vals) {
            var val = vals[j];
            var idx = distinctValues.indexOf(val);
            bitArr[idx] = 1;
        }
        return bitArr;
    };
    Normalizer.prototype.distinctProps = function (row) {
        return Object.keys(row);
    };
    Normalizer.prototype.distinctTypes = function (row) {
        var distinctTypes = {};
        for (var prop in row) {
            var value = row[prop];
            // also check for "real" array or object type
            if (typeof value === 'object' && isArray(value)) {
                distinctTypes[prop] = 'array';
            }
            else if (typeof value === 'object') {
                distinctTypes[prop] = 'object';
            }
            else {
                distinctTypes[prop] = typeof (value);
            }
        }
        return distinctTypes;
    };
    Normalizer.prototype.getRow1stValue = function (row) {
        return row[Object.keys(row)[0]];
    };
    return Normalizer;
}());
exports.Normalizer = Normalizer;
