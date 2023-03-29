---
title: Storybook을 사용해 컴포넌트 단위로 개발하기
date: "2023-03-25T20:11:10.254Z"
description: "Storybook을 사용해 테스트 및 컴포넌트 단위로 개발하는 과정을 이야기합니다."
category: 트러블슈팅
---

## 시작하며

Storybook을 이용하여 view 컴포넌트를 테스트 하면서 컴포넌트 단위로 개발하는 방법을 이야기 해봅니다

## storybook이란?

Storybook은 view 컴포넌트를 시각화 해주고 보다 손쉽게 유저 인터렉션을 테스트 할수 있도록 도와주는 도구입니다. 주로 공통 컴포넌트나 디자인 시스템을 관리하기 위해서 많이 사용되며, 6.4 버전 부터는 Interactive Stories 라는 기능을 통해 사용자의 행동을 코드로 작성하고 이를 테스트 할수 있는 방법도 제공합니다.

## 기존의 개발방식

저는 react 기반의 프로젝트를 진행하면 보통 특정 페이지를 먼저 작업하는 형식으로 진행합니다. 왜냐하면 만들어진 컴포넌트를 확인하면서 작업해야하는데, 이를 확인하는 방법이 react 개발 서버를 띄워 페이지를 확인하는것이기 때문입니다.

하지만 이러한 방식은 개별적으로 작성되는 컴포넌트와 달리 전체적인 페이지만을 확인할수 있어서 당장 요소가 제대로 렌더링되었는지를 확인하는 과정도 다른 컴포넌트들 때문에 불편하고, 컴포넌트 자체를 테스트하는것은 불가능에 가깝습니다.

또한 공통으로 사용될 컴포넌트는 미리 개발하여 확인해보는것이 좋은데, 페이지 단위로 개발하다보니 개발이후 공통된 부분을 합치는등 불필요한 작업이 추가적으로 진행되서 미리 이를 파악하고 컴포넌트 단위로 개발하면 장점이 있을것 같아 Storybook을 도입해 작업하게 되었습니다.

## storybook 사용해보기

Storybook을 사용하게 되면 더이상 페이지를 열어서 해당페이지의 모든 컴포넌트와 함께 작업중인 컴포넌트를 확인하지 않아도됩니다. 또한 부가적이지만 Storybook의 기능을 이용해 테스트도 간단하게 진행할수 있습니다.

하지만 이를 위해서는 view 컴포넌트의 독립성이 매우 중요합니다. 만약 Storybook에서 불러오는 view 컴포넌트가 독립적이지 않으면 외부에 의존성이 생겨 원하는 만큼 테스트를 하지 못하거나 가능하더라도 의존성을 매번 모킹(mocking)해주어야 합니다.

```javascript
const App = ({ data }) => {
  const [data, setData] = useState()

  useEffect(() => {
    axios.get("http://test.com").then(res => {
      setData(res.data)
    })
  })
  return (
    <div>
      <h1>{data.nickname}</h1>
      <p>{data.introduce}</p>
    </div>
  )
}
```

이코드를 보면 view 컴포넌트가 props로 데이터를 받는것이 아니라 내부에서 데이터를 받는 로직이 존재하기 때문에, 위에서 말한것처럼 의존성 문제가 발생합니다. 따라서 view에서 데이터를 받아오는 로직을 분리하여 아래처럼 작성해야합니다.

```javascript
const AppContainer = ({ nickname, introduce }) => {
  const [data, setData] = useState()

  useEffect(() => {
    axios.get("http://test.com").then(res => {
      setData(res.data)
    })
  })
  return <App data={data} />
}

const App = ({ data }) => {
  return (
    <div>
      <h1>{data.nickname}</h1>
      <p>{data.introduce}</p>
    </div>
  )
}
```

## 마치며

팀 프로젝트에서 이러한 도구의 필요성에 대해서 설명을 한뒤 동의를 구해 도입하였습니다. 결과적으로 개별 컴포넌트를 손쉽게 확인할수 있고 인터렉션도 테스트 할수 있어서 디자이너님과 소통할때도 유용한 상황이 있었습니다.

앞으로 다른 프로젝트를 하더라도 협업을 하는 상황이라면 storybook을 계속 적용해볼것 같습니다.

## 참고자료

<a class="link" href="https://jbee.io/react/testing-2-react-testing/">[Testing] 2. 프론트엔드, 어떻게 테스트 할 것인가</a>
<a class="link" href="https://storybook.js.org/tutorials/ui-testing-handbook/react/ko/visual-testing/">스토리북(Storybook)의 시각적 요소 테스트</a>
