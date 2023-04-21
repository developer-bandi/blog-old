---
title: 선언형 프로그래밍과 React
date: "2023-04-21T18:10:30.114Z"
description: "React에서 선언형이 가지는 의미에 대해서 이야기해봅니다"
category: 기술아티클
---

## 들어가며

React의 github README에 보면 세가지 특징이 적혀있습니다. 가장 첫번째 적혀있는것이 Declarative, 선언형 입니다. 다만 해당 내용만으로는 선언형에대해서 이해하기란 쉽지 않아서 넘겨버렸다가 최근에 React에서 선언형이 가지는 의미에 대해서 고민을 하게되었고 나름의 결론을 내리게 되었습니다. 이번 포스트에서는 React에서의 선언형이 가지는 의미에 대해서 고민해보고자합니다.

## 선언형과 명령형

먼저 선언형에 대한 설명이 필요할것 같습니다. 반대개념과의 비교를 통해 설명하면 더욱 이해하기 쉽기에, 선언형의 반대인 명령형과 비교하면서 설명하겠습니다. 코드로 살펴보기 앞서서 이해를 돕기 위해서 일상생활의 사례를 예시로 들어보겠습니다.

어머니가 두부가 필요해서, 철수에게 심부름을 시키려합니다. 이를 각각 명령형과 선언형을 사용해 표현하면 다음과 같습니다.

- 명령형 : 집에서 두블럭 앞에 있는 교차로 까지 가서 우회전한뒤 다시 1km을 가서 왼쪽방향에 있는 건물 1층의 슈퍼마켓에 가서 두부 1모 사오렴
- 선언형 : 슈퍼마켓에 가서 두부 1모 사오렴

위의 예시처럼, 명령형은 특정 작업을 수행하기 위한 상세 절차를 모두 명시하는것입니다. 반면 선언형은 방법을 명시하지 않고 어떤 작업인지 이름만 명시하는것입니다. 여기서 선언형으로 철수에게 명령을 하였을때, 철수가 슈퍼의 위치를 모른다면 명령을 수행할 수 없기에 철수가 네비게이션 어플리케이션을 가지고 있다고 가정하겠습니다. 그러면 이때 의문이 생깁니다. 명령형으로 위치를 말로 설명하는것과, 어플리케이션을 가지고 있는것이 똑같은것 아니냐는것입니다. 당연히 생길수 있는 의문이며 이는 아래에서 깊이있게 다루어보겠습니다. 지금은 명령형, 선언형에 대한 감만 잡으면 좋을것 같습니다. 이제 코드로 살펴보겠습니다.

```javascript
// 명령형
let sum = 0
const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
for (let i = 0; i < list.length; i++) {
  if (list[i] % 2 === 0) {
    sum += list[i] * 3
  }
}

// 선언형
const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const sum = list
  .filter(value => value % 2 === 0)
  .map(value => value * 3)
  .reduce((prev, cur) => prev + cur, 0)
```

위 코드는 1부터 10까지의 숫자들중 2의 배수를 골라 3배를 한뒤, 모두 더해주는 코드입니다. 명령형과 선언형 모두 동일한 작업을 수행하는데, 명령형의 경우 for 문을 이용하여 보다 구체적으로 작업 과정을 명시하고 있지만, 선언형의 경우 filter, map, reduce 함수를 이용해 몇가지 작업 이름만으로 동작을 지시할수 있습니다.

이제 앞서 가졌던 의문을 해소해보겠습니다. 앞선 예제에서 철수가 명령을 수행하기위한 정보가 부족하기때문에 네비게이션 어플리케이션을 가진다고 가정했습니다. 여기서 명령형과 선언형의 차이가 없지 않느냐는 의문을 가졌었는데 여기서도 동일한 의문이 생깁니다. 선언형에서 filter, map, reduce 함수의 경우, 세부 구현사항이 javascript에 내장되어있기 때문에 명령을 포함하고 있기 때문입니다. 동작 방식만을 볼때 명령형과 선언형에 차이가 없어 보이는것은 당연합니다. 왜냐하면 컴퓨터는 결국 명령형적으로 코딩해야 동작하기 때문입니다. 다만 선언형이 하고자하는점은 **최대한 명령형적인 코드를 숨겨서 겉으로 드러나지 않도록 하고 선언만을 사용하여 무엇을(What)에 집중한 코드를 구성**하자는것입니다.

## React에서 선언형이란

앞선 설명을 통해 선언형에 대해서 이해를 하셨을 것 같습니다. 이제 React의 어디에서 선언형이 사용되는지는 찾아보겠습니다. React 자체에서 선언형이 어디서 사용되었는지를 바로 설명하는것보다 비교를 통해 설명하는것이 이해하기 쉬울것 같아 React와 Vanilla JS 각각의 간단한 카운터 예제 코드를 준비했습니다.

```javascript
const App = () => {
  const [count, setCount] = useState()

  return (
    <div>
      <div>{count}</div>
      <button onClick={setCount(count + 1)}>증가</button>
      <button onClick={setCount(count - 1)}>감소</button>
    </div>
  )
}
```

```javascript
<body>
  <div>
    <div id="count"></div>
    <button id="increase">증가</button>
    <button id="decrease">감소</button>
  </div>
  <script>
    const countEl = document.querySelector("#count");
    const increaseEl = document.querySelector("#increase");
    const decreaseEl = document.querySelector("#decrease");

    const increaseCount = () => {
      countEl.innerHTML = Number(countEl.innerHTML) + 1;
    };

    const decreaseCount = () => {
      countEl.innerHTML = Number(countEl.innerHTML) - 1;
    };
    increaseEl.addEventListener("click", increaseCount);
    decreaseEl.addEventListener("click", increaseCount);
  </script>
</body>
```

React 예제가 훨씬 간단하다는 사실이 가장먼저 눈에 들어오지만, 핵심에서 벗어나기 때문에 논의에서 제외하겠습니다. 그보다 코드에서 상태가 변경되었을때 화면을 어떻게 변경하는지에 집중해보겠습니다. 먼저 Vanila JS의 경우 Dom에서 값을 가져와 1을 더하고 다시 넣어주는 코드를 직접 작성합니다. 반면 react의 경우 어디에도 dom을 조작하는 코드는 없습니다. jsx라는 문법을 이용해 어떻게 화면이 보이면 되는지만 작성했을뿐입니다. 따라서 React에서의 선언형은 **dom을 직접 조작하지 않고, 단순히 jsx를 통해서 view를 표현**하는데에서 의미를 찾을수 있는것입니다. dom조작은 개발자가 아니라 React가 내부적으로 처리하게 됩니다.

이러한 점은 개발자가 dom의 변경을 신경쓰지 않아도 되기 때문에 dom조작 과정에서의 버그나 최적화등의 책임에서도 자유롭게 만듭니다. 즉 렌더링에 관한 책임을 라이브러리에 넘기고, 대신 개발자는 UI 자체에 집중할수 있게 된다는 장점이 생기게됩니다.

## 최근의 변화들

React 18버전에서 생긴 변화중 suspence를 이용해 data fetching을 할 수 있습니다.아직 정식으로 지원되는 기능은 아니지만, 이를 이용하면 React를 보다 더 선언적으로 사용할수 있습니다. 기존에 컴포넌트 내부에서 처리하던 로딩, 에러 상태의 jsx를 분리함으로써 컴포넌트 그자체의 상태에 집중할수 있기 되었기 때문입니다.

> 구체적인 적용사례는 아래 포스트를 참고해보세요
> https://tech.kakaopay.com/post/react-query-2/

## 마치며

이번 포스트에서는 React가 가지고있는 선언형적 특징을 살펴보았습니다. React가 Dom을 렌더링하는 방식을 추상화해서 제공하고 있다는 사실을 알고 사용한다면, React에 대해서 조금더 깊이있는 이해를 가져갈 수 있을것 같습니다.

## 참고자료

<a class="link" href="https://blog.mathpresso.com/declarative-react-and-inversion-of-control-7b95f3fbddf5">Declarative React, and Inversion of Control</a>
<a class="link" href="https://medium.com/sunstack/imperative-and-declarative-programming-e04b48887ab6">Imperative and Declarative Programming</a>
<a class="link" href="https://iborymagic.tistory.com/73">명령형 vs 선언형 프로그래밍</a>
