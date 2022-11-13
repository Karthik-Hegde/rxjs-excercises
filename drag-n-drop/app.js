const { fromEvent, pipe, map, concatAll, tap, takeUntil } = rxjs;

const parentEl = document.querySelector("#parent");
const widgetEl = document.querySelector("#widget");

const mouseDowns = fromEvent(widgetEl, "mousedown");
const parentMouseMoves = fromEvent(parentEl, "mousemove");
const parentMouseUps = fromEvent(parentEl, "mouseup");

const drags = mouseDowns.pipe(
  map((e) => parentMouseMoves.pipe(takeUntil(parentMouseUps))),
  concatAll()
);

drags.subscribe({
  next(e) {
    widgetEl.style.left = e.clientX + "px";
    widgetEl.style.top = e.clientY + "px";
  },
  error() {
    console.log("Error!");
  },
  complete() {
    console.log("Completed");
  },
});
