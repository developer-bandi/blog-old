---
title: webpack 과 babel을 이용하여 프로젝트 세팅하기
date: "2023-04-17T20:35:20.114Z"
description: "create-react-app 대신 webpack과 babel을 사용해 프로젝트를 세팅해봅시다"
category: 기술아티클
---

## 시작하며

보통 React 프로젝트를 시작할때 Create React App(이하 CRA)을 많이 사용합니다. 해당 명령어 하나만으로 기본적인 프로젝트 초기환경을 설정할 수 있기 때문입니다. 하지만 사용하지 않는 불필요한 모듈도 담고 있어 용량이 커지고, 커스터마이징 하기도 불편하다는 단점이 있습니다. 따라서 이번 프로젝트에서는 CRA를 이용하지 않고 Webpack 과 Babel을 이용하여 React 프로젝트를 세팅하는 방법을 알아봅니다.

## Wepback 과 Babel이란?

### Webpack

흔히 자바스크립트 파일을 작성할때 기능이 적지 않다면 하나의 파일에 작성하지 않고 여러파일에 특정단위로 나누어 작성하게 됩니다. 여러 파일을 만들고 이를 불러오려면 TCP 연결이 많이 필요하기 때문에 많은 네트워크 리소스를 소모하기 때문입니다. 이러한 문제를 해결하고자 등장한것이 webpack입니다.

js, css, html 등의 모든 파일들을 모듈이라고 하며 웹팩은 이들의 연관관계를 파악하여 각 확장자별로 하나의 파일로 만들어 냅니다. 이를 번들링이라고 합니다. 따라서 Webpack은 모듈들을 하나로 합쳐준다는 의미의 모듈 번들러 라고 부릅니다. 물론 이밖에도 tree shacking, code spliting 및 lazy loading등의 기능이 있지만, 핵심은 위와 같습니다.

### 바벨

기본적으로 모든 브라우저가 자바스크립트 최신문법을 지원하면 좋겠지만 브라우저 종류나 버전에 따라 최신문법을 사용할 수 없는 경우가 있습니다. 따라서 개발자는 이러한 상황에 대비해서 최대한 방어적으로 코드를 작성하려면 모든 브라우저에서 가능한 이전 문법을 사용하거나, 브라우저 버전에 따라서 다른 코드를 작성해야할것입니다. 바벨은 이러한 문제를 해결하기위해 등장하였습니다.

바벨은 자바스크립트 코드를 읽어 추상구문트리(AST)로 변환하여 다양한 작업을 할수있게 해주는 도구로 보통 이전 문법만을 지원하는 브라우저에서 잘 동작하도록 코드를 이전문법으로 변환해주는 기능을 많이 사용합니다. 하지만 react에서 createElement를 이용하여 작성하기 어려운 부분을 해결하기위해 jsx를 사용할수있도록 jsx를 createElement 로 변환해주는 기능이나, 타입스크립트 파일을 자바스크립트로 변환해주는 기능도 수행할수 있습니다.

> 웹팩과 바벨에대해서 보다 깊은 이해가 필요하신분은 아래링크를 참고해보시면 좋을것 같습니다</br> https://joshua1988.github.io/webpack-guide/guide.html </br> https://mhk-bit.medium.com/babel-under-the-hood-63e3fb961243

## 프로젝트 세팅하기

### 프로젝트 초기화

가장먼저 해야할 일은 바로 package.json 파일을 만드는것입니다. package.json 파일은 프로젝트가 이용하는 다른 라이브러리 의존성과 프로젝트 설명이 담겨있는 문서파일입니다. 직접 작성할수도 있지만, 틀을 만들어주는 npm 명령어가 있으므로 이를 이용해 보겠습니다.

```
npm init
```

> pacakage.json 과 pacakage-lock.json 의 차이에 대해 궁금하실수 있습니다. 이둘의 차이는 정확한 버전을 명세하는지 아닌지의 차이입니다. 더 궁금하신분은 아래 링크를 참고해보세요
> https://velog.io/@songyouhyun/Package.json%EA%B3%BC-Package-lock.json%EC%9D%98-%EC%B0%A8%EC%9D%B4

### git 초기화

이번엔 git 관련 설정을 해보겠습니다. 먼저 git --init을 통해서 .git 폴더를 만들어줍니다. 해당폴더는 기본적으로 숨김처리 되어있으므로 실행한다고 결과가 표시되지는 않습니다

```
git --init

```

그다음에는 .gitignore 파일을 만들어 git이 관리하지 않을 파일을 설정해줍니다. 보통 의존성 모듈인 node_modules 폴더, 빌드결과가 담긴 폴더, 환경변수를 명시한 파일등을 명시합니다. git에서 제외할 파일과 표기하는 방식은 프로젝트에 따라 달라지기 때문에 여기서는 가장 일반적인 방법으로 node_modules, build 폴더와 .env 파일을 제외하도록 하겠습니다.

```
//.gitignore
git --init
/node_modules
/build
.env
```

> [여기서](https://github.com/github/gitignore) 다양한 템플릿을 확인해보세요

### 타입스크립트 설정하기

보통 react 프로젝트를 진행하게 되면 typescript를 세팅하게 됩니다. 가장 기본적인 방법은 타입스크립트를 설치하고, tsc로 컴파일 하는것입니다. 이때 설정파일로는 tsconfig.json를 루트 디렉토리에 만들어주시면됩니다.

```
npm i -D typescript
혹은
npm i -g typescript // 전역에 설치하는 설정으로 npx 없이 tsc를 사용할수 있습니다.

```

```json
// tsconfig.json
{
  "compilerOptions": {
    "esModuleInterop": true, // commonjs 모듈을 es6 모듈로 가져오는것을 허용하는 설정
    "target": "es5", //변환할 자바스크립트 버전
    "module": "CommonJS", // 사용할 모듈 시스템
    "jsx": "react-jsx", // jsx 타입을 위한 설정
    "noEmit": true // 결과물을 만들어낼것인지 결정하는 설정
  },
  "include": ["src/*"] // 어디에 위치한 ts 파일을 트랜스컴파일 할것인지
}
```

설정파일을 만들기위해서 tsc --init 을 사용할수도 있지만, 많은 설정을 모두 파악할수 없으므로 기본적인 설정만 직접 추가하였습니다. 이렇게 설정을 하고나면, src 폴더에 임의의 ts 파일을 하나 만들고 tsc 명령어를 사용해 컴파일 해봅시다. 이때 일부러 타입오류를 내면(물론 vscode가 이전에 잡아줍니다) 컴파일할때 오류가 발생하는것을 볼수 있습니다.

```
npx tsc
혹은
tsc
```

### babel 설정하기

babel을 설정하는 방법에는 preset 과 plugin 두가지가 있습니다. plugin은 babel를 동작시키면서 변환할 규칙들이고 preset은 자주사용하는 plugin을 모아 묶음으로 만들어 둔것입니다. 이번 프로젝트에서는 react, typescript를 사용하고, 스타일을 위해 styled-component를 사용해볼 계획이므로 아래 설정을 추가해주시면됩니다.

```
npm i -D @babel/core @babel/plugin-transform-react-jsx @babel/plugin-transform-runtime @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/runtime-corejs3 babel-plugin-styled-components

//babel.config.json
{
  "presets": [
    "@babel/preset-env",
    [
      "@babel/preset-react",
      {
        "runtime": "automatic" // jsx를 변환하는 함수를 자동으로 import 해주는 설정입니다.
                              //자세한 내용은https://babeljs.io/docs/babel-plugin-transform-react-jsx를 참고해보세요
      }
    ],
    "@babel/preset-typescript"
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime", // 폴리필을 추가하는 플러그인 입니다.
      {
        "corejs": 3,
        "regenerator": true
      }
    ],"babel-plugin-styled-components"
  ]
}
```

> 여기서는 바벨을 webpack과 함께 사용할 예정이라 babel을 명령어로 실행하지는 않겠지만, babel도 명령어를 이용해서 수행할수 있습니다. @babel/cli 패키지를 설치하시고, babel 명령어를 통해 npx babel src/test.ts 를 입력하시면 콘솔창에서 변환된 결과를 확인할수 있습니다.

#### babel vs tsc

여기서 typescript에 관한 설정을 찾을수 있는데, 이는 typescript를 설정하는 방식이 두가지라서 그렇습니다. 첫번째 방식은 앞서 설정한 방식이고, 두번째 방식이 바벨을 이용한 방식입니다. 두가지는 장단점이 있는데, tsc 명령어를 이용할 경우 이전처럼 컴파일 오류가 나면 이를 검출해줍니다. 하지만 바벨은 typescript 코드를 만나면 이를 단순히 제거하기 때문에 컴파일 오류를 잡을수는 없습니다. 따라서 정리하면 tsc는 속도가 느린대신 오류를 잡아주고, babel은 속도가빠른대신 오류를 잡아주지 않습니다.

이러한 특징때문에 tsc로 typescript파일을 컴파일하고 이후에 babel로 코드를 변환하는 절차를 거칠수도 있지만, 가장 보편적인 방법은 babel에 typescript 설정을 포함해 컴파일은 babel로 하면서 병렬로 tsc를 수행하여 타입검사를 하게 됩니다. 물론 vscode등의 에디터가 타입체크를 잘 수행하고 있기 때문에 tsc를 매번 수행하지 않을수도 있습니다.

> 바벨 설정파일을 만들때 .babelrc, babel.config.json, babel.config.js 세가지 방법이 있습니다. 큰차이는 아니지만 궁금하신분은 아래 링크를 참고해보세요
> https://kschoi.github.io/cs/babel-config-js-vs-babelrc/

### webpack 설정하기

webpack의 설정파일을 살펴보기에 앞서 간단하게 구성을 알아보겠습니다. 진입점에 해당하는 entry와 출력할 output이 기본적으로 있으며 크게 중요한것은 module 과 plugin입니다. module의 경우 webpack이 번들링을 수행할때 적혀있는 확장자를 만나면 어떤 loader를 이용해 처리할지 결정합니다. plugin의 경우 webpack이 번들링 작업을 종료하고 마지막에 할 작업들을 명시합니다. devServer는 우리가 흔히 react를 npm start를 통해 동작시키는 개발서버를 세팅하는 설정을 말합니다. 설정에 앞서 먼저 webpack 의존성과 실제 사용할 모듈 의존성, 타입을 설치하겠습니다.

```
npm i -D webpack webpack-cli webpack-dev-server file-loader html-webpack-plugin dotenv clean-webpack-plugin babel-loader
npm i -D @types/react @types/react-dom @types/styled-components
npm i react react-dom styled-components
```

```js
const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const dotenv = require("dotenv")

module.exports = env => {
  const { DEV } = env
  if (DEV) {
    dotenv.config({ path: "./dev.env" })
  } else {
    dotenv.config({ path: "./production.env" })
  }

  return {
    mode: DEV ? "development" : "production", // 현재 빌드 환경을 설정합니다
    entry: {
      main: "./src/index.tsx", // 초기 진입점 설정
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"], // 확장자 추론시 가능한 리스트
    },
    module: {
      rules: [
        // 바벨을 적용할 파일들
        {
          test: /\.(js|jsx|ts|tsx)$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        // 이미지 파일에 적용하는 로더
        {
          test: /\.(jpg|gif|png|svg)$/,
          use: [
            {
              loader: "file-loader",
              options: {
                // publicPath: "./dist/",
                name: "[name].[ext]",
                outputPath: "images",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      // 빌드이후 문구를 표시할수 있는 기능
      new webpack.BannerPlugin({
        banner: `빌드 날짜: ${new Date().toLocaleString()}`,
      }),
      //html파일도 같이 넣어주는 기능
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        // favicon: "./public/favicon.ico",
      }),
      // 웹팩실행전 output폴더를 정리해주는 기능
      new CleanWebpackPlugin(),
      // Node.js 환경변수를 브라우저에서도 사용할수 있도록 변경해주는 기능
      new webpack.DefinePlugin({
        "process.env.API_SERVER": JSON.stringify(process.env.API_SERVER), // env에서 읽은 ip를 저장
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "build"),
      },
      port: 8080,
      open: true,
      client: {
        overlay: true, // 에러발생시 화면에 ui로 표기
        progress: true, // 빌드 진행률 표기
      },
      historyApiFallback: true, //라우터 변경시 바로 진입가능하도록 하는 설정
    },
    output: {
      publicPath: "/",
      path: path.join(__dirname, "build"),
      filename: "[name].js",
    },
  }
}
```

### 편리한 사용을 위해 package.json의 script 설정하기

앞서 만든 webpack 설정이 제대로 동작하는지를 확인하기위해서는 빌드를 해보고, 개발 서버를 돌려보아야합니다. 먼저 자유롭게 src폴더에 index.tsx, app.tsx index.html 파일을 만들고 간단한 react 프로젝트를 생성합니다. 아래는 예시입니다

```javascript
//index.tsx
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<App />);

//app.tsx
import styled from "styled-components";

const App = () => {
  return (
    <AppLayout>
      <AppTitle>안녕하세요</AppTitle>
      <AppContent>본문입니다 반복됩니다 본문입니다 반복됩니다</AppContent>
    </AppLayout>
  );
};

export default App;

const AppLayout = styled.main`
  margin: 300px auto 0 auto;
  border: 1px solid black;
  width: 500px;
  height: 500px;
`;

const AppTitle = styled.h1``;

const AppContent = styled.p``;

// index.html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>settingTest</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

이후 빌드한 파일을 로컬에서 실행하기위해서 express 서버를 세팅합니다.

```
npm i -D express
```

```javascript
const express = require("express")
const path = require("path")
const app = express()

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./build/index.html"))
})

app.get("/main.js", function (req, res) {
  res.sendFile(path.join(__dirname, "./build/main.js"))
})

app.listen(3001)
```

이제 package.json 의 script에 다음 네가지 설정을 추가합니다. 하나씩 검토해보겠습니다.

```
"scripts": {
  "tsc": "npx tsc",
  "start": "node server.js & open 'http://localhost:8000'",
  "dev": "webpack serve --env DEV=true",
  "build": "webpack --env DEV=false & tsc"
},
```

- tsc : 타입 검사를 위해서 실행합니다 결과물은 나오지 않도록 설정합니다.
- start : webpack이 만든 결과물을 실행하기위해 서버를 백그라운드에서 열고, 브라우저를 해당주소로 엽니다
- dev : webpack 개발서버로 빌드된 결과물을 실행합니다
- build : webpack 으로 production 결과물을 빌드하고, 동시에 타입을 검사합니다.

## 마치며

이번 포스트에서는 CRA을 이용하지 않고 Webpack 과 Babel를 이용하여 개발환경을 구축해보았습니다. CRA 보다 복잡하지만 원하는대로 세팅을 구성할수 있기 때문에 프로젝트의 복잡성이 높아진다면 CRA 대신 Webpack 과 Babel을 이용해 프로젝트의 성격에 맞는 환경을 설정하는것이 중요합니다.

한편 Webpack Babel은 빌드 속도가 느리다는 단점이 있어서 최근에는 이를 해결하기위해 네이티브 언어를 이용해 속도를 개선한 vite, turbopack등의 라이브러리들이 등장하고 있습니다. webpack과 babel을 직접 사용해보시고, 속도가 느리다고 생각이 든다면 이러한 라이브러리를 살펴보는것도 좋을것 같습니다.

## 참고자료

<a class="link" href="https://velog.io/@songyouhyun/Package.json%EA%B3%BC-Package-lock.json%EC%9D%98-%EC%B0%A8%EC%9D%B4">Package.json과 Package-lock.json의 차이를 아시나요?</a>
<a class="link" href="https://nochoco-lee.tistory.com/46">.gitignore 파일을 이용하여 파일과 디렉토리를 ignore 처리하기</a>
<a class="link" href="https://joshua1988.github.io/webpack-guide/guide.html">웹팩 핸드북</a>
<a class="link" href="https://mhk-bit.medium.com/babel-under-the-hood-63e3fb961243">Babel under the hood.</a>
<a class="link" href="https://www.daleseo.com/tsc/">타입스크립트 컴파일러 사용법 (tsc 커맨드)</a>
<a class="link" href="https://kschoi.github.io/cs/babel-config-js-vs-babelrc/">babel.config.js 파일과 .babelrc 차이점</a>
<a class="link" href="https://babeljs.io/docs/babel-plugin-transform-react-jsx">@babel/plugin-transform-react-jsx</a>
<a class="link" href="https://opentutorials.org/module/2538/15818">연속적으로 명령 실행시키기 (;과 &와 &&의 차이)</a>
