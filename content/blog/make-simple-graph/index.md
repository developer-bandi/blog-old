---
title: css를 이용해 간단한 그래프 만들기(feat.styled-components)
date: "2023-03-14T12:11:22.346Z"
description: "styled-component를 이용해 두가지 형태의 그래프를 만들어 봅니다."
category: 트러블슈팅
thumbnail: "../../../static/thumbnail/make-simple-graph.jpg"
---

## 들어가며

간단한 그래프를 만들기위해 도구를 선택한 과정과 이를 구현하기 위한 방법을 공유합니다.

## css-in-css, css-in-js

팀프로젝트를 진행하면서 리뷰의 별점 통계를 보여주는 간단한 그래프를 구현해야했습니다. 그래프를 그려주는 라이브러리를 도입하려다가 정말 간단하다 보니 직접 구현하게 되었습니다.

이과정에서 사용할 css를 정해야했습니다. 팀원간의 협의로 styled-component를 사용하고 있었지만, 만약 scss를 사용하고 있었어도 styled-component를 사용했을것입니다. 왜냐하면 styled-component와 같은 css-in-js는 동적 데이터를 다루는데 아주 적합하기 때문입니다.

이를 쉽게 살펴보기위해서 1부터 5 사이의 값을 받아서 그대로 너비로 만드는 스타일을 만들어보겠습니다. 아래코드를 보시면 되겠습니다.

```css
.box.one {
  width: 1px;
}

.box.two {
  width: 2px;
}

.box.three {
  width: 3px;
}

.box.four {
  width: 4px;
}

.box.five {
  width: 5px;
}
```

```javascript
const Box = styled.div`
  width: ${props => props.width}px;
`
```

scss 같은 css를 사용하면 필요한 너비값에 대한 클래스를 미리 만들어두어야 하며 지금은 5개이지만 구간이 많아지게된다면 사실상 만들수 없습니다. 반면 styled-component는 구간이 많아지더라도 상관 없이 위 코드 하나로 해결할수 있습니다.

## 별이 채워지는 형태의 그래프 만들기

이런 형태의 그래프를 만드는데 가장 핵심적으로 이해해야할 속성은 바로 mix-blend-mode 입니다. 이 속성을 겹치는 요소에 사용하면, 겹치는 부분의 배경색은 두 배경색을 합쳐서 만들어냅니다. 몇가지 속성들이 있는데, 여기서는 color를 사용하였습니다. 큰 이유는 없고 몇가지 설정을 적용해본결과 이 속성을 가지고 합쳤을때 가장 알맞은 화면이 나왔기 때문입니다. 코드로 보면 다음과 같습니다.

```javascript
;<StatusStarBox>
  <StatusStarBase>
    <img src={starImg}></img>
    <img src={starImg}></img>
    <img src={starImg}></img>
    <img src={starImg}></img>
    <img src={starImg}></img>
  </StatusStarBase>
  <StatusStarFill width={(140 * avgrate) / 5} />
  <StatusStarNum>{avgrate}</StatusStarNum>
</StatusStarBox>

export const StatusStarBox = styled.div`
  width: 520px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 14px;
  border-right: 2px solid #cfcfcf;
`

export const StatusStarBase = styled.div`
  z-index: 0;
  padding: 0;
`

export const StatusStarFill =
  styled.div <
  { width: number } >
  `
  background-color: green
  width: 140px;
  position: absolute;
  top: 0;
  right: calc(220px - ${({ width }) => width}px);
  bottom: 0;
  z-index: 1;
  transition: all 0.3s ease-in-out;
  mix-blend-mode: color;
`

export const StatusStarNum = styled.div`
  font-size: 36px;
  font-weight: 700;
`
```

## 막대형 그래프 만들기

막대형 그래프를 만들때는 좀더 쉽게 만들수 있습니다. 그래프 베이스가 되는 막대를 100% 너비로 그려두고 실제 차지하는 너비를 계산해서 새로운 요소를 만들어 위에 올려주기만 하면되기 때문입니다. 간단하기 때문에 코드로 살펴보겠습니다.

```javascript
// 설명을 위해서 하나만 표시하였습니다.
;<StatusGraphLineBox>
  <StatusGraphLineBase></StatusGraphLineBase>
  <StatusGraphLineFill width={width}></StatusGraphLineFill>
</StatusGraphLineBox>

export const StatusGraphLineBox = styled.div`
  position: relative;
`

export const StatusGraphLineBase = styled.div`
  width: 262px;
  height: 6px;
  background-color: gray;
`

export const StatusGraphLineFill =
  styled.div <
  { width: string } >
  `
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 6px;
  background-color: green;
  width: ${props => props.width}%;
`
```

## 마치며

styled-component를 사용하여 간단한 그래프를 구현해보았습니다. 사실 라이브러리를 사용하는 편이 더 간단하고 확실할수 있지만, 프로젝트내에서 그래프를 추가적으로 사용하는 부분이 없어서 직접 구현하였습니다.

만약 팀에서 scss와 같은 css-in-css를 사용하고 있어서 직접 구현하기 어렵다면 이렇게 동적인 데이터가 필요한 부분에 한에서만이라도 css-in-js를 도입해보면 좋을것 같습니다.

## 참고자료

<a class="link" href="https://blogpack.tistory.com/1142">[CSS 고급] mix-blend-mode CSS 속성으로 소수점 단위 별점 구현하기</a>
