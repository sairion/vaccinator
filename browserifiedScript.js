const main = () => {
  // prevent duplicate open
  window.opened = window.opened || [];

  function isOpened(checkingUrl) {
    return window.opened.find((url) => url === checkingUrl) != null;
  }

  function markOpened(url) {
    window.opened.push(url);
  }

  const getNaverURL = (x, y) => {
    return `https://m.place.naver.com/rest/vaccine?x=${x}&y=${y}&bounds=${getBounds(
      x,
      y
    ).join("%3B")}`;
  };

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

  const coordinates = [
    [127.1131603, 37.3929554, "판교"],
    [127.1236317, 37.3681637, "분당"],
    [127.1523749, 37.5512668, "강동"],
    [127.0911347, 37.613674, "중랑"],
    [126.9611738, 37.3922211, "평촌"],
    [127.1104954, 37.4801316, "수서"],
    [127.1468972, 37.4387581, "성남"],
    [127.0092915, 37.5394901, "성동용산"],
    [126.9513558, 37.4800007, "관악"],
    [127.0097418, 37.4350755, "과천"],
    [127.0439977, 37.5029572, "선릉"],
    [127.0013399, 37.4987354, "반포"],
    [127.0909471, 37.5054425, "잠실"],
    [127.1192893, 37.51585, "방이"],
    [127.1116286, 37.318947, "죽전"],
  ];

  coordinates
    .map(async (arg) => {
      const [x, y, label] = arg;
      try {
        const res = await getVaccineList(x, y).then((res) => res.json());
        const businesses = res[0].data.rests.businesses.items;
        const filteredBussinesses = businesses
          .filter((b) => {
            return (
              b.vaccineQuantity != null &&
              b.vaccineQuantity.quantityStatus !== "empty"
            );
          })
          .sort(
            (a, b) =>
              Number(b.vaccineQuantity?.quantity ?? 0) -
              Number(a.vaccineQuantity.quantity ?? 0)
          );
        const businessHasVaccine = filteredBussinesses[0];
        return businessHasVaccine
          ? arg.concat(businessHasVaccine)
          : ["not found", "", label];
      } catch (e) {
        return ["error", e, label];
      }
    })
    .map(async (resultPromise) => {
      const result = await resultPromise;
      if (result[0] === "error" || result[0] === "not found") {
        console.log(result);
        return;
      }

      const [x, y, label, business] = result;
      const url = `${getNaverURL(x, y)}`;

      console.log(`Found one in ${url}, redirecting...`);

      try {
        if (isOpened(url)) {
          return;
        }

        const wind = window.open(url, Math.random());
        markOpened(url);

        const script = document.createElement("script");
        script.innerHTML = `
          (() => {
            const onLoad = {
              console.log('a')
              // document.querySelector("._ui_control_target")?.click();

              // click check button on the bottom-left
              let isAvailable; 
              const checkButton = document.querySelector(
                '#_list_scroll_container a[role="button"] svg path[d^="M1 16H0V0h12v1H1v14h14V6h1v10H1zm6"]'
              ).parentElement.parentElement;
              if (checkButton) {
                checkButton.click();
                isAvailable = true;
              }

              if (!isAvailable) {
                return;
              }

              const submitButton = Array.from(
                document.querySelectorAll(
                  'div[role="main"] div[data-nclicks-area-code] a[role="button"]'
                )
              ).find((e) => e.textContent === "접종 예약신청");

              if (submitButton) {
                submitButton.click();
              }
            };

            const timeoutOnload = () => {
              setTimeout(onLoad, 0)
              setTimeout(onLoad, 250)
              setTimeout(onLoad, 500)
              setTimeout(onLoad, 750)
            };

            if (document.readyState !== "loading") {
              timeoutOnload();
            } else {
              document.addEventListener("DOMContentLoaded", timeoutOnload);
            }
          })();
      `;

        wind.document.head.appendChild(script);
      } catch (e) {
        console.warn(e);
      }
      console.log(label, url);
    });
};

const INTERVAL_MS = 4000;
setInterval(() => {
  main();
}, INTERVAL_MS);
