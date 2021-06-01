const getVaccineList = (x, y) => {
  return fetch("https://api.place.naver.com/graphql", {
    headers: {
      accept: "*/*",
      "accept-language": "ko",
      "content-type": "application/json",
      "sec-ch-ua":
        '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
      "sec-ch-ua-mobile": "?0",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
    },
    referrer: `https://m.place.naver.com/rest/vaccine?vaccineFilter=used&x=${x}&y=${y}&bounds=${getBounds(
      x,
      y
    ).join("%3B")}`,
    referrerPolicy: "unsafe-url",
    body: `[{\"operationName\":\"vaccineList\",\"variables\":{\"input\":{\"keyword\":\"코로나백신위탁의료기관\",\"x\":\"${x}\",\"y\":\"${y}\"},\"businessesInput\":{\"start\":0,\"display\":200,\"deviceType\":\"mobile\",\"x\":"${x}\"\,\"y\":"${y}\"\,\"bounds\":\"${getBounds(
      x,
      y
    ).join(
      ";"
    )}\",\"sortingOrder\":\"distance\"},\"isNmap\":false,\"isBounds\":false},\"query\":\"query vaccineList($input: RestsInput, $businessesInput: RestsBusinessesInput, $isNmap: Boolean!, $isBounds: Boolean!) {\\n  rests(input: $input) {\\n    businesses(input: $businessesInput) {\\n      total\\n      vaccineLastSave\\n      isUpdateDelayed\\n      items {\\n        id\\n        name\\n        dbType\\n        phone\\n         x\\n        y\\n        imageMarker @include(if: $isNmap) {\\n          marker\\n          markerSelected\\n          __typename\\n        }\\n        markerLabel @include(if: $isNmap) {\\n          text\\n          style\\n          __typename\\n        }\\n        vaccineQuantity {\\n          quantity\\n          quantityStatus\\n          vaccineType\\n          vaccineOrganizationCode\\n          __typename\\n        }\\n        __typename\\n      }\\n      optionsForMap @include(if: $isBounds) {\\n        maxZoom\\n        minZoom\\n        includeMyLocation\\n        maxIncludePoiCount\\n        center\\n        __typename\\n      }\\n      __typename\\n    }\\n    queryResult {\\n      keyword\\n      vaccineFilter\\n      categories\\n      region\\n      isBrandList\\n      filterBooking\\n      hasNearQuery\\n      isPublicMask\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}]`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
};

// x,y는 가운데 점
const boundsDiff = [0.036, 0.0138];
const getBounds = (x, y) => {
  return [
    Number(x) - boundsDiff[0],
    Number(y) - boundsDiff[1],
    Number(x) + boundsDiff[0],
    Number(y) + boundsDiff[1],
  ];
};
