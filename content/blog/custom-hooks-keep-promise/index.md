---
title: 규칙이 깨지지 않도록 Custom Hooks을 사용하기
date: "2023-03-22T17:22:11.234Z"
description: "자주사용하는 코드를 Custom Hooks를 이용해 처리해봅니다"
category: 트러블슈팅
thumbnail: "../../../static/thumbnail/custom-hooks-keep-promise.jpg"
---

## 들어가며

이전에 팀 프로젝트를 진행하면서, 구두로한 약속은 의도하지 않더라도 잘 지켜지지 않을때가 많았습니다. 그래서 새로운 팀프로젝트를 진행하면서 약속은 가능한 코드로 검증하거나 가이드라인을 제시하고자하였습니다. 이를 위해서 Custom Hooks을 사용하였던 이야기를 소개합니다.

## 반복되는 설정을 추가하기

저희팀은 서버 데이터를 가져오기 위해서 react-query를 사용하였습니다. 또한 아직 안정화된건 아니지만, 로딩과 에러처리를 위해서 suspence를 활용하였습니다. 이를 위해서는 useQuery의 설정값에 두가지 값이 반드시 포함되어야 했습니다. 저를 포함해서 react-query 자체도 거의 처음 사용해보는데다가 설정값까지 추가되면 분명히 추가가 되지 않는 상황이 발생할수 있을것 같았습니다. 그래서 useQuery와 아주 유사한 형태의 useSuspenceQuery라는 custom hooks를 만들어 이 hook을 통해 데이터 fetching을 하도록 하였습니다.

```javascript
const useSuspenseQuery = <T>(queryKey: unknown[], url: string, onSuccess?: (data: T) => void, enabled?: boolean) => {
  const { data } = useQuery<T>(
    queryKey,
    () =>
      customAPI(`${url}`)
        .then(res => res.data)
        .catch(err => console.error("err :", err)),
    {
      enabled: enabled ?? true,
      suspense: true,
      useErrorBoundary: true,
      onSuccess,
    },
  );

  return { data: data as T };
};
```

useQuery는 제네릭으로 4가지 값을 받지만, 저희가 필요한 제네릭은 서버요청 결과 타입을 입력하는 부분 뿐이었기에, 하나만 받도록 하였고, useQuery후 추가 작업이 필요할수 있어서 요청받은 데이터를 이용해 추가작업을 할수있도록 추가작업함수를 정의하였습니다.

이렇게 정의하고 사용하다보니 확실히 설정이 중복적으로 선언되지 않아서 코드가 줄어드는 장점이 있었을 뿐만 아니라, 설정을 빠트릴일이 없다는 장점이 있었습니다.

## 결정을 위한 공통화

한편 react-query에는 post 와 delete등 get이외의 데이터를 수정할때 사용하는 useMutate라는 hook이 있습니다. 이 hook은 suspence와는 관련이 없지만, 데이터를 수정한후 동작에 있어서 두가지 선택이 있습니다.

1. invalidateQueries 함수를 사용하여 해당 변경한 키의 요소가 stale 하지 않다고 말해줌으로써 새로운 데이터를 받아오는것
2. useQueryClient를 실행하여 해당 객체의 setQueryData메소드를 사용하여 요청후 데이터를 이용해 직접 내부 데이터를 변경하는 것

첫번째 방법과 두번째 방법은 장단점이 있습니다. 첫번째는 쿼리키만 넣어주면 되기 때문에 아주간단합니다. 다만 반드시 새로 네트워크 요청을 해야합니다. 두번째의 경우 자칫 데이터 구조가 복잡하다면 수정하는데 코드가 복잡해질수 있고 실수가 발생할수 있지만 네트워크 요청을 다시 할필요는 없습니다.

두가지 방법을 적절한 상황에 맞추어 사용할수도 있지만, 프로젝트 특성상 데이터 구조가 복잡하지 않아서 불필요한 네트워크 요청을 줄이는게 좋겠다고 이야기 되었습니다. 그래서 이러한 방법을 반드시 사용하여 이후 데이터를 변경하도록 Custom Hooks를 구성하였습니다.

```javascript
const useSetQueryMutate = <T, F>(
  promiseCallback: MutationFunction<AxiosResponse<T, unknown>>,
  queryKey?: unknown[],
  setQueryCallback?: (e: AxiosResponse<T, unknown>) => F
) => {
  const queryClient = useQueryClient()
  const mutateFn = useMutation(promiseCallback, {
    onSuccess: e => {
      if (queryKey && setQueryCallback) {
        queryClient.setQueryData(queryKey, setQueryCallback(e))
      }
    },
    onError: e => {
      console.log(e)
      alert("에러발생") //추후 에러 로직이 개별로 필요하게될경우 인자로 넘겨받도록 하도록하겠습니다.
    },
  })
  return mutateFn
}
```

## 마치며

구두로 정하거나 혹은 이를 문서화한 규칙일지라도 쉽게 깨지는것같습니다. 의도적으로 깨는사람은 없겠지만, 작업하면서 깜빡하다보니 이러한 일이 생기는것 같습니다. 그래서 가능한 코드로 검증할 수 있다면 규칙을 유지하기 훨씬 편하지 않을까 생각합니다.

## 참고자료

<a class="link" href="https://ko.reactjs.org/docs/hooks-custom.html">자신만의 Hook 만들기</a>
<a class="link" href="https://react.vlpt.us/basic/21-custom-hook.html">커스텀 Hooks 만들기</a>
