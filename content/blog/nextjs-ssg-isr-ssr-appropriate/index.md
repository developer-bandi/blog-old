---
title: Next.js 의 SSG, SSR, ISR를 적절하게 이용하여 UX 개선하기
date: "2023-01-25T22:12:03.284Z"
description: "Next.js에서 pre-render를 효율적으로 적용하는 방식에 대해서 알아봅니다."
category: 트러블슈팅
thumbnail: "../../../static/thumbnail/nextjs-ssg-isr-ssr-appropriate.jpg"
---

## 들어가며

Next.js는 react를 기반으로 만들어진 프레임워크입니다. 파일 기반의 routing시스템, image 및 font 최적화등의 다양한 기능이 있지만, Next.js를 사용하는 이유는 쉽게 서버사이드 렌더링을 할수 있기 때문입니다. 이번 포스트에서는 Next.js에서 서버사이드 렌더링을 위해 제공하는 함수를 살펴보고 이를 적절하게 사용하기위해 고민했던 내용들을 공유합니다.

## pre-render 란?

일반적으로 react 프로젝트는 모든 자바스크립트 파일을 불러온뒤 이를 브라우저에서 해석하여 html파일로 만드는 클라이언트 사이드 렌더링을 이용합니다. 하지만 이로인해 처음 받는 html 파일에는 root를 위한 div 태그하나만 있기 때문에, 검색엔진에의해 노출될 가능성이 낮아지고, 처음 자바스크립트를 해석하는 동안 빈페이지를 보는 시간이 길어지기 때문에 사용자 유입이 떨어질수 있습니다.

이를 방지하기 위해서 미리 서버에서 html 파일을 만들고 이를 전송해주는 서버사이드 렌더링 방식이 사용됩니다. next.js 에서는 이를 pre-render라고 이야기하며, 이를 사용하게 되면 내용이 들어있는 html을 받을수 있기 때문에 위에서 언급한 문제를 해결할수 있습니다. next.js 에서는 pre-render를 위해 4가지 방식을 제공하고 있습니다.

## pre-render을 위한 함수

### static page

page에 어떠한 pre-render 함수를 명시하지 않으면 기본적으로 Next.js는 페이지를 html 파일로 만들어 정적 파일형태로 보관하고 이후 요청시 해당 파일을 제공합니다. 따라서 이는 pre-render의 기본값이라고 볼수 있습니다

### SSG

빌드 타임에 html 파일을 생성하여 사용자가 요청시 해당 html을 내려주므로 초기 렌더링 속도가 굉장히 빠릅니다. next.js 팀에서는 해당 방식을 기본으로 권장하고 있습니다.

```javascript
export default function SSG({ data }: SSGPageProps) {
  return (
    <main>
      <div>{data}<div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await axios.get('http://localhost:8000');

  return {
    props: { data: res.data},
  };
};
```

### SSR

사용자가 데이터를 요청할때마다 html을 동적으로 생성하여 내려주기 때문에 속도가 느리지만, 항상 최신의 데이터를 내려줄수 있습니다. next js 팀에서는 속도가 느리다는 문제 때문에 최신 데이터가 필요한 상황에서만 사용할 것을 권장하고 있습니다.

```javascript
export default function SSR({ data }: SSRPageProps) {
  return (
    <main>
      <div>{data}<div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await axios.get('http://localhost:8000');

  return {
    props: { data: res.data},
  };
};
```

### ISR

빌드 시점에 페이지를 만들어 저장해두고 설정한 시간 마다 페이지를 새로 만들어 저장하는 방식입니다. SSG에 일정 시간마다 데이터 갱신이 가능한 장점이 추가된 방식입니다. SSG와 동일한 함수를 사용하며 revalidate에 갱신하고자하는 시간을 초단위로 명시하게되면 ISR로 동작합니다.

```javascript
export default function ISR({ data }: SSRPageProps) {
  return (
    <main>
      <div>{data}<div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await axios.get('https://worldtimeapi.org/api/ip');

  return {
    props: { dateTime: res.data.datetime },
    revalidate: 20,
  };
};
```

## pre-render 적절하게 사용하여 UI/UX 개선하기

앞서 pre-render 들은 모두 장단점이 있다고 설명하였습니다. 따라서 이러한 함수들을 적절하게 사용해야 seo와 초기 속도 모두 챙길수 있습니다. 아래에서는 pre-render 함수를 적절하게 사용해 사용성을 개선한 이야기를 다룹니다.

### SSR 대신 ISR을 사용할수 있는지 고려하기

Home 페이지에서는 배너, 랭킹, 리뷰 컴포넌트가 데이터를 필요로 하였습니다. 리뷰의 경우 SEO가 필요하지 않아서 CSR방식을 고려하였습니다. 남은것은 배너와 랭킹인데, Next.js에서는 한페이지에 동일한 pre-render함수를 사용하여야하므로 처음에는 SSR을 사용하였습니다. 하지만, 랭킹데이터가 유저요청시마다 갱신될 필요는 없다고 생각하여 1일을 단위로 갱신되는 ISR을 사용하였고 이를 통해 초기로드시간을 2초가량 줄일수 있었습니다.

### pre-render가 꼭 필요한곳에 SSR 사용하기

Next.js를 도입하기로 결정했을때에도 모든페이지가 검색엔진에 수집될 필요는 없다고 생각하였습니다. 따라서 Home의 리뷰 같은 정보나 Next.js공식문서에도 권고하고 있는 것처럼 마이페이지 부분에서는 SSR을 적용하지 않고, 모든 데이터를 CSR 방식으로 받아오도록 하여 초기 로드 속도를 개선할수 있었습니다.

### ssr 적용시 로딩 사용하기

커뮤니티의 포스트리스트를 보여주는 페이지와 포스트 자체를 보여주는 페이지는 매번 새로운 데이터를 불러와야하는데 SEO를 고려해야했기에 SSR이 불가피하였고 이를 적용하니 대략 2초정도의 로드시간이 소요되었습니다. 2초의 로드시간도 문제가 있지만, 더큰 문제는 로딩하는 동안 아예 화면이 멈춘것처럼 보였기에, 아래 코드를 활용하여 로딩을 하는 시간동안 로딩중이라는 문구를 띄워서 현재 데이터를 받아오고 있음을 유저에게 알려주었습니다.

```javascript
// page의 _app.tsx(jsx) 파일에 적용해야합니다. 왜냐하면 모든 페이지 컴포넌트가 이 컴포넌트를 거쳐서 렌더링 되기 때문입니다.
function MyApp({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const showRoute = ["/postlist", "/postdetail"]
    const start = (url: string) => {
      if (showRoute.find(route => String(url).includes(route))) {
        setLoading(true)
      }
    }
    const end = (url: string) => {
      if (showRoute.find(route => String(url).includes(route))) {
        setLoading(false)
      }
    }
    Router.events.on("routeChangeStart", start)
    Router.events.on("routeChangeComplete", end)
    Router.events.on("routeChangeError", end)
    return () => {
      Router.events.off("routeChangeStart", start)
      Router.events.off("routeChangeComplete", end)
      Router.events.off("routeChangeError", end)
    }
  }, [])
  return <>{loading ? <h1>Loading...</h1> : <Component {...pageProps} />}</>
}
```

> 위 코드에서는 여러페이지에 공통으로 적용되는 로딩 스피너를 만들었지만, start, end 이벤트 리스너와 state를 수정해서 여러페이지 각각에 적용되는 로딩스피너를 만들수도 있습니다.

## 마치며

Next.js는 React에서 서버 사이드 렌더링을 보다 편리하게 할수 있도록 도와주는 프레임워크입니다. React에서는 꽤 복잡하게 설정해야하는 SSG, ISR, SSR 같은 방식을 함수로 제공하고 있기 때문입니다.

다만 모든 도구가 그렇듯 적절하게 사용하게되면 더 큰 효율을 보여주기에, pre-render 함수를 적용할때 한번더 고민한다면 더 좋은 웹서비스를 제공할 수 있지 않을까 생각합니다.

## 참고자료

<a class="link" href="https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props">Data Fetching: getServerSideProps</a>
<a class="link" href="https://www.tiluckdave.in/blog/ssr-ssg-isr">What are SSR, SSG and ISR in NextJs?</a>
<a class="link" href="https://velog.io/@hwon3814/NextJS-SSR-%EB%A1%9C%EB%94%A9-%EC%8A%A4%ED%94%BC%EB%84%88">NextJS SSR 로딩 스피너</a>
