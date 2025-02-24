# 安装

```shell
npm install document-pager
```

# 使用

```javascript
import DocumentPager from "document-pager";
const pager = new DocumentPager({
  contentMaxWidth: 570,
  contentMaxHeight: 884,
  nodeMeta: {
    h1: {
      numericStyle: {
        fontSize: 24,
        marginTop: 80,
        marginBottom: 30,
      },
      style: {
        lineHeight: 1.5,
        fontFamily: "SimHei",
        fontWeight: "bold",
        textAlign: "center",
      },
    },
    h2: {
      numericStyle: {
        fontSize: 18,
        marginTop: 20,
        marginBottom: 20,
      },
      style: {
        lineHeight: 1.5,
        fontWeight: "bold",
      },
    },
    h3: {
      numericStyle: {
        fontSize: 16,
        marginTop: 16,
        marginBottom: 16,
      },
      style: {
        lineHeight: 1.5,
        fontWeight: "bold",
      },
    },
    p: {
      numericStyle: {
        fontSize: 16,
      },
      style: {
        lineHeight: 1.8,
      },
    },
    text: {
      numericStyle: {
        fontSize: 16,
      },
      style: {
        lineHeight: 1.8,
      },
    },
    image: {
      numericStyle: {
        marginTop: 10,
        marginBottom: 10,
      },
    },
  },
});
// 使用结构化数据计算生成分页数据
const pages = await pager.calc([
  {
    type: "h1",
    text: "Hello World",
  },
  {
    type: "h2",
    text: "Hello Document Pager",
  },
  {
    type: "p",
    content: "这是一段测试文本",
    indent: false,
  },
  {
    type: "p",
    content:
      "对于超长文本，Document Pager 会根据 contentMaxWidth 以及 nodeMeta 配置自动进行换行处理。对于超长文本，Document Pager 会根据 contentMaxWidth 以及 nodeMeta 配置自动进行换行处理。对于超长文本，Document Pager 会根据 contentMaxWidth 以及 nodeMeta 配置自动进行换行处理。对于超长文本，Document Pager 会根据 contentMaxWidth 以及 nodeMeta 配置自动进行换行处理",
  },
  {
    type: "image",
    src: "/qrcode.jpg",
    align: "center",
    width: 200,
    height: 200,
    customNumericStyle: {
      marginTop: 20,
      marginBottom: 30,
    },
  },
]);
// 使用 pages 数据进行分页渲染，这是框架无关的，你完全可以用 vue 的 v-for 渲染，也可以用 react 的 map 遍历渲染节点...
// pages 是一个数组，其中每一个元素都是对象结构，对象中包含 items 数组，items 数组是行的信息
```
