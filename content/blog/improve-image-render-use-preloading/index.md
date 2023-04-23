---
title: pre loading을 사용하여 이미지 렌더링 개선하기
date: "2023-03-07T22:43:11.464Z"
description: "이미지가 늦게 로드되어서 이미지가 겹치는 현상을 해결해봅니다"
category: 트러블슈팅
thumbnail: "../../../static/thumbnail/improve-image-render-use-preloading.jpg"
---

## 들어가며

이번 포스트에서는 느리게 로드되는 이미지 때문에, 정보를 보여줄때 버벅거리는 현상을 개선해봅니다.

## 문제상황

포스터 이미지를 보여주는 일종의 캐러셀에서 문제가 발생하였습니다. 이 캐러셀은 5개의 요소를 페이지에 맞게 교체해주면서 동작하고 있습니다. 코드로 보면 다음과 같습니다.

```javascript
cardList.slice(5 * (page - 1), 5 * page).map(card => {
  return <PopularCard card={card} />
})
```

처음에 이미지를 로드하고 다음페이지로 이동할경우 이전 페이지의 이미지를 보여주고 있다가 현재페이지의 이미지를 다 받아왔을 경우 해당 이미지가 적용됩니다. 캐러셀 아래의 텍스트 정보는 이미 변경되어있으므로 잘못된 정보를 제공하는것처럼 보일수 있습니다.

이를 해결하기위해 텍스트 또한 이미지 렌더링 뒤로 미루는 방법을 사용할수도 있었지만, 이는 사용자가 캐러셀 클릭시 이미지를 로드하는 동안 반응을 하지 않는것과 같고 고민해보았을때 더 좋지 못하다고 생각하여 preloading을 적용하였습니다.

## pre loading 사용해보기

pre loading은 말그대로 미리 로드하는 기술입니다. 사실 lazy loading과 같이 사용되는 경우가 많은데, 이미지에 lazy loading을 적용한뒤 스크롤 혹은 전환을 하여 이미지가 보이는 순간보다 조금 빠른시점에 로드하는경우가 많기 때문입니다.

위에서 문제가 발생한 캐러셀의 경우에도 모든 리스트를 처음에 렌더링 하지 않기때문에 일종의 lazy loading이 적용되어 있다고 말할수 있습니다. 따라서 이미지를 일정 페이지 이전에 미리 로드하게 되면 문제를 해결할수 있습니다. 예를들어 1페이지에서 2페이지로 처음 넘어가는순간 3페이지의 이미지를 미리 로드하는것입니다.

이를 코드로 작성해보겠습니다. 처음 데이터를 받아올때는 2페이지의 데이터를 로드해줍니다. 1페이지는 처음 로드할때 알아서 가져오기때문에 따로 로드하지는 않습니다. 이후 페이지를 넘겨줄때 페이지당 한번만 이미지 pre loading이 일어나도록 처리합니다. 여기서 핵심은 로드할때 사용하는 image 객체입니다. 해당 객체는 Image 내장 함수를 사용해서 생성한뒤, src 속성에 주소를 넣어주면 알아서 로드해 캐싱하는 효과를 가지고 있습니다.

```javascript
const MoviePosterCardList = () => {
  const page = useSelector(store => store.mainPosterPage.page)
  const [loadPage, setLoadPage] = useState([]) // 로드된 페이지를 관리하는 상태값 입니다.
  const [cardList, setCardList] = useState({ loading: true, error: false })
  useEffect(() => {
    if (cardList.loading) {
      fetch(`https://movieinfoserver.herokuapp.com/home`)
        .then(response => response.json())
        .then(data => {
          setCardList({ loading: false, error: false, content: data })
          // 처음엔 두페이지를 가져와야합니다.
          loadPage[1] = 1
          loadPage[2] = 1
          setLoadPage([...loadPage])
          data.slice(0, 10).forEach(({ posterPath }) => {
            const image = new Image() // 이미지 객체를 선언합니다
            image.src = `https://image.tmdb.org/t/p/w500${posterPath}` // 이런식으로 src 프로퍼티에 주소를 넣으면 이미지를 로드해 캐싱합니다.
          })
        })
        .catch(() => {
          setCardList({ loading: false, error: true })
        })
    }
  })

  const changePage = direction => {
    // 페이지별로 한번만 로드하도록 조건처리 합니다.
    if (page + 2 !== 1 && page + 2 <= Math.ceil(cardList.content.length / 5)) {
      loadPage[page + 2] = 1
      cardList.content
        .slice((page + 1) * 5, (page + 2) * 5)
        .forEach(({ posterPath }) => {
          const image = new Image()
          console.log(posterPath)
          image.src = `https://image.tmdb.org/t/p/w500${posterPath}`
        })
      setLoadPage([...loadPage])
    }
  }
}
```

## 마치며

이번 포스트에서는 pre loading을 이용하여 이미지를 미리 로드함으로써 사용자 경험을 저해하는 문제를 해결할수 있었습니다.

초기 로드속도를 보장하기 위해서 lazy loading을 적용하였더라도 정작 필요한 이미지가 로드되지 않아서 구조가 깨지거나 다른 이미지가 들어있는 현상이 발생하는경우 적절하게 이미지를 미리 로드하여 사용자경험을 보장하는것이 좋은선택이 될수 있을것 같습니다.

## 참고자료

<a class="link" href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image">Image() - Web APIs|MDN</a>
