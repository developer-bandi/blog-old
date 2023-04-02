---
title: Concurrent UI Pattern을 사용하여 선언적으로 컴포넌트를 작성하기
date: "2023-03-17T20:33:02.234Z"
description: "Concurrent ui pattern을 이용해 코드를 개선한 경험을 공유합니다"
category: 트러블슈팅
---

## 들어가며

팀 프로젝트를 진행하면서 처음으로 react 18 버전을 도입하게 되었습니다. 물론 최신버전을 쓰는게 좋기때문이기도 하지만, 여기에는 suspence를 활용한 concurrent ui pattern를 사용해 보고싶다는 생각도 있었습니다. 이번 포스트에서는 concurrent ui pattern를 사용해서 기존의 불편한점을 개선한 사례를 소개합니다.

## 기존의 문제

react는 철학상 선언형 라이브러리입니다. dom을 어떻게 제어할지 작성하지 않고 view의 상태만을 표현하더라도 react가 알아서 dom을 제어해서 화면을 그려주기 때문입니다. 그런데 여기서 한가지 아쉬운점은 view컴포넌트에서 정상적으로 데이터를 받아온 케이스를 제외하고 로딩과 에러상태를 추가적으로 처리해야 해서 다소 명령형적인 코드가 발생하는것입니다.

```javascript
const App = () => {
  const [state, setState] = useState({ loading: false, error: false })

  useEffect(() => {
    setState({ loading: true, error: false })
    axios
      .get("http://test.com")
      .then(res => {
        setState({ loading: false, error: false, content: res.data })
      })
      .catch(error => {
        setState({ loading: false, error: true })
      })
  }, [])

  // 로딩중일땐.... 에러발생시엔... 특정상황에서 어떻게 하라는 명령형적 코드가 포함됩니다.
  if (state.loading) return <div>로딩중...</div>
  if (state.error) return <div>에러발생...</div>
  return <div>{state.content}</div>
}
```

이러한 문제를 해결하기 위해서 suspence와 errorboundary를 활용해 Concurrent ui pattern을 도입하게되었습니다.

> 명령형과 선언형의 차이는 간단하게 말하자면 구체적인 동작방식을 명시하느냐 하지 않느냐의 차이입니다. 택시를 탄다고 가정할때 선언형은 **_기사님께 강남역으로 가주세요 라고 말하는것_**이고, 명령형은 **_여기서 두블럭더 가셔서 우회전 하시고 다시 1km정도 더 가서 좌회전 하셔서 건너편의 강남역으로 가주세요 라고 하는것_**입니다.

## 작성방식

Concurrent ui pattern을 사용하기 위해서는 suspense를 지원하는 특별한 객체를 이용해야합니다. react 자체적으로도 사용할수 있지만, react-query에서 이미 이런 특별한 객체로 data fetch를 할수 있도록 지원하기에 이를 사용해 코드를 구성해 보겠습니다. 또한 에러처리도 포함하고자 errorboundary도 활용하겠습니다.

```javascript
const AppContainer = () => {
  return (
    // UserProfile에서 비동기 데이터를 로딩하고 있는 경우
    // Suspense의 fallback을 통해 Spinner를 보여줍니다.
      <ErrorBoundary FallbackComponent={() => <div style={exceptCaseStyle}>에러발생...</div>}>
        <Suspense fallback={<div style={exceptCaseStyle}>로딩중...</div>}>
          <SummaryContainer setCondition={setCondition} />
        </Suspense>
      </ErrorBoundary>
  );
};

const App = () => {
  // userProfileRepository는 Suspense를 지원하는 "특별한 객체"
  const { data } = useQuery(
    ["test"],
    () =>
      axios.get("http://test.com")
        .then(res => res.data)
        .catch(err => console.error("err :", err)),
    {
      suspense: true,
      useErrorBoundary: true,
    },

  return (
    <div>{data}</div>
  );
};
```

위와 같은 방식으로 작성한경우 data를 가져오는방식에는 큰차이가 없지만, App컴포넌트에서 더이상 로딩중인지 에러가 발생했는지를 신경쓰지 않고 마치 데이터가 무조건 들어 있는것처럼 처리할수 있게되어서 관심사를 분리하고 실질적인 view자체에 신경쓸수 있게 됩니다.

## 또다른 장점

이러한 패턴을 도입한 이유는 앞서 언급했던것처럼 로딩과 에러처리를 view 로직에서 분리하기 위함이었습니다. 하지만 이를 사용하다보니 둘 이상의 데이터를 받아오는 컴포넌트를 결합할때 코드를 작성하기가 굉장히 편리하였습니다.

현재는 코드가 수정되어 이렇게 사용되지는 않지만, 초기 home에서는 둘이상의 컴포넌트가 모두 로딩이 완료되었을때 화면에 보여져야하는 상황이 있었습니다. 이를 이전에 사용하던 방식으로 구현한다면 두개의 데이터를 모두 상위에서 받아온뒤, 둘의 loading상태를 검증해서 아래에 보여주어야합니다.

```javascript
const App = () => {
  const [state1, setState1] = useState({ loading: false, error: false })
  const [state2, setState2] = useState({ loading: false, error: false })

  useEffect(() => {
    setState1({ loading: true, error: false })
    Promise.all([
      axios
        .get("http://test.com")
        .then(res => {
          setState1({ loading: false, error: false, content: res.data })
        })
        .catch(error => {
          setState1({ loading: false, error: true })
        }),
      axios
        .get("http://best.com")
        .then(res => {
          setState2({ loading: false, error: false, content: res.data })
        })
        .catch(error => {
          setState2({ loading: false, error: true })
        }),
    ])
  }, [])

  if (state1.loading || state2.loading) return <div>로딩중...</div>
  if (state1.error || state2.error) return <div>에러발생...</div>
  return (
    <div>
      <div>{state1.content}</div>
      <div>{state2.content}</div>
    </div>
  )
}
```

두개의 상태만 두어도 꽤 복잡한데,여기서 요소가 계속 추가되면 더욱 복잡해질지 모릅니다. 이를 패턴을 사용하면 굉장히 단순하게 바꿀수 있습니다.

```javascript
const AppContainer = () => {
  return (
    // UserProfile에서 비동기 데이터를 로딩하고 있는 경우
    // Suspense의 fallback을 통해 Spinner를 보여줍니다.
    <ErrorBoundary FallbackComponent={() => <div>에러발생...</div>}>
      <Suspense fallback={<div>로딩중...</div>}>
        <App1 />
        <App2 />
      </Suspense>
    </ErrorBoundary>
  )
}

const App1 = () => {
  // userProfileRepository는 Suspense를 지원하는 "특별한 객체"
  const { data } = useQuery(
    ["test"],
    () =>
      axios
        .get("http://test.com")
        .then(res => res.data)
        .catch(err => console.error("err :", err)),
    {
      suspense: true,
      useErrorBoundary: true,
    }
  )

  return <div>{data}</div>
}

const App2 = () => {
  // userProfileRepository는 Suspense를 지원하는 "특별한 객체"
  const { data } = useQuery(
    ["test"],
    () =>
      axios
        .get("http://best.com")
        .then(res => res.data)
        .catch(err => console.error("err :", err)),
    {
      suspense: true,
      useErrorBoundary: true,
    }
  )

  return <div>{data}</div>
}
```

두가지 컴포넌트를 만들고, 이를 suspence내부에 작성하면 suspence가 알아서 두 컴포넌트의 데이터 로딩이 모두 완료되었을때 화면을 보여주게됩니다. 앞선 방식보다 훨씬 직관적이고 편리합니다.

이를 응용하면 더욱 복잡한 상황에서도 기존에 사용하던 방식보다 훨씬 쉽게 화면을 구성할수 있습니다.

## 의도치 않게 로딩이 노출되지 않는 현상 해결하기

화면 전환을 하다보면, data를 불러오는 속도가 빠르거나, 혹은 속도가 빠르지 않더라도 굳이 로딩을 보여주지 않고 이전 데이터를 보여주다가 전환하고 싶을때가 있습니다. 제가 진행한 프로젝트에서는 리뷰와, 문의 컴포넌트에서 정렬 혹은 페이지를 변경하였을때가 이에 해당하였는데 Mocking한 데이터로 진행하다보니,지연시간이 거의 없었고, 그렇다고 굳이 일부러 지연을 부여하여 전환시마다 로딩을 보여주는것도 UI 적으로 좋지 못하다고 생각했기 때문입니다.

그런데 앞서 사용한 패턴으로는 이를 해결할수 없습니다. 왜냐하면 데이터를 다 받아올때까지 무조건 loading을 띄우기 때문입니다. 따라서 이를 해결하기 위해서는 startTransition 함수를 이용해야합니다. 해당 함수를 이용해 상태를 변경하면, 이는 긴급하지 않은 변경으로 처리되어서, 함수는 동기적으로 실행되어 서버의 데이터는 바로 받아오지만, 화면에 변경되는 시점은 데이터를 모두 받아온 때가 되므로, 데이터를 다받아올때까지 로딩을 띄우지 않고 이전 데이터를 유지합니다.

```javascript
const App = () => {
  const [page, setPage] = useState(1)
  const { data } = useQuery(
    ["test", page],
    () =>
      axios
        .get(`http://test.com?page=${page}`)
        .then(res => res.data)
        .catch(err => console.error("err :", err)),
    {
      suspense: true,
      useErrorBoundary: true,
    }
  )

  const changePage = () => {
    startTransition(() => {
      setPage(page + 1) // 함수는 실행되나, 데이터를 다받아온뒤 화면에 반영됩니다.
    })
  }
  return (
    <div>
      <div>{data}</div>
      <div>{page}</div>
      <button onClick={() => changePage()}>다음페이지</button>
    </div>
  )
}
```

## 마치며

프론트엔드에서 view를 구현할때는 로딩상태와 에러상태에 대해서 구현하는것이 당연하다고는 생각했지만, 약간의 보일러플레이트처럼 느껴졌습니다. 관심사가 분리되지 않았기 때문입니다. 하지만 최근 concurrent ui pattern을 알게되었고 이를 적용해보니 몇가지 장점이 있는것 같습니다. 아직 정식으로 지원되는것은 아니기에 정식으로 지원된다면 react-query와 결합했을때 매우 좋은 패턴이 될것 같습니다.

## 참고자료

<a class="link" href="https://tech.kakaopay.com/post/react-query-2">React Query와 함께 Concurrent UI Pattern을 도입하는 방법</a>
<a class="link" href="https://17.reactjs.org/docs/concurrent-mode-patterns.html">
concurrent-mode-patterns
</a>
