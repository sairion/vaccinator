# Vaccinator (Naver Place based implementation)

## WARNING

- This repo is opened only for studying web automation workflow, not for actual Korean vaccine reservation. Use this repo for whatever use-case you want, but the owner of this will not have any kind of responsibility for your use. (I'm telling this because there are serveral movements from the corporates, and Korean government want to prevent this kind of script and now I oppose using it either)
- I stopped developing this after I get vaccinated (I never used this to make reservation) - some of the functionality is not working perfectly, especially when clicking the markers on the map. It is inherently hard, because there are several cases where CSS selectors won't work (I never had enough time to inspect those), but I successfuly make into the step right before the actual reservation.

## How-to

- Create `.env.local` and Add `NAVER_ID` and `NAVER_PW`.

```console
NAVER_ID=asdf1234
NAVER_PW=asdf1234
```

- Install and run.

```console
  yarn
  yarn start
```

## Browser script

- You can alternatively just run `browserifiedScript.js` in the browser console.
- Log in to Naver first, and use the session.
- popup blocking need to be disabled by clicking the lock icon adjacent to URL, 'site settings'
  - or, go to `chrome://settings/content/siteDetails?site=https%3A%2F%2Fm.place.naver.com`
