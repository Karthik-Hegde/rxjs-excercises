const {
  fromEvent,
  pipe,
  startWith,
  map,
  flatMap,
  combineLatestWith,
  mergeWith,
  switchMap,
  tap,
} = rxjs;
const { fromFetch } = rxjs.fetch;

const refreshButton = document.querySelector(".refresh");
const closeButton1 = document.querySelector(".close1");
const closeButton2 = document.querySelector(".close2");
const closeButton3 = document.querySelector(".close3");

const refreshClickStream = fromEvent(refreshButton, "click");
const close1ClickStream = fromEvent(closeButton1, "click");
const close2ClickStream = fromEvent(closeButton2, "click");
const close3ClickStream = fromEvent(closeButton3, "click");

const requestStream = refreshClickStream.pipe(
  startWith("startup click"),
  map(() => {
    const randomOffset = Math.floor(Math.random() * 500);
    return "https://api.github.com/users?since=" + randomOffset;
  })
);

const responseStream = requestStream.pipe(
  flatMap((requestUrl) =>
    fromFetch(requestUrl).pipe(switchMap((res) => res.json()))
  )
);

function createSuggestionStream(closeClickStream) {
  return closeClickStream.pipe(
    startWith("startup click"),
    combineLatestWith(responseStream),
    map(
      ([click, listUsers]) =>
        listUsers[Math.floor(Math.random() * listUsers.length)]
    ),
    mergeWith(refreshClickStream.pipe(map(() => null))),
    startWith(null)
  );
}

const suggestion1Stream = createSuggestionStream(close1ClickStream);
const suggestion2Stream = createSuggestionStream(close2ClickStream);
const suggestion3Stream = createSuggestionStream(close3ClickStream);

function renderSuggestion(suggestedUser, selector) {
  const suggestionEl = document.querySelector(selector);
  if (suggestedUser === null || suggestedUser === undefined) {
    suggestionEl.style.visibility = "hidden";
  } else {
    suggestionEl.style.visibility = "visible";
    const usernameEl = suggestionEl.querySelector(".username");
    usernameEl.href = suggestedUser.html_url;
    usernameEl.textContent = suggestedUser.login;

    const imgEl = suggestionEl.querySelector("img");
    imgEl.src = "";
    imgEl.src = suggestedUser.avatar_url;
  }
}

suggestion1Stream.subscribe((suggestedUser) =>
  renderSuggestion(suggestedUser, ".suggestion1")
);
suggestion2Stream.subscribe((suggestedUser) =>
  renderSuggestion(suggestedUser, ".suggestion2")
);
suggestion3Stream.subscribe((suggestedUser) =>
  renderSuggestion(suggestedUser, ".suggestion3")
);
