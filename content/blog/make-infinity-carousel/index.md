---
title: 무한캐러셀 만들어보기
date: "2023-02-18T19:49:33.392Z"
description: "몇가지 아이디어를 이용하여 무한캐러셀 구현해봅니다"
category: 트러블슈팅
---

## 들어가며

캐러셀(carousel)은 흔히 배너라고 불리며 양옆으로 넘겨가며 볼수 있는 상단의 컨텐츠를 의미합니다. 여기서 무한 이라는 말이 붙은 이유는, 마지막요소에서 오른쪽으로 넘기면 다시 처음으로 돌아오기 때문입니다. 프로젝트를 진행하면서 이러한 무한캐러셀을 사용해서 보다 부드러운 움직임을 보여주고자 하였습니다. 이번 포스트에서는 무한 캐러셀을 구현해나가는 과정을 소개합니다.

## 직관적으로 구현해보기

먼저 첫번째 컨텐츠를 보여준뒤, 방향키에 따라서 해당 순서에 맞는 컨텐츠를 보여주면됩니다. 첫번째에서 오른쪽 화살표를 누르는경우 두번째 컨텐츠를 보여주고 왼쪽을 누를 경우 마지막 컨텐츠를 보여주면됩니다. 즉 오른쪽이면 인덱스를 1증가시키고, 왼쪽이면 인덱스를 1 감소시키는데, 처음과 마지막의 경우만 예외처리 해주면 된다는 의미가 됩니다. 이를 간단하게 코드로 구현하면 다음과 같습니다.

```javascript
function App() {
  const [order, setOrder] = useState(0)

  const moveLeft = () => {
    setOrder(order === 0 ? bannerData.length - 1 : order - 1)
  }

  const moveRight = () => {
    setOrder(order === bannerData.length - 1 ? 0 : order + 1)
  }

  return (
    <Banner color={bannerData[order]}>
      <Button direction={"left"} onClick={moveLeft}>
        왼쪽
      </Button>
      <Button direction={"right"} onClick={moveRight}>
        오른쪽
      </Button>
    </Banner>
  )
}

export default App

const Banner = styled.div`
  width: 100%;
  height: 400px;
  background: ${props => props.color};
  position: relative;
`

const Button = styled.button`
  width: 50px;
  height: 50px;
  position: absolute;
  top: calc(50% - 25px);
  ${props => (props.direction === "left" ? "left: 100px" : "right: 100px")};
`

const bannerData = ["black", "green", "purple"]
```

이렇게 구성하면 디자인은 만족스럽지 않더라도, 앞서 말한것처럼 왼쪽 혹은 오른쪽 버튼을 계속 누르더라도 마지막에 막히지 않고 다시 처음으로 돌아가거나, 처음에서 왼쪽을 누르더라도 다시 마지막으로 이동하게됩니다.

## 애니메이션 효과 구현하기

일반적으로 구현된 웹사이트의 캐러셀을 보면, 캐러셀이 넘어갈때, 애니메이션이 적용되어서, 넘어가는 과정을 동적으로 보여줍니다. 하지만, 위에서 구현한 코드는 단순히 색상이 변경되는것에 불과하므로 이를 개선해서 넘어가는 애니메이션을 적용해보겠습니다.

먼저 애니메이션을 구현하기 위해서는 배너의 모든 리스트를 렌더링한후, 컨테이너 상자에서 리스트의 위치를 조절하여서 보여지게 해야합니다. 애니메이션 효과를 부여하려면 위치가 변경될때 이를 지연시키는 방식으로 구현되기 때문입니다. 따라서 transition 속성에 위치 값을 지연시키고, 버튼 클릭시 위치를 이동시키면 됩니다. 말로 설명하기 복잡한 감이 없지 않아 있으니, 코드로 보겠습니다. css 코드에 집중해주세요

```javascript
function App() {
// 로직은 위와 동일합니다.
...
  return (
    <Container>
      <BannerBlock order={order}>
        {bannerData.map((color) => (
          <Banner color={color} />
        ))}
      </BannerBlock>
      <Button direction={"left"} onClick={moveLeft}>
        왼쪽
      </Button>
      <Button direction={"right"} onClick={moveRight}>
        오른쪽
      </Button>
    </Container>
  );
}

export default App;

const Container = styled.div`
  width: 100%;
  height: 400px;
  background: ${(props) => props.color};
  position: relative;
  overflow: hidden;
`;

const BannerBlock = styled.div`
  width: 300vw;
  display: flex;
  position: absolute;
  left: calc(-${(props) => props.order}*100%);
  transition: all 1s;
`;

// Banner, Button, bannerData 는 위와 동일합니다.
```

이전 코드와 비교해보면 Container, BannerBlock가 새로 생겨났습니다. Container 엘리먼트는 실제 보여주고 싶은 배너를 보여주는 창(window)라고 생각하면 되고, BannerBlock은 창으로 필터링하게 되는 배너리스트 라고 생각하면 됩니다. 배너변경에 따라서 위치를 변경하기 위해서 absolute 와 left 값을 사용했습니다. 주의할점은 너비가 부모에 비해서 3배 크기 때문에 당연히 밖으로 튀어나오게됩니다. 이를 막기 위해서 Container 엘리먼트에 overflow 속성에 hidden을 적용해야합니다.

### 일부 부자연스러운 효과 개선

중간요소의 움직임은 괜찮으나, 처음에서 뒤로 가거나 마지막에서 처음으로 올때 버튼을 누른 방향과 반대로 움직입니다. 이는 처음이나 마지막에서 이동할수 없는 방향으로 이동했기에 의미상 올바른 위치로 옮겼기 때문입니다.따라서 왼쪽버튼을 누르면 마지막에서도 왼쪽으로 이동하는 효과를 보여주도록 해보겠습니다.

코드로 구현하기에 앞서 이를 가능하게 해주는 원리에 대해서 이야기 해보겠습니다. 먼저 배너 양쪽에 맨마지막 요소와 맨처음 요소를 하나씩 붙여 줍니다. 예를 들어 배너가 3개라면 31231 이런 순서로 5개를 배치해 줍니다. 이렇게 되면 마지막에 처음으로 이동하더라도 오른쪽으로 이동한것처럼 이동합니다. 다만, 그다음에는 다시 두번째로 이동하여야하는데, 무한히 뒤에 붙여줄 수 없으니, 마지막에서 처음으로 이동할때는 이동직후 transition 효과를 끄고 실제 처음인 1번째 인덱스로 이동합니다.

정리하자면 다음과 같습니다. 먼저 모든 요소를 렌더링한후 추가적으로 양끝에 추가요소 1개씩을 붙여줍니다. 이때 마지막 혹은 처음요소에서 역방향 이동이 발생할경우 transition을 끄고 실제 요소로 대체하는것입니다. 이제 코드로 확인해보겠습니다.

```javascript
function App() {
  const [order, setOrder] = useState(1);
  const [transition, setTransition] = useState(true);

  const bannerBlockRef = useRef(null);
 const timeRef = useRef(false);

const moveRight = () => {
  if (!timeRef.current) {
    setTransition(true);
    setOrder(order + 1);
    setTimeout(() => {
      if (order === bannerData.length) {
        setTransition(false);
        setOrder(1);
      }
    }, 1000);
    timeRef.current = true;
    setTimeout(() => {
      timeRef.current = false;
    }, 1000);
  }
};

const moveLeft = () => {
//... 위와 동일하게 적용하면됩니다.

  return (
    <Container>
      <BannerBlock
        order={order}
        length={bannerData.length}
        transition={transition}
        ref={bannerBlockRef}
      >
        <Banner color={bannerData[bannerData.length - 1]} />
        {bannerData.map((color) => (
          <Banner color={color} />
        ))}
        <Banner color={bannerData[0]} />
      </BannerBlock>
      <Button direction={"left"} onClick={moveLeft}>
        왼쪽
      </Button>
      <Button direction={"right"} onClick={moveRight}>
        오른쪽
      </Button>
    </Container>
  );
}

export default App;

const BannerBlock = styled.div`
...
// 아래 코드만 추가해주세요
  transition: ${(props) => (props.transition ? "all 1s" : "none")};
`;

// Container, Banner, Button, bannerData 는 위와 동일합니다.

```

앞서 언급한대로 양끝에 추가요소 1개씩을 붙이고, 역방향으로 이동해야할때 transition을 끄고 실제 요소로 대체하였습니다. 이때, 애니메이션 효과를 위해 1초뒤에 실행되도록 타이머를 설정하였기에 만약 1초안에 해당방향 버튼을 한번더 누르면 컨텐츠가 없는 index로 이동하기 때문에 빈화면이 노출됩니다. 따라서 1초에 한번씩만 이벤트가 실행되도록 처리하였습니다.

## 필요한 요소만 렌더링하기

앞서 구현한 코드들을 사용하면 무한 캐러셀의 형태로 사용할수 있습니다. 하지만 몇가지 아쉬운 점이 있습니다. 첫째, 1초에 한번만 이동할수 있어 여러번 누르는경우 반응하지 않습니다. 둘째, 화면에 보이는 요소는 한개인데, 모든 배너를 렌더링해야합니다. 물론 배너가 수백 수천개가 될 가능성은 매우 낮아 성능과 큰 관련이 없을수는 있지만, 그래도 사용하지 않는 요소를 렌더링하는것은 성능측면에서 낭비이므로 가능한 없애는것이 좋습니다.

이를 개선하기 위해서 앞선 아이디어를 조금더 발전시켜 보겠습니다. 이동을 보여주는 애니메이션이 되려면 최소한 부모 컨테이너의 두배만큼의 요소가 필요합니다. 즉 왼쪽으로 이동할경우 왼쪽에 요소가 있어야하고, 오른쪽으로 이동할경우 오른쪽에 요소가 필요합니다. 따라서 평상시에는 실제 화면에 보여지는 요소만 렌더링하다가, 사용자가 버튼을 누를경우 해당방향으로 요소를 하나 추가해주고, 요소를 이동시키면됩니다. 이러한 아이디어를 적용하여 코드를 개선하면 다음과 같습니다.

```javascript
function App() {
  const [order, setOrder] = useState(0)
  const [left, setLeft] = useState(false)
  const [right, setRight] = useState(false)
  const ref = useRef(null)
  const timer = useRef(null)

  const moveLeft = () => {
    // 연속 넘김을 위해 타이머가 설정되어있으면 타이머를 초기화하고 바로 다음페이지로 넘어가줍니다.
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
      setOrder(order => makeLeft(order))
    }

    //동기적으로 order을 사용해야해서 사용한 패턴입니다.
    setOrder(order => {
      setLeft(makeLeft(order))
      return order
    })

    /* 위치를 앞으로 당기고 다시 애니메이션을 적용하려면 left가 적용된 이후 변경해야하기 때문에
    일정딜레이를 위해서 빈 setTimeout을 이용하였습니다. 
    조금더 엄밀하게 가져가려면 requestanimationframe Api를 사용하는것도 좋은 방법입니다. */

    ref.current.style.transition = "none"
    ref.current.style.left = "-100%"
    setTimeout(() => {
      ref.current.style.transition = "left 0.3s"
      ref.current.style.left = "0"
    })

    // 애니메이션 효과 지속시간인 0.3초 뒤에 실제 이동을 처리하고 추가된 가상요소를 삭제해줍니다.
    timer.current = setTimeout(() => {
      setLeft(null)
      setOrder(order => makeLeft(order))
      timer.current = null
    }, 300)
  }

  // 위함수와 거의 유사합니다. 다른점에 대해서만 주석을 달아두었습니다
  const moveRight = () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
      setOrder(order => makeRight(order))
    }
    setOrder(order => {
      setRight(makeRight(order))
      return order
    })
    ref.current.style.transition = "none"
    ref.current.style.left = "0"
    setTimeout(() => {
      ref.current.style.transition = "left 0.3s"
      ref.current.style.left = "-100%" //이동 방향이 반대이므로 위와 다릅니다.
    })
    timer.current = setTimeout(() => {
      setOrder(order => makeRight(order))
      timer.current = null
      //옮기고 나서 left를 -100%에서 0으로 옮겨야합니다. 왜냐하면 남는 컨텐츠가 1개이기 때문입니다.
    }, 300)
  }

  /* 이 이펙트는 moveRight의 마지막 setTimeout이 실행된뒤에 실행됩니다. 
  이 effect가 있는 이유는 오른쪽 이동의 특별한 매커니즘 때문입니다. 
  오른쪽의 경우 요소를 추가한뒤 이동하고 다시 -100 에서 0으로 와야합니다. 
  이때 경우에 따라서 아직 실제 요소로 변경되지도 않았는데, 
  삭제하면 이전요소로 갔다가 다시 현재요소로 오는것같은 깜박거림이 발생합니다. 
  이는 사용자 경험에 좋지 않으므로 삭제하기전에 가상요소와 현재요소를 모두 현재요소로 변경하고, 
  이를 삭제해주어서 문제를 해결하고있습니다. 
  */
  useEffect(() => {
    if (order === right) {
      if (ref.current !== null) {
        ref.current.style.transition = "none"
        ref.current.style.left = "0"
      }
      setRight(null)
    }
  }, [order, right])

  const makeLeft = order => (order === 0 ? 3 : order - 1)
  const makeRight = order => (order === 3 ? 0 : order + 1)

  return (
    <Container>
      <BannerBlock left={left} right={right} order={order} ref={ref}>
        {left ? (
          <Banner color={bannerData[makeLeft(order)]} key={0}>
            {makeLeft(order)}
          </Banner>
        ) : null}
        <Banner color={bannerData[order]} key={1}>
          {order}
        </Banner>
        {right ? (
          <Banner color={bannerData[makeRight(order)]} key={2}>
            {makeRight(order)}
          </Banner>
        ) : null}
      </BannerBlock>
      <Button direction={"left"} onClick={moveLeft}>
        왼쪽
      </Button>
      <Button direction={"right"} onClick={moveRight}>
        오른쪽
      </Button>
    </Container>
  )
}

export default App

const BannerBlock = styled.div`
  width: calc(${props => props.left + props.right + 1}*100vw);
  display: flex;
  position: absolute;
`

// Container, Banner, Button, bannerData 는 위와 동일합니다.
```

> 여기서 애니메이션 지연시간을 0.3초로 줄인 이유는 애니메이션이 끝나기 이전에 클릭할시 지연시간이 짧으면 약간의 부자연스러움이 있기 때문입니다. 글로 설명하기는 어려운 부분이 있어서 궁금하신분은 직접 지연시간을 늘려 테스트 해보시면 좋을것 같습니다.

> moveLeft 혹은 moveRight을 실행하여 setRight 혹은 setLeft를 실행할때, 논리적으로 아래 스타일 코드들이 동기적으로 실행되는것이 아니라 setRight의 결과 요소가 렌더링된 이후 실행되는것이 맞으므로 useEffect를 사용하는것이 좋다고 생각할수도 있습니다. 하지만 실제로 useEffect를 이용해서 left요소를 의존성 배열로 넣어주면 굉장히 빠른 속도로 함수를 실행하였을때 클릭한만큼 실행되지 않는 이슈가 있습니다. 따라서 이를 해결하기위해서 해당함수에서 코드를 실행하여야합니다. 다행히 setState함수는 실제 16.6ms 즉 1프레임 안에는 실행이 보장되고 애니메이션 측면에서 이는 무시할수 있기 때문에 큰 문제는 없습니다.

## GPU를 이용하여 렌더링하기

앞서 요소를 이동하기위해서 position 속성 (left)를 사용하였습니다. 이는 기하학적인 위치변화로 브라우저 입장에서 리플로우 즉 모든 렌더링과정을 반복하는 효과를 발생시키므로 성능상으로 좋지않은 결과를 불러 일으킵니다. 따라서 앞서 position을 변경시키던것을 trasform : traslateX 속성을 사용하면 리플로우 과정의 layout tree와 paint 과정을 생략하고 gpu의 도움을 받아 composite 과정만 수행하므로 position 속성을 사용한것 보다 성능이 훨씬 좋습니다. 따라서 bannerBlock을 아래와같이 수정하면 됩니다.

```javascript
const BannerBlock = styled.div`
  width: 300vw;
  display: flex;
  position: absolute;
  transform: translateX(calc(-${props => props.order}*100vw));
  transition: all 1s;
`
```

> 위 내용을 이해하기위해서는 브라우저의 렌더링 프로세스에 관한 기본적인 이해가 필요합니다. 더 깊이있는 과정이 궁금하시면 아래 포스트를 참고해보세요
> https://d2.naver.com/helloworld/5237120

## 마치며

이번 포스트를 작성하기 이전에 계획하지 않았지만 추가된 항목이 있습니다. 바로 **필요한 요소만 렌더링하기** 항목입니다. 처음에 무한캐러셀은 애니메이션 효과를 보장하기위해 일정시간동안 지연시키는게 맞다고 생각 하였지만, 무한캐러셀 사례를 조사하던중 애니메이션 효과보다 빠르게 클릭하여도 동작하는 무한캐러셀을 발견하였고, 개발자 도구를 통해 아이디어를 얻어서 해당항목을 추가할수 있었습니다.

## 참고자료

<a class="link" href="https://ye-yo.github.io/react/2022/01/21/infinite-carousel.html">무한 슬라이드 만들기 (infinite carousel) + 애니메이션</a>
<a class="link" href="https://nohack.tistory.com/126">Slick 같은 무한 루프 슬라이드 만들기</a>
