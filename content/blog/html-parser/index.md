---
title: 브라우저는 HTML을 어떻게 읽어낼까?
date: "2023-04-13T10:44:10.364Z"
description: "HTML Parser를 직접 만들어보면서 브라우저의 HTML Parsing 과정을 이해해 봅니다."
category: 기술아티클
thumbnail: "../../../static/thumbnail/html-parser.jpg"
---

## 들어가며

HTML은 레이아웃을 작성하기 위한 마크업 언어입니다. 굉장히 쉬운 언어이지만, 이를 파싱해 화면에 보여지기까지의 과정은 작성하는것만큼 간단한것은 아닙니다. 이러한 과정을 이해하고 있다면 브라우저의 렌더링에 대한 이해도를 높일수 있으므로 직접 HTML Parser를 구현해보면서 브라우저가 HTML을 어떻게 해석하고 DOM으로 만들어내는것인지 알아보고자합니다.

이번 포스트의 목표는 아래 HTML 코드를 DOM Tree(Object)로 변환하는것입니다. 한가지 기억하고 넘어가실 부분은 div태그에 닫힘태그가 없다는것입니다. 문법에 맞지않지만 일반적으로 이러한 태그는 알아서 닫아주기 때문에 이부분까지 구현해보려고합니다.

```javascript
<html>
  <head></head>
  <body>
    <div id="root" class="rootClass">hello
  </body>
</html>

// 원래 html은 문자열입니다.
const html =
  '<html><head></head><body><div id="root" class="rootClass">hello</body></html>';
```

## Html의 특징

HTML(HyperText Markup Language)은 웹 콘텐츠의 의미와 구조를 정의하는 일종의 마크업 언어입니다. 이 마크업 언어의 중요한 특징중 한가지는 오류에 굉장히 관대하다는 점입니다. 열린 태그혹은 닫힘 태그만 작성하거나, 닫힘을 잘못 설정하더라도 오류를 발생시키지 않고 최대한 이를 수정하여 화면을 보여주려고합니다.

이러한 특징때문에 HTML은 문맥 자유 언어 라고 불리는 Javascript, C 와같은 일반적인 프로그래밍 언어와 동일한 방식으로 파싱할수 없고, HTML만의 파서를 사용해야합니다.

## Parsing 단계

[파싱단계](./parsingStep.png)

1. Bytes: 네트워크 통신으로 받은 데이터
2. Characters: 2진수로 표현된 데이터가 변환된 데이터
3. Tokens: 문자열을 의미에 맞는 토큰으로 변환한 데이터
4. Nodes: 토큰을 해석해 만들어진 노드
5. Dom: 노드들의 관계를 해석해 만들어진 트리

네트워크 통신의 결과 받은 이진수를 실제 문자열로 변환하는 과정은 생략하고, 만들어진 문자열을 이용하는 단계부터 시작하겠습니다. 문자열을 토큰으로 만드는 기능을 하는 도구를 Tokenizer 라고 하고 이 토큰을 이용해 노드를 만들고 Dom Tree를 만드는 기능을 하는 도구를 TreeBuilder라고 부르며 이 두가지가 Parsing 알고리즘의 핵심입니다.

> 실제로는 Tokenizer-> TreeBuilder 의 과정이 토큰 하나당 실행되고, 이때 script 토큰을 만나서 dom 요소가 추가되는경우 다시 Tokenizer 과정이 수행되지만 이해를 위해서 순차적으로 실행되며 다시 되돌아가는 경우도 없다고 가정하겠습니다.

## Tokenizer

Tokenizer는 현재 파싱이 진행중인 문자열의 상태를 나타내기위한 상태값(dataState, tagOpenState, tagNameState), 토큰정보를 저장하기 위한 값, 태그의 속성을 다루기위한 값과 이를 저장하기위한 값 총 네가지 값을 가지고 있습니다. 그리고 만들어진 토큰을 바로바로 내보내지 않고 모아서 내보내기 때문에, 이를 저장할 배열도 하나 필요합니다.

```javascript
// constant.js
const DATA_STATE = "dataState"
const TAG_OPEN_STATE = "tagOpenState"
const TAG_NAME_STATE = "tagNameState"

const START_TOKEN = "startToken"
const END_TOKEN = "endToken"
const TEXT_TOKEN = "textToken"

// tokenizer.js
const tokenizer = html => {
  const tokens = []
  let status = DATA_STATE
  let curToken = {}
  let attributeMode = false
  let attributeKeyValue = ""
}
```

처음 상태는 dataState로 시작합니다. 이후 < 문자를 만나게 되면 TagOpenState로 변하게됩니다. < 이후 문자가 a-z 인경우 startToken을 생성하고 상태는 TagNameState로 변하게 됩니다.

이후 > 문자를 만나게되면 현재 토큰이 발행되어 tokens 배열에 담기게 되고 다시 상태는 dataState로 돌아갑니다. 이러한 과정을 반복하면서 초기 태그를 만들어낸뒤, dataState상태에서 a-z사이의 문자를 만나게되면 text 토큰에 해당하므로 TextToken을 생성하고 < 문자를 만날때 발행합니다.

열림 문자(<)를 만났을때 다음 문자가 a-z가 아닌 /인 경우 endToken을 생성하고 TagNameState로 변경됩니다. 이후 > 문자를 만날때까지 진행되다가 endToken을 발행합니다.

한편 속성값의 경우 TagNameState일때 공백을 만나면 속성값 읽기 모드 값이 true가 됩니다. 이 상태에서들어오는 공백과 값을 구분하는 따옴표를 제외한 문자는 attributeKeyValue 변수에 담기게 됩니다. 이후 값을 담은뒤 공백이나 >문자 를 만나면 이 속성을 curToken에 넣어줍니다.

```javascript
// tokenizer.js
...
const tokenizer = (html) => {
...
  for (let i = 0; i < html.length; i++) {
    if (status === TAG_OPEN_STATE) {
      // 태그가 열려있을때 문자열은 / 또는 a-z의 문자열입니다.
      if (html[i] === "/") {
        // /로 시작하는경우 닫힘 태그 입니다.
        curToken.type = END_TOKEN;
        curToken.tagName = "";
      } else {
        // a-z로 시작하는경우 시작 태그 입니다.
        curToken.type = START_TOKEN;
        curToken.tagName = "";
        curToken.tagName += html[i];
      }
      // 이름이 기록되기 시작하므로 태그이름상태로 변경합니다.
      status = TAG_NAME_STATE;
    } else if (status === TAG_NAME_STATE) {
      // 닫힘 태그일경우 담긴 속성과 토큰을 발생합니다.
      if (html[i] === ">") {
        status = DATA_STATE;
        if (attribute && attributeKeyValue !== "") {
          const [key, value] = attributeKeyValue.split("=");
          curToken[key] = value;
          attribute = false;
          attributeKeyValue = "";
        }
        tokens.push(curToken);
        curToken = {};
        continue;
      }

      // 속성값을 표기하기 시작하는 공백이 들어올경우 속성 기록 모드를 활성화하고, 이전에 담긴 속성이 있으면 기록합니다.
      if (html[i] === " ") {
        attribute = true;
        if (attributeKeyValue !== "") {
          const [key, value] = attributeKeyValue.split("=");
          curToken[key] = value;
          attributeKeyValue = "";
        }
      }

      // 속성 기록 모드 일경우 문자열과 공백을 무시하고 문자를 속성키값에 넣습니다.
      if (attribute) {
        if (html[i] === '"' || html[i] === " ") continue;
        attributeKeyValue += html[i];
      } else {
        curToken.tagName += html[i];
      }
    } else {

      if (html[i] === "<") {
        // 데이터 상태일때 열림태그이고 만든 텍스트 토큰이 있는경우 발행합니다.
        if (curToken.type === TEXT_TOKEN) {
          curToken.content = curToken.tagName;
          delete curToken.tagName;
          tokens.push(curToken);
          curToken = {};
        }
        // 태그 열림 상태로 변경합니다.
        status = TAG_OPEN_STATE;
      } else {
        // 데이터 상태에서 열림 태그가 아니라면 텍스트 토큰이므로 초기화를 여부를 따진뒤 값을 할당합니다.
        if (curToken.type !== TEXT_TOKEN) {
          curToken.type = TEXT_TOKEN;
          curToken.tagName = html[i];
        } else {
          curToken.tagName += html[i];
        }
      }
    }
  }
  return tokens;
};
```

이 코드에 위 html 문자열을 넣어 얻게된 값을 확인해보면서 다음 단계로 넘어가보겠습니다. 객체의 각 키값에 대해서는 직관적으로 이해할수 있을것 같습니다. 한가지 기억하면 좋을부분은 textToken의 경우 content에 텍스트가 들어가며, attribute는 type, tagName처럼 객체에 키-값 형태로 들어가게됩니다.

```javascript
;[
  { type: "startToken", tagName: "html" },
  { type: "startToken", tagName: "head" },
  { type: "endToken", tagName: "head" },
  { type: "startToken", tagName: "body" },
  {
    type: "startToken",
    tagName: "div",
    id: "root",
    class: "rootClass",
  },
  { type: "textToken", content: "hello" },
  { type: "endToken", tagName: "body" },
  { type: "endToken", tagName: "html" },
]
```

## TreeBuilder

TreeBuilder는 스택을 이용해서 토큰을 노드로 만들고 DOM Tree에 삽입합니다. 이때 들어온 토큰들 중에 중첩이나 종료되지 않은 태그의 경우 종료시키면서 노드로 만들어줍니다. 먼저 document노드 생성해 스택을 초기화합니다. 그다음부터 토큰을 차례로 읽어내려 가면서 경우에 따라 다른 조건을 적용합니다.

토큰이 시작 토큰일경우, 해당 tagName을 가지는 노드를 생성합니다. 그리고 이 노드를 스택의 가장 위에 위치한 바로위 부모의 자식 요소의 배열에 추가해줍니다. 그다음, 이 요소도 스택에 push 합니다. 이때 토큰이 img, hr, br 같이 내용이 없는 단일 태그일경우 자식 요소가 없기 때문에 스택에 넣지 않습니다.

토큰이 끝 토큰일경우 먼저 스택의 마지막 요소를 점검하여 토큰과 같은지 검사합니다. 같은경우 그대로 스택에서 요소를 제거하고 노드가 완성됩니다. 이때 같지 않은경우 개발자가 실수로 태그 규칙을 어긴 상황입니다. 여러 예외처리를 구현할수 있는데 여기에서는 간단하게 닫힘태그가 없는 상황에 대해서 닫힘태그를 만들어 주도록 구현해두었습니다. 따라서 같은 태그가 나올때까지 반복문을 돌려 스택에서 요소를 빼내도록 구현하였습니다.

토큰이 텍스트 토큰일 경우 노드를 만든뒤, 스택의 가장위에 위치한 바로위 부모의 자식요소의 배열에 넣어주기만 하면됩니다. 왜냐하면 이 노드는 자식요소가 없기 때문입니다.

이 과정을 진행한뒤에 남아있는요소는 우리가 처음 만들었던 document 노드입니다. 따라서 배열의 마지막이자 첫번째 요소를 반환하면 DOM Tree가 완성됩니다.

```javascript
// treeBuilder.js
const treeBuilder = tokens => {
  const stack = []
  const singleTag = ["br", "img", "hr"]

  stack.push({
    type: "document",
    children: [],
  })

  for (let i = 0; i < tokens.length; i++) {
    const { type, tagName, content } = tokens[i]
    const attributes = Object.fromEntries(
      Object.entries(tokens[i]).filter(
        ([key]) => key !== "type" && key !== "tagName"
      )
    )
    if (type === START_TOKEN) {
      const node = {
        type: "element",
        tagName,
        attributes,
        children: [],
      }

      stack[stack.length - 1].children.push(node)

      if (!singleTag.includes(type)) {
        stack.push(node)
      }
    } else if (type === END_TOKEN) {
      while (stack[stack.length - 1].tagName !== tagName) {
        stack.pop()
      }
      stack.pop()
    } else {
      const node = {
        type: "text",
        content,
      }

      stack[stack.length - 1].children.push(node)
    }
  }

  while (stack.length > 1) {
    stack.pop()
  }
  return stack[0]
}
```

앞선 결과에 treeBuilder 함수를 적용시켜 dom 객체를 만들어 보겠습니다. node.js 콘솔에서 결과를 보려면 utils 모듈의 inspect 함수를 사용해야합니다.

```javascript
{
  type: 'document',
  children: [
    {
      type: 'element',
      tagName: 'html',
      attributes: {},
      children: [
        {
          type: 'element',
          tagName: 'head',
          attributes: {},
          children: []
        },
        {
          type: 'element',
          tagName: 'body',
          attributes: {},
          children: [
            {
              type: 'element',
              tagName: 'div',
              attributes: { id: 'root', class: 'rootClass' },
              children: [ { type: 'text', content: 'hello' } ]
            }
          ]
        }
      ]
    }
  ]
}
```

원하는 모양처럼 dom Tree가 형성되었습니다. 특히 주목할 부분은 div태그를 닫지 않았음에도 노드가 제대로 만들어진 것입니다.

## 마치며

간단한 코드를 이용해서 html을 파싱하는 코드를 구현해보았습니다. 사실 엄밀하게 따져가며 구현하려면 처리해야하는 예외상황도 많아 어렵지만 원리를 이해하는데는 충분하다고 생각합니다.

토큰을 만들어내는 과정에서는 크게 알고리즘이라고 부를 내용은 없는것 같고, TreeBuilder부분에서 스택을 이용하여 자식요소를 추가하는 과정에 약간의 아이디어가 필요합니다. 이런 생각을 해본적이 없었는데 구현하면서 좋은 방식을 배운것 같습니다.

완성된 코드는 <a class="link nodisplay" href="https://github.com/puki4416/htmlParser">저장소</a> 에서 확인할 수 있습니다.

## 참고자료

<a class="link" href="https://d2.naver.com/helloworld/59361">브라우저는 어떻게 동작하는가?</a>
<a class="link" href="https://medium.com/swlh/toy-browser-html-parsing-and-css-computing-87d4667cf009">[Toy Browser] HTML Parsing and CSS Computing
</a>
<a class="link" href="https://html.spec.whatwg.org/multipage/parsing.html">HTML Standard </a>
