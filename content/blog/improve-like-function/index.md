---
title: optimistic update를 활용하여 좋아요 기능 개선하기
date: "2023-02-05T18:47:18.164Z"
description: "optimistic update와 몇가지 아이디어를 활용해 좋아요 기능을 개선해봅니다"
category: 트러블슈팅
---

## 들어가며

커뮤니티 기능을 만들면서 좋아요 기능에 대해 고민을 하였고 결과적으로 UX와 서버 리소스 측면에서 개선할수 있었습니다. 이번 포스트에서는 고민을 했던 과정들을 vanilla javascript로 재구성하여 소개합니다.

## 간단하게 구현하기

먼저 좋아요 기능을 간단하게 구현해보겠습니다. 일반적인 api요청처럼, api 서버에 업데이트 할 좋아요 정보를 보내고 응답이 올때까지 기다린뒤 에러가 나지 않았다면 화면에 반영하는 식으로 구현할수 있습니다. api 서버를 따로 구현하지는 않고, 대략 1초정도의 지연시간이 걸린다고 가정하여 서버요청을 모킹하였습니다.

```javascript
;<div id="wrap">
  <div id="icon">♡</div>
  <div id="count">0</div>
</div>

let count = 0
let like = false
// 갯수와 좋아요 여부

const wrapEl = document.querySelector("#wrap")
const iconEl = document.querySelector("#icon")
const countEl = document.querySelector("#count")
// dom 요소

const apiRequest = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(1)
      if (Math.floor(Math.random() * 10) === 0) {
        reject("에러발생")
      }
      resolve("정상반영")
    }, 1000)
  })
// 백엔드 api요청을 모킹한 함수로, 1초의 시간이 걸리며 1/10 확률로 에러가 발생합니다.

const updateLike = async () => {
  try {
    await apiRequest()
    if (like) {
      count -= 1
      iconEl.innerHTML = "♡"
    } else {
      count += 1
      iconEl.innerHTML = "♥"
    }
    countEl.innerHTML = count
    like = !like
  } catch {
    alert("에러발생!")
  }
}

wrapEl.addEventListener("click", updateLike)
```

## 좋아요 반영이 즉각적이지 않는 문제

apiRequest가 1초의 딜레이를 가지도록 구현하였기에 좋아요를 클릭할시에 결과가 1초뒤에 화면에 반영됩니다. 대다수의 유저들은 버튼 클릭의 결과가 반영되는데 1초의 딜레이가 걸리는것을 자연스럽다고 생각하지 않습니다. 따라서 클릭이벤트가 즉각적으로 반영되도록 수정해 보겠습니다.

처음 코드에서 구현한 방식은 api요청을 받은뒤에 상태를 반영하는 방식입니다. 사실 일반적인 api요청시 에러가 발생할 확률은 대단히 낮기 때문에, api 요청을 보내기 전에 먼저 화면에 변경된 좋아요 상태를 반영한뒤, 요청결과 에러가 발생하였을경우 좋아요 상태를 다시 원래대로 되돌리는 방식을 선택하였습니다. 프론트엔드에서는 이를 optimistic update(낙관적 업데이트)라는 용어로 부르고 있습니다. 이를 반영하여 수정한 코드는 다음과 같습니다.

```javascript
... 생략

const changeLike = () => {
  if (like) {
    count -= 1;
    iconEl.innerHTML = "♡";
  } else {
    count += 1;
    iconEl.innerHTML = "♥";
  }
  countEl.innerHTML = count;
  like = !like;
};
// 공통으로 사용하는 로직이어서 함수로 분리하였습니다.

const updateLike = async () => {
  try {
    changeLike();
    await apiRequest();
  } catch {
    changeLike();
    alert("에러발생!");
  }
};
```

## 여러번 버튼을 누를때 생기는 문제

앞선 코드를 통해서 유저가 반응을 즉각적으로 받을수 있게 되었습니다. 이번에는 조금 예외적인 경우를 고려해보려 합니다. 만약 유저가 좋아요 버튼을 연속해서 여러번 누르는 경우에는 어떤 일이 발생하게될까요?

만약 앞선코드를 이용하여 상태를 즉각적으로 반영하지 않았다면 유저가 버튼을 여러번 누를 경우 동일한 요청을 여러번 보내게 되는데, 좋아요가 활성화된 상태에서 또 활성화하는것은 불가능하므로 백엔드 측에서는 첫번째 요청 이후의 요청은 모두 오류로 처리하게됩니다. 따라서 첫번째 요청이외의 요청은 무의미한 요청이므로, 서버의 리소스를 불필요하게 사용하게 되며 프론트측에서도 불필요한 에러처리로직이 포함되어야하므로 사용자경험을 저해할수있습니다. 또한 여러번 누르더라도 횟수에따라서 좋아요가 반영되지 않고, 단한번만 반영되기때문에, 기대하는 결과와 다른 결과가 나올수 있습니다.

다행이 앞선 코드를 통해서 위 에러는 발생하지 않지만 연속적으로 발생하는 요청을 모두 보낼 필요는 없습니다. 일정시간동안 연속적으로 입력된 요청은 묶어 마지막의 상태만 서버에 보내 적용을 한다면 서버 자원을 적게 사용할수 있기때문입니다.

### debounce

debounce 는 특정시간이 지난 후 하나의 이벤트만 발생하도록 하는 패턴입니다. 가령 클릭이벤트에 debounce를 1초 걸어두었다고 하면, 한번 클릭한 이후 1초동안 대기하면서 다른 클릭이벤트가 발생하지 않으면 처음 클릭을 실행하고, 만약 그안에 다른 이벤트가 실행될경우 다시 1초를 기다리며 이벤트 발생여부를 감시해 처음처럼 그안에 다른이벤트가 발생하지 않으면 해당 이벤트를 실행시킵니다.

이 패턴을 이용하면 위에서 언급한 문제를 해결할수 있습니다. 버튼을 여러번 누르더라도, 마지막에 단한번의 요청만 전송되기때문에, 결과적으로 클라이언트에는 사용자 행동의 과정이 모두 보여지지만, 서버에 저장되는것은 사용자 행동의 마지막 결과가 되므로, 불필요한 과정을 서버에 저장하지 않아 리소스를 절약할수 있게 됩니다.

```javascript
... 생략
const updateLike = async () => {
  try {
    await apiRequest();
  } catch {
    changeLike();
    alert("에러발생!");
  }
};

const debounce = (time) => {
  let timer;
  return (fn) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn(), time);
  };
};

const debounce1000ms = debounce(1000);

const debounceUpdateLike = () =>
  changeLike(); // 클라이언트 화면에 반영할 좋아요 표시는 디바운스 할필요가 없으므로 분리하였습니다.
  debounce1000ms(() => {
    updateLike();
  });

wrapEl.addEventListener("click", debounceUpdateLike);
```

### 상태가 동일할 경우 요청을 보내지 않도록 처리하기

debounce를 이용하여 요청을 최적화 하였지만 한번더 최적화할수 있습니다. 현재 처리 방식에서는 여러번 클릭하더라도 마지막 상태값이 서버로 보내집니다. 이때 이 상태가 처음과 같은경우 사실 서버로 전송할 필요가 없습니다. 왜냐하면 변경된 과정은 존재하지면 결국 결과적인 상태값은 동일하기 때문입니다. 따라서 앞선 updateLike 를 개선하고 서버측 정보인 serverCount, serverLike를 추가하여 서버상태와 동일한경우 요청을 보내지 않도록 개선할수 있습니다.

```javascript
...생략
let serverCount = 0;
let serverLike = false;

const updateLike = async () => {
  try {
    if (serverCount !== count && serverLike !== like) {
      await apiRequest();
      serverCount = count;
      serverLike = like;
    }
  } catch {
    changeLike();
    alert("에러발생!");
  }
};
```

### 함수가 실행되기전 사용자가 페이지를 나갈경우

추가적으로 고려해볼 상황은 아직 서버에 데이터가 전송되지 않았을때, 페이지가 종료되는 경우입니다. 가능성이 높지는 않지만, 사용자가 좋아요를 클릭하고 바로 페이지를 벗어나는경우, 마지막 상태를 확인하여 서버에 전송여부를 결정하여 전송해야합니다.

가장 먼저 생각해볼수 있는 방식은 beforeunload 이벤트와 navigator.sendBeacon 함수를 이용해 새로고침시나 페이지를 나갈때 서버 정보와 클라이언트 정보가 다르다면 곧바로 post 요청을 보내는 것입니다.

```javascript
const preventClose = e => {
  if (serverCount !== count && serverLike !== like) {
    navigator.sendBeacon(
      "http://localhost:8000/like",
      JSON.stringify({ like, count })
    )
  }
}

window.addEventListener("unload", preventClose)
```

다만 브라우저가 닫혀서 서버오류가 발생하여 반영이 안되거나 하는등의 예외는 사용자에게 알릴수 없기때문에 최대한 debounce 시간을 짧게 만들어 놓는것이 좋습니다.

## redux-saga를 이용하여 구현하기

앞서 이야기한 문제들을 사실 redux와 redux-saga를 이용하면 간단하게 구현할수 있습니다. action 이 발생할때마다 좋아요 상태를 변경해주고, api 호출시 에러가 발생하면 변경해줍니다. 이때, saga 함수에 딜레이를 주고 takeLatest를 이용해 마지막으로 발생한 실행되게 하면 debounce를 구현할수 있습니다. unload이벤트 부분을 제외하고 위와 동일한 기능을 하도록 구현하면 다음과 같습니다.

```javascript
//redux
const postDetailSlice = createSlice({
  name: "like",
  initialState: {
    client: { count: 0, like: false },
    server: { count: 0, like: false },
  },
  reducers: {
    updateLikeCount(state, action) {},

    upLikeCount(state) {
      state.count += 1
      state.like = true
    },

    downLikeCount(state) {
      state.count -= 1
      state.like = false
    },
  },
})

//redux-saga
function* updateLikeCountSaga(action) {
  try {
    // 딜레이 시키기전에 클라이언트 요청 반영하기
    if (!action.payload.like) yield put(upLikeCount())
    if (action.payload.like) yield put(downLikeCount())
    yield delay(500)
    if (action.payload.like === action.payload.serverlike) {
      if (action.payload.like) yield call(axiosPostlikecount)
      if (!action.payload.like) yield call(axiosDeletelikecount)
    }
  } catch (error) {
    if (action.payload.like) yield put(upLikeCount())
    if (!action.payload.like) yield put(downLikeCount())
  }
}

function* watchUpdateLikeCountSaga() {
  yield all([takeLatest("like/updateLikeCount", updateLikeCountSaga)])
}

//react 코드
const App = () => {
  const { like, count } = useSelector(state => state.like.client)
  const { serverlike } = useSelector(state => state.like.server)
  const dispatch = useDispatch()

  return (
    <div onClick={() => dispatch(updateLikeCount({ like, serverlike }))}>
      <div>{count}</div>
      <div>{like ? "♥" : "♡"}</div>
    </div>
  )
}
```

> takeLatest 헬퍼 함수는 가장 마지막에 실행되는 함수만 실행해주는 기능을 가지고있습니다.
> 어떤 원리로 해당 로직이 debounce가 되는지 궁금하신분은 아래 링크를 참고해주세요
> https://redux-saga.js.org/docs/recipes/

## 마치며

이번 글에서는 좋아요 기능을 간단하게 구현하고 두가지 경우를 개선해보았습니다. 구체적인 비즈니스 로직과 결합해서 설명한것이 아니라 단순히 좋아요 기능만을 대상으로 설명한 글이기에 다소부족함이 있을수 있습니다. 그렇지만 보편적으로 사용되는 기능이기에, 좋아요 기능에 대해 한번 고민해볼수 있었으면 좋겠습니다.

## 참고자료

<a class="link" href="https://www.zerocho.com/category/JavaScript/post/59a8e9cb15ac0000182794fa">쓰로틀링과 디바운싱</a>
<a class="link" href="https://usefulangle.com/post/62/javascript-send-data-to-server-on-page-exit-reload-redirect">Sending AJAX Data when User Moves Away / Exits from Page</a>
<a class="link" href="https://redux-saga.js.org/docs/recipes/">Recipes | redux-saga</a>
