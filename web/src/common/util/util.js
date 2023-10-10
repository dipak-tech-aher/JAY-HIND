
import { properties } from "../../properties";
import { get } from "./restUtil";
import { isEmpty } from 'lodash'

export function getProp(object, keys, defaultVal) {
    keys = Array.isArray(keys) ? keys : keys.split('.')
    object = object[keys[0]]
    if (object && keys.length > 1) {
        return getProp(object, keys.slice(1), defaultVal)
    }
    return object ? object : defaultVal
}

export function customSort(collection = [], columnName, sortingOrder) {
    let sort1 = -1, sort2 = 1;
    const isAscendingSort = sortingOrder[columnName]
    if (isAscendingSort === false) {
        sort1 = 1;
        sort2 = -1;
    }
    return collection.sort(function (val1, val2) {
        let value1 = getProp(val1, columnName, '');
        let value2 = getProp(val2, columnName, '');
        // check for date data type
        if (typeof value1 !== "number") {
            value1 = value1 ? value1.toLowerCase() : value1
            value2 = value2 ? value2.toLowerCase() : value2
            if (value1 === value2) {
                return 0;
            }
        } else {
            if (value1 === value2) {
                return 0;
            }
        }
        return value1 < value2 ? sort1 : sort2;
    })
}

export const deepClone = (data) => {
    return JSON.parse(JSON.stringify(data))
}
export const constructSortingData = function (sortingOrder, column, defaultValue) {
    const response = deepClone(sortingOrder)
    for (const key in response) {
        if (response.hasOwnProperty(key)) {
            if (key === column) {
                if (response[column] === true || response[column] === false) {
                    response[column] = defaultValue || !response[column]
                } else {
                    response[column] = true
                }
            } else {
                response[key] = ""
            }
        }
    }
    return response
}

export const genderOptions = [
    {
        label: 'Male',
        value: 'M'
    }, {
        label: 'Female',
        value: 'M'
    }, {
        label: 'Other',
        value: 'other'
    }, {
        label: 'Unknown',
        value: 'unknown'
    },
]

export const getDisplayOptionForGender = (value) => {
    const displayOption = genderOptions.find((gender) => {
        return gender.value === value
    })
    return displayOption ? displayOption.label : ""
}

export const formFilterObject = (filters) => {
    return filters.map((filter) => {
        const { id, value } = filter;
        return {
            id,
            value: value[0],
            filter: value[1]
        }
    })
}

export const filterLookupBasedOnType = (lookup, mappingValue, mappingKey) => {
    return lookup.filter((data) => {
        let isTrue = false;
        if (data.mapping && data.mapping.hasOwnProperty(mappingKey) && data.mapping[mappingKey].includes(mappingValue)) {
            return isTrue = true;
        }
        return isTrue;
    })
}

export const getServiceCategoryMappingBasedOnProdType = (prodTypeLookupdate, serviceType) => {
    return prodTypeLookupdate.find((type) => type?.code === serviceType)?.mapping;
}

export const validateToDate = (fromDate, toDate) => {
    try {
        if (Date.parse(fromDate) < Date.parse(toDate))
            return false;
        return true
    } catch (e) {
        return false
    }
}

export const USNumberFormat = (price) => {
    if (price === null || price === "" || price === undefined) {
        return '$0.00';
    }
    let dollar = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
    })
    return dollar.format(Number(price));
}

export const validateNumber = (object) => {
    const pattern = new RegExp("^[0-9]");
    let key = String.fromCharCode(!object.charCode ? object.which : object.charCode);
    let temp = pattern.test(key)
    if (temp === false) {
        object.preventDefault();
        return false;
    }
}

export const validateEmail = (object) => {
    const pattern = new RegExp("^[a-zA-Z0-9@._-]{1,100}$");
    let key = String.fromCharCode(!object.charCode ? object.which : object.charCode);
    let temp = pattern.test(key)
    if (temp === false) {
        object.preventDefault();
        return false;
    }
}

export const RegularModalCustomStyles = {
    content: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxHeight: '90%',
        // height: 'auto'  /**Srini commented this as the height of pop up should not be changed. Please discuss before touching */
    }
}

export const handleOnDownload = (entityId, entityType, id) => {

    get(`${properties.ATTACHMENT_API}/${id}?entity-id=${entityId}&entity-type=${entityType}`)
        .then((resp) => {
            if (resp.data) {
                var a = document.createElement("a");
                a.href = resp.data.content;
                a.download = resp.data.fileName;
                a.click();
            }
        })
        .catch((error) => {
            console.error("error", error)
        })
        .finally(() => {

        })
}

export const getReleventHelpdeskDetailedData = (source, data) => {
    if (['LIVECHAT', 'WHATSAPP'].includes(source)) {
        let chatData = data?.chat[0]
        console.log('data?.chat[0]------>',data?.chat[0])
        if (chatData) {
            chatData.message = chatData?.message || []
            chatData.messageColorAlign = chatData?.messageColorAlign || []

            return { ...data, ...data?.chat[0] }
        } else {
            return data
        }

    }
    else {
        return data
    }
}

export const removeDuplicates = (arr) => {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}
export const removeDuplicatesFromArrayObject = (arr, uniqueElement) => {
    let newArray = []
    let uniqueObject = {};
    for (const i in arr) {
        // Extract the statement
        const item = arr[i][uniqueElement];
        // Use the statement as the index    
        if (item) {
            uniqueObject[item] = arr[i];
        }

    }

    // Loop to push unique object into array
    for (const i in uniqueObject) {
        newArray.push(uniqueObject[i]);
    }

    return newArray
}

export const removeEmptyKey = (payload) => {
    let response = {}
    if (!isEmpty(payload)) {
        response = Object.entries(payload).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {})
    }
    return response
}

export const makeFirstLetterLowerOrUppercase = (inputString, type) => {
    if (type === "lowerCase") {
        return inputString.charAt(0).toLowerCase() + inputString.slice(1);
    } else if (type === "upperCase") {
        return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    }
};

export const numberFormatter = (num, digits) => {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function (item) {
        return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

export const groupBy = (items, key) => items.reduce(
    (result, item) => ({
        ...result,
        [item[key]]: [
            ...(result[item[key]] || []),
            item,
        ],
    }),
    {},
);

export const pageStyle = `
    @print {
        @page :footer {
            display: none
        }

        @page :header {
            display: none
        }
    }
    @media all {
        .page-break {
        display: none;
        }
    }      
    @media print {
        .page-break {
        margin-top: 1rem;
        display: block;
        page-break-before: auto;
        }
    }

    @page {
        size: auto;
        margin: 12mm;
    }

`;